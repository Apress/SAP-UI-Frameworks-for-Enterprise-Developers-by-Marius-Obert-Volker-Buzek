/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

// Provides FilterController
sap.ui.define([
	'./BaseController',
	'sap/m/library',
	'sap/ui/comp/library',
	'./Util',
	'sap/ui/comp/filterbar/VariantConverterTo',
	'sap/ui/comp/filterbar/VariantConverterFrom',
	'sap/base/util/merge',
	'sap/ui/comp/smartfilterbar/FilterProvider',
	'sap/ui/mdc/p13n/panels/FilterPanel',
	"sap/base/util/UriParameters",
	"sap/ui/comp/util/FormatUtil",
	"sap/ui/comp/smartfilterbar/FilterProviderUtils",
	"sap/ui/core/library"
], function(
	BaseController,
	MLibrary,
	CompLibrary,
	Util,
	VariantConverterTo,
	VariantConverterFrom,
	merge,
	FilterProvider,
	MDCFilterPanel,
	SAPUriParameters,
	FormatUtil,
	FilterProviderUtils,
	coreLibrary
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.comp.smartfilterbar.FilterType
	var FilterType = CompLibrary.smartfilterbar.FilterType;

	/**
	 * The FilterController can be used to...
	 *
	 * @class Table Personalization Controller
	 * @extends sap.ui.comp.personalization.BaseController
	 * @author SAP
	 * @version 1.25.0-SNAPSHOT
	 * @private
	 * @alias sap.ui.comp.personalization.FilterController
	 */
	var FilterController = BaseController.extend("sap.ui.comp.personalization.FilterController", /** @lends sap.ui.comp.personalization.FilterController.prototype */ {
		constructor: function(sId, mSettings) {
			BaseController.apply(this, arguments);
			this.setType(MLibrary.P13nPanelType.filter);
			this.setItemType(MLibrary.P13nPanelType.filter + "Items");
			this._aDropdownFields = [];
			this.aFilterItems = [];
			this._aSFBMultiInputs = [];
			this._aFilterPanelFields = [];
			this._aCustomColumnKeysWithSlash = [];
			this.aSFBControlConfig = [];
		},
		metadata: {
			events: {
				afterFilterModelDataChange: {}
			}
		}
	});

	FilterController.prototype.setTable = function(oTable) {
		BaseController.prototype.setTable.apply(this, arguments);
	};

	FilterController.prototype.getColumn2Json = function(oColumn, sColumnKey, iIndex) {
		// This is not complete but the best we can do - problem is that the filter is not extractable from other table instances.
		if (this.getTableType() !== CompLibrary.personalization.TableType.AnalyticalTable && this.getTableType() !== CompLibrary.personalization.TableType.Table && this.getTableType() !== CompLibrary.personalization.TableType.TreeTable) {
			return null;
		}
		if (!Util.isFilterable(oColumn)) {
			return null;
		}
		if (!oColumn.getFiltered || (oColumn.getFiltered && !oColumn.getFiltered())) {
			return null;
		}
		return {
			columnKey: sColumnKey,
			exclude: false,
			operation: oColumn.getFilterOperator(),
			value1: oColumn.getFilterValue(),
			value2: "" // The Column API does not provide method for 'value2'
		};
	};

	FilterController.prototype.getColumn2JsonTransient = function(oColumn, sColumnKey, sText, sTooltip) {
		if (!Util.isFilterable(oColumn)) {
			return null;
		}

		var aValues;
		if (this.getTableType() === CompLibrary.personalization.TableType.AnalyticalTable || this.getTableType() === CompLibrary.personalization.TableType.Table || this.getTableType() === CompLibrary.personalization.TableType.TreeTable) {
			if (Util.getColumnType(oColumn) === "boolean") {
				aValues = Util._getCustomProperty(oColumn, "values");
			}

			return {
				columnKey: sColumnKey,
				text: sText,
				tooltip: sTooltip !== sText ? sTooltip : undefined,
				maxLength: Util._getCustomProperty(oColumn, "maxLength"),
				precision: Util._getCustomProperty(oColumn, "precision"),
				scale: Util._getCustomProperty(oColumn, "scale"),
				type: Util.getColumnType(oColumn),
				typeInstance: Util._getCustomProperty(oColumn, "typeInstance"),
				values: aValues,
				nullable: Util._getCustomProperty(oColumn, "nullable")
			};
		}
		if (this.getTableType() === CompLibrary.personalization.TableType.ResponsiveTable) {
			if (Util.getColumnType(oColumn) === "boolean") {
				aValues = Util._getCustomProperty(oColumn, "values");
			}

			return {
				columnKey: sColumnKey,
				text: sText,
				tooltip: sTooltip !== sText ? sTooltip : undefined,
				maxLength: Util._getCustomProperty(oColumn, "maxLength"),
				precision: Util._getCustomProperty(oColumn, "precision"),
				scale: Util._getCustomProperty(oColumn, "scale"),
				type: Util.getColumnType(oColumn),
				typeInstance: Util._getCustomProperty(oColumn, "typeInstance"),
				values: aValues,
				nullable: Util._getCustomProperty(oColumn, "nullable")
			};
		}
		if (this.getTableType() === CompLibrary.personalization.TableType.ChartWrapper) {
			return {
				columnKey: sColumnKey,
				text: sText,
				tooltip: sTooltip !== sText ? sTooltip : undefined,
				maxLength: Util._getCustomProperty(oColumn, "maxLength"),
				precision: Util._getCustomProperty(oColumn, "precision"),
				scale: Util._getCustomProperty(oColumn, "scale"),
				type: Util.getColumnType(oColumn),
				typeInstance: Util._getCustomProperty(oColumn, "typeInstance"),
				values: aValues,
				nullable: Util._getCustomProperty(oColumn, "nullable")
			};
		}
	};

	FilterController.prototype.handleIgnore = function(oJson, iIndex) {
		oJson.sort.sortItems.splice(iIndex, 1);
	};

	FilterController.prototype.syncJson2Table = function(oJson) {
		var oColumnKey2ColumnMap = this.getColumnMap();
		var oColumnKey2ColumnMapUnfiltered = merge({}, oColumnKey2ColumnMap);

		this.fireBeforePotentialTableChange();

		if (this.getTableType() === CompLibrary.personalization.TableType.AnalyticalTable || this.getTableType() === CompLibrary.personalization.TableType.Table || this.getTableType() === CompLibrary.personalization.TableType.TreeTable) {
			oJson.filter.filterItems.forEach(function(oFilterItem) {
				var oColumn = oColumnKey2ColumnMap[oFilterItem.columnKey];
				if (oColumn) {
					if (!oColumn.getFiltered()) {
						oColumn.setFiltered(true);
					}
					delete oColumnKey2ColumnMapUnfiltered[oFilterItem.columnKey];
				}
			});

			for (var sColumnKey in oColumnKey2ColumnMapUnfiltered) {
				var oColumn = oColumnKey2ColumnMapUnfiltered[sColumnKey];
				if (oColumn && oColumn.getFiltered()) {
					oColumn.setFiltered(false);
				}
			}
		}

		this.fireAfterPotentialTableChange();
	};

	FilterController.prototype.getDataSuiteFormat2Json = function(oDataSuiteFormat) {
		var oJson = this.createControlDataStructure();

		if (!oDataSuiteFormat.SelectOptions || !oDataSuiteFormat.SelectOptions.length) {
			return oJson;
		}
		oJson.filter.filterItems = oDataSuiteFormat.SelectOptions.map(function(oSelectOption) {
			var oConvertedOption = VariantConverterFrom.convertOption(oSelectOption.Ranges[0].Option, oSelectOption.Ranges[0].Low);
			return {
				columnKey: oSelectOption.PropertyName,
				exclude: (oSelectOption.Ranges[0].Sign === "E"),
				operation: oConvertedOption.op,
				value1: oConvertedOption.v,
				value2: oSelectOption.Ranges[0].High
			};
		});
		return oJson;
	};
	/**
	 * Creates property <code>SelectOptions</code> in <code>oDataSuiteFormat</code> object if at least one filter item exists. The <code>SelectOptions</code> contains the current PersistentData snapshot.
	 * @param {object} oDataSuiteFormat Structure of Data Suite Format
	 */
	FilterController.prototype.getDataSuiteFormatSnapshot = function(oDataSuiteFormat) {
		var oControlDataTotal = this.getUnionData(this.getControlDataInitial(), this.getControlData());
		if (!oControlDataTotal.filter || !oControlDataTotal.filter.filterItems || !oControlDataTotal.filter.filterItems.length) {
			return;
		}
		oControlDataTotal.filter.filterItems.forEach(function(oFilterItem) {
			var aRanges = VariantConverterTo.addRangeEntry(oDataSuiteFormat, oFilterItem.columnKey);
			VariantConverterTo.addRanges(aRanges, [
				oFilterItem
			]);
		});
	};

	/**
	 * Returns the filter property for the given column
	 *
	 * @param {string} sColumnName - the column name for the filterProperty
	 * @returns {string} the found filter property
	 * @private
	 */
	FilterController.prototype._getFilterPropertyFromColumn = function(sColumnName) {
		var oColumnData, sFilterProperty, oColumnKey2ColumnMap,
			oColumn = this._getColumnByKey(sColumnName);

		if (!oColumn) {
			oColumnKey2ColumnMap = this.getColumnMap();
			oColumn = oColumnKey2ColumnMap && oColumnKey2ColumnMap[sColumnName];
		}

		if (oColumn) {
			if (oColumn.getFilterProperty) {
				sFilterProperty = oColumn.getFilterProperty();
			}
			oColumnData = oColumn.data("p13nData");
			if (oColumnData && !sFilterProperty) {
				sFilterProperty = oColumnData["filterProperty"];
			}
		}

		return sFilterProperty;
	};

	/**
	 * Creates the control used in the filter item lazily
	 *
	 * @param {object} oField filter metadata
	 * @private
	 */
	FilterController.prototype._createFilterFieldControl = function(oField) {
		if (oField.conditionType) {
			oField.control = oField.conditionType.initializeFilterItem();
		} else if (!oField.control && oField.fCreateControl) {
			oField.fCreateControl(oField);
			delete oField.fCreateControl;
		}
	};

	/**
	 * Gets the controlDataReduce filter items
	 *
	 * @returns {array} an array with the filter items of the controlDataReduce
	 * @private
	 */
	FilterController.prototype._getControlDataReduceFilterItems = function() {
		var oControlDataReduce = this.getControlDataReduce();

		return oControlDataReduce && oControlDataReduce.filter && oControlDataReduce.filter.filterItems;
	};

	/**
	 * Sets the new data to the controlDataReduce model
	 *
	 * @param {array} aNewFilterItems array of the filter items that will be passed to the controlDataReduce model
	 * @private
	 */
	FilterController.prototype._updateControlDataReduce = function(aNewFilterItems) {
		var oControlDataReduce = this.getControlDataReduce();

		if (!aNewFilterItems || !(oControlDataReduce && oControlDataReduce.filter && oControlDataReduce.filter.filterItems)) {
			return;
		}
		aNewFilterItems.reverse();
		oControlDataReduce.filter.filterItems = aNewFilterItems;
		this.setControlDataReduce2Model(oControlDataReduce);
		this.fireAfterPotentialModelChange({
			json: oControlDataReduce
		});
	};

	/**
	 * Returns the column for the given column key
	 *
	 * @param {string} sColumnKey - the column key for the required column
	 * @returns {object} The found column or <code>null</code>
	 * @private
	 */
	FilterController.prototype._getColumnByKey = function(sColumnKey) {
		var aColumns, oColumn, iLength, i, oCustomData,
			oTable = this.getTable();
		if (oTable) {
			aColumns = oTable.getColumns();
			iLength = aColumns.length;
			for (i = 0; i < iLength; i++) {
				oColumn = aColumns[i];
				oCustomData = oColumn.data("p13nData");
				if (oCustomData && oCustomData.columnKey === sColumnKey) {
					return oColumn;
				}
			}
		}

		return null;
	};

	/**
	 * Checks whether a column from the table is custom
	 *
	 * @param {string} sColumnKey the key of the column
	 * @returns {boolean} <code>true</code>, if the column is custom
	 * @private

	 */
	FilterController.prototype._getIsCustomColumn = function(sColumnKey) {
		var oColumn = this._getColumnByKey(sColumnKey),
			oP13nData = oColumn && oColumn.data("p13nData");


		return !oP13nData ? false : !oP13nData.typeInstance;
	};

	FilterController.prototype._getFilterQueryPanelParameter = function() {
		return  new SAPUriParameters(window.location.search).getAll("sap-ui-xx-filterQueryPanel")[0] === "true";
	};

	FilterController.prototype.getPanel = function(oPayload) {
		// Note: in the time where controller gets the panel all table columns are present (also missing columns).
		// Note: in case that all filterable columns are excluded we nevertheless have to create the panel for the case that some filterable columns will be included.
		if (!Util.hasFilterableColumns(this.getColumnMap())) {
			return null;
		}
		if (oPayload && oPayload.column) {
			var sColumnKey = Util.getColumnKey(oPayload.column);
			if (sColumnKey) {
				var oJson = this.getTransientData();
				oJson.filter.filterItems.forEach(function(oItem) {
					oItem["isDefault"] = oItem.columnKey === sColumnKey;
				});
			}
		}
		var oTable = this.getTable(),
			oSmartFilter = this._getSmartFilterBar();

		if (oSmartFilter && oSmartFilter._oFilterProvider) {
			this._aDropdownFields = oSmartFilter._oFilterProvider._aFilterBarDropdownFieldMetadata;
		} else if (oTable && oTable.oParent && oTable.oParent._oTableProvider && oTable.oParent._oTableProvider._aTableViewMetadata) {
			this._aDropdownFields = oTable.oParent._oTableProvider._aTableViewMetadata.filter(function(oField) {
				return oField.hasFixedValues;
			});
		}
		return new Promise(function(resolve) {
			// Dynamically load panel once it is needed
			sap.ui.require([
				'sap/ui/comp/p13n/P13nFilterPanel', 'sap/m/P13nItem', 'sap/m/P13nAnyFilterItem', 'sap/ui/comp/providers/ValueListProvider'
			], function(P13nFilterPanel, P13nItem, P13nAnyFilterItem, ValueListProvider) {
				var sSmartContainerId, bUseQueryPanel = true; //this._getFilterQueryPanelParameter();

				if (bUseQueryPanel) {
					var oModel, sEntitySet, oSmartContainer;
					if (!this.oSmartTable) {
						this.oSmartTable = this._getSmartTable();
					}
					if (!this.oSmartChart) {
						this.oSmartChart = this._getSmartChart();
					}
					if (!this.oSmartFilterBar) {
						this.oSmartFilterBar = this._getSmartFilterBar();
						this.aSFBControlConfig = this.oSmartFilterBar && this.oSmartFilterBar.getControlConfiguration();
					}
					if (this.oSmartTable) {
						oSmartContainer = this.oSmartTable;
					} else if (this.oSmartChart) {
						oSmartContainer = this.oSmartChart;
					}

					if (oSmartContainer) {
						oModel = oSmartContainer.getModel();
						sEntitySet = oSmartContainer.getEntitySet();
						sSmartContainerId = oSmartContainer.getId();
					}

					if (!sEntitySet && !oSmartContainer && this.getTable() && this.getTable().isA("sap.ui.table.AnalyticalTable")) {
						oModel = this.getTable().getModel();
						sEntitySet = this.getTable().getBinding("rows") && this.getTable().getBinding("rows").getPath().slice(1).split("(")[0];
					}

					// Create mdcFilterPanel
					this.oMDCFilterPanel = new MDCFilterPanel({
						enableReorder: false,
						change: this._mdcFilterPanelChangeHandler.bind(this),
						itemFactory: this._itemFactoryHandler.bind(this)
					});

					// We need to remove the fields from the Panel so when the dialog is destroyed they do not get destroyed
					this._detachFieldsFromMDCFilterPanel();

					// Create FilterProvider to get filters for FilterPanel
					if (!this.oFilterProviderPromise) {
						this.oFilterProviderPromise = FilterProvider._createFilterProvider({
							entitySet: sEntitySet,
							model: oModel,
							defaultDropDownDisplayBehaviour: this.oSmartTable && this.oSmartTable.data("defaultDropDownDisplayBehaviour"),
							defaultTokenDisplayBehaviour: this.oSmartTable && this.oSmartTable.data("defaultTokenDisplayBehaviour"),
							defaultSingleFieldDisplayBehaviour: this.oSmartTable && this.oSmartTable.data("defaultSingleFieldDisplayBehaviour"),
							dateFormatSettings: this.oSmartTable && this.oSmartTable.data("dateFormatSettings"),
							useContainsAsDefaultFilter: this.oSmartTable && this.oSmartTable.data("useContainsAsDefaultFilter"),
							annotationSuppressed: true,
							useDateRangeType: false,
							context: "mdcFilterPanel",
							smartContainerId: sSmartContainerId
						});
					}

					this.oFilterProviderPromise.then(function(oFilterProvider) {
						this._aActiveFilterPanelFieldNames = [];

						if (!oFilterProvider._aCustomFieldMetadata) {
							oFilterProvider._aCustomFieldMetadata = [];
						}
						this.oFilterProvider = oFilterProvider;

						this.oMDCFilterPanel.setModel(oFilterProvider.oModel, oFilterProvider.sFilterModelName);

						if (!this._aSplitIntervalFields) {
							this._aSplitIntervalFields = this._getSplitIntervalFieldNames();
						}

						// p13nData sets the data for the dropdown of the mdc Filter Panel
						this.oMDCFilterPanel.setP13nData(this._prepareP13nData());

						this._updateFilterData();

					}.bind(this));

					return resolve(this.oMDCFilterPanel);

				// OLD FILTER PANEL
				} else {
					var oColumnKeyMap = this.getColumnMap(true),
					oPanel = new P13nFilterPanel({
					containerQuery: true,
					enableEmptyOperations: true,
					items: {
						path: "$sapmP13nPanel>/transientData/filter/filterItems",
						template: new P13nItem({
							columnKey: '{$sapmP13nPanel>columnKey}',
							text: "{$sapmP13nPanel>text}",
							tooltip: "{$sapmP13nPanel>tooltip}",
							maxLength: "{$sapmP13nPanel>maxLength}",
							precision: "{$sapmP13nPanel>precision}",
							scale: "{$sapmP13nPanel>scale}",
							type: "{$sapmP13nPanel>type}",
							typeInstance: "{$sapmP13nPanel>typeInstance}",
							isDefault: "{$sapmP13nPanel>isDefault}",
							values: "{$sapmP13nPanel>values}",
							nullable: "{$sapmP13nPanel>nullable}"
						})
					},
					filterItems: {
						path: "$sapmP13nPanel>/controlDataReduce/filter/filterItems",
						template: new P13nAnyFilterItem({
							key: "{$sapmP13nPanel>key}",
							columnKey: "{$sapmP13nPanel>columnKey}",
							exclude: "{$sapmP13nPanel>exclude}",
							operation: "{$sapmP13nPanel>operation}",
							value1: "{$sapmP13nPanel>value1}",
							value2: "{$sapmP13nPanel>value2}"
						})
					},
					messageStrip: this.getMessageStrip(),
					beforeNavigationTo: this.setModelFunction(),
					filterItemChanged: function(oEvent) {
						var sReason = oEvent.getParameter("reason");
						var iIndex = oEvent.getParameter("index");
						var oItem = oEvent.getParameter("itemData");
						var oControlDataReduce = this.getControlDataReduce();

						if (oItem && sReason === "added") {
							if (iIndex > -1) {
								oControlDataReduce.filter.filterItems.splice(iIndex, 0, oItem);
							} else {
								oControlDataReduce.filter.filterItems.push(oItem);
							}
						}

						// Note: as long as P13nFilterPanel updates the 'filterItem' aggregation we do not need to update the model item
						// if (sReason === "updated") {
						// 	oControlDataReduce[that.getType()][that.getItemType()].splice(iIndex, 1, oItem);
						// }

						if (sReason === "removed" && iIndex > -1) {
							oControlDataReduce[this.getType()][this.getItemType()].splice(iIndex, 1);
						}

						this.setControlDataReduce2Model(oControlDataReduce);
						this.fireAfterPotentialModelChange({
							json: oControlDataReduce
						});
					}.bind(this)
				});

				if (this._aDropdownFields && this._aDropdownFields.length > 0) {
					this._aDropdownFields = this._aDropdownFields.filter(function(oField){
						var oColumn = oColumnKeyMap[oField.name];
						return !!Util._getCustomProperty(oColumn, "fullName");
					});
				}

				oPanel._oConditionPanel.data("dropdownFields", this._aDropdownFields);
				var fnSuggestCallback = function(oControl, sFieldName) {
					var oColumnKey2ColumnMap = this.getColumnMap(true),
						oColumn = oColumnKey2ColumnMap[sFieldName],
						sFullyQualifiedFieldName = Util._getCustomProperty(oColumn, "fullName"),
						oSmartFilter = this._getSmartFilterBar(),
						oProvider,
						oSmartTable = this._getSmartTable(),
						oResult,
						aControlConfigurations = oSmartFilter && oSmartFilter.getControlConfiguration(),
						sAggregationName, bTypeAheadEnabled, sDisplayBehaviour, oControlConfiguration, oCurrentFieldMetadata, i;

						if (oControl.isA("sap.m.ComboBox") || oControl.isA("sap.m.MultiComboBox")) {
							sAggregationName = "items";
							bTypeAheadEnabled = false;

							if (oSmartFilter && oSmartFilter._oFilterProvider) {
								oProvider = oSmartFilter._oFilterProvider;
								sDisplayBehaviour = oProvider._sTextArrangementDisplayBehaviour || "idOnly";
							} else if (oSmartTable && oSmartTable._oTableProvider) {
								oProvider = oSmartTable._oTableProvider;
								sDisplayBehaviour = oProvider._oDefaultDropDownDisplayBehaviour || "idOnly";
							}
							this._aDropdownFields.forEach(function(oField) {
								if (oField.name === sFieldName) {
									oResult = oField["com.sap.vocabularies.Common.v1.Text"];
									if (oResult) {
										sDisplayBehaviour = oProvider._oMetadataAnalyser.getTextArrangementValue(oResult);
									} else if (oField["com.sap.vocabularies.UI.v1.TextArrangement"]) {
										sDisplayBehaviour = oProvider._oMetadataAnalyser.getTextArrangementValue(oField);
									}
								}
							});
						if (Array.isArray(aControlConfigurations) && aControlConfigurations.length > 0) {
							for (i = 0; i < aControlConfigurations.length; i++) {
								oControlConfiguration = aControlConfigurations[i];
								if (oControlConfiguration.getKey() === sFieldName) {
									sDisplayBehaviour = oControlConfiguration.getDisplayBehaviour();
									break;
								}
							}
						}
					} else {
						sAggregationName = "suggestionRows";
						bTypeAheadEnabled = true;
					}

					if (oSmartFilter && oSmartFilter._oFilterProvider && oSmartFilter._oFilterProvider._aFilterBarMultiValueFieldMetadata) {
						oCurrentFieldMetadata = oSmartFilter._oFilterProvider._aFilterBarMultiValueFieldMetadata.filter(function(oFieldMetadata) {
							return oFieldMetadata.name === sFieldName;
						})[0];

						if (oCurrentFieldMetadata) {
							oPanel._oConditionPanel.setDisplayFormat(oCurrentFieldMetadata.displayFormat);
						}
					}

					if (sFullyQualifiedFieldName) {
						oControl.setShowSuggestion && oControl.setShowSuggestion(true);
						oControl.setFilterSuggests && oControl.setFilterSuggests(false);
						oControl.setModel(this.getTable().getModel()); // the control which should show suggest need the model from the table assigned

						return new ValueListProvider({
							fieldName: sFieldName,
							control: oControl,
							model: this.getTable().getModel(),
							maxLength: Util._getCustomProperty(oColumn, "maxLength"),
							displayBehaviour: sDisplayBehaviour,
							resolveInOutParams: false,
							loadAnnotation: true,
							fullyQualifiedFieldName: sFullyQualifiedFieldName,
							aggregation: sAggregationName,
							typeAheadEnabled: bTypeAheadEnabled,
							enableShowTableSuggestionValueHelp: false
						});
					}
				}.bind(this);

				oPanel._oConditionPanel._fSuggestCallback = fnSuggestCallback;

				// Enable enhanced exclude operations
				oPanel._enableEnhancedExcludeOperations();

				oPanel.addStyleClass("sapUiSmallMarginTop");

				return resolve(oPanel);
				}
			}.bind(this));
		}.bind(this));
	};

	FilterController.prototype._getSplitIntervalFieldNames = function() {
		var i, oField, aFieldNames = [],
			oFilterProvider = this.oFilterProvider;

		if (oFilterProvider && oFilterProvider.aAllFields) {
			for (i = 0; i < oFilterProvider.aAllFields.length; i++) {
				oField = oFilterProvider.aAllFields[i];
				if (oField.filterRestriction === FilterType.Interval && oField.type !== "Edm.DateTime") {
					aFieldNames.push(oField.name);
				}
			}
		}

		return aFieldNames;
	};

	/**
	 * Gets a field metadata for a given field name
	 * @param {array} aViewMetadata The OData metadata
	 * @param {string} sName  the name in the OData metadata
	 * @returns {object} oFieldMetadata the found metadata or <code>null</code>
	 */
	FilterController.prototype._getFieldMetadata = function(aViewMetadata, sName) {
		var oFieldMetadata = null;
		if (Array.isArray(aViewMetadata)) {
			aViewMetadata.some(function(oGroup) {
				if (oGroup && oGroup.fields) {
					oGroup.fields.some(function(oField) {
						if (oField && oField.name === sName) {
							oFieldMetadata = oField;
						}
						return oFieldMetadata !== null;
					});
				}

				return oFieldMetadata !== null;
			});
		}

		return oFieldMetadata;
	};

	/**
	 * Handler for itemFactory of the mdcFilterPanel where the field is created
	 *
	 * @param {object} oItem - the item of the p13nData
	 * @returns {object} oControl - the control that will be shown in the filter panel
	 * @private
	 */
	FilterController.prototype._itemFactoryHandler = function(oItem) {

		var i, oControlConfiguration,
			sDisplayBehaviour,
			oFieldMetadataCopy,
			sName = oItem.name,
			oFilterProvider = this.oFilterProvider,
			oControl = this._getControlByName(sName),
			sFilterPropertyName = this._getFilterPropertyFromColumn(sName),
			oFieldMetadata;

		if (sFilterPropertyName && sFilterPropertyName.includes("/")) {
			oFieldMetadata = oFilterProvider._oMetadataAnalyser.extractNavigationPropertyField(sFilterPropertyName, oFilterProvider.sEntitySet);
			oFieldMetadata = oFilterProvider._createFieldMetadata(oFieldMetadata);
		} else {
			oFieldMetadata = oFilterProvider._getFieldMetadata(sFilterPropertyName);
		}

		// In case of custom column the filterProperty can be different so we use the metadata for the filterProperty but we copy it because we'll change it
		if (oFieldMetadata && sFilterPropertyName && (sName !== sFilterPropertyName)) {
			oFieldMetadata = Object.assign({}, oFieldMetadata);
		}

		this._aActiveFilterPanelFieldNames.push(sName);

		if (!oControl) {
			if (!oFieldMetadata) {
				if (!this._aViewMetadata) {
					this._aViewMetadata = oFilterProvider._oMetadataAnalyser._getAllFilterableFieldsByEntityForAllEndpoints(oFilterProvider.sEntitySet, true, false, null);
				}
				oFieldMetadata = this._getFieldMetadata(this._aViewMetadata, sName);
				if (oFieldMetadata) {
					oFieldMetadata = oFilterProvider._createFieldMetadata(oFieldMetadata);
				}
			}

			oFieldMetadata = this._updateFieldMetadata(oFieldMetadata, oItem, sFilterPropertyName);

			// If we have control configuration from SFB linked to the ST we use it to get the displayBehaviour
			if (this.aSFBControlConfig) {
				for (i = 0; i < this.aSFBControlConfig.length; i++) {
					oControlConfiguration = this.aSFBControlConfig[i];
					if (oControlConfiguration.getKey() === oFieldMetadata.fieldName) {
						sDisplayBehaviour = oControlConfiguration.getDisplayBehaviour();
						if (sDisplayBehaviour && !oControlConfiguration.isPropertyInitial("displayBehaviour")) {
							oFieldMetadataCopy = Object.assign({}, oFieldMetadata);
							oFieldMetadataCopy.displayBehaviour = sDisplayBehaviour;
						}
						break;
					}
				}
			}

			if (oFieldMetadataCopy) {
				oFieldMetadataCopy.fCreateControl(oFieldMetadataCopy);
				oControl = oFieldMetadataCopy.control;
			} else {
				oFieldMetadata.fCreateControl(oFieldMetadata);
				oControl = oFieldMetadata.control;
			}

			// the control which should show dropdown need the model from the table/chart assigned
			oControl.setModel(this.getTable().getModel());

			oControl._sControlName = oItem.name;
			this._aFilterPanelFields.push(oControl);

			if (oControl.isA("sap.m.Select") || oControl.isA("sap.m.TimePicker")) {
				oControl.setWidth("100%");
			}

			if (oControl.isA("sap.m.MultiInput")) {
				oControl.attachTokenUpdate(this._fieldChangeHandler.bind(this));
			} else {
				oControl.attachChange(this._fieldChangeHandler.bind(this));
			}
		}

		// when the dialog is closed with erroneous field when we reopen it we need to reset the value state
		if (oControl.getValueState && oControl.getValueState() === ValueState.Error) {
			oControl.setValueState(ValueState.None);
		}

		return oControl;
	};

	/**
	 * Handler for change event fired from the field
	 *
	 * @param {object} oEvent - the change event of the mdc filterPanel field
	 * @private
	 */
	FilterController.prototype._fieldChangeHandler = function(oEvent) {
		var key, value, oFieldMetadata, aFilterData = [], oCondition,
			oFilterProvider = this.oFilterProvider,
			oFilterData = oFilterProvider.getFilterData(),
			oControl = oEvent.getSource(),
			sName = oControl._sControlName,
			condition = {
				exclude: false,
				columnKey: sName,
				operation: "EQ",
				value1: null,
				value2: null
			};

		// We need the setTimeout because the promises are created after the change event is fired
		setTimeout(function() {
			Promise.all(oFilterProvider._getCurrentValidationPromises()).then(function () {
				for (key in oFilterData) {
					if (oFilterData.hasOwnProperty(key)) {
						value = oFilterData[key];
						if (value) {
							oFieldMetadata = oFilterProvider._getFieldMetadata(key);
							if (oFieldMetadata && oFieldMetadata.fieldNameOData && key !== oFieldMetadata.fieldNameOData) {
								key = oFieldMetadata.fieldNameOData;
							}
							condition.columnKey = key;
							if (condition.columnKey && condition.columnKey.includes("___")) {
								condition.columnKey = condition.columnKey.replaceAll("___", "/");
							}
							oCondition = Object.assign({}, condition);
							// Ranges handling
							if (Array.isArray(value.ranges) && value.ranges.length > 0) {
								aFilterData.push(this._createConditionForRanges(value.ranges));
							}
							// Items handling
							if (Array.isArray(value.items) && value.items.length > 0) {
								aFilterData.push(this._createConditionForItems(value.items, condition));
							}
							// Intervals handling
							if (value.hasOwnProperty('low') && value.low) {
								aFilterData.push(this._createConditionForIntervals(value, key, condition));
							}
							// handling of numeric multi-value fields
							if (value.value) {
								if (oControl && oControl.getValueState() !== ValueState.Error) {
									oCondition = Object.assign({}, condition);
									oCondition.value1 = value.value;
									aFilterData.push(oCondition);
								}
							}
							// single value handling
							if (typeof value !== 'object' || value instanceof Date) {
								oCondition = Object.assign({}, condition);
								oCondition.value1 = value;
								aFilterData.push(oCondition);
							}
						}
					}

				}
				aFilterData = aFilterData.flat();
				this._updateControlDataReduce(aFilterData);
			}.bind(this));
		}.bind(this));
	};

	/**
	 * Updates field metadata for custom column or navigation properties
	 *
	 * @param {object} oFieldMetadata - the metadata to be updated
	 * @param {object} oItem - the item from the p13nData
	 * @param {string} sFilterPropertyName - the filterProperty of the column which corresponds to a property in the service metadata
	 * @returns {object} oFieldMetadata - the updated metadata
	 * @private
	 */
	FilterController.prototype._updateFieldMetadata = function(oFieldMetadata, oItem, sFilterPropertyName) {
		var oLabel, oCustomMetadata,
			sName = oItem.name,
			oFilterProvider = this.oFilterProvider,
			bMetadataNeedsAdaptation = false,
			bIsCustomColumn = this._getIsCustomColumn(sName),
			oColumn = this._getColumnByKey(sName);

			if (oFieldMetadata) {
				if (oItem && !bIsCustomColumn && oFieldMetadata.fieldName && oFieldMetadata.fieldName.includes("/")) {
					bMetadataNeedsAdaptation = true;
				}
				if (bIsCustomColumn) {
					oLabel = oColumn && ((oColumn.getHeader && oColumn.getHeader()) || (oColumn.getLabel && oColumn.getLabel() ));
					if (oLabel && oLabel.getText()) {
						oFieldMetadata.label = oLabel.getText();
					}
				}
			}

			// For navigation properties we need to extract it first
			if (sFilterPropertyName && sFilterPropertyName.includes("/")) {
				oFieldMetadata = oFilterProvider._oMetadataAnalyser.extractNavigationPropertyField(sFilterPropertyName, oFilterProvider.sEntitySet);
				oFieldMetadata = oFilterProvider._createFieldMetadata(oFieldMetadata);
			}

			// oFieldMetadata can be null when the property in the metadata is not filterable.
			// However the column can be filterable with property or p13nData so we use the metadata from the FilterProperty of the p13nData
			if (!oFieldMetadata) {
				sName = this._getFilterPropertyFromColumn(sName);
				oCustomMetadata = oFilterProvider.aAllFields && oFilterProvider.aAllFields.find(function(oField) {
					return oField.name === sName;
				});
				oCustomMetadata = oFilterProvider._createFieldMetadata(oCustomMetadata);
				oFieldMetadata = Object.assign({}, oCustomMetadata);
			}

			// for custom columns we override the names in the metadata and we take maxLength, scale and precision from the custom column p13nData
			if (bIsCustomColumn || bMetadataNeedsAdaptation) {
				oFieldMetadata = this._prepareFieldMetadataForCustomColumn(oFieldMetadata, oItem);
			}

		return oFieldMetadata;
	};

	/**
	 * Updates the existing metadata with custom properties from the custom p13nData
	 *
	 * @param {object} oFieldMetadata - the given metadata for the field
	 * @param {object} oItem - the item from the p13nData
	 * @returns {object} oFieldMetadata - the updated metadata
	 * @private
	 */
	FilterController.prototype._prepareFieldMetadataForCustomColumn = function(oFieldMetadata, oItem) {
		var sIdSuffix = oItem.name, sCustomPrecision, sCustomScale, sCustomMaxLength, bHasConstraints, oTypeInstance, sName = oItem.name,
			oColumn = this._getColumnByKey(sName),
			oFilterProvider = this.oFilterProvider;
		// sName will be used for property in the internal JSON model so it cannot include "/"
		if (sName.includes("/")) {
			this._aCustomColumnKeysWithSlash.push(sName);
			sName = sName.replaceAll("/", "___");
		}

		oFieldMetadata.customColumnKey = sIdSuffix;
		oFieldMetadata.fieldName = sName;
		oFieldMetadata.name = sName;
		bHasConstraints = !!oFieldMetadata.ui5Type && oFieldMetadata.ui5Type.oConstraints;
		oFieldMetadata.label = oColumn && (oColumn.getHeader ? oColumn.getHeader().getText() : oColumn.getLabel().getText());
		sCustomMaxLength = Util._getCustomProperty(oColumn, "maxLength");
		sCustomScale = Util._getCustomProperty(oColumn, "scale");
		sCustomPrecision = Util._getCustomProperty(oColumn, "precision");
		// We copy the constraints so when we change them the original object containing the fieldMetadata does not get changed
		if (bHasConstraints && (sCustomMaxLength || sCustomScale || sCustomPrecision)) {
			oTypeInstance = oFieldMetadata.ui5Type;
			oFieldMetadata = Object.assign({}, oFieldMetadata, {
				ui5Type: Object.assign({}, oFieldMetadata.ui5Type, { oConstraints: Object.assign({}, oFieldMetadata.ui5Type.oConstraints) })
			});

			// When we copy the typeInstance we lose the inherited methods and objects so we need to add them to the copied object manually
			for (var key in oTypeInstance) {
				if (!oTypeInstance.hasOwnProperty(key)) {
					oFieldMetadata.ui5Type[key] = oTypeInstance[key];
				}
			}
		}
		// If custom column has maxLength, scale or precision set pass it to the Metadata so the control has the same constraints
		if (sCustomMaxLength) {
			oFieldMetadata.maxLength = sCustomMaxLength;
			if (bHasConstraints) {
				oFieldMetadata.ui5Type.oConstraints.maxLength = sCustomMaxLength;
			}
		}
		if (sCustomScale) {
			oFieldMetadata.scale = sCustomScale;
			if (bHasConstraints) {
				oFieldMetadata.ui5Type.oConstraints.scale = sCustomScale;
			}
		}
		if (sCustomPrecision) {
			oFieldMetadata.precision = sCustomPrecision;
			if (bHasConstraints) {
				oFieldMetadata.ui5Type.oConstraints.precision = sCustomPrecision;
			}
		}

		oFilterProvider._aCustomFieldMetadata.push(oFieldMetadata);
		this._updateFilterData();
		// oFilterProvider._createInitialModelForField({}, oFieldMetadata);

		return oFieldMetadata;
	};

	/**
	 * Calculates the p13nData which will be passed to the mdcFilterPanel
	 * p13nData is responsible for which fields will be visible in the Filter
	 *
	 * @return {array} array with the p13nData
	 */
	FilterController.prototype._prepareP13nData = function() {
		var aP13nData = [], bActive,
			aDataReduceFilterItems = this._getControlDataReduceFilterItems();

		this.getTransientData().filter.filterItems.forEach(function(oItem) {
			bActive = aDataReduceFilterItems && aDataReduceFilterItems.some(function(oFilterItem){
				return oFilterItem.columnKey === oItem.columnKey;
			});
			// When FilterPanel is opened from column header make this field active
			if (oItem.isDefault) {
				bActive = true;
			}
			aP13nData.push({
				name: oItem.columnKey,
				label: oItem.text,
				active: bActive
			});
		});

		return aP13nData;
	};

	/**
	 * Event handler for change fired from the mdc Filter Panel
	 * @param {object} oEvent - the change event
	 */
	FilterController.prototype._mdcFilterPanelChangeHandler = function(oEvent) {
		if (oEvent.getParameter("reason") === this.oMDCFilterPanel.CHANGE_REASON_REMOVE) {
			this._handleFieldRemove(oEvent);
		}
	};

	/**
	 * Resets the value in the filterProvider model and clears the value from the input
	 * @param {object} oEvent the change event of the mdcFilterPanel
	 * @private
	 */
	FilterController.prototype._handleFieldRemove = function(oEvent) {
		var oFilterProvider = this.oFilterProvider,
			sName = oEvent.getParameter("item").name,
			sCustomColumnName,
			oFieldMetadata = oFilterProvider._getFieldMetadata(sName),
			oControl = this._getControlByName(sName),
			aFilterItems = this._getControlDataReduceFilterItems();

		// When we remove a field we need to reset the value in the FilterProvider and the ControlDataReduce model
		if (aFilterItems && aFilterItems.length > 0) {
			aFilterItems = aFilterItems.filter(function(oItem) {
				return oItem.columnKey !== sName;
			});
		}

		// update controlDataReduce with the removed item
		this._updateControlDataReduce(aFilterItems);

		// for custom columns we might not have the fieldMetadata so we need to get the metadata for the filterProperty
		if (!oFieldMetadata) {
			sCustomColumnName = this._getFilterPropertyFromColumn(sName);
			oFieldMetadata = oFilterProvider.aAllFields.find(function(oField) {
				return oField.name === sCustomColumnName;
			});
			oFieldMetadata = oFilterProvider._createFieldMetadata(oFieldMetadata);
			oFieldMetadata.name = sName;
			oFieldMetadata.fieldName = sName;
			oFieldMetadata.control = oControl;
		}

		// Update value in FilterProvider
		oFilterProvider._createInitialModelForField({}, oFieldMetadata);

		// Clear value from the inputs
		if (oControl && oControl.getValue && oControl.getValue()) {
			oControl.setValue(null);
		}
	};

	/**
	 * Removes the fields from their parent
	 */
	FilterController.prototype._detachFieldsFromMDCFilterPanel = function() {
		var oControlParent,
			fnExit = this.oMDCFilterPanel.exit;

		this.oMDCFilterPanel.exit = function() {
			fnExit.apply(this, arguments);
			this._aFilterPanelFields.forEach(function(oControl) {
				if (oControl) {
					oControlParent = oControl.getParent();
					if (oControlParent) {
						// On closing the dialog we detach the fields from the dialog so they don't get destroyed
						oControlParent.removeContent(oControl);
					}
				}
			});
			if (this._aActiveFilterPanelFieldNames) {
				this._aActiveFilterPanelFieldNames = null;
			}
		}.bind(this);
	};

	/**
	 * Creates condition for controlDataReduce from ranges of the filterProvider's model
	 * @param {array} aRanges array with ranges from the filterProvider's model
	 * @returns {array} array with the created conditions
	 * @private
	 */
	FilterController.prototype._createConditionForRanges = function(aRanges) {
		var i, oRange, aFilterData = [], oFieldMetadata;

		for (i = 0; i < aRanges.length; i++) {
			oRange = Object.assign({}, aRanges[i]);
			if (!oRange.columnKey) {
				oRange.columnKey = oRange.keyField;
			}
			oFieldMetadata = this.oFilterProvider._getFieldMetadata(oRange.columnKey);
			if (oFieldMetadata && oFieldMetadata.fieldNameOData) {
				oRange.columnKey = oFieldMetadata.fieldNameOData;
			}
			if (oRange.columnKey && oRange.columnKey.includes("___")) {
				oRange.columnKey = oRange.columnKey.replaceAll("___", "/");
			}
			delete oRange.keyField;
			delete oRange.tokenText;
			aFilterData.push(oRange);
		}
		return aFilterData;
	};

	/**
	 * Creates condition for controlDataReduce from items of the filterProvider's model
	 * @param {array} aItems array with items from the filterProvider's model
	 * @param {object} condition object with simple pattern for condition
	 * @returns {array} array with the created conditions
	 * @private
	 */
	FilterController.prototype._createConditionForItems = function(aItems, condition) {
		var i, oItem, aFilterData = [], oCondition;

		for (i = 0; i < aItems.length; i++) {
			oItem = aItems[i];
			oCondition = Object.assign({}, condition);
			oCondition.value1 = oItem.key;
			oCondition.token = oItem.text;
			aFilterData.push(oCondition);
		}
		return aFilterData;
	};

	/**
	 * Creates condition for controlDataReduce from items of the filterProvider's model
	 * @param {object} oValue object with data (low and high) from the filterProvider's model
	 * @param {string} sKey the name of the property in the filterProvider's model
	 * @param {object} oCondition object with simple pattern for condition
	 * @returns {object} object with the created condition
	 * @private
	 */
	FilterController.prototype._createConditionForIntervals = function(oValue, sKey, oCondition) {
		var oCreatedCondition,
			oFilterProvider = this.oFilterProvider,
			aValues = [],
			oFieldViewMetadata;

		oCreatedCondition = Object.assign({}, oCondition);
		oCreatedCondition.operation = "BT";
		if (oValue.low && oValue.high) {
			oCreatedCondition.value1 = oValue.low;
			oCreatedCondition.value2 = oValue.high;
		} else if (oValue.low) {
			if (oFilterProvider._aFilterBarDateTimeFieldNames.indexOf(sKey) > -1) {
				oFieldViewMetadata = oFilterProvider._getFieldMetadata(sKey);
				aValues = FormatUtil.parseDateTimeOffsetInterval(oValue.low);
				aValues[0] = oFieldViewMetadata.ui5Type.parseValue(aValues[0], "string");
				if (aValues.length === 2) {
					aValues[1] = oFieldViewMetadata.ui5Type.parseValue(aValues[1], "string");
				}
				if (aValues.length === 1) {
					oCreatedCondition.operation = "EQ";
				}
			} else {
				aValues = FormatUtil.parseFilterNumericIntervalData(oValue.low);
			}
			if (aValues) {
				oCreatedCondition.value1 = aValues[0];
				oCreatedCondition.value2 = aValues[1];
			}
		}

		return oCreatedCondition;
	};

	/**
	 * Updates the filterProvider's model with data from controlDataReduce model
	 *
	 * @param {array} aData the data to be used for updating the model
	 */
	FilterController.prototype._updateFilterData = function(aData) {
		var i, oToken, oFilterFieldData, sName, oItem, oFilterData,
			oFilterProvider = this.oFilterProvider, oFieldMetadata,
			aFilterItems = aData ? aData : this._getControlDataReduceFilterItems();
			// aDataReduceFilterItems = this._getControlDataReduceFilterItems();

		// We clear the existing data to prevent defaultFilterData
		oFilterProvider.clear();
		oFilterData = Object.assign({}, oFilterProvider.getFilterData());

		if (aFilterItems && aFilterItems.length > 0) {
			for (i = 0; i < aFilterItems.length; i++) {
				oItem = Object.assign({}, aFilterItems[i]);
				sName = oItem.keyField ? oItem.keyField : oItem.columnKey;
				if (this._aCustomColumnKeysWithSlash.includes(sName)) {
					sName = sName.replaceAll("/", "___");
				}
				oFilterFieldData = oFilterData[sName];
				if (!oItem.keyField) {
					oItem.keyField = oItem.columnKey;
					delete oItem.columnKey;
				}
				if (oItem.token) {
					oToken = {
						key: oItem.value1,
						text: oItem.token
					};
					if (!oFilterFieldData.items) {
						oFilterFieldData.items = [];
					}
					oFilterFieldData.items.push(oToken);
				} else if (oItem.conditionTypeInfo) {
					if (!oItem.conditionTypeInfo.data.operation) {
						oItem.conditionTypeInfo.data.operation = oItem.conditionTypeInfo.data.operator;
					}
					oFilterFieldData.conditionTypeInfo = oItem.conditionTypeInfo;
					oFilterFieldData.ranges.push(oItem);
					// Interval handling
				} else if ((oFilterFieldData && oFilterFieldData.hasOwnProperty("low"))) {
					// for dateTimeOffset fields we need to format the date to string before setting it to the filterProvider model
					if (oFilterProvider._aFilterBarDateTimeFieldNames && oFilterProvider._aFilterBarDateTimeFieldNames.indexOf(sName) > -1) {
						oFieldMetadata = oFilterProvider._getFieldMetadata(sName);
						if (oItem.value1 instanceof Date) {
							oItem.value1 = oFieldMetadata.ui5Type.formatValue(oItem.value1, "string");
						}
						if (oItem.value2 instanceof Date) {
							oItem.value2 = oFieldMetadata.ui5Type.formatValue(oItem.value2, "string");
						}
					}
					if (this._aSplitIntervalFields && this._aSplitIntervalFields.indexOf(oItem.keyField) > -1) {
						// Non date intervals and dateTimeOffset are bind only to "/low" so we concat them with "-"
						oToken = {
							low: oItem.value1 + "-" + oItem.value2,
							high: null
						};
					} else {
						oToken = {
							low: oItem.value1,
							high: oItem.value2
						};
					}
					oFilterData[sName] = oToken;
				} else if (oFilterFieldData === null || typeof oFilterFieldData !== "object") {
					oFilterData[sName] = oItem.value1;
				}  else {
					if (!(oFilterFieldData && oFilterFieldData.ranges)) {
						oFilterFieldData.ranges = [];
					}
					oFilterData[sName].ranges.push(oItem);
				}
			}
			oFilterProvider.setFilterData(oFilterData);
		}
	};

	/**
	 * Finds the control from all created controls in the mdcFilterPanel
	 *
	 * @param {string} sName the name in the p13nData for which we want the control
	 * @returns {object} the found control
	 * @private
	 */
	FilterController.prototype._getControlByName = function(sName) {
		var i, oControl, oField,
			aFields = this._aFilterPanelFields;

		for (i = 0; i < aFields.length; i++) {
			oField = aFields[i];
			if (oField._sControlName === sName) {
				oControl = oField;
				break;
			}
		}

		return oControl;
	};

	/**
	 * Operations on filter are processed sometime directly at the table and sometime not. In case that something has been changed via Personalization
	 * Dialog the consumer of the Personalization Dialog has to apply filtering at the table. In case that filter has been changed via user
	 * interaction at table, the change is instantly applied at the table.
	 */
	FilterController.prototype.getChangeType = function(oPersistentDataBase, oPersistentDataCompare) {
		if (!oPersistentDataCompare || !oPersistentDataCompare.filter || !oPersistentDataCompare.filter.filterItems) {
			return CompLibrary.personalization.ChangeType.Unchanged;
		}

		if (oPersistentDataCompare && oPersistentDataCompare.filter && oPersistentDataCompare.filter.filterItems) {
			oPersistentDataCompare.filter.filterItems.forEach(function(oFilterItem) {
				delete oFilterItem.key;
				delete oFilterItem.source;
			});
		}
		if (oPersistentDataBase && oPersistentDataBase.filter && oPersistentDataBase.filter.filterItems) {
			oPersistentDataBase.filter.filterItems.forEach(function(oFilterItem) {
				delete oFilterItem.key;
				delete oFilterItem.source;
			});
		}
		var bIsDirty = JSON.stringify(oPersistentDataBase.filter.filterItems) !== JSON.stringify(oPersistentDataCompare.filter.filterItems);

		return bIsDirty ? CompLibrary.personalization.ChangeType.ModelChanged : CompLibrary.personalization.ChangeType.Unchanged;
	};

	/**
	 * Result is XOR based difference = CurrentModelData - oPersistentDataCompare
	 *
	 * @param oPersistentDataBase
	 * @param {object} oPersistentDataCompare JSON object. Note: if sortItems is [] then it means that all sortItems have been deleted
	 * @returns {object} JSON object or null
	 */
	FilterController.prototype.getChangeData = function(oPersistentDataBase, oPersistentDataCompare) {
		if (!oPersistentDataBase || !oPersistentDataBase.filter || !oPersistentDataBase.filter.filterItems) {
			return this.createControlDataStructure();
		}

		if (oPersistentDataCompare && oPersistentDataCompare.filter && oPersistentDataCompare.filter.filterItems) {
			oPersistentDataCompare.filter.filterItems.forEach(function(oFilterItem) {
				delete oFilterItem.key;
				delete oFilterItem.source;
			});
		}
		if (oPersistentDataBase && oPersistentDataBase.filter && oPersistentDataBase.filter.filterItems) {
			oPersistentDataBase.filter.filterItems.forEach(function(oFilterItem) {
				delete oFilterItem.key;
				delete oFilterItem.source;
			});
		}

		if (!oPersistentDataCompare || !oPersistentDataCompare.filter || !oPersistentDataCompare.filter.filterItems) {
			return {
				filter: Util.copy(oPersistentDataBase.filter)
			};
		}

		if (JSON.stringify(oPersistentDataBase.filter.filterItems) !== JSON.stringify(oPersistentDataCompare.filter.filterItems)) {
			return {
				filter: Util.copy(oPersistentDataBase.filter)
			};
		}
		return null;
	};

	/**
	 * @param {object} oJsonBase - JSON object to which different properties from JSON oJson are added
	 * @param {object} oJson - JSON object from where the different properties are added to oJsonBase. Note: if filterItems
	 *        is [] then it means that all filterItems have been deleted
	 * @returns {object} JSON object as union result of oJsonBase and oJson
	 */
	FilterController.prototype.getUnionData = function(oJsonBase, oJson) {
		if (!oJson || !oJson.filter || !oJson.filter.filterItems) {
			return {
				filter: Util.copy(oJsonBase.filter)
			};
		}

		return {
			filter: Util.copy(oJson.filter)
		};
	};

	/**
	 * @private
	 * @returns {object} The <code>SmartFilterBar</code> connected to the Table or null
	 */
	FilterController.prototype._getSmartFilterBar = function() {
		var oSmartFilter,
			oTable = this.getTable();

		if (oTable) {
			oSmartFilter = oTable.oParent && oTable.oParent._oSmartFilter;
		}

		if (!oSmartFilter && oTable && this.getTableType() === CompLibrary.personalization.TableType.ChartWrapper){
			oSmartFilter = oTable.getChartObject() && oTable.getChartObject().oParent &&
				oTable.getChartObject().oParent._oSmartFilter;
		}


		return oSmartFilter ? oSmartFilter : null;
	};

	/**
	 * @private
	 * @returns {object} The <code>SmartTable</code> or null
	 */
	 FilterController.prototype._getSmartTable = function() {
		var oTableParent = this.getTable() && this.getTable().getParent();
		return oTableParent && oTableParent.isA("sap.ui.comp.smarttable.SmartTable") ? oTableParent : null;
	 };

	/**
	 * @private
	 * @returns {object} The <code>SmartChart</code> or null
	 */
	 FilterController.prototype._getSmartChart = function() {
		var oTable = this.getTable();
		if (oTable && this.getTableType() === CompLibrary.personalization.TableType.ChartWrapper) {
			return oTable && oTable.getChartObject() && oTable.getChartObject().getParent();
		}

		return null;
	 };

	/**
	 * Cleans up before destruction.
	 *
	 * @private
	 */
	FilterController.prototype.exit = function() {
		BaseController.prototype.exit.apply(this, arguments);
		this._aDropdownFields = null;
		this.aFilterItems = null;
		this._aSFBMultiInputs = null;
		this.oSmartChart = null;
		this.oSmartTable = null;
		this.oSmartFilterBar = null;
		this.aSFBControlConfig = null;
		this._aSplitIntervalFields = null;
		if (this.oFilterProviderPromise) {
			this.oFilterProviderPromise = null;
		}
		if (this.oFilterProvider && this.oFilterProvider.destroy) {
			this.oFilterProvider.destroy();
			this.oFilterProvider = null;
		}
		if (this._aFilterPanelFields && this._aFilterPanelFields.length > 0) {
			this._aFilterPanelFields.forEach(function(oField) {
				oField.destroy();
			});
		}
		this._aFilterPanelFields = null;
		this._aActiveFilterPanelFieldNames = null;
		this._aViewMetadata = null;
		this._aCustomColumnKeysWithSlash = null;
	};

	return FilterController;

});
