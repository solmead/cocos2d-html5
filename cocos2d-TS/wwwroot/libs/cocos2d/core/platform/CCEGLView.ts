import { Dictionary } from "../../../extensions/syslibs/LinqToJs";
import { sys, BROWSER_TYPES, OSS } from "../../../startup/CCSys";
import { ccClass } from "./CCClass";
import { game, RENDER_TYPE } from "../../../startup/CCGame";
import { size, Size, Rect, rect, Point, p } from "../cocoa/index";
import { visibleRect } from "./CCVisibleRect";
import { eventManager, ccTouch } from "../event-manager/index";
import { ORIENTATION, contentScaleFactor } from "./CCMacro";
import { screen } from "./CCScreen";
import { director } from "../CCDirector";
import { log, _LogInfos } from "../../../startup/CCDebugger";

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

var Touches: Array<boolean> = new Array<boolean>();
var TouchesIntegerDict: Dictionary<boolean, boolean> = new Dictionary<boolean, boolean>();


export var DENSITYDPI = {
    DEVICE: "device-dpi",
    HIGH: "high-dpi",
    MEDIUM: "medium-dpi",
    LOW: "low-dpi"
}

interface iBrowserMeta {
    width: string;
    minimalUI: boolean;
}

class _BrowserInfo {

    public html: HTMLElement = null;
    public adaptationType = sys.browserType;
    public meta: iBrowserMeta = <iBrowserMeta>{};


    constructor() {
        this.meta.width = "device-width";

        if (window.navigator.userAgent.indexOf("OS 8_1_") > -1) //this mistake like MIUI, so use of MIUI treatment method
            this.adaptationType = BROWSER_TYPES.MIUI;

        if (sys.os === OSS.IOS) // All browsers are WebView
            __BrowserGetter.adaptationType = BROWSER_TYPES.SAFARI;


        switch (this.adaptationType) {
            case BROWSER_TYPES.SAFARI:
                this.meta.minimalUI = true;
                break;
            case BROWSER_TYPES.MIUI:
                this.init = (view?: EGLView) => {
                    if (view.__resizeWithBrowserSize) return;
                    var resize = () => {
                        view.setDesignResolutionSize(
                            view._designResolutionSize.width,
                            view._designResolutionSize.height,
                            view._resolutionPolicy
                        );
                        window.removeEventListener("resize", resize, false);
                    };
                    window.addEventListener("resize", resize, false);
                };
                break;
        }
    }
    init(view?: EGLView): void {

        this.html = document.documentElement;
    }
    availWidth(frame: HTMLElement) {
        if (!frame || frame === this.html)
            return window.innerWidth;
        else
            return frame.clientWidth;
    }
    availHeight(frame: HTMLElement) {
        if (!frame || frame === this.html)
            return window.innerHeight;
        else
            return frame.clientHeight;
    }

    get targetDensityDpi() {
        return EGLView._getInstance()._targetDensityDPI;
    }
}

export interface ccPosition {
    left: number;
    top: number;
    width: number;
    height: number;
}

var __BrowserGetter = new _BrowserInfo();

var _scissorRect:Rect = null;


export class EGLView extends ccClass {
    static _getInstance(): EGLView {
        var self = <any>this;
        if (!self._instance) {
            self._instance = self._instance || new EGLView();
            self._instance.initialize();
        }
        return self._instance;
    };

    //_delegate = null;
    // Size of parent node that contains cc.container and cc._canvas
    _frameSize: Size = null;
    // resolution size; it is the size appropriate for the app resources.
    _designResolutionSize: Size = null;
    _originalDesignResolutionSize: Size = null;
    // Viewport is the container's rect related to content's coordinates in pixel
    _viewPortRect: Rect = null;
    // The visible rect in content's coordinate in point
    _visibleRect: Rect = null;
    _retinaEnabled: boolean = false;
    _autoFullScreen: boolean = false;
    // The device's pixel ratio (for retina displays)
    _devicePixelRatio:number = 1;
    // the view name
    _viewName:string = "";
    // Custom callback for resize event
    _resizeCallback: () => void = null;

    _orientationChanging: boolean = true;
    _resizing: boolean = false;

    _scaleX:number = 1;
    _originalScaleX: number = 1;
    _scaleY: number = 1;
    _originalScaleY: number = 1;

    _isRotated: boolean = false;
    _orientation: ORIENTATION = ORIENTATION.AUTO;

    _resolutionPolicy: ResolutionPolicy = null;
    _rpExactFit: ResolutionPolicy = null;
    _rpShowAll: ResolutionPolicy = null;
    _rpNoBorder: ResolutionPolicy = null;
    _rpFixedHeight: ResolutionPolicy = null;
    _rpFixedWidth: ResolutionPolicy = null;
    _initialized: boolean = false;

    _contentTranslateLeftTop: ccPosition = null;

    // Parent node that contains cc.container and cc._canvas
    _frame: HTMLElement = null;
    _frameZoomFactor: number = 1.0;
    __resizeWithBrowserSize: boolean = false;
    _isAdjustViewPort: boolean = true;
    _targetDensityDPI: string = null;





    private constructor() {
        super();
        var _t = this, d = document;
        var _strategyer = ContainerStrategy;
        var _strategy = ContentStrategy;

        __BrowserGetter.init(this);

        _t._frame = <HTMLElement>((game.container.parentNode === d.body) ? d.documentElement : game.container.parentNode);
        _t._frameSize = size(0, 0);
        _t._initFrameSize();

        var w = game.canvas.width, h = game.canvas.height;
        _t._designResolutionSize = size(w, h);
        _t._originalDesignResolutionSize = size(w, h);
        _t._viewPortRect = rect(0, 0, w, h);
        _t._visibleRect = rect(0, 0, w, h);
        _t._contentTranslateLeftTop = <ccPosition>{ left: 0, top: 0 };
        _t._viewName = "Cocos2dHTML5";

        visibleRect && visibleRect.init(_t._visibleRect);

        // Setup system default resolution policies
        _t._rpExactFit = new ResolutionPolicy(EQUAL_TO_FRAME, EXACT_FIT);
        _t._rpShowAll = new ResolutionPolicy(PROPORTION_TO_FRAME, SHOW_ALL);
        _t._rpNoBorder = new ResolutionPolicy(EQUAL_TO_FRAME, NO_BORDER);
        _t._rpFixedHeight = new ResolutionPolicy(EQUAL_TO_FRAME, FIXED_HEIGHT);
        _t._rpFixedWidth = new ResolutionPolicy(EQUAL_TO_FRAME, FIXED_WIDTH);

        _t._targetDensityDPI = DENSITYDPI.HIGH;

        if (sys.isMobile) {
            window.addEventListener('orientationchange', this._orientationChange);
        } else {
            this._orientationChanging = false;
        }
    }


    // Resize helper functions
    _resizeEvent(): void {
        var view;
        if (this.setDesignResolutionSize) {
            view = this;
        } else {
            view = this; //cc.view;
        }
        if (view._orientationChanging) {
            return;
        }

        // Check frame size changed or not
        var prevFrameW = view._frameSize.width, prevFrameH = view._frameSize.height, prevRotated = view._isRotated;
        if (sys.isMobile) {
            var containerStyle = game.container.style,
                margin = containerStyle.margin;
            containerStyle.margin = '0';
            containerStyle.display = 'none';
            view._initFrameSize();
            containerStyle.margin = margin;
            containerStyle.display = 'block';
        }
        else {
            view._initFrameSize();
        }
        if (view._isRotated === prevRotated && view._frameSize.width === prevFrameW && view._frameSize.height === prevFrameH)
            return;

        // Frame size changed, do resize works
        var width = view._originalDesignResolutionSize.width;
        var height = view._originalDesignResolutionSize.height;
        view._resizing = true;
        if (width > 0) {
            view.setDesignResolutionSize(width, height, view._resolutionPolicy);
        }
        view._resizing = false;

        eventManager.dispatchCustomEvent('canvas-resize');
        if (view._resizeCallback) {
            view._resizeCallback();
        }
    }

    _orientationChange(): void {
        this._orientationChanging = true;
        if (sys.isMobile) {
            game.container.style.display = "none";
        }
        setTimeout(() => {
            this._orientationChanging = false;
            this._resizeEvent();
        }, 300);
    }

    /**
     * <p>
     * Sets view's target-densitydpi for android mobile browser. it can be set to:           <br/>
     *   1. cc.DENSITYDPI_DEVICE, value is "device-dpi"                                      <br/>
     *   2. cc.DENSITYDPI_HIGH, value is "high-dpi"  (default value)                         <br/>
     *   3. cc.DENSITYDPI_MEDIUM, value is "medium-dpi" (browser's default value)            <br/>
     *   4. cc.DENSITYDPI_LOW, value is "low-dpi"                                            <br/>
     *   5. Custom value, e.g: "480"                                                         <br/>
     * </p>
     * @param {String} densityDPI
     */
    setTargetDensityDPI(densityDPI: string): void {
        this._targetDensityDPI = densityDPI;
        this._adjustViewportMeta();
    }

    /**
     * Returns the current target-densitydpi value of cc.view.
     * @returns {String}
     */
    getTargetDensityDPI(): string {
        return this._targetDensityDPI;
    }


    /**
     * Sets whether resize canvas automatically when browser's size changed.<br/>
     * Useful only on web.
     * @param {Boolean} enabled Whether enable automatic resize with browser's resize event
     */
    resizeWithBrowserSize(enabled: boolean): void {
        if (enabled) {
            //enable
            if (!this.__resizeWithBrowserSize) {
                this.__resizeWithBrowserSize = true;
                window.addEventListener('resize', this._resizeEvent);
            }
        } else {
            //disable
            if (this.__resizeWithBrowserSize) {
                this.__resizeWithBrowserSize = false;
                window.removeEventListener('resize', this._resizeEvent);
            }
        }
    }


    /**
     * Sets the callback function for cc.view's resize action,<br/>
     * this callback will be invoked before applying resolution policy, <br/>
     * so you can do any additional modifications within the callback.<br/>
     * Useful only on web.
     * @param {Function|null} callback The callback function
     */
    setResizeCallback(callback: () => void) {
        if (typeof callback === 'function' || callback == null) {
            this._resizeCallback = callback;
        }
    }


    /**
     * Sets the orientation of the game, it can be landscape, portrait or auto.
     * When set it to landscape or portrait, and screen w/h ratio doesn't fit,
     * cc.view will automatically rotate the game canvas using CSS.
     * Note that this function doesn't have any effect in native,
     * in native, you need to set the application orientation in native project settings
     * @param {Number} orientation - Possible values: cc.ORIENTATION_LANDSCAPE | cc.ORIENTATION_PORTRAIT | cc.ORIENTATION_AUTO
     */
    setOrientation(orientation: ORIENTATION): void {

        orientation = orientation & ORIENTATION.AUTO;
        if (orientation && this._orientation !== orientation) {
            this._orientation = orientation;
            if (this._resolutionPolicy) {
                var designWidth = this._originalDesignResolutionSize.width;
                var designHeight = this._originalDesignResolutionSize.height;
                this.setDesignResolutionSize(designWidth, designHeight, this._resolutionPolicy);
            }
        }
    }

    setDocumentPixelWidth(width: number) {
        // Set viewport's width
        this._setViewportMeta({ "width": width }, true);

        // Set body width to the exact pixel resolution
        document.documentElement.style.width = width + 'px';
        document.body.style.width = "100%";

        // Reset the resolution size and policy
        this.setDesignResolutionSize(this._designResolutionSize.width, this._designResolutionSize.height, this._resolutionPolicy);
    }
    _initFrameSize() {
        var locFrameSize = this._frameSize;
        var w = __BrowserGetter.availWidth(this._frame);
        var h = __BrowserGetter.availHeight(this._frame);
        var isLandscape = w >= h;

        if (!sys.isMobile ||
            (isLandscape && this._orientation & ORIENTATION.LANDSCAPE) ||
            (!isLandscape && this._orientation & ORIENTATION.PORTRAIT)) {
            locFrameSize.width = w;
            locFrameSize.height = h;
            //game.container.style['-webkit-transform'] = 'rotate(0deg)';
            game.container.style.transform = 'rotate(0deg)';
            this._isRotated = false;
        }
        else {
            locFrameSize.width = h;
            locFrameSize.height = w;
            //game.container.style['-webkit-transform'] = 'rotate(90deg)';
            game.container.style.transform = 'rotate(90deg)';
            //game.container.style['-webkit-transform-origin'] = '0px 0px 0px';
            game.container.style.transformOrigin = '0px 0px 0px';
            this._isRotated = true;
        }
    }

    // hack
    _adjustSizeKeepCanvasSize() {
        var designWidth = this._originalDesignResolutionSize.width;
        var designHeight = this._originalDesignResolutionSize.height;
        if (designWidth > 0)
            this.setDesignResolutionSize(designWidth, designHeight, this._resolutionPolicy);
    }


    _setViewportMeta(metas: any, overwrite: boolean = false) {
        var vp = <HTMLMetaElement> document.getElementById("cocosMetaElement");
        if (vp && overwrite) {
            document.head.removeChild(vp);
        }

        var elems = document.getElementsByName("viewport");
        var currentVP: HTMLMetaElement = <HTMLMetaElement>(elems ? elems[0] : null);
        var content: string;
        var key;
        var pattern: RegExp;

        content = currentVP ? currentVP.content : "";
        vp = vp || document.createElement("meta");
        vp.id = "cocosMetaElement";
        vp.name = "viewport";
        vp.content = "";

        for (key in metas) {
            if (content.indexOf(key) == -1) {
                content += "," + key + "=" + metas[key];
            }
            else if (overwrite) {
                pattern = new RegExp(key + "\s*=\s*[^,]+");
                content.replace(pattern, key + "=" + metas[key]);
            }
        }
        if (/^,/.test(content))
            content = content.substr(1);

        vp.content = content;
        // For adopting certain android devices which don't support second viewport
        if (currentVP)
            currentVP.content = content;

        document.head.appendChild(vp);
    }
    _adjustViewportMeta() {
        if (this._isAdjustViewPort) {
            this._setViewportMeta(__BrowserGetter.meta, false);
            // Only adjust viewport once
            this._isAdjustViewPort = false;
        }
    }

    // RenderTexture hacker
    _setScaleXYForRenderTexture() {
        //hack for RenderTexture on canvas mode when adapting multiple resolution resources
        var scaleFactor = contentScaleFactor();
        this._scaleX = scaleFactor;
        this._scaleY = scaleFactor;
    }
    // Other helper functions
    _resetScale() {
        this._scaleX = this._originalScaleX;
        this._scaleY = this._originalScaleY;
    }
    // Useless, just make sure the compatibility temporarily, should be removed
    _adjustSizeToBrowser() {
    }
    initialize() {
        this._initialized = true;
    }


    /**
     * Sets whether the engine modify the "viewport" meta in your web page.<br/>
     * It's enabled by default, we strongly suggest you not to disable it.<br/>
     * And even when it's enabled, you can still set your own "viewport" meta, it won't be overridden<br/>
     * Only useful on web
     * @param {Boolean} enabled Enable automatic modification to "viewport" meta
     */
    adjustViewPort(enabled: boolean) {
        this._isAdjustViewPort = enabled;
    }
    /**
     * Retina support is enabled by default for Apple device but disabled for other devices,<br/>
     * it takes effect only when you called setDesignResolutionPolicy<br/>
     * Only useful on web
     * @param {Boolean} enabled  Enable or disable retina display
     */
    enableRetina(enabled: boolean) {
        this._retinaEnabled = !!enabled;
    }
    /**
     * Check whether retina display is enabled.<br/>
     * Only useful on web
     * @return {Boolean}
     */
    isRetinaEnabled(): boolean {
        return this._retinaEnabled;
    }

    /**
     * If enabled, the application will try automatically to enter full screen mode on mobile devices<br/>
     * You can pass true as parameter to enable it and disable it by passing false.<br/>
     * Only useful on web
     * @param {Boolean} enabled  Enable or disable auto full screen on mobile devices
     */
    enableAutoFullScreen(enabled: boolean) {
        if (enabled && enabled !== this._autoFullScreen && sys.isMobile && this._frame === document.documentElement) {
            // Automatically full screen when user touches on mobile version
            this._autoFullScreen = true;
            screen.autoFullScreen(this._frame);
        }
        else {
            this._autoFullScreen = false;
        }
    }
    /**
         * Check whether auto full screen is enabled.<br/>
         * Only useful on web
         * @return {Boolean} Auto full screen enabled or not
         */
    isAutoFullScreenEnabled(): boolean {
        return this._autoFullScreen;
    }
    /**
         * Get whether render system is ready(no matter opengl or canvas),<br/>
         * this name is for the compatibility with cocos2d-x, subclass must implement this method.
         * @return {Boolean}
         */
    isOpenGLReady(): boolean {
        return (!!game.canvas && !!game.renderContextGeneric);
    }

    /*
     * Set zoom factor for frame. This method is for debugging big resolution (e.g.new ipad) app on desktop.
     * @param {Number} zoomFactor
     */
    setFrameZoomFactor(zoomFactor: number) {
        this._frameZoomFactor = zoomFactor;
        //this.centerWindow();
        director.setProjection(director.getProjection());
    }

    /**
     * Exchanges the front and back buffers, subclass must implement this method.
     */
    swapBuffers() {
    }



    /**
     * Open or close IME keyboard , subclass must implement this method.
     * @param {Boolean} isOpen
     */
    setIMEKeyboardState(isOpen:boolean) {
    }

    /**
     * Sets the resolution translate on EGLView
     * @param {Number} offsetLeft
     * @param {Number} offsetTop
     */
    setContentTranslateLeftTop(offsetLeft: number, offsetTop: number) {
        this._contentTranslateLeftTop = <ccPosition>{ left: offsetLeft, top: offsetTop };
    }

    /**
     * Returns the resolution translate on EGLView
     * @return {cc.Size|Object}
     */
    getContentTranslateLeftTop():Size {
        return this._contentTranslateLeftTop;
    }

    /**
     * Returns the canvas size of the view.<br/>
     * On native platforms, it returns the screen size since the view is a fullscreen view.<br/>
     * On web, it returns the size of the canvas element.
     * @return {cc.Size}
     */
    getCanvasSize():Size {
        return size(game.canvas.width, game.canvas.height);
    }

    /**
     * Returns the frame size of the view.<br/>
     * On native platforms, it returns the screen size since the view is a fullscreen view.<br/>
     * On web, it returns the size of the canvas's outer DOM element.
     * @return {cc.Size}
     */
    getFrameSize():Size {
        return size(this._frameSize.width, this._frameSize.height);
    }

    /**
     * On native, it sets the frame size of view.<br/>
     * On web, it sets the size of the canvas's outer DOM element.
     * @param {Number} width
     * @param {Number} height
     */
    setFrameSize(width: number, height: number) {
        this._frameSize.width = width;
        this._frameSize.height = height;
        this._frame.style.width = width + "px";
        this._frame.style.height = height + "px";
        this._resizeEvent();
        director.setProjection(director.getProjection());
    }

    /**
     * Returns the visible area size of the view port.
     * @return {cc.Size}
     */
    getVisibleSize():Size {
        return size(this._visibleRect.width, this._visibleRect.height);
    }

    /**
     * Returns the visible area size of the view port.
     * @return {cc.Size}
     */
    getVisibleSizeInPixel():Size {
        return size(this._visibleRect.width * this._scaleX,
            this._visibleRect.height * this._scaleY);
    }

    /**
     * Returns the visible origin of the view port.
     * @return {cc.Point}
     */
    getVisibleOrigin():Point {
        return p(this._visibleRect.x, this._visibleRect.y);
    }

    /**
     * Returns the visible origin of the view port.
     * @return {cc.Point}
     */
    getVisibleOriginInPixel(): Point {
        return p(this._visibleRect.x * this._scaleX,
            this._visibleRect.y * this._scaleY);
    }

    /**
     * Returns whether developer can set content's scale factor.
     * @return {Boolean}
     */
    canSetContentScaleFactor():boolean {
        return true;
    }

    /**
     * Returns the current resolution policy
     * @see cc.ResolutionPolicy
     * @return {cc.ResolutionPolicy}
     */
    getResolutionPolicy(): ResolutionPolicy {
        return this._resolutionPolicy;
    }

    /**
     * Sets the current resolution policy
     * @see cc.ResolutionPolicy
     * @param {cc.ResolutionPolicy|Number} resolutionPolicy
     */
    setResolutionPolicy(resolutionPolicy: PolicyType): void;
    setResolutionPolicy(resolutionPolicy: ResolutionPolicy): void;
    setResolutionPolicy(resolutionPolicy: ResolutionPolicy | PolicyType):void {
        var _t = this;
        if (resolutionPolicy instanceof ResolutionPolicy) {
            _t._resolutionPolicy = resolutionPolicy;
        }
        // Ensure compatibility with JSB
        else {
            var _locPolicy = PolicyType;
            if (resolutionPolicy === _locPolicy.EXACT_FIT)
                _t._resolutionPolicy = _t._rpExactFit;
            if (resolutionPolicy === _locPolicy.SHOW_ALL)
                _t._resolutionPolicy = _t._rpShowAll;
            if (resolutionPolicy === _locPolicy.NO_BORDER)
                _t._resolutionPolicy = _t._rpNoBorder;
            if (resolutionPolicy === _locPolicy.FIXED_HEIGHT)
                _t._resolutionPolicy = _t._rpFixedHeight;
            if (resolutionPolicy === _locPolicy.FIXED_WIDTH)
                _t._resolutionPolicy = _t._rpFixedWidth;
        }
    }

    /**
     * Sets the resolution policy with designed view size in points.<br/>
     * The resolution policy include: <br/>
     * [1] ResolutionExactFit       Fill screen by stretch-to-fit: if the design resolution ratio of width to height is different from the screen resolution ratio, your game view will be stretched.<br/>
     * [2] ResolutionNoBorder       Full screen without black border: if the design resolution ratio of width to height is different from the screen resolution ratio, two areas of your game view will be cut.<br/>
     * [3] ResolutionShowAll        Full screen with black border: if the design resolution ratio of width to height is different from the screen resolution ratio, two black borders will be shown.<br/>
     * [4] ResolutionFixedHeight    Scale the content's height to screen's height and proportionally scale its width<br/>
     * [5] ResolutionFixedWidth     Scale the content's width to screen's width and proportionally scale its height<br/>
     * [cc.ResolutionPolicy]        [Web only feature] Custom resolution policy, constructed by cc.ResolutionPolicy<br/>
     * @param {Number} width Design resolution width.
     * @param {Number} height Design resolution height.
     * @param {cc.ResolutionPolicy|Number} resolutionPolicy The resolution policy desired
     */
    setDesignResolutionSize(width: number, height: number, resolutionPolicy: ResolutionPolicy | PolicyType) {
        var gl = game.renderContextWebGl;
        // Defensive code
        if (!(width > 0 || height > 0)) {
            log(_LogInfos.EGLView_setDesignResolutionSize);
            return;
        }

        this.setResolutionPolicy(<any>resolutionPolicy);
        var policy = this._resolutionPolicy;
        if (policy) {
            policy.preApply(this);
        }

        // Reinit frame size
        if (sys.isMobile)
            this._adjustViewportMeta();

        // If resizing, then frame size is already initialized, this logic should be improved
        if (!this._resizing)
            this._initFrameSize();

        if (!policy) {
            log(_LogInfos.EGLView_setDesignResolutionSize_2);
            return;
        }

        this._originalDesignResolutionSize.width = this._designResolutionSize.width = width;
        this._originalDesignResolutionSize.height = this._designResolutionSize.height = height;

        var result = policy.apply(this, this._designResolutionSize);

        if (result.scale && result.scale.length === 2) {
            this._scaleX = result.scale[0];
            this._scaleY = result.scale[1];
        }

        if (result.viewport) {
            var vp = this._viewPortRect,
                vb = this._visibleRect,
                rv = result.viewport;

            vp.x = rv.x;
            vp.y = rv.y;
            vp.width = rv.width;
            vp.height = rv.height;

            vb.x = -vp.x / this._scaleX;
            vb.y = -vp.y / this._scaleY;
            vb.width = game.canvas.width / this._scaleX;
            vb.height = game.canvas.height / this._scaleY;
            gl.setOffset && gl.setOffset(vp.x, -vp.y);
        }

        // reset director's member variables to fit visible rect
        //var director = cc.director;
        director._winSizeInPoints.width = this._designResolutionSize.width;
        director._winSizeInPoints.height = this._designResolutionSize.height;
        policy.postApply(this);
        //cc.winSize.width = director._winSizeInPoints.width;
        //cc.winSize.height = director._winSizeInPoints.height;

        if (game.renderType === RENDER_TYPE.WEBGL) {
            // reset director's member variables to fit visible rect
            director.setGLDefaultValues();
        }
        else if (game.renderType === RENDER_TYPE.CANVAS) {
            game.renderer._allNeedDraw = true;
        }

        this._originalScaleX = this._scaleX;
        this._originalScaleY = this._scaleY;
        visibleRect && visibleRect.init(this._visibleRect);
    }

    /**
     * Returns the designed size for the view.
     * Default resolution size is the same as 'getFrameSize'.
     * @return {cc.Size}
     */
    getDesignResolutionSize():Size {
        return size(this._designResolutionSize.width, this._designResolutionSize.height);
    }

    /**
     * Sets the document body to desired pixel resolution and fit the game content to it.
     * This function is very useful for adaptation in mobile browsers.
     * In some HD android devices, the resolution is very high, but its browser performance may not be very good.
     * In this case, enabling retina display is very costy and not suggested, and if retina is disabled, the image may be blurry.
     * But this API can be helpful to set a desired pixel resolution which is in between.
     * This API will do the following:
     *     1. Set viewport's width to the desired width in pixel
     *     2. Set body width to the exact pixel resolution
     *     3. The resolution policy will be reset with designed view size in points.
     * @param {Number} width Design resolution width.
     * @param {Number} height Design resolution height.
     * @param {cc.ResolutionPolicy|Number} resolutionPolicy The resolution policy desired
     */
    setRealPixelResolution(width: number, height: number, resolutionPolicy: ResolutionPolicy | number) {
        // Set viewport's width
        this._setViewportMeta({ "width": width }, true);

        // Set body width to the exact pixel resolution
        document.documentElement.style.width = width + "px";
        document.body.style.width = width + "px";
        document.body.style.left = "0px";
        document.body.style.top = "0px";

        // Reset the resolution size and policy
        this.setDesignResolutionSize(width, height, resolutionPolicy);
    }

    /**
     * Sets view port rectangle with points.
     * @param {Number} x
     * @param {Number} y
     * @param {Number} w width
     * @param {Number} h height
     */
    setViewPortInPoints(x: number, y: number, w: number, h: number) {

        var gl = game.renderContextWebGl;
        var locFrameZoomFactor = this._frameZoomFactor, locScaleX = this._scaleX, locScaleY = this._scaleY;
        gl.viewport((x * locScaleX * locFrameZoomFactor + this._viewPortRect.x * locFrameZoomFactor),
            (y * locScaleY * locFrameZoomFactor + this._viewPortRect.y * locFrameZoomFactor),
            (w * locScaleX * locFrameZoomFactor),
            (h * locScaleY * locFrameZoomFactor));
    }

    /**
     * Sets Scissor rectangle with points.
     * @param {Number} x
     * @param {Number} y
     * @param {Number} w
     * @param {Number} h
     */
    setScissorInPoints(x: number, y: number, w: number, h: number) {

        var gl = game.renderContextWebGl;

        var locFrameZoomFactor = this._frameZoomFactor, locScaleX = this._scaleX, locScaleY = this._scaleY;
        var sx = Math.ceil(x * locScaleX * locFrameZoomFactor + this._viewPortRect.x * locFrameZoomFactor);
        var sy = Math.ceil(y * locScaleY * locFrameZoomFactor + this._viewPortRect.y * locFrameZoomFactor);
        var sw = Math.ceil(w * locScaleX * locFrameZoomFactor);
        var sh = Math.ceil(h * locScaleY * locFrameZoomFactor);

        if (!_scissorRect) {
            var boxArr = gl.getParameter(gl.SCISSOR_BOX);
            _scissorRect = rect(boxArr[0], boxArr[1], boxArr[2], boxArr[3]);
        }

        if (_scissorRect.x != sx || _scissorRect.y != sy || _scissorRect.width != sw || _scissorRect.height != sh) {
            _scissorRect.x = sx;
            _scissorRect.y = sy;
            _scissorRect.width = sw;
            _scissorRect.height = sh;
            gl.scissor(sx, sy, sw, sh);
        }
    }

    /**
     * Returns whether GL_SCISSOR_TEST is enable
     * @return {Boolean}
     */
    isScissorEnabled(): boolean {
        var gl = game.renderContextWebGl;
        return gl.isEnabled(gl.SCISSOR_TEST);
    }

    /**
     * Returns the current scissor rectangle
     * @return {cc.Rect}
     */
    getScissorRect(): Rect {
        var gl = game.renderContextWebGl;
        if (!_scissorRect) {
            var boxArr = gl.getParameter(gl.SCISSOR_BOX);
            _scissorRect = rect(boxArr[0], boxArr[1], boxArr[2], boxArr[3]);
        }
        var scaleXFactor = 1 / this._scaleX;
        var scaleYFactor = 1 / this._scaleY;
        return rect(
            (_scissorRect.x - this._viewPortRect.x) * scaleXFactor,
            (_scissorRect.y - this._viewPortRect.y) * scaleYFactor,
            _scissorRect.width * scaleXFactor,
            _scissorRect.height * scaleYFactor
        );
    }

    /**
     * Sets the name of the view
     * @param {String} viewName
     */
    setViewName(viewName:string) {
        if (viewName != null && viewName.length > 0) {
            this._viewName = viewName;
        }
    }

    /**
     * Returns the name of the view
     * @return {String}
     */
    getViewName():string {
        return this._viewName;
    }

    /**
     * Returns the view port rectangle.
     * @return {cc.Rect}
     */
    getViewPortRect():Rect {
        return this._viewPortRect;
    }

    /**
     * Returns scale factor of the horizontal direction (X axis).
     * @return {Number}
     */
    getScaleX():number {
        return this._scaleX;
    }

    /**
     * Returns scale factor of the vertical direction (Y axis).
     * @return {Number}
     */
    getScaleY():number {
        return this._scaleY;
    }

    /**
     * Returns device pixel ratio for retina display.
     * @return {Number}
     */
    getDevicePixelRatio():number {
        return this._devicePixelRatio;
    }

    /**
     * Returns the real location in view for a translation based on a related position
     * @param {Number} tx The X axis translation
     * @param {Number} ty The Y axis translation
     * @param {Object} relatedPos The related position object including "left", "top", "width", "height" informations
     * @return {cc.Point}
     */
    convertToLocationInView(tx:number, ty:number, relatedPos:ccPosition):Point {
        var x = this._devicePixelRatio * (tx - relatedPos.left);
        var y = this._devicePixelRatio * (relatedPos.top + relatedPos.height - ty);
        return this._isRotated ? { x: this._viewPortRect.width - y, y: x } : { x: x, y: y };
    }

    _convertMouseToLocationInView(point: Point, relatedPos: ccPosition):void {
        var viewport = this._viewPortRect, _t = this;
        point.x = ((_t._devicePixelRatio * (point.x - relatedPos.left)) - viewport.x) / _t._scaleX;
        point.y = (_t._devicePixelRatio * (relatedPos.top + relatedPos.height - point.y) - viewport.y) / _t._scaleY;
    }

    _convertPointWithScale(point:Point) {
        var viewport = this._viewPortRect;
        point.x = (point.x - viewport.x) / this._scaleX;
        point.y = (point.y - viewport.y) / this._scaleY;
    }

    _convertTouchesWithScale(touches:Array<ccTouch>) {
        var viewport = this._viewPortRect, scaleX = this._scaleX, scaleY = this._scaleY,
            selTouch, selPoint, selPrePoint;
        for (var i = 0; i < touches.length; i++) {
            selTouch = touches[i];
            selPoint = selTouch._point;
            selPrePoint = selTouch._prevPoint;

            selPoint.x = (selPoint.x - viewport.x) / scaleX;
            selPoint.y = (selPoint.y - viewport.y) / scaleY;
            selPrePoint.x = (selPrePoint.x - viewport.x) / scaleX;
            selPrePoint.y = (selPrePoint.y - viewport.y) / scaleY;
        }
    }











}




/**
 * <p>cc.ContainerStrategy class is the root strategy class of container's scale strategy,
 * it controls the behavior of how to scale the cc.container and cc._canvas object</p>
 *
 * @class
 * @extends cc.Class
 */
export class ContainerStrategy extends ccClass {
    /**
     * Manipulation before appling the strategy
     * @param {cc.view} The target view
     */
    preApply(view: EGLView) {
    }

    /**
     * Function to apply this strategy
     * @param {cc.view} view
     * @param {cc.Size} designedResolution
     */
    apply(view: EGLView, designedResolution?: Size):void {
    }

    /**
     * Manipulation after applying the strategy
     * @param {cc.view} view  The target view
     */
    postApply(view: EGLView) {

    }

    _setupContainer(view: EGLView, w: number, h: number) {

        var gl = game.renderContextWebGl;
        var locCanvas = game.canvas, locContainer = game.container;
        if (sys.os === OSS.ANDROID) {
            document.body.style.width = (view._isRotated ? h : w) + 'px';
            document.body.style.height = (view._isRotated ? w : h) + 'px';
        }

        // Setup style
        locContainer.style.width = locCanvas.style.width = w + 'px';
        locContainer.style.height = locCanvas.style.height = h + 'px';
        // Setup pixel ratio for retina display
        var devicePixelRatio = view._devicePixelRatio = 1;
        if (view.isRetinaEnabled())
            devicePixelRatio = view._devicePixelRatio = Math.min(2, window.devicePixelRatio || 1);
        // Setup canvas
        locCanvas.width = w * devicePixelRatio;
        locCanvas.height = h * devicePixelRatio;
        gl.resetCache && gl.resetCache();
    }

    _fixContainer() {
        // Add container to document body
        document.body.insertBefore(game.container, document.body.firstChild);
        // Set body's width height to window's size, and forbid overflow, so that game will be centered
        var bs = document.body.style;
        bs.width = window.innerWidth + "px";
        bs.height = window.innerHeight + "px";
        bs.overflow = "hidden";
        // Body size solution doesn't work on all mobile browser so this is the aleternative: fixed container
        var contStyle = game.container.style;
        contStyle.position = "fixed";
        contStyle.left = contStyle.top = "0px";
        // Reposition body
        document.body.scrollTop = 0;
    }



}


interface strategyResult {
    scale: Array<number>;
    viewport: Rect;
}

/**
 * <p>cc.ContentStrategy class is the root strategy class of content's scale strategy,
 * it controls the behavior of how to scale the scene and setup the viewport for the game</p>
 *
 * @class
 * @extends cc.Class
 */
export class ContentStrategy extends ccClass {


    _result: strategyResult = {
        scale: [1, 1],
        viewport: null
    };

    _buildResult(containerW: number, containerH: number, contentW: number, contentH: number, scaleX: number, scaleY: number): strategyResult {
        // Makes content fit better the canvas
        Math.abs(containerW - contentW) < 2 && (contentW = containerW);
        Math.abs(containerH - contentH) < 2 && (contentH = containerH);

        var viewport = rect(Math.round((containerW - contentW) / 2),
            Math.round((containerH - contentH) / 2),
            contentW, contentH);

        // Translate the content
        if (game.renderType === RENDER_TYPE.CANVAS) {
            //TODO: modify something for setTransform
            //cc._renderContext.translate(viewport.x, viewport.y + contentH);
        }

        this._result.scale = [scaleX, scaleY];
        this._result.viewport = viewport;
        return this._result;
    }

    /**
     * Manipulation before applying the strategy
     * @param {cc.view} view The target view
     */
    preApply(view:EGLView) {
    }

    /**
     * Function to apply this strategy
     * The return value is {scale: [scaleX, scaleY], viewport: {cc.Rect}},
     * The target view can then apply these value to itself, it's preferred not to modify directly its private variables
     * @param {cc.view} view
     * @param {cc.Size} designedResolution
     * @return {object} scaleAndViewportRect
     */
    apply(view: EGLView, designedResolution: Size): strategyResult {
        return <strategyResult>{
            scale: [1, 1]
        };
    }

    /**
     * Manipulation after applying the strategy
     * @param {cc.view} view The target view
     */
    postApply(view: EGLView) {
    }



}



class EqualToFrame extends ContainerStrategy {
    apply(view: EGLView, designedResolution?: Size): void {

        var frameH = view._frameSize.height, containerStyle = game.container.style;
        this._setupContainer(view, view._frameSize.width, view._frameSize.height);
        // Setup container's margin and padding
        if (view._isRotated) {
            containerStyle.margin = '0 0 0 ' + frameH + 'px';
        }
        else {
            containerStyle.margin = '0px';
        }
    }
}
class ProportionalToFrame extends ContainerStrategy {
    apply(view: EGLView, designedResolution?: Size): void {

        var frameW = view._frameSize.width, frameH = view._frameSize.height, containerStyle = game.container.style,
            designW = designedResolution.width, designH = designedResolution.height,
            scaleX = frameW / designW, scaleY = frameH / designH,
            containerW, containerH;

        scaleX < scaleY ? (containerW = frameW, containerH = designH * scaleX) : (containerW = designW * scaleY, containerH = frameH);

        // Adjust container size with integer value
        var offx = Math.round((frameW - containerW) / 2);
        var offy = Math.round((frameH - containerH) / 2);
        containerW = frameW - 2 * offx;
        containerH = frameH - 2 * offy;

        this._setupContainer(view, containerW, containerH);
        // Setup container's margin and padding
        if (view._isRotated) {
            containerStyle.margin = '0 0 0 ' + frameH + 'px';
        }
        else {
            containerStyle.margin = '0px';
        }
        containerStyle.paddingLeft = offx + "px";
        containerStyle.paddingRight = offx + "px";
        containerStyle.paddingTop = offy + "px";
        containerStyle.paddingBottom = offy + "px";
    }
}

class EqualToWindow extends EqualToFrame {
    preApply(view: EGLView) {
        super.preApply(view);
        view._frame = document.documentElement;
    }


    apply(view: EGLView, designedResolution?: Size): void {
        super.apply(view, designedResolution);

        this._fixContainer();
    }
}

class ProportionalToWindow extends ProportionalToFrame {
    preApply(view: EGLView) {
        super.preApply(view);
        view._frame = document.documentElement;
    }


    apply(view: EGLView, designedResolution?: Size): void {
        super.apply(view, designedResolution);

        this._fixContainer();
    }
}

class OriginalContainer extends ContainerStrategy {
    apply(view: EGLView, designedResolution?: Size): void {
        super.apply(view, designedResolution);

        this._setupContainer(view, game.canvas.width, game.canvas.height);
    }
}

// #NOT STABLE on Android# Alias: Strategy that makes the container's size equals to the window's size
//    cc.ContainerStrategy.EQUAL_TO_WINDOW = new EqualToWindow();
// #NOT STABLE on Android# Alias: Strategy that scale proportionally the container's size to window's size
//    cc.ContainerStrategy.PROPORTION_TO_WINDOW = new ProportionalToWindow();
// Alias: Strategy that makes the container's size equals to the frame's size
var EQUAL_TO_FRAME = new EqualToFrame();
// Alias: Strategy that scale proportionally the container's size to frame's size
var PROPORTION_TO_FRAME = new ProportionalToFrame();
// Alias: Strategy that keeps the original container's size
var ORIGINAL_CONTAINER = new OriginalContainer();


class ExactFit extends ContentStrategy {
    apply(view: EGLView, designedResolution?: Size): strategyResult {
        var containerW = game.canvas.width, containerH = game.canvas.height,
            scaleX = containerW / designedResolution.width, scaleY = containerH / designedResolution.height;

        return this._buildResult(containerW, containerH, containerW, containerH, scaleX, scaleY);
    }
}

class ShowAll extends ContentStrategy {
    apply(view: EGLView, designedResolution?: Size): strategyResult {

        var containerW = game.canvas.width, containerH = game.canvas.height,
            designW = designedResolution.width, designH = designedResolution.height,
            scaleX = containerW / designW, scaleY = containerH / designH, scale = 0,
            contentW, contentH;

        scaleX < scaleY ? (scale = scaleX, contentW = containerW, contentH = designH * scale)
            : (scale = scaleY, contentW = designW * scale, contentH = containerH);

        return this._buildResult(containerW, containerH, contentW, contentH, scale, scale);
    }
}

class NoBorder extends ContentStrategy {
    apply(view: EGLView, designedResolution?: Size): strategyResult {
        var containerW = game.canvas.width, containerH = game.canvas.height,
            designW = designedResolution.width, designH = designedResolution.height,
            scaleX = containerW / designW, scaleY = containerH / designH, scale,
            contentW, contentH;

        scaleX < scaleY ? (scale = scaleY, contentW = designW * scale, contentH = containerH)
            : (scale = scaleX, contentW = containerW, contentH = designH * scale);

        return this._buildResult(containerW, containerH, contentW, contentH, scale, scale);
    }
}

class FixedHeight extends ContentStrategy {
    apply(view: EGLView, designedResolution?: Size): strategyResult {
        var containerW = game.canvas.width, containerH = game.canvas.height,
            designH = designedResolution.height, scale = containerH / designH,
            contentW = containerW, contentH = containerH;

        return this._buildResult(containerW, containerH, contentW, contentH, scale, scale);
    }

    postApply(view: EGLView) {
        director._winSizeInPoints = view.getVisibleSize();
    }
}

class FixedWidth extends ContentStrategy {
    apply(view: EGLView, designedResolution?: Size): strategyResult {
        var containerW = game.canvas.width, containerH = game.canvas.height,
            designW = designedResolution.width, scale = containerW / designW,
            contentW = containerW, contentH = containerH;

        return this._buildResult(containerW, containerH, contentW, contentH, scale, scale);
    }

    postApply(view: EGLView) {
        director._winSizeInPoints = view.getVisibleSize();
    }
}

// Alias: Strategy to scale the content's size to container's size, non proportional
var EXACT_FIT = new ExactFit();
// Alias: Strategy to scale the content's size proportionally to maximum size and keeps the whole content area to be visible
var SHOW_ALL = new ShowAll();
// Alias: Strategy to scale the content's size proportionally to fill the whole container area
var NO_BORDER = new NoBorder();
// Alias: Strategy to scale the content's height to container's height and proportionally scale its width
var FIXED_HEIGHT = new FixedHeight();
// Alias: Strategy to scale the content's width to container's width and proportionally scale its height
var FIXED_WIDTH = new FixedWidth();




export class ResolutionPolicy extends ccClass {
    _containerStrategy: ContainerStrategy = null;
    _contentStrategy: ContentStrategy = null;


    /**
     * Constructor of cc.ResolutionPolicy
     * @param {cc.ContainerStrategy} containerStg
     * @param {cc.ContentStrategy} contentStg
     */
    constructor(containerStg: ContainerStrategy, contentStg: ContentStrategy) {
        super();

        this.setContainerStrategy(containerStg);
        this.setContentStrategy(contentStg);
    }
    /**
     * Manipulation before applying the resolution policy
     * @param {cc.view} view The target view
     */
    preApply(view: EGLView) {
        this._containerStrategy.preApply(view);
        this._contentStrategy.preApply(view);
    }
    /**
     * Function to apply this resolution policy
     * The return value is {scale: [scaleX, scaleY], viewport: {cc.Rect}},
     * The target view can then apply these value to itself, it's preferred not to modify directly its private variables
     * @param {cc.view} view The target view
     * @param {cc.Size} designedResolution The user defined design resolution
     * @return {object} An object contains the scale X/Y values and the viewport rect
     */
    apply(view: EGLView, designedResolution: Size): strategyResult {
        this._containerStrategy.apply(view, designedResolution);
        return this._contentStrategy.apply(view, designedResolution);
    }
    /**
     * Manipulation after appyling the strategy
     * @param {cc.view} view The target view
     */
    postApply(view: EGLView) {
        this._containerStrategy.postApply(view);
        this._contentStrategy.postApply(view);
    }


    /**
     * Setup the container's scale strategy
     * @param {cc.ContainerStrategy} containerStg
     */
    setContainerStrategy(containerStg: ContainerStrategy) {
        if (containerStg instanceof ContainerStrategy)
            this._containerStrategy = containerStg;
    }

    /**
     * Setup the content's scale strategy
     * @param {cc.ContentStrategy} contentStg
     */
    setContentStrategy(contentStg: ContentStrategy) {
        if (contentStg instanceof ContentStrategy)
            this._contentStrategy = contentStg;
    }



}






export enum PolicyType {

    /**
     * @memberOf cc.ResolutionPolicy#
     * @name EXACT_FIT
     * @constant
     * @type Number
     * @static
     * The entire application is visible in the specified area without trying to preserve the original aspect ratio.<br/>
     * Distortion can occur, and the application may appear stretched or compressed.
     */
    EXACT_FIT = 0,

    /**
     * @memberOf cc.ResolutionPolicy#
     * @name NO_BORDER
     * @constant
     * @type Number
     * @static
     * The entire application fills the specified area, without distortion but possibly with some cropping,<br/>
     * while maintaining the original aspect ratio of the application.
     */
    NO_BORDER = 1,

    /**
     * @memberOf cc.ResolutionPolicy#
     * @name SHOW_ALL
     * @constant
     * @type Number
     * @static
     * The entire application is visible in the specified area without distortion while maintaining the original<br/>
     * aspect ratio of the application. Borders can appear on two sides of the application.
     */
    SHOW_ALL = 2,

    /**
     * @memberOf cc.ResolutionPolicy#
     * @name FIXED_HEIGHT
     * @constant
     * @type Number
     * @static
     * The application takes the height of the design resolution size and modifies the width of the internal<br/>
     * canvas so that it fits the aspect ratio of the device<br/>
     * no distortion will occur however you must make sure your application works on different<br/>
     * aspect ratios
     */
    FIXED_HEIGHT = 3,

    /**
     * @memberOf cc.ResolutionPolicy#
     * @name FIXED_WIDTH
     * @constant
     * @type Number
     * @static
     * The application takes the width of the design resolution size and modifies the height of the internal<br/>
     * canvas so that it fits the aspect ratio of the device<br/>
     * no distortion will occur however you must make sure your application works on different<br/>
     * aspect ratios
     */
    FIXED_WIDTH = 4,

    /**
     * @memberOf cc.ResolutionPolicy#
     * @name UNKNOWN
     * @constant
     * @type Number
     * @static
     * Unknow policy
     */
    UNKNOWN = 5
}


















