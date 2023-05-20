/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/suite/ui/commons/library",
	"./LayoutAlgorithm",
	"./Geometry",
	"./KlayWrapper",
	"./LayoutTask",
	"sap/ui/performance/Measurement"
], function (library, LayoutAlgorithm, Geometry, KlayWrapper, LayoutTask, Measurement) {
	"use strict";

	// enums
	var Orientation = library.networkgraph.Orientation,
		NodePlacement = library.networkgraph.NodePlacement,
		LayoutRenderType = library.networkgraph.LayoutRenderType;

	var GROUP_TITLE_LIFT = 34, // Enlarge group size upwards so that title is not overlaping highest nodes
		GROUP_BOX_MARGIN = 25, // How far is the group border
		GROUP_POST_SHRINKAGE = 17, // Bring group title down not to mess with above lines
		NODE_PORT_WHITESPACE = 4, // Size from top/bottom/left/right where no lines dwell, 4 behaves the same as if not set for top-bottom
		NODE_KEY_PREFIX = "N_",
		GROUP_KEY_PREFIX = "G_",
		KEY_PREFIX_LENGTH = 2;

	var mNodePlacementMap = (function () {
		var mMap = {};
		mMap[NodePlacement.BrandesKoepf] = "BRANDES_KOEPF";
		mMap[NodePlacement.LinearSegments] = "LINEAR_SEGMENTS";
		mMap[NodePlacement.Simple] = "SIMPLE";
		return Object.freeze(mMap);
	})();

	/**
	 * Constructor for a new LayeredLayout.
	 *
	 * @class
	 * This algorithm uses the klay.js algorithm to rearrange the graph in grid form. It's suitable for process flows and
	 * tree-like graphs. It can be used for almost any graph.
	 *
	 * @extends sap.suite.ui.commons.networkgraph.layout.LayoutAlgorithm
	 *
	 * @constructor
	 * @public
	 * @since 1.50
	 * @alias sap.suite.ui.commons.networkgraph.layout.LayeredLayout
	 */
	var LayeredLayout = LayoutAlgorithm.extend("sap.suite.ui.commons.networkgraph.layout.LayeredLayout", {
		metadata: {
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * Define a minimal distance on nodes the algorithm will try to keep.
				 * The default value is 55.
				 * Note that values below 50 are incompatible with presence of groups due to insufficient space for
				 * group title bars and space between nodes and their groups' borders.
				 */
				nodeSpacing: {
					type: "float", defaultValue: 55
				},
				lineSpacingFactor: {
					type: "float", defaultValue: 0.25
				},
				/**
				 * A node placement strategy to use (see {@link sap.suite.ui.commons.networkgraph.NodePlacement}).
				 */
				nodePlacement: {
					type: "sap.suite.ui.commons.networkgraph.NodePlacement", defaultValue: NodePlacement.BrandesKoepf
				},
				/**
				 * Determines if all lines should lead to the same place in the node, or if each line should point to a different place.
				 */
				mergeEdges: {
					type: "boolean", defaultValue: false
				}
			}
		}
	});

	/**
	 * Specifies the type of layout algorithm that defines the visual features and layout of the network graph.
	 *
	 * @returns {sap.suite.ui.commons.networkgraph.LayoutRenderType}
	 * @public
	 */
	LayeredLayout.prototype.getLayoutRenderType = function () {
		return LayoutRenderType.LayeredWithGroups;
	};

	/**
	 * Executes the layout algorithm.
	 * @returns {sap.suite.ui.commons.networkgraph.layout.LayoutTask} Task to get the layout calculated.
	 * @public
	 */
	LayeredLayout.prototype.layout = function () {
		return new LayoutTask(function (fnResolve, fnReject, oLayoutTask) {
			var oGraph = this.getParent();
			if (!oGraph) {
				fnReject("The algorithm must be associated with a graph.");
				return;
			}

			if (this._hasHierarchicalGroups()) {
				fnReject("Layered layout algorithm doesn't support hierarchical groups.");
				return;
			}

			this.oGraph = oGraph;
			this.oKGraph = {children: [], edges: []};
			this.mLineMap = {};

			Measurement.start("NetworkGraph - LayeredLayout", "Layouting of a graph " + oGraph.getId());

			oGraph.getGroups().forEach(this._addGroupToKlay, this);
			oGraph.getNodes().forEach(this._addNodeToKlay, this);
			oGraph.getLines().forEach(this._addLineToKlay, this);

			KlayWrapper.layout({
				graph: this.oKGraph,
				options: this._getOptions(),
				success: function (oKGraph) {
					if (oLayoutTask.isTerminated()) {
						fnResolve();
						return;
					}
					this._copyStuffWithoutPrefixes(oKGraph);

					oKGraph.children.forEach(function (oKItem) {
						this._extractNodeFromKlay(oKItem);
					}, this);
					oKGraph.edges.forEach(function (oKLine) {
						this._extractLineFromKlay(oKLine);
					}, this);

					this._dealWithOrientation();
					this._makeExpandedGroupsBoxesAroundNodes();
					this._shrinkGroupsDownward();
					this._stretchLinesToCircleNodeAxes();
					this._alignCoordinatesWithView();

					Measurement.end("NetworkGraph - LayeredLayout");

					fnResolve();
				}.bind(this),
				error: function (error) {
					fnReject(error);
				}
			});
		}.bind(this));
	};

	LayeredLayout.prototype._buildNodeForKlay = function (oNode) {
		var mProp = {},
			bIsCircle = oNode._isCircle();

		if (bIsCircle || (oNode.getCoreNodeSize() && oNode._isCustom())) {
			var iOuterSize = bIsCircle ? oNode._getCircleSize() : oNode.getCoreNodeSize();

			if (this.oGraph.getOrientation() !== Orientation.TopBottom && this.oGraph.getOrientation() !== Orientation.BottomTop) {
				var iBottomPortSpace = oNode._iHeight - iOuterSize + NODE_PORT_WHITESPACE;
				mProp = {additionalPortSpace: "top=" + NODE_PORT_WHITESPACE + ", bottom=" + iBottomPortSpace};
			} else {
				var iSidePortSpace = (oNode._iWidth - iOuterSize) / 2 + NODE_PORT_WHITESPACE;
				mProp = {additionalPortSpace: "top=" + iSidePortSpace + ", bottom=" + iSidePortSpace};
			}
		}

		return {
			id: NODE_KEY_PREFIX + oNode.getKey(),
			width: oNode._iWidth,
			height: oNode._iHeight,
			properties: mProp
		};
	};

	LayeredLayout.prototype._addGroupToKlay = function (oGroup) {
		if (oGroup._isIgnored()) {
			return;
		}

		// Node for a group is added anyway
		var fBorder = 2 * oGroup._getBorderSize(),
			oKGroup = {
			id: GROUP_KEY_PREFIX + oGroup.getKey(),
			width: oGroup._iWidth + fBorder,
			height: oGroup._iHeight + fBorder
		};
		this.oKGraph.children.push(oKGroup);

		// For collapsed groups all their nodes are omitted and edges of its nodes are connected to the group node itself
		if (!oGroup.getCollapsed()) {
			oGroup.aNodes.forEach(function (oNode) {
				if (!oNode._isIgnored()) {
					if (!oKGroup.children) {
						oKGroup.children = [];
					}
					oKGroup.children.push(this._buildNodeForKlay(oNode));
				}
			}, this);
		}
	};

	LayeredLayout.prototype._addNodeToKlay = function (oNode) {
		// All nodes having a group are already added or omitted within that group's addition
		if (!oNode._oGroup && !oNode._isIgnored()) {
			this.oKGraph.children.push(this._buildNodeForKlay(oNode));
		}
	};

	LayeredLayout.prototype._addLineToKlay = function (oLine) {
		var sSource, sTarget, id;

		if (!oLine._isIgnored()) {
			sSource = oLine.getFromNode()._oGroup && oLine.getFromNode()._oGroup.getCollapsed()
				? GROUP_KEY_PREFIX + oLine.getFromNode()._oGroup.getKey()
				: NODE_KEY_PREFIX + oLine.getFrom();
			sTarget = oLine.getToNode()._oGroup && oLine.getToNode()._oGroup.getCollapsed()
				? GROUP_KEY_PREFIX + oLine.getToNode()._oGroup.getKey()
				: NODE_KEY_PREFIX + oLine.getTo();

			id = sSource + "->" + sTarget + "[" + this.oKGraph.edges.length + "]";
			this.oKGraph.edges.push({
				id: id,
				source: sSource,
				target: sTarget
			});
			this.mLineMap[id] = oLine;
		}
	};

	/**
	 * Regarding direction KLayJS offers only LEFT-RIGHT/TOP-DOWN option, we have to add RIGHT-LEFT by manual mirroring of coordinates ex-post.
	 * See _verticalMirror method.
	 * @returns {object} Options for KLayJS.
	 */
	LayeredLayout.prototype._getOptions = function () {
		var sOri = this.oGraph.getOrientation(),
			sDir;
		switch (sOri) {
			case Orientation.LeftRight:
			case Orientation.RightLeft:
				sDir = "RIGHT";
				break;
			case Orientation.TopBottom:
			case Orientation.BottomTop:
				sDir = "DOWN";
				break;
			default:
				sDir = "RIGHT";
		}
		return {
			direction: sDir,
			spacing: this.getNodeSpacing(),
			nodePlace: mNodePlacementMap[this.getNodePlacement()],
			edgeSpacingFactor: this.getLineSpacingFactor(),
			mergeEdges: this.getMergeEdges()
		};
	};

	LayeredLayout.prototype._extractNodeFromKlay = function (oKItem) {
		var oItem = oKItem.id.substring(0, KEY_PREFIX_LENGTH) === NODE_KEY_PREFIX
				? this.oGraph.getNodeByKey(oKItem.originalId)
				: undefined,
			oNode;
		if (!oItem) {
			oItem = this.oGraph.mGroups[oKItem.originalId];

			// Expanded groups aggregate their nodes
			if (oItem && !oItem.getCollapsed() && oKItem.children) {
				oKItem.children.forEach(function (oKNode) {
					oNode = this.oGraph.getNodeByKey(oKNode.originalId);
					if (oNode) {
						oNode.setX(Math.round(oKNode.x + oKItem.x));
						oNode.setY(Math.round(oKNode.y + oKItem.y));
					}
				}, this);
			}
		}
		if (oItem) {
			oItem.setX(Math.round(oKItem.x));
			oItem.setY(Math.round(oKItem.y));
		}
	};

	LayeredLayout.prototype._extractLineFromKlay = function (oKLine) {
		var oLine = this.mLineMap[oKLine.id];
		oLine.setSource({
			x: Math.round(oKLine.sourcePoint.x),
			y: Math.round(oKLine.sourcePoint.y)
		});
		oLine.setTarget({
			x: Math.round(oKLine.targetPoint.x),
			y: Math.round(oKLine.targetPoint.y)
		});
		oLine.clearBends();
		if (oKLine.bendPoints) {
			oKLine.bendPoints.forEach(function (oKBend) {
				oLine.addBend({
					x: Math.round(oKBend.x),
					y: Math.round(oKBend.y)
				});
			});
		}

		// Shift lines originating inside expanded group
		if (oLine.getFromNode()._oGroup && !oLine.getFromNode()._oGroup.getCollapsed()) {
			oLine._shift({x: oLine.getFromNode()._oGroup.getX(), y: oLine.getFromNode()._oGroup.getY()});
		}
	};

	LayeredLayout.prototype._dealWithOrientation = function () {
		if ((!this.oGraph._bIsRtl && this.oGraph.getOrientation() === Orientation.RightLeft)
			|| (this.oGraph._bIsRtl && this.oGraph.getOrientation() !== Orientation.RightLeft)) {
			this._verticalMirror(true);
		}
		if (this.oGraph.getOrientation() === Orientation.BottomTop) {
			this._horizontalMirror(true);
		}
	};

	LayeredLayout.prototype._makeExpandedGroupsBoxesAroundNodes = function () {
		var aPoints = [], oBox;
		this.oGraph.getGroups().forEach(function (oGroup) {
			if (oGroup.getCollapsed() || oGroup.aNodes.length === 0) {
				return;
			}

			aPoints = this._getNodesPoints(oGroup.aNodes);
			oBox = Geometry.getBoundingBox(aPoints);
			Geometry.enlargeBox(oBox, GROUP_BOX_MARGIN);
			oGroup.setX(Math.round(oBox.p1.x));
			oGroup.setY(Math.round(oBox.p1.y - GROUP_TITLE_LIFT));
			oGroup._iWidth = oBox.p2.x - oBox.p1.x;
			oGroup._iHeight = oBox.p2.y - oBox.p1.y + GROUP_TITLE_LIFT;
		}, this);
	};

	LayeredLayout.prototype._shrinkGroupsDownward = function () {
		// every node within a group is shifted downwards
		var fNodeShift;
		this.oGraph.getGroups().forEach(function (oGroup) {
			if (oGroup.getCollapsed()) {
				return;
			}

			oGroup.aNodes.forEach(function (oNode) {
				fNodeShift = (oGroup.getY() + oGroup._iHeight - oNode.getY()) / oGroup._iHeight;
				oNode.setY(oNode.getY() + fNodeShift);
			});
			oGroup.setY(oGroup.getY() + GROUP_POST_SHRINKAGE);
			oGroup._iHeight -= GROUP_POST_SHRINKAGE;
		});
	};

	LayeredLayout.prototype._copyStuffWithoutPrefixes = function (oKGraph) {
		oKGraph.children.forEach(function (oKItem) {
			oKItem.originalId = oKItem.id.substring(KEY_PREFIX_LENGTH);
			if (oKItem.children) {
				oKItem.children.forEach(function (oKChild) {
					oKChild.originalId = oKChild.id.substring(KEY_PREFIX_LENGTH);
				});
			}
		});

		oKGraph.edges.forEach(function (oKLine) {
			oKLine.originalSource = oKLine.source.substring(KEY_PREFIX_LENGTH);
			oKLine.originalTarget = oKLine.target.substring(KEY_PREFIX_LENGTH);
		});
	};

	return LayeredLayout;
});