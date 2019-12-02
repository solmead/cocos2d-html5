import { game, RENDER_TYPE } from "./CCGame";
import { path } from "./CCPath";
import * as images from "../Base64Images";
import { error, log } from "./CCDebugger";
import { sys } from "./CCSys";
import { Dictionary } from "../extensions/syslibs/LinqToJs";
import { Texture2D, UIImage } from "../cocos2d/core/textures/CCTexture2D";
import { WhenAll } from "../extensions/syslibs/Tasks";

declare global {
    interface Window {
        requestAnimFrame: (callback: () => void) => number;
        gl: RenderingContext;
        ENABLE_IMAEG_POOL: boolean
    }
}
//+++++++++++++++++++++++++something about loader start+++++++++++++++++++++++++++

class ImagePool {

    public _pool: Array<HTMLImageElement> = new Array<HTMLImageElement>(10);
    public _MAX: number = 10;
    public _smallImg: string = "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";
    public count: number = 0;
    public get(): HTMLImageElement {
        if (this.count > 0) {
            this.count--;
            var result = this._pool[this.count];
            this._pool[this.count] = null;
            return result;
        }
        else {
            return new Image();
        }
    }
    public put(img: HTMLImageElement): void {
        var pool = this._pool;
        if (img instanceof HTMLImageElement && this.count < this._MAX) {
            img.src = this._smallImg;
            pool[this.count] = img;
            this.count++;
        }
    }

    constructor() {

    }
}
export var imagePool = new ImagePool();

export interface ILoader {
    loadAsync(realUrl: string, url: string, res: any): Promise<iResource>;
    getBasePath(): string;
}

export interface iAliasMap {
    filenames: Array<string>;
}

export type iResource = boolean | string | iAliasMap | UIImage | Texture2D | Uint8Array;


interface QueueItem {
    callbacks: Array<(err?: any, data?: iResource) => void>;
    img: iResource;
}

var _jsCache = new Dictionary<string, boolean>(), //cache for js
    _register = new Dictionary<string, ILoader>(), //register of loaders
    _langPathCache = new Dictionary<string, string>(), //cache for lang path
    _aliases = new Dictionary<string, string>(), //aliases for res url
    _queue = new Dictionary<string, QueueItem>(), // Callback queue for resources already loading
    _urlRegExp:RegExp = new RegExp("^(?:https?|ftp)://\\S*$", "i");

//interface Args4js {
//    baseDir: string;
//    jsList: Array<string>;
//    callback: (err: string) => void;
//}

interface iLoadResourceItem {
    type: string;
    src: string;
    name: string;
}


class Loader {



    constructor() {

    }
    private _noCacheRex:RegExp = /\?/;
    /**
    * Root path of resources.
    * @type { String }
    */
    resPath:string = "";

    /**
     * Root path of audio resources
     * @type {String}
     */
    audioPath: string = "";

    /**
     * Cache for data loaded.
     * @type {Object}
     */
    cache = new Dictionary<string, iResource>();
    /**
         * Get XMLHttpRequest.
         * @returns {XMLHttpRequest}
         */
    public getXMLHttpRequest(): XMLHttpRequest {
        var xhr = window.XMLHttpRequest ? new window.XMLHttpRequest() : new ActiveXObject("MSXML2.XMLHTTP");
        xhr.timeout = 10000;
        if (xhr.ontimeout === undefined) {
            xhr._timeoutId = -1;
        }
        return xhr;
    }


    //@MODE_BEGIN DEV

    //private _getArgs4Js(baseDir: string): Args4js;
    //private _getArgs4Js(baseDirs: Array<string>): Args4js;
    //private _getArgs4Js(baseDirs: string, callback: ((err?: string) => void)): Args4js;
    //private _getArgs4Js(baseDirs: Array<string>, callback: ((err?: string) => void)): Args4js;
    //private _getArgs4Js(baseDir: string, jsList: Array<string>): Args4js;
    //private _getArgs4Js(baseDir: string, jsList: Array<string>, callback: ((err?: string) => void)): Args4js;
    //private _getArgs4Js(a0: Array<string> | string, a1: ((err?: string) => void) | Array<string> = null, a2: ((err?: string) => void) = null): Args4js {
    //    //var a0 = args[0];
    //    //var a1 = args[1];
    //    //var a2 = args[2];
    //    var results: Args4js = <Args4js> {
    //    }

