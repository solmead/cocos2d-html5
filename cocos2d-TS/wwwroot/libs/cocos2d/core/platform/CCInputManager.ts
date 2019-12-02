﻿import { Point, p, rectContainsPoint, rect } from "../cocoa/index";
import { Dictionary } from "../../../extensions/syslibs/LinqToJs";
import { sys, BROWSER_TYPES } from "../../../startup/CCSys";
import { eventManager, EventTouch, TouchEventCodes, ccTouch, EventMouse, MouseEvents, EventAcceleration, EventKeyboard } from "../event-manager/index";
import { log, _LogInfos } from "../../../startup/CCDebugger";
import { EGLView, ccPosition } from "./CCEGLView";
import { game } from "../../../startup/CCGame";
import { isFunction } from "../../../startup/CCChecks";
import { Acceleration } from "./CCTypes";
import { director } from "../CCDirector";

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
 * ignore
 */

export enum UIInterfaceOrientation {
    /**
     * @constant
     * @type {number}
     */
    LandscapeLeft = -90,
    /**
     * @constant
     * @type {number}
     */
    LandscapeRight = 90,
    /**
     * @constant
     * @type {number}
     */
    PortraitUpsideDown = 180,
    /**
     * @constant
     * @type {number}
     */
    Portrait = 0
}


/**
 * <p>
 *  This class manages all events of input. include: touch, mouse, accelerometer, keyboard                                       <br/>
 * </p>
 * @class
 * @name cc.inputManager
 */

export class InputManager {
    TOUCH_TIMEOUT = 5000;

    _mousePressed: boolean = false;

    _isRegisterEvent: boolean = false;

    _preTouchPoint: Point = p(0, 0);
    _prevMousePoint: Point = p(0, 0);

    _preTouchPool: Array<ccTouch> = [];
    _preTouchPoolPointer = 0;

    _touches: Array<ccTouch> = [];
    _touchesIntegerDict = new Dictionary<number, number>();

    _indexBitsUsed: number = 0;
    _maxTouches: number = 5;

    _accelEnabled: boolean = false;
    _accelInterval: number = 1 / 30;
    _accelMinus: number = 1;
    _accelCurTime: number = 0;
    _acceleration: Acceleration = null;
    _accelDeviceEvent: any = null;

    _glView: EGLView = game.view;

    _getUnUsedIndex(): number {
        var temp = this._indexBitsUsed;
        var now = sys.now();

        for (var i = 0; i < this._maxTouches; i++) {
            if (!(temp & 0x00000001)) {
                this._indexBitsUsed |= (1 << i);
                return i;
            }
            else {
                var touch = this._touches[i];
                if (now - touch._lastModified > this.TOUCH_TIMEOUT) {
                    this._removeUsedIndexBit(i);
                    this._touchesIntegerDict.remove(touch.getID());
                    return i;
                }
            }
            temp >>= 1;
        }

        // all bits are used
        return -1;
    }
    _removeUsedIndexBit(index: number): void {
        if (index < 0 || index >= this._maxTouches)
            return;

        var temp = 1 << index;
        temp = ~temp;
        this._indexBitsUsed &= temp;
    }


    /**
     * @function
     * @param {Array} touches
     */
    handleTouchesBegin(touches: Array<ccTouch>) {
        var selTouch: ccTouch;
        var index: number;
        var curTouch: ccTouch;
        var touchID: number;
        var handleTouches: Array<ccTouch> = [];
        var locTouchIntDict = this._touchesIntegerDict;
        var now = sys.now();
        for (var i = 0, len = touches.length; i < len; i++) {
            selTouch = touches[i];
            touchID = selTouch.getID();
            index = locTouchIntDict.get(touchID);

            if (index == null) {
                var unusedIndex = this._getUnUsedIndex();
                if (unusedIndex === -1) {
                    log(_LogInfos.inputManager_handleTouchesBegin, unusedIndex);
                    continue;
                }
                //curTouch = this._touches[unusedIndex] = selTouch;
                curTouch = this._touches[unusedIndex] = new ccTouch(selTouch._point.x, selTouch._point.y, selTouch.getID());
                curTouch._lastModified = now;
                curTouch._setPrevPoint(selTouch._prevPoint);
                locTouchIntDict.set(touchID, unusedIndex);
                handleTouches.push(curTouch);
            }
        }
        if (handleTouches.length > 0) {
            this._glView._convertTouchesWithScale(handleTouches);
            var touchEvent = new EventTouch(handleTouches);
            touchEvent._eventCode = TouchEventCodes.BEGAN;
            eventManager.dispatchEvent(touchEvent);
        }
    }

