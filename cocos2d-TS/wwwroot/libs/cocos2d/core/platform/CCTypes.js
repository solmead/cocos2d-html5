import { ccClass } from "./ccClass";
import * as macro from "./CCMacro";
export class Color {
    constructor(r = null, g = null, b = null, a = null) {
        r = r || 0;
        g = g || 0;
        b = b || 0;
        a = typeof a === 'number' ? a : 255;
        this._val = ((r << 24) >>> 0) + (g << 16) + (b << 8) + a;
    }
    get r() {
        return (this._val & 0xff000000) >>> 24;
    }
    set r(value) {
        this._val = (this._val & 0x00ffffff) | ((value << 24) >>> 0);
    }
    get g() {
        return (this._val & 0x00ff0000) >> 16;
    }
    set g(value) {
        this._val = (this._val & 0xff00ffff) | (value << 16);
    }
    get b() {
        return (this._val & 0x0000ff00) >> 8;
    }
    set b(value) {
        this._val = (this._val & 0xffff00ff) | (value << 8);
    }
    get a() {
        return this._val & 0x000000ff;
    }
    set a(value) {
        this._val = (this._val & 0xffffff00) | value;
    }
    /**
     * White color (255, 255, 255, 255)
     * @returns {Color}
     * @private
     */
    static get WHITE() {
        return color(255, 255, 255);
    }
    ;
    /**
     *  Yellow color (255, 255, 0, 255)
     * @returns {Color}
     * @private
     */
    static get YELLOW() {
        return color(255, 255, 0);
    }
    ;
    /**
     *  Blue color (0, 0, 255, 255)
     * @type {Color}
     * @private
     */
    static get BLUE() {
        return color(0, 0, 255);
    }
    ;
    /**
     *  Green Color (0, 255, 0, 255)
     * @type {Color}
     * @private
     */
    static get GREEN() {
        return color(0, 255, 0);
    }
    ;
    /**
     *  Red Color (255, 0, 0, 255)
     * @type {Color}
     * @private
     */
    static get RED() {
        return color(255, 0, 0);
    }
    ;
    /**
     *  Magenta Color (255, 0, 255, 255)
     * @type {Color}
     * @private
     */
    static get MAGENTA() {
        return color(255, 0, 255);
    }
    ;
    /**
     *  Black Color (0, 0, 0, 255)
     * @type {Color}
     * @private
     */
    static get BLACK() {
        return color(0, 0, 0);
    }
    ;
    /**
     *  Orange Color (255, 127, 0, 255)
     * @type {_p}
     * @private
     */
    static get ORANGE() {
        return color(255, 127, 0);
    }
    ;
    /**
     *  Gray Color (166, 166, 166, 255)
     * @type {_p}
     * @private
     */
    static get GRAY() {
        return color(166, 166, 166);
    }
    ;
}
export function color(r = undefined, g = undefined, b = undefined, a = undefined) {
    if (r === undefined)
        return new Color(0, 0, 0, 255);
    if (typeof r === 'object')
        return new Color(r.r, r.g, r.b, (r.a == null) ? 255 : r.a);
    if (typeof r === 'string')
        return hexToColor(r);
    return new Color(r, g, b, (!a ? 255 : a));
}
/**
 * returns true if both ccColor3B are equal. Otherwise it returns false.
 * @function
 * @param {Color} color1
 * @param {Color} color2
 * @return {Boolean}  true if both ccColor3B are equal. Otherwise it returns false.
 */
export function colorEqual(color1, color2) {
    return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b;
}
;
/**
 * the device accelerometer reports values for each axis in units of g-force
 * @class Acceleration
 * @constructor
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @param {Number} timestamp
 */
export class Acceleration {
    constructor(x, y, z, timestamp) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.timestamp = timestamp;
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.timestamp = timestamp || 0;
    }
    ;
}
/**
 * @class Vertex2F
 * @param {Number} x
 * @param {Number}y
 * @param {Array} arrayBuffer
 * @param {Number}offset
 * @constructor
 */
