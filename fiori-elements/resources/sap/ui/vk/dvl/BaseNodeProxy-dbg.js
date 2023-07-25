/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the BaseNodeProxy class.
sap.ui.define([
	"../BaseNodeProxy",
	"./getJSONObject"
], function(
	BaseNodeProxyBase,
	getJSONObject
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
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.BaseNodeProxy
	 * @implements sap.ui.base.Poolable
	 * @deprecated Since version 1.72.0.
	 * @alias sap.ui.vk.dvl.BaseNodeProxy
	 */
	var BaseNodeProxy = BaseNodeProxyBase.extend("sap.ui.vk.dvl.BaseNodeProxy", /** @lends sap.ui.vk.dvl.BaseNodeProxy.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	/**
	 * Initialize this BaseNodeProxy with its data.
	 *
	 * The <code>init</code> method is called by an object pool when the
	 * object is (re-)activated for a new caller.
	 *
	 * @param {sap.ui.vk.dvl.NodeHierarchy} nodeHierarchy The NodeHierarchy object this BaseNodeProxy object belongs to.
	 * @param {string} nodeRef The ID of the node for which to get BaseNodeProxy.
	 * @protected
	 * @see sap.ui.base.Poolable.prototype#init
	 */
	BaseNodeProxy.prototype.init = function(nodeHierarchy, nodeRef) {
		this._dvl = nodeHierarchy ? nodeHierarchy.getGraphicsCore()._getDvl() : null;
		this._dvlSceneRef = nodeHierarchy ? nodeHierarchy.getSceneRef() : null;
		this._dvlNodeRef = nodeRef;
	};

	/**
	 * Reset BaseNodeProxy data, needed for pooling.
	 * @protected
	 * @see sap.ui.base.Poolable.prototype#reset
	 */
	BaseNodeProxy.prototype.reset = function() {
		this._dvlNodeRef = null;
		this._dvlSceneRef = null;
		this._dvl = null;
	};

	/**
	 * Gets the reference object of the node.
	 * @returns {string} The node's reference object.
	 * @public
	 */
	BaseNodeProxy.prototype.getNodeRef = function() {
		return this._dvlNodeRef;
	};

	/**
	 * Gets the ID of the node.
	 * @returns {string} The node's ID.
	 * @public
	 */
	BaseNodeProxy.prototype.getNodeId = function() {
		return this._dvlNodeRef;
	};

	/**
	 * Gets the name of the node.
	 * @returns {string} The node's name.
	 * @public
	 */
	BaseNodeProxy.prototype.getName = function() {
		return getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneRef, this._dvlNodeRef, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_NAME)).NodeName;
	};

	/**
	 * Gets the metadata of the node.
	 * @return {object} A JSON object containing the node's metadata.
	 * @public
	 */
	// NB: We cannot name the method getMetadata as there already exists sap.ui.base.Object.getMetadata method.
	BaseNodeProxy.prototype.getNodeMetadata = function() {
		return getJSONObject(this._dvl.Scene.RetrieveMetadata(this._dvlSceneRef, this._dvlNodeRef)).metadata;
	};

	/**
	 * Indicates whether the node has child nodes.
	 * @returns {boolean} A value of <code>true</code> indicates that the node has child nodes, and a value of <code>false</code> indicates otherwise.
	 * @public
	 */
	BaseNodeProxy.prototype.getHasChildren = function() {
		return (getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneRef, this._dvlNodeRef, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS)).Flags & (sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_MAPPED_HASCHILDREN | sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_CLOSED)) === sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_MAPPED_HASCHILDREN;
	};

	/**
	 * Gets the scene reference that this BaseNodeProxy object wraps.
	 * @returns {any} A scene reference that this BaseNodeProxy object wraps.
	 * @public
	 */
	BaseNodeProxy.prototype.getSceneRef = function() {
		return this._dvlNodeRef;
	};

	return BaseNodeProxy;
});
