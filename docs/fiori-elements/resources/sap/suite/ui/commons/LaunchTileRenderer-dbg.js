/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define(function() {
	"use strict";

	/**
	 * @class LaunchTile renderer.
	 * @static
	 */
	var LaunchTileRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	LaunchTileRenderer.render = function(oRm, oControl) {

		var oLocale = sap.ui.getCore().getConfiguration().getLanguage();
		var oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons", oLocale);
		var sAriaLabel = "";

		// write the HTML into the render manager
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapSuiteUiCommonsLaunchTile");
		oRm.addClass("sapSuiteUiCommonsPointer");
		oRm.writeAttribute("tabindex", "0");
		oRm.writeClasses();

		if (oControl.getTooltip_AsString()) {
			sAriaLabel = oControl.getTooltip_AsString();
			oRm.writeAttributeEscaped("title", oControl.getTooltip_AsString());
		} else {
			sAriaLabel = oResBundle.getText("LAUNCHTILE_LAUNCH") + " " + oControl.getTitle();
		}

		// ARIA
		oRm.writeAccessibilityState(oControl, {
			role: 'link',
			live: 'assertive',
			label: sAriaLabel
		});

		oRm.write(">"); // tile element

		oRm.write('<div id="' + oControl.getId() + '-launchTileText"');
		oRm.addClass("sapSuiteUiCommonsLaunchTileTitle");
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(oControl.getTitle());
		oRm.write("</div>");

		// Container for icon
		oRm.write('<div id="' + oControl.getId() + '-launchTileIcon"'); // Start icon container
		oRm.addClass("sapSuiteUiCommonsLaunchTileIcon");
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oControl._iconImage);
		oRm.write("</div>"); // end icon container

		oRm.write("</div>"); // end launch tile
	};

	return LaunchTileRenderer;

}, /* bExport= */ true);
