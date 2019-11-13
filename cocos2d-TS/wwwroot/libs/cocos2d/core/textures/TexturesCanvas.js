import { REPEAT } from "../platform/index";
import { rect } from "../cocoa/index";
import { Texture2D } from "./CCTexture2D";
import { sys } from "../../../startup/CCSys";
import { textureCache } from "./CCTextureCache";
/**
         * <p>
         * This class allows to easily create OpenGL or Canvas 2D textures from images, text or raw data.                                    <br/>
         * The created cc.Texture2D object will always have power-of-two dimensions.                                                <br/>
         * Depending on how you create the cc.Texture2D object, the actual image area of the texture might be smaller than the texture dimensions <br/>
         *  i.e. "contentSize" != (pixelsWide, pixelsHigh) and (maxS, maxT) != (1.0, 1.0).                                           <br/>
         * Be aware that the content of the generated textures will be upside-down! </p>
         * @name cc.Texture2D
         * @class
         * @extends cc.Class
         *
         * @property {WebGLTexture}     name            - <@readonly> WebGLTexture Object
         * @property {Number}           pixelFormat     - <@readonly> Pixel format of the texture
         * @property {Number}           pixelsWidth     - <@readonly> Width in pixels
         * @property {Number}           pixelsHeight    - <@readonly> Height in pixels
         * @property {Number}           width           - Content width in points
         * @property {Number}           height          - Content height in points
         * @property {cc.GLProgram}     shaderProgram   - The shader program used by drawAtPoint and drawInRect
         * @property {Number}           maxS            - Texture max S
         * @property {Number}           maxT            - Texture max T
         */
