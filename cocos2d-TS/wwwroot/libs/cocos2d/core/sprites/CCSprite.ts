import { ccNode } from "../base-nodes/index";
import { EventHelper } from "../event-manager/index";
import { Rect, p, rect, Point, size, Size } from "../cocoa/index";
import { BlendFunc, BLEND_SRC, BLEND_DST, V3F_C4B_T2F_Quad, rectPointsToPixels, pointPointsToPixels, sizePointsToPixels, Color } from "../platform/index";
import { TextureAtlas, Texture2D, textureCache } from "../textures/index";
import { assert, _LogInfos, log } from "../../../startup/CCDebugger";
import { _dirtyFlags } from "../base-nodes/CCRenderCmd";
import { SpriteRenderCmd } from "./CCSpriteRenderCmd";
import { game, RENDER_TYPE } from "../../../startup/CCGame";

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
 * <p>cc.Sprite is a 2d image ( http://en.wikipedia.org/wiki/Sprite_(computer_graphics) )  <br/>
 *
 * cc.Sprite can be created with an image, or with a sub-rectangle of an image.  <br/>
 *
 * If the parent or any of its ancestors is a cc.SpriteBatchNode then the following features/limitations are valid   <br/>
 *    - Features when the parent is a cc.BatchNode: <br/>
 *        - MUCH faster rendering, specially if the cc.SpriteBatchNode has many children. All the children will be drawn in a single batch.  <br/>
 *
 *    - Limitations   <br/>
 *        - Camera is not supported yet (eg: CCOrbitCamera action doesn't work)  <br/>
 *        - GridBase actions are not supported (eg: CCLens, CCRipple, CCTwirl) <br/>
 *        - The Alias/Antialias property belongs to CCSpriteBatchNode, so you can't individually set the aliased property.  <br/>
 *        - The Blending function property belongs to CCSpriteBatchNode, so you can't individually set the blending function property. <br/>
 *        - Parallax scroller is not supported, but can be simulated with a "proxy" sprite.        <br/>
 *
 *  If the parent is an standard cc.Node, then cc.Sprite behaves like any other cc.Node:      <br/>
 *    - It supports blending functions    <br/>
 *    - It supports aliasing / antialiasing    <br/>
 *    - But the rendering will be slower: 1 draw per children.   <br/>
 *
 * The default anchorPoint in cc.Sprite is (0.5, 0.5). </p>
 * @class
 * @extends cc.Node
 *
 * @param {String|cc.SpriteFrame|HTMLImageElement|cc.Texture2D} fileName  The string which indicates a path to image file, e.g., "scene1/monster.png".
 * @param {cc.Rect} [rect]  Only the contents inside rect of pszFileName's texture will be applied for this sprite.
 * @param {Boolean} [rotated] Whether or not the texture rectangle is rotated.
 * @example
 *
 * 1.Create a sprite with image path and rect
 * var sprite1 = new cc.Sprite("res/HelloHTML5World.png");
 * var sprite2 = new cc.Sprite("res/HelloHTML5World.png",cc.rect(0,0,480,320));
 *
 * 2.Create a sprite with a sprite frame name. Must add "#" before frame name.
 * var sprite = new cc.Sprite('#grossini_dance_01.png');
 *
 * 3.Create a sprite with a sprite frame
 * var spriteFrame = cc.spriteFrameCache.getSpriteFrame("grossini_dance_01.png");
 * var sprite = new cc.Sprite(spriteFrame);
 *
 * 4.Create a sprite with an existing texture contained in a CCTexture2D object
 *      After creation, the rect will be the size of the texture, and the offset will be (0,0).
 * var texture = cc.textureCache.addImage("HelloHTML5World.png");
 * var sprite1 = new cc.Sprite(texture);
 * var sprite2 = new cc.Sprite(texture, cc.rect(0,0,480,320));
 *
 * @property {Boolean}              dirty               - Indicates whether the sprite needs to be updated.
 * @property {Boolean}              flippedX            - Indicates whether or not the sprite is flipped on x axis.
 * @property {Boolean}              flippedY            - Indicates whether or not the sprite is flipped on y axis.
 * @property {Number}               offsetX             - <@readonly> The offset position on x axis of the sprite in texture. Calculated automatically by editors like Zwoptex.
 * @property {Number}               offsetY             - <@readonly> The offset position on x axis of the sprite in texture. Calculated automatically by editors like Zwoptex.
 * @property {Number}               atlasIndex          - The index used on the TextureAtlas.
 * @property {cc.Texture2D}         texture             - Texture used to render the sprite.
 * @property {Boolean}              textureRectRotated  - <@readonly> Indicate whether the texture rectangle is rotated.
 * @property {cc.TextureAtlas}      textureAtlas        - The weak reference of the cc.TextureAtlas when the sprite is rendered using via cc.SpriteBatchNode.
 * @property {cc.SpriteBatchNode}   batchNode           - The batch node object if this sprite is rendered by cc.SpriteBatchNode.
 * @property {cc.V3F_C4B_T2F_Quad}  quad                - <@readonly> The quad (tex coords, vertex coords and color) information.
 */

export class Sprite extends ccNode {
    private eventHandler = new EventHelper(this);

    addEventListener(type: string, listener: () => void, target?: any): void {
        this.eventHandler.addEventListener(type, listener, target);
    }
    hasEventListener(type: string, listener: () => void, target?: any): boolean {
        return this.eventHandler.hasEventListener(type, listener, target);
    }
    removeEventListener(type: string, listener: () => void, target?: any): void {
        this.eventHandler.removeEventListener(type, listener, target);
    }
    removeEventTarget(type: string, listener: () => void, target?: any): void {
        this.eventHandler.removeEventTarget(type, listener, target);
    }
    dispatchEvent(event: string, clearAfterDispatch?: boolean): void {
        this.eventHandler.dispatchEvent(event, clearAfterDispatch);
    }

    dirty = false;
    atlasIndex = 0;
    textureAtlas: TextureAtlas = null;
    _loader: Sprite_LoadManager;

    _batchNode: SpriteBatchNode = null;
    _recursiveDirty:boolean = null; //Whether all of the sprite's children needs to be updated
    _hasChildren: boolean = null; //Whether the sprite contains children
    _shouldBeHidden = false; //should not be drawn because one of the ancestors is not visible
    //_transformToBatch = null;

    //
    // Data used when the sprite is self-rendered
    //
    _blendFunc: BlendFunc = null; //It's required for CCTextureProtocol inheritance
    _texture: Texture2D = null; //cc.Texture2D object that is used to render the sprite

    //
    // Shared data
    //
    // texture
    _rect: Rect = null; //Rectangle of cc.Texture2D
    _rectRotated = false; //Whether the texture is rotated

    // Offset Position (used by Zwoptex)
    _offsetPosition: Point = null; // absolute
    _unflippedOffsetPositionFromCenter:Point = null;

    _opacityModifyRGB = false;

    // image is flipped
    _flippedX = false; //Whether the sprite is flipped horizontally or not.
    _flippedY = false; //Whether the sprite is flipped vertically or not.

    _textureLoaded = false;
    _className = "Sprite";


    constructor(fileName?: string | Texture2D | SpriteFrame | HTMLImageElement | HTMLCanvasElement, rectArea?: Rect, rotated?: boolean) {
        super();

        // default transform anchor: center
        this.setAnchorPoint(0.5, 0.5);

        this._loader = new Sprite_LoadManager();
        this._shouldBeHidden = false;
        this._offsetPosition = p(0, 0);
        this._unflippedOffsetPositionFromCenter = p(0, 0);
        this._blendFunc = new BlendFunc(BLEND_SRC, BLEND_DST);
        this._rect = rect(0, 0, 0, 0);

        this._softInitAsync(fileName, rectArea, rotated);
    }

    get renderCmd(): SpriteRenderCmd {
        return <SpriteRenderCmd>super.renderCmd;
    }

    /**
     * Returns whether the texture have been loaded
     * @returns {boolean}
     */
    textureLoaded(): boolean {
        return this._textureLoaded;
    }
    /**
      * Returns whether or not the Sprite needs to be updated in the Atlas
      * @return {Boolean} True if the sprite needs to be updated in the Atlas, false otherwise.
      */
    isDirty(): boolean {
        return this.dirty;
    }
    /**
     * Makes the sprite to be updated in the Atlas.
     * @param {Boolean} bDirty
     */
    setDirty(bDirty: boolean) {
        this.dirty = bDirty;
    }

    /**
     * Returns whether or not the texture rectangle is rotated.
     * @return {Boolean}
     */
    isTextureRectRotated(): boolean {
        return this._rectRotated;
    }
    /**
     * Returns the index used on the TextureAtlas.
     * @return {Number}
     */
    getAtlasIndex(): number {
        return this.atlasIndex;
    }
    /**
     * Sets the index used on the TextureAtlas.
     * @warning Don't modify this value unless you know what you are doing
     * @param {Number} atlasIndex
     */
    setAtlasIndex(atlasIndex: number): void {
        this.atlasIndex = atlasIndex;
    }
    /**
     * Returns the rect of the cc.Sprite in points
     * @return {cc.Rect}
     */
    getTextureRect(): Rect {
        return rect(this._rect);
    }

    /**
     * Returns the weak reference of the cc.TextureAtlas when the sprite is rendered using via cc.SpriteBatchNode
     * @return {cc.TextureAtlas}
     */
    getTextureAtlas(): TextureAtlas {
        return this.textureAtlas;
    }
    /**
     * Sets the weak reference of the cc.TextureAtlas when the sprite is rendered using via cc.SpriteBatchNode
     * @param {cc.TextureAtlas} textureAtlas
     */
    setTextureAtlas(textureAtlas: TextureAtlas): void {
        this.textureAtlas = textureAtlas;
    }
    /**
     * Returns the offset position of the sprite. Calculated automatically by editors like Zwoptex.
     * @return {cc.Point}
     */
    getOffsetPosition(): Point {
        return p(this._offsetPosition);
    }


    _getOffsetX(): number {
        return this._offsetPosition.x;
    }
    _getOffsetY(): number {
        return this._offsetPosition.y;
    }
    /**
     * Returns the blend function
     * @return {cc.BlendFunc}
     */
    getBlendFunc(): BlendFunc {
        return this._blendFunc;
    }
    /**
     * Initializes a sprite with a SpriteFrame. The texture and rect in SpriteFrame will be applied on this sprite.<br/>
     * Please pass parameters to the constructor to initialize the sprite, do not call this function yourself,
     * @param {cc.SpriteFrame} spriteFrame A CCSpriteFrame object. It should includes a valid texture and a rect
     * @return {Boolean}  true if the sprite is initialized properly, false otherwise.
     */
    private initWithSpriteFrame(spriteFrame: SpriteFrame): boolean {
        assert(spriteFrame, _LogInfos.Sprite_initWithSpriteFrame);
        return this.setSpriteFrame(spriteFrame);
    }

    /**
     * Initializes a sprite with a sprite frame name. <br/>
     * A cc.SpriteFrame will be fetched from the cc.SpriteFrameCache by name.  <br/>
     * If the cc.SpriteFrame doesn't exist it will raise an exception. <br/>
     * Please pass parameters to the constructor to initialize the sprite, do not call this function yourself.
     * @param {String} spriteFrameName A key string that can fected a valid cc.SpriteFrame from cc.SpriteFrameCache
     * @return {Boolean} true if the sprite is initialized properly, false otherwise.
     * @example
     * var sprite = new cc.Sprite();
     * sprite.initWithSpriteFrameName("grossini_dance_01.png");
     */
    private initWithSpriteFrameName(spriteFrameName: string): boolean {
        assert(spriteFrameName == null, _LogInfos.Sprite_initWithSpriteFrameName);
        var frame = spriteFrameCache.getSpriteFrame(spriteFrameName);
        assert(frame == null, spriteFrameName + _LogInfos.Sprite_initWithSpriteFrameName1);
        return this.initWithSpriteFrame(frame);
    }
    /**
     * Tell the sprite to use batch node render.
     * @param {cc.SpriteBatchNode} batchNode
     */
    useBatchNode(batchNode: SpriteBatchNode) {
    }
    /**
     * <p>
     *    set the vertex rect.<br/>
     *    It will be called internally by setTextureRect.                           <br/>
     *    Useful if you want to create 2x images from SD images in Retina Display.  <br/>
     *    Do not call it manually. Use setTextureRect instead.  <br/>
     *    (override this method to generate "double scale" sprites)
     * </p>
     * @param {cc.Rect} rect
     */
    setVertexRect(rect: Rect): void {
        var locRect = this._rect;
        locRect.x = rect.x;
        locRect.y = rect.y;
        locRect.width = rect.width;
        locRect.height = rect.height;
        this._renderCmd.setDirtyFlag(_dirtyFlags.transformDirty);
    }
    //
    // cc.Node property overloads
    //

    /**
     * Sets whether the sprite should be flipped horizontally or not.
     * @param {Boolean} flippedX true if the sprite should be flipped horizontally, false otherwise.
     */
    setFlippedX(flippedX: boolean): void {
        if (this._flippedX !== flippedX) {
            this._flippedX = flippedX;
            this.setTextureRect(this._rect, this._rectRotated, this._contentSize);
            this.setNodeDirty(true);
        }
    }
    /**
     * Sets whether the sprite should be flipped vertically or not.
     * @param {Boolean} flippedY true if the sprite should be flipped vertically, false otherwise.
     */
    setFlippedY(flippedY: boolean): void {
        if (this._flippedY !== flippedY) {
            this._flippedY = flippedY;
            this.setTextureRect(this._rect, this._rectRotated, this._contentSize);
            this.setNodeDirty(true);
        }
    }
    /**
     * <p>
     * Returns the flag which indicates whether the sprite is flipped horizontally or not.                      <br/>
     *                                                                                                              <br/>
     * It only flips the texture of the sprite, and not the texture of the sprite's children.                       <br/>
     * Also, flipping the texture doesn't alter the anchorPoint.                                                    <br/>
     * If you want to flip the anchorPoint too, and/or to flip the children too use:                                <br/>
     *      sprite.setScaleX(sprite.getScaleX() * -1);  <p/>
     * @return {Boolean} true if the sprite is flipped horizontally, false otherwise.
     */
    isFlippedX(): boolean {
        return this._flippedX;
    }

    /**
     * <p>
     *     Return the flag which indicates whether the sprite is flipped vertically or not.                         <br/>
     *                                                                                                              <br/>
     *      It only flips the texture of the sprite, and not the texture of the sprite's children.                  <br/>
     *      Also, flipping the texture doesn't alter the anchorPoint.                                               <br/>
     *      If you want to flip the anchorPoint too, and/or to flip the children too use:                           <br/>
     *         sprite.setScaleY(sprite.getScaleY() * -1); <p/>
     * @return {Boolean} true if the sprite is flipped vertically, false otherwise.
     */
    isFlippedY(): boolean {
        return this._flippedY;
    }
    //
    // RGBA protocol
    //
    /**
     * Sets whether opacity modify color or not.
     * @function
     * @param {Boolean} modify
     */
    setOpacityModifyRGB(modify: boolean): void {
        if (this._opacityModifyRGB !== modify) {
            this._opacityModifyRGB = modify;
            this.renderCmd._setColorDirty();
        }
    }
    /**
     * Returns whether opacity modify color or not.
     * @return {Boolean}
     */
    isOpacityModifyRGB(): boolean {
        return this._opacityModifyRGB;
    }
    // Animation

    /**
     * Changes the display frame with animation name and index.<br/>
     * The animation name will be get from the CCAnimationCache
     * @param {String} animationName
     * @param {Number} frameIndex
     */
    setDisplayFrameWithAnimationName(animationName: string, frameIndex: number): void {
        assert(animationName == null, _LogInfos.Sprite_setDisplayFrameWithAnimationName_3);

        var cache = animationCache.getAnimation(animationName);
        if (!cache) {
            log(_LogInfos.Sprite_setDisplayFrameWithAnimationName);
            return;
        }
        var animFrame = cache.getFrames()[frameIndex];
        if (!animFrame) {
            log(_LogInfos.Sprite_setDisplayFrameWithAnimationName_2);
            return;
        }
        this.setSpriteFrameAsync(animFrame.getSpriteFrame());
    }
    /**
     * Returns the batch node object if this sprite is rendered by cc.SpriteBatchNode
     * @returns {cc.SpriteBatchNode|null} The cc.SpriteBatchNode object if this sprite is rendered by cc.SpriteBatchNode, null if the sprite isn't used batch node.
     */
    getBatchNode(): SpriteBatchNode {
        return this._batchNode;
    }

    // CCTextureProtocol
    /**
     * Returns the texture of the sprite node
     * @returns {cc.Texture2D}
     */
    getTexture(): Texture2D {
        return this._texture;
    }

    private async _softInitAsync(fileName: string | Texture2D | SpriteFrame | HTMLImageElement | HTMLCanvasElement, rect?: Rect, rotated?: boolean): Promise<void> {
        if (fileName === undefined)
            await this.initAsync();
        else if (typeof fileName === 'string') {
            if (fileName[0] === "#") {
                // Init with a sprite frame name
                var frameName = fileName.substr(1, fileName.length - 1);
                var spriteFrame = spriteFrameCache.getSpriteFrame(frameName);
                if (spriteFrame)
                    this.initWithSpriteFrame(spriteFrame);
                else
                    log("%s does not exist", fileName);
            } else {
                await this.initAsync(fileName, rect);
            }
        } else if (typeof fileName === "object") {
            if (fileName instanceof Texture2D) {
                // Init  with texture and rect
                await this.initWithTextureAsync(fileName, rect, rotated);
            } else if (fileName instanceof SpriteFrame) {
                // Init with a sprite frame
                this.initWithSpriteFrame(fileName);
            } else if ((fileName instanceof HTMLImageElement) || (fileName instanceof HTMLCanvasElement)) {
                // Init with a canvas or image element
                var texture2d = Texture2D.create();
                texture2d.initWithElement(fileName);
                texture2d.handleLoadedTexture();
                await this.initWithTextureAsync(texture2d);
            }
        }
    }

    /**
     * Returns the quad (tex coords, vertex coords and color) information.
     * @return {cc.V3F_C4B_T2F_Quad|null} Returns a cc.V3F_C4B_T2F_Quad object when render mode is WebGL, returns null when render mode is Canvas.
     */
    getQuad(): V3F_C4B_T2F_Quad {
        return null;
    }
    /**
     * conforms to cc.TextureProtocol protocol
     * @function
     * @param {Number|cc.BlendFunc} src
     * @param {Number} dst
     */
    setBlendFunc(src: BlendFunc | number, dst?: number) {
        var locBlendFunc = this._blendFunc;
        if (dst === undefined) {
            src = <BlendFunc>src;
            locBlendFunc.src = src.src;
            locBlendFunc.dst = src.dst;
        } else {
            src = <number>src;
            locBlendFunc.src = src;
            locBlendFunc.dst = dst;
        }
        this.renderCmd.updateBlendFunc(locBlendFunc);
    }
    /**
     * Initializes an empty sprite with nothing init.<br/>
     * Please pass parameters to the constructor to initialize the sprite, do not call this function yourself.
     * @function
     * @return {Boolean}
     */
    async initAsync(fileName?: string | Texture2D | SpriteFrame | HTMLImageElement | HTMLCanvasElement, rectArea?: Rect): Promise<boolean> {
        var _t = this;
        if (arguments.length > 0)
            return await _t.initWithFileAsync(fileName, rectArea);

        await super.initAsync();
        _t.dirty = _t._recursiveDirty = false;

        _t._blendFunc.src = BLEND_SRC;
        _t._blendFunc.dst = BLEND_DST;

        _t.texture = null;
        _t._flippedX = _t._flippedY = false;

        // default transform anchor: center
        _t.anchorX = 0.5;
        _t.anchorY = 0.5;

        // zwoptex default values
        _t._offsetPosition.x = 0;
        _t._offsetPosition.y = 0;
        _t._hasChildren = false;

        // updated in "useSelfRender"
        // Atlas: TexCoords
        _t.setTextureRect(rect(0, 0, 0, 0), false, size(0, 0));
        return true;
    }


    /**
     * <p>
     *     Initializes a sprite with an image filename.<br/>
     *
     *     This method will find pszFilename from local file system, load its content to CCTexture2D,<br/>
     *     then use CCTexture2D to create a sprite.<br/>
     *     After initialization, the rect used will be the size of the image. The offset will be (0,0).<br/>
     *     Please pass parameters to the constructor to initialize the sprite, do not call this function yourself.
     * </p>
     * @param {String} filename The path to an image file in local file system
     * @param {cc.Rect} rect The rectangle assigned the content area from texture.
     * @return {Boolean} true if the sprite is initialized properly, false otherwise.
     */
    private async initWithFileAsync(filename: string, rectArea: Rect): Promise<boolean> {
        assert(filename==null, _LogInfos.Sprite_initWithFile);

        var tex = textureCache.getTextureForKey(filename);
        if (!tex) {
            tex = await textureCache.addImageAsync(filename);
        }

        if (!tex.isLoaded()) {
            //this._loader.clear();
            await this._loader.once(tex);
            await this.initWithFileAsync(filename, rectArea);
            this.dispatchEvent("load");
            return true;
        }

        if (!rectArea) {
            var size = tex.getContentSize();
            rectArea = rect(0, 0, size.width, size.height);
        }
        return await this.initWithTextureAsync(tex, rectArea);
    }

    /**
     * Initializes a sprite with a texture and a rect in points, optionally rotated.  <br/>
     * After initialization, the rect used will be the size of the texture, and the offset will be (0,0).<br/>
     * Please pass parameters to the constructor to initialize the sprite, do not call this function yourself.
     * @function
     * @param {cc.Texture2D|HTMLImageElement|HTMLCanvasElement} texture A pointer to an existing CCTexture2D object. You can use a CCTexture2D object for many sprites.
     * @param {cc.Rect} [rect] Only the contents inside rect of this texture will be applied for this sprite.
     * @param {Boolean} [rotated] Whether or not the texture rectangle is rotated.
     * @param {Boolean} [counterclockwise=true] Whether or not the texture rectangle rotation is counterclockwise (texture package is counterclockwise, spine is clockwise).
     * @return {Boolean} true if the sprite is initialized properly, false otherwise.
     */
    private async initWithTextureAsync(texture: Texture2D, rectArea?: Rect, rotated?: boolean, counterclockwise: boolean = true): Promise<boolean> {
        var _t = this;
        assert(arguments.length !== 0, _LogInfos.CCSpriteBatchNode_initWithTexture);
        //this._loader.clear();

        _t._textureLoaded = texture.isLoaded();
        if (!_t._textureLoaded) {
            await this._loader.once(texture);
            await this.initWithTextureAsync(texture, rectArea, rotated, counterclockwise);
            this.dispatchEvent("load");

            return false;
        }

        rotated = rotated || false;
        texture = this.renderCmd._handleTextureForRotatedTexture(texture, rectArea, rotated, counterclockwise);

        var pResult = await super.initAsync();
        if (!pResult)
            return false;

        _t._batchNode = null;
        _t._recursiveDirty = false;
        _t.dirty = false;
        _t._opacityModifyRGB = true;

        _t._blendFunc.src = BLEND_SRC;
        _t._blendFunc.dst = BLEND_DST;

        _t._flippedX = _t._flippedY = false;

        // zwoptex default values
        _t._offsetPosition.x = 0;
        _t._offsetPosition.y = 0;
        _t._hasChildren = false;

        _t._rectRotated = rotated;
        if (rectArea) {
            _t._rect.x = rectArea.x;
            _t._rect.y = rectArea.y;
            _t._rect.width = rectArea.width;
            _t._rect.height = rectArea.height;
        }

        if (!rectArea)
            rectArea = rect(0, 0, texture.width, texture.height);

        this.renderCmd._checkTextureBoundary(texture, rectArea, rotated);

        await _t.setTextureAsync(texture);
        _t.setTextureRect(rectArea, rotated);

        // by default use "Self Render".
        // if the sprite is added to a batchnode, then it will automatically switch to "batchnode Render"
        _t.setBatchNode(null);
        return true;
    }

    /**
     * Updates the texture rect of the CCSprite in points.
     * @function
     * @param {cc.Rect} rect a rect of texture
     * @param {Boolean} [rotated] Whether or not the texture is rotated
     * @param {cc.Size} [untrimmedSize] The original pixels size of the texture
     * @param {Boolean} [needConvert] contentScaleFactor switch
     */
    setTextureRect(rect: Rect, rotated?: boolean, untrimmedSize?: Size, needConvert?: boolean) {
        var _t = this;
        _t._rectRotated = rotated || false;
        _t.setContentSize(untrimmedSize || rect);

        _t.setVertexRect(rect);
        _t.renderCmd._setTextureCoords(rect, needConvert);

        var relativeOffsetX = _t._unflippedOffsetPositionFromCenter.x, relativeOffsetY = _t._unflippedOffsetPositionFromCenter.y;
        if (_t._flippedX)
            relativeOffsetX = -relativeOffsetX;
        if (_t._flippedY)
            relativeOffsetY = -relativeOffsetY;
        var locRect = _t._rect;
        _t._offsetPosition.x = relativeOffsetX + (_t._contentSize.width - locRect.width) / 2;
        _t._offsetPosition.y = relativeOffsetY + (_t._contentSize.height - locRect.height) / 2;
    }


    // BatchNode methods

    /**
     * Add child to sprite (override cc.Node)
     * @function
     * @param {cc.Sprite} child
     * @param {Number} localZOrder  child's zOrder
     * @param {number|String} [tag] child's tag
     * @override
     */
    addChild(child: Sprite, localZOrder?: number, tag?: number | string):void {
        assert(child != null, _LogInfos.CCSpriteBatchNode_addChild_2);

        if (localZOrder == null)
            localZOrder = child._localZOrder;
        if (tag == null)
            tag = child.tag;

        if (this.renderCmd._setBatchNodeForAddChild(child)) {
            //cc.Node already sets isReorderChildDirty_ so this needs to be after batchNode check
            super.addChild(child, localZOrder, tag);
            this._hasChildren = true;
        }
    }

    // Frames
    /**
     * Sets a new sprite frame to the sprite.
     * @function
     * @param {cc.SpriteFrame|String} newFrame
     */
    async setSpriteFrameAsync(newFrame: SpriteFrame | string): Promise<boolean> {
        var _t = this;
        if (typeof newFrame === 'string') {
            newFrame = spriteFrameCache.getSpriteFrame(newFrame);
            assert(newFrame!=null, _LogInfos.Sprite_setSpriteFrame);
        }
        //this._loader.clear();

        this.setNodeDirty(true);

        // update rect
        var pNewTexture = newFrame.getTexture();
        _t._textureLoaded = newFrame.textureLoaded();
        //this._loader.clear();
        if (!_t._textureLoaded) {
            await this._loader.once(pNewTexture);
            await this.setSpriteFrameAsync(newFrame);
            this.dispatchEvent("load");
            return true;
        }

        var frameOffset = newFrame.getOffset();
        _t._unflippedOffsetPositionFromCenter.x = frameOffset.x;
        _t._unflippedOffsetPositionFromCenter.y = frameOffset.y;

        if (pNewTexture !== _t._texture) {
            this.renderCmd._setTexture(pNewTexture);
            _t.setColor(_t._realColor);
        }
        _t.setTextureRect(newFrame.getRect(), newFrame.isRotated(), newFrame.getOriginalSize());
    }
    /**
     * Returns whether or not a cc.SpriteFrame is being displayed
     * @function
     * @param {cc.SpriteFrame} frame
     * @return {Boolean}
     */
    isFrameDisplayed(frame: SpriteFrame): boolean {
        return this.renderCmd.isFrameDisplayed(frame);
    }
    /**
     * Returns the current displayed frame.
     * @return {cc.SpriteFrame}
     */
    getSpriteFrame(): SpriteFrame {
        return new SpriteFrame(this._texture,
            rectPointsToPixels(this._rect),
            this._rectRotated,
            pointPointsToPixels(this._unflippedOffsetPositionFromCenter),
            sizePointsToPixels(this._contentSize));
    }
    /**
     * Sets the batch node to sprite
     * @function
     * @param {cc.SpriteBatchNode|null} spriteBatchNode
     * @example
     *  var batch = new cc.SpriteBatchNode("Images/grossini_dance_atlas.png", 15);
     *  var sprite = new cc.Sprite(batch.texture, cc.rect(0, 0, 57, 57));
     *  batch.addChild(sprite);
     *  layer.addChild(batch);
     */
    setBatchNode(spriteBatchNode: SpriteBatchNode): void {
    }

    // CCTextureProtocol
    /**
     * Sets the texture of sprite
     * @function
     * @param {cc.Texture2D|String} texture
     */
    async setTextureAsync(texture: Texture2D | string):Promise<boolean> {
        if (!texture)
            return this.renderCmd._setTexture(null);

        var tex: Texture2D = null;
        //CCSprite.cpp 327 and 338
        var isFileName = (typeof texture === 'string');

        if (isFileName) {
            tex = <Texture2D>await textureCache.addImageAsync(<string>texture);
        } else {
            tex = <Texture2D>texture;
        }

        //this._loader.clear();
        if (!tex._textureLoaded) {
            // wait for the load to be set again
            await this._loader.once(tex)
            await this.setTextureAsync(texture);
            this.dispatchEvent("load");
            return true;
        }

        this.renderCmd._setTexture(tex);
        if (isFileName)
            this._changeRectWithTexture(tex);
        this.setColor(this._realColor);
        this._textureLoaded = true;
    }

    _changeRectWithTexture(texture: Texture2D): void {
        var contentSize = texture._contentSize;
        var rectArea = rect(
            0, 0,
            contentSize.width, contentSize.height
        );
        this.setTextureRect(rectArea);
    }
    _createRenderCmd(): SpriteRenderCmd {
        if (game.renderType === RENDER_TYPE.CANVAS)
            return new Sprite_CanvasRenderCmd(this);
        else
            return new Sprite_WebGLRenderCmd(this);
    }



    get opacityModifyRGB():boolean {
        return this.isOpacityModifyRGB();
    }
    set opacityModifyRGB(value: boolean) {
        this.setOpacityModifyRGB(value);
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
    get flippedX(): boolean {
        return this.isFlippedX();
    }
    set flippedX(value: boolean) {
        this.setFlippedX(value);
    }
    get flippedY(): boolean {
        return this.isFlippedY();
    }
    set flippedY(value: boolean) {
        this.setFlippedY(value);
    }
    get offsetX(): number {
        return this._getOffsetX();
    }
    get offsetY(): number {
        return this._getOffsetY();
    }
    get texture(): Texture2D {
        return this.getTexture();
    }
    set texture(value: Texture2D) {
        this.setTextureAsync(value);
    }
    get textureRectRotated(): boolean {
        return this.isTextureRectRotated();
    }
    get batchNode(): SpriteBatchNode {
        return this.getBatchNode();
    }
    set batchNode(value: SpriteBatchNode) {
        this.setBatchNode(value);
    }


}

export interface ISpriteLoadEntry {
    source: Texture2D;
    listener: (() => void);
    target: any;
}

export class Sprite_LoadManager {
    //list: Array<ISpriteLoadEntry> = null;

    constructor() {
        //this.list = new Array<ISpriteLoadEntry>();
    }

    //add(source: Texture2D, callback: (() => void), target?:any) {
    //    if (!source || !source.addEventListener) return;
    //    source.addEventListener('load', callback, target);
    //    this.list.push({
    //        source: source,
    //        listener: callback,
    //        target: target
    //    });
    //}
    once(source: Texture2D): Promise<void> {
        var p = new Promise<void>((resolve, reject) => {
            if (!source || !source.addEventListener) {
                resolve();
                return;
            }
            var cb = () => {
                source.removeEventListener('load', cb);
                resolve();
            }
            source.addEventListener('load', cb);
        });
        return p;
    }
    //clear():void {
    //    while (this.list.length > 0) {
    //        var item = this.list.pop();
    //        item.source.removeEventListener('load', item.listener, item.target);
    //    }
    //}


}