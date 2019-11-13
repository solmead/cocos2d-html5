import { game, RENDER_TYPE, create3DContext } from "./CCGame";
import { warn, log } from "./CCDebugger";
var _tmpCanvas1 = document.createElement("canvas"), _tmpCanvas2 = document.createElement("canvas");
export var LANGUAGES = {
    /**
     * English language code
     * @memberof cc.sys
     * @name ENGLISH
     * @constant
     * @type {Number}
     */
    ENGLISH: "en",
    /**
     * Chinese language code
     * @memberof cc.sys
     * @name CHINESE
     * @constant
     * @type {Number}
     */
    CHINESE: "zh",
    /**
     * French language code
     * @memberof cc.sys
     * @name FRENCH
     * @constant
     * @type {Number}
     */
    FRENCH: "fr",
    /**
     * Italian language code
     * @memberof cc.sys
     * @name ITALIAN
     * @constant
     * @type {Number}
     */
    ITALIAN: "it",
    /**
     * German language code
     * @memberof cc.sys
     * @name GERMAN
     * @constant
     * @type {Number}
     */
    GERMAN: "de",
    /**
     * Spanish language code
     * @memberof cc.sys
     * @name SPANISH
     * @constant
     * @type {Number}
     */
    SPANISH: "es",
    /**
     * Spanish language code
     * @memberof cc.sys
     * @name DUTCH
     * @constant
     * @type {Number}
     */
    DUTCH: "du",
    /**
     * Russian language code
     * @memberof cc.sys
     * @name RUSSIAN
     * @constant
     * @type {Number}
     */
    RUSSIAN: "ru",
    /**
     * Korean language code
     * @memberof cc.sys
     * @name KOREAN
     * @constant
     * @type {Number}
     */
    KOREAN: "ko",
    /**
     * Japanese language code
     * @memberof cc.sys
     * @name JAPANESE
     * @constant
     * @type {Number}
     */
    JAPANESE: "ja",
    /**
     * Hungarian language code
     * @memberof cc.sys
     * @name HUNGARIAN
     * @constant
     * @type {Number}
     */
    HUNGARIAN: "hu",
    /**
     * Portuguese language code
     * @memberof cc.sys
     * @name PORTUGUESE
     * @constant
     * @type {Number}
     */
    PORTUGUESE: "pt",
    /**
     * Arabic language code
     * @memberof cc.sys
     * @name ARABIC
     * @constant
     * @type {Number}
     */
    ARABIC: "ar",
    /**
     * Norwegian language code
     * @memberof cc.sys
     * @name NORWEGIAN
     * @constant
     * @type {Number}
     */
    NORWEGIAN: "no",
    /**
     * Polish language code
     * @memberof cc.sys
     * @name POLISH
     * @constant
     * @type {Number}
     */
    POLISH: "pl",
    /**
     * Unknown language code
     * @memberof cc.sys
     * @name UNKNOWN
     * @constant
     * @type {Number}
     */
    UNKNOWN: "unkonwn",
};
export var OSS = {
    /**
     * @memberof cc.sys
     * @name IOS
     * @constant
     * @type {string}
     */
    IOS: "iOS",
    /**
     * @memberof cc.sys
     * @name ANDROID
     * @constant
     * @type {string}
     */
    ANDROID: "Android",
    /**
     * @memberof cc.sys
     * @name WINDOWS
     * @constant
     * @type {string}
     */
    WINDOWS: "Windows",
    /**
     * @memberof cc.sys
     * @name MARMALADE
     * @constant
     * @type {string}
     */
    MARMALADE: "Marmalade",
    /**
     * @memberof cc.sys
     * @name LINUX
     * @constant
     * @type {string}
     */
    LINUX: "Linux",
    /**
     * @memberof cc.sys
     * @name BADA
     * @constant
     * @type {string}
     */
    BADA: "Bada",
    /**
     * @memberof cc.sys
     * @name BLACKBERRY
     * @constant
     * @type {string}
     */
    BLACKBERRY: "Blackberry",
    /**
     * @memberof cc.sys
     * @name OSX
     * @constant
     * @type {string}
     */
    OSX: "OS X",
    /**
     * @memberof cc.sys
     * @name WP8
     * @constant
     * @type {string}
     */
    WP8: "WP8",
    /**
     * @memberof cc.sys
     * @name WINRT
     * @constant
     * @type {string}
     */
    WINRT: "WINRT",
    /**
     * @memberof cc.sys
     * @name UNKNOWN
     * @constant
     * @type {string}
     */
    UNKNOWN: "Unknown",
};
export var OsType;
(function (OsType) {
    /**
     * @memberof cc.sys
     * @name UNKNOWN
     * @constant
     * @default
     * @type {Number}
     */
    OsType[OsType["UNKNOWN"] = -1] = "UNKNOWN";
    /**
     * @memberof cc.sys
     * @name WIN32
     * @constant
     * @default
     * @type {Number}
     */
    OsType[OsType["WIN32"] = 0] = "WIN32";
    /**
     * @memberof cc.sys
     * @name LINUX
     * @constant
     * @default
     * @type {Number}
     */
    OsType[OsType["LINUX"] = 1] = "LINUX";
    /**
     * @memberof cc.sys
     * @name MACOS
     * @constant
     * @default
     * @type {Number}
     */
    OsType[OsType["MACOS"] = 2] = "MACOS";
    /**
     * @memberof cc.sys
     * @name ANDROID
     * @constant
     * @default
     * @type {Number}
     */
    OsType[OsType["ANDROID"] = 3] = "ANDROID";
    /**
     * @memberof cc.sys
     * @name IOS
     * @constant
     * @default
     * @type {Number}
     */
    OsType[OsType["IPHONE"] = 4] = "IPHONE";
    /**
     * @memberof cc.sys
     * @name IOS
     * @constant
     * @default
     * @type {Number}
     */
    OsType[OsType["IPAD"] = 5] = "IPAD";
    /**
     * @memberof cc.sys
     * @name BLACKBERRY
     * @constant
     * @default
     * @type {Number}
     */
    OsType[OsType["BLACKBERRY"] = 6] = "BLACKBERRY";
    /**
     * @memberof cc.sys
     * @name NACL
     * @constant
     * @default
     * @type {Number}
     */
    OsType[OsType["NACL"] = 7] = "NACL";
    /**
     * @memberof cc.sys
     * @name EMSCRIPTEN
     * @constant
     * @default
     * @type {Number}
     */
    OsType[OsType["EMSCRIPTEN"] = 8] = "EMSCRIPTEN";
    /**
     * @memberof cc.sys
     * @name TIZEN
     * @constant
     * @default
     * @type {Number}
     */
    OsType[OsType["TIZEN"] = 9] = "TIZEN";
    /**
     * @memberof cc.sys
     * @name WINRT
     * @constant
     * @default
     * @type {Number}
     */
    OsType[OsType["WINRT"] = 10] = "WINRT";
    /**
     * @memberof cc.sys
     * @name WP8
     * @constant
     * @default
     * @type {Number}
     */
    OsType[OsType["WP8"] = 11] = "WP8";
    /**
     * @memberof cc.sys
     * @name MOBILE_BROWSER
     * @constant
     * @default
     * @type {Number}
     */
    OsType[OsType["MOBILE_BROWSER"] = 100] = "MOBILE_BROWSER";
    /**
     * @memberof cc.sys
     * @name DESKTOP_BROWSER
     * @constant
     * @default
     * @type {Number}
     */
    OsType[OsType["DESKTOP_BROWSER"] = 101] = "DESKTOP_BROWSER";
})(OsType || (OsType = {}));
export var BROWSER_TYPES = {
    WECHAT: "wechat",
    ANDROID: "androidbrowser",
    IE: "ie",
    QQ_APP: "qq",
    QQ: "qqbrowser",
    MOBILE_QQ: "mqqbrowser",
    UC: "ucbrowser",
    XBOX: "360browser",
    BAIDU_APP: "baiduboxapp",
    BAIDU: "baidubrowser",
    MAXTHON: "maxthon",
    OPERA: "opera",
    OUPENG: "oupeng",
    MIUI: "miuibrowser",
    FIREFOX: "firefox",
    SAFARI: "safari",
    CHROME: "chrome",
    LIEBAO: "liebao",
    QZONE: "qzone",
    SOUGOU: "sogou",
    UNKNOWN: "unknown"
};
var win = window, nav = win.navigator, doc = document, docEle = doc.documentElement;
var ua = nav.userAgent.toLowerCase();
var w = window.innerWidth || document.documentElement.clientWidth;
var h = window.innerHeight || document.documentElement.clientHeight;
var ratio = window.devicePixelRatio || 1;
class System {
    constructor() {
        this.isAndroid = false;
        this.iOS = false;
        /**
         * Is native ? This is set to be true in jsb auto.
         * @memberof cc.sys
         * @name isNative
         * @type {Boolean}
         */
        this.isNative = false;
        /**
         * Indicate whether system is mobile system
         * @memberof cc.sys
         * @name isMobile
         * @type {Boolean}
         */
        this.isMobile = /mobile|android|iphone|ipad/.test(ua);
        /**
         * Indicate the running platform
         * @memberof cc.sys
         * @name platform
         * @type {Number}
         */
        this.platform = this.isMobile ? OsType.MOBILE_BROWSER : OsType.DESKTOP_BROWSER;
        /**
         * Indicate the running browser type
         * @memberof cc.sys
         * @name browserType
         * @type {String}
         */
        this.browserType = BROWSER_TYPES.UNKNOWN;
        /**
         * Indicate the running browser version
         * @memberof cc.sys
         * @name browserVersion
         * @type {String}
         */
        this.browserVersion = "";
        /**
         * Indicate the real pixel resolution of the whole game window
         * @memberof cc.sys
         * @name windowPixelResolution
         * @type {Size}
         */
        this.windowPixelResolution = {
            width: ratio * w,
            height: ratio * h
        };
        //Whether or not the Canvas BlendModes are supported.
        this._supportCanvasNewBlendModes = (function () {
            var canvas = _tmpCanvas1;
            canvas.width = 1;
            canvas.height = 1;
            var context = canvas.getContext('2d');
            context.fillStyle = '#000';
            context.fillRect(0, 0, 1, 1);
            context.globalCompositeOperation = 'multiply';
            var canvas2 = _tmpCanvas2;
            canvas2.width = 1;
            canvas2.height = 1;
            var context2 = canvas2.getContext('2d');
            context2.fillStyle = '#fff';
            context2.fillRect(0, 0, 1, 1);
            context.drawImage(canvas2, 0, 0, 1, 1);
            return context.getImageData(0, 0, 1, 1).data[0] === 0;
        })();
        var currLanguage = nav.language;
        currLanguage = currLanguage ? currLanguage : nav.browserLanguage;
        currLanguage = currLanguage ? currLanguage.split("-")[0] : LANGUAGES.ENGLISH;
        this.language = currLanguage;
        this.getOs();
        this.getBrowserInfo();
        this.detectCapabilities();
        this.adjustMobile();
        this.checkLocalStorage();
    }
    getOs() {
        // Get the os of system
        var osVersion = '', osMainVersion = 0;
        var uaResult = /android (\d+(?:\.\d+)+)/i.exec(ua) || /android (\d+(?:\.\d+)+)/i.exec(nav.platform);
        if (uaResult) {
            this.isAndroid = true;
            osVersion = uaResult[1] || '';
            osMainVersion = parseInt(osVersion) || 0;
        }
        uaResult = /(iPad|iPhone|iPod).*OS ((\d+_?){2,3})/i.exec(ua);
        if (uaResult) {
            this.iOS = true;
            osVersion = uaResult[2] || '';
            osMainVersion = parseInt(osVersion) || 0;
        }
        else if (/(iPhone|iPad|iPod)/.exec(nav.platform)) {
            this.iOS = true;
            osVersion = '';
            osMainVersion = 0;
        }
        var osName = OSS.UNKNOWN;
        if (nav.appVersion.indexOf("Win") !== -1)
            osName = OSS.WINDOWS;
        else if (this.iOS)
            osName = OSS.IOS;
        else if (nav.appVersion.indexOf("Mac") !== -1)
            osName = OSS.OSX;
        else if (nav.appVersion.indexOf("X11") !== -1 && nav.appVersion.indexOf("Linux") === -1)
            osName = OSS.LINUX;
        else if (this.isAndroid)
            osName = OSS.ANDROID;
        else if (nav.appVersion.indexOf("Linux") !== -1)
            osName = OSS.LINUX;
        this.os = osName;
        this.osVersion = osVersion;
        this.osMainVersion = osMainVersion;
    }
    getBrowserInfo() {
        (() => {
            var typeReg1 = /micromessenger|mqqbrowser|sogou|qzone|liebao|ucbrowser|360 aphone|360browser|baiduboxapp|baidubrowser|maxthon|mxbrowser|trident|miuibrowser/i;
            var typeReg2 = /qqbrowser|qq|chrome|safari|firefox|opr|oupeng|opera/i;
            var browserTypes = typeReg1.exec(ua);
            if (!browserTypes)
                browserTypes = typeReg2.exec(ua);
            var browserType = browserTypes ? browserTypes[0] : BROWSER_TYPES.UNKNOWN;
            if (browserType === 'micromessenger')
                browserType = BROWSER_TYPES.WECHAT;
            else if (browserType === "safari" && this.isAndroid)
                browserType = BROWSER_TYPES.ANDROID;
            else if (browserType === "trident")
                browserType = BROWSER_TYPES.IE;
            else if (browserType === "360 aphone")
                browserType = BROWSER_TYPES.XBOX;
            else if (browserType === "mxbrowser")
                browserType = BROWSER_TYPES.MAXTHON;
            else if (browserType === "opr")
                browserType = BROWSER_TYPES.OPERA;
            this.browserType = browserType;
        })();
        (() => {
            var versionReg1 = /(mqqbrowser|micromessenger|sogou|qzone|liebao|maxthon|mxbrowser|baidu)(mobile)?(browser)?\/?([\d.]+)/i;
            var versionReg2 = /(msie |rv:|firefox|chrome|ucbrowser|qq|oupeng|opera|opr|safari|miui)(mobile)?(browser)?\/?([\d.]+)/i;
            var tmp = ua.match(versionReg1);
            if (!tmp)
                tmp = ua.match(versionReg2);
            this.browserVersion = tmp ? tmp[4] : "";
        })();
    }
    detectCapabilities() {
        var _supportCanvas = !!_tmpCanvas1.getContext("2d");
        var _supportWebGL = false;
        if (win.WebGLRenderingContext) {
            var tmpCanvas = document.createElement("CANVAS");
            try {
                var context = create3DContext(tmpCanvas);
                if (context) {
                    _supportWebGL = true;
                }
                if (_supportWebGL && sys.os === OSS.IOS && sys.osMainVersion === 9) {
                    // Not activating WebGL in iOS 9 UIWebView because it may crash when entering background
                    if (!window.indexedDB) {
                        _supportWebGL = false;
                    }
                }
                if (_supportWebGL && sys.os === OSS.ANDROID) {
                    var browserVer = parseFloat(sys.browserVersion);
                    switch (sys.browserType) {
                        case BROWSER_TYPES.MOBILE_QQ:
                        case BROWSER_TYPES.BAIDU:
                        case BROWSER_TYPES.BAIDU_APP:
                            // QQ & Baidu Brwoser 6.2+ (using blink kernel)
                            if (browserVer >= 6.2) {
                                _supportWebGL = true;
                            }
                            else {
                                _supportWebGL = false;
                            }
                            break;
                        case BROWSER_TYPES.CHROME:
                            // Chrome on android supports WebGL from v.30
                            if (browserVer >= 30.0) {
                                _supportWebGL = true;
                            }
                            else {
                                _supportWebGL = false;
                            }
                            break;
                        case BROWSER_TYPES.ANDROID:
                            // Android 5+ default browser
                            if (sys.osMainVersion && sys.osMainVersion >= 5) {
                                _supportWebGL = true;
                            }
                            break;
                        case BROWSER_TYPES.UNKNOWN:
                        case BROWSER_TYPES.XBOX:
                        case BROWSER_TYPES.MIUI:
                        case BROWSER_TYPES.UC:
                            _supportWebGL = false;
                    }
                }
            }
            catch (e) { }
            tmpCanvas = null;
        }
        /**
         * The capabilities of the current platform
         * @memberof cc.sys
         * @name capabilities
         * @type {Object}
         */
        var capabilities = this.capabilities = {
            canvas: _supportCanvas,
            opengl: _supportWebGL
        };
        if (docEle['ontouchstart'] !== undefined || doc['ontouchstart'] !== undefined || nav.msPointerEnabled)
            capabilities.touches = true;
        if (docEle['onmouseup'] !== undefined)
            capabilities.mouse = true;
        if (docEle['onkeyup'] !== undefined)
            capabilities.keyboard = true;
        if (win.DeviceMotionEvent || win.DeviceOrientationEvent)
            capabilities.accelerometer = true;
    }
    adjustMobile() {
        // Adjust mobile css settings
        if (this.isMobile) {
            var fontStyle = document.createElement("style");
            fontStyle.type = "text/css";
            document.body.appendChild(fontStyle);
            fontStyle.textContent = "body,canvas,div{ -moz-user-select: none;-webkit-user-select: none;-ms-user-select: none;-khtml-user-select: none;"
                + "-webkit-tap-highlight-color:rgba(0,0,0,0);}";
        }
    }
    checkLocalStorage() {
        try {
            var localStorage = this.localStorage = win.localStorage;
            localStorage.setItem("storage", "");
            localStorage.removeItem("storage");
            localStorage = null;
        }
        catch (e) {
            var warn2 = (key) => {
                warn("Warning: localStorage isn't enabled. Please confirm browser cookie or privacy option");
                return "";
            };
            var warn3 = () => {
                warn("Warning: localStorage isn't enabled. Please confirm browser cookie or privacy option");
            };
            this.localStorage = {
                getItem: warn2,
                setItem: warn2,
                removeItem: warn2,
                clear: warn3,
                length: 0,
                key: null
            };
        }
    }
    _checkWebGLRenderMode() {
        if (game.renderType !== RENDER_TYPE.WEBGL)
            throw new Error("This feature supports WebGL render mode only.");
    }
    /**
     * Forces the garbage collection, only available in JSB
     * @memberof cc.sys
     * @name garbageCollect
     * @function
     */
    garbageCollect() {
        // N/A in cocos2d-html5
    }
    /**
     * Dumps rooted objects, only available in JSB
     * @memberof cc.sys
     * @name dumpRoot
     * @function
     */
    dumpRoot() {
        // N/A in cocos2d-html5
    }
    /**
     * Restart the JS VM, only available in JSB
     * @memberof cc.sys
     * @name restartVM
     * @function
     */
    restartVM() {
        // N/A in cocos2d-html5
    }
    /**
     * Clean a script in the JS VM, only available in JSB
     * @memberof cc.sys
     * @name cleanScript
     * @param {String} jsfile
     * @function
     */
    cleanScript(jsfile) {
        // N/A in cocos2d-html5
    }
    /**
     * Check whether an object is valid,
     * In web engine, it will return true if the object exist
     * In native engine, it will return true if the JS object and the correspond native object are both valid
     * @memberof cc.sys
     * @name isObjectValid
     * @param {Object} obj
     * @return {boolean} Validity of the object
     * @function
     */
    isObjectValid(obj) {
        if (obj)
            return true;
        else
            return false;
    }
    /**
     * Dump system informations
     * @memberof cc.sys
     * @name dump
     * @function
     */
    dump() {
        var self = this;
        var str = "";
        str += "isMobile : " + self.isMobile + "\r\n";
        str += "language : " + self.language + "\r\n";
        str += "browserType : " + self.browserType + "\r\n";
        str += "browserVersion : " + self.browserVersion + "\r\n";
        str += "capabilities : " + JSON.stringify(self.capabilities) + "\r\n";
        str += "os : " + self.os + "\r\n";
        str += "osVersion : " + self.osVersion + "\r\n";
        str += "platform : " + self.platform + "\r\n";
        str += "Using " + (game.renderType === RENDER_TYPE.WEBGL ? "WEBGL" : "CANVAS") + " renderer." + "\r\n";
        log(str);
    }
    /**
     * Open a url in browser
     * @memberof cc.sys
     * @name openURL
     * @param {String} url
     */
    openURL(url) {
        window.open(url);
    }
    /**
     * Get the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC.
     * @memberof cc.sys
     * @name now
     * @return {Number}
     */
    now() {
        if (Date.now) {
            return Date.now();
        }
        else {
            return +(new Date);
        }
    }
}
export var sys;
_tmpCanvas1 = null;
_tmpCanvas2 = null;
//# sourceMappingURL=CCSys.js.map