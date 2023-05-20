sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/suite/ui/commons/library",
	"sap/ui/core/Control",
	"sap/ui/core/theming/Parameters",
	"./TAccountPanel",
	"sap/ui/core/IconPool",
	"sap/ui/core/Icon",
	"sap/m/Button",
	"sap/base/security/encodeXML",
	"sap/ui/core/Configuration",
	"sap/ui/core/delegate/ItemNavigation",
	"./TAccountUtils",
	"sap/ui/core/ResizeHandler",
	"sap/ui/thirdparty/bignumber",
	"sap/ui/core/InvisibleText"
], function (jQuery, library, Control, Parameters, TAccountPanel, IconPool, Icon, Button, encodeXML, Configuration, ItemNavigation, TAccountUtils, ResizeHandler, BigNumber, InvisibleText) {
	"use strict";

	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

	/**
	 * Constructor for a new TAccountGroup.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The T account group control displays debit and credit entries for all {@link sap.suite.ui.commons.TAccount}
	 * controls included in the group.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.58.0
	 *
	 * @constructor
	 * @public
	 *
	 * @alias sap.suite.ui.commons.taccount.TAccountGroup
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) design time metamodel.
	 */
	var TAccountGroup = Control.extend("sap.suite.ui.commons.taccount.TAccountGroup", {
		metadata: {
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * Title of the group.
				 */
				title: {type: "string", group: "Misc", defaultValue: null},
				/**
				 * Defines whether the group should appear as collapsed. By default, it appears as expanded.
				 */
				collapsed: {type: "boolean", group: "Misc", defaultValue: false}
			},
			aggregations: {
				/**
				 * T accounts included in the group.
				 */
				accounts: {
					type: "sap.suite.ui.commons.taccount.TAccount", multiple: true, singularName: "account"
				}
			},
			events: {}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oGroup) {
				if (!oGroup._bThemeApplied) {
					return;
				}

				oRm.openStart("div", oGroup);
				oRm.class("sapSuiteUiCommonsAccountGroup");

				if (oGroup.getCollapsed()) {
					oRm.class("sapSuiteUiCommonsAccountGroupCollapsed");
				}

				oRm.attr("tabindex", 0);
				oRm.attr("aria-label", oGroup._getAriaText());
				oRm.openEnd();

				// header
				oRm.openStart("div")
					.class("sapSuiteUiCommonsGroupHeader")
					.openEnd();
				oRm.openStart("div")
					.class("sapSuiteUiCommonsGroupHeaderExpandWrapper")
					.openEnd();
				oRm.renderControl(oGroup._getExpandCollapse());
				oRm.close("div");

				oRm.openStart("div")
					.class("sapSuiteUiCommonsGroupHeaderFirst")
					.openEnd();
				oRm.openStart("span")
					.class("sapSuiteUiCommonsGroupHeaderTitle")
					.openEnd()
					.unsafeHtml(encodeXML(oGroup.getTitle()))
					.close("span");
				oRm.openStart("span")
					.attr("id", oGroup.getId() + "-sum")
					.class("sapSuiteUiCommonsGrouptHeaderSUM")
					.openEnd()
					.text(oGroup._getSumText())
					.close("span");

				oRm.openStart("div")
					.attr("id", " ")
					.class("sapSuiteUiCommonsGroupInfoIconWrapper")
					.class("sapSuiteUiCommonsTAccountBaseInfoIconWrapper")
					.attr("title", oResourceBundle.getText("TACCOUNT_SELECTED"))
					.openEnd();
				oRm.openStart("span").class("sapSuiteUiCommonsInfoIcon").openEnd();
				oRm.text("!");
				oRm.close("span");
				oRm.close("div");

				oRm.close("div");
				oRm.openStart("div")
					.class("sapSuiteUiCommonsGroupHeaderSecond")
					.openEnd();
				oRm.renderControl(oGroup._getExpandAllAccounts());
				oRm.renderControl(oGroup._getCollapseAllAccounts());
				oRm.close("div");
				oRm.close("div");
				oRm.openStart("div").attr("id", oGroup.getId() + "-content").class("sapSuiteUiCommonsAccountGroupContent").openEnd();

				oGroup.getAccounts().forEach(function (oItem) {
					oRm.renderControl(oItem);
				});

				oRm.close("div");
				oRm.close("div");
			}
		}
	});

	/* =========================================================== */
	/* Events													   */
	/* =========================================================== */
	TAccountGroup.prototype.init = function () {
		sap.ui.getCore().attachThemeChanged(function () {
			this._bThemeApplied = true;
			this.invalidate();
		}, this);

		this._bThemeApplied = sap.ui.getCore().isThemeApplied();

		if (!this._sResizeHandlerId) {
			this._sResizeHandlerId = ResizeHandler.register(this, this._adjustUI.bind(this));
		}
		//Setting invisible text
		this._oInvisibleText = new InvisibleText();
		this._oInvisibleText.toStatic();
	};

	TAccountGroup.prototype.exit = function () {
		if (this._oIconExpand) {
			this._oIconExpand.destroy();
		}

		if (this._oIconCollapse) {
			this._oIconCollapse.destroy();
		}

		if (this._sResizeHandlerId) {
			ResizeHandler.deregister(this._sResizeHandlerId);
			this._sResizeHandlerId = "";
		}
		this._bAttachEventListener = false;
	};

	TAccountGroup.prototype.onBeforeRendering = function () {
		this._bRendered = false;
		this._oSum = null;
		this._iColumnCount = -1;
	};

	TAccountGroup.prototype.onAfterRendering = function () {
		this._adjustUI();
		this._bRendered = true;

		var oParent = this.getParent();
		if (oParent && this._hasPanelParent(oParent) && oParent._bRendered) {
			oParent._recalculate();
		}

		if (this.getCollapsed()) {
			this.$("content").hide();
		}
	};

	/* =========================================================== */
	/* Public methods											   */
	/* =========================================================== */
	/**
	 * Resets the internal state of the T account group.
	 * @since 1.68
	 * @public
	 */
	TAccountGroup.prototype.reset = function () {
		this._oSum = null;
	};

	/* =========================================================== */
	/* Private methods											   */
	/* =========================================================== */
	TAccountGroup.prototype.updateBindingContext = function () {
		this.reset();
		return Control.prototype.updateBindingContext.apply(this, arguments);
	};

	TAccountGroup.prototype._hasPanelParent = function (oParent) {
		return (oParent || this.getParent()) instanceof TAccountPanel;
	};

	TAccountGroup.prototype._getExpandCollapse = function () {
		var bCollapsed = this.getCollapsed(),
			sText = this._getExpandAltText(!bCollapsed);

		if (!this._oArrowDown) {
			this._oArrowDown = new Icon({
				src: bCollapsed ? "sap-icon://navigation-right-arrow" : "sap-icon://navigation-down-arrow",
				alt: sText,
				tooltip: sText,
				press: function () {
					this._expandCollapse();
				}.bind(this)
			});
		}

		return this._oArrowDown;
	};

	TAccountGroup.prototype._getExpandAltText = function (bCollapse) {
		return (bCollapse ? oResourceBundle.getText("TACCOUNT_COLLAPSE") : oResourceBundle.getText("TACCOUNT_EXPAND")) + " " + (this.getTitle() ? this.getTitle() : oResourceBundle.getText("TACCOUNT_GROUP_TITLE"));
	};

	TAccountGroup.prototype._expandCollapse = function () {
		var bCollapsed = this.getCollapsed(),
			sText = this._getExpandAltText(bCollapsed);

		this._getExpandCollapse().setTooltip(sText);
		this._getExpandCollapse().setAlt(sText);
		this._getExpandCollapse().setSrc(bCollapsed ? "sap-icon://navigation-down-arrow" : "sap-icon://navigation-right-arrow");
		this.setProperty("collapsed", !bCollapsed);

		this._bIsExpanding = true;
		this.$("content")[bCollapsed ? "show" : "hide"]("medium", function () {
			this._bIsExpanding = false;
		}.bind(this));

		this.$()[!bCollapsed ? "addClass" : "removeClass"]("sapSuiteUiCommonsAccountGroupCollapsed");
	};

	TAccountGroup.prototype._expandCollapseAllAccounts = function (bExpand) {
		this.getAccounts().forEach(function (oAccount) {
			oAccount.setCollapsed(!!bExpand);
		});
		if (bExpand == true){
			this._oInvisibleText.setText(oResourceBundle.getText("TACCOUNT_COLLAPSE_ALL"));
		}else {
			this._oInvisibleText.setText(oResourceBundle.getText("TACCOUNT_EXPAND_ALL"));
		}

	};

	TAccountGroup.prototype._getExpandAllAccounts = function () {
		if (!this._oIconExpand) {
			this._oIconExpand = new Button({
				icon: "sap-icon://expand-all",
				type: "Transparent",
				tooltip: oResourceBundle.getText("TACCOUNT_EXPAND") + " " + oResourceBundle.getText("TACCOUNT_ALL") + " " + oResourceBundle.getText("TACCOUNT_TITLE"),
				ariaDescribedBy: this._oInvisibleText.getId(),
				press: function () {
					this._expandCollapseAllAccounts(false);
					if (!this._bAttachEventListener) {
					this._focusOutOnExpandCollapse();
					this._bAttachEventListener = true;
					}
				}.bind(this)
			}).addStyleClass("sapSuiteUiCommonsGroupHeaderIcon");

		}

		return this._oIconExpand;
	};

	TAccountGroup.prototype._getCollapseAllAccounts = function () {
		if (!this._oIconCollapse) {
			this._oIconCollapse = new Button({
				icon: "sap-icon://collapse-all",
				type: "Transparent",
				tooltip: oResourceBundle.getText("TACCOUNT_COLLAPSE") + " " + oResourceBundle.getText("TACCOUNT_ALL") + " " + oResourceBundle.getText("TACCOUNT_TITLE"),
				ariaDescribedBy: this._oInvisibleText.getId(),
				press: function () {
					this._expandCollapseAllAccounts(true);
					if (!this._bAttachEventListener) {
						this._focusOutOnExpandCollapse();
						this._bAttachEventListener = true;
						}
				}.bind(this)
			}).addStyleClass("sapSuiteUiCommonsGroupHeaderIcon");
		}

		return this._oIconCollapse;
	};
	TAccountGroup.prototype._focusOutOnExpandCollapse = function () {
			this._oIconCollapse.getDomRef().addEventListener('focusout', function(){
				this._oInvisibleText.setText();
				}.bind(this));
			this._oIconExpand.getDomRef().addEventListener('focusout', function(){
				this._oInvisibleText.setText();
				}.bind(this));
	};

	TAccountGroup.prototype._getSum = function (bForce) {
		var aAccounts = this.getAccounts(),
			iSum = new BigNumber("0"),
			sMeasure = "",
			bCorrect = true;

		if (!this._oSum || bForce) {
			for (var i = 0; i < aAccounts.length; i++) {
				var oAccount = aAccounts[i];

				if (sMeasure && sMeasure !== oAccount.getMeasureOfUnit()) {
					bCorrect = false;
					break;
				}

				sMeasure = oAccount.getMeasureOfUnit();
				iSum = iSum.plus(oAccount._getSum());
			}

			this._oSum = {
				sum: iSum,
				measure: sMeasure,
				correct: bCorrect
			};
		}

		return this._oSum;
	};

	TAccountGroup.prototype._getSumText = function () {
		var oSum = this._getSum();
		var oParent = this.getParent();
		if (oSum && oSum.correct) {
			var sValue = TAccountUtils.formatCurrency(oSum.sum, oSum.measure, (oParent instanceof TAccountPanel) ? oParent.getMaxFractionDigits() : 0);

			return (oSum.sum > 0 ? oResourceBundle.getText("TACCOUNT_CREDIT") : oResourceBundle.getText("TACCOUNT_DEBIT")) + ": " + sValue + " " + encodeXML(oSum.measure);
		}

		return "-";
	};

	TAccountGroup.prototype._getAriaText = function () {
		return oResourceBundle.getText("TACCOUNT_GROUP_TITLE") + " " + (this.getTitle() ? (this.getTitle() + " ") : "") + this._getSumText();
	};

	TAccountGroup.prototype._adjustUI = function () {
		var COL_BASE_WIDTH = 320,
			SEPARATOR = 16,
			COL_WIDTH = COL_BASE_WIDTH + SEPARATOR;

		var $source = this.$("content"),
			iWidth = $source.width(),
			iColCount = Math.max(Math.ceil(iWidth / (COL_WIDTH)) - 1, 1);

		if (iColCount === this._iColumnCount) {
			return;
		}

		if (this._bIsExpanding || (this._bRendered && this.getCollapsed())) {
			return;
		}

		var $target = jQuery("<div id=\"" + this.getId() + "-content\" class=\"sapSuiteUiCommonsAccountGroupContent\"></div>"),
			aHeights = Array.apply(null, Array(iColCount)).map(Number.prototype.valueOf, 0);

		var $accounts = this.$().find(".sapSuiteUiCommonsAccount"),
			iCol = 0;

		this._iColumnCount = iColCount;
		this._iDivs = [];

		var sDroppingArea = "<div class=\"sapSuiteUiCommonsAccountGroupDroppingArea\"><div class=\"sapSuiteUiCommonsAccountGroupDroppingAreaInner\">" +
			"</div><div class=\"sapSuiteUiCommonsAccountGroupDroppingAreaInnerBall\"></div><div class=\"sapSuiteUiCommonsAccountGroupDroppingAreaInnerText\">" + oResourceBundle.getText("TACCOUNT_DROP_HERE") + "</div></div>";

		for (var i = 0; i < iColCount; i++) {
			var sDiv = "<div class=\"sapSuiteUiCommonsAccountGroupColumn\">" + sDroppingArea + "</div>",
				$div = jQuery(sDiv);

			$target.append($div);
			this._iDivs.push($div);
		}

		for (var i = 0; i < $accounts.length; i++) {
			var $account = jQuery($accounts[i]),
				iCurrentHeight = $account.height(),
				$col = this._iDivs[iCol];

			var iMinHeight = Number.MAX_VALUE,
				iMinCol = 0;

			for (var k = 0; k < iColCount; k++) {
				var iColumnHeight = aHeights[k];

				if (iColumnHeight < iMinHeight) {
					iMinHeight = iColumnHeight;
					iMinCol = k;
				}
			}

			var $col = this._iDivs[iMinCol];
			$account.detach().appendTo($col);
			jQuery(sDroppingArea).appendTo($col);

			aHeights[iMinCol] += iCurrentHeight;
		}

		$source.detach();
		this.$().append($target);

		this._setupDroppable();
	};

	TAccountGroup.prototype._setupDroppable = function () {
		var fnGetDropArea = function (oItem) {
			var $droppingArea = jQuery(oItem);
			return $droppingArea.hasClass("sapSuiteUiCommonsTAccountDropZoneTop") ? $droppingArea.parent().prev() : $droppingArea.parent().next();
		};

		var fnDrop = function ($droppingArea, ui) {
			var $item = ui.draggable,
				$zone = $item.next();

			// at least one zone must remain
			if ($zone[0] !== $droppingArea[0]) {
				$zone.detach().insertAfter($droppingArea);
				$item.detach().insertAfter($droppingArea);
			} else {
				$item.detach().insertBefore($droppingArea);
			}

			$droppingArea.removeClass("sapSuiteUiCommonsAccountGroupDroppingAreaActiveSide");

			$item.css("left", "0px");
			$item.css("top", "0px");
		};

		var aItems = this.$().find(".sapSuiteUiCommonsAccountGroupDroppingArea");
		aItems.droppable({
			scope: this.getId() + "-content",
			tolerance: "pointer",
			activeClass: "sapSuiteUiCommonsAccountGroupDroppingAreaActive",
			hoverClass: "sapSuiteUiCommonsAccountGroupDroppingAreaActive",
			drop: function (oEvent, ui) {
				var $droppingArea = jQuery(this);

				fnDrop($droppingArea, ui);
			}
		});

		var aCornerZones = this.$().find(".sapSuiteUiCommonsTAccountDropZoneBottom, .sapSuiteUiCommonsTAccountDropZoneTop");
		aCornerZones.droppable({
			scope: this.getId() + "-content",
			tolerance: "pointer",
			drop: function (event, ui) {
				var $droppingArea = jQuery(this);

				$droppingArea = $droppingArea.hasClass("sapSuiteUiCommonsTAccountDropZoneTop") ? $droppingArea.parent().prev() : $droppingArea.parent().next();
				fnDrop($droppingArea, ui);

			},
			over: function (event, ui) {
				fnGetDropArea(this).addClass("sapSuiteUiCommonsAccountGroupDroppingAreaActiveSide");
			},
			out: function (event, ui) {
				fnGetDropArea(this).removeClass("sapSuiteUiCommonsAccountGroupDroppingAreaActiveSide");
			}
		});
	};

	TAccountGroup.prototype._valueChanged = function (iDiff, bIsDebit) {
		if (this._oSum) {
			if (bIsDebit) {
				this._oSum.sum = this._oSum.sum.minus(iDiff);
			} else {
				this._oSum.sum = this._oSum.sum.plus(iDiff);
			}
			this.$("sum").text(this._getSumText());

			var oParent = this.getParent();
			if (this._hasPanelParent(oParent)) {
				// bIsInvalid ? oParent._setInvalid(true) : oParent._valueChanged(iDiff);
				oParent._valueChanged(iDiff, bIsDebit);
			}
		}
	};

	TAccountGroup.prototype._measureChanged = function (sMeasure) {
		if (this._oSum) {
			// we don't know whether this changed account measure was the problem of wrong group measure
			// so we need to collect all data again
			if (this._oSum.measure === sMeasure && !this._oSum.correct) {
				this._recalculate();
				return;
			}

			// different measure then the rest of the group
			// we don't need calculate anything just let parent know it is invalid
			if (this._oSum.measure !== sMeasure && this._oSum.correct) {
				var oParent = this.getParent();

				this._oSum.correct = false;

				if (this._hasPanelParent(oParent)) {
					oParent._setInvalid();
				}
			}

			this.$("sum").text(this._getSumText());
		}
	};

	TAccountGroup.prototype._recalculate = function () {
		this._oSum = this._getSum(true);
		this.$("sum").text(this._getSumText());

		var oParent = this.getParent();
		if (this._hasPanelParent(oParent)) {
			oParent._recalculate();
		}
	};

	TAccountGroup.prototype._hasPanelParent = function (oParent) {
		return (oParent || this.getParent()) instanceof TAccountPanel;
	};

	TAccountGroup.prototype.invalidate = function () {
		this._bRendered = false;
		Control.prototype.invalidate.apply(this, arguments);
	};

	return TAccountGroup;

});
