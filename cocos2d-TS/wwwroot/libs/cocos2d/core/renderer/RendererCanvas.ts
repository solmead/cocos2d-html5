﻿import { Renderer } from "./Renderer";
import { RenderCmd } from "../base-nodes/CCRenderCmd";
import { Color, color, arrayRemoveObject } from "../platform/index";
import { CanvasRenderCmd, ccNode, RegionStatus } from "../base-nodes/index";
import { DirtyRegion } from "./DirtyRegion";
import { game } from "../../../startup/CCGame";
import { log } from "../../../startup/CCDebugger";
import { isUndefined } from "../../../startup/CCChecks";
import { AffineTransform } from "../cocoa/index";
import { Dictionary } from "../../../extensions/syslibs/LinqToJs";


export class RendererCanvas extends Renderer {

    _transformNodePool: Array<CanvasRenderCmd> = [];                              //save nodes transform dirty
    _renderCmds:Array<CanvasRenderCmd> = [];                                     //save renderer commands

    _isCacheToCanvasOn:boolean = false;                          //a switch that whether cache the rendererCmd to cacheToCanvasCmds
    _cacheToCanvasCmds = new Dictionary<number, Array<CanvasRenderCmd>>();                              // an array saves the renderer commands need for cache to other canvas
    _cacheInstanceIds:Array<number> = [];
    _currentID:number = 0;
    _clearColor:Color = color();                                  //background color;default BLACK
    _clearFillStyle:string = "rgb(0, 0, 0)";

    _dirtyRegion:DirtyRegion = null;
    _allNeedDraw: boolean = true;
    _enableDirtyRegion: boolean = false;
    _debugDirtyRegion: boolean = false;
    _canUseDirtyRegion: boolean = false;
    //max dirty Region count; default is 10
    _dirtyRegionCountThreshold = 10;

    constructor() {
        super();
    }

