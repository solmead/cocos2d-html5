import * as geo from "./CCGeometry";
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
export function affineTransformMake(a, b, c, d, tx, ty) {
    return { a: a, b: b, c: c, d: d, tx: tx, ty: ty };
}
;
export function pointApplyAffineTransform(point, transOrY, t = undefined) {
    var x = 0;
    var y = 0;
    if (t === undefined) {
        t = transOrY;
        x = point.x;
        y = point.y;
    }
    else {
        x = point;
        y = transOrY;
    }
    return { x: t.a * x + t.c * y + t.tx, y: t.b * x + t.d * y + t.ty };
}
;
export function _pointApplyAffineTransform(x, y, t) {
    return pointApplyAffineTransform(x, y, t);
}
;
/**
 * Apply the affine transformation on a size.
 * @function
 *
 * @param {cc.Size} size
 * @param {cc.AffineTransform} t
 * @return {cc.Size}
 */
export function sizeApplyAffineTransform(size, t) {
    return { width: t.a * size.width + t.c * size.height, height: t.b * size.width + t.d * size.height };
}
;
/**
 * <p>Create a identity transformation matrix: <br/>
 * [ 1, 0, 0, <br/>
 *   0, 1, 0 ]</p>
 * @function
 *
 * @return {cc.AffineTransform}
 */
export function affineTransformMakeIdentity() {
    return { a: 1.0, b: 0.0, c: 0.0, d: 1.0, tx: 0.0, ty: 0.0 };
}
;
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
export function affineTransformIdentity() {
    return { a: 1.0, b: 0.0, c: 0.0, d: 1.0, tx: 0.0, ty: 0.0 };
}
;
/**
 * Apply the affine transformation on a rect.
 * @function
 *
 * @param {cc.Rect} rect
 * @param {cc.AffineTransform} anAffineTransform
 * @return {cc.Rect}
 */
export function rectApplyAffineTransform(rect, anAffineTransform) {
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
}
;
export function _rectApplyAffineTransformIn(rect, anAffineTransform) {
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
}
;
/**
 * Create a new affine transformation with a base transformation matrix and a translation based on it.
 * @function
 *
 * @param {cc.AffineTransform} t The base affine transform object
 * @param {Number} tx The translation on x axis
 * @param {Number} ty The translation on y axis
 * @return {cc.AffineTransform}
 */
export function affineTransformTranslate(t, tx, ty) {
    return {
        a: t.a,
        b: t.b,
        c: t.c,
        d: t.d,
        tx: t.tx + t.a * tx + t.c * ty,
        ty: t.ty + t.b * tx + t.d * ty
    };
}
;
/**
 * Create a new affine transformation with a base transformation matrix and a scale based on it.
 * @function
 * @param {cc.AffineTransform} t The base affine transform object
 * @param {Number} sx The scale on x axis
 * @param {Number} sy The scale on y axis
 * @return {cc.AffineTransform}
 */
export function affineTransformScale(t, sx, sy) {
    return { a: t.a * sx, b: t.b * sx, c: t.c * sy, d: t.d * sy, tx: t.tx, ty: t.ty };
}
;
/**
 * Create a new affine transformation with a base transformation matrix and a rotation based on it.
 * @function
 * @param {cc.AffineTransform} aTransform The base affine transform object
 * @param {Number} anAngle  The angle to rotate
 * @return {cc.AffineTransform}
 */
export function affineTransformRotate(aTransform, anAngle) {
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
}
;
/**
 * Concatenate a transform matrix to another and return the result:<br/>
 * t' = t1 * t2
 * @function
 * @param {cc.AffineTransform} t1 The first transform object
 * @param {cc.AffineTransform} t2 The transform object to concatenate
 * @return {cc.AffineTransform} The result of concatenation
 */
export function affineTransformConcat(t1, t2) {
    return {
        a: t1.a * t2.a + t1.b * t2.c,
        b: t1.a * t2.b + t1.b * t2.d,
        c: t1.c * t2.a + t1.d * t2.c,
        d: t1.c * t2.b + t1.d * t2.d,
        tx: t1.tx * t2.a + t1.ty * t2.c + t2.tx,
        ty: t1.tx * t2.b + t1.ty * t2.d + t2.ty
    }; //ty
}
;
/**
 * Concatenate a transform matrix to another<br/>
 * The results are reflected in the first matrix.<br/>
 * t' = t1 * t2
 * @function
 * @param {cc.AffineTransform} t1 The first transform object
 * @param {cc.AffineTransform} t2 The transform object to concatenate
 * @return {cc.AffineTransform} The result of concatenation
 */
export function affineTransformConcatIn(t1, t2) {
    var a = t1.a, b = t1.b, c = t1.c, d = t1.d, tx = t1.tx, ty = t1.ty;
    t1.a = a * t2.a + b * t2.c;
    t1.b = a * t2.b + b * t2.d;
    t1.c = c * t2.a + d * t2.c;
    t1.d = c * t2.b + d * t2.d;
    t1.tx = tx * t2.a + ty * t2.c + t2.tx;
    t1.ty = tx * t2.b + ty * t2.d + t2.ty;
    return t1;
}
;
/**
 * Return true if an affine transform equals to another, false otherwise.
 * @function
 * @param {cc.AffineTransform} t1
 * @param {cc.AffineTransform} t2
 * @return {Boolean}
 */
export function affineTransformEqualToTransform(t1, t2) {
    return ((t1.a === t2.a) && (t1.b === t2.b) && (t1.c === t2.c) && (t1.d === t2.d) && (t1.tx === t2.tx) && (t1.ty === t2.ty));
}
;
/**
 * Get the invert transform of an AffineTransform object
 * @function
 * @param {cc.AffineTransform} t
 * @return {cc.AffineTransform} The inverted transform object
 */
export function affineTransformInvert(t) {
    var determinant = 1 / (t.a * t.d - t.b * t.c);
    return {
        a: determinant * t.d, b: -determinant * t.b, c: -determinant * t.c, d: determinant * t.a,
        tx: determinant * (t.c * t.ty - t.d * t.tx), ty: determinant * (t.b * t.tx - t.a * t.ty)
    };
}
;
export function affineTransformInvertOut(t, out) {
    var a = t.a, b = t.b, c = t.c, d = t.d;
    var determinant = 1 / (a * d - b * c);
    out.a = determinant * d;
    out.b = -determinant * b;
    out.c = -determinant * c;
    out.d = determinant * a;
    out.tx = determinant * (c * t.ty - d * t.tx);
    out.ty = determinant * (b * t.tx - a * t.ty);
}
;
//}
//# sourceMappingURL=CCAffineTransform.js.map