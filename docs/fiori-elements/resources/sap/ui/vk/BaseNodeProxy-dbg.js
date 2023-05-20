/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the BaseNodeProxy class.
sap.ui.define([
	"sap/ui/base/Object"
], function(
	BaseObject
) {
	"use strict";

	/**
	 * Constructor for a new BaseNodeProxy.

	 * The objects of this class should not be created directly, and should only be created through the use of the following methods:
	 * <ul>
	 *   <li>{@link sap.ui.vk.NodeHierarchy#enumerateChildren sap.ui.vk.NodeHierarchy.enumerateChildren}</li>
	 *   <li>{@link sap.ui.vk.NodeHierarchy#enumerateAncestors sap.ui.vk.NodeHierarchy.enumerateAncestors}</li>
	 *   <li>{@link sap.ui.vk.ViewStateManager#enumerateSelection sap.ui.vk.ViewStateManager.enumerateSelection}</li>
	 * </ul>
	 *
	 * @class
	 * Provides a simple, lightweight proxy object to a node in a node hierarchy.
	 *
	 * The objects of this class should not be created directly, and should only be created through the use of the following methods:
	 * <ul>
	 *   <li>{@link sap.ui.vk.NodeHierarchy#enumerateChildren sap.ui.vk.NodeHierarchy.enumerateChildren}</li>
	 *   <li>{@link sap.ui.vk.NodeHierarchy#enumerateAncestors sap.ui.vk.NodeHierarchy.enumerateAncestors}</li>
	 *   <li>{@link sap.ui.vk.ViewStateManager#enumerateSelection sap.ui.vk.ViewStateManager.enumerateSelection}</li>
	 * </ul>
	 *
	 * @public
	 * @abstract
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.base.Object
	 * @implements sap.ui.base.Poolable, sap.ui.vk.BaseNodeProxy
	 * @alias sap.ui.vk.BaseNodeProxy
	 */
	var BaseNodeProxy = BaseObject.extend("sap.ui.vk.BaseNodeProxy", /** @lends sap.ui.vk.BaseNodeProxy.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			"abstract": true
		}
	});

	/**
	 * Initialize this BaseNodeProxy with its data.
	 *
	 * The <code>init</code> method is called by an object pool when the
	 * object is (re-)activated for a new caller.
	 *
	 * @function
	 * @name sap.ui.vk.BaseNodeProxy#init
	 * @param {sap.ui.vk.NodeHierarchy} nodeHierarchy The NodeHierarchy object this BaseNodeProxy object belongs to.
	 * @param {any} nodeRef The ID or reference (depending on the concrete BaseNodeProxy implementation) of the node for which to get BaseNodeProxy.
	 * @protected
	 * @abstract
	 * @see sap.ui.base.Poolable.prototype#init
	 */

	/**
	 * Reset BaseNodeProxy data, needed for pooling.
	 * @function
	 * @name sap.ui.vk.BaseNodeProxy#reset
	 * @protected
	 * @abstract
	 * @see sap.ui.base.Poolable.prototype#reset
	 */

	/**
	 * Gets the reference object of the node.
	 * @function
	 * @name sap.ui.vk.BaseNodeProxy#getNodeRef
	 * @returns {any} The node's reference object.
	 * @public
	 * @abstract
	 */

	/**
	 * Gets the ID of the node.
	 * @function
	 * @name sap.ui.vk.BaseNodeProxy#getNodeId
	 * @returns {string} The node's ID.
	 * @public
	 * @abstract
	 */

	/**
	 * Gets the name of the node.
	 * @function
	 * @name sap.ui.vk.BaseNodeProxy#getName
	 * @returns {string} The node's name.
	 * @public
	 * @abstract
	 */

	// NB: We cannot name the method getMetadata as there already exists sap.ui.base.Object.prototype.getMetadata method.
	/**
	 * Gets the metadata of the node.
	 * @function
	 * @name sap.ui.vk.BaseNodeProxy#getNodeMetadata
	 * @returns {object} A JSON object containing the node's metadata.
	 * @public
	 * @abstract
	 */

	/**
	 * Indicates whether the node has child nodes.
	 * @function
	 * @name sap.ui.vk.BaseNodeProxy#getHasChildren
	 * @returns {boolean} A value of <code>true</code> indicates that the node has child nodes, and a value of <code>false</code> indicates otherwise.
	 * @public
	 * @abstract
	 */

	/**
	 * Gets the scene reference that this BaseNodeProxy object wraps.
	 * @function
	 * @name sap.ui.vk.BaseNodeProxy#getSceneRef
	 * @returns {any} A scene reference that this BaseNodeProxy object wraps.
	 * @public
	 * @abstract
	 */

	return BaseNodeProxy;
});
