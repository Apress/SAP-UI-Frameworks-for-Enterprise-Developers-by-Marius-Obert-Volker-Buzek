sap.ui.define([
	"sap/suite/ui/commons/library",
	"./LayoutAlgorithm",
	"./Geometry",
	"./LayoutTask"
], function (library, LayoutAlgorithm, Geometry, LayoutTask) {
	"use strict";

	// shortcut for sap.suite.ui.commons.networkgraph.Orientation
	var Orientation = library.networkgraph.Orientation;

	var LayoutRenderType = library.networkgraph.LayoutRenderType,
		GROUP_HEADER_SIZE = 32,
		LANE_VERT_MARGIN = 50,
		LANE_HORI_MARGIN = 75,
		SPACE_BETWEEN_LANES = 75,
		SPACE_BETWEEN_ROWS = 75,
		COLLAPSED_LANE_WIDTH = 32,
		LINE_FRAGMENT_FASCICLE_IDEAL_GAP = 10,
		LINE_FRAGMENT_FASCICLE_MAX_SIZE = 25;

	/**
	 * Constructor for a new SwimLaneChainLayout.
	 *
	 * @class
	 * This algorithm uses the klay.js algorithm to rearrange the graph in grid form. It's suitable for process flows and
	 * tree-like graphs. It can be used for almost any graph.
	 *
	 * @extends sap.suite.ui.commons.networkgraph.layout.LayoutAlgorithm
	 *
	 * @constructor
	 * @public
	 * @since 1.58
	 * @alias sap.suite.ui.commons.networkgraph.layout.SwimLaneChainLayout
	 */
	var SwimLaneChainLayout = LayoutAlgorithm.extend("sap.suite.ui.commons.networkgraph.layout.SwimlaneChainLayout", {
		metadata: {
			library: "sap.suite.ui.commons",
			properties: {}
		}
	});

	/**
	 * Specifies the type of layout algorithm that defines the visual features and layout of the network graph.
	 *
	 * @returns {sap.suite.ui.commons.networkgraph.LayoutRenderType}
	 * @public
	 */
	SwimLaneChainLayout.prototype.getLayoutRenderType = function () {
		return LayoutRenderType.SwimLanes;
	};

	/**
	 * Executes the layout algorithm.
	 * @returns {sap.suite.ui.commons.networkgraph.layout.LayoutTask} Task to get the layout calculated.
	 * @public
	 */
	SwimLaneChainLayout.prototype.layout = function () {
		return new LayoutTask(function (fnResolve, fnReject, oLayoutTask) {

			var oGraph = this.getParent(), sError;
			if (!oGraph) {
				fnReject("The algorithm must be associated with a graph.");
				return;
			}
			this.oGraph = oGraph;

			sError = this._validateGraphDefinition();
			if (sError) {
				fnReject(sError);
			}

			this.bVertLane =
				oGraph.getOrientation() === Orientation.LeftRight
				|| oGraph.getOrientation() === Orientation.RightLeft;

			// Node layouting block
			this._calcLanesProperties();
			this._findRoots();
			this._initGrid();
			this._traceAndStackNodes();
			this._calcRowsProperties();
			this._calcNodesCoordinates();

			// Line tracing block
			this.oGraph.getLines().forEach(function (oLine) {
				this._traceSingleLine(oLine);
				this._calcLineCentroid(oLine);
				oLine._aNipples = [];
			}.bind(this));
			this._indexAllLineFragments();

			// Lines optimization
			// this._stretchLinesToCircleNodeAxes(); // TODO: Circle nodes support
			this._cutLinesAtBoxNodeBorders();
			this._removeLineOverlays(this.aHorizontalFragments, true);
			this._removeLineOverlays(this.aVerticalFragments, false);

			// Elements postprocessing
			this._calcLanesWidthsAndPositions();
			this._collapseShiftNodesAndLines();

			// Various postprocessing
			this._alignCoordinatesWithView();
			this._beautify();
			this._findAllNipples();
			this._cullLineFragmentsInCollapsedGroups();

			// Orientation postprocessing
			if ((!this.oGraph._bIsRtl && oGraph.getOrientation() === Orientation.RightLeft)
				|| (this.oGraph._bIsRtl && oGraph.getOrientation() === Orientation.LeftRight)) {
				this._verticalMirror();
			} else if (oGraph.getOrientation() === Orientation.BottomTop) {
				this._horizontalMirror();
			}

			fnResolve();
		}.bind(this));
	};

	SwimLaneChainLayout.prototype._validateGraphDefinition = function () {
		var aUnlanedNodes = [];
		this.oGraph.getNodes().forEach(function (oNode) {
			if (!oNode.getGroup()) {
				aUnlanedNodes.push(oNode.getKey());
			}
		});
		if (aUnlanedNodes.length > 0) {
			return "Some nodes are missing swim lanes: " + aUnlanedNodes.join();
		}

		if (this._hasHierarchicalGroups()) {
			return "Swim lane layout algorithm doesn't support hierarchical groups.";
		}

		return null;
	};

	/**
	 * @private
	 */
	SwimLaneChainLayout.prototype._calcLanesProperties = function () {
		// Index lanes and set them for nodes
		this.aLanes = [];
		this.oGraph.getGroups().forEach(function (oGroup) {
			if (this.bVertLane) {
				oGroup.setY(0);
			} else {
				oGroup.setX(0);
			}
			this.aLanes.push(oGroup.getKey());
		}.bind(this));
		this.aLanes.sort();
		this.oGraph.getNodes().forEach(function (oNode) {
			oNode._iGroupIndex = this.aLanes.indexOf(oNode.getGroup());
		}.bind(this));

		// Find index of the first lane, calc lanes widths
		var fNodeSize;
		this.aLaneWidths = {};
		this.aLaneOffsets = {};
		this.oGraph.getNodes().forEach(function (oNode) {
			fNodeSize = this.bVertLane ? oNode._iWidth : oNode._iHeight;
			if (!this.aLaneWidths[oNode._iGroupIndex] || this.aLaneWidths[oNode._iGroupIndex] < fNodeSize) {
				this.aLaneWidths[oNode._iGroupIndex] = fNodeSize;
			}
		}.bind(this));

		var iLane;
		this.aLaneGroups = {};
		this.oGraph.getGroups().forEach(function (oGroup) {
			iLane = this.aLanes.indexOf(oGroup.getKey());
			if (this.aLaneWidths[iLane] < oGroup.getMinWidth()) {
				this.aLaneWidths[iLane] = oGroup.getMinWidth();
			}
			this.aLaneGroups[iLane] = oGroup;
		}.bind(this));

		// Turn lane widths into lane offsets
		var fOffset = 0;
		Object.keys(this.aLaneWidths).forEach(function (iLane) {
			if (fOffset > 0) {
				fOffset += SPACE_BETWEEN_LANES;
			}
			this.aLaneOffsets[iLane] = fOffset;
			fOffset += this.aLaneWidths[iLane];
		}.bind(this));
	};

	/**
	 * @private
	 */
	SwimLaneChainLayout.prototype._findRoots = function () {
		// Find nodes in the first lane, which have no parents, these are primary roots
		this.aRoots = [];
		this.oGraph.getNodes().forEach(function (oNode) {
			if ((oNode._iGroupIndex === 0) && (oNode.aParents.length === 0)) {
				this.aRoots.push(oNode);
			}
		}.bind(this));
		// Then add all other parent-less nodes as secondary roots
		this.oGraph.getNodes().forEach(function (oNode) {
			if ((oNode._iGroupIndex > 0) && (oNode.aParents.length === 0)) {
				this.aRoots.push(oNode);
			}
		}.bind(this));
		// As a fallback add all nodes to the end so that isolated cycles are not skipped eg.
		this.oGraph.getNodes().forEach(function (oNode) {
			this.aRoots.push(oNode);
		}.bind(this));
	};

	/**
	 * @private
	 */
	SwimLaneChainLayout.prototype._initGrid = function () {
		this.aGrid = [];
		this.oGraph.getNodes().forEach(function (oNode) {
			if (!this.aGrid[oNode._iGroupIndex]) {
				this.aGrid[oNode._iGroupIndex] = [];
			}
			oNode._bChainTraced = false;
		}.bind(this));
	};

	/**
	 * @private
	 */
	SwimLaneChainLayout.prototype._traceAndStackNodes = function () {
		this.aRoots.forEach(function (oRoot) {
			if (!oRoot._bChainTraced) {
				this.aGrid[oRoot._iGroupIndex].push(oRoot);
				oRoot._bChainTraced = true;
				this._traceNodeChainDepthFirst(oRoot);
			}
		}.bind(this));
	};

	/**
	 * @private
	 */
	SwimLaneChainLayout.prototype._traceNodeChainDepthFirst = function (oNode) {
		oNode.aChildren.forEach(function (oChild) {
			if (!oChild._bChainTraced) {
				oChild._bChainTraced = true;
				this.aGrid[oChild._iGroupIndex].push(oChild);
				this._traceNodeChainDepthFirst(oChild);
			}
		}.bind(this));
	};

	/**
	 * @private
	 */
	SwimLaneChainLayout.prototype._calcRowsProperties = function () {
		var iMaxRow = 0, fNodeSize;
		this.aGrid.forEach(function (aSlope) {
			if (aSlope.length > iMaxRow) {
				iMaxRow = aSlope.length;
			}
		});

		// Row is as tall as the tallest node
		this.aRowHeights = [];
		this.aRowOffsets = [];
		/* eslint-disable no-loop-func */
		for (var iRow = 0; iRow < iMaxRow; iRow++) {
			this.aGrid.forEach(function (aSlope) {
				if (!aSlope[iRow]) {
					return;
				}
				fNodeSize = this.bVertLane ? aSlope[iRow]._iHeight : aSlope[iRow]._iWidth;
				if (!this.aRowHeights[iRow] || this.aRowHeights[iRow] < fNodeSize) {
					this.aRowHeights[iRow] = fNodeSize;
				}
			}.bind(this));
		}
		/* eslint-disable no-loop-func */

		// Turn row heights into row offsets
		var iIndex = -1,
			fOffset = 0;
		this.aRowHeights.forEach(function (iHeight) {
			iIndex++;
			if (iIndex > 0) {
				fOffset += SPACE_BETWEEN_LANES;
			}
			this.aRowOffsets[iIndex] = fOffset;
			fOffset += iHeight;
		}.bind(this));

		// Devise tallest slope and set it to every group
		this.fGridHeight = this.aRowOffsets[iMaxRow - 1] + this.aRowHeights[iMaxRow - 1];
		if (this.bVertLane) {
			this.fGridHeight += LANE_VERT_MARGIN;
		} else {
			this.fGridHeight += LANE_HORI_MARGIN;
		}
		this.oGraph.getGroups().forEach(function (oGroup) {
			if (this.bVertLane) {
				oGroup._iHeight = this.fGridHeight;
			} else {
				oGroup._iWidth = this.fGridHeight;
			}
		}.bind(this));
	};

	/**
	 * @private
	 */
	SwimLaneChainLayout.prototype._calcNodesCoordinates = function () {
		var iY;
		this.aGrid.forEach(function (aSlope) {
			iY = -1;
			aSlope.forEach(function (oNode) {
				iY++;
				if (this.bVertLane) {
					oNode.setX(
						this.aLaneOffsets[oNode._iGroupIndex]
						+ this.aLaneWidths[oNode._iGroupIndex] / 2
						- oNode._iWidth / 2
						+ SPACE_BETWEEN_LANES / 2);
					oNode.setY(
						this.aRowOffsets[iY]
						+ this.aRowHeights[iY] / 2
						- oNode._iHeight / 2
						+ SPACE_BETWEEN_ROWS / 2);
				} else {
					oNode.setX(
						this.aRowOffsets[iY]
						+ this.aRowHeights[iY] / 2
						- oNode._iWidth / 2
						+ SPACE_BETWEEN_ROWS / 2);
					oNode.setY(
						this.aLaneOffsets[oNode._iGroupIndex]
						+ this.aLaneWidths[oNode._iGroupIndex] / 2
						- oNode._iHeight / 2
						+ SPACE_BETWEEN_LANES / 2);
				}
				oNode.iRow = iY;
			}.bind(this));
		}.bind(this));
	};

	/**
	 * @private
	 */
	SwimLaneChainLayout.prototype._calcLineCentroid = function (oLine) {
		var iCount = oLine.getBends().length + 2,
			xSum = oLine.getSource().getX() + oLine.getTarget().getX(),
			ySum = oLine.getSource().getY() + oLine.getTarget().getY();
		oLine.getBends().forEach(function (oBend) {
			xSum += oBend.getX();
			ySum += oBend.getY();
		});
		oLine._oCentroid = {x: xSum / iCount, y: ySum / iCount};
	};

	/**
	 * @private
	 */
	SwimLaneChainLayout.prototype._indexAllLineFragments = function () {
		this.aVerticalFragments = [];
		this.aHorizontalFragments = [];
		this.oGraph.getLines().forEach(function (oLine) {
			this._indexLineFragments(oLine);
		}.bind(this));
	};

	/**
	 * @private
	 */
	SwimLaneChainLayout.prototype._indexLineFragments = function (oLine) {
		var aPoints = this._getLinePointsList(oLine),
			p1, p2;

		for (var i = 0; i < aPoints.length - 1; i++) {
			p1 = aPoints[i];
			p2 = aPoints[i + 1];
			if (p1.x === p2.x) {
				if (p1.y < p2.y) {
					this.aVerticalFragments.push({line: oLine, index: i, cc: p1.x, c1: p1.y, c2: p2.y});
				} else {
					this.aVerticalFragments.push({line: oLine, index: i, cc: p1.x, c1: p2.y, c2: p1.y, invert: true});
				}
			} else if (p1.y === p2.y) {
				if (p1.x < p2.x) {
					this.aHorizontalFragments.push({line: oLine, index: i, cc: p1.y, c1: p1.x, c2: p2.x});
				} else {
					this.aHorizontalFragments.push({line: oLine, index: i, cc: p1.y, c1: p2.x, c2: p1.x, invert: true});
				}
			}
		}
	};

	/**
	 * @private
	 */
	SwimLaneChainLayout.prototype._removeLineOverlays = function (aFragmentCollection, bHorizontally) {
		var oFrag, aFascicle, iSpaceOut, fGap, fSpaceOutOffset;
		for (var i = 0; i < aFragmentCollection.length; i++) {
			oFrag = aFragmentCollection[i];

			// Collect whole fascicle containing the current fragment
			aFascicle = [oFrag];
			for (var j = i + 1; j < aFragmentCollection.length; j++) {
				if (this._doFragmentsIntersect(oFrag, aFragmentCollection[j])) {
					aFascicle.push(aFragmentCollection[j]);
				}
			}
			if (aFascicle.length === 1) {
				continue;
			}

			// Sort fascicle fragments based on their line's centroid locations
			aFascicle.sort(function (f1, f2) {
				if (bHorizontally) {
					return f1.line._oCentroid.y - f2.line._oCentroid.y;
				} else {
					return f1.line._oCentroid.x - f2.line._oCentroid.x;
				}
			});

			// Space them out
			iSpaceOut = (aFascicle.length - 1) * LINE_FRAGMENT_FASCICLE_IDEAL_GAP;
			if (iSpaceOut > LINE_FRAGMENT_FASCICLE_MAX_SIZE) {
				iSpaceOut = LINE_FRAGMENT_FASCICLE_MAX_SIZE;
			}
			fGap = iSpaceOut / (aFascicle.length - 1);
			fSpaceOutOffset = oFrag.cc - iSpaceOut / 2;
			for (j = 0; j < aFascicle.length; j++) {
				this._shiftLineFragment(aFascicle[j], fSpaceOutOffset, !bHorizontally);
				fSpaceOutOffset += fGap;
			}
		}
	};

	/**
	 * @private
	 */
	SwimLaneChainLayout.prototype._shiftLineFragment = function (oFrag, fNewPosition, bHorizontally) {
		var c1 = oFrag.line.getCoordinates()[oFrag.index],
			c2 = oFrag.line.getCoordinates()[oFrag.index + 1];

		oFrag.cc = fNewPosition;
		if (bHorizontally) {
			c1.setX(fNewPosition);
			c2.setX(fNewPosition);
		} else {
			c1.setY(fNewPosition);
			c2.setY(fNewPosition);
		}
	};

	/**
	 * @typedef {Object} Fragment
	 * @property {Line} line The line the fragment belongs to
	 * @property {number} index Index of the fragment within the line it belongs to
	 * @property {number} cc The constant coordinate, x for vertical fragments, y for horizontal ones
	 * @property {number} c1 The first variant coordinate
	 * @property {number} c2 The second variant coordinate
	 * @property {boolean} invert True if the variant coordinates are set in reverse order than the line direction
	 */

	/**
	 * Line fragment is geometrically represented by a horizontal or vertical segment and intersection means two fragments
	 * have at least one common point.
	 *
	 * @param {Fragment} oFrag1 First fragment
	 * @param {Fragment} oFrag2 Second fragment
	 * @returns {boolean} True if two fragments intersect, false otherwise.
	 * @private
	 */
	SwimLaneChainLayout.prototype._doFragmentsIntersect = function (oFrag1, oFrag2) {
		return (oFrag1.cc === oFrag2.cc) && !(oFrag1.c1 < oFrag2.c1 && oFrag1.c1 < oFrag2.c2 && oFrag1.c2 < oFrag2.c1 && oFrag1.c2 < oFrag2.c2
			|| oFrag1.c1 > oFrag2.c1 && oFrag1.c1 > oFrag2.c2 && oFrag1.c2 > oFrag2.c1 && oFrag1.c2 > oFrag2.c2);
	};

	/**
	 * @private
	 */
	SwimLaneChainLayout.prototype._getLinePointsList = function (oLine) {
		var aPoints = [];

		aPoints.push({
			x: oLine.getSource().getX(),
			y: oLine.getSource().getY()
		});
		oLine.getBends().forEach(function (oBend) {
			aPoints.push({
				x: oBend.getX(),
				y: oBend.getY()
			});
		});
		aPoints.push({
			x: oLine.getTarget().getX(),
			y: oLine.getTarget().getY()
		});

		return aPoints;
	};

	/**
	 * @private
	 */
	SwimLaneChainLayout.prototype._calcLanesWidthsAndPositions = function () {
		var oGroup,
			fCollapseShift = 0;
		this.aLanes.forEach(function (sKey, iLane) {
			oGroup = this.oGraph.mGroups[sKey];
			oGroup._fExpandedWidth = this.aLaneWidths[iLane] + SPACE_BETWEEN_LANES;
			oGroup._fExpandedPosition = this.aLaneOffsets[iLane];
			if (this.bVertLane) {
				oGroup.setX(this.aLaneOffsets[iLane] + fCollapseShift);
			} else {
				oGroup.setY(this.aLaneOffsets[iLane] + fCollapseShift);
			}
			if (oGroup.getCollapsed()) {
				if (this.bVertLane) {
					oGroup._iWidth = COLLAPSED_LANE_WIDTH;
				} else {
					oGroup._iHeight = COLLAPSED_LANE_WIDTH;
				}
				//Group without nodes caused NetworkGraph to never load.
				//Added this check to set collapseShift only if Group has atleast 1 node
				if (oGroup.getNodes().length > 0) {
					fCollapseShift += (COLLAPSED_LANE_WIDTH - (this.aLaneWidths[iLane] + SPACE_BETWEEN_LANES));
				}
			} else {
				if (this.bVertLane) {
					oGroup._iWidth = oGroup._fExpandedWidth;
				} else {
					oGroup._iHeight = oGroup._fExpandedWidth;
				}
			}
		}.bind(this));
	};

	/**
	 * @private
	 */
	SwimLaneChainLayout.prototype._collapseShiftNodesAndLines = function () {
		var fShift, fLaneShrink, oGroup;
		this.aLanes.forEach(function (sKey) {
			oGroup = this.oGraph.mGroups[sKey];
			fLaneShrink = COLLAPSED_LANE_WIDTH / oGroup._fExpandedWidth;

			// All that's right from lane's position goes left by fShift
			this.oGraph.getNodes().forEach(function (oNode) {
				if (this.bVertLane) {
					if (oNode.getCenterPosition().x > oGroup._fExpandedPosition
						&& oNode.getCenterPosition().x <= (oGroup._fExpandedPosition + oGroup._fExpandedWidth)) {

						fShift = oGroup.getX() - oGroup._fExpandedPosition;
						if (oGroup.getCollapsed()) {
							fShift += (COLLAPSED_LANE_WIDTH - oGroup._fExpandedWidth) / 2;
						}

						oNode.setX(oNode.getX() + fShift);
					}
				} else {
					if (oNode.getCenterPosition().y > oGroup._fExpandedPosition
						&& oNode.getCenterPosition().y <= (oGroup._fExpandedPosition + oGroup._fExpandedWidth)) {

						fShift = oGroup.getY() - oGroup._fExpandedPosition;
						if (oGroup.getCollapsed()) {
							fShift += (COLLAPSED_LANE_WIDTH - oGroup._fExpandedWidth) / 2;
						}

						oNode.setY(oNode.getY() + fShift);
					}
				}
			}.bind(this));
			this.oGraph.getLines().forEach(function (oLine) {
				oLine.getCoordinates().forEach(function (oCoordinate) {
					if (this.bVertLane) {
						if (oCoordinate.getX() > oGroup._fExpandedPosition
							&& oCoordinate.getX() <= (oGroup._fExpandedPosition + oGroup._fExpandedWidth)) {

							fShift = oGroup.getX() - oGroup._fExpandedPosition;
							if (oGroup.getCollapsed()) {
								fShift -= (oCoordinate.getX() - oGroup._fExpandedPosition) * (1 - fLaneShrink);
							}
							oCoordinate.setX(oCoordinate.getX() + fShift);
						}
					} else {
						if (oCoordinate.getY() > oGroup._fExpandedPosition
							&& oCoordinate.getY() <= (oGroup._fExpandedPosition + oGroup._fExpandedWidth)) {

							fShift = oGroup.getY() - oGroup._fExpandedPosition;
							if (oGroup.getCollapsed()) {
								fShift -= (oCoordinate.getY() - oGroup._fExpandedPosition) * (1 - fLaneShrink);
							}
							oCoordinate.setY(oCoordinate.getY() + fShift);
						}
					}
				}.bind(this));
			}.bind(this));
		}.bind(this));
	};

	/**
	 * @private
	 */
	SwimLaneChainLayout.prototype._traceSingleLine = function (oLine) {
		var oFrom, oTo, oFromCenter, oToCenter;
		oFrom = oLine.getFromNode();
		oTo = oLine.getToNode();
		oFromCenter = oFrom.getCenterPosition();
		oToCenter = oTo.getCenterPosition();

		oLine.setSource({x: oFromCenter.x, y: oFromCenter.y});
		oLine.setTarget({x: oToCenter.x, y: oToCenter.y});
		oLine.clearBends();

		// Factor out some generic fragments
		var iFromBendWidth = (this.aLaneWidths[oFrom._iGroupIndex] + SPACE_BETWEEN_LANES) / 2,
			iToBendWidth = (this.aLaneWidths[oTo._iGroupIndex] + SPACE_BETWEEN_LANES) / 2,
			iFromBendHeight = (this.aRowHeights[oFrom.iRow] + SPACE_BETWEEN_ROWS) / 2,
			iToBendHeight = (this.aRowHeights[oTo.iRow] + SPACE_BETWEEN_ROWS) / 2;

		// Neighbours, 0 bends
		if ((oFrom._iGroupIndex === oTo._iGroupIndex) && (Math.abs(oFrom.iRow - oTo.iRow) === 1)
			|| (oFrom.iRow === oTo.iRow) && (Math.abs(oFrom._iGroupIndex - oTo._iGroupIndex) === 1)) {
			// Anything to do here?
			// Same lane or same row, 2 bends
		} else if (oFrom._iGroupIndex === oTo._iGroupIndex) {
			if (this.bVertLane) {
				oLine.addBend({
					x: oFromCenter.x + iFromBendWidth,
					y: oFromCenter.y
				});
				oLine.addBend({
					x: oToCenter.x + iToBendWidth,
					y: oToCenter.y
				});
			} else {
				oLine.addBend({
					x: oFromCenter.x,
					y: oFromCenter.y + iFromBendWidth
				});
				oLine.addBend({
					x: oToCenter.x,
					y: oToCenter.y + iToBendWidth
				});
			}
		} else if (oFrom.iRow === oTo.iRow) {
			// There might be empty space between, in which case we want straight line obviously
			var bEmptySpace = true,
				iMin = Math.min(oFrom._iGroupIndex, oTo._iGroupIndex),
				iMax = Math.max(oFrom._iGroupIndex, oTo._iGroupIndex);
			for (var i = iMin + 1; i < iMax; i++) {
				if (this.aGrid[i] && this.aGrid[i].length > oFrom.iRow) {
					bEmptySpace = false;
				}
			}
			if (!bEmptySpace) {
				if (this.bVertLane) {
					oLine.addBend({
						x: oFromCenter.x,
						y: oFromCenter.y + iFromBendHeight
					});
					oLine.addBend({
						x: oToCenter.x,
						y: oToCenter.y + iToBendHeight
					});
				} else {
					oLine.addBend({
						x: oFromCenter.x + iFromBendHeight,
						y: oFromCenter.y
					});
					oLine.addBend({
						x: oToCenter.x + iToBendHeight,
						y: oToCenter.y
					});
				}
			}
			// Neighbouring row, 2 bends to the bottom/top
		} else if (Math.abs(oFrom.iRow - oTo.iRow) === 1) {
			if (this.bVertLane) {
				// Downward
				if (oFrom.iRow < oTo.iRow) {
					oLine.addBend({
						x: oFromCenter.x,
						y: oFromCenter.y + iFromBendHeight
					});
					oLine.addBend({
						x: oToCenter.x,
						y: oToCenter.y - iToBendHeight
					});
					// Upward
				} else {
					oLine.addBend({
						x: oFromCenter.x,
						y: oFromCenter.y - iFromBendHeight
					});
					oLine.addBend({
						x: oToCenter.x,
						y: oToCenter.y + iToBendHeight
					});
				}
			} else {
				// Rightward
				if (oFrom.iRow < oTo.iRow) {
					oLine.addBend({
						x: oFromCenter.x + iFromBendHeight,
						y: oFromCenter.y
					});
					oLine.addBend({
						x: oToCenter.x - iToBendHeight,
						y: oToCenter.y
					});
					// Leftward
				} else {
					oLine.addBend({
						x: oFromCenter.x - iFromBendHeight,
						y: oFromCenter.y
					});
					oLine.addBend({
						x: oToCenter.x + iToBendHeight,
						y: oToCenter.y
					});
				}
			}
			// Neighbouring lane, 2 bends to the left/right
		} else if (Math.abs(oFrom._iGroupIndex - oTo._iGroupIndex) === 1) {
			if (this.bVertLane) {
				// Rightward
				if (oFrom._iGroupIndex < oTo._iGroupIndex) {
					oLine.addBend({
						x: oFromCenter.x + iFromBendWidth,
						y: oFromCenter.y
					});
					oLine.addBend({
						x: oToCenter.x - iToBendWidth,
						y: oToCenter.y
					});
					// Leftward
				} else {
					oLine.addBend({
						x: oFromCenter.x - iFromBendWidth,
						y: oFromCenter.y
					});
					oLine.addBend({
						x: oToCenter.x + iToBendWidth,
						y: oToCenter.y
					});
				}
			} else {
				if (oFrom._iGroupIndex < oTo._iGroupIndex) {
					oLine.addBend({
						x: oFromCenter.x,
						y: oFromCenter.y + iFromBendWidth
					});
					oLine.addBend({
						x: oToCenter.x,
						y: oToCenter.y - iToBendWidth
					});
					// Leftward
				} else {
					oLine.addBend({
						x: oFromCenter.x,
						y: oFromCenter.y - iFromBendWidth
					});
					oLine.addBend({
						x: oToCenter.x,
						y: oToCenter.y + iToBendWidth
					});
				}
			}
			// Diagonal, 3 bends, so far default is "vertical first, horizontal second"
		} else {
			var xVertical, yHorizontal;
			if (this.bVertLane) {
				// 1st bend
				xVertical = (oFrom._iGroupIndex < oTo._iGroupIndex)
					? oFromCenter.x + iFromBendWidth // Rightward
					: oFromCenter.x - iFromBendWidth; // Leftward
				oLine.addBend({
					x: xVertical,
					y: oFromCenter.y
				});
				// 2nd bend
				yHorizontal = (oFrom.iRow < oTo.iRow)
					? oToCenter.y - iToBendHeight // Upward
					: oToCenter.y + iToBendHeight; // Downward
				oLine.addBend({
					x: xVertical,
					y: yHorizontal
				});
				// 3rd bend
				oLine.addBend({
					x: oToCenter.x,
					y: yHorizontal
				});
			} else {
				// 1st bend
				yHorizontal = (oFrom._iGroupIndex < oTo._iGroupIndex)
					? oFromCenter.y + iFromBendWidth // Downward
					: oFromCenter.y - iFromBendWidth; // Upward
				oLine.addBend({
					x: oFromCenter.x,
					y: yHorizontal
				});
				// 2nd bend
				xVertical = (oFrom.iRow < oTo.iRow)
					? oToCenter.x - iToBendHeight // Leftward
					: oToCenter.x + iToBendHeight; // Rightward
				oLine.addBend({
					x: xVertical,
					y: yHorizontal
				});
				// 3rd bend
				oLine.addBend({
					x: xVertical,
					y: oToCenter.y
				});
			}
		}

		// Make lines end at target node border to see arrows
		var oPrevPoint, oBendPoint;
		if (oLine.getBends().length > 0) {
			oBendPoint = oLine.getBends()[oLine.getBends().length - 1];
			oPrevPoint = {x: oBendPoint.getX(), y: oBendPoint.getY()};
		} else {
			oPrevPoint = oFromCenter;
		}
		if (oToCenter.x === oPrevPoint.x) {
			if (oToCenter.y < oPrevPoint.y) {
				oLine.setTarget({x: oToCenter.x, y: oToCenter.y + oTo._iHeight / 2});
			} else {
				oLine.setTarget({x: oToCenter.x, y: oToCenter.y - oTo._iHeight / 2});
			}
		} else {
			if (oToCenter.x < oPrevPoint.x) {
				oLine.setTarget({x: oToCenter.x + oTo._iWidth / 2, y: oToCenter.y});
			} else {
				oLine.setTarget({x: oToCenter.x - oTo._iWidth / 2, y: oToCenter.y});
			}
		}
	};

	/**
	 * @private
	 */
	SwimLaneChainLayout.prototype._beautify = function () {
		if (this.bVertLane) {
			this.oGraph.getGroups().forEach(function (oGroup) {
				oGroup._iHeight += GROUP_HEADER_SIZE;
				this._shiftGraph(0, 4, true);
			}.bind(this));
		} else {
			this._shiftGraph(GROUP_HEADER_SIZE / 2, 0, true);
		}
	};

	/**
	 * In this override of the generic method for all layouts we want to avoid global margin.
	 * @protected
	 */
	SwimLaneChainLayout.prototype._alignCoordinatesWithView = function () {
		var oBBox = this._getGraphBoundingBox();
		this._shiftGraph(-oBBox.p1.x, -oBBox.p1.y);
	};

	/**
	 * @private
	 */
	SwimLaneChainLayout.prototype._findAllNipples = function () {
		var aFragments, iStopSign,
			oGroup1, oGroup2, oFromGroup, oToGroup, bG1NippleSource, bG2NippleSource, fEdgeX, fEdgeY,
			oNipplePoint, sOrientation;

		this._indexAllLineFragments();
		aFragments = this.bVertLane ? this.aHorizontalFragments : this.aVerticalFragments;
		aFragments.forEach(function (oFragment) {
			iStopSign = Object.keys(this.aLaneOffsets).length - 1;
			Object.keys(this.aLaneOffsets).forEach(function (sGroupKey, iIndex) {
				if (iIndex === iStopSign) {
					return;
				}

				oGroup1 = this.aLaneGroups[sGroupKey];
				oGroup2 = this.aLaneGroups[Object.keys(this.aLaneOffsets)[iIndex + 1]];
				// Border of two expanded groups is not relevant
				if (!oGroup1.getCollapsed() && !oGroup2.getCollapsed()) {
					return;
				}

				oFromGroup = oFragment.line.getFromNode()._oGroup;
				oToGroup = oFragment.line.getToNode()._oGroup;
				// If both bordering groups are collapsed and the line goes from one to the other, then the nipple is also unwanted
				if (oGroup1.getCollapsed() && oGroup2.getCollapsed() && oFromGroup === oGroup1 && oToGroup === oGroup2) {
					return;
				}

				bG1NippleSource = oGroup1.getCollapsed() && (oGroup1.getKey() === oFromGroup.getKey() || oGroup1.getKey() === oToGroup.getKey());
				bG2NippleSource = oGroup2.getCollapsed() && (oGroup2.getKey() === oFromGroup.getKey() || oGroup2.getKey() === oToGroup.getKey());
				oNipplePoint = undefined;
				fEdgeX = oGroup1.getX() + oGroup1._iWidth;
				fEdgeY = oGroup1.getY() + oGroup1._iHeight;

				if (this.bVertLane) {
					if (((bG1NippleSource && oFragment.c1 <= fEdgeX && oFragment.c2 > fEdgeX)
						|| ((bG2NippleSource) && oFragment.c1 < fEdgeX && oFragment.c2 >= fEdgeX))
						&& oFragment.cc > oGroup1.getY() && oFragment.cc < fEdgeY) {
						oNipplePoint = {x: fEdgeX, y: oFragment.cc};
					}
				} else {
					if (((bG1NippleSource && oFragment.c1 <= fEdgeY && oFragment.c2 > fEdgeY)
						|| ((bG2NippleSource) && oFragment.c1 < fEdgeY && oFragment.c2 >= fEdgeY))
						&& oFragment.cc > oGroup1.getX() && oFragment.cc < fEdgeX) {
						oNipplePoint = {x: oFragment.cc, y: fEdgeY};
					}
				}
				if (oNipplePoint) {
					if (bG1NippleSource) {
						if (this.bVertLane) {
							sOrientation = Orientation.LeftRight;
						} else {
							sOrientation = Orientation.TopBottom;
						}
					} else if (bG2NippleSource) {
						if (this.bVertLane) {
							sOrientation = Orientation.RightLeft;
						} else {
							sOrientation = Orientation.BottomTop;
						}
					} else {
						return; // This is the corner case where the line goes through several collapsed groups, but ends in none of them
					}
					oFragment.line._aNipples.push({
						x: oNipplePoint.x,
						y: oNipplePoint.y,
						orientation: sOrientation
					});
				}
			}.bind(this));
		}.bind(this));
	};

	SwimLaneChainLayout.prototype._cullLineFragmentsInCollapsedGroups = function () {
		var oFirst, oSecond,
			fnIsPointInsideGroup = function (oCoord, oGroup) {
				return oCoord.getX() >= oGroup.getX() && oCoord.getX() <= (oGroup.getX() + oGroup._iWidth)
					&& oCoord.getY() >= oGroup.getY() && oCoord.getY() <= (oGroup.getY() + oGroup._iHeight);
			},
			fnCullLineFromOneSide = function (oLine, bReverse) {
				var oNode = bReverse ? oLine.getToNode() : oLine.getFromNode(),
					fnGetFirstIndex = function () {
						return bReverse ? oLine.getCoordinates().length - 1 : 0;
					}, oGroup;

				if (!oNode._isInCollapsedGroup()) {
					return;
				}

				oGroup = oNode._oGroup;
				while (oLine.getCoordinates().length > 0 && fnIsPointInsideGroup(oLine.getCoordinates()[fnGetFirstIndex()], oGroup)) {
					oFirst = oLine.getCoordinates()[fnGetFirstIndex()];
					oSecond = oLine.getCoordinates()[fnGetFirstIndex() + (bReverse ? -1 : 1)];
					// If it is the last one to remove, then just move it to the border instead
					if (oSecond && !fnIsPointInsideGroup(oSecond, oGroup)) {
						if (this.bVertLane) {
							if (oSecond.getX() < oFirst.getX()) { // Move left
								oFirst.setX(oGroup.getX());
							} else { // Move right
								oFirst.setX(oGroup.getX() + oGroup._iWidth);
							}
						} else {
							if (oSecond.getY() < oFirst.getY()) { // Move up
								oFirst.setY(oGroup.getY());
							} else { // Move down
								oFirst.setY(oGroup.getY() + oGroup._iHeight);
							}
						}
						break;
					} else {
						oLine.removeAggregation("coordinates", fnGetFirstIndex(), true);
					}
				}
			}.bind(this);

		this.oGraph.getLines().forEach(function (oLine) {
			fnCullLineFromOneSide(oLine, false);
			fnCullLineFromOneSide(oLine, true);
		});
	};

	return SwimLaneChainLayout;
});
