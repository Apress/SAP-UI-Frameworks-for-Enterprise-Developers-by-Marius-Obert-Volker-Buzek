/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

sap.ui.define(["./sapvbi"]
, function() {
	"use strict";

/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
VBI.SupportedUnitsOfLength = [
	{
		RequestedUnit: "km",
		DisplayUnitDefault: "m",
		DisplayUnit2: "km",
		ConvFactor: 1000.0,
		ConvFactorMeter: 1.0
	}, {
		RequestedUnit: "mi",
		DisplayUnitDefault: "ft",
		DisplayUnit2: "mi",
		ConvFactor: 5280.0,
		ConvFactorMeter: 0.3048
	}, {
		RequestedUnit: "nm",
		DisplayUnitDefault: "ft",
		DisplayUnit2: "nm",
		ConvFactor: 6076.12,
		ConvFactorMeter: 0.3048
	}
];
VBI.Scale = function() {
	var scale = {};
	scale.scene = null;
	scale.m_ID = null;
	scale.m_Image = null;
	scale.m_CurrentUnit = null;
	scale.m_DisplayUnit = null;
	scale.m_nDivider = 0;
	scale.m_nScalerLength = 0;
	scale.m_nDistance = 0;
	scale.m_bRtl = false;
	scale.clear = function() {

		var item = document.getElementById(scale.m_canvas.id);
		if (item) {
			item.parentNode.removeChild(item);
		}

		scale.m_Image = null;
		// remove scene reference..............................................//
		scale.scene = null;
	};

	scale.Awake = function(scene, target) {
		scale.scene = scene;
		var l_vbiObj = jQuery.sap.byId(target);
		scale.m_ID = jQuery(l_vbiObj).attr('id');
		scale.AppendCanvas();
	};

	scale.getId = function(a, b) {
		return b + '-' + a;
	};

	scale.AppendCanvas = function() {
		scale.m_bRtl = (document.dir == 'rtl') ? true : false;
		scale.m_canvas = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		scale.m_canvas.setAttribute("role", sap.ui.core.AccessibleRole.Note);
		scale.m_canvas.setAttribute("class", "vbi-scale");
		scale.m_canvas.setAttribute("id", scale.getId('vbi-scale-canvas', scale.m_ID));
		scale.m_canvas.m_VBIType = "S";

		scale.scene.m_MapDecoDiv.appendChild(scale.m_canvas);
	};

	scale.getConfig = function() {
		if (scale.m_CurrentUnit) {
			return scale.m_CurrentUnit;
		} else {
			var context = scale.scene.m_Ctx;
			var config, unit;
			if (context) {
				config = context.GetConfig();
			}
			if (config) {
				unit = config.GetData("UnitOfLength");
			}
			if (unit) {
				for (var nJ = 0; nJ < VBI.SupportedUnitsOfLength.length; ++nJ) {
					if (VBI.SupportedUnitsOfLength[nJ].RequestedUnit == unit) {
						scale.m_CurrentUnit = VBI.SupportedUnitsOfLength[nJ];
						break;
					}
				}
			}
		}
		if (!scale.m_CurrentUnit) {
			scale.m_CurrentUnit = VBI.SupportedUnitsOfLength[0];
		}
		return scale.m_CurrentUnit;
	};

	scale.getImage = function(lcb) {
		if (scale.m_Image) {
			return scale.m_Image;
		}

		var img = new Image();
		if (lcb) {
			img.onload = function() {
				if (typeof lcb === 'function') {
					lcb(img);
				}

				this.onload = null;
			};
		}

		img.src = sap.ui.resource("sap.ui.vbm", "themes/base/img/sapvisualbusiness.png");
		scale.m_Image = img;
		return img;
	};

	scale.CalcScaleDimensions = function() {
		if (scale.scene.m_Canvas[0].m_nCurrentLOD < 1) {
			return false;
		}
		var rect = scale.scene.GetInternalDivClientRect();

		var currentUnit = scale.getConfig();
		var ptStart = [
			parseInt(rect.width / 2 - 75, 10), parseInt(rect.height / 2, 10)
		];
		var ptMax = [
			ptStart[0] + 180, ptStart[1]
		];

		var dist = scale.scene.GetDistance(ptStart, ptMax);
		var displayDist;
		// convert to requested unit of length
		dist = dist * (1.0 / currentUnit.ConvFactorMeter);
		if (dist >= currentUnit.ConvFactor) {
			displayDist = parseInt(dist / currentUnit.ConvFactor, 10);
			scale.m_DisplayUnit = currentUnit.DisplayUnit2;
		} else {
			displayDist = dist;
			scale.m_DisplayUnit = currentUnit.DisplayUnitDefault;
		}

		var logarithm = parseInt(Math.log(displayDist) / Math.LN10, 10);

		displayDist = parseInt(displayDist / Math.pow(10, logarithm), 10);
		if (displayDist < 2) {
			displayDist = 1;
		} else if (displayDist < 5) {
			displayDist = 2;
		} else if (displayDist < 10) {
			displayDist = 5;
		}
		displayDist = parseInt(displayDist * Math.pow(10, logarithm), 10);

		// convert back
		var displayDistConv; // converted back into meters
		if (dist >= currentUnit.ConvFactor) {
			displayDistConv = displayDist * currentUnit.ConvFactor;
			displayDistConv = displayDistConv * currentUnit.ConvFactorMeter;
		} else {
			displayDistConv = displayDist * currentUnit.ConvFactorMeter;
		}

		// convert point to canvas ( apply offset )

// var ptStartOffset = [
// ptStart[0] - scale.scene.m_Canvas[0].getPixelLeft(), ptStart[1] - scale.scene.m_Canvas[0].getPixelTop()
// ];
		var ret = scale.scene.GetTargetPointForDistance(displayDistConv, ptStart);
		var ptEnd = [
			ret[0] + scale.scene.m_Canvas[0].getPixelLeft(), ret[1] + scale.scene.m_Canvas[0].getPixelTop()
		];

		// calculate the divider
		var tempDist = displayDist;
		var nDivider = 0;
		while (nDivider == 0 && tempDist > 0) {
			nDivider = tempDist % 5;
			tempDist /= 10;
		}
		if (nDivider != 2) {
			nDivider = 5;
		}

		// the scaler length
		var nScalerLength = Math.round(ptEnd[0] - ptStart[0]);

		// cross check
		// var nScalerLengthWithoutCorr = parseInt(((ptMax[0] - ptStart[0]) * displayDistConv) / dist, 10);

		if (nScalerLength > 60 && nScalerLength < (rect.right - rect.left)) {
			scale.m_nScalerLength = nScalerLength;
			scale.m_nDistance = displayDist;
			scale.m_nDivider = nDivider;
			return true;
		}

		return false;

	};

	scale.Update = function() {
		//Update the scale dimensions
		scale.CalcScaleDimensions();

		//pixelLength means how many pixels long the scale bar should be;
		//We perform division by 2 on both the scale bar length and the
		//real-world distance so the bar becomes smaller. This is done for
		//design & aesthetics purposes.
		var pixelLength = (scale.m_nScalerLength + scale.m_nDivider) / 2,
			//The real-world distance represented by the scale bar.
			distance = scale.m_nDistance / 2;

		//creating the svg container where the scale will be rendered
		var svg = document.getElementById(scale.m_canvas.id);
		if (svg) {

			svg.setAttribute("height", 15);
			svg.setAttribute("width", pixelLength + 1);
			//Clearing the previous scale
			jQuery(svg).empty();


			//This is the actual scale bar
			var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path.setAttribute("d", "M 1 4 V 10 H " + pixelLength + " V 4");
			path.setAttribute("stroke", "black");
			path.setAttribute("stroke-width", 2);
			path.setAttribute("fill", "none");
			svg.appendChild(path);

			//This is the scale text. For example: "500 km"
			var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
			//How far from the right/left edge we position the text
			var textPositionX;
			//calculating position differently if we are in right-to-left mode
			if (document.dir === "rtl") {
				textPositionX = (distance.toString().length + scale.m_DisplayUnit.length + 1) * 6 + 2;
			} else {
				textPositionX = pixelLength - 2 - (distance.toString().length + scale.m_DisplayUnit.length + 1) * 6;
			}

			text.setAttribute("x", textPositionX);
			text.setAttribute("y", 8);
			text.setAttribute("font-size", 10);
			text.textContent = distance + " " + scale.m_DisplayUnit;
			svg.appendChild(text);
		}
	};

	return scale;
};

});
