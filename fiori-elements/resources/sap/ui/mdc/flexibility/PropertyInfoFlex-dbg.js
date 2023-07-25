/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([], function() {
	"use strict";

	//obsolete
	var oPropertyInfoFlex = {};

	oPropertyInfoFlex.addPropertyInfo = {
		"changeHandler": {
			applyChange: function(oChange, oControl, mPropertyBag) {
			},
			completeChangeContent: function(oChange, mChangeSpecificInfo, mPropertyBag) {
			},
			revertChange: function(oChange, oControl, mPropertyBag) {
			}
		},
		"layers": {
			"USER": true
		}
	};

	return oPropertyInfoFlex;
});