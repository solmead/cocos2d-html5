import { ILoader, iResource, loader } from "../../../startup/CCLoader";
import { path } from "../../../startup/CCPath";
import { isString } from "../../../startup/CCChecks";
import { plistParser } from "./CCSAXParser";
import { textureCache } from "../textures/CCTextureCache"

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

export var _txtLoader: ILoader = {
    loadAsync: async (realUrl: string, url: string, res: any): Promise<iResource> => {
        return await loader.loadTxtAsync(realUrl);
    },
    getBasePath: (): string=> {
        return null;
    }
}
loader.register(["txt", "xml", "vsh", "fsh", "atlas"], _txtLoader);


export var _jsonLoader: ILoader = {
    loadAsync: async (realUrl: string, url: string, res: any): Promise<iResource> => {
        return await loader.loadJsonAsync<any>(realUrl);
    },
    getBasePath: (): string => {
        return null;
    }
};
loader.register(["json", "ExportJson"], _jsonLoader);

export var _jsLoader: ILoader = {
    loadAsync: async (realUrl: string, url: string, res: any): Promise<iResource> => {
        await loader.loadJsAsync(null, [realUrl]);
        return null;
    },
    getBasePath: (): string => {
        return null;
    }
};
loader.register(["js"], _jsLoader);



export var _imgLoader: ILoader = {
    loadAsync: async (realUrl: string, url: string, res: any): Promise<iResource> => {
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
    getBasePath: (): string => {
        return null;
    }
};
loader.register(["png", "jpg", "bmp", "jpeg", "gif", "ico", "tiff", "webp"], _imgLoader);



export var _serverImgLoader: ILoader = {
    loadAsync: async (realUrl: string, url: string, res: any): Promise<iResource> => {
        await _imgLoader.loadAsync(res.src, url, res);
        return null;
    },
    getBasePath: (): string => {
        return null;
    }
};
loader.register(["serverImg"], _serverImgLoader);


export var _plistLoader: ILoader = {
    loadAsync: async (realUrl: string, url: string, res: any): Promise<iResource> => {
        var txt = await loader.loadTxtAsync(realUrl);
        return plistParser.parse(txt);
    },
    getBasePath: (): string => {
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
}
function _loadFont(name:string, srcs:Array<string> | string, type?:string) {
    var doc = document, fontStyle = document.createElement("style");
    fontStyle.type = "text/css";
    doc.body.appendChild(fontStyle);

    var fontStr = "";
    if (isNaN(<any>name - 0))
        fontStr += "@font-face { font-family:" + name + "; src:";
    else
        fontStr += "@font-face { font-family:'" + name + "'; src:";

    if (srcs instanceof Array) {
        for (var i = 0, li = srcs.length; i < li; i++) {
            var src = srcs[i];
            type = path.extname(src).toLowerCase();
            fontStr += "url('" + srcs[i] + "') format('" +(<any>FontTYPEs)[type] + "')";
            fontStr += (i === li - 1) ? ";" : ",";
        }
    } else {
        type = type.toLowerCase();
        fontStr += "url('" + srcs + "') format('" + (<any>FontTYPEs)[type] + "');";
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


export var _fontLoader: ILoader = {
    loadAsync: async (realUrl: string, url: string, res: any): Promise<iResource> => {
        var p = new Promise<iResource>((resolve, reject) => {
            var type = res.type, name = res.name, srcs = res.srcs;
            if (isString(res)) {
                type = path.extname(res);
                name = path.basename(res, type);
                _loadFont(name, res, type);
            } else {
                _loadFont(name, srcs);
            }
            if ((<any>document).fonts) {
                (<any>document).fonts.load("1em " + name).then(()=> {
                    resolve(true);
                }, (err:any)=> {
                    reject(err);
                });
            } else {
                resolve(true);
            }
        });
        return p;
    },
    getBasePath: (): string => {
        return null;
    }
};
loader.register(["font", "eot", "ttf", "woff", "svg", "ttc"], _fontLoader);


export var _binaryLoader: ILoader = {
    loadAsync: async (realUrl: string, url: string, res: any): Promise<iResource> => {
        return await loader.loadBinaryAsync(realUrl);
    },
    getBasePath: (): string => {
        return null;
    }
};

export var _csbLoader: ILoader = {
    loadAsync: async (realUrl: string, url: string, res: any): Promise<iResource> => {
        return await loader.loadCsbAsync(realUrl);
    },
    getBasePath: (): string => {
        return null;
    }
};
loader.register(["csb"], _csbLoader);


