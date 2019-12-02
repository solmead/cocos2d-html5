
import { log } from "../../startup/CCDebugger";
import { GLProgram } from "./ccglprogram";
import { Dictionary } from "../../extensions/syslibs/LinqToJs";
import { SHADER_POSITION, ATTRIBUTE_NAME, VERTEX_ATTRIB } from "../core/platform/index";
import { Shaders } from "./CCShaders";

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


export enum TYPE_POSITION {
    /**
     * @public
     * @constant
     * @type {Number}
     */
    TEXTURECOLOR= 0,
    /**
     * @public
     * @constant
     * @type {Number}
     */
    TEXTURECOLOR_ALPHATEST= 1,
    /**
     * @public
     * @constant
     * @type {Number}
     */
    COLOR= 2,
    /**
     * @public
     * @constant
     * @type {Number}
     */
    TEXTURE= 3,
    /**
     * @public
     * @constant
     * @type {Number}
     */
    TEXTURE_UCOLOR= 4,
    /**
     * @public
     * @constant
     * @type {Number}
     */
    TEXTURE_A8COLOR= 5,
    /**
     * @public
     * @constant
     * @type {Number}
     */
    UCOLOR= 6,
    /**
     * @public
     * @constant
     * @type {Number}
     */
    LENGTH_TEXTURECOLOR= 7,
    /**
     * @public
     * @constant
     * @type {Number}
     */
    SPRITE_TEXTURECOLOR= 8,
    /**
     * @public
     * @constant
     * @type {Number}
     */
    SPRITE_TEXTURECOLOR_ALPHATEST= 9,
    /**
     * @public
     * @constant
     * @type {Number}
     */
    SPRITE_COLOR= 10,
    /**
     * @public
     * @constant
     * @type {Number}
     */
    SPRITE_TEXTURECOLOR_GRAY= 11,
    /**
     * @public
     * @constant
     * @type {Number}
     */
    MAX= 11,
}
var _keyMap = [
    SHADER_POSITION.TEXTURECOLOR,
    SHADER_POSITION.TEXTURECOLORALPHATEST,
    SHADER_POSITION.COLOR,
    SHADER_POSITION.TEXTURE,
    SHADER_POSITION.TEXTURE_UCOLOR,
    SHADER_POSITION.TEXTUREA8COLOR,
    SHADER_POSITION.UCOLOR,
    SHADER_POSITION.LENGTHTEXTURECOLOR,
    SHADER_POSITION.SPRITE_TEXTURECOLOR,
    SHADER_POSITION.SPRITE_TEXTURECOLORALPHATEST,
    SHADER_POSITION.SPRITE_COLOR,
    SHADER_POSITION.SPRITE_TEXTURECOLOR_GRAY
]


/**
 * cc.shaderCache is a singleton object that stores manages GL shaders
 * @class
 * @name cc.shaderCache
 */
export class ShaderCache {
    _programs = new Dictionary<string, GLProgram>();

    constructor() {

    }

    _init(): boolean {
        this.loadDefaultShaders();
        return true;
    }

