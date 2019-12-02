import { ccNode } from "../base-nodes/index";
import { director } from "../CCDirector";
import { LayerRenderCmd } from "./CCLayerRenderCmd";
import { game, RENDER_TYPE } from "../../../startup/CCGame";
import { BlendFunc, Color, color } from "../platform/index";
import { _dirtyFlags } from "../base-nodes/CCRenderCmd";
import { Point, p, Size } from "../cocoa/index";
import { log, _LogInfos } from "../../../startup/CCDebugger";
import { Layer_CanvasRenderCmd, LayerColor_CanvasRenderCmd, LayerGradient_CanvasRenderCmd } from "./CCLayerCanvasRenderCmd";
import { LayerColor_WebGLRenderCmd, LayerGradient_WebGLRenderCmd, Layer_WebGLRenderCmd } from "./CCLayerWebGLRenderCmd";

/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

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

/** cc.Layer is a subclass of cc.Node that implements the TouchEventsDelegate protocol.<br/>
 * All features from cc.Node are valid, plus the bake feature: Baked layer can cache a static layer to improve performance
 * @class
 * @extends cc.Node
 */
export class Layer extends ccNode {
    _className = "Layer";

    constructor() {
        super();

        this._ignoreAnchorPointForPosition = true;
        this.setAnchorPoint(0.5, 0.5);
        this.setContentSize(director.getWinSize());
        this._cascadeColorEnabled = false;
        this._cascadeOpacityEnabled = false;
    }

    get renderCmd(): LayerRenderCmd {
        return <LayerRenderCmd>super.renderCmd;
    }
    /**
     * Sets the layer to cache all of children to a bake sprite, and draw itself by bake sprite. recommend using it in UI.<br/>
     * This is useful only in html5 engine
     * @function
     * @see cc.Layer#unbake
     */
    bake(): void {
        this.renderCmd.bake();
    }
    /**
     * Cancel the layer to cache all of children to a bake sprite.<br/>
     * This is useful only in html5 engine
     * @function
     * @see cc.Layer#bake
     */
    unbake(): void {
        this.renderCmd.unbake();
    }
    /**
     * Determines if the layer is baked.
     * @function
     * @returns {boolean}
     * @see cc.Layer#bake and cc.Layer#unbake
     */
    isBaked(): boolean {
        return this.renderCmd._isBaked;
    }

    visit(parent?:ccNode): void {
        var cmd = this.renderCmd, parentCmd = parent ? parent.renderCmd : null;

        // quick return if not visible
        if (!this._visible) {
            cmd._propagateFlagsDown(parentCmd);
            return;
        }

        var renderer = game.renderer;
        cmd.visit(parentCmd);

        if (cmd._isBaked) {
            renderer.pushRenderCommand(cmd);
            cmd._bakeSprite.visit(this);
        }
        else {
            var i, children = this._children, len = children.length, child;
            if (len > 0) {
                if (this._reorderChildDirty) {
                    this.sortAllChildren();
                }
                // draw children zOrder < 0
                for (i = 0; i < len; i++) {
                    child = children[i];
                    if (child._localZOrder < 0) {
                        child.visit(this);
                    }
                    else {
                        break;
                    }
                }

                renderer.pushRenderCommand(cmd);
                for (; i < len; i++) {
                    children[i].visit(this);
                }
            } else {
                renderer.pushRenderCommand(cmd);
            }
        }
        cmd._dirtyFlag = 0;
    }
    addChild(child:ccNode, localZOrder?:number, tag?:string | number) {
        super.addChild(child, localZOrder, tag);
        this.renderCmd._bakeForAddChild(child);
    }
    _createRenderCmd():LayerRenderCmd {
        if (game.renderType === RENDER_TYPE.CANVAS)
            return new Layer_CanvasRenderCmd(this);
        else
            return new Layer_WebGLRenderCmd(this);
    }

    get renderCmdWebGl(): Layer_WebGLRenderCmd {
        return <Layer_WebGLRenderCmd>this._renderCmd;
    }
    get renderCmdCanvas(): Layer_CanvasRenderCmd {
        return <Layer_CanvasRenderCmd>this._renderCmd;
    }
}

