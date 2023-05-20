/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.CreateParametricGizmo
sap.ui.define([
	"./Gizmo",
	"../svg/HotspotHelper"
], function(
	Gizmo,
	HotspotHelper
) {
	"use strict";

	/**
	 * Constructor for a new CreateParametricGizmo.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Provides UI to display tooltips
	 * @extends sap.ui.vk.tools.Gizmo
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.vk.tools.CreateParametricGizmo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CreateParametricGizmo = Gizmo.extend("sap.ui.vk.tools.CreateParametricGizmo", /** @lends sap.ui.vk.tools.CreateParametricGizmo.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	// Override initialization method
	CreateParametricGizmo.prototype.init = function() {
		if (Gizmo.prototype.init) {
			Gizmo.prototype.init.apply(this);
		}

		this._viewport = null;
		this._tool = null;
		this._activeElement = null;
	};

	/**
	 * Updates the parent node for the node to be created.
	 */
	CreateParametricGizmo.prototype.updateParentNode = function() {
		if (!this._tool || !this._viewport) {
			return;
		}

		var root = this._tool.getParentNode();
		if (!root) {
			root = this._viewport._scene.getRootElement();
			while (root.userData.skipIt && root.children.length > 0) {
				root = root.children[ 0 ];
			}
		}

		this._root = root;
	};

	/**
	 * Creates a request payload for a storage server to create a parametric primitives for the specified elements.
	 * @param {sap.ui.vk.svg.Element|sap.ui.vk.svg.Element[]} elements The element reference or the array of element references.
	 * @returns {object} JSON payload for the request.
	 * @protected
	 */
	CreateParametricGizmo.prototype._createRequest = function(elements) {
		return new HotspotHelper().createRequest(elements, this._viewport);
	};

	return CreateParametricGizmo;
});
