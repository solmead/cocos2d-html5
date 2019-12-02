import { WebGLRenderCmd, ccNode } from "../base-nodes/index";
import { LayerRenderCmd } from "./CCLayerRenderCmd";
import { IRenderCmd, RenderCmd, _dirtyFlags } from "../base-nodes/CCRenderCmd";
import { BlendFunc, SHADER_POSITION, VERTEX_ATTRIB, radiansToDegrees } from "../platform/index";
import { Layer, LayerColor, LayerGradient } from "./CCLayer";
import { shaderCache, GLProgram, glBlendFunc } from "../../shaders/index";
import { WebGlContext } from "../renderer/index";
import { game } from "../../../startup/CCGame";
import { Matrix4 } from "../../kazmath/mat4";
import { rect, Rect, p, affineTransformMake, affineTransformRotate, Point, affineTransformScale, pointApplyAffineTransform, _rectApplyAffineTransformIn } from "../cocoa/index";
import { pAngleSigned } from "../support/index";

/****************************************************************************
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

//-----------------------//
//  1. cc.Layer          //
//  2. cc.LayerColor     //
//  3. cc.LayerGradient  //
//-----------------------//

/**
 * cc.Layer's rendering objects of WebGL
 */

export class Layer_WebGLRenderCmd extends WebGLRenderCmd implements LayerRenderCmd {

    _isBaked: boolean;
    _bakeSprite: any;
    _bakeRenderCmd: IRenderCmd;

    constructor(renderer: Layer) {
        super(renderer);
        this._isBaked = false;
    }






    bake(): void {
        //throw new Error("Method not implemented.");
    }
    unbake(): void {
        //throw new Error("Method not implemented.");
    }
    _bakeForAddChild(child?: ccNode): void {
        //throw new Error("Method not implemented.");
    }
    updateBlendFunc(blend: BlendFunc): void {
        //throw new Error("Method not implemented.");
    }
}

var FLOAT_PER_VERTEX = 4;
export class LayerColor_WebGLRenderCmd extends Layer_WebGLRenderCmd {
    _matrix: Matrix4 = null;
    _color: Uint32Array;
    _vertexBuffer: WebGLBuffer = null;
    _shaderProgram: GLProgram;
    _data: ArrayBuffer;
    _positionView: Float32Array;
    _colorView: Uint32Array;
    _dataDirty: boolean;



    constructor(renderer: LayerColor) {
        super(renderer);

        this._needDraw = true;

        this._matrix = null;

        this.initData(4);
        this._color = new Uint32Array(1);
        this._vertexBuffer = null;

        this._shaderProgram = shaderCache.programForKey(SHADER_POSITION.COLOR);
    }


    initData(vertexCount:number):void {
        this._data = new ArrayBuffer(16 * vertexCount);
        this._positionView = new Float32Array(this._data);
        this._colorView = new Uint32Array(this._data);
        this._dataDirty = true;
    }

    transform(parentCmd: RenderCmd, recursive: boolean):void {
        this.originTransform(parentCmd, recursive);

        var node = this._node,
            width = node._contentSize.width,
            height = node._contentSize.height;

        var pos = this._positionView;
        pos[FLOAT_PER_VERTEX] = width;          // br.x
        pos[FLOAT_PER_VERTEX * 2 + 1] = height; // tl.y
        pos[FLOAT_PER_VERTEX * 3] = width;      // tr.x
        pos[FLOAT_PER_VERTEX * 3 + 1] = height; // tr.y
         pos[FLOAT_PER_VERTEX + 2] =
            pos[FLOAT_PER_VERTEX * 2 + 2] =
            pos[FLOAT_PER_VERTEX * 3 + 2] = node._vertexZ;

        this._dataDirty = true;
    }
    _updateColor():void {
        var color = this._displayedColor;
        this._color[0] = ((this._displayedOpacity << 24) | (color.b << 16) | (color.g << 8) | color.r);

        var colors = this._colorView;
        for (var i = 0; i < 4; i++) {
            colors[i * FLOAT_PER_VERTEX + 3] = this._color[0];
        }
        this._dataDirty = true;
    }
    rendering(ctx: WebGlContext, scaleX?: number, scaleY?: number): void {
        var gl = ctx || game.renderContextWebGl;
        var node = this._node;

        if (!this._matrix) {
            this._matrix = new Matrix4();
            this._matrix.identity();
        }

        var wt = this._worldTransform;
        this._matrix.mat[0] = wt.a;
        this._matrix.mat[4] = wt.c;
        this._matrix.mat[12] = wt.tx;
        this._matrix.mat[1] = wt.b;
        this._matrix.mat[5] = wt.d;
        this._matrix.mat[13] = wt.ty;

        if (this._dataDirty) {
            if (!this._vertexBuffer) {
                this._vertexBuffer = gl.createBuffer();
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this._data, gl.DYNAMIC_DRAW);
            this._dataDirty = false;
        }

        this._glProgramState.apply(this._matrix);
        glBlendFunc((<LayerColor>node)._blendFunc.src, (<LayerColor>node)._blendFunc.dst);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.enableVertexAttribArray(VERTEX_ATTRIB.POSITION);
        gl.enableVertexAttribArray(VERTEX_ATTRIB.COLOR);

        gl.vertexAttribPointer(VERTEX_ATTRIB.POSITION, 3, gl.FLOAT, false, 16, 0);
        gl.vertexAttribPointer(VERTEX_ATTRIB.COLOR, 4, gl.UNSIGNED_BYTE, true, 16, 12);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);




    }







}


export class LayerGradient_WebGLRenderCmd extends LayerColor_WebGLRenderCmd {
    _clipRect: Rect;
    _clippingRectDirty: boolean;
    _dataDirty: boolean;

    constructor(renderer: LayerGradient) {
        super(renderer);
        this._needDraw = true;
        this._clipRect = rect();
        this._clippingRectDirty = false;
    }

    updateStatus(): void {
        var locFlag = this._dirtyFlag;
        if (locFlag & _dirtyFlags.gradientDirty) {
            this._dirtyFlag |= _dirtyFlags.colorDirty;
            this._updateVertex();
            this._dirtyFlag &= ~_dirtyFlags.gradientDirty;
        }

        this.originUpdateStatus();
    }

    _syncStatus(parentCmd:RenderCmd):void {
        var locFlag = this._dirtyFlag;
        if (locFlag & _dirtyFlags.gradientDirty) {
            this._dirtyFlag |= _dirtyFlags.colorDirty;
            this._updateVertex();
            this._dirtyFlag &= ~_dirtyFlags.gradientDirty;
        }

        this._originSyncStatus(parentCmd);
    }
    transform(parentCmd: RenderCmd, recursive?: boolean) {
        this.originTransform(parentCmd, recursive);
        this._updateVertex();
    }

    _updateVertex():void {
        var node = <LayerGradient>this._node, stops = node._colorStops;
        if (!stops || stops.length < 2)
            return;

        this._clippingRectDirty = true;
        var i, stopsLen = stops.length, verticesLen = stopsLen * 2, contentSize = node._contentSize;
        if (this._positionView.length / FLOAT_PER_VERTEX < verticesLen) {
            this.initData(verticesLen);
        }

        //init vertex
        var angle = Math.PI + pAngleSigned(p(0, -1), node._alongVector), locAnchor = p(contentSize.width / 2, contentSize.height / 2);
        var degrees = Math.round(radiansToDegrees(angle));
        var transMat = affineTransformMake(1, 0, 0, 1, locAnchor.x, locAnchor.y);
        transMat = affineTransformRotate(transMat, angle);
        var a:Point, b:Point;
        if (degrees < 90) {
            a = p(-locAnchor.x, locAnchor.y);
            b = p(locAnchor.x, locAnchor.y);
        } else if (degrees < 180) {
            a = p(locAnchor.x, locAnchor.y);
            b = p(locAnchor.x, -locAnchor.y);
        } else if (degrees < 270) {
            a = p(locAnchor.x, -locAnchor.y);
            b = p(-locAnchor.x, -locAnchor.y);
        } else {
            a = p(-locAnchor.x, -locAnchor.y);
            b = p(-locAnchor.x, locAnchor.y);
        }

        var sin = Math.sin(angle), cos = Math.cos(angle);
        var tx = Math.abs((a.x * cos - a.y * sin) / locAnchor.x), ty = Math.abs((b.x * sin + b.y * cos) / locAnchor.y);
        transMat = affineTransformScale(transMat, tx, ty);
        var pos = this._positionView;
        for (i = 0; i < stopsLen; i++) {
            var stop = stops[i], y = stop.p * contentSize.height;
            var p0 = pointApplyAffineTransform(-locAnchor.x, y - locAnchor.y, transMat);
            var offset = i * 2 * FLOAT_PER_VERTEX;
            pos[offset] = p0.x;
            pos[offset + 1] = p0.y;
            pos[offset + 2] = node._vertexZ;
            var p1 = pointApplyAffineTransform(contentSize.width - locAnchor.x, y - locAnchor.y, transMat);
            offset += FLOAT_PER_VERTEX;
            pos[offset] = p1.x;
            pos[offset + 1] = p1.y;
            pos[offset + 2] = node._vertexZ;
        }

        this._dataDirty = true;
    }
    _updateColor():void {
        var node = <LayerGradient>this._node, stops = node._colorStops;
        if (!stops || stops.length < 2)
            return;

        var stopsLen = stops.length,
            stopColor,
            offset,
            colors = this._colorView,
            opacityf = this._displayedOpacity / 255;
        for (var i = 0; i < stopsLen; i++) {
            stopColor = stops[i].color;
            this._color[0] = ((stopColor.a * opacityf) << 24) | (stopColor.b << 16) | (stopColor.g << 8) | stopColor.r;

            offset = i * 2 * FLOAT_PER_VERTEX;
            colors[offset + 3] = this._color[0];
            offset += FLOAT_PER_VERTEX;
            colors[offset + 3] = this._color[0];
        }
        this._dataDirty = true;
    }
    rendering(ctx: WebGlContext, scaleX?: number, scaleY?: number): void {
        var gl = ctx || game.renderContextWebGl, node = <LayerGradient>this._node;

        if (!this._matrix) {
            this._matrix = new Matrix4();
            this._matrix.identity();
        }

        //it is too expensive to use stencil to clip, so it use Scissor,
        //but it has a bug when layer rotated and layer's content size less than canvas's size.
        var clippingRect = this._getClippingRect();
        gl.enable(gl.SCISSOR_TEST);
        game.view.setScissorInPoints(clippingRect.x, clippingRect.y, clippingRect.width, clippingRect.height);

        var wt = this._worldTransform;
        this._matrix.mat[0] = wt.a;
        this._matrix.mat[4] = wt.c;
        this._matrix.mat[12] = wt.tx;
        this._matrix.mat[1] = wt.b;
        this._matrix.mat[5] = wt.d;
        this._matrix.mat[13] = wt.ty;

        if (this._dataDirty) {
            if (!this._vertexBuffer) {
                this._vertexBuffer = gl.createBuffer();
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this._data, gl.DYNAMIC_DRAW);
            this._dataDirty = false;
        }

        //draw gradient layer
        this._glProgramState.apply(this._matrix);
        glBlendFunc(node._blendFunc.src, node._blendFunc.dst);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.enableVertexAttribArray(VERTEX_ATTRIB.POSITION);
        gl.enableVertexAttribArray(VERTEX_ATTRIB.COLOR);

        gl.vertexAttribPointer(VERTEX_ATTRIB.POSITION, 3, gl.FLOAT, false, 16, 0);
        gl.vertexAttribPointer(VERTEX_ATTRIB.COLOR, 4, gl.UNSIGNED_BYTE, true, 16, 12);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        gl.disable(gl.SCISSOR_TEST);
    }

    _getClippingRect():Rect {
        if (this._clippingRectDirty) {
            var node = this._node;
            var rect2 = rect(0, 0, node._contentSize.width, node._contentSize.height);
            var trans = node.getNodeToWorldTransform();
            this._clipRect = _rectApplyAffineTransformIn(rect2, trans);
        }
        return this._clipRect;
    }





}