/**
 * <p>
 * CCLayerColor is a subclass of CCLayer that implements the CCRGBAProtocol protocol.       <br/>
 *  All features from CCLayer are valid, plus the following new features:                   <br/>
 * - opacity                                                                     <br/>
 * - RGB colors                                                                  </p>
 * @class
 * @extends cc.Layer
 *
 * @param {cc.Color} [color=] The color of the layer
 * @param {Number} [width=] The width of the layer
 * @param {Number} [height=] The height of the layer
 *
 * @example
 * // Example
 * //Create a yellow color layer as background
 * var yellowBackground = new cc.LayerColor(cc.color(255,255,0,255));
 * //If you didn't pass in width and height, it defaults to the same size as the canvas
 *
 * //create a yellow box, 200 by 200 in size
 * var yellowBox = new cc.LayerColor(cc.color(255,255,0,255), 200, 200);
 */

export class LayerColor extends Layer {
    _blendFunc: BlendFunc = null;
    _className = "LayerColor";

    constructor(color?: Color, width?: number, height?: number)  {
        super();
        this._blendFunc = BlendFunc._alphaNonPremultiplied;

        this.init(color, width, height);
    }

    /**
     * Returns the blend function
     * @return {cc.BlendFunc}
     */
    getBlendFunc(): BlendFunc {
        return this._blendFunc;
    }

    setOpacityModifyRGB(value:boolean):void {
    }

    isOpacityModifyRGB():boolean {
        return false;
    }

    /**
     * Initialization of the layer, please do not call this function by yourself, you should pass the parameters to constructor to initialize a layer
     * @param {cc.Color} [color=]
     * @param {Number} [width=]
     * @param {Number} [height=]
     * @return {Boolean}
     */
    init(layerColor?: Color, width?: number, height?: number): boolean {
        var winSize = director.getWinSize();
        layerColor = layerColor || color(0, 0, 0, 255);
        width = width === undefined ? winSize.width : width;
        height = height === undefined ? winSize.height : height;

        var locRealColor = this._realColor;
        locRealColor.r = layerColor.r;
        locRealColor.g = layerColor.g;
        locRealColor.b = layerColor.b;
        this._realOpacity = layerColor.a;
        this._renderCmd.setDirtyFlag(_dirtyFlags.colorDirty | _dirtyFlags.opacityDirty);


        this.setContentSize(width, height);
        return true;
    }

    visit(parent?: ccNode): void {
        var cmd = <Layer_CanvasRenderCmd>this.renderCmd, parentCmd = parent ? parent.renderCmd : null;

        // quick return if not visible
        if (!this._visible) {
            cmd._propagateFlagsDown(parentCmd);
            return;
        }

        var renderer = game.renderer;
        cmd.visit(parentCmd);

        if (cmd._isBaked) {
            renderer.pushRenderCommand(cmd._bakeRenderCmd);
            //the bakeSprite is drawing
            cmd._bakeSprite._renderCmd.setDirtyFlag(_dirtyFlags.transformDirty);
            cmd._bakeSprite.visit(this);
        }
        else {
            var i, children = this._children, len = children.length;
            if (len > 0) {
                if (this._reorderChildDirty) {
                    this.sortAllChildren();
                }
                // draw children zOrder < 0
                for (i = 0; i < len; i++) {
                    var child = children[i];
                    if (child._localZOrder < 0) {
                        child.visit(this);
                    }
                    else {
                        break;
                    }
                }

                renderer.pushRenderCommand(cmd);
                for (; i < len; i++) {
                    children[i].visit(this);
                }
            } else {
                renderer.pushRenderCommand(cmd);
            }
        }

        cmd._dirtyFlag = 0;
    }
    /**
     * Sets the blend func, you can pass either a cc.BlendFunc object or source and destination value separately
     * @param {Number|cc.BlendFunc} src
     * @param {Number} [dst]
     */
    setBlendFunc(src?:BlendFunc | number, dst?:number) {
        var locBlendFunc = this._blendFunc;
        if (dst === undefined) {
            src = <BlendFunc>src;
            locBlendFunc.src = src.src;
            locBlendFunc.dst = src.dst;
        } else {
            src = <number>src;
            locBlendFunc.src = src;
            locBlendFunc.dst = dst;
        }
        this.renderCmd.updateBlendFunc(locBlendFunc);
    }
    _createRenderCmd(): LayerRenderCmd {
        if (game.renderType === RENDER_TYPE.CANVAS)
            return new LayerColor_CanvasRenderCmd(this);
        else
            return new LayerColor_WebGLRenderCmd(this);
    }

}


export interface ColorStop {
    p: number;
    color: Color;
}

