/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/base/Object'],
	function(BaseObject) {
	"use strict";

	var MetadataException = BaseObject.extend("sap.collaboration.components.socialtimeline.annotations.MetadataException", {
		constructor: function(sExceptionMessage) {
			this._sClassName = "sap.collaboration.components.socialtimeline.annotations.MetadataException";
			this._sExceptionMessage = sExceptionMessage;
		}
	});

	return MetadataException;

});