export class Vertex2F {
    constructor(_x, _y, arrayBuffer = null, offset = null) {
        this._arrayBuffer = arrayBuffer || new ArrayBuffer(Vertex2F.BYTES_PER_ELEMENT);
        this._offset = offset || 0;
        this._view = new Float32Array(this._arrayBuffer, this._offset, 2);
        this._view[0] = _x || 0;
        this._view[1] = _y || 0;
    }
    get x() {
        return this._view[0];
    }
    set x(xValue) {
        this._view[0] = xValue;
    }
    get y() {
        return this._view[1];
    }
    set y(yValue) {
        this._view[1] = yValue;
    }
}
/**
 * @constant
 * @type {number}
 */
Vertex2F.BYTES_PER_ELEMENT = 8;
/**
 * @class Vertex3F
 * @param {Number} x
 * @param {Number} y
 * @param {Number}z
 * @param {Array} arrayBuffer
 * @param {Number} offset
 * @constructor
 */
export class Vertex3F {
    constructor(x, y, z, arrayBuffer = null, offset = null) {
        this._arrayBuffer = arrayBuffer || new ArrayBuffer(Vertex3F.BYTES_PER_ELEMENT);
        this._offset = offset || 0;
        var locArrayBuffer = this._arrayBuffer, locOffset = this._offset;
        this._view = new Float32Array(locArrayBuffer, locOffset, 3);
        this._view[0] = x || 0;
        this._view[1] = y || 0;
        this._view[2] = z || 0;
    }
    get x() {
        return this._view[0];
    }
    set x(xValue) {
        this._view[0] = xValue;
    }
    get y() {
        return this._view[1];
    }
    set y(yValue) {
        this._view[1] = yValue;
    }
    get z() {
        return this._view[2];
    }
    set z(zValue) {
        this._view[2] = zValue;
    }
}
Vertex3F.BYTES_PER_ELEMENT = 12;
/**
 * @class Tex2F
 * @param {Number} u
 * @param {Number} v
 * @param {Array} arrayBuffer
 * @param {Number} offset
 * @constructor
 */
export class Tex2F {
    constructor(u, v, arrayBuffer = null, offset = null) {
        this._arrayBuffer = arrayBuffer || new ArrayBuffer(Tex2F.BYTES_PER_ELEMENT);
        this._offset = offset || 0;
        this._view = new Float32Array(this._arrayBuffer, this._offset, 2);
        this._view[0] = u || 0;
        this._view[1] = v || 0;
    }
    get u() {
        return this._view[0];
    }
    set u(xValue) {
        this._view[0] = xValue;
    }
    get v() {
        return this._view[1];
    }
    set v(yValue) {
        this._view[1] = yValue;
    }
}
Tex2F.BYTES_PER_ELEMENT = 8;
/**
 * @class Quad2
 * @param {Vertex2F} tl
 * @param {Vertex2F} tr
 * @param {Vertex2F} bl
 * @param {Vertex2F} br
 * @param {Array} arrayBuffer
 * @param {Number} offset
 * @constructor
 */
