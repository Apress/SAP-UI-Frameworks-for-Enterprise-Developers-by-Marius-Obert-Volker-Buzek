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

	var MonthChangeAction = BaseAction.extend("sap.ui.integration.cards.actions.MonthChangeAction", {
		metadata: {
			library: "sap.ui.integration"
		}
	});

	return MonthChangeAction;
});