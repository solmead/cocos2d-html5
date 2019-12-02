import { ccNode } from "./CCNode";
import { BLEND_SRC, BLEND_DST, Color, BlendFunc } from "../platform/index";
import { game, RENDER_TYPE } from "../../../startup/CCGame";
import { RenderCmd } from "./CCRenderCmd";
import { log, _LogInfos } from "../../../startup/CCDebugger";
import { AtlasNodeRenderCmd } from "./CCAtlasNodeRenderCmd";
import { AtlasNode_CanvasRenderCmd } from "./CCAtlasNodeCanvasRenderCmd";
import { AtlasNode_WebGLRenderCmd } from "./CCAtlasNodeWebGLRenderCmd";
import { Texture2D } from "../textures/CCTexture2D";
import { TextureAtlas } from "../textures/CCTextureAtlas";
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
    textureAtlas: TextureAtlas = null;
    quadsToDraw: number = 0;

    //! chars per row
    _itemsPerRow: number = 0;
    //! chars per column
    _itemsPerColumn: number = 0;
    //! width of each char
    _itemWidth: number = 0;
    //! height of each char
    _itemHeight: number = 0;

    // protocol variables
    _opacityModifyRGB: boolean = false;
    _blendFunc: BlendFunc = null;

    // This variable is only used for CCLabelAtlas FPS display. So plz don't modify its value.
    _ignoreContentScaleFactor: boolean = false;
    _className: string = "AtlasNode";

    _texture: Texture2D = null;
   // _textureForCanvas = null;

    getRenderCmd(): AtlasNodeRenderCmd {
        return <AtlasNodeRenderCmd>this._renderCmd;
    }


    /**
     * <p>Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.</p>
     * @param {String} tile
     * @param {Number} tileWidth
     * @param {Number} tileHeight
     * @param {Number} itemsToRender
     */
    constructor(tile: string, tileWidth: number, tileHeight: number, itemsToRender?: number) {
        super();

        this._blendFunc = new BlendFunc(BLEND_SRC, BLEND_DST);
        this._ignoreContentScaleFactor = false;
        itemsToRender !== undefined && this.initWithTileFileAsync(tile, tileWidth, tileHeight, itemsToRender);
    }



    _createRenderCmd(): RenderCmd {
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
    getColor(): Color {
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
    setOpacityModifyRGB(value: boolean) {
        var oldColor = this.color;
        this._opacityModifyRGB = value;
        this.setColor(oldColor);
    }

    /**
     * Get whether color should be changed with the opacity value
     * @function
     * @return {Boolean}
     */
    isOpacityModifyRGB(): boolean {
        return this._opacityModifyRGB;
    }

    /**
     * Get node's blend function
     * @function
     * @return {cc.BlendFunc}
     */
    getBlendFunc(): BlendFunc {
        return this._blendFunc;
    }

    /**
     * Set node's blend function
     * This function accept either cc.BlendFunc object or source value and destination value
     * @function
     * @param {Number | cc.BlendFunc} src
     * @param {Number} dst
     */
    setBlendFunc(src: BlendFunc): void;
    setBlendFunc(src: number, dst?: number): void;
    setBlendFunc(src: number | BlendFunc, dst?: number): void {
        if (dst === undefined) {
            src = <BlendFunc>src;
            this._blendFunc = src;
        }
        else {
            src = <number>src;
            this._blendFunc = new BlendFunc(src, dst);
        }
    }

    /**
     * Set the atlas texture
     * @function
     * @param {cc.TextureAtlas} value The texture
     */
    setTextureAtlas(value: TextureAtlas): void {
        this.textureAtlas = value;
    }

    /**
     * Get the atlas texture
     * @function
     * @return {cc.TextureAtlas}
     */
    getTextureAtlas(): TextureAtlas {
        return this.textureAtlas;
    }

    /**
     * Get the number of quads to be rendered
     * @function
     * @return {Number}
     */
    getQuadsToDraw(): number {
        return this.quadsToDraw;
    }

    /**
     * Set the number of quads to be rendered
     * @function
     * @param {Number} quadsToDraw
     */
    setQuadsToDraw(quadsToDraw: number) {
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
    async initWithTileFileAsync(tile: string, tileWidth: number, tileHeight: number, itemsToRender: number): Promise<boolean> {
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
    initWithTexture(texture: Texture2D, tileWidth: number, tileHeight: number, itemsToRender: number): boolean {
        return this.getRenderCmd().initWithTexture(texture, tileWidth, tileHeight, itemsToRender);
    }

    /**
     * Set node's color
     * @function
     * @param {cc.Color} color Color object created with cc.color(r, g, b).
     */
    setColor(color: Color): void {
        this.getRenderCmd().setColor(color);
    }

    /**
     * Set node's opacity
     * @function
     * @param {Number} opacity The opacity value
     */
    setOpacity(opacity: number) {
        this.getRenderCmd().setOpacity(opacity);
    }

    /**
     * Get the current texture
     * @function
     * @return {cc.Texture2D}
     */
    getTexture(): Texture2D {
        return this._texture;
    }

    /**
     * Replace the current texture with a new one
     * @function
     * @param {cc.Texture2D} texture    The new texture
     */
    setTexture(texture: Texture2D): void {
        this._texture = texture;
    }

    _setIgnoreContentScaleFactor(ignoreContentScaleFactor: boolean): void {
        this._ignoreContentScaleFactor = ignoreContentScaleFactor;
    }



    get opacity(): number {
        return this.getOpacity();
    }
    set opacity(value: number) {
        this.setOpacity(value);
    }
    get color(): Color {
        return this.getColor();
    }
    set color(value: Color) {
        this.setColor(value);
    }
    get texture(): Texture2D {
        return this.getTexture();
    }
    set texture(value: Texture2D) {
        this.setTexture(value);
    }


    get renderCmdWebGl(): AtlasNode_WebGLRenderCmd {
        return <AtlasNode_WebGLRenderCmd>this._renderCmd;
    }
    get renderCmdCanvas(): AtlasNode_CanvasRenderCmd {
        return <AtlasNode_CanvasRenderCmd>this._renderCmd;
    }

}