    _loadDefaultShader(program: GLProgram, type: SHADER_POSITION): void {
        switch (type) {
            case SHADER_POSITION.TEXTURECOLOR:
                program.initWithVertexShaderByteArray(Shaders.TEXTURE_COLOR_VERT, Shaders.TEXTURE_COLOR_FRAG);
                program.addAttribute(ATTRIBUTE_NAME.POSITION, VERTEX_ATTRIB.POSITION);
                program.addAttribute(ATTRIBUTE_NAME.COLOR, VERTEX_ATTRIB.COLOR);
                program.addAttribute(ATTRIBUTE_NAME.TEX_COORD, VERTEX_ATTRIB.TEX_COORDS);
                break;
            case SHADER_POSITION.SPRITE_TEXTURECOLOR:
                program.initWithVertexShaderByteArray(Shaders.SPRITE_TEXTURE_COLOR_VERT, Shaders.TEXTURE_COLOR_FRAG);
                program.addAttribute(ATTRIBUTE_NAME.POSITION, VERTEX_ATTRIB.POSITION);
                program.addAttribute(ATTRIBUTE_NAME.COLOR, VERTEX_ATTRIB.COLOR);
                program.addAttribute(ATTRIBUTE_NAME.TEX_COORD, VERTEX_ATTRIB.TEX_COORDS);
                break;
            case SHADER_POSITION.SPRITE_TEXTURECOLOR_GRAY:
                program.initWithVertexShaderByteArray(Shaders.SPRITE_TEXTURE_COLOR_VERT, Shaders.SPRITE_TEXTURE_COLOR_GRAY_FRAG);
                program.addAttribute(ATTRIBUTE_NAME.POSITION, VERTEX_ATTRIB.POSITION);
                program.addAttribute(ATTRIBUTE_NAME.COLOR, VERTEX_ATTRIB.COLOR);
                program.addAttribute(ATTRIBUTE_NAME.TEX_COORD, VERTEX_ATTRIB.TEX_COORDS);
                break;
            case SHADER_POSITION.TEXTURECOLORALPHATEST:
                program.initWithVertexShaderByteArray(Shaders.TEXTURE_COLOR_VERT, Shaders.TEXTURE_COLOR_ALPHATEST_FRAG);
                program.addAttribute(ATTRIBUTE_NAME.POSITION, VERTEX_ATTRIB.POSITION);
                program.addAttribute(ATTRIBUTE_NAME.COLOR, VERTEX_ATTRIB.COLOR);
                program.addAttribute(ATTRIBUTE_NAME.TEX_COORD, VERTEX_ATTRIB.TEX_COORDS);
                break;
            case SHADER_POSITION.SPRITE_TEXTURECOLORALPHATEST:
                program.initWithVertexShaderByteArray(Shaders.TEXTURE_COLOR_VERT, Shaders.TEXTURE_COLOR_ALPHATEST_FRAG);
                program.addAttribute(ATTRIBUTE_NAME.POSITION, VERTEX_ATTRIB.POSITION);
                program.addAttribute(ATTRIBUTE_NAME.COLOR, VERTEX_ATTRIB.COLOR);
                program.addAttribute(ATTRIBUTE_NAME.TEX_COORD, VERTEX_ATTRIB.TEX_COORDS);
                break;
            case SHADER_POSITION.COLOR:
                program.initWithVertexShaderByteArray(Shaders.COLOR_VERT, Shaders.COLOR_FRAG);
                program.addAttribute(ATTRIBUTE_NAME.POSITION, VERTEX_ATTRIB.POSITION);
                program.addAttribute(ATTRIBUTE_NAME.COLOR, VERTEX_ATTRIB.COLOR);
                break;
            case SHADER_POSITION.SPRITE_COLOR:
                program.initWithVertexShaderByteArray(Shaders.SPRITE_COLOR_VERT, Shaders.COLOR_FRAG);
                program.addAttribute(ATTRIBUTE_NAME.POSITION, VERTEX_ATTRIB.POSITION);
                program.addAttribute(ATTRIBUTE_NAME.COLOR, VERTEX_ATTRIB.COLOR);
                break;
            case SHADER_POSITION.TEXTURE:
                program.initWithVertexShaderByteArray(Shaders.TEXTURE_VERT, Shaders.TEXTURE_FRAG);
                program.addAttribute(ATTRIBUTE_NAME.POSITION, VERTEX_ATTRIB.POSITION);
                program.addAttribute(ATTRIBUTE_NAME.TEX_COORD, VERTEX_ATTRIB.TEX_COORDS);
                break;
            case SHADER_POSITION.TEXTURE_UCOLOR:
                program.initWithVertexShaderByteArray(Shaders.TEXTURE_UCOLOR_VERT, Shaders.TEXTURE_UCOLOR_FRAG);
                program.addAttribute(ATTRIBUTE_NAME.POSITION, VERTEX_ATTRIB.POSITION);
                program.addAttribute(ATTRIBUTE_NAME.TEX_COORD, VERTEX_ATTRIB.TEX_COORDS);
                break;
            case SHADER_POSITION.TEXTUREA8COLOR:
                program.initWithVertexShaderByteArray(Shaders.TEXTURE_A8COLOR_VERT, Shaders.TEXTURE_A8COLOR_FRAG);
                program.addAttribute(ATTRIBUTE_NAME.POSITION, VERTEX_ATTRIB.POSITION);
                program.addAttribute(ATTRIBUTE_NAME.COLOR, VERTEX_ATTRIB.COLOR);
                program.addAttribute(ATTRIBUTE_NAME.TEX_COORD, VERTEX_ATTRIB.TEX_COORDS);
                break;
            case SHADER_POSITION.UCOLOR:
                program.initWithVertexShaderByteArray(Shaders.UCOLOR_VERT, Shaders.UCOLOR_FRAG);
                program.addAttribute("aVertex", VERTEX_ATTRIB.POSITION);
                break;
            case SHADER_POSITION.LENGTHTEXTURECOLOR:
                program.initWithVertexShaderByteArray(Shaders.COLOR_LENGTH_TEXTURE_VERT, Shaders.COLOR_LENGTH_TEXTURE_FRAG);
                program.addAttribute(ATTRIBUTE_NAME.POSITION, VERTEX_ATTRIB.POSITION);
                program.addAttribute(ATTRIBUTE_NAME.TEX_COORD, VERTEX_ATTRIB.TEX_COORDS);
                program.addAttribute(ATTRIBUTE_NAME.COLOR, VERTEX_ATTRIB.COLOR);
                break;
            default:
                log("cocos2d: cc.shaderCache._loadDefaultShader, error shader type");
                return;
        }

        program.link();
        program.updateUniforms();

        //cc.checkGLErrorDebug();
    }

