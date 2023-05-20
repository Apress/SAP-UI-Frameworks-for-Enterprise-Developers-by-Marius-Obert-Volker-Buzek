/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/helpers/ClassSupport", "sap/ui/mdc/condition/FilterOperatorUtil", "sap/ui/mdc/condition/Operator", "sap/ui/mdc/enum/FieldDisplay", "sap/ui/model/SimpleType", "sap/ui/model/type/Boolean", "sap/ui/model/type/Date", "sap/ui/model/type/Float", "sap/ui/model/type/Integer", "sap/ui/model/type/String"], function (Log, ClassSupport, FilterOperatorUtil, Operator, FieldDisplay, SimpleType, BooleanType, DateType, FloatType, IntegerType, StringType) {
  "use strict";

  var _dec, _class, _class2;
  var _exports = {};
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let Value = (
  /**
   * Handle format/parse single filter value.
   */
  _dec = defineUI5Class("sap.fe.macros.filter.type.Value"), _dec(_class = (_class2 = /*#__PURE__*/function (_SimpleType) {
    _inheritsLoose(Value, _SimpleType);
    /**
     * Creates a new value type instance with the given parameters.
     *
     * @param formatOptions Format options for this value type
     * @param formatOptions.operator The name of a (possibly custom) operator to use
     * @param constraints Constraints for this value type
     * @protected
     */
    function Value(formatOptions, constraints) {
      var _this;
      _this = _SimpleType.call(this, formatOptions, constraints) || this;
      const operatorName = (formatOptions === null || formatOptions === void 0 ? void 0 : formatOptions.operator) || _this.getDefaultOperatorName();
      _this.operator = FilterOperatorUtil.getOperator(operatorName);
      if (!_this.operator && operatorName.includes(".")) {
        _this._registerCustomOperator(operatorName);
      }
      return _this;
    }

    /**
     * Registers a custom binding operator.
     *
     * @param operatorName The binding operator name
     * @private
     */
    _exports = Value;
    var _proto = Value.prototype;
    _proto._registerCustomOperator = function _registerCustomOperator(operatorName) {
      const handlerFileName = operatorName.substring(0, operatorName.lastIndexOf(".")).replace(/\./g, "/"),
        methodName = operatorName.substring(operatorName.lastIndexOf(".") + 1);
      sap.ui.require([handlerFileName], customOperatorHandler => {
        if (!customOperatorHandler) {
          return;
        }
        this.operator = new Operator({
          filterOperator: "",
          tokenFormat: "",
          name: operatorName,
          valueTypes: ["self"],
          tokenParse: "^(.*)$",
          format: value => {
            return this.formatConditionValues(value.values);
          },
          parse: function (text, type, displayFormat, defaultOperator) {
            if (typeof text === "object") {
              if (text.operator !== operatorName) {
                throw Error("not matching operator");
              }
              return text.values;
            }
            return Operator.prototype.parse.apply(this, [text, type, displayFormat, defaultOperator]);
          },
          getModelFilter: condition => {
            return customOperatorHandler[methodName].call(customOperatorHandler, this.formatConditionValues(condition.values));
          }
        });
        FilterOperatorUtil.addOperator(this.operator);
      });
    }

    /**
     * Returns whether the specified operator is a multi-value operator.
     *
     * @param operator The binding operator
     * @returns `true`, if multi-value operator (`false` otherwise)
     * @private
     */;
    _proto._isMultiValueOperator = function _isMultiValueOperator(operator) {
      return operator.valueTypes.filter(function (valueType) {
        return !!valueType && valueType !== Value.OPERATOR_VALUE_TYPE_STATIC;
      }).length > 1;
    }

    /**
     * Returns whether the specified operator is a custom operator.
     *
     * @returns `true`, if custom operator (`false` otherwise)
     * @private
     */;
    _proto.hasCustomOperator = function hasCustomOperator() {
      return this.operator.name.includes(".");
    }

    /**
     * Parses the internal string value to the external value of type 'externalValueType'.
     *
     * @param value The internal string value to be parsed
     * @param externalValueType The external value type, e.g. int, float[], string, etc.
     * @returns The parsed value
     * @private
     */;
    _proto._stringToExternal = function _stringToExternal(value, externalValueType) {
      let externalValue;
      const externalType = this._getTypeInstance(externalValueType);
      if (externalValueType && Value._isArrayType(externalValueType)) {
        if (!Array.isArray(value)) {
          value = [value];
        }
        externalValue = value.map(valueElement => {
          return externalType ? externalType.parseValue(valueElement, Value.INTERNAL_VALUE_TYPE) : valueElement;
        });
      } else {
        externalValue = externalType ? externalType.parseValue(value, Value.INTERNAL_VALUE_TYPE) : value;
      }
      return externalValue;
    }

    /**
     * Returns whether target type is an array.
     *
     * @param targetType The target type name
     * @returns `true`, if array type (`false` otherwise)
     * @private
     */;
    Value._isArrayType = function _isArrayType(targetType) {
      if (!targetType) {
        return false;
      }
      return targetType === "array" || targetType.endsWith("[]");
    }

    /**
     * Returns the external value formatted as the internal string value.
     *
     * @param externalValue The value to be parsed
     * @param externalValueType The external value type, e.g. int, float[], string, etc.
     * @returns The formatted value
     * @private
     */;
    _proto._externalToString = function _externalToString(externalValue, externalValueType) {
      let value;
      const externalType = this._getTypeInstance(externalValueType);
      if (externalValueType && Value._isArrayType(externalValueType)) {
        if (!Array.isArray(externalValue)) {
          externalValue = [externalValue];
        }
        value = externalValue.map(valueElement => {
          return externalType ? externalType.formatValue(valueElement, Value.INTERNAL_VALUE_TYPE) : valueElement;
        });
      } else {
        value = externalType ? externalType.formatValue(externalValue, Value.INTERNAL_VALUE_TYPE) : externalValue;
      }
      return value;
    }

    /**
     * Retrieves the default type instance for given type name.
     *
     * @param typeName The name of the type
     * @returns The type instance
     * @private
     */;
    _proto._getTypeInstance = function _getTypeInstance(typeName) {
      typeName = this.getElementTypeName(typeName) || typeName;
      switch (typeName) {
        case "string":
          return new StringType();
        case "number":
        case "int":
          return new IntegerType();
        case "float":
          return new FloatType();
        case "date":
          return new DateType();
        case "boolean":
          return new BooleanType();
        default:
          Log.error("Unexpected filter type");
          throw new Error("Unexpected filter type");
      }
    }

    /**
     * Returns the default operator name ("EQ").
     * Should be overridden on demand.
     *
     * @returns The default operator name
     * @protected
     */;
    _proto.getDefaultOperatorName = function getDefaultOperatorName() {
      return FilterOperatorUtil.getEQOperator().name;
    }

    /**
     * Returns first value of array or input.
     *
     * @param values Input condition value
     * @returns Unchanged input condition value
     * @protected
     */;
    _proto.formatConditionValues = function formatConditionValues(values) {
      return Array.isArray(values) && values.length ? values[0] : values;
    }

    /**
     * Returns the element type name.
     *
     * @param typeName The actual type name
     * @returns The type of its elements
     * @protected
     */;
    _proto.getElementTypeName = function getElementTypeName(typeName) {
      if (typeName !== null && typeName !== void 0 && typeName.endsWith("[]")) {
        return typeName.substring(0, typeName.length - 2);
      }
      return undefined;
    }

    /**
     * Returns the string value parsed to the external value type 'this.operator'.
     *
     * @param internalValue The internal string value to be formatted
     * @param externalValueType The external value type, e.g. int, float[], string, etc.
     * @returns The formatted value
     * @protected
     */;
    _proto.formatValue = function formatValue(internalValue, externalValueType) {
      if (!internalValue) {
        return undefined;
      }
      const isMultiValueOperator = this._isMultiValueOperator(this.operator),
        internalType = this._getTypeInstance(Value.INTERNAL_VALUE_TYPE);

      //  from internal model string with operator
      const values = this.operator.parse(internalValue || "", internalType, FieldDisplay.Value, false);
      const value = !isMultiValueOperator && Array.isArray(values) ? values[0] : values;
      return this._stringToExternal(value, externalValueType); // The value bound to a custom filter
    }

    /**
     * Returns the value parsed to the internal string value.
     *
     * @param externalValue The value to be parsed
     * @param externalValueType The external value type, e.g. int, float[], string, etc.
     * @returns The parsed value
     * @protected
     */;
    _proto.parseValue = function parseValue(externalValue, externalValueType) {
      if (!externalValue) {
        return undefined;
      }
      const isMultiValueOperator = this._isMultiValueOperator(this.operator),
        externalType = this._getTypeInstance(externalValueType);
      const value = this._externalToString(externalValue, externalValueType);

      // Format to internal model string with operator
      const values = isMultiValueOperator ? value : [value];
      if (this.hasCustomOperator()) {
        // Return a complex object while parsing the bound value in sap.ui.model.PropertyBinding.js#_externalToRaw()
        return {
          operator: this.operator.name,
          values: [this.operator.format({
            values: values
          }, externalType)],
          validated: undefined
        };
      }
      // Return a simple string value to be stored in the internal 'filterValues' model
      return this.operator.format({
        values: values
      }, externalType);
    }

    /**
     * Validates whether the given value in model representation is valid.
     *
     * @param externalValue The value to be validated
     * @protected
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;
    _proto.validateValue = function validateValue(externalValue) {
      /* Do Nothing */
    };
    return Value;
  }(SimpleType), _class2.INTERNAL_VALUE_TYPE = "string", _class2.OPERATOR_VALUE_TYPE_STATIC = "static", _class2)) || _class);
  _exports = Value;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWYWx1ZSIsImRlZmluZVVJNUNsYXNzIiwiZm9ybWF0T3B0aW9ucyIsImNvbnN0cmFpbnRzIiwib3BlcmF0b3JOYW1lIiwib3BlcmF0b3IiLCJnZXREZWZhdWx0T3BlcmF0b3JOYW1lIiwiRmlsdGVyT3BlcmF0b3JVdGlsIiwiZ2V0T3BlcmF0b3IiLCJpbmNsdWRlcyIsIl9yZWdpc3RlckN1c3RvbU9wZXJhdG9yIiwiaGFuZGxlckZpbGVOYW1lIiwic3Vic3RyaW5nIiwibGFzdEluZGV4T2YiLCJyZXBsYWNlIiwibWV0aG9kTmFtZSIsInNhcCIsInVpIiwicmVxdWlyZSIsImN1c3RvbU9wZXJhdG9ySGFuZGxlciIsIk9wZXJhdG9yIiwiZmlsdGVyT3BlcmF0b3IiLCJ0b2tlbkZvcm1hdCIsIm5hbWUiLCJ2YWx1ZVR5cGVzIiwidG9rZW5QYXJzZSIsImZvcm1hdCIsInZhbHVlIiwiZm9ybWF0Q29uZGl0aW9uVmFsdWVzIiwidmFsdWVzIiwicGFyc2UiLCJ0ZXh0IiwidHlwZSIsImRpc3BsYXlGb3JtYXQiLCJkZWZhdWx0T3BlcmF0b3IiLCJFcnJvciIsInByb3RvdHlwZSIsImFwcGx5IiwiZ2V0TW9kZWxGaWx0ZXIiLCJjb25kaXRpb24iLCJjYWxsIiwiYWRkT3BlcmF0b3IiLCJfaXNNdWx0aVZhbHVlT3BlcmF0b3IiLCJmaWx0ZXIiLCJ2YWx1ZVR5cGUiLCJPUEVSQVRPUl9WQUxVRV9UWVBFX1NUQVRJQyIsImxlbmd0aCIsImhhc0N1c3RvbU9wZXJhdG9yIiwiX3N0cmluZ1RvRXh0ZXJuYWwiLCJleHRlcm5hbFZhbHVlVHlwZSIsImV4dGVybmFsVmFsdWUiLCJleHRlcm5hbFR5cGUiLCJfZ2V0VHlwZUluc3RhbmNlIiwiX2lzQXJyYXlUeXBlIiwiQXJyYXkiLCJpc0FycmF5IiwibWFwIiwidmFsdWVFbGVtZW50IiwicGFyc2VWYWx1ZSIsIklOVEVSTkFMX1ZBTFVFX1RZUEUiLCJ0YXJnZXRUeXBlIiwiZW5kc1dpdGgiLCJfZXh0ZXJuYWxUb1N0cmluZyIsImZvcm1hdFZhbHVlIiwidHlwZU5hbWUiLCJnZXRFbGVtZW50VHlwZU5hbWUiLCJTdHJpbmdUeXBlIiwiSW50ZWdlclR5cGUiLCJGbG9hdFR5cGUiLCJEYXRlVHlwZSIsIkJvb2xlYW5UeXBlIiwiTG9nIiwiZXJyb3IiLCJnZXRFUU9wZXJhdG9yIiwidW5kZWZpbmVkIiwiaW50ZXJuYWxWYWx1ZSIsImlzTXVsdGlWYWx1ZU9wZXJhdG9yIiwiaW50ZXJuYWxUeXBlIiwiRmllbGREaXNwbGF5IiwidmFsaWRhdGVkIiwidmFsaWRhdGVWYWx1ZSIsIlNpbXBsZVR5cGUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlZhbHVlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB0eXBlIHsgQ29uZGl0aW9uT2JqZWN0IH0gZnJvbSBcInNhcC91aS9tZGMvY29uZGl0aW9uL0NvbmRpdGlvblwiO1xuaW1wb3J0IEZpbHRlck9wZXJhdG9yVXRpbCBmcm9tIFwic2FwL3VpL21kYy9jb25kaXRpb24vRmlsdGVyT3BlcmF0b3JVdGlsXCI7XG5pbXBvcnQgT3BlcmF0b3IgZnJvbSBcInNhcC91aS9tZGMvY29uZGl0aW9uL09wZXJhdG9yXCI7XG5pbXBvcnQgRmllbGREaXNwbGF5IGZyb20gXCJzYXAvdWkvbWRjL2VudW0vRmllbGREaXNwbGF5XCI7XG5pbXBvcnQgdHlwZSBGaWx0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJcIjtcbmltcG9ydCBTaW1wbGVUeXBlIGZyb20gXCJzYXAvdWkvbW9kZWwvU2ltcGxlVHlwZVwiO1xuaW1wb3J0IHR5cGUgVHlwZSBmcm9tIFwic2FwL3VpL21vZGVsL1R5cGVcIjtcbmltcG9ydCBCb29sZWFuVHlwZSBmcm9tIFwic2FwL3VpL21vZGVsL3R5cGUvQm9vbGVhblwiO1xuaW1wb3J0IERhdGVUeXBlIGZyb20gXCJzYXAvdWkvbW9kZWwvdHlwZS9EYXRlXCI7XG5pbXBvcnQgRmxvYXRUeXBlIGZyb20gXCJzYXAvdWkvbW9kZWwvdHlwZS9GbG9hdFwiO1xuaW1wb3J0IEludGVnZXJUeXBlIGZyb20gXCJzYXAvdWkvbW9kZWwvdHlwZS9JbnRlZ2VyXCI7XG5pbXBvcnQgU3RyaW5nVHlwZSBmcm9tIFwic2FwL3VpL21vZGVsL3R5cGUvU3RyaW5nXCI7XG5cbi8qKlxuICogVHlwZSB1c2VkIHRvIGV4dGVuZCB0aGUgTURDIG9wZXJhdG9yIHR5cGUgd2l0aCBoaWRkZW4gZmllbGRzXG4gKlxuICogQHR5cGVkZWYgQXVnbWVudGVkT3BlcmF0b3JcbiAqL1xudHlwZSBBdWdtZW50ZWRPcGVyYXRvciA9IE9wZXJhdG9yICYge1xuXHRuYW1lOiBzdHJpbmc7XG5cdHZhbHVlVHlwZXM6IHN0cmluZ1tdO1xufTtcblxuLyoqXG4gKiBIYW5kbGUgZm9ybWF0L3BhcnNlIHNpbmdsZSBmaWx0ZXIgdmFsdWUuXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5tYWNyb3MuZmlsdGVyLnR5cGUuVmFsdWVcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZhbHVlIGV4dGVuZHMgU2ltcGxlVHlwZSB7XG5cdHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IElOVEVSTkFMX1ZBTFVFX1RZUEUgPSBcInN0cmluZ1wiO1xuXG5cdHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IE9QRVJBVE9SX1ZBTFVFX1RZUEVfU1RBVElDID0gXCJzdGF0aWNcIjtcblxuXHRwcm90ZWN0ZWQgb3BlcmF0b3I6IEF1Z21lbnRlZE9wZXJhdG9yO1xuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgbmV3IHZhbHVlIHR5cGUgaW5zdGFuY2Ugd2l0aCB0aGUgZ2l2ZW4gcGFyYW1ldGVycy5cblx0ICpcblx0ICogQHBhcmFtIGZvcm1hdE9wdGlvbnMgRm9ybWF0IG9wdGlvbnMgZm9yIHRoaXMgdmFsdWUgdHlwZVxuXHQgKiBAcGFyYW0gZm9ybWF0T3B0aW9ucy5vcGVyYXRvciBUaGUgbmFtZSBvZiBhIChwb3NzaWJseSBjdXN0b20pIG9wZXJhdG9yIHRvIHVzZVxuXHQgKiBAcGFyYW0gY29uc3RyYWludHMgQ29uc3RyYWludHMgZm9yIHRoaXMgdmFsdWUgdHlwZVxuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihmb3JtYXRPcHRpb25zOiB7IG9wZXJhdG9yPzogc3RyaW5nIH0sIGNvbnN0cmFpbnRzOiBvYmplY3QpIHtcblx0XHRzdXBlcihmb3JtYXRPcHRpb25zLCBjb25zdHJhaW50cyk7XG5cdFx0Y29uc3Qgb3BlcmF0b3JOYW1lID0gZm9ybWF0T3B0aW9ucz8ub3BlcmF0b3IgfHwgdGhpcy5nZXREZWZhdWx0T3BlcmF0b3JOYW1lKCk7XG5cdFx0dGhpcy5vcGVyYXRvciA9IEZpbHRlck9wZXJhdG9yVXRpbC5nZXRPcGVyYXRvcihvcGVyYXRvck5hbWUpIGFzIEF1Z21lbnRlZE9wZXJhdG9yO1xuXG5cdFx0aWYgKCF0aGlzLm9wZXJhdG9yICYmIG9wZXJhdG9yTmFtZS5pbmNsdWRlcyhcIi5cIikpIHtcblx0XHRcdHRoaXMuX3JlZ2lzdGVyQ3VzdG9tT3BlcmF0b3Iob3BlcmF0b3JOYW1lKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXJzIGEgY3VzdG9tIGJpbmRpbmcgb3BlcmF0b3IuXG5cdCAqXG5cdCAqIEBwYXJhbSBvcGVyYXRvck5hbWUgVGhlIGJpbmRpbmcgb3BlcmF0b3IgbmFtZVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJpdmF0ZSBfcmVnaXN0ZXJDdXN0b21PcGVyYXRvcihvcGVyYXRvck5hbWU6IHN0cmluZyk6IHZvaWQge1xuXHRcdGNvbnN0IGhhbmRsZXJGaWxlTmFtZSA9IG9wZXJhdG9yTmFtZS5zdWJzdHJpbmcoMCwgb3BlcmF0b3JOYW1lLmxhc3RJbmRleE9mKFwiLlwiKSkucmVwbGFjZSgvXFwuL2csIFwiL1wiKSxcblx0XHRcdG1ldGhvZE5hbWUgPSBvcGVyYXRvck5hbWUuc3Vic3RyaW5nKG9wZXJhdG9yTmFtZS5sYXN0SW5kZXhPZihcIi5cIikgKyAxKTtcblxuXHRcdHNhcC51aS5yZXF1aXJlKFtoYW5kbGVyRmlsZU5hbWVdLCAoY3VzdG9tT3BlcmF0b3JIYW5kbGVyOiB7IFtrZXk6IHN0cmluZ106ICh2YWx1ZTogc3RyaW5nIHwgc3RyaW5nW10pID0+IEZpbHRlciB9KSA9PiB7XG5cdFx0XHRpZiAoIWN1c3RvbU9wZXJhdG9ySGFuZGxlcikge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMub3BlcmF0b3IgPSBuZXcgT3BlcmF0b3Ioe1xuXHRcdFx0XHRmaWx0ZXJPcGVyYXRvcjogXCJcIixcblx0XHRcdFx0dG9rZW5Gb3JtYXQ6IFwiXCIsXG5cdFx0XHRcdG5hbWU6IG9wZXJhdG9yTmFtZSxcblx0XHRcdFx0dmFsdWVUeXBlczogW1wic2VsZlwiXSxcblx0XHRcdFx0dG9rZW5QYXJzZTogXCJeKC4qKSRcIixcblx0XHRcdFx0Zm9ybWF0OiAodmFsdWU6IENvbmRpdGlvbk9iamVjdCk6IHN0cmluZyB8IHN0cmluZ1tdID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5mb3JtYXRDb25kaXRpb25WYWx1ZXModmFsdWUudmFsdWVzIGFzIHN0cmluZ1tdKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0cGFyc2U6IGZ1bmN0aW9uICh0ZXh0OiBDb25kaXRpb25PYmplY3QsIHR5cGU6IFR5cGUsIGRpc3BsYXlGb3JtYXQ6IEZpZWxkRGlzcGxheSwgZGVmYXVsdE9wZXJhdG9yOiBib29sZWFuKSB7XG5cdFx0XHRcdFx0aWYgKHR5cGVvZiB0ZXh0ID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdFx0XHRpZiAodGV4dC5vcGVyYXRvciAhPT0gb3BlcmF0b3JOYW1lKSB7XG5cdFx0XHRcdFx0XHRcdHRocm93IEVycm9yKFwibm90IG1hdGNoaW5nIG9wZXJhdG9yXCIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cmV0dXJuIHRleHQudmFsdWVzO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gT3BlcmF0b3IucHJvdG90eXBlLnBhcnNlLmFwcGx5KHRoaXMsIFt0ZXh0LCB0eXBlLCBkaXNwbGF5Rm9ybWF0LCBkZWZhdWx0T3BlcmF0b3JdKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0Z2V0TW9kZWxGaWx0ZXI6IChjb25kaXRpb246IENvbmRpdGlvbk9iamVjdCk6IEZpbHRlciA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIGN1c3RvbU9wZXJhdG9ySGFuZGxlclttZXRob2ROYW1lXS5jYWxsKGN1c3RvbU9wZXJhdG9ySGFuZGxlciwgdGhpcy5mb3JtYXRDb25kaXRpb25WYWx1ZXMoY29uZGl0aW9uLnZhbHVlcykpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KSBhcyBBdWdtZW50ZWRPcGVyYXRvcjtcblx0XHRcdEZpbHRlck9wZXJhdG9yVXRpbC5hZGRPcGVyYXRvcih0aGlzLm9wZXJhdG9yKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBvcGVyYXRvciBpcyBhIG11bHRpLXZhbHVlIG9wZXJhdG9yLlxuXHQgKlxuXHQgKiBAcGFyYW0gb3BlcmF0b3IgVGhlIGJpbmRpbmcgb3BlcmF0b3Jcblx0ICogQHJldHVybnMgYHRydWVgLCBpZiBtdWx0aS12YWx1ZSBvcGVyYXRvciAoYGZhbHNlYCBvdGhlcndpc2UpXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwcml2YXRlIF9pc011bHRpVmFsdWVPcGVyYXRvcihvcGVyYXRvcjogQXVnbWVudGVkT3BlcmF0b3IpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0b3BlcmF0b3IudmFsdWVUeXBlcy5maWx0ZXIoZnVuY3Rpb24gKHZhbHVlVHlwZTogc3RyaW5nKSB7XG5cdFx0XHRcdHJldHVybiAhIXZhbHVlVHlwZSAmJiB2YWx1ZVR5cGUgIT09IFZhbHVlLk9QRVJBVE9SX1ZBTFVFX1RZUEVfU1RBVElDO1xuXHRcdFx0fSkubGVuZ3RoID4gMVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgb3BlcmF0b3IgaXMgYSBjdXN0b20gb3BlcmF0b3IuXG5cdCAqXG5cdCAqIEByZXR1cm5zIGB0cnVlYCwgaWYgY3VzdG9tIG9wZXJhdG9yIChgZmFsc2VgIG90aGVyd2lzZSlcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHByaXZhdGUgaGFzQ3VzdG9tT3BlcmF0b3IoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMub3BlcmF0b3IubmFtZS5pbmNsdWRlcyhcIi5cIik7XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2VzIHRoZSBpbnRlcm5hbCBzdHJpbmcgdmFsdWUgdG8gdGhlIGV4dGVybmFsIHZhbHVlIG9mIHR5cGUgJ2V4dGVybmFsVmFsdWVUeXBlJy5cblx0ICpcblx0ICogQHBhcmFtIHZhbHVlIFRoZSBpbnRlcm5hbCBzdHJpbmcgdmFsdWUgdG8gYmUgcGFyc2VkXG5cdCAqIEBwYXJhbSBleHRlcm5hbFZhbHVlVHlwZSBUaGUgZXh0ZXJuYWwgdmFsdWUgdHlwZSwgZS5nLiBpbnQsIGZsb2F0W10sIHN0cmluZywgZXRjLlxuXHQgKiBAcmV0dXJucyBUaGUgcGFyc2VkIHZhbHVlXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwcml2YXRlIF9zdHJpbmdUb0V4dGVybmFsKHZhbHVlOiBzdHJpbmcgfCBzdHJpbmdbXSwgZXh0ZXJuYWxWYWx1ZVR5cGU6IHN0cmluZyB8IHVuZGVmaW5lZCk6IHN0cmluZ1tdIHtcblx0XHRsZXQgZXh0ZXJuYWxWYWx1ZTtcblx0XHRjb25zdCBleHRlcm5hbFR5cGUgPSB0aGlzLl9nZXRUeXBlSW5zdGFuY2UoZXh0ZXJuYWxWYWx1ZVR5cGUpO1xuXG5cdFx0aWYgKGV4dGVybmFsVmFsdWVUeXBlICYmIFZhbHVlLl9pc0FycmF5VHlwZShleHRlcm5hbFZhbHVlVHlwZSkpIHtcblx0XHRcdGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRcdFx0dmFsdWUgPSBbdmFsdWVdO1xuXHRcdFx0fVxuXHRcdFx0ZXh0ZXJuYWxWYWx1ZSA9IHZhbHVlLm1hcCgodmFsdWVFbGVtZW50OiBzdHJpbmcpID0+IHtcblx0XHRcdFx0cmV0dXJuIGV4dGVybmFsVHlwZSA/IGV4dGVybmFsVHlwZS5wYXJzZVZhbHVlKHZhbHVlRWxlbWVudCwgVmFsdWUuSU5URVJOQUxfVkFMVUVfVFlQRSkgOiB2YWx1ZUVsZW1lbnQ7XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZXh0ZXJuYWxWYWx1ZSA9IGV4dGVybmFsVHlwZSA/IGV4dGVybmFsVHlwZS5wYXJzZVZhbHVlKHZhbHVlIGFzIHN0cmluZywgVmFsdWUuSU5URVJOQUxfVkFMVUVfVFlQRSkgOiB2YWx1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZXh0ZXJuYWxWYWx1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgdGFyZ2V0IHR5cGUgaXMgYW4gYXJyYXkuXG5cdCAqXG5cdCAqIEBwYXJhbSB0YXJnZXRUeXBlIFRoZSB0YXJnZXQgdHlwZSBuYW1lXG5cdCAqIEByZXR1cm5zIGB0cnVlYCwgaWYgYXJyYXkgdHlwZSAoYGZhbHNlYCBvdGhlcndpc2UpXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwcml2YXRlIHN0YXRpYyBfaXNBcnJheVR5cGUodGFyZ2V0VHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XG5cdFx0aWYgKCF0YXJnZXRUeXBlKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiB0YXJnZXRUeXBlID09PSBcImFycmF5XCIgfHwgdGFyZ2V0VHlwZS5lbmRzV2l0aChcIltdXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGV4dGVybmFsIHZhbHVlIGZvcm1hdHRlZCBhcyB0aGUgaW50ZXJuYWwgc3RyaW5nIHZhbHVlLlxuXHQgKlxuXHQgKiBAcGFyYW0gZXh0ZXJuYWxWYWx1ZSBUaGUgdmFsdWUgdG8gYmUgcGFyc2VkXG5cdCAqIEBwYXJhbSBleHRlcm5hbFZhbHVlVHlwZSBUaGUgZXh0ZXJuYWwgdmFsdWUgdHlwZSwgZS5nLiBpbnQsIGZsb2F0W10sIHN0cmluZywgZXRjLlxuXHQgKiBAcmV0dXJucyBUaGUgZm9ybWF0dGVkIHZhbHVlXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwcml2YXRlIF9leHRlcm5hbFRvU3RyaW5nKGV4dGVybmFsVmFsdWU6IHN0cmluZyB8IHN0cmluZ1tdLCBleHRlcm5hbFZhbHVlVHlwZTogc3RyaW5nIHwgdW5kZWZpbmVkKTogc3RyaW5nIHtcblx0XHRsZXQgdmFsdWU7XG5cdFx0Y29uc3QgZXh0ZXJuYWxUeXBlID0gdGhpcy5fZ2V0VHlwZUluc3RhbmNlKGV4dGVybmFsVmFsdWVUeXBlKTtcblxuXHRcdGlmIChleHRlcm5hbFZhbHVlVHlwZSAmJiBWYWx1ZS5faXNBcnJheVR5cGUoZXh0ZXJuYWxWYWx1ZVR5cGUpKSB7XG5cdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkoZXh0ZXJuYWxWYWx1ZSkpIHtcblx0XHRcdFx0ZXh0ZXJuYWxWYWx1ZSA9IFtleHRlcm5hbFZhbHVlXTtcblx0XHRcdH1cblx0XHRcdHZhbHVlID0gZXh0ZXJuYWxWYWx1ZS5tYXAoKHZhbHVlRWxlbWVudDogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdHJldHVybiBleHRlcm5hbFR5cGUgPyBleHRlcm5hbFR5cGUuZm9ybWF0VmFsdWUodmFsdWVFbGVtZW50LCBWYWx1ZS5JTlRFUk5BTF9WQUxVRV9UWVBFKSA6IHZhbHVlRWxlbWVudDtcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YWx1ZSA9IGV4dGVybmFsVHlwZSA/IGV4dGVybmFsVHlwZS5mb3JtYXRWYWx1ZShleHRlcm5hbFZhbHVlIGFzIHN0cmluZywgVmFsdWUuSU5URVJOQUxfVkFMVUVfVFlQRSkgOiBleHRlcm5hbFZhbHVlO1xuXHRcdH1cblxuXHRcdHJldHVybiB2YWx1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIGRlZmF1bHQgdHlwZSBpbnN0YW5jZSBmb3IgZ2l2ZW4gdHlwZSBuYW1lLlxuXHQgKlxuXHQgKiBAcGFyYW0gdHlwZU5hbWUgVGhlIG5hbWUgb2YgdGhlIHR5cGVcblx0ICogQHJldHVybnMgVGhlIHR5cGUgaW5zdGFuY2Vcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHByaXZhdGUgX2dldFR5cGVJbnN0YW5jZSh0eXBlTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkKTogU2ltcGxlVHlwZSB7XG5cdFx0dHlwZU5hbWUgPSB0aGlzLmdldEVsZW1lbnRUeXBlTmFtZSh0eXBlTmFtZSkgfHwgdHlwZU5hbWU7XG5cblx0XHRzd2l0Y2ggKHR5cGVOYW1lKSB7XG5cdFx0XHRjYXNlIFwic3RyaW5nXCI6XG5cdFx0XHRcdHJldHVybiBuZXcgU3RyaW5nVHlwZSgpO1xuXHRcdFx0Y2FzZSBcIm51bWJlclwiOlxuXHRcdFx0Y2FzZSBcImludFwiOlxuXHRcdFx0XHRyZXR1cm4gbmV3IEludGVnZXJUeXBlKCk7XG5cdFx0XHRjYXNlIFwiZmxvYXRcIjpcblx0XHRcdFx0cmV0dXJuIG5ldyBGbG9hdFR5cGUoKTtcblx0XHRcdGNhc2UgXCJkYXRlXCI6XG5cdFx0XHRcdHJldHVybiBuZXcgRGF0ZVR5cGUoKTtcblx0XHRcdGNhc2UgXCJib29sZWFuXCI6XG5cdFx0XHRcdHJldHVybiBuZXcgQm9vbGVhblR5cGUoKTtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdExvZy5lcnJvcihcIlVuZXhwZWN0ZWQgZmlsdGVyIHR5cGVcIik7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgZmlsdGVyIHR5cGVcIik7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGRlZmF1bHQgb3BlcmF0b3IgbmFtZSAoXCJFUVwiKS5cblx0ICogU2hvdWxkIGJlIG92ZXJyaWRkZW4gb24gZGVtYW5kLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgZGVmYXVsdCBvcGVyYXRvciBuYW1lXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdGdldERlZmF1bHRPcGVyYXRvck5hbWUoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gKEZpbHRlck9wZXJhdG9yVXRpbC5nZXRFUU9wZXJhdG9yKCkgYXMgQXVnbWVudGVkT3BlcmF0b3IpLm5hbWU7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBmaXJzdCB2YWx1ZSBvZiBhcnJheSBvciBpbnB1dC5cblx0ICpcblx0ICogQHBhcmFtIHZhbHVlcyBJbnB1dCBjb25kaXRpb24gdmFsdWVcblx0ICogQHJldHVybnMgVW5jaGFuZ2VkIGlucHV0IGNvbmRpdGlvbiB2YWx1ZVxuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRmb3JtYXRDb25kaXRpb25WYWx1ZXModmFsdWVzOiBzdHJpbmdbXSB8IHN0cmluZyk6IHN0cmluZ1tdIHwgc3RyaW5nIHtcblx0XHRyZXR1cm4gQXJyYXkuaXNBcnJheSh2YWx1ZXMpICYmIHZhbHVlcy5sZW5ndGggPyB2YWx1ZXNbMF0gOiAodmFsdWVzIGFzIHN0cmluZyk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgZWxlbWVudCB0eXBlIG5hbWUuXG5cdCAqXG5cdCAqIEBwYXJhbSB0eXBlTmFtZSBUaGUgYWN0dWFsIHR5cGUgbmFtZVxuXHQgKiBAcmV0dXJucyBUaGUgdHlwZSBvZiBpdHMgZWxlbWVudHNcblx0ICogQHByb3RlY3RlZFxuXHQgKi9cblx0Z2V0RWxlbWVudFR5cGVOYW1lKHR5cGVOYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRcdGlmICh0eXBlTmFtZT8uZW5kc1dpdGgoXCJbXVwiKSkge1xuXHRcdFx0cmV0dXJuIHR5cGVOYW1lLnN1YnN0cmluZygwLCB0eXBlTmFtZS5sZW5ndGggLSAyKTtcblx0XHR9XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBzdHJpbmcgdmFsdWUgcGFyc2VkIHRvIHRoZSBleHRlcm5hbCB2YWx1ZSB0eXBlICd0aGlzLm9wZXJhdG9yJy5cblx0ICpcblx0ICogQHBhcmFtIGludGVybmFsVmFsdWUgVGhlIGludGVybmFsIHN0cmluZyB2YWx1ZSB0byBiZSBmb3JtYXR0ZWRcblx0ICogQHBhcmFtIGV4dGVybmFsVmFsdWVUeXBlIFRoZSBleHRlcm5hbCB2YWx1ZSB0eXBlLCBlLmcuIGludCwgZmxvYXRbXSwgc3RyaW5nLCBldGMuXG5cdCAqIEByZXR1cm5zIFRoZSBmb3JtYXR0ZWQgdmFsdWVcblx0ICogQHByb3RlY3RlZFxuXHQgKi9cblx0Zm9ybWF0VmFsdWUoaW50ZXJuYWxWYWx1ZTogYW55IHwgdW5kZWZpbmVkLCBleHRlcm5hbFZhbHVlVHlwZTogc3RyaW5nIHwgdW5kZWZpbmVkKTogYW55IHtcblx0XHRpZiAoIWludGVybmFsVmFsdWUpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdGNvbnN0IGlzTXVsdGlWYWx1ZU9wZXJhdG9yID0gdGhpcy5faXNNdWx0aVZhbHVlT3BlcmF0b3IodGhpcy5vcGVyYXRvciksXG5cdFx0XHRpbnRlcm5hbFR5cGUgPSB0aGlzLl9nZXRUeXBlSW5zdGFuY2UoVmFsdWUuSU5URVJOQUxfVkFMVUVfVFlQRSk7XG5cblx0XHQvLyAgZnJvbSBpbnRlcm5hbCBtb2RlbCBzdHJpbmcgd2l0aCBvcGVyYXRvclxuXHRcdGNvbnN0IHZhbHVlcyA9IHRoaXMub3BlcmF0b3IucGFyc2UoaW50ZXJuYWxWYWx1ZSB8fCBcIlwiLCBpbnRlcm5hbFR5cGUsIEZpZWxkRGlzcGxheS5WYWx1ZSwgZmFsc2UpO1xuXHRcdGNvbnN0IHZhbHVlID0gIWlzTXVsdGlWYWx1ZU9wZXJhdG9yICYmIEFycmF5LmlzQXJyYXkodmFsdWVzKSA/IHZhbHVlc1swXSA6IHZhbHVlcztcblxuXHRcdHJldHVybiB0aGlzLl9zdHJpbmdUb0V4dGVybmFsKHZhbHVlLCBleHRlcm5hbFZhbHVlVHlwZSk7IC8vIFRoZSB2YWx1ZSBib3VuZCB0byBhIGN1c3RvbSBmaWx0ZXJcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSB2YWx1ZSBwYXJzZWQgdG8gdGhlIGludGVybmFsIHN0cmluZyB2YWx1ZS5cblx0ICpcblx0ICogQHBhcmFtIGV4dGVybmFsVmFsdWUgVGhlIHZhbHVlIHRvIGJlIHBhcnNlZFxuXHQgKiBAcGFyYW0gZXh0ZXJuYWxWYWx1ZVR5cGUgVGhlIGV4dGVybmFsIHZhbHVlIHR5cGUsIGUuZy4gaW50LCBmbG9hdFtdLCBzdHJpbmcsIGV0Yy5cblx0ICogQHJldHVybnMgVGhlIHBhcnNlZCB2YWx1ZVxuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRwYXJzZVZhbHVlKGV4dGVybmFsVmFsdWU6IGFueSB8IHVuZGVmaW5lZCwgZXh0ZXJuYWxWYWx1ZVR5cGU6IHN0cmluZyB8IHVuZGVmaW5lZCk6IGFueSB7XG5cdFx0aWYgKCFleHRlcm5hbFZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRjb25zdCBpc011bHRpVmFsdWVPcGVyYXRvciA9IHRoaXMuX2lzTXVsdGlWYWx1ZU9wZXJhdG9yKHRoaXMub3BlcmF0b3IpLFxuXHRcdFx0ZXh0ZXJuYWxUeXBlID0gdGhpcy5fZ2V0VHlwZUluc3RhbmNlKGV4dGVybmFsVmFsdWVUeXBlKTtcblxuXHRcdGNvbnN0IHZhbHVlID0gdGhpcy5fZXh0ZXJuYWxUb1N0cmluZyhleHRlcm5hbFZhbHVlLCBleHRlcm5hbFZhbHVlVHlwZSk7XG5cblx0XHQvLyBGb3JtYXQgdG8gaW50ZXJuYWwgbW9kZWwgc3RyaW5nIHdpdGggb3BlcmF0b3Jcblx0XHRjb25zdCB2YWx1ZXMgPSBpc011bHRpVmFsdWVPcGVyYXRvciA/IHZhbHVlIDogW3ZhbHVlXTtcblxuXHRcdGlmICh0aGlzLmhhc0N1c3RvbU9wZXJhdG9yKCkpIHtcblx0XHRcdC8vIFJldHVybiBhIGNvbXBsZXggb2JqZWN0IHdoaWxlIHBhcnNpbmcgdGhlIGJvdW5kIHZhbHVlIGluIHNhcC51aS5tb2RlbC5Qcm9wZXJ0eUJpbmRpbmcuanMjX2V4dGVybmFsVG9SYXcoKVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0b3BlcmF0b3I6IHRoaXMub3BlcmF0b3IubmFtZSxcblx0XHRcdFx0dmFsdWVzOiBbdGhpcy5vcGVyYXRvci5mb3JtYXQoeyB2YWx1ZXM6IHZhbHVlcyB9IGFzIENvbmRpdGlvbk9iamVjdCwgZXh0ZXJuYWxUeXBlKV0sXG5cdFx0XHRcdHZhbGlkYXRlZDogdW5kZWZpbmVkXG5cdFx0XHR9O1xuXHRcdH1cblx0XHQvLyBSZXR1cm4gYSBzaW1wbGUgc3RyaW5nIHZhbHVlIHRvIGJlIHN0b3JlZCBpbiB0aGUgaW50ZXJuYWwgJ2ZpbHRlclZhbHVlcycgbW9kZWxcblx0XHRyZXR1cm4gdGhpcy5vcGVyYXRvci5mb3JtYXQoeyB2YWx1ZXM6IHZhbHVlcyB9IGFzIENvbmRpdGlvbk9iamVjdCwgZXh0ZXJuYWxUeXBlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBWYWxpZGF0ZXMgd2hldGhlciB0aGUgZ2l2ZW4gdmFsdWUgaW4gbW9kZWwgcmVwcmVzZW50YXRpb24gaXMgdmFsaWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBleHRlcm5hbFZhbHVlIFRoZSB2YWx1ZSB0byBiZSB2YWxpZGF0ZWRcblx0ICogQHByb3RlY3RlZFxuXHQgKi9cblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHR2YWxpZGF0ZVZhbHVlKGV4dGVybmFsVmFsdWU6IHVua25vd24pOiB2b2lkIHtcblx0XHQvKiBEbyBOb3RoaW5nICovXG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7O01BNkJxQkEsS0FBSztFQUoxQjtBQUNBO0FBQ0E7RUFGQSxPQUdDQyxjQUFjLENBQUMsaUNBQWlDLENBQUM7SUFBQTtJQVFqRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0MsZUFBWUMsYUFBb0MsRUFBRUMsV0FBbUIsRUFBRTtNQUFBO01BQ3RFLCtCQUFNRCxhQUFhLEVBQUVDLFdBQVcs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