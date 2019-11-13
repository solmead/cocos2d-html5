import { ccClass } from "../platform/ccClass";
import { EventListener, _EventListenerMouse, _EventListenerFocus, _EventListenerTouchOneByOne, _EventListenerTouchAllAtOnce, _EventListenerCustom, EventListenerTypes } from "./CCEventListener";
import { Event, EventTypes, EventTouch, TouchEventCodes, EventCustom } from "./CCEvent";
import { _EventListenerAcceleration, _EventListenerKeyboard } from "./CCEventExtension";
import { log, _LogInfos, assert } from "../../../startup/CCDebugger";
import { gameEvents } from "../../../startup/CCGame";
import { director } from "../CCDirector";
import { isNumber } from "../../../startup/CCChecks";
import { arrayRemoveObject, copyArray } from "../platform/CCMacro";
import { Dictionary } from "../../../extensions/syslibs/LinqToJs";
import { ccNode } from "../base-nodes/CCNode";
import { ccTouch } from "./index";

/****************************************************************************
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2015 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

 export class _EventListenerVector extends ccClass {
    _fixedListeners = new Array<EventListener>();
    _sceneGraphListeners = new Array<EventListener>();
    gt0Index:number = 0;

    constructor() {
        super();

    }

    size():number {
        return this._fixedListeners.length + this._sceneGraphListeners.length;
    }

    empty():boolean {
        return (this._fixedListeners.length === 0) && (this._sceneGraphListeners.length === 0);
    }

    push(listener:EventListener):void {
        if (listener._getFixedPriority() === 0)
            this._sceneGraphListeners.push(listener);
        else
            this._fixedListeners.push(listener);
    }

    clearSceneGraphListeners() {
        this._sceneGraphListeners.length = 0;
    }

    clearFixedListeners() {
        this._fixedListeners.length = 0;
    }

    clear() {
        this._sceneGraphListeners.length = 0;
        this._fixedListeners.length = 0;
    }

    getFixedPriorityListeners() {
        return this._fixedListeners;
    }

    getSceneGraphPriorityListeners() {
        return this._sceneGraphListeners;
    }

 }

function __getListenerID (event:Event) {
    var eventType = EventTypes;
    var getType = event._type;
    if (getType === eventType.ACCELERATION)
        return _EventListenerAcceleration.LISTENER_ID;
    if (getType === eventType.CUSTOM)
        return (<EventCustom>event)._eventName;
    if (getType === eventType.KEYBOARD)
        return _EventListenerKeyboard.LISTENER_ID;
    if (getType === eventType.MOUSE)
        return _EventListenerMouse.LISTENER_ID;
    if (getType === eventType.FOCUS)
        return _EventListenerFocus.LISTENER_ID;
    if (getType === eventType.TOUCH) {
        // Touch listener is very special, it contains two kinds of listeners, EventListenerTouchOneByOne and EventListenerTouchAllAtOnce.
        // return UNKNOWN instead.
        log(_LogInfos.__getListenerID);
    }
    return "";
}

enum DIRTY {
    NONE= 0,
    FIXED_PRIORITY= 1 << 0,
    SCENE_GRAPH_PRIORITY= 1 << 1,
    ALL= 3
}
interface TouchArgsAtOnce {
    event:EventTouch;
    touches: Array<ccTouch>;
}
interface TouchArgsOneByOne {
    event:EventTouch;
    touches: Array<ccTouch>;
    selTouch: ccTouch;
    needsMutableSet:boolean;

}

class EventManager {

    _listenersMap = new Dictionary<string, _EventListenerVector>();
    _priorityDirtyFlagMap = new Dictionary<string, DIRTY>();
    _nodeListenersMap = new Dictionary<number, Array<EventListener>>();
    _nodePriorityMap = new Dictionary<string, number>();
    _globalZOrderNodeMap = new Dictionary<number, Array<string>>();
    _toAddedListeners:Array<EventListener>  = [];
    _toRemovedListeners:Array<EventListener>  = [];
    _dirtyNodes:Array<ccNode> = [];
    _inDispatch: 0;
    _isEnabled:boolean = false;
    _nodePriorityIndex:number = 0;

    _internalCustomListenerIDs:Array<string>= [gameEvents.EVENT_HIDE, gameEvents.EVENT_SHOW];

    constructor() {

    }
    _setDirtyForNode(node:ccNode) {
        // Mark the node dirty only when there is an event listener associated with it.
        if (this._nodeListenersMap.get(node.__instanceId) != null)
            this._dirtyNodes.push(node);
        var _children = node.getChildren();
        for(var i = 0, len = _children.length; i < len; i++)
            this._setDirtyForNode(_children[i]);
    }
/**
     * Pauses all listeners which are associated the specified target.
     * @param {cc.Node} node
     * @param {Boolean} [recursive=false]
     */
    pauseTarget(node:ccNode, recursive:boolean=false) {
        var listeners = this._nodeListenersMap.get(node.__instanceId), i, len;
        if (listeners) {
            for (i = 0, len = listeners.length; i < len; i++)
                listeners[i]._setPaused(true);
        }
        if (recursive === true) {
            var locChildren = node.getChildren();
            for (i = 0, len = locChildren.length; i < len; i++)
                this.pauseTarget(locChildren[i], true);
        }
    }
/**
     * Resumes all listeners which are associated the specified target.
     * @param {cc.Node} node
     * @param {Boolean} [recursive=false]
     */
    resumeTarget(node:ccNode, recursive:boolean = false) {
        var listeners = this._nodeListenersMap.get(node.__instanceId), i, len;
        if (listeners) {
            for (i = 0, len = listeners.length; i < len; i++)
                listeners[i]._setPaused(false);
        }
        this._setDirtyForNode(node);
        if (recursive === true) {
            var locChildren = node.getChildren();
            for (i = 0, len = locChildren.length; i< len; i++)
                this.resumeTarget(locChildren[i], true);
        }
    }
    _addListener(listener:EventListener) {
        if (this._inDispatch === 0)
            this._forceAddEventListener(listener);
        else
            this._toAddedListeners.push(listener);
    }

    _forceAddEventListener(listener:EventListener) {
        var listenerID = listener._getListenerID();
        var listeners = this._getListeners(listenerID);
        if (!listeners) {
            listeners = new _EventListenerVector();
            this._listenersMap.set(listenerID, listeners);
        }
        listeners.push(listener);

        if (listener._getFixedPriority() === 0) {
            this._setDirty(listenerID, DIRTY.SCENE_GRAPH_PRIORITY);

            var node = listener._getSceneGraphPriority();
            if (node === null)
                log(_LogInfos.eventManager__forceAddEventListener);

            this._associateNodeAndEventListener(node, listener);
            if (node.isRunning())
                this.resumeTarget(node);
        } else
            this._setDirty(listenerID, DIRTY.FIXED_PRIORITY);
    }
    _getListeners(listenerID:string):_EventListenerVector {
        return this._listenersMap.get(listenerID);
    }
    _updateDirtyFlagForSceneGraph() {
        if (this._dirtyNodes.length === 0)
            return;

        var locDirtyNodes = this._dirtyNodes, selListeners, selListener, locNodeListenersMap = this._nodeListenersMap;
        for (var i = 0, len = locDirtyNodes.length; i < len; i++) {
            selListeners = locNodeListenersMap.get(locDirtyNodes[i].__instanceId);
            if (selListeners) {
                for (var j = 0, listenersLen = selListeners.length; j < listenersLen; j++) {
                    selListener = selListeners[j];
                    if (selListener)
                        this._setDirty(selListener._getListenerID(), DIRTY.SCENE_GRAPH_PRIORITY);
                }
            }
        }
        this._dirtyNodes.length = 0;
    }
    _removeAllListenersInVector(listenerVector: Array<EventListener>) {
        if (!listenerVector)
            return;
        var selListener:EventListener;
        for (var i = 0; i < listenerVector.length;) {
            selListener = listenerVector[i];
            selListener._setRegistered(false);
            if (selListener._getSceneGraphPriority() != null) {
                this._dissociateNodeAndEventListener(selListener._getSceneGraphPriority(), selListener);
                selListener._setSceneGraphPriority(null);   // NULL out the node pointer so we don't have any dangling pointers to destroyed nodes.
            }

            if (this._inDispatch === 0)
                arrayRemoveObject(listenerVector, selListener);
            else
                ++i;
        }
    }
    _removeListenersForListenerID(listenerID:string) {
        var listeners = this._getListeners(listenerID), i;
        if (listeners) {
            var fixedPriorityListeners = listeners.getFixedPriorityListeners();
            var sceneGraphPriorityListeners = listeners.getSceneGraphPriorityListeners();

            this._removeAllListenersInVector(sceneGraphPriorityListeners);
            this._removeAllListenersInVector(fixedPriorityListeners);

            // Remove the dirty flag according the 'listenerID'.
            // No need to check whether the dispatcher is dispatching event.
            this._priorityDirtyFlagMap.remove(listenerID);
            //delete this._priorityDirtyFlagMap[listenerID];

            if (!this._inDispatch) {
                listeners.clear();
            }
            this._listenersMap.remove(listenerID);
            //delete this._listenersMap[listenerID];
        }

        var locToAddedListeners = this._toAddedListeners, listener;
        for (i = 0; i < locToAddedListeners.length;) {
            listener = locToAddedListeners[i];
            if (listener && listener._getListenerID() === listenerID)
                arrayRemoveObject(locToAddedListeners, listener);
            else
                ++i;
        }
    }
    _sortEventListeners(listenerID:string) {
        var dirtyFlag = DIRTY.NONE, locFlagMap = this._priorityDirtyFlagMap;
        if (locFlagMap.get(listenerID))
            dirtyFlag = locFlagMap.get(listenerID);

        if (dirtyFlag !== DIRTY.NONE) {
            // Clear the dirty flag first, if `rootNode` is null, then set its dirty flag of scene graph priority
            locFlagMap.set(listenerID, DIRTY.NONE);

            if (dirtyFlag & DIRTY.FIXED_PRIORITY)
                this._sortListenersOfFixedPriority(listenerID);

            if (dirtyFlag & DIRTY.SCENE_GRAPH_PRIORITY) {
                var rootNode = director.getRunningScene();
                if (rootNode)
                    this._sortListenersOfSceneGraphPriority(listenerID, rootNode);
                else
                    locFlagMap.set(listenerID, DIRTY.SCENE_GRAPH_PRIORITY);
            }
        }
    }
    _sortListenersOfSceneGraphPriority(listenerID:string, rootNode:ccNode) {
        var listeners = this._getListeners(listenerID);
        if (!listeners)
            return;

        var sceneGraphListener = listeners.getSceneGraphPriorityListeners();
        if (!sceneGraphListener || sceneGraphListener.length === 0)
            return;

        // Reset priority index
        this._nodePriorityIndex = 0;
        this._nodePriorityMap = new Dictionary<string, number>();

        this._visitTarget(rootNode, true);

        // After sort: priority < 0, > 0
        listeners.getSceneGraphPriorityListeners().sort(this._sortEventListenersOfSceneGraphPriorityDes);
    }
    _sortEventListenersOfSceneGraphPriorityDes(l1:EventListener, l2:EventListener):number {
        var locNodePriorityMap = this._nodePriorityMap;
        var node1 = l1._getSceneGraphPriority();
        var node2 = l2._getSceneGraphPriority();
        if (!l2 || !node2 || !locNodePriorityMap.get(<string><any>node2.__instanceId))
            return -1;
        else if (!l1 || !node1 || !locNodePriorityMap.get(<string><any>node1.__instanceId))
            return 1;
        return locNodePriorityMap.get(<string><any>l2._getSceneGraphPriority().__instanceId) - locNodePriorityMap.get(<string><any>l1._getSceneGraphPriority().__instanceId);
    }
    _sortListenersOfFixedPriority(listenerID:string) {
        var listeners = this._getListeners(listenerID);
        if (!listeners)
            return;

        var fixedListeners = listeners.getFixedPriorityListeners();
        if (!fixedListeners || fixedListeners.length === 0)
            return;
        // After sort: priority < 0, > 0
        fixedListeners.sort(this._sortListenersOfFixedPriorityAsc);

        // FIXME: Should use binary search
        var index = 0;
        for (var len = fixedListeners.length; index < len;) {
            if (fixedListeners[index]._getFixedPriority() >= 0)
                break;
            ++index;
        }
        listeners.gt0Index = index;
    }
    _sortListenersOfFixedPriorityAsc(l1:EventListener, l2:EventListener):number {
        return l1._getFixedPriority() - l2._getFixedPriority();
    }
    _onUpdateListeners(listeners:_EventListenerVector) {
        var fixedPriorityListeners = listeners.getFixedPriorityListeners();
        var sceneGraphPriorityListeners = listeners.getSceneGraphPriorityListeners();
        var i, selListener, idx, toRemovedListeners = this._toRemovedListeners;

        if (sceneGraphPriorityListeners) {
            for (i = 0; i < sceneGraphPriorityListeners.length;) {
                selListener = sceneGraphPriorityListeners[i];
                if (!selListener._isRegistered()) {
                    arrayRemoveObject(sceneGraphPriorityListeners, selListener);
                    // if item in toRemove list, remove it from the list
                    idx = toRemovedListeners.indexOf(selListener);
                    if(idx !== -1)
                        toRemovedListeners.splice(idx, 1);
                } else
                    ++i;
            }
        }

        if (fixedPriorityListeners) {
            for (i = 0; i < fixedPriorityListeners.length;) {
                selListener = fixedPriorityListeners[i];
                if (!selListener._isRegistered()) {
                    arrayRemoveObject(fixedPriorityListeners, selListener);
                    // if item in toRemove list, remove it from the list
                    idx = toRemovedListeners.indexOf(selListener);
                    if(idx !== -1)
                        toRemovedListeners.splice(idx, 1);
                } else
                    ++i;
            }
        }

        if (sceneGraphPriorityListeners && sceneGraphPriorityListeners.length === 0)
            listeners.clearSceneGraphListeners();

        if (fixedPriorityListeners && fixedPriorityListeners.length === 0)
            listeners.clearFixedListeners();
    }
    frameUpdateListeners() {
        var locListenersMap = this._listenersMap, locPriorityDirtyFlagMap = this._priorityDirtyFlagMap;
        for (var selKey in locListenersMap) {
            if (locListenersMap.get(selKey).empty()) {
                locPriorityDirtyFlagMap.clear();
                locListenersMap.clear();
                //delete locPriorityDirtyFlagMap[selKey];
                //delete locListenersMap[selKey];
            }
        }

        var locToAddedListeners = this._toAddedListeners;
        if (locToAddedListeners.length !== 0) {
            for (var i = 0, len = locToAddedListeners.length; i < len; i++)
                this._forceAddEventListener(locToAddedListeners[i]);
            locToAddedListeners.length = 0;
        }
        if (this._toRemovedListeners.length !== 0) {
            this._cleanToRemovedListeners();
        }
    }
    _updateTouchListeners(event:EventTouch) {
        var locInDispatch = this._inDispatch;
        assert(locInDispatch > 0, _LogInfos.EventManager__updateListeners);

        if (locInDispatch > 1)
            return;

        var listeners;
        listeners = this._listenersMap.get(_EventListenerTouchOneByOne.LISTENER_ID);
        if (listeners) {
            this._onUpdateListeners(listeners);
        }
        listeners = this._listenersMap.get(_EventListenerTouchAllAtOnce.LISTENER_ID);
        if (listeners) {
            this._onUpdateListeners(listeners);
        }
        locInDispatch+=1;
        locInDispatch-=1;

        assert(locInDispatch == 1, _LogInfos.EventManager__updateListeners_2);

        var locToAddedListeners = this._toAddedListeners;
        if (locToAddedListeners.length !== 0) {
            for (var i = 0, len = locToAddedListeners.length; i < len; i++)
                this._forceAddEventListener(locToAddedListeners[i]);
            locToAddedListeners.length = 0;
        }
        if (this._toRemovedListeners.length !== 0) {
            this._cleanToRemovedListeners();
        }
    }

    //Remove all listeners in _toRemoveListeners list and cleanup
    _cleanToRemovedListeners() {
        var toRemovedListeners = this._toRemovedListeners;
        for (var i = 0; i < toRemovedListeners.length; i++) {
            var selListener = toRemovedListeners[i];
            var listeners = this._getListeners(selListener._getListenerID());
            if (!listeners)
                continue;

            var idx, fixedPriorityListeners = listeners.getFixedPriorityListeners(),
                sceneGraphPriorityListeners = listeners.getSceneGraphPriorityListeners();

            if (sceneGraphPriorityListeners) {
                idx = sceneGraphPriorityListeners.indexOf(selListener);
                if (idx !== -1) {
                    sceneGraphPriorityListeners.splice(idx, 1);
                }
            }
            if (fixedPriorityListeners) {
                idx = fixedPriorityListeners.indexOf(selListener);
                if (idx !== -1) {
                    fixedPriorityListeners.splice(idx, 1);
                }
            }
        }
        toRemovedListeners.length = 0;
    }
    _onTouchEventCallback(listener:_EventListenerTouchOneByOne, argsObj:TouchArgsOneByOne):boolean {
        // Skip if the listener was removed.
        if (!listener._isRegistered)
            return false;

        var event = argsObj.event, selTouch: ccTouch = argsObj.selTouch;
        event._setCurrentTarget(listener._node);

        var isClaimed = false, removedIdx;
        var getCode = event.getEventCode(), eventCode = TouchEventCodes;
        if (getCode === eventCode.BEGAN) {
            if (listener.onTouchBegan) {
                isClaimed = listener.onTouchBegan(selTouch, event);
                if (isClaimed && listener._registered)
                    listener._claimedTouches.push(selTouch);
            }
        } else if (listener._claimedTouches.length > 0
            && ((removedIdx = listener._claimedTouches.indexOf(selTouch)) !== -1)) {
            isClaimed = true;
            if (getCode === eventCode.MOVED && listener.onTouchMoved) {
                listener.onTouchMoved(selTouch, event);
            } else if (getCode === eventCode.ENDED) {
                if (listener.onTouchEnded)
                    listener.onTouchEnded(selTouch, event);
                if (listener._registered)
                    listener._claimedTouches.splice(removedIdx, 1);
            } else if (getCode === eventCode.CANCELLED) {
                if (listener.onTouchCancelled)
                    listener.onTouchCancelled(selTouch, event);
                if (listener._registered)
                    listener._claimedTouches.splice(removedIdx, 1);
            }
        }

        // If the event was stopped, return directly.
        if (event.isStopped()) {
            this._updateTouchListeners(event);
            return true;
        }

        if (isClaimed && listener._registered && listener.swallowTouches) {
            if (argsObj.needsMutableSet)
                argsObj.touches.splice(1, 0, selTouch);
            return true;
        }
        return false;
    }
    _dispatchTouchEvent(event:EventTouch) {
        this._sortEventListeners(_EventListenerTouchOneByOne.LISTENER_ID);
        this._sortEventListeners(_EventListenerTouchAllAtOnce.LISTENER_ID);

        var oneByOneListeners = this._getListeners(_EventListenerTouchOneByOne.LISTENER_ID);
        var allAtOnceListeners = this._getListeners(_EventListenerTouchAllAtOnce.LISTENER_ID);

        // If there aren't any touch listeners, return directly.
        if (null === oneByOneListeners && null === allAtOnceListeners)
            return;

        var originalTouches = event.getTouches(), mutableTouches = copyArray(originalTouches);
        var oneByOneArgsObj:TouchArgsOneByOne = {
            event: event,
            needsMutableSet: !!(oneByOneListeners && allAtOnceListeners),
            touches: mutableTouches,
            selTouch: null
        };

        //
        // process the target handlers 1st
        //
        if (oneByOneListeners) {
            for (var i = 0; i < originalTouches.length; i++) {
                oneByOneArgsObj.selTouch = originalTouches[i];
                this._dispatchEventToListeners(oneByOneListeners, this._onTouchEventCallback, oneByOneArgsObj);
                if (event.isStopped())
                    return;
            }
        }

        //
        // process standard handlers 2nd
        //
        if (allAtOnceListeners && mutableTouches.length > 0) {
            var args:TouchArgsAtOnce = {event: event, touches: mutableTouches};

            this._dispatchEventToListeners(allAtOnceListeners, this._onTouchesEventCallback, args);
            if (event.isStopped())
                return;
        }
        this._updateTouchListeners(event);
    }
    _onTouchesEventCallback(listener:_EventListenerTouchAllAtOnce, callbackParams:TouchArgsAtOnce):boolean {
        // Skip if the listener was removed.
        if (!listener._registered)
            return false;

        var eventCode = TouchEventCodes;
        var event = callbackParams.event;
        var touches = callbackParams.touches;
        var getCode = event.getEventCode();
        event._setCurrentTarget(listener._node);
        if (getCode === eventCode.BEGAN && listener.onTouchesBegan)
            listener.onTouchesBegan(touches, event);
        else if (getCode === eventCode.MOVED && listener.onTouchesMoved)
            listener.onTouchesMoved(touches, event);
        else if (getCode === eventCode.ENDED && listener.onTouchesEnded)
            listener.onTouchesEnded(touches, event);
        else if (getCode === eventCode.CANCELLED && listener.onTouchesCancelled)
            listener.onTouchesCancelled(touches, event);

        // If the event was stopped, return directly.
        if (event.isStopped()) {
            this._updateTouchListeners(event);
            return true;
        }
        return false;
    }


    _associateNodeAndEventListener(node:ccNode, listener:EventListener) {

        var listeners = this._nodeListenersMap.get(node.__instanceId);
        if (!listeners) {
            listeners = [];
            this._nodeListenersMap.set(node.__instanceId, listeners);
        }
        listeners.push(listener);
    }
    _dissociateNodeAndEventListener(node:ccNode, listener:EventListener) {
        var listeners = this._nodeListenersMap.get(node.__instanceId);
        if (listeners) {
            arrayRemoveObject(listeners, listener);
            if (listeners.length === 0)
                this._nodeListenersMap.remove(node.__instanceId);
                //delete this._nodeListenersMap.get(node.__instanceId);
        }
    }

    _dispatchEventToListeners(listeners:_EventListenerVector,
        onEvent:(listener:EventListener, callbackParams?:any)=>boolean,
        eventOrArgs:any) {
        var shouldStopPropagation = false;
        var fixedPriorityListeners = listeners.getFixedPriorityListeners();
        var sceneGraphPriorityListeners = listeners.getSceneGraphPriorityListeners();

        var i = 0, j, selListener:EventListener;
        if (fixedPriorityListeners) {  // priority < 0
            if (fixedPriorityListeners.length !== 0) {
                for (; i < listeners.gt0Index; ++i) {
                    selListener = fixedPriorityListeners[i];
                    if (selListener.isEnabled() && !selListener._isPaused() && selListener._isRegistered() && onEvent(selListener, eventOrArgs)) {
                        shouldStopPropagation = true;
                        break;
                    }
                }
            }
        }

        if (sceneGraphPriorityListeners && !shouldStopPropagation) {    // priority == 0, scene graph priority
            for (j = 0; j < sceneGraphPriorityListeners.length; j++) {
                selListener = sceneGraphPriorityListeners[j];
                if (selListener.isEnabled() && !selListener._isPaused() && selListener._isRegistered() && onEvent(selListener, eventOrArgs)) {
                    shouldStopPropagation = true;
                    break;
                }
            }
        }

        if (fixedPriorityListeners && !shouldStopPropagation) {    // priority > 0
            for (; i < fixedPriorityListeners.length; ++i) {
                selListener = fixedPriorityListeners[i];
                if (selListener.isEnabled() && !selListener._isPaused() && selListener._isRegistered() && onEvent(selListener, eventOrArgs)) {
                    shouldStopPropagation = true;
                    break;
                }
            }
        }
    }

    _setDirty(listenerID:string, flag:DIRTY) {
        var locDirtyFlagMap = this._priorityDirtyFlagMap;
        if (locDirtyFlagMap.get(listenerID) == null)
            locDirtyFlagMap.set(listenerID, flag);
        else
            locDirtyFlagMap.set(listenerID, flag | locDirtyFlagMap.get(listenerID));
    }

    _visitTarget(node:ccNode, isRootNode:boolean) {
        var children = node.getChildren(), i = 0;
        var childrenCount = children.length;
        var locGlobalZOrderNodeMap = this._globalZOrderNodeMap;
        var locNodeListenersMap = this._nodeListenersMap;

        if (childrenCount > 0) {
            var child;
            // visit children zOrder < 0
            for (; i < childrenCount; i++) {
                child = children[i];
                if (child && child.getLocalZOrder() < 0)
                    this._visitTarget(child, false);
                else
                    break;
            }

            if (locNodeListenersMap.get(node.__instanceId) != null) {
                if (!locGlobalZOrderNodeMap.get(node.getGlobalZOrder()))
                    locGlobalZOrderNodeMap.set(node.getGlobalZOrder(), new Array<string>());
                locGlobalZOrderNodeMap.get(node.getGlobalZOrder()).push(<string><any>node.__instanceId);
            }

            for (; i < childrenCount; i++) {
                child = children[i];
                if (child)
                    this._visitTarget(child, false);
            }
        } else {

            if (locNodeListenersMap.get(node.__instanceId) != null) {
                if (!locGlobalZOrderNodeMap.get(node.getGlobalZOrder()))
                    locGlobalZOrderNodeMap.set(node.getGlobalZOrder(), new Array<string>());
                locGlobalZOrderNodeMap.get(node.getGlobalZOrder()).push(<string><any>node.__instanceId);
            }
        }

        if (isRootNode) {
            var globalZOrders: Array<number> = new Array<number>();
            for (var selKey in locGlobalZOrderNodeMap.keys)
                globalZOrders.push(<number><any>selKey);

            globalZOrders.sort(this._sortNumberAsc);

            var zOrdersLen = globalZOrders.length, selZOrders, j, locNodePriorityMap = this._nodePriorityMap;
            for (i = 0; i < zOrdersLen; i++) {
                selZOrders = locGlobalZOrderNodeMap.get(globalZOrders[i]);
                for (j = 0; j < selZOrders.length; j++)
                    locNodePriorityMap.set(selZOrders[j], ++this._nodePriorityIndex);
            }
            this._globalZOrderNodeMap = new Dictionary<number, Array<string>>();
        }
    }
    _sortNumberAsc(a: number, b: number):number {
        return a - b;
    }
/**
     * <p>
     * Adds a event listener for a specified event.                                                                                                            <br/>
     * if the parameter "nodeOrPriority" is a node, it means to add a event listener for a specified event with the priority of scene graph.                   <br/>
     * if the parameter "nodeOrPriority" is a Number, it means to add a event listener for a specified event with the fixed priority.                          <br/>
     * </p>
     * @param {cc.EventListener|Object} listener The listener of a specified event or a object of some event parameters.
     * @param {cc.Node|Number} nodeOrPriority The priority of the listener is based on the draw order of this node or fixedPriority The fixed priority of the listener.
     * @note  The priority of scene graph will be fixed value 0. So the order of listener item in the vector will be ' <0, scene graph (0 priority), >0'.
     *         A lower priority will be called before the ones that have a higher value. 0 priority is forbidden for fixed priority since it's used for scene graph based priority.
     *         The listener must be a cc.EventListener object when adding a fixed priority listener, because we can't remove a fixed priority listener without the listener handler,
     *         except calls removeAllListeners().
     * @return {cc.EventListener} Return the listener. Needed in order to remove the event from the dispatcher.
     */
    addListener(listener: EventListener, nodeOrPriority: number): EventListener;
    addListener(listener: EventListener, nodeOrPriority: ccNode): EventListener;
    addListener(listener:EventListener, nodeOrPriority: ccNode | number):EventListener {
        assert(!!listener && !!nodeOrPriority, _LogInfos.eventManager_addListener_2);
        //if (!(listener instanceof EventListener)) {
        //    assert(!isNumber(nodeOrPriority), _LogInfos.eventManager_addListener_3);
        //    listener = EventListener.create(listener);
        //} else {
            if (listener._isRegistered()) {
                log(_LogInfos.eventManager_addListener_4);
                return;
            }
        //}

        if (!listener.checkAvailable())
            return;

        if (isNumber(nodeOrPriority)) {
            if (nodeOrPriority === 0) {
                log(_LogInfos.eventManager_addListener);
                return;
            }

            listener._setSceneGraphPriority(null);
            listener._setFixedPriority(<number>nodeOrPriority);
            listener._setRegistered(true);
            listener._setPaused(false);
            this._addListener(listener);
        } else {
            listener._setSceneGraphPriority(<ccNode>nodeOrPriority);
            listener._setFixedPriority(0);
            listener._setRegistered(true);
            this._addListener(listener);
        }

        return listener;
    }


    /**
     * Adds a Custom event listener. It will use a fixed priority of 1.
     * @param {string} eventName
     * @param {function} callback
     * @return {cc.EventListener} the generated event. Needed in order to remove the event from the dispatcher
     */
    addCustomListener(eventName:string, callback:(event:Event)=>void, target?:any):EventListener {
        var listener = new _EventListenerCustom(eventName, callback, target);
        this.addListener(listener, 1);
        return listener;
    }


    /**
     * Remove a listener
     * @param {cc.EventListener} listener an event listener or a registered node target
     */
    removeListener(listener:EventListener) {
        if (listener == null)
            return;

        var isFound, locListener = this._listenersMap;
        for (var selKey in locListener) {
            var listeners = locListener.get(selKey);
            var fixedPriorityListeners = listeners.getFixedPriorityListeners(), sceneGraphPriorityListeners = listeners.getSceneGraphPriorityListeners();

            isFound = this._removeListenerInVector(sceneGraphPriorityListeners, listener);
            if (isFound){
                // fixed #4160: Dirty flag need to be updated after listeners were removed.
               this._setDirty(listener._getListenerID(), DIRTY.SCENE_GRAPH_PRIORITY);
            }else{
                isFound = this._removeListenerInVector(fixedPriorityListeners, listener);
                if (isFound)
                    this._setDirty(listener._getListenerID(), DIRTY.FIXED_PRIORITY);
            }

            if (listeners.empty()) {
                this._priorityDirtyFlagMap.remove(listener._getListenerID());
                locListener.remove(selKey);
                //delete this._priorityDirtyFlagMap[listener._getListenerID()];
                //delete locListener[selKey];
            }

            if (isFound)
                break;
        }

        if (!isFound) {
            var locToAddedListeners = this._toAddedListeners;
            for (var i = 0, len = locToAddedListeners.length; i < len; i++) {
                var selListener = locToAddedListeners[i];
                if (selListener === listener) {
                    arrayRemoveObject(locToAddedListeners, selListener);
                    selListener._setRegistered(false);
                    break;
                }
            }
        }
    }
    _removeListenerInCallback(listeners:Array<EventListener>, callback:(event:Event)=>void) {
        if (listeners == null)
            return false;

        for (var i = 0, len = listeners.length; i < len; i++) {
            var selListener = listeners[i];
            if ((<any>selListener)._onCustomEvent === callback || selListener._onEvent === callback) {
                selListener._setRegistered(false);
                if (selListener._getSceneGraphPriority() != null) {
                    this._dissociateNodeAndEventListener(selListener._getSceneGraphPriority(), selListener);
                    selListener._setSceneGraphPriority(null);         // NULL out the node pointer so we don't have any dangling pointers to destroyed nodes.
                }

                if (this._inDispatch === 0)
                    arrayRemoveObject(listeners, selListener);
                return true;
            }
        }
        return false;
    }

    _removeListenerInVector(listeners:Array<EventListener>, listener:EventListener) {
        if (listeners == null)
            return false;

        for (var i = 0, len = listeners.length; i < len; i++) {
            var selListener = listeners[i];
            if (selListener === listener) {
                selListener._setRegistered(false);
                if (selListener._getSceneGraphPriority() != null) {
                    this._dissociateNodeAndEventListener(selListener._getSceneGraphPriority(), selListener);
                    selListener._setSceneGraphPriority(null);         // NULL out the node pointer so we don't have any dangling pointers to destroyed nodes.
                }

                if (this._inDispatch === 0)
                    arrayRemoveObject(listeners, selListener);
                else
                    this._toRemovedListeners.push(selListener);
                return true;
            }
        }
        return false;
    }



    /**
     * Removes all listeners with the same event listener type or removes all listeners of a node
     * @param {Number|cc.Node} listenerType listenerType or a node
     * @param {Boolean} [recursive=false]
     */
    removeListeners(listenerType: EventListenerTypes | ccNode, recursive:boolean = false) {
        if (listenerType instanceof ccNode) {
            // Ensure the node is removed from these immediately also.
            // Don't want any dangling pointers or the possibility of dealing with deleted objects..
            this._nodePriorityMap.remove(<string><any>listenerType.__instanceId)
            //delete _t._nodePriorityMap[listenerType.__instanceId];
            arrayRemoveObject(this._dirtyNodes, listenerType);
            var listeners = this._nodeListenersMap.get(listenerType.__instanceId);
            var i;
            if (listeners) {
                var listenersCopy = copyArray(listeners);
                for (i = 0; i < listenersCopy.length; i++)
                    this.removeListener(listenersCopy[i]);
                listenersCopy.length = 0;
            }

            // Bug fix: ensure there are no references to the node in the list of listeners to be added.
            // If we find any listeners associated with the destroyed node in this list then remove them.
            // This is to catch the scenario where the node gets destroyed before it's listener
            // is added into the event dispatcher fully. This could happen if a node registers a listener
            // and gets destroyed while we are dispatching an event (touch etc.)
            var locToAddedListeners = this._toAddedListeners;
            for (i = 0; i < locToAddedListeners.length; ) {
                var listener = locToAddedListeners[i];
                if (listener._getSceneGraphPriority() === listenerType) {
                    listener._setSceneGraphPriority(null);                      // Ensure no dangling ptr to the target node.
                    listener._setRegistered(false);
                    locToAddedListeners.splice(i, 1);
                } else
                    ++i;
            }

            if (recursive === true) {
                var locChildren = listenerType.getChildren(), len;
                for (i = 0, len = locChildren.length; i< len; i++)
                    this.removeListeners(locChildren[i], true);
            }
        } else {

            if (listenerType === EventListenerTypes.TOUCH_ONE_BY_ONE)
                this._removeListenersForListenerID(_EventListenerTouchOneByOne.LISTENER_ID);
            else if (listenerType === EventListenerTypes.TOUCH_ALL_AT_ONCE)
                this._removeListenersForListenerID(_EventListenerTouchAllAtOnce.LISTENER_ID);
            else if (listenerType === EventListenerTypes.MOUSE)
                this._removeListenersForListenerID(_EventListenerMouse.LISTENER_ID);
            else if (listenerType === EventListenerTypes.ACCELERATION)
                this._removeListenersForListenerID(_EventListenerAcceleration.LISTENER_ID);
            else if (listenerType === EventListenerTypes.KEYBOARD)
                this._removeListenersForListenerID(_EventListenerKeyboard.LISTENER_ID);
            else
                log(_LogInfos.eventManager_removeListeners);
        }
    }

    /**
     * Removes all custom listeners with the same event name
     * @param {string} customEventName
     */
    removeCustomListeners(customEventName:string) {
        this._removeListenersForListenerID(customEventName);
    }

    /**
     * Removes all listeners
     */
    removeAllListeners() {
        var locListeners = this._listenersMap, locInternalCustomEventIDs = this._internalCustomListenerIDs;
        for (var selKey in locListeners) {
            if (locInternalCustomEventIDs.indexOf(selKey) === -1)
                this._removeListenersForListenerID(selKey);
        }
    }

    /**
     * Sets listener's priority with fixed value.
     * @param {cc.EventListener} listener
     * @param {Number} fixedPriority
     */
    setPriority(listener:EventListener, fixedPriority:number) {
        if (listener == null)
            return;

        var locListeners = this._listenersMap;
        for (var selKey in locListeners) {
            var selListeners = locListeners.get(selKey);
            var fixedPriorityListeners = selListeners.getFixedPriorityListeners();
            if (fixedPriorityListeners) {
                var found = fixedPriorityListeners.indexOf(listener);
                if (found !== -1) {
                    if (listener._getSceneGraphPriority() != null)
                        log(_LogInfos.eventManager_setPriority);
                    if (listener._getFixedPriority() !== fixedPriority) {
                        listener._setFixedPriority(fixedPriority);
                        this._setDirty(listener._getListenerID(), DIRTY.FIXED_PRIORITY);
                    }
                    return;
                }
            }
        }
    }

    /**
     * Whether to enable dispatching events
     * @param {boolean} enabled
     */
    setEnabled(enabled:boolean) {
        this._isEnabled = enabled;
    }

    /**
     * Checks whether dispatching events is enabled
     * @returns {boolean}
     */
    isEnabled():boolean {
        return this._isEnabled;
    }

    /**
     * Dispatches the event, also removes all EventListeners marked for deletion from the event dispatcher list.
     * @param {cc.Event} event
     */
    dispatchEvent(event:Event) {
        if (!this._isEnabled)
            return;

        this._updateDirtyFlagForSceneGraph();
        this._inDispatch++;
        if (!event || !event.getType)
            throw new Error("event is undefined");
        if (event._type === EventTypes.TOUCH) {
            this._dispatchTouchEvent(<any>event);
            this._inDispatch--;
            return;
        }

        var listenerID = __getListenerID(event);
        this._sortEventListeners(listenerID);
        var selListeners = this._listenersMap.get(listenerID);
        if (selListeners) {
            this._dispatchEventToListeners(selListeners, this._onListenerCallback, event);
            this._onUpdateListeners(selListeners);
        }

        this._inDispatch--;
    }

    _onListenerCallback(listener:EventListener, event:Event) {
        event._setCurrentTarget(listener._getSceneGraphPriority());
        listener._onEvent(event);
        return event.isStopped();
    }

    /**
     * Dispatches a Custom Event with a event name an optional user data
     * @param {string} eventName
     * @param {*} optionalUserData
     */
    dispatchCustomEvent(eventName:string, optionalUserData?:any) {
        var ev = new EventCustom(eventName);
        ev.setUserData(optionalUserData);
        this.dispatchEvent(ev);
    }


}

export var eventManager = new EventManager();