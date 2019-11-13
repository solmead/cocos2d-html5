import { RenderCmd } from "./CCRenderCmd";
import { Color } from "../platform/index";
import { Texture2D } from "../textures/CCTexture2D";


export interface AtlasNodeRenderCmd extends RenderCmd {
    initWithTexture(texture: Texture2D, tileWidth: number, tileHeight: number, itemsToRender: number): boolean;
    setColor(color3: Color): void;
    setOpacity(opacity: number): void;


    _colorUnmodified: Color;


}