    //    if (!a1) {
    //        results.jsList = a0 instanceof Array ? a0 : [a0];
    //    } else if (!a2) {
    //        if (typeof a1 === "function") {
    //            results.jsList = a0 instanceof Array ? a0 : [a0];
    //            results.callback = a1;
    //        } else {
    //            results.baseDir = <string>a0 || "";
    //            results.jsList = a1 instanceof Array ? a1 : [a1];
    //        }
    //    } else if (a2) {
    //        results.baseDir = <string>a0 || "";
    //        results.jsList = <Array<string>>(a1 instanceof Array ? a1 : [a1]);
    //        results.callback = a2;
    //    } else throw new Error("arguments error to load js!");
    //    return results;
    //}

    public isLoading(url: string): boolean {
        return (_queue.get(url) !== undefined);
    }


    /**
     * Load js files.
     * If the third parameter doesn't exist, then the baseDir turns to be "".
     *
     * @param {string} [baseDir]   The pre path for jsList or the list of js path.
     * @param {array} jsList    List of js path.
     * @param {function} [cb]  Callback function
     * @returns {*}
     */
    public async loadJsAsync(baseDir: string, jsList: Array<string>): Promise<void> {
        //var args4Js = this._getArgs4Js(baseDir, jsList, cb);

        var preDir = baseDir;//args4Js.baseDir;
        var list = jsList;//args4Js.jsList;
        //var callback = args4Js.callback;
        if (navigator.userAgent.indexOf("Trident/5") > -1) {
            await this._loadJs4DependencyAsync(preDir, list, 0);
        } else {
            for (var i = 0; i < list.length; i++) {
                var item = list[i];

                var jsPath = path.join(preDir, item);
                if (!_jsCache.get(jsPath)) {
                    await this._createScriptAsync(jsPath, false);
                }
            }
        }
    }
    /**
         * Load js width loading image.
         *
         * @param {string} [baseDir]
         * @param {array} jsList
         * @param {function} [cb]
         */
    public async loadJsWithImgAsync(baseDir: string, jsList: Array<string>): Promise<void> {
        var jsLoadingImg = this._loadJsImg();
        //var args4Js = this._getArgs4Js(baseDir, jsList, cb);
        await this.loadJsAsync(baseDir, jsList);
        jsLoadingImg.parentNode.removeChild(jsLoadingImg);
        //, (err: string) => {
        //    if (err) throw new Error(err);
        //    jsLoadingImg.parentNode.removeChild(jsLoadingImg);//remove loading gif
        //    if (args4Js.callback) args4Js.callback(err);
        //});
    }
    private async _createScriptAsync(jsPath: string, isAsync: boolean): Promise<void> {
        var p = new Promise<void>((resolve, reject) => {

            var d = document;
            var s = document.createElement('script');
            s.async = isAsync;
            _jsCache.add(jsPath, true);
            if (game.config.noCache && typeof jsPath === "string") {
                if (this._noCacheRex.test(jsPath))
                    s.src = jsPath + "&_t=" + ((new Date()).getTime() - 0);
                else
                    s.src = jsPath + "?_t=" + ((new Date()).getTime() - 0);
            } else {
                s.src = jsPath;
            }
            var loadListener = () => {
                s.parentNode.removeChild(s);
                s.removeEventListener('load', loadListener, false);
                resolve();
            }
            s.addEventListener('load', loadListener , false);
            s.addEventListener('error', ()=> {
                s.parentNode.removeChild(s);
                reject("Load " + jsPath + " failed!");
            }, false);
            d.body.appendChild(s);

        });
        //});

        return p;

    }
    private async _loadJs4DependencyAsync(baseDir: string, jsList: Array<string>, index: number): Promise<void> {
        if (index >= jsList.length) {
            return;
        }

        await this._createScriptAsync(path.join(baseDir, jsList[index]), false);

        await this._loadJs4DependencyAsync(baseDir, jsList, index + 1);
    }
    private _loadJsImg(): HTMLImageElement {
        var d = document;
        var jsLoadingImg: HTMLImageElement = <HTMLImageElement>d.getElementById("cocos2d_loadJsImg");
        if (!jsLoadingImg) {
            jsLoadingImg = <HTMLImageElement>document.createElement('img');

            if (images._loadingImage)
                jsLoadingImg.src = images._loadingImage;

            var canvasNode = <HTMLCanvasElement> d.getElementById(game.config.id);
            canvasNode.style.backgroundColor = "transparent";
            canvasNode.parentNode.appendChild(jsLoadingImg);

            var canvasStyle = getComputedStyle ? getComputedStyle(canvasNode) : (<any>canvasNode).currentStyle;
            if (!canvasStyle)
                canvasStyle = { width: canvasNode.width, height: canvasNode.height };
            jsLoadingImg.style.left = canvasNode.offsetLeft + (parseFloat(canvasStyle.width) - jsLoadingImg.width) / 2 + "px";
            jsLoadingImg.style.top = canvasNode.offsetTop + (parseFloat(canvasStyle.height) - jsLoadingImg.height) / 2 + "px";
            jsLoadingImg.style.position = "absolute";
        }
        return jsLoadingImg;
    }
    //@MODE_END DEV

