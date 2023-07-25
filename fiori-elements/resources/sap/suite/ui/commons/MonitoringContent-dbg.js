/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/Icon',
	"sap/ui/events/KeyCodes",
	"./MonitoringContentRenderer"
], function (library, Control, Icon, KeyCodes, MonitoringContentRenderer) {
	"use strict";

	/**
	 * Constructor for a new MonitoringContent.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control is used in a tile or any other place to display numeric values and an icon.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.25.
	 * This control has been deprecated in favor of new sap.suite.ui.commons.NumericContent.
	 * @alias sap.suite.ui.commons.MonitoringContent
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MonitoringContent = Control.extend("sap.suite.ui.commons.MonitoringContent", /** @lends sap.suite.ui.commons.MonitoringContent.prototype */ {
		metadata: {

			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * The actual value.
				 */
				value: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * This property is set by the return value of sap.ui.core.IconPool.getIconURI that is called with an icon name parameter and optional collection parameter. The collection parameter is required when the application extended icons are used.
				 */
				iconSrc: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * Updates the size of the chart. If not set then the default size is applied based on the device tile.
				 */
				size: {
					type: "sap.suite.ui.commons.InfoTileSize",
					group: "Misc",
					defaultValue: "Auto"
				},

				/**
				 * Indicates the load status.
				 */
				state: {
					type: "sap.suite.ui.commons.LoadState",
					group: "Misc",
					defaultValue: "Loaded"
				},

				/**
				 * If set to true, changing of the value is animated.
				 */
				animateTextChange: {type: "boolean", group: "Misc", defaultValue: true}
			},
			aggregations: {

				/**
				 * The icon that is displayed in the content.
				 */
				icon: {type: "sap.ui.core.Icon", multiple: false}
			},
			events: {

				/**
				 * The event is fired when the user chooses the monitoring content.
				 */
				press: {}
			}
		}
	});

	MonitoringContent.prototype.init = function () {
		this._oIcon = new Icon(this.getId() + "-icon");
		this.setAggregation("icon", this._oIcon);
	};

	MonitoringContent.prototype.onAfterRendering = function () {
		if (library.LoadState.Loaded === this.getState() || this.getAnimateTextChange()) {
			this.$().animate({opacity: "1"}, 1000);
		}
	};

	MonitoringContent.prototype.setIconSrc = function (sIconSrc) {
		this._oIcon.setSrc(sIconSrc);
		return this;
	};

	MonitoringContent.prototype.getIconSrc = function () {
		return this._oIcon.getSrc();
	};

	MonitoringContent.prototype.ontap = function (oEvent) {
		this.firePress();
	};

	MonitoringContent.prototype.onkeydown = function (oEvent) {
		if (oEvent.which === KeyCodes.ENTER || oEvent.which === KeyCodes.SPACE) {
			this.firePress();
			oEvent.preventDefault();
		}
	};

	return MonitoringContent;
});
