/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/type/TypeUtil", "sap/fe/macros/internal/valuehelp/ValueListHelper", "sap/m/inputUtils/highlightDOMElements", "sap/ui/mdc/condition/Condition", "sap/ui/mdc/enum/ConditionValidated", "sap/ui/mdc/p13n/StateUtil", "sap/ui/mdc/ValueHelpDelegate", "sap/ui/model/FilterType"], function (Log, CommonUtils, TypeUtil, ValueListHelper, highlightDOMElements, Condition, ConditionValidated, StateUtil, ValueHelpDelegate, FilterType) {
  "use strict";

  const FeCoreControlsFilterBar = "sap.fe.core.controls.FilterBar";
  const MdcFilterbarFilterBarBase = "sap.ui.mdc.filterbar.FilterBarBase";
  return Object.assign({}, ValueHelpDelegate, {
    /**
     * Checks if a <code>ListBinding</code> supports $Search.
     *
     * @param _payload Payload for delegate
     * @param content Content element
     * @param _listBinding
     * @returns True if $search is supported
     */
    isSearchSupported: function (_payload, content, _listBinding) {
      return content.getFilterFields() === "$search";
    },
    /**
     * Adjustable filtering for list-based contents.
     *
     * @param payload Payload for delegate
     * @param content ValueHelp content requesting conditions configuration
     * @param bindingInfo The binding info object to be used to bind the list to the model
     */
    updateBindingInfo: function (payload, content, bindingInfo) {
      ValueHelpDelegate.updateBindingInfo(payload, content, bindingInfo);
      if (content.getFilterFields() === "$search") {
        const search = content.getFilterValue();
        const normalizedSearch = CommonUtils.normalizeSearchTerm(search); // adjustSearch

        if (bindingInfo.parameters) {
          bindingInfo.parameters.$search = normalizedSearch || undefined;
        }
      }
    },
    /**
     * Executes a filter in a <code>ListBinding</code> and resumes it, if suspended.
     *
     * @param _payload Payload for delegate
     * @param listBinding List binding
     * @param bindingInfo The binding info object to be used to bind the list to the model
     */
    updateBinding: function (_payload, listBinding, bindingInfo) {
      const rootBinding = listBinding.getRootBinding() || listBinding;
      if (!rootBinding.isSuspended()) {
        rootBinding.suspend();
      }
      if (bindingInfo.parameters) {
        listBinding.changeParameters(bindingInfo.parameters);
      }
      listBinding.filter(bindingInfo.filters, FilterType.Application);
      if (rootBinding.isSuspended()) {
        rootBinding.resume();
      }
    },
    /**
     * Executes a filter in a <code>ListBinding</code>.
     *
     * @param payload Payload for delegate
     * @param listBinding List binding
     * @param _filter Filter
     * @param requestedItems Number of requested items
     * @returns Promise that is resolved if search is executed
     */
    executeFilter: async function (payload, listBinding, _filter, requestedItems) {
      listBinding.getContexts(0, requestedItems);
      await this.checkListBindingPending(payload, listBinding, requestedItems);
      return listBinding;
    },
    /**
     * Checks if the <code>ListBinding</code> is waiting for an update.
     * As long as the context has not been set for <code>ListBinding</code>,
     * <code>ValueHelp</code> needs to wait.
     *
     * @param _payload Payload for delegate
     * @param listBinding ListBinding to check
     * @param requestedItems Number of requested items
     * @returns Promise that is resolved once ListBinding has been updated
     */
    checkListBindingPending: async function (_payload, listBinding, requestedItems) {
      if (!listBinding || listBinding.isSuspended()) {
        return false;
      }
      const contexts = await listBinding.requestContexts(0, requestedItems);
      return contexts.length === 0;
    },
    getTypeUtil: function (_payload) {
      return TypeUtil;
    },
    /**
     * Requests the content of the value help.
     *
     * This function is called when the value help is opened or a key or description is requested.
     *
     * So, depending on the value help content used, all content controls and data need to be assigned.
     * Once they are assigned and the data is set, the returned <code>Promise</code> needs to be resolved.
     * Only then does the value help continue opening or reading data.
     *
     * @param payload Payload for delegate
     * @param container Container instance
     * @param contentId Id of the content shown after this call to retrieveContent
     * @returns Promise that is resolved if all content is available
     */
    retrieveContent: function (payload, container, contentId) {
      return ValueListHelper.showValueList(payload, container, contentId);
    },
    _getConditionPayloadList: function (condition) {
      const conditionPayloadMap = condition.payload || {},
        valueHelpQualifiers = Object.keys(conditionPayloadMap),
        conditionPayloadList = valueHelpQualifiers.length ? conditionPayloadMap[valueHelpQualifiers[0]] : [];
      return conditionPayloadList;
    },
    _onConditionPropagationToFilterBar: async function (filterBarVH, conditions, outParameters, filterBar) {
      try {
        const state = await StateUtil.retrieveExternalState(filterBar);
        const filterItemsVH = filterBarVH.getFilterItems();
        for (const condition of conditions) {
          const conditionPayloadList = this._getConditionPayloadList(condition);
          for (const outParameter of outParameters) {
            const filterTarget = outParameter.source.split("/").pop() || "";
            // propagate OUT parameter only if the filter field is visible in the LR filterbar
            if (
            // LR FilterBar or LR AdaptFilter
            filterItemsVH.find(item => item.getId().split("::").pop() === filterTarget)) {
              for (const conditionPayload of conditionPayloadList) {
                const newCondition = Condition.createCondition("EQ", [conditionPayload[outParameter.helpPath]], null, null, ConditionValidated.Validated);
                state.filter[filterTarget] ||= [];
                state.filter[filterTarget].push(newCondition);
              }
            }
          }
        }
        StateUtil.applyExternalState(filterBar, state);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        Log.error(`ValueHelpDelegate: ${message}`);
      }
    },
    _onConditionPropagationToBindingContext: function (conditions, outParameters, context) {
      const metaModel = context.getModel().getMetaModel();
      for (const condition of conditions) {
        const conditionPayloadList = this._getConditionPayloadList(condition),
          outValues = conditionPayloadList.length === 1 ? conditionPayloadList[0] : undefined;
        if (conditionPayloadList.length > 1) {
          Log.warning("ValueHelpDelegate: ParameterOut in multi-value-field not supported");
        }
        if (outValues) {
          this._onConditionPropagationUpdateProperty(metaModel, outValues, outParameters, context);
        }
      }
    },
    _onConditionPropagationUpdateProperty: function (metaModel, outValues, outParameters, context) {
      for (const outParameter of outParameters) {
        /* If the key gets updated via out-parameter, then the description needs also retrieved with requestSideEffects */
        if (context.getProperty(outParameter.source) !== outValues[outParameter.helpPath]) {
          var _context$getPath;
          const propertyPath = ((_context$getPath = context.getPath()) === null || _context$getPath === void 0 ? void 0 : _context$getPath.split('(')[0]) + `/${outParameter.source}`;
          const textAnnotation = metaModel === null || metaModel === void 0 ? void 0 : metaModel.getObject(`${propertyPath}@com.sap.vocabularies.Common.v1.Text`);
          if (textAnnotation !== undefined) {
            const textPath = textAnnotation === null || textAnnotation === void 0 ? void 0 : textAnnotation.$Path;
            context.requestSideEffects([textPath.split('/')[0]]);
          }
        }
        context.setProperty(outParameter.source, outValues[outParameter.helpPath]);
      }
    },
    /**
     * Callback invoked every time a {@link sap.ui.mdc.ValueHelp ValueHelp} fires a select event or the value of the corresponding field changes
     * This callback may be used to update external fields.
     *
     * @param payload Payload for delegate
     * @param valueHelp ValueHelp control instance receiving the <code>controlChange</code>
     * @param reason Reason why the method was invoked
     * @param _config Current configuration provided by the calling control
     * @since 1.101.0
     */
    onConditionPropagation: async function (payload, valueHelp, reason, _config) {
      if (reason !== "ControlChange") {
        // handle only ControlChange reason
        return;
      }
      const qualifier = payload.qualifiers[payload.valueHelpQualifier];
      const outParameters = (qualifier === null || qualifier === void 0 ? void 0 : qualifier.vhParameters) !== undefined ? ValueListHelper.getOutParameters(qualifier.vhParameters) : [],
        field = valueHelp.getControl(),
        fieldParent = field.getParent();
      let conditions = field.getConditions();
      conditions = conditions.filter(function (condition) {
        const conditionPayloadMap = condition.payload || {};
        return conditionPayloadMap[payload.valueHelpQualifier];
      });
      if (fieldParent.isA(MdcFilterbarFilterBarBase)) {
        // field inside a FilterBar or AdaptationFilterBar (Settings Dialog)?
        const filterBarVH = valueHelp.getParent(); // Control e.g. FormContainer
        if (filterBarVH.isA(FeCoreControlsFilterBar)) {
          // only for LR FilterBar
          await this._onConditionPropagationToFilterBar(filterBarVH, conditions, outParameters, fieldParent);
        }
        // LR Settings Dialog or OP Settings Dialog shall not propagate value to the dialog filterfields or context
      } else {
        // Object Page
        const context = valueHelp.getBindingContext();
        if (context) {
          this._onConditionPropagationToBindingContext(conditions, outParameters, context);
        }
      }
    },
    _createInitialFilterCondition: function (value, initialValueFilterEmpty) {
      let condition;
      if (value === undefined || value === null) {
        Log.error("ValueHelpDelegate: value of the property could not be requested");
      } else if (value === "") {
        if (initialValueFilterEmpty) {
          condition = Condition.createCondition("Empty", [], null, null, ConditionValidated.Validated);
        }
      } else {
        condition = Condition.createCondition("EQ", [value], null, null, ConditionValidated.Validated);
      }
      return condition;
    },
    _getInitialFilterConditionsFromBinding: async function (inConditions, control, inParameters) {
      const propertiesToRequest = inParameters.map(inParameter => inParameter.source);
      const bindingContext = control.getBindingContext();
      if (!bindingContext) {
        Log.error("ValueHelpDelegate: No BindingContext");
        return inConditions;
      }

      // According to odata v4 api documentation for requestProperty: Property values that are not cached yet are requested from the back end
      const values = await bindingContext.requestProperty(propertiesToRequest);
      for (let i = 0; i < inParameters.length; i++) {
        const inParameter = inParameters[i];
        const condition = this._createInitialFilterCondition(values[i], inParameter.initialValueFilterEmpty);
        if (condition) {
          inConditions[inParameter.helpPath] = [condition];
        }
      }
      return inConditions;
    },
    _getInitialFilterConditionsFromFilterBar: async function (inConditions, control, inParameters) {
      const filterBar = control.getParent();
      const state = await StateUtil.retrieveExternalState(filterBar);
      for (const inParameter of inParameters) {
        const sourceField = inParameter.source.split("/").pop();
        const conditions = state.filter[sourceField];
        if (conditions) {
          inConditions[inParameter.helpPath] = conditions;
        }
      }
      return inConditions;
    },
    _partitionInParameters: function (inParameters) {
      const inParameterMap = {
        constant: [],
        binding: [],
        filter: []
      };
      for (const inParameter of inParameters) {
        if (inParameter.constantValue !== undefined) {
          inParameterMap.constant.push(inParameter);
        } else if (inParameter.source.indexOf("$filter") === 0) {
          inParameterMap.filter.push(inParameter);
        } else {
          inParameterMap.binding.push(inParameter);
        }
      }
      return inParameterMap;
    },
    _tableAfterRenderDelegate: {
      onAfterRendering: function (event) {
        const table = event.srcControl,
          // m.Table
          tableCellsDomRefs = table.$().find("tbody .sapMText"),
          mdcMTable = table.getParent();
        highlightDOMElements(tableCellsDomRefs, mdcMTable.getFilterValue(), true);
      }
    },
    /**
     * Provides an initial condition configuration everytime a value help content is shown.
     *
     * @param payload Payload for delegate
     * @param content ValueHelp content requesting conditions configuration
     * @param control Instance of the calling control
     * @returns Returns a map of conditions suitable for a sap.ui.mdc.FilterBar control
     * @since 1.101.0
     */
    getInitialFilterConditions: async function (payload, content, control) {
      // highlight text in ValueHelp popover
      if (content !== null && content !== void 0 && content.isA("sap.ui.mdc.valuehelp.content.MTable")) {
        const popoverTable = content.getTable();
        popoverTable === null || popoverTable === void 0 ? void 0 : popoverTable.removeEventDelegate(this._tableAfterRenderDelegate);
        popoverTable === null || popoverTable === void 0 ? void 0 : popoverTable.addEventDelegate(this._tableAfterRenderDelegate, this);
      }
      const inConditions = {};
      if (!control) {
        Log.error("ValueHelpDelegate: Control undefined");
        return inConditions;
      }
      const qualifier = payload.qualifiers[payload.valueHelpQualifier];
      const inParameters = (qualifier === null || qualifier === void 0 ? void 0 : qualifier.vhParameters) !== undefined ? ValueListHelper.getInParameters(qualifier.vhParameters) : [];
      const inParameterMap = this._partitionInParameters(inParameters);
      const isObjectPage = control.getBindingContext();
      for (const inParameter of inParameterMap.constant) {
        const condition = this._createInitialFilterCondition(inParameter.constantValue, isObjectPage ? inParameter.initialValueFilterEmpty : false // no filter with "empty" on ListReport
        );

        if (condition) {
          inConditions[inParameter.helpPath] = [condition];
        }
      }
      if (inParameterMap.binding.length) {
        await this._getInitialFilterConditionsFromBinding(inConditions, control, inParameterMap.binding);
      }
      if (inParameterMap.filter.length) {
        await this._getInitialFilterConditionsFromFilterBar(inConditions, control, inParameterMap.filter);
      }
      return inConditions;
    },
    /**
     * Provides the possibility to convey custom data in conditions.
     * This enables an application to enhance conditions with data relevant for combined key or outparameter scenarios.
     *
     * @param payload Payload for delegate
     * @param content ValueHelp content instance
     * @param _values Description pair for the condition which is to be created
     * @param context Optional additional context
     * @returns Optionally returns a serializable object to be stored in the condition payload field
     * @since 1.101.0
     */
    createConditionPayload: function (payload, content, _values, context) {
      const qualifier = payload.qualifiers[payload.valueHelpQualifier],
        entry = {},
        conditionPayload = {};
      const control = content.getControl();
      const isMultiValueField = control === null || control === void 0 ? void 0 : control.isA("sap.ui.mdc.MultiValueField");
      if (!qualifier.vhKeys || qualifier.vhKeys.length === 1 || isMultiValueField) {
        return undefined;
      }
      qualifier.vhKeys.forEach(function (vhKey) {
        const value = context.getObject(vhKey);
        if (value != null) {
          entry[vhKey] = (value === null || value === void 0 ? void 0 : value.length) === 0 ? "" : value;
        }
      });
      if (Object.keys(entry).length) {
        /* vh qualifier as key for relevant condition */
        conditionPayload[payload.valueHelpQualifier] = [entry];
      }
      return conditionPayload;
    },
    /**
     * Provides the possibility to customize selections in 'Select from list' scenarios.
     * By default, only condition keys are considered. This may be extended with payload dependent filters.
     *
     * @param payload Payload for delegate
     * @param content ValueHelp content instance
     * @param item Entry of a given list
     * @param conditions Current conditions
     * @returns True, if item is selected
     * @since 1.101.0
     */
    isFilterableListItemSelected: function (payload, content, item, conditions) {
      var _content$getConfig;
      //In value help dialogs of single value fields the row for the key shouldn´t be selected/highlight anymore BCP: 2270175246
      if (payload.isValueListWithFixedValues !== true && ((_content$getConfig = content.getConfig()) === null || _content$getConfig === void 0 ? void 0 : _content$getConfig.maxConditions) === 1) {
        return false;
      }
      const context = item.getBindingContext();

      /* Do not consider "NotValidated" conditions */
      conditions = conditions.filter(condition => condition.validated === ConditionValidated.Validated);
      const selectedCondition = conditions.find(function (condition) {
        var _conditionPayloadMap$;
        const conditionPayloadMap = condition.payload,
          valueHelpQualifier = payload.valueHelpQualifier || "";
        if (!conditionPayloadMap && Object.keys(payload.qualifiers)[0] === valueHelpQualifier) {
          const keyPath = content.getKeyPath();
          return (context === null || context === void 0 ? void 0 : context.getObject(keyPath)) === (condition === null || condition === void 0 ? void 0 : condition.values[0]);
        }
        const conditionSelectedRow = (conditionPayloadMap === null || conditionPayloadMap === void 0 ? void 0 : (_conditionPayloadMap$ = conditionPayloadMap[valueHelpQualifier]) === null || _conditionPayloadMap$ === void 0 ? void 0 : _conditionPayloadMap$[0]) || {},
          selectedKeys = Object.keys(conditionSelectedRow);
        if (selectedKeys.length) {
          return selectedKeys.every(function (key) {
            return conditionSelectedRow[key] === (context === null || context === void 0 ? void 0 : context.getObject(key));
          });
        }
        return false;
      });
      return selectedCondition ? true : false;
    }
  });
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGZUNvcmVDb250cm9sc0ZpbHRlckJhciIsIk1kY0ZpbHRlcmJhckZpbHRlckJhckJhc2UiLCJPYmplY3QiLCJhc3NpZ24iLCJWYWx1ZUhlbHBEZWxlZ2F0ZSIsImlzU2VhcmNoU3VwcG9ydGVkIiwiX3BheWxvYWQiLCJjb250ZW50IiwiX2xpc3RCaW5kaW5nIiwiZ2V0RmlsdGVyRmllbGRzIiwidXBkYXRlQmluZGluZ0luZm8iLCJwYXlsb2FkIiwiYmluZGluZ0luZm8iLCJzZWFyY2giLCJnZXRGaWx0ZXJWYWx1ZSIsIm5vcm1hbGl6ZWRTZWFyY2giLCJDb21tb25VdGlscyIsIm5vcm1hbGl6ZVNlYXJjaFRlcm0iLCJwYXJhbWV0ZXJzIiwiJHNlYXJjaCIsInVuZGVmaW5lZCIsInVwZGF0ZUJpbmRpbmciLCJsaXN0QmluZGluZyIsInJvb3RCaW5kaW5nIiwiZ2V0Um9vdEJpbmRpbmciLCJpc1N1c3BlbmRlZCIsInN1c3BlbmQiLCJjaGFuZ2VQYXJhbWV0ZXJzIiwiZmlsdGVyIiwiZmlsdGVycyIsIkZpbHRlclR5cGUiLCJBcHBsaWNhdGlvbiIsInJlc3VtZSIsImV4ZWN1dGVGaWx0ZXIiLCJfZmlsdGVyIiwicmVxdWVzdGVkSXRlbXMiLCJnZXRDb250ZXh0cyIsImNoZWNrTGlzdEJpbmRpbmdQZW5kaW5nIiwiY29udGV4dHMiLCJyZXF1ZXN0Q29udGV4dHMiLCJsZW5ndGgiLCJnZXRUeXBlVXRpbCIsIlR5cGVVdGlsIiwicmV0cmlldmVDb250ZW50IiwiY29udGFpbmVyIiwiY29udGVudElkIiwiVmFsdWVMaXN0SGVscGVyIiwic2hvd1ZhbHVlTGlzdCIsIl9nZXRDb25kaXRpb25QYXlsb2FkTGlzdCIsImNvbmRpdGlvbiIsImNvbmRpdGlvblBheWxvYWRNYXAiLCJ2YWx1ZUhlbHBRdWFsaWZpZXJzIiwia2V5cyIsImNvbmRpdGlvblBheWxvYWRMaXN0IiwiX29uQ29uZGl0aW9uUHJvcGFnYXRpb25Ub0ZpbHRlckJhciIsImZpbHRlckJhclZIIiwiY29uZGl0aW9ucyIsIm91dFBhcmFtZXRlcnMiLCJmaWx0ZXJCYXIiLCJzdGF0ZSIsIlN0YXRlVXRpbCIsInJldHJpZXZlRXh0ZXJuYWxTdGF0ZSIsImZpbHRlckl0ZW1zVkgiLCJnZXRGaWx0ZXJJdGVtcyIsIm91dFBhcmFtZXRlciIsImZpbHRlclRhcmdldCIsInNvdXJjZSIsInNwbGl0IiwicG9wIiwiZmluZCIsIml0ZW0iLCJnZXRJZCIsImNvbmRpdGlvblBheWxvYWQiLCJuZXdDb25kaXRpb24iLCJDb25kaXRpb24iLCJjcmVhdGVDb25kaXRpb24iLCJoZWxwUGF0aCIsIkNvbmRpdGlvblZhbGlkYXRlZCIsIlZhbGlkYXRlZCIsInB1c2giLCJhcHBseUV4dGVybmFsU3RhdGUiLCJlcnIiLCJtZXNzYWdlIiwiRXJyb3IiLCJTdHJpbmciLCJMb2ciLCJlcnJvciIsIl9vbkNvbmRpdGlvblByb3BhZ2F0aW9uVG9CaW5kaW5nQ29udGV4dCIsImNvbnRleHQiLCJtZXRhTW9kZWwiLCJnZXRNb2RlbCIsImdldE1ldGFNb2RlbCIsIm91dFZhbHVlcyIsIndhcm5pbmciLCJfb25Db25kaXRpb25Qcm9wYWdhdGlvblVwZGF0ZVByb3BlcnR5IiwiZ2V0UHJvcGVydHkiLCJwcm9wZXJ0eVBhdGgiLCJnZXRQYXRoIiwidGV4dEFubm90YXRpb24iLCJnZXRPYmplY3QiLCJ0ZXh0UGF0aCIsIiRQYXRoIiwicmVxdWVzdFNpZGVFZmZlY3RzIiwic2V0UHJvcGVydHkiLCJvbkNvbmRpdGlvblByb3BhZ2F0aW9uIiwidmFsdWVIZWxwIiwicmVhc29uIiwiX2NvbmZpZyIsInF1YWxpZmllciIsInF1YWxpZmllcnMiLCJ2YWx1ZUhlbHBRdWFsaWZpZXIiLCJ2aFBhcmFtZXRlcnMiLCJnZXRPdXRQYXJhbWV0ZXJzIiwiZmllbGQiLCJnZXRDb250cm9sIiwiZmllbGRQYXJlbnQiLCJnZXRQYXJlbnQiLCJnZXRDb25kaXRpb25zIiwiaXNBIiwiZ2V0QmluZGluZ0NvbnRleHQiLCJfY3JlYXRlSW5pdGlhbEZpbHRlckNvbmRpdGlvbiIsInZhbHVlIiwiaW5pdGlhbFZhbHVlRmlsdGVyRW1wdHkiLCJfZ2V0SW5pdGlhbEZpbHRlckNvbmRpdGlvbnNGcm9tQmluZGluZyIsImluQ29uZGl0aW9ucyIsImNvbnRyb2wiLCJpblBhcmFtZXRlcnMiLCJwcm9wZXJ0aWVzVG9SZXF1ZXN0IiwibWFwIiwiaW5QYXJhbWV0ZXIiLCJiaW5kaW5nQ29udGV4dCIsInZhbHVlcyIsInJlcXVlc3RQcm9wZXJ0eSIsImkiLCJfZ2V0SW5pdGlhbEZpbHRlckNvbmRpdGlvbnNGcm9tRmlsdGVyQmFyIiwic291cmNlRmllbGQiLCJfcGFydGl0aW9uSW5QYXJhbWV0ZXJzIiwiaW5QYXJhbWV0ZXJNYXAiLCJjb25zdGFudCIsImJpbmRpbmciLCJjb25zdGFudFZhbHVlIiwiaW5kZXhPZiIsIl90YWJsZUFmdGVyUmVuZGVyRGVsZWdhdGUiLCJvbkFmdGVyUmVuZGVyaW5nIiwiZXZlbnQiLCJ0YWJsZSIsInNyY0NvbnRyb2wiLCJ0YWJsZUNlbGxzRG9tUmVmcyIsIiQiLCJtZGNNVGFibGUiLCJoaWdobGlnaHRET01FbGVtZW50cyIsImdldEluaXRpYWxGaWx0ZXJDb25kaXRpb25zIiwicG9wb3ZlclRhYmxlIiwiZ2V0VGFibGUiLCJyZW1vdmVFdmVudERlbGVnYXRlIiwiYWRkRXZlbnREZWxlZ2F0ZSIsImdldEluUGFyYW1ldGVycyIsImlzT2JqZWN0UGFnZSIsImNyZWF0ZUNvbmRpdGlvblBheWxvYWQiLCJfdmFsdWVzIiwiZW50cnkiLCJpc011bHRpVmFsdWVGaWVsZCIsInZoS2V5cyIsImZvckVhY2giLCJ2aEtleSIsImlzRmlsdGVyYWJsZUxpc3RJdGVtU2VsZWN0ZWQiLCJpc1ZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcyIsImdldENvbmZpZyIsIm1heENvbmRpdGlvbnMiLCJ2YWxpZGF0ZWQiLCJzZWxlY3RlZENvbmRpdGlvbiIsImtleVBhdGgiLCJnZXRLZXlQYXRoIiwiY29uZGl0aW9uU2VsZWN0ZWRSb3ciLCJzZWxlY3RlZEtleXMiLCJldmVyeSIsImtleSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVmFsdWVIZWxwRGVsZWdhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgVHlwZVV0aWwgZnJvbSBcInNhcC9mZS9jb3JlL3R5cGUvVHlwZVV0aWxcIjtcbmltcG9ydCB0eXBlIHsgSW5PdXRQYXJhbWV0ZXIsIFZhbHVlSGVscFBheWxvYWQgfSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC92YWx1ZWhlbHAvVmFsdWVMaXN0SGVscGVyXCI7XG5pbXBvcnQgVmFsdWVMaXN0SGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ludGVybmFsL3ZhbHVlaGVscC9WYWx1ZUxpc3RIZWxwZXJcIjtcbmltcG9ydCBoaWdobGlnaHRET01FbGVtZW50cyBmcm9tIFwic2FwL20vaW5wdXRVdGlscy9oaWdobGlnaHRET01FbGVtZW50c1wiO1xuaW1wb3J0IHR5cGUgeyBBZ2dyZWdhdGlvbkJpbmRpbmdJbmZvIH0gZnJvbSBcInNhcC91aS9iYXNlL01hbmFnZWRPYmplY3RcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCB0eXBlIHsgQ29uZGl0aW9uT2JqZWN0IH0gZnJvbSBcInNhcC91aS9tZGMvY29uZGl0aW9uL0NvbmRpdGlvblwiO1xuaW1wb3J0IENvbmRpdGlvbiBmcm9tIFwic2FwL3VpL21kYy9jb25kaXRpb24vQ29uZGl0aW9uXCI7XG5pbXBvcnQgQ29uZGl0aW9uVmFsaWRhdGVkIGZyb20gXCJzYXAvdWkvbWRjL2VudW0vQ29uZGl0aW9uVmFsaWRhdGVkXCI7XG5pbXBvcnQgdHlwZSBGaWVsZEJhc2UgZnJvbSBcInNhcC91aS9tZGMvZmllbGQvRmllbGRCYXNlXCI7XG5pbXBvcnQgdHlwZSBGaWx0ZXJCYXJCYXNlIGZyb20gXCJzYXAvdWkvbWRjL2ZpbHRlcmJhci9GaWx0ZXJCYXJCYXNlXCI7XG5pbXBvcnQgU3RhdGVVdGlsIGZyb20gXCJzYXAvdWkvbWRjL3AxM24vU3RhdGVVdGlsXCI7XG5pbXBvcnQgdHlwZSBWYWx1ZUhlbHAgZnJvbSBcInNhcC91aS9tZGMvVmFsdWVIZWxwXCI7XG5pbXBvcnQgdHlwZSBDb250YWluZXIgZnJvbSBcInNhcC91aS9tZGMvdmFsdWVoZWxwL2Jhc2UvQ29udGFpbmVyXCI7XG5pbXBvcnQgdHlwZSBDb250ZW50IGZyb20gXCJzYXAvdWkvbWRjL3ZhbHVlaGVscC9iYXNlL0NvbnRlbnRcIjtcbmltcG9ydCB0eXBlIEZpbHRlcmFibGVMaXN0Q29udGVudCBmcm9tIFwic2FwL3VpL21kYy92YWx1ZWhlbHAvYmFzZS9GaWx0ZXJhYmxlTGlzdENvbnRlbnRcIjtcbmltcG9ydCB0eXBlIE1UYWJsZSBmcm9tIFwic2FwL3VpL21kYy92YWx1ZWhlbHAvY29udGVudC9NVGFibGVcIjtcbmltcG9ydCBWYWx1ZUhlbHBEZWxlZ2F0ZSBmcm9tIFwic2FwL3VpL21kYy9WYWx1ZUhlbHBEZWxlZ2F0ZVwiO1xuaW1wb3J0IHR5cGUgRmlsdGVyIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyXCI7XG5pbXBvcnQgRmlsdGVyVHlwZSBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlclR5cGVcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YUxpc3RCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFMaXN0QmluZGluZ1wiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuXG5jb25zdCBGZUNvcmVDb250cm9sc0ZpbHRlckJhciA9IFwic2FwLmZlLmNvcmUuY29udHJvbHMuRmlsdGVyQmFyXCI7XG5jb25zdCBNZGNGaWx0ZXJiYXJGaWx0ZXJCYXJCYXNlID0gXCJzYXAudWkubWRjLmZpbHRlcmJhci5GaWx0ZXJCYXJCYXNlXCI7XG5cbnR5cGUgQ29uZGl0aW9uT2JqZWN0TWFwID0gUmVjb3JkPHN0cmluZywgQ29uZGl0aW9uT2JqZWN0W10+O1xuXG5leHBvcnQgdHlwZSBFeHRlcm5hbFN0YXRlVHlwZSA9IHtcblx0aXRlbXM6IHsgbmFtZTogc3RyaW5nIH1bXTtcblx0ZmlsdGVyOiBDb25kaXRpb25PYmplY3RNYXA7XG59O1xuXG5leHBvcnQgdHlwZSBDb25kaXRpb25QYXlsb2FkVHlwZSA9IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IGJvb2xlYW4+O1xuXG5leHBvcnQgdHlwZSBDb25kaXRpb25QYXlsb2FkTWFwID0gUmVjb3JkPHN0cmluZywgQ29uZGl0aW9uUGF5bG9hZFR5cGVbXT47XG5cbmV4cG9ydCBkZWZhdWx0IE9iamVjdC5hc3NpZ24oe30sIFZhbHVlSGVscERlbGVnYXRlLCB7XG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYSA8Y29kZT5MaXN0QmluZGluZzwvY29kZT4gc3VwcG9ydHMgJFNlYXJjaC5cblx0ICpcblx0ICogQHBhcmFtIF9wYXlsb2FkIFBheWxvYWQgZm9yIGRlbGVnYXRlXG5cdCAqIEBwYXJhbSBjb250ZW50IENvbnRlbnQgZWxlbWVudFxuXHQgKiBAcGFyYW0gX2xpc3RCaW5kaW5nXG5cdCAqIEByZXR1cm5zIFRydWUgaWYgJHNlYXJjaCBpcyBzdXBwb3J0ZWRcblx0ICovXG5cdGlzU2VhcmNoU3VwcG9ydGVkOiBmdW5jdGlvbiAoX3BheWxvYWQ6IFZhbHVlSGVscFBheWxvYWQsIGNvbnRlbnQ6IEZpbHRlcmFibGVMaXN0Q29udGVudCwgX2xpc3RCaW5kaW5nOiBPRGF0YUxpc3RCaW5kaW5nKSB7XG5cdFx0cmV0dXJuIGNvbnRlbnQuZ2V0RmlsdGVyRmllbGRzKCkgPT09IFwiJHNlYXJjaFwiO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBBZGp1c3RhYmxlIGZpbHRlcmluZyBmb3IgbGlzdC1iYXNlZCBjb250ZW50cy5cblx0ICpcblx0ICogQHBhcmFtIHBheWxvYWQgUGF5bG9hZCBmb3IgZGVsZWdhdGVcblx0ICogQHBhcmFtIGNvbnRlbnQgVmFsdWVIZWxwIGNvbnRlbnQgcmVxdWVzdGluZyBjb25kaXRpb25zIGNvbmZpZ3VyYXRpb25cblx0ICogQHBhcmFtIGJpbmRpbmdJbmZvIFRoZSBiaW5kaW5nIGluZm8gb2JqZWN0IHRvIGJlIHVzZWQgdG8gYmluZCB0aGUgbGlzdCB0byB0aGUgbW9kZWxcblx0ICovXG5cdHVwZGF0ZUJpbmRpbmdJbmZvOiBmdW5jdGlvbiAocGF5bG9hZDogVmFsdWVIZWxwUGF5bG9hZCwgY29udGVudDogRmlsdGVyYWJsZUxpc3RDb250ZW50LCBiaW5kaW5nSW5mbzogQWdncmVnYXRpb25CaW5kaW5nSW5mbykge1xuXHRcdFZhbHVlSGVscERlbGVnYXRlLnVwZGF0ZUJpbmRpbmdJbmZvKHBheWxvYWQsIGNvbnRlbnQsIGJpbmRpbmdJbmZvKTtcblxuXHRcdGlmIChjb250ZW50LmdldEZpbHRlckZpZWxkcygpID09PSBcIiRzZWFyY2hcIikge1xuXHRcdFx0Y29uc3Qgc2VhcmNoID0gY29udGVudC5nZXRGaWx0ZXJWYWx1ZSgpO1xuXHRcdFx0Y29uc3Qgbm9ybWFsaXplZFNlYXJjaCA9IENvbW1vblV0aWxzLm5vcm1hbGl6ZVNlYXJjaFRlcm0oc2VhcmNoKTsgLy8gYWRqdXN0U2VhcmNoXG5cblx0XHRcdGlmIChiaW5kaW5nSW5mby5wYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdChiaW5kaW5nSW5mby5wYXJhbWV0ZXJzIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KS4kc2VhcmNoID0gbm9ybWFsaXplZFNlYXJjaCB8fCB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBFeGVjdXRlcyBhIGZpbHRlciBpbiBhIDxjb2RlPkxpc3RCaW5kaW5nPC9jb2RlPiBhbmQgcmVzdW1lcyBpdCwgaWYgc3VzcGVuZGVkLlxuXHQgKlxuXHQgKiBAcGFyYW0gX3BheWxvYWQgUGF5bG9hZCBmb3IgZGVsZWdhdGVcblx0ICogQHBhcmFtIGxpc3RCaW5kaW5nIExpc3QgYmluZGluZ1xuXHQgKiBAcGFyYW0gYmluZGluZ0luZm8gVGhlIGJpbmRpbmcgaW5mbyBvYmplY3QgdG8gYmUgdXNlZCB0byBiaW5kIHRoZSBsaXN0IHRvIHRoZSBtb2RlbFxuXHQgKi9cblx0dXBkYXRlQmluZGluZzogZnVuY3Rpb24gKF9wYXlsb2FkOiBWYWx1ZUhlbHBQYXlsb2FkLCBsaXN0QmluZGluZzogT0RhdGFMaXN0QmluZGluZywgYmluZGluZ0luZm86IEFnZ3JlZ2F0aW9uQmluZGluZ0luZm8pIHtcblx0XHRjb25zdCByb290QmluZGluZyA9IGxpc3RCaW5kaW5nLmdldFJvb3RCaW5kaW5nKCkgfHwgbGlzdEJpbmRpbmc7XG5cdFx0aWYgKCFyb290QmluZGluZy5pc1N1c3BlbmRlZCgpKSB7XG5cdFx0XHRyb290QmluZGluZy5zdXNwZW5kKCk7XG5cdFx0fVxuXHRcdGlmIChiaW5kaW5nSW5mby5wYXJhbWV0ZXJzKSB7XG5cdFx0XHRsaXN0QmluZGluZy5jaGFuZ2VQYXJhbWV0ZXJzKGJpbmRpbmdJbmZvLnBhcmFtZXRlcnMpO1xuXHRcdH1cblx0XHRsaXN0QmluZGluZy5maWx0ZXIoYmluZGluZ0luZm8uZmlsdGVycywgRmlsdGVyVHlwZS5BcHBsaWNhdGlvbik7XG5cblx0XHRpZiAocm9vdEJpbmRpbmcuaXNTdXNwZW5kZWQoKSkge1xuXHRcdFx0cm9vdEJpbmRpbmcucmVzdW1lKCk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBFeGVjdXRlcyBhIGZpbHRlciBpbiBhIDxjb2RlPkxpc3RCaW5kaW5nPC9jb2RlPi5cblx0ICpcblx0ICogQHBhcmFtIHBheWxvYWQgUGF5bG9hZCBmb3IgZGVsZWdhdGVcblx0ICogQHBhcmFtIGxpc3RCaW5kaW5nIExpc3QgYmluZGluZ1xuXHQgKiBAcGFyYW0gX2ZpbHRlciBGaWx0ZXJcblx0ICogQHBhcmFtIHJlcXVlc3RlZEl0ZW1zIE51bWJlciBvZiByZXF1ZXN0ZWQgaXRlbXNcblx0ICogQHJldHVybnMgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIGlmIHNlYXJjaCBpcyBleGVjdXRlZFxuXHQgKi9cblx0ZXhlY3V0ZUZpbHRlcjogYXN5bmMgZnVuY3Rpb24gKHBheWxvYWQ6IFZhbHVlSGVscFBheWxvYWQsIGxpc3RCaW5kaW5nOiBPRGF0YUxpc3RCaW5kaW5nLCBfZmlsdGVyOiBGaWx0ZXIsIHJlcXVlc3RlZEl0ZW1zOiBudW1iZXIpIHtcblx0XHRsaXN0QmluZGluZy5nZXRDb250ZXh0cygwLCByZXF1ZXN0ZWRJdGVtcyk7XG5cblx0XHRhd2FpdCB0aGlzLmNoZWNrTGlzdEJpbmRpbmdQZW5kaW5nKHBheWxvYWQsIGxpc3RCaW5kaW5nLCByZXF1ZXN0ZWRJdGVtcyk7XG5cdFx0cmV0dXJuIGxpc3RCaW5kaW5nO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgdGhlIDxjb2RlPkxpc3RCaW5kaW5nPC9jb2RlPiBpcyB3YWl0aW5nIGZvciBhbiB1cGRhdGUuXG5cdCAqIEFzIGxvbmcgYXMgdGhlIGNvbnRleHQgaGFzIG5vdCBiZWVuIHNldCBmb3IgPGNvZGU+TGlzdEJpbmRpbmc8L2NvZGU+LFxuXHQgKiA8Y29kZT5WYWx1ZUhlbHA8L2NvZGU+IG5lZWRzIHRvIHdhaXQuXG5cdCAqXG5cdCAqIEBwYXJhbSBfcGF5bG9hZCBQYXlsb2FkIGZvciBkZWxlZ2F0ZVxuXHQgKiBAcGFyYW0gbGlzdEJpbmRpbmcgTGlzdEJpbmRpbmcgdG8gY2hlY2tcblx0ICogQHBhcmFtIHJlcXVlc3RlZEl0ZW1zIE51bWJlciBvZiByZXF1ZXN0ZWQgaXRlbXNcblx0ICogQHJldHVybnMgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIG9uY2UgTGlzdEJpbmRpbmcgaGFzIGJlZW4gdXBkYXRlZFxuXHQgKi9cblx0Y2hlY2tMaXN0QmluZGluZ1BlbmRpbmc6IGFzeW5jIGZ1bmN0aW9uIChcblx0XHRfcGF5bG9hZDogVmFsdWVIZWxwUGF5bG9hZCxcblx0XHRsaXN0QmluZGluZzogT0RhdGFMaXN0QmluZGluZyB8IHVuZGVmaW5lZCxcblx0XHRyZXF1ZXN0ZWRJdGVtczogbnVtYmVyXG5cdCkge1xuXHRcdGlmICghbGlzdEJpbmRpbmcgfHwgbGlzdEJpbmRpbmcuaXNTdXNwZW5kZWQoKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdGNvbnN0IGNvbnRleHRzID0gYXdhaXQgbGlzdEJpbmRpbmcucmVxdWVzdENvbnRleHRzKDAsIHJlcXVlc3RlZEl0ZW1zKTtcblx0XHRyZXR1cm4gY29udGV4dHMubGVuZ3RoID09PSAwO1xuXHR9LFxuXG5cdGdldFR5cGVVdGlsOiBmdW5jdGlvbiAoX3BheWxvYWQ6IFZhbHVlSGVscFBheWxvYWQpIHtcblx0XHRyZXR1cm4gVHlwZVV0aWw7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJlcXVlc3RzIHRoZSBjb250ZW50IG9mIHRoZSB2YWx1ZSBoZWxwLlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aGVuIHRoZSB2YWx1ZSBoZWxwIGlzIG9wZW5lZCBvciBhIGtleSBvciBkZXNjcmlwdGlvbiBpcyByZXF1ZXN0ZWQuXG5cdCAqXG5cdCAqIFNvLCBkZXBlbmRpbmcgb24gdGhlIHZhbHVlIGhlbHAgY29udGVudCB1c2VkLCBhbGwgY29udGVudCBjb250cm9scyBhbmQgZGF0YSBuZWVkIHRvIGJlIGFzc2lnbmVkLlxuXHQgKiBPbmNlIHRoZXkgYXJlIGFzc2lnbmVkIGFuZCB0aGUgZGF0YSBpcyBzZXQsIHRoZSByZXR1cm5lZCA8Y29kZT5Qcm9taXNlPC9jb2RlPiBuZWVkcyB0byBiZSByZXNvbHZlZC5cblx0ICogT25seSB0aGVuIGRvZXMgdGhlIHZhbHVlIGhlbHAgY29udGludWUgb3BlbmluZyBvciByZWFkaW5nIGRhdGEuXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXlsb2FkIFBheWxvYWQgZm9yIGRlbGVnYXRlXG5cdCAqIEBwYXJhbSBjb250YWluZXIgQ29udGFpbmVyIGluc3RhbmNlXG5cdCAqIEBwYXJhbSBjb250ZW50SWQgSWQgb2YgdGhlIGNvbnRlbnQgc2hvd24gYWZ0ZXIgdGhpcyBjYWxsIHRvIHJldHJpZXZlQ29udGVudFxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgaWYgYWxsIGNvbnRlbnQgaXMgYXZhaWxhYmxlXG5cdCAqL1xuXHRyZXRyaWV2ZUNvbnRlbnQ6IGZ1bmN0aW9uIChwYXlsb2FkOiBWYWx1ZUhlbHBQYXlsb2FkLCBjb250YWluZXI6IENvbnRhaW5lciwgY29udGVudElkOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gVmFsdWVMaXN0SGVscGVyLnNob3dWYWx1ZUxpc3QocGF5bG9hZCwgY29udGFpbmVyLCBjb250ZW50SWQpO1xuXHR9LFxuXG5cdF9nZXRDb25kaXRpb25QYXlsb2FkTGlzdDogZnVuY3Rpb24gKGNvbmRpdGlvbjogQ29uZGl0aW9uT2JqZWN0KSB7XG5cdFx0Y29uc3QgY29uZGl0aW9uUGF5bG9hZE1hcCA9IChjb25kaXRpb24ucGF5bG9hZCB8fCB7fSkgYXMgQ29uZGl0aW9uUGF5bG9hZE1hcCxcblx0XHRcdHZhbHVlSGVscFF1YWxpZmllcnMgPSBPYmplY3Qua2V5cyhjb25kaXRpb25QYXlsb2FkTWFwKSxcblx0XHRcdGNvbmRpdGlvblBheWxvYWRMaXN0ID0gdmFsdWVIZWxwUXVhbGlmaWVycy5sZW5ndGggPyBjb25kaXRpb25QYXlsb2FkTWFwW3ZhbHVlSGVscFF1YWxpZmllcnNbMF1dIDogW107XG5cblx0XHRyZXR1cm4gY29uZGl0aW9uUGF5bG9hZExpc3Q7XG5cdH0sXG5cblx0X29uQ29uZGl0aW9uUHJvcGFnYXRpb25Ub0ZpbHRlckJhcjogYXN5bmMgZnVuY3Rpb24gKFxuXHRcdGZpbHRlckJhclZIOiBGaWx0ZXJCYXJCYXNlLFxuXHRcdGNvbmRpdGlvbnM6IENvbmRpdGlvbk9iamVjdFtdLFxuXHRcdG91dFBhcmFtZXRlcnM6IEluT3V0UGFyYW1ldGVyW10sXG5cdFx0ZmlsdGVyQmFyOiBGaWx0ZXJCYXJCYXNlXG5cdCkge1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBzdGF0ZTogRXh0ZXJuYWxTdGF0ZVR5cGUgPSBhd2FpdCBTdGF0ZVV0aWwucmV0cmlldmVFeHRlcm5hbFN0YXRlKGZpbHRlckJhcik7XG5cdFx0XHRjb25zdCBmaWx0ZXJJdGVtc1ZIID0gZmlsdGVyQmFyVkguZ2V0RmlsdGVySXRlbXMoKTtcblx0XHRcdGZvciAoY29uc3QgY29uZGl0aW9uIG9mIGNvbmRpdGlvbnMpIHtcblx0XHRcdFx0Y29uc3QgY29uZGl0aW9uUGF5bG9hZExpc3QgPSB0aGlzLl9nZXRDb25kaXRpb25QYXlsb2FkTGlzdChjb25kaXRpb24pO1xuXHRcdFx0XHRmb3IgKGNvbnN0IG91dFBhcmFtZXRlciBvZiBvdXRQYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdFx0Y29uc3QgZmlsdGVyVGFyZ2V0ID0gb3V0UGFyYW1ldGVyLnNvdXJjZS5zcGxpdChcIi9cIikucG9wKCkgfHwgXCJcIjtcblx0XHRcdFx0XHQvLyBwcm9wYWdhdGUgT1VUIHBhcmFtZXRlciBvbmx5IGlmIHRoZSBmaWx0ZXIgZmllbGQgaXMgdmlzaWJsZSBpbiB0aGUgTFIgZmlsdGVyYmFyXG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0Ly8gTFIgRmlsdGVyQmFyIG9yIExSIEFkYXB0RmlsdGVyXG5cdFx0XHRcdFx0XHRmaWx0ZXJJdGVtc1ZILmZpbmQoKGl0ZW0pID0+IGl0ZW0uZ2V0SWQoKS5zcGxpdChcIjo6XCIpLnBvcCgpID09PSBmaWx0ZXJUYXJnZXQpXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRmb3IgKGNvbnN0IGNvbmRpdGlvblBheWxvYWQgb2YgY29uZGl0aW9uUGF5bG9hZExpc3QpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgbmV3Q29uZGl0aW9uID0gQ29uZGl0aW9uLmNyZWF0ZUNvbmRpdGlvbihcblx0XHRcdFx0XHRcdFx0XHRcIkVRXCIsXG5cdFx0XHRcdFx0XHRcdFx0W2NvbmRpdGlvblBheWxvYWRbb3V0UGFyYW1ldGVyLmhlbHBQYXRoXV0sXG5cdFx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRcdENvbmRpdGlvblZhbGlkYXRlZC5WYWxpZGF0ZWRcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0c3RhdGUuZmlsdGVyW2ZpbHRlclRhcmdldF0gfHw9IFtdO1xuXHRcdFx0XHRcdFx0XHRzdGF0ZS5maWx0ZXJbZmlsdGVyVGFyZ2V0XS5wdXNoKG5ld0NvbmRpdGlvbik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRTdGF0ZVV0aWwuYXBwbHlFeHRlcm5hbFN0YXRlKGZpbHRlckJhciwgc3RhdGUpO1xuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0Y29uc3QgbWVzc2FnZSA9IChlcnIgaW5zdGFuY2VvZiBFcnJvcikgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpO1xuXHRcdFx0TG9nLmVycm9yKGBWYWx1ZUhlbHBEZWxlZ2F0ZTogJHttZXNzYWdlfWApO1xuXHRcdH1cblx0fSxcblxuXHRfb25Db25kaXRpb25Qcm9wYWdhdGlvblRvQmluZGluZ0NvbnRleHQ6IGZ1bmN0aW9uIChcblx0XHRjb25kaXRpb25zOiBDb25kaXRpb25PYmplY3RbXSxcblx0XHRvdXRQYXJhbWV0ZXJzOiBJbk91dFBhcmFtZXRlcltdLFxuXHRcdGNvbnRleHQ6IENvbnRleHRcblx0KSB7XG5cdFx0Y29uc3QgbWV0YU1vZGVsID0gY29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXG5cdFx0Zm9yIChjb25zdCBjb25kaXRpb24gb2YgY29uZGl0aW9ucykge1xuXHRcdFx0Y29uc3QgY29uZGl0aW9uUGF5bG9hZExpc3QgPSB0aGlzLl9nZXRDb25kaXRpb25QYXlsb2FkTGlzdChjb25kaXRpb24pLFxuXHRcdFx0XHRvdXRWYWx1ZXMgPSBjb25kaXRpb25QYXlsb2FkTGlzdC5sZW5ndGggPT09IDEgPyBjb25kaXRpb25QYXlsb2FkTGlzdFswXSA6IHVuZGVmaW5lZDtcblxuXHRcdFx0aWYgKGNvbmRpdGlvblBheWxvYWRMaXN0Lmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0TG9nLndhcm5pbmcoXCJWYWx1ZUhlbHBEZWxlZ2F0ZTogUGFyYW1ldGVyT3V0IGluIG11bHRpLXZhbHVlLWZpZWxkIG5vdCBzdXBwb3J0ZWRcIik7XG5cdFx0XHR9XG5cdFx0XHRpZiAob3V0VmFsdWVzKSB7XG5cdFx0XHRcdHRoaXMuX29uQ29uZGl0aW9uUHJvcGFnYXRpb25VcGRhdGVQcm9wZXJ0eShtZXRhTW9kZWwsIG91dFZhbHVlcywgb3V0UGFyYW1ldGVycywgY29udGV4dCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdF9vbkNvbmRpdGlvblByb3BhZ2F0aW9uVXBkYXRlUHJvcGVydHk6IGZ1bmN0aW9uIChcblx0XHRtZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLFxuXHRcdG91dFZhbHVlczogQ29uZGl0aW9uUGF5bG9hZFR5cGUsXG5cdFx0b3V0UGFyYW1ldGVyczogSW5PdXRQYXJhbWV0ZXJbXSxcblx0XHRjb250ZXh0OiBDb250ZXh0XG5cdCkge1xuXHRcdGZvciAoY29uc3Qgb3V0UGFyYW1ldGVyIG9mIG91dFBhcmFtZXRlcnMpIHtcblx0XHRcdC8qIElmIHRoZSBrZXkgZ2V0cyB1cGRhdGVkIHZpYSBvdXQtcGFyYW1ldGVyLCB0aGVuIHRoZSBkZXNjcmlwdGlvbiBuZWVkcyBhbHNvIHJldHJpZXZlZCB3aXRoIHJlcXVlc3RTaWRlRWZmZWN0cyAqL1xuXHRcdFx0aWYgKGNvbnRleHQuZ2V0UHJvcGVydHkob3V0UGFyYW1ldGVyLnNvdXJjZSkgIT09IG91dFZhbHVlc1tvdXRQYXJhbWV0ZXIuaGVscFBhdGhdKSB7XG5cdFx0XHRcdGNvbnN0IHByb3BlcnR5UGF0aCA9IGNvbnRleHQuZ2V0UGF0aCgpPy5zcGxpdCgnKCcpWzBdICsgYC8ke291dFBhcmFtZXRlci5zb3VyY2V9YDtcblx0XHRcdFx0Y29uc3QgdGV4dEFubm90YXRpb24gPSBtZXRhTW9kZWw/LmdldE9iamVjdChgJHtwcm9wZXJ0eVBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0YCk7XG5cdFx0XHRcdGlmICh0ZXh0QW5ub3RhdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0Y29uc3QgdGV4dFBhdGggPSB0ZXh0QW5ub3RhdGlvbj8uJFBhdGg7XG5cdFx0XHRcdFx0Y29udGV4dC5yZXF1ZXN0U2lkZUVmZmVjdHMoW3RleHRQYXRoLnNwbGl0KCcvJylbMF1dKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Y29udGV4dC5zZXRQcm9wZXJ0eShvdXRQYXJhbWV0ZXIuc291cmNlLCBvdXRWYWx1ZXNbb3V0UGFyYW1ldGVyLmhlbHBQYXRoXSk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBDYWxsYmFjayBpbnZva2VkIGV2ZXJ5IHRpbWUgYSB7QGxpbmsgc2FwLnVpLm1kYy5WYWx1ZUhlbHAgVmFsdWVIZWxwfSBmaXJlcyBhIHNlbGVjdCBldmVudCBvciB0aGUgdmFsdWUgb2YgdGhlIGNvcnJlc3BvbmRpbmcgZmllbGQgY2hhbmdlc1xuXHQgKiBUaGlzIGNhbGxiYWNrIG1heSBiZSB1c2VkIHRvIHVwZGF0ZSBleHRlcm5hbCBmaWVsZHMuXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXlsb2FkIFBheWxvYWQgZm9yIGRlbGVnYXRlXG5cdCAqIEBwYXJhbSB2YWx1ZUhlbHAgVmFsdWVIZWxwIGNvbnRyb2wgaW5zdGFuY2UgcmVjZWl2aW5nIHRoZSA8Y29kZT5jb250cm9sQ2hhbmdlPC9jb2RlPlxuXHQgKiBAcGFyYW0gcmVhc29uIFJlYXNvbiB3aHkgdGhlIG1ldGhvZCB3YXMgaW52b2tlZFxuXHQgKiBAcGFyYW0gX2NvbmZpZyBDdXJyZW50IGNvbmZpZ3VyYXRpb24gcHJvdmlkZWQgYnkgdGhlIGNhbGxpbmcgY29udHJvbFxuXHQgKiBAc2luY2UgMS4xMDEuMFxuXHQgKi9cblx0b25Db25kaXRpb25Qcm9wYWdhdGlvbjogYXN5bmMgZnVuY3Rpb24gKHBheWxvYWQ6IFZhbHVlSGVscFBheWxvYWQsIHZhbHVlSGVscDogVmFsdWVIZWxwLCByZWFzb246IHN0cmluZywgX2NvbmZpZzogdW5rbm93bikge1xuXHRcdGlmIChyZWFzb24gIT09IFwiQ29udHJvbENoYW5nZVwiKSB7XG5cdFx0XHQvLyBoYW5kbGUgb25seSBDb250cm9sQ2hhbmdlIHJlYXNvblxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBxdWFsaWZpZXIgPSBwYXlsb2FkLnF1YWxpZmllcnNbcGF5bG9hZC52YWx1ZUhlbHBRdWFsaWZpZXJdO1xuXHRcdGNvbnN0IG91dFBhcmFtZXRlcnMgPSBxdWFsaWZpZXI/LnZoUGFyYW1ldGVycyAhPT0gdW5kZWZpbmVkID8gVmFsdWVMaXN0SGVscGVyLmdldE91dFBhcmFtZXRlcnMocXVhbGlmaWVyLnZoUGFyYW1ldGVycykgOiBbXSxcblx0XHRcdGZpZWxkID0gdmFsdWVIZWxwLmdldENvbnRyb2woKSBhcyBGaWVsZEJhc2UsXG5cdFx0XHRmaWVsZFBhcmVudCA9IGZpZWxkLmdldFBhcmVudCgpIGFzIEZpbHRlckJhckJhc2UgfCBDb250cm9sO1xuXG5cdFx0bGV0IGNvbmRpdGlvbnMgPSBmaWVsZC5nZXRDb25kaXRpb25zKCkgYXMgQ29uZGl0aW9uT2JqZWN0W107XG5cdFx0Y29uZGl0aW9ucyA9IGNvbmRpdGlvbnMuZmlsdGVyKGZ1bmN0aW9uIChjb25kaXRpb24pIHtcblx0XHRcdGNvbnN0IGNvbmRpdGlvblBheWxvYWRNYXAgPSAoY29uZGl0aW9uLnBheWxvYWQgfHwge30pIGFzIENvbmRpdGlvblBheWxvYWRNYXA7XG5cdFx0XHRyZXR1cm4gY29uZGl0aW9uUGF5bG9hZE1hcFtwYXlsb2FkLnZhbHVlSGVscFF1YWxpZmllcl07XG5cdFx0fSk7XG5cblx0XHRpZiAoZmllbGRQYXJlbnQuaXNBPEZpbHRlckJhckJhc2U+KE1kY0ZpbHRlcmJhckZpbHRlckJhckJhc2UpKSB7XG5cdFx0XHQvLyBmaWVsZCBpbnNpZGUgYSBGaWx0ZXJCYXIgb3IgQWRhcHRhdGlvbkZpbHRlckJhciAoU2V0dGluZ3MgRGlhbG9nKT9cblx0XHRcdGNvbnN0IGZpbHRlckJhclZIID0gdmFsdWVIZWxwLmdldFBhcmVudCgpIGFzIEZpbHRlckJhckJhc2UgfCBDb250cm9sOyAvLyBDb250cm9sIGUuZy4gRm9ybUNvbnRhaW5lclxuXHRcdFx0aWYgKGZpbHRlckJhclZILmlzQShGZUNvcmVDb250cm9sc0ZpbHRlckJhcikpIHtcblx0XHRcdFx0Ly8gb25seSBmb3IgTFIgRmlsdGVyQmFyXG5cdFx0XHRcdGF3YWl0IHRoaXMuX29uQ29uZGl0aW9uUHJvcGFnYXRpb25Ub0ZpbHRlckJhcihcblx0XHRcdFx0XHRmaWx0ZXJCYXJWSCBhcyBGaWx0ZXJCYXJCYXNlLFxuXHRcdFx0XHRcdGNvbmRpdGlvbnMsXG5cdFx0XHRcdFx0b3V0UGFyYW1ldGVycyxcblx0XHRcdFx0XHRmaWVsZFBhcmVudFxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gTFIgU2V0dGluZ3MgRGlhbG9nIG9yIE9QIFNldHRpbmdzIERpYWxvZyBzaGFsbCBub3QgcHJvcGFnYXRlIHZhbHVlIHRvIHRoZSBkaWFsb2cgZmlsdGVyZmllbGRzIG9yIGNvbnRleHRcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gT2JqZWN0IFBhZ2Vcblx0XHRcdGNvbnN0IGNvbnRleHQgPSB2YWx1ZUhlbHAuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0IHwgdW5kZWZpbmVkO1xuXHRcdFx0aWYgKGNvbnRleHQpIHtcblx0XHRcdFx0dGhpcy5fb25Db25kaXRpb25Qcm9wYWdhdGlvblRvQmluZGluZ0NvbnRleHQoY29uZGl0aW9ucywgb3V0UGFyYW1ldGVycywgY29udGV4dCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdF9jcmVhdGVJbml0aWFsRmlsdGVyQ29uZGl0aW9uOiBmdW5jdGlvbiAodmFsdWU6IHVua25vd24sIGluaXRpYWxWYWx1ZUZpbHRlckVtcHR5OiBib29sZWFuKSB7XG5cdFx0bGV0IGNvbmRpdGlvbjogQ29uZGl0aW9uT2JqZWN0IHwgdW5kZWZpbmVkO1xuXG5cdFx0aWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcblx0XHRcdExvZy5lcnJvcihcIlZhbHVlSGVscERlbGVnYXRlOiB2YWx1ZSBvZiB0aGUgcHJvcGVydHkgY291bGQgbm90IGJlIHJlcXVlc3RlZFwiKTtcblx0XHR9IGVsc2UgaWYgKHZhbHVlID09PSBcIlwiKSB7XG5cdFx0XHRpZiAoaW5pdGlhbFZhbHVlRmlsdGVyRW1wdHkpIHtcblx0XHRcdFx0Y29uZGl0aW9uID0gQ29uZGl0aW9uLmNyZWF0ZUNvbmRpdGlvbihcIkVtcHR5XCIsIFtdLCBudWxsLCBudWxsLCBDb25kaXRpb25WYWxpZGF0ZWQuVmFsaWRhdGVkKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uZGl0aW9uID0gQ29uZGl0aW9uLmNyZWF0ZUNvbmRpdGlvbihcIkVRXCIsIFt2YWx1ZV0sIG51bGwsIG51bGwsIENvbmRpdGlvblZhbGlkYXRlZC5WYWxpZGF0ZWQpO1xuXHRcdH1cblx0XHRyZXR1cm4gY29uZGl0aW9uO1xuXHR9LFxuXG5cdF9nZXRJbml0aWFsRmlsdGVyQ29uZGl0aW9uc0Zyb21CaW5kaW5nOiBhc3luYyBmdW5jdGlvbiAoXG5cdFx0aW5Db25kaXRpb25zOiBDb25kaXRpb25PYmplY3RNYXAsXG5cdFx0Y29udHJvbDogQ29udHJvbCxcblx0XHRpblBhcmFtZXRlcnM6IEluT3V0UGFyYW1ldGVyW11cblx0KSB7XG5cdFx0Y29uc3QgcHJvcGVydGllc1RvUmVxdWVzdCA9IGluUGFyYW1ldGVycy5tYXAoKGluUGFyYW1ldGVyKSA9PiBpblBhcmFtZXRlci5zb3VyY2UpO1xuXHRcdGNvbnN0IGJpbmRpbmdDb250ZXh0ID0gY29udHJvbC5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQgfCB1bmRlZmluZWQ7XG5cblx0XHRpZiAoIWJpbmRpbmdDb250ZXh0KSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJWYWx1ZUhlbHBEZWxlZ2F0ZTogTm8gQmluZGluZ0NvbnRleHRcIik7XG5cdFx0XHRyZXR1cm4gaW5Db25kaXRpb25zO1xuXHRcdH1cblxuXHRcdC8vIEFjY29yZGluZyB0byBvZGF0YSB2NCBhcGkgZG9jdW1lbnRhdGlvbiBmb3IgcmVxdWVzdFByb3BlcnR5OiBQcm9wZXJ0eSB2YWx1ZXMgdGhhdCBhcmUgbm90IGNhY2hlZCB5ZXQgYXJlIHJlcXVlc3RlZCBmcm9tIHRoZSBiYWNrIGVuZFxuXHRcdGNvbnN0IHZhbHVlcyA9IGF3YWl0IGJpbmRpbmdDb250ZXh0LnJlcXVlc3RQcm9wZXJ0eShwcm9wZXJ0aWVzVG9SZXF1ZXN0KTtcblxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgaW5QYXJhbWV0ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCBpblBhcmFtZXRlciA9IGluUGFyYW1ldGVyc1tpXTtcblx0XHRcdGNvbnN0IGNvbmRpdGlvbiA9IHRoaXMuX2NyZWF0ZUluaXRpYWxGaWx0ZXJDb25kaXRpb24odmFsdWVzW2ldLCBpblBhcmFtZXRlci5pbml0aWFsVmFsdWVGaWx0ZXJFbXB0eSk7XG5cblx0XHRcdGlmIChjb25kaXRpb24pIHtcblx0XHRcdFx0aW5Db25kaXRpb25zW2luUGFyYW1ldGVyLmhlbHBQYXRoXSA9IFtjb25kaXRpb25dO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gaW5Db25kaXRpb25zO1xuXHR9LFxuXG5cdF9nZXRJbml0aWFsRmlsdGVyQ29uZGl0aW9uc0Zyb21GaWx0ZXJCYXI6IGFzeW5jIGZ1bmN0aW9uIChcblx0XHRpbkNvbmRpdGlvbnM6IENvbmRpdGlvbk9iamVjdE1hcCxcblx0XHRjb250cm9sOiBDb250cm9sLFxuXHRcdGluUGFyYW1ldGVyczogSW5PdXRQYXJhbWV0ZXJbXVxuXHQpIHtcblx0XHRjb25zdCBmaWx0ZXJCYXIgPSBjb250cm9sLmdldFBhcmVudCgpIGFzIEZpbHRlckJhckJhc2U7XG5cdFx0Y29uc3Qgc3RhdGU6IEV4dGVybmFsU3RhdGVUeXBlID0gYXdhaXQgU3RhdGVVdGlsLnJldHJpZXZlRXh0ZXJuYWxTdGF0ZShmaWx0ZXJCYXIpO1xuXG5cdFx0Zm9yIChjb25zdCBpblBhcmFtZXRlciBvZiBpblBhcmFtZXRlcnMpIHtcblx0XHRcdGNvbnN0IHNvdXJjZUZpZWxkID0gaW5QYXJhbWV0ZXIuc291cmNlLnNwbGl0KFwiL1wiKS5wb3AoKSBhcyBzdHJpbmc7XG5cdFx0XHRjb25zdCBjb25kaXRpb25zID0gc3RhdGUuZmlsdGVyW3NvdXJjZUZpZWxkXTtcblxuXHRcdFx0aWYgKGNvbmRpdGlvbnMpIHtcblx0XHRcdFx0aW5Db25kaXRpb25zW2luUGFyYW1ldGVyLmhlbHBQYXRoXSA9IGNvbmRpdGlvbnM7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBpbkNvbmRpdGlvbnM7XG5cdH0sXG5cblx0X3BhcnRpdGlvbkluUGFyYW1ldGVyczogZnVuY3Rpb24gKGluUGFyYW1ldGVyczogSW5PdXRQYXJhbWV0ZXJbXSkge1xuXHRcdGNvbnN0IGluUGFyYW1ldGVyTWFwOiBSZWNvcmQ8c3RyaW5nLCBJbk91dFBhcmFtZXRlcltdPiA9IHtcblx0XHRcdGNvbnN0YW50OiBbXSxcblx0XHRcdGJpbmRpbmc6IFtdLFxuXHRcdFx0ZmlsdGVyOiBbXVxuXHRcdH07XG5cblx0XHRmb3IgKGNvbnN0IGluUGFyYW1ldGVyIG9mIGluUGFyYW1ldGVycykge1xuXHRcdFx0aWYgKGluUGFyYW1ldGVyLmNvbnN0YW50VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRpblBhcmFtZXRlck1hcC5jb25zdGFudC5wdXNoKGluUGFyYW1ldGVyKTtcblx0XHRcdH0gZWxzZSBpZiAoaW5QYXJhbWV0ZXIuc291cmNlLmluZGV4T2YoXCIkZmlsdGVyXCIpID09PSAwKSB7XG5cdFx0XHRcdGluUGFyYW1ldGVyTWFwLmZpbHRlci5wdXNoKGluUGFyYW1ldGVyKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGluUGFyYW1ldGVyTWFwLmJpbmRpbmcucHVzaChpblBhcmFtZXRlcik7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBpblBhcmFtZXRlck1hcDtcblx0fSxcblxuXHRfdGFibGVBZnRlclJlbmRlckRlbGVnYXRlOiB7XG5cdFx0b25BZnRlclJlbmRlcmluZzogZnVuY3Rpb24gKGV2ZW50OiBqUXVlcnkuRXZlbnQgJiB7IHNyY0NvbnRyb2w6IENvbnRyb2wgfSkge1xuXHRcdFx0Y29uc3QgdGFibGUgPSBldmVudC5zcmNDb250cm9sLCAvLyBtLlRhYmxlXG5cdFx0XHRcdHRhYmxlQ2VsbHNEb21SZWZzID0gdGFibGUuJCgpLmZpbmQoXCJ0Ym9keSAuc2FwTVRleHRcIiksXG5cdFx0XHRcdG1kY01UYWJsZSA9IHRhYmxlLmdldFBhcmVudCgpIGFzIE1UYWJsZTtcblxuXHRcdFx0aGlnaGxpZ2h0RE9NRWxlbWVudHModGFibGVDZWxsc0RvbVJlZnMsIG1kY01UYWJsZS5nZXRGaWx0ZXJWYWx1ZSgpLCB0cnVlKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFByb3ZpZGVzIGFuIGluaXRpYWwgY29uZGl0aW9uIGNvbmZpZ3VyYXRpb24gZXZlcnl0aW1lIGEgdmFsdWUgaGVscCBjb250ZW50IGlzIHNob3duLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF5bG9hZCBQYXlsb2FkIGZvciBkZWxlZ2F0ZVxuXHQgKiBAcGFyYW0gY29udGVudCBWYWx1ZUhlbHAgY29udGVudCByZXF1ZXN0aW5nIGNvbmRpdGlvbnMgY29uZmlndXJhdGlvblxuXHQgKiBAcGFyYW0gY29udHJvbCBJbnN0YW5jZSBvZiB0aGUgY2FsbGluZyBjb250cm9sXG5cdCAqIEByZXR1cm5zIFJldHVybnMgYSBtYXAgb2YgY29uZGl0aW9ucyBzdWl0YWJsZSBmb3IgYSBzYXAudWkubWRjLkZpbHRlckJhciBjb250cm9sXG5cdCAqIEBzaW5jZSAxLjEwMS4wXG5cdCAqL1xuXHRnZXRJbml0aWFsRmlsdGVyQ29uZGl0aW9uczogYXN5bmMgZnVuY3Rpb24gKHBheWxvYWQ6IFZhbHVlSGVscFBheWxvYWQsIGNvbnRlbnQ6IENvbnRlbnQsIGNvbnRyb2w6IENvbnRyb2wgfCB1bmRlZmluZWQpIHtcblx0XHQvLyBoaWdobGlnaHQgdGV4dCBpbiBWYWx1ZUhlbHAgcG9wb3ZlclxuXHRcdGlmIChjb250ZW50Py5pc0EoXCJzYXAudWkubWRjLnZhbHVlaGVscC5jb250ZW50Lk1UYWJsZVwiKSkge1xuXHRcdFx0Y29uc3QgcG9wb3ZlclRhYmxlID0gKGNvbnRlbnQgYXMgTVRhYmxlKS5nZXRUYWJsZSgpO1xuXHRcdFx0cG9wb3ZlclRhYmxlPy5yZW1vdmVFdmVudERlbGVnYXRlKHRoaXMuX3RhYmxlQWZ0ZXJSZW5kZXJEZWxlZ2F0ZSk7XG5cdFx0XHRwb3BvdmVyVGFibGU/LmFkZEV2ZW50RGVsZWdhdGUodGhpcy5fdGFibGVBZnRlclJlbmRlckRlbGVnYXRlLCB0aGlzKTtcblx0XHR9XG5cblx0XHRjb25zdCBpbkNvbmRpdGlvbnM6IENvbmRpdGlvbk9iamVjdE1hcCA9IHt9O1xuXG5cdFx0aWYgKCFjb250cm9sKSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJWYWx1ZUhlbHBEZWxlZ2F0ZTogQ29udHJvbCB1bmRlZmluZWRcIik7XG5cdFx0XHRyZXR1cm4gaW5Db25kaXRpb25zO1xuXHRcdH1cblxuXHRcdGNvbnN0IHF1YWxpZmllciA9IHBheWxvYWQucXVhbGlmaWVyc1twYXlsb2FkLnZhbHVlSGVscFF1YWxpZmllcl07XG5cdFx0Y29uc3QgaW5QYXJhbWV0ZXJzID0gcXVhbGlmaWVyPy52aFBhcmFtZXRlcnMgIT09IHVuZGVmaW5lZCA/IFZhbHVlTGlzdEhlbHBlci5nZXRJblBhcmFtZXRlcnMocXVhbGlmaWVyLnZoUGFyYW1ldGVycykgOiBbXTtcblx0XHRjb25zdCBpblBhcmFtZXRlck1hcCA9IHRoaXMuX3BhcnRpdGlvbkluUGFyYW1ldGVycyhpblBhcmFtZXRlcnMpO1xuXHRcdGNvbnN0IGlzT2JqZWN0UGFnZSA9IGNvbnRyb2wuZ2V0QmluZGluZ0NvbnRleHQoKTtcblxuXHRcdGZvciAoY29uc3QgaW5QYXJhbWV0ZXIgb2YgaW5QYXJhbWV0ZXJNYXAuY29uc3RhbnQpIHtcblx0XHRcdGNvbnN0IGNvbmRpdGlvbiA9IHRoaXMuX2NyZWF0ZUluaXRpYWxGaWx0ZXJDb25kaXRpb24oXG5cdFx0XHRcdGluUGFyYW1ldGVyLmNvbnN0YW50VmFsdWUsXG5cdFx0XHRcdGlzT2JqZWN0UGFnZSA/IGluUGFyYW1ldGVyLmluaXRpYWxWYWx1ZUZpbHRlckVtcHR5IDogZmFsc2UgLy8gbm8gZmlsdGVyIHdpdGggXCJlbXB0eVwiIG9uIExpc3RSZXBvcnRcblx0XHRcdCk7XG5cdFx0XHRpZiAoY29uZGl0aW9uKSB7XG5cdFx0XHRcdGluQ29uZGl0aW9uc1tpblBhcmFtZXRlci5oZWxwUGF0aF0gPSBbY29uZGl0aW9uXTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoaW5QYXJhbWV0ZXJNYXAuYmluZGluZy5sZW5ndGgpIHtcblx0XHRcdGF3YWl0IHRoaXMuX2dldEluaXRpYWxGaWx0ZXJDb25kaXRpb25zRnJvbUJpbmRpbmcoaW5Db25kaXRpb25zLCBjb250cm9sLCBpblBhcmFtZXRlck1hcC5iaW5kaW5nKTtcblx0XHR9XG5cblx0XHRpZiAoaW5QYXJhbWV0ZXJNYXAuZmlsdGVyLmxlbmd0aCkge1xuXHRcdFx0YXdhaXQgdGhpcy5fZ2V0SW5pdGlhbEZpbHRlckNvbmRpdGlvbnNGcm9tRmlsdGVyQmFyKGluQ29uZGl0aW9ucywgY29udHJvbCwgaW5QYXJhbWV0ZXJNYXAuZmlsdGVyKTtcblx0XHR9XG5cdFx0cmV0dXJuIGluQ29uZGl0aW9ucztcblx0fSxcblxuXHQvKipcblx0ICogUHJvdmlkZXMgdGhlIHBvc3NpYmlsaXR5IHRvIGNvbnZleSBjdXN0b20gZGF0YSBpbiBjb25kaXRpb25zLlxuXHQgKiBUaGlzIGVuYWJsZXMgYW4gYXBwbGljYXRpb24gdG8gZW5oYW5jZSBjb25kaXRpb25zIHdpdGggZGF0YSByZWxldmFudCBmb3IgY29tYmluZWQga2V5IG9yIG91dHBhcmFtZXRlciBzY2VuYXJpb3MuXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXlsb2FkIFBheWxvYWQgZm9yIGRlbGVnYXRlXG5cdCAqIEBwYXJhbSBjb250ZW50IFZhbHVlSGVscCBjb250ZW50IGluc3RhbmNlXG5cdCAqIEBwYXJhbSBfdmFsdWVzIERlc2NyaXB0aW9uIHBhaXIgZm9yIHRoZSBjb25kaXRpb24gd2hpY2ggaXMgdG8gYmUgY3JlYXRlZFxuXHQgKiBAcGFyYW0gY29udGV4dCBPcHRpb25hbCBhZGRpdGlvbmFsIGNvbnRleHRcblx0ICogQHJldHVybnMgT3B0aW9uYWxseSByZXR1cm5zIGEgc2VyaWFsaXphYmxlIG9iamVjdCB0byBiZSBzdG9yZWQgaW4gdGhlIGNvbmRpdGlvbiBwYXlsb2FkIGZpZWxkXG5cdCAqIEBzaW5jZSAxLjEwMS4wXG5cdCAqL1xuXHRjcmVhdGVDb25kaXRpb25QYXlsb2FkOiBmdW5jdGlvbiAoXG5cdFx0cGF5bG9hZDogVmFsdWVIZWxwUGF5bG9hZCxcblx0XHRjb250ZW50OiBDb250ZW50LFxuXHRcdF92YWx1ZXM6IHVua25vd25bXSxcblx0XHRjb250ZXh0OiBDb250ZXh0XG5cdCk6IENvbmRpdGlvblBheWxvYWRNYXAgfCB1bmRlZmluZWQge1xuXHRcdGNvbnN0IHF1YWxpZmllciA9IHBheWxvYWQucXVhbGlmaWVyc1twYXlsb2FkLnZhbHVlSGVscFF1YWxpZmllcl0sXG5cdFx0XHRlbnRyeTogQ29uZGl0aW9uUGF5bG9hZFR5cGUgPSB7fSxcblx0XHRcdGNvbmRpdGlvblBheWxvYWQ6IENvbmRpdGlvblBheWxvYWRNYXAgPSB7fTtcblx0XHRjb25zdCBjb250cm9sID0gY29udGVudC5nZXRDb250cm9sKCk7XG5cdFx0Y29uc3QgaXNNdWx0aVZhbHVlRmllbGQgPSBjb250cm9sPy5pc0EoXCJzYXAudWkubWRjLk11bHRpVmFsdWVGaWVsZFwiKTtcblx0XHRpZiAoIXF1YWxpZmllci52aEtleXMgfHwgcXVhbGlmaWVyLnZoS2V5cy5sZW5ndGggPT09IDEgfHwgaXNNdWx0aVZhbHVlRmllbGQpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdHF1YWxpZmllci52aEtleXMuZm9yRWFjaChmdW5jdGlvbiAodmhLZXkpIHtcblx0XHRcdGNvbnN0IHZhbHVlID0gY29udGV4dC5nZXRPYmplY3QodmhLZXkpO1xuXHRcdFx0aWYgKHZhbHVlICE9IG51bGwpIHtcblx0XHRcdFx0ZW50cnlbdmhLZXldID0gdmFsdWU/Lmxlbmd0aCA9PT0gMCA/IFwiXCIgOiB2YWx1ZTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRpZiAoT2JqZWN0LmtleXMoZW50cnkpLmxlbmd0aCkge1xuXHRcdFx0LyogdmggcXVhbGlmaWVyIGFzIGtleSBmb3IgcmVsZXZhbnQgY29uZGl0aW9uICovXG5cdFx0XHRjb25kaXRpb25QYXlsb2FkW3BheWxvYWQudmFsdWVIZWxwUXVhbGlmaWVyXSA9IFtlbnRyeV07XG5cdFx0fVxuXHRcdHJldHVybiBjb25kaXRpb25QYXlsb2FkO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBQcm92aWRlcyB0aGUgcG9zc2liaWxpdHkgdG8gY3VzdG9taXplIHNlbGVjdGlvbnMgaW4gJ1NlbGVjdCBmcm9tIGxpc3QnIHNjZW5hcmlvcy5cblx0ICogQnkgZGVmYXVsdCwgb25seSBjb25kaXRpb24ga2V5cyBhcmUgY29uc2lkZXJlZC4gVGhpcyBtYXkgYmUgZXh0ZW5kZWQgd2l0aCBwYXlsb2FkIGRlcGVuZGVudCBmaWx0ZXJzLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF5bG9hZCBQYXlsb2FkIGZvciBkZWxlZ2F0ZVxuXHQgKiBAcGFyYW0gY29udGVudCBWYWx1ZUhlbHAgY29udGVudCBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gaXRlbSBFbnRyeSBvZiBhIGdpdmVuIGxpc3Rcblx0ICogQHBhcmFtIGNvbmRpdGlvbnMgQ3VycmVudCBjb25kaXRpb25zXG5cdCAqIEByZXR1cm5zIFRydWUsIGlmIGl0ZW0gaXMgc2VsZWN0ZWRcblx0ICogQHNpbmNlIDEuMTAxLjBcblx0ICovXG5cdGlzRmlsdGVyYWJsZUxpc3RJdGVtU2VsZWN0ZWQ6IGZ1bmN0aW9uIChwYXlsb2FkOiBWYWx1ZUhlbHBQYXlsb2FkLCBjb250ZW50OiBDb250ZW50LCBpdGVtOiBDb250cm9sLCBjb25kaXRpb25zOiBDb25kaXRpb25PYmplY3RbXSkge1xuXHRcdC8vSW4gdmFsdWUgaGVscCBkaWFsb2dzIG9mIHNpbmdsZSB2YWx1ZSBmaWVsZHMgdGhlIHJvdyBmb3IgdGhlIGtleSBzaG91bGRuwrR0IGJlIHNlbGVjdGVkL2hpZ2hsaWdodCBhbnltb3JlIEJDUDogMjI3MDE3NTI0NlxuXHRcdGlmIChwYXlsb2FkLmlzVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzICE9PSB0cnVlICYmIGNvbnRlbnQuZ2V0Q29uZmlnKCk/Lm1heENvbmRpdGlvbnMgPT09IDEpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRjb25zdCBjb250ZXh0ID0gaXRlbS5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXG5cdFx0LyogRG8gbm90IGNvbnNpZGVyIFwiTm90VmFsaWRhdGVkXCIgY29uZGl0aW9ucyAqL1xuXHRcdGNvbmRpdGlvbnMgPSBjb25kaXRpb25zLmZpbHRlcigoY29uZGl0aW9uKSA9PiBjb25kaXRpb24udmFsaWRhdGVkID09PSBDb25kaXRpb25WYWxpZGF0ZWQuVmFsaWRhdGVkKTtcblxuXHRcdGNvbnN0IHNlbGVjdGVkQ29uZGl0aW9uID0gY29uZGl0aW9ucy5maW5kKGZ1bmN0aW9uIChjb25kaXRpb24pIHtcblx0XHRcdGNvbnN0IGNvbmRpdGlvblBheWxvYWRNYXAgPSBjb25kaXRpb24ucGF5bG9hZCBhcyBDb25kaXRpb25QYXlsb2FkTWFwIHwgdW5kZWZpbmVkLFxuXHRcdFx0XHR2YWx1ZUhlbHBRdWFsaWZpZXIgPSBwYXlsb2FkLnZhbHVlSGVscFF1YWxpZmllciB8fCBcIlwiO1xuXHRcdFx0aWYgKCFjb25kaXRpb25QYXlsb2FkTWFwICYmIE9iamVjdC5rZXlzKHBheWxvYWQucXVhbGlmaWVycylbMF0gPT09IHZhbHVlSGVscFF1YWxpZmllcikge1xuXHRcdFx0XHRjb25zdCBrZXlQYXRoID0gY29udGVudC5nZXRLZXlQYXRoKCk7XG5cdFx0XHRcdHJldHVybiBjb250ZXh0Py5nZXRPYmplY3Qoa2V5UGF0aCkgPT09IGNvbmRpdGlvbj8udmFsdWVzWzBdO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgY29uZGl0aW9uU2VsZWN0ZWRSb3cgPSBjb25kaXRpb25QYXlsb2FkTWFwPy5bdmFsdWVIZWxwUXVhbGlmaWVyXT8uWzBdIHx8IHt9LFxuXHRcdFx0XHRzZWxlY3RlZEtleXMgPSBPYmplY3Qua2V5cyhjb25kaXRpb25TZWxlY3RlZFJvdyk7XG5cdFx0XHRpZiAoc2VsZWN0ZWRLZXlzLmxlbmd0aCkge1xuXHRcdFx0XHRyZXR1cm4gc2VsZWN0ZWRLZXlzLmV2ZXJ5KGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0XHRyZXR1cm4gKGNvbmRpdGlvblNlbGVjdGVkUm93W2tleV0gYXMgdW5rbm93bikgPT09IGNvbnRleHQ/LmdldE9iamVjdChrZXkpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9KTtcblxuXHRcdHJldHVybiBzZWxlY3RlZENvbmRpdGlvbiA/IHRydWUgOiBmYWxzZTtcblx0fVxufSk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7RUEwQkEsTUFBTUEsdUJBQXVCLEdBQUcsZ0NBQWdDO0VBQ2hFLE1BQU1DLHlCQUF5QixHQUFHLG9DQUFvQztFQUFDLE9BYXhEQyxNQUFNLENBQUNDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRUMsaUJBQWlCLEVBQUU7SUFDbkQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDQyxpQkFBaUIsRUFBRSxVQUFVQyxRQUEwQixFQUFFQyxPQUE4QixFQUFFQyxZQUE4QixFQUFFO01BQ3hILE9BQU9ELE9BQU8sQ0FBQ0UsZUFBZSxFQUFFLEtBQUssU0FBUztJQUMv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