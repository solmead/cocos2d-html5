﻿import * as ccn from "./CCNode";
import { ccNode} from "./CCNode";
import { Point, p, AffineTransform, affineTransformInvertOut, affineTransformConcatIn } from "../cocoa/index";
import { Color, color } from "../platform/index";
import { game } from "../../../startup/CCGame";
import { CanvasContextWrapper } from "../renderer/RendererCanvas";
import { GLProgramState } from "../../shaders/CCGLProgramState";
import { GLProgram } from "../../shaders/CCGLProgram";

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

export interface IRenderCmd {
    rendering(ctx: RenderingContext | CanvasContextWrapper, ...args: Array<any>): void;
    needDraw(): boolean
}


export class CustomRenderCmd implements IRenderCmd {
    _needDraw: boolean = true;

    constructor(public _target: RenderCmd, public _callback: (target: RenderCmd, ctx: RenderingContext, scaleX?: number, scaleY?:number)=>void) {

    }
    rendering(ctx: RenderingContext, scaleX?: number, scaleY?: number):void {
        if (!this._callback)
            return;
        this._callback(this._target, ctx, scaleX, scaleY);
    }
    needDraw():boolean {
        return this._needDraw;
    }

}

export enum _dirtyFlags {
    transformDirty = 1 << 0,
    visibleDirty = 1 << 1,
    colorDirty = 1 << 2,
    opacityDirty = 1 << 3,
    cacheDirty = 1 << 4,
    orderDirty = 1 << 5,
    textDirty = 1 << 6,
    gradientDirty = 1 << 7,
    textureDirty = 1 << 8,
    contentDirty = 1 << 9,
    COUNT = 10,
    all = (1 << 10) - 1
}
var dirtyFlags = _dirtyFlags;
var ONE_DEGREE = Math.PI / 180;


function transformChildTree(root:ccNode) {
    var index = 1;
    var children:Array<ccNode>, child:ccNode, curr, parentCmd, i, len;
    var stack = ccn._performStacks[ccn._performing];
    if (!stack) {
        stack = [];
        ccn._performStacks.push(stack);
    }
    stack.length = 0;
    ccn.setPerforming(ccn._performing + 1);
    stack[0] = root;
    while (index) {
        index--;
        curr = stack[index];
        // Avoid memory leak
        stack[index] = null;
        if (!curr) continue;
        children = curr._children;
        if (children && children.length > 0) {
            parentCmd = curr._renderCmd;
            for (i = 0, len = children.length; i < len; ++i) {
                child = children[i];
                stack[index] = child;
                index++;
                child._renderCmd.transform(parentCmd);
            }
        }
        var pChildren = (<any>curr)._protectedChildren;
        if (pChildren && pChildren.length > 0) {
            parentCmd = curr._renderCmd;
            for (i = 0, len = pChildren.length; i < len; ++i) {
                child = pChildren[i];
                stack[index] = child;
                index++;
                child._renderCmd.transform(parentCmd);
            }
        }
    }
    ccn.setPerforming(ccn._performing-1);
}


export class RenderCmd implements IRenderCmd  {
    _anchorPointInPoints: Point = { x: 0, y: 0 };
    _displayedColor: Color = color(255, 255, 255, 255);

    _needDraw: boolean = false;
    _dirtyFlag: _dirtyFlags = 1;
    _curLevel: number = -1;

    _displayedOpacity:number = 255;
    _cascadeColorEnabledDirty: boolean = false;
    _cascadeOpacityEnabledDirty: boolean = false;

    _transform: AffineTransform = null;
    _worldTransform: AffineTransform = null;
    _inverse: AffineTransform = null;

    constructor(public _node: ccNode) {

    }


    needDraw(): boolean {
        return this._needDraw;
    }

    getAnchorPointInPoints(): Point {
        return p(this._anchorPointInPoints);
    }

