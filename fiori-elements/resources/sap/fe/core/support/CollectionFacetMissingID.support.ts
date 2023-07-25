import { IssueCategory } from "sap/fe/core/converters/helpers/IssueManager";
import { Audiences, Categories, getIssueByCategory } from "sap/fe/core/support/CommonHelper";
const oCollectionFacetMissingIDIssue = {
	id: "collectionFacetMissingId",
	title: "CollectionFacet: Missing IDs",
	minversion: "1.85",
	audiences: [Audiences.Application],
	categories: [Categories.Usage],
	description: "A collection facet requires an ID in the annotation file to derive a control ID from it.",
	resolution: "Always provide a unique ID to a collection facet.",
	resolutionurls: [{ text: "CollectionFacets", href: "https://ui5.sap.com/#/topic/facfea09018d4376acaceddb7e3f03b6" }],
	check: function (oIssueManager: any, oCoreFacade: any /*oScope: any*/) {
		getIssueByCategory(oIssueManager, oCoreFacade, IssueCategory.Facets, "MissingID");
	}
};
export function getRules() {
	return [oCollectionFacetMissingIDIssue];
}
