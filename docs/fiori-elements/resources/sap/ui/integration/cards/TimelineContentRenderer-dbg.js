/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(["./BaseContentRenderer"], function (BaseContentRenderer) {
	"use strict";

	/**
	 * TimelineContentRenderer renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var TimelineContentRenderer = BaseContentRenderer.extend("sap.ui.integration.cards.TimelineContentRenderer", {
		apiVersion: 2
	});

	/**
	 * @override
	 */
	TimelineContentRenderer.getMinHeight = function (oConfiguration, oContent, oCard) {
		if (oContent._fMinHeight) {
			return oContent._fMinHeight + "px";
		}

		var iMinItems = oCard.getContentMinItems(oConfiguration);

		if (iMinItems == null) {
			return this.DEFAULT_MIN_HEIGHT;
		}

		var iItemHeight = this.getItemMinHeight(oConfiguration, oContent);

		return (iMinItems * iItemHeight) + "rem";
	};

	TimelineContentRenderer.getItemMinHeight = function (oConfiguration, oControl) {
		if (!oConfiguration || !oConfiguration.item) {
			return 0;
		}

		return oConfiguration.item.ownerImage ? 7 : 5.625;
	};

	return TimelineContentRenderer;
});
