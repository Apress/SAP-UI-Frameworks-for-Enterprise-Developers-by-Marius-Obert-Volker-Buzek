/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the Scene class.
sap.ui.define([
	"../Scene",
	"./NodeHierarchy",
	"./Element"
], function(
	SceneBase,
	NodeHierarchy,
	Element
) {
	"use strict";

	/**
	 * Constructor for a new Scene.
	 *
	 * @class Provides the interface for the 2D model.
	 *
	 * The objects of this class should not be created directly.
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.Scene
	 * @alias sap.ui.vk.svg.Scene
	 */
	var Scene = SceneBase.extend("sap.ui.vk.svg.Scene", /** @lends sap.ui.vk.svg.Scene.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		},

		constructor: function() {
			SceneBase.call(this);

			this._sceneBuilder = null;
			this._defaultNodeHierarchy = null;
			this._currentViewStateManager = null;
		}
	});

	Scene.prototype.init = function() {
		this._root = new Element();
		// this._root = new Element({ matrix: [ 1, 0, 0, -2, 0, 0 ] });
		this._root.userData.skipIt = true;
	};

	Scene.prototype.destroy = function() {
		if (this._defaultNodeHierarchy) {
			this._defaultNodeHierarchy.destroy();
			this._defaultNodeHierarchy = null;
		}
		this._sceneBuilder = null;
		this._root = null;

		SceneBase.prototype.destroy.call(this);
	};

	Scene.prototype.setViewStateManager = function(value) {
		this._currentViewStateManager = value;
		return this;
	};

	Scene.prototype.getViewStateManager = function() {
		return this._currentViewStateManager;
	};

	/**
	 * Gets the unique ID of the Scene object.
	 * @returns {string} The unique ID of the Scene object.
	 * @public
	 */
	Scene.prototype.getId = function() {
		return this._root && this._root.id;
	};

	/**
	 * Gets the default node hierarchy in the Scene object.
	 * @returns {sap.ui.vk.NodeHierarchy} The default node hierarchy in the Scene object.
	 * @public
	 */
	Scene.prototype.getDefaultNodeHierarchy = function() {
		if (!this._defaultNodeHierarchy) {
			this._defaultNodeHierarchy = new NodeHierarchy(this);
		}
		return this._defaultNodeHierarchy;
	};

	/**
	 * Gets the root element reference for the Scene object.
	 * @returns {sap.ui.vk.svg.Element} The root element.
	 * @public
	 */
	Scene.prototype.getRootElement = function() {
		return this._root;
	};

	Scene.prototype.setSceneBuilder = function(sceneBuilder) {
		this._sceneBuilder = sceneBuilder;
	};

	Scene.prototype.getSceneBuilder = function() {
		return this._sceneBuilder;
	};

	/**
	 * Gets the persistent ID from node reference.
	 *
	 * @param {sap.ui.vk.svg.Element|sap.ui.vk.svg.Element[]} nodeRefs The reference to the node or the array of references to the nodes.
	 * @returns {string|string[]} The persistent ID or the array of the persistent IDs.
	 * @public
	 */
	Scene.prototype.nodeRefToPersistentId = function(nodeRefs) {
		return Array.isArray(nodeRefs) ?
			nodeRefs.map(function(nodeRef) { return nodeRef._vkPersistentId(); }) :
			nodeRefs._vkPersistentId();
	};

	/**
	 * Gets the node reference from persistent ID.
	 *
	 * @param {string|string[]} pIDs The persistent ID or the array of the persistent IDs.
	 * @returns {sap.ui.vk.svg.Element|sap.ui.vk.svg.Element[]} The reference to the node or the array of references to the nodes.
	 * @public
	 */
	Scene.prototype.persistentIdToNodeRef = function(pIDs) {
		var sceneBuilder = this._sceneBuilder;

		if (Array.isArray(pIDs)) {
			return pIDs.map(function(pID) { return sceneBuilder ? sceneBuilder.getNode(pID) : null; });
		} else {
			return sceneBuilder ? sceneBuilder.getNode(pIDs) : null;
		}
	};

	/**
	 * Assign persistent id to node
	 *
	 * @param {sap.ui.vk.svg.Element} nodeRef the reference to the node
	 * @param {string} sid The persistent id
	 * @param {string} sceneId scene id
	 * @returns {boolean} true if assignment is successful, false if persistent id cannot be assigned
	 * @private
	 */
	Scene.prototype.setNodePersistentId = function(nodeRef, sid, sceneId) {
		return this._sceneBuilder ? this._sceneBuilder.setNodePersistentId(nodeRef, sid, sceneId) : false;
	};

	/**
	 * Get initial view
	 *
	 * @returns {sap.ui.vk.View} initial view
	 * @public
	 */
	Scene.prototype.getInitialView = function() {
		return this._initialView;
	};

	/**
	 * Set initial view
	 *
	 * @param {sap.ui.vk.View} view Initial view
	 *
	 * @public
	 */
	Scene.prototype.setInitialView = function(view) {
		this._initialView = view;
	};

	return Scene;
});
