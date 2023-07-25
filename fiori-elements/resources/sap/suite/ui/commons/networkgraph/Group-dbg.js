/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/suite/ui/commons/library",
	"sap/ui/thirdparty/jquery",
	"./ElementBase",
	"sap/ui/core/IconPool",
	"sap/m/CheckBox"
], function (library, jQuery, ElementBase, IconPool, CheckBox) {
	"use strict";

	var ElementStatus = library.networkgraph.ElementStatus,
		HeaderCheckboxState = library.networkgraph.HeaderCheckboxState;

	var Size = {
		COLLAPSED_HEIGHT: 32,
		COLLAPSED_WIDTH: 160,
		ROUNDING: 6,
		ICON_OFFSET: 8,
		ICON_SIZE: 15,
		HEADER_SIZE: 32
	};

	var EXPAND_ICON = "expand-all",
		COLLAPSE_ICON = "collapse-all",
		MENU_ICON = "horizontal-grip";

	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

	/**
	 * Constructor for a new Group. Grouping is not supported for custom layouting.
	 *
	 * @class
	 * Holds details about a group.
	 *
	 * @extends sap.suite.ui.commons.networkgraph.ElementBase
	 *
	 * @constructor
	 * @public
	 * @since 1.50
	 * @alias sap.suite.ui.commons.networkgraph.Group
	 */
	var Group = ElementBase.extend("sap.suite.ui.commons.networkgraph.Group", {
		metadata: {
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * Defines if the Header checkbox should be displayed and whether it should be selected or not. By default, the checkbox is hidden.
				 */
				headerCheckBoxState: {
					type: "sap.suite.ui.commons.networkgraph.HeaderCheckboxState",
					group: "Misc",
					defaultValue: HeaderCheckboxState.Hidden
				},
				/**
				 * The key of the group. This key is used to assign nodes to groups.
				 */
				key: {
					type: "string", group: "Misc", defaultValue: null
				},
				/**
				 * Defines whether the group is collapsed. By default, it is expanded.
				 */
				collapsed: {
					type: "boolean", group: "Misc", defaultValue: false
				},
				/**
				 * An icon associated with the group.
				 */
				icon: {
					type: "string", group: "Appearance", defaultValue: null
				},
				/**
				 * Minimal width of the group (swim lane) for the <code>SwimLanes</code> type of {@link sap.suite.ui.commons.networkgraph.LayoutRenderType}.<br>
				 * If not specified, the width of the group (swim lane) is defined automatically, based on the width of the nodes included in the swim lane.<br>
				 * If the width specified in this property is too small to fit the nodes included in this group (swim lane), the width is increased accordingly.
				 */
				minWidth: {
					type: "float", defaultValue: undefined
				},
				/**
				 * Key of the parent group. Can be used only with the <code>TwoColumns</code> layout.
				 */
				parentGroupKey: {
					type: "string", group: "Misc", defaultValue: null
				}
			},
			events: {
				/**
				 * This event is fired when the user selects or clears the Header checkbox.
				 */
				headerCheckBoxPress: {
					parameters: {
						/**
						 * Indicates whether checkbox is selected.
						 */
						checked: "boolean"
					}
				},
				/**
				 * This event is fired when the user clicks or taps the collapse/expand button.
				 */
				collapseExpand: {},

				/**
				 * This event is fired when the user clicks or taps the group's details button.
				 */
				showDetail: {}
			},
			aggregations: {
				/**
				 * Internal aggregation for the Header checkbox.
				 */
				_checkBox: {
					type: "sap.m.CheckBox", multiple: false, visibility: "hidden"
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRM, oControl) {
			// NOTE: this render is considered to be called only for single item invalidation
			// whole graph has different render path
			oControl._render({
				renderManager: oRM
			});
		}},
		onAfterRendering: function () {
			this._afterRenderingBase();
		}
	});

	// sum of properties that if changed requires data reprocessing
	Group.prototype.aProcessRequiredProperties = ["key", "parentGroupKey"];

	Group.BUTTONS = {
		MENU: "menu",
		COLLAPSE: "collapse"
	};

	/* =========================================================== */
	/* Events & pseudo events */
	/* =========================================================== */
	Group.prototype.init = function () {
		this._iWidth = Size.COLLAPSED_WIDTH;
		this._iHeight = Size.COLLAPSED_HEIGHT;

		// group action buttons
		this._oActionButtons = {};

		this._clearChildren();

		this._bIsHidden = false;
	};

	Group.prototype._afterRendering = function () {
		this._setupEvents();

		if (!this._isVisible()) {
			this.$().hide();
		}
		if (this.$().find(".sapSuiteUiCommonsNetworkGraphHeaderCheckboxInner").length !== 0) {
			this.$().find(".sapSuiteUiCommonsNetworkGraphHeaderCheckboxInner").attr('aria-label', this.getTitle());
		}
		this._removeFromInvalidatedControls();
	};

	/* =========================================================== */
	/* Rendering */
	/* =========================================================== */
	Group.prototype._renderTopGroup = function (mOptions) {
		var sId = this._getElementId(mOptions.idSufix),
			bIsLeft = this._iTopGroupIndex === 0,
			oRm = mOptions.renderManager;

		var sIcon = this.getIcon(),
			sTitle = this.getTitle();

		var iX = this._iTopGroupIndex * 50;

		if (this.getParent()._bIsRtl) {
			bIsLeft = !bIsLeft;
			iX = bIsLeft ? 0 : 50;
		}

		if (bIsLeft) {
			oRm.openStart("div").class("sapSuiteUiCommonsNetworkTopGroupDelimiter").openEnd().close("div");
		}

		this._renderHtmlElement("div", {
			top: 0,
			left: iX + "%",
			width: "50%",
			height: "32px"
		}, {
			id: sId,
			"data-sap-ui": sId,
			"class": "sapSuiteUiCommonsNetworkTopGroup " + (!bIsLeft ? "sapSuiteUiCommonsNetworkTopGroupRight" : "")
		}, oRm);

		oRm.openStart("div").class("sapSuiteUiCommonsNetworkTopGroupHeader").openEnd();
		if (sIcon) {
			this._renderHtmlIcon(sIcon, null, null, null, null, oRm);
		}

		if (sTitle) {
			oRm.openStart("div").class("sapSuiteUiCommonsNetworkGroupHeaderTitle").attr("title", sTitle).openEnd().text(sTitle).close("div");
		}

		oRm.close("div");
		oRm.close("div");
	};

	Group.prototype._render = function (mOptions) {
		var oParent = this.getParent(),
			iHeight = !this.getCollapsed() || this._isCollapsedSwimLane() ? this._iHeight : Size.HEADER_SIZE,
			sId;

		mOptions = mOptions || {};

		if (this._iNestedLevel === 0 && oParent._isTwoColumnsLayout()) {
			this._renderTopGroup(mOptions);
			return "";
		}

		if (this._isIgnored() || !this.getVisible()) {
			return "";
		}

		if (this.getParent()._isLayered()) {
			sId = this._getElementId(mOptions.idSufix);

			var sStyle = this._convertToStyle({
				top: this.getY() + "px",
				left: this.getX() + "px",
				width: this._iWidth + "px",
				height: iHeight + "px"
			}, this._getStatusStyle({
				"border-color": ElementBase.ColorType.Border,
				"border-width": ElementBase.ColorType.BorderWidth,
				"border-style": ElementBase.ColorType.BorderStyle
			}), true);

			this._renderHtmlElement("div", {}, {
				id: sId,
				"data-sap-ui": sId,
				"class": this._getGroupClass(),
				"style": sStyle
			}, mOptions.renderManager);

			this._renderHeader(mOptions);
			mOptions.renderManager.close("div");
		}
	};

	Group.prototype._renderHeader = function (mOptions) {
		var sIcon = this.getIcon(),
			sTitle = this.getTitle();

		var sColorStyle = "",
			sBackgroundStyle = "",
			sContentStyle = "",
			sContentStyleVal = "";

		if (this.getStatus() && this.getStatus() !== ElementStatus.Standard) {
			sContentStyle = this._getStatusStyle({
				"color": ElementBase.ColorType.Content
			}, true);
			sContentStyleVal = this._getStatusStyle({
				"color": ElementBase.ColorType.Content
			}, false);

			if (this._bIsSwimLane) {
				sColorStyle = this._getStatusStyle({
					"background-color": ElementBase.ColorType.Background
				}, false);
			} else {
				sBackgroundStyle = this._getStatusStyle({
					"background-color": ElementBase.ColorType.Background,
					"border-color": ElementBase.ColorType.Background
				}, false);
			}
		}
		mOptions.renderManager.openStart("div");
		this.applyStyles(mOptions.renderManager, this.getStyleObject(sBackgroundStyle));
		mOptions.renderManager.class("sapSuiteUiCommonsNetworkGroupHeader").openEnd();

		if (this._bIsSwimLane && (sColorStyle || this._hasDefaultStatus())) {
			mOptions.renderManager.openStart("div").class("sapSuiteUiCommonsNetworkGroupHeaderStatus").openEnd();
			this.applyStyles(mOptions.renderManager, this.getStyleObject(sColorStyle));
			mOptions.renderManager.close("div");
		}

		mOptions.renderManager.openStart("div").class("sapSuiteUiCommonsNetworkGroupHeaderInner").class("sapSuiteUiCommonsNetworkGroupHeaderInnerText").openEnd();

		if (this._showHeaderCheckBox()) {
			this._renderClonedControl(mOptions, this._getHeaderCheckbox());
		}

		if (sIcon) {
			this._renderHtmlIcon(sIcon, "sapSuiteUiCommonsNetworkGroupHeaderIcon", null, sContentStyle, null, mOptions.renderManager);
		}

		if (sTitle) {
			mOptions.renderManager.openStart("div").class("sapSuiteUiCommonsNetworkGroupHeaderTitle").attr("title", sTitle);
			//Add text-Orientation based on Language
			var sCurrentLanguage = sap.ui.getCore().getConfiguration().getLanguage();
			var aOrientationLanguage = ["ja", "zh_TW", "zh_CN", "ko"]; // Orientation Languages
			if (this._isVerticalSwimLane()
					&& (aOrientationLanguage.indexOf(sCurrentLanguage) > -1)) {
							sContentStyleVal = sContentStyleVal.length > 0
													? sContentStyleVal.concat(";text-orientation:sideways")
													: sContentStyleVal.concat("text-orientation:sideways");
			}
			this.applyStyles(mOptions.renderManager, this.getStyleObject(sContentStyleVal));
			mOptions.renderManager.openEnd();
			mOptions.renderManager.text(sTitle);
			mOptions.renderManager.close("div");
		}
		mOptions.renderManager.close("div");

		// icons
		mOptions.renderManager.openStart("div").class("sapSuiteUiCommonsNetworkGroupHeaderInner").class("sapSuiteUiCommonsNetworkGroupHeaderInnerIcons").openEnd();
		this._renderHtmlIcon(this.getCollapsed() ? EXPAND_ICON : COLLAPSE_ICON, "sapSuiteUiCommonsNetworkGroupHeaderMenuIcon", "collapse",
			sContentStyle, oResourceBundle.getText("NETWORK_GRAPH_EXPAND_COLLAPSE"), mOptions.renderManager);
		this._renderHtmlIcon(MENU_ICON, "sapSuiteUiCommonsNetworkGroupHeaderMenuIcon", "menu",
			sContentStyle, oResourceBundle.getText("NETWORK_GRAPH_GROUP_DETAILS"), mOptions.renderManager);
		mOptions.renderManager.close("div");

		mOptions.renderManager.close("div");
	};

	Group.prototype._getGroupClass = function () {
		return "sapSuiteUiCommonsNetworkGroup " + this._getStatusClass() +
			(this.getCollapsed() ? "sapSuiteUiCommonsNetworkGroupCollapsed" : "sapSuiteUiCommonsNetworkGroupExpanded") +
			(this._bIsSwimLane ? " sapSuiteUiCommonsNetworkGroupSwimLane" : " sapSuiteUiCommonsNetworkGroupClassic") +
			(this._isVerticalSwimLane() ? " sapSuiteUiCommonsNetworkGroupVerticalSwimLane" : "") +
			(this._isTopBottom() ? " sapSuiteUiCommonsNetworkGroupTopBottom " : "");
	};

	/* =========================================================== */
	/* Public methods */
	/* =========================================================== */
	/**
	 * @returns {Array} Returns all child nodes of the group.
	 * @public
	 */
	Group.prototype.getChildNodes = function () {
		this._checkForProcessData();
		return this.aChildren;
	};

	/**
	 * @returns {Array} Returns all lines connected to the group's child nodes.
	 * @public
	 */
	Group.prototype.getChildLines = function () {
		this._checkForProcessData();
		return this.aLines;
	};

	/**
	 * @returns {Array} Returns all parent nodes of the group.
	 * @public
	 */
	Group.prototype.getParentNodes = function () {
		this._checkForProcessData();
		return this.aParents;
	};

	/**
	 * @returns {Array} Returns all lines connected to the parent nodes of the group.
	 * @public
	 */
	Group.prototype.getParentLines = function () {
		this._checkForProcessData();
		return this.aParentLines;
	};

	/**
	 * @returns {Array} Returns all nodes belonging to this group.
	 * @public
	 */
	Group.prototype.getNodes = function () {
		this._checkForProcessData();
		return this.aNodes;
	};

	Group.prototype.isHidden = function () {
		return this._bIsHidden;
	};

	/**
	 * Hides the group and the nodes included in it.
	 * @public
	 */
	Group.prototype.setHidden = function (bValue) {
		this.$()[bValue ? "hide" : "show"]();
		this._bIsHidden = bValue;
	};

	/* =========================================================== */
	/* Private methods */
	/* =========================================================== */
	/**
	 * Returns header checkbox object
	 *
	 * @public
	 */
	Group.prototype.getHeaderCheckbox = function () {
		return this._getHeaderCheckbox();
	};

	Group.prototype._getHeaderCheckbox = function () {
		var oCheckBox = this.getAggregation("_checkBox"),
			that = this;

		if (!oCheckBox) {
			oCheckBox = new CheckBox(this.getId() + "-checkbox", {
				select: function (oEvents) {
					var bSelected = oCheckBox.getSelected();

					that.fireHeaderCheckBoxPress({
						checked: bSelected
					});
				}
			}).addStyleClass("sapSuiteUiCommonsNetworkGraphHeaderCheckboxInner");
			this.setAggregation("_checkBox", oCheckBox, true);
		}

		return oCheckBox;
	};

	Group.prototype._isCollapsedSwimLane = function () {
		return this._bIsSwimLane && this.getCollapsed();
	};

	Group.prototype._clearChildren = function () {
		this.aNodes = [];
		this.aLines = [];
		this.aChildren = [];
		this.aParentLines = [];
		this.aParents = [];
		this.aChildGroups = [];
	};

	Group.prototype._hasVisibleNodes = function (oGroup) {
		var bVisibleNodes = this.aNodes.some(function (oNode) {
			return !oNode._bIsHidden;
		});

		if (!bVisibleNodes) {
			for (var i = 0; i < this.aChildGroups.length; i++) {
				if (this.aChildGroups[i]._hasVisibleNodes()) {
					return true;
				}
			}
		}

		return bVisibleNodes;
	};

	Group.prototype._hasNodes = function () {
		var bNodes = this.aNodes.some(function (oNode) {
			return oNode._useInLayout();
		});

		if (!bNodes) {
			bNodes = this.aChildGroups.some(function (oGroup) {
				return oGroup._hasNodes();
			});
		}

		return bNodes;
	};

	Group.prototype._hideShow = function (bCollapse) {
		this.$()[bCollapse ? "hide" : "show"]();
		this._bIsHidden = bCollapse;

		var oParentGroup = this._oParentGroup;
		while (oParentGroup) {
			var bHasVisibleNodes = oParentGroup._hasVisibleNodes();
			if ((bHasVisibleNodes && !bCollapse) || (!bHasVisibleNodes && bCollapse)) {
				oParentGroup._hideShow(bCollapse);
			} else {
				break;
			}

			oParentGroup = oParentGroup._oParentGroup;
		}
	};

	Group.prototype._setButtonFocus = function ($button, bFocus) {
		var sFnName = bFocus ? "addClass" : "removeClass";
		$button[sFnName]("sapSuiteUiCommonsNetworkElementFocus");
	};

	Group.prototype._setMenuButtonFocus = function (bFocus) {
		this._setButtonFocus(jQuery(this._oActionButtons.menu), bFocus);
	};

	Group.prototype._setCollapseButtonFocus = function (bFocus) {
		this._setButtonFocus(jQuery(this._oActionButtons.collapse), bFocus);
	};

	Group.prototype._setupEvents = function () {
		var $menu = this.$("menu"),
			$header = this.$("header"),
			$collapse = this.$("collapse"),
			$actionButtons = this.$().find(".sapSuiteUiCommonsNetworkGroupHeaderMenuIcon");

		this._oActionButtons.menu = $menu[0];
		this._oActionButtons.collapse = $collapse[0];

		$collapse.off("click");
		$menu.off("click");
		$header.off("click");

		$actionButtons.off("mouseover");
		$actionButtons.off("mouseout");

		$menu.on("click", function (oEvent) {

			var bExecuteDefault = this.fireEvent("showDetail", {}, true);
			if (bExecuteDefault) {
				this._openDetail();
			}

			if (this.getParent()) {
				this.getParent().setFocus({
					item: this,
					button: Group.BUTTONS.MENU
				});
			}

			this._setMenuButtonFocus(false);
		}.bind(this));

		$collapse.on("click", function (oEvent) {
			this._collapse();
			if (this.getParent()) {
				this.getParent().setFocus({
					item: this,
					button: Group.BUTTONS.COLLAPSE
				});
			}
		}.bind(this));

		$header.on("click", function (oEvent) {
			if (this.getParent()) {
				this.getParent().setFocus({
					item: this
				});
			}

			this.firePress();
		}.bind(this));

		var fnProcessMenuIconHover = function ($icon, sBackground, sContent) {
			// background in swimlane is not customizable so we don't apply hover to icons
			if (!this._bIsSwimLane) {
				$icon.css("background-color", this._getColor(sBackground));
			}

			$icon.css("color", this._getColor(sContent));
		}.bind(this);

		$actionButtons.on("mouseover", function (oEvent) {
			fnProcessMenuIconHover(jQuery(oEvent.currentTarget), ElementBase.ColorType.HoverBackground, ElementBase.ColorType.HoverContent);
		});

		$actionButtons.on("mouseout", function (oEvent) {
			fnProcessMenuIconHover(jQuery(oEvent.currentTarget), ElementBase.ColorType.Background, ElementBase.ColorType.Content);
		});
	};

	Group.prototype._collapse = function () {
		this.getParent()._selectElementAfterScroll = this;
		this.fireEvent("collapseExpand", {}, true);
		this.setCollapsed(!this.getCollapsed());
	};

	Group.prototype._openDetail = function () {
		var $menu = this.$("menu");
		this.getParent()._tooltip.openDetail({
			item: this,
			opener: $menu[0]
		});
	};

	Group.prototype._isEmpty = function () {
		return this.aNodes.length === 0;
	};

	Group.prototype._isIgnored = function () {
		if (!this._useInLayout()) {
			return true;
		}

		return !this._hasNodes();
	};

	/**
	 * While Layered groups are hidden when all its nodes are hidden, SwimLane groups are always visible.
	 * @private
	 */
	Group.prototype._isVisible = function () {
		var bDirectVisible = this._bIsSwimLane || this.aNodes.some(function (oNode) {
			return !oNode.isHidden();
		});

		if (!bDirectVisible) {
			bDirectVisible = this.aChildGroups.some(function (oGroup) {
				return oGroup._isVisible();
			});
		}

		return bDirectVisible;
	};

	Group.prototype._useInLayout = function () {
		return !this._oCollapsedByParent;
	};

	Group.prototype._resetSize = function () {
		if (this.getCollapsed()) {
			this._iHeight = Size.COLLAPSED_HEIGHT;
			this._iWidth = Size.COLLAPSED_WIDTH;
		}
	};

	Group.prototype._getAccessibilityLabel = function () {
		return oResourceBundle.getText("NETWORK_GRAPH_GROUP") + " " + this.getTitle();
	};

	Group.prototype._isTopBottom = function () {
		var oParent = this.getParent();
		return oParent && oParent._isTopBottom();
	};

	Group.prototype._isVerticalSwimLane = function () {
		if (this._bIsSwimLane) {
			var bTopBottom = this._isTopBottom();

			return (bTopBottom && !this.getCollapsed())
				|| (!bTopBottom && this.getCollapsed());
		}

		return false;
	};

	Group.prototype._isCollapsed = function () {
		return this.getCollapsed() || !!this._oCollapsedByParent;
	};

	ElementBase.prototype._showHeaderCheckBox = function () {
		return this.getHeaderCheckBoxState() !== HeaderCheckboxState.Hidden;
	};

	/**
	 * @returns {number} Size of the group's border.
	 * @private
	 */
	Group.prototype._getBorderSize = function () {
		return 1;
	};

	Group.prototype._setFocus = function (bFocus) {
		this._setMenuButtonFocus(bFocus);
	};

	Group.prototype._isOnScreen = function (iLeft, iRight, iTop, iBottom) {
		var iX = this.getX(),
			iY = this.getY();
		return ElementBase._isRectOnScreen(iX, iX + this._iWidth, iY, iY + this._iHeight, iLeft, iRight, iTop, iBottom);
	};

	/* =========================================================== */
	/* Setters & getters */
	/* =========================================================== */
	Group.prototype.getHeaderCheckBoxState = function () {
		if (this.getProperty("headerCheckBoxState") === HeaderCheckboxState.Hidden) {
			return HeaderCheckboxState.Hidden;
		}

		return this.getHeaderCheckbox().getSelected() ? HeaderCheckboxState.Checked : HeaderCheckboxState.Unchecked;
	};

	Group.prototype.setHeaderCheckBoxState = function (sValue) {
		this._setHeaderCheckBoxState(sValue);
		return this;
	};

	Group.prototype.setX = function (fX) {
		this.fX = fX;
		return this;
	};

	Group.prototype.getX = function () {
		return this.fX;
	};

	Group.prototype.setY = function (fY) {
		this.fY = fY;
		return this;
	};

	Group.prototype.getY = function () {
		return this.fY;
	};

	Group.prototype._setCollapsed = function (bCollapsed, bForce) {
		var oTopGroup = this;

		var oParent = this.getParent(),
			aItems = [];

		var fnCollapseChildGroup = function (oGroup) {
			oGroup.aChildGroups.forEach(function (oChildGroup) {
				fnCollapseChildGroup(oChildGroup);
			});

			if (oTopGroup !== oGroup) {
				if (!oGroup._oCollapsedByParent || oGroup._oCollapsedByParent === oTopGroup) {
					oGroup._oCollapsedByParent = bCollapsed ? oTopGroup : null;
				}
			}
		};

		var fnProcessCollapsedGroup = function (oGroup) {
			// when collapsing the group, deselect all child nodes to prevent inconsistency
			if (bCollapsed) {
				this.getNodes().forEach(function (oNode) {
					if (oNode.getSelected()) {
						oNode.setSelected(false);
						aItems.push(oNode);
					}
				});

				this.getChildLines().forEach(function (oLine) {
					if (oLine.getSelected() && oLine._isInCollapsedGroup()) {
						oLine.setSelected(false);
						aItems.push(oLine);
					}
				});
			}
		}.bind(this);

		if (bCollapsed !== this.getCollapsed() || bForce) {
			this.setProperty("collapsed", bCollapsed, true);

			// when collapsing the group, deselect all child nodes to prevent inconsistency
			if (bCollapsed) {
				this.getNodes().forEach(function (oNode) {
					if (oNode.getSelected()) {
						oNode.setSelected(false);
						aItems.push(oNode);
					}
				});

				this.getChildLines().forEach(function (oLine) {
					if (oLine.getSelected() && oLine._isInCollapsedGroup()) {
						oLine.setSelected(false);
						aItems.push(oLine);
					}
				});
			}

			this.aChildGroups.forEach(function (oChildGroup) {
				fnProcessCollapsedGroup(oChildGroup);
			});

			fnCollapseChildGroup(this);

			if (oParent && aItems.length > 0) {
				oParent.fireSelectionChange({items: aItems});
			}

			if (oParent && oParent._bIsLayedOut) {
				oParent.invalidate();
			}
		}
	};

	Group.prototype.setCollapsed = function (bCollapsed) {
		this._setCollapsed(bCollapsed, false);
		return this;
	};

	Group.prototype.setVisible = function (bValue) {
		this.setProperty("visible", bValue);

		var oParent = this.getParent();

		if (oParent && oParent._bIsLayedOut && !this.getCollapsed()) {
			this.aNodes.forEach(function (oNode) {
				if (!bValue) {
					oNode.$().hide();
				} else if (!oNode._bIsHidden) {
					oNode.$().show();
				}
			});
		}

		return this;
	};

	return Group;
});
