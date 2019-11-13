import { AtlasNode } from './CCAtlasNode';
import { RenderCmd } from './CCRenderCmd';
import { CanvasRenderCmd } from './CCNodeCanvasRenderCmd';
import { ccNode } from './CCNode';
import { Color } from '../platform/index';
import { AtlasNodeRenderCmd } from './CCAtlasNodeRenderCmd';
import { log, _LogInfos } from '../../../startup/CCDebugger';
import { rect } from '../cocoa/index';
import { Texture2D } from "../textures/CCTexture2D";
import { Texture2DCanvas } from '../textures/TexturesCanvas';

/****************************************************************************
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


//declare module 'CCAtlasNode' { // same name than in the import!
//    export interface AtlasNode {
//        CanvasRenderCmd: (renderable: AtlasNode) => AtlasCanvasRenderCmd;
//    }
//}
///**
// * cc.AtlasNode's rendering objects of Canvas
// */
//AtlasNode.prototype.CanvasRenderCmd = (renderable: AtlasNode): AtlasCanvasRenderCmd => {
//    return new AtlasCanvasRenderCmd(renderable);
//}

export class AtlasNodeCanvasRenderCmd extends CanvasRenderCmd implements AtlasNodeRenderCmd {

    _colorUnmodified: Color = null;
    _textureToRender: Texture2D = null;


    constructor(renderable:AtlasNode) {
        super(renderable);
        this._needDraw = false;
        this._colorUnmodified = Color.WHITE;
        this._textureToRender = null;
    }
    initWithTexture(texture: Texture2D, tileWidth: number, tileHeight: number, itemsToRender: number): boolean {
        var node = <AtlasNode>this._node;
        node._itemWidth = tileWidth;
        node._itemHeight = tileHeight;

        node._opacityModifyRGB = true;
        node._texture = texture;
        if (!node._texture) {
            log(_LogInfos.AtlasNode__initWithTexture);
            return false;
        }
        this._textureToRender = texture;
        this._calculateMaxItems();

        node.quadsToDraw = itemsToRender;
        return true;
    }
    setColor(color3: Color): void {
        var node = <AtlasNode>this._node;
        var locRealColor = node._realColor;
        if ((locRealColor.r === color3.r) && (locRealColor.g === color3.g) && (locRealColor.b === color3.b))
            return;
        this._colorUnmodified = color3;
        this._changeTextureColor();
    }

    _changeTextureColor():void {
        var node = <AtlasNode>this._node;
        var texture = node._texture,
            color = this._colorUnmodified,
            element = texture.getHtmlElementObj();
        var textureRect = rect(0, 0, element.width, element.height);
        if (texture === this._textureToRender)
            this._textureToRender = <Texture2D>((<Texture2DCanvas>texture)._generateColorTexture(color.r, color.g, color.b, textureRect));
        else
            (<Texture2DCanvas>texture)._generateColorTexture(color.r, color.g, color.b, textureRect, this._textureToRender.getHtmlElementObj());
    }

    setOpacity(opacity: number): void {
        var node = <AtlasNode>this._node;
        node.setOpacity(opacity);
    }
    _calculateMaxItems():void {
        var node = <AtlasNode>this._node;
        var selTexture = node._texture;
        var size = selTexture.getContentSize();

        node._itemsPerColumn = 0 | (size.height / node._itemHeight);
        node._itemsPerRow = 0 | (size.width / node._itemWidth);
    }



}
