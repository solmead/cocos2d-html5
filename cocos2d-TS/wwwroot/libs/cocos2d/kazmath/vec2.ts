
import { EPSILON, square } from "./utility";
import { Matrix3 } from "./mat3";

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

export class Vec2 {

    x: number;
    y: number;

    constructor(_x:number | Vec2, _y:number) {
        if (_y === undefined) {
            _x = <Vec2>_x;
            this.x = _x.x;
            this.y = _x.y;
        } else {
            this.x = <number>_x || 0;
            this.y = _y || 0;
        }
    }

    fill(x:number, y:number):void {   // = cc.kmVec2Fill
        this.x = x;
        this.y = y;
    }
    length():number {   // = cc.kmVec2Length
        return Math.sqrt(square(this.x) + square(this.y));
    }
    lengthSq():number {   // = cc.kmVec2LengthSq
        return square(this.x) + square(this.y);
    }
    normalize():Vec2 {  // = cc.kmVec2Normalize
        var l = 1.0 / this.length();
        this.x *= l;
        this.y *= l;
        return this;
    }
    add(vec:Vec2):Vec2 {   // = cc.kmVec2Add
        this.x += vec.x;
        this.y += vec.y;
        return this;
    }
    dot(vec:Vec2):number {   //cc.kmVec2Dot
        return this.x * vec.x + this.y * vec.y;
    }
    subtract(vec:Vec2):Vec2 {     // = cc.kmVec2Subtract
        this.x -= vec.x;
        this.y -= vec.y;
        return this;
    }
    transform(mat3:Matrix3):Vec2 {     // = cc.kmVec2Transform
        var x = this.x, y = this.y;
        this.x = x * mat3.mat[0] + y * mat3.mat[3] + mat3.mat[6];
        this.y = x * mat3.mat[1] + y * mat3.mat[4] + mat3.mat[7];
        return this;
    }
    scale(s:number):Vec2 {  // = cc.kmVec2Scale
        this.x *= s;
        this.y *= s;
        return this;
    }
    equals(vec:Vec2):boolean {    // = cc.kmVec2AreEqual
        return (this.x < vec.x + EPSILON && this.x > vec.x - EPSILON) &&
            (this.y < vec.y + EPSILON && this.y > vec.y - EPSILON);
    }



}