/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.ClusterDistance.
sap.ui.define([
	"./ClusterBase",
	"./library"
], function(ClusterBase, library) {
	"use strict";

	/**
	 * Constructor for a new ClusterDistance.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Cluster definition element for distance based clusters. Visual objects are clustered based on the visible distance between them. Objects
	 *        get aggregated to a cluster object as long as they are inside the given distance range to the start object. The start object for a
	 *        cluster is not specifically defined, just the next object not belonging to a cluster is taken. The visualization objects are placed in
	 *        the center of gravity of the covered objects. Thus the actual distance between them may vary.<br>
	 *        This clustering is fast, but the results may not be very convincing.
	 * @extends sap.ui.vbm.ClusterBase
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.ClusterDistance
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ClusterDistance = ClusterBase.extend("sap.ui.vbm.ClusterDistance", /** @lends sap.ui.vbm.ClusterDistance.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * Distance in pixels between cluster objects. This distance is used as parameter during the clustering. The visualization objects are
				 * placed in center of gravity of the covered objects. Thus the actual distance between them may vary.
				 */
				distance: {
					type: "int",
					group: "Behavior",
					defaultValue: "128"
				}

			},
			aggregations: {},
			events: {}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	// sap.ui.vbm.ClusterDistance.prototype.init = function(){
	// // do something for initialization...
	// };

	// ...........................................................................//
	// model creators............................................................//
	ClusterDistance.prototype.getClusterDefinition = function() {
		var oDefinition = ClusterBase.prototype.getClusterDefinition.apply(this, arguments);

		oDefinition.type = "distance";

		oDefinition.distance = this.getDistance().toString();
		return oDefinition;
	};

	return ClusterDistance;

});
