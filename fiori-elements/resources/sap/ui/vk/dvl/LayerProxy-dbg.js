/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the LayerProxy class.
sap.ui.define([
	"../LayerProxy",
	"./getJSONObject"
], function(
	LayerProxyBase,
	getJSONObject
) {
	"use strict";

	/**
	 * Constructor for a new LayerProxy.
	 *
	 * Objects of this type should only be created with the {@link sap.ui.vk.NodeHierarchy#createLayerProxy sap.ui.vk.NodeHierarchy.createLayerProxy} method
	 * and destroyed with the {@link sap.ui.vk.NodeHierarchy#destroyLayerProxy sap.ui.vk.NodeHierarchy.destroyLayerProxy} method.
	 *
	 * @class
	 * Provides a proxy object to the layer in the node hierarchy.
	 *
	 * Layer is a list of nodes. One node hierarchy can have multiple layers. One node can be included in multiple layers.
	 *
	 * Objects of this type should only be created with the {@link sap.ui.vk.NodeHierarchy#createLayerProxy sap.ui.vk.NodeHierarchy.createLayerProxy} method
	 * and destroyed with the {@link sap.ui.vk.NodeHierarchy#destroyLayerProxy sap.ui.vk.NodeHierarchy.destroyLayerProxy} method.
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.LayerProxy
	 * @deprecated Since version 1.72.0.
	 * @alias sap.ui.vk.dvl.LayerProxy
	 */
	var LayerProxy = LayerProxyBase.extend("sap.ui.vk.dvl.LayerProxy", /** @lends sap.ui.vk.dvl.LayerProxy.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			publicMethods: [
				"getDescription",
				"getLayerId",
				"getLayerMetadata",
				"getName",
				"getNodes",
				"getVeIds"
			]
		},

		constructor: function(nodeHierarchy, layerId) {
			LayerProxyBase.call(this);

			this._dvl = nodeHierarchy ? nodeHierarchy.getGraphicsCore()._getDvl() : null;
			this._dvlSceneRef = nodeHierarchy ? nodeHierarchy.getSceneRef() : null;
			this._dvlLayerId = layerId;
		}
	});

	LayerProxy.prototype.destroy = function() {
		this._dvlLayerId = null;
		this._dvlSceneRef = null;
		this._dvl = null;

		LayerProxyBase.prototype.destroy.call(this);
	};

	/**
	 * Gets the layer ID.
	 * @returns {string} The layer ID.
	 * @public
	 */
	LayerProxy.prototype.getLayerId = function() {
		return this._dvlLayerId;
	};

	/**
	 * Gets the layer VE IDs.
	 * @returns {object[]} The layer VE IDs.
	 * @public
	 */
	LayerProxy.prototype.getVeIds = function() {
		return getJSONObject(this._dvl.Scene.RetrieveVEIDs(this._dvlSceneRef, this._dvlLayerId));
	};

	/**
	 * Gets the name of the layer
	 * @returns {string} The name of the layer.
	 * @public
	 */
	LayerProxy.prototype.getName = function() {
		return getJSONObject(this._dvl.Scene.RetrieveLayerInfo(this._dvlSceneRef, this._dvlLayerId)).name;
	};

	/**
	 * Gets the description of the layer.
	 * @returns {string} The description of the layer.
	 * @public
	 */
	LayerProxy.prototype.getDescription = function() {
		return getJSONObject(this._dvl.Scene.RetrieveLayerInfo(this._dvlSceneRef, this._dvlLayerId)).description;
	};

	/**
	 * Gets the layer metadata.
	 * @returns {object} The layer metadata.
	 * @public
	 */
	LayerProxy.prototype.getLayerMetadata = function() {
		return getJSONObject(this._dvl.Scene.RetrieveMetadata(this._dvlSceneRef, this._dvlLayerId)).metadata;
	};

	/**
	 * Gets an array of IDs of nodes belonging to the layer.
	 * @return {string[]} An array of IDs of nodes belonging to the layer.
	 * @public
	 */
	LayerProxy.prototype.getNodes = function() {
		return getJSONObject(this._dvl.Scene.RetrieveLayerInfo(this._dvlSceneRef, this._dvlLayerId)).nodes;
	};

	return LayerProxy;
});
