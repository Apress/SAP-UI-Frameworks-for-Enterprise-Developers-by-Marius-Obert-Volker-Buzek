/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ "sap/ui/thirdparty/jquery", './library', 'sap/m/library', 'sap/ui/base/ManagedObject', 'sap/ui/core/Control', 'sap/ui/core/delegate/ItemNavigation', 'sap/m/ScrollContainer', 'sap/m/Button', 'sap/ui/core/delegate/ScrollEnablement', 'sap/ui/Device', 'sap/ui/core/ResizeHandler', './HeaderContainerRenderer' ],
	function(jQuery, library, MobileLibrary, ManagedObject, Control, ItemNavigation, ScrollContainer, Button, ScrollEnablement, Device, ResizeHandler, HeaderContainerRenderer ) {
	"use strict";

	/**
	 * Constructor for a new HeaderContainer.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The container that provides a horizontal layout. It provides a horizontal scroll on the tablet and phone. On the desktop, it provides scroll left and scroll right buttons. This control supports keyboard navigation. You can use left and right arrow keys to navigate through the inner content. The Home key puts focus on the first control and the End key puts focus on the last control. Use Enter or Space to choose the control.
	 * @extends sap.ui.core.Control
	 * @implements sap.m.ObjectHeaderContainer
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.44.
	 * This control is deprecated in this library since 1.44 and moved to sap.m library that is also part of openUI5.
	 * @alias sap.suite.ui.commons.HeaderContainer
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var HeaderContainer = Control.extend("sap.suite.ui.commons.HeaderContainer", /** @lends sap.suite.ui.commons.HeaderContainer.prototype */ {
		metadata: {
			deprecated: true,
			interfaces: [
				"sap.m.ObjectHeaderContainer"
			],
			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * Number of pixels to scroll when the user chooses Next or Previous buttons. Relevant only for desktop.
				 */
				scrollStep: { type: "int", group: "Misc", defaultValue: 300 },

				/**
				 * Scroll animation time in milliseconds.
				 */
				scrollTime: { type: "int", group: "Misc", defaultValue: 500 },

				/**
				 * If set to true, shows dividers between scrollable items.
				 * @since 1.25
				 */
				showDividers: { type: "boolean", group: "Misc", defaultValue: true },

				/**
				 * The view of the HeaderContainer. There are two view modes: horizontal and vertical. In horizontal mode the content controls are displayed next to each other, in vertical mode the content controls are displayed on top of each other.
				 * @since 1.25
				 */
				view: {
					type: "sap.suite.ui.commons.HeaderContainerView",
					group: "Misc",
					defaultValue: "Horizontal"
				},

				/**
				 * Specifies the background color of the content. The visualization of the different options depends on the used theme.
				 * @since 1.38
				 */
				backgroundDesign: {
					type: "sap.m.BackgroundDesign",
					group: "Misc",
					defaultValue: "Transparent"
				}
			},
			aggregations: {

				/**
				 * Scroll container for smooth scrolling on different platforms.
				 */
				scrollContainer: { type: "sap.ui.core.Control", multiple: false, visibility: "hidden" },

				/**
				 * Items to add to HeaderContainer.
				 */
				items: { type: "sap.ui.core.Control", multiple: true, singularName: "item" },

				/**
				 * Button that allows to scroll to previous section.
				 */
				buttonPrev: { type: "sap.ui.core.Control", multiple: false, visibility: "hidden" },

				/**
				 * Button that allows to scroll to next section.
				 */
				buttonNext: { type: "sap.ui.core.Control", multiple: false, visibility: "hidden" }
			}
		}
	});

	HeaderContainer.prototype.init = function() {
		this._iSelectedCell = 0;
		this._bRtl = sap.ui.getCore().getConfiguration().getRTL();
		this._rb = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");
		this._oScrollCntr = new ScrollContainer(this.getId() + "-scrl-cntnr", {
			width: "100%",
			horizontal: !Device.system.desktop,
			height: "100%"
		});

		this.setAggregation("scrollContainer", this._oScrollCntr);

		if (Device.system.desktop) {
			this._oArrowPrev = new Button({
				id: this.getId() + "-scrl-prev-button",
				tooltip: this._rb.getText("HEADERCONTAINER_BUTTON_PREV_SECTION"),
				press: function(oEvt) {
					oEvt.cancelBubble();
					this._scroll(-this.getScrollStep(), this.getScrollTime());
				}.bind(this)
			}).addStyleClass("sapSuiteHdrCntrBtn").addStyleClass("sapSuiteHdrCntrLeft");
			this.setAggregation("buttonPrev", this._oArrowPrev);

			this._oArrowNext = new Button({
				id: this.getId() + "-scrl-next-button",
				tooltip: this._rb.getText("HEADERCONTAINER_BUTTON_NEXT_SECTION"),
				press: function(oEvt) {
					oEvt.cancelBubble();
					this._scroll(this.getScrollStep(), this.getScrollTime());
				}.bind(this)
			}).addStyleClass("sapSuiteHdrCntrBtn").addStyleClass("sapSuiteHdrCntrRight");
			this.setAggregation("buttonNext", this._oArrowNext);

			this._oScrollCntr.addDelegate({
				onAfterRendering: function() {
					if (Device.system.desktop) {
						var oFocusRef = this.getId() + "-scrl-cntnr-scroll" ? window.document.getElementById(this.getId() + "-scrl-cntnr-scroll") : null;
						var oFocusObj = jQuery(document.getElementById(this.getId() + "-scrl-cntnr-scroll"));
						var aDomRefs = oFocusObj.find(".sapSuiteHrdrCntrInner").attr("tabindex", "0");

						if (!this._oItemNavigation) {
							this._oItemNavigation = new ItemNavigation();
							this.addDelegate(this._oItemNavigation);
							this._oItemNavigation.attachEvent(ItemNavigation.Events.BorderReached, this._handleBorderReached, this);
							this._oItemNavigation.attachEvent(ItemNavigation.Events.AfterFocus, this._handleBorderReached, this);
						}
						this._oItemNavigation.setRootDomRef(oFocusRef);
						this._oItemNavigation.setItemDomRefs(aDomRefs);
						this._oItemNavigation.setTabIndex0();
						this._oItemNavigation.setCycling(false);
					}
				}.bind(this),

				onBeforeRendering: function() {
					if (Device.system.desktop) {
						this._oScrollCntr._oScroller = new ScrollEnablement(this._oScrollCntr, this._oScrollCntr.getId() + "-scroll", {
							horizontal: true,
							vertical: true,
							zynga: false,
							preventDefault: false,
							nonTouchScrolling: true
						});
					}
				}.bind(this)
			});
		}
	};

	HeaderContainer.prototype._scroll = function(iDelta, iDuration) {
		this.bScrollInProcess = true;
		setTimeout(function() {
			this.bScrollInProcess = false;
		}.bind(this), iDuration + 300);

		if (this.getView() === "Horizontal") {
			this._hScroll(iDelta, iDuration);
		} else {
			this._vScroll(iDelta, iDuration);
		}

	};

	HeaderContainer.prototype._vScroll = function(iDelta, iDuration) {
		var oDomRef = this.getId() + "-scrl-cntnr" ? window.document.getElementById(this.getId() + "-scrl-cntnr") : null;
		var iScrollTop = oDomRef.scrollTop;
		var iScrollTarget = iScrollTop + iDelta;
		this._oScrollCntr.scrollTo(0, iScrollTarget, iDuration);
	};

	HeaderContainer.prototype._hScroll = function(iDelta, iDuration) {
		var oDomRef = this.getId() + "-scrl-cntnr" ? window.document.getElementById(this.getId() + "-scrl-cntnr") : null;
		var iScrollTarget;
		if (!this._bRtl) {
			var iScrollLeft = oDomRef.scrollLeft;
			iScrollTarget = iScrollLeft + iDelta;
			this._oScrollCntr.scrollTo(iScrollTarget, 0, iDuration);
		} else {
			iScrollTarget = jQuery(oDomRef).scrollRightRTL() + iDelta;
			this._oScrollCntr.scrollTo((iScrollTarget > 0) ? iScrollTarget : 0, 0, iDuration);
		}
	};

	HeaderContainer.prototype._checkOverflow = function() {
		if (this.getView() === "Horizontal") {
			this._checkHOverflow();
		} else {
			this._checkVOverflow();
		}
	};

	HeaderContainer.prototype._checkVOverflow = function() {
		var oBarHead = this._oScrollCntr.getDomRef();
		var bScrolling = false;

		if (oBarHead) {
			if (oBarHead.scrollHeight > oBarHead.clientHeight) {
				// scrolling possible
				bScrolling = true;
			}
		}

		this._lastVScrolling = bScrolling;

		if (oBarHead) {
			var iScrollTop = oBarHead.scrollTop;

			// check whether scrolling to the left is possible
			var bScrollBack = false;
			var bScrollForward = false;

			var realHeight = oBarHead.scrollHeight;
			var availableHeight = oBarHead.clientHeight;

			if (Math.abs(realHeight - availableHeight) === 1) {
				realHeight = availableHeight;
			}

			if (iScrollTop > 0) {
				bScrollBack = true;
			}
			if ((realHeight > availableHeight) && (iScrollTop + availableHeight < realHeight)) {
				bScrollForward = true;
			}

			if (!bScrollBack) {
				this._oArrowPrev.$().hide();
			} else {
				this._oArrowPrev.$().show();
			}
			if (!bScrollForward) {
				this._oArrowNext.$().hide();
			} else {
				this._oArrowNext.$().show();
			}
		}
	};

	HeaderContainer.prototype._checkHOverflow = function() {
		var oBarHead = this._oScrollCntr.getDomRef();
		var oBarHeadContainer = this.$("scroll-area");
		var bScrolling = false;

		if (oBarHead) {
			if (oBarHead.scrollWidth - 5 > oBarHead.clientWidth) {
				// scrolling possible
				bScrolling = true;
			}
		}

		this._lastScrolling = bScrolling;

		if (oBarHead) {
			var iScrollLeft = oBarHead.scrollLeft;

			// check whether scrolling to the left is possible
			var bScrollBack = false;
			var bScrollForward = false;

			var realWidth = oBarHead.scrollWidth;
			var availableWidth = oBarHead.clientWidth;

			if (Math.abs(realWidth - availableWidth) === 1) {
				realWidth = availableWidth;
			}
			if (this._bRtl) {
				var iScrollLeftRTL = jQuery(oBarHead).scrollLeftRTL();
				if (iScrollLeftRTL > (Device.browser.msie ? 1 : 0)) {
					bScrollForward = true;
				}
			} else if (iScrollLeft > 1) {
				bScrollBack = true;
			}

			var fnRightMarginCalc = function() {
				var iPadding = parseFloat(oBarHeadContainer.css("padding-right"));
				return Device.browser.msie ? iPadding + 1 : iPadding;
			};

			if (realWidth - 5 > availableWidth) {
				if (this._bRtl) {
					if (jQuery(oBarHead).scrollRightRTL() > 1) {
						bScrollBack = true;
					}
				} else if (Math.abs(iScrollLeft + availableWidth - realWidth) > fnRightMarginCalc()) {
					bScrollForward = true;
				}
			}

			var oOldScrollBack = this._oArrowPrev.$().is(":visible");
			if (oOldScrollBack && !bScrollBack) {
				this._oArrowPrev.$().hide();
			}
			if (!oOldScrollBack && bScrollBack) {
				this._oArrowPrev.$().show();
			}

			var oOldScrollForward = this._oArrowNext.$().is(":visible");
			if (oOldScrollForward && !bScrollForward) {
				this._oArrowNext.$().hide();
			}
			if (!oOldScrollForward && bScrollForward) {
				this._oArrowNext.$().show();
			}
		}
	};

	HeaderContainer.prototype._handleBorderReached = function(oObj) {
		if (Device.browser.msie && this.bScrollInProcess) {
			return;
		}
		var iIndex = oObj.getParameter("index");
		if (iIndex === 0) {
			this._scroll(-this.getScrollStep(), this.getScrollTime());
		} else if (iIndex === this.getItems().length - 1) {
			this._scroll(this.getScrollStep(), this.getScrollTime());
		}
	};

	HeaderContainer.prototype.addItem = function(oItem, bSuppressInvalidate) {
		this._oScrollCntr.addContent(oItem.addStyleClass("sapSuiteHrdrCntrInner"), bSuppressInvalidate);
		return this;
	};

	HeaderContainer.prototype.insertItem = function(oItem, iIndex, bSuppressInvalidate) {
		this._oScrollCntr.insertContent(oItem.addStyleClass("sapSuiteHrdrCntrInner"), iIndex, bSuppressInvalidate);
		return this;
	};

	HeaderContainer.prototype._callMethodInManagedObject = function(sFunctionName, sAggregationName) {
		var args = Array.prototype.slice.call(arguments);
		if (sAggregationName === "items") {
			args[1] = "content";
			return this._oScrollCntr[sFunctionName].apply(this._oScrollCntr, args.slice(1));
		} else {
			return ManagedObject.prototype[sFunctionName].apply(this, args.slice(1));
		}
	};

	HeaderContainer.prototype.onBeforeRendering = function() {
		if (Device.system.desktop) {
			sap.ui.getCore().attachIntervalTimer(this._checkOverflow, this);
			this._oArrowPrev.setIcon(this.getView() === "Horizontal" ? "sap-icon://navigation-left-arrow" : "sap-icon://navigation-up-arrow");
			this._oArrowNext.setIcon(this.getView() === "Horizontal" ? "sap-icon://navigation-right-arrow" : "sap-icon://navigation-down-arrow");
			this.$().off("click", this.handleSwipe);
		}
	};

	HeaderContainer.prototype.onAfterRendering = function() {
		jQuery(document.getElementById(this.getId() + "-scrl-next-button")).attr("tabindex", "-1");
		jQuery(document.getElementById(this.getId() + "-scrl-prev-button")).attr("tabindex", "-1");
		if (Device.system.desktop) {
			this.$().on("swipe", jQuery.proxy(this.handleSwipe, this));
		}
	};

	HeaderContainer.prototype.handleSwipe = function(oE) {
		oE.preventDefault();
		oE.stopPropagation();
		this._isDragEvent = true;
	};

	HeaderContainer.prototype.exit = function() {
		if (this._oItemNavigation) {
			this.removeDelegate(this._oItemNavigation);
			this._oItemNavigation.destroy();
		}
		if (this._sScrollResizeHandlerId) {
			ResizeHandler.deregister(this._sScrollResizeHandlerId);
		}
	};

	HeaderContainer.prototype.onclick = function(oEvt) {
		if (this._isDragEvent) {
			oEvt.preventDefault();
			oEvt.stopPropagation();
			this._isDragEvent = false;
		}
	};

	HeaderContainer.prototype.setView = function(view) {
		this.setProperty("view", view, true);
		if (view === library.HeaderContainerView.Horizontal && !Device.system.desktop) {
			this._oScrollCntr.setHorizontal(true);
			this._oScrollCntr.setVertical(false);
		} else if (!Device.system.desktop) {
			this._oScrollCntr.setHorizontal(false);
			this._oScrollCntr.setVertical(true);
		}
		return this;
	};

	///**************************************************************
	// * START - forward aggregation related methods to the inner aggregation
	// **************************************************************/
	HeaderContainer.prototype.validateAggregation = function(sAggregationName, oObject, bMultiple) {
		return this._callMethodInManagedObject("validateAggregation", sAggregationName, oObject, bMultiple);
	};

	HeaderContainer.prototype.getAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		return this._callMethodInManagedObject("getAggregation", sAggregationName, oObject, bSuppressInvalidate);
	};

	HeaderContainer.prototype.setAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		this._callMethodInManagedObject("setAggregation", sAggregationName, oObject, bSuppressInvalidate);
		return this;
	};

	HeaderContainer.prototype.indexOfAggregation = function(sAggregationName, oObject) {
		return this._callMethodInManagedObject("indexOfAggregation", sAggregationName, oObject);
	};

	HeaderContainer.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		this._callMethodInManagedObject("insertAggregation", sAggregationName, oObject, iIndex, bSuppressInvalidate);
		return this;
	};

	HeaderContainer.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		this._callMethodInManagedObject("addAggregation", sAggregationName, oObject, bSuppressInvalidate);
		return this;
	};

	HeaderContainer.prototype.removeAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		return this._callMethodInManagedObject("removeAggregation", sAggregationName, oObject, bSuppressInvalidate);
	};

	HeaderContainer.prototype.removeAllAggregation = function(sAggregationName, bSuppressInvalidate) {
		return this._callMethodInManagedObject("removeAllAggregation", sAggregationName, bSuppressInvalidate);
	};

	HeaderContainer.prototype.destroyAggregation = function(sAggregationName, bSuppressInvalidate) {
		this._callMethodInManagedObject("destroyAggregation", sAggregationName, bSuppressInvalidate);
		return this;
	};

	HeaderContainer.prototype._getParentCell = function(oDomElement) {
		return jQuery(oDomElement).parents(".sapSuiteHrdrCntrInner").addBack(".sapSuiteHrdrCntrInner").get(0);
	};

	HeaderContainer.prototype.onsaptabnext = function(oEvt) {
		this._iSelectedCell = this._oItemNavigation.getFocusedIndex();
		var oFocusables = this.$().find(":focusable");	// all tabstops in the control
		var iThis = oFocusables.index(oEvt.target);  // focused element index
		var oNext = oFocusables.eq(iThis + 1).get(0);	// next tab stop element
		var oFromCell = this._getParentCell(oEvt.target);
		var oToCell;
		if (oNext) {
			oToCell = this._getParentCell(oNext);
		}

		if (oFromCell && oToCell && oFromCell.id !== oToCell.id || oNext && oNext.id === this.getId() + "-after") { // attempt to jump out of HeaderContainer
			var oLastInnerTab = oFocusables.last().get(0);
			if (oLastInnerTab) {
				this._bIgnoreFocusIn = true;
				oLastInnerTab.focus();
			}
		}
	};

	HeaderContainer.prototype.onsaptabprevious = function(oEvt) {
		var oFocusables = this.$().find(":focusable");			// all tabstops in the control
		var iThis = oFocusables.index(oEvt.target);					// focused element index
		var oPrev = oFocusables.eq(iThis - 1).get(0);				// previous tab stop element
		var oFromCell = this._getParentCell(oEvt.target);
		this._iSelectedCell = this._oItemNavigation.getFocusedIndex();
		var oToCell;
		if (oPrev) {
			oToCell = this._getParentCell(oPrev);
		}

		if (!oToCell || oFromCell && oFromCell.id !== oToCell.id) { // attempt to jump out of HeaderContainer
			var sTabIndex = this.$().attr("tabindex");		// save tabindex
			this.$().attr("tabindex", "0");
			this.$().focus(); 								// set focus before the control
			if (!sTabIndex) {								// restore tabindex
				this.$().removeAttr("tabindex");
			} else {
				this.$().attr("tabindex", sTabIndex);
			}
		}
	};

	HeaderContainer.prototype.onfocusin = function(oEvt) {
		if (this._bIgnoreFocusIn) {
			this._bIgnoreFocusIn = false;
			return;
		}
		if (oEvt.target.id === this.getId() + "-after") {
			this._restoreLastFocused();
		}
	};

	HeaderContainer.prototype._restoreLastFocused = function() {
		if (!this._oItemNavigation) {
			return;
		}
		//get the last focused Element from the HeaderContainer
		var aNavigationDomRefs = this._oItemNavigation.getItemDomRefs();
		var iLastFocusedIndex = this._oItemNavigation.getFocusedIndex();
		var $LastFocused = jQuery(aNavigationDomRefs[iLastFocusedIndex]);

		// find related item control to get tabbables
		var oRelatedControl = $LastFocused.control(0) || {};
		var $Tabbables = oRelatedControl.getTabbables ? oRelatedControl.getTabbables() : $LastFocused.find(":sapTabbable");

		// get the last tabbable item or itself and focus
		$Tabbables.eq(-1).add($LastFocused).eq(-1).focus();
	};

	return HeaderContainer;

});