﻿import { square, EPSILON } from "./utility";
import { Matrix4 } from "./mat4";

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

export class Vec4 {

    x: number;
    y: number;
    z: number;
    w: number;



    constructor(_x?:number | Vec4, _y?:number, _z?:number, _w?:number) {
        if (_x && _y === undefined) {
            _x = <Vec4>_x;
            this.x = _x.x;
            this.y = _x.y;
            this.z = _x.z;
            this.w = _x.w;
        } else {
            this.x = <number>_x || 0;
            this.y = _y || 0;
            this.z = _z || 0;
            this.w = _w || 0;
        }
    }
    fill(x?: number | Vec4, y?: number, z?: number, w?: number) {     //=cc.kmVec4Fill
        if (x && y === undefined) {
            x = <Vec4>x;
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
            this.w = x.w;
        } else {
            x = <number>x;
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }
    }
    add(vec:Vec4):Vec4 {    //cc.kmVec4Add
        if (!vec)
            return this;
        this.x += vec.x;
        this.y += vec.y;
        this.z += vec.z;
        this.w += vec.w;
        return this;
    }
    dot(vec:Vec4):number {           //cc.kmVec4Dot
        return (this.x * vec.x + this.y * vec.y + this.z * vec.z + this.w * vec.w);
    }
    length():number {    //=cc.kmVec4Length
        return Math.sqrt(square(this.x) + square(this.y) + square(this.z) + square(this.w));
    }
    lengthSq():number {     //=cc.kmVec4LengthSq
        return square(this.x) + square(this.y) + square(this.z) + square(this.w);
    }
    lerp(vec:Vec4, t:number):Vec4 {    //= cc.kmVec4Lerp
        //not implemented
        return this;
    }
    normalize():Vec4 {   // cc.kmVec4Normalize
        var l = 1.0 / this.length();
        this.x *= l;
        this.y *= l;
        this.z *= l;
        this.w *= l;
        return this;
    }
    scale(scale:number):Vec4 {  //= cc.kmVec4Scale
        /// Scales a vector to the required length. This performs a Normalize before multiplying by S.
        this.normalize();
        this.x *= scale;
        this.y *= scale;
        this.z *= scale;
        this.w *= scale;
        return this;
    }
    subtract(vec:Vec4):void {
        this.x -= vec.x;
        this.y -= vec.y;
        this.z -= vec.z;
        this.w -= vec.w;
    }
    transform(mat4:Matrix4):Vec4 {
        var x = this.x, y = this.y, z = this.z, w = this.w, mat = mat4.mat;
        this.x = x * mat[0] + y * mat[4] + z * mat[8] + w * mat[12];
        this.y = x * mat[1] + y * mat[5] + z * mat[9] + w * mat[13];
        this.z = x * mat[2] + y * mat[6] + z * mat[10] + w * mat[14];
        this.w = x * mat[3] + y * mat[7] + z * mat[11] + w * mat[15];
        return this;
    }
    equals(vec:Vec4):boolean {              //=cc.kmVec4AreEqual
        return (this.x < vec.x + EPSILON && this.x > vec.x - EPSILON) &&
            (this.y < vec.y + EPSILON && this.y > vec.y - EPSILON) &&
            (this.z < vec.z + EPSILON && this.z > vec.z - EPSILON) &&
            (this.w < vec.w + EPSILON && this.w > vec.w - EPSILON);
    }
    assignFrom(vec:Vec4):Vec4 {      //= cc.kmVec4Assign
        this.x = vec.x;
        this.y = vec.y;
        this.z = vec.z;
        this.w = vec.w;
        return this;
    }
    toTypeArray(): Float32Array {      //cc.kmVec4ToTypeArray
        var tyArr = new Float32Array(4);
        tyArr[0] = this.x;
        tyArr[1] = this.y;
        tyArr[2] = this.z;
        tyArr[3] = this.w;
        return tyArr;
    }




    static transformArray(vecArray: Array<Vec4>, mat4: Matrix4): Array<Vec4> {
        var retArray = new Array<Vec4>();
        for (var i = 0; i < vecArray.length; i++) {
            var selVec = new Vec4(vecArray[i]);
            selVec.transform(mat4);
            retArray.push(selVec);
        }
        return retArray;
    }
}

export type kmVec4 = Vec4;