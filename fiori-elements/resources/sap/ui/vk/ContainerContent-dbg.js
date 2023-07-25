/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.ContainerContent.
sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"./ContainerContentRenderer"
], function(
	vkLibrary,
	Control,
	ContainerContentRenderer
) {
	"use strict";

	/**
	 * Constructor for a new ContainerContent.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Aggregation element for the Container Base
	 * @extends sap.ui.core.Control
	 * @constructor
	 * @public
	 * @alias sap.ui.vk.ContainerContent
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 * @since 1.38.0
	 */
	var ContainerContent = Control.extend("sap.ui.vk.ContainerContent", /** @lends sap.ui.vk.ContainerContent.prototype */ {
		metadata: {

			library: "sap.ui.vk",
			properties: {
				/**
				 * Icon to show up in the toolbar
				 */
				"icon": {
					type: "string",
					group: "Misc",
					defaultValue: null
				},
				/**
				 * Title for the icon in the toolbar
				 */
				"title": {
					type: "string",
					group: "Misc",
					defaultValue: null
				}
			},
			aggregations: {
				"content": {
					type: "sap.ui.core.Control",
					multiple: false
				}
			}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	// ContainerContent.prototype.init = function(){
	// // do something for initialization...
	// };

	ContainerContent.prototype.setContent = function(oContent) {
		if (oContent instanceof sap.ui.vbm.GeoMap) {
			oContent.setNavcontrolVisible(false);
			oContent.setWidth("100%");
			oContent.setHeight("100%");
		}
		this.setAggregation("content", oContent);
		return this;
	};

	return ContainerContent;

});
