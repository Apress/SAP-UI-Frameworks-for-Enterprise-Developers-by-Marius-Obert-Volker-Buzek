/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define("sap/suite/ui/commons/TimelineRenderManager", [
	"sap/ui/thirdparty/jquery",
	"./library",
	"sap/m/Text",
	"sap/ui/core/Icon",
	"sap/m/ViewSettingsDialog",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/Item",
	"sap/m/ToolbarSpacer",
	"sap/m/SearchField",
	"sap/m/OverflowToolbar",
	"sap/m/Select",
	"sap/m/RangeSlider",
	"sap/m/Label",
	"sap/m/Panel",
	"sap/m/FlexBox",
	"sap/m/OverflowToolbarButton",
	"sap/m/MessageStrip",
	"sap/m/ViewSettingsFilterItem",
	"sap/m/ViewSettingsCustomItem",
	"sap/m/OverflowToolbarLayoutData",
	"sap/m/library",
	"sap/m/MessageToast",
	"sap/ui/core/InvisibleText",
	"sap/m/SliderTooltip",
	"sap/suite/ui/commons/TimelineRenderManagerTimestamp",
	"sap/suite/ui/commons/util/StringSliderTooltip",
	"sap/m/ResponsiveScale",
	"sap/ui/core/library"
], function (jQuery, library, Text, Icon, ViewSettingsDialog, ResizeHandler, Item, ToolbarSpacer, SearchField, OverflowToolbar, Select,
			 RangeSlider, Label, Panel, FlexBox, OverflowToolbarButton, MessageStrip, ViewSettingsFilterItem,
			 ViewSettingsCustomItem, OverflowToolbarLayoutData, mLibrary, MessageToast, InvisibleText, SliderTooltip,
			 TimelineRenderManagerTimestamp, StringSliderTooltip, ResponsiveScale, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.CSSSize
	var CSSSize = coreLibrary.CSSSize;

	// shortcut for sap.m.ButtonType
	var ButtonType = mLibrary.ButtonType;

	var OverflowToolbarPriority = mLibrary.OverflowToolbarPriority;
	var TimelineGroupType = library.TimelineGroupType;

	var resourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");
	var VERTICAL_MAX_WIDTH = 680;

	var DateRoundType = Object.freeze({
		UP: "UP",
		DOWN: "DOWN",
		NONE: "NONE"
	});

	function switchClass($item, removeClass, addClass) {
		$item.removeClass(removeClass).addClass(addClass);
	}

	// get attributed from $element and convert it to number
	function _getConvertedAttribute($elem, sAttrName) {
		return parseInt($elem.css(sAttrName).replace("px", ""), 10);
	}

	var TimelineRenderManager = {
		extendTimeline: function (Timeline) {
			/**
			 * Init filter bar, filter dialogs, message strips
			 * @private
			 */
			Timeline.prototype._initControls = function () {
				this._setupMessageStrip();
				this._setupFilterDialog();
				this._setupHeaderToolbar();
				this._setupAccessibilityItems();
			};

			/**
			 * Register resize listener. We don't register timeline itself, but it's parent.
			 * @private
			 */
			Timeline.prototype._registerResizeListener = function () {
				var oParent = this.$().parent().get(0);
				if (oParent) {
					this.oResizeListener = ResizeHandler.register(oParent, jQuery.proxy(this._performResizeChanges, this));
				}
			};

			/**
			 * @private
			 */
			Timeline.prototype._deregisterResizeListener = function () {
				if (this.oResizeListener) {
					ResizeHandler.deregister(this.oResizeListener);
				}
			};

			/**
			 * Recalcute all positions after some change occured (basically it's after rendering or after resize)
			 * @param {boolean} bForce - ignore all optimization and force triggering all scripts
			 * @private
			 */
			Timeline.prototype._performUiChanges = function (bForce) {
				// deregister resize listener - changes to timeline will change the parent too so we don't want to trigger resize right away
				this._deregisterResizeListener();

				if (!this.getDomRef()) {
					return;
				}

				if (this._isVertical()) {
					this._performUiChangesV(bForce);
				} else {
					this._performUiChangesH();
				}

				this._setupScrollers();
				this._startItemNavigation();

				// register again
				this._registerResizeListener();
			};

			/**
			 * Change from doublesided to singlesided or vice versa for single item
			 * @param {object} $li LI element representing timeline item
			 * @param {boolean} bIsOdd indicates whether item is odd or even
			 * @private
			 */
			Timeline.prototype._performDoubleSidedChangesLi = function ($li, bIsOdd) {
				var $child = $li.children().first(),
					sClassName = this._isLeftAlignment() ? "sapSuiteUiCommonsTimelineItemWrapperVLeft" : "sapSuiteUiCommonsTimelineItemWrapperVRight";
				if (this._renderDblSided) {
					if ($li.hasClass('sapSuiteUiCommonsTimelineItem')) {
						$li.removeClass('sapSuiteUiCommonsTimelineItem')
							.addClass(bIsOdd ? "sapSuiteUiCommonsTimelineItemOdd" : "sapSuiteUiCommonsTimelineItemEven");

						if (!bIsOdd) {
							switchClass($child, "sapSuiteUiCommonsTimelineItemWrapperVLeft", "sapSuiteUiCommonsTimelineItemWrapperVRight");
						} else {
							switchClass($child, "sapSuiteUiCommonsTimelineItemWrapperVRight", "sapSuiteUiCommonsTimelineItemWrapperVLeft");
						}
					}
				} else {
					$li.removeClass("sapSuiteUiCommonsTimelineItemOdd").removeClass("sapSuiteUiCommonsTimelineItemEven").addClass("sapSuiteUiCommonsTimelineItem");
					$child.removeClass("sapSuiteUiCommonsTimelineItemWrapperVLeft").removeClass("sapSuiteUiCommonsTimelineItemWrapperVRight").addClass(sClassName);
				}
			};

			/**
			 * * Change from doublesided to singlesided or vice versa
			 * @private
			 */
			Timeline.prototype._performDoubleSidedChanges = function () {
				var $this = this.$(),
					$ulItems = $this.find('.sapSuiteUiCommonsTimelineItemUlWrapper').not(".sapSuiteUiCommonsTimelineShowMoreWrapper"),
					$headers = $this.find(".sapSuiteUiCommonsTimelineScrollV .sapSuiteUiCommonsTimelineGroupHeader"),
					$item;

				if (this._renderDblSided) {
					this._$content.addClass("sapSuiteUiCommonsTimelineDblSided");
					$headers.addClass("sapSuiteUiCommonsTimelineGroupHeaderDblSided");
					$headers.addClass("sapSuiteUiCommonsTimelineItemWrapperVLeft").removeClass("sapSuiteUiCommonsTimelineItemWrapperVRight");
				} else {
					this._$content.removeClass("sapSuiteUiCommonsTimelineDblSided");
					$headers.removeClass("sapSuiteUiCommonsTimelineGroupHeaderDblSided sapSuiteUiCommonsTimelineItemWrapperVLeft");
					$headers.addClass(this._isLeftAlignment() ? "sapSuiteUiCommonsTimelineItemWrapperVLeft" : "sapSuiteUiCommonsTimelineItemWrapperVRight");
				}

				for (var j = 0; j < $ulItems.length; j++) {
					var $ul = jQuery($ulItems[j]),
						$liItems = $ul.find('> li').not(".sapSuiteUiCommonsTimelineGroupHeader");

					// first is group item, second is "first" classic item, so we want to move down third
					$liItems.eq(1).css("margin-top", this._renderDblSided ? "40px" : "auto");

					for (var i = 0; i < $liItems.length; i++) {
						$item = jQuery($liItems[i]);
						this._performDoubleSidedChangesLi($item, (i % 2) === 0);
					}
				}

				$this.find(".sapSuiteUiCommonsTimelineItemBarV").css("height", "");
				$this.find(".sapSuiteUiCommonsTimelineItem").css("margin-bottom", "");
			};

			/**
			 * Recalculate for horizontal TL
			 * @private
			 */
			Timeline.prototype._performUiChangesH = function () {
				var $this = this.$(),
					$prev,
					oBottomLine;

				var fnRight = function ($element) {
					return ($this.width() - ($element.position().left + $element.outerWidth()));
				};

				// calculate bottom line margin for each item
				if (this.getEnableDoubleSided() && this._isGrouped()) {
					oBottomLine = $this.find(".sapSuiteUiCommonsTimelineHorizontalBottomLine ul");

					// we fix margin left (right for RTL) from previous item
					// to do this we find corresponding icon in icon bar and convert its left position
					// to margin (we have to take in count previous item and it's position)
					// easier solution would be absolute positioning of bottom line
					// but this is better solution
					$this.find("[firstgroupevenitem = true]:visible").each(function (iIndex, oItem) {
						var fnCreateAttribute = function (sName) {
								return sName + "-" + (this._bRtlMode ? "right" : "left");
							}.bind(this),
							// icon in middle line for corresponding timeline item
							$icon = jQuery("#" + oItem.id + "-line"),
							// left (right for RTL) for timeline icon
							iDistance = this._bRtlMode ? fnRight($icon) : $icon.position().left,
							// distance between left icon pos and start of timeline item
							OFFSET = 30,
							$item = jQuery(oItem),
							iLineMargin = _getConvertedAttribute(oBottomLine, fnCreateAttribute("padding")),
							iMargin, iPrevPos;

						if (iIndex === 0) {
							iMargin = iDistance - OFFSET - iLineMargin;
						} else {
							$prev = $item.prevAll(".sapSuiteUiCommonsTimelineItemLiWrapperV:visible:first");
							// otherwise count margin as previsous item left + width minus from group header left position + OFFSET
							iPrevPos = this._bRtlMode ? fnRight($prev) : ($prev.position().left + _getConvertedAttribute($prev, fnCreateAttribute("margin")));
							iMargin = (iDistance - OFFSET) - (iPrevPos + $prev.outerWidth());
						}
						$item.css(fnCreateAttribute("margin"), iMargin + "px");
					}.bind(this));

				}

				if (!this.getEnableScroll()) {
					// enforce scrollbar being hidden
					$this.find(".sapSuiteUiCommonsTimelineContentsH").css("overflow-x", "hidden");
				}

				this._calculateTextHeight();
			};

			/**
			 * Recalculate for vertical TL
			 * @param {boolean} bForce - ignore all optimization and force triggering all scripts
			 * @private
			 */
			Timeline.prototype._performUiChangesV = function (bForce) {
				var $this = this.$(),
					iOuterWidth = $this.outerWidth() + 50;

				//check if width can handle to display dobulesided timeline
				if (this.getEnableDoubleSided()) {
					this._renderDblSided = iOuterWidth >= VERTICAL_MAX_WIDTH;
					// performance check, process only when its really neccessary
					if (this._renderDblSided !== this._lastStateDblSided || bForce) {
						this._performDoubleSidedChanges();
					}

					this._lastStateDblSided = this._renderDblSided;
				}

				this._calculateTextHeight();
				this._calculateHeightV();
			};

			/**
			 * Correct item margins and separator heights for double sided timeline. If enableScroll is OFF, calculate timeline height to fit parent
			 * @private
			 */
			Timeline.prototype._calculateHeightV = function () {
				var $this = this.$(),
					iFilterBarHeight = this.$("headerBar").outerHeight() || 0,
					iFilterInfoBarHeight = this.$("filterMessage").outerHeight() || 0,
					iMessageStripHeight = this.$("messageStrip").outerHeight() || 0,
					iBarsHeight = iMessageStripHeight + iFilterInfoBarHeight + iFilterBarHeight,
					// correct separator height for double sided timeline
					fnCorrectSeparatorHeight = function (aLI, $nextUl) {
						var $next, $current, $nextIcon, $bar, $currentIcon, iNextTop, iCurrentTop,
							iLength = aLI.length,
							sIconClass = this.getShowIcons() ? ".sapSuiteUiCommonsTimelineItemBarIconWrapperV:visible" : ".sapSuiteUiCommonsTimelineItemNoIcon:visible",
							// find either first classic item in next group or collapsed group mark
							$nextUlIcon = $nextUl.length > 0 ? $nextUl.find(sIconClass + ", .sapSuiteUiCommonsTimelineItemBarIconWrapperV:visible").eq(0) : jQuery(),
							MARGIN = 8;

						// we find next item icon and count difference between them
						// for last item, we check whether there is any additional group
						for (var i = 0; i < iLength; i++) {
							$next = jQuery(aLI[i + 1]);
							$current = jQuery(aLI[i]);
							// next icon, either next item in UL or first visible icon in next group
							$nextIcon = i < iLength - 1 ? $next.find(sIconClass) : $nextUlIcon;
							$currentIcon = $current.find(sIconClass);
							if ($nextIcon.length > 0 && $currentIcon.length > 0) {
								iNextTop = $nextIcon.offset().top;
								iCurrentTop = $currentIcon.offset().top + $currentIcon.height();
								$bar = $current.find(".sapSuiteUiCommonsTimelineItemBarV");
								MARGIN = 8;

								$bar.height(iNextTop - iCurrentTop - MARGIN);
							}
						}
					},
					fnCorrectItemMargin = function (aLI) {
						var $item,
							$prev,
							$prevPrev,
							bIsOdd,
							iLeft,
							OFFSET = 40,
							DELIMITER = 100,
							fnFixMargin = function () {
								var iDiff = _getConvertedAttribute($prevPrev, "margin-top") +
									$prevPrev.position().top + $prevPrev.height() - $item.position().top;
								$prev.css("margin-bottom", iDiff + OFFSET + "px");
							};

						// we use a little trick here, when item is wrong positioned due to the fact odd and even items are of different height
						// odd items are positioned left (or should be) so we test whether their offset is too far right
						// we can fix it by adding margin-bottom of the [item-2]. By doing this we set both 'columns' to similar sizes
						for (var i = 2; i < aLI.length; i++) {
							$item = jQuery(aLI[i]);
							$prev = jQuery(aLI[i - 1]);
							$prevPrev = jQuery(aLI[i - 2]);
							bIsOdd = this._bRtlMode ? !$item.hasClass("sapSuiteUiCommonsTimelineItemOdd") : $item.hasClass("sapSuiteUiCommonsTimelineItemOdd");
							iLeft = $item.position().left;

							// odd is supposed to be left
							if (!bIsOdd && iLeft < DELIMITER ||
								bIsOdd && iLeft > DELIMITER) {
								fnFixMargin();
							} else {
								var iDiff = $item.position().top - $prev.position().top,
									iPrevMargin = _getConvertedAttribute($prevPrev, "margin-bottom");

								if (iDiff < OFFSET) {
									$prevPrev.css("margin-bottom", (iPrevMargin + OFFSET - iDiff) + "px");
								}
							}
						}
					},
					fnCalculateHeight = function () {
						var OFFSET = 5,
							iCurrentTop = $this.position().top,
							iParentHeight = $this.parent().height(),
							iContentPaddingBottom = _getConvertedAttribute(this._$content, "padding-bottom"),
							iContentPaddingTop = _getConvertedAttribute(this._$content, "padding-top"),
							iHeight = iParentHeight - iCurrentTop - iBarsHeight - iContentPaddingTop - iContentPaddingBottom - OFFSET;

						this._$content.height(iHeight);
					}.bind(this),
					aUl, $ul, $nextUl, aLI;

				// function start
				if (this.getEnableScroll()) {
					fnCalculateHeight();
				}

				if (this._renderDblSided) {
					// find all UL tags
					aUl = $this.find(".sapSuiteUiCommonsTimelineItemUlWrapper");
					for (var i = 0; i < aUl.length; i++) {
						$ul = jQuery(aUl[i]);
						$nextUl = jQuery(aUl[i + 1]);
						aLI = $ul.find(" > li:not(.sapSuiteUiCommonsTimelineGroupHeader):visible");

						// we have to first correct DOM to have all items right ordered.
						aLI.css("margin-bottom", "");
						fnCorrectItemMargin.call(this, aLI, $ul);
						fnCorrectSeparatorHeight.call(this, aLI, $nextUl);
					}
				}
			};

			/**
			 * Event after parent is resized
			 * @private
			 */
			Timeline.prototype._performResizeChanges = function () {
				this._performUiChanges();
			};

			/**
			 * Given textHeight settings (line count, automatic to parent or height) we calculate precise pixels height to fit full rows
			 * so we prevent trimming div in half of line.
			 * @private
			 */
			Timeline.prototype._calculateTextHeight = function () {
				var $this = this.$(),
					sTextHeight = this.getTextHeight(),
					oRegex, aMatches,
					fnSetHeight = function (iHeight, iLinesCount) {
						$this.find(".sapSuiteUiCommonsTimelineItemTextWrapper:visible").each(function (iIndex, oWrapper) {
							var $item = jQuery(oWrapper),
								$span = $item.children().first(),
								aRects = $span.get(0).getClientRects(),
								iCalculatedHeight = 0,
								iLines = 0,
								iTop, iCurrentBottom = -100000,
								iRealLineCount = 0,
								sTextShowMore = resourceBundle.getText("TIMELINE_TEXT_SHOW_MORE"),
								bisExpanded = $item.attr("expanded");
								bisExpanded = (bisExpanded == "true");
								$item.height("auto");
								$item.css("-webkit-line-clamp", "");
							if (aRects && aRects.length > 0) {
								iTop = aRects[0].top;
								iRealLineCount = 0;

								for (var i = 0; i < aRects.length - 1; i++) {
									if (iCurrentBottom !== aRects[i].bottom) {
										iCurrentBottom = aRects[i].bottom;
										iRealLineCount++;
									}

									// search by preferred height
									if (iHeight > 0 && (aRects[i + 1].bottom - iTop > iHeight)) {
										iLines = iRealLineCount;
										iCalculatedHeight = aRects[i].bottom - iTop;
										break;
									}

									// search by preferred line count
									if (iLinesCount > 0 && iRealLineCount === iLinesCount) {
										iCalculatedHeight = aRects[i].bottom - aRects[0].top;
										iLines = iLinesCount;
										break;
									}
								}
							}
							if (!bisExpanded) {
								if (iCalculatedHeight > 0) {
									$item.height(iCalculatedHeight);
									$item.css("-webkit-line-clamp", iLines.toString());
									// more button
									$item.next().show();
								} else if (!$item.attr("expandable")) {
									$item.next().hide();
								}
							} else {
								for (var j = i; j < aRects.length - 1; j++) {
									if (iCurrentBottom !== aRects[j].bottom) {
										iCurrentBottom = aRects[j].bottom;
										iRealLineCount++;
									}
								}
								if (iLinesCount > 0 && iRealLineCount <= iLinesCount) {
									$item.attr("expanded", false);
									$item.next().children()[0].text = sTextShowMore;
									$item.next().hide();
								}
							}
						});
					},
					fnSetHeightByLineCount = function (iLinesCount) {
						fnSetHeight(0, parseInt(iLinesCount, 10));
					},
					fnSetHeightByNumber = function (iHeight) {
						fnSetHeight(iHeight, 0);
					},
					fnFindMaxHeightForAutomatic = function () {
						var aTexts = $this.find(".sapSuiteUiCommonsTimelineItemTextWrapper");

						// reset heigh flags for all items
						aTexts.css("height", "");
						aTexts.css("-webkit-line-clamp", "");
						$this.css("height", "100%");

						var iContentHeight = this._$content.height(),
							iContentPadding = _getConvertedAttribute(this._$content, "padding-bottom"),
							iScrollHeight = this._$content.get(0).scrollHeight,
							iDiff = iScrollHeight - iContentHeight - iContentPadding,
							oMax = {height: 0},
							bShowMoreHeight,
							OFFSET = 20;

						// find largest item and check whether its show more button is visible
						$this.find(".sapSuiteUiCommonsTimelineItemTextWrapper").each(function (iIndex, oItem) {
							var iHeight = jQuery(oItem).height();
							if (iHeight > oMax.height) {
								oMax.height = iHeight;
								oMax.item = jQuery(this);
							}
						});
						if (oMax.item) {
							// check if max height has show more button. If it is visible, its height is already calculated and is no more
							// needed to be added
							bShowMoreHeight = oMax.item.parent().find(".sapSuiteUiCommonsTimelineItemShowMore:hidden").height();

							// we don't want to stretch right to the end --> OFFSET
							return oMax.height - iDiff - bShowMoreHeight - OFFSET;
						}

						return 1;
					};

				if (sTextHeight) {
					// for automatic in horizontal mode, try to calculate max allowed height
					// find 'scroll' div and get his height and scrollheight. The difference between these number and the height of the largest visible
					// textarea is the maximum possible height for all items
					if (this._useAutomaticHeight()) {
						fnSetHeightByNumber(fnFindMaxHeightForAutomatic.call(this));
					} else if (jQuery.isNumeric(sTextHeight)) {
						fnSetHeightByLineCount(sTextHeight);
					} else {
						// for px we can compute rounded height and line count
						oRegex = /([0-9]*\.?[0-9]+)(px)+/i;
						aMatches = oRegex.exec(sTextHeight);
						if (aMatches && aMatches.length > 1) {
							fnSetHeightByNumber(aMatches[1]);
						} else if (CSSSize.isValid(sTextHeight)) {
							// if not px just add the selected style
							$this.find(".sapSuiteUiCommonsTimelineItemTextWrapper").height(sTextHeight);
						}
					}
				}
			};

			/**
			 * Scroller position for horizontal TL
			 * @private
			 */
			Timeline.prototype._fixScrollerPositionH = function () {
				var $this = this.$(),
					$middleLine = $this.find(".sapSuiteUiCommonsTimelineHorizontalMiddleLine"),
					$scrollers = $this.find(".sapSuiteUiCommonsTimelineHorizontalScroller"),
					iPosY,
					iContentTop = this._$content.position().top;

				if ($middleLine.get(0)) {
					iPosY = $middleLine.position().top;
					// center scrollbars and scroll icons to center of middle line
					$this.find(".sapSuiteUiCommonsTimelineScrollerIconWrapper").css("top", (iPosY - 5) + "px");
					$scrollers.css("top", iContentTop + "px");
					$scrollers.height(this._$content.outerHeight() - 15);
				}
			};

			/**
			 * setup scrollers and background div with gradient opacity. For this we need to know background color of timeline
			 * we try to get it from parents. IF we find a color (and background image is not set) we try to setup scroller buttons and
			 * gradient background.
			 * These scrollers are children of directly timeline control iteself and are absolute, so they need to be positioned by JS.
			 * This is for not shortening scrollable area.
			 * @private
			 */
			Timeline.prototype._setupScrollers = function () {
				var $this = this.$(),
					MIN_SIZE = 450,
					sNoColor = 'rgba(0, 0, 0, 0)',
					iSize, sBackgroundColor, aRgb, iR, iG, iB, sFrom, sTo, sMid,
					$scrollerA, $scrollerB, sGradientA, sGradientB,
					// this method returns first set background color of any parent but only if there is no background image set
					fnGetParentBackground = function ($element) {
						var sColor = sNoColor;
						$element.parents().each(function (iIndex, domEl) {
							var sBackgroundColor = jQuery(domEl).css("background-color"),
								sBackgroundImage = jQuery(domEl).css("background-image");

							// if both are set in same element we don't use scrollbars so this condition if first
							if (sBackgroundImage !== "none") {
								sColor = sNoColor;
								return;
							}

							if (sBackgroundColor !== sNoColor && sBackgroundColor !== "transparent") {
								sColor = sBackgroundColor;
							}
						});

						return sColor;
					};

				if (this._scrollingFadeout()) {
					// show scrollers only if there is enought space
					iSize = this._isVertical() ? $this.height() : $this.width();
					if (iSize < MIN_SIZE) {
						$this.find(".sapSuiteUiCommonsTimelineVerticalScroller", ".sapSuiteUiCommonsTimelineHorizontalScroller").hide();
						this._scrollersSet = false;
						return;
					}

					if (!this._scrollersSet) {
						// find parent color
						sBackgroundColor = fnGetParentBackground(this.$());

						// if there is background image defined or color is not defined
						// we are not able to setup gradient, hide all scraller buttons and divs
						if (sBackgroundColor && sBackgroundColor !== sNoColor) {
							aRgb = sBackgroundColor.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);

							if (aRgb && aRgb.length >= 4) {
								iR = parseInt(aRgb[1], 10);
								iG = parseInt(aRgb[2], 10);
								iB = parseInt(aRgb[3], 10);

								sFrom = "rgba(" + iR + "," + iG + "," + iB + ", 0)";
								sMid = "rgba(" + iR + "," + iG + "," + iB + ", 0.7)";
								sTo = "rgba(" + iR + "," + iG + "," + iB + ", 1)";

								$scrollerA = $this.find(".sapSuiteUiCommonsTimelineHorizontalLeftScroller, .sapSuiteUiCommonsTimelineTopScroller ");
								$scrollerB = $this.find(".sapSuiteUiCommonsTimelineHorizontalRightScroller, .sapSuiteUiCommonsTimelineBottomScroller");
								sGradientA = this._isVertical() ? "top" : "left";
								sGradientB = this._isVertical() ? "bottom" : "right";

								$scrollerA.css("background-image", "linear-gradient(to " + sGradientA + ", " + sFrom + ", " + sTo + ")");
								$scrollerB.css("background-image", "linear-gradient(to " + sGradientB + ", " + sFrom + ", " + sTo + ")");

								$scrollerA.css("background-image", "-webkit-linear-gradient(" + sGradientB + ", " + sFrom + ", " + sMid + " 30%," + sTo + ")");
								$scrollerB.css("background-image", "-webkit-linear-gradient(" + sGradientA + ", " + sFrom + ", " + sMid + " 30%," + sTo + ")");


								// we setup scroller once for rendering
								this._scrollersSet = true;

								// oData or delayed loading for empty items fix
								if (this.getContent().length > 0) {
									// if there is scrollbar show right scroller
									// left scrollbar is shown only after some scrolling is done
									if ((!this._isVertical() && this._$content.get(0).scrollWidth > this._$content.outerWidth()) ||
										(this._isVertical() && this._$content.get(0).scrollHeight > this._$content.outerHeight())) {
										$scrollerB.show();
									}
								}
							}
						} else {
							// we were not able to find background color or there is background image selected ->
							// unable to set gradient color so we hide scrollers
							$this.find(".sapSuiteUiCommonsTimelineHorizontalScroller").hide();
						}
					}

					if (!this._isVertical()) {
						this._fixScrollerPositionH();
					}
				}
			};

			/**
			 * Events for scrollers and lazy loading management
			 * @private
			 */
			Timeline.prototype._setupScrollEvent = function () {
				var $this = this.$(),
					$scrollerAIcon = $this.find(".sapSuiteUiCommonsTimelineHorizontalLeftScroller .sapSuiteUiCommonsTimelineScrollerIconWrapper, .sapSuiteUiCommonsTimelineTopScroller .sapSuiteUiCommonsTimelineScrollerIconWrapper"),
					$scrollerBIcon = $this.find(".sapSuiteUiCommonsTimelineHorizontalRightScroller .sapSuiteUiCommonsTimelineScrollerIconWrapper, .sapSuiteUiCommonsTimelineBottomScroller .sapSuiteUiCommonsTimelineScrollerIconWrapper"),
					$scrollerA = $this.find(".sapSuiteUiCommonsTimelineHorizontalLeftScroller, .sapSuiteUiCommonsTimelineTopScroller"),
					$scrollerB = $this.find(".sapSuiteUiCommonsTimelineHorizontalRightScroller, .sapSuiteUiCommonsTimelineBottomScroller"),
					$scroller = this._$content,
					that = this; //eslint-disable-line

				// setup lazy loading for timeline without growing buttons
				if (that._lazyLoading() || that._scrollingFadeout()) {
					$scroller.on("scroll", function (event) {
						var $target = jQuery(event.currentTarget),
							iScrollLeft = $target.get(0).scrollLeft,
							iScrollTop = $target.get(0).scrollTop,
							bEndPosition = false,
							OFFSET = 200,
							ENDOFFSET = 5,
							// this marker is for preventing multiple lazy loading events
							// once lazy loading started, set this flag off and wait for afterrender for new round (then set it on)
							bLoadMore = false,
							iHeight, iScrollHeight, iWidth, iScrollWidth,
							$scroller;

						if (that._isVertical()) {
							iHeight = $target.outerHeight();
							iScrollHeight = $target.get(0).scrollHeight;

							bLoadMore = iScrollTop + iHeight > iScrollHeight - OFFSET;
							bEndPosition = iScrollTop + iHeight >= iScrollHeight - ENDOFFSET;

						} else {
							iWidth = $target.width();
							iScrollWidth = $target.get(0).scrollWidth;

							bLoadMore = iScrollLeft + iWidth > iScrollWidth - OFFSET;
							bEndPosition = iScrollLeft + iWidth >= iScrollWidth - ENDOFFSET - 185;
							/*ul margin*/
						}

						if (that._lazyLoading() && that._scrollMoreEvent) {
							if (bLoadMore && !that._isMaxed()) {
								that._scrollMoreEvent = false;
								that._loadMore();
							}
						}

						// hide/show left scroller if scroller position is right at the begining
						if (that._scrollersSet) {
							if (iScrollLeft > 50 || iScrollTop > 50) {
								$scrollerA.show();
							} else {
								$scrollerA.hide();
								that._manualScrolling = false;
							}

							if (bEndPosition) {
								$scrollerB.hide();
							} else {
								$scrollerB.show();
							}

							// when scrolling performed, make special background for scrolling buttons
							// determine whether we scroll left or right (top or bottom)
							var currentScrollPosition;
							if (that._isVertical()) {
								currentScrollPosition = $target.get(0).scrollTop;
								$scroller = currentScrollPosition > that._lastScrollPosition.y ? $scrollerBIcon : $scrollerAIcon;
								that._lastScrollPosition.y = currentScrollPosition;

							} else {
								currentScrollPosition = $target.get(0).scrollLeft;
								$scroller = currentScrollPosition > that._lastScrollPosition.x ? $scrollerBIcon : $scrollerAIcon;
								that._lastScrollPosition.x = currentScrollPosition;
							}

							// add special scrolling background
							$scroller.addClass("sapSuiteUiCommonsTimelineScrolling");

							// after some delay remove scrolling background
							clearTimeout(jQuery.data(this, 'scrollTimer'));
							jQuery.data(this, 'scrollTimer', setTimeout(function () {
								// clear both to prevent chaining
								$scrollerAIcon.removeClass("sapSuiteUiCommonsTimelineScrolling");
								$scrollerBIcon.removeClass("sapSuiteUiCommonsTimelineScrolling");
							}, 350));
						}
					});

					// setup scroller click events
					this.$().find(".sapSuiteUiCommonsTimelineScrollerIconWrapper").on("mousedown", function (event) {
						var SCROLLSIZE = 90,
							iDiff = (jQuery(this).hasClass("sapSuiteUiCommonsTimelineScrollerIconWrapperLeft") ||
								jQuery(this).hasClass("sapSuiteUiCommonsTimelineScrollerIconWrapperTop")) ? -SCROLLSIZE : SCROLLSIZE;

						that._manualScrolling = true;
						that._performScroll(iDiff);
					});

					this.$().find(".sapSuiteUiCommonsTimelineScrollerIconWrapper").on("mouseup", function () {
						that._manualScrolling = false;
					}).on("mouseout", function () {
						that._manualScrolling = false;
					});
				}

				// setup wheel scrolling for horizontal timeline
				if (this.getEnableScroll() && !that._isVertical()) {
					// horizontal mouse scroll
					this._$content.on("wheel", function (event) {
						// probably touch scrolling we ignore as it should be natively supported
						if (event.originalEvent.deltaX) {
							return;
						}

						var iDeltaY = event.originalEvent.deltaY,
							MIN = 30;
						// for some browsers delatY is very small when using wheel scroll
						// we set minimal value to prevent very slow scrolling
						if (iDeltaY < MIN && iDeltaY > MIN * -1) {
							iDeltaY = iDeltaY > 0 ? MIN : MIN * -1;
						}

						this.scrollLeft += iDeltaY * 2;
					});

					$this.find(".sapSuiteUiCommonsTimelineHorizontalScroller, .sapSuiteUiCommonsTimelineVerticalScroller").on("wheel", function (event) {
						var iDeltaY = event.originalEvent.deltaY;
						if (that._isVertical()) {
							that._$content.get(0).scrollTop += iDeltaY * 2;
						} else {
							that._$content.get(0).scrollLeft += iDeltaY * 2;
						}
					});
				}
			};

			/**
			 * Message strip creation
			 * @private
			 */
			Timeline.prototype._setupMessageStrip = function () {
				var that = this; //eslint-disable-line
				this._objects.register("messageStrip", function () {
					return new MessageStrip(that.getId() + "-messageStrip", {
						close: function () {
							that.setCustomMessage("");
							that.fireCustomMessageClosed();
						},
						showCloseButton: true
					});
				});

				this._objects.register("filterMessageText", function () {
					return new Text(that.getId() + "-filterMessageText", {});
				});

				this._objects.register("filterMessage", function () {
					var oText = that._objects.getFilterMessageText(),
						oToolbar, oIcon;

					oIcon = new Icon(that.getId() + "filterMessageIcon", {
						src: "sap-icon://decline",
						press: [that._clearFilter, that]
					});
					oIcon.setTooltip(resourceBundle.getText('TIMELINE_CLEAR_ICN_TOOLTIP'));
					oToolbar = new OverflowToolbar(that.getId() + "-filterMessage", {
						design: "Info",
						content: [oText, new ToolbarSpacer(), oIcon]
					});

					oToolbar.addStyleClass("sapSuiteUiCommonsTimelineFilterInfoBar");
					oToolbar.setHeight("auto");

					return oToolbar;
				});
			};

			/**
			 * If there is any filter message to show, display filter bar
			 * @param {sap.ui.core.Control} ctrl Control for filter bar to be appended to
			 * @private
			 */
			Timeline.prototype._setMessageBars = function (ctrl) {
				var sMessage = this._getFilterMessage();
				if (sMessage) {
					ctrl.addChild(this._objects.getFilterMessage());
					this._objects.getFilterMessageText().setText(sMessage);
				}
			};

			/**
			 * Range filter dialog creation
			 * @private
			 */
			Timeline.prototype._setupRangeFilterPage = function () {
				var that = this; //eslint-disable-line
				this._rangeFilterType = null;

				this._objects.register("timestampFilterPicker", function () {
					return new TimelineRenderManagerTimestamp(that.getId(), {
						dateChanged: function (oEvent) {
							var oSource = oEvent.getSource(),
								oFrom = oSource.getStartDate() || that._minDate,
								oTo = oSource.getEndDate() || that._maxDate;

							that._filterDialogRangePage.setFilterCount(+(oFrom !== that._minDate || oTo !== that._maxDate));
						}
					}, undefined, resourceBundle,that._objects);
				});
				this._objects.register("timeFilterSelect", function () {
					var oSelect = new Select(that.getId() + "-timeFilterSelect", {
						ariaLabelledBy: that._objects.getRangeTypeLbl().getId(),
						change: function (event) {
							that._rangeFilterType = event.getParameter("selectedItem").getProperty("key");
							that.toggleGroupTypeSelector(that._rangeFilterType);
							that._setRangeFilter();
							var oDialog = that._objects.getFilterContent()._getDialog();
							var oBeginButton = oDialog.getBeginButton();
							oBeginButton.setEnabled(true);
							if (that._objects.getTimeFilterSelect().getSelectedItem().getText() === resourceBundle.getText("TIMELINE_CUSTOM_RANGE")) {
								that._objects.getTimestampFilterPicker()._checkDatePickerStatus();
							}
						},
						items: [
							new Item({
								text: resourceBundle.getText("TIMELINE_YEAR"),
								key: TimelineGroupType.Year
							}),
							new Item({
								text: resourceBundle.getText("TIMELINE_QUARTER"),
								key: TimelineGroupType.Quarter
							}),
							new Item({
								text: resourceBundle.getText("TIMELINE_MONTH"),
								key: TimelineGroupType.Month
							}),
							new Item({
								text: resourceBundle.getText("TIMELINE_DAY"),
								key: TimelineGroupType.Day
							}),
							new Item({
								text: resourceBundle.getText("TIMELINE_CUSTOM_RANGE"),
								key: TimelineGroupType.None
							})]
					});
					oSelect.addStyleClass("sapSuiteUiCommonsTimelineRangeSelect");
					return oSelect;
				});

				this._objects.register("timeRangeSlider", function () {
					var fnMap = function (fValue) {
						if (typeof fValue === "string") {
							fValue = Number(fValue);
						}
						var oDate = that._fnAddDate(fValue);
						return that._formatGroupBy(oDate, that._rangeFilterType).title;
					};
					var oScale = new ResponsiveScale();
					oScale.getLabel = fnMap;
					var oSlider = new RangeSlider(that.getId() + "-timeRangeSlider", {
						enableTickmarks: true,
						visible: false,
						showAdvancedTooltip: true,
						step: 1,
						change: function (oEvent) {
							var iMin = oSlider.getMin(),
								iMax = oSlider.getMax(),
								aRange = oSlider.getRange();

							that._filterDialogRangePage.setFilterCount(+(aRange[0] !== iMin || aRange[1] !== iMax));
						},
						customTooltips: [new StringSliderTooltip({
							mapFunction: fnMap
						}), new StringSliderTooltip({
							mapFunction: fnMap,
							fetchValue2: true
						})],
						scale: oScale
					});
					oSlider.addStyleClass("sapSuiteUiCommonsTimelineRangeFilter");

					return oSlider;
				});

				this._objects.register("rangeTypeLbl", function () {
					return new Label(that.getId() + "-rangeTypeLbl", {
						text: resourceBundle.getText("TIMELINE_GROUP_BY_PERIOD") + ":"
					});
				});

				this._objects.register("rangeTypePanel", function () {
					var oPanel = new Panel(that.getId() + "-rangeTypePanel", {
						content: [that._objects.getRangeTypeLbl(), that._objects.getTimeFilterSelect()]
					});
					oPanel.addStyleClass("sapSuiteUiCommonsTimelineRangeFilterPanel");
					oPanel.addStyleClass("sapSuiteUiCommonsTimelineRangeFilterPanelShadowed");
					return oPanel;
				});

				this._objects.register("rangePanel", function () {
					return new FlexBox(that.getId() + "rangePanel", {
						direction: "Column",
						items: [
							that._objects.getRangeTypePanel(),
							that._objects.getTimeRangeSlider(),
							that._objects.getTimestampFilterPicker().getTimestampPanelRadio(),
							that._objects.getTimestampFilterPicker().getTimestampPanelPicker()
						]
					});
				});
			};

			/**
			 * Sets the first page of filter dialog based on the settings
			 * @param {sap.m.ViewSettingsDialog} oFilterDialog The dialog to be set up
			 * @private
			 */
			Timeline.prototype._setupFilterFirstPage = function (oFilterDialog) {
				if (oFilterDialog) {
					oFilterDialog.removeAllAggregation("filterItems");
					if (this.getShowItemFilter()) {
						oFilterDialog.addAggregation("filterItems", new ViewSettingsFilterItem({
							key: "items",
							text: this._getFilterTitle()
						}));
					}

					if (this.getShowTimeFilter()) {
						this._filterDialogRangePage = new ViewSettingsCustomItem({
							key: "range",
							text: resourceBundle.getText("TIMELINE_RANGE_SELECTION"),
							customControl: [this._objects.getRangePanel()]
						});
						oFilterDialog.addAggregation("filterItems", this._filterDialogRangePage);
					}
				}
			};

			/**
			 * Filter dialog creation
			 * @private
			 */
			Timeline.prototype._setupFilterDialog = function () {
				var that = this; //eslint-disable-line

				this._setupRangeFilterPage();

				this._objects.register("filterContent", function () {
					var iDiffStart, iDiffEnd,
						fnProcessToDataFilterPage = function (oPage) {
							if (!that._filterState.data) {
								// recreate from the scratch every time its opened as data may dynamically change
								that._setFilterList();
								oPage.removeAllItems();
								that._aFilterList.forEach(function (oItem) {
									var bSelected = jQuery.grep(that._currentFilterKeys, function (oSelectedItem) {
										return oItem.key === oSelectedItem.key;
									}).length > 0;

									oPage.addItem(new ViewSettingsFilterItem({
										key: oItem.key,
										text: oItem.text,
										selected: bSelected
									}));
								});
							}
							that._filterState.data = true;
						},
						fnShowErrorToast = function () {
							MessageToast.show(resourceBundle.getText("TIMELINE_NO_LIMIT_DATA"));
						},
						fnProcessToRangeFilterPage = function () {
							if (!that._filterState.range) {
								oFilterDialog.setBusy(true); //eslint-disable-line
								that._getTimeFilterData().then(function () {
									oFilterDialog.setBusy(false); //eslint-disable-line

									if ((!that._minDate || !that._maxDate) ||
										(!(that._minDate instanceof Date) || !(that._maxDate instanceof Date))) {
										fnShowErrorToast();
										return;
									}

									if (!that._rangeFilterType) {
										// first time load - calculate range type by date difference
										that._rangeFilterType = that._calculateRangeTypeFilter();
									}

									if (!that._startDate && !that._endDate) {
										that._setRangeFilter();
									} else {
										// in case min and max was changed, change the limits accordingly
										var oSlider = that._objects.getTimeRangeSlider(),
											iDiff = that._fnDateDiff(that._rangeFilterType),
											iMin = oSlider.getMin(),
											iMax = oSlider.getMax();

										if (iMax - iMin !== iDiff) {
											that._setRangeFilter();
										}

										// convert selected date time to integer number (difference from the start) to correctly setup time range selector
										iDiffStart = that._fnDateDiff(that._rangeFilterType, that._minDate, that._startDate);
										iDiffEnd = that._fnDateDiff(that._rangeFilterType, that._minDate, that._endDate);

										oSlider.setRange([iDiffStart, iDiffEnd]);
									}
									that.toggleGroupTypeSelector(that._rangeFilterType);

									// reselect drop down with type
									that._objects.getTimeFilterSelect().setSelectedKey(that._rangeFilterType);
								}).catch(function () {
									oFilterDialog.setBusy(false); //eslint-disable-line
									fnShowErrorToast();
								});

								that._filterState.range = true;
							}
						},
						oFilterDialog = new ViewSettingsDialog(that.getId() + "-filterContent", {
							confirm: function (oEvent) {
								// collect filter items
								var aItems = oEvent.getParameter("filterItems"),
									oSlider, iMin, iMax, aRange, bRange;
								that._currentFilterKeys = aItems.map(function (oItem) {
									return {
										key: oItem.getProperty("key"),
										text: oItem.getProperty("text")
									};
								});

								that._startDate = null;
								that._endDate = null;

								if (that._objects.getTimestampFilterPicker().getVisible()) {
									var oFrom = that._objects.getTimestampFilterPicker().getStartDate() || that._minDate,
										oTo = that._objects.getTimestampFilterPicker().getEndDate() || that._maxDate;

									if (oFrom !== that._minDate || oTo !== that._maxDate) {
										that._startDate = oFrom;
										that._endDate = oTo;

										bRange = true;
									}
								} else {
									// collect time range items
									oSlider = that._objects.getTimeRangeSlider();
									aRange = oSlider.getRange();
									iMin = oSlider.getMin();
									iMax = oSlider.getMax();

									if (aRange[0] !== iMin || aRange[1] !== iMax) {
										that._startDate = that._fnAddDate(Math.min.apply(null, aRange), DateRoundType.DOWN);
										that._endDate = that._fnAddDate(Math.max.apply(null, aRange), DateRoundType.UP);
										bRange = true;
									}
								}

								that._filterData(bRange);
							},
							resetFilters: function (oEvent) {
								var oSlider = that._objects.getTimeRangeSlider();
								oSlider.setValue(oSlider.getMin());
								oSlider.setValue2(oSlider.getMax());
								that._filterDialogRangePage.setFilterCount(0);

								that._objects.getTimestampFilterPicker().clearDates();
							},
							filterDetailPageOpened: function (oItem) {
								var sKey = oItem.getParameter("parentFilterItem").getProperty("key");

								if (sKey === "items") {
									fnProcessToDataFilterPage(oItem.getParameter("parentFilterItem"));
								}
								if (sKey === "range") {
									fnProcessToRangeFilterPage();
								}
							}
						});

					that._setupFilterFirstPage(oFilterDialog);

					return oFilterDialog;
				});
			};

			/**
			 * Header toolbar creation + icons
			 * @private
			 */
			Timeline.prototype._setupHeaderToolbar = function () {
				var that = this, //eslint-disable-line
					fnRegisterControl = function (oOptions) {
						that._objects.register(oOptions.name, function () {
							var btn = new OverflowToolbarButton(that.getId() + "-" + oOptions.name, {
								type: ButtonType.Transparent,
								icon: oOptions.icon,
								tooltip: oOptions.tooltip,
								press: oOptions.fnPress
							});

							btn.setLayoutData(new OverflowToolbarLayoutData({
								priority: oOptions.priority
							}));

							return btn;
						});
					};

				fnRegisterControl({
					name: "filterIcon",
					icon: "sap-icon://add-filter",
					tooltip: resourceBundle.getText("TIMELINE_FILTER_BY"),
					fnPress: [that._openFilterDialog, that],
					priority: OverflowToolbarPriority.NeverOverflow,
					visible: that.getShowItemFilter() || that.getShowTimeFilter()
				});

				fnRegisterControl({
					name: "sortIcon",
					icon: "sap-icon://arrow-bottom",
					tooltip: resourceBundle.getText("TIMELINE_SORT"),
					fnPress: [that._sortClick, that],
					priority: OverflowToolbarPriority.High,
					visible: that.getSort() && that.getShowSort()
				});

				var oToolbarSpacer = new ToolbarSpacer();

				this._objects.register("searchFieldLabel", function () {
					return new InvisibleText(that.getId() + "-searchFieldLabel", {
						text: resourceBundle.getText("TIMELINE_ACCESSIBILITY_SEARCH")
					});
				});

				this._objects.register("searchField", function () {
					var btn = new SearchField(that.getId() + "-searchField", {
						width: "14rem",
						ariaLabelledBy: that._objects.getSearchFieldLabel().getId(),
						search: function (oEvent) {
							that._search(oEvent.getSource().getValue());
						},
						visible: that.getShowSearch()
					});
					btn.setLayoutData(new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.Low
					}));

					return btn;
				});

				this._objects.register("headerBar", function () {
					var aContent = [
						oToolbarSpacer,
						that._objects.getSearchFieldLabel(),
						that._objects.getSearchField(),
						that._objects.getSortIcon(),
						that._objects.getFilterIcon()
					];

					var oHeaderBar = new OverflowToolbar(that.getId() + "-headerBar", {
						content: aContent,
						visible: that.getShowHeaderBar()
					});

					oHeaderBar.addStyleClass("sapSuiteUiCommonsTimelineHeaderBar");
					oHeaderBar.setParent(that);

					return oHeaderBar;
				});
			};

			/**
			 * Initializes elements for accessibility support.
			 * @private
			 */
			Timeline.prototype._setupAccessibilityItems = function () {
				var that = this; //eslint-disable-line
				this._objects.register("accessibilityTitle", function () {
					return new InvisibleText(that.getId() + "-accessibilityTitle", {
						text: resourceBundle.getText("TIMELINE_ACCESSIBILITY_TITLE")
					});
				});
			};

			/**
			 * Hides or shows the time range selector, based on the passed rangeFilterType.
			 *
			 * @public
			 *
			 * @param {sap.suite.ui.commons.library.TimelineGroupType} rangeFilterType is currently selected group type
			 */
			Timeline.prototype.toggleGroupTypeSelector = function (rangeFilterType) {
				var groupingIsUsed = rangeFilterType !== TimelineGroupType.None;
				this._objects.getTimestampFilterPicker().setVisible(!groupingIsUsed);
				this._objects.getTimeRangeSlider().setVisible(groupingIsUsed);
			};
		}
	};

	return TimelineRenderManager;
}, true);