    enableDirtyRegion(enabled: boolean): void {
        this._enableDirtyRegion = enabled;
    }
    isDirtyRegionEnabled(): boolean {
        return this._enableDirtyRegion;
    }
    setDirtyRegionCountThreshold(threshold: number):void {
        this._dirtyRegionCountThreshold = threshold;
    }
    _collectDirtyRegion():boolean {
        //collect dirtyList
        var locCmds = this._renderCmds, i, len;
        var dirtyRegion = this._dirtyRegion;
        var dirtryRegionCount = 0;
        var result = true;
        //var localStatus = RegionStatus;
        for (i = 0, len = locCmds.length; i < len; i++) {
            var cmd = locCmds[i];
            var regionFlag = cmd._regionFlag;
            var oldRegion = cmd._oldRegion;
            var currentRegion = cmd._currentRegion;
            if (regionFlag > RegionStatus.NotDirty) {
                ++dirtryRegionCount;
                if (dirtryRegionCount > this._dirtyRegionCountThreshold)
                    result = false;
                //add
                if (result) {
                    (!currentRegion.isEmpty()) && dirtyRegion.addRegion(currentRegion);
                    if (cmd._regionFlag > RegionStatus.Dirty) {
                        (!oldRegion.isEmpty()) && dirtyRegion.addRegion(oldRegion);
                    }
                }
                cmd._regionFlag = RegionStatus.NotDirty;
            }

        }

        return result;
    }
    _beginDrawDirtyRegion(ctxWrapper: CanvasContextWrapper) {
        var ctx = ctxWrapper.getContext();
        var dirtyList = this._dirtyRegion.getDirtyRegions();
        ctx.save();
        //add clip
        var scaleX = ctxWrapper._scaleX;
        var scaleY = ctxWrapper._scaleY;
        ctxWrapper.setTransform({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, scaleX, scaleY);
        ctx.beginPath();
        for (var index = 0, count = dirtyList.length; index < count; ++index) {
            var region = dirtyList[index];
            ctx.rect(region._minX, -region._maxY, region._width, region._height);
        }
        ctx.clip();
        //end add clip
    }
    _endDrawDirtyRegion(ctx:CanvasRenderingContext2D) {
        ctx.restore();
    }
    _debugDrawDirtyRegion(ctxWrapper: CanvasContextWrapper) {
        if (!this._debugDirtyRegion) return;
        var ctx = ctxWrapper.getContext();
        var dirtyList = this._dirtyRegion.getDirtyRegions();
        //add clip
        var scaleX = ctxWrapper._scaleX;
        var scaleY = ctxWrapper._scaleY;
        ctxWrapper.setTransform({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, scaleX, scaleY);
        ctx.beginPath();
        for (var index = 0, count = dirtyList.length; index < count; ++index) {
            var region = dirtyList[index];
            ctx.rect(region._minX, -region._maxY, region._width, region._height);
        }
        var oldstyle = ctx.fillStyle;
        ctx.fillStyle = 'green';
        ctx.fill();
        ctx.fillStyle = oldstyle;
        //end add clip
    }

    init(): void {

    }
    pushRenderCommand(cmd: CanvasRenderCmd): void {
        if (!cmd.needDraw())
            return;
        if (!cmd._canUseDirtyRegion) {
            this._canUseDirtyRegion = false;
        }
        if (this._isCacheToCanvasOn) {
            var currentId = this._currentID, locCmdBuffer = this._cacheToCanvasCmds;
            var cmdList = locCmdBuffer.get(currentId);
            if (cmdList.indexOf(cmd) === -1)
                cmdList.push(cmd);
        } else {
            if (this._renderCmds.indexOf(cmd) === -1)
                this._renderCmds.push(cmd);
        }
    }
    pushDirtyNode(renderCmd: CanvasRenderCmd): void {
        this._transformNodePool.push(renderCmd);
    }
    clearRenderCommands(): void {
        this._renderCmds.length = 0;
        this._cacheInstanceIds.length = 0;
        this._isCacheToCanvasOn = false;
        this._allNeedDraw = true;
        this._canUseDirtyRegion = true;
    }
    resetFlag(): void {
        this.childrenOrderDirty = false;
        this._transformNodePool.length = 0;
    }
    transformDirty(): boolean {
        return this._transformNodePool.length > 0;
    }
    transform(): void {
        var locPool = this._transformNodePool;
        //sort the pool
        locPool.sort(this._sortNodeByLevelAsc);

        //transform node
        for (var i = 0, len = locPool.length; i < len; i++) {
            if (locPool[i]._dirtyFlag !== 0)
                locPool[i].updateStatus();
        }
        locPool.length = 0;
    }
    clear(): void {
        throw new Error("Method not implemented.");
    }
    rendering(renderContext: CanvasContextWrapper): void {
        var dirtyRegion = this._dirtyRegion = this._dirtyRegion || new DirtyRegion();
        var viewport = game.canvas;
        var wrapper = (renderContext || game.renderContextCanvas);
        var ctx = wrapper.getContext();

        var scaleX = game.view.getScaleX(),
            scaleY = game.view.getScaleY();
        wrapper.setViewScale(scaleX, scaleY);
        wrapper.computeRealOffsetY();
        var dirtyList = this._dirtyRegion.getDirtyRegions();
        var locCmds = this._renderCmds, i, len;
        var allNeedDraw = this._allNeedDraw || !this._enableDirtyRegion || !this._canUseDirtyRegion;
        var collectResult = true;
        if (!allNeedDraw) {
            collectResult = this._collectDirtyRegion();
        }

        allNeedDraw = allNeedDraw || (!collectResult);

        if (!allNeedDraw) {
            this._beginDrawDirtyRegion(wrapper);
        }

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, viewport.width, viewport.height);
        if (this._clearColor.r !== 255 ||
            this._clearColor.g !== 255 ||
            this._clearColor.b !== 255) {
            wrapper.setFillStyle(this._clearFillStyle);
            wrapper.setGlobalAlpha(this._clearColor.a);
            ctx.fillRect(0, 0, viewport.width, viewport.height);
        }

        for (i = 0, len = locCmds.length; i < len; i++) {
            var cmd = locCmds[i];
            var needRendering = false;
            var cmdRegion = cmd._currentRegion;
            if (!cmdRegion || allNeedDraw) {
                needRendering = true;
            } else {
                for (var index = 0, count = dirtyList.length; index < count; ++index) {
                    if (dirtyList[index].intersects(cmdRegion)) {
                        needRendering = true;
                        break;
                    }
                }
            }
            if (needRendering) {
                cmd.rendering(wrapper, scaleX, scaleY);
            }
        }

        if (!allNeedDraw) {
            //draw debug info for dirty region if it is needed
            this._debugDrawDirtyRegion(wrapper);
            this._endDrawDirtyRegion(ctx);
        }

        dirtyRegion.clear();
        this._allNeedDraw = false;
    }
    _sortNodeByLevelAsc(n1: CanvasRenderCmd, n2: CanvasRenderCmd): number {
        return n1._curLevel - n2._curLevel;
    }

    /**
     * drawing all renderer command to cache canvas' context
     * @param {cc.CanvasContextWrapper} ctx
     * @param {Number} [instanceID]
     * @param {Number} [scaleX]
     * @param {Number} [scaleY]
     */
    _renderingToCacheCanvas(ctx: CanvasContextWrapper, instanceID: number, scaleX: number, scaleY: number) {
        if (!ctx)
            log("The context of RenderTexture is invalid.");
        scaleX = isUndefined(scaleX) ? 1 : scaleX;
        scaleY = isUndefined(scaleY) ? 1 : scaleY;
        instanceID = instanceID || this._currentID;
        var i, locCmds = this._cacheToCanvasCmds.get(instanceID), len;
        ctx.computeRealOffsetY();
        for (i = 0, len = locCmds.length; i < len; i++) {
            locCmds[i].rendering(ctx, scaleX, scaleY);
        }
        this._removeCache(instanceID);

        var locIDs = this._cacheInstanceIds;
        if (locIDs.length === 0)
            this._isCacheToCanvasOn = false;
        else
            this._currentID = locIDs[locIDs.length - 1];
    }
    _turnToCacheMode(renderTextureID: number) {
        this._isCacheToCanvasOn = true;
        renderTextureID = renderTextureID || 0;
        this._cacheToCanvasCmds.set(renderTextureID, []);
        if (this._cacheInstanceIds.indexOf(renderTextureID) === -1)
            this._cacheInstanceIds.push(renderTextureID);
        this._currentID = renderTextureID;
    }
    _turnToNormalMode() {
        this._isCacheToCanvasOn = false;
    }

    _removeCache(instanceID: number) {
        instanceID = instanceID || this._currentID;
        var cmds = this._cacheToCanvasCmds.get(instanceID);
        if (cmds) {
            cmds.length = 0;
            this._cacheToCanvasCmds.remove(instanceID);
            //delete this._cacheToCanvasCmds[instanceID];
        }

        var locIDs = this._cacheInstanceIds;
        arrayRemoveObject(locIDs, instanceID);
    }


}

export var rendererCanvas = new RendererCanvas();


export class CanvasContextWrapper {

