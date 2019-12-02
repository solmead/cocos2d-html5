import { log, _initDebugSetting } from "./CCDebugger";
import { path } from "./CCPath";
import { ENGINE_VERSION } from "../cocos2d/core/platform/CCConfig";
import { CCDrawingPrimitive } from "../cocos2d/core/CCDrawingPrimitive";
import { isUndefined } from "./CCChecks";
import { loader } from "./CCLoader";
import { sys } from "./CCSys";
import * as Tasks from "../extensions/syslibs/Tasks"
import { director } from "../cocos2d/core/CCDirector";
import { iEventHandler, EventHelper } from "../cocos2d/core/event-manager/CCEventHelper";
import { EventCustom } from "../cocos2d/core/event-manager/CCEvent";
import { eventManager } from "../cocos2d/core/event-manager/CCEventManager";
import { Dictionary } from "../extensions/syslibs/LinqToJs";
import { EGLView } from "../cocos2d/core/platform/CCEGLView";
import { inputManager } from "../cocos2d/core/platform/CCInputManager";
import { Renderer, WebGlContext, CanvasContext } from "../cocos2d/core/renderer/Renderer";
import { CanvasContextWrapper, rendererCanvas, RendererCanvas } from "../cocos2d/core/renderer/RendererCanvas";
import { rendererWebGL, RendererWebGL } from "../cocos2d/core/renderer/RendererWebGL";
import { textureCache } from "../cocos2d/core/textures/index";

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

