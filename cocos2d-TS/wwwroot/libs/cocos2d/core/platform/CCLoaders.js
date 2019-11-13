import { loader } from "../../../startup/CCLoader";
import { path } from "../../../startup/CCPath";
import { isString } from "../../../startup/CCChecks";
import { plistParser } from "./CCSAXParser";
import { textureCache } from "../textures/CCTextureCache";
/****************************************************************************
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
export var _txtLoader = {
    loadAsync: async (realUrl, url, res) => {
        return await loader.loadTxtAsync(realUrl);
    },
    getBasePath: () => {
        return null;
    }
};
loader.register(["txt", "xml", "vsh", "fsh", "atlas"], _txtLoader);
export var _jsonLoader = {
    loadAsync: async (realUrl, url, res) => {
        return await loader.loadJsonAsync(realUrl);
    },
    getBasePath: () => {
        return null;
    }
};
loader.register(["json", "ExportJson"], _jsonLoader);
export var _jsLoader = {
    loadAsync: async (realUrl, url, res) => {
        await loader.loadJsAsync(null, [realUrl]);
        return null;
    },
    getBasePath: () => {
        return null;
    }
};
loader.register(["js"], _jsLoader);
export var _imgLoader = {
    loadAsync: async (realUrl, url, res) => {
        var callback;
        if (loader.isLoading(realUrl)) {
            var img = await loader.loadImgAsync(realUrl, callback);
            var tex = textureCache.getTextureForKey(url) || textureCache.handleLoadedTexture(url, img);
            return tex;
        }
        else {
            var img = await loader.loadImgAsync(realUrl, callback);
            var tex = textureCache.handleLoadedTexture(url, img);
            return tex;
        }
    },
    getBasePath: () => {
        return null;
    }
};
loader.register(["png", "jpg", "bmp", "jpeg", "gif", "ico", "tiff", "webp"], _imgLoader);
export var _serverImgLoader = {
    loadAsync: async (realUrl, url, res) => {
        await _imgLoader.loadAsync(res.src, url, res);
        return null;
    },
    getBasePath: () => {
        return null;
    }
};
loader.register(["serverImg"], _serverImgLoader);
export var _plistLoader = {
    loadAsync: async (realUrl, url, res) => {
        var txt = await loader.loadTxtAsync(realUrl);
        return plistParser.parse(txt);
    },
    getBasePath: () => {
        return null;
    }
};
loader.register(["plist"], _plistLoader);
var FontTYPEs = {
    ".eot": "embedded-opentype",
    ".ttf": "truetype",
    ".ttc": "truetype",
    ".woff": "woff",
    ".svg": "svg"
};
function _loadFont(name, srcs, type) {
    var doc = document, fontStyle = document.createElement("style");
    fontStyle.type = "text/css";
    doc.body.appendChild(fontStyle);
    var fontStr = "";
    if (isNaN(name - 0))
        fontStr += "@font-face { font-family:" + name + "; src:";
    else
        fontStr += "@font-face { font-family:'" + name + "'; src:";
    if (srcs instanceof Array) {
        for (var i = 0, li = srcs.length; i < li; i++) {
            var src = srcs[i];
            type = path.extname(src).toLowerCase();
            fontStr += "url('" + srcs[i] + "') format('" + FontTYPEs[type] + "')";
            fontStr += (i === li - 1) ? ";" : ",";
        }
    }
    else {
        type = type.toLowerCase();
        fontStr += "url('" + srcs + "') format('" + FontTYPEs[type] + "');";
    }
    fontStyle.textContent += fontStr + "}";
    //<div style="font-family: PressStart;">.</div>
    var preloadDiv = document.createElement("div");
    var _divStyle = preloadDiv.style;
    _divStyle.fontFamily = name;
    preloadDiv.innerHTML = ".";
    _divStyle.position = "absolute";
    _divStyle.left = "-100px";
    _divStyle.top = "-100px";
    doc.body.appendChild(preloadDiv);
}
export var _fontLoader = {
    loadAsync: async (realUrl, url, res) => {
        var p = new Promise((resolve, reject) => {
            var type = res.type, name = res.name, srcs = res.srcs;
            if (isString(res)) {
                type = path.extname(res);
                name = path.basename(res, type);
                _loadFont(name, res, type);
            }
            else {
                _loadFont(name, srcs);
            }
            if (document.fonts) {
                document.fonts.load("1em " + name).then(() => {
                    resolve(true);
                }, (err) => {
                    reject(err);
                });
            }
            else {
                resolve(true);
            }
        });
        return p;
    },
    getBasePath: () => {
        return null;
    }
};
loader.register(["font", "eot", "ttf", "woff", "svg", "ttc"], _fontLoader);
export var _binaryLoader = {
    loadAsync: async (realUrl, url, res) => {
        return await loader.loadBinaryAsync(realUrl);
    },
    getBasePath: () => {
        return null;
    }
};
export var _csbLoader = {
    loadAsync: async (realUrl, url, res) => {
        return await loader.loadCsbAsync(realUrl);
    },
    getBasePath: () => {
        return null;
    }
};
loader.register(["csb"], _csbLoader);
//# sourceMappingURL=CCLoaders.js.map