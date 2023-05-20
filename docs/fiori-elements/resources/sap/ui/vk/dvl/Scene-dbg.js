/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the Scene class.
sap.ui.define([
	"../Scene",
	"./NodeHierarchy",
	"sap/base/util/uid"
], function(
	SceneBase,
	NodeHierarchy,
	uid
) {
	"use strict";

	/**
	 * Constructor for a new Scene.
	 *
	 * The objects of this class should not be created directly.
	 * They should be created via {@link sap.ui.vk.ContentConnector sap.ui.vk.ContentConnector}.
	 *
	 * @class Provides the interface for the 3D model.
	 *
	 * The objects of this class should not be created directly.
	 * They should be created via {@link sap.ui.vk.ContentConnector sap.ui.vk.ContentConnector}.
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.Scene
	 * @alias sap.ui.vk.dvl.Scene
	 * @deprecated Since version 1.72.0.
	 */
	var Scene = SceneBase.extend("sap.ui.vk.dvl.Scene", /** @lends sap.ui.vk.dvl.Scene.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		},

		constructor: function(graphicsCore, dvlSceneId) {
			// Replace EventProvider with SceneBase.
			SceneBase.call(this);

			this._id = uid();
			this._graphicsCore = graphicsCore;
			this._dvlSceneRef = dvlSceneId;
			this._defaultNodeHierarchy = null;
		}
	});

	Scene.prototype.destroy = function() {
		if (this._defaultNodeHierarchy) {
			this._defaultNodeHierarchy.destroy();
			this._defaultNodeHierarchy = null;
		}
		this._dvlSceneRef = null;
		this._graphicsCore = null;

		SceneBase.prototype.destroy.call(this);
	};

	/**
	 * Gets the unique ID of the Scene object.
	 * @returns {string} The unique ID of the Scene object.
	 * @public
	 */
	Scene.prototype.getId = function() {
		return this._id;
	};

	/**
	 * Gets the GraphicsCore object this Scene object belongs to.
	 * @returns {sap.ui.vk.dvl.GraphicsCore} The GraphicsCore object this Scene object belongs to.
	 * @public
	 */
	Scene.prototype.getGraphicsCore = function() {
		return this._graphicsCore;
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
	 * Gets the DVL scene ID.
	 * @returns {string} The DVL scene ID.
	 * @public
	 */
	Scene.prototype.getSceneRef = function() {
		return this._dvlSceneRef;
	};

	Scene.prototype.setDoubleSided = function(value) {
		this.setProperty("doubleSided", value, true);

		this._graphicsCore._dvl.Renderer.SetOption(sap.ve.dvl.DVLRENDEROPTION.DVLRENDEROPTION_SHOW_BACKFACING, value);

		return this;
	};

	return Scene;
});
