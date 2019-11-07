import { director } from "../cocos2d/core/CCDirector";
import { log, _initDebugSetting } from "./CCDebugger";
import { path } from "./CCPath";
import { _Dictionary } from "../cocos2d/core/platform/CCTypes";
import { ENGINE_VERSION } from "../cocos2d/core/platform/CCConfig";
import { CCDrawingPrimitive } from "../cocos2d/core/CCDrawingPrimitive";
import { isUndefined } from "./CCChecks";
import { loader } from "./CCLoader";

/****************************************************************************
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2015 Chukong Technologies Inc.

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
declare global {
    interface Window {
        requestAnimFrame: (callback: () => void) => number;
        gl: RenderingContext;
        ENABLE_IMAEG_POOL:boolean
    }
}

export function create3DContext(canvas:HTMLCanvasElement, opt_attribs:any):RenderingContext {
    var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    var context: RenderingContext = null;
    for (var ii = 0; ii < names.length; ++ii) {
        try {
            context = canvas.getContext(names[ii], opt_attribs);
        } catch (e) {
        }
        if (context) {
            break;
        }
    }
    return context;
};


export enum DEBUG_MODE {
    /**
     * Debug mode: No debugging. {@static}
     * @const {Number}
     * @static
     */
    NONE= 0,
    /**
     * Debug mode: Info, warning, error to console.
     * @const {Number}
     * @static
     */
    INFO= 1,
    /**
     * Debug mode: Warning, error to console.
     * @const {Number}
     * @static
     */
    WARN= 2,
    /**
     * Debug mode: Error to console.
     * @const {Number}
     * @static
     */
    ERROR = 3,
    /**
     * Debug mode: Info, warning, error to web page.
     * @const {Number}
     * @static
     */
    INFO_FOR_WEB_PAGE= 4,
    /**
     * Debug mode: Warning, error to web page.
     * @const {Number}
     * @static
     */
    WARN_FOR_WEB_PAGE= 5,
    /**
     * Debug mode: Error to web page.
     * @const {Number}
     * @static
     */
    ERROR_FOR_WEB_PAGE= 6
}

export var gameEvents = {
    /**
     * Event that is fired when the game is hidden.
     * @constant {String}
     */
    EVENT_HIDE: "game_on_hide",
    /**
     * Event that is fired when the game is shown.
     * @constant {String}
     */
    EVENT_SHOW: "game_on_show",
    /**
     * Event that is fired when the game is resized.
     * @constant {String}
     */
    EVENT_RESIZE: "game_on_resize",
    /**
     * Event that is fired when the renderer is done being initialized.
     * @constant {String}
     */
    EVENT_RENDERER_INITED: "renderer_inited",

};

export enum RENDER_TYPE {
    /** @constant {Number} */
    CANVAS= 0,
    /** @constant {Number} */
    WEBGL = 1,
    /** @constant {Number} */
    OPENGL = 2
}

export enum RENDERMETHOD {
    auto = 0,
    canvas = 1,
    opengl = 2
}

export interface configSettings {
    width: number;
    height: number;
    engineDir: string;
    modules: Array<string>;
    debugMode: DEBUG_MODE;
    exposeClassName: boolean;
    showFPS: boolean;
    frameRate: number;
    id: string;
    renderMode: RENDERMETHOD;
    jsList: Array<string>;
    registerSystemEvent: boolean;
    noCache: boolean;

}

export var glExt = {
    instanced_arrays: <any>null,
    element_uint: <any>null
};




var _jsAddedCache = new _Dictionary<string, boolean>();
var _engineInitCalled:boolean = false;
var _engineLoadedCallback:(()=>void) = null;

