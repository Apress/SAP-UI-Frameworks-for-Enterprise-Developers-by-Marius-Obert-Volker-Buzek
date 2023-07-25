/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
/**
 * Defines support rules of the SmartFilterBar control of sap.ui.comp library.
 */
sap.ui.define(["sap/ui/support/library"], function(SupportLib) {
	"use strict";

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	/* eslint-disable no-lonely-if */

	var fnGetView = function(oControl) {
		var oObj = oControl.getParent();
		while (oObj) {
			if (oObj.isA("sap.ui.core.mvc.View")) {
				return oObj;
			}
			oObj = oObj.getParent();
		}
		return null;
	};

	var oSmartFilterBarAndSmartTableRule = {
		id: "equalEntitySetInSmartFilterBarAndSmartTable",
		audiences: [
			SupportLib.Audiences.Application
		],
		categories: [
			SupportLib.Categories.Consistency
		],
		minversion: "1.56",
		async: false,
		title: "SmartFilterBar: Entity set used in SmartTable and SmartFilterBar",
		description: "Entity set of SmartTable has to be the same as the entity set of SmartFilterBar, which is associated via the property smartFilterId",
		resolution: "Make sure that the entity sets used in SmartTable and SmartFilterBar are the same",
		resolutionurls: [
			{
				text: "API Reference: SmartTable",
				href: "https://ui5.sap.com/#/api/sap.ui.comp.smarttable.SmartTable/controlProperties"
			},
			{
				text: "API Reference: SmartFilterBar",
				href: "https://ui5.sap.com/#/api/sap.ui.comp.smartfilterbar.SmartFilterBar/controlProperties"
			}
		],
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.comp.smarttable.SmartTable").filter(function(oSmartTable) {
				return !!oSmartTable.getSmartFilterId();
			}).forEach(function(oSmartTable) {
				var oView = fnGetView(oSmartTable);
				if (!oView) {
					return;
				}
				var oSmartFilter = oView.byId(oSmartTable.getSmartFilterId());
				if (!oSmartFilter) {
					oIssueManager.addIssue({
						severity: SupportLib.Severity.Low,
						details: "In SmartTable the smartFilterId property is linked to the control '" + oSmartTable.getSmartFilterId() + "' which does not exist",
						context: {
							id: oSmartTable.getId()
						}
					});
					return;
				}
				if (oSmartTable.getEntitySet() !== oSmartFilter.getEntitySet()) {
					oIssueManager.addIssue({
						severity: SupportLib.Severity.Low,
						details: "The entity set '" + oSmartFilter.getEntitySet() + "' of the SmartFilterBar control is not the same as the entity set '" + oSmartTable.getEntitySet() + "' of the SmartTable control",
						context: {
							id: oSmartTable.getId()
						}
					});
				}
			});

		}
	};

	var oSmartFilterBarAndSmartChartRule = {
		id: "equalEntitySetInSmartFilterBarAndSmartChart",
		audiences: [
			SupportLib.Audiences.Application
		],
		categories: [
			SupportLib.Categories.Consistency
		],
		minversion: "1.56",
		async: false,
		title: "SmartFilterBar: Entity set used in SmartChart and SmartFilterBar",
		description: "Entity set of SmartChart has to be the same as the entity set of SmartFilterBar, which is associated via the property smartFilterId",
		resolution: "Make sure that the entity sets used in SmartChart and SmartFilterBar are the same",
		resolutionurls: [
			{
				text: "API Reference: SmartChart",
				href: "https://ui5.sap.com/#/api/sap.ui.comp.smartchart.SmartChart/controlProperties"
			},
			{
				text: "API Reference: SmartFilterBar",
				href: "https://ui5.sap.com/#/api/sap.ui.comp.smartfilterbar.SmartFilterBar/controlProperties"
			}
		],
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.comp.smartchart.SmartChart").filter(function(oSmartChart) {
				return !!oSmartChart.getSmartFilterId();
			}).forEach(function(oSmartChart) {
				var oView = fnGetView(oSmartChart);
				if (!oView) {
					return;
				}
				var oSmartFilter = oView.byId(oSmartChart.getSmartFilterId());
				if (!oSmartFilter) {
					oIssueManager.addIssue({
						severity: SupportLib.Severity.Low,
						details: "In SmartChart the smartFilterId property is linked to the control '" + oSmartChart.getSmartFilterId() + "' which does not exist",
						context: {
							id: oSmartChart.getId()
						}
					});
					return;
				}
				if (oSmartChart.getEntitySet() !== oSmartFilter.getEntitySet()) {
					oIssueManager.addIssue({
						severity: SupportLib.Severity.Low,
						details: "The entity set '" + oSmartFilter.getEntitySet() + "' of the SmartFilterBar control is not same as the entity set '" + oSmartChart.getEntitySet() + "' of the SmartChart control",
						context: {
							id: oSmartChart.getId()
						}
					});
				}
			});

		}
	};

	return [
		oSmartFilterBarAndSmartTableRule, oSmartFilterBarAndSmartChartRule
	];

}, true);
