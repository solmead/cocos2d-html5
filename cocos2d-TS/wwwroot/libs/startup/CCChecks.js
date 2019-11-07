import { log } from "./CCDebugger";
/**
 * Check the obj whether is function or not
 * @param {*} obj
 * @returns {boolean}
 */
export function isFunction(obj) {
    return typeof obj === 'function';
}
;
/**
 * Check the obj whether is number or not
 * @param {*} obj
 * @returns {boolean}
 */
export function isNumber(obj) {
    return typeof obj === 'number' || Object.prototype.toString.call(obj) === '[object Number]';
}
;
/**
 * Check the obj whether is string or not
 * @param {*} obj
 * @returns {boolean}
 */
export function isString(obj) {
    return typeof obj === 'string' || Object.prototype.toString.call(obj) === '[object String]';
}
;
/**
 * Check the obj whether is array or not
 * @param {*} obj
 * @returns {boolean}
 */
export function isArray(obj) {
    return Array.isArray(obj) ||
        (typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Array]');
}
;
/**
 * Check the obj whether is undefined or not
 * @param {*} obj
 * @returns {boolean}
 */
export function isUndefined(obj) {
    return typeof obj === 'undefined';
}
;
/**
 * Check the obj whether is object or not
 * @param {*} obj
 * @returns {boolean}
 */
export function isObject(obj) {
    return typeof obj === "object" && Object.prototype.toString.call(obj) === '[object Object]';
}
;
/**
 * Check the url whether cross origin
 * @param {String} url
 * @returns {boolean}
 */
export function isCrossOrigin(url) {
    if (!url) {
        log("invalid URL");
        return false;
    }
    var startIndex = url.indexOf("://");
    if (startIndex === -1)
        return false;
    var endIndex = url.indexOf("/", startIndex + 3);
    var urlOrigin = (endIndex === -1) ? url : url.substring(0, endIndex);
    return urlOrigin !== location.origin;
}
;
/**
 * A string tool to construct a string with format string.
 * for example:
 *      cc.formatStr("a: %d, b: %b", a, b);
 *      cc.formatStr(a, b, c);
 * @returns {String}
 */
export function formatStr(msg, ...args) {
    //var args = arguments;
    var l = args.length;
    if (l < 1)
        return "";
    var str = msg;
    var needToFormat = true;
    if (typeof str === "object") {
        needToFormat = false;
    }
    for (var i = 0; i < l; ++i) {
        var arg = args[i];
        if (needToFormat) {
            while (true) {
                var result = null;
                if (typeof arg === "number") {
                    result = str.match(/(%d)|(%s)/);
                    if (result) {
                        str = str.replace(/(%d)|(%s)/, arg);
                        break;
                    }
                }
                result = str.match(/%s/);
                if (result)
                    str = str.replace(/%s/, arg);
                else
                    str += "    " + arg;
                break;
            }
        }
        else
            str += "    " + arg;
    }
    return str;
}
//# sourceMappingURL=CCChecks.js.map