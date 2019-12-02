import { ccNode } from "./CCNode";
import { BLEND_SRC, BLEND_DST, BlendFunc } from "../platform/index";
import { game, RENDER_TYPE } from "../../../startup/CCGame";
import { log, _LogInfos } from "../../../startup/CCDebugger";
import { AtlasNode_CanvasRenderCmd } from "./CCAtlasNodeCanvasRenderCmd";
import { AtlasNode_WebGLRenderCmd } from "./CCAtlasNodeWebGLRenderCmd";
import { textureCache } from "../textures/CCTextureCache";
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
 * <p>cc.AtlasNode is a subclass of cc.Node, it knows how to render a TextureAtlas object. </p>
 *
 * <p>If you are going to render a TextureAtlas consider subclassing cc.AtlasNode (or a subclass of cc.AtlasNode)</p>
 *
 * <p>All features from cc.Node are valid</p>
 *
 * <p>You can create a cc.AtlasNode with an Atlas file, the width, the height of each item and the quantity of items to render</p>
 *
 * @class
 * @extends cc.Node
 *
 * @param {String} tile
 * @param {Number} tileWidth
 * @param {Number} tileHeight
 * @param {Number} itemsToRender
 * @example
 * var node = new cc.AtlasNode("pathOfTile", 16, 16, 1);
 *
 * @property {cc.Texture2D}     texture         - Current used texture
 * @property {cc.TextureAtlas}  textureAtlas    - Texture atlas for cc.AtlasNode
 * @property {Number}           quadsToDraw     - Number of quads to draw
 */
