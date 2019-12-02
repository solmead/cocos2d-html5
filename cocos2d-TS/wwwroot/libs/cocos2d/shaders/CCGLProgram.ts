import { ccClass, checkGLErrorDebug, UNIFORM_S } from "../core/platform/index"
import { Dictionary } from "../../extensions/syslibs/LinqToJs";
import { game } from "../../startup/CCGame";
import { WebGlContext } from "../core/renderer/index";
import { log } from "../../startup/CCDebugger";
import { loader } from "../../startup/CCLoader";
import { director } from "../core/CCDirector";
import { ccNode, WebGLRenderCmd } from "../core/base-nodes/index";
import { glDeleteProgram, glUseProgram } from "./CCGLStateCache";

import * as math from "../kazmath/index";
import { kmMat4Multiply, getMat4MultiplyValue, kmGLGetMatrix, MatrixMode, projection_matrix_stack, modelview_matrix_stack } from "../kazmath/index";

/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.
 Copyright 2011 Jeff Lamarche
 Copyright 2012 Goffredo Marocchi

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

export interface WebGLUniformLocationName extends WebGLUniformLocation {
    _name: string;
}

/**
 * Class that implements a WebGL program
 * @class
 * @extends cc.Class
 */
export class GLProgram extends ccClass {
    _glContext: WebGlContext = null;
    _programObj: WebGLProgram = null;
    _vertShader: WebGLShader = null;
    _fragShader: WebGLShader = null;
    _uniforms = new Dictionary <string, WebGLUniformLocation>();
    _hashForUniforms = new Dictionary<string, Array<any>>();
    _usesTime:boolean = false;
    _projectionUpdated: number = -1;


    static _highpSupported:boolean = null;
    static _isHighpSupported():boolean {
        var ctx = game.renderContextWebGl;
        if (ctx.getShaderPrecisionFormat && GLProgram._highpSupported == null) {
            var highp = ctx.getShaderPrecisionFormat(ctx.FRAGMENT_SHADER, ctx.HIGH_FLOAT);
            GLProgram._highpSupported = highp.precision !== 0;
        }
        return GLProgram._highpSupported;
    }




    constructor(vShaderFileName?:string, fShaderFileName?:string, glContext?:WebGlContext) {
        super();

        this._glContext = glContext || game.renderContextWebGl;

        vShaderFileName && fShaderFileName && this.init(vShaderFileName, fShaderFileName);
    }

    // Uniform cache
    _updateUniform(name: string, ...args:Array<any>): boolean {
        if (!name)
            return false;

        var updated = false;
        var element = this._hashForUniforms.get(name);
        var argsList;
        if (Array.isArray(args[0])) {
            argsList = args[0];
        } else {
            argsList = args;
        }

        if (!element || element.length !== argsList.length) {
            this._hashForUniforms.set(name, [].concat(argsList));
            updated = true;
        } else {
            for (var i = 0; i < argsList.length; i += 1) {
                // Array and Typed Array inner values could be changed, so we must update them
                if (argsList[i] !== element[i] || typeof argsList[i] === 'object') {
                    element[i] = argsList[i];
                    updated = true;
                }
            }
        }

        return updated;
    }
    _description(): string {
        return "<CCGLProgram = " + this.toString() + " | Program = " + this._programObj.toString() + ", VertexShader = " +
            this._vertShader.toString() + ", FragmentShader = " + this._fragShader.toString() + ">";
    }

    _compileShader(shader: WebGLShader, type:number, source:string): boolean {
        if (!source || !shader)
            return false;

        var preStr = GLProgram._isHighpSupported() ? "precision highp float;\n" : "precision mediump float;\n";
        source = preStr
            + "uniform mat4 CC_PMatrix;         \n"
            + "uniform mat4 CC_MVMatrix;        \n"
            + "uniform mat4 CC_MVPMatrix;       \n"
            + "uniform vec4 CC_Time;            \n"
            + "uniform vec4 CC_SinTime;         \n"
            + "uniform vec4 CC_CosTime;         \n"
            + "uniform vec4 CC_Random01;        \n"
            + "uniform sampler2D CC_Texture0;   \n"
            + "//CC INCLUDES END                \n" + source;

        this._glContext.shaderSource(shader, source);
        this._glContext.compileShader(shader);
        var status = this._glContext.getShaderParameter(shader, this._glContext.COMPILE_STATUS);

        if (!status) {
            log("cocos2d: ERROR: Failed to compile shader:\n" + this._glContext.getShaderSource(shader));
            if (type === this._glContext.VERTEX_SHADER)
                log("cocos2d: \n" + this.vertexShaderLog());
            else
                log("cocos2d: \n" + this.fragmentShaderLog());
        }
        return (status === true);
    }
    /**
     * destroy program
     */
    destroyProgram(): void {
        this._vertShader = null;
        this._fragShader = null;
        this._uniforms = null;
        this._hashForUniforms = null;

        this._glContext.deleteProgram(this._programObj);
    }


