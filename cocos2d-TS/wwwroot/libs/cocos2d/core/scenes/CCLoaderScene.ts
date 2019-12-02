import { Scene } from "./CCScene";
import { color, visibleRect, contentScaleFactor } from "../platform/index";
import { _loaderImage } from "../../../Base64Images";
import { loader } from "../../../startup/CCLoader";
import { pAdd } from "../support/index";
import { p, Point } from "../cocoa/index";
import { Texture2D, UIImage } from "../textures/index";
import { isString } from "../../../startup/CCChecks";
import { _dirtyFlags } from "../base-nodes/CCRenderCmd";
import { eventManager } from "../event-manager/index";
import { directorEvents, director } from "../CCDirector";
import { Layer, LayerColor } from "../layers/CCLayer";

/****************************************************************************
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
/**
 * <p>cc.LoaderScene is a scene that you can load it when you loading files</p>
 * <p>cc.LoaderScene can present thedownload progress </p>
 * @class
 * @extends cc.Scene
 * @example
 * var lc = new cc.LoaderScene();
 */

export class LoaderScene extends Scene {
    //_interval = null;
    _label:Label = null;
    _logo: Sprite = null;
    _className = "LoaderScene";
    cb:(()=>void) = null;
    _bgLayer: Layer = null;
    _texture2d: Texture2D;
    resources: Array<string>;

    constructor() {
        super();

    }


    /**
     * Contructor of cc.LoaderScene
     * @returns {boolean}
     */
    async initAsync(): Promise<boolean> {
        var success = await super.initAsync();

        var self = this;

        //logo
        var logoWidth = 160;
        var logoHeight = 200;

        // bg
        var bgLayer = self._bgLayer = new LayerColor(color(32, 32, 32, 255));
        self.addChild(bgLayer, 0);

        //image move to CCSceneFile.js
        var fontSize = 24, lblHeight = -logoHeight / 2 + 100;
        if (_loaderImage) {
            //loading logo
            var img = await loader.loadImgAsync(_loaderImage, false);

            logoWidth = img.width;
            logoHeight = img.height;
            self._initStage(img, visibleRect.center);

            fontSize = 14;
            lblHeight = -logoHeight / 2 - 10;
        }
        //loading percent
        var label = self._label = new LabelTTF("Loading... 0%", "Arial", fontSize);
        label.setPosition(pAdd(visibleRect.center, p(0, lblHeight)));
        label.setColor(color(180, 180, 180));
        bgLayer.addChild(this._label, 10);
        return true;
    }


    _initStage(img:UIImage, centerPos:Point): void {
        var self = this;
        var texture2d = self._texture2d = Texture2D.create();
        texture2d.initWithElement(img);
        texture2d.handleLoadedTexture();
        var logo = self._logo = new Sprite(texture2d);
        logo.setScale(contentScaleFactor());
        logo.x = centerPos.x;
        logo.y = centerPos.y;
        self._bgLayer.addChild(logo, 10);
    }
/**
 * custom onEnter
 */
    onEnter(): void {
        super.onEnter();
        this.schedule(this._startLoadingAsync, 0.3);
    }
/**
 * custom onExit
 */
    onExit() {
        super.onExit();
        var tmpStr = "Loading... 0%";
        this._label.setString(tmpStr);
    }

/**
 * init with resources
 * @param {Array} resources
 * @param {Function|String} cb
 * @param {Object} target
 */
    initWithResources(resources: string | Array<string>, cb:(()=>void)):void {
        if (isString(resources))
            resources = [<string>resources];

        resources = <Array<string>>resources;
        this.resources = resources || [];
        this.cb = cb;
        //this.target = target;
    }

    async _startLoadingAsync(): Promise<void> {
        var self = this;
        self.unschedule(self._startLoadingAsync);
        var res = self.resources;
        var s = await loader.loadAsync(res, (loadedCount: number, count: number) => {
            var percent = (loadedCount / count * 100) | 0;
            percent = Math.min(percent, 100);
            self._label.setString("Loading... " + percent + "%");
        });
        if (self.cb)
                self.cb();

    }

    _updateTransform() {
        this._renderCmd.setDirtyFlag(_dirtyFlags.transformDirty);
        this._bgLayer._renderCmd.setDirtyFlag(_dirtyFlags.transformDirty);
        this._label._renderCmd.setDirtyFlag(_dirtyFlags.transformDirty);
        this._logo && this._logo._renderCmd.setDirtyFlag(_dirtyFlags.transformDirty);
    }




    /**
 * <p>cc.LoaderScene.preload can present a loaderScene with download progress.< /p>
    * <p>when all the resource are downloaded it will invoke call function</p>
        * @param resources
            * @param cb
                * @param target
                    * @returns { cc.LoaderScene |*}
 * @example
 * //Example
 * cc.LoaderScene.preload(g_resources, function () {
                        cc.director.runScene(new HelloWorldScene());
                    }, this);
 */
    static preload(resources: string | Array<string>, cb:(() => void)) {
        if (!loaderScene) {
            loaderScene = new LoaderScene();
            loaderScene.initAsync();
            eventManager.addCustomListener(directorEvents.EVENT_PROJECTION_CHANGED, ()=> {
                loaderScene._updateTransform();
            });
        }
        loaderScene.initWithResources(resources, cb);

        director.runScene(loaderScene);
        return loaderScene;
    }

}


export var loaderScene: LoaderScene;