import { Event, EventTypes } from "./CCEvent";
import { EventListener, EventListenerTypes } from "./CCEventListener";
import { assert, _LogInfos, log } from "../../../startup/CCDebugger";
import { Acceleration } from "../platform/CCTypes";
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

     public _acc: Acceleration = null;

     constructor(acc: Acceleration) {
        super(EventTypes.ACCELERATION);
        this._acc = acc;
    }


 }

 export class EventKeyboard extends Event {
    public _keyCode: number = 0;
    public _isPressed:boolean = false;

    constructor(keyCode:number, isPressed:boolean) {
        super(EventTypes.KEYBOARD);
        this._keyCode = keyCode;
        this._isPressed = isPressed;
    }

 }

 export class _EventListenerAcceleration extends EventListener {
    public static LISTENER_ID = "__cc_acceleration";

    public static create(callback:(event:EventAcceleration)=>void):_EventListenerAcceleration {
        return new _EventListenerAcceleration(callback);
    }

    _onAccelerationEvent: (event:EventAcceleration)=>void = null;

    constructor(callback:(event:EventAcceleration)=>void) {
        super(EventListenerTypes.ACCELERATION, _EventListenerAcceleration.LISTENER_ID, (event)=>this._onAccelerationEvent(<EventAcceleration><any>event));

        this._onAccelerationEvent = callback;
    }
    checkAvailable():boolean {

        assert(!!this._onAccelerationEvent, _LogInfos._EventListenerAcceleration_checkAvailable);

        return true;
    }

    clone():_EventListenerAcceleration {
        return new _EventListenerAcceleration(this._onAccelerationEvent);
    }

 }

 export class _EventListenerKeyboard extends EventListener {
    public static LISTENER_ID = "__cc_keyboard";

    public static create():_EventListenerKeyboard {
        return new _EventListenerKeyboard();
    }

    onKeyPressed: (keycode:number, event:EventKeyboard)=>void = null;
    onKeyReleased: (keycode:number, event:EventKeyboard)=>void = null;

    constructor() {
        super(EventListenerTypes.KEYBOARD, _EventListenerKeyboard.LISTENER_ID, (event)=>this._callback(<any>event))
    }

    protected _callback(event:EventKeyboard):void {
        if (event._isPressed) {
            if (this.onKeyPressed)
            this.onKeyPressed(event._keyCode, event);
        } else {
            if (this.onKeyReleased)
            this.onKeyReleased(event._keyCode, event);
        }
    }
    clone():_EventListenerKeyboard {
        var eventListener = new _EventListenerKeyboard();
        eventListener.onKeyPressed = this.onKeyPressed;
        eventListener.onKeyReleased = this.onKeyReleased;
        return eventListener;
    }

    checkAvailable():boolean {
        if (this.onKeyPressed === null && this.onKeyReleased === null) {
            log(_LogInfos._EventListenerKeyboard_checkAvailable);
            return false;
        }
        return true;
    }

 }

