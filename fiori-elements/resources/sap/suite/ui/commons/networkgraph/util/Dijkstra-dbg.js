/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * Constructor for a new Dijkstra's algorithm. The constructor computes the shortest paths to all nodes in the network graph from given
	 * starting point node.
	 * @param {sap.suite.ui.commons.networkgraph.Graph} oGraph Graph to compute the paths in.
	 * @param {sap.suite.ui.commons.networkgraph.Node} oSourceNode Node that serves as the starting point for computing the paths.
	 * @param {object} [oSettings] Settings for the algorithm.
	 * @param {function(sap.suite.ui.commons.networkgraph.Line)} [oSettings.fnLineValue=function () {return 1;}] Evaluation function for determining the value of a line. The function will receive the line to
	 *      be evaluated as a parameter and must return a positive number representing its value (note that Dijkstra's
	 *      algorithm cannot be used on negative values of lines). If this function is not passed as a parameter, the algorithm will
	 *      consider the value of each line to be 1.
	 * @param {boolean} [oSettings.bIgnoreDirections=false] Makes the algorithm ignore line directions and treat the graph as non-oriented.
	 * @param {boolean} [oSettings.bIgnoreCollapsed=false] Makes the algorithm ignore collapsed and hidden nodes.
	 * @constructor
	 *
	 * @class
	 * This algorithm uses Dijkstra's algorithm to compute the shortest possible paths from the starting point node to all other nodes in the graph and arrange them accordingly.
	 *
	 * @public
	 * @since 1.58
	 * @alias sap.suite.ui.commons.networkgraph.util.Dijkstra
	 */
	function Dijkstra(oGraph, oSourceNode, oSettings) {
		this.oGraph = oGraph;
		this.oSourceNode = oSourceNode;
		this.oSettings = Object.assign({
			fnLineValue: function () { return 1; },
			bIgnoreDirections: false,
			bIgnoreCollapsed: false
		}, oSettings);
		this._compute();
	}

	Dijkstra.prototype._compute = function () {
		var oCurrent, aLines, i,
			aStack = [this.oSourceNode],
			mVisited = {},
			mDist = {},
			mPath = {},
			fnLineValue = this.oSettings.fnLineValue,
			bIgnoreDirections = this.oSettings.bIgnoreDirections,
			bIgnoreCollapsed = this.oSettings.bIgnoreCollapsed;

		function insertToStack(oNode, iDistance) {
			for (var i = 0; i < aStack.length; i++) {
				if (iDistance > mDist[aStack[i].getKey()]) {
					aStack.splice(i, 0, oNode);
					return;
				}
			}
			aStack.push(oNode);
		}

		function processLine(oLine, bReverse) {
			var oToNode = bReverse ? oLine.getFromNode() : oLine.getToNode(),
				sToKey = oToNode.getKey(),
				iLen = mDist[oCurrent.getKey()] + fnLineValue(oLine);
			if (iLen < mDist[sToKey]) {
				mDist[sToKey] = iLen;
				mPath[sToKey] = {line: oLine, reverse: bReverse};
				insertToStack(oToNode, iLen);
			}
		}

		this.oGraph.getNodes().forEach(function (oNode) {
			mDist[oNode.getKey()] = Number.MAX_VALUE;
		});
		mDist[this.oSourceNode.getKey()] = 0;
		while (aStack.length > 0) {
			oCurrent = aStack.shift();
			if (mVisited[oCurrent.getKey()]) {
				continue;
			}
			if (bIgnoreCollapsed && (oCurrent.isHidden() || oCurrent.getVisible() === false || oCurrent._isIgnored())) {
				continue;
			}
			mVisited[oCurrent.getKey()] = true;
			aLines = oCurrent.getChildLines();
			for (i = 0; i < aLines.length; i++) {
				processLine(aLines[i], false);
			}
			if (bIgnoreDirections) {
				aLines = oCurrent.getParentLines();
				for (i = 0; i < aLines.length; i++) {
					processLine(aLines[i], true);
				}
			}
		}
		this.mDist = mDist;
		this.mPath = mPath;
	};

	/**
	 * Retrieves the shortest path to the given node. Due to the nature of the algorithm, the path
	 * is returned in reversed order. In most cases, each line has to be processed anyway, so the order is not important.
	 * However, if you need to retrieve lines in the direct order, you can use the <code>Array.reverse()</code> method.
	 *
	 * @param {sap.suite.ui.commons.networkgraph.Node} oToNode Node to find shortest path to.
	 * @returns {sap.suite.ui.commons.networkgraph.Line[]} Lines representing the shortest path.
	 * @public
	 */
	Dijkstra.prototype.getShortestPathTo = function (oToNode) {
		var oCurrent = this.mPath[oToNode.getKey()],
			aPath = [],
			oTNode,
			oFromNode;
		if (oCurrent) {
			oTNode = oCurrent.reverse ? oCurrent.line.getFromNode() : oCurrent.line.getToNode();
		}
		while (oCurrent && oTNode !== this.oSourceNode) {
			aPath.push(oCurrent.line);
			oFromNode = oCurrent.reverse ? oCurrent.line.getToNode() : oCurrent.line.getFromNode();
			oCurrent = this.mPath[oFromNode.getKey()];
			if (oCurrent) {
				oTNode = oCurrent.reverse ? oCurrent.line.getFromNode() : oCurrent.line.getToNode();
			}
		}
		return aPath;
	};

	return Dijkstra;
}, true);