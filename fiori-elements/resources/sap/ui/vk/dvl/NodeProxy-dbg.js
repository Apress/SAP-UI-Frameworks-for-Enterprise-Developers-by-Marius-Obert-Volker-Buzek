/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the NodeProxy class.
sap.ui.define([
	"../NodeProxy",
	"./getJSONObject",
	"../cssColorToColor",
	"../colorToCSSColor",
	"../abgrToColor",
	"../colorToABGR",
	"../TransformationMatrix"
], function(
	NodeProxyBase,
	getJSONObject,
	cssColorToColor,
	colorToCSSColor,
	abgrToColor,
	colorToABGR,
	TransformationMatrix
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
	 * @extends sap.ui.vk.NodeProxy
	 * @alias sap.ui.vk.dvl.NodeProxy
	 * @deprecated Since version 1.72.0.
	 * @since 1.32.0
	 */
	var NodeProxy = NodeProxyBase.extend("sap.ui.vk.dvl.NodeProxy", /** @lends sap.ui.vk.dvl.NodeProxy.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		},

		constructor: function(nodeHierarchy, nodeRef) {
			NodeProxyBase.call(this);

			this._dvl = nodeHierarchy ? nodeHierarchy.getGraphicsCore()._getDvl() : null;
			this._dvlSceneRef = nodeHierarchy ? nodeHierarchy.getSceneRef() : null;
			this._dvlNodeRef = nodeRef;
		}
	});

	NodeProxy.prototype.destroy = function() {
		this._dvlNodeRef = null;
		this._dvlSceneRef = null;
		this._dvl = null;

		NodeProxyBase.prototype.destroy.call(this);
	};

	NodeProxy.prototype.getNodeRef = function() {
		return this._dvlNodeRef;
	};

	NodeProxy.prototype.getNodeId = function() {
		return this._dvlNodeRef;
	};

	NodeProxy.prototype.getVeIds = function() {
		return getJSONObject(this._dvl.Scene.RetrieveVEIDs(this._dvlSceneRef, this._dvlNodeRef));
	};

	NodeProxy.prototype.getName = function() {
		return getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneRef, this._dvlNodeRef, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_NAME)).NodeName;
	};

	NodeProxy.prototype.getLocalMatrix = function() {
		return TransformationMatrix.convertTo4x3(getJSONObject(this._dvl.Scene.GetNodeLocalMatrix(this._dvlSceneRef, this._dvlNodeRef)).matrix);
	};

	NodeProxy.prototype.setLocalMatrix = function(value) {
		this._dvl.Scene.SetNodeLocalMatrix(this._dvlSceneRef, this._dvlNodeRef, value && TransformationMatrix.convertTo4x4(value));
		this.setProperty("localMatrix", value, true);
		return this;
	};

	NodeProxy.prototype.getWorldMatrix = function() {
		return TransformationMatrix.convertTo4x3(getJSONObject(this._dvl.Scene.GetNodeWorldMatrix(this._dvlSceneRef, this._dvlNodeRef)).matrix);
	};

	NodeProxy.prototype.setWorldMatrix = function(value) {
		this._dvl.Scene.SetNodeWorldMatrix(this._dvlSceneRef, this._dvlNodeRef, value && TransformationMatrix.convertTo4x4(value));
		this.setProperty("worldMatrix", value, true);
		return this;
	};

	NodeProxy.prototype.getOpacity = function() {
		return getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneRef, this._dvlNodeRef, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_OPACITY)).Opacity;
	};

	NodeProxy.prototype.setOpacity = function(value) {
		this._dvl.Scene.SetNodeOpacity(this._dvlSceneRef, this._dvlNodeRef, value);
		this.setProperty("opacity", value, true);
		return this;
	};

	NodeProxy.prototype.getTintColorABGR = function() {
		return getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneRef, this._dvlNodeRef, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_HIGHLIGHT_COLOR)).HighlightColor;
	};

	NodeProxy.prototype.setTintColorABGR = function(value) {
		this._dvl.Scene.SetNodeHighlightColor(this._dvlSceneRef, this._dvlNodeRef, value);
		this.setProperty("tintColorABGR", value, true);
		this.setProperty("tintColor", colorToCSSColor(abgrToColor(value)), true);
		return this;
	};

	NodeProxy.prototype.getTintColor = function() {
		return colorToCSSColor(abgrToColor(this.getTintColorABGR()));
	};

	NodeProxy.prototype.setTintColor = function(value) {
		var abgr = colorToABGR(cssColorToColor(value));
		this._dvl.Scene.SetNodeHighlightColor(this._dvlSceneRef, this._dvlNodeRef, abgr);
		this.setProperty("tintColorABGR", abgr, true);
		this.setProperty("tintColor", value, true);
		return this;
	};

	NodeProxy.prototype.getNodeMetadata = function() {
		return getJSONObject(this._dvl.Scene.RetrieveMetadata(this._dvlSceneRef, this._dvlNodeRef)).metadata;
	};

	NodeProxy.prototype.getHasChildren = function() {
		return (getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneRef, this._dvlNodeRef, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS)).Flags & (sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_MAPPED_HASCHILDREN | sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_CLOSED)) === sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_MAPPED_HASCHILDREN;
	};

	NodeProxy.prototype.getClosed = function() {
		return (getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneRef, this._dvlNodeRef, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS)).Flags & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_CLOSED) !== 0;
	};

	return NodeProxy;
});
