/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides type sap.ui.vk.DetailViewShape.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Detail view shape for {@link sap.ui.vk.threejs.DetailView}.
	 * @enum {string}
	 * @readonly
	 * @alias sap.ui.vk.DetailViewShape
	 * @private
	 */
	var DetailViewShape = {
		Box: "Box",
		Circle: "Circle",
		CircleLine: "CircleLine",
		CirclePointer: "CirclePointer",
		CircleArrow: "CircleArrow",
		CircleBubbles: "CircleBubbles",
		BoxLine: "BoxLine",
		BoxNoOutline: "BoxNoOutline",
		SolidPointer: "SolidPointer",
		SolidArrow: "SolidArrow"
	};

	return DetailViewShape;

}, /* bExport= */ true);
