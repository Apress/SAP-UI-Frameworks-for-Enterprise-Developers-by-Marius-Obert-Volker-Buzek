/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// utilities object
// Author: Ulrich Roegelein
// this module is just a utility collection

sap.ui.define(["./sapvbi"]
, function() {
	"use strict";

VBI.Utilities = VBI.Utilities || {};
/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
// ...........................................................................//
// HTMLCanvasElement element prototyes.......................................//
HTMLCanvasElement.prototype.getPixelWidth = function() {
	if (this.m_pixelWidth) {
		return this.m_pixelWidth;
	}

	if (this.style.pixelWidth !== undefined) {
		return this.style.pixelWidth;
	}
	return parseInt(this.style.width, 10); // due to ff
};

HTMLCanvasElement.prototype.getPixelHeight = function() {
	if (this.m_pixelHeight) {
		return this.m_pixelHeight;
	}

	if (this.style.pixelHeight !== undefined) {
		return this.style.pixelHeight;
	}

	return parseInt(this.style.height, 10); // due to ff
};

HTMLCanvasElement.prototype.getPixelLeft = function() {
	if (this.m_pixelLeft) {
		return this.m_pixelLeft;
	}
	if (this.style.pixelLeft !== undefined) {
		return this.style.pixelLeft;
	}
	return parseInt(this.style.left, 10); // due to ff
};

HTMLCanvasElement.prototype.getPixelTop = function() {
	if (this.m_pixelTop) {
		return this.m_pixelTop;
	}

	if (this.style.pixelTop !== undefined) {
		return this.style.pixelTop;
	}

	return parseInt(this.style.top, 10); // due to ff
};

HTMLCanvasElement.prototype.setPixelWidth = function(val) {
	this.m_pixelWidth = val;

	if (this.style.pixelWidth !== undefined) {
		this.style.pixelWidth = val;
	} else {
		this.style.width = val + 'px';
	}
};

HTMLCanvasElement.prototype.setPixelHeight = function(val) {
	this.m_pixelHeight = val;

	if (this.style.pixelHeight !== undefined) {
		this.style.pixelHeight = val;
	} else {
		this.style.height = val + 'px';
	}
};

HTMLCanvasElement.prototype.setPixelLeft = function(val) {
	this.m_pixelLeft = val;

	if (this.style.pixelLeft !== undefined) {
		this.style.pixelLeft = val;
	} else {
		this.style.left = val + 'px';
	}
};

HTMLCanvasElement.prototype.setPixelTop = function(val) {
	this.m_pixelTop = val;
	if (this.style.pixelTop !== undefined) {
		this.style.pixelTop = val;
	} else {
		this.style.top = val + 'px';
	}
};

// ...........................................................................//
// create a dummy element....................................................//

VBI.Utilities.CreateWifiObject = function() {
	var newElement = document.createElement('object');
	if (!newElement) {
		return null;
	}

	newElement.classid = "CLSID:00100000-2013-0070-2000-651572487E69";
	return newElement;
};

VBI.Utilities.CreateDOMElement = function(type, id, width, height) {
	var newElement = document.createElement(type);
	newElement.style.height = width ? width : "1px";
	newElement.style.width = height ? height : "1px";
	newElement.id = id;

	return newElement;
};

VBI.Utilities.GetDOMElement = function(args) {
	var elements = [];

	for (var i = 0, len = arguments.length; i < len; i++) {
		var element = arguments[i];
		if (typeof element == 'string') {
			element = document.getElementById(element);
		}
		if (arguments.length == 1) {
			return element;
		}
		elements.push(element);
	}
	return elements;
};

// ...........................................................................//
// create a new DOM element..................................................//

VBI.Utilities.CreateDOMVBIDivElement = function(id, width, height) {
	// <div id="myDiv" style="overflow:hidden;position:absolute;left:0px;top:0px;width:300px;height:300px">

	var newElement = document.createElement('div');
	newElement.setAttribute("role", sap.ui.core.AccessibleRole.Secondary);
	newElement.id = id;
	newElement.style.height = "300x";
	newElement.style.width = "300px";
	newElement.style.overflow = "hidden";
	newElement.style.position = "absolute";
	newElement.style.left = "0px";
	newElement.style.top = "0px";

	return newElement;
};

VBI.Utilities.Create3DSceneDiv = function(id) {
	var newElement = document.createElement('div');
	newElement.setAttribute("role", sap.ui.core.AccessibleRole.Img);

	newElement.id = id;
	newElement.style.left = "0px";
	newElement.style.top = "0px";
	newElement.style.width = "100%";
	newElement.style.height = "100%";
	newElement.style.position = "relative";
	newElement.style.overflow = "hidden";

	return newElement;
};

VBI.Utilities.Create3DSceneCanvas = function(id, width, height, zindex, tabindex, isNonDOM) {
	var newElement = document.createElement('canvas');
	newElement.setAttribute("role", sap.ui.core.AccessibleRole.Img);

	newElement.id = id;

	newElement.m_pixelLeft = newElement.m_pixelTop = 0;
	newElement.width = newElement.m_pixelWidth = width ? width : 512;
	newElement.height = newElement.m_pixelHeight = height ? height : 512;

	newElement.style.left = newElement.style.top = "0px";
	newElement.style.width = newElement.m_pixelWidth + "px";
	newElement.style.height = newElement.m_pixelHeight + "px";
	newElement.style.position = "absolute";
	newElement.style.zIndex = zindex;
	newElement.style.touchaction = "none";
	newElement.className = "vbi-3Dscenecanvas";

	newElement.m_bNotInDOM = (isNonDOM != undefined ? isNonDOM : false);
	newElement.m_CanvasValid = !newElement.m_bNotInDOM; // nonDomCanvases must be set to valid explicitely

	if (newElement.m_bNotInDOM) {
		newElement.m_nMoveCount = 0;
	}

	if (tabindex != undefined) {
		newElement.tabIndex = tabindex;
	}
	return newElement;
};

VBI.Utilities.CreateGeoSceneCanvas = function(id, width, height, tabindex, isNonDOM, addClasses, ariaLabel) {
	var newElement = document.createElement('canvas');
	newElement.setAttribute("role", sap.ui.core.AccessibleRole.Img);

	newElement.id = id;

	newElement.m_pixelLeft = newElement.m_pixelTop = 0;
	newElement.width = newElement.m_pixelWidth = width ? width : 512;
	newElement.height = newElement.m_pixelHeight = height ? height : 512;

	newElement.style.left = newElement.style.top = "0px";
	newElement.style.width = newElement.m_pixelWidth + "px";
	newElement.style.height = newElement.m_pixelHeight + "px";
	newElement.style.position = "absolute";
	newElement.style.touchaction = "none";
	newElement.className = "vbi-geoscenecanvas";
	if (addClasses) {
		newElement.className += " " + addClasses;
	}

	if (ariaLabel) {
		newElement.setAttribute("aria-label", ariaLabel);
	}

	newElement.m_bNotInDOM = (isNonDOM != undefined ? isNonDOM : false);
	newElement.m_CanvasValid = !newElement.m_bNotInDOM; // nonDomCanvases must be set to valid explicitely
	newElement.m_VBIType = "L";

	if (newElement.m_bNotInDOM) {
		newElement.m_nMoveCount = 0;
	}

	if (tabindex != undefined) {
		newElement.tabIndex = tabindex;
	}

	return newElement;
};

// ...........................................................................//
// 2D element creators.......................................................//

// mapping of align values...................................................//
VBI.Utilities.Align = [
	'', 'left', 'center', '', 'right'
];

VBI.Utilities.CreateCaption = function(id, text, left, top, right, bottom, tooltip, design, level, align) {
	// create the frame.......................................................//
	var newElement = document.createElement('div');
	newElement.setAttribute("role", sap.ui.core.AccessibleRole.Note);
	newElement.id = id;
	newElement.style.left = left + "px";
	newElement.style.top = top + "px";
	newElement.style.width = (right - left).toString() + "px";
	newElement.style.height = (bottom - top).toString() + "px";
	newElement.style.textAlign = VBI.Utilities.Align[align];
	newElement.style.title = tooltip;

	// dependent on design and level the font size and bold state changes.....//
	switch (level) {
		// zu tun: add other styles..............................................//
		case 3:
			newElement.style.fontSize = "14px";
			newElement.style.fontWeight = "bold";
			break;
	}

	newElement.className = "vbi-2d-caption vbi-2d-common";
	newElement.innerHTML = jQuery.sap.encodeHTML(text);
	return newElement;
};

VBI.Utilities.CreateLabel = function(id, text, left, top, right, bottom, tooltip, align) {
	// create the frame.......................................................//
	var newElement = document.createElement('div');
	newElement.setAttribute("role", sap.ui.core.AccessibleRole.Description);
	newElement.id = id;
	newElement.style.left = left + "px";
	newElement.style.top = top + "px";
	newElement.style.width = (right - left).toString() + "px";
	newElement.style.height = (bottom - top).toString() + "px";
	newElement.style.textAlign = VBI.Utilities.Align[align];
	newElement.style.title = tooltip;
	newElement.className = "vbi-2d-label vbi-2d-common";
	newElement.innerHTML = jQuery.sap.encodeHTML(text);
	return newElement;
};

VBI.Utilities.CreateLink = function(id, text, left, top, right, bottom, href, tooltip, align) {
	// create the frame.......................................................//
	var newElement = document.createElement('a');
	newElement.setAttribute("role", sap.ui.core.AccessibleRole.Link);
	newElement.id = id;
	newElement.style.left = left + "px";
	newElement.style.top = top + "px";
	newElement.style.width = (right - left).toString() + "px";
	newElement.style.height = (bottom - top).toString() + "px";
	newElement.style.textAlign = VBI.Utilities.Align[align];
	newElement.className = "vbi-2d-link vbi-2d-common";
	newElement.href = href ? href : "javascrip" + "t:void(0)"; // separated to fool ESLint
	newElement.title = tooltip;
	newElement.innerHTML = jQuery.sap.encodeHTML(text);
	return newElement;
};

VBI.Utilities.CreateImage = function(id, img, left, top, right, bottom, tooltip, align) {
	// image is assumed to be a dom element located in the resources..........//
	// var newElement = document.createElement('img');
	var newElement = img.cloneNode(true);
	newElement.setAttribute("role", sap.ui.core.AccessibleRole.Img);
	newElement.id = id;
	newElement.style.left = left + "px";
	newElement.style.top = top + "px";
	newElement.style.width = (right - left).toString() + "px";
	newElement.style.height = (bottom - top).toString() + "px";
	newElement.style.textAlign = VBI.Utilities.Align[align];
	newElement.className = "vbi-2d-image vbi-2d-common";
	newElement.title = tooltip;
	return newElement;
};

VBI.Utilities.CreateButton = function(id, text, left, top, right, bottom, tooltip, align) {
	// create the frame.......................................................//
	var newElement = document.createElement('button');
	newElement.id = id;
	newElement.style.left = left + "px";
	newElement.style.top = top + "px";
	newElement.style.width = (right - left).toString() + "px";
	newElement.style.height = (bottom - top).toString() + "px";
	newElement.style.textAlign = VBI.Utilities.Align[align];
	newElement.className = "vbi-2d-button vbi-2d-common";
	newElement.innerHTML = jQuery.sap.encodeHTML(text);
	newElement.title = tooltip;
	return newElement;
};

VBI.Utilities.CreateContainer = function(id, key, left, top, width, height, tooltip, bOmitClass) {
	// create the container...................................................//
	var newElement = document.createElement('div');
	newElement.setAttribute("role", sap.ui.core.AccessibleRole.Group);
	newElement.id = id;
	newElement.style.left = left + "px";
	newElement.style.top = top + "px";
	newElement.title = tooltip;
	newElement.style.position = "absolute";
	if (!bOmitClass) {
		newElement.className = "vbi-container-vo";
	}
	newElement.m_Key = key;

	return newElement;
};

// ...........................................................................//
// callout container.........................................................//
VBI.Utilities.CreateDetailPhone = function(id, left, top, width, height, titletext, padding) {
	// create the detail frame................................................//
	var detail = document.createElement('div');
	detail.setAttribute("role", sap.ui.core.AccessibleRole.Directory);
	detail.id = id;
	detail.style.left = left + "px";
	detail.style.top = top + "px";

	var paddingPhone = 12;
	var spacingPhone = 6;
	var headerFontSizePhone = 14;
	paddingPhone = VBI.Utilities.RemToPixel(0.750);
	spacingPhone = VBI.Utilities.RemToPixel(0.375);
	headerFontSizePhone = VBI.Utilities.RemToPixel(0.875);

	if (height) {
		detail.style.minHeight = height + headerFontSizePhone + 4 + spacingPhone + 2 * paddingPhone + "px";
	}

	detail.className = ".vbi-detail vbi-detail-phone";

	// create the header,.....................................................//
	var header = document.createElement('div');
	header.setAttribute("role", sap.ui.core.AccessibleRole.Heading);
	header.id = id + "-window-header";
	header.className = "vbi-detail-header-phone";
	detail.appendChild(header);

	// create the title......................................................//
	var title = document.createElement('div');
	title.setAttribute("role", sap.ui.core.AccessibleRole.Heading);
	title.id = id + "-window-title";
	title.className = "vbi-detail-title-phone";
	title.innerHTML = jQuery.sap.encodeHTML(titletext);
	header.appendChild(title);

	// create the close.......................................................//
	var close = document.createElement('div');
	close.setAttribute("role", sap.ui.core.AccessibleRole.Button);
	close.id = id + "-window-close";
	close.className = "vbi-detail-closebutton vbi-detail-closebutton-tablet";
	header.appendChild(close);

	// create the content.....................................................//
	var content = document.createElement('div');
	content.setAttribute("role", sap.ui.core.AccessibleRole.Secondary);
	content.id = id + "-window-content";
	content.className = "vbi-detail-content";
	content.style.fontSize = VBI.Utilities.RemToPixel(0.875) + "px";
	// content.style.width = "100%";
	detail.appendChild(content);

	// return the created elements............................................//
	return {
		// add members................................................//
		m_Div: detail,
		m_Content: content,
		m_CloseButton: close,
		m_Arrow: null,
		GetAnchorPoint: null
	};

};

VBI.Utilities.CreateDetail = function(id, left, top, width, height, titletext, padding) {
	if (VBI.m_bIsPhone) {
		return (VBI.Utilities.CreateDetailPhone(id, left, top, width, height, titletext, padding));
	}

	// create the detail frame................................................//
	var detail = document.createElement('div');
	detail.setAttribute("role", sap.ui.core.AccessibleRole.Secondary);
	detail.id = id;
	detail.style.left = left + "px";
	detail.style.top = top + "px";

	// ask whether phone or not
	var bPhone = VBI.m_bIsPhone;
	// add the size of the decorators.........................................//
	if (!bPhone) {
		var paddingDesktop = 16;
		var spacingDesktop = 16;
		var headerFontSize = 16;
		paddingDesktop = VBI.Utilities.RemToPixel(1);
		spacingDesktop = VBI.Utilities.RemToPixel(1);
		headerFontSize = VBI.Utilities.RemToPixel(1);
		if (width) {
			detail.style.width = width + 2 * paddingDesktop + "px";
		}
		if (height) {
			detail.style.minHeight = height + headerFontSize + 4 + spacingDesktop + 2 * paddingDesktop + "px";
		}
	} else {
		var paddingPhone = 12;
		var spacingPhone = 6;
		var headerFontSizePhone = 14;
		paddingPhone = VBI.Utilities.RemToPixel(0.750);
		spacingPhone = VBI.Utilities.RemToPixel(0.375);
		headerFontSizePhone = VBI.Utilities.RemToPixel(0.875);

		if (height) {
			detail.style.minHeight = height + headerFontSizePhone + 4 + spacingPhone + 2 * paddingPhone + "px";
		}
	}

	detail.className = "vbi-detail vbi-detail-border";

	// create the header,.....................................................//
	var header = document.createElement('div');
	header.setAttribute("role", sap.ui.core.AccessibleRole.Heading);
	header.id = id + "-window-header";
	header.className = "vbi-detail-header";
	detail.appendChild(header);

	// create the title......................................................//
	var title = document.createElement('div');
	title.setAttribute("role", sap.ui.core.AccessibleRole.Heading);
	title.id = id + "-window-title";
	title.className = "vbi-detail-title";
	title.innerHTML = jQuery.sap.encodeHTML(titletext);
	header.appendChild(title);

	// create the close.......................................................//
	var close = document.createElement('div');
	close.setAttribute("role", sap.ui.core.AccessibleRole.Button);
	close.id = id + "-window-close";
	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.vbm.i18n");
	close.title = oResourceBundle.getText("WINDOW_CLOSE");
	close.setAttribute("aria-label", oResourceBundle.getText("WINDOW_CLOSE"));

	close.className = "vbi-detail-closebutton vbi-detail-closebutton-" + (VBI.m_bIsMobile ? "tablet" : "desktop");
	header.appendChild(close);

	// create the content.....................................................//
	var content = document.createElement('div');
	content.setAttribute("role", sap.ui.core.AccessibleRole.Secondary);
	content.id = id + "-window-content";
	content.className = "vbi-detail-content";
	// content.style.width = "100%";
	detail.appendChild(content);

	// set arrows.............................................................//
	var newB = document.createElement('b');
	newB.setAttribute("role", sap.ui.core.AccessibleRole.Presentation);
	newB.className = "vbi-detail-arrow vbi-detail-left vbi-detail-border-arrow";
	if (!bPhone) {
		detail.appendChild(newB);
	}
	var newBArrow;
	newBArrow = document.createElement('b');
	newBArrow.setAttribute("role", sap.ui.core.AccessibleRole.Presentation);
	newBArrow.className = "vbi-detail-arrow vbi-detail-left";
	if (!bPhone) {
		detail.appendChild(newBArrow);
	}

	// return the created elements............................................//
	return {
		// add members................................................//
		m_Div: detail,
		m_Content: content,
		m_CloseButton: close,
		m_Arrow: newBArrow,

		// append a calculation function to get the offsets to the....//
		// anchor point...............................................//
		GetAnchorPoint: function() {
			if (VBI.m_bIsRtl) {
				return [
					this.m_Arrow.offsetLeft + this.m_Arrow.offsetWidth + 2, this.m_Arrow.offsetTop + this.m_Arrow.offsetHeight / 2
				];
			} else {
				return [
					this.m_Arrow.offsetLeft, this.m_Arrow.offsetTop + this.m_Arrow.offsetHeight / 2
				];
			}
			// return [ -this.m_Arrow.offsetLeft, -this.m_Arrow.offsetTop ];
		}
	};
};

VBI.Utilities.CreateLegendPhone = function(id, left, top, width, height, titletext, padding) {
};

VBI.Utilities.CreateLegend = function(id, top, titletext, padding, bClickRow) {
	// if (VBI.m_bIsPhone)
	// return ( VBI.Utilities.CreateLegendPhone( id, right, top, titletext, padding ) );
	// create the legend frame................................................//
	var legend = document.createElement('div');
	legend.setAttribute("role", sap.ui.core.AccessibleRole.Group);
	legend.setAttribute("tabindex", "0");
	legend.id = id;
	if (VBI.m_bIsRtl) {
		legend.style.left = "0px";
		legend.style.right = "";
	} else {
		legend.style.right = "0px";
		legend.style.left = "";
	}
	// legend.style.right = right + "px";
	legend.style.top = top + "px";

// var paddingDesktop = 16;
// var spacingDesktop = 16;
// var headerFontSize = 16;
// paddingDesktop = VBI.Utilities.RemToPixel( 1 );
// spacingDesktop = VBI.Utilities.RemToPixel( 1 );
// headerFontSize = VBI.Utilities.RemToPixel( 1 );

	legend.className = "vbi-legend";
	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.vbm.i18n");

	// create the buttons to collapse/expand the legend .......................//
	var bt1 = document.createElement('div');
	bt1.id = id + "-button-collapse";
	bt1.title = oResourceBundle.getText("LEGEND_COLLAPSE");
	bt1.setAttribute("role", sap.ui.core.AccessibleRole.Button);
	bt1.setAttribute("aria-label", bt1.title);

	bt1.className = "vbi-legend-button vbi-legend-button-col";
	legend.appendChild(bt1);

	var bt2 = document.createElement('div');
	bt2.id = id + "-button-expand";
	bt2.title = oResourceBundle.getText("LEGEND_EXPAND");
	bt2.setAttribute("role", sap.ui.core.AccessibleRole.Button);
	bt2.setAttribute("aria-label", bt2.title);

	bt2.className = "vbi-legend-button vbi-legend-button-exp";
	legend.appendChild(bt2);
	bt2.style.visibility = 'hidden';

	// create the header,.....................................................//
	var header = document.createElement('div');
	header.id = id + "-header";
	header.className = "vbi-legend-header";
	header.setAttribute("role", sap.ui.core.AccessibleRole.Presentation);
	legend.appendChild(header);

	// create the title......................................................//
	var title = document.createElement('div');
	title.setAttribute("role", sap.ui.core.AccessibleRole.Heading);
	title.id = id + "-title";
	title.className = "vbi-legend-title";
	title.innerHTML = jQuery.sap.encodeHTML(titletext);
	header.appendChild(title);

	// create the content.....................................................//
	var content = document.createElement('div');
	content.setAttribute("role", sap.ui.core.AccessibleRole.Presentation);
	content.id = id + "-content";
	content.className = "vbi-legend-content";
	legend.appendChild(content);
	var table = document.createElement('table');
	table.setAttribute("role", sap.ui.core.AccessibleRole.Grid);
	table.setAttribute("tabindex", "0");
	table.id = id + "-table";
	table.className = bClickRow ? "vbi-legend-table vbi-legend-table-click" : "vbi-legend-table";
	content.appendChild(table);

	// return the created elements............................................//
	return {
		// add members................................................//
		m_Div: legend,
		m_Header: header,
		m_Content: content,
		m_Table: table,
		m_ButtonCol: bt1,
		m_ButtonExp: bt2
	};
};

VBI.Utilities.CreateGeoSceneDivCSS = function(id, classname, title) {
	var newElement = document.createElement('div');
	newElement.id = id;
	if (classname) {
		newElement.className = classname;
	}
	if (title) {
		newElement.title = title;
	}
	return newElement;
};

VBI.Utilities.CreateDOMColorShiftedImageFromData = function(data, imgType, rhls1, rhls2, lcb) {
	// the function will create an image......................................//
	// the lcb is the load callback...........................................//
	// it is required for hue shifted images..................................//
	// the rhls1 is usually the select color shift............................//
	// the rhls2 is usually the hue color shift...............................//

	var rgba1 = null, hls1 = rhls1 ? VBI.Types.string2rhls(rhls1) : null;
	if (!hls1) {
		rgba1 = rhls1 ? VBI.Types.string2rgba(rhls1) : null;
	}

	var rgba2 = null, hls2 = rhls2 ? VBI.Types.string2rhls(rhls2) : null;
	if (!hls2) {
		rgba2 = rhls2 ? VBI.Types.string2rgba(rhls2) : null;
	}

	var tmp = document.createElement('img');
	var img = document.createElement('img');
	if (lcb) {
		tmp.onload = function() {
			if (typeof lcb === 'function') {
				lcb(tmp);
			}

			this.onload = null;
		};

		img.onload = function() {
			// create a canvas and raw the image into it........................//
			var cv = document.createElement("canvas");
			var ctx = cv.getContext("2d");
			cv.width = img.width;
			cv.height = img.height;
			ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, img.width, img.height);

			// get the data.....................................................//
			var pxls = ctx.getImageData(0, 0, img.width, img.height);
			var data = pxls.data;

			function applypixelcolor(data, offset, hlsa, rgba) {
				var r = data[offset];
				var g = data[offset + 1];
				var b = data[offset + 2];
				var a = data[offset + 3];

				if (hlsa) {
					var hls = VBI.Utilities.RGB2HLS(r, g, b);
					var rgb = VBI.Utilities.HLS2RGB(hls[0] + hlsa[0], hls[1] * hlsa[1], hls[2] * hlsa[2]);
					data[offset] = Math.min(Math.round(rgb[0]), 255);
					data[offset + 1] = Math.min(Math.round(rgb[1]), 255);
					data[offset + 2] = Math.min(Math.round(rgb[2]), 255);
					data[offset + 3] = Math.min(Math.round(hlsa[3] * a), 255);
				} else if (rgba) {
					data[offset] = rgba[0];
					data[offset + 1] = rgba[1];
					data[offset + 2] = rgba[2];
					if (data[offset + 3]) {
						data[offset + 3] = rgba[4] ? Math.floor(Math.min(rgba[3] * 255, 255)) : 255;
					}
				}
			}

			for (var nJ = 0, len = (img.width * img.height); nJ < len; ++nJ) {
				var offset = nJ * 4;

				// apply rhls1 first.............................................//
				if (hls1 || rgba1) {
					applypixelcolor(data, offset, hls1, rgba1);
				}

				// apply rhls2 second............................................//
				if (hls2 || rgba2) {
					applypixelcolor(data, offset, hls2, rgba2);
				}
			}

			ctx.putImageData(pxls, 0, 0);
			tmp.src = cv.toDataURL("image/png");

			this.onload = null;
		};
	}
	// check if data is already a data url....................................//
	img.src = ((data.indexOf("data:image") == 0) ? data : ("data:image" + imgType + ";base64," + data));

	return tmp;
};

VBI.Utilities.CreateDOMImageFromData = function(data, imgType, lcb) {
	// the function will create an image......................................//
	// the lcb is the load callback...........................................//

	var img = document.createElement('img');
	if (lcb) {
		img.onload = function() {
			if (typeof lcb === 'function') {
				lcb(img);
			}
			this.onload = null;
		};
	}

	// check if data is already a data url....................................//
	img.src = ((data.indexOf("data:image") == 0) ? data : ("data:image" + imgType + ";base64," + data));
	return img;
};

VBI.Utilities.GetTransparentImage = function() {
	// the function will create a one pixel transparent image.................//
	// the lcb is the load callback...........................................//

	var transparentPixelData = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
	if (!this.m_TransparentImage) {
		this.m_TransparentImage = VBI.Utilities.CreateDOMImageFromData(transparentPixelData, '/png', /* scene.RenderAsync.bind( ) */null);
		this.m_TransparentImage.id = "TransparentImage";
	}
	return this.m_TransparentImage;
};

// ...........................................................................//
// rectangle functions.......................................................//

VBI.Utilities.PtOnRect = function(pt, rect) {
	return ((pt[0] >= rect[0]) && (pt[0] <= rect[2]) && (pt[1] >= rect[1]) && (pt[1] <= rect[3])) ? true : false;
};

VBI.Utilities.PtInRect = function(pt, rect) {
	return ((pt[0] > rect[0]) && (pt[0] < rect[2]) && (pt[1] > rect[1]) && (pt[1] < rect[3])) ? true : false;
};

VBI.Utilities.RectIntersect = function(rc1, rc2) {
	// determine whether the two provided rectangles intersect each other.....//
	return !(rc2[0] > rc1[2] || rc2[2] < rc1[0] || rc2[3] < rc1[1] || rc2[1] > rc1[3]);
};

VBI.Utilities.RectOffset = function(rc, nX, nY) {
	rc[0] += nX;
	rc[1] += nY;
	rc[2] += nX;
	rc[3] += nY;
};

VBI.Utilities.cImg;
VBI.Utilities.GetImagePixelData = function(img) {
	if (!VBI.Utilities.cImg) {
		VBI.Utilities.cImg = document.createElement('canvas');
	}
	VBI.Utilities.cImg.width = img.naturalWidth;
	VBI.Utilities.cImg.height = img.naturalHeight;
	VBI.Utilities.cImg.style.width = (img.naturalWidth + "px");
	VBI.Utilities.cImg.style.height = (img.naturalHeight + "px");
	VBI.Utilities.cImg.style.top = "0px";
	VBI.Utilities.cImg.style.left = "0px";
	VBI.Utilities.cImg.style.position = "absolute";
	var ctx = VBI.Utilities.cImg.getContext("2d");
	ctx.drawImage(img, 0, 0);
	var imgData = ctx.getImageData(0, 0, VBI.Utilities.cImg.width, VBI.Utilities.cImg.height);
	return imgData;
};

VBI.Utilities.pointOnLine = function(poly, x, y, dist, closed) {
	// check if a point is near the line, it returns the segment that fits....//
	// when no segment fits the returned object has edge set to -1............//
	// when no node fits the returned object has node set to -1...............//
	// the return is an object which contains the edge and the node...........//
	// when the closed parameter is set, the segment between the start and....//
	// endpoint are getting checked as well...................................//

	function sqDist(v1, v2) {
		return ((v1[0] - v2[0]) * (v1[0] - v2[0]) + (v1[1] - v2[1]) * (v1[1] - v2[1]));
	}

	var ret = -1, node = -1, sqdist = dist * dist, sqtemp = sqdist;
	var tmp, v1, v2;
	var funcSqDist = VBI.Utilities.sqDistance;
	var nJ, len;

	for (nJ = 0, len = poly.length - 1; nJ < len; ++nJ) {
		v1 = poly[nJ];
		v2 = poly[nJ + 1];

		if ((tmp = funcSqDist(v1[0], v1[1], v2[0], v2[1], x, y)) < sqdist) {
			sqdist = tmp;
			ret = nJ;
		}
	}

	// check if the two points to detect the node where the click is..........//
	if (ret >= 0) {
		// check the anchor points of segment..................................//
		if ((tmp = sqDist([
			x, y
		], poly[ret])) < sqtemp) {
			sqtemp = tmp;
			node = ret;
		}
		if (sqDist([
			x, y
		], poly[ret + 1]) < sqtemp) {
			sqtemp = tmp;
			node = ret + 1;
		}
	}

	if (closed && (len > 0)) { // a closed line is expected.................//
		v1 = poly[0];
		v2 = poly[len];

		if ((tmp = funcSqDist(v1[0], v1[1], v2[0], v2[1], x, y)) < sqdist) {
			sqdist = tmp;
			ret = nJ;
		}

		// check if the two points to detect the node where the click is..........//
		if (ret >= 0) {
			// check the anchor points of segment..................................//
			if ((tmp = sqDist([
				x, y
			], poly[ret])) < sqtemp) {
				sqtemp = tmp;
				node = ret;
			}
			if (sqDist([
				x, y
			], poly[0]) < sqtemp) {
				sqtemp = tmp;
				node = 0;
			}
		}
	}

	return {
		m_edge: ret,
		m_node: node
	};
};

VBI.Utilities.polyInPolygon = function(outerPoly, innerPoly, iO) {
	// instance offsets are applied for innerPoly

	var bHit = false, bIntersect = false;
	for (var nI = iO.length - 1; nI >= 0; --nI) {
		// loop for round world instances
		var off = iO[nI];
		bHit = false;
		// check if one point of polygon lies inside lasso
		if ((VBI.Utilities.pointInPolygon(outerPoly, innerPoly[0][0] + off, innerPoly[0][1]))) {
			bHit = true;
			// check if outer and inner polygon have no intersection
			for (var nK = 0; nK < innerPoly.length && bHit && !bIntersect; ++nK) {
				var ptI1 = [
					innerPoly[nK][0] + off, innerPoly[nK][1]
				];
				var ptI2 = (nK + 1 == innerPoly.length) ? [
					innerPoly[0][0] + off, innerPoly[0][1]
				] : [
					innerPoly[nK + 1][0] + off, innerPoly[nK + 1][1]
				];
				var ptO1, ptO2;
				bIntersect = false;
				for (var nM = 0; nM < outerPoly.length; ++nM) {
					ptO1 = outerPoly[nM];
					ptO2 = (nM + 1 == outerPoly.length) ? outerPoly[0] : outerPoly[nM + 1];
					if ((VBI.Utilities.LineLineIntersection(ptI1, ptI2, ptO1, ptO2, true))) {
						bIntersect = true;
					}
				}
			}
		}
		if (bHit && !bIntersect) {
			break;
		}
	}
	return (bHit && !bIntersect);

};

VBI.Utilities.pointInPolygon = function(poly, x, y) {
	// We expect poly to have up to three dimensions [shape + exclusions][points][coords] -> multi parts to be treated separately (external)
	// We treat them recursively
	var v1, v2, len = poly.length;
	var c, nJ, l, hit, nK, nI;
	if (jQuery.type(poly[0]) == 'array') {
		if (jQuery.type(poly[0][0]) == 'array') {
			// shapes ( + exclusivion )
			c = this.pointInPolygon(poly[0], x, y); // first check for hit on base shape
			if (c) {
				for (hit = false, nI = 1, len = poly.length; !hit && nI < len; ++nI) { // check that hit is not on any exclusion
					hit = this.pointInPolygon(poly[nI], x, y);
					if (hit) {
						c = false; // hit on exclusion -> no hit on shape
					}
				}
			}
		} else { // single shape
			for (c = false, nJ = -1, l = len, nK = l - 1; ++nJ < l; nK = nJ) {
				v1 = poly[nJ];
				v2 = poly[nK];
				if (((v1[1] <= y && y < v2[1]) || (v2[1] <= y && y < v1[1])) && (x < (v2[0] - v1[0]) * (y - v1[1]) / (v2[1] - v1[1]) + v1[0])) {
					c = !c;
				}
			}
		}
	} else {
		for (c = false, nJ = 0, l = len, nK = l - 2; nJ <= l - 2; nJ += 2) {
			v1 = [
				poly[nJ], poly[nJ + 1]
			];
			v2 = [
				poly[nK], poly[nK + 1]
			];
			if (((v1[1] <= y && y < v2[1]) || (v2[1] <= y && y < v1[1])) && (x < (v2[0] - v1[0]) * (y - v1[1]) / (v2[1] - v1[1]) + v1[0])) {
				c = !c;
			}
			nK = nJ;
		}
	}
	return c;
};

VBI.Utilities.pointInTriangle = function(tri, pt) {
	var vx0 = tri[2][0] - tri[0][0]; // first plane spanning vector
	var vy0 = tri[2][1] - tri[0][1];
	var vx1 = tri[1][0] - tri[0][0]; // second plane spanning vector
	var vy1 = tri[1][1] - tri[0][1];
	var vx2 = pt[0] - tri[0][0]; // vector from points
	var vy2 = pt[1] - tri[0][1];

	// create cross products
	var d00 = vx0 * vx0 + vy0 * vy0;
	var d01 = vx0 * vx1 + vy0 * vy1;
	var d02 = vx0 * vx2 + vy0 * vy2;
	var d11 = vx1 * vx1 + vy1 * vy1;
	var d12 = vx1 * vx2 + vy1 * vy2;

	var norm = 1 / (d00 * d11 - d01 * d01);
	var u = (d11 * d02 - d01 * d12) * norm;
	var v = (d00 * d12 - d01 * d02) * norm;

	return ((u >= 0) && (v >= 0) && (u + v < 1));
};

VBI.Utilities.INSIDE = 0; // 0000
VBI.Utilities.LEFT = 1; // 0001
VBI.Utilities.RIGHT = 2; // 0010
VBI.Utilities.BOTTOM = 4; // 0100
VBI.Utilities.TOP = 8; // 1000

VBI.Utilities.ComputeOutCode = function(x, y, rc) {
	var xmin = rc[0]; // left
	var xmax = rc[2]; // right
	var ymin = rc[1]; // top;
	var ymax = rc[3]; // bottom;

	var code = VBI.Utilities.INSIDE;

	if (x < xmin) {
		code |= VBI.Utilities.LEFT;
	} else if (x > xmax) {
		code |= VBI.Utilities.RIGHT;
	}
	if (y < ymin) {
		code |= VBI.Utilities.BOTTOM;
	} else if (y > ymax) {
		code |= VBI.Utilities.TOP;
	}
	return code;
};

// given a line by two points and a rect
// find the intersection point(s) or points inside the rect and return true
// if outside the rect return false
// uses Cohen–Sutherland algorithm
VBI.Utilities.LineIntersectRect = function(x0, y0, x1, y1, rc) {
	var oRet = {};
	var xmin = rc[0]; // left;
	var xmax = rc[2]; // right;
	var ymin = rc[1]; // top;
	var ymax = rc[3]; // bottom;

	var nOutcode0 = VBI.Utilities.ComputeOutCode(x0, y0, rc);
	var nOutcode1 = VBI.Utilities.ComputeOutCode(x1, y1, rc);
	var bAccept = false;

	var bContinueLoop = true;
	while (bContinueLoop) {
		if (!(nOutcode0 | nOutcode1)) {
			bAccept = true;
			break;
		} else if (nOutcode0 & nOutcode1) {
			break;
		} else {
			var x, y;

			var nOutcodeOut = nOutcode0 ? nOutcode0 : nOutcode1;

			if (nOutcodeOut & VBI.Utilities.TOP) {
				x = x0 + (x1 - x0) * (ymax - y0) / (y1 - y0);
				y = ymax;
			} else if (nOutcodeOut & VBI.Utilities.BOTTOM) {
				x = x0 + (x1 - x0) * (ymin - y0) / (y1 - y0);
				y = ymin;
			} else if (nOutcodeOut & VBI.Utilities.RIGHT) {
				y = y0 + (y1 - y0) * (xmax - x0) / (x1 - x0);
				x = xmax;
			} else if (nOutcodeOut & VBI.Utilities.LEFT) {
				y = y0 + (y1 - y0) * (xmin - x0) / (x1 - x0);
				x = xmin;
			}

			if (nOutcodeOut == nOutcode0) {
				x0 = x;
				y0 = y;
				nOutcode0 = VBI.Utilities.ComputeOutCode(x0, y0, rc);
			} else {
				x1 = x;
				y1 = y;
				nOutcode1 = VBI.Utilities.ComputeOutCode(x1, y1, rc);
			}
		}
	}
	oRet.bReturn = false;
	if (bAccept) {
		// copy computed points
		oRet.x0 = x0;
		oRet.y0 = y0;
		oRet.x1 = x1;
		oRet.y1 = y1;
		oRet.bReturn = true;
	}

	return oRet;
};

VBI.Utilities.LineLineIntersection = function(p1, p2, q1, q2, bSegmentOnly) {
	var A1 = p2[1] - p1[1];
	var B1 = p1[0] - p2[0];
	var C1 = A1 * p1[0] + B1 * p1[1];

	var A2 = q2[1] - q1[1];
	var B2 = q1[0] - q2[0];
	var C2 = A2 * q1[0] + B2 * q1[1];

	var det = A1 * B2 - A2 * B1;
	if (!det) {
		return null;
	}
	var nIntersect = [
		(B2 * C1 - B1 * C2) / det, (A1 * C2 - A2 * C1) / det
	];
	if (bSegmentOnly) {
		var sp1 = [], sp2 = [], sq1 = [], sq2 = [];
		for (var nJ = 0; nJ <= 1; ++nJ) {
			if (p1[nJ] < p2[nJ]) {
				sp1[nJ] = p1[nJ];
				sp2[nJ] = p2[nJ];
			} else {
				sp1[nJ] = p2[nJ];
				sp2[nJ] = p1[nJ];
			}
			if (q1[nJ] < q2[nJ]) {
				sq1[nJ] = q1[nJ];
				sq2[nJ] = q2[nJ];
			} else {
				sq1[nJ] = q2[nJ];
				sq2[nJ] = q1[nJ];
			}
		}
		if (nIntersect[0] >= sp1[0] && nIntersect[0] <= sp2[0] && nIntersect[0] >= sq1[0] && nIntersect[0] <= sq2[0] && nIntersect[1] >= sp1[1] && nIntersect[1] <= sp2[1] && nIntersect[1] >= sq1[1] && nIntersect[1] <= sq2[1]) {
			return true;
		} else {
			return false;
		}

	}
	return [
		(B2 * C1 - B1 * C2) / det, (A1 * C2 - A2 * C1) / det
	];

};

VBI.Utilities.IsClockwise = function(pointlist) {
	var length = pointlist.length;
	if (pointlist.length % 2) {
		length -= 1;
	}
	var x1, x2, y1, y2, z;
	z = 0;
	x1 = pointlist[length - 2];
	y1 = pointlist[length - 1];
	for (var nJ = 0; nJ < length; nJ += 2) {
		x2 = pointlist[nJ];
		y2 = pointlist[nJ + 1];
		z += (x2 - x1) * (y2 + y1);
		x1 = x2;
		y1 = y2;
	}
	return (z < 0);
};

// GetClippedPolygon gives precise result only for convex polygons
VBI.Utilities.GetClippedPolygon = function(pointarray, Xoffset, rcviewport) {
	var offset = Xoffset;
	var outputlist = pointarray.slice(0);
	var inputlist = [];
	var intersection;

	for (var nJ = 0; nJ <= 3; ++nJ, offset = 0) {
		inputlist = outputlist.slice(0);
		outputlist = [];
		var tmp = [
			inputlist[inputlist.length - 2], inputlist[inputlist.length - 1]
		];
		var S = [
			tmp[0] + offset, tmp[1]
		];

		for (var nK = 0; nK <= inputlist.length - 2; nK += 2) {
			tmp = [
				inputlist[nK], inputlist[nK + 1]
			];
			var E = [
				tmp[0] + offset, tmp[1]
			];
			var bEInside = false;
			var bSInside = false;
			var clipEdge = [];
			switch (nJ) {
				case 0: // top
					bEInside = (E[1] > rcviewport[1]);
					bSInside = (S[1] > rcviewport[1]);
					clipEdge = [
						[
							rcviewport[0], rcviewport[1]
						], [
							rcviewport[2], rcviewport[1]
						]
					];
					break;
				case 1: // right
					bEInside = (E[0] < rcviewport[2]);
					bSInside = (S[0] < rcviewport[2]);
					clipEdge = [
						[
							rcviewport[2], rcviewport[1]
						], [
							rcviewport[2], rcviewport[3]
						]
					];
					break;
				case 2: // bottom
					bEInside = (E[1] < rcviewport[3]);
					bSInside = (S[1] < rcviewport[3]);
					clipEdge = [
						[
							rcviewport[0], rcviewport[3]
						], [
							rcviewport[2], rcviewport[3]
						]
					];
					break;
				case 3: // left
					bEInside = (E[0] > rcviewport[0]);
					bSInside = (S[0] > rcviewport[0]);
					clipEdge = [
						[
							rcviewport[0], rcviewport[1]
						], [
							rcviewport[0], rcviewport[3]
						]
					];
					break;
				default:
					break;
			}
			if (bEInside) {
				if (!bSInside) {
					intersection = VBI.Utilities.LineLineIntersection(S, E, clipEdge[0], clipEdge[1], false);
					if (intersection) {
						outputlist.push(intersection[0], intersection[1]);
					}
				}
				outputlist.push(E[0], E[1]);
			} else if (bSInside) {
				intersection = VBI.Utilities.LineLineIntersection(S, E, clipEdge[0], clipEdge[1], false);
				if (intersection) {
					outputlist.push(intersection[0], intersection[1]);
				}
			}
			S = [
				E[0], E[1]
			];
		}
	}
	return outputlist;
};

VBI.Utilities.GetBarycenterForPolygon = function(pointarray, offset) {
	var pa = pointarray.slice(0);
	var pt1 = [
		pa[0], pa[1]
	];
	var ptlast = [
		pa[pa.length - 2], pa[pa.length - 1]
	];

	if (pt1 != ptlast) {
		pa.push(pa[0], pa[1]);
	}

	var N = pa.length - 2;

	var sum = 0;
	var A = 0;
	var centerX;
	var centerY;
	for (var nI = 0; nI < N; nI += 2) {
		sum += ((pa[nI] + offset) * pa[nI + 3] - (pa[nI + 2] + offset) * pa[nI + 1]);
	}
	A = sum / 2;
	if (A) {
		sum = 0;
		for (var nJ = 0; nJ < N; nJ += 2) {
			sum += (pa[nJ] + offset + pa[nJ + 2] + offset) * ((pa[nJ] + offset) * pa[nJ + 3] - (pa[nJ + 2] + offset) * pa[nJ + 1]);
		}
		centerX = sum / (A * 6);

		sum = 0;
		for (var nK = 0; nK < N; nK += 2) {
			sum += (pa[nK + 1] + pa[nK + 3]) * ((pa[nK] + offset) * pa[nK + 3] - (pa[nK + 2] + offset) * pa[nK + 1]);
		}
		centerY = sum / (A * 6);
	}
	if (centerX && centerY) {
		return [
			centerX, centerY
		];
	}

	return null;

};

VBI.Utilities.GetMidpointForPolygon = function(pointarray, bb, Xoffset, rcviewport) {
	var offset = Xoffset;
	var labelPositions = [];
	var lt = bb[0];
	var rb = bb[1];
	var ltinRc = VBI.Utilities.PtInRect([
		lt[0] + offset, lt[1]
	], rcviewport);
	var rbinRc = VBI.Utilities.PtInRect([
		rb[0] + offset, rb[1]
	], rcviewport);

	if (!ltinRc || !rbinRc) {
		// calculate clipping polygon
		pointarray = VBI.Utilities.GetClippedPolygon(pointarray, offset, rcviewport);
		offset = 0;
	}
	var labelPosition = VBI.Utilities.GetBarycenterForPolygon(pointarray, offset);
	if (labelPosition) {
		var labelPoint = VBI.Utilities.getNextPoint(labelPosition[0], labelPosition[1], pointarray, offset);
		labelPositions.push(labelPoint);
		return {
			max: 0,
			aPos: labelPositions
		};
	}
	return null;

};

VBI.Utilities.GetClippedPolygons = function(pointarray, offset, rcviewport) {
	var outputlist = [];
	var pointlist = pointarray.slice(0);
	var nStartViewportList = pointlist.length;
	var nLastIdxPtList = nStartViewportList - 2;

	var z = VBI.Utilities.IsClockwise(pointarray);
	if (z > 0) {
		pointlist.push(rcviewport[0], rcviewport[1], rcviewport[2], rcviewport[1], rcviewport[2], rcviewport[3], rcviewport[0], rcviewport[3]);
	} else {
		pointlist.push(rcviewport[0], rcviewport[1], rcviewport[0], rcviewport[3], rcviewport[2], rcviewport[3], rcviewport[2], rcviewport[1]);
	}
	var nStartIntersectionList = pointlist.length;
	var EI = [];
	var LI = [];
	var indexChainP = [];
	var indexChainR = [];
	for (var nI = 0; nI < nStartViewportList; nI += 2) {
		indexChainP.push(nI);
	}
	var polyPt1, polyPt2, rectPt1, rectPt2;
	var l;
	polyPt1 = [
		pointlist[nLastIdxPtList] + offset, pointlist[nLastIdxPtList + 1]
	];
	// for (var nI = nLastIdxPtList, nJ = 0; nJ <= nLastIdxPtList; nJ += 2) {
	for (var nJ = 0; nJ <= nLastIdxPtList; nJ += 2) {
		polyPt2 = [
			pointlist[nJ] + offset, pointlist[nJ + 1]
		];
		var bRet = VBI.Utilities.LineIntersectRect(polyPt1[0], polyPt1[1], polyPt2[0], polyPt2[1], rcviewport);
// var out0 = [
// bRet.x0, bRet.y0
// ];
// var out1 = [
// bRet.x1, bRet.y1
// ];
		// var nEnteringIS = null;
		if (bRet.bReturn == true) {
// console.log("in=" + polyPt1 + " / " + polyPt2 + "; out=" + out0 + " / " + out1);
			if ((bRet.x0 != polyPt1[0] || bRet.y0 != polyPt1[1]) && (bRet.x1 != polyPt2[0] || bRet.y1 != polyPt2[1])) { // two intersection points
				if (!(bRet.x0 == bRet.x1 && bRet.y0 == bRet.y1)) {
					var f = pointlist.push(bRet.x0, bRet.y0);
					l = pointlist.push(bRet.x1, bRet.y1);
					EI.push(f - 2);
					LI.push(l - 2);
// console.log("added entering and leaving is");
					var I = indexChainP.indexOf(nJ);
					indexChainP.splice(I, 0, f - 2, l - 2);
				}
			} else if (bRet.x0 != polyPt1[0] || bRet.y0 != polyPt1[1]) { // pt1In != pt1Out -> pt1Out is an entering intersection
				if (bRet.x0 != polyPt2[0] || bRet.y0 != polyPt2[1]) { // pt1Out is not equal pt2in
					l = pointlist.push(bRet.x0, bRet.y0);
					EI.push(l - 2);
// console.log("added entering is");
					var II = indexChainP.indexOf(nJ);
					indexChainP.splice(II, 0, l - 2);
				}
			} else if (bRet.x1 != polyPt2[0] || bRet.y1 != polyPt2[1]) { // pt2In != pt2Out -> pt2Out is a leaving intersection
				l = pointlist.push(bRet.x1, bRet.y1);
				LI.push(l - 2);
// console.log("added leaving is");
				var III = indexChainP.indexOf(nJ);
				indexChainP.splice(III, 0, l - 2);
			}
		}
		polyPt1 = polyPt2;
		// nI = nJ;
	} // all intersections found in polygon array

	for (var nJ1 = nStartViewportList, count = 0; count < 4; nJ1 += 2, ++count) { // start search for intersections in rect array
		var sortarr = [];
		indexChainR.push(nJ1);
		rectPt1 = [
			pointlist[nJ1], pointlist[nJ1 + 1]
		];
		if (count == 3) {
			rectPt2 = [
				pointlist[nStartViewportList], pointlist[nStartViewportList + 1]
			];
		} else {
			rectPt2 = [
				pointlist[nJ1 + 2], pointlist[nJ1 + 3]
			];
		}
		var dir = (rectPt1[0] == rectPt2[0]) ? 1 : 0;
		var eq = dir ? 0 : 1;
		for (var nK = nStartIntersectionList; nK <= pointlist.length - 2; nK += 2) { // consider all intersection points for this side
			if (pointlist[nK + eq] == rectPt1[eq]) {
				sortarr.push({
					pt: pointlist[nK + dir],
					idx: nK
				});
			}
		}
		if (count < 2) {
			sortarr.sort(VBI.Utilities.StandardSort1);
		} else {
			sortarr.sort(VBI.Utilities.StandardSort2);
		}
		for (var nL = 0; nL < sortarr.length; ++nL) {
			indexChainR.push(sortarr[nL].idx);
		}

		rectPt1 = rectPt2;

	} // rectangle chainlist is also finished

	for (var nJJ = nStartViewportList; nJJ <= pointlist.length - 2; nJJ += 2) {
		// remove offset for all viewport and intersection points
		pointlist[nJJ] -= offset;
	}

	// capture clipped polygons
	for (var nJK = 0; nJK < EI.length; ++nJK) {// loop over all entering vertices
		var outputpolygon = [];
		var start = EI[nJK];
		var currentIdx = indexChainP.indexOf(EI[nJK]);
		var currentChainlist = indexChainP;
		var otherChainlist = indexChainR;
		var currentISList = LI;
		var otherISList = EI;
		outputpolygon.push(pointlist[EI[nJK]], pointlist[EI[nJK] + 1]);
		var swapcount = 0;
		var bContinueLoop = true;
		while (bContinueLoop) {
			currentIdx++;
			if (currentIdx > currentChainlist.length - 1) {
				currentIdx = 0;
			}
			if (currentChainlist[currentIdx] == start) {
				outputlist.push(outputpolygon);
				break;
			}

			outputpolygon.push(pointlist[currentChainlist[currentIdx]], pointlist[currentChainlist[currentIdx] + 1]);
			var I2 = currentISList.indexOf(currentChainlist[currentIdx]);
			if (I2 > -1) {
				swapcount++;
// if ( swapcount > 20 )
// console.log("swapcount!! = " + swapcount);
				currentIdx = otherChainlist.indexOf(currentChainlist[currentIdx]);
				// intersectionpoint reached -> swap lists
				var tmp = currentChainlist;
				currentChainlist = otherChainlist;
				otherChainlist = tmp;
				tmp = currentISList;
				currentISList = otherISList;
				otherISList = tmp;
			}
		}
	}
	return outputlist;
};

VBI.Utilities.StandardSort1 = function(a, b) {
	return a.pt - b.pt;
};

VBI.Utilities.StandardSort2 = function(a, b) {
	return b.pt - a.pt;
};

VBI.Utilities.GetMidpointsForPolygon = function(pointarray, bb, Xoffset, rcviewport) {
	var polylist = [];
	var offset = Xoffset;
	var labelPositions = [];
	var lt = bb[0];
	var rb = bb[1];

	// check whether rcviewport and bounding box overlap
	if (VBI.Utilities.RectIntersect([
		lt[0] + offset, lt[1], rb[0] + offset, rb[1]
	], rcviewport)) {
		var ltonRc = VBI.Utilities.PtOnRect([
			lt[0] + offset, lt[1]
		], rcviewport);
		var rbonRc = VBI.Utilities.PtOnRect([
			rb[0] + offset, rb[1]
		], rcviewport);
		if (!ltonRc || !rbonRc) {
			// calculate clipping polygon
			polylist = VBI.Utilities.GetClippedPolygons(pointarray, offset, rcviewport);
			if (!polylist.length) {
				var mid = [
					rcviewport[0] + (rcviewport[2] - rcviewport[0]) / 2, rcviewport[1] + (rcviewport[3] - rcviewport[1]) / 2
				];
				if (VBI.Utilities.pointInPolygon(pointarray, mid[0], mid[1])) {
					labelPositions.push(mid); // no clipping found but the midpoint of the viewport lies within the polygon -> place label here
				}
			}
		} else {
			polylist.push(pointarray);
		}

		for (var nJ = 0; nJ < polylist.length; ++nJ) {

			var labelPosition = VBI.Utilities.GetBarycenterForPolygon(polylist[nJ], offset);
			if (labelPosition) {
				var labelPoint = VBI.Utilities.getNextPoint(labelPosition[0], labelPosition[1], polylist[nJ], offset);
				labelPositions.push(labelPoint);

			}
		}
		if (labelPositions.length > 0) {
			return {
				max: 0,
				aPos: labelPositions
			};
		}
	}
	return null;

};

VBI.Utilities.GetMidpointsForLine = function(pointarray, offset, rcviewport) {
	var labelPositions = [];
	var bRet = {};
	var ptLastEnd = [
		Number.MAX_VALUE, Number.MAX_VALUE
	];
	var bOpen = false;
	var vSection;
	var vSections = [];

	if (pointarray.length > 5) {
		for (var nJ = 0; nJ <= pointarray.length - 6; nJ += 3) {
			var x1 = pointarray[nJ];
			var y1 = pointarray[nJ + 1];
			var x2 = pointarray[nJ + 3];
			var y2 = pointarray[nJ + 4];

			bRet = VBI.Utilities.LineIntersectRect(x1 + offset, y1, x2 + offset, y2, rcviewport);
			if (bRet.bReturn == true) {
				if (vSection && bOpen && (bRet.x0 != ptLastEnd[0] || bRet.y0 != ptLastEnd[1])) {
					// finish section
					vSections.push(vSection);
					bOpen = false;
				}
				if (!bOpen) {
					vSection = [];
					vSection.push(bRet.x0);
					vSection.push(bRet.y0);
					bOpen = true;
				}
				vSection.push(bRet.x1);
				ptLastEnd[0] = bRet.x1;
				vSection.push(bRet.y1);
				ptLastEnd[1] = bRet.y1;
			} else if (bOpen) {
				vSections.push(vSection);
				bOpen = false;
			}
		}
		if (bOpen) {
			vSections.push(vSection);
			bOpen = false;
		}

	}

	var max = 0;
	var nMaxIdx = 0;

	for (var nI = 0; nI < vSections.length; nI++) {
		var sec = vSections[nI];
		if (sec.length > 3) {

			var fTotalLength = 0.0;
			var fLength;
			var vLengths = [];

			for (var nN = 0; nN <= sec.length - 4; nN += 2) {
				// calculate the midpoint of this section
				fLength = Math.sqrt(Math.pow(sec[nN + 2] - sec[nN], 2) + Math.pow(sec[nN + 3] - sec[nN + 1], 2));

				fTotalLength += fLength;
				vLengths.push(fLength);
			}

			var fL = fTotalLength;

			var fHalfLength = fTotalLength / 2;
			var nIdx = -1;
			var fMultiplicator = 0.0;

			for (var nM = vLengths.length - 1; nM >= 0; nM--) {
				fTotalLength -= vLengths[nM];
				if (fTotalLength <= fHalfLength) {
					fMultiplicator = fHalfLength - fTotalLength;
					nIdx = nM;
					break;
				}
			}

			if (nIdx > -1) {
				var pt = [
					sec[nIdx * 2 + 2] - sec[nIdx * 2], sec[nIdx * 2 + 3] - sec[nIdx * 2 + 1]
				];
				// vector length
				var tmp = Math.sqrt(Math.pow(pt[0], 2) + Math.pow(pt[1], 2));
				// normalize
				var ptNorm = [
					pt[0] / tmp, pt[1] / tmp
				];
				// scale
				var ptScale = [
					ptNorm[0] * fMultiplicator, ptNorm[1] * fMultiplicator
				];
				labelPositions.push([
					sec[nIdx * 2] + parseInt(ptScale[0], 10), sec[nIdx * 2 + 1] + parseInt(ptScale[1], 10)
				]);
				if (fL > max) {
					max = fL;
					nMaxIdx = nI;
				}
			}
		}
	}
	return {
		max: nMaxIdx,
		aPos: labelPositions
	};
};

VBI.Utilities.updateBoundRect = function(oArray, rect) {
	// update bounding box....................................................//
	// using the new array of coords and calculating new values...............//

	var xyz, nCount = oArray.length;
	var minX = rect[0];
	var maxX = rect[2];
	var minY = rect[1];
	var maxY = rect[3];
	for (var nJ = 0; nJ < nCount; ++nJ) {
		xyz = oArray[nJ];
		if (minX > xyz[0]) {
			minX = xyz[0];
		}
		if (maxX < xyz[0]) {
			maxX = xyz[0];
		}
		if (minY > xyz[1]) {
			minY = xyz[1];
		}
		if (maxY < xyz[1]) {
			maxY = xyz[1];
		}
	}

	// set the new values.....................................................//
	rect[0] = minX;
	rect[2] = maxX;
	rect[1] = minY;
	rect[3] = maxY;
};

VBI.Utilities.inflateRect = function(rect, val) {
	// inflate the rectangle..................................................//
	rect[0] -= val;
	rect[1] -= val;
	rect[2] += val;
	rect[3] += val;
};

// calculates the square distance between a point and a line.................//
// x1,y1,x2,y2 are points of the line........................................//
// x3, y3 is the point to be measuresd.......................................//

VBI.Utilities.sqDistance = function(x1, y1, x2, y2, x3, y3) {
	// vector between points..................................................//
	var px = x2 - x1;
	var py = y2 - y1;

	// squared length of p....................................................//
	var sqlp = px * px + py * py;
	if (!sqlp) {
		return (x3 - x1) * (x3 - x1) + (y3 - y1) * (y3 - y1);
	}
	var u = ((x3 - x1) * px + (y3 - y1) * py) / sqlp;

	// process raise conditions
	if (u > 1) {
		u = 1;
	} else if (u < 0) {
		u = 0;
	}

	var dx = x1 + u * px - x3;
	var dy = y1 + u * py - y3;

	return dx * dx + dy * dy;
};

// nearest point from a point and a polygon .................................//
// poly is the polygon [x0,y0,x1,y1....xn,yn] ...............................//
// x, y is the point to be measured .........................................//

VBI.Utilities.getNextPoint = function(x, y, poly, offset) {
	var v1, v2, len = poly.length;
	var pts = [];
	var distances = [];
	var c = false;
	for (var nJ = 0, l = len, nK = l - 2; nJ <= l - 2; nJ += 2) {
		v1 = [
			poly[nJ] + offset, poly[nJ + 1]
		];
		v2 = [
			poly[nK] + offset, poly[nK + 1]
		];

		// ///// calculate distpoint and dist ///////////////////////
		var sqdist = 0;
		var resultPt = [];
		var A = x - v1[0];
		var B = y - v1[1];
		var C = v2[0] - v1[0];
		var D = v2[1] - v1[1];

		var dot = A * C + B * D;
		var len_sq = C * C + D * D;
		if (!len_sq) {
			sqdist = (x - v1[0]) * (x - v1[0]) + (y - v1[1]) * (y - v1[1]);
			resultPt = [
				v1[0], v1[1]
			];
		} else {
			var param = dot / len_sq;
			if (param < 0) {
				resultPt = [
					v1[0], v1[1]
				];
			} else if (param > 1) {
				resultPt = [
					v2[0], v2[1]
				];
			} else {
				resultPt = [
					v1[0] + param * C, v1[1] + param * D
				];
			}
			var dx = x - (v1[0] + param * C);
			var dy = y - (v1[1] + param * D);
			sqdist = (dx * dx + dy * dy);
		}
		pts.push(resultPt);
		distances.push(sqdist);

		// //////////////////// calculate inside/outside ///////////////
		if (((v1[1] <= y && y < v2[1]) || (v2[1] <= y && y < v1[1])) && (x < (v2[0] - v1[0]) * (y - v1[1]) / (v2[1] - v1[1]) + v1[0])) {
			c = !c;
		}
		// /////// get the next point /////////////////////
		nK = nJ;
	}

	if (c) { // incoming point is inside polygon
		return [
			x, y
		];
	} else {
		var min = 10000;
		var idx = -1;
		if (distances.length) {
			for (var nk = 0; nk < distances.length; ++nk) {
				if (distances[nk] < min) {
					idx = nk;
					min = distances[nk];
				}
			}
			if (idx > -1) {
				return (pts[idx]);
			}
		}
		return ([
			poly[0] + offset, poly[1]
		]);
	}
};

// ...........................................................................//
// drawing methods...........................................................//

VBI.Utilities.DrawSelectIndicator = function(ctx, p) {
	var r = 4;

	// fill corner arcs....................................................//
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'rgba( 0, 0, 0, 1.0 )';
	ctx.fillStyle = 'rgba( 10, 10, 255, 1.0 )';
	ctx.beginPath();
	ctx.arc(p[0], p[1], r, 0, 2 * Math.PI);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
};

VBI.Utilities.DrawDesignRect = function(ctx, handles, p1, p2, p3, p4) {
	// handles is an array of values tat specify the visibility of the drag...//
	// box handles............................................................//
	var x, y, r = 3, bDash = ctx.setLineDash ? true : false;

	ctx.save(); // store context state
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'rgba( 0, 0, 0, 1.0 )';

	if (typeof p1 == 'object') {
		var w = p1[2] - p1[0];
		var h = p1[3] - p1[1];
		var wh = w / 2;
		var hh = h / 2;

		// assume array object.................................................//
		if (bDash) {
			ctx.setLineDash([
				1, 2
			]);
		}
		ctx.strokeRect(p1[0], p1[1], w, h);

		// fill corner arcs....................................................//
		var fill = 'rgba( 255, 255, 255, 1.0 )';
		var filldisabled = 'rgba( 128, 128, 128, 1.0 )';

		// assume array object.................................................//
		if (bDash) {
			ctx.setLineDash([
				0, 0
			]);
		}

		ctx.fillStyle = fill;
		for (x = 0; x < 3; ++x) {
			for (y = 0; y < 3; ++y) {
				// skip rendering the circle when not movable....................//
				ctx.fillStyle = (handles[y * 3 + x] ? fill : filldisabled);

				if (x == 1 && y == 1) {
					continue;
				}
				ctx.beginPath();
				ctx.arc(p1[0] + x * wh, p1[1] + y * hh, r, 0, 2 * Math.PI);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			}
		}
	} else {
		// assume coordinates..................................................//
		ctx.strokeRect(p1 - 1, p2 - 1, p3 - p1, p4 - p2);
		ctx.strokeStyle = 'rgba( 255, 255, 255, 1.0 )';
		ctx.strokeRect(p1, p2, p3 - p1, p4 - p2);
	}

	ctx.restore(); // restore context state
};

VBI.Utilities.DrawFrameRect = function(ctx, col, p1, p2, p3, p4) {
	ctx.lineWidth = 1;
	ctx.strokeStyle = col;

	if (typeof p1 == 'object') {
		// assume array object.................................................//
		ctx.strokeRect(p1[0], p1[1], p1[2] - p1[0], p1[3] - p1[1]);
	} else {
		// assume coordinates..................................................//
		ctx.strokeRect(p1, p2, p3 - p1, p4 - p2);
	}
};

VBI.Utilities.AssembleCopyrightString = function(Copyright, CopyrightLink, CopyrightImage) {
	var regex1 = /\{LINK\|IMG\}/;
	var regex2 = /\{IMG\}/;
	var regex3 = /\{LINK\|([^\}]+)\}/;

	if (Copyright) {
		if (!CopyrightLink && !CopyrightImage) {
			Copyright = jQuery.sap.encodeHTML(Copyright);
		}
		CopyrightLink   = CopyrightLink ? jQuery.sap.encodeHTML(CopyrightLink):CopyrightLink;
		CopyrightImage  = CopyrightImage ? jQuery.sap.encodeHTML(CopyrightImage):CopyrightImage;
		var tmp = Copyright.replace(regex1, "<a href='" + CopyrightLink + "'><img src='" + CopyrightImage + "' width='10' height='10' border='none'></a>");
		tmp = tmp.replace(regex2, "<img src='" + CopyrightImage + "' width='10' height='10' border='none' >");
		return tmp.replace(regex3, "<a  href='" + CopyrightLink + "'>$1</a>");
	}
	return Copyright;
};

VBI.Utilities.DrawTrackingRect = function(ctx, p1, p2, p3, p4) {
	ctx.save();
	ctx.strokeStyle = 'black';
	ctx.lineWidth = 1;
	if (ctx.setLineDash) {
		ctx.setLineDash([
			1, 2
		]);
	}
	ctx.beginPath();
	ctx.rect(p1, p2, p3 - p1, p4 - p2);
	ctx.stroke();
	ctx.fillStyle = 'rgba( 0, 192, 192, 0.2 )';
	ctx.fill();
	ctx.restore();
};

VBI.Utilities.DrawTrackingLasso = function(ctx, aPos) {
	ctx.save();
	ctx.strokeStyle = 'black';
	ctx.lineWidth = 1;
	if (ctx.setLineDash) {
		ctx.setLineDash([
			1, 2
		]);
	}
	ctx.beginPath();
	ctx.moveTo(aPos[0][0], aPos[0][1]);
	for (var nJ = 1; nJ < aPos.length; ++nJ) {
		ctx.lineTo(aPos[nJ][0], aPos[nJ][1]);
	}
	ctx.closePath();
	ctx.stroke();
	ctx.fillStyle = 'rgba( 0, 192, 192, 0.2 )';
	ctx.fill();
	ctx.restore();
};

// ...........................................................................//
// color conversion routines.................................................//

VBI.Utilities.RGB2HLS = function(red, green, blue) {
	red /= 255.0;
	green /= 255.0;
	blue /= 255.0; // normalize to [0,1]

	var max = Math.max(red, green, blue);
	var min = Math.min(red, green, blue);

	var hue = 0, sat, lum = (max + min) / 2;
	if (max == min) {
		hue = sat = 0; // achromatic
	} else {
		var d = max - min;
		sat = lum > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case red:
				hue = (green - blue) / d + (green < blue ? 6 : 0);
				break;
			case green:
				hue = (blue - red) / d + 2;
				break;
			case blue:
				hue = (red - green) / d + 4;
				break;
		}
		hue /= 6;
	}
	return [
		hue, lum, sat
	];
};

VBI.Utilities.HLS2RGB = function(hue, lum, sat) {
	var red = 0, green = 0, blue = 0;
	if (sat == 0) {
		red = green = blue = lum;
	} else {
		var q = lum < 0.5 ? lum * (1 + sat) : lum + sat - lum * sat;
		var p = 2 * lum - q;
		red = VBI.Utilities.HUE2RGB(p, q, hue + 1 / 3);
		green = VBI.Utilities.HUE2RGB(p, q, hue);
		blue = VBI.Utilities.HUE2RGB(p, q, hue - 1 / 3);
	}

	return [
		Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255)
	];
};

VBI.Utilities.HUE2RGB = function(p, q, t) {
	if (t < 0) {
		t += 1;
	} else if (t > 1) {
		t -= 1;
	}

	if (t < 1 / 6) {
		return p + (q - p) * 6 * t;
	}
	if (t < 1 / 2) {
		return q;
	}
	if (t < 2 / 3) {
		return p + (q - p) * (2 / 3 - t) * 6;
	}
	return p;
};

// get the pixel value of 1rem
VBI.Utilities.RemToPixel = function(value) {
	// Returns a number
	return value * parseFloat(
	// of the computed font-size, so in px
	getComputedStyle(
	// for the root <html> element
	document.documentElement).fontSize);
};

VBI.Utilities.ColorHex2rgba = function(sHC) {
	var sColor = sHC.charAt(0) === "#" ? sHC.substring(1, 7) : sHC;
	return 'rgba(' + parseInt(sColor.substring(0, 2), 16) + ',' + parseInt(sColor.substring(2, 4), 16) + ',' + parseInt(sColor.substring(4, 6), 16) + ',1.0)';
};

VBI.Utilities.String2VBColor = function(s) {
	var aCol = VBI.Types.string2rgba(s);
	if (aCol[4] === 1) {
		return "RGBA(" + aCol[0] + ";" + aCol[1] + ";" + aCol[2] + ";" + parseInt(aCol[3] * 255, 10) + ")";
	} else {
		return "RGB(" + aCol[0] + ";" + aCol[1] + ";" + aCol[2] + ")";
	}
};

VBI.Utilities.CompToHex = function(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
};

VBI.Utilities.RgbToHex = function(r, g, b) {
	return "#" + VBI.Utilities.CompToHex(r) + VBI.Utilities.CompToHex(g) + VBI.Utilities.CompToHex(b);
};

});
