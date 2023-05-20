/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"./library",
	"sap/suite/ui/commons/util/HtmlElement",
	"sap/ui/core/Icon",
	"sap/m/Button",
	"sap/base/security/encodeXML"
], function (library, HtmlElement, Icon, Button, encodeXML) {
	"use strict";

	var TimelineAxisOrientation = library.TimelineAxisOrientation,
		ScrollingFadeout = library.TimelineScrollingFadeout;

	/**
	 * Timeline renderer.
	 * @namespace
	 */
	var TimelineRenderer = {},
		resourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");
	TimelineRenderer.apiVersion = 2;

	/**
	 * Render timeline into given RenderManager.
	 * @param {sap.ui.core.RenderManager} oRm RenderManager
	 * @param {sap.ui.core.Control} oTimeline Timeline control
	 * @public
	 */
	TimelineRenderer.render = function (oRm, oTimeline) {
		var model = this._getHtmlModel(oTimeline);
		model.getRenderer().render(oRm);
	};

	/**
	 * Converts timeline to it's HTML representation.
	 * @param {sap.suite.ui.commons.Timeline} oTimeline The Timeline control
	 * @returns {sap.suite.ui.commons.util.HtmlElement} The HtmlElement corresponding to the Timeline's orientation
	 * @private
	 */
	TimelineRenderer._getHtmlModel = function (oTimeline) {
		if (oTimeline.getAxisOrientation() === TimelineAxisOrientation.Horizontal) {
			return this._getHorizontalTimelineElement(oTimeline);
		} else {
			return this._getVerticalTimelineElement(oTimeline);
		}
	};

	/**
	 * Return scrolling icon wrapper for scrollers (ScrollingFadeout='AreaWithButtons')
	 * @param {sap.suite.ui.commons.TimelineItem} oTimelineItem The item to be rendered
	 * @param {string} sId ID for icon
	 * @param {string} sDirection Direction of icon
	 * @returns {object} element with icon wrapper
	 * @private
	 */
	TimelineRenderer._getScrollerIcon = function (oTimelineItem, sId, sDirection) {
		var eWrapper = new HtmlElement("div"),
			sName = "scrollerIcon" + sDirection,
			sGetter = "getScrollerIcon" + sDirection;

		eWrapper.addClass(encodeXML("sapSuiteUiCommonsTimelineScrollerIconWrapper sapSuiteUiCommonsTimelineScrollerIconWrapper" + sDirection));

		oTimelineItem._objects.register(sName, function () {
			// we skip id for purpose cause we want this control never keep focus when rendered
			// this causes wrong scrolling after loading more items
			return new Icon({
				src: "sap-icon://step"
			});
		});

		eWrapper.addChild(oTimelineItem._objects[sGetter]());
		return eWrapper;
	};

	/**
	 * Set width and height for timeline base on its settings
	 * @param {sap.suite.ui.commons.Timeline} oTimeline The Timeline control
	 * @param {sap.suite.ui.commons.util.HtmlElement} eControl Timeline element
	 * @private
	 */
	TimelineRenderer._setWidthAndHeight = function (oTimeline, eControl) {
		var sHeight = oTimeline.getHeight(),
			sWidth = oTimeline.getWidth();
		if (sHeight && !oTimeline._isVertical()) {
			eControl.addStyle("height", sHeight);
		}

		// for horizontal timeline without scrollbar ignore width parameter - it makes no sense
		// if we put 100% timeline won't have proper content's width
		// (even tho browser would be probably fine with this, as TL direct child (content) has proper width
		// this is cleaner solution)
		if (sWidth && (oTimeline._isVertical() || oTimeline.getEnableScroll())) {
			eControl.addStyle("width", sWidth);
		}
	};

	/**
	 * Returns horizontal timeline element representation
	 * @param {sap.suite.ui.commons.Timeline} oTimeline The Timeline control
	 * @returns {sap.suite.ui.commons.util.HtmlElement} returns Timeline element for horizontal orientation
	 * @private
	 */
	TimelineRenderer._getHorizontalTimelineElement = function (oTimeline) {
		var bIsDoubleSided = oTimeline.getEnableDoubleSided(),
			bIsTop = oTimeline._isLeftAlignment(),
			aContent = oTimeline._outputItem,
			// count of items for each group (if deleted when group header is reached)
			iGroupItemCount = 0,
			bIsFirstGroupEvenItem = true,
			oItem, sPlacementLine, bIsEven, bIsGroupHeader, oNextItem, cParent,
			bIsMaxed = oTimeline._isMaxed(),
			bLastGroup,
			fnCreateUL = function() {
				var eUl = new HtmlElement("ul");
				eUl.setAttribute("role", "listbox");
				return eUl;
			};

		// controls
		var eControl = new HtmlElement("div"),
			eContent = new HtmlElement("div"),
			eScroll = new HtmlElement("div"),
			eScrollContainer = new HtmlElement("div"),
			eTopLine = new HtmlElement("div"),
			eUlTop = fnCreateUL(),
			eMiddleLine = new HtmlElement("div"),
			eUlMid = fnCreateUL(),
			eBottomLine = new HtmlElement("div"),
			eUlBot = fnCreateUL(),
			eLeftScroller = new HtmlElement("div"),
			eRightScroller = new HtmlElement("div"),
			eBefore = new HtmlElement("div"),
			eAfter = new HtmlElement("div");


		eControl.addControlData(oTimeline);
		eControl.addClass("sapSuiteUiCommonsTimelineH");

		if (!oTimeline.getEnableScroll()) {
			eControl.addClass("sapSuiteUiCommonsTimelineNoScroll");
		}

		if (oTimeline._useAutomaticHeight()) {
			eControl.addClass("sapSuiteUiCommonsTimelineAutomaticLineHeight");
		}

		this._addAccessibilityTags(eControl, oTimeline);
		this._setWidthAndHeight(oTimeline, eControl);

		if (bIsDoubleSided) {
			eControl.addClass("sapSuiteUiCommonsTimelineDblSidedH");
		} else {
			eControl.addClass(bIsTop ? "sapSuiteUiCommonsTimelineRight" : "sapSuiteUiCommonsTimelineLeft");
		}

		if (oTimeline._isGrouped()) {
			eControl.addClass("sapSuiteUiCommonsTimelineGrouped");
		}

		eControl.addChild(oTimeline._objects.getHeaderBar());
		oTimeline._setMessageBars(eControl);

		eBefore.setId(oTimeline.getId() + "-contentH-before");
		eControl.addChild(eBefore);

		eContent.setId(oTimeline.getId() + "-contentH");
		eContent.addClass("sapSuiteUiCommonsTimelineContentsH");
		eControl.addChild(eContent);

		eAfter.setId(oTimeline.getId() + "-contentH-after");
		eControl.addChild(eAfter);

		eScroll.setId(oTimeline.getId() + "-scrollH");
		eScroll.addClass("sapSuiteUiCommonsTimelineScrollH");
		eContent.addChild(eScroll);

		eTopLine.addClass("sapSuiteUiCommonsTimelineHorizontalTopLine");
		eMiddleLine.addClass("sapSuiteUiCommonsTimelineHorizontalMiddleLine");
		eMiddleLine.addChild(eUlMid);
		eBottomLine.addClass("sapSuiteUiCommonsTimelineHorizontalBottomLine");

		if (bIsDoubleSided || bIsTop) {
			eTopLine.addChild(eUlTop);
		}
		if (bIsDoubleSided || !bIsTop) {
			eBottomLine.addChild(eUlBot);
		}

		eUlTop.addClass("sapSuiteUiCommonsTimelineHorizontalScrollingLine");
		eUlBot.addClass("sapSuiteUiCommonsTimelineHorizontalScrollingLine");
		eUlMid.addClass("sapSuiteUiCommonsTimelineHorizontalScrollingLine");

		if (aContent.length > 0) {
			if (oTimeline._scrollingFadeout()) {
				eControl.addChild(eLeftScroller);
				eControl.addChild(eRightScroller);

				eLeftScroller.addClass("sapSuiteUiCommonsTimelineHorizontalLeftScroller sapSuiteUiCommonsTimelineHorizontalScroller");
				eRightScroller.addClass("sapSuiteUiCommonsTimelineHorizontalRightScroller sapSuiteUiCommonsTimelineHorizontalScroller");

				if (oTimeline.getScrollingFadeout() === ScrollingFadeout.AreaWithButtons) {
					eLeftScroller.addChild(this._getScrollerIcon(oTimeline, "_scollerIconLeft", "Left"));
					eRightScroller.addChild(this._getScrollerIcon(oTimeline, "_scollerIconRight", "Right"));
				}
			}

			eScrollContainer.addClass("sapSuiteUiCommonsTimelineHorizontalScrollContainer");
			eScroll.addChild(eScrollContainer);

			eScrollContainer.addChild(eTopLine);
			eScrollContainer.addChild(eMiddleLine);
			eScrollContainer.addChild(eBottomLine);

			eUlMid.addChild(this._getFirstHorizontalDelimiterLine(aContent[0]));

			// 3 LI lists
			// Top and bottom with items (switching odd and even) and one LI with icons and bars
			//
			// LI 1: ItemA ItemC ItemE
			// LI 2: iA iB  iC iD iE
			// LI 3:   ItemB ItemD
			//

			for (var i = 0; i < aContent.length; i++) {
				bLastGroup = bIsMaxed;
				oItem = aContent[i];
				// // parent is top or bottom (depends whether alignment)
				// for doublesided it depends whether item is odd or even
				// item itself has to know which line he belons to (proper CSS styling)
				sPlacementLine = bIsTop ? "top" : "bottom";
				bIsEven = (iGroupItemCount % 2 );
				bIsGroupHeader = oItem.getText() === "GroupHeader";
				oNextItem = aContent[i + 1];

				// parent is top or bottom (depends whether alignment)
				// for doublesided it depends whether item is odd or even
				cParent = bIsTop ? eUlTop : eUlBot;

				if (bIsDoubleSided) {
					// top position by default (for odd and group headers)
					cParent = eUlTop;

					// double sided has it own placement logic
					if (!bIsGroupHeader) {
						cParent = bIsEven ? eUlBot : eUlTop;
					}
					sPlacementLine = bIsEven ? "bottom" : "top";
				}

				if (bIsGroupHeader) {
					iGroupItemCount = 0;
					bIsFirstGroupEvenItem = true;
					sPlacementLine = "top";

					if (bLastGroup) {
						// check if this group is a last one
						for (var k = i + 1; k < aContent.length; k++) {
							if (aContent[k]._isGroupHeader) {
								bLastGroup = false;
								break;
							}
						}
					}
				} else if (bIsEven) {
					oItem._isFirstGroupEvenItem = bIsFirstGroupEvenItem;
					bIsFirstGroupEvenItem = false;
				}

				oItem._index = i;
				oItem._orientation = "H";
				oItem._placementLine = sPlacementLine;

				cParent.addChild(oItem);

				// delimiter (icon and bar) for each item
				var oDelimiterItem = this._getHorizontalDelimiterLine(oTimeline, oItem, iGroupItemCount, oNextItem, bIsMaxed && !oNextItem, bLastGroup);
				if (oDelimiterItem) {
					eUlMid.addChild(oDelimiterItem);
				}

				if (!bIsGroupHeader) {
					iGroupItemCount++;
				}
			}
		} else {
			eScroll.addChild(this._getEmptyTimelineElement(oTimeline));
		}

		// show more is appended to middle line
		if (oTimeline._showMore) {
			eUlMid.addChild(this._getShowMoreElement(oTimeline));
		}

		return eControl;
	};

	/**
	 * Return first horizontal delimiter element
	 * @param {sap.suite.ui.commons.TimelineItem} oTimelineItem The Timeline item control
	 * @returns {sap.suite.ui.commons.util.HtmlElement} First delimiter line element
	 * @private
	 */
	TimelineRenderer._getFirstHorizontalDelimiterLine = function (oTimelineItem) {
		var eItem = new HtmlElement("li"),
			eDivWrapper = new HtmlElement("div"),
			eDiv = new HtmlElement("div"),
			eBar = new HtmlElement("div"),
			bIsGroup = oTimelineItem._isGroupHeader;

		eBar.addClass("sapSuiteUiCommonsTimelineItemBarH");
		eDiv.addClass("sapSuiteUiCommonsTimelineItemBarWrapper");
		eDiv.addChild(eBar);

		eDivWrapper.addChild(eDiv);
		eDivWrapper.addClass("sapSuiteUiCommonsTimelineItemBarDivWrapper");

		eItem.addChild(eDivWrapper);

		eItem.addClass("sapSuiteUiCommonsTimelineItemFirstBar");
		if (bIsGroup) {
			eItem.addClass(oTimelineItem._isGroupCollapsed() ? "sapSuiteUiCommonsTimelineGroupCollapsed" : "sapSuiteUiCommonsTimelineGroupExpanded");
		}

		return eItem;
	};

	/**
	 * Return delimiter line with icons for horizontal mode
	 * @param {sap.suite.ui.commons.Timeline} oTimeline The Timeline control
	 * @param {sap.suite.ui.commons.TimelineItem} oTimelineItem The TimelineItem control
	 * @param {int} iIndex Index of the item
	 * @param {sap.suite.ui.commons.TimelineItem} oNextItem Next item of current item
	 * @param {boolean} bLastItem Indicates whether this item is last item
	 * @param {boolean} bLastGroup Indicates last group
	 * @returns {sap.suite.ui.commons.util.HtmlElement} Delimiter element
	 * @private
	 */
	TimelineRenderer._getHorizontalDelimiterLine = function (oTimeline, oTimelineItem, iIndex, oNextItem, bLastItem, bLastGroup) {
		var bIsEven = (iIndex % 2 ),
			bIsGroupHeader = oTimelineItem.getText() === "GroupHeader",
			sItemClass = bIsGroupHeader ? "sapSuiteUiCommonsTimelineItemGroupHeaderH" : "sapSuiteUiCommonsTimelineItemBaseLength",
			sBarClass = "sapSuiteUiCommonsTimelineItemBarH",
			bIsNextGroup = oNextItem != null && oNextItem._isGroupHeader,
			bIsLast = oNextItem === null,
			sStatusClass = oTimelineItem._getStatusColorClass(),
			// controls
			eItem = new HtmlElement("li"),
			eItemChild = new HtmlElement("div"),
			eBar = new HtmlElement("div"),
			eBarWrapper = new HtmlElement("div"),
			eIconWrapper = new HtmlElement("div"),
			eDivNoIcon = new HtmlElement("div"),
			eDivNoIconWrapper = new HtmlElement("div");

		eItem.setId(oTimelineItem.getId() + "-line");

		if (bIsGroupHeader && !oTimelineItem._isGroupCollapsed()) {
			eItem.addStyle("display", "none");
		}

		if (oTimelineItem._groupID) {
			eItem.setAttribute("groupid", oTimelineItem._groupID);
		}

		if (bIsGroupHeader) {
			sBarClass = "sapSuiteUiCommonsTimelineItemGroupHeaderBar";
			eItem.setAttribute("nodeType", "GroupHeaderBar");
		} else if (oTimeline.getEnableDoubleSided()) {
			// double sided has its own bar classes for non groups
			// if next item is group item we want different width then when it is not.
			if ((!bIsNextGroup || bIsEven) && !bIsLast) {
				sItemClass = bIsEven ? "sapSuiteUiCommonsTimelineItemHOdd" : "sapSuiteUiCommonsTimelineItemHEven";
			}
		}

		if ((!bIsGroupHeader && bLastItem) ||
			(bIsGroupHeader && bLastGroup)) {
			eItem.addClass("sapSuiteUiCommonsTimelineLastItem");
		}

		eItem.addClass(encodeXML(sItemClass));
		eBarWrapper.addClass("sapSuiteUiCommonsTimelineItemBarWrapper");

		eBar.addClass("sapSuiteUiCommonsTimelineItemBarH");
		eBar.addClass(encodeXML(sBarClass));

		eItemChild.addStyle("display", "flex");
		eItemChild.addStyle("height", "100%");

		if (oTimeline.getShowIcons() || bIsGroupHeader) {
			eItemChild.addChild(eIconWrapper);
			if (!bIsGroupHeader) {
				if (sStatusClass) {
					eIconWrapper.addClass(encodeXML(sStatusClass));
				} else {
					eIconWrapper.addClass("sapSuiteUiCommonsTimelineNoStatus");
				}

				eIconWrapper.addClass("sapSuiteUiCommonsTimelineItemIconWrapper");
			} else {
				eIconWrapper.addClass("sapSuiteUiCommonsTimelineItemGroupBarIconWrapper");
			}
			eIconWrapper.addChild(oTimelineItem._getLineIcon());
		} else {
			eDivNoIconWrapper.addChild(eDivNoIcon);
			eDivNoIconWrapper.addClass("sapSuiteUiCommonsTimelineItemNoIconWrapper");
			eDivNoIcon.addClass("sapSuiteUiCommonsTimelineItemNoIcon");

			if (sStatusClass) {
				eDivNoIcon.addClass(encodeXML(sStatusClass));
			} else {
				eDivNoIcon.addClass("sapSuiteUiCommonsTimelineNoStatus");
			}

			eItemChild.addClass("sapSuiteUiCommonsTimelineItemWrapper");
			eItemChild.addChild(eDivNoIconWrapper);
		}
		eItemChild.addChild(eBarWrapper);
		eBarWrapper.addChild(eBar);


		if (oTimeline._collapsedGroups[oTimelineItem._groupID]) {
			if (bIsGroupHeader) {
				eItem.addClass("sapSuiteUiCommonsTimelineItemGroupCollapsedBar");
			} else {
				eItem.addStyle("display", "none");
			}
		}

		eItem.addChild(eItemChild);

		return eItem;
	};

	/**
	 * Returns a vertical timeline element representation.
	 * @param {sap.suite.ui.commons.Timeline} oTimeline The Timeline control
	 * @returns {sap.suite.ui.commons.util.HtmlElement} returns Timeline element for vertical orientation
	 * @private
	 */
	TimelineRenderer._getVerticalTimelineElement = function (oTimeline) {
		var eControl = new HtmlElement("div"),
			eTopScroller = new HtmlElement("div"),
			eBottomScroller = new HtmlElement("div"),
			eContent = new HtmlElement("div"),
			eScroll = new HtmlElement("div"),
			eContentWrapper = new HtmlElement("div"),
			eShowMoreWrapper = new HtmlElement("div"),
			eBefore = new HtmlElement("div"),
			eAfter = new HtmlElement("div"),
			eUl, oItem, oNext, bIsGroupHeader, oNextPossibleGroup, bLastGroup,
			fnCreateUL = function () {
				var eUl = new HtmlElement("ul");
				eUl.addClass("sapSuiteUiCommonsTimelineItemUlWrapper");
				eUl.setAttribute("role", "listbox");
				eUl.setAttribute("aria-labelledby", oTimeline.getAriaLabelledBy().join(" "), true);
				return eUl;
			};

		eControl.addControlData(oTimeline);
		eControl.addClass("sapSuiteUiCommonsTimeline");
		this._addAccessibilityTags(eControl, oTimeline);

		eContentWrapper.addClass("sapSuiteUiCommonsTimelineContentWrapper");

		if (oTimeline._isGrouped()) {
			eControl.addClass("sapSuiteUiCommonsTimelineGrouped");
		}

		if (oTimeline._scrollingFadeout()) {
			eContentWrapper.addChild(eTopScroller);
			eContentWrapper.addChild(eBottomScroller);

			eTopScroller.addClass("sapSuiteUiCommonsTimelineTopScroller sapSuiteUiCommonsTimelineVerticalScroller");
			eBottomScroller.addClass("sapSuiteUiCommonsTimelineBottomScroller sapSuiteUiCommonsTimelineVerticalScroller");

			if (oTimeline.getScrollingFadeout() === ScrollingFadeout.AreaWithButtons) {
				eTopScroller.addChild(this._getScrollerIcon(oTimeline, "_scollerIconTop", "Top"));
				eBottomScroller.addChild(this._getScrollerIcon(oTimeline, "_scrollerIconBottom", "Bottom"));
			}
		}

		this._setWidthAndHeight(oTimeline, eControl);

		eControl.addChild(oTimeline._objects.getHeaderBar());
		oTimeline._setMessageBars(eControl);

		if ((oTimeline.getMessageStrip() !== null) && (oTimeline.getMessageStrip() !== undefined) && oTimeline.getMessageStrip().getText() !== "") {
			eControl.addChild(oTimeline._objects.getMessageStrip());
		}

		eBefore.setId(oTimeline.getId() + "-content-before");
		eBefore.setAttribute("tabindex", 0);
		eControl.addChild(eBefore);

		eControl.addChild(eContentWrapper);
		eContentWrapper.addChild(eContent);
		eContent.setId(oTimeline.getId() + "-content");
		eContent.setAttribute("data-sap-ui-fastnavgroup", "true");
		eContent.addClass("sapSuiteUiCommonsTimelineContents");
		eContent.addClass("sapSuiteUiCommonsTimelineScrollV");
		eContent.addClass("sapSuiteUiCommonsTimelineScroll");

		eAfter.setId(oTimeline.getId() + "-content-after");
		eAfter.setAttribute("tabindex", 0);
		eControl.addChild(eAfter);

		eContent.addChild(eScroll);
		eScroll.setId(oTimeline.getId() + "-scroll");
		eScroll.addClass("sapSuiteUiCommonsTimelineScroll");
		eUl = fnCreateUL();

		var oContent = oTimeline._outputItem,
			bIsMaxed = oTimeline._isMaxed();

		if (oContent.length > 0) {
			eScroll.addChild(eUl);
			for (var i = 0; i < oContent.length; i++) {
				bLastGroup = bIsMaxed;

				oItem = oContent[i];
				oNext = oContent[i + 1];
				bIsGroupHeader = oItem._isGroupHeader;

				oItem._orientation = "V";
				oItem._position = oTimeline.getAlignment();
				oItem._additionalBarClass = "";
				oItem._index = i;
				oItem._isLast = bIsMaxed && oContent.length - 1 === i;

				if (bIsGroupHeader) {
					eUl.setAttribute("groupId", oItem._groupID);
				}

				// for items or group items we need to know whether next item is collapsed group
				// in such case we need to put special class to line, because it will be longer
				if (bIsGroupHeader) {
					// for collapsed group we want to find out whether the right next group is expanded
					// in such case we enlarge this group bar (by class)
					for (var k = i + 1; k < oContent.length; k++) {
						oNextPossibleGroup = oContent[k];
						if (oNextPossibleGroup._isGroupHeader) {
							if (!oNextPossibleGroup._isGroupCollapsed() && oItem._isGroupCollapsed()) {
								oItem._additionalBarClass = "sapSuiteUiCommonsTimelineGroupNextExpanded";
							}
							bLastGroup = false;
							break;
						}
					}
				}
				oItem._isLastGroup = bLastGroup;

				// fix for default items -> if next item is expanded group enlarge line
				if (oNext && oNext._isGroupHeader && !oNext._isGroupCollapsed()) {
					oItem._additionalBarClass = "sapSuiteUiCommonsTimelineGroupNextExpanded";
				}

				if (bIsGroupHeader && (i != 0)) {
					eUl = fnCreateUL();
					eScroll.addChild(eUl);
				}

				if (bIsGroupHeader) {
					eUl.setAttribute("role", "tree");
				}

				eUl.addChild(oItem);
			}
		} else {
			eScroll.addChild(this._getEmptyTimelineElement(oTimeline));
		}

		if (oTimeline._showMore) {
			eShowMoreWrapper.addClass("sapSuiteUiCommonsTimelineShowMoreWrapper");
			eShowMoreWrapper.addChild(this._getShowMoreElement(oTimeline));

			eScroll.addChild(eShowMoreWrapper);
		}

		return eControl;
	};

	/**
	 * Builds a model for no data content.
	 * @param {sap.suite.ui.commons.Timeline} oTimeline The Timeline control
	 * @returns {sap.suite.ui.commons.util.HtmlElement} An empty timeline element
	 * @private
	 */
	TimelineRenderer._getEmptyTimelineElement = function (oTimeline) {
		var eWrapper = new HtmlElement("div"),
			eText = new HtmlElement("span");

		eWrapper.addClass("sapSuiteUiCommonsTimelineNoTextWrapper");
		eWrapper.addChild(eText);
		eText.addChildEscaped(oTimeline.getNoDataText());

		return eWrapper;
	};

	/**
	 * Creates wrapper for show more element
	 * @param {sap.suite.ui.commons.Timeline} oTimeline The Timeline control
	 * @returns {sap.suite.ui.commons.util.HtmlElement} A wrapper with a "show more" button element
	 * @private
	 */
	TimelineRenderer._getShowMoreElement = function (oTimeline) {
		var eShowMore = oTimeline._isVertical() ? new HtmlElement("div") : new HtmlElement("li"),
			sClassName = "sapSuiteUiCommonsTimelineItemGetMoreButtonV",
			sIconSrc = "sap-icon://drill-down";

		if (oTimeline.getAxisOrientation() === TimelineAxisOrientation.Horizontal) {
			sIconSrc = "sap-icon://process";
			sClassName = "sapSuiteUiCommonsTimelineItemGetMoreButtonH";
		}

		oTimeline._objects.register("moreButton", function () {
			// we skip id for purpose cause we want this control never keep focus when rendered
			// this causes wrong scrolling after loading more items
			var oMoreButton = new Button({
				icon: sIconSrc,
				tooltip: resourceBundle.getText("TIMELINE_MORE"),
				press: function () {
					oTimeline._loadMore();
				}
			});
			oMoreButton.addEventDelegate({
				onAfterRendering: function () {
					this.$().attr("tabindex", -1);
				}
			}, oMoreButton);

			return oMoreButton;
		});

		eShowMore.addClass("sapSuiteUiCommonsTimelineItemGetMoreButton");
		eShowMore.addClass(encodeXML(sClassName));

		eShowMore.addChild(oTimeline._objects.getMoreButton());

		return eShowMore;
	};

	/**
	 * Adds accessibility tags and elements for timeline.
	 * @param {sap.suite.ui.commons.util.HtmlElement} eControl The Timeline element being rendered.
	 * @param {sap.suite.ui.commons.Timeline} oTimeline The Timeline control
	 * @private
	 */
	TimelineRenderer._addAccessibilityTags = function (eControl, oTimeline) {
		var aLabelledByIds = [
			oTimeline._objects.getAccessibilityTitle().getId()
		];
		if (oTimeline._getFilterMessage()) {
			aLabelledByIds.push(oTimeline._objects.getFilterMessageText().getId());
		}
		eControl.setAttribute("role", "presentation");
		eControl.addChild(oTimeline._objects.getAccessibilityTitle());
		eControl.setAttribute("aria-labelledby", aLabelledByIds.join(" "), true);
		eControl.setAttribute("aria-live", "assertive");
	};

	return TimelineRenderer;
}, true);