    /**
     * @function
     * @param {Array} touches
     */
    handleTouchesMove(touches: Array<ccTouch>) {
        var selTouch: ccTouch;
        var index: number;
        var touchID: number;
        var handleTouches: Array<ccTouch> = [];
        var locTouches = this._touches;
        var now = sys.now();

        for (var i = 0, len = touches.length; i < len; i++) {
            selTouch = touches[i];
            touchID = selTouch.getID();
            index = this._touchesIntegerDict.get(touchID);

            if (index == null) {
                //cc.log("if the index doesn't exist, it is an error");
                continue;
            }
            if (locTouches[index]) {
                locTouches[index]._setPoint(selTouch._point);
                locTouches[index]._setPrevPoint(selTouch._prevPoint);
                locTouches[index]._lastModified = now;
                handleTouches.push(locTouches[index]);
            }
        }
        if (handleTouches.length > 0) {
            this._glView._convertTouchesWithScale(handleTouches);
            var touchEvent = new EventTouch(handleTouches);
            touchEvent._eventCode = TouchEventCodes.MOVED;
            eventManager.dispatchEvent(touchEvent);
        }
    }
    /**
     * @function
     * @param {Array} touches
     */
    handleTouchesEnd(touches: Array<ccTouch>) {
        var handleTouches = this.getSetOfTouchesEndOrCancel(touches);
        if (handleTouches.length > 0) {
            this._glView._convertTouchesWithScale(handleTouches);
            var touchEvent = new EventTouch(handleTouches);
            touchEvent._eventCode = TouchEventCodes.ENDED;
            eventManager.dispatchEvent(touchEvent);
        }
    }
    /**
     * @function
     * @param {Array} touches
     */
    handleTouchesCancel(touches: Array<ccTouch>) {
        var handleTouches = this.getSetOfTouchesEndOrCancel(touches);
        if (handleTouches.length > 0) {
            this._glView._convertTouchesWithScale(handleTouches);
            var touchEvent = new EventTouch(handleTouches);
            touchEvent._eventCode = TouchEventCodes.CANCELLED;
            eventManager.dispatchEvent(touchEvent);
        }
    }


    /**
     * @function
     * @param {Array} touches
     * @returns {Array}
     */
    getSetOfTouchesEndOrCancel(touches: Array<ccTouch>): Array<ccTouch> {
        var selTouch, index, touchID, handleTouches = [], locTouches = this._touches, locTouchesIntDict = this._touchesIntegerDict;
        for (var i = 0, len = touches.length; i < len; i++) {
            selTouch = touches[i];
            touchID = selTouch.getID();
            index = locTouchesIntDict.get(touchID);

            if (index == null) {
                continue;  //cc.log("if the index doesn't exist, it is an error");
            }
            if (locTouches[index]) {
                locTouches[index]._setPoint(selTouch._point);
                locTouches[index]._setPrevPoint(selTouch._prevPoint);
                handleTouches.push(locTouches[index]);
                this._removeUsedIndexBit(index);
                locTouchesIntDict.remove(touchID);
                //delete locTouchesIntDict[touchID];
            }
        }
        return handleTouches;
    }


    /**
     * @function
     * @param {HTMLElement} element
     * @return {Object}
     */
    getHTMLElementPosition(element: HTMLElement): ccPosition {
        var docElem = document.documentElement;
        var win = window;
        var box: ccPosition = null;
        if (isFunction(element.getBoundingClientRect)) {
            box = <ccPosition>element.getBoundingClientRect();
        } else {
            box = {
                left: 0,
                top: 0,
                width: parseInt(element.style.width),
                height: parseInt(element.style.height)
            };
        }
        return {
            left: box.left + win.pageXOffset - docElem.clientLeft,
            top: box.top + win.pageYOffset - docElem.clientTop,
            width: box.width,
            height: box.height
        };
    }




