import { ccClass } from "../platform/ccClass";
import { Point } from "../cocoa/index";
import { ccNode } from "../base-nodes/CCNode";
import { game } from "../../../startup/CCGame";
import { ccTouch } from "./index";

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


export class Event extends ccClass {

    public _type: EventTypes = 0;                                   //  Event type
    public _isStopped: boolean = false;                         //< whether the event has been stopped.
    public _currentTarget: ccNode = null;                       //< Current target


    constructor(type: EventTypes) {
        super();
        this._type = type;
    }
    public _setCurrentTarget(target: ccNode) {
        this._currentTarget = target;
    }


    /**
     * Gets the event type
     * @function
     * @returns {Number}
     */
    getType(): EventTypes {
        return this._type;
    }
    /**
     * Stops propagation for current event
     * @function
     */
    stopPropagation(): void {
        this._isStopped = true;
    }
    /**
     * Checks whether the event has been stopped
     * @function
     * @returns {boolean}
     */
    isStopped(): boolean {
        return this._isStopped;
    }
    /**
     * <p>
     *     Gets current target of the event                                                            <br/>
     *     note: It only be available when the event listener is associated with node.                <br/>
     *          It returns 0 when the listener is associated with fixed priority.
     * </p>
     * @function
     * @returns {cc.Node}  The target with which the event associates.
     */
    getCurrentTarget(): ccNode {
        return this._currentTarget;
    }

}

export enum EventTypes {

    //event type
    /**
     * The type code of Touch event.
     * @constant
     * @type {number}
     */
    TOUCH = 0,
    /**
     * The type code of Keyboard event.
     * @constant
     * @type {number}
     */
    KEYBOARD = 1,
    /**
     * The type code of Acceleration event.
     * @constant
     * @type {number}
     */
    ACCELERATION = 2,
    /**
     * The type code of Mouse event.
     * @constant
     * @type {number}
     */
    MOUSE = 3,
    /**
     * The type code of UI focus event.
     * @constant
     * @type {number}
     */
    FOCUS = 4,
    /**
     * The type code of Custom event.
     * @constant
     * @type {number}
     */
    CUSTOM = 6

}



export class EventCustom extends Event {
    public _eventName: string = null;
    public _userData: any = null;

    constructor(eventName: string) {
        super(EventTypes.CUSTOM);

        this._eventName = eventName;

    }
    /**
     * Sets user data
     * @param {*} data
     */
    setUserData(data: any) {
        this._userData = data;
    }
    /**
     * Gets user data
     * @returns {*}
     */
    getUserData(): any {
        return this._userData;
    }
    /**
         * Gets event name
         * @returns {String}
         */
    getEventName() {
        return this._eventName;
    }

}

export enum MouseEvents {

    //Different types of MouseEvent
    /**
     * The none event code of  mouse event.
     * @constant
     * @type {number}
     */
    NONE = 0,
    /**
     * The event type code of mouse down event.
     * @constant
     * @type {number}
     */
    DOWN = 1,
    /**
     * The event type code of mouse up event.
     * @constant
     * @type {number}
     */
    UP = 2,
    /**
     * The event type code of mouse move event.
     * @constant
     * @type {number}
     */
    MOVE = 3,
    /**
     * The event type code of mouse scroll event.
     * @constant
     * @type {number}
     */
    SCROLL = 4

}

export enum MouseButton {

    /**
     * The tag of Mouse left button
     * @constant
     * @type {Number}
     */
    BUTTON_LEFT = 0,

    /**
     * The tag of Mouse right button  (The right button number is 2 on browser)
     * @constant
     * @type {Number}
     */
    BUTTON_RIGHT = 2,

    /**
     * The tag of Mouse middle button  (The right button number is 1 on browser)
     * @constant
     * @type {Number}
     */
    BUTTON_MIDDLE = 1,

    /**
     * The tag of Mouse button 4
     * @constant
     * @type {Number}
     */
    BUTTON_4 = 3,

    /**
     * The tag of Mouse button 5
     * @constant
     * @type {Number}
     */
    BUTTON_5 = 4,

    /**
     * The tag of Mouse button 6
     * @constant
     * @type {Number}
     */
    BUTTON_6 = 5,

    /**
     * The tag of Mouse button 7
     * @constant
     * @type {Number}
     */
    BUTTON_7 = 6,

    /**
     * The tag of Mouse button 8
     * @constant
     * @type {Number}
     */
    BUTTON_8 = 7

}


export class EventMouse extends Event {
    public _eventType: MouseEvents = 0;
    public _button: MouseButton = 0;
    public _x: number = 0;
    public _y: number = 0;
    public _prevX: number = 0;
    public _prevY: number = 0;
    public _scrollX: number = 0;
    public _scrollY: number = 0;

    constructor(eventType: MouseEvents) {
        super(EventTypes.MOUSE);

        this._eventType = eventType;
    }

    /**
     * Sets scroll data
     * @param {number} scrollX
     * @param {number} scrollY
     */
    setScrollData(scrollX: number, scrollY: number) {
        this._scrollX = scrollX;
        this._scrollY = scrollY;
    }

    /**
     * Returns the x axis scroll value
     * @returns {number}
     */
    getScrollX(): number {
        return this._scrollX;
    }

    /**
     * Returns the y axis scroll value
     * @returns {number}
     */
    getScrollY(): number {
        return this._scrollY;
    }
    /**
     * Sets cursor location
     * @param {number} x
     * @param {number} y
     */
    setLocation(x: number, y: number) {
        this._x = x;
        this._y = y;
    }
    /**
	 * Returns cursor location
	 * @return {cc.Point} location
	 */
    getLocation(): Point {
        return { x: this._x, y: this._y };
    }
    /**
	 * Returns the current cursor location in screen coordinates
	 * @return {cc.Point}
	 */
    getLocationInView(): Point {
        return { x: this._x, y: game.view._designResolutionSize.height - this._y };
    }
    public _setPrevCursor(x: number, y: number) {
        this._prevX = x;
        this._prevY = y;
    }
    /**
     * Returns the delta distance from the previous location to current location
     * @return {cc.Point}
     */
    getDelta(): Point {
        return { x: this._x - this._prevX, y: this._y - this._prevY };
    }

    /**
     * Returns the X axis delta distance from the previous location to current location
     * @return {Number}
     */
    getDeltaX(): number {
        return this._x - this._prevX;
    }

    /**
     * Returns the Y axis delta distance from the previous location to current location
     * @return {Number}
     */
    getDeltaY(): number {
        return this._y - this._prevY;
    }

    /**
     * Sets mouse button
     * @param {number} button
     */
    setButton(button: MouseButton) {
        this._button = button;
    }

    /**
     * Returns mouse button
     * @returns {number}
     */
    getButton(): MouseButton {
        return this._button;
    }

    /**
     * Returns location X axis data
     * @returns {number}
     */
    getLocationX(): number {
        return this._x;
    }

    /**
     * Returns location Y axis data
     * @returns {number}
     */
    getLocationY(): number {
        return this._y;
    }

}

export enum TouchEventCodes {
    BEGAN = 0,
    MOVED = 1,
    ENDED = 2,
    CANCELLED = 3
}

export class EventTouch extends Event {

    static MAX_TOUCHES = 5;


    public _eventCode:TouchEventCodes = 0;
    public _touches: Array<ccTouch> = null;

    constructor(touches: Array<ccTouch> = null) {
        super(EventTypes.TOUCH);

        this._touches = touches || new Array<ccTouch>();
    }

    /**
     * Returns event code
     * @returns {number}
     */
    getEventCode():TouchEventCodes {
        return this._eventCode;
    }
/**
     * Returns touches of event
     * @returns {Array}
     */
    getTouches(): Array<ccTouch> {
        return this._touches;
    }
    public _setEventCode(eventCode:TouchEventCodes) {
        this._eventCode = eventCode;
    }

    public _setTouches(touches: Array<ccTouch>) {
        this._touches = touches;
    }



}


export class EventFocus extends Event {
    public _widgetGetFocus:any = null;
    public _widgetLoseFocus:any = null;

    constructor(widgetLoseFocus:any, widgetGetFocus:any){
        super(EventTypes.FOCUS)
        this._widgetGetFocus = widgetGetFocus;
        this._widgetLoseFocus = widgetLoseFocus;
    }

}
