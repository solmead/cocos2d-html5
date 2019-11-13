import { game, gameEvents, RENDER_TYPE } from "../../../startup/CCGame";
import { ccClass, contentScaleFactor, REPEAT } from "../platform/index";
import { Size, size, Rect, Point } from "../cocoa/index";
import { loader } from "../../../startup/CCLoader";
import { log, _LogInfos } from "../../../startup/CCDebugger";
import { ccNode } from "../base-nodes/CCNode";
import { EventHelper, iEventHandler } from "../event-manager/index";
import { Texture2DCanvas } from "./TexturesCanvas";

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


export enum ALIGN {

    //CONSTANTS:

    /**
     * Horizontal center and vertical center.
     * @constant
     * @type Number
     */
    CENTER = 0x33,

    /**
     * Horizontal center and vertical top.
     * @constant
     * @type Number
     */
    TOP = 0x13,

    /**
     * Horizontal right and vertical top.
     * @constant
     * @type Number
     */
    TOP_RIGHT = 0x12,

    /**
     * Horizontal right and vertical center.
     * @constant
     * @type Number
     */
    RIGHT = 0x32,

    /**
     * Horizontal right and vertical bottom.
     * @constant
     * @type Number
     */
    BOTTOM_RIGHT = 0x22,

    /**
     * Horizontal center and vertical bottom.
     * @constant
     * @type Number
     */
    BOTTOM = 0x23,

    /**
     * Horizontal left and vertical bottom.
     * @constant
     * @type Number
     */
    BOTTOM_LEFT = 0x21,

    /**
     * Horizontal left and vertical center.
     * @constant
     * @type Number
     */
    LEFT = 0x31,

    /**
     * Horizontal left and vertical top.
     * @constant
     * @type Number
     */
    TOP_LEFT = 0x11
}

export enum PIXEL_FORMAT {

    /**
     * 32-bit texture: RGBA8888
     * @memberOf cc.Texture2D
     * @name PIXEL_FORMAT_RGBA8888
     * @static
     * @constant
     * @type {Number}
     */
    RGBA8888 = 2,

    /**
     * 24-bit texture: RGBA888
     * @memberOf cc.Texture2D
     * @name PIXEL_FORMAT_RGB888
     * @static
     * @constant
     * @type {Number}
     */
    RGB888 = 3,

    /**
     * 16-bit texture without Alpha channel
     * @memberOf cc.Texture2D
     * @name PIXEL_FORMAT_RGB565
     * @static
     * @constant
     * @type {Number}
     */
    RGB565 = 4,

    /**
     * 8-bit textures used as masks
     * @memberOf cc.Texture2D
     * @name PIXEL_FORMAT_A8
     * @static
     * @constant
     * @type {Number}
     */
    A8 = 5,

    /**
     * 8-bit intensity texture
     * @memberOf cc.Texture2D
     * @name PIXEL_FORMAT_I8
     * @static
     * @constant
     * @type {Number}
     */
    I8 = 6,

    /**
     * 16-bit textures used as masks
     * @memberOf cc.Texture2D
     * @name PIXEL_FORMAT_AI88
     * @static
     * @constant
     * @type {Number}
     */
    AI88 = 7,

    /**
     * 16-bit textures: RGBA4444
     * @memberOf cc.Texture2D
     * @name PIXEL_FORMAT_RGBA4444
     * @static
     * @constant
     * @type {Number}
     */
    RGBA4444 = 8,

    /**
     * 16-bit textures: RGB5A1
     * @memberOf cc.Texture2D
     * @name PIXEL_FORMAT_RGB5A1
     * @static
     * @constant
     * @type {Number}
     */
    RGB5A1 = 7,

    /**
     * 4-bit PVRTC-compressed texture: PVRTC4
     * @memberOf cc.Texture2D
     * @name PIXEL_FORMAT_PVRTC4
     * @static
     * @constant
     * @type {Number}
     */
    PVRTC4 = 9,

    /**
     * 2-bit PVRTC-compressed texture: PVRTC2
     * @memberOf cc.Texture2D
     * @name PIXEL_FORMAT_PVRTC2
     * @static
     * @constant
     * @type {Number}
     */
    PVRTC2 = 10,


}
export var Texture2D_B:any = {};
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


export type UIImage = HTMLCanvasElement | HTMLImageElement;


/**
 * Default texture format: RGBA8888
 * @memberOf cc.Texture2D
 * @name PIXEL_FORMAT_DEFAULT
 * @static
 * @constant
 * @type {Number}
 */
var PIXEL_FORMAT_DEFAULT: PIXEL_FORMAT = PIXEL_FORMAT.RGBA8888;





//----------------------Possible texture pixel formats----------------------------


// By default PVR images are treated as if they don't have the alpha channel premultiplied
export var PVRHaveAlphaPremultiplied_ = false;

//cc.Texture2DWebGL move to TextureWebGL.js

export abstract class Texture2D extends ccClass implements iEventHandler {
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
    dispatchEvent(event: string, clearAfterDispatch: boolean = true): void {
        this.eventHandler.dispatchEvent(event, clearAfterDispatch);
    }

    static defaultPixelFormat: PIXEL_FORMAT = PIXEL_FORMAT_DEFAULT;