export class Quad2 {
    constructor(tl = null, tr = null, bl = null, br = null, arrayBuffer = null, offset = null) {
        this._tl = null;
        this._tr = null;
        this._bl = null;
        this._br = null;
        this._arrayBuffer = arrayBuffer || new ArrayBuffer(Quad2.BYTES_PER_ELEMENT);
        this._offset = offset || 0;
        var locArrayBuffer = this._arrayBuffer, locOffset = this._offset, locElementLen = Vertex2F.BYTES_PER_ELEMENT;
        this._tl = tl ? new Vertex2F(tl.x, tl.y, locArrayBuffer, locOffset) : new Vertex2F(0, 0, locArrayBuffer, locOffset);
        locOffset += locElementLen;
        this._tr = tr ? new Vertex2F(tr.x, tr.y, locArrayBuffer, locOffset) : new Vertex2F(0, 0, locArrayBuffer, locOffset);
        locOffset += locElementLen;
        this._bl = bl ? new Vertex2F(bl.x, bl.y, locArrayBuffer, locOffset) : new Vertex2F(0, 0, locArrayBuffer, locOffset);
        locOffset += locElementLen;
        this._br = br ? new Vertex2F(br.x, br.y, locArrayBuffer, locOffset) : new Vertex2F(0, 0, locArrayBuffer, locOffset);
    }
    get tl() {
        return this._tl;
    }
    ;
    set tl(tlValue) {
        this._tl._view[0] = tlValue.x;
        this._tl._view[1] = tlValue.y;
    }
    ;
    get tr() {
        return this._tr;
    }
    ;
    set tr(trValue) {
        this._tr._view[0] = trValue.x;
        this._tr._view[1] = trValue.y;
    }
    ;
    get bl() {
        return this._bl;
    }
    ;
    set bl(blValue) {
        this._bl._view[0] = blValue.x;
        this._bl._view[1] = blValue.y;
    }
    ;
    get br() {
        return this._br;
    }
    ;
    set br(brValue) {
        this._br._view[0] = brValue.x;
        this._br._view[1] = brValue.y;
    }
    ;
}
Quad2.BYTES_PER_ELEMENT = 32;
/**
 * A 3D Quad. 4 * 3 floats
 * @Class Quad3
 * @Construct
 * @param {Vertex3F} bl
 * @param {Vertex3F} br
 * @param {Vertex3F} tl
 * @param {Vertex3F} tr
 */
export class Quad3 {
    constructor(bl = null, br = null, tl = null, tr = null, arrayBuffer = null, offset = null) {
        this.bl = bl;
        this.br = br;
        this.tl = tl;
        this.tr = tr;
        this._arrayBuffer = arrayBuffer || new ArrayBuffer(Vertex3F.BYTES_PER_ELEMENT);
        this._offset = offset || 0;
        var locArrayBuffer = this._arrayBuffer, locOffset = this._offset, locElementLen = Vertex3F.BYTES_PER_ELEMENT;
        this.bl = bl ? new Vertex3F(bl.x, bl.y, bl.z, locArrayBuffer, locOffset) : new Vertex3F(0, 0, 0, locArrayBuffer, locOffset);
        locOffset += locElementLen;
        this.br = br ? new Vertex3F(br.x, br.y, br.z, locArrayBuffer, locOffset) : new Vertex3F(0, 0, 0, locArrayBuffer, locOffset);
        locOffset += locElementLen;
        this.tl = tl ? new Vertex3F(tl.x, tl.y, tl.z, locArrayBuffer, locOffset) : new Vertex3F(0, 0, 0, locArrayBuffer, locOffset);
        locOffset += locElementLen;
        this.tr = tr ? new Vertex3F(tr.x, tr.y, tr.z, locArrayBuffer, locOffset) : new Vertex3F(0, 0, 0, locArrayBuffer, locOffset);
    }
}
Quad3.BYTES_PER_ELEMENT = 48;
/**
 * @class V3F_C4B_T2F
 * @param {Vertex3F} vertices
 * @param {Color} colors
 * @param {Tex2F} texCoords
 * @param {Array} arrayBuffer
 * @param {Number} offset
 * @constructor
 */
