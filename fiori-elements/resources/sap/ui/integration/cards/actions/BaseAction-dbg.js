/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Core",
	"sap/ui/integration/util/BindingResolver"
], function (
	ManagedObject,
	Core,
	BindingResolver
) {
	"use strict";

	var BaseAction = ManagedObject.extend("sap.ui.integration.cards.actions.BaseAction", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				/**
				 * Configuration of the action from the manifest
				 */
				config: {
					type: "object"
				},

				/**
				 * Parameters of the action, with which the card, host and extension fired the event.
				 * Their bindings are already resolved.
				 */
				parameters: {
					type: "object"
				},

				/**
				 * Action handler for this action
				 */
				actionHandler: {
					type: "object"
				}
			},
			associations: {
				card: {
					type : "sap.ui.integration.widgets.Card",
					multiple: false
				},
				/**
				 * The source that triggers the action.
				 */
				source: {
					type : "sap.ui.base.EventProvider",
					multiple: false
				}
			}
		}
	});

	/**
	 * Executes the default action
	 */
	BaseAction.prototype.execute = function () { };

	/**
	 * Resolves bindings in the configuration to the source
	 * @returns {object} config with resolved bindings
	 */
	BaseAction.prototype.getResolvedConfig = function () {
		var oSource = this.getSourceInstance(),
			oBindingContext = oSource.getBindingContext(),
			sBindingPath;

		if (oBindingContext) {
			sBindingPath = oSource.getBindingContext().getPath();
		}

		return BindingResolver.resolveValue(this.getConfig(), oSource, sBindingPath);
	};

	BaseAction.prototype.getCardInstance = function () {
		return Core.byId(this.getCard());
	};

	BaseAction.prototype.getSourceInstance = function () {
		return Core.byId(this.getSource());
	};

	return BaseAction;
});