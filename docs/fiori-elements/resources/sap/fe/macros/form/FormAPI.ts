import { defineUI5Class, property } from "sap/fe/core/helpers/ClassSupport";
import MacroAPI from "../MacroAPI";

@defineUI5Class("sap.fe.macros.form.FormAPI")
class FormAPI extends MacroAPI {
	/**
	 * The identifier of the form control.
	 *
	 * @public
	 */
	@property({ type: "string" })
	id!: string;

	/**
	 * Defines the relative path of the property in the metamodel, based on the current contextPath.
	 *
	 * @public
	 */
	@property({
		type: "string",
		expectedAnnotations: [
			"@com.sap.vocabularies.UI.v1.FieldGroup",
			"@com.sap.vocabularies.UI.v1.CollectionFacet",
			"@com.sap.vocabularies.UI.v1.ReferenceFacet"
		],
		expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty"]
	})
	metaPath!: string;

	/**
	 * The title of the form control.
	 *
	 * @public
	 */
	@property({ type: "string" })
	title!: string;
}

export default FormAPI;