    /**
     * Load a single resource as txt.
     * @param {string} url
     * @param {function} [cb] arguments are : err, txt
     */
    public async loadTxtAsync(url: string):Promise<string> {
        var p = new Promise<string>((resolve, reject) => {
            var xhr = this.getXMLHttpRequest(),
                errInfo = "load " + url + " failed!";
            xhr.open("GET", url, true);
            if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
                // IE-specific logic here
                xhr.setRequestHeader("Accept-Charset", "utf-8");
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4)
                        (xhr.status === 200 || xhr.status === 0) ? resolve(xhr.responseText) : reject({ status: xhr.status, errorMessage: errInfo });
                };
            } else {
                if (xhr.overrideMimeType) xhr.overrideMimeType("text\/plain; charset=utf-8");
                var loadCallback = () => {
                    xhr.removeEventListener('load', loadCallback);
                    xhr.removeEventListener('error', errorCallback);
                    if ((<any>xhr)._timeoutId >= 0) {
                        clearTimeout((<any>xhr)._timeoutId);
                    }
                    else {
                        xhr.removeEventListener('timeout', timeoutCallback);
                    }
                    if (xhr.readyState === 4) {
                        (xhr.status === 200 || xhr.status === 0) ? resolve(xhr.responseText) : reject({ status: xhr.status, errorMessage: errInfo });
                    }
                };
                var errorCallback = () => {
                    xhr.removeEventListener('load', loadCallback);
                    xhr.removeEventListener('error', errorCallback);
                    if ((<any>xhr)._timeoutId >= 0) {
                        clearTimeout((<any>xhr)._timeoutId);
                    }
                    else {
                        xhr.removeEventListener('timeout', timeoutCallback);
                    }
                    reject({ status: xhr.status, errorMessage: errInfo });
                };
                var timeoutCallback = () => {
                    xhr.removeEventListener('load', loadCallback);
                    xhr.removeEventListener('error', errorCallback);
                    if ((<any>xhr)._timeoutId >= 0) {
                        clearTimeout((<any>xhr)._timeoutId);
                    }
                    else {
                        xhr.removeEventListener('timeout', timeoutCallback);
                    }
                    reject({ status: xhr.status, errorMessage: "Request timeout: " + errInfo });
                };
                xhr.addEventListener('load', loadCallback);
                xhr.addEventListener('error', errorCallback);
                if (xhr.ontimeout === undefined) {
                    (<any>xhr)._timeoutId = setTimeout(() => {
                        timeoutCallback();
                    }, xhr.timeout);
                }
                else {
                    xhr.addEventListener('timeout', timeoutCallback);
                }
            }
            xhr.send(null);
        });
        return p;
    }

    public async loadCsbAsync(url: string): Promise<string> {
        var p = new Promise<string>((resolve, reject) => {
            var xhr = loader.getXMLHttpRequest(),
                errInfo = "load " + url + " failed!";
            xhr.open("GET", url, true);
            xhr.responseType = "arraybuffer";

            var loadCallback = () => {
                xhr.removeEventListener('load', loadCallback);
                xhr.removeEventListener('error', errorCallback);
                if ((<any>xhr)._timeoutId >= 0) {
                    clearTimeout((<any>xhr)._timeoutId);
                }
                else {
                    xhr.removeEventListener('timeout', timeoutCallback);
                }
                var arrayBuffer = xhr.response; // Note: not oReq.responseText
                if (arrayBuffer) {
                    (<any>window).msg = arrayBuffer;
                }
                if (xhr.readyState === 4) {
                    (xhr.status === 200 || xhr.status === 0) ? resolve(xhr.response) : reject({ status: xhr.status, errorMessage: errInfo });
                }
            };
            var errorCallback = () => {
                xhr.removeEventListener('load', loadCallback);
                xhr.removeEventListener('error', errorCallback);
                if ((<any>xhr)._timeoutId >= 0) {
                    clearTimeout((<any>xhr)._timeoutId);
                }
                else {
                    xhr.removeEventListener('timeout', timeoutCallback);
                }
                reject({ status: xhr.status, errorMessage: errInfo });
            };
            var timeoutCallback = () => {
                xhr.removeEventListener('load', loadCallback);
                xhr.removeEventListener('error', errorCallback);
                if ((<any>xhr)._timeoutId >= 0) {
                    clearTimeout((<any>xhr)._timeoutId);
                }
                else {
                    xhr.removeEventListener('timeout', timeoutCallback);
                }
                reject({ status: xhr.status, errorMessage: "Request timeout: " + errInfo });
            };
            xhr.addEventListener('load', loadCallback);
            xhr.addEventListener('error', errorCallback);
            if (xhr.ontimeout === undefined) {
                (<any>xhr)._timeoutId = setTimeout(function () {
                    timeoutCallback();
                }, xhr.timeout);
            }
            else {
                xhr.addEventListener('timeout', timeoutCallback);
            }
            xhr.send(null);
        });
        return p;
    }

    /**
         * Load a single resource as json.
         * @param {string} url
         * @param {function} [cb] arguments are : err, json
         */
    public async loadJsonAsync<dataType>(url: string): Promise<dataType> {
        var txt = await this.loadTxtAsync(url);
        var result: dataType = JSON.parse(txt);
        return result;
    }
    private _checkIsImageURL(url: string): boolean {
        var ext = /(\.png)|(\.jpg)|(\.bmp)|(\.jpeg)|(\.gif)/.exec(url);
        return (ext != null);
    }

    /**
         * Load a single image.
         * @param {!string} url
         * @param {object} [option]
         * @param {function} callback
         * @returns {Image}
         */
    public async loadImgAsync(url: string, isCrossOrigin: boolean=false, img: HTMLImageElement = null): Promise<HTMLImageElement> {


        var p = new Promise<HTMLImageElement>((resolve, reject) => {
            var opt = {
                isCrossOrigin: true
            };

            opt.isCrossOrigin = isCrossOrigin === undefined ? opt.isCrossOrigin : isCrossOrigin;


            var texture = this.getRes(url);
            if (texture) {
                return texture;
            }

            var callback = (err: any, img: HTMLImageElement) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(img);
                }
            };

            var queue = _queue.get(url);
            if (queue) {
                queue.callbacks.push(callback);
                return;
            }

            img = img || imagePool.get();
            if (opt.isCrossOrigin && location.origin !== "file://")
                img.crossOrigin = "Anonymous";
            else
                img.crossOrigin = null;

            var loadCallback = () => {
                img.removeEventListener('load', loadCallback, false);
                img.removeEventListener('error', errorCallback, false);

                var queue = _queue.get(url);
                if (queue) {
                    var callbacks = queue.callbacks;
                    for (var i = 0; i < callbacks.length; ++i) {
                        var cb = callbacks[i];
                        if (cb) {
                            cb(img);
                        }
                    }
                    queue.img = null;
                    _queue.remove(url);
                    //delete _queue[url];
                }

                if (window.ENABLE_IMAEG_POOL && game.renderType === RENDER_TYPE.WEBGL) {
                    imagePool.put(img);
                }
            };

            var errorCallback = () => {
                img.removeEventListener('load', loadCallback, false);
                img.removeEventListener('error', errorCallback, false);

                if (window.location.protocol !== 'https:' && img.crossOrigin && img.crossOrigin.toLowerCase() === "anonymous") {
                    opt.isCrossOrigin = false;
                    this.release(url);
                    var img2 = loader.loadImgAsync(url, opt.isCrossOrigin, img);
                    img2.then((im) => {
                        callback(null, im);
                    });
                } else {
                    var queue = _queue.get(url);
                    if (queue) {
                        var callbacks = queue.callbacks;
                        for (var i = 0; i < callbacks.length; ++i) {
                            var cb = callbacks[i];
                            if (cb) {
                                cb("load image failed");
                            }
                        }
                        queue.img = null;
                        _queue.remove(url);
                        //delete _queue[url];
                    }

                    if (game.renderType === RENDER_TYPE.WEBGL) {
                        imagePool.put(img);
                    }
                }
            };

            _queue.add(url, {
                img: img,
                callbacks: callback ? [callback] : []
            });

            img.addEventListener("load", loadCallback);
            img.addEventListener("error", errorCallback);
            img.src = url;
            return;
        });

        return p;
    }



    /**
     * Iterator function to load res
     * @param {object} item
     * @param {number} index
     * @param {function} [cb]
     * @returns {*}
     * @private
     */

    private async _loadResIteratorAsync(item: iLoadResourceItem | string, index: number): Promise<iResource> {
        var url: string = null;

        var it = <iLoadResourceItem>item;

        var type = it.type;
        if (type) {
            type = "." + type.toLowerCase();
            url = it.src ? it.src : it.name + type;
        } else {
            url = <string>item;
            type = path.extname(url);
        }

        var obj = this.getRes(url);
        if (obj)
            return obj;
        var loader: ILoader = null;
        if (type) {
            loader = _register.get(type.toLowerCase());
        }
        if (!loader) {
            error("loader for [" + type + "] doesn't exist!");
            return null;
        }
        var realUrl = url;
        if (!_urlRegExp.test(url)) {
            var basePath = loader.getBasePath ? loader.getBasePath() : this.resPath;
            realUrl = this.getUrl(basePath, url);
        }

        if (game.config.noCache && typeof realUrl === "string") {
            if (this._noCacheRex.test(realUrl))
                realUrl += "&_t=" + ((new Date()).getTime() - 0);
            else
                realUrl += "?_t=" + ((new Date()).getTime() - 0);
        }


        var data = await loader.loadAsync(realUrl, url, item);
        if (data == null) {
            this.cache.remove(url);
        } else {
            this.cache.add(url, data);
        }
        return data;
    }


    /**
     * Get url with basePath.
     * @param {string} basePath
     * @param {string} [url]
     * @returns {*}
     */
    public getUrl(basePath: string, url: string): string {

        if (basePath !== undefined && url === undefined) {
            url = basePath;
            var type = path.extname(url);
            type = type ? type.toLowerCase() : "";
            var loader = _register.get(type);
            if (!loader)
                basePath = this.resPath;
            else
                basePath = loader.getBasePath ? loader.getBasePath() : this.resPath;
        }
        url = path.join(basePath || "", url);
        if (url.match(/[\/(\\\\)]lang[\/(\\\\)]/i)) {
            if (_langPathCache.get(url))
                return _langPathCache.get(url);
            var extname = path.extname(url) || "";
            var url2 = url.substring(0, url.length - extname.length) + "_" + sys.language + extname;
            _langPathCache.set(url, url2);
            url = url2;
        }
        return url;
    }



    /**
     * Load resources then call the callback.
     * @param {string} resources
     * @param {function} [option] callback or trigger
     * @param {function|Object} [loadCallback]
     * @return {cc.AsyncPool}
     */
    public async loadAsync(resource: string, progressCB?: ((numFinished: number, total: number) => void)): Promise<Array<iResource>>;
    public async loadAsync(resources: Array<string>, progressCB?: ((numFinished: number, total: number) => void)): Promise<Array<iResource>>;
    public async loadAsync(resources: string | Array<string>, progressCB?: ((numFinished: number, total: number) => void)): Promise<Array<iResource>> {
        //var len = arguments.length;
        //var option:any = {};
        //if (len === 0)
        //    throw new Error("arguments error!");

        //if (len === 3) {
        //    if (typeof option === "function") {
        //        if (typeof loadCallback === "function")
        //            option = { trigger: option, cb: loadCallback };
        //        else
        //            option = { cb: option, cbTarget: loadCallback };
        //    }
        //} else if (len === 2) {
        //    if (typeof option === "function")
        //        option = { cb: option };
        //} else if (len === 1) {
        //    option = {};
        //}

        if (!(resources instanceof Array))
            resources = [resources];


        var Prs = new Array<Promise<any>>();
        for (var i = 0; i < resources.length; i++) {
            var value = resources[i];
            Prs.push(this._loadResIteratorAsync(value, i));
        }

        var res = await WhenAll<iResource>(Prs, progressCB);
        return res;

        //this._loadResIteratorAsync(value, index);


        //var asyncPool = new cc.AsyncPool(
        //    resources, cc.CONCURRENCY_HTTP_REQUEST_COUNT,
        //     (value, index, AsyncPoolCallback, aPool)=> {
        //        this._loadResIterator(value, index, function (err) {
        //            var arr = Array.prototype.slice.call(arguments, 1);
        //            if (option.trigger)
        //                option.trigger.call(option.triggerTarget, arr[0], aPool.size, aPool.finishedSize);   //call trigger
        //            AsyncPoolCallback(err, arr[0]);
        //        });
        //    },
        //    option.cb, option.cbTarget);
        //asyncPool.flow();
        //return asyncPool;


    }

    private async _handleAliasesAsync(fileNames: Array<string>):Promise<void> {
        var self = this;
        var resList = [];
        for (var key in fileNames) {
            var value = fileNames[key];
            _aliases.set(key, value);
            resList.push(value);
        }
        await this.loadAsync(resList);
    }


    /**
     * <p>
     *     Loads alias map from the contents of a filename.                                        <br/>
     *                                                                                                                 <br/>
     *     @note The plist file name should follow the format below:                                                   <br/>
     *     <?xml version="1.0" encoding="UTF-8"?>                                                                      <br/>
     *         <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">  <br/>
     *             <plist version="1.0">                                                                               <br/>
     *                 <dict>                                                                                          <br/>
     *                     <key>filenames</key>                                                                        <br/>
     *                     <dict>                                                                                      <br/>
     *                         <key>sounds/click.wav</key>                                                             <br/>
     *                         <string>sounds/click.caf</string>                                                       <br/>
     *                         <key>sounds/endgame.wav</key>                                                           <br/>
     *                         <string>sounds/endgame.caf</string>                                                     <br/>
     *                         <key>sounds/gem-0.wav</key>                                                             <br/>
     *                         <string>sounds/gem-0.caf</string>                                                       <br/>
     *                     </dict>                                                                                     <br/>
     *                     <key>metadata</key>                                                                         <br/>
     *                     <dict>                                                                                      <br/>
     *                         <key>version</key>                                                                      <br/>
     *                         <integer>1</integer>                                                                    <br/>
     *                     </dict>                                                                                     <br/>
     *                 </dict>                                                                                         <br/>
     *              </plist>                                                                                           <br/>
     * </p>
     * @param {String} url  The plist file name.
     * @param {Function} [callback]
     */
    public async loadAliasesAsync(url: string): Promise<void> {
        var dict = <iAliasMap>this.getRes(url);
        if (!dict) {
            var results = await this.loadAsync(url);
            dict = <iAliasMap>results[0];
            await this._handleAliasesAsync(dict.filenames);
        } else {
            await this._handleAliasesAsync(dict.filenames);
        }
    }


    /**
     * Register a resource loader into loader.
     * @param {string} extNames
     * @param {function} loader
     */
    public register(extNames: string | Array<string>, loader: ILoader): ILoader {
        if (!extNames || !loader) return;
        var self = this;
        if (typeof extNames === "string") {
            _register.set(extNames.trim().toLowerCase(), loader);
            return loader;
        }
        for (var i = 0, li = extNames.length; i < li; i++) {
            _register.set("." + extNames[i].trim().toLowerCase(), loader);
        }
    }
