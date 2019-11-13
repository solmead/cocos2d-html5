import { ccClass } from "../platform/index";
import { RenderCmd } from "../base-nodes/CCRenderCmd";
import { CanvasContextWrapper } from "./RendererCanvas";

export interface iRenderableObject {
    _createRenderCmd(): RenderCmd;
}

export type WebGlContext = WebGL2RenderingContext | WebGLRenderingContext;

//export interface iRenderer {
//    childrenOrderDirty: boolean;
//    assignedZ: boolean;
//    assignedZStep: boolean,
//    getRenderCmd(renderableObject: iRenderableObject): RenderCmd;

//}


export abstract class Renderer extends ccClass {
    childrenOrderDirty: boolean = true;
    assignedZ: number = 0;
    assignedZStep: number = 1 / 10000;
    _allNeedDraw: boolean = false;

    constructor() {
        super();
    }
    abstract init():void;

    getRenderCmd(renderableObject: iRenderableObject): RenderCmd {
        //TODO Add renderCmd pool here
        return renderableObject._createRenderCmd();
    }

    abstract pushRenderCommand(renderCmd: RenderCmd):void;

    abstract pushDirtyNode(renderCmd: RenderCmd): void;

    abstract clearRenderCommands(): void;

    abstract resetFlag(): void;

    abstract transformDirty(): boolean;

    abstract transform(): void;

    abstract clear(): void;

    abstract rendering(renderContext: RenderingContext | CanvasContextWrapper):void;


}