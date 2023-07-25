sap.ui.define([
		"sap/ui/Device"
	],
	function(Device) {
		"use strict";

		var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

		/**
		 * @class ImageEditorContainer renderer
		 * @static
		 */
		var ImageEditorContainerRenderer = {
			apiVersion: 2
		};


		ImageEditorContainerRenderer.render = function(oRm, oControl) {
			oRm.openStart("div", oControl)
				.class("sapSuiteUiCommonsImageEditorContainer")
				.attr("tabindex", "0")
				.attr("aria-label", oResourceBundle.getText("IMGEDITOR_ACCESSIBILITY_LABEL"))
				.openEnd();

			this.renderSvgFilters(oRm, oControl);
			this.renderHeaderToolbar(oRm, oControl);
			this.renderMobileHeaderToolbar(oRm, oControl);

			oRm.openStart("div")
				// render custom flex instead of sap.m.FlexBox, because ImageEditor can't be aggregation of multiple controls
				.class("sapSuiteUiCommonsImageEditorContainerContent")
				.openEnd();

			this.renderOptionsPanel(oRm, oControl);
			this.renderImageEditor(oRm, oControl);
			oRm.close("div");

			this.renderMobileZoomToolbar(oRm, oControl);
			this.renderMobileFooterToolbar(oRm, oControl);

			oRm.close("div");
		};

		ImageEditorContainerRenderer.renderSvgFilters = function(oRm, oControl) {
			oRm.openStart("svg")
				.attr("width", "0")
				.attr("height", "0")
				.style("position", "absolute")
				.openEnd();
			oRm.openStart("defs").openEnd();

			this.renderOriginalThumbnail(oRm, oControl);

			this.renderSepiaFilter(oRm, oControl);
			this.renderGrayscaleFilter(oRm, oControl);
			this.renderSaturateFilter(oRm, oControl);
			this.renderInvertFilter(oRm, oControl);
			this.renderBrightnessFilter(oRm, oControl);
			this.renderContrastFilter(oRm, oControl);
			this.renderHueRotateFilter(oRm, oControl);

			oRm.close("defs");
			oRm.close("svg");
		};

		ImageEditorContainerRenderer.renderOriginalThumbnail = function(oRm, oControl) {
			var oImageEditor = oControl.getImageEditor();

			if (!oImageEditor || !oImageEditor._oCanvas) {
				return;
			}

			oRm.voidStart("image").attr("xmlns", "http://www.w3.org/1999/xlink")
				.attr("id", oControl.getId() + "-origThumbnail")
				.attr("preserveAspectRatio", "xMidYMid slice") // supposedly equivalent of object-fit: cover
				.attr("viewBox", "0 0 " + oControl._oThumbnailCanvas.width + " " + oControl._oThumbnailCanvas.height) // viewbox is needed for preserveAspectRatio to work correctly)
				.attr("href", oImageEditor._oCanvas.toDataURL())
				.attr("width", "100%")
				.attr("height", "100%")
				.voidEnd();
		};

		ImageEditorContainerRenderer.renderSepiaFilter = function(oRm, oControl) {
			oRm.openStart("filter")
				.attr("id", oControl.getId() + "-sepia")
				.openEnd();
			oRm.voidStart("feColorMatrix")
				.attr("type", "matrix")
				.attr("values", "0.393 0.769 0.189 0 0  0.349 0.686 0.168 0 0  0.272 0.534 0.131 0 0  0 0 0 1 0")
				.voidEnd();
			oRm.close("filter");
		};

		ImageEditorContainerRenderer.renderGrayscaleFilter = function(oRm, oControl) {
			oRm.openStart("filter")
				.attr("id", oControl.getId() + "-grayscale")
				.openEnd();
			oRm.voidStart("feColorMatrix")
				.attr("type", "matrix")
				.attr("values", "0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0 0 0 0 1 0")
				.voidEnd();
			oRm.close("filter");
		};

		ImageEditorContainerRenderer.renderSaturateFilter = function(oRm, oControl) {
			oRm.openStart("filter")
				.attr("id", oControl.getId() + "-saturate")
				.openEnd();
			oRm.voidStart("feColorMatrix")
				.attr("type", "saturate")
				.attr("values", "3")
				.voidEnd();
			oRm.close("filter");
		};

		ImageEditorContainerRenderer.renderInvertFilter = function(oRm, oControl) {
			oRm.openStart("filter")
				.attr("id", oControl.getId() + "-invert")
				.openEnd();
			oRm.openStart("feComponentTransfer")
				.openEnd();
			oRm.voidStart("feFuncR").attr("type", "table").attr("tableValues", "1 0").voidEnd();
			oRm.voidStart("feFuncG").attr("type", "table").attr("tableValues", "1 0").voidEnd();
			oRm.voidStart("feFuncB").attr("type", "table").attr("tableValues", "1 0").voidEnd();
			oRm.close("feComponentTransfer");
			oRm.close("filter");
		};

		ImageEditorContainerRenderer.renderBrightnessFilter = function(oRm, oControl) {
			oRm.openStart("filter")
				.attr("id", oControl.getId() + "-brightness")
				.openEnd();
			oRm.openStart("feComponentTransfer").openEnd();
			oRm.voidStart("feFuncR")
				.attr("type", "linear")
				.attr("slope", "3")
				.voidEnd();
			oRm.voidStart("feFuncG")
				.attr("type", "linear")
				.attr("slope", "3")
				.voidEnd();
			oRm.voidStart("feFuncB")
				.attr("type", "linear")
				.attr("slope", "3")
				.voidEnd();
			oRm.close("feComponentTransfer");
			oRm.close("filter");
		};

		ImageEditorContainerRenderer.renderContrastFilter = function(oRm, oControl) {
			oRm.openStart("filter")
				.attr("id", oControl.getId() + "-contrast")
				.openEnd();
			oRm.openStart("feComponentTransfer")
				.openEnd();
			oRm.voidStart("feFuncR")
				.attr("type", "linear")
				.attr("slope", "3")
				.attr("intercept", "-0.3")
				.voidEnd();
			oRm.voidStart("feFuncG")
				.attr("type", "linear")
				.attr("slope", "3")
				.attr("intercept", "-0.3")
				.voidEnd();
			oRm.voidStart("feFuncB")
				.attr("type", "linear")
				.attr("slope", "3")
				.attr("intercept", "-0.3")
				.voidEnd();
			oRm.close("feComponentTransfer");
			oRm.close("filter");
		};

		ImageEditorContainerRenderer.renderHueRotateFilter = function(oRm, oControl) {
			oRm.openStart("filter").attr("id", oControl.getId() + "-hueRotate").openEnd();
			oRm.voidStart("feColorMatrix").attr("type", "hueRotate").attr("values", "90").voidEnd();
			oRm.close("filter");
		};

		ImageEditorContainerRenderer.renderHeaderToolbar = function(oRm, oControl) {
			if (!Device.system.phone && !oControl._isSmallSize()) {
				var oHeaderToolbar = oControl._getHeaderToolbar();
				oRm.renderControl(oHeaderToolbar);
			}
		};

		ImageEditorContainerRenderer.renderMobileHeaderToolbar = function(oRm, oControl) {
			if (Device.system.phone || oControl._isSmallSize()) {
				var oHeaderToolbar = oControl._getMobileHeaderToolbar();
				oRm.renderControl(oHeaderToolbar);
			}
		};
		ImageEditorContainerRenderer.renderMobileZoomToolbar = function(oRm, oControl) {
			var oHeaderToolbar = oControl._getMobileZoomToolbar();
			oRm.renderControl(oHeaderToolbar);
		};

		ImageEditorContainerRenderer.renderMobileFooterToolbar = function(oRm, oControl) {
			var oHeaderToolbar = oControl._getMobileFooterToolbar();
			oRm.renderControl(oHeaderToolbar);
		};

		ImageEditorContainerRenderer.renderOptionsPanel = function(oRm, oControl) {
			var oOptionsPanel = oControl._getOptionsPanel();
			oRm.renderControl(oOptionsPanel);

			oControl._refreshGridListsItems();
		};

		ImageEditorContainerRenderer.renderImageEditor = function(oRm, oControl) {
			var oImageEditor = oControl.getImageEditor();

			oRm.openStart("div")
				.class("sapSuiteUiCommonsImageEditorContainerWrapper")
				.openEnd();

			if (oImageEditor) {
				oRm.renderControl(oImageEditor);
			}

			oRm.close("div");
		};

		return ImageEditorContainerRenderer;

	}, /* bExport= */ true);