    _saveCount: number = 0;
    _currentAlpha: number;
    _currentCompositeOperation: string;
    _currentFillStyle: string | CanvasGradient | CanvasPattern;
    _currentStrokeStyle: string | CanvasGradient | CanvasPattern;

    _offsetX: number = 0;
    _offsetY: number = 0;
    _realOffsetY: number = 0;
    _armatureMode: number = 0;
    _scaleX: number = 1;
    _scaleY: number = 1;


    constructor(public _context: CanvasRenderingContext2D) {

        this._saveCount = 0;
        this._currentAlpha = _context.globalAlpha;
        this._currentCompositeOperation = _context.globalCompositeOperation;
        this._currentFillStyle = _context.fillStyle;
        this._currentStrokeStyle = _context.strokeStyle;

        this._offsetX = 0;
        this._offsetY = 0;
        this._realOffsetY = this._context.canvas.height;
        this._armatureMode = 0;
    }

    resetCache():void {
        var context = this._context;
        //call it after resize cc._canvas, because context will reset.
        this._currentAlpha = context.globalAlpha;
        this._currentCompositeOperation = context.globalCompositeOperation;
        this._currentFillStyle = context.fillStyle;
        this._currentStrokeStyle = context.strokeStyle;
        this._realOffsetY = this._context.canvas.height + this._offsetY;
    }

