import * as geo from "./CCGeometry";


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

//export module affineTransform {

/**
 * <p>cc.AffineTransform class represent an affine transform matrix. It's composed basically by translation, rotation, scale transformations.<br/>
 * Please do not use its constructor directly, use cc.affineTransformMake alias function instead.
 * </p>
 * @class cc.AffineTransform
 * @param {Number} a
 * @param {Number} b
 * @param {Number} c
 * @param {Number} d
 * @param {Number} tx
 * @param {Number} ty
 * @see cc.affineTransformMake
 */
export interface AffineTransform {
    a: number;
    b: number;
    c: number;
    d: number;
    tx: number;
    ty: number;
}

/**
 * Create a cc.AffineTransform object with all contents in the matrix
 * @function
 *
 * @param {Number} a
 * @param {Number} b
 * @param {Number} c
 * @param {Number} d
 * @param {Number} tx
 * @param {Number} ty
 * @return {cc.AffineTransform}
 */
export function affineTransformMake(a:number, b:number, c:number, d:number, tx:number, ty:number):AffineTransform {
    return { a: a, b: b, c: c, d: d, tx: tx, ty: ty };
};

/**
 * Apply the affine transformation on a point.
 * @function
 *
 * @param {cc.Point|Number} point or x
 * @param {cc.AffineTransform|Number} transOrY transform matrix or y
 * @param {cc.AffineTransform} t transform matrix or y
 * @return {cc.Point}
 */
export function pointApplyAffineTransform(point: geo.Point, t: AffineTransform): geo.Point;
export function pointApplyAffineTransform(x: number, y: number, t: AffineTransform): geo.Point;
export function pointApplyAffineTransform(point: geo.Point | number, transOrY: AffineTransform | number, t: AffineTransform = undefined): geo.Point {
    var x, y;
    if (t === undefined) {
        t = <AffineTransform>transOrY;
        x = (<geo.Point>point).x;
        y = (<geo.Point>point).y;
    } else {
        x = point;
        y = transOrY;
    }
    return { x: t.a * x + t.c * y + t.tx, y: t.b * x + t.d * y + t.ty };
};

export function _pointApplyAffineTransform(x: number, y: number, t: AffineTransform): geo.Point {   //it will remove.
    return pointApplyAffineTransform(x, y, t);
};

/**
 * Apply the affine transformation on a size.
 * @function
 *
 * @param {cc.Size} size
 * @param {cc.AffineTransform} t
 * @return {cc.Size}
 */
export function sizeApplyAffineTransform(size: geo.Size, t: AffineTransform): geo.Size {
    return { width: t.a * size.width + t.c * size.height, height: t.b * size.width + t.d * size.height };
};

/**
 * <p>Create a identity transformation matrix: <br/>
 * [ 1, 0, 0, <br/>
 *   0, 1, 0 ]</p>
 * @function
 *
 * @return {cc.AffineTransform}
 */
export function affineTransformMakeIdentity():AffineTransform {
    return { a: 1.0, b: 0.0, c: 0.0, d: 1.0, tx: 0.0, ty: 0.0 };
};

/**
 * <p>Create a identity transformation matrix: <br/>
 * [ 1, 0, 0, <br/>
 *   0, 1, 0 ]</p>
 * @function
 *
 * @return {cc.AffineTransform}
 * @deprecated since v3.0, please use cc.affineTransformMakeIdentity() instead
 * @see cc.affineTransformMakeIdentity
 */
export function affineTransformIdentity():AffineTransform {
    return { a: 1.0, b: 0.0, c: 0.0, d: 1.0, tx: 0.0, ty: 0.0 };
};

/**
 * Apply the affine transformation on a rect.
 * @function
 *
 * @param {cc.Rect} rect
 * @param {cc.AffineTransform} anAffineTransform
 * @return {cc.Rect}
 */
export function rectApplyAffineTransform(rect: geo.Rect, anAffineTransform: AffineTransform): geo.Rect {
    var top = geo.rectGetMinY(rect);
    var left = geo.rectGetMinX(rect);
    var right = geo.rectGetMaxX(rect);
    var bottom = geo.rectGetMaxY(rect);

    var topLeft = pointApplyAffineTransform(left, top, anAffineTransform);
    var topRight = pointApplyAffineTransform(right, top, anAffineTransform);
    var bottomLeft = pointApplyAffineTransform(left, bottom, anAffineTransform);
    var bottomRight = pointApplyAffineTransform(right, bottom, anAffineTransform);

    var minX = Math.min(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x);
    var maxX = Math.max(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x);
    var minY = Math.min(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);
    var maxY = Math.max(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);

    return geo.rect(minX, minY, (maxX - minX), (maxY - minY));
};

export function _rectApplyAffineTransformIn(rect: geo.Rect, anAffineTransform: AffineTransform):geo.Rect {
    var top = geo.rectGetMinY(rect);
    var left = geo.rectGetMinX(rect);
    var right = geo.rectGetMaxX(rect);
    var bottom = geo.rectGetMaxY(rect);

    var topLeft = pointApplyAffineTransform(left, top, anAffineTransform);
    var topRight = pointApplyAffineTransform(right, top, anAffineTransform);
    var bottomLeft = pointApplyAffineTransform(left, bottom, anAffineTransform);
    var bottomRight = pointApplyAffineTransform(right, bottom, anAffineTransform);

    var minX = Math.min(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x);
    var maxX = Math.max(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x);
    var minY = Math.min(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);
    var maxY = Math.max(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);

    rect.x = minX;
    rect.y = minY;
    rect.width = maxX - minX;
    rect.height = maxY - minY;
    return rect;
};

/**
 * Create a new affine transformation with a base transformation matrix and a translation based on it.
 * @function
 *
 * @param {cc.AffineTransform} t The base affine transform object
 * @param {Number} tx The translation on x axis
 * @param {Number} ty The translation on y axis
 * @return {cc.AffineTransform}
 */
export function affineTransformTranslate(t:AffineTransform, tx:number, ty:number):AffineTransform {
    return {
        a: t.a,
        b: t.b,
        c: t.c,
        d: t.d,
        tx: t.tx + t.a * tx + t.c * ty,
        ty: t.ty + t.b * tx + t.d * ty
    };
};

/**
 * Create a new affine transformation with a base transformation matrix and a scale based on it.
 * @function
 * @param {cc.AffineTransform} t The base affine transform object
 * @param {Number} sx The scale on x axis
 * @param {Number} sy The scale on y axis
 * @return {cc.AffineTransform}
 */
export function affineTransformScale(t:AffineTransform, sx:number, sy:number):AffineTransform {
    return { a: t.a * sx, b: t.b * sx, c: t.c * sy, d: t.d * sy, tx: t.tx, ty: t.ty };
};

/**
 * Create a new affine transformation with a base transformation matrix and a rotation based on it.
 * @function
 * @param {cc.AffineTransform} aTransform The base affine transform object
 * @param {Number} anAngle  The angle to rotate
 * @return {cc.AffineTransform}
 */
export function affineTransformRotate(aTransform:AffineTransform, anAngle:number):AffineTransform {
    var fSin = Math.sin(anAngle);
    var fCos = Math.cos(anAngle);

    return {
        a: aTransform.a * fCos + aTransform.c * fSin,
        b: aTransform.b * fCos + aTransform.d * fSin,
        c: aTransform.c * fCos - aTransform.a * fSin,
        d: aTransform.d * fCos - aTransform.b * fSin,
        tx: aTransform.tx,
        ty: aTransform.ty
    };
};

/**
 * Concatenate a transform matrix to another and return the result:<br/>
 * t' = t1 * t2
 * @function
 * @param {cc.AffineTransform} t1 The first transform object
 * @param {cc.AffineTransform} t2 The transform object to concatenate
 * @return {cc.AffineTransform} The result of concatenation
 */
export function affineTransformConcat(t1:AffineTransform, t2:AffineTransform):AffineTransform {
    return {
        a: t1.a * t2.a + t1.b * t2.c,                          //a
        b: t1.a * t2.b + t1.b * t2.d,                               //b
        c: t1.c * t2.a + t1.d * t2.c,                               //c
        d: t1.c * t2.b + t1.d * t2.d,                               //d
        tx: t1.tx * t2.a + t1.ty * t2.c + t2.tx,                    //tx
        ty: t1.tx * t2.b + t1.ty * t2.d + t2.ty
    };				    //ty
};

/**
 * Concatenate a transform matrix to another<br/>
 * The results are reflected in the first matrix.<br/>
 * t' = t1 * t2
 * @function
 * @param {cc.AffineTransform} t1 The first transform object
 * @param {cc.AffineTransform} t2 The transform object to concatenate
 * @return {cc.AffineTransform} The result of concatenation
 */
export function affineTransformConcatIn(t1:AffineTransform, t2:AffineTransform):AffineTransform {
    var a = t1.a, b = t1.b, c = t1.c, d = t1.d, tx = t1.tx, ty = t1.ty;
    t1.a = a * t2.a + b * t2.c;
    t1.b = a * t2.b + b * t2.d;
    t1.c = c * t2.a + d * t2.c;
    t1.d = c * t2.b + d * t2.d;
    t1.tx = tx * t2.a + ty * t2.c + t2.tx;
    t1.ty = tx * t2.b + ty * t2.d + t2.ty;
    return t1;
};

/**
 * Return true if an affine transform equals to another, false otherwise.
 * @function
 * @param {cc.AffineTransform} t1
 * @param {cc.AffineTransform} t2
 * @return {Boolean}
 */
export function affineTransformEqualToTransform(t1:AffineTransform, t2:AffineTransform):boolean {
    return ((t1.a === t2.a) && (t1.b === t2.b) && (t1.c === t2.c) && (t1.d === t2.d) && (t1.tx === t2.tx) && (t1.ty === t2.ty));
};

/**
 * Get the invert transform of an AffineTransform object
 * @function
 * @param {cc.AffineTransform} t
 * @return {cc.AffineTransform} The inverted transform object
 */
export function affineTransformInvert(t:AffineTransform):AffineTransform {
    var determinant = 1 / (t.a * t.d - t.b * t.c);
    return {
        a: determinant * t.d, b: -determinant * t.b, c: -determinant * t.c, d: determinant * t.a,
        tx: determinant * (t.c * t.ty - t.d * t.tx), ty: determinant * (t.b * t.tx - t.a * t.ty)
    };
};

export function affineTransformInvertOut(t:AffineTransform, out:AffineTransform):void {
    var a = t.a, b = t.b, c = t.c, d = t.d;
    var determinant = 1 / (a * d - b * c);
    out.a = determinant * d;
    out.b = -determinant * b;
    out.c = -determinant * c;
    out.d = determinant * a;
    out.tx = determinant * (c * t.ty - d * t.tx);
    out.ty = determinant * (b * t.tx - a * t.ty);
};

















//}