import { CanvasRenderCmd, ccNode } from "../base-nodes/index";
import { LayerRenderCmd } from "./CCLayerRenderCmd";
import { RenderCmd, _dirtyFlags, CustomRenderCmd, IRenderCmd } from "../base-nodes/CCRenderCmd";
import { BlendFunc, setNumberOfDraws, g_NumberOfDraws } from "../platform/index";
import { iRenderableObject, CanvasContextWrapper, CanvasContext } from "../renderer/index";
import { game } from "../../../startup/CCGame";
import { Rect, rectUnion, rect, rectApplyAffineTransform, Point, p } from "../cocoa/index";
import { Layer, LayerGradient, LayerColor } from "./CCLayer";
import { pAngleSigned, pRotateByAngle } from "../support/index";

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
 * cc.Layer's rendering objects of Canvas
 */
export class Layer_CanvasRenderCmd extends CanvasRenderCmd implements LayerRenderCmd {

    _isBaked: boolean;
    _bakeSprite: Sprite;
    _bakeRenderCmd: IRenderCmd;
    _updateCache: number;



    constructor(renderable: Layer) {
        super(renderable);
        this._isBaked = false;
        this._bakeSprite = null;
        this._canUseDirtyRegion = true;
        this._updateCache = 2; // 2: Updated child visit 1: Rendering 0: Nothing to do
    }


    _setCacheDirty(child?:boolean):void {
        if (child && this._updateCache === 0)
            this._updateCache = 2;
        if (this._cacheDirty === false) {
            this._cacheDirty = true;
            var cachedP = this._cachedParent;
            cachedP && cachedP !== this && cachedP._setNodeDirtyForCache && cachedP._setNodeDirtyForCache();
        }
    }
    updateStatus() {
        var flags = _dirtyFlags, locFlag = this._dirtyFlag;
        if (locFlag & flags.orderDirty) {
            this._cacheDirty = true;
            if (this._updateCache === 0)
                this._updateCache = 2;
            this._dirtyFlag &= ~flags.orderDirty;
        }

        this.originUpdateStatus();
    }