    /**
     * Initializes the cc.GLProgram with a vertex and fragment with string
     * @param {String} vertShaderStr
     * @param {String} fragShaderStr
     * @return {Boolean}
     */
    initWithVertexShaderByteArray(vertShaderStr: string, fragShaderStr: string): boolean {
        var locGL = this._glContext;
        this._programObj = locGL.createProgram();
        //cc.checkGLErrorDebug();

        this._vertShader = null;
        this._fragShader = null;

        if (vertShaderStr) {
            this._vertShader = locGL.createShader(locGL.VERTEX_SHADER);
            if (!this._compileShader(this._vertShader, locGL.VERTEX_SHADER, vertShaderStr)) {
                log("cocos2d: ERROR: Failed to compile vertex shader");
            }
        }

        // Create and compile fragment shader
        if (fragShaderStr) {
            this._fragShader = locGL.createShader(locGL.FRAGMENT_SHADER);
            if (!this._compileShader(this._fragShader, locGL.FRAGMENT_SHADER, fragShaderStr)) {
                log("cocos2d: ERROR: Failed to compile fragment shader");
            }
        }

        if (this._vertShader)
            locGL.attachShader(this._programObj, this._vertShader);
        checkGLErrorDebug();

        if (this._fragShader)
            locGL.attachShader(this._programObj, this._fragShader);

        if (Object.keys(this._hashForUniforms).length > 0) {
            this._hashForUniforms = new Dictionary<string, Array<any>>();
        }

        checkGLErrorDebug();
        return true;
    }
    /**
     * Initializes the cc.GLProgram with a vertex and fragment with string
     * @param {String} vertShaderStr
     * @param {String} fragShaderStr
     * @return {Boolean}
     */
    initWithString(vertShaderStr: string, fragShaderStr: string): boolean {
        return this.initWithVertexShaderByteArray(vertShaderStr, fragShaderStr);
    }
    /**
     * Initializes the CCGLProgram with a vertex and fragment with contents of filenames
     * @param {String} vShaderFilename
     * @param {String} fShaderFileName
     * @return {Boolean}
     */
    initWithVertexShaderFilename(vShaderFilename: string, fShaderFileName: string): boolean {
        var vertexSource = <string>loader.getRes(vShaderFilename);
        if (!vertexSource) throw new Error("Please load the resource firset : " + vShaderFilename);
        var fragmentSource = <string>loader.getRes(fShaderFileName);
        if (!fragmentSource) throw new Error("Please load the resource firset : " + fShaderFileName);
        return this.initWithVertexShaderByteArray(vertexSource, fragmentSource);
    }
    /**
     * Initializes the CCGLProgram with a vertex and fragment with contents of filenames
     * @param {String} vShaderFilename
     * @param {String} fShaderFileName
     * @return {Boolean}
     */
    init(vShaderFilename: string, fShaderFileName: string): boolean {
        return this.initWithVertexShaderFilename(vShaderFilename, fShaderFileName);
    }
    /**
     * It will add a new attribute to the shader
     * @param {String} attributeName
     * @param {Number} index
     */
    addAttribute(attributeName: string, index: number): void {
        this._glContext.bindAttribLocation(this._programObj, index, attributeName);
    }

