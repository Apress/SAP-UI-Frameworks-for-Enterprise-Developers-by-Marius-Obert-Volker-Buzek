/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.statusindicator.CustomShape.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"../library",
	"sap/suite/ui/commons/statusindicator/ShapeGroup",
	"sap/suite/ui/commons/statusindicator/Shape",
	"sap/suite/ui/commons/statusindicator/Path",
	"sap/suite/ui/commons/statusindicator/Circle",
	"sap/suite/ui/commons/statusindicator/Rectangle",
	"sap/suite/ui/commons/util/HtmlElement",
	"sap/base/Log",
	"./CustomShapeRenderer"
], function (jQuery, library, ShapeGroup, Shape, Path, Circle, Rectangle, HtmlElement, Log, CustomShapeRenderer) {
	"use strict";

	var FillingType = library.statusindicator.FillingType;

	/**
	 * Constructor for a new CustomShape.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Custom shape that is defined directly as SVG.
	 * @extends sap.suite.ui.commons.statusindicator.Shape
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.50
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.commons.statusindicator.CustomShape
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) design time metamodel.
	 */
	var CustomShape = Shape.extend("sap.suite.ui.commons.statusindicator.CustomShape",
		/** @lends sap.suite.ui.commons.statusindicator.Shape.prototype */
		{
			metadata: {
				library: "sap.suite.ui.commons",
				properties: {

					/**
					 * Defines the x coordinate of the upper-left corner of the bounding rectangle.
					 */
					x: {type: "int", defaultValue: 0},

					/**
					 * Defines the y coordinate of the upper-left corner of the bounding rectangle.
					 */
					y: {type: "int", defaultValue: 0},

					/**
					 * Defines the width of the bounding rectangle.
					 */
					width: {type: "sap.ui.core.CSSSize", defaultValue: "100%"},

					/**
					 * Defines the height of the bounding rectangle.
					 */
					height: {type: "sap.ui.core.CSSSize", defaultValue: "100%"},

					/**
					 * Specifies the color of the shape's outline.
					 */
					strokeColor: {type: "sap.m.ValueCSSColor", defaultValue: "Neutral"},

					/**
					 * Specifies the width of the shape's outline.
					 */
					strokeWidth: {type: "float", defaultValue: 0.25},

					/**
					 * A valid XML fragment that contains an &lt;svg&gt; element that complies with the following
					 * requirements:
					 * <ul>
					 *     <li>It includes no SVG groups (&lt;g&gt; elements).</li>
					 *     <li>It includes no &lt;defs&gt; elements.</li>
					 * </ul>
					 * The SVG element is transformed into a status indicator shape in the following way:
					 * <ul>
					 *     <li>The <code>viewBox</code> attribute of the root SVG element is respected and kept after the transformation.</li>
					 *     <li>The inline styles of SVG shapes are respected, and shapes with such inline styles are not considered to be fillable.</li>
					 *     <li>The SVG shapes without classes are considered fillable.</li>
					 *     <li>If there are multiple fillable shapes, each shape element must have a <code>data-shape-id</code> attribute that is set to a unique value.</li>
					 * </ul>
					 * Example:
					 * <pre>
					 *   &lt;svg version=&quot;1.1&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot; xmlns:xlink=&quot;http://www.w3.org/1999/xlink&quot; viewBox=&quot;0 0 30 30&quot; xml:space=&quot;preserve&quot;&gt;
					 *      &lt;path style=&quot;fill:blue;&quot; d=&quot;M14.664,29....&quot; /&gt;
					 *      &lt;path style=&quot;fill:blue;&quot; d=&quot;M13.626,25....&quot; /&gt;
					 *      &lt;path data-shape-id=&quot;fill-1&quot; d=&quot;M15.337,21....&quot; /&gt;
					 *      &lt;path data-shape-id=&quot;fill-2&quot; d=&quot;M13.626,17....&quot; /&gt;
					 *      &lt;path data-shape-id=&quot;fill-3&quot; d=&quot;M15.337,14....&quot; /&gt;
					 *      &lt;path data-shape-id=&quot;fill-4&quot; d=&quot;M13.107,10....&quot; /&gt;
					 *   &lt;/svg&gt;
					 * </pre>
					 * The first two paths in this example are filled with blue color. The last four shape elements are filled gradually, as
					 * the status indicator's value changes.
					 *
					 * Please note that the SVG element must be escaped when used directly as an attribute in the XML view.
					 */
					definition: {type: "string", defaultValue: null}
				},
				defaultAggregation: "shapes",
				aggregations: {

					/**
					 * Read-only aggregation that contains simple shapes transformed from the SVG definition.
					 */
					shapes: {
						type: "sap.suite.ui.commons.statusindicator.SimpleShape",
						multiple: true,
						defaultValue: null
					},

					/**
					 * Defines the order and weight of fillable shapes based on the status indicator value distribution.
					 * If this aggregation is not used, the shapes are filled in the order they are specified in the SVG definition.
					 */
					fillingOptions: {
						type: "sap.suite.ui.commons.statusindicator.FillingOption",
						multiple: true,
						defaultValue: null
					}
				}
			}
		});

	CustomShape.prototype.init = function () {
		if (Shape.prototype.init) {
			Shape.prototype.init.apply(this, arguments);
		}

		this._iDisplayedValue = 0;
		this._initShapeState();
	};

	CustomShape.prototype.onBeforeRendering = function () {
		this._refreshInternalStructure();
	};

	CustomShape.prototype.onAfterRendering = function() {
		// CustomShape stores its (currently) displayedValue only in its instance
		// and instantiates internally new Shape objects every time it is rerendered.
		// This means that at the time of rendering, inner Shapes doesn't know its displayedValue
		// and they need to be updated here after rendering, so that the current value of CustomShape is rendered instead of no value
		this._updateDom(this.getDisplayedValue());
	};

	CustomShape.prototype.addFillingOption = function (oNewFillingOption) {
		var bFillingOptionWithNoOrder = typeof oNewFillingOption.getOrder() === "undefined";
		if (bFillingOptionWithNoOrder) {
			Log.fatal("The passed FillingOption has to have set its order property.");
			return this;
		}

		var bHaveFillingOptionWithSameOrder = this.getFillingOptions().length > 0 &&
			this.getFillingOptions().filter(function (oFillingOption) {
				return oFillingOption.getOrder() === oNewFillingOption.getOrder();
			}).length > 0;

		if (bHaveFillingOptionWithSameOrder) {
			Log.fatal("The property 'order' has to be unique within the FillingOptions aggregation, but option" +
				" with order: " + oNewFillingOption.getOrder() + " is already inserted. No FillingOption added.");
			return this;
		}

		return this.addAggregation("fillingOptions", oNewFillingOption, true);
	};

	CustomShape.prototype._initShapeState = function () {
		this._aFillableSubShapes = [];
		this.oDefinition = [];
		this._sViewBox = null;
		this.destroyShapes();
	};

	CustomShape.prototype._refreshInternalStructure = function () {
		this._initShapeState();
		this._aFillableSubShapes.forEach(function (oItem) {
			if (oItem.fillingOption) {
				oItem.fillingOption.destroy();
			}
			oItem.shape.destroy();
		});

		if (!this.getDefinition()) {
			if (!this.isA("sap.suite.ui.commons.statusindicator.LibraryShape")) {
				Log.fatal("Definition has to be specified.");
			}
			return;
		}

		var $svg = jQuery(this.getDefinition());
		this._sViewBox = $svg[0].getAttribute("viewBox");
		jQuery.map($svg.children(), this._preprocessNode.bind(this));
	};

	CustomShape.prototype._preprocessNode = function (node) {
		var $node = jQuery(node),
			sTagName = $node.prop("tagName"),
			that = this;

		switch (sTagName) {
			case "g":
				jQuery.map($node.children(), function (oChildNode) {
					return that._preprocessLeafNode.call(that, jQuery(oChildNode));
				});
				break;
			default:
				this._preprocessLeafNode($node);
		}
	};

	CustomShape.prototype._preprocessLeafNode = function ($oShapeNode) {
		var sTagName = $oShapeNode.prop("tagName");

		switch (sTagName) {
			case "path":
				this._preprocessPathNode($oShapeNode);
				break;
			case "circle":
				this._preprocessCircleNode($oShapeNode);
				break;
			case "rect":
				this._preprocessRectangleNode($oShapeNode);
				break;
			case "defs":
				this._preprocessDefinitionsNode($oShapeNode[0]);
				break;
			default:
				Log.fatal("Unsupported node tag name ('" + sTagName + "')");
		}
	};

	CustomShape.prototype._preprocessPathNode = function ($pathNode) {
		var oPath = new Path({
			d: $pathNode.attr("d")
		});
		this._prepareShape(oPath, $pathNode);
	};

	CustomShape.prototype._preprocessCircleNode = function ($circleNode) {
		var oCircle = new Circle({
			cx: Number($circleNode.attr("cx")),
			cy: Number($circleNode.attr("cy")),
			r: Number($circleNode.attr("r"))
		});
		this._prepareShape(oCircle, $circleNode);
	};

	CustomShape.prototype._preprocessRectangleNode = function ($rectangleNode) {
		var oRectangle = new Rectangle({
			x: Number($rectangleNode.attr("x")),
			y: Number($rectangleNode.attr("y")),
			width: Number($rectangleNode.attr("width")),
			height: Number($rectangleNode.attr("height"))
		});
		this._prepareShape(oRectangle, $rectangleNode);
	};

	CustomShape.prototype._preprocessDefinitionsNode = function (oDefsNode) {
		var oDefinitionElement = new HtmlElement("defs");
		oDefinitionElement.addChild(oDefsNode.innerHTML);
		return oDefinitionElement;
	};

	CustomShape.prototype._setInitialValue = function (iInitialValue) {
		this._iDisplayedValue = iInitialValue;
	};

	CustomShape.prototype.getDisplayedValue = function () {
		return this._iDisplayedValue;
	};

	CustomShape.prototype._prepareShape = function (oShape, $node) {
		oShape.setFillingAngle(this.getFillingAngle());
		oShape.setStrokeWidth(this.getStrokeWidth());
		oShape.setStrokeColor(this.getStrokeColor());
		this.addShape(oShape);
		oShape._injectAnimationPropertiesResolver(this._oAnimationPropertiesResolver);

		var sStyleAttribute = $node.attr("style");
		if (!sStyleAttribute) {
			oShape.setFillingDirection(this.getFillingDirection());
			oShape.setFillColor(this.getFillColor());
			oShape.setFillingType(this.getFillingType());

			var sShapeId = $node.data("shape-id");
			var oFillableSubShape = {
				shape: oShape,
				fillingOption: sShapeId ? this._getFillingOptionById(sShapeId) : null
			};

			this._aFillableSubShapes.push(oFillableSubShape);

			// If some of shapes have fillingOption, we try to sort it by this specification.
			// Only two states are allowed - we left all the shapes without FillingOptions or
			// we specified FillingOptions for all the shapes. The other states (some with/without FillingOption)
			// have undefined behaviour.
			if (oFillableSubShape.fillingOption) {
				this._aFillableSubShapes.sort(function (oA, oB) {
					var oFillingOptionA = oA.fillingOption;
					var oFillingOptionB = oB.fillingOption;
					if (!oFillingOptionA) {
						return -1;
					}

					if (!oFillingOptionB) {
						return 1;
					}

					return oFillingOptionA.getOrder() - oFillingOptionB.getOrder();
				});
			}
		} else {
			oShape.setFillingType(FillingType.None);
			oShape._setStyle(sStyleAttribute);
		}
	};

	/**
	 * Updates DOM to visualize passed value.
	 *
	 * @param {number} iDisplayedValue currently displaying value
	 * @param {boolean} bDirectValueUpdateOnly if true, it will update the DOM to the passed value with no other computation
	 *
	 * @private
	 *
	 * @returns {void}
	 */
	CustomShape.prototype._updateDom = function (iDisplayedValue, bDirectValueUpdateOnly) {
		function getSubShapeWeight(oSubShape) {
			var oFillingOption = oSubShape.fillingOption;
			return oFillingOption && oFillingOption.getWeight() !== 0 ? oFillingOption.getWeight() : 1;
		}

		Log.debug("Updating to " + iDisplayedValue, null, this);

		if (this._aFillableSubShapes.length === 0) {
			Log.info("Update of DOM skipped. No shape for update found");
			return;
		}

		var iTotalWeight = this._aFillableSubShapes.reduce(function (acc, oSubShape) {
			return acc + getSubShapeWeight(oSubShape);
		}, 0);

		try {
			var that = this;
			var iValueToBeDistributed = (bDirectValueUpdateOnly) ? iDisplayedValue : this._oAnimationPropertiesResolver.getValue(this, iDisplayedValue);

			this._aFillableSubShapes.forEach(function (oFillableSubShape) {
				var iShapeWeight = getSubShapeWeight(oFillableSubShape);
				var fGroupRatio = iShapeWeight / iTotalWeight;
				var iSubShapeValue;

				if (iValueToBeDistributed === 0) {
					iSubShapeValue = 0;
				} else if (iValueToBeDistributed >= 100 * fGroupRatio) {
					iSubShapeValue = 100;
				} else {
					iSubShapeValue = iValueToBeDistributed / fGroupRatio;
				}
				iValueToBeDistributed -= iSubShapeValue * fGroupRatio;

				if (!bDirectValueUpdateOnly) {
					var renderer = oFillableSubShape.shape.getRenderer();
					var sColor = that.getDisplayedFillColor(iDisplayedValue);
					Log.debug("Updating color to '" + sColor + "'", null, oFillableSubShape.shape);
					renderer._updateDomColor(oFillableSubShape.shape, sColor);
				}
				oFillableSubShape.shape._updateDom(iSubShapeValue, true);
			});
		} catch (oError) {
			Log.fatal("Update of DOM failed. Reason: " + oError.message);
			return;
		}

		if (!bDirectValueUpdateOnly) {
			this._oAnimationPropertiesResolver.propagateValueChange(this, iDisplayedValue);
			this._oAnimationPropertiesResolver.propagateColorChange(this, iDisplayedValue);
		}

		this._iDisplayedValue = iDisplayedValue;
	};

	CustomShape.prototype._getFillingOptionById = function (sId) {
		var oResult = null;
		this.getFillingOptions().some(function (oFillingOption) {
			if (oFillingOption.getShapeId() === sId) {
				oResult = oFillingOption;
				return true;
			}

			return false;
		});

		return oResult;
	};

	CustomShape.prototype._getInternalViewBox = function () {
		return this._sViewBox;
	};

	return CustomShape;

});
