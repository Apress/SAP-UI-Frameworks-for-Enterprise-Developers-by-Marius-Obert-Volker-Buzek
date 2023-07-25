/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/suite/ui/commons/library",
	"./LayoutAlgorithm",
	"./LayoutTask"
], function (library, LayoutAlgorithm, LayoutTask) {
	"use strict";

	var LayoutRenderType = library.networkgraph.LayoutRenderType;

	/**
	 * Constructor for a new NoopLayout.
	 *
	 * @class
	 * This is a simple layout algorithm that expects the positions of nodes to be already present. It only creates
	 * line coordinates (see {@link sap.suite.ui.commons.networkgraph.Line#setCoordinates}).
	 *
	 * @extends sap.suite.ui.commons.networkgraph.layout.LayoutAlgorithm
	 *
	 * @constructor
	 * @public
	 * @since 1.50
	 * @alias sap.suite.ui.commons.networkgraph.layout.NoopLayout
	 */
	var NoopLayout = LayoutAlgorithm.extend("sap.suite.ui.commons.networkgraph.layout.NoopLayout");

	/**
	 * Specifies the type of layout algorithm that defines the visual features and layout of the network graph.
	 *
	 * @returns {sap.suite.ui.commons.networkgraph.LayoutRenderType}
	 * @public
	 */
	NoopLayout.prototype.getLayoutRenderType = function () {
		return LayoutRenderType.LayeredWithGroups;
	};

	/**
	 * Executes the layout algorithm.
	 * @returns {sap.suite.ui.commons.networkgraph.layout.LayoutTask} Task to get the layout calculated.
	 * @public
	 */
	NoopLayout.prototype.layout = function () {
		return new LayoutTask(function (fnResolve, fnReject, oLayoutTask) {
			var oGraph = this.getParent();

			if (oLayoutTask.isTerminated()) {
				fnResolve();
				return;
			}

			if (!oGraph) {
				fnReject("The algorithm must be associated with a graph.");
				return;
			}

			this._normalizeLines();

			fnResolve();
		}.bind(this));
	};

	return NoopLayout;
});