    /**
     * links the glProgram
     * @return {Boolean}
     */
    link(): boolean {
        if (!this._programObj) {
            log("cc.GLProgram.link(): Cannot link invalid program");
            return false;
        }

        this._glContext.linkProgram(this._programObj);

        if (this._vertShader)
            this._glContext.deleteShader(this._vertShader);
        if (this._fragShader)
            this._glContext.deleteShader(this._fragShader);

        this._vertShader = null;
        this._fragShader = null;

        if (game.config.debugMode) {
            var status = this._glContext.getProgramParameter(this._programObj, this._glContext.LINK_STATUS);
            if (!status) {
                log("cocos2d: ERROR: Failed to link program: " + this._glContext.getProgramInfoLog(this._programObj));
                glDeleteProgram(this._programObj);
                this._programObj = null;
                return false;
            }
        }

        return true;
    }
    /**
     * it will call glUseProgram()
     */
    use(): void {
        glUseProgram(this._programObj);
    }

    /**
     * It will create 4 uniforms:
     *  UNIFORM_S.PMATRIX
     *  UNIFORM_S.MVMATRIX
     *  UNIFORM_S.MVPMATRIX
     *  UNIFORM_S.SAMPLER
     */
    updateUniforms(): void {
        this._addUniformLocation(UNIFORM_S.PMATRIX_S);
        this._addUniformLocation(UNIFORM_S.MVMATRIX_S);
        this._addUniformLocation(UNIFORM_S.MVPMATRIX_S);
        this._addUniformLocation(UNIFORM_S.TIME_S);
        this._addUniformLocation(UNIFORM_S.SINTIME_S);
        this._addUniformLocation(UNIFORM_S.COSTIME_S);
        this._addUniformLocation(UNIFORM_S.RANDOM01_S);
        this._addUniformLocation(UNIFORM_S.SAMPLER_S);
        this._usesTime = (this._uniforms.get(UNIFORM_S.TIME_S) != null || this._uniforms.get(UNIFORM_S.SINTIME_S) != null || this._uniforms.get(UNIFORM_S.COSTIME_S) != null);

        this.use();
        // Since sample most probably won't change, set it to 0 now.
        this.setUniformLocationWith1i(this._uniforms.get(UNIFORM_S.SAMPLER_S), 0);
    }
    _addUniformLocation(name: string): WebGLUniformLocation {
        var location = <WebGLUniformLocationName>this._glContext.getUniformLocation(this._programObj, name);
        if (location) location._name = name;
        this._uniforms.set(name, location);
        return location;
    }

    /**
     * calls retrieves the named uniform location for this shader program.
     * @param {String} name
     * @returns {Number}
     */
    getUniformLocationForName(name: string): WebGLUniformLocation {
        if (!name)
            throw new Error("cc.GLProgram.getUniformLocationForName(): uniform name should be non-null");
        if (!this._programObj)
            throw new Error("cc.GLProgram.getUniformLocationForName(): Invalid operation. Cannot get uniform location when program is not initialized");

        var location = this._uniforms.get(name) || this._addUniformLocation(name);
        return location;
    }
    /**
     * get uniform MVP matrix
     * @returns {WebGLUniformLocation}
     */
    getUniformMVPMatrix(): WebGLUniformLocation {
        return this._uniforms.get(UNIFORM_S.MVPMATRIX_S);
    }
    /**
     * get uniform sampler
     * @returns {WebGLUniformLocation}
     */
    getUniformSampler(): WebGLUniformLocation {
        return this._uniforms.get(UNIFORM_S.SAMPLER_S);
    }
    /**
     * calls glUniform1i only if the values are different than the previous call for this same shader program.
     * @param {WebGLUniformLocation|String} location
     * @param {Number} i1
     */
    setUniformLocationWith1i(location: WebGLUniformLocation | string, i1: number): void {
        var isString = typeof location === 'string';
        var name = isString ? <string>location : location && (<WebGLUniformLocationName>location)._name;
        if (name) {
            if (this._updateUniform(name, i1)) {
                if (isString) location = this.getUniformLocationForName(name);
                this._glContext.uniform1i(location, i1);
            }
        } else {
            this._glContext.uniform1i(location, i1);
        }
    }

