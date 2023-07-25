/**
 * Defines support rules of the ObjectPageHeader control of sap.uxap library.
 */
import type AppComponent from "sap/fe/core/AppComponent";
import { IssueCategory, IssueSeverity } from "sap/fe/core/converters/helpers/IssueManager";
import type { IssueDefinition } from "sap/fe/core/support/Diagnostics";
import SupportLib from "sap/ui/support/library";

export const Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
	Severity = SupportLib.Severity, // Hint, Warning, Error
	Audiences = SupportLib.Audiences; // Control, Internal, Application

//**********************************************************
// Rule Definitions
//**********************************************************

// Rule checks if objectPage componentContainer height is set

export const getSeverity = function (oSeverity: IssueSeverity) {
	switch (oSeverity) {
		case IssueSeverity.Low:
			return Severity.Low;
		case IssueSeverity.High:
			return Severity.High;
		case IssueSeverity.Medium:
			return Severity.Medium;
		// no default
	}
};

export const getIssueByCategory = function (
	oIssueManager: any,
	oCoreFacade: any /*oScope: any*/,
	issueCategoryType: IssueCategory,
	issueSubCategoryType?: string
) {
	const mComponents = oCoreFacade.getComponents();
	let oAppComponent!: AppComponent;
	Object.keys(mComponents).forEach((sKey) => {
		const oComponent = mComponents[sKey];
		if (oComponent?.getMetadata()?.getParent()?.getName() === "sap.fe.core.AppComponent") {
			oAppComponent = oComponent;
		}
	});
	if (oAppComponent) {
		const aIssues = oAppComponent.getDiagnostics().getIssuesByCategory(IssueCategory[issueCategoryType], issueSubCategoryType);

		aIssues.forEach(function (oElement: IssueDefinition) {
			oIssueManager.addIssue({
				severity: getSeverity(oElement.severity),
				details: oElement.details,
				context: {
					id: oElement.category
				}
			});
		});
	}
};