    setOffset(x:number, y:number):void {
        this._offsetX = x;
        this._offsetY = y;
        this._realOffsetY = this._context.canvas.height + this._offsetY;
    }
    computeRealOffsetY():void {
        this._realOffsetY = this._context.canvas.height + this._offsetY;
    }
    setViewScale(scaleX: number, scaleY: number) {
        //call it at cc.renderCanvas.rendering
        this._scaleX = scaleX;
        this._scaleY = scaleY;
    }
    getContext():CanvasRenderingContext2D {
        return this._context;
    }
    save() {
        this._context.save();
        this._saveCount++;
    }
    restore() {
        this._context.restore();
        this._saveCount--;
    }
    setGlobalAlpha(alpha:number) {
        if (this._saveCount > 0) {
            this._context.globalAlpha = alpha;
        } else {
            if (this._currentAlpha !== alpha) {
                this._currentAlpha = alpha;
                this._context.globalAlpha = alpha;
            }
        }
    }
    setCompositeOperation(compositionOperation:string) {
        if (this._saveCount > 0) {
            this._context.globalCompositeOperation = compositionOperation;
        } else {
            if (this._currentCompositeOperation !== compositionOperation) {
                this._currentCompositeOperation = compositionOperation;
                this._context.globalCompositeOperation = compositionOperation;
            }
        }
    }
    setFillStyle(fillStyle: string | CanvasGradient | CanvasPattern) {
        if (this._saveCount > 0) {
            this._context.fillStyle = fillStyle;
        } else {
            if (this._currentFillStyle !== fillStyle) {
                this._currentFillStyle = fillStyle;
                this._context.fillStyle = fillStyle;
            }
        }
    }
    setStrokeStyle(strokeStyle: string | CanvasGradient | CanvasPattern) {
        if (this._saveCount > 0) {
            this._context.strokeStyle = strokeStyle;
        } else {
            if (this._currentStrokeStyle !== strokeStyle) {
                this._currentStrokeStyle = strokeStyle;
                this._context.strokeStyle = strokeStyle;
            }
        }
    }
    setTransform(t:AffineTransform, scaleX:number, scaleY:number) {
        if (this._armatureMode > 0) {
            //ugly for armature
            this.restore();
            this.save();
            this._context.transform(t.a * scaleX, -t.b * scaleY, -t.c * scaleX, t.d * scaleY, t.tx * scaleX, -(t.ty * scaleY));
        } else {
            this._context.setTransform(t.a * scaleX, -t.b * scaleY, -t.c * scaleX, t.d * scaleY, this._offsetX + t.tx * scaleX, this._realOffsetY - (t.ty * scaleY));
        }
    }
    _switchToArmatureMode(enable:boolean, t:AffineTransform, scaleX:number, scaleY:number) {
        if (enable) {
            this._armatureMode++;
            this._context.setTransform(t.a, t.c, t.b, t.d, this._offsetX + t.tx * scaleX, this._realOffsetY - (t.ty * scaleY));
            this.save();
        } else {
            this._armatureMode--;
            this.restore();
        }
    }






}