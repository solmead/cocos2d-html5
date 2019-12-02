import { RenderCmd } from "./CCRenderCmd";
import { ccNode } from "./CCNode";
import { color } from "../platform/index";
import { GLProgramState } from "../../shaders/CCGLProgramState";
import { GLProgram } from "../../shaders/CCGLProgram";
import { Matrix4 } from "../../kazmath/mat4";

export enum VertexType {
    QUAD = 0,
    TRIANGLE = 1,
    CUSTOM = 2
}

export class WebGLRenderCmd extends RenderCmd {
    _glProgramState: GLProgramState = null;

    _stackMatrix: Matrix4

    vertexType: VertexType;

    constructor(renderable:ccNode) {
        super(renderable);
        this._anchorPointInPoints = { x: 0, y: 0 };
        this._displayedColor = color(255, 255, 255, 255);

    }
    _updateColor() {
    }
    setShaderProgram(shaderProgram: GLProgram) {
        this._glProgramState = GLProgramState.getOrCreateWithGLProgram(shaderProgram);
    }
    getShaderProgram(): GLProgram {
        return this._glProgramState ? this._glProgramState.getGLProgram() : null;
    }

    set shaderProgram(shaderProgram: GLProgram) {
        this._glProgramState = GLProgramState.getOrCreateWithGLProgram(shaderProgram);
    }
    get shaderProgram(): GLProgram {
        return this._glProgramState ? this._glProgramState.getGLProgram() : null;
    }

    getGLProgramState(): GLProgramState {
        return this._glProgramState;
    }

    setGLProgramState(glProgramState: GLProgramState) {
        this._glProgramState = glProgramState;
    }

    uploadData(f32buffer: Float32Array, ui32buffer: Uint32Array, vertexDataOffset: number):number {
        return 0;
    }


}