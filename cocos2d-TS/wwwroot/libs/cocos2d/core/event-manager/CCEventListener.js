import { ccClass } from "../platform/ccClass";
import { MouseEvents } from "./CCEvent";
import { log, _LogInfos } from "../../../startup/CCDebugger";
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
 * <p>
 *     The base class of event listener.                                                                        <br/>
 *     If you need custom listener which with different callback, you need to inherit this class.               <br/>
 *     For instance, you could refer to EventListenerAcceleration, EventListenerKeyboard,                       <br/>
 *      EventListenerTouchOneByOne, EventListenerCustom.
 * </p>
 * @class
 * @extends cc.Class
 */
export class EventListener extends ccClass {
    constructor(type, listenerID, callback) {
        super();
        /**
         * Create a EventListener object by json object
         * @function
         * @static
         * @param {object} argObj a json object
         * @returns {cc.EventListener}
         * todo: It should be the direct use new
         * @example
         * cc.EventListener.create({
         *       event: cc.EventListener.TOUCH_ONE_BY_ONE,
         *       swallowTouches: true,
         *       onTouchBegan: function (touch, event) {
         *           //do something
         *           return true;
         *       }
         *    });
         */
        //static create(...args:Array<any>):EventListener {
        //    var argObj:any = args[0];
        //    assert(argObj&&argObj.event, _LogInfos.EventListener_create);
        //    var listenerType = argObj.event;
        //    delete argObj.event;
        //    var listener = null;
        //    if(listenerType === EventListenerTypes.TOUCH_ONE_BY_ONE)
        //        listener = new _EventListenerTouchOneByOne();
        //    else if(listenerType === EventListenerTypes.TOUCH_ALL_AT_ONCE)
        //        listener = new _EventListenerTouchAllAtOnce();
        //    else if(listenerType === EventListenerTypes.MOUSE)
        //        listener = new _EventListenerMouse();
        //    else if(listenerType === EventListenerTypes.CUSTOM){
        //        listener = new _EventListenerCustom(argObj.eventName, argObj.callback);
        //        delete argObj.eventName;
        //        delete argObj.callback;
        //    } else if(listenerType === EventListenerTypes.KEYBOARD)
        //        listener = new _EventListenerKeyboard();
        //    else if(listenerType === EventListenerTypes.ACCELERATION){
        //        listener = new _EventListenerAcceleration(argObj.callback);
        //        delete argObj.callback;
        //    } else if(listenerType === EventListenerTypes.FOCUS)
        //        listener = new _EventListenerFocus();
        //    for(var key in argObj) {
        //        listener[key] = argObj[key];
        //    }
        //    return listener;
        //}
        this._onEvent = null; // Event callback function
        this._type = 0; // Event listener type
        this._listenerID = null; // Event listener ID
        this._registered = false; // Whether the listener has been added to dispatcher.
        this._fixedPriority = 0; // The higher the number, the higher the priority, 0 is for scene graph base priority.
        this._node = null; // scene graph based priority
        this._paused = true; // Whether the listener is paused
        this._isEnabled = true; // Whether the listener is enabled
        this._onEvent = callback;
        this._type = type || 0;
        this._listenerID = listenerID || "";
    }
    /**
         * <p>
         *     Sets paused state for the listener
         *     The paused state is only used for scene graph priority listeners.
         *     `EventDispatcher::resumeAllEventListenersForTarget(node)` will set the paused state to `true`,
         *     while `EventDispatcher::pauseAllEventListenersForTarget(node)` will set it to `false`.
         *     @note 1) Fixed priority listeners will never get paused. If a fixed priority doesn't want to receive events,
         *              call `setEnabled(false)` instead.
         *            2) In `Node`'s onEnter and onExit, the `paused state` of the listeners which associated with that node will be automatically updated.
         * </p>
         * @param {boolean} paused
         * @private
         */
    _setPaused(paused) {
        this._paused = paused;
    }
    /**
         * Checks whether the listener is paused
         * @returns {boolean}
         * @private
         */
    _isPaused() {
        return this._paused;
    }
    /**
     * Marks the listener was registered by EventDispatcher
     * @param {boolean} registered
     * @private
     */
    _setRegistered(registered) {
        this._registered = registered;
    }
    /**
     * Checks whether the listener was registered by EventDispatcher
     * @returns {boolean}
     * @private
     */
    _isRegistered() {
        return this._registered;
    }
    /**
     * Gets the type of this listener
     * @note It's different from `EventType`, e.g. TouchEvent has two kinds of event listeners - EventListenerOneByOne, EventListenerAllAtOnce
     * @returns {number}
     * @private
     */
    _getType() {
        return this._type;
    }
    /**
     *  Gets the listener ID of this listener
     *  When event is being dispatched, listener ID is used as key for searching listeners according to event type.
     * @returns {string}
     * @private
     */
    _getListenerID() {
        return this._listenerID;
    }
    /**
     * Sets the fixed priority for this listener
     *  @note This method is only used for `fixed priority listeners`, it needs to access a non-zero value. 0 is reserved for scene graph priority listeners
     * @param {number} fixedPriority
     * @private
     */
    _setFixedPriority(fixedPriority) {
        this._fixedPriority = fixedPriority;
    }
    /**
     * Gets the fixed priority of this listener
     * @returns {number} 0 if it's a scene graph priority listener, non-zero for fixed priority listener
     * @private
     */
    _getFixedPriority() {
        return this._fixedPriority;
    }
    /**
     * Sets scene graph priority for this listener
     * @param {cc.Node} node
     * @private
     */
    _setSceneGraphPriority(node) {
        this._node = node;
    }
    /**
     * Gets scene graph priority of this listener
     * @returns {cc.Node} if it's a fixed priority listener, non-null for scene graph priority listener
     * @private
     */
    _getSceneGraphPriority() {
        return this._node;
    }
    /**
     * Checks whether the listener is available.
     * @returns {boolean}
     */
    checkAvailable() {
        return this._onEvent !== null;
    }
    /**
     * Clones the listener, its subclasses have to override this method.
     * @returns {cc.EventListener}
     */
    clone() {
        return null;
    }
    /**
     *  Enables or disables the listener
     *  @note Only listeners with `enabled` state will be able to receive events.
     *          When an listener was initialized, it's enabled by default.
     *          An event listener can receive events when it is enabled and is not paused.
     *          paused state is always false when it is a fixed priority listener.
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
        this._isEnabled = enabled;
    }
    /**
     * Checks whether the listener is enabled
     * @returns {boolean}
     */
    isEnabled() {
        return this._isEnabled;
    }
    /**
     * <p>Currently JavaScript Bindings (JSB), in some cases, needs to use retain and release. This is a bug in JSB,
     * and the ugly workaround is to use retain/release. So, these 2 methods were added to be compatible with JSB.
     * This is a hack, and should be removed once JSB fixes the retain/release bug<br/>
     * You will need to retain an object if you created a listener and haven't added it any target node during the same frame.<br/>
     * Otherwise, JSB's native autorelease pool will consider this object a useless one and release it directly,<br/>
     * when you want to use it later, a "Invalid Native Object" error will be raised.<br/>
     * The retain function can increase a reference count for the native object to avoid it being released,<br/>
     * you need to manually invoke release function when you think this object is no longer needed, otherwise, there will be memory learks.<br/>
     * retain and release function call should be paired in developer's game code.</p>
     * @function
     * @see cc.EventListener#release
     */
    retain() {
    }
    /**
     * <p>Currently JavaScript Bindings (JSB), in some cases, needs to use retain and release. This is a bug in JSB,
     * and the ugly workaround is to use retain/release. So, these 2 methods were added to be compatible with JSB.
     * This is a hack, and should be removed once JSB fixes the retain/release bug<br/>
     * You will need to retain an object if you created a listener and haven't added it any target node during the same frame.<br/>
     * Otherwise, JSB's native autorelease pool will consider this object a useless one and release it directly,<br/>
     * when you want to use it later, a "Invalid Native Object" error will be raised.<br/>
     * The retain function can increase a reference count for the native object to avoid it being released,<br/>
     * you need to manually invoke release function when you think this object is no longer needed, otherwise, there will be memory learks.<br/>
     * retain and release function call should be paired in developer's game code.</p>
     * @function
     * @see cc.EventListener#retain
     */
    release() {
    }
}
export var EventListenerTypes;
(function (EventListenerTypes) {
    // event listener type
    /**
     * The type code of unknown event listener.
     * @constant
     * @type {number}
     */
    EventListenerTypes[EventListenerTypes["UNKNOWN"] = 0] = "UNKNOWN";
    /**
     * The type code of one by one touch event listener.
     * @constant
     * @type {number}
     */
    EventListenerTypes[EventListenerTypes["TOUCH_ONE_BY_ONE"] = 1] = "TOUCH_ONE_BY_ONE";
    /**
     * The type code of all at once touch event listener.
     * @constant
     * @type {number}
     */
    EventListenerTypes[EventListenerTypes["TOUCH_ALL_AT_ONCE"] = 2] = "TOUCH_ALL_AT_ONCE";
    /**
     * The type code of keyboard event listener.
     * @constant
     * @type {number}
     */
    EventListenerTypes[EventListenerTypes["KEYBOARD"] = 3] = "KEYBOARD";
    /**
     * The type code of mouse event listener.
     * @constant
     * @type {number}
     */
    EventListenerTypes[EventListenerTypes["MOUSE"] = 4] = "MOUSE";
    /**
     * The type code of acceleration event listener.
     * @constant
     * @type {number}
     */
    EventListenerTypes[EventListenerTypes["ACCELERATION"] = 6] = "ACCELERATION";
    /**
     * The type code of Focus change event listener.
     * @constant
     * @type {number}
     */
    EventListenerTypes[EventListenerTypes["FOCUS"] = 7] = "FOCUS";
    /**
     * The type code of custom event listener.
     * @constant
     * @type {number}
     */
    EventListenerTypes[EventListenerTypes["CUSTOM"] = 8] = "CUSTOM";
})(EventListenerTypes || (EventListenerTypes = {}));
export class _EventListenerCustom extends EventListener {
    constructor(listenerId, callback, target = null) {
        super(EventListenerTypes.CUSTOM, listenerId, (event) => this._callback(event));
        this._onCustomEvent = null;
        this._target = null;
        this._onCustomEvent = callback;
        this._target = target;
    }
    static create(eventName, callback) {
        return new _EventListenerCustom(eventName, callback);
    }
    _callback(event) {
        if (this._onCustomEvent !== null)
            this._onCustomEvent.call(this._target, event);
    }
    checkAvailable() {
        return super.checkAvailable() && this._onCustomEvent !== null;
    }
    clone() {
        return new _EventListenerCustom(this._listenerID, this._onCustomEvent);
    }
}
export class _EventListenerMouse extends EventListener {
    constructor() {
        super(EventListenerTypes.MOUSE, _EventListenerMouse.LISTENER_ID, (event) => this._callback(event));
        this.onMouseDown = null;
        this.onMouseUp = null;
        this.onMouseMove = null;
        this.onMouseScroll = null;
    }
    static create() {
        return new _EventListenerMouse();
    }
    _callback(event) {
        var eventType = MouseEvents;
        switch (event._eventType) {
            case eventType.DOWN:
                if (this.onMouseDown)
                    this.onMouseDown(event);
                break;
            case eventType.UP:
                if (this.onMouseUp)
                    this.onMouseUp(event);
                break;
            case eventType.MOVE:
                if (this.onMouseMove)
                    this.onMouseMove(event);
                break;
            case eventType.SCROLL:
                if (this.onMouseScroll)
                    this.onMouseScroll(event);
                break;
            default:
                break;
        }
    }
    clone() {
        var eventListener = new _EventListenerMouse();
        eventListener.onMouseDown = this.onMouseDown;
        eventListener.onMouseUp = this.onMouseUp;
        eventListener.onMouseMove = this.onMouseMove;
        eventListener.onMouseScroll = this.onMouseScroll;
        return eventListener;
    }
    checkAvailable() {
        return true;
    }
}
_EventListenerMouse.LISTENER_ID = "__cc_mouse";
export class _EventListenerTouchOneByOne extends EventListener {
    constructor() {
        super(EventListenerTypes.TOUCH_ONE_BY_ONE, _EventListenerTouchOneByOne.LISTENER_ID, null);
        this._claimedTouches = null;
        this.swallowTouches = false;
        this.onTouchBegan = null;
        this.onTouchMoved = null;
        this.onTouchEnded = null;
        this.onTouchCancelled = null;
    }
    static create() {
        return new _EventListenerTouchOneByOne();
    }
    setSwallowTouches(needSwallow) {
        this.swallowTouches = needSwallow;
    }
    isSwallowTouches() {
        return this.swallowTouches;
    }
    clone() {
        var eventListener = new _EventListenerTouchOneByOne();
        eventListener.onTouchBegan = this.onTouchBegan;
        eventListener.onTouchMoved = this.onTouchMoved;
        eventListener.onTouchEnded = this.onTouchEnded;
        eventListener.onTouchCancelled = this.onTouchCancelled;
        eventListener.swallowTouches = this.swallowTouches;
        return eventListener;
    }
    checkAvailable() {
        if (!this.onTouchBegan) {
            log(_LogInfos._EventListenerTouchOneByOne_checkAvailable);
            return false;
        }
        return true;
    }
}
_EventListenerTouchOneByOne.LISTENER_ID = "__cc_touch_one_by_one";
export class _EventListenerTouchAllAtOnce extends EventListener {
    constructor() {
        super(EventListenerTypes.TOUCH_ALL_AT_ONCE, _EventListenerTouchAllAtOnce.LISTENER_ID, null);
        this.onTouchesBegan = null;
        this.onTouchesMoved = null;
        this.onTouchesEnded = null;
        this.onTouchesCancelled = null;
    }
    static create() {
        return new _EventListenerTouchAllAtOnce();
    }
    clone() {
        var eventListener = new _EventListenerTouchAllAtOnce();
        eventListener.onTouchesBegan = this.onTouchesBegan;
        eventListener.onTouchesMoved = this.onTouchesMoved;
        eventListener.onTouchesEnded = this.onTouchesEnded;
        eventListener.onTouchesCancelled = this.onTouchesCancelled;
        return eventListener;
    }
    checkAvailable() {
        if (this.onTouchesBegan === null && this.onTouchesMoved === null
            && this.onTouchesEnded === null && this.onTouchesCancelled === null) {
            log(_LogInfos._EventListenerTouchAllAtOnce_checkAvailable);
            return false;
        }
        return true;
    }
}
_EventListenerTouchAllAtOnce.LISTENER_ID = "__cc_touch_all_at_once";
export class _EventListenerFocus extends EventListener {
    constructor() {
        super(EventListenerTypes.FOCUS, _EventListenerFocus.LISTENER_ID, (event) => this._callback(event));
        this.onFocusChanged = null;
    }
    static create() {
        return new _EventListenerFocus();
    }
    clone() {
        var listener = new _EventListenerFocus();
        listener.onFocusChanged = this.onFocusChanged;
        return listener;
    }
    checkAvailable() {
        if (!this.onFocusChanged) {
            log("Invalid EventListenerFocus!");
            return false;
        }
        return true;
    }
    _callback(event) {
        if (this.onFocusChanged) {
            this.onFocusChanged(event._widgetLoseFocus, event._widgetGetFocus);
        }
    }
}
_EventListenerFocus.LISTENER_ID = "__cc_focus_event";
//# sourceMappingURL=CCEventListener.js.map