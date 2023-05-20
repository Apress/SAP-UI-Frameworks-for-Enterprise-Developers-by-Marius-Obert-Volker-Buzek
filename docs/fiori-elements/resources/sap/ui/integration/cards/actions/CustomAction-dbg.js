/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"./BaseAction"
], function (
	BaseAction
) {
	"use strict";

	var CustomAction = BaseAction.extend("sap.ui.integration.cards.actions.CustomAction", {
		metadata: {
			library: "sap.ui.integration"
		}
	});

	/**
	 * @override
	 */
	CustomAction.prototype.execute = function () {
		var mConfig = this.getConfig();

		if (typeof mConfig.action === "function") {
			mConfig.action(this.getCardInstance(), this.getSourceInstance());
		}
	};

	return CustomAction;
});