    getDisplayedColor(): Color {
        var tmpColor = this._displayedColor;
        return color(tmpColor.r, tmpColor.g, tmpColor.b, tmpColor.a);
    }

    getDisplayedOpacity(): number {
        return this._displayedOpacity;
    }



    setCascadeColorEnabledDirty(): void {
        this._cascadeColorEnabledDirty = true;
        this.setDirtyFlag(_dirtyFlags.colorDirty);
    }

    setCascadeOpacityEnabledDirty(): void {
        this._cascadeOpacityEnabledDirty = true;
        this.setDirtyFlag(_dirtyFlags.opacityDirty);
    }

    getParentToNodeTransform(): AffineTransform {
        if (!this._inverse) {
            this._inverse = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
        }
        if (this._dirtyFlag & _dirtyFlags.transformDirty) {
            affineTransformInvertOut(this.getNodeToParentTransform(), this._inverse);
        }
        return this._inverse;
    }

    detachFromParent(): void {
    }

    _updateAnchorPointInPoint(): void {
        var locAPP = this._anchorPointInPoints, locSize = this._node._contentSize, locAnchorPoint = this._node._anchorPoint;
        locAPP.x = locSize.width * locAnchorPoint.x;
        locAPP.y = locSize.height * locAnchorPoint.y;
        this.setDirtyFlag(_dirtyFlags.transformDirty);
    }

    setDirtyFlag(dirtyFlag: _dirtyFlags, child?: boolean) {
        if (this._dirtyFlag === 0 && dirtyFlag !== 0)
            game.renderer.pushDirtyNode(this);
        this._dirtyFlag |= dirtyFlag;
    }

    getParentRenderCmd(): RenderCmd {
        if (this._node && this._node._parent && this._node._parent._renderCmd)
            return this._node._parent._renderCmd;
        return null;
    }

