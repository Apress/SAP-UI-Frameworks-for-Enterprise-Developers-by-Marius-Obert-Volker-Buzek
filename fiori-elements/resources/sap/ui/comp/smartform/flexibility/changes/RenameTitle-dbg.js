/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

sap.ui.define(['sap/ui/fl/changeHandler/BaseRename'], function(BaseRename) {
	"use strict";

	/**
	 * Change handler for renaming a smart form title
	 * @constructor
	 * @alias sap.ui.fl.changeHandler.RenameTitle
	 * @author SAP SE
	 * @version 1.113.0
	 * @experimental Since 1.46
	 */
	var RenameTitle = BaseRename.createRenameChangeHandler({
		propertyName : "title",
		changePropertyName : "fieldLabel",
		translationTextType : "XFLD"
	});

	return RenameTitle;
},
/* bExport= */true);