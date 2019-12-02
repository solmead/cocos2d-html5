﻿import { ccClass, V3F_C4B_T2F_Quad, TEXTURE_ATLAS_USE_TRIANGLE_STRIP,g_NumberOfDraws, setNumberOfDraws, VERTEX_ATTRIB } from "../platform/index"
import { Texture2D } from "./CCTexture2D";
import { isString } from "../../../startup/CCChecks";
import { game } from "../../../startup/CCGame";
import { textureCache } from "./CCTextureCache";
import { log, _LogInfos, assert } from "../../../startup/CCDebugger";
import { glBindTexture2D } from "../../shaders/index";
import { Texture2DWebGL } from "./TexturesWebGL";

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
 * <p>A class that implements a Texture Atlas. <br />
 * Supported features: <br />
 * The atlas file can be a PNG, JPG. <br />
 * Quads can be updated in runtime <br />
 * Quads can be added in runtime <br />
 * Quads can be removed in runtime <br />
 * Quads can be re-ordered in runtime <br />
 * The TextureAtlas capacity can be increased or decreased in runtime.</p>
 * @class
 * @extends cc.Class
 *
 * @property {Boolean}  dirty           - Indicates whether or not the array buffer of the VBO needs to be updated.
 * @property {Image}    texture         - Image texture for cc.TextureAtlas.
 * @property {Number}   capacity        - <@readonly> Quantity of quads that can be stored with the current texture atlas size.
 * @property {Number}   totalQuads      - <@readonly> Quantity of quads that are going to be drawn.
 * @property {Array}    quads           - <@readonly> Quads that are going to be rendered
 */
export class TextureAtlas extends ccClass {
    dirty: boolean = false;
    texture: Texture2D = null;

    _indices: Uint16Array = null;
    //0 = vertex  1 = indices
    _buffersVBO:Array<WebGLBuffer> = null;
    _capacity: number = 0;

    _quads: Array<V3F_C4B_T2F_Quad> = null;
    _quadsArrayBuffer: ArrayBuffer = null;
    _quadsWebBuffer: WebGLBuffer = null;
    _quadsReader: Uint8Array = null;

    _totalQuads: number = 0


    /**
     * <p>Creates a TextureAtlas with an filename and with an initial capacity for Quads. <br />
     * The TextureAtlas capacity can be increased in runtime. </p>
     * Constructor of cc.TextureAtlas
     * @param {String|cc.Texture2D} fileName
     * @param {Number} capacity
     * @example
     * 1.
     * //creates a TextureAtlas with  filename
     * var textureAtlas = new cc.TextureAtlas("res/hello.png", 3);
     * 2.
     * //creates a TextureAtlas with texture
     * var texture = cc.textureCache.addImage("hello.png");
     * var textureAtlas = new cc.TextureAtlas(texture, 3);
     */
    constructor(fileName?: string | Texture2D, capacity?: number) {
        super();
        this._buffersVBO = [];

        if (isString(fileName)) {
            this.initWithFileAsync(<string>fileName, capacity);
        } else if (fileName instanceof Texture2D) {
            this.initWithTexture(fileName, capacity);
        }

    }
    /**
     * Quantity of quads that are going to be drawn.
     * @return {Number}
     */
    getTotalQuads(): number {
        //return this._quads.length;
        return this._totalQuads;
    }

    /**
     * Quantity of quads that can be stored with the current texture atlas size
     * @return {Number}
     */
    getCapacity(): number {
        return this._capacity;
    }
    /**
     * Texture of the texture atlas
     * @return {Image}
     */
    getTexture(): Texture2D {
        return this.texture;
    }
    /**
     * @param {Image} texture
     */
    setTexture(texture: Texture2D) {
        this.texture = texture;
    }

    /**
     * specify if the array buffer of the VBO needs to be updated
     * @param {Boolean} dirty
     */
    setDirty(dirty: boolean) {
        this.dirty = dirty;
    }
    /**
     * whether or not the array buffer of the VBO needs to be updated
     * @returns {boolean}
     */
    isDirty(): boolean {
        return this.dirty;
    }
    /**
     * Quads that are going to be rendered
     * @return {Array}
     */
    getQuads(): Array<V3F_C4B_T2F_Quad> {
        return this._quads;
    }
    /**
     * @param {Array} quads
     */
    setQuads(quads: Array<V3F_C4B_T2F_Quad>) {
        //TODO need re-binding
        this._quads = quads;
    }

    _copyQuadsToTextureAtlas(quads: Array<V3F_C4B_T2F_Quad>, index: number) {
        if (!quads)
            return;

        for (var i = 0; i < quads.length; i++)
            this._setQuadToArray(quads[i], index + i);
    }

    _setQuadToArray(quad: V3F_C4B_T2F_Quad, index: number) {
        var locQuads = this._quads;
        if (!locQuads[index]) {
            locQuads[index] = new V3F_C4B_T2F_Quad(quad.tl, quad.bl, quad.tr, quad.br, this._quadsArrayBuffer, index * V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT);
            return;
        }
        locQuads[index].bl = quad.bl;
        locQuads[index].br = quad.br;
        locQuads[index].tl = quad.tl;
        locQuads[index].tr = quad.tr;
    }

    /**
     * Description
     * @return {String}
     */
    description(): string {
        return '<cc.TextureAtlas | totalQuads =' + this._totalQuads + '>';
    }

    _setupIndices() {
        if (this._capacity === 0)
            return;
        var locIndices = this._indices, locCapacity = this._capacity;
        for (var i = 0; i < locCapacity; i++) {
            if (TEXTURE_ATLAS_USE_TRIANGLE_STRIP) {
                locIndices[i * 6 + 0] = i * 4 + 0;
                locIndices[i * 6 + 1] = i * 4 + 0;
                locIndices[i * 6 + 2] = i * 4 + 2;
                locIndices[i * 6 + 3] = i * 4 + 1;
                locIndices[i * 6 + 4] = i * 4 + 3;
                locIndices[i * 6 + 5] = i * 4 + 3;
            } else {
                locIndices[i * 6 + 0] = i * 4 + 0;
                locIndices[i * 6 + 1] = i * 4 + 1;
                locIndices[i * 6 + 2] = i * 4 + 2;

                // inverted index. issue #179
                locIndices[i * 6 + 3] = i * 4 + 3;
                locIndices[i * 6 + 4] = i * 4 + 2;
                locIndices[i * 6 + 5] = i * 4 + 1;
            }
        }
    }
    _setupVBO() {
        var gl = game.renderContextWebGl;
        //create WebGLBuffer
        this._buffersVBO[0] = gl.createBuffer();
        this._buffersVBO[1] = gl.createBuffer();

        this._quadsWebBuffer = gl.createBuffer();
        this._mapBuffers();
    }
    _mapBuffers() {
        var gl = game.renderContextWebGl;

        gl.bindBuffer(gl.ARRAY_BUFFER, this._quadsWebBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this._quadsArrayBuffer, gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1]);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.STATIC_DRAW);
    }
    /**
     * <p>Initializes a TextureAtlas with a filename and with a certain capacity for Quads.<br />
     * The TextureAtlas capacity can be increased in runtime.<br />
     * WARNING: Do not reinitialize the TextureAtlas because it will leak memory. </p>
     * @param {String} file
     * @param {Number} capacity
     * @return {Boolean}
     * @example
     * //example
     * var textureAtlas = new cc.TextureAtlas();
     * textureAtlas.initWithTexture("hello.png", 3);
     */
    async initWithFileAsync(file: string, capacity: number): Promise<boolean> {
        // retained in property
        var texture = await textureCache.addImageAsync(file);
        if (texture)
            return this.initWithTexture(texture, capacity);
        else {
            log(_LogInfos.TextureAtlas_initWithFile, file);
            return false;
        }
    }


    /**
     * <p>Initializes a TextureAtlas with a previously initialized Texture2D object, and<br />
     * with an initial capacity for Quads.<br />
     * The TextureAtlas capacity can be increased in runtime.<br />
     * WARNING: Do not reinitialize the TextureAtlas because it will leak memory</p>
     * @param {Image} texture
     * @param {Number} capacity
     * @return {Boolean}
     * @example
     * //example
     * var texture = cc.textureCache.addImage("hello.png");
     * var textureAtlas = new cc.TextureAtlas();
     * textureAtlas.initWithTexture(texture, 3);
     */
    initWithTexture(texture: Texture2D, capacity: number): boolean {
        assert(!!texture, _LogInfos.TextureAtlas_initWithTexture);

        capacity = 0 | (capacity);
        this._capacity = capacity;
        this._totalQuads = 0;

        // retained in property
        this.texture = texture;

        // Re-initialization is not allowed
        this._quads = [];
        this._indices = new Uint16Array(capacity * 6);
        var quadSize = V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
        this._quadsArrayBuffer = new ArrayBuffer(quadSize * capacity);
        this._quadsReader = new Uint8Array(this._quadsArrayBuffer);

        if (!(this._quads && this._indices) && capacity > 0)
            return false;

        var locQuads = this._quads;
        for (var i = 0; i < capacity; i++)
            locQuads[i] = new V3F_C4B_T2F_Quad(null, null, null, null, this._quadsArrayBuffer, i * quadSize);

        this._setupIndices();
        this._setupVBO();
        this.dirty = true;
        return true;
    }

    /**
     * <p>Updates a Quad (texture, vertex and color) at a certain index <br />
     * index must be between 0 and the atlas capacity - 1 </p>
     * @param {cc.V3F_C4B_T2F_Quad} quad
     * @param {Number} index
     */
    updateQuad(quad: V3F_C4B_T2F_Quad, index: number) {
        assert(!!quad, _LogInfos.TextureAtlas_updateQuad);
        assert(index >= 0 && index < this._capacity, _LogInfos.TextureAtlas_updateQuad_2);

        this._totalQuads = Math.max(index + 1, this._totalQuads);
        this._setQuadToArray(quad, index);
        this.dirty = true;
    }
    /**
     * <p>Inserts a Quad (texture, vertex and color) at a certain index<br />
     * index must be between 0 and the atlas capacity - 1 </p>
     * @param {cc.V3F_C4B_T2F_Quad} quad
     * @param {Number} index
     */
    insertQuad(quad: V3F_C4B_T2F_Quad, index: number) {
        assert(index < this._capacity, _LogInfos.TextureAtlas_insertQuad_2);

        this._totalQuads++;
        if (this._totalQuads > this._capacity) {
            log(_LogInfos.TextureAtlas_insertQuad);
            return;
        }
        var quadSize = V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
        // issue #575. index can be > totalQuads
        var remaining = (this._totalQuads - 1) - index;
        var startOffset = index * quadSize;
        var moveLength = remaining * quadSize;
        this._quads[this._totalQuads - 1] = new V3F_C4B_T2F_Quad(null, null, null, null, this._quadsArrayBuffer, (this._totalQuads - 1) * quadSize);
        this._quadsReader.set(this._quadsReader.subarray(startOffset, startOffset + moveLength), startOffset + quadSize);

        this._setQuadToArray(quad, index);
        this.dirty = true;
    }


    /**
     * <p>
     *      Inserts a c array of quads at a given index                                           <br />
     *      index must be between 0 and the atlas capacity - 1                                    <br />
     *      this method doesn't enlarge the array when amount + index > totalQuads                <br />
     * </p>
     * @param {Array} quads
     * @param {Number} index
     * @param {Number} amount
     */
    insertQuads(quads: Array<V3F_C4B_T2F_Quad>, index: number, amount: number) {
        amount = amount || quads.length;

        assert((index + amount) <= this._capacity, _LogInfos.TextureAtlas_insertQuads);

        var quadSize = V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
        this._totalQuads += amount;
        if (this._totalQuads > this._capacity) {
            log(_LogInfos.TextureAtlas_insertQuad);
            return;
        }

        // issue #575. index can be > totalQuads
        var remaining = (this._totalQuads - 1) - index - amount;
        var startOffset = index * quadSize;
        var moveLength = remaining * quadSize;
        var lastIndex = (this._totalQuads - 1) - amount;

        var i;
        for (i = 0; i < amount; i++)
            this._quads[lastIndex + i] = new V3F_C4B_T2F_Quad(null, null, null, null, this._quadsArrayBuffer, (this._totalQuads - 1) * quadSize);
        this._quadsReader.set(this._quadsReader.subarray(startOffset, startOffset + moveLength), startOffset + quadSize * amount);
        for (i = 0; i < amount; i++)
            this._setQuadToArray(quads[i], index + i);

        this.dirty = true;
    }


    /**
     * <p>Removes the quad that is located at a certain index and inserts it at a new index <br />
     * This operation is faster than removing and inserting in a quad in 2 different steps</p>
     * @param {Number} fromIndex
     * @param {Number} newIndex
     */
    insertQuadFromIndex(fromIndex: number, newIndex: number) {
        if (fromIndex === newIndex)
            return;

        assert(newIndex >= 0 || newIndex < this._totalQuads, _LogInfos.TextureAtlas_insertQuadFromIndex);

        assert(fromIndex >= 0 || fromIndex < this._totalQuads, _LogInfos.TextureAtlas_insertQuadFromIndex_2);

        var quadSize = V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
        var locQuadsReader = this._quadsReader;
        var sourceArr = locQuadsReader.subarray(fromIndex * quadSize, quadSize);
        var startOffset, moveLength;
        if (fromIndex > newIndex) {
            startOffset = newIndex * quadSize;
            moveLength = (fromIndex - newIndex) * quadSize;
            locQuadsReader.set(locQuadsReader.subarray(startOffset, startOffset + moveLength), startOffset + quadSize);
            locQuadsReader.set(sourceArr, startOffset);
        } else {
            startOffset = (fromIndex + 1) * quadSize;
            moveLength = (newIndex - fromIndex) * quadSize;
            locQuadsReader.set(locQuadsReader.subarray(startOffset, startOffset + moveLength), startOffset - quadSize);
            locQuadsReader.set(sourceArr, newIndex * quadSize);
        }
        this.dirty = true;
    }

/**
 * <p>Removes a quad at a given index number.<br />
 * The capacity remains the same, but the total number of quads to be drawn is reduced in 1 </p>
 * @param {Number} index
 */
    removeQuadAtIndex(index: number) {
        assert(index < this._totalQuads, _LogInfos.TextureAtlas_removeQuadAtIndex);

        var quadSize = V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
        this._totalQuads--;
        this._quads.length = this._totalQuads;
        if (index !== this._totalQuads) {
            //move data
            var startOffset = (index + 1) * quadSize;
            var moveLength = (this._totalQuads - index) * quadSize;
            this._quadsReader.set(this._quadsReader.subarray(startOffset, startOffset + moveLength), startOffset - quadSize);
        }
        this.dirty = true;
    }

/**
 * Removes a given number of quads at a given index
 * @param {Number} index
 * @param {Number} amount
 */
    removeQuadsAtIndex(index: number, amount: number) {
        assert(index + amount <= this._totalQuads, _LogInfos.TextureAtlas_removeQuadsAtIndex);

        this._totalQuads -= amount;

        if (index !== this._totalQuads) {
            //move data
            var quadSize = V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
            var srcOffset = (index + amount) * quadSize;
            var moveLength = (this._totalQuads - index) * quadSize;
            var dstOffset = index * quadSize;
            this._quadsReader.set(this._quadsReader.subarray(srcOffset, srcOffset + moveLength), dstOffset);
        }
        this.dirty = true;
    }

/**
 * <p>Removes all Quads. <br />
 * The TextureAtlas capacity remains untouched. No memory is freed.<br />
 * The total number of quads to be drawn will be 0</p>
 */
    removeAllQuads() {
        this._quads.length = 0;
        this._totalQuads = 0;
    }

    _setDirty(dirty: boolean) {
        this.dirty = dirty;
    }

/**
 * <p>Resize the capacity of the CCTextureAtlas.<br />
 * The new capacity can be lower or higher than the current one<br />
 * It returns YES if the resize was successful. <br />
 * If it fails to resize the capacity it will return NO with a new capacity of 0. <br />
 * no used for js</p>
 * @param {Number} newCapacity
 * @return {Boolean}
 */
    resizeCapacity(newCapacity: number): boolean {
        if (newCapacity === this._capacity)
            return true;

        var quadSize = V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
        var oldCapacity = this._capacity;
        // update capacity and totolQuads
        this._totalQuads = Math.min(this._totalQuads, newCapacity);
        this._capacity = 0 | newCapacity;
        var i, capacity = this._capacity, locTotalQuads = this._totalQuads;

        if (this._quads === null) {
            this._quads = [];
            this._quadsArrayBuffer = new ArrayBuffer(quadSize * capacity);
            this._quadsReader = new Uint8Array(this._quadsArrayBuffer);
            for (i = 0; i < capacity; i++)
                this._quads[i] = new V3F_C4B_T2F_Quad(null, null, null, null, this._quadsArrayBuffer, i * quadSize);
        } else {
            var newQuads, newArrayBuffer, quads = this._quads;
            if (capacity > oldCapacity) {
                newQuads = [];
                newArrayBuffer = new ArrayBuffer(quadSize * capacity);
                for (i = 0; i < locTotalQuads; i++) {
                    newQuads[i] = new V3F_C4B_T2F_Quad(quads[i].tl, quads[i].bl, quads[i].tr, quads[i].br,
                        newArrayBuffer, i * quadSize);
                }
                for (; i < capacity; i++)
                    newQuads[i] = new V3F_C4B_T2F_Quad(null, null, null, null, newArrayBuffer, i * quadSize);

                this._quadsReader = new Uint8Array(newArrayBuffer);
                this._quads = newQuads;
                this._quadsArrayBuffer = newArrayBuffer;
            } else {
                var count = Math.max(locTotalQuads, capacity);
                newQuads = [];
                newArrayBuffer = new ArrayBuffer(quadSize * capacity);
                for (i = 0; i < count; i++) {
                    newQuads[i] = new V3F_C4B_T2F_Quad(quads[i].tl, quads[i].bl, quads[i].tr, quads[i].br,
                        newArrayBuffer, i * quadSize);
                }
                this._quadsReader = new Uint8Array(newArrayBuffer);
                this._quads = newQuads;
                this._quadsArrayBuffer = newArrayBuffer;
            }
        }

        if (this._indices === null) {
            this._indices = new Uint16Array(capacity * 6);
        } else {
            if (capacity > oldCapacity) {
                var tempIndices = new Uint16Array(capacity * 6);
                tempIndices.set(this._indices, 0);
                this._indices = tempIndices;
            } else {
                this._indices = this._indices.subarray(0, capacity * 6);
            }
        }

        this._setupIndices();
        this._mapBuffers();
        this.dirty = true;
        return true;
    }

/**
 * Used internally by CCParticleBatchNode                                    <br/>
 * don't use this unless you know what you're doing
 * @param {Number} amount
 */
    increaseTotalQuadsWith(amount: number) {
        this._totalQuads += amount;
    }

/**
 * Moves an amount of quads from oldIndex at newIndex
 * @param {Number} oldIndex
 * @param {Number} amount
 * @param {Number} newIndex
 */
    moveQuadsFromIndex(oldIndex: number, amount: number, newIndex: number) {
        if (newIndex === undefined) {
            newIndex = amount;
            amount = this._totalQuads - oldIndex;

            assert((newIndex + (this._totalQuads - oldIndex)) <= this._capacity, _LogInfos.TextureAtlas_moveQuadsFromIndex);

            if (amount === 0)
                return;
        } else {
            assert((newIndex + amount) <= this._totalQuads, _LogInfos.TextureAtlas_moveQuadsFromIndex_2);
            assert(oldIndex < this._totalQuads, _LogInfos.TextureAtlas_moveQuadsFromIndex_3);

            if (oldIndex === newIndex)
                return;
        }

        var quadSize = V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
        var srcOffset = oldIndex * quadSize;
        var srcLength = amount * quadSize;
        var locQuadsReader = this._quadsReader;
        var sourceArr = locQuadsReader.subarray(srcOffset, srcOffset + srcLength);
        var dstOffset = newIndex * quadSize;
        var moveLength, moveStart;
        if (newIndex < oldIndex) {
            moveLength = (oldIndex - newIndex) * quadSize;
            moveStart = newIndex * quadSize;
            locQuadsReader.set(locQuadsReader.subarray(moveStart, moveStart + moveLength), moveStart + srcLength)
        } else {
            moveLength = (newIndex - oldIndex) * quadSize;
            moveStart = (oldIndex + amount) * quadSize;
            locQuadsReader.set(locQuadsReader.subarray(moveStart, moveStart + moveLength), srcOffset);
        }
        locQuadsReader.set(sourceArr, dstOffset);
        this.dirty = true;
    }

/**
 * Ensures that after a realloc quads are still empty                                <br/>
 * Used internally by CCParticleBatchNode
 * @param {Number} index
 * @param {Number} amount
 */
    fillWithEmptyQuadsFromIndex(index: number, amount: number) {
        var count = amount * V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
        var clearReader = new Uint8Array(this._quadsArrayBuffer, index * V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT, count);
        for (var i = 0; i < count; i++)
            clearReader[i] = 0;
    }

// TextureAtlas - Drawing

/**
 * Draws all the Atlas's Quads
 */
    drawQuads() {
        this.drawNumberOfQuads(this._totalQuads, 0);
    }

    _releaseBuffer() {
        var gl = game.renderContextWebGl;
        if (this._buffersVBO) {
            if (this._buffersVBO[0])
                gl.deleteBuffer(this._buffersVBO[0]);
            if (this._buffersVBO[1])
                gl.deleteBuffer(this._buffersVBO[1])
        }
        if (this._quadsWebBuffer)
            gl.deleteBuffer(this._quadsWebBuffer);
    }


    drawNumberOfQuads(n: number, start: number):void {
        var _t = this;
        start = start || 0;
        if (0 === n || !_t.texture || !_t.texture.isLoaded())
            return;

        var gl = game.renderContextWebGl;
        glBindTexture2D(<Texture2DWebGL>_t.texture);

        //
        // Using VBO without VAO
        //
        //vertices
        //gl.bindBuffer(gl.ARRAY_BUFFER, _t._buffersVBO[0]);
        // XXX: update is done in draw... perhaps it should be done in a timer

        gl.bindBuffer(gl.ARRAY_BUFFER, _t._quadsWebBuffer);
        if (_t.dirty) {
            gl.bufferData(gl.ARRAY_BUFFER, _t._quadsArrayBuffer, gl.DYNAMIC_DRAW);
            _t.dirty = false;
        }

        gl.enableVertexAttribArray(VERTEX_ATTRIB.POSITION);
        gl.enableVertexAttribArray(VERTEX_ATTRIB.COLOR);
        gl.enableVertexAttribArray(VERTEX_ATTRIB.TEX_COORDS);

        gl.vertexAttribPointer(VERTEX_ATTRIB.POSITION, 3, gl.FLOAT, false, 24, 0);               // vertices
        gl.vertexAttribPointer(VERTEX_ATTRIB.COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);          // colors
        gl.vertexAttribPointer(VERTEX_ATTRIB.TEX_COORDS, 2, gl.FLOAT, false, 24, 16);            // tex coords

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _t._buffersVBO[1]);

        if (TEXTURE_ATLAS_USE_TRIANGLE_STRIP)
            gl.drawElements(gl.TRIANGLE_STRIP, n * 6, gl.UNSIGNED_SHORT, start * 6 * _t._indices.BYTES_PER_ELEMENT);
        else
            gl.drawElements(gl.TRIANGLES, n * 6, gl.UNSIGNED_SHORT, start * 6 * _t._indices.BYTES_PER_ELEMENT);

        setNumberOfDraws(g_NumberOfDraws + 1);
        //cc.checkGLErrorDebug();
    }




    get totalQuads(): number {
        return this.getTotalQuads();
    }
    get capacity(): number {
        return this.getCapacity();
    }
    get quads(): Array<V3F_C4B_T2F_Quad> {
        return this.getQuads();
    }
    set quads(value: Array<V3F_C4B_T2F_Quad>) {
        this.setQuads(value);
    }






}















