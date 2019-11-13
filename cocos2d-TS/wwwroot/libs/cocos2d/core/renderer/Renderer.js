import { ccClass } from "../platform/index";
//export interface iRenderer {
//    childrenOrderDirty: boolean;
//    assignedZ: boolean;
//    assignedZStep: boolean,
//    getRenderCmd(renderableObject: iRenderableObject): RenderCmd;
//}
export class Renderer extends ccClass {
    constructor() {
        super();
        this.childrenOrderDirty = true;
        this.assignedZ = 0;
        this.assignedZStep = 1 / 10000;
        this._allNeedDraw = false;
    }
    getRenderCmd(renderableObject) {
        //TODO Add renderCmd pool here
        return renderableObject._createRenderCmd();
    }
}
//# sourceMappingURL=Renderer.js.map