export function create3DContext(canvas:HTMLCanvasElement, opt_attribs:any = null):RenderingContext {
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




var _jsAddedCache = new Dictionary<string, boolean>();
var _engineInitCalled:boolean = false;
//var _engineLoadedCallback:(()=>void) = null;

export function _getJsListOfModule(moduleMap: Dictionary<string, Array<string>>, moduleName:string, dir:string = null):Array<string> {
    if (_jsAddedCache.get(moduleName)) return null;
    dir = dir || "";
    var jsList = new Array<string>();
    var tempList = moduleMap.get(moduleName);
    if (!tempList) throw new Error("can not find module [" + moduleName + "]");
    var ccPath = path;
    for (var i = 0, li = tempList.length; i < li; i++) {
        var item = tempList[i];
        if (_jsAddedCache.get(item)) continue;
        var extname = ccPath.extname(item);
        if (!extname) {
            var arr = _getJsListOfModule(moduleMap, item, dir);
            if (arr) jsList = jsList.concat(arr);
        } else if (extname.toLowerCase() === ".js") jsList.push(ccPath.join(dir, item));
        _jsAddedCache.add(item, true);
    }
    return jsList;
}






class Game implements iEventHandler {
    private eventHandler = new EventHelper(this);

    addEventListener(type: string, listener: () => void, target?: any): void {
        this.eventHandler.addEventListener(type, listener, target);
    }
    hasEventListener(type: string, listener: () => void, target?: any): boolean {
        return this.eventHandler.hasEventListener(type, listener, target);
    }
    removeEventListener(type: string, listener: () => void, target?: any): void {
        this.eventHandler.removeEventListener(type, listener, target);
    }
    removeEventTarget(type: string, listener: () => void, target?: any): void {
        this.eventHandler.removeEventTarget(type, listener, target);
    }
    dispatchEvent(event: string, clearAfterDispatch: boolean): void {
        this.eventHandler.dispatchEvent(event, clearAfterDispatch);
    }

    constructor() {
    }

    private _eventHide: EventCustom = null;
    private _eventShow: EventCustom = null;

    // states
    private _paused: boolean = true;//whether the game is paused
    private _configLoaded: boolean = false;//whether config loaded
    private _prepareCalled: boolean = false;//whether the prepare function has been called
    private _prepared: boolean = false;//whether the engine has prepared
    private _rendererInitialized: boolean = false;

    private _renderContext: RenderingContext | CanvasContextWrapper = null;

    private _renderer: Renderer = null;
    private _renderType: RENDER_TYPE = RENDER_TYPE.CANVAS;
    private _view: EGLView = null;

    private _supportRender: boolean = false;
    private _engineLoaded: boolean = false;

    _intervalId:number = null;//interval target of main

    private _lastTime:number = null;
    private _frameTime: number = null;

    private _isContextMenuEnable: boolean = false;

    /**
     * The outer frame of the game canvas, parent of cc.container
     * @type {Object}
     */
    private  _frame:HTMLElement = null;
    /**
     * The container of game canvas, equals to cc.container
     * @type {Object}
     */
    private _container: HTMLDivElement = null;
    private _gameDiv: HTMLDivElement = null;
    /**
     * The canvas of the game, equals to cc._canvas
     * @type {Object}
     */
    private  _canvas: HTMLCanvasElement = null;

    /**
     * Config of game
     * @type {Object}
     */
    private  _config: configSettings = null;


    /**
     * drawing primitive of game engine
     * @type {cc.DrawingPrimitive}
     */
    private _drawingUtil: CCDrawingPrimitive = null;

    /**
     * Callback when the scripts of engine have been load.
     * @type {Function|null}
     */
    onStartAsync: (() => Promise<void>) = null;

    /**
     * Callback when game exits.
     * @type {Function|null}
     */
    onStopAsync: (() => Promise<void>) = null;

    get config(): configSettings {
        return this._config;
    }
    get engineLoaded(): boolean {
        return this._engineLoaded;
    }
    get renderType(): RENDER_TYPE {
        return this._renderType;
    }
    //set renderType(value: RENDER_TYPE) {
    //    this._renderType = value;
    //}
    get supportRender(): boolean {
        return this._supportRender;
    }
    //set supportRender(value: boolean) {
    //    this._supportRender = value;
    //}
    //private _renderContext: RenderingContext | CanvasContextWrapper = null;
    //CanvasContext

    get renderContextCanvas(): CanvasContextWrapper {
        return <CanvasContextWrapper>this._renderContext;
    }
    get renderContextWebGl(): WebGlContext {
        return <WebGlContext>this._renderContext;
    }
    get renderContextGeneric(): RenderingContext | CanvasContextWrapper {
        return this._renderContext;
    }
    get canvas(): HTMLCanvasElement {
        return this._canvas
    }
    get renderer(): Renderer {
        return this._renderer;
    }
    get rendererWebGl(): RendererWebGL {
        return <RendererWebGL>this._renderer;
    }
    get rendererCanvas(): RendererCanvas {
        return <RendererCanvas>this._renderer;
    }
    get container(): HTMLDivElement {
        return this._container;
    }
    get view(): EGLView {
        return this._view;
    }
    get rendererInitialized(): boolean {
        return this._rendererInitialized;
    }


    private _determineRenderType() {
        var userRenderMode = this.config.renderMode;

        // Adjust RenderType
        if (isNaN(userRenderMode) || userRenderMode > 2 || userRenderMode < 0)
            this.config.renderMode = RENDERMETHOD.auto;

        // Determine RenderType
        this._renderType = RENDER_TYPE.CANVAS;
        this._supportRender = false;

        if (userRenderMode === RENDERMETHOD.auto) {
            if (sys.capabilities.opengl) {
                this._renderType = RENDER_TYPE.WEBGL;
                this._supportRender = true;
            }
            else if (sys.capabilities.canvas) {
                this._renderType = RENDER_TYPE.CANVAS;
                this._supportRender = true;
            }
        }
        else if (userRenderMode === RENDERMETHOD.canvas && sys.capabilities.canvas) {
            this._renderType = RENDER_TYPE.CANVAS;
            this._supportRender = true;
        }
        else if (userRenderMode === RENDERMETHOD.opengl && sys.capabilities.opengl) {
            this._renderType = RENDER_TYPE.WEBGL;
            this._supportRender = true;
        }
    }

    //@Public Methods

    //  @Game play control
    /**
     * Set frameRate of game.
     * @param frameRate
     */
    public setFrameRate(frameRate: number): void {
        var config = this._config
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
    public async restartAsync(): Promise<void> {
        director.popToSceneStackLevel(0);
        // Clean up audio
        audioEngine && audioEngine.end();

        await this.onStartAsync();
    }
    /**
     * End game, it will close the game window
     */
    public end(): void {
        close();
    }

    async initEngineAsync(): Promise<void> {

        if (_engineInitCalled) {
            //var previousCallback = _engineLoadedCallback;
            //_engineLoadedCallback = function () {
            //    previousCallback && previousCallback();
            //    cb && cb();
            //}
            return;
        }

        //_engineLoadedCallback = cb;

        // No config given and no config set before, load it
        else if (!this.config) {
            await this._loadConfigAsync();
        }

        this._determineRenderType();

        var p = new Promise<void>((resolve, reject) => {
            if (document.body) {
                resolve();
            } else {
                window.addEventListener('load', () => {
                    resolve();
                }, false);
            }
        });
        await p;

        var engineDir = this.config.engineDir;
        if (_initDebugSetting)
            _initDebugSetting(this.config.debugMode);
        this._engineLoaded = true;
        console.log(ENGINE_VERSION);


        _engineInitCalled = true;

        await Tasks.whenTrue(() => game.engineLoaded);
    }



    //  @Game loading
    /**
     * Prepare game.
     * @param cb
     */
    public async prepareAsync(): Promise<void> {

        // Config loaded
        if (!this._configLoaded) {
            await this._loadConfigAsync();
            await this.prepareAsync();
            return;
        }

        // Already prepared
        if (this._prepared) {
            //if (cb) cb();
            return;
        }
        // Prepare called, but not done yet
        if (this._prepareCalled) {
            return;
        }
        // Prepare never called and engine ready
        if (this._engineLoaded) {
            this._prepareCalled = true;

            this._initRenderer(this._config.width, this._config.height);

            /**
             * cc.view is the shared view object.
             * @type {cc.EGLView}
             * @name cc.view
             * @memberof cc
             */
            this._view = EGLView._getInstance();

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
            var jsList = this._config.jsList;
            if (jsList) {
                await loader.loadJsWithImgAsync(null, jsList);
                this._prepared = true;

                //, (err: string) => {
                //    if (err) throw new Error(err);
                //    this._prepared = true;
                //    if (cb) cb();
                //});
            }
            else {
                //if (cb) cb();
            }

            return;
        }

        // Engine not loaded yet
        await this.initEngineAsync();
        await this.prepareAsync();
    }

    /**
     * Run game with configuration object and onStart function.
     * @param {Object|Function} [config] Pass configuration object or onStart function
     * @param {onStart} [onStart] onStart function to be executed after game initialized
     */
    public async runAsync(onStart: (() => Promise<void>)): Promise<void>;
    public async runAsync(config: string, onStart: (() => Promise<void>)): Promise<void>;
    public async runAsync(config: configSettings, onStart: (() => Promise<void>)): Promise<void>;
    public async runAsync(config: string | configSettings | (() => Promise<void>), onStart: (() => Promise<void>) = null):Promise<void> {
        if (typeof config === 'function') {
            this.onStartAsync = config;
        }
        else {
            if (config) {
                if (typeof config === 'string') {
                    if (!this._config) {
                        await this._loadConfigAsync();
                    }
                    this._config.id = config;
                } else {
                    this._config = config;
                }
            }
            if (typeof onStart === 'function') {
                this.onStartAsync = onStart;
            }
        }

        await this.prepareAsync();
        if (this.onStartAsync) {
            await this.onStartAsync();
        }
    }


    //@Private Methods

    //  @Time ticker section
    private _setAnimFrame():void {
        this._lastTime = (new Date()).getTime();
        var frameRate = this._config.frameRate;
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
        var config = this._config;
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
    public async _loadConfigAsync(): Promise<void> {
        //var p = new Promise((resolve, reject) => {

        // Load config
        var config = this._config || <configSettings>(<any>document).ccConfig;
        // Already loaded or Load from document.ccConfig
        if (config) {
            this._initConfig(config);
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
                txt = await loader.loadTxtAsync(_src);
            }
            if (!txt) {
                txt = await loader.loadTxtAsync("project.json");
            }
            var data = JSON.parse(txt);
            this._initConfig(data);
        }

        //});
        //return p;
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
        this._config = config;
        this._configLoaded = true;
    }
    private _initRenderer(width:number, height:number):void {
        // Avoid setup to be called twice.
        if (this._rendererInitialized) return;

        if (!this._supportRender) {
            throw new Error("The renderer doesn't support the renderMode " + this._config.renderMode);
        }

        var el = this._config.id;
        var win = window;
        var element:HTMLElement = ($(el) || $('#' + el)).get(0);
        var localCanvas:HTMLCanvasElement;
        var localContainer: HTMLDivElement;
        var localConStyle;

        if (element.tagName === "CANVAS") {
            //it is already a canvas, we wrap it around with a div
            this._canvas = localCanvas = <HTMLCanvasElement>element;
            width = width || localCanvas.width;
            height = height || localCanvas.height;

            this._container = localContainer = <HTMLDivElement>document.createElement("DIV");
            if (localCanvas.parentNode)
                localCanvas.parentNode.insertBefore(localContainer, localCanvas);
        } else {
            //we must make a new canvas and place into this element
            if (element.tagName !== "DIV") {
                log("Warning: target element is not a DIV or CANVAS");
            }
            width = width || element.clientWidth;
            height = height || element.clientHeight;
            this._canvas = localCanvas = <HTMLCanvasElement>document.createElement("CANVAS");
            this._container = localContainer = <HTMLDivElement> document.createElement("DIV");
            element.appendChild(localContainer);
        }
        localContainer.setAttribute('id', 'Cocos2dGameContainer');
        localContainer.appendChild(localCanvas);
        this._frame = <HTMLElement>((localContainer.parentNode === document.body) ? document.documentElement : localContainer.parentNode);

        $(localCanvas).addClass("gameCanvas");
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
            //win.gl = this._renderContext; // global variable declared in CCMacro.js
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
        this._canvas.oncontextmenu = ()=> {
            if (!this._isContextMenuEnable) return false;
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
        if (this._config.registerSystemEvent)
            inputManager.registerSystemEvent(this._canvas);

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