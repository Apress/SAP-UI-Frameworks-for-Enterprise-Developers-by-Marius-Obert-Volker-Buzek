/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/suite/ui/commons/library",
	"sap/ui/core/Control",
	"sap/ui/core/IconPool",
	"sap/ui/Device",
	"sap/base/security/encodeXML"
], function (library, Control, IconPool, Device, encodeXML) {
	"use strict";

	var ElementStatus = library.networkgraph.ElementStatus;

	var SVG_NS = 'http://www.w3.org/2000/svg';
	/**
	 * Constructor for a new ElementBase.
	 *
	 * @class
	 * SvgBase class
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @since 1.50
	 * @abstract
	 * @alias sap.suite.ui.commons.networkgraph.SvgBase
	 */
	var SvgBase = Control.extend("sap.suite.ui.commons.networkgraph.SvgBase", {
		renderer: {}
	});

	SvgBase.prototype.HIGHLIGHT_CLASS = "sapSuiteUiCommonsNetworkElementHighlight";
	SvgBase.prototype.SELECT_CLASS = "sapSuiteUiCommonsNetworkElementSelected";
	SvgBase.prototype.VISIBLE_ACTIONS_BUTTONS_CLASS = "sapSuiteUiCommonsNetworkNodeActionButtonsVisible";
	SvgBase.prototype.FOCUS_CLASS = "sapSuiteUiCommonsNetworkElementFocus";

	SvgBase.prototype.LINEBUTTONSID = "divlinebuttons";

	SvgBase.prototype._createElement = function (sType, mAttributes) {
		var oElement = document.createElementNS(SVG_NS, sType);
		return this._setAttributes(oElement, mAttributes);
	};

	SvgBase.prototype._setAttributes = function (oElement, mAttributes) {
		mAttributes = mAttributes || {};
		Object.keys(mAttributes).forEach(function (sAttribute) {
			oElement.setAttribute(sAttribute, mAttributes[sAttribute]);
		});

		return oElement;
	};

	SvgBase.prototype._getStatusClass = function (sStatus) {
		var sCheckedStatus = sStatus || this.getStatus();

		switch (sCheckedStatus) {
			case ElementStatus.Warning:
				return " sapSuiteUiCommonsNetworkElementWarning ";
			case ElementStatus.Error:
				return " sapSuiteUiCommonsNetworkElementError ";
			case ElementStatus.Success:
				return " sapSuiteUiCommonsNetworkElementSuccess ";
			case ElementStatus.Information:
				return " sapSuiteUiCommonsNetworkElementInformation ";
			default:
				return "";
		}
	};

	/**
	 * Returns label for accessibility.
	 *
	 * @private
	 * @abstract
	 */
	SvgBase.prototype._getAccessibilityLabel = function () {
		throw new Error("To be implemented by an extending class.");
	};

	/* =========================================================== */
	/* Rendering (HTML output)*/
	/* =========================================================== */
	SvgBase.prototype._renderRoundRect = function (mArguments) {
		return this._renderControl("path", {
			d: this._renderRoundRectPath(mArguments),
			style: mArguments.style,
			"class": mArguments.class,
			id: mArguments.id
		});
	};

	SvgBase.prototype._renderRoundRectPath = function (mArguments) {
		mArguments.topRight = mArguments.topRight || 0;
		mArguments.topLeft = mArguments.topLeft || 0;
		mArguments.bottomRight = mArguments.bottomRight || 0;
		mArguments.bottomLeft = mArguments.bottomLeft || 0;

		var iRight = mArguments.x + mArguments.width,
			iBottom = mArguments.y + mArguments.height,
			sPath = "",
			fnAppendArc = function (iRadius, iX, iY) {
				sPath += " A" + iRadius + "," + iRadius + " 0 0,1 " + iX + "," + iY;
			},
			fnAppendLine = function (iX, iY) {
				sPath += " L" + iX + "," + iY;
			};

		sPath = "M" + (mArguments.x + mArguments.topLeft) + "," + mArguments.y;
		fnAppendLine(iRight - mArguments.topRight, mArguments.y);

		if (mArguments.topRight) {
			fnAppendArc(mArguments.topRight, iRight, mArguments.y + mArguments.topRight);
		}
		fnAppendLine(iRight, iBottom - mArguments.bottomRight);

		if (mArguments.bottomRight) {
			fnAppendArc(mArguments.bottomRight, iRight - mArguments.bottomRight, iBottom);
		}
		fnAppendLine(mArguments.x + mArguments.bottomLeft, iBottom);

		if (mArguments.bottomLeft) {
			fnAppendArc(mArguments.bottomLeft, mArguments.x, iBottom - mArguments.bottomLeft);
		}
		fnAppendLine(mArguments.x, mArguments.y + mArguments.topLeft);

		if (mArguments.topLeft) {
			fnAppendArc(mArguments.topLeft, mArguments.x + mArguments.topLeft, mArguments.y);
		}

		return sPath;
	};

	// RTL in IE doesn't support text dir rtl (known bug) so we have to revert it's position manually
	// adding it as attribute should prevent replacing CSS style (usually for middle)
	SvgBase.prototype._appendTextAnchor = function (mAttributes) {
		var bIsRtl = sap.ui.getCore().getConfiguration().getRTL();

		if (bIsRtl && this._isMSBrowser()) {
			mAttributes["text-anchor"] = "end";
		}
	};

	SvgBase.prototype._renderText = function (mAttributes) {
		var sHtml;
		// MS ignore vertical positioning of SVG text element so we try to move Y
		if (mAttributes.height && this._isMSBrowser()) {
			mAttributes.attributes.dy = mAttributes.height / 2;
		}

		this._appendTextAnchor(mAttributes.attributes);

		sHtml = this._renderControl("text", mAttributes.attributes, false);
		sHtml += mAttributes.text ? encodeXML(mAttributes.text) : "";

		if (mAttributes.close !== false) {
			sHtml += "</text>";
		}

		return sHtml;
	};

	SvgBase.prototype._renderSpanText = function (mAttributes, sText, iHeight) {
		var sHtml;
		// MS ignore vertical positioning of SVG text element so we try to move Y
		if (iHeight && this._isMSBrowser()) {
			mAttributes.dy = iHeight / 2;
		}
		sHtml = this._renderControl("text", mAttributes, false);

		sHtml += this._renderControl("tspan", {}, false);
		sHtml += encodeXML(sText);
		sHtml += "</tspan></text>";

		return sHtml;
	};

	SvgBase.prototype._cannotAppendInnerHtml = function () {
		return this._isMSBrowser() || Device.browser.safari;
	};

	SvgBase.prototype._isMSBrowser = function () {
		return Device.browser.edge || Device.browser.msie;
	};

	SvgBase.prototype._renderIcon = function (mAttributes) {
		var oIconInfo = IconPool.getIconInfo(mAttributes.icon);
		if (oIconInfo) {
			return this._renderText({
				attributes: mAttributes.attributes,
				text: oIconInfo.content,
				height: mAttributes.height
			});
		}

		return "";
	};

	SvgBase.prototype._renderControl = function (sName, mAttributes, bClose) {
		var sHtml = "<" + sName + " ";

		mAttributes = mAttributes || {};
		Object.keys(mAttributes).forEach(function (sAttribute) {
			if (typeof mAttributes[sAttribute] !== "undefined") {
				sHtml += sAttribute;
				sHtml += "=";
				sHtml += "\"" + mAttributes[sAttribute] + "\"";
			}
		});

		sHtml += ">";

		bClose = (bClose !== false);
		if (bClose) {
			sHtml += "</" + sName + ">";
		}

		return sHtml;
	};

	SvgBase.prototype._createText = function (oTextWrapper, mArguments) {
		var oSpan = oTextWrapper.firstChild,
			iCursor = mArguments.text.length,
			bAddDots = mArguments.dots !== false,
			sTrimmedText = mArguments.text,
			bIsLong = true,
			bNeedTrim = false,
			iWidth = parseInt(oTextWrapper.getAttribute("maxwidth"), 10) || mArguments.width,
			iLeft = parseFloat(oTextWrapper.getAttribute("x")),
			sSuffix = mArguments.suffix ? mArguments.suffix : "",
			iCenterWidth = mArguments.centerWidth ? mArguments.centerWidth : iWidth,
			sEnding = "..." + sSuffix,
			iNewLength, iActualWidth;

		mArguments.trim = (mArguments.trim !== false);
		oSpan.textContent = mArguments.text + sSuffix;

		if (mArguments.trim && iWidth > 0) {
			iActualWidth = oTextWrapper.getBBox().width;
			if (iActualWidth > iWidth) {
				bNeedTrim = true;
				while (true) { // eslint-disable-line no-constant-condition
					iCursor /= 2;
					iNewLength = sTrimmedText.length + (bIsLong ? -1 : 1) * Math.ceil(iCursor);
					sTrimmedText = mArguments.text.substring(0, iNewLength);
					oSpan.textContent = sTrimmedText + (bAddDots ? sEnding : "");

					iActualWidth = oTextWrapper.getBBox().width;
					bIsLong = (iActualWidth > iWidth);

					if (iCursor < 0.5 && !bIsLong) {
						if (iActualWidth > iWidth) {
							// use last
							sTrimmedText = mArguments.text.substring(0, sTrimmedText.length - Math.ceil(iCursor * 2));
							oSpan.textContent = sTrimmedText + +(bAddDots ? sEnding : "");
						}

						break;
					}
				}
			}
		}

		if (mArguments.hCenter && !bNeedTrim) {
			oTextWrapper.setAttribute("text-anchor", "middle");
			oTextWrapper.setAttribute("x", iLeft + iCenterWidth / 2);
		}

		return bNeedTrim;
	};

	SvgBase.prototype._createIcon = function (mAttributes, sIcon, iHeight) {
		var oIconInfo = IconPool.getIconInfo(sIcon),
			oIcon;
		if (oIconInfo) {
			if (iHeight && this._isMSBrowser()) {
				mAttributes.dy = iHeight / 2;
			}
			oIcon = this._createElement("text", mAttributes);
			oIcon.textContent = oIconInfo.content;
			return oIcon;
		}
		return null;
	};

	SvgBase.prototype._getDomId = function (sSufix) {
		var sId = this.getId();
		if (sSufix) {
			sId += "-" + sSufix;
		}
		return sId;
	};

	SvgBase.prototype._convertToSvg = function (oRoot) {
		var oRootSvg;

		var fnCreateAttributes = function (oNode) {
			var oProperties = {}, oAttribute;
			if (oNode.attributes) {
				for (var i = 0; i < oNode.attributes.length; i++) {
					oAttribute = oNode.attributes[i];
					oProperties[oAttribute.name] = oAttribute.value;
				}
			}

			return oProperties;
		};

		var fnConvert = function (oNode, oSvgParentNode) {
			var oChildNode, oSvgNode, sName = "";

			// only one child without local name is something line <text>TEXT TEXT</text> so we copy "innerHTML"
			// to text content property (which is kind of identical)
			if (oNode.childNodes.length === 1 && !oNode.childNodes[0].localName) {
				oSvgParentNode.textContent = oNode.childNodes[0].textContent;
				return;
			}

			for (var i = 0; i < oNode.childNodes.length; i++) {
				oChildNode = oNode.childNodes[i];
				sName = oChildNode.localName;
				// html parser makes tags lowercase, but SVG is case sensitive
				if (sName === "clippath") {
					sName = "clipPath";
				}

				oSvgNode = this._createElement(sName, fnCreateAttributes(oChildNode));
				oSvgParentNode.appendChild(oSvgNode);

				if (oChildNode.childNodes) {
					fnConvert(oChildNode, oSvgNode);
				}
			}
		}.bind(this);

		oRootSvg = this._createElement(oRoot[0].localName, fnCreateAttributes(oRoot[0]));
		fnConvert(oRoot[0], oRootSvg);

		return oRootSvg;
	};

	SvgBase.prototype._convertToStyle = function (mStyle, sAdditionalStyle, bSkipCreate) {
		var sStyle = "";
		if (mStyle) {
			Object.keys(mStyle).forEach(function (sAttribute) {
				var sValue = mStyle[sAttribute];
				if (typeof sValue !== "undefined" && sValue !== "") {
					sStyle += sAttribute;
					sStyle += ":";
					sStyle += mStyle[sAttribute] + ";";
				}
			});

			sStyle = sStyle + (sAdditionalStyle || "");

			if (!bSkipCreate && sStyle) {
				sStyle = "style=\"" + sStyle + "\"";
			}
		}

		return sStyle;
	};

	SvgBase.prototype._renderHtmlElement = function ( sElem, mStyle, mAttributes, oRm) {
		if (!oRm) {
		var sHtml = "";
			sHtml += "<" + sElem + " ";
		sHtml += this._convertToStyle(mStyle);

		if (mAttributes) {
			Object.keys(mAttributes).forEach(function (sAttribute) {
				var sValue = mAttributes[sAttribute];
				if (typeof sValue !== "undefined" && sValue !== "") {
					sHtml += sAttribute;
					sHtml += "=";
					sHtml += "\"" + sValue + "\"";
				}
			});
		}

			sHtml += ">";
			return sHtml;
		} else {
			oRm = sElem === "img" ? oRm.voidStart("img") : oRm.openStart(sElem);
			var sStyle = this._convertToStyle(mStyle, undefined, true);
			this.applyStyles(oRm, this.getStyleObject(sStyle));
			if (mAttributes) {
				Object.keys(mAttributes).forEach(function (sAttribute) {
					var sValue = mAttributes[sAttribute];
					if (typeof sValue !== "undefined" && sValue !== "") {
						if (sAttribute === "class") {
							sValue.split(" ").forEach(function(sClass) {
								if (sClass) {
									oRm.class(sClass);
								}
							});
						}  else if (sAttribute === "style") {
                            this.applyStyles(oRm, this.getStyleObject(sValue));
                        } else {
							oRm.attr(sAttribute, sValue);
						}
					}
				}.bind(this));
			}
			oRm = sElem === "img" ? oRm.voidEnd() : oRm.openEnd();
		}
	};

	SvgBase.prototype._renderHtmlIcon = function (sIcon, sClass, sId, sAttr, sTitle, oRm) {
		var oIconInfo = IconPool.getIconInfo(sIcon),
			sAriaLabel = "", sFontFamily = "";

		if (!oRm) {
			sId = sId ? "id=\"" + this.getId() + "-" + sId + "\"" : "";
			sClass = sClass || "";

			if (oIconInfo) {
				if (oIconInfo.fontFamily) {
					sFontFamily = "style=\"font-family:" + encodeXML(oIconInfo.fontFamily) + "\"";
				}
				sAriaLabel = sTitle ? " aria-label=\"" + encodeXML(sTitle) + "\" " : "";
				sTitle = sTitle ? " title=\"" + encodeXML(sTitle) + "\" " : "";

				return "<div " + sId + sTitle + sAriaLabel + " " + (sAttr || "") + "class=\"sapSuiteUiCommonsNetworkGraphIcon " + sClass + "\"><span " + sFontFamily + ">" + encodeXML(oIconInfo.content) + "</span></div>";
			}
			return "";
		} else {
			if (oIconInfo) {
				oRm.openStart("div");
				if (sId) {
					oRm.attr("id", this.getId() + "-" + sId);
				}
				if (sTitle) {
					oRm.attr("title", sTitle);
				}
				if (sTitle) {
					oRm.attr("aria-label", sTitle);
				}
				oRm.class("sapSuiteUiCommonsNetworkGraphIcon");
				if (sClass) {
					sClass.split(" ").forEach(function(sClassName) {
						if (sClassName) {
							oRm.class(sClassName);
						}
					});
				}
				oRm.openEnd();

				oRm.openStart("span");
				if (oIconInfo.fontFamily) {
					oRm.style("font-family", encodeXML(oIconInfo.fontFamily));
				}
				oRm.openEnd().text(oIconInfo.content).close("span");

				oRm.close("div");
			}
		}
	};

	return SvgBase;
});
