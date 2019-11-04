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
export function p(x, y = undefined) {
    // This can actually make use of "hidden classes" in JITs and thus decrease
    // memory usage and overall performance drastically
    // return cc.p(x, y);
    // but this one will instead flood the heap with newly allocated hash maps
    // giving little room for optimization by the JIT,
    // note: we have tested this item on Chrome and firefox, it is faster than cc.p(x, y)
    if (x === undefined)
        return { x: 0, y: 0 };
    if (y === undefined) {
        var x2 = x;
        return { x: x2.x, y: x2.y };
    }
    return { x: x, y: y };
}
/**
* Check whether a point's value equals to another
* @function
* @param {cc.Point} point1
* @param {cc.Point} point2
* @return {Boolean}
*/
export function pointEqualToPoint(point1, point2) {
    return point1 && point2 && (point1.x === point2.x) && (point1.y === point2.y);
}
export function size(w, h = undefined) {
    // This can actually make use of "hidden classes" in JITs and thus decrease
    // memory usage and overall performance drastically
    //return cc.size(w, h);
    // but this one will instead flood the heap with newly allocated hash maps
    // giving little room for optimization by the JIT
    // note: we have tested this item on Chrome and firefox, it is faster than cc.size(w, h)
    if (w === undefined)
        return { width: 0, height: 0 };
    if (h === undefined) {
        var w2 = w;
        return { width: w2.width, height: w2.height };
    }
    return { width: w, height: h };
}
/**
 * Check whether a point's value equals to another
 * @function
 * @param {cc.Size} size1
 * @param {cc.Size} size2
 * @return {Boolean}
 */
export function sizeEqualToSize(size1, size2) {
    return (size1 && size2 && (size1.width === size2.width) && (size1.height === size2.height));
}
export function rect(x = undefined, y = undefined, w = undefined, h = undefined) {
    if (x === undefined)
        return { x: 0, y: 0, width: 0, height: 0 };
    if (y === undefined) {
        var x2 = x;
        return { x: x2.x, y: x2.y, width: x2.width, height: x2.height };
    }
    return { x: x, y: y, width: w, height: h };
}
/**
 * Check whether a rect's value equals to another
 * @function
 * @param {cc.Rect} rect1
 * @param {cc.Rect} rect2
 * @return {Boolean}
 */
export function rectEqualToRect(rect1, rect2) {
    return rect1 && rect2 && (rect1.x === rect2.x) && (rect1.y === rect2.y) && (rect1.width === rect2.width) && (rect1.height === rect2.height);
}
export function _rectEqualToZero(rect) {
    return rect && (rect.x === 0) && (rect.y === 0) && (rect.width === 0) && (rect.height === 0);
}
;
/**
 * Check whether the rect1 contains rect2
 * @function
 * @param {cc.Rect} rect1
 * @param {cc.Rect} rect2
 * @return {Boolean}
 */
export function rectContainsRect(rect1, rect2) {
    if (!rect1 || !rect2)
        return false;
    return !((rect1.x >= rect2.x) || (rect1.y >= rect2.y) ||
        (rect1.x + rect1.width <= rect2.x + rect2.width) ||
        (rect1.y + rect1.height <= rect2.y + rect2.height));
}
/**
 * Returns the rightmost x-value of a rect
 * @function
 * @param {cc.Rect} rect
 * @return {Number} The rightmost x value
 */
export function rectGetMaxX(rect) {
    return (rect.x + rect.width);
}
/**
 * Return the midpoint x-value of a rect
 * @function
 * @param {cc.Rect} rect
 * @return {Number} The midpoint x value
 */
export function rectGetMidX(rect) {
    return (rect.x + rect.width / 2.0);
}
/**
 * Returns the leftmost x-value of a rect
 * @function
 * @param {cc.Rect} rect
 * @return {Number} The leftmost x value
 */
export function rectGetMinX(rect) {
    return rect.x;
}
/**
 * Return the topmost y-value of a rect
 * @function
 * @param {cc.Rect} rect
 * @return {Number} The topmost y value
 */
export function rectGetMaxY(rect) {
    return (rect.y + rect.height);
}
/**
 * Return the midpoint y-value of `rect'
 * @function
 * @param {cc.Rect} rect
 * @return {Number} The midpoint y value
 */
export function rectGetMidY(rect) {
    return rect.y + rect.height / 2.0;
}
/**
 * Return the bottommost y-value of a rect
 * @function
 * @param {cc.Rect} rect
 * @return {Number} The bottommost y value
 */
export function rectGetMinY(rect) {
    return rect.y;
}
/**
 * Check whether a rect contains a point
 * @function
 * @param {cc.Rect} rect
 * @param {cc.Point} point
 * @return {Boolean}
 */
export function rectContainsPoint(rect, point) {
    return (point.x >= rectGetMinX(rect) && point.x <= rectGetMaxX(rect) &&
        point.y >= rectGetMinY(rect) && point.y <= rectGetMaxY(rect));
}
/**
 * Check whether a rect intersect with another
 * @function
 * @param {cc.Rect} rectA
 * @param {cc.Rect} rectB
 * @return {Boolean}
 */
export function rectIntersectsRect(ra, rb) {
    var maxax = ra.x + ra.width, maxay = ra.y + ra.height, maxbx = rb.x + rb.width, maxby = rb.y + rb.height;
    return !(maxax < rb.x || maxbx < ra.x || maxay < rb.y || maxby < ra.y);
}
/**
 * Check whether a rect overlaps another
 * @function
 * @param {cc.Rect} rectA
 * @param {cc.Rect} rectB
 * @return {Boolean}
 */
export function rectOverlapsRect(rectA, rectB) {
    return !((rectA.x + rectA.width < rectB.x) ||
        (rectB.x + rectB.width < rectA.x) ||
        (rectA.y + rectA.height < rectB.y) ||
        (rectB.y + rectB.height < rectA.y));
}
/**
 * Returns the smallest rectangle that contains the two source rectangles.
 * @function
 * @param {cc.Rect} rectA
 * @param {cc.Rect} rectB
 * @return {cc.Rect}
 */
export function rectUnion(rectA, rectB) {
    var rct = rect(0, 0, 0, 0);
    rct.x = Math.min(rectA.x, rectB.x);
    rct.y = Math.min(rectA.y, rectB.y);
    rct.width = Math.max(rectA.x + rectA.width, rectB.x + rectB.width) - rct.x;
    rct.height = Math.max(rectA.y + rectA.height, rectB.y + rectB.height) - rct.y;
    return rct;
}
/**
 * Returns the overlapping portion of 2 rectangles
 * @function
 * @param {cc.Rect} rectA
 * @param {cc.Rect} rectB
 * @return {cc.Rect}
 */
export function rectIntersection(rectA, rectB) {
    var intersection = rect(Math.max(rectGetMinX(rectA), rectGetMinX(rectB)), Math.max(rectGetMinY(rectA), rectGetMinY(rectB)), 0, 0);
    intersection.width = Math.min(rectGetMaxX(rectA), rectGetMaxX(rectB)) - rectGetMinX(intersection);
    intersection.height = Math.min(rectGetMaxY(rectA), rectGetMaxY(rectB)) - rectGetMinY(intersection);
    return intersection;
}
//}
//# sourceMappingURL=CCGeometry.js.map