/**
         * Get resource data by url.
         * @param url
         * @returns {*}
         */
    public getRes(url: string): iResource {
        return this.cache.get(url) || this.cache.get(_aliases.get(url));
    }
    /**
         * Get aliase by url.
         * @param url
         * @returns {*}
         */
    public _getAliase(url: string): string {
        return _aliases.get(url);
    }
    /**
         * Release the cache of resource by url.
         * @param url
         */
    public release(url: string): void {
        var cache = this.cache;
        var queue = _queue.get(url);
        if (queue) {
            queue.img = null;
            _queue.remove(url);
            //delete _queue[url];
        }
        _aliases.remove(url);
        cache.remove(url);
        cache.remove(_aliases.get(url));
        //delete cache[url];
        //delete cache[_aliases[url]];
        //delete _aliases[url];
    }
    /**
         * Resource cache of all resources.
         */
    public releaseAll(): void {
        var locCache = this.cache;
        for (var key in locCache) {
            locCache.remove(key);
        }
            //delete locCache[key];
        for (var key in _aliases) {
            _aliases.remove(key);
        }
            //delete _aliases[key];
    }




    public async loadBinaryAsync(url:string):Promise<Uint8Array> {
        var p = new Promise<Uint8Array>((resolve, reject) => {
            var self = this;
            var xhr = this.getXMLHttpRequest(),
                errInfo = "load " + url + " failed!";
            xhr.open("GET", url, true);
            xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) xhr.overrideMimeType("text\/plain; charset=x-user-defined");
                xhr.onload = function () {
                    xhr.readyState === 4 && xhr.status === 200 ? resolve(new Uint8Array(xhr.response)) : reject(errInfo);
                };

            xhr.send(null);
        });
        return p;
    }


    _str2Uint8Array(strData: string): Uint8Array {
        if (!strData)
            return null;

        var arrData = new Uint8Array(strData.length);
        for (var i = 0; i < strData.length; i++) {
            arrData[i] = strData.charCodeAt(i) & 0xff;
        }
        return arrData;
    }

/**
 * Load binary data by url synchronously
 * @function
 * @param {String} url
 * @return {Uint8Array}
 */
    loadBinarySync(url: string): Uint8Array {
        var self = this;
        var req = this.getXMLHttpRequest();
        req.timeout = 0;
        var errInfo = "load " + url + " failed!";
        req.open('GET', url, false);
        var arrayInfo = null;
            if (req.overrideMimeType)
                req.overrideMimeType('text\/plain; charset=x-user-defined');
            req.send(null);
            if (req.status !== 200) {
                log(errInfo);
                return null;
            }

            arrayInfo = self._str2Uint8Array(req.responseText);

        return arrayInfo;
    }







}

export var loader = new Loader();

//+++++++++++++++++++++++++something about loader end+++++++++++++++++++++++++++++