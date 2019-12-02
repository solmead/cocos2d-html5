import { ENABLE_GL_STATE_CACHE, TEXTURE_ATLAS_USE_VAO, BLEND_SRC, BLEND_DST } from "../core/platform/index";
import { game } from "../../startup/CCGame";
import { WebGlContext } from "../core/renderer/index";
import { Texture2D, Texture2DWebGL } from "../core/textures/index";
import { kmGLFreeAll } from "../kazmath/index";

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

export var _currentProjectionMatrix: number = -1;

export var MAX_ACTIVETEXTURE: number = null;
export var _currentShaderProgram: WebGLProgram = null;
export var _currentBoundTexture: Array<Texture2DWebGL> = null;
export var _blendingSource: number = null;
export var _blendingDest: number = null;
export var _GLServerState: number = null;
export var _uVAO: number = null;

if (ENABLE_GL_STATE_CACHE) {
    MAX_ACTIVETEXTURE = 16;

    _currentShaderProgram = -1;
    _currentBoundTexture = <any>[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
    _blendingSource = -1;
    _blendingDest = -1;
    _GLServerState = 0;
    if (TEXTURE_ATLAS_USE_VAO)
        _uVAO = 0;
}
// GL State Cache functions

/**
 * Invalidates the GL state cache.<br/>
 * If CC_ENABLE_GL_STATE_CACHE it will reset the GL state cache.
 * @function
 */
export function glInvalidateStateCache():void {
    kmGLFreeAll();
    _currentProjectionMatrix = -1;
    if (ENABLE_GL_STATE_CACHE) {
        _currentShaderProgram = -1;
        for (var i = 0; i < MAX_ACTIVETEXTURE; i++) {
            _currentBoundTexture[i] = <any>-1;
        }
        _blendingSource = -1;
        _blendingDest = -1;
        _GLServerState = 0;
    }
}

/**
 * Uses the GL program in case program is different than the current one.< br />
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will the glUseProgram() directly.
 * @function* @param { WebGLProgram } program
    */
export function glUseProgram(program: WebGLProgram): void {
    if (ENABLE_GL_STATE_CACHE) {
        if (program !== _currentShaderProgram) {
            _currentShaderProgram = program;
            game.renderContextWebGl.useProgram(program);
        }
    } else {
        game.renderContextWebGl.useProgram(program);
    }
}

/**
 * Deletes the GL program. If it is the one that is being used, it invalidates it.<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will the glDeleteProgram() directly.
 * @function
 * @param {WebGLProgram} program
 */
export function glDeleteProgram(program:WebGLProgram):void {
    if (ENABLE_GL_STATE_CACHE) {
        if (program === _currentShaderProgram)
            _currentShaderProgram = -1;
    }
    game.renderContextWebGl.deleteProgram(program);
}

/**
 * @function
 * @param {Number} sfactor
 * @param {Number} dfactor
 */
export function setBlending(sfactor: number, dfactor: number): void {
    var ctx = game.renderContextWebGl;
    if ((sfactor === ctx.ONE) && (dfactor === ctx.ZERO)) {
        ctx.disable(ctx.BLEND);
    } else {
        ctx.enable(ctx.BLEND);
        game.renderContextWebGl.blendFunc(sfactor, dfactor);
        //TODO need fix for WebGL
        //ctx.blendFuncSeparate(ctx.SRC_ALPHA, dfactor, sfactor, dfactor);
    }
}
/**
 * Uses a blending function in case it not already used.<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will the glBlendFunc() directly.
 * @function
 * @param {Number} sfactor
 * @param {Number} dfactor
 */
export function glBlendFunc(sfactor: number, dfactor: number): void {
    if (ENABLE_GL_STATE_CACHE) {
        if ((sfactor !== _blendingSource) || (dfactor !== _blendingDest)) {
            _blendingSource = sfactor;
            _blendingDest = dfactor;
            setBlending(sfactor, dfactor);
        }
    } else {
        setBlending(sfactor, dfactor);
    }
}


/**
 * @function
 * @param {Number} sfactor
 * @param {Number} dfactor
 */
export function glBlendFuncForParticle(sfactor:number, dfactor:number):void {
    if ((sfactor !== _blendingSource) || (dfactor !== _blendingDest)) {
        _blendingSource = sfactor;
        _blendingDest = dfactor;
        var ctx = game.renderContextWebGl;
        if ((sfactor === ctx.ONE) && (dfactor === ctx.ZERO)) {
            ctx.disable(ctx.BLEND);
        } else {
            ctx.enable(ctx.BLEND);
            //TODO need fix for WebGL
            ctx.blendFuncSeparate(ctx.SRC_ALPHA, dfactor, sfactor, dfactor);
        }
    }
}

/**
 * Resets the blending mode back to the cached state in case you used glBlendFuncSeparate() or glBlendEquation().<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will just set the default blending mode using GL_FUNC_ADD.
 * @function
 */
export function glBlendResetToCache():void {
    var ctx = game.renderContextWebGl;
    ctx.blendEquation(ctx.FUNC_ADD);
    if (ENABLE_GL_STATE_CACHE)
        setBlending(_blendingSource, _blendingDest);
    else
        setBlending(BLEND_SRC, BLEND_DST);
}

/**
 * sets the projection matrix as dirty
 * @function
 */
export function setProjectionMatrixDirty():void {
    _currentProjectionMatrix = -1;
}

/**
 * If the texture is not already bound, it binds it.<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glBindTexture() directly.
 * @function
 * @param {cc.Texture2D} textureId
 */
export function glBindTexture2D(textureId: Texture2DWebGL) {
    glBindTexture2DN(0, textureId);
}

/**
 * If the texture is not already bound to a given unit, it binds it.<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glBindTexture() directly.
 * @function
 * @param {Number} textureUnit
 * @param {cc.Texture2D} textureId
 */
export function glBindTexture2DN(textureUnit: number, textureId: Texture2DWebGL): void {
    var ctx = game.renderContextWebGl;
    if (ENABLE_GL_STATE_CACHE) {
        if (_currentBoundTexture[textureUnit] === textureId)
            return;
        _currentBoundTexture[textureUnit] = textureId;

        ctx.activeTexture(ctx.TEXTURE0 + textureUnit);
        if (textureId)
            ctx.bindTexture(ctx.TEXTURE_2D, textureId._webTextureObj);
        else
            ctx.bindTexture(ctx.TEXTURE_2D, null);
    } else {
        ctx.activeTexture(ctx.TEXTURE0 + textureUnit);
        if (textureId)
            ctx.bindTexture(ctx.TEXTURE_2D, textureId._webTextureObj);
        else
            ctx.bindTexture(ctx.TEXTURE_2D, null);
    }
}

/**
 * It will delete a given texture. If the texture was bound, it will invalidate the cached. <br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glDeleteTextures() directly.
 * @function
 * @param {WebGLTexture} textureId
 */
export function glDeleteTexture(textureId: Texture2DWebGL) {
    glDeleteTextureN(0, textureId);
}
/**
 * It will delete a given texture. If the texture was bound, it will invalidate the cached for the given texture unit.<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glDeleteTextures() directly.
 * @function
 * @param {Number} textureUnit
 * @param {WebGLTexture} textureId
 */
export function glDeleteTextureN(textureUnit: number, textureId: Texture2DWebGL) {
    if (ENABLE_GL_STATE_CACHE) {
        if (textureId === _currentBoundTexture[textureUnit])
            _currentBoundTexture[textureUnit] = <any>-1;
    }
    game.renderContextWebGl.deleteTexture(textureId._webTextureObj);
}

/**
 * If the vertex array is not already bound, it binds it.<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glBindVertexArray() directly.
 * @function
 * @param {Number} vaoId
 */
export function glBindVAO(vaoId:number):void {
    if (!TEXTURE_ATLAS_USE_VAO)
        return;

    if (ENABLE_GL_STATE_CACHE) {
        if (_uVAO !== vaoId) {
            _uVAO = vaoId;
            //TODO need fixed
            //glBindVertexArray(vaoId);
        }
    } else {
        //glBindVertexArray(vaoId);
    }
}

/**
 * It will enable / disable the server side GL states.<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glEnable() directly.
 * @function
 * @param {Number} flags
 */
export function glEnable(flags:number) {
    if (ENABLE_GL_STATE_CACHE) {
        /*var enabled;

         */
        /* GL_BLEND */
        /*
         if ((enabled = (flags & cc.GL_BLEND)) != (cc._GLServerState & cc.GL_BLEND)) {
         if (enabled) {
         cc._renderContext.enable(cc._renderContext.BLEND);
         cc._GLServerState |= cc.GL_BLEND;
         } else {
         cc._renderContext.disable(cc._renderContext.BLEND);
         cc._GLServerState &= ~cc.GL_BLEND;
         }
         }*/
    } else {
        /*if ((flags & cc.GL_BLEND))
         cc._renderContext.enable(cc._renderContext.BLEND);
         else
         cc._renderContext.disable(cc._renderContext.BLEND);*/
    }
}