export class V3F_C4B_T2F {
    constructor(vertices = null, colors = null, texCoords = null, arrayBuffer = null, offset = null) {
        this._arrayBuffer = arrayBuffer || new ArrayBuffer(V3F_C4B_T2F.BYTES_PER_ELEMENT);
        this._offset = offset || 0;
        var locArrayBuffer = this._arrayBuffer, locOffset = this._offset;
        this._vertices = vertices ? new Vertex3F(vertices.x, vertices.y, vertices.z, locArrayBuffer, locOffset) :
            new Vertex3F(0, 0, 0, locArrayBuffer, locOffset);
        locOffset += Vertex3F.BYTES_PER_ELEMENT;
        this._colors = colors ? new _WebGLColor(colors.r, colors.g, colors.b, colors.a, locArrayBuffer, locOffset) :
            new _WebGLColor(0, 0, 0, 0, locArrayBuffer, locOffset);
        locOffset += _WebGLColor.BYTES_PER_ELEMENT;
        this._texCoords = texCoords ? new Tex2F(texCoords.u, texCoords.v, locArrayBuffer, locOffset) :
            new Tex2F(0, 0, locArrayBuffer, locOffset);
    }
    get vertices() {
        return this._vertices;
    }
    set vertices(verticesValue) {
        var locVertices = this._vertices;
        locVertices._view[0] = verticesValue.x;
        locVertices._view[1] = verticesValue.y;
        locVertices._view[2] = verticesValue.z;
    }
    get colors() {
        return this._colors;
    }
    set colors(colorValue) {
        var locColors = this._colors;
        locColors.r = colorValue.r;
        locColors.g = colorValue.g;
        locColors.b = colorValue.b;
        locColors.a = colorValue.a;
    }
    get texCoords() {
        return this._texCoords;
    }
    set texCoords(texValue) {
        this._texCoords._view[0] = texValue.u;
        this._texCoords._view[1] = texValue.v;
    }
}
V3F_C4B_T2F.BYTES_PER_ELEMENT = 24;
/**
 * @class V3F_C4B_T2F_Quad
 * @param {V3F_C4B_T2F} tl
 * @param {V3F_C4B_T2F} bl
 * @param {V3F_C4B_T2F} tr
 * @param {V3F_C4B_T2F} br
 * @param {Array} arrayBuffer
 * @param {Number} offset
 * @constructor
 */
export class V3F_C4B_T2F_Quad {
    constructor(tl = null, bl = null, tr = null, br = null, arrayBuffer = null, offset = null) {
        this._arrayBuffer = arrayBuffer || new ArrayBuffer(V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT);
        this._offset = offset || 0;
        var locArrayBuffer = this._arrayBuffer, locOffset = this._offset, locElementLen = V3F_C4B_T2F.BYTES_PER_ELEMENT;
        this._tl = tl ? new V3F_C4B_T2F(tl.vertices, tl.colors, tl.texCoords, locArrayBuffer, locOffset) :
            new V3F_C4B_T2F(null, null, null, locArrayBuffer, locOffset);
        locOffset += locElementLen;
        this._bl = bl ? new V3F_C4B_T2F(bl.vertices, bl.colors, bl.texCoords, locArrayBuffer, locOffset) :
            new V3F_C4B_T2F(null, null, null, locArrayBuffer, locOffset);
        locOffset += locElementLen;
        this._tr = tr ? new V3F_C4B_T2F(tr.vertices, tr.colors, tr.texCoords, locArrayBuffer, locOffset) :
            new V3F_C4B_T2F(null, null, null, locArrayBuffer, locOffset);
        locOffset += locElementLen;
        this._br = br ? new V3F_C4B_T2F(br.vertices, br.colors, br.texCoords, locArrayBuffer, locOffset) :
            new V3F_C4B_T2F(null, null, null, locArrayBuffer, locOffset);
    }
    get tl() {
        return this._tl;
    }
    ;
    set tl(tlValue) {
        var locTl = this._tl;
        locTl.vertices = tlValue.vertices;
        locTl.colors = tlValue.colors;
        locTl.texCoords = tlValue.texCoords;
    }
    ;
    get bl() {
        return this._bl;
    }
    ;
    set bl(blValue) {
        var locBl = this._bl;
        locBl.vertices = blValue.vertices;
        locBl.colors = blValue.colors;
        locBl.texCoords = blValue.texCoords;
    }
    ;
    get tr() {
        return this._tr;
    }
    ;
    set tr(trValue) {
        var locTr = this._tr;
        locTr.vertices = trValue.vertices;
        locTr.colors = trValue.colors;
        locTr.texCoords = trValue.texCoords;
    }
    ;
    get br() {
        return this._br;
    }
    ;
    set br(brValue) {
        var locBr = this._br;
        locBr.vertices = brValue.vertices;
        locBr.colors = brValue.colors;
        locBr.texCoords = brValue.texCoords;
    }
    ;
    get arrayBuffer() {
        return this._arrayBuffer;
    }
    ;
}
V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT = 96;
/**
 * @function
 * @returns {V3F_C4B_T2F_Quad}
 */
