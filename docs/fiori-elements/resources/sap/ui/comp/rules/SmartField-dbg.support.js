/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
/**
 * Defines support rules of the SmartField control of sap.ui.layout library.
 */
sap.ui.define(["sap/ui/core/LabelEnablement", "sap/ui/support/library"],
	function(LabelEnablement, SupportLib) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories; // Accessibility, Performance, Memory, ...
	var Severity = SupportLib.Severity; // Hint, Warning, Error
	var Audiences = SupportLib.Audiences; // Control, Internal, Application

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	/* eslint-disable no-lonely-if */

	var oSmartFieldLabelRule = {
		id: "smartFieldLabel",
		audiences: [Audiences.Application],
		categories: [Categories.Usability],
		enabled: true,
		minversion: "1.48",
		title: "SmartField: Use of SmartLabel",
		description: "SmartField must be labelled by the SmartLabel control, not by the sap.m.Label control",
		resolution: "Use a SmartLabel control to label the SmartField control",
		resolutionurls: [{
				text: "API Reference: SmartField",
				href:"https://ui5.sap.com/#/api/sap.ui.comp.smartfield.SmartField"
			}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.comp.smartfield.SmartField")
			.forEach(function(oSmartField) {
				var sId = oSmartField.getId();
				var aLabels = LabelEnablement.getReferencingLabels(oSmartField);

				for (var i = 0; i < aLabels.length; i++) {
					var oLabel = sap.ui.getCore().byId(aLabels[i]);
					if (!oLabel.isA("sap.ui.comp.smartfield.SmartLabel")) {
						oIssueManager.addIssue({
							severity: Severity.Medium,
							details: "SmartField " + sId + " labelled by wrong Label.",
							context: {
								id: oLabel.getId()
							}
						});
					}
				}

			});
		}
	};

	var oSmartFieldValueBindingContext = {
		id: "smartFieldValueBindingContext",
		audiences: [Audiences.Application],
		categories: [Categories.Bindings],
		minversion: "1.60",
		async: false,
		title: "SmartField: the value property is bound but there is no binding context available",
		description: "When the value property of the SmartField control is bound but there is no binding context available, the control can't " +
			"resolve its service metadata or property values so the control behaves as if it were used without data binding and " +
			"service metadata. This will result in a control without value.",
		resolution: "Make sure the control has binding context",
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.comp.smartfield.SmartField").filter(function(oSmartField) {
				return oSmartField.isBound("value");
			}).forEach(function(oSmartField) {
				var sId = oSmartField.getId();
				if (!oSmartField.getBindingContext()) {
					oIssueManager.addIssue({
						severity: Severity.High,
						details: "SmartField " + sId + " has its value property bound but its binding context is undefined.",
						context: {id: sId}
					});
				}
			});
		}
	};

	var oSmartFieldVisibleBindingContext = {
		id: "smartFieldVisibleBindingContext",
		audiences: [Audiences.Application],
		categories: [Categories.Bindings],
		minversion: "1.60",
		async: false,
		title: "SmartField: the visible property is bound but there is no binding context available",
		description: "When the visible property of the SmartField control is bound but there is no binding context available, the control can't " +
			"resolve its service metadata or property values so the control behaves as if it were used without data binding and " +
			"service metadata. This will result in a visible control as the default value for the visible property is `true`.",
		resolution: "Make sure the control has a binding context",
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.comp.smartfield.SmartField").filter(function(oSmartField) {
				return oSmartField.isBound("visible");
			}).forEach(function(oSmartField) {
				var sId = oSmartField.getId();
				if (!oSmartField.getBindingContext()) {
					oIssueManager.addIssue({
						severity: Severity.High,
						details: "SmartField " + sId + " has its visible property bound but its binding context is undefined.",
						context: {id: sId}
					});
				}
			});
		}
	};

	var oSmartFieldMandatoryBindingContext = {
		id: "smartFieldMandatoryBindingContext",
		audiences: [Audiences.Application],
		categories: [Categories.Bindings],
		minversion: "1.60",
		async: false,
		title: "SmartField: the mandatory property is bound but there is no binding context available",
		description: "When the mandatory property of the SmartField control is bound but there is no binding context available, the control can't " +
			"resolve its service metadata or property values so the control behaves as if it were used without data binding and " +
			"service metadata. This will result in a control which is not marked as mandatory as the default value for the " +
			"property is `false`.",
		resolution: "Make sure the control has a binding context",
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.comp.smartfield.SmartField").filter(function(oSmartField) {
				return oSmartField.isBound("mandatory");
			}).forEach(function(oSmartField) {
				var sId = oSmartField.getId();
				if (!oSmartField.getBindingContext()) {
					oIssueManager.addIssue({
						severity: Severity.High,
						details: "SmartField " + sId + " has its mandatory property bound but its binding context is undefined.",
						context: {id: sId}
					});
				}
			});
		}
	};

	var oSmartFieldEditableBindingContext = {
		id: "smartFieldEditableBindingContext",
		audiences: [Audiences.Application],
		categories: [Categories.Bindings],
		minversion: "1.60",
		async: false,
		title: "SmartField: the editable property is bound but there is no binding context available",
		description: "When the editable property of the SmartField control is bound but there is no binding context available, the control can't " +
			"resolve its service metadata or property values so the control behaves as if it were used without data binding and " +
			"service metadata. This will result in a control which is editable as the default value for the property is `true`.",
		resolution: "Make sure the control has a binding context",
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.comp.smartfield.SmartField").filter(function(oSmartField) {
				return oSmartField.isBound("editable");
			}).forEach(function(oSmartField) {
				var sId = oSmartField.getId();
				if (!oSmartField.getBindingContext()) {
					oIssueManager.addIssue({
						severity: Severity.High,
						details: "SmartField " + sId + " has its editable property bound but its binding context is undefined.",
						context: {id: sId}
					});
				}
			});
		}
	};

	return [
		oSmartFieldLabelRule,
		oSmartFieldValueBindingContext,
		oSmartFieldVisibleBindingContext,
		oSmartFieldMandatoryBindingContext,
		oSmartFieldEditableBindingContext
	];

}, true);
