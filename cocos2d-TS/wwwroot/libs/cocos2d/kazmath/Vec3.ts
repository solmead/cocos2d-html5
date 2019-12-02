﻿import { square, EPSILON } from "./utility";
import { Matrix4 } from "./mat4";
import { Vec4 } from "./vec4";

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
     * A 3d vector.
     * @class
     * @param {number} [x]
     * @param {number} [y]
     * @param {number} [z]
     */
export class Vec3 {

    x: number;
    y: number;
    z: number;


    constructor(_x?:number | Vec3, _y?:number, _z?:number) {

        if (_x && _y === undefined) {
            _x = <Vec3>_x;
            this.x = _x.x;
            this.y = _x.y;
            this.z = _x.z;
        } else {
            this.x = <number>_x || 0;
            this.y = _y || 0;
            this.z = _z || 0;
        }


    }
    fill(_x: number | Vec3, _y?: number, _z?: number):Vec3 {    // =cc.kmVec3Fill
        if (_x && _y === undefined) {
            _x = <Vec3>_x;
            this.x = _x.x;
            this.y = _x.y;
            this.z = _x.z;
        } else {
            this.x = <number>_x || 0;
            this.y = _y || 0;
            this.z = _z || 0;
        }
        return this;
    }
    length():number {     //=cc.kmVec3Length
        return Math.sqrt(square(this.x) + square(this.y) + square(this.z));
    }
    lengthSq():number {   //=cc.kmVec3LengthSq
        return square(this.x) + square(this.y) + square(this.z)
    }
    normalize():Vec3 {  //= cc.kmVec3Normalize
        var l = 1.0 / this.length();
        this.x *= l;
        this.y *= l;
        this.z *= l;
        return this;
    }
    cross(vec3:Vec3):Vec3 {   //= cc.kmVec3Cross
        var x = this.x, y = this.y, z = this.z;
        this.x = (y * vec3.z) - (z * vec3.y);
        this.y = (z * vec3.x) - (x * vec3.z);
        this.z = (x * vec3.y) - (y * vec3.x);
        return this;
    }

    dot(vec: Vec3): number {     //= cc.kmVec3Dot
        return (this.x * vec.x + this.y * vec.y + this.z * vec.z);
    }

    add(vec: Vec3): Vec3 {      //= cc.kmVec3Add
        this.x += vec.x;
        this.y += vec.y;
        this.z += vec.z;
        return this;
    }

    subtract(vec: Vec3): Vec3 {  // = cc.kmVec3Subtract
        this.x -= vec.x;
        this.y -= vec.y;
        this.z -= vec.z;
        return this;
    }

    transform(mat4:Matrix4):Vec3 {             // = cc.kmVec3Transform
        var x = this.x, y = this.y, z = this.z, mat = mat4.mat;
        this.x = x * mat[0] + y * mat[4] + z * mat[8] + mat[12];
        this.y = x * mat[1] + y * mat[5] + z * mat[9] + mat[13];
        this.z = x * mat[2] + y * mat[6] + z * mat[10] + mat[14];
        return this;
    }

    transformNormal(mat4: Matrix4): Vec3 {
        /*
         a = (Vx, Vy, Vz, 0)
         b = (a×M)T
         Out = (bx, by, bz)
         */
        //Omits the translation, only scaling + rotating
        var x = this.x, y = this.y, z = this.z, mat = mat4.mat;
        this.x = x * mat[0] + y * mat[4] + z * mat[8];
        this.y = x * mat[1] + y * mat[5] + z * mat[9];
        this.z = x * mat[2] + y * mat[6] + z * mat[10];
        return this;
    }

    transformCoord(mat4: Matrix4): Vec3 {        // = cc.kmVec3TransformCoord
        /*
         a = (Vx, Vy, Vz, 1)
         b = (a×M)T
         Out = 1⁄bw(bx, by, bz)
         */
        var v = new Vec4(this.x, this.y, this.z, 1.0);
        v.transform(mat4);
        this.x = v.x / v.w;
        this.y = v.y / v.w;
        this.z = v.z / v.w;
        return this;
    }

    scale(scale:number):Vec3 {             // = cc.kmVec3Scale
        this.x *= scale;
        this.y *= scale;
        this.z *= scale;
        return this;
    }

    equals(vec:Vec3):boolean {    // = cc.kmVec3AreEqual
        //var EPSILON = math.EPSILON;
        return (this.x < (vec.x + EPSILON) && this.x > (vec.x - EPSILON)) &&
            (this.y < (vec.y + EPSILON) && this.y > (vec.y - EPSILON)) &&
            (this.z < (vec.z + EPSILON) && this.z > (vec.z - EPSILON));
    }

    inverseTransform(mat4:Matrix4):Vec3 {   //= cc.kmVec3InverseTransform
        var mat = mat4.mat;
        var v1 = new Vec3(this.x - mat[12], this.y - mat[13], this.z - mat[14]);
        this.x = v1.x * mat[0] + v1.y * mat[1] + v1.z * mat[2];
        this.y = v1.x * mat[4] + v1.y * mat[5] + v1.z * mat[6];
        this.z = v1.x * mat[8] + v1.y * mat[9] + v1.z * mat[10];
        return this;
    }

    inverseTransformNormal(mat4: Matrix4): Vec3 {   // = cc.kmVec3InverseTransformNormal
        var x = this.x, y = this.y, z = this.z, mat = mat4.mat;
        this.x = x * mat[0] + y * mat[1] + z * mat[2];
        this.y = x * mat[4] + y * mat[5] + z * mat[6];
        this.z = x * mat[8] + y * mat[9] + z * mat[10];
        return this;
    }

    assignFrom(vec:Vec3):Vec3 {
        if (!vec)
            return this;
        this.x = vec.x;
        this.y = vec.y;
        this.z = vec.z;
        return this;
    }

    static zero(vec:Vec3):Vec3 {   // = cc.kmVec3Zero
        vec.x = vec.y = vec.z = 0.0;
        return vec;
    }

    toTypeArray(): Float32Array {           //cc.kmVec3ToTypeArray
        var tyArr = new Float32Array(3);
        tyArr[0] = this.x;
        tyArr[1] = this.y;
        tyArr[2] = this.z;
        return tyArr;
    }



}

export type kmVec3 = Vec3;

export function vec3(x: number | Vec3, y?: number, z?: number):Vec3 {
    return new Vec3(x, y, z);
}