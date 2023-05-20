/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/suite/ui/commons/library",
	"./ElementBase",
	"./layout/Geometry",
	"./Coordinate",
	"./Utils"
], function (library, ElementBase, Geometry, Coordinate, Utils) {
	"use strict";

	var ArrowPosition = library.networkgraph.LineArrowPosition,
		LineType = library.networkgraph.LineType,
		ArrowOrientation = library.networkgraph.LineArrowOrientation,
		Shape = library.networkgraph.NodeShape,
		Orientation = library.networkgraph.Orientation;

	var BEND_RADIUS = 6, // Bezier 'radius' of smooth bends
		FOCUS_LANE_WIDTH = 5, // Distance of focus shadow line from the main line
		RELATIVE_ARROW_POSITION = 0.45,
		FIXED_ARROW_POSITION = 15,
		ZERO_ANGLE_ARROW_POINTS = {
			Apex: {x: 5.5, y: 0},
			Second: {x: -5.5, y: -7.5},
			Third: {x: -5.5, y: 7.5}
		},
		// points for dual arrow <->
		ZERO_ANGLE_ARROW_POINTS_DUAL_1 = {
			Apex: {x: 16, y: 0},
			Second: {x: 5, y: -7.5},
			Third: {x: 5, y: 7.5}
		},
		ZERO_ANGLE_ARROW_POINTS_DUAL_2 = {
			Apex: {x: -12, y: 0},
			Second: {x: -1, y: -7.5},
			Third: {x: -1, y: 7.5}
		},
		NIPPLE_ARC_RADIUS = 5;

	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

	/**
	 * Constructor for a new Line.
	 *
	 * @class
	 * Holds information about one connector line.
	 *
	 * @extends sap.suite.ui.commons.networkgraph.ElementBase
	 *
	 * @constructor
	 * @public
	 * @since 1.50
	 * @alias sap.suite.ui.commons.networkgraph.Line
	 */
	var Line = ElementBase.extend("sap.suite.ui.commons.networkgraph.Line", {
		metadata: {
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * Shows if the line is selected. Once the line is selected, its appearance changes slightly
				 * to distinguish it from other lines.
				 */
				selected: {
					type: "boolean", group: "Misc", defaultValue: false
				},
				/**
				 * Key of the node where the line begins.
				 */
				from: {
					type: "string", group: "Misc", defaultValue: null
				},
				/**
				 * Key of the node the line leads to.
				 */
				to: {
					type: "string", group: "Misc", defaultValue: null
				},
				/**
				 * Defines the appearance of the line. Can be set to solid, dashed, or dotted.
				 */
				lineType: {
					type: "sap.suite.ui.commons.networkgraph.LineType",
					group: "Appearance",
					defaultValue: LineType.Solid
				},
				/**
				 * Position of the arrow on the line. Can be set to End, Middle, or Start.
				 */
				arrowPosition: {
					type: "sap.suite.ui.commons.networkgraph.LineArrowPosition",
					group: "Appearance",
					defaultValue: ArrowPosition.End
				},
				/**
				 * Orientation of the line that defines the direction of the arrow.
				 */
				arrowOrientation: {
					type: "sap.suite.ui.commons.networkgraph.LineArrowOrientation",
					group: "Appearance",
					defaultValue: ArrowOrientation.ParentOf
				},
				/**
				 * Extends the line up to the node's horizontal or vertical axis to ensure that it meets the shape's outline even when a fancy shape is used.<br>
				 * Available for custom nodes only.
				 */
				stretchToCenter: {
					type: "boolean", group: "Misc", defaultValue: false
				}
			},
			aggregations: {
				/**
				 * A list of points the line goes through. After the layouting algorithm has finished arranging the graph,
				 * this aggregation contains the coordinates of at least two points: the starting point and the end point of
				 * the line. The rest of the points making up the line are treated as break points.
				 */
				coordinates: {
					type: "sap.suite.ui.commons.networkgraph.Coordinate", multiple: true, singularName: "coordinate"
				},
				/**
				 * A list of custom action buttons.
				 */
				actionButtons: {
					type: "sap.suite.ui.commons.networkgraph.ActionButton", multiple: true, singularName: "actionButton"
				}
			},
			events: {
				/**
				 * This event is fired when the user moves the mouse pointer over the line.
				 */
				hover: {},
				/**
				 * This event is fired when the user clicks or taps the line.
				 */
				press: {
					parameters: {
						/**
						 * Coordinates of the cursor when pressed.
						 */
						point: "Object",
						/**
						 * Object you can pass to 'openBy' method for custom tooltip. Its important for lines where you want to
						 * display tooltip precisely where the cursor is.
						 */
						opener: "Object"
					}
				}
			}
		},
		renderer: function (oRM, oControl) {
			// NOTE: this render is considered to be called only for single item invalidation
			// whole graph has different render path
			oRM.write(oControl._render());
		},
		onAfterRendering: function () {
			this._afterRenderingBase();
		},
		init: function () {
			this._oFrom = null;
			this._oTo = null;

			this._bFocusRendered = false;
			this._sKey = "";

			this._bIsHidden = false;
		}
	});

	// sum of properties that if changed requires data reprocessing
	Line.prototype.aProcessRequiredProperties = ["from", "to"];

	/* =========================================================== */
	/* Events & pseudo events */
	/* =========================================================== */
	Line.prototype._afterRendering = function () {
		this._setupEvents();
		if (this.getFromNode()._bIsHidden || this.getToNode()._bIsHidden) {
			this.$().hide();
		}

		this._removeFromInvalidatedControls();
	};

	/* =========================================================== */
	/* Rendering */
	/* =========================================================== */
	Line.prototype._render = function (mOptions) {
		var sLineHtml = "",
			sSelectedClass = this.getSelected() ? " " + this.SELECT_CLASS + " " : "",
			sId = this._getElementId(mOptions && mOptions.idSufix),
			sRoundedPath;

		var sStyle = this._getStatusStyle({
			"stroke": ElementBase.ColorType.Border,
			"stroke-width": ElementBase.ColorType.BorderWidth,
			"stroke-dasharray": ElementBase.ColorType.BorderStyle
		});

		var sColorStyle = this._getStatusStyle({
			fill: ElementBase.ColorType.Background,
			stroke: ElementBase.ColorType.Border
		});

		var fnRenderPath = function (sClass, sPathId, bIsInvisible) {
			return this._renderControl("path", {
				d: sRoundedPath,
				"class": sClass || this._getLineClass(),
				style: bIsInvisible ? "" : sStyle,
				from: this.getFromNode().getKey(),
				to: this.getToNode().getKey(),
				id: sId ? sId + "-" + sPathId : ""
			});
		}.bind(this);

		var fnCreateArrowAttr = function (iIndex, aPoints, sArrowId) {
			return {
				id: sId + "-" + sArrowId,
				"class": "sapSuiteUiCommonsNetworkLineArrow",
				style: sColorStyle,
				d: "M " + aPoints[iIndex + 0].x + "," + aPoints[iIndex + 0].y +
					" L " + aPoints[iIndex + 1].x + "," + aPoints[iIndex + 1].y +
					" L " + aPoints[iIndex + 2].x + "," + aPoints[iIndex + 2].y +
					" Z"
			};
		};

		var fnRenderArrow = function (sOrientation, sPosition, sArrowId) {
			var aPoints = this._getArrowPoints(sOrientation, sPosition),
				sHtml = this._renderControl("path", fnCreateArrowAttr(0, aPoints, sArrowId || "arrow"));

			// middle arrow are rendered here with single group of points
			// dual end (begin) arrow are rendered twice first as "childOf" and second as "parentOf"
			if (this._isBothMiddleArrow()) {
				sHtml += this._renderControl("path", fnCreateArrowAttr(3, aPoints, "arrow1"));
			}

			return sHtml;
		}.bind(this);

		var fnCreateArc = function (iX, iY, sOrientation) {
			var iEndX = iX,
				iEndY = iY,
				sArc = " 0 0 0 ";

			if (sOrientation === Orientation.LeftRight || sOrientation === Orientation.RightLeft) {
				iY -= NIPPLE_ARC_RADIUS;
				iEndY += NIPPLE_ARC_RADIUS;
			}

			if (sOrientation === Orientation.TopBottom || sOrientation === Orientation.BottomTop) {
				iX -= NIPPLE_ARC_RADIUS;
				iEndX += NIPPLE_ARC_RADIUS;
			}

			if (sOrientation === Orientation.BottomTop || sOrientation === Orientation.LeftRight) {
				sArc = " 0 0 1 ";
			}

			return "M" + iX + " " + iY +
				"A" + NIPPLE_ARC_RADIUS + " " + NIPPLE_ARC_RADIUS + sArc + " " + iEndX + " " + iEndY;
		};

		this._bFocusRendered = false;

		if (this._isIgnored()) {
			return "";
		}

		if (!this.getVisible()) {
			// at least we need render invisible container as we set bOutput (for multiple reasons:) to tru manually
			return "<g style=\"display:none\" id=\"" + sId + "\" data-sap-ui=\"" + sId + "\"></g>";
		}

		sRoundedPath = this._createPath();

		sLineHtml += this._renderControl("g", {
			"class": "sapSuiteUiCommonsNetworkLine " + this._getStatusClass() + sSelectedClass,
			id: sId,
			"data-sap-ui": sId
		}, false);

		// invisible wrapper for better event handling
		sLineHtml += fnRenderPath("sapSuiteUiCommonsNetworkLineInvisibleWrapper", "invisibleWrapper", true);

		// path itself
		sLineHtml += fnRenderPath("", "path");

		if (this.getArrowOrientation() !== ArrowOrientation.None && this.getCoordinates().length >= 2) {
			if (this.getArrowOrientation() === ArrowOrientation.Both) {
				if (this.getArrowPosition() === ArrowPosition.Middle) {
					// middle arrow is rendered "at once" using two groups of points
					sLineHtml += fnRenderArrow(ArrowOrientation.ParentOf, ArrowPosition.Middle);
				} else {
					// arrows on edges are rendered twice using default methods
					sLineHtml += fnRenderArrow(ArrowOrientation.ChildOf, ArrowPosition.Start, "arrow");
					sLineHtml += fnRenderArrow(ArrowOrientation.ParentOf, ArrowPosition.End, "arrow1");
				}
			} else {
				sLineHtml += fnRenderArrow();
			}
		}

		if (this._aNipples) {
			var sColorStyleText = sColorStyle ? "style=\"" + sColorStyle + "\"" : "";
			this._aNipples.forEach(function (oNipple) {
				sLineHtml += "<path " + sColorStyleText + " class=\"sapSuiteUiCommonsNetworkLineNipple\" d=\"" + fnCreateArc(oNipple.x, oNipple.y, oNipple.orientation) + "\" />";
			});
		}

		sLineHtml += "</g>";

		return sLineHtml;
	};

	Line.prototype._renderFocusWrapper = function () {
		var fnAppendFocusLine = function (iShift) {
			var oPath = this._createElement("path", {
				d: this._createPath(iShift),
				"class": "sapSuiteUiCommonsNetworkLineFocus"
			});

			this.$()[0].appendChild(oPath);
		}.bind(this);

		if (!this._bFocusRendered) {
			fnAppendFocusLine(FOCUS_LANE_WIDTH);
			fnAppendFocusLine(-FOCUS_LANE_WIDTH);

			this._bFocusRendered = true;
		}
	};

	Line.prototype._resetLayoutData = function () {
		this._aNipples = null;
	};

	Line.prototype._createPath = function (iShift) {
		if (!this.getSource() || !this.getTarget()) {
			return;
		}

		var aPoints = [{
				x: this.getSource().getX(),
				y: this.getSource().getY()
			}],
			sPath = "M" + this.getSource().getX() + "," + this.getSource().getY(),
			iLast, iNew,
			bIsTopBottom = this._isTopBottom(),
			sCoord = bIsTopBottom ? "x" : "y",
			sFnName = bIsTopBottom ? "getX" : "getY",
			aCoordinates = this.getBends().concat([this.getTarget()]);

		// this should prevent some small Y adjustments when line is almost on same Y but not quite
		for (var i = 0; i < aCoordinates.length; i++) {
			// check current - 2 to determine if current - 1 is in "almost" the same y(x)
			// in such case we ignore middle coordinate and create one single line
			// aPoints is one coordinate "before" so aPoints[i-1] is actually aCoordinates - 2
			iLast = aPoints[i - 1] ? aPoints[i - 1][sCoord] : NaN;
			iNew = aCoordinates[i][sFnName]();

			if (Math.abs(iLast - aCoordinates[i][sFnName]()) < 2) {
				aPoints.pop();
				iNew = iLast;
			}

			aPoints.push({
				x: bIsTopBottom ? iNew : aCoordinates[i].getX(),
				y: !bIsTopBottom ? iNew : aCoordinates[i].getY()
			});
		}

		for (var j = 1; j < aPoints.length; j++) {
			sPath += " L" + aPoints[j].x + "," + aPoints[j].y;
		}

		return Geometry.getBezierPathCorners(sPath, BEND_RADIUS, iShift);
	};

	Line.prototype._getLineClass = function () {
		var fnGetLineTypeClass = function () {
			switch (this.getLineType()) {
				case LineType.Dashed:
					return "sapSuiteUiCommonsNetworkDashedLine";
				case LineType.Dotted:
					return "sapSuiteUiCommonsNetworkDottedLine";
				default:
					return "";
			}
		}.bind(this);

		return "sapSuiteUiCommonsNetworkLinePath " + fnGetLineTypeClass();
	};

	/**
	 * Identification of the line fragment where the arrow is supposed to be placed.
	 * @private
	 */
	Line.prototype._getArrowFragmentVector = function (sPosition) {
		var oCoords = this.getCoordinates(),
			iLastIndex = oCoords.length - 1,
			iHolyIndex = 0,
			fnGetFragmentSize = function (i) {
				return Math.abs(oCoords[i].getX() - oCoords[i + 1].getX())
					+ Math.abs(oCoords[i].getY() - oCoords[i + 1].getY());
			};

		sPosition = sPosition || this.getArrowPosition();

		if (this.getBends().length === 0) {
			iHolyIndex = 0;
		} else if (sPosition === ArrowPosition.Start) {
			while (iHolyIndex < (iLastIndex - 1) && this._doesLineFragmentCrossCollapsedGroup(iHolyIndex)) {
				iHolyIndex++;
			}
			// When the intended fragment is too small, shift it yet more
			if (fnGetFragmentSize(iHolyIndex) < FIXED_ARROW_POSITION) {
				iHolyIndex++;
			}
			// When still crossing a collapsed group rollback the optimization attempt
			if (this._doesLineFragmentCrossCollapsedGroup(iHolyIndex)) {
				iHolyIndex = 0;
			}
		} else if (sPosition === ArrowPosition.End) {
			iHolyIndex = iLastIndex - 1;
			while (iHolyIndex > 0 && this._doesLineFragmentCrossCollapsedGroup(iHolyIndex)) {
				iHolyIndex--;
			}
			// When the intended fragment is too small, shift it yet more
			if (fnGetFragmentSize(iHolyIndex) < FIXED_ARROW_POSITION) {
				iHolyIndex--;
			}
		} else {
			// Find fragment closest to the middle of all fragments in terms of length
			var aFragLenSums = [], fDist = 0;
			for (var i = 0; i < iLastIndex; i++) {
				if (oCoords[i].getX() === oCoords[i + 1].getX()) {
					fDist += Math.abs(oCoords[i + 1].getY() - oCoords[i].getY());
				} else if (oCoords[i].getY() === oCoords[i + 1].getY()) {
					fDist += Math.abs(oCoords[i + 1].getX() - oCoords[i].getX());
				} else {
					fDist += Geometry.getPointsDistance(
						{x: oCoords[i].getX(), y: oCoords[i].getY()},
						{x: oCoords[i + 1].getX(), y: oCoords[i + 1].getY()});
				}
				aFragLenSums.push(fDist);
			}
			fDist = fDist / 2;
			for (i = 0; i < iLastIndex && iHolyIndex === 0; i++) {
				if (aFragLenSums[i] >= fDist && !this._doesLineFragmentCrossCollapsedGroup(i)) {
					iHolyIndex = i;
				}
			}
		}

		// 'Better safe than sorry' fallback
		if (iHolyIndex < 0 || iHolyIndex > (iLastIndex - 1)) {
			iHolyIndex = 0;
		}

		return {
			center: {x: oCoords[iHolyIndex].getX(), y: oCoords[iHolyIndex].getY()},
			apex: {x: oCoords[iHolyIndex + 1].getX(), y: oCoords[iHolyIndex + 1].getY()}
		};
	};

	/**
	 * @private
	 */
	Line.prototype._doesLineFragmentCrossCollapsedGroup = function (iStartCoordIndex) {
		var oGraph = this.getParent(),
			oBend1 = this.getCoordinates()[iStartCoordIndex],
			oBend2 = this.getCoordinates()[iStartCoordIndex + 1];
		return oGraph.getGroups().some(function (oGroup) {
			return oGroup.getCollapsed() && Geometry.doLineRectangleIntersect(
				{ // Line fragment end points, slightly smaller to skip when just touching the group
					p1: {
						x: Math.min(oBend1.getX(), oBend2.getX()) + 1,
						y: Math.min(oBend1.getY(), oBend2.getY()) + 1
					},
					p2: {
						x: Math.max(oBend1.getX(), oBend2.getX()) - 1,
						y: Math.max(oBend1.getY(), oBend2.getY()) - 1
					}
				},
				{ // Group rectangle
					p1: {x: oGroup.getX(), y: oGroup.getY()},
					p2: {x: oGroup.getX() + oGroup._iWidth, y: oGroup.getY() + oGroup._iHeight}
				}
			);
		});
	};

	/**
	 * @private
	 */
	Line.prototype._getArrowPoints = function (sOrientation, sPosition) {
		var oPosVector, oFragVector,
			oArrowCenter, fArrowAngle, aArrowPoints = [];

		sOrientation = sOrientation || this.getArrowOrientation();
		sPosition = sPosition || this.getArrowPosition();

		var fnCalcArrowPoint = function (oArrowVertex) {
			var fFixedPosition = FIXED_ARROW_POSITION;
			// First calculate where the center of the arrow is
			if (sPosition === ArrowPosition.Middle) {
				oArrowCenter = {
					x: (oFragVector.apex.x - oFragVector.center.x) * RELATIVE_ARROW_POSITION + oFragVector.center.x,
					y: (oFragVector.apex.y - oFragVector.center.y) * RELATIVE_ARROW_POSITION + oFragVector.center.y
				};
			} else {
				// Circle has lines going all the way to the center axis, we need to stretch fixed position, spare the collapsed groups
				if (!(this.getToNode()._oGroup && this.getToNode()._oGroup.getCollapsed()) &&
					this.getToNode().getShape() === Shape.Circle && sPosition === ArrowPosition.End) {
					fFixedPosition += this.getToNode()._getCircleSize() / 2;
				} else if (!(this.getFromNode()._oGroup && this.getFromNode()._oGroup.getCollapsed()) &&
					this.getFromNode().getShape() === Shape.Circle && sPosition === ArrowPosition.Start) {
					fFixedPosition += this.getFromNode()._getCircleSize() / 2;
				}
				oPosVector = Geometry.getNormalizedVector(oFragVector, fFixedPosition);
				if (sPosition === ArrowPosition.Start) {
					oArrowCenter = oFragVector.center;
				} else if (sPosition === ArrowPosition.End) {
					oPosVector = Geometry.getRotatedVector(oPosVector, Math.PI);
					oArrowCenter = oFragVector.apex;
				}
				oArrowCenter = Geometry.getPointSum(oArrowCenter, oPosVector.apex);
			}
			// Then get the angle
			fArrowAngle = Geometry.getAngleOfVector(oFragVector);
			if (sOrientation === ArrowOrientation.ChildOf) {
				fArrowAngle += Math.PI;
			}
			// Finally rotate and translate
			aArrowPoints.push(Geometry.getPointSum(oArrowCenter, Geometry.getRotatedPoint(oArrowVertex, fArrowAngle)));
		}.bind(this);

		oFragVector = this._getArrowFragmentVector(sPosition);

		if (this._isBothMiddleArrow()) {
			fnCalcArrowPoint(ZERO_ANGLE_ARROW_POINTS_DUAL_1.Apex);
			fnCalcArrowPoint(ZERO_ANGLE_ARROW_POINTS_DUAL_1.Second);
			fnCalcArrowPoint(ZERO_ANGLE_ARROW_POINTS_DUAL_1.Third);

			fnCalcArrowPoint(ZERO_ANGLE_ARROW_POINTS_DUAL_2.Apex);
			fnCalcArrowPoint(ZERO_ANGLE_ARROW_POINTS_DUAL_2.Second);
			fnCalcArrowPoint(ZERO_ANGLE_ARROW_POINTS_DUAL_2.Third);
		} else {
			fnCalcArrowPoint(ZERO_ANGLE_ARROW_POINTS.Apex);
			fnCalcArrowPoint(ZERO_ANGLE_ARROW_POINTS.Second);
			fnCalcArrowPoint(ZERO_ANGLE_ARROW_POINTS.Third);
		}

		return aArrowPoints;
	};

	/**
	 * @private
	 */
	Line.prototype._getAccessibilityLabel = function () {
		var sFromNodeTitle = this.getFromNode().getTitle();
		var sFromNodeText = sFromNodeTitle ? sFromNodeTitle : this.getFromNode().getAltText();

		var sToNodeTitle = this.getToNode().getTitle();
		var sToNodeText = sToNodeTitle ? sToNodeTitle : this.getToNode().getAltText();
		return oResourceBundle.getText("NETWORK_GRAPH_ACCESSIBILITY_LINE_LABEL", [sFromNodeText, sToNodeText]) + " " + this.getTitle();
	};

	/* =========================================================== */
	/* Public methods */
	/* =========================================================== */
	/**
	 * Returns the node instance where the line starts.
	 * This method doesn't call invalidate on the object.
	 * @returns {object} Node instance where the line starts
	 * @public
	 */
	Line.prototype.getFromNode = function () {
		this._checkForProcessData();
		if (!this._oFrom && this.getParent()) {
			this._oFrom = this.getParent().getNodeByKey(this.getFrom());
		}
		return this._oFrom;
	};

	/**
	 * Returns the node instance where the line leads to.
	 * This method doesn't call invalidate on the object.
	 * @returns {object} Node instance where the line ends
	 * @public
	 */
	Line.prototype.getToNode = function () {
		this._checkForProcessData();
		if (!this._oTo && this.getParent()) {
			this._oTo = this.getParent().getNodeByKey(this.getTo());
		}
		return this._oTo;
	};

	/**
	 * Sets the starting point, or the source, for the line.
	 * This method doesn't call invalidate on the object.
	 * @param {object} mArguments mArguments.x mArguments.y X and Y coordinates of the starting point
	 * @public
	 */
	Line.prototype.setSource = function (mArguments) {
		var oCoordinate;
		if (this.getCoordinates().length === 0) {
			oCoordinate = new Coordinate();
			this.addAggregation("coordinates", oCoordinate, true);
		}

		oCoordinate = this.getCoordinates()[0];
		if (mArguments.x || mArguments.x === 0) {
			oCoordinate.setX(mArguments.x);
		}

		if (mArguments.y || mArguments.y === 0) {
			oCoordinate.setY(mArguments.y);
		}
	};

	/**
	 * Returns the coordinates of the line's starting point.
	 * This method doesn't call invalidate on the object.
	 * @returns {sap.suite.ui.commons.networkgraph.Coordinate} Coordinate object
	 * @public
	 */
	Line.prototype.getSource = function () {
		return this.getCoordinates()[0];
	};

	/**
	 * Returns the coordinates of the line's end point.
	 * This method doesn't call invalidate on the object.
	 * @returns {sap.suite.ui.commons.networkgraph.Coordinate} Coordinate object
	 * @public
	 */
	Line.prototype.getTarget = function () {
		// if there is only 1 node source == target
		return this.getCoordinates().length > 0 ? this.getCoordinates()[this.getCoordinates().length - 1] : null;
	};

	/**
	 * Sets the end point, or the target, for the line.
	 * This method doesn't call invalidate on the object.
	 * @param {object} mArguments mArguments.x mArguments.y X and Y coordinates of the end point
	 * @public
	 */
	Line.prototype.setTarget = function (mArguments) {
		var oCoordinate;

		if (this.getCoordinates().length < 2) {
			oCoordinate = new Coordinate();
			this.addAggregation("coordinates", oCoordinate, true);
		}
		oCoordinate = this.getCoordinates()[this.getCoordinates().length - 1];

		if (mArguments.x || mArguments.x === 0) {
			oCoordinate.setX(mArguments.x);
		}

		if (mArguments.y || mArguments.y === 0) {
			oCoordinate.setY(mArguments.y);
		}
	};

	/**
	 * Returns the coordinates of all points that define the shape of the line between its start and end points.
	 * This method doesn't call invalidate on the object.
	 * @returns {sap.suite.ui.commons.networkgraph.Coordinate[]} Coordinates of the points shaping the line
	 * @public
	 */
	Line.prototype.getBends = function () {
		return this.getCoordinates().filter(function (oCoord, iIndex) {
			return (iIndex > 0) && (iIndex < (this.getCoordinates().length - 1));
		}, this);
	};

	/**
	 * Removes all points that define the shape of the line between its start and end points.
	 * This method doesn't call invalidate on the object.
	 * @public
	 */
	Line.prototype.clearBends = function () {
		this.getBends().forEach(function (oBend) {
			this.removeAggregation("coordinates", oBend, true);
		}, this);
	};

	/**
	 * Adds coordinates for points that should define the shape of the line between its start and end points.
	 * This method doesn't call invalidate on the object.
	 * @param {{x: float, y: float}} oPoint X and Y coordinates
	 * @returns {sap.suite.ui.commons.networkgraph.Coordinate} Newly added coordinates object
	 * @public
	 */
	Line.prototype.addBend = function (oPoint) {
		var oNew = new Coordinate();
		oNew.setX(oPoint.x);
		oNew.setY(oPoint.y);
		this.insertAggregation("coordinates", oNew, this.getCoordinates().length - 1, true);

		return oNew;
	};

	Line.prototype.isHidden = function () {
		return this._bIsHidden;
	};

	Line.prototype.getKey = function () {
		return this._getLineId();
	};

	/**
	 * Hides the line.
	 * @public
	 */
	Line.prototype.setHidden = function (bValue) {
		this.$()[bValue ? "hide" : "show"]();
	};

	/* =========================================================== */
	/* Private methods */
	/* =========================================================== */
	Line.prototype._isIgnored = function () {
		var oFrom = this.getFromNode(),
			oTo = this.getToNode(),
			bInsideCollapsedGroup =
				oFrom._oGroup && oFrom._oGroup.getCollapsed()
				&& oTo._oGroup && oTo._oGroup.getCollapsed()
				&& oFrom._oGroup === oTo._oGroup,
			bNodesIgnored = !oFrom._useInLayout() || !oTo._useInLayout();

		return !this._useInLayout || bInsideCollapsedGroup || this._isLoop() || bNodesIgnored;
	};

	Line.prototype._isLoop = function () {
		return this.getFromNode().getId() === this.getToNode().getId();
	};

	Line.prototype._getLineId = function () {
		return this._sKey ? this._sKey : "line_" + this.getFrom() + "-" + this.getTo();
	};

	Line.prototype._setupEvents = function () {
		var $line = this.$().find(".sapSuiteUiCommonsNetworkLineInvisibleWrapper");

		$line.on("click", function (oEvent) {
			this._click({
				ctrlKey: oEvent.ctrlKey,
				clientX: oEvent.clientX,
				clientY: oEvent.clientY
			});
		}.bind(this));

		$line.on("mouseover", function (oEvent) {
			this._mouseOver();
		}.bind(this));

		$line.on("mouseout", function (oEvent) {
			this._mouseOut();
		}.bind(this));
	};

	Line.prototype._mouseOut = function () {
		this.$().removeClass(this.HIGHLIGHT_CLASS);
		if (!this.getSelected()) {
			this._setStatusColors("");
		}
	};

	Line.prototype._mouseOver = function () {
		var bExecuteDefault = this.fireEvent("hover", {}, true);

		if (!this.getSelected() && bExecuteDefault) {
			this._setStatusColors("Hover");
			this.$().addClass(this.HIGHLIGHT_CLASS);
		}
	};

	Line.prototype._setStatusColors = function (sType) {
		var $arrow = this.$().find(".sapSuiteUiCommonsNetworkLineArrow"),
			sBorderColor = this._getColor(ElementBase.ColorType[sType + "Border"]),
			sBackgroundColor = this._getColor(ElementBase.ColorType[sType + "Background"]);

		$arrow.css("fill", sBackgroundColor);
		$arrow.css("stroke", sBorderColor);
		this.$("path").css("stroke", sBorderColor);

		if (this.getParent() && this.getParent()._isSwimLane()) {
			var $nipple = this.$().find(".sapSuiteUiCommonsNetworkLineNipple");
			$nipple.css("fill", sBackgroundColor);
			$nipple.css("stroke", sBorderColor);
		}
	};

	Line.prototype._showActionButtons = function (oPoint) {
		var fnCheckAndSetBoundaries = function (oNode, iBottom, iRight) {
			var bIntersection = fnCheckBoundaries(oNode, iBottom, iRight);
			if (bIntersection) {
				oNode._setNodeOpacity(true);
				oParent._aShadedNodes.push(oNode);
			}

			return bIntersection;
		};

		var fnCheckBoundaries = function (oNode, iBottom, iRight) {
			return Geometry.hasRectangleRectangleIntersection({
				p1: {
					x: iLeft,
					y: iTop
				},
				p2: {
					x: iRight,
					y: iBottom
				}
			}, oNode._getContentRect());
		};

		var fnCreateLine = function (oFrom, oTo) {
			return {
				p1: {
					x: oFrom.x,
					y: oFrom.y
				},
				p2: {
					x: oTo.x,
					y: oTo.y
				}
			};
		};

		var iLines = 0;
		var fnAppendArrow = function (sClass, oPos) {
			if (iLines < 2) {
				var $arrow = jQuery('<div></div>', {
					"class": sClass,
					css: {
						top: oPos.top,
						left: oPos.left,
						right: oPos.right,
						bottom: oPos.bottom
					}
				});

				$tooltip.append($arrow);
				iLines++;
			}
		};

		var oParent = this.getParent(),
			$wrapper = oParent.$("divlinebuttons"),
			$tooltip = oParent.$("linetooltip"),
			$buttons = oParent.$("linetooltipbuttons");

		var oFrom = this.getFromNode(),
			oTo = this.getToNode();

		var ARROW_SIZE = 10;

		oParent._aShadedNodes = [];

        var sFromNodeTitle = oFrom.getTitle();
		var sFromNodeText = sFromNodeTitle ? sFromNodeTitle : oFrom.getAltText();

		var sTitle = "<span class=\"sapSuiteUiCommonsNetworkGraphLineTooltipText\">" + sFromNodeText + "</span>";

		if (this._isBothArrow()) {
			sTitle += "<span class=\"sapSuiteUiCommonsNetworkGraphLineTooltipArrow sapSuiteUiCommonsNetworkGraphLineTooltipDualArrow\"></span>";
		}

        var sToNodeTitle = oTo.getTitle();
		var sToNodeText = sToNodeTitle ? sToNodeTitle : oTo.getAltText();

		sTitle += "<span class=\"sapSuiteUiCommonsNetworkGraphLineTooltipArrow\"></span>" +
			"</br>" +
			"<span class=\"sapSuiteUiCommonsNetworkGraphLineTooltipText\">" + sToNodeText + "</span>";

		$tooltip.html(sTitle);
		$buttons.html("");

		this.getActionButtons().forEach(function (oButton) {
			this._appendActionButton({
				icon: oButton.getIcon(),
				enable: oButton.getEnabled(),
				title: oButton.getTitle(),
				id: oButton.getId(),
				click: function (evt) {
					oButton.firePress({
						buttonElement: evt.target
					});
				}
			}, $buttons);
		}.bind(this));

		$wrapper.show();

		var iTop = oPoint.y - $tooltip.outerHeight() / 2,
			iLeft = oPoint.x - $tooltip.outerWidth() / 2,
			iBottom = iTop + $tooltip.outerHeight(),
			iRight = iLeft + $tooltip.outerWidth();

		fnCheckAndSetBoundaries(oTo, iBottom, iLeft + $wrapper.width());
		// for purposes of displaying arrow we check only right boundaries of tooltip
		// for node setting opacity we use right edge with buttons
		// thats why we call it 3 times
		var bCrossLeft = fnCheckAndSetBoundaries(oFrom, iTop + $tooltip.height(), iLeft),
			bCrossRight = fnCheckAndSetBoundaries(oTo, iBottom, iLeft + $tooltip.outerWidth() + ARROW_SIZE);

		if (oParent._isLayered()) {
			var oTopLeft = {
				x: iLeft,
				y: iTop
			};

			var oTopRight = {
				x: iRight,
				y: iTop
			};

			var oBottomRight = {
				x: iRight,
				y: iBottom
			};

			var oBottomLeft = {
				x: iLeft,
				y: iBottom
			};

			var aCoordinates = this.getCoordinates();

			for (var i = 0; i < aCoordinates.length - 1 && iLines < 2; i++) {
				var oCoordPrev = aCoordinates[i],
					oCoordNext = aCoordinates[i + 1];

				var oPrev = {
					x: oCoordPrev.getX(),
					y: oCoordPrev.getY()
				};

				var oNext = {
					x: oCoordNext.getX(),
					y: oCoordNext.getY()
				};

				var oLine = fnCreateLine(oPrev, oNext);

				var oIntersection = Geometry.getSegmentsIntersection(oLine, fnCreateLine(oTopLeft, oBottomLeft));
				if (oIntersection && !bCrossLeft) {
					fnAppendArrow("sapSuiteUiCommonsNetworkGraphTooltipLeftArrow", {
						top: (oIntersection.y - iTop) - ARROW_SIZE
					});
				}

				oIntersection = Geometry.getSegmentsIntersection(oLine, fnCreateLine(oTopRight, oBottomRight));
				if (oIntersection && !bCrossRight) {
					fnAppendArrow("sapSuiteUiCommonsNetworkGraphTooltipRightArrow", {
						top: (oIntersection.y - iTop) - ARROW_SIZE
					});
				}

				oIntersection = Geometry.getSegmentsIntersection(oLine, fnCreateLine(oBottomLeft, oBottomRight));
				if (oIntersection) {
					fnAppendArrow("sapSuiteUiCommonsNetworkGraphTooltipBottomArrow", {
						left: oIntersection.x - iLeft - ARROW_SIZE
					});
				}

				oIntersection = Geometry.getSegmentsIntersection(oLine, fnCreateLine(oTopLeft, oTopRight));
				if (oIntersection) {
					fnAppendArrow("sapSuiteUiCommonsNetworkGraphTooltipTopArrow", {
						left: oIntersection.x - iLeft - ARROW_SIZE
					});
				}
			}

			$wrapper.css("top", iTop + "px");
			$wrapper.css("left", iLeft + "px");
		}
	};

	Line.prototype._setActionButtonFocus = function (oItem, bFocus) {
		var $wrapper = this.getParent().$("divlinebuttons");

		$wrapper.removeClass(this.FOCUS_CLASS);
		$wrapper.find("." + this.FOCUS_CLASS).removeClass(this.FOCUS_CLASS);

		jQuery(oItem).toggleClass(this.FOCUS_CLASS, bFocus);
	};

	Line.prototype._click = function (mArguments) {
		var oParent = this.getParent(),
			oPoint = mArguments.skipConversion
						? ({x : mArguments.clientX, y : mArguments.clientY})
						: (oParent.getCorrectMousePosition({
								x: mArguments.clientX,
								y: mArguments.clientY
							})),
			oOpener = oParent._tooltip._getOpener(this, oPoint), bExecuteDefault;

		oParent._selectLine({
			element: this,
			forceFocus: true,
			preventDeselect: mArguments.ctrlKey
		});

		bExecuteDefault = this.fireEvent("press", {
			opener: oOpener,
			point: oPoint
		}, true);

		if (this.getSelected() && bExecuteDefault) {
			(this.getActionButtons().length === 0) ?
				oParent._tooltip.openDetail({
					item: this,
					opener: oOpener,
					point: oPoint
				}) : this._showActionButtons(oPoint);
		}
	};

	Line.prototype._setFocus = function (bFocus) {
		ElementBase.prototype._setFocus.call(this, bFocus);
		if (bFocus) {
			this._renderFocusWrapper();
		}
	};

	Line.prototype._isEndPosition = function () {
		return ((this.getArrowPosition() === ArrowPosition.End && this.getArrowOrientation() === ArrowOrientation.ParentOf) ||
			(this.getArrowPosition() === ArrowPosition.Start && this.getArrowOrientation() === ArrowOrientation.ChildOf));
	};

	Line.prototype._moveToEnd = function () {
		return this._isEndPosition() ||
			(this.getArrowPosition() === ArrowPosition.Middle && this.getArrowOrientation() === ArrowOrientation.ParentOf);
	};

	Line.prototype._hideShow = function (bCollapse) {
		if (bCollapse) {
			this.$().hide();
			this._bIsHidden = true;
		} else if (!this.getToNode()._bIsHidden && !this.getFromNode()._bIsHidden) {
			this.$().show();
			this._bIsHidden = false;
		}
	};

	Line.prototype._shift = function (oPoint) {
		this.getBends().forEach(function (b) {
			b.setX(b.getX() + oPoint.x);
			b.setY(b.getY() + oPoint.y);
		});

		if (this.getSource()) {
			this.setSource({
				x: this.getSource().getX() + oPoint.x,
				y: this.getSource().getY() + oPoint.y
			});
		}

		if (this.getTarget()) {
			this.setTarget({
				x: this.getTarget().getX() + oPoint.x,
				y: this.getTarget().getY() + oPoint.y
			});
		}

		if (this._aNipples) {
			this._aNipples.forEach(function (oNip) {
				oNip.x += oPoint.x;
				oNip.y += oPoint.y;
			});
		}
	};

	Line.prototype._normalizePath = function () {
		var oFromCenter, oToCenter;
		oFromCenter = this.getFromNode().getCenterPosition();
		this.setSource({
			x: oFromCenter.x,
			y: oFromCenter.y
		});
		oToCenter = this.getToNode().getCenterPosition();
		this.setTarget({
			x: oToCenter.x,
			y: oToCenter.y
		});
		this.clearBends();
	};

	Line.prototype._validateLayout = function () {
		return (!this.getSource() || (isFinite(this.getSource().getX()) && isFinite(this.getSource().getY())))
			&& (!this.getTarget() || (isFinite(this.getTarget().getX()) && isFinite(this.getTarget().getY())))
			&& !this.getBends().some(function (oBend) {
				return !isFinite(oBend.getX()) || !isFinite(oBend.getY());
			});
	};

	/* =========================================================== */
	/* Getters, Setters & Private helper methods*/
	/* =========================================================== */
	Line.prototype.setSelected = function (bSelected) {
		var oParent = this.getParent(),
			sFnName = bSelected ? "addClass" : "removeClass";

		this._setStatusColors(bSelected ? "Selected" : "");

		this.setProperty("selected", bSelected, true);
		this.$()[sFnName](this.SELECT_CLASS);

		if (oParent) {
			if (bSelected) {
				oParent._mSelectedLines[this._getLineId()] = this;
			} else {
				this._setStatusColors(""); //sets defined color back, after unselect
				delete oParent._mSelectedLines[this._getLineId()];
			}
		}

		return this;
	};

	Line.prototype.setFrom = function (sFrom) {
		var oParent = this.getParent();
		this.setProperty("from", sFrom, true);
		if (oParent) {
			oParent.invalidate();
		}
		return this;
	};

	Line.prototype.setTo = function (sTo) {
		var oParent = this.getParent();
		this.setProperty("to", sTo, true);
		if (oParent) {
			oParent.invalidate();
		}
		return this;
	};

	Line.prototype._isTopBottom = function () {
		var oParent = this.getParent();
		return oParent && oParent._isTopBottom();
	};

	Line.prototype.getFocusDomRef = function () {
		return this.getDomRef("invisibleWrapper");
	};

	Line.prototype._createSuggestionHelpText = function () {
		var LINE_TITLE_LENGTH = 25;
		var sTitle = this.getTitle() ? (this.getTitle() + " ") : "";

        var sFromNodeTitle = this.getFromNode().getTitle();
		var sFromNodeText = sFromNodeTitle ? sFromNodeTitle : this.getFromNode().getAltText();

        var sToNodeTitle = this.getToNode().getTitle();
		var sToNodeText = sToNodeTitle ? sToNodeTitle : this.getToNode().getAltText();

		return sTitle + "(" + Utils.trimText(sFromNodeText, LINE_TITLE_LENGTH) + " -> "
			+ Utils.trimText(sToNodeText, LINE_TITLE_LENGTH) + ")";
	};

	Line.prototype._isInCollapsedGroup = function () {
		var oFrom = this.getFromNode(),
			oTo = this.getToNode();

		return (oFrom._oGroup === oTo._oGroup) && oFrom._isInCollapsedGroup();
	};

	Line.prototype._isBothMiddleArrow = function () {
		return this.getArrowOrientation() === ArrowOrientation.Both && this.getArrowPosition() === ArrowPosition.Middle;
	};

	Line.prototype._isBothArrow = function () {
		return this.getArrowOrientation() === ArrowOrientation.Both;
	};

	Line.prototype._isOnScreen = function (iLeft, iRight, iTop, iBottom) {
		var aCoordinates = this.getCoordinates(),
			i, bOnScreen;
		for (i = 1; i < aCoordinates.length; i++) {
			bOnScreen = ElementBase._isRectOnScreen(aCoordinates[i - 1].getX(), aCoordinates[i].getX(), aCoordinates[i - 1].getY(),
													aCoordinates[i].getY(), iLeft, iRight, iTop, iBottom);
			if (bOnScreen) {
				return true;
			}
		}
		return false;
	};

	return Line;
});