    transform(parentCmd?: RenderCmd, recursive: boolean=false): void {
        if (!this._transform) {
            this._transform = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
            this._worldTransform = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
        }

        var node = this._node,
            pt = parentCmd ? parentCmd._worldTransform : null,
            t = this._transform,
            wt = this._worldTransform;         //get the world transform

        if (node._usingNormalizedPosition && node._parent) {
            var conSize = node._parent._contentSize;
            node._position.x = node._normalizedPosition.x * conSize.width;
            node._position.y = node._normalizedPosition.y * conSize.height;
            node._normalizedPositionDirty = false;
        }

        var hasRotation = node._rotationX || node._rotationY;
        var hasSkew = node._skewX || node._skewY;
        var sx = node._scaleX, sy = node._scaleY;
        var appX = this._anchorPointInPoints.x, appY = this._anchorPointInPoints.y;
        var a = 1, b = 0, c = 0, d = 1;
        if (hasRotation || hasSkew) {
            // position
            t.tx = node._position.x;
            t.ty = node._position.y;

            // rotation
            if (hasRotation) {
                var rotationRadiansX = node._rotationX * ONE_DEGREE;
                c = Math.sin(rotationRadiansX);
                d = Math.cos(rotationRadiansX);
                if (node._rotationY === node._rotationX) {
                    a = d;
                    b = -c;
                }
                else {
                    var rotationRadiansY = node._rotationY * ONE_DEGREE;
                    a = Math.cos(rotationRadiansY);
                    b = -Math.sin(rotationRadiansY);
                }
            }

            // scale
            t.a = a *= sx;
            t.b = b *= sx;
            t.c = c *= sy;
            t.d = d *= sy;

            // skew
            if (hasSkew) {
                var skx = Math.tan(node._skewX * ONE_DEGREE);
                var sky = Math.tan(node._skewY * ONE_DEGREE);
                if (skx === Infinity)
                    skx = 99999999;
                if (sky === Infinity)
                    sky = 99999999;
                t.a = a + c * sky;
                t.b = b + d * sky;
                t.c = c + a * skx;
                t.d = d + b * skx;
            }

            if (appX || appY) {
                t.tx -= t.a * appX + t.c * appY;
                t.ty -= t.b * appX + t.d * appY;
                // adjust anchorPoint
                if (node._ignoreAnchorPointForPosition) {
                    t.tx += appX;
                    t.ty += appY;
                }
            }

            if (node._additionalTransformDirty) {
                affineTransformConcatIn(t, node._additionalTransform);
            }

            if (pt) {
                // cc.AffineTransformConcat is incorrect at get world transform
                wt.a = t.a * pt.a + t.b * pt.c;                               //a
                wt.b = t.a * pt.b + t.b * pt.d;                               //b
                wt.c = t.c * pt.a + t.d * pt.c;                               //c
                wt.d = t.c * pt.b + t.d * pt.d;                               //d
                wt.tx = pt.a * t.tx + pt.c * t.ty + pt.tx;
                wt.ty = pt.d * t.ty + pt.ty + pt.b * t.tx;
            } else {
                wt.a = t.a;
                wt.b = t.b;
                wt.c = t.c;
                wt.d = t.d;
                wt.tx = t.tx;
                wt.ty = t.ty;
            }
        }
        else {
            t.a = sx;
            t.b = 0;
            t.c = 0;
            t.d = sy;
            t.tx = node._position.x;
            t.ty = node._position.y;

            if (appX || appY) {
                t.tx -= t.a * appX;
                t.ty -= t.d * appY;
                // adjust anchorPoint
                if (node._ignoreAnchorPointForPosition) {
                    t.tx += appX;
                    t.ty += appY;
                }
            }

            if (node._additionalTransformDirty) {
                affineTransformConcatIn(t, node._additionalTransform);
            }

            if (pt) {
                wt.a = t.a * pt.a + t.b * pt.c;
                wt.b = t.a * pt.b + t.b * pt.d;
                wt.c = t.c * pt.a + t.d * pt.c;
                wt.d = t.c * pt.b + t.d * pt.d;
                wt.tx = t.tx * pt.a + t.ty * pt.c + pt.tx;
                wt.ty = t.tx * pt.b + t.ty * pt.d + pt.ty;
            } else {
                wt.a = t.a;
                wt.b = t.b;
                wt.c = t.c;
                wt.d = t.d;
                wt.tx = t.tx;
                wt.ty = t.ty;
            }
        }


        this.isTransforming();

        if (recursive) {
            transformChildTree(node);
        }

    }

    protected isTransforming() {
        //if (this._updateCurrentRegions) {
        //    this._updateCurrentRegions();
        //    this.notifyIsDirty();
        //}

        //this._cacheDirty = true;
    }

    protected notifyIsDirty(special: boolean = false): void {
        //if (!special) {
        //    this._notifyRegionStatus && this._notifyRegionStatus(CanvasRenderCmd.RegionStatus.Dirty);
        //} else {
        //    this._notifyRegionStatus && this._notifyRegionStatus(CanvasRenderCmd.RegionStatus.DirtyDouble);
        //}
    }
    rendering(ctx: RenderingContext | CanvasContextWrapper, ...args: Array<any>):void {

    }

    getNodeToParentTransform(): AffineTransform {
        if (!this._transform || this._dirtyFlag & _dirtyFlags.transformDirty) {
            this.transform();
        }
        return this._transform;
    }

    visit(parentCmd: RenderCmd) {
        var node = this._node, renderer = game.renderer;

        parentCmd = parentCmd || this.getParentRenderCmd();
        if (parentCmd)
            this._curLevel = parentCmd._curLevel + 1;

        if (isNaN(node._customZ)) {
            node._vertexZ = renderer.assignedZ;
            renderer.assignedZ += renderer.assignedZStep;
        }

        this._syncStatus(parentCmd);
    }

