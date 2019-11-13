﻿/****************************************************************************
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2015 Chukong Technologies Inc.

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

// The event helper
export interface iEventHandler {
    addEventListener(type: string, listener: () => void, target?: any): void;
    hasEventListener(type: string, listener: () => void, target?: any): boolean;
    removeEventListener(type: string, listener: () => void, target?: any): void;
    removeEventTarget(type: string, listener: () => void, target?: any): void;
    dispatchEvent(event: string, clearAfterDispatch: boolean): void;
}



export class EventHelper implements iEventHandler {

    private _listeners: any;
    public get _textureLoaded(): boolean {
        return !!(<any>this.target)._textureLoaded
    }
    public set _textureLoaded(value:boolean) {
        (<any>this.target)._textureLoaded = value;
    }

    constructor(private target:any = null) {
        this.target = target || this;
    }


    public addEventListener = (type: string, listener: () => void, target?: any): void => {
        //check 'type' status, if the status is ready, dispatch event next frame
        if (type === "load" && this._textureLoaded) {            //only load event checked.
            setTimeout(function () {
                listener.call(target);
            }, 0);
            return;
        }

        if (this._listeners === undefined)
            this._listeners = {};

        var listeners = this._listeners;
        if (listeners[type] === undefined)
            listeners[type] = [];

        if (!this.hasEventListener(type, listener, target))
            listeners[type].push({ callback: listener, eventTarget: target });
    }

    public hasEventListener = (type: string, listener: () => void, target?: any): boolean => {
        if (this._listeners === undefined)
            return false;

        var listeners = this._listeners;
        if (listeners[type] !== undefined) {
            for (var i = 0, len = listeners.length; i < len; i++) {
                var selListener = listeners[i];
                if (selListener.callback === listener && selListener.eventTarget === target)
                    return true;
            }
        }
        return false;
    }

    public removeEventListener = (type: string, listener: () => void, target?: any): void => {
        if (this._listeners === undefined)
            return;

        var listeners = this._listeners;
        var listenerArray = listeners[type];

        if (listenerArray !== undefined) {
            for (var i = 0; i < listenerArray.length;) {
                var selListener = listenerArray[i];
                if (selListener.eventTarget === target && selListener.callback === listener)
                    listenerArray.splice(i, 1);
                else
                    i++
            }
        }
    }

    public removeEventTarget = (type: string, listener: () => void, target?: any): void => {
        if (this._listeners === undefined)
            return;

        var listeners = this._listeners;
        var listenerArray = listeners[type];

        if (listenerArray !== undefined) {
            for (var i = 0; i < listenerArray.length;) {
                var selListener = listenerArray[i];
                if (selListener.eventTarget === target)
                    listenerArray.splice(i, 1);
                else
                    i++
            }
        }
    }


    public dispatchEvent = (event: string, clearAfterDispatch: boolean): void => {
        if (this._listeners === undefined)
            return;

        if (clearAfterDispatch == null)
            clearAfterDispatch = true;
        var listeners = this._listeners;
        var listenerArray = listeners[event];

        if (listenerArray !== undefined) {
            var array = [];
            var length = listenerArray.length;

            for (var i = 0; i < length; i++) {
                array[i] = listenerArray[i];
            }

            for (i = 0; i < length; i++) {
                array[i].callback.call(array[i].eventTarget, this);
            }

            if (clearAfterDispatch)
                listenerArray.length = 0;
        }
    }



}