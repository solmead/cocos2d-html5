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
//export module common {
/**
* Key map for keyboard event
*
* @constant
* @type {Object}
* @example
cc.eventManager.addListener({
    event: cc.EventListener.KEYBOARD,
    onKeyPressed:  function(keyCode, event){
        if (cc.KEY["a"] == keyCode) {
            cc.log("A is pressed");
        }
    }
}, this);
*/
export var KEY;
(function (KEY) {
    KEY[KEY["none"] = 0] = "none";
    // android
    KEY[KEY["back"] = 6] = "back";
    KEY[KEY["menu"] = 18] = "menu";
    KEY[KEY["backspace"] = 8] = "backspace";
    KEY[KEY["tab"] = 9] = "tab";
    KEY[KEY["enter"] = 13] = "enter";
    KEY[KEY["shift"] = 16] = "shift";
    KEY[KEY["ctrl"] = 17] = "ctrl";
    KEY[KEY["alt"] = 18] = "alt";
    KEY[KEY["pause"] = 19] = "pause";
    KEY[KEY["capslock"] = 20] = "capslock";
    KEY[KEY["escape"] = 27] = "escape";
    KEY[KEY["space"] = 32] = "space";
    KEY[KEY["pageup"] = 33] = "pageup";
    KEY[KEY["pagedown"] = 34] = "pagedown";
    KEY[KEY["end"] = 35] = "end";
    KEY[KEY["home"] = 36] = "home";
    KEY[KEY["left"] = 37] = "left";
    KEY[KEY["up"] = 38] = "up";
    KEY[KEY["right"] = 39] = "right";
    KEY[KEY["down"] = 40] = "down";
    KEY[KEY["select"] = 41] = "select";
    KEY[KEY["insert"] = 45] = "insert";
    KEY[KEY["Delete"] = 46] = "Delete";
    KEY[KEY["Zero"] = 48] = "Zero";
    KEY[KEY["One"] = 49] = "One";
    KEY[KEY["Two"] = 50] = "Two";
    KEY[KEY["Three"] = 51] = "Three";
    KEY[KEY["Four"] = 52] = "Four";
    KEY[KEY["Five"] = 53] = "Five";
    KEY[KEY["Six"] = 54] = "Six";
    KEY[KEY["Seven"] = 55] = "Seven";
    KEY[KEY["Eight"] = 56] = "Eight";
    KEY[KEY["Nine"] = 57] = "Nine";
    KEY[KEY["a"] = 65] = "a";
    KEY[KEY["b"] = 66] = "b";
    KEY[KEY["c"] = 67] = "c";
    KEY[KEY["d"] = 68] = "d";
    KEY[KEY["e"] = 69] = "e";
    KEY[KEY["f"] = 70] = "f";
    KEY[KEY["g"] = 71] = "g";
    KEY[KEY["h"] = 72] = "h";
    KEY[KEY["i"] = 73] = "i";
    KEY[KEY["j"] = 74] = "j";
    KEY[KEY["k"] = 75] = "k";
    KEY[KEY["l"] = 76] = "l";
    KEY[KEY["m"] = 77] = "m";
    KEY[KEY["n"] = 78] = "n";
    KEY[KEY["o"] = 79] = "o";
    KEY[KEY["p"] = 80] = "p";
    KEY[KEY["q"] = 81] = "q";
    KEY[KEY["r"] = 82] = "r";
    KEY[KEY["s"] = 83] = "s";
    KEY[KEY["t"] = 84] = "t";
    KEY[KEY["u"] = 85] = "u";
    KEY[KEY["v"] = 86] = "v";
    KEY[KEY["w"] = 87] = "w";
    KEY[KEY["x"] = 88] = "x";
    KEY[KEY["y"] = 89] = "y";
    KEY[KEY["z"] = 90] = "z";
    KEY[KEY["num0"] = 96] = "num0";
    KEY[KEY["num1"] = 97] = "num1";
    KEY[KEY["num2"] = 98] = "num2";
    KEY[KEY["num3"] = 99] = "num3";
    KEY[KEY["num4"] = 100] = "num4";
    KEY[KEY["num5"] = 101] = "num5";
    KEY[KEY["num6"] = 102] = "num6";
    KEY[KEY["num7"] = 103] = "num7";
    KEY[KEY["num8"] = 104] = "num8";
    KEY[KEY["num9"] = 105] = "num9";
    KEY[KEY["Asterix"] = 106] = "Asterix";
    KEY[KEY["Plus"] = 107] = "Plus";
    KEY[KEY["Minus"] = 109] = "Minus";
    //'numdel'= 110,
    KEY[KEY["Slash"] = 111] = "Slash";
    KEY[KEY["f1"] = 112] = "f1";
    KEY[KEY["f2"] = 113] = "f2";
    KEY[KEY["f3"] = 114] = "f3";
    KEY[KEY["f4"] = 115] = "f4";
    KEY[KEY["f5"] = 116] = "f5";
    KEY[KEY["f6"] = 117] = "f6";
    KEY[KEY["f7"] = 118] = "f7";
    KEY[KEY["f8"] = 119] = "f8";
    KEY[KEY["f9"] = 120] = "f9";
    KEY[KEY["f10"] = 121] = "f10";
    KEY[KEY["f11"] = 122] = "f11";
    KEY[KEY["f12"] = 123] = "f12";
    KEY[KEY["numlock"] = 144] = "numlock";
    KEY[KEY["scrolllock"] = 145] = "scrolllock";
    //';'= 186,
    KEY[KEY["semicolon"] = 186] = "semicolon";
    KEY[KEY["equal"] = 187] = "equal";
    //'='= 187,
    //','= 188,
    KEY[KEY["comma"] = 188] = "comma";
    KEY[KEY["dash"] = 189] = "dash";
    //'.'= 190,
    KEY[KEY["period"] = 190] = "period";
    KEY[KEY["forwardslash"] = 191] = "forwardslash";
    KEY[KEY["grave"] = 192] = "grave";
    //'['= 219,
    KEY[KEY["openbracket"] = 219] = "openbracket";
    KEY[KEY["backslash"] = 220] = "backslash";
    //']'= 221,
    KEY[KEY["closebracket"] = 221] = "closebracket";
    KEY[KEY["quote"] = 222] = "quote";
    // gamepad control
    KEY[KEY["dpadLeft"] = 1000] = "dpadLeft";
    KEY[KEY["dpadRight"] = 1001] = "dpadRight";
    KEY[KEY["dpadUp"] = 1003] = "dpadUp";
    KEY[KEY["dpadDown"] = 1004] = "dpadDown";
    KEY[KEY["dpadCenter"] = 1005] = "dpadCenter";
})(KEY || (KEY = {}));
/**
* Image Format
* @constant
* @type {Number}
*/
export var FMT;
(function (FMT) {
    FMT[FMT["JPG"] = 0] = "JPG";
    FMT[FMT["PNG"] = 1] = "PNG";
    FMT[FMT["TIFF"] = 2] = "TIFF";
    FMT[FMT["RAWDATA"] = 3] = "RAWDATA";
    FMT[FMT["WEBP"] = 4] = "WEBP";
    FMT[FMT["UNKNOWN"] = 5] = "UNKNOWN";
})(FMT || (FMT = {}));
/**
 * get image format by image data
 * @function
 * @param {Array} imgData
 * @returns {Number}
 */
export function getImageFormatByData(imgData) {
    // if it is a png file buffer.
    if (imgData.length > 8 && imgData[0] === 0x89
        && imgData[1] === 0x50
        && imgData[2] === 0x4E
        && imgData[3] === 0x47
        && imgData[4] === 0x0D
        && imgData[5] === 0x0A
        && imgData[6] === 0x1A
        && imgData[7] === 0x0A) {
        return FMT.PNG;
    }
    // if it is a tiff file buffer.
    if (imgData.length > 2 && ((imgData[0] === 0x49 && imgData[1] === 0x49)
        || (imgData[0] === 0x4d && imgData[1] === 0x4d)
        || (imgData[0] === 0xff && imgData[1] === 0xd8))) {
        return FMT.TIFF;
    }
    return FMT.UNKNOWN;
}
;
//}
//# sourceMappingURL=CCCommon.js.map