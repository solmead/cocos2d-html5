import { Matrix4Stack } from "./mat4stack";
import { Matrix4 } from "../mat4";
import { director } from "../../core/CCDirector";
import { Vec3 } from "../Vec3";
import { degreesToRadians } from "../../core/platform/index";

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

export enum MatrixMode {

    MODELVIEW = 0x1700,
    PROJECTION = 0x1701,
    TEXTURE = 0x1702
}

export var modelview_matrix_stack = new Matrix4Stack();
export var projection_matrix_stack = new Matrix4Stack();
export var texture_matrix_stack = new Matrix4Stack();

export var current_stack: Matrix4Stack = null;

var initialized = false;

function lazyInitialize():void {
    if (!initialized) {
        var identity = new Matrix4(); //Temporary identity matrix

        //Initialize all 3 stacks
        modelview_matrix_stack.initialize();
        projection_matrix_stack.initialize();
        texture_matrix_stack.initialize();

        current_stack = modelview_matrix_stack;
        initialized = true;
        identity.identity();

        //Make sure that each stack has the identity matrix
        modelview_matrix_stack.push(identity);
        projection_matrix_stack.push(identity);
        texture_matrix_stack.push(identity);
    }
}
lazyInitialize();

export function kmGLFreeAll():void {
    //Clear the matrix stacks
    modelview_matrix_stack.release();
    modelview_matrix_stack = null;
    projection_matrix_stack.release();
    projection_matrix_stack = null;
    texture_matrix_stack.release();
    texture_matrix_stack = null;

    //Delete the matrices
    initialized = false; //Set to uninitialized
    current_stack = null; //Set the current stack to point nowhere
}

export function kmGLPushMatrix():void {
    current_stack.push(current_stack.top);
}

export function kmGLPushMatrixWitMat4(saveMat:Matrix4):void {
    current_stack.stack.push(current_stack.top);
    saveMat.assignFrom(current_stack.top);
    current_stack.top = saveMat;
}
export function kmGLPopMatrix():void {
    //No need to lazy initialize, you shouldn't be popping first anyway!
    //cc.km_mat4_stack_pop(cc.current_stack, null);
    current_stack.top = current_stack.stack.pop();
}
//MatrixMode
export function kmGLMatrixMode(mode: MatrixMode):void {
    //cc.lazyInitialize();
    switch (mode) {
        case MatrixMode.MODELVIEW:
            current_stack = modelview_matrix_stack;
            break;
        case MatrixMode.PROJECTION:
            current_stack = projection_matrix_stack;
            break;
        case MatrixMode.TEXTURE:
            current_stack = texture_matrix_stack;
            break;
        default:
            throw new Error("Invalid matrix mode specified");   //TODO: Proper error handling
            //break;
    }
    current_stack.lastUpdated = director.getTotalFrames();
}

export function kmGLLoadIdentity():void {
    //cc.lazyInitialize();
    current_stack.top.identity(); //Replace the top matrix with the identity matrix
}


export function kmGLLoadMatrix(pIn: Matrix4): void {
    //lazyInitialize();
    current_stack.top.assignFrom(pIn);
}

export function kmGLMultMatrix(pIn: Matrix4): void {
    //lazyInitialize();
    current_stack.top.multiply(pIn);
}

var tempMatrix = new Matrix4();    //an internal matrix
export function kmGLTranslatef(x: number, y: number, z: number):void {
    //Create a rotation matrix using translation
    var translation = Matrix4.createByTranslation(x, y, z, tempMatrix);

    //Multiply the rotation matrix by the current matrix
    current_stack.top.multiply(translation);
}

var tempVector3 = new Vec3();
export function kmGLRotatef(angle: number, x: number, y: number, z: number):void {
    tempVector3.fill(x, y, z);
    //Create a rotation matrix using the axis and the angle
    var rotation = Matrix4.createByAxisAndAngle(tempVector3, degreesToRadians(angle), tempMatrix);

    //Multiply the rotation matrix by the current matrix
    current_stack.top.multiply(rotation);
}

export function kmGLScalef(x: number, y: number, z: number):void {
    var scaling = Matrix4.createByScale(x, y, z, tempMatrix);
    current_stack.top.multiply(scaling);
}

export function kmGLGetMatrix(mode: MatrixMode, pOut:Matrix4) {
    //lazyInitialize();
    switch (mode) {
        case MatrixMode.MODELVIEW:
            pOut.assignFrom(modelview_matrix_stack.top);
            break;
        case MatrixMode.PROJECTION:
            pOut.assignFrom(projection_matrix_stack.top);
            break;
        case MatrixMode.TEXTURE:
            pOut.assignFrom(texture_matrix_stack.top);
            break;
        default:
            throw new Error("Invalid matrix mode specified"); //TODO: Proper error handling
            //break;
    }
}
