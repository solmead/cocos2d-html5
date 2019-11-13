import { RenderCmd, _dirtyFlags } from "./CCRenderCmd";
import { ccNode } from "./CCNode";
import { color, SRC_ALPHA, ONE, ZERO, ONE_MINUS_SRC_ALPHA } from "../platform/index";
import { rect, Rect } from "../cocoa/index";
import { Region } from "../renderer/DirtyRegion";

export enum RegionStatus {
    NotDirty = 0,    //the region is not dirty
    Dirty = 1,       //the region is dirty, because of color, opacity or context
    DirtyDouble = 2  //the region is moved, the old and the new one need considered when rendering
}

export class CanvasRenderCmd extends RenderCmd {
    _cachedParent: CanvasRenderCmd = null;
    _cacheDirty:boolean = false;
    _currentRegion: Region = new Region();
    _oldRegion: Region = new Region();
    _regionFlag: RegionStatus = 0;
    _canUseDirtyRegion: boolean = false;

    private localBB:Rect = rect()

    constructor(renderable: ccNode) {
        super(renderable);
        this._anchorPointInPoints = { x: 0, y: 0 };
        this._displayedColor = color(255, 255, 255, 255);

    }

    protected isTransforming() {
        if (this._updateCurrentRegions) {
            this._updateCurrentRegions();
            this.notifyIsDirty();
        }

        this._cacheDirty = true;
    }

    protected notifyIsDirty(special: boolean = false): void {
        if (!special) {
            this._notifyRegionStatus && this._notifyRegionStatus(RegionStatus.Dirty);
        } else {
            this._notifyRegionStatus && this._notifyRegionStatus(RegionStatus.DirtyDouble);
        }
    }
    _notifyRegionStatus(status: RegionStatus) {
        if (this._needDraw && this._regionFlag < status) {
            this._regionFlag = status;
        }
    }
    getLocalBB():Rect {
        var node = this._node;
        this.localBB.x = this.localBB.y = 0;
        this.localBB.width = node._contentSize.width;
        this.localBB.height = node._contentSize.height;
        return this.localBB;
    }


    _updateCurrentRegions() {
        var temp = this._currentRegion;
        this._currentRegion = this._oldRegion;
        this._oldRegion = temp;
        //hittest will call the transform, and set region flag to DirtyDouble, and the changes need to be considered for rendering
        if (RegionStatus.DirtyDouble === this._regionFlag && (!this._currentRegion.isEmpty())) {
            this._oldRegion.union(this._currentRegion);
        }
        this._currentRegion.updateRegion(this.getLocalBB(), this._worldTransform);
    };

    setDirtyFlag(dirtyFlag:_dirtyFlags, child:boolean) {
        super.setDirtyFlag(dirtyFlag, child);
        this._setCacheDirty(child);                  //TODO it should remove from here.
        if (this._cachedParent)
            this._cachedParent.setDirtyFlag(dirtyFlag, true);
    }

    _setCacheDirty(child?: boolean) {
        if (this._cacheDirty === false) {
            this._cacheDirty = true;
            var cachedP = this._cachedParent;
            cachedP && cachedP !== this && (<any>cachedP)._setNodeDirtyForCache && (<any>cachedP)._setNodeDirtyForCache();
        }
    }

    _setCachedParent(cachedParent:CanvasRenderCmd) {
        if (this._cachedParent === cachedParent)
            return;

        this._cachedParent = cachedParent;
        var children = this._node._children;
        for (var i = 0, len = children.length; i < len; i++)
            (<CanvasRenderCmd><any>(children[i]._renderCmd))._setCachedParent(cachedParent);
    }

    detachFromParent() {
        this._cachedParent = null;
        var selChildren = this._node._children, item;
        for (var i = 0, len = selChildren.length; i < len; i++) {
            item = selChildren[i];
            if (item && item._renderCmd)
                item._renderCmd.detachFromParent();
        }
    }

    _getCompositeOperationByBlendFunc(blendFunc:any = null) {
        if (!blendFunc)
            return "source-over";
        else {
            if ((blendFunc.src === SRC_ALPHA && blendFunc.dst === ONE) || (blendFunc.src === ONE && blendFunc.dst === ONE))
                return "lighter";
            else if (blendFunc.src === ZERO && blendFunc.dst === SRC_ALPHA)
                return "destination-in";
            else if (blendFunc.src === ZERO && blendFunc.dst === ONE_MINUS_SRC_ALPHA)
                return "destination-out";
            else
                return "source-over";
        }
    }
}