    /**
     * @function
     * @param {cc.Touch} touch
     * @return {cc.Touch}
     */
    getPreTouch(touch: ccTouch): ccTouch {
        var preTouch = null;
        var locPreTouchPool = this._preTouchPool;
        var id = touch.getID();
        for (var i = locPreTouchPool.length - 1; i >= 0; i--) {
            if (locPreTouchPool[i].getID() === id) {
                preTouch = locPreTouchPool[i];
                break;
            }
        }
        if (!preTouch)
            preTouch = touch;
        return preTouch;
    }


    /**
     * @function
     * @param {cc.Touch} touch
     */
    setPreTouch(touch: ccTouch) {
        var find = false;
        var locPreTouchPool = this._preTouchPool;
        var id = touch.getID();
        for (var i = locPreTouchPool.length - 1; i >= 0; i--) {
            if (locPreTouchPool[i].getID() === id) {
                locPreTouchPool[i] = touch;
                find = true;
                break;
            }
        }
        if (!find) {
            if (locPreTouchPool.length <= 50) {
                locPreTouchPool.push(touch);
            } else {
                locPreTouchPool[this._preTouchPoolPointer] = touch;
                this._preTouchPoolPointer = (this._preTouchPoolPointer + 1) % 50;
            }
        }
    }


    /**
     * @function
     * @param {Number} tx
     * @param {Number} ty
     * @param {cc.Point} pos
     * @return {cc.Touch}
     */
    getTouchByXY(tx: number, ty: number, pos: ccPosition): ccTouch {
        var locPreTouch = this._preTouchPoint;

        var location = this._glView.convertToLocationInView(tx, ty, pos);
        var touch = new ccTouch(location.x, location.y);
        touch._setPrevPoint(locPreTouch.x, locPreTouch.y);
        locPreTouch.x = location.x;
        locPreTouch.y = location.y;
        return touch;
    }

    /**
     * @function
     * @param {cc.Point} location
     * @param {cc.Point} pos
     * @param {Number} eventType
     * @returns {cc.EventMouse}
     */
    getMouseEvent(location: Point, pos: ccPosition, eventType: MouseEvents): EventMouse {
        var locPreMouse = this._prevMousePoint;
        this._glView._convertMouseToLocationInView(location, pos);
        var mouseEvent = new EventMouse(eventType);
        mouseEvent.setLocation(location.x, location.y);
        mouseEvent._setPrevCursor(locPreMouse.x, locPreMouse.y);
        locPreMouse.x = location.x;
        locPreMouse.y = location.y;
        return mouseEvent;
    }


    /**
     * @function
     * @param {Touch} event
     * @param {cc.Point} pos
     * @return {cc.Point}
     */
    getPointByEvent(event: any, pos: ccPosition): Point {
        if (event.pageX != null)  //not available in <= IE8
            return { x: event.pageX, y: event.pageY };

        pos.left -= document.body.scrollLeft;
        pos.top -= document.body.scrollTop;
        return { x: event.clientX, y: event.clientY };
    }


    /**
     * @function
     * @param {Touch} event
     * @param {cc.Point} pos
     * @returns {Array}
     */
    getTouchesByEvent(event: TouchEvent, pos: ccPosition): Array<ccTouch> {
        var touchArr = [], locView = this._glView;
        var touch_event, touch, preLocation;
        var locPreTouch = this._preTouchPoint;

        var length = event.changedTouches.length;
        for (var i = 0; i < length; i++) {
            touch_event = event.changedTouches[i];
            if (touch_event) {
                var location;
                if (BROWSER_TYPES.FIREFOX === sys.browserType)
                    location = locView.convertToLocationInView(touch_event.pageX, touch_event.pageY, pos);
                else
                    location = locView.convertToLocationInView(touch_event.clientX, touch_event.clientY, pos);
                if (touch_event.identifier != null) {
                    touch = new ccTouch(location.x, location.y, touch_event.identifier);
                    //use Touch Pool
                    preLocation = this.getPreTouch(touch).getLocation();
                    touch._setPrevPoint(preLocation.x, preLocation.y);
                    this.setPreTouch(touch);
                } else {
                    touch = new ccTouch(location.x, location.y);
                    touch._setPrevPoint(locPreTouch.x, locPreTouch.y);
                }
                locPreTouch.x = location.x;
                locPreTouch.y = location.y;
                touchArr.push(touch);
            }
        }
        return touchArr;
    }


