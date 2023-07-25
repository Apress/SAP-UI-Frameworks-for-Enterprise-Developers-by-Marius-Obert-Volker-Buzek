/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/f/CardRenderer",
	"sap/ui/integration/library"
], function (FCardRenderer, library) {
	"use strict";

	var MANIFEST_PATHS = {
		TYPE: "/sap.card/type"
	};
	var CardDesign = library.CardDesign;
	var CardPreviewMode = library.CardPreviewMode;

	return FCardRenderer.extend("sap.ui.integration.widgets.CardRenderer", {
		apiVersion: 2,

		/**
		 * @override
		 */
		renderContainerAttributes: function (oRm, oCard) {
			FCardRenderer.renderContainerAttributes.apply(this, arguments);

			oRm.class("sapUiIntCard");

			var oCardManifest = oCard._oCardManifest;

			if (oCardManifest && oCardManifest.get(MANIFEST_PATHS.TYPE) && oCardManifest.get(MANIFEST_PATHS.TYPE).toLowerCase() === "analytical") {
				oRm.class("sapUiIntCardAnalytical");
			}

			if (oCard.getCardFooter() && oCard.getCardFooter().getVisible()) {
				oRm.class("sapUiIntCardWithFooter");
			}

			if (oCard.getDesign() === CardDesign.Transparent) {
				oRm.class("sapFCardTransparent");
			}

			if (oCard.getPreviewMode() === CardPreviewMode.Abstract) {
				oRm.class("sapFCardPreview");
			}
		},

		/**
		 * @override
		 */
		renderContentSection: function (oRm, oCard) {
			var oFilterBar = oCard.getAggregation("_filterBar");

			if (oFilterBar) {
				oRm.renderControl(oFilterBar);
			}

			FCardRenderer.renderContentSection.apply(this, arguments);
		},

		/**
		 * @override
		 */
		renderFooterSection: function (oRm, oCard) {
			var oFooter = oCard.getAggregation("_footer");

			if (oFooter) {
				oRm.renderControl(oFooter);
			}
		}
	});

});