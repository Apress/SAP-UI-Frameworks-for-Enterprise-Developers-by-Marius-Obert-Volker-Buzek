sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/Icon',
	'sap/ui/base/ManagedObject',
	'sap/ui/core/delegate/ItemNavigation',
	"sap/ui/core/ResizeHandler"
], function (jQuery, library, Control, Icon, ManagedObject, ItemNavigation, ResizeHandler) {
	"use strict";

	var RenderType = library.MicroProcessFlowRenderType;
	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

	var fnLastItem = function (aItems) {
		return aItems[aItems.length - 1];
	};

	/**
	 * Constructor for a new MicroProcessFlow.
	 *
	 * @class
	 * The MicroProcessFlow control can be used to track the progress of a process.<br>
	 * It is best used for linear processes, such as document, order, and approval flows,
	 * and can be embedded in tiles, tables, and other containers.<br>
	 * <br>
	 * To display more complex processes and workflows, use {@link sap.suite.ui.commons.ProcessFlow} instead.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.commons.MicroProcessFlow
	 */
	var MicroProcessFlow = Control.extend("sap.suite.ui.commons.MicroProcessFlow", /** @lends sap.teaminstinct.prototypes.MicroProcessFlow.prototype */ {
		metadata: {
			library: "sap.suite.ui.commons",
			interfaces : [
				"sap.ui.core.IFormContent"
			],
			properties: {
				/**
				 * ARIA label for this control to be used by screen reader software.
				 */
				ariaLabel: {type: "string", defaultValue: null},

				/**
				 * Determines how the micro process flow should be rendered inside its parent container.
				 * <br>When the width of the parent container does not allow for all nodes in the micro
				 * process flow to be displayed, you can wrap it inside the parent container or add
				 * scrolling icons.
				 */
				renderType: {
					type: "sap.suite.ui.commons.MicroProcessFlowRenderType",
					defaultValue: sap.suite.ui.commons.MicroProcessFlowRenderType.Wrap
				},
				/**
				 * The width of the micro process flow.
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					defaultValue: ""
				}
			},
			aggregations: {
				/**
				 * Holds the nodes and other content diplayed in the micro process flow.
				 */
				content: {
					type: "sap.suite.ui.commons.MicroProcessFlowItem", multiple: true, singularName: "content"
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRM, oMicroProcessFlow) {
			var aContent = oMicroProcessFlow.getContent(),
				sWidth = oMicroProcessFlow.getWidth(),
				iLength = aContent.length,
				sLabel = oMicroProcessFlow.getAriaLabel();

			// wait for CSS loaded
			if (!oMicroProcessFlow._bThemeApplied) {
				return;
			}

			oRM.openStart("div", oMicroProcessFlow);

			oRM.attr("role", "listbox");
			oRM.attr("aria-roledescription", oResourceBundle.getText("ACC_CTR_TYPE_MICRO_PROCESS_FLOW"));
			oRM.attr("aria-label",sLabel);

			if (sWidth) {
				oRM.style("width", sWidth);
			}

			oRM.class("sapSuiteUiCommonsMicroProcessFlow");
			oRM.openEnd();

			if (oMicroProcessFlow._hasScrolling()) {
				oRM.openStart("div");
				oRM.attr("tabindex", "0");
				oRM.attr("id", oMicroProcessFlow.getId() + "-leftscroller");
				oRM.class("sapSuiteUiCommonsMicroProcessFlowScroller").class("sapSuiteUiCommonsMicroProcessFlowLeftScroller");
				oRM.openEnd();
				oRM.renderControl(oMicroProcessFlow._getLeftScroller());
				oRM.openStart("span");
				oRM.attr("id", oMicroProcessFlow.getId() + "-leftlabel");
				oRM.class("sapSuiteUiCommonsMicroProcessFlowLeftLabel");
				oRM.openEnd();
				oRM.close("span");
				oRM.close("div");

			}

			oRM.openStart("div");
			oRM.attr("id", oMicroProcessFlow.getId() + "-content");
			oRM.class("sapSuiteUiCommonsMicroProcessFlowContent");
			oRM.openEnd();
			oRM.openStart("div");
			oRM.attr("id", oMicroProcessFlow.getId() + "-scrolling");
			oRM.class("sapSuiteUiCommonsMicroProcessFlowScrolling").class("sapSuiteUiCommonsMicroProcessFlowScrollingTransition");

			if (oMicroProcessFlow.getRenderType() === RenderType.Wrap) {
				oRM.style("flex-wrap", "wrap");
			}

			oRM.openEnd();

			aContent.forEach(function (oItem, i) {
				oItem._setAccessibilityData(i + 1, iLength);
				oRM.renderControl(oItem);
			});

			oRM.close("div");
			oRM.close("div");

			if (oMicroProcessFlow._hasScrolling()) {
				oRM.openStart("div");
				oRM.attr("id", oMicroProcessFlow.getId() + "-rightscroller");
				oRM.attr("tabindex", "0");
				oRM.class("sapSuiteUiCommonsMicroProcessFlowScroller").class("sapSuiteUiCommonsMicroProcessFlowRightScroller");
				oRM.openEnd();
				oRM.openStart("span");
				oRM.attr("id", oMicroProcessFlow.getId() + "-rightlabel");
				oRM.class("sapSuiteUiCommonsMicroProcessFlowRightLabel");
				oRM.openEnd();
				oRM.close("span");
				oRM.renderControl(oMicroProcessFlow._getRightScroller());
				oRM.close("div");
			}

			oRM.close("div");
		}
		}
	});

	MicroProcessFlow.prototype.exit = function() {
		if (this._oLeftScroller) {
			this._oLeftScroller.destroy();
		}

		if (this._oRightScroller) {
			this._oRightScroller.destroy();
		}
	};

	MicroProcessFlow.prototype.init = function () {
		sap.ui.getCore().attachThemeChanged(function () {
			this._bThemeApplied = true;
			this.invalidate();
		}, this);

		this._bThemeApplied = sap.ui.getCore().isThemeApplied();
		this._iScrollingIndex = 0;
		this._iLastVisibleIndex = 0;

		this._aEdges = [];
		this._aWidths = [];
		this._aSeperatorWidth = [];
	};

	MicroProcessFlow.prototype.onAfterRendering = function () {
		this._correctSeparatorWidth();
		this._setupKeyboard();

		if (this._hasScrolling()) {
			this._setupScrolling();
			this._collectEdgesAndWidths();
			this._updateScrollingElements();

			if (this.getRenderType() === RenderType.ScrollingWithResizer) {
				this._oResizer = ResizeHandler.register(this, jQuery.proxy(this._performResizeChanges, this));
			}
		}
	};

	MicroProcessFlow.prototype._performResizeChanges = function () {
		this._collectEdgesAndWidths();
		this._updateScrollingElements();
	};

	/* =========================================================== */
	/* Private methods */
	/* =========================================================== */
	MicroProcessFlow.prototype._isLastItem = function (oItem) {
		return oItem === this.getContent()[this.getContent().length - 1];
	};

	MicroProcessFlow.prototype._getMaxHeight = function (oItem) {
		return Math.max.apply(null, this.$().find(".sapSuiteUiCommonsMicroProcessFlowItemWrapper").map(function () {
			return jQuery(this).height();
		}).get());
	};

	MicroProcessFlow.prototype._correctSeparatorWidth = function () {
		// get max height of all items
		// we just cant take graph height as it may be devided into multiple lines
		var iMaxHeight = this._getMaxHeight();

		if (iMaxHeight) {
			this.getContent().forEach(function (oItem) {
				var sStepDistance = oItem.getStepWidth(),
					iStepDistance;
				if (sStepDistance.indexOf("%") !== -1) {
					iStepDistance = parseInt(sStepDistance, 10);
					if (!isNaN(iStepDistance)) {
						oItem.$("separator").width(iMaxHeight / iStepDistance * 100);
					}
				}
			}, this);
		}
	};

	MicroProcessFlow.prototype._firePress = function () {
		if (this._oItemNavigation) {
			var iIndex = this._oItemNavigation.getFocusedIndex(),
				iItem = this.getContent()[iIndex];
			if (iItem) {
				iItem._firePress();
			}
		}
	};

	MicroProcessFlow.prototype._setupKeyboard = function () {
		var oFocusRef = this.getDomRef(),
			aItems = this.getContent(),
			aDomRefs = [];

		aItems.forEach(function (oItem, i) {
			var $item = oItem._getAccessibleItem();
			aDomRefs.push($item[0]);
		});

		if (!this._oItemNavigation) {
			this._oItemNavigation = new ItemNavigation();
			this.addDelegate(this._oItemNavigation);
		}

		this._oItemNavigation.setRootDomRef(oFocusRef);
		this._oItemNavigation.setItemDomRefs(aDomRefs);
		this._oItemNavigation.setCycling(false);

		this._oItemNavigation.attachEvent(ItemNavigation.Events.AfterFocus, function (oEvent) {
			if (this._bKeyBoard === true) {
				this._findEdgeItems(oEvent.getParameter("index"));
				this._updateScrollingElements();
			}
			this._bKeyBoard = false;
		}.bind(this));
	};

	/* =========================================================== */
	/* Scrolling methods */
	/* =========================================================== */
	MicroProcessFlow.prototype._hasScrolling = function () {
		var sRenderType = this.getRenderType();

		return sRenderType === RenderType.Scrolling || sRenderType === RenderType.ScrollingWithResizer;
	};

	MicroProcessFlow.prototype._setupScrolling = function () {
		var $leftScroller = this.$("leftscroller"),
			$rightScroller = this.$("rightscroller");

		this._iScrollingIndex = 0;
		this._iLastVisibleIndex = 0;

		$leftScroller.on("click", this._scroll.bind(this, -1));
		$rightScroller.on("click", this._scroll.bind(this, 1));

		this._iScrollingIndex <= 0 ? $leftScroller.hide() : $leftScroller.show();
	};

	MicroProcessFlow.prototype._updateScrollingElements = function (iDirection) {
		var aContent = this.getContent(),
			$leftScroller = this.$("leftscroller"),
			$rightScroller = this.$("rightscroller");

		$leftScroller[this._iScrollingIndex <= 0 ? "hide" : "show"]();
		this._iLastVisibleIndex = this._findLastVisibleItemIndex(iDirection);
		$rightScroller[this._iLastVisibleIndex >= aContent.length - 1 ? "hide" : "show"]();

		this.$("leftlabel").text(this._iScrollingIndex);
		this.$("rightlabel").text(aContent.length - 1 - this._iLastVisibleIndex);
	};

	MicroProcessFlow.prototype._scroll = function (iDirection, oEvent) {
		//to prevent the event trigger of parent
		oEvent.stopPropagation();

		var $right = this.$("rightscroller"),
			$left = this.$("leftscroller"),
			bIsRtl = sap.ui.getCore().getConfiguration().getRTL(),
			iEdge, sTranslate, iRight;

		var fnCorrectRightEdge = function () {
			if (iDirection > 0) {
				var iWidth = this.$("content").width() - ($left.is(":visible") ? 0 : $left.width()),
					iEnd = fnLastItem(this._aEdges) + fnLastItem(this._aWidths);

				if (iEdge + iWidth > iEnd) {
					// we moved edge so starting index may not be correct
					iEdge -= (iEdge + iWidth - iEnd + $right.width());
					// find new starting index
					for (var i = 0; i < this._aEdges; i++) {
						if (this._aEdges[i] + this._aWidths[i] > iEdge) {
							this._iScrollingIndex = i;
							break;
						}
					}
				}
			}
		}.bind(this);

		var fnClearScrolling = function () {
			// if chart was scrolled by keyboard, we need to reset keyboard's scrolling and use only transform
			if (!bIsRtl && $parent[0].scrollLeft != 0) {
				this._clearScroll($parent);
			}

			if (bIsRtl) {
				iRight = $parent.scrollRightRTL();
				if (iRight) {
					this._clearScroll($parent);
				}
			}
		}.bind(this);

		var $scroll = this.$("scrolling"),
			$parent = $scroll.parent();

		this._bKeyBoard = false;

		// check left boundary
		// right boundary can't be checked now as right edge is not computed yet
		if (iDirection < 0 && this._iScrollingIndex <= 0) {
			return;
		}

		fnClearScrolling();

		// force showing scrolling buttons
		// if we scrolling from edge, we know these buttons will be displayed, so show them now to compute
		// with correct width
		(iDirection < 0) ? $right.show() : $left.show();

		// calculate new scrolling index
		this._iScrollingIndex += iDirection;
		iEdge = this._aEdges[this._iScrollingIndex];

		// we need to correct edge for most right scrolled items to align items to the right edge
		fnCorrectRightEdge();
		sTranslate = "translateX(" + ((bIsRtl ? 1 : -1) * iEdge) + "px)";
		this.$("scrolling").css("transform", sTranslate);

		if (!$scroll.hasClass("sapSuiteUiCommonsMicroProcessFlowScrollingTransition")) {
			// we use timeout to postpone transition usage, transform would be used with transition otherwise.
			// This condition is fulfilled only after keyboard usage  - we want to prevent transition
			// as it may start on very differnt edge (keyboard use scrollleft and button uses transformation)
			setTimeout(function () {
				$scroll.addClass("sapSuiteUiCommonsMicroProcessFlowScrollingTransition");
			}, 0);
		}

		this._updateScrollingElements(iDirection);

		// IE fix - when hiding scroller last focused element is focused again which completely destroys order of
		// displayed elements
		fnClearScrolling();
	};

	MicroProcessFlow.prototype._clearScroll = function ($elem) {
		var bIsRtl = sap.ui.getCore().getConfiguration().getRTL();

		if ($elem && $elem[0]) {
			bIsRtl ? $elem.scrollLeftRTL($elem[0].scrollWidth - $elem[0].clientWidth) : $elem[0].scrollLeft = 0;
		}
	};

	MicroProcessFlow.prototype._findLastVisibleItemIndex = function (iDirection) {
		var iStart = this._aEdges[this._iScrollingIndex],
			iWidth = this.$("content").width(),
			iWidthWithScroller = iWidth + this.$("rightscroller").width(),
			iEdge, iNewLastVisible = 0, bFitWithoutScroller;

		for (var i = 0; i < this._aEdges.length; i++) {
			iEdge = this._aEdges[i];

			if (iEdge + this._aWidths[i] - this._aSeperatorWidth[i] < iStart + iWidth) {
				iNewLastVisible = i;
			} else {
				if (iEdge + this._aWidths[i] < iStart + iWidthWithScroller) {
					bFitWithoutScroller = true;
				} else {
					bFitWithoutScroller = false;
					break;
				}
			}
		}

		return bFitWithoutScroller && iDirection !== -1 ? this.getContent().length - 1 : iNewLastVisible;
	};

	// collect width,left edge and seperator width of all the items
	MicroProcessFlow.prototype._collectEdgesAndWidths = function () {
		var iSum = 0;

		this._aEdges = [];
		this._aWidths = [];
		this._aSeperatorWidth = [];

		this.getContent().forEach(function (oItem, i) {
			var iItemWidth = oItem.$().width(),
				iSeperatorWidth = oItem.$().find(".sapSuiteUiCommonsMicroProcessFlowItemSeparatorWrapper").width();

			this._aEdges.push(iSum);
			this._aWidths.push(iItemWidth);
			this._aSeperatorWidth.push((iSeperatorWidth) ? iSeperatorWidth : 0);
			iSum += iItemWidth;
		}, this);
	};

	MicroProcessFlow.prototype._getLeftScroller = function () {
		if (!this._oLeftScroller) {
			this._oLeftScroller = new Icon(this.getId() + "leftscroller", {
				src: "sap-icon://nav-back"
			});
			this._oLeftScroller.addStyleClass("sapSuiteUiCommonsMicroProcessFlowArrow");
		}

		return this._oLeftScroller;
	};

	MicroProcessFlow.prototype._getRightScroller = function () {
		if (!this._oRightScroller) {
			this._oRightScroller = new Icon(this.getId() + "rightscroller", {
				src: "sap-icon://navigation-right-arrow"
			});
			this._oRightScroller.addStyleClass("sapSuiteUiCommonsMicroProcessFlowArrow");
		}

		return this._oRightScroller;
	};

	/* =========================================================== */
	/* Scrolling keyboards methods */
	/* =========================================================== */
	MicroProcessFlow.prototype._findEdgeItems = function (iIndex) {
		var $scroll = this.$("scrolling"),
			$parent = $scroll.parent(),
			aContent = this.getContent(),
			iLeft = Math.abs($scroll.position().left),
			iWidth, iEdge, iFirst = -1, iLast = -1;

		if (iLeft < 10 || iIndex === 0) {
			iFirst = 0;
			this._clearScroll($parent);
		}

		if (iIndex === aContent.length - 1) {
			iLast = aContent.length - 1;
		}

		iWidth = $scroll.width();

		for (var i = 0; i < this._aEdges.length; i++) {
			iEdge = this._aEdges[i];
			if (iFirst === -1 && iEdge >= iLeft) {
				iFirst = i;
			}

			if (iLast === -1 && (iEdge + this._aWidths[i] > iLeft + iWidth + 5/*offset*/)) {
				iLast = i - 1;
				break;
			}
		}

		this._iScrollingIndex = iFirst;
		this._iLastVisibleIndex = iLast !== -1 ? iLast : aContent.length - 2;
	};

	// the flag indicates then focus in event is triggered after keyboard press
	// we don't want to plague mouse behavior with unnecessary calculations
	MicroProcessFlow.prototype._processKeyPress = function () {
		if (this._hasScrolling()) {
			var $scroll = this.$("scrolling");

			this._bKeyBoard = true;

			$scroll.removeClass("sapSuiteUiCommonsMicroProcessFlowScrollingTransition");
			$scroll.css("transform", "");
		}
	};

	MicroProcessFlow.prototype.onsapspace = function () {
		this._firePress();
	};

	MicroProcessFlow.prototype.onsapenter = function () {
		this._firePress();
	};

	MicroProcessFlow.prototype.onsapnext = function (oEvent) {
		this._processKeyPress();
	};

	MicroProcessFlow.prototype.onsapprevious = function () {
		this._processKeyPress();
	};

	MicroProcessFlow.prototype.onsaphome = function (oEvent) {
		this._processKeyPress();
	};

	MicroProcessFlow.prototype.onsapend = function () {
		this._processKeyPress();
	};

	MicroProcessFlow.prototype.getAccessibilityInfo = function() {
		var description = "";
		this.getAggregation("content").forEach(function(val) {
			description = description.concat(val._getAriaText());
		});
		return {
			type: oResourceBundle.getText("ACC_CTR_TYPE_MICRO_PROCESS_FLOW"),
			description: description
		};
	};

	/*
	 * MicroProcessFlow must not be stretched in Form because this would stretch the size of the focus outline
	 */
	MicroProcessFlow.prototype.getFormDoNotAdjustWidth = function() {
		return true;
	};
	return MicroProcessFlow;
});