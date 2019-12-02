
import { RenderCmd, IRenderCmd } from "../base-nodes/CCRenderCmd";
import { BlendFunc } from "../platform/index";
import { Rect } from "../cocoa/index";
import { Texture2D } from "../textures/index";
import { Sprite } from "./CCSprite";



export interface SpriteRenderCmd extends RenderCmd {

    updateBlendFunc(blend: BlendFunc): void;
    _handleTextureForRotatedTexture(texture: Texture2D, rectArea: Rect, rotated?: boolean, counterclockwise?: boolean): Texture2D;
    _checkTextureBoundary(texture: Texture2D, rectArea: Rect, rotated: boolean): void;
    _setTextureCoords(rect: Rect, needConvert: boolean): void;
    _setBatchNodeForAddChild(child: Sprite): boolean;
    _setTexture(pNewTexture?: Texture2D): boolean;
    isFrameDisplayed(frame: SpriteFrame): boolean;
    _setColorDirty(): void;
}