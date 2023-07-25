/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.UnifiedThingInspector.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'./library',
	'sap/m/library',
	'sap/ui/core/Control',
	'sap/m/NavContainer',
	'sap/ui/core/IconPool',
	'sap/ui/layout/Grid',
	'sap/ui/layout/GridData',
	'sap/m/ActionSheet',
	'sap/suite/ui/commons/LinkActionSheet',
	'sap/m/ScrollContainer',
	'sap/m/Page',
	'sap/m/Bar',
	'sap/m/Button',
	'sap/ui/Device',
	'sap/ui/core/ResizeHandler',
	'sap/ui/base/ManagedObject',
	'sap/m/ObjectHeader',
	'sap/m/ObjectAttribute',
	'sap/m/Image',
	'sap/ui/core/Icon',
	"sap/base/Log",
	"sap/ui/events/KeyCodes",
	"sap/base/util/deepEqual",
	"./UnifiedThingInspectorRenderer"
], function (jQuery, library, Mobilelibrary, Control, NavContainer, IconPool, Grid, GridData, ActionSheet, LinkActionSheet, ScrollContainer, Page,
			 Bar, Button, Device, ResizeHandler, ManagedObject, ObjectHeader, ObjectAttribute, Image, Icon, Log, KeyCodes, deepEqual, UnifiedThingInspectorRenderer) {
	"use strict";

	/**
	 * Constructor for a new UnifiedThingInspector.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control provides an ability to display a thing (for example, object factsheet) on the desktop, tablet, and phone devices in a Fiori style.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.32.
	 * Deprecated. Object page should be used instead.
	 * @alias sap.suite.ui.commons.UnifiedThingInspector
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var UnifiedThingInspector = Control.extend("sap.suite.ui.commons.UnifiedThingInspector", /** @lends sap.suite.ui.commons.UnifiedThingInspector.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * The height of the control.
				 */
				height: {type: "sap.ui.core.CSSSize", group: "Misc", defaultValue: '100%'},

				/**
				 * The title of the thing.
				 */
				title: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * The name of the thing.
				 */
				name: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * The description of the thing.
				 */
				description: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * The icon to be displayed as a graphical element within the header. This can be an image or an icon from the icon font.
				 */
				icon: {type: "sap.ui.core.URI", group: "Misc", defaultValue: null},

				/**
				 * If set to true, the Transaction button appears.
				 */
				transactionsVisible: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * If set to true, the Actions button appears.
				 */
				actionsVisible: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * If set to true, destroys a page when the user chooses the Back button to leave this page.
				 */
				destroyPageOnBack: {type: "boolean", group: "Misc", defaultValue: true},

				/**
				 * If set to true, the Configuration button appears.
				 */
				configurationVisible: {type: "boolean", group: "Misc", defaultValue: true}
			},
			aggregations: {
				/**
				 * The list of the sap.suite.ui.commons.FacetOverview objects.
				 */
				facets: {type: "sap.suite.ui.commons.FacetOverview", multiple: true, singularName: "facet"},

				/**
				 * The content that appears on the detail page of the UnifiedThingInspector.
				 */
				facetContent: {type: "sap.ui.core.Control", multiple: true, singularName: "facetContent"},

				/**
				 * The hidden aggregation for the sap.m.NavContainer control.
				 */
				navContainer: {type: "sap.m.NavContainer", multiple: false, visibility: "hidden"},

				/**
				 * A set of the KPI tiles to be shown in the header. Currently only 3 tiles from the list are displayed on the desktop and tablet. On the phone, all tiles are displayed in a swipeable container.
				 */
				kpis: {type: "sap.suite.ui.commons.KpiTile", multiple: true, singularName: "kpi"},

				/**
				 * Menu items for transaction popup.
				 * @deprecated Since version 1.18.2.
				 * Deprecated due to the incorrect work with data binding. Open the popup in the transactionsButtonPress event handler instead.
				 */
				transactions: {
					type: "sap.ui.core.Control",
					multiple: true,
					singularName: "transaction",
					deprecated: true
				},

				/**
				 * Action sheet controls.
				 * @deprecated Since version 1.18.2.
				 * Deprecated due to the incorrect work with data binding. Open the popup in the actionsButtonPress event handler instead.
				 */
				actions: {type: "sap.m.Button", multiple: true, singularName: "action", deprecated: true},

				/**
				 * Contains pages except for Master and Detail.
				 */
				pages: {type: "sap.ui.core.Control", multiple: true, singularName: "page"},

				/**
				 * The hidden aggregation for the sap.m.ObjectHeader control.
				 */
				objectHeader: {type: "sap.m.ObjectHeader", multiple: false, visibility: "hidden"}
			},
			events: {
				/**
				 * The event is fired when the user chooses the Back button.
				 */
				backAction: {},

				/**
				 * The event is fired when the user chooses the Transactions button.
				 */
				transactionsButtonPress: {
					allowPreventDefault: true,
					parameters: {

						/**
						 * The object that initiated the event.
						 */
						caller: {type: "object"}
					}
				},

				/**
				 * The event is fired when the user chooses the Actions button.
				 */
				actionsButtonPress: {
					allowPreventDefault: true,
					parameters: {

						/**
						 * The object that initiated the event.
						 */
						caller: {type: "object"}
					}
				},

				/**
				 * The event is fired when the user chooses the Configuration button.
				 */
				configurationButtonPress: {
					parameters: {

						/**
						 * The object that initiated the event.
						 */
						caller: {type: "object"}
					}
				},

				/**
				 * The event is fired when navigation between two pages has been triggered. The transition (if any) to the new page has not started yet.
				 * This event can be aborted by the application with preventDefault(), which means that there will be no navigation.
				 * This event is propogated from the inner NavContainer. The event can also return internal Master and Detail pages.
				 */
				navigate: {
					allowPreventDefault: true,
					parameters: {

						/**
						 * The page that was shown before the current navigation.
						 */
						from: {type: "sap.ui.core.Control"},

						/**
						 * The ID of the page that was shown before the current navigation.
						 */
						fromId: {type: "string"},

						/**
						 * The page that will be shown after the current navigation.
						 */
						to: {type: "sap.ui.core.Control"},

						/**
						 * The ID of the page that will be shown after the current navigation.
						 */
						toId: {type: "string"},

						/**
						 * Whether the "to" page (more precisely: a control with the ID of the page that is currently navigated to) has not been shown/navigated to before.
						 */
						firstTime: {type: "boolean"},

						/**
						 * Whether this is a forward navigation, triggered by "to()".
						 */
						isTo: {type: "boolean"},

						/**
						 * Whether this is a back navigation, triggered by "back()".
						 */
						isBack: {type: "boolean"},

						/**
						 * Whether this is a navigation to the root page, triggered by "backToTop()".
						 */
						isBackToTop: {type: "boolean"},

						/**
						 * Whether this was a navigation to the root page, triggered by "backToTop()".
						 * @since 1.7.2
						 */
						isBackToPage: {type: "boolean"},

						/**
						 * How the navigation was triggered, possible values are: "to", "back", and "backToTop".
						 */
						direction: {type: "string"}
					}
				},

				/**
				 * The event is fired when navigation between two pages has completed. In case of animated transitions this event is fired with some delay after the "navigate" event.
				 * This event is propogated from the inner NavContainer. The event can also return internal Master and Detail pages.
				 */
				afterNavigate: {
					parameters: {

						/**
						 * The page that had been shown before navigation.
						 */
						from: {type: "sap.ui.core.Control"},

						/**
						 * The ID of the page that had been shown before navigation.
						 */
						fromId: {type: "string"},

						/**
						 * The page that is now shown after navigation.
						 */
						to: {type: "sap.ui.core.Control"},

						/**
						 * The ID of the page that is now shown after navigation.
						 */
						toId: {type: "string"},

						/**
						 * Whether the "to" page (more precisely: a control with the ID of the page that has been navigated to) had not been shown/navigated to before.
						 */
						firstTime: {type: "boolean"},

						/**
						 * Whether was a forward navigation, triggered by "to()".
						 */
						isTo: {type: "boolean"},

						/**
						 * Whether this was a back navigation, triggered by "back()".
						 */
						isBack: {type: "boolean"},

						/**
						 * Whether this was a navigation to the root page, triggered by "backToTop()".
						 */
						isBackToTop: {type: "boolean"},

						/**
						 * Whether this was a navigation to the root page, triggered by "backToTop()".
						 * @since 1.7.2
						 */
						isBackToPage: {type: "boolean"},

						/**
						 * How the navigation was triggered, possible values are: "to", "back", and "backToTop".
						 */
						direction: {type: "string"}
					}
				}
			}
		}
	});

	UnifiedThingInspector.prototype.init = function () {
		this._altKey = false; // flag for MAC - it shows whether the Alt key is pressed
		var that = this; //eslint-disable-line
		this._rb = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");
		/*this boolean is used to determine if animation of transition to detail page has been finished.
		 if true - animation is still happening and control does not allow to navigate to another detail page (in navigateToDetail()).
		 */
		this._bDetailPageIsTransitioning = false;

		this._oNavContainer = new NavContainer(this.getId() + "-nav-container", {
			navigate: function (oEvent) {
				that._bDetailPageIsTransitioning = true;
				that.fireNavigate(oEvent);
			},
			afterNavigate: function (oEvent) {
				that._bDetailPageIsTransitioning = false;

				if (that.getDestroyPageOnBack()) {
					var oPage = oEvent.getParameter("from");
					var iIndex = that._oNavContainer.indexOfPage(oPage);

					if (iIndex > 1 && oEvent.getParameter("isBack")) {
						oPage.destroy(true);
					}
				}

				that.fireAfterNavigate(oEvent);
			}
		});
		this.setAggregation("navContainer", this._oNavContainer);

		this._oActionSheet = new ActionSheet(this.getId() + "-action-sheet", {
			showCancelButton: true,
			placement: Mobilelibrary.PlacementType.Top
		});

		this._oTransactionSheet = new LinkActionSheet(this.getId() + "-transaction-sheet", {
			showCancelButton: true,
			placement: Mobilelibrary.PlacementType.Top,
			itemPress: function (oEvent) {
				var oItem = oEvent.getParameter("item");
				if (oItem.getMetadata().getName() === "sap.m.Link" && oItem._bEnterWasPressed) {
					that._bDontOpenTransactions = true;
				}
			}
		});

		this._oKpiScrollCont = new ScrollContainer(this.getId() + "-kpi-scroll-container", {
			width: "100%",
			horizontal: this.isPhone()
		});

		this._oKpiScrollCont.addStyleClass("sapSuiteUtiKpiBox");

		this._oFacetsGrid = new Grid(this.getId() + "-facets-grid", {
			defaultSpan: "L6 M12 S12",
			hSpacing: 1,
			vSpacing: 1,
			width: "auto"
		});
		this._oFacetsGrid.addStyleClass("sapSuiteUtiFacetGrid");
		this._oFacetsGrid.addDelegate({
			onAfterRendering: function (oEvent) {
				var oListControl = oEvent.srcControl.$();
				oListControl.attr("role", "group");
				var oDescendants = oListControl.find("[role='note']");
				var iCount = 1;
				oDescendants.each(function () {
					jQuery(this).attr("aria-setsize", oDescendants.length).attr("aria-posinset", iCount++);
				});
			}
		});

		this._oHeader = this._createHeaderObject(this.getId() + "-header");
		this._oHeader.getObjectHeader()._titleText.setMaxLines(2);

		this._oHeaderGrid = new Grid(this.getId() + "-header-grid", {
			hSpacing: 0,
			vSpacing: 0,
			content: [
				this._oHeader,
				this._oKpiScrollCont
			]
		});

		this._oMasterPage = new Page(this.getId() + "-master-page", {
			content: [this._oHeaderGrid, this._oFacetsGrid],
			showNavButton: true,
			footer: new Bar(this.getId() + "-master-footer", {
				contentRight: [
					new Button(this.getId() + "-master-action-button", {
						icon: "sap-icon://action",
						tooltip: that._rb.getText("UNIFIEDTHINGINSPECTOR_FOOTER_BUTTON_ACTIONS"),
						press: function () {
							var object = {};
							object.caller = this;
							if (that.fireActionsButtonPress(object)) {
								if (that._oActionSheet.getButtons().length) {
									that._oActionSheet.openBy(this);
								} else {
									Log.info("The are no actions for displaying");
								}
							}
						}
					})
				]
			}),
			navButtonPress: function () {
				that.fireBackAction();
			}
		});

		this._oMasterPage.getFooter().insertContentRight(
			new Button(this.getId() + "-master-transaction-button", {
				text: that._rb.getText("UNIFIEDTHINGINSPECTOR_FOOTER_BUTTON_OPENWITH") + "...",
				tooltip: that._rb.getText("UNIFIEDTHINGINSPECTOR_FOOTER_BUTTON_TRANSACTIONS_TOOLTIP"),
				press: function () {
					if (!that._bDontOpenTransactions) {
						var object = {};
						object.caller = this;
						if (that.fireTransactionsButtonPress(object)) {
							if (that._oTransactionSheet.getItems().length) {
								that._oTransactionSheet.openBy(this);
							} else {
								Log.info("The are no transactions for displaying");
							}
						}
					} else {
						that._bDontOpenTransactions = false;
					}
				}
			}),
			0
		);

		this._oDetailPage = new Page(this.getId() + "-detail-page", {
			showNavButton: true,
			footer: new Bar(this.getId() + "-detail-footer", {
				contentRight: [
					new Button(this.getId() + "-detail-action-button", {
						icon: "sap-icon://action",
						tooltip: that._rb.getText("UNIFIEDTHINGINSPECTOR_FOOTER_BUTTON_ACTIONS"),
						press: function () {
							var object = {};
							object.caller = this;
							if (that.fireActionsButtonPress(object)) {
								if (that._oActionSheet.getButtons().length) {
									that._oActionSheet.openBy(this);
								} else {
									Log.info("The are no actions for displaying");
								}
							}
						}
					})
				]
			}),
			navButtonPress: function () {
				that._navigateToMaster();
			}
		});

		this._oDetailPage.getFooter().insertContentRight(
			new Button(this.getId() + "-detail-transaction-button", {
				text: that._rb.getText("UNIFIEDTHINGINSPECTOR_FOOTER_BUTTON_OPENWITH") + "...",
				tooltip: that._rb.getText("UNIFIEDTHINGINSPECTOR_FOOTER_BUTTON_TRANSACTIONS_TOOLTIP"),
				press: function () {
					var object = {};
					object.caller = this;
					if (that.fireTransactionsButtonPress(object)) {
						if (that._oTransactionSheet.getItems().length) {
							that._oTransactionSheet.openBy(this);
						} else {
							Log.info("The are no transactions for displaying");
						}
					}
				}
			}),
			0
		);

		this._oNavContainer.addPage(this._oMasterPage);
		this._oNavContainer.addPage(this._oDetailPage);

		if (!Device.system.desktop) {
			Device.orientation.attachHandler(function (oE) {
				that._updateHeaderLayoutData(oE);
				that._adjustFacetLayout();
			});
		}

		this.setModel = function (oModel, sName) {
			UnifiedThingInspector.prototype.setModel.apply(this, arguments);
			this._oActionSheet.setModel(oModel, sName);
			this._oTransactionSheet.setModel(oModel, sName);
			return this;
		};

		this._bindedAdjustFacetLayout = this._adjustFacetLayout.bind(this);

		this._oDelegate = {
			onclick: function (oEvent) {
				that.$().find(".sapSuiteFov").removeAttr("tabindex");
				var oFo = jQuery(oEvent.currentTarget);
				oFo.attr("tabindex", 0);

				if (oFo) {
					oFo.focus();
				}
			},
			onAfterRendering: function (oEvent) {
				that._adjustFacetLayout();
				if (that._sCurrentFoId == oEvent.srcControl.getId()) {
					oEvent.srcControl.$().attr("tabindex", 0);
				}
			},
			onkeydown: function (oEvent) {
				var oFo = oEvent.srcControl.$();

				var fnMove = function (oNewFo) {
					if (oNewFo.length) {
						oNewFo.attr("tabindex", 0);

						if (oNewFo.get(0)) {
							oNewFo.get(0).focus();
						}

						oFo.removeAttr("tabindex");
						that._sCurrentFoId = oNewFo.attr("id");
					}
				};

				var fnMoveArr = function (oSite) {
					var oNewFo = that.$().find((oSite.row != undefined ? "[data-row=" + oSite.row + "]" : "")
						+ (oSite.col != undefined ? "[data-col=" + oSite.col + "]" : "")
						+ (oSite.f != undefined ? "[data-f=" + oSite.f + "]" : ""));
					fnMove(oNewFo);
				};

				var sRow = oFo.attr("data-row");
				var sCol = oFo.attr("data-col");
				var sF = oFo.attr("data-f");

				var bRtl = sap.ui.getCore().getConfiguration().getRTL();
				var iArrowLeft = bRtl ? KeyCodes.ARROW_RIGHT : KeyCodes.ARROW_LEFT;
				var iArrowRight = bRtl ? KeyCodes.ARROW_LEFT : KeyCodes.ARROW_RIGHT;

				switch (oEvent.which) {
					case KeyCodes.ARROW_UP:
						fnMoveArr({row: parseInt(sRow) - 1, col: sCol}); //eslint-disable-line
						oEvent.preventDefault();
						break;
					case KeyCodes.ARROW_DOWN:
						fnMoveArr({row: parseInt(sRow) + 1, col: sCol}); //eslint-disable-line
						oEvent.preventDefault();
						break;
					case iArrowLeft:
						if (iArrowRight == that._prevKey && !oFo.is(that._prevFo)) {
							fnMove(that._prevFo);
						} else {
							fnMoveArr({col: parseInt(sCol) - 1, f: sF}); //eslint-disable-line
						}
						oEvent.preventDefault();
						break;
					case iArrowRight:
						if (iArrowLeft == that._prevKey && !oFo.is(that._prevFo)) {
							fnMove(that._prevFo);
						} else {
							fnMoveArr({col: parseInt(sCol) + 1, f: sF}); //eslint-disable-line
						}
						oEvent.preventDefault();
						break;
					case KeyCodes.HOME:
						fnMove(that.$().find("[data-home]"));
						oEvent.preventDefault();
						break;
					case KeyCodes.END:
						fnMove(that.$().find("[data-end]"));
						oEvent.preventDefault();
						break;
					default:
						break;
				}

				that._prevKey = oEvent.which;
				that._prevFo = oFo;
			}
		};
	};

	UnifiedThingInspector.prototype.exit = function () {
		var that = this; //eslint-disable-line
		this._oActionSheet.destroy();
		this._oTransactionSheet.destroy();

		Device.orientation.detachHandler(function () {
			that._updateHeaderLayoutData();
		});

		ResizeHandler.deregister(this._sTitleResizeHandlerId);
	};

	UnifiedThingInspector.prototype._updateHeaderLayoutData = function (oE) {
		var sContainerWidth = "";
		var oScrollContainer = jQuery(document.getElementById(this.getId() + "-kpi-scroll-container-scroll"));
		var sSCClass = this.getScrollClass();

		if (Device.system.tablet && !oE.landscape) {
			sContainerWidth = "100%";
			oScrollContainer.addClass(sSCClass);
		} else {
			oScrollContainer.removeClass(sSCClass);
		}

		oScrollContainer.css("width", sContainerWidth);
	};

	UnifiedThingInspector.prototype._adjustFacetLayout = function () {
		var iFacetsLength = this.getFacets().length;
		if (iFacetsLength > 0) {
			this.getFacets()[0].$().attr("data-home", true);
			this.getFacets()[iFacetsLength - 1].$().attr("data-end", true);
		}
		if (this.$().outerWidth(true) >= 1024 || this._oFacetsGrid.$().hasClass("sapUiRespGridMedia-Std-Desktop")) {
			this._adjustTwoColumnFacetLayout();
		} else {
			this._adjustOneColumnFacetLayout();
		}
	};

	UnifiedThingInspector.prototype._adjustOneColumnFacetLayout = function () {
		var iFacetsLength = this.getFacets().length;
		for (var i = 0; i < iFacetsLength; i++) {
			this.getFacets()[i].$().attr("data-row", i).attr("data-col", 0).parent().css("margin-top", "").removeClass("sapSuiteUtiFacetLeft");
		}
	};

	UnifiedThingInspector.prototype._adjustTwoColumnFacetLayout = function () {
		this._adjustOneColumnFacetLayout();
		//Correct layout to avoid issues with gaps between cards
		var aFacets = this.getFacets();
		var fFacetBalance = 0;
		var iLRow = 0, iRRow = 0, iF = -1;
		var iFacetsLength = aFacets.length;

		for (var i = 0; i < iFacetsLength; i++) {
			var fHeight = parseFloat(aFacets[i].$().css("height"));
			if (fFacetBalance > 0) {
				fFacetBalance -= fHeight + parseFloat(aFacets[i].$().parent().css("margin-bottom"));
				aFacets[i].$().attr("data-row", iRRow).attr("data-col", 1).attr("data-f", iF);
				iRRow += 1;
			} else {
				if (fFacetBalance < 0) {
					aFacets[i].$().parent().css("margin-top", fFacetBalance + "px");
				} else {
					aFacets[i].$().parent().addClass("sapSuiteUtiFacetLeft");
				}
				fFacetBalance += fHeight + parseFloat(aFacets[i].$().parent().css("margin-bottom"));
				iF += 1;
				aFacets[i].$().attr("data-row", iLRow).attr("data-col", 0).attr("data-f", iF);
				iLRow += 1;
			}
		}
	};

	UnifiedThingInspector.prototype.onAfterRendering = function () {
		if (this._sTitleResizeHandlerId) {
			ResizeHandler.deregister(this._sTitleResizeHandlerId);
		}
		var oHeader = this.getId() + "-header" ? window.document.getElementById(this.getId() + "-header") : null;
		if (oHeader) {
			this._sTitleResizeHandlerId = ResizeHandler.register(oHeader, jQuery.proxy(this._handleResize, this));
			this._handleResize();
		}
		if (Device.system.tablet && Device.orientation.portrait) {
			jQuery(document.getElementById(this.getId() + "-kpi-scroll-container-scroll")).css("width", "100%").addClass(this.getScrollClass());
		}
		var iFacetsLength = this.getFacets().length;
		for (var i = 0; i < iFacetsLength; i++) {
			this.getFacets()[i].addDelegate(this._oDelegate);
		}
		var aCurrentFo = jQuery(document.getElementById(this._sCurrentFoId));
		if (aCurrentFo.length === 0) {
			aCurrentFo = this.$().find("[data-home]");
			this._sCurrentFoId = aCurrentFo.attr("id");
		}
		aCurrentFo.attr("tabindex", 0);
	};

	UnifiedThingInspector.prototype._handleResize = function () {
		this._adjustFacetLayout();
	};

	UnifiedThingInspector.prototype._getFontSize = function (iCont, iWidth) {
		var nSize = iWidth / (iCont * 0.5);
		if (nSize > 28) {
			return 28;
		} else if (nSize < 20) {
			return 20;
		} else {
			return nSize;
		}

	};

	UnifiedThingInspector.prototype.onBeforeRendering = function () {
		var that = this; //eslint-disable-line
		if (this.getConfigurationVisible()) {
			if (this._oMasterPage.getFooter().getContentLeft().length == 0) {
				this._oMasterPage.getFooter().addContentLeft(new Button(this.getId() + "-master-settings-button", {
					icon: "sap-icon://action-settings",
					tooltip: that._rb.getText("UNIFIEDTHINGINSPECTOR_FOOTER_BUTTON_SETTINGS_TOOLTIP"),
					press: function () {
						var object = {};
						object.caller = this;
						that.fireConfigurationButtonPress(object);
					}
				}), true);
			}

			if (this._oDetailPage.getFooter().getContentLeft().length == 0) {
				this._oDetailPage.getFooter().addContentLeft(new Button(this.getId() + "-detail-settings-button", {
					icon: "sap-icon://action-settings",
					tooltip: that._rb.getText("UNIFIEDTHINGINSPECTOR_FOOTER_BUTTON_SETTINGS_TOOLTIP"),
					press: function () {
						var object = {};
						object.caller = this;
						that.fireConfigurationButtonPress(object);
					}
				}), true);
			}
		} else {
			this._oMasterPage.getFooter().removeAllContentLeft(true);
			this._oDetailPage.getFooter().removeAllContentLeft(true);
		}

		sap.ui.getCore().byId(this.getId() + "-master-action-button").setVisible(this.getActionsVisible());
		sap.ui.getCore().byId(this.getId() + "-detail-action-button").setVisible(this.getActionsVisible());

		sap.ui.getCore().byId(this.getId() + "-master-transaction-button").setVisible(this.getTransactionsVisible());
		sap.ui.getCore().byId(this.getId() + "-detail-transaction-button").setVisible(this.getTransactionsVisible());

		//If there are no KPIs - do not show scroll container at all.
		//This fixes issue when there are no KPIs but on phone we have two rows in header.
		this._oKpiScrollCont.setVisible(!!this.getKpis().length);

		//If there is less than 3 tiles - pass specific class flag
		if (this.getKpis().length < 3) {
			this._oKpiScrollCont.addStyleClass("sapSuiteUtiKpiLT3");
		}

		this._fitKpiTiles();
	};

	UnifiedThingInspector.prototype._fitKpiTiles = function () {
		var sHeaderSpan;
		var sKpiCntSpan;
		var iKpiLength = this.getKpis().length;

		switch (iKpiLength) {
			case 0:
				sHeaderSpan = "L12 M12 S12";
				sKpiCntSpan = "L12 M12 S12";
				break;
			case 1:
				sHeaderSpan = "L9 M12 S12";
				sKpiCntSpan = "L3 M12 S12";
				break;
			case 2:
				sHeaderSpan = "L7 M12 S12";
				sKpiCntSpan = "L5 M12 S12";
				break;
			default:
				sHeaderSpan = "L6 M12 S12";
				sKpiCntSpan = "L6 M12 S12";
		}

		this._oHeader.setLayoutData(new GridData({span: sHeaderSpan}));
		this._oKpiScrollCont.setLayoutData(new GridData({span: sKpiCntSpan}));
	};

	UnifiedThingInspector.prototype.isPhone = function () {
		return Device.system.phone || Device.os.ios && Device.system.phone;
	};

	// overridden properties setters
	UnifiedThingInspector.prototype.setTitle = function (sTitle) {
		this.setProperty("title", sTitle, true);
		this._oMasterPage.setTitle(sTitle);
		this._oDetailPage.setTitle(sTitle);
		return this;
	};

	UnifiedThingInspector.prototype.setName = function (sName) {
		this._oHeader.setName(sName);
		return this;
	};

	UnifiedThingInspector.prototype.setDescription = function (sDescription) {
		this._oHeader.setDescription(sDescription);
		return this;
	};

	UnifiedThingInspector.prototype.getName = function () {
		return this._oHeader.getName();
	};

	UnifiedThingInspector.prototype.getDescription = function () {
		return this._oHeader.getDescription();
	};

	UnifiedThingInspector.prototype.setIcon = function (sIcon) {
		this._oHeader.setIcon(sIcon);
		this.setProperty("icon", sIcon, true);
		return this;
	};

	UnifiedThingInspector.prototype.getScrollClass = function () {
		var iKpiCount = this.getKpis().length;
		var sScrollClass = "";
		if (iKpiCount == 1) {
			sScrollClass = "sapSuiteUtiScOne";
		} else if (iKpiCount == 2) {
			sScrollClass = "sapSuiteUtiScTwo";
		} else if (iKpiCount > 2) {
			sScrollClass = "sapSuiteUtiScThree";
		}

		return sScrollClass;
	};

	UnifiedThingInspector.prototype._navigateToMaster = function () {
		this._oNavContainer.back();
	};

	/*Method should be called when user selects some facet. Developer should supply this method with content for detail page.
	 Method checks if there is any other already happening transition to detail page. E.g. user double clicked facet. If page is
	 still transitioning - we cancel newly added navigation.
	 */
	UnifiedThingInspector.prototype.navigateToDetailWithContent = function (aFacetData) {
		if (!this._bDetailPageIsTransitioning) {
			this.removeAllFacetContent();
			if (Array.isArray(aFacetData)) {
				for (var i = 0; i < aFacetData.length; i++) {
					this.addFacetContent(aFacetData[i]);
				}
			} else {
				this.addFacetContent(aFacetData);
			}
			this._oNavContainer.to(this._oDetailPage.getId());
			this._oDetailPage.scrollTo(0);
		}
		return this;
	};

	UnifiedThingInspector.prototype.navigateToDetail = function () {
		this._oNavContainer.to(this._oDetailPage.getId());
		return this;
	};

	UnifiedThingInspector.prototype.navigateToPage = function (oPage, addDefaultFooter) {
		var that = this; //eslint-disable-line
		oPage.attachNavButtonPress(function (oEvent) {
			that._oNavContainer.back();
		});
		if (addDefaultFooter == undefined || addDefaultFooter) {
			var oFooter = this._oMasterPage.getFooter().clone();
			oPage.setFooter(oFooter);
		}
		this._oNavContainer.addPage(oPage);
		this._oNavContainer.to(oPage.getId());
		return this;
	};

	UnifiedThingInspector.prototype.navigateToPageById = function (sId) {
		this._oNavContainer.to(sId);
		return this;
	};

	UnifiedThingInspector.prototype.removeFacet = function (oFacet, bSuppressInvalidate) {
		oFacet.removeDelegate(this._oDelegate);
		return this.removeAggregation("facets", oFacet, bSuppressInvalidate);
	};

	UnifiedThingInspector.prototype.removeAllFacets = function (bSuppressInvalidate) {
		for (var i = 0; i < this.getFacets().length; i++) {
			this.getFacets()[i].removeDelegate(this._oDelegate);
		}
		return this.removeAllAggregation("facets", bSuppressInvalidate);
	};

	UnifiedThingInspector.prototype.getActions = function () {
		return this._oActionSheet.getButtons();
	};

	UnifiedThingInspector.prototype.insertAction = function (oAction, iIndex) {
		this._oActionSheet.insertButton(oAction, iIndex);
		return this;
	};

	UnifiedThingInspector.prototype.addAction = function (oAction) {
		this._oActionSheet.addButton(oAction);
		return this;
	};

	UnifiedThingInspector.prototype.removeAction = function (vAction) {
		return this._oActionSheet.removeButton(vAction);
	};

	UnifiedThingInspector.prototype.removeAllActions = function () {
		return this._oActionSheet.removeAllButtons();
	};

	UnifiedThingInspector.prototype.indexOfAction = function (oAction) {
		return this._oActionSheet.indexOfButton(oAction);
	};

	UnifiedThingInspector.prototype.destroyActions = function () {
		this._oActionSheet.destroyButtons();
		return this;
	};

	UnifiedThingInspector.prototype.getTransactions = function () {
		return this._oTransactionSheet.getItems();
	};

	UnifiedThingInspector.prototype.addTransaction = function (oTransaction) {
		this._oTransactionSheet.addItem(oTransaction);
		return this;
	};

	UnifiedThingInspector.prototype.insertTransaction = function (oTransaction, iIndex) {
		this._oTransactionSheet.insertItem(oTransaction, iIndex);
		return this;
	};

	UnifiedThingInspector.prototype.removeTransaction = function (oTransaction) {
		return this._oTransactionSheet.removeItem(oTransaction);
	};

	UnifiedThingInspector.prototype.removeAllTransactions = function () {
		return this._oTransactionSheet.removeAllItems();
	};

	UnifiedThingInspector.prototype.indexOfTransaction = function (oTransaction) {
		return this._oTransactionSheet.indexOfItem(oTransaction);
	};

	UnifiedThingInspector.prototype.destroyTransactions = function () {
		this._oTransactionSheet.destroyItems();
		return this;
	};

	/**************************************************************
	 * AGGREGATION FORWARDING inspired by Split Container
	 **************************************************************/

	UnifiedThingInspector.prototype._callMethodInManagedObject = function (sFunctionName, sAggregationName) {
		var args = Array.prototype.slice.call(arguments);
		if (sAggregationName === "facets") {
			args[1] = "content";
			return this._oFacetsGrid[sFunctionName].apply(this._oFacetsGrid, args.slice(1));
		} else if (sAggregationName === "kpis") {
			args[1] = "content";
			return this._oKpiScrollCont[sFunctionName].apply(this._oKpiScrollCont, args.slice(1));
		} else if (sAggregationName === "facetContent") {
			args[1] = "content";
			return this._oDetailPage[sFunctionName].apply(this._oDetailPage, args.slice(1));
		} else {
			return ManagedObject.prototype[sFunctionName].apply(this, args.slice(1));
		}
	};

	UnifiedThingInspector.prototype.validateAggregation = function (sAggregationName, oObject, bMultiple) {
		return this._callMethodInManagedObject("validateAggregation", sAggregationName, oObject, bMultiple);
	};

	UnifiedThingInspector.prototype.setAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
		this._callMethodInManagedObject("setAggregation", sAggregationName, oObject, bSuppressInvalidate);
		return this;
	};

	UnifiedThingInspector.prototype.getAggregation = function (sAggregationName, oDefaultForCreation) {
		return this._callMethodInManagedObject("getAggregation", sAggregationName, oDefaultForCreation);
	};

	UnifiedThingInspector.prototype.indexOfAggregation = function (sAggregationName, oObject) {
		return this._callMethodInManagedObject("indexOfAggregation", sAggregationName, oObject);
	};

	UnifiedThingInspector.prototype.insertAggregation = function (sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		this._callMethodInManagedObject("insertAggregation", sAggregationName, oObject, iIndex, bSuppressInvalidate);
		return this;
	};

	UnifiedThingInspector.prototype.addAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
		this._callMethodInManagedObject("addAggregation", sAggregationName, oObject, bSuppressInvalidate);
		return this;
	};

	UnifiedThingInspector.prototype.removeAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
		return this._callMethodInManagedObject("removeAggregation", sAggregationName, oObject, bSuppressInvalidate);
	};

	UnifiedThingInspector.prototype.removeAllAggregation = function (sAggregationName, bSuppressInvalidate) {
		return this._callMethodInManagedObject("removeAllAggregation", sAggregationName, bSuppressInvalidate);
	};

	UnifiedThingInspector.prototype.destroyAggregation = function (sAggregationName, bSuppressInvalidate) {
		this._callMethodInManagedObject("destroyAggregation", sAggregationName, bSuppressInvalidate);
		return this;
	};

	UnifiedThingInspector.prototype.getPages = function () {
		return this._oNavContainer.getPages().slice(2);
	};

	UnifiedThingInspector.prototype.insertPage = function (oPage, iIndex, bSuppressInvalidate) {
		this._oNavContainer.insertPage(oPage, iIndex + 2, bSuppressInvalidate);
		return this;
	};

	UnifiedThingInspector.prototype.addPage = function (oPage, bSuppressInvalidate) {
		this._oNavContainer.addPage(oPage, bSuppressInvalidate);
		return this;
	};

	UnifiedThingInspector.prototype.removePage = function (oPage, bSuppressInvalidate) {
		return this._oNavContainer.removePage(oPage, bSuppressInvalidate);
	};

	UnifiedThingInspector.prototype.removeAllPages = function (bSuppressInvalidate) {
		var aPages = this.getPages();
		for (var i = aPages.length - 1; i >= 0; i--) {
			this._oNavContainer.removePage(aPages[i], bSuppressInvalidate);
		}
		return aPages;
	};

	UnifiedThingInspector.prototype.indexOfPage = function (oPage) {
		var i = this._oNavContainer.indexOfPage(oPage);
		return i > 1 ? i - 2 : -1;
	};

	UnifiedThingInspector.prototype.destroyPages = function (bSuppressInvalidate) {
		var aPages = this.getPages();
		for (var i = aPages.length - 1; i >= 0; i--) {
			aPages[i].destroy(bSuppressInvalidate);
		}
		return this;
	};


	/**************************************************************
	 * END - forward aggregation related methods to the inner aggregation
	 **************************************************************/

	UnifiedThingInspector.prototype._createHeaderObject = function (sId) {
		//    var that = this;
		Control.extend("sap.suite.ui.commons.UnifiedThingInspector.Header", {
			metadata: {
				properties: {
					name: "string",
					description: "string",
					icon: "sap.ui.core.URI"
				},
				aggregations: {
					"objectHeader": {type: "sap.m.ObjectHeader", multiple: false}
				}
			},
			init: function () {
				this._oObjectHeader = new ObjectHeader(this.getId() + "-object-header", {
					condensed: true,
					backgroundDesign: Mobilelibrary.BackgroundDesign.Transparent
				});
				this.setAggregation("objectHeader", this._oObjectHeader);
			},
			setDescription: function (sDesc) {
				this._oObjectHeader.removeAllAttributes();
				this._oObjectHeader.addAttribute(new ObjectAttribute({text: sDesc}));
			},
			setName: function (sName) {
				this._oObjectHeader.setTitle(sName);
			},
			getDescription: function () {
				if (this._oObjectHeader.getAttributes().length == 1) {
					return this._oObjectHeader.getAttributes()[0].getText();
				} else {
					return "";
				}
			},
			getName: function () {
				return this._oObjectHeader.getTitle();
			},
			setIcon: function (sIcon) {
				var bValueChanged = !deepEqual(this.getIcon(), sIcon);

				if (bValueChanged) {
					if (this._oIcon) {
						this._oIcon.destroy();
						this._oIcon = undefined;
					}

					if (sIcon) {
						this._oIcon = IconPool.createControlByURI({
							id: this.getId() + "-icon-image",
							src: sIcon
						}, Image);

						this._oIcon.addStyleClass("sapSuiteUtiHeaderIconImage");

						if (this._oIcon instanceof Icon) {
							this._oIcon.setSize("64px");
						}
					}
				}

				return this.setProperty("icon", sIcon);
			},
			exit: function () {
				if (this._oIcon) {
					this._oIcon.destroy();
				}
			},
			renderer: function (oRm, oControl) {
				oRm.write("<div");
				oRm.writeControlData(oControl);
				oRm.addClass("sapSuiteUtiHeader");
				oRm.writeClasses();
				oRm.write(">");

				if (oControl._oIcon) {
					oRm.write("<div");
					oRm.writeAttribute("id", oControl.getId() + "-icon");
					oRm.addClass("sapSuiteUtiHeaderIcon");
					oRm.writeClasses();
					oRm.write(">");
					oRm.renderControl(oControl._oIcon);
					oRm.write("</div>");
				}
				oRm.write("<div");
				oRm.writeAttribute("id", oControl.getId() + "-content");
				if (oControl._oIcon) {
					oRm.addClass("sapSuiteUtiHeaderContentWithIcon");
				} else {
					oRm.addClass("sapSuiteUtiHeaderContent");
				}
				oRm.writeClasses();
				oRm.write(">");
				oRm.renderControl(oControl.getObjectHeader());
				oRm.write("</div>");
				oRm.write("</div>");
			}
		});

		return new UnifiedThingInspector.Header(sId);
	};

	UnifiedThingInspector.prototype._isMasterPage = function () {
		return this._oNavContainer.getCurrentPage().getId().indexOf("-master-page") != -1;
	};

	UnifiedThingInspector.prototype.onkeydown = function (oEvent) {
		switch (oEvent.keyCode) {
			case KeyCodes.S:
				if ((this._altKey || oEvent.altKey) && this.getConfigurationVisible()) {
					this.$().find("button[id*='-settings-button']:visible").focus();
					oEvent.stopPropagation();
				}
				break;
			case KeyCodes.O:
				if ((this._altKey || oEvent.altKey) && this.getTransactionsVisible()) {
					this.$().find("button[id*='-transaction-button']:visible").focus();
					oEvent.stopPropagation();
				}
				break;
			case KeyCodes.K:
				if ((this._altKey || oEvent.altKey) && this.getActionsVisible()) {
					this.$().find("button[id*='-action-button']:visible").focus();
					oEvent.stopPropagation();
				}
				break;
			case KeyCodes.ALT:
				this._altKey = true;
				break;
			default:
				break;
		}
	};

	UnifiedThingInspector.prototype.onkeyup = function (oEvent) {
		if (KeyCodes.ALT == oEvent.keyCode) {
			this._altKey = false;
		}
	};

	return UnifiedThingInspector;
});
