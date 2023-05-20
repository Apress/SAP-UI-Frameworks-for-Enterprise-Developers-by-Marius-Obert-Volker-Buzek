import type { PathInModelExpression } from "sap/fe/core/helpers/BindingToolkit";
import { TitleLevel } from "sap/ui/core/library";

/**
 * Internally uses structure of a semantic key object
 */
interface SemanticKey {
	$PropertyPath?: string;
}

/**
 * Input parameter type for isReferenceFacetPartOfPreview
 */
interface ReferenceFacet {
	$Type?: string;
	"@com.sap.vocabularies.UI.v1.PartOfPreview"?: boolean | unknown;
}

/**
 * Helper class used by MDC controls for OData(V4) specific handling
 *
 * @private
 * @experimental This module is only for internal/experimental use!
 */
const FormHelper = {
	/**
	 * Method that checks, if a reference facet needs to be assigned to either "blocks" or "moreBlocks" (tagged by subsection property "partOfPreview!).
	 *
	 * @param referenceFacet Reference facet that needs to be assigned
	 * @param partOfPreview Subsection property "partOfPreview" that needs to aligned with the reference facet's annotation "PartOfPreview!
	 * @param partOfPreview.toString
	 * @returns True, if the ReferenceFacet has the same annotation as the subsection's property "partOfPreview"
	 */
	isReferenceFacetPartOfPreview: function (referenceFacet: ReferenceFacet, partOfPreview: { toString(): string }): boolean {
		partOfPreview = partOfPreview.toString();
		if (referenceFacet.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet") {
			const annotatedTerm = referenceFacet["@com.sap.vocabularies.UI.v1.PartOfPreview"];
			return (partOfPreview === "true" && annotatedTerm !== false) || (partOfPreview === "false" && annotatedTerm === false);
		}
		return false;
	},

	/**
	 * Creates and returns a select query with the selected fields from the parameters passed.
	 *
	 * @param semanticKeys SemanticKeys included in the entity set
	 * @returns The fields to be included in the select query
	 */
	create$Select: function (semanticKeys: SemanticKey[]) {
		return (semanticKeys || []).map((key) => key.$PropertyPath).join(",");
	},

	/**
	 * Generates the binding expression for the form.
	 *
	 * @param navigationPath The navigation path defined for the entity
	 * @param semanticKeys SemanticKeys included in the entity set
	 * @returns The Binding expression including path and $select query as parameter depending on the function parameters
	 */
	generateBindingExpression: function (navigationPath?: string, semanticKeys?: SemanticKey[]) {
		if (!navigationPath && !semanticKeys) {
			return "";
		}
		const binding: Partial<PathInModelExpression<undefined>> = {
			path: navigationPath || ""
		};
		if (semanticKeys) {
			binding.parameters = { $select: FormHelper.create$Select(semanticKeys) };
		}
		return JSON.stringify(binding);
	},

	/**
	 * Calculates the title level for the containers in this form.
	 *
	 * If there is no form title, the form containers get the same header level as the form, otherwise the levels are incremented to reflect the deeper nesting.
	 *
	 * @param [title] The title of the form
	 * @param [titleLevel] The title level of the form
	 * @returns The title level of the form containers
	 */
	getFormContainerTitleLevel: function (title?: string, titleLevel?: TitleLevel): TitleLevel | undefined {
		if (!title) {
			return titleLevel;
		}
		switch (titleLevel) {
			case TitleLevel.H1:
				return TitleLevel.H2;
			case TitleLevel.H2:
				return TitleLevel.H3;
			case TitleLevel.H3:
				return TitleLevel.H4;
			case TitleLevel.H4:
				return TitleLevel.H5;
			case TitleLevel.H5:
			case TitleLevel.H6:
				return TitleLevel.H6;
			default:
				return TitleLevel.Auto;
		}
	}
};

export default FormHelper;
