import { _Dictionary } from "../cocos2d/core/platform/CCTypes";
import { game, RENDER_TYPE } from "./CCGame";
import { path } from "./CCPath";
import * as images from "../Base64Images";
import { error, log } from "./CCDebugger";

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
    load(realUrl: string, url: string, res: any, cb: (err: any, data: any) => void): void;
    getBasePath(): string;
}


interface QueueItem {
    callbacks: Array<(err?: any, data?: any) => void>;
    img: HTMLImageElement;
}

var _jsCache = new _Dictionary<string, boolean>(), //cache for js
    _register = new _Dictionary<string, ILoader>(), //register of loaders
    _langPathCache = new _Dictionary<string, string>(), //cache for lang path
    _aliases = new _Dictionary<string, string>(), //aliases for res url
    _queue = new _Dictionary<string, QueueItem>(), // Callback queue for resources already loading
    _urlRegExp:RegExp = new RegExp("^(?:https?|ftp)://\\S*$", "i");

interface Args4js {
    baseDir: string;
    jsList: Array<string>;
    callback: (err: string) => void;
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
    cache = new _Dictionary<string, string>();
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

    private _getArgs4Js(baseDir: string): Args4js;
    private _getArgs4Js(baseDirs: Array<string>): Args4js;
    private _getArgs4Js(baseDirs: string, callback: ((err?: string) => void)): Args4js;
    private _getArgs4Js(baseDirs: Array<string>, callback: ((err?: string) => void)): Args4js;
    private _getArgs4Js(baseDir: string, jsList: Array<string>): Args4js;
    private _getArgs4Js(baseDir: string, jsList: Array<string>, callback: ((err?: string) => void)): Args4js;
    private _getArgs4Js(a0: Array<string> | string, a1: ((err?: string) => void) | Array<string> = null, a2: ((err?: string) => void) = null): Args4js {
        //var a0 = args[0];
        //var a1 = args[1];
        //var a2 = args[2];
        var results: Args4js = <Args4js> {
        }

        if (!a1) {
            results.jsList = a0 instanceof Array ? a0 : [a0];
        } else if (!a2) {
            if (typeof a1 === "function") {
                results.jsList = a0 instanceof Array ? a0 : [a0];
                results.callback = a1;
            } else {
                results.baseDir = <string>a0 || "";
                results.jsList = a1 instanceof Array ? a1 : [a1];
            }
        } else if (a2) {
            results.baseDir = <string>a0 || "";
            results.jsList = <Array<string>>(a1 instanceof Array ? a1 : [a1]);
            results.callback = a2;
        } else throw new Error("arguments error to load js!");
        return results;
    }

