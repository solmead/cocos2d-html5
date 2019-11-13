import { Point, p, Size } from "../cocoa/index";

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

/**
 * <p>Point extensions based on Chipmunk's cpVect file.<br />
 * These extensions work both with Point</p>
 *
 * <p>The "ccp" prefix means: "CoCos2d Point"</p>
 *
 * <p> //Examples:<br />
 * - pAdd( p(1,1), p(2,2) ); // preferred cocos2d way<br />
 * - pAdd( p(1,1), p(2,2) ); // also ok but more verbose<br />
 * - pAdd( cpv(1,1), cpv(2,2) ); // mixing chipmunk and cocos2d (avoid)</p>
 */

/**
 * smallest such that 1.0+FLT_EPSILON != 1.0
 * @constant
 * @type Number
 */
export var POINT_EPSILON = parseFloat('1.192092896e-07F');

/**
 * Returns opposite of point.
 * @param {Point} point
 * @return {Point}
 */
export function pNeg(point:Point):Point {
    return p(-point.x, -point.y);
};

/**
 * Calculates sum of two points.
 * @param {Point} v1
 * @param {Point} v2
 * @return {Point}
 */
export function pAdd(v1: Point, v2: Point): Point {
    return p(v1.x + v2.x, v1.y + v2.y);
};

/**
 * Calculates difference of two points.
 * @param {Point} v1
 * @param {Point} v2
 * @return {Point}
 */
export function pSub(v1: Point, v2: Point): Point {
    return p(v1.x - v2.x, v1.y - v2.y);
};

/**
 * Returns point multiplied by given factor.
 * @param {Point} point
 * @param {Number} floatVar
 * @return {Point}
 */
export function pMult(point: Point, floatVar: number): Point {
    return p(point.x * floatVar, point.y * floatVar);
};

/**
 * Calculates midpoint between two points.
 * @param {Point} v1
 * @param {Point} v2
 * @return {Point}
 */
export function pMidpoint(v1: Point, v2: Point): Point {
    return pMult(pAdd(v1, v2), 0.5);
};

/**
 * Calculates dot product of two points.
 * @param {Point} v1
 * @param {Point} v2
 * @return {Number}
 */
export function pDot(v1: Point, v2: Point): number {
    return v1.x * v2.x + v1.y * v2.y;
};

/**
 * Calculates cross product of two points.
 * @param {Point} v1
 * @param {Point} v2
 * @return {Number}
 */
export function pCross(v1: Point, v2: Point): number {
    return v1.x * v2.y - v1.y * v2.x;
};

/**
 * Calculates perpendicular of v, rotated 90 degrees counter-clockwise -- cross(v, perp(v)) >= 0
 * @param {Point} point
 * @return {Point}
 */
export function pPerp(point: Point): Point {
    return p(-point.y, point.x);
};

/**
 * Calculates perpendicular of v, rotated 90 degrees clockwise -- cross(v, rperp(v)) <= 0
 * @param {Point} point
 * @return {Point}
 */
export function pRPerp(point: Point): Point {
    return p(point.y, -point.x);
};

/**
 * Calculates the projection of v1 over v2.
 * @param {Point} v1
 * @param {Point} v2
 * @return {Point}
 */
export function pProject(v1: Point, v2: Point): Point {
    return pMult(v2, pDot(v1, v2) / pDot(v2, v2));
};

/**
 * Rotates two points.
 * @param  {Point} v1
 * @param  {Point} v2
 * @return {Point}
 */
export function pRotate(v1: Point, v2: Point): Point {
    return p(v1.x * v2.x - v1.y * v2.y, v1.x * v2.y + v1.y * v2.x);
};

/**
 * Unrotates two points.
 * @param  {Point} v1
 * @param  {Point} v2
 * @return {Point}
 */
export function pUnrotate(v1: Point, v2: Point): Point {
    return p(v1.x * v2.x + v1.y * v2.y, v1.y * v2.x - v1.x * v2.y);
};

/**
 * Calculates the square length of a Point (not calling sqrt() )
 * @param  {Point} v
 *@return {Number}
 */
export function pLengthSQ(v: Point): number {
    return pDot(v, v);
};

/**
 * Calculates the square distance between two points (not calling sqrt() )
 * @param {Point} point1
 * @param {Point} point2
 * @return {Number}
 */
export function pDistanceSQ(point1: Point, point2: Point): number {
    return pLengthSQ(pSub(point1, point2));
};

/**
 * Calculates distance between point an origin
 * @param  {Point} v
 * @return {Number}
 */
export function pLength(v: Point): number {
    return Math.sqrt(pLengthSQ(v));
};

/**
 * Calculates the distance between two points
 * @param {Point} v1
 * @param {Point} v2
 * @return {Number}
 */
export function pDistance(v1: Point, v2: Point): number {
    return pLength(pSub(v1, v2));
};

