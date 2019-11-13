import { Texture2D, PIXEL_FORMAT, Texture2D_B, ALIGN, UIImage } from "./CCTexture2D";
import { size, Size, Point, Rect } from "../cocoa/index";
import { loader } from "../../../startup/CCLoader";
import { game } from "../../../startup/CCGame";
import { contentScaleFactor, VERTEX_ATTRIB_POSITION, VERTEX_ATTRIB_TEX_COORDS } from "../platform/index";
import { assert, _LogInfos, log } from "../../../startup/CCDebugger";




export class Texture2DWebGL extends Texture2D {
    //_pVRHaveAlphaPremultiplied = true;
    _pixelFormat: PIXEL_FORMAT = null;
    //_pixelsWide = 0;
    //_pixelsHigh = 0;
    //_name = "";
    //_contentSize = null;
    maxS: number = 0;
    maxT: number = 0;
    _hasPremultipliedAlpha: boolean = false;
    _hasMipmaps: boolean = false;

    shaderProgram: GLProgram = null;

    //_textureLoaded = false;
    //_htmlElementObj = null;
    _webTextureObj: WebGLTexture = null;

    //url = null;
    _glProgramState: GLProgramState = null;






    constructor() {
        super();
        this._contentSize = size(0, 0);
        this._pixelFormat = Texture2D.defaultPixelFormat;
        //setupForWebGL();
    }


    /**
         * release texture
         */
    releaseTexture() {
        if (this._webTextureObj)
            game.renderContextWebGl.deleteTexture(this._webTextureObj);
        this._htmlElementObj = null;
        loader.release(this.url);
    }
    /**
         * pixel format of the texture
         * @return {Number}
         */
    getPixelFormat(): PIXEL_FORMAT {
        return this._pixelFormat;
    }


    /**
     * width in pixels
     * @return {Number}
     */
    getPixelsWide(): number {
        return this._pixelsWide;
    }

    /**
     * height in pixels
     * @return {Number}
     */
    getPixelsHigh(): number {
        return this._pixelsHigh;
    }

    /**
     * get WebGLTexture Object
     * @return {WebGLTexture}
     */
    getName(): WebGLTexture {
        return this._webTextureObj;
    }

    /**
     * content size
     * @return {cc.Size}
     */
    getContentSize(): Size {
        return size(this._contentSize.width / contentScaleFactor(), this._contentSize.height / contentScaleFactor());
    }

    _getWidth(): number {
        return this._contentSize.width / contentScaleFactor();
    }
    _getHeight(): number {
        return this._contentSize.height / contentScaleFactor();
    }

    /**
     * get content size in pixels
     * @return {cc.Size}
     */
    getContentSizeInPixels(): Size {
        return this._contentSize;
    }

    /**
     * texture max S
     * @return {Number}
     */
    getMaxS(): number {
        return this.maxS;
    }

    /**
     * set texture max S
     * @param {Number} maxS
     */
    setMaxS(maxS: number) {
        this.maxS = maxS;
    }

    /**
     * get texture max T
     * @return {Number}
     */
    getMaxT(): number {
        return this.maxT;
    }

    /**
     * set texture max T
     * @param {Number} maxT
     */
    setMaxT(maxT: number) {
        this.maxT = maxT;
    }

    /**
     * return shader program used by drawAtPoint and drawInRect
     * @return {cc.GLProgram}
     */
    getShaderProgram(): GLProgram {
        return this.shaderProgram;
    }

    /**
     * set shader program used by drawAtPoint and drawInRect
     * @param {cc.GLProgram} shaderProgram
     */
    setShaderProgram(shaderProgram: GLProgram) {
        this.shaderProgram = shaderProgram;
    }

    /**
     * whether or not the texture has their Alpha premultiplied
     * @return {Boolean}
     */
    hasPremultipliedAlpha(): boolean {
        return this._hasPremultipliedAlpha;
    }

    /**
     * whether or not use mipmap
     * @return {Boolean}
     */
    hasMipmaps(): boolean {
        return this._hasMipmaps;
    }

    /**
     * description
     * @return {string}
     */
    description(): string {
        var _t = this;
        return "<cc.Texture2D | Name = " + _t._name + " | Dimensions = " + _t._pixelsWide + " x " + _t._pixelsHigh
            + " | Coordinates = (" + _t.maxS + ", " + _t.maxT + ")>";
    }

    /**
     * These functions are needed to create mutable textures
     * @param {Array} data
     */
    releaseData(data: Array<any>) {
        data = null;
    }

    keepData(data: Array<any>, length: number) {
        //The texture data mustn't be saved because it isn't a mutable texture.
        return data;
    }


    /**
     * Intializes with a texture2d with data
     * @param {Array} data
     * @param {Number} pixelFormat
     * @param {Number} pixelsWide
     * @param {Number} pixelsHigh
     * @param {cc.Size} contentSize
     * @return {Boolean}
     */
    initWithData(data: ArrayBufferView, pixelFormat: PIXEL_FORMAT, pixelsWide: number, pixelsHigh: number, contentSize: Size): boolean {
        var self = this;
        //tex2d = cc.Texture2D;
        var gl = game.renderContextWebGl;
        var format = gl.RGBA;
        var type = gl.UNSIGNED_BYTE;

        var bitsPerPixel = Texture2D_B[pixelFormat];

        var bytesPerRow = pixelsWide * bitsPerPixel / 8;
        if (bytesPerRow % 8 === 0) {
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 8);
        } else if (bytesPerRow % 4 === 0) {
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
        } else if (bytesPerRow % 2 === 0) {
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 2);
        } else {
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        }

        self._webTextureObj = gl.createTexture();
        glBindTexture2D(self);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Specify OpenGL texture image
        switch (pixelFormat) {
            case PIXEL_FORMAT.RGBA8888:
                format = gl.RGBA;
                break;
            case PIXEL_FORMAT.RGB888:
                format = gl.RGB;
                break;
            case PIXEL_FORMAT.RGBA4444:
                type = gl.UNSIGNED_SHORT_4_4_4_4;
                break;
            case PIXEL_FORMAT.RGB5A1:
                type = gl.UNSIGNED_SHORT_5_5_5_1;
                break;
            case PIXEL_FORMAT.RGB565:
                type = gl.UNSIGNED_SHORT_5_6_5;
                break;
            case PIXEL_FORMAT.AI88:
                format = gl.LUMINANCE_ALPHA;
                break;
            case PIXEL_FORMAT.A8:
                format = gl.ALPHA;
                break;
            case PIXEL_FORMAT.I8:
                format = gl.LUMINANCE;
                break;
            default:
                assert(!!0, _LogInfos.Texture2D_initWithData);
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, format, pixelsWide, pixelsHigh, 0, format, type, data);


        self._contentSize.width = contentSize.width;
        self._contentSize.height = contentSize.height;
        self._pixelsWide = pixelsWide;
        self._pixelsHigh = pixelsHigh;
        self._pixelFormat = pixelFormat;
        self.maxS = contentSize.width / pixelsWide;
        self.maxT = contentSize.height / pixelsHigh;

        self._hasPremultipliedAlpha = false;
        self._hasMipmaps = false;
        self.shaderProgram = shaderCache.programForKey(SHADER_POSITION_TEXTURE);

        self._textureLoaded = true;

        return true;
    }


    /**
     Drawing extensions to make it easy to draw basic quads using a CCTexture2D object.
     These functions require gl.TEXTURE_2D and both gl.VERTEX_ARRAY and gl.TEXTURE_COORD_ARRAY client states to be enabled.
     */

    /**
     * draws a texture at a given point
     * @param {cc.Point} point
     */
    drawAtPoint(point: Point) {
        var gl = game.renderContextWebGl;
        var self = this;
        var coordinates = [
            0.0, self.maxT,
            self.maxS, self.maxT,
            0.0, 0.0,
            self.maxS, 0.0];

        var width = self._pixelsWide * self.maxS,
            height = self._pixelsHigh * self.maxT;

        var vertices = [
            point.x, point.y, 0.0,
            width + point.x, point.y, 0.0,
            point.x, height + point.y, 0.0,
            width + point.x, height + point.y, 0.0];

        self._glProgramState.apply();
        self._glProgramState._glprogram.setUniformsForBuiltins();

        glBindTexture2D(self);

        gl.enableVertexAttribArray(VERTEX_ATTRIB_POSITION);
        gl.enableVertexAttribArray(VERTEX_ATTRIB_TEX_COORDS);
        gl.vertexAttribPointer(VERTEX_ATTRIB_POSITION, 2, gl.FLOAT, false, 0, vertices);
        gl.vertexAttribPointer(VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 0, coordinates);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    /**
     * draws a texture inside a rect
     * @param {cc.Rect} rect
     */
    drawInRect(irect: Rect) {
        var self = this;
        var coordinates = [
            0.0, self.maxT,
            self.maxS, self.maxT,
            0.0, 0.0,
            self.maxS, 0.0];

        var vertices = [irect.x, irect.y, /*0.0,*/
        irect.x + irect.width, irect.y, /*0.0,*/
        irect.x, irect.y + irect.height, /*0.0,*/
        irect.x + irect.width, irect.y + irect.height        /*0.0*/];

        self._glProgramState.apply();
        self._glProgramState._glprogram.setUniformsForBuiltins();

        glBindTexture2D(self);

        var gl = game.renderContextWebGl;
        gl.enableVertexAttribArray(VERTEX_ATTRIB_POSITION);
        gl.enableVertexAttribArray(VERTEX_ATTRIB_TEX_COORDS);
        gl.vertexAttribPointer(VERTEX_ATTRIB_POSITION, 2, gl.FLOAT, false, 0, vertices);
        gl.vertexAttribPointer(VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 0, coordinates);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }


    /**
     Extensions to make it easy to create a CCTexture2D object from an image file.
     Note that RGBA type textures will have their alpha premultiplied - use the blending mode (gl.ONE, gl.ONE_MINUS_SRC_ALPHA).
     */

    /**
     * Initializes a texture from a UIImage object
     * @param uiImage
     * @return {Boolean}
     */
    initWithImage(uiImage: UIImage): boolean {
        if (uiImage == null) {
            log(_LogInfos.Texture2D_initWithImage);
            return false;
        }

        var imageWidth = uiImage.width;
        var imageHeight = uiImage.height;

        var maxTextureSize = configuration.getMaxTextureSize();
        if (imageWidth > maxTextureSize || imageHeight > maxTextureSize) {
            log(_LogInfos.Texture2D_initWithImage_2, imageWidth, imageHeight, maxTextureSize, maxTextureSize);
            return false;
        }
        this._textureLoaded = true;

        // always load premultiplied images
        return this._initPremultipliedATextureWithImage(uiImage, imageWidth, imageHeight);
    }


    /**
     * init with HTML element
     * @param {HTMLImageElement|HTMLCanvasElement} element
     */
    initWithElement(element: UIImage) {
        if (!element)
            return;
        this._webTextureObj = game.renderContextWebGl.createTexture();
        this._htmlElementObj = element;
        this._textureLoaded = true;
        // Textures should be loaded with premultiplied alpha in order to avoid gray bleeding
        // when semitransparent textures are interpolated (e.g. when scaled).
        this._hasPremultipliedAlpha = true;
    }



    /**
     * handler of texture loaded event
     * @param {Boolean} [premultiplied=false]
     */
    handleLoadedTexture(premultiplied: boolean = false) {
        var self = this;
        premultiplied =
            (premultiplied !== undefined)
                ? premultiplied
                : self._hasPremultipliedAlpha;
        // Not sure about this ! Some texture need to be updated even after loaded
        if (!game.rendererInitialized)
            return;
        if (!self._htmlElementObj)
            return;
        if (!self._htmlElementObj.width || !self._htmlElementObj.height)
            return;

        //upload image to buffer
        var gl = game.renderContextWebGl;

        glBindTexture2D(self);

        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
        if (premultiplied)
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);

        // Specify OpenGL texture image
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, self._htmlElementObj);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        self.shaderProgram = shaderCache.programForKey(SHADER_POSITION_TEXTURE);
        glBindTexture2D(null);
        if (premultiplied)
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);

        var pixelsWide = self._htmlElementObj.width;
        var pixelsHigh = self._htmlElementObj.height;

        self._pixelsWide = self._contentSize.width = pixelsWide;
        self._pixelsHigh = self._contentSize.height = pixelsHigh;
        self._pixelFormat = PIXEL_FORMAT.RGBA8888;
        self.maxS = 1;
        self.maxT = 1;

        self._hasPremultipliedAlpha = premultiplied;
        self._hasMipmaps = false;
        if (window.ENABLE_IMAEG_POOL) {
            self._htmlElementObj = null;
        }

        //dispatch load event to listener.
        self.dispatchEvent("load");
    }


    /**
     Extensions to make it easy to create a cc.Texture2D object from a string of text.
     Note that the generated textures are of type A8 - use the blending mode (gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA).
     */
    /**
     * Initializes a texture from a string with dimensions, alignment, font name and font size (note: initWithString does not support on HTML5)
     * @param {String} text
     * @param {String | cc.FontDefinition} fontName or fontDefinition
     * @param {Number} fontSize
     * @param {cc.Size} dimensions
     * @param {Number} hAlignment
     * @param {Number} vAlignment
     * @return {Boolean}
     */
    initWithString(text: string, fontName: string, fontSize: number, dimensions: Size, hAlignment: ALIGN, vAlignment: ALIGN): boolean {
        log(_LogInfos.Texture2D_initWithString);
        return null;
    }

    /**
     * Initializes a texture from a ETC file  (note: initWithETCFile does not support on HTML5)
     * @note Compatible to Cocos2d-x
     * @param {String} file
     * @return {Boolean}
     */
    initWithETCFile(file: string): boolean {
        log(_LogInfos.Texture2D_initWithETCFile_2);
        return false;
    }

    /**
     * Initializes a texture from a PVR file
     * @param {String} file
     * @return {Boolean}
     */
    initWithPVRFile(file: string): boolean {
        log(_LogInfos.Texture2D_initWithPVRFile_2);
        return false;
    }

    /**
     Extensions to make it easy to create a Texture2D object from a PVRTC file
     Note that the generated textures don't have their alpha premultiplied - use the blending mode (gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA).
     */
    /**
     * Initializes a texture from a PVRTC buffer
     * @note compatible to cocos2d-iphone interface.
     * @param {Array} data
     * @param {Number} level
     * @param {Number} bpp
     * @param {Boolean} hasAlpha
     * @param {Number} length
     * @param {Number} pixelFormat
     * @return {Boolean}
     */
    initWithPVRTCData(data: Array<any>, level: number, bpp: number, hasAlpha: boolean, length: number, pixelFormat: PIXEL_FORMAT): boolean {
        log(_LogInfos.Texture2D_initWithPVRTCData_2);
        return false;
    }

    /**
     * sets the min filter, mag filter, wrap s and wrap t texture parameters. <br/>
     * If the texture size is NPOT (non power of 2), then in can only use gl.CLAMP_TO_EDGE in gl.TEXTURE_WRAP_{S,T}.
     * @param {Object|Number} texParams texParams object or minFilter
     * @param {Number} [magFilter]
     * @param {Number} [wrapS]
     * @param {Number} [wrapT]
     */
    setTexParameters(texParams: number | any, magFilter: number, wrapS: number, wrapT: number) {
        var _t = this;
        var gl = game.renderContextWebGl;

        if (magFilter !== undefined)
            texParams = { minFilter: texParams, magFilter: magFilter, wrapS: wrapS, wrapT: wrapT };

        assert((_t._pixelsWide === NextPOT(_t._pixelsWide) && _t._pixelsHigh === NextPOT(_t._pixelsHigh)) ||
            (texParams.wrapS === gl.CLAMP_TO_EDGE && texParams.wrapT === gl.CLAMP_TO_EDGE),
            "WebGLRenderingContext.CLAMP_TO_EDGE should be used in NPOT textures");

        glBindTexture2D(_t);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texParams.minFilter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texParams.magFilter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, texParams.wrapS);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, texParams.wrapT);
    }


    /**
     * sets antialias texture parameters:              <br/>
     *  - GL_TEXTURE_MIN_FILTER = GL_NEAREST           <br/>
     *  - GL_TEXTURE_MAG_FILTER = GL_NEAREST
     */
    setAntiAliasTexParameters() {
        var gl = game.renderContextWebGl;

        glBindTexture2D(this);
        if (!this._hasMipmaps)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        else
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }
    /**
         *  sets alias texture parameters:
         *   GL_TEXTURE_MIN_FILTER = GL_NEAREST
         *   GL_TEXTURE_MAG_FILTER = GL_NEAREST
         */
    setAliasTexParameters() {
        var gl = game.renderContextWebGl;

        glBindTexture2D(this);
        if (!this._hasMipmaps)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        else
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }
    /**
         *  Generates mipmap images for the texture.<br/>
         *  It only works if the texture size is POT (power of 2).
         */
    generateMipmap() {
        var _t = this;
        assert(_t._pixelsWide === NextPOT(_t._pixelsWide) && _t._pixelsHigh === NextPOT(_t._pixelsHigh), "Mimpap texture only works in POT textures");

        glBindTexture2D(_t);
        game.renderContextWebGl.generateMipmap(game.renderContextWebGl.TEXTURE_2D);
        _t._hasMipmaps = true;
    }


    /**
     * returns the pixel format.
     * @return {String}
     */
    stringForFormat():string {
        return PIXEL_FORMAT[this._pixelFormat];
    }

    /**
     * returns the bits-per-pixel of the in-memory OpenGL texture
     * @return {Number}
     */
    bitsPerPixelForFormat(format:PIXEL_FORMAT) {//TODO I want to delete the format argument, use this._pixelFormat
        format = format || this._pixelFormat;
        var value = Texture2D_B[format];
        if (value != null) return value;
        log(_LogInfos.Texture2D_bitsPerPixelForFormat, format);
        return -1;
    }

    _initPremultipliedATextureWithImage(uiImage: UIImage, width: number, height: number) {
        //uiImage = <HTMLImageElement>uiImage;
        //var tex2d = Texture2D;
        var tempData = uiImage.getData();
        var inPixel32 = null;
        var inPixel8 = null;
        var outPixel16 = null;
        var hasAlpha = uiImage.hasAlpha();
        var imageSize = size(uiImage.getWidth(), uiImage.getHeight());
        var pixelFormat = Texture2D.defaultPixelFormat;
        var bpp = uiImage.getBitsPerComponent();

        // compute pixel format
        if (!hasAlpha) {
            if (bpp >= 8) {
                pixelFormat = PIXEL_FORMAT.RGB888;
            } else {
                log(_LogInfos.Texture2D__initPremultipliedATextureWithImage);
                pixelFormat = PIXEL_FORMAT.RGB565;
            }
        }

        // Repack the pixel data into the right format
        var i, length = width * height;

        if (pixelFormat === PIXEL_FORMAT.RGB565) {
            if (hasAlpha) {
                // Convert "RRRRRRRRRGGGGGGGGBBBBBBBBAAAAAAAA" to "RRRRRGGGGGGBBBBB"
                tempData = new Uint16Array(width * height);
                inPixel32 = uiImage.getData();

                for (i = 0; i < length; ++i) {
                    tempData[i] =
                        ((((inPixel32[i] >> 0) & 0xFF) >> 3) << 11) | // R
                        ((((inPixel32[i] >> 8) & 0xFF) >> 2) << 5) | // G
                        ((((inPixel32[i] >> 16) & 0xFF) >> 3) << 0);    // B
                }
            } else {
                // Convert "RRRRRRRRRGGGGGGGGBBBBBBBB" to "RRRRRGGGGGGBBBBB"
                tempData = new Uint16Array(width * height);
                inPixel8 = uiImage.getData();

                for (i = 0; i < length; ++i) {
                    tempData[i] =
                        (((inPixel8[i] & 0xFF) >> 3) << 11) | // R
                        (((inPixel8[i] & 0xFF) >> 2) << 5) | // G
                        (((inPixel8[i] & 0xFF) >> 3) << 0);    // B
                }
            }
        } else if (pixelFormat === PIXEL_FORMAT.RGBA4444) {
            // Convert "RRRRRRRRRGGGGGGGGBBBBBBBBAAAAAAAA" to "RRRRGGGGBBBBAAAA"
            tempData = new Uint16Array(width * height);
            inPixel32 = uiImage.getData();

            for (i = 0; i < length; ++i) {
                tempData[i] =
                    ((((inPixel32[i] >> 0) & 0xFF) >> 4) << 12) | // R
                    ((((inPixel32[i] >> 8) & 0xFF) >> 4) << 8) | // G
                    ((((inPixel32[i] >> 16) & 0xFF) >> 4) << 4) | // B
                    ((((inPixel32[i] >> 24) & 0xFF) >> 4) << 0);  // A
            }
        } else if (pixelFormat === PIXEL_FORMAT.RGB5A1) {
            // Convert "RRRRRRRRRGGGGGGGGBBBBBBBBAAAAAAAA" to "RRRRRGGGGGBBBBBA"
            tempData = new Uint16Array(width * height);
            inPixel32 = uiImage.getData();

            for (i = 0; i < length; ++i) {
                tempData[i] =
                    ((((inPixel32[i] >> 0) & 0xFF) >> 3) << 11) | // R
                    ((((inPixel32[i] >> 8) & 0xFF) >> 3) << 6) | // G
                    ((((inPixel32[i] >> 16) & 0xFF) >> 3) << 1) | // B
                    ((((inPixel32[i] >> 24) & 0xFF) >> 7) << 0);  // A
            }
        } else if (pixelFormat === PIXEL_FORMAT.A8) {
            // Convert "RRRRRRRRRGGGGGGGGBBBBBBBBAAAAAAAA" to "AAAAAAAA"
            tempData = new Uint8Array(width * height);
            inPixel32 = uiImage.getData();

            for (i = 0; i < length; ++i) {
                tempData[i] = (inPixel32 >> 24) & 0xFF;  // A
            }
        }

        if (hasAlpha && pixelFormat === PIXEL_FORMAT.RGB888) {
            // Convert "RRRRRRRRRGGGGGGGGBBBBBBBBAAAAAAAA" to "RRRRRRRRGGGGGGGGBBBBBBBB"
            inPixel32 = uiImage.getData();
            tempData = new Uint8Array(width * height * 3);

            for (i = 0; i < length; ++i) {
                tempData[i * 3] = (inPixel32 >> 0) & 0xFF; // R
                tempData[i * 3 + 1] = (inPixel32 >> 8) & 0xFF; // G
                tempData[i * 3 + 2] = (inPixel32 >> 16) & 0xFF; // B
            }
        }

        this.initWithData(tempData, pixelFormat, width, height, imageSize);

        if (tempData != uiImage.getData())
            tempData = null;

        this._hasPremultipliedAlpha = uiImage.isPremultipliedAlpha();
        return true;
    }






}


