import { game, gameEvents, RENDER_TYPE } from "../../../startup/CCGame";
import { ccClass, contentScaleFactor } from "../platform/index";
import { size } from "../cocoa/index";
import { loader } from "../../../startup/CCLoader";
import { log, _LogInfos } from "../../../startup/CCDebugger";
import { EventHelper } from "../event-manager/index";
import { Texture2DCanvas } from "./TexturesCanvas";
import { Texture2DWebGL } from "./TexturesWebGL";
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
export var ALIGN;
(function (ALIGN) {
    //CONSTANTS:
    /**
     * Horizontal center and vertical center.
     * @constant
     * @type Number
     */
    ALIGN[ALIGN["CENTER"] = 51] = "CENTER";
    /**
     * Horizontal center and vertical top.
     * @constant
     * @type Number
     */
    ALIGN[ALIGN["TOP"] = 19] = "TOP";
    /**
     * Horizontal right and vertical top.
     * @constant
     * @type Number
     */
    ALIGN[ALIGN["TOP_RIGHT"] = 18] = "TOP_RIGHT";
    /**
     * Horizontal right and vertical center.
     * @constant
     * @type Number
     */
    ALIGN[ALIGN["RIGHT"] = 50] = "RIGHT";
    /**
     * Horizontal right and vertical bottom.
     * @constant
     * @type Number
     */
    ALIGN[ALIGN["BOTTOM_RIGHT"] = 34] = "BOTTOM_RIGHT";
    /**
     * Horizontal center and vertical bottom.
     * @constant
     * @type Number
     */
    ALIGN[ALIGN["BOTTOM"] = 35] = "BOTTOM";
    /**
     * Horizontal left and vertical bottom.
     * @constant
     * @type Number
     */
    ALIGN[ALIGN["BOTTOM_LEFT"] = 33] = "BOTTOM_LEFT";
    /**
     * Horizontal left and vertical center.
     * @constant
     * @type Number
     */
    ALIGN[ALIGN["LEFT"] = 49] = "LEFT";
    /**
     * Horizontal left and vertical top.
     * @constant
     * @type Number
     */
    ALIGN[ALIGN["TOP_LEFT"] = 17] = "TOP_LEFT";
})(ALIGN || (ALIGN = {}));
export var PIXEL_FORMAT;
(function (PIXEL_FORMAT) {
    /**
     * 32-bit texture: RGBA8888
     * @memberOf cc.Texture2D
     * @name PIXEL_FORMAT_RGBA8888
     * @static
     * @constant
     * @type {Number}
     */
    PIXEL_FORMAT[PIXEL_FORMAT["RGBA8888"] = 2] = "RGBA8888";
    /**
     * 24-bit texture: RGBA888
     * @memberOf cc.Texture2D
     * @name PIXEL_FORMAT_RGB888
     * @static
     * @constant
     * @type {Number}
     */
    PIXEL_FORMAT[PIXEL_FORMAT["RGB888"] = 3] = "RGB888";
    /**
     * 16-bit texture without Alpha channel
     * @memberOf cc.Texture2D
     * @name PIXEL_FORMAT_RGB565
     * @static
     * @constant
     * @type {Number}
     */
    PIXEL_FORMAT[PIXEL_FORMAT["RGB565"] = 4] = "RGB565";
    /**
     * 8-bit textures used as masks
     * @memberOf cc.Texture2D
     * @name PIXEL_FORMAT_A8
     * @static
     * @constant
     * @type {Number}
     */
    PIXEL_FORMAT[PIXEL_FORMAT["A8"] = 5] = "A8";
    /**
     * 8-bit intensity texture
     * @memberOf cc.Texture2D
     * @name PIXEL_FORMAT_I8
     * @static
     * @constant
     * @type {Number}
     */
    PIXEL_FORMAT[PIXEL_FORMAT["I8"] = 6] = "I8";
    /**
     * 16-bit textures used as masks
     * @memberOf cc.Texture2D
     * @name PIXEL_FORMAT_AI88
     * @static
     * @constant
     * @type {Number}
     */
    PIXEL_FORMAT[PIXEL_FORMAT["AI88"] = 7] = "AI88";
    /**
     * 16-bit textures: RGBA4444
     * @memberOf cc.Texture2D
     * @name PIXEL_FORMAT_RGBA4444
     * @static
     * @constant
     * @type {Number}
     */
    PIXEL_FORMAT[PIXEL_FORMAT["RGBA4444"] = 8] = "RGBA4444";
    /**
     * 16-bit textures: RGB5A1
     * @memberOf cc.Texture2D
     * @name PIXEL_FORMAT_RGB5A1
     * @static
     * @constant
     * @type {Number}
     */
    PIXEL_FORMAT[PIXEL_FORMAT["RGB5A1"] = 7] = "RGB5A1";
    /**
     * 4-bit PVRTC-compressed texture: PVRTC4
     * @memberOf cc.Texture2D
     * @name PIXEL_FORMAT_PVRTC4
     * @static
     * @constant
     * @type {Number}
     */
    PIXEL_FORMAT[PIXEL_FORMAT["PVRTC4"] = 9] = "PVRTC4";
    /**
     * 2-bit PVRTC-compressed texture: PVRTC2
     * @memberOf cc.Texture2D
     * @name PIXEL_FORMAT_PVRTC2
     * @static
     * @constant
     * @type {Number}
     */
    PIXEL_FORMAT[PIXEL_FORMAT["PVRTC2"] = 10] = "PVRTC2";
})(PIXEL_FORMAT || (PIXEL_FORMAT = {}));
export var Texture2D_B = {};
Texture2D_B[PIXEL_FORMAT.RGBA8888] = 32;
Texture2D_B[PIXEL_FORMAT.RGB888] = 24;
Texture2D_B[PIXEL_FORMAT.RGB565] = 16;
Texture2D_B[PIXEL_FORMAT.A8] = 8;
Texture2D_B[PIXEL_FORMAT.I8] = 8;
Texture2D_B[PIXEL_FORMAT.AI88] = 16;
Texture2D_B[PIXEL_FORMAT.RGBA4444] = 16;
Texture2D_B[PIXEL_FORMAT.RGB5A1] = 16;
Texture2D_B[PIXEL_FORMAT.PVRTC4] = 4;
Texture2D_B[PIXEL_FORMAT.PVRTC2] = 3;
/**
 * Default texture format: RGBA8888
 * @memberOf cc.Texture2D
 * @name PIXEL_FORMAT_DEFAULT
 * @static
 * @constant
 * @type {Number}
 */
