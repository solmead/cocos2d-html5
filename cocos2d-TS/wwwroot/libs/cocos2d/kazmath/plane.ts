import { Vec4 } from "./vec4";
import { Vec3 } from "./Vec3";

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

export enum PlaneType {
    LEFT = 0,

    RIGHT = 1,

    BOTTOM = 2,

    TOP = 3,

    NEAR = 4,

    FAR = 5
}

export enum PlanePOINT {
    INFRONT_OF_PLANE = 0,

    BEHIND_PLANE = 1,

    ON_PLANE = 2
}


export class Plane {
    a: number;
    b: number;
    c: number;
    d: number;

    constructor(a?: number | Plane, b?: number, c?: number, d?: number) {
        if (a && b === undefined) {
            a = <Plane>a;
            this.a = a.a;
            this.b = a.b;
            this.c = a.c;
            this.d = a.d;
        } else {
            a = <number>a;
            this.a = a || 0;
            this.b = b || 0;
            this.c = c || 0;
            this.d = d || 0;
        }
    }
    dot(vec4:Vec4):number {       //cc.kmPlaneDot
        return (this.a * vec4.x + this.b * vec4.y + this.c * vec4.z + this.d * vec4.w);
    }
    dotCoord(vec3:Vec3):number {   //=cc.kmPlaneDotCoord
        return (this.a * vec3.x + this.b * vec3.y + this.c * vec3.z + this.d);
    }
    dotNormal(vec3:Vec3):number {    //=cc.kmPlaneDotNormal
        return (this.a * vec3.x + this.b * vec3.y + this.c * vec3.z);
    }
    normalize():Plane {     //cc.kmPlaneNormalize
        var n = new Vec3(this.a, this.b, this.c), l = 1.0 / n.length(); //Get 1/length
        n.normalize();  //Normalize the vector and assign to pOut
        this.a = n.x;
        this.b = n.y;
        this.c = n.z;
        this.d = this.d * l; //Scale the D value and assign to pOut
        return this;
    }
    classifyPoint(vec3:Vec3):PlanePOINT {
        // This function will determine if a point is on, in front of, or behind
        // the plane.  First we store the dot product of the plane and the point.
        var distance = this.a * vec3.x + this.b * vec3.y + this.c * vec3.z + this.d;

        // Simply put if the dot product is greater than 0 then it is infront of it.
        // If it is less than 0 then it is behind it.  And if it is 0 then it is on it.
        if (distance > 0.001)
            return PlanePOINT.INFRONT_OF_PLANE;
        if (distance < -0.001)
            return PlanePOINT.BEHIND_PLANE;
        return PlanePOINT.ON_PLANE;
    }







    static fromPointNormal(vec3:Vec3, normal:Vec3):Plane {   //cc.kmPlaneFromPointNormal
        /*
         Planea = Nx
         Planeb = Ny
         Planec = Nz
         Planned = −N⋅P
         */
        return new Plane(normal.x, normal.y, normal.z, -normal.dot(vec3));
    }

    static fromPoints(vec1: Vec3, vec2: Vec3, vec3: Vec3):Plane {     //cc.kmPlaneFromPoints
        /*
         v = (B − A) × (C − A)
         n = 1⁄|v| v
         Outa = nx
         Outb = ny
         Outc = nz
         Outd = −n⋅A
         */
        var v1 = new Vec3(vec2), v2 = new Vec3(vec3), plane = new Plane();
        v1.subtract(vec1);  //Create the vectors for the 2 sides of the triangle
        v2.subtract(vec1);
        v1.cross(v2); //  Use the cross product to get the normal
        v1.normalize(); //Normalize it and assign to pOut.m_N

        plane.a = v1.x;
        plane.b = v1.y;
        plane.c = v1.z;
        plane.d = v1.scale(-1.0).dot(vec1);
        return plane;
    }



}

export type kmPlane = Plane;