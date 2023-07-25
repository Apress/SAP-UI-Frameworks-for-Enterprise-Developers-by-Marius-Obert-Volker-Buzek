/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"./library",
	"sap/suite/ui/commons/util/HtmlElement",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/Icon",
	"sap/base/security/encodeXML",
	"sap/base/security/encodeCSS",
	'sap/ui/core/InvisibleText'
], function (library, HtmlElement, DateFormat, Icon, encodeXML, encodeCSS, InvisibleText) {
	"use strict";

	var TimelineAlignment = library.TimelineAlignment;

	/**
	 * Renderer for Timeline Item.
	 * @namespace
	 */
	var TimelineItemRenderer = {};
	TimelineItemRenderer.apiVersion = 2;

	var oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons"),
		MS_PER_DAY = 24 * 60 * 60 * 1000;

	/**
	 * Render Timeline item into given RenderManager.
	 * @param {sap.ui.core.RenderManager} oRm RenderManager
	 * @param {sap.suite.ui.commons.TimelineItem} oTimelineItem The item to be rendered
	 * @public
	 */
	TimelineItemRenderer.render = function (oRm, oTimelineItem) {
		this._getTimelineItemElement(oTimelineItem).getRenderer().render(oRm);
	};

	/**
	 * Return item's element
	 * @param {sap.suite.ui.commons.TimelineItem} oTimelineItem The item to be rendered
	 * @private
	 * @returns {sap.suite.ui.commons.util.HtmlElement} The new HtmlElement
	 */
	TimelineItemRenderer._getTimelineItemElement = function (oTimelineItem) {
		if (oTimelineItem._orientation === "V") {
			return this._getVerticalTimelineItemElement(oTimelineItem);
		} else {
			return this._getHorizontalTimelineItemElement(oTimelineItem);
		}
	};

	/**
	 * Format date time to string representation
	 * @param {sap.suite.ui.commons.TimelineItem} oTimelineItem The item to be rendered
	 * @param {object} [mArguments] Date time parser arguments
	 * @param {object} [mArguments.resBundle] Resource bunde
	 * @param {object} [mArguments.dateFormat] Date format
	 * @param {object} [mArguments.timeFormat] Time format
	 * @returns {string} date time string representation with appended text
	 * @private
	 */
	TimelineItemRenderer._getFormatedDateTime = function (oTimelineItem, mArguments) {
		mArguments = mArguments || {};

		var oResourceBundle = mArguments.resBundle || oResBundle,
			oDateFormat = mArguments.dateFormat || DateFormat.getDateInstance({style: "short"}),
			oTimeFormat = mArguments.timeFormat || DateFormat.getTimeInstance({style: "short"}),
			oDateTime = oTimelineItem.getDateTimeWithoutStringParse(),
			oActualDate, oToday, iDaysDiff, sConvertedDate;

		if (!(oDateTime instanceof Date) || (isNaN(oDateTime.getTime()))) {
			return oDateTime;
		}
		oActualDate = Date.UTC(oDateTime.getFullYear(), oDateTime.getMonth(), oDateTime.getDate());
		oToday = new Date();
		oToday = Date.UTC(oToday.getFullYear(), oToday.getMonth(), oToday.getDate());
		iDaysDiff = Math.floor((oToday - oActualDate) / MS_PER_DAY);

		switch (iDaysDiff) {
			case 0:
				sConvertedDate = oResourceBundle.getText("TIMELINE_TODAY");
				break;
			case 1:
				sConvertedDate = oResourceBundle.getText("TIMELINE_YESTERDAY");
				break;
			default:
				sConvertedDate = oDateFormat.format(oDateTime);
		}
		return sConvertedDate + " " + oResourceBundle.getText("TIMELINE_AT") + " " + oTimeFormat.format(oDateTime);
	};

	/**
	 * Return element for horizontal timeline item
	 * @param {sap.suite.ui.commons.TimelineItem} oTimelineItem The item to be rendered
	 * @returns {object} timeline item element
	 * @private
	 */
	TimelineItemRenderer._getHorizontalTimelineItemElement = function (oTimelineItem) {
		var bIsTopLine = (oTimelineItem._placementLine === "top"),
			sTimelineItemClass = bIsTopLine ? "sapSuiteUiCommonsTimelineItemHTop" : "sapSuiteUiCommonsTimelineItemHBottom",
			bIsGroupHeader = oTimelineItem.getText() === "GroupHeader",
			sGroupId = oTimelineItem._groupID,
			sAttribute, oTimeline;

		if (bIsGroupHeader) {
			return this._getGroupHeaderElement(oTimelineItem);
		}

		// controls
		var eTimelineItem = new HtmlElement("li"),
			eChild = new HtmlElement("div"),
			eSpacer = new HtmlElement("div"),
			eBubble = new HtmlElement("div"),
			eOutline = new HtmlElement("div"),
			eBox = new HtmlElement("div"),
			eArrow = new HtmlElement("div"),
			eItemSheel = this._getTimelineItemShell(oTimelineItem);

		if (sGroupId) {
			eTimelineItem.setAttribute("groupid", oTimelineItem._groupID);
		}

		if (oTimelineItem._isFirstGroupEvenItem) {
			eTimelineItem.setAttribute("firstgroupevenitem", oTimelineItem._isFirstGroupEvenItem);
		}

		eTimelineItem.addControlData(oTimelineItem);
		eTimelineItem.addClass("sapSuiteUiCommonsTimelineItemLiWrapperV");

		eTimelineItem.addClass(encodeXML(sTimelineItemClass));

		eChild.addClass("sapSuiteUiCommonsTimelineItemWrapperH");
		eChild.addClass("sapSuiteUiCommonsTimelineItemBaseLength");
		eTimelineItem.addChild(eChild);

		eSpacer.addClass("sapSuiteUiCommonsTimelineItemBubbleSpacer");
		eChild.addChild(eSpacer);

		eBubble.addClass("sapSuiteUiCommonsTimelineItemBubble");
		eSpacer.addChild(eBubble);

		eOutline.addClass("sapSuiteUiCommonsTimelineItemOutline");
		eOutline.setId(oTimelineItem.getId() + "-outline");
		eOutline.setAttribute("tabindex", "0");
		this._addAccessibilityTags(eOutline, oTimelineItem);

		eBox.addClass("sapSuiteUiCommonsTimelineItemBox");
		eOutline.addChild(eBox);

		eArrow.addClass("sapSuiteUiCommonsTimelineItemArrow");

		if (bIsTopLine) {
			eBubble.addChild(eOutline);
			eBubble.addChild(eArrow);
		} else {
			eBubble.addChild(eArrow);
			eBubble.addChild(eOutline);
		}

		// move left first even item when grouping is disabled (for grouping even items positions are calculated by JS)
		if (!oTimelineItem._callParentFn("_isGrouped") && oTimelineItem._callParentFn("getEnableDoubleSided") && oTimelineItem._index === 1) {
			oTimeline = oTimelineItem.getParent();
			sAttribute = "margin-left";

			if (oTimeline && oTimeline._bRtlMode) {
				sAttribute = "margin-right";
			}
			eTimelineItem.addStyle(encodeCSS(sAttribute), "100px");
		}

		eBox.addChild(eItemSheel);

		if (oTimelineItem._isGroupCollapsed()) {
			eTimelineItem.addStyle("display", "none");
		}

		return eTimelineItem;
	};

	/**
	 * Return group timeline item
	 * @param {sap.suite.ui.commons.TimelineItem} oTimelineItem The item to be rendered
	 * @returns {object} Group item
	 * @private
	 */
	TimelineItemRenderer._getGroupHeaderElement = function (oTimelineItem) {
		var eTimelineItem = new HtmlElement("li"),
			eDirectChild = new HtmlElement("div"),
			eChild = new HtmlElement("div"),
			eWrapper = new HtmlElement("div"),
			eBarWrapper = new HtmlElement("div"),

			eArrow = new HtmlElement("div"),
			eText = new HtmlElement("span"),
			eLine = new HtmlElement("div"),
			eExpanIconWrapper = new HtmlElement("div"),
			eLineWrapper = new HtmlElement("div"),
			eArrowParent = oTimelineItem._orientation === "V" ? eChild : eWrapper,
			eIconBarWrapper = new HtmlElement("div"),
			eGroupIconWrapper = new HtmlElement("div"),
			eBar = new HtmlElement("div");

		var bIsCollapsed = oTimelineItem._isGroupCollapsed(),
			bShowIcons = oTimelineItem._callParentFn("getShowIcons"),
			sIcon;

		if (oTimelineItem._groupID) {
			eTimelineItem.setAttribute("groupid", oTimelineItem._groupID);
		}

		if (oTimelineItem._isLastGroup) {
			eTimelineItem.addClass("sapSuiteUiCommonsTimelineLastItem");
		}

		eTimelineItem.addControlData(oTimelineItem);
		eTimelineItem.addClass("sapSuiteUiCommonsTimelineGroupHeader");
		eTimelineItem.addChild(eDirectChild);
		eDirectChild.addChild(eChild);
		eDirectChild.addClass("sapSuiteUiCommonsTimelineGroupHeaderDirectChild");
		eChild.addClass("sapSuiteUiCommonsTimelineGroupHeaderMainWrapper");
		eChild.setId(oTimelineItem.getId() + "-outline");
		eChild.setAttribute("tabindex", "0");
		this._addAccessibilityTags(eChild, oTimelineItem, true);
		eChild.setAttribute("data-sap-ui-fastnavgroup", true);

		eChild.addChild(eWrapper);
		eTimelineItem.addChild(eLineWrapper);

		eTimelineItem.setAttribute("nodetype", "GroupHeader");

		eBarWrapper.addClass("sapSuiteUiCommonsTimelineGroupHeaderSpanWrapper");

		if (oTimelineItem._orientation === "V") {
			eTimelineItem.addClass(oTimelineItem._position === TimelineAlignment.Left ? "sapSuiteUiCommonsTimelineItemWrapperVLeft" : "sapSuiteUiCommonsTimelineItemWrapperVRight");
			eTimelineItem.setAttribute("role", "treeitem");
			eTimelineItem.setAttribute("aria-expanded", bIsCollapsed ? false : true);
			eTimelineItem.setAttribute("aria-level", 1);
		} else {
			eTimelineItem.setAttribute("role", "presentation");
		}

		eWrapper.addClass("sapSuiteUiCommonsTimelineGroupHeaderWrapper");
		eWrapper.addClass("sapSuiteUiCommonsTimelineGroupHeaderPointer");

		eArrowParent.addChild(eArrow);

		eWrapper.addChild(eExpanIconWrapper);
		eWrapper.addChild(eBarWrapper);

		eTimelineItem.addClass(bIsCollapsed ? "sapSuiteUiCommonsTimelineGroupCollapsed" : "sapSuiteUiCommonsTimelineGroupExpanded");

		eExpanIconWrapper.addClass("sapSuiteUiCommonsTimelineGroupHeaderIconWrapper");
		sIcon = oTimelineItem._getCorrectGroupIcon();

		// press is handled by click to whole item
		oTimelineItem._objects.register("groupCollapseIcon", function () {
			var oIcon = new Icon(oTimelineItem.getId() + "-groupCollapseIcon", {
				src: sIcon,
				decorative: true
			});

			oIcon.addStyleClass("sapSuiteUiCommonsTimelineGroupHeaderPointer");
			oIcon.setParent(oTimelineItem);
			return oIcon;
		});

		eExpanIconWrapper.addChild(oTimelineItem._objects.getGroupCollapseIcon());

		eArrow.addClass("sapSuiteUiCommonsTimelineItemArrow");

		eLineWrapper.addClass("sapSuiteUiCommonsTimelineGroupHeaderLineWrapper");

		eLine.addClass("sapSuiteUiCommonsTimelineGroupHeaderLine");
		eLineWrapper.addChild(eLine);

		eBarWrapper.addChild(eText);
		eText.addClass("sapSuiteUiCommonsTimelineGroupHeaderSpan");
		eText.addChildEscaped(" " + oTimelineItem.getTitle());

		if (oTimelineItem._orientation === "V") {
			eTimelineItem.addChild(eIconBarWrapper);
			eGroupIconWrapper.addChild(oTimelineItem._getLineIcon());
			eIconBarWrapper.addChild(eGroupIconWrapper);
			eGroupIconWrapper.addClass("sapSuiteUiCommonsTimelineItemBarIconWrapperV");
			eIconBarWrapper.addClass("sapSuiteUiCommonsTimelineGroupHeaderBarWrapper");

			if (!oTimelineItem._isGroupCollapsed()) {
				eIconBarWrapper.addStyle("display", "none");
			}

			eBar.addClass("sapSuiteUiCommonsTimelineItemBarV");
			if (!bShowIcons) {
				eBar.addClass("sapSuiteUiCommonsTimelineItemBarNoIcon");
			}

			eIconBarWrapper.addChild(eBar);

			if (oTimelineItem._additionalBarClass) {
				eBar.addClass(encodeXML(oTimelineItem._additionalBarClass));
			}
		}

		return eTimelineItem;
	};

	/**
	 * Creates vertical timeline item element
	 * @param {sap.suite.ui.commons.TimelineItem} oTimelineItem The item to be rendered
	 * @returns {object} A new TimelineItem HtmlElement for vertical orientation
	 * @private
	 */
	TimelineItemRenderer._getVerticalTimelineItemElement = function (oTimelineItem) {
		var eTimelineItem = new HtmlElement("li"),
			eChild = new HtmlElement("div"),
			eBarWrapper = new HtmlElement("div"),
			eBarIconWrapper = new HtmlElement("div"),
			eBubble = new HtmlElement("div"),
			eBar = new HtmlElement("div"),
			eBox = new HtmlElement("div"),
			eOutline = new HtmlElement("div"),
			eArrow = new HtmlElement("div"),
			eNoIcon = new HtmlElement("div"),
			eNoIconWrapper = new HtmlElement("div"),
			eItemSheel,
			eTimelineItemWrapper = new HtmlElement("ul");

		var bShowIcons = oTimelineItem._callParentFn("getShowIcons"),
			sGroupId = oTimelineItem._groupID,
			bIsGroupHeader = oTimelineItem.getText() === "GroupHeader",
			sStatusCltrClass = oTimelineItem._getStatusColorClass();

		if (bIsGroupHeader) {
			return this._getGroupHeaderElement(oTimelineItem);
		}

		if (sGroupId) {
			eTimelineItem.setAttribute("groupid", sGroupId);
			eTimelineItem.setAttribute("aria-level", 2);
		} else {
			eTimelineItem.setAttribute("role", "presentation");
		}
		eTimelineItem.addClass("sapSuiteUiCommonsTimelineItem");
		eTimelineItem.setAttribute("aria-labelledby", oTimelineItem.getAriaLabelledBy().join(" "), true);

		if (oTimelineItem._isLast) {
			eTimelineItem.addClass("sapSuiteUiCommonsTimelineLastItem");
		}

		// eTimelineItem.setAttribute("nodeType", "GroupItem");

		eChild.addClass(bIsGroupHeader ? "sapSuiteUiCommonsTimelineItemWrapperGrp" : "sapSuiteUiCommonsTimelineItemWrapperV");
		eTimelineItem.addChild(eChild);

		eChild.addClass(oTimelineItem._position === TimelineAlignment.Left ? "sapSuiteUiCommonsTimelineItemWrapperVLeft" : "sapSuiteUiCommonsTimelineItemWrapperVRight");
		eChild.addChild(eBubble);
		eChild.addChild(eBarWrapper);

		eBarWrapper.addClass("sapSuiteUiCommonsTimelineItemBarWrapperV");
		eBarIconWrapper.addClass("sapSuiteUiCommonsTimelineItemBarIconWrapperV");

		if (sStatusCltrClass) {
			eBarIconWrapper.addClass(encodeXML(sStatusCltrClass));
		} else {
			eBarIconWrapper.addClass("sapSuiteUiCommonsTimelineNoStatus");
		}

		if (bShowIcons) {
			eBarWrapper.addChild(eBarIconWrapper);
			eBarIconWrapper.addChild(oTimelineItem._getLineIcon('', sGroupId));
		} else {
			eNoIconWrapper.addChild(eNoIcon);
			eNoIconWrapper.addClass("sapSuiteUiCommonsTimelineItemNoIconWrapper");
			eNoIcon.addClass("sapSuiteUiCommonsTimelineItemNoIcon");
			eBarWrapper.addChild(eNoIconWrapper);
			if (sStatusCltrClass) {
				eNoIcon.addClass(encodeXML(sStatusCltrClass));
			}

			eBar.addClass("sapSuiteUiCommonsTimelineItemBarNoIcon");
		}

		eBar.addClass("sapSuiteUiCommonsTimelineItemBarV");
		eBarWrapper.addChild(eBar);

		if (oTimelineItem._additionalBarClass) {
			eBar.addClass(encodeXML(oTimelineItem._additionalBarClass));
		}

		eBubble.addClass("sapSuiteUiCommonsTimelineItemBubble");

		eArrow.addClass("sapSuiteUiCommonsTimelineItemArrow");
		eBubble.addChild(eArrow);

		eBubble.addChild(eOutline);
		eOutline.addClass("sapSuiteUiCommonsTimelineItemOutline");
		eOutline.setId(oTimelineItem.getId() + "-outline");
		eOutline.setAttribute("tabindex", "0");
		this._addAccessibilityTags(eOutline, oTimelineItem);

		eBox.addClass("sapSuiteUiCommonsTimelineItemBox");
		eOutline.addChild(eBox);

		eItemSheel = this._getTimelineItemShell(oTimelineItem);
		eBox.addChild(eItemSheel);

		if (oTimelineItem._isGroupCollapsed()) {
			eTimelineItemWrapper.addStyle("display", "none");
		}

		if (sGroupId) {
            eTimelineItemWrapper.addControlData(oTimelineItem);
            eTimelineItemWrapper.addClass("sapSuiteUiCommonsTimelineItemUlWrapper");
            eTimelineItemWrapper.addChild(eTimelineItem);
            return eTimelineItemWrapper;
        } else {
            eTimelineItem.addControlData(oTimelineItem);
        }

		return eTimelineItem;
	};

	/**
	 * Return shell for timeline item
	 * @param {sap.suite.ui.commons.TimelineItem} oTimelineItem The item to be rendered
	 * @returns {object} Shell eleement
	 * @private
	 */
	TimelineItemRenderer._getTimelineItemShell = function (oTimelineItem) {
		var eShellItem = new HtmlElement("div"),
			eHeaderWrapper = new HtmlElement("div"),
			eHeader = new HtmlElement("div"),
			eUserName = new HtmlElement("span"),
			oUserPicture, oUserNameLink,
			eShellHeader = new HtmlElement("span"),
			eDateTime = new HtmlElement("div"),
			eBody = new HtmlElement("div"),
			//shell
			eTextWrapper = new HtmlElement("div"),
			eRealText = new HtmlElement("span"),
			eShowMoreWrapper = new HtmlElement("div"),

			eThreeDots = new HtmlElement("span"),
			eButtons = new HtmlElement("div"),
			bIsExpendable;

		var oEmbeddedControl = oTimelineItem.getEmbeddedControl();

		eShellItem.setId(oTimelineItem.getId() + "-shell");
		eShellItem.addClass("sapSuiteUiCommonsTimelineItemShell");
		eShellItem.addChild(oTimelineItem._objects.getInfoBar());
		eShellItem.addChild(eHeaderWrapper);

		eHeaderWrapper.addClass("sapSuiteUiCommonsTimelineItemHeaderWrapper");

		oUserPicture = oTimelineItem._getUserPictureControl();
		if (oUserPicture) {
			oUserPicture.addStyleClass("sapSuiteUiCommonsTimelineItemUserPicture");
			eHeaderWrapper.addChild(oUserPicture);
		}

		eHeader.setId(oTimelineItem.getId() + "-header");
		eHeader.addClass("sapSuiteUiCommonsTimelineItemHeader");
		eHeader.addClass("sapSuiteUiCommonsTimelineItemTextLineClamp");

		eUserName.setId(oTimelineItem.getId() + "-username");
		eUserName.addClass("sapSuiteUiCommonsTimelineItemShellUser");
		eHeader.addChild(eUserName);
		oUserNameLink = oTimelineItem._getUserNameLinkControl();
		if (oUserNameLink) {
			eUserName.addChild(oUserNameLink);
		} else {
			eUserName.addChildEscaped(oTimelineItem.getUserName());
			eUserName.addClass("sapUiSelectable");
		}

		eHeaderWrapper.addChild(eHeader);

		eShellHeader.addClass("sapSuiteUiCommonsTimelineItemShellHdr");
		eShellHeader.addClass("sapUiSelectable");
		eShellHeader.addChildEscaped(" " + oTimelineItem.getTitle());
		eHeader.addChild(eShellHeader);

		eDateTime.addClass("sapSuiteUiCommonsTimelineItemShellDateTime");
		eDateTime.addClass("sapUiSelectable");
		eDateTime.addChildEscaped(this._getFormatedDateTime(oTimelineItem));
		eHeader.addChild(eDateTime);

		eBody.addClass("sapSuiteUiCommonsTimelineItemShellBody");
		eShellItem.addChild(eBody);

		if (oEmbeddedControl !== null) {
			eBody.addChild(oEmbeddedControl);
		} else if (oTimelineItem.getText()) {

			eTextWrapper.addChild(eRealText);
			eTextWrapper.addClass("sapSuiteUiCommonsTimelineItemTextWrapper");
			eRealText.setId(oTimelineItem.getId() + "-realtext");
			eRealText.addClass("sapUiSelectable");
			eBody.addChild(eTextWrapper);

			bIsExpendable = oTimelineItem._checkTextIsExpandable();

			// either limit text by max chars allowed for item
			// or let the max height be calculated by JS (if text height)
			if (bIsExpendable) {
				eThreeDots.setId(oTimelineItem.getId() + "-threeDots");
				eThreeDots.addClass("sapMFeedListItemTextString");
				eThreeDots.addChildEscaped(" ");
				eTextWrapper.addChild(eThreeDots);
				eRealText.addChildEscaped(oTimelineItem._getCollapsedText(), true);
				eThreeDots.addChildEscaped("... ");
				eTextWrapper.setAttribute("expandable", true);
			} else {
				eRealText.addChildEscaped(oTimelineItem.getText(), true);
				eShowMoreWrapper.addStyle("display", "none");
			}

			eBody.addChild(eShowMoreWrapper);
			eShowMoreWrapper.addClass("sapSuiteUiCommonsTimelineItemShowMore");
			eShowMoreWrapper.addChild(oTimelineItem._getButtonExpandCollapse());
		}

		if (oTimelineItem.getParent() && oTimelineItem.getParent()._aFilterList && (oTimelineItem._callParentFn("getEnableSocial") || oTimelineItem.getCustomAction().length > 0)) {
			eButtons.addClass("sapSuiteUiCommonsTimelineItemShellBottom");
			eButtons.addChild(oTimelineItem._objects.getSocialBar());
			eShellItem.addChild(eButtons);
		}

		return eShellItem;
	};

	/**
	 * Adds accessibility tags and elements for TimelineItem.
	 * @param {sap.suite.ui.commons.util.HtmlElement} eTimelineItem HTMLElement representing TimelineItem.
	 * @param {sap.suite.ui.commons.TimelineItem} oTimelineItem The item to be rendered
	 * @param {boolean} bIsGroupHeader Whether or not the item is a group header
	 * @private
	 */
	TimelineItemRenderer._addAccessibilityTags = function (eTimelineItem, oTimelineItem, bIsGroupHeader) {
		var sGroupHeader;
		eTimelineItem.setAttribute("role", "option");
		if (oTimelineItem.getStatus()) {
			var oInvisibleStatusLabel = new InvisibleText();
			oInvisibleStatusLabel.setText("status " + oTimelineItem.getStatus());
			oInvisibleStatusLabel.toStatic(); //Be aware that without a call the screen reader does not read the content.
			eTimelineItem.setAttribute("aria-describedby", oInvisibleStatusLabel.getId(), true);
		}
		if (typeof oTimelineItem._index === "number") {
			eTimelineItem.setAttribute("aria-posinset", oTimelineItem._index + 1);
			eTimelineItem.setAttribute("aria-setsize", oTimelineItem._callParentFn("_getItemsCount"));
		}
		eTimelineItem.setAttribute("aria-live", "polite");
		if (bIsGroupHeader) {
			eTimelineItem.setAttribute("aria-expanded", !oTimelineItem._isGroupCollapsed());
			if (!oTimelineItem._isGroupCollapsed()) {
				sGroupHeader = oResBundle.getText("TIMELINE_ACCESSIBILITY_GROUP_HEADER") + ": " + oTimelineItem.getTitle() + " " + oResBundle.getText("TIMELINE_ACCESSIBILITY_GROUP_EXPAND");
			} else {
				sGroupHeader = oResBundle.getText("TIMELINE_ACCESSIBILITY_GROUP_HEADER") + ": " + oTimelineItem.getTitle() + " " + oResBundle.getText("TIMELINE_ACCESSIBILITY_GROUP_COLLAPSE");
			}
			eTimelineItem.setAttribute("aria-label", sGroupHeader, false);
		}
	};

	return TimelineItemRenderer;
}, true);
