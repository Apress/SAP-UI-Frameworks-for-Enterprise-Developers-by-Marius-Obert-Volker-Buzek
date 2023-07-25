/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

sap.ui.define([

], function () {
	"use strict";

	var MicroChartRenderUtils = {
		apiVersion :2 ,
		extendMicroChartRenderer: function (MicroChartRenderer) {
			/**
			 * Renders a "No Data" placeholder for the micro chart
			 *
			 * @param {object} oRm render manager
			 * @private
			 */
			MicroChartRenderer._renderNoData = function(oRm, oControl) {
				if (!oControl.getHideOnNoData()) {
					oRm.openStart("div",oControl);
					this._writeMainProperties(oRm, oControl);
					oRm.openEnd();

					oRm.openStart("div");
					oRm.class("sapSuiteUiMicroChartNoData");
					oRm.openEnd();

					oRm.openStart("div");
					oRm.class("sapSuiteUiMicroChartNoDataTextWrapper");
					oRm.openEnd();

					var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.microchart");
					var sText = oRb.getText("NO_DATA");
					oRm.openStart("span").openEnd();
					oRm.text(sText);
					oRm.close("span");

					oRm.close("div");
					oRm.close("div");
					oRm.close("div");
				}
			};

			MicroChartRenderer._renderActiveProperties = function(oRm, oControl) {
				var bIsActive = oControl.hasListeners("press");

				if (bIsActive) {
					if (oControl._hasData()) {
						oRm.class("sapSuiteUiMicroChartPointer");
					}
					oRm.attr("tabindex", "0");
				}
			};
		}
	};

	return MicroChartRenderUtils;
}, true);
