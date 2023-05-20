/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

// ----------------------------------------------------------------
// Utility class used by smart controls for multi-unit scenario
// ----------------------------------------------------------------
sap.ui.define([
	"sap/m/List",
	"sap/m/ResponsivePopover",
	"sap/m/CustomListItem",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/syncStyleClass",
	"sap/base/util/merge"
], function(
	List,
	ResponsivePopover,
	CustomListItem,
	Filter,
	FilterOperator,
	syncStyleClass,
	merge
) {
	"use strict";

	/**
	 * Utility class used by smart controls for multi-unit scenario
	 *
	 * @private
	 * @experimental This module is only for internal/experimental use!
	 */
	var MultiUnitUtil = {
		/**
		 * returns true/false based on whether multi-unit "*" value is present for unit
		 *
		 * @private
		 * @param {string} sUnit - The unit value
		 * @returns {function} whether there are multiple units - "*"
		 */
		isMultiUnit: function(sUnit) {
			return sUnit === "*";
		},
		/**
		 * returns true/false based on whether multi-unit "*" value is present for unit
		 *
		 * @private
		 * @param {string} sUnit - The unit value
		 * @returns {function} whether there are no multiple units - "*"
		 */
		isNotMultiUnit: function(sUnit) {
			return sUnit !== "*";
		},
		openMultiUnitPopover: function(oEvent, mAdditionalParams) {
			var oSmartTable = sap.ui.getCore().byId(mAdditionalParams.smartTableId);
			var oAnalyticalTable = oSmartTable.getTable();
			var oBinding = oAnalyticalTable.getBinding("rows");
			var sValue = mAdditionalParams.value;
			var sUnit = mAdditionalParams.unit;
			var oUoMTemplate = mAdditionalParams.template;
			var oAnalyticalInfoForColumn, sDimension;
			// no binding or value or unit --> return
			if (!oBinding || !sValue || !sUnit) {
				return;
			}

			var oLink = oEvent.getSource();
			// The link is inside a container (e.g. VBox), get this layout container control in order to get the row and finally the analytical info
			var oLayout = oLink.getParent();
			if (mAdditionalParams.additionalParent) {
				oLayout = oLayout.getParent();
			}
			// via the row, we can get the analytical information
			var oAnalyticalInfo = oAnalyticalTable.getAnalyticalInfoOfRow(oLayout.getParent());
			if (!oAnalyticalInfo) {
				return;
			}
			// prepare filter statement, select and title

			var i, aFilters = [], aSelect = [
				// always request value and unit
				sValue, sUnit
			], sTitle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("SMARTTABLE_MULTI_TOTAL_TITLE") || "Total";

			// Add any application filters already present on the binding (these should be the ones already processed by SmartTable)
			if (oBinding.aApplicationFilter) {
				aFilters = [].concat(oBinding.aApplicationFilter);
			}
			// Get custom query parameters (e.g. "search" from the parent binding and apply it here!)
			var mBindingInfo = oAnalyticalTable.getBindingInfo("rows");
			var mCustomParameters = (mBindingInfo && mBindingInfo.parameters && mBindingInfo.parameters.custom) ? merge({}, mBindingInfo.parameters.custom) : undefined;

			// Grand Total --> do nothing as we already add Currency and unit to the Select clause
			if (oAnalyticalInfo.groupTotal || oAnalyticalInfo.group) {
				// Group Total / Group Header
				var aGroupedColumns = oAnalyticalInfo.groupedColumns;

				for (i = 0; i < aGroupedColumns.length; i++) {
					sDimension = sap.ui.getCore().byId(aGroupedColumns[i]).getLeadingProperty();
					if (!sDimension) {
						continue;
					}
					// Get Analytical Info for column --> in order to determine/use the proper dimensionProperty!
					// When grouping is done on text column, the actual grouping happens on the dimension (code) property and not the text
					oAnalyticalInfoForColumn = oBinding.getAnalyticalInfoForColumn(sDimension);
					if (oAnalyticalInfoForColumn) {
						sDimension = oAnalyticalInfoForColumn.dimensionPropertyName;
					}
					if (sDimension) {
						aFilters.push(new Filter(sDimension, FilterOperator.EQ, oAnalyticalInfo.context.getProperty(sDimension)));
					}
				}
				sTitle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("SMARTTABLE_MULTI_GROUP_TITLE") || "Subtotal";
			} else if (!oAnalyticalInfo.grandTotal) {
				// Line item that contains multiple units
				var aProperties = Object.getOwnPropertyNames(oBinding.getDimensionDetails());
				for (i = 0; i < aProperties.length; i++) {
					aFilters.push(new Filter(aProperties[i], FilterOperator.EQ, oAnalyticalInfo.context.getProperty(aProperties[i])));
				}
				sTitle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("SMARTTABLE_MULTI_GROUP_TITLE") || "Subtotal";
			}

			var oDetailsTemplate = oUoMTemplate.clone(); // clone the original unit template
			oDetailsTemplate.unbindProperty("visible"); // necessary for the details list

			// create popover
			var sPopoverId = mAdditionalParams.smartTableId + "-multiUnitPopover", oPopover, oDetailsList;
			oPopover = sap.ui.getCore().byId(sPopoverId);
			if (!oPopover) {
				oDetailsList = new List(sPopoverId + "-detailsList", {
					showSeparators: "None",
					ariaLabelledBy: sPopoverId + "-title"
				});
				oDetailsList.addStyleClass("sapUiContentPadding sapUiCompMultiCurrency");

				oPopover = new ResponsivePopover(sPopoverId, {
					content: oDetailsList
				});
				syncStyleClass("sapUiSizeCompact", oAnalyticalTable, oPopover);
				oAnalyticalTable.addDependent(oPopover);
			}
			if (!oDetailsList) {
				oDetailsList = sap.ui.getCore().byId(sPopoverId + "-detailsList");
			}

			// Update the Popover content and bind the result list
			oPopover.setTitle(sTitle);
			oPopover.setPlacement(oAnalyticalInfo.grandTotal ? "VerticalPreferredTop" : "VerticalPreferredBottom");
			oDetailsList.bindItems({
				path: oBinding.getPath(),
				filters: aFilters,
				parameters: {
					select: aSelect.join(","),
					custom: mCustomParameters
				},
				templateShareable: false,
				template: new CustomListItem({
					content: [
						oDetailsTemplate
					]
				})
			});
			oPopover.openBy(oLink);
		}
	};

	return MultiUnitUtil;

}, /* bExport= */true);
