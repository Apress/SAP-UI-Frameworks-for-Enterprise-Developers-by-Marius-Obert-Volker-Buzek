import { defineUI5Class, property, xmlEventHandler } from "sap/fe/core/helpers/ClassSupport";
import MacroAPI from "../MacroAPI";

/**
 * @alias sap.fe.macros.form.FormContainerAPI
 * @private
 */
@defineUI5Class("sap.fe.macros.form.FormContainerAPI")
class FormContainerAPI extends MacroAPI {
	/**
	 * The identifier of the form container control.
	 *
	 * @public
	 */
	@property({ type: "string" })
	formContainerId!: string;

	@property({ type: "boolean" })
	showDetails = false;

	static isDependentBound: boolean = true;

	constructor(props?: any) {
		super(props, true);
		this.setParentBindingContext("internal", `controls/${this.formContainerId}`);
	}

	@xmlEventHandler()
	toggleDetails() {
		this.showDetails = !this.showDetails;
	}
}

export default FormContainerAPI;
