sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/suite/ui/commons/library",
	"sap/ui/core/Control",
	"sap/ui/core/theming/Parameters",
	"sap/m/Panel",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/FlexBox",
	"sap/m/Label",
	"sap/ui/model/Filter",
	"sap/m/SearchField",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/CheckBox",
	"sap/m/Title",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Text",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/ui/model/FilterOperator",
	"sap/base/security/encodeXML",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/core/Core",
	"sap/ui/core/Configuration",
	"./TAccountUtils",
	"./TAccountPanelRenderer",
	"sap/m/library",
	"sap/ui/thirdparty/bignumber"
], function (jQuery, library, Control, Parameters, Panel, JSONModel, Dialog, Button, FlexBox, Label, Filter, SearchField, List, StandardListItem, CheckBox, Title, Toolbar,
			 ToolbarSpacer, Text, SegmentedButton, SegmentedButtonItem, FilterOperator, encodeXML, NumberFormat, Core, Configuration, TAccountUtils, TAccountPanelRenderer, MobileLibrary, BigNumber) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = MobileLibrary.ButtonType;

	var oResourceBundle = Core.getLibraryResourceBundle("sap.suite.ui.commons");

	var PanelState = library.taccount.TAccountPanelState;

	/**
	 * Constructor for a new TAccountPanel.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A panel that acts as a container for {@link sap.suite.ui.commons.TAccountGroup} controls included in it.<br>
	 * The settings dialog of the panel can be used to modify how the {@link sap.suite.ui.commons.TAccountItem} elements
	 * in the included T accounts are displayed.
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
	 * @alias sap.suite.ui.commons.taccount.TAccountPanel
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) design time metamodel.
	 */
	var TAccountPanel = Panel.extend("sap.suite.ui.commons.taccount.TAccountPanel", {
		metadata: {
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * Title of the panel.
				 */
				title: {type: "string", group: "Misc", defaultValue: null},
				/**
				 * State of the panel that defines how T accounts are displayed.<br>
				 * By default, the T accounts included in the panel are displayed as T shapes with debit and credit entries on either side of the T.
				 */
				state: {
					type: "sap.suite.ui.commons.taccount.TAccountPanelState",
					group: "Misc",
					defaultValue: "Default"
				},
				/**
				 * Indicates whether the T account panel should be covered by a translucent overlay screen.<br>
				 * This overlay screen can be used to hide the data temporarily.
				 */
				showOverlay: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},
				/**
				* Integer value defining the maximum number of fraction digits
				* @since 1.92
				*/
				 maxFractionDigits: {
					 type: "int",
					 group: "Misc",
					 defaultValue: 2
				}
			},
			aggregations: {
				/**
				 * Properties of the T-account entries that can be shown or hidden using the panel's settings dialog.
				 */
				properties: {
					type: "sap.suite.ui.commons.taccount.TAccountItemProperty", multiple: true, singularName: "property"
				},
				/**
				 * Table that can be used to display additional data.
				 */
				table: {
					type: "sap.ui.core.Control", multiple: false
				}
			},
			events: {
				/**
				 * This event is fired when the user switches between T account view and table view.
				 */
				stateChanged: {
					parameters: {
						/**
						 * Type of current state
						 */
						state: "sap.suite.ui.commons.taccount.TAccountPanelState"
					}
				},
				/**
				 * This event is fired when the panel's settings are applied.
				 */
				settingsApplied: {
					parameters: {
						/**
						 * Hash map witch changed properties
						 */
						properties: "object"
					}
				}
			}
		}
	});

	/* =========================================================== */
	/* Events													   */
	/* =========================================================== */
	TAccountPanel.prototype.init = function () {
		this._bDisplayLabels = true;
	};

	TAccountPanel.prototype.onBeforeRendering = function () {
		this._oSum = null;
		this._bRendered = false;

		this._prepareProperties();
		this._createToolbar();
	};

	TAccountPanel.prototype.onAfterRendering = function () {
		var $this = this.$();

		this._switchContent(this.getState() === PanelState.Table);
		this._bRendered = true;

		$this.attr("aria-label", this._getAriaLabelText());
		$this.addClass("sapSuiteUiCommonsAccountPanel");

		this._setTotalBalanceTitle();
	};

	/* =========================================================== */
	/* Public API												   */
	/* =========================================================== */
	/**
	 * Gets the sum of transactions in all T-account groups included in the panel.<br>
	 *
	 * Returns a sum object that is structured as follows:<br>
	 *  <code>{</code><br>
	 *   <code>measure: {string}</code> Unit of measurement of the T accounts. If T accounts use different units of measurements, the last one is returned.<br>
	 *   <code>sum: {number}</code> Sum of all entries in the T accounts and T-account groups included in the panel.<br>
	 *   <code>correct: {boolean}</code> If <code>false</code>, the sum cannot be calculated, because the T accounts use different units of measurement.<br>
	 *  <code>}</code><br>
	 *
	 * @public
	 * @returns {Object} Object that includes the sum of entries in all included T-account groups.
	 */
	TAccountPanel.prototype.getSum = function () {
		var iSum = new BigNumber("0"),
			sMeasure = "",
			bCorrect = true,
			aContent = this.getContent();

		if (!this._oSum) {
			for (var i = 0; i < aContent.length; i++) {
				var oGroup = aContent[i];
				if (oGroup instanceof sap.suite.ui.commons.taccount.TAccountGroup) {
					var oSum = oGroup._getSum();

					if ((sMeasure && sMeasure !== oSum.measure) || !oSum.correct) {
						bCorrect = false;
						break;
					}

					sMeasure = oSum.measure;
					iSum = iSum.plus(oSum.sum);
				}
			}

			this._oSum = {
				measure: sMeasure,
				sum: iSum || 0,
				correct: bCorrect
			};
		}

		return this._oSum;
	};

	/**
	 * Switches the content displayed in the panel to either table view or T-account view.
	 * @param showTable {boolean} Defines whether to show accounts as tables (<code>true</code>) or standard T accounts.
	 * @public
	 */
	TAccountPanel.prototype.switchContent = function (showTable) {
		var sState = showTable ? PanelState.Table : PanelState.Default;

		this._switchContent(showTable);
		this.setProperty("state", sState, true);
	};

	/**
	 * Returns the settings dialog of the panel.
	 * @public
	 */
	TAccountPanel.prototype.getSettingsDialog = function () {
		return this._getPopover();
	};

	/**
	 * Returns the panel's toolbar, so the app can modify it.
	 * @public
	 */
	TAccountPanel.prototype.getToolbar = function () {
		return this._getToolbar();
	};

	/**
	 * Opens the settings dialog of the panel.
	 * @public
	 */
	TAccountPanel.prototype.openSettings = function () {
		this._oSelectAllCheckBox && this._oSelectAllCheckBox.setText(this._getSelectAllText());
		this._getPopover().open();
	};

	/**
	 * Resets the internal state of the T account group.
	 * @public
	 * @since 1.68
	 */
	TAccountPanel.prototype.reset = function() {
		this._oSum = null;
		if (this._oPopover) {
			this._oPopover.destroy();
			this._oPopover = null;
		}
	};

	/* =========================================================== */
	/* Setters & getters										   	   */
	/* =========================================================== */
	TAccountPanel.prototype.setState = function (sValue) {
		var bShowTable = sValue === PanelState.Table;

		this._switchContent(bShowTable);
		this.setProperty("state", sValue, true);

		return this;
	};

	/* =========================================================== */
	/* Private methods										   	   */
	/* =========================================================== */
	TAccountPanel.prototype.updateBindingContext = function () {
		this.reset();
		return Control.prototype.updateBindingContext.apply(this, arguments);
	};

	TAccountPanel.prototype._switchContent = function (bShowTable) {
		var sState = bShowTable ? PanelState.Table : PanelState.Default;

		this.$("table")[bShowTable ? "show" : "hide"]();
		this.$("datacontent")[bShowTable ? "hide" : "show"]();

		if (this._oDisplaySwitcher) {
			this._oDisplaySwitcher.setSelectedKey(sState);
		}
	};

	TAccountPanel.prototype._prepareProperties = function () {
		this._mProperties = {};

		this.getProperties().forEach(function (oProperty) {
			var sKey = oProperty.getKey();
			if (sKey) {
				this._mProperties[sKey] = oProperty;
			}
		}.bind(this));
	};

	TAccountPanel.prototype._setPropertiesVisibility = function (oChangedProperties) {
		var $this = this.$();

		Object.keys(oChangedProperties).forEach(function (sKey) {
			var oProperty = oChangedProperties[sKey],
				aItems = $this.find(".sapSuiteUiCommonsAccountPropertyWrapper[key=" + sKey + "]");

			aItems.each(function (i, oItem) {
				var bVisible = oProperty.getVisible(),
					oCurrentItem = Core.byId(oItem.id);

				if (oCurrentItem) {
					oCurrentItem.setProperty("visible", bVisible, true);
					oCurrentItem.getParent()._refreshAriaLabel();
				}

				jQuery(oItem)[bVisible ? "show" : "hide"]();
			});
		});

		$this.find(".sapSuiteUiCommonsAccountItemLabel")[this._bDisplayLabels ? "show" : "hide"]();
	};

	TAccountPanel.prototype._getPopover = function () {
		if (!this._oPopover) {
			this._createPopover();
		}

		return this._oPopover;
	};

	TAccountPanel.prototype._getSelectAllText = function (iSelectedCount) {
		var aProperties = this.getProperties();

		if (!iSelectedCount && iSelectedCount !== 0) {
			iSelectedCount = aProperties.reduce(function (accumulator, oProperty) {
				return accumulator + (oProperty.getVisible() ? 1 : 0);
			}, 0);
		}

		this._iSelectedCount = iSelectedCount;

		return oResourceBundle.getText("TACCOUNT_SELECTALL") + " (" + iSelectedCount + "/" + aProperties.length + ")";
	};

	TAccountPanel.prototype._createPopover = function () {
		var that = this,
			bDialogHeightSet = false;

		if (!this._oPopover) {
			this._oPopover = new Dialog({
				contentWidth: "450px",
				title: oResourceBundle.getText("TACCOUNT_DISPLAYOPTIONS"),
				afterOpen: function () {
					if (!bDialogHeightSet) {
						var iHeight = that._oPopover.$().height();
						that._oPopover.setProperty("contentHeight", iHeight + "px", true);
						bDialogHeightSet = true;
					}
				}
			});
		}
		this._oPopover.setEndButton(new Button({
			text: oResourceBundle.getText("TACCOUNT_CANCEL"),
			press: function (oEvent) {
				that._oPopover.close();
			}
		}));

		this._oPopover.setBeginButton(new Button({
				text: oResourceBundle.getText("TACCOUNT_OK"),
				type: ButtonType.Emphasized,
				press: function (oEvent) {
					var aContexts = oList.getSelectedContexts(true),
						oListModel = oList.getModel();

					var oVisible = {},
						oChanged = {};

					// contexts contains all checked rows
					aContexts.forEach(function (oContext) {
						var oItem = oListModel.getProperty(oContext.sPath);
						if (oItem) {
							var oProperty = that._mProperties[oItem.key];
							oVisible[oItem.key] = 1;

							if (oProperty && !oProperty.getVisible()) {
								oProperty.setProperty("visible", true, true);
								oChanged[oItem.key] = oProperty;
							}
						}
					});

					Object.keys(that._mProperties).forEach(function (sKey) {
						var oItem = that._mProperties[sKey];
						if (oItem.getVisible() && !oVisible[sKey]) {
							oItem.setProperty("visible", false, true);
							oChanged[sKey] = oItem;
						}
					});

					that._bDisplayLabels = oDisplayLabels.getSelected();

					if (that.fireEvent("settingsApplied", {
						properties: oChanged
					}, true)) {
						that._setPropertiesVisibility(oChanged);
					}

					that._oPopover.close();
				}
			})
		);

		this._oPopover.removeAllContent();

		// main container
		var oWrapper = new FlexBox({
			width: "100%",
			renderType: "Bare",
			direction: "Column"
		});
		this._oPopover.addContent(oWrapper);

		var oDisplayLabels = new CheckBox({
			selected: this._bDisplayLabels
		}).addStyleClass("sapUiTinyMarginBegin");

		// show labels
		var oShowLabelsWrapper = new FlexBox({
			renderType: "Bare",
			alignItems: "Center",
			items: [oDisplayLabels,
				new Label({
					text: "Show labels"
				}).addStyleClass("sapUiTinyMarginBegin")]
		}).addStyleClass("sapUiTinyMarginBottom sapUiTinyMarginTop");
		oWrapper.addItem(oShowLabelsWrapper);

		// search button
		var fnSearch = function (oEvent) {
			var aFilters = [],
				sQuery = oEvent.getSource().getValue();

			if (sQuery && sQuery.length > 0) {
				aFilters.push(new Filter("title", FilterOperator.Contains, sQuery));
			}

			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilters, "Application");
		};

		var oSearch = new SearchField({
			width: "100%",
			liveChange: fnSearch
		}).addStyleClass("sapSuiteUiCommonsAccountsPopupSearch");
		oWrapper.addItem(oSearch);

		// columns list
		var oList = new List({
			width: "100%",
			mode: "MultiSelect",
			includeItemInSelection: true,
			selectionChange: function (oEvt) {
				var bSelected = oEvt.getParameter("listItem").getSelected();
				that._oSelectAllCheckBox.setText(that._getSelectAllText(that._iSelectedCount + (bSelected ? 1 : -1)));
				that._oSelectAllCheckBox.setSelected(aProperties.length === that._iSelectedCount);
			}
		}).addStyleClass("sapSuiteUiCommonsAccountsPopupList");

		oList.bindAggregation("items", {
			path: "/items",
			template: new StandardListItem({
				title: "{title}",
				selected: "{selected}"
			})
		});

		var aProperties = this.getProperties(),
			sText = this._getSelectAllText();

		// select all button
		this._oSelectAllCheckBox = new CheckBox({
			selected: aProperties.length === that._iSelectedCount,
			text: sText,
			select: function (oEvt) {
				var bSelected = oEvt.getSource().getSelected();

				that._oSelectAllCheckBox.setText(that._getSelectAllText(bSelected ? aProperties.length : 0));
				oList.getItems().forEach(function (oItem) {
					oItem.setSelected(bSelected);
				});
			}
		}).addStyleClass("sapUiTinyMarginBegin sapUiTinyMarginEnd sapSuiteUiCommonsAccountsPopupSelectAll");

		var oSelectAllWrapper = new FlexBox({
			renderType: "Bare",
			alignItems: "Center"
		}).addStyleClass("sapSuiteUiCommonsAccountsPopupSelectAllWrapper");

		oSelectAllWrapper.addItem(this._oSelectAllCheckBox);
		oWrapper.addItem(oSelectAllWrapper);
		oWrapper.addItem(oList);

		// create model for list
		var aData = [];
		aProperties.forEach(function (oProperty) {
			aData.push({
				title: oProperty._getLabel(),
				key: oProperty.getKey(),
				selected: oProperty.getVisible()
			});
		});

		oList.setModel(new JSONModel({
			items: aData
		}));

		return this._oPopover;
	};

	TAccountPanel.prototype._getToolbar = function () {
		if (!this._oToolbar) {
			this._createToolbar();
		}

		return this._oToolbar;
	};

	TAccountPanel.prototype._createToolbar = function () {
		var that = this;

		if (this._oToolbar) {
			return;
		}

		this._oToolbar = new Toolbar();

		this._oToolbar.addContent(new Title(this.getId() + "-toolbartitle", {
			text: this.getTitle()
		}));

		this._oToolbar.addContent(new ToolbarSpacer(this.getId() + "-toolbarspacer"));

		this._oToolbar.addContent(new Text(this.getId() + "-toolbarbalancelabel", {
			wrapping: false,
			text: oResourceBundle.getText("TACCOUNT_TOTALBALANCE") + ":"
		}).addStyleClass("sapSuiteUiCommonsAccountPanelLabel"));

		this._oToolbar.addContent(new Text(this.getId() + "-toolbarsumtitle", {
			wrapping: false
		}).addStyleClass("sapSuiteUiCommonsAccountPanelSum"));

		this._oDisplaySwitcher = new SegmentedButton(this.getId() + "-toolbarswitcher", {
			selectionChange: function (oEvent) {
				var oItem = Core.byId(that._oDisplaySwitcher.getSelectedItem());
				if (oItem) {
					that.switchContent(oItem.getKey() === PanelState.Table);
					that.fireStateChanged({
						state: oItem.getKey()
					});
				}
			},
			items: [new SegmentedButtonItem({
				key: PanelState.Default,
				tooltip: oResourceBundle.getText("TACCOUNT_DEFAULT"),
				icon: "sap-icon://screen-split-two"
			}),
				new SegmentedButtonItem({
					key: PanelState.Table,
					tooltip: oResourceBundle.getText("TACCOUNT_TABLE"),
					icon: "sap-icon://table-chart"
				})]
		});

		this._oToolbar.addContent(this._oDisplaySwitcher);

		this._oToolbar.addContent(new Button(this.getId() + "-toolbarsettings", {
			icon: "sap-icon://action-settings",
			press: this.openSettings.bind(this)
		}));

		this.setHeaderToolbar(this._oToolbar);
	};

	TAccountPanel.prototype._getSumText = function () {
		var oSum = this.getSum();

		if (!oSum.correct) {
			return " - ";
		}

		return TAccountUtils.formatCurrency(Math.abs(oSum.sum), oSum.measure, this.getMaxFractionDigits()) + " " + encodeXML(oSum.measure);
	};

	TAccountPanel.prototype._setTotalBalanceTitle = function () {
		var oSum = this.getSum(),
			sTitle = "";

		if (!oSum.correct || oSum.sum.isEqualTo(0)) {
			sTitle = oResourceBundle.getText("TACCOUNT_TOTALBALANCE");
		} else {
			sTitle = oSum.sum.isGreaterThan(0) ? oResourceBundle.getText("TACCOUNT_TOTALCREDIT") : oResourceBundle.getText("TACCOUNT_TOTALDEBIT");
		}

		this.$("toolbarbalancelabel").text(sTitle + ":");
		this.$("toolbarsumtitle").text(this._getSumText());
	};

	TAccountPanel.prototype._getAriaLabelText = function () {
		return "T account panel " + this.getTitle() + " " + this._getSumText();
	};

	TAccountPanel.prototype._recalculate = function () {
		this._oSum = null;
		this._oSum = this.getSum();

		this._setTotalBalanceTitle();
	};

	TAccountPanel.prototype._valueChanged = function (iDiff, bIsDebit) {
		var oSum = this.getSum();
		if (oSum.correct) {
			if (bIsDebit){
				this._oSum.sum = this._oSum.sum.minus(iDiff);
			} else {
				this._oSum.sum = this._oSum.sum.plus(iDiff);
			}
		}

		this._setTotalBalanceTitle();
	};

	TAccountPanel.prototype.setShowOverlay = function (bValue) {
		this.setProperty("showOverlay", bValue, true);
		this.$("overlay")[bValue ? "addClass" : "removeClass"]("sapSuiteUiCommonsAccountPanelOverlayVisible");
	};

	TAccountPanel.prototype._setInvalid = function () {
		if (this._oSum) {
			this._oSum.correct = false;
			this._setTotalBalanceTitle();
		}
	};

	TAccountPanel.prototype.invalidate = function () {
		this._bRendered = false;
		Control.prototype.invalidate.apply(this, arguments);
	};

	return TAccountPanel;

});
