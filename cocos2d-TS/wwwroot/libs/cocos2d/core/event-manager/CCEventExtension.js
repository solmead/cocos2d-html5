import { Event, EventTypes } from "./CCEvent";
import { EventListener, EventListenerTypes } from "./CCEventListener";
import { assert, _LogInfos, log } from "../../../startup/CCDebugger";
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
export class EventAcceleration extends Event {
    constructor(acc) {
        super(EventTypes.ACCELERATION);
        this._acc = null;
        this._acc = acc;
    }
}
export class EventKeyboard extends Event {
    constructor(keyCode, isPressed) {
        super(EventTypes.KEYBOARD);
        this._keyCode = 0;
        this._isPressed = false;
        this._keyCode = keyCode;
        this._isPressed = isPressed;
    }
}
export class _EventListenerAcceleration extends EventListener {
    constructor(callback) {
        super(EventListenerTypes.ACCELERATION, _EventListenerAcceleration.LISTENER_ID, (event) => this._onAccelerationEvent(event));
        this._onAccelerationEvent = null;
        this._onAccelerationEvent = callback;
    }
    static create(callback) {
        return new _EventListenerAcceleration(callback);
    }
    checkAvailable() {
        assert(!!this._onAccelerationEvent, _LogInfos._EventListenerAcceleration_checkAvailable);
        return true;
    }
    clone() {
        return new _EventListenerAcceleration(this._onAccelerationEvent);
    }
}
_EventListenerAcceleration.LISTENER_ID = "__cc_acceleration";
export class _EventListenerKeyboard extends EventListener {
    constructor() {
        super(EventListenerTypes.KEYBOARD, _EventListenerKeyboard.LISTENER_ID, (event) => this._callback(event));
        this.onKeyPressed = null;
        this.onKeyReleased = null;
    }
    static create() {
        return new _EventListenerKeyboard();
    }
    _callback(event) {
        if (event._isPressed) {
            if (this.onKeyPressed)
                this.onKeyPressed(event._keyCode, event);
        }
        else {
            if (this.onKeyReleased)
                this.onKeyReleased(event._keyCode, event);
        }
    }
    clone() {
        var eventListener = new _EventListenerKeyboard();
        eventListener.onKeyPressed = this.onKeyPressed;
        eventListener.onKeyReleased = this.onKeyReleased;
        return eventListener;
    }
    checkAvailable() {
        if (this.onKeyPressed === null && this.onKeyReleased === null) {
            log(_LogInfos._EventListenerKeyboard_checkAvailable);
            return false;
        }
        return true;
    }
}
_EventListenerKeyboard.LISTENER_ID = "__cc_keyboard";
//# sourceMappingURL=CCEventExtension.js.map