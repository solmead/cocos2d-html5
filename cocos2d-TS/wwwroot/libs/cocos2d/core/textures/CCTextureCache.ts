import { Dictionary } from "../../../extensions/syslibs/LinqToJs";
import { Texture2D, UIImage, getNewTexture2D } from "./CCTexture2D";
import { log, _LogInfos, assert } from "../../../startup/CCDebugger";
import { loader } from "../../../startup/CCLoader";
import { path } from "../../../startup/CCPath";
import { game, RENDER_TYPE } from "../../../startup/CCGame";
import { Texture2DCanvas } from "./TexturesCanvas";



class TextureCache {
    _textures = new Dictionary<string, Texture2D>();
    _textureColorsCache = new Dictionary<string, Array<UIImage>>();
    _textureKeySeq = (0 | Math.random() * 1000);

    _loadedTexturesBefore = new Dictionary<string, Texture2D>();



    constructor() {

    }

    _initializingRenderer() {
        var selPath;
        //init texture from _loadedTexturesBefore
        var locLoadedTexturesBefore = this._loadedTexturesBefore
        var locTextures = this._textures;
        for (selPath in locLoadedTexturesBefore.keys) {
            var tex2d = locLoadedTexturesBefore.get(selPath);
            tex2d.handleLoadedTexture();
            locTextures.set(selPath, tex2d);
        }
        this._loadedTexturesBefore = new Dictionary<string, Texture2D>();
    }
    /**
     * <p>
     *     Returns a Texture2D object given an PVR filename                                                              <br/>
     *     If the file image was not previously loaded, it will create a new CCTexture2D                                 <br/>
     *     object and it will return it. Otherwise it will return a reference of a previously loaded image              <br/>
     *     note: AddPVRTCImage does not support on HTML5
     * </p>
     * @param {String} filename
     * @return {cc.Texture2D}
     */
    addPVRTCImage(filename: string): Texture2D {
        log(_LogInfos.textureCache_addPVRTCImage);
        return null;
    }
    /**
     * <p>
     *     Returns a Texture2D object given an ETC filename                                                               <br/>
     *     If the file image was not previously loaded, it will create a new CCTexture2D                                  <br/>
     *     object and it will return it. Otherwise it will return a reference of a previously loaded image                <br/>
     *    note:addETCImage does not support on HTML5
     * </p>
     * @param {String} filename
     * @return {cc.Texture2D}
     */
    addETCImage(filename: string): Texture2D {
        log(_LogInfos.textureCache_addETCImage);
        return null;
    }

    /**
     * Description
     * @return {String}
     */
    description(): string {
        return "<TextureCache | Number of textures = " + this._textures.length + ">";
    }
    /**
     * Returns an already created texture. Returns null if the texture doesn't exist.
     * @param {String} textureKeyName
     * @return {cc.Texture2D|Null}
     * @deprecated
     * @example
     * //example
     * var key = cc.textureCache.textureForKey("hello.png");
     */
    textureForKey(textureKeyName: string): Texture2D {
        log(_LogInfos.textureCache_textureForKey);
        return this.getTextureForKey(textureKeyName);
    }
    /**
     * Returns an already created texture. Returns null if the texture doesn't exist.
     * @param {String} textureKeyName
     * @return {cc.Texture2D|Null}
     * @example
     * //example
     * var key = cc.textureCache.getTextureForKey("hello.png");
     */
    getTextureForKey(textureKeyName: string): Texture2D {
        return this._textures.get(textureKeyName) || this._textures.get(loader._getAliase(textureKeyName));
    }
    /**
     * @param {Image} texture
     * @return {String|Null}
     * @example
     * //example
     * var key = cc.textureCache.getKeyByTexture(texture);
     */
    getKeyByTexture(texture: Texture2D): string {
        for (var key in this._textures.keys) {
            if (this._textures.get(key) === texture) {
                return key;
            }
        }
        return null;
    }

    _generalTextureKey(id: string): string {
        return "_textureKey_" + id;
    }

