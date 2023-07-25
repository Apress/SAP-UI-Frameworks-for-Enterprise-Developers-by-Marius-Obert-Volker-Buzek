/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"./library",
	"sap/m/library",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/ShortcutHintsMixin"
], function(
	vkLibrary,
	library,
	InvisibleText,
	ShortcutHintsMixin) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	/**
	 * <code>SplitButton</code> renderer.
	 * @namespace
	 */
	var ToggleMenuButtonRenderer = {
		apiVersion: 2
	};

	var CSS_CLASS = "sapUiVkTMB";

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm
	 *            the RenderManager that can be used for writing to
	 *            the Render-Output-Buffer
	 * @param {sap.m.SplitButton} oButton
	 *            the button to be rendered
	 */
	ToggleMenuButtonRenderer.render = function(rm, oButton) {
		var width = oButton.getWidth(),
			type = oButton.getType(),
			enabled = oButton.getEnabled(),
			titleAttribute = oButton.getTitleAttributeValue(),
			tooltipId;

		// write root DOM element
		rm.openStart("div", oButton).class(CSS_CLASS);

		if (oButton._getToggleButton().getIcon()) {
			rm.class(CSS_CLASS + "HasIcon");
		}

		if (type === ButtonType.Accept
			|| type === ButtonType.Reject
			|| type === ButtonType.Emphasized
			|| type === ButtonType.Transparent
			|| type === ButtonType.Attention
			|| type === ButtonType.Neutral
			|| type === ButtonType.Critical
			|| type === ButtonType.Success
			|| type === ButtonType.Negative) {
			rm.class(CSS_CLASS + type);
		}

		this.writeAriaAttributes(rm, oButton);
		rm.attr("tabindex", enabled ? "0" : "-1");

		// add tooltip if available
		if (titleAttribute && !ShortcutHintsMixin.isDOMIDRegistered(oButton.getId())) {
			rm.attr("title", titleAttribute);
		}

		// set user defined width
		if (width != "" || width.toLowerCase() === "auto") {
			rm.style("width", width);
		}

		rm.openEnd();

		rm.openStart("div").class("sapUiVkTMBInner");

		if (!enabled) {
			rm.class("sapUiVkTMBInnerDisabled");
		}

		rm.openEnd();

		rm.renderControl(oButton._getToggleButton());
		rm.renderControl(oButton._getArrowButton());

		rm.close("div");

		if (titleAttribute) {
			tooltipId = oButton.getId() + "-tooltip";
			rm.openStart("span", tooltipId);
			rm.class("sapUiInvisibleText");
			rm.openEnd();
			rm.text(titleAttribute);
			rm.close("span");
		}

		rm.close("div");
	};

	ToggleMenuButtonRenderer.writeAriaAttributes = function(oRm, oButton) {
		var mAccProps = {};

		this.writeAriaRole(oButton, mAccProps);
		this.writeAriaLabelledBy(oButton, mAccProps);

		oRm.accessibilityState(oButton, mAccProps);
	};

	ToggleMenuButtonRenderer.writeAriaRole = function(oButton, mAccProperties) {
		mAccProperties["role"] = "group";
	};

	ToggleMenuButtonRenderer.writeAriaLabelledBy = function(oButton, mAccProperties) {
		var sAriaLabelledByValue = "",
			oButtonTypeAriaLabelId = oButton.getButtonTypeAriaLabelId(),
			sTitleAttribute = oButton.getTitleAttributeValue(),
			sTooltipId;

		if (oButtonTypeAriaLabelId) {
			sAriaLabelledByValue += oButtonTypeAriaLabelId;
			sAriaLabelledByValue += " ";
		}

		if (sTitleAttribute) {
			sTooltipId = oButton.getId() + "-tooltip";
			sAriaLabelledByValue += sTooltipId + " ";
		}

		sAriaLabelledByValue += InvisibleText.getStaticId("sap.m", "SPLIT_BUTTON_DESCRIPTION") + " ";

		sAriaLabelledByValue += InvisibleText.getStaticId("sap.m", "SPLIT_BUTTON_KEYBOARD_HINT");

		mAccProperties["labelledby"] = { value: sAriaLabelledByValue, append: true };
	};

	return ToggleMenuButtonRenderer;
}, /* bExport= */ true);
