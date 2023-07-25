/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides type sap.ui.vk.ContentResourceSourceTypeToCategoryMap.
sap.ui.define([
	"./ContentResourceSourceCategory"
], function(
	ContentResourceSourceCategory
) {
	"use strict";

	/**
	 * The map from file extensions to content resource categories.
	 * @readonly
	 * @private
	 * @deprecated Since version 1.50.0.
	 */
	var ContentResourceSourceTypeToCategoryMap = {
		"vds": ContentResourceSourceCategory["3D"],
		"vdsl": ContentResourceSourceCategory["3D"],
		"cgm": ContentResourceSourceCategory["3D"],
		"png": ContentResourceSourceCategory["2D"],
		"jpg": ContentResourceSourceCategory["2D"],
		"jpeg": ContentResourceSourceCategory["2D"],
		"gif": ContentResourceSourceCategory["2D"],
		"bmp": ContentResourceSourceCategory["2D"],
		"tiff": ContentResourceSourceCategory["2D"],
		"tif": ContentResourceSourceCategory["2D"],
		"svg": ContentResourceSourceCategory["2D"]
	};

	return ContentResourceSourceTypeToCategoryMap;

}, /* bExport= */ true);