/**
 * <p>
 * CCLayerGradient is a subclass of cc.LayerColor that draws gradients across the background.<br/>
 *<br/>
 * All features from cc.LayerColor are valid, plus the following new features:<br/>
 * <ul><li>direction</li>
 * <li>final color</li>
 * <li>interpolation mode</li></ul>
 * <br/>
 * Color is interpolated between the startColor and endColor along the given<br/>
 * vector (starting at the origin, ending at the terminus).  If no vector is<br/>
 * supplied, it defaults to (0, -1) -- a fade from top to bottom.<br/>
 * <br/>
 * If 'compressedInterpolation' is disabled, you will not see either the start or end color for<br/>
 * non-cardinal vectors; a smooth gradient implying both end points will be still<br/>
 * be drawn, however.<br/>
 *<br/>
 * If 'compressedInterpolation' is enabled (default mode) you will see both the start and end colors of the gradient.
 * </p>
 * @class
 * @extends cc.LayerColor
 *
 * @param {cc.Color} start Starting color
 * @param {cc.Color} end Ending color
 * @param {cc.Point} [v=cc.p(0, -1)] A vector defines the gradient direction, default direction is from top to bottom
 *
 * @property {cc.Color} startColor              - Start color of the color gradient
 * @property {cc.Color} endColor                - End color of the color gradient
 * @property {Number}   startOpacity            - Start opacity of the color gradient
 * @property {Number}   endOpacity              - End opacity of the color gradient
 * @property {Number}   vector                  - Direction vector of the color gradient
 * @property {Number}   compressedInterpolation  - Indicate whether or not the interpolation will be compressed
 */
export class LayerGradient extends LayerColor {
    _endColor:Color = null;
    _startOpacity = 255;
    _endOpacity = 255;
    _alongVector: Point = null;
    _compressedInterpolation = false;
    _className = "LayerGradient";
    _colorStops = new Array<ColorStop>();



/**
 * Constructor of cc.LayerGradient
 * @param {cc.Color} start
 * @param {cc.Color} end
 * @param {cc.Point} [v=cc.p(0, -1)]
 * @param {Array|Null} stops
 *
 * @example Using ColorStops argument:
 * //startColor & endColor are for default and backward compatibility
 * var layerGradient = new cc.LayerGradient(cc.color.RED, new cc.Color(255,0,0,0), cc.p(0, -1),
 *                                          [{p:0, color: cc.color.RED},
 *                                           {p:.5, color: new cc.Color(0,0,0,0)},
 *                                           {p:1, color: cc.color.RED}]);
 * //where p = A value between 0.0 and 1.0 that represents the position between start and end in a gradient
 *
 */
    constructor(start:Color, end?:Color, v?:Point, stops?:Array<ColorStop>) {
        super();
        this._endColor = color(0, 0, 0, 255);
        this._alongVector = p(0, -1);
        this._startOpacity = 255;
        this._endOpacity = 255;

        if (stops && stops instanceof Array) {
            this._colorStops = stops;
            stops.splice(0, 0, { p: 0, color: start || Color.BLACK });
            stops.push({ p: 1, color: end || Color.BLACK });
        } else
            this._colorStops = [{ p: 0, color: start || Color.BLACK }, { p: 1, color: end || Color.BLACK }];

        this.gradientInit(start, end, v, stops);
    }

    /**
     * Initialization of the layer, please do not call this function by yourself, you should pass the parameters to constructor to initialize a layer
     * @param {cc.Color} start starting color
     * @param {cc.Color} end
     * @param {cc.Point|Null} v
     * @param {Array|Null} stops
     * @return {Boolean}
     */
    gradientInit(start: Color, end?: Color, v?: Point, stops?: Array<ColorStop>): boolean {
        start = start || color(0, 0, 0, 255);
        end = end || color(0, 0, 0, 255);
        v = v || p(0, -1);
        var _t = this;

        // Initializes the CCLayer with a gradient between start and end in the direction of v.
        var locEndColor = _t._endColor;
        _t._startOpacity = start.a;

        locEndColor.r = end.r;
        locEndColor.g = end.g;
        locEndColor.b = end.b;
        _t._endOpacity = end.a;

        _t._alongVector = v;
        _t._compressedInterpolation = true;
        super.init(color(start.r, start.g, start.b, 255));

        this._renderCmd.setDirtyFlag(_dirtyFlags.colorDirty | _dirtyFlags.opacityDirty | _dirtyFlags.gradientDirty);
        return true;
    }
    /**
     * Sets the untransformed size of the LayerGradient.
     * @param {cc.Size|Number} size The untransformed size of the LayerGradient or The untransformed size's width of the LayerGradient.
     * @param {Number} [height] The untransformed size's height of the LayerGradient.
     */
    setContentSize(size: Size): void
    setContentSize(width: number, height: number): void
    setContentSize(size: Size | number, height?: number): void {
        if (height == undefined) {
            super.setContentSize(<Size>size);
        } else {
            super.setContentSize(<number>size, height);
        }

        this._renderCmd.setDirtyFlag(_dirtyFlags.gradientDirty);
    }

