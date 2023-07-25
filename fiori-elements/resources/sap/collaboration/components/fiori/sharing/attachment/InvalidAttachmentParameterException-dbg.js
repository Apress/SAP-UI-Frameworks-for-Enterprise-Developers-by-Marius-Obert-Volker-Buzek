/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.define(["sap/ui/base/Object"], function(BaseObject) {
	"use strict";

	var InvalidAttachmentParameterException = BaseObject.extend("sap.collaboration.components.fiori.sharing.attachment.InvalidAttachmentParameterException", {
		constructor: function(parameter) {
			/** @private */ this.exceptionName = "InvalidAttachmentParameterException: " + parameter;
		}
	});


	return InvalidAttachmentParameterException;

});
