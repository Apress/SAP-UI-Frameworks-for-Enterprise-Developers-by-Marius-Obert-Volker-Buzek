/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

// Provides control sap.ui.comp.filterbar.FilterBar.
sap.ui.define([
	"sap/ui/core/library",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/Panel",
	"sap/m/Text",
	"sap/m/OverflowToolbar",
	"sap/m/ToolbarSpacer",
	"sap/ui/Device",
	"sap/ui/comp/state/UIState",
	"./VariantConverterFrom",
	"./VariantConverterTo",
	"sap/ui/comp/smartvariants/PersonalizableInfo",
	"sap/ui/comp/smartvariants/SmartVariantManagementUi2",
	"sap/ui/core/InvisibleText",
	"sap/ui/layout/Grid",
	"sap/ui/layout/GridRenderer",
	"sap/ui/layout/GridData",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/layout/AlignedFlowLayout",
	"sap/m/library",
	"sap/ui/model/json/JSONModel",
	"./FilterGroupItem",
	"sap/base/Log",
	"sap/base/util/merge",
	"sap/ui/core/ShortcutHintsMixin",
	"sap/base/util/Deferred",
	'sap/m/delegate/ValueStateMessage',
	"sap/m/ToolbarSeparator",
	"sap/ui/layout/form/Form",
	"sap/ui/core/Configuration"
], function(
	coreLib,
	Button,
	Label,
	Panel,
	Text,
	OverflowToolbar,
	ToolbarSpacer,
	Device,
	UIState,
	VariantConverterFrom,
	VariantConverterTo,
	PersonalizableInfo,
	SmartVariantManagementUi2,
	InvisibleText,
	Grid,
	GridRenderer,
	GridData,
	HorizontalLayout,
	VerticalLayout,
	AlignedFlowLayout,
	mLibrary,
	JSONModel,
	FilterGroupItem,
	Log,
	merge,
	ShortcutHintsMixin,
	Deferred,
	ValueStateMessage,
	ToolbarSeparator,
	Form,
	Configuration
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLib.ValueState;

	var SymbolValidationWarningMessage = sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("SEARCH_FIELD_VALIDATION_WARNING_MESSAGE");

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLib.TextAlign;

	// shortcut for sap.m.ButtonType
	var ButtonType = mLibrary.ButtonType;

	var ToolbarSeparator;
	var Form;
	var FormContainer;
	var FormElement;
	var ResponsiveGridLayout;

	/**
	 * Constructor for a new FilterBar.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class
	 * The <code>FilterBar</code> displays filters in a user-friendly manner to populate values for a query. The
	 * <code>FilterBar</code> consists of a row containing the {@link sap.ui.comp.variants.VariantManagement <code>VariantManagement</code>}
	 * control, the related buttons, and an area underneath displaying the filters.
	 *
	 * The filters are arranged in a logical row that is divided depending on the space available and the width of the filters.
	 * The area containing the filters can be hidden or shown using the <b>Hide FilterBar</b> / <b>Show FilterBar</b> button.
	 * The <b>Go</b> button triggers the search event, and the <b>Adapt Filters</b> button shows the <code>Adapt Filters Dialog</code>.
	 *
	 * In this dialog, the user has full control over the <code>FilterBar</code>.

	 * @extends sap.ui.layout.Grid
	 * @author SAP
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.filterbar.FilterBar
	 * @see {@link topic:2ae520a67c44495ab5dbc69668c47a7f Filter Bar}
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/filter-bar/ Filter Bar}
	 */
	var FilterBar = Grid.extend("sap.ui.comp.filterbar.FilterBar", /** @lends sap.ui.comp.filterbar.FilterBar.prototype */
	{
		metadata: {

			library: "sap.ui.comp",
			designtime: "sap/ui/comp/designtime/filterbar/FilterBar.designtime",
			properties: {

				/**
				 * Key used to access personalization data. Only if the persistencyKey is provided, will the <code>VariantManagement</code> control
				 * be used.
				 */
				persistencyKey: {
					type: "string",
					group: "Misc",
					defaultValue: ""
				},

				/**
				 * The advanced mode is only relevant for the value help scenario. UI representation is different from the standard FilterBar.
				 */
				advancedMode: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Collapses/expands the advanced area.
				 * @deprecated Since version 1.30.0. Replaced by property <code>filterBarExpanded</code> This property is mapped to the
				 *             filterBarExpanded property.
				 */
				expandAdvancedArea: {
					type: "boolean",
					group: "Misc",
					defaultValue: false,
					deprecated: true
				},

				/**
				 * Enables/disables the Search button.
				 * @deprecated Since version 1.32.0.
				 */
				searchEnabled: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Shows the filters area. When property <code>useToolbar</code> is set to <code>false</code>, <code>filterBarExpanded</code>
				 * is set to <code>true</code> automatically.
				 * <b>Note:</b> When <code>SmartFilterBar</code> is used inside a <code>ValueHelpDialog</code>, it is initially collapsed. The filter bar is
				 * initially expanded in the following cases:
				 *
				 * - When there is no basic search field.
				 * - When <code>preventInitialDataFetchInValueHelpDialog</code> is set to <code>true</code> or the <code>fetchValues</code> property of the <code>valueList</code> annotation is set to <code>2</code>.
				 * - When there are mandatory fields, all fields are expanded (not only the first 7).
				 * @since 1.26.1
				 */
				filterBarExpanded: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * If this property is set, then the label for filters will be prefixed with the group title.
				 * @since 1.28.0
				 */
				considerGroupTitle: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Handles visibility of the Clear button on the Filters dialog.
				 * @deprecated Since 1.84
				 */
				showClearButton: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Handles visibility of the "Restore" button on the "Filters" dialog. <b>Note:</b> Restore works only automatically when a property
				 * <code>persistencyKey</code> is set and therefore Variant Management is used. In all other cases the "restore" behavior needs to
				 * be implemented by the app, based on the event <code>reset</code>.
				 * Since 1.84 the "Restore" button text is changed to "Reset"
				 * @since 1.26.1
				 */
				showRestoreButton: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Handles visibility of the Go button on the FilterBar.
				 * @since 1.28.0
				 */
				showGoOnFB: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Handles visibility of the Restore button on the FilterBar.
				 * @since 1.28.0
				 */
				showRestoreOnFB: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Handles visibility of the Clear button on the FilterBar.
				 * @since 1.28.0
				 */
				showClearOnFB: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Handles visibility of the Go button on the FilterBar.
				 * @since 1.26.1
				 * @deprecated Since version 1.28.0. Replaced by property <code>showGoOnFB</code>
				 */
				showGoButton: {
					type: "boolean",
					group: "Misc",
					defaultValue: null,
					deprecated: true
				},

				/**
				 * Stores the delta as compared to the standard variant.
				 * @since 1.34.0
				 */
				deltaVariantMode: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Sets the width of the filters container.
				 * @since 1.34.0
				 */
				filterContainerWidth: {
					type: "string",
					group: "Misc",
					defaultValue: "12rem"
				},

				/**
				 * Determines what design is used. Default is the design with toolbar.
				 * If the property <code>useToolbar</code> is set to <code>false</code>,
				 * the property <code>filterBarExpanded</code> is set to <code>true</code> automatically.
				 * <b>Note:</b><br>
				 * If set to <code>false</code>, the <code>VariantManagement</code> control is not available at all.
				 * This scenario is only intended for the {@link sap.ui.comp.smartfilterbar.SmartFilterBar}.
				 * @since 1.38.0
				 */
				useToolbar: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Specifies header text that is shown in the toolbar on the first position. This property is ignored, when <code>useToolbar</code>
				 * is set to <code>false</code>.
				 * @since 1.38.0
				 */
				header: {
					type: "string",
					group: "Misc",
					defaultValue: ""
				},

				/**
				 * Handles visibility of the Filters button on the FilterBar.
				 * @since 1.38.0
				 */
				showFilterConfiguration: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Determines the behavior when <code>reset</code> is executed. <br>
				 * <b>Note:</b> This property is only relevant if no variant management is used, and the filter bar is not used in the advanced mode.
				 * A snapshot shows the current state of the filter bar, just before the Filters dialog is opened.
				 * <ul>
				 * <li><code>undefined</code> (default) defines the standard behavior: snapshot will be applied after <code>reset</code> was
				 * triggered</li>
				 * <li><code>false</code> defines that the snapshot will not be applied</li>
				 * <li><code>true</code>is not considered at all</li>
				 * </ul>
				 * @since 1.44
				 */
				useSnapshot: {
					type: "boolean",
					group: "Misc"
				},
				/**
				 * Sets whether the filter bar should look like the filters area in a ValueHelpDialog.
				 * True for SmartFilterBar when used in a ValueHelpDialog. False otherwise.
				 */
				isRunningInValueHelpDialog: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},
				/**
				 * Disables the warning for special symbols.
				 *
				 * <b>Note:</b> Changing the values here after the SmartFilter is initialized (<code>initialise</code>
				 * event was fired) has no effect.
				 * @since 1.102
				 */
				disableSearchMatchesPatternWarning: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				}
			},
			aggregations: {

				/**
				 * Filters belonging to the basic group.
				 * @deprecated Since version 1.48.0. Use aggregation <code>filterGroupItems</code> instead.
				 */
				filterItems: {
					type: "sap.ui.comp.filterbar.FilterItem",
					multiple: true,
					singularName: "filterItem"
				},

				/**
				 * Contains all FilterBar filters. <br>
				 * <code>Note:</code>In case a filter has to be added to the basic group
				 * <ul>
				 * <li>the property <code>groupName</code> has to be set to the constant
				 * <code>sap.ui.comp.filterbar.FilterBar.INTERNAL_GROUP</code></li>
				 * <li>the property <code>groupLabel</code> will be handled internally and will be ignored, if set</li>
				 * <li>the property <code>partOfCurrentVariant</code> has to be set to <code>true</code></li>
				 * <li>if the property <code>visibleInFilterBar</code> is set to <code>true</code>, the property
				 * <code>partOfCurrentVariant</code> will be set internally also to <code>true</code></li>
				 * </ul>
				 */
				filterGroupItems: {
					type: "sap.ui.comp.filterbar.FilterGroupItem",
					multiple: true,
					singularName: "filterGroupItem"
				},

				/**
				 * Special handling for analytic parameters.
				 */
				_parameters: {
					type: "sap.ui.comp.filterbar.FilterGroupItem",
					multiple: true,
					singularName: "_parameter",
					visibility: "hidden"
				}
			},
			associations: {

				/**
				 * Populates the basic search area on the FilterBar and the Filters dialog.
				 * @since 1.30.0
				 */
				basicSearch: {
					type: "sap.m.SearchField",
					multiple: false
				}
			},
			events: {

				/**
				 * This event is fired when the Cancel button on the Filters dialog is pressed and the variant is marked as dirty.
				 */
				cancel: {},

				/**
				 * This event is fired when the Restore button is pressed.
				 */
				reset: {
					parameters: {
						/**
						 * Visible controls
						 */
						selectionSet: {
							type: "sap.ui.core.Control[]"
						}
					}
				},

				/**
				 * This event is fired when the Go button is pressed.
				 */
				search: {
					parameters: {
						/**
						 * Visible controls
						 */
						selectionSet: {
							type: "sap.ui.core.Control[]"
						},

						/**
						 * Is event fired due to user action in FilterBar
						 *
						 * @since 1.107
						 */
						firedFromFilterBar: {
							type: "boolean"
						}
					}
				},

				/**
				 * This event is fired before a variant is saved. The event can be used to adapt the data of the custom filters, which will be saved
				 * as variant later.
				 * @deprecated Since version 1.48.2. Replaced by the event <code>beforeVariantFetch</code>
				 */
				beforeVariantSave: {
					parameters: {
						/**
						 * Context of the event. Can also be <code>null</code> or <code>undefined</code>
						 */
						context: {
							type: "string"
						}
					}
				},

				/**
				 * This event is fired before a variant is fetched.
				 * @since 1.28.13
				 */
				beforeVariantFetch: {},

				/**
				 * This event is fired after a variant has been loaded and applied to the FilterBar. The event can be used to adapt custom filters
				 * with data from the variant.
				 */
				afterVariantLoad: {
					parameters: {
						/**
						 * Context of the event. Can also be <code>null</code> or <code>undefined</code>
						 */
						context: {
							type: "string"
						},
						/**
						 * executeOnSelect indicates if the variant will trigger search
						 * @since 1.44.0
						 */
						executeOnSelect: {
							type: "boolean"
						}
					}
				},

				/**
				 * This event is fired when a filter or multiple filters has changed.
				 */
				filterChange: {
					parameters: {
						/**
						 * This property is provided, whenever a filter is added via the add/remove filters dialog.
						 */
						added: {
							type: "sap.ui.core.Control"
						},
						/**
						 * This property is provided, whenever a filter is removed via the add/remove filters dialog.
						 */
						deleted: {
							type: "sap.ui.core.Control"
						},

						/**
						 * The filter item is only provided along with added or deleted properties.
						 */
						filterItem: {
							type: "sap.ui.comp.filterbar.FilterGroupItem"
						}
					}
				},

				/**
				 * This event is fired when the Clear button is pressed. The consumer has to clear all filters.
				 */
				clear: {
					parameters: {
						/**
						 * Visible controls
						 */
						selectionSet: {
							type: "sap.ui.core.Control[]"
						}
					}
				},

				/**
				 * This event is fired when the FilterBar is initialized to indicate that metadata are available.
				 */
				initialise: {},

				/**
				 * This event is fired after the <code>FilterBar</code> has been initialized, the user's default variant has been applied, and a
				 * stable filter state has been achieved. With this event all relevant filter information, for example, for navigation-related
				 * actions, is available via {@link sap.ui.comp.filterbar.FilterBar#getUiState}.
				 * @since 1.38.0
				 */
				initialized: {},

				/**
				 * This event is fired after a variant has been saved.
				 */
				afterVariantSave: {},

				/**
				 * This event is fired after the filters dialog is closed.
				 * @since 1.34.0
				 */
				filtersDialogClosed: {
					parameters: {
						/**
						 * Context of the event. Can also be <code>null</code> or <code>undefined</code>
						 */
						context: {
							type: "string"
						}
					}
				},

				/**
				 * This event is fired after the filters dialog is opened.
				 * @since 1.48.0
				 */
				filtersDialogBeforeOpen: {},

				/**
				 * This event is fired when the Go button on the filters dialog is pressed.
				 * @since 1.48.0
				 * @deprecated Since version 1.84
				 */
				filtersDialogSearch: {},

				/**
				 * This event is fired when the Cancel button on the filters dialog is pressed.
				 * @since 1.48.0
				 */
				filtersDialogCancel: {},

				/**
				 * This event is fired when search field of the filter dialog is changed.
				 * @since 1.48.0
				 * @deprecated Since version 1.84
				 */
				filtersDialogSearchForFilters: {
					parameters: {

						/**
						 * Contains the entered search filed value
						 */
						newValue: {
							type: "string"
						}
					}

				},

				/**
				 * This event is fired when the filters information has changed. It indicates specifically that the count of assigned filters may be
				 * changed. One of the intended reaction to this event would be to call <code>retrieveFiltersWithValuesAsText</code> method.
				 * @since 1.38.0
				 */
				assignedFiltersChanged: {}
			}
		},

		renderer: {
			apiVersion: 2
		}
	});

	FilterBar.INTERNAL_GROUP = "__$INTERNAL$";

	/**
	 * Initializes the FilterBar control.
	 * @private
	 */
	FilterBar.prototype.init = function() {
		var sDefaultFilterContainerWidth = this.getFilterContainerWidth();

		// Call grid init method
		Grid.prototype.init.apply(this, arguments);
		this._filterGroupItemChange = this._filterGroupItemChange.bind(this);
		this._filterItemChange = this._filterItemChange.bind(this, null);
		this._oBasicAreaLayout = null;
		this._oVariantManagement = null;
		this._oCollectiveSearch = null;

		this._aBasicAreaSelection = null;
		this._mAdvancedAreaFilter = null;
		this._mAdvancedAreaFilterFlat = [];
		this._aOrderedFilterItems = [];
		this._aAdaptFilterItems = [];
		this._mAdvancedAreaHiddenFilters = [];
		this._mAdaptFiltersDialogInitialItemsOrder = [];

		this._fRegisteredFetchData = null;
		this._fRegisteredApplyData = null;
		this._fRegisterGetFiltersWithValues = null;
		this._oHideShowButton = null;
		this._oShowAllFiltersButton = null;
		this._oSearchButton = null;
		this._oFiltersButton = null;
		this._oClearButtonOnFB = null;
		this._oRestoreButtonOnFB = null;

		this._bIsInitialized = false;
		this._bSearchFiredFromFilterBar = false;
		this._bMoveTriggered = false;
		this._bDelegateAdded = false;
		this._oInitializedDeferred = new Deferred();

		this._aFields = null;

		this._oBasicSearchField = null;

		this._oVariant = {};

		this._filterChangeSemaphore = true;
		this._triggerFilterChangeState = true;

		this._fRegisteredFilterChangeHandlers = null;
		this._fInitialiseVariants = null;

		this._bHostedVariantManagement = false;

		// Set default number of visible filters to 8
		this._nMaxFiltersByDefault = 8;

		this._bResetFiltersDialogTriggered = false;

		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp");

		this.setHSpacing(0);

		// Decorate control with needed CSS classes
		this.addStyleClass("sapUiCompFilterBar sapUiCompFilterBarMarginBottom sapUiCompFilterBarPaddingPanel sapContrastPlus");
		this.addStyleClass(this._isPhone() ? "sapUiCompFilterBarPhone" : "sapUiCompFilterBarNonPhone");

		this._oToolbar = this._createToolbar();
		this.addContent(this._oToolbar);

		this._bDelayRendering = true;
		this._bShowAllFilters = false;

		// Basic Area Layout
		this._oBasicAreaLayout = new AlignedFlowLayout();
		this._oBasicAreaLayout.setVisible(false);
		this._oBasicAreaLayout.setLayoutData(new GridData({
			span: "L12 M12 S12"
		}));
		this._oBasicAreaLayout.setMinItemWidth(sDefaultFilterContainerWidth);
		this._oBasicAreaLayout.setMaxItemWidth(sDefaultFilterContainerWidth);
		this.addContent(this._oBasicAreaLayout);

		// Advanced (TODO: create Panel only if really needed)
		this._oAdvancedPanel = new Panel();
		this._oAdvancedPanel.setLayoutData(new GridData({
			span: "L12 M12 S12"
		}));

		this._oAdvancedPanel.setVisible(false);
		this.addContent(this._oAdvancedPanel);

		this.oModel = new JSONModel({});
		this.setModel(this.oModel, "FilterBar");

		this._oHintText = new Text({
			text: this._oRb.getText("FILTER_BAR_NO_FILTERS_ON_FB"),
			textAlign: TextAlign.Center
		});
		this._oHintText.setVisible(false);
		this._oHintText.addStyleClass("sapUiCompFilterBarHint");

		if (this._isTablet() || this._isPhone()) {
			this.setFilterBarExpanded(false);
		}

		this.getMetadata().addPublicMethods("getInitializedPromise");
	};

	FilterBar.prototype.onBeforeRendering = function () {
		if (Grid.prototype.onBeforeRendering) {
			Grid.prototype.onBeforeRendering.apply(this, arguments);
		}

		if (this.getIsRunningInValueHelpDialog()) {

			if (this._isTablet()) {
				this.addStyleClass("compFilterBarTablet");
			}
			// If the filterbar has less than 4 filters, add additional empty layouts to simulate total of 4 filters
			// This is needed for resposive design spec
			this.iAddedContentLength = 4 - this._oBasicAreaLayout.getContent().length;
			var iLen = this.iAddedContentLength;
			if (iLen < 4 && iLen > 0 && !this._bLayoutAdded) {
				while (iLen > 0) {
					this._oBasicAreaLayout.addContent(new VerticalLayout().data("blankLayout", true));
					iLen--;
				}
				this._bLayoutAdded = true;
			}
			if (this._oShowAllFiltersButton === null) {
				this.initShowAllFiltersButton();
			}
			if (this._oBasicSearchField && this._oBasicSearchField.isA("sap.m.SearchField")) {
				this._oBasicSearchField.setWidth("100%");
			}
			this._oBasicAreaLayout.setMaxItemWidth(null);
			this._oAdvancedPanel.setVisible(false);
			this._rerenderFilters();
		} else if (this._oShowAllFiltersButton) {
			this._oBasicAreaLayout.removeEndContent(this._oShowAllFiltersButton);
			this._oShowAllFiltersButton = null;
		} else {
			this._oHideShowButton && this._oHideShowButton.addStyleClass("sapUiCompFilterBarPaddingRightBtn");
		}
	};

	FilterBar.prototype.getShowAllFiltersButton = function () {
		return this._oShowAllFiltersButton;
	};

	FilterBar.prototype.setFilterContainerWidth = function(sValue) {
		this._oBasicAreaLayout.setMinItemWidth(sValue);

		if (this.getUseToolbar()) {
			this._oBasicAreaLayout.setMaxItemWidth(this._oBasicAreaLayout.getMinItemWidth());
		} else {
			this._setMaxItemWidth2();
		}

		this.setProperty("filterContainerWidth", sValue);
		return this;
	};

	FilterBar.prototype._setMaxItemWidth2 = function() {
		var sDimension, nWidth, sValue = this._oBasicAreaLayout.getMinItemWidth();

		[
			"rem", "%", "px", "em"
		].some(function(sDim) {
			var i = sValue.indexOf(sDim);
			if (i > 0) {
				sValue = sValue.substring(0, i);
				sDimension = sDim;
				return true;
			}
			return false;
		});

		if (sDimension) {
			nWidth = parseInt(sValue);
			if (!isNaN(nWidth)) {
				nWidth *= 2;
				this._oBasicAreaLayout.setMaxItemWidth(nWidth + sDimension);
			}
		}
	};

	FilterBar.prototype._hasAnyVisibleFiltersOnFB = function() {

		var aItems = this._retrieveVisibleAdvancedItems();

		for (var i = 0; i < aItems.length; i++) {
			if (aItems[i].filterItem.getVisibleInFilterBar()) {
				return true;
			}
		}

		return false;
	};

	FilterBar.prototype._showHintText = function() {

		var i = 0;

		if (!this._oHintText) {
			return;
		}

		if (this._isNewFilterBarDesign()) {
			return;
		}

		if (!this.getAdvancedMode() && !this._isPhone()) {

			var bFlag = !this._hasAnyVisibleFiltersOnFB();

			if (bFlag) {
				i = this._oAdvancedPanel.indexOfContent(this._oHintText);
				if (i < 0) {
					this._oAdvancedPanel.insertContent(this._oHintText, 0);
				}
			}

			this._oHintText.setVisible(bFlag);
			this._oAdvancedPanel.setVisible(bFlag);

			if (!this._bDelayRendering) {
				this._oBasicAreaLayout.setVisible(!bFlag && this.getFilterBarExpanded());
			}
		}
	};

	FilterBar.prototype._hasRelevantFilters = function() {
		var i, n = null, oItem;

		if (!this._mAdvancedAreaFilter || (Object.keys(this._mAdvancedAreaFilter) < 1)) {
			return false;
		}

		if (this.getAdvancedMode()) {
			for (n in this._mAdvancedAreaFilter) {
				var oGroupElement = this._mAdvancedAreaFilter[n];
				if (oGroupElement && oGroupElement.items) {
					for (i = 0; i < oGroupElement.items.length; i++) {
						oItem = oGroupElement.items[i];
						if (oItem) {
							if (this._determineVisibility(oItem.filterItem)) {
								return true;
							}
						}
					}
				}
			}

			return false;
		}

		return true;
	};

	FilterBar.prototype._adaptButtonsEnablement = function() {

		var bFlag = false || !!this._mAdvancedAreaFilter;

		if (this._oHideShowButton) {
			this._oHideShowButton.setEnabled(bFlag);
			if (this.getAdvancedMode() && !this._isPhone()) {
				this._oHideShowButton.setVisible(this._hasRelevantFilters());
			}
		}
		this._oClearButtonOnFB.setEnabled(bFlag);
		this._oRestoreButtonOnFB.setEnabled(bFlag);
		this._oFiltersButton.setEnabled(bFlag);

		var bPhoneNonRelevant = true;
		if (this._isPhone() && this.getUseToolbar()) {
			bPhoneNonRelevant = false;
		}

		if (bFlag && this.getFilterBarExpanded() && bPhoneNonRelevant && !this.getAdvancedMode()) {
			this._oBasicAreaLayout.setVisible(true);
		}
	};

	/**
	 * Returns the associated VariantManagement control. The returned VariantManagement instance should not be cached or manipulated in any ways. It
	 * should offer the application a convenient way to verify the dirty state and to check for page variant scenario. The method may return
	 * <code>null</code> or a disabled VariantManagement control.
	 * @public
	 * @since 1.44.0
	 * @returns {sap.ui.comp.variants.VariantManagement} the associated VariantManagement control.
	 */
	FilterBar.prototype.getVariantManagement = function() {
		return this._oVariantManagement;
	};

	FilterBar.prototype.setShowClearOnFB = function(bFlag) {

		this.setProperty("showClearOnFB", bFlag);
		this._oClearButtonOnFB.setVisible(bFlag);

		return this;
	};

	FilterBar.prototype.setShowRestoreOnFB = function(bFlag) {

		this.setProperty("showRestoreOnFB", bFlag);
		this._oRestoreButtonOnFB.setVisible(bFlag);

		return this;
	};

	FilterBar.prototype.setShowGoOnFB = function(bFlag) {

		this.setProperty("showGoOnFB", bFlag);

		this._calcVisibilityGoButton();

		return this;
	};

	/**
	 * Handles the visibility of the Go button on FilterBar.
	 * @private
	 */
	FilterBar.prototype._calcVisibilityGoButton = function() {

		var bFlag = this.getShowGoOnFB();
		if (bFlag && !this._isPhone() && this.isLiveMode && this.isLiveMode()) {
			bFlag = false;
		}

		this._oSearchButton.setVisible(bFlag);
	};

	FilterBar.prototype.setShowGoButton = function(bFlag) {

		this.setShowGoOnFB(bFlag);

		return this;
	};

	FilterBar.prototype.getShowGoButton = function() {
		return this.getShowGoOnFB();
	};

	/**
	 * Hides the Go button on FilterBar. Allows to hide the Go-button for dedicated scenarios, like liveMode.
	 * @protected
	 * @since 1.40.4
	 */
	FilterBar.prototype.hideGoButton = function() {
		this._oSearchButton.setVisible(false);
	};

	/**
	 * Restores the visibility of the Go button on FilterBar. The visibility of the Go button will be set, according to the showGoOnFB property.
	 * @protected
	 * @since 1.40.4
	 */
	FilterBar.prototype.restoreGoButton = function() {
		this._oSearchButton.setVisible(this.getShowGoOnFB());
	};

	FilterBar.prototype.setShowFilterConfiguration = function(bFlag) {
		this.setProperty("showFilterConfiguration", bFlag);

		if (this._oFiltersButton) {
			this._oFiltersButton.setVisible(bFlag);
		}

		return this;
	};

	/**
	 * Determines if the current variant is the standard variant
	 * @public
	 * @since 1.44.0
	 * @returns {boolean| undefined} indicates if the current variant is the standard variant. In case the variant management does not exists,
	 *          <code>undefined</code> is returned.
	 */
	FilterBar.prototype.isCurrentVariantStandard = function() {

		var sKey;
		if (this._oVariantManagement) {
			sKey = this._oVariantManagement.getCurrentVariantId();
			if (sKey === "") {
				return true;
			}
			return (sKey === this._oVariantManagement.getStandardVariantKey());
		}

		return undefined;
	};

	/**
	 * Sets the current variant ID.
	 * @public
	 * @since 1.28.0
	 * @param {string} sVariantId ID of the variant
	 * @param {boolean} bDoNotApplyVariant If set to <code>true</code>, the <code>applyVariant</code> method is not executed yet. Relevant during
	 *        navigation, when called before the initialise event has been executed.
	 */
	FilterBar.prototype.setCurrentVariantId = function(sVariantId, bDoNotApplyVariant) {

		if (this._oVariantManagement) {
			this._oVariantManagement.setCurrentVariantId(sVariantId, bDoNotApplyVariant);
		}
	};

	/**
	 * Retrieves the current variant ID.
	 * @public
	 * @since 1.28.0
	 * @returns {string} ID of the current variant
	 */
	FilterBar.prototype.getCurrentVariantId = function() {

		var sKey = "";

		if (this._oVariantManagement) {
			sKey = this._oVariantManagement.getCurrentVariantId();
		}

		return sKey;
	};

	/**
	 * Retrieves the current variant as selection variant for UI navigation
	 * @public
	 * @since 1.28.0
	 * @deprecated As of version 1.48, replaced by {@link sap.ui.comp.filterbar.FilterBar#getUiState}
	 * @param {boolean} bConsiderAllFilters also include empty/invisible fields filter data
	 * @returns {string} JSON string representing the selection variant for UI navigation; <code>null</code> otherwise
	 */
	FilterBar.prototype.getDataSuiteFormat = function(bConsiderAllFilters) {

		return this._getDataSuiteFormat(bConsiderAllFilters, null);
	};

	FilterBar.prototype._getDataSuiteFormat = function(bConsiderAllFilters, sVersion) {

		var sSuiteVariant = null, sKey, sContent, aFiltersInfo, sParameterContextURL, sFilterContextUrl;

		if (this._oVariantManagement) {
			sKey = this.getCurrentVariantId();

			if (this.getFilterDataAsString) {
				aFiltersInfo = this._determineVariantFiltersInfo(bConsiderAllFilters, true);

				if (this.getFilterContextUrl) {
					sFilterContextUrl = this.getFilterContextUrl();
				}

				if (this.getParameterContextUrl) {
					sParameterContextURL = this.getParameterContextUrl();
				}

				sContent = this.getFilterDataAsString(bConsiderAllFilters);
				if (sContent) {
					var oConverter = new VariantConverterTo();
					sSuiteVariant = oConverter.convert(sKey, aFiltersInfo, sContent, this, sVersion, sParameterContextURL, sFilterContextUrl);
				}
			}
		}

		return sSuiteVariant;
	};

	/**
	 * Determine the internal basic search field name.
	 * @protected
	 * @returns {string} name of the basic search field.
	 */
	FilterBar.prototype.getBasicSearchName = function() {

		var sBasicSearchFieldName = null;

		if (this._oBasicSearchField && this.getEntitySet) {
			sBasicSearchFieldName = "$" + this.getEntitySet() + ".basicSearch";
		}

		return sBasicSearchFieldName;
	};

	/**
	 * Determine the value of the basic search.
	 * @protected
	 * @returns {string} current value of the basic search field.
	 */
	FilterBar.prototype.getBasicSearchValue = function() {
		return this._getBasicSearchValue();
	};

	/**
	 * Apply the SelectionPresentationVariant annotated information as a variant. The current UI state represents the data suite format.
	 * @public
	 * @since 1.54
	 * @param {sap.ui.comp.state.UIState} oUiState object representing the ui-state.Only the SelectionVariant part is considered.
	 */
	FilterBar.prototype.setUiStateAsVariant = function(oUiState) {
		var mProperties = {
			replace: true,
			strictMode: true
		};

		this.setUiState(oUiState, mProperties);

		this.fireAfterVariantLoad("SPV_VARIANT", false);

		this._applyVisibility(oUiState.getSelectionVariant());
	};

	FilterBar.prototype._applyVisibility = function(oSelectionVariant) {

		var fSetVisibile = function(oFilterItem) {
			if (oFilterItem && oFilterItem.getVisible() && !oFilterItem.getHiddenFilter()) {
				if (!oFilterItem.getVisibleInFilterBar()) {
					oFilterItem.setVisibleInFilterBar(true);
				}
				if (!oFilterItem.getPartOfCurrentVariant()) {
					oFilterItem.setPartOfCurrentVariant(true);
				}
			}
		};

		if (this._bIsInitialized) {

			for ( var n in this._mAdvancedAreaFilter) {
				if (n) {
					/* eslint-disable no-loop-func */
					this._mAdvancedAreaFilter[n].items.forEach(function(oItem) {
						if (oItem && oItem.filterItem && oItem.filterItem.getMandatory()) {
							fSetVisibile(oItem.filterItem);
						} else if (oItem && oItem.filterItem) {
							if (oItem.filterItem.getVisibleInFilterBar()) {
								oItem.filterItem.setVisibleInFilterBar(false);
							}

							/**
							 * @deprecated As of version 1.87. Will be internally treated as if always set to <code>true<code>
							 * @private
							 */
							(function() {
								if (oItem.filterItem.getPartOfCurrentVariant()) {
									if (n === FilterBar.INTERNAL_GROUP) {
										oItem.filterItem.setPartOfCurrentVariant(true);
									} else {
										oItem.filterItem.setPartOfCurrentVariant(false);
									}
								}
							}());
						}
					});
					/* eslint-enable no-loop-func */
				}
			}

			if (oSelectionVariant && oSelectionVariant.Parameters) {
				oSelectionVariant.Parameters.forEach(function(oEntry) {
					var oFilterItem = this.determineFilterItemByName(oEntry.PropertyName);
					fSetVisibile(oFilterItem);
				}.bind(this));
			}

			if (oSelectionVariant && oSelectionVariant.SelectOptions) {
				oSelectionVariant.SelectOptions.forEach(function(oEntry) {
					var oFilterItem = this.determineFilterItemByName(oEntry.PropertyName);
					fSetVisibile(oFilterItem);
				}.bind(this));
			}
		}
	};

	/**
	 * Retrieves the current UI state of the <code>FilterBar</code> control.<br>
	 * The current UI state represents the data suite format.
	 * @public
	 * @since 1.48
	 * @param {map} mProperties controls the API behavior
	 * @param {boolean} [mProperties.allFilters=false] include empty/invisible fields filter data
	 * @returns {sap.ui.comp.state.UIState} object representing the ui-state. Currently only the SelectionVariant part is considered.
	 */
	FilterBar.prototype.getUiState = function(mProperties) {
		var oUiState, sSelectionVariant, bConsiderAllFilters = false, oData = null, oValueTexts, oSemanticDates;

		if (mProperties) {
			bConsiderAllFilters = (mProperties.allFilters === true);
		}

		sSelectionVariant = this._getDataSuiteFormat(bConsiderAllFilters, "13.0");

		oUiState = new UIState();

		oUiState.selectionVariant = JSON.parse(sSelectionVariant); // compatibility wise

		oUiState.setSelectionVariant(oUiState.selectionVariant);
		var oSelectionVariant = oUiState.getSelectionVariant();

		if (oSelectionVariant) {
			if (this.getModelData && this.getModelData()) {
				oData = this.getModelData();
			}
			oSemanticDates = UIState.calcSemanticDates(oSelectionVariant, oData);
			oUiState.setSemanticDates(oSemanticDates);
			oValueTexts = UIState.calculateValueTexts(oSelectionVariant, oData);
			oUiState.setValueTexts(oValueTexts);
			window.sessionStorage.setItem(this.getId(), JSON.stringify(oValueTexts));
			window.sessionStorage.setItem("semanticDates", JSON.stringify(oSemanticDates));
		}

		return oUiState;
	};

	/**
	 * Sets the current UI state of the <code>FilterBar</code> control.<br>
	 * The current UI state represents the data suite format.
	 * @public
	 * @since 1.48
	 * @param {sap.ui.comp.state.UIState} oUiState object representing the ui-state. Currently only the SelectionVariant part is considered.
	 * @param {map} mProperties controls the API behavior
	 * @param {boolean} mProperties.replace Replaces existing filter data
	 * @param {boolean} mProperties.strictMode Determines filters and parameters based on the name.<BR>
	 *        <ul>
	 *        <li><code>true</code>: Determines filters and parameters based on their exact name and type. If there is no exact match, the
	 *        filter/parameter will be ignored.</li>
	 *        <li><code>false</code>: Determines parameters first following this rule set:
	 *        <ul>
	 *        <li>If a parameter is found, use it.</li>
	 *        <li>If a filter is found, check first if a matching parameter exists with the filter name prefixed with "P_". If there is a match, use
	 *        it as parameter, otherwise use it as filter.</li>
	 *        </ul>
	 *        </ul>
	 */
	FilterBar.prototype.setUiState = function(oUiState, mProperties) {
		var oValueTexts, sSelectionVariant, oSelectionVariant = null, bReplace = false, bStrictMode = true, oSemanticDates;

		if (mProperties && typeof mProperties.replace === "boolean") {
			bReplace = mProperties.replace;
		}

		if (mProperties && typeof mProperties.strictMode === "boolean") {
			bStrictMode = mProperties.strictMode;
		}

		if (oUiState) {
			oSelectionVariant = oUiState.getSelectionVariant();
			if (oSelectionVariant) {
				sSelectionVariant = JSON.stringify(oSelectionVariant);
			}

			oValueTexts = oUiState.getValueTexts();
			oSemanticDates = oUiState.getSemanticDates();
		}

		if (!oValueTexts) {
			oValueTexts = JSON.parse(window.sessionStorage.getItem(this.getId()));
		}

		if (!oSemanticDates) {
			oSemanticDates = JSON.parse(window.sessionStorage.getItem("semanticDates"));
		}

		this._setDataSuiteFormat(sSelectionVariant, bReplace, bStrictMode, oValueTexts, oSemanticDates);
		this._enhanceFilterItemsWithTextValue(oValueTexts, oSelectionVariant);
	};

	/**
	 * Reads the descriptions for given filters and value keys.
	 * @protected
	 * @param {array} aFiltersWithValuesToBeRead List of filters with value keys to be retrieved
	 * @since 1.75
	 */
	FilterBar.prototype.getDescriptionForKeys = function(aFiltersWithValuesToBeRead) {
	};

	FilterBar.prototype._enhanceFilterItemsWithTextValue = function(oValueTexts, oSelectionVariant) {
		var aInfoResulting = UIState.determineFiltersWithOnlyKeyValues(oValueTexts, oSelectionVariant, [
			this.getBasicSearchName()
		]);

		this.getDescriptionForKeys(aInfoResulting);
	};

	/**
	 * Sets the selection variant for UI navigation to FilterBar.
	 * @public
	 * @since 1.28.0
	 * @deprecated As of version 1.48, replaced by {@link sap.ui.comp.filterbar.FilterBar#setUiState}
	 * @param {string} sSuiteData Represents the selection variants for UI navigation
	 * @param {boolean} bReplace Replaces existing filter data
	 */
	FilterBar.prototype.setDataSuiteFormat = function(sSuiteData, bReplace) {

		this._setDataSuiteFormat(sSuiteData, bReplace, true);

	};

	FilterBar.prototype._setDataSuiteFormat = function(sSuiteData, bReplace, bStrictMode, oValueTexts, oSemanticDates) {

		var oConverter, oContent, sPayload;

		if (sSuiteData) {

			oConverter = new VariantConverterFrom();
			oContent = oConverter.convert(sSuiteData, this, bStrictMode);
			if (oContent) {

				this._clearErrorState();

				if (oContent.variantId && this._oVariantManagement) {

					if (this._bIsInitialized) {
						if (this._oVariantManagement.isPageVariant()) {
							this._oVariantManagement._selectVariant(oContent.variantId, "DATA_SUITE");
						} else {
							this._setFilterVisibility(oContent.variantId);
						}
					}

					this._oVariantManagement.setInitialSelectionKey(oContent.variantId);
				}

				if (oContent.payload && (bReplace || (Object.keys(JSON.parse(oContent.payload)).length > 0)) && this.setFilterDataAsString) {

					sPayload = oContent.payload;
					if (oValueTexts) {
						sPayload = UIState.enrichWithValueTexts(sPayload, oValueTexts);
					}
					if (oSemanticDates) {
						sPayload = UIState.enrichWithSemanticDates(sPayload, oSemanticDates);
					}

					this.setFilterDataAsString(sPayload, bReplace);
				}

				if (oContent.basicSearch && this._oBasicSearchField && this._oBasicSearchField.setValue) {
					this._oBasicSearchField.setValue("" || oContent.basicSearch);

					this._updateToolbarText();
				}

			}
		}

	};

	FilterBar.prototype._setFilterVisibility = function(sVariantId) {

		if (this._oVariantManagement.getSelectionKey() !== sVariantId) {
			this._oVariantManagement.setInitialSelectionKey(sVariantId);

			var oStandardVariant = this._getStandardVariant();
			if (oStandardVariant) {
				var oVariant = this._oVariantManagement.getVariantContent(this, sVariantId);
				if (oVariant && oVariant.filterbar) {
					if (oVariant.hasOwnProperty("version")) {
						oVariant = this.mergeVariant(oStandardVariant, oVariant);
					}

					this._reapplyVisibility(oVariant.filterbar);
				}
			}
		}
	};

	FilterBar.prototype.applySettings = function(mSettings) {

		if (this._possibleToChangeVariantManagement()) {
			if (mSettings && mSettings.customData) {
				for (var i = 0; i < mSettings.customData.length; i++) {
					var oCustomData = mSettings.customData[i];
					if (oCustomData && oCustomData.mProperties && oCustomData.mProperties.key === "pageVariantPersistencyKey") {
						this._oVariantManagement.setPersistencyKey(oCustomData.mProperties.value);
						this._oVariantManagement.setVisible(true);
						this._bHostedVariantManagement = true;
					}
				}
			}
		}

		if (mSettings && mSettings.persistencyKey) {
			this._bHostedVariantManagement = true;
		}

		Grid.prototype.applySettings.apply(this, arguments);

		if (!this.getUseToolbar() && !this.getFilterBarExpanded()) {
			// on IE the useToolBar is applied first, then filterBarExpanded
			// on Chrome filterBarExpanded and then useToolBar
			// useToolBar=false sets the filterBarExpanded to true
			this.setFilterBarExpanded(true);
		}

		this._afterVariantsLoad();
	};

	FilterBar.prototype.setPersistencyKey = function(sPersistenceKey) {

		this.setProperty("persistencyKey", sPersistenceKey);

		if (this._possibleToChangeVariantManagement()) {
			this._oVariantManagement.setVisible(true);
		}

		return this;

	};

	FilterBar.prototype._possibleToChangeVariantManagement = function() {
		if (this._oVariantManagement && !this._oVariantManagement.isPageVariant()) {
			return true;
		}

		return false;
	};

	/**
	 * Resets the current selection in the variant management control to standard.
	 * @public
	 */
	FilterBar.prototype.clearVariantSelection = function() {

		if (this._oVariantManagement) {
			this._oVariantManagement.clearVariantSelection();
		}
	};

	FilterBar.prototype.setSearchEnabled = function(bValue) {

		this.setProperty("searchEnabled", bValue);

		if (this._oSearchButton) {
			this._oSearchButton.setEnabled(bValue);
		}

		return this;
	};

	/**
	 * Sets the type of the Search to Emphasize.
	 * @private
	 * @param {boolean} bSetEmphasize Sets the type to Emphasize or Default
	 * @deprecated Since 1.30.0
	 */
	FilterBar.prototype.setSearchButtonEmphType = function(bSetEmphasize) {

	};

	/**
	 * Sets the simplified mode.
	 * @param {boolean} bFlag Sets the simplified mode
	 * @private
	 * @deprecated Since 1.30.0
	 */
	FilterBar.prototype.setSimplifiedMode = function(bFlag) {

		// the simplified mode is with beginning of 1.25 always implicitly used.
		// The former setter-method method stays in place, so that the former usages do not have to be adapted.
	};

	/**
	 * Retrieves the simplified mode.
	 * @returns {boolean} Indicates if the current advanced mode is set
	 * @private
	 * @deprecated Since 1.30.0
	 */
	FilterBar.prototype.getSimplifiedMode = function() {

		if (this.getAdvancedMode()) {
			return false;
		}

		return true;
	};

	/**
	 * Sets the advanced area to collapsed or expanded mode.
	 * @private
	 * @param {boolean} bFlag Sets the advanced area to expanded/collapsed
	 * @returns {sap.ui.comp.filterbar.FilterBar} an instance to itself
	 * @deprecated Since 1.30.0
	 */
	FilterBar.prototype.setExpandAdvancedArea = function(bFlag) {

		this.setFilterBarExpanded(bFlag);
		return this;
	};

	/**
	 * Determines if the advanced area is displayed collapsed or expanded.
	 * @private
	 * @returns {boolean} The state of the advanced area
	 * @deprecated Since 1.30.0
	 */
	FilterBar.prototype.getExpandAdvancedArea = function() {

		return this.getFilterBarExpanded();
	};

	FilterBar.prototype.setAdvancedMode = function(bFlag) {

		this.setProperty("advancedMode", bFlag);

		this.toggleStyleClass("sapContrastPlus", !bFlag);

		if (bFlag) {
			if (!this._oAdvancedAreaForm) {
				this._oAdvancedAreaForm = this._createAdvancedAreaForm();
			}

			if (this._possibleToChangeVariantManagement()) {
				this._oVariantManagement.setVisible(false);
			}

			if (this._oToolbar) {
				this._oToolbar.addStyleClass("sapUiCompFilterBarToolbarBasicSearchNoVariant");

				if (this._oBasicSearchField) {
					if (this._oToolbar.indexOfContent(this._oBasicSearchField) < 0) {
						this._oToolbar.insertContent(this._oBasicSearchField, 1);
					}
				}
			}

		} else {
			/* eslint-disable no-lonely-if */
			if (this.getPersistencyKey() && this._possibleToChangeVariantManagement()) {
				if (this._oVariantManagement) {
					this._oVariantManagement.setVisible(true);
				}
				if (this._oToolbar) {
					this._oToolbar.removeStyleClass("sapUiCompFilterBarToolbarBasicSearchNoVariant");
				}
			}
			/* eslint-enable no-lonely-if */
		}

		this._oFiltersButton.setVisible(!bFlag);

		if (this._oHideShowButton) {
			this._oHideShowButton.setVisible((bFlag && this._isPhone()) ? false : true);

			if (this._oHideShowButton.getVisible()) {
				if (this.getFilterBarExpanded()) {
					this._oHideShowButton.setText(this._oRb.getText("FILTER_BAR_VH_HIDE_FILTERS"));
				} else {
					this._oHideShowButton.setText(this._oRb.getText("FILTER_BAR_VH_SHOW_FILTERS"));
				}
			}
		}

		if (!this._bDelayRendering) {
			this._oBasicAreaLayout.setVisible(!bFlag && this.getFilterBarExpanded());
		}
		this._oAdvancedPanel.setVisible(bFlag && this.getFilterBarExpanded());

		this._adaptButtonsEnablement();

		return this;
	};

	FilterBar.prototype.setUseToolbar = function(bValue) {

		this.setProperty("useToolbar", bValue);

		if (!bValue) {
			this._adaptNewFilterBarDesign();
		} else {
			this._recreateToolbar();
		}

		return this;
	};

	FilterBar.prototype._recreateToolbar = function() {

		if (!this._oToolbar) {

			this._bButtonaAdded = false;

			if (this._oButtonsVLayout) {
				this._oBasicAreaLayout.removeContent(this._oButtonsVLayout);
				this._oButtonsVLayout.destroy();
				this._oButtonsVLayout = null;
			}

			this._oToolbar = this._createToolbar(true);
			this.insertContent(this._oToolbar, 0);

			if (this._oVariantManagement) {

				if (this._oVariantManagement instanceof SmartVariantManagementUi2 || ((this._oVariantManagement.getId() === (this.getId() + "-variant")))) {
					this._oToolbar.insertContent(this._oVariantManagement, 0);
				}
			}

			this._adaptButtonsEnablement();

			if (this._oBasicSearchFieldContainer) {
				this._oBasicAreaLayout.removeContent(this._oBasicSearchFieldContainer);

				this._cleanBasicSearchContainer();

				this.setBasicSearch(this._oBasicSearchField);
			}

			this._oHintText = new Text({
				text: this._oRb.getText("FILTER_BAR_NO_FILTERS_ON_FB"),
				textAlign: TextAlign.Center
			});
			this._oHintText.setVisible(false);
			this._oHintText.addStyleClass("sapUiCompFilterBarHint");
			this._oBasicAreaLayout.addContent(this._oHintText);

			this._oBasicAreaLayout.setMaxItemWidth(this._oBasicAreaLayout.getMinItemWidth());

			this._updateToolbarText();
		}
	};

	FilterBar.prototype._cleanBasicSearchContainer = function() {
		if (this._oBasicSearchFieldContainer) {

			var aContent = this._oBasicSearchFieldContainer.removeAllContent();
			if (aContent) {
				for (var i = 0; i < aContent.length; i++) {
					if (aContent[i] !== this._oBasicSearchField) {
						aContent[i].destroy();
					}
				}
			}
			this._oBasicSearchFieldContainer.destroy();
			this._oBasicSearchFieldContainer = null;
		}
	};

	FilterBar.prototype.setHeader = function(sValue) {

		this.setProperty("header", sValue);

		if (this.getUseToolbar()) {
			this._addHeaderToToolbar(sValue);
		}

		return this;
	};

	FilterBar.prototype._addHeaderToToolbar = function(sValue) {

		if (this._oToolbar) {
			if (sValue) {
				if (this._oVariantManagement && (this._oVariantManagement.getVisible() || this._bHostedVariantManagement) && (this._oToolbar.indexOfContent(this._oVariantManagement) > -1)) {
					if (!this._oSeparator) {

						if (!ToolbarSeparator && !this._bToolbarSeparatorRequested) {
							ToolbarSeparator = sap.ui.require("sap/m/ToolbarSeparator");
							if (!ToolbarSeparator) {
								sap.ui.require([
									"sap/m/ToolbarSeparator"
								], _ToolbarSeparatorLoaded.bind(this));
								this._bToolbarSeparatorRequested = true;
							}
						}
						if (ToolbarSeparator) {
							this._oSeparator = new ToolbarSeparator(this.getId() + "-HeadSep");
						}
					}

					this._oToolbar.removeContent(this._oSeparator);
					this._oToolbar.insertContent(this._oSeparator, 0);
					this._oToolbar.setHeight("3rem");
				}

				if (!this._oText) {
					this._oText = new Text(this.getId() + "-HeadText");
					this._oText.addStyleClass("sapMH4Style");
					this._oText.addStyleClass("sapUiCompSmartChartHeader");
				}

				this._oText.setText(sValue);
				this._oToolbar.removeContent(this._oText);
				this._oToolbar.insertContent(this._oText, 0);
			} else {
				if (this._oSeparator) {
					this._oToolbar.removeContent(this._oSeparator);
					this._oSeparator.destroy();
					delete this._oSeparator;
					this._oToolbar.setHeight();
				}
				if (this._oText) {
					this._oToolbar.removeContent(this._oText);
					this._oText.destroy();
					delete this._oText;
				}
			}
		}
	};

	function _ToolbarSeparatorLoaded(fnToolbarSeparator) {

		ToolbarSeparator = fnToolbarSeparator;
		this._bToolbarSeparatorRequested = false;

		if (!this._bIsBeingDestroyed) {
			this._addHeaderToToolbar(this.getHeader());
		}
	}

	FilterBar.prototype._isNewFilterBarDesign = function() {
		if (this.getAdvancedMode() /* || this._isPhone() */) {
			return false;
		}

		if (!this.getUseToolbar()) {
			return true;
		}

		return false;

	};

	FilterBar.prototype._adaptNewFilterBarDesign = function() {

		if (this._isNewFilterBarDesign()) {

			this.setFilterBarExpanded(true);
			if (!this._bDelayRendering) {
				this._oBasicAreaLayout.setVisible(true && this.getFilterBarExpanded());
			}

			if (this._oToolbar) {
				var aContent = this._oToolbar.getContent();
				for (var i = 0; i < aContent.length; i++) {
					this._oToolbar.removeContent(aContent[i]);
					if (aContent[i].isA("sap.m.ToolbarSpacer")) {
						aContent[i].destroy();
					}
				}

				if (!this.getUseToolbar()) {
					this.removeContent(this._oToolbar);
					this._oToolbar.destroy();
					this._oToolbar = null;
				}
			}

			if (this._oHintText) {
				this._oBasicAreaLayout.removeContent(this._oHintText);
				this._oHintText.destroy();
				this._oHintText = null;
			}

			if (this._oHideShowButton) {
				this._oHideShowButton.destroy();
				this._oHideShowButton = null;
			}

			if (!this._bButtonaAdded) {
				this._bButtonaAdded = true;
				this._addButtonsToBasicArea();
			}

			if (this._oBasicSearchField) {
				this.setBasicSearch(this._oBasicSearchField);
			}

			this._oBasicAreaLayout.setMinItemWidth(this.getFilterContainerWidth());
			this._setMaxItemWidth2();

		}
	};

	FilterBar.prototype._addButtonsToBasicArea = function() {

		var oVLayout = new VerticalLayout();

		if (Configuration.getRTL()) {
			oVLayout.addStyleClass("sapUiCompFilterBarFloatLeft");
		} else {
			oVLayout.addStyleClass("sapUiCompFilterBarFloatRight");
		}

		var oHLayout = new HorizontalLayout();
		oVLayout.addContent(new Text());
		oVLayout.addContent(oHLayout);

		oHLayout.addContent(this._oSearchButton);

		oHLayout.addContent(this._oClearButtonOnFB);

		oHLayout.addContent(this._oRestoreButtonOnFB);

		oHLayout.addContent(this._oFiltersButton);



		this._updateToolbarText();

		this._oBasicAreaLayout.addEndContent(oVLayout);

		this._oButtonsVLayout = oVLayout;

	};

	FilterBar.prototype._addBasicSearchToBasicArea = function(oBasicSearchField) {

		if (this._oBasicSearchFieldContainer) {
			this._cleanBasicSearchContainer();
		}

		if (oBasicSearchField) {

			var oLabel = new Label({
				text: "\u2008"
			});
			oLabel.addStyleClass("sapBasicSearchFilter");
			var oContainer = this._addControlToBasicAreaContainer(null, oBasicSearchField, oLabel);
			if (oContainer) {
				oContainer.setVisible(true);
				this._oBasicAreaLayout.insertContent(oContainer, 0);
				this._oBasicSearchFieldContainer = oContainer;

// if (nWidth) {
// if (typeof nWidth === 'string') {
// this._oBasicSearchFieldContainer.setWidth(nWidth);
// } else {
// this._oBasicSearchFieldContainer.setWidth(nWidth + "px");
// }
// }

				this._oBasicSearchFieldContainer.setWidth("100%");
			}
		}
	};

	FilterBar.prototype._setCollectiveSearch = function(oCollectiveSearch) {
		if (this.getAdvancedMode()) {
			if (this._oToolbar) {
				if (this._oVariantManagement) {
					this._oToolbar.removeContent(this._oVariantManagement);
					this._unregisterVariantManagement(this._oVariantManagement);
					this._oVariantManagement = null;
				}

				if (this._oCollectiveSearch) {
					this._oToolbar.removeContent(this._oCollectiveSearch);
				}
				this._oCollectiveSearch = oCollectiveSearch;
				this._oToolbar.insertContent(this._oCollectiveSearch, 0);

				this._oToolbar.removeStyleClass("sapUiCompFilterBarToolbarBasicSearchNoVariant");
			}
		}
	};

	FilterBar.prototype.setBasicSearch = function(oBasicSearchField) {
		var that = this;

		this.setAssociation("basicSearch", oBasicSearchField, true);

		if (typeof oBasicSearchField === "string") {
			oBasicSearchField = sap.ui.getCore().byId(oBasicSearchField);
		}

		if (oBasicSearchField && oBasicSearchField.getParent()) {
			if (this._isUi2Mode()) {
				oBasicSearchField.attachLiveChange(function(oEvent) {
					that.fireFilterChange(oEvent);
				});
			}

			this._oBasicSearchField = oBasicSearchField;

			return;
		}

		if (this._oBasicSearchField && this._oToolbar) {
			this._oToolbar.removeContent(this._oBasicSearchField);
		}

		if (oBasicSearchField && this._isNewFilterBarDesign()) {
			this._addBasicSearchToBasicArea(oBasicSearchField);
		} else {

			/* eslint-disable no-lonely-if */
			if (oBasicSearchField && this._oToolbar && (!this._isPhone() || this.getAdvancedMode())) {

				var nIdx = this._indexOfSpacerOnToolbar();
				this._oToolbar.insertContent(oBasicSearchField, nIdx);
				if (this._isUi2Mode()) {
					oBasicSearchField.attachLiveChange(function(oEvent) {
						that.fireFilterChange(oEvent);
					});
				}
			}
			/* eslint-enable no-lonely-if */
		}

		this._oBasicSearchField = oBasicSearchField;

		return this;
	};

	FilterBar.prototype._getBasicSearchValue = function() {
		if (this._oBasicSearchField && this._oBasicSearchField.getValue) {
			return this._oBasicSearchField.getValue();
		}

		return null;
	};

	FilterBar.prototype._indexOfSpacerOnToolbar = function() {
		var aItems = this._oToolbar.getContent(), i;
		if (aItems) {
			for (i = 0; i < aItems.length; i++) {
				if (aItems[i] instanceof ToolbarSpacer) {
					return i;
				}
			}
		}

		return 0;
	};

	/*
	 * @public Add a FilterItem to the <code>filterItems</code> aggregation.
	 * @deprecated Since version 1.48.0. Use aggregation <code>filterGroupItems</code> instead.
	 */
	FilterBar.prototype.addFilterItem = function(oFilterItem) {

		var sName, oControl, oFilterGroupItem, sFilterGroupItemId;

		if (!oFilterItem) {
			throw new Error("sap.ui.comp.filterbar.FilterBar.prototype.addFilterItem()" + " Expected argument 'oFilterItem' may not be null nor empty");
		}

		sName = oFilterItem.getName();
		if (!sName) {
			throw new Error("sap.ui.comp.filterbar.FilterBar.prototype.addFilterItem()" + " Expected argument 'oFilterItem.name' may not be null nor empty");
		}

		oControl = oFilterItem._getControl();
		if (!oControl) {
			throw new Error("sap.ui.comp.filterbar.FilterBar.prototype.addFilterItem()" + " Expected argument 'oFilterItem.control' may not be null nor empty");
		}

		this.addAggregation("filterItems", oFilterItem, true);

		// has to be initialized before the call to the container creation
		if (!this._aBasicAreaSelection) {
			this._aBasicAreaSelection = [];
		}

		var oObj = {
			control: oFilterItem._getControl(),
			filterItem: oFilterItem
		};
		this._aBasicAreaSelection.push(oObj);

		// Since removeFilterItem method is not supposed to destroy the filterGroupItem or the control,
		// check if there is already created filterGroupItem and use it, otherwise create new filterGroupItem
		sFilterGroupItemId = oFilterItem.getId() + "__filterGroupItem";
		oFilterGroupItem = sap.ui.getCore().byId(sFilterGroupItemId);

		if (!oFilterGroupItem) {
			oFilterGroupItem = new FilterGroupItem(oFilterItem.getId() + "__filterGroupItem", {
				label: oFilterItem.getLabel(),
				controlTooltip: oFilterItem.getControlTooltip(),
				name: oFilterItem.getName(),
				mandatory: oFilterItem.getMandatory(),
				visible: oFilterItem.getVisible(),
				visibleInFilterBar: oFilterItem.getVisibleInFilterBar(),
				partOfCurrentVariant: true,
				control: oFilterItem._getControl(),
				groupName: FilterBar.INTERNAL_GROUP,
				groupTitle: "",
				hiddenFilter: oFilterItem.getHiddenFilter(),
				entitySetName: oFilterItem.getEntitySetName(),
				entityTypeName: oFilterItem.getEntityTypeName()
			});
		}

		if (oFilterItem.data('isCustomField')) {
			oFilterGroupItem.data('isCustomField', true);
		}

		oFilterItem.attachChange(this._filterItemChange);

		this.addFilterGroupItem(oFilterGroupItem);

		return this;
	};

	FilterBar.prototype.addFilterGroupItem = function(oFilterGroupItem) {

		var sName, sGroupName, oObj, oContainer;
		if (!oFilterGroupItem) {
			throw new Error("sap.ui.comp.filterbar.FilterBar.prototype.addFilterGroupItem()" + " Expected argument 'oFilterGroupItem' may not be null nor empty");
		}

		this.addAggregation("filterGroupItems", oFilterGroupItem, true);

		sGroupName = oFilterGroupItem.getGroupName();
		if (!sGroupName) {
			throw new Error("sap.ui.comp.filterbar.FilterBar.prototype.addFilterGroupItems()" + " GroupName may not be null nor empty");
		}

		sName = oFilterGroupItem.getName();
		if (!sName) {
			throw new Error("sap.ui.comp.filterbar.FilterBar.prototype.addFilterGroupItems()" + " Name may not be null nor empty");
		}

		if (!this._mAdvancedAreaFilter) {
			this._mAdvancedAreaFilter = {};
		}
		if (!this._mAdvancedAreaFilter[sGroupName]) {
			this._mAdvancedAreaFilter[sGroupName] = {};
			this._mAdvancedAreaFilter[sGroupName].filterItem = null;
			this._mAdvancedAreaFilter[sGroupName].items = [];
		}

		if (!this._mAdvancedAreaFilter[sGroupName].items) {
			this._mAdvancedAreaFilter[sGroupName].items = [];
		}

		if (!this._mAdvancedAreaFilter[sGroupName].filterItem) {
			this._mAdvancedAreaFilter[sGroupName].filterItem = oFilterGroupItem;
		}

		oObj = {
			control: oFilterGroupItem._getControl(),
			filterItem: oFilterGroupItem
		};

		if (this.getAdvancedMode() || oFilterGroupItem.getVisibleInFilterBar()) {
			oFilterGroupItem.setVisibleInFilterBar(true);
		} else {
			oFilterGroupItem.setVisibleInFilterBar(false);
		}

		this._mAdvancedAreaFilter[sGroupName].items.push(oObj);

		if (!oFilterGroupItem.getHiddenFilter()) {

			oContainer = this._addControlToBasicAreaFormContainer(oFilterGroupItem);

			if (oContainer) {
				oObj.container = oContainer;

				oContainer.setVisible(oFilterGroupItem.getVisible() && oFilterGroupItem.getVisibleInFilterBar());
				if (oFilterGroupItem.getVisibleInFilterBar()) {
					oFilterGroupItem.setPartOfCurrentVariant(oFilterGroupItem.getVisibleInFilterBar());
				}
				oFilterGroupItem.attachChange(this._filterGroupItemChange);
			}

			if (this.getAdvancedMode() && !this.getIsRunningInValueHelpDialog()) {
				this._rerenderAA();
			} else {
				this._showHintText();
			}

		}
		this._adaptButtonsEnablement();

		return this;
	};

	FilterBar.prototype.removeFilterItem = function(vObject) {
		var i, oItem, sFilterGroupItemId, oGroupItem,
			aAllFilterItems = this.getFilterItems(),
			aAllFilterGroupItems = this.getFilterGroupItems();

		if (!aAllFilterItems || !aAllFilterItems.length) {
			return null;
		}

		oItem =	this._getRemovedItemAsObject(vObject, aAllFilterItems);
		if (!oItem) {
			return null;
		}

		oItem.detachChange(this._filterItemChange);

		for (i = 0; i < this._aBasicAreaSelection.length; i++) {
			if (this._aBasicAreaSelection[i].filterItem.getId() === oItem.getId()) {
				this._aBasicAreaSelection.splice(i, 1);
				if (this._aBasicAreaSelection.length === 0) {
					this._aBasicAreaSelection = null;
				}
				break;
			}
		}

		this.removeAggregation("filterItems", oItem, true);

		sFilterGroupItemId = oItem.getId() + "__filterGroupItem";
		oGroupItem = this._getRemovedItemAsObject(sFilterGroupItemId, aAllFilterGroupItems);
		this._removeFilterGroupItem(oGroupItem);

		return oItem;
	};

	FilterBar.prototype.removeFilterGroupItem = function(vObject) {

		var oItem,
			aAllFilterGroupItems = this.getFilterGroupItems();

		if (!aAllFilterGroupItems || !aAllFilterGroupItems.length) {
			return null;
		}

		oItem = this._getRemovedItemAsObject(vObject, aAllFilterGroupItems);
		if (!oItem) {
			return null;
		}

		return this._removeFilterGroupItem(oItem);
	};

	FilterBar.prototype._getRemovedItemAsObject = function(vObject, aAllItems) {

		var i, oItem;

		if (typeof vObject === "string") {
			for (i = 0; i < aAllItems.length; i++) {
				if (aAllItems[i].getId() === vObject) {
					oItem = aAllItems[i];
					break;
				}
			}
		}
		if (typeof vObject === "number") {
			if (vObject < 0 || vObject >= aAllItems.length) {
				Log.warning("sap.ui.comp.filterbar.FilterBar.prototype.removeFilterGroupItems() is called with invalid index " +  vObject);
			} else {
				oItem = aAllItems[vObject];
			}
		}
		if (typeof vObject === "object") {
			oItem = vObject;
		}

		return oItem;
	};

	FilterBar.prototype._removeFilterGroupItem = function(oItem) {

		var i, oAdvancedAreaFilterGroup, oAdvancedItem,
		sGroupName = oItem.getGroupName();

		oItem.detachChange(this._filterGroupItemChange);
		this.removeAggregation("filterGroupItems", oItem, true);

		if (this._mAdvancedAreaFilter && this._mAdvancedAreaFilter[sGroupName] && this._mAdvancedAreaFilter[sGroupName].items) {
			oAdvancedAreaFilterGroup = this._mAdvancedAreaFilter[sGroupName];

			for (i = 0; i < oAdvancedAreaFilterGroup.items.length; i++) {
				oAdvancedItem = oAdvancedAreaFilterGroup.items[i];
				if (oAdvancedItem.filterItem.getId() === oItem.getId()) {
					oAdvancedItem.container.removeAllContent();
					oAdvancedItem.container.destroy();

					oAdvancedAreaFilterGroup.items.splice(i, 1);

					if (oAdvancedAreaFilterGroup.filterItem.getId() === oItem.getId()) {
						if (oAdvancedAreaFilterGroup.items.length) {

							// If the default item is removed, make the first filterItem of the group default
							oAdvancedAreaFilterGroup.filterItem = oAdvancedAreaFilterGroup.items[0].filterItem;
						} else {

							// If there are no items left in the group, remove the group
							delete this._mAdvancedAreaFilter[sGroupName];
						}
					}
					break;
				}
			}
			if (this.getFilterGroupItems().length === 0) {
				this._mAdvancedAreaFilter = null;
				this._adaptButtonsEnablement();
			}
		}

		return oItem;
	};

	/**
	 * Adds a <code>FilterGroupItem</code> element to the aggregation <code>_parameters</code>.
	 * @protected
	 * @param {sap.ui.comp.filterbar.FilterGroupItem} oParameter adding a analytical parameter
	 * @returns {this} Reference to this in order to allow method chaining
	 */
	FilterBar.prototype._addParameter = function(oParameter) {
		var i, oObj, oContainer, bInserted = false, bReorder = false, sGroupName = FilterBar.INTERNAL_GROUP;

		oParameter._setParameter(true);
		oParameter.setVisibleInFilterBar(true);
		oParameter.setPartOfCurrentVariant(true);

		this.addAggregation("_parameters", oParameter, true);

		oObj = {
			control: oParameter._getControl(),
			filterItem: oParameter
		};

		if (!this._mAdvancedAreaFilter) {
			this._mAdvancedAreaFilter = {};
		}
		if (!this._mAdvancedAreaFilter[sGroupName]) {
			this._mAdvancedAreaFilter[sGroupName] = {};
			this._mAdvancedAreaFilter[sGroupName].filterItem = null;
		}

		if (!this._mAdvancedAreaFilter[sGroupName].items) {
			this._mAdvancedAreaFilter[sGroupName].items = [];
		}

		for (i = 0; i < this._mAdvancedAreaFilter[sGroupName].items.length; i++) {
			var oItem = this._mAdvancedAreaFilter[sGroupName].items[i];
			if (oItem.filterItem._isParameter()) {
				continue;
			}
			this._mAdvancedAreaFilter[sGroupName].items.splice(i, 0, oObj);
			bInserted = true;
			break;
		}

		if (!bInserted) {
			this._mAdvancedAreaFilter[sGroupName].items.push(oObj);

			if (Object.keys(this._mAdvancedAreaFilter).length > 1) {
				bReorder = true;
			}
		}

		oContainer = this._addControlToBasicAreaFormContainer(oParameter);
		if (oContainer) {
			oObj.container = oContainer;
			oContainer.setVisible(oParameter.getVisible());

			oParameter.attachChange(this._filterGroupItemChange.bind(this));
		}

		if (bInserted || bReorder) {

			this._oBasicAreaLayout.removeContent(oContainer);

			if (oParameter.getVisible()) {
				this._addContainerInOrder(oObj.filterItem, oObj.container);
			}
		}

		if (!this.getAdvancedMode()) {
			this._showHintText();
		}

		this._adaptButtonsEnablement();

		return this;

	};

	/**
	 * Event-handler is called when the property of a filter item has changed.
	 * @private
	 * @param {object} oContainer the container of the filter item's control and label
	 * @param {object} oEvent the event
	 */
	FilterBar.prototype._filterItemChange = function(oContainer, oEvent) {

		var oItem, bFlag, sPropertyName, oControl;

		if (oEvent && oEvent.oSource && (oEvent.oSource.isA("sap.ui.comp.filterbar.FilterItem"))) {

			sPropertyName = oEvent.getParameter("propertyName");

			if (sPropertyName === "visibleInFilterBar" || sPropertyName === "visible" || sPropertyName === "label" || sPropertyName === "labelTooltip" || sPropertyName === "controlTooltip" || sPropertyName === "mandatory") {
				oItem = this._determineItemByName(oEvent.oSource.getName(), FilterBar.INTERNAL_GROUP);

				if (oItem && oItem.filterItem) {
					if ((sPropertyName === "visible")) {
						bFlag = oEvent.oSource.getVisible();
						oItem.filterItem.setVisible(bFlag);
					} else if (sPropertyName === "visibleInFilterBar") {
						bFlag = oEvent.oSource.getVisibleInFilterBar();
						var bChangePossible = this._checkChangePossibleVisibleInFilterBar(oItem.filterItem, bFlag);
						if (bChangePossible) {
							oItem.filterItem.setVisibleInFilterBar(bFlag);
						} else {
							oEvent.oSource.setVisibleInFilterBar(true);
						}

					} else if (sPropertyName === "label") {
						oItem.filterItem.setLabel(oEvent.oSource.getLabel());
					} else if (sPropertyName === "labelTooltip") {
						oItem.filterItem.setLabelTooltip(oEvent.oSource.getLabelTooltip());
					} else if (sPropertyName === "controlTooltip") {
						oControl = this.determineControlByFilterItem(oItem.filterItem, true);
						if (oControl && oControl.setTooltip) {
							oControl.setTooltip(oItem.filterItem.getControlTooltip());
						}
					} else if (sPropertyName === "mandatory") {
						bFlag = oEvent.oSource.getMandatory();
						oItem.filterItem.setMandatory(bFlag);
					}
				}
			}
		}
	};

	/**
	 * Event handler called when the property of a filter group item has changed.
	 * @private
	 * @param {object} oEvent the event
	 */
	FilterBar.prototype._filterGroupItemChange = function(oEvent) {

		var oItem;
		var sPropertyName;

		if (oEvent && oEvent.oSource) {
			sPropertyName = oEvent.getParameter("propertyName");

			if (sPropertyName === "visibleInFilterBar" || sPropertyName === "visible") {

				oItem = this._determineItemByName(oEvent.oSource.getName(), oEvent.oSource.getGroupName());
				if (oItem) {
					if (sPropertyName === "visibleInFilterBar") {
						var bVisibleInFilterBar = oEvent.oSource.getVisibleInFilterBar();
						var bFlag = bVisibleInFilterBar;

						var bChangePossible = this._checkChangePossibleVisibleInFilterBar(oEvent.oSource, bVisibleInFilterBar);
						if (!bChangePossible) {
							oEvent.oSource.setVisibleInFilterBar(true);
							bFlag = true;
						}

						if (bFlag) {
							oEvent.oSource.setPartOfCurrentVariant(true);
						}

						if (!bVisibleInFilterBar && !this._isFilterItemInBasicGroup(oItem.filterItem)) {
							oEvent.oSource.setPartOfCurrentVariant(false);
						}

						if (!this.getAdvancedMode() && !this._oAdaptFiltersDialog) {
							this._rerenderItem(oItem);
						}

					} else if (sPropertyName === "visible") {

						if (!this._oAdaptFiltersDialog) {
							if (this.getAdvancedMode() && oItem.container) {
								oItem.container.setVisible(true);
							} else {
								this._updateToolbarText();
								this._rerenderItem(oItem);
							}
						}
					}

					this._showHintText();
				}
			} else if (sPropertyName === "groupTitle") {
				if (this._mAdvancedAreaFilter && this._mAdvancedAreaFilter[oEvent.oSource.getGroupName()]) {
					this._adaptGroupTitle(oEvent.oSource.getGroupName());
				}
			} else if (sPropertyName === "label") {
				if (!this._oAdaptFiltersDialog) { // do not adapt in case the advanced filters dialog is active
					this._adaptGroupTitleForFilter(oEvent.oSource);
				}
			} else if (sPropertyName === "mandatory") {
				this._mandatoryFilterItemChange(oEvent.oSource);
			} else if ((sPropertyName === "partOfCurrentVariant") && this.ensureLoadedValueHelpList) {
				var oFilterItem = this.determineFilterItemByName(oEvent.oSource.getName());
				if (oFilterItem && oFilterItem.getPartOfCurrentVariant()) {
					this.ensureLoadedValueHelpList(oEvent.oSource.getName());
				}
			}

			if (this.getAdvancedMode() && !this.getIsRunningInValueHelpDialog()) {
				this._rerenderAA();
			}
		}
	};

	FilterBar.prototype._addContainer = function(oItem) {

		if (oItem && this._oBasicAreaLayout) {
			if (oItem.container && (this._oBasicAreaLayout.indexOfContent(oItem.container) === -1)) {
				this._addContainerInOrder(oItem.filterItem, oItem.container);
			}
		}
	};

	FilterBar.prototype._removeContainer = function(oItem) {

		if (oItem && this._oBasicAreaLayout) {
			if (oItem.container && (this._oBasicAreaLayout.indexOfContent(oItem.container) > -1)) {
				this._oBasicAreaLayout.removeContent(oItem.container);
			}
		}
	};

	FilterBar.prototype._addContainerInOrder = function(oFilterItem, oContainer) {
		var n, i, idx, aContainers = this._oBasicAreaLayout.getContent(), oPredecessorContainerIdx = -1;

		if (this._oBasicSearchField && this._isNewFilterBarDesign()) {
			oPredecessorContainerIdx++;
		}

		if (this._mAdvancedAreaFilter) {
			for (n in this._mAdvancedAreaFilter) {
				var oGroupElement = this._mAdvancedAreaFilter[n];
				if (oGroupElement && oGroupElement.items) {
					for (i = 0; i < oGroupElement.items.length; i++) {

						if (!oGroupElement.items[i].container) {
							continue;
						}

						if (oGroupElement.items[i].container === oContainer) {

							this._oBasicAreaLayout.insertContent(oContainer, oPredecessorContainerIdx + 1);
							return;
						}

						idx = aContainers.indexOf(oGroupElement.items[i].container);
						if (idx >= 0) {
							oPredecessorContainerIdx = idx;
						}
					}
				}
			}
		}
	};

	/**
	 * VisibleInFilterBar-property may not be changed to false, when the filter is mandatory and has no value
	 * @private
	 * @param {sap.ui.comp.filterbar.FilterItem} oFilterItem in question
	 * @param {boolean} bFlag - represents the value of visibleInFilterBar
	 * @returns {boolean} allowed or not allowed change
	 */
	FilterBar.prototype._checkChangePossibleVisibleInFilterBar = function(oFilterItem, bFlag) {

		if (oFilterItem && oFilterItem.getMandatory() && !bFlag) {
			var bHasValue = this._hasFilterValue(oFilterItem);
			if (!bHasValue) {
				oFilterItem.setVisibleInFilterBar(true);
				return false;
			}
		}

		return true;
	};


	/**
	 * Checks if a filter has a value.
	 * @private
	 * @param {sap.ui.comp.filterbar.FilterItem} oFilterItem the filter
	 * @returns {boolean} returns if the filter has a value or not
	 */
	FilterBar.prototype._hasFilterValue = function(oFilterItem) {

		var aFilters;

		if (!this._getTriggerFilterChangeState() && this.getAllFiltersWithValues) {
			// BCP: 1870505654
			// during variant appliance and in SmartFilterBar scenario; check for mandatory non-visible filter value
			aFilters = this.getAllFiltersWithValues();
		} else {
			aFilters = this._getFiltersWithValues();
		}

		return this._checkFilterForValue(aFilters, oFilterItem);
	};


	/**
	 * In case considerGroupTitle is set then all labels of filters of a specific group will post-fixed with the group title.
	 * @private
	 * @param {sap.ui.comp.filterbar.FilterGroupItem} oFilterItem the filter
	 */
	FilterBar.prototype._adaptGroupTitleForFilter = function(oFilterItem) {

		var sLabel;
		var oLabel;

		if (oFilterItem && !oFilterItem.getHiddenFilter()) {
			sLabel = oFilterItem.getLabel();
			oLabel = oFilterItem.getLabelControl(this.getId());
			if (this.getConsiderGroupTitle()) {
				if (oLabel && oFilterItem.getGroupTitle()) {
					oLabel.setText(sLabel + " (" + oFilterItem.getGroupTitle() + ')');
				}
			} else {
				oLabel.setText(sLabel);
			}
		}
	};

	/**
	 * In case considerGroupTitle is set then all labels of filters of a specific group will post-fixed with the group title.
	 * @private
	 * @param {string} sGroupName filter group name
	 */
	FilterBar.prototype._adaptGroupTitle = function(sGroupName) {

		var i;
		var oItem;

		if (this._mAdvancedAreaFilter && this._mAdvancedAreaFilter[sGroupName] && this._mAdvancedAreaFilter[sGroupName].items) {
			for (i = 0; i < this._mAdvancedAreaFilter[sGroupName].items.length; i++) {
				oItem = this._mAdvancedAreaFilter[sGroupName].items[i];
				if (oItem && oItem) {
					this._adaptGroupTitleForFilter(oItem.filterItem);
				}
			}
		}
	};


	/**
	 * Registration of a callback function. The provided callback function is executed to obtain the filters with values.
	 * @public
	 * @since 1.26.1
	 * @param {function} fCallBack Called when a variant must be applied
	 * @returns {this} Reference to this in order to allow method chaining.
	 */
	FilterBar.prototype.registerGetFiltersWithValues = function(fCallBack) {

		this._fRegisterGetFiltersWithValues = fCallBack;

		return this;
	};

	/**
	 * Registration of a callback function. The provided callback function is executed when saving a variant is triggered and must provide all
	 * relevant fields and values in JSON.
	 * @public
	 * @param {function} fCallBack Called when a variant must be fetched
	 * @returns {this} Reference to this in order to allow method chaining.
	 */
	FilterBar.prototype.registerFetchData = function(fCallBack) {

		this._fRegisteredFetchData = fCallBack;

		return this;
	};

	/**
	 * Registration of a callback function. The provided callback function is executed when a variant must be applied. The callback function will
	 * receive the corresponding data set containing all relevant data in JSON, as initially provided by the callback for fetchData.
	 * @public
	 * @param {function} fCallBack Called when a variant must be applied
	 * @returns {this} Reference to this in order to allow method chaining.
	 */
	FilterBar.prototype.registerApplyData = function(fCallBack) {

		this._fRegisteredApplyData = fCallBack;

		return this;
	};

	FilterBar.prototype._isTINAFScenario = function() {

		if (this._oVariantManagement) {

			if (!this._isUi2Mode()) {
				return true;
			}
// if (this._oVariantManagement instanceof SmartVariantManagement) {
// return true;
// }
		} else {

			/* eslint-disable no-lonely-if */
			// scenario: VH dialog: VM replaced with collective search control
			if (this._oCollectiveSearch && this.getAdvancedMode()) {
				return true;
			}
			/* eslint-enable no-lonely-if */
		}

		return false;
	};

	FilterBar.prototype.fireInitialise = function() {
		if (this._isTINAFScenario()) {
			this._createVisibleFilters();
			if (this.getAdvancedMode()) {
				this._ensureFilterLoaded(null);
			}
			this._fireInitialiseEvent();
		} else {
			this._initializeVariantManagement();
		}

		if (this.getIsRunningInValueHelpDialog()) {
			this._rerenderFilters();
		}
	};

	/**
	 * This method will be called by the SmartVariantMangement and indicates, that the standard variant was obtained. It indicates, that the variant
	 * management is fully initialized.
	 * @protected
	 */
	FilterBar.prototype.variantsInitialized = function() {
		this._afterVariantsLoad();
		this.fireInitialized();
		this._oInitializedDeferred.resolve();
	};

	FilterBar.prototype.fireInitialized = function() {
		this.fireEvent("initialized");
		this._mAdvancedAreaFilterFlat = this._getAllFilterItemsFlat();
		this._oInitializedDeferred.resolve();
	};

	/**
	 * Returns promise which will be resolve when the initialized event is fired.
	 * @returns {Promise}
	 * @public
	 */
	FilterBar.prototype.getInitializedPromise = function () {
		return this._oInitializedDeferred.promise;
	};

	/**
	 * Initializes the variant management, when the prerequisites are fulfilled. In this case the "initialise" event will be triggered only after the
	 * variant management's initialization. Triggers the "initialise" event immediately in case the prerequisites are not fulfilled.
	 * @private
	 */
	FilterBar.prototype._initializeVariantManagement = function() {
		this._createVisibleFilters();
		// initialise SmartVariant stuff only if it is necessary! (Ex: has a persistencyKey)
		if (this._oVariantManagement && this.getPersistencyKey()) {

			if (this._isTINAFScenario()) {
				this._oVariantManagement.initialise(this._initialiseVariants, this);
			} else {
				// Ui2 handling
				this._fInitialiseVariants = this._initialiseVariants.bind(this);
				this._oVariantManagement.attachInitialise(this._fInitialiseVariants, this);
				this._oVariantManagement.initialise();
			}

		} else {
			this._fireInitialiseEvent();
		}
	};

	FilterBar.prototype._fireInitialiseEvent = function() {

		try {
			this.fireEvent("initialise");

			this._showHintText();
		} catch (ex) {
			Log.error("error during initialise event handling - " + ex.message);
		}

		this._bIsInitialized = true;

		this._updateToolbarText();
	};

	/**
	 * Is triggered, whenever the flex layer is initialized.
	 * @private
	 */
	FilterBar.prototype._initialiseVariants = function() {

		this._fireInitialiseEvent();
		if (this._oVariantManagement) { // mark any changes as irrelevant
			this._oVariantManagement.currentVariantSetModified(false);
		}
	};

	/**
	 * Informs the consumer of the FilterBar that a new variant was applied.
	 * @private
	 * @param {string} sContext may be undefined, has the values 'RESET'/'CANCEL/'DATA_SUITE'/'SET_VM_ID'/'INIT' and indicates the initial trigger
	 *        source
	 * @param {boolean} bExecuteOnSelect indicates if a follow-on search will be triggered automatically
	 */
	FilterBar.prototype.fireAfterVariantLoad = function(sContext, bExecuteOnSelect) {

		this._rerenderFilters();
		this._aAdaptFilterItems = []; // cleanup

		var oEvent = {
			context: sContext,
			executeOnSelect: bExecuteOnSelect
		};

		try {
			this.fireEvent("afterVariantLoad", oEvent);
		} catch (ex) {
			Log.error("error during 'afterVariantLoad' event handling - " + ex.message);
		}
	};

	/**
	 * Informs the consumer of the FilterBar, that a variant is about to be saved.
	 * @private
	 * @param {string} sContext may be undefined, have the value <code>STANDARD</code> and indicates the initial trigger source
	 */
	FilterBar.prototype.fireBeforeVariantSave = function(sContext) {

		var oEvent = {
			context: sContext
		};

		var bFlag = this._getConsiderFilterChanges();

		if (sContext) {
			this._setConsiderFilterChanges(false);
		}

		this.fireEvent("beforeVariantSave", oEvent);

		if (sContext) {
			this._setConsiderFilterChanges(bFlag);
		}
	};

// BCP: 1670241039
// /**
// * Returns all Filters belonging to the 'filterItems' aggregation. Since 1.48.0 this method will return all filters belonging to the BASIC group.
// * @public
// * @returns {sap.ui.comp.filterbar.FilterItem[]} An array of the removed elements (might be empty).
// * @deprecated Since version 1.48.0. Use aggregation <code>filterGroupItems</code> instead.
// */
// FilterBar.prototype.getFilterItems = function() {
//
// var i, aFilters = [];
//
// if (this._mAdvancedAreaFilter) {
//
// this._ensureFilterLoaded(null);
//
// if ((this._mAdvancedAreaFilter[FilterBar.INTERNAL_GROUP]) && (this._mAdvancedAreaFilter[FilterBar.INTERNAL_GROUP].items)) {
// for (i = 0; i < this._mAdvancedAreaFilter[FilterBar.INTERNAL_GROUP].items.length; i++) {
// if (this._mAdvancedAreaFilter[FilterBar.INTERNAL_GROUP].items[i].filterItem &&
// !this._mAdvancedAreaFilter[FilterBar.INTERNAL_GROUP].items[i].filterItem._isParameter()) {
// aFilters.push(this._mAdvancedAreaFilter[FilterBar.INTERNAL_GROUP].items[i].filterItem);
// }
// }
// }
// }
//
// return aFilters;
// };

	FilterBar.prototype.destroyFilterGroupItems = function() {

		var aFilterGroupItems = this.getFilterGroupItems();
		this._destroyItems(aFilterGroupItems);

		return this;
	};

	FilterBar.prototype.destroyFilterItems = function() {

		var aFilterItems = this.getFilterItems();
		this._destroyItems(aFilterItems);

		return this;
	};

	/**
	 * Removes all entries in the aggregation filterItems.
	 * @public
	 * @returns {sap.ui.comp.filterbar.FilterItem[]} An array of the removed elements (might be empty).
	 * @deprecated Since version 1.48.0. Use aggregation <code>filterGroupItems</code> instead.
	 */
	FilterBar.prototype.removeAllFilterItems = function() {

		var i, aFilters = this.getFilterItems();

		if (aFilters && aFilters.length) {
			for (i = 0; i < aFilters.length; i++) {
				this.removeFilterItem(aFilters[i]);
			}
		}

		return aFilters;
	};

	/**
	 * Removes all entries in the aggregation filterGroupItems.
	 * @public
	 * @returns {sap.ui.comp.filterbar.FilterGroupItem[]} An array of the removed elements (might be empty).
	 */
	FilterBar.prototype.removeAllFilterGroupItems = function() {

		var  i, aFilterGroupItems = [], aFilters = this.getFilterGroupItems();

		if (aFilters && aFilters.length) {
			for (i = 0; i < aFilters.length; i++) {
				aFilterGroupItems.push(aFilters[i]);
				this.removeFilterGroupItem(aFilters[i]);
			}
		}

		return aFilterGroupItems;
	};

	/**
	 * Removes all entries in the aggregations filterItems, filterGroupItems, basicSearch
	 * @public
	 */
	FilterBar.prototype.removeAllFilters = function() {
		this.removeAllFilterItems();
		this.removeAllFilterGroupItems();
		this.removeBasicSearch();
	};

	FilterBar.prototype.removeBasicSearch = function() {
		this.setBasicSearch(null);
	};

	/**
	 * Retrieves filters belonging to the current variant.
	 * @public
	 * @param {boolean} bConsiderOnlyVisibleFields Indicates that only visible filters are retrieved. <b>Note:</b> hidden filters are treated as
	 *        visible filters.
	 * @returns {array} filters Of the current variant
	 */
	FilterBar.prototype.getAllFilterItems = function(bConsiderOnlyVisibleFields) {

		var i, n = null;
		var aFilters = [];
		var oElement, oItem;

		if (!bConsiderOnlyVisibleFields) {
			this._ensureFilterLoaded(null);
		}

		if (this._mAdvancedAreaFilter) {
			for (n in this._mAdvancedAreaFilter) {
				if (n) {
					oElement = this._mAdvancedAreaFilter[n];
					if (oElement.items) {
						for (i = 0; i < oElement.items.length; i++) {
							oItem = oElement.items[i];
							if (oItem && oItem.filterItem && oItem.filterItem.getVisible()) {
								if (bConsiderOnlyVisibleFields) {
									if (oItem.filterItem.getVisibleInFilterBar() || this._checkIfFilterHasValue(oItem.filterItem.getName()) || (oItem.filterItem.data("isCustomField") && this._checkIfCustomControlFilterHasValue(oItem))/* || oItem.filterItem.getPartOfCurrentVariant()*/) {
										aFilters.push(oItem.filterItem);
									}
								} else {
									aFilters.push(oItem.filterItem);
								}
							}
						}
					}
				}
			}
		}

		return aFilters;
	};

	/**
	 * @param sFilterName filter name to be checked
	 * @returns {boolean}
	 * @private
	 */
	FilterBar.prototype._checkIfFilterHasValue = function (sFilterName) {
		return false;
	};

	/**
	 * @param oFilterItem filter item to be checked
	 * @returns {boolean}
	 * @private
	 */
	FilterBar.prototype._checkIfCustomControlFilterHasValue = function (oFilterItem) {
		return false;
	};

	/**
	 * Clears an eventual error state on all filter.
	 * @private
	 */
	FilterBar.prototype._clearErrorState = function() {

		this._resetFiltersInErrorValueState();
	};

	FilterBar.prototype.getAggregation = function(sName) {

		if (sName == "filterGroupItems" && !this.__bDeleteMode) {
			this._ensureFilterLoaded(null);
		}

		return Grid.prototype.getAggregation.apply(this, arguments);
	};

	/**
	 * Provides filter information for lazy instantiation. Is overwritten by the SmartFilterBar.
	 * @private
	 * @returns {array} of filter information
	 */
	FilterBar.prototype._getFilterInformation = function() {
		return [];
	};

	FilterBar.prototype._createVisibleFilters = function() {

		this._getFilters();
	};

	FilterBar.prototype._getFilters = function() {
		var aFiltersWithValues = [],
			oFiltersData = this._oFilterProvider && this._oFilterProvider.getModel() && this._oFilterProvider.getModel().getData();

		if (oFiltersData) {
			aFiltersWithValues = Object.keys(oFiltersData).filter(function(sFilterName) {
				return this._checkIfFilterHasValue(sFilterName);
			}.bind(this));
		}

		this._aFields = this._getFilterInformation();
		var i, oField;

		if (this._aFields && this._aFields.length > 0) {
			if (!this._mAdvancedAreaFilter) {
				this._mAdvancedAreaFilter = {};

				if (!this.getAdvancedMode()) {
					this._mAdvancedAreaFilter[FilterBar.INTERNAL_GROUP] = {};
					this._mAdvancedAreaFilter[FilterBar.INTERNAL_GROUP].filterItem = null;
					this._mAdvancedAreaFilter[FilterBar.INTERNAL_GROUP].items = null;
				}
			}

			for (i = 0; i < this._aFields.length; i++) {
				oField = this._aFields[i];

				if (oField.groupName !== FilterBar.INTERNAL_GROUP) {
					if (!this._mAdvancedAreaFilter[oField.groupName]) {
						this._mAdvancedAreaFilter[oField.groupName] = {};
						this._mAdvancedAreaFilter[oField.groupName].groupTitle = oField.groupTitle;
						this._mAdvancedAreaFilter[oField.groupName].filterItem = null;
						this._mAdvancedAreaFilter[oField.groupName].items = [];
					}
				}
				if (oField.visibleInAdvancedArea || (oField.groupName === FilterBar.INTERNAL_GROUP) || aFiltersWithValues.includes(oField.name)) {

					this._instanciateFilterItem(oField);
				}
			}
		}

		this._adaptButtonsEnablement();
	};

	/**
	 * Determines if an filter is visible on he filterbar. This API is only relevant for the Smart Templates scenario any may not be used in any other
	 * cases.
	 * @private
	 * @param {string} sName of a filter.
	 * @returns {boolean} determines if a specific filter is visible in the filterbar.
	 */
	FilterBar.prototype.isVisibleInFilterBarByName = function(sName) {
		var oFilterItem, oField = this._getFilterMetadata(sName);
		if (oField && oField.factory) {
			if ((oField.hasOwnProperty("visibleInAdvancedArea") && oField.visibleInAdvancedArea) || (oField.groupName === FilterBar.INTERNAL_GROUP)) {
				return true;
			}
		} else {
			oFilterItem = this.determineFilterItemByName(sName);
			if (oFilterItem) {
				return oFilterItem.getVisibleInFilterBar();
			}
		}

		return false;
	};

	FilterBar.prototype._getFilterMetadata = function(sName) {
		if (this._aFields) {
			for (var i = 0; i < this._aFields.length; i++) {
				if (this._aFields[i].fieldName === sName) {
					return this._aFields[i];
				}
			}
		}

		return null;
	};

	/**
	 * Determines an array of filter names, which are custom filters and non visible on the FilterBar. This API is only relevant for the Smart
	 * Templates scenario any may not be used in any other cases.
	 * @private
	 * @returns {array} of filter names.
	 */
	FilterBar.prototype.getNonVisibleCustomFilterNames = function() {

		if (this._aFields.length > 0) {
			return this._getLazyNonVisibleCustomFilterNames();
		} else {
			return this._getNonVisibleCustomFilterNames();
		}

	};

	FilterBar.prototype._getLazyNonVisibleCustomFilterNames = function() {
		var that = this, aArray = [];

		this._aFields.forEach(function(oField) {

			if (oField.factory) {
				if (oField.isCustomFilterField && !oField.visibleInAdvancedArea) {
					aArray.push(oField.fieldName);
				}
			} else if (that._isNonVisibleCustomFilterNamesByName(oField.fieldName, oField.groupName)) {
				aArray.push(oField.fieldName);
			}

		});

		return aArray;
	};

	FilterBar.prototype._isNonVisibleCustomFilterNamesByName = function(sName, sGroupName) {
		var i, oItem;
		if (this._mAdvancedAreaFilter && this._mAdvancedAreaFilter[sGroupName] && this._mAdvancedAreaFilter[sGroupName].items) {
			for (i = 0; i < this._mAdvancedAreaFilter[sGroupName].items.length; i++) {
				oItem = this._mAdvancedAreaFilter[sGroupName].items[i];
				if (oItem.filterName && (oItem.filterItem.getName() === sName)) {
					return this._isNonVisibleCustomFilterNamesByFilter(oItem.filterItem);
				}
			}
		}

		return false;
	};

	FilterBar.prototype._isNonVisibleCustomFilterNamesByFilter = function(oFilterItem) {
		if (oFilterItem.data("isCustomField") && !oFilterItem.getVisibleInFilterBar()) {
			return true;
		}

		return false;
	};

	FilterBar.prototype._getNonVisibleCustomFilterNames = function() {
		var that = this, aArray = [], aFilterItems = this.getAllFilterItems();

		if (aFilterItems) {
			aFilterItems.forEach(function(oFilterItem) {
				if (that._isNonVisibleCustomFilterNamesByFilter(oFilterItem)) {
					aArray.push(oFilterItem.getName());
				}
			});
		}

		return aArray;
	};

	FilterBar.prototype._ensureFilterLoaded = function(aFilterNames) {
		var i, j, oField;

		if (this._aFields && this._aFields.length > 0) {

			for (j = 0; j < this._aFields.length; j++) {
				oField = this._aFields[j];

				if (!oField.factory) {
					continue;
				}

				if (aFilterNames) {
					for (i = 0; i < aFilterNames.length; i++) {
						if (oField.fieldName === aFilterNames[i].name) {
							if (oField.groupName === aFilterNames[i].group) {
								this._instanciateFilterItem(oField);
								break;
							} else if (oField.groupEntityType === aFilterNames[i].group) {
								this._instanciateFilterItem(oField);
							}
						}
					}
				} else {
					this._instanciateFilterItem(oField);
				}
			}

			if (!aFilterNames) {
				this._aFields = [];
			}
		}
	};

// FilterBar.prototype._ensureFilterLoaded = function(aFilterNames) {
//
// var that = this;
//
// if (this._aFields && this._aFields.length > 0) {
//
// if (aFilterNames) {
// aFilterNames.forEach(function(oFilter) {
// that._aFields.some(function(oField) {
// if ((oField.fieldName === oFilter.name) && (oField.groupName === oFilter.group)) {
// if (oField.factory) {
// that._instanciateFilterItem(oField);
// }
// return true;
// }
// return false;
// });
// });
// } else {
//
// this._aFields.forEach(function(oField) {
// if (oField.factory) {
// that._instanciateFilterItem(oField);
// }
// });
// }
//
// if (!aFilterNames) {
// this._aFields = [];
// }
// }
//
// };

	FilterBar.prototype._instanciateFilterItem = function(oField) {

		var factory = oField.factory;
		if (factory) {
			// first remove factory to avoid endless recursion, then call it
			delete oField.factory;
			factory.call(oField);
		}

	};

	/**
	 * Destroys the passed filters.
	 * @private
	 * @param {array} aFilterItems aggregation items
	 */
	FilterBar.prototype._destroyItems = function(aFilterItems) {

		if (aFilterItems && aFilterItems.length) {
			for (var i = 0; i < aFilterItems.length; i++) {
				aFilterItems[i].destroy();
			}
		}
	};

	/**
	 * Handles the visibility of the filters, during the variant appliance, according to the persisted information.
	 * @private
	 * @param {array} aPersData information about the filter fields
	 * @param {boolean} bCancelMode Flag indicating cancel mode
	 */
	FilterBar.prototype._reapplyVisibility = function(aPersData, bCancelMode) {

		var i, n = null;
		var oItem;
		var aFiltersNotPartOfCurrentVariant = [];

		if (this._mAdvancedAreaFilter) {


			for (n in this._mAdvancedAreaFilter) {
				if (n) {
					var oGroup = this._mAdvancedAreaFilter[n];
					if (oGroup && oGroup.items) {
						for (i = 0; i < oGroup.items.length; i++) {
							oItem = oGroup.items[i];
							if (oItem && oItem.filterItem) {
								this._setPersVisibility(aPersData, oItem.filterItem, aFiltersNotPartOfCurrentVariant, bCancelMode);
							}
						}
					}
				}
			}
		}

		return aFiltersNotPartOfCurrentVariant;
	};

	/**
	 * Determines if the current filter is marks as visible via the personalization
	 * @private
	 * @param {array} aPersData array of filters as obtain by the persistence layer
	 * @param {sap.ui.comp.filterBar.FilterItem} oFilterItem current filterItem
	 * @param {array} aFiltersNotPartOfCurrentVariant
	 * @param {boolean} bCancelMode Flag indicating cancel mode
	 */
	FilterBar.prototype._setPersVisibility = function(aPersData, oFilterItem, aFiltersNotPartOfCurrentVariant, bCancelMode) {

		var sGroupName, oFilterInfo;

		if (oFilterItem && !oFilterItem.getHiddenFilter()) {
			sGroupName = oFilterItem.getGroupName();

			oFilterInfo = this._checkForFilterInfo(aPersData, oFilterItem);
			if (this._isTINAFScenario()) {
				if (oFilterInfo) {
					oFilterItem.setVisibleInFilterBar(oFilterInfo.visibleInFilterBar);
//					oFilterItem.setPartOfCurrentVariant(oFilterInfo.partOfCurrentVariant);

					if (oFilterInfo.hasOwnProperty("visible")) {
						oFilterItem.setVisible(oFilterInfo.visible);
					}
				} else {
					oFilterItem.setVisibleInFilterBar(false);
					if ((sGroupName === FilterBar.INTERNAL_GROUP) || oFilterItem._isParameter()) {
//						oFilterItem.setPartOfCurrentVariant(true);
//					} else {
//						oFilterItem.setPartOfCurrentVariant(false);
					}
				}
			} else {
				/* eslint-disable no-lonely-if */
				if (oFilterInfo && (oFilterInfo.visibleInFilterBar !== undefined)) {
					oFilterItem.setVisibleInFilterBar((oFilterInfo.visibleInFilterBar));
					//oFilterItem.setPartOfCurrentVariant((oFilterInfo.partOfCurrentVariant));
				} else { // old format
					if ((sGroupName !== FilterBar.INTERNAL_GROUP) && oFilterInfo && (oFilterInfo.group === sGroupName)) {

						oFilterItem.setVisibleInFilterBar((oFilterInfo !== null));
					}
				}
				/* eslint-enable no-lonely-if */
			}

//			if (sGroupName === FilterBar.INTERNAL_GROUP) { // basic fields are always partOfCurentVariant
//				oFilterItem.setPartOfCurrentVariant(true);
//			}

			if (oFilterItem) {
				var oControl = this.determineControlByFilterItem(oFilterItem, true);
				if (!bCancelMode && oControl && oControl.getValueState && (oControl.getValueState() !== ValueState.None)) {
					oControl.setValueState(ValueState.None);
				}

				if (oFilterInfo && oFilterInfo.hasOwnProperty("partOfCurrentVariant") && (!oFilterInfo.partOfCurrentVariant)) {
					aFiltersNotPartOfCurrentVariant.push(oFilterItem);
				}
			}

		}
	};

	FilterBar.prototype._checkForFilterInfo = function(aPersData, oFilterItem) {

		var i, j, sName = oFilterItem.getName(), aGroupName = [
			oFilterItem.getGroupName(), oFilterItem.getEntitySetName(), oFilterItem.getEntityTypeName()
		];

		var aHits = [];
		if (aPersData && aPersData.length) {
			for (i = 0; i < aPersData.length; i++) {
				if (aPersData[i].name === sName) {
					if (aGroupName.indexOf(aPersData[i].group) > -1) {
						aHits.push(aPersData[i]);
					}
				}
			}
		}

		if (aHits.length === 1) {
			return aHits[0];
		} else if (aHits.length > 1) {
			for (j = 0; j < aGroupName.length; j++) {
				for (i = 0; i < aHits.length; i++) {
					if (aHits[i].group === aGroupName[j]) {
						return aHits[i];
					}
				}
			}
		}


		return null;
	};

	/**
	 * Creates the variant management control.
	 * @private
	 * @returns {sap.ui.comp.smartvariants.SmartVariantManagementUi2} the instance of variant management
	 */
	FilterBar.prototype._createVariantManagement = function() {

		var oVarMgm = new SmartVariantManagementUi2(this.getId() + "-variantUi2", {
		// showExecuteOnSelection: true,
		// showShare: true
		});

		var oPersInfo = new PersonalizableInfo({
			type: "filterBar",
			keyName: "persistencyKey"
		});
		oPersInfo.setControl(this);

		oVarMgm.addPersonalizableControl(oPersInfo);

		oVarMgm.addStyleClass("sapUiCompFilterBarMarginLeft");
		return oVarMgm;
	};

	FilterBar.prototype.fireAssignedFiltersChanged = function() {
		this.fireEvent("assignedFiltersChanged");
	};

	/**
	 * Returns a summary string that contains information about the filters currently assigned. The string starts with the number of set filters, followed by
	 * "filters active" and their labels.<br>
	 * Example:<br>
	 * <i>(3) filters active: Company Code, Fiscal Year, Customer</i>
	 * @public
	 * @returns {string} A string that contains the number of set filters and their names
	 */
	FilterBar.prototype.retrieveFiltersWithValuesAsText = function() {
		var sText, sCSVText, aFiltersWithValues = this.retrieveFiltersWithValues(), nCount, sBasicSearchValue = this.getBasicSearchValue();

		if (sBasicSearchValue && aFiltersWithValues) {
			aFiltersWithValues.splice(0, 0, this._oRb.getText("FILTER_BAR_ASSIGNED_FILTERS_SEARCH_TERM"));
		}

		if (!aFiltersWithValues || (aFiltersWithValues.length === 0)) {
			sText = this._oRb.getText("FILTER_BAR_ASSIGNED_FILTERS_ZERO");
		} else if (aFiltersWithValues && aFiltersWithValues.length === 1) {
			if (!this._isPhone()) {
				sText = this._oRb.getText("FILTER_BAR_ASSIGNED_ONE_FILTER", [
					aFiltersWithValues.length, aFiltersWithValues[0]
				]);
			} else {
				sText = this._oRb.getText("FILTER_BAR_ASSIGNED_ONE_FILTER_MOBILE", [
					aFiltersWithValues.length
				]);
			}
		} else {

			/* eslint-disable no-lonely-if */
			if (!this._isPhone()) {
				nCount = Math.min(5, aFiltersWithValues.length);
				sCSVText = "";
				for (var i = 0; i < nCount; i++) {
					sCSVText += aFiltersWithValues[i];
					if (i < (nCount - 1)) {
						sCSVText += ', ';
					}
				}

				sText = this._oRb.getText("FILTER_BAR_ASSIGNED_FILTERS", [
					aFiltersWithValues.length, sCSVText
				]);

				if (nCount < aFiltersWithValues.length) {
					sText += ", ...";
				}

			} else {
				sText = this._oRb.getText("FILTER_BAR_ASSIGNED_FILTERS_MOBILE", [
					aFiltersWithValues.length
				]);
			}

			/* eslint-disable no-lonely-if */
		}

		return sText;
	};

	/**
	 * Returns a summary string that contains information about the filters currently assigned. This string is intended to be used in expanded state. The string starts with the total number of filters set, followed by
	 * "filters active" and if available non-visible, the number of the non-visible with label "hidden" in brackets.<br>
	 * Example:<br>
	 * <i>(3) filters active (1 hidden)</i>
	 * @public
	 * @returns {string} A string that contains the number of set filters and their names
	 */
	FilterBar.prototype.retrieveFiltersWithValuesAsTextExpanded = function() {
		var sText,
			sHiddenFilters = '',
			aFiltersWithValues = this.retrieveFiltersWithValues(),
			sBasicSearchValue = this.getBasicSearchValue(),
			aNonVisibleFiltersWithValues = this.retrieveNonVisibleFiltersWithValues();

		if (aNonVisibleFiltersWithValues.length > 0) {
			sHiddenFilters = " " + this._oRb.getText("FILTER_BAR_ASSIGNED_HIDDEN_FILTERS", [
				aNonVisibleFiltersWithValues.length
			]);
		}

		if (sBasicSearchValue && aFiltersWithValues) {
			aFiltersWithValues.splice(0, 0, this._oRb.getText("FILTER_BAR_ASSIGNED_FILTERS_SEARCH_TERM"));
		}

		if (aFiltersWithValues.length === 0) {
			sText = this._oRb.getText("FILTER_BAR_ASSIGNED_FILTERS_ZERO");
		} else if (aFiltersWithValues.length === 1) {
			if (!this._isPhone()) {
				sText = this._oRb.getText("FILTER_BAR_ASSIGNED_ONE_FILTER_EXPANDED", [
					aFiltersWithValues.length
				]);
				sText += sHiddenFilters;
			} else {
				sText = this._oRb.getText("FILTER_BAR_ASSIGNED_ONE_FILTER_MOBILE", [
					aFiltersWithValues.length
				]);
				sText += sHiddenFilters;
			}
		} else {
			/* eslint-disable no-lonely-if */
			if (!this._isPhone()) {
				sText = this._oRb.getText("FILTER_BAR_ASSIGNED_FILTERS_EXPANDED", [
					aFiltersWithValues.length
				]);
				sText += sHiddenFilters;
			} else {
				sText = this._oRb.getText("FILTER_BAR_ASSIGNED_FILTERS_MOBILE", [
					aFiltersWithValues.length
				]);
				sText += sHiddenFilters;
			}
			/* eslint-disable no-lonely-if */
		}

		return sText;
	};

	/**
	 * Retrieves the labels of all visible filters that belongs to the current variant and have an assigned value.
	 * @public
	 * @returns {array} Filter labels that represents relevant filters with values
	 */
	FilterBar.prototype.retrieveFiltersWithValues = function() {

		var i, aResultingFilters = [];
		var aFilters = this._getFiltersWithValues();
		if (aFilters) {
			for (i = 0; i < aFilters.length; i++) {
				if (aFilters[i].getHiddenFilter()) {
					continue;
				}
				if (aFilters[i].getVisible() && aFilters[i].getPartOfCurrentVariant()) {
					aResultingFilters.push(aFilters[i].getLabel());
				}
			}
		}

		return aResultingFilters;
	};

	FilterBar.prototype.retrieveNonVisibleFiltersWithValues = function() {
		var i, aResultingFilters = [], oFilterItem, aFilters = this._getFiltersWithValues();

		if (aFilters) {
			for (i = 0; i < aFilters.length; i++) {
				oFilterItem = aFilters[i];
				if (oFilterItem.getHiddenFilter()) {
					continue;
				}
				if (oFilterItem.getVisible() && !oFilterItem.getVisibleInFilterBar() && oFilterItem.getPartOfCurrentVariant()) {
					aResultingFilters.push(oFilterItem.getLabel());
				}
			}
		}

		return aResultingFilters;
	};

	/**
	 * Retrieves all filters with values.
	 * @private
	 * @returns {array} of filters with values
	 */
	FilterBar.prototype._getFiltersWithValues = function() {

		if (this._fRegisterGetFiltersWithValues) {
			try {
				return this._fRegisterGetFiltersWithValues();
			} catch (ex) {
				Log.error("callback for obtaining the filter count throws an exception");
			}
		}

		return null;
	};

	/**
	 * Retrieve the count for visible filters with values.
	 * @private
	 * @returns {number} count of visible filters with values
	 */
	FilterBar.prototype._getFiltersWithValuesCount = function() {

		var n = 0;

		var aFilters = this.retrieveFiltersWithValues();
		n = aFilters.length;

		if (this._oBasicSearchField && this._oBasicSearchField.getValue && this._oBasicSearchField.getValue()) {
			n++;
		}

		return n;
	};

	/**
	 * Determines if at least one filter is visible.
	 * @private
	 * @param {array} aFilterItemsWithValues contains all filters with values
	 * @param {sap.ui.comp.filterbar.FilterItem} oFilterItem filter to check
	 * @returns {boolean} indicated whether at least one filter is visible
	 */
	FilterBar.prototype._checkFilterForValue = function(aFilterItemsWithValues, oFilterItem) {

		var i;
		if (aFilterItemsWithValues) {
			for (i = 0; i < aFilterItemsWithValues.length; i++) {
				if (aFilterItemsWithValues[i] === oFilterItem) {
					return true;
				}
			}
		}

		return false;
	};

	FilterBar.prototype._handleVisibilityOfToolbar = function() {

		if (this.getAdvancedMode() && this._oToolbar) {

			var bFlag = false;

			var aContent = this._oToolbar.getContent();
			for (var i = 0; i < aContent.length; i++) {
				if (aContent[i] instanceof ToolbarSpacer) {
					continue;
				}

				if (aContent[i].getVisible && aContent[i].getVisible()) {
					bFlag = true;
					break;
				}
			}

			this._oToolbar.setVisible(bFlag);
		}
	};

	/**
	 * Checks if there are mandatory fields.
	 * @private
	 */
	FilterBar.prototype._hasMandatoryFields = function() {
		return this.getFilterGroupItems().some(function(oItem) {
			return oItem.getMandatory();
		});
	};

	/**
	 * Toggles the filterbar mode Hide/Show.
	 * @private
	 */
	FilterBar.prototype._toggleHideShow = function() {

		this.setFilterBarExpanded(!this.getFilterBarExpanded());

		this._bShowAllFilters = this._hasMandatoryFields() ? true : false;

		if (!this.getAdvancedMode()) {
			this._rerenderFilters();
		}
	};

	/**
	 * Updates the 'Filters'-button text with the count of filters with values
	 * @protected
	 */
	FilterBar.prototype._updateToolbarText = function() {

		var sFiltersKey = this._isNewFilterBarDesign() ? "FILTER_BAR_ADAPT_FILTERS" : "FILTER_BAR_ACTIVE_FILTERS";
		var sZeroFiltersKey = this._isNewFilterBarDesign() ? "FILTER_BAR_ADAPT_FILTERS_ZERO" : "FILTER_BAR_ACTIVE_FILTERS_ZERO";

		var nFilterCount = this._getFiltersWithValuesCount();
		var sText = nFilterCount ? (this._oRb.getText(sFiltersKey, [
			nFilterCount
		])) : (this._oRb.getText(sZeroFiltersKey));

		this._oFiltersButton.setText(sText);

		this.fireAssignedFiltersChanged();

	};

	FilterBar.prototype.setFilterBarExpanded = function(bShowExpanded) {
		var bExpanded;

		if (this.getAdvancedMode()) {

			this.setProperty("filterBarExpanded", bShowExpanded);

			if (this._oHideShowButton) {
				if (bShowExpanded) {
					this._oHideShowButton.setText(this._oRb.getText("FILTER_BAR_VH_HIDE_FILTERS"));
				} else {
					this._oHideShowButton.setText(this._oRb.getText("FILTER_BAR_VH_SHOW_FILTERS"));
				}
			}
			// this._oHideShowButton.setVisible(true);
			this._calcVisibilityGoButton();

			if (this.getIsRunningInValueHelpDialog()) {
				this._oBasicAreaLayout.setVisible(bShowExpanded);
			} else {
				this._oAdvancedPanel.setVisible(bShowExpanded);
			}

		} else {

			if (this._isPhone() && this.getUseToolbar()) {
				bExpanded = false;
			} else {
				bExpanded = bShowExpanded;
			}

			this.setProperty("filterBarExpanded", bExpanded);

			if (this._isNewFilterBarDesign()) {
				return this;
			}

			if (this._isPhone()) {

				if (this._oHideShowButton) {
					this._oHideShowButton.setVisible(false);
				}
				this._calcVisibilityGoButton();

				this._oBasicAreaLayout.setVisible(false);

			} else {

				if (this._oHideShowButton) {
					if (bExpanded) {
						this._oHideShowButton.setText(this._oRb.getText("FILTER_BAR_HIDE"));

					} else {
						this._oHideShowButton.setText(this._oRb.getText("FILTER_BAR_SHOW"));
					}
					this._oHideShowButton.setVisible(true);
				}

				this._calcVisibilityGoButton();

				if (this._oHideShowButton) {
					if (this._oHideShowButton.getEnabled()) {
						this._oBasicAreaLayout.setVisible(bExpanded);
					} else {
						this._oBasicAreaLayout.setVisible(false);
					}
				}
			}

		}

		this._updateToolbarText();

		return this;
	};

	FilterBar.prototype._selectionChangedInFilterDialogByValue = function(bValue, oFilterItem) {

		oFilterItem.setVisibleInFilterBar(bValue);

		if (this._getConsiderFilterChanges() && this._oVariantManagement && !this._oVariantManagement.getInErrorState()) {
			this._oVariantManagement.currentVariantSetModified(true);
		}

		this._bDirtyViaDialog = true;
	};

	/**
	 * Called when the control is changed. Validates the symbols passing the search pattern
	 * @private
	 * @param {Object} oEvent - then event object
	 */
	FilterBar.prototype._onLiveChangeValidateSymbols = function(oEvent) {
		var rValidateSymbolAsteriskRegex = new RegExp("[\\w][*][\\w]"),
			rValidateSymbolPlusRegex = new RegExp("[+]"),
			oControl = oEvent.getSource(),
			sText = oControl.getValue(),
			bContainSpecialSymbol = rValidateSymbolAsteriskRegex.test(sText) || rValidateSymbolPlusRegex.test(sText);

		this._onSymbolsValidationSetValueState.call(this, bContainSpecialSymbol, oControl);
	};

	/**
	 * Setting Warning value state and related value text if any special symbol is entered
	 * @private
	 * @param {Boolean} bContainSpecialSymbol - flag contains special symbol
	 * @param {Object} oControl - target control
	 */
	FilterBar.prototype._onSymbolsValidationSetValueState = function (bContainSpecialSymbol, oControl){
		var oValueStateMessage = oControl._oValueStateMessage,
			sWarningClassName = "sapMSFContentWrapperWarning";
		if (bContainSpecialSymbol && !oControl.hasStyleClass(sWarningClassName) && oControl.setValueState === undefined) {
			oControl.addStyleClass(sWarningClassName);
			oControl.getValueState = function () {
				return ValueState.Warning;
			};

			oValueStateMessage.open();
		} else if (!bContainSpecialSymbol && oControl.hasStyleClass(sWarningClassName) && oControl.setValueState === undefined) {
			oControl.getValueState = function () {
				return ValueState.None;
			};

			oValueStateMessage.close();
			oControl.removeStyleClass(sWarningClassName);
		} else if (bContainSpecialSymbol && oControl.getValueState && oControl.getValueState() === ValueState.None){
			oControl.setValueState(ValueState.Warning);
			oControl.setValueStateText(SymbolValidationWarningMessage);
		} else if (!bContainSpecialSymbol && oControl.getValueState() === ValueState.Warning) {
			oControl.setValueState(ValueState.None);
		}
	};

	/**
	 * Cross-checks if a mandatory filter has a value.
	 * @private
	 * @param {object } oEvent general event object
	 */
	FilterBar.prototype._mandatoryFilterChange = function(oEvent) {
		if (!oEvent) {
			return;
		}

		var params = oEvent.getParameters();
		if (!params || !params.oSource) {
			return;
		}

		var oItem = this._determineByControl(params.oSource);
		if (oItem) {
			this._mandatoryFilterItemChange(oItem.filterItem);
		}
	};

	FilterBar.prototype._mandatoryFilterItemChange = function(oFilterItem) {

		if (oFilterItem) {

			if (!oFilterItem.getMandatory()) {
				return;
			}

			var bHasValue = this._hasFilterValue(oFilterItem);
			if (!oFilterItem.getVisibleInFilterBar() && !bHasValue) {
				oFilterItem.setVisibleInFilterBar(true);
			}
		}
	};

//	/**
//	 * Determines how many filters of a specific group are yet not part of the current variant.
//	 * @private
//	 * @param {string} sGroupName name of the current group
//	 * @returns {number} count of filters, for the current group, yet not part of the current variant
//	 */
//	FilterBar.prototype._determineNotAssignedFiltersCount = function(sGroupName) {
//
//		var nCount = 0, i, oFilterItem;
//
//		if (this._mAdvancedAreaFilter[sGroupName] && this._mAdvancedAreaFilter[sGroupName].items) {
//			for (i = 0; i < this._mAdvancedAreaFilter[sGroupName].items.length; i++) {
//				oFilterItem = this._mAdvancedAreaFilter[sGroupName].items[i].filterItem;
//				if (!oFilterItem.getVisible() || oFilterItem.getHiddenFilter()) {
//					continue;
//				}
//				if (!oFilterItem.getPartOfCurrentVariant() && !oFilterItem.getVisibleInFilterBar()) {
//					nCount++;
//				}
//			}
//		}
//
//		return nCount;
//	};


	/**
	 * Checks if running on phone.
	 * @protected
	 * @returns {boolean} <code>True</code> if phone, <code>false</code> otherwise
	 */
	FilterBar.prototype._isPhone = function() {
		return !!(Device.system.phone);
	};

	/**
	 * Checks if running on tablet.
	 * @protected
	 * @returns {boolean} <code>True</code> if tablet, <code>false</code> otherwise
	 */
	FilterBar.prototype._isTablet = function() {
		return !!(Device.system.tablet && !Device.system.desktop);
	};


	FilterBar.prototype.fireSearch = function(oEvent) {

		if (this._bOKFiltersDialogTriggered && this._oAdaptFiltersDialog) {
			this._oAdaptFiltersDialog.close();
		} else if (this._oAdaptFiltersDialog) {
			this._bEnterPressedLeadsToSearch = true;
		}

		this.fireEvent("search", oEvent);

	};

	FilterBar.prototype._variantSave = function(oEvent) {

		this._oVariant = {};

		this.fireBeforeVariantSave();
	};

	FilterBar.prototype._afterVariantSave = function(oEvent) {
		this._aOrderedFilterItems = this._aAdaptFilterItems; // refresh
		this._aAdaptFilterItems = []; // clear adapt filter items temp
		this.fireAfterVariantSave();
	};

	// indicates a filter change in the control, but not in the model
	FilterBar.prototype._filterSetInErrorState = function(oControl) {
		if (this._oAdaptFiltersDialog && this._oAdaptFiltersDialog.isOpen()) {
			if (this._getConsiderFilterChanges() && this._oVariantManagement && !this._oVariantManagement.getInErrorState()) {
				this._oVariantManagement.currentVariantSetModified(true);
			}
			this._bDirtyViaDialog = true;
		}
	};

	FilterBar.prototype._cancelFilterDialog = function(bVariantSaveTriggered) {

		// in case the save variant was canceled by the user, set the dirty flag to true,
		// since the save variant was only possible with a dirty variant
		// BCP: 1670342256
		if (bVariantSaveTriggered && this._oVariantManagement) {
			this._bDirtyViaDialog = this._oVariantManagement._bSaveCanceled;
		}

		// BCP: 1780159203
		if (!this.getPersistencyKey() && (this.getUseSnapshot() === false)) {
			this.fireCancel();
			return;
		}

		if (this._oInitialVariant && this._oInitialVariant.content && this._bDirtyViaDialog) {

			//this._resetFiltersInErrorValueState();

			var aSelectionSet = this._retrieveCurrentSelectionSet(false);
			this._deleteValidatingTokenFlag(aSelectionSet);

			this.applyVariant(this._oInitialVariant.content, "CANCEL");

			if (this._oVariantManagement) {
				if (!this._oVariantManagement.isPageVariant()) {
					this._oVariantManagement.setCurrentVariantKey(this._oInitialVariant.key);
				}

				this._oVariantManagement.currentVariantSetModified(this._oInitialVariant.modified);
			}

			this.fireCancel();
		}
	};

	/**
	 * Resets filters in value state error to value state none. The error value is set in control and not propagated to the model. It is not possible
	 * to restore a filter which was already in error state, once the filters dialog is opened.
	 * @private
	 */
	FilterBar.prototype._resetFiltersInErrorValueState = function() {
		var aNameControls;

		aNameControls = this._retrieveCurrentSelectionSet(true, true);
		aNameControls.forEach(function(oObj) {
			if (oObj.control && oObj.control.setValueState && oObj.control.getValueState) {
				if (oObj.control.getValueState() === ValueState.Error) {
					// oBind = oObj.control.getBinding("value");
					// if (oBind) {
					if (oObj.control.setValue) {
						oObj.control.setValue("");
					}
					// oBind.checkUpdate(true);
					oObj.control.setValueState(ValueState.None);
					// }
				}
			}

		});

	};


	/**
	 * Sets the width of the content area of the dialog. The passed dimension will be interpreted as 'px'.
	 * @public
	 * @param {float} fWidth the content width of the filters dialog.
	 */
	FilterBar.prototype.setContentWidth = function(fWidth) {

		if (this._oAdaptFiltersDialog) {
			this._oAdaptFiltersDialog.setContentWidth(fWidth + "px");
		}
	};


	/**
	 * Sets the height of the content area of the dialog. The passed dimension will be interpreted as 'px'.
	 * @public
	 * @param {float} fHeight the content height of the filters dialog.
	 */
	FilterBar.prototype.setContentHeight = function(fHeight) {
		if (this._oAdaptFiltersDialog) {
			this._oAdaptFiltersDialog.setContentHeight(fHeight + "px");
		}
	};


	/**
	 * Enables to add application specific content as a custom view to the new adapt filters dialog.
	 *
	 * @param {object} mCustomView the setting for the custom view
	 * @param {sap.m.SegmentedButtonItem} mCustomView.item the custom button used in the view switch
	 * @param {sap.ui.core.Control} mCustomView.content the content displayed in the custom view
	 * @param {function} [mCustomView.search] callback triggered by search - executed with the string as parameter
	 * @param {function} [mCustomView.filterSelect] callback triggered by the <code>Select</code> control in the header area - executed with the selected key as parameter
	 * @param {function} [mCustomView.selectionChange] callback triggered by selecting a view - executed with the key as parameter
	 *
	 * Note: This API is designed to fulfill the need of adding visual filters to "Adapt Filters" dialog so applications
	 * can achieve the ALP scenario in free style. Other usages are not encouraged.
	 *
	 * @public
	 */
	FilterBar.prototype.addAdaptFilterDialogCustomContent = function(mCustomView) {
		this._mCustomViewInfo = {
			item: mCustomView.item,
			search : mCustomView.search,
			selectionChange: mCustomView.selectionChange,
			filterSelect: mCustomView.filterSelect,
			content : mCustomView.content
		};
	};


	FilterBar.prototype._createStructureForAdaptFiltersDialog = function() {
		var oGroup, oItem, mState = { filtersOnFilterBar: {}, allFilters: []};

		var bHasValue, aFilters = this.getAllFiltersWithValues ? this.getAllFiltersWithValues() : this._getFiltersWithValues();

		if (this._mAdvancedAreaFilter) {
			for (var n in this._mAdvancedAreaFilter) {
				if (n) {
					oGroup = this._mAdvancedAreaFilter[n];
					if (oGroup.items) {
						for (var i = 0; i < oGroup.items.length; i++) {
							oItem = oGroup.items[i];

							bHasValue = this._checkFilterForValue(aFilters, oItem.filterItem);

							if (oItem.filterItem.getVisibleInFilterBar()) {
								mState.filtersOnFilterBar[oItem.filterItem.getName()] = oItem.filterItem;
							}

							var sGroupName = oItem.filterItem.getGroupName() ? oItem.filterItem.getGroupName() : FilterBar.INTERNAL_GROUP;
							var sGroupLabel = (sGroupName === FilterBar.INTERNAL_GROUP) ? this._oRb.getText("FILTER_BAR_BASIC_GROUP") : oItem.filterItem.getGroupTitle();

							var sTooltip = oItem.filterItem.getControlTooltip() ? oItem.filterItem.getControlTooltip() : "";

							mState.allFilters.push({
								name: oItem.filterItem.getName(),
								label: oItem.filterItem.getLabel(),
								group: sGroupName,
								groupLabel: sGroupLabel,
								tooltip: sTooltip,
								visibleInDialog: oItem.filterItem.getVisible(),
								filterItem: oItem.filterItem,
								active: bHasValue,
								required: oItem.filterItem.getMandatory()
							});
						}
					}
				}
			}

			// apply items order based on "fresh" _aAdaptFilterItems or _aOrderedFilterItems from variant
			if (mState.allFilters.length > 0) {
				var aItemsOrder = [],
					aItemsOrderToApply = this._aAdaptFilterItems.length > 0 ? this._aAdaptFilterItems : this._aOrderedFilterItems;

				if (aItemsOrderToApply.length > 0) {
					aItemsOrderToApply.forEach(function (oItem, iIndex) {
						aItemsOrder[oItem.name] = iIndex;
					});
					mState.allFilters.sort(function (a, b) {
						return aItemsOrder[a.name] - aItemsOrder[b.name];
					});
				}
			}
		}

		return mState;
	};

	FilterBar.prototype._getAllFilterItemsFlat = function() {
		var oGroup, oItem, oItemFilterItem, allFilters = [];

		// var bHasValue, aFilters = this.getAllFiltersWithValues ? this.getAllFiltersWithValues() : this._getFiltersWithValues();

		if (this._mAdvancedAreaFilter) {
			for (var n in this._mAdvancedAreaFilter) {
				if (n) {
					oGroup = this._mAdvancedAreaFilter[n];
					if (oGroup.items) {
						for (var i = 0; i < oGroup.items.length; i++) {
							oItem = oGroup.items[i];
							oItemFilterItem = oItem.filterItem;

							// bHasValue = this._checkFilterForValue(aFilters, oItemFilterItem);

							var sGroupName = oItemFilterItem.getGroupName() ? oItemFilterItem.getGroupName() : FilterBar.INTERNAL_GROUP;
							var sGroupLabel = (sGroupName === FilterBar.INTERNAL_GROUP) ? this._oRb.getText("FILTER_BAR_BASIC_GROUP") : oItemFilterItem.getGroupTitle();

							var sTooltip = oItemFilterItem.getControlTooltip() ? oItemFilterItem.getControlTooltip() : "";

							allFilters.push({
								name: oItemFilterItem.getName(),
								label: oItemFilterItem.getLabel(),
								group: sGroupName,
								groupLabel: sGroupLabel,
								tooltip: sTooltip,
								visibleInDialog: oItemFilterItem.getVisible(),
								filterItem: oItemFilterItem,
								// isFiltered: bHasValue,
								required: oItemFilterItem.getMandatory()
							});
						}
					}
				}
			}
		}

		return allFilters;
	};

	FilterBar.prototype._restoreControls = function(fVisibilityChanged, bCancelMode) {
		var oGroup, oItem, aContent;

		if (this._fRegisteredFilterChangeHandlers) {
			this.detachFilterChange(this._fRegisteredFilterChangeHandlers);
			this._fRegisteredFilterChangeHandlers = null;
		}

		if (this._mAdvancedAreaFilter) {
			for (var n in this._mAdvancedAreaFilter) {
				if (n) {
					oGroup = this._mAdvancedAreaFilter[n];
					if (oGroup.items) {
						for (var i = 0; i < oGroup.items.length; i++) {
							oItem = oGroup.items[i];

							if (oItem.filterItem && !oItem.filterItem.getHiddenFilter() && oItem.control && oItem.container) {

								if (oItem.contentReplaced) {
									oItem.contentReplaced = undefined;

									aContent = oItem.container.getContent();
									var oFirstContent = aContent[1];
									oItem.container.removeContent(oFirstContent);

									if (oFirstContent && oFirstContent.getValueState) {
										if (bCancelMode && (oFirstContent.getValueState() != oItem.control.getValueState())) {
											oItem.control.setValueState(oFirstContent.getValueState());
										}
									}
									oFirstContent.destroy();
									oItem.container.getContent()[0].setLabelFor(oItem.control);
									oItem.container.insertContent(oItem.control, 1);
								}

								oItem.filterItem.detachChange(fVisibilityChanged);
							}
						}
					}
				}
			}
		}

		this._rerenderFilters();
	};


	FilterBar.prototype._expandGroup = function(oItem)	{
		if (this._oAdaptFiltersDialog && this._oAdaptFiltersDialogModel && this._oAdaptFiltersPanel && oItem && oItem.filterItem) {

			var sGroupName = oItem.filterItem.getGroupName() ? oItem.filterItem.getGroupName() : FilterBar.INTERNAL_GROUP;

			var aItemsGrouped = this._oAdaptFiltersDialogModel.getData().itemsGrouped;
			for (var i = 0; i < aItemsGrouped.length; i++) {
				if (aItemsGrouped[i].group === sGroupName) {
					for (var j = 0; j < aItemsGrouped[i].items.length; j++) {
						if (aItemsGrouped[i].items[j].name === oItem.filterItem.getName()) {
							this._oAdaptFiltersPanel.setGroupExpanded(aItemsGrouped[i].items[j].group, true);
							return;
						}
					}
					return;
				}
			}
		}
	};

	var P13nBuilder, AdaptFiltersPanel;

	FilterBar.prototype._getEntitiesLazy = function() {
		if (P13nBuilder && AdaptFiltersPanel) {
			return Promise.resolve();
		}

		this.setBusy(true);

		return sap.ui.getCore().loadLibrary('sap.ui.mdc', {
			async: true
		}).then(function() {
			return new Promise(function(resolve) {
				sap.ui.require([
					"sap/ui/mdc/p13n/P13nBuilder",
					"sap/ui/mdc/p13n/panels/AdaptFiltersPanel"
				], function(fnP13nBuilder, fnAdaptFiltersPanel) {
					P13nBuilder = fnP13nBuilder;
					AdaptFiltersPanel = fnAdaptFiltersPanel;
					resolve();

					this.setBusy(false);
				}.bind(this));
			}.bind(this));
		}.bind(this));
	};


	FilterBar.prototype._filtersButtonPressed = function()	{
		this._oFiltersButton.focus();

		this.showAdaptFilterDialog();
	};

	FilterBar.prototype._checkAssignedFilters = function()	{
//		var bChange = false;
		if (this._oAdaptFiltersDialog) {
			var aFilters = this.getAllFiltersWithValues ? this.getAllFiltersWithValues() : this._getFiltersWithValues();

			var aItems = this._oAdaptFiltersDialogModel.getData().items;
			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].hasOwnProperty("filterItem")) {
					var bHasValue = this._checkFilterForValue(aFilters, aItems[i].filterItem);
					if (aItems[i].active !== bHasValue) {
						aItems[i].active = bHasValue;
//
//						bChange = true;
					}
				}
			}
//
//			if (bChange) {
//				this._oAdaptFiltersDialogModel.checkUpdate();
//			}
		}
	};

	/**
	 * Opens the Adapt Filters Dialog for the UI adaptation.
	 * <br><b>Note:</b> This function must only be used internally during the UI adaptation.
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta
	 *
	 * @param {string} sStyleClass indicating the ui adaption area
	 * @param {function} fCallBack will be executed, once the dialog closes with 'Save'
	 */
	FilterBar.prototype.showAdaptFilterDialogForKeyUser = function(sStyleClass, fCallBack)	{

		this._fGetDataForKeyUser = fCallBack;
		this.showAdaptFilterDialog().then(function() {
			this._oAdaptFiltersDialog.addStyleClass(sStyleClass);

			P13nBuilder.addRTACustomFieldButton(this._oAdaptFiltersDialog);

		}.bind(this));
	};


	FilterBar.prototype._createKeyUserChange = function() {
		var oObj = [];

		if (this._bOKFiltersDialogTriggered && this._oVariantManagement &&
			this._oVariantManagement.isA("sap.ui.comp.smartvariants.SmartVariantManagement") &&
			this._oVariantManagement.getVisible() && this._oVariantManagement._getPersoController()) {

			oObj = [{
				selectorControl: this._oVariantManagement._getPersoController(),
				changeSpecificData: {
					changeType: "variantContent",
					content: {
						key: this._oVariantManagement.getSelectionKey(),
						persistencyKey: this.getPersistencyKey(),
						content: this.fetchVariant()
					}
				}
			}];
		}

		return oObj;
	};

	/**
	 * Opens the Adapt Filters Dialog
	 *
	 * @private
	 * @ui5-restricted sap.ui.generic
	 *
	 * @param {string} sView initially shown view
	 */
	FilterBar.prototype.showAdaptFilterDialog = function(sView)	{

		return new Promise(function(fResolve) {

			this._getEntitiesLazy().then(function() {
				var oDummyJSONModel;

				if (!this._oAdaptFiltersDialog) {
					oDummyJSONModel = new JSONModel();
					oDummyJSONModel.setSizeLimit(0);
					var fHandleGroupVisibility = function(aItemsGrouped, sGroupName) {
						for (var i = 0; i < aItemsGrouped.length; i++) {
							if (aItemsGrouped[i].group === sGroupName) {

								var aItems = aItemsGrouped[i].items;
								for (var j = 0; j < aItems.length; j++) {

									if (aItems[j].filterItem && aItems[j].filterItem.getVisible()) {
										if (!aItemsGrouped[i].groupVisible) {
											aItemsGrouped[i].groupVisible = true;
										}

										return;
									}
								}

								if (aItemsGrouped[i].groupVisible) {
									aItemsGrouped[i].groupVisible = false;
								}

								return;
							}
						}
					};

					var fVisibilityChanged = function(oEvent) {
						if (oEvent && oEvent.oSource && (oEvent.oSource.isA("sap.ui.comp.filterbar.FilterItem"))) {
							var sPropertyName = oEvent.getParameter("propertyName");
							if (this._oAdaptFiltersDialogModel && sPropertyName) {
								var aItems = this._oAdaptFiltersDialogModel.getData().items;
								for (var i = 0; i < aItems.length; i++) {
									if (aItems[i].hasOwnProperty("filterItem") && aItems[i].filterItem === oEvent.oSource) {
										if (sPropertyName === "visible") {
											var bFlag = oEvent.oSource.getVisible();
											if (aItems[i].visibleInDialog != bFlag) {
												aItems[i].visibleInDialog = bFlag;

												//check for group
												fHandleGroupVisibility(this._oAdaptFiltersDialogModel.getData().itemsGrouped, aItems[i].group);

												// trigger bindings
												this._oAdaptFiltersDialogModel.checkUpdate();
												break;
											}
										} else if (sPropertyName === "visibleInFilterBar") {
											aItems[i].visible = oEvent.oSource.getVisibleInFilterBar();

											// trigger bindings
											this._oAdaptFiltersDialogModel.checkUpdate();
											break;
										}
									}
								}
							}
						}
					}.bind(this);

					this._ensureFilterLoaded(null);

					var mState = this._createStructureForAdaptFiltersDialog();
					var that = this;

					var oP13nData = P13nBuilder.prepareAdaptationData(mState.allFilters, function(mItem, oItem) {
						//mItem --> Item which will be included in the model (can be customized in this callback)
						//oItem --> according item from the provided array in the first argument
						merge(mItem, oItem);

						var bIncludeInDialog = true;

						if (!oItem.filterItem || oItem.filterItem.getHiddenFilter()) {
							that._mAdvancedAreaHiddenFilters.push(mItem);
							bIncludeInDialog = false;
						}

						mItem.visible = !!mState.filtersOnFilterBar[oItem.name]; //visible in AF Dialog == visibleOnFilterBar
						return bIncludeInDialog; //flag decides if the item will be included in the p13n model structure
					}, true);

					P13nBuilder.sortP13nData({
						visible: "visible",
						position: "position"
					}, oP13nData.items);

					this._oAdaptFiltersDialogModel = new JSONModel();
					this._oAdaptFiltersDialogModel.setSizeLimit(1000);
					this._oAdaptFiltersDialogModel.setData(oP13nData);
					this._mAdaptFiltersDialogInitialItemsOrder = [].concat(this._oAdaptFiltersDialogModel.getData().items, this._mAdvancedAreaHiddenFilters);

					var aItems = this._oAdaptFiltersDialogModel.getData().items;
					for (var i = 0; i < aItems.length; i++) {
						if (aItems[i].hasOwnProperty("filterItem")) {
							aItems[i].filterItem.attachChange(fVisibilityChanged);
						}
					}

					this._fRegisteredFilterChangeHandlers = function(oEvent) {
						this._mandatoryFilterChange(oEvent);
					}.bind(this);
					this.attachFilterChange(this._fRegisteredFilterChangeHandlers);

					var fItemHandler = function(oItem, bVisible) {
						if (oItem && oItem.filterItem && oItem.filterItem.getVisibleInFilterBar() !== bVisible) {
							this._selectionChangedInFilterDialogByValue(bVisible, oItem.filterItem);
						}
					}.bind(this);

					var fChange = function(oEvent) {
						var i,
							sTargetGroup,
							aItems,
							bindingContextPath,
							mItem = oEvent.getParameter("item"),
							sReason = oEvent.getParameter("reason"),
							bVisible = sReason === "Add" || sReason === "SelectAll" || sReason === "RangeSelect";

						if ((sReason === "SelectAll" || sReason === "DeselectAll")) {
							if (this._oAdaptFiltersPanel.getCurrentViewKey() === this._oAdaptFiltersPanel.GROUP_KEY) {
								sTargetGroup = oEvent.getParameter("item").group;
								aItems = this._oAdaptFiltersDialogModel.getProperty("/itemsGrouped").filter(function(oItemsGrouped){
									return oItemsGrouped.group === sTargetGroup;
								})[0].items;
							} else {
								aItems = this._oAdaptFiltersDialogModel.getProperty("/items");
							}
							for (i = 0; i < aItems.length; i++) {
								mItem = aItems[i];
								if (!bVisible && this._shouldBeVisible(mItem)) {
									bindingContextPath = "/items/" + i;
									this._oAdaptFiltersDialogModel.setProperty(bindingContextPath + "/visible", true);
								} else {
									fItemHandler(mItem, bVisible);
								}
							}
						} else if (sReason === "RangeSelect" && mItem) {
							if (this._oAdaptFiltersPanel.getCurrentViewKey() === this._oAdaptFiltersPanel.LIST_KEY) {
								// mItem is array containing items for "range selection"
								for (i = 0; i < mItem.length; i++) {
									var mItemInRangeSelection = mItem[i];
									if (!bVisible && this._shouldBeVisible(mItemInRangeSelection)) {
										bindingContextPath = "/items/" + i;
										this._oAdaptFiltersDialogModel.setProperty(bindingContextPath + "/visible", true);
									} else {
										fItemHandler(mItemInRangeSelection, bVisible);
									}
								}
							}
						} else if ((sReason === "Add" || sReason === "Remove") && mItem) {
							if (!bVisible && this._shouldBeVisible(mItem)) {
								mItem.visible = true;
							} else {
								fItemHandler(mItem, bVisible);
							}
						} else if (sReason === "Move") {
							this._bDirtyViaDialog = true;
							this._bMoveTriggered = true;
						}
					}.bind(this);

					var oFilterPanel = new AdaptFiltersPanel({
						enableReorder: true
					});

					oFilterPanel.getView(oFilterPanel.GROUP_KEY).getContent().attachChange(fChange);
					oFilterPanel.getView(oFilterPanel.LIST_KEY).getContent().attachChange(fChange);

					this._oAdaptFiltersPanel = oFilterPanel;

					oFilterPanel.setItemFactory(function(oContext) {

						var oControl, oControlClone, oItem, oObj;

						oObj = oContext.getObject();
						if (!oObj) {
							return undefined;
						}

						oItem = this._determineItemByName(oObj.name, oObj.group);
						if (!oItem || !oItem.filterItem || !oItem.control) {
							return undefined;
						}

						oControl = oItem.control;

						if (!oItem.contentReplaced && oItem.container && oItem.container.getContent()[1] === oControl) {
							oItem.contentReplaced = true;
							oItem.container.removeContent(oControl);
							oControlClone = oControl.clone();
							oItem.container.getContent()[0].setLabelFor("");

							// The cloned control is used for presentation purposes only and
							// with replacing the default ODataModel with the dummy JSONmodel we prevent unnecessary requests to the backend.
							oControlClone.setModel(oDummyJSONModel);

							oItem.container.insertContent(oControlClone, 1);
						}

						return oControl;
					}.bind(this));

					this.fireFiltersDialogBeforeOpen({newDialog: true});

					if (this._mCustomViewInfo && this._mCustomViewInfo.item && this._mCustomViewInfo.item.getKey()) {
						oFilterPanel.addCustomView(this._mCustomViewInfo);

//						if (this._validateMandatoryFields) {
//							this._validateMandatoryFields();
//						}

						oFilterPanel.switchView(sView ? sView : oFilterPanel.getDefaultView());
					}

					var fCancel = function(oEvent) {
						this._dialogCancel(this._oAdaptFiltersDialog);
					}.bind(this);

					var fOk = function(oEvent) {
						this._bOKFiltersDialogTriggered = true;
						this._oAdaptFiltersDialog.close();
					}.bind(this);

					var mReset;
					if (this.getShowRestoreButton() && !this._fGetDataForKeyUser) {
						mReset = {
								onExecute: this._dialogRestore.bind(this),
								idButton: this.getId() + "-resetBtn"
						};
					}

					P13nBuilder.createP13nDialog(oFilterPanel, {
						id: this.getId() + "-adapt-filters-dialog",
						title: this._oRb.getText(this._isNewFilterBarDesign() ? "FILTER_BAR_ADAPT_FILTERS_DIALOG" : "FILTER_BAR_ADV_FILTERS_DIALOG"),
						reset: mReset,
						verticalScrolling: false,
						cancel: fCancel,
						confirm: {
							text: this._oRb.getText("FILTER_BAR_OK"),
							handler:  fOk
						}
						//,additionalButtons: this._createAdditionalButtonsAdaptDialog()

					}).then(function(oAdaptFilterDialog) {

						this._oAdaptFiltersDialog = oAdaptFilterDialog;
						this._oAdaptFiltersDialog.setParent(this);

						this._oVariant.content = this.fetchVariant();
						if (this._oVariantManagement) {
							this._oVariant.key = this._oVariantManagement.getSelectionKey();
							this._oVariant.modified = this._oVariantManagement.currentVariantGetModified();
						}
						this._oInitialVariant = {};
						merge(this._oInitialVariant, this._oVariant);

						this._bOKFiltersDialogTriggered = false;


						this._oAdaptFiltersDialog.attachBeforeOpen(function() {
							this._bDirtyViaDialog = false;
							this._bEnterPressedLeadsToSearch = false;
						}.bind(this));

						this._oAdaptFiltersDialog.attachBeforeClose(function() {
							this._restoreControls(fVisibilityChanged, !this._bOKFiltersDialogTriggered);

							if (!this._bOKFiltersDialogTriggered) {
								this._cancelFilterDialog(false);
							}

							if (this._fGetDataForKeyUser) {
								this._fGetDataForKeyUser(this._createKeyUserChange());
							}
						}.bind(this));

						this._oAdaptFiltersDialog.attachAfterClose(function() {

							if (this._bOKFiltersDialogTriggered) {
								this._aAdaptFilterItems = this._oAdaptFiltersDialogModel.getProperty("/items");
								this._aAdaptFilterItems = [].concat(this._aAdaptFilterItems, this._mAdvancedAreaHiddenFilters); // add hidden filters
								this._mAdvancedAreaFilter = this._mapReorderedFilterItemsInGroups(this._aAdaptFilterItems);
								this._reorderItemsInBasicAreaLayout(this._aAdaptFilterItems);
								this._bMoveTriggered = false; // reset move action
								this._mAdvancedAreaHiddenFilters = [];
							} else {
								this._aAdaptFilterItems = []; // cleanup
							}


							/**
							 * @deprecated As of 1.70
							 */
							(function() {
								this._oBasicAreaLayout.rerender(); // seems to be required from 1.32...
							}.bind(this))();

							this._oAdaptFiltersDialogModel = null;
							this._oAdaptFiltersPanel = null;

							this._oVariant = {};
							this._oInitialVariant = null;
							this._oAdaptFiltersDialog.destroy();
							this._oAdaptFiltersDialog = null;
							this._fGetDataForKeyUser = null;

							if ((this._bOKFiltersDialogTriggered && this._bDirtyViaDialog || this._bResetFiltersDialogTriggered) && !this._bEnterPressedLeadsToSearch) {
								if (!this.isLiveMode || !this.isLiveMode()) {
									this.fireFilterChange();
								}
							}

							this._bEnterPressedLeadsToSearch = false;
							this._bResetFiltersDialogTriggered = false;

							this.fireFiltersDialogClosed({
								context: this._bOKFiltersDialogTriggered ? "SEARCH" : "CANCEL"
							});

							if (this._bNoFiltersInAdvancedArea && this._oHintText && !this._oHintText.getVisible()) {
								this._bNoFiltersInAdvancedArea = false;
								this.setFilterBarExpanded(true);
							}
						}.bind(this));

						if (this.$().closest(".sapUiSizeCompact").length > 0) {
							this._oAdaptFiltersDialog.addStyleClass("sapUiSizeCompact");
						}

						this._oAdaptFiltersDialog.isPopupAdaptationAllowed = function() {
							return false;
						};

						this._oAdaptFiltersDialog.open();

						fResolve();

					}.bind(this));

					oFilterPanel.setP13nModel(this._oAdaptFiltersDialogModel);

					return;
				}

				fResolve();
			}.bind(this));
		}.bind(this));
	};

	/**
	 * Maps filter items by their groups after reorder applied
	 *
	 * @param {array} aItems filter items
	 * @returns {array} filter groups with filter items
	 * @private
	 */
	FilterBar.prototype._mapReorderedFilterItemsInGroups = function(aItems) {
		var aResult = [];

		aItems.forEach(function (item) {
			if (!aResult[item.group]) {
				aResult[item.group] = {};
				aResult[item.group].filterItem = null;
				aResult[item.group].items = [];
			}

			if (!aResult[item.group].items) {
				aResult[item.group].items = [];
			}
			aResult[item.group].items.push(this._mAdvancedAreaFilter[item.group].items.find(function(oFilterItem) {
				return oFilterItem.filterItem === item.filterItem;
			}));

			if (!aResult[item.group].filterItem) {
				aResult[item.group].filterItem = item.filterItem;
			}

		}.bind(this));

		return aResult;
	};

	/**
	 * Reorders item in <code>_oBasicAreaLayout</code> based on moved items in Adapt Filters Dialog
	 *
	 * @param {array} aFilterItems filter items
	 * @private
	 */
	FilterBar.prototype._reorderItemsInBasicAreaLayout = function (aFilterItems) {
		if (!aFilterItems || !aFilterItems.length) {
			return;
		}

		aFilterItems.forEach(function (oFilterItem, iIndex) {
			var oFilterItemTemp = this._determineItemByName(oFilterItem.name, oFilterItem.group);

			if (!oFilterItemTemp || !oFilterItemTemp.filterItem || !oFilterItemTemp.control) {
				return;
			}

			var oRemovedControl = this._oBasicAreaLayout.removeContent(oFilterItemTemp.container);
			this._oBasicAreaLayout.insertContent(oRemovedControl, iIndex + 1);

			return;
		}.bind(this));
	};

	/**
	 * Applies items order in <code>_mAdvancedAreaFilter</code> based on order from variant
	 *
	 * @private
	 */
	FilterBar.prototype._reorderItemsInAdvancedAreaFilter = function () {
		var mState, aReorderedFilterItems;

		mState = this._createStructureForAdaptFiltersDialog();
		aReorderedFilterItems = mState.allFilters;
		this._mAdvancedAreaFilter = this._mapReorderedFilterItemsInGroups(aReorderedFilterItems);
	};

	/**
	 * Determines if the filters dialog is opened.
	 * @protected
	 * @returns {boolean} State of filters dialog
	 */
	FilterBar.prototype.isDialogOpen = function() {
		return this._oAdaptFiltersDialog ? true : false;
	};

	FilterBar.prototype._dialogCancel = function(oFilterDialog) {
		if (oFilterDialog) {
			this._bOKFiltersDialogTriggered = false;

			this.fireFiltersDialogCancel();

			oFilterDialog.close();
		}
	};


	FilterBar.prototype._dialogRestore = function() {

		this.reset();

		if (this._oVariantManagement && this._oVariantManagement.getVisible() && !this._oVariantManagement.getInErrorState()) {
			this._oVariantManagement.currentVariantSetModified(false);
		}

		if (this._oAdaptFiltersPanel) {
			var aItemsOrder = [], oAdaptFiltersDialogData = this._oAdaptFiltersDialogModel.getData();

			if (this._bMoveTriggered && this._mAdaptFiltersDialogInitialItemsOrder.length > 0) {
				// apply items order based on _mAdaptFiltersDialogInitialItemsOrder filled in on open dialog from variant
				this._mAdaptFiltersDialogInitialItemsOrder.forEach(function (oItem, iIndex) {
					aItemsOrder[oItem.name] = iIndex;
				});
				oAdaptFiltersDialogData.items.sort(function (a, b) {
					return aItemsOrder[a.name] - aItemsOrder[b.name];
				});
			} else {
				// apply items order based on _aOrderedFilterItems from variant
				this._aOrderedFilterItems.forEach(function (oItem, iIndex) {
					aItemsOrder[oItem.name] = iIndex;
				});
				oAdaptFiltersDialogData.items.sort(function (a, b) {
					return aItemsOrder[a.name] - aItemsOrder[b.name];
				});
				P13nBuilder.sortP13nData({
					visible: "visible",
					position: "position"
				}, oAdaptFiltersDialogData.items);
			}
			this._oAdaptFiltersPanel.setP13nData(oAdaptFiltersDialogData);
		}

		this._bDirtyViaDialog = false;
		this._bResetFiltersDialogTriggered = true;
	};


	FilterBar.prototype._createButtons = function(oToolbar) {

		var that = this;

		this._oSearchButton = new Button(this.getId() + "-btnGo", {
			visible: this.getShowGoOnFB(),
			text: this._oRb.getText("FILTER_BAR_GO"),
			type: ButtonType.Emphasized
		}).addStyleClass("sapUiCompFilterBarPaddingRightBtn");

		ShortcutHintsMixin.addConfig(
			this._oSearchButton, {
				event: "search"
			},
			this
		);

		this._oSearchButton.attachPress(function() {
			that._oSearchButton.focus();
			that._searchFromFilterBar();
		});
		oToolbar.addContent(this._oSearchButton);

		this._oHideShowButton = new Button(this.getId() + "-btnShowHide", {
			text: this._oRb.getText("FILTER_BAR_HIDE"),
			type: ButtonType.Transparent,
			enabled: false
		});
		this._oHideShowButton.attachPress(function() {
			that._toggleHideShow();
		});
		oToolbar.addContent(this._oHideShowButton);

		// clear button
		this._oClearButtonOnFB = new Button(this.getId() + "-btnClear", {
			visible: this.getShowClearOnFB(),
			text: this._oRb.getText("FILTER_BAR_CLEAR"),
			type: ButtonType.Transparent,
			enabled: false
		}).addStyleClass("sapUiCompFilterBarPaddingRightBtn");
		this._oClearButtonOnFB.attachPress(function() {
			that.clear();
			if (that.isLiveMode && that.isLiveMode()) {
				that._searchFromFilterBar();
			}
		});
		oToolbar.addContent(this._oClearButtonOnFB);

		this._oRestoreButtonOnFB = new Button(this.getId() + "-btnRestore", {
			visible: this.getShowRestoreOnFB(),
			text: this._oRb.getText("FILTER_BAR_RESTORE"),
			type: ButtonType.Transparent,
			enabled: false
		});
		this._oRestoreButtonOnFB.attachPress(function() {
			that.reset();
			if (that._oVariantManagement) {
				that._oVariantManagement.currentVariantSetModified(false);
			}
		});
		oToolbar.addContent(this._oRestoreButtonOnFB);

		this._oFiltersButton = new Button(this.getId() + "-btnFilters", {
			visible: this.getShowFilterConfiguration(),
			text: this._oRb.getText("FILTER_BAR_ACTIVE_FILTERS_ZERO"),
			type: ButtonType.Transparent,
			enabled: false
		});

		this._oFiltersButton.attachPress(function() {
			this._filtersButtonPressed();
		}.bind(this));
		oToolbar.addContent(this._oFiltersButton);

	};

	FilterBar.prototype._toggleAllFilters = function() {
		var oEightInput, oDelegate;
		this._bShowAllFilters = !this._bShowAllFilters;
		this._oShowAllFiltersButton.setVisible(!this._bShowAllFilters);
		this._rerenderFilters();

		if (!this._bDelegateAdded && this.getFilterGroupItems()) {
			// After the 'Show all filters' button disappear for acc reasons the focus should go
			// to the 8th input which appears visible in the place of the button
			oEightInput = this.getFilterGroupItems()[7].getControl();
			oDelegate = {
				onAfterRendering: function () {
					oEightInput.focus();
				}
			};
			oEightInput.addDelegate(oDelegate, this);
			this._bDelegateAdded = true;
		}
	};

	FilterBar.prototype.initShowAllFiltersButton = function() {
		this._oShowAllFiltersButton = new Button(this.getId() + "-btnShowAll", {
			text: this._oRb.getText("FILTER_BAR_VH_SHOW_ALL"),
			type: ButtonType.Transparent,
			press: this._toggleAllFilters.bind(this)
		});

		this._oBasicAreaLayout.addEndContent(this._oShowAllFiltersButton);
	};


	/**
	 * Creates the variant management.
	 * @private
	 * @returns {sap.ui.comp.variants.VariantManagement} the VM control
	 */
	FilterBar.prototype._createVariantLayout = function() {

		this._oVariantManagement = this._createVariantManagement();

		if (this._possibleToChangeVariantManagement()) {
			this._oVariantManagement.setVisible(false);
		}

		this._registerVariantManagement();

		return this._oVariantManagement;
	};

	FilterBar.prototype._createToolbar = function(bIgnoreVM) {

		var oToolbar = new OverflowToolbar(this.getId() + "-toolbar");

		if (!bIgnoreVM) {
			var oVariantLayout = this._createVariantLayout();
			oToolbar.addContent(oVariantLayout);
		}
		oToolbar.addContent(new ToolbarSpacer());

		this._createButtons(oToolbar);

		oToolbar.addStyleClass("sapUiCompFilterBarToolbar");
		oToolbar.setLayoutData(new GridData({
			span: "L12 M12 S12"
		}));

		return oToolbar;
	};

	FilterBar.prototype._replaceVariantManagement = function(oVariantManagement) {
		if (this._oVariantManagement) {
			this._unregisterVariantManagement();

			if (this._oToolbar && this._oToolbar.getContent(this._oVariantManagement)) {
				this._oToolbar.removeContent(this._oVariantManagement);
			}

			this._oVariantManagement.destroy();
		}

		this._oVariantManagement = oVariantManagement;
		this._registerVariantManagement();

		this._adaptNewFilterBarDesign();
	};

	/**
	 * Creates the form for the advanced area, where all the filters will be placed. Only relevant for the value help scenario.
	 * @private
	 * @returns {sap.ui.layout.form.Form} the form for the filter fields
	 */
	FilterBar.prototype._createAdvancedAreaForm = function() {

		if ((!Form || !FormContainer || !FormElement || !ResponsiveGridLayout) && !this._bAdvancedRequested) {
			Form = sap.ui.require("sap/ui/layout/form/Form");
			FormContainer = sap.ui.require("sap/ui/layout/form/FormContainer");
			FormElement = sap.ui.require("sap/ui/layout/form/FormElement");
			ResponsiveGridLayout = sap.ui.require("sap/ui/layout/form/ResponsiveGridLayout");
			if (!Form || !FormContainer || !FormElement || !ResponsiveGridLayout) {
				sap.ui.require([
					"sap/ui/layout/form/Form", "sap/ui/layout/form/FormContainer", "sap/ui/layout/form/FormElement", "sap/ui/layout/form/ResponsiveGridLayout"
				], _AdvancedLoaded.bind(this));
				this._bAdvancedRequested = true;
			}
		}
		if (!Form || !FormContainer || !FormElement || !ResponsiveGridLayout) {
			return;
		}

		var oAdvancedLayout = new ResponsiveGridLayout(this.getId() + "-AdvancedFormLayout");

		oAdvancedLayout.addStyleClass("sapUiCompFilterBarPaddingForm");

		oAdvancedLayout.setColumnsL(3);
		oAdvancedLayout.setColumnsM(2);
		var oForm = new Form(this.getId() + "-AdvancedForm", {
			editable: true
		});
		oForm.setLayout(oAdvancedLayout);

		if (!this.oInvisibleFormTitle) {
			this.oInvisibleFormTitle = new InvisibleText({
				text: this._oRb.getText("ADVANCED_SEARCH_TEXT")
			});
			this.addContent(this.oInvisibleFormTitle);
		}
		oForm.addAriaLabelledBy(this.oInvisibleFormTitle);

		this._oAdvancedPanel.addContent(oForm);

		return oForm;
	};

	function _AdvancedLoaded(fnForm, fnFormContainer, fnFormElement, fnResponsiveGridLayout) {

		Form = fnForm;
		FormContainer = fnFormContainer;
		FormElement = fnFormElement;
		ResponsiveGridLayout = fnResponsiveGridLayout;
		this._bAdvancedRequested = false;
		if (!this._bIsBeingDestroyed) {
			if (!this.getIsRunningInValueHelpDialog()) {
				this._oAdvancedAreaForm = this._createAdvancedAreaForm();
				this._rerenderAA();
			}
		}

	}

	/**
	 * Adds a selection field to a FormContainer and this FormContainer to the basic area form.
	 * @private
	 * @param {sap.ui.comp.filterbar.FilterBar} oFilterItem filter
	 * @returns {sap.ui.layout.VerticalLayout} the container
	 */
	FilterBar.prototype._addControlToBasicAreaFormContainer = function(oFilterItem) {

		var oControl = oFilterItem._getControl();
		if (!oControl) {
			Log.error("no Control obtained");
			return null;
		}

		var oLabel = oFilterItem.getLabelControl(this.getId());
		if (!oLabel) {
			Log.error("no Label obtained");
			return null;
		}

		this._adaptGroupTitleForFilter(oFilterItem);

		return this._addControlToBasicAreaContainer(oFilterItem, oControl, oLabel);

	};

	/**
	 * Adds a selection field to a FormContainer and the FormContainer to the basic area form
	 * @private
	 * @param {sap.ui.comp.filterbar.FilterBar} oFilterItem the filter item
	 * @param {sap.ui.core.Control} oControl the filter control
	 * @param {sap.m.Label} oLabel the label of the filter
	 * @returns {sap.ui.layout.VerticalLayout} the container
	 */
	FilterBar.prototype._addControlToBasicAreaContainer = function(oFilterItem, oControl, oLabel) {

		var oVLayout = new VerticalLayout();
		if (oControl.setWidth) {
			oControl.setWidth("100%");
		}
		oVLayout.setWidth("100%");

		if (oLabel) {
			if (!oLabel.hasStyleClass("sapUiCompFilterLabel")) {
				oLabel.addStyleClass("sapUiCompFilterLabel");
			}
			oVLayout.addContent(oLabel);

			if (oLabel.setLabelFor) {
				if (oFilterItem && oControl) {
					oLabel.setLabelFor(oControl);

					if (oControl.setTooltip && oFilterItem.getControlTooltip()) {
						oControl.setTooltip(oFilterItem.getControlTooltip());
					}
				}
			}
		}

		oVLayout.addContent(oControl);

		if ((!this.getAdvancedMode() || this.getIsRunningInValueHelpDialog()) && !this._oAdaptFiltersDialog) {
			if (oFilterItem && oFilterItem.getVisible() && oFilterItem.getVisibleInFilterBar()) {
				var aContent = this._oBasicAreaLayout.getContent();
				if (this._isNewFilterBarDesign() && !this._isPhone()) {
					this._oBasicAreaLayout.insertContent(oVLayout, aContent.length);
				} else {
					this._oBasicAreaLayout.addContent(oVLayout);
				}
			}
		}
		return oVLayout;
	};

	FilterBar.prototype._rerenderAA = function() {

		if (this._oAdvancedAreaForm) {
			this._oAdvancedAreaForm.removeAllFormContainers();

			var aControls = this._flattenMap();
			this._layOutAA(aControls);
		}

	};

	FilterBar.prototype._groupsWithVisibleFilters = function() {
		var nItemsInGroup, oFilterItem, mGroups = this._mAdvancedAreaFilter;
		if (this._mAdvancedAreaFilter && Object.keys(this._mAdvancedAreaFilter).length > 1) {
			mGroups = {};
			for ( var sGroupName in this._mAdvancedAreaFilter) {
				if (sGroupName && this._mAdvancedAreaFilter[sGroupName] && this._mAdvancedAreaFilter[sGroupName].items) {
					nItemsInGroup = this._mAdvancedAreaFilter[sGroupName].items.length;
					for (var i = 0; i < this._mAdvancedAreaFilter[sGroupName].items.length; i++) {
						oFilterItem = this._mAdvancedAreaFilter[sGroupName].items[i].filterItem;
						if (oFilterItem && (oFilterItem.getHiddenFilter() || !oFilterItem.getVisible())) {
							nItemsInGroup--;
						}
					}

					if (nItemsInGroup) {
						mGroups[sGroupName] = {};
					}
				}
			}
		}

		return mGroups;
	};

	/**
	 * Recreates the layout for all visible filters in the advanced area.
	 * @private
	 * @param {array} aControls list of visible advanced area filter elements
	 */
	FilterBar.prototype._layOutAA = function(aControls) {

		var mGroups = this._groupsWithVisibleFilters();

		if (mGroups && Object.keys(mGroups).length > 1) {
			this._layOutAAMultipleGroup(aControls);
		} else {
			this._layOutAASingleGroup(aControls);
		}
	};

	/**
	 * Recreates the layout for all visible filters in the advanced area. Each Group will be rendered in a FormContainer.
	 * @private
	 * @param {array} aControls list of visible advanced area filter elements
	 */
	FilterBar.prototype._layOutAAMultipleGroup = function(aControls) {

		var i, j, nGroups = 0, oFormContainer = null, bWithoutTitle = false;

		for (i = 0; i < aControls.length; i++) {
			if (aControls[i].control === null) {
				nGroups++;
			}
		}

		if (this._mAdvancedAreaFilter && (Object.keys(this._mAdvancedAreaFilter).length === 2) && this._mAdvancedAreaFilter[FilterBar.INTERNAL_GROUP] && this._mAdvancedAreaFilter[FilterBar.INTERNAL_GROUP].items && (this._mAdvancedAreaFilter[FilterBar.INTERNAL_GROUP].items.length > 0)) {
			bWithoutTitle = true;
		}

		var oAdvancedLayout = this._oAdvancedAreaForm.getLayout();
		if (oAdvancedLayout) {
			if (nGroups >= 3) {
				oAdvancedLayout.setLabelSpanL(5);
				oAdvancedLayout.setLabelSpanM(5);
				oAdvancedLayout.setColumnsL(3);
				oAdvancedLayout.setColumnsM(2);
			} else if (nGroups === 2) {
				oAdvancedLayout.setLabelSpanL(4);
				oAdvancedLayout.setLabelSpanM(5);
				oAdvancedLayout.setColumnsL(2);
				oAdvancedLayout.setColumnsM(2);
			} else if (nGroups === 1) {

				// + dummy group
				oAdvancedLayout.setLabelSpanL(4);
				oAdvancedLayout.setLabelSpanM(5);
				oAdvancedLayout.setColumnsL(2);
				oAdvancedLayout.setColumnsM(2);
			}
		}

		for (i = 0; i < aControls.length; i++) {
			if (aControls[i].control === null) {
				oFormContainer = new FormContainer();

				if ((Object.keys(this._mAdvancedAreaFilter).length > 1) && !bWithoutTitle) { // hide group when only one group is present

					if ((nGroups >= 3) && (aControls[i].filterItem.getGroupName() === FilterBar.INTERNAL_GROUP)) {
						oFormContainer.setTitle(this._oRb.getText("FILTER_BAR_BASIC_GROUP"));
					} else {
						oFormContainer.setTitle(aControls[i].filterItem.getGroupTitle());
					}
// } else {
// var aAliaLabeledBy = this._oAdvancedAreaForm.getAriaLabelledBy();
// if (aAliaLabeledBy.indexOf(this.oInvisibleFormTitle.getId()) < 0) {
// this._oAdvancedAreaForm.addAriaLabelledBy(this.oInvisibleFormTitle);
// }
				}
				this._oAdvancedAreaForm.addFormContainer(oFormContainer);

				j = i + 1;
				while (j < aControls.length && (aControls[j].control)) {
					this._addControlToAdvancedArea(aControls[j].filterItem, aControls[j].control, oFormContainer);
					j++;
				}

				i = j - 1;
			}
		}

		if (nGroups === 1) {
			this._oAdvancedAreaForm.addFormContainer(new FormContainer()); // dummy
		}
	};

	/**
	 * If only one group with multiple filter fields is available, it will be layouted in two columns. a dummy group will be created and the controls
	 * will be distributed between them.
	 * @private
	 * @param {array} aControls list of visible advanced area filter elements. First element is a group
	 */
	FilterBar.prototype._layOutAASingleGroup = function(aControls) { // adapt to LMS

		var i, idx, nCount, bMod;
		var nFields = aControls.length - 1;
		var nNewGroups = nFields > 2 ? 2 : 1;

		if (nNewGroups > 1) {
			nCount = Math.floor(nFields / nNewGroups);
			bMod = ((nCount * nNewGroups) < nFields);

			for (i = 1; i < nNewGroups; i++) {
				idx = i * nCount;
				if (bMod) {
					++idx;
				}

				if ((idx + i) < aControls.length) {
					aControls.splice(idx + i, 0, aControls[0]); // add dummy group
				}
			}
		}

		this._layOutAAMultipleGroup(aControls);
	};

	/**
	 * Converts the map containing the advanced area filters to an array for simpler handling; only visible filter items are considered.
	 * @private
	 * @returns {array} oControl the visible filter fields
	 */
	FilterBar.prototype._flattenMap = function() {

		var n = null, i, aControls = [], bGroupIsAdded;

		if (this._mAdvancedAreaFilter) {

			for (n in this._mAdvancedAreaFilter) {

				if (n && this._mAdvancedAreaFilter[n].items) {

					bGroupIsAdded = false;
					for (i = 0; i < this._mAdvancedAreaFilter[n].items.length; i++) {
						var oItem = this._mAdvancedAreaFilter[n].items[i];

						if (oItem.filterItem && oItem.filterItem.getVisibleInFilterBar() && oItem.filterItem.getVisible() && !oItem.filterItem.getHiddenFilter()) {

							if (!bGroupIsAdded) {
								bGroupIsAdded = true;

								aControls.push({
									control: null,
									filterItem: this._mAdvancedAreaFilter[n].filterItem
								});
							}

							aControls.push({
								control: oItem.control,
								filterItem: oItem.filterItem
							});
						}
					}
				}
			}
		}

		return aControls;
	};


	/**
	 * Adapts the visibility of the filter containers.
	 * @private
	 * @param {object} oItem representing the filter item
	 * @param {boolean} bHideExplicitly - True if we want to hide from outside the filter item
	 */
	FilterBar.prototype._rerenderItem = function(oItem, bHideExplicitly) {

		var bShowItem;
		if (oItem) {

			bShowItem = oItem.filterItem.getVisible() &&
				oItem.filterItem.getVisibleInFilterBar() &&
				!oItem.filterItem.getHiddenFilter();

			if (bHideExplicitly !== undefined) {
				bShowItem = bShowItem && !bHideExplicitly;
			}

			if (oItem.container) {

				oItem.container.setVisible(bShowItem);
				if (bShowItem) {
					this._addContainer(oItem);
				} else {
					this._removeContainer(oItem);
				}
			}
		}
	};

	/**
	 * Adapt the visibility for all filter containers.
	 * @private
	 */
	FilterBar.prototype._rerenderFilters = function() {

		var i;
		var n = null;
		var oItem = null;

		var arrVisibilityMap = [];

		if (this._mAdvancedAreaFilter) {
			for (n in this._mAdvancedAreaFilter) {
				if (n && this._mAdvancedAreaFilter[n] && this._mAdvancedAreaFilter[n].items) {
					for (i = 0; i < this._mAdvancedAreaFilter[n].items.length; i++) {
						oItem = this._mAdvancedAreaFilter[n].items[i];
						var bIsVisibleItem = oItem.filterItem.getVisible() &&
							oItem.filterItem.getVisibleInFilterBar() &&
							!oItem.filterItem.getHiddenFilter();
						if (bIsVisibleItem) {
							arrVisibilityMap.push({ visible: bIsVisibleItem, item: oItem });
						} else {
							this._removeContainer(oItem);
						}
					}
				}
			}
		}

		var bShouldDisplayFirstNFilters = this.getIsRunningInValueHelpDialog() && !this._bShowAllFilters;
		var nTotalVisibleFilterItems = arrVisibilityMap.length;
		var nMaxItems = arrVisibilityMap.length > this._nMaxFiltersByDefault ?
							this._nMaxFiltersByDefault - 1 :
							this._nMaxFiltersByDefault;

		for (var index = 0; index < arrVisibilityMap.length; index++) {
			var bExplicitlyHide = bShouldDisplayFirstNFilters && index >= nMaxItems;

			this._rerenderItem(arrVisibilityMap[index].item, bExplicitlyHide);
		}

		if (this._oShowAllFiltersButton) {
			if (bShouldDisplayFirstNFilters && nTotalVisibleFilterItems > this._nMaxFiltersByDefault ) {
				this._oShowAllFiltersButton.setVisible(true);
			} else {
				this._oShowAllFiltersButton.setVisible(false);
			}
		}

		this._updateToolbarText();
	};

	/**
	 * Adapts the visibility for all filter containers.
	 * @protected
	 */
	FilterBar.prototype.rerenderFilters = function() {

		this._rerenderFilters();
	};


	FilterBar.prototype._setTriggerFilterChangeState = function(bFlag) {

		this._triggerFilterChangeState = bFlag;
	};
	FilterBar.prototype._getTriggerFilterChangeState = function() {

		return this._triggerFilterChangeState;
	};

	/**
	 * Sets the semaphore for variant change.
	 * @private
	 * @param {boolean} bFlag setting the semaphore state
	 */
	FilterBar.prototype._setConsiderFilterChanges = function(bFlag) {

		this._filterChangeSemaphore = bFlag;
	};

	/**
	 * Retrieves the semaphore for variant change.
	 * @private
	 * @returns {boolean} the semaphore state
	 */
	FilterBar.prototype._getConsiderFilterChanges = function() {

		return this._filterChangeSemaphore;
	};

	/**
	 * @override
	 */
	FilterBar.prototype.fireFilterChange = function(oEvent) {
		this._updateToolbarText();

		if (!this._getTriggerFilterChangeState()) {
			return;
		}

		if (this._getConsiderFilterChanges() && this._oVariantManagement && !this._oVariantManagement.getInErrorState()) {
			this._oVariantManagement.currentVariantSetModified(true);
		}

		if (this._oAdaptFiltersDialog && !(this._oAdaptFiltersDialog.isOpen())) {
			return;
		}

		if (this._oAdaptFiltersDialog) {
			this._bDirtyViaDialog = true;
			this._checkAssignedFilters();
		}

		this.fireEvent("filterChange", oEvent);
	};

	/**
	 * Prepares event object and fire the 'filterChange' event.
	 * @private
	 * @param {boolean} bVisible indicated whether an filter was added or removed
	 * @param {sap.ui.core.Control} oControl which was either added or removed
	 */
	FilterBar.prototype._notifyAboutChangedFilters = function(bVisible, oControl) {

		var oObj, oFilterItem = this._determineByControl(oControl);

		if (bVisible) {
			oObj = {
				"added": oControl,
				"filterItem": oFilterItem
			};
		} else {
			oObj = {
				"deleted": oControl,
				"filterItem": oFilterItem
			};
		}

		this.fireFilterChange(oObj);

	};

	FilterBar.prototype._determineVariantFiltersInfo = function(bConsiderInvisibleFilters, bIgnoreConsiderFilter) {
		var i;
		var n = null, oItem, oFilter;
		var aFilters = [];
		if (this._mAdvancedAreaFilter) {
			for (n in this._mAdvancedAreaFilter) {
				if (n) {
					if (this._mAdvancedAreaFilter[n].items) {
						for (i = 0; i < this._mAdvancedAreaFilter[n].items.length; i++) {
							oItem = this._mAdvancedAreaFilter[n].items[i];
							if (bConsiderInvisibleFilters || oItem.filterItem.getVisible()) {
								oFilter = {
									group: oItem.filterItem.getGroupName(),
									name: oItem.filterItem.getName(),
									partOfCurrentVariant: oItem.filterItem.getPartOfCurrentVariant(),
									visibleInFilterBar: oItem.filterItem.getVisibleInFilterBar(),
									visible: oItem.filterItem.getVisible()
								};
								if (bIgnoreConsiderFilter || this._considerFilter(oFilter)) {
									aFilters.push(oFilter);
								}
							}
						}
					}
				}
			}
		}

		return aFilters;
	};

	FilterBar.prototype.mergeVariant = function(oBase, oDelta) {

		var oMerge = {};
		merge(oMerge, oDelta);
		oMerge.filterbar = [];
		oMerge.filterBarVariant = {};

		merge(oMerge.filterbar, oBase.filterbar);
		merge(oMerge.filterBarVariant, oBase.filterBarVariant);

		if (oDelta && (oDelta.hasOwnProperty("version"))) {
			oMerge.filterbar = this._mergeVariantFields(oMerge.filterbar, oDelta.filterbar);
			oMerge.filterBarVariant = oDelta.filterBarVariant;
		}

		return oMerge;
	};

	FilterBar.prototype._mergeVariantFields = function(aBaseFilters, aDeltaFilters) {

		var i;

		aDeltaFilters.forEach(function(element) {
			for (i = 0; i < aBaseFilters.length; i++) {
				if ((aBaseFilters[i].group === element.group) && (aBaseFilters[i].name === element.name)) {
					aBaseFilters.splice(i, 1);
					break;
				}
			}

		});

		return aBaseFilters.concat(aDeltaFilters);

	};

	FilterBar.prototype._isUi2Mode = function() {
		if (this._oVariantManagement instanceof SmartVariantManagementUi2) {
			return true;
		}

		return false;
	};

	FilterBar.prototype._isDeltaHandling = function() {
		if (this._isUi2Mode()) {
			return false;
		}

		return this.getDeltaVariantMode();
	};

	FilterBar.prototype._getStandardVariant = function() {

		return this._oVariantManagement.getStandardVariant(this);

	};

	FilterBar.prototype._considerFilter = function(oFilter) {

		if (!this._isDeltaHandling()) {
			return true;
		}

		var oBaseFilter = null;
		var oStandardVariant = this._getStandardVariant();
		if (oStandardVariant && oStandardVariant.filterbar) {
			for (var i = 0; i < oStandardVariant.filterbar.length; i++) {
				if ((oStandardVariant.filterbar[i].group === oFilter.group) && (oStandardVariant.filterbar[i].name === oFilter.name)) {
					oBaseFilter = oStandardVariant.filterbar[i];
					break;
				}
			}
		}

		if (!oBaseFilter) {

			if (!oFilter.partOfCurrentVariant) {
				return false;
			}
			return true;
		}

		if ((oBaseFilter.partOfCurrentVariant !== oFilter.partOfCurrentVariant) || (oBaseFilter.visibleInFilterBar !== oFilter.visibleInFilterBar) || (oBaseFilter.visible !== oFilter.visible)) {
			return true;
		}

		return false;
	};

	/**
	 * Adds a filter to the form container.
	 * @private
	 * @param {sap.ui.comp.filterbar.FilterItem} oFilterItem the corresponding filter item
	 * @param {sap.ui.core.Control} oControl the control itself
	 * @param {sap.ui.layout.form.FormContainer} oFormContainer in which the control will be added
	 */
	FilterBar.prototype._addControlToAdvancedArea = function(oFilterItem, oControl, oFormContainer) {

		var oFormElement = new FormElement({
			label: oFilterItem.getLabelControl(this.getId()),
			fields: [
				(oControl !== null) ? oControl : new Text()
			]
		});

		oFormContainer.addFormElement(oFormElement);
	};

	/**
	 * Determines if an item is relevant for the query, based on its visibility.
	 * @private
	 * @param {sap.ui.comp.filterbar.FilterItem} oFilterItem which is being checked
	 * @returns {boolean} true for relevant, false for not relevant
	 */
	FilterBar.prototype._determineVisibility = function(oFilterItem) {

		var bVisible = false;

		if (oFilterItem) {
			bVisible = oFilterItem.getVisible() && (oFilterItem.getVisibleInFilterBar() || this._checkIfFilterHasValue(oFilterItem.getName()));
			bVisible = bVisible && !oFilterItem.getHiddenFilter();
		}

		return bVisible;
	};

	/**
	 * Returns an array of all visible filters.
	 * @private
	 * @returns {array} all visible advanced items
	 */
	FilterBar.prototype._retrieveVisibleAdvancedItems = function() {

		var i, n = null, oItem;
		var aAdvancedItems = [];

		if (this._mAdvancedAreaFilter) {
			for (n in this._mAdvancedAreaFilter) {
				if (n) {
					if (this._mAdvancedAreaFilter[n] && this._mAdvancedAreaFilter[n].items) {
						for (i = 0; i < this._mAdvancedAreaFilter[n].items.length; i++) {
							oItem = this._mAdvancedAreaFilter[n].items[i];
							if (oItem) {
								// if (oItem.filterItem.getVisibleInFilterBar() || oItem.filterItem.getPartOfCurrentVariant()) {
								if (this._determineVisibility(oItem.filterItem)) {
									aAdvancedItems.push(oItem);
								}
							}
						}
					}
				}
			}
		}

		return aAdvancedItems;
	};

	/**
	 * Retrieves the controls for all visible filters.
	 * @protected
	 * @param {boolean} bWithName determines the returning structure. Either list of controls, or list of filter name and control.
	 * @param {boolean} bConsiderParameters determines if parameters should be considered.
	 * @returns {array} all visible controls/filter name & controls
	 */
	FilterBar.prototype._retrieveCurrentSelectionSet = function(bWithName, bConsiderParameters) {

		var i, oItem, oObj, aArray = [];

		var aItems = this._retrieveVisibleAdvancedItems();

		for (i = 0; i < aItems.length; i++) {
			oItem = aItems[i];
			if (oItem.control && oItem.filterItem && (bConsiderParameters || !oItem.filterItem._isParameter())) {
				if (bWithName) {
					oObj = {
						name: aItems[i].filterItem.getName(),
						control: aItems[i].control
					};
				} else {
					oObj = aItems[i].control;
				}

				aArray.push(oObj);
			}
		}

		return aArray;
	};

	/**
	 * Executes the search event. Controls of all visible filters will be passed as event-parameters.
	 * @public
	 * @returns {boolean} indicates the validation result. true means no validation errors.
	 */
	FilterBar.prototype.search = function() {
		this.fireSearch({
			selectionSet: this._retrieveCurrentSelectionSet(false),
			firedFromFilterBar: this._bSearchFiredFromFilterBar
		});
		this._bSearchFiredFromFilterBar = false;
		return true;
	};

	FilterBar.prototype._searchFromFilterBar = function () {
		this._bSearchFiredFromFilterBar = true;
		this.search.apply(this, arguments);
	};

	/**
	 * Executes the clear event. Controls of all visible filters will be passed as event-parameters.
	 * @private
	 */
	FilterBar.prototype.clear = function() {

		var parameter = {};
		parameter.selectionSet = this._retrieveCurrentSelectionSet(false);

		this._deleteValidatingTokenFlag(parameter.selectionSet);

		this._clearErrorState();

		this.fireClear(parameter);

		this._updateToolbarText();
	};

	FilterBar.prototype._deleteValidatingTokenFlag = function (aSelectionSet) {
		aSelectionSet.forEach(function(oControl) {

			// ignore the token completion
			if (oControl.hasOwnProperty("__bValidatingToken")) {
				delete oControl.__bValidatingToken;
			}
		});
	};

	/**
	 * Executes the reset event. Controls of all visible filters will be passed as event-parameters.
	 * @private
	 */
	FilterBar.prototype.reset = function() {

		var parameter = {};
		parameter.selectionSet = this._retrieveCurrentSelectionSet(false);

		this.fireReset(parameter);

		this._resetVariant();
	};

	/**
	 * Obtains from the variant management the current selected entry and applies the corresponding variant. In case nothing was selected variant
	 * management returns null -> no variant will be applied.
	 * @private
	 */
	FilterBar.prototype._resetVariant = function() {

		var oVariant = null, oVariantSnapshot = null;

		this._resetFiltersInErrorValueState();

		var aSelectionSet = this._retrieveCurrentSelectionSet(false);
		this._deleteValidatingTokenFlag(aSelectionSet);

		if (this._oVariantManagement) { // in case a variant is currently selected, re-apply this variant

			var sKey = this._oVariantManagement.getSelectionKey() || this._oVariantManagement.getStandardVariantKey();
			if (sKey) {

				oVariant = this._oVariantManagement.getVariantContent(this, sKey);
				if (this._oVariant) {
					this._oVariant.content = oVariant;
					this._oVariant.modified = false;

					if (this.getPersistencyKey() && this._oInitialVariant) {
						// BCP: 1780323271
						// reset the snapshot
						this._oInitialVariant.content = oVariant;
						this._oInitialVariant.modified = false;

						// BCP: 1770468283
						// reset the variant key
						this._oInitialVariant.key = sKey;
					}
				}

				if (!this.getPersistencyKey() && (this.getUseSnapshot() === undefined) && this._oInitialVariant && this._oInitialVariant.content) {
					oVariantSnapshot = this._oInitialVariant.content;
				}

				if (oVariant || oVariantSnapshot) {
					this.applyVariant(oVariant || oVariantSnapshot, "RESET");
				}
			}
		}
	};

	FilterBar.prototype._removeValuesForNonPartOfCurrentVariants = function(aFilterNonPartOfCurrentVariant) {
		// non smart filterbar scenario
	};

	FilterBar.prototype._removeEmptyFilters = function(mFilterValues) {
		// non smart filterbar scenario
		return mFilterValues;
	};

	/**
	 * Retrieve the data for a specific variant and apply it.
	 * @private
	 * @param {object} oVariant the variant
	 * @param {string} sContext may be undefined, RESET or CANCEL and indicates the source of the appliance
	 * @param {boolean} bInitial indicates if the apply was executed during the initialization phase
	 * @param {string} sVersion of the variant
	 */
	FilterBar.prototype._applyVariant = function(oVariant, sContext, bInitial, sVersion) {

		var aFieldsAndValues, aPersFields = null, bTriggerFilterChangeState, bExecuteOnSelection = false, aOrderedFields = [];

		if (oVariant) {

			if (bInitial) {
				bTriggerFilterChangeState = this._getTriggerFilterChangeState();
				this._setTriggerFilterChangeState(false);
			}

			this._setConsiderFilterChanges(false);

			aFieldsAndValues = oVariant.filterBarVariant;
			aPersFields = oVariant.filterbar;

			if (this._oFilterProvider) {
				this._oFilterProvider._setSingleInputsTextArrangementData(JSON.parse(oVariant.singleInputsTextArrangementData || "{}"));
			}

			aOrderedFields = oVariant.orderedFilterItems ? JSON.parse(oVariant.orderedFilterItems) : [];
			if (!aOrderedFields.length) {
				aOrderedFields = this._mAdvancedAreaFilterFlat;
			}

			if (Array.isArray(aPersFields) && aPersFields.length) {
				this._ensureFilterLoaded(aPersFields.filter(function (oField) {
					return oField.visibleInFilterBar;
				}));
			}

			this._applyVariantFields(aFieldsAndValues, sVersion); // BCP: 188new0228255
			var aFilterNonPartOfCurrentVariant = this._reapplyVisibility(aPersFields, (sContext === "CANCEL"));

			this._removeValuesForNonPartOfCurrentVariants(aFilterNonPartOfCurrentVariant);

			if (this._oBasicSearchField && this._oBasicSearchField.setValue) {
				this._oBasicSearchField.setValue("" || oVariant.basicSearch);
			}

			if (oVariant.executeOnSelection) {
				bExecuteOnSelection = oVariant.executeOnSelection;
			}

			this._reorderItemsInBasicAreaLayout(aOrderedFields);
			this._aOrderedFilterItems = aOrderedFields;
			this._reorderItemsInAdvancedAreaFilter();

			this.fireAfterVariantLoad(sContext, bExecuteOnSelection);

			this._setConsiderFilterChanges(true);

			this._updateToolbarText();

			if (bExecuteOnSelection || (this.getLiveMode && this.getLiveMode())) {
				this._searchFromFilterBar();
			} else if (sContext !== "CANCEL") {
				this._clearErrorState();
			}

			if (bInitial) {
				this._setTriggerFilterChangeState(bTriggerFilterChangeState);
			}
		}
	};

	/**
	 * Triggers the registered callBack for fetching the current variant data.
	 * @private
	 * @param {string} sVersion of the variant
	 * @returns {Object} the data representing part of the variant content
	 */
	FilterBar.prototype._fetchVariantFiltersData = function(sVersion) {

		if (this._fRegisteredFetchData) {
			try {
				return this._fRegisteredFetchData(sVersion);
			} catch (ex) {
				Log.error("callback for fetching data throws an exception");
			}
		} else {
			Log.warning("no callback for fetch data supplied");
		}

		return null;
	};

	/**
	 * Triggers the registered callBack for applying the variant data.
	 * @private
	 * @param {object} oJson the data blob representing part of the variant content
	 * @param {string} sVersion of the variant
	 * @returns {object} data to be stored as part of the variant content
	 */
	FilterBar.prototype._applyVariantFields = function(oJson, sVersion) {

		if (this._fRegisteredApplyData) {
			try {
				return this._fRegisteredApplyData(oJson, sVersion);
			} catch (ex) {
				Log.error("callback for applying data throws an exception");
			}
		} else {
			Log.warning("no callback for apply data supplied");
		}
	};

	FilterBar.prototype._isStandardVariant = function() {
		var sKey = this.getCurrentVariantId();
		if (!sKey) {
			return true;
		}
		if (this._oVariantManagement) {
			if ((sKey === this._oVariantManagement.getStandardVariantKey())) {
				return true;
			}

			if (this._oVariantManagement._oStandardVariant === null) {
				return true;
			}
		}

		return false;
	};

	/**
	 * Returns the information whether the flag 'executeOnSelect' is set or not on current variant.
	 * @public
	 * @returns {boolean} Flag 'executeOnSelect' flag. If variant management is disabled <code>false</code> is returned.
	 */
	FilterBar.prototype.isCurrentVariantExecuteOnSelectEnabled = function() {
		if (this._oVariantManagement && !this._oVariantManagement.getInErrorState()) {

			var sKey = this.getCurrentVariantId();
			if (!sKey) {
				return this._oVariantManagement.getExecuteOnSelectForStandardVariant();
			}

			var oItem = this._oVariantManagement.getItemByKey(sKey);
			if (oItem) {
				return oItem.getExecuteOnSelection();
			}
		}
		return false;
	};

	/**
	 * Creates and returns the variant representation.
	 * @returns {Object} An arbitrary Object with an example structure:<br><pre>{<br>  filterBarVariant: any,<br>  filterbar: [<br>    {<br>      group: string,<br>      name: string,<br>      partOfCurrentVariant: boolean,<br>      visible: boolean,<br>      visibleInFilterBar: boolean<br>    },<br>    ...<br>  ],<br>  orderedFilterItems: string,<br>  singleInputsTextArrangementData: string,<br>  version: string|undefined,<br>  basicSearch: string|undefined<br>}</pre>
	 * @public
	 */
	FilterBar.prototype.fetchVariant = function() {

		var aFiltersInfo, oVariant = {}, sBasicSearch, mFilterValues, oFlattenedFilterItems = [];

		if (this._isDeltaHandling()) {
			if (!this._isStandardVariant()) {
				oVariant.version = "V3";
			}
		}

		// oVariant.version = "V4";

		this.fireBeforeVariantFetch();

		aFiltersInfo = this._determineVariantFiltersInfo(true, !oVariant.version);
		oVariant.filterbar = (!aFiltersInfo) ? [] : aFiltersInfo;

		var fSimplifyFilterItemHandler = function (aFilterItems) {
			aFilterItems.forEach(function (oItem) {
				oFlattenedFilterItems.push({
					name: oItem.name,
					group: oItem.group
				});
			});
		};

		// _aAdaptFilterItems is filled in when move in Adapt Filters Dialog is applied and submitted
		if (this._aAdaptFilterItems && this._aAdaptFilterItems.length > 0) {
			fSimplifyFilterItemHandler(this._aAdaptFilterItems);
			oVariant.orderedFilterItems = JSON.stringify(oFlattenedFilterItems);
		} else {
			// _mAdvancedAreaFilterFlat filled when sfb initialized (see: FilterBar.prototype.fireInitialized)
			this._mAdvancedAreaFilterFlat = this._getAllFilterItemsFlat(); // refresh
			fSimplifyFilterItemHandler(this._mAdvancedAreaFilterFlat);
			oVariant.orderedFilterItems = JSON.stringify(oFlattenedFilterItems);
		}

		mFilterValues = this._fetchVariantFiltersData(oVariant.version);

		oVariant.filterBarVariant = this._removeEmptyFilters(mFilterValues);
		oVariant.singleInputsTextArrangementData = JSON.stringify(this._oFilterProvider ? this._oFilterProvider._getSingleInputsTextArrangementData() : {});

		sBasicSearch = this._getBasicSearchValue();
		if (sBasicSearch) {
			oVariant.basicSearch = sBasicSearch;
		}

		if (this._oVariant && this._oVariant.content) {
			this._oVariant.content = oVariant;
		}

		return oVariant;
	};

	/**
	 * Applies the variant.
	 * @param {object} oVariant JSON object
	 * @param {string} sContext Describes in which context the variant is applied. The context is passed on to the application via the
	 *        afterVariantLoad event
	 * @param {boolean} bInitial indicates if the apply was executed during the initialization phase.
	 * @public
	 */
	FilterBar.prototype.applyVariant = function(oVariant, sContext, bInitial) {

		if (oVariant.hasOwnProperty("version")) {
			oVariant = this.mergeVariant(this._getStandardVariant(), oVariant, sContext);
		}

		this._applyVariant(oVariant, sContext, bInitial, oVariant.version);
	};

	FilterBar.prototype._afterVariantsLoad = function() {

		if (this._bDelayRendering) {
			this._oBasicAreaLayout.setVisible(this.getFilterBarExpanded());
		}

		this._bDelayRendering = false;
	};

	/**
	 * Retrieves the mandatory filters.
	 * @public
	 * @returns {array} Of visible mandatory filters
	 */
	FilterBar.prototype.determineMandatoryFilterItems = function() {

		var i;
		var aMandatoryFilters = [];

		var aItems = this._retrieveVisibleAdvancedItems();

		for (i = 0; i < aItems.length; i++) {
			if (aItems[i].filterItem.getMandatory() === true) {
				if (aItems[i].control) {
					aMandatoryFilters.push(aItems[i].filterItem);
				}
			}
		}

		return aMandatoryFilters;
	};

	/**
	 * Retrieves the control associated to the filter.
	 *
	 * @public
	 * @param {sap.ui.comp.filterbar.FilterItem} oFilterItem From the aggregations
	 * @param {boolean} bConsiderParameters check also analytics parameter
	 * @returns {sap.ui.core.Control} The corresponding control. If no match is found <code>null</code> is returned.
	 */
	FilterBar.prototype.determineControlByFilterItem = function(oFilterItem, bConsiderParameters) {

		var i, n = null;
		var oItem, oGroupElement;

		if (!oFilterItem || (!bConsiderParameters && oFilterItem._isParameter())) {
			return null;
		}

		if (this._aBasicAreaSelection) {
			for (i = 0; i < this._aBasicAreaSelection.length; i++) {
				oItem = this._aBasicAreaSelection[i];
				if (oFilterItem === oItem.filterItem) {
					return oItem.control;
				}
			}
		}

		if (this._mAdvancedAreaFilter) {
			for (n in this._mAdvancedAreaFilter) {
				if (n) {
					oGroupElement = this._mAdvancedAreaFilter[n];
					if (oGroupElement && oGroupElement.items) {
						for (i = 0; i < oGroupElement.items.length; i++) {
							oItem = oGroupElement.items[i];
							if ((bConsiderParameters || !oItem.filterItem._isParameter()) && (oFilterItem === oItem.filterItem)) {
								return oItem.control;
							}
						}
					}
				}
			}
		}

		return null;
	};

	/**
	 * Retrieves the control based on the name and group name.
	 *
	 * @public
	 * @param {string} sName Name of the filter.
	 * @param {string} [sGroupName] Group name of the filter; <code>null</code> for filter that belongs to basic group.
	 * @returns {sap.ui.core.Control} The corresponding control, if no match is found, <code>null</code> is returned.
	 */
	FilterBar.prototype.determineControlByName = function(sName, sGroupName) {

		var oItem = this._determineEnsuredItemByName(sName, sGroupName);
		if (oItem && oItem.filterItem && !oItem.filterItem._isParameter()) {
			return oItem.control;
		}

		return null;
	};

	/**
	 * Retrieves the associated label based on the name and group name.
	 * @public
	 * @param {string} sName Name of the filter.
	 * @param {string} sGroupName Group name of the filter; <code>null</code> for filter that belongs to basic group.
	 * @returns {sap.m.Label} The associated Label, if no match is found, <code>null</code> is returned.
	 */
	FilterBar.prototype.determineLabelByName = function(sName, sGroupName) {

		var oItem = this._determineEnsuredItemByName(sName, sGroupName);
		if (oItem && oItem.filterItem) {
			return oItem.filterItem._oLabel;
		}

		return null;
	};

	FilterBar.prototype._determineEnsuredItemByName = function(sName, sGroupName) {

		if (!sGroupName) {
			sGroupName = this._determineGroupNameByName(sName);
		}

		this._ensureFilterLoaded([
			{
				name: sName,
				group: sGroupName
			}
		]);

		return this._determineItemByName(sName, sGroupName);
	};

	FilterBar.prototype._determineGroupNameByName = function(sName) {

		if (this._aFields) {
			for (var i = 0; i < this._aFields.length; i++) {
				if (this._aFields[i].fieldName === sName) {
					return this._aFields[i].groupName;
				}
			}
		}

		var oFilterItem = this._determineFilterItemByName(sName);
		if (oFilterItem) {
			var sGroupName = oFilterItem.getGroupName();
			if (sGroupName !== FilterBar.INTERNAL_GROUP) {
				return sGroupName;
			}
		}

		return null;
	};

	/**
	 * Retrieves the internal filter representation based on the name and (optional) group name.
	 * @private
	 * @param {string} sName the control's name
	 * @param {string} sGrpName sGroupName is null for basic area
	 * @returns {object} the corresponding internal item. If no match is found null will returned.
	 */
	FilterBar.prototype._determineItemByName = function(sName, sGrpName) {

		var i;
		var oItem, oGroupElement;
		var sGroupName = sGrpName;

		if (!sName) {
			return null;
		}

		if (!sGroupName) {
			sGroupName = FilterBar.INTERNAL_GROUP;
		}

		if (this._mAdvancedAreaFilter) {
			// check the filter
			oGroupElement = this._mAdvancedAreaFilter[sGroupName];
			if (oGroupElement && oGroupElement.items) {
				for (i = 0; i < oGroupElement.items.length; i++) {
					oItem = oGroupElement.items[i];
					if (oItem && oItem.filterItem && (oItem.filterItem.getName() === sName)) {
						return oItem;
					}
				}
			}
		}

		return null;
	};

	/**
	 * Retrieves the filter corresponding to the filter name.
	 *
	 * @public
	 * @param {string} sName the control's name
	 * @param {string} sGroupName the filter's group name
	 * @returns {sap.ui.comp.filterbar.FilterGroupItem} the corresponding filter item. If no match is found <code>null</code> will returned.
	 */
	FilterBar.prototype.determineFilterItemByName = function(sName, sGroupName) {

		var oItem;
		if (sGroupName){
			oItem = this._determineEnsuredItemByName(sName, sGroupName);
		} else {
			oItem = this._determineEnsuredItemByName(sName);
		}

		if (oItem && oItem.filterItem) {
			return oItem.filterItem;
		}

		return null;
	};

	FilterBar.prototype._determineFilterItemByName = function(sName) {

		var n, oItem;

		if (this._mAdvancedAreaFilter) {
			for (n in this._mAdvancedAreaFilter) {
				oItem = this._determineItemByName(sName, n);
				if (oItem) {
					return oItem.filterItem;
				}
			}
		}

		return null;
	};

	/**
	 * Retrieves for a given control the corresponding filter.
	 * @private
	 * @param {sap.ui.core.Control} oControl for a filter
	 * @returns {object} the corresponding internal representation. If no match is found null will returned.
	 */
	FilterBar.prototype._determineByControl = function(oControl) {

		var n = null, i;

		if (this._mAdvancedAreaFilter) {
			for (n in this._mAdvancedAreaFilter) {
				if (n) {
					var oGroupElement = this._mAdvancedAreaFilter[n];
					if (oGroupElement && oGroupElement.items) {
						for (i = 0; i < oGroupElement.items.length; i++) {
							if (oGroupElement.items[i] && oGroupElement.items[i].control === oControl) {
								return oGroupElement.items[i];
							}
						}
					}
				}
			}
		}

		return null;
	};


	FilterBar.prototype.onAfterRendering = function(oEvent) {
		if (!(this._isPhone() || this._isTablet())) {

			if (this._oHintText && this._oHintText.getVisible()) {
				this._bNoFiltersInAdvancedArea = true;
				this.setFilterBarExpanded(false);
			}
		}
		if (this.getIsRunningInValueHelpDialog()) {
			if (!this._isPhone()) {
				var iLen = this.iAddedContentLength,
					aContent = this._oBasicAreaLayout.getContent(),
					oContentParent;

				if (iLen > 0 && iLen < 4) {
					for (var i = 3; i >= 4 - iLen; i--) {
						oContentParent = aContent[i].$().parent()[0];
						// make the additional layouts withhout height so that they do not break the responsiveness
						if (oContentParent) {
							oContentParent.style.height = "0px";
							oContentParent.style.margin = "0px";
						}
					}
				}
			}
		} else {
			// When we are in scenario of FilterBar with Toolbar that contains basic search and either Variant Management or Header we need to have ToolbarSeparator
			if (this._oToolbar && this._oBasicSearchField && ((this._oVariantManagement && this._oVariantManagement.getVisible()) || this.getHeader()) && !this._isPhone() && !this._oToolbar.getContent()[1].isA("sap.m.ToolbarSeparator")) {
				this._oToolbar.insertContent(new ToolbarSeparator().addStyleClass("sapUiTinyMarginEnd"), 1);
			}
		}
	};

	FilterBar.prototype._destroyLazyFilterControl = function() {
		var j, oField;

		if (this._aFields && (this._aFields.length > 0)) {
			// delete eventuell not yet created filteritems
			if (this._aFields && this._aFields.length > 0) {
				for (j = 0; j < this._aFields.length; j++) {
					oField = this._aFields[j];

					if (oField.factory) {
						/* eslint-disable no-lonely-if */
						if (oField.control) {
							oField.control.destroy();
						}
						/* eslint-enable no-lonely-if */
					}
				}
			}
		}
	};

	FilterBar.prototype._destroyNonVisibleFilterControl = function() {
		var i, n, oItem;

		// delete currently not visible filteritems
		if (this._mAdvancedAreaFilter) {
			for (n in this._mAdvancedAreaFilter) {
				if (n && this._mAdvancedAreaFilter[n] && this._mAdvancedAreaFilter[n].items) {
					for (i = 0; i < this._mAdvancedAreaFilter[n].items.length; i++) {
						oItem = this._mAdvancedAreaFilter[n].items[i];
						if (oItem && oItem.container) {
							if (this._oBasicAreaLayout && (this._oBasicAreaLayout.indexOfContent(oItem.container) < 0)) {
								if (oItem.control && !oItem.bDestroyed) {
									oItem.control.destroy();
									oItem.bDestroyed = true;
								}
							}
						}
					}
				}
			}
		}

	};

	FilterBar.prototype._destroyFilterControls = function() {

		if (!this.getAdvancedMode()) {

			// delete eventuell not yet created filteritems
			this._destroyLazyFilterControl();

			// delete currently not visible filteritems
			this._destroyNonVisibleFilterControl();

		}
	};

	FilterBar.prototype._registerVariantManagement = function() {
		if (this._oVariantManagement) {
			this._oVariantManagement.attachSave(this._variantSave, this);
			this._oVariantManagement.attachAfterSave(this._afterVariantSave, this);
		}
	};

	FilterBar.prototype._unregisterVariantManagement = function() {

		if (this._oVariantManagement) {

			if (this._fInitialiseVariants) {
				this._oVariantManagement.detachInitialise(this._fInitialiseVariants);
				this._fInitialiseVariants = null;
			}

			this._oVariantManagement.detachSave(this._variantSave, this);
			this._oVariantManagement.detachAfterSave(this._afterVariantSave, this);

			// VM was created by the smart filterbar without a toolbar and has a custom-data persistency key
			// BCP: 1680052358
			// Destroy the VM whenever it was created, but not added to the UI-tree
			// BCP: 1670396582
			if ((!this.getUseToolbar() || this.getAdvancedMode()) && !this._oVariantManagement.getDomRef()) {
				this._oVariantManagement.destroy();
			}
		}
	};

	/**
	 * For backward compatibility. Creates adapt filters dialog
	 * @public
	 */
	FilterBar.prototype.showFilterDialog = function() {
		if (!this._oAdaptFiltersDialog) {
			this.showAdaptFilterDialog();
		}
	};

	/**
	 * Enables to add application specific content to the filters dialog. If the content was not yet added it will be added. The content will be set
	 * to visible, all other filters dialog content will be set to invisible.
	 * Not implemented yet for the new Adapt Filters Dialog
	 * @public
	 * @deprecated Since 1.84
	 * @param {sap.ui.core.Control} oContent to be added; if empty, nothing is inserted.
	 * @returns {sap.ui.core.Control|null} <code>oContent</code> added or <code>null</code> when filters dialog is not active
	 */
	FilterBar.prototype.addFilterDialogContent = function(oContent) {
		if (this._oAdaptFiltersDialog) {
			return oContent;
		}
		return null;
	};

	/**
	 * Returns the filter dialog content. <code>Node:</code>The original content is a {@link sap.ui.layout.form.Form Form}. The form may be
	 * enhanced with a toolbar to enable the inner switch to an added custom content. Besides such operations, the original content should not be
	 * manipulated in any way.
	 * @public
	 * @deprecated Since 1.84
	 * @returns {array} of filters dialog content.
	 */
	FilterBar.prototype.getFilterDialogContent = function() {
		if (this._oAdaptFiltersDialog) {
			return new Form();
		}

		return null;
	};

	/**
	 * Once set, the activation of the 'Adapt Filters' button will open the 'old' filters dialog.
	 * This method offers an intermediate solution for the visual filters scenario,
	 * which relies on the old filters dialog.
	 * @deprecated Since 1.84
	 * @protected
	 */
	FilterBar.prototype.setShowOldFilterDialog = function()	{
		// Do nothing. This method will be removed
	};

	/**
	 * Returns the first filter control whose ID matches the passed parameter
	 * @param {string} sId The ID of the filter control
	 * @returns {sap.ui.core.Control} The filter control or null
	 * @private
	 */
	FilterBar.prototype._getFilterControlById = function(sId) {
		for (var sGroupName in this._mAdvancedAreaFilter){
			var oGroup = this._mAdvancedAreaFilter[sGroupName];
			for (var i = 0; i < oGroup.items.length; i++){
				var oItem = oGroup.items[i];
				if (oItem.control && oItem.control.getId() === sId){
					return oItem.control;
				}
			}
		}
		return null;
	};


	/**
	 * Returns the visible filter control at position <code>nIndex</code>
	 * @param {number} nIndex The position of the filter control
	 * @returns {sap.ui.core.Control} The filter control or null
	 * @private
	 */
	FilterBar.prototype._getFilterControlByIndex = function(nIndex){
		var counter = 0;
		for (var sGroupName in this._mAdvancedAreaFilter){
			var oGroup = this._mAdvancedAreaFilter[sGroupName];
			for (var i = 0; i < oGroup.items.length; i++){
				var oItem = oGroup.items[i];
				if (oItem.filterItem.getVisibleInFilterBar()){
					if (counter === nIndex) {
						return oItem.control;
					}
					counter++;
				}
			}
		}
	};

	/**
	* Checks if <code>sLabel</code> is contained in <code>aLabels</code>
	 * @param {array} aLabels An array of {@link sap.m.Label}
	 * @param {string} sLabel The label text whose match we look for among <code>aLabels</code>
	 * @returns {boolean} True if <code>sLabel<code> matches at least one label text from <code>aLabels</code>
	 */
	function containsLabel(aLabels, sLabel){
		var aMatches = aLabels.filter(function(l){ return l.getText() === sLabel;});
		return aMatches.length > 0;
	}

	/**
	 * Returns the first filter control whose ID matches the passed parameter
	 * @param {string} sLabel The label text for which we want to obtain the filter control
	 * @returns {sap.ui.core.Control} The filter control or null if the text doesn't match the label of any filter
	 * @private
	 */
	FilterBar.prototype._getFilterControlByLabel = function(sLabel) {
		for (var sGroupName in this._mAdvancedAreaFilter){
			var oGroup = this._mAdvancedAreaFilter[sGroupName];
			for (var i = 0; i < oGroup.items.length; i++){
				var oItem = oGroup.items[i];
				if (oItem.control){
					if (containsLabel(oItem.control.getLabels(), sLabel)){
						return oItem.control;
					}
				}
			}
		}
	};

	/**
	 * Checks if a filter is part of the basic filter group
	 * @param {object} oFilterItem The filter item
	 * @returns {boolean} True if <code>oFilterItem</code> is part of <code>FilterBar.INTERNAL_GROUP</code>
	 * @private
	 */
	FilterBar.prototype._isFilterItemInBasicGroup = function(oFilterItem){
		return oFilterItem && !oFilterItem.getGroupName() || oFilterItem.getGroupName() === FilterBar.INTERNAL_GROUP;
	};

	FilterBar.prototype._shouldBeVisible = function(mItem){
		return (mItem.filterItem.getMandatory() && !this._hasFilterValue(mItem.filterItem)) || (mItem.name === "_BASIC_SEARCH_FIELD");
	};

	/**
	 * @override
	 */
	FilterBar.prototype.exit = function() {

		this._unregisterVariantManagement();

		this._destroyFilterControls();

		if (this._oHintText && (this._oAdvancedPanel.indexOfContent(this._oHintText) < 0)) {
			this._oHintText.destroy();
		}

		window.sessionStorage.removeItem(this.getId());
		window.sessionStorage.removeItem("semanticDates");

		Grid.prototype.exit.apply(this, arguments);

		if (this._oAdaptFiltersDialog) {
			this._oAdaptFiltersDialog.destroy();
			this._oAdaptFiltersDialog = null;
		}

		if (this._oAdaptFiltersDialogModel) {
			this._oAdaptFiltersDialogModel = null;
		}

		if (this._oAdaptFiltersPanel) {
			this._oAdaptFiltersPanel = null;
		}

		if (this.oModel) {
			this.oModel.destroy();
			this.oModel = null;
		}

		this._aFields = null;

		this._oHintText = null;

		this._aBasicAreaSelection = null;
		this._mAdvancedAreaFilter = null;
		this._oBasicAreaLayout = null;
		this._oVariantManagement = null;

		this._oCollectiveSearch = null;

		this._oVariant = null;

		this._fRegisteredFetchData = null;
		this._fRegisteredApplyData = null;
		this._fRegisterGetFiltersWithValues = null;
		this._fRegisteredFilterChangeHandlers = null;

		this._oSearchButton = null;
		this._oFiltersButton = null;
		this._oHideShowButton = null;
		this._oClearButtonOnFB = null;
		this._oRestoreButtonOnFB = null;

		this._oBasicSearchField = null;
		this._oBasicSearchFieldContainer = null;

		this._oButtonsVLayout = null;
		this._bLayoutAdded = null;
		this.iAddedContentLength = null;

		this._bSearchFiredFromFilterBar = false;
		this._oInitializedDeferred = null;
		this._bDelegateAdded = false;
	};

	// Hide the follwing sap.ui.layout.Grid functionality in jDoc
	/**
	 * @name sap.ui.comp.filterbar.FilterBar#setDefaultIndent
	 * @private
	 */
	/**
	 * @name sap.ui.comp.filterbar.FilterBar#getDefaultIndent
	 * @private
	 */

	/**
	 * @name sap.ui.comp.filterbar.FilterBar#setDefaultSpan
	 * @private
	 */
	/**
	 * @name sap.ui.comp.filterbar.FilterBar#getDefaultSpan
	 * @private
	 */

	/**
	 * @name sap.ui.comp.filterbar.FilterBar#setHSpacing
	 * @private
	 */
	/**
	 * @name sap.ui.comp.filterbar.FilterBar#getHSpacing
	 * @private
	 */

	/**
	 * @name sap.ui.comp.filterbar.FilterBar#setVSpacing
	 * @private
	 */
	/**
	 * @name sap.ui.comp.filterbar.FilterBar#getVSpacing
	 * @private
	 */

	/**
	 * @name sap.ui.comp.filterbar.FilterBar#setPosition
	 * @private
	 */
	/**
	 * @name sap.ui.comp.filterbar.FilterBar#getPosition
	 * @private
	 */

	/**
	 * @name sap.ui.comp.filterbar.FilterBar#setContainerQuery
	 * @private
	 */
	/**
	 * @name sap.ui.comp.filterbar.FilterBar#getContainerQuery
	 * @private
	 */

	/**
	 * @name sap.ui.comp.filterbar.FilterBar#addContent
	 * @private
	 */
	/**
	 * @name sap.ui.comp.filterbar.FilterBar#insertContent
	 * @private
	 */
	/**
	 * @name sap.ui.comp.filterbar.FilterBar#removeContent
	 * @private
	 */
	/**
	 * @name sap.ui.comp.filterbar.FilterBar#removeAllContent
	 * @private
	 */
	/**
	 * @name sap.ui.comp.filterbar.FilterBar#destroyContent
	 * @private
	 */
	/**
	 * @name sap.ui.comp.filterbar.FilterBar#getContent
	 * @private
	 */
	/**
	 * @name sap.ui.comp.filterbar.FilterBar#indexOfContent
	 * @private
	 */
	/**
	 * @name sap.ui.comp.filterbar.FilterBar#insertFilterItem
	 * @private
	 */
	/**
	 * @name sap.ui.comp.filterbar.FilterBar#insertFilterGroupItem
	 * @private
	 */

	return FilterBar;

});