    /**
     * calls glUniform2i only if the values are different than the previous call for this same shader program.
     * @param {WebGLUniformLocation|String} location
     * @param {Number} i1
     * @param {Number} i2
     */
    setUniformLocationWith2i(location: WebGLUniformLocation | string, i1: number, i2: number): void {
        var isString = typeof location === 'string';
        var name = isString ? <string>location : location && (<WebGLUniformLocationName>location)._name;
        if (name) {
            if (this._updateUniform(name, i1, i2)) {
                if (isString) location = this.getUniformLocationForName(name);
                this._glContext.uniform2i(location, i1, i2);
            }
        } else {
            this._glContext.uniform2i(location, i1, i2);
        }
    }
    /**
     * calls glUniform3i only if the values are different than the previous call for this same shader program.
     * @param {WebGLUniformLocation|String} location
     * @param {Number} i1
     * @param {Number} i2
     * @param {Number} i3
     */
    setUniformLocationWith3i(location: WebGLUniformLocation | string, i1: number, i2: number, i3: number): void {
        var isString = typeof location === 'string';
        var name = isString ? <string>location : location && (<WebGLUniformLocationName>location)._name;
        if (name) {
            if (this._updateUniform(name, i1, i2, i3)) {
                if (isString) location = this.getUniformLocationForName(name);
                this._glContext.uniform3i(location, i1, i2, i3);
            }
        } else {
            this._glContext.uniform3i(location, i1, i2, i3);
        }
    }
    /**
     * calls glUniform4i only if the values are different than the previous call for this same shader program.
     * @param {WebGLUniformLocation|String} location
     * @param {Number} i1
     * @param {Number} i2
     * @param {Number} i3
     * @param {Number} i4
     */
    setUniformLocationWith4i(location: WebGLUniformLocation | string, i1: number, i2: number, i3: number, i4: number): void {
        var isString = typeof location === 'string';
        var name = isString ? <string>location : location && (<WebGLUniformLocationName>location)._name;
        if (name) {
            if (this._updateUniform(name, i1, i2, i3, i4)) {
                if (isString) location = this.getUniformLocationForName(name);
                this._glContext.uniform4i(location, i1, i2, i3, i4);
            }
        } else {
            this._glContext.uniform4i(location, i1, i2, i3, i4);
        }
    }


    /**
     * calls glUniform2iv
     * @param {WebGLUniformLocation|String} location
     * @param {Int32Array} intArray
     * @param {Number} numberOfArrays
     */
    setUniformLocationWith2iv(location: WebGLUniformLocation | string, intArray: Int32Array):void {
        var isString = typeof location === 'string';
        var name = isString ? <string>location : location && (<WebGLUniformLocationName>location)._name;
        if (name) {
            if (this._updateUniform(name, intArray)) {
                if (isString) location = this.getUniformLocationForName(name);
                this._glContext.uniform2iv(location, intArray);
            }
        } else {
            this._glContext.uniform2iv(location, intArray);
        }
    }
    /**
     * calls glUniform3iv
     * @param {WebGLUniformLocation|String} location
     * @param {Int32Array} intArray
     */
    setUniformLocationWith3iv(location: WebGLUniformLocation | string, intArray: Int32Array): void {
        var isString = typeof location === 'string';
        var name = isString ? <string>location : location && (<WebGLUniformLocationName>location)._name;
        if (name) {
            if (this._updateUniform(name, intArray)) {
                if (isString) location = this.getUniformLocationForName(name);
                this._glContext.uniform3iv(location, intArray);
            }
        } else {
            this._glContext.uniform3iv(location, intArray);
        }
    }
    /**
     * calls glUniform4iv
     * @param {WebGLUniformLocation|String} location
     * @param {Int32Array} intArray
     */
    setUniformLocationWith4iv(location: WebGLUniformLocation | string, intArray: Int32Array): void {
        var isString = typeof location === 'string';
        var name = isString ? <string>location : location && (<WebGLUniformLocationName>location)._name;
        if (name) {
            if (this._updateUniform(name, intArray)) {
                if (isString) location = this.getUniformLocationForName(name);
                this._glContext.uniform4iv(location, intArray);
            }
        } else {
            this._glContext.uniform4iv(location, intArray);
        }
    }
    /**
     * calls glUniform1i only if the values are different than the previous call for this same shader program.
     * @param {WebGLUniformLocation|String} location
     * @param {Number} i1
     */
    setUniformLocationI32(location: WebGLUniformLocation | string, i1: number): void {
        this.setUniformLocationWith1i(location, i1);
    }
    /**
     * calls glUniform1f only if the values are different than the previous call for this same shader program.
     * @param {WebGLUniformLocation|String} location
     * @param {Number} f1
     */
    setUniformLocationWith1f(location: WebGLUniformLocation | string, f1: number) {
        var isString = typeof location === 'string';
        var name = isString ? <string>location : location && (<WebGLUniformLocationName>location)._name;
        if (name) {
            if (this._updateUniform(name, f1)) {
                if (isString) location = this.getUniformLocationForName(name);
                this._glContext.uniform1f(location, f1);
            }
        } else {
            this._glContext.uniform1f(location, f1);
        }
    }
    /**
    * calls glUniform2f only if the values are different than the previous call for this same shader program.
    * @param {WebGLUniformLocation|String} location
    * @param {Number} f1
    * @param {Number} f2
    */
    setUniformLocationWith2f(location: WebGLUniformLocation | string, f1: number, f2: number): void {
        var isString = typeof location === 'string';
        var name = isString ? <string>location : location && (<WebGLUniformLocationName>location)._name;
        if (name) {
            if (this._updateUniform(name, f1, f2)) {
                if (isString) location = this.getUniformLocationForName(name);
                this._glContext.uniform2f(location, f1, f2);
            }
        } else {
            this._glContext.uniform2f(location, f1, f2);
        }
    }