/**
 * Returns point multiplied to a length of 1.
 * @param {Point} v
 * @return {Point}
 */
export function pNormalize(v: Point): Point {
    var n = pLength(v);
    return n === 0 ? p(v) : pMult(v, 1.0 / n);
};

/**
 * Converts radians to a normalized vector.
 * @param {Number} a
 * @return {Point}
 */
export function pForAngle(a: number): Point {
    return p(Math.cos(a), Math.sin(a));
};

/**
 * Converts a vector to radians.
 * @param {Point} v
 * @return {Number}
 */
export function pToAngle(v: Point): number {
    return Math.atan2(v.y, v.x);
};

/**
 * Clamp a value between from and to.
 * @param {Number} value
 * @param {Number} min_inclusive
 * @param {Number} max_inclusive
 * @return {Number}
 */
export function clampf(value:number, min_inclusive: number, max_inclusive: number): number {
    if (min_inclusive > max_inclusive) {
        var temp = min_inclusive;
        min_inclusive = max_inclusive;
        max_inclusive = temp;
    }
    return value < min_inclusive ? min_inclusive : value < max_inclusive ? value : max_inclusive;
};

/**
 * Clamp a point between from and to.
 * @param {Point} p
 * @param {Number} min_inclusive
 * @param {Number} max_inclusive
 * @return {Point}
 */
export function pClamp(pt: Point, min_inclusive: Point, max_inclusive: Point): Point {
    return p(clampf(pt.x, min_inclusive.x, max_inclusive.x), clampf(pt.y, min_inclusive.y, max_inclusive.y));
};

/**
 * Quickly convert Size to a Point
 * @param {Size} s
 * @return {Point}
 */
export function pFromSize(s: Size): Point {
    return p(s.width, s.height);
};

/**
 * Run a math operation function on each point component <br />
 * Math.abs, Math.fllor, Math.ceil, Math.round.
 * @param {Point} p
 * @param {Function} opFunc
 * @return {Point}
 * @example
 * //For example: let's try to take the floor of x,y
 * var p = pCompOp(p(10,10),Math.abs);
 */
export function pCompOp(pt: Point, opFunc:(n:number)=>number): Point {
    return p(opFunc(pt.x), opFunc(pt.y));
};

/**
 * Linear Interpolation between two points a and b
 * alpha == 0 ? a
 * alpha == 1 ? b
 * otherwise a value between a..b
 * @param {Point} a
 * @param {Point} b
 * @param {Number} alpha
 * @return {Point}
 */
export function pLerp(a: Point, b: Point, alpha: number): Point {
    return pAdd(pMult(a, 1 - alpha), pMult(b, alpha));
};

/**
 * @param {Point} a
 * @param {Point} b
 * @param {Number} variance
 * @return {Boolean} if points have fuzzy equality which means equal with some degree of variance.
 */
export function pFuzzyEqual(a: Point, b: Point, variance: number):boolean {
    if (a.x - variance <= b.x && b.x <= a.x + variance) {
        if (a.y - variance <= b.y && b.y <= a.y + variance)
            return true;
    }
    return false;
};

/**
 * Multiplies a nd b components, a.x*b.x, a.y*b.y
 * @param {Point} a
 * @param {Point} b
 * @return {Point}
 */
export function pCompMult(a: Point, b: Point): Point {
    return p(a.x * b.x, a.y * b.y);
};

/**
 * @param {Point} a
 * @param {Point} b
 * @return {Number} the signed angle in radians between two vector directions
 */
export function pAngleSigned(a: Point, b: Point): number {
    var a2 = pNormalize(a);
    var b2 = pNormalize(b);
    var angle = Math.atan2(a2.x * b2.y - a2.y * b2.x, pDot(a2, b2));
    if (Math.abs(angle) < POINT_EPSILON)
        return 0.0;
    return angle;
};

/**
 * @param {Point} a
 * @param {Point} b
 * @return {Number} the angle in radians between two vector directions
 */
export function pAngle(a: Point, b: Point): number {
    var angle = Math.acos(pDot(pNormalize(a), pNormalize(b)));
    if (Math.abs(angle) < POINT_EPSILON) return 0.0;
    return angle;
};

/**
 * Rotates a point counter clockwise by the angle around a pivot
 * @param {Point} v v is the point to rotate
 * @param {Point} pivot pivot is the pivot, naturally
 * @param {Number} angle angle is the angle of rotation cw in radians
 * @return {Point} the rotated point
 */
export function pRotateByAngle(v: Point, pivot: Point, angle: number): Point {
    var r = pSub(v, pivot);
    var cosa = Math.cos(angle), sina = Math.sin(angle);
    var t = r.x;
    r.x = t * cosa - r.y * sina + pivot.x;
    r.y = t * sina + r.y * cosa + pivot.y;
    return r;
};

