/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/helpers/ModelHelper", "sap/fe/macros/internal/valuehelp/ValueListHelper", "sap/ui/core/Core"], function (Log, ModelHelper, ValueListHelper, Core) {
  "use strict";

  const MassEditHandlers = {
    /**
     * Called for property change in the transient context.
     *
     * @function
     * @param newValue New value of the property.
     * @param dataProperty Final context returned after the paginator action
     * @param mdcFieldId Final context returned after the paginator action
     */
    contextPropertyChange: function (newValue, dataProperty, mdcFieldId) {
      // Called for
      // 1. Out Parameters.
      // 2. Transient context property change.

      const source = Core.byId(mdcFieldId);
      const transCtx = source && source.getBindingContext();
      const fieldInfoModel = source && source.getModel("fieldsInfo");
      const values = fieldInfoModel.getProperty(`/values/${dataProperty}`) || fieldInfoModel.getProperty(`/unitData/${dataProperty}`) || [];
      if (transCtx && (values.inputType === "InputWithValueHelp" || values.inputType === "InputWithUnit") && !values.valueListInfo) {
        MassEditHandlers._setValueListInfo(transCtx, source, fieldInfoModel, dataProperty);
      }
      const isDialogOpen = fieldInfoModel && fieldInfoModel.getProperty("/isOpen");
      if (!isDialogOpen || !source.getVisible()) {
        return;
      }
      MassEditHandlers._updateSelectKey(source, dataProperty, newValue);
    },
    /**
     * Called for change in the MDC field.
     * This is called on selection done through VHD.
     * This is not called on change of the dropdown as we are using a custom MassEditSelect control and not general Select.
     *
     * @function
     * @param event Event object for change.
     * @param propertyName Property path.
     */
    handleMDCFieldChange: function (event, propertyName) {
      // Called for
      // 1. VHD property change.

      const source = event && event.getSource();
      const changePromise = event && event.getParameter("promise");
      const comboBox = source.getContent();
      if (!comboBox || !propertyName) {
        return;
      }
      changePromise.then(MassEditHandlers._updateSelectKeyForMDCFieldChange.bind(MassEditHandlers, source, propertyName)).catch(err => {
        Log.warning(`VHD selection couldn't be populated in the mass edit field.${err}`);
      });
    },
    /**
     * Called for selection change through the drop down.
     *
     * @function
     * @param event Event object for change.
     */
    handleSelectionChange: function (event) {
      // Called for Manual selection from dropdown(comboBox or select)
      // 1. VHD select.
      // 2. Any value change in the control.

      const source = event && event.getSource();
      const key = source.getSelectedKey();
      const params = source && key && key.split("/");
      let propertyName;
      if (params[0] === "UseValueHelpValue") {
        const prevItem = event.getParameter("previousSelectedItem");
        const selectKey = prevItem.getKey();
        propertyName = params.slice(1).join("/");
        MassEditHandlers._onVHSelect(source, propertyName, selectKey);
        return;
      }
      const fieldInfoModel = source && source.getModel("fieldsInfo");
      propertyName = MassEditHandlers._getPropertyNameFromKey(key);
      MassEditHandlers._updateSuggestionForFieldsWithInParameters(fieldInfoModel, propertyName, key.startsWith("Default/") || key.startsWith("ClearFieldValue/"), true);
      MassEditHandlers._updateSuggestionForFieldsWithOutParameters(fieldInfoModel, propertyName, key.startsWith("Default/") || key.startsWith("ClearFieldValue/"), false);
      MassEditHandlers._updateResults(source, params, true);
    },
    /**
     * Update selections to results and the suggests in drop downs.
     *
     * @function
     * @param source MDC field that was changed.
     * @param propertyName Property path.
     * @param value New value.
     */
    _updateSelectKeyForMDCFieldChange: function (source, propertyName, value) {
      const transCtx = source && source.getBindingContext();
      const fieldInfoModel = source && source.getModel("fieldsInfo");
      const values = fieldInfoModel.getProperty(`/values/${propertyName}`) || fieldInfoModel.getProperty(`/unitData/${propertyName}`) || [];
      if (transCtx && (values.inputType === "InputWithValueHelp" || values.inputType === "InputWithUnit") && !values.valueListInfo) {
        MassEditHandlers._setValueListInfo(transCtx, source, fieldInfoModel, propertyName);
      }
      MassEditHandlers._updateSuggestionForFieldsWithOutParameters(fieldInfoModel, propertyName, false, true);
      MassEditHandlers._updateSuggestionForFieldsWithInParameters(fieldInfoModel, propertyName, false, true);
      const formattedValue = source.getFormFormattedValue();
      MassEditHandlers._updateSelectKey(source, propertyName, value, formattedValue);
    },
    /**
     * Update suggests for all drop downs with InParameter as the propertyName.
     *
     * @function
     * @param fieldInfoModel Runtime model with parameters store information.
     * @param propertyName Property path.
     * @param resetValues Should the values be reset to original state.
     * @param keepExistingSelection Should the existing selection before update remain.
     */
    _updateSuggestionForFieldsWithInParameters: function (fieldInfoModel, propertyName, resetValues, keepExistingSelection) {
      const values = fieldInfoModel.getProperty("/values");
      const unitData = fieldInfoModel.getProperty("/unitData");
      const fieldPaths = Object.keys(values);
      const unitFieldPaths = Object.keys(unitData);
      fieldPaths.forEach(MassEditHandlers._updateInParameterSuggetions.bind(MassEditHandlers, fieldInfoModel, "/values/", propertyName, resetValues, keepExistingSelection));
      unitFieldPaths.forEach(MassEditHandlers._updateInParameterSuggetions.bind(MassEditHandlers, fieldInfoModel, "/unitData/", propertyName, resetValues, keepExistingSelection));
    },
    /**
     * Update suggests for a drop down with InParameter as the srcPropertyName.
     *
     * @function
     * @param fieldInfoModel Runtime model with parameters store information.
     * @param pathPrefix Path in the runtime model.
     * @param srcPropertyName The InParameter Property path.
     * @param resetValues Should the values be reset to original state.
     * @param keepExistingSelection Should the existing selection before update remain.
     * @param propertyName Property path that needs update of suggestions.
     */
    _updateInParameterSuggetions: function (fieldInfoModel, pathPrefix, srcPropertyName, resetValues, keepExistingSelection, propertyName) {
      const valueListInfo = fieldInfoModel.getProperty(`${pathPrefix + propertyName}/valueListInfo`);
      if (valueListInfo && srcPropertyName != propertyName) {
        const inParameters = valueListInfo.inParameters;
        if (inParameters && inParameters.length > 0 && inParameters.includes(srcPropertyName)) {
          MassEditHandlers._updateFieldPathSuggestions(fieldInfoModel, pathPrefix + propertyName, resetValues, keepExistingSelection);
        }
      }
    },
    /**
     * Update suggests for all OutParameter's drop downs of the propertyName.
     *
     * @function
     * @param fieldInfoModel Runtime model with parameters store information.
     * @param propertyName Property path.
     * @param resetValues Should the values be reset to original state.
     * @param keepExistingSelection Should the existing selection before update remain.
     */
    _updateSuggestionForFieldsWithOutParameters: function (fieldInfoModel, propertyName, resetValues, keepExistingSelection) {
      const valueListInfo = fieldInfoModel.getProperty(`/values/${propertyName}/valueListInfo`) || fieldInfoModel.getProperty(`/unitData/${propertyName}/valueListInfo`);
      if (valueListInfo && valueListInfo.outParameters) {
        const outParameters = valueListInfo.outParameters;
        if (outParameters.length && outParameters.length > 0) {
          MassEditHandlers._updateOutParameterSuggetions(outParameters, fieldInfoModel, resetValues, keepExistingSelection);
          const pathPrefix = fieldInfoModel.getProperty(`/values/${propertyName}`) && `/values/${propertyName}` || fieldInfoModel.getProperty(`/unitData/${propertyName}`) && `/unitData/${propertyName}`;
          if (pathPrefix) {
            MassEditHandlers._updateFieldPathSuggestions(fieldInfoModel, pathPrefix, false, true);
          }
        }
      }
    },
    /**
     * Update suggests for a drop down with InParameter as the srcPropertyName.
     *
     * @function
     * @param outParameters String arrary of OutParameter property paths.
     * @param fieldInfoModel Runtime model with parameters store information.
     * @param resetValues Should the values be reset to original state.
     * @param keepExistingSelection Should the existing selection before update remain.
     */
    _updateOutParameterSuggetions: function (outParameters, fieldInfoModel, resetValues, keepExistingSelection) {
      const values = fieldInfoModel.getProperty("/values");
      const unitData = fieldInfoModel.getProperty("/unitData");
      const fieldPaths = Object.keys(values);
      const unitFieldPaths = Object.keys(unitData);
      outParameters.forEach(outParameter => {
        if (fieldPaths.includes(outParameter)) {
          MassEditHandlers._updateFieldPathSuggestions(fieldInfoModel, `/values/${outParameter}`, resetValues, keepExistingSelection);
        } else if (unitFieldPaths.includes(outParameter)) {
          MassEditHandlers._updateFieldPathSuggestions(fieldInfoModel, `/unitData/${outParameter}`, resetValues, keepExistingSelection);
        }
      });
    },
    /**
     * Update suggests for a drop down of a field.
     *
     * @function
     * @param fieldInfoModel Runtime model with parameters store information.
     * @param fieldPathAbsolute Complete runtime property path.
     * @param resetValues Should the values be reset to original state.
     * @param keepExistingSelection Should the existing selection before update remain.
     */
    _updateFieldPathSuggestions: function (fieldInfoModel, fieldPathAbsolute, resetValues, keepExistingSelection) {
      const options = fieldInfoModel.getProperty(fieldPathAbsolute);
      const defaultOptions = options.defaultOptions;
      const selectedKey = fieldInfoModel.getProperty(`${fieldPathAbsolute}/selectedKey`);
      const existingSelection = keepExistingSelection && options.find(option => option.key === selectedKey);
      if (resetValues) {
        const selectOptions = options.selectOptions;
        options.length = 0;
        defaultOptions.forEach(defaultOption => options.push(defaultOption));
        selectOptions.forEach(selectOption => options.push(selectOption));
      } else {
        options.length = 0;
        defaultOptions.forEach(defaultOption => options.push(defaultOption));
      }
      fieldInfoModel.setProperty(fieldPathAbsolute, options);
      if (existingSelection && !options.includes(existingSelection)) {
        options.push(existingSelection);
        fieldInfoModel.setProperty(`${fieldPathAbsolute}/selectedKey`, selectedKey);
      }
    },
    /**
     * Update In and Out Parameters in the MED.
     *
     * @function
     * @param transCtx The transient context of the MED.
     * @param source MDC field.
     * @param fieldInfoModel Runtime model with parameters store information.
     * @param propertyName Property path.
     */
    _setValueListInfo: function (transCtx, source, fieldInfoModel, propertyName) {
      const propPath = fieldInfoModel.getProperty(`/values/${propertyName}`) && "/values/" || fieldInfoModel.getProperty(`/unitData/${propertyName}`) && "/unitData/";
      if (fieldInfoModel.getProperty(`${propPath}${propertyName}/valueListInfo`)) {
        return;
      }
      const valueListInfo = fieldInfoModel.getProperty(`${propPath}${propertyName}/valueListInfo`);
      if (!valueListInfo) {
        MassEditHandlers._requestValueList(transCtx, source, fieldInfoModel, propertyName);
      }
    },
    /**
     * Request and update In and Out Parameters in the MED.
     *
     * @function
     * @param transCtx The transient context of the MED.
     * @param source MDC field.
     * @param fieldInfoModel Runtime model with parameters store information.
     * @param propertyName Property path.
     */
    _requestValueList: function (transCtx, source, fieldInfoModel, propertyName) {
      var _fieldValueHelp$getDe;
      const metaPath = ModelHelper.getMetaPathForContext(transCtx);
      const propertyPath = metaPath && `${metaPath}/${propertyName}`;
      const dependents = source === null || source === void 0 ? void 0 : source.getDependents();
      const fieldHelp = source === null || source === void 0 ? void 0 : source.getFieldHelp();
      const fieldValueHelp = dependents === null || dependents === void 0 ? void 0 : dependents.find(dependent => dependent.getId() === fieldHelp);
      const payload = (_fieldValueHelp$getDe = fieldValueHelp.getDelegate()) === null || _fieldValueHelp$getDe === void 0 ? void 0 : _fieldValueHelp$getDe.payload;
      if (!(fieldValueHelp !== null && fieldValueHelp !== void 0 && fieldValueHelp.getBindingContext())) {
        fieldValueHelp === null || fieldValueHelp === void 0 ? void 0 : fieldValueHelp.setBindingContext(transCtx);
      }
      const metaModel = transCtx.getModel().getMetaModel();
      ValueListHelper.createVHUIModel(fieldValueHelp, propertyPath, metaModel);
      const valueListInfo = ValueListHelper.getValueListInfo(fieldValueHelp, propertyPath, payload);
      valueListInfo.then(vLinfos => {
        const vLinfo = vLinfos[0];
        const propPath = fieldInfoModel.getProperty(`/values/${propertyName}`) && "/values/" || fieldInfoModel.getProperty(`/unitData/${propertyName}`) && "/unitData/";
        const info = {
          inParameters: vLinfo.vhParameters && ValueListHelper.getInParameters(vLinfo.vhParameters).map(inParam => inParam.helpPath),
          outParameters: vLinfo.vhParameters && ValueListHelper.getOutParameters(vLinfo.vhParameters).map(outParam => outParam.helpPath)
        };
        fieldInfoModel.setProperty(`${propPath}${propertyName}/valueListInfo`, info);
        if (info.outParameters.length > 0) {
          MassEditHandlers._updateFieldPathSuggestions(fieldInfoModel, `/values/${propertyName}`, false, true);
        }
      }).catch(() => {
        Log.warning(`Mass Edit: Couldn't load valueList info for ${propertyPath}`);
      });
    },
    /**
     * Get field help control from MDC field.
     *
     * @function
     * @param transCtx The transient context of the MED.
     * @param source MDC field.
     * @returns Field Help control.
     */
    _getValueHelp: function (transCtx, source) {
      const dependents = source === null || source === void 0 ? void 0 : source.getDependents();
      const fieldHelp = source === null || source === void 0 ? void 0 : source.getFieldHelp();
      return dependents === null || dependents === void 0 ? void 0 : dependents.find(dependent => dependent.getId() === fieldHelp);
    },
    /**
     * Colled on drop down selection of VHD option.
     *
     * @function
     * @param source Custom Mass Edit Select control.
     * @param propertyName Property path.
     * @param selectKey Previous key before the VHD was selected.
     */
    _onVHSelect: function (source, propertyName, selectKey) {
      // Called for
      // 1. VHD selected.

      const fieldInfoModel = source && source.getModel("fieldsInfo");
      const propPath = fieldInfoModel.getProperty(`/values/${propertyName}`) && "/values/" || fieldInfoModel.getProperty(`/unitData/${propertyName}`) && "/unitData/";
      const transCtx = source.getBindingContext();
      const fieldValueHelp = MassEditHandlers._getValueHelp(transCtx, source.getParent());
      if (!(fieldValueHelp !== null && fieldValueHelp !== void 0 && fieldValueHelp.getBindingContext())) {
        fieldValueHelp === null || fieldValueHelp === void 0 ? void 0 : fieldValueHelp.setBindingContext(transCtx);
      }
      source.fireValueHelpRequest();
      fieldInfoModel.setProperty(`${propPath + propertyName}/selectedKey`, selectKey);
    },
    /**
     * Gets Property name from selection key.
     *
     * @function
     * @param key Selection key.
     * @returns Property name.
     */
    _getPropertyNameFromKey: function (key) {
      let propertyName = "";
      if (key.startsWith("Default/") || key.startsWith("ClearFieldValue/") || key.startsWith("UseValueHelpValue/")) {
        propertyName = key.substring(key.indexOf("/") + 1);
      } else {
        propertyName = key.substring(0, key.lastIndexOf("/"));
      }
      return propertyName;
    },
    /**
     * Update selection to Custom Mass Edit Select from MDC field.
     *
     * @function
     * @param source MDC field.
     * @param propertyName Property path.
     * @param value Value to update.
     * @param fullText Full text to use.
     */
    _updateSelectKey: function (source, propertyName, value, fullText) {
      // Called for
      // 1. VHD property change
      // 2. Out Parameters.
      // 3. Transient context property change.

      const comboBox = source.getContent();
      if (!comboBox || !propertyName) {
        return;
      }
      let key = comboBox.getSelectedKey();
      if ((key.startsWith("Default/") || key.startsWith("ClearFieldValue/")) && !value) {
        return;
      }
      const formattedText = MassEditHandlers._valueExists(fullText) ? fullText : value;
      const fieldInfoModel = source && source.getModel("fieldsInfo");
      const values = fieldInfoModel.getProperty(`/values/${propertyName}`) || fieldInfoModel.getProperty(`/unitData/${propertyName}`) || [];
      const propPath = fieldInfoModel.getProperty(`/values/${propertyName}`) && "/values/" || fieldInfoModel.getProperty(`/unitData/${propertyName}`) && "/unitData/";
      const relatedField = values.find(fieldData => {
        var _fieldData$textInfo;
        return (fieldData === null || fieldData === void 0 ? void 0 : (_fieldData$textInfo = fieldData.textInfo) === null || _fieldData$textInfo === void 0 ? void 0 : _fieldData$textInfo.value) === value || fieldData.text === value;
      });
      if (relatedField) {
        if (fullText && relatedField.textInfo && relatedField.textInfo.descriptionPath && (relatedField.text != formattedText || relatedField.textInfo.fullText != formattedText)) {
          // Update the full text only when provided.
          relatedField.text = formattedText;
          relatedField.textInfo.fullText = formattedText;
          relatedField.textInfo.description = source.getAdditionalValue();
        }
        if (relatedField.key === key) {
          fieldInfoModel.setProperty(`${propPath + propertyName}/selectedKey`, key);
          return;
        }
        key = relatedField.key;
      } else if ([undefined, null, ""].indexOf(value) === -1) {
        key = `${propertyName}/${value}`;
        const selectionInfo = {
          text: formattedText,
          key,
          textInfo: {
            description: source.getAdditionalValue(),
            descriptionPath: values && values.textInfo && values.textInfo.descriptionPath,
            fullText: formattedText,
            textArrangement: source.getDisplay(),
            value: source.getValue(),
            valuePath: propertyName
          }
        };
        values.push(selectionInfo);
        values.selectOptions = values.selectOptions || [];
        values.selectOptions.push(selectionInfo);
        fieldInfoModel.setProperty(propPath + propertyName, values);
      } else {
        key = `Default/${propertyName}`;
      }
      fieldInfoModel.setProperty(`${propPath + propertyName}/selectedKey`, key);
      MassEditHandlers._updateResults(comboBox);
    },
    /**
     * Get Value from Drop down.
     *
     * @function
     * @param source Drop down control.
     * @returns Value of selection.
     */
    _getValue: function (source) {
      var _getSelectedItem;
      return source.getMetadata().getName() === "sap.fe.core.controls.MassEditSelect" ? (_getSelectedItem = source.getSelectedItem()) === null || _getSelectedItem === void 0 ? void 0 : _getSelectedItem.getText() : source.getValue();
    },
    _getValueOnEmpty: function (oSource, fieldsInfoModel, value, sPropertyName) {
      if (!value) {
        const values = fieldsInfoModel.getProperty(`/values/${sPropertyName}`) || fieldsInfoModel.getProperty(`/unitData/${sPropertyName}`) || [];
        if (values.unitProperty) {
          value = 0;
          oSource.setValue(value);
        } else if (values.inputType === "CheckBox") {
          value = false;
        }
      }
      return value;
    },
    _valueExists: function (value) {
      return value != undefined && value != null;
    },
    /**
     * Updates selections to runtime model.
     *
     * @function
     * @param oSource Drop down control.
     * @param aParams Parts of key in runtime model.
     * @param updateTransCtx Should transient context be updated with the value.
     */
    _updateResults: function (oSource) {
      let aParams = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      let updateTransCtx = arguments.length > 2 ? arguments[2] : undefined;
      // Called for
      // 1. VHD property change.
      // 2. Out parameter.
      // 3. transient context property change.
      const fieldsInfoModel = oSource && oSource.getModel("fieldsInfo");
      const oFieldsInfoData = fieldsInfoModel && fieldsInfoModel.getData();
      let value = MassEditHandlers._getValue(oSource);
      aParams = aParams.length > 0 ? aParams : oSource && oSource.getSelectedKey() && oSource.getSelectedKey().split("/");
      let oDataObject;
      const sPropertyName = oSource.data("fieldPath");
      const propertyFullyQualifiedName = oSource.data("propertyFullyQualifiedName");
      if (aParams[0] === "Default") {
        oDataObject = {
          keyValue: aParams[1],
          propertyFullyQualifiedName,
          value: aParams[0]
        };
      } else if (aParams[0] === "ClearFieldValue") {
        value = "";
        value = MassEditHandlers._getValueOnEmpty(oSource, fieldsInfoModel, value, sPropertyName);
        oDataObject = {
          keyValue: aParams[1],
          propertyFullyQualifiedName,
          value: value
        };
      } else if (!aParams) {
        value = MassEditHandlers._getValueOnEmpty(oSource, fieldsInfoModel, value, sPropertyName);
        oDataObject = {
          keyValue: sPropertyName,
          propertyFullyQualifiedName,
          value: value
        };
      } else {
        const propertyName = aParams.slice(0, -1).join("/");
        const propertyValues = fieldsInfoModel.getProperty(`/values/${propertyName}`) || fieldsInfoModel.getProperty(`/unitData/${propertyName}`) || [];
        const relatedField = (propertyValues || []).find(function (oFieldData) {
          var _oFieldData$textInfo;
          return (oFieldData === null || oFieldData === void 0 ? void 0 : (_oFieldData$textInfo = oFieldData.textInfo) === null || _oFieldData$textInfo === void 0 ? void 0 : _oFieldData$textInfo.value) === value || oFieldData.text === value;
        });
        oDataObject = {
          keyValue: propertyName,
          propertyFullyQualifiedName,
          value: relatedField.textInfo && MassEditHandlers._valueExists(relatedField.textInfo.value) ? relatedField.textInfo.value : relatedField.text
        };
      }
      let bExistingElementindex = -1;
      for (let i = 0; i < oFieldsInfoData.results.length; i++) {
        if (oFieldsInfoData.results[i].keyValue === oDataObject.keyValue) {
          bExistingElementindex = i;
        }
      }
      if (bExistingElementindex !== -1) {
        oFieldsInfoData.results[bExistingElementindex] = oDataObject;
      } else {
        oFieldsInfoData.results.push(oDataObject);
      }
      if (updateTransCtx && !oDataObject.keyValue.includes("/")) {
        const transCtx = oSource.getBindingContext();
        if (aParams[0] === "Default" || aParams[0] === "ClearFieldValue") {
          transCtx.setProperty(oDataObject.keyValue, null);
        } else if (oDataObject) {
          transCtx.setProperty(oDataObject.keyValue, oDataObject.value);
        }
      }
    }
  };
  return MassEditHandlers;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXNzRWRpdEhhbmRsZXJzIiwiY29udGV4dFByb3BlcnR5Q2hhbmdlIiwibmV3VmFsdWUiLCJkYXRhUHJvcGVydHkiLCJtZGNGaWVsZElkIiwic291cmNlIiwiQ29yZSIsImJ5SWQiLCJ0cmFuc0N0eCIsImdldEJpbmRpbmdDb250ZXh0IiwiZmllbGRJbmZvTW9kZWwiLCJnZXRNb2RlbCIsInZhbHVlcyIsImdldFByb3BlcnR5IiwiaW5wdXRUeXBlIiwidmFsdWVMaXN0SW5mbyIsIl9zZXRWYWx1ZUxpc3RJbmZvIiwiaXNEaWFsb2dPcGVuIiwiZ2V0VmlzaWJsZSIsIl91cGRhdGVTZWxlY3RLZXkiLCJoYW5kbGVNRENGaWVsZENoYW5nZSIsImV2ZW50IiwicHJvcGVydHlOYW1lIiwiZ2V0U291cmNlIiwiY2hhbmdlUHJvbWlzZSIsImdldFBhcmFtZXRlciIsImNvbWJvQm94IiwiZ2V0Q29udGVudCIsInRoZW4iLCJfdXBkYXRlU2VsZWN0S2V5Rm9yTURDRmllbGRDaGFuZ2UiLCJiaW5kIiwiY2F0Y2giLCJlcnIiLCJMb2ciLCJ3YXJuaW5nIiwiaGFuZGxlU2VsZWN0aW9uQ2hhbmdlIiwia2V5IiwiZ2V0U2VsZWN0ZWRLZXkiLCJwYXJhbXMiLCJzcGxpdCIsInByZXZJdGVtIiwic2VsZWN0S2V5IiwiZ2V0S2V5Iiwic2xpY2UiLCJqb2luIiwiX29uVkhTZWxlY3QiLCJfZ2V0UHJvcGVydHlOYW1lRnJvbUtleSIsIl91cGRhdGVTdWdnZXN0aW9uRm9yRmllbGRzV2l0aEluUGFyYW1ldGVycyIsInN0YXJ0c1dpdGgiLCJfdXBkYXRlU3VnZ2VzdGlvbkZvckZpZWxkc1dpdGhPdXRQYXJhbWV0ZXJzIiwiX3VwZGF0ZVJlc3VsdHMiLCJ2YWx1ZSIsImZvcm1hdHRlZFZhbHVlIiwiZ2V0Rm9ybUZvcm1hdHRlZFZhbHVlIiwicmVzZXRWYWx1ZXMiLCJrZWVwRXhpc3RpbmdTZWxlY3Rpb24iLCJ1bml0RGF0YSIsImZpZWxkUGF0aHMiLCJPYmplY3QiLCJrZXlzIiwidW5pdEZpZWxkUGF0aHMiLCJmb3JFYWNoIiwiX3VwZGF0ZUluUGFyYW1ldGVyU3VnZ2V0aW9ucyIsInBhdGhQcmVmaXgiLCJzcmNQcm9wZXJ0eU5hbWUiLCJpblBhcmFtZXRlcnMiLCJsZW5ndGgiLCJpbmNsdWRlcyIsIl91cGRhdGVGaWVsZFBhdGhTdWdnZXN0aW9ucyIsIm91dFBhcmFtZXRlcnMiLCJfdXBkYXRlT3V0UGFyYW1ldGVyU3VnZ2V0aW9ucyIsIm91dFBhcmFtZXRlciIsImZpZWxkUGF0aEFic29sdXRlIiwib3B0aW9ucyIsImRlZmF1bHRPcHRpb25zIiwic2VsZWN0ZWRLZXkiLCJleGlzdGluZ1NlbGVjdGlvbiIsImZpbmQiLCJvcHRpb24iLCJzZWxlY3RPcHRpb25zIiwiZGVmYXVsdE9wdGlvbiIsInB1c2giLCJzZWxlY3RPcHRpb24iLCJzZXRQcm9wZXJ0eSIsInByb3BQYXRoIiwiX3JlcXVlc3RWYWx1ZUxpc3QiLCJtZXRhUGF0aCIsIk1vZGVsSGVscGVyIiwiZ2V0TWV0YVBhdGhGb3JDb250ZXh0IiwicHJvcGVydHlQYXRoIiwiZGVwZW5kZW50cyIsImdldERlcGVuZGVudHMiLCJmaWVsZEhlbHAiLCJnZXRGaWVsZEhlbHAiLCJmaWVsZFZhbHVlSGVscCIsImRlcGVuZGVudCIsImdldElkIiwicGF5bG9hZCIsImdldERlbGVnYXRlIiwic2V0QmluZGluZ0NvbnRleHQiLCJtZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJWYWx1ZUxpc3RIZWxwZXIiLCJjcmVhdGVWSFVJTW9kZWwiLCJnZXRWYWx1ZUxpc3RJbmZvIiwidkxpbmZvcyIsInZMaW5mbyIsImluZm8iLCJ2aFBhcmFtZXRlcnMiLCJnZXRJblBhcmFtZXRlcnMiLCJtYXAiLCJpblBhcmFtIiwiaGVscFBhdGgiLCJnZXRPdXRQYXJhbWV0ZXJzIiwib3V0UGFyYW0iLCJfZ2V0VmFsdWVIZWxwIiwiZ2V0UGFyZW50IiwiZmlyZVZhbHVlSGVscFJlcXVlc3QiLCJzdWJzdHJpbmciLCJpbmRleE9mIiwibGFzdEluZGV4T2YiLCJmdWxsVGV4dCIsImZvcm1hdHRlZFRleHQiLCJfdmFsdWVFeGlzdHMiLCJyZWxhdGVkRmllbGQiLCJmaWVsZERhdGEiLCJ0ZXh0SW5mbyIsInRleHQiLCJkZXNjcmlwdGlvblBhdGgiLCJkZXNjcmlwdGlvbiIsImdldEFkZGl0aW9uYWxWYWx1ZSIsInVuZGVmaW5lZCIsInNlbGVjdGlvbkluZm8iLCJ0ZXh0QXJyYW5nZW1lbnQiLCJnZXREaXNwbGF5IiwiZ2V0VmFsdWUiLCJ2YWx1ZVBhdGgiLCJfZ2V0VmFsdWUiLCJnZXRNZXRhZGF0YSIsImdldE5hbWUiLCJnZXRTZWxlY3RlZEl0ZW0iLCJnZXRUZXh0IiwiX2dldFZhbHVlT25FbXB0eSIsIm9Tb3VyY2UiLCJmaWVsZHNJbmZvTW9kZWwiLCJzUHJvcGVydHlOYW1lIiwidW5pdFByb3BlcnR5Iiwic2V0VmFsdWUiLCJhUGFyYW1zIiwidXBkYXRlVHJhbnNDdHgiLCJvRmllbGRzSW5mb0RhdGEiLCJnZXREYXRhIiwib0RhdGFPYmplY3QiLCJkYXRhIiwicHJvcGVydHlGdWxseVF1YWxpZmllZE5hbWUiLCJrZXlWYWx1ZSIsInByb3BlcnR5VmFsdWVzIiwib0ZpZWxkRGF0YSIsImJFeGlzdGluZ0VsZW1lbnRpbmRleCIsImkiLCJyZXN1bHRzIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJNYXNzRWRpdEhhbmRsZXJzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29uc3RydWN0b3IgZm9yIGEgbmV3IFZpc3VhbCBGaWx0ZXIgQ29udGFpbmVyLlxuICogVXNlZCBmb3IgdmlzdWFsIGZpbHRlcnNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gW3NJZF0gSUQgZm9yIHRoZSBuZXcgY29udHJvbCwgZ2VuZXJhdGVkIGF1dG9tYXRpY2FsbHkgaWYgbm8gSUQgaXMgZ2l2ZW5cbiAqIEBleHRlbmRzIHNhcC51aS5tZGMuZmlsdGVyYmFyLklGaWx0ZXJDb250YWluZXJcbiAqIEBjbGFzc1xuICogQHByaXZhdGVcbiAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9scy5maWx0ZXJiYXIuVmlzdWFsRmlsdGVyQ29udGFpbmVyXG4gKi9cbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IFZhbHVlSGVscFBheWxvYWQsIFZhbHVlTGlzdEluZm8gfSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC92YWx1ZWhlbHAvVmFsdWVMaXN0SGVscGVyXCI7XG5pbXBvcnQgVmFsdWVMaXN0SGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ludGVybmFsL3ZhbHVlaGVscC9WYWx1ZUxpc3RIZWxwZXJcIjtcbmltcG9ydCB0eXBlIENvbWJvQm94IGZyb20gXCJzYXAvbS9Db21ib0JveFwiO1xuaW1wb3J0IHR5cGUgU2VsZWN0IGZyb20gXCJzYXAvbS9TZWxlY3RcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgdHlwZSBGaWVsZCBmcm9tIFwic2FwL3VpL21kYy9GaWVsZFwiO1xuaW1wb3J0IHR5cGUgVmFsdWVIZWxwIGZyb20gXCJzYXAvdWkvbWRjL1ZhbHVlSGVscFwiO1xuaW1wb3J0IHR5cGUgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5cbmNvbnN0IE1hc3NFZGl0SGFuZGxlcnM6IGFueSA9IHtcblx0LyoqXG5cdCAqIENhbGxlZCBmb3IgcHJvcGVydHkgY2hhbmdlIGluIHRoZSB0cmFuc2llbnQgY29udGV4dC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBuZXdWYWx1ZSBOZXcgdmFsdWUgb2YgdGhlIHByb3BlcnR5LlxuXHQgKiBAcGFyYW0gZGF0YVByb3BlcnR5IEZpbmFsIGNvbnRleHQgcmV0dXJuZWQgYWZ0ZXIgdGhlIHBhZ2luYXRvciBhY3Rpb25cblx0ICogQHBhcmFtIG1kY0ZpZWxkSWQgRmluYWwgY29udGV4dCByZXR1cm5lZCBhZnRlciB0aGUgcGFnaW5hdG9yIGFjdGlvblxuXHQgKi9cblx0Y29udGV4dFByb3BlcnR5Q2hhbmdlOiBmdW5jdGlvbiAobmV3VmFsdWU6IGFueSwgZGF0YVByb3BlcnR5OiBzdHJpbmcsIG1kY0ZpZWxkSWQ6IHN0cmluZykge1xuXHRcdC8vIENhbGxlZCBmb3Jcblx0XHQvLyAxLiBPdXQgUGFyYW1ldGVycy5cblx0XHQvLyAyLiBUcmFuc2llbnQgY29udGV4dCBwcm9wZXJ0eSBjaGFuZ2UuXG5cblx0XHRjb25zdCBzb3VyY2UgPSBDb3JlLmJ5SWQobWRjRmllbGRJZCkgYXMgRmllbGQ7XG5cdFx0Y29uc3QgdHJhbnNDdHggPSBzb3VyY2UgJiYgKHNvdXJjZS5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQpO1xuXHRcdGNvbnN0IGZpZWxkSW5mb01vZGVsID0gc291cmNlICYmIChzb3VyY2UuZ2V0TW9kZWwoXCJmaWVsZHNJbmZvXCIpIGFzIEpTT05Nb2RlbCk7XG5cdFx0Y29uc3QgdmFsdWVzID1cblx0XHRcdGZpZWxkSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdmFsdWVzLyR7ZGF0YVByb3BlcnR5fWApIHx8IGZpZWxkSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdW5pdERhdGEvJHtkYXRhUHJvcGVydHl9YCkgfHwgW107XG5cblx0XHRpZiAodHJhbnNDdHggJiYgKHZhbHVlcy5pbnB1dFR5cGUgPT09IFwiSW5wdXRXaXRoVmFsdWVIZWxwXCIgfHwgdmFsdWVzLmlucHV0VHlwZSA9PT0gXCJJbnB1dFdpdGhVbml0XCIpICYmICF2YWx1ZXMudmFsdWVMaXN0SW5mbykge1xuXHRcdFx0TWFzc0VkaXRIYW5kbGVycy5fc2V0VmFsdWVMaXN0SW5mbyh0cmFuc0N0eCwgc291cmNlLCBmaWVsZEluZm9Nb2RlbCwgZGF0YVByb3BlcnR5KTtcblx0XHR9XG5cblx0XHRjb25zdCBpc0RpYWxvZ09wZW4gPSBmaWVsZEluZm9Nb2RlbCAmJiBmaWVsZEluZm9Nb2RlbC5nZXRQcm9wZXJ0eShcIi9pc09wZW5cIik7XG5cdFx0aWYgKCFpc0RpYWxvZ09wZW4gfHwgIXNvdXJjZS5nZXRWaXNpYmxlKCkpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRNYXNzRWRpdEhhbmRsZXJzLl91cGRhdGVTZWxlY3RLZXkoc291cmNlLCBkYXRhUHJvcGVydHksIG5ld1ZhbHVlKTtcblx0fSxcblxuXHQvKipcblx0ICogQ2FsbGVkIGZvciBjaGFuZ2UgaW4gdGhlIE1EQyBmaWVsZC5cblx0ICogVGhpcyBpcyBjYWxsZWQgb24gc2VsZWN0aW9uIGRvbmUgdGhyb3VnaCBWSEQuXG5cdCAqIFRoaXMgaXMgbm90IGNhbGxlZCBvbiBjaGFuZ2Ugb2YgdGhlIGRyb3Bkb3duIGFzIHdlIGFyZSB1c2luZyBhIGN1c3RvbSBNYXNzRWRpdFNlbGVjdCBjb250cm9sIGFuZCBub3QgZ2VuZXJhbCBTZWxlY3QuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0gZXZlbnQgRXZlbnQgb2JqZWN0IGZvciBjaGFuZ2UuXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eU5hbWUgUHJvcGVydHkgcGF0aC5cblx0ICovXG5cdGhhbmRsZU1EQ0ZpZWxkQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQ6IGFueSwgcHJvcGVydHlOYW1lOiBzdHJpbmcpIHtcblx0XHQvLyBDYWxsZWQgZm9yXG5cdFx0Ly8gMS4gVkhEIHByb3BlcnR5IGNoYW5nZS5cblxuXHRcdGNvbnN0IHNvdXJjZSA9IGV2ZW50ICYmIGV2ZW50LmdldFNvdXJjZSgpO1xuXHRcdGNvbnN0IGNoYW5nZVByb21pc2UgPSBldmVudCAmJiBldmVudC5nZXRQYXJhbWV0ZXIoXCJwcm9taXNlXCIpO1xuXHRcdGNvbnN0IGNvbWJvQm94ID0gc291cmNlLmdldENvbnRlbnQoKTtcblx0XHRpZiAoIWNvbWJvQm94IHx8ICFwcm9wZXJ0eU5hbWUpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjaGFuZ2VQcm9taXNlXG5cdFx0XHQudGhlbihNYXNzRWRpdEhhbmRsZXJzLl91cGRhdGVTZWxlY3RLZXlGb3JNRENGaWVsZENoYW5nZS5iaW5kKE1hc3NFZGl0SGFuZGxlcnMsIHNvdXJjZSwgcHJvcGVydHlOYW1lKSlcblx0XHRcdC5jYXRjaCgoZXJyOiBhbnkpID0+IHtcblx0XHRcdFx0TG9nLndhcm5pbmcoYFZIRCBzZWxlY3Rpb24gY291bGRuJ3QgYmUgcG9wdWxhdGVkIGluIHRoZSBtYXNzIGVkaXQgZmllbGQuJHtlcnJ9YCk7XG5cdFx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogQ2FsbGVkIGZvciBzZWxlY3Rpb24gY2hhbmdlIHRocm91Z2ggdGhlIGRyb3AgZG93bi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBldmVudCBFdmVudCBvYmplY3QgZm9yIGNoYW5nZS5cblx0ICovXG5cdGhhbmRsZVNlbGVjdGlvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50OiBhbnkpIHtcblx0XHQvLyBDYWxsZWQgZm9yIE1hbnVhbCBzZWxlY3Rpb24gZnJvbSBkcm9wZG93bihjb21ib0JveCBvciBzZWxlY3QpXG5cdFx0Ly8gMS4gVkhEIHNlbGVjdC5cblx0XHQvLyAyLiBBbnkgdmFsdWUgY2hhbmdlIGluIHRoZSBjb250cm9sLlxuXG5cdFx0Y29uc3Qgc291cmNlID0gZXZlbnQgJiYgZXZlbnQuZ2V0U291cmNlKCk7XG5cdFx0Y29uc3Qga2V5ID0gc291cmNlLmdldFNlbGVjdGVkS2V5KCkgYXMgc3RyaW5nO1xuXHRcdGNvbnN0IHBhcmFtcyA9IHNvdXJjZSAmJiBrZXkgJiYga2V5LnNwbGl0KFwiL1wiKTtcblx0XHRsZXQgcHJvcGVydHlOYW1lO1xuXG5cdFx0aWYgKHBhcmFtc1swXSA9PT0gXCJVc2VWYWx1ZUhlbHBWYWx1ZVwiKSB7XG5cdFx0XHRjb25zdCBwcmV2SXRlbSA9IGV2ZW50LmdldFBhcmFtZXRlcihcInByZXZpb3VzU2VsZWN0ZWRJdGVtXCIpO1xuXHRcdFx0Y29uc3Qgc2VsZWN0S2V5ID0gcHJldkl0ZW0uZ2V0S2V5KCk7XG5cdFx0XHRwcm9wZXJ0eU5hbWUgPSBwYXJhbXMuc2xpY2UoMSkuam9pbihcIi9cIik7XG5cdFx0XHRNYXNzRWRpdEhhbmRsZXJzLl9vblZIU2VsZWN0KHNvdXJjZSwgcHJvcGVydHlOYW1lLCBzZWxlY3RLZXkpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNvbnN0IGZpZWxkSW5mb01vZGVsID0gc291cmNlICYmIChzb3VyY2UuZ2V0TW9kZWwoXCJmaWVsZHNJbmZvXCIpIGFzIEpTT05Nb2RlbCk7XG5cdFx0cHJvcGVydHlOYW1lID0gTWFzc0VkaXRIYW5kbGVycy5fZ2V0UHJvcGVydHlOYW1lRnJvbUtleShrZXkpO1xuXHRcdE1hc3NFZGl0SGFuZGxlcnMuX3VwZGF0ZVN1Z2dlc3Rpb25Gb3JGaWVsZHNXaXRoSW5QYXJhbWV0ZXJzKFxuXHRcdFx0ZmllbGRJbmZvTW9kZWwsXG5cdFx0XHRwcm9wZXJ0eU5hbWUsXG5cdFx0XHRrZXkuc3RhcnRzV2l0aChcIkRlZmF1bHQvXCIpIHx8IGtleS5zdGFydHNXaXRoKFwiQ2xlYXJGaWVsZFZhbHVlL1wiKSxcblx0XHRcdHRydWVcblx0XHQpO1xuXHRcdE1hc3NFZGl0SGFuZGxlcnMuX3VwZGF0ZVN1Z2dlc3Rpb25Gb3JGaWVsZHNXaXRoT3V0UGFyYW1ldGVycyhcblx0XHRcdGZpZWxkSW5mb01vZGVsLFxuXHRcdFx0cHJvcGVydHlOYW1lLFxuXHRcdFx0a2V5LnN0YXJ0c1dpdGgoXCJEZWZhdWx0L1wiKSB8fCBrZXkuc3RhcnRzV2l0aChcIkNsZWFyRmllbGRWYWx1ZS9cIiksXG5cdFx0XHRmYWxzZVxuXHRcdCk7XG5cdFx0TWFzc0VkaXRIYW5kbGVycy5fdXBkYXRlUmVzdWx0cyhzb3VyY2UsIHBhcmFtcywgdHJ1ZSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFVwZGF0ZSBzZWxlY3Rpb25zIHRvIHJlc3VsdHMgYW5kIHRoZSBzdWdnZXN0cyBpbiBkcm9wIGRvd25zLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIHNvdXJjZSBNREMgZmllbGQgdGhhdCB3YXMgY2hhbmdlZC5cblx0ICogQHBhcmFtIHByb3BlcnR5TmFtZSBQcm9wZXJ0eSBwYXRoLlxuXHQgKiBAcGFyYW0gdmFsdWUgTmV3IHZhbHVlLlxuXHQgKi9cblx0X3VwZGF0ZVNlbGVjdEtleUZvck1EQ0ZpZWxkQ2hhbmdlOiBmdW5jdGlvbiAoc291cmNlOiBhbnksIHByb3BlcnR5TmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG5cdFx0Y29uc3QgdHJhbnNDdHggPSBzb3VyY2UgJiYgc291cmNlLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0Y29uc3QgZmllbGRJbmZvTW9kZWwgPSBzb3VyY2UgJiYgKHNvdXJjZS5nZXRNb2RlbChcImZpZWxkc0luZm9cIikgYXMgSlNPTk1vZGVsKTtcblx0XHRjb25zdCB2YWx1ZXMgPVxuXHRcdFx0ZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYC92YWx1ZXMvJHtwcm9wZXJ0eU5hbWV9YCkgfHwgZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYC91bml0RGF0YS8ke3Byb3BlcnR5TmFtZX1gKSB8fCBbXTtcblxuXHRcdGlmICh0cmFuc0N0eCAmJiAodmFsdWVzLmlucHV0VHlwZSA9PT0gXCJJbnB1dFdpdGhWYWx1ZUhlbHBcIiB8fCB2YWx1ZXMuaW5wdXRUeXBlID09PSBcIklucHV0V2l0aFVuaXRcIikgJiYgIXZhbHVlcy52YWx1ZUxpc3RJbmZvKSB7XG5cdFx0XHRNYXNzRWRpdEhhbmRsZXJzLl9zZXRWYWx1ZUxpc3RJbmZvKHRyYW5zQ3R4LCBzb3VyY2UsIGZpZWxkSW5mb01vZGVsLCBwcm9wZXJ0eU5hbWUpO1xuXHRcdH1cblxuXHRcdE1hc3NFZGl0SGFuZGxlcnMuX3VwZGF0ZVN1Z2dlc3Rpb25Gb3JGaWVsZHNXaXRoT3V0UGFyYW1ldGVycyhmaWVsZEluZm9Nb2RlbCwgcHJvcGVydHlOYW1lLCBmYWxzZSwgdHJ1ZSk7XG5cdFx0TWFzc0VkaXRIYW5kbGVycy5fdXBkYXRlU3VnZ2VzdGlvbkZvckZpZWxkc1dpdGhJblBhcmFtZXRlcnMoZmllbGRJbmZvTW9kZWwsIHByb3BlcnR5TmFtZSwgZmFsc2UsIHRydWUpO1xuXG5cdFx0Y29uc3QgZm9ybWF0dGVkVmFsdWUgPSBzb3VyY2UuZ2V0Rm9ybUZvcm1hdHRlZFZhbHVlKCk7XG5cdFx0TWFzc0VkaXRIYW5kbGVycy5fdXBkYXRlU2VsZWN0S2V5KHNvdXJjZSwgcHJvcGVydHlOYW1lLCB2YWx1ZSwgZm9ybWF0dGVkVmFsdWUpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgc3VnZ2VzdHMgZm9yIGFsbCBkcm9wIGRvd25zIHdpdGggSW5QYXJhbWV0ZXIgYXMgdGhlIHByb3BlcnR5TmFtZS5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBmaWVsZEluZm9Nb2RlbCBSdW50aW1lIG1vZGVsIHdpdGggcGFyYW1ldGVycyBzdG9yZSBpbmZvcm1hdGlvbi5cblx0ICogQHBhcmFtIHByb3BlcnR5TmFtZSBQcm9wZXJ0eSBwYXRoLlxuXHQgKiBAcGFyYW0gcmVzZXRWYWx1ZXMgU2hvdWxkIHRoZSB2YWx1ZXMgYmUgcmVzZXQgdG8gb3JpZ2luYWwgc3RhdGUuXG5cdCAqIEBwYXJhbSBrZWVwRXhpc3RpbmdTZWxlY3Rpb24gU2hvdWxkIHRoZSBleGlzdGluZyBzZWxlY3Rpb24gYmVmb3JlIHVwZGF0ZSByZW1haW4uXG5cdCAqL1xuXHRfdXBkYXRlU3VnZ2VzdGlvbkZvckZpZWxkc1dpdGhJblBhcmFtZXRlcnM6IGZ1bmN0aW9uIChcblx0XHRmaWVsZEluZm9Nb2RlbDogSlNPTk1vZGVsLFxuXHRcdHByb3BlcnR5TmFtZTogc3RyaW5nLFxuXHRcdHJlc2V0VmFsdWVzOiBib29sZWFuLFxuXHRcdGtlZXBFeGlzdGluZ1NlbGVjdGlvbjogYm9vbGVhblxuXHQpOiB2b2lkIHtcblx0XHRjb25zdCB2YWx1ZXMgPSBmaWVsZEluZm9Nb2RlbC5nZXRQcm9wZXJ0eShcIi92YWx1ZXNcIik7XG5cdFx0Y29uc3QgdW5pdERhdGEgPSBmaWVsZEluZm9Nb2RlbC5nZXRQcm9wZXJ0eShcIi91bml0RGF0YVwiKTtcblx0XHRjb25zdCBmaWVsZFBhdGhzID0gT2JqZWN0LmtleXModmFsdWVzKTtcblx0XHRjb25zdCB1bml0RmllbGRQYXRocyA9IE9iamVjdC5rZXlzKHVuaXREYXRhKTtcblxuXHRcdGZpZWxkUGF0aHMuZm9yRWFjaChcblx0XHRcdE1hc3NFZGl0SGFuZGxlcnMuX3VwZGF0ZUluUGFyYW1ldGVyU3VnZ2V0aW9ucy5iaW5kKFxuXHRcdFx0XHRNYXNzRWRpdEhhbmRsZXJzLFxuXHRcdFx0XHRmaWVsZEluZm9Nb2RlbCxcblx0XHRcdFx0XCIvdmFsdWVzL1wiLFxuXHRcdFx0XHRwcm9wZXJ0eU5hbWUsXG5cdFx0XHRcdHJlc2V0VmFsdWVzLFxuXHRcdFx0XHRrZWVwRXhpc3RpbmdTZWxlY3Rpb25cblx0XHRcdClcblx0XHQpO1xuXHRcdHVuaXRGaWVsZFBhdGhzLmZvckVhY2goXG5cdFx0XHRNYXNzRWRpdEhhbmRsZXJzLl91cGRhdGVJblBhcmFtZXRlclN1Z2dldGlvbnMuYmluZChcblx0XHRcdFx0TWFzc0VkaXRIYW5kbGVycyxcblx0XHRcdFx0ZmllbGRJbmZvTW9kZWwsXG5cdFx0XHRcdFwiL3VuaXREYXRhL1wiLFxuXHRcdFx0XHRwcm9wZXJ0eU5hbWUsXG5cdFx0XHRcdHJlc2V0VmFsdWVzLFxuXHRcdFx0XHRrZWVwRXhpc3RpbmdTZWxlY3Rpb25cblx0XHRcdClcblx0XHQpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgc3VnZ2VzdHMgZm9yIGEgZHJvcCBkb3duIHdpdGggSW5QYXJhbWV0ZXIgYXMgdGhlIHNyY1Byb3BlcnR5TmFtZS5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBmaWVsZEluZm9Nb2RlbCBSdW50aW1lIG1vZGVsIHdpdGggcGFyYW1ldGVycyBzdG9yZSBpbmZvcm1hdGlvbi5cblx0ICogQHBhcmFtIHBhdGhQcmVmaXggUGF0aCBpbiB0aGUgcnVudGltZSBtb2RlbC5cblx0ICogQHBhcmFtIHNyY1Byb3BlcnR5TmFtZSBUaGUgSW5QYXJhbWV0ZXIgUHJvcGVydHkgcGF0aC5cblx0ICogQHBhcmFtIHJlc2V0VmFsdWVzIFNob3VsZCB0aGUgdmFsdWVzIGJlIHJlc2V0IHRvIG9yaWdpbmFsIHN0YXRlLlxuXHQgKiBAcGFyYW0ga2VlcEV4aXN0aW5nU2VsZWN0aW9uIFNob3VsZCB0aGUgZXhpc3Rpbmcgc2VsZWN0aW9uIGJlZm9yZSB1cGRhdGUgcmVtYWluLlxuXHQgKiBAcGFyYW0gcHJvcGVydHlOYW1lIFByb3BlcnR5IHBhdGggdGhhdCBuZWVkcyB1cGRhdGUgb2Ygc3VnZ2VzdGlvbnMuXG5cdCAqL1xuXHRfdXBkYXRlSW5QYXJhbWV0ZXJTdWdnZXRpb25zOiBmdW5jdGlvbiAoXG5cdFx0ZmllbGRJbmZvTW9kZWw6IEpTT05Nb2RlbCxcblx0XHRwYXRoUHJlZml4OiBzdHJpbmcsXG5cdFx0c3JjUHJvcGVydHlOYW1lOiBzdHJpbmcsXG5cdFx0cmVzZXRWYWx1ZXM6IGJvb2xlYW4sXG5cdFx0a2VlcEV4aXN0aW5nU2VsZWN0aW9uOiBib29sZWFuLFxuXHRcdHByb3BlcnR5TmFtZTogc3RyaW5nXG5cdCkge1xuXHRcdGNvbnN0IHZhbHVlTGlzdEluZm8gPSBmaWVsZEluZm9Nb2RlbC5nZXRQcm9wZXJ0eShgJHtwYXRoUHJlZml4ICsgcHJvcGVydHlOYW1lfS92YWx1ZUxpc3RJbmZvYCk7XG5cdFx0aWYgKHZhbHVlTGlzdEluZm8gJiYgc3JjUHJvcGVydHlOYW1lICE9IHByb3BlcnR5TmFtZSkge1xuXHRcdFx0Y29uc3QgaW5QYXJhbWV0ZXJzID0gdmFsdWVMaXN0SW5mby5pblBhcmFtZXRlcnM7XG5cdFx0XHRpZiAoaW5QYXJhbWV0ZXJzICYmIGluUGFyYW1ldGVycy5sZW5ndGggPiAwICYmIGluUGFyYW1ldGVycy5pbmNsdWRlcyhzcmNQcm9wZXJ0eU5hbWUpKSB7XG5cdFx0XHRcdE1hc3NFZGl0SGFuZGxlcnMuX3VwZGF0ZUZpZWxkUGF0aFN1Z2dlc3Rpb25zKGZpZWxkSW5mb01vZGVsLCBwYXRoUHJlZml4ICsgcHJvcGVydHlOYW1lLCByZXNldFZhbHVlcywga2VlcEV4aXN0aW5nU2VsZWN0aW9uKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFVwZGF0ZSBzdWdnZXN0cyBmb3IgYWxsIE91dFBhcmFtZXRlcidzIGRyb3AgZG93bnMgb2YgdGhlIHByb3BlcnR5TmFtZS5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBmaWVsZEluZm9Nb2RlbCBSdW50aW1lIG1vZGVsIHdpdGggcGFyYW1ldGVycyBzdG9yZSBpbmZvcm1hdGlvbi5cblx0ICogQHBhcmFtIHByb3BlcnR5TmFtZSBQcm9wZXJ0eSBwYXRoLlxuXHQgKiBAcGFyYW0gcmVzZXRWYWx1ZXMgU2hvdWxkIHRoZSB2YWx1ZXMgYmUgcmVzZXQgdG8gb3JpZ2luYWwgc3RhdGUuXG5cdCAqIEBwYXJhbSBrZWVwRXhpc3RpbmdTZWxlY3Rpb24gU2hvdWxkIHRoZSBleGlzdGluZyBzZWxlY3Rpb24gYmVmb3JlIHVwZGF0ZSByZW1haW4uXG5cdCAqL1xuXHRfdXBkYXRlU3VnZ2VzdGlvbkZvckZpZWxkc1dpdGhPdXRQYXJhbWV0ZXJzOiBmdW5jdGlvbiAoXG5cdFx0ZmllbGRJbmZvTW9kZWw6IEpTT05Nb2RlbCxcblx0XHRwcm9wZXJ0eU5hbWU6IHN0cmluZyxcblx0XHRyZXNldFZhbHVlczogYm9vbGVhbixcblx0XHRrZWVwRXhpc3RpbmdTZWxlY3Rpb246IGJvb2xlYW5cblx0KTogdm9pZCB7XG5cdFx0Y29uc3QgdmFsdWVMaXN0SW5mbyA9XG5cdFx0XHRmaWVsZEluZm9Nb2RlbC5nZXRQcm9wZXJ0eShgL3ZhbHVlcy8ke3Byb3BlcnR5TmFtZX0vdmFsdWVMaXN0SW5mb2ApIHx8XG5cdFx0XHRmaWVsZEluZm9Nb2RlbC5nZXRQcm9wZXJ0eShgL3VuaXREYXRhLyR7cHJvcGVydHlOYW1lfS92YWx1ZUxpc3RJbmZvYCk7XG5cblx0XHRpZiAodmFsdWVMaXN0SW5mbyAmJiB2YWx1ZUxpc3RJbmZvLm91dFBhcmFtZXRlcnMpIHtcblx0XHRcdGNvbnN0IG91dFBhcmFtZXRlcnMgPSB2YWx1ZUxpc3RJbmZvLm91dFBhcmFtZXRlcnM7XG5cdFx0XHRpZiAob3V0UGFyYW1ldGVycy5sZW5ndGggJiYgb3V0UGFyYW1ldGVycy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdE1hc3NFZGl0SGFuZGxlcnMuX3VwZGF0ZU91dFBhcmFtZXRlclN1Z2dldGlvbnMob3V0UGFyYW1ldGVycywgZmllbGRJbmZvTW9kZWwsIHJlc2V0VmFsdWVzLCBrZWVwRXhpc3RpbmdTZWxlY3Rpb24pO1xuXHRcdFx0XHRjb25zdCBwYXRoUHJlZml4ID1cblx0XHRcdFx0XHQoZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYC92YWx1ZXMvJHtwcm9wZXJ0eU5hbWV9YCkgJiYgYC92YWx1ZXMvJHtwcm9wZXJ0eU5hbWV9YCkgfHxcblx0XHRcdFx0XHQoZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYC91bml0RGF0YS8ke3Byb3BlcnR5TmFtZX1gKSAmJiBgL3VuaXREYXRhLyR7cHJvcGVydHlOYW1lfWApO1xuXHRcdFx0XHRpZiAocGF0aFByZWZpeCkge1xuXHRcdFx0XHRcdE1hc3NFZGl0SGFuZGxlcnMuX3VwZGF0ZUZpZWxkUGF0aFN1Z2dlc3Rpb25zKGZpZWxkSW5mb01vZGVsLCBwYXRoUHJlZml4LCBmYWxzZSwgdHJ1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFVwZGF0ZSBzdWdnZXN0cyBmb3IgYSBkcm9wIGRvd24gd2l0aCBJblBhcmFtZXRlciBhcyB0aGUgc3JjUHJvcGVydHlOYW1lLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIG91dFBhcmFtZXRlcnMgU3RyaW5nIGFycmFyeSBvZiBPdXRQYXJhbWV0ZXIgcHJvcGVydHkgcGF0aHMuXG5cdCAqIEBwYXJhbSBmaWVsZEluZm9Nb2RlbCBSdW50aW1lIG1vZGVsIHdpdGggcGFyYW1ldGVycyBzdG9yZSBpbmZvcm1hdGlvbi5cblx0ICogQHBhcmFtIHJlc2V0VmFsdWVzIFNob3VsZCB0aGUgdmFsdWVzIGJlIHJlc2V0IHRvIG9yaWdpbmFsIHN0YXRlLlxuXHQgKiBAcGFyYW0ga2VlcEV4aXN0aW5nU2VsZWN0aW9uIFNob3VsZCB0aGUgZXhpc3Rpbmcgc2VsZWN0aW9uIGJlZm9yZSB1cGRhdGUgcmVtYWluLlxuXHQgKi9cblx0X3VwZGF0ZU91dFBhcmFtZXRlclN1Z2dldGlvbnM6IGZ1bmN0aW9uIChcblx0XHRvdXRQYXJhbWV0ZXJzOiBzdHJpbmdbXSxcblx0XHRmaWVsZEluZm9Nb2RlbDogSlNPTk1vZGVsLFxuXHRcdHJlc2V0VmFsdWVzOiBib29sZWFuLFxuXHRcdGtlZXBFeGlzdGluZ1NlbGVjdGlvbjogYm9vbGVhblxuXHQpIHtcblx0XHRjb25zdCB2YWx1ZXMgPSBmaWVsZEluZm9Nb2RlbC5nZXRQcm9wZXJ0eShcIi92YWx1ZXNcIik7XG5cdFx0Y29uc3QgdW5pdERhdGEgPSBmaWVsZEluZm9Nb2RlbC5nZXRQcm9wZXJ0eShcIi91bml0RGF0YVwiKTtcblx0XHRjb25zdCBmaWVsZFBhdGhzID0gT2JqZWN0LmtleXModmFsdWVzKTtcblx0XHRjb25zdCB1bml0RmllbGRQYXRocyA9IE9iamVjdC5rZXlzKHVuaXREYXRhKTtcblxuXHRcdG91dFBhcmFtZXRlcnMuZm9yRWFjaCgob3V0UGFyYW1ldGVyOiBzdHJpbmcpID0+IHtcblx0XHRcdGlmIChmaWVsZFBhdGhzLmluY2x1ZGVzKG91dFBhcmFtZXRlcikpIHtcblx0XHRcdFx0TWFzc0VkaXRIYW5kbGVycy5fdXBkYXRlRmllbGRQYXRoU3VnZ2VzdGlvbnMoZmllbGRJbmZvTW9kZWwsIGAvdmFsdWVzLyR7b3V0UGFyYW1ldGVyfWAsIHJlc2V0VmFsdWVzLCBrZWVwRXhpc3RpbmdTZWxlY3Rpb24pO1xuXHRcdFx0fSBlbHNlIGlmICh1bml0RmllbGRQYXRocy5pbmNsdWRlcyhvdXRQYXJhbWV0ZXIpKSB7XG5cdFx0XHRcdE1hc3NFZGl0SGFuZGxlcnMuX3VwZGF0ZUZpZWxkUGF0aFN1Z2dlc3Rpb25zKFxuXHRcdFx0XHRcdGZpZWxkSW5mb01vZGVsLFxuXHRcdFx0XHRcdGAvdW5pdERhdGEvJHtvdXRQYXJhbWV0ZXJ9YCxcblx0XHRcdFx0XHRyZXNldFZhbHVlcyxcblx0XHRcdFx0XHRrZWVwRXhpc3RpbmdTZWxlY3Rpb25cblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogVXBkYXRlIHN1Z2dlc3RzIGZvciBhIGRyb3AgZG93biBvZiBhIGZpZWxkLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIGZpZWxkSW5mb01vZGVsIFJ1bnRpbWUgbW9kZWwgd2l0aCBwYXJhbWV0ZXJzIHN0b3JlIGluZm9ybWF0aW9uLlxuXHQgKiBAcGFyYW0gZmllbGRQYXRoQWJzb2x1dGUgQ29tcGxldGUgcnVudGltZSBwcm9wZXJ0eSBwYXRoLlxuXHQgKiBAcGFyYW0gcmVzZXRWYWx1ZXMgU2hvdWxkIHRoZSB2YWx1ZXMgYmUgcmVzZXQgdG8gb3JpZ2luYWwgc3RhdGUuXG5cdCAqIEBwYXJhbSBrZWVwRXhpc3RpbmdTZWxlY3Rpb24gU2hvdWxkIHRoZSBleGlzdGluZyBzZWxlY3Rpb24gYmVmb3JlIHVwZGF0ZSByZW1haW4uXG5cdCAqL1xuXHRfdXBkYXRlRmllbGRQYXRoU3VnZ2VzdGlvbnM6IGZ1bmN0aW9uIChcblx0XHRmaWVsZEluZm9Nb2RlbDogSlNPTk1vZGVsLFxuXHRcdGZpZWxkUGF0aEFic29sdXRlOiBzdHJpbmcsXG5cdFx0cmVzZXRWYWx1ZXM6IGJvb2xlYW4sXG5cdFx0a2VlcEV4aXN0aW5nU2VsZWN0aW9uOiBib29sZWFuXG5cdCkge1xuXHRcdGNvbnN0IG9wdGlvbnMgPSBmaWVsZEluZm9Nb2RlbC5nZXRQcm9wZXJ0eShmaWVsZFBhdGhBYnNvbHV0ZSk7XG5cdFx0Y29uc3QgZGVmYXVsdE9wdGlvbnMgPSBvcHRpb25zLmRlZmF1bHRPcHRpb25zO1xuXHRcdGNvbnN0IHNlbGVjdGVkS2V5ID0gZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYCR7ZmllbGRQYXRoQWJzb2x1dGV9L3NlbGVjdGVkS2V5YCk7XG5cdFx0Y29uc3QgZXhpc3RpbmdTZWxlY3Rpb24gPSBrZWVwRXhpc3RpbmdTZWxlY3Rpb24gJiYgb3B0aW9ucy5maW5kKChvcHRpb246IGFueSkgPT4gb3B0aW9uLmtleSA9PT0gc2VsZWN0ZWRLZXkpO1xuXHRcdGlmIChyZXNldFZhbHVlcykge1xuXHRcdFx0Y29uc3Qgc2VsZWN0T3B0aW9ucyA9IG9wdGlvbnMuc2VsZWN0T3B0aW9ucztcblx0XHRcdG9wdGlvbnMubGVuZ3RoID0gMDtcblx0XHRcdGRlZmF1bHRPcHRpb25zLmZvckVhY2goKGRlZmF1bHRPcHRpb246IGFueSkgPT4gb3B0aW9ucy5wdXNoKGRlZmF1bHRPcHRpb24pKTtcblx0XHRcdHNlbGVjdE9wdGlvbnMuZm9yRWFjaCgoc2VsZWN0T3B0aW9uOiBhbnkpID0+IG9wdGlvbnMucHVzaChzZWxlY3RPcHRpb24pKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b3B0aW9ucy5sZW5ndGggPSAwO1xuXHRcdFx0ZGVmYXVsdE9wdGlvbnMuZm9yRWFjaCgoZGVmYXVsdE9wdGlvbjogYW55KSA9PiBvcHRpb25zLnB1c2goZGVmYXVsdE9wdGlvbikpO1xuXHRcdH1cblxuXHRcdGZpZWxkSW5mb01vZGVsLnNldFByb3BlcnR5KGZpZWxkUGF0aEFic29sdXRlLCBvcHRpb25zKTtcblxuXHRcdGlmIChleGlzdGluZ1NlbGVjdGlvbiAmJiAhb3B0aW9ucy5pbmNsdWRlcyhleGlzdGluZ1NlbGVjdGlvbikpIHtcblx0XHRcdG9wdGlvbnMucHVzaChleGlzdGluZ1NlbGVjdGlvbik7XG5cdFx0XHRmaWVsZEluZm9Nb2RlbC5zZXRQcm9wZXJ0eShgJHtmaWVsZFBhdGhBYnNvbHV0ZX0vc2VsZWN0ZWRLZXlgLCBzZWxlY3RlZEtleSk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgSW4gYW5kIE91dCBQYXJhbWV0ZXJzIGluIHRoZSBNRUQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0gdHJhbnNDdHggVGhlIHRyYW5zaWVudCBjb250ZXh0IG9mIHRoZSBNRUQuXG5cdCAqIEBwYXJhbSBzb3VyY2UgTURDIGZpZWxkLlxuXHQgKiBAcGFyYW0gZmllbGRJbmZvTW9kZWwgUnVudGltZSBtb2RlbCB3aXRoIHBhcmFtZXRlcnMgc3RvcmUgaW5mb3JtYXRpb24uXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eU5hbWUgUHJvcGVydHkgcGF0aC5cblx0ICovXG5cdF9zZXRWYWx1ZUxpc3RJbmZvOiBmdW5jdGlvbiAodHJhbnNDdHg6IENvbnRleHQsIHNvdXJjZTogRmllbGQsIGZpZWxkSW5mb01vZGVsOiBKU09OTW9kZWwsIHByb3BlcnR5TmFtZTogc3RyaW5nKTogdm9pZCB7XG5cdFx0Y29uc3QgcHJvcFBhdGggPVxuXHRcdFx0KGZpZWxkSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdmFsdWVzLyR7cHJvcGVydHlOYW1lfWApICYmIFwiL3ZhbHVlcy9cIikgfHxcblx0XHRcdChmaWVsZEluZm9Nb2RlbC5nZXRQcm9wZXJ0eShgL3VuaXREYXRhLyR7cHJvcGVydHlOYW1lfWApICYmIFwiL3VuaXREYXRhL1wiKTtcblxuXHRcdGlmIChmaWVsZEluZm9Nb2RlbC5nZXRQcm9wZXJ0eShgJHtwcm9wUGF0aH0ke3Byb3BlcnR5TmFtZX0vdmFsdWVMaXN0SW5mb2ApKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IHZhbHVlTGlzdEluZm8gPSBmaWVsZEluZm9Nb2RlbC5nZXRQcm9wZXJ0eShgJHtwcm9wUGF0aH0ke3Byb3BlcnR5TmFtZX0vdmFsdWVMaXN0SW5mb2ApO1xuXG5cdFx0aWYgKCF2YWx1ZUxpc3RJbmZvKSB7XG5cdFx0XHRNYXNzRWRpdEhhbmRsZXJzLl9yZXF1ZXN0VmFsdWVMaXN0KHRyYW5zQ3R4LCBzb3VyY2UsIGZpZWxkSW5mb01vZGVsLCBwcm9wZXJ0eU5hbWUpO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogUmVxdWVzdCBhbmQgdXBkYXRlIEluIGFuZCBPdXQgUGFyYW1ldGVycyBpbiB0aGUgTUVELlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIHRyYW5zQ3R4IFRoZSB0cmFuc2llbnQgY29udGV4dCBvZiB0aGUgTUVELlxuXHQgKiBAcGFyYW0gc291cmNlIE1EQyBmaWVsZC5cblx0ICogQHBhcmFtIGZpZWxkSW5mb01vZGVsIFJ1bnRpbWUgbW9kZWwgd2l0aCBwYXJhbWV0ZXJzIHN0b3JlIGluZm9ybWF0aW9uLlxuXHQgKiBAcGFyYW0gcHJvcGVydHlOYW1lIFByb3BlcnR5IHBhdGguXG5cdCAqL1xuXHRfcmVxdWVzdFZhbHVlTGlzdDogZnVuY3Rpb24gKHRyYW5zQ3R4OiBDb250ZXh0LCBzb3VyY2U6IEZpZWxkLCBmaWVsZEluZm9Nb2RlbDogSlNPTk1vZGVsLCBwcm9wZXJ0eU5hbWU6IHN0cmluZyk6IHZvaWQge1xuXHRcdGNvbnN0IG1ldGFQYXRoID0gTW9kZWxIZWxwZXIuZ2V0TWV0YVBhdGhGb3JDb250ZXh0KHRyYW5zQ3R4KTtcblx0XHRjb25zdCBwcm9wZXJ0eVBhdGggPSAobWV0YVBhdGggJiYgYCR7bWV0YVBhdGh9LyR7cHJvcGVydHlOYW1lfWApIGFzIHN0cmluZztcblx0XHRjb25zdCBkZXBlbmRlbnRzID0gc291cmNlPy5nZXREZXBlbmRlbnRzKCk7XG5cdFx0Y29uc3QgZmllbGRIZWxwID0gc291cmNlPy5nZXRGaWVsZEhlbHAoKTtcblx0XHRjb25zdCBmaWVsZFZhbHVlSGVscCA9IGRlcGVuZGVudHM/LmZpbmQoKGRlcGVuZGVudDogYW55KSA9PiBkZXBlbmRlbnQuZ2V0SWQoKSA9PT0gZmllbGRIZWxwKSBhcyBWYWx1ZUhlbHA7XG5cdFx0Y29uc3QgcGF5bG9hZCA9IChmaWVsZFZhbHVlSGVscC5nZXREZWxlZ2F0ZSgpIGFzIGFueSk/LnBheWxvYWQgYXMgVmFsdWVIZWxwUGF5bG9hZDtcblx0XHRpZiAoIWZpZWxkVmFsdWVIZWxwPy5nZXRCaW5kaW5nQ29udGV4dCgpKSB7XG5cdFx0XHRmaWVsZFZhbHVlSGVscD8uc2V0QmluZGluZ0NvbnRleHQodHJhbnNDdHgpO1xuXHRcdH1cblx0XHRjb25zdCBtZXRhTW9kZWwgPSB0cmFuc0N0eC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdFZhbHVlTGlzdEhlbHBlci5jcmVhdGVWSFVJTW9kZWwoZmllbGRWYWx1ZUhlbHAsIHByb3BlcnR5UGF0aCwgbWV0YU1vZGVsKTtcblx0XHRjb25zdCB2YWx1ZUxpc3RJbmZvID0gVmFsdWVMaXN0SGVscGVyLmdldFZhbHVlTGlzdEluZm8oZmllbGRWYWx1ZUhlbHAsIHByb3BlcnR5UGF0aCwgcGF5bG9hZCk7XG5cblx0XHR2YWx1ZUxpc3RJbmZvXG5cdFx0XHQudGhlbigodkxpbmZvczogVmFsdWVMaXN0SW5mb1tdKSA9PiB7XG5cdFx0XHRcdGNvbnN0IHZMaW5mbyA9IHZMaW5mb3NbMF07XG5cdFx0XHRcdGNvbnN0IHByb3BQYXRoID1cblx0XHRcdFx0XHQoZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYC92YWx1ZXMvJHtwcm9wZXJ0eU5hbWV9YCkgJiYgXCIvdmFsdWVzL1wiKSB8fFxuXHRcdFx0XHRcdChmaWVsZEluZm9Nb2RlbC5nZXRQcm9wZXJ0eShgL3VuaXREYXRhLyR7cHJvcGVydHlOYW1lfWApICYmIFwiL3VuaXREYXRhL1wiKTtcblx0XHRcdFx0Y29uc3QgaW5mbzogYW55ID0ge1xuXHRcdFx0XHRcdGluUGFyYW1ldGVyczpcblx0XHRcdFx0XHRcdHZMaW5mby52aFBhcmFtZXRlcnMgJiYgVmFsdWVMaXN0SGVscGVyLmdldEluUGFyYW1ldGVycyh2TGluZm8udmhQYXJhbWV0ZXJzKS5tYXAoKGluUGFyYW06IGFueSkgPT4gaW5QYXJhbS5oZWxwUGF0aCksXG5cdFx0XHRcdFx0b3V0UGFyYW1ldGVyczpcblx0XHRcdFx0XHRcdHZMaW5mby52aFBhcmFtZXRlcnMgJiZcblx0XHRcdFx0XHRcdFZhbHVlTGlzdEhlbHBlci5nZXRPdXRQYXJhbWV0ZXJzKHZMaW5mby52aFBhcmFtZXRlcnMpLm1hcCgob3V0UGFyYW06IGFueSkgPT4gb3V0UGFyYW0uaGVscFBhdGgpXG5cdFx0XHRcdH07XG5cdFx0XHRcdGZpZWxkSW5mb01vZGVsLnNldFByb3BlcnR5KGAke3Byb3BQYXRofSR7cHJvcGVydHlOYW1lfS92YWx1ZUxpc3RJbmZvYCwgaW5mbyk7XG5cdFx0XHRcdGlmIChpbmZvLm91dFBhcmFtZXRlcnMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdE1hc3NFZGl0SGFuZGxlcnMuX3VwZGF0ZUZpZWxkUGF0aFN1Z2dlc3Rpb25zKGZpZWxkSW5mb01vZGVsLCBgL3ZhbHVlcy8ke3Byb3BlcnR5TmFtZX1gLCBmYWxzZSwgdHJ1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goKCkgPT4ge1xuXHRcdFx0XHRMb2cud2FybmluZyhgTWFzcyBFZGl0OiBDb3VsZG4ndCBsb2FkIHZhbHVlTGlzdCBpbmZvIGZvciAke3Byb3BlcnR5UGF0aH1gKTtcblx0XHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgZmllbGQgaGVscCBjb250cm9sIGZyb20gTURDIGZpZWxkLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIHRyYW5zQ3R4IFRoZSB0cmFuc2llbnQgY29udGV4dCBvZiB0aGUgTUVELlxuXHQgKiBAcGFyYW0gc291cmNlIE1EQyBmaWVsZC5cblx0ICogQHJldHVybnMgRmllbGQgSGVscCBjb250cm9sLlxuXHQgKi9cblx0X2dldFZhbHVlSGVscDogZnVuY3Rpb24gKHRyYW5zQ3R4OiBDb250ZXh0LCBzb3VyY2U6IEZpZWxkKTogYW55IHtcblx0XHRjb25zdCBkZXBlbmRlbnRzID0gc291cmNlPy5nZXREZXBlbmRlbnRzKCk7XG5cdFx0Y29uc3QgZmllbGRIZWxwID0gc291cmNlPy5nZXRGaWVsZEhlbHAoKTtcblx0XHRyZXR1cm4gZGVwZW5kZW50cz8uZmluZCgoZGVwZW5kZW50OiBhbnkpID0+IGRlcGVuZGVudC5nZXRJZCgpID09PSBmaWVsZEhlbHApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDb2xsZWQgb24gZHJvcCBkb3duIHNlbGVjdGlvbiBvZiBWSEQgb3B0aW9uLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIHNvdXJjZSBDdXN0b20gTWFzcyBFZGl0IFNlbGVjdCBjb250cm9sLlxuXHQgKiBAcGFyYW0gcHJvcGVydHlOYW1lIFByb3BlcnR5IHBhdGguXG5cdCAqIEBwYXJhbSBzZWxlY3RLZXkgUHJldmlvdXMga2V5IGJlZm9yZSB0aGUgVkhEIHdhcyBzZWxlY3RlZC5cblx0ICovXG5cdF9vblZIU2VsZWN0OiBmdW5jdGlvbiAoc291cmNlOiBhbnksIHByb3BlcnR5TmFtZTogc3RyaW5nLCBzZWxlY3RLZXk6IHN0cmluZyk6IHZvaWQge1xuXHRcdC8vIENhbGxlZCBmb3Jcblx0XHQvLyAxLiBWSEQgc2VsZWN0ZWQuXG5cblx0XHRjb25zdCBmaWVsZEluZm9Nb2RlbCA9IHNvdXJjZSAmJiBzb3VyY2UuZ2V0TW9kZWwoXCJmaWVsZHNJbmZvXCIpO1xuXHRcdGNvbnN0IHByb3BQYXRoID1cblx0XHRcdChmaWVsZEluZm9Nb2RlbC5nZXRQcm9wZXJ0eShgL3ZhbHVlcy8ke3Byb3BlcnR5TmFtZX1gKSAmJiBcIi92YWx1ZXMvXCIpIHx8XG5cdFx0XHQoZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYC91bml0RGF0YS8ke3Byb3BlcnR5TmFtZX1gKSAmJiBcIi91bml0RGF0YS9cIik7XG5cdFx0Y29uc3QgdHJhbnNDdHggPSBzb3VyY2UuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0XHRjb25zdCBmaWVsZFZhbHVlSGVscCA9IE1hc3NFZGl0SGFuZGxlcnMuX2dldFZhbHVlSGVscCh0cmFuc0N0eCwgc291cmNlLmdldFBhcmVudCgpKTtcblx0XHRpZiAoIWZpZWxkVmFsdWVIZWxwPy5nZXRCaW5kaW5nQ29udGV4dCgpKSB7XG5cdFx0XHRmaWVsZFZhbHVlSGVscD8uc2V0QmluZGluZ0NvbnRleHQodHJhbnNDdHgpO1xuXHRcdH1cblx0XHRzb3VyY2UuZmlyZVZhbHVlSGVscFJlcXVlc3QoKTtcblxuXHRcdGZpZWxkSW5mb01vZGVsLnNldFByb3BlcnR5KGAke3Byb3BQYXRoICsgcHJvcGVydHlOYW1lfS9zZWxlY3RlZEtleWAsIHNlbGVjdEtleSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldHMgUHJvcGVydHkgbmFtZSBmcm9tIHNlbGVjdGlvbiBrZXkuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0ga2V5IFNlbGVjdGlvbiBrZXkuXG5cdCAqIEByZXR1cm5zIFByb3BlcnR5IG5hbWUuXG5cdCAqL1xuXHRfZ2V0UHJvcGVydHlOYW1lRnJvbUtleTogZnVuY3Rpb24gKGtleTogc3RyaW5nKSB7XG5cdFx0bGV0IHByb3BlcnR5TmFtZSA9IFwiXCI7XG5cdFx0aWYgKGtleS5zdGFydHNXaXRoKFwiRGVmYXVsdC9cIikgfHwga2V5LnN0YXJ0c1dpdGgoXCJDbGVhckZpZWxkVmFsdWUvXCIpIHx8IGtleS5zdGFydHNXaXRoKFwiVXNlVmFsdWVIZWxwVmFsdWUvXCIpKSB7XG5cdFx0XHRwcm9wZXJ0eU5hbWUgPSBrZXkuc3Vic3RyaW5nKGtleS5pbmRleE9mKFwiL1wiKSArIDEpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRwcm9wZXJ0eU5hbWUgPSBrZXkuc3Vic3RyaW5nKDAsIGtleS5sYXN0SW5kZXhPZihcIi9cIikpO1xuXHRcdH1cblx0XHRyZXR1cm4gcHJvcGVydHlOYW1lO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgc2VsZWN0aW9uIHRvIEN1c3RvbSBNYXNzIEVkaXQgU2VsZWN0IGZyb20gTURDIGZpZWxkLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIHNvdXJjZSBNREMgZmllbGQuXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eU5hbWUgUHJvcGVydHkgcGF0aC5cblx0ICogQHBhcmFtIHZhbHVlIFZhbHVlIHRvIHVwZGF0ZS5cblx0ICogQHBhcmFtIGZ1bGxUZXh0IEZ1bGwgdGV4dCB0byB1c2UuXG5cdCAqL1xuXHRfdXBkYXRlU2VsZWN0S2V5OiBmdW5jdGlvbiAoc291cmNlOiBGaWVsZCwgcHJvcGVydHlOYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnksIGZ1bGxUZXh0PzogYW55KTogdm9pZCB7XG5cdFx0Ly8gQ2FsbGVkIGZvclxuXHRcdC8vIDEuIFZIRCBwcm9wZXJ0eSBjaGFuZ2Vcblx0XHQvLyAyLiBPdXQgUGFyYW1ldGVycy5cblx0XHQvLyAzLiBUcmFuc2llbnQgY29udGV4dCBwcm9wZXJ0eSBjaGFuZ2UuXG5cblx0XHRjb25zdCBjb21ib0JveCA9IHNvdXJjZS5nZXRDb250ZW50KCkgYXMgQ29tYm9Cb3g7XG5cdFx0aWYgKCFjb21ib0JveCB8fCAhcHJvcGVydHlOYW1lKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGxldCBrZXk6IHN0cmluZyA9IGNvbWJvQm94LmdldFNlbGVjdGVkS2V5KCk7XG5cdFx0aWYgKChrZXkuc3RhcnRzV2l0aChcIkRlZmF1bHQvXCIpIHx8IGtleS5zdGFydHNXaXRoKFwiQ2xlYXJGaWVsZFZhbHVlL1wiKSkgJiYgIXZhbHVlKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y29uc3QgZm9ybWF0dGVkVGV4dCA9IE1hc3NFZGl0SGFuZGxlcnMuX3ZhbHVlRXhpc3RzKGZ1bGxUZXh0KSA/IGZ1bGxUZXh0IDogdmFsdWU7XG5cdFx0Y29uc3QgZmllbGRJbmZvTW9kZWwgPSBzb3VyY2UgJiYgKHNvdXJjZS5nZXRNb2RlbChcImZpZWxkc0luZm9cIikgYXMgSlNPTk1vZGVsKTtcblx0XHRjb25zdCB2YWx1ZXMgPVxuXHRcdFx0ZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYC92YWx1ZXMvJHtwcm9wZXJ0eU5hbWV9YCkgfHwgZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYC91bml0RGF0YS8ke3Byb3BlcnR5TmFtZX1gKSB8fCBbXTtcblx0XHRjb25zdCBwcm9wUGF0aCA9XG5cdFx0XHQoZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYC92YWx1ZXMvJHtwcm9wZXJ0eU5hbWV9YCkgJiYgXCIvdmFsdWVzL1wiKSB8fFxuXHRcdFx0KGZpZWxkSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdW5pdERhdGEvJHtwcm9wZXJ0eU5hbWV9YCkgJiYgXCIvdW5pdERhdGEvXCIpO1xuXG5cdFx0Y29uc3QgcmVsYXRlZEZpZWxkID0gdmFsdWVzLmZpbmQoKGZpZWxkRGF0YTogYW55KSA9PiBmaWVsZERhdGE/LnRleHRJbmZvPy52YWx1ZSA9PT0gdmFsdWUgfHwgZmllbGREYXRhLnRleHQgPT09IHZhbHVlKTtcblxuXHRcdGlmIChyZWxhdGVkRmllbGQpIHtcblx0XHRcdGlmIChcblx0XHRcdFx0ZnVsbFRleHQgJiZcblx0XHRcdFx0cmVsYXRlZEZpZWxkLnRleHRJbmZvICYmXG5cdFx0XHRcdHJlbGF0ZWRGaWVsZC50ZXh0SW5mby5kZXNjcmlwdGlvblBhdGggJiZcblx0XHRcdFx0KHJlbGF0ZWRGaWVsZC50ZXh0ICE9IGZvcm1hdHRlZFRleHQgfHwgcmVsYXRlZEZpZWxkLnRleHRJbmZvLmZ1bGxUZXh0ICE9IGZvcm1hdHRlZFRleHQpXG5cdFx0XHQpIHtcblx0XHRcdFx0Ly8gVXBkYXRlIHRoZSBmdWxsIHRleHQgb25seSB3aGVuIHByb3ZpZGVkLlxuXHRcdFx0XHRyZWxhdGVkRmllbGQudGV4dCA9IGZvcm1hdHRlZFRleHQ7XG5cdFx0XHRcdHJlbGF0ZWRGaWVsZC50ZXh0SW5mby5mdWxsVGV4dCA9IGZvcm1hdHRlZFRleHQ7XG5cdFx0XHRcdHJlbGF0ZWRGaWVsZC50ZXh0SW5mby5kZXNjcmlwdGlvbiA9IHNvdXJjZS5nZXRBZGRpdGlvbmFsVmFsdWUoKTtcblx0XHRcdH1cblx0XHRcdGlmIChyZWxhdGVkRmllbGQua2V5ID09PSBrZXkpIHtcblx0XHRcdFx0ZmllbGRJbmZvTW9kZWwuc2V0UHJvcGVydHkoYCR7cHJvcFBhdGggKyBwcm9wZXJ0eU5hbWV9L3NlbGVjdGVkS2V5YCwga2V5KTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0a2V5ID0gcmVsYXRlZEZpZWxkLmtleTtcblx0XHR9IGVsc2UgaWYgKFt1bmRlZmluZWQsIG51bGwsIFwiXCJdLmluZGV4T2YodmFsdWUpID09PSAtMSkge1xuXHRcdFx0a2V5ID0gYCR7cHJvcGVydHlOYW1lfS8ke3ZhbHVlfWA7XG5cdFx0XHRjb25zdCBzZWxlY3Rpb25JbmZvID0ge1xuXHRcdFx0XHR0ZXh0OiBmb3JtYXR0ZWRUZXh0LFxuXHRcdFx0XHRrZXksXG5cdFx0XHRcdHRleHRJbmZvOiB7XG5cdFx0XHRcdFx0ZGVzY3JpcHRpb246IHNvdXJjZS5nZXRBZGRpdGlvbmFsVmFsdWUoKSxcblx0XHRcdFx0XHRkZXNjcmlwdGlvblBhdGg6IHZhbHVlcyAmJiB2YWx1ZXMudGV4dEluZm8gJiYgdmFsdWVzLnRleHRJbmZvLmRlc2NyaXB0aW9uUGF0aCxcblx0XHRcdFx0XHRmdWxsVGV4dDogZm9ybWF0dGVkVGV4dCxcblx0XHRcdFx0XHR0ZXh0QXJyYW5nZW1lbnQ6IHNvdXJjZS5nZXREaXNwbGF5KCksXG5cdFx0XHRcdFx0dmFsdWU6IHNvdXJjZS5nZXRWYWx1ZSgpLFxuXHRcdFx0XHRcdHZhbHVlUGF0aDogcHJvcGVydHlOYW1lXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHR2YWx1ZXMucHVzaChzZWxlY3Rpb25JbmZvKTtcblx0XHRcdHZhbHVlcy5zZWxlY3RPcHRpb25zID0gdmFsdWVzLnNlbGVjdE9wdGlvbnMgfHwgW107XG5cdFx0XHR2YWx1ZXMuc2VsZWN0T3B0aW9ucy5wdXNoKHNlbGVjdGlvbkluZm8pO1xuXHRcdFx0ZmllbGRJbmZvTW9kZWwuc2V0UHJvcGVydHkocHJvcFBhdGggKyBwcm9wZXJ0eU5hbWUsIHZhbHVlcyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGtleSA9IGBEZWZhdWx0LyR7cHJvcGVydHlOYW1lfWA7XG5cdFx0fVxuXG5cdFx0ZmllbGRJbmZvTW9kZWwuc2V0UHJvcGVydHkoYCR7cHJvcFBhdGggKyBwcm9wZXJ0eU5hbWV9L3NlbGVjdGVkS2V5YCwga2V5KTtcblx0XHRNYXNzRWRpdEhhbmRsZXJzLl91cGRhdGVSZXN1bHRzKGNvbWJvQm94KTtcblx0fSxcblxuXHQvKipcblx0ICogR2V0IFZhbHVlIGZyb20gRHJvcCBkb3duLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIHNvdXJjZSBEcm9wIGRvd24gY29udHJvbC5cblx0ICogQHJldHVybnMgVmFsdWUgb2Ygc2VsZWN0aW9uLlxuXHQgKi9cblx0X2dldFZhbHVlOiBmdW5jdGlvbiAoc291cmNlOiBDb250cm9sKSB7XG5cdFx0cmV0dXJuIHNvdXJjZS5nZXRNZXRhZGF0YSgpLmdldE5hbWUoKSA9PT0gXCJzYXAuZmUuY29yZS5jb250cm9scy5NYXNzRWRpdFNlbGVjdFwiXG5cdFx0XHQ/IChzb3VyY2UgYXMgU2VsZWN0KS5nZXRTZWxlY3RlZEl0ZW0oKT8uZ2V0VGV4dCgpXG5cdFx0XHQ6IChzb3VyY2UgYXMgQ29tYm9Cb3gpLmdldFZhbHVlKCk7XG5cdH0sXG5cblx0X2dldFZhbHVlT25FbXB0eTogZnVuY3Rpb24gKG9Tb3VyY2U6IGFueSwgZmllbGRzSW5mb01vZGVsOiBKU09OTW9kZWwsIHZhbHVlOiBhbnksIHNQcm9wZXJ0eU5hbWU6IHN0cmluZykge1xuXHRcdGlmICghdmFsdWUpIHtcblx0XHRcdGNvbnN0IHZhbHVlcyA9XG5cdFx0XHRcdGZpZWxkc0luZm9Nb2RlbC5nZXRQcm9wZXJ0eShgL3ZhbHVlcy8ke3NQcm9wZXJ0eU5hbWV9YCkgfHwgZmllbGRzSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdW5pdERhdGEvJHtzUHJvcGVydHlOYW1lfWApIHx8IFtdO1xuXHRcdFx0aWYgKHZhbHVlcy51bml0UHJvcGVydHkpIHtcblx0XHRcdFx0dmFsdWUgPSAwO1xuXHRcdFx0XHRvU291cmNlLnNldFZhbHVlKHZhbHVlKTtcblx0XHRcdH0gZWxzZSBpZiAodmFsdWVzLmlucHV0VHlwZSA9PT0gXCJDaGVja0JveFwiKSB7XG5cdFx0XHRcdHZhbHVlID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB2YWx1ZTtcblx0fSxcblxuXHRfdmFsdWVFeGlzdHM6IGZ1bmN0aW9uICh2YWx1ZTogYW55KSB7XG5cdFx0cmV0dXJuIHZhbHVlICE9IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPSBudWxsO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBVcGRhdGVzIHNlbGVjdGlvbnMgdG8gcnVudGltZSBtb2RlbC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBvU291cmNlIERyb3AgZG93biBjb250cm9sLlxuXHQgKiBAcGFyYW0gYVBhcmFtcyBQYXJ0cyBvZiBrZXkgaW4gcnVudGltZSBtb2RlbC5cblx0ICogQHBhcmFtIHVwZGF0ZVRyYW5zQ3R4IFNob3VsZCB0cmFuc2llbnQgY29udGV4dCBiZSB1cGRhdGVkIHdpdGggdGhlIHZhbHVlLlxuXHQgKi9cblx0X3VwZGF0ZVJlc3VsdHM6IGZ1bmN0aW9uIChvU291cmNlOiBhbnksIGFQYXJhbXM6IEFycmF5PHN0cmluZz4gPSBbXSwgdXBkYXRlVHJhbnNDdHg6IGJvb2xlYW4pIHtcblx0XHQvLyBDYWxsZWQgZm9yXG5cdFx0Ly8gMS4gVkhEIHByb3BlcnR5IGNoYW5nZS5cblx0XHQvLyAyLiBPdXQgcGFyYW1ldGVyLlxuXHRcdC8vIDMuIHRyYW5zaWVudCBjb250ZXh0IHByb3BlcnR5IGNoYW5nZS5cblx0XHRjb25zdCBmaWVsZHNJbmZvTW9kZWwgPSBvU291cmNlICYmIG9Tb3VyY2UuZ2V0TW9kZWwoXCJmaWVsZHNJbmZvXCIpO1xuXHRcdGNvbnN0IG9GaWVsZHNJbmZvRGF0YSA9IGZpZWxkc0luZm9Nb2RlbCAmJiBmaWVsZHNJbmZvTW9kZWwuZ2V0RGF0YSgpO1xuXHRcdGxldCB2YWx1ZSA9IE1hc3NFZGl0SGFuZGxlcnMuX2dldFZhbHVlKG9Tb3VyY2UgYXMgQ29udHJvbCk7XG5cdFx0YVBhcmFtcyA9IGFQYXJhbXMubGVuZ3RoID4gMCA/IGFQYXJhbXMgOiBvU291cmNlICYmIG9Tb3VyY2UuZ2V0U2VsZWN0ZWRLZXkoKSAmJiBvU291cmNlLmdldFNlbGVjdGVkS2V5KCkuc3BsaXQoXCIvXCIpO1xuXG5cdFx0bGV0IG9EYXRhT2JqZWN0O1xuXHRcdGNvbnN0IHNQcm9wZXJ0eU5hbWUgPSBvU291cmNlLmRhdGEoXCJmaWVsZFBhdGhcIik7XG5cdFx0Y29uc3QgcHJvcGVydHlGdWxseVF1YWxpZmllZE5hbWU6IHN0cmluZyA9IG9Tb3VyY2UuZGF0YShcInByb3BlcnR5RnVsbHlRdWFsaWZpZWROYW1lXCIpO1xuXG5cdFx0aWYgKGFQYXJhbXNbMF0gPT09IFwiRGVmYXVsdFwiKSB7XG5cdFx0XHRvRGF0YU9iamVjdCA9IHtcblx0XHRcdFx0a2V5VmFsdWU6IGFQYXJhbXNbMV0sXG5cdFx0XHRcdHByb3BlcnR5RnVsbHlRdWFsaWZpZWROYW1lLFxuXHRcdFx0XHR2YWx1ZTogYVBhcmFtc1swXVxuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKGFQYXJhbXNbMF0gPT09IFwiQ2xlYXJGaWVsZFZhbHVlXCIpIHtcblx0XHRcdHZhbHVlID0gXCJcIjtcblx0XHRcdHZhbHVlID0gTWFzc0VkaXRIYW5kbGVycy5fZ2V0VmFsdWVPbkVtcHR5KG9Tb3VyY2UsIGZpZWxkc0luZm9Nb2RlbCwgdmFsdWUsIHNQcm9wZXJ0eU5hbWUpO1xuXHRcdFx0b0RhdGFPYmplY3QgPSB7XG5cdFx0XHRcdGtleVZhbHVlOiBhUGFyYW1zWzFdLFxuXHRcdFx0XHRwcm9wZXJ0eUZ1bGx5UXVhbGlmaWVkTmFtZSxcblx0XHRcdFx0dmFsdWU6IHZhbHVlXG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAoIWFQYXJhbXMpIHtcblx0XHRcdHZhbHVlID0gTWFzc0VkaXRIYW5kbGVycy5fZ2V0VmFsdWVPbkVtcHR5KG9Tb3VyY2UsIGZpZWxkc0luZm9Nb2RlbCwgdmFsdWUsIHNQcm9wZXJ0eU5hbWUpO1xuXHRcdFx0b0RhdGFPYmplY3QgPSB7XG5cdFx0XHRcdGtleVZhbHVlOiBzUHJvcGVydHlOYW1lLFxuXHRcdFx0XHRwcm9wZXJ0eUZ1bGx5UXVhbGlmaWVkTmFtZSxcblx0XHRcdFx0dmFsdWU6IHZhbHVlXG5cdFx0XHR9O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eU5hbWUgPSBhUGFyYW1zLnNsaWNlKDAsIC0xKS5qb2luKFwiL1wiKTtcblx0XHRcdGNvbnN0IHByb3BlcnR5VmFsdWVzID1cblx0XHRcdFx0ZmllbGRzSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdmFsdWVzLyR7cHJvcGVydHlOYW1lfWApIHx8IGZpZWxkc0luZm9Nb2RlbC5nZXRQcm9wZXJ0eShgL3VuaXREYXRhLyR7cHJvcGVydHlOYW1lfWApIHx8IFtdO1xuXG5cdFx0XHRjb25zdCByZWxhdGVkRmllbGQgPSAocHJvcGVydHlWYWx1ZXMgfHwgW10pLmZpbmQoZnVuY3Rpb24gKG9GaWVsZERhdGE6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gb0ZpZWxkRGF0YT8udGV4dEluZm8/LnZhbHVlID09PSB2YWx1ZSB8fCBvRmllbGREYXRhLnRleHQgPT09IHZhbHVlO1xuXHRcdFx0fSk7XG5cdFx0XHRvRGF0YU9iamVjdCA9IHtcblx0XHRcdFx0a2V5VmFsdWU6IHByb3BlcnR5TmFtZSxcblx0XHRcdFx0cHJvcGVydHlGdWxseVF1YWxpZmllZE5hbWUsXG5cdFx0XHRcdHZhbHVlOlxuXHRcdFx0XHRcdHJlbGF0ZWRGaWVsZC50ZXh0SW5mbyAmJiBNYXNzRWRpdEhhbmRsZXJzLl92YWx1ZUV4aXN0cyhyZWxhdGVkRmllbGQudGV4dEluZm8udmFsdWUpXG5cdFx0XHRcdFx0XHQ/IHJlbGF0ZWRGaWVsZC50ZXh0SW5mby52YWx1ZVxuXHRcdFx0XHRcdFx0OiByZWxhdGVkRmllbGQudGV4dFxuXHRcdFx0fTtcblx0XHR9XG5cdFx0bGV0IGJFeGlzdGluZ0VsZW1lbnRpbmRleCA9IC0xO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgb0ZpZWxkc0luZm9EYXRhLnJlc3VsdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmIChvRmllbGRzSW5mb0RhdGEucmVzdWx0c1tpXS5rZXlWYWx1ZSA9PT0gb0RhdGFPYmplY3Qua2V5VmFsdWUpIHtcblx0XHRcdFx0YkV4aXN0aW5nRWxlbWVudGluZGV4ID0gaTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGJFeGlzdGluZ0VsZW1lbnRpbmRleCAhPT0gLTEpIHtcblx0XHRcdG9GaWVsZHNJbmZvRGF0YS5yZXN1bHRzW2JFeGlzdGluZ0VsZW1lbnRpbmRleF0gPSBvRGF0YU9iamVjdDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b0ZpZWxkc0luZm9EYXRhLnJlc3VsdHMucHVzaChvRGF0YU9iamVjdCk7XG5cdFx0fVxuXHRcdGlmICh1cGRhdGVUcmFuc0N0eCAmJiAhb0RhdGFPYmplY3Qua2V5VmFsdWUuaW5jbHVkZXMoXCIvXCIpKSB7XG5cdFx0XHRjb25zdCB0cmFuc0N0eCA9IG9Tb3VyY2UuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0XHRcdGlmIChhUGFyYW1zWzBdID09PSBcIkRlZmF1bHRcIiB8fCBhUGFyYW1zWzBdID09PSBcIkNsZWFyRmllbGRWYWx1ZVwiKSB7XG5cdFx0XHRcdHRyYW5zQ3R4LnNldFByb3BlcnR5KG9EYXRhT2JqZWN0LmtleVZhbHVlLCBudWxsKTtcblx0XHRcdH0gZWxzZSBpZiAob0RhdGFPYmplY3QpIHtcblx0XHRcdFx0dHJhbnNDdHguc2V0UHJvcGVydHkob0RhdGFPYmplY3Qua2V5VmFsdWUsIG9EYXRhT2JqZWN0LnZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IE1hc3NFZGl0SGFuZGxlcnM7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7RUF1QkEsTUFBTUEsZ0JBQXFCLEdBQUc7SUFDN0I7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDQyxxQkFBcUIs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