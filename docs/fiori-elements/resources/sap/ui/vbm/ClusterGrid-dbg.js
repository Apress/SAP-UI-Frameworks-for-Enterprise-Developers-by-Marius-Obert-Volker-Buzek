/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.ClusterGrid.
sap.ui.define([
	"./ClusterBase",
	"./library"
], function(ClusterBase, library) {
	"use strict";

	/**
	 * Constructor for a new ClusterGrid.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Cluster definition element for grid based clusters. Visual objects are clustered based on a grid. It is possible to have multiple grid
	 *        based clusters. The visualization object is placed in the center of the grid cell plus a given offset.
	 * @extends sap.ui.vbm.ClusterBase
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.ClusterGrid
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ClusterGrid = ClusterBase.extend("sap.ui.vbm.ClusterGrid", /** @lends sap.ui.vbm.ClusterGrid.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * Size of grid cells in pixels. Format is "distanceX;distanceY"
				 */
				gridSize: {
					type: "string",
					group: "Behavior",
					defaultValue: "256;256"
				},

				/**
				 * Minimal number of objects covered by grid cell fullfilling the cluster rule until clustering is applied.
				 */
				limit: {
					type: "int",
					group: "Behavior",
					defaultValue: 2
				},

				/**
				 * Minimal total number of objects covered by grid cell until clustering is applied.
				 */
				limitTotal: {
					type: "int",
					group: "Behavior",
					defaultValue: 2
				},

				/**
				 * Ordering index of given cluster in the sequence of all grid based clusters
				 */
				orderIndex: {
					type: "int",
					group: "Behavior",
					defaultValue: null
				},

				/**
				 * Offset for the visualization object from the center of the grid cell. This can be used to show multiple visualization objects in on
				 * grid cell without overlapping. Format is "offsetX;offsetY"
				 */
				offset: {
					type: "string",
					group: "Appearance",
					defaultValue: "0;0"
				},

				/**
				 * Space between grid cells if cell area is shown
				 */
				cellSpacing: {
					type: "int",
					group: "Appearance",
					defaultValue: "4"
				}

			},
			aggregations: {},
			events: {}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	// sap.ui.vbm.ClusterGrid.prototype.init = function(){
	// // do something for initialization...
	// };

	// ...........................................................................//
	// model creators............................................................//
	ClusterGrid.prototype.getClusterDefinition = function() {
		var oDefinition = ClusterBase.prototype.getClusterDefinition.apply(this, arguments);

		oDefinition.type = "grid";

		oDefinition.limit = this.getLimit().toString();
		oDefinition.limitOnSum = this.getLimitTotal().toString();
		oDefinition.order = this.getOrderIndex().toString();
		oDefinition.areabordersize = -this.getCellSpacing().toString();
		var aGridSize = this.getGridSize().split(";");
		oDefinition.distanceX = aGridSize[0];
		oDefinition.distanceY = aGridSize[1];
		var aOffset = this.getOffset().split(";");
		oDefinition.offsetX = aOffset[0];
		oDefinition.offsetY = aOffset[1];
		return oDefinition;
	};

	return ClusterGrid;

});
