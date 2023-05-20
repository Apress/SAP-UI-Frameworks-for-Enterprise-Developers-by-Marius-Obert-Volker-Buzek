/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"./changeHandler/PropertyChangeMapper",
	"sap/base/Log"
], function (PropertyChangeMapper, Log) {
	"use strict";

	var ID_PROPERTY_MAP = Object.freeze({
		"-sortIcon": "showSort",
		"-filterIcon": ["showItemFilter", "showTimeFilter"],
		"-searchField": "showSearch",
		"-headerBar": "showHeaderBar"
	});

	function getProperty(sId) {
		var sKey;
		for (sKey in ID_PROPERTY_MAP) {
			if (typeof sKey == "string" && sKey.length > 0 && sId.endsWith(sKey)) {
				return ID_PROPERTY_MAP[sKey];
			}
		}
		Log.fatal("Unkonw id of an inner component: " + sId);
		return null;
	}

	return {
		"hideToolbarItem": new PropertyChangeMapper(function (oSpecificChangeInfo) {
			var sId = oSpecificChangeInfo.removedElement.id;
			return getProperty(sId);
		}, false),
		"unhideToolbarItem": new PropertyChangeMapper(function (oSpecificChangeInfo) {
			var sId = oSpecificChangeInfo.revealedElementId;
			return getProperty(sId);
		}, true),
		"hideControl": "default",
		"unhideControl": "default",
		"moveControls": "default"
	};
}, /* bExport= */ true);