    /**
     * Returns the starting color
     * @return {cc.Color}
     */
    getStartColor(): Color {
        return color(this._realColor);
    }

/**
 * Sets the starting color
 * @param {cc.Color} color
 * @example
 * // Example
 * myGradientLayer.setStartColor(cc.color(255,0,0));
 * //set the starting gradient to red
 */
    setStartColor(color: Color): void {
        this.color = color;
        //update the color stops
        var stops = this._colorStops;
        if (stops && stops.length > 0) {
            var selColor = stops[0].color;
            selColor.r = color.r;
            selColor.g = color.g;
            selColor.b = color.b;
        }
    }


    /**
     * Sets the end gradient color
     * @param {cc.Color} color
     * @example
     * // Example
     * myGradientLayer.setEndColor(cc.color(255,0,0));
     * //set the ending gradient to red
     */
    setEndColor(color: Color): void {
        var locColor = this._endColor;
        locColor.r = color.r;
        locColor.g = color.g;
        locColor.b = color.b;
        //update the color stops
        var stops = this._colorStops;
        if (stops && stops.length > 0) {
            var selColor = stops[stops.length - 1].color;
            selColor.r = color.r;
            selColor.g = color.g;
            selColor.b = color.b;
        }
        this._renderCmd.setDirtyFlag(_dirtyFlags.colorDirty);
    }

/**
 * Returns the end color
 * @return {cc.Color}
 */
    getEndColor(): Color {
        return color(this._endColor);
    }


    /**
     * Sets starting gradient opacity
     * @param {Number} o from 0 to 255, 0 is transparent
     */
    setStartOpacity(o: number): void {
        this._startOpacity = o;
        //update the color stops
        var stops = this._colorStops;
        if (stops && stops.length > 0)
            stops[0].color.a = o;
        this._renderCmd.setDirtyFlag(_dirtyFlags.opacityDirty);
    }

/**
 * Returns the starting gradient opacity
 * @return {Number}
 */
    getStartOpacity(): number {
        return this._startOpacity;
    }

/**
 * Sets the end gradient opacity
 * @param {Number} o
 */
    setEndOpacity(o: number): void {
        this._endOpacity = o;
        var stops = this._colorStops;
        if (stops && stops.length > 0)
            stops[stops.length - 1].color.a = o;
        this._renderCmd.setDirtyFlag(_dirtyFlags.opacityDirty);
    }

/**
 * Returns the end gradient opacity
 * @return {Number}
 */
    getEndOpacity(): number {
        return this._endOpacity;
    }

/**
 * Sets the direction vector of the gradient
 * @param {cc.Point} Var
 */
    setVector(Var: Point): void {
        this._alongVector.x = Var.x;
        this._alongVector.y = Var.y;
        this._renderCmd.setDirtyFlag(_dirtyFlags.gradientDirty);
    }

/**
 * Returns the direction vector of the gradient
 * @return {cc.Point}
 */
    getVector(): Point {
        return p(this._alongVector.x, this._alongVector.y);
    }

/**
 * Returns whether compressed interpolation is enabled
 * @return {Boolean}
 */
    isCompressedInterpolation(): boolean {
        return this._compressedInterpolation;
    }

/**
 * Sets whether compressed interpolation is enabled
 * @param {Boolean} compress
 */
    setCompressedInterpolation(compress: boolean) {
        this._compressedInterpolation = compress;
        this._renderCmd.setDirtyFlag(_dirtyFlags.gradientDirty);
    }

/**
 * Return an array of Object representing a colorStop for the gradient, if no stops was specified
 * start & endColor will be provided as default values
 * @example
 * [{p: 0, color: cc.color.RED},{p: 1, color: cc.color.RED},...]
 * @returns {Array}
 */
    getColorStops(): Array<ColorStop> {
        return this._colorStops;
    }
/**
 * Set the colorStops to create the gradient using multiple point & color
 *
 * @param colorStops
 *
 * @example
 * //startColor & endColor are for default and backward compatibility
 * var layerGradient = new cc.LayerGradient(cc.color.RED, new cc.Color(255,0,0,0), cc.p(0, -1));
 * layerGradient.setColorStops([{p:0, color: cc.color.RED},
 *                              {p:.5, color: new cc.Color(0,0,0,0)},
 *                              {p:1, color: cc.color.RED}]);
 * //where p = A value between 0.0 and 1.0 that represents the position between start and end in a gradient
 *
 */
    setColorStops(colorStops: Array<ColorStop>): void {
        this._colorStops = colorStops;
        //todo need update  the start color and end color
        this._renderCmd.setDirtyFlag(_dirtyFlags.colorDirty | _dirtyFlags.opacityDirty | _dirtyFlags.gradientDirty);
    }

    _createRenderCmd(): LayerRenderCmd {
        if (game.renderType === RENDER_TYPE.CANVAS)
            return new LayerGradient_CanvasRenderCmd(this);
        else
            return new LayerGradient_WebGLRenderCmd(this);
    }

    set startColor(value: Color) {
        this.setStartColor(value);
    }
    get startColor(): Color {
        return this.getStartColor();
    }
    set endColor(value: Color) {
        this.setEndColor(value);
    }
    get endColor(): Color {
        return this.getEndColor();
    }
    set startOpacity(value: number) {
        this.setStartOpacity(value);
    }
    get startOpacity(): number {
        return this.getStartOpacity();
    }
    set endOpacity(value: number) {
        this.setEndOpacity(value);
    }
    get endOpacity(): number {
        return this.getEndOpacity();
    }
    set vector(value: Point) {
        this.setVector(value);
    }
    get vector(): Point {
        return this.getVector();
    }
    set colorStops(value: Array<ColorStop>) {
        this.setColorStops(value);
    }
    get colorStops(): Array<ColorStop> {
        return this.getColorStops();
    }

}

/**
 * CCMultipleLayer is a CCLayer with the ability to multiplex it's children.<br/>
 * Features:<br/>
 *  <ul><li>- It supports one or more children</li>
 *  <li>- Only one children will be active a time</li></ul>
 * @class
 * @extends cc.Layer
 * @param {Array} layers an array of cc.Layer
 * @example
 * // Example
 * var multiLayer = new cc.LayerMultiple(layer1, layer2, layer3);//any number of layers
 */
export class LayerMultiplex extends Layer {
    _enabledLayer = 0;
    _layers: Array<Layer> = null;
    _className = "LayerMultiplex";

    /**
     * Constructor of cc.LayerMultiplex
     * @param {Array} layers an array of cc.Layer
     */
    constructor(layers?: Array<Layer>) {
        super();
        this.initWithLayers(layers);
    }
    /**
     * Initialization of the layer multiplex, please do not call this function by yourself, you should pass the parameters to constructor to initialize a layer multiplex
     * @param {Array} layers an array of cc.Layer
     * @return {Boolean}
     */
    initWithLayers(layers: Array<Layer>): boolean {
        if (!layers || ((layers.length > 0) && (layers[layers.length - 1] == null)))
            log(_LogInfos.LayerMultiplex_initWithLayers);

        this._layers = layers;
        this._enabledLayer = 0;
        this.addChild(this._layers[this._enabledLayer]);
        return true;
    }
    /**
     * Switches to a certain layer indexed by n.<br/>
     * The current (old) layer will be removed from it's parent with 'cleanup:YES'.
     * @param {Number} n the layer index to switch to
     */
    switchTo(n: number): void {
        if (n >= this._layers.length) {
            log(_LogInfos.LayerMultiplex_switchTo);
            return;
        }

        this.removeChild(this._layers[this._enabledLayer], true);
        this._enabledLayer = n;
        this.addChild(this._layers[n]);
    }

    /**
     * Release the current layer and switches to another layer indexed by n.<br/>
     * The current (old) layer will be removed from it's parent with 'cleanup:YES'.
     * @param {Number} n the layer index to switch to
     */
    switchToAndReleaseMe(n: number): void {
        if (n >= this._layers.length) {
            log(_LogInfos.LayerMultiplex_switchToAndReleaseMe);
            return;
        }

        this.removeChild(this._layers[this._enabledLayer], true);

        //[layers replaceObjectAtIndex:_enabledLayer withObject:[NSNull null]];
        this._layers[this._enabledLayer] = null;
        this._enabledLayer = n;
        this.addChild(this._layers[n]);
    }
    /**
     * Add a layer to the multiplex layers list
     * @param {cc.Layer} layer
     */
    addLayer(layer: Layer): void {
        if (!layer) {
            log(_LogInfos.LayerMultiplex_addLayer);
            return;
        }
        this._layers.push(layer);
    }


}