import { game } from "../../../startup/CCGame";

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
 * The fullscreen API provides an easy way for web content to be presented using the user's entire screen.
 * It's invalid on safari, QQbrowser and android browser
 * @class
 * @name cc.screen
 */
class Screen {
    _supportsFullScreen: boolean = false;
    // the pre fullscreenchange function
    _preOnFullScreenChange: () => void = null;
    _touchEvent:string = "";
    _fn:any = null;
    // Function mapping for cross browser support
    _fnMap: Array<Array<string>> = [
        [
            'requestFullscreen',
            'exitFullscreen',
            'fullscreenchange',
            'fullscreenEnabled',
            'fullscreenElement'
        ],
        [
            'requestFullScreen',
            'exitFullScreen',
            'fullScreenchange',
            'fullScreenEnabled',
            'fullScreenElement'
        ],
        [
            'webkitRequestFullScreen',
            'webkitCancelFullScreen',
            'webkitfullscreenchange',
            'webkitIsFullScreen',
            'webkitCurrentFullScreenElement'
        ],
        [
            'mozRequestFullScreen',
            'mozCancelFullScreen',
            'mozfullscreenchange',
            'mozFullScreen',
            'mozFullScreenElement'
        ],
        [
            'msRequestFullscreen',
            'msExitFullscreen',
            'MSFullscreenChange',
            'msFullscreenEnabled',
            'msFullscreenElement'
        ]
    ];

    /**
     * initialize
     * @function
     */
    init() {
        this._fn = {};
        var i:number, l:number, val:Array<string>, map = this._fnMap, valL:number;
        for (i = 0, l = map.length; i < l; i++) {
            val = map[i];
            if (val && val[1] in document) {
                for (i = 0, valL = val.length; i < valL; i++) {
                    this._fn[map[0][i]] = val[i];
                }
                break;
            }
        }

        this._supportsFullScreen = (typeof this._fn.requestFullscreen !== 'undefined');
        this._touchEvent = ('ontouchstart' in window) ? 'touchstart' : 'mousedown';
    }

    /**
     * return true if it's full now.
     * @returns {Boolean}
     */
    fullScreen(): boolean {
        if (!this._supportsFullScreen) return false;
        else if ((<any>document)[(this._fn.fullscreenElement)] === undefined || (<any>document)[this._fn.fullscreenElement] === null)
            return false;
        else
            return true;
    }

    /**
     * change the screen to full mode.
     * @param {Element} element
     * @param {Function} onFullScreenChange
     */
    requestFullScreen(element: HTMLElement, onFullScreenChange?: () => void) {
        if (!this._supportsFullScreen) {
            return;
        }

        element = element || document.documentElement;

        if (onFullScreenChange) {
            var eventName = this._fn.fullscreenchange;
            if (this._preOnFullScreenChange) {
                document.removeEventListener(eventName, this._preOnFullScreenChange);
            }
            this._preOnFullScreenChange = onFullScreenChange;
            document.addEventListener(eventName, onFullScreenChange, false);
        }

        return (<any>element)[this._fn.requestFullscreen]();
    }

    /**
     * exit the full mode.
     * @return {Boolean}
     */
    exitFullScreen(): boolean {
        return this._supportsFullScreen ? (<any>document)[this._fn.exitFullscreen]() : true;
    }

/**
 * Automatically request full screen with a touch/click event
 * @param {Element} element
 * @param {Function} onFullScreenChange
 */
    autoFullScreen(element: HTMLElement, onFullScreenChange?: () => void) {
        element = element || document.body;
        var touchTarget = game.canvas || element;
        var theScreen = this;
        // Function bind will be too complicated here because we need the callback function's reference to remove the listener
        function callback() {
            touchTarget.removeEventListener(theScreen._touchEvent, callback);
            theScreen.requestFullScreen(element, onFullScreenChange);
        }
        this.requestFullScreen(element, onFullScreenChange);
        touchTarget.addEventListener(this._touchEvent, callback);
    }

}


export var screen = new Screen();

screen.init();