    /**
     * calls glUniform3f only if the values are different than the previous call for this same shader program.
     * @param {WebGLUniformLocation|String} location
     * @param {Number} f1
     * @param {Number} f2
     * @param {Number} f3
     */
    setUniformLocationWith3f(location: WebGLUniformLocation | string, f1: number, f2: number, f3: number):void {
        var isString = typeof location === 'string';
        var name = isString ? <string>location : location && (<WebGLUniformLocationName>location)._name;
        if (name) {
            if (this._updateUniform(name, f1, f2, f3)) {
                if (isString) location = this.getUniformLocationForName(name);
                this._glContext.uniform3f(location, f1, f2, f3);
            }
        } else {
            this._glContext.uniform3f(location, f1, f2, f3);
        }
    }

/**
 * calls glUniform4f only if the values are different than the previous call for this same shader program.
 * @param {WebGLUniformLocation|String} location
 * @param {Number} f1
 * @param {Number} f2
 * @param {Number} f3
 * @param {Number} f4
 */
    setUniformLocationWith4f(location: WebGLUniformLocation | string, f1: number, f2: number, f3: number, f4: number): void {
        var isString = typeof location === 'string';
        var name = isString ? <string>location : location && (<WebGLUniformLocationName>location)._name;
        if (name) {
            if (this._updateUniform(name, f1, f2, f3, f4)) {
                if (isString) location = this.getUniformLocationForName(name);
                this._glContext.uniform4f(location, f1, f2, f3, f4);
            }
        } else {
            this._glContext.uniform4f(location, f1, f2, f3, f4);
            log('uniform4f', f1, f2, f3, f4);
        }
    }

/**
 * calls glUniform2fv
 * @param {WebGLUniformLocation|String} location
 * @param {Float32Array} floatArray
 */
    setUniformLocationWith2fv(location: WebGLUniformLocation | string, floatArray: Float32Array): void {
        var isString = typeof location === 'string';
        var name = isString ? <string>location : location && (<WebGLUniformLocationName>location)._name;
        if (name) {
            if (this._updateUniform(name, floatArray)) {
                if (isString) location = this.getUniformLocationForName(name);
                this._glContext.uniform2fv(location, floatArray);
            }
        } else {
            this._glContext.uniform2fv(location, floatArray);
        }
    }

/**
 * calls glUniform3fv
 * @param {WebGLUniformLocation|String} location
 * @param {Float32Array} floatArray
 */
    setUniformLocationWith3fv(location: WebGLUniformLocation | string, floatArray: Float32Array): void {
        var isString = typeof location === 'string';
        var name = isString ? <string>location : location && (<WebGLUniformLocationName>location)._name;
        if (name) {
            if (this._updateUniform(name, floatArray)) {
                if (isString) location = this.getUniformLocationForName(name);
                this._glContext.uniform3fv(location, floatArray);
            }
        } else {
            this._glContext.uniform3fv(location, floatArray);
        }
    }

/**
 * calls glUniform4fv
 * @param {WebGLUniformLocation|String} location
 * @param {Float32Array} floatArray
 */
    setUniformLocationWith4fv(location: WebGLUniformLocation | string, floatArray: Float32Array): void {
        var isString = typeof location === 'string';
        var name = isString ? <string>location : location && (<WebGLUniformLocationName>location)._name;
        if (name) {
            if (this._updateUniform(name, floatArray)) {
                if (isString) location = this.getUniformLocationForName(name);
                this._glContext.uniform4fv(location, floatArray);
            }
        } else {
            this._glContext.uniform4fv(location, floatArray);
            log('uniform4fv', floatArray);
        }
    }

/**
 * calls glUniformMatrix2fv
 * @param {WebGLUniformLocation|String} location
 * @param {Float32Array} matrixArray
 */
    setUniformLocationWithMatrix2fv(location: WebGLUniformLocation | string, matrixArray: Float32Array): void {
        var isString = typeof location === 'string';
        var name = isString ? <string>location : location && (<WebGLUniformLocationName>location)._name;
        if (name) {
            if (this._updateUniform(name, matrixArray)) {
                if (isString) location = this.getUniformLocationForName(name);
                this._glContext.uniformMatrix2fv(location, false, matrixArray);
            }
        } else {
            this._glContext.uniformMatrix2fv(location, false, matrixArray);
        }
    }

/**
 * calls glUniformMatrix3fv
 * @param {WebGLUniformLocation|String} location
 * @param {Float32Array} matrixArray
 */
    setUniformLocationWithMatrix3fv(location: WebGLUniformLocation | string, matrixArray: Float32Array): void {
        var isString = typeof location === 'string';
        var name = isString ? <string>location : location && (<WebGLUniformLocationName>location)._name;
        if (name) {
            if (this._updateUniform(name, matrixArray)) {
                if (isString) location = this.getUniformLocationForName(name);
                this._glContext.uniformMatrix3fv(location, false, matrixArray);
            }
        } else {
            this._glContext.uniformMatrix3fv(location, false, matrixArray);
        }
    }

/**
 * calls glUniformMatrix4fv
 * @param {WebGLUniformLocation|String} location
 * @param {Float32Array} matrixArray
 */
    setUniformLocationWithMatrix4fv(location: WebGLUniformLocation | string, matrixArray: Float32Array, i?:number): void {
        var isString = typeof location === 'string';
        var name = isString ? <string>location : location && (<WebGLUniformLocationName>location)._name;
        if (name) {
            if (this._updateUniform(name, matrixArray)) {
                if (isString) location = this.getUniformLocationForName(name);
                this._glContext.uniformMatrix4fv(location, false, matrixArray);
            }
        } else {
            this._glContext.uniformMatrix4fv(location, false, matrixArray);
        }
    }

