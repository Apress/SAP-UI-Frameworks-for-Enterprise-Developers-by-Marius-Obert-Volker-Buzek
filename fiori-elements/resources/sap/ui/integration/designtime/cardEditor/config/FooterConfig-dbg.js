/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 *
 * @private
 * @experimental
 */
sap.ui.define([
	"sap/ui/integration/designtime/cardEditor/config/generateFooterActionsStripConfig"
], function (
	generateFooterActionsStripConfig
) {
	"use strict";

	return {
		"items": generateFooterActionsStripConfig({
			"tags": ["footer"],
			"path": "footer/actionsStrip"
		})
	};
});