export function _determineRenderType(config: configSettings) {
    var userRenderMode = config.renderMode;

    // Adjust RenderType
    if (isNaN(userRenderMode) || userRenderMode > 2 || userRenderMode < 0)
        config.renderMode = RENDERMETHOD.auto;

    // Determine RenderType
    game._renderType = RENDER_TYPE.CANVAS;
    game._supportRender = false;

    if (userRenderMode === RENDERMETHOD.auto) {
        if (cc.sys.capabilities["opengl"]) {
            game._renderType = RENDER_TYPE.WEBGL;
            game._supportRender = true;
        }
        else if (cc.sys.capabilities["canvas"]) {
            game._renderType = RENDER_TYPE.CANVAS;
            game._supportRender = true;
        }
    }
    else if (userRenderMode === RENDERMETHOD.canvas && cc.sys.capabilities["canvas"]) {
        game._renderType = RENDER_TYPE.CANVAS;
        game._supportRender = true;
    }
    else if (userRenderMode === RENDERMETHOD.opengl && cc.sys.capabilities["opengl"]) {
        game._renderType = RENDER_TYPE.WEBGL;
        game._supportRender = true;
    }
}
export function _getJsListOfModule(moduleMap: _Dictionary<string, Array<string>>, moduleName:string, dir:string = null):Array<string> {
    if (_jsAddedCache.valueForKey(moduleName)) return null;
    dir = dir || "";
    var jsList = new Array<string>();
    var tempList = moduleMap.valueForKey(moduleName);
    if (!tempList) throw new Error("can not find module [" + moduleName + "]");
    var ccPath = path;
    for (var i = 0, li = tempList.length; i < li; i++) {
        var item = tempList[i];
        if (_jsAddedCache.valueForKey(item)) continue;
        var extname = ccPath.extname(item);
        if (!extname) {
            var arr = _getJsListOfModule(moduleMap, item, dir);
            if (arr) jsList = jsList.concat(arr);
        } else if (extname.toLowerCase() === ".js") jsList.push(ccPath.join(dir, item));
        _jsAddedCache.setObject(true, item);
    }
    return jsList;
}


function _afterEngineLoaded(config:configSettings):void {
    if (_initDebugSetting)
        _initDebugSetting(config.debugMode);
    game._engineLoaded = true;
    console.log(ENGINE_VERSION);
    if (_engineLoadedCallback) _engineLoadedCallback();
}

function _load(config: configSettings):void {
    var engineDir = config.engineDir;
    _afterEngineLoaded(config);
}
function _windowLoaded() {
    this.removeEventListener('load', _windowLoaded, false);
    _load(game.config);
}


export function initEngine(config: configSettings, cb:()=>void):void {
    if (_engineInitCalled) {
        var previousCallback = _engineLoadedCallback;
        _engineLoadedCallback = function () {
            previousCallback && previousCallback();
            cb && cb();
        }
        return;
    }

    _engineLoadedCallback = cb;

    // Config uninitialized and given, initialize with it
    if (!game.config && config) {
        game.config = config;
    }
    // No config given and no config set before, load it
    else if (!game.config) {
        game._loadConfig();
    }
    config = game.config;

    _determineRenderType(config);

    document.body ? _load(config) : _addEventListener(window, 'load', _windowLoaded, false);
    _engineInitCalled = true;
};



class Game {

    constructor() {
    }

    private _eventHide: EventCustom = null;
    private _eventShow: EventCustom = null;

    // states
    _paused: boolean = true;//whether the game is paused
    _configLoaded: boolean = false;//whether config loaded
    _prepareCalled: boolean = false;//whether the prepare function has been called
    _prepared: boolean = false;//whether the engine has prepared
    _rendererInitialized: boolean = false;

    _renderContext: RenderingContext = null;
    _renderer = null;
    _renderType: RENDER_TYPE = RENDER_TYPE.CANVAS;
    _supportRender: boolean = false;
    _engineLoaded: boolean = false;

    _intervalId:number = null;//interval target of main

    _lastTime:number = null;
    _frameTime: number = null;

    /**
     * The outer frame of the game canvas, parent of cc.container
     * @type {Object}
     */
    frame:HTMLElement = null;
    /**
     * The container of game canvas, equals to cc.container
     * @type {Object}
     */
    container: HTMLDivElement = null;
    _gameDiv: HTMLDivElement = null;
    /**
     * The canvas of the game, equals to cc._canvas
     * @type {Object}
     */
    canvas: HTMLCanvasElement = null;

    /**
     * Config of game
     * @type {Object}
     */
    config: configSettings = null;


    /**
     * drawing primitive of game engine
     * @type {cc.DrawingPrimitive}
     */
    _drawingUtil: CCDrawingPrimitive = null;

    /**
     * Callback when the scripts of engine have been load.
     * @type {Function|null}
     */
    onStart: (() => void) = null;

    /**
     * Callback when game exits.
     * @type {Function|null}
     */
    onStop: (() => void) = null;



    //@Public Methods

    //  @Game play control
    /**
     * Set frameRate of game.
     * @param frameRate
     */
    public setFrameRate(frameRate: number): void {
        var config = this.config
        config.frameRate = frameRate;
        if (this._intervalId)
            window.cancelAnimationFrame(this._intervalId);
        this._intervalId = 0;
        this._paused = true;
        this._setAnimFrame();
        this._runMainLoop();
    }