    _syncStatus(parentCmd:RenderCmd):void {
        var flags = _dirtyFlags, locFlag = this._dirtyFlag;
        // if (locFlag & flags.orderDirty) {
        if (this._isBaked || locFlag & flags.orderDirty) {
            this._cacheDirty = true;
            if (this._updateCache === 0)
                this._updateCache = 2;
            this._dirtyFlag &= ~flags.orderDirty;
        }
        this._originSyncStatus(parentCmd);
    }
    transform(parentCmd?: RenderCmd, recursive?: boolean): void {
        if (!this._worldTransform) {
            this._worldTransform = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
        }
        var wt = this._worldTransform;
        var a = wt.a, b = wt.b, c = wt.c, d = wt.d, tx = wt.tx, ty = wt.ty;
        this.originTransform(parentCmd, recursive);
        if ((wt.a !== a || wt.b !== b || wt.c !== c || wt.d !== d) && this._updateCache === 0)
            this._updateCache = 2;
    }
    bake(): void {
        if (!this._isBaked) {
            this._needDraw = true;
            game.renderer.childrenOrderDirty = true;
            //limit: 1. its children's blendfunc are invalid.
            this._isBaked = this._cacheDirty = true;
            if (this._updateCache === 0)
                this._updateCache = 2;

            var children = this._node._children;
            for (var i = 0, len = children.length; i < len; i++)
                (<CanvasRenderCmd>children[i].renderCmd)._setCachedParent(this);

            if (!this._bakeSprite) {
                this._bakeSprite = new BakeSprite();
                this._bakeSprite.setAnchorPoint(0, 0);
            }
        }
    }
    unbake(): void {
        if (this._isBaked) {
            game.renderer.childrenOrderDirty = true;
            this._needDraw = false;
            this._isBaked = false;
            this._cacheDirty = true;
            if (this._updateCache === 0)
                this._updateCache = 2;

            var children = this._node._children;
            for (var i = 0, len = children.length; i < len; i++)
                children[i].renderCmdCanvas._setCachedParent(null);
        }
    }
    isBaked() {
        return this._isBaked;
    }
    rendering(ct:RenderingContext | CanvasContextWrapper): void {
        if (this._cacheDirty) {
            var node = this._node;
            var children = node._children, locBakeSprite = this._bakeSprite;

            //compute the bounding box of the bake layer.
            this.transform(this.getParentRenderCmd(), true);

            var boundingBox = this._getBoundingBoxForBake();
            boundingBox.width = 0 | (boundingBox.width + 0.5);
            boundingBox.height = 0 | (boundingBox.height + 0.5);

            var bakeContext = locBakeSprite.getCacheContext();
            var ctx = bakeContext.getContext();

            locBakeSprite.setPosition(boundingBox.x, boundingBox.y);

            if (this._updateCache > 0) {
                locBakeSprite.resetCanvasSize(boundingBox.width, boundingBox.height);
                bakeContext.setOffset(0 - boundingBox.x, ctx.canvas.height - boundingBox.height + boundingBox.y);
                //visit for canvas
                node.sortAllChildren();
                game.rendererCanvas._turnToCacheMode(node.__instanceId);
                for (var i = 0, len = children.length; i < len; i++) {
                    children[i].visit(node);
                }
                game.rendererCanvas._renderingToCacheCanvas(bakeContext, node.__instanceId);
                locBakeSprite.transform();                   //because bake sprite's position was changed at rendering.
                this._updateCache--;
            }

            this._cacheDirty = false;
        }
    }
    _bakeForAddChild(child?: ccNode): void {
        if (child._parent === this._node && this._isBaked)
            (<CanvasRenderCmd>child.renderCmd)._setCachedParent(this);
    }
    _getBoundingBoxForBake():Rect {
        var rectOut = null, node = this._node;

        //query child's BoundingBox
        if (!node._children || node._children.length === 0)
            return rect(0, 0, 10, 10);
        var trans = node.getNodeToWorldTransform();

        var locChildren = node._children;
        for (var i = 0, len = locChildren.length; i < len; i++) {
            var child = locChildren[i];
            if (child && child._visible) {
                if (rectOut) {
                    var childRect = child._getBoundingBoxToCurrentNode(trans);
                    if (childRect)
                        rectOut = rectUnion(rectOut, childRect);
                } else {
                    rectOut = child._getBoundingBoxToCurrentNode(trans);
                }
            }
        }
        return rectOut;
    }






    updateBlendFunc(blend: BlendFunc): void {
        //throw new Error("Method not implemented.");
    }


}


export class LayerColor_CanvasRenderCmd extends Layer_CanvasRenderCmd {
    _blendFuncStr: string;
    //_bakeRendering: ((target: RenderCmd, ctx: RenderingContext, scaleX?: number, scaleY?: number) => void) = null;


    constructor(renderable: LayerColor) {
        super(renderable)
        this._needDraw = true;
        this._blendFuncStr = "source-over";
        this._bakeRenderCmd = new CustomRenderCmd(this, ():void => {
            this._bakeRendering();
        });

    }
    unbake(): void {
        super.unbake();
        this._needDraw = true;
    }