    /**
     * @function
     * @param {HTMLElement} element
     */
    registerSystemEvent(element: HTMLElement) {
        if (this._isRegisterEvent) return;

        var locView = this._glView = game.view;
        var supportMouse = sys.capabilities.mouse;
        var supportTouches = sys.capabilities.touches;

        //HACK
        //  - At the same time to trigger the ontouch event and onmouse event
        //  - The function will execute 2 times
        //The known browser:
        //  liebiao
        //  miui
        //  WECHAT
        var prohibition = false;
        if (sys.isMobile)
            prohibition = true;

        //register touch event
        if (supportMouse) {
            window.addEventListener('mousedown', (event: MouseEvent) => {
                this._mousePressed = true;
            }, false);

            window.addEventListener('mouseup', (event: MouseEvent) => {
                if (prohibition) return;
                var savePressed = this._mousePressed;
                this._mousePressed = false;

                if (!savePressed)
                    return;

                var pos = this.getHTMLElementPosition(element);
                var location = this.getPointByEvent(event, pos);
                if (!rectContainsPoint(rect(pos.left, pos.top, pos.width, pos.height), location)) {
                    this.handleTouchesEnd([this.getTouchByXY(location.x, location.y, pos)]);

                    var mouseEvent = this.getMouseEvent(location, pos, MouseEvents.UP);
                    mouseEvent.setButton(event.button);
                    eventManager.dispatchEvent(mouseEvent);
                }
            }, false);

            //register canvas mouse event
            element.addEventListener("mousedown", (event: MouseEvent) => {
                if (prohibition) return;
                this._mousePressed = true;

                var pos = this.getHTMLElementPosition(element);
                var location = this.getPointByEvent(event, pos);

                this.handleTouchesBegin([this.getTouchByXY(location.x, location.y, pos)]);

                var mouseEvent = this.getMouseEvent(location, pos, MouseEvents.DOWN);
                mouseEvent.setButton(event.button);
                eventManager.dispatchEvent(mouseEvent);

                event.stopPropagation();
                event.preventDefault();
                element.focus();
            }, false);

            element.addEventListener("mouseup", (event: MouseEvent) => {
                if (prohibition) return;
                this._mousePressed = false;

                var pos = this.getHTMLElementPosition(element);
                var location = this.getPointByEvent(event, pos);

                this.handleTouchesEnd([this.getTouchByXY(location.x, location.y, pos)]);

                var mouseEvent = this.getMouseEvent(location, pos, MouseEvents.UP);
                mouseEvent.setButton(event.button);
                eventManager.dispatchEvent(mouseEvent);

                event.stopPropagation();
                event.preventDefault();
            }, false);

            element.addEventListener("mousemove", (event: MouseEvent) => {
                if (prohibition) return;

                var pos = this.getHTMLElementPosition(element);
                var location = this.getPointByEvent(event, pos);

                this.handleTouchesMove([this.getTouchByXY(location.x, location.y, pos)]);

                var mouseEvent = this.getMouseEvent(location, pos, MouseEvents.MOVE);
                if (this._mousePressed)
                    mouseEvent.setButton(event.button);
                else
                    mouseEvent.setButton(null);
                eventManager.dispatchEvent(mouseEvent);

                event.stopPropagation();
                event.preventDefault();
            }, false);

            element.addEventListener("mousewheel", (event: MouseEvent) => {
                var pos = this.getHTMLElementPosition(element);
                var location = this.getPointByEvent(event, pos);

                var mouseEvent = this.getMouseEvent(location, pos, MouseEvents.SCROLL);
                mouseEvent.setButton(event.button);
                mouseEvent.setScrollData(0, (<any>event).wheelDelta);
                eventManager.dispatchEvent(mouseEvent);

                event.stopPropagation();
                event.preventDefault();
            }, false);

            /* firefox fix */
            element.addEventListener("DOMMouseScroll", (event: MouseEvent) => {
                var pos = this.getHTMLElementPosition(element);
                var location = this.getPointByEvent(event, pos);

                var mouseEvent = this.getMouseEvent(location, pos, MouseEvents.SCROLL);
                mouseEvent.setButton(event.button);
                mouseEvent.setScrollData(0, event.detail * -120);
                eventManager.dispatchEvent(mouseEvent);

                event.stopPropagation();
                event.preventDefault();
            }, false);
        }

        if (window.navigator.msPointerEnabled) {
            var _pointerEventsMap = {
                "MSPointerDown": this.handleTouchesBegin,
                "MSPointerMove": this.handleTouchesMove,
                "MSPointerUp": this.handleTouchesEnd,
                "MSPointerCancel": this.handleTouchesCancel
            };

            for (var eventName in _pointerEventsMap) {
                ((_pointerEvent, _touchEvent) => {
                    element.addEventListener(_pointerEvent, (event: MouseEvent) => {
                        var pos = this.getHTMLElementPosition(element);
                        pos.left -= document.documentElement.scrollLeft;
                        pos.top -= document.documentElement.scrollTop;

                        _touchEvent.call(this, [this.getTouchByXY(event.clientX, event.clientY, pos)]);
                        event.stopPropagation();
                    }, false);
                })(eventName, (<any>_pointerEventsMap)[eventName]);
            }
        }

        if (supportTouches) {
            //register canvas touch event
            element.addEventListener("touchstart", (event: TouchEvent) => {
                if (!event.changedTouches) return;

                var pos = this.getHTMLElementPosition(element);
                pos.left -= document.body.scrollLeft;
                pos.top -= document.body.scrollTop;
                this.handleTouchesBegin(this.getTouchesByEvent(event, pos));
                event.stopPropagation();
                event.preventDefault();
                element.focus();
            }, false);

            element.addEventListener("touchmove", (event: TouchEvent) => {
                if (!event.changedTouches) return;

                var pos = this.getHTMLElementPosition(element);
                pos.left -= document.body.scrollLeft;
                pos.top -= document.body.scrollTop;
                this.handleTouchesMove(this.getTouchesByEvent(event, pos));
                event.stopPropagation();
                event.preventDefault();
            }, false);

            element.addEventListener("touchend", (event: TouchEvent) => {
                if (!event.changedTouches) return;

                var pos = this.getHTMLElementPosition(element);
                pos.left -= document.body.scrollLeft;
                pos.top -= document.body.scrollTop;
                this.handleTouchesEnd(this.getTouchesByEvent(event, pos));
                event.stopPropagation();
                event.preventDefault();
            }, false);

            element.addEventListener("touchcancel", (event: TouchEvent) => {
                if (!event.changedTouches) return;

                var pos = this.getHTMLElementPosition(element);
                pos.left -= document.body.scrollLeft;
                pos.top -= document.body.scrollTop;
                this.handleTouchesCancel(this.getTouchesByEvent(event, pos));
                event.stopPropagation();
                event.preventDefault();
            }, false);
        }

        //register keyboard event
        this._registerKeyboardEvent();

        //register Accelerometer event
        // this._registerAccelerometerEvent();

        this._isRegisterEvent = true;
    }



