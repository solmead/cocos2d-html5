import { ccClass } from "./platform/ccClass";
import { Size, size, Point, rect } from "./cocoa/index";
import { gameEvents, game } from "../../startup/CCGame";
import * as macro from "./platform/CCMacro";

/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

abstract class Director extends ccClass {
    //Variables
    protected _landscape:boolean = false;
    protected _nextDeltaTimeZero:boolean = false;
    protected _paused:boolean = false;
    protected _purgeDirectorInNextLoop:boolean = false;
    protected _sendCleanupToScene:boolean = false;
    protected _animationInterval:number = 0.0;
    protected _oldAnimationInterval: number = 0.0;
    protected _projection: PROJECTION = PROJECTION.PROJECTION_2D;
    protected _contentScaleFactor: number = 1.0;

    protected _deltaTime: number = 0.0;

    protected _winSizeInPoints:Size = null;

    protected _lastUpdate: number = null;
    protected _nextScene:Scene = null;
    protected _notificationNode = null;
    protected _openGLView = null;
    protected _scenesStack:List<Scene> = null;
    protected _projectionDelegate = null;
    protected _runningScene:Scene = null;

    protected _totalFrames: number = 0;
    protected _secondsPerFrame: number = 0;

    protected _dirtyRegion = null;

    protected _scheduler: Scheduler = null;
    protected _actionManager: ActionManager = null;
    protected _eventProjectionChanged: EventCustom = null;
    protected _eventAfterUpdate: EventCustom = null;
    protected _eventAfterVisit: EventCustom = null;
    protected _eventAfterDraw: EventCustom = null;



    constructor() {
        super();
        this._lastUpdate = Date.now();
        eventManager.addCustomListener(gameEvents.EVENT_SHOW,()=> {
            this._lastUpdate = Date.now();
        });

    }


    public init(): boolean {
        // scenes
        this._oldAnimationInterval = this._animationInterval = 1.0 / defaultFPS;
        this._scenesStack = [];
        // Set default projection (3D)
        this._projection = PROJECTION_DEFAULT;
        // projection delegate if "Custom" projection is used
        this._projectionDelegate = null;

        // FPS
        this._totalFrames = 0;
        this._lastUpdate = Date.now();

        //Paused?
        this._paused = false;

        //purge?
        this._purgeDirectorInNextLoop = false;

        this._winSizeInPoints = size(0, 0);

        this._openGLView = null;
        this._contentScaleFactor = 1.0;

        //scheduler
        this._scheduler = new Scheduler();
        //action manager
        if (ActionManager) {
            this._actionManager = new ActionManager();
            this._scheduler.scheduleUpdate(this._actionManager, Scheduler.PRIORITY_SYSTEM, false);
        } else {
            this._actionManager = null;
        }

        this._eventAfterUpdate = new EventCustom(directorEvents.EVENT_AFTER_UPDATE);
        this._eventAfterUpdate.setUserData(this);
        this._eventAfterVisit = new EventCustom(directorEvents.EVENT_AFTER_VISIT);
        this._eventAfterVisit.setUserData(this);
        this._eventAfterDraw = new EventCustom(directorEvents.EVENT_AFTER_DRAW);
        this._eventAfterDraw.setUserData(this);
        this._eventProjectionChanged = new EventCustom(directorEvents.EVENT_PROJECTION_CHANGED);
        this._eventProjectionChanged.setUserData(this);

        return true;
    }
    /**
     * calculates delta time since last time it was called
     */
    public calculateDeltaTime(): void {
        var now = Date.now();

        // new delta time.
        if (this._nextDeltaTimeZero) {
            this._deltaTime = 0;
            this._nextDeltaTimeZero = false;
        } else {
            this._deltaTime = (now - this._lastUpdate) / 1000;
        }

        if (game.config.debugMode && (this._deltaTime > 0.2))
            this._deltaTime = 1 / 60.0;

        this._lastUpdate = now;
    }
    /**
     * Converts a view coordinate to an WebGL coordinate<br/>
     * Useful to convert (multi) touches coordinates to the current layout (portrait or landscape)<br/>
     * Implementation can be found in CCDirectorWebGL
     * @function
     * @param {cc.Point} uiPoint
     * @return {cc.Point}
     */
    public convertToGL(uiPoint: Point): Point {
        var docElem = document.documentElement;
        var view = EGLView.getInstance();
        var bnd = docElem.getBoundingClientRect();
        var box = rect(bnd.left, bnd.top, bnd.width, bnd.height);
        box.x += window.pageXOffset - docElem.clientLeft;
        box.y += window.pageYOffset - docElem.clientTop;
        var x = view._devicePixelRatio * (uiPoint.x - box.x);
        var y = view._devicePixelRatio * (box.y + box.height - uiPoint.y);
        return view._isRotated ? { x: view._viewPortRect.width - y, y: x } : { x: x, y: y };
    }

    /**
     * Converts an WebGL coordinate to a view coordinate<br/>
     * Useful to convert node points to window points for calls such as glScissor<br/>
     * Implementation can be found in CCDirectorWebGL
     * @function
     * @param {cc.Point} glPoint
     * @return {cc.Point}
     */
    public convertToUI(glPoint: Point): Point {
        var docElem = document.documentElement;
        var view = EGLView.getInstance();
        var bnd = docElem.getBoundingClientRect();
        var box = rect(bnd.left, bnd.top, bnd.width, bnd.height);
        box.x += window.pageXOffset - docElem.clientLeft;
        box.y += window.pageYOffset - docElem.clientTop;
        var uiPoint = { x: 0, y: 0 };
        if (view._isRotated) {
            uiPoint.x = box.x + glPoint.y / view._devicePixelRatio;
            uiPoint.y = box.y + box.height - (view._viewPortRect.width - glPoint.x) / view._devicePixelRatio;
        }
        else {
            uiPoint.x = box.x + glPoint.x / view._devicePixelRatio;
            uiPoint.y = box.y + box.height - glPoint.y / view._devicePixelRatio;
        }
        return uiPoint;
    }


