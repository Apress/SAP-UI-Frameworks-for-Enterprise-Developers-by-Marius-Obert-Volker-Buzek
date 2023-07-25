import Log from "sap/base/Log";
import each from "sap/base/util/each";
import BaseObject from "sap/ui/base/Object";
import NavError from "./NavError";

/**
 * Object containing semanticDates filter information.
 */
export type SemanticDateConfiguration = {
	/**
	 * Semantic Date Operator
	 */
	high: string | number | null;

	/**
	 * the upper boundary of the interval for range operators
	 */
	low: string | number | null;

	/**
	 * The single value or the lower boundary of the interval for range Operators
	 */
	operator: string;
};

/**
 * Structure of a plain select option object.
 */
export interface SelectOption {
	Sign: string;
	Option: string;
	Low: string;
	High?: string | null;
	Text?: string;
	SemanticDates?: SemanticDateConfiguration;
}

/**
 * Structure of a JSON serialized SelectionOption
 */
export interface SerializedSelectOption {
	PropertyName: string;
	Ranges?: SelectOption[];
}

export interface SerializedParameter {
	PropertyName: string;
	PropertyValue: string;
}

/**
 * Structure of a JSON serialized SelectionVariant
 */
export interface SerializedSelectionVariant {
	Version?: {
		Major: string;
		Minor: string;
		Patch: string;
	};
	SelectionVariantID?: string;
	ParameterContextUrl?: string;
	FilterContextUrl?: string;
	Text?: string;
	Parameters?: SerializedParameter[];
	SelectOptions?: SerializedSelectOption[];
}

const VALIDATE_SIGN = new RegExp("[E|I]");
const VALIDATE_OPTION = new RegExp("EQ|NE|LE|GE|LT|GT|BT|CP");

/**
 * @public
 * @name sap.fe.navigation.SelectionVariant
 * @class
 * This is the successor of {@link sap.ui.generic.app.navigation.service.SelectionVariant}.<br>
 * Creates a new instance of a SelectionVariant class. If no parameter is passed,
 * an new empty instance is created whose ID has been set to <code>""</code>.
 * Passing a JSON-serialized string complying to the Selection Variant Specification will parse it,
 * and the newly created instance will contain the same information.
 * @extends sap.ui.base.Object
 * @since 1.83.0
 * @param {string|object} [vSelectionVariant] If of type <code>string</code>, the selection variant is JSON-formatted;
 * if of type <code>object</code>, the object represents a selection variant
 * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
 * <table>
 * <tr><th>NavError code</th><th>Description</th></tr>
 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that the data format of the selection variant provided is inconsistent</td></tr>
 * <tr><td>SelectionVariant.UNABLE_TO_PARSE_INPUT</td><td>Indicates that the provided string is not a JSON-formatted string</td></tr>
 * <tr><td>SelectionVariant.INPUT_DOES_NOT_CONTAIN_SELECTIONVARIANT_ID</td><td>Indicates that the SelectionVariantID cannot be retrieved</td></tr>
 * <tr><td>SelectionVariant.PARAMETER_WITHOUT_VALUE</td><td>Indicates that there was an attempt to specify a parameter, but without providing any value (not even an empty value)</td></tr>
 * <tr><td>SelectionVariant.SELECT_OPTION_WITHOUT_PROPERTY_NAME</td><td>Indicates that a selection option has been defined, but the Ranges definition is missing</td></tr>
 * <tr><td>SelectionVariant.SELECT_OPTION_RANGES_NOT_ARRAY</td><td>Indicates that the Ranges definition is not an array</td></tr>
 * </table>
 * These exceptions can only be thrown if the parameter <code>vSelectionVariant</code> has been provided.
 */
export class SelectionVariant extends BaseObject {
	private id: string = "";

	private parameters: Record<string, string> = {};

	private selectOptions: Record<string, any> = {};

	private text?: string;

	private parameterCtxUrl?: string;

	private filterCtxUrl?: string;

	/**
	 * Creates an instance of a selection variant based on the optional serialized input.
	 *
	 * @param selectionVariant Serialized selection variant as string or object.
	 */
	constructor(selectionVariant?: string | SerializedSelectionVariant) {
		super();

		if (selectionVariant !== undefined) {
			if (typeof selectionVariant === "string") {
				this.parseFromString(selectionVariant);
			} else if (typeof selectionVariant === "object") {
				this.parseFromObject(selectionVariant);
			} else {
				throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
			}
		}
	}

	/**
	 * Returns the identification of the selection variant.
	 *
	 * @public
	 * @function getID
	 * @memberof sap.fe.navigation.SelectionVariant.prototype
	 * @returns {string} The identification of the selection variant as made available during construction
	 */
	public getID() {
		return this.id;
	}

	/**
	 * Sets the identification of the selection variant.
	 *
	 * @param id The new identification of the selection variant
	 * @public
	 */
	setID(id: string) {
		this.id = id;
	}

	/**
	 * Sets the text / description of the selection variant.
	 *
	 * @param newText The new description to be used
	 * @public
	 * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
	 * <table>
	 * <tr><th>NavError code</th><th>Description</th></tr>
	 * <tr><td>PresentationVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
	 * </table>
	 */
	setText(newText?: string) {
		if (typeof newText !== "string") {
			throw new NavError("PresentationVariant.INVALID_INPUT_TYPE");
		}
		this.text = newText;
	}

	/**
	 * Returns the current text / description of this selection variant.
	 *
	 * @returns The current description of this selection variant.
	 * @public
	 */
	getText() {
		return this.text;
	}

	/**
	 * Sets the context URL intended for the parameters.
	 *
	 * @param sURL The URL of the parameter context
	 * @public
	 * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
	 * <table>
	 * <tr><th>NavError code</th><th>Description</th></tr>
	 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
	 * </table>
	 */
	setParameterContextUrl(sURL: string) {
		if (typeof sURL !== "string") {
			throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
		}
		this.parameterCtxUrl = sURL;
	}

	/**
	 * Gets the current context URL intended for the parameters.
	 *
	 * @returns The current context URL for the parameters
	 * @public
	 */
	getParameterContextUrl() {
		return this.parameterCtxUrl;
	}

	/**
	 * Gets the current context URL intended for the filters.
	 *
	 * @returns The current context URL for the filters
	 * @public
	 */
	getFilterContextUrl() {
		return this.filterCtxUrl;
	}

	/**
	 * Sets the context URL intended for the filters.
	 *
	 * @param sURL The URL of the filters
	 * @public
	 * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
	 * <table>
	 * <tr><th>NavError code</th><th>Description</th></tr>
	 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
	 * </table>
	 */
	setFilterContextUrl(sURL: string) {
		if (typeof sURL !== "string") {
			throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
		}
		this.filterCtxUrl = sURL;
	}

	/**
	 * Sets the value of a parameter called <code>sName</code> to the new value <code>sValue</code>.
	 * If the parameter has already been set before, its value is overwritten.
	 *
	 * @param sName The name of the parameter to be set; the <code>null</code> value is not allowed
	 * @param sValue The value of the parameter to be set
	 * @returns This instance to allow method chaining
	 * @public
	 * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
	 * <table>
	 * <tr><th>NavError code</th><th>Description</th></tr>
	 * <tr><td>SelectionVariant.PARAMETER_WITHOUT_NAME</td><td>Indicates that the name of the parameter has not been specified</td></tr>
	 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type or the value is set to <code>null</code></td></tr>
	 * <tr><td>SelectionVariant.PARAMETER_SELOPT_COLLISION</td><td>Indicates that another SelectOption with the same name as the parameter already exists</td></tr>
	 * </table>
	 */
	addParameter(sName: string, sValue: string) {
		/*
		 *  {string} sName The name of the parameter to be set; the <code>null</code> value is not allowed
		 * (see specification "Selection Variants for UI Navigation in Fiori", section 2.4.2.1)
		 */
		if (typeof sName !== "string") {
			throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
		}
		if (typeof sValue !== "string") {
			throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
		}
		if (sName === "") {
			throw new NavError("SelectionVariant.PARAMETER_WITHOUT_NAME");
		}

		if (this.selectOptions[sName]) {
			throw new NavError("SelectionVariant.PARAMETER_SELOPT_COLLISION");
		}

		this.parameters[sName] = sValue;

		return this;
	}

	/**
	 * Removes a parameter called <code>sName</code> from the selection variant.
	 *
	 * @param sName The name of the parameter to be removed
	 * @returns This instance to allow method chaining
	 * @public
	 * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
	 * <table>
	 * <tr><th>NavError code</th><th>Description</th></tr>
	 * <tr><td>SelectionVariant.PARAMETER_WITHOUT_NAME</td><td>Indicates that name of the parameter has not been specified</td></tr>
	 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
	 * </table>
	 */
	removeParameter(sName: string) {
		if (typeof sName !== "string") {
			throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
		}
		if (sName === "") {
			throw new NavError("SelectionVariant.PARAMETER_WITHOUT_NAME");
		}

		delete this.parameters[sName];

		return this;
	}

	/**
	 * Renames a parameter called <code>sNameOld</code> to <code>sNameNew</code>. If a parameter or a select option with
	 * the name <code>sNameNew</code> already exist, an error is thrown. If a parameter with the name <code>sNameOld</code>
	 * does not exist, nothing is changed.
	 *
	 * @param sNameOld The current name of the parameter to be renamed
	 * @param sNameNew The new name of the parameter
	 * @returns This instance to allow method chaining
	 * @public
	 * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
	 * <table>
	 * <tr><th>NavError code</th><th>Description</th></tr>
	 * <tr><td>SelectionVariant.PARAMETER_WITHOUT_NAME</td><td>Indicates that the name of a parameter has not been specified</td></tr>
	 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
	 * <tr><td>SelectionVariant.PARAMETER_SELOPT_COLLISION</td><td>Indicates that another select option with the same new name already exists</td></tr>
	 * <tr><td>SelectionVariant.PARAMETER_COLLISION</td><td>Indicates that another parameter with the same new name already exists</td></tr>
	 * </table>
	 */
	renameParameter(sNameOld: string, sNameNew: string) {
		if (typeof sNameOld !== "string" || typeof sNameNew !== "string") {
			throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
		}
		if (sNameOld === "" || sNameNew === "") {
			throw new NavError("SelectionVariant.PARAMETER_WITHOUT_NAME");
		}
		if (this.parameters[sNameOld] !== undefined) {
			if (this.selectOptions[sNameNew]) {
				throw new NavError("SelectionVariant.PARAMETER_SELOPT_COLLISION");
			}
			if (this.parameters[sNameNew]) {
				throw new NavError("SelectionVariant.PARAMETER_COLLISION");
			}
			this.parameters[sNameNew] = this.parameters[sNameOld];
			delete this.parameters[sNameOld];
		}
		return this;
	}

	/**
	 * Returns the value of the parameter called <code>sName</code> if it has been set.
	 * If the parameter has never been set or has been removed, <code>undefined</code> is returned.
	 *
	 * @param sName The name of the parameter to be returned
	 * @returns The value of parameter <code>sName</code>; returning the value <code>null</code> not possible
	 * @public
	 * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
	 * <table>
	 * <tr><th>NavError code</th><th>Description</th></tr>
	 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
	 * </table>
	 */
	getParameter(sName: string) {
		if (typeof sName !== "string") {
			throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
		}
		return this.parameters[sName];
	}

	/**
	 * Returns the set of parameter names available in this selection variant.
	 *
	 * @returns The list of parameter names which are valid
	 * @public
	 */
	getParameterNames(): string[] {
		return Object.keys(this.parameters);
	}

	/**
	 * Adds a new range to the list of select options for a given parameter.
	 *
	 * @param sPropertyName The name of the property for which the selection range is added
	 * @param sSign The sign of the range (<b>I</b>nclude or <b>E</b>xclude)
	 * @param sOption The option of the range (<b>EQ</b> for "equals", <b>NE</b> for "not equals",
	 * <b>LE</b> for "less or equals", <b>GE</b> for "greater or equals", <b>LT</b> for "less than" (and not equals),
	 * <b>GT</b> for "greater than" (and not equals), <b>BT</b> for "between", or <b>CP</b> for "contains pattern"
	 * (ABAP-styled pattern matching with the asterisk as wildcard)
	 * @param sLow The single value or the lower boundary of the interval; the <code>null</code> value is not allowed
	 * @param sHigh Set only if sOption is <b>BT</b>: the upper boundary of the interval;
	 * @param sText Text representing the SelectOption. This is an optional parameter. For an example in most Fiori applications if the text is not provided, it is fetched based on the ID.
	 * must be <code>undefined</code> or <code>null</code> in all other cases
	 * @param semanticDates Object containing semanticDates filter information
	 * @returns This instance to allow method chaining.
	 * @public
	 * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
	 * <table>
	 * <tr><th>NavError code</th><th>Description</th></tr>
	 * <tr><td>SelectionVariant.INVALID_SIGN</td><td>Indicates that the 'sign' is an invalid expression</td></tr>
	 * <tr><td>SelectionVariant.INVALID_OPTION</td><td>Indicates that the option is an invalid expression</td></tr>
	 * <tr><td>SelectionVariant.HIGH_PROVIDED_THOUGH_NOT_ALLOWED</td><td>Indicates that the upper boundary has been specified, even though the option is not 'BT'</td></tr>
	 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type or the value is set to <code>null</code></td></tr>
	 * <tr><td>SelectionVariant.INVALID_PROPERTY_NAME</td><td>Indicates that the property name is invalid, for example if it has not been specified</td></tr>
	 * <tr><td>SelectionVariant.PARAMETER_SELOPT_COLLISION</td><td>Indicates that another parameter with the same name as the property name already exists</td></tr>
	 * </table>
	 */
	addSelectOption(
		sPropertyName: string,
		sSign: string,
		sOption: string,
		sLow: string,
		sHigh?: string | null,
		sText?: string,
		semanticDates?: SemanticDateConfiguration
	) {
		/* {string} sLow The single value or the lower boundary of the interval; the <code>null</code> value is not allowed
		 * (see specification "Selection Variants for UI Navigation in Fiori", section 2.4.2.1)
		 */
		if (typeof sPropertyName !== "string") {
			throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
		}
		if (sPropertyName === "") {
			throw new NavError("SelectionVariant.INVALID_PROPERTY_NAME");
		}
		if (typeof sSign !== "string") {
			throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
		}
		if (typeof sOption !== "string") {
			throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
		}
		if (typeof sLow !== "string") {
			throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
		}
		if (sOption === "BT" && typeof sHigh !== "string") {
			throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
		}
		if (!VALIDATE_SIGN.test(sSign.toUpperCase())) {
			throw new NavError("SelectionVariant.INVALID_SIGN");
		}

		if (!VALIDATE_OPTION.test(sOption.toUpperCase())) {
			throw new NavError("SelectionVariant.INVALID_OPTION");
		}

		if (this.parameters[sPropertyName]) {
			throw new NavError("SelectionVariant.PARAMETER_SELOPT_COLLISION");
		}

		if (sOption !== "BT") {
			// only "Between" has two parameters; for all others, sHigh may not be filled
			if (sHigh !== undefined && sHigh !== "" && sHigh !== null) {
				throw new NavError("SelectionVariant.HIGH_PROVIDED_THOUGH_NOT_ALLOWED");
			}
		}

		// check, if there's already an entry for this property
		if (this.selectOptions[sPropertyName] === undefined) {
			// if not, create a new set of entries
			this.selectOptions[sPropertyName] = [];
		}

		const oEntry: SelectOption = {
			Sign: sSign.toUpperCase(),
			Option: sOption.toUpperCase(),
			Low: sLow
		};

		if (sText) {
			// Add Text property only in case it is passed by the consumer of the API.
			// Otherwise keep the structure as is.
			oEntry.Text = sText;
		}

		if (sOption === "BT") {
			oEntry.High = sHigh;
		} else {
			oEntry.High = null; // Note this special case in the specification!
			// The specification requires that the "High" attribute is always
			// available. In case that no high value is necessary, yet the value
			// may not be empty, but needs to be set to "null"
		}

		if (semanticDates) {
			// Add SemanticDate property only in case it is passed, Otherwise keep the structure as is.
			oEntry.SemanticDates = semanticDates;
		}

		//check if it is necessary to add select option
		for (let i = 0; i < this.selectOptions[sPropertyName].length; i++) {
			const oExistingEntry = this.selectOptions[sPropertyName][i];
			if (
				oExistingEntry.Sign === oEntry.Sign &&
				oExistingEntry.Option === oEntry.Option &&
				oExistingEntry.Low === oEntry.Low &&
				oExistingEntry.High === oEntry.High
			) {
				return this;
			}
		}
		this.selectOptions[sPropertyName].push(oEntry);

		return this;
	}

	/**
	 * Removes a select option called <code>sName</code> from the selection variant.
	 *
	 * @param sName The name of the select option to be removed
	 * @returns This instance to allow method chaining.
	 * @public
	 * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
	 * <table>
	 * <tr><th>NavError code</th><th>Description</th></tr>
	 * <tr><td>SelectionVariant.SELOPT_WITHOUT_NAME</td><td>Indicates that name of the select option has not been specified</td></tr>
	 * <tr><td>SelectionVariant.SELOPT_WRONG_TYPE</td><td>Indicates that the name of the parameter <code>sName</code> has an invalid type</td></tr>
	 * </table>
	 */
	removeSelectOption(sName: string) {
		if (typeof sName !== "string") {
			throw new NavError("SelectionVariant.SELOPT_WRONG_TYPE");
		}

		if (sName === "") {
			throw new NavError("SelectionVariant.SELOPT_WITHOUT_NAME");
		}

		delete this.selectOptions[sName];

		return this;
	}

	/**
	 * Renames a select option called <code>sNameOld</code> to <code>sNameNew</code>. If a select option or a parameter
	 * with the name <code>sNameNew</code> already exist, an error is thrown. If a select option with the name <code>sNameOld</code>
	 * does not exist, nothing is changed.
	 *
	 * @param sNameOld The current name of the select option property to be renamed
	 * @param sNameNew The new name of the select option property
	 * @returns This instance to allow method chaining
	 * @public
	 * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
	 * <table>
	 * <tr><th>NavError code</th><th>Description</th></tr>
	 * <tr><td>SelectionVariant.SELOPT_WITHOUT_NAME</td><td>Indicates that the name of a select option has not been specified</td></tr>
	 * <tr><td>SelectionVariant.SELOPT_WRONG_TYPE</td><td>Indicates that a select option has an invalid type</td></tr>
	 * <tr><td>SelectionVariant.PARAMETER_SELOPT_COLLISION</td><td>Indicates that another parameter with the same new name already exists</td></tr>
	 * <tr><td>SelectionVariant.SELOPT_COLLISION</td><td>Indicates that another select option with the same new name already exists</td></tr>
	 * </table>
	 */
	renameSelectOption(sNameOld: string, sNameNew: string) {
		if (typeof sNameOld !== "string" || typeof sNameNew !== "string") {
			throw new NavError("SelectionVariant.SELOPT_WRONG_TYPE");
		}
		if (sNameOld === "" || sNameNew === "") {
			throw new NavError("SelectionVariant.SELOPT_WITHOUT_NAME");
		}
		if (this.selectOptions[sNameOld] !== undefined) {
			if (this.selectOptions[sNameNew]) {
				throw new NavError("SelectionVariant.SELOPT_COLLISION");
			}
			if (this.parameters[sNameNew]) {
				throw new NavError("SelectionVariant.PARAMETER_SELOPT_COLLISION");
			}
			this.selectOptions[sNameNew] = this.selectOptions[sNameOld];
			delete this.selectOptions[sNameOld];
		}
		return this;
	}

	/**
	 * Returns the set of select options/ranges available for a given property name.
	 *
	 * @param sPropertyName The name of the property for which the set of select options/ranges is returned
	 * @returns If <code>sPropertyName</code> is an invalid name of a property or no range exists, <code>undefined</code>
	 * is returned; otherwise, an immutable array of ranges is returned. Each entry of the array is an object with the
	 * following properties:
	 * <ul>
	 * <li><code>Sign</code>: The sign of the range</li>
	 * <li><code>Option</code>: The option of the range</li>
	 * <li><code>Low</code>: The low value of the range; returning value <code>null</code> is not possible</li>
	 * <li><code>High</code>: The high value of the range; if this value is not necessary, <code>null</code> is used</li>
	 * </ul>
	 * For further information about the meaning of the attributes, refer to method <code>addSelectOption</code>.
	 * @public
	 * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
	 * <table>
	 * <tr><th>NavError code</th><th>Description</th></tr>
	 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
	 * <tr><td>SelectionVariant.INVALID_PROPERTY_NAME</td><td>Indicates that the property name is invalid, for example, it has not been specified</td></tr>
	 * </table>
	 */
	getSelectOption(sPropertyName: string): SelectOption[] | undefined {
		if (typeof sPropertyName !== "string") {
			throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
		}
		if (sPropertyName === "") {
			throw new NavError("SelectionVariant.INVALID_PROPERTY_NAME");
		}

		const oEntries = this.selectOptions[sPropertyName];
		if (!oEntries) {
			return undefined;
		}

		return JSON.parse(JSON.stringify(oEntries)); // create an immutable clone of data to prevent obfuscation by caller.
	}

	/**
	 * Returns the names of the properties available for this instance.
	 *
	 * @returns The list of property names available for this instance
	 * @public
	 */
	getSelectOptionsPropertyNames() {
		return Object.keys(this.selectOptions);
	}

	/**
	 * Returns the names of the parameter and select option properties available for this instance.
	 *
	 * @returns The list of parameter and select option property names available for this instance
	 * @public
	 */
	getPropertyNames() {
		return this.getParameterNames().concat(this.getSelectOptionsPropertyNames());
	}

	/**
	 * Adds a set of select options to the list of select options for a given parameter.
	 *
	 * @param sPropertyName The name of the property for which the set of select options is added
	 * @param aSelectOptions Set of select options to be added
	 * @returns This instance to allow method chaining
	 * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
	 * <table>
	 * <tr><th>NavError code</th><th>Description</th></tr>
	 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
	 * </table>
	 * @public
	 */
	massAddSelectOption(sPropertyName: string, aSelectOptions: SelectOption[]) {
		if (!Array.isArray(aSelectOptions)) {
			throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
		}

		for (let i = 0; i < aSelectOptions.length; i++) {
			const oSelectOption = aSelectOptions[i];
			this.addSelectOption(
				sPropertyName,
				oSelectOption.Sign,
				oSelectOption.Option,
				oSelectOption.Low,
				oSelectOption.High,
				oSelectOption.Text,
				oSelectOption.SemanticDates
			);
		}

		return this;
	}

	/**
	 * First tries to retrieve the set of select options or ranges available for <code>sName</code> as the property name. If successful,
	 * this array of selections is returned. If it fails, an attempt to find a parameter with the name <code>sName</code> is used. If the latter succeeds, the single value is converted to fit into an array of selections to make it
	 * type compatible with ranges. This array is then returned. <br />
	 * If neither a select option nor a parameter could be found, <code>undefined</code> is returned.
	 *
	 * @param sName The name of the attribute for which the value is retrieved
	 * @returns The ranges in the select options for the specified property or a range-converted representation of a parameter is returned.
	 * If both lookups fail, <code>undefined</code> is returned. <br />
	 * The returned ranges have the format:
	 * <ul>
	 * <li><code>Sign</code>: The sign of the range</li>
	 * <li><code>Option</code>: The option of the range</li>
	 * <li><code>Low</code>: The low value of the range; returning the value <code>null</code> is not possible</li>
	 * <li><code>High</code>: The high value of the range; if this value is not necessary, <code>null</code> (but does exist)</li>
	 * </ul>
	 * For further information on the meaning of the attributes, refer to method {@link #.addSelectOption addSelectOption}.
	 * @public
	 * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
	 * <table>
	 * <tr><th>NavError code</th><th>Description</th></tr>
	 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
	 * <tr><td>SelectionVariant.INVALID_PROPERTY_NAME</td><td>Indicates that the property name is invalid, for example, it has not been specified</td></tr>
	 * </table>
	 */
	getValue(sName: string) {
		let aValue = this.getSelectOption(sName);
		if (aValue !== undefined) {
			// a range for the selection option is provided; so this is the leading one
			return aValue;
		}

		const sParamValue = this.getParameter(sName);
		if (sParamValue !== undefined) {
			// a parameter value has been provided; we need to convert it to the range format
			aValue = [
				{
					Sign: "I",
					Option: "EQ",
					Low: sParamValue,
					High: null
				}
			];
			return aValue;
		}

		return undefined;
	}

	/**
	 * Returns <code>true</code> if the selection variant does neither contain parameters
	 * nor ranges.
	 *
	 * @returns If set to <code>true</code>  there are no parameters and no select options available in
	 * the selection variant; <code>false</code> otherwise.
	 * @public
	 */
	isEmpty() {
		return this.getParameterNames().length === 0 && this.getSelectOptionsPropertyNames().length === 0;
	}

	/**
	 * Returns the external representation of the selection variant as JSON object.
	 *
	 * @returns The external representation of this instance as a JSON object
	 * @public
	 */
	toJSONObject() {
		const oExternalSelectionVariant: SerializedSelectionVariant = {
			Version: {
				// Version attributes are not part of the official specification,
				Major: "1", // but could be helpful later for implementing a proper lifecycle/interoperability
				Minor: "0",
				Patch: "0"
			},
			SelectionVariantID: this.id
		};

		if (this.parameterCtxUrl) {
			oExternalSelectionVariant.ParameterContextUrl = this.parameterCtxUrl;
		}

		if (this.filterCtxUrl) {
			oExternalSelectionVariant.FilterContextUrl = this.filterCtxUrl;
		}

		if (this.text) {
			oExternalSelectionVariant.Text = this.text;
		} else {
			oExternalSelectionVariant.Text = "Selection Variant with ID " + this.id;
		}

		this.determineODataFilterExpression(oExternalSelectionVariant);

		this.serializeParameters(oExternalSelectionVariant);
		this.serializeSelectOptions(oExternalSelectionVariant);

		return oExternalSelectionVariant;
	}

	/**
	 * Serializes this instance into a JSON-formatted string.
	 *
	 * @returns The JSON-formatted representation of this instance in stringified format
	 * @public
	 */
	toJSONString() {
		return JSON.stringify(this.toJSONObject());
	}

	private determineODataFilterExpression(oExternalSelectionVariant: any) {
		// TODO - specification does not indicate what is expected here in detail
		oExternalSelectionVariant.ODataFilterExpression = ""; // not supported yet - it's allowed to be optional
	}

	private serializeParameters(oExternalSelectionVariant: SerializedSelectionVariant) {
		// Note: Parameters section is optional (see specification section 2.4.2.1)
		oExternalSelectionVariant.Parameters = [];
		for (const name in this.parameters) {
			oExternalSelectionVariant.Parameters.push({
				PropertyName: name,
				PropertyValue: this.parameters[name]
			});
		}
	}

	private serializeSelectOptions(oExternalSelectionVariant: any) {
		if (this.selectOptions.length === 0) {
			return;
		}

		oExternalSelectionVariant.SelectOptions = [];

		each(this.selectOptions, function (sPropertyName: string, aEntries: unknown[]) {
			const oSelectOption = {
				PropertyName: sPropertyName,
				Ranges: aEntries
			};

			oExternalSelectionVariant.SelectOptions.push(oSelectOption);
		});
	}

	private parseFromString(sJSONString: string) {
		if (sJSONString === undefined) {
			throw new NavError("SelectionVariant.UNABLE_TO_PARSE_INPUT");
		}

		if (typeof sJSONString !== "string") {
			throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
		}

		const oInput = JSON.parse(sJSONString);
		// the input needs to be an JSON string by specification

		this.parseFromObject(oInput);
	}

	private parseFromObject(oInput: SerializedSelectionVariant) {
		if (!oInput) {
			oInput = {};
		}
		if (oInput.SelectionVariantID === undefined) {
			// Do not throw an error, but only write a warning into the log.
			// The SelectionVariantID is mandatory according to the specification document version 1.0,
			// but this document is not a universally valid standard.
			// It is said that the "implementation of the SmartFilterBar" may supersede the specification.
			// Thus, also allow an initial SelectionVariantID.
			//		throw new sap.fe.navigation.NavError("SelectionVariant.INPUT_DOES_NOT_CONTAIN_SELECTIONVARIANT_ID");
			Log.warning("SelectionVariantID is not defined");
			oInput.SelectionVariantID = "";
		}

		this.setID(oInput.SelectionVariantID);

		if (oInput.ParameterContextUrl !== undefined && oInput.ParameterContextUrl !== "") {
			this.setParameterContextUrl(oInput.ParameterContextUrl);
		}

		if (oInput.FilterContextUrl !== undefined && oInput.FilterContextUrl !== "") {
			this.setFilterContextUrl(oInput.FilterContextUrl);
		}

		if (oInput.Text !== undefined) {
			this.setText(oInput.Text);
		}

		// note that ODataFilterExpression is ignored right now - not supported yet!

		if (oInput.Parameters) {
			this.parseFromStringParameters(oInput.Parameters);
		}

		if (oInput.SelectOptions) {
			this.parseFromStringSelectOptions(oInput.SelectOptions);
		}
	}

	private parseFromStringParameters(parameters: SerializedParameter[]) {
		for (const parameter of parameters) {
			this.addParameter(parameter.PropertyName, parameter.PropertyValue);
		}
	}

	private parseFromStringSelectOptions(selectOptions: SerializedSelectOption[]) {
		for (const option of selectOptions) {
			if (option.Ranges) {
				if (!Array.isArray(option.Ranges)) {
					throw new NavError("SelectionVariant.SELECT_OPTION_RANGES_NOT_ARRAY");
				}

				for (const range of option.Ranges) {
					this.addSelectOption(
						option.PropertyName,
						range.Sign,
						range.Option,
						range.Low,
						range.High,
						range.Text,
						range.SemanticDates
					);
				}
			} else {
				Log.warning("Select Option object does not contain a Ranges entry; ignoring entry");
			}
		}
	}
}

// Exporting the class as properly typed UI5Class
const UI5Class = BaseObject.extend("sap.fe.navigation.SelectionVariant", SelectionVariant.prototype as any) as typeof SelectionVariant;
type UI5Class = InstanceType<typeof SelectionVariant>;
export default UI5Class;
