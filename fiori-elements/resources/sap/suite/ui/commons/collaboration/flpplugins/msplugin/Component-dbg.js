/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(
	[
		"sap/ui/core/Component",
		"sap/base/Log",
		"../../ServiceContainer"
	],
	function (Component, Log, ServiceContainer) {
		"use strict";
		var oLogger = Log.getLogger("sap.suite.ui.commons.collaboration.flpplugins.msplugin.Component");
		/**
		 * Provides the collaboration plugin information for Microsoft Teams Integration.
		 * @extends sap.ui.core.Component
		 * @name sap.suite.ui.commons.collaboration.flpplugins.msplugin.Component
		 * @since 1.108.0
         * @private
         * @ui5-restricted: sap.suite.ui.commons.collaboration
         * @experimental Since 1.108
		 *
		 */
		return Component.extend("sap.suite.ui.commons.collaboration.flpplugins.msplugin.Component", {
			metadata: {
				properties: {
					/**
					 * Specifies the collaboration using Microsoft Teams as Link is configured or not.
					 */
					 isShareAsLinkEnabled: {
						name: "isShareAsLinkEnabled",
						type: "boolean"
					},
					/**
					 * Specifies the collaboration with Microsoft Teams as Tab is configured or not.
					 */
                     isShareAsTabEnabled: {
						name: "isShareAsTabEnabled",
						type: "boolean"
					}
				}
			},
			init: function () {
				// load plugin config
				var oPluginConfigData = this._loadPluginConfigData();
				if (oPluginConfigData) {
					ServiceContainer.setCollaborationType("COLLABORATION_MSTEAMS", oPluginConfigData);
				} else {
					oLogger.error("Collaboration configuration for Microsoft Teams Integration could not be loaded.");
				}
			},

			_loadPluginConfigData: function () {
				if (this.getComponentData() && this.getComponentData().config) {
					return this.getComponentData().config; // retrieve the plugin configuration
				}
			}
		});
	}
);