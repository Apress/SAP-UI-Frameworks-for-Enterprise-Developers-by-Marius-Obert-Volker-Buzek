/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

sap.ui.define([
	"sap/ui/core/IconPool"
], function(IconPool) {
	"use strict";

	/**
	 * @class Cluster renderer.
	 * @static
	 */
	var ClusterRenderer = {
		apiVersion: 2     // Semantic Rendering
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ClusterRenderer.render = function(oRm, oControl) {
		// write the HTML into the render manager
		oRm.openStart("div", oControl);
		oRm.attr("align", "center");
		oRm.attr("role", sap.ui.core.AccessibleRole.Presentation);
		oRm.attr("tabindex", "-1");
		oRm.class("sapUiVbicluster-main");
		oRm.openEnd();

		var Id1 = oControl.getId() + "-" + "backgroundcircle";
		var Id2 = Id1 + "-" + "innercircle";

		var col = oControl.getColor();
		var type = oControl.getType();
		var iiconVal = oControl.getIcon();
		var icon, icInfo;
		if (iiconVal) {
			icInfo = IconPool.getIconInfo(iiconVal);
		} else if (type == sap.ui.vbm.SemanticType.Error) {
			icInfo = IconPool.getIconInfo("status-negative");
		} else if (type == sap.ui.vbm.SemanticType.Warning) {
			icInfo = IconPool.getIconInfo("status-critical");
		} else if (type == sap.ui.vbm.SemanticType.Success) {
			icInfo = IconPool.getIconInfo("status-positive");
		} else {
			icInfo = IconPool.getIconInfo("status-inactive");
		}

		if (icInfo) {
			icon = icInfo.content;
		}
		var classOuter, classInner, classTextbox, classIcon;
		if (type == sap.ui.vbm.SemanticType.Error) {
			classOuter = "sapUiVbicluster-backgroundcircle sapUiVbicluster-border-error";
			classInner = "sapUiVbicluster-innercircle sapUiVbicluster-background-error";
			classIcon = "sapUiVbicluster-icon sapUiVbicluster-iconLight";
			classTextbox = "sapUiVbicluster-textbox sapUiVbicluster-textbox-error";
		} else if (type == sap.ui.vbm.SemanticType.Warning) {
			classOuter = "sapUiVbicluster-backgroundcircle sapUiVbicluster-border-warning";
			classInner = "sapUiVbicluster-innercircle sapUiVbicluster-background-warning";
			classIcon = "sapUiVbicluster-icon sapUiVbicluster-iconLight";
			classTextbox = "sapUiVbicluster-textbox sapUiVbicluster-textbox-warning";
		} else if (type == sap.ui.vbm.SemanticType.Success) {
			classOuter = "sapUiVbicluster-backgroundcircle sapUiVbicluster-border-success";
			classInner = "sapUiVbicluster-innercircle sapUiVbicluster-background-success sapUiVbicluster-inner-light";
			classIcon = "sapUiVbicluster-icon sapUiVbicluster-iconSuccess";
			classTextbox = "sapUiVbicluster-textbox sapUiVbicluster-textbox-success";
		} else if (type == sap.ui.vbm.SemanticType.None && col) {
			// not type but color
			classOuter = "sapUiVbicluster-backgroundcircle";
			classInner = "sapUiVbicluster-innercircle sapUiVbicluster-inner-light";
			classIcon = "sapUiVbicluster-icon";
			classTextbox = "sapUiVbicluster-textbox";
		} else {
			classOuter = "sapUiVbicluster-backgroundcircle sapUiVbicluster-border-default";
			classInner = "sapUiVbicluster-innercircle sapUiVbicluster-background-default sapUiVbicluster-inner-light";
			classIcon = "sapUiVbicluster-icon sapUiVbicluster-iconDefault";
			classTextbox = "sapUiVbicluster-textbox sapUiVbicluster-textbox-default";
		}

		var ariaRolePresentation = sap.ui.core.AccessibleRole.Presentation;
		var ariaRoleImg = sap.ui.core.AccessibleRole.Img;
		var ariaRoleDescription = sap.ui.core.AccessibleRole.Description;

		oRm.openStart("div", Id1);
		oRm.class(classOuter);

		if (type == sap.ui.vbm.SemanticType.None && col) {
			oRm.style("border-color", col)
		}
		oRm.attr("role", ariaRolePresentation);
		oRm.openEnd();

		oRm.openStart("div", Id2);
		oRm.class(classInner);
		if (type == sap.ui.vbm.SemanticType.None && col) {
			oRm.style("border-color", col)
		}
		oRm.attr("role", ariaRolePresentation);
		oRm.openEnd();




		if (icon) {
			var IdIcon = oControl.getId() + "-" + "icon";
			oRm.openStart("span", IdIcon);
			oRm.class(classIcon);
			if (type == sap.ui.vbm.SemanticType.None && col) {
				oRm.style("color", col)
			}
			oRm.attr("role", ariaRoleImg);
			oRm.openEnd();
			oRm.text(icon);
			oRm.close("span");
		}

		oRm.close("div"); // end of cluster-innercircle
		if ((oControl.getText())) {
			var IdTextbox = oControl.getId() + "-" + "textbox";
			oRm.openStart("div", IdTextbox);
			oRm.class(classTextbox);
			if (type == sap.ui.vbm.SemanticType.None && col) {
				oRm.style("border-color", col);
			}
			oRm.attr("role", ariaRoleDescription);
			oRm.openEnd();
			oRm.openStart("div");
			oRm.openEnd();
			oRm.text(oControl.getText());
			oRm.close("div");
			oRm.close("div");
		}
		oRm.close("div"); // end of cluster-backgroundcircle
		oRm.close("div");

	};

	return ClusterRenderer;

}, /* bExport= */true);
