/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/SemanticDateOperators", "sap/ui/base/ManagedObjectObserver", "sap/ui/core/Control", "sap/ui/mdc/condition/Condition", "sap/ui/mdc/enum/ConditionValidated", "sap/ui/mdc/field/ConditionsType", "sap/ui/model/json/JSONModel"], function (ClassSupport, SemanticDateOperators, ManagedObjectObserver, Control, Condition, ConditionValidated, ConditionsType, JSONModel) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _class3;
  var _exports = {};
  var property = ClassSupport.property;
  var implementInterface = ClassSupport.implementInterface;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let CustomFilterFieldContentWrapper = (
  /**
   * @class
   * Creates an <code>sap.fe.macros.controls.CustomFilterFieldContentWrapper</code> object.
   * This is used in the {@link sap.ui.mdc.FilterField FilterField} as a filter content.
   * @extends sap.ui.core.Control
   * @private
   * @alias sap.fe.core.macros.CustomFilterFieldContentWrapper
   */
  _dec = defineUI5Class("sap.fe.macros.controls.CustomFilterFieldContentWrapper"), _dec2 = implementInterface("sap.ui.core.IFormContent"), _dec3 = property({
    type: "sap.ui.core.CSSSize",
    defaultValue: null
  }), _dec4 = property({
    type: "boolean",
    defaultValue: false
  }), _dec5 = property({
    type: "object[]",
    defaultValue: []
  }), _dec6 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false,
    isDefault: true
  }), _dec7 = event(), _dec(_class = (_class2 = (_class3 = /*#__PURE__*/function (_Control) {
    _inheritsLoose(CustomFilterFieldContentWrapper, _Control);
    function CustomFilterFieldContentWrapper() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _Control.call(this, ...args) || this;
      _initializerDefineProperty(_this, "__implements__sap_ui_core_IFormContent", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "width", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formDoNotAdjustWidth", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "conditions", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "content", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "conditionsChange", _descriptor6, _assertThisInitialized(_this));
      return _this;
    }
    _exports = CustomFilterFieldContentWrapper;
    CustomFilterFieldContentWrapper.render = function render(renderManager, control) {
      renderManager.openStart("div", control);
      renderManager.style("min-height", "1rem");
      renderManager.style("width", control.width);
      renderManager.openEnd();
      renderManager.renderControl(control.getContent()); // render the child Control
      renderManager.close("div"); // end of the complete Control
    }

    /**
     * Maps an array of filter values to an array of conditions.
     *
     * @param filterValues Array of filter value bindings or a filter value string
     * @param [operator] The operator to be used (optional) - if not set, the default operator (EQ) will be used
     * @private
     * @returns Array of filter conditions
     */;
    CustomFilterFieldContentWrapper._filterValuesToConditions = function _filterValuesToConditions(filterValues, operator) {
      let formatOptions = {
          operators: []
        },
        conditions = [];
      if (operator) {
        formatOptions = {
          operators: [operator]
        };
      }
      if (filterValues === "") {
        filterValues = [];
      } else if (typeof filterValues === "object" && filterValues.hasOwnProperty("operator") && filterValues.hasOwnProperty("values")) {
        formatOptions = {
          operators: [filterValues.operator]
        };
        filterValues = filterValues.values;
      } else if (filterValues !== undefined && typeof filterValues !== "object" && typeof filterValues !== "string") {
        throw new Error(`FilterUtils.js#_filterValuesToConditions: Unexpected type of input parameter vValues: ${typeof filterValues}`);
      }
      const conditionsType = new ConditionsType(formatOptions);
      const conditionValues = Array.isArray(filterValues) ? filterValues : [filterValues];

      // Shortcut for operator without values and semantic date operations
      if (typeof operator === "string" && (conditionValues.length === 0 || SemanticDateOperators.getSemanticDateOperations().includes(operator))) {
        conditions = [Condition.createCondition(operator, conditionValues, null, null, ConditionValidated.NotValidated)];
      } else {
        conditions = conditionValues.map(conditionValue => {
          const stringValue = conditionValue === null || conditionValue === void 0 ? void 0 : conditionValue.toString(),
            parsedConditions = conditionsType.parseValue(stringValue, "any");
          return parsedConditions === null || parsedConditions === void 0 ? void 0 : parsedConditions[0];
        }).filter(conditionValue => conditionValue !== undefined);
      }
      return conditions;
    }

    /**
     * Maps an array of conditions to a comma separated list of filter values.
     *
     * @param conditions Array of filter conditions
     * @param formatOptions Format options that specifies a condition type
     * @private
     * @returns Concatenated string of filter values
     */;
    CustomFilterFieldContentWrapper._conditionsToFilterModelString = function _conditionsToFilterModelString(conditions, formatOptions) {
      const conditionsType = new ConditionsType(formatOptions);
      return conditions.map(condition => {
        return conditionsType.formatValue([condition], "any") || "";
      }).filter(stringValue => {
        return stringValue !== "";
      }).join(",");
    }

    /**
     * Listens to filter model changes and updates wrapper property "conditions".
     *
     * @param changeEvent Event triggered by a filter model change
     * @private
     */;
    var _proto = CustomFilterFieldContentWrapper.prototype;
    _proto._handleFilterModelChange = function _handleFilterModelChange(changeEvent) {
      var _this$getObjectBindin;
      const propertyPath = (_this$getObjectBindin = this.getObjectBinding("filterValues")) === null || _this$getObjectBindin === void 0 ? void 0 : _this$getObjectBindin.getPath(),
        values = changeEvent.getSource().getProperty(propertyPath);
      this.updateConditionsByFilterValues(values, "");
    }

    /**
     * Listens to "conditions" changes and updates the filter model.
     *
     * @param conditions Event triggered by a "conditions" change
     * @private
     */;
    _proto._handleConditionsChange = function _handleConditionsChange(conditions) {
      this.updateFilterModelByConditions(conditions);
    }

    /**
     * Initialize CustomFilterFieldContentWrapper control and register observer.
     */;
    _proto.init = function init() {
      _Control.prototype.init.call(this);
      this._conditionsObserver = new ManagedObjectObserver(this._observeChanges.bind(this));
      this._conditionsObserver.observe(this, {
        properties: ["conditions"]
      });
      this._filterModel = new JSONModel();
      this._filterModel.attachPropertyChange(this._handleFilterModelChange, this);
      this.setModel(this._filterModel, CustomFilterFieldContentWrapper.FILTER_MODEL_ALIAS);
    }

    /**
     * Overrides {@link sap.ui.core.Control#clone Control.clone} to clone additional
     * internal states.
     *
     * @param [sIdSuffix] A suffix to be appended to the cloned control id
     * @param [aLocalIds] An array of local IDs within the cloned hierarchy (internally used)
     * @returns Reference to the newly created clone
     * @protected
     */;
    _proto.clone = function clone(sIdSuffix, aLocalIds) {
      const clone = _Control.prototype.clone.call(this, sIdSuffix, aLocalIds);
      // During cloning, the old model will be copied and overwrites any new model (same alias) that
      // you introduce during init(); hence you need to overwrite it again by the new one that you've
      // created during init() (i.e. clone._filterModel); that standard behaviour of super.clone()
      // can't even be suppressed in an own constructor; for a detailed investigation of the cloning,
      // please overwrite the setModel() method and check the list of callers and steps induced by them.
      clone.setModel(clone._filterModel, CustomFilterFieldContentWrapper.FILTER_MODEL_ALIAS);
      return clone;
    }

    /**
     * Listens to property changes.
     *
     * @param changes Property changes
     * @private
     */;
    _proto._observeChanges = function _observeChanges(changes) {
      if (changes.name === "conditions") {
        this._handleConditionsChange(changes.current);
      }
    }

    /**
     * Gets the content of this wrapper control.
     *
     * @returns The wrapper content
     * @private
     */;
    _proto.getContent = function getContent() {
      return this.getAggregation("content");
    }

    /**
     * Gets the value for control property 'conditions'.
     *
     * @returns Array of filter conditions
     * @private
     */;
    _proto.getConditions = function getConditions() {
      return this.getProperty("conditions");
    }

    /**
     * Sets the value for control property 'conditions'.
     *
     * @param [conditions] Array of filter conditions
     * @returns Reference to this wrapper
     * @private
     */;
    _proto.setConditions = function setConditions(conditions) {
      this.setProperty("conditions", conditions || []);
      return this;
    }

    /**
     * Gets the filter model alias 'filterValues'.
     *
     * @returns The filter model
     * @private
     */;
    _proto.getFilterModelAlias = function getFilterModelAlias() {
      return CustomFilterFieldContentWrapper.FILTER_MODEL_ALIAS;
    }

    /**
     * Updates the property "conditions" with filter values
     * sent by ExtensionAPI#setFilterValues().
     *
     * @param values The filter values
     * @param [operator] The operator name
     * @private
     */;
    _proto.updateConditionsByFilterValues = function updateConditionsByFilterValues(values, operator) {
      const conditions = CustomFilterFieldContentWrapper._filterValuesToConditions(values, operator);
      this.setConditions(conditions);
    }

    /**
     * Updates filter model with conditions
     * sent by the {@link sap.ui.mdc.FilterField FilterField}.
     *
     * @param conditions Array of filter conditions
     * @private
     */;
    _proto.updateFilterModelByConditions = function updateFilterModelByConditions(conditions) {
      var _conditions$;
      const operator = ((_conditions$ = conditions[0]) === null || _conditions$ === void 0 ? void 0 : _conditions$.operator) || "";
      const formatOptions = operator !== "" ? {
        operators: [operator]
      } : {
        operators: []
      };
      if (this.getBindingContext(CustomFilterFieldContentWrapper.FILTER_MODEL_ALIAS)) {
        var _this$getBindingConte;
        const stringValue = CustomFilterFieldContentWrapper._conditionsToFilterModelString(conditions, formatOptions);
        this._filterModel.setProperty((_this$getBindingConte = this.getBindingContext(CustomFilterFieldContentWrapper.FILTER_MODEL_ALIAS)) === null || _this$getBindingConte === void 0 ? void 0 : _this$getBindingConte.getPath(), stringValue);
      }
    };
    _proto.getAccessibilityInfo = function getAccessibilityInfo() {
      var _content$getAccessibi;
      const content = this.getContent();
      return (content === null || content === void 0 ? void 0 : (_content$getAccessibi = content.getAccessibilityInfo) === null || _content$getAccessibi === void 0 ? void 0 : _content$getAccessibi.call(content)) || {};
    }

    /**
     * Returns the DOMNode ID to be used for the "labelFor" attribute.
     *
     * We forward the call of this method to the content control.
     *
     * @returns ID to be used for the <code>labelFor</code>
     */;
    _proto.getIdForLabel = function getIdForLabel() {
      const content = this.getContent();
      return content === null || content === void 0 ? void 0 : content.getIdForLabel();
    };
    return CustomFilterFieldContentWrapper;
  }(Control), _class3.FILTER_MODEL_ALIAS = "filterValues", _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "__implements__sap_ui_core_IFormContent", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "width", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "formDoNotAdjustWidth", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "conditions", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "content", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "conditionsChange", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = CustomFilterFieldContentWrapper;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDdXN0b21GaWx0ZXJGaWVsZENvbnRlbnRXcmFwcGVyIiwiZGVmaW5lVUk1Q2xhc3MiLCJpbXBsZW1lbnRJbnRlcmZhY2UiLCJwcm9wZXJ0eSIsInR5cGUiLCJkZWZhdWx0VmFsdWUiLCJhZ2dyZWdhdGlvbiIsIm11bHRpcGxlIiwiaXNEZWZhdWx0IiwiZXZlbnQiLCJyZW5kZXIiLCJyZW5kZXJNYW5hZ2VyIiwiY29udHJvbCIsIm9wZW5TdGFydCIsInN0eWxlIiwid2lkdGgiLCJvcGVuRW5kIiwicmVuZGVyQ29udHJvbCIsImdldENvbnRlbnQiLCJjbG9zZSIsIl9maWx0ZXJWYWx1ZXNUb0NvbmRpdGlvbnMiLCJmaWx0ZXJWYWx1ZXMiLCJvcGVyYXRvciIsImZvcm1hdE9wdGlvbnMiLCJvcGVyYXRvcnMiLCJjb25kaXRpb25zIiwiaGFzT3duUHJvcGVydHkiLCJ2YWx1ZXMiLCJ1bmRlZmluZWQiLCJFcnJvciIsImNvbmRpdGlvbnNUeXBlIiwiQ29uZGl0aW9uc1R5cGUiLCJjb25kaXRpb25WYWx1ZXMiLCJBcnJheSIsImlzQXJyYXkiLCJsZW5ndGgiLCJTZW1hbnRpY0RhdGVPcGVyYXRvcnMiLCJnZXRTZW1hbnRpY0RhdGVPcGVyYXRpb25zIiwiaW5jbHVkZXMiLCJDb25kaXRpb24iLCJjcmVhdGVDb25kaXRpb24iLCJDb25kaXRpb25WYWxpZGF0ZWQiLCJOb3RWYWxpZGF0ZWQiLCJtYXAiLCJjb25kaXRpb25WYWx1ZSIsInN0cmluZ1ZhbHVlIiwidG9TdHJpbmciLCJwYXJzZWRDb25kaXRpb25zIiwicGFyc2VWYWx1ZSIsImZpbHRlciIsIl9jb25kaXRpb25zVG9GaWx0ZXJNb2RlbFN0cmluZyIsImNvbmRpdGlvbiIsImZvcm1hdFZhbHVlIiwiam9pbiIsIl9oYW5kbGVGaWx0ZXJNb2RlbENoYW5nZSIsImNoYW5nZUV2ZW50IiwicHJvcGVydHlQYXRoIiwiZ2V0T2JqZWN0QmluZGluZyIsImdldFBhdGgiLCJnZXRTb3VyY2UiLCJnZXRQcm9wZXJ0eSIsInVwZGF0ZUNvbmRpdGlvbnNCeUZpbHRlclZhbHVlcyIsIl9oYW5kbGVDb25kaXRpb25zQ2hhbmdlIiwidXBkYXRlRmlsdGVyTW9kZWxCeUNvbmRpdGlvbnMiLCJpbml0IiwiX2NvbmRpdGlvbnNPYnNlcnZlciIsIk1hbmFnZWRPYmplY3RPYnNlcnZlciIsIl9vYnNlcnZlQ2hhbmdlcyIsImJpbmQiLCJvYnNlcnZlIiwicHJvcGVydGllcyIsIl9maWx0ZXJNb2RlbCIsIkpTT05Nb2RlbCIsImF0dGFjaFByb3BlcnR5Q2hhbmdlIiwic2V0TW9kZWwiLCJGSUxURVJfTU9ERUxfQUxJQVMiLCJjbG9uZSIsInNJZFN1ZmZpeCIsImFMb2NhbElkcyIsImNoYW5nZXMiLCJuYW1lIiwiY3VycmVudCIsImdldEFnZ3JlZ2F0aW9uIiwiZ2V0Q29uZGl0aW9ucyIsInNldENvbmRpdGlvbnMiLCJzZXRQcm9wZXJ0eSIsImdldEZpbHRlck1vZGVsQWxpYXMiLCJnZXRCaW5kaW5nQ29udGV4dCIsImdldEFjY2Vzc2liaWxpdHlJbmZvIiwiY29udGVudCIsImdldElkRm9yTGFiZWwiLCJDb250cm9sIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDdXN0b21GaWx0ZXJGaWVsZENvbnRlbnRXcmFwcGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGFnZ3JlZ2F0aW9uLCBkZWZpbmVVSTVDbGFzcywgZXZlbnQsIGltcGxlbWVudEludGVyZmFjZSwgcHJvcGVydHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBTZW1hbnRpY0RhdGVPcGVyYXRvcnMgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU2VtYW50aWNEYXRlT3BlcmF0b3JzXCI7XG5pbXBvcnQgTWFuYWdlZE9iamVjdE9ic2VydmVyIGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0T2JzZXJ2ZXJcIjtcbmltcG9ydCBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7IC8vaW1wb3J0IENvbnRyb2wgZnJvbSBcInNhcC91aS9tZGMvZmllbGQvRmllbGRCYXNlXCI7XG5pbXBvcnQgdHlwZSB7IElGb3JtQ29udGVudCB9IGZyb20gXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgdHlwZSBSZW5kZXJNYW5hZ2VyIGZyb20gXCJzYXAvdWkvY29yZS9SZW5kZXJNYW5hZ2VyXCI7XG5pbXBvcnQgdHlwZSB7IENvbmRpdGlvbk9iamVjdCB9IGZyb20gXCJzYXAvdWkvbWRjL2NvbmRpdGlvbi9Db25kaXRpb25cIjtcbmltcG9ydCBDb25kaXRpb24gZnJvbSBcInNhcC91aS9tZGMvY29uZGl0aW9uL0NvbmRpdGlvblwiO1xuaW1wb3J0IENvbmRpdGlvblZhbGlkYXRlZCBmcm9tIFwic2FwL3VpL21kYy9lbnVtL0NvbmRpdGlvblZhbGlkYXRlZFwiO1xuaW1wb3J0IENvbmRpdGlvbnNUeXBlIGZyb20gXCJzYXAvdWkvbWRjL2ZpZWxkL0NvbmRpdGlvbnNUeXBlXCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcblxuLyoqXG4gKiBUeXBlIHVzZWQgZm9yIGZvcm1hdCBvcHRpb25zXG4gKlxuICogQHR5cGVkZWYgRm9ybWF0T3B0aW9uc1R5cGVcbiAqL1xudHlwZSBGb3JtYXRPcHRpb25zVHlwZSA9IHtcblx0b3BlcmF0b3JzOiBzdHJpbmdbXTtcbn07XG5cbi8qKlxuICogQGNsYXNzXG4gKiBDcmVhdGVzIGFuIDxjb2RlPnNhcC5mZS5tYWNyb3MuY29udHJvbHMuQ3VzdG9tRmlsdGVyRmllbGRDb250ZW50V3JhcHBlcjwvY29kZT4gb2JqZWN0LlxuICogVGhpcyBpcyB1c2VkIGluIHRoZSB7QGxpbmsgc2FwLnVpLm1kYy5GaWx0ZXJGaWVsZCBGaWx0ZXJGaWVsZH0gYXMgYSBmaWx0ZXIgY29udGVudC5cbiAqIEBleHRlbmRzIHNhcC51aS5jb3JlLkNvbnRyb2xcbiAqIEBwcml2YXRlXG4gKiBAYWxpYXMgc2FwLmZlLmNvcmUubWFjcm9zLkN1c3RvbUZpbHRlckZpZWxkQ29udGVudFdyYXBwZXJcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLm1hY3Jvcy5jb250cm9scy5DdXN0b21GaWx0ZXJGaWVsZENvbnRlbnRXcmFwcGVyXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDdXN0b21GaWx0ZXJGaWVsZENvbnRlbnRXcmFwcGVyIGV4dGVuZHMgQ29udHJvbCBpbXBsZW1lbnRzIElGb3JtQ29udGVudCB7XG5cdEBpbXBsZW1lbnRJbnRlcmZhY2UoXCJzYXAudWkuY29yZS5JRm9ybUNvbnRlbnRcIilcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuXHRfX2ltcGxlbWVudHNfX3NhcF91aV9jb3JlX0lGb3JtQ29udGVudCA9IHRydWU7XG5cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzYXAudWkuY29yZS5DU1NTaXplXCIsIGRlZmF1bHRWYWx1ZTogbnVsbCB9KVxuXHR3aWR0aCE6IHN0cmluZztcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiBmYWxzZSB9KVxuXHRmb3JtRG9Ob3RBZGp1c3RXaWR0aCE6IGJvb2xlYW47XG5cblx0QHByb3BlcnR5KHsgdHlwZTogXCJvYmplY3RbXVwiLCBkZWZhdWx0VmFsdWU6IFtdIH0pXG5cdGNvbmRpdGlvbnMhOiBDb25kaXRpb25PYmplY3RbXTtcblxuXHRAYWdncmVnYXRpb24oeyB0eXBlOiBcInNhcC51aS5jb3JlLkNvbnRyb2xcIiwgbXVsdGlwbGU6IGZhbHNlLCBpc0RlZmF1bHQ6IHRydWUgfSlcblx0Y29udGVudCE6IENvbnRyb2w7XG5cblx0QGV2ZW50KClcblx0Y29uZGl0aW9uc0NoYW5nZSE6IEZ1bmN0aW9uO1xuXG5cdC8vIE5vdGU6IEZpZWxkQmFzZSBtaWdodCBiZSB1c2VkIGFzIGJhc2UgY29udHJvbCAoaW5zdGVhZCBvZiBDb250cm9sKSBpbiBhIGxhdGVyIHZlcnNpb247XG5cdC8vIGluIHRoYXQgY2FzZSwgeW91IHNob3VsZCBhZGQgYSAnY2hhbmdlJyBldmVudCBhbmQgYnViYmxlIGl0IHRvIHRoZSBjb3JyZXNwb25kaW5nIGhhbmRsZXJzXG5cblx0cHJpdmF0ZSBfZmlsdGVyTW9kZWw6IGFueTtcblxuXHRwcml2YXRlIF9jb25kaXRpb25zT2JzZXJ2ZXI6IGFueTtcblxuXHRwcml2YXRlIHN0YXRpYyByZWFkb25seSBGSUxURVJfTU9ERUxfQUxJQVMgPSBcImZpbHRlclZhbHVlc1wiO1xuXG5cdHN0YXRpYyByZW5kZXIocmVuZGVyTWFuYWdlcjogUmVuZGVyTWFuYWdlciwgY29udHJvbDogQ3VzdG9tRmlsdGVyRmllbGRDb250ZW50V3JhcHBlcik6IHZvaWQge1xuXHRcdHJlbmRlck1hbmFnZXIub3BlblN0YXJ0KFwiZGl2XCIsIGNvbnRyb2wpO1xuXHRcdHJlbmRlck1hbmFnZXIuc3R5bGUoXCJtaW4taGVpZ2h0XCIsIFwiMXJlbVwiKTtcblx0XHRyZW5kZXJNYW5hZ2VyLnN0eWxlKFwid2lkdGhcIiwgY29udHJvbC53aWR0aCk7XG5cdFx0cmVuZGVyTWFuYWdlci5vcGVuRW5kKCk7XG5cdFx0cmVuZGVyTWFuYWdlci5yZW5kZXJDb250cm9sKGNvbnRyb2wuZ2V0Q29udGVudCgpKTsgLy8gcmVuZGVyIHRoZSBjaGlsZCBDb250cm9sXG5cdFx0cmVuZGVyTWFuYWdlci5jbG9zZShcImRpdlwiKTsgLy8gZW5kIG9mIHRoZSBjb21wbGV0ZSBDb250cm9sXG5cdH1cblxuXHQvKipcblx0ICogTWFwcyBhbiBhcnJheSBvZiBmaWx0ZXIgdmFsdWVzIHRvIGFuIGFycmF5IG9mIGNvbmRpdGlvbnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBmaWx0ZXJWYWx1ZXMgQXJyYXkgb2YgZmlsdGVyIHZhbHVlIGJpbmRpbmdzIG9yIGEgZmlsdGVyIHZhbHVlIHN0cmluZ1xuXHQgKiBAcGFyYW0gW29wZXJhdG9yXSBUaGUgb3BlcmF0b3IgdG8gYmUgdXNlZCAob3B0aW9uYWwpIC0gaWYgbm90IHNldCwgdGhlIGRlZmF1bHQgb3BlcmF0b3IgKEVRKSB3aWxsIGJlIHVzZWRcblx0ICogQHByaXZhdGVcblx0ICogQHJldHVybnMgQXJyYXkgb2YgZmlsdGVyIGNvbmRpdGlvbnNcblx0ICovXG5cdHN0YXRpYyBfZmlsdGVyVmFsdWVzVG9Db25kaXRpb25zKGZpbHRlclZhbHVlczogYW55IHwgYW55W10sIG9wZXJhdG9yPzogc3RyaW5nKTogQ29uZGl0aW9uT2JqZWN0W10ge1xuXHRcdGxldCBmb3JtYXRPcHRpb25zOiBGb3JtYXRPcHRpb25zVHlwZSA9IHsgb3BlcmF0b3JzOiBbXSB9LFxuXHRcdFx0Y29uZGl0aW9ucyA9IFtdO1xuXG5cdFx0aWYgKG9wZXJhdG9yKSB7XG5cdFx0XHRmb3JtYXRPcHRpb25zID0geyBvcGVyYXRvcnM6IFtvcGVyYXRvcl0gfTtcblx0XHR9XG5cdFx0aWYgKGZpbHRlclZhbHVlcyA9PT0gXCJcIikge1xuXHRcdFx0ZmlsdGVyVmFsdWVzID0gW107XG5cdFx0fSBlbHNlIGlmICh0eXBlb2YgZmlsdGVyVmFsdWVzID09PSBcIm9iamVjdFwiICYmIGZpbHRlclZhbHVlcy5oYXNPd25Qcm9wZXJ0eShcIm9wZXJhdG9yXCIpICYmIGZpbHRlclZhbHVlcy5oYXNPd25Qcm9wZXJ0eShcInZhbHVlc1wiKSkge1xuXHRcdFx0Zm9ybWF0T3B0aW9ucyA9IHsgb3BlcmF0b3JzOiBbZmlsdGVyVmFsdWVzLm9wZXJhdG9yXSB9O1xuXHRcdFx0ZmlsdGVyVmFsdWVzID0gZmlsdGVyVmFsdWVzLnZhbHVlcztcblx0XHR9IGVsc2UgaWYgKGZpbHRlclZhbHVlcyAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBmaWx0ZXJWYWx1ZXMgIT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIGZpbHRlclZhbHVlcyAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBGaWx0ZXJVdGlscy5qcyNfZmlsdGVyVmFsdWVzVG9Db25kaXRpb25zOiBVbmV4cGVjdGVkIHR5cGUgb2YgaW5wdXQgcGFyYW1ldGVyIHZWYWx1ZXM6ICR7dHlwZW9mIGZpbHRlclZhbHVlc31gKTtcblx0XHR9XG5cblx0XHRjb25zdCBjb25kaXRpb25zVHlwZTogYW55ID0gbmV3IENvbmRpdGlvbnNUeXBlKGZvcm1hdE9wdGlvbnMpO1xuXHRcdGNvbnN0IGNvbmRpdGlvblZhbHVlcyA9IEFycmF5LmlzQXJyYXkoZmlsdGVyVmFsdWVzKSA/IGZpbHRlclZhbHVlcyA6IFtmaWx0ZXJWYWx1ZXNdO1xuXG5cdFx0Ly8gU2hvcnRjdXQgZm9yIG9wZXJhdG9yIHdpdGhvdXQgdmFsdWVzIGFuZCBzZW1hbnRpYyBkYXRlIG9wZXJhdGlvbnNcblx0XHRpZiAoXG5cdFx0XHR0eXBlb2Ygb3BlcmF0b3IgPT09IFwic3RyaW5nXCIgJiZcblx0XHRcdChjb25kaXRpb25WYWx1ZXMubGVuZ3RoID09PSAwIHx8IFNlbWFudGljRGF0ZU9wZXJhdG9ycy5nZXRTZW1hbnRpY0RhdGVPcGVyYXRpb25zKCkuaW5jbHVkZXMob3BlcmF0b3IpKVxuXHRcdCkge1xuXHRcdFx0Y29uZGl0aW9ucyA9IFtDb25kaXRpb24uY3JlYXRlQ29uZGl0aW9uKG9wZXJhdG9yLCBjb25kaXRpb25WYWx1ZXMsIG51bGwsIG51bGwsIENvbmRpdGlvblZhbGlkYXRlZC5Ob3RWYWxpZGF0ZWQpXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uZGl0aW9ucyA9IGNvbmRpdGlvblZhbHVlc1xuXHRcdFx0XHQubWFwKChjb25kaXRpb25WYWx1ZSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHN0cmluZ1ZhbHVlID0gY29uZGl0aW9uVmFsdWU/LnRvU3RyaW5nKCksXG5cdFx0XHRcdFx0XHRwYXJzZWRDb25kaXRpb25zID0gY29uZGl0aW9uc1R5cGUucGFyc2VWYWx1ZShzdHJpbmdWYWx1ZSwgXCJhbnlcIik7XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlZENvbmRpdGlvbnM/LlswXTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmZpbHRlcigoY29uZGl0aW9uVmFsdWUpID0+IGNvbmRpdGlvblZhbHVlICE9PSB1bmRlZmluZWQpO1xuXHRcdH1cblxuXHRcdHJldHVybiBjb25kaXRpb25zO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1hcHMgYW4gYXJyYXkgb2YgY29uZGl0aW9ucyB0byBhIGNvbW1hIHNlcGFyYXRlZCBsaXN0IG9mIGZpbHRlciB2YWx1ZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSBjb25kaXRpb25zIEFycmF5IG9mIGZpbHRlciBjb25kaXRpb25zXG5cdCAqIEBwYXJhbSBmb3JtYXRPcHRpb25zIEZvcm1hdCBvcHRpb25zIHRoYXQgc3BlY2lmaWVzIGEgY29uZGl0aW9uIHR5cGVcblx0ICogQHByaXZhdGVcblx0ICogQHJldHVybnMgQ29uY2F0ZW5hdGVkIHN0cmluZyBvZiBmaWx0ZXIgdmFsdWVzXG5cdCAqL1xuXHRzdGF0aWMgX2NvbmRpdGlvbnNUb0ZpbHRlck1vZGVsU3RyaW5nKGNvbmRpdGlvbnM6IG9iamVjdFtdLCBmb3JtYXRPcHRpb25zOiBGb3JtYXRPcHRpb25zVHlwZSk6IHN0cmluZyB7XG5cdFx0Y29uc3QgY29uZGl0aW9uc1R5cGUgPSBuZXcgQ29uZGl0aW9uc1R5cGUoZm9ybWF0T3B0aW9ucyk7XG5cblx0XHRyZXR1cm4gY29uZGl0aW9uc1xuXHRcdFx0Lm1hcCgoY29uZGl0aW9uKSA9PiB7XG5cdFx0XHRcdHJldHVybiBjb25kaXRpb25zVHlwZS5mb3JtYXRWYWx1ZShbY29uZGl0aW9uXSwgXCJhbnlcIikgfHwgXCJcIjtcblx0XHRcdH0pXG5cdFx0XHQuZmlsdGVyKChzdHJpbmdWYWx1ZSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gc3RyaW5nVmFsdWUgIT09IFwiXCI7XG5cdFx0XHR9KVxuXHRcdFx0LmpvaW4oXCIsXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIExpc3RlbnMgdG8gZmlsdGVyIG1vZGVsIGNoYW5nZXMgYW5kIHVwZGF0ZXMgd3JhcHBlciBwcm9wZXJ0eSBcImNvbmRpdGlvbnNcIi5cblx0ICpcblx0ICogQHBhcmFtIGNoYW5nZUV2ZW50IEV2ZW50IHRyaWdnZXJlZCBieSBhIGZpbHRlciBtb2RlbCBjaGFuZ2Vcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9oYW5kbGVGaWx0ZXJNb2RlbENoYW5nZShjaGFuZ2VFdmVudDogYW55KTogdm9pZCB7XG5cdFx0Y29uc3QgcHJvcGVydHlQYXRoID0gdGhpcy5nZXRPYmplY3RCaW5kaW5nKFwiZmlsdGVyVmFsdWVzXCIpPy5nZXRQYXRoKCksXG5cdFx0XHR2YWx1ZXMgPSBjaGFuZ2VFdmVudC5nZXRTb3VyY2UoKS5nZXRQcm9wZXJ0eShwcm9wZXJ0eVBhdGgpO1xuXHRcdHRoaXMudXBkYXRlQ29uZGl0aW9uc0J5RmlsdGVyVmFsdWVzKHZhbHVlcywgXCJcIik7XG5cdH1cblxuXHQvKipcblx0ICogTGlzdGVucyB0byBcImNvbmRpdGlvbnNcIiBjaGFuZ2VzIGFuZCB1cGRhdGVzIHRoZSBmaWx0ZXIgbW9kZWwuXG5cdCAqXG5cdCAqIEBwYXJhbSBjb25kaXRpb25zIEV2ZW50IHRyaWdnZXJlZCBieSBhIFwiY29uZGl0aW9uc1wiIGNoYW5nZVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2hhbmRsZUNvbmRpdGlvbnNDaGFuZ2UoY29uZGl0aW9uczogYW55KTogdm9pZCB7XG5cdFx0dGhpcy51cGRhdGVGaWx0ZXJNb2RlbEJ5Q29uZGl0aW9ucyhjb25kaXRpb25zKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplIEN1c3RvbUZpbHRlckZpZWxkQ29udGVudFdyYXBwZXIgY29udHJvbCBhbmQgcmVnaXN0ZXIgb2JzZXJ2ZXIuXG5cdCAqL1xuXHRpbml0KCk6IHZvaWQge1xuXHRcdHN1cGVyLmluaXQoKTtcblx0XHR0aGlzLl9jb25kaXRpb25zT2JzZXJ2ZXIgPSBuZXcgTWFuYWdlZE9iamVjdE9ic2VydmVyKHRoaXMuX29ic2VydmVDaGFuZ2VzLmJpbmQodGhpcykpO1xuXHRcdHRoaXMuX2NvbmRpdGlvbnNPYnNlcnZlci5vYnNlcnZlKHRoaXMsIHtcblx0XHRcdHByb3BlcnRpZXM6IFtcImNvbmRpdGlvbnNcIl1cblx0XHR9KTtcblx0XHR0aGlzLl9maWx0ZXJNb2RlbCA9IG5ldyBKU09OTW9kZWwoKTtcblx0XHR0aGlzLl9maWx0ZXJNb2RlbC5hdHRhY2hQcm9wZXJ0eUNoYW5nZSh0aGlzLl9oYW5kbGVGaWx0ZXJNb2RlbENoYW5nZSwgdGhpcyk7XG5cdFx0dGhpcy5zZXRNb2RlbCh0aGlzLl9maWx0ZXJNb2RlbCwgQ3VzdG9tRmlsdGVyRmllbGRDb250ZW50V3JhcHBlci5GSUxURVJfTU9ERUxfQUxJQVMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE92ZXJyaWRlcyB7QGxpbmsgc2FwLnVpLmNvcmUuQ29udHJvbCNjbG9uZSBDb250cm9sLmNsb25lfSB0byBjbG9uZSBhZGRpdGlvbmFsXG5cdCAqIGludGVybmFsIHN0YXRlcy5cblx0ICpcblx0ICogQHBhcmFtIFtzSWRTdWZmaXhdIEEgc3VmZml4IHRvIGJlIGFwcGVuZGVkIHRvIHRoZSBjbG9uZWQgY29udHJvbCBpZFxuXHQgKiBAcGFyYW0gW2FMb2NhbElkc10gQW4gYXJyYXkgb2YgbG9jYWwgSURzIHdpdGhpbiB0aGUgY2xvbmVkIGhpZXJhcmNoeSAoaW50ZXJuYWxseSB1c2VkKVxuXHQgKiBAcmV0dXJucyBSZWZlcmVuY2UgdG8gdGhlIG5ld2x5IGNyZWF0ZWQgY2xvbmVcblx0ICogQHByb3RlY3RlZFxuXHQgKi9cblx0Y2xvbmUoc0lkU3VmZml4OiBzdHJpbmcgfCB1bmRlZmluZWQsIGFMb2NhbElkczogc3RyaW5nW10gfCB1bmRlZmluZWQpOiB0aGlzIHtcblx0XHRjb25zdCBjbG9uZSA9IHN1cGVyLmNsb25lKHNJZFN1ZmZpeCwgYUxvY2FsSWRzKTtcblx0XHQvLyBEdXJpbmcgY2xvbmluZywgdGhlIG9sZCBtb2RlbCB3aWxsIGJlIGNvcGllZCBhbmQgb3ZlcndyaXRlcyBhbnkgbmV3IG1vZGVsIChzYW1lIGFsaWFzKSB0aGF0XG5cdFx0Ly8geW91IGludHJvZHVjZSBkdXJpbmcgaW5pdCgpOyBoZW5jZSB5b3UgbmVlZCB0byBvdmVyd3JpdGUgaXQgYWdhaW4gYnkgdGhlIG5ldyBvbmUgdGhhdCB5b3UndmVcblx0XHQvLyBjcmVhdGVkIGR1cmluZyBpbml0KCkgKGkuZS4gY2xvbmUuX2ZpbHRlck1vZGVsKTsgdGhhdCBzdGFuZGFyZCBiZWhhdmlvdXIgb2Ygc3VwZXIuY2xvbmUoKVxuXHRcdC8vIGNhbid0IGV2ZW4gYmUgc3VwcHJlc3NlZCBpbiBhbiBvd24gY29uc3RydWN0b3I7IGZvciBhIGRldGFpbGVkIGludmVzdGlnYXRpb24gb2YgdGhlIGNsb25pbmcsXG5cdFx0Ly8gcGxlYXNlIG92ZXJ3cml0ZSB0aGUgc2V0TW9kZWwoKSBtZXRob2QgYW5kIGNoZWNrIHRoZSBsaXN0IG9mIGNhbGxlcnMgYW5kIHN0ZXBzIGluZHVjZWQgYnkgdGhlbS5cblx0XHRjbG9uZS5zZXRNb2RlbChjbG9uZS5fZmlsdGVyTW9kZWwsIEN1c3RvbUZpbHRlckZpZWxkQ29udGVudFdyYXBwZXIuRklMVEVSX01PREVMX0FMSUFTKTtcblx0XHRyZXR1cm4gY2xvbmU7XG5cdH1cblxuXHQvKipcblx0ICogTGlzdGVucyB0byBwcm9wZXJ0eSBjaGFuZ2VzLlxuXHQgKlxuXHQgKiBAcGFyYW0gY2hhbmdlcyBQcm9wZXJ0eSBjaGFuZ2VzXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfb2JzZXJ2ZUNoYW5nZXMoY2hhbmdlczogYW55KTogdm9pZCB7XG5cdFx0aWYgKGNoYW5nZXMubmFtZSA9PT0gXCJjb25kaXRpb25zXCIpIHtcblx0XHRcdHRoaXMuX2hhbmRsZUNvbmRpdGlvbnNDaGFuZ2UoY2hhbmdlcy5jdXJyZW50KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgY29udGVudCBvZiB0aGlzIHdyYXBwZXIgY29udHJvbC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIHdyYXBwZXIgY29udGVudFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0Z2V0Q29udGVudCgpOiBDb250cm9sIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRBZ2dyZWdhdGlvbihcImNvbnRlbnRcIikgYXMgQ29udHJvbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSB2YWx1ZSBmb3IgY29udHJvbCBwcm9wZXJ0eSAnY29uZGl0aW9ucycuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEFycmF5IG9mIGZpbHRlciBjb25kaXRpb25zXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRnZXRDb25kaXRpb25zKCk6IG9iamVjdFtdIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRQcm9wZXJ0eShcImNvbmRpdGlvbnNcIik7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgdmFsdWUgZm9yIGNvbnRyb2wgcHJvcGVydHkgJ2NvbmRpdGlvbnMnLlxuXHQgKlxuXHQgKiBAcGFyYW0gW2NvbmRpdGlvbnNdIEFycmF5IG9mIGZpbHRlciBjb25kaXRpb25zXG5cdCAqIEByZXR1cm5zIFJlZmVyZW5jZSB0byB0aGlzIHdyYXBwZXJcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHNldENvbmRpdGlvbnMoY29uZGl0aW9uczogb2JqZWN0W10pOiB0aGlzIHtcblx0XHR0aGlzLnNldFByb3BlcnR5KFwiY29uZGl0aW9uc1wiLCBjb25kaXRpb25zIHx8IFtdKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBmaWx0ZXIgbW9kZWwgYWxpYXMgJ2ZpbHRlclZhbHVlcycuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBmaWx0ZXIgbW9kZWxcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGdldEZpbHRlck1vZGVsQWxpYXMoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gQ3VzdG9tRmlsdGVyRmllbGRDb250ZW50V3JhcHBlci5GSUxURVJfTU9ERUxfQUxJQVM7XG5cdH1cblxuXHQvKipcblx0ICogVXBkYXRlcyB0aGUgcHJvcGVydHkgXCJjb25kaXRpb25zXCIgd2l0aCBmaWx0ZXIgdmFsdWVzXG5cdCAqIHNlbnQgYnkgRXh0ZW5zaW9uQVBJI3NldEZpbHRlclZhbHVlcygpLlxuXHQgKlxuXHQgKiBAcGFyYW0gdmFsdWVzIFRoZSBmaWx0ZXIgdmFsdWVzXG5cdCAqIEBwYXJhbSBbb3BlcmF0b3JdIFRoZSBvcGVyYXRvciBuYW1lXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHR1cGRhdGVDb25kaXRpb25zQnlGaWx0ZXJWYWx1ZXModmFsdWVzOiBhbnksIG9wZXJhdG9yPzogc3RyaW5nKTogdm9pZCB7XG5cdFx0Y29uc3QgY29uZGl0aW9ucyA9IEN1c3RvbUZpbHRlckZpZWxkQ29udGVudFdyYXBwZXIuX2ZpbHRlclZhbHVlc1RvQ29uZGl0aW9ucyh2YWx1ZXMsIG9wZXJhdG9yKTtcblx0XHR0aGlzLnNldENvbmRpdGlvbnMoY29uZGl0aW9ucyk7XG5cdH1cblxuXHQvKipcblx0ICogVXBkYXRlcyBmaWx0ZXIgbW9kZWwgd2l0aCBjb25kaXRpb25zXG5cdCAqIHNlbnQgYnkgdGhlIHtAbGluayBzYXAudWkubWRjLkZpbHRlckZpZWxkIEZpbHRlckZpZWxkfS5cblx0ICpcblx0ICogQHBhcmFtIGNvbmRpdGlvbnMgQXJyYXkgb2YgZmlsdGVyIGNvbmRpdGlvbnNcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHVwZGF0ZUZpbHRlck1vZGVsQnlDb25kaXRpb25zKGNvbmRpdGlvbnM6IGFueVtdKTogdm9pZCB7XG5cdFx0Y29uc3Qgb3BlcmF0b3IgPSBjb25kaXRpb25zWzBdPy5vcGVyYXRvciB8fCBcIlwiO1xuXHRcdGNvbnN0IGZvcm1hdE9wdGlvbnM6IEZvcm1hdE9wdGlvbnNUeXBlID0gb3BlcmF0b3IgIT09IFwiXCIgPyB7IG9wZXJhdG9yczogW29wZXJhdG9yXSB9IDogeyBvcGVyYXRvcnM6IFtdIH07XG5cdFx0aWYgKHRoaXMuZ2V0QmluZGluZ0NvbnRleHQoQ3VzdG9tRmlsdGVyRmllbGRDb250ZW50V3JhcHBlci5GSUxURVJfTU9ERUxfQUxJQVMpKSB7XG5cdFx0XHRjb25zdCBzdHJpbmdWYWx1ZSA9IEN1c3RvbUZpbHRlckZpZWxkQ29udGVudFdyYXBwZXIuX2NvbmRpdGlvbnNUb0ZpbHRlck1vZGVsU3RyaW5nKGNvbmRpdGlvbnMsIGZvcm1hdE9wdGlvbnMpO1xuXHRcdFx0dGhpcy5fZmlsdGVyTW9kZWwuc2V0UHJvcGVydHkoXG5cdFx0XHRcdHRoaXMuZ2V0QmluZGluZ0NvbnRleHQoQ3VzdG9tRmlsdGVyRmllbGRDb250ZW50V3JhcHBlci5GSUxURVJfTU9ERUxfQUxJQVMpPy5nZXRQYXRoKCksXG5cdFx0XHRcdHN0cmluZ1ZhbHVlXG5cdFx0XHQpO1xuXHRcdH1cblx0fVxuXG5cdGdldEFjY2Vzc2liaWxpdHlJbmZvKCk6IGFueSB7XG5cdFx0Y29uc3QgY29udGVudCA9IHRoaXMuZ2V0Q29udGVudCgpO1xuXHRcdHJldHVybiBjb250ZW50Py5nZXRBY2Nlc3NpYmlsaXR5SW5mbz8uKCkgfHwge307XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgRE9NTm9kZSBJRCB0byBiZSB1c2VkIGZvciB0aGUgXCJsYWJlbEZvclwiIGF0dHJpYnV0ZS5cblx0ICpcblx0ICogV2UgZm9yd2FyZCB0aGUgY2FsbCBvZiB0aGlzIG1ldGhvZCB0byB0aGUgY29udGVudCBjb250cm9sLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBJRCB0byBiZSB1c2VkIGZvciB0aGUgPGNvZGU+bGFiZWxGb3I8L2NvZGU+XG5cdCAqL1xuXHRnZXRJZEZvckxhYmVsKCk6IHN0cmluZyB7XG5cdFx0Y29uc3QgY29udGVudCA9IHRoaXMuZ2V0Q29udGVudCgpO1xuXHRcdHJldHVybiBjb250ZW50Py5nZXRJZEZvckxhYmVsKCk7XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7TUE4QnFCQSwrQkFBK0I7RUFUcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQVBBLE9BUUNDLGNBQWMsQ0FBQyx3REFBd0QsQ0FBQyxVQUV2RUMsa0JBQWtCLENBQUMsMEJBQTBCLENBQUMsVUFJOUNDLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUscUJBQXFCO0lB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