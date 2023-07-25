/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides the Design Time Metadata for the ...
sap.ui.define([], function() {
	"use strict";

	return {
		tool: {
			start: function(oPanel) {
				oPanel.setEnablePersonalization(false);

			},
			stop: function(oPanel) {
				oPanel.setEnablePersonalization(true);
			}
		}
	};

});