    _contentSize: Size = null;
    _textureLoaded: boolean = false;
    _pixelsWide: number = 0;
    _pixelsHigh: number = 0;
    url: string = null;
    _htmlElementObj: UIImage = null;
    _name: string = null;


    constructor() {
        super();


    }
    /**
             * get width in pixels
             * @return {Number}
             */
    getPixelsWide(): number {
        return this._pixelsWide;
    }
    /**
             * get height of in pixels
             * @return {Number}
             */
    getPixelsHigh(): number {
        return this._pixelsHigh;
    }
    /**
             * get content size
             * @returns {cc.Size}
             */
    getContentSize(): Size {
        var locScaleFactor = contentScaleFactor();
        return size(this._contentSize.width / locScaleFactor, this._contentSize.height / locScaleFactor);
    }

    _getWidth(): number {
        return this._contentSize.width / contentScaleFactor();
    }
    _getHeight(): number {
        return this._contentSize.height / contentScaleFactor();
    }

    /**
     * get content size in pixels
     * @returns {cc.Size}
     */
    getContentSizeInPixels(): Size {
        return this._contentSize;
    }
    /**
             * init with HTML element
             * @param {HTMLImageElement|HTMLCanvasElement} element
             */
    initWithElement(element: UIImage) {
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
    getHtmlElementObj(): UIImage {
        return this._htmlElementObj;
    }
    /**
             * check whether texture is loaded
             * @returns {boolean}
             */
    isLoaded(): boolean {
        return this._textureLoaded;
    }

    /**
             * handle loaded texture
             */
    handleLoadedTexture(premultiplied: boolean = false) {
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
    description(): string {
        return "<cc.Texture2D | width = " + this._contentSize.width + " height " + this._contentSize.height + ">";
    }
    initWithData(data:any, pixelFormat:PIXEL_FORMAT, pixelsWide: number, pixelsHigh: number, contentSize: Size): boolean {
        //support only in WebGl rendering mode
        return false;
    }
    initWithImage(uiImage: UIImage): boolean {
        //support only in WebGl rendering mode
        return false;
    }
    initWithString(text: string, fontName: string, fontSize: number, dimensions: Size, hAlignment: ALIGN, vAlignment: ALIGN): boolean {
        //support only in WebGl rendering mode
        return false;
    }
    releaseTexture() {
        this._htmlElementObj = null;
        loader.release(this.url);
    }
    getName(): any {
        //support only in WebGl rendering mode
        return null;
    }
    getMaxS(): number {
        //support only in WebGl rendering mode
        return 1;
    }

    setMaxS(maxS: number) {
        //support only in WebGl rendering mode
    }

    getMaxT(): number {
        return 1;
    }

    setMaxT(maxT: number) {
        //support only in WebGl rendering mode
    }

    getPixelFormat(): PIXEL_FORMAT {
        //support only in WebGl rendering mode
        return null;
    }

    getShaderProgram(): GLProgram {
        //support only in WebGl rendering mode
        return null;
    }

    setShaderProgram(shaderProgram: GLProgram) {
        //support only in WebGl rendering mode
    }

    hasPremultipliedAlpha(): boolean {
        //support only in WebGl rendering mode
        return false;
    }

    hasMipmaps(): boolean {
        //support only in WebGl rendering mode
        return false;
    }

    releaseData(data:Array<any>) {
        //support only in WebGl rendering mode
        data = null;
    }

    keepData(data: Array<any>, length: number) {
        //support only in WebGl rendering mode
        return data;
    }

    drawAtPoint(point: Point) {
        //support only in WebGl rendering mode
    }

    drawInRect(rect: Rect) {
        //support only in WebGl rendering mode
    }
    /**
             * init with ETC file
    * @warning does not support on HTML5
        */
    initWithETCFile(file: string): boolean {
        log(_LogInfos.Texture2D_initWithETCFile);
        return false;
    }

/**
 * init with PVR file
 * @warning does not support on HTML5
 */
    initWithPVRFile(file: string): boolean {
        log(_LogInfos.Texture2D_initWithPVRFile);
        return false;
    }

/**
 * init with PVRTC data
 * @warning does not support on HTML5
 */
    initWithPVRTCData(data: Array<any>, level: number, bpp: number, hasAlpha: boolean, length: number, pixelFormat: PIXEL_FORMAT): boolean {
        log(_LogInfos.Texture2D_initWithPVRTCData);
        return false;
    }
    setTexParameters(texParams: number | any, magFilter: number, wrapS: number, wrapT: number)
    {

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

    stringForFormat(): string {
        //support only in WebGl rendering mode
        return "";
    }

    bitsPerPixelForFormat(format: PIXEL_FORMAT): number {
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






}


var _getTexture2D: () => Texture2D = null;

export function getNewTexture2D():Texture2D {
    if (_getTexture2D) {
        return _getTexture2D();
    }
}





game.addEventListener(gameEvents.EVENT_RENDERER_INITED, function () {

    if (game.renderType === RENDER_TYPE.CANVAS) {
        _getTexture2D = (): Texture2D => {
            return new Texture2DCanvas();
        }
    } else {
        _getTexture2D = (): Texture2D => {
            return new Texture2DCanvas();
        }

    }
});