    setUniformLocationF32(...args: Array<any>) {
        if (args.length < 2)
            return;

        switch (args.length) {
            case 2:
                this.setUniformLocationWith1f(args[0], args[1]);
                break;
            case 3:
                this.setUniformLocationWith2f(args[0], args[1], args[2]);
                break;
            case 4:
                this.setUniformLocationWith3f(args[0], args[1], args[2], args[3]);
                break;
            case 5:
                this.setUniformLocationWith4f(args[0], args[1], args[2], args[3], args[4]);
                break;
        }
    }


    /**
     * will update the builtin uniforms if they are different than the previous call for this same shader program.
     */
    setUniformsForBuiltins(): void {
        var matrixP = new math.Matrix4();
        var matrixMV = new math.Matrix4();
        var matrixMVP = new math.Matrix4();

        kmGLGetMatrix(MatrixMode.PROJECTION, matrixP);
        kmGLGetMatrix(MatrixMode.MODELVIEW, matrixMV);

        kmMat4Multiply(matrixMVP, matrixP, matrixMV);

        this.setUniformLocationWithMatrix4fv(this._uniforms.get(UNIFORM_S.PMATRIX_S), matrixP.mat, 1);
        this.setUniformLocationWithMatrix4fv(this._uniforms.get(UNIFORM_S.MVMATRIX_S), matrixMV.mat, 1);
        this.setUniformLocationWithMatrix4fv(this._uniforms.get(UNIFORM_S.MVPMATRIX_S), matrixMVP.mat, 1);

        if (this._usesTime) {
            // This doesn't give the most accurate global time value.
            // Cocos2D doesn't store a high precision time value, so this will have to do.
            // Getting Mach time per frame per shader using time could be extremely expensive.
            var time = director.getTotalFrames() * director.getAnimationInterval();

            this.setUniformLocationWith4f(this._uniforms.get(UNIFORM_S.TIME_S), time / 10.0, time, time * 2, time * 4);
            this.setUniformLocationWith4f(this._uniforms.get(UNIFORM_S.SINTIME_S), time / 8.0, time / 4.0, time / 2.0, Math.sin(time));
            this.setUniformLocationWith4f(this._uniforms.get(UNIFORM_S.COSTIME_S), time / 8.0, time / 4.0, time / 2.0, Math.cos(time));
        }

        if (this._uniforms.get(UNIFORM_S.RANDOM01_S) !== -1)
            this.setUniformLocationWith4f(this._uniforms.get(UNIFORM_S.RANDOM01_S), Math.random(), Math.random(), Math.random(), Math.random());
    }



