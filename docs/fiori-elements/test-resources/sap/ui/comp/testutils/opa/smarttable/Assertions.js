sap.ui.define([
	"sap/ui/test/Opa5"
], function (Opa5) {
	"use strict";

	return {
		/**
		 * Checks if a SmartTable is visible on the screen
		 *
		 * @returns {Promise} OPA waitFor
		 */
		iShouldSeeATable: function () {
			return this.waitFor({
				controlType: "sap.ui.comp.smarttable.SmartTable",
				check: function (aSmartTable) {
					return aSmartTable.length === 1;
				},
				success: function (aSmartTable) {
					Opa5.assert.ok(aSmartTable.length, "SmartTable is on the screen");
				},
				errorMessage: "No SmartTable found"
			});
		},

		/**
		 * Checks if the table title and count are visible on the screen
		 *
		 * @param {string} sTableId Id of the SmartTable
		 * @returns {Promise} OPA waitFor
		 */
		iShouldSeeTheTableTitleAndCount: function(sTableId) {
			return this.waitFor({
				id: sTableId + "-header",
				controlType: "sap.m.Title",
				success: function (oTitle) {
					Opa5.assert.ok(oTitle, "Table title is on the screen");
					var aMatches = oTitle.getText().match(/.*\([0-9]*\)/);
					Opa5.assert.ok(aMatches.length === 1, "Title contains item count");
				},
				errorMessage: "No title found"
			});
		},

		/**
		 * Checks if the variant management is visible on the screen
		 *
		 * @param {string} sTableId Id of the SmartTable
		 * @returns {Promise} OPA waitFor
		 */
		iShouldSeeVariantManagement: function(sTableId) {
			return this.waitFor({
				id: sTableId + "-variant",
				controlType: "sap.ui.comp.smartvariants.SmartVariantManagement",
				success: function (oVariantManagement) {
					Opa5.assert.ok(oVariantManagement, "Variant management is on the screen");
				},
				errorMessage: "No VariantManagement found"
			});
		},

		/**
		 * Checks if the Table is in Edit or Display mode
		 *
		 * @param {string} sTableId Id of the SmartTable
		 * @returns {Promise} OPA waitFor
		 */
		tableShouldBeInMode: function(sTableId, sMode) {
			return this.waitFor({
				id: sTableId + "-btnEditToggle",
				controlType: "sap.m.OverflowToolbarButton",
				success: function (oButton) {
					if (sMode === "Edit") {
						Opa5.assert.equal(oButton.getIcon(), "sap-icon://display", "Table is in Edit mode, 'Display' button is visible on the screen");
					} else {
						Opa5.assert.equal(oButton.getIcon(), "sap-icon://edit", "Table is in Display mode, 'Edit' button is visible on the screen");
					}
				},
				errorMessage: "No " + sMode === "Edit" ? "'Display'" : "'Edit'"  + " button found"
			});
		},

		/**
		 * Checks if the Personalization button is visible on the screen
		 *
		 * @param {string} sTableId Id of the SmartTable
		 * @returns {Promise} OPA waitFor
		 */
		iShouldSeeThePersonalisationButton: function(sTableId) {
			return this.waitFor({
				id: sTableId + "-btnPersonalisation",
				controlType: "sap.m.OverflowToolbarButton",
				success: function (oButton) {
					Opa5.assert.equal(oButton.getIcon(), "sap-icon://action-settings", "Personalisation button is visible on the screen");
				},
				errorMessage: "No Personalisation button found"
			});
		},

		/**
		 * Checks if the Export button is visible on the screen
		 *
		 * @param {string} sTableId Id of the SmartTable
		 * @returns {Promise} OPA waitFor
		 */
		iShouldSeeTheExportButton: function(sTableId) {
			return this.waitFor({
				id: sTableId + "-btnExcelExport",
				controlType: "sap.m.MenuButton",
				success: function (oButton) {
					Opa5.assert.ok(oButton, "Export button is visible on the screen");
				},
				errorMessage: "No 'Export' button found"
			});
		},

		/**
		 * Checks if the 'Show more per column'/'Show less per column' button is visible on the screen
		 *
		 * @param {string} sTableId Id of the SmartTable
		 * @returns {Promise} OPA waitFor
		 */
		iShouldSeeShowMorePerColumnButton: function(sTableId) {
			return this.waitFor({
				id: sTableId + "-btnShowHideDetails",
				controlType: "sap.m.SegmentedButton",
				success: function(oSegmentedButton) {
					Opa5.assert.ok(oSegmentedButton, "'Show more per column'/'Show less per column' button is visible on the screen");
				},
				errorMessage: "Did not find the 'Show more per column'/'Show less per column' button"
			});
		},

		/**
		 * Checks if the 'More' button is visible on the screen
		 *
		 * @param {string} sTableId Id of the SmartTable
		 * @returns {Promise} OPA waitFor
		 */
		iShouldSeeTheMoreButton: function(sTableId) {
			return this.waitFor({
				id: sTableId + "-ui5table-trigger",
				controlType: "sap.m.CustomListItem",
				success: function (oItem) {
					Opa5.assert.ok(oItem, "'More' button is visible on the screen");
				},
				errorMessage: "No 'More' button found"
			});
		},

		theColumnMenuShouldOpen: function() {
			return this.waitFor({
				controlType: "sap.m.table.columnmenu.Menu",
				success: function (aMenus) {
					Opa5.assert.ok(aMenus[0].isOpen(), "Column menu is visible on the screen");
				},
				errorMessage: "No Column Menu found"
			});
		},

		thePropertyShouldBeSorted: function(sTableId, sPropertyName, sSortOrder) {
			return this.waitFor({
				id: sTableId,
				controlType: "sap.ui.comp.smarttable.SmartTable",
				success: function(oTable) {
					Opa5.assert.equal(oTable._getColumnByKey(sPropertyName).data("p13nData").sorted.ascending, sSortOrder.toLowerCase() === "ascending");
				},
				errorMessage: "Did not find the table"
			});
		}
    };
});
