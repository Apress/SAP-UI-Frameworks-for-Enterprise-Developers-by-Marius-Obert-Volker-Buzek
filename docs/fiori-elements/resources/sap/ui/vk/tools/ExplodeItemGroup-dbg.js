/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.ExplodeItemGroup.
sap.ui.define([
	"sap/ui/core/Element",
	"../thirdparty/three"
], function(
	Element,
	THREE
) {
	"use strict";

	/**
	 * Constructor for a new ExplodeItemGroup.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Aggregation element for the output settings of the Viewport
	 * @extends sap.ui.core.Element
	 * @constructor
	 * @public
	 * @alias sap.ui.vk.tools.ExplodeItemGroup
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 * @experimental
	 */
	var ExplodeItemGroup = Element.extend("sap.ui.vk.tools.ExplodeItemGroup", /** @lends sap.ui.vk.tools.ExplodeItemGroup.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				name: { type: "string" },
				magnitudeAdjustmentMultiplier: { type: "float", defaultValue: 0.0 }
			},
			aggregations: {
				items: { type: "sap.ui.vk.NodeProxy", multiple: true }
			}
		}
	});

	ExplodeItemGroup.prototype.init = function() {
		this._magnitude = 0;
		this._offset = 0;
		this._deltaOffset = 0;
		this._center = new THREE.Vector3();
	};

	/**
	 * Returns group's bounding box.
	 * @returns {object} Bounding box.
	 */
	ExplodeItemGroup.prototype.getBoundingBox = function() {
		var boundingBox = new THREE.Box3();
		this.getItems().forEach(function(nodeProxy) {
			nodeProxy.getNodeRef()._expandBoundingBox(boundingBox, false, true, true);
		});
		return boundingBox;
	};

	/**
	 * Returns group's current magnitude value.
	 * @returns {float} Current magnitude value
	 */
	ExplodeItemGroup.prototype.getMagnitude = function() {
		return this._magnitude * (this._offset + this._deltaOffset * this.getMagnitudeAdjustmentMultiplier());
	};

	return ExplodeItemGroup;
});
