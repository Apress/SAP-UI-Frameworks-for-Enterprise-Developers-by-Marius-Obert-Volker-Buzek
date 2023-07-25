/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.ClusterTree.
sap.ui.define([
	"./ClusterBase",
	"./library"
], function(ClusterBase, library) {
	"use strict";

	/**
	 * Constructor for a new ClusterTree.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Cluster definition element for tree clusters. Complex clustering based on Voronoi diagrams. The actual clustering is based on the areas
	 *        in the Voronoi diagram and cluster objects get aggregated to a hierarchy over several levels of detail.
	 * @extends sap.ui.vbm.ClusterBase
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.ClusterTree
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ClusterTree = ClusterBase.extend("sap.ui.vbm.ClusterTree", /** @lends sap.ui.vbm.ClusterTree.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {
				/**
				 * Indicates whether the split of a cluster object into sub clusterers or visual objects should be animated
				 */
				animateClusterSplit: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true
				}
			},
			aggregations: {},
			events: {}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	// sap.ui.vbm.ClusterTree.prototype.init = function(){
	// // do something for initialization...
	// };

	// ...........................................................................//
	// model creators............................................................//
	ClusterTree.prototype.getClusterDefinition = function() {
		var oDefinition = ClusterBase.prototype.getClusterDefinition.apply(this, arguments);

		oDefinition.type = "tree";

		oDefinition.animation = this.getAnimateClusterSplit().toString();
		return oDefinition;
	};

	return ClusterTree;

});