    _updateDisplayColor(parentColor?: Color): void {
        var node = this._node;
        var locDispColor = this._displayedColor, locRealColor = node._realColor;
        var i, len, selChildren, item;
        this.notifyIsDirty();
        if (this._cascadeColorEnabledDirty && !node._cascadeColorEnabled) {
            locDispColor.r = locRealColor.r;
            locDispColor.g = locRealColor.g;
            locDispColor.b = locRealColor.b;
            var whiteColor = new Color(255, 255, 255, 255);
            selChildren = node._children;
            for (i = 0, len = selChildren.length; i < len; i++) {
                item = selChildren[i];
                if (item && item._renderCmd)
                    item._renderCmd._updateDisplayColor(whiteColor);
            }
            this._cascadeColorEnabledDirty = false;
        } else {
            if (parentColor === undefined) {
                var locParent = node._parent;
                if (locParent && locParent._cascadeColorEnabled)
                    parentColor = locParent.getDisplayedColor();
                else
                    parentColor = Color.WHITE;
            }
            locDispColor.r = 0 | (locRealColor.r * parentColor.r / 255.0);
            locDispColor.g = 0 | (locRealColor.g * parentColor.g / 255.0);
            locDispColor.b = 0 | (locRealColor.b * parentColor.b / 255.0);
            if (node._cascadeColorEnabled) {
                selChildren = node._children;
                for (i = 0, len = selChildren.length; i < len; i++) {
                    item = selChildren[i];
                    if (item && item._renderCmd) {
                        item._renderCmd._updateDisplayColor(locDispColor);
                        item._renderCmd._updateColor();
                    }
                }
            }
        }
        this._dirtyFlag &= ~(_dirtyFlags.colorDirty);
    }

    _updateDisplayOpacity(parentOpacity?: number): void {
        var node = this._node;
        var i, len, selChildren, item;
        this.notifyIsDirty();
        if (this._cascadeOpacityEnabledDirty && !node._cascadeOpacityEnabled) {
            this._displayedOpacity = node._realOpacity;
            selChildren = node._children;
            for (i = 0, len = selChildren.length; i < len; i++) {
                item = selChildren[i];
                if (item && item._renderCmd)
                    item._renderCmd._updateDisplayOpacity(255);
            }
            this._cascadeOpacityEnabledDirty = false;
        } else {
            if (parentOpacity === undefined) {
                var locParent = node._parent;
                parentOpacity = 255;
                if (locParent && locParent._cascadeOpacityEnabled)
                    parentOpacity = locParent.getDisplayedOpacity();
            }
            this._displayedOpacity = node._realOpacity * parentOpacity / 255.0;
            if (node._cascadeOpacityEnabled) {
                selChildren = node._children;
                for (i = 0, len = selChildren.length; i < len; i++) {
                    item = selChildren[i];
                    if (item && item._renderCmd) {
                        item._renderCmd._updateDisplayOpacity(this._displayedOpacity);
                        item._renderCmd._updateColor();
                    }
                }
            }
        }
        this._dirtyFlag &= ~(_dirtyFlags.opacityDirty);
    }

    _syncDisplayColor(parentColor?: Color): void {
        var node = this._node, locDispColor = this._displayedColor, locRealColor = node._realColor;
        if (parentColor === undefined) {
            var locParent = node._parent;
            if (locParent && locParent._cascadeColorEnabled)
                parentColor = locParent.getDisplayedColor();
            else
                parentColor = Color.WHITE;
        }
        locDispColor.r = 0 | (locRealColor.r * parentColor.r / 255.0);
        locDispColor.g = 0 | (locRealColor.g * parentColor.g / 255.0);
        locDispColor.b = 0 | (locRealColor.b * parentColor.b / 255.0);
    }

    _syncDisplayOpacity(parentOpacity?: number): void {
        var node = this._node;
        if (parentOpacity === undefined) {
            var locParent = node._parent;
            parentOpacity = 255;
            if (locParent && locParent._cascadeOpacityEnabled)
                parentOpacity = locParent.getDisplayedOpacity();
        }
        this._displayedOpacity = node._realOpacity * parentOpacity / 255.0;
    }