export function V3F_C4B_T2F_QuadZero() {
    return new V3F_C4B_T2F_Quad();
}
;
/**
 * @function
 * @param {V3F_C4B_T2F_Quad} sourceQuad
 * @return {V3F_C4B_T2F_Quad}
 */
export function V3F_C4B_T2F_QuadCopy(sourceQuad) {
    if (!sourceQuad)
        return V3F_C4B_T2F_QuadZero();
    //return new V3F_C4B_T2F_Quad(sourceQuad,tl,sourceQuad,bl,sourceQuad.tr,sourceQuad.br,null,0);
    var srcTL = sourceQuad.tl, srcBL = sourceQuad.bl, srcTR = sourceQuad.tr, srcBR = sourceQuad.br;
    var tl = new V3F_C4B_T2F(new Vertex3F(srcTL.vertices.x, srcTL.vertices.y, srcTL.vertices.z), new Color(srcTL.colors.r, srcTL.colors.g, srcTL.colors.b, srcTL.colors.a), new Tex2F(srcTL.texCoords.u, srcTL.texCoords.v));
    var bl = new V3F_C4B_T2F(new Vertex3F(srcBL.vertices.x, srcBL.vertices.y, srcBL.vertices.z), new Color(srcBL.colors.r, srcBL.colors.g, srcBL.colors.b, srcBL.colors.a), new Tex2F(srcBL.texCoords.u, srcBL.texCoords.v));
    var tr = new V3F_C4B_T2F(new Vertex3F(srcTR.vertices.x, srcTR.vertices.y, srcTR.vertices.z), new Color(srcTR.colors.r, srcTR.colors.g, srcTR.colors.b, srcTR.colors.a), new Tex2F(srcTR.texCoords.u, srcTR.texCoords.v));
    var br = new V3F_C4B_T2F(new Vertex3F(srcBR.vertices.x, srcBR.vertices.y, srcBR.vertices.z), new Color(srcBR.colors.r, srcBR.colors.g, srcBR.colors.b, srcBR.colors.a), new Tex2F(srcBR.texCoords.u, srcBR.texCoords.v));
    return new V3F_C4B_T2F_Quad(tl, bl, tr, br);
}
;
/**
 * @function
 * @param {Array} sourceQuads
 * @returns {Array}
 */
export function V3F_C4B_T2F_QuadsCopy(sourceQuads) {
    var retArr = new Array();
    if (!sourceQuads)
        return retArr;
    for (var i = 0; i < sourceQuads.length; i++) {
        retArr.push(V3F_C4B_T2F_QuadCopy(sourceQuads[i]));
    }
    return retArr;
}
;
//redefine V2F_C4B_T2F
/**
 * @class V2F_C4B_T2F
 * @param {Vertex2F} vertices
 * @param {Color} colors
 * @param {Tex2F} texCoords
 * @param {Array} arrayBuffer
 * @param {Number} offset
 * @constructor
 */
export class V2F_C4B_T2F {
    constructor(vertices = null, colors = null, texCoords = null, arrayBuffer = null, offset = null) {
        this._arrayBuffer = arrayBuffer || new ArrayBuffer(V2F_C4B_T2F.BYTES_PER_ELEMENT);
        this._offset = offset || 0;
        var locArrayBuffer = this._arrayBuffer, locOffset = this._offset;
        this._vertices = vertices ? new Vertex2F(vertices.x, vertices.y, locArrayBuffer, locOffset) :
            new Vertex2F(0, 0, locArrayBuffer, locOffset);
        locOffset += Vertex2F.BYTES_PER_ELEMENT;
        this._colors = colors ? new _WebGLColor(colors.r, colors.g, colors.b, colors.a, locArrayBuffer, locOffset) :
            new _WebGLColor(0, 0, 0, 0, locArrayBuffer, locOffset);
        locOffset += _WebGLColor.BYTES_PER_ELEMENT;
        this._texCoords = texCoords ? new Tex2F(texCoords.u, texCoords.v, locArrayBuffer, locOffset) :
            new Tex2F(0, 0, locArrayBuffer, locOffset);
    }
    get vertices() {
        return this._vertices;
    }
    ;
    set vertices(verticesValue) {
        this._vertices._view[0] = verticesValue.x;
        this._vertices._view[1] = verticesValue.y;
    }
    ;
    get colors() {
        return this._colors;
    }
    ;
    set colors(colorValue) {
        var locColors = this._colors;
        locColors.r = colorValue.r;
        locColors.g = colorValue.g;
        locColors.b = colorValue.b;
        locColors.a = colorValue.a;
    }
    ;
    get texCoords() {
        return this._texCoords;
    }
    ;
    set texCoords(texValue) {
        this._texCoords._view[0] = texValue.u;
        this._texCoords._view[1] = texValue.v;
    }
    ;
}
V2F_C4B_T2F.BYTES_PER_ELEMENT = 20;
//redefine V2F_C4B_T2F_Triangle
/**
 * @class V2F_C4B_T2F_Triangle
 * @param {V2F_C4B_T2F} a
 * @param {V2F_C4B_T2F} b
 * @param {V2F_C4B_T2F} c
 * @param {Array} arrayBuffer
 * @param {Number} offset
 * @constructor
 */
