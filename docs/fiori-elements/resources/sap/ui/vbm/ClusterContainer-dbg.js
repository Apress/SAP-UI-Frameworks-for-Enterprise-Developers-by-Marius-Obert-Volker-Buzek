/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.ClusterContainer.
sap.ui.define([
	"./Container",
	"./library"
], function(Container, library) {
	"use strict";

	/**
	 * Constructor for a new ClusterContainer.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Specific Visual Object element acting as a container for cluster visualization objects. A ClusterContainer is positioned at a calculated position on the map. It
	 *        aggregates a visualization controls, which will then move with the map.<br>
	 *        <b>Since a ClusterContainer is not a real visual object most features borrowed from <i>VoBase</i> and event <i>Container</i> will not work. There is no label, no edit
	 *        mode, and no drop support. Events like click may only be fired if the aggregated control is not handling them. The properties are not changeable as well as the aggregated
	 *        item. Only read access is possible</b>
	 * @extends sap.ui.vbm.Container
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.ClusterContainer
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ClusterContainer = Container.extend("sap.ui.vbm.ClusterContainer", /** @lends sap.ui.vbm.ClusterContainer.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {},
			aggregations: {},
			events: {}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	ClusterContainer.prototype.init = function() {
		this._oItem = null;
	};

	// Redefine UI5 interface functions

	ClusterContainer.prototype.getPosition = function() {
		var oMap = this.getParent().getParent();
		var nodeInfo = oMap.getInfoForCluster(this.getKey(), sap.ui.vbm.ClusterInfoType.NodeInfo);
		return nodeInfo.pos[0] + ";" + nodeInfo.pos[1] + ";0";
	};

	ClusterContainer.prototype.setPosition = function() {
		// not supported
	};

	ClusterContainer.prototype.getAlignment = function() {
		return 0; // center
	};

	ClusterContainer.prototype.setAlignment = function() {
		// not supported
	};

	ClusterContainer.prototype.getItem = function() {
		return this._oItem;
	};

	ClusterContainer.prototype.setItem = function(oControl) {
		this._oItem = oControl;
		return this;
	};

	// Implement function defined in VoBase

	ClusterContainer.prototype.getDataElement = function() {
		// not supported
	};

	ClusterContainer.prototype.handleChangedData = function(oElement) {
		// not supported
	};

	return ClusterContainer;

});