    public isLoading(url: string): boolean {
        return (_queue.valueForKey(url) !== undefined);
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
    public async loadJs(baseDir: string, jsList: Array<string>, cb: (err?: string) => void): Promise<void> {
        var args4Js = this._getArgs4Js(baseDir, jsList, cb);

        var preDir = args4Js.baseDir;
        var list = args4Js.jsList;
        var callback = args4Js.callback;
        if (navigator.userAgent.indexOf("Trident/5") > -1) {
            this._loadJs4Dependency(preDir, list, 0, callback);
        } else {
            //for (var i = 0; i < list.length; i++) {
            //    var item = list[i];

            //    var jsPath = path.join(preDir, item);
            //    if (_jsCache.valueForKey(jsPath)) return cb1(null);
            //    this._createScript(jsPath, false, cb1);
            //}


            cc.async.map(list, function (item, index, cb1) {
                var jsPath = cc.path.join(preDir, item);
                if (_jsCache[jsPath]) return cb1(null);
                self._createScript(jsPath, false, cb1);
            }, callback);
        }
    }
    /**
         * Load js width loading image.
         *
         * @param {string} [baseDir]
         * @param {array} jsList
         * @param {function} [cb]
         */
    public loadJsWithImg(baseDir: string, jsList: Array<string>, cb: (err?: string) => void): void {
        var jsLoadingImg = this._loadJsImg();
        var args4Js = this._getArgs4Js(baseDir, jsList, cb);
        this.loadJs(args4Js.baseDir, args4Js.jsList, (err:string)=> {
            if (err) throw new Error(err);
            jsLoadingImg.parentNode.removeChild(jsLoadingImg);//remove loading gif
            if (args4Js.callback) args4Js.callback(err);
        });
    }
    private async _createScript(jsPath: string, isAsync: boolean, cb: (err?: string) => void = null): Promise<void> {
        //var p = new Promise<void>(() => {
            var d = document;
            var s = document.createElement('script');
            s.async = isAsync;
            _jsCache.setObject(true, jsPath);
            if (game.config.noCache && typeof jsPath === "string") {
                if (this._noCacheRex.test(jsPath))
                    s.src = jsPath + "&_t=" + ((new Date()).getTime() - 0);
                else
                    s.src = jsPath + "?_t=" + ((new Date()).getTime() - 0);
            } else {
                s.src = jsPath;
            }
            s.addEventListener('load', () => {
                s.parentNode.removeChild(s);
                s.removeEventListener('load', arguments.callee, false);
                cb();
            }, false);
            s.addEventListener('error', function () {
                s.parentNode.removeChild(s);
                cb("Load " + jsPath + " failed!");
            }, false);
            d.body.appendChild(s);

        //});

        //return p;

    }
    private _loadJs4Dependency(baseDir: string, jsList: Array<string>, index: number, cb: (err?: string) => void = null) {
        if (index >= jsList.length) {
            if (cb) cb();
            return;
        }
        this._createScript(path.join(baseDir, jsList[index]), false, (err?: string) => {
            if (err) return cb(err);
            this._loadJs4Dependency(baseDir, jsList, index + 1, cb);
        });
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
    public loadTxt(url: string, cb: (err?: any, response?:string) => void):void {

        var xhr = this.getXMLHttpRequest(),
            errInfo = "load " + url + " failed!";
        xhr.open("GET", url, true);
        if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
            // IE-specific logic here
            xhr.setRequestHeader("Accept-Charset", "utf-8");
            xhr.onreadystatechange = ()=> {
                if (xhr.readyState === 4)
                    (xhr.status === 200 || xhr.status === 0) ? cb(null, xhr.responseText) : cb({ status: xhr.status, errorMessage: errInfo }, null);
            };
        } else {
            if (xhr.overrideMimeType) xhr.overrideMimeType("text\/plain; charset=utf-8");
            var loadCallback = ()=> {
                xhr.removeEventListener('load', loadCallback);
                xhr.removeEventListener('error', errorCallback);
                if ((<any>xhr)._timeoutId >= 0) {
                    clearTimeout((<any>xhr)._timeoutId);
                }
                else {
                    xhr.removeEventListener('timeout', timeoutCallback);
                }
                if (xhr.readyState === 4) {
                    (xhr.status === 200 || xhr.status === 0) ? cb(null, xhr.responseText) : cb({ status: xhr.status, errorMessage: errInfo }, null);
                }
            };
            var errorCallback = ()=> {
                xhr.removeEventListener('load', loadCallback);
                xhr.removeEventListener('error', errorCallback);
                if ((<any>xhr)._timeoutId >= 0) {
                    clearTimeout((<any>xhr)._timeoutId);
                }
                else {
                    xhr.removeEventListener('timeout', timeoutCallback);
                }
                cb({ status: xhr.status, errorMessage: errInfo }, null);
            };
            var timeoutCallback = ()=> {
                xhr.removeEventListener('load', loadCallback);
                xhr.removeEventListener('error', errorCallback);
                if ((<any>xhr)._timeoutId >= 0) {
                    clearTimeout((<any>xhr)._timeoutId);
                }
                else {
                    xhr.removeEventListener('timeout', timeoutCallback);
                }
                cb({ status: xhr.status, errorMessage: "Request timeout: " + errInfo }, null);
            };
            xhr.addEventListener('load', loadCallback);
            xhr.addEventListener('error', errorCallback);
            if (xhr.ontimeout === undefined) {
                (<any>xhr)._timeoutId = setTimeout(()=> {
                    timeoutCallback();
                }, xhr.timeout);
            }
            else {
                xhr.addEventListener('timeout', timeoutCallback);
            }
        }
        xhr.send(null);

    }

    public loadCsb(url: string, cb: (err?: any, response?: string) => void): void {
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
                (xhr.status === 200 || xhr.status === 0) ? cb(null, xhr.response) : cb({ status: xhr.status, errorMessage: errInfo }, null);
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
            cb({ status: xhr.status, errorMessage: errInfo }, null);
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
            cb({ status: xhr.status, errorMessage: "Request timeout: " + errInfo }, null);
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
    }

    /**
         * Load a single resource as json.
         * @param {string} url
         * @param {function} [cb] arguments are : err, json
         */
    public loadJson(url: string, cb: (err?: any, response?: string) => void): void {
        this.loadTxt(url, (err:any, txt:string)=> {
            if (err) {
                cb(err);
            }
            else {
                try {
                    var result = JSON.parse(txt);
                }
                catch (e) {
                    throw new Error("parse json [" + url + "] failed : " + e);
                    //return;
                }
                cb(null, result);
            }
        });
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
    public loadImg(url: string, option: any, callback: (err?: any, data?: any) => void, img: HTMLImageElement): HTMLImageElement {
        var opt = {
            isCrossOrigin: true
        };
        if (callback !== undefined)
            opt.isCrossOrigin = option.isCrossOrigin === undefined ? opt.isCrossOrigin : option.isCrossOrigin;
        else if (option !== undefined)
            callback = option;

        var texture = this.getRes(url);
        if (texture) {
            callback && callback(null, texture);
            return null;
        }

        var queue = _queue.valueForKey(url);
        if (queue) {
            queue.callbacks.push(callback);
            return queue.img;
        }

        img = img || imagePool.get();
        if (opt.isCrossOrigin && location.origin !== "file://")
            img.crossOrigin = "Anonymous";
        else
            img.crossOrigin = null;

        var loadCallback = ()=> {
            img.removeEventListener('load', loadCallback, false);
            img.removeEventListener('error', errorCallback, false);

            var queue = _queue.valueForKey(url);
            if (queue) {
                var callbacks = queue.callbacks;
                for (var i = 0; i < callbacks.length; ++i) {
                    var cb = callbacks[i];
                    if (cb) {
                        cb(null, img);
                    }
                }
                queue.img = null;
                _queue.removeObjectForKey(url);
                //delete _queue[url];
            }

            if (window.ENABLE_IMAEG_POOL && game._renderType === RENDER_TYPE.WEBGL) {
                imagePool.put(img);
            }
        };

        var errorCallback = ()=> {
            img.removeEventListener('load', loadCallback, false);
            img.removeEventListener('error', errorCallback, false);

            if (window.location.protocol !== 'https:' && img.crossOrigin && img.crossOrigin.toLowerCase() === "anonymous") {
                opt.isCrossOrigin = false;
                this.release(url);
                loader.loadImg(url, opt, callback, img);
            } else {
                var queue = _queue.valueForKey(url);
                if (queue) {
                    var callbacks = queue.callbacks;
                    for (var i = 0; i < callbacks.length; ++i) {
                        var cb = callbacks[i];
                        if (cb) {
                            cb("load image failed");
                        }
                    }
                    queue.img = null;
                    _queue.removeObjectForKey(url);
                    //delete _queue[url];
                }

                if (game._renderType === RENDER_TYPE.WEBGL) {
                    imagePool.put(img);
                }
            }
        };

        _queue.setObject({
            img: img,
            callbacks: callback ? [callback] : []
        }, url);

        img.addEventListener("load", loadCallback);
        img.addEventListener("error", errorCallback);
        img.src = url;
        return img;
    }



    /**
     * Iterator function to load res
     * @param {object} item
     * @param {number} index
     * @param {function} [cb]
     * @returns {*}
     * @private
     */
    private _loadResIterator(item: any, index:number, cb:(err?: any, response?: string) => void) {
        var url: string = null;

        var it = item;

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
            return cb(null, obj);
        var loader: ILoader = null;
        if (type) {
            loader = _register.valueForKey(type.toLowerCase());
        }
        if (!loader) {
            error("loader for [" + type + "] doesn't exist!");
            return cb();
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
        loader.load(realUrl, url, item, (err:string, data:string)=> {
            if (err) {
                log(err);
                this.cache.removeObjectForKey(url);
                //delete this.cache[url];
                cb({ status: 520, errorMessage: err }, null);
            } else {
                this.cache.setObject(data, url);
                cb(null, data);
            }
        });
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
            var loader = _register.valueForKey(type);
            if (!loader)
                basePath = this.resPath;
            else
                basePath = loader.getBasePath ? loader.getBasePath() : this.resPath;
        }
        url = path.join(basePath || "", url);
        if (url.match(/[\/(\\\\)]lang[\/(\\\\)]/i)) {
            if (_langPathCache.valueForKey(url))
                return _langPathCache.valueForKey(url);
            var extname = path.extname(url) || "";
            var url2 = url.substring(0, url.length - extname.length) + "_" + cc.sys.language + extname;
            _langPathCache.setObject(url2, url)
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
    public async load(resources: string | Array<string>, loadCallback:(err:any, data:any)=>void = null):Promise<void> {
        var len = arguments.length;
        var option:any = {};
        if (len === 0)
            throw new Error("arguments error!");

        if (len === 3) {
            if (typeof option === "function") {
                if (typeof loadCallback === "function")
                    option = { trigger: option, cb: loadCallback };
                else
                    option = { cb: option, cbTarget: loadCallback };
            }
        } else if (len === 2) {
            if (typeof option === "function")
                option = { cb: option };
        } else if (len === 1) {
            option = {};
        }

        if (!(resources instanceof Array))
            resources = [resources];


        var asyncPool = new cc.AsyncPool(
            resources, cc.CONCURRENCY_HTTP_REQUEST_COUNT,
             (value, index, AsyncPoolCallback, aPool)=> {
                this._loadResIterator(value, index, function (err) {
                    var arr = Array.prototype.slice.call(arguments, 1);
                    if (option.trigger)
                        option.trigger.call(option.triggerTarget, arr[0], aPool.size, aPool.finishedSize);   //call trigger
                    AsyncPoolCallback(err, arr[0]);
                });
            },
            option.cb, option.cbTarget);
        asyncPool.flow();
        return asyncPool;
    }

    private _handleAliases(fileNames: Array<string>, cb:()=>void) {
        var self = this;
        var resList = [];
        for (var key in fileNames) {
            var value = fileNames[key];
            _aliases.setObject(value, key);
            resList.push(value);
        }
        this.load(resList, cb);
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
    public loadAliases(url: string, callback: () => void): void {
        var dict = this.getRes(url);
        if (!dict) {
            this.load(url, (err, results)=> {
                this._handleAliases(results[0]["filenames"], callback);
            });
        } else
            this._handleAliases(dict["filenames"], callback);
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
            _register.setObject(loader, extNames.trim().toLowerCase());
            return loader;
        }
        for (var i = 0, li = extNames.length; i < li; i++) {
            _register.setObject(loader, "." + extNames[i].trim().toLowerCase());
        }
    }
/**
         * Get resource data by url.
         * @param url
         * @returns {*}
         */
    public getRes(url: string): string {
        return this.cache.valueForKey(url) || this.cache.valueForKey(_aliases.valueForKey(url));
    }
    /**
         * Get aliase by url.
         * @param url
         * @returns {*}
         */
    private _getAliase(url: string): string {
        return _aliases.valueForKey(url);
    }
    /**
         * Release the cache of resource by url.
         * @param url
         */
    public release(url: string): void {
        var cache = this.cache;
        var queue = _queue.valueForKey(url);
        if (queue) {
            queue.img = null;
            _queue.removeObjectForKey(url);
            //delete _queue[url];
        }
        _aliases.removeObjectForKey(url);
        cache.removeObjectForKey(url);
        cache.removeObjectForKey(_aliases.valueForKey(url));
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
            locCache.removeObjectForKey(key);
        }
            //delete locCache[key];
        for (var key in _aliases) {
            _aliases.removeObjectForKey(key);
        }
            //delete _aliases[key];
    }





}

export var loader = new Loader();

//+++++++++++++++++++++++++something about loader end+++++++++++++++++++++++++++++