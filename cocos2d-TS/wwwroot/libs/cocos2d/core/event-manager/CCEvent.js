import { ccClass } from "../platform/ccClass";
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
export class Event extends ccClass {
    constructor(type) {
        super();
        this._type = 0; //  Event type
        this._isStopped = false; //< whether the event has been stopped.
        this._currentTarget = null; //< Current target
        this._type = type;
    }
    _setCurrentTarget(target) {
        this._currentTarget = target;
    }
    /**
     * Gets the event type
     * @function
     * @returns {Number}
     */
    getType() {
        return this._type;
    }
    /**
     * Stops propagation for current event
     * @function
     */
    stopPropagation() {
        this._isStopped = true;
    }
    /**
     * Checks whether the event has been stopped
     * @function
     * @returns {boolean}
     */
    isStopped() {
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
    getCurrentTarget() {
        return this._currentTarget;
    }
}
export var EventTypes;
(function (EventTypes) {
    //event type
    /**
     * The type code of Touch event.
     * @constant
     * @type {number}
     */
    EventTypes[EventTypes["TOUCH"] = 0] = "TOUCH";
    /**
     * The type code of Keyboard event.
     * @constant
     * @type {number}
     */
    EventTypes[EventTypes["KEYBOARD"] = 1] = "KEYBOARD";
    /**
     * The type code of Acceleration event.
     * @constant
     * @type {number}
     */
    EventTypes[EventTypes["ACCELERATION"] = 2] = "ACCELERATION";
    /**
     * The type code of Mouse event.
     * @constant
     * @type {number}
     */
    EventTypes[EventTypes["MOUSE"] = 3] = "MOUSE";
    /**
     * The type code of UI focus event.
     * @constant
     * @type {number}
     */
    EventTypes[EventTypes["FOCUS"] = 4] = "FOCUS";
    /**
     * The type code of Custom event.
     * @constant
     * @type {number}
     */
    EventTypes[EventTypes["CUSTOM"] = 6] = "CUSTOM";
})(EventTypes || (EventTypes = {}));
export class EventCustom extends Event {
    constructor(eventName) {
        super(EventTypes.CUSTOM);
        this._eventName = null;
        this._userData = null;
        this._eventName = eventName;
    }
    /**
     * Sets user data
     * @param {*} data
     */
    setUserData(data) {
        this._userData = data;
    }
    /**
     * Gets user data
     * @returns {*}
     */
    getUserData() {
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
export var MouseEvents;
(function (MouseEvents) {
    //Different types of MouseEvent
    /**
     * The none event code of  mouse event.
     * @constant
     * @type {number}
     */
    MouseEvents[MouseEvents["NONE"] = 0] = "NONE";
    /**
     * The event type code of mouse down event.
     * @constant
     * @type {number}
     */
    MouseEvents[MouseEvents["DOWN"] = 1] = "DOWN";
    /**
     * The event type code of mouse up event.
     * @constant
     * @type {number}
     */
    MouseEvents[MouseEvents["UP"] = 2] = "UP";
    /**
     * The event type code of mouse move event.
     * @constant
     * @type {number}
     */
    MouseEvents[MouseEvents["MOVE"] = 3] = "MOVE";
    /**
     * The event type code of mouse scroll event.
     * @constant
     * @type {number}
     */
    MouseEvents[MouseEvents["SCROLL"] = 4] = "SCROLL";
})(MouseEvents || (MouseEvents = {}));
export var MouseButton;
(function (MouseButton) {
    /**
     * The tag of Mouse left button
     * @constant
     * @type {Number}
     */
    MouseButton[MouseButton["BUTTON_LEFT"] = 0] = "BUTTON_LEFT";
    /**
     * The tag of Mouse right button  (The right button number is 2 on browser)
     * @constant
     * @type {Number}
     */
    MouseButton[MouseButton["BUTTON_RIGHT"] = 2] = "BUTTON_RIGHT";
    /**
     * The tag of Mouse middle button  (The right button number is 1 on browser)
     * @constant
     * @type {Number}
     */
    MouseButton[MouseButton["BUTTON_MIDDLE"] = 1] = "BUTTON_MIDDLE";
    /**
     * The tag of Mouse button 4
     * @constant
     * @type {Number}
     */
    MouseButton[MouseButton["BUTTON_4"] = 3] = "BUTTON_4";
    /**
     * The tag of Mouse button 5
     * @constant
     * @type {Number}
     */
    MouseButton[MouseButton["BUTTON_5"] = 4] = "BUTTON_5";
    /**
     * The tag of Mouse button 6
     * @constant
     * @type {Number}
     */
    MouseButton[MouseButton["BUTTON_6"] = 5] = "BUTTON_6";
    /**
     * The tag of Mouse button 7
     * @constant
     * @type {Number}
     */
    MouseButton[MouseButton["BUTTON_7"] = 6] = "BUTTON_7";
    /**
     * The tag of Mouse button 8
     * @constant
     * @type {Number}
     */
    MouseButton[MouseButton["BUTTON_8"] = 7] = "BUTTON_8";
})(MouseButton || (MouseButton = {}));
export class EventMouse extends Event {
    constructor(eventType) {
        super(EventTypes.MOUSE);
        this._eventType = 0;
        this._button = 0;
        this._x = 0;
        this._y = 0;
        this._prevX = 0;
        this._prevY = 0;
        this._scrollX = 0;
        this._scrollY = 0;
        this._eventType = eventType;
    }
    /**
     * Sets scroll data
     * @param {number} scrollX
     * @param {number} scrollY
     */
    setScrollData(scrollX, scrollY) {
        this._scrollX = scrollX;
        this._scrollY = scrollY;
    }
    /**
     * Returns the x axis scroll value
     * @returns {number}
     */
    getScrollX() {
        return this._scrollX;
    }
    /**
     * Returns the y axis scroll value
     * @returns {number}
     */
    getScrollY() {
        return this._scrollY;
    }
    /**
     * Sets cursor location
     * @param {number} x
     * @param {number} y
     */
    setLocation(x, y) {
        this._x = x;
        this._y = y;
    }
    /**
     * Returns cursor location
     * @return {cc.Point} location
     */
    getLocation() {
        return { x: this._x, y: this._y };
    }
    /**
     * Returns the current cursor location in screen coordinates
     * @return {cc.Point}
     */
    getLocationInView() {
        return { x: this._x, y: game._view._designResolutionSize.height - this._y };
    }
    _setPrevCursor(x, y) {
        this._prevX = x;
        this._prevY = y;
    }
    /**
     * Returns the delta distance from the previous location to current location
     * @return {cc.Point}
     */
    getDelta() {
        return { x: this._x - this._prevX, y: this._y - this._prevY };
    }
    /**
     * Returns the X axis delta distance from the previous location to current location
     * @return {Number}
     */
    getDeltaX() {
        return this._x - this._prevX;
    }
    /**
     * Returns the Y axis delta distance from the previous location to current location
     * @return {Number}
     */
    getDeltaY() {
        return this._y - this._prevY;
    }
    /**
     * Sets mouse button
     * @param {number} button
     */
    setButton(button) {
        this._button = button;
    }
    /**
     * Returns mouse button
     * @returns {number}
     */
    getButton() {
        return this._button;
    }
    /**
     * Returns location X axis data
     * @returns {number}
     */
    getLocationX() {
        return this._x;
    }
    /**
     * Returns location Y axis data
     * @returns {number}
     */
    getLocationY() {
        return this._y;
    }
}
export var TouchEventCodes;
(function (TouchEventCodes) {
    TouchEventCodes[TouchEventCodes["BEGAN"] = 0] = "BEGAN";
    TouchEventCodes[TouchEventCodes["MOVED"] = 1] = "MOVED";
    TouchEventCodes[TouchEventCodes["ENDED"] = 2] = "ENDED";
    TouchEventCodes[TouchEventCodes["CANCELLED"] = 3] = "CANCELLED";
})(TouchEventCodes || (TouchEventCodes = {}));
export class EventTouch extends Event {
    constructor(touches = null) {
        super(EventTypes.TOUCH);
        this._eventCode = 0;
        this._touches = null;
        this._touches = touches || new Array();
    }
    /**
     * Returns event code
     * @returns {number}
     */
    getEventCode() {
        return this._eventCode;
    }
    /**
         * Returns touches of event
         * @returns {Array}
         */
    getTouches() {
        return this._touches;
    }
    _setEventCode(eventCode) {
        this._eventCode = eventCode;
    }
    _setTouches(touches) {
        this._touches = touches;
    }
}
EventTouch.MAX_TOUCHES = 5;
export class EventFocus extends Event {
    constructor(widgetLoseFocus, widgetGetFocus) {
        super(EventTypes.FOCUS);
        this._widgetGetFocus = null;
        this._widgetLoseFocus = null;
        this._widgetGetFocus = widgetGetFocus;
        this._widgetLoseFocus = widgetLoseFocus;
    }
}
//# sourceMappingURL=CCEvent.js.map