    /**
     * loads the default shaders
     */
    loadDefaultShaders(): void {
        for (var i = 0; i < TYPE_POSITION.MAX; ++i) {
            var key = _keyMap[i];
            this.programForKey(key);
        }
    }


    /**
     * reload the default shaders
     */
    reloadDefaultShaders(): void {
        // reset all programs and reload them

        // Position Texture Color shader
        var program = this.programForKey(SHADER_POSITION.TEXTURECOLOR);
        program.reset();
        this._loadDefaultShader(program, SHADER_POSITION.TEXTURECOLOR);

        // Sprite Position Texture Color shader
        program = this.programForKey(SHADER_POSITION.SPRITE_TEXTURECOLOR);
        program.reset();
        this._loadDefaultShader(program, SHADER_POSITION.SPRITE_TEXTURECOLOR);

        // Position Texture Color alpha test
        program = this.programForKey(SHADER_POSITION.TEXTURECOLORALPHATEST);
        program.reset();
        this._loadDefaultShader(program, SHADER_POSITION.TEXTURECOLORALPHATEST);

        // Sprite Position Texture Color alpha shader
        program = this.programForKey(SHADER_POSITION.SPRITE_TEXTURECOLORALPHATEST);
        program.reset();
        this._loadDefaultShader(program, SHADER_POSITION.SPRITE_TEXTURECOLORALPHATEST);

        //
        // Position, Color shader
        //
        program = this.programForKey(SHADER_POSITION.COLOR);
        program.reset();
        this._loadDefaultShader(program, SHADER_POSITION.COLOR);

        //
        // Position Texture shader
        //
        program = this.programForKey(SHADER_POSITION.TEXTURE);
        program.reset();
        this._loadDefaultShader(program, SHADER_POSITION.TEXTURE);

        ////Position Texture Gray shader
        //program = this.programForKey(SHADER_POSITION.SPRITE_TEXTURE_COLOR_GRAY_FRAG);
        //program.reset();
        //this._loadDefaultShader(program, SHADER_POSITION.SPRITE_TEXTURE_COLOR_GRAY_FRAG);

        //
        // Position, Texture attribs, 1 Color as uniform shader
        //
        program = this.programForKey(SHADER_POSITION.TEXTURE_UCOLOR);
        program.reset();
        this._loadDefaultShader(program, SHADER_POSITION.TEXTURE_UCOLOR);

        //
        // Position Texture A8 Color shader
        //
        program = this.programForKey(SHADER_POSITION.TEXTUREA8COLOR);
        program.reset();
        this._loadDefaultShader(program, SHADER_POSITION.TEXTUREA8COLOR);

        //
        // Position and 1 color passed as a uniform (to similate glColor4ub )
        //
        program = this.programForKey(SHADER_POSITION.UCOLOR);
        program.reset();
        this._loadDefaultShader(program, SHADER_POSITION.UCOLOR);
    }


    /**
     * returns a GL program for a given key
     * @param {String} key
     */
    programForKey(key: SHADER_POSITION): GLProgram {
        if (!this._programs.containsKey(key)) {
            var program = new GLProgram();
            this._loadDefaultShader(program, key);
            this._programs.set(key, program);
        }

        return this._programs.get(key);
    }

    /**
     * returns a GL program for a shader name
     * @param {String} shaderName
     * @return {cc.GLProgram}
     */
    getProgram(shaderName: SHADER_POSITION): GLProgram {
        return this.programForKey(shaderName);
    }

    /**
     * adds a CCGLProgram to the cache for a given name
     * @param {cc.GLProgram} program
     * @param {String} key
     */
    addProgram(program: GLProgram, key: SHADER_POSITION): void {
        this._programs.set(key, program);
    }



}



export var shaderCache: ShaderCache = new ShaderCache();