    _setUniformsForBuiltinsForRenderer(node: ccNode): void {
        if (!node || !node._renderCmd)
            return;

        var matrixP = new math.Matrix4();
        //var matrixMV = new cc.kmMat4();
        var matrixMVP = new math.Matrix4();

        kmGLGetMatrix(MatrixMode.PROJECTION, matrixP);
        //cc.kmGLGetMatrix(cc.KM_GL_MODELVIEW, node._stackMatrix);

        var _stackMatrix = (<WebGLRenderCmd>node._renderCmd)._stackMatrix;

        kmMat4Multiply(matrixMVP, matrixP, _stackMatrix);

        this.setUniformLocationWithMatrix4fv(this._uniforms.get(UNIFORM_S.PMATRIX_S), matrixP.mat, 1);
        this.setUniformLocationWithMatrix4fv(this._uniforms.get(UNIFORM_S.MVMATRIX_S), _stackMatrix.mat, 1);
        this.setUniformLocationWithMatrix4fv(this._uniforms.get(UNIFORM_S.MVPMATRIX_S), matrixMVP.mat, 1);

        if (this._usesTime) {
            // This doesn't give the most accurate global time value.
            // Cocos2D doesn't store a high precision time value, so this will have to do.
            // Getting Mach time per frame per shader using time could be extremely expensive.
            var time = director.getTotalFrames() * director.getAnimationInterval();

            this.setUniformLocationWith4f(this._uniforms.get(UNIFORM_S.TIME_S), time / 10.0, time, time * 2, time * 4);
            this.setUniformLocationWith4f(this._uniforms.get(UNIFORM_S.SINTIME_S), time / 8.0, time / 4.0, time / 2.0, Math.sin(time));
            this.setUniformLocationWith4f(this._uniforms.get(UNIFORM_S.COSTIME_S), time / 8.0, time / 4.0, time / 2.0, Math.cos(time));
        }

        if (this._uniforms.get(UNIFORM_S.RANDOM01_S) !== -1)
            this.setUniformLocationWith4f(this._uniforms.get(UNIFORM_S.RANDOM01_S), Math.random(), Math.random(), Math.random(), Math.random());
    }


    /**
     * will update the MVP matrix on the MVP uniform if it is different than the previous call for this same shader program.
     */
    setUniformForModelViewProjectionMatrix(): void {
        this.setUniformLocationWithMatrix4fv(this._uniforms.get(UNIFORM_S.MVPMATRIX_S),
            getMat4MultiplyValue(projection_matrix_stack.top, modelview_matrix_stack.top));
    }

    setUniformForModelViewProjectionMatrixWithMat4(swapMat4: math.Matrix4):void {
        kmMat4Multiply(swapMat4, projection_matrix_stack.top, modelview_matrix_stack.top);
        this.setUniformLocationWithMatrix4fv(this._uniforms.get(UNIFORM_S.MVPMATRIX_S), swapMat4.mat);
    }

