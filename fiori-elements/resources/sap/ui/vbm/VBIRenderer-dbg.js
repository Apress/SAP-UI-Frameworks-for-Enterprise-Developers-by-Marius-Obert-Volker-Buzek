/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

sap.ui.define(function() {
	"use strict";

	/**
	 * @class VBI renderer.
	 * @static
	 */
	var VBIRenderer = {
		apiVersion: 2		// Semantic Rendering
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	VBIRenderer.render = function(oRm, oControl) {
		var sAriaLabel = oControl.getAriaLabel();
		var aLabelledBy = oControl.getAriaLabelledBy();
		var aDescribedBy = oControl.getAriaDescribedBy();

		// write the HTML into the render manager
		oRm.openStart("div", oControl);
		oRm.attr("role", "Figure");


		if (sAriaLabel) {
			oRm.attr("aria-label", sAriaLabel);
		}

		// aria-labelledby references
		if (aLabelledBy && aLabelledBy.length > 0) {
			oRm.attr("aria-labelledby", aLabelledBy.join(" "));
		}
		// aria-describedby references
		if (aDescribedBy && aDescribedBy.length > 0) {
			oRm.attr("aria-describedby", aDescribedBy.join(" "));
		}
		oRm.attr("tabindex", "0");
		oRm.class("vbi-main");
		oRm.style("width", oControl.getWidth());
		oRm.style("height", oControl.getHeight());
		oRm.openEnd();

		var id = oControl.getId();
		
		if (oControl.getPlugin()) {

			if (oControl.$oldContent.length === 0) {
				// for IE 11 do the regexp test........................................//
				if ((navigator.appName == "Microsoft Internet Explorer") || /(trident)\/[\w.]+;.*rv:([\w.]+)/i.test(navigator.userAgent)) {
					// write the object tag
					oRm.openStart("object", "'VBI" + id + "'" + " data-sap-ui-preserve='" + id + "' CLASSID='CLSID:00100000-2011-0070-2000-FC7214A1CD7B'");
					oRm.attr("width", oControl.getWidth());
					oRm.attr("height", oControl.getHeight());
					oRm.openEnd();
					// set a link to the native installer...............................//
					oRm.openStart("a");
					oRm.attr("href", "https://help.sap.com/viewer/product/SAP_VISUAL_BUSINESS_2.1");
					oRm.openEnd();
					oRm.text("Get the Visual Business PlugIn.");
					oRm.close("a");

					oRm.close("object");

				} else {
					// write the embed tag
					oRm.openStart("write", "'VBI" + id + "'" + " data-sap-ui-preserve='" + id + "' type='application/x-visualbusiness'");
					oRm.attr("width", oControl.getWidth());
					oRm.attr("height", oControl.getHeight());
					oRm.openEnd();

				}
				// render the information for using the native plugin
			}
		}
		
		oRm.openStart("div");
		oRm.class("vbi-hidden");
		oRm.attr("role", sap.ui.core.AccessibleRole.Presentation);
		oRm.openEnd();
		this.renderDependants(oRm, oControl.m_renderList);
		oRm.close("div");
		oControl.m_renderList = [];

		oRm.close("div");

		// the config is not loaded here any more, due the set config will be.....//
		// called, then queueing or execution will take place.....................//
	};
	
	VBIRenderer.renderDependants = function(oRm, aList) {
		for (var i = 0, oEntry; i < aList.length; ++i) {
			oEntry = aList[i];
			// If the container item already exists, we do not render it anymore
			// We need to find a better solution because the real problem
			// is the fact that we fire the container creation event twice.
			if (!oEntry.control.getDomRef()) {
				oRm.openStart("div");
				oRm.attr("data", oEntry.data);
				oRm.openEnd();
				oRm.renderControl(oEntry.control);
				oRm.close("div");
			}
		} 
	};

	return VBIRenderer;

}, /* bExport= */true);
