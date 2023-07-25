/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the NodeProxy class.
sap.ui.define([
	"sap/ui/base/ManagedObject"
], function(
	ManagedObject
) {
	"use strict";

	/**
	 * Constructor for a new NodeProxy.
	 *
	 * @class
	 * Provides a proxy object to the node in the node hierarchy.
	 *
	 * Objects of this type should only be created with the {@link sap.ui.vk.NodeHierarchy#createNodeProxy sap.ui.vk.NodeHierarchy.createNodeProxy} method.
	 * and destroyed with the {@link sap.ui.vk.NodeHierarchy#destroyNodeProxy sap.ui.vk.NodeHierarchy.destroyNodeProxy} method.
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.vk.NodeProxy
	 * @since 1.32.0
	 */
	var NodeProxy = ManagedObject.extend("sap.ui.vk.NodeProxy", /** @lends sap.ui.vk.NodeProxy.prototype */ {
		metadata: {
			library: "sap.ui.vk",

			properties: {
				/**
				 * The node reference. This property is read-only.
				 */
				nodeRef: "any",

				/**
				 * The node VE IDs. This property is read-only.
				 */
				veIds: "object[]",

				/**
				 * The name of the node. This property is read-only.
				 */
				name: "string",

				/**
				 * The local transformation matrix of the node.
				 */
				localMatrix: {
					type: "sap.ui.vk.TransformationMatrix",
					bindable: "bindable"
				},

				/**
				 * The world transformation matrix of the node.
				 */
				worldMatrix: {
					type: "sap.ui.vk.TransformationMatrix",
					bindable: "bindable"
				},

				/**
				 * The material of the node (optional).
				 */
				material: {
					type: "sap.ui.vk.Material"
				},

				/**
				 * The node opacity.
				 */
				opacity: {
					type: "float",
					bindable: "bindable"
				},

				/**
				 * The tint color.<br/>
				 *
				 * The tint color is a 32-bit integer in the ABGR notation, where A is amount of blending between material color and tint color.
				 */
				tintColorABGR: {
					type: "int",
					bindable: "bindable"
				},

				/**
				 * The tint color.
				 */
				tintColor: {
					type: "sap.ui.core.CSSColor",
					bindable: "bindable"
				},

				/**
				 * The node metadata. This property is read-only.
				 */
				nodeMetadata: "object",

				/**
				 * The indicator showing if the node has child nodes. This property is read-only.
				 */
				hasChildren: "boolean",

				/**
				 * The indicator showing if the node is closed. This property is read-only.
				 */
				closed: "boolean"
			}
		}
	});

	/**
	 * Gets the scene reference that this NodeProxy object wraps.
	 *
	 * @returns {any} The scene reference that this NodeProxy object wraps.
	 * @public
	 */

	NodeProxy.prototype.setClosed = function(value) {
		return this;
	};

	NodeProxy.prototype.setHasChildren = function(value) {
		return this;
	};

	NodeProxy.prototype.setName = function(value) {
		return this;
	};

	NodeProxy.prototype.setNodeId = function(value) {
		return this;
	};

	NodeProxy.prototype.setNodeMetadata = function(value) {
		return this;
	};

	NodeProxy.prototype.setVeIds = function(value) {
		return this;
	};

	NodeProxy.prototype.assignMaterial = function(value) {
		return this;
	};

	/**
	 * get local translate vector
	 *
	 * @returns {float[]} translate vector
	 * @public
	 */
	NodeProxy.prototype.getLocalTranslate = function() {
		return [0, 0, 0];
	};

	/**
	 * get local scale vector
	 *
	 * @returns {float[]} scale vector
	 * @public
	 */
	NodeProxy.prototype.getLocalScale = function() {
		return [1, 1, 1];
	};

	/**
	 * get local rotation represented by quaternion
	 *
	 * @returns {float[]} quaternion [x, y, z, w]
	 * @public
	 */
	NodeProxy.prototype.getLocalRotationInQuaternion = function() {
		return [1, 0, 0, 1];
	};

	/**
	 * get local rotation represented by axis and angle
	 *
	 * @returns {float[]} angleAxis rotation [x, y, z, angle], (x, y, z) - rotation axis
	 * @public
	 */
	NodeProxy.prototype.getLocalRotationInAngleAxis = function() {
		return [1, 0, 0, 0];
	};

	/**
	 * get local rotation in Euler form
	 *
	 * @returns {float[]} angleAxis rotation [a1, a2, a3, order]
	 * 						a1, a2, a3 - rotation angles about 1st, 2nd, 3nd axis
	 * 						order - int encoding order of XYZ axis (e.g, order "XZY" - 011100, 01 - 3rd axis(Y), 11 - 2nd axis(Z), 00 - 1st axis(X))
	 * @public
	 */
	NodeProxy.prototype.getLocalRotationInEuler = function() {
		return [0, 0, 0, 0];
	};

	return NodeProxy;
});