    /**
     * @function
     * @param {Number} dt
     */
    update(dt: number) {
        if (this._accelCurTime > this._accelInterval) {
            this._accelCurTime -= this._accelInterval;
            eventManager.dispatchEvent(new EventAcceleration(this._acceleration));
        }
        this._accelCurTime += dt;
    }


    /**
     * whether enable accelerometer event
     * @function
     * @param {Boolean} isEnable
     */
    setAccelerometerEnabled(isEnable: boolean) {
        var _t = <any>this;
        if (_t._accelEnabled === isEnable)
            return;

        _t._accelEnabled = isEnable;
        var scheduler = director.getScheduler();
        if (_t._accelEnabled) {
            _t._accelCurTime = 0;
            _t._registerAccelerometerEvent();
            scheduler.scheduleUpdate(_t);
        } else {
            _t._accelCurTime = 0;
            _t._unregisterAccelerometerEvent();
            scheduler.unscheduleUpdate(_t);
        }
    }

    /**
     * set accelerometer interval value
     * @function
     * @param {Number} interval
     */
    setAccelerometerInterval(interval: number) {
        if (this._accelInterval !== interval) {
            this._accelInterval = interval;
        }
    }


    _registerKeyboardEvent() {
        game.canvas.addEventListener("keydown", (e:KeyboardEvent)=> {
            eventManager.dispatchEvent(new EventKeyboard(e.keyCode, true));
            e.stopPropagation();
            e.preventDefault();
        }, false);
        game.canvas.addEventListener("keyup", (e: KeyboardEvent) => {
            eventManager.dispatchEvent(new EventKeyboard(e.keyCode, false));
            e.stopPropagation();
            e.preventDefault();
        }, false);
    }

