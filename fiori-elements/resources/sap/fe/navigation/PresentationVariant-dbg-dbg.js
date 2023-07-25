/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/ui/base/Object", "./NavError"], function (Log, BaseObject, NavError) {
  "use strict";

  var _exports = {};
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  /**
   * This is the successor of {@link sap.ui.generic.app.navigation.service.PresentationVariant}.<br> Creates a new instance of a PresentationVariant class. If no parameter is passed, an new empty instance is created whose ID has been set to <code>""</code>. Passing a JSON-serialized string complying to the Selection Variant Specification will parse it, and the newly created instance will contain the same information.
   *
   * @public
   * @name sap.fe.navigation.PresentationVariant
   * @class This is the successor of {@link sap.ui.generic.app.navigation.service.PresentationVariant}.
   * @extends sap.ui.base.Object
   * @since 1.83.0
   */
  let PresentationVariant = /*#__PURE__*/function (_BaseObject) {
    _inheritsLoose(PresentationVariant, _BaseObject);
    /**
     * If no parameter is passed, a new empty instance is created whose ID has been set to <code>""</code>.
     * Passing a JSON-serialized string complying to the Selection Variant Specification will parse it,
     * and the newly created instance will contain the same information.
     *
     * @param presentationVariant If of type <code>string</code>, the selection variant is JSON-formatted;
     * if of type <code>object</code>, the object represents a selection variant
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
     * <table>
     * <tr><th>NavError code</th><th>Description</th></tr>
     * <tr><td>PresentationVariant.INVALID_INPUT_TYPE</td><td>Indicates that the data format of the selection variant provided is inconsistent</td></tr>
     * <tr><td>PresentationVariant.UNABLE_TO_PARSE_INPUT</td><td>Indicates that the provided string is not a JSON-formatted string</td></tr>
     * <tr><td>PresentationVariant.INPUT_DOES_NOT_CONTAIN_SELECTIONVARIANT_ID</td><td>Indicates that the PresentationVariantID cannot be retrieved</td></tr>
     * <tr><td>PresentationVariant.PARAMETER_WITHOUT_VALUE</td><td>Indicates that there was an attempt to specify a parameter, but without providing any value (not even an empty value)</td></tr>
     * <tr><td>PresentationVariant.SELECT_OPTION_WITHOUT_PROPERTY_NAME</td><td>Indicates that a selection option has been defined, but the Ranges definition is missing</td></tr>
     * <tr><td>PresentationVariant.SELECT_OPTION_RANGES_NOT_ARRAY</td><td>Indicates that the Ranges definition is not an array</td></tr>
     * </table>
     * These exceptions can only be thrown if the parameter <code>vPresentationVariant</code> has been provided.
     */
    function PresentationVariant(presentationVariant) {
      var _this;
      _this = _BaseObject.call(this) || this;
      _this.id = "";
      if (presentationVariant !== undefined) {
        if (typeof presentationVariant === "string") {
          _this.parseFromString(presentationVariant);
        } else if (typeof presentationVariant === "object") {
          _this.parseFromObject(presentationVariant);
        } else {
          throw new NavError("PresentationVariant.INVALID_INPUT_TYPE");
        }
      }
      return _this;
    }

    /**
     * Returns the identification of the selection variant.
     *
     * @returns The identification of the selection variant as made available during construction
     * @public
     */
    _exports.PresentationVariant = PresentationVariant;
    var _proto = PresentationVariant.prototype;
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
     * Sets the context URL.
     *
     * @param url The URL of the context
     * @public
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
     * <table>
     * <tr><th>NavError code</th><th>Description</th></tr>
     * <tr><td>PresentationVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
     * </table>
     */;
    _proto.setContextUrl = function setContextUrl(url) {
      if (typeof url !== "string") {
        throw new NavError("PresentationVariant.INVALID_INPUT_TYPE");
      }
      this.ctxUrl = url;
    }

    /**
     * Gets the current context URL intended for the query.
     *
     * @returns The current context URL for the query
     * @public
     */;
    _proto.getContextUrl = function getContextUrl() {
      return this.ctxUrl;
    }

    /**
     * Returns <code>true</code> if the presentation variant does not contain any properties.
     * nor ranges.
     *
     * @returns If set to <code>true</code> there are no current properties set; <code>false</code> otherwise.
     * @public
     */;
    _proto.isEmpty = function isEmpty() {
      return Object.keys(this.getTableVisualization() ?? {}).length === 0 && Object.keys(this.getChartVisualization() ?? {}).length === 0 && Object.keys(this.getProperties() ?? {}).length === 0;
    }

    /**
     * Sets the more trivial properties. Basically all properties with the exception of the Visualization.
     *
     * @param properties The properties to be used.
     * @public
     */;
    _proto.setProperties = function setProperties(properties) {
      this.properties = Object.assign({}, properties);
    }

    /**
     * Gets the more trivial properties. Basically all properties with the exception of the Visualization.
     *
     * @returns The current properties.
     * @public
     */;
    _proto.getProperties = function getProperties() {
      return this.properties;
    }

    /**
     * Sets the table visualization property.
     *
     * @param properties An object containing the properties to be used for the table visualization.
     * @public
     */;
    _proto.setTableVisualization = function setTableVisualization(properties) {
      this.visTable = Object.assign({}, properties);
    }

    /**
     * Gets the table visualization property.
     *
     * @returns An object containing the properties to be used for the table visualization.
     * @public
     */;
    _proto.getTableVisualization = function getTableVisualization() {
      return this.visTable;
    }

    /**
     * Sets the chart visualization property.
     *
     * @param properties An object containing the properties to be used for the chart visualization.
     * @public
     */;
    _proto.setChartVisualization = function setChartVisualization(properties) {
      this.visChart = Object.assign({}, properties);
    }

    /**
     * Gets the chart visualization property.
     *
     * @returns An object containing the properties to be used for the chart visualization.
     * @public
     */;
    _proto.getChartVisualization = function getChartVisualization() {
      return this.visChart;
    }

    /**
     * Returns the external representation of the selection variant as JSON object.
     *
     * @returns The external representation of this instance as a JSON object
     * @public
     */;
    _proto.toJSONObject = function toJSONObject() {
      const externalPresentationVariant = {
        Version: {
          // Version attributes are not part of the official specification,
          Major: "1",
          // but could be helpful later for implementing a proper lifecycle/interoperability
          Minor: "0",
          Patch: "0"
        },
        PresentationVariantID: this.id
      };
      if (this.ctxUrl) {
        externalPresentationVariant.ContextUrl = this.ctxUrl;
      }
      if (this.text) {
        externalPresentationVariant.Text = this.text;
      } else {
        externalPresentationVariant.Text = "Presentation Variant with ID " + this.id;
      }
      this.serializeProperties(externalPresentationVariant);
      this.serializeVisualizations(externalPresentationVariant);
      return externalPresentationVariant;
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
    _proto.serializeProperties = function serializeProperties(externalPresentationVariant) {
      if (this.properties) {
        Object.assign(externalPresentationVariant, this.properties);
      }
    };
    _proto.serializeVisualizations = function serializeVisualizations(externalPresentationVariant) {
      if (this.visTable) {
        if (!externalPresentationVariant.Visualizations) {
          externalPresentationVariant.Visualizations = [];
        }
        externalPresentationVariant.Visualizations.push(this.visTable);
      }
      if (this.visChart) {
        if (!externalPresentationVariant.Visualizations) {
          externalPresentationVariant.Visualizations = [];
        }
        externalPresentationVariant.Visualizations.push(this.visChart);
      }
    };
    _proto.parseFromString = function parseFromString(jsonString) {
      if (jsonString === undefined) {
        throw new NavError("PresentationVariant.UNABLE_TO_PARSE_INPUT");
      }
      if (typeof jsonString !== "string") {
        throw new NavError("PresentationVariant.INVALID_INPUT_TYPE");
      }
      this.parseFromObject(JSON.parse(jsonString));
    };
    _proto.parseFromObject = function parseFromObject(input) {
      if (input.PresentationVariantID === undefined) {
        // Do not throw an error, but only write a warning into the log.
        // The PresentationVariantID is mandatory according to the specification document version 1.0,
        // but this document is not a universally valid standard.
        // It is said that the "implementation of the SmartFilterBar" may supersede the specification.
        // Thus, also allow an initial PresentationVariantID.
        //		throw new sap.fe.navigation.NavError("PresentationVariant.INPUT_DOES_NOT_CONTAIN_SELECTIONVARIANT_ID");
        Log.warning("PresentationVariantID is not defined");
        input.PresentationVariantID = "";
      }
      const inputCopy = Object.assign({}, input);
      delete inputCopy.Version;
      this.setID(input.PresentationVariantID);
      delete inputCopy.PresentationVariantID;
      if (input.ContextUrl !== undefined && input.ContextUrl !== "") {
        this.setContextUrl(input.ContextUrl);
        delete input.ContextUrl;
      }
      if (input.Text !== undefined) {
        this.setText(input.Text);
        delete input.Text;
      }
      if (input.Visualizations) {
        this.parseVisualizations(input.Visualizations);
        delete inputCopy.Visualizations;
      }
      this.setProperties(inputCopy);
    };
    _proto.parseVisualizations = function parseVisualizations(visualizations) {
      if (!Array.isArray(visualizations)) {
        throw new NavError("PresentationVariant.INVALID_INPUT_TYPE");
      }
      for (const visualization of visualizations) {
        if (visualization !== null && visualization !== void 0 && visualization.Type && visualization.Type.indexOf("Chart") >= 0) {
          this.setChartVisualization(visualization);
        } else {
          this.setTableVisualization(visualization);
        }
      }
    };
    return PresentationVariant;
  }(BaseObject); // Exporting the class as properly typed UI5Class
  _exports.PresentationVariant = PresentationVariant;
  const UI5Class = BaseObject.extend("sap.fe.navigation.PresentationVariant", PresentationVariant.prototype);
  return UI5Class;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcmVzZW50YXRpb25WYXJpYW50IiwicHJlc2VudGF0aW9uVmFyaWFudCIsImlkIiwidW5kZWZpbmVkIiwicGFyc2VGcm9tU3RyaW5nIiwicGFyc2VGcm9tT2JqZWN0IiwiTmF2RXJyb3IiLCJnZXRJRCIsInNldElEIiwic2V0VGV4dCIsIm5ld1RleHQiLCJ0ZXh0IiwiZ2V0VGV4dCIsInNldENvbnRleHRVcmwiLCJ1cmwiLCJjdHhVcmwiLCJnZXRDb250ZXh0VXJsIiwiaXNFbXB0eSIsIk9iamVjdCIsImtleXMiLCJnZXRUYWJsZVZpc3VhbGl6YXRpb24iLCJsZW5ndGgiLCJnZXRDaGFydFZpc3VhbGl6YXRpb24iLCJnZXRQcm9wZXJ0aWVzIiwic2V0UHJvcGVydGllcyIsInByb3BlcnRpZXMiLCJhc3NpZ24iLCJzZXRUYWJsZVZpc3VhbGl6YXRpb24iLCJ2aXNUYWJsZSIsInNldENoYXJ0VmlzdWFsaXphdGlvbiIsInZpc0NoYXJ0IiwidG9KU09OT2JqZWN0IiwiZXh0ZXJuYWxQcmVzZW50YXRpb25WYXJpYW50IiwiVmVyc2lvbiIsIk1ham9yIiwiTWlub3IiLCJQYXRjaCIsIlByZXNlbnRhdGlvblZhcmlhbnRJRCIsIkNvbnRleHRVcmwiLCJUZXh0Iiwic2VyaWFsaXplUHJvcGVydGllcyIsInNlcmlhbGl6ZVZpc3VhbGl6YXRpb25zIiwidG9KU09OU3RyaW5nIiwiSlNPTiIsInN0cmluZ2lmeSIsIlZpc3VhbGl6YXRpb25zIiwicHVzaCIsImpzb25TdHJpbmciLCJwYXJzZSIsImlucHV0IiwiTG9nIiwid2FybmluZyIsImlucHV0Q29weSIsInBhcnNlVmlzdWFsaXphdGlvbnMiLCJ2aXN1YWxpemF0aW9ucyIsIkFycmF5IiwiaXNBcnJheSIsInZpc3VhbGl6YXRpb24iLCJUeXBlIiwiaW5kZXhPZiIsIkJhc2VPYmplY3QiLCJVSTVDbGFzcyIsImV4dGVuZCIsInByb3RvdHlwZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiUHJlc2VudGF0aW9uVmFyaWFudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBCYXNlT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9PYmplY3RcIjtcbmltcG9ydCBOYXZFcnJvciBmcm9tIFwiLi9OYXZFcnJvclwiO1xuXG4vKipcbiAqIFN0cnVjdHVyZSBvZiBhIHZpc3VhbGl6YXRpb24gb2JqZWN0LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFZpc3VhbGl6YXRpb24ge1xuXHRba2V5OiBzdHJpbmddOiB1bmtub3duO1xuXHRUeXBlPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFN0cnVjdHVyZSBvZiB0aGUgZXh0ZXJuYWwgcGxhaW4gb2JqZWN0IHJlcHJlc2VudGF0aW9uIG9mIGEgUHJlc2VudGF0aW9uVmFyaWFudFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEV4dGVybmFsUHJlc2VudGF0aW9uVmFyaWFudCB7XG5cdFtrZXk6IHN0cmluZ106IHVua25vd247XG5cdFByZXNlbnRhdGlvblZhcmlhbnRJRDogc3RyaW5nO1xuXHRWZXJzaW9uPzoge1xuXHRcdE1ham9yOiBzdHJpbmc7XG5cdFx0TWlub3I6IHN0cmluZztcblx0XHRQYXRjaDogc3RyaW5nO1xuXHR9O1xuXHRUZXh0Pzogc3RyaW5nO1xuXHRDb250ZXh0VXJsPzogc3RyaW5nO1xuXHRWaXN1YWxpemF0aW9ucz86IFZpc3VhbGl6YXRpb25bXTtcbn1cblxuLyoqXG4gKiBUaGlzIGlzIHRoZSBzdWNjZXNzb3Igb2Yge0BsaW5rIHNhcC51aS5nZW5lcmljLmFwcC5uYXZpZ2F0aW9uLnNlcnZpY2UuUHJlc2VudGF0aW9uVmFyaWFudH0uPGJyPiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIGEgUHJlc2VudGF0aW9uVmFyaWFudCBjbGFzcy4gSWYgbm8gcGFyYW1ldGVyIGlzIHBhc3NlZCwgYW4gbmV3IGVtcHR5IGluc3RhbmNlIGlzIGNyZWF0ZWQgd2hvc2UgSUQgaGFzIGJlZW4gc2V0IHRvIDxjb2RlPlwiXCI8L2NvZGU+LiBQYXNzaW5nIGEgSlNPTi1zZXJpYWxpemVkIHN0cmluZyBjb21wbHlpbmcgdG8gdGhlIFNlbGVjdGlvbiBWYXJpYW50IFNwZWNpZmljYXRpb24gd2lsbCBwYXJzZSBpdCwgYW5kIHRoZSBuZXdseSBjcmVhdGVkIGluc3RhbmNlIHdpbGwgY29udGFpbiB0aGUgc2FtZSBpbmZvcm1hdGlvbi5cbiAqXG4gKiBAcHVibGljXG4gKiBAbmFtZSBzYXAuZmUubmF2aWdhdGlvbi5QcmVzZW50YXRpb25WYXJpYW50XG4gKiBAY2xhc3MgVGhpcyBpcyB0aGUgc3VjY2Vzc29yIG9mIHtAbGluayBzYXAudWkuZ2VuZXJpYy5hcHAubmF2aWdhdGlvbi5zZXJ2aWNlLlByZXNlbnRhdGlvblZhcmlhbnR9LlxuICogQGV4dGVuZHMgc2FwLnVpLmJhc2UuT2JqZWN0XG4gKiBAc2luY2UgMS44My4wXG4gKi9cbmV4cG9ydCBjbGFzcyBQcmVzZW50YXRpb25WYXJpYW50IGV4dGVuZHMgQmFzZU9iamVjdCB7XG5cdHByaXZhdGUgaWQ6IHN0cmluZztcblxuXHRwcml2YXRlIHRleHQ/OiBzdHJpbmc7XG5cblx0cHJpdmF0ZSBjdHhVcmw/OiBzdHJpbmc7XG5cblx0cHJpdmF0ZSBwcm9wZXJ0aWVzPzogb2JqZWN0O1xuXG5cdHByaXZhdGUgdmlzVGFibGU/OiBWaXN1YWxpemF0aW9uO1xuXG5cdHByaXZhdGUgdmlzQ2hhcnQ/OiBWaXN1YWxpemF0aW9uO1xuXG5cdC8qKlxuXHQgKiBJZiBubyBwYXJhbWV0ZXIgaXMgcGFzc2VkLCBhIG5ldyBlbXB0eSBpbnN0YW5jZSBpcyBjcmVhdGVkIHdob3NlIElEIGhhcyBiZWVuIHNldCB0byA8Y29kZT5cIlwiPC9jb2RlPi5cblx0ICogUGFzc2luZyBhIEpTT04tc2VyaWFsaXplZCBzdHJpbmcgY29tcGx5aW5nIHRvIHRoZSBTZWxlY3Rpb24gVmFyaWFudCBTcGVjaWZpY2F0aW9uIHdpbGwgcGFyc2UgaXQsXG5cdCAqIGFuZCB0aGUgbmV3bHkgY3JlYXRlZCBpbnN0YW5jZSB3aWxsIGNvbnRhaW4gdGhlIHNhbWUgaW5mb3JtYXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBwcmVzZW50YXRpb25WYXJpYW50IElmIG9mIHR5cGUgPGNvZGU+c3RyaW5nPC9jb2RlPiwgdGhlIHNlbGVjdGlvbiB2YXJpYW50IGlzIEpTT04tZm9ybWF0dGVkO1xuXHQgKiBpZiBvZiB0eXBlIDxjb2RlPm9iamVjdDwvY29kZT4sIHRoZSBvYmplY3QgcmVwcmVzZW50cyBhIHNlbGVjdGlvbiB2YXJpYW50XG5cdCAqIEB0aHJvd3MgQW4gaW5zdGFuY2Ugb2Yge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdkVycm9yfSBpbiBjYXNlIG9mIGlucHV0IGVycm9ycy4gVmFsaWQgZXJyb3IgY29kZXMgYXJlOlxuXHQgKiA8dGFibGU+XG5cdCAqIDx0cj48dGg+TmF2RXJyb3IgY29kZTwvdGg+PHRoPkRlc2NyaXB0aW9uPC90aD48L3RyPlxuXHQgKiA8dHI+PHRkPlByZXNlbnRhdGlvblZhcmlhbnQuSU5WQUxJRF9JTlBVVF9UWVBFPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgdGhlIGRhdGEgZm9ybWF0IG9mIHRoZSBzZWxlY3Rpb24gdmFyaWFudCBwcm92aWRlZCBpcyBpbmNvbnNpc3RlbnQ8L3RkPjwvdHI+XG5cdCAqIDx0cj48dGQ+UHJlc2VudGF0aW9uVmFyaWFudC5VTkFCTEVfVE9fUEFSU0VfSU5QVVQ8L3RkPjx0ZD5JbmRpY2F0ZXMgdGhhdCB0aGUgcHJvdmlkZWQgc3RyaW5nIGlzIG5vdCBhIEpTT04tZm9ybWF0dGVkIHN0cmluZzwvdGQ+PC90cj5cblx0ICogPHRyPjx0ZD5QcmVzZW50YXRpb25WYXJpYW50LklOUFVUX0RPRVNfTk9UX0NPTlRBSU5fU0VMRUNUSU9OVkFSSUFOVF9JRDwvdGQ+PHRkPkluZGljYXRlcyB0aGF0IHRoZSBQcmVzZW50YXRpb25WYXJpYW50SUQgY2Fubm90IGJlIHJldHJpZXZlZDwvdGQ+PC90cj5cblx0ICogPHRyPjx0ZD5QcmVzZW50YXRpb25WYXJpYW50LlBBUkFNRVRFUl9XSVRIT1VUX1ZBTFVFPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgdGhlcmUgd2FzIGFuIGF0dGVtcHQgdG8gc3BlY2lmeSBhIHBhcmFtZXRlciwgYnV0IHdpdGhvdXQgcHJvdmlkaW5nIGFueSB2YWx1ZSAobm90IGV2ZW4gYW4gZW1wdHkgdmFsdWUpPC90ZD48L3RyPlxuXHQgKiA8dHI+PHRkPlByZXNlbnRhdGlvblZhcmlhbnQuU0VMRUNUX09QVElPTl9XSVRIT1VUX1BST1BFUlRZX05BTUU8L3RkPjx0ZD5JbmRpY2F0ZXMgdGhhdCBhIHNlbGVjdGlvbiBvcHRpb24gaGFzIGJlZW4gZGVmaW5lZCwgYnV0IHRoZSBSYW5nZXMgZGVmaW5pdGlvbiBpcyBtaXNzaW5nPC90ZD48L3RyPlxuXHQgKiA8dHI+PHRkPlByZXNlbnRhdGlvblZhcmlhbnQuU0VMRUNUX09QVElPTl9SQU5HRVNfTk9UX0FSUkFZPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgdGhlIFJhbmdlcyBkZWZpbml0aW9uIGlzIG5vdCBhbiBhcnJheTwvdGQ+PC90cj5cblx0ICogPC90YWJsZT5cblx0ICogVGhlc2UgZXhjZXB0aW9ucyBjYW4gb25seSBiZSB0aHJvd24gaWYgdGhlIHBhcmFtZXRlciA8Y29kZT52UHJlc2VudGF0aW9uVmFyaWFudDwvY29kZT4gaGFzIGJlZW4gcHJvdmlkZWQuXG5cdCAqL1xuXHRwdWJsaWMgY29uc3RydWN0b3IocHJlc2VudGF0aW9uVmFyaWFudD86IHN0cmluZyB8IG9iamVjdCkge1xuXHRcdHN1cGVyKCk7XG5cdFx0dGhpcy5pZCA9IFwiXCI7XG5cblx0XHRpZiAocHJlc2VudGF0aW9uVmFyaWFudCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRpZiAodHlwZW9mIHByZXNlbnRhdGlvblZhcmlhbnQgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0dGhpcy5wYXJzZUZyb21TdHJpbmcocHJlc2VudGF0aW9uVmFyaWFudCk7XG5cdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBwcmVzZW50YXRpb25WYXJpYW50ID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdHRoaXMucGFyc2VGcm9tT2JqZWN0KHByZXNlbnRhdGlvblZhcmlhbnQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiUHJlc2VudGF0aW9uVmFyaWFudC5JTlZBTElEX0lOUFVUX1RZUEVcIik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGlkZW50aWZpY2F0aW9uIG9mIHRoZSBzZWxlY3Rpb24gdmFyaWFudC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGlkZW50aWZpY2F0aW9uIG9mIHRoZSBzZWxlY3Rpb24gdmFyaWFudCBhcyBtYWRlIGF2YWlsYWJsZSBkdXJpbmcgY29uc3RydWN0aW9uXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHB1YmxpYyBnZXRJRCgpIHtcblx0XHRyZXR1cm4gdGhpcy5pZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBpZGVudGlmaWNhdGlvbiBvZiB0aGUgc2VsZWN0aW9uIHZhcmlhbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgbmV3IGlkZW50aWZpY2F0aW9uIG9mIHRoZSBzZWxlY3Rpb24gdmFyaWFudFxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRzZXRJRChpZDogc3RyaW5nKSB7XG5cdFx0dGhpcy5pZCA9IGlkO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIHRleHQgLyBkZXNjcmlwdGlvbiBvZiB0aGUgc2VsZWN0aW9uIHZhcmlhbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBuZXdUZXh0IFRoZSBuZXcgZGVzY3JpcHRpb24gdG8gYmUgdXNlZFxuXHQgKiBAcHVibGljXG5cdCAqIEB0aHJvd3MgQW4gaW5zdGFuY2Ugb2Yge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdkVycm9yfSBpbiBjYXNlIG9mIGlucHV0IGVycm9ycy4gVmFsaWQgZXJyb3IgY29kZXMgYXJlOlxuXHQgKiA8dGFibGU+XG5cdCAqIDx0cj48dGg+TmF2RXJyb3IgY29kZTwvdGg+PHRoPkRlc2NyaXB0aW9uPC90aD48L3RyPlxuXHQgKiA8dHI+PHRkPlByZXNlbnRhdGlvblZhcmlhbnQuSU5WQUxJRF9JTlBVVF9UWVBFPC90ZD48dGQ+SW5kaWNhdGVzIHRoYXQgYW4gaW5wdXQgcGFyYW1ldGVyIGhhcyBhbiBpbnZhbGlkIHR5cGU8L3RkPjwvdHI+XG5cdCAqIDwvdGFibGU+XG5cdCAqL1xuXHRzZXRUZXh0KG5ld1RleHQ/OiBzdHJpbmcpIHtcblx0XHRpZiAodHlwZW9mIG5ld1RleHQgIT09IFwic3RyaW5nXCIpIHtcblx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIlByZXNlbnRhdGlvblZhcmlhbnQuSU5WQUxJRF9JTlBVVF9UWVBFXCIpO1xuXHRcdH1cblx0XHR0aGlzLnRleHQgPSBuZXdUZXh0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGN1cnJlbnQgdGV4dCAvIGRlc2NyaXB0aW9uIG9mIHRoaXMgc2VsZWN0aW9uIHZhcmlhbnQuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBjdXJyZW50IGRlc2NyaXB0aW9uIG9mIHRoaXMgc2VsZWN0aW9uIHZhcmlhbnQuXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGdldFRleHQoKSB7XG5cdFx0cmV0dXJuIHRoaXMudGV4dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBjb250ZXh0IFVSTC5cblx0ICpcblx0ICogQHBhcmFtIHVybCBUaGUgVVJMIG9mIHRoZSBjb250ZXh0XG5cdCAqIEBwdWJsaWNcblx0ICogQHRocm93cyBBbiBpbnN0YW5jZSBvZiB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3J9IGluIGNhc2Ugb2YgaW5wdXQgZXJyb3JzLiBWYWxpZCBlcnJvciBjb2RlcyBhcmU6XG5cdCAqIDx0YWJsZT5cblx0ICogPHRyPjx0aD5OYXZFcnJvciBjb2RlPC90aD48dGg+RGVzY3JpcHRpb248L3RoPjwvdHI+XG5cdCAqIDx0cj48dGQ+UHJlc2VudGF0aW9uVmFyaWFudC5JTlZBTElEX0lOUFVUX1RZUEU8L3RkPjx0ZD5JbmRpY2F0ZXMgdGhhdCBhbiBpbnB1dCBwYXJhbWV0ZXIgaGFzIGFuIGludmFsaWQgdHlwZTwvdGQ+PC90cj5cblx0ICogPC90YWJsZT5cblx0ICovXG5cdHNldENvbnRleHRVcmwodXJsOiBzdHJpbmcpIHtcblx0XHRpZiAodHlwZW9mIHVybCAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiUHJlc2VudGF0aW9uVmFyaWFudC5JTlZBTElEX0lOUFVUX1RZUEVcIik7XG5cdFx0fVxuXHRcdHRoaXMuY3R4VXJsID0gdXJsO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGN1cnJlbnQgY29udGV4dCBVUkwgaW50ZW5kZWQgZm9yIHRoZSBxdWVyeS5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGN1cnJlbnQgY29udGV4dCBVUkwgZm9yIHRoZSBxdWVyeVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRnZXRDb250ZXh0VXJsKCkge1xuXHRcdHJldHVybiB0aGlzLmN0eFVybDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIDxjb2RlPnRydWU8L2NvZGU+IGlmIHRoZSBwcmVzZW50YXRpb24gdmFyaWFudCBkb2VzIG5vdCBjb250YWluIGFueSBwcm9wZXJ0aWVzLlxuXHQgKiBub3IgcmFuZ2VzLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBJZiBzZXQgdG8gPGNvZGU+dHJ1ZTwvY29kZT4gdGhlcmUgYXJlIG5vIGN1cnJlbnQgcHJvcGVydGllcyBzZXQ7IDxjb2RlPmZhbHNlPC9jb2RlPiBvdGhlcndpc2UuXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGlzRW1wdHkoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdE9iamVjdC5rZXlzKHRoaXMuZ2V0VGFibGVWaXN1YWxpemF0aW9uKCkgPz8ge30pLmxlbmd0aCA9PT0gMCAmJlxuXHRcdFx0T2JqZWN0LmtleXModGhpcy5nZXRDaGFydFZpc3VhbGl6YXRpb24oKSA/PyB7fSkubGVuZ3RoID09PSAwICYmXG5cdFx0XHRPYmplY3Qua2V5cyh0aGlzLmdldFByb3BlcnRpZXMoKSA/PyB7fSkubGVuZ3RoID09PSAwXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBtb3JlIHRyaXZpYWwgcHJvcGVydGllcy4gQmFzaWNhbGx5IGFsbCBwcm9wZXJ0aWVzIHdpdGggdGhlIGV4Y2VwdGlvbiBvZiB0aGUgVmlzdWFsaXphdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIHByb3BlcnRpZXMgVGhlIHByb3BlcnRpZXMgdG8gYmUgdXNlZC5cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0c2V0UHJvcGVydGllcyhwcm9wZXJ0aWVzOiBvYmplY3QpIHtcblx0XHR0aGlzLnByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKHt9LCBwcm9wZXJ0aWVzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBtb3JlIHRyaXZpYWwgcHJvcGVydGllcy4gQmFzaWNhbGx5IGFsbCBwcm9wZXJ0aWVzIHdpdGggdGhlIGV4Y2VwdGlvbiBvZiB0aGUgVmlzdWFsaXphdGlvbi5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGN1cnJlbnQgcHJvcGVydGllcy5cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0Z2V0UHJvcGVydGllcygpIHtcblx0XHRyZXR1cm4gdGhpcy5wcm9wZXJ0aWVzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIHRhYmxlIHZpc3VhbGl6YXRpb24gcHJvcGVydHkuXG5cdCAqXG5cdCAqIEBwYXJhbSBwcm9wZXJ0aWVzIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBwcm9wZXJ0aWVzIHRvIGJlIHVzZWQgZm9yIHRoZSB0YWJsZSB2aXN1YWxpemF0aW9uLlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRzZXRUYWJsZVZpc3VhbGl6YXRpb24ocHJvcGVydGllczogVmlzdWFsaXphdGlvbikge1xuXHRcdHRoaXMudmlzVGFibGUgPSBPYmplY3QuYXNzaWduKHt9LCBwcm9wZXJ0aWVzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSB0YWJsZSB2aXN1YWxpemF0aW9uIHByb3BlcnR5LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgcHJvcGVydGllcyB0byBiZSB1c2VkIGZvciB0aGUgdGFibGUgdmlzdWFsaXphdGlvbi5cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0Z2V0VGFibGVWaXN1YWxpemF0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLnZpc1RhYmxlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGNoYXJ0IHZpc3VhbGl6YXRpb24gcHJvcGVydHkuXG5cdCAqXG5cdCAqIEBwYXJhbSBwcm9wZXJ0aWVzIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBwcm9wZXJ0aWVzIHRvIGJlIHVzZWQgZm9yIHRoZSBjaGFydCB2aXN1YWxpemF0aW9uLlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRzZXRDaGFydFZpc3VhbGl6YXRpb24ocHJvcGVydGllczogVmlzdWFsaXphdGlvbikge1xuXHRcdHRoaXMudmlzQ2hhcnQgPSBPYmplY3QuYXNzaWduKHt9LCBwcm9wZXJ0aWVzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBjaGFydCB2aXN1YWxpemF0aW9uIHByb3BlcnR5LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgcHJvcGVydGllcyB0byBiZSB1c2VkIGZvciB0aGUgY2hhcnQgdmlzdWFsaXphdGlvbi5cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0Z2V0Q2hhcnRWaXN1YWxpemF0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLnZpc0NoYXJ0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGV4dGVybmFsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBzZWxlY3Rpb24gdmFyaWFudCBhcyBKU09OIG9iamVjdC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGV4dGVybmFsIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgaW5zdGFuY2UgYXMgYSBKU09OIG9iamVjdFxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHR0b0pTT05PYmplY3QoKSB7XG5cdFx0Y29uc3QgZXh0ZXJuYWxQcmVzZW50YXRpb25WYXJpYW50OiBFeHRlcm5hbFByZXNlbnRhdGlvblZhcmlhbnQgPSB7XG5cdFx0XHRWZXJzaW9uOiB7XG5cdFx0XHRcdC8vIFZlcnNpb24gYXR0cmlidXRlcyBhcmUgbm90IHBhcnQgb2YgdGhlIG9mZmljaWFsIHNwZWNpZmljYXRpb24sXG5cdFx0XHRcdE1ham9yOiBcIjFcIiwgLy8gYnV0IGNvdWxkIGJlIGhlbHBmdWwgbGF0ZXIgZm9yIGltcGxlbWVudGluZyBhIHByb3BlciBsaWZlY3ljbGUvaW50ZXJvcGVyYWJpbGl0eVxuXHRcdFx0XHRNaW5vcjogXCIwXCIsXG5cdFx0XHRcdFBhdGNoOiBcIjBcIlxuXHRcdFx0fSxcblx0XHRcdFByZXNlbnRhdGlvblZhcmlhbnRJRDogdGhpcy5pZFxuXHRcdH07XG5cblx0XHRpZiAodGhpcy5jdHhVcmwpIHtcblx0XHRcdGV4dGVybmFsUHJlc2VudGF0aW9uVmFyaWFudC5Db250ZXh0VXJsID0gdGhpcy5jdHhVcmw7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMudGV4dCkge1xuXHRcdFx0ZXh0ZXJuYWxQcmVzZW50YXRpb25WYXJpYW50LlRleHQgPSB0aGlzLnRleHQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGV4dGVybmFsUHJlc2VudGF0aW9uVmFyaWFudC5UZXh0ID0gXCJQcmVzZW50YXRpb24gVmFyaWFudCB3aXRoIElEIFwiICsgdGhpcy5pZDtcblx0XHR9XG5cblx0XHR0aGlzLnNlcmlhbGl6ZVByb3BlcnRpZXMoZXh0ZXJuYWxQcmVzZW50YXRpb25WYXJpYW50KTtcblx0XHR0aGlzLnNlcmlhbGl6ZVZpc3VhbGl6YXRpb25zKGV4dGVybmFsUHJlc2VudGF0aW9uVmFyaWFudCk7XG5cblx0XHRyZXR1cm4gZXh0ZXJuYWxQcmVzZW50YXRpb25WYXJpYW50O1xuXHR9XG5cblx0LyoqXG5cdCAqIFNlcmlhbGl6ZXMgdGhpcyBpbnN0YW5jZSBpbnRvIGEgSlNPTi1mb3JtYXR0ZWQgc3RyaW5nLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgSlNPTi1mb3JtYXR0ZWQgcmVwcmVzZW50YXRpb24gb2YgdGhpcyBpbnN0YW5jZSBpbiBzdHJpbmdpZmllZCBmb3JtYXRcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0dG9KU09OU3RyaW5nKCkge1xuXHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLnRvSlNPTk9iamVjdCgpKTtcblx0fVxuXG5cdHByaXZhdGUgc2VyaWFsaXplUHJvcGVydGllcyhleHRlcm5hbFByZXNlbnRhdGlvblZhcmlhbnQ6IEV4dGVybmFsUHJlc2VudGF0aW9uVmFyaWFudCkge1xuXHRcdGlmICh0aGlzLnByb3BlcnRpZXMpIHtcblx0XHRcdE9iamVjdC5hc3NpZ24oZXh0ZXJuYWxQcmVzZW50YXRpb25WYXJpYW50LCB0aGlzLnByb3BlcnRpZXMpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgc2VyaWFsaXplVmlzdWFsaXphdGlvbnMoZXh0ZXJuYWxQcmVzZW50YXRpb25WYXJpYW50OiBFeHRlcm5hbFByZXNlbnRhdGlvblZhcmlhbnQpIHtcblx0XHRpZiAodGhpcy52aXNUYWJsZSkge1xuXHRcdFx0aWYgKCFleHRlcm5hbFByZXNlbnRhdGlvblZhcmlhbnQuVmlzdWFsaXphdGlvbnMpIHtcblx0XHRcdFx0ZXh0ZXJuYWxQcmVzZW50YXRpb25WYXJpYW50LlZpc3VhbGl6YXRpb25zID0gW107XG5cdFx0XHR9XG5cdFx0XHRleHRlcm5hbFByZXNlbnRhdGlvblZhcmlhbnQuVmlzdWFsaXphdGlvbnMucHVzaCh0aGlzLnZpc1RhYmxlKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy52aXNDaGFydCkge1xuXHRcdFx0aWYgKCFleHRlcm5hbFByZXNlbnRhdGlvblZhcmlhbnQuVmlzdWFsaXphdGlvbnMpIHtcblx0XHRcdFx0ZXh0ZXJuYWxQcmVzZW50YXRpb25WYXJpYW50LlZpc3VhbGl6YXRpb25zID0gW107XG5cdFx0XHR9XG5cdFx0XHRleHRlcm5hbFByZXNlbnRhdGlvblZhcmlhbnQuVmlzdWFsaXphdGlvbnMucHVzaCh0aGlzLnZpc0NoYXJ0KTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHBhcnNlRnJvbVN0cmluZyhqc29uU3RyaW5nPzogc3RyaW5nKSB7XG5cdFx0aWYgKGpzb25TdHJpbmcgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiUHJlc2VudGF0aW9uVmFyaWFudC5VTkFCTEVfVE9fUEFSU0VfSU5QVVRcIik7XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGVvZiBqc29uU3RyaW5nICE9PSBcInN0cmluZ1wiKSB7XG5cdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJQcmVzZW50YXRpb25WYXJpYW50LklOVkFMSURfSU5QVVRfVFlQRVwiKTtcblx0XHR9XG5cblx0XHR0aGlzLnBhcnNlRnJvbU9iamVjdChKU09OLnBhcnNlKGpzb25TdHJpbmcpKTtcblx0fVxuXG5cdHByaXZhdGUgcGFyc2VGcm9tT2JqZWN0KGlucHV0OiBQYXJ0aWFsPEV4dGVybmFsUHJlc2VudGF0aW9uVmFyaWFudD4pIHtcblx0XHRpZiAoaW5wdXQuUHJlc2VudGF0aW9uVmFyaWFudElEID09PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIERvIG5vdCB0aHJvdyBhbiBlcnJvciwgYnV0IG9ubHkgd3JpdGUgYSB3YXJuaW5nIGludG8gdGhlIGxvZy5cblx0XHRcdC8vIFRoZSBQcmVzZW50YXRpb25WYXJpYW50SUQgaXMgbWFuZGF0b3J5IGFjY29yZGluZyB0byB0aGUgc3BlY2lmaWNhdGlvbiBkb2N1bWVudCB2ZXJzaW9uIDEuMCxcblx0XHRcdC8vIGJ1dCB0aGlzIGRvY3VtZW50IGlzIG5vdCBhIHVuaXZlcnNhbGx5IHZhbGlkIHN0YW5kYXJkLlxuXHRcdFx0Ly8gSXQgaXMgc2FpZCB0aGF0IHRoZSBcImltcGxlbWVudGF0aW9uIG9mIHRoZSBTbWFydEZpbHRlckJhclwiIG1heSBzdXBlcnNlZGUgdGhlIHNwZWNpZmljYXRpb24uXG5cdFx0XHQvLyBUaHVzLCBhbHNvIGFsbG93IGFuIGluaXRpYWwgUHJlc2VudGF0aW9uVmFyaWFudElELlxuXHRcdFx0Ly9cdFx0dGhyb3cgbmV3IHNhcC5mZS5uYXZpZ2F0aW9uLk5hdkVycm9yKFwiUHJlc2VudGF0aW9uVmFyaWFudC5JTlBVVF9ET0VTX05PVF9DT05UQUlOX1NFTEVDVElPTlZBUklBTlRfSURcIik7XG5cdFx0XHRMb2cud2FybmluZyhcIlByZXNlbnRhdGlvblZhcmlhbnRJRCBpcyBub3QgZGVmaW5lZFwiKTtcblx0XHRcdGlucHV0LlByZXNlbnRhdGlvblZhcmlhbnRJRCA9IFwiXCI7XG5cdFx0fVxuXG5cdFx0Y29uc3QgaW5wdXRDb3B5ID0gT2JqZWN0LmFzc2lnbih7fSwgaW5wdXQpO1xuXHRcdGRlbGV0ZSBpbnB1dENvcHkuVmVyc2lvbjtcblxuXHRcdHRoaXMuc2V0SUQoaW5wdXQuUHJlc2VudGF0aW9uVmFyaWFudElEKTtcblx0XHRkZWxldGUgaW5wdXRDb3B5LlByZXNlbnRhdGlvblZhcmlhbnRJRDtcblxuXHRcdGlmIChpbnB1dC5Db250ZXh0VXJsICE9PSB1bmRlZmluZWQgJiYgaW5wdXQuQ29udGV4dFVybCAhPT0gXCJcIikge1xuXHRcdFx0dGhpcy5zZXRDb250ZXh0VXJsKGlucHV0LkNvbnRleHRVcmwpO1xuXHRcdFx0ZGVsZXRlIGlucHV0LkNvbnRleHRVcmw7XG5cdFx0fVxuXG5cdFx0aWYgKGlucHV0LlRleHQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5zZXRUZXh0KGlucHV0LlRleHQpO1xuXHRcdFx0ZGVsZXRlIGlucHV0LlRleHQ7XG5cdFx0fVxuXG5cdFx0aWYgKGlucHV0LlZpc3VhbGl6YXRpb25zKSB7XG5cdFx0XHR0aGlzLnBhcnNlVmlzdWFsaXphdGlvbnMoaW5wdXQuVmlzdWFsaXphdGlvbnMpO1xuXHRcdFx0ZGVsZXRlIGlucHV0Q29weS5WaXN1YWxpemF0aW9ucztcblx0XHR9XG5cblx0XHR0aGlzLnNldFByb3BlcnRpZXMoaW5wdXRDb3B5KTtcblx0fVxuXG5cdHByaXZhdGUgcGFyc2VWaXN1YWxpemF0aW9ucyh2aXN1YWxpemF0aW9uczogVmlzdWFsaXphdGlvbltdKSB7XG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KHZpc3VhbGl6YXRpb25zKSkge1xuXHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiUHJlc2VudGF0aW9uVmFyaWFudC5JTlZBTElEX0lOUFVUX1RZUEVcIik7XG5cdFx0fVxuXG5cdFx0Zm9yIChjb25zdCB2aXN1YWxpemF0aW9uIG9mIHZpc3VhbGl6YXRpb25zKSB7XG5cdFx0XHRpZiAodmlzdWFsaXphdGlvbj8uVHlwZSAmJiB2aXN1YWxpemF0aW9uLlR5cGUuaW5kZXhPZihcIkNoYXJ0XCIpID49IDApIHtcblx0XHRcdFx0dGhpcy5zZXRDaGFydFZpc3VhbGl6YXRpb24odmlzdWFsaXphdGlvbik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnNldFRhYmxlVmlzdWFsaXphdGlvbih2aXN1YWxpemF0aW9uKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuLy8gRXhwb3J0aW5nIHRoZSBjbGFzcyBhcyBwcm9wZXJseSB0eXBlZCBVSTVDbGFzc1xuY29uc3QgVUk1Q2xhc3MgPSBCYXNlT2JqZWN0LmV4dGVuZChcblx0XCJzYXAuZmUubmF2aWdhdGlvbi5QcmVzZW50YXRpb25WYXJpYW50XCIsXG5cdFByZXNlbnRhdGlvblZhcmlhbnQucHJvdG90eXBlIGFzIGFueVxuKSBhcyB0eXBlb2YgUHJlc2VudGF0aW9uVmFyaWFudDtcbnR5cGUgVUk1Q2xhc3MgPSBJbnN0YW5jZVR5cGU8dHlwZW9mIFByZXNlbnRhdGlvblZhcmlhbnQ+O1xuZXhwb3J0IGRlZmF1bHQgVUk1Q2xhc3M7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7RUE0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBUkEsSUFTYUEsbUJBQW1CO0lBQUE7SUFhL0I7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQyw2QkFBbUJDLG1CQUFxQyxFQUFFO01BQUE7TUFDekQsOEJBQU87TUFDUCxNQUFLQyxFQUFFLEdBQUcsRUFBRTtNQUVaLElBQUlELG1CQUFtQixLQUFLRSxTQUFTLEVBQUU7UUFDdEMsSUFBSSxPQUFPRixtQkFBbUIsS0FBSyxRQUFRLEVBQUU7VUFDNUMsTUFBS0csZUFBZSxDQUFDSCxtQkFBbUIsQ0FBQztRQUMxQyxDQUFDLE1BQU0sSUFBSSxPQUFPQSxtQkFBbUIsS0FBSyxRQUFRLEVBQUU7VUFDbkQsTUFBS0ksZUFBZSxDQUFDSixtQkFBbUIsQ0FBQztRQUMxQyxDQUFDLE1BQU07VUFDTixNQUFNLElBQUlLLFFBQVEsQ0FBQyx3Q0FBd0MsQ0FBQztRQUM3RDtNQUNEO01BQUM7SUFDRjs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFMQztJQUFBO0lBQUEsT0FNT0MsS0FBSyxHQUFaLGlCQUFlO01BQ2QsT0FBTyxJQUFJLENBQUNMLEVBQUU7SUFDZjs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FMQztJQUFBLE9BTUFNLEtBQUssR0FBTCxlQUFNTixFQUFVLEVBQUU7TUFDakIsSUFBSSxDQUFDQSxFQUFFLEdBQUdBLEVBQUU7SUFDYjs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BVkM7SUFBQSxPQVdBTyxPQUFPLEdBQVAsaUJBQVFDLE9BQWdCLEVBQUU7TUFDekIsSUFBSSxPQUFPQSxPQUFPLEtBQUssUUFBUSxFQUFFO1FBQ2hDLE1BQU0sSUFBSUosUUFBUSxDQUFDLHdDQUF3QyxDQUFDO01BQzdEO01BQ0EsSUFBSSxDQUFDSyxJQUFJLEdBQUdELE9BQU87SUFDcEI7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTEM7SUFBQSxPQU1BRSxPQUFPLEdBQVAsbUJBQVU7TUFDVCxPQUFPLElBQUksQ0FBQ0QsSUFBSTtJQUNqQjs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BVkM7SUFBQSxPQVdBRSxhQUFhLEdBQWIsdUJBQWNDLEdBQVcsRUFBRTtNQUMxQixJQUFJLE9BQU9BLEdBQUcsS0FBSyxRQUFRLEVBQUU7UUFDNUIsTUFBTSxJQUFJUixRQUFRLENBQUMsd0NBQXdDLENBQUM7TUFDN0Q7TUFDQSxJQUFJLENBQUNTLE1BQU0sR0FBR0QsR0FBRztJQUNsQjs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FMQztJQUFBLE9BTUFFLGFBQWEsR0FBYix5QkFBZ0I7TUFDZixPQUFPLElBQUksQ0FBQ0QsTUFBTTtJQUNuQjs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQU5DO0lBQUEsT0FPQUUsT0FBTyxHQUFQLG1CQUFVO01BQ1QsT0FDQ0MsTUFBTSxDQUFDQyxJQUFJLENBQUMsSUFBSSxDQUFDQyxxQkFBcUIsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUNDLE1BQU0sS0FBSyxDQUFDLElBQzVESCxNQUFNLENBQUNDLElBQUksQ0FBQyxJQUFJLENBQUNHLHFCQUFxQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQ0QsTUFBTSxLQUFLLENBQUMsSUFDNURILE1BQU0sQ0FBQ0MsSUFBSSxDQUFDLElBQUksQ0FBQ0ksYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQ0YsTUFBTSxLQUFLLENBQUM7SUFFdEQ7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTEM7SUFBQSxPQU1BRyxhQUFhLEdBQWIsdUJBQWNDLFVBQWtCLEVBQUU7TUFDakMsSUFBSSxDQUFDQSxVQUFVLEdBQUdQLE1BQU0sQ0FBQ1EsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFRCxVQUFVLENBQUM7SUFDaEQ7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTEM7SUFBQSxPQU1BRixhQUFhLEdBQWIseUJBQWdCO01BQ2YsT0FBTyxJQUFJLENBQUNFLFVBQVU7SUFDdkI7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTEM7SUFBQSxPQU1BRSxxQkFBcUIsR0FBckIsK0JBQXNCRixVQUF5QixFQUFFO01BQ2hELElBQUksQ0FBQ0csUUFBUSxHQUFHVixNQUFNLENBQUNRLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRUQsVUFBVSxDQUFDO0lBQzlDOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUxDO0lBQUEsT0FNQUwscUJBQXFCLEdBQXJCLGlDQUF3QjtNQUN2QixPQUFPLElBQUksQ0FBQ1EsUUFBUTtJQUNyQjs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FMQztJQUFBLE9BTUFDLHFCQUFxQixHQUFyQiwrQkFBc0JKLFVBQXlCLEVBQUU7TUFDaEQsSUFBSSxDQUFDSyxRQUFRLEdBQUdaLE1BQU0sQ0FBQ1EsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFRCxVQUFVLENBQUM7SUFDOUM7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTEM7SUFBQSxPQU1BSCxxQkFBcUIsR0FBckIsaUNBQXdCO01BQ3ZCLE9BQU8sSUFBSSxDQUFDUSxRQUFRO0lBQ3JCOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUxDO0lBQUEsT0FNQUMsWUFBWSxHQUFaLHdCQUFlO01BQ2QsTUFBTUMsMkJBQXdELEdBQUc7UUFDaEVDLE9BQU8sRUFBRTtVQUNSO1VBQ0FDLEtBQUssRUFBRSxHQUFHO1VBQUU7VUFDWkMsS0FBSyxFQUFFLEdBQUc7VUFDVkMsS0FBSyxFQUFFO1FBQ1IsQ0FBQztRQUNEQyxxQkFBcUIsRUFBRSxJQUFJLENBQUNuQztNQUM3QixDQUFDO01BRUQsSUFBSSxJQUFJLENBQUNhLE1BQU0sRUFBRTtRQUNoQmlCLDJCQUEyQixDQUFDTSxVQUFVLEdBQUcsSUFBSSxDQUFDdkIsTUFBTTtNQUNyRDtNQUVBLElBQUksSUFBSSxDQUFDSixJQUFJLEVBQUU7UUFDZHFCLDJCQUEyQixDQUFDTyxJQUFJLEdBQUcsSUFBSSxDQUFDNUIsSUFBSTtNQUM3QyxDQUFDLE1BQU07UUFDTnFCLDJCQUEyQixDQUFDTyxJQUFJLEdBQUcsK0JBQStCLEdBQUcsSUFBSSxDQUFDckMsRUFBRTtNQUM3RTtNQUVBLElBQUksQ0FBQ3NDLG1CQUFtQixDQUFDUiwyQkFBMkIsQ0FBQztNQUNyRCxJQUFJLENBQUNTLHVCQUF1QixDQUFDVCwyQkFBMkIsQ0FBQztNQUV6RCxPQUFPQSwyQkFBMkI7SUFDbkM7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTEM7SUFBQSxPQU1BVSxZQUFZLEdBQVosd0JBQWU7TUFDZCxPQUFPQyxJQUFJLENBQUNDLFNBQVMsQ0FBQyxJQUFJLENBQUNiLFlBQVksRUFBRSxDQUFDO0lBQzNDLENBQUM7SUFBQSxPQUVPUyxtQkFBbUIsR0FBM0IsNkJBQTRCUiwyQkFBd0QsRUFBRTtNQUNyRixJQUFJLElBQUksQ0FBQ1AsVUFBVSxFQUFFO1FBQ3BCUCxNQUFNLENBQUNRLE1BQU0sQ0FBQ00sMkJBQTJCLEVBQUUsSUFBSSxDQUFDUCxVQUFVLENBQUM7TUFDNUQ7SUFDRCxDQUFDO0lBQUEsT0FFT2dCLHVCQUF1QixHQUEvQixpQ0FBZ0NULDJCQUF3RCxFQUFFO01BQ3pGLElBQUksSUFBSSxDQUFDSixRQUFRLEVBQUU7UUFDbEIsSUFBSSxDQUFDSSwyQkFBMkIsQ0FBQ2EsY0FBYyxFQUFFO1VBQ2hEYiwyQkFBMkIsQ0FBQ2EsY0FBYyxHQUFHLEVBQUU7UUFDaEQ7UUFDQWIsMkJBQTJCLENBQUNhLGNBQWMsQ0FBQ0MsSUFBSSxDQUFDLElBQUksQ0FBQ2xCLFFBQVEsQ0FBQztNQUMvRDtNQUVBLElBQUksSUFBSSxDQUFDRSxRQUFRLEVBQUU7UUFDbEIsSUFBSSxDQUFDRSwyQkFBMkIsQ0FBQ2EsY0FBYyxFQUFFO1VBQ2hEYiwyQkFBMkIsQ0FBQ2EsY0FBYyxHQUFHLEVBQUU7UUFDaEQ7UUFDQWIsMkJBQTJCLENBQUNhLGNBQWMsQ0FBQ0MsSUFBSSxDQUFDLElBQUksQ0FBQ2hCLFFBQVEsQ0FBQztNQUMvRDtJQUNELENBQUM7SUFBQSxPQUVPMUIsZUFBZSxHQUF2Qix5QkFBd0IyQyxVQUFtQixFQUFFO01BQzVDLElBQUlBLFVBQVUsS0FBSzVDLFNBQVMsRUFBRTtRQUM3QixNQUFNLElBQUlHLFFBQVEsQ0FBQywyQ0FBMkMsQ0FBQztNQUNoRTtNQUVBLElBQUksT0FBT3lDLFVBQVUsS0FBSyxRQUFRLEVBQUU7UUFDbkMsTUFBTSxJQUFJekMsUUFBUSxDQUFDLHdDQUF3QyxDQUFDO01BQzdEO01BRUEsSUFBSSxDQUFDRCxlQUFlLENBQUNzQyxJQUFJLENBQUNLLEtBQUssQ0FBQ0QsVUFBVSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUFBLE9BRU8xQyxlQUFlLEdBQXZCLHlCQUF3QjRDLEtBQTJDLEVBQUU7TUFDcEUsSUFBSUEsS0FBSyxDQUFDWixxQkFBcUIsS0FBS2xDLFNBQVMsRUFBRTtRQUM5QztRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQStDLEdBQUcsQ0FBQ0MsT0FBTyxDQUFDLHNDQUFzQyxDQUFDO1FBQ25ERixLQUFLLENBQUNaLHFCQUFxQixHQUFHLEVBQUU7TUFDakM7TUFFQSxNQUFNZSxTQUFTLEdBQUdsQyxNQUFNLENBQUNRLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRXVCLEtBQUssQ0FBQztNQUMxQyxPQUFPRyxTQUFTLENBQUNuQixPQUFPO01BRXhCLElBQUksQ0FBQ3pCLEtBQUssQ0FBQ3lDLEtBQUssQ0FBQ1oscUJBQXFCLENBQUM7TUFDdkMsT0FBT2UsU0FBUyxDQUFDZixxQkFBcUI7TUFFdEMsSUFBSVksS0FBSyxDQUFDWCxVQUFVLEtBQUtuQyxTQUFTLElBQUk4QyxLQUFLLENBQUNYLFVBQVUsS0FBSyxFQUFFLEVBQUU7UUFDOUQsSUFBSSxDQUFDekIsYUFBYSxDQUFDb0MsS0FBSyxDQUFDWCxVQUFVLENBQUM7UUFDcEMsT0FBT1csS0FBSyxDQUFDWCxVQUFVO01BQ3hCO01BRUEsSUFBSVcsS0FBSyxDQUFDVixJQUFJLEtBQUtwQyxTQUFTLEVBQUU7UUFDN0IsSUFBSSxDQUFDTSxPQUFPLENBQUN3QyxLQUFLLENBQUNWLElBQUksQ0FBQztRQUN4QixPQUFPVSxLQUFLLENBQUNWLElBQUk7TUFDbEI7TUFFQSxJQUFJVSxLQUFLLENBQUNKLGNBQWMsRUFBRTtRQUN6QixJQUFJLENBQUNRLG1CQUFtQixDQUFDSixLQUFLLENBQUNKLGNBQWMsQ0FBQztRQUM5QyxPQUFPTyxTQUFTLENBQUNQLGNBQWM7TUFDaEM7TUFFQSxJQUFJLENBQUNyQixhQUFhLENBQUM0QixTQUFTLENBQUM7SUFDOUIsQ0FBQztJQUFBLE9BRU9DLG1CQUFtQixHQUEzQiw2QkFBNEJDLGNBQStCLEVBQUU7TUFDNUQsSUFBSSxDQUFDQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ0YsY0FBYyxDQUFDLEVBQUU7UUFDbkMsTUFBTSxJQUFJaEQsUUFBUSxDQUFDLHdDQUF3QyxDQUFDO01BQzdEO01BRUEsS0FBSyxNQUFNbUQsYUFBYSxJQUFJSCxjQUFjLEVBQUU7UUFDM0MsSUFBSUcsYUFBYSxhQUFiQSxhQUFhLGVBQWJBLGFBQWEsQ0FBRUMsSUFBSSxJQUFJRCxhQUFhLENBQUNDLElBQUksQ0FBQ0MsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtVQUNwRSxJQUFJLENBQUM5QixxQkFBcUIsQ0FBQzRCLGFBQWEsQ0FBQztRQUMxQyxDQUFDLE1BQU07VUFDTixJQUFJLENBQUM5QixxQkFBcUIsQ0FBQzhCLGFBQWEsQ0FBQztRQUMxQztNQUNEO0lBQ0QsQ0FBQztJQUFBO0VBQUEsRUFuVXVDRyxVQUFVLEdBc1VuRDtFQUFBO0VBQ0EsTUFBTUMsUUFBUSxHQUFHRCxVQUFVLENBQUNFLE1BQU0sQ0FDakMsdUNBQXVDLEVBQ3ZDOUQsbUJBQW1CLENBQUMrRCxTQUFTLENBQ0M7RUFBQyxPQUVqQkYsUUFBUTtBQUFBIn0=