    /**
     *  Draw the scene. This method is called every frame. Don't call it manually.
     */
    public drawScene(): void {
        var renderer = cc.renderer;

        // calculate "global" dt
        this.calculateDeltaTime();

        //tick before glClear: issue #533
        if (!this._paused) {
            this._scheduler.update(this._deltaTime);
            eventManager.dispatchEvent(this._eventAfterUpdate);
        }

        /* to avoid flickr, nextScene MUST be here: after tick and before draw.
         XXX: Which bug is this one. It seems that it can't be reproduced with v0.9 */
        if (this._nextScene) {
            this.setNextScene();
        }

        // draw the scene
        if (this._runningScene) {
            if (renderer.childrenOrderDirty) {
                renderer.clearRenderCommands();
                renderer.assignedZ = 0;
                this._runningScene._renderCmd._curLevel = 0;                          //level start from 0;
                this._runningScene.visit();
                renderer.resetFlag();
            }
            else if (renderer.transformDirty()) {
                renderer.transform();
            }
        }

        renderer.clear();

        // draw the notifications node
        if (this._notificationNode)
            this._notificationNode.visit();

        eventManager.dispatchEvent(this._eventAfterVisit);
        macro.setGLDraws(0);

        renderer.rendering(cc._renderContext);
        this._totalFrames++;

        eventManager.dispatchEvent(this._eventAfterDraw);
        eventManager.frameUpdateListeners();

        this._calculateMPF();
    }






}


export var directorEvents = {
    /**
     * The event projection changed of cc.Director
     * @constant
     * @type {string}
     * @example
     *   cc.eventManager.addCustomListener(cc.Director.EVENT_PROJECTION_CHANGED, function(event) {
     *           cc.log("Projection changed.");
     *       });
     */
    EVENT_PROJECTION_CHANGED: "director_projection_changed",

    /**
     * The event after update of cc.Director
     * @constant
     * @type {string}
     * @example
     *   cc.eventManager.addCustomListener(cc.Director.EVENT_AFTER_UPDATE, function(event) {
     *           cc.log("after update event.");
     *       });
     */
    EVENT_AFTER_UPDATE: "director_after_update",

    /**
     * The event after visit of cc.Director
     * @constant
     * @type {string}
     * @example
     *   cc.eventManager.addCustomListener(cc.Director.EVENT_AFTER_VISIT, function(event) {
     *           cc.log("after visit event.");
     *       });
     */
    EVENT_AFTER_VISIT: "director_after_visit",

    /**
     * The event after draw of cc.Director
     * @constant
     * @type {string}
     * @example
     *   cc.eventManager.addCustomListener(cc.Director.EVENT_AFTER_DRAW, function(event) {
     *           cc.log("after draw event.");
     *       });
     */
    EVENT_AFTER_DRAW: "director_after_draw"
}

export class DisplayLinkDirector extends Director {
    invalid: boolean = false;

    constructor() {
        super();
    }
    /**
     * Starts Animation
     */
    public startAnimation(): void {
        this._nextDeltaTimeZero = true;
        this.invalid = false;
    }
    /**
     * Run main loop of director
     */
    public mainLoop(): void {
        if (this._purgeDirectorInNextLoop) {
            this._purgeDirectorInNextLoop = false;
            this.purgeDirector();
        }
        else if (!this.invalid) {
            this.drawScene();
        }
    }
    /**
     * Stops animation
     */
    public stopAnimation(): void {
        this.invalid = true;
    }


    /**
     * Sets animation interval
     * @param {Number} value the animation interval desired
     */
    public setAnimationInterval(value:number):void {
        this._animationInterval = value;
        if (!this.invalid) {
            this.stopAnimation();
            this.startAnimation();
        }
    }




}






var sharedDirector: Director = null;
var firstUseDirector:boolean = true;

export var director = new Director();

export function _getInstance(): Director {
    if (firstUseDirector) {
        firstUseDirector = false;
        sharedDirector = new DisplayLinkDirector();
        sharedDirector.init();
    }
    return sharedDirector;
}


/**
 * Default fps is 60
 * @type {Number}
 */
export var defaultFPS:number = 60;



export enum PROJECTION {
    //Possible OpenGL projections used by director
    /**
     * Constant for 2D projection (orthogonal projection)
     * @constant
     * @type {Number}
     */
    PROJECTION_2D = 0,

    /**
     * Constant for 3D projection with a fovy=60, znear=0.5f and zfar=1500.
     * @constant
     * @type {Number}
     */
    PROJECTION_3D = 1,

    /**
     * Constant for custom projection, if cc.Director's projection set to it, it calls "updateProjection" on the projection delegate.
     * @constant
     * @type {Number}
     */
    PROJECTION_CUSTOM = 3
}
/**
 * Constant for default projection of cc.Director, default projection is 2D projection
 * @constant
 * @type {Number}
 */
export var PROJECTION_DEFAULT: PROJECTION = PROJECTION.PROJECTION_3D;
