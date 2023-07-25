sap.ui.define([
		"sap/ui/Device"
	],
	function(Device) {
		"use strict";

		var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

		/**
		 * @class ImageEditor renderer
		 * @static
		 */
		var ImageEditorRenderer = {
			apiVersion: 2
		};

		var HANDLER_CLASSES = {
			nw: {
				vertical: "sapSuiteUiCommonsImageEditorTop",
				horizontal: "sapSuiteUiCommonsImageEditorLeft",
				handlers: ["Horizontal", "Vertical"],
				types: ["Rectangle", "CustomShape"]
			},
			ne: {
				vertical: "sapSuiteUiCommonsImageEditorTop",
				horizontal: "sapSuiteUiCommonsImageEditorRight",
				handlers: ["Horizontal", "Vertical"],
				types: ["Rectangle", "CustomShape"]
			},
			sw: {
				vertical: "sapSuiteUiCommonsImageEditorBottom",
				horizontal: "sapSuiteUiCommonsImageEditorLeft",
				handlers: ["Horizontal", "Vertical"],
				types: ["Rectangle", "CustomShape"]
			},
			se: {
				vertical: "sapSuiteUiCommonsImageEditorBottom",
				horizontal: "sapSuiteUiCommonsImageEditorRight",
				handlers: ["Horizontal", "Vertical"],
				types: ["Rectangle", "CustomShape"]
			},
			n: {
				vertical: "sapSuiteUiCommonsImageEditorTop",
				horizontal: "sapSuiteUiCommonsImageEditorCenter",
				handlers: ["Horizontal"],
				types: ["Rectangle", "CustomShape", "Ellipse"]
			},
			s: {
				vertical: "sapSuiteUiCommonsImageEditorBottom",
				horizontal: "sapSuiteUiCommonsImageEditorCenter",
				handlers: ["Horizontal"],
				types: ["Rectangle", "CustomShape", "Ellipse"]
			},
			w: {
				vertical: "sapSuiteUiCommonsImageEditorMiddle",
				horizontal: "sapSuiteUiCommonsImageEditorLeft",
				handlers: ["Vertical"],
				types: ["Rectangle", "CustomShape", "Ellipse"]
			},
			e: {
				vertical: "sapSuiteUiCommonsImageEditorMiddle",
				horizontal: "sapSuiteUiCommonsImageEditorRight",
				handlers: ["Vertical"],
				types: ["Rectangle", "CustomShape", "Ellipse"]
			}
		};

		ImageEditorRenderer.render = function(oRm, oControl) {
			oRm.openStart("div", oControl);
			oRm.class("sapSuiteUiCommonsImageEditor").class("sapSuiteUiCommonsImageEditorEmpty").class("sapSuiteUiCommonsImageEditorMode" + oControl.getMode());

			if (oControl.getCustomShapeLoaded()) {
				oRm.class("sapSuiteUiCommonsImageEditorModeCropCustomShapeLoaded");
			}

			oRm.openEnd();

			this.renderNoData(oRm, oControl);

			oRm.openStart("div");
			oRm.attr("id", oControl.getId() + "-canvasInnerContainer");
			oRm.attr("tabindex", "0");
			oRm.attr("role", "img");
			oRm.class("sapSuiteUiCommonsImageEditorCanvasInnerContainer");
			oRm.openEnd();

			this.renderTransformHandlers(oRm);
			this.renderSvgOverlay(oRm, oControl);
			this.renderCropArea(oRm, oControl);
			// this.renderZones(oRm, oControl);

			oRm.close("div"); // close canvasInnerContainer
			oRm.close("div"); // close ImageEditor
		};

		ImageEditorRenderer.renderNoData = function(oRm, oControl) {
			oRm.openStart("div");
			oRm.class("sapSuiteUiCommonsImageEditorNoData");
			oRm.attr("tabindex", "0");
			oRm.attr("aria-label", oResourceBundle.getText("IMGEDITOR_NO_IMAGE"));
			oRm.openEnd();

			oRm.openStart("div");
			oRm.class("sapSuiteUiCommonsImageEditorNoDataText");
			oRm.openEnd();
			oRm.text(oResourceBundle.getText("IMGEDITOR_NO_IMAGE"));
			oRm.close("div");

			oRm.close("div");
		};

		ImageEditorRenderer.renderSvgOverlay = function(oRm, oControl) {
			oRm.openStart("svg")
				.class("sapSuiteUiCommonsImageEditorCropOverlayContainer")
				.openEnd();
			// define mask for different crop shapes and overlay area
			oRm.openStart("defs").openEnd();
			// rect crop area shape
			oRm.voidStart("rect").attr("id", oControl.getId() + "-overlayMaskRect").voidEnd(); // box size is rendered after rendering
			// ellipse crop area shape
			oRm.voidStart("ellipse").attr("id", oControl.getId() + "-overlayMaskEllipse").voidEnd(); // box size is rendered after rendering

			// color of the rendered custom shapes cannot be change throught css, has to be rendered once in black and once in white color
			// custom image area shape in black color for masking the area out
			oRm.openStart("image")
				.attr("xmlns", 'http://www.w3.org/1999/xlink')
				.attr("id", oControl.getId() + "-overlayMaskCustomBlack")
				.attr("preserveAspectRatio", 'none')
				.attr('x', '0')
				.attr('y', '0')
				.attr('width', '100%')
				.attr('height', '100%');

			if (oControl._sBlackCustomShapeUrl) {
				oRm.attr("href", oControl._sBlackCustomShapeUrl);
			}
			oRm.openEnd().close("image");
			// // custom image area shape in black color for masking the area in
			oRm.openStart("image")
				.attr("xmlns", "http://www.w3.org/1999/xlink")
				.attr("id", oControl.getId() + "-overlayMaskCustomWhite")
				.attr("preserveAspectRatio", 'none')
				.attr("x", "0")
				.attr("y", "0")
				.attr("width", "100%")
				.attr("height", "100%");
			if (oControl._sWhiteCustomShapeUrl) {
				oRm.attr("href", oControl._sWhiteCustomShapeUrl);
			}
			oRm.openEnd().close("image");

			// mask that keeps the black overlay on the whole image but the crop area part
			oRm.openStart("mask")
				.attr("id", oControl.getId() + "-darkOverlayMask")
				.openEnd();
			// x,y properties doesn't work in some browsers as css value
			oRm.voidStart("rect")
				.attr("fill", "white")
				.attr("x", "0")
				.attr("y", "0")
				.attr("width", "100%")
				.attr("height", "100%")
				.voidEnd();
			// use hiding classes on <use> element instead of on its original so that they are correctly applied in FF https://stackoverflow.com/a/48368084
			oRm.voidStart("use")
				.class("sapSuiteUiCommonsImageEditorCropItemRectangle")
				.attr("fill", "black")
				.attr("href", "#" + oControl.getId() + "-overlayMaskRect")
				.voidEnd();
			oRm.voidStart("use")
				.class("sapSuiteUiCommonsImageEditorCropItemEllipse")
				.attr("fill", "black")
				.attr("href", "#" + oControl.getId() + "-overlayMaskEllipse")
				.voidEnd();
			oRm.voidStart("use")
				.class("sapSuiteUiCommonsImageEditorCropItemCustomShape")
				.attr("href", "#" + oControl.getId() + "-overlayMaskCustomBlack")
				.voidEnd();

			oRm.close("mask");

			// mask that keeps the white overlay only on the crop area part
			oRm.openStart("mask")
				.attr("id", oControl.getId() + "-lightOverlayClip")
				.openEnd();
			oRm.voidStart("use")
				.class("sapSuiteUiCommonsImageEditorCropItemRectangle")
				.attr("fill", "white")
				.attr("href", "#" + oControl.getId() + "-overlayMaskRect")
				.voidEnd();
			oRm.voidStart("use")
				.class("sapSuiteUiCommonsImageEditorCropItemEllipse")
				.attr("fill", "white")
				.attr("href", "#" + oControl.getId() + "-overlayMaskEllipse")
				.voidEnd();
			oRm.voidStart("use")
				.class("sapSuiteUiCommonsImageEditorCropItemCustomShape")
				.attr("href", "#" + oControl.getId() + "-overlayMaskCustomWhite")
				.voidEnd();
			oRm.close("mask");
			oRm.close("defs");

			// dark overlay
			oRm.voidStart("rect")
				.class("sapSuiteUiCommonsImageEditorCropOverlayBlack")
				.attr("mask", "url(#" + oControl.getId() + "-darkOverlayMask)")
				.attr("x", "0")
				.attr("y", "0")
				.attr("width", "100%")
				.attr("height", "100%")
				.voidEnd();

			// light overlay
			oRm.voidStart("rect")
				.class("sapSuiteUiCommonsImageEditorCropOverlayWhite")
				.attr("mask", "url(#" + oControl.getId() + "-lightOverlayClip)")
				.attr("fill", "white")
				.attr("x", "0")
				.attr("y", "0")
				.attr("width", "100%")
				.attr("height", "100%")
				.voidEnd();

			oRm.close("svg");
		};

		ImageEditorRenderer.renderCropArea = function(oRm, oControl) {
			oRm.openStart("div").class("sapSuiteUiCommonsImageEditorCropInnerRectangle").openEnd();

			oRm.openStart("svg").class("sapSuiteUiCommonsImageEditorCropSvg").openEnd();
			oRm.openStart("defs").openEnd();
			// chrome has some weird problem with redrawing some svg masks
			// objectBoundingBox has to be used so the mask is correctly redrawn on resize
			oRm.openStart("mask").attr("id", oControl.getId() + "-thirdsMask").attr("maskContentUnits", "objectBoundingBox").openEnd();
			oRm.voidStart("rect")
				.class("sapSuiteUiCommonsImageEditorCropItemRectangle")
				.attr("fill", "white")
				.attr("width", "1")
				.attr("height", "1")
				.voidEnd();
			oRm.voidStart("ellipse")
				.class("sapSuiteUiCommonsImageEditorCropItemEllipse")
				.attr("fill", "white")
				.attr("cx", "0.5")
				.attr("cy", "0.5")
				.attr("rx", "0.5")
				.attr("ry", "0.5")
				.voidEnd();
			oRm.close("mask");

			// border shadows
			this.renderShadowFilter(oRm, oControl.getId() + "-bottomShadow", 0, 2);
			this.renderShadowFilter(oRm, oControl.getId() + "-topShadow", 0, -2);
			this.renderShadowFilter(oRm, oControl.getId() + "-rightShadow", 2, 0);
			this.renderShadowFilter(oRm, oControl.getId() + "-leftShadow", -2, 0);

			oRm.close("defs");

			// elipse crop area border
			oRm.voidStart("ellipse")
				.class("sapSuiteUiCommonsImageEditorCropItemEllipse")
				.attr("fill", "transparent")
				.attr("stroke-width", "1")
				.attr("stroke", "white")
				.attr("cx", "50%")
				.attr("cy", "50%")
				.attr("rx", "50%")
				.attr("ry", "50%")
				.voidEnd();

			// rectangle crop area borders
			this.renderRectBorders(oRm, oControl);
			// lines showing the thirds
			this.renderThirdLines(oRm, oControl);

			oRm.close("svg");

			this.renderCropAreaDragHandler(oRm, oControl);
			this.renderCropAreaResizeHandlers(oRm);

			oRm.close("div");
		};

		ImageEditorRenderer.renderZones = function(oRm, oControl) {
			oRm.openStart("div")
				.class("sapSuiteUiCommonsImageEditorZones")
				.openEnd();

			oControl.getZones().forEach(function (oZone) {
				this.renderZone(oRm, oControl, oZone);
			}, this);
			oRm.close("div");
		};

		ImageEditorRenderer.renderZone = function(oRm, oControl, oZone) {
			oRm.openStart("div", oZone);
			oRm.class("sapSuiteUiCommonsImageEditorZone");

			if (oZone.getEditable()) {
				oRm.class("sapSuiteUiCommonsImageEditorZoneEditable");
			}

			if (oZone.getHighlighted()) {
				oRm.class("sapSuiteUiCommonsImageEditorZoneHighlighted");
			}

			// box size not rendered here because it is done in onAfterRendering
			oRm.openEnd();

			// inner zone takes in account padding of the parent
			oRm.openStart("div").class("sapSuiteUiCommonsImageEditorZoneInner").openEnd();
			if (!oZone.getEditable() && !oZone.getHighlighted()) {
				oRm.openStart("div").class("sapSuiteUiCommonsImageEditorZoneInnerColoring").openEnd().close("div");
			}

			if (oZone.getHighlighted()) {
				oRm.openStart("div").class("sapSuiteUiCommonsImageEditorZoneLabel").openEnd();
				// text has to be written inside span, i think for ellipsis overflow to work correctly in flex?
				oRm.openStart("span");
				oRm.text(oZone.getLabel());
				oRm.close("span");
				oRm.close("div");
			}

			if (oZone.getEditable()) {
				// svg double colored border
				this.renderBWBorder(oRm);
			}
			oRm.close("div");

			// handlers are outside of the inner zone, ignoring the parent padding
			if (oZone.getEditable()) {
				this.renderZoneResizeHandlers(oRm);
			}

			oRm.close("div");
		};

		ImageEditorRenderer.renderBWBorder = function(oRm) {
			oRm.openStart("svg")
				.class("sapSuiteUiCommonsImageEditorZoneEditBorder")
				.attr("x", "0")
				.attr("y", "0")
				.attr("width", "100%")
				.attr("height", "100%")
				.openEnd();
			this.renderStrokeRect(oRm, "black", 5, 5, 5, 0.5);
			this.renderStrokeRect(oRm, "white", 5, 5, 0, 0.5);
			oRm.close("svg");
		};

		ImageEditorRenderer.renderStrokeRect = function(oRm, sColor, iDashArrayFilled, iDashArraySpace, fOffset, fDuration) {
			oRm.openStart("rect")
				.attr("x", "0")
				.attr("y", "0")
				.attr("width", "100%")
				.attr("height", "100%")
				.attr("fill", "none")
				.attr("stroke", sColor)
				.attr("stroke-dasharray", iDashArrayFilled + "," + iDashArraySpace)
				.openEnd();
			oRm.openStart("animate")
				.attr("attributeName", "stroke-dashoffset")
				.attr("repeatCount", "indefinite")
				.attr("from", fOffset)
				.attr("to", fOffset + iDashArrayFilled + iDashArraySpace)
				.attr("dur", fDuration)
				.openEnd()
				.close("animate");
			oRm.close("rect");
		};

		ImageEditorRenderer.renderShadowFilter = function(oRm, sId, iDx, iDy) {
			oRm.openStart("filter")
				.attr("id", sId)
				.attr("x", "0")
				.attr("y", "0")
				.attr("width", "100%")
				.attr("height", "100%")
				.attr("filterUnits", "userSpaceOnUse")
				.openEnd();
			oRm.voidStart("feGaussianBlur")
				.attr("in", "SourceAlpha")
				.attr("stdDeviation", "2")
				.attr("result", "blur")
				.voidEnd();
			oRm.voidStart("feOffset")
				.attr("in", "blur")
				.attr("result", "offOut")
				.attr("x", iDx)
				.attr("y", iDy)
				.voidEnd();
			oRm.voidStart("feBlend")
				.attr("in", "SourceGraphic")
				.attr("in2", "offOut")
				.attr("mode", "normal")
				.voidEnd();
			oRm.close("filter");
		};

		ImageEditorRenderer.renderRectBorders = function(oRm, oControl) {
			oRm.openStart("g").class("sapSuiteUiCommonsImageEditorCropItemRectangle").class("sapSuiteUiCommonsImageEditorCropItemCustomShape").openEnd();
			this.renderCropLine(oRm, oControl, "bottomShadow", 0, 0, 100, 0);
			this.renderCropLine(oRm, oControl, "leftShadow", 100, 0, 100, 100);
			this.renderCropLine(oRm, oControl, "topShadow", 100, 100, 0, 100);
			this.renderCropLine(oRm, oControl, "rightShadow", 0, 100, 0, 0);
			oRm.close("g");
		};

		ImageEditorRenderer.renderThirdLines = function(oRm, oControl) {
			oRm.openStart("g")
				.class("sapSuiteUiCommonsImageEditorCropThirds")
				.attr("mask", "url(" + "#" + oControl.getId() + "-thirdsMask" + ")")
				.openEnd();
			this.renderCropLine(oRm, oControl, "rightShadow", 100 / 3, 0, 100 / 3, 100);
			this.renderCropLine(oRm, oControl, "rightShadow", 100 * 2 / 3, 0, 100 * 2 / 3, 100);
			this.renderCropLine(oRm, oControl, "bottomShadow", 0, 100 / 3, 100, 100 / 3);
			this.renderCropLine(oRm, oControl, "bottomShadow", 0, 100 * 2 / 3, 100, 100 * 2 / 3);
			oRm.close("g");
		};

		ImageEditorRenderer.renderCropLine = function(oRm, oControl, sFilter, fX1, fY1, fX2, fY2) {
			oRm.voidStart("line").class("sapSuiteUiCommonsImageEditorCropLine");

			// filter causes straight lines to disappear in ie/edge
			if (!Device.browser.msie && !Device.browser.edge) {
				oRm.attr("filter", "url(#" + oControl.getId() + "-" + sFilter + ")");
			}

			oRm.attr("x1", fX1 + "%")
				.attr("y1", fY1 + "%")
				.attr("x2", fX2 + "%")
				.attr("y2", fY2 + "%")
				.voidEnd();
		};

		ImageEditorRenderer.renderTransformHandlers = function(oRm) {
			oRm.openStart("div").class("sapSuiteUiCommonsImageEditorTransformHandlers").openEnd();
			Object.keys(HANDLER_CLASSES).forEach(function (sKey) {
				this.renderTransformHandler(oRm, sKey);
			}, this);
			oRm.close("div");
		};

		ImageEditorRenderer.renderTransformHandler = function(oRm, sDirection) {
			var oHandlerClasses = HANDLER_CLASSES[sDirection],
				aClasses;

			oRm.openStart("div");

			aClasses = this.getCommonHandlerClasses(sDirection);
			aClasses.push("sapSuiteUiCommonsImageEditorHandlerContainer");

			aClasses.forEach(function (sClass) {
				oRm.class(sClass);
			});

			oRm.openEnd();

			oHandlerClasses.handlers.forEach(function (sHandler) {
				this.renderDiv(oRm, ["sapSuiteUiCommonsImageEditorHandler", "sapSuiteUiCommonsImageEditorHandler" + sHandler]);
			}, this);

			oRm.close("div");
		};

		ImageEditorRenderer.renderCropAreaDragHandler = function(oRm, oControl) {
			var oIcon = oControl._getCropAreaDragIcon();

			oRm.openStart("div")
				.class("sapSuiteUiCommonsImageEditorDragHandlerContainer")
				.openEnd();

			oRm.renderControl(oIcon);

			oRm.close("div");
		};

		ImageEditorRenderer.renderCropAreaResizeHandlers = function(oRm) {
			Object.keys(HANDLER_CLASSES).forEach(function(sKey) {
				this.renderCropAreaResizeHandler(oRm, sKey);
			}, this);
		};

		ImageEditorRenderer.renderCropAreaResizeHandler = function(oRm, sDirection) {
			var oHandlerClasses = HANDLER_CLASSES[sDirection],
				aClasses;

			oRm.openStart("div");

			aClasses = this.getCommonHandlerClasses(sDirection);
			aClasses.push("sapSuiteUiCommonsImageEditorHandlerContainer");
			oHandlerClasses.types.forEach(function (sType) {
				aClasses.push("sapSuiteUiCommonsImageEditorCropItem" + sType);
			});

			aClasses.forEach(function (sClass) {
				oRm.class(sClass);
			});

			oRm.openEnd();

			oHandlerClasses.handlers.forEach(function (sHandler) {
				this.renderDiv(oRm, ["sapSuiteUiCommonsImageEditorHandler", "sapSuiteUiCommonsImageEditorHandler" + sHandler]);
			}, this);

			oRm.close("div");
		};

		ImageEditorRenderer.renderDiv = function(oRm, aClasses) {
			oRm.openStart("div");

			aClasses.forEach(function (sClass) {
				oRm.class(sClass);
			});

			oRm.openEnd();
			oRm.close("div");
		};

		ImageEditorRenderer.renderZoneResizeHandlers = function(oRm) {
			Object.keys(HANDLER_CLASSES).forEach(function(sKey) {
				this.renderZoneResizeHandler(oRm, sKey);
			}, this);
		};

		ImageEditorRenderer.renderZoneResizeHandler = function(oRm, sDirection) {
			var aClasses = this.getCommonHandlerClasses(sDirection);
			aClasses.push("sapSuiteUiCommonsImageEditorZoneResizeHandler");

			this.renderDiv(oRm, aClasses);
		};

		ImageEditorRenderer.getCommonHandlerClasses = function(sDirection) {
			var oHandlerClasses = HANDLER_CLASSES[sDirection];

			return ["ui-resizable-handle", "ui-resizable-" + sDirection,
				oHandlerClasses.vertical, oHandlerClasses.horizontal];
		};

		return ImageEditorRenderer;

	}, /* bExport= */ true);