    rendering(ctx: CanvasContextWrapper, scaleX?: number, scaleY?:number):void {
        var wrapper = ctx || game.renderContextCanvas;
        var context = wrapper.getContext(),
            node = this._node,
            curColor = this._displayedColor,
            opacity = this._displayedOpacity / 255,
            locWidth = node._contentSize.width,
            locHeight = node._contentSize.height;

        if (opacity === 0)
            return;

        wrapper.setCompositeOperation(this._blendFuncStr);
        wrapper.setGlobalAlpha(opacity);
        wrapper.setFillStyle("rgba(" + (0 | curColor.r) + "," + (0 | curColor.g) + ","
            + (0 | curColor.b) + ", 1)");  //TODO: need cache the color string

        wrapper.setTransform(this._worldTransform, scaleX, scaleY);
        context.fillRect(0, 0, locWidth, -locHeight);
        setNumberOfDraws(g_NumberOfDraws + 1);
    }
    updateBlendFunc(blendFunc:BlendFunc):void {
        this._blendFuncStr = CanvasRenderCmd._getCompositeOperationByBlendFunc(blendFunc);
    }

    //proto._updateSquareVertices =
    //    proto._updateSquareVerticesWidth =
    //    proto._updateSquareVerticesHeight = function () { };

    _bakeRendering():void {
        if (this._cacheDirty) {
            var node = this._node;
            var locBakeSprite = this._bakeSprite, children = node._children;
            var i, len = children.length;

            //compute the bounding box of the bake layer.
            this.transform(this.getParentRenderCmd(), true);
            //compute the bounding box of the bake layer.
            var boundingBox = this._getBoundingBoxForBake();
            boundingBox.width = 0 | (boundingBox.width + 0.5);
            boundingBox.height = 0 | (boundingBox.height + 0.5);

            var bakeContext = locBakeSprite.getCacheContext();
            var ctx = bakeContext.getContext();

            locBakeSprite.setPosition(boundingBox.x, boundingBox.y);

            if (this._updateCache > 0) {
                ctx.fillStyle = bakeContext._currentFillStyle;
                locBakeSprite.resetCanvasSize(boundingBox.width, boundingBox.height);
                bakeContext.setOffset(0 - boundingBox.x, ctx.canvas.height - boundingBox.height + boundingBox.y);

                var child;
                game.rendererCanvas._turnToCacheMode(node.__instanceId);
                //visit for canvas
                if (len > 0) {
                    node.sortAllChildren();
                    // draw children zOrder < 0
                    for (i = 0; i < len; i++) {
                        child = children[i];
                        if (child._localZOrder < 0)
                            child.visit(node);
                        else
                            break;
                    }
                    game.rendererCanvas.pushRenderCommand(this);
                    for (; i < len; i++) {
                        children[i].visit(node);
                    }
                } else
                    game.rendererCanvas.pushRenderCommand(this);
                game.rendererCanvas._renderingToCacheCanvas(bakeContext, node.__instanceId);
                locBakeSprite.transform();
                this._updateCache--;
            }
            this._cacheDirty = false;
        }
    }
    _getBoundingBoxForBake():Rect {
        var node = this._node;
        //default size
        var rectout = rect(0, 0, node._contentSize.width, node._contentSize.height);
        var trans = node.getNodeToWorldTransform();
        rectout = rectApplyAffineTransform(rectout, node.getNodeToWorldTransform());

        //query child's BoundingBox
        if (!node._children || node._children.length === 0)
            return rectout;

        var locChildren = node._children;
        for (var i = 0; i < locChildren.length; i++) {
            var child = locChildren[i];
            if (child && child._visible) {
                var childRect = child._getBoundingBoxToCurrentNode(trans);
                rectout = rectUnion(rectout, childRect);
            }
        }
        return rectout;
    }



}



export class LayerGradient_CanvasRenderCmd extends LayerColor_CanvasRenderCmd {
    _startPoint: Point;
    _endPoint: Point;
    _startStopStr: string;
    _endStopStr: string;
    _startOpacity: number;
    _endOpacity: number;

    constructor(renderable: LayerGradient) {
        super(renderable);
        this._needDraw = true;
        this._startPoint = p(0, 0);
        this._endPoint = p(0, 0);
        this._startStopStr = null;
        this._endStopStr = null;

    }

    rendering(ctx: CanvasContextWrapper, scaleX?: number, scaleY?: number): void {
        var wrapper = ctx || game.renderContextCanvas, context = wrapper.getContext(),
            node = this._node,
            opacity = this._displayedOpacity / 255;

        if (opacity === 0)
            return;

        var locWidth = node._contentSize.width, locHeight = node._contentSize.height;
        wrapper.setCompositeOperation(this._blendFuncStr);
        wrapper.setGlobalAlpha(opacity);
        var gradient = context.createLinearGradient(this._startPoint.x, this._startPoint.y, this._endPoint.x, this._endPoint.y);

        if ((<LayerGradient>node)._colorStops) {  //Should always fall here now
            for (var i = 0; i < (<LayerGradient>node)._colorStops.length; i++) {
                var stop = (<LayerGradient>node)._colorStops[i];
                gradient.addColorStop(stop.p, stop.color.toStringRGBA());
            }
        } else {
            gradient.addColorStop(0, this._startStopStr);
            gradient.addColorStop(1, this._endStopStr);
        }

        wrapper.setFillStyle(gradient);

        wrapper.setTransform(this._worldTransform, scaleX, scaleY);
        context.fillRect(0, 0, locWidth, -locHeight);
        setNumberOfDraws(g_NumberOfDraws + 1);
    }
    updateStatus() {
        var locFlag = this._dirtyFlag;
        if (locFlag & _dirtyFlags.gradientDirty) {
            this._dirtyFlag |= _dirtyFlags.colorDirty;
            this._dirtyFlag &= ~_dirtyFlags.gradientDirty;
        }

        this.originUpdateStatus();
    }
    _syncStatus(parentCmd:RenderCmd) {
        var locFlag = this._dirtyFlag;
        if (locFlag & _dirtyFlags.gradientDirty) {
            this._dirtyFlag |= _dirtyFlags.colorDirty;
            this._dirtyFlag &= ~_dirtyFlags.gradientDirty;
        }

        this._originSyncStatus(parentCmd);
    }


    _updateColor():void {
        var node = <LayerGradient>this._node;
        var contentSize = node._contentSize;
        var tWidth = contentSize.width * 0.5, tHeight = contentSize.height * 0.5;

        //fix the bug of gradient layer
        var angle = pAngleSigned(p(0, -1), node._alongVector);
        var p1 = pRotateByAngle(p(0, -1), p(0, 0), angle);
        var factor = Math.min(Math.abs(1 / p1.x), Math.abs(1 / p1.y));

        this._startPoint.x = tWidth * (-p1.x * factor) + tWidth;
        this._startPoint.y = tHeight * (p1.y * factor) - tHeight;
        this._endPoint.x = tWidth * (p1.x * factor) + tWidth;
        this._endPoint.y = tHeight * (-p1.y * factor) - tHeight;

        var locStartColor = this._displayedColor, locEndColor = node._endColor;
        var startOpacity = node._startOpacity / 255, endOpacity = node._endOpacity / 255;
        this._startStopStr = "rgba(" + Math.round(locStartColor.r) + "," + Math.round(locStartColor.g) + ","
            + Math.round(locStartColor.b) + "," + startOpacity.toFixed(4) + ")";
        this._endStopStr = "rgba(" + Math.round(locEndColor.r) + "," + Math.round(locEndColor.g) + ","
            + Math.round(locEndColor.b) + "," + endOpacity.toFixed(4) + ")";

        if (node._colorStops) {
            this._startOpacity = 0;
            this._endOpacity = 0;

            //this._colorStopsStr = [];
            //for (var i = 0; i < node._colorStops.length; i++) {
            //    var stopColor = node._colorStops[i].color;
            //    var stopOpacity = stopColor.a == null ? 1 : stopColor.a / 255;
            //    this._colorStopsStr.push("rgba(" + Math.round(stopColor.r) + "," + Math.round(stopColor.g) + ","
            //        + Math.round(stopColor.b) + "," + stopOpacity.toFixed(4) + ")");
            //}
        }
    }





}