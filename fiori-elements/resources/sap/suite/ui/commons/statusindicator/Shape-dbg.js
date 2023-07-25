/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.statusindicator.Shape.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"../library",
	"sap/ui/core/Control",
	"sap/suite/ui/commons/util/HtmlElement",
	"sap/suite/ui/commons/statusindicator/util/ThemingUtil",
	"sap/base/Log"
], function (jQuery, library, Control, HtmlElement, ThemingUtil, Log) {
	"use strict";

	var FillingType = library.statusindicator.FillingType;

	var FillingDirectionType = library.statusindicator.FillingDirectionType;

	var VerticalAlignmentType = library.statusindicator.VerticalAlignmentType;

	var HorizontalAlignmentType = library.statusindicator.HorizontalAlignmentType;

	/**
	 * Constructor for a new Shape.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is provided
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Abstract shape that displays the value of the status indicator. The shape reflects
	 * the status indicator's percentage value by filling one or more of its parts (SVG shapes)
	 * with the specified color.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.50
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.commons.statusindicator.Shape
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) design time metamodel.
	 */
	var Shape = Control.extend("sap.suite.ui.commons.statusindicator.Shape",
		/** @lends sap.suite.ui.commons.Shape.prototype */
		{
			metadata: {
				"abstract": true,
				library: "sap.suite.ui.commons",
				properties: {

					/**
					 * Specifies the duration, in milliseconds, of the animation that would fill an empty
					 * shape to the full.
					 * The actual time it takes to change the shape's filling is proportional to the
					 * difference between the initial and the target status indicator's value. For example,
					 * a change from 20 percent to 70 percent takes only half of the time specified
					 * in the <code>fullAnimationDuration</code> property. If this property is set to
					 * <code>0</code>, changes are applied instantly without any animation.
					 *
					 * @deprecated Since version 1.54.1.
					 * All animations are now limited to 250 ms.
					 */
					fullAnimationDuration: {type: "int", defaultValue: 0},

					/**
					 * Defines the color of the shape's fill.
					 */
					fillColor: {type: "sap.m.ValueCSSColor", defaultValue: "Neutral"},

					/**
					 * Defines if the initial value of the status indicator should be animated or
					 * directly displayed on startup. By default, it's displayed on startup without any
					 * animation.
					 *
					 * @deprecated Since version 1.54.1.
					 * Use the animationOnChange property instead.
					 */
					animationOnStartup: {type: "boolean", defaultValue: false},

					/**
					 * Defines if the change in the status indicator value should be animated or not.<br>
					 * When set to <code>true</code>, the change in value is animated.
					 */
					animationOnChange: {type: "boolean", defaultValue: true},

					/**
					 * Specifies the delay of the initial value animation. Only applicable if the
					 * <code>animationOnStartup</code> property is set to <code>true</code>.
					 *
					 * @deprecated Since version 1.54.1.
					 */
					animationOnStartupDelay: {type: "int", defaultValue: 0},

					/**
					 * Defines the direction in which the shape is filled.
					 */
					fillingDirection: {
						type: "sap.suite.ui.commons.statusindicator.FillingDirectionType",
						defaultValue: FillingDirectionType.Up
					},

					/**
					 * Defines the type of the shape's fill.
					 */
					fillingType: {
						type: "sap.suite.ui.commons.statusindicator.FillingType",
						defaultValue: FillingType.Linear
					},

					/**
					 * Defines the angle at which the shape is filled. This property overrides the
					 * <code>fillingDirection</code> property.<br>
					 * Accepted values include <code>0</code> through <code>360</code> degrees.<br>
					 * For example, if you set the filling angle to <code>45</code>, the shape will
					 * be filled diagonally from the lower right part of the shape to its upper left part.<br>
					 * This property can be used only when {@link sap.suite.ui.commons.statusindicator.FillingType}
					 * is set to <code>Linear</code>.
					 */
					fillingAngle: {
						type: "int",
						defaultValue: undefined
					},

					/**
					 * Defines the vertical alignment of the shape within its parent container.
					 */
					verticalAlignment: {
						type: "sap.suite.ui.commons.statusindicator.VerticalAlignmentType",
						defaultValue: VerticalAlignmentType.Middle
					},

					/**
					 * Defines the horizontal alignment of the shape within its parent container.
					 */
					horizontalAlignment: {
						type: "sap.suite.ui.commons.statusindicator.HorizontalAlignmentType",
						defaultValue: HorizontalAlignmentType.Middle
					}
				}
			},
			renderer: null
		}
	);

	Shape.prototype.GRADIENT_ID = "gradient";

	Shape.prototype.STOP_ID = "stop";

	/**
	 * Returns the currently displayed value
	 * This method must be overridden by a child class
	 *
	 * @public
	 * @returns {number}
	 */
	Shape.prototype.getDisplayedValue = function () {
		Log.fatal("Must be overridden!");
	};

	Shape.prototype._setInitialValue = function (iInitialValue) {
		Log.fatal("Must be overridden!");
	};

	Shape.prototype._updateDom = function (iDisplayedValue, bDirectValueUpdateOnly) {
		Log.fatal("Must be overridden!");
	};

	Shape.prototype.init = function () {
		if (Control.prototype.init) {
			Control.prototype.init.apply(this, arguments);
		}
		this._oAnimationPropertiesResolver = null;
	};

	Shape.prototype.onBeforeRendering = function () {
		if (Control.prototype.onBeforeRendering) {
			Control.prototype.onBeforeRendering.apply(this, arguments);
		}
		this._clearBoundingBox();
	};

	Shape.prototype._getCssFillColor = function () {
		return ThemingUtil.resolveColor(this.getFillColor());
	};

	Shape.prototype._resolveFillColor = function () {
		return this._oAnimationPropertiesResolver.getColor(this, this.getDisplayedValue());
	};

	Shape.prototype._injectAnimationPropertiesResolver = function (oAnimationPropertiesResolver) {
		this._oAnimationPropertiesResolver = oAnimationPropertiesResolver;
	};

	Shape.prototype.getDisplayedFillColor = function (iDisplayedValue) {
		return this._oAnimationPropertiesResolver.getColor(this, iDisplayedValue);
	};

	Shape.prototype.getFullAnimationDuration = function () {
		return 250;
	};

	Shape.prototype._buildPreserveAspectRatioAttribute = function () {
		var sResult = "x";
		switch (this.getHorizontalAlignment()) {
			case HorizontalAlignmentType.Left:
				sResult += "Min";
				break;
			case HorizontalAlignmentType.Middle:
				sResult += "Mid";
				break;
			case HorizontalAlignmentType.Right:
				sResult += "Max";
				break;
		}
		sResult += "Y";

		switch (this.getVerticalAlignment()) {
			case VerticalAlignmentType.Top:
				sResult += "Min";
				break;
			case VerticalAlignmentType.Middle:
				sResult += "Mid";
				break;
			case VerticalAlignmentType.Bottom:
				sResult += "Max";
				break;
		}

		sResult += " meet";
		return sResult;
	};

	Shape.prototype._getGradientElement = function (iDisplayedValue) {
		var oGradientElement = new HtmlElement(this.getFillingType() === FillingType.Linear ? "linearGradient" : "radialGradient");
		oGradientElement.setId(this._buildIdString(this.getId(), this.GRADIENT_ID));

		if (this.getFillingType() === FillingType.Linear) {
			var iComputedAngle = this.computeLinearFillingAngle();
			oGradientElement.setAttribute("x1", iComputedAngle === 90 ? 1 : 0);
			oGradientElement.setAttribute("y1", iComputedAngle === 0 ? 1 : 0);
			oGradientElement.setAttribute("x2", iComputedAngle === 270 ? 1 : 0);
			oGradientElement.setAttribute("y2", iComputedAngle === 180 ? 1 : 0);
		}

		var fOffset = this._getDisplayedGradientOffset(iDisplayedValue);
		var oStopColorElement = new HtmlElement(this.STOP_ID);
		oStopColorElement.setAttribute("offset", fOffset);
		oStopColorElement.setAttribute("stop-color", "white");
		oGradientElement.addChild(oStopColorElement);

		var oStopTransparentElement = new HtmlElement(this.STOP_ID);
		oStopTransparentElement.setAttribute("offset", fOffset);
		oStopTransparentElement.setAttribute("stop-color", "transparent");
		oGradientElement.addChild(oStopTransparentElement);

		return oGradientElement;
	};

	Shape.prototype.getPolygonElement = function (iDisplayedValue) {
		var oPolygonElement = new HtmlElement("polygon");
		oPolygonElement.setId(this._buildIdString(this.getId(), "polygon"));
		oPolygonElement.setAttribute("fill", "white");
		// calculating polygon's points depends on bounding box. But bounding box is
		// possible to obtain only when the SVG is in DOM and when SVG is visible
		// therefore we cant render it on initial with specified value.
		// It is easily possible to compute it without bounding box for rectangle/circle,
		// but almost impossible for path
		return oPolygonElement;
	};

	Shape.prototype.computeLinearFillingAngle = function () {
		if (this.getFillingAngle() !== undefined) {
			return this._getNormalizedFillingAngle();
		}

		switch (this.getFillingDirection()) {
			case FillingDirectionType.Up:
				return 0;
			case FillingDirectionType.Down:
				return 180;
			case FillingDirectionType.Left:
				return 90;
			case FillingDirectionType.Right:
				return 270;
			default:
				Log.error("Unknown FillingDirection '" + this.getFillingDirection() + "'");
				return 0;
		}
	};

	Shape.prototype._useGradientForAnimation = function () {
		var normalizedFillingAngle = this._getNormalizedFillingAngle();
		var fillingType = this.getFillingType();

		return fillingType === FillingType.Radial ||
			(fillingType === FillingType.Linear &&
				(normalizedFillingAngle === undefined || [0, 90, 180, 270].indexOf(normalizedFillingAngle) > -1));
	};

	Shape.prototype._getPolygonPoints = function (iValue) {
		var result;
		switch (this.getFillingType()) {
			case FillingType.Linear:
				result = this._getPolygonPointsForLinearFilling(iValue);
				break;
			case FillingType.Circular:
				result = this._getPolygonPointsForCircularFilling(iValue);
				break;
			default:
				Log.error("Unknown FillingType '" + this.getFillingType() + "' given.");
				result = this._getPolygonPointsForLinearFilling(iValue);
		}

		result = result.map(function (point) {
			point.x = Number(point.x.toFixed(3));
			point.y = Number(point.y.toFixed(3));
			return point;
		});
		return result;
	};

	Shape.prototype._getPolygonPointsForLinearFilling = function (iValue) {
		// used equation of line
		// y = tan (alpha) x + k

		// we can use axis symmetry and use all the equations as they normally defined
		// it is because the coordination system is a little different
		var iNormalizedAngle = 180 - this._getNormalizedFillingAngle();
		var tan = Math.tan(iNormalizedAngle * Math.PI / 180);
		var oBoundingPoints = this._getBoundingPoints();
		var oStartPoint = oBoundingPoints.start;
		var oEndPoint = oBoundingPoints.end;

		var startK = oStartPoint.y - (tan * oStartPoint.x);
		var endK = oEndPoint.y - (tan * oEndPoint.x);
		var k = startK + ((endK - startK) / 100) * iValue;

		var x1 = oStartPoint.x;
		var y1 = x1 * tan + k;

		var y2 = oStartPoint.y;
		var x2 = (y2 - k) / tan;

		var result = [oStartPoint, {x: x1, y: y1}, {x: x2, y: y2}];
		return result;
	};

	Shape.prototype._getPolygonPointsForCircularFilling = function (iValue) {
		var that = this,
			iAngle = 3.6 * iValue,
			oBox = this._getBoundingBox(),
			aPoints = [];
		var iXDifferenceFromBoundaryCentre, iYDifferenceFromBoundaryCentre, oPolygonPoint;

		// starts at 12, the algorithm computes the coordination for clockwise direction only
		// counter clockwise direction is managed by symmetry
		var oStartPoint = createPoint(oBox.x + oBox.width / 2, oBox.y);
		var oCentrePoint = createPoint(oBox.x + oBox.width / 2, oBox.y + oBox.height / 2);

		// Reflects x coordinate by centre point for Counter Clockwise type
		function adjustIfCounterClockwise(oPoint) {
			var oResult = Object.assign({}, oPoint);

			if (that.getFillingDirection() === FillingDirectionType.CounterClockwise) {
				var iXDistanceFromCentre = oPoint.x - oCentrePoint.x;
				oResult.x = oCentrePoint.x - iXDistanceFromCentre;
			}

			return oResult;
		}

		// Boundary centre is given by angle distance from the beginning (0°). The returned difference is related
		// to x or y coordinate depending on boundary centre angle (e.g. 0° -> x, 90° -> y, 180° -> x  270° -> y).
		// Boundary length is length of the corresponding side of bounding box (width for x, height for y).
		function computeDifferenceFromBoundaryCentre(iAngle, iBoundaryCentreAngle, iBoundaryLength) {
			var tan = Math.tan((iBoundaryCentreAngle - iAngle) * Math.PI / 180);

			return tan * iBoundaryLength / 2;
		}

		aPoints.push(oStartPoint);

		if (0 < iAngle && iAngle < 45) { // eslint-disable-line yoda
			iXDifferenceFromBoundaryCentre = computeDifferenceFromBoundaryCentre(iAngle, 0, oBox.height);
			oPolygonPoint = createPoint(oStartPoint.x - iXDifferenceFromBoundaryCentre, oStartPoint.y);
			aPoints.push(adjustIfCounterClockwise(oPolygonPoint));
		}

		if (45 <= iAngle) { // eslint-disable-line yoda
			aPoints.push(adjustIfCounterClockwise(createPoint(oBox.x + oBox.width, oBox.y)));
		}

		if (45 < iAngle && iAngle < 135) { // eslint-disable-line yoda
			iYDifferenceFromBoundaryCentre = computeDifferenceFromBoundaryCentre(iAngle, 90, oBox.width);
			oPolygonPoint = createPoint(oBox.x + oBox.width, oBox.y + oBox.height / 2 - iYDifferenceFromBoundaryCentre);
			aPoints.push(adjustIfCounterClockwise(oPolygonPoint));
		}

		if (135 <= iAngle) { // eslint-disable-line yoda
			aPoints.push(adjustIfCounterClockwise(createPoint(oBox.x + oBox.width, oBox.y + oBox.height)));
		}

		if (135 < iAngle && iAngle < 225) { // eslint-disable-line yoda
			iXDifferenceFromBoundaryCentre = computeDifferenceFromBoundaryCentre(iAngle, 180, oBox.height);
			oPolygonPoint = createPoint(oBox.x + oBox.width / 2 + iXDifferenceFromBoundaryCentre, oBox.y + oBox.height);
			aPoints.push(adjustIfCounterClockwise(oPolygonPoint));
		}

		if (225 <= iAngle) { // eslint-disable-line yoda
			aPoints.push(adjustIfCounterClockwise(createPoint(oBox.x, oBox.y + oBox.height)));
		}

		if (225 < iAngle && iAngle < 315) { // eslint-disable-line yoda
			iYDifferenceFromBoundaryCentre = computeDifferenceFromBoundaryCentre(iAngle, 270, oBox.width);
			oPolygonPoint = createPoint(oBox.x, oBox.y + oBox.height / 2 + iYDifferenceFromBoundaryCentre);
			aPoints.push(adjustIfCounterClockwise(oPolygonPoint));
		}

		if (315 <= iAngle) { // eslint-disable-line yoda
			aPoints.push(adjustIfCounterClockwise(createPoint(oBox.x, oBox.y)));
		}

		if (315 < iAngle && iAngle <= 360) { // eslint-disable-line yoda
			iXDifferenceFromBoundaryCentre = computeDifferenceFromBoundaryCentre(iAngle, 360, oBox.height);
			oPolygonPoint = createPoint(oBox.x + oBox.width / 2 - iXDifferenceFromBoundaryCentre, oBox.y);
			aPoints.push(adjustIfCounterClockwise(oPolygonPoint));
		}

		aPoints.push(oCentrePoint);

		return aPoints;
	};

	Shape.prototype._isFillingAngleInFirstQuadrant = function () {
		var iAngle = this._getNormalizedFillingAngle();
		return 0 < iAngle && iAngle < 90; // eslint-disable-line yoda
	};

	Shape.prototype._isFillingAngleInSecondQuadrant = function () {
		var iAngle = this._getNormalizedFillingAngle();
		return 90 < iAngle && iAngle < 180; // eslint-disable-line yoda
	};

	Shape.prototype._isFillingAngleInThirdQuadrant = function () {
		var iAngle = this._getNormalizedFillingAngle();
		return 180 < iAngle && iAngle < 270; // eslint-disable-line yoda
	};

	Shape.prototype._isFillingAngleInForthQuadrant = function () {
		var iAngle = this._getNormalizedFillingAngle();
		return 270 < iAngle && iAngle < 360; // eslint-disable-line yoda
	};

	Shape.prototype._getBoundingPoints = function () {
		var oBox = this._getBoundingBox();

		// right down
		var oStartPointX = oBox.x + oBox.width;
		var oStartPointY = oBox.y + oBox.height;
		// left top
		var oEndPointX = oBox.x;
		var oEndPointY = oBox.y;
		if (this._isFillingAngleInFirstQuadrant()) {
			// nothing, values are already the default ones
		} else if (this._isFillingAngleInSecondQuadrant()) {
			// right up
			oStartPointX = oBox.x + oBox.width;
			oStartPointY = oBox.y;
			// left bottom
			oEndPointX = oBox.x;
			oEndPointY = oBox.y + oBox.height;
		} else if (this._isFillingAngleInThirdQuadrant()) {
			// left up
			oStartPointX = oBox.x;
			oStartPointY = oBox.y;
			// right bottom
			oEndPointX = oBox.x + oBox.width;
			oEndPointY = oBox.y + oBox.height;
		} else if (this._isFillingAngleInForthQuadrant()) {
			// left down
			oStartPointX = oBox.x;
			oStartPointY = oBox.y + oBox.height;
			// right top
			oEndPointX = oBox.x + oBox.width;
			oEndPointY = oBox.y;
		} else {
			Log.error("Invalid call of _getBoundingPoints. FillingAngle '" + this.getFillingAngle() +
				"' is not in any quadrant");
		}

		return {
			start: createPoint(oStartPointX, oStartPointY),
			end: createPoint(oEndPointX, oEndPointY)
		};
	};

	Shape.prototype._getBoundingBox = function () {
		if (!this._oBoundingBox) {
			this._oBoundingBox = this.$()[0].getBBox();
		}

		return this._oBoundingBox;
	};

	Shape.prototype._clearBoundingBox = function () {
		this._oBoundingBox = null;
	};

	Shape.prototype._getNormalizedFillingAngle = function () {
		if (this.getFillingAngle() === undefined) {
			return this.getFillingAngle();
		}

		var iResult = this.getFillingAngle() % 360;
		if (iResult < 0) {
			// transform negative angle to supplement to 360
			iResult += 360;
		}

		return iResult;
	};

	Shape.prototype.isFillable = function () {
		return this.getFillingType() !== FillingType.None;
	};

	Shape.prototype._getDisplayedGradientOffset = function (iDisplayedValue) {
		if (this.isFillable()) {
			var result = iDisplayedValue / 100;
			return result;
		} else {
			return 1; // fill it all!
		}
	};

	Shape.prototype._getMaskElement = function (sMaskId) {
		var oMaskElement = new HtmlElement("mask");
		oMaskElement.setId(sMaskId);

		if (this._useGradientForAnimation()) {
			var oMaskShapeElement = this._getSimpleShapeElement(this._buildIdString(this.getId(), "mask-shape"));
			oMaskShapeElement.setAttribute("stroke-width", 0);
			oMaskShapeElement.setAttribute("stroke", "white");
			oMaskShapeElement.setAttribute("fill", this._buildSvgUrlString(this.getId(), this.GRADIENT_ID));

			oMaskElement.addChild(oMaskShapeElement);
		} else {
			oMaskElement.addChild(this.getPolygonElement(this._iDisplayedValue));
		}

		return oMaskElement;
	};

	Shape.prototype._buildSvgUrlString = function () {
		return "url(#" + this._buildIdString.apply(this, arguments) + ")";
	};

	Shape.prototype._buildIdString = function () {
		var sConcatenatedIds = jQuery.makeArray(arguments).join("-");
		return sConcatenatedIds;
	};

	function createPoint(iX, iY) {
		return {x: iX, y: iY};
	}

	return Shape;

});
