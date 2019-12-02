import { Dictionary } from "../../extensions/syslibs/LinqToJs";
import { log } from "../../startup/CCDebugger";
import { glBindTexture2DN } from "./CCGLStateCache";
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
export var types;
(function (types) {
    types[types["GL_NONE"] = -1] = "GL_NONE";
    types[types["GL_FLOAT"] = 0] = "GL_FLOAT";
    types[types["GL_INT"] = 1] = "GL_INT";
    types[types["GL_FLOAT_VEC2"] = 2] = "GL_FLOAT_VEC2";
    types[types["GL_FLOAT_VEC3"] = 3] = "GL_FLOAT_VEC3";
    types[types["GL_FLOAT_VEC4"] = 4] = "GL_FLOAT_VEC4";
    types[types["GL_FLOAT_MAT4"] = 5] = "GL_FLOAT_MAT4";
    types[types["GL_CALLBACK"] = 6] = "GL_CALLBACK";
    types[types["GL_TEXTURE"] = 7] = "GL_TEXTURE";
})(types || (types = {}));
export class UniformValue {
    constructor(_uniform, _glprogram) {
        this._uniform = _uniform;
        this._glprogram = _glprogram;
        this._value = null;
        this._type = types.GL_NONE;
        //var u = _glprogram._glContext.getActiveUniform()
    }
    setFloat(value) {
        this._value = value;
        this._type = types.GL_FLOAT;
    }
    setInt(value) {
        this._value = value;
        this._type = types.GL_INT;
    }
    setVec2(v1, v2) {
        this._value = new Float32Array([v1, v2]);
        this._type = types.GL_FLOAT_VEC2;
    }
    setVec2v(value) {
        this._value = new Float32Array(value.slice(0));
        this._type = types.GL_FLOAT_VEC2;
    }
    setVec3(v1, v2, v3) {
        this._value = new Float32Array([v1, v2, v3]);
        this._type = types.GL_FLOAT_VEC3;
    }
    setVec3v(value) {
        this._value = new Float32Array(value.slice(0));
        this._type = types.GL_FLOAT_VEC3;
    }
    setVec4(v1, v2, v3, v4) {
        this._value = new Float32Array([v1, v2, v3, v4]);
        this._type = types.GL_FLOAT_VEC4;
    }
    setVec4v(value) {
        this._value = new Float32Array(value.slice(0));
        this._type = types.GL_FLOAT_VEC4;
    }
    setMat4(value) {
        this._value = new Float32Array(value.slice(0));
        this._type = types.GL_FLOAT_MAT4;
    }
    setCallback(fn) {
        this._value = fn;
        this._type = types.GL_CALLBACK;
    }
    setTexture(textureId, textureUnit) {
        this._value = textureUnit;
        this._textureId = textureId;
        this._type = types.GL_TEXTURE;
    }
    apply() {
        switch (this._type) {
            case types.GL_INT:
                this._glprogram.setUniformLocationWith1i(this._uniform._location, this._value);
                break;
            case types.GL_FLOAT:
                this._glprogram.setUniformLocationWith1f(this._uniform._location, this._value);
                break;
            case types.GL_FLOAT_VEC2:
                this._glprogram.setUniformLocationWith2fv(this._uniform._location, this._value);
                break;
            case types.GL_FLOAT_VEC3:
                this._glprogram.setUniformLocationWith3fv(this._uniform._location, this._value);
                break;
            case types.GL_FLOAT_VEC4:
                this._glprogram.setUniformLocationWith4fv(this._uniform._location, this._value);
                break;
            case types.GL_FLOAT_MAT4:
                this._glprogram.setUniformLocationWithMatrix4fv(this._uniform._location, this._value);
                break;
            case types.GL_CALLBACK:
                var cb = this._value;
                cb(this._glprogram, this._uniform);
                break;
            case types.GL_TEXTURE:
                this._glprogram.setUniformLocationWith1i(this._uniform._location, this._value);
                glBindTexture2DN(this._value, this._textureId);
                break;
            default:
                ;
        }
    }
}
export class GLProgramState {
    constructor(_glprogram) {
        this._glprogram = _glprogram;
        this._uniforms = new Dictionary();
        this._textureUnitIndex = 1; // Start at 1, as CC_Texture0 is bound to 0
        this._boundTextureUnits = new Dictionary();
        var activeUniforms = _glprogram._glContext.getProgramParameter(_glprogram._programObj, _glprogram._glContext.ACTIVE_UNIFORMS);
        for (var i = 0; i < activeUniforms; i += 1) {
            var uniform = _glprogram._glContext.getActiveUniform(_glprogram._programObj, i);
            if (uniform.name.indexOf("CC_") !== 0) {
                uniform._location = _glprogram._glContext.getUniformLocation(_glprogram._programObj, uniform.name);
                uniform._location._name = uniform.name;
                var uniformValue = new UniformValue(uniform, _glprogram);
                this._uniforms.set(uniform.name, uniformValue);
            }
        }
    }
    static getOrCreateWithGLProgram(glprogram) {
        var programState = GLProgramState._cache.get(glprogram.__instanceId);
        if (!programState) {
            programState = new GLProgramState(glprogram);
            GLProgramState._cache.set(glprogram.__instanceId, programState);
        }
        return programState;
    }
    ;
    apply(modelView) {
        this._glprogram.use();
        if (modelView) {
            this._glprogram._setUniformForMVPMatrixWithMat4(modelView);
        }
        for (var name in this._uniforms) {
            this._uniforms.get(name).apply();
        }
        ;
    }
    setGLProgram(glprogram) {
        this._glprogram = glprogram;
    }
    getGLProgram() {
        return this._glprogram;
    }
    getUniformCount() {
        return this._uniforms.length;
    }
    getUniformValue(uniform) {
        return this._uniforms.get(uniform);
    }
    setUniformInt(uniform, value) {
        var v = this.getUniformValue(uniform);
        if (v) {
            v.setInt(value);
        }
        else {
            log("cocos2d: warning: Uniform not found: " + uniform);
        }
    }
    setUniformFloat(uniform, value) {
        var v = this.getUniformValue(uniform);
        if (v) {
            v.setFloat(value);
        }
        else {
            log("cocos2d: warning: Uniform not found: " + uniform);
        }
    }
    setUniformVec2(uniform, v1, v2) {
        var v = this.getUniformValue(uniform);
        if (v) {
            v.setVec2(v1, v2);
        }
        else {
            log("cocos2d: warning: Uniform not found: " + uniform);
        }
    }
    setUniformVec2v(uniform, value) {
        var v = this.getUniformValue(uniform);
        if (v) {
            v.setVec2v(value);
        }
        else {
            log("cocos2d: warning: Uniform not found: " + uniform);
        }
    }
    setUniformVec3(uniform, v1, v2, v3) {
        var v = this.getUniformValue(uniform);
        if (v) {
            v.setVec3(v1, v2, v3);
        }
        else {
            log("cocos2d: warning: Uniform not found: " + uniform);
        }
    }
    setUniformVec3v(uniform, value) {
        var v = this.getUniformValue(uniform);
        if (v) {
            v.setVec3v(value);
        }
        else {
            log("cocos2d: warning: Uniform not found: " + uniform);
        }
    }
    setUniformVec4(uniform, v1, v2, v3, v4) {
        var v = this.getUniformValue(uniform);
        if (v) {
            v.setVec4(v1, v2, v3, v4);
        }
        else {
            log("cocos2d: warning: Uniform not found: " + uniform);
        }
    }
    setUniformVec4v(uniform, value) {
        var v = this.getUniformValue(uniform);
        if (v) {
            v.setVec4v(value);
        }
        else {
            log("cocos2d: warning: Uniform not found: " + uniform);
        }
    }
    setUniformMat4(uniform, value) {
        var v = this.getUniformValue(uniform);
        if (v) {
            v.setMat4(value);
        }
        else {
            log("cocos2d: warning: Uniform not found: " + uniform);
        }
    }
    setUniformCallback(uniform, callback) {
        var v = this.getUniformValue(uniform);
        if (v) {
            v.setCallback(callback);
        }
        else {
            log("cocos2d: warning: Uniform not found: " + uniform);
        }
    }
    setUniformTexture(uniform, texture) {
        var uniformValue = this.getUniformValue(uniform);
        if (uniformValue) {
            var textureUnit = this._boundTextureUnits.get(uniform);
            if (textureUnit) {
                uniformValue.setTexture(texture, textureUnit);
            }
            else {
                uniformValue.setTexture(texture, this._textureUnitIndex);
                this._boundTextureUnits.set(uniform, this._textureUnitIndex++);
            }
        }
    }
}
GLProgramState._cache = new Dictionary();
//# sourceMappingURL=CCGLProgramState.js.map