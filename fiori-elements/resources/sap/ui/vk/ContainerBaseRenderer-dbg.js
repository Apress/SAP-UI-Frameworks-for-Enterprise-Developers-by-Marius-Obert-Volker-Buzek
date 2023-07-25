/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define(function() {
	"use strict";

	/**
	 * ContainerBase renderer.
	 * @namespace
	 * @static
	 */
	var ContainerBaseRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ContainerBaseRenderer.render = function(oRm, oControl) {
		// console.log( "sap.ui.vk.ContainerBaseRenderer.render.....\r\n");
		var sTooltip = oControl.getTooltip_AsString();
		var sTitle = oControl.getTitle();
		var aLabelledBy = oControl.getAriaLabelledBy();
		var aDescribedBy = oControl.getAriaDescribedBy();

		oRm.openStart("div", oControl);
		oRm.attr("role", sap.ui.core.AccessibleRole.Group);
		if (sTitle) {
			oRm.attr("aria-label", sTitle);
		} else if (sTooltip) {
			oRm.attr("aria-label", sTooltip);
		}
		// aria-labelledby references
		if (aLabelledBy && aLabelledBy.length > 0) {
			oRm.attr("aria-labelledby", aLabelledBy.join(" "));
		}
		// aria-describedby references
		if (aDescribedBy && aDescribedBy.length > 0) {
			oRm.attr("aria-describedby", aDescribedBy.join(" "));
		}
		oRm.class("sapUiVkContainerBase");
		oRm.openEnd();
		oRm.openStart("div");
		oRm.attr("id", oControl.getId() + "-wrapper");
		oRm.attr("role", sap.ui.core.AccessibleRole.Presentation);
		oRm.class("sapUiVkContainerBaseWrapper");
		oRm.openEnd();
		this.writeContentArea(oRm, oControl);
		this.writeToolbarArea(oRm, oControl);
		oRm.close("div");
		oRm.close("div");
	};

	ContainerBaseRenderer.writeContentArea = function(oRm, oControl) {
		// content part
		var selectedContent = oControl.getSelectedContent();
		oRm.openStart("div");
		oRm.class("sapUiVkContainerBaseContentArea");
		oRm.attr("role", sap.ui.core.AccessibleRole.Img);
		oRm.openEnd();
		if (selectedContent !== null) {
			oRm.renderControl(selectedContent);
		} else if (oControl.getContent().length > 0) {
			selectedContent = oControl.getContent()[0];
			oRm.renderControl(selectedContent);
		}
		oRm.close("div");
	};

	ContainerBaseRenderer.writeToolbarArea = function(oRm, oControl) {
		oRm.openStart("div");
		oRm.class("sapUiVkContainerBaseToolbarArea");
		oRm.attr("role", sap.ui.core.AccessibleRole.Group);
		oRm.openEnd();
		oRm.renderControl(oControl._oToolbar);
		oRm.close("div");
	};

	return ContainerBaseRenderer;

}, /* bExport= */true);
