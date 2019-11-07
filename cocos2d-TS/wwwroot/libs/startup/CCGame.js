export var DEBUG_MODE;
(function (DEBUG_MODE) {
    /**
     * Debug mode: No debugging. {@static}
     * @const {Number}
     * @static
     */
    DEBUG_MODE[DEBUG_MODE["NONE"] = 0] = "NONE";
    /**
     * Debug mode: Info, warning, error to console.
     * @const {Number}
     * @static
     */
    DEBUG_MODE[DEBUG_MODE["INFO"] = 1] = "INFO";
    /**
     * Debug mode: Warning, error to console.
     * @const {Number}
     * @static
     */
    DEBUG_MODE[DEBUG_MODE["WARN"] = 2] = "WARN";
    /**
     * Debug mode: Error to console.
     * @const {Number}
     * @static
     */
    DEBUG_MODE[DEBUG_MODE["ERROR"] = 3] = "ERROR";
    /**
     * Debug mode: Info, warning, error to web page.
     * @const {Number}
     * @static
     */
    DEBUG_MODE[DEBUG_MODE["INFO_FOR_WEB_PAGE"] = 4] = "INFO_FOR_WEB_PAGE";
    /**
     * Debug mode: Warning, error to web page.
     * @const {Number}
     * @static
     */
    DEBUG_MODE[DEBUG_MODE["WARN_FOR_WEB_PAGE"] = 5] = "WARN_FOR_WEB_PAGE";
    /**
     * Debug mode: Error to web page.
     * @const {Number}
     * @static
     */
    DEBUG_MODE[DEBUG_MODE["ERROR_FOR_WEB_PAGE"] = 6] = "ERROR_FOR_WEB_PAGE";
})(DEBUG_MODE || (DEBUG_MODE = {}));
export var RENDER_TYPE;
(function (RENDER_TYPE) {
})(RENDER_TYPE || (RENDER_TYPE = {}));
//# sourceMappingURL=CCGame.js.map