/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/suite/ui/commons/library",
	"./SvgBase",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/theming/Parameters",
	"sap/m/CheckBox",
	"sap/m/library"
], function (jQuery, library, SvgBase, ManagedObject, Parameters, CheckBox, MobileLibrary) {
	"use strict";

	var ValueCSSColor = MobileLibrary.ValueCSSColor,
		Status = library.networkgraph.ElementStatus,
		HeaderCheckboxState = library.networkgraph.HeaderCheckboxState;

	/**
	 * Constructor for a new ElementBase.
	 *
	 * @class
	 * ElementBase class
	 *
	 * @extends sap.suite.ui.commons.networkgraph.SvgBase
	 *
	 * @constructor
	 * @public
	 * @since 1.50
	 * @abstract
	 * @alias sap.suite.ui.commons.networkgraph.ElementBase
	 */
	var ElementBase = SvgBase.extend("sap.suite.ui.commons.networkgraph.ElementBase", {
		metadata: {
			properties: {
				/**
				 * A title associated with the element.
				 */
				title: {
					type: "string", group: "Misc", defaultValue: null
				},
				/**
				 * Description.
				 */
				description: {
					type: "string", group: "Misc", defaultValue: null
				},
				/**
				 * Status associated with this element. You can use any of the custom statuses defined by the <code>statuses</code>
				 * aggregation in the {@link sap.suite.ui.commons.networkgraph.Graph} or use the default statuses provided
				 * by {@link sap.suite.ui.commons.networkgraph.ElementStatus}.
				 */
				status: {
					type: "string",
					group: "Appearance",
					defaultValue: Status.Standard
				}
			},
			aggregations: {
				/**
				 * Attributes associated with the element.
				 */
				attributes: {
					type: "sap.suite.ui.commons.networkgraph.ElementAttribute",
					multiple: true,
					singularName: "attribute"
				}
			}
		},
		renderer: {}
	});

	/**
	 * Scrolls the view port to show this element
	 *
	 * @public
	 */
	ElementBase.prototype.scrollToElement = function () {
		var oParent = this.getParent();

		if (oParent) {
			oParent._scrollToElement(this);
		}
	};

	ElementBase.prototype._afterRenderingBase = function () {
		var oParent = this.getParent(),
			$parent, oSvgElement;
		// due to the fact how render manager works (it parse html via doc. fragment) which doesn't
		// work with SVG elements we have to rerender it properly again in after rendering
		// to get this event triggered we still set some stuff to render manager in render function

		// for some browsers innerHTML is not working(so we have to convert parsed HTML to it's SVG representatives
		// and replace it manually
		var bIsHtmlNode = oParent && oParent._isUseNodeHtml() && this.isA("sap.suite.ui.commons.networkgraph.Node"),
			bIsGroup = this.isA("sap.suite.ui.commons.networkgraph.Group");
		if (!bIsHtmlNode && !bIsGroup) {
			if (this._cannotAppendInnerHtml()) {
				$parent = this.$().parent();
				oSvgElement = this._convertToSvg(jQuery.parseHTML(this._render()));

				$parent[0].replaceChild(oSvgElement, this.$()[0]);
			} else {
				this.$()[0].outerHTML = this._render();
			}
		}

		this._afterRendering();
	};

	ElementBase.prototype._removeFromInvalidatedControls = function () {
		try {
			// remove this control from invalidated controls
			this.getUIArea()._onControlRendered(this);
		} catch (e) {
			// just continue
		}
	};

	ElementBase.prototype._setFocus = function (bFocus) {
		var fnName = bFocus ? "addClass" : "removeClass";
		this.$()[fnName](this.FOCUS_CLASS);
	};

	ElementBase.prototype._replaceId = function ($el, sSuffix) {
		if ($el.attr("id")) {
			$el.attr("id", $el.attr("id") + sSuffix);
		}

		$el.removeAttr("data-sap-ui");

		var aChildren = $el.children();
		if (aChildren.length === 0) {
			return;
		}

		aChildren.each(function (i, oChild) {
			this._replaceId(jQuery(oChild), sSuffix);
		}.bind(this));
	};


	ElementBase.prototype._useInLayout = function () {
		return true;
	};

	ElementBase.prototype._hasFocus = function () {
		return this.$().hasClass(this.FOCUS_CLASS);
	};

	ElementBase.prototype._hasDefaultStatus = function (sStatus) {
		sStatus = sStatus || this.getStatus();
		return sStatus === Status.Error || sStatus === Status.Information || sStatus === Status.Warning || sStatus === Status.Success;
	};

	ElementBase.prototype._hasCustomStatus = function (sStatus) {
		sStatus = sStatus || this.getStatus();
		if (sStatus === Status.Standard || this._hasDefaultStatus(sStatus)) {
			return false;
		}

		return !!sStatus;
	};

	ElementBase.prototype._isCustomStatusColor = function (sStatus) {
		return sStatus !== ElementBase.ColorType.BorderWidth && sStatus !== ElementBase.ColorType.BorderStyle;
	};

	ElementBase.prototype._getElementId = function (sSuffix) {
		return sSuffix ? this.getId() + sSuffix : this.getId();
	};

	ElementBase.prototype._getColor = function (sType, sStatus) {
		var oParent = this.getParent(),
			sFnName, oStatus, sColor = "";

		// this function is for situations when you are rendering node which is selected
		// in such situation you don't want to draw default colors but the selected ones.
		var fnSanitizeType = function () {
			if (typeof this.getSelected === "function" && this.getSelected()) {
				if (sType === ElementBase.ColorType.Background || sType === ElementBase.ColorType.Content || sType === ElementBase.ColorType.Border) {
					sType = "Selected" + sType;
				}

				if (sType == ElementBase.ColorType.HeaderContent && this._isBox()) {
					sType = ElementBase.ColorType.Content;
				}
			}

		}.bind(this);

		sStatus = sStatus || this.getStatus();

		if (!this._hasCustomStatus(sStatus)) {
			return "";
		}

		if (!oParent || !sType) {
			return "";
		}

		oStatus = oParent._oStatuses[sStatus];
		if (oStatus) {
			if (sType.indexOf("Focus") !== -1) {
				if (!oStatus.getUseFocusColorAsContentColor()) {
					return "";
				}

				sType = sType.replace("Focus", "Content");
			}

			fnSanitizeType();

			sFnName = "get" + sType + "Color";
			var sName = oStatus[sFnName]();
			if (sName) {
				var sColor = Parameters.get(sName);
				if (!sColor && sName && ValueCSSColor.isValid(sName)) {
					sColor = sName;
				}
			}
		}

		return sColor ? sColor : "";
	};


	ElementBase.prototype._getStatusValue = function (sType, sStatus) {
		var oParent = this.getParent(),
			oStatus;

		sStatus = sStatus || this.getStatus();

		if (!this._hasCustomStatus(sStatus)) {
			return "";
		}

		if (!oParent || !sType) {
			return "";
		}

		oStatus = oParent._oStatuses[sStatus];
		if (oStatus) {
			return oStatus["get" + sType]();
		}

		return "";
	};

	ElementBase.prototype._getStatusStyle = function (oParameters, bCreateStyle) {
		var sStyle = "";

		if (!this._hasCustomStatus()) {
			return "";
		}

		Object.keys(oParameters).forEach(function (sKey) {
			var sValue = this._isCustomStatusColor(oParameters[sKey]) ? this._getColor(oParameters[sKey]) : this._getStatusValue(oParameters[sKey]);
			if (sValue) {
				if (sStyle) {
					sStyle += ";";
				}
				sStyle += sKey + ":" + sValue;
			}
		}, this);

		if (bCreateStyle && sStyle) {
			sStyle = "style=\"" + sStyle + "\"";
		}

		return sStyle;
	};

	ElementBase.prototype._checkForProcessData = function () {
		var oParent = this.getParent();
		if (oParent && oParent._bRequiresDataProcessing) {
			oParent._processData();
		}
	};

	ElementBase.prototype.getStyleObject = function(sStyle) {
		var result = {};
		if (sStyle) {
			var attributes = sStyle.split(';');

				for (var i = 0; i < attributes.length; i++) {
					if (attributes[i]) {
					var entry = attributes[i].split(':');
					result[entry.splice(0,1)[0]] = entry.join(':');
				}
			}
		}
		return result;
	};

	ElementBase.prototype.applyStyles = function(oRm, oStyle) {
		Object.keys(oStyle).forEach(function (sAttribute) {
			oRm.style(sAttribute, oStyle[sAttribute]);
		});
	};

	/**
	 * Return all visible attributes
	 * @returns {array} return array with attributes with visible flag ON
	 */
	ElementBase.prototype.getVisibleAttributes = function () {
		return this.getAttributes().filter(function (oAttr) {
			return oAttr.getVisible();
		});
	};

	/**
	 * @param {string} sPropertyName Name of the property to set.
	 * @param {object} oValue Value to set the property to.
	 * @param {boolean} bSuppressInvalidate Whether to suppress resulting invalidation
	 */
	ElementBase.prototype.setProperty = function (sPropertyName, oValue, bSuppressInvalidate) {
		var aProcessRequiredProperties = Object.getPrototypeOf(this).aProcessRequiredProperties;

		ManagedObject.prototype.setProperty.call(this, sPropertyName, oValue, bSuppressInvalidate);
		if (aProcessRequiredProperties && (aProcessRequiredProperties.indexOf(sPropertyName) !== -1) && this.getParent()) {
			this.getParent()._bRequiresDataProcessing = true;
		}
	};

	ElementBase.prototype.toString = function () {
		return this.getMetadata()._sClassName + " - " + this.getTitle();
	};

	/* =========================================================== */
	/* Rendering (HTML output)*/
	/* =========================================================== */
	ElementBase.prototype._correctTitle = function (sClass) {
		if (this.getTitle()) {
			var $text = this.$().find("." + sClass);

			if ($text[0]) {
				var iTitleLength = $text[0].getBBox().width,
					iMaxWidth = parseInt($text.attr("maxwidth"), 10);

				if (iTitleLength > iMaxWidth) {
					this._createText($text[0], {
						text: this.getTitle(), // Doesn't need escaping as the text is set using textContent, which is not parsed as HTML.
						hCenter: true
					});
				}
			}
		}
	};

	ElementBase.prototype._renderTitle = function (mArguments) {
		// IE doesn't support dominant-baseline so we have to move it a bit for this browser
		var PSEUDO_HEIGHT = 10;

		var sHtml = this._renderControl("g", {
			"clip-path": "url(#" + this.getId() + "-title-clip)"
		}, false);

		sHtml += this._renderText({
			attributes: {
				"style": mArguments.style,
				"class": mArguments.class,
				x: mArguments.x,
				y: mArguments.y,
				maxWidth: mArguments.maxWidth
			},
			text: mArguments.title,
			height: PSEUDO_HEIGHT
		});
		sHtml += "</g>";

		return sHtml;
	};

	ElementBase.prototype._renderClipPath = function (mArguments) {
		var sHtml = this._renderControl("clipPath", {
			id: mArguments.id
		}, false);

		sHtml += this._renderControl("rect", {
			x: mArguments.x,
			y: mArguments.y,
			width: mArguments.width || this._iWidth,
			height: mArguments.height || this._iHeight,
			direction: mArguments.direction || ""
		});
		sHtml += "</clipPath>";

		return sHtml;
	};

	ElementBase.prototype._renderClonedControl = function (mOptions, oContent) {
		if (mOptions.mapRender) {
			var $clone = oContent.$().clone();
			this._replaceId($clone, mOptions.idSufix);
			mOptions.renderManager.unsafeHtml($clone[0].outerHTML);
		} else {
			mOptions.renderManager.renderControl(oContent);
		}
	};

	ElementBase.prototype._appendActionButton = function (mArguments, $wrapper) {
		var sId = mArguments.id ? "id=\"" + mArguments.id + "\"" : "";
		var sButtonHtml = "<div " + sId + " title=\"" + mArguments.title + "\"class=\"sapSuiteUiCommonsNetworkGraphDivActionButtonBackground\">";
		sButtonHtml += "<div class=\"sapSuiteUiCommonsNetworkGraphDivActionButton ";

		if (!mArguments.enable) {
			sButtonHtml += "sapSuiteUiCommonsNetworkGraphDivActionButtonDisabled\"";
			sButtonHtml += "style = \" display: none";
		}
		sButtonHtml += "\">";

		sButtonHtml += this._renderHtmlIcon(mArguments.icon, (mArguments.class || ""));

		sButtonHtml += "</div>";
		sButtonHtml += "<div class=\"sapSuiteUiCommonsNetworkActionButtonFocusCircle\"></div>";
		sButtonHtml += "</div>";

		var $button = jQuery(sButtonHtml);
		if (mArguments.enable && mArguments.click) {
			$button.on("click", mArguments.click);
			$button.on("click", function (evt) {
				if (this.getParent()) {
					this.getParent().setFocus({
						item: this,
						button: $button[0]
					},true);
				}
			}.bind(this));
		}

		$wrapper.append($button);
	};

	ElementBase._isRectOnScreen = function (iX1, iX2, iY1, iY2, iLeft, iRight, iTop, iBottom) {
		return (Math.max(iX1, iX2) > iLeft) && (Math.min(iX1, iX2) < iRight) && (Math.max(iY1, iY2) > iTop) &&
			(Math.min(iY1, iY2) < iBottom);
	};

	ElementBase.prototype._isOnScreen = function (iLeft, iRight, iTop, iBottom) {
		return false;
	};

	/* =========================================================== */
	/* Getters & setters*/
	/* =========================================================== */
	ElementBase.prototype._setHeaderCheckBoxState = function (sValue) {
		if (sValue !== HeaderCheckboxState.Hidden) {
			this._getHeaderCheckbox().setSelected(sValue === HeaderCheckboxState.Checked);
			this._getHeaderCheckbox().setVisible(true);
		} else if (this.getAggregation("_checkBox")) {
			this._getHeaderCheckbox().setVisible(false);
		}

		this.setProperty("headerCheckBoxState", sValue);
	};

	ElementBase.prototype.setVisible = function (bVisible) {
		var oGraph = this.getParent();

		this.setProperty("visible", bVisible);
		if (oGraph) {
			oGraph.setFocus(null);
			oGraph._setupKeyboardNavigation();
		}
		return this;
	};

	ElementBase.prototype.setStatus = function (sStatus) {
		var oGraph = this.getParent();

		this.setProperty("status", sStatus);

		if (oGraph && oGraph._bIsLayedOut) {
			oGraph.updateLegend();
		}

		return this;
	};

	ElementBase.ColorType = Object.freeze({
		BorderStyle: "BorderStyle",
		BorderWidth: "BorderWidth",
		Background: "Background",
		Border: "Border",
		Content: "Content",
		HeaderContent: "HeaderContent",
		SelectedBorder: "SelectedBorder",
		SelectedBackground: "SelectedBackground",
		SelectedContent: "SelectedContent",
		HoverBackground: "HoverBackground",
		HoverBorder: "HoverBorder",
		HoverContent: "HoverContent",
		Focus: "Focus",
		HoverFocus: "HoverFocus",
		SelectedFocus: "SelectedFocus"
	});

	return ElementBase;
});
