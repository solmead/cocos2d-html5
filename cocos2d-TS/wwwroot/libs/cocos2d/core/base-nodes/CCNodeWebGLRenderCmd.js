import { RenderCmd } from "./CCRenderCmd";
import { color } from "../platform/index";
import { GLProgramState } from "../../shaders/CCGLProgramState";
export var VertexType;
(function (VertexType) {
    VertexType[VertexType["QUAD"] = 0] = "QUAD";
    VertexType[VertexType["TRIANGLE"] = 1] = "TRIANGLE";
    VertexType[VertexType["CUSTOM"] = 2] = "CUSTOM";
})(VertexType || (VertexType = {}));
export class WebGLRenderCmd extends RenderCmd {
    constructor(renderable) {
        super(renderable);
        this._glProgramState = null;
        this._anchorPointInPoints = { x: 0, y: 0 };
        this._displayedColor = color(255, 255, 255, 255);
    }
    _updateColor() {
    }
    setShaderProgram(shaderProgram) {
        this._glProgramState = GLProgramState.getOrCreateWithGLProgram(shaderProgram);
    }
    getShaderProgram() {
        return this._glProgramState ? this._glProgramState.getGLProgram() : null;
    }
    set shaderProgram(shaderProgram) {
        this._glProgramState = GLProgramState.getOrCreateWithGLProgram(shaderProgram);
    }
    get shaderProgram() {
        return this._glProgramState ? this._glProgramState.getGLProgram() : null;
    }
    getGLProgramState() {
        return this._glProgramState;
    }
    setGLProgramState(glProgramState) {
        this._glProgramState = glProgramState;
    }
    uploadData(f32buffer, ui32buffer, vertexDataOffset) {
        return 0;
    }
}
//# sourceMappingURL=CCNodeWebGLRenderCmd.js.map