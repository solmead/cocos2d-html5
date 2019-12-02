import { RenderCmd } from "./CCRenderCmd";
import { color, SRC_ALPHA, ONE, ZERO, ONE_MINUS_SRC_ALPHA } from "../platform/index";
import { rect } from "../cocoa/index";
import { Region } from "../renderer/DirtyRegion";
export var RegionStatus;
(function (RegionStatus) {
    RegionStatus[RegionStatus["NotDirty"] = 0] = "NotDirty";
    RegionStatus[RegionStatus["Dirty"] = 1] = "Dirty";
    RegionStatus[RegionStatus["DirtyDouble"] = 2] = "DirtyDouble"; //the region is moved, the old and the new one need considered when rendering
})(RegionStatus || (RegionStatus = {}));
export class CanvasRenderCmd extends RenderCmd {
    constructor(renderable) {
        super(renderable);
        this._cachedParent = null;
        this._cacheDirty = false;
        this._currentRegion = new Region();
        this._oldRegion = new Region();
        this._regionFlag = 0;
        this._canUseDirtyRegion = false;
        this.localBB = rect();
        this._anchorPointInPoints = { x: 0, y: 0 };
        this._displayedColor = color(255, 255, 255, 255);
    }
    isTransforming() {
        if (this._updateCurrentRegions) {
            this._updateCurrentRegions();
            this.notifyIsDirty();
        }
        this._cacheDirty = true;
    }
    notifyIsDirty(special = false) {
        if (!special) {
            this._notifyRegionStatus && this._notifyRegionStatus(RegionStatus.Dirty);
        }
        else {
            this._notifyRegionStatus && this._notifyRegionStatus(RegionStatus.DirtyDouble);
        }
    }
    _notifyRegionStatus(status) {
        if (this._needDraw && this._regionFlag < status) {
            this._regionFlag = status;
        }
    }
    getLocalBB() {
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
    }
    ;
    setDirtyFlag(dirtyFlag, child) {
        super.setDirtyFlag(dirtyFlag, child);
        this._setCacheDirty(child); //TODO it should remove from here.
        if (this._cachedParent)
            this._cachedParent.setDirtyFlag(dirtyFlag, true);
    }
    _setCacheDirty(child) {
        if (this._cacheDirty === false) {
            this._cacheDirty = true;
            var cachedP = this._cachedParent;
            cachedP && cachedP !== this && cachedP._setNodeDirtyForCache && cachedP._setNodeDirtyForCache();
        }
    }
    _setCachedParent(cachedParent) {
        if (this._cachedParent === cachedParent)
            return;
        this._cachedParent = cachedParent;
        var children = this._node._children;
        for (var i = 0, len = children.length; i < len; i++)
            (children[i]._renderCmd)._setCachedParent(cachedParent);
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
    static _getCompositeOperationByBlendFunc(blendFunc = null) {
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
//# sourceMappingURL=CCNodeCanvasRenderCmd.js.map