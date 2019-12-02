import { Matrix4 } from "../mat4";
/**
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.
 Copyright (c) 2008, Luke Benstead.
 All rights reserved.

 Redistribution and use in source and binary forms, with or without modification,
 are permitted provided that the following conditions are met:

 Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.
 Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation
 and/or other materials provided with the distribution.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/**
     * The stack of cc.math.Matrix4
     * @param {cc.math.Matrix4} [top]
     * @param {Array} [stack]
     * @constructor
     */
export class Matrix4Stack {
    constructor(top = null, stack) {
        this.top = top;
        this.stack = stack;
        this.top = top;
        this.stack = stack || new Array();
        this.lastUpdated = 0;
        //this._matrixPool = [];            // use pool in next version
    }
    initialize() {
        this.stack.length = 0;
        this.top = null;
    }
    push(item) {
        item = item || this.top;
        this.stack.push(this.top);
        this.top = new Matrix4(item);
        //this.top = this._getFromPool(item);
    }
    pop() {
        //this._putInPool(this.top);
        this.top = this.stack.pop();
    }
    release() {
        this.stack = null;
        this.top = null;
        //this._matrixPool = null;
    }
}
//for compatibility
export function km_mat4_stack_push(stack, item) {
    stack.stack.push(stack.top);
    stack.top = new Matrix4(item);
}
export function km_mat4_stack_pop(stack, pOut) {
    stack.top = stack.stack.pop();
}
export function km_mat4_stack_release(stack) {
    stack.stack = null;
    stack.top = null;
}
//# sourceMappingURL=mat4stack.js.map