    _registerAccelerometerEvent() {
        var w = window, _t = this;
        _t._acceleration = new Acceleration();
        _t._accelDeviceEvent = w.DeviceMotionEvent || w.DeviceOrientationEvent;

        //TODO fix DeviceMotionEvent bug on QQ Browser version 4.1 and below.
        if (sys.browserType === BROWSER_TYPES.MOBILE_QQ)
            _t._accelDeviceEvent = window.DeviceOrientationEvent;

        var _deviceEventType = (_t._accelDeviceEvent === w.DeviceMotionEvent) ? "devicemotion" : "deviceorientation";
        var ua = navigator.userAgent;
        if (/Android/.test(ua) || (/Adr/.test(ua) && sys.browserType === BROWSER_TYPES.UC)) {
            //_t._minus = -1;
        }

        //_t.didAccelerateCallback = _t.didAccelerate.bind(_t);
        w.addEventListener(_deviceEventType, _t.didAccelerate, false);
    }

    _unregisterAccelerometerEvent() {
        this._acceleration = null;
        var _deviceEventType = (this._accelDeviceEvent === window.DeviceMotionEvent) ? "devicemotion" : "deviceorientation";
        window.removeEventListener(_deviceEventType, this.didAccelerate, false);
    }

    didAccelerate(eventData:any) {
        var _t = this, w = window;
        if (!_t._accelEnabled)
            return;

        var mAcceleration = _t._acceleration;

        var x, y, z;

        if (_t._accelDeviceEvent === window.DeviceMotionEvent) {
            var eventAcceleration = eventData["accelerationIncludingGravity"];
            x = _t._accelMinus * eventAcceleration.x * 0.1;
            y = _t._accelMinus * eventAcceleration.y * 0.1;
            z = eventAcceleration.z * 0.1;
        } else {
            x = (eventData["gamma"] / 90) * 0.981;
            y = -(eventData["beta"] / 90) * 0.981;
            z = (eventData["alpha"] / 90) * 0.981;
        }

        mAcceleration.x = x;
        mAcceleration.y = y;
        mAcceleration.z = z;

        mAcceleration.timestamp = eventData.timeStamp || Date.now();

        var tmpX = mAcceleration.x;
        if (w.orientation === UIInterfaceOrientation.LandscapeRight) {
            mAcceleration.x = -mAcceleration.y;
            mAcceleration.y = tmpX;
        } else if (w.orientation === UIInterfaceOrientation.LandscapeLeft) {
            mAcceleration.x = mAcceleration.y;
            mAcceleration.y = -tmpX;
        } else if (w.orientation === UIInterfaceOrientation.PortraitUpsideDown) {
            mAcceleration.x = -mAcceleration.x;
            mAcceleration.y = -mAcceleration.y;
        }
    }





}

export var inputManager = new InputManager();