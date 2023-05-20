/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/core/Element"
], function (Element) {
	"use strict";

	/**
	 * Constructor for a new ActionButton.
	 *
	 * @class
	 * Holds information about one custom action button.
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @constructor
	 * @since 1.50
	 * @public
	 * @alias sap.suite.ui.commons.networkgraph.ActionButton
	 */
	var ActionButton = Element.extend("sap.suite.ui.commons.networkgraph.ActionButton", {
		metadata: {
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * The icon to be used for the custom action button.
				 */
				icon: {
					type: "string", group: "Appearance", defaultValue: null
				},
				/**
				 * Tooltip title for custom action button.
				 */
				title: {
					type: "string", group: "Appearance", defaultValue: null
				},
				/**
				 * Indicates whether the action button is enabled.
				 */
				enabled: {
					type: "boolean", group: "Appearance", defaultValue: true
				},
				/**
				 * Position of the action button. Available only for nodes.
				 */
				position: {
					type: "sap.suite.ui.commons.networkgraph.ActionButtonPosition",
					group: "Appearance",
					defaultValue: "Right"
				}
			},
			events: {
				/**
				 * This event is fired when the action button is clicked or tapped.
				 */
				press: {
					parameters: {
						buttonElement: {type: "object"}
					}
				}
			}
		}
	});

	ActionButton.prototype.invalidate = function () {
		// Timeout for prevent multiple rendering when changing more properties
		var oParent = this.getParent();
		if (oParent && oParent._bActionButtonsRendered && !this._bTimeoutRunning) {
			this._bTimeoutRunning = true;
			setTimeout(function () {
				this._bTimeoutRunning = false;
				oParent._bActionButtonsRendered = false;
				oParent.showActionButtons(true);
			}.bind(this), 0);
		}
	};

	return ActionButton;
})
;
