import { Renderer } from "./Renderer";
import { color, arrayRemoveObject } from "../platform/index";
import { RegionStatus } from "../base-nodes/index";
import { DirtyRegion } from "./DirtyRegion";
import { game } from "../../../startup/CCGame";
import { log } from "../../../startup/CCDebugger";
import { isUndefined } from "../../../startup/CCChecks";
import { Dictionary } from "../../../extensions/syslibs/LinqToJs";
export class RendererCanvas extends Renderer {
    constructor() {
        super();
        this._transformNodePool = []; //save nodes transform dirty
        this._renderCmds = []; //save renderer commands
        this._isCacheToCanvasOn = false; //a switch that whether cache the rendererCmd to cacheToCanvasCmds
        this._cacheToCanvasCmds = new Dictionary(); // an array saves the renderer commands need for cache to other canvas
        this._cacheInstanceIds = [];
        this._currentID = 0;
        this._clearColor = color(); //background color;default BLACK
        this._clearFillStyle = "rgb(0, 0, 0)";
        this._dirtyRegion = null;
        this._allNeedDraw = true;
        this._enableDirtyRegion = false;
        this._debugDirtyRegion = false;
        this._canUseDirtyRegion = false;
        //max dirty Region count; default is 10
        this._dirtyRegionCountThreshold = 10;
    }
    enableDirtyRegion(enabled) {
        this._enableDirtyRegion = enabled;
    }
    isDirtyRegionEnabled() {
        return this._enableDirtyRegion;
    }
    setDirtyRegionCountThreshold(threshold) {
        this._dirtyRegionCountThreshold = threshold;
    }
    _collectDirtyRegion() {
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
    _beginDrawDirtyRegion(ctxWrapper) {
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
    _endDrawDirtyRegion(ctx) {
        ctx.restore();
    }
    _debugDrawDirtyRegion(ctxWrapper) {
        if (!this._debugDirtyRegion)
            return;
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
    init() {
    }
    pushRenderCommand(cmd) {
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
        }
        else {
            if (this._renderCmds.indexOf(cmd) === -1)
                this._renderCmds.push(cmd);
        }
    }
    pushDirtyNode(renderCmd) {
        this._transformNodePool.push(renderCmd);
    }
    clearRenderCommands() {
        this._renderCmds.length = 0;
        this._cacheInstanceIds.length = 0;
        this._isCacheToCanvasOn = false;
        this._allNeedDraw = true;
        this._canUseDirtyRegion = true;
    }
    resetFlag() {
        this.childrenOrderDirty = false;
        this._transformNodePool.length = 0;
    }
    transformDirty() {
        return this._transformNodePool.length > 0;
    }
    transform() {
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
    clear() {
        throw new Error("Method not implemented.");
    }
    rendering(renderContext) {
        var dirtyRegion = this._dirtyRegion = this._dirtyRegion || new DirtyRegion();
        var viewport = game.canvas;
        var wrapper = (renderContext || game.renderContextCanvas);
        var ctx = wrapper.getContext();
        var scaleX = game.view.getScaleX(), scaleY = game.view.getScaleY();
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
            }
            else {
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
    _sortNodeByLevelAsc(n1, n2) {
        return n1._curLevel - n2._curLevel;
    }
    /**
     * drawing all renderer command to cache canvas' context
     * @param {cc.CanvasContextWrapper} ctx
     * @param {Number} [instanceID]
     * @param {Number} [scaleX]
     * @param {Number} [scaleY]
     */
    _renderingToCacheCanvas(ctx, instanceID, scaleX, scaleY) {
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
    _turnToCacheMode(renderTextureID) {
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
    _removeCache(instanceID) {
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
    constructor(_context) {
        this._context = _context;
        this._saveCount = 0;
        this._offsetX = 0;
        this._offsetY = 0;
        this._realOffsetY = 0;
        this._armatureMode = 0;
        this._scaleX = 1;
        this._scaleY = 1;
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
    resetCache() {
        var context = this._context;
        //call it after resize cc._canvas, because context will reset.
        this._currentAlpha = context.globalAlpha;
        this._currentCompositeOperation = context.globalCompositeOperation;
        this._currentFillStyle = context.fillStyle;
        this._currentStrokeStyle = context.strokeStyle;
        this._realOffsetY = this._context.canvas.height + this._offsetY;
    }
    setOffset(x, y) {
        this._offsetX = x;
        this._offsetY = y;
        this._realOffsetY = this._context.canvas.height + this._offsetY;
    }
    computeRealOffsetY() {
        this._realOffsetY = this._context.canvas.height + this._offsetY;
    }
    setViewScale(scaleX, scaleY) {
        //call it at cc.renderCanvas.rendering
        this._scaleX = scaleX;
        this._scaleY = scaleY;
    }
    getContext() {
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
    setGlobalAlpha(alpha) {
        if (this._saveCount > 0) {
            this._context.globalAlpha = alpha;
        }
        else {
            if (this._currentAlpha !== alpha) {
                this._currentAlpha = alpha;
                this._context.globalAlpha = alpha;
            }
        }
    }
    setCompositeOperation(compositionOperation) {
        if (this._saveCount > 0) {
            this._context.globalCompositeOperation = compositionOperation;
        }
        else {
            if (this._currentCompositeOperation !== compositionOperation) {
                this._currentCompositeOperation = compositionOperation;
                this._context.globalCompositeOperation = compositionOperation;
            }
        }
    }
    setFillStyle(fillStyle) {
        if (this._saveCount > 0) {
            this._context.fillStyle = fillStyle;
        }
        else {
            if (this._currentFillStyle !== fillStyle) {
                this._currentFillStyle = fillStyle;
                this._context.fillStyle = fillStyle;
            }
        }
    }
    setStrokeStyle(strokeStyle) {
        if (this._saveCount > 0) {
            this._context.strokeStyle = strokeStyle;
        }
        else {
            if (this._currentStrokeStyle !== strokeStyle) {
                this._currentStrokeStyle = strokeStyle;
                this._context.strokeStyle = strokeStyle;
            }
        }
    }
    setTransform(t, scaleX, scaleY) {
        if (this._armatureMode > 0) {
            //ugly for armature
            this.restore();
            this.save();
            this._context.transform(t.a * scaleX, -t.b * scaleY, -t.c * scaleX, t.d * scaleY, t.tx * scaleX, -(t.ty * scaleY));
        }
        else {
            this._context.setTransform(t.a * scaleX, -t.b * scaleY, -t.c * scaleX, t.d * scaleY, this._offsetX + t.tx * scaleX, this._realOffsetY - (t.ty * scaleY));
        }
    }
    _switchToArmatureMode(enable, t, scaleX, scaleY) {
        if (enable) {
            this._armatureMode++;
            this._context.setTransform(t.a, t.c, t.b, t.d, this._offsetX + t.tx * scaleX, this._realOffsetY - (t.ty * scaleY));
            this.save();
        }
        else {
            this._armatureMode--;
            this.restore();
        }
    }
}
//# sourceMappingURL=RendererCanvas.js.map