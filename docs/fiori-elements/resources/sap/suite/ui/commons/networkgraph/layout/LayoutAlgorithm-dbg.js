/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/suite/ui/commons/library",
	"sap/ui/core/Element",
	"./Geometry"
], function (library, Element, Geometry) {
	"use strict";

	/**
	 * Constructor for a new LayoutingAlgorithm.
	 *
	 * @class
	 * This is an abstract base class for Layout Algorithms.
	 * @abstract
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @constructor
	 * @public
	 * @since 1.50
	 * @alias sap.suite.ui.commons.networkgraph.layout.LayoutAlgorithm
	 */
	var LayoutAlgorithm = Element.extend("sap.suite.ui.commons.networkgraph.layout.LayoutAlgorithm", {
		metadata: {
			"abstract": true,
			publicMethods: [
				"getType",
				"isLayered",
				"layout"
			]
		}
	});

	var GLOBAL_MARGIN = 50, // Mainly for action buttons of nodes not to get cut
		NORMALIZED_LINES_MARGIN = 0.2;

	var Orientation = library.networkgraph.Orientation,
		Shape = library.networkgraph.NodeShape;

	LayoutAlgorithm.prototype._normalizeLines = function () {
		var oGraph = this.getParent(),
			mPaths = {}, oKey, oPath, iIndex,
			oCentralVector, fNormSize, oShiftVector, fLineDistance,
			fLineShiftX, fLineShiftY;

		// First build a map of node combinations with all respective lines
		oGraph.getLines().forEach(function (oLine) {
			// We need to get lines going both ways between the same two nodes into one map slot
			oKey = oLine.getFrom() < oLine.getTo() ? oLine.getFrom() + "-" + oLine.getTo() : oLine.getTo() + "-" + oLine.getFrom();
			if (!mPaths[oKey]) {
				mPaths[oKey] = {
					from: oLine.getFromNode(),
					to: oLine.getToNode(),
					lines: []
				};
			}
			mPaths[oKey].lines.push(oLine);
		});

		Object.keys(mPaths).forEach(function (sKey) {
			oPath = mPaths[sKey];
			if (oPath.lines.length === 1) {
				oPath.lines[0]._normalizePath();
				return;
			}

			fNormSize = Math.min(oPath.from._getCircleSize(), oPath.to._getCircleSize()) / 2;
			fLineDistance = 2 * (1 - NORMALIZED_LINES_MARGIN) / (oPath.lines.length - 1);
			iIndex = -1;

			oPath.lines.forEach(function (oLine) {
				iIndex++;
				oCentralVector = {center: oLine.getFromNode().getCenterPosition(), apex: oLine.getToNode().getCenterPosition()};
				oShiftVector = Geometry.getNormalizedVector(oCentralVector, fNormSize);
				oShiftVector = Geometry.getRotatedVector(oShiftVector, Math.PI / 2);
				fLineShiftX = ((NORMALIZED_LINES_MARGIN - 1) + iIndex * fLineDistance) * oShiftVector.apex.x;
				fLineShiftY = ((NORMALIZED_LINES_MARGIN - 1) + iIndex * fLineDistance) * oShiftVector.apex.y;
				oLine.setSource({
					x: oLine.getFromNode().getCenterPosition().x + fLineShiftX,
					y: oLine.getFromNode().getCenterPosition().y + fLineShiftY
				});
				oLine.setTarget({
					x: oLine.getToNode().getCenterPosition().x + fLineShiftX,
					y: oLine.getToNode().getCenterPosition().y + fLineShiftY
				});
			});
		});
	};

	LayoutAlgorithm.prototype._stretchLinesToCircleNodeAxes = function () {
		var oGraph = this.getParent(),
			bHorizontal = oGraph.getOrientation() != Orientation.TopBottom
				&& oGraph.getOrientation() != Orientation.BottomTop,
			oFrom, oTo;

		oGraph.getLines().forEach(function (oLine) {
			if (oLine._isIgnored()) {
				return;
			}

			var bStretch = oLine.getStretchToCenter();
			var fnStretchLine = function (oNode) {
				return ((bStretch && oNode._isCustom()) || oNode._isCircle()) && !oNode._isIgnored();
			};

			oFrom = oLine.getFromNode();
			oTo = oLine.getToNode();
			if (bHorizontal) {
				if (fnStretchLine(oFrom)) {
					oLine.getSource().setX(Math.round(oFrom.getX() + oFrom._iWidth / 2));
				}
				if (fnStretchLine(oTo)) {
					oLine.getTarget().setX(Math.round(oTo.getX() + oTo._iWidth / 2));
				}
			} else {
				if (fnStretchLine(oFrom)) {
					oLine.getSource().setY(Math.round(oFrom.getY() + oFrom._getShapeSize(bHorizontal) / 2));
				}
				if (fnStretchLine(oTo)) {
					oLine.getTarget().setY(Math.round(oTo.getY() + oTo._getShapeSize(bHorizontal) / 2));
				}
			}
		});
	};

	LayoutAlgorithm.prototype._cutLinesAtBoxNodeBorders = function () {
		var oGraph = this.getParent(),
			aCoords, p1, p2, aNodePoints, aX, iLastIndex;
		oGraph.getLines().forEach(function (oLine) {
			aCoords = oLine.getCoordinates();

			// Cut at the source
			if (oLine.getFromNode().getShape() === Shape.Box) {
				p1 = {x: aCoords[0].getX(), y: aCoords[0].getY()};
				p2 = {x: aCoords[1].getX(), y: aCoords[1].getY()};
				aNodePoints = this._getNodePoints(oLine.getFromNode());
				aX = Geometry.getLineRectangleIntersections({p1: p1, p2: p2}, {p1: aNodePoints[0], p2: aNodePoints[1]});
				if (aX.length > 1) {
					if (Geometry.getPointsDistance(aX[0], p2) < Geometry.getPointsDistance(aX[1], p2)) {
						oLine.setSource(aX[0]);
					} else {
						oLine.setSource(aX[1]);
					}
				}
			}

			// Cut at the target
			if (oLine.getToNode().getShape() === Shape.Box) {
				iLastIndex = aCoords.length - 1;
				p1 = {x: aCoords[iLastIndex - 1].getX(), y: aCoords[iLastIndex - 1].getY()};
				p2 = {x: aCoords[iLastIndex].getX(), y: aCoords[iLastIndex].getY()};
				aNodePoints = this._getNodePoints(oLine.getToNode());
				aX = Geometry.getLineRectangleIntersections({p1: p1, p2: p2}, {p1: aNodePoints[0], p2: aNodePoints[1]});
				if (aX.length > 1) {
					if (Geometry.getPointsDistance(aX[0], p1) < Geometry.getPointsDistance(aX[1], p1)) {
						oLine.setTarget(aX[0]);
					} else {
						oLine.setTarget(aX[1]);
					}
				}
			}
		}.bind(this));
	};

	LayoutAlgorithm.prototype._getNodePoints = function (oNode) {
		return [
			{x: oNode.getX(), y: oNode.getY()},
			{x: oNode.getX() + oNode._iWidth, y: oNode.getY() + oNode._iHeight}];
	};

	LayoutAlgorithm.prototype._getNodesPoints = function (aElements) {
		var aPoints = [];
		aElements.forEach(function (oElement) {
			if (oElement._isIgnored && !oElement._isIgnored()
				&& (!oElement._isInCollapsedGroup || !oElement._isInCollapsedGroup())) {
				aPoints.push({x: oElement.getX(), y: oElement.getY()});
				aPoints.push({x: oElement.getX() + oElement._iWidth, y: oElement.getY() + oElement._iHeight});
			}
		});
		return aPoints;
	};

	LayoutAlgorithm.prototype._getLinesPoints = function () {
		var oGraph = this.getParent(),
			aPoints = [];
		oGraph.getLines().forEach(function (oLine) {
			if (oLine._isIgnored()) {
				return;
			}
			if (oLine.getSource()) {
				aPoints.push({x: oLine.getSource().getX(), y: oLine.getSource().getY()});
			}
			if (oLine.getTarget()) {
				aPoints.push({x: oLine.getTarget().getX(), y: oLine.getTarget().getY()});
			}
			oLine.getBends().forEach(function (oBend) {
				aPoints.push({x: oBend.getX(), y: oBend.getY()});
			});
		});
		return aPoints;
	};

	LayoutAlgorithm.prototype._verticalMirror = function (bUseGroupBorder) {
		var oGraph = this.getParent(),
			oBox = this._getGraphBoundingBox(),
			fAxisXm2 = (oBox.p1.x + oBox.p2.x),
			fGroupOffset;

		oGraph.getNodes().forEach(function (oNode) {
			oNode.setX(fAxisXm2 - (oNode.getX() + oNode._iWidth));
		});
		oGraph.getGroups().forEach(function (oGroup) {
			fGroupOffset = bUseGroupBorder ? 2 * oGroup._getBorderSize() : 0;
			oGroup.setX(fAxisXm2 - (oGroup.getX() + oGroup._iWidth + fGroupOffset));
		});
		oGraph.getLines().forEach(function (oLine) {
			if (oLine._isIgnored()) {
				return;
			}
			if (oLine.getSource()) {
				oLine.setSource({x: fAxisXm2 - oLine.getSource().getX()});
			}
			if (oLine.getTarget()) {
				oLine.setTarget({x: fAxisXm2 - oLine.getTarget().getX()});
			}
			oLine.getBends().forEach(function (oBend) {
				oBend.setX(fAxisXm2 - oBend.getX());
			});
			if (oLine._aNipples) {
				oLine._aNipples.forEach(function (oNip) {
					oNip.x = fAxisXm2 - oNip.x;
					if (oNip.orientation === Orientation.LeftRight) {
						oNip.orientation = Orientation.RightLeft;
					} else if (oNip.orientation === Orientation.RightLeft) {
						oNip.orientation = Orientation.LeftRight;
					}
				});
			}
		});
	};

	LayoutAlgorithm.prototype._horizontalMirror = function (bUseGroupBorder) {
		var oGraph = this.getParent(),
			oBox = this._getGraphBoundingBox(),
			fAxisYm2 = (oBox.p1.y + oBox.p2.y),
			fGroupOffset;

		oGraph.getNodes().forEach(function (oNode) {
			oNode.setY(fAxisYm2 - (oNode.getY() + oNode._iHeight));
		});
		oGraph.getGroups().forEach(function (oGroup) {
			fGroupOffset = bUseGroupBorder ? 2 * oGroup._getBorderSize() : 0;
			oGroup.setY(fAxisYm2 - (oGroup.getY() + oGroup._iHeight + fGroupOffset));
		});
		oGraph.getLines().forEach(function (oLine) {
			if (oLine._isIgnored()) {
				return;
			}
			if (oLine.getSource()) {
				oLine.setSource({y: fAxisYm2 - oLine.getSource().getY()});
			}
			if (oLine.getTarget()) {
				oLine.setTarget({y: fAxisYm2 - oLine.getTarget().getY()});
			}
			oLine.getBends().forEach(function (oBend) {
				oBend.setY(fAxisYm2 - oBend.getY());
			});
			if (oLine._aNipples) {
				oLine._aNipples.forEach(function (oNip) {
					oNip.y = fAxisYm2 - oNip.y;
					if (oNip.orientation === Orientation.TopBottom) {
						oNip.orientation = Orientation.BottomTop;
					} else if (oNip.orientation === Orientation.BottomTop) {
						oNip.orientation = Orientation.TopBottom;
					}
				});
			}
		});
	};

	LayoutAlgorithm.prototype._shiftGraph = function (fX, fY, bSkipGroups) {
		var oGraph = this.getParent();
		if (!bSkipGroups) {
			oGraph.getGroups().forEach(function (oGroup) {
				oGroup.setX(oGroup.getX() + fX);
				oGroup.setY(oGroup.getY() + fY);
			});
		}
		oGraph.getNodes().forEach(function (oNode) {
			oNode.setX(oNode.getX() + fX);
			oNode.setY(oNode.getY() + fY);
			oNode.aLines.forEach(function (oLine) {
				oLine._shift({x: fX, y: fY});
			});
		});
	};

	LayoutAlgorithm.prototype._getGraphBoundingBox = function () {
		var oGraph = this.getParent(),
			aPoints = this._getNodesPoints(oGraph.getNodes())
				.concat(this._getNodesPoints(oGraph.getGroups()))
				.concat(this._getLinesPoints());

		return Geometry.getBoundingBox(aPoints);
	};

	/**
	 * @protected
	 */
	LayoutAlgorithm.prototype._alignCoordinatesWithView = function () {
		var oBBox = this._getGraphBoundingBox(),
			fXShift = GLOBAL_MARGIN - oBBox.p1.x,
			fYShift = GLOBAL_MARGIN - oBBox.p1.y;
		this._shiftGraph(fXShift, fYShift);
	};

	/**
	 * @protected
	 * @returns {boolean} True if there are hierarchical groups, false otherwise.
	 */
	LayoutAlgorithm.prototype._hasHierarchicalGroups = function () {
		return this.getParent().getGroups().some(function (oGroup) {
			return oGroup.getParentGroupKey();
		});
	};

	/**
	 * Specifies the type of layout algorithm that defines the visual features and layout of the network graph.
	 *
	 * @abstract
	 * @returns {sap.suite.ui.commons.networkgraph.LayoutType}
	 * @public
	 */
	LayoutAlgorithm.prototype.getType = function () {
		throw new Error("To be overridden in implementing class.");
	};

	/**
	 * Specifies if this layouting algorithm distributes nodes into layers. Parent graph may change behaviour based
	 * on this option.
	 *
	 * @abstract
	 * @returns {boolean}
	 * @public
	 */
	LayoutAlgorithm.prototype.isLayered = function () {
		throw new Error("To be overridden in implementing class.");
	};

	/**
	 * Executes the layouting algorithm.
	 *
	 * @abstract
	 * @returns {sap.suite.ui.commons.networkgraph.layout.LayoutTask}
	 * @public
	 */
	LayoutAlgorithm.prototype.layout = function () {
		throw new Error("To be overridden in implementing class.");
	};

	return LayoutAlgorithm;
});
