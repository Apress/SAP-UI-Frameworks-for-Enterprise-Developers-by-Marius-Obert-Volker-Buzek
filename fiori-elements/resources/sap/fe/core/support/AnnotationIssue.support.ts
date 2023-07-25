import { IssueCategory } from "sap/fe/core/converters/helpers/IssueManager";
import { Audiences, Categories, getIssueByCategory } from "sap/fe/core/support/CommonHelper";

const oIncorrectPathAnnotationIssue = {
	id: "annotationIssue",
	title: "Annotations: Incorrect path or target",
	minversion: "1.85",
	audiences: [Audiences.Application],
	categories: [Categories.Usage],
	description:
		"This rule identifies the incorrect path or targets defined in the metadata of the annotation.xml file or CDS annotations.",
	resolution: "Please review the message details for more information.",
	resolutionurls: [{ text: "CDS Annotations reference", href: "https://cap.cloud.sap/docs/cds/common" }],
	check: function (oIssueManager: any, oCoreFacade: any /*oScope: any*/) {
		getIssueByCategory(oIssueManager, oCoreFacade, IssueCategory.Annotation);
	}
};

const oIgnoredComputedDVAnnotationIssue = {
	id: "ignoredAnnotationIssue",
	title: "Annotations: Ignore Annotation",
	minversion: "1.99",
	audiences: [Audiences.Application],
	categories: [Categories.Usage],
	description: "This rule identifies the ignored annotations",
	resolution: "Only one annotation from either Core.Computed or ComputedDefaultValue must be used",
	check: function (oIssueManager: any, oCoreFacade: any /*oScope: any*/) {
		getIssueByCategory(oIssueManager, oCoreFacade, IssueCategory.Annotation, "IgnoredAnnotation");
	}
};

export function getRules() {
	return [oIncorrectPathAnnotationIssue, oIgnoredComputedDVAnnotationIssue];
}
