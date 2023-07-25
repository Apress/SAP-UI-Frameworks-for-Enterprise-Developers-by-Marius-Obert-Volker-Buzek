/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

/*
 * This module is an exception class whose objects are thrown during File class object construction.
 * An exception of this kind is thrown when the File constructor isn't provided the arguments
 * it need to build an instance of the File class.
 */

sap.ui.define(["sap/ui/base/Object"], function(BaseObject) {
	"use strict";

	var InvalidAttachmentConstructorArgumentsException = BaseObject.extend("sap.collaboration.components.fiori.sharing.attachment.InvalidAttachmentConstructorArgumentsException", {
		constructor: function() {
			/** @private */ this.exceptionName = "InvalidAttachmentConstructorArgumentsException";
		}
	});


	return InvalidAttachmentConstructorArgumentsException;

});
