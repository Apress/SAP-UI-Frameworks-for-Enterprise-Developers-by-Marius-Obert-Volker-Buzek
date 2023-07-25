/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/each", "sap/ui/base/Object", "./NavError"], function (Log, each, BaseObject, NavError) {
  "use strict";

  var _exports = {};
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
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
  let SelectionVariant = /*#__PURE__*/function (_BaseObject) {
    _inheritsLoose(SelectionVariant, _BaseObject);
    /**
     * Creates an instance of a selection variant based on the optional serialized input.
     *
     * @param selectionVariant Serialized selection variant as string or object.
     */
    function SelectionVariant(selectionVariant) {
      var _this;
      _this = _BaseObject.call(this) || this;
      _this.id = "";
      _this.parameters = {};
      _this.selectOptions = {};
      if (selectionVariant !== undefined) {
        if (typeof selectionVariant === "string") {
          _this.parseFromString(selectionVariant);
        } else if (typeof selectionVariant === "object") {
          _this.parseFromObject(selectionVariant);
        } else {
          throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
        }
      }
      return _this;
    }

    /**
     * Returns the identification of the selection variant.
     *
     * @public
     * @function getID
     * @memberof sap.fe.navigation.SelectionVariant.prototype
     * @returns {string} The identification of the selection variant as made available during construction
     */
    _exports.SelectionVariant = SelectionVariant;
    var _proto = SelectionVariant.prototype;
    _proto.getID = function getID() {
      return this.id;
    }

    /**
     * Sets the identification of the selection variant.
     *
     * @param id The new identification of the selection variant
     * @public
     */;
    _proto.setID = function setID(id) {
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
     */;
    _proto.setText = function setText(newText) {
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
     */;
    _proto.getText = function getText() {
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
     */;
    _proto.setParameterContextUrl = function setParameterContextUrl(sURL) {
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
     */;
    _proto.getParameterContextUrl = function getParameterContextUrl() {
      return this.parameterCtxUrl;
    }

    /**
     * Gets the current context URL intended for the filters.
     *
     * @returns The current context URL for the filters
     * @public
     */;
    _proto.getFilterContextUrl = function getFilterContextUrl() {
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
     */;
    _proto.setFilterContextUrl = function setFilterContextUrl(sURL) {
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
     */;
    _proto.addParameter = function addParameter(sName, sValue) {
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
     */;
    _proto.removeParameter = function removeParameter(sName) {
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
     */;
    _proto.renameParameter = function renameParameter(sNameOld, sNameNew) {
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
     */;
    _proto.getParameter = function getParameter(sName) {
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
     */;
    _proto.getParameterNames = function getParameterNames() {
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
     */;
    _proto.addSelectOption = function addSelectOption(sPropertyName, sSign, sOption, sLow, sHigh, sText, semanticDates) {
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
      const oEntry = {
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
        if (oExistingEntry.Sign === oEntry.Sign && oExistingEntry.Option === oEntry.Option && oExistingEntry.Low === oEntry.Low && oExistingEntry.High === oEntry.High) {
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
     */;
    _proto.removeSelectOption = function removeSelectOption(sName) {
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
     */;
    _proto.renameSelectOption = function renameSelectOption(sNameOld, sNameNew) {
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
     */;
    _proto.getSelectOption = function getSelectOption(sPropertyName) {
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
     */;
    _proto.getSelectOptionsPropertyNames = function getSelectOptionsPropertyNames() {
      return Object.keys(this.selectOptions);
    }

    /**
     * Returns the names of the parameter and select option properties available for this instance.
     *
     * @returns The list of parameter and select option property names available for this instance
     * @public
     */;
    _proto.getPropertyNames = function getPropertyNames() {
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
     */;
    _proto.massAddSelectOption = function massAddSelectOption(sPropertyName, aSelectOptions) {
      if (!Array.isArray(aSelectOptions)) {
        throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
      }
      for (let i = 0; i < aSelectOptions.length; i++) {
        const oSelectOption = aSelectOptions[i];
        this.addSelectOption(sPropertyName, oSelectOption.Sign, oSelectOption.Option, oSelectOption.Low, oSelectOption.High, oSelectOption.Text, oSelectOption.SemanticDates);
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
     */;
    _proto.getValue = function getValue(sName) {
      let aValue = this.getSelectOption(sName);
      if (aValue !== undefined) {
        // a range for the selection option is provided; so this is the leading one
        return aValue;
      }
      const sParamValue = this.getParameter(sName);
      if (sParamValue !== undefined) {
        // a parameter value has been provided; we need to convert it to the range format
        aValue = [{
          Sign: "I",
          Option: "EQ",
          Low: sParamValue,
          High: null
        }];
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
     */;
    _proto.isEmpty = function isEmpty() {
      return this.getParameterNames().length === 0 && this.getSelectOptionsPropertyNames().length === 0;
    }

    /**
     * Returns the external representation of the selection variant as JSON object.
     *
     * @returns The external representation of this instance as a JSON object
     * @public
     */;
    _proto.toJSONObject = function toJSONObject() {
      const oExternalSelectionVariant = {
        Version: {
          // Version attributes are not part of the official specification,
          Major: "1",
          // but could be helpful later for implementing a proper lifecycle/interoperability
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
     */;
    _proto.toJSONString = function toJSONString() {
      return JSON.stringify(this.toJSONObject());
    };
    _proto.determineODataFilterExpression = function determineODataFilterExpression(oExternalSelectionVariant) {
      // TODO - specification does not indicate what is expected here in detail
      oExternalSelectionVariant.ODataFilterExpression = ""; // not supported yet - it's allowed to be optional
    };
    _proto.serializeParameters = function serializeParameters(oExternalSelectionVariant) {
      // Note: Parameters section is optional (see specification section 2.4.2.1)
      oExternalSelectionVariant.Parameters = [];
      for (const name in this.parameters) {
        oExternalSelectionVariant.Parameters.push({
          PropertyName: name,
          PropertyValue: this.parameters[name]
        });
      }
    };
    _proto.serializeSelectOptions = function serializeSelectOptions(oExternalSelectionVariant) {
      if (this.selectOptions.length === 0) {
        return;
      }
      oExternalSelectionVariant.SelectOptions = [];
      each(this.selectOptions, function (sPropertyName, aEntries) {
        const oSelectOption = {
          PropertyName: sPropertyName,
          Ranges: aEntries
        };
        oExternalSelectionVariant.SelectOptions.push(oSelectOption);
      });
    };
    _proto.parseFromString = function parseFromString(sJSONString) {
      if (sJSONString === undefined) {
        throw new NavError("SelectionVariant.UNABLE_TO_PARSE_INPUT");
      }
      if (typeof sJSONString !== "string") {
        throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
      }
      const oInput = JSON.parse(sJSONString);
      // the input needs to be an JSON string by specification

      this.parseFromObject(oInput);
    };
    _proto.parseFromObject = function parseFromObject(oInput) {
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
    };
    _proto.parseFromStringParameters = function parseFromStringParameters(parameters) {
      for (const parameter of parameters) {
        this.addParameter(parameter.PropertyName, parameter.PropertyValue);
      }
    };
    _proto.parseFromStringSelectOptions = function parseFromStringSelectOptions(selectOptions) {
      for (const option of selectOptions) {
        if (option.Ranges) {
          if (!Array.isArray(option.Ranges)) {
            throw new NavError("SelectionVariant.SELECT_OPTION_RANGES_NOT_ARRAY");
          }
          for (const range of option.Ranges) {
            this.addSelectOption(option.PropertyName, range.Sign, range.Option, range.Low, range.High, range.Text, range.SemanticDates);
          }
        } else {
          Log.warning("Select Option object does not contain a Ranges entry; ignoring entry");
        }
      }
    };
    return SelectionVariant;
  }(BaseObject); // Exporting the class as properly typed UI5Class
  _exports.SelectionVariant = SelectionVariant;
  const UI5Class = BaseObject.extend("sap.fe.navigation.SelectionVariant", SelectionVariant.prototype);
  return UI5Class;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWQUxJREFURV9TSUdOIiwiUmVnRXhwIiwiVkFMSURBVEVfT1BUSU9OIiwiU2VsZWN0aW9uVmFyaWFudCIsInNlbGVjdGlvblZhcmlhbnQiLCJpZCIsInBhcmFtZXRlcnMiLCJzZWxlY3RPcHRpb25zIiwidW5kZWZpbmVkIiwicGFyc2VGcm9tU3RyaW5nIiwicGFyc2VGcm9tT2JqZWN0IiwiTmF2RXJyb3IiLCJnZXRJRCIsInNldElEIiwic2V0VGV4dCIsIm5ld1RleHQiLCJ0ZXh0IiwiZ2V0VGV4dCIsInNldFBhcmFtZXRlckNvbnRleHRVcmwiLCJzVVJMIiwicGFyYW1ldGVyQ3R4VXJsIiwiZ2V0UGFyYW1ldGVyQ29udGV4dFVybCIsImdldEZpbHRlckNvbnRleHRVcmwiLCJmaWx0ZXJDdHhVcmwiLCJzZXRGaWx0ZXJDb250ZXh0VXJsIiwiYWRkUGFyYW1ldGVyIiwic05hbWUiLCJzVmFsdWUiLCJyZW1vdmVQYXJhbWV0ZXIiLCJyZW5hbWVQYXJhbWV0ZXIiLCJzTmFtZU9sZCIsInNOYW1lTmV3IiwiZ2V0UGFyYW1ldGVyIiwiZ2V0UGFyYW1ldGVyTmFtZXMiLCJPYmplY3QiLCJrZXlzIiwiYWRkU2VsZWN0T3B0aW9uIiwic1Byb3BlcnR5TmFtZSIsInNTaWduIiwic09wdGlvbiIsInNMb3ciLCJzSGlnaCIsInNUZXh0Iiwic2VtYW50aWNEYXRlcyIsInRlc3QiLCJ0b1VwcGVyQ2FzZSIsIm9FbnRyeSIsIlNpZ24iLCJPcHRpb24iLCJMb3ciLCJUZXh0IiwiSGlnaCIsIlNlbWFudGljRGF0ZXMiLCJpIiwibGVuZ3RoIiwib0V4aXN0aW5nRW50cnkiLCJwdXNoIiwicmVtb3ZlU2VsZWN0T3B0aW9uIiwicmVuYW1lU2VsZWN0T3B0aW9uIiwiZ2V0U2VsZWN0T3B0aW9uIiwib0VudHJpZXMiLCJKU09OIiwicGFyc2UiLCJzdHJpbmdpZnkiLCJnZXRTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcyIsImdldFByb3BlcnR5TmFtZXMiLCJjb25jYXQiLCJtYXNzQWRkU2VsZWN0T3B0aW9uIiwiYVNlbGVjdE9wdGlvbnMiLCJBcnJheSIsImlzQXJyYXkiLCJvU2VsZWN0T3B0aW9uIiwiZ2V0VmFsdWUiLCJhVmFsdWUiLCJzUGFyYW1WYWx1ZSIsImlzRW1wdHkiLCJ0b0pTT05PYmplY3QiLCJvRXh0ZXJuYWxTZWxlY3Rpb25WYXJpYW50IiwiVmVyc2lvbiIsIk1ham9yIiwiTWlub3IiLCJQYXRjaCIsIlNlbGVjdGlvblZhcmlhbnRJRCIsIlBhcmFtZXRlckNvbnRleHRVcmwiLCJGaWx0ZXJDb250ZXh0VXJsIiwiZGV0ZXJtaW5lT0RhdGFGaWx0ZXJFeHByZXNzaW9uIiwic2VyaWFsaXplUGFyYW1ldGVycyIsInNlcmlhbGl6ZVNlbGVjdE9wdGlvbnMiLCJ0b0pTT05TdHJpbmciLCJPRGF0YUZpbHRlckV4cHJlc3Npb24iLCJQYXJhbWV0ZXJzIiwibmFtZSIsIlByb3BlcnR5TmFtZSIsIlByb3BlcnR5VmFsdWUiLCJTZWxlY3RPcHRpb25zIiwiZWFjaCIsImFFbnRyaWVzIiwiUmFuZ2VzIiwic0pTT05TdHJpbmciLCJvSW5wdXQiLCJMb2ciLCJ3YXJuaW5nIiwicGFyc2VGcm9tU3RyaW5nUGFyYW1ldGVycyIsInBhcnNlRnJvbVN0cmluZ1NlbGVjdE9wdGlvbnMiLCJwYXJhbWV0ZXIiLCJvcHRpb24iLCJyYW5nZSIsIkJhc2VPYmplY3QiLCJVSTVDbGFzcyIsImV4dGVuZCIsInByb3RvdHlwZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiU2VsZWN0aW9uVmFyaWFudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBlYWNoIGZyb20gXCJzYXAvYmFzZS91dGlsL2VhY2hcIjtcbmltcG9ydCBCYXNlT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9PYmplY3RcIjtcbmltcG9ydCBOYXZFcnJvciBmcm9tIFwiLi9OYXZFcnJvclwiO1xuXG4vKipcbiAqIE9iamVjdCBjb250YWluaW5nIHNlbWFudGljRGF0ZXMgZmlsdGVyIGluZm9ybWF0aW9uLlxuICovXG5leHBvcnQgdHlwZSBTZW1hbnRpY0RhdGVDb25maWd1cmF0aW9uID0ge1xuXHQvKipcblx0ICogU2VtYW50aWMgRGF0ZSBPcGVyYXRvclxuXHQgKi9cblx0aGlnaDogc3RyaW5nIHwgbnVtYmVyIHwgbnVsbDtcblxuXHQvKipcblx0ICogdGhlIHVwcGVyIGJvdW5kYXJ5IG9mIHRoZSBpbnRlcnZhbCBmb3IgcmFuZ2Ugb3BlcmF0b3JzXG5cdCAqL1xuXHRsb3c6IHN0cmluZyB8IG51bWJlciB8IG51bGw7XG5cblx0LyoqXG5cdCAqIFRoZSBzaW5nbGUgdmFsdWUgb3IgdGhlIGxvd2VyIGJvdW5kYXJ5IG9mIHRoZSBpbnRlcnZhbCBmb3IgcmFuZ2UgT3BlcmF0b3JzXG5cdCAqL1xuXHRvcGVyYXRvcjogc3RyaW5nO1xufTtcblxuLyoqXG4gKiBTdHJ1Y3R1cmUgb2YgYSBwbGFpbiBzZWxlY3Qgb3B0aW9uIG9iamVjdC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTZWxlY3RPcHRpb24ge1xuXHRTaWduOiBzdHJpbmc7XG5cdE9wdGlvbjogc3RyaW5nO1xuXHRMb3c6IHN0cmluZztcblx0SGlnaD86IHN0cmluZyB8IG51bGw7XG5cdFRleHQ/OiBzdHJpbmc7XG5cdFNlbWFudGljRGF0ZXM/OiBTZW1hbnRpY0RhdGVDb25maWd1cmF0aW9uO1xufVxuXG4vKipcbiAqIFN0cnVjdHVyZSBvZiBhIEpTT04gc2VyaWFsaXplZCBTZWxlY3Rpb25PcHRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTZXJpYWxpemVkU2VsZWN0T3B0aW9uIHtcblx0UHJvcGVydHlOYW1lOiBzdHJpbmc7XG5cdFJhbmdlcz86IFNlbGVjdE9wdGlvbltdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNlcmlhbGl6ZWRQYXJhbWV0ZXIge1xuXHRQcm9wZXJ0eU5hbWU6IHN0cmluZztcblx0UHJvcGVydHlWYWx1ZTogc3RyaW5nO1xufVxuXG4vKipcbiAqIFN0cnVjdHVyZSBvZiBhIEpTT04gc2VyaWFsaXplZCBTZWxlY3Rpb25WYXJpYW50XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2VyaWFsaXplZFNlbGVjdGlvblZhcmlhbnQge1xuXHRWZXJzaW9uPzoge1xuXHRcdE1ham9yOiBzdHJpbmc7XG5cdFx0TWlub3I6IHN0cmluZztcblx0XHRQYXRjaDogc3RyaW5nO1xuXHR9O1xuXHRTZWxlY3Rpb25WYXJpYW50SUQ/OiBzdHJpbmc7XG5cdFBhcmFtZXRlckNvbnRleHRVcmw/OiBzdHJpbmc7XG5cdEZpbHRlckNvbnRleHRVcmw/OiBzdHJpbmc7XG5cdFRleHQ/OiBzdHJpbmc7XG5cdFBhcmFtZXRlcnM/OiBTZXJpYWxpemVkUGFyYW1ldGVyW107XG5cdFNlbGVjdE9wdGlvbnM/OiBTZXJpYWxpemVkU2VsZWN0T3B0aW9uW107XG59XG5cbmNvbnN0IFZBTElEQVRFX1NJR04gPSBuZXcgUmVnRXhwKFwiW0V8SV1cIik7XG5jb25zdCBWQUxJREFURV9PUFRJT04gPSBuZXcgUmVnRXhwKFwiRVF8TkV8TEV8R0V8TFR8R1R8QlR8Q1BcIik7XG5cbi8qKlxuICogQHB1YmxpY1xuICogQG5hbWUgc2FwLmZlLm5hdmlnYXRpb24uU2VsZWN0aW9uVmFyaWFudFxuICogQGNsYXNzXG4gKiBUaGlzIGlzIHRoZSBzdWNjZXNzb3Igb2Yge0BsaW5rIHNhcC51aS5nZW5lcmljLmFwcC5uYXZpZ2F0aW9uLnNlcnZpY2UuU2VsZWN0aW9uVmFyaWFudH0uPGJyPlxuICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhIFNlbGVjdGlvblZhcmlhbnQgY2xhc3MuIElmIG5vIHBhcmFtZXRlciBpcyBwYXNzZWQsXG4gKiBhbiBuZXcgZW1wdHkgaW5zdGFuY2UgaXMgY3JlYXRlZCB3aG9zZSBJRCBoYXMgYmVlbiBzZXQgdG8gPGNvZGU+XCJcIjwvY29kZT4uXG4gKiBQYXNzaW5nIGEgSlNPTi1zZXJpYWxpemVkIHN0cmluZyBjb21wbHlpbmcgdG8gdGhlIFNlbGVjdGlvbiBWYXJpYW50IFNwZWNpZmljYXRpb24gd2lsbCBwYXJzZSBpdCxcbiAqIGFuZCB0aGUgbmV3bHkgY3JlYXRlZCBpbnN0YW5jZSB3aWxsIGNvbnRhaW4gdGhlIHNhbWUgaW5mb3JtYXRpb24uXG4gKiBAZXh0ZW5kcyBzYXAudWkuYmFzZS5PYmplY3RcbiAqIEBzaW5jZSAxLjgzLjBcbiAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdH0gW3ZTZWxlY3Rpb25WYXJpYW50XSBJZiBvZiB0eXBlIDxjb2RlPnN0cmluZzwvY29kZT4sIHRoZSBzZWxlY3Rpb24gdmFyaWFudCBpcyBKU09OLWZvcm1hdHRlZDtcbiAqIGlmIG9mIHR5cGUgPGNvZGU+b2JqZWN0PC9jb2RlPiwgdGhlIG9iamVjdCByZXByZXNlbnRzIGEgc2VsZWN0aW9uIHZhcmlhbnRcbiAqIEB0aHJvd3MgQW4gaW5zdGFuY2Ugb2Yge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdkVycm9yfSBpbiBjYXNlIG9mIGlucHV0IGVycm9ycy4gVmFsaWQgZXJyb3IgY29kZXMgYXJlOlxuICogPHRhYmxlPlxuICogPHRyPjx0aD5OYXZFcnJvciBjb2RlPC90aD48dGg+RGVzY3JpcHRpb248L3RoPjwvdHI+XG4gKiA8dHI+PHRkPlNlbGVjdGlvblZhcmlhbnQuSU5WQUxJRF9JTlBVVF9UWVBFPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgdGhlIGRhdGEgZm9ybWF0IG9mIHRoZSBzZWxlY3Rpb24gdmFyaWFudCBwcm92aWRlZCBpcyBpbmNvbnNpc3RlbnQ8L3RkPjwvdHI+XG4gKiA8dHI+PHRkPlNlbGVjdGlvblZhcmlhbnQuVU5BQkxFX1RPX1BBUlNFX0lOUFVUPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgdGhlIHByb3ZpZGVkIHN0cmluZyBpcyBub3QgYSBKU09OLWZvcm1hdHRlZCBzdHJpbmc8L3RkPjwvdHI+XG4gKiA8dHI+PHRkPlNlbGVjdGlvblZhcmlhbnQuSU5QVVRfRE9FU19OT1RfQ09OVEFJTl9TRUxFQ1RJT05WQVJJQU5UX0lEPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgdGhlIFNlbGVjdGlvblZhcmlhbnRJRCBjYW5ub3QgYmUgcmV0cmlldmVkPC90ZD48L3RyPlxuICogPHRyPjx0ZD5TZWxlY3Rpb25WYXJpYW50LlBBUkFNRVRFUl9XSVRIT1VUX1ZBTFVFPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgdGhlcmUgd2FzIGFuIGF0dGVtcHQgdG8gc3BlY2lmeSBhIHBhcmFtZXRlciwgYnV0IHdpdGhvdXQgcHJvdmlkaW5nIGFueSB2YWx1ZSAobm90IGV2ZW4gYW4gZW1wdHkgdmFsdWUpPC90ZD48L3RyPlxuICogPHRyPjx0ZD5TZWxlY3Rpb25WYXJpYW50LlNFTEVDVF9PUFRJT05fV0lUSE9VVF9QUk9QRVJUWV9OQU1FPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgYSBzZWxlY3Rpb24gb3B0aW9uIGhhcyBiZWVuIGRlZmluZWQsIGJ1dCB0aGUgUmFuZ2VzIGRlZmluaXRpb24gaXMgbWlzc2luZzwvdGQ+PC90cj5cbiAqIDx0cj48dGQ+U2VsZWN0aW9uVmFyaWFudC5TRUxFQ1RfT1BUSU9OX1JBTkdFU19OT1RfQVJSQVk8L3RkPjx0ZD5JbmRpY2F0ZXMgdGhhdCB0aGUgUmFuZ2VzIGRlZmluaXRpb24gaXMgbm90IGFuIGFycmF5PC90ZD48L3RyPlxuICogPC90YWJsZT5cbiAqIFRoZXNlIGV4Y2VwdGlvbnMgY2FuIG9ubHkgYmUgdGhyb3duIGlmIHRoZSBwYXJhbWV0ZXIgPGNvZGU+dlNlbGVjdGlvblZhcmlhbnQ8L2NvZGU+IGhhcyBiZWVuIHByb3ZpZGVkLlxuICovXG5leHBvcnQgY2xhc3MgU2VsZWN0aW9uVmFyaWFudCBleHRlbmRzIEJhc2VPYmplY3Qge1xuXHRwcml2YXRlIGlkOiBzdHJpbmcgPSBcIlwiO1xuXG5cdHByaXZhdGUgcGFyYW1ldGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuXG5cdHByaXZhdGUgc2VsZWN0T3B0aW9uczogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xuXG5cdHByaXZhdGUgdGV4dD86IHN0cmluZztcblxuXHRwcml2YXRlIHBhcmFtZXRlckN0eFVybD86IHN0cmluZztcblxuXHRwcml2YXRlIGZpbHRlckN0eFVybD86IHN0cmluZztcblxuXHQvKipcblx0ICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBhIHNlbGVjdGlvbiB2YXJpYW50IGJhc2VkIG9uIHRoZSBvcHRpb25hbCBzZXJpYWxpemVkIGlucHV0LlxuXHQgKlxuXHQgKiBAcGFyYW0gc2VsZWN0aW9uVmFyaWFudCBTZXJpYWxpemVkIHNlbGVjdGlvbiB2YXJpYW50IGFzIHN0cmluZyBvciBvYmplY3QuXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihzZWxlY3Rpb25WYXJpYW50Pzogc3RyaW5nIHwgU2VyaWFsaXplZFNlbGVjdGlvblZhcmlhbnQpIHtcblx0XHRzdXBlcigpO1xuXG5cdFx0aWYgKHNlbGVjdGlvblZhcmlhbnQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0aWYgKHR5cGVvZiBzZWxlY3Rpb25WYXJpYW50ID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdHRoaXMucGFyc2VGcm9tU3RyaW5nKHNlbGVjdGlvblZhcmlhbnQpO1xuXHRcdFx0fSBlbHNlIGlmICh0eXBlb2Ygc2VsZWN0aW9uVmFyaWFudCA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHR0aGlzLnBhcnNlRnJvbU9iamVjdChzZWxlY3Rpb25WYXJpYW50KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIlNlbGVjdGlvblZhcmlhbnQuSU5WQUxJRF9JTlBVVF9UWVBFXCIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBpZGVudGlmaWNhdGlvbiBvZiB0aGUgc2VsZWN0aW9uIHZhcmlhbnQuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICogQGZ1bmN0aW9uIGdldElEXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUubmF2aWdhdGlvbi5TZWxlY3Rpb25WYXJpYW50LnByb3RvdHlwZVxuXHQgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgaWRlbnRpZmljYXRpb24gb2YgdGhlIHNlbGVjdGlvbiB2YXJpYW50IGFzIG1hZGUgYXZhaWxhYmxlIGR1cmluZyBjb25zdHJ1Y3Rpb25cblx0ICovXG5cdHB1YmxpYyBnZXRJRCgpIHtcblx0XHRyZXR1cm4gdGhpcy5pZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBpZGVudGlmaWNhdGlvbiBvZiB0aGUgc2VsZWN0aW9uIHZhcmlhbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgbmV3IGlkZW50aWZpY2F0aW9uIG9mIHRoZSBzZWxlY3Rpb24gdmFyaWFudFxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRzZXRJRChpZDogc3RyaW5nKSB7XG5cdFx0dGhpcy5pZCA9IGlkO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIHRleHQgLyBkZXNjcmlwdGlvbiBvZiB0aGUgc2VsZWN0aW9uIHZhcmlhbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBuZXdUZXh0IFRoZSBuZXcgZGVzY3JpcHRpb24gdG8gYmUgdXNlZFxuXHQgKiBAcHVibGljXG5cdCAqIEB0aHJvd3MgQW4gaW5zdGFuY2Ugb2Yge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdkVycm9yfSBpbiBjYXNlIG9mIGlucHV0IGVycm9ycy4gVmFsaWQgZXJyb3IgY29kZXMgYXJlOlxuXHQgKiA8dGFibGU+XG5cdCAqIDx0cj48dGg+TmF2RXJyb3IgY29kZTwvdGg+PHRoPkRlc2NyaXB0aW9uPC90aD48L3RyPlxuXHQgKiA8dHI+PHRkPlByZXNlbnRhdGlvblZhcmlhbnQuSU5WQUxJRF9JTlBVVF9UWVBFPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgYW4gaW5wdXQgcGFyYW1ldGVyIGhhcyBhbiBpbnZhbGlkIHR5cGU8L3RkPjwvdHI+XG5cdCAqIDwvdGFibGU+XG5cdCAqL1xuXHRzZXRUZXh0KG5ld1RleHQ/OiBzdHJpbmcpIHtcblx0XHRpZiAodHlwZW9mIG5ld1RleHQgIT09IFwic3RyaW5nXCIpIHtcblx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIlByZXNlbnRhdGlvblZhcmlhbnQuSU5WQUxJRF9JTlBVVF9UWVBFXCIpO1xuXHRcdH1cblx0XHR0aGlzLnRleHQgPSBuZXdUZXh0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGN1cnJlbnQgdGV4dCAvIGRlc2NyaXB0aW9uIG9mIHRoaXMgc2VsZWN0aW9uIHZhcmlhbnQuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBjdXJyZW50IGRlc2NyaXB0aW9uIG9mIHRoaXMgc2VsZWN0aW9uIHZhcmlhbnQuXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGdldFRleHQoKSB7XG5cdFx0cmV0dXJuIHRoaXMudGV4dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBjb250ZXh0IFVSTCBpbnRlbmRlZCBmb3IgdGhlIHBhcmFtZXRlcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBzVVJMIFRoZSBVUkwgb2YgdGhlIHBhcmFtZXRlciBjb250ZXh0XG5cdCAqIEBwdWJsaWNcblx0ICogQHRocm93cyBBbiBpbnN0YW5jZSBvZiB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3J9IGluIGNhc2Ugb2YgaW5wdXQgZXJyb3JzLiBWYWxpZCBlcnJvciBjb2RlcyBhcmU6XG5cdCAqIDx0YWJsZT5cblx0ICogPHRyPjx0aD5OYXZFcnJvciBjb2RlPC90aD48dGg+RGVzY3JpcHRpb248L3RoPjwvdHI+XG5cdCAqIDx0cj48dGQ+U2VsZWN0aW9uVmFyaWFudC5JTlZBTElEX0lOUFVUX1RZUEU8L3RkPjx0ZD5JbmRpY2F0ZXMgdGhhdCBhbiBpbnB1dCBwYXJhbWV0ZXIgaGFzIGFuIGludmFsaWQgdHlwZTwvdGQ+PC90cj5cblx0ICogPC90YWJsZT5cblx0ICovXG5cdHNldFBhcmFtZXRlckNvbnRleHRVcmwoc1VSTDogc3RyaW5nKSB7XG5cdFx0aWYgKHR5cGVvZiBzVVJMICE9PSBcInN0cmluZ1wiKSB7XG5cdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJTZWxlY3Rpb25WYXJpYW50LklOVkFMSURfSU5QVVRfVFlQRVwiKTtcblx0XHR9XG5cdFx0dGhpcy5wYXJhbWV0ZXJDdHhVcmwgPSBzVVJMO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGN1cnJlbnQgY29udGV4dCBVUkwgaW50ZW5kZWQgZm9yIHRoZSBwYXJhbWV0ZXJzLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgY3VycmVudCBjb250ZXh0IFVSTCBmb3IgdGhlIHBhcmFtZXRlcnNcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0Z2V0UGFyYW1ldGVyQ29udGV4dFVybCgpIHtcblx0XHRyZXR1cm4gdGhpcy5wYXJhbWV0ZXJDdHhVcmw7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgY3VycmVudCBjb250ZXh0IFVSTCBpbnRlbmRlZCBmb3IgdGhlIGZpbHRlcnMuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBjdXJyZW50IGNvbnRleHQgVVJMIGZvciB0aGUgZmlsdGVyc1xuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRnZXRGaWx0ZXJDb250ZXh0VXJsKCkge1xuXHRcdHJldHVybiB0aGlzLmZpbHRlckN0eFVybDtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBjb250ZXh0IFVSTCBpbnRlbmRlZCBmb3IgdGhlIGZpbHRlcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBzVVJMIFRoZSBVUkwgb2YgdGhlIGZpbHRlcnNcblx0ICogQHB1YmxpY1xuXHQgKiBAdGhyb3dzIEFuIGluc3RhbmNlIG9mIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5OYXZFcnJvcn0gaW4gY2FzZSBvZiBpbnB1dCBlcnJvcnMuIFZhbGlkIGVycm9yIGNvZGVzIGFyZTpcblx0ICogPHRhYmxlPlxuXHQgKiA8dHI+PHRoPk5hdkVycm9yIGNvZGU8L3RoPjx0aD5EZXNjcmlwdGlvbjwvdGg+PC90cj5cblx0ICogPHRyPjx0ZD5TZWxlY3Rpb25WYXJpYW50LklOVkFMSURfSU5QVVRfVFlQRTwvdGQ+PHRkPkluZGljYXRlcyB0aGF0IGFuIGlucHV0IHBhcmFtZXRlciBoYXMgYW4gaW52YWxpZCB0eXBlPC90ZD48L3RyPlxuXHQgKiA8L3RhYmxlPlxuXHQgKi9cblx0c2V0RmlsdGVyQ29udGV4dFVybChzVVJMOiBzdHJpbmcpIHtcblx0XHRpZiAodHlwZW9mIHNVUkwgIT09IFwic3RyaW5nXCIpIHtcblx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIlNlbGVjdGlvblZhcmlhbnQuSU5WQUxJRF9JTlBVVF9UWVBFXCIpO1xuXHRcdH1cblx0XHR0aGlzLmZpbHRlckN0eFVybCA9IHNVUkw7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgdmFsdWUgb2YgYSBwYXJhbWV0ZXIgY2FsbGVkIDxjb2RlPnNOYW1lPC9jb2RlPiB0byB0aGUgbmV3IHZhbHVlIDxjb2RlPnNWYWx1ZTwvY29kZT4uXG5cdCAqIElmIHRoZSBwYXJhbWV0ZXIgaGFzIGFscmVhZHkgYmVlbiBzZXQgYmVmb3JlLCBpdHMgdmFsdWUgaXMgb3ZlcndyaXR0ZW4uXG5cdCAqXG5cdCAqIEBwYXJhbSBzTmFtZSBUaGUgbmFtZSBvZiB0aGUgcGFyYW1ldGVyIHRvIGJlIHNldDsgdGhlIDxjb2RlPm51bGw8L2NvZGU+IHZhbHVlIGlzIG5vdCBhbGxvd2VkXG5cdCAqIEBwYXJhbSBzVmFsdWUgVGhlIHZhbHVlIG9mIHRoZSBwYXJhbWV0ZXIgdG8gYmUgc2V0XG5cdCAqIEByZXR1cm5zIFRoaXMgaW5zdGFuY2UgdG8gYWxsb3cgbWV0aG9kIGNoYWluaW5nXG5cdCAqIEBwdWJsaWNcblx0ICogQHRocm93cyBBbiBpbnN0YW5jZSBvZiB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3J9IGluIGNhc2Ugb2YgaW5wdXQgZXJyb3JzLiBWYWxpZCBlcnJvciBjb2RlcyBhcmU6XG5cdCAqIDx0YWJsZT5cblx0ICogPHRyPjx0aD5OYXZFcnJvciBjb2RlPC90aD48dGg+RGVzY3JpcHRpb248L3RoPjwvdHI+XG5cdCAqIDx0cj48dGQ+U2VsZWN0aW9uVmFyaWFudC5QQVJBTUVURVJfV0lUSE9VVF9OQU1FPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgdGhlIG5hbWUgb2YgdGhlIHBhcmFtZXRlciBoYXMgbm90IGJlZW4gc3BlY2lmaWVkPC90ZD48L3RyPlxuXHQgKiA8dHI+PHRkPlNlbGVjdGlvblZhcmlhbnQuSU5WQUxJRF9JTlBVVF9UWVBFPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgYW4gaW5wdXQgcGFyYW1ldGVyIGhhcyBhbiBpbnZhbGlkIHR5cGUgb3IgdGhlIHZhbHVlIGlzIHNldCB0byA8Y29kZT5udWxsPC9jb2RlPjwvdGQ+PC90cj5cblx0ICogPHRyPjx0ZD5TZWxlY3Rpb25WYXJpYW50LlBBUkFNRVRFUl9TRUxPUFRfQ09MTElTSU9OPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgYW5vdGhlciBTZWxlY3RPcHRpb24gd2l0aCB0aGUgc2FtZSBuYW1lIGFzIHRoZSBwYXJhbWV0ZXIgYWxyZWFkeSBleGlzdHM8L3RkPjwvdHI+XG5cdCAqIDwvdGFibGU+XG5cdCAqL1xuXHRhZGRQYXJhbWV0ZXIoc05hbWU6IHN0cmluZywgc1ZhbHVlOiBzdHJpbmcpIHtcblx0XHQvKlxuXHRcdCAqICB7c3RyaW5nfSBzTmFtZSBUaGUgbmFtZSBvZiB0aGUgcGFyYW1ldGVyIHRvIGJlIHNldDsgdGhlIDxjb2RlPm51bGw8L2NvZGU+IHZhbHVlIGlzIG5vdCBhbGxvd2VkXG5cdFx0ICogKHNlZSBzcGVjaWZpY2F0aW9uIFwiU2VsZWN0aW9uIFZhcmlhbnRzIGZvciBVSSBOYXZpZ2F0aW9uIGluIEZpb3JpXCIsIHNlY3Rpb24gMi40LjIuMSlcblx0XHQgKi9cblx0XHRpZiAodHlwZW9mIHNOYW1lICE9PSBcInN0cmluZ1wiKSB7XG5cdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJTZWxlY3Rpb25WYXJpYW50LklOVkFMSURfSU5QVVRfVFlQRVwiKTtcblx0XHR9XG5cdFx0aWYgKHR5cGVvZiBzVmFsdWUgIT09IFwic3RyaW5nXCIpIHtcblx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIlNlbGVjdGlvblZhcmlhbnQuSU5WQUxJRF9JTlBVVF9UWVBFXCIpO1xuXHRcdH1cblx0XHRpZiAoc05hbWUgPT09IFwiXCIpIHtcblx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIlNlbGVjdGlvblZhcmlhbnQuUEFSQU1FVEVSX1dJVEhPVVRfTkFNRVwiKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5zZWxlY3RPcHRpb25zW3NOYW1lXSkge1xuXHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiU2VsZWN0aW9uVmFyaWFudC5QQVJBTUVURVJfU0VMT1BUX0NPTExJU0lPTlwiKTtcblx0XHR9XG5cblx0XHR0aGlzLnBhcmFtZXRlcnNbc05hbWVdID0gc1ZhbHVlO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhIHBhcmFtZXRlciBjYWxsZWQgPGNvZGU+c05hbWU8L2NvZGU+IGZyb20gdGhlIHNlbGVjdGlvbiB2YXJpYW50LlxuXHQgKlxuXHQgKiBAcGFyYW0gc05hbWUgVGhlIG5hbWUgb2YgdGhlIHBhcmFtZXRlciB0byBiZSByZW1vdmVkXG5cdCAqIEByZXR1cm5zIFRoaXMgaW5zdGFuY2UgdG8gYWxsb3cgbWV0aG9kIGNoYWluaW5nXG5cdCAqIEBwdWJsaWNcblx0ICogQHRocm93cyBBbiBpbnN0YW5jZSBvZiB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3J9IGluIGNhc2Ugb2YgaW5wdXQgZXJyb3JzLiBWYWxpZCBlcnJvciBjb2RlcyBhcmU6XG5cdCAqIDx0YWJsZT5cblx0ICogPHRyPjx0aD5OYXZFcnJvciBjb2RlPC90aD48dGg+RGVzY3JpcHRpb248L3RoPjwvdHI+XG5cdCAqIDx0cj48dGQ+U2VsZWN0aW9uVmFyaWFudC5QQVJBTUVURVJfV0lUSE9VVF9OQU1FPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgbmFtZSBvZiB0aGUgcGFyYW1ldGVyIGhhcyBub3QgYmVlbiBzcGVjaWZpZWQ8L3RkPjwvdHI+XG5cdCAqIDx0cj48dGQ+U2VsZWN0aW9uVmFyaWFudC5JTlZBTElEX0lOUFVUX1RZUEU8L3RkPjx0ZD5JbmRpY2F0ZXMgdGhhdCBhbiBpbnB1dCBwYXJhbWV0ZXIgaGFzIGFuIGludmFsaWQgdHlwZTwvdGQ+PC90cj5cblx0ICogPC90YWJsZT5cblx0ICovXG5cdHJlbW92ZVBhcmFtZXRlcihzTmFtZTogc3RyaW5nKSB7XG5cdFx0aWYgKHR5cGVvZiBzTmFtZSAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiU2VsZWN0aW9uVmFyaWFudC5JTlZBTElEX0lOUFVUX1RZUEVcIik7XG5cdFx0fVxuXHRcdGlmIChzTmFtZSA9PT0gXCJcIikge1xuXHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiU2VsZWN0aW9uVmFyaWFudC5QQVJBTUVURVJfV0lUSE9VVF9OQU1FXCIpO1xuXHRcdH1cblxuXHRcdGRlbGV0ZSB0aGlzLnBhcmFtZXRlcnNbc05hbWVdO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmVuYW1lcyBhIHBhcmFtZXRlciBjYWxsZWQgPGNvZGU+c05hbWVPbGQ8L2NvZGU+IHRvIDxjb2RlPnNOYW1lTmV3PC9jb2RlPi4gSWYgYSBwYXJhbWV0ZXIgb3IgYSBzZWxlY3Qgb3B0aW9uIHdpdGhcblx0ICogdGhlIG5hbWUgPGNvZGU+c05hbWVOZXc8L2NvZGU+IGFscmVhZHkgZXhpc3QsIGFuIGVycm9yIGlzIHRocm93bi4gSWYgYSBwYXJhbWV0ZXIgd2l0aCB0aGUgbmFtZSA8Y29kZT5zTmFtZU9sZDwvY29kZT5cblx0ICogZG9lcyBub3QgZXhpc3QsIG5vdGhpbmcgaXMgY2hhbmdlZC5cblx0ICpcblx0ICogQHBhcmFtIHNOYW1lT2xkIFRoZSBjdXJyZW50IG5hbWUgb2YgdGhlIHBhcmFtZXRlciB0byBiZSByZW5hbWVkXG5cdCAqIEBwYXJhbSBzTmFtZU5ldyBUaGUgbmV3IG5hbWUgb2YgdGhlIHBhcmFtZXRlclxuXHQgKiBAcmV0dXJucyBUaGlzIGluc3RhbmNlIHRvIGFsbG93IG1ldGhvZCBjaGFpbmluZ1xuXHQgKiBAcHVibGljXG5cdCAqIEB0aHJvd3MgQW4gaW5zdGFuY2Ugb2Yge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdkVycm9yfSBpbiBjYXNlIG9mIGlucHV0IGVycm9ycy4gVmFsaWQgZXJyb3IgY29kZXMgYXJlOlxuXHQgKiA8dGFibGU+XG5cdCAqIDx0cj48dGg+TmF2RXJyb3IgY29kZTwvdGg+PHRoPkRlc2NyaXB0aW9uPC90aD48L3RyPlxuXHQgKiA8dHI+PHRkPlNlbGVjdGlvblZhcmlhbnQuUEFSQU1FVEVSX1dJVEhPVVRfTkFNRTwvdGQ+PHRkPkluZGljYXRlcyB0aGF0IHRoZSBuYW1lIG9mIGEgcGFyYW1ldGVyIGhhcyBub3QgYmVlbiBzcGVjaWZpZWQ8L3RkPjwvdHI+XG5cdCAqIDx0cj48dGQ+U2VsZWN0aW9uVmFyaWFudC5JTlZBTElEX0lOUFVUX1RZUEU8L3RkPjx0ZD5JbmRpY2F0ZXMgdGhhdCBhbiBpbnB1dCBwYXJhbWV0ZXIgaGFzIGFuIGludmFsaWQgdHlwZTwvdGQ+PC90cj5cblx0ICogPHRyPjx0ZD5TZWxlY3Rpb25WYXJpYW50LlBBUkFNRVRFUl9TRUxPUFRfQ09MTElTSU9OPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgYW5vdGhlciBzZWxlY3Qgb3B0aW9uIHdpdGggdGhlIHNhbWUgbmV3IG5hbWUgYWxyZWFkeSBleGlzdHM8L3RkPjwvdHI+XG5cdCAqIDx0cj48dGQ+U2VsZWN0aW9uVmFyaWFudC5QQVJBTUVURVJfQ09MTElTSU9OPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgYW5vdGhlciBwYXJhbWV0ZXIgd2l0aCB0aGUgc2FtZSBuZXcgbmFtZSBhbHJlYWR5IGV4aXN0czwvdGQ+PC90cj5cblx0ICogPC90YWJsZT5cblx0ICovXG5cdHJlbmFtZVBhcmFtZXRlcihzTmFtZU9sZDogc3RyaW5nLCBzTmFtZU5ldzogc3RyaW5nKSB7XG5cdFx0aWYgKHR5cGVvZiBzTmFtZU9sZCAhPT0gXCJzdHJpbmdcIiB8fCB0eXBlb2Ygc05hbWVOZXcgIT09IFwic3RyaW5nXCIpIHtcblx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIlNlbGVjdGlvblZhcmlhbnQuSU5WQUxJRF9JTlBVVF9UWVBFXCIpO1xuXHRcdH1cblx0XHRpZiAoc05hbWVPbGQgPT09IFwiXCIgfHwgc05hbWVOZXcgPT09IFwiXCIpIHtcblx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIlNlbGVjdGlvblZhcmlhbnQuUEFSQU1FVEVSX1dJVEhPVVRfTkFNRVwiKTtcblx0XHR9XG5cdFx0aWYgKHRoaXMucGFyYW1ldGVyc1tzTmFtZU9sZF0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0aWYgKHRoaXMuc2VsZWN0T3B0aW9uc1tzTmFtZU5ld10pIHtcblx0XHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiU2VsZWN0aW9uVmFyaWFudC5QQVJBTUVURVJfU0VMT1BUX0NPTExJU0lPTlwiKTtcblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLnBhcmFtZXRlcnNbc05hbWVOZXddKSB7XG5cdFx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIlNlbGVjdGlvblZhcmlhbnQuUEFSQU1FVEVSX0NPTExJU0lPTlwiKTtcblx0XHRcdH1cblx0XHRcdHRoaXMucGFyYW1ldGVyc1tzTmFtZU5ld10gPSB0aGlzLnBhcmFtZXRlcnNbc05hbWVPbGRdO1xuXHRcdFx0ZGVsZXRlIHRoaXMucGFyYW1ldGVyc1tzTmFtZU9sZF07XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIHZhbHVlIG9mIHRoZSBwYXJhbWV0ZXIgY2FsbGVkIDxjb2RlPnNOYW1lPC9jb2RlPiBpZiBpdCBoYXMgYmVlbiBzZXQuXG5cdCAqIElmIHRoZSBwYXJhbWV0ZXIgaGFzIG5ldmVyIGJlZW4gc2V0IG9yIGhhcyBiZWVuIHJlbW92ZWQsIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4gaXMgcmV0dXJuZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBzTmFtZSBUaGUgbmFtZSBvZiB0aGUgcGFyYW1ldGVyIHRvIGJlIHJldHVybmVkXG5cdCAqIEByZXR1cm5zIFRoZSB2YWx1ZSBvZiBwYXJhbWV0ZXIgPGNvZGU+c05hbWU8L2NvZGU+OyByZXR1cm5pbmcgdGhlIHZhbHVlIDxjb2RlPm51bGw8L2NvZGU+IG5vdCBwb3NzaWJsZVxuXHQgKiBAcHVibGljXG5cdCAqIEB0aHJvd3MgQW4gaW5zdGFuY2Ugb2Yge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdkVycm9yfSBpbiBjYXNlIG9mIGlucHV0IGVycm9ycy4gVmFsaWQgZXJyb3IgY29kZXMgYXJlOlxuXHQgKiA8dGFibGU+XG5cdCAqIDx0cj48dGg+TmF2RXJyb3IgY29kZTwvdGg+PHRoPkRlc2NyaXB0aW9uPC90aD48L3RyPlxuXHQgKiA8dHI+PHRkPlNlbGVjdGlvblZhcmlhbnQuSU5WQUxJRF9JTlBVVF9UWVBFPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgYW4gaW5wdXQgcGFyYW1ldGVyIGhhcyBhbiBpbnZhbGlkIHR5cGU8L3RkPjwvdHI+XG5cdCAqIDwvdGFibGU+XG5cdCAqL1xuXHRnZXRQYXJhbWV0ZXIoc05hbWU6IHN0cmluZykge1xuXHRcdGlmICh0eXBlb2Ygc05hbWUgIT09IFwic3RyaW5nXCIpIHtcblx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIlNlbGVjdGlvblZhcmlhbnQuSU5WQUxJRF9JTlBVVF9UWVBFXCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5wYXJhbWV0ZXJzW3NOYW1lXTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBzZXQgb2YgcGFyYW1ldGVyIG5hbWVzIGF2YWlsYWJsZSBpbiB0aGlzIHNlbGVjdGlvbiB2YXJpYW50LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgbGlzdCBvZiBwYXJhbWV0ZXIgbmFtZXMgd2hpY2ggYXJlIHZhbGlkXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGdldFBhcmFtZXRlck5hbWVzKCk6IHN0cmluZ1tdIHtcblx0XHRyZXR1cm4gT2JqZWN0LmtleXModGhpcy5wYXJhbWV0ZXJzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGEgbmV3IHJhbmdlIHRvIHRoZSBsaXN0IG9mIHNlbGVjdCBvcHRpb25zIGZvciBhIGdpdmVuIHBhcmFtZXRlci5cblx0ICpcblx0ICogQHBhcmFtIHNQcm9wZXJ0eU5hbWUgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IGZvciB3aGljaCB0aGUgc2VsZWN0aW9uIHJhbmdlIGlzIGFkZGVkXG5cdCAqIEBwYXJhbSBzU2lnbiBUaGUgc2lnbiBvZiB0aGUgcmFuZ2UgKDxiPkk8L2I+bmNsdWRlIG9yIDxiPkU8L2I+eGNsdWRlKVxuXHQgKiBAcGFyYW0gc09wdGlvbiBUaGUgb3B0aW9uIG9mIHRoZSByYW5nZSAoPGI+RVE8L2I+IGZvciBcImVxdWFsc1wiLCA8Yj5ORTwvYj4gZm9yIFwibm90IGVxdWFsc1wiLFxuXHQgKiA8Yj5MRTwvYj4gZm9yIFwibGVzcyBvciBlcXVhbHNcIiwgPGI+R0U8L2I+IGZvciBcImdyZWF0ZXIgb3IgZXF1YWxzXCIsIDxiPkxUPC9iPiBmb3IgXCJsZXNzIHRoYW5cIiAoYW5kIG5vdCBlcXVhbHMpLFxuXHQgKiA8Yj5HVDwvYj4gZm9yIFwiZ3JlYXRlciB0aGFuXCIgKGFuZCBub3QgZXF1YWxzKSwgPGI+QlQ8L2I+IGZvciBcImJldHdlZW5cIiwgb3IgPGI+Q1A8L2I+IGZvciBcImNvbnRhaW5zIHBhdHRlcm5cIlxuXHQgKiAoQUJBUC1zdHlsZWQgcGF0dGVybiBtYXRjaGluZyB3aXRoIHRoZSBhc3RlcmlzayBhcyB3aWxkY2FyZClcblx0ICogQHBhcmFtIHNMb3cgVGhlIHNpbmdsZSB2YWx1ZSBvciB0aGUgbG93ZXIgYm91bmRhcnkgb2YgdGhlIGludGVydmFsOyB0aGUgPGNvZGU+bnVsbDwvY29kZT4gdmFsdWUgaXMgbm90IGFsbG93ZWRcblx0ICogQHBhcmFtIHNIaWdoIFNldCBvbmx5IGlmIHNPcHRpb24gaXMgPGI+QlQ8L2I+OiB0aGUgdXBwZXIgYm91bmRhcnkgb2YgdGhlIGludGVydmFsO1xuXHQgKiBAcGFyYW0gc1RleHQgVGV4dCByZXByZXNlbnRpbmcgdGhlIFNlbGVjdE9wdGlvbi4gVGhpcyBpcyBhbiBvcHRpb25hbCBwYXJhbWV0ZXIuIEZvciBhbiBleGFtcGxlIGluIG1vc3QgRmlvcmkgYXBwbGljYXRpb25zIGlmIHRoZSB0ZXh0IGlzIG5vdCBwcm92aWRlZCwgaXQgaXMgZmV0Y2hlZCBiYXNlZCBvbiB0aGUgSUQuXG5cdCAqIG11c3QgYmUgPGNvZGU+dW5kZWZpbmVkPC9jb2RlPiBvciA8Y29kZT5udWxsPC9jb2RlPiBpbiBhbGwgb3RoZXIgY2FzZXNcblx0ICogQHBhcmFtIHNlbWFudGljRGF0ZXMgT2JqZWN0IGNvbnRhaW5pbmcgc2VtYW50aWNEYXRlcyBmaWx0ZXIgaW5mb3JtYXRpb25cblx0ICogQHJldHVybnMgVGhpcyBpbnN0YW5jZSB0byBhbGxvdyBtZXRob2QgY2hhaW5pbmcuXG5cdCAqIEBwdWJsaWNcblx0ICogQHRocm93cyBBbiBpbnN0YW5jZSBvZiB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3J9IGluIGNhc2Ugb2YgaW5wdXQgZXJyb3JzLiBWYWxpZCBlcnJvciBjb2RlcyBhcmU6XG5cdCAqIDx0YWJsZT5cblx0ICogPHRyPjx0aD5OYXZFcnJvciBjb2RlPC90aD48dGg+RGVzY3JpcHRpb248L3RoPjwvdHI+XG5cdCAqIDx0cj48dGQ+U2VsZWN0aW9uVmFyaWFudC5JTlZBTElEX1NJR048L3RkPjx0ZD5JbmRpY2F0ZXMgdGhhdCB0aGUgJ3NpZ24nIGlzIGFuIGludmFsaWQgZXhwcmVzc2lvbjwvdGQ+PC90cj5cblx0ICogPHRyPjx0ZD5TZWxlY3Rpb25WYXJpYW50LklOVkFMSURfT1BUSU9OPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgdGhlIG9wdGlvbiBpcyBhbiBpbnZhbGlkIGV4cHJlc3Npb248L3RkPjwvdHI+XG5cdCAqIDx0cj48dGQ+U2VsZWN0aW9uVmFyaWFudC5ISUdIX1BST1ZJREVEX1RIT1VHSF9OT1RfQUxMT1dFRDwvdGQ+PHRkPkluZGljYXRlcyB0aGF0IHRoZSB1cHBlciBib3VuZGFyeSBoYXMgYmVlbiBzcGVjaWZpZWQsIGV2ZW4gdGhvdWdoIHRoZSBvcHRpb24gaXMgbm90ICdCVCc8L3RkPjwvdHI+XG5cdCAqIDx0cj48dGQ+U2VsZWN0aW9uVmFyaWFudC5JTlZBTElEX0lOUFVUX1RZUEU8L3RkPjx0ZD5JbmRpY2F0ZXMgdGhhdCBhbiBpbnB1dCBwYXJhbWV0ZXIgaGFzIGFuIGludmFsaWQgdHlwZSBvciB0aGUgdmFsdWUgaXMgc2V0IHRvIDxjb2RlPm51bGw8L2NvZGU+PC90ZD48L3RyPlxuXHQgKiA8dHI+PHRkPlNlbGVjdGlvblZhcmlhbnQuSU5WQUxJRF9QUk9QRVJUWV9OQU1FPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgdGhlIHByb3BlcnR5IG5hbWUgaXMgaW52YWxpZCwgZm9yIGV4YW1wbGUgaWYgaXQgaGFzIG5vdCBiZWVuIHNwZWNpZmllZDwvdGQ+PC90cj5cblx0ICogPHRyPjx0ZD5TZWxlY3Rpb25WYXJpYW50LlBBUkFNRVRFUl9TRUxPUFRfQ09MTElTSU9OPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgYW5vdGhlciBwYXJhbWV0ZXIgd2l0aCB0aGUgc2FtZSBuYW1lIGFzIHRoZSBwcm9wZXJ0eSBuYW1lIGFscmVhZHkgZXhpc3RzPC90ZD48L3RyPlxuXHQgKiA8L3RhYmxlPlxuXHQgKi9cblx0YWRkU2VsZWN0T3B0aW9uKFxuXHRcdHNQcm9wZXJ0eU5hbWU6IHN0cmluZyxcblx0XHRzU2lnbjogc3RyaW5nLFxuXHRcdHNPcHRpb246IHN0cmluZyxcblx0XHRzTG93OiBzdHJpbmcsXG5cdFx0c0hpZ2g/OiBzdHJpbmcgfCBudWxsLFxuXHRcdHNUZXh0Pzogc3RyaW5nLFxuXHRcdHNlbWFudGljRGF0ZXM/OiBTZW1hbnRpY0RhdGVDb25maWd1cmF0aW9uXG5cdCkge1xuXHRcdC8qIHtzdHJpbmd9IHNMb3cgVGhlIHNpbmdsZSB2YWx1ZSBvciB0aGUgbG93ZXIgYm91bmRhcnkgb2YgdGhlIGludGVydmFsOyB0aGUgPGNvZGU+bnVsbDwvY29kZT4gdmFsdWUgaXMgbm90IGFsbG93ZWRcblx0XHQgKiAoc2VlIHNwZWNpZmljYXRpb24gXCJTZWxlY3Rpb24gVmFyaWFudHMgZm9yIFVJIE5hdmlnYXRpb24gaW4gRmlvcmlcIiwgc2VjdGlvbiAyLjQuMi4xKVxuXHRcdCAqL1xuXHRcdGlmICh0eXBlb2Ygc1Byb3BlcnR5TmFtZSAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiU2VsZWN0aW9uVmFyaWFudC5JTlZBTElEX0lOUFVUX1RZUEVcIik7XG5cdFx0fVxuXHRcdGlmIChzUHJvcGVydHlOYW1lID09PSBcIlwiKSB7XG5cdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJTZWxlY3Rpb25WYXJpYW50LklOVkFMSURfUFJPUEVSVFlfTkFNRVwiKTtcblx0XHR9XG5cdFx0aWYgKHR5cGVvZiBzU2lnbiAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiU2VsZWN0aW9uVmFyaWFudC5JTlZBTElEX0lOUFVUX1RZUEVcIik7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2Ygc09wdGlvbiAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiU2VsZWN0aW9uVmFyaWFudC5JTlZBTElEX0lOUFVUX1RZUEVcIik7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2Ygc0xvdyAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiU2VsZWN0aW9uVmFyaWFudC5JTlZBTElEX0lOUFVUX1RZUEVcIik7XG5cdFx0fVxuXHRcdGlmIChzT3B0aW9uID09PSBcIkJUXCIgJiYgdHlwZW9mIHNIaWdoICE9PSBcInN0cmluZ1wiKSB7XG5cdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJTZWxlY3Rpb25WYXJpYW50LklOVkFMSURfSU5QVVRfVFlQRVwiKTtcblx0XHR9XG5cdFx0aWYgKCFWQUxJREFURV9TSUdOLnRlc3Qoc1NpZ24udG9VcHBlckNhc2UoKSkpIHtcblx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIlNlbGVjdGlvblZhcmlhbnQuSU5WQUxJRF9TSUdOXCIpO1xuXHRcdH1cblxuXHRcdGlmICghVkFMSURBVEVfT1BUSU9OLnRlc3Qoc09wdGlvbi50b1VwcGVyQ2FzZSgpKSkge1xuXHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiU2VsZWN0aW9uVmFyaWFudC5JTlZBTElEX09QVElPTlwiKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5wYXJhbWV0ZXJzW3NQcm9wZXJ0eU5hbWVdKSB7XG5cdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJTZWxlY3Rpb25WYXJpYW50LlBBUkFNRVRFUl9TRUxPUFRfQ09MTElTSU9OXCIpO1xuXHRcdH1cblxuXHRcdGlmIChzT3B0aW9uICE9PSBcIkJUXCIpIHtcblx0XHRcdC8vIG9ubHkgXCJCZXR3ZWVuXCIgaGFzIHR3byBwYXJhbWV0ZXJzOyBmb3IgYWxsIG90aGVycywgc0hpZ2ggbWF5IG5vdCBiZSBmaWxsZWRcblx0XHRcdGlmIChzSGlnaCAhPT0gdW5kZWZpbmVkICYmIHNIaWdoICE9PSBcIlwiICYmIHNIaWdoICE9PSBudWxsKSB7XG5cdFx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIlNlbGVjdGlvblZhcmlhbnQuSElHSF9QUk9WSURFRF9USE9VR0hfTk9UX0FMTE9XRURcIik7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gY2hlY2ssIGlmIHRoZXJlJ3MgYWxyZWFkeSBhbiBlbnRyeSBmb3IgdGhpcyBwcm9wZXJ0eVxuXHRcdGlmICh0aGlzLnNlbGVjdE9wdGlvbnNbc1Byb3BlcnR5TmFtZV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Ly8gaWYgbm90LCBjcmVhdGUgYSBuZXcgc2V0IG9mIGVudHJpZXNcblx0XHRcdHRoaXMuc2VsZWN0T3B0aW9uc1tzUHJvcGVydHlOYW1lXSA9IFtdO1xuXHRcdH1cblxuXHRcdGNvbnN0IG9FbnRyeTogU2VsZWN0T3B0aW9uID0ge1xuXHRcdFx0U2lnbjogc1NpZ24udG9VcHBlckNhc2UoKSxcblx0XHRcdE9wdGlvbjogc09wdGlvbi50b1VwcGVyQ2FzZSgpLFxuXHRcdFx0TG93OiBzTG93XG5cdFx0fTtcblxuXHRcdGlmIChzVGV4dCkge1xuXHRcdFx0Ly8gQWRkIFRleHQgcHJvcGVydHkgb25seSBpbiBjYXNlIGl0IGlzIHBhc3NlZCBieSB0aGUgY29uc3VtZXIgb2YgdGhlIEFQSS5cblx0XHRcdC8vIE90aGVyd2lzZSBrZWVwIHRoZSBzdHJ1Y3R1cmUgYXMgaXMuXG5cdFx0XHRvRW50cnkuVGV4dCA9IHNUZXh0O1xuXHRcdH1cblxuXHRcdGlmIChzT3B0aW9uID09PSBcIkJUXCIpIHtcblx0XHRcdG9FbnRyeS5IaWdoID0gc0hpZ2g7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9FbnRyeS5IaWdoID0gbnVsbDsgLy8gTm90ZSB0aGlzIHNwZWNpYWwgY2FzZSBpbiB0aGUgc3BlY2lmaWNhdGlvbiFcblx0XHRcdC8vIFRoZSBzcGVjaWZpY2F0aW9uIHJlcXVpcmVzIHRoYXQgdGhlIFwiSGlnaFwiIGF0dHJpYnV0ZSBpcyBhbHdheXNcblx0XHRcdC8vIGF2YWlsYWJsZS4gSW4gY2FzZSB0aGF0IG5vIGhpZ2ggdmFsdWUgaXMgbmVjZXNzYXJ5LCB5ZXQgdGhlIHZhbHVlXG5cdFx0XHQvLyBtYXkgbm90IGJlIGVtcHR5LCBidXQgbmVlZHMgdG8gYmUgc2V0IHRvIFwibnVsbFwiXG5cdFx0fVxuXG5cdFx0aWYgKHNlbWFudGljRGF0ZXMpIHtcblx0XHRcdC8vIEFkZCBTZW1hbnRpY0RhdGUgcHJvcGVydHkgb25seSBpbiBjYXNlIGl0IGlzIHBhc3NlZCwgT3RoZXJ3aXNlIGtlZXAgdGhlIHN0cnVjdHVyZSBhcyBpcy5cblx0XHRcdG9FbnRyeS5TZW1hbnRpY0RhdGVzID0gc2VtYW50aWNEYXRlcztcblx0XHR9XG5cblx0XHQvL2NoZWNrIGlmIGl0IGlzIG5lY2Vzc2FyeSB0byBhZGQgc2VsZWN0IG9wdGlvblxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zZWxlY3RPcHRpb25zW3NQcm9wZXJ0eU5hbWVdLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCBvRXhpc3RpbmdFbnRyeSA9IHRoaXMuc2VsZWN0T3B0aW9uc1tzUHJvcGVydHlOYW1lXVtpXTtcblx0XHRcdGlmIChcblx0XHRcdFx0b0V4aXN0aW5nRW50cnkuU2lnbiA9PT0gb0VudHJ5LlNpZ24gJiZcblx0XHRcdFx0b0V4aXN0aW5nRW50cnkuT3B0aW9uID09PSBvRW50cnkuT3B0aW9uICYmXG5cdFx0XHRcdG9FeGlzdGluZ0VudHJ5LkxvdyA9PT0gb0VudHJ5LkxvdyAmJlxuXHRcdFx0XHRvRXhpc3RpbmdFbnRyeS5IaWdoID09PSBvRW50cnkuSGlnaFxuXHRcdFx0KSB7XG5cdFx0XHRcdHJldHVybiB0aGlzO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLnNlbGVjdE9wdGlvbnNbc1Byb3BlcnR5TmFtZV0ucHVzaChvRW50cnkpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhIHNlbGVjdCBvcHRpb24gY2FsbGVkIDxjb2RlPnNOYW1lPC9jb2RlPiBmcm9tIHRoZSBzZWxlY3Rpb24gdmFyaWFudC5cblx0ICpcblx0ICogQHBhcmFtIHNOYW1lIFRoZSBuYW1lIG9mIHRoZSBzZWxlY3Qgb3B0aW9uIHRvIGJlIHJlbW92ZWRcblx0ICogQHJldHVybnMgVGhpcyBpbnN0YW5jZSB0byBhbGxvdyBtZXRob2QgY2hhaW5pbmcuXG5cdCAqIEBwdWJsaWNcblx0ICogQHRocm93cyBBbiBpbnN0YW5jZSBvZiB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3J9IGluIGNhc2Ugb2YgaW5wdXQgZXJyb3JzLiBWYWxpZCBlcnJvciBjb2RlcyBhcmU6XG5cdCAqIDx0YWJsZT5cblx0ICogPHRyPjx0aD5OYXZFcnJvciBjb2RlPC90aD48dGg+RGVzY3JpcHRpb248L3RoPjwvdHI+XG5cdCAqIDx0cj48dGQ+U2VsZWN0aW9uVmFyaWFudC5TRUxPUFRfV0lUSE9VVF9OQU1FPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgbmFtZSBvZiB0aGUgc2VsZWN0IG9wdGlvbiBoYXMgbm90IGJlZW4gc3BlY2lmaWVkPC90ZD48L3RyPlxuXHQgKiA8dHI+PHRkPlNlbGVjdGlvblZhcmlhbnQuU0VMT1BUX1dST05HX1RZUEU8L3RkPjx0ZD5JbmRpY2F0ZXMgdGhhdCB0aGUgbmFtZSBvZiB0aGUgcGFyYW1ldGVyIDxjb2RlPnNOYW1lPC9jb2RlPiBoYXMgYW4gaW52YWxpZCB0eXBlPC90ZD48L3RyPlxuXHQgKiA8L3RhYmxlPlxuXHQgKi9cblx0cmVtb3ZlU2VsZWN0T3B0aW9uKHNOYW1lOiBzdHJpbmcpIHtcblx0XHRpZiAodHlwZW9mIHNOYW1lICE9PSBcInN0cmluZ1wiKSB7XG5cdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJTZWxlY3Rpb25WYXJpYW50LlNFTE9QVF9XUk9OR19UWVBFXCIpO1xuXHRcdH1cblxuXHRcdGlmIChzTmFtZSA9PT0gXCJcIikge1xuXHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiU2VsZWN0aW9uVmFyaWFudC5TRUxPUFRfV0lUSE9VVF9OQU1FXCIpO1xuXHRcdH1cblxuXHRcdGRlbGV0ZSB0aGlzLnNlbGVjdE9wdGlvbnNbc05hbWVdO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmVuYW1lcyBhIHNlbGVjdCBvcHRpb24gY2FsbGVkIDxjb2RlPnNOYW1lT2xkPC9jb2RlPiB0byA8Y29kZT5zTmFtZU5ldzwvY29kZT4uIElmIGEgc2VsZWN0IG9wdGlvbiBvciBhIHBhcmFtZXRlclxuXHQgKiB3aXRoIHRoZSBuYW1lIDxjb2RlPnNOYW1lTmV3PC9jb2RlPiBhbHJlYWR5IGV4aXN0LCBhbiBlcnJvciBpcyB0aHJvd24uIElmIGEgc2VsZWN0IG9wdGlvbiB3aXRoIHRoZSBuYW1lIDxjb2RlPnNOYW1lT2xkPC9jb2RlPlxuXHQgKiBkb2VzIG5vdCBleGlzdCwgbm90aGluZyBpcyBjaGFuZ2VkLlxuXHQgKlxuXHQgKiBAcGFyYW0gc05hbWVPbGQgVGhlIGN1cnJlbnQgbmFtZSBvZiB0aGUgc2VsZWN0IG9wdGlvbiBwcm9wZXJ0eSB0byBiZSByZW5hbWVkXG5cdCAqIEBwYXJhbSBzTmFtZU5ldyBUaGUgbmV3IG5hbWUgb2YgdGhlIHNlbGVjdCBvcHRpb24gcHJvcGVydHlcblx0ICogQHJldHVybnMgVGhpcyBpbnN0YW5jZSB0byBhbGxvdyBtZXRob2QgY2hhaW5pbmdcblx0ICogQHB1YmxpY1xuXHQgKiBAdGhyb3dzIEFuIGluc3RhbmNlIG9mIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5OYXZFcnJvcn0gaW4gY2FzZSBvZiBpbnB1dCBlcnJvcnMuIFZhbGlkIGVycm9yIGNvZGVzIGFyZTpcblx0ICogPHRhYmxlPlxuXHQgKiA8dHI+PHRoPk5hdkVycm9yIGNvZGU8L3RoPjx0aD5EZXNjcmlwdGlvbjwvdGg+PC90cj5cblx0ICogPHRyPjx0ZD5TZWxlY3Rpb25WYXJpYW50LlNFTE9QVF9XSVRIT1VUX05BTUU8L3RkPjx0ZD5JbmRpY2F0ZXMgdGhhdCB0aGUgbmFtZSBvZiBhIHNlbGVjdCBvcHRpb24gaGFzIG5vdCBiZWVuIHNwZWNpZmllZDwvdGQ+PC90cj5cblx0ICogPHRyPjx0ZD5TZWxlY3Rpb25WYXJpYW50LlNFTE9QVF9XUk9OR19UWVBFPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgYSBzZWxlY3Qgb3B0aW9uIGhhcyBhbiBpbnZhbGlkIHR5cGU8L3RkPjwvdHI+XG5cdCAqIDx0cj48dGQ+U2VsZWN0aW9uVmFyaWFudC5QQVJBTUVURVJfU0VMT1BUX0NPTExJU0lPTjwvdGQ+PHRkPkluZGljYXRlcyB0aGF0IGFub3RoZXIgcGFyYW1ldGVyIHdpdGggdGhlIHNhbWUgbmV3IG5hbWUgYWxyZWFkeSBleGlzdHM8L3RkPjwvdHI+XG5cdCAqIDx0cj48dGQ+U2VsZWN0aW9uVmFyaWFudC5TRUxPUFRfQ09MTElTSU9OPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgYW5vdGhlciBzZWxlY3Qgb3B0aW9uIHdpdGggdGhlIHNhbWUgbmV3IG5hbWUgYWxyZWFkeSBleGlzdHM8L3RkPjwvdHI+XG5cdCAqIDwvdGFibGU+XG5cdCAqL1xuXHRyZW5hbWVTZWxlY3RPcHRpb24oc05hbWVPbGQ6IHN0cmluZywgc05hbWVOZXc6IHN0cmluZykge1xuXHRcdGlmICh0eXBlb2Ygc05hbWVPbGQgIT09IFwic3RyaW5nXCIgfHwgdHlwZW9mIHNOYW1lTmV3ICE9PSBcInN0cmluZ1wiKSB7XG5cdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJTZWxlY3Rpb25WYXJpYW50LlNFTE9QVF9XUk9OR19UWVBFXCIpO1xuXHRcdH1cblx0XHRpZiAoc05hbWVPbGQgPT09IFwiXCIgfHwgc05hbWVOZXcgPT09IFwiXCIpIHtcblx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIlNlbGVjdGlvblZhcmlhbnQuU0VMT1BUX1dJVEhPVVRfTkFNRVwiKTtcblx0XHR9XG5cdFx0aWYgKHRoaXMuc2VsZWN0T3B0aW9uc1tzTmFtZU9sZF0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0aWYgKHRoaXMuc2VsZWN0T3B0aW9uc1tzTmFtZU5ld10pIHtcblx0XHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiU2VsZWN0aW9uVmFyaWFudC5TRUxPUFRfQ09MTElTSU9OXCIpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMucGFyYW1ldGVyc1tzTmFtZU5ld10pIHtcblx0XHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiU2VsZWN0aW9uVmFyaWFudC5QQVJBTUVURVJfU0VMT1BUX0NPTExJU0lPTlwiKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuc2VsZWN0T3B0aW9uc1tzTmFtZU5ld10gPSB0aGlzLnNlbGVjdE9wdGlvbnNbc05hbWVPbGRdO1xuXHRcdFx0ZGVsZXRlIHRoaXMuc2VsZWN0T3B0aW9uc1tzTmFtZU9sZF07XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIHNldCBvZiBzZWxlY3Qgb3B0aW9ucy9yYW5nZXMgYXZhaWxhYmxlIGZvciBhIGdpdmVuIHByb3BlcnR5IG5hbWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBzUHJvcGVydHlOYW1lIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSBmb3Igd2hpY2ggdGhlIHNldCBvZiBzZWxlY3Qgb3B0aW9ucy9yYW5nZXMgaXMgcmV0dXJuZWRcblx0ICogQHJldHVybnMgSWYgPGNvZGU+c1Byb3BlcnR5TmFtZTwvY29kZT4gaXMgYW4gaW52YWxpZCBuYW1lIG9mIGEgcHJvcGVydHkgb3Igbm8gcmFuZ2UgZXhpc3RzLCA8Y29kZT51bmRlZmluZWQ8L2NvZGU+XG5cdCAqIGlzIHJldHVybmVkOyBvdGhlcndpc2UsIGFuIGltbXV0YWJsZSBhcnJheSBvZiByYW5nZXMgaXMgcmV0dXJuZWQuIEVhY2ggZW50cnkgb2YgdGhlIGFycmF5IGlzIGFuIG9iamVjdCB3aXRoIHRoZVxuXHQgKiBmb2xsb3dpbmcgcHJvcGVydGllczpcblx0ICogPHVsPlxuXHQgKiA8bGk+PGNvZGU+U2lnbjwvY29kZT46IFRoZSBzaWduIG9mIHRoZSByYW5nZTwvbGk+XG5cdCAqIDxsaT48Y29kZT5PcHRpb248L2NvZGU+OiBUaGUgb3B0aW9uIG9mIHRoZSByYW5nZTwvbGk+XG5cdCAqIDxsaT48Y29kZT5Mb3c8L2NvZGU+OiBUaGUgbG93IHZhbHVlIG9mIHRoZSByYW5nZTsgcmV0dXJuaW5nIHZhbHVlIDxjb2RlPm51bGw8L2NvZGU+IGlzIG5vdCBwb3NzaWJsZTwvbGk+XG5cdCAqIDxsaT48Y29kZT5IaWdoPC9jb2RlPjogVGhlIGhpZ2ggdmFsdWUgb2YgdGhlIHJhbmdlOyBpZiB0aGlzIHZhbHVlIGlzIG5vdCBuZWNlc3NhcnksIDxjb2RlPm51bGw8L2NvZGU+IGlzIHVzZWQ8L2xpPlxuXHQgKiA8L3VsPlxuXHQgKiBGb3IgZnVydGhlciBpbmZvcm1hdGlvbiBhYm91dCB0aGUgbWVhbmluZyBvZiB0aGUgYXR0cmlidXRlcywgcmVmZXIgdG8gbWV0aG9kIDxjb2RlPmFkZFNlbGVjdE9wdGlvbjwvY29kZT4uXG5cdCAqIEBwdWJsaWNcblx0ICogQHRocm93cyBBbiBpbnN0YW5jZSBvZiB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3J9IGluIGNhc2Ugb2YgaW5wdXQgZXJyb3JzLiBWYWxpZCBlcnJvciBjb2RlcyBhcmU6XG5cdCAqIDx0YWJsZT5cblx0ICogPHRyPjx0aD5OYXZFcnJvciBjb2RlPC90aD48dGg+RGVzY3JpcHRpb248L3RoPjwvdHI+XG5cdCAqIDx0cj48dGQ+U2VsZWN0aW9uVmFyaWFudC5JTlZBTElEX0lOUFVUX1RZUEU8L3RkPjx0ZD5JbmRpY2F0ZXMgdGhhdCBhbiBpbnB1dCBwYXJhbWV0ZXIgaGFzIGFuIGludmFsaWQgdHlwZTwvdGQ+PC90cj5cblx0ICogPHRyPjx0ZD5TZWxlY3Rpb25WYXJpYW50LklOVkFMSURfUFJPUEVSVFlfTkFNRTwvdGQ+PHRkPkluZGljYXRlcyB0aGF0IHRoZSBwcm9wZXJ0eSBuYW1lIGlzIGludmFsaWQsIGZvciBleGFtcGxlLCBpdCBoYXMgbm90IGJlZW4gc3BlY2lmaWVkPC90ZD48L3RyPlxuXHQgKiA8L3RhYmxlPlxuXHQgKi9cblx0Z2V0U2VsZWN0T3B0aW9uKHNQcm9wZXJ0eU5hbWU6IHN0cmluZyk6IFNlbGVjdE9wdGlvbltdIHwgdW5kZWZpbmVkIHtcblx0XHRpZiAodHlwZW9mIHNQcm9wZXJ0eU5hbWUgIT09IFwic3RyaW5nXCIpIHtcblx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIlNlbGVjdGlvblZhcmlhbnQuSU5WQUxJRF9JTlBVVF9UWVBFXCIpO1xuXHRcdH1cblx0XHRpZiAoc1Byb3BlcnR5TmFtZSA9PT0gXCJcIikge1xuXHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiU2VsZWN0aW9uVmFyaWFudC5JTlZBTElEX1BST1BFUlRZX05BTUVcIik7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgb0VudHJpZXMgPSB0aGlzLnNlbGVjdE9wdGlvbnNbc1Byb3BlcnR5TmFtZV07XG5cdFx0aWYgKCFvRW50cmllcykge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHRyZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvRW50cmllcykpOyAvLyBjcmVhdGUgYW4gaW1tdXRhYmxlIGNsb25lIG9mIGRhdGEgdG8gcHJldmVudCBvYmZ1c2NhdGlvbiBieSBjYWxsZXIuXG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgbmFtZXMgb2YgdGhlIHByb3BlcnRpZXMgYXZhaWxhYmxlIGZvciB0aGlzIGluc3RhbmNlLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgbGlzdCBvZiBwcm9wZXJ0eSBuYW1lcyBhdmFpbGFibGUgZm9yIHRoaXMgaW5zdGFuY2Vcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0Z2V0U2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMoKSB7XG5cdFx0cmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuc2VsZWN0T3B0aW9ucyk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgbmFtZXMgb2YgdGhlIHBhcmFtZXRlciBhbmQgc2VsZWN0IG9wdGlvbiBwcm9wZXJ0aWVzIGF2YWlsYWJsZSBmb3IgdGhpcyBpbnN0YW5jZS5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGxpc3Qgb2YgcGFyYW1ldGVyIGFuZCBzZWxlY3Qgb3B0aW9uIHByb3BlcnR5IG5hbWVzIGF2YWlsYWJsZSBmb3IgdGhpcyBpbnN0YW5jZVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRnZXRQcm9wZXJ0eU5hbWVzKCkge1xuXHRcdHJldHVybiB0aGlzLmdldFBhcmFtZXRlck5hbWVzKCkuY29uY2F0KHRoaXMuZ2V0U2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMoKSk7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhIHNldCBvZiBzZWxlY3Qgb3B0aW9ucyB0byB0aGUgbGlzdCBvZiBzZWxlY3Qgb3B0aW9ucyBmb3IgYSBnaXZlbiBwYXJhbWV0ZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBzUHJvcGVydHlOYW1lIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSBmb3Igd2hpY2ggdGhlIHNldCBvZiBzZWxlY3Qgb3B0aW9ucyBpcyBhZGRlZFxuXHQgKiBAcGFyYW0gYVNlbGVjdE9wdGlvbnMgU2V0IG9mIHNlbGVjdCBvcHRpb25zIHRvIGJlIGFkZGVkXG5cdCAqIEByZXR1cm5zIFRoaXMgaW5zdGFuY2UgdG8gYWxsb3cgbWV0aG9kIGNoYWluaW5nXG5cdCAqIEB0aHJvd3MgQW4gaW5zdGFuY2Ugb2Yge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdkVycm9yfSBpbiBjYXNlIG9mIGlucHV0IGVycm9ycy4gVmFsaWQgZXJyb3IgY29kZXMgYXJlOlxuXHQgKiA8dGFibGU+XG5cdCAqIDx0cj48dGg+TmF2RXJyb3IgY29kZTwvdGg+PHRoPkRlc2NyaXB0aW9uPC90aD48L3RyPlxuXHQgKiA8dHI+PHRkPlNlbGVjdGlvblZhcmlhbnQuSU5WQUxJRF9JTlBVVF9UWVBFPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgYW4gaW5wdXQgcGFyYW1ldGVyIGhhcyBhbiBpbnZhbGlkIHR5cGU8L3RkPjwvdHI+XG5cdCAqIDwvdGFibGU+XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdG1hc3NBZGRTZWxlY3RPcHRpb24oc1Byb3BlcnR5TmFtZTogc3RyaW5nLCBhU2VsZWN0T3B0aW9uczogU2VsZWN0T3B0aW9uW10pIHtcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkoYVNlbGVjdE9wdGlvbnMpKSB7XG5cdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJTZWxlY3Rpb25WYXJpYW50LklOVkFMSURfSU5QVVRfVFlQRVwiKTtcblx0XHR9XG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFTZWxlY3RPcHRpb25zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCBvU2VsZWN0T3B0aW9uID0gYVNlbGVjdE9wdGlvbnNbaV07XG5cdFx0XHR0aGlzLmFkZFNlbGVjdE9wdGlvbihcblx0XHRcdFx0c1Byb3BlcnR5TmFtZSxcblx0XHRcdFx0b1NlbGVjdE9wdGlvbi5TaWduLFxuXHRcdFx0XHRvU2VsZWN0T3B0aW9uLk9wdGlvbixcblx0XHRcdFx0b1NlbGVjdE9wdGlvbi5Mb3csXG5cdFx0XHRcdG9TZWxlY3RPcHRpb24uSGlnaCxcblx0XHRcdFx0b1NlbGVjdE9wdGlvbi5UZXh0LFxuXHRcdFx0XHRvU2VsZWN0T3B0aW9uLlNlbWFudGljRGF0ZXNcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogRmlyc3QgdHJpZXMgdG8gcmV0cmlldmUgdGhlIHNldCBvZiBzZWxlY3Qgb3B0aW9ucyBvciByYW5nZXMgYXZhaWxhYmxlIGZvciA8Y29kZT5zTmFtZTwvY29kZT4gYXMgdGhlIHByb3BlcnR5IG5hbWUuIElmIHN1Y2Nlc3NmdWwsXG5cdCAqIHRoaXMgYXJyYXkgb2Ygc2VsZWN0aW9ucyBpcyByZXR1cm5lZC4gSWYgaXQgZmFpbHMsIGFuIGF0dGVtcHQgdG8gZmluZCBhIHBhcmFtZXRlciB3aXRoIHRoZSBuYW1lIDxjb2RlPnNOYW1lPC9jb2RlPiBpcyB1c2VkLiBJZiB0aGUgbGF0dGVyIHN1Y2NlZWRzLCB0aGUgc2luZ2xlIHZhbHVlIGlzIGNvbnZlcnRlZCB0byBmaXQgaW50byBhbiBhcnJheSBvZiBzZWxlY3Rpb25zIHRvIG1ha2UgaXRcblx0ICogdHlwZSBjb21wYXRpYmxlIHdpdGggcmFuZ2VzLiBUaGlzIGFycmF5IGlzIHRoZW4gcmV0dXJuZWQuIDxiciAvPlxuXHQgKiBJZiBuZWl0aGVyIGEgc2VsZWN0IG9wdGlvbiBub3IgYSBwYXJhbWV0ZXIgY291bGQgYmUgZm91bmQsIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4gaXMgcmV0dXJuZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBzTmFtZSBUaGUgbmFtZSBvZiB0aGUgYXR0cmlidXRlIGZvciB3aGljaCB0aGUgdmFsdWUgaXMgcmV0cmlldmVkXG5cdCAqIEByZXR1cm5zIFRoZSByYW5nZXMgaW4gdGhlIHNlbGVjdCBvcHRpb25zIGZvciB0aGUgc3BlY2lmaWVkIHByb3BlcnR5IG9yIGEgcmFuZ2UtY29udmVydGVkIHJlcHJlc2VudGF0aW9uIG9mIGEgcGFyYW1ldGVyIGlzIHJldHVybmVkLlxuXHQgKiBJZiBib3RoIGxvb2t1cHMgZmFpbCwgPGNvZGU+dW5kZWZpbmVkPC9jb2RlPiBpcyByZXR1cm5lZC4gPGJyIC8+XG5cdCAqIFRoZSByZXR1cm5lZCByYW5nZXMgaGF2ZSB0aGUgZm9ybWF0OlxuXHQgKiA8dWw+XG5cdCAqIDxsaT48Y29kZT5TaWduPC9jb2RlPjogVGhlIHNpZ24gb2YgdGhlIHJhbmdlPC9saT5cblx0ICogPGxpPjxjb2RlPk9wdGlvbjwvY29kZT46IFRoZSBvcHRpb24gb2YgdGhlIHJhbmdlPC9saT5cblx0ICogPGxpPjxjb2RlPkxvdzwvY29kZT46IFRoZSBsb3cgdmFsdWUgb2YgdGhlIHJhbmdlOyByZXR1cm5pbmcgdGhlIHZhbHVlIDxjb2RlPm51bGw8L2NvZGU+IGlzIG5vdCBwb3NzaWJsZTwvbGk+XG5cdCAqIDxsaT48Y29kZT5IaWdoPC9jb2RlPjogVGhlIGhpZ2ggdmFsdWUgb2YgdGhlIHJhbmdlOyBpZiB0aGlzIHZhbHVlIGlzIG5vdCBuZWNlc3NhcnksIDxjb2RlPm51bGw8L2NvZGU+IChidXQgZG9lcyBleGlzdCk8L2xpPlxuXHQgKiA8L3VsPlxuXHQgKiBGb3IgZnVydGhlciBpbmZvcm1hdGlvbiBvbiB0aGUgbWVhbmluZyBvZiB0aGUgYXR0cmlidXRlcywgcmVmZXIgdG8gbWV0aG9kIHtAbGluayAjLmFkZFNlbGVjdE9wdGlvbiBhZGRTZWxlY3RPcHRpb259LlxuXHQgKiBAcHVibGljXG5cdCAqIEB0aHJvd3MgQW4gaW5zdGFuY2Ugb2Yge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdkVycm9yfSBpbiBjYXNlIG9mIGlucHV0IGVycm9ycy4gVmFsaWQgZXJyb3IgY29kZXMgYXJlOlxuXHQgKiA8dGFibGU+XG5cdCAqIDx0cj48dGg+TmF2RXJyb3IgY29kZTwvdGg+PHRoPkRlc2NyaXB0aW9uPC90aD48L3RyPlxuXHQgKiA8dHI+PHRkPlNlbGVjdGlvblZhcmlhbnQuSU5WQUxJRF9JTlBVVF9UWVBFPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgYW4gaW5wdXQgcGFyYW1ldGVyIGhhcyBhbiBpbnZhbGlkIHR5cGU8L3RkPjwvdHI+XG5cdCAqIDx0cj48dGQ+U2VsZWN0aW9uVmFyaWFudC5JTlZBTElEX1BST1BFUlRZX05BTUU8L3RkPjx0ZD5JbmRpY2F0ZXMgdGhhdCB0aGUgcHJvcGVydHkgbmFtZSBpcyBpbnZhbGlkLCBmb3IgZXhhbXBsZSwgaXQgaGFzIG5vdCBiZWVuIHNwZWNpZmllZDwvdGQ+PC90cj5cblx0ICogPC90YWJsZT5cblx0ICovXG5cdGdldFZhbHVlKHNOYW1lOiBzdHJpbmcpIHtcblx0XHRsZXQgYVZhbHVlID0gdGhpcy5nZXRTZWxlY3RPcHRpb24oc05hbWUpO1xuXHRcdGlmIChhVmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Ly8gYSByYW5nZSBmb3IgdGhlIHNlbGVjdGlvbiBvcHRpb24gaXMgcHJvdmlkZWQ7IHNvIHRoaXMgaXMgdGhlIGxlYWRpbmcgb25lXG5cdFx0XHRyZXR1cm4gYVZhbHVlO1xuXHRcdH1cblxuXHRcdGNvbnN0IHNQYXJhbVZhbHVlID0gdGhpcy5nZXRQYXJhbWV0ZXIoc05hbWUpO1xuXHRcdGlmIChzUGFyYW1WYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvLyBhIHBhcmFtZXRlciB2YWx1ZSBoYXMgYmVlbiBwcm92aWRlZDsgd2UgbmVlZCB0byBjb252ZXJ0IGl0IHRvIHRoZSByYW5nZSBmb3JtYXRcblx0XHRcdGFWYWx1ZSA9IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFNpZ246IFwiSVwiLFxuXHRcdFx0XHRcdE9wdGlvbjogXCJFUVwiLFxuXHRcdFx0XHRcdExvdzogc1BhcmFtVmFsdWUsXG5cdFx0XHRcdFx0SGlnaDogbnVsbFxuXHRcdFx0XHR9XG5cdFx0XHRdO1xuXHRcdFx0cmV0dXJuIGFWYWx1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgPGNvZGU+dHJ1ZTwvY29kZT4gaWYgdGhlIHNlbGVjdGlvbiB2YXJpYW50IGRvZXMgbmVpdGhlciBjb250YWluIHBhcmFtZXRlcnNcblx0ICogbm9yIHJhbmdlcy5cblx0ICpcblx0ICogQHJldHVybnMgSWYgc2V0IHRvIDxjb2RlPnRydWU8L2NvZGU+ICB0aGVyZSBhcmUgbm8gcGFyYW1ldGVycyBhbmQgbm8gc2VsZWN0IG9wdGlvbnMgYXZhaWxhYmxlIGluXG5cdCAqIHRoZSBzZWxlY3Rpb24gdmFyaWFudDsgPGNvZGU+ZmFsc2U8L2NvZGU+IG90aGVyd2lzZS5cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0aXNFbXB0eSgpIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRQYXJhbWV0ZXJOYW1lcygpLmxlbmd0aCA9PT0gMCAmJiB0aGlzLmdldFNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzKCkubGVuZ3RoID09PSAwO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGV4dGVybmFsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBzZWxlY3Rpb24gdmFyaWFudCBhcyBKU09OIG9iamVjdC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGV4dGVybmFsIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgaW5zdGFuY2UgYXMgYSBKU09OIG9iamVjdFxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHR0b0pTT05PYmplY3QoKSB7XG5cdFx0Y29uc3Qgb0V4dGVybmFsU2VsZWN0aW9uVmFyaWFudDogU2VyaWFsaXplZFNlbGVjdGlvblZhcmlhbnQgPSB7XG5cdFx0XHRWZXJzaW9uOiB7XG5cdFx0XHRcdC8vIFZlcnNpb24gYXR0cmlidXRlcyBhcmUgbm90IHBhcnQgb2YgdGhlIG9mZmljaWFsIHNwZWNpZmljYXRpb24sXG5cdFx0XHRcdE1ham9yOiBcIjFcIiwgLy8gYnV0IGNvdWxkIGJlIGhlbHBmdWwgbGF0ZXIgZm9yIGltcGxlbWVudGluZyBhIHByb3BlciBsaWZlY3ljbGUvaW50ZXJvcGVyYWJpbGl0eVxuXHRcdFx0XHRNaW5vcjogXCIwXCIsXG5cdFx0XHRcdFBhdGNoOiBcIjBcIlxuXHRcdFx0fSxcblx0XHRcdFNlbGVjdGlvblZhcmlhbnRJRDogdGhpcy5pZFxuXHRcdH07XG5cblx0XHRpZiAodGhpcy5wYXJhbWV0ZXJDdHhVcmwpIHtcblx0XHRcdG9FeHRlcm5hbFNlbGVjdGlvblZhcmlhbnQuUGFyYW1ldGVyQ29udGV4dFVybCA9IHRoaXMucGFyYW1ldGVyQ3R4VXJsO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLmZpbHRlckN0eFVybCkge1xuXHRcdFx0b0V4dGVybmFsU2VsZWN0aW9uVmFyaWFudC5GaWx0ZXJDb250ZXh0VXJsID0gdGhpcy5maWx0ZXJDdHhVcmw7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMudGV4dCkge1xuXHRcdFx0b0V4dGVybmFsU2VsZWN0aW9uVmFyaWFudC5UZXh0ID0gdGhpcy50ZXh0O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvRXh0ZXJuYWxTZWxlY3Rpb25WYXJpYW50LlRleHQgPSBcIlNlbGVjdGlvbiBWYXJpYW50IHdpdGggSUQgXCIgKyB0aGlzLmlkO1xuXHRcdH1cblxuXHRcdHRoaXMuZGV0ZXJtaW5lT0RhdGFGaWx0ZXJFeHByZXNzaW9uKG9FeHRlcm5hbFNlbGVjdGlvblZhcmlhbnQpO1xuXG5cdFx0dGhpcy5zZXJpYWxpemVQYXJhbWV0ZXJzKG9FeHRlcm5hbFNlbGVjdGlvblZhcmlhbnQpO1xuXHRcdHRoaXMuc2VyaWFsaXplU2VsZWN0T3B0aW9ucyhvRXh0ZXJuYWxTZWxlY3Rpb25WYXJpYW50KTtcblxuXHRcdHJldHVybiBvRXh0ZXJuYWxTZWxlY3Rpb25WYXJpYW50O1xuXHR9XG5cblx0LyoqXG5cdCAqIFNlcmlhbGl6ZXMgdGhpcyBpbnN0YW5jZSBpbnRvIGEgSlNPTi1mb3JtYXR0ZWQgc3RyaW5nLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgSlNPTi1mb3JtYXR0ZWQgcmVwcmVzZW50YXRpb24gb2YgdGhpcyBpbnN0YW5jZSBpbiBzdHJpbmdpZmllZCBmb3JtYXRcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0dG9KU09OU3RyaW5nKCkge1xuXHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLnRvSlNPTk9iamVjdCgpKTtcblx0fVxuXG5cdHByaXZhdGUgZGV0ZXJtaW5lT0RhdGFGaWx0ZXJFeHByZXNzaW9uKG9FeHRlcm5hbFNlbGVjdGlvblZhcmlhbnQ6IGFueSkge1xuXHRcdC8vIFRPRE8gLSBzcGVjaWZpY2F0aW9uIGRvZXMgbm90IGluZGljYXRlIHdoYXQgaXMgZXhwZWN0ZWQgaGVyZSBpbiBkZXRhaWxcblx0XHRvRXh0ZXJuYWxTZWxlY3Rpb25WYXJpYW50Lk9EYXRhRmlsdGVyRXhwcmVzc2lvbiA9IFwiXCI7IC8vIG5vdCBzdXBwb3J0ZWQgeWV0IC0gaXQncyBhbGxvd2VkIHRvIGJlIG9wdGlvbmFsXG5cdH1cblxuXHRwcml2YXRlIHNlcmlhbGl6ZVBhcmFtZXRlcnMob0V4dGVybmFsU2VsZWN0aW9uVmFyaWFudDogU2VyaWFsaXplZFNlbGVjdGlvblZhcmlhbnQpIHtcblx0XHQvLyBOb3RlOiBQYXJhbWV0ZXJzIHNlY3Rpb24gaXMgb3B0aW9uYWwgKHNlZSBzcGVjaWZpY2F0aW9uIHNlY3Rpb24gMi40LjIuMSlcblx0XHRvRXh0ZXJuYWxTZWxlY3Rpb25WYXJpYW50LlBhcmFtZXRlcnMgPSBbXTtcblx0XHRmb3IgKGNvbnN0IG5hbWUgaW4gdGhpcy5wYXJhbWV0ZXJzKSB7XG5cdFx0XHRvRXh0ZXJuYWxTZWxlY3Rpb25WYXJpYW50LlBhcmFtZXRlcnMucHVzaCh7XG5cdFx0XHRcdFByb3BlcnR5TmFtZTogbmFtZSxcblx0XHRcdFx0UHJvcGVydHlWYWx1ZTogdGhpcy5wYXJhbWV0ZXJzW25hbWVdXG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHNlcmlhbGl6ZVNlbGVjdE9wdGlvbnMob0V4dGVybmFsU2VsZWN0aW9uVmFyaWFudDogYW55KSB7XG5cdFx0aWYgKHRoaXMuc2VsZWN0T3B0aW9ucy5sZW5ndGggPT09IDApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRvRXh0ZXJuYWxTZWxlY3Rpb25WYXJpYW50LlNlbGVjdE9wdGlvbnMgPSBbXTtcblxuXHRcdGVhY2godGhpcy5zZWxlY3RPcHRpb25zLCBmdW5jdGlvbiAoc1Byb3BlcnR5TmFtZTogc3RyaW5nLCBhRW50cmllczogdW5rbm93bltdKSB7XG5cdFx0XHRjb25zdCBvU2VsZWN0T3B0aW9uID0ge1xuXHRcdFx0XHRQcm9wZXJ0eU5hbWU6IHNQcm9wZXJ0eU5hbWUsXG5cdFx0XHRcdFJhbmdlczogYUVudHJpZXNcblx0XHRcdH07XG5cblx0XHRcdG9FeHRlcm5hbFNlbGVjdGlvblZhcmlhbnQuU2VsZWN0T3B0aW9ucy5wdXNoKG9TZWxlY3RPcHRpb24pO1xuXHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSBwYXJzZUZyb21TdHJpbmcoc0pTT05TdHJpbmc6IHN0cmluZykge1xuXHRcdGlmIChzSlNPTlN0cmluZyA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJTZWxlY3Rpb25WYXJpYW50LlVOQUJMRV9UT19QQVJTRV9JTlBVVFwiKTtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIHNKU09OU3RyaW5nICE9PSBcInN0cmluZ1wiKSB7XG5cdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJTZWxlY3Rpb25WYXJpYW50LklOVkFMSURfSU5QVVRfVFlQRVwiKTtcblx0XHR9XG5cblx0XHRjb25zdCBvSW5wdXQgPSBKU09OLnBhcnNlKHNKU09OU3RyaW5nKTtcblx0XHQvLyB0aGUgaW5wdXQgbmVlZHMgdG8gYmUgYW4gSlNPTiBzdHJpbmcgYnkgc3BlY2lmaWNhdGlvblxuXG5cdFx0dGhpcy5wYXJzZUZyb21PYmplY3Qob0lucHV0KTtcblx0fVxuXG5cdHByaXZhdGUgcGFyc2VGcm9tT2JqZWN0KG9JbnB1dDogU2VyaWFsaXplZFNlbGVjdGlvblZhcmlhbnQpIHtcblx0XHRpZiAoIW9JbnB1dCkge1xuXHRcdFx0b0lucHV0ID0ge307XG5cdFx0fVxuXHRcdGlmIChvSW5wdXQuU2VsZWN0aW9uVmFyaWFudElEID09PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIERvIG5vdCB0aHJvdyBhbiBlcnJvciwgYnV0IG9ubHkgd3JpdGUgYSB3YXJuaW5nIGludG8gdGhlIGxvZy5cblx0XHRcdC8vIFRoZSBTZWxlY3Rpb25WYXJpYW50SUQgaXMgbWFuZGF0b3J5IGFjY29yZGluZyB0byB0aGUgc3BlY2lmaWNhdGlvbiBkb2N1bWVudCB2ZXJzaW9uIDEuMCxcblx0XHRcdC8vIGJ1dCB0aGlzIGRvY3VtZW50IGlzIG5vdCBhIHVuaXZlcnNhbGx5IHZhbGlkIHN0YW5kYXJkLlxuXHRcdFx0Ly8gSXQgaXMgc2FpZCB0aGF0IHRoZSBcImltcGxlbWVudGF0aW9uIG9mIHRoZSBTbWFydEZpbHRlckJhclwiIG1heSBzdXBlcnNlZGUgdGhlIHNwZWNpZmljYXRpb24uXG5cdFx0XHQvLyBUaHVzLCBhbHNvIGFsbG93IGFuIGluaXRpYWwgU2VsZWN0aW9uVmFyaWFudElELlxuXHRcdFx0Ly9cdFx0dGhyb3cgbmV3IHNhcC5mZS5uYXZpZ2F0aW9uLk5hdkVycm9yKFwiU2VsZWN0aW9uVmFyaWFudC5JTlBVVF9ET0VTX05PVF9DT05UQUlOX1NFTEVDVElPTlZBUklBTlRfSURcIik7XG5cdFx0XHRMb2cud2FybmluZyhcIlNlbGVjdGlvblZhcmlhbnRJRCBpcyBub3QgZGVmaW5lZFwiKTtcblx0XHRcdG9JbnB1dC5TZWxlY3Rpb25WYXJpYW50SUQgPSBcIlwiO1xuXHRcdH1cblxuXHRcdHRoaXMuc2V0SUQob0lucHV0LlNlbGVjdGlvblZhcmlhbnRJRCk7XG5cblx0XHRpZiAob0lucHV0LlBhcmFtZXRlckNvbnRleHRVcmwgIT09IHVuZGVmaW5lZCAmJiBvSW5wdXQuUGFyYW1ldGVyQ29udGV4dFVybCAhPT0gXCJcIikge1xuXHRcdFx0dGhpcy5zZXRQYXJhbWV0ZXJDb250ZXh0VXJsKG9JbnB1dC5QYXJhbWV0ZXJDb250ZXh0VXJsKTtcblx0XHR9XG5cblx0XHRpZiAob0lucHV0LkZpbHRlckNvbnRleHRVcmwgIT09IHVuZGVmaW5lZCAmJiBvSW5wdXQuRmlsdGVyQ29udGV4dFVybCAhPT0gXCJcIikge1xuXHRcdFx0dGhpcy5zZXRGaWx0ZXJDb250ZXh0VXJsKG9JbnB1dC5GaWx0ZXJDb250ZXh0VXJsKTtcblx0XHR9XG5cblx0XHRpZiAob0lucHV0LlRleHQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5zZXRUZXh0KG9JbnB1dC5UZXh0KTtcblx0XHR9XG5cblx0XHQvLyBub3RlIHRoYXQgT0RhdGFGaWx0ZXJFeHByZXNzaW9uIGlzIGlnbm9yZWQgcmlnaHQgbm93IC0gbm90IHN1cHBvcnRlZCB5ZXQhXG5cblx0XHRpZiAob0lucHV0LlBhcmFtZXRlcnMpIHtcblx0XHRcdHRoaXMucGFyc2VGcm9tU3RyaW5nUGFyYW1ldGVycyhvSW5wdXQuUGFyYW1ldGVycyk7XG5cdFx0fVxuXG5cdFx0aWYgKG9JbnB1dC5TZWxlY3RPcHRpb25zKSB7XG5cdFx0XHR0aGlzLnBhcnNlRnJvbVN0cmluZ1NlbGVjdE9wdGlvbnMob0lucHV0LlNlbGVjdE9wdGlvbnMpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcGFyc2VGcm9tU3RyaW5nUGFyYW1ldGVycyhwYXJhbWV0ZXJzOiBTZXJpYWxpemVkUGFyYW1ldGVyW10pIHtcblx0XHRmb3IgKGNvbnN0IHBhcmFtZXRlciBvZiBwYXJhbWV0ZXJzKSB7XG5cdFx0XHR0aGlzLmFkZFBhcmFtZXRlcihwYXJhbWV0ZXIuUHJvcGVydHlOYW1lLCBwYXJhbWV0ZXIuUHJvcGVydHlWYWx1ZSk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBwYXJzZUZyb21TdHJpbmdTZWxlY3RPcHRpb25zKHNlbGVjdE9wdGlvbnM6IFNlcmlhbGl6ZWRTZWxlY3RPcHRpb25bXSkge1xuXHRcdGZvciAoY29uc3Qgb3B0aW9uIG9mIHNlbGVjdE9wdGlvbnMpIHtcblx0XHRcdGlmIChvcHRpb24uUmFuZ2VzKSB7XG5cdFx0XHRcdGlmICghQXJyYXkuaXNBcnJheShvcHRpb24uUmFuZ2VzKSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIlNlbGVjdGlvblZhcmlhbnQuU0VMRUNUX09QVElPTl9SQU5HRVNfTk9UX0FSUkFZXCIpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Zm9yIChjb25zdCByYW5nZSBvZiBvcHRpb24uUmFuZ2VzKSB7XG5cdFx0XHRcdFx0dGhpcy5hZGRTZWxlY3RPcHRpb24oXG5cdFx0XHRcdFx0XHRvcHRpb24uUHJvcGVydHlOYW1lLFxuXHRcdFx0XHRcdFx0cmFuZ2UuU2lnbixcblx0XHRcdFx0XHRcdHJhbmdlLk9wdGlvbixcblx0XHRcdFx0XHRcdHJhbmdlLkxvdyxcblx0XHRcdFx0XHRcdHJhbmdlLkhpZ2gsXG5cdFx0XHRcdFx0XHRyYW5nZS5UZXh0LFxuXHRcdFx0XHRcdFx0cmFuZ2UuU2VtYW50aWNEYXRlc1xuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdExvZy53YXJuaW5nKFwiU2VsZWN0IE9wdGlvbiBvYmplY3QgZG9lcyBub3QgY29udGFpbiBhIFJhbmdlcyBlbnRyeTsgaWdub3JpbmcgZW50cnlcIik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbi8vIEV4cG9ydGluZyB0aGUgY2xhc3MgYXMgcHJvcGVybHkgdHlwZWQgVUk1Q2xhc3NcbmNvbnN0IFVJNUNsYXNzID0gQmFzZU9iamVjdC5leHRlbmQoXCJzYXAuZmUubmF2aWdhdGlvbi5TZWxlY3Rpb25WYXJpYW50XCIsIFNlbGVjdGlvblZhcmlhbnQucHJvdG90eXBlIGFzIGFueSkgYXMgdHlwZW9mIFNlbGVjdGlvblZhcmlhbnQ7XG50eXBlIFVJNUNsYXNzID0gSW5zdGFuY2VUeXBlPHR5cGVvZiBTZWxlY3Rpb25WYXJpYW50PjtcbmV4cG9ydCBkZWZhdWx0IFVJNUNsYXNzO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7O0VBbUVBLE1BQU1BLGFBQWEsR0FBRyxJQUFJQyxNQUFNLENBQUMsT0FBTyxDQUFDO0VBQ3pDLE1BQU1DLGVB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