    _updateColor() {
    }

    _propagateFlagsDown(parentCmd: RenderCmd) {
        var locFlag = this._dirtyFlag;
        var parentNode = parentCmd ? parentCmd._node : null;

        if (parentNode && parentNode._cascadeColorEnabled && (parentCmd._dirtyFlag & _dirtyFlags.colorDirty))
            locFlag |= _dirtyFlags.colorDirty;

        if (parentNode && parentNode._cascadeOpacityEnabled && (parentCmd._dirtyFlag & _dirtyFlags.opacityDirty))
            locFlag |= _dirtyFlags.opacityDirty;

        if (parentCmd && (parentCmd._dirtyFlag & _dirtyFlags.transformDirty))
            locFlag |= _dirtyFlags.transformDirty;

        this._dirtyFlag = locFlag;
    }


    updateStatus() {
        var locFlag = this._dirtyFlag;
        var colorDirty = locFlag & _dirtyFlags.colorDirty,
            opacityDirty = locFlag & _dirtyFlags.opacityDirty;

        if (locFlag & _dirtyFlags.contentDirty) {
            this.notifyIsDirty();
            this._dirtyFlag &= ~(_dirtyFlags.contentDirty);
        }

        if (colorDirty)
            this._updateDisplayColor();

        if (opacityDirty)
            this._updateDisplayOpacity();

        if (colorDirty || opacityDirty)
            this._updateColor();

        if (locFlag & _dirtyFlags.transformDirty) {
            //update the transform
            this.transform(this.getParentRenderCmd(), true);
            this._dirtyFlag &= ~(_dirtyFlags.transformDirty);
        }

        if (locFlag & _dirtyFlags.orderDirty)
            this._dirtyFlag &= ~(_dirtyFlags.orderDirty);
    }

    _syncStatus(parentCmd: RenderCmd) {
        //  In the visit logic does not restore the _dirtyFlag
        //  Because child elements need parent's _dirtyFlag to change himself
        var locFlag = this._dirtyFlag, parentNode = parentCmd ? parentCmd._node : null;

        //  There is a possibility:
        //    The parent element changed color, child element not change
        //    This will cause the parent element changed color
        //    But while the child element does not enter the circulation
        //    Here will be reset state in last
        //    In order the child elements get the parent state
        if (parentNode && parentNode._cascadeColorEnabled && (parentCmd._dirtyFlag & dirtyFlags.colorDirty))
            locFlag |= dirtyFlags.colorDirty;

        if (parentNode && parentNode._cascadeOpacityEnabled && (parentCmd._dirtyFlag & dirtyFlags.opacityDirty))
            locFlag |= dirtyFlags.opacityDirty;

        if (parentCmd && (parentCmd._dirtyFlag & dirtyFlags.transformDirty))
            locFlag |= dirtyFlags.transformDirty;

        this._dirtyFlag = locFlag;

        var colorDirty = locFlag & dirtyFlags.colorDirty,
            opacityDirty = locFlag & dirtyFlags.opacityDirty;

        if (colorDirty)
            //update the color
            this._syncDisplayColor();

        if (opacityDirty)
            //update the opacity
            this._syncDisplayOpacity();

        if (colorDirty || opacityDirty)
            this._updateColor();

        if (locFlag & dirtyFlags.transformDirty)
            //update the transform
            this.transform(parentCmd);

        if (locFlag & dirtyFlags.orderDirty)
            this._dirtyFlag &= ~dirtyFlags.orderDirty;
    }

    setShaderProgram(shaderProgram: GLProgram) {
        //do nothing.
    }

    getShaderProgram(): GLProgram {
        return null;
    }

    getGLProgramState(): GLProgramState {
        return null;
    }

    setGLProgramState(glProgramState: GLProgramState) {
        // do nothing
    }

    originTransform = this.transform;
    originUpdateStatus = this.updateStatus;
    _originSyncStatus = this._syncStatus;

}