export class AtlasNode extends ccNode {
    /**
     * <p>Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.</p>
     * @param {String} tile
     * @param {Number} tileWidth
     * @param {Number} tileHeight
     * @param {Number} itemsToRender
     */
    constructor(tile, tileWidth, tileHeight, itemsToRender) {
        super();
        this.textureAtlas = null;
        this.quadsToDraw = 0;
        //! chars per row
        this._itemsPerRow = 0;
        //! chars per column
        this._itemsPerColumn = 0;
        //! width of each char
        this._itemWidth = 0;
        //! height of each char
        this._itemHeight = 0;
        // protocol variables
        this._opacityModifyRGB = false;
        this._blendFunc = null;
        // This variable is only used for CCLabelAtlas FPS display. So plz don't modify its value.
        this._ignoreContentScaleFactor = false;
        this._className = "AtlasNode";
        this._texture = null;
        this._blendFunc = new BlendFunc(BLEND_SRC, BLEND_DST);
        this._ignoreContentScaleFactor = false;
        itemsToRender !== undefined && this.initWithTileFileAsync(tile, tileWidth, tileHeight, itemsToRender);
    }
    // _textureForCanvas = null;
    getRenderCmd() {
        return this._renderCmd;
    }
    _createRenderCmd() {
        if (game.renderType === RENDER_TYPE.CANVAS)
            this._renderCmd = new AtlasNode_CanvasRenderCmd(this);
        else
            this._renderCmd = new AtlasNode_WebGLRenderCmd(this);
        return this._renderCmd;
    }
    /**
     * Updates the Atlas (indexed vertex array).
     * Empty implementation, shall be overridden in subclasses
     * @function
     */
    updateAtlasValues() {
        log(_LogInfos.AtlasNode_updateAtlasValues);
    }
    /**
     * Get color value of the atlas node
     * @function
     * @return {cc.Color}
     */
    getColor() {
        if (this._opacityModifyRGB)
            return this.getRenderCmd()._colorUnmodified;
        return super.getColor();
    }
    /**
     * Set whether color should be changed with the opacity value,
     * if true, node color will change while opacity changes.
     * @function
     * @param {Boolean} value
     */
    setOpacityModifyRGB(value) {
        var oldColor = this.color;
        this._opacityModifyRGB = value;
        this.setColor(oldColor);
    }
    /**
     * Get whether color should be changed with the opacity value
     * @function
     * @return {Boolean}
     */
    isOpacityModifyRGB() {
        return this._opacityModifyRGB;
    }
    /**
     * Get node's blend function
     * @function
     * @return {cc.BlendFunc}
     */
    getBlendFunc() {
        return this._blendFunc;
    }
    setBlendFunc(src, dst) {
        if (dst === undefined) {
            src = src;
            this._blendFunc = src;
        }
        else {
            src = src;
            this._blendFunc = new BlendFunc(src, dst);
        }
    }
    /**
     * Set the atlas texture
     * @function
     * @param {cc.TextureAtlas} value The texture
     */
    setTextureAtlas(value) {
        this.textureAtlas = value;
    }
    /**
     * Get the atlas texture
     * @function
     * @return {cc.TextureAtlas}
     */
    getTextureAtlas() {
        return this.textureAtlas;
    }
    /**
     * Get the number of quads to be rendered
     * @function
     * @return {Number}
     */
    getQuadsToDraw() {
        return this.quadsToDraw;
    }
    /**
     * Set the number of quads to be rendered
     * @function
     * @param {Number} quadsToDraw
     */
    setQuadsToDraw(quadsToDraw) {
        this.quadsToDraw = quadsToDraw;
    }
    /**
     * Initializes an cc.AtlasNode object with an atlas texture file name, the width, the height of each tile and the quantity of tiles to render
     * @function
     * @param {String} tile             The atlas texture file name
     * @param {Number} tileWidth        The width of each tile
     * @param {Number} tileHeight       The height of each tile
     * @param {Number} itemsToRender    The quantity of tiles to be rendered
     * @return {Boolean}
     */
    async initWithTileFileAsync(tile, tileWidth, tileHeight, itemsToRender) {
        if (!tile)
            throw new Error("cc.AtlasNode.initWithTileFile(): title should not be null");
        var texture = await textureCache.addImageAsync(tile);
        return this.initWithTexture(texture, tileWidth, tileHeight, itemsToRender);
    }
    /**
     * Initializes an CCAtlasNode with an atlas texture, the width, the height of each tile and the quantity of tiles to render
     * @function
     * @param {cc.Texture2D} texture    The atlas texture
     * @param {Number} tileWidth        The width of each tile
     * @param {Number} tileHeight       The height of each tile
     * @param {Number} itemsToRender    The quantity of tiles to be rendered
     * @return {Boolean}
     */
    initWithTexture(texture, tileWidth, tileHeight, itemsToRender) {
        return this.getRenderCmd().initWithTexture(texture, tileWidth, tileHeight, itemsToRender);
    }
    /**
     * Set node's color
     * @function
     * @param {cc.Color} color Color object created with cc.color(r, g, b).
     */
    setColor(color) {
        this.getRenderCmd().setColor(color);
    }
    /**
     * Set node's opacity
     * @function
     * @param {Number} opacity The opacity value
     */
    setOpacity(opacity) {
        this.getRenderCmd().setOpacity(opacity);
    }
    /**
     * Get the current texture
     * @function
     * @return {cc.Texture2D}
     */
    getTexture() {
        return this._texture;
    }
    /**
     * Replace the current texture with a new one
     * @function
     * @param {cc.Texture2D} texture    The new texture
     */
    setTexture(texture) {
        this._texture = texture;
    }
    _setIgnoreContentScaleFactor(ignoreContentScaleFactor) {
        this._ignoreContentScaleFactor = ignoreContentScaleFactor;
    }
    get opacity() {
        return this.getOpacity();
    }
    set opacity(value) {
        this.setOpacity(value);
    }
    get color() {
        return this.getColor();
    }
    set color(value) {
        this.setColor(value);
    }
    get texture() {
        return this.getTexture();
    }
    set texture(value) {
        this.setTexture(value);
    }
    get renderCmdWebGl() {
        return this._renderCmd;
    }
    get renderCmdCanvas() {
        return this._renderCmd;
    }
}
//# sourceMappingURL=CCAtlasNode.js.map