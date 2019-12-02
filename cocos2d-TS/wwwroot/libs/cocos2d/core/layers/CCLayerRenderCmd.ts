
import { RenderCmd, IRenderCmd } from "../base-nodes/CCRenderCmd";
import { ccNode } from "../base-nodes/index";
import { BlendFunc } from "../platform/index";


export interface LayerRenderCmd extends RenderCmd {
    bake():void;
    unbake(): void;
    _bakeForAddChild(child?:ccNode): void;
    _isBaked: boolean;
    _bakeSprite: Sprite;
    _bakeRenderCmd: IRenderCmd;
    updateBlendFunc(blend: BlendFunc):void;
}