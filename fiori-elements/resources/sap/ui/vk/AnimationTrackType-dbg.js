/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
], function() {
	"use strict";

	/**
	 * Animation track binding types.
	 * @enum {string}
	 * @readonly
	 * @alias sap.ui.vk.AnimationTrackType
	 * @private
	 */
	var AnimationTrackType = {
		/**
		 * Animation track bound to the node's rotation.
		 * @public
		 */
		Rotate: "rrotate",
		/**
		 * Animation track bound to the node's translation.
		 * @public
		 */
		Translate: "rtranslate",
		/**
		 * Animation track bound to the node's scale.
		 * @public
		 */
		Scale: "rscale",
		/**
		 * Animation track bound to the node's opacity.
		 * @public
		 */
		Opacity: "ropacity",
		/**
		 * Animation track bound to the node's highlight.
		 * @public
		 */
		Color: "color"
	};

	return AnimationTrackType;
});