export class V2F_C4B_T2F_Triangle {
    constructor(a = null, b = null, c = null, arrayBuffer = null, offset = null) {
        this._arrayBuffer = arrayBuffer || new ArrayBuffer(V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT);
        this._offset = offset || 0;
        var locArrayBuffer = this._arrayBuffer, locOffset = this._offset, locElementLen = V2F_C4B_T2F.BYTES_PER_ELEMENT;
        this._a = a ? new V2F_C4B_T2F(a.vertices, a.colors, a.texCoords, locArrayBuffer, locOffset) :
            new V2F_C4B_T2F(null, null, null, locArrayBuffer, locOffset);
        locOffset += locElementLen;
        this._b = b ? new V2F_C4B_T2F(b.vertices, b.colors, b.texCoords, locArrayBuffer, locOffset) :
            new V2F_C4B_T2F(null, null, null, locArrayBuffer, locOffset);
        locOffset += locElementLen;
        this._c = c ? new V2F_C4B_T2F(c.vertices, c.colors, c.texCoords, locArrayBuffer, locOffset) :
            new V2F_C4B_T2F(null, null, null, locArrayBuffer, locOffset);
    }
    get a() {
        return this._a;
    }
    ;
    set a(aValue) {
        var locA = this._a;
        locA.vertices = aValue.vertices;
        locA.colors = aValue.colors;
        locA.texCoords = aValue.texCoords;
    }
    ;
    get b() {
        return this._b;
    }
    ;
    set b(bValue) {
        var locB = this._b;
        locB.vertices = bValue.vertices;
        locB.colors = bValue.colors;
        locB.texCoords = bValue.texCoords;
    }
    ;
    get c() {
        return this._c;
    }
    ;
    set c(cValue) {
        var locC = this._c;
        locC.vertices = cValue.vertices;
        locC.colors = cValue.colors;
        locC.texCoords = cValue.texCoords;
    }
    ;
}
V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT = 60;
/**
 * Helper macro that creates an Vertex2F type composed of 2 floats: x, y
 * @function
 * @param {Number} x
 * @param {Number} y
 * @return {Vertex2F}
 */
export function vertex2(x, y) {
    return new Vertex2F(x, y);
}
;
/**
 * Helper macro that creates an Vertex3F type composed of 3 floats: x, y, z
 * @function
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @return {Vertex3F}
 */
export function vertex3(x, y, z) {
    return new Vertex3F(x, y, z);
}
;
/**
 * Helper macro that creates an Tex2F type: A texcoord composed of 2 floats: u, y
 * @function
 * @param {Number} u
 * @param {Number} v
 * @return {Tex2F}
 */
export function tex2(u, v) {
    return new Tex2F(u, v);
}
;
/**
 * Blend Function used for textures
 * @Class BlendFunc
 * @Constructor
 * @param {Number} src1 source blend function
 * @param {Number} dst1 destination blend function
 */