    setUniformForModelViewAndProjectionMatrixWithMat4(): void {
        this.setUniformLocationWithMatrix4fv(this._uniforms.get(UNIFORM_S.MVMATRIX_S), modelview_matrix_stack.top.mat);
        this.setUniformLocationWithMatrix4fv(this._uniforms.get(UNIFORM_S.PMATRIX_S), projection_matrix_stack.top.mat);
    }

    _setUniformForMVPMatrixWithMat4(modelViewMatrix: math.Matrix4) {
        if (!modelViewMatrix)
            throw new Error("modelView matrix is undefined.");
        this.setUniformLocationWithMatrix4fv(this._uniforms.get(UNIFORM_S.MVMATRIX_S), modelViewMatrix.mat);
        this.setUniformLocationWithMatrix4fv(this._uniforms.get(UNIFORM_S.PMATRIX_S), projection_matrix_stack.top.mat);
    }

    _updateProjectionUniform() {
        var stack = projection_matrix_stack;
        if (stack.lastUpdated !== this._projectionUpdated) {
            this._glContext.uniformMatrix4fv(this._uniforms.get(UNIFORM_S.PMATRIX_S), false, stack.top.mat);
            this._projectionUpdated = stack.lastUpdated;
        }
    }

/**
 * returns the vertexShader error log
 * @return {String}
 */
    vertexShaderLog():string {
        return this._glContext.getShaderInfoLog(this._vertShader);
    }

/**
 * returns the vertexShader error log
 * @return {String}
 */
    getVertexShaderLog(): string {
        return this._glContext.getShaderInfoLog(this._vertShader);
    }

/**
 * returns the fragmentShader error log
 * @returns {String}
 */
    getFragmentShaderLog(): string {
        return this._glContext.getShaderInfoLog(this._vertShader);
    }

/**
 * returns the fragmentShader error log
 * @return {String}
 */
    fragmentShaderLog(): string {
        return this._glContext.getShaderInfoLog(this._fragShader);
    }

/**
 * returns the program error log
 * @return {String}
 */
    programLog(): string {
        return this._glContext.getProgramInfoLog(this._programObj);
    }

/**
 * returns the program error log
 * @return {String}
 */
    getProgramLog(): string {
        return this._glContext.getProgramInfoLog(this._programObj);
    }

/**
 *  reload all shaders, this function is designed for android  <br/>
 *  when opengl context lost, so don't call it.
 */
    reset(): void {
        this._vertShader = null;
        this._fragShader = null;
        if (Object.keys(this._uniforms).length > 0) this._uniforms = new Dictionary<string, WebGLUniformLocation>();

        // it is already deallocated by android
        //ccGLDeleteProgram(m_uProgram);
        this._glContext.deleteProgram(this._programObj);
        this._programObj = null;

        // Purge uniform hash
        if (Object.keys(this._hashForUniforms).length > 0) this._hashForUniforms = new Dictionary<string, Array<any>>();
    }

/**
 * get WebGLProgram object
 * @return {WebGLProgram}
 */
    getProgram():WebGLProgram {
        return this._programObj;
    }

/**
 * Currently JavaScript Bindings (JSB), in some cases, needs to use retain and release. This is a bug in JSB,
 * and the ugly workaround is to use retain/release. So, these 2 methods were added to be compatible with JSB.
 * This is a hack, and should be removed once JSB fixes the retain/release bug
 */
    retain(): void {
    }
    release(): void {
    }


}


/**
 * <p>
 *     Sets the shader program for this node
 *
 *     Since v2.0, each rendering node must set its shader program.
 *     It should be set in initialize phase.
 * </p>
 * @function
 * @param {cc.Node} node
 * @param {cc.GLProgram} program The shader program which fetches from CCShaderCache.
 * @example
 * cc.setGLProgram(node, cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR));
 */
export function setProgram(node:ccNode, program:GLProgram) {
    node.shaderProgram = program;

    var children = node.children;
    if (!children)
        return;

    for (var i = 0; i < children.length; i++)
        setProgram(children[i], program);
}