export class Texture2DCanvas extends Texture2D {
    constructor() {
        super();
        this._pattern = "";
        this._grayElementObj = null;
        this._backupElement = null;
        this._isGray = false;
        this.channelCache = new Array();
    }
    setTexParameters(texParams, magFilter, wrapS, wrapT) {
        if (magFilter !== undefined)
            texParams = { minFilter: texParams, magFilter: magFilter, wrapS: wrapS, wrapT: wrapT };
        if (texParams.wrapS === REPEAT && texParams.wrapT === REPEAT) {
            this._pattern = "repeat";
            return;
        }
        if (texParams.wrapS === REPEAT) {
            this._pattern = "repeat-x";
            return;
        }
        if (texParams.wrapT === REPEAT) {
            this._pattern = "repeat-y";
            return;
        }
        this._pattern = "";
    }
    _generateColorTexture(r = null, g = null, b = null, irect = null, canvas = null) {
        if (sys._supportCanvasNewBlendModes) {
            return this._generateColorTextureNewBlend(r, g, b, irect, canvas);
        }
        else {
            return this._generateColorTextureOld(r, g, b, irect, canvas);
        }
    }
    _generateColorTextureNewBlend(r = null, g = null, b = null, irect = null, canvas = null) {
        var onlyCanvas = false;
        if (canvas instanceof HTMLCanvasElement)
            onlyCanvas = true;
        else
            canvas = document.createElement("canvas");
        canvas = canvas;
        var textureImage = this._htmlElementObj;
        if (!irect)
            irect = rect(0, 0, textureImage.width, textureImage.height);
        canvas.width = irect.width;
        canvas.height = irect.height;
        var context = canvas.getContext("2d");
        context.globalCompositeOperation = "source-over";
        context.fillStyle = "rgb(" + (r | 0) + "," + (g | 0) + "," + (b | 0) + ")";
        context.fillRect(0, 0, irect.width, irect.height);
        context.globalCompositeOperation = "multiply";
        context.drawImage(textureImage, irect.x, irect.y, irect.width, irect.height, 0, 0, irect.width, irect.height);
        context.globalCompositeOperation = "destination-atop";
        context.drawImage(textureImage, irect.x, irect.y, irect.width, irect.height, 0, 0, irect.width, irect.height);
        if (onlyCanvas)
            return canvas;
        var newTexture = new Texture2DCanvas();
        newTexture.initWithElement(canvas);
        newTexture.handleLoadedTexture();
        return newTexture;
    }
    _generateColorTextureOld(r = null, g = null, b = null, irect = null, canvas = null) {
        var onlyCanvas = false;
        if (canvas instanceof HTMLCanvasElement)
            onlyCanvas = true;
        else
            canvas = document.createElement("canvas");
        canvas = canvas;
        var textureImage = this._htmlElementObj;
        if (!irect)
            irect = rect(0, 0, textureImage.width, textureImage.height);
        var x, y, w, h;
        x = irect.x;
        y = irect.y;
        w = irect.width;
        h = irect.height;
        if (!w || !h)
            return;
        canvas.width = w;
        canvas.height = h;
        var context = canvas.getContext("2d");
        var tintedImgCache = textureCache.getTextureColors(this);
        context.globalCompositeOperation = 'lighter';
        context.drawImage(tintedImgCache[3], x, y, w, h, 0, 0, w, h);
        if (r > 0) {
            context.globalAlpha = r / 255;
            context.drawImage(tintedImgCache[0], x, y, w, h, 0, 0, w, h);
        }
        if (g > 0) {
            context.globalAlpha = g / 255;
            context.drawImage(tintedImgCache[1], x, y, w, h, 0, 0, w, h);
        }
        if (b > 0) {
            context.globalAlpha = b / 255;
            context.drawImage(tintedImgCache[2], x, y, w, h, 0, 0, w, h);
        }
        if (onlyCanvas)
            return canvas;
        var newTexture = new Texture2DCanvas();
        newTexture.initWithElement(canvas);
        newTexture.handleLoadedTexture();
        return newTexture;
    }
    _generateTextureCacheForColor() {
        if (this.channelCache)
            return this.channelCache;
        var textureCache = [
            document.createElement("canvas"),
            document.createElement("canvas"),
            document.createElement("canvas"),
            document.createElement("canvas")
        ];
        //todo texture onload
        renderToCache(this._htmlElementObj, textureCache);
        return this.channelCache = textureCache;
    }
    //hack for gray effect
    _switchToGray(toGray) {
        if (!this._textureLoaded || this._isGray === toGray)
            return;
        this._isGray = toGray;
        if (this._isGray) {
            this._backupElement = this._htmlElementObj;
            if (!this._grayElementObj)
                this._grayElementObj = _generateGrayTexture(this._htmlElementObj);
            this._htmlElementObj = this._grayElementObj;
        }
        else {
            if (this._backupElement !== null)
                this._htmlElementObj = this._backupElement;
        }
    }
    _generateGrayTexture() {
        if (!this._textureLoaded)
            return null;
        var grayElement = _generateGrayTexture(this._htmlElementObj);
        var newTexture = new Texture2DCanvas();
        newTexture.initWithElement(grayElement);
        newTexture.handleLoadedTexture();
        return newTexture;
    }
}
var renderToCache = function (image, cache) {
    var w = image.width;
    var h = image.height;
    cache[0].width = w;
    cache[0].height = h;
    cache[1].width = w;
    cache[1].height = h;
    cache[2].width = w;
    cache[2].height = h;
    cache[3].width = w;
    cache[3].height = h;
    var cacheCtx = cache[3].getContext("2d");
    cacheCtx.drawImage(image, 0, 0);
    var pixels = cacheCtx.getImageData(0, 0, w, h).data;
    var ctx;
    for (var rgbI = 0; rgbI < 4; rgbI++) {
        ctx = cache[rgbI].getContext("2d");
        var to = ctx.getImageData(0, 0, w, h);
        var data = to.data;
        for (var i = 0; i < pixels.length; i += 4) {
            data[i] = (rgbI === 0) ? pixels[i] : 0;
            data[i + 1] = (rgbI === 1) ? pixels[i + 1] : 0;
            data[i + 2] = (rgbI === 2) ? pixels[i + 2] : 0;
            data[i + 3] = pixels[i + 3];
        }
        ctx.putImageData(to, 0, 0);
    }
    image.onload = null;
};
function _generateGrayTexture(texture, irect = null, renderCanvas = null) {
    if (texture === null)
        return null;
    renderCanvas = renderCanvas || document.createElement("canvas");
    irect = irect || rect(0, 0, texture.width, texture.height);
    renderCanvas.width = irect.width;
    renderCanvas.height = irect.height;
    var context = renderCanvas.getContext("2d");
    context.drawImage(texture, irect.x, irect.y, irect.width, irect.height, 0, 0, irect.width, irect.height);
    var imgData = context.getImageData(0, 0, irect.width, irect.height);
    var data = imgData.data;
    for (var i = 0, len = data.length; i < len; i += 4) {
        data[i] = data[i + 1] = data[i + 2] = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
    }
    context.putImageData(imgData, 0, 0);
    return renderCanvas;
}
//# sourceMappingURL=TexturesCanvas.js.map