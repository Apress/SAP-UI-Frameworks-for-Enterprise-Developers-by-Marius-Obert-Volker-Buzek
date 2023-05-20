sap.ui.define([
	"sap/suite/ui/commons/library",
	"./LayoutAlgorithm",
	"./Geometry",
	"./LayoutTask"
], function (library, LayoutAlgorithm, Geometry, LayoutTask) {
	"use strict";

	var LayoutRenderType = library.networkgraph.LayoutRenderType;

	var GROUP_MARGIN = 15,
		SPACE_BETWEEN_ROWS = 75,
		COLLAPSED_GROUP_HEIGHT = 32,
		GROUP_HEADER_HEIGHT = 42,
		GROUP_MIN_WIDTH = 160,
		SEPARATOR_WIDTH = 100,
		LANE_Y_MARGIN = 50,
		LANE_X_MARGIN = 25,
		LINE_ANCHORS_DOCK_MARGIN = 10,
		CENTRAL_SPACE_PORTION_FOR_LINES = 0.6,
		IDEAL_VERTICAL_LINE_GAP = 20;

	/**
	 * Constructor for a new TwoColumnsLayout.
	 *
	 * @class
	 * This algorithm rearranges the graph into two columns.
	 *
	 * @extends sap.suite.ui.commons.networkgraph.layout.LayoutAlgorithm
	 *
	 * @constructor
	 * @public
	 * @since 1.63
	 * @alias sap.suite.ui.commons.networkgraph.layout.TwoColumnsLayout
	 */
	var TwoColumnsLayout = LayoutAlgorithm.extend("sap.suite.ui.commons.networkgraph.layout.TwoColumnsLayout");

	/**
	 * Specifies the type of layout algorithm that defines the visual features and layout of the network graph.
	 *
	 * @returns {sap.suite.ui.commons.networkgraph.LayoutRenderType}
	 * @public
	 */
	TwoColumnsLayout.prototype.getLayoutRenderType = function () {
		return LayoutRenderType.TwoColumns;
	};

	/**
	 * Executes the layout algorithm.
	 * @returns {sap.suite.ui.commons.networkgraph.layout.LayoutTask} Task to get the layout calculated.
	 * @public
	 */
	TwoColumnsLayout.prototype.layout = function () {
		return new LayoutTask(function (fnResolve, fnReject, oLayoutTask) {

			var oGraph = this.getParent(), sError;
			if (!oGraph) {
				fnReject("The algorithm must be associated with a graph.");
				return;
			}
			this.oGraph = oGraph;
			this.oLeftColumn = undefined;
			this.oRightColumn = undefined;

			sError = this._validateGraphDefinition();
			if (sError) {
				fnReject(sError);
			}

			this._preprocessGroupsAndNodes();
			sError = this._validateLines();
			if (sError) {
				fnReject(sError);
			}

			this._calcLanesProperties();
			this._createNodesGrid();
			this._calcNodeEndingAndStartingPoints();

			this._setNodesCoordinates();
			this._setGroupCoordinates();
			this._setLinesCoordinates();
			this._cutLinesAtBoxNodeBorders();

			if (this.oGraph._bIsRtl) {
				this._verticalMirror();
			}

			fnResolve();
		}.bind(this));
	};

	/**
	 * @private
	 */
	TwoColumnsLayout.prototype._validateGraphDefinition = function () {
		var aUngroupedNodes = [];
		this.oGraph.getNodes().forEach(function (oNode) {
			if (!oNode.getGroup()) {
				aUngroupedNodes.push(oNode.getKey());
			}
		});
		if (aUngroupedNodes.length > 0) {
			return "Some nodes are missing group: " + aUngroupedNodes.join();
		}

		return null;
	};

	/**
	 * @private
	 */
	TwoColumnsLayout.prototype._preprocessGroupsAndNodes = function () {
		// Check there are exactly two columns along the way
		if (this.oGraph.getGroups().some(function (oGroup) {
			oGroup._oFirstNode = null;
			oGroup._oLastNode = null;
			oGroup._bNestedSet = false;

			if (!oGroup._oParentGroup) {
				if (!this.oLeftColumn) {
					this.oLeftColumn = oGroup;
				} else if (!this.oRightColumn) {
					this.oRightColumn = oGroup;
				} else {
					return true;
				}
			}
			return false;
		}.bind(this))) {
			return "There are too many columns, ie. groups without a parent group. Expected exactly 2.";
		}
		if (!this.oRightColumn || !this.oLeftColumn) {
			return "There are too few columns, ie. groups without a parent group. Expected exactly 2.";
		}

		this.oGraph.getNodes().forEach(function (oNode) {
			oNode._iStartingGroupCount = 0;
			oNode._iEndingGroupCount = 0;
		});
	};

	/**
	 * @private
	 */
	TwoColumnsLayout.prototype._validateLines = function () {
		var oFromTop, oToTop;
		if (this.oGraph.getLines().some(function (oLine) {
			oFromTop = oLine.getFromNode()._oGroup._oTopParentGroup;
			oToTop = oLine.getToNode()._oGroup._oTopParentGroup;
			return !((oFromTop === this.oLeftColumn && oToTop === this.oRightColumn)
				|| (oToTop === this.oLeftColumn && oFromTop === this.oRightColumn));
		}.bind(this))) {
			return "For Two columns layout all lines have to go from one column to the other.";
		} else {
			return null;
		}
	};

	/**
	 * @private
	 */
	TwoColumnsLayout.prototype._calcLanesProperties = function () {
		var iIndex;

		this.aLanes = [];

		this.oGraph.getGroups().forEach(function (oGroup) {
			if (!oGroup.getParentGroupKey()) {
				this.aLanes.push(oGroup.getKey());
			}
		}.bind(this));
		this.aLanes.sort();

		var aMaxLevels = this.aLanes.map(Number.prototype.valueOf, 0);

		this.oGraph.getNodes().forEach(function (oNode) {
			var oGroup = oNode._oGroup,
				oUsableGroupKey = (oGroup._oTopParentGroup && oGroup._oTopParentGroup.getKey()) || oNode.getGroup();

			iIndex = this.aLanes.indexOf(oUsableGroupKey);
			oNode._iGroupIndex = oGroup._iLaneIndex = iIndex;
			if (oGroup._iNestedLevel > aMaxLevels[iIndex]) {
				aMaxLevels[iIndex] = oGroup._iNestedLevel;
			}
		}.bind(this));

		// for groups without a node
		this.oGraph.getGroups().forEach(function (oGroup) {
			var oUsableGroupKey = (oGroup._oTopParentGroup && oGroup._oTopParentGroup.getKey()) || oGroup.getKey();
			oGroup._iLaneIndex = this.aLanes.indexOf(oUsableGroupKey);
		}.bind(this));

		this.aLaneWidths = [];
		this.oGraph.getNodes().forEach(function (oNode) {
			if (!this.aLaneWidths[oNode._iGroupIndex] || this.aLaneWidths[oNode._iGroupIndex] < oNode._iWidth) {
				this.aLaneWidths[oNode._iGroupIndex] = oNode._iWidth;
			}
		}.bind(this));

		this.aLaneWidths = this.aLaneWidths.map(function (iWidth, i) {
			var oGroup = this.oGraph.mGroups[this.aLanes[i]],
				iMin = oGroup.getMinWidth() || GROUP_MIN_WIDTH;

			return Math.max(iMin, iWidth);
		}.bind(this));

		this.aLaneGroupWidths = this.aLaneWidths.map(function (iWidth, i) {
			return iWidth + aMaxLevels[i] * GROUP_MARGIN * 2;
		});

		var iAreaWidth = this.oGraph.$("innerscroller").width();

		// iAreaWidth must be at least large as sum of lanes
		iAreaWidth = Math.max(this.aLaneGroupWidths[0] + this.aLaneGroupWidths[1] + SEPARATOR_WIDTH + LANE_X_MARGIN * 2, iAreaWidth);
		this.aLaneCenters = [LANE_X_MARGIN + (this.aLaneGroupWidths[0] / 2) + (this.oGraph._bIsRtl ? 30 : 0), iAreaWidth - this.aLaneGroupWidths[1] / 2 - LANE_X_MARGIN * 1.5];
	};

	/**
	 * @private
	 */
	TwoColumnsLayout.prototype._createNodesGrid = function () {
		var aGroups = this.oGraph.getGroups(),
			iIndex = 0;

		var aTopGroups = aGroups.filter(function (oGroup) {
			return oGroup._iNestedLevel === 0;
		});

		this.aGrid = this.aLanes.map(function (oItem) {
			return [];
		});

		var fnProcessGroup = function (oGroup) {
			oGroup.aNodes.forEach(function (oChild) {
				var oCollapsedBy = oChild._oGroup._oCollapsedByParent,
					oTargetGroup = oCollapsedBy || oGroup;

				if (!oGroup.getCollapsed() && !oCollapsedBy) {
					this.aGrid[iIndex].push(oChild);
				} else if (oTargetGroup.getCollapsed() /*&& !oTargetGroup._bNestedSet*/) {

					// find top collapsed
					while (oTargetGroup._oCollapsedByParent) {
						oTargetGroup = oTargetGroup._oCollapsedByParent;
					}

					if (!oTargetGroup._bNestedSet) {
						oTargetGroup._bNestedSet = true;
						this.aGrid[iIndex].push(oChild);
					}
				}
			}.bind(this));

			oGroup.aChildGroups.forEach(function (oChildGroup) {
				fnProcessGroup(oChildGroup);
			});
		}.bind(this);

		aTopGroups.forEach(function (oGroup, i) {
			oGroup._iTopGroupIndex = i;
			fnProcessGroup(oGroup);
			iIndex++;
		});
	};

	/**
	 * @private
	 */
	TwoColumnsLayout.prototype._calcNodeEndingAndStartingPoints = function () {
		var fnProcessParentGroups = function (oGroup, oNode, sObjectName, sCountObjectName, bAlwaysSet) {
			var oParentGroup = oGroup._oParentGroup;

			while (oParentGroup && oParentGroup._iNestedLevel > 0) {
				if (!oParentGroup[sObjectName] || bAlwaysSet) {
					oParentGroup[sObjectName] = oNode;
					if (!oParentGroup._oCollapsedByParent && !oParentGroup.getCollapsed()) {
						oNode[sCountObjectName]++;
					}
				} else {
					return;
				}

				oParentGroup = oParentGroup._oParentGroup;
			}
		};

		var fnProcessLastNode = function (oLastNode) {
			if (!oLastNode._oGroup._oLastNode) {
				oLastNode._oGroup._oLastNode = oLastNode;
				if (!oLastNode._oGroup._oCollapsedByParent && !oLastNode._oGroup.getCollapsed()) {
					oLastNode._iEndingGroupCount++;
				}

				fnProcessParentGroups(oLastNode._oGroup, oLastNode, "_oLastNode", "_iEndingGroupCount", false);
			}
		};

		var fnProcessFirstNode = function (oFirstNode) {
			if (!oFirstNode._oGroup._oFirstNode) {

				oFirstNode._oGroup._oFirstNode = oFirstNode;
				if (!oFirstNode._oGroup._oCollapsedByParent && !oFirstNode._oGroup.getCollapsed()) {
					oFirstNode._iStartingGroupCount++;
				}
				fnProcessParentGroups(oFirstNode._oGroup, oFirstNode, "_oFirstNode", "_iStartingGroupCount", false);
			}
		};

		for (var i = 0; i < this.aGrid.length; i++) {
			var oLastGroup = null;

			for (var k = 0; k < this.aGrid[i].length; k++) {
				var oNode = this.aGrid[i][k];

				if (oNode._oGroup !== oLastGroup) {
					fnProcessFirstNode(oNode);
					oLastGroup = oNode._oGroup;
				}
			}

			oLastGroup = null;
			for (var k = this.aGrid[i].length - 1; k >= 0; k--) {
				var oNode = this.aGrid[i][k];

				if (oNode._oGroup !== oLastGroup) {
					fnProcessLastNode(oNode);
					oLastGroup = oNode._oGroup;
				}
			}
		}
	};

	/**
	 * @private
	 */
	TwoColumnsLayout.prototype._setGroupCoordinates = function () {
		var aMaxNested = this.aLanes.map(Number.prototype.valueOf, 0);

		var fnGetNodeLevelRelative = function (oGroup, oNode) {
			var iLevel = oNode._oGroup._oCollapsedByParent || oNode._oGroup.getCollapsed() ? 0 : 1,
				oParentGroup = oNode._oGroup._oParentGroup;

			if (oGroup === oNode._oGroup) {
				return iLevel;
			}

			while (oParentGroup) {
				if (!oParentGroup._oCollapsedByParent && !oParentGroup.getCollapsed()) {
					iLevel++;
				}
				if (oGroup === oParentGroup) {
					break;
				}
				oParentGroup = oParentGroup._oParentGroup;
			}

			return iLevel;
		};

		var fnGetLastNodeLevelRelative = function (oGroup, oNode) {
			var iLevel = 0,
				oParentGroup = oNode._oGroup._oParentGroup;

			if (oGroup === oNode._oGroup) {
				return iLevel;
			}

			while (oParentGroup) {
				if (!oParentGroup._oCollapsedByParent && !oParentGroup.getCollapsed()) {
					iLevel++;
				}
				if (oGroup === oParentGroup) {
					break;
				}
				oParentGroup = oParentGroup._oParentGroup;
			}

			return iLevel;
		};

		this.oGraph.getGroups().forEach(function (oGroup) {
			aMaxNested[oGroup._iLaneIndex] = oGroup._iNestedLevel > aMaxNested[oGroup._iLaneIndex] ? oGroup._iNestedLevel : aMaxNested[oGroup._iLaneIndex];
		});

		this.oGraph.getGroups().forEach(function (oGroup) {
			if (oGroup._iNestedLevel === 0) {
				oGroup.setX(this.aLaneCenters[oGroup._iLaneIndex] - this.aLaneWidths[oGroup._iLaneIndex]);
				oGroup.setY(0);
			} else if (oGroup._oLastNode && oGroup._oFirstNode) {
				// X
				oGroup._iWidth = this.aLaneWidths[oGroup._iLaneIndex] + ((aMaxNested[oGroup._iLaneIndex] - oGroup._iNestedLevel) * GROUP_MARGIN * 2) + GROUP_MARGIN * 2;
				oGroup.setX(this.aLaneCenters[oGroup._iLaneIndex] - oGroup._iWidth / 2);

				// Y
				var iOffsetLast = fnGetLastNodeLevelRelative(oGroup, oGroup._oLastNode),
					iOffsetLastCalc = iOffsetLast * (GROUP_MARGIN / 2) + (GROUP_MARGIN / 2),
					iOffsetFirst = fnGetNodeLevelRelative(oGroup, oGroup._oFirstNode),
					iOffsetFirstCalc = iOffsetFirst * GROUP_HEADER_HEIGHT;

				var iY = oGroup._oFirstNode.getY() - iOffsetFirstCalc,
					iLastNodeHeight = oGroup._oLastNode._oGroup.getCollapsed() || oGroup._oLastNode._oGroup._oCollapsedByParent ? COLLAPSED_GROUP_HEIGHT : oGroup._oLastNode._iHeight;

				oGroup.setY(iY);
				oGroup._iHeight = oGroup.getCollapsed() ? COLLAPSED_GROUP_HEIGHT : oGroup._oLastNode.getY() + iLastNodeHeight - iY + iOffsetLastCalc;
			}
		}.bind(this));
	};

	/**
	 * @private
	 */
	TwoColumnsLayout.prototype._setNodesCoordinates = function () {
		this.aGrid.forEach(function (aSlope) {
			var iY = LANE_Y_MARGIN;

			aSlope.forEach(function (oNode) {
				var oTargetGroup = oNode._oGroup._oCollapsedByParent || oNode._oGroup;

				oNode.setX(this.aLaneCenters[oNode._iGroupIndex] - oNode._iWidth / 2);

				iY += oNode._iStartingGroupCount * GROUP_HEADER_HEIGHT;

				oNode.setY(iY);

				iY += SPACE_BETWEEN_ROWS / 2;
				iY += oNode._iEndingGroupCount * GROUP_MARGIN / 2;
				iY += oTargetGroup.getCollapsed() ? COLLAPSED_GROUP_HEIGHT : oNode._iHeight;
			}.bind(this));
		}.bind(this));
	};

	/**
	 * @private
	 */
	TwoColumnsLayout.prototype._setLinesCoordinates = function () {
		var oFrom, oTo, oFromCenter, oToCenter,
			aLeftNodes = [], aRightNodes = [], aBenderBacklog = [],
			fnGetTopCollapsedParent = function (oNode) {
				var oGroup;
				if (!oNode._oGroup) {
					return null;
				}
				oGroup = oNode._oGroup;
				while (oGroup && oGroup._isCollapsed()) {
					if (!oGroup._oParentGroup || !oGroup._oParentGroup._isCollapsed()) {
						return oGroup;
					}
					oGroup = oGroup._oParentGroup;
				}
				return null;
			},
			fnGetGroupEntry = function (oGroup) {
				var fEntryX;
				if (oGroup._oTopParentGroup === this.oLeftColumn) {
					fEntryX = oGroup.getX() + oGroup._iWidth + 2 * oGroup._getBorderSize();
				} else {
					fEntryX = oGroup.getX();
				}
				return {
					x: fEntryX,
					y: oGroup.getY() + oGroup._iHeight / 2
				};
			},
			fnAnchorLinesForNode = function (oNode) {
				var fGap, fTopAnchor, fCurrentAnchor;

				// If there is a delegade for the node, it takes over the anchoring process
				if (oNode.groupDelegate) {
					oNode.anchors.forEach(function (oSortedLine) {
						oNode.groupDelegate.anchors.push({
							node: oNode,
							line: oSortedLine.line,
							oppositeY: oSortedLine.oppositeY
						});
						if (oNode.isLeftie) {
							aBenderBacklog.push(oSortedLine.line);
						}
					});
					return;
				}

				fGap = (oNode._iHeight - 2 * LINE_ANCHORS_DOCK_MARGIN) / (oNode.anchors.length - 1);
				fTopAnchor = (oNode.anchors.length === 1) ? oNode.getCenterPosition().y : oNode.getY() + LINE_ANCHORS_DOCK_MARGIN;
				fCurrentAnchor = fTopAnchor;

				oNode.anchors.sort(function (a, b) {
					return a.oppositeY - b.oppositeY;
				}).forEach(function (oAnchor) {
					var oLine = oAnchor.line,
						fCenterX = oNode.getCenterPosition().x;

					if (oNode === oLine.getFromNode()) {
						oLine.setSource({x: fCenterX, y: fCurrentAnchor});
					} else if (oNode === oLine.getToNode()) {
						oLine.setTarget({x: fCenterX, y: fCurrentAnchor});
					}
					fCurrentAnchor += fGap;

					if (oNode.isLeftie) {
						aBenderBacklog.push(oLine);
					}
				});
			},
			fnAnchorLinesForGroup = function (oGroup) {
				var oCenter = fnGetGroupEntry.bind(this)(oGroup),
					fGap = (oGroup._iHeight - 2 * LINE_ANCHORS_DOCK_MARGIN) / (oGroup.anchors.length - 1),
					fTopAnchor = (oGroup.anchors.length === 1) ? fnGetGroupEntry.bind(this)(oGroup).y : oGroup.getY() + LINE_ANCHORS_DOCK_MARGIN,
					fCurrentAnchor = fTopAnchor;

				oGroup.anchors.sort(function (a, b) {
					return a.oppositeY - b.oppositeY;
				}).forEach(function (oAnchor) {
					var oLine = oAnchor.line;
					if (oAnchor.node === oLine.getFromNode()) {
						oLine.setSource({x: oCenter.x, y: fCurrentAnchor});
					} else if (oAnchor.node === oLine.getToNode()) {
						oLine.setTarget({x: oCenter.x, y: fCurrentAnchor});
					}
					fCurrentAnchor += fGap;
				});
			},
			fnProcessBenderBacklog = function () {
                var fSpaceForLines = CENTRAL_SPACE_PORTION_FOR_LINES * (this.oRightColumn.getX() - (this.oLeftColumn.getX() + this.oLeftColumn._iWidth)),
                    iGapCount = this.oGraph.getLines().length - 1,
                    fComputedGap = fSpaceForLines / iGapCount,
                    fRealGap = fComputedGap < IDEAL_VERTICAL_LINE_GAP ? fComputedGap : IDEAL_VERTICAL_LINE_GAP,
                    fCenterVertical = (aLeftNodes[0].getCenterPosition().x + aRightNodes[0].getCenterPosition().x) / 2,
                    fLeftmostVertical = fCenterVertical - iGapCount * fRealGap / 2,
                    fCurrentVertical = fLeftmostVertical,
                    iInitialFCurrentVertical = fLeftmostVertical;
                aBenderBacklog.forEach(function (oLine) {
                    if (fCurrentVertical >= aRightNodes[0]._oGroup.getX() - fRealGap) {
                        fCurrentVertical = iInitialFCurrentVertical;
                    } else {
                        fCurrentVertical += fRealGap;
                    }
                    oLine.addBend({
                        x: fCurrentVertical,
                        y: oLine.getSource().getY()
                    });
                    oLine.addBend({
                        x: fCurrentVertical,
                        y: oLine.getTarget().getY()
                    });
                });
            }.bind(this);

		this.oGraph.getNodes().forEach(function (oNode) {
			// Separate left and right nodes
			if (oNode._oGroup) {
				if (oNode._oGroup._oTopParentGroup === this.oLeftColumn) {
					oNode.isLeftie = true;
					aLeftNodes.push(oNode);
				} else if (oNode._oGroup._oTopParentGroup === this.oRightColumn) {
					oNode.isLeftie = false;
					aRightNodes.push(oNode);
				}
			}

			// Lines are leading to either nodes or - when they are in a collapsed group - to the uppermost in a chain of collapsed groups
			oNode.groupDelegate = fnGetTopCollapsedParent(oNode);
			oNode.anchors = [];
		}.bind(this));

		this.oGraph.getLines().forEach(function (oLine) {
			oFrom = oLine.getFromNode();
			oTo = oLine.getToNode();
			oFromCenter = oFrom.getCenterPosition();
			oToCenter = oTo.getCenterPosition();

			// Index line anchors at nodes
			oFrom.anchors.push({line: oLine, oppositeY: oToCenter.y});
			oTo.anchors.push({line: oLine, oppositeY: oFromCenter.y});

			oLine.setSource({x: 0, y: 0});
			oLine.clearBends();
		});

		this.oGraph.getGroups().forEach(function (oGroup) {
			oGroup.anchors = [];
		});

		aLeftNodes.sort(function (a, b) {
			return a.getY() - b.getY();
		}).forEach(fnAnchorLinesForNode);
		aRightNodes.sort(function (a, b) {
			return a.getY() - b.getY();
		}).forEach(fnAnchorLinesForNode);
		this.oGraph.getGroups().sort(function (a, b) {
			return a.getY() - b.getY();
		}).forEach(fnAnchorLinesForGroup.bind(this));

		fnProcessBenderBacklog();
	};

	return TwoColumnsLayout;
});