    /**
     * Run the game frame by frame.
     */
    public step(): void {
        director.mainLoop();
    }
    /**
     * Pause the game.
     */
    public pause():void {
        if (this._paused) return;
        this._paused = true;
        // Pause audio engine
        if (audioEngine) {
            audioEngine._pausePlaying();
        }
        // Pause main loop
        if (this._intervalId)
            window.cancelAnimationFrame(this._intervalId);
        this._intervalId = 0;
    }

    /**
     * Resume the game from pause.
     */
    public resume(): void {
        if (!this._paused) return;
        this._paused = false;
        // Resume audio engine
        if (audioEngine) {
            audioEngine._resumePlaying();
        }
        // Resume main loop
        this._runMainLoop();
    }
    /**
     * Check whether the game is paused.
     */
    public isPaused(): boolean {
        return this._paused;
    }
    /**
     * Restart game.
     */
    public restart(): void {
        director.popToSceneStackLevel(0);
        // Clean up audio
        audioEngine && audioEngine.end();

        this.onStart();
    }
    /**
     * End game, it will close the game window
     */
    public end(): void {
        close();
    }


    //  @Game loading
    /**
     * Prepare game.
     * @param cb
     */
    public prepare(cb: (() => void) = null): void {

        // Config loaded
        if (!this._configLoaded) {
            this._loadConfig(() => {
                this.prepare(cb);
            });
            return;
        }

        // Already prepared
        if (this._prepared) {
            if (cb) cb();
            return;
        }
        // Prepare called, but not done yet
        if (this._prepareCalled) {
            return;
        }
        // Prepare never called and engine ready
        if (this._engineLoaded) {
            this._prepareCalled = true;

            this._initRenderer(this.config.width, this.config.height);

            /**
             * cc.view is the shared view object.
             * @type {cc.EGLView}
             * @name cc.view
             * @memberof cc
             */
            //view = EGLView._getInstance();

            /**
             * @type {cc.Director}
             * @name cc.director
             * @memberof cc
             */
            //cc.director = cc.Director._getInstance();
            if (director.setOpenGLView)
                director.setOpenGLView(EGLView._getInstance());
            /**
             * cc.winSize is the alias object for the size of the current game window.
             * @type {cc.Size}
             * @name cc.winSize
             * @memberof cc
             */
            //cc.winSize = cc.director.getWinSize();

            this._initEvents();

            this._setAnimFrame();
            this._runMainLoop();

            // Load game scripts
            var jsList = this.config.jsList;
            if (jsList) {
                loader.loadJsWithImg(jsList, (err:string)=> {
                    if (err) throw new Error(err);
                    this._prepared = true;
                    if (cb) cb();
                });
            }
            else {
                if (cb) cb();
            }

            return;
        }

        // Engine not loaded yet
        initEngine(this.config, ()=> {
            this.prepare(cb);
        });
    }

    /**
     * Run game with configuration object and onStart function.
     * @param {Object|Function} [config] Pass configuration object or onStart function
     * @param {onStart} [onStart] onStart function to be executed after game initialized
     */
    public run(config: string | configSettings | (() => void), onStart: (() => void)):void {
        if (typeof config === 'function') {
            this.onStart = config;
        }
        else {
            if (config) {
                if (typeof config === 'string') {
                    if (!this.config) this._loadConfig();
                    this.config.id = config;
                } else {
                    this.config = config;
                }
            }
            if (typeof onStart === 'function') {
                this.onStart = onStart;
            }
        }

        this.prepare(this.onStart);
    }


    //@Private Methods

    //  @Time ticker section
    private _setAnimFrame():void {
        this._lastTime = (new Date()).getTime();
        var frameRate = this.config.frameRate;
        this._frameTime = 1000 / frameRate;
        var win = <any>window;
        if (frameRate !== 60 && frameRate !== 30) {
            win.requestAnimFrame = this._stTime;
            win.cancelAnimationFrame = this._ctTime;
        }
        else {
            window.requestAnimFrame = win.requestAnimationFrame ||
                win.webkitRequestAnimationFrame ||
                win.mozRequestAnimationFrame ||
                win.oRequestAnimationFrame ||
                win.msRequestAnimationFrame ||
                this._stTime;
            window.cancelAnimationFrame = win.cancelAnimationFrame ||
                win.cancelRequestAnimationFrame ||
                win.msCancelRequestAnimationFrame ||
                win.mozCancelRequestAnimationFrame ||
                win.oCancelRequestAnimationFrame ||
                win.webkitCancelRequestAnimationFrame ||
                win.msCancelAnimationFrame ||
                win.mozCancelAnimationFrame ||
                win.webkitCancelAnimationFrame ||
                win.oCancelAnimationFrame ||
                this._ctTime;
        }
    }

    private _stTime(callback:()=>void):number {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, this._frameTime - (currTime - this._lastTime));
        var id = window.setTimeout(function () { callback(); },
            timeToCall);
        this._lastTime = currTime + timeToCall;
        return id;
    }

    private _ctTime(id:number):void {
        window.clearTimeout(id);
    }
    //Run game.
    private _runMainLoop() {
        var skip = true
        var config = this.config;
        var frameRate = config.frameRate;

        director.setDisplayStats(config.showFPS);

        var callback = ()=> {
            if (!this._paused) {
                if (frameRate === 30) {
                    if (skip = !skip) {
                        this._intervalId = window.requestAnimFrame(callback);
                        return;
                    }
                }

                director.mainLoop();
                this._intervalId = window.requestAnimFrame(callback);
            }
        };

        this._intervalId = window.requestAnimFrame(callback);
        this._paused = false;
    }

//  @Game loading section
    public _loadConfig(cb:()=>void = null) {
        // Load config
        var config = this.config || <configSettings>document["ccConfig"];
        // Already loaded or Load from document.ccConfig
        if (config) {
            this._initConfig(config);
            cb && cb();
        }
        // Load from project.json
        else {
            var cocos_script = document.getElementsByTagName('script');
            for (var i = 0; i < cocos_script.length; i++) {
                var _t = cocos_script[i].getAttribute('cocos');
                if (_t === '' || _t) {
                    break;
                }
            }
            var self = this;
            var loaded = (err:string, txt:string):void=> {
                var data = JSON.parse(txt);
                self._initConfig(data);
                cb && cb();
            };
            var _src: string;
            var txt: string;
            var _resPath: string;

            if (i < cocos_script.length) {
                _src = cocos_script[i].src;
                if (_src) {
                    _resPath = /(.*)\//.exec(_src)[0];
                    loader.resPath = _resPath;
                    _src = path.join(_resPath, 'project.json');
                }
                loader.loadTxt(_src, loaded);
            }
            if (!txt) {
                loader.loadTxt("project.json", loaded);
            }
        }
    }
    private _initConfig(config: configSettings):void {
        var modules = config.modules;

        // Configs adjustment
        if (!config.showFPS) {
            config.showFPS =  true;
        }
        if (!config.engineDir) {
            config.engineDir = "frameworks/cocos2d-html5";
        }
        if (!config.debugMode) {
            config.debugMode = 0;
        }
        config.exposeClassName = !!config.exposeClassName;
        if (!config.frameRate) {
            config.frameRate = 60;
        }
        if (!config.renderMode) {
            config.renderMode = 0;
        }
        if (config.registerSystemEvent == null) {
            config.registerSystemEvent = true;
        }
        

        // Modules adjustment
        if (modules && modules.indexOf("core") < 0) {
            modules.splice(0, 0, "core");
        }
        modules && (config.modules = modules);
        this.config = config;
        this._configLoaded = true;
    }
    private _initRenderer(width:number, height:number):void {
        // Avoid setup to be called twice.
        if (this._rendererInitialized) return;

        if (!this._supportRender) {
            throw new Error("The renderer doesn't support the renderMode " + this.config.renderMode);
        }

        var el = this.config.id;
        var win = window;
        var element:HTMLElement = cc.$(el) || cc.$('#' + el);
        var localCanvas:HTMLCanvasElement;
        var localContainer: HTMLDivElement;
        var localConStyle;

        if (element.tagName === "CANVAS") {
            //it is already a canvas, we wrap it around with a div
            this.canvas = localCanvas = <HTMLCanvasElement>element;
            width = width || localCanvas.width;
            height = height || localCanvas.height;

            this.container = localContainer = <HTMLDivElement>document.createElement("DIV");
            if (localCanvas.parentNode)
                localCanvas.parentNode.insertBefore(localContainer, localCanvas);
        } else {
            //we must make a new canvas and place into this element
            if (element.tagName !== "DIV") {
                log("Warning: target element is not a DIV or CANVAS");
            }
            width = width || element.clientWidth;
            height = height || element.clientHeight;
            this.canvas = localCanvas = <HTMLCanvasElement>cc.$(document.createElement("CANVAS"));
            this.container = localContainer = <HTMLDivElement> document.createElement("DIV");
            element.appendChild(localContainer);
        }
        localContainer.setAttribute('id', 'Cocos2dGameContainer');
        localContainer.appendChild(localCanvas);
        this.frame = <HTMLElement>((localContainer.parentNode === document.body) ? document.documentElement : localContainer.parentNode);

        localCanvas.addClass("gameCanvas");
        localCanvas.setAttribute("width", <any>(width || 480));
        localCanvas.setAttribute("height", <any>(height || 320));
        localCanvas.setAttribute("tabindex", <any>(99));

        if (this._renderType === RENDER_TYPE.WEBGL) {
            this._renderContext = create3DContext(localCanvas, {
                    'stencil': true,
                    'alpha': false
                });
        }
        // WebGL context created successfully
        if (this._renderContext) {
            this._renderer = rendererWebGL;
            win.gl = this._renderContext; // global variable declared in CCMacro.js
            this._renderer.init();
            this._drawingUtil = new DrawingPrimitiveWebGL(this._renderContext);
            textureCache._initializingRenderer();
            glExt.instanced_arrays = (<any>win.gl).getExtension("ANGLE_instanced_arrays");
            glExt.element_uint = (<any>win.gl).getExtension("OES_element_index_uint");
        } else {
            this._renderType = RENDER_TYPE.CANVAS;
            this._renderer = rendererCanvas;
            this._renderContext = new CanvasContextWrapper(localCanvas.getContext("2d"));
            this._drawingUtil = new DrawingPrimitiveCanvas(this._renderContext);
        }

        this._gameDiv = localContainer;
        this.canvas.oncontextmenu = function () {
            if (!cc._isContextMenuEnable) return false;
        };

        this.dispatchEvent(gameEvents.EVENT_RENDERER_INITED, true);

        this._rendererInitialized = true;
    }
    private _initEvents() {
        var win = window;
        var hidden: string;

        this._eventHide = this._eventHide || new EventCustom(gameEvents.EVENT_HIDE);
        this._eventHide.setUserData(this);
        this._eventShow = this._eventShow || new EventCustom(gameEvents.EVENT_SHOW);
        this._eventShow.setUserData(this);

        // register system events
        if (this.config.registerSystemEvent)
            inputManager.registerSystemEvent(this.canvas);

        if (!isUndefined(document.hidden)) {
            hidden = "hidden";
        } else if (!isUndefined((<any>document).mozHidden)) {
            hidden = "mozHidden";
        } else if (!isUndefined((<any>document).msHidden)) {
            hidden = "msHidden";
        } else if (!isUndefined((<any>document).webkitHidden)) {
            hidden = "webkitHidden";
        }

        var changeList = [
            "visibilitychange",
            "mozvisibilitychange",
            "msvisibilitychange",
            "webkitvisibilitychange",
            "qbrowserVisibilityChange"
        ];
        var onHidden = function () {
            if (eventManager && game._eventHide)
                eventManager.dispatchEvent(game._eventHide);
        };
        var onShow = function () {
            if (eventManager && game._eventShow)
                eventManager.dispatchEvent(game._eventShow);
        };

        if (hidden) {
            for (var i = 0; i < changeList.length; i++) {

                document.addEventListener(changeList[i], (event:any)=> {
                    var visible = (<any>document)[hidden];
                    // QQ App
                    visible = visible || event["hidden"];
                    if (visible) onHidden();
                    else onShow();
                }, false);
            }
        } else {
            win.addEventListener("blur", onHidden, false);
            win.addEventListener("focus", onShow, false);
        }

        if (navigator.userAgent.indexOf("MicroMessenger") > -1) {
            win.onfocus = function () { onShow() };
        }

        if ("onpageshow" in window && "onpagehide" in window) {
            win.addEventListener("pagehide", onHidden, false);
            win.addEventListener("pageshow", onShow, false);
        }

        eventManager.addCustomListener(gameEvents.EVENT_HIDE, function () {
            game.pause();
        });
        eventManager.addCustomListener(gameEvents.EVENT_SHOW, function () {
            game.resume();
        });
    }










}

export var game = new Game();