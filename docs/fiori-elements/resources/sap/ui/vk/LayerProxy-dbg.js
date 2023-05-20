/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the LayerProxy class.
sap.ui.define([
	"sap/ui/base/Object"
], function(
	BaseObject
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
	 * @abstract
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.base.Object
	 * @alias sap.ui.vk.LayerProxy
	 */
	var LayerProxy = BaseObject.extend("sap.ui.vk.LayerProxy", /** @lends sap.ui.vk.LayerProxy.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			"abstract": true
		}
	});

	/**
	 * Gets the layer ID.
	 * @function
	 * @name sap.ui.vk.LayerProxy#getLayerId
	 * @returns {string} The layer ID.
	 * @public
	 */

	/**
	 * Gets the layer VE IDs.
	 * @function
	 * @name sap.ui.vk.LayerProxy#getVeIds
	 * @returns {object[]} The layer VE IDs.
	 * @public
	 */

	/**
	 * Gets the name of the layer
	 * @function
	 * @name sap.ui.vk.LayerProxy#getName
	 * @returns {string} The name of the layer.
	 * @public
	 */

	/**
	 * Gets the description of the layer.
	 * @function
	 * @name sap.ui.vk.LayerProxy#getDescription
	 * @returns {string} The description of the layer.
	 * @public
	 */

	/**
	 * Gets the layer metadata.
	 * @function
	 * @name sap.ui.vk.LayerProxy#getLayerMetadata
	 * @returns {object} The layer metadata.
	 * @public
	 */

	/**
	 * Gets an array of IDs of nodes belonging to the layer.
	 * @function
	 * @name sap.ui.vk.LayerProxy#getNodes
	 * @return {string[]} An array of IDs of nodes belonging to the layer.
	 * @public
	 */

	return LayerProxy;
});