/**
 * A general line-line intersection test
 * indicating successful intersection of a line<br />
 * note that to truly test intersection for segments we have to make<br />
 * sure that s & t lie within [0..1] and for rays, make sure s & t > 0<br />
 * the hit point is        p3 + t * (p4 - p3);<br />
 * the hit point also is    p1 + s * (p2 - p1);
 * @param {Point} A A is the startpoint for the first line P1 = (p1 - p2).
 * @param {Point} B B is the endpoint for the first line P1 = (p1 - p2).
 * @param {Point} C C is the startpoint for the second line P2 = (p3 - p4).
 * @param {Point} D D is the endpoint for the second line P2 = (p3 - p4).
 * @param {Point} retP retP.x is the range for a hitpoint in P1 (pa = p1 + s*(p2 - p1)), <br />
 * retP.y is the range for a hitpoint in P3 (pa = p2 + t*(p4 - p3)).
 * @return {Boolean}
 */
export function pLineIntersect(A: Point, B: Point, C: Point, D: Point, retP: Point):boolean {
    if ((A.x === B.x && A.y === B.y) || (C.x === D.x && C.y === D.y)) {
        return false;
    }
    var BAx = B.x - A.x;
    var BAy = B.y - A.y;
    var DCx = D.x - C.x;
    var DCy = D.y - C.y;
    var ACx = A.x - C.x;
    var ACy = A.y - C.y;

    var denom = DCy * BAx - DCx * BAy;

    retP.x = DCx * ACy - DCy * ACx;
    retP.y = BAx * ACy - BAy * ACx;

    if (denom === 0) {
        if (retP.x === 0 || retP.y === 0) {
            // Lines incident
            return true;
        }
        // Lines parallel and not incident
        return false;
    }

    retP.x = retP.x / denom;
    retP.y = retP.y / denom;

    return true;
};

/**
 * ccpSegmentIntersect return YES if Segment A-B intersects with segment C-D.
 * @param {Point} A
 * @param {Point} B
 * @param {Point} C
 * @param {Point} D
 * @return {Boolean}
 */
export function pSegmentIntersect(A: Point, B: Point, C: Point, D: Point):boolean {
    var retP = p(0, 0);
    if (pLineIntersect(A, B, C, D, retP))
        if (retP.x >= 0.0 && retP.x <= 1.0 && retP.y >= 0.0 && retP.y <= 1.0)
            return true;
    return false;
};

/**
 * ccpIntersectPoint return the intersection point of line A-B, C-D
 * @param {Point} A
 * @param {Point} B
 * @param {Point} C
 * @param {Point} D
 * @return {Point}
 */
export function pIntersectPoint(A: Point, B: Point, C: Point, D: Point): Point {
    var retP = p(0, 0);

    if (pLineIntersect(A, B, C, D, retP)) {
        // Point of intersection
        var P = p(0, 0);
        P.x = A.x + retP.x * (B.x - A.x);
        P.y = A.y + retP.x * (B.y - A.y);
        return P;
    }

    return p(0, 0);
};

/**
 * check to see if both points are equal
 * @param {Point} A A ccp a
 * @param {Point} B B ccp b to be compared
 * @return {Boolean} the true if both ccp are same
 */
export function pSameAs(A: Point, B: Point):boolean {
    if ((A != null) && (B != null)) {
        return (A.x === B.x && A.y === B.y);
    }
    return false;
};



// High Performance In Place Operationrs ---------------------------------------

/**
 * sets the position of the point to 0
 * @param {Point} v
 */
export function pZeroIn(v: Point):void {
    v.x = 0;
    v.y = 0;
};

/**
 * copies the position of one point to another
 * @param {Point} v1
 * @param {Point} v2
 */
export function pIn(v1: Point, v2: Point):void {
    v1.x = v2.x;
    v1.y = v2.y;
};

/**
 * multiplies the point with the given factor (inplace)
 * @param {Point} point
 * @param {Number} floatVar
 */
export function pMultIn(point: Point, floatVar:number):void {
    point.x *= floatVar;
    point.y *= floatVar;
};

/**
 * subtracts one point from another (inplace)
 * @param {Point} v1
 * @param {Point} v2
 */
export function pSubIn(v1: Point, v2: Point):void {
    v1.x -= v2.x;
    v1.y -= v2.y;
};

/**
 * adds one point to another (inplace)
 * @param {Point} v1
 * @param {Point} v2
 */
export function pAddIn(v1: Point, v2: Point):void {
    v1.x += v2.x;
    v1.y += v2.y;
};

/**
 * normalizes the point (inplace)
 * @param {Point} v
 */
export function pNormalizeIn(v: Point):void {
    var n = Math.sqrt(v.x * v.x + v.y * v.y);
    if (n !== 0)
        pMultIn(v, 1.0 / n);
};