    /**
     * @param {Image} texture
     * @return {Array}
     * @example
     * //example
     * var cacheTextureForColor = cc.textureCache.getTextureColors(texture);
     */
    getTextureColors(texture: Texture2D): Array<UIImage> {
        var image = texture._htmlElementObj;
        var key = this.getKeyByTexture(texture);
        if (!key) {
            if (image instanceof HTMLImageElement)
                key = image.src;
            else
                key = this._generalTextureKey('' + texture.__instanceId);
        }

        if (!this._textureColorsCache.get(key))
            this._textureColorsCache.set(key, (<Texture2DCanvas>texture)._generateTextureCacheForColor());
        return this._textureColorsCache.get(key);
    }


    /**
     * <p>Returns a Texture2D object given an PVR filename<br />
     * If the file image was not previously loaded, it will create a new Texture2D<br />
     *  object and it will return it. Otherwise it will return a reference of a previously loaded image </p>
     * @param {String} path
     * @return {cc.Texture2D}
     */
    addPVRImage(path: string): Texture2D {
        log(_LogInfos.textureCache_addPVRImage);
        return null;
    }

    /**
     * <p>Purges the dictionary of loaded textures. <br />
     * Call this method if you receive the "Memory Warning"  <br />
     * In the short term: it will free some resources preventing your app from being killed  <br />
     * In the medium term: it will allocate more resources <br />
     * In the long term: it will be the same</p>
     * @example
     * //example
     * cc.textureCache.removeAllTextures();
     */
    removeAllTextures(): void {
        var locTextures = this._textures;
        for (var selKey in locTextures.keys) {
            if (locTextures.get(selKey))
                locTextures.get(selKey).releaseTexture();
        }
        this._textures = new Dictionary<string, Texture2D>();
    }

    /**
     * Deletes a texture from the cache given a texture
     * @param {Image} texture
     * @example
     * //example
     * cc.textureCache.removeTexture(texture);
     */
    removeTexture(texture: Texture2D): void {
        if (!texture)
            return;

        var locTextures = this._textures;
        for (var selKey in locTextures.keys) {
            if (locTextures.get(selKey) === texture) {
                locTextures.get(selKey).releaseTexture();
                locTextures.remove(selKey)
                //delete (locTextures[selKey]);
            }
        }
    }

    /**
     * Deletes a texture from the cache given a its key name
     * @param {String} textureKeyName
     * @example
     * //example
     * cc.textureCache.removeTexture("hello.png");
     */
    removeTextureForKey(textureKeyName: string): void {
        if (textureKeyName == null)
            return;
        var tex = this._textures.get(textureKeyName);
        if (tex) {
            tex.releaseTexture();
            this._textures.remove(textureKeyName);

            //delete (this._textures[textureKeyName]);
        }
    }

    //addImage move to Canvas/WebGL

    /**
     *  Cache the image data
     * @param {String} path
     * @param {Image|HTMLImageElement|HTMLCanvasElement} texture
     */
    cacheImage(path: string, texture: UIImage | Texture2D) {
        if (texture instanceof Texture2D) {
            this._textures.set(path, texture);
            return;
        }
        var texture2d = getNewTexture2D();// new cc.Texture2D();
        texture2d.initWithElement(texture);
        texture2d.handleLoadedTexture();
        this._textures.set(path, texture2d);
    }

    /**
     * <p>Returns a Texture2D object given an UIImage image<br />
     * If the image was not previously loaded, it will create a new Texture2D object and it will return it.<br />
     * Otherwise it will return a reference of a previously loaded image<br />
     * The "key" parameter will be used as the "key" for the cache.<br />
     * If "key" is null, then a new texture will be created each time.</p>
     * @param {HTMLImageElement|HTMLCanvasElement} image
     * @param {String} key
     * @return {cc.Texture2D}
     */
    addUIImage(image: UIImage, key: string = null): Texture2D {
        assert(!!image, _LogInfos.textureCache_addUIImage_2);

        if (key) {
            if (this._textures.containsKey(key))
                return this._textures.get(key);
        }

        // prevents overloading the autorelease pool
        var texture = getNewTexture2D();// new cc.Texture2D();
        texture.initWithImage(image);
        if (key != null)
            this._textures.set(key, texture);
        else
            log(_LogInfos.textureCache_addUIImage);
        return texture;
    }

    /**
     * <p>Output to cc.log the current contents of this TextureCache <br />
     * This will attempt to calculate the size of each texture, and the total texture memory in use. </p>
     */
    dumpCachedTextureInfo(): void {
        var count = 0;
        var totalBytes = 0, locTextures = this._textures;

        for (var key in locTextures.keys) {
            var selTexture = locTextures.get(key);
            count++;
            if (selTexture.getHtmlElementObj() instanceof HTMLImageElement)
                log(_LogInfos.textureCache_dumpCachedTextureInfo, key, (<HTMLImageElement>selTexture.getHtmlElementObj()).src, selTexture.getPixelsWide(), selTexture.getPixelsHigh());
            else {
                log(_LogInfos.textureCache_dumpCachedTextureInfo_2, key, selTexture.getPixelsWide(), selTexture.getPixelsHigh());
            }
            totalBytes += selTexture.getPixelsWide() * selTexture.getPixelsHigh() * 4;
        }

        var locTextureColorsCache = this._textureColorsCache;
        for (key in locTextureColorsCache.keys) {
            var selCanvasColorsArr = locTextureColorsCache.get(key);
            for (var i = 0; i < selCanvasColorsArr.length;i++) {
                var selCanvas = selCanvasColorsArr[i];
                count++;
                log(_LogInfos.textureCache_dumpCachedTextureInfo_2, key, selCanvas.width, selCanvas.height);
                totalBytes += selCanvas.width * selCanvas.height * 4;
            }

        }
        log(_LogInfos.textureCache_dumpCachedTextureInfo_3, count, totalBytes / 1024, (totalBytes / (1024.0 * 1024.0)).toFixed(2));
    }

    _clear(): void {
        this._textures = new Dictionary<string, Texture2D>();
        this._textureColorsCache = new Dictionary<string, Array<UIImage>>();
        this._textureKeySeq = (0 | Math.random() * 1000);
        this._loadedTexturesBefore = new Dictionary<string, Texture2D>();
    }




    handleLoadedTexture = (url: string, img: UIImage): Texture2D => {
        var locTexs = this._textures;


        if (game.renderType != RENDER_TYPE.CANVAS) {
            if (!game.rendererInitialized) {
                locTexs = this._loadedTexturesBefore;
            }
        }

        //remove judge
        var tex = locTexs.get(url);
        if (!tex) {
            tex = getNewTexture2D();
            tex.url = url;
            locTexs.set(url, tex);
        }
        tex.initWithElement(img);
        var ext = path.extname(url);
        if (ext === ".png") {
            tex.handleLoadedTexture(true);
        }
        else {
            tex.handleLoadedTexture();
        }
        return tex;
    }


    /**
     * <p>Returns a Texture2D object given an file image <br />
     * If the file image was not previously loaded, it will create a new Texture2D <br />
     *  object and it will return it. It will use the filename as a key.<br />
     * Otherwise it will return a reference of a previously loaded image. <br />
     * Supported image extensions: .png, .jpg, .gif</p>
     * @param {String} url
     * @param {Function} cb
     * @param {Object} target
     * @return {cc.Texture2D}
     * @example
     * //example
     * cc.textureCache.addImage("hello.png");
     */
    addImageAsync = async (url:string, target?:UIImage):Promise<Texture2D> => {

        assert(!!url, _LogInfos.Texture2D_addImage);

        var locTexs = this._textures;

        if (game.renderType != RENDER_TYPE.CANVAS) {
            if (!game.rendererInitialized) {
                locTexs = this._loadedTexturesBefore;
            }
        }
        //remove judge
        var tex = locTexs.get(url) || locTexs.get(loader._getAliase(url));
        if (tex) {
            if (tex.isLoaded()) {
                return tex;
            }
            else {
                var p = new Promise<Texture2D>((resolve, reject) => {
                    tex.addEventListener("load", () => {
                        resolve(tex);
                    }, target);

                });
                tex = await p;
                return tex;
            }
        }

        tex = getNewTexture2D();
        tex.url = url;
        locTexs.set(url, tex);
        var basePath = loader.resPath;
        var img = await loader.loadImgAsync(path.join(basePath || "", url));
        var texResult = this.handleLoadedTexture(url, img);

        return texResult;
    }





}


export var textureCache = new TextureCache();