var PIXEL_FORMAT_DEFAULT = PIXEL_FORMAT.RGBA8888;
//----------------------Possible texture pixel formats----------------------------
// By default PVR images are treated as if they don't have the alpha channel premultiplied
export var PVRHaveAlphaPremultiplied_ = false;
//cc.Texture2DWebGL move to TextureWebGL.js
export class Texture2D extends ccClass {
    constructor() {
        super();
        this.eventHandler = new EventHelper(this);
        this._contentSize = null;
        this._textureLoaded = false;
        this._pixelsWide = 0;
        this._pixelsHigh = 0;
        this.url = null;
        this._htmlElementObj = null;
        this._name = null;
    }
    static create() {
        if (_getTexture2D) {
            return _getTexture2D();
        }
    }
    addEventListener(type, listener, target) {
        this.eventHandler.addEventListener(type, listener, target);
    }
    hasEventListener(type, listener, target) {
        return this.eventHandler.hasEventListener(type, listener, target);
    }
    removeEventListener(type, listener, target) {
        this.eventHandler.removeEventListener(type, listener, target);
    }
    removeEventTarget(type, listener, target) {
        this.eventHandler.removeEventTarget(type, listener, target);
    }
    dispatchEvent(event, clearAfterDispatch = true) {
        this.eventHandler.dispatchEvent(event, clearAfterDispatch);
    }
    /**
             * get width in pixels
             * @return {Number}
             */
    getPixelsWide() {
        return this._pixelsWide;
    }
    /**
             * get height of in pixels
             * @return {Number}
             */
    getPixelsHigh() {
        return this._pixelsHigh;
    }
    /**
             * get content size
             * @returns {cc.Size}
             */
    getContentSize() {
        var locScaleFactor = contentScaleFactor();
        return size(this._contentSize.width / locScaleFactor, this._contentSize.height / locScaleFactor);
    }
    _getWidth() {
        return this._contentSize.width / contentScaleFactor();
    }
    _getHeight() {
        return this._contentSize.height / contentScaleFactor();
    }
    /**
     * get content size in pixels
     * @returns {cc.Size}
     */
    getContentSizeInPixels() {
        return this._contentSize;
    }
    /**
             * init with HTML element
             * @param {HTMLImageElement|HTMLCanvasElement} element
             */
    initWithElement(element) {
        if (!element)
            return;
        this._htmlElementObj = element;
        this._pixelsWide = this._contentSize.width = element.width;
        this._pixelsHigh = this._contentSize.height = element.height;
        this._textureLoaded = true;
    }
    /**
             * HTMLElement Object getter
             * @return {HTMLImageElement|HTMLCanvasElement}
             */
    getHtmlElementObj() {
        return this._htmlElementObj;
    }
    /**
             * check whether texture is loaded
             * @returns {boolean}
             */
    isLoaded() {
        return this._textureLoaded;
    }
    /**
             * handle loaded texture
             */
    handleLoadedTexture(premultiplied = false) {
        var self = this;
        if (!self._htmlElementObj) {
            return;
        }
        var locElement = self._htmlElementObj;
        self._pixelsWide = self._contentSize.width = locElement.width;
        self._pixelsHigh = self._contentSize.height = locElement.height;
        //dispatch load event to listener.
        self.dispatchEvent("load");
    }
    /**
             * description of cc.Texture2D
             * @returns {string}
             */
    description() {
        return "<cc.Texture2D | width = " + this._contentSize.width + " height " + this._contentSize.height + ">";
    }
    initWithData(data, pixelFormat, pixelsWide, pixelsHigh, contentSize) {
        //support only in WebGl rendering mode
        return false;
    }
    initWithImage(uiImage) {
        //support only in WebGl rendering mode
        return false;
    }
    initWithString(text, fontName, fontSize, dimensions, hAlignment, vAlignment) {
        //support only in WebGl rendering mode
        return false;
    }
    releaseTexture() {
        this._htmlElementObj = null;
        loader.release(this.url);
    }
    getName() {
        //support only in WebGl rendering mode
        return null;
    }
    getMaxS() {
        //support only in WebGl rendering mode
        return 1;
    }
    setMaxS(maxS) {
        //support only in WebGl rendering mode
    }
    getMaxT() {
        return 1;
    }
    setMaxT(maxT) {
        //support only in WebGl rendering mode
    }
    getPixelFormat() {
        //support only in WebGl rendering mode
        return null;
    }
    getShaderProgram() {
        //support only in WebGl rendering mode
        return null;
    }
    setShaderProgram(shaderProgram) {
        //support only in WebGl rendering mode
    }
    hasPremultipliedAlpha() {
        //support only in WebGl rendering mode
        return false;
    }
    hasMipmaps() {
        //support only in WebGl rendering mode
        return false;
    }
    releaseData(data) {
        //support only in WebGl rendering mode
        data = null;
    }
    keepData(data, length) {
        //support only in WebGl rendering mode
        return data;
    }
    drawAtPoint(point) {
        //support only in WebGl rendering mode
    }
    drawInRect(rect) {
        //support only in WebGl rendering mode
    }
    /**
             * init with ETC file
    * @warning does not support on HTML5
        */
    initWithETCFile(file) {
        log(_LogInfos.Texture2D_initWithETCFile);
        return false;
    }
    /**
     * init with PVR file
     * @warning does not support on HTML5
     */
    initWithPVRFile(file) {
        log(_LogInfos.Texture2D_initWithPVRFile);
        return false;
    }
    /**
     * init with PVRTC data
     * @warning does not support on HTML5
     */
    initWithPVRTCData(data, level, bpp, hasAlpha, length, pixelFormat) {
        log(_LogInfos.Texture2D_initWithPVRTCData);
        return false;
    }
    setTexParameters(texParams, magFilter, wrapS, wrapT) {
    }
    setAntiAliasTexParameters() {
        //support only in WebGl rendering mode
    }
    setAliasTexParameters() {
        //support only in WebGl rendering mode
    }
    generateMipmap() {
        //support only in WebGl rendering mode
    }
    stringForFormat() {
        //support only in WebGl rendering mode
        return "";
    }
    bitsPerPixelForFormat(format) {
        //support only in WebGl rendering mode
        return -1;
    }
    //    /**
    //     * add listener for loaded event
    //     * @param {Function} callback
    //     * @param {cc.Node} target
    //     * @deprecated since 3.1, please use addEventListener instead
    //     */
    //    addLoadedEventListener(callback: () => void, target: ccNode) {
    //        this.addEventListener("load", callback, target);
    //    }
    ///**
    // * remove listener from listeners by target
    // * @param {cc.Node} target
    // */
    //    removeLoadedEventListener(target: ccNode) {
    //        this.removeEventTarget("load", target);
    //    }
    get width() {
        return this._getWidth();
    }
    get height() {
        return this._getHeight();
    }
}
Texture2D.defaultPixelFormat = PIXEL_FORMAT_DEFAULT;
var _getTexture2D = null;
export function getNewTexture2D() {
    if (_getTexture2D) {
        return _getTexture2D();
    }
}
game.addEventListener(gameEvents.EVENT_RENDERER_INITED, function () {
    if (game.renderType === RENDER_TYPE.CANVAS) {
        _getTexture2D = () => {
            return new Texture2DCanvas();
        };
    }
    else {
        _getTexture2D = () => {
            return new Texture2DWebGL();
        };
    }
});
//# sourceMappingURL=CCTexture2D.js.map