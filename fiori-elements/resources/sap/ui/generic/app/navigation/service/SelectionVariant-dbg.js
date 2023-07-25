/*!
 * SAPUI5

(c) Copyright 2009-2020 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/navigation/SelectionVariant", "./NavError"],
	function (FESelectionVariant, NavError) {
		"use strict";

		/**
		 * @class
		 * Creates a new instance of a SelectionVariant class. If no parameter is passed,
		 * an new empty instance is created whose ID has been set to <code>""</code>.
		 * Passing a JSON-serialized string complying to the Selection Variant Specification will parse it,
		 * and the newly created instance will contain the same information.
		 * @extends sap.fe.navigation.SelectionVariant
		 * @constructor
		 * @public
		 * @deprecated Since version 1.83.0. Please use {@link sap.fe.navigation.SelectionVariant} instead.
		 * @alias sap.ui.generic.app.navigation.service.SelectionVariant
		 * @param {string|object} [vSelectionVariant] If of type <code>string</code>, the selection variant is JSON-formatted;
		 * if of type <code>object</code>, the object represents a selection variant
		 * @throws An instance of {@link sap.ui.generic.app.navigation.service.NavError} in case of input errors. Valid error codes are:
		 * <table>
		 * <tr><th>Error code</th><th>Description</th></tr>
		 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that the data format of the selection variant provided is inconsistent</td></tr>
		 * <tr><td>SelectionVariant.UNABLE_TO_PARSE_INPUT</td><td>Indicates that the provided string is not a JSON-formatted string</td></tr>
		 * <tr><td>SelectionVariant.INPUT_DOES_NOT_CONTAIN_SELECTIONVARIANT_ID</td><td>Indicates that the SelectionVariantID cannot be retrieved</td></tr>
		 * <tr><td>SelectionVariant.PARAMETER_WITHOUT_VALUE</td><td>Indicates that there was an attempt to specify a parameter, but without providing any value (not even an empty value)</td></tr>
		 * <tr><td>SelectionVariant.SELECT_OPTION_WITHOUT_PROPERTY_NAME</td><td>Indicates that a selection option has been defined, but the Ranges definition is missing</td></tr>
		 * <tr><td>SelectionVariant.SELECT_OPTION_RANGES_NOT_ARRAY</td><td>Indicates that the Ranges definition is not an array</td></tr>
		 * </table>
		 * These exceptions can only be thrown if the parameter <code>vSelectionVariant</code> has been provided.
		 */
		var SelectionVariant = FESelectionVariant.extend("sap.ui.generic.app.navigation.service.SelectionVariant", /** @lends sap.ui.generic.app.navigation.service.SelectionVariant */ {

			constructor: function (vSelectionVariant) {
				try {
					FESelectionVariant.apply(this, [vSelectionVariant]);
				} catch (oError) {
					if (oError) {
						throw new NavError(oError.getErrorCode());
					}
				}
			},

			/**
			 * Returns the identification of the selection variant.
			 * @returns {string} The identification of the selection variant as made available during construction
			 * @public
			 * @deprecated Since version 1.83.0
			 */
			getID: function () {
				return FESelectionVariant.prototype.getID.apply(this);
			},

			/**
			 * Sets the identification of the selection variant.
			 * @param {string} sId The new identification of the selection variant
			 * @public
			 * @deprecated Since version 1.83.0
			 */
			setID: function (sId) {
				FESelectionVariant.prototype.setID.apply(this, [sId]);
			},

			/**
			 * Sets the text / description of the selection variant.
			 * @param {string} sNewText The new description to be used
			 * @public
			 * @deprecated Since version 1.83.0
			 * @throws An instance of {@link sap.ui.generic.app.navigation.service.NavError} in case of input errors. Valid error codes are:
			 * <table>
			 * <tr><th>Error code</th><th>Description</th></tr>
			 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
			 * </table>
			 */
			setText: function (sNewText) {
				try {
					FESelectionVariant.prototype.setText.apply(this, [sNewText]);
				} catch (oError) {
					if (oError) {
						throw new NavError(oError.getErrorCode());
					}
				}
			},

			/**
			 * Returns the current text / description of this selection variant.
			 * @returns {string} the current description of this selection variant.
			 * @public
			 * @deprecated Since version 1.83.0
			 */
			getText: function () {
				return FESelectionVariant.prototype.getText.apply(this);
			},

			/**
			 * Sets the context URL intended for the parameters.
			 * @param {string} sURL The URL of the parameter context
			 * @public
			 * @deprecated Since version 1.83.0
			 * @throws An instance of {@link sap.ui.generic.app.navigation.service.NavError} in case of input errors. Valid error codes are:
			 * <table>
			 * <tr><th>Error code</th><th>Description</th></tr>
			 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
			 * </table>
			 */
			setParameterContextUrl: function (sURL) {
				try {
					FESelectionVariant.prototype.setParameterContextUrl.apply(this, [sURL]);
				} catch (oError) {
					if (oError) {
						throw new NavError(oError.getErrorCode());
					}
				}
			},

			/**
			 * Gets the current context URL intended for the parameters.
			 * @returns {string} The current context URL for the parameters
			 * @public
			 * @deprecated Since version 1.83.0
			 */
			getParameterContextUrl: function () {
				return FESelectionVariant.prototype.getParameterContextUrl.apply(this);
			},

			/**
			 * Gets the current context URL intended for the filters.
			 * @returns {string} The current context URL for the filters
			 * @public
			 * @deprecated Since version 1.83.0
			 */
			getFilterContextUrl: function () {
				return FESelectionVariant.prototype.getFilterContextUrl.apply(this);
			},

			/**
			 * Sets the context URL intended for the filters.
			 * @param {string} sURL The URL of the filters
			 * @public
			 * @deprecated Since version 1.83.0
			 * @throws An instance of {@link sap.ui.generic.app.navigation.service.NavError} in case of input errors. Valid error codes are:
			 * <table>
			 * <tr><th>Error code</th><th>Description</th></tr>
			 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
			 * </table>
			 */
			setFilterContextUrl: function (sURL) {
				try {
					FESelectionVariant.prototype.setFilterContextUrl.apply(this, [sURL]);
				} catch (oError) {
					if (oError) {
						throw new NavError(oError.getErrorCode());
					}
				}
			},

			/**
			 * Sets the value of a parameter called <code>sName</code> to the new value <code>sValue</code>.
			 * If the parameter has already been set before, its value is overwritten.
			 * @param {string} sName The name of the parameter to be set; the <code>null</code> value is not allowed
			 * @param {string} sValue The value of the parameter to be set
			 * @returns {object} This instance to allow method chaining
			 * @public
			 * @deprecated Since version 1.83.0
			 * @throws An instance of {@link sap.ui.generic.app.navigation.service.NavError} in case of input errors. Valid error codes are:
			 * <table>
			 * <tr><th>Error code</th><th>Description</th></tr>
			 * <tr><td>SelectionVariant.PARAMETER_WITHOUT_NAME</td><td>Indicates that the name of the parameter has not been specified</td></tr>
			 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type or the value is set to <code>null</code></td></tr>
			 * <tr><td>SelectionVariant.PARAMETER_SELOPT_COLLISION</td><td>Indicates that another SelectOption with the same name as the parameter already exists</td></tr>
			 * </table>
			 */
			addParameter: function (sName, sValue) {
				try {
					FESelectionVariant.prototype.addParameter.apply(this, [sName, sValue]);
					return this;
				} catch (oError) {
					if (oError) {
						throw new NavError(oError.getErrorCode());
					}
				}
			},

			/**
			 * Removes a parameter called <code>sName</code> from the selection variant.
			 * @param {string} sName The name of the parameter to be removed
			 * @returns {object} This instance to allow method chaining
			 * @public
			 * @deprecated Since version 1.83.0
			 * @throws An instance of {@link sap.ui.generic.app.navigation.service.NavError} in case of input errors. Valid error codes are:
			 * <table>
			 * <tr><th>Error code</th><th>Description</th></tr>
			 * <tr><td>SelectionVariant.PARAMETER_WITHOUT_NAME</td><td>Indicates that name of the parameter has not been specified</td></tr>
			 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
			 * </table>
			 */
			removeParameter: function (sName) {
				try {
					FESelectionVariant.prototype.removeParameter.apply(this, [sName]);
					return this;
				} catch (oError) {
					if (oError) {
						throw new NavError(oError.getErrorCode());
					}
				}
			},

			/**
			 * Renames a parameter called <code>sNameOld</code> to <code>sNameNew</code>. If a parameter or a select option with
			 * the name <code>sNameNew</code> already exist, an error is thrown. If a parameter with the name <code>sNameOld</code>
			 * does not exist, nothing is changed.
			 * @param {string} sNameOld The current name of the parameter to be renamed
			 * @param {string} sNameNew The new name of the parameter
			 * @returns {object} This instance to allow method chaining
			 * @public
			 * @deprecated Since version 1.83.0
			 * @throws An instance of {@link sap.ui.generic.app.navigation.service.NavError} in case of input errors. Valid error codes are:
			 * <table>
			 * <tr><th>Error code</th><th>Description</th></tr>
			 * <tr><td>SelectionVariant.PARAMETER_WITHOUT_NAME</td><td>Indicates that the name of a parameter has not been specified</td></tr>
			 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
			 * <tr><td>SelectionVariant.PARAMETER_SELOPT_COLLISION</td><td>Indicates that another select option with the same new name already exists</td></tr>
			 * <tr><td>SelectionVariant.PARAMETER_COLLISION</td><td>Indicates that another parameter with the same new name already exists</td></tr>
			 * </table>
			 */
			renameParameter: function (sNameOld, sNameNew) {
				try {
					FESelectionVariant.prototype.renameParameter.apply(this, [sNameOld, sNameNew]);
					return this;
				} catch (oError) {
					if (oError) {
						throw new NavError(oError.getErrorCode());
					}
				}
			},

			/**
			 * Returns the value of the parameter called <code>sName</code> if it has been set.
			 * If the parameter has never been set or has been removed, <code>undefined</code> is returned.
			 * @param {string} sName The name of the parameter to be returned
			 * @returns {string} The value of parameter <code>sName</code>; returning the value <code>null</code> not possible
			 * @public
			 * @deprecated Since version 1.83.0
			 * @throws An instance of {@link sap.ui.generic.app.navigation.service.NavError} in case of input errors. Valid error codes are:
			 * <table>
			 * <tr><th>Error code</th><th>Description</th></tr>
			 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
			 * </table>
			 */
			getParameter: function (sName) {
				try {
					return FESelectionVariant.prototype.getParameter.apply(this, [sName]);
				} catch (oError) {
					if (oError) {
						throw new NavError(oError.getErrorCode());
					}
				}
			},

			/**
			 * Returns the set of parameter names available in this selection variant
			 * @returns {array} the list of parameter names which are valid
			 * @public
			 * @deprecated Since version 1.83.0
			 */
			getParameterNames: function () {
				return FESelectionVariant.prototype.getParameterNames.apply(this);
			},

			/**
			 * Adds a new range to the list of select options for a given parameter.
			 * @param {string} sPropertyName The name of the property for which the selection range is added
			 * @param {string} sSign The sign of the range (<b>I</b>nclude or <b>E</b>xclude)
			 * @param {string} sOption The option of the range (<b>EQ</b> for "equals", <b>NE</b> for "not equals",
			 * <b>LE</b> for "less or equals", <b>GE</b> for "greater or equals", <b>LT</b> for "less than" (and not equals),
			 * <b>GT</b> for "greater than" (and not equals), <b>BT</b> for "between", or <b>CP</b> for "contains pattern"
			 * (ABAP-styled pattern matching with the asterisk as wildcard)
			 * @param {string} sLow The single value or the lower boundary of the interval; the <code>null</code> value is not allowed
			 * @param {string} [sHigh] Set only if sOption is <b>BT</b>: the upper boundary of the interval;
			 * must be <code>undefined</code> or <code>null</code> in all other cases
			 * @return {object} This instance to allow method chaining.
			 * @public
			 * @deprecated Since version 1.83.0
			 * @throws An instance of {@link sap.ui.generic.app.navigation.service.NavError} in case of input errors. Valid error codes are:
			 * <table>
			 * <tr><th>Error code</th><th>Description</th></tr>
			 * <tr><td>SelectionVariant.INVALID_SIGN</td><td>Indicates that the sign is an invalid expression</td></tr>
			 * <tr><td>SelectionVariant.INVALID_OPTION</td><td>Indicates that the option is an invalid expression</td></tr>
			 * <tr><td>SelectionVariant.HIGH_PROVIDED_THOUGH_NOT_ALLOWED</td><td>Indicates that the upper boundary has been specified, even though the option is not 'BT'</td></tr>
			 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type or the value is set to <code>null</code></td></tr>
			 * <tr><td>SelectionVariant.INVALID_PROPERTY_NAME</td><td>Indicates that the property name is invalid, for example, it has not been specified</td></tr>
			 * <tr><td>SelectionVariant.PARAMETER_SELOPT_COLLISION</td><td>Indicates that another parameter with the same name as the property name already exists</td></tr>
			 * </table>
			 */
			addSelectOption: function (sPropertyName, sSign, sOption, sLow, sHigh) {
				try {
					FESelectionVariant.prototype.addSelectOption.apply(this, [sPropertyName, sSign, sOption, sLow, sHigh]);
					return this;
				} catch (oError) {
					if (oError) {
						throw new NavError(oError.getErrorCode());
					}
				}
			},

			/**
			 * Removes a select option called <code>sName</code> from the selection variant.
			 * @param {string} sName The name of the select option to be removed
			 * @returns {object} This instance to allow method chaining.
			 * @public
			 * @deprecated Since version 1.83.0
			 * @throws An instance of {@link sap.ui.generic.app.navigation.service.NavError} in case of input errors. Valid error codes are:
			 * <table>
			 * <tr><th>Error code</th><th>Description</th></tr>
			 * <tr><td>SelectionVariant.SELOPT_WITHOUT_NAME</td><td>Indicates that name of the select option has not been specified</td></tr>
			 * <tr><td>SelectionVariant.SELOPT_WRONG_TYPE</td><td>Indicates that the name of the parameter <code>sName</code> has an invalid type</td></tr>
			 * </table>
			 */
			removeSelectOption: function (sName) {
				try {
					FESelectionVariant.prototype.removeSelectOption.apply(this, [sName]);
					return this;
				} catch (oError) {
					if (oError) {
						throw new NavError(oError.getErrorCode());
					}
				}
			},

			/**
			 * Renames a select option called <code>sNameOld</code> to <code>sNameNew</code>. If a select option or a parameter
			 * with the name <code>sNameNew</code> already exist, an error is thrown. If a select option with the name <code>sNameOld</code>
			 * does not exist, nothing is changed.
			 * @param {string} sNameOld The current name of the select option property to be renamed
			 * @param {string} sNameNew The new name of the select option property
			 * @returns {object} This instance to allow method chaining
			 * @public
			 * @deprecated Since version 1.83.0
			 * @throws An instance of {@link sap.ui.generic.app.navigation.service.NavError} in case of input errors. Valid error codes are:
			 * <table>
			 * <tr><th>Error code</th><th>Description</th></tr>
			 * <tr><td>SelectionVariant.SELOPT_WITHOUT_NAME</td><td>Indicates that the name of a select option has not been specified</td></tr>
			 * <tr><td>SelectionVariant.SELOPT_WRONG_TYPE</td><td>Indicates that a select option has an invalid type</td></tr>
			 * <tr><td>SelectionVariant.PARAMETER_SELOPT_COLLISION</td><td>Indicates that another parameter with the same new name already exists</td></tr>
			 * <tr><td>SelectionVariant.SELOPT_COLLISION</td><td>Indicates that another select option with the same new name already exists</td></tr>
			 * </table>
			 */
			renameSelectOption: function (sNameOld, sNameNew) {
				try {
					FESelectionVariant.prototype.renameSelectOption.apply(this, [sNameOld, sNameNew]);
					return this;
				} catch (oError) {
					if (oError) {
						throw new NavError(oError.getErrorCode());
					}
				}
			},

			/**
			 * Returns the set of select options/ranges available for a given property name.
			 * @param {string} sPropertyName The name of the property for which the set of select options/ranges is returned
			 * @returns {array} If <code>sPropertyName</code> is an invalid name of a property or no range exists, <code>undefined</code>
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
			 * @deprecated Since version 1.83.0
			 * @throws An instance of {@link sap.ui.generic.app.navigation.service.NavError} in case of input errors. Valid error codes are:
			 * <table>
			 * <tr><th>Error code</th><th>Description</th></tr>
			 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
			 * <tr><td>SelectionVariant.INVALID_PROPERTY_NAME</td><td>Indicates that the property name is invalid, for example, it has not been specified</td></tr>
			 * </table>
			 */
			getSelectOption: function (sPropertyName) {
				try {
					return FESelectionVariant.prototype.getSelectOption.apply(this, [sPropertyName]);
				} catch (oError) {
					if (oError) {
						throw new NavError(oError.getErrorCode());
					}
				}
			},

			/**
			 * Returns the names of the properties available for this instance.
			 * @returns {array} The list of property names available for this instance
			 * @public
			 * @deprecated Since version 1.83.0
			 */
			getSelectOptionsPropertyNames: function () {
				return FESelectionVariant.prototype.getSelectOptionsPropertyNames.apply(this);
			},

			/**
			 * Returns the names of the parameter and select option properties available for this instance.
			 * @returns {array} The list of parameter and select option property names available for this instance
			 * @public
			 * @deprecated Since version 1.83.0
			 */
			getPropertyNames: function () {
				return FESelectionVariant.prototype.getPropertyNames.apply(this);
			},

			/**
			 * Adds a set of select options to the list of select options for a given parameter.
			 * @param {string} sPropertyName The name of the property for which the set of select options is added
			 * @param {array} aSelectOptions Set of select options to be added
			 * @return {object} This instance to allow method chaining
			 * @throws An instance of {@link sap.ui.generic.app.navigation.service.NavError} in case of input errors. Valid error codes are:
			 * <table>
			 * <tr><th>Error code</th><th>Description</th></tr>
			 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
			 * </table>
			 * @public
			 * @deprecated Since version 1.83.0
			 */
			massAddSelectOption: function (sPropertyName, aSelectOptions) {
				try {
					FESelectionVariant.prototype.massAddSelectOption.apply(this, [sPropertyName, aSelectOptions]);
					return this;
				} catch (oError) {
					if (oError) {
						throw new NavError(oError.getErrorCode());
					}
				}
			},

			/**
			 * First tries to retrieve the set of select options/ranges available for <code>sName</code> as property name. If successful,
			 * this array of selections is being returned. If it fails, an attempt to find a parameter, whose name is <code>sName</code>, is
			 * made. If the latter succeeds, the single value is converted to fit into an array of selections to make it
			 * type compatible with ranges. This array is then returned. <br />
			 * If neither a select option nor a parameter could be found, <code>undefined</code> is returned.
			 * @param {string} sName The name of the attribute for which the value is retrieved
			 * @returns {array} The ranges in the select options for the specified property or a range-converted representation of a parameter is returned.
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
			 * @deprecated Since version 1.83.0
			 * @throws An instance of {@link sap.ui.generic.app.navigation.service.NavError} in case of input errors. Valid error codes are:
			 * <table>
			 * <tr><th>Error code</th><th>Description</th></tr>
			 * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
			 * <tr><td>SelectionVariant.INVALID_PROPERTY_NAME</td><td>Indicates that the property name is invalid, for example, it has not been specified</td></tr>
			 * </table>
			 */
			getValue: function (sName) {
				try {
					return FESelectionVariant.prototype.getValue.apply(this, [sName]);
				} catch (oError) {
					if (oError) {
						throw new NavError(oError.getErrorCode());
					}
				}
			},


			/**
			 * Returns <code>true</code> if the selection variant does neither contain parameters
			 * nor ranges.
			 * @return {boolean} If set to <code>true</code>  there are no parameters and no select options available in
			 * the selection variant; <code>false</code> otherwise.
			 * @public
			 * @deprecated Since version 1.83.0
			 */
			isEmpty: function () {
				return FESelectionVariant.prototype.isEmpty.apply(this);
			},

			/**
			 * Returns the external representation of the selection variant as JSON object.
			 * @return {object} The external representation of this instance as a JSON object
			 * @public
			 * @deprecated Since version 1.83.0
			 */
			toJSONObject: function () {
				return FESelectionVariant.prototype.toJSONObject.apply(this);
			},

			/**
			 * Serializes this instance into a JSON-formatted string
			 * @return {string} The JSON-formatted representation of this instance in stringified format
			 * @public
			 * @deprecated Since version 1.83.0
			 */
			toJSONString: function () {
				return FESelectionVariant.prototype.toJSONString.apply(this);
			}
		});

		return SelectionVariant;

	}, true);
