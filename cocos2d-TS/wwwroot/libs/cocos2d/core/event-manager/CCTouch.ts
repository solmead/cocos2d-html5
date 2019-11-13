import { ccClass } from "../platform/ccClass";
import {Point, p}from "../cocoa/index";
import { log } from "../../../startup/CCDebugger";
import { pSub } from "../support/index";
import { game } from "../../../startup/CCGame";

/****************************************************************************
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
 * The touch event class
 * @class
 * @extends cc.Class
 *
 * @param {Number} x
 * @param {Number} y
 * @param {Number} id
 */
export class ccTouch extends ccClass {
    _lastModified: number = 0;
    _point: Point = null;
    _prevPoint:Point = null;
    _id:number =0;
    _startPointCaptured:boolean = false;
    _startPoint:Point = null;

    constructor(x:number, y:number, id?:number) {
        super();
        this.setTouchInfo(id, x, y);
    }
/**
     * Returns the current touch location in OpenGL coordinates
     * @return {cc.Point}
     */
    getLocation():Point {
        //TODO
        //return cc.director.convertToGL(this._point);
        return {x: this._point.x, y: this._point.y};
    }
/**
	 * Returns X axis location value
	 * @returns {number}
	 */
	getLocationX():number {
		return this._point.x;
	}

/**
     * Returns Y axis location value
	 * @returns {number}
	 */
	getLocationY():number {
		return this._point.y;
	}
/**
     * Returns the previous touch location in OpenGL coordinates
     * @return {cc.Point}
     */
    getPreviousLocation():Point {
        //TODO
        //return cc.director.convertToGL(this._prevPoint);
        return {x: this._prevPoint.x, y: this._prevPoint.y};
    }
/**
     * Returns the start touch location in OpenGL coordinates
     * @returns {cc.Point}
     */
    getStartLocation():Point {
        //TODO
        //return cc.director.convertToGL(this._startPoint);
        return {x: this._startPoint.x, y: this._startPoint.y};
    }
/**
     * Returns the delta distance from the previous touche to the current one in screen coordinates
     * @return {cc.Point}
     */
    getDelta():Point {
        return pSub(this._point, this._prevPoint);
    }

    /**
     * Returns the current touch location in screen coordinates
     * @return {cc.Point}
     */
    getLocationInView():Point {
        return {x: this._point.x, y: this._point.y};
    }

    /**
     * Returns the previous touch location in screen coordinates
     * @return {cc.Point}
     */
    getPreviousLocationInView():Point{
        return {x: this._prevPoint.x, y: this._prevPoint.y};
    }

    /**
     * Returns the start touch location in screen coordinates
     * @return {cc.Point}
     */
    getStartLocationInView():Point{
        return {x: this._startPoint.x, y: this._startPoint.y};
    }

    /**
     * Returns the id of cc.Touch
     * @return {Number}
     */
    getID():number {
        return this._id;
    }

    /**
     * Returns the id of cc.Touch
     * @return {Number}
     * @deprecated since v3.0, please use getID() instead
     */
    getId():number {
        log("getId is deprecated. Please use getID instead.");
        return this._id;
    }

    /**
     * Sets information to touch
     * @param {Number} id
     * @param  {Number} x
     * @param  {Number} y
     */
    setTouchInfo(id:number, x:number, y:number) {
        this._prevPoint = this._point;
        this._point = p(x || 0, y || 0);
        this._id = id;
        if (!this._startPointCaptured) {
            this._startPoint = p(this._point);
            game._view._convertPointWithScale(this._startPoint);
            this._startPointCaptured = true;
        }
    }
    _setPoint(x: Point): void;
    _setPoint(x: number, y: number): void;
    _setPoint(x:number | Point, y:number = null):void{
        if(y === undefined){
            x = <Point>x;
            this._point.x = x.x;
            this._point.y = x.y;
        }else{
            this._point.x = <number>x;
            this._point.y = y;
        }
    }

    _setPrevPoint(x: Point): void;
    _setPrevPoint(x: number, y: number): void;
    _setPrevPoint(x: number | Point, y: number = null): void {
        if(y === undefined) {
        x = <Point>x;
            this._prevPoint = p(x.x, x.y);
        }
        else {
            this._prevPoint = p(<number>x || 0, y || 0);
        }
    }








}