export class BlendFunc {
    constructor(src1, dst1) {
        this.src1 = src1;
        this.dst1 = dst1;
    }
    static get _disable() {
        return new BlendFunc(macro.ONE, macro.ZERO);
    }
    ;
    static get _alphaPremultiplied() {
        return new BlendFunc(macro.ONE, macro.ONE_MINUS_SRC_ALPHA);
    }
    ;
    static get _alphaNonPremultiplied() {
        return new BlendFunc(macro.SRC_ALPHA, macro.ONE_MINUS_SRC_ALPHA);
    }
    ;
    static get _additive() {
        return new BlendFunc(macro.SRC_ALPHA, macro.ONE);
    }
    ;
}
/**
 * @function
 * @returns {BlendFunc}
 */
export function blendFuncDisable() {
    return new BlendFunc(macro.ONE, macro.ZERO);
}
;
/**
 * convert a string of color for style to Color.
 * e.g. "#ff06ff"  to : color(255,6,255)
 * @function
 * @param {String} hex
 * @return {Color}
 */
export function hexToColor(hex) {
    hex = hex.replace(/^#?/, "0x");
    var c = parseInt(hex);
    var r = c >> 16;
    var g = (c >> 8) % 256;
    var b = c % 256;
    return new Color(r, g, b);
}
;
/**
 * convert Color to a string of color for style.
 * e.g.  color(255,6,255)  to : "#ff06ff"
 * @function
 * @param {Color} color
 * @return {String}
 */
export function colorToHex(color) {
    var hR = color.r.toString(16), hG = color.g.toString(16), hB = color.b.toString(16);
    return "#" + (color.r < 16 ? ("0" + hR) : hR) + (color.g < 16 ? ("0" + hG) : hG) + (color.b < 16 ? ("0" + hB) : hB);
}
;
export var HorizontalAlignment;
(function (HorizontalAlignment) {
    /**
     * text alignment : left
     * @constant
     * @type Number
     */
    HorizontalAlignment[HorizontalAlignment["TEXT_ALIGNMENT_LEFT"] = 0] = "TEXT_ALIGNMENT_LEFT";
    /**
     * text alignment : center
     * @constant
     * @type Number
     */
    HorizontalAlignment[HorizontalAlignment["TEXT_ALIGNMENT_CENTER"] = 1] = "TEXT_ALIGNMENT_CENTER";
    /**
     * text alignment : right
     * @constant
     * @type Number
     */
    HorizontalAlignment[HorizontalAlignment["TEXT_ALIGNMENT_RIGHT"] = 2] = "TEXT_ALIGNMENT_RIGHT";
})(HorizontalAlignment || (HorizontalAlignment = {}));
export var VerticalAlignment;
(function (VerticalAlignment) {
    /**
     * text alignment : top
     * @constant
     * @type Number
     */
    VerticalAlignment[VerticalAlignment["VERTICAL_TEXT_ALIGNMENT_TOP"] = 0] = "VERTICAL_TEXT_ALIGNMENT_TOP";
    /**
     * text alignment : center
     * @constant
     * @type Number
     */
    VerticalAlignment[VerticalAlignment["VERTICAL_TEXT_ALIGNMENT_CENTER"] = 1] = "VERTICAL_TEXT_ALIGNMENT_CENTER";
    /**
     * text alignment : bottom
     * @constant
     * @type Number
     */
    VerticalAlignment[VerticalAlignment["VERTICAL_TEXT_ALIGNMENT_BOTTOM"] = 2] = "VERTICAL_TEXT_ALIGNMENT_BOTTOM";
})(VerticalAlignment || (VerticalAlignment = {}));
export class _Dictionary extends ccClass {
    constructor() {
        super();
        this._keyMapTb = null;
        this._valueMapTb = null;
        this.__currId = 0;
        this._keyMapTb = {};
        this._valueMapTb = {};
        this.__currId = 2 << (0 | (Math.random() * 10));
    }
    __getKey() {
        this.__currId++;
        return "key_" + this.__currId;
    }
    setObject(value, key) {
        if (key == null)
            return;
        var keyId = this.__getKey();
        this._keyMapTb[keyId] = key;
        this._valueMapTb[keyId] = value;
    }
    objectForKey(key) {
        if (key == null)
            return null;
        var locKeyMapTb = this._keyMapTb;
        for (var keyId in locKeyMapTb) {
            if (locKeyMapTb[keyId] === key)
                return this._valueMapTb[keyId];
        }
        return null;
    }
    valueForKey(key) {
        return this.objectForKey(key);
    }
    removeObjectForKey(key) {
        if (key == null)
            return;
        var locKeyMapTb = this._keyMapTb;
        for (var keyId in locKeyMapTb) {
            if (locKeyMapTb[keyId] === key) {
                delete this._valueMapTb[keyId];
                delete locKeyMapTb[keyId];
                return;
            }
        }
    }
    removeObjectsForKeys(keys) {
        if (keys == null)
            return;
        for (var i = 0; i < keys.length; i++)
            this.removeObjectForKey(keys[i]);
    }
    allKeys() {
        var keyArr = [], locKeyMapTb = this._keyMapTb;
        for (var key in locKeyMapTb)
            keyArr.push(locKeyMapTb[key]);
        return keyArr;
    }
    removeAllObjects() {
        this._keyMapTb = {};
        this._valueMapTb = {};
    }
    count() {
        return this.allKeys().length;
    }
}
/**
 * Common usage:
 *
 * var fontDef = new FontDefinition();
 * fontDef.fontName = "Arial";
 * fontDef.fontSize = 12;
 * ...
 *
 * OR using inline definition useful for constructor injection
 *
 * var fontDef = new FontDefinition({
 *  fontName: "Arial",
 *  fontSize: 12
 * });
 *
 *
 *
 * @class FontDefinition
 * @param {Object} properties - (OPTIONAL) Allow inline FontDefinition
 * @constructor
 */
export class FontDefinition {
    constructor(properties = null) {
        this.fontName = "Arial";
        this.fontSize = 12;
        this.textAlign = HorizontalAlignment.TEXT_ALIGNMENT_CENTER;
        this.verticalAlign = VerticalAlignment.VERTICAL_TEXT_ALIGNMENT_TOP;
        this.fillStyle = color(255, 255, 255, 255);
        this.boundingWidth = 0;
        this.boundingHeight = 0;
        this.strokeEnabled = false;
        this.strokeStyle = color(255, 255, 255, 255);
        this.lineWidth = 1;
        this.lineHeight = "normal";
        this.fontStyle = "normal";
        this.fontWeight = "normal";
        this.shadowEnabled = false;
        this.shadowOffsetX = 0;
        this.shadowOffsetY = 0;
        this.shadowBlur = 0;
        this.shadowOpacity = 1.0;
        //properties mapping:
        if (properties && properties instanceof Object) {
            for (var key in properties) {
                this[key] = properties[key];
            }
        }
    }
    _getCanvasFontStr() {
        var lineHeight = !this.lineHeight.charAt ? this.lineHeight + "px" : this.lineHeight;
        return this.fontStyle + " " + this.fontWeight + " " + this.fontSize + "px/" + lineHeight + " '" + this.fontName + "'";
    }
    ;
}
export class _WebGLColor extends Color {
    constructor(r = null, g = null, b = null, a = null, arrayBuffer = null, offset = null) {
        super(r, g, b, a);
        this._arrayBuffer = arrayBuffer || new ArrayBuffer(_WebGLColor.BYTES_PER_ELEMENT);
        this._offset = offset || 0;
        var locArrayBuffer = this._arrayBuffer, locOffset = this._offset;
        this.__view = new Uint8Array(locArrayBuffer, locOffset, 4);
        this.__view[0] = r || 0;
        this.__view[1] = g || 0;
        this.__view[2] = b || 0;
        this.__view[3] = (a == null) ? 255 : a;
    }
    get _view() {
        this.__view[0] = this.r || 0;
        this.__view[1] = this.g || 0;
        this.__view[2] = this.b || 0;
        this.__view[3] = (this.a == null) ? 255 : this.a;
        return this.__view;
    }
}
_WebGLColor.BYTES_PER_ELEMENT = 4;
//# sourceMappingURL=CCTypes.js.map