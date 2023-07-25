/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([], function() {
	"use strict";

	var Utils = {};

	Utils.getPersistencyKey = function(oControl) {
		if (oControl) {
			var oVMControl = oControl.getVariantManagement && oControl.getVariantManagement() || oControl;
			if (oVMControl.getPersonalizableControlPersistencyKey) {
				return oVMControl.getPersonalizableControlPersistencyKey();
			}
			return oVMControl.getPersistencyKey && oVMControl.getPersistencyKey();
		}
	};

	return Utils;
});