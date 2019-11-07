import { CCDrawingPrimitive } from "../cocos2d/core/CCDrawingPrimitive";

/****************************************************************************
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
declare global {
    interface Window {
        requestAnimFrame: (callback: () => void) => number;
        gl: RenderingContext;
        ENABLE_IMAEG_POOL: boolean
    }
}



var _p = <any>window;
/** @expose */
_p.gl;
/** @expose */
_p.WebGLRenderingContext;
/** @expose */
_p.DeviceOrientationEvent;
/** @expose */
_p.DeviceMotionEvent;
/** @expose */
_p.AudioContext;
if (!_p.AudioContext) {
    /** @expose */
    _p.webkitAudioContext;
}
/** @expose */
_p.mozAudioContext;
_p = Object.prototype;
/** @expose */
_p._super;
/** @expose */
_p.ctor;
_p = null;


///**
// * drawing primitive of game engine
// * @type {cc.DrawingPrimitive}
// */
//export var _drawingUtil: CCDrawingPrimitive = null;

///**
// * main Canvas 2D/3D Context of game engine
// * @type {CanvasRenderingContext2D|WebGLRenderingContext}
// */
//export var _renderContext: CanvasRenderingContext2D | WebGLRenderingContext = null;
//export var _supportRender:boolean = false;

///**
// * Main canvas of game engine
// * @type {HTMLCanvasElement}
// */
//export var _canvas: HTMLCanvasElement = null;

///**
// * The element contains the game canvas
// * @type {HTMLDivElement}
// */
//export var container: HTMLDivElement = null;
//export var _gameDiv: HTMLDivElement = null;

window.ENABLE_IMAEG_POOL = true;




//+++++++++++++++++++++++++something about async begin+++++++++++++++++++++++++++++++

//+++++++++++++++++++++++++something about async end+++++++++++++++++++++++++++++++++

//+++++++++++++++++++++++++something about path begin++++++++++++++++++++++++++++++++


//+++++++++++++++++++++++++something about path end++++++++++++++++++++++++++++++++







async function init():Promise<void> {

}


