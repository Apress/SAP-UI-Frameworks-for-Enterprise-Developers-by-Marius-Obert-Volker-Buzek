/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"./SvgBase",
	"./Line",
	"./Node",
	"./Group",
	"sap/m/ResponsivePopover",
	"sap/m/Popover",
	"sap/m/List",
	"sap/m/OverflowToolbar",
	"sap/m/Button",
	"sap/m/CustomListItem",
	"sap/m/FlexBox",
	"sap/m/HBox",
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter",
	"sap/m/Panel",
	"sap/m/StandardListItem",
	"sap/m/Text",
	"sap/m/ToolbarSpacer",
	"sap/ui/core/Icon",
	"sap/m/FlexItemData",
	"sap/ui/core/library",
	"sap/m/library",
	'sap/ui/Device'
], function (jQuery, SvgBase, Line, Node, Group, ResponsivePopover, Popover, List, OverflowToolbar, Button,
			 CustomListItem, FlexBox, HBox, IconTabBar, IconTabFilter, Panel, StandardListItem, Text, ToolbarSpacer,
			 Icon, FlexItemData, CoreLibrary, MobileLibrary, Device) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = MobileLibrary.PlacementType;

	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

	/**
	 * Constructor for a new Tooltip.
	 *
	 * @class
	 * Holds information about a tooltip.
	 *
	 * @extends sap.suite.ui.commons.networkgraph.SvgBase
	 *
	 * @constructor
	 * @private
	 * @since 1.50
	 * @alias sap.suite.ui.commons.networkgraph.Tooltip
	 */
	var Tooltip = SvgBase.extend("sap.suite.ui.commons.networkgraph.Tooltip", {
		metadata: {
			library: "sap.suite.ui.commons",
			events: {
				/**
				 * Fired after tooltip windows is opened.
				 */
				afterOpen: {},
				afterClose: {}
			}
		}
	});

	Tooltip.prototype.init = function () {
		// popover control for displaying content
		this._oPopover = null;

		// element opening this tooltip (node, group, line)
		this._oElement = null;
	};

	/* =========================================================== */
	/* Public methods */
	/* =========================================================== */
	Tooltip.prototype.create = function (oParent) {
		var oPopover;
		this._oPopover = new ResponsivePopover(this.getId() + "-tooltip", {
			showHeader: false,
			placement: this.getParent()._bIsRtl ? PlacementType.PreferredLeftOrFlip : PlacementType.PreferredRightOrFlip,
			afterOpen: function () {
				this.fireAfterOpen();
			}.bind(this),
			afterClose: function () {
				this.fireAfterClose();
			}.bind(this),
			beforeOpen: function () {
				this._fnCreate();
			}.bind(this),
			contentWidth: "350px"
		}).addStyleClass("sapSuiteUiCommonsNetworkTooltip");

		this._oSimpleTooltip = new Popover({
			contentMinWidth: "350px",
			showHeader: false
		});

		this.addDependent(this._oPopover);

		// this fixes position of popover to top
		oPopover = this._oPopover.getAggregation("_popup");
		if (oPopover) {
			oPopover._afterAdjustPositionAndArrowHook = function () {
				var $arrow = this.$("arrow"),
					iTop = this.$().position().top,
					iArrowTop = $arrow.position().top,
					ARROW_POS = 15,
					iWindowHeight = jQuery(window).height(),
					iNewPos = iTop + iArrowTop - ARROW_POS;

				if (iWindowHeight > iNewPos + this.$().height()) {
					$arrow.css("top", ARROW_POS + "px");
					this.$().css("top", iNewPos + "px");
				}
			};
		}
	};

	Tooltip.prototype.instantClose = function () {
		var oPopover = this._oPopover.getAggregation("_popup");
		if (oPopover && oPopover.oPopup && oPopover.oPopup.close) {
			oPopover.oPopup.close(0);
		}

		if (this._oSimpleTooltip.oPopup && this._oSimpleTooltip.oPopup.close) {
			this._oSimpleTooltip.oPopup.close(0);
		}
	};

	Tooltip.prototype.close = function () {
		this._oPopover.close();
	};

	Tooltip.prototype.openDetail = function (mArguments) {
		var oOpener = mArguments.opener || this._getOpener(mArguments.item, mArguments.point);

		// for node without details we display only popover with title
		if (mArguments.item instanceof Node && !mArguments.item._hasDetailData()) {
			this._oSimpleTooltip.removeAllContent();
            var sFromNodeTitle = mArguments.item.getTitle();
			var sFromNodeText = sFromNodeTitle ? sFromNodeTitle : mArguments.item.getAltText();
			this._appendHeader(sFromNodeText, this._oSimpleTooltip);
			this._oSimpleTooltip.openBy(oOpener);
			return;
		}

		this._fnCreate = this._createDetail;
		this._oElement = mArguments.item;
		this._oPopover.openBy(oOpener);
	};

	Tooltip.prototype._createDetail = function () {
		var fnCreate = this._getTooltipCreateFunction(this._oElement);
		this._oPopover.removeAllContent();
		this._appendFooter();

		fnCreate(this._oElement);
	};

	Tooltip.prototype.openLink = function (mArguments) {
		this._oElement = mArguments.item;
		this._fnCreate = this._createLink;

		this._oPopover.openBy(mArguments.opener);
	};

	Tooltip.prototype._createLink = function (mArguments) {
		var oList = new List(),
			oDataItem = this._oElement;

		this._oPopover.removeAllContent();

		this._appendHeader(oResourceBundle.getText("NETWORK_GRAPH_TOOLTIP_EXTERNAL_LINKS"));
		oDataItem.getActionLinks().forEach(function (oItem) {
			oList.addItem(new CustomListItem({
				content: [
					new HBox({
						renderType: "Bare",
						items: oItem.clone(null, null, {
							cloneChildren: true,
							cloneBindings: false
						}).addStyleClass("sapUiTinyMargin")
					})
				]
			}));
		});
		this._oPopover.addContent(oList);
		this._appendFooter();
	};

	/* =========================================================== */
	/* Private methods */
	/* =========================================================== */
	Tooltip.prototype._getOpener = function (oItem, oPoint) {
		if (oItem instanceof Line && oPoint) {
			// this prevents recreating rectangle when there is already usable one
			// this prevents some nasty stuff when double clicking line (which basically triggers 2x click and there are some ugly timeouts in tooltip)
			if (this._oElement === oItem && this._tooltipRect) {
				var x = parseInt(this._tooltipRect.getAttribute("x"), 10),
					y = parseInt(this._tooltipRect.getAttribute("y"), 10),
					OFFSET = 10;

				if ((Math.abs(x - oPoint.x) < OFFSET) && (Math.abs(y - oPoint.y) < OFFSET)) {
					return this._tooltipRect;
				}
			}

			this._cleanUpLineTooltip();
			this._tooltipRect = this._createElement("rect", {
				x: oPoint.x,
				y: oPoint.y,
				width: Device.browser.firefox ? 0.01 : 0,
				height: Device.browser.firefox ? 0.01 : 0
			});
			this.getParent().$svg.append(this._tooltipRect);
			return this._tooltipRect;
		}

		return oItem;
	};

	Tooltip.prototype._getTooltipCreateFunction = function (oItem) {
		if (oItem instanceof Node) {
			return this._createNodeTooltip.bind(this);
		}

		if (oItem instanceof Line) {
			return this._createLineTooltip.bind(this);
		}

		if (oItem instanceof Group) {
			return this._createGroupTooltip.bind(this);
		}

		return null;
	};

	Tooltip.prototype._cleanUpLineTooltip = function () {
		if (this._tooltipRect) {
			jQuery(this._tooltipRect).remove();
		}
	};

	Tooltip.prototype._appendDescription = function (oItem, oWrapper) {
		if (oItem.getDescription()) {
			oWrapper = oWrapper || this._oPopover;
			oWrapper.addContent(new Panel({
				content: new Text({
					textAlign: "Initial",
					text: oItem.getDescription()
				}).addStyleClass("sapSuiteUiCommonsNetworkTooltipDescription")
			}).addStyleClass("sapSuiteUiCommonsNetworkTooltipArea"));
		}
	};

	Tooltip.prototype._appendAttributes = function (aAttributes, oWrapper) {
		var oList = new List(),
			oCheckedWrapper = oWrapper || this._oPopover;

		if (aAttributes.length > 0) {
			aAttributes.forEach(function (oItem) {
				oList.addItem(new CustomListItem({
					content: [
						new HBox({
							items: [
								new Text({
									layoutData: [
										new FlexItemData({
											baseSize: "50%"
										})
									],
									text: oItem.getLabel()
								}), new Text({
									layoutData: [
										new FlexItemData({
											baseSize: "50%"
										})
									],
									text: oItem.getValue(),
									width: "100%",
									textAlign: CoreLibrary.TextAlign.End
								})
							]
						}).addStyleClass("sapSuiteUiCommonsNetworkTooltipLine")
					]
				}));

				oCheckedWrapper.addContent(oList);
			});
		}
	};

	Tooltip.prototype._appendNodesList = function (oGroup, oWrapper) {
		var oList = new List();
		oGroup.aNodes.forEach(function (oNode) {
            var sNodeTitle = oNode.getTitle();
			var sFromNodeText = sNodeTitle ? sNodeTitle : oNode.getAltText();
			if (oNode.getTitle()) {
				oList.addItem(new StandardListItem({
					title: sFromNodeText,
					icon: oNode.getIcon()
				}));
			}
		});

		oWrapper.addContent(oList);
	};

	Tooltip.prototype._appendFooter = function () {
		var that = this;
		this.oCloseButton = new Button({
			text: oResourceBundle.getText("NETWORK_GRAPH_CLOSE"),
			press: function () {
				that._oPopover.close();
			}
		});

		this._oPopover.setEndButton(this.oCloseButton);
		this._oPopover.setInitialFocus(this.oCloseButton);
	};

	Tooltip.prototype._appendHeader = function (sTitle, oPopover) {
		oPopover = oPopover || this._oPopover;

		if (sTitle) {
			var oText = new Text({
				width: "100%",
				textAlign: CoreLibrary.TextAlign.Center,
				text: sTitle
			});
			oPopover.insertContent(new Panel({
				width: "100%",
				content: [oText]
			}).addStyleClass("sapSuiteUiCommonsNetworkTooltipArea"), 0);
			oPopover.addAriaLabelledBy(oText);
		}
	};

	Tooltip.prototype._createGroupTooltip = function (oGroup) {
		var fnHasDetails = function () {
			return oGroup.getAttributes().length > 0 || oGroup.getDescription();
		};

		var oDataTab, oNodesTab;

		this._appendHeader(oGroup.getTitle());
		if (fnHasDetails()) {
			oNodesTab = new IconTabFilter({
				text: oResourceBundle.getText("NETWORK_GRAPH_TOOLTIP_LIST_OF_NODES")
			});
			oDataTab = new IconTabFilter({
				text: oResourceBundle.getText("NETWORK_GRAPH_TOOLTIP_INFORMATION")
			});

			this._oPopover.addContent(new IconTabBar({
				items: [oDataTab, oNodesTab]
			}));

			this._oPopover.addStyleClass("sapSuiteUiCommonsNetworkGroupTooltipTabBar");

			this._appendDescription(oGroup, oDataTab);
			this._appendAttributes(oGroup.getAttributes(), oDataTab);

			this._appendNodesList(oGroup, oNodesTab);
		} else {
			this._appendNodesList(oGroup, this._oPopover);
		}
	};

	Tooltip.prototype._createNodeTooltip = function (oNode) {
		this._appendDescription(oNode);
		this._appendAttributes(oNode.getAttributes());
        var sNodeTitle = oNode.getTitle();
		var sFromNodeText = sNodeTitle ? sNodeTitle : oNode.getAltText();
		this._appendHeader(sFromNodeText);
	};

	Tooltip.prototype._createLineTooltip = function (oLine, oPoint) {
		var fnCreateFromTo = function () {
                var sFromNodeTitle = oLine.getFromNode().getTitle();
                var sToNodeTitle = oLine.getToNode().getTitle();
				var sItemFrom = new Text({
						width: "50%",
						text: sFromNodeTitle ? sFromNodeTitle : oLine.getFromNode().getAltText()
					}).addStyleClass("sapSuiteUiCommonsNetworkGraphNoPointerEvents sapSuiteUiCommonsNetworkLineTooltipLabel"),
					oIcon = new Icon({
						src: "sap-icon://arrow-right"
					}).addStyleClass("sapUiTinyMarginEnd sapSuiteUiCommonsNetworkGraphNoPointerEvents sapSuiteUiCommonsNetworkLineTooltipFromToIcon"),
					oIconLeft = new Icon({
						src: "sap-icon://arrow-left"
					}).addStyleClass("sapUiTinyMarginBegin sapSuiteUiCommonsNetworkGraphNoPointerEvents sapSuiteUiCommonsNetworkLineTooltipFromToIcon"),
					oItemTo = new Text({
						textAlign: CoreLibrary.TextAlign.End,
						width: "50%",
						text: sToNodeTitle ? sToNodeTitle : oLine.getToNode().getAltText()
					}).addStyleClass("sapSuiteUiCommonsNetworkGraphNoPointerEvents sapSuiteUiCommonsNetworkLineTooltipLabel"),
					oFromToContainer = new FlexBox({
						renderType: "Bare",
						width: "100%",
						justifyContent: "Center",
						items: [sItemFrom]
					}).addStyleClass("sapSuiteUiCommonsNetworkLineTooltipFromTo");

				oLine._isBothArrow() ? oFromToContainer.addItem(oIconLeft) : oIcon.addStyleClass("sapUiTinyMarginBegin");
				oFromToContainer.addItem(oIcon);
				oFromToContainer.addItem(oItemTo);

				return oFromToContainer;
			},
			fnCreateDetail = function () {
				var sTitle = oLine.getTitle();

				this._oPopover.addContent(fnCreateFromTo());
				if (sTitle) {
					this._appendHeader(sTitle);
				}
				this._appendDescription(oLine);
				this._appendAttributes(oLine.getAttributes());
			}.bind(this);

		fnCreateDetail(oLine);
	};

	return Tooltip;
});
