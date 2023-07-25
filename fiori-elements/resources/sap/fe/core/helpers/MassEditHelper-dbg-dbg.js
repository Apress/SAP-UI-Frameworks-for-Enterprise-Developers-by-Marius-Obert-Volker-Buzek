/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/library", "sap/fe/core/TemplateModel", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/PropertyHelper", "sap/fe/macros/field/FieldTemplating", "sap/fe/macros/table/TableHelper", "sap/m/Button", "sap/m/Dialog", "sap/m/MessageToast", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/mdc/enum/EditMode", "sap/ui/model/json/JSONModel", "../controllerextensions/messageHandler/messageHandling", "../controls/Any", "../converters/MetaModelConverter", "../templating/FieldControlHelper", "../templating/UIFormatters"], function (Log, CommonUtils, BindingToolkit, TypeGuards, FELibrary, TemplateModel, DataModelPathHelper, PropertyHelper, FieldTemplating, TableHelper, Button, Dialog, MessageToast, Core, Fragment, XMLPreprocessor, XMLTemplateProcessor, EditMode, JSONModel, messageHandling, Any, MetaModelConverter, FieldControlHelper, UIFormatters) {
  "use strict";

  var isMultiValueField = UIFormatters.isMultiValueField;
  var getRequiredExpression = UIFormatters.getRequiredExpression;
  var getEditMode = UIFormatters.getEditMode;
  var isReadOnlyExpression = FieldControlHelper.isReadOnlyExpression;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var convertMetaModelContext = MetaModelConverter.convertMetaModelContext;
  var setEditStyleProperties = FieldTemplating.setEditStyleProperties;
  var getTextBinding = FieldTemplating.getTextBinding;
  var hasValueHelpWithFixedValues = PropertyHelper.hasValueHelpWithFixedValues;
  var hasValueHelp = PropertyHelper.hasValueHelp;
  var hasUnit = PropertyHelper.hasUnit;
  var hasCurrency = PropertyHelper.hasCurrency;
  var getAssociatedUnitPropertyPath = PropertyHelper.getAssociatedUnitPropertyPath;
  var getAssociatedUnitProperty = PropertyHelper.getAssociatedUnitProperty;
  var getRelativePaths = DataModelPathHelper.getRelativePaths;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var isProperty = TypeGuards.isProperty;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var not = BindingToolkit.not;
  var ifElse = BindingToolkit.ifElse;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  const MassEditHelper = {
    /**
     * Initializes the value at final or deepest level path with a blank array.
     * Return an empty array pointing to the final or deepest level path.
     *
     * @param sPath Property path
     * @param aValues Array instance where the default data needs to be added
     * @returns The final path
     */
    initLastLevelOfPropertyPath: function (sPath, aValues) {
      let aFinalPath;
      let index = 0;
      const aPaths = sPath.split("/");
      let sFullPath = "";
      aPaths.forEach(function (sPropertyPath) {
        if (!aValues[sPropertyPath] && index === 0) {
          aValues[sPropertyPath] = {};
          aFinalPath = aValues[sPropertyPath];
          sFullPath = sFullPath + sPropertyPath;
          index++;
        } else if (!aFinalPath[sPropertyPath]) {
          sFullPath = `${sFullPath}/${sPropertyPath}`;
          if (sFullPath !== sPath) {
            aFinalPath[sPropertyPath] = {};
            aFinalPath = aFinalPath[sPropertyPath];
          } else {
            aFinalPath[sPropertyPath] = [];
          }
        }
      });
      return aFinalPath;
    },
    /**
     * Method to get unique values for given array values.
     *
     * @param sValue Property value
     * @param index Index of the property value
     * @param self Instance of the array
     * @returns The unique value
     */
    getUniqueValues: function (sValue, index, self) {
      return sValue != undefined && sValue != null ? self.indexOf(sValue) === index : undefined;
    },
    /**
     * Gets the property value for a multi-level path (for example: _Materials/Material_Details gets the value of Material_Details under _Materials Object).
     * Returns the propertyValue, which can be of any type (string, number, etc..).
     *
     * @param sDataPropertyPath Property path
     * @param oValues Object of property values
     * @returns The property value
     */
    getValueForMultiLevelPath: function (sDataPropertyPath, oValues) {
      let result;
      if (sDataPropertyPath && sDataPropertyPath.indexOf("/") > 0) {
        const aPropertyPaths = sDataPropertyPath.split("/");
        aPropertyPaths.forEach(function (sPath) {
          result = oValues && oValues[sPath] ? oValues[sPath] : result && result[sPath];
        });
      }
      return result;
    },
    /**
     * Gets the key path for the key of a combo box that must be selected initially when the dialog opens:
     * => If propertyValue for all selected contexts is different, then < Keep Existing Values > is preselected.
     * => If propertyValue for all selected contexts is the same, then the propertyValue is preselected.
     * => If propertyValue for all selected contexts is empty, then < Leave Blank > is preselected.
     *
     *
     * @param aContexts Contexts for mass edit
     * @param sDataPropertyPath Data property path
     * @returns The key path
     */
    getDefaultSelectionPathComboBox: function (aContexts, sDataPropertyPath) {
      let result;
      if (sDataPropertyPath && aContexts.length > 0) {
        const oSelectedContext = aContexts,
          aPropertyValues = [];
        oSelectedContext.forEach(function (oContext) {
          const oDataObject = oContext.getObject();
          const sMultiLevelPathCondition = sDataPropertyPath.indexOf("/") > -1 && oDataObject.hasOwnProperty(sDataPropertyPath.split("/")[0]);
          if (oContext && (oDataObject.hasOwnProperty(sDataPropertyPath) || sMultiLevelPathCondition)) {
            aPropertyValues.push(oContext.getObject(sDataPropertyPath));
          }
        });
        const aUniquePropertyValues = aPropertyValues.filter(MassEditHelper.getUniqueValues);
        if (aUniquePropertyValues.length > 1) {
          result = `Default/${sDataPropertyPath}`;
        } else if (aUniquePropertyValues.length === 0) {
          result = `Empty/${sDataPropertyPath}`;
        } else if (aUniquePropertyValues.length === 1) {
          result = `${sDataPropertyPath}/${aUniquePropertyValues[0]}`;
        }
      }
      return result;
    },
    /**
     * Checks hidden annotation value [both static and path based] for table's selected context.
     *
     * @param hiddenValue Hidden annotation value / path for field
     * @param aContexts Contexts for mass edit
     * @returns The hidden annotation value
     */
    getHiddenValueForContexts: function (hiddenValue, aContexts) {
      if (hiddenValue && hiddenValue.$Path) {
        return !aContexts.some(function (oSelectedContext) {
          return oSelectedContext.getObject(hiddenValue.$Path) === false;
        });
      }
      return hiddenValue;
    },
    getInputType: function (propertyInfo, dataFieldConverted, oDataModelPath) {
      const editStyleProperties = {};
      let inputType;
      if (propertyInfo) {
        setEditStyleProperties(editStyleProperties, dataFieldConverted, oDataModelPath, true);
        inputType = (editStyleProperties === null || editStyleProperties === void 0 ? void 0 : editStyleProperties.editStyle) || "";
      }
      const isValidForMassEdit = inputType && ["DatePicker", "TimePicker", "DateTimePicker", "RatingIndicator"].indexOf(inputType) === -1 && !isMultiValueField(oDataModelPath) && !hasValueHelpWithFixedValues(propertyInfo);
      return (isValidForMassEdit || "") && inputType;
    },
    getIsFieldGrp: function (dataFieldConverted) {
      return dataFieldConverted && dataFieldConverted.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && dataFieldConverted.Target && dataFieldConverted.Target.value && dataFieldConverted.Target.value.indexOf("FieldGroup") > -1;
    },
    /**
     * Get text path for the mass edit field.
     *
     * @param property Property path
     * @param textBinding Text Binding Info
     * @param displayMode Display mode
     * @returns Text Property Path if it exists
     */
    getTextPath: function (property, textBinding, displayMode) {
      let descriptionPath;
      if (textBinding && (textBinding.path || textBinding.parameters && textBinding.parameters.length) && property) {
        if (textBinding.path && displayMode === "Description") {
          descriptionPath = textBinding.path;
        } else if (textBinding.parameters) {
          textBinding.parameters.forEach(function (props) {
            if (props.path && props.path !== property) {
              descriptionPath = props.path;
            }
          });
        }
      }
      return descriptionPath;
    },
    /**
     * Initializes a JSON Model for properties of dialog fields [label, visiblity, dataproperty, etc.].
     *
     * @param oTable Instance of Table
     * @param aContexts Contexts for mass edit
     * @param aDataArray Array containing data related to the dialog used by both the static and the runtime model
     * @returns The model
     */
    prepareDataForDialog: function (oTable, aContexts, aDataArray) {
      const oMetaModel = oTable && oTable.getModel().getMetaModel(),
        sCurrentEntitySetName = oTable.data("metaPath"),
        aTableFields = MassEditHelper.getTableFields(oTable),
        oEntityTypeContext = oMetaModel.getContext(`${sCurrentEntitySetName}/@`),
        oEntitySetContext = oMetaModel.getContext(sCurrentEntitySetName),
        oDataModelObjectPath = getInvolvedDataModelObjects(oEntityTypeContext);
      const oDataFieldModel = new JSONModel();
      let oResult;
      let sLabelText;
      let bValueHelpEnabled;
      let sUnitPropertyPath;
      let bValueHelpEnabledForUnit;
      let oTextBinding;
      aTableFields.forEach(function (oColumnInfo) {
        const sDataPropertyPath = oColumnInfo.dataProperty;
        if (sDataPropertyPath) {
          var _oDataFieldConverted$, _oDataFieldConverted$2, _oDataFieldConverted$3, _oDataFieldConverted$4, _oPropertyInfo, _oPropertyInfo$annota, _oPropertyInfo$annota2, _unitPropertyInfo$ann, _unitPropertyInfo$ann2;
          let oPropertyInfo = sDataPropertyPath && oMetaModel.getObject(`${sCurrentEntitySetName}/${sDataPropertyPath}@`);
          sLabelText = oColumnInfo.label || oPropertyInfo && oPropertyInfo["@com.sap.vocabularies.Common.v1.Label"] || sDataPropertyPath;
          if (oDataModelObjectPath) {
            oDataModelObjectPath.targetObject = oDataModelObjectPath.targetEntityType.entityProperties.filter(function (oProperty) {
              return oProperty.name === sDataPropertyPath;
            });
          }
          oDataModelObjectPath.targetObject = oDataModelObjectPath.targetObject[0] || {};
          oTextBinding = getTextBinding(oDataModelObjectPath, {}, true) || {};
          const oFieldContext = oMetaModel.getContext(oColumnInfo.annotationPath),
            oDataFieldConverted = convertMetaModelContext(oFieldContext),
            oPropertyContext = oMetaModel.getContext(`${sCurrentEntitySetName}/${sDataPropertyPath}@`),
            oInterface = oPropertyContext && oPropertyContext.getInterface();
          let oDataModelPath = getInvolvedDataModelObjects(oFieldContext, oEntitySetContext);
          if ((oDataFieldConverted === null || oDataFieldConverted === void 0 ? void 0 : (_oDataFieldConverted$ = oDataFieldConverted.Value) === null || _oDataFieldConverted$ === void 0 ? void 0 : (_oDataFieldConverted$2 = _oDataFieldConverted$.path) === null || _oDataFieldConverted$2 === void 0 ? void 0 : _oDataFieldConverted$2.length) > 0) {
            oDataModelPath = enhanceDataModelPath(oDataModelPath, sDataPropertyPath);
          }
          const bHiddenField = MassEditHelper.getHiddenValueForContexts(oFieldContext && oFieldContext.getObject()["@com.sap.vocabularies.UI.v1.Hidden"], aContexts) || false;
          const isImage = oPropertyInfo && oPropertyInfo["@com.sap.vocabularies.UI.v1.IsImageURL"];
          oInterface.context = {
            getModel: function () {
              return oInterface.getModel();
            },
            getPath: function () {
              return `${sCurrentEntitySetName}/${sDataPropertyPath}`;
            }
          };
          oPropertyInfo = isProperty(oDataFieldConverted) ? oDataFieldConverted : (oDataFieldConverted === null || oDataFieldConverted === void 0 ? void 0 : (_oDataFieldConverted$3 = oDataFieldConverted.Value) === null || _oDataFieldConverted$3 === void 0 ? void 0 : _oDataFieldConverted$3.$target) ?? (oDataFieldConverted === null || oDataFieldConverted === void 0 ? void 0 : (_oDataFieldConverted$4 = oDataFieldConverted.Target) === null || _oDataFieldConverted$4 === void 0 ? void 0 : _oDataFieldConverted$4.$target);
          // Datafield is not included in the FieldControl calculation, needs to be implemented

          const chartProperty = oPropertyInfo && oPropertyInfo.term && oPropertyInfo.term === "com.sap.vocabularies.UI.v1.Chart";
          const isAction = !!oDataFieldConverted.Action;
          const isFieldGrp = MassEditHelper.getIsFieldGrp(oDataFieldConverted);
          if (isImage || bHiddenField || chartProperty || isAction || isFieldGrp) {
            return;
          }

          // ValueHelp properties
          sUnitPropertyPath = (hasCurrency(oPropertyInfo) || hasUnit(oPropertyInfo)) && getAssociatedUnitPropertyPath(oPropertyInfo) || "";
          const unitPropertyInfo = sUnitPropertyPath && getAssociatedUnitProperty(oPropertyInfo);
          bValueHelpEnabled = hasValueHelp(oPropertyInfo);
          bValueHelpEnabledForUnit = unitPropertyInfo && hasValueHelp(unitPropertyInfo);
          const hasContextDependentVH = (bValueHelpEnabled || bValueHelpEnabledForUnit) && (((_oPropertyInfo = oPropertyInfo) === null || _oPropertyInfo === void 0 ? void 0 : (_oPropertyInfo$annota = _oPropertyInfo.annotations) === null || _oPropertyInfo$annota === void 0 ? void 0 : (_oPropertyInfo$annota2 = _oPropertyInfo$annota.Common) === null || _oPropertyInfo$annota2 === void 0 ? void 0 : _oPropertyInfo$annota2.ValueListRelevantQualifiers) || unitPropertyInfo && (unitPropertyInfo === null || unitPropertyInfo === void 0 ? void 0 : (_unitPropertyInfo$ann = unitPropertyInfo.annotations) === null || _unitPropertyInfo$ann === void 0 ? void 0 : (_unitPropertyInfo$ann2 = _unitPropertyInfo$ann.Common) === null || _unitPropertyInfo$ann2 === void 0 ? void 0 : _unitPropertyInfo$ann2.ValueListRelevantQualifiers));
          if (hasContextDependentVH) {
            // context dependent VH is not supported for Mass Edit.
            return;
          }

          // EditMode and InputType
          const propertyForFieldControl = oPropertyInfo && oPropertyInfo.Value ? oPropertyInfo.Value : oPropertyInfo;
          const expBinding = getEditMode(propertyForFieldControl, oDataModelPath, false, false, oDataFieldConverted, constant(true));
          const editModeValues = Object.keys(EditMode);
          const editModeIsStatic = !!expBinding && editModeValues.includes(expBinding);
          const editable = !!expBinding && (editModeIsStatic && expBinding === EditMode.Editable || !editModeIsStatic);
          const navPropertyWithValueHelp = sDataPropertyPath.includes("/") && bValueHelpEnabled;
          if (!editable || navPropertyWithValueHelp) {
            return;
          }
          const inputType = MassEditHelper.getInputType(oPropertyInfo, oDataFieldConverted, oDataModelPath);
          if (inputType) {
            const relativePath = getRelativePaths(oDataModelPath);
            const isReadOnly = isReadOnlyExpression(oPropertyInfo, relativePath);
            const displayMode = CommonUtils.computeDisplayMode(oPropertyContext.getObject());
            const isValueHelpEnabled = bValueHelpEnabled ? bValueHelpEnabled : false;
            const isValueHelpEnabledForUnit = bValueHelpEnabledForUnit && !sUnitPropertyPath.includes("/") ? bValueHelpEnabledForUnit : false;
            const unitProperty = sUnitPropertyPath && !sDataPropertyPath.includes("/") ? sUnitPropertyPath : false;
            oResult = {
              label: sLabelText,
              dataProperty: sDataPropertyPath,
              isValueHelpEnabled: bValueHelpEnabled ? bValueHelpEnabled : false,
              unitProperty,
              isFieldRequired: getRequiredExpression(oPropertyInfo, oDataFieldConverted, true, false, {}, oDataModelPath),
              defaultSelectionPath: sDataPropertyPath ? MassEditHelper.getDefaultSelectionPathComboBox(aContexts, sDataPropertyPath) : false,
              defaultSelectionUnitPath: sUnitPropertyPath ? MassEditHelper.getDefaultSelectionPathComboBox(aContexts, sUnitPropertyPath) : false,
              entitySet: sCurrentEntitySetName,
              display: displayMode,
              descriptionPath: MassEditHelper.getTextPath(sDataPropertyPath, oTextBinding, displayMode),
              nullable: oPropertyInfo.nullable !== undefined ? oPropertyInfo.nullable : true,
              isPropertyReadOnly: isReadOnly !== undefined ? isReadOnly : false,
              inputType: inputType,
              editMode: editable ? expBinding : undefined,
              propertyInfo: {
                hasVH: isValueHelpEnabled,
                runtimePath: "fieldsInfo>/values/",
                relativePath: sDataPropertyPath,
                propertyFullyQualifiedName: oPropertyInfo.fullyQualifiedName,
                propertyPathForValueHelp: `${sCurrentEntitySetName}/${sDataPropertyPath}`
              },
              unitInfo: unitProperty && {
                hasVH: isValueHelpEnabledForUnit,
                runtimePath: "fieldsInfo>/unitData/",
                relativePath: unitProperty,
                propertyPathForValueHelp: `${sCurrentEntitySetName}/${unitProperty}`
              }
            };
            aDataArray.push(oResult);
          }
        }
      });
      oDataFieldModel.setData(aDataArray);
      return oDataFieldModel;
    },
    getTableFields: function (oTable) {
      const aColumns = oTable && oTable.getColumns() || [];
      const columnsData = oTable && oTable.getParent().getTableDefinition().columns;
      return aColumns.map(function (oColumn) {
        const sDataProperty = oColumn && oColumn.getDataProperty(),
          aRealtedColumnInfo = columnsData && columnsData.filter(function (oColumnInfo) {
            return oColumnInfo.name === sDataProperty && oColumnInfo.type === "Annotation";
          });
        return {
          dataProperty: sDataProperty,
          label: oColumn.getHeader(),
          annotationPath: aRealtedColumnInfo && aRealtedColumnInfo[0] && aRealtedColumnInfo[0].annotationPath
        };
      });
    },
    getDefaultTextsForDialog: function (oResourceBundle, iSelectedContexts, oTable) {
      // The confirm button text is "Save" for table in Display mode and "Apply" for table in edit mode. This can be later exposed if needed.
      const bDisplayMode = oTable.data("displayModePropertyBinding") === "true";
      return {
        keepExistingPrefix: "< Keep",
        leaveBlankValue: "< Leave Blank >",
        clearFieldValue: "< Clear Values >",
        massEditTitle: oResourceBundle.getText("C_MASS_EDIT_DIALOG_TITLE", iSelectedContexts.toString()),
        applyButtonText: bDisplayMode ? oResourceBundle.getText("C_MASS_EDIT_SAVE_BUTTON_TEXT") : oResourceBundle.getText("C_MASS_EDIT_APPLY_BUTTON_TEXT"),
        useValueHelpValue: "< Use Value Help >",
        cancelButtonText: oResourceBundle.getText("C_COMMON_OBJECT_PAGE_CANCEL"),
        noFields: oResourceBundle.getText("C_MASS_EDIT_NO_EDITABLE_FIELDS"),
        okButtonText: oResourceBundle.getText("C_COMMON_DIALOG_OK")
      };
    },
    /**
     * Adds a suffix to the 'keep existing' property of the comboBox.
     *
     * @param sInputType InputType of the field
     * @returns The modified string
     */
    // getSuffixForKeepExisiting: function (sInputType: string) {
    // 	let sResult = "Values";

    // 	switch (sInputType) {
    // 		//TODO - Add for other control types as well (Radio Button, Email, Input, MDC Fields, Image etc.)
    // 		case "DatePicker":
    // 			sResult = "Dates";
    // 			break;
    // 		case "CheckBox":
    // 			sResult = "Settings";
    // 			break;
    // 		default:
    // 			sResult = "Values";
    // 	}
    // 	return sResult;
    // },

    /**
     * Adds default values to the model [Keep Existing Values, Leave Blank].
     *
     * @param aValues Array instance where the default data needs to be added
     * @param oDefaultValues Default values from Application Manifest
     * @param oPropertyInfo Property information
     * @param bUOMField
     */
    setDefaultValuesToDialog: function (aValues, oDefaultValues, oPropertyInfo, bUOMField) {
      const sPropertyPath = bUOMField ? oPropertyInfo.unitProperty : oPropertyInfo.dataProperty,
        sInputType = oPropertyInfo.inputType,
        bPropertyRequired = oPropertyInfo.isFieldRequired;
      // const sSuffixForKeepExisting = MassEditHelper.getSuffixForKeepExisiting(sInputType);
      const sSuffixForKeepExisting = "Values";
      aValues.defaultOptions = aValues.defaultOptions || [];
      const selectOptionsExist = aValues.selectOptions && aValues.selectOptions.length > 0;
      const keepEntry = {
        text: `${oDefaultValues.keepExistingPrefix} ${sSuffixForKeepExisting} >`,
        key: `Default/${sPropertyPath}`
      };
      if (sInputType === "CheckBox") {
        const falseEntry = {
          text: "No",
          key: `${sPropertyPath}/false`,
          textInfo: {
            value: false
          }
        };
        const truthyEntry = {
          text: "Yes",
          key: `${sPropertyPath}/true`,
          textInfo: {
            value: true
          }
        };
        aValues.unshift(falseEntry);
        aValues.defaultOptions.unshift(falseEntry);
        aValues.unshift(truthyEntry);
        aValues.defaultOptions.unshift(truthyEntry);
        aValues.unshift(keepEntry);
        aValues.defaultOptions.unshift(keepEntry);
      } else {
        var _oPropertyInfo$proper, _oPropertyInfo$unitIn;
        if (oPropertyInfo !== null && oPropertyInfo !== void 0 && (_oPropertyInfo$proper = oPropertyInfo.propertyInfo) !== null && _oPropertyInfo$proper !== void 0 && _oPropertyInfo$proper.hasVH || oPropertyInfo !== null && oPropertyInfo !== void 0 && (_oPropertyInfo$unitIn = oPropertyInfo.unitInfo) !== null && _oPropertyInfo$unitIn !== void 0 && _oPropertyInfo$unitIn.hasVH && bUOMField) {
          const vhdEntry = {
            text: oDefaultValues.useValueHelpValue,
            key: `UseValueHelpValue/${sPropertyPath}`
          };
          aValues.unshift(vhdEntry);
          aValues.defaultOptions.unshift(vhdEntry);
        }
        if (selectOptionsExist) {
          if (bPropertyRequired !== "true" && !bUOMField) {
            const clearEntry = {
              text: oDefaultValues.clearFieldValue,
              key: `ClearFieldValue/${sPropertyPath}`
            };
            aValues.unshift(clearEntry);
            aValues.defaultOptions.unshift(clearEntry);
          }
          aValues.unshift(keepEntry);
          aValues.defaultOptions.unshift(keepEntry);
        } else {
          const emptyEntry = {
            text: oDefaultValues.leaveBlankValue,
            key: `Default/${sPropertyPath}`
          };
          aValues.unshift(emptyEntry);
          aValues.defaultOptions.unshift(emptyEntry);
        }
      }
    },
    /**
     * Get text arrangement info for a context property.
     *
     * @param property Property Path
     * @param descriptionPath Path to text association of the property
     * @param displayMode Display mode of the property and text association
     * @param selectedContext Context to find the full text
     * @returns The text arrangement
     */
    getTextArrangementInfo: function (property, descriptionPath, displayMode, selectedContext) {
      let value = selectedContext.getObject(property),
        descriptionValue,
        fullText;
      if (descriptionPath && property) {
        switch (displayMode) {
          case "Description":
            descriptionValue = selectedContext.getObject(descriptionPath) || "";
            fullText = descriptionValue;
            break;
          case "Value":
            value = selectedContext.getObject(property) || "";
            fullText = value;
            break;
          case "ValueDescription":
            value = selectedContext.getObject(property) || "";
            descriptionValue = selectedContext.getObject(descriptionPath) || "";
            fullText = descriptionValue ? `${value} (${descriptionValue})` : value;
            break;
          case "DescriptionValue":
            value = selectedContext.getObject(property) || "";
            descriptionValue = selectedContext.getObject(descriptionPath) || "";
            fullText = descriptionValue ? `${descriptionValue} (${value})` : value;
            break;
          default:
            Log.info(`Display Property not applicable: ${property}`);
            break;
        }
      }
      return {
        textArrangement: displayMode,
        valuePath: property,
        descriptionPath: descriptionPath,
        value: value,
        description: descriptionValue,
        fullText: fullText
      };
    },
    /**
     * Return the visibility valuue for the ManagedObject Any.
     *
     * @param any The ManagedObject Any to be used to calculate the visible value of the binding.
     * @returns Returns true if the mass edit field is editable.
     */
    isEditable: function (any) {
      const binding = any.getBinding("any");
      const value = binding.getExternalValue();
      return value === EditMode.Editable;
    },
    /**
     * Calculate and update the visibility of mass edit field on change of the ManagedObject Any binding.
     *
     * @param oDialogDataModel Model to be used runtime.
     * @param dataProperty Field name.
     */
    onContextEditableChange: function (oDialogDataModel, dataProperty) {
      const objectsForVisibility = oDialogDataModel.getProperty(`/values/${dataProperty}/objectsForVisibility`) || [];
      const editable = objectsForVisibility.some(MassEditHelper.isEditable);
      if (editable) {
        oDialogDataModel.setProperty(`/values/${dataProperty}/visible`, editable);
      }
    },
    /**
     * Update Managed Object Any for visibility of the mass edit fields.
     *
     * @param mOToUse The ManagedObject Any to be used to calculate the visible value of the binding.
     * @param oDialogDataModel Model to be used runtime.
     * @param dataProperty Field name.
     * @param values Values of the field.
     */
    updateOnContextChange: function (mOToUse, oDialogDataModel, dataProperty, values) {
      const binding = mOToUse.getBinding("any");
      values.objectsForVisibility = values.objectsForVisibility || [];
      values.objectsForVisibility.push(mOToUse);
      binding === null || binding === void 0 ? void 0 : binding.attachChange(MassEditHelper.onContextEditableChange.bind(null, oDialogDataModel, dataProperty));
    },
    /**
     * Get bound object to calculate the visibility of contexts.
     *
     * @param expBinding Binding String object.
     * @param context Context the binding value.
     * @returns The ManagedObject Any to be used to calculate the visible value of the binding.
     */
    getBoundObject: function (expBinding, context) {
      const mOToUse = new Any({
        any: expBinding
      });
      const model = context.getModel();
      mOToUse.setModel(model);
      mOToUse.setBindingContext(context);
      return mOToUse;
    },
    /**
     * Get the visibility of the field.
     *
     * @param expBinding Binding String object.
     * @param oDialogDataModel Model to be used runtime.
     * @param dataProperty Field name.
     * @param values Values of the field.
     * @param context Context the binding value.
     * @returns Returns true if the mass edit field is editable.
     */
    getFieldVisiblity: function (expBinding, oDialogDataModel, dataProperty, values, context) {
      const mOToUse = MassEditHelper.getBoundObject(expBinding, context);
      const isContextEditable = MassEditHelper.isEditable(mOToUse);
      if (!isContextEditable) {
        MassEditHelper.updateOnContextChange(mOToUse, oDialogDataModel, dataProperty, values);
      }
      return isContextEditable;
    },
    /**
     * Initializes a runtime model:
     * => The model consists of values shown in the comboBox of the dialog (Leave Blank, Keep Existing Values, or any property value for the selected context, etc.)
     * => The model will capture runtime changes in the results property (the value entered in the comboBox).
     *
     * @param aContexts Contexts for mass edit
     * @param aDataArray Array containing data related to the dialog used by both the static and the runtime model
     * @param oDefaultValues Default values from i18n
     * @param dialogContext Transient context for mass edit dialog.
     * @returns The runtime model
     */
    setRuntimeModelOnDialog: function (aContexts, aDataArray, oDefaultValues, dialogContext) {
      const aValues = [];
      const aUnitData = [];
      const aResults = [];
      const textPaths = [];
      const aReadOnlyFieldInfo = [];
      const oData = {
        values: aValues,
        unitData: aUnitData,
        results: aResults,
        readablePropertyData: aReadOnlyFieldInfo,
        selectedKey: undefined,
        textPaths: textPaths,
        noFields: oDefaultValues.noFields
      };
      const oDialogDataModel = new JSONModel(oData);
      aDataArray.forEach(function (oInData) {
        let oTextInfo;
        let sPropertyKey;
        let sUnitPropertyName;
        const oDistinctValueMap = {};
        const oDistinctUnitMap = {};
        if (oInData.dataProperty && oInData.dataProperty.indexOf("/") > -1) {
          const aFinalPath = MassEditHelper.initLastLevelOfPropertyPath(oInData.dataProperty, aValues /*, dialogContext */);
          const aPropertyPaths = oInData.dataProperty.split("/");
          for (const context of aContexts) {
            const sMultiLevelPathValue = context.getObject(oInData.dataProperty);
            sPropertyKey = `${oInData.dataProperty}/${sMultiLevelPathValue}`;
            if (!oDistinctValueMap[sPropertyKey] && aFinalPath[aPropertyPaths[aPropertyPaths.length - 1]]) {
              oTextInfo = MassEditHelper.getTextArrangementInfo(oInData.dataProperty, oInData.descriptionPath, oInData.display, context);
              aFinalPath[aPropertyPaths[aPropertyPaths.length - 1]].push({
                text: oTextInfo && oTextInfo.fullText || sMultiLevelPathValue,
                key: sPropertyKey,
                textInfo: oTextInfo
              });
              oDistinctValueMap[sPropertyKey] = sMultiLevelPathValue;
            }
          }
          // if (Object.keys(oDistinctValueMap).length === 1) {
          // 	dialogContext.setProperty(oData.dataProperty, sPropertyKey && oDistinctValueMap[sPropertyKey]);
          // }

          aFinalPath[aPropertyPaths[aPropertyPaths.length - 1]].textInfo = {
            descriptionPath: oInData.descriptionPath,
            valuePath: oInData.dataProperty,
            displayMode: oInData.display
          };
        } else {
          aValues[oInData.dataProperty] = aValues[oInData.dataProperty] || [];
          aValues[oInData.dataProperty]["selectOptions"] = aValues[oInData.dataProperty]["selectOptions"] || [];
          if (oInData.unitProperty) {
            aUnitData[oInData.unitProperty] = aUnitData[oInData.unitProperty] || [];
            aUnitData[oInData.unitProperty]["selectOptions"] = aUnitData[oInData.unitProperty]["selectOptions"] || [];
          }
          for (const context of aContexts) {
            const oDataObject = context.getObject();
            sPropertyKey = `${oInData.dataProperty}/${oDataObject[oInData.dataProperty]}`;
            if (oInData.dataProperty && oDataObject[oInData.dataProperty] && !oDistinctValueMap[sPropertyKey]) {
              if (oInData.inputType != "CheckBox") {
                oTextInfo = MassEditHelper.getTextArrangementInfo(oInData.dataProperty, oInData.descriptionPath, oInData.display, context);
                const entry = {
                  text: oTextInfo && oTextInfo.fullText || oDataObject[oInData.dataProperty],
                  key: sPropertyKey,
                  textInfo: oTextInfo
                };
                aValues[oInData.dataProperty].push(entry);
                aValues[oInData.dataProperty]["selectOptions"].push(entry);
              }
              oDistinctValueMap[sPropertyKey] = oDataObject[oInData.dataProperty];
            }
            if (oInData.unitProperty && oDataObject[oInData.unitProperty]) {
              sUnitPropertyName = `${oInData.unitProperty}/${oDataObject[oInData.unitProperty]}`;
              if (!oDistinctUnitMap[sUnitPropertyName]) {
                if (oInData.inputType != "CheckBox") {
                  oTextInfo = MassEditHelper.getTextArrangementInfo(oInData.unitProperty, oInData.descriptionPath, oInData.display, context);
                  const unitEntry = {
                    text: oTextInfo && oTextInfo.fullText || oDataObject[oInData.unitProperty],
                    key: sUnitPropertyName,
                    textInfo: oTextInfo
                  };
                  aUnitData[oInData.unitProperty].push(unitEntry);
                  aUnitData[oInData.unitProperty]["selectOptions"].push(unitEntry);
                }
                oDistinctUnitMap[sUnitPropertyName] = oDataObject[oInData.unitProperty];
              }
            }
          }
          aValues[oInData.dataProperty].textInfo = {
            descriptionPath: oInData.descriptionPath,
            valuePath: oInData.dataProperty,
            displayMode: oInData.display
          };
          if (Object.keys(oDistinctValueMap).length === 1) {
            dialogContext.setProperty(oInData.dataProperty, sPropertyKey && oDistinctValueMap[sPropertyKey]);
          }
          if (Object.keys(oDistinctUnitMap).length === 1) {
            dialogContext.setProperty(oInData.unitProperty, sUnitPropertyName && oDistinctUnitMap[sUnitPropertyName]);
          }
        }
        textPaths[oInData.dataProperty] = oInData.descriptionPath ? [oInData.descriptionPath] : [];
      });
      aDataArray.forEach(function (oInData) {
        let values = {};
        if (oInData.dataProperty.indexOf("/") > -1) {
          const sMultiLevelPropPathValue = MassEditHelper.getValueForMultiLevelPath(oInData.dataProperty, aValues);
          if (!sMultiLevelPropPathValue) {
            sMultiLevelPropPathValue.push({
              text: oDefaultValues.leaveBlankValue,
              key: `Empty/${oInData.dataProperty}`
            });
          } else {
            MassEditHelper.setDefaultValuesToDialog(sMultiLevelPropPathValue, oDefaultValues, oInData);
          }
          values = sMultiLevelPropPathValue;
        } else if (aValues[oInData.dataProperty]) {
          aValues[oInData.dataProperty] = aValues[oInData.dataProperty] || [];
          MassEditHelper.setDefaultValuesToDialog(aValues[oInData.dataProperty], oDefaultValues, oInData);
          values = aValues[oInData.dataProperty];
        }
        if (aUnitData[oInData.unitProperty] && aUnitData[oInData.unitProperty].length) {
          MassEditHelper.setDefaultValuesToDialog(aUnitData[oInData.unitProperty], oDefaultValues, oInData, true);
          aUnitData[oInData.unitProperty].textInfo = {};
          aUnitData[oInData.unitProperty].selectedKey = MassEditHelper.getDefaultSelectionPathComboBox(aContexts, oInData.unitProperty);
          aUnitData[oInData.unitProperty].inputType = oInData.inputType;
        } else if (oInData.dataProperty && aValues[oInData.dataProperty] && !aValues[oInData.dataProperty].length || oInData.unitProperty && aUnitData[oInData.unitProperty] && !aUnitData[oInData.unitProperty].length) {
          const bClearFieldOrBlankValueExists = aValues[oInData.dataProperty] && aValues[oInData.dataProperty].some(function (obj) {
            return obj.text === "< Clear Values >" || obj.text === "< Leave Blank >";
          });
          if (oInData.dataProperty && !bClearFieldOrBlankValueExists) {
            aValues[oInData.dataProperty].push({
              text: oDefaultValues.leaveBlankValue,
              key: `Empty/${oInData.dataProperty}`
            });
          }
          const bClearFieldOrBlankUnitValueExists = aUnitData[oInData.unitProperty] && aUnitData[oInData.unitProperty].some(function (obj) {
            return obj.text === "< Clear Values >" || obj.text === "< Leave Blank >";
          });
          if (oInData.unitProperty) {
            if (!bClearFieldOrBlankUnitValueExists) {
              aUnitData[oInData.unitProperty].push({
                text: oDefaultValues.leaveBlankValue,
                key: `Empty/${oInData.unitProperty}`
              });
            }
            aUnitData[oInData.unitProperty].textInfo = {};
            aUnitData[oInData.unitProperty].selectedKey = MassEditHelper.getDefaultSelectionPathComboBox(aContexts, oInData.unitProperty);
            aUnitData[oInData.unitProperty].inputType = oInData.inputType;
          }
        }
        if (oInData.isPropertyReadOnly && typeof oInData.isPropertyReadOnly === "boolean") {
          aReadOnlyFieldInfo.push({
            property: oInData.dataProperty,
            value: oInData.isPropertyReadOnly,
            type: "Default"
          });
        } else if (oInData.isPropertyReadOnly && oInData.isPropertyReadOnly.operands && oInData.isPropertyReadOnly.operands[0] && oInData.isPropertyReadOnly.operands[0].operand1 && oInData.isPropertyReadOnly.operands[0].operand2) {
          // This needs to be refactored in accordance with the ReadOnlyExpression change
          aReadOnlyFieldInfo.push({
            property: oInData.dataProperty,
            propertyPath: oInData.isPropertyReadOnly.operands[0].operand1.path,
            propertyValue: oInData.isPropertyReadOnly.operands[0].operand2.value,
            type: "Path"
          });
        }

        // Setting visbility of the mass edit field.
        if (oInData.editMode) {
          values.visible = oInData.editMode === EditMode.Editable || aContexts.some(MassEditHelper.getFieldVisiblity.bind(MassEditHelper, oInData.editMode, oDialogDataModel, oInData.dataProperty, values));
        } else {
          values.visible = true;
        }
        values.selectedKey = MassEditHelper.getDefaultSelectionPathComboBox(aContexts, oInData.dataProperty);
        values.inputType = oInData.inputType;
        values.unitProperty = oInData.unitProperty;
      });
      return oDialogDataModel;
    },
    /**
     * Gets transient context for dialog.
     *
     * @param table Instance of Table.
     * @param dialog Mass Edit Dialog.
     * @returns Promise returning instance of dialog.
     */
    getDialogContext: function (table, dialog) {
      let transCtx = dialog && dialog.getBindingContext();
      if (!transCtx) {
        const model = table.getModel();
        const listBinding = table.getRowBinding();
        const transientListBinding = model.bindList(listBinding.getPath(), listBinding.getContext(), [], [], {
          $$updateGroupId: "submitLater"
        });
        transientListBinding.refreshInternal = function () {
          /* */
        };
        transCtx = transientListBinding.create({}, true);
      }
      return transCtx;
    },
    onDialogOpen: function (event) {
      const source = event.getSource();
      const fieldsInfoModel = source.getModel("fieldsInfo");
      fieldsInfoModel.setProperty("/isOpen", true);
    },
    closeDialog: function (oDialog) {
      oDialog.close();
      oDialog.destroy();
    },
    messageHandlingForMassEdit: async function (oTable, aContexts, oController, oInDialog, aResults, errorContexts) {
      var _oController$getView, _oController$getView$, _oController$getView4, _oController$getView5;
      const DraftStatus = FELibrary.DraftStatus;
      const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
      (_oController$getView = oController.getView()) === null || _oController$getView === void 0 ? void 0 : (_oController$getView$ = _oController$getView.getBindingContext("internal")) === null || _oController$getView$ === void 0 ? void 0 : _oController$getView$.setProperty("getBoundMessagesForMassEdit", true);
      oController.messageHandler.showMessages({
        onBeforeShowMessage: function (messages, showMessageParameters) {
          //messages.concatenate(messageHandling.getMessages(true, true));
          showMessageParameters.fnGetMessageSubtitle = messageHandling.setMessageSubtitle.bind({}, oTable, aContexts);
          const unboundErrors = [];
          messages.forEach(function (message) {
            if (!message.getTarget()) {
              unboundErrors.push(message);
            }
          });
          if (aResults.length > 0 && errorContexts.length === 0) {
            oController.editFlow.setDraftStatus(DraftStatus.Saved);
            const successToast = oResourceBundle.getText("C_MASS_EDIT_SUCCESS_TOAST");
            MessageToast.show(successToast);
          } else if (errorContexts.length < oTable.getSelectedContexts().length) {
            oController.editFlow.setDraftStatus(DraftStatus.Saved);
          } else if (errorContexts.length === oTable.getSelectedContexts().length) {
            oController.editFlow.setDraftStatus(DraftStatus.Clear);
          }
          if (oController.getModel("ui").getProperty("/isEditable") && unboundErrors.length === 0) {
            showMessageParameters.showMessageBox = false;
            showMessageParameters.showMessageDialog = false;
          }
          return showMessageParameters;
        }
      });
      if (oInDialog.isOpen()) {
        var _oController$getView2, _oController$getView3;
        MassEditHelper.closeDialog(oInDialog);
        (_oController$getView2 = oController.getView()) === null || _oController$getView2 === void 0 ? void 0 : (_oController$getView3 = _oController$getView2.getBindingContext("internal")) === null || _oController$getView3 === void 0 ? void 0 : _oController$getView3.setProperty("skipPatchHandlers", false);
      }
      (_oController$getView4 = oController.getView()) === null || _oController$getView4 === void 0 ? void 0 : (_oController$getView5 = _oController$getView4.getBindingContext("internal")) === null || _oController$getView5 === void 0 ? void 0 : _oController$getView5.setProperty("getBoundMessagesForMassEdit", false);
    },
    /**
     * This function generates side effects map from side effects ids(which is a combination of entity type and qualifier).
     *
     * @param oEntitySetContext
     * @param appComponent
     * @param oController
     * @param aResults
     * @returns Side effect map with data.
     */
    getSideEffectDataForKey: function (oEntitySetContext, appComponent, oController, aResults) {
      const sOwnerEntityType = oEntitySetContext.getProperty("$Type");
      const baseSideEffectsMapArray = {};
      aResults.forEach(result => {
        const sPath = result.keyValue;
        const sideEffectService = appComponent.getSideEffectsService();
        const fieldGroupIds = sideEffectService.computeFieldGroupIds(sOwnerEntityType, result.propertyFullyQualifiedName ?? "") ?? [];
        baseSideEffectsMapArray[sPath] = oController._sideEffects.getSideEffectsMapForFieldGroups(fieldGroupIds);
      });
      return baseSideEffectsMapArray;
    },
    /**
     * Give the entity type for a given spath for e.g.RequestedQuantity.
     *
     * @param sPath
     * @param sEntityType
     * @param oMetaModel
     * @returns Object having entity, spath and navigation path.
     */
    fnGetPathForSourceProperty: function (sPath, sEntityType, oMetaModel) {
      // if the property path has a navigation, get the target entity type of the navigation
      const sNavigationPath = sPath.indexOf("/") > 0 ? "/" + sEntityType + "/" + sPath.substr(0, sPath.lastIndexOf("/") + 1) + "@sapui.name" : false,
        pOwnerEntity = !sNavigationPath ? Promise.resolve(sEntityType) : oMetaModel.requestObject(sNavigationPath);
      sPath = sNavigationPath ? sPath.substr(sPath.lastIndexOf("/") + 1) : sPath;
      return {
        sPath,
        pOwnerEntity,
        sNavigationPath
      };
    },
    fnGetEntityTypeOfOwner: function (oMetaModel, baseNavPath, oEntitySetContext, targetEntity, aTargets) {
      const ownerEntityType = oEntitySetContext.getProperty("$Type");
      const {
        $Type: pOwner,
        $Partner: ownerNavPath
      } = oMetaModel.getObject(`${oEntitySetContext}/${baseNavPath}`); // nav path
      if (ownerNavPath) {
        const entityObjOfOwnerPartner = oMetaModel.getObject(`/${pOwner}/${ownerNavPath}`);
        if (entityObjOfOwnerPartner) {
          const entityTypeOfOwnerPartner = entityObjOfOwnerPartner["$Type"];
          // if the entity types defer, then base nav path is not from owner
          if (entityTypeOfOwnerPartner !== ownerEntityType) {
            // if target Prop is not from owner, we add it as immediate
            aTargets.push(targetEntity);
          }
        }
      } else {
        // if there is no $Partner attribute, it may not be from owner
        aTargets.push(targetEntity);
      }
      return aTargets;
    },
    /**
     * Give targets that are immediate or deferred based on the entity type of that target.
     *
     *
     * @param sideEffectsData
     * @param oEntitySetContext
     * @param sEntityType
     * @param oMetaModel
     * @returns Targets to request side effects.
     */
    fnGetTargetsForMassEdit: function (sideEffectsData, oEntitySetContext, sEntityType, oMetaModel) {
      const {
        targetProperties: aTargetProperties,
        targetEntities: aTargetEntities
      } = sideEffectsData;
      const aPromises = [];
      let aTargets = [];
      const ownerEntityType = oEntitySetContext.getProperty("$Type");
      if (sEntityType === ownerEntityType) {
        // if SalesOrdr Item
        aTargetEntities === null || aTargetEntities === void 0 ? void 0 : aTargetEntities.forEach(targetEntity => {
          targetEntity = targetEntity["$NavigationPropertyPath"];
          let baseNavPath;
          if (targetEntity.includes("/")) {
            baseNavPath = targetEntity.split("/")[0];
          } else {
            baseNavPath = targetEntity;
          }
          aTargets = MassEditHelper.fnGetEntityTypeOfOwner(oMetaModel, baseNavPath, oEntitySetContext, targetEntity, aTargets);
        });
      }
      if (aTargetProperties.length) {
        aTargetProperties.forEach(targetProp => {
          const {
            pOwnerEntity
          } = MassEditHelper.fnGetPathForSourceProperty(targetProp, sEntityType, oMetaModel);
          aPromises.push(pOwnerEntity.then(resultEntity => {
            // if entity is SalesOrderItem, Target Property is from Items table
            if (resultEntity === ownerEntityType) {
              aTargets.push(targetProp); // get immediate targets
            } else if (targetProp.includes("/")) {
              const baseNavPath = targetProp.split("/")[0];
              aTargets = MassEditHelper.fnGetEntityTypeOfOwner(oMetaModel, baseNavPath, oEntitySetContext, targetProp, aTargets);
            }
            return Promise.resolve(aTargets);
          }));
        });
      } else {
        aPromises.push(Promise.resolve(aTargets));
      }
      return Promise.all(aPromises);
    },
    /**
     * This function checks if in the given side Effects Obj, if _Item is set as Target Entity for any side Effects on
     * other entity set.
     *
     * @param sideEffectsMap
     * @param oEntitySetContext
     * @returns Length of sideEffectsArray where current Entity is set as Target Entity
     */
    checkIfEntityExistsAsTargetEntity: (sideEffectsMap, oEntitySetContext) => {
      const ownerEntityType = oEntitySetContext.getProperty("$Type");
      const sideEffectsOnOtherEntity = Object.values(sideEffectsMap).filter(obj => {
        return obj.name.indexOf(ownerEntityType) == -1;
      });
      const entitySetName = oEntitySetContext.getPath().split("/").pop();
      const sideEffectsWithCurrentEntityAsTarget = sideEffectsOnOtherEntity.filter(obj => {
        const targetEntitiesArray = obj.sideEffects.targetEntities;
        return targetEntitiesArray !== null && targetEntitiesArray !== void 0 && targetEntitiesArray.filter(innerObj => innerObj["$NavigationPropertyPath"] === entitySetName).length ? obj : false;
      });
      return sideEffectsWithCurrentEntityAsTarget.length;
    },
    /**
     * Upon updating the field, array of immediate and deferred side effects for that field are created.
     * If there are any failed side effects for that context, they will also be used to generate the map.
     * If the field has text associated with it, then add it to request side effects.
     *
     * @param mParams
     * @param mParams.oController Controller
     * @param mParams.oFieldPromise Promise to update field
     * @param mParams.sideEffectMap SideEffectsMap for the field
     * @param mParams.textPaths TextPaths of the field if any
     * @param mParams.groupId Group Id to used to group requests
     * @param mParams.key KeyValue of the field
     * @param mParams.oEntitySetContext EntitySetcontext
     * @param mParams.oMetaModel Metamodel data
     * @param mParams.selectedContext Selected row context
     * @param mParams.deferredTargetsForAQualifiedName Deferred targets data
     * @returns Promise for all immediately requested side effects.
     */
    handleMassEditFieldUpdateAndRequestSideEffects: async function (mParams) {
      const {
        oController,
        oFieldPromise,
        sideEffectsMap,
        textPaths,
        groupId,
        key,
        oEntitySetContext,
        oMetaModel,
        oSelectedContext,
        deferredTargetsForAQualifiedName
      } = mParams;
      const immediateSideEffectsPromises = [oFieldPromise];
      const ownerEntityType = oEntitySetContext.getProperty("$Type");
      const oAppComponent = CommonUtils.getAppComponent(oController.getView());
      const oSideEffectsService = oAppComponent.getSideEffectsService();
      const isSideEffectsWithCurrentEntityAsTarget = MassEditHelper.checkIfEntityExistsAsTargetEntity(sideEffectsMap, oEntitySetContext);
      if (sideEffectsMap) {
        const allEntityTypesWithQualifier = Object.keys(sideEffectsMap);
        const sideEffectsDataForField = Object.values(sideEffectsMap);
        const mVisitedSideEffects = {};
        deferredTargetsForAQualifiedName[key] = {};
        for (const [index, data] of sideEffectsDataForField.entries()) {
          const entityTypeWithQualifier = allEntityTypesWithQualifier[index];
          const sEntityType = entityTypeWithQualifier.split("#")[0];
          const oContext = oController._sideEffects.getContextForSideEffects(oSelectedContext, sEntityType);
          data.context = oContext;
          const allFailedSideEffects = oController._sideEffects.getRegisteredFailedRequests();
          const aFailedSideEffects = allFailedSideEffects[oContext.getPath()];
          oController._sideEffects.unregisterFailedSideEffectsForAContext(oContext);
          let sideEffectsForCurrentContext = [data.sideEffects];
          sideEffectsForCurrentContext = aFailedSideEffects && aFailedSideEffects.length ? sideEffectsForCurrentContext.concat(aFailedSideEffects) : sideEffectsForCurrentContext;
          mVisitedSideEffects[oContext] = {};
          for (const aSideEffect of sideEffectsForCurrentContext) {
            if (!mVisitedSideEffects[oContext].hasOwnProperty(aSideEffect.fullyQualifiedName)) {
              mVisitedSideEffects[oContext][aSideEffect.fullyQualifiedName] = true;
              let aImmediateTargets = [],
                allTargets = [],
                triggerActionName;
              const fnGetImmediateTargetsAndActions = async function (mSideEffect) {
                const {
                  targetProperties: aTargetProperties,
                  targetEntities: aTargetEntities
                } = mSideEffect;
                const sideEffectEntityType = mSideEffect.fullyQualifiedName.split("@")[0];
                const targetsArrayForAllProperties = await MassEditHelper.fnGetTargetsForMassEdit(mSideEffect, oEntitySetContext, sideEffectEntityType, oMetaModel);
                aImmediateTargets = targetsArrayForAllProperties[0];
                allTargets = (aTargetProperties || []).concat(aTargetEntities || []);
                const actionName = mSideEffect.triggerAction;
                const aDeferredTargets = allTargets.filter(target => {
                  return !aImmediateTargets.includes(target);
                });
                deferredTargetsForAQualifiedName[key][mSideEffect.fullyQualifiedName] = {
                  aTargets: aDeferredTargets,
                  oContext: oContext,
                  mSideEffect
                };

                // if entity is other than items table then action is defered
                if (actionName && sideEffectEntityType === ownerEntityType) {
                  // static action is on collection, so we defer it, else add to immediate requests array
                  const isStaticAction = TableHelper._isStaticAction(oMetaModel.getObject(`/${actionName}`), actionName);
                  if (!isStaticAction) {
                    triggerActionName = actionName;
                  } else {
                    deferredTargetsForAQualifiedName[key][mSideEffect.fullyQualifiedName]["TriggerAction"] = actionName;
                  }
                } else {
                  deferredTargetsForAQualifiedName[key][mSideEffect.fullyQualifiedName]["TriggerAction"] = actionName;
                }
                if (isSideEffectsWithCurrentEntityAsTarget) {
                  aImmediateTargets = [];
                }
                return {
                  aTargets: aImmediateTargets,
                  TriggerAction: triggerActionName
                };
              };
              immediateSideEffectsPromises.push(oController._sideEffects.requestSideEffects(aSideEffect, oContext, groupId, fnGetImmediateTargetsAndActions));
            }
          }
        }
      }
      if (textPaths !== null && textPaths !== void 0 && textPaths[key] && textPaths[key].length) {
        immediateSideEffectsPromises.push(oSideEffectsService.requestSideEffects(textPaths[key], oSelectedContext, groupId));
      }
      return Promise.allSettled(immediateSideEffectsPromises);
    },
    /**
     * Create the mass edit dialog.
     *
     * @param oTable Instance of Table
     * @param aContexts Contexts for mass edit
     * @param oController Controller for the view
     * @returns Promise returning instance of dialog.
     */
    createDialog: async function (oTable, aContexts, oController) {
      const sFragmentName = "sap/fe/core/controls/massEdit/MassEditDialog",
        aDataArray = [],
        oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core"),
        oDefaultValues = MassEditHelper.getDefaultTextsForDialog(oResourceBundle, aContexts.length, oTable),
        oDataFieldModel = MassEditHelper.prepareDataForDialog(oTable, aContexts, aDataArray),
        dialogContext = MassEditHelper.getDialogContext(oTable),
        oDialogDataModel = MassEditHelper.setRuntimeModelOnDialog(aContexts, aDataArray, oDefaultValues, dialogContext),
        model = oTable.getModel(),
        metaModel = model.getMetaModel(),
        itemsModel = new TemplateModel(oDataFieldModel.getData(), metaModel);
      const oFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment");
      const oCreatedFragment = await Promise.resolve(XMLPreprocessor.process(oFragment, {
        name: sFragmentName
      }, {
        bindingContexts: {
          dataFieldModel: itemsModel.createBindingContext("/"),
          metaModel: metaModel.createBindingContext("/"),
          contextPath: metaModel.createBindingContext(metaModel.getMetaPath(dialogContext.getPath()))
        },
        models: {
          dataFieldModel: itemsModel,
          metaModel: metaModel,
          contextPath: metaModel
        }
      }));
      const oDialogContent = await Fragment.load({
        definition: oCreatedFragment
      });
      const oDialog = new Dialog({
        resizable: true,
        title: oDefaultValues.massEditTitle,
        content: [oDialogContent],
        afterOpen: MassEditHelper.onDialogOpen,
        beginButton: new Button({
          text: MassEditHelper.helpers.getExpBindingForApplyButtonTxt(oDefaultValues, oDataFieldModel.getObject("/")),
          type: "Emphasized",
          press: async function (oEvent) {
            var _oController$getView6, _oController$getView7;
            messageHandling.removeBoundTransitionMessages();
            messageHandling.removeUnboundTransitionMessages();
            (_oController$getView6 = oController.getView()) === null || _oController$getView6 === void 0 ? void 0 : (_oController$getView7 = _oController$getView6.getBindingContext("internal")) === null || _oController$getView7 === void 0 ? void 0 : _oController$getView7.setProperty("skipPatchHandlers", true);
            const appComponent = CommonUtils.getAppComponent(oController.getView());
            const oInDialog = oEvent.getSource().getParent();
            const oModel = oInDialog.getModel("fieldsInfo");
            const aResults = oModel.getProperty("/results");
            const oMetaModel = oTable && oTable.getModel().getMetaModel(),
              sCurrentEntitySetName = oTable.data("metaPath"),
              oEntitySetContext = oMetaModel.getContext(sCurrentEntitySetName);
            const errorContexts = [];
            const textPaths = oModel.getProperty("/textPaths");
            const aPropertyReadableInfo = oModel.getProperty("/readablePropertyData");
            let groupId;
            let allSideEffects;
            const massEditPromises = [];
            const failedFieldsData = {};
            const selectedRowsLength = aContexts.length;
            const deferredTargetsForAQualifiedName = {};
            const baseSideEffectsMapArray = MassEditHelper.getSideEffectDataForKey(oEntitySetContext, appComponent, oController, aResults);
            //const changePromise: any[] = [];
            //let bReadOnlyField = false;
            //const errorContexts: object[] = [];

            aContexts.forEach(function (oSelectedContext, idx) {
              allSideEffects = [];
              aResults.forEach(async function (oResult) {
                if (!failedFieldsData.hasOwnProperty(oResult.keyValue)) {
                  failedFieldsData[oResult.keyValue] = 0;
                }
                //TODO - Add save implementation for Value Help.
                if (baseSideEffectsMapArray[oResult.keyValue]) {
                  allSideEffects[oResult.keyValue] = baseSideEffectsMapArray[oResult.keyValue];
                }
                if (aPropertyReadableInfo) {
                  aPropertyReadableInfo.some(function (oPropertyInfo) {
                    if (oResult.keyValue === oPropertyInfo.property) {
                      if (oPropertyInfo.type === "Default") {
                        return oPropertyInfo.value === true;
                      } else if (oPropertyInfo.type === "Path" && oPropertyInfo.propertyValue && oPropertyInfo.propertyPath) {
                        return oSelectedContext.getObject(oPropertyInfo.propertyPath) === oPropertyInfo.propertyValue;
                      }
                    }
                  });
                }
                groupId = `$auto.${idx}`;
                const oFieldPromise = oSelectedContext.setProperty(oResult.keyValue, oResult.value, groupId).catch(function (oError) {
                  errorContexts.push(oSelectedContext.getObject());
                  Log.error("Mass Edit: Something went wrong in updating entries.", oError);
                  failedFieldsData[oResult.keyValue] = failedFieldsData[oResult.keyValue] + 1;
                  return Promise.reject({
                    isFieldUpdateFailed: true
                  });
                });
                const dataToUpdateFieldAndSideEffects = {
                  oController,
                  oFieldPromise,
                  sideEffectsMap: baseSideEffectsMapArray[oResult.keyValue],
                  textPaths,
                  groupId,
                  key: oResult.keyValue,
                  oEntitySetContext,
                  oMetaModel,
                  oSelectedContext,
                  deferredTargetsForAQualifiedName
                };
                massEditPromises.push(MassEditHelper.handleMassEditFieldUpdateAndRequestSideEffects(dataToUpdateFieldAndSideEffects));
              });
            });
            await Promise.allSettled(massEditPromises).then(async function () {
              groupId = `$auto.massEditDeferred`;
              const deferredRequests = [];
              const sideEffectsDataForAllKeys = Object.values(deferredTargetsForAQualifiedName);
              const keysWithSideEffects = Object.keys(deferredTargetsForAQualifiedName);
              sideEffectsDataForAllKeys.forEach((aSideEffect, index) => {
                const currentKey = keysWithSideEffects[index];
                if (failedFieldsData[currentKey] !== selectedRowsLength) {
                  const deferredSideEffectsData = Object.values(aSideEffect);
                  deferredSideEffectsData.forEach(req => {
                    const {
                      aTargets,
                      oContext,
                      TriggerAction,
                      mSideEffect
                    } = req;
                    const fnGetDeferredTargets = function () {
                      return aTargets;
                    };
                    const fnGetDeferredTargetsAndActions = function () {
                      return {
                        aTargets: fnGetDeferredTargets(),
                        TriggerAction: TriggerAction
                      };
                    };
                    deferredRequests.push(
                    // if some deferred is rejected, it will be add to failed queue
                    oController._sideEffects.requestSideEffects(mSideEffect, oContext, groupId, fnGetDeferredTargetsAndActions));
                  });
                }
              });
            }).then(function () {
              MassEditHelper.messageHandlingForMassEdit(oTable, aContexts, oController, oInDialog, aResults, errorContexts);
            }).catch(e => {
              MassEditHelper.closeDialog(oDialog);
              return Promise.reject(e);
            });
          }
        }),
        endButton: new Button({
          text: oDefaultValues.cancelButtonText,
          visible: MassEditHelper.helpers.hasEditableFieldsBinding(oDataFieldModel.getObject("/"), true),
          press: function (oEvent) {
            const oInDialog = oEvent.getSource().getParent();
            MassEditHelper.closeDialog(oInDialog);
          }
        })
      });
      oDialog.setModel(oDialogDataModel, "fieldsInfo");
      oDialog.setModel(model);
      oDialog.setBindingContext(dialogContext);
      return oDialog;
    },
    helpers: {
      getBindingExpForHasEditableFields: (fields, editable) => {
        const totalExp = fields.reduce((expression, field) => or(expression, pathInModel("/values/" + field.dataProperty + "/visible", "fieldsInfo")), constant(false));
        return editable ? totalExp : not(totalExp);
      },
      getExpBindingForApplyButtonTxt: (defaultValues, fields) => {
        const editableExp = MassEditHelper.helpers.getBindingExpForHasEditableFields(fields, true);
        const totalExp = ifElse(editableExp, constant(defaultValues.applyButtonText), constant(defaultValues.okButtonText));
        return compileExpression(totalExp);
      },
      hasEditableFieldsBinding: (fields, editable) => {
        return compileExpression(MassEditHelper.helpers.getBindingExpForHasEditableFields(fields, editable));
      }
    }
  };
  return MassEditHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXNzRWRpdEhlbHBlciIsImluaXRMYXN0TGV2ZWxPZlByb3BlcnR5UGF0aCIsInNQYXRoIiwiYVZhbHVlcyIsImFGaW5hbFBhdGgiLCJpbmRleCIsImFQYXRocyIsInNwbGl0Iiwic0Z1bGxQYXRoIiwiZm9yRWFjaCIsInNQcm9wZXJ0eVBhdGgiLCJnZXRVbmlxdWVWYWx1ZXMiLCJzVmFsdWUiLCJzZWxmIiwidW5kZWZpbmVkIiwiaW5kZXhPZiIsImdldFZhbHVlRm9yTXVsdGlMZXZlbFBhdGgiLCJzRGF0YVByb3BlcnR5UGF0aCIsIm9WYWx1ZXMiLCJyZXN1bHQiLCJhUHJvcGVydHlQYXRocyIsImdldERlZmF1bHRTZWxlY3Rpb25QYXRoQ29tYm9Cb3giLCJhQ29udGV4dHMiLCJsZW5ndGgiLCJvU2VsZWN0ZWRDb250ZXh0IiwiYVByb3BlcnR5VmFsdWVzIiwib0NvbnRleHQiLCJvRGF0YU9iamVjdCIsImdldE9iamVjdCIsInNNdWx0aUxldmVsUGF0aENvbmRpdGlvbiIsImhhc093blByb3BlcnR5IiwicHVzaCIsImFVbmlxdWVQcm9wZXJ0eVZhbHVlcyIsImZpbHRlciIsImdldEhpZGRlblZhbHVlRm9yQ29udGV4dHMiLCJoaWRkZW5WYWx1ZSIsIiRQYXRoIiwic29tZSIsImdldElucHV0VHlwZSIsInByb3BlcnR5SW5mbyIsImRhdGFGaWVsZENvbnZlcnRlZCIsIm9EYXRhTW9kZWxQYXRoIiwiZWRpdFN0eWxlUHJvcGVydGllcyIsImlucHV0VHlwZSIsInNldEVkaXRTdHlsZVByb3BlcnRpZXMiLCJlZGl0U3R5bGUiLCJpc1ZhbGlkRm9yTWFzc0VkaXQiLCJpc011bHRpVmFsdWVGaWVsZCIsImhhc1ZhbHVlSGVscFdpdGhGaXhlZFZhbHVlcyIsImdldElzRmllbGRHcnAiLCIkVHlwZSIsIlRhcmdldCIsInZhbHVlIiwiZ2V0VGV4dFBhdGgiLCJwcm9wZXJ0eSIsInRleHRCaW5kaW5nIiwiZGlzcGxheU1vZGUiLCJkZXNjcmlwdGlvblBhdGgiLCJwYXRoIiwicGFyYW1ldGVycyIsInByb3BzIiwicHJlcGFyZURhdGFGb3JEaWFsb2ciLCJvVGFibGUiLCJhRGF0YUFycmF5Iiwib01ldGFNb2RlbCIsImdldE1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwic0N1cnJlbnRFbnRpdHlTZXROYW1lIiwiZGF0YSIsImFUYWJsZUZpZWxkcyIsImdldFRhYmxlRmllbGRzIiwib0VudGl0eVR5cGVDb250ZXh0IiwiZ2V0Q29udGV4dCIsIm9FbnRpdHlTZXRDb250ZXh0Iiwib0RhdGFNb2RlbE9iamVjdFBhdGgiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJvRGF0YUZpZWxkTW9kZWwiLCJKU09OTW9kZWwiLCJvUmVzdWx0Iiwic0xhYmVsVGV4dCIsImJWYWx1ZUhlbHBFbmFibGVkIiwic1VuaXRQcm9wZXJ0eVBhdGgiLCJiVmFsdWVIZWxwRW5hYmxlZEZvclVuaXQiLCJvVGV4dEJpbmRpbmciLCJvQ29sdW1uSW5mbyIsImRhdGFQcm9wZXJ0eSIsIm9Qcm9wZXJ0eUluZm8iLCJsYWJlbCIsInRhcmdldE9iamVjdCIsInRhcmdldEVudGl0eVR5cGUiLCJlbnRpdHlQcm9wZXJ0aWVzIiwib1Byb3BlcnR5IiwibmFtZSIsImdldFRleHRCaW5kaW5nIiwib0ZpZWxkQ29udGV4dCIsImFubm90YXRpb25QYXRoIiwib0RhdGFGaWVsZENvbnZlcnRlZCIsImNvbnZlcnRNZXRhTW9kZWxDb250ZXh0Iiwib1Byb3BlcnR5Q29udGV4dCIsIm9JbnRlcmZhY2UiLCJnZXRJbnRlcmZhY2UiLCJWYWx1ZSIsImVuaGFuY2VEYXRhTW9kZWxQYXRoIiwiYkhpZGRlbkZpZWxkIiwiaXNJbWFnZSIsImNvbnRleHQiLCJnZXRQYXRoIiwiaXNQcm9wZXJ0eSIsIiR0YXJnZXQiLCJjaGFydFByb3BlcnR5IiwidGVybSIsImlzQWN0aW9uIiwiQWN0aW9uIiwiaXNGaWVsZEdycCIsImhhc0N1cnJlbmN5IiwiaGFzVW5pdCIsImdldEFzc29jaWF0ZWRVbml0UHJvcGVydHlQYXRoIiwidW5pdFByb3BlcnR5SW5mbyIsImdldEFzc29jaWF0ZWRVbml0UHJvcGVydHkiLCJoYXNWYWx1ZUhlbHAiLCJoYXNDb250ZXh0RGVwZW5kZW50VkgiLCJhbm5vdGF0aW9ucyIsIkNvbW1vbiIsIlZhbHVlTGlzdFJlbGV2YW50UXVhbGlmaWVycyIsInByb3BlcnR5Rm9yRmllbGRDb250cm9sIiwiZXhwQmluZGluZyIsImdldEVkaXRNb2RlIiwiY29uc3RhbnQiLCJlZGl0TW9kZVZhbHVlcyIsIk9iamVjdCIsImtleXMiLCJFZGl0TW9kZSIsImVkaXRNb2RlSXNTdGF0aWMiLCJpbmNsdWRlcyIsImVkaXRhYmxlIiwiRWRpdGFibGUiLCJuYXZQcm9wZXJ0eVdpdGhWYWx1ZUhlbHAiLCJyZWxhdGl2ZVBhdGgiLCJnZXRSZWxhdGl2ZVBhdGhzIiwiaXNSZWFkT25seSIsImlzUmVhZE9ubHlFeHByZXNzaW9uIiwiQ29tbW9uVXRpbHMiLCJjb21wdXRlRGlzcGxheU1vZGUiLCJpc1ZhbHVlSGVscEVuYWJsZWQiLCJpc1ZhbHVlSGVscEVuYWJsZWRGb3JVbml0IiwidW5pdFByb3BlcnR5IiwiaXNGaWVsZFJlcXVpcmVkIiwiZ2V0UmVxdWlyZWRFeHByZXNzaW9uIiwiZGVmYXVsdFNlbGVjdGlvblBhdGgiLCJkZWZhdWx0U2VsZWN0aW9uVW5pdFBhdGgiLCJlbnRpdHlTZXQiLCJkaXNwbGF5IiwibnVsbGFibGUiLCJpc1Byb3BlcnR5UmVhZE9ubHkiLCJlZGl0TW9kZSIsImhhc1ZIIiwicnVudGltZVBhdGgiLCJwcm9wZXJ0eUZ1bGx5UXVhbGlmaWVkTmFtZSIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsInByb3BlcnR5UGF0aEZvclZhbHVlSGVscCIsInVuaXRJbmZvIiwic2V0RGF0YSIsImFDb2x1bW5zIiwiZ2V0Q29sdW1ucyIsImNvbHVtbnNEYXRhIiwiZ2V0UGFyZW50IiwiZ2V0VGFibGVEZWZpbml0aW9uIiwiY29sdW1ucyIsIm1hcCIsIm9Db2x1bW4iLCJzRGF0YVByb3BlcnR5IiwiZ2V0RGF0YVByb3BlcnR5IiwiYVJlYWx0ZWRDb2x1bW5JbmZvIiwidHlwZSIsImdldEhlYWRlciIsImdldERlZmF1bHRUZXh0c0ZvckRpYWxvZyIsIm9SZXNvdXJjZUJ1bmRsZSIsImlTZWxlY3RlZENvbnRleHRzIiwiYkRpc3BsYXlNb2RlIiwia2VlcEV4aXN0aW5nUHJlZml4IiwibGVhdmVCbGFua1ZhbHVlIiwiY2xlYXJGaWVsZFZhbHVlIiwibWFzc0VkaXRUaXRsZSIsImdldFRleHQiLCJ0b1N0cmluZyIsImFwcGx5QnV0dG9uVGV4dCIsInVzZVZhbHVlSGVscFZhbHVlIiwiY2FuY2VsQnV0dG9uVGV4dCIsIm5vRmllbGRzIiwib2tCdXR0b25UZXh0Iiwic2V0RGVmYXVsdFZhbHVlc1RvRGlhbG9nIiwib0RlZmF1bHRWYWx1ZXMiLCJiVU9NRmllbGQiLCJzSW5wdXRUeXBlIiwiYlByb3BlcnR5UmVxdWlyZWQiLCJzU3VmZml4Rm9yS2VlcEV4aXN0aW5nIiwiZGVmYXVsdE9wdGlvbnMiLCJzZWxlY3RPcHRpb25zRXhpc3QiLCJzZWxlY3RPcHRpb25zIiwia2VlcEVudHJ5IiwidGV4dCIsImtleSIsImZhbHNlRW50cnkiLCJ0ZXh0SW5mbyIsInRydXRoeUVudHJ5IiwidW5zaGlmdCIsInZoZEVudHJ5IiwiY2xlYXJFbnRyeSIsImVtcHR5RW50cnkiLCJnZXRUZXh0QXJyYW5nZW1lbnRJbmZvIiwic2VsZWN0ZWRDb250ZXh0IiwiZGVzY3JpcHRpb25WYWx1ZSIsImZ1bGxUZXh0IiwiTG9nIiwiaW5mbyIsInRleHRBcnJhbmdlbWVudCIsInZhbHVlUGF0aCIsImRlc2NyaXB0aW9uIiwiaXNFZGl0YWJsZSIsImFueSIsImJpbmRpbmciLCJnZXRCaW5kaW5nIiwiZ2V0RXh0ZXJuYWxWYWx1ZSIsIm9uQ29udGV4dEVkaXRhYmxlQ2hhbmdlIiwib0RpYWxvZ0RhdGFNb2RlbCIsIm9iamVjdHNGb3JWaXNpYmlsaXR5IiwiZ2V0UHJvcGVydHkiLCJzZXRQcm9wZXJ0eSIsInVwZGF0ZU9uQ29udGV4dENoYW5nZSIsIm1PVG9Vc2UiLCJ2YWx1ZXMiLCJhdHRhY2hDaGFuZ2UiLCJiaW5kIiwiZ2V0Qm91bmRPYmplY3QiLCJBbnkiLCJtb2RlbCIsInNldE1vZGVsIiwic2V0QmluZGluZ0NvbnRleHQiLCJnZXRGaWVsZFZpc2libGl0eSIsImlzQ29udGV4dEVkaXRhYmxlIiwic2V0UnVudGltZU1vZGVsT25EaWFsb2ciLCJkaWFsb2dDb250ZXh0IiwiYVVuaXREYXRhIiwiYVJlc3VsdHMiLCJ0ZXh0UGF0aHMiLCJhUmVhZE9ubHlGaWVsZEluZm8iLCJvRGF0YSIsInVuaXREYXRhIiwicmVzdWx0cyIsInJlYWRhYmxlUHJvcGVydHlEYXRhIiwic2VsZWN0ZWRLZXkiLCJvSW5EYXRhIiwib1RleHRJbmZvIiwic1Byb3BlcnR5S2V5Iiwic1VuaXRQcm9wZXJ0eU5hbWUiLCJvRGlzdGluY3RWYWx1ZU1hcCIsIm9EaXN0aW5jdFVuaXRNYXAiLCJzTXVsdGlMZXZlbFBhdGhWYWx1ZSIsImVudHJ5IiwidW5pdEVudHJ5Iiwic011bHRpTGV2ZWxQcm9wUGF0aFZhbHVlIiwiYkNsZWFyRmllbGRPckJsYW5rVmFsdWVFeGlzdHMiLCJvYmoiLCJiQ2xlYXJGaWVsZE9yQmxhbmtVbml0VmFsdWVFeGlzdHMiLCJvcGVyYW5kcyIsIm9wZXJhbmQxIiwib3BlcmFuZDIiLCJwcm9wZXJ0eVBhdGgiLCJwcm9wZXJ0eVZhbHVlIiwidmlzaWJsZSIsImdldERpYWxvZ0NvbnRleHQiLCJ0YWJsZSIsImRpYWxvZyIsInRyYW5zQ3R4IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJsaXN0QmluZGluZyIsImdldFJvd0JpbmRpbmciLCJ0cmFuc2llbnRMaXN0QmluZGluZyIsImJpbmRMaXN0IiwiJCR1cGRhdGVHcm91cElkIiwicmVmcmVzaEludGVybmFsIiwiY3JlYXRlIiwib25EaWFsb2dPcGVuIiwiZXZlbnQiLCJzb3VyY2UiLCJnZXRTb3VyY2UiLCJmaWVsZHNJbmZvTW9kZWwiLCJjbG9zZURpYWxvZyIsIm9EaWFsb2ciLCJjbG9zZSIsImRlc3Ryb3kiLCJtZXNzYWdlSGFuZGxpbmdGb3JNYXNzRWRpdCIsIm9Db250cm9sbGVyIiwib0luRGlhbG9nIiwiZXJyb3JDb250ZXh0cyIsIkRyYWZ0U3RhdHVzIiwiRkVMaWJyYXJ5IiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsImdldFZpZXciLCJtZXNzYWdlSGFuZGxlciIsInNob3dNZXNzYWdlcyIsIm9uQmVmb3JlU2hvd01lc3NhZ2UiLCJtZXNzYWdlcyIsInNob3dNZXNzYWdlUGFyYW1ldGVycyIsImZuR2V0TWVzc2FnZVN1YnRpdGxlIiwibWVzc2FnZUhhbmRsaW5nIiwic2V0TWVzc2FnZVN1YnRpdGxlIiwidW5ib3VuZEVycm9ycyIsIm1lc3NhZ2UiLCJnZXRUYXJnZXQiLCJlZGl0RmxvdyIsInNldERyYWZ0U3RhdHVzIiwiU2F2ZWQiLCJzdWNjZXNzVG9hc3QiLCJNZXNzYWdlVG9hc3QiLCJzaG93IiwiZ2V0U2VsZWN0ZWRDb250ZXh0cyIsIkNsZWFyIiwic2hvd01lc3NhZ2VCb3giLCJzaG93TWVzc2FnZURpYWxvZyIsImlzT3BlbiIsImdldFNpZGVFZmZlY3REYXRhRm9yS2V5IiwiYXBwQ29tcG9uZW50Iiwic093bmVyRW50aXR5VHlwZSIsImJhc2VTaWRlRWZmZWN0c01hcEFycmF5Iiwia2V5VmFsdWUiLCJzaWRlRWZmZWN0U2VydmljZSIsImdldFNpZGVFZmZlY3RzU2VydmljZSIsImZpZWxkR3JvdXBJZHMiLCJjb21wdXRlRmllbGRHcm91cElkcyIsIl9zaWRlRWZmZWN0cyIsImdldFNpZGVFZmZlY3RzTWFwRm9yRmllbGRHcm91cHMiLCJmbkdldFBhdGhGb3JTb3VyY2VQcm9wZXJ0eSIsInNFbnRpdHlUeXBlIiwic05hdmlnYXRpb25QYXRoIiwic3Vic3RyIiwibGFzdEluZGV4T2YiLCJwT3duZXJFbnRpdHkiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlcXVlc3RPYmplY3QiLCJmbkdldEVudGl0eVR5cGVPZk93bmVyIiwiYmFzZU5hdlBhdGgiLCJ0YXJnZXRFbnRpdHkiLCJhVGFyZ2V0cyIsIm93bmVyRW50aXR5VHlwZSIsInBPd25lciIsIiRQYXJ0bmVyIiwib3duZXJOYXZQYXRoIiwiZW50aXR5T2JqT2ZPd25lclBhcnRuZXIiLCJlbnRpdHlUeXBlT2ZPd25lclBhcnRuZXIiLCJmbkdldFRhcmdldHNGb3JNYXNzRWRpdCIsInNpZGVFZmZlY3RzRGF0YSIsInRhcmdldFByb3BlcnRpZXMiLCJhVGFyZ2V0UHJvcGVydGllcyIsInRhcmdldEVudGl0aWVzIiwiYVRhcmdldEVudGl0aWVzIiwiYVByb21pc2VzIiwidGFyZ2V0UHJvcCIsInRoZW4iLCJyZXN1bHRFbnRpdHkiLCJhbGwiLCJjaGVja0lmRW50aXR5RXhpc3RzQXNUYXJnZXRFbnRpdHkiLCJzaWRlRWZmZWN0c01hcCIsInNpZGVFZmZlY3RzT25PdGhlckVudGl0eSIsImVudGl0eVNldE5hbWUiLCJwb3AiLCJzaWRlRWZmZWN0c1dpdGhDdXJyZW50RW50aXR5QXNUYXJnZXQiLCJ0YXJnZXRFbnRpdGllc0FycmF5Iiwic2lkZUVmZmVjdHMiLCJpbm5lck9iaiIsImhhbmRsZU1hc3NFZGl0RmllbGRVcGRhdGVBbmRSZXF1ZXN0U2lkZUVmZmVjdHMiLCJtUGFyYW1zIiwib0ZpZWxkUHJvbWlzZSIsImdyb3VwSWQiLCJkZWZlcnJlZFRhcmdldHNGb3JBUXVhbGlmaWVkTmFtZSIsImltbWVkaWF0ZVNpZGVFZmZlY3RzUHJvbWlzZXMiLCJvQXBwQ29tcG9uZW50IiwiZ2V0QXBwQ29tcG9uZW50Iiwib1NpZGVFZmZlY3RzU2VydmljZSIsImlzU2lkZUVmZmVjdHNXaXRoQ3VycmVudEVudGl0eUFzVGFyZ2V0IiwiYWxsRW50aXR5VHlwZXNXaXRoUXVhbGlmaWVyIiwic2lkZUVmZmVjdHNEYXRhRm9yRmllbGQiLCJtVmlzaXRlZFNpZGVFZmZlY3RzIiwiZW50cmllcyIsImVudGl0eVR5cGVXaXRoUXVhbGlmaWVyIiwiZ2V0Q29udGV4dEZvclNpZGVFZmZlY3RzIiwiYWxsRmFpbGVkU2lkZUVmZmVjdHMiLCJnZXRSZWdpc3RlcmVkRmFpbGVkUmVxdWVzdHMiLCJhRmFpbGVkU2lkZUVmZmVjdHMiLCJ1bnJlZ2lzdGVyRmFpbGVkU2lkZUVmZmVjdHNGb3JBQ29udGV4dCIsInNpZGVFZmZlY3RzRm9yQ3VycmVudENvbnRleHQiLCJjb25jYXQiLCJhU2lkZUVmZmVjdCIsImFJbW1lZGlhdGVUYXJnZXRzIiwiYWxsVGFyZ2V0cyIsInRyaWdnZXJBY3Rpb25OYW1lIiwiZm5HZXRJbW1lZGlhdGVUYXJnZXRzQW5kQWN0aW9ucyIsIm1TaWRlRWZmZWN0Iiwic2lkZUVmZmVjdEVudGl0eVR5cGUiLCJ0YXJnZXRzQXJyYXlGb3JBbGxQcm9wZXJ0aWVzIiwiYWN0aW9uTmFtZSIsInRyaWdnZXJBY3Rpb24iLCJhRGVmZXJyZWRUYXJnZXRzIiwidGFyZ2V0IiwiaXNTdGF0aWNBY3Rpb24iLCJUYWJsZUhlbHBlciIsIl9pc1N0YXRpY0FjdGlvbiIsIlRyaWdnZXJBY3Rpb24iLCJyZXF1ZXN0U2lkZUVmZmVjdHMiLCJhbGxTZXR0bGVkIiwiY3JlYXRlRGlhbG9nIiwic0ZyYWdtZW50TmFtZSIsIm1ldGFNb2RlbCIsIml0ZW1zTW9kZWwiLCJUZW1wbGF0ZU1vZGVsIiwiZ2V0RGF0YSIsIm9GcmFnbWVudCIsIlhNTFRlbXBsYXRlUHJvY2Vzc29yIiwibG9hZFRlbXBsYXRlIiwib0NyZWF0ZWRGcmFnbWVudCIsIlhNTFByZXByb2Nlc3NvciIsInByb2Nlc3MiLCJiaW5kaW5nQ29udGV4dHMiLCJkYXRhRmllbGRNb2RlbCIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwiY29udGV4dFBhdGgiLCJnZXRNZXRhUGF0aCIsIm1vZGVscyIsIm9EaWFsb2dDb250ZW50IiwiRnJhZ21lbnQiLCJsb2FkIiwiZGVmaW5pdGlvbiIsIkRpYWxvZyIsInJlc2l6YWJsZSIsInRpdGxlIiwiY29udGVudCIsImFmdGVyT3BlbiIsImJlZ2luQnV0dG9uIiwiQnV0dG9uIiwiaGVscGVycyIsImdldEV4cEJpbmRpbmdGb3JBcHBseUJ1dHRvblR4dCIsInByZXNzIiwib0V2ZW50IiwicmVtb3ZlQm91bmRUcmFuc2l0aW9uTWVzc2FnZXMiLCJyZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzIiwib01vZGVsIiwiYVByb3BlcnR5UmVhZGFibGVJbmZvIiwiYWxsU2lkZUVmZmVjdHMiLCJtYXNzRWRpdFByb21pc2VzIiwiZmFpbGVkRmllbGRzRGF0YSIsInNlbGVjdGVkUm93c0xlbmd0aCIsImlkeCIsImNhdGNoIiwib0Vycm9yIiwiZXJyb3IiLCJyZWplY3QiLCJpc0ZpZWxkVXBkYXRlRmFpbGVkIiwiZGF0YVRvVXBkYXRlRmllbGRBbmRTaWRlRWZmZWN0cyIsImRlZmVycmVkUmVxdWVzdHMiLCJzaWRlRWZmZWN0c0RhdGFGb3JBbGxLZXlzIiwia2V5c1dpdGhTaWRlRWZmZWN0cyIsImN1cnJlbnRLZXkiLCJkZWZlcnJlZFNpZGVFZmZlY3RzRGF0YSIsInJlcSIsImZuR2V0RGVmZXJyZWRUYXJnZXRzIiwiZm5HZXREZWZlcnJlZFRhcmdldHNBbmRBY3Rpb25zIiwiZSIsImVuZEJ1dHRvbiIsImhhc0VkaXRhYmxlRmllbGRzQmluZGluZyIsImdldEJpbmRpbmdFeHBGb3JIYXNFZGl0YWJsZUZpZWxkcyIsImZpZWxkcyIsInRvdGFsRXhwIiwicmVkdWNlIiwiZXhwcmVzc2lvbiIsImZpZWxkIiwib3IiLCJwYXRoSW5Nb2RlbCIsIm5vdCIsImRlZmF1bHRWYWx1ZXMiLCJlZGl0YWJsZUV4cCIsImlmRWxzZSIsImNvbXBpbGVFeHByZXNzaW9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJNYXNzRWRpdEhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB0eXBlIHtcblx0RmllbGRTaWRlRWZmZWN0RGljdGlvbmFyeSxcblx0TWFzc0VkaXRGaWVsZFNpZGVFZmZlY3REaWN0aW9uYXJ5LFxuXHRNYXNzRWRpdEZpZWxkU2lkZUVmZmVjdFByb3BlcnR5VHlwZVxufSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvU2lkZUVmZmVjdHNcIjtcbmltcG9ydCB0eXBlIHsgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBjb21waWxlRXhwcmVzc2lvbiwgY29uc3RhbnQsIGlmRWxzZSwgbm90LCBvciwgcGF0aEluTW9kZWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgaXNQcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1R5cGVHdWFyZHNcIjtcbmltcG9ydCBGRUxpYnJhcnkgZnJvbSBcInNhcC9mZS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCB0eXBlIFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IHR5cGUgeyBPRGF0YVNpZGVFZmZlY3RzVHlwZSwgU2lkZUVmZmVjdHNFbnRpdHlUeXBlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL1NpZGVFZmZlY3RzU2VydmljZUZhY3RvcnlcIjtcbmltcG9ydCBUZW1wbGF0ZU1vZGVsIGZyb20gXCJzYXAvZmUvY29yZS9UZW1wbGF0ZU1vZGVsXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFNb2RlbE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgeyBlbmhhbmNlRGF0YU1vZGVsUGF0aCwgZ2V0UmVsYXRpdmVQYXRocyB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB7XG5cdGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHksXG5cdGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHlQYXRoLFxuXHRoYXNDdXJyZW5jeSxcblx0aGFzVW5pdCxcblx0aGFzVmFsdWVIZWxwLFxuXHRoYXNWYWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXNcbn0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvUHJvcGVydHlIZWxwZXJcIjtcbmltcG9ydCB7IGdldFRleHRCaW5kaW5nLCBzZXRFZGl0U3R5bGVQcm9wZXJ0aWVzIH0gZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRUZW1wbGF0aW5nXCI7XG5pbXBvcnQgdHlwZSB7IEZpZWxkUHJvcGVydGllcyB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL2ludGVybmFsL0ludGVybmFsRmllbGQuYmxvY2tcIjtcbmltcG9ydCBUYWJsZUhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9UYWJsZUhlbHBlclwiO1xuaW1wb3J0IEJ1dHRvbiBmcm9tIFwic2FwL20vQnV0dG9uXCI7XG5pbXBvcnQgRGlhbG9nIGZyb20gXCJzYXAvbS9EaWFsb2dcIjtcbmltcG9ydCBNZXNzYWdlVG9hc3QgZnJvbSBcInNhcC9tL01lc3NhZ2VUb2FzdFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBGcmFnbWVudCBmcm9tIFwic2FwL3VpL2NvcmUvRnJhZ21lbnRcIjtcbmltcG9ydCBYTUxQcmVwcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL3V0aWwvWE1MUHJlcHJvY2Vzc29yXCI7XG5pbXBvcnQgWE1MVGVtcGxhdGVQcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL1hNTFRlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgRWRpdE1vZGUgZnJvbSBcInNhcC91aS9tZGMvZW51bS9FZGl0TW9kZVwiO1xuaW1wb3J0IHR5cGUgVGFibGUgZnJvbSBcInNhcC91aS9tZGMvVGFibGVcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIE9EYXRhTGlzdEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YUxpc3RCaW5kaW5nXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgbWVzc2FnZUhhbmRsaW5nIGZyb20gXCIuLi9jb250cm9sbGVyZXh0ZW5zaW9ucy9tZXNzYWdlSGFuZGxlci9tZXNzYWdlSGFuZGxpbmdcIjtcbmltcG9ydCB0eXBlIHsgQW55VHlwZSB9IGZyb20gXCIuLi9jb250cm9scy9BbnlcIjtcbmltcG9ydCBBbnkgZnJvbSBcIi4uL2NvbnRyb2xzL0FueVwiO1xuaW1wb3J0IHsgY29udmVydE1ldGFNb2RlbENvbnRleHQsIGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyB9IGZyb20gXCIuLi9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHsgaXNSZWFkT25seUV4cHJlc3Npb24gfSBmcm9tIFwiLi4vdGVtcGxhdGluZy9GaWVsZENvbnRyb2xIZWxwZXJcIjtcbmltcG9ydCB7IGdldEVkaXRNb2RlLCBnZXRSZXF1aXJlZEV4cHJlc3Npb24sIGlzTXVsdGlWYWx1ZUZpZWxkIH0gZnJvbSBcIi4uL3RlbXBsYXRpbmcvVUlGb3JtYXR0ZXJzXCI7XG5pbXBvcnQgdHlwZSB7IEludGVybmFsTW9kZWxDb250ZXh0IH0gZnJvbSBcIi4vTW9kZWxIZWxwZXJcIjtcblxuLyogVGhpcyBjbGFzcyBjb250YWlucyBoZWxwZXJzIHRvIGJlIHVzZWQgZm9yIG1hc3MgZWRpdCBmdW5jdGlvbmFsaXR5ICovXG50eXBlIFRleHRBcnJhbmdlbWVudEluZm8gPSB7XG5cdHRleHRBcnJhbmdlbWVudDogc3RyaW5nO1xuXHR2YWx1ZVBhdGg6IHN0cmluZztcblx0ZGVzY3JpcHRpb25QYXRoPzogc3RyaW5nO1xuXHR2YWx1ZTogc3RyaW5nO1xuXHRkZXNjcmlwdGlvbjogc3RyaW5nO1xuXHRmdWxsVGV4dDogc3RyaW5nO1xufTtcblxudHlwZSBCaW5kaW5nSW5mbyA9IHtcblx0cGF0aD86IHN0cmluZztcblx0bW9kZWw/OiBzdHJpbmcgfCBvYmplY3Q7XG5cdHBhcmFtZXRlcnM/OiBBcnJheTxCaW5kaW5nSW5mbz47XG59O1xuXG5leHBvcnQgdHlwZSBEYXRhVG9VcGRhdGVGaWVsZEFuZFNpZGVFZmZlY3RzVHlwZSA9IHtcblx0b0NvbnRyb2xsZXI6IFBhZ2VDb250cm9sbGVyO1xuXHRvRmllbGRQcm9taXNlOiBQcm9taXNlPGFueT47XG5cdHNpZGVFZmZlY3RzTWFwOiBNYXNzRWRpdEZpZWxkU2lkZUVmZmVjdERpY3Rpb25hcnkgfCBGaWVsZFNpZGVFZmZlY3REaWN0aW9uYXJ5O1xuXHR0ZXh0UGF0aHM6IGFueTtcblx0Z3JvdXBJZDogc3RyaW5nO1xuXHRrZXk6IHN0cmluZztcblx0b0VudGl0eVNldENvbnRleHQ6IENvbnRleHQ7XG5cdG9NZXRhTW9kZWw6IGFueTtcblx0b1NlbGVjdGVkQ29udGV4dDogYW55O1xuXHRkZWZlcnJlZFRhcmdldHNGb3JBUXVhbGlmaWVkTmFtZTogYW55O1xufTtcblxuY29uc3QgTWFzc0VkaXRIZWxwZXIgPSB7XG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgdmFsdWUgYXQgZmluYWwgb3IgZGVlcGVzdCBsZXZlbCBwYXRoIHdpdGggYSBibGFuayBhcnJheS5cblx0ICogUmV0dXJuIGFuIGVtcHR5IGFycmF5IHBvaW50aW5nIHRvIHRoZSBmaW5hbCBvciBkZWVwZXN0IGxldmVsIHBhdGguXG5cdCAqXG5cdCAqIEBwYXJhbSBzUGF0aCBQcm9wZXJ0eSBwYXRoXG5cdCAqIEBwYXJhbSBhVmFsdWVzIEFycmF5IGluc3RhbmNlIHdoZXJlIHRoZSBkZWZhdWx0IGRhdGEgbmVlZHMgdG8gYmUgYWRkZWRcblx0ICogQHJldHVybnMgVGhlIGZpbmFsIHBhdGhcblx0ICovXG5cdGluaXRMYXN0TGV2ZWxPZlByb3BlcnR5UGF0aDogZnVuY3Rpb24gKHNQYXRoOiBzdHJpbmcsIGFWYWx1ZXM6IGFueSAvKiwgdHJhbnNDdHg6IENvbnRleHQgKi8pIHtcblx0XHRsZXQgYUZpbmFsUGF0aDogYW55O1xuXHRcdGxldCBpbmRleCA9IDA7XG5cdFx0Y29uc3QgYVBhdGhzID0gc1BhdGguc3BsaXQoXCIvXCIpO1xuXHRcdGxldCBzRnVsbFBhdGggPSBcIlwiO1xuXHRcdGFQYXRocy5mb3JFYWNoKGZ1bmN0aW9uIChzUHJvcGVydHlQYXRoOiBzdHJpbmcpIHtcblx0XHRcdGlmICghYVZhbHVlc1tzUHJvcGVydHlQYXRoXSAmJiBpbmRleCA9PT0gMCkge1xuXHRcdFx0XHRhVmFsdWVzW3NQcm9wZXJ0eVBhdGhdID0ge307XG5cdFx0XHRcdGFGaW5hbFBhdGggPSBhVmFsdWVzW3NQcm9wZXJ0eVBhdGhdO1xuXHRcdFx0XHRzRnVsbFBhdGggPSBzRnVsbFBhdGggKyBzUHJvcGVydHlQYXRoO1xuXHRcdFx0XHRpbmRleCsrO1xuXHRcdFx0fSBlbHNlIGlmICghYUZpbmFsUGF0aFtzUHJvcGVydHlQYXRoXSkge1xuXHRcdFx0XHRzRnVsbFBhdGggPSBgJHtzRnVsbFBhdGh9LyR7c1Byb3BlcnR5UGF0aH1gO1xuXHRcdFx0XHRpZiAoc0Z1bGxQYXRoICE9PSBzUGF0aCkge1xuXHRcdFx0XHRcdGFGaW5hbFBhdGhbc1Byb3BlcnR5UGF0aF0gPSB7fTtcblx0XHRcdFx0XHRhRmluYWxQYXRoID0gYUZpbmFsUGF0aFtzUHJvcGVydHlQYXRoXTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRhRmluYWxQYXRoW3NQcm9wZXJ0eVBhdGhdID0gW107XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gYUZpbmFsUGF0aDtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCB1bmlxdWUgdmFsdWVzIGZvciBnaXZlbiBhcnJheSB2YWx1ZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSBzVmFsdWUgUHJvcGVydHkgdmFsdWVcblx0ICogQHBhcmFtIGluZGV4IEluZGV4IG9mIHRoZSBwcm9wZXJ0eSB2YWx1ZVxuXHQgKiBAcGFyYW0gc2VsZiBJbnN0YW5jZSBvZiB0aGUgYXJyYXlcblx0ICogQHJldHVybnMgVGhlIHVuaXF1ZSB2YWx1ZVxuXHQgKi9cblx0Z2V0VW5pcXVlVmFsdWVzOiBmdW5jdGlvbiAoc1ZhbHVlOiBzdHJpbmcsIGluZGV4OiBudW1iZXIsIHNlbGY6IGFueVtdKSB7XG5cdFx0cmV0dXJuIHNWYWx1ZSAhPSB1bmRlZmluZWQgJiYgc1ZhbHVlICE9IG51bGwgPyBzZWxmLmluZGV4T2Yoc1ZhbHVlKSA9PT0gaW5kZXggOiB1bmRlZmluZWQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIHByb3BlcnR5IHZhbHVlIGZvciBhIG11bHRpLWxldmVsIHBhdGggKGZvciBleGFtcGxlOiBfTWF0ZXJpYWxzL01hdGVyaWFsX0RldGFpbHMgZ2V0cyB0aGUgdmFsdWUgb2YgTWF0ZXJpYWxfRGV0YWlscyB1bmRlciBfTWF0ZXJpYWxzIE9iamVjdCkuXG5cdCAqIFJldHVybnMgdGhlIHByb3BlcnR5VmFsdWUsIHdoaWNoIGNhbiBiZSBvZiBhbnkgdHlwZSAoc3RyaW5nLCBudW1iZXIsIGV0Yy4uKS5cblx0ICpcblx0ICogQHBhcmFtIHNEYXRhUHJvcGVydHlQYXRoIFByb3BlcnR5IHBhdGhcblx0ICogQHBhcmFtIG9WYWx1ZXMgT2JqZWN0IG9mIHByb3BlcnR5IHZhbHVlc1xuXHQgKiBAcmV0dXJucyBUaGUgcHJvcGVydHkgdmFsdWVcblx0ICovXG5cdGdldFZhbHVlRm9yTXVsdGlMZXZlbFBhdGg6IGZ1bmN0aW9uIChzRGF0YVByb3BlcnR5UGF0aDogc3RyaW5nLCBvVmFsdWVzOiBhbnkpIHtcblx0XHRsZXQgcmVzdWx0OiBhbnk7XG5cdFx0aWYgKHNEYXRhUHJvcGVydHlQYXRoICYmIHNEYXRhUHJvcGVydHlQYXRoLmluZGV4T2YoXCIvXCIpID4gMCkge1xuXHRcdFx0Y29uc3QgYVByb3BlcnR5UGF0aHMgPSBzRGF0YVByb3BlcnR5UGF0aC5zcGxpdChcIi9cIik7XG5cdFx0XHRhUHJvcGVydHlQYXRocy5mb3JFYWNoKGZ1bmN0aW9uIChzUGF0aDogc3RyaW5nKSB7XG5cdFx0XHRcdHJlc3VsdCA9IG9WYWx1ZXMgJiYgb1ZhbHVlc1tzUGF0aF0gPyBvVmFsdWVzW3NQYXRoXSA6IHJlc3VsdCAmJiByZXN1bHRbc1BhdGhdO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGtleSBwYXRoIGZvciB0aGUga2V5IG9mIGEgY29tYm8gYm94IHRoYXQgbXVzdCBiZSBzZWxlY3RlZCBpbml0aWFsbHkgd2hlbiB0aGUgZGlhbG9nIG9wZW5zOlxuXHQgKiA9PiBJZiBwcm9wZXJ0eVZhbHVlIGZvciBhbGwgc2VsZWN0ZWQgY29udGV4dHMgaXMgZGlmZmVyZW50LCB0aGVuIDwgS2VlcCBFeGlzdGluZyBWYWx1ZXMgPiBpcyBwcmVzZWxlY3RlZC5cblx0ICogPT4gSWYgcHJvcGVydHlWYWx1ZSBmb3IgYWxsIHNlbGVjdGVkIGNvbnRleHRzIGlzIHRoZSBzYW1lLCB0aGVuIHRoZSBwcm9wZXJ0eVZhbHVlIGlzIHByZXNlbGVjdGVkLlxuXHQgKiA9PiBJZiBwcm9wZXJ0eVZhbHVlIGZvciBhbGwgc2VsZWN0ZWQgY29udGV4dHMgaXMgZW1wdHksIHRoZW4gPCBMZWF2ZSBCbGFuayA+IGlzIHByZXNlbGVjdGVkLlxuXHQgKlxuXHQgKlxuXHQgKiBAcGFyYW0gYUNvbnRleHRzIENvbnRleHRzIGZvciBtYXNzIGVkaXRcblx0ICogQHBhcmFtIHNEYXRhUHJvcGVydHlQYXRoIERhdGEgcHJvcGVydHkgcGF0aFxuXHQgKiBAcmV0dXJucyBUaGUga2V5IHBhdGhcblx0ICovXG5cdGdldERlZmF1bHRTZWxlY3Rpb25QYXRoQ29tYm9Cb3g6IGZ1bmN0aW9uIChhQ29udGV4dHM6IGFueVtdLCBzRGF0YVByb3BlcnR5UGF0aDogc3RyaW5nKSB7XG5cdFx0bGV0IHJlc3VsdDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRcdGlmIChzRGF0YVByb3BlcnR5UGF0aCAmJiBhQ29udGV4dHMubGVuZ3RoID4gMCkge1xuXHRcdFx0Y29uc3Qgb1NlbGVjdGVkQ29udGV4dCA9IGFDb250ZXh0cyxcblx0XHRcdFx0YVByb3BlcnR5VmFsdWVzOiBhbnlbXSA9IFtdO1xuXHRcdFx0b1NlbGVjdGVkQ29udGV4dC5mb3JFYWNoKGZ1bmN0aW9uIChvQ29udGV4dDogYW55KSB7XG5cdFx0XHRcdGNvbnN0IG9EYXRhT2JqZWN0ID0gb0NvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0XHRcdGNvbnN0IHNNdWx0aUxldmVsUGF0aENvbmRpdGlvbiA9XG5cdFx0XHRcdFx0c0RhdGFQcm9wZXJ0eVBhdGguaW5kZXhPZihcIi9cIikgPiAtMSAmJiBvRGF0YU9iamVjdC5oYXNPd25Qcm9wZXJ0eShzRGF0YVByb3BlcnR5UGF0aC5zcGxpdChcIi9cIilbMF0pO1xuXHRcdFx0XHRpZiAob0NvbnRleHQgJiYgKG9EYXRhT2JqZWN0Lmhhc093blByb3BlcnR5KHNEYXRhUHJvcGVydHlQYXRoKSB8fCBzTXVsdGlMZXZlbFBhdGhDb25kaXRpb24pKSB7XG5cdFx0XHRcdFx0YVByb3BlcnR5VmFsdWVzLnB1c2gob0NvbnRleHQuZ2V0T2JqZWN0KHNEYXRhUHJvcGVydHlQYXRoKSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0Y29uc3QgYVVuaXF1ZVByb3BlcnR5VmFsdWVzID0gYVByb3BlcnR5VmFsdWVzLmZpbHRlcihNYXNzRWRpdEhlbHBlci5nZXRVbmlxdWVWYWx1ZXMpO1xuXHRcdFx0aWYgKGFVbmlxdWVQcm9wZXJ0eVZhbHVlcy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdHJlc3VsdCA9IGBEZWZhdWx0LyR7c0RhdGFQcm9wZXJ0eVBhdGh9YDtcblx0XHRcdH0gZWxzZSBpZiAoYVVuaXF1ZVByb3BlcnR5VmFsdWVzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRyZXN1bHQgPSBgRW1wdHkvJHtzRGF0YVByb3BlcnR5UGF0aH1gO1xuXHRcdFx0fSBlbHNlIGlmIChhVW5pcXVlUHJvcGVydHlWYWx1ZXMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdHJlc3VsdCA9IGAke3NEYXRhUHJvcGVydHlQYXRofS8ke2FVbmlxdWVQcm9wZXJ0eVZhbHVlc1swXX1gO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaGlkZGVuIGFubm90YXRpb24gdmFsdWUgW2JvdGggc3RhdGljIGFuZCBwYXRoIGJhc2VkXSBmb3IgdGFibGUncyBzZWxlY3RlZCBjb250ZXh0LlxuXHQgKlxuXHQgKiBAcGFyYW0gaGlkZGVuVmFsdWUgSGlkZGVuIGFubm90YXRpb24gdmFsdWUgLyBwYXRoIGZvciBmaWVsZFxuXHQgKiBAcGFyYW0gYUNvbnRleHRzIENvbnRleHRzIGZvciBtYXNzIGVkaXRcblx0ICogQHJldHVybnMgVGhlIGhpZGRlbiBhbm5vdGF0aW9uIHZhbHVlXG5cdCAqL1xuXHRnZXRIaWRkZW5WYWx1ZUZvckNvbnRleHRzOiBmdW5jdGlvbiAoaGlkZGVuVmFsdWU6IGFueSwgYUNvbnRleHRzOiBhbnlbXSkge1xuXHRcdGlmIChoaWRkZW5WYWx1ZSAmJiBoaWRkZW5WYWx1ZS4kUGF0aCkge1xuXHRcdFx0cmV0dXJuICFhQ29udGV4dHMuc29tZShmdW5jdGlvbiAob1NlbGVjdGVkQ29udGV4dDogYW55KSB7XG5cdFx0XHRcdHJldHVybiBvU2VsZWN0ZWRDb250ZXh0LmdldE9iamVjdChoaWRkZW5WYWx1ZS4kUGF0aCkgPT09IGZhbHNlO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBoaWRkZW5WYWx1ZTtcblx0fSxcblxuXHRnZXRJbnB1dFR5cGU6IGZ1bmN0aW9uIChwcm9wZXJ0eUluZm86IGFueSwgZGF0YUZpZWxkQ29udmVydGVkOiBhbnksIG9EYXRhTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogc3RyaW5nIHtcblx0XHRjb25zdCBlZGl0U3R5bGVQcm9wZXJ0aWVzID0ge30gYXMgRmllbGRQcm9wZXJ0aWVzO1xuXHRcdGxldCBpbnB1dFR5cGUhOiBzdHJpbmc7XG5cdFx0aWYgKHByb3BlcnR5SW5mbykge1xuXHRcdFx0c2V0RWRpdFN0eWxlUHJvcGVydGllcyhlZGl0U3R5bGVQcm9wZXJ0aWVzLCBkYXRhRmllbGRDb252ZXJ0ZWQsIG9EYXRhTW9kZWxQYXRoLCB0cnVlKTtcblx0XHRcdGlucHV0VHlwZSA9IGVkaXRTdHlsZVByb3BlcnRpZXM/LmVkaXRTdHlsZSB8fCBcIlwiO1xuXHRcdH1cblx0XHRjb25zdCBpc1ZhbGlkRm9yTWFzc0VkaXQgPVxuXHRcdFx0aW5wdXRUeXBlICYmXG5cdFx0XHRbXCJEYXRlUGlja2VyXCIsIFwiVGltZVBpY2tlclwiLCBcIkRhdGVUaW1lUGlja2VyXCIsIFwiUmF0aW5nSW5kaWNhdG9yXCJdLmluZGV4T2YoaW5wdXRUeXBlKSA9PT0gLTEgJiZcblx0XHRcdCFpc011bHRpVmFsdWVGaWVsZChvRGF0YU1vZGVsUGF0aCkgJiZcblx0XHRcdCFoYXNWYWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXMocHJvcGVydHlJbmZvKTtcblxuXHRcdHJldHVybiAoaXNWYWxpZEZvck1hc3NFZGl0IHx8IFwiXCIpICYmIGlucHV0VHlwZTtcblx0fSxcblxuXHRnZXRJc0ZpZWxkR3JwOiBmdW5jdGlvbiAoZGF0YUZpZWxkQ29udmVydGVkOiBhbnkpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0ZGF0YUZpZWxkQ29udmVydGVkICYmXG5cdFx0XHRkYXRhRmllbGRDb252ZXJ0ZWQuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQW5ub3RhdGlvblwiICYmXG5cdFx0XHRkYXRhRmllbGRDb252ZXJ0ZWQuVGFyZ2V0ICYmXG5cdFx0XHRkYXRhRmllbGRDb252ZXJ0ZWQuVGFyZ2V0LnZhbHVlICYmXG5cdFx0XHRkYXRhRmllbGRDb252ZXJ0ZWQuVGFyZ2V0LnZhbHVlLmluZGV4T2YoXCJGaWVsZEdyb3VwXCIpID4gLTFcblx0XHQpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgdGV4dCBwYXRoIGZvciB0aGUgbWFzcyBlZGl0IGZpZWxkLlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJvcGVydHkgUHJvcGVydHkgcGF0aFxuXHQgKiBAcGFyYW0gdGV4dEJpbmRpbmcgVGV4dCBCaW5kaW5nIEluZm9cblx0ICogQHBhcmFtIGRpc3BsYXlNb2RlIERpc3BsYXkgbW9kZVxuXHQgKiBAcmV0dXJucyBUZXh0IFByb3BlcnR5IFBhdGggaWYgaXQgZXhpc3RzXG5cdCAqL1xuXHRnZXRUZXh0UGF0aDogZnVuY3Rpb24gKHByb3BlcnR5OiBzdHJpbmcsIHRleHRCaW5kaW5nOiBhbnksIGRpc3BsYXlNb2RlOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRcdGxldCBkZXNjcmlwdGlvblBhdGg7XG5cdFx0aWYgKHRleHRCaW5kaW5nICYmICh0ZXh0QmluZGluZy5wYXRoIHx8ICh0ZXh0QmluZGluZy5wYXJhbWV0ZXJzICYmIHRleHRCaW5kaW5nLnBhcmFtZXRlcnMubGVuZ3RoKSkgJiYgcHJvcGVydHkpIHtcblx0XHRcdGlmICh0ZXh0QmluZGluZy5wYXRoICYmIGRpc3BsYXlNb2RlID09PSBcIkRlc2NyaXB0aW9uXCIpIHtcblx0XHRcdFx0ZGVzY3JpcHRpb25QYXRoID0gdGV4dEJpbmRpbmcucGF0aDtcblx0XHRcdH0gZWxzZSBpZiAodGV4dEJpbmRpbmcucGFyYW1ldGVycykge1xuXHRcdFx0XHR0ZXh0QmluZGluZy5wYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gKHByb3BzOiBCaW5kaW5nSW5mbykge1xuXHRcdFx0XHRcdGlmIChwcm9wcy5wYXRoICYmIHByb3BzLnBhdGggIT09IHByb3BlcnR5KSB7XG5cdFx0XHRcdFx0XHRkZXNjcmlwdGlvblBhdGggPSBwcm9wcy5wYXRoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBkZXNjcmlwdGlvblBhdGg7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemVzIGEgSlNPTiBNb2RlbCBmb3IgcHJvcGVydGllcyBvZiBkaWFsb2cgZmllbGRzIFtsYWJlbCwgdmlzaWJsaXR5LCBkYXRhcHJvcGVydHksIGV0Yy5dLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1RhYmxlIEluc3RhbmNlIG9mIFRhYmxlXG5cdCAqIEBwYXJhbSBhQ29udGV4dHMgQ29udGV4dHMgZm9yIG1hc3MgZWRpdFxuXHQgKiBAcGFyYW0gYURhdGFBcnJheSBBcnJheSBjb250YWluaW5nIGRhdGEgcmVsYXRlZCB0byB0aGUgZGlhbG9nIHVzZWQgYnkgYm90aCB0aGUgc3RhdGljIGFuZCB0aGUgcnVudGltZSBtb2RlbFxuXHQgKiBAcmV0dXJucyBUaGUgbW9kZWxcblx0ICovXG5cdHByZXBhcmVEYXRhRm9yRGlhbG9nOiBmdW5jdGlvbiAob1RhYmxlOiBUYWJsZSwgYUNvbnRleHRzOiBhbnlbXSwgYURhdGFBcnJheTogYW55W10pIHtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb1RhYmxlICYmIChvVGFibGUuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBhbnkpLFxuXHRcdFx0c0N1cnJlbnRFbnRpdHlTZXROYW1lID0gb1RhYmxlLmRhdGEoXCJtZXRhUGF0aFwiKSxcblx0XHRcdGFUYWJsZUZpZWxkcyA9IE1hc3NFZGl0SGVscGVyLmdldFRhYmxlRmllbGRzKG9UYWJsZSksXG5cdFx0XHRvRW50aXR5VHlwZUNvbnRleHQgPSBvTWV0YU1vZGVsLmdldENvbnRleHQoYCR7c0N1cnJlbnRFbnRpdHlTZXROYW1lfS9AYCksXG5cdFx0XHRvRW50aXR5U2V0Q29udGV4dCA9IG9NZXRhTW9kZWwuZ2V0Q29udGV4dChzQ3VycmVudEVudGl0eVNldE5hbWUpLFxuXHRcdFx0b0RhdGFNb2RlbE9iamVjdFBhdGggPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMob0VudGl0eVR5cGVDb250ZXh0KTtcblxuXHRcdGNvbnN0IG9EYXRhRmllbGRNb2RlbCA9IG5ldyBKU09OTW9kZWwoKTtcblx0XHRsZXQgb1Jlc3VsdDtcblx0XHRsZXQgc0xhYmVsVGV4dDtcblx0XHRsZXQgYlZhbHVlSGVscEVuYWJsZWQ7XG5cdFx0bGV0IHNVbml0UHJvcGVydHlQYXRoO1xuXHRcdGxldCBiVmFsdWVIZWxwRW5hYmxlZEZvclVuaXQ7XG5cdFx0bGV0IG9UZXh0QmluZGluZztcblxuXHRcdGFUYWJsZUZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChvQ29sdW1uSW5mbzogYW55KSB7XG5cdFx0XHRjb25zdCBzRGF0YVByb3BlcnR5UGF0aCA9IG9Db2x1bW5JbmZvLmRhdGFQcm9wZXJ0eTtcblx0XHRcdGlmIChzRGF0YVByb3BlcnR5UGF0aCkge1xuXHRcdFx0XHRsZXQgb1Byb3BlcnR5SW5mbyA9IHNEYXRhUHJvcGVydHlQYXRoICYmIG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NDdXJyZW50RW50aXR5U2V0TmFtZX0vJHtzRGF0YVByb3BlcnR5UGF0aH1AYCk7XG5cdFx0XHRcdHNMYWJlbFRleHQgPVxuXHRcdFx0XHRcdG9Db2x1bW5JbmZvLmxhYmVsIHx8IChvUHJvcGVydHlJbmZvICYmIG9Qcm9wZXJ0eUluZm9bXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxhYmVsXCJdKSB8fCBzRGF0YVByb3BlcnR5UGF0aDtcblxuXHRcdFx0XHRpZiAob0RhdGFNb2RlbE9iamVjdFBhdGgpIHtcblx0XHRcdFx0XHRvRGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QgPSBvRGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRFbnRpdHlUeXBlLmVudGl0eVByb3BlcnRpZXMuZmlsdGVyKGZ1bmN0aW9uIChcblx0XHRcdFx0XHRcdG9Qcm9wZXJ0eTogYW55XG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb1Byb3BlcnR5Lm5hbWUgPT09IHNEYXRhUHJvcGVydHlQYXRoO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG9EYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCA9IG9EYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdFswXSB8fCB7fTtcblx0XHRcdFx0b1RleHRCaW5kaW5nID0gZ2V0VGV4dEJpbmRpbmcob0RhdGFNb2RlbE9iamVjdFBhdGgsIHt9LCB0cnVlKSB8fCB7fTtcblx0XHRcdFx0Y29uc3Qgb0ZpZWxkQ29udGV4dCA9IG9NZXRhTW9kZWwuZ2V0Q29udGV4dChvQ29sdW1uSW5mby5hbm5vdGF0aW9uUGF0aCksXG5cdFx0XHRcdFx0b0RhdGFGaWVsZENvbnZlcnRlZCA9IGNvbnZlcnRNZXRhTW9kZWxDb250ZXh0KG9GaWVsZENvbnRleHQpLFxuXHRcdFx0XHRcdG9Qcm9wZXJ0eUNvbnRleHQgPSBvTWV0YU1vZGVsLmdldENvbnRleHQoYCR7c0N1cnJlbnRFbnRpdHlTZXROYW1lfS8ke3NEYXRhUHJvcGVydHlQYXRofUBgKSxcblx0XHRcdFx0XHRvSW50ZXJmYWNlID0gb1Byb3BlcnR5Q29udGV4dCAmJiBvUHJvcGVydHlDb250ZXh0LmdldEludGVyZmFjZSgpO1xuXG5cdFx0XHRcdGxldCBvRGF0YU1vZGVsUGF0aCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhvRmllbGRDb250ZXh0LCBvRW50aXR5U2V0Q29udGV4dCk7XG5cdFx0XHRcdGlmIChvRGF0YUZpZWxkQ29udmVydGVkPy5WYWx1ZT8ucGF0aD8ubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdG9EYXRhTW9kZWxQYXRoID0gZW5oYW5jZURhdGFNb2RlbFBhdGgob0RhdGFNb2RlbFBhdGgsIHNEYXRhUHJvcGVydHlQYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBiSGlkZGVuRmllbGQgPVxuXHRcdFx0XHRcdE1hc3NFZGl0SGVscGVyLmdldEhpZGRlblZhbHVlRm9yQ29udGV4dHMoXG5cdFx0XHRcdFx0XHRvRmllbGRDb250ZXh0ICYmIG9GaWVsZENvbnRleHQuZ2V0T2JqZWN0KClbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuXCJdLFxuXHRcdFx0XHRcdFx0YUNvbnRleHRzXG5cdFx0XHRcdFx0KSB8fCBmYWxzZTtcblx0XHRcdFx0Y29uc3QgaXNJbWFnZSA9IG9Qcm9wZXJ0eUluZm8gJiYgb1Byb3BlcnR5SW5mb1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Jc0ltYWdlVVJMXCJdO1xuXG5cdFx0XHRcdG9JbnRlcmZhY2UuY29udGV4dCA9IHtcblx0XHRcdFx0XHRnZXRNb2RlbDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9JbnRlcmZhY2UuZ2V0TW9kZWwoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGdldFBhdGg6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdHJldHVybiBgJHtzQ3VycmVudEVudGl0eVNldE5hbWV9LyR7c0RhdGFQcm9wZXJ0eVBhdGh9YDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cdFx0XHRcdG9Qcm9wZXJ0eUluZm8gPSBpc1Byb3BlcnR5KG9EYXRhRmllbGRDb252ZXJ0ZWQpXG5cdFx0XHRcdFx0PyBvRGF0YUZpZWxkQ29udmVydGVkXG5cdFx0XHRcdFx0OiBvRGF0YUZpZWxkQ29udmVydGVkPy5WYWx1ZT8uJHRhcmdldCA/PyBvRGF0YUZpZWxkQ29udmVydGVkPy5UYXJnZXQ/LiR0YXJnZXQ7XG5cdFx0XHRcdC8vIERhdGFmaWVsZCBpcyBub3QgaW5jbHVkZWQgaW4gdGhlIEZpZWxkQ29udHJvbCBjYWxjdWxhdGlvbiwgbmVlZHMgdG8gYmUgaW1wbGVtZW50ZWRcblxuXHRcdFx0XHRjb25zdCBjaGFydFByb3BlcnR5ID0gb1Byb3BlcnR5SW5mbyAmJiBvUHJvcGVydHlJbmZvLnRlcm0gJiYgb1Byb3BlcnR5SW5mby50ZXJtID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0XCI7XG5cdFx0XHRcdGNvbnN0IGlzQWN0aW9uID0gISFvRGF0YUZpZWxkQ29udmVydGVkLkFjdGlvbjtcblx0XHRcdFx0Y29uc3QgaXNGaWVsZEdycCA9IE1hc3NFZGl0SGVscGVyLmdldElzRmllbGRHcnAob0RhdGFGaWVsZENvbnZlcnRlZCk7XG5cdFx0XHRcdGlmIChpc0ltYWdlIHx8IGJIaWRkZW5GaWVsZCB8fCBjaGFydFByb3BlcnR5IHx8IGlzQWN0aW9uIHx8IGlzRmllbGRHcnApIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBWYWx1ZUhlbHAgcHJvcGVydGllc1xuXHRcdFx0XHRzVW5pdFByb3BlcnR5UGF0aCA9XG5cdFx0XHRcdFx0KChoYXNDdXJyZW5jeShvUHJvcGVydHlJbmZvKSB8fCBoYXNVbml0KG9Qcm9wZXJ0eUluZm8pKSAmJiBnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5UGF0aChvUHJvcGVydHlJbmZvKSkgfHwgXCJcIjtcblx0XHRcdFx0Y29uc3QgdW5pdFByb3BlcnR5SW5mbyA9IHNVbml0UHJvcGVydHlQYXRoICYmIGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHkob1Byb3BlcnR5SW5mbyk7XG5cdFx0XHRcdGJWYWx1ZUhlbHBFbmFibGVkID0gaGFzVmFsdWVIZWxwKG9Qcm9wZXJ0eUluZm8pO1xuXHRcdFx0XHRiVmFsdWVIZWxwRW5hYmxlZEZvclVuaXQgPSB1bml0UHJvcGVydHlJbmZvICYmIGhhc1ZhbHVlSGVscCh1bml0UHJvcGVydHlJbmZvKTtcblxuXHRcdFx0XHRjb25zdCBoYXNDb250ZXh0RGVwZW5kZW50VkggPVxuXHRcdFx0XHRcdChiVmFsdWVIZWxwRW5hYmxlZCB8fCBiVmFsdWVIZWxwRW5hYmxlZEZvclVuaXQpICYmXG5cdFx0XHRcdFx0KG9Qcm9wZXJ0eUluZm8/LmFubm90YXRpb25zPy5Db21tb24/LlZhbHVlTGlzdFJlbGV2YW50UXVhbGlmaWVycyB8fFxuXHRcdFx0XHRcdFx0KHVuaXRQcm9wZXJ0eUluZm8gJiYgdW5pdFByb3BlcnR5SW5mbz8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVmFsdWVMaXN0UmVsZXZhbnRRdWFsaWZpZXJzKSk7XG5cdFx0XHRcdGlmIChoYXNDb250ZXh0RGVwZW5kZW50VkgpIHtcblx0XHRcdFx0XHQvLyBjb250ZXh0IGRlcGVuZGVudCBWSCBpcyBub3Qgc3VwcG9ydGVkIGZvciBNYXNzIEVkaXQuXG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gRWRpdE1vZGUgYW5kIElucHV0VHlwZVxuXHRcdFx0XHRjb25zdCBwcm9wZXJ0eUZvckZpZWxkQ29udHJvbCA9IG9Qcm9wZXJ0eUluZm8gJiYgb1Byb3BlcnR5SW5mby5WYWx1ZSA/IG9Qcm9wZXJ0eUluZm8uVmFsdWUgOiBvUHJvcGVydHlJbmZvO1xuXHRcdFx0XHRjb25zdCBleHBCaW5kaW5nID0gZ2V0RWRpdE1vZGUocHJvcGVydHlGb3JGaWVsZENvbnRyb2wsIG9EYXRhTW9kZWxQYXRoLCBmYWxzZSwgZmFsc2UsIG9EYXRhRmllbGRDb252ZXJ0ZWQsIGNvbnN0YW50KHRydWUpKTtcblx0XHRcdFx0Y29uc3QgZWRpdE1vZGVWYWx1ZXMgPSBPYmplY3Qua2V5cyhFZGl0TW9kZSk7XG5cdFx0XHRcdGNvbnN0IGVkaXRNb2RlSXNTdGF0aWMgPSAhIWV4cEJpbmRpbmcgJiYgZWRpdE1vZGVWYWx1ZXMuaW5jbHVkZXMoZXhwQmluZGluZyBhcyBFZGl0TW9kZSk7XG5cdFx0XHRcdGNvbnN0IGVkaXRhYmxlID0gISFleHBCaW5kaW5nICYmICgoZWRpdE1vZGVJc1N0YXRpYyAmJiBleHBCaW5kaW5nID09PSBFZGl0TW9kZS5FZGl0YWJsZSkgfHwgIWVkaXRNb2RlSXNTdGF0aWMpO1xuXHRcdFx0XHRjb25zdCBuYXZQcm9wZXJ0eVdpdGhWYWx1ZUhlbHAgPSBzRGF0YVByb3BlcnR5UGF0aC5pbmNsdWRlcyhcIi9cIikgJiYgYlZhbHVlSGVscEVuYWJsZWQ7XG5cdFx0XHRcdGlmICghZWRpdGFibGUgfHwgbmF2UHJvcGVydHlXaXRoVmFsdWVIZWxwKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgaW5wdXRUeXBlID0gTWFzc0VkaXRIZWxwZXIuZ2V0SW5wdXRUeXBlKG9Qcm9wZXJ0eUluZm8sIG9EYXRhRmllbGRDb252ZXJ0ZWQsIG9EYXRhTW9kZWxQYXRoKTtcblxuXHRcdFx0XHRpZiAoaW5wdXRUeXBlKSB7XG5cdFx0XHRcdFx0Y29uc3QgcmVsYXRpdmVQYXRoID0gZ2V0UmVsYXRpdmVQYXRocyhvRGF0YU1vZGVsUGF0aCk7XG5cdFx0XHRcdFx0Y29uc3QgaXNSZWFkT25seSA9IGlzUmVhZE9ubHlFeHByZXNzaW9uKG9Qcm9wZXJ0eUluZm8sIHJlbGF0aXZlUGF0aCk7XG5cdFx0XHRcdFx0Y29uc3QgZGlzcGxheU1vZGUgPSBDb21tb25VdGlscy5jb21wdXRlRGlzcGxheU1vZGUob1Byb3BlcnR5Q29udGV4dC5nZXRPYmplY3QoKSk7XG5cdFx0XHRcdFx0Y29uc3QgaXNWYWx1ZUhlbHBFbmFibGVkID0gYlZhbHVlSGVscEVuYWJsZWQgPyBiVmFsdWVIZWxwRW5hYmxlZCA6IGZhbHNlO1xuXHRcdFx0XHRcdGNvbnN0IGlzVmFsdWVIZWxwRW5hYmxlZEZvclVuaXQgPVxuXHRcdFx0XHRcdFx0YlZhbHVlSGVscEVuYWJsZWRGb3JVbml0ICYmICFzVW5pdFByb3BlcnR5UGF0aC5pbmNsdWRlcyhcIi9cIikgPyBiVmFsdWVIZWxwRW5hYmxlZEZvclVuaXQgOiBmYWxzZTtcblx0XHRcdFx0XHRjb25zdCB1bml0UHJvcGVydHkgPSBzVW5pdFByb3BlcnR5UGF0aCAmJiAhc0RhdGFQcm9wZXJ0eVBhdGguaW5jbHVkZXMoXCIvXCIpID8gc1VuaXRQcm9wZXJ0eVBhdGggOiBmYWxzZTtcblxuXHRcdFx0XHRcdG9SZXN1bHQgPSB7XG5cdFx0XHRcdFx0XHRsYWJlbDogc0xhYmVsVGV4dCxcblx0XHRcdFx0XHRcdGRhdGFQcm9wZXJ0eTogc0RhdGFQcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdFx0XHRpc1ZhbHVlSGVscEVuYWJsZWQ6IGJWYWx1ZUhlbHBFbmFibGVkID8gYlZhbHVlSGVscEVuYWJsZWQgOiBmYWxzZSxcblx0XHRcdFx0XHRcdHVuaXRQcm9wZXJ0eSxcblx0XHRcdFx0XHRcdGlzRmllbGRSZXF1aXJlZDogZ2V0UmVxdWlyZWRFeHByZXNzaW9uKG9Qcm9wZXJ0eUluZm8sIG9EYXRhRmllbGRDb252ZXJ0ZWQsIHRydWUsIGZhbHNlLCB7fSwgb0RhdGFNb2RlbFBhdGgpLFxuXHRcdFx0XHRcdFx0ZGVmYXVsdFNlbGVjdGlvblBhdGg6IHNEYXRhUHJvcGVydHlQYXRoXG5cdFx0XHRcdFx0XHRcdD8gTWFzc0VkaXRIZWxwZXIuZ2V0RGVmYXVsdFNlbGVjdGlvblBhdGhDb21ib0JveChhQ29udGV4dHMsIHNEYXRhUHJvcGVydHlQYXRoKVxuXHRcdFx0XHRcdFx0XHQ6IGZhbHNlLFxuXHRcdFx0XHRcdFx0ZGVmYXVsdFNlbGVjdGlvblVuaXRQYXRoOiBzVW5pdFByb3BlcnR5UGF0aFxuXHRcdFx0XHRcdFx0XHQ/IE1hc3NFZGl0SGVscGVyLmdldERlZmF1bHRTZWxlY3Rpb25QYXRoQ29tYm9Cb3goYUNvbnRleHRzLCBzVW5pdFByb3BlcnR5UGF0aClcblx0XHRcdFx0XHRcdFx0OiBmYWxzZSxcblx0XHRcdFx0XHRcdGVudGl0eVNldDogc0N1cnJlbnRFbnRpdHlTZXROYW1lLFxuXHRcdFx0XHRcdFx0ZGlzcGxheTogZGlzcGxheU1vZGUsXG5cdFx0XHRcdFx0XHRkZXNjcmlwdGlvblBhdGg6IE1hc3NFZGl0SGVscGVyLmdldFRleHRQYXRoKHNEYXRhUHJvcGVydHlQYXRoLCBvVGV4dEJpbmRpbmcsIGRpc3BsYXlNb2RlKSxcblx0XHRcdFx0XHRcdG51bGxhYmxlOiBvUHJvcGVydHlJbmZvLm51bGxhYmxlICE9PSB1bmRlZmluZWQgPyBvUHJvcGVydHlJbmZvLm51bGxhYmxlIDogdHJ1ZSxcblx0XHRcdFx0XHRcdGlzUHJvcGVydHlSZWFkT25seTogaXNSZWFkT25seSAhPT0gdW5kZWZpbmVkID8gaXNSZWFkT25seSA6IGZhbHNlLFxuXHRcdFx0XHRcdFx0aW5wdXRUeXBlOiBpbnB1dFR5cGUsXG5cdFx0XHRcdFx0XHRlZGl0TW9kZTogZWRpdGFibGUgPyBleHBCaW5kaW5nIDogdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0cHJvcGVydHlJbmZvOiB7XG5cdFx0XHRcdFx0XHRcdGhhc1ZIOiBpc1ZhbHVlSGVscEVuYWJsZWQsXG5cdFx0XHRcdFx0XHRcdHJ1bnRpbWVQYXRoOiBcImZpZWxkc0luZm8+L3ZhbHVlcy9cIixcblx0XHRcdFx0XHRcdFx0cmVsYXRpdmVQYXRoOiBzRGF0YVByb3BlcnR5UGF0aCxcblx0XHRcdFx0XHRcdFx0cHJvcGVydHlGdWxseVF1YWxpZmllZE5hbWU6IG9Qcm9wZXJ0eUluZm8uZnVsbHlRdWFsaWZpZWROYW1lLFxuXHRcdFx0XHRcdFx0XHRwcm9wZXJ0eVBhdGhGb3JWYWx1ZUhlbHA6IGAke3NDdXJyZW50RW50aXR5U2V0TmFtZX0vJHtzRGF0YVByb3BlcnR5UGF0aH1gXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0dW5pdEluZm86IHVuaXRQcm9wZXJ0eSAmJiB7XG5cdFx0XHRcdFx0XHRcdGhhc1ZIOiBpc1ZhbHVlSGVscEVuYWJsZWRGb3JVbml0LFxuXHRcdFx0XHRcdFx0XHRydW50aW1lUGF0aDogXCJmaWVsZHNJbmZvPi91bml0RGF0YS9cIixcblx0XHRcdFx0XHRcdFx0cmVsYXRpdmVQYXRoOiB1bml0UHJvcGVydHksXG5cdFx0XHRcdFx0XHRcdHByb3BlcnR5UGF0aEZvclZhbHVlSGVscDogYCR7c0N1cnJlbnRFbnRpdHlTZXROYW1lfS8ke3VuaXRQcm9wZXJ0eX1gXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRhRGF0YUFycmF5LnB1c2gob1Jlc3VsdCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRvRGF0YUZpZWxkTW9kZWwuc2V0RGF0YShhRGF0YUFycmF5KTtcblx0XHRyZXR1cm4gb0RhdGFGaWVsZE1vZGVsO1xuXHR9LFxuXG5cdGdldFRhYmxlRmllbGRzOiBmdW5jdGlvbiAob1RhYmxlOiBhbnkpIHtcblx0XHRjb25zdCBhQ29sdW1ucyA9IChvVGFibGUgJiYgb1RhYmxlLmdldENvbHVtbnMoKSkgfHwgW107XG5cdFx0Y29uc3QgY29sdW1uc0RhdGEgPSBvVGFibGUgJiYgb1RhYmxlLmdldFBhcmVudCgpLmdldFRhYmxlRGVmaW5pdGlvbigpLmNvbHVtbnM7XG5cdFx0cmV0dXJuIGFDb2x1bW5zLm1hcChmdW5jdGlvbiAob0NvbHVtbjogYW55KSB7XG5cdFx0XHRjb25zdCBzRGF0YVByb3BlcnR5ID0gb0NvbHVtbiAmJiBvQ29sdW1uLmdldERhdGFQcm9wZXJ0eSgpLFxuXHRcdFx0XHRhUmVhbHRlZENvbHVtbkluZm8gPVxuXHRcdFx0XHRcdGNvbHVtbnNEYXRhICYmXG5cdFx0XHRcdFx0Y29sdW1uc0RhdGEuZmlsdGVyKGZ1bmN0aW9uIChvQ29sdW1uSW5mbzogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb0NvbHVtbkluZm8ubmFtZSA9PT0gc0RhdGFQcm9wZXJ0eSAmJiBvQ29sdW1uSW5mby50eXBlID09PSBcIkFubm90YXRpb25cIjtcblx0XHRcdFx0XHR9KTtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGRhdGFQcm9wZXJ0eTogc0RhdGFQcm9wZXJ0eSxcblx0XHRcdFx0bGFiZWw6IG9Db2x1bW4uZ2V0SGVhZGVyKCksXG5cdFx0XHRcdGFubm90YXRpb25QYXRoOiBhUmVhbHRlZENvbHVtbkluZm8gJiYgYVJlYWx0ZWRDb2x1bW5JbmZvWzBdICYmIGFSZWFsdGVkQ29sdW1uSW5mb1swXS5hbm5vdGF0aW9uUGF0aFxuXHRcdFx0fTtcblx0XHR9KTtcblx0fSxcblxuXHRnZXREZWZhdWx0VGV4dHNGb3JEaWFsb2c6IGZ1bmN0aW9uIChvUmVzb3VyY2VCdW5kbGU6IGFueSwgaVNlbGVjdGVkQ29udGV4dHM6IGFueSwgb1RhYmxlOiBhbnkpIHtcblx0XHQvLyBUaGUgY29uZmlybSBidXR0b24gdGV4dCBpcyBcIlNhdmVcIiBmb3IgdGFibGUgaW4gRGlzcGxheSBtb2RlIGFuZCBcIkFwcGx5XCIgZm9yIHRhYmxlIGluIGVkaXQgbW9kZS4gVGhpcyBjYW4gYmUgbGF0ZXIgZXhwb3NlZCBpZiBuZWVkZWQuXG5cdFx0Y29uc3QgYkRpc3BsYXlNb2RlID0gb1RhYmxlLmRhdGEoXCJkaXNwbGF5TW9kZVByb3BlcnR5QmluZGluZ1wiKSA9PT0gXCJ0cnVlXCI7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0a2VlcEV4aXN0aW5nUHJlZml4OiBcIjwgS2VlcFwiLFxuXHRcdFx0bGVhdmVCbGFua1ZhbHVlOiBcIjwgTGVhdmUgQmxhbmsgPlwiLFxuXHRcdFx0Y2xlYXJGaWVsZFZhbHVlOiBcIjwgQ2xlYXIgVmFsdWVzID5cIixcblx0XHRcdG1hc3NFZGl0VGl0bGU6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19NQVNTX0VESVRfRElBTE9HX1RJVExFXCIsIGlTZWxlY3RlZENvbnRleHRzLnRvU3RyaW5nKCkpLFxuXHRcdFx0YXBwbHlCdXR0b25UZXh0OiBiRGlzcGxheU1vZGVcblx0XHRcdFx0PyBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUFTU19FRElUX1NBVkVfQlVUVE9OX1RFWFRcIilcblx0XHRcdFx0OiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUFTU19FRElUX0FQUExZX0JVVFRPTl9URVhUXCIpLFxuXHRcdFx0dXNlVmFsdWVIZWxwVmFsdWU6IFwiPCBVc2UgVmFsdWUgSGVscCA+XCIsXG5cdFx0XHRjYW5jZWxCdXR0b25UZXh0OiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX09CSkVDVF9QQUdFX0NBTkNFTFwiKSxcblx0XHRcdG5vRmllbGRzOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUFTU19FRElUX05PX0VESVRBQkxFX0ZJRUxEU1wiKSxcblx0XHRcdG9rQnV0dG9uVGV4dDogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9ESUFMT0dfT0tcIilcblx0XHR9O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBBZGRzIGEgc3VmZml4IHRvIHRoZSAna2VlcCBleGlzdGluZycgcHJvcGVydHkgb2YgdGhlIGNvbWJvQm94LlxuXHQgKlxuXHQgKiBAcGFyYW0gc0lucHV0VHlwZSBJbnB1dFR5cGUgb2YgdGhlIGZpZWxkXG5cdCAqIEByZXR1cm5zIFRoZSBtb2RpZmllZCBzdHJpbmdcblx0ICovXG5cdC8vIGdldFN1ZmZpeEZvcktlZXBFeGlzaXRpbmc6IGZ1bmN0aW9uIChzSW5wdXRUeXBlOiBzdHJpbmcpIHtcblx0Ly8gXHRsZXQgc1Jlc3VsdCA9IFwiVmFsdWVzXCI7XG5cblx0Ly8gXHRzd2l0Y2ggKHNJbnB1dFR5cGUpIHtcblx0Ly8gXHRcdC8vVE9ETyAtIEFkZCBmb3Igb3RoZXIgY29udHJvbCB0eXBlcyBhcyB3ZWxsIChSYWRpbyBCdXR0b24sIEVtYWlsLCBJbnB1dCwgTURDIEZpZWxkcywgSW1hZ2UgZXRjLilcblx0Ly8gXHRcdGNhc2UgXCJEYXRlUGlja2VyXCI6XG5cdC8vIFx0XHRcdHNSZXN1bHQgPSBcIkRhdGVzXCI7XG5cdC8vIFx0XHRcdGJyZWFrO1xuXHQvLyBcdFx0Y2FzZSBcIkNoZWNrQm94XCI6XG5cdC8vIFx0XHRcdHNSZXN1bHQgPSBcIlNldHRpbmdzXCI7XG5cdC8vIFx0XHRcdGJyZWFrO1xuXHQvLyBcdFx0ZGVmYXVsdDpcblx0Ly8gXHRcdFx0c1Jlc3VsdCA9IFwiVmFsdWVzXCI7XG5cdC8vIFx0fVxuXHQvLyBcdHJldHVybiBzUmVzdWx0O1xuXHQvLyB9LFxuXG5cdC8qKlxuXHQgKiBBZGRzIGRlZmF1bHQgdmFsdWVzIHRvIHRoZSBtb2RlbCBbS2VlcCBFeGlzdGluZyBWYWx1ZXMsIExlYXZlIEJsYW5rXS5cblx0ICpcblx0ICogQHBhcmFtIGFWYWx1ZXMgQXJyYXkgaW5zdGFuY2Ugd2hlcmUgdGhlIGRlZmF1bHQgZGF0YSBuZWVkcyB0byBiZSBhZGRlZFxuXHQgKiBAcGFyYW0gb0RlZmF1bHRWYWx1ZXMgRGVmYXVsdCB2YWx1ZXMgZnJvbSBBcHBsaWNhdGlvbiBNYW5pZmVzdFxuXHQgKiBAcGFyYW0gb1Byb3BlcnR5SW5mbyBQcm9wZXJ0eSBpbmZvcm1hdGlvblxuXHQgKiBAcGFyYW0gYlVPTUZpZWxkXG5cdCAqL1xuXHRzZXREZWZhdWx0VmFsdWVzVG9EaWFsb2c6IGZ1bmN0aW9uIChhVmFsdWVzOiBhbnksIG9EZWZhdWx0VmFsdWVzOiBhbnksIG9Qcm9wZXJ0eUluZm86IGFueSwgYlVPTUZpZWxkPzogYm9vbGVhbikge1xuXHRcdGNvbnN0IHNQcm9wZXJ0eVBhdGggPSBiVU9NRmllbGQgPyBvUHJvcGVydHlJbmZvLnVuaXRQcm9wZXJ0eSA6IG9Qcm9wZXJ0eUluZm8uZGF0YVByb3BlcnR5LFxuXHRcdFx0c0lucHV0VHlwZSA9IG9Qcm9wZXJ0eUluZm8uaW5wdXRUeXBlLFxuXHRcdFx0YlByb3BlcnR5UmVxdWlyZWQgPSBvUHJvcGVydHlJbmZvLmlzRmllbGRSZXF1aXJlZDtcblx0XHQvLyBjb25zdCBzU3VmZml4Rm9yS2VlcEV4aXN0aW5nID0gTWFzc0VkaXRIZWxwZXIuZ2V0U3VmZml4Rm9yS2VlcEV4aXNpdGluZyhzSW5wdXRUeXBlKTtcblx0XHRjb25zdCBzU3VmZml4Rm9yS2VlcEV4aXN0aW5nID0gXCJWYWx1ZXNcIjtcblx0XHRhVmFsdWVzLmRlZmF1bHRPcHRpb25zID0gYVZhbHVlcy5kZWZhdWx0T3B0aW9ucyB8fCBbXTtcblx0XHRjb25zdCBzZWxlY3RPcHRpb25zRXhpc3QgPSBhVmFsdWVzLnNlbGVjdE9wdGlvbnMgJiYgYVZhbHVlcy5zZWxlY3RPcHRpb25zLmxlbmd0aCA+IDA7XG5cdFx0Y29uc3Qga2VlcEVudHJ5ID0ge1xuXHRcdFx0dGV4dDogYCR7b0RlZmF1bHRWYWx1ZXMua2VlcEV4aXN0aW5nUHJlZml4fSAke3NTdWZmaXhGb3JLZWVwRXhpc3Rpbmd9ID5gLFxuXHRcdFx0a2V5OiBgRGVmYXVsdC8ke3NQcm9wZXJ0eVBhdGh9YFxuXHRcdH07XG5cblx0XHRpZiAoc0lucHV0VHlwZSA9PT0gXCJDaGVja0JveFwiKSB7XG5cdFx0XHRjb25zdCBmYWxzZUVudHJ5ID0geyB0ZXh0OiBcIk5vXCIsIGtleTogYCR7c1Byb3BlcnR5UGF0aH0vZmFsc2VgLCB0ZXh0SW5mbzogeyB2YWx1ZTogZmFsc2UgfSB9O1xuXHRcdFx0Y29uc3QgdHJ1dGh5RW50cnkgPSB7IHRleHQ6IFwiWWVzXCIsIGtleTogYCR7c1Byb3BlcnR5UGF0aH0vdHJ1ZWAsIHRleHRJbmZvOiB7IHZhbHVlOiB0cnVlIH0gfTtcblx0XHRcdGFWYWx1ZXMudW5zaGlmdChmYWxzZUVudHJ5KTtcblx0XHRcdGFWYWx1ZXMuZGVmYXVsdE9wdGlvbnMudW5zaGlmdChmYWxzZUVudHJ5KTtcblx0XHRcdGFWYWx1ZXMudW5zaGlmdCh0cnV0aHlFbnRyeSk7XG5cdFx0XHRhVmFsdWVzLmRlZmF1bHRPcHRpb25zLnVuc2hpZnQodHJ1dGh5RW50cnkpO1xuXHRcdFx0YVZhbHVlcy51bnNoaWZ0KGtlZXBFbnRyeSk7XG5cdFx0XHRhVmFsdWVzLmRlZmF1bHRPcHRpb25zLnVuc2hpZnQoa2VlcEVudHJ5KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKG9Qcm9wZXJ0eUluZm8/LnByb3BlcnR5SW5mbz8uaGFzVkggfHwgKG9Qcm9wZXJ0eUluZm8/LnVuaXRJbmZvPy5oYXNWSCAmJiBiVU9NRmllbGQpKSB7XG5cdFx0XHRcdGNvbnN0IHZoZEVudHJ5ID0geyB0ZXh0OiBvRGVmYXVsdFZhbHVlcy51c2VWYWx1ZUhlbHBWYWx1ZSwga2V5OiBgVXNlVmFsdWVIZWxwVmFsdWUvJHtzUHJvcGVydHlQYXRofWAgfTtcblx0XHRcdFx0YVZhbHVlcy51bnNoaWZ0KHZoZEVudHJ5KTtcblx0XHRcdFx0YVZhbHVlcy5kZWZhdWx0T3B0aW9ucy51bnNoaWZ0KHZoZEVudHJ5KTtcblx0XHRcdH1cblx0XHRcdGlmIChzZWxlY3RPcHRpb25zRXhpc3QpIHtcblx0XHRcdFx0aWYgKGJQcm9wZXJ0eVJlcXVpcmVkICE9PSBcInRydWVcIiAmJiAhYlVPTUZpZWxkKSB7XG5cdFx0XHRcdFx0Y29uc3QgY2xlYXJFbnRyeSA9IHsgdGV4dDogb0RlZmF1bHRWYWx1ZXMuY2xlYXJGaWVsZFZhbHVlLCBrZXk6IGBDbGVhckZpZWxkVmFsdWUvJHtzUHJvcGVydHlQYXRofWAgfTtcblx0XHRcdFx0XHRhVmFsdWVzLnVuc2hpZnQoY2xlYXJFbnRyeSk7XG5cdFx0XHRcdFx0YVZhbHVlcy5kZWZhdWx0T3B0aW9ucy51bnNoaWZ0KGNsZWFyRW50cnkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGFWYWx1ZXMudW5zaGlmdChrZWVwRW50cnkpO1xuXHRcdFx0XHRhVmFsdWVzLmRlZmF1bHRPcHRpb25zLnVuc2hpZnQoa2VlcEVudHJ5KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IGVtcHR5RW50cnkgPSB7IHRleHQ6IG9EZWZhdWx0VmFsdWVzLmxlYXZlQmxhbmtWYWx1ZSwga2V5OiBgRGVmYXVsdC8ke3NQcm9wZXJ0eVBhdGh9YCB9O1xuXHRcdFx0XHRhVmFsdWVzLnVuc2hpZnQoZW1wdHlFbnRyeSk7XG5cdFx0XHRcdGFWYWx1ZXMuZGVmYXVsdE9wdGlvbnMudW5zaGlmdChlbXB0eUVudHJ5KTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldCB0ZXh0IGFycmFuZ2VtZW50IGluZm8gZm9yIGEgY29udGV4dCBwcm9wZXJ0eS5cblx0ICpcblx0ICogQHBhcmFtIHByb3BlcnR5IFByb3BlcnR5IFBhdGhcblx0ICogQHBhcmFtIGRlc2NyaXB0aW9uUGF0aCBQYXRoIHRvIHRleHQgYXNzb2NpYXRpb24gb2YgdGhlIHByb3BlcnR5XG5cdCAqIEBwYXJhbSBkaXNwbGF5TW9kZSBEaXNwbGF5IG1vZGUgb2YgdGhlIHByb3BlcnR5IGFuZCB0ZXh0IGFzc29jaWF0aW9uXG5cdCAqIEBwYXJhbSBzZWxlY3RlZENvbnRleHQgQ29udGV4dCB0byBmaW5kIHRoZSBmdWxsIHRleHRcblx0ICogQHJldHVybnMgVGhlIHRleHQgYXJyYW5nZW1lbnRcblx0ICovXG5cdGdldFRleHRBcnJhbmdlbWVudEluZm86IGZ1bmN0aW9uIChcblx0XHRwcm9wZXJ0eTogc3RyaW5nLFxuXHRcdGRlc2NyaXB0aW9uUGF0aDogc3RyaW5nLFxuXHRcdGRpc3BsYXlNb2RlOiBzdHJpbmcsXG5cdFx0c2VsZWN0ZWRDb250ZXh0OiBDb250ZXh0XG5cdCk6IFRleHRBcnJhbmdlbWVudEluZm8ge1xuXHRcdGxldCB2YWx1ZSA9IHNlbGVjdGVkQ29udGV4dC5nZXRPYmplY3QocHJvcGVydHkpLFxuXHRcdFx0ZGVzY3JpcHRpb25WYWx1ZSxcblx0XHRcdGZ1bGxUZXh0O1xuXHRcdGlmIChkZXNjcmlwdGlvblBhdGggJiYgcHJvcGVydHkpIHtcblx0XHRcdHN3aXRjaCAoZGlzcGxheU1vZGUpIHtcblx0XHRcdFx0Y2FzZSBcIkRlc2NyaXB0aW9uXCI6XG5cdFx0XHRcdFx0ZGVzY3JpcHRpb25WYWx1ZSA9IHNlbGVjdGVkQ29udGV4dC5nZXRPYmplY3QoZGVzY3JpcHRpb25QYXRoKSB8fCBcIlwiO1xuXHRcdFx0XHRcdGZ1bGxUZXh0ID0gZGVzY3JpcHRpb25WYWx1ZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcIlZhbHVlXCI6XG5cdFx0XHRcdFx0dmFsdWUgPSBzZWxlY3RlZENvbnRleHQuZ2V0T2JqZWN0KHByb3BlcnR5KSB8fCBcIlwiO1xuXHRcdFx0XHRcdGZ1bGxUZXh0ID0gdmFsdWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJWYWx1ZURlc2NyaXB0aW9uXCI6XG5cdFx0XHRcdFx0dmFsdWUgPSBzZWxlY3RlZENvbnRleHQuZ2V0T2JqZWN0KHByb3BlcnR5KSB8fCBcIlwiO1xuXHRcdFx0XHRcdGRlc2NyaXB0aW9uVmFsdWUgPSBzZWxlY3RlZENvbnRleHQuZ2V0T2JqZWN0KGRlc2NyaXB0aW9uUGF0aCkgfHwgXCJcIjtcblx0XHRcdFx0XHRmdWxsVGV4dCA9IGRlc2NyaXB0aW9uVmFsdWUgPyBgJHt2YWx1ZX0gKCR7ZGVzY3JpcHRpb25WYWx1ZX0pYCA6IHZhbHVlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiRGVzY3JpcHRpb25WYWx1ZVwiOlxuXHRcdFx0XHRcdHZhbHVlID0gc2VsZWN0ZWRDb250ZXh0LmdldE9iamVjdChwcm9wZXJ0eSkgfHwgXCJcIjtcblx0XHRcdFx0XHRkZXNjcmlwdGlvblZhbHVlID0gc2VsZWN0ZWRDb250ZXh0LmdldE9iamVjdChkZXNjcmlwdGlvblBhdGgpIHx8IFwiXCI7XG5cdFx0XHRcdFx0ZnVsbFRleHQgPSBkZXNjcmlwdGlvblZhbHVlID8gYCR7ZGVzY3JpcHRpb25WYWx1ZX0gKCR7dmFsdWV9KWAgOiB2YWx1ZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRMb2cuaW5mbyhgRGlzcGxheSBQcm9wZXJ0eSBub3QgYXBwbGljYWJsZTogJHtwcm9wZXJ0eX1gKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0dGV4dEFycmFuZ2VtZW50OiBkaXNwbGF5TW9kZSxcblx0XHRcdHZhbHVlUGF0aDogcHJvcGVydHksXG5cdFx0XHRkZXNjcmlwdGlvblBhdGg6IGRlc2NyaXB0aW9uUGF0aCxcblx0XHRcdHZhbHVlOiB2YWx1ZSxcblx0XHRcdGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvblZhbHVlLFxuXHRcdFx0ZnVsbFRleHQ6IGZ1bGxUZXh0XG5cdFx0fTtcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJuIHRoZSB2aXNpYmlsaXR5IHZhbHV1ZSBmb3IgdGhlIE1hbmFnZWRPYmplY3QgQW55LlxuXHQgKlxuXHQgKiBAcGFyYW0gYW55IFRoZSBNYW5hZ2VkT2JqZWN0IEFueSB0byBiZSB1c2VkIHRvIGNhbGN1bGF0ZSB0aGUgdmlzaWJsZSB2YWx1ZSBvZiB0aGUgYmluZGluZy5cblx0ICogQHJldHVybnMgUmV0dXJucyB0cnVlIGlmIHRoZSBtYXNzIGVkaXQgZmllbGQgaXMgZWRpdGFibGUuXG5cdCAqL1xuXHRpc0VkaXRhYmxlOiBmdW5jdGlvbiAoYW55OiBBbnlUeXBlKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgYmluZGluZyA9IGFueS5nZXRCaW5kaW5nKFwiYW55XCIpO1xuXHRcdGNvbnN0IHZhbHVlID0gKGJpbmRpbmcgYXMgYW55KS5nZXRFeHRlcm5hbFZhbHVlKCk7XG5cdFx0cmV0dXJuIHZhbHVlID09PSBFZGl0TW9kZS5FZGl0YWJsZTtcblx0fSxcblxuXHQvKipcblx0ICogQ2FsY3VsYXRlIGFuZCB1cGRhdGUgdGhlIHZpc2liaWxpdHkgb2YgbWFzcyBlZGl0IGZpZWxkIG9uIGNoYW5nZSBvZiB0aGUgTWFuYWdlZE9iamVjdCBBbnkgYmluZGluZy5cblx0ICpcblx0ICogQHBhcmFtIG9EaWFsb2dEYXRhTW9kZWwgTW9kZWwgdG8gYmUgdXNlZCBydW50aW1lLlxuXHQgKiBAcGFyYW0gZGF0YVByb3BlcnR5IEZpZWxkIG5hbWUuXG5cdCAqL1xuXHRvbkNvbnRleHRFZGl0YWJsZUNoYW5nZTogZnVuY3Rpb24gKG9EaWFsb2dEYXRhTW9kZWw6IEpTT05Nb2RlbCwgZGF0YVByb3BlcnR5OiBzdHJpbmcpOiB2b2lkIHtcblx0XHRjb25zdCBvYmplY3RzRm9yVmlzaWJpbGl0eSA9IG9EaWFsb2dEYXRhTW9kZWwuZ2V0UHJvcGVydHkoYC92YWx1ZXMvJHtkYXRhUHJvcGVydHl9L29iamVjdHNGb3JWaXNpYmlsaXR5YCkgfHwgW107XG5cdFx0Y29uc3QgZWRpdGFibGUgPSBvYmplY3RzRm9yVmlzaWJpbGl0eS5zb21lKE1hc3NFZGl0SGVscGVyLmlzRWRpdGFibGUpO1xuXG5cdFx0aWYgKGVkaXRhYmxlKSB7XG5cdFx0XHRvRGlhbG9nRGF0YU1vZGVsLnNldFByb3BlcnR5KGAvdmFsdWVzLyR7ZGF0YVByb3BlcnR5fS92aXNpYmxlYCwgZWRpdGFibGUpO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogVXBkYXRlIE1hbmFnZWQgT2JqZWN0IEFueSBmb3IgdmlzaWJpbGl0eSBvZiB0aGUgbWFzcyBlZGl0IGZpZWxkcy5cblx0ICpcblx0ICogQHBhcmFtIG1PVG9Vc2UgVGhlIE1hbmFnZWRPYmplY3QgQW55IHRvIGJlIHVzZWQgdG8gY2FsY3VsYXRlIHRoZSB2aXNpYmxlIHZhbHVlIG9mIHRoZSBiaW5kaW5nLlxuXHQgKiBAcGFyYW0gb0RpYWxvZ0RhdGFNb2RlbCBNb2RlbCB0byBiZSB1c2VkIHJ1bnRpbWUuXG5cdCAqIEBwYXJhbSBkYXRhUHJvcGVydHkgRmllbGQgbmFtZS5cblx0ICogQHBhcmFtIHZhbHVlcyBWYWx1ZXMgb2YgdGhlIGZpZWxkLlxuXHQgKi9cblx0dXBkYXRlT25Db250ZXh0Q2hhbmdlOiBmdW5jdGlvbiAobU9Ub1VzZTogQW55VHlwZSwgb0RpYWxvZ0RhdGFNb2RlbDogSlNPTk1vZGVsLCBkYXRhUHJvcGVydHk6IHN0cmluZywgdmFsdWVzOiBhbnkpIHtcblx0XHRjb25zdCBiaW5kaW5nID0gbU9Ub1VzZS5nZXRCaW5kaW5nKFwiYW55XCIpO1xuXG5cdFx0dmFsdWVzLm9iamVjdHNGb3JWaXNpYmlsaXR5ID0gdmFsdWVzLm9iamVjdHNGb3JWaXNpYmlsaXR5IHx8IFtdO1xuXHRcdHZhbHVlcy5vYmplY3RzRm9yVmlzaWJpbGl0eS5wdXNoKG1PVG9Vc2UpO1xuXG5cdFx0YmluZGluZz8uYXR0YWNoQ2hhbmdlKE1hc3NFZGl0SGVscGVyLm9uQ29udGV4dEVkaXRhYmxlQ2hhbmdlLmJpbmQobnVsbCwgb0RpYWxvZ0RhdGFNb2RlbCwgZGF0YVByb3BlcnR5KSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldCBib3VuZCBvYmplY3QgdG8gY2FsY3VsYXRlIHRoZSB2aXNpYmlsaXR5IG9mIGNvbnRleHRzLlxuXHQgKlxuXHQgKiBAcGFyYW0gZXhwQmluZGluZyBCaW5kaW5nIFN0cmluZyBvYmplY3QuXG5cdCAqIEBwYXJhbSBjb250ZXh0IENvbnRleHQgdGhlIGJpbmRpbmcgdmFsdWUuXG5cdCAqIEByZXR1cm5zIFRoZSBNYW5hZ2VkT2JqZWN0IEFueSB0byBiZSB1c2VkIHRvIGNhbGN1bGF0ZSB0aGUgdmlzaWJsZSB2YWx1ZSBvZiB0aGUgYmluZGluZy5cblx0ICovXG5cdGdldEJvdW5kT2JqZWN0OiBmdW5jdGlvbiAoZXhwQmluZGluZzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24sIGNvbnRleHQ6IENvbnRleHQpOiBBbnlUeXBlIHtcblx0XHRjb25zdCBtT1RvVXNlID0gbmV3IEFueSh7IGFueTogZXhwQmluZGluZyB9KTtcblx0XHRjb25zdCBtb2RlbCA9IGNvbnRleHQuZ2V0TW9kZWwoKTtcblx0XHRtT1RvVXNlLnNldE1vZGVsKG1vZGVsKTtcblx0XHRtT1RvVXNlLnNldEJpbmRpbmdDb250ZXh0KGNvbnRleHQpO1xuXG5cdFx0cmV0dXJuIG1PVG9Vc2U7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldCB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgZmllbGQuXG5cdCAqXG5cdCAqIEBwYXJhbSBleHBCaW5kaW5nIEJpbmRpbmcgU3RyaW5nIG9iamVjdC5cblx0ICogQHBhcmFtIG9EaWFsb2dEYXRhTW9kZWwgTW9kZWwgdG8gYmUgdXNlZCBydW50aW1lLlxuXHQgKiBAcGFyYW0gZGF0YVByb3BlcnR5IEZpZWxkIG5hbWUuXG5cdCAqIEBwYXJhbSB2YWx1ZXMgVmFsdWVzIG9mIHRoZSBmaWVsZC5cblx0ICogQHBhcmFtIGNvbnRleHQgQ29udGV4dCB0aGUgYmluZGluZyB2YWx1ZS5cblx0ICogQHJldHVybnMgUmV0dXJucyB0cnVlIGlmIHRoZSBtYXNzIGVkaXQgZmllbGQgaXMgZWRpdGFibGUuXG5cdCAqL1xuXHRnZXRGaWVsZFZpc2libGl0eTogZnVuY3Rpb24gKFxuXHRcdGV4cEJpbmRpbmc6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLFxuXHRcdG9EaWFsb2dEYXRhTW9kZWw6IEpTT05Nb2RlbCxcblx0XHRkYXRhUHJvcGVydHk6IHN0cmluZyxcblx0XHR2YWx1ZXM6IGFueSxcblx0XHRjb250ZXh0OiBDb250ZXh0XG5cdCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IG1PVG9Vc2UgPSBNYXNzRWRpdEhlbHBlci5nZXRCb3VuZE9iamVjdChleHBCaW5kaW5nLCBjb250ZXh0KTtcblx0XHRjb25zdCBpc0NvbnRleHRFZGl0YWJsZSA9IE1hc3NFZGl0SGVscGVyLmlzRWRpdGFibGUobU9Ub1VzZSk7XG5cblx0XHRpZiAoIWlzQ29udGV4dEVkaXRhYmxlKSB7XG5cdFx0XHRNYXNzRWRpdEhlbHBlci51cGRhdGVPbkNvbnRleHRDaGFuZ2UobU9Ub1VzZSwgb0RpYWxvZ0RhdGFNb2RlbCwgZGF0YVByb3BlcnR5LCB2YWx1ZXMpO1xuXHRcdH1cblx0XHRyZXR1cm4gaXNDb250ZXh0RWRpdGFibGU7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemVzIGEgcnVudGltZSBtb2RlbDpcblx0ICogPT4gVGhlIG1vZGVsIGNvbnNpc3RzIG9mIHZhbHVlcyBzaG93biBpbiB0aGUgY29tYm9Cb3ggb2YgdGhlIGRpYWxvZyAoTGVhdmUgQmxhbmssIEtlZXAgRXhpc3RpbmcgVmFsdWVzLCBvciBhbnkgcHJvcGVydHkgdmFsdWUgZm9yIHRoZSBzZWxlY3RlZCBjb250ZXh0LCBldGMuKVxuXHQgKiA9PiBUaGUgbW9kZWwgd2lsbCBjYXB0dXJlIHJ1bnRpbWUgY2hhbmdlcyBpbiB0aGUgcmVzdWx0cyBwcm9wZXJ0eSAodGhlIHZhbHVlIGVudGVyZWQgaW4gdGhlIGNvbWJvQm94KS5cblx0ICpcblx0ICogQHBhcmFtIGFDb250ZXh0cyBDb250ZXh0cyBmb3IgbWFzcyBlZGl0XG5cdCAqIEBwYXJhbSBhRGF0YUFycmF5IEFycmF5IGNvbnRhaW5pbmcgZGF0YSByZWxhdGVkIHRvIHRoZSBkaWFsb2cgdXNlZCBieSBib3RoIHRoZSBzdGF0aWMgYW5kIHRoZSBydW50aW1lIG1vZGVsXG5cdCAqIEBwYXJhbSBvRGVmYXVsdFZhbHVlcyBEZWZhdWx0IHZhbHVlcyBmcm9tIGkxOG5cblx0ICogQHBhcmFtIGRpYWxvZ0NvbnRleHQgVHJhbnNpZW50IGNvbnRleHQgZm9yIG1hc3MgZWRpdCBkaWFsb2cuXG5cdCAqIEByZXR1cm5zIFRoZSBydW50aW1lIG1vZGVsXG5cdCAqL1xuXHRzZXRSdW50aW1lTW9kZWxPbkRpYWxvZzogZnVuY3Rpb24gKGFDb250ZXh0czogYW55W10sIGFEYXRhQXJyYXk6IGFueVtdLCBvRGVmYXVsdFZhbHVlczogYW55LCBkaWFsb2dDb250ZXh0OiBDb250ZXh0KSB7XG5cdFx0Y29uc3QgYVZhbHVlczogYW55W10gPSBbXTtcblx0XHRjb25zdCBhVW5pdERhdGE6IGFueVtdID0gW107XG5cdFx0Y29uc3QgYVJlc3VsdHM6IGFueVtdID0gW107XG5cdFx0Y29uc3QgdGV4dFBhdGhzOiBhbnlbXSA9IFtdO1xuXHRcdGNvbnN0IGFSZWFkT25seUZpZWxkSW5mbzogYW55W10gPSBbXTtcblxuXHRcdGNvbnN0IG9EYXRhID0ge1xuXHRcdFx0dmFsdWVzOiBhVmFsdWVzLFxuXHRcdFx0dW5pdERhdGE6IGFVbml0RGF0YSxcblx0XHRcdHJlc3VsdHM6IGFSZXN1bHRzLFxuXHRcdFx0cmVhZGFibGVQcm9wZXJ0eURhdGE6IGFSZWFkT25seUZpZWxkSW5mbyxcblx0XHRcdHNlbGVjdGVkS2V5OiB1bmRlZmluZWQsXG5cdFx0XHR0ZXh0UGF0aHM6IHRleHRQYXRocyxcblx0XHRcdG5vRmllbGRzOiBvRGVmYXVsdFZhbHVlcy5ub0ZpZWxkc1xuXHRcdH07XG5cdFx0Y29uc3Qgb0RpYWxvZ0RhdGFNb2RlbCA9IG5ldyBKU09OTW9kZWwob0RhdGEpO1xuXHRcdGFEYXRhQXJyYXkuZm9yRWFjaChmdW5jdGlvbiAob0luRGF0YTogYW55KSB7XG5cdFx0XHRsZXQgb1RleHRJbmZvO1xuXHRcdFx0bGV0IHNQcm9wZXJ0eUtleTtcblx0XHRcdGxldCBzVW5pdFByb3BlcnR5TmFtZTtcblx0XHRcdGNvbnN0IG9EaXN0aW5jdFZhbHVlTWFwOiBhbnkgPSB7fTtcblx0XHRcdGNvbnN0IG9EaXN0aW5jdFVuaXRNYXA6IGFueSA9IHt9O1xuXHRcdFx0aWYgKG9JbkRhdGEuZGF0YVByb3BlcnR5ICYmIG9JbkRhdGEuZGF0YVByb3BlcnR5LmluZGV4T2YoXCIvXCIpID4gLTEpIHtcblx0XHRcdFx0Y29uc3QgYUZpbmFsUGF0aCA9IE1hc3NFZGl0SGVscGVyLmluaXRMYXN0TGV2ZWxPZlByb3BlcnR5UGF0aChvSW5EYXRhLmRhdGFQcm9wZXJ0eSwgYVZhbHVlcyAvKiwgZGlhbG9nQ29udGV4dCAqLyk7XG5cdFx0XHRcdGNvbnN0IGFQcm9wZXJ0eVBhdGhzID0gb0luRGF0YS5kYXRhUHJvcGVydHkuc3BsaXQoXCIvXCIpO1xuXG5cdFx0XHRcdGZvciAoY29uc3QgY29udGV4dCBvZiBhQ29udGV4dHMpIHtcblx0XHRcdFx0XHRjb25zdCBzTXVsdGlMZXZlbFBhdGhWYWx1ZSA9IGNvbnRleHQuZ2V0T2JqZWN0KG9JbkRhdGEuZGF0YVByb3BlcnR5KTtcblx0XHRcdFx0XHRzUHJvcGVydHlLZXkgPSBgJHtvSW5EYXRhLmRhdGFQcm9wZXJ0eX0vJHtzTXVsdGlMZXZlbFBhdGhWYWx1ZX1gO1xuXHRcdFx0XHRcdGlmICghb0Rpc3RpbmN0VmFsdWVNYXBbc1Byb3BlcnR5S2V5XSAmJiBhRmluYWxQYXRoW2FQcm9wZXJ0eVBhdGhzW2FQcm9wZXJ0eVBhdGhzLmxlbmd0aCAtIDFdXSkge1xuXHRcdFx0XHRcdFx0b1RleHRJbmZvID0gTWFzc0VkaXRIZWxwZXIuZ2V0VGV4dEFycmFuZ2VtZW50SW5mbyhcblx0XHRcdFx0XHRcdFx0b0luRGF0YS5kYXRhUHJvcGVydHksXG5cdFx0XHRcdFx0XHRcdG9JbkRhdGEuZGVzY3JpcHRpb25QYXRoLFxuXHRcdFx0XHRcdFx0XHRvSW5EYXRhLmRpc3BsYXksXG5cdFx0XHRcdFx0XHRcdGNvbnRleHRcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRhRmluYWxQYXRoW2FQcm9wZXJ0eVBhdGhzW2FQcm9wZXJ0eVBhdGhzLmxlbmd0aCAtIDFdXS5wdXNoKHtcblx0XHRcdFx0XHRcdFx0dGV4dDogKG9UZXh0SW5mbyAmJiBvVGV4dEluZm8uZnVsbFRleHQpIHx8IHNNdWx0aUxldmVsUGF0aFZhbHVlLFxuXHRcdFx0XHRcdFx0XHRrZXk6IHNQcm9wZXJ0eUtleSxcblx0XHRcdFx0XHRcdFx0dGV4dEluZm86IG9UZXh0SW5mb1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRvRGlzdGluY3RWYWx1ZU1hcFtzUHJvcGVydHlLZXldID0gc011bHRpTGV2ZWxQYXRoVmFsdWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIGlmIChPYmplY3Qua2V5cyhvRGlzdGluY3RWYWx1ZU1hcCkubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdC8vIFx0ZGlhbG9nQ29udGV4dC5zZXRQcm9wZXJ0eShvRGF0YS5kYXRhUHJvcGVydHksIHNQcm9wZXJ0eUtleSAmJiBvRGlzdGluY3RWYWx1ZU1hcFtzUHJvcGVydHlLZXldKTtcblx0XHRcdFx0Ly8gfVxuXG5cdFx0XHRcdGFGaW5hbFBhdGhbYVByb3BlcnR5UGF0aHNbYVByb3BlcnR5UGF0aHMubGVuZ3RoIC0gMV1dLnRleHRJbmZvID0ge1xuXHRcdFx0XHRcdGRlc2NyaXB0aW9uUGF0aDogb0luRGF0YS5kZXNjcmlwdGlvblBhdGgsXG5cdFx0XHRcdFx0dmFsdWVQYXRoOiBvSW5EYXRhLmRhdGFQcm9wZXJ0eSxcblx0XHRcdFx0XHRkaXNwbGF5TW9kZTogb0luRGF0YS5kaXNwbGF5XG5cdFx0XHRcdH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhVmFsdWVzW29JbkRhdGEuZGF0YVByb3BlcnR5XSA9IGFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldIHx8IFtdO1xuXHRcdFx0XHRhVmFsdWVzW29JbkRhdGEuZGF0YVByb3BlcnR5XVtcInNlbGVjdE9wdGlvbnNcIl0gPSBhVmFsdWVzW29JbkRhdGEuZGF0YVByb3BlcnR5XVtcInNlbGVjdE9wdGlvbnNcIl0gfHwgW107XG5cdFx0XHRcdGlmIChvSW5EYXRhLnVuaXRQcm9wZXJ0eSkge1xuXHRcdFx0XHRcdGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0gPSBhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldIHx8IFtdO1xuXHRcdFx0XHRcdGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV1bXCJzZWxlY3RPcHRpb25zXCJdID0gYVVuaXREYXRhW29JbkRhdGEudW5pdFByb3BlcnR5XVtcInNlbGVjdE9wdGlvbnNcIl0gfHwgW107XG5cdFx0XHRcdH1cblx0XHRcdFx0Zm9yIChjb25zdCBjb250ZXh0IG9mIGFDb250ZXh0cykge1xuXHRcdFx0XHRcdGNvbnN0IG9EYXRhT2JqZWN0ID0gY29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdFx0XHRzUHJvcGVydHlLZXkgPSBgJHtvSW5EYXRhLmRhdGFQcm9wZXJ0eX0vJHtvRGF0YU9iamVjdFtvSW5EYXRhLmRhdGFQcm9wZXJ0eV19YDtcblx0XHRcdFx0XHRpZiAob0luRGF0YS5kYXRhUHJvcGVydHkgJiYgb0RhdGFPYmplY3Rbb0luRGF0YS5kYXRhUHJvcGVydHldICYmICFvRGlzdGluY3RWYWx1ZU1hcFtzUHJvcGVydHlLZXldKSB7XG5cdFx0XHRcdFx0XHRpZiAob0luRGF0YS5pbnB1dFR5cGUgIT0gXCJDaGVja0JveFwiKSB7XG5cdFx0XHRcdFx0XHRcdG9UZXh0SW5mbyA9IE1hc3NFZGl0SGVscGVyLmdldFRleHRBcnJhbmdlbWVudEluZm8oXG5cdFx0XHRcdFx0XHRcdFx0b0luRGF0YS5kYXRhUHJvcGVydHksXG5cdFx0XHRcdFx0XHRcdFx0b0luRGF0YS5kZXNjcmlwdGlvblBhdGgsXG5cdFx0XHRcdFx0XHRcdFx0b0luRGF0YS5kaXNwbGF5LFxuXHRcdFx0XHRcdFx0XHRcdGNvbnRleHRcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0Y29uc3QgZW50cnkgPSB7XG5cdFx0XHRcdFx0XHRcdFx0dGV4dDogKG9UZXh0SW5mbyAmJiBvVGV4dEluZm8uZnVsbFRleHQpIHx8IG9EYXRhT2JqZWN0W29JbkRhdGEuZGF0YVByb3BlcnR5XSxcblx0XHRcdFx0XHRcdFx0XHRrZXk6IHNQcm9wZXJ0eUtleSxcblx0XHRcdFx0XHRcdFx0XHR0ZXh0SW5mbzogb1RleHRJbmZvXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdGFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldLnB1c2goZW50cnkpO1xuXHRcdFx0XHRcdFx0XHRhVmFsdWVzW29JbkRhdGEuZGF0YVByb3BlcnR5XVtcInNlbGVjdE9wdGlvbnNcIl0ucHVzaChlbnRyeSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRvRGlzdGluY3RWYWx1ZU1hcFtzUHJvcGVydHlLZXldID0gb0RhdGFPYmplY3Rbb0luRGF0YS5kYXRhUHJvcGVydHldO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAob0luRGF0YS51bml0UHJvcGVydHkgJiYgb0RhdGFPYmplY3Rbb0luRGF0YS51bml0UHJvcGVydHldKSB7XG5cdFx0XHRcdFx0XHRzVW5pdFByb3BlcnR5TmFtZSA9IGAke29JbkRhdGEudW5pdFByb3BlcnR5fS8ke29EYXRhT2JqZWN0W29JbkRhdGEudW5pdFByb3BlcnR5XX1gO1xuXHRcdFx0XHRcdFx0aWYgKCFvRGlzdGluY3RVbml0TWFwW3NVbml0UHJvcGVydHlOYW1lXSkge1xuXHRcdFx0XHRcdFx0XHRpZiAob0luRGF0YS5pbnB1dFR5cGUgIT0gXCJDaGVja0JveFwiKSB7XG5cdFx0XHRcdFx0XHRcdFx0b1RleHRJbmZvID0gTWFzc0VkaXRIZWxwZXIuZ2V0VGV4dEFycmFuZ2VtZW50SW5mbyhcblx0XHRcdFx0XHRcdFx0XHRcdG9JbkRhdGEudW5pdFByb3BlcnR5LFxuXHRcdFx0XHRcdFx0XHRcdFx0b0luRGF0YS5kZXNjcmlwdGlvblBhdGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRvSW5EYXRhLmRpc3BsYXksXG5cdFx0XHRcdFx0XHRcdFx0XHRjb250ZXh0XG5cdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCB1bml0RW50cnkgPSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0ZXh0OiAob1RleHRJbmZvICYmIG9UZXh0SW5mby5mdWxsVGV4dCkgfHwgb0RhdGFPYmplY3Rbb0luRGF0YS51bml0UHJvcGVydHldLFxuXHRcdFx0XHRcdFx0XHRcdFx0a2V5OiBzVW5pdFByb3BlcnR5TmFtZSxcblx0XHRcdFx0XHRcdFx0XHRcdHRleHRJbmZvOiBvVGV4dEluZm9cblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0ucHVzaCh1bml0RW50cnkpO1xuXHRcdFx0XHRcdFx0XHRcdGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV1bXCJzZWxlY3RPcHRpb25zXCJdLnB1c2godW5pdEVudHJ5KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRvRGlzdGluY3RVbml0TWFwW3NVbml0UHJvcGVydHlOYW1lXSA9IG9EYXRhT2JqZWN0W29JbkRhdGEudW5pdFByb3BlcnR5XTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0YVZhbHVlc1tvSW5EYXRhLmRhdGFQcm9wZXJ0eV0udGV4dEluZm8gPSB7XG5cdFx0XHRcdFx0ZGVzY3JpcHRpb25QYXRoOiBvSW5EYXRhLmRlc2NyaXB0aW9uUGF0aCxcblx0XHRcdFx0XHR2YWx1ZVBhdGg6IG9JbkRhdGEuZGF0YVByb3BlcnR5LFxuXHRcdFx0XHRcdGRpc3BsYXlNb2RlOiBvSW5EYXRhLmRpc3BsYXlcblx0XHRcdFx0fTtcblx0XHRcdFx0aWYgKE9iamVjdC5rZXlzKG9EaXN0aW5jdFZhbHVlTWFwKS5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0XHRkaWFsb2dDb250ZXh0LnNldFByb3BlcnR5KG9JbkRhdGEuZGF0YVByb3BlcnR5LCBzUHJvcGVydHlLZXkgJiYgb0Rpc3RpbmN0VmFsdWVNYXBbc1Byb3BlcnR5S2V5XSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKE9iamVjdC5rZXlzKG9EaXN0aW5jdFVuaXRNYXApLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRcdGRpYWxvZ0NvbnRleHQuc2V0UHJvcGVydHkob0luRGF0YS51bml0UHJvcGVydHksIHNVbml0UHJvcGVydHlOYW1lICYmIG9EaXN0aW5jdFVuaXRNYXBbc1VuaXRQcm9wZXJ0eU5hbWVdKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGV4dFBhdGhzW29JbkRhdGEuZGF0YVByb3BlcnR5XSA9IG9JbkRhdGEuZGVzY3JpcHRpb25QYXRoID8gW29JbkRhdGEuZGVzY3JpcHRpb25QYXRoXSA6IFtdO1xuXHRcdH0pO1xuXHRcdGFEYXRhQXJyYXkuZm9yRWFjaChmdW5jdGlvbiAob0luRGF0YTogYW55KSB7XG5cdFx0XHRsZXQgdmFsdWVzOiBhbnkgPSB7fTtcblx0XHRcdGlmIChvSW5EYXRhLmRhdGFQcm9wZXJ0eS5pbmRleE9mKFwiL1wiKSA+IC0xKSB7XG5cdFx0XHRcdGNvbnN0IHNNdWx0aUxldmVsUHJvcFBhdGhWYWx1ZSA9IE1hc3NFZGl0SGVscGVyLmdldFZhbHVlRm9yTXVsdGlMZXZlbFBhdGgob0luRGF0YS5kYXRhUHJvcGVydHksIGFWYWx1ZXMpO1xuXHRcdFx0XHRpZiAoIXNNdWx0aUxldmVsUHJvcFBhdGhWYWx1ZSkge1xuXHRcdFx0XHRcdHNNdWx0aUxldmVsUHJvcFBhdGhWYWx1ZS5wdXNoKHsgdGV4dDogb0RlZmF1bHRWYWx1ZXMubGVhdmVCbGFua1ZhbHVlLCBrZXk6IGBFbXB0eS8ke29JbkRhdGEuZGF0YVByb3BlcnR5fWAgfSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0TWFzc0VkaXRIZWxwZXIuc2V0RGVmYXVsdFZhbHVlc1RvRGlhbG9nKHNNdWx0aUxldmVsUHJvcFBhdGhWYWx1ZSwgb0RlZmF1bHRWYWx1ZXMsIG9JbkRhdGEpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhbHVlcyA9IHNNdWx0aUxldmVsUHJvcFBhdGhWYWx1ZTtcblx0XHRcdH0gZWxzZSBpZiAoYVZhbHVlc1tvSW5EYXRhLmRhdGFQcm9wZXJ0eV0pIHtcblx0XHRcdFx0YVZhbHVlc1tvSW5EYXRhLmRhdGFQcm9wZXJ0eV0gPSBhVmFsdWVzW29JbkRhdGEuZGF0YVByb3BlcnR5XSB8fCBbXTtcblx0XHRcdFx0TWFzc0VkaXRIZWxwZXIuc2V0RGVmYXVsdFZhbHVlc1RvRGlhbG9nKGFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldLCBvRGVmYXVsdFZhbHVlcywgb0luRGF0YSk7XG5cdFx0XHRcdHZhbHVlcyA9IGFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYVVuaXREYXRhW29JbkRhdGEudW5pdFByb3BlcnR5XSAmJiBhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldLmxlbmd0aCkge1xuXHRcdFx0XHRNYXNzRWRpdEhlbHBlci5zZXREZWZhdWx0VmFsdWVzVG9EaWFsb2coYVVuaXREYXRhW29JbkRhdGEudW5pdFByb3BlcnR5XSwgb0RlZmF1bHRWYWx1ZXMsIG9JbkRhdGEsIHRydWUpO1xuXHRcdFx0XHRhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldLnRleHRJbmZvID0ge307XG5cdFx0XHRcdGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0uc2VsZWN0ZWRLZXkgPSBNYXNzRWRpdEhlbHBlci5nZXREZWZhdWx0U2VsZWN0aW9uUGF0aENvbWJvQm94KFxuXHRcdFx0XHRcdGFDb250ZXh0cyxcblx0XHRcdFx0XHRvSW5EYXRhLnVuaXRQcm9wZXJ0eVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldLmlucHV0VHlwZSA9IG9JbkRhdGEuaW5wdXRUeXBlO1xuXHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0KG9JbkRhdGEuZGF0YVByb3BlcnR5ICYmIGFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldICYmICFhVmFsdWVzW29JbkRhdGEuZGF0YVByb3BlcnR5XS5sZW5ndGgpIHx8XG5cdFx0XHRcdChvSW5EYXRhLnVuaXRQcm9wZXJ0eSAmJiBhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldICYmICFhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldLmxlbmd0aClcblx0XHRcdCkge1xuXHRcdFx0XHRjb25zdCBiQ2xlYXJGaWVsZE9yQmxhbmtWYWx1ZUV4aXN0cyA9XG5cdFx0XHRcdFx0YVZhbHVlc1tvSW5EYXRhLmRhdGFQcm9wZXJ0eV0gJiZcblx0XHRcdFx0XHRhVmFsdWVzW29JbkRhdGEuZGF0YVByb3BlcnR5XS5zb21lKGZ1bmN0aW9uIChvYmo6IGFueSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9iai50ZXh0ID09PSBcIjwgQ2xlYXIgVmFsdWVzID5cIiB8fCBvYmoudGV4dCA9PT0gXCI8IExlYXZlIEJsYW5rID5cIjtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKG9JbkRhdGEuZGF0YVByb3BlcnR5ICYmICFiQ2xlYXJGaWVsZE9yQmxhbmtWYWx1ZUV4aXN0cykge1xuXHRcdFx0XHRcdGFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldLnB1c2goeyB0ZXh0OiBvRGVmYXVsdFZhbHVlcy5sZWF2ZUJsYW5rVmFsdWUsIGtleTogYEVtcHR5LyR7b0luRGF0YS5kYXRhUHJvcGVydHl9YCB9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBiQ2xlYXJGaWVsZE9yQmxhbmtVbml0VmFsdWVFeGlzdHMgPVxuXHRcdFx0XHRcdGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0gJiZcblx0XHRcdFx0XHRhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldLnNvbWUoZnVuY3Rpb24gKG9iajogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb2JqLnRleHQgPT09IFwiPCBDbGVhciBWYWx1ZXMgPlwiIHx8IG9iai50ZXh0ID09PSBcIjwgTGVhdmUgQmxhbmsgPlwiO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAob0luRGF0YS51bml0UHJvcGVydHkpIHtcblx0XHRcdFx0XHRpZiAoIWJDbGVhckZpZWxkT3JCbGFua1VuaXRWYWx1ZUV4aXN0cykge1xuXHRcdFx0XHRcdFx0YVVuaXREYXRhW29JbkRhdGEudW5pdFByb3BlcnR5XS5wdXNoKHtcblx0XHRcdFx0XHRcdFx0dGV4dDogb0RlZmF1bHRWYWx1ZXMubGVhdmVCbGFua1ZhbHVlLFxuXHRcdFx0XHRcdFx0XHRrZXk6IGBFbXB0eS8ke29JbkRhdGEudW5pdFByb3BlcnR5fWBcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldLnRleHRJbmZvID0ge307XG5cdFx0XHRcdFx0YVVuaXREYXRhW29JbkRhdGEudW5pdFByb3BlcnR5XS5zZWxlY3RlZEtleSA9IE1hc3NFZGl0SGVscGVyLmdldERlZmF1bHRTZWxlY3Rpb25QYXRoQ29tYm9Cb3goXG5cdFx0XHRcdFx0XHRhQ29udGV4dHMsXG5cdFx0XHRcdFx0XHRvSW5EYXRhLnVuaXRQcm9wZXJ0eVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YVVuaXREYXRhW29JbkRhdGEudW5pdFByb3BlcnR5XS5pbnB1dFR5cGUgPSBvSW5EYXRhLmlucHV0VHlwZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKG9JbkRhdGEuaXNQcm9wZXJ0eVJlYWRPbmx5ICYmIHR5cGVvZiBvSW5EYXRhLmlzUHJvcGVydHlSZWFkT25seSA9PT0gXCJib29sZWFuXCIpIHtcblx0XHRcdFx0YVJlYWRPbmx5RmllbGRJbmZvLnB1c2goeyBwcm9wZXJ0eTogb0luRGF0YS5kYXRhUHJvcGVydHksIHZhbHVlOiBvSW5EYXRhLmlzUHJvcGVydHlSZWFkT25seSwgdHlwZTogXCJEZWZhdWx0XCIgfSk7XG5cdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRvSW5EYXRhLmlzUHJvcGVydHlSZWFkT25seSAmJlxuXHRcdFx0XHRvSW5EYXRhLmlzUHJvcGVydHlSZWFkT25seS5vcGVyYW5kcyAmJlxuXHRcdFx0XHRvSW5EYXRhLmlzUHJvcGVydHlSZWFkT25seS5vcGVyYW5kc1swXSAmJlxuXHRcdFx0XHRvSW5EYXRhLmlzUHJvcGVydHlSZWFkT25seS5vcGVyYW5kc1swXS5vcGVyYW5kMSAmJlxuXHRcdFx0XHRvSW5EYXRhLmlzUHJvcGVydHlSZWFkT25seS5vcGVyYW5kc1swXS5vcGVyYW5kMlxuXHRcdFx0KSB7XG5cdFx0XHRcdC8vIFRoaXMgbmVlZHMgdG8gYmUgcmVmYWN0b3JlZCBpbiBhY2NvcmRhbmNlIHdpdGggdGhlIFJlYWRPbmx5RXhwcmVzc2lvbiBjaGFuZ2Vcblx0XHRcdFx0YVJlYWRPbmx5RmllbGRJbmZvLnB1c2goe1xuXHRcdFx0XHRcdHByb3BlcnR5OiBvSW5EYXRhLmRhdGFQcm9wZXJ0eSxcblx0XHRcdFx0XHRwcm9wZXJ0eVBhdGg6IG9JbkRhdGEuaXNQcm9wZXJ0eVJlYWRPbmx5Lm9wZXJhbmRzWzBdLm9wZXJhbmQxLnBhdGgsXG5cdFx0XHRcdFx0cHJvcGVydHlWYWx1ZTogb0luRGF0YS5pc1Byb3BlcnR5UmVhZE9ubHkub3BlcmFuZHNbMF0ub3BlcmFuZDIudmFsdWUsXG5cdFx0XHRcdFx0dHlwZTogXCJQYXRoXCJcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFNldHRpbmcgdmlzYmlsaXR5IG9mIHRoZSBtYXNzIGVkaXQgZmllbGQuXG5cdFx0XHRpZiAob0luRGF0YS5lZGl0TW9kZSkge1xuXHRcdFx0XHR2YWx1ZXMudmlzaWJsZSA9XG5cdFx0XHRcdFx0b0luRGF0YS5lZGl0TW9kZSA9PT0gRWRpdE1vZGUuRWRpdGFibGUgfHxcblx0XHRcdFx0XHRhQ29udGV4dHMuc29tZShcblx0XHRcdFx0XHRcdE1hc3NFZGl0SGVscGVyLmdldEZpZWxkVmlzaWJsaXR5LmJpbmQoXG5cdFx0XHRcdFx0XHRcdE1hc3NFZGl0SGVscGVyLFxuXHRcdFx0XHRcdFx0XHRvSW5EYXRhLmVkaXRNb2RlLFxuXHRcdFx0XHRcdFx0XHRvRGlhbG9nRGF0YU1vZGVsLFxuXHRcdFx0XHRcdFx0XHRvSW5EYXRhLmRhdGFQcm9wZXJ0eSxcblx0XHRcdFx0XHRcdFx0dmFsdWVzXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhbHVlcy52aXNpYmxlID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdHZhbHVlcy5zZWxlY3RlZEtleSA9IE1hc3NFZGl0SGVscGVyLmdldERlZmF1bHRTZWxlY3Rpb25QYXRoQ29tYm9Cb3goYUNvbnRleHRzLCBvSW5EYXRhLmRhdGFQcm9wZXJ0eSk7XG5cdFx0XHR2YWx1ZXMuaW5wdXRUeXBlID0gb0luRGF0YS5pbnB1dFR5cGU7XG5cdFx0XHR2YWx1ZXMudW5pdFByb3BlcnR5ID0gb0luRGF0YS51bml0UHJvcGVydHk7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gb0RpYWxvZ0RhdGFNb2RlbDtcblx0fSxcblx0LyoqXG5cdCAqIEdldHMgdHJhbnNpZW50IGNvbnRleHQgZm9yIGRpYWxvZy5cblx0ICpcblx0ICogQHBhcmFtIHRhYmxlIEluc3RhbmNlIG9mIFRhYmxlLlxuXHQgKiBAcGFyYW0gZGlhbG9nIE1hc3MgRWRpdCBEaWFsb2cuXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmV0dXJuaW5nIGluc3RhbmNlIG9mIGRpYWxvZy5cblx0ICovXG5cdGdldERpYWxvZ0NvbnRleHQ6IGZ1bmN0aW9uICh0YWJsZTogVGFibGUsIGRpYWxvZz86IERpYWxvZyk6IENvbnRleHQge1xuXHRcdGxldCB0cmFuc0N0eDogQ29udGV4dCA9IChkaWFsb2cgJiYgZGlhbG9nLmdldEJpbmRpbmdDb250ZXh0KCkpIGFzIENvbnRleHQ7XG5cblx0XHRpZiAoIXRyYW5zQ3R4KSB7XG5cdFx0XHRjb25zdCBtb2RlbCA9IHRhYmxlLmdldE1vZGVsKCk7XG5cdFx0XHRjb25zdCBsaXN0QmluZGluZyA9IHRhYmxlLmdldFJvd0JpbmRpbmcoKTtcblx0XHRcdGNvbnN0IHRyYW5zaWVudExpc3RCaW5kaW5nID0gbW9kZWwuYmluZExpc3QobGlzdEJpbmRpbmcuZ2V0UGF0aCgpLCBsaXN0QmluZGluZy5nZXRDb250ZXh0KCksIFtdLCBbXSwge1xuXHRcdFx0XHQkJHVwZGF0ZUdyb3VwSWQ6IFwic3VibWl0TGF0ZXJcIlxuXHRcdFx0fSkgYXMgT0RhdGFMaXN0QmluZGluZztcblx0XHRcdCh0cmFuc2llbnRMaXN0QmluZGluZyBhcyBhbnkpLnJlZnJlc2hJbnRlcm5hbCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0LyogKi9cblx0XHRcdH07XG5cdFx0XHR0cmFuc0N0eCA9IHRyYW5zaWVudExpc3RCaW5kaW5nLmNyZWF0ZSh7fSwgdHJ1ZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRyYW5zQ3R4O1xuXHR9LFxuXG5cdG9uRGlhbG9nT3BlbjogZnVuY3Rpb24gKGV2ZW50OiBhbnkpOiB2b2lkIHtcblx0XHRjb25zdCBzb3VyY2UgPSBldmVudC5nZXRTb3VyY2UoKTtcblx0XHRjb25zdCBmaWVsZHNJbmZvTW9kZWwgPSBzb3VyY2UuZ2V0TW9kZWwoXCJmaWVsZHNJbmZvXCIpO1xuXHRcdGZpZWxkc0luZm9Nb2RlbC5zZXRQcm9wZXJ0eShcIi9pc09wZW5cIiwgdHJ1ZSk7XG5cdH0sXG5cblx0Y2xvc2VEaWFsb2c6IGZ1bmN0aW9uIChvRGlhbG9nOiBhbnkpIHtcblx0XHRvRGlhbG9nLmNsb3NlKCk7XG5cdFx0b0RpYWxvZy5kZXN0cm95KCk7XG5cdH0sXG5cblx0bWVzc2FnZUhhbmRsaW5nRm9yTWFzc0VkaXQ6IGFzeW5jIGZ1bmN0aW9uIChcblx0XHRvVGFibGU6IFRhYmxlLFxuXHRcdGFDb250ZXh0czogYW55LFxuXHRcdG9Db250cm9sbGVyOiBQYWdlQ29udHJvbGxlcixcblx0XHRvSW5EaWFsb2c6IGFueSxcblx0XHRhUmVzdWx0czogYW55LFxuXHRcdGVycm9yQ29udGV4dHM6IGFueVxuXHQpIHtcblx0XHRjb25zdCBEcmFmdFN0YXR1cyA9IEZFTGlicmFyeS5EcmFmdFN0YXR1cztcblx0XHRjb25zdCBvUmVzb3VyY2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXHRcdChvQ29udHJvbGxlci5nZXRWaWV3KCk/LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQpPy5zZXRQcm9wZXJ0eShcImdldEJvdW5kTWVzc2FnZXNGb3JNYXNzRWRpdFwiLCB0cnVlKTtcblx0XHRvQ29udHJvbGxlci5tZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZXMoe1xuXHRcdFx0b25CZWZvcmVTaG93TWVzc2FnZTogZnVuY3Rpb24gKG1lc3NhZ2VzOiBhbnksIHNob3dNZXNzYWdlUGFyYW1ldGVyczogYW55KSB7XG5cdFx0XHRcdC8vbWVzc2FnZXMuY29uY2F0ZW5hdGUobWVzc2FnZUhhbmRsaW5nLmdldE1lc3NhZ2VzKHRydWUsIHRydWUpKTtcblx0XHRcdFx0c2hvd01lc3NhZ2VQYXJhbWV0ZXJzLmZuR2V0TWVzc2FnZVN1YnRpdGxlID0gbWVzc2FnZUhhbmRsaW5nLnNldE1lc3NhZ2VTdWJ0aXRsZS5iaW5kKHt9LCBvVGFibGUsIGFDb250ZXh0cyk7XG5cdFx0XHRcdGNvbnN0IHVuYm91bmRFcnJvcnM6IGFueVtdID0gW107XG5cdFx0XHRcdG1lc3NhZ2VzLmZvckVhY2goZnVuY3Rpb24gKG1lc3NhZ2U6IGFueSkge1xuXHRcdFx0XHRcdGlmICghbWVzc2FnZS5nZXRUYXJnZXQoKSkge1xuXHRcdFx0XHRcdFx0dW5ib3VuZEVycm9ycy5wdXNoKG1lc3NhZ2UpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0aWYgKGFSZXN1bHRzLmxlbmd0aCA+IDAgJiYgZXJyb3JDb250ZXh0cy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0XHRvQ29udHJvbGxlci5lZGl0Rmxvdy5zZXREcmFmdFN0YXR1cyhEcmFmdFN0YXR1cy5TYXZlZCk7XG5cdFx0XHRcdFx0Y29uc3Qgc3VjY2Vzc1RvYXN0ID0gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX01BU1NfRURJVF9TVUNDRVNTX1RPQVNUXCIpO1xuXHRcdFx0XHRcdE1lc3NhZ2VUb2FzdC5zaG93KHN1Y2Nlc3NUb2FzdCk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoZXJyb3JDb250ZXh0cy5sZW5ndGggPCAob1RhYmxlIGFzIGFueSkuZ2V0U2VsZWN0ZWRDb250ZXh0cygpLmxlbmd0aCkge1xuXHRcdFx0XHRcdG9Db250cm9sbGVyLmVkaXRGbG93LnNldERyYWZ0U3RhdHVzKERyYWZ0U3RhdHVzLlNhdmVkKTtcblx0XHRcdFx0fSBlbHNlIGlmIChlcnJvckNvbnRleHRzLmxlbmd0aCA9PT0gKG9UYWJsZSBhcyBhbnkpLmdldFNlbGVjdGVkQ29udGV4dHMoKS5sZW5ndGgpIHtcblx0XHRcdFx0XHRvQ29udHJvbGxlci5lZGl0Rmxvdy5zZXREcmFmdFN0YXR1cyhEcmFmdFN0YXR1cy5DbGVhcik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAob0NvbnRyb2xsZXIuZ2V0TW9kZWwoXCJ1aVwiKS5nZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlXCIpICYmIHVuYm91bmRFcnJvcnMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0c2hvd01lc3NhZ2VQYXJhbWV0ZXJzLnNob3dNZXNzYWdlQm94ID0gZmFsc2U7XG5cdFx0XHRcdFx0c2hvd01lc3NhZ2VQYXJhbWV0ZXJzLnNob3dNZXNzYWdlRGlhbG9nID0gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHNob3dNZXNzYWdlUGFyYW1ldGVycztcblx0XHRcdH1cblx0XHR9KTtcblx0XHRpZiAob0luRGlhbG9nLmlzT3BlbigpKSB7XG5cdFx0XHRNYXNzRWRpdEhlbHBlci5jbG9zZURpYWxvZyhvSW5EaWFsb2cpO1xuXHRcdFx0KG9Db250cm9sbGVyLmdldFZpZXcoKT8uZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dCk/LnNldFByb3BlcnR5KFwic2tpcFBhdGNoSGFuZGxlcnNcIiwgZmFsc2UpO1xuXHRcdH1cblx0XHQob0NvbnRyb2xsZXIuZ2V0VmlldygpPy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0KT8uc2V0UHJvcGVydHkoXCJnZXRCb3VuZE1lc3NhZ2VzRm9yTWFzc0VkaXRcIiwgZmFsc2UpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGdlbmVyYXRlcyBzaWRlIGVmZmVjdHMgbWFwIGZyb20gc2lkZSBlZmZlY3RzIGlkcyh3aGljaCBpcyBhIGNvbWJpbmF0aW9uIG9mIGVudGl0eSB0eXBlIGFuZCBxdWFsaWZpZXIpLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0VudGl0eVNldENvbnRleHRcblx0ICogQHBhcmFtIGFwcENvbXBvbmVudFxuXHQgKiBAcGFyYW0gb0NvbnRyb2xsZXJcblx0ICogQHBhcmFtIGFSZXN1bHRzXG5cdCAqIEByZXR1cm5zIFNpZGUgZWZmZWN0IG1hcCB3aXRoIGRhdGEuXG5cdCAqL1xuXHRnZXRTaWRlRWZmZWN0RGF0YUZvcktleTogZnVuY3Rpb24gKG9FbnRpdHlTZXRDb250ZXh0OiBhbnksIGFwcENvbXBvbmVudDogYW55LCBvQ29udHJvbGxlcjogUGFnZUNvbnRyb2xsZXIsIGFSZXN1bHRzOiBhbnkpIHtcblx0XHRjb25zdCBzT3duZXJFbnRpdHlUeXBlID0gb0VudGl0eVNldENvbnRleHQuZ2V0UHJvcGVydHkoXCIkVHlwZVwiKTtcblx0XHRjb25zdCBiYXNlU2lkZUVmZmVjdHNNYXBBcnJheTogYW55ID0ge307XG5cblx0XHRhUmVzdWx0cy5mb3JFYWNoKChyZXN1bHQ6IGFueSkgPT4ge1xuXHRcdFx0Y29uc3Qgc1BhdGggPSByZXN1bHQua2V5VmFsdWU7XG5cdFx0XHRjb25zdCBzaWRlRWZmZWN0U2VydmljZSA9IGFwcENvbXBvbmVudC5nZXRTaWRlRWZmZWN0c1NlcnZpY2UoKTtcblx0XHRcdGNvbnN0IGZpZWxkR3JvdXBJZHMgPSBzaWRlRWZmZWN0U2VydmljZS5jb21wdXRlRmllbGRHcm91cElkcyhzT3duZXJFbnRpdHlUeXBlLCByZXN1bHQucHJvcGVydHlGdWxseVF1YWxpZmllZE5hbWUgPz8gXCJcIikgPz8gW107XG5cdFx0XHRiYXNlU2lkZUVmZmVjdHNNYXBBcnJheVtzUGF0aF0gPSBvQ29udHJvbGxlci5fc2lkZUVmZmVjdHMuZ2V0U2lkZUVmZmVjdHNNYXBGb3JGaWVsZEdyb3VwcyhmaWVsZEdyb3VwSWRzKTtcblx0XHR9KTtcblx0XHRyZXR1cm4gYmFzZVNpZGVFZmZlY3RzTWFwQXJyYXk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdpdmUgdGhlIGVudGl0eSB0eXBlIGZvciBhIGdpdmVuIHNwYXRoIGZvciBlLmcuUmVxdWVzdGVkUXVhbnRpdHkuXG5cdCAqXG5cdCAqIEBwYXJhbSBzUGF0aFxuXHQgKiBAcGFyYW0gc0VudGl0eVR5cGVcblx0ICogQHBhcmFtIG9NZXRhTW9kZWxcblx0ICogQHJldHVybnMgT2JqZWN0IGhhdmluZyBlbnRpdHksIHNwYXRoIGFuZCBuYXZpZ2F0aW9uIHBhdGguXG5cdCAqL1xuXHRmbkdldFBhdGhGb3JTb3VyY2VQcm9wZXJ0eTogZnVuY3Rpb24gKHNQYXRoOiBhbnksIHNFbnRpdHlUeXBlOiBhbnksIG9NZXRhTW9kZWw6IGFueSkge1xuXHRcdC8vIGlmIHRoZSBwcm9wZXJ0eSBwYXRoIGhhcyBhIG5hdmlnYXRpb24sIGdldCB0aGUgdGFyZ2V0IGVudGl0eSB0eXBlIG9mIHRoZSBuYXZpZ2F0aW9uXG5cdFx0Y29uc3Qgc05hdmlnYXRpb25QYXRoID1cblx0XHRcdFx0c1BhdGguaW5kZXhPZihcIi9cIikgPiAwID8gXCIvXCIgKyBzRW50aXR5VHlwZSArIFwiL1wiICsgc1BhdGguc3Vic3RyKDAsIHNQYXRoLmxhc3RJbmRleE9mKFwiL1wiKSArIDEpICsgXCJAc2FwdWkubmFtZVwiIDogZmFsc2UsXG5cdFx0XHRwT3duZXJFbnRpdHkgPSAhc05hdmlnYXRpb25QYXRoID8gUHJvbWlzZS5yZXNvbHZlKHNFbnRpdHlUeXBlKSA6IG9NZXRhTW9kZWwucmVxdWVzdE9iamVjdChzTmF2aWdhdGlvblBhdGgpO1xuXHRcdHNQYXRoID0gc05hdmlnYXRpb25QYXRoID8gc1BhdGguc3Vic3RyKHNQYXRoLmxhc3RJbmRleE9mKFwiL1wiKSArIDEpIDogc1BhdGg7XG5cdFx0cmV0dXJuIHsgc1BhdGgsIHBPd25lckVudGl0eSwgc05hdmlnYXRpb25QYXRoIH07XG5cdH0sXG5cblx0Zm5HZXRFbnRpdHlUeXBlT2ZPd25lcjogZnVuY3Rpb24gKG9NZXRhTW9kZWw6IGFueSwgYmFzZU5hdlBhdGg6IHN0cmluZywgb0VudGl0eVNldENvbnRleHQ6IGFueSwgdGFyZ2V0RW50aXR5OiBzdHJpbmcsIGFUYXJnZXRzOiBhbnkpIHtcblx0XHRjb25zdCBvd25lckVudGl0eVR5cGUgPSBvRW50aXR5U2V0Q29udGV4dC5nZXRQcm9wZXJ0eShcIiRUeXBlXCIpO1xuXHRcdGNvbnN0IHsgJFR5cGU6IHBPd25lciwgJFBhcnRuZXI6IG93bmVyTmF2UGF0aCB9ID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7b0VudGl0eVNldENvbnRleHR9LyR7YmFzZU5hdlBhdGh9YCk7IC8vIG5hdiBwYXRoXG5cdFx0aWYgKG93bmVyTmF2UGF0aCkge1xuXHRcdFx0Y29uc3QgZW50aXR5T2JqT2ZPd25lclBhcnRuZXIgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgLyR7cE93bmVyfS8ke293bmVyTmF2UGF0aH1gKTtcblx0XHRcdGlmIChlbnRpdHlPYmpPZk93bmVyUGFydG5lcikge1xuXHRcdFx0XHRjb25zdCBlbnRpdHlUeXBlT2ZPd25lclBhcnRuZXIgPSBlbnRpdHlPYmpPZk93bmVyUGFydG5lcltcIiRUeXBlXCJdO1xuXHRcdFx0XHQvLyBpZiB0aGUgZW50aXR5IHR5cGVzIGRlZmVyLCB0aGVuIGJhc2UgbmF2IHBhdGggaXMgbm90IGZyb20gb3duZXJcblx0XHRcdFx0aWYgKGVudGl0eVR5cGVPZk93bmVyUGFydG5lciAhPT0gb3duZXJFbnRpdHlUeXBlKSB7XG5cdFx0XHRcdFx0Ly8gaWYgdGFyZ2V0IFByb3AgaXMgbm90IGZyb20gb3duZXIsIHdlIGFkZCBpdCBhcyBpbW1lZGlhdGVcblx0XHRcdFx0XHRhVGFyZ2V0cy5wdXNoKHRhcmdldEVudGl0eSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gaWYgdGhlcmUgaXMgbm8gJFBhcnRuZXIgYXR0cmlidXRlLCBpdCBtYXkgbm90IGJlIGZyb20gb3duZXJcblx0XHRcdGFUYXJnZXRzLnB1c2godGFyZ2V0RW50aXR5KTtcblx0XHR9XG5cdFx0cmV0dXJuIGFUYXJnZXRzO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHaXZlIHRhcmdldHMgdGhhdCBhcmUgaW1tZWRpYXRlIG9yIGRlZmVycmVkIGJhc2VkIG9uIHRoZSBlbnRpdHkgdHlwZSBvZiB0aGF0IHRhcmdldC5cblx0ICpcblx0ICpcblx0ICogQHBhcmFtIHNpZGVFZmZlY3RzRGF0YVxuXHQgKiBAcGFyYW0gb0VudGl0eVNldENvbnRleHRcblx0ICogQHBhcmFtIHNFbnRpdHlUeXBlXG5cdCAqIEBwYXJhbSBvTWV0YU1vZGVsXG5cdCAqIEByZXR1cm5zIFRhcmdldHMgdG8gcmVxdWVzdCBzaWRlIGVmZmVjdHMuXG5cdCAqL1xuXHRmbkdldFRhcmdldHNGb3JNYXNzRWRpdDogZnVuY3Rpb24gKHNpZGVFZmZlY3RzRGF0YTogT0RhdGFTaWRlRWZmZWN0c1R5cGUsIG9FbnRpdHlTZXRDb250ZXh0OiBhbnksIHNFbnRpdHlUeXBlOiBhbnksIG9NZXRhTW9kZWw6IGFueSkge1xuXHRcdGNvbnN0IHsgdGFyZ2V0UHJvcGVydGllczogYVRhcmdldFByb3BlcnRpZXMsIHRhcmdldEVudGl0aWVzOiBhVGFyZ2V0RW50aXRpZXMgfSA9IHNpZGVFZmZlY3RzRGF0YTtcblx0XHRjb25zdCBhUHJvbWlzZXM6IGFueSA9IFtdO1xuXHRcdGxldCBhVGFyZ2V0czogYW55ID0gW107XG5cdFx0Y29uc3Qgb3duZXJFbnRpdHlUeXBlID0gb0VudGl0eVNldENvbnRleHQuZ2V0UHJvcGVydHkoXCIkVHlwZVwiKTtcblxuXHRcdGlmIChzRW50aXR5VHlwZSA9PT0gb3duZXJFbnRpdHlUeXBlKSB7XG5cdFx0XHQvLyBpZiBTYWxlc09yZHIgSXRlbVxuXHRcdFx0YVRhcmdldEVudGl0aWVzPy5mb3JFYWNoKCh0YXJnZXRFbnRpdHk6IGFueSkgPT4ge1xuXHRcdFx0XHR0YXJnZXRFbnRpdHkgPSB0YXJnZXRFbnRpdHlbXCIkTmF2aWdhdGlvblByb3BlcnR5UGF0aFwiXTtcblx0XHRcdFx0bGV0IGJhc2VOYXZQYXRoOiBzdHJpbmc7XG5cdFx0XHRcdGlmICh0YXJnZXRFbnRpdHkuaW5jbHVkZXMoXCIvXCIpKSB7XG5cdFx0XHRcdFx0YmFzZU5hdlBhdGggPSB0YXJnZXRFbnRpdHkuc3BsaXQoXCIvXCIpWzBdO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGJhc2VOYXZQYXRoID0gdGFyZ2V0RW50aXR5O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGFUYXJnZXRzID0gTWFzc0VkaXRIZWxwZXIuZm5HZXRFbnRpdHlUeXBlT2ZPd25lcihvTWV0YU1vZGVsLCBiYXNlTmF2UGF0aCwgb0VudGl0eVNldENvbnRleHQsIHRhcmdldEVudGl0eSwgYVRhcmdldHMpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKGFUYXJnZXRQcm9wZXJ0aWVzLmxlbmd0aCkge1xuXHRcdFx0YVRhcmdldFByb3BlcnRpZXMuZm9yRWFjaCgodGFyZ2V0UHJvcDogYW55KSA9PiB7XG5cdFx0XHRcdGNvbnN0IHsgcE93bmVyRW50aXR5IH0gPSBNYXNzRWRpdEhlbHBlci5mbkdldFBhdGhGb3JTb3VyY2VQcm9wZXJ0eSh0YXJnZXRQcm9wLCBzRW50aXR5VHlwZSwgb01ldGFNb2RlbCk7XG5cdFx0XHRcdGFQcm9taXNlcy5wdXNoKFxuXHRcdFx0XHRcdHBPd25lckVudGl0eS50aGVuKChyZXN1bHRFbnRpdHk6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0Ly8gaWYgZW50aXR5IGlzIFNhbGVzT3JkZXJJdGVtLCBUYXJnZXQgUHJvcGVydHkgaXMgZnJvbSBJdGVtcyB0YWJsZVxuXHRcdFx0XHRcdFx0aWYgKHJlc3VsdEVudGl0eSA9PT0gb3duZXJFbnRpdHlUeXBlKSB7XG5cdFx0XHRcdFx0XHRcdGFUYXJnZXRzLnB1c2godGFyZ2V0UHJvcCk7IC8vIGdldCBpbW1lZGlhdGUgdGFyZ2V0c1xuXHRcdFx0XHRcdFx0fSBlbHNlIGlmICh0YXJnZXRQcm9wLmluY2x1ZGVzKFwiL1wiKSkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBiYXNlTmF2UGF0aCA9IHRhcmdldFByb3Auc3BsaXQoXCIvXCIpWzBdO1xuXHRcdFx0XHRcdFx0XHRhVGFyZ2V0cyA9IE1hc3NFZGl0SGVscGVyLmZuR2V0RW50aXR5VHlwZU9mT3duZXIoXG5cdFx0XHRcdFx0XHRcdFx0b01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdFx0XHRiYXNlTmF2UGF0aCxcblx0XHRcdFx0XHRcdFx0XHRvRW50aXR5U2V0Q29udGV4dCxcblx0XHRcdFx0XHRcdFx0XHR0YXJnZXRQcm9wLFxuXHRcdFx0XHRcdFx0XHRcdGFUYXJnZXRzXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFUYXJnZXRzKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQpO1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFQcm9taXNlcy5wdXNoKFByb21pc2UucmVzb2x2ZShhVGFyZ2V0cykpO1xuXHRcdH1cblxuXHRcdHJldHVybiBQcm9taXNlLmFsbChhUHJvbWlzZXMpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGNoZWNrcyBpZiBpbiB0aGUgZ2l2ZW4gc2lkZSBFZmZlY3RzIE9iaiwgaWYgX0l0ZW0gaXMgc2V0IGFzIFRhcmdldCBFbnRpdHkgZm9yIGFueSBzaWRlIEVmZmVjdHMgb25cblx0ICogb3RoZXIgZW50aXR5IHNldC5cblx0ICpcblx0ICogQHBhcmFtIHNpZGVFZmZlY3RzTWFwXG5cdCAqIEBwYXJhbSBvRW50aXR5U2V0Q29udGV4dFxuXHQgKiBAcmV0dXJucyBMZW5ndGggb2Ygc2lkZUVmZmVjdHNBcnJheSB3aGVyZSBjdXJyZW50IEVudGl0eSBpcyBzZXQgYXMgVGFyZ2V0IEVudGl0eVxuXHQgKi9cblx0Y2hlY2tJZkVudGl0eUV4aXN0c0FzVGFyZ2V0RW50aXR5OiAoXG5cdFx0c2lkZUVmZmVjdHNNYXA6IE1hc3NFZGl0RmllbGRTaWRlRWZmZWN0RGljdGlvbmFyeSB8IEZpZWxkU2lkZUVmZmVjdERpY3Rpb25hcnksXG5cdFx0b0VudGl0eVNldENvbnRleHQ6IENvbnRleHRcblx0KSA9PiB7XG5cdFx0Y29uc3Qgb3duZXJFbnRpdHlUeXBlID0gb0VudGl0eVNldENvbnRleHQuZ2V0UHJvcGVydHkoXCIkVHlwZVwiKTtcblx0XHRjb25zdCBzaWRlRWZmZWN0c09uT3RoZXJFbnRpdHk6IE1hc3NFZGl0RmllbGRTaWRlRWZmZWN0UHJvcGVydHlUeXBlW10gPSBPYmplY3QudmFsdWVzKHNpZGVFZmZlY3RzTWFwKS5maWx0ZXIoXG5cdFx0XHQob2JqOiBNYXNzRWRpdEZpZWxkU2lkZUVmZmVjdFByb3BlcnR5VHlwZSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gb2JqLm5hbWUuaW5kZXhPZihvd25lckVudGl0eVR5cGUpID09IC0xO1xuXHRcdFx0fVxuXHRcdCk7XG5cblx0XHRjb25zdCBlbnRpdHlTZXROYW1lID0gb0VudGl0eVNldENvbnRleHQuZ2V0UGF0aCgpLnNwbGl0KFwiL1wiKS5wb3AoKTtcblx0XHRjb25zdCBzaWRlRWZmZWN0c1dpdGhDdXJyZW50RW50aXR5QXNUYXJnZXQgPSBzaWRlRWZmZWN0c09uT3RoZXJFbnRpdHkuZmlsdGVyKChvYmo6IE1hc3NFZGl0RmllbGRTaWRlRWZmZWN0UHJvcGVydHlUeXBlKSA9PiB7XG5cdFx0XHRjb25zdCB0YXJnZXRFbnRpdGllc0FycmF5OiBTaWRlRWZmZWN0c0VudGl0eVR5cGVbXSB8IHVuZGVmaW5lZCA9IG9iai5zaWRlRWZmZWN0cy50YXJnZXRFbnRpdGllcztcblx0XHRcdHJldHVybiB0YXJnZXRFbnRpdGllc0FycmF5Py5maWx0ZXIoKGlubmVyT2JqOiBTaWRlRWZmZWN0c0VudGl0eVR5cGUpID0+IGlubmVyT2JqW1wiJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIl0gPT09IGVudGl0eVNldE5hbWUpXG5cdFx0XHRcdC5sZW5ndGhcblx0XHRcdFx0PyBvYmpcblx0XHRcdFx0OiBmYWxzZTtcblx0XHR9KTtcblx0XHRyZXR1cm4gc2lkZUVmZmVjdHNXaXRoQ3VycmVudEVudGl0eUFzVGFyZ2V0Lmxlbmd0aDtcblx0fSxcblxuXHQvKipcblx0ICogVXBvbiB1cGRhdGluZyB0aGUgZmllbGQsIGFycmF5IG9mIGltbWVkaWF0ZSBhbmQgZGVmZXJyZWQgc2lkZSBlZmZlY3RzIGZvciB0aGF0IGZpZWxkIGFyZSBjcmVhdGVkLlxuXHQgKiBJZiB0aGVyZSBhcmUgYW55IGZhaWxlZCBzaWRlIGVmZmVjdHMgZm9yIHRoYXQgY29udGV4dCwgdGhleSB3aWxsIGFsc28gYmUgdXNlZCB0byBnZW5lcmF0ZSB0aGUgbWFwLlxuXHQgKiBJZiB0aGUgZmllbGQgaGFzIHRleHQgYXNzb2NpYXRlZCB3aXRoIGl0LCB0aGVuIGFkZCBpdCB0byByZXF1ZXN0IHNpZGUgZWZmZWN0cy5cblx0ICpcblx0ICogQHBhcmFtIG1QYXJhbXNcblx0ICogQHBhcmFtIG1QYXJhbXMub0NvbnRyb2xsZXIgQ29udHJvbGxlclxuXHQgKiBAcGFyYW0gbVBhcmFtcy5vRmllbGRQcm9taXNlIFByb21pc2UgdG8gdXBkYXRlIGZpZWxkXG5cdCAqIEBwYXJhbSBtUGFyYW1zLnNpZGVFZmZlY3RNYXAgU2lkZUVmZmVjdHNNYXAgZm9yIHRoZSBmaWVsZFxuXHQgKiBAcGFyYW0gbVBhcmFtcy50ZXh0UGF0aHMgVGV4dFBhdGhzIG9mIHRoZSBmaWVsZCBpZiBhbnlcblx0ICogQHBhcmFtIG1QYXJhbXMuZ3JvdXBJZCBHcm91cCBJZCB0byB1c2VkIHRvIGdyb3VwIHJlcXVlc3RzXG5cdCAqIEBwYXJhbSBtUGFyYW1zLmtleSBLZXlWYWx1ZSBvZiB0aGUgZmllbGRcblx0ICogQHBhcmFtIG1QYXJhbXMub0VudGl0eVNldENvbnRleHQgRW50aXR5U2V0Y29udGV4dFxuXHQgKiBAcGFyYW0gbVBhcmFtcy5vTWV0YU1vZGVsIE1ldGFtb2RlbCBkYXRhXG5cdCAqIEBwYXJhbSBtUGFyYW1zLnNlbGVjdGVkQ29udGV4dCBTZWxlY3RlZCByb3cgY29udGV4dFxuXHQgKiBAcGFyYW0gbVBhcmFtcy5kZWZlcnJlZFRhcmdldHNGb3JBUXVhbGlmaWVkTmFtZSBEZWZlcnJlZCB0YXJnZXRzIGRhdGFcblx0ICogQHJldHVybnMgUHJvbWlzZSBmb3IgYWxsIGltbWVkaWF0ZWx5IHJlcXVlc3RlZCBzaWRlIGVmZmVjdHMuXG5cdCAqL1xuXHRoYW5kbGVNYXNzRWRpdEZpZWxkVXBkYXRlQW5kUmVxdWVzdFNpZGVFZmZlY3RzOiBhc3luYyBmdW5jdGlvbiAobVBhcmFtczogRGF0YVRvVXBkYXRlRmllbGRBbmRTaWRlRWZmZWN0c1R5cGUpIHtcblx0XHRjb25zdCB7XG5cdFx0XHRvQ29udHJvbGxlcixcblx0XHRcdG9GaWVsZFByb21pc2UsXG5cdFx0XHRzaWRlRWZmZWN0c01hcCxcblx0XHRcdHRleHRQYXRocyxcblx0XHRcdGdyb3VwSWQsXG5cdFx0XHRrZXksXG5cdFx0XHRvRW50aXR5U2V0Q29udGV4dCxcblx0XHRcdG9NZXRhTW9kZWwsXG5cdFx0XHRvU2VsZWN0ZWRDb250ZXh0LFxuXHRcdFx0ZGVmZXJyZWRUYXJnZXRzRm9yQVF1YWxpZmllZE5hbWVcblx0XHR9ID0gbVBhcmFtcztcblx0XHRjb25zdCBpbW1lZGlhdGVTaWRlRWZmZWN0c1Byb21pc2VzID0gW29GaWVsZFByb21pc2VdO1xuXHRcdGNvbnN0IG93bmVyRW50aXR5VHlwZSA9IG9FbnRpdHlTZXRDb250ZXh0LmdldFByb3BlcnR5KFwiJFR5cGVcIik7XG5cdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudChvQ29udHJvbGxlci5nZXRWaWV3KCkpO1xuXHRcdGNvbnN0IG9TaWRlRWZmZWN0c1NlcnZpY2UgPSBvQXBwQ29tcG9uZW50LmdldFNpZGVFZmZlY3RzU2VydmljZSgpO1xuXG5cdFx0Y29uc3QgaXNTaWRlRWZmZWN0c1dpdGhDdXJyZW50RW50aXR5QXNUYXJnZXQgPSBNYXNzRWRpdEhlbHBlci5jaGVja0lmRW50aXR5RXhpc3RzQXNUYXJnZXRFbnRpdHkoc2lkZUVmZmVjdHNNYXAsIG9FbnRpdHlTZXRDb250ZXh0KTtcblxuXHRcdGlmIChzaWRlRWZmZWN0c01hcCkge1xuXHRcdFx0Y29uc3QgYWxsRW50aXR5VHlwZXNXaXRoUXVhbGlmaWVyID0gT2JqZWN0LmtleXMoc2lkZUVmZmVjdHNNYXApO1xuXHRcdFx0Y29uc3Qgc2lkZUVmZmVjdHNEYXRhRm9yRmllbGQ6IGFueSA9IE9iamVjdC52YWx1ZXMoc2lkZUVmZmVjdHNNYXApO1xuXG5cdFx0XHRjb25zdCBtVmlzaXRlZFNpZGVFZmZlY3RzOiBhbnkgPSB7fTtcblx0XHRcdGRlZmVycmVkVGFyZ2V0c0ZvckFRdWFsaWZpZWROYW1lW2tleV0gPSB7fTtcblx0XHRcdGZvciAoY29uc3QgW2luZGV4LCBkYXRhXSBvZiBzaWRlRWZmZWN0c0RhdGFGb3JGaWVsZC5lbnRyaWVzKCkpIHtcblx0XHRcdFx0Y29uc3QgZW50aXR5VHlwZVdpdGhRdWFsaWZpZXIgPSBhbGxFbnRpdHlUeXBlc1dpdGhRdWFsaWZpZXJbaW5kZXhdO1xuXHRcdFx0XHRjb25zdCBzRW50aXR5VHlwZSA9IGVudGl0eVR5cGVXaXRoUXVhbGlmaWVyLnNwbGl0KFwiI1wiKVswXTtcblx0XHRcdFx0Y29uc3Qgb0NvbnRleHQ6IGFueSA9IG9Db250cm9sbGVyLl9zaWRlRWZmZWN0cy5nZXRDb250ZXh0Rm9yU2lkZUVmZmVjdHMob1NlbGVjdGVkQ29udGV4dCwgc0VudGl0eVR5cGUpO1xuXHRcdFx0XHRkYXRhLmNvbnRleHQgPSBvQ29udGV4dDtcblxuXHRcdFx0XHRjb25zdCBhbGxGYWlsZWRTaWRlRWZmZWN0cyA9IG9Db250cm9sbGVyLl9zaWRlRWZmZWN0cy5nZXRSZWdpc3RlcmVkRmFpbGVkUmVxdWVzdHMoKTtcblx0XHRcdFx0Y29uc3QgYUZhaWxlZFNpZGVFZmZlY3RzID0gYWxsRmFpbGVkU2lkZUVmZmVjdHNbb0NvbnRleHQuZ2V0UGF0aCgpXTtcblx0XHRcdFx0b0NvbnRyb2xsZXIuX3NpZGVFZmZlY3RzLnVucmVnaXN0ZXJGYWlsZWRTaWRlRWZmZWN0c0ZvckFDb250ZXh0KG9Db250ZXh0KTtcblx0XHRcdFx0bGV0IHNpZGVFZmZlY3RzRm9yQ3VycmVudENvbnRleHQgPSBbZGF0YS5zaWRlRWZmZWN0c107XG5cdFx0XHRcdHNpZGVFZmZlY3RzRm9yQ3VycmVudENvbnRleHQgPVxuXHRcdFx0XHRcdGFGYWlsZWRTaWRlRWZmZWN0cyAmJiBhRmFpbGVkU2lkZUVmZmVjdHMubGVuZ3RoXG5cdFx0XHRcdFx0XHQ/IHNpZGVFZmZlY3RzRm9yQ3VycmVudENvbnRleHQuY29uY2F0KGFGYWlsZWRTaWRlRWZmZWN0cylcblx0XHRcdFx0XHRcdDogc2lkZUVmZmVjdHNGb3JDdXJyZW50Q29udGV4dDtcblx0XHRcdFx0bVZpc2l0ZWRTaWRlRWZmZWN0c1tvQ29udGV4dF0gPSB7fTtcblx0XHRcdFx0Zm9yIChjb25zdCBhU2lkZUVmZmVjdCBvZiBzaWRlRWZmZWN0c0ZvckN1cnJlbnRDb250ZXh0KSB7XG5cdFx0XHRcdFx0aWYgKCFtVmlzaXRlZFNpZGVFZmZlY3RzW29Db250ZXh0XS5oYXNPd25Qcm9wZXJ0eShhU2lkZUVmZmVjdC5mdWxseVF1YWxpZmllZE5hbWUpKSB7XG5cdFx0XHRcdFx0XHRtVmlzaXRlZFNpZGVFZmZlY3RzW29Db250ZXh0XVthU2lkZUVmZmVjdC5mdWxseVF1YWxpZmllZE5hbWVdID0gdHJ1ZTtcblx0XHRcdFx0XHRcdGxldCBhSW1tZWRpYXRlVGFyZ2V0czogYW55W10gPSBbXSxcblx0XHRcdFx0XHRcdFx0YWxsVGFyZ2V0czogYW55W10gPSBbXSxcblx0XHRcdFx0XHRcdFx0dHJpZ2dlckFjdGlvbk5hbWU6IFN0cmluZyB8IHVuZGVmaW5lZDtcblxuXHRcdFx0XHRcdFx0Y29uc3QgZm5HZXRJbW1lZGlhdGVUYXJnZXRzQW5kQWN0aW9ucyA9IGFzeW5jIGZ1bmN0aW9uIChtU2lkZUVmZmVjdDogT0RhdGFTaWRlRWZmZWN0c1R5cGUpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgeyB0YXJnZXRQcm9wZXJ0aWVzOiBhVGFyZ2V0UHJvcGVydGllcywgdGFyZ2V0RW50aXRpZXM6IGFUYXJnZXRFbnRpdGllcyB9ID0gbVNpZGVFZmZlY3Q7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHNpZGVFZmZlY3RFbnRpdHlUeXBlID0gbVNpZGVFZmZlY3QuZnVsbHlRdWFsaWZpZWROYW1lLnNwbGl0KFwiQFwiKVswXTtcblx0XHRcdFx0XHRcdFx0Y29uc3QgdGFyZ2V0c0FycmF5Rm9yQWxsUHJvcGVydGllcyA9IGF3YWl0IE1hc3NFZGl0SGVscGVyLmZuR2V0VGFyZ2V0c0Zvck1hc3NFZGl0KFxuXHRcdFx0XHRcdFx0XHRcdG1TaWRlRWZmZWN0LFxuXHRcdFx0XHRcdFx0XHRcdG9FbnRpdHlTZXRDb250ZXh0LFxuXHRcdFx0XHRcdFx0XHRcdHNpZGVFZmZlY3RFbnRpdHlUeXBlLFxuXHRcdFx0XHRcdFx0XHRcdG9NZXRhTW9kZWxcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0YUltbWVkaWF0ZVRhcmdldHMgPSB0YXJnZXRzQXJyYXlGb3JBbGxQcm9wZXJ0aWVzWzBdO1xuXHRcdFx0XHRcdFx0XHRhbGxUYXJnZXRzID0gKGFUYXJnZXRQcm9wZXJ0aWVzIHx8IFtdKS5jb25jYXQoKGFUYXJnZXRFbnRpdGllcyBhcyBhbnlbXSkgfHwgW10pO1xuXG5cdFx0XHRcdFx0XHRcdGNvbnN0IGFjdGlvbk5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IG1TaWRlRWZmZWN0LnRyaWdnZXJBY3Rpb247XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGFEZWZlcnJlZFRhcmdldHMgPSBhbGxUYXJnZXRzLmZpbHRlcigodGFyZ2V0OiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gIWFJbW1lZGlhdGVUYXJnZXRzLmluY2x1ZGVzKHRhcmdldCk7XG5cdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdGRlZmVycmVkVGFyZ2V0c0ZvckFRdWFsaWZpZWROYW1lW2tleV1bbVNpZGVFZmZlY3QuZnVsbHlRdWFsaWZpZWROYW1lXSA9IHtcblx0XHRcdFx0XHRcdFx0XHRhVGFyZ2V0czogYURlZmVycmVkVGFyZ2V0cyxcblx0XHRcdFx0XHRcdFx0XHRvQ29udGV4dDogb0NvbnRleHQsXG5cdFx0XHRcdFx0XHRcdFx0bVNpZGVFZmZlY3Rcblx0XHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0XHQvLyBpZiBlbnRpdHkgaXMgb3RoZXIgdGhhbiBpdGVtcyB0YWJsZSB0aGVuIGFjdGlvbiBpcyBkZWZlcmVkXG5cdFx0XHRcdFx0XHRcdGlmIChhY3Rpb25OYW1lICYmIHNpZGVFZmZlY3RFbnRpdHlUeXBlID09PSBvd25lckVudGl0eVR5cGUpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBzdGF0aWMgYWN0aW9uIGlzIG9uIGNvbGxlY3Rpb24sIHNvIHdlIGRlZmVyIGl0LCBlbHNlIGFkZCB0byBpbW1lZGlhdGUgcmVxdWVzdHMgYXJyYXlcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBpc1N0YXRpY0FjdGlvbiA9IFRhYmxlSGVscGVyLl9pc1N0YXRpY0FjdGlvbihvTWV0YU1vZGVsLmdldE9iamVjdChgLyR7YWN0aW9uTmFtZX1gKSwgYWN0aW9uTmFtZSk7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKCFpc1N0YXRpY0FjdGlvbikge1xuXHRcdFx0XHRcdFx0XHRcdFx0dHJpZ2dlckFjdGlvbk5hbWUgPSBhY3Rpb25OYW1lO1xuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRkZWZlcnJlZFRhcmdldHNGb3JBUXVhbGlmaWVkTmFtZVtrZXldW21TaWRlRWZmZWN0LmZ1bGx5UXVhbGlmaWVkTmFtZV1bXCJUcmlnZ2VyQWN0aW9uXCJdID0gYWN0aW9uTmFtZTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0ZGVmZXJyZWRUYXJnZXRzRm9yQVF1YWxpZmllZE5hbWVba2V5XVttU2lkZUVmZmVjdC5mdWxseVF1YWxpZmllZE5hbWVdW1wiVHJpZ2dlckFjdGlvblwiXSA9IGFjdGlvbk5hbWU7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoaXNTaWRlRWZmZWN0c1dpdGhDdXJyZW50RW50aXR5QXNUYXJnZXQpIHtcblx0XHRcdFx0XHRcdFx0XHRhSW1tZWRpYXRlVGFyZ2V0cyA9IFtdO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdFx0YVRhcmdldHM6IGFJbW1lZGlhdGVUYXJnZXRzLFxuXHRcdFx0XHRcdFx0XHRcdFRyaWdnZXJBY3Rpb246IHRyaWdnZXJBY3Rpb25OYW1lXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0aW1tZWRpYXRlU2lkZUVmZmVjdHNQcm9taXNlcy5wdXNoKFxuXHRcdFx0XHRcdFx0XHRvQ29udHJvbGxlci5fc2lkZUVmZmVjdHMucmVxdWVzdFNpZGVFZmZlY3RzKGFTaWRlRWZmZWN0LCBvQ29udGV4dCwgZ3JvdXBJZCwgZm5HZXRJbW1lZGlhdGVUYXJnZXRzQW5kQWN0aW9ucylcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICh0ZXh0UGF0aHM/LltrZXldICYmIHRleHRQYXRoc1trZXldLmxlbmd0aCkge1xuXHRcdFx0aW1tZWRpYXRlU2lkZUVmZmVjdHNQcm9taXNlcy5wdXNoKG9TaWRlRWZmZWN0c1NlcnZpY2UucmVxdWVzdFNpZGVFZmZlY3RzKHRleHRQYXRoc1trZXldLCBvU2VsZWN0ZWRDb250ZXh0LCBncm91cElkKSk7XG5cdFx0fVxuXHRcdHJldHVybiAoUHJvbWlzZSBhcyBhbnkpLmFsbFNldHRsZWQoaW1tZWRpYXRlU2lkZUVmZmVjdHNQcm9taXNlcyk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENyZWF0ZSB0aGUgbWFzcyBlZGl0IGRpYWxvZy5cblx0ICpcblx0ICogQHBhcmFtIG9UYWJsZSBJbnN0YW5jZSBvZiBUYWJsZVxuXHQgKiBAcGFyYW0gYUNvbnRleHRzIENvbnRleHRzIGZvciBtYXNzIGVkaXRcblx0ICogQHBhcmFtIG9Db250cm9sbGVyIENvbnRyb2xsZXIgZm9yIHRoZSB2aWV3XG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmV0dXJuaW5nIGluc3RhbmNlIG9mIGRpYWxvZy5cblx0ICovXG5cdGNyZWF0ZURpYWxvZzogYXN5bmMgZnVuY3Rpb24gKG9UYWJsZTogVGFibGUsIGFDb250ZXh0czogYW55W10sIG9Db250cm9sbGVyOiBQYWdlQ29udHJvbGxlcik6IFByb21pc2U8YW55PiB7XG5cdFx0Y29uc3Qgc0ZyYWdtZW50TmFtZSA9IFwic2FwL2ZlL2NvcmUvY29udHJvbHMvbWFzc0VkaXQvTWFzc0VkaXREaWFsb2dcIixcblx0XHRcdGFEYXRhQXJyYXk6IGFueVtdID0gW10sXG5cdFx0XHRvUmVzb3VyY2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpLFxuXHRcdFx0b0RlZmF1bHRWYWx1ZXMgPSBNYXNzRWRpdEhlbHBlci5nZXREZWZhdWx0VGV4dHNGb3JEaWFsb2cob1Jlc291cmNlQnVuZGxlLCBhQ29udGV4dHMubGVuZ3RoLCBvVGFibGUpLFxuXHRcdFx0b0RhdGFGaWVsZE1vZGVsID0gTWFzc0VkaXRIZWxwZXIucHJlcGFyZURhdGFGb3JEaWFsb2cob1RhYmxlLCBhQ29udGV4dHMsIGFEYXRhQXJyYXkpLFxuXHRcdFx0ZGlhbG9nQ29udGV4dCA9IE1hc3NFZGl0SGVscGVyLmdldERpYWxvZ0NvbnRleHQob1RhYmxlKSxcblx0XHRcdG9EaWFsb2dEYXRhTW9kZWwgPSBNYXNzRWRpdEhlbHBlci5zZXRSdW50aW1lTW9kZWxPbkRpYWxvZyhhQ29udGV4dHMsIGFEYXRhQXJyYXksIG9EZWZhdWx0VmFsdWVzLCBkaWFsb2dDb250ZXh0KSxcblx0XHRcdG1vZGVsID0gb1RhYmxlLmdldE1vZGVsKCksXG5cdFx0XHRtZXRhTW9kZWwgPSBtb2RlbC5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCxcblx0XHRcdGl0ZW1zTW9kZWwgPSBuZXcgVGVtcGxhdGVNb2RlbChvRGF0YUZpZWxkTW9kZWwuZ2V0RGF0YSgpLCBtZXRhTW9kZWwpO1xuXG5cdFx0Y29uc3Qgb0ZyYWdtZW50ID0gWE1MVGVtcGxhdGVQcm9jZXNzb3IubG9hZFRlbXBsYXRlKHNGcmFnbWVudE5hbWUsIFwiZnJhZ21lbnRcIik7XG5cblx0XHRjb25zdCBvQ3JlYXRlZEZyYWdtZW50ID0gYXdhaXQgUHJvbWlzZS5yZXNvbHZlKFxuXHRcdFx0WE1MUHJlcHJvY2Vzc29yLnByb2Nlc3MoXG5cdFx0XHRcdG9GcmFnbWVudCxcblx0XHRcdFx0eyBuYW1lOiBzRnJhZ21lbnROYW1lIH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRiaW5kaW5nQ29udGV4dHM6IHtcblx0XHRcdFx0XHRcdGRhdGFGaWVsZE1vZGVsOiBpdGVtc01vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKSxcblx0XHRcdFx0XHRcdG1ldGFNb2RlbDogbWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKSxcblx0XHRcdFx0XHRcdGNvbnRleHRQYXRoOiBtZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQobWV0YU1vZGVsLmdldE1ldGFQYXRoKGRpYWxvZ0NvbnRleHQuZ2V0UGF0aCgpKSlcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG1vZGVsczoge1xuXHRcdFx0XHRcdFx0ZGF0YUZpZWxkTW9kZWw6IGl0ZW1zTW9kZWwsXG5cdFx0XHRcdFx0XHRtZXRhTW9kZWw6IG1ldGFNb2RlbCxcblx0XHRcdFx0XHRcdGNvbnRleHRQYXRoOiBtZXRhTW9kZWxcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdClcblx0XHQpO1xuXHRcdGNvbnN0IG9EaWFsb2dDb250ZW50ID0gYXdhaXQgRnJhZ21lbnQubG9hZCh7IGRlZmluaXRpb246IG9DcmVhdGVkRnJhZ21lbnQgfSk7XG5cdFx0Y29uc3Qgb0RpYWxvZyA9IG5ldyBEaWFsb2coe1xuXHRcdFx0cmVzaXphYmxlOiB0cnVlLFxuXHRcdFx0dGl0bGU6IG9EZWZhdWx0VmFsdWVzLm1hc3NFZGl0VGl0bGUsXG5cdFx0XHRjb250ZW50OiBbb0RpYWxvZ0NvbnRlbnQgYXMgYW55XSxcblx0XHRcdGFmdGVyT3BlbjogTWFzc0VkaXRIZWxwZXIub25EaWFsb2dPcGVuLFxuXHRcdFx0YmVnaW5CdXR0b246IG5ldyBCdXR0b24oe1xuXHRcdFx0XHR0ZXh0OiBNYXNzRWRpdEhlbHBlci5oZWxwZXJzLmdldEV4cEJpbmRpbmdGb3JBcHBseUJ1dHRvblR4dChvRGVmYXVsdFZhbHVlcywgb0RhdGFGaWVsZE1vZGVsLmdldE9iamVjdChcIi9cIikpLFxuXHRcdFx0XHR0eXBlOiBcIkVtcGhhc2l6ZWRcIixcblx0XHRcdFx0cHJlc3M6IGFzeW5jIGZ1bmN0aW9uIChvRXZlbnQ6IGFueSkge1xuXHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGluZy5yZW1vdmVCb3VuZFRyYW5zaXRpb25NZXNzYWdlcygpO1xuXHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGluZy5yZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0XHRcdFx0KG9Db250cm9sbGVyLmdldFZpZXcoKT8uZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dCk/LnNldFByb3BlcnR5KFwic2tpcFBhdGNoSGFuZGxlcnNcIiwgdHJ1ZSk7XG5cdFx0XHRcdFx0Y29uc3QgYXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KG9Db250cm9sbGVyLmdldFZpZXcoKSk7XG5cdFx0XHRcdFx0Y29uc3Qgb0luRGlhbG9nID0gb0V2ZW50LmdldFNvdXJjZSgpLmdldFBhcmVudCgpO1xuXHRcdFx0XHRcdGNvbnN0IG9Nb2RlbCA9IG9JbkRpYWxvZy5nZXRNb2RlbChcImZpZWxkc0luZm9cIik7XG5cdFx0XHRcdFx0Y29uc3QgYVJlc3VsdHMgPSBvTW9kZWwuZ2V0UHJvcGVydHkoXCIvcmVzdWx0c1wiKTtcblxuXHRcdFx0XHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvVGFibGUgJiYgKG9UYWJsZS5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpIGFzIGFueSksXG5cdFx0XHRcdFx0XHRzQ3VycmVudEVudGl0eVNldE5hbWUgPSBvVGFibGUuZGF0YShcIm1ldGFQYXRoXCIpLFxuXHRcdFx0XHRcdFx0b0VudGl0eVNldENvbnRleHQgPSBvTWV0YU1vZGVsLmdldENvbnRleHQoc0N1cnJlbnRFbnRpdHlTZXROYW1lKTtcblx0XHRcdFx0XHRjb25zdCBlcnJvckNvbnRleHRzOiBhbnlbXSA9IFtdO1xuXHRcdFx0XHRcdGNvbnN0IHRleHRQYXRocyA9IG9Nb2RlbC5nZXRQcm9wZXJ0eShcIi90ZXh0UGF0aHNcIik7XG5cdFx0XHRcdFx0Y29uc3QgYVByb3BlcnR5UmVhZGFibGVJbmZvID0gb01vZGVsLmdldFByb3BlcnR5KFwiL3JlYWRhYmxlUHJvcGVydHlEYXRhXCIpO1xuXHRcdFx0XHRcdGxldCBncm91cElkOiBzdHJpbmc7XG5cdFx0XHRcdFx0bGV0IGFsbFNpZGVFZmZlY3RzOiBhbnlbXTtcblx0XHRcdFx0XHRjb25zdCBtYXNzRWRpdFByb21pc2VzOiBhbnkgPSBbXTtcblx0XHRcdFx0XHRjb25zdCBmYWlsZWRGaWVsZHNEYXRhOiBhbnkgPSB7fTtcblx0XHRcdFx0XHRjb25zdCBzZWxlY3RlZFJvd3NMZW5ndGggPSBhQ29udGV4dHMubGVuZ3RoO1xuXHRcdFx0XHRcdGNvbnN0IGRlZmVycmVkVGFyZ2V0c0ZvckFRdWFsaWZpZWROYW1lOiBhbnkgPSB7fTtcblx0XHRcdFx0XHRjb25zdCBiYXNlU2lkZUVmZmVjdHNNYXBBcnJheSA9IE1hc3NFZGl0SGVscGVyLmdldFNpZGVFZmZlY3REYXRhRm9yS2V5KFxuXHRcdFx0XHRcdFx0b0VudGl0eVNldENvbnRleHQsXG5cdFx0XHRcdFx0XHRhcHBDb21wb25lbnQsXG5cdFx0XHRcdFx0XHRvQ29udHJvbGxlcixcblx0XHRcdFx0XHRcdGFSZXN1bHRzXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHQvL2NvbnN0IGNoYW5nZVByb21pc2U6IGFueVtdID0gW107XG5cdFx0XHRcdFx0Ly9sZXQgYlJlYWRPbmx5RmllbGQgPSBmYWxzZTtcblx0XHRcdFx0XHQvL2NvbnN0IGVycm9yQ29udGV4dHM6IG9iamVjdFtdID0gW107XG5cblx0XHRcdFx0XHRhQ29udGV4dHMuZm9yRWFjaChmdW5jdGlvbiAob1NlbGVjdGVkQ29udGV4dDogYW55LCBpZHg6IG51bWJlcikge1xuXHRcdFx0XHRcdFx0YWxsU2lkZUVmZmVjdHMgPSBbXTtcblx0XHRcdFx0XHRcdGFSZXN1bHRzLmZvckVhY2goYXN5bmMgZnVuY3Rpb24gKG9SZXN1bHQ6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRpZiAoIWZhaWxlZEZpZWxkc0RhdGEuaGFzT3duUHJvcGVydHkob1Jlc3VsdC5rZXlWYWx1ZSkpIHtcblx0XHRcdFx0XHRcdFx0XHRmYWlsZWRGaWVsZHNEYXRhW29SZXN1bHQua2V5VmFsdWVdID0gMDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHQvL1RPRE8gLSBBZGQgc2F2ZSBpbXBsZW1lbnRhdGlvbiBmb3IgVmFsdWUgSGVscC5cblx0XHRcdFx0XHRcdFx0aWYgKGJhc2VTaWRlRWZmZWN0c01hcEFycmF5W29SZXN1bHQua2V5VmFsdWVdKSB7XG5cdFx0XHRcdFx0XHRcdFx0YWxsU2lkZUVmZmVjdHNbb1Jlc3VsdC5rZXlWYWx1ZV0gPSBiYXNlU2lkZUVmZmVjdHNNYXBBcnJheVtvUmVzdWx0LmtleVZhbHVlXTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChhUHJvcGVydHlSZWFkYWJsZUluZm8pIHtcblx0XHRcdFx0XHRcdFx0XHRhUHJvcGVydHlSZWFkYWJsZUluZm8uc29tZShmdW5jdGlvbiAob1Byb3BlcnR5SW5mbzogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAob1Jlc3VsdC5rZXlWYWx1ZSA9PT0gb1Byb3BlcnR5SW5mby5wcm9wZXJ0eSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAob1Byb3BlcnR5SW5mby50eXBlID09PSBcIkRlZmF1bHRcIikge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBvUHJvcGVydHlJbmZvLnZhbHVlID09PSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9Qcm9wZXJ0eUluZm8udHlwZSA9PT0gXCJQYXRoXCIgJiZcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvUHJvcGVydHlJbmZvLnByb3BlcnR5VmFsdWUgJiZcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvUHJvcGVydHlJbmZvLnByb3BlcnR5UGF0aFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gb1NlbGVjdGVkQ29udGV4dC5nZXRPYmplY3Qob1Byb3BlcnR5SW5mby5wcm9wZXJ0eVBhdGgpID09PSBvUHJvcGVydHlJbmZvLnByb3BlcnR5VmFsdWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRncm91cElkID0gYCRhdXRvLiR7aWR4fWA7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9GaWVsZFByb21pc2UgPSBvU2VsZWN0ZWRDb250ZXh0XG5cdFx0XHRcdFx0XHRcdFx0LnNldFByb3BlcnR5KG9SZXN1bHQua2V5VmFsdWUsIG9SZXN1bHQudmFsdWUsIGdyb3VwSWQpXG5cdFx0XHRcdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0ZXJyb3JDb250ZXh0cy5wdXNoKG9TZWxlY3RlZENvbnRleHQuZ2V0T2JqZWN0KCkpO1xuXHRcdFx0XHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiTWFzcyBFZGl0OiBTb21ldGhpbmcgd2VudCB3cm9uZyBpbiB1cGRhdGluZyBlbnRyaWVzLlwiLCBvRXJyb3IpO1xuXHRcdFx0XHRcdFx0XHRcdFx0ZmFpbGVkRmllbGRzRGF0YVtvUmVzdWx0LmtleVZhbHVlXSA9IGZhaWxlZEZpZWxkc0RhdGFbb1Jlc3VsdC5rZXlWYWx1ZV0gKyAxO1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KHsgaXNGaWVsZFVwZGF0ZUZhaWxlZDogdHJ1ZSB9KTtcblx0XHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0XHRjb25zdCBkYXRhVG9VcGRhdGVGaWVsZEFuZFNpZGVFZmZlY3RzOiBEYXRhVG9VcGRhdGVGaWVsZEFuZFNpZGVFZmZlY3RzVHlwZSA9IHtcblx0XHRcdFx0XHRcdFx0XHRvQ29udHJvbGxlcixcblx0XHRcdFx0XHRcdFx0XHRvRmllbGRQcm9taXNlLFxuXHRcdFx0XHRcdFx0XHRcdHNpZGVFZmZlY3RzTWFwOiBiYXNlU2lkZUVmZmVjdHNNYXBBcnJheVtvUmVzdWx0LmtleVZhbHVlXSxcblx0XHRcdFx0XHRcdFx0XHR0ZXh0UGF0aHMsXG5cdFx0XHRcdFx0XHRcdFx0Z3JvdXBJZCxcblx0XHRcdFx0XHRcdFx0XHRrZXk6IG9SZXN1bHQua2V5VmFsdWUsXG5cdFx0XHRcdFx0XHRcdFx0b0VudGl0eVNldENvbnRleHQsXG5cdFx0XHRcdFx0XHRcdFx0b01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdFx0XHRvU2VsZWN0ZWRDb250ZXh0LFxuXHRcdFx0XHRcdFx0XHRcdGRlZmVycmVkVGFyZ2V0c0ZvckFRdWFsaWZpZWROYW1lXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdG1hc3NFZGl0UHJvbWlzZXMucHVzaChcblx0XHRcdFx0XHRcdFx0XHRNYXNzRWRpdEhlbHBlci5oYW5kbGVNYXNzRWRpdEZpZWxkVXBkYXRlQW5kUmVxdWVzdFNpZGVFZmZlY3RzKGRhdGFUb1VwZGF0ZUZpZWxkQW5kU2lkZUVmZmVjdHMpXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdGF3YWl0IChQcm9taXNlIGFzIGFueSlcblx0XHRcdFx0XHRcdC5hbGxTZXR0bGVkKG1hc3NFZGl0UHJvbWlzZXMpXG5cdFx0XHRcdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdGdyb3VwSWQgPSBgJGF1dG8ubWFzc0VkaXREZWZlcnJlZGA7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGRlZmVycmVkUmVxdWVzdHMgPSBbXTtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgc2lkZUVmZmVjdHNEYXRhRm9yQWxsS2V5czogYW55ID0gT2JqZWN0LnZhbHVlcyhkZWZlcnJlZFRhcmdldHNGb3JBUXVhbGlmaWVkTmFtZSk7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGtleXNXaXRoU2lkZUVmZmVjdHM6IGFueVtdID0gT2JqZWN0LmtleXMoZGVmZXJyZWRUYXJnZXRzRm9yQVF1YWxpZmllZE5hbWUpO1xuXG5cdFx0XHRcdFx0XHRcdHNpZGVFZmZlY3RzRGF0YUZvckFsbEtleXMuZm9yRWFjaCgoYVNpZGVFZmZlY3Q6IGFueSwgaW5kZXg6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IGN1cnJlbnRLZXkgPSBrZXlzV2l0aFNpZGVFZmZlY3RzW2luZGV4XTtcblx0XHRcdFx0XHRcdFx0XHRpZiAoZmFpbGVkRmllbGRzRGF0YVtjdXJyZW50S2V5XSAhPT0gc2VsZWN0ZWRSb3dzTGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBkZWZlcnJlZFNpZGVFZmZlY3RzRGF0YSA9IE9iamVjdC52YWx1ZXMoYVNpZGVFZmZlY3QpO1xuXHRcdFx0XHRcdFx0XHRcdFx0ZGVmZXJyZWRTaWRlRWZmZWN0c0RhdGEuZm9yRWFjaCgocmVxOiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgeyBhVGFyZ2V0cywgb0NvbnRleHQsIFRyaWdnZXJBY3Rpb24sIG1TaWRlRWZmZWN0IH0gPSByZXE7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGZuR2V0RGVmZXJyZWRUYXJnZXRzID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBhVGFyZ2V0cztcblx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgZm5HZXREZWZlcnJlZFRhcmdldHNBbmRBY3Rpb25zID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhVGFyZ2V0czogZm5HZXREZWZlcnJlZFRhcmdldHMoKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFRyaWdnZXJBY3Rpb246IFRyaWdnZXJBY3Rpb25cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGRlZmVycmVkUmVxdWVzdHMucHVzaChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBpZiBzb21lIGRlZmVycmVkIGlzIHJlamVjdGVkLCBpdCB3aWxsIGJlIGFkZCB0byBmYWlsZWQgcXVldWVcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvQ29udHJvbGxlci5fc2lkZUVmZmVjdHMucmVxdWVzdFNpZGVFZmZlY3RzKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0bVNpZGVFZmZlY3QsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvQ29udGV4dCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGdyb3VwSWQsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRmbkdldERlZmVycmVkVGFyZ2V0c0FuZEFjdGlvbnNcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0TWFzc0VkaXRIZWxwZXIubWVzc2FnZUhhbmRsaW5nRm9yTWFzc0VkaXQob1RhYmxlLCBhQ29udGV4dHMsIG9Db250cm9sbGVyLCBvSW5EaWFsb2csIGFSZXN1bHRzLCBlcnJvckNvbnRleHRzKTtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQuY2F0Y2goKGU6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRNYXNzRWRpdEhlbHBlci5jbG9zZURpYWxvZyhvRGlhbG9nKTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KGUpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pLFxuXHRcdFx0ZW5kQnV0dG9uOiBuZXcgQnV0dG9uKHtcblx0XHRcdFx0dGV4dDogb0RlZmF1bHRWYWx1ZXMuY2FuY2VsQnV0dG9uVGV4dCxcblx0XHRcdFx0dmlzaWJsZTogTWFzc0VkaXRIZWxwZXIuaGVscGVycy5oYXNFZGl0YWJsZUZpZWxkc0JpbmRpbmcob0RhdGFGaWVsZE1vZGVsLmdldE9iamVjdChcIi9cIiksIHRydWUpIGFzIGFueSxcblx0XHRcdFx0cHJlc3M6IGZ1bmN0aW9uIChvRXZlbnQ6IGFueSkge1xuXHRcdFx0XHRcdGNvbnN0IG9JbkRpYWxvZyA9IG9FdmVudC5nZXRTb3VyY2UoKS5nZXRQYXJlbnQoKTtcblx0XHRcdFx0XHRNYXNzRWRpdEhlbHBlci5jbG9zZURpYWxvZyhvSW5EaWFsb2cpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdH0pO1xuXHRcdG9EaWFsb2cuc2V0TW9kZWwob0RpYWxvZ0RhdGFNb2RlbCwgXCJmaWVsZHNJbmZvXCIpO1xuXHRcdG9EaWFsb2cuc2V0TW9kZWwobW9kZWwpO1xuXHRcdG9EaWFsb2cuc2V0QmluZGluZ0NvbnRleHQoZGlhbG9nQ29udGV4dCk7XG5cdFx0cmV0dXJuIG9EaWFsb2c7XG5cdH0sXG5cblx0aGVscGVyczoge1xuXHRcdGdldEJpbmRpbmdFeHBGb3JIYXNFZGl0YWJsZUZpZWxkczogKGZpZWxkczogYW55LCBlZGl0YWJsZTogYm9vbGVhbikgPT4ge1xuXHRcdFx0Y29uc3QgdG90YWxFeHAgPSBmaWVsZHMucmVkdWNlKFxuXHRcdFx0XHQoZXhwcmVzc2lvbjogYW55LCBmaWVsZDogYW55KSA9PlxuXHRcdFx0XHRcdG9yKFxuXHRcdFx0XHRcdFx0ZXhwcmVzc2lvbixcblx0XHRcdFx0XHRcdHBhdGhJbk1vZGVsKFwiL3ZhbHVlcy9cIiArIGZpZWxkLmRhdGFQcm9wZXJ0eSArIFwiL3Zpc2libGVcIiwgXCJmaWVsZHNJbmZvXCIpIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPlxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdGNvbnN0YW50KGZhbHNlKVxuXHRcdFx0KTtcblx0XHRcdHJldHVybiBlZGl0YWJsZSA/IHRvdGFsRXhwIDogbm90KHRvdGFsRXhwKTtcblx0XHR9LFxuXG5cdFx0Z2V0RXhwQmluZGluZ0ZvckFwcGx5QnV0dG9uVHh0OiAoZGVmYXVsdFZhbHVlczogYW55LCBmaWVsZHM6IGJvb2xlYW4pID0+IHtcblx0XHRcdGNvbnN0IGVkaXRhYmxlRXhwID0gTWFzc0VkaXRIZWxwZXIuaGVscGVycy5nZXRCaW5kaW5nRXhwRm9ySGFzRWRpdGFibGVGaWVsZHMoZmllbGRzLCB0cnVlKTtcblx0XHRcdGNvbnN0IHRvdGFsRXhwID0gaWZFbHNlKGVkaXRhYmxlRXhwLCBjb25zdGFudChkZWZhdWx0VmFsdWVzLmFwcGx5QnV0dG9uVGV4dCksIGNvbnN0YW50KGRlZmF1bHRWYWx1ZXMub2tCdXR0b25UZXh0KSk7XG5cdFx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24odG90YWxFeHApO1xuXHRcdH0sXG5cblx0XHRoYXNFZGl0YWJsZUZpZWxkc0JpbmRpbmc6IChmaWVsZHM6IGFueSwgZWRpdGFibGU6IGJvb2xlYW4pID0+IHtcblx0XHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihNYXNzRWRpdEhlbHBlci5oZWxwZXJzLmdldEJpbmRpbmdFeHBGb3JIYXNFZGl0YWJsZUZpZWxkcyhmaWVsZHMsIGVkaXRhYmxlKSk7XG5cdFx0fVxuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBNYXNzRWRpdEhlbHBlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBNkVBLE1BQU1BLGNBQWMsR0FBRztJQUN0QjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLDJCQUEyQixFQUFFLFVBQVVDLEtBQWEsRUFBRUMsT0FBWSxFQUEyQjtNQUM1RixJQUFJQyxVQUFlO01BQ25CLElBQUlDLEtBQUssR0FBRyxDQUFDO01BQ2IsTUFBTUMsTUFBTSxHQUFHSixLQUFLLENBQUNLLEtBQUssQ0FBQyxHQUFHLENBQUM7TUFDL0IsSUFBSUMsU0FBUyxHQUFHLEVBQUU7TUFDbEJGLE1BQU0sQ0FBQ0csT0FBTyxDQUFDLFVBQVVDLGFBQXFCLEVBQUU7UUFDL0MsSUFBSSxDQUFDUCxPQUFPLENBQUNPLGFBQWEsQ0FBQyxJQUFJTCxLQUFLLEtBQUssQ0FBQyxFQUFFO1VBQzNDRixPQUFPLENBQUNPLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztVQUMzQk4sVUFBVSxHQUFHRCxPQUFPLENBQUNPLGFBQWEsQ0FBQztVQUNuQ0YsU0FBUyxHQUFHQSxTQUFTLEdBQUdFLGFBQWE7VUFDckNMLEtBQUssRUFBRTtRQUNSLENBQUMsTUFBTSxJQUFJLENBQUNELFVBQVUsQ0FBQ00sYUFBYSxDQUFDLEVBQUU7VUFDdENGLFNBQVMsR0FBSSxHQUFFQSxTQUFVLElBQUdFLGFBQWMsRUFBQztVQUMzQyxJQUFJRixTQUFTLEtBQUtOLEtBQUssRUFBRTtZQUN4QkUsVUFBVSxDQUFDTSxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDOUJOLFVBQVUsR0FBR0EsVUFBVSxDQUFDTSxhQUFhLENBQUM7VUFDdkMsQ0FBQyxNQUFNO1lBQ05OLFVBQVUsQ0FBQ00sYUFBYSxDQUFDLEdBQUcsRUFBRTtVQUMvQjtRQUNEO01BQ0QsQ0FBQyxDQUFDO01BQ0YsT0FBT04sVUFBVTtJQUNsQixDQUFDO0lBRUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDTyxlQUFlLEVBQUUsVUFBVUMsTUFBYyxFQUFFUCxLQUFhLEVBQUVRLElBQVcsRUFBRTtNQUN0RSxPQUFPRCxNQUFNLElBQUlFLFNBQVMsSUFBSUYsTUFBTSxJQUFJLElBQUksR0FBR0MsSUFBSSxDQUFDRSxPQUFPLENBQUNILE1BQU0sQ0FBQyxLQUFLUCxLQUFLLEdBQUdTLFNBQVM7SUFDMUYsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0UseUJBQXlCLEVBQUUsVUFBVUMsaUJBQXlCLEVBQUVDLE9BQVksRUFBRTtNQUM3RSxJQUFJQyxNQUFXO01BQ2YsSUFBSUYsaUJBQWlCLElBQUlBLGlCQUFpQixDQUFDRixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQzVELE1BQU1LLGNBQWMsR0FBR0gsaUJBQWlCLENBQUNWLEtBQUssQ0FBQyxHQUFHLENBQUM7UUFDbkRhLGNBQWMsQ0FBQ1gsT0FBTyxDQUFDLFVBQVVQLEtBQWEsRUFBRTtVQUMvQ2lCLE1BQU0sR0FBR0QsT0FBTyxJQUFJQSxPQUFPLENBQUNoQixLQUFLLENBQUMsR0FBR2dCLE9BQU8sQ0FBQ2hCLEtBQUssQ0FBQyxHQUFHaUIsTUFBTSxJQUFJQSxNQUFNLENBQUNqQixLQUFLLENBQUM7UUFDOUUsQ0FBQyxDQUFDO01BQ0g7TUFDQSxPQUFPaUIsTUFBTTtJQUNkLENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NFLCtCQUErQixFQUFFLFVBQVVDLFNBQWdCLEVBQUVMLGlCQUF5QixFQUFFO01BQ3ZGLElBQUlFLE1BQTBCO01BQzlCLElBQUlGLGlCQUFpQixJQUFJSyxTQUFTLENBQUNDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDOUMsTUFBTUMsZ0JBQWdCLEdBQUdGLFNBQVM7VUFDakNHLGVBQXNCLEdBQUcsRUFBRTtRQUM1QkQsZ0JBQWdCLENBQUNmLE9BQU8sQ0FBQyxVQUFVaUIsUUFBYSxFQUFFO1VBQ2pELE1BQU1DLFdBQVcsR0FBR0QsUUFBUSxDQUFDRSxTQUFTLEVBQUU7VUFDeEMsTUFBTUMsd0JBQXdCLEdBQzdCWixpQkFBaUIsQ0FBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJWSxXQUFXLENBQUNHLGNBQWMsQ0FBQ2IsaUJBQWlCLENBQUNWLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztVQUNuRyxJQUFJbUIsUUFBUSxLQUFLQyxXQUFXLENBQUNHLGNBQWMsQ0FBQ2IsaUJBQWlCLENBQUMsSUFBSVksd0JBQXdCLENBQUMsRUFBRTtZQUM1RkosZUFBZSxDQUFDTSxJQUFJLENBQUNMLFFBQVEsQ0FBQ0UsU0FBUyxDQUFDWCxpQkFBaUIsQ0FBQyxDQUFDO1VBQzVEO1FBQ0QsQ0FBQyxDQUFDO1FBQ0YsTUFBTWUscUJBQXFCLEdBQUdQLGVBQWUsQ0FBQ1EsTUFBTSxDQUFDakMsY0FBYyxDQUFDVyxlQUFlLENBQUM7UUFDcEYsSUFBSXFCLHFCQUFxQixDQUFDVCxNQUFNLEdBQUcsQ0FBQyxFQUFFO1VBQ3JDSixNQUFNLEdBQUksV0FBVUYsaUJBQWtCLEVBQUM7UUFDeEMsQ0FBQyxNQUFNLElBQUllLHFCQUFxQixDQUFDVCxNQUFNLEtBQUssQ0FBQyxFQUFFO1VBQzlDSixNQUFNLEdBQUksU0FBUUYsaUJBQWtCLEVBQUM7UUFDdEMsQ0FBQyxNQUFNLElBQUllLHFCQUFxQixDQUFDVCxNQUFNLEtBQUssQ0FBQyxFQUFFO1VBQzlDSixNQUFNLEdBQUksR0FBRUYsaUJBQWtCLElBQUdlLHFCQUFxQixDQUFDLENBQUMsQ0FBRSxFQUFDO1FBQzVEO01BQ0Q7TUFDQSxPQUFPYixNQUFNO0lBQ2QsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NlLHlCQUF5QixFQUFFLFVBQVVDLFdBQWdCLEVBQUViLFNBQWdCLEVBQUU7TUFDeEUsSUFBSWEsV0FBVyxJQUFJQSxXQUFXLENBQUNDLEtBQUssRUFBRTtRQUNyQyxPQUFPLENBQUNkLFNBQVMsQ0FBQ2UsSUFBSSxDQUFDLFVBQVViLGdCQUFxQixFQUFFO1VBQ3ZELE9BQU9BLGdCQUFnQixDQUFDSSxTQUFTLENBQUNPLFdBQVcsQ0FBQ0MsS0FBSyxDQUFDLEtBQUssS0FBSztRQUMvRCxDQUFDLENBQUM7TUFDSDtNQUNBLE9BQU9ELFdBQVc7SUFDbkIsQ0FBQztJQUVERyxZQUFZLEVBQUUsVUFBVUMsWUFBaUIsRUFBRUMsa0JBQXVCLEVBQUVDLGNBQW1DLEVBQVU7TUFDaEgsTUFBTUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFvQjtNQUNqRCxJQUFJQyxTQUFrQjtNQUN0QixJQUFJSixZQUFZLEVBQUU7UUFDakJLLHNCQUFzQixDQUFDRixtQkFBbUIsRUFBRUYsa0JBQWtCLEVBQUVDLGNBQWMsRUFBRSxJQUFJLENBQUM7UUFDckZFLFNBQVMsR0FBRyxDQUFBRCxtQkFBbUIsYUFBbkJBLG1CQUFtQix1QkFBbkJBLG1CQUFtQixDQUFFRyxTQUFTLEtBQUksRUFBRTtNQUNqRDtNQUNBLE1BQU1DLGtCQUFrQixHQUN2QkgsU0FBUyxJQUNULENBQUMsWUFBWSxFQUFFLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDNUIsT0FBTyxDQUFDNEIsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQzNGLENBQUNJLGlCQUFpQixDQUFDTixjQUFjLENBQUMsSUFDbEMsQ0FBQ08sMkJBQTJCLENBQUNULFlBQVksQ0FBQztNQUUzQyxPQUFPLENBQUNPLGtCQUFrQixJQUFJLEVBQUUsS0FBS0gsU0FBUztJQUMvQyxDQUFDO0lBRURNLGFBQWEsRUFBRSxVQUFVVCxrQkFBdUIsRUFBVztNQUMxRCxPQUNDQSxrQkFBa0IsSUFDbEJBLGtCQUFrQixDQUFDVSxLQUFLLEtBQUssbURBQW1ELElBQ2hGVixrQkFBa0IsQ0FBQ1csTUFBTSxJQUN6Qlgsa0JBQWtCLENBQUNXLE1BQU0sQ0FBQ0MsS0FBSyxJQUMvQlosa0JBQWtCLENBQUNXLE1BQU0sQ0FBQ0MsS0FBSyxDQUFDckMsT0FBTyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUU1RCxDQUFDO0lBRUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDc0MsV0FBVyxFQUFFLFVBQVVDLFFBQWdCLEVBQUVDLFdBQWdCLEVBQUVDLFdBQW1CLEVBQXNCO01BQ25HLElBQUlDLGVBQWU7TUFDbkIsSUFBSUYsV0FBVyxLQUFLQSxXQUFXLENBQUNHLElBQUksSUFBS0gsV0FBVyxDQUFDSSxVQUFVLElBQUlKLFdBQVcsQ0FBQ0ksVUFBVSxDQUFDcEMsTUFBTyxDQUFDLElBQUkrQixRQUFRLEVBQUU7UUFDL0csSUFBSUMsV0FBVyxDQUFDRyxJQUFJLElBQUlGLFdBQVcsS0FBSyxhQUFhLEVBQUU7VUFDdERDLGVBQWUsR0FBR0YsV0FBVyxDQUFDRyxJQUFJO1FBQ25DLENBQUMsTUFBTSxJQUFJSCxXQUFXLENBQUNJLFVBQVUsRUFBRTtVQUNsQ0osV0FBVyxDQUFDSSxVQUFVLENBQUNsRCxPQUFPLENBQUMsVUFBVW1ELEtBQWtCLEVBQUU7WUFDNUQsSUFBSUEsS0FBSyxDQUFDRixJQUFJLElBQUlFLEtBQUssQ0FBQ0YsSUFBSSxLQUFLSixRQUFRLEVBQUU7Y0FDMUNHLGVBQWUsR0FBR0csS0FBSyxDQUFDRixJQUFJO1lBQzdCO1VBQ0QsQ0FBQyxDQUFDO1FBQ0g7TUFDRDtNQUNBLE9BQU9ELGVBQWU7SUFDdkIsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0ksb0JBQW9CLEVBQUUsVUFBVUMsTUFBYSxFQUFFeEMsU0FBZ0IsRUFBRXlDLFVBQWlCLEVBQUU7TUFDbkYsTUFBTUMsVUFBVSxHQUFHRixNQUFNLElBQUtBLE1BQU0sQ0FBQ0csUUFBUSxFQUFFLENBQUNDLFlBQVksRUFBVTtRQUNyRUMscUJBQXFCLEdBQUdMLE1BQU0sQ0FBQ00sSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUMvQ0MsWUFBWSxHQUFHckUsY0FBYyxDQUFDc0UsY0FBYyxDQUFDUixNQUFNLENBQUM7UUFDcERTLGtCQUFrQixHQUFHUCxVQUFVLENBQUNRLFVBQVUsQ0FBRSxHQUFFTCxxQkFBc0IsSUFBRyxDQUFDO1FBQ3hFTSxpQkFBaUIsR0FBR1QsVUFBVSxDQUFDUSxVQUFVLENBQUNMLHFCQUFxQixDQUFDO1FBQ2hFTyxvQkFBb0IsR0FBR0MsMkJBQTJCLENBQUNKLGtCQUFrQixDQUFDO01BRXZFLE1BQU1LLGVBQWUsR0FBRyxJQUFJQyxTQUFTLEVBQUU7TUFDdkMsSUFBSUMsT0FBTztNQUNYLElBQUlDLFVBQVU7TUFDZCxJQUFJQyxpQkFBaUI7TUFDckIsSUFBSUMsaUJBQWlCO01BQ3JCLElBQUlDLHdCQUF3QjtNQUM1QixJQUFJQyxZQUFZO01BRWhCZCxZQUFZLENBQUM1RCxPQUFPLENBQUMsVUFBVTJFLFdBQWdCLEVBQUU7UUFDaEQsTUFBTW5FLGlCQUFpQixHQUFHbUUsV0FBVyxDQUFDQyxZQUFZO1FBQ2xELElBQUlwRSxpQkFBaUIsRUFBRTtVQUFBO1VBQ3RCLElBQUlxRSxhQUFhLEdBQUdyRSxpQkFBaUIsSUFBSStDLFVBQVUsQ0FBQ3BDLFNBQVMsQ0FBRSxHQUFFdUMscUJBQXNCLElBQUdsRCxpQkFBa0IsR0FBRSxDQUFDO1VBQy9HOEQsVUFBVSxHQUNUSyxXQUFXLENBQUNHLEtBQUssSUFBS0QsYUFBYSxJQUFJQSxhQUFhLENBQUMsdUNBQXVDLENBQUUsSUFBSXJFLGlCQUFpQjtVQUVwSCxJQUFJeUQsb0JBQW9CLEVBQUU7WUFDekJBLG9CQUFvQixDQUFDYyxZQUFZLEdBQUdkLG9CQUFvQixDQUFDZSxnQkFBZ0IsQ0FBQ0MsZ0JBQWdCLENBQUN6RCxNQUFNLENBQUMsVUFDakcwRCxTQUFjLEVBQ2I7Y0FDRCxPQUFPQSxTQUFTLENBQUNDLElBQUksS0FBSzNFLGlCQUFpQjtZQUM1QyxDQUFDLENBQUM7VUFDSDtVQUNBeUQsb0JBQW9CLENBQUNjLFlBQVksR0FBR2Qsb0JBQW9CLENBQUNjLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7VUFDOUVMLFlBQVksR0FBR1UsY0FBYyxDQUFDbkIsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1VBQ25FLE1BQU1vQixhQUFhLEdBQUc5QixVQUFVLENBQUNRLFVBQVUsQ0FBQ1ksV0FBVyxDQUFDVyxjQUFjLENBQUM7WUFDdEVDLG1CQUFtQixHQUFHQyx1QkFBdUIsQ0FBQ0gsYUFBYSxDQUFDO1lBQzVESSxnQkFBZ0IsR0FBR2xDLFVBQVUsQ0FBQ1EsVUFBVSxDQUFFLEdBQUVMLHFCQUFzQixJQUFHbEQsaUJBQWtCLEdBQUUsQ0FBQztZQUMxRmtGLFVBQVUsR0FBR0QsZ0JBQWdCLElBQUlBLGdCQUFnQixDQUFDRSxZQUFZLEVBQUU7VUFFakUsSUFBSTNELGNBQWMsR0FBR2tDLDJCQUEyQixDQUFDbUIsYUFBYSxFQUFFckIsaUJBQWlCLENBQUM7VUFDbEYsSUFBSSxDQUFBdUIsbUJBQW1CLGFBQW5CQSxtQkFBbUIsZ0RBQW5CQSxtQkFBbUIsQ0FBRUssS0FBSyxvRkFBMUIsc0JBQTRCM0MsSUFBSSwyREFBaEMsdUJBQWtDbkMsTUFBTSxJQUFHLENBQUMsRUFBRTtZQUNqRGtCLGNBQWMsR0FBRzZELG9CQUFvQixDQUFDN0QsY0FBYyxFQUFFeEIsaUJBQWlCLENBQUM7VUFDekU7VUFDQSxNQUFNc0YsWUFBWSxHQUNqQnZHLGNBQWMsQ0FBQ2tDLHlCQUF5QixDQUN2QzRELGFBQWEsSUFBSUEsYUFBYSxDQUFDbEUsU0FBUyxFQUFFLENBQUMsb0NBQW9DLENBQUMsRUFDaEZOLFNBQVMsQ0FDVCxJQUFJLEtBQUs7VUFDWCxNQUFNa0YsT0FBTyxHQUFHbEIsYUFBYSxJQUFJQSxhQUFhLENBQUMsd0NBQXdDLENBQUM7VUFFeEZhLFVBQVUsQ0FBQ00sT0FBTyxHQUFHO1lBQ3BCeEMsUUFBUSxFQUFFLFlBQVk7Y0FDckIsT0FBT2tDLFVBQVUsQ0FBQ2xDLFFBQVEsRUFBRTtZQUM3QixDQUFDO1lBQ0R5QyxPQUFPLEVBQUUsWUFBWTtjQUNwQixPQUFRLEdBQUV2QyxxQkFBc0IsSUFBR2xELGlCQUFrQixFQUFDO1lBQ3ZEO1VBQ0QsQ0FBQztVQUNEcUUsYUFBYSxHQUFHcUIsVUFBVSxDQUFDWCxtQkFBbUIsQ0FBQyxHQUM1Q0EsbUJBQW1CLEdBQ25CLENBQUFBLG1CQUFtQixhQUFuQkEsbUJBQW1CLGlEQUFuQkEsbUJBQW1CLENBQUVLLEtBQUssMkRBQTFCLHVCQUE0Qk8sT0FBTyxNQUFJWixtQkFBbUIsYUFBbkJBLG1CQUFtQixpREFBbkJBLG1CQUFtQixDQUFFN0MsTUFBTSwyREFBM0IsdUJBQTZCeUQsT0FBTztVQUM5RTs7VUFFQSxNQUFNQyxhQUFhLEdBQUd2QixhQUFhLElBQUlBLGFBQWEsQ0FBQ3dCLElBQUksSUFBSXhCLGFBQWEsQ0FBQ3dCLElBQUksS0FBSyxrQ0FBa0M7VUFDdEgsTUFBTUMsUUFBUSxHQUFHLENBQUMsQ0FBQ2YsbUJBQW1CLENBQUNnQixNQUFNO1VBQzdDLE1BQU1DLFVBQVUsR0FBR2pILGNBQWMsQ0FBQ2lELGFBQWEsQ0FBQytDLG1CQUFtQixDQUFDO1VBQ3BFLElBQUlRLE9BQU8sSUFBSUQsWUFBWSxJQUFJTSxhQUFhLElBQUlFLFFBQVEsSUFBSUUsVUFBVSxFQUFFO1lBQ3ZFO1VBQ0Q7O1VBRUE7VUFDQWhDLGlCQUFpQixHQUNmLENBQUNpQyxXQUFXLENBQUM1QixhQUFhLENBQUMsSUFBSTZCLE9BQU8sQ0FBQzdCLGFBQWEsQ0FBQyxLQUFLOEIsNkJBQTZCLENBQUM5QixhQUFhLENBQUMsSUFBSyxFQUFFO1VBQy9HLE1BQU0rQixnQkFBZ0IsR0FBR3BDLGlCQUFpQixJQUFJcUMseUJBQXlCLENBQUNoQyxhQUFhLENBQUM7VUFDdEZOLGlCQUFpQixHQUFHdUMsWUFBWSxDQUFDakMsYUFBYSxDQUFDO1VBQy9DSix3QkFBd0IsR0FBR21DLGdCQUFnQixJQUFJRSxZQUFZLENBQUNGLGdCQUFnQixDQUFDO1VBRTdFLE1BQU1HLHFCQUFxQixHQUMxQixDQUFDeEMsaUJBQWlCLElBQUlFLHdCQUF3QixNQUM3QyxtQkFBQUksYUFBYSw0RUFBYixlQUFlbUMsV0FBVyxvRkFBMUIsc0JBQTRCQyxNQUFNLDJEQUFsQyx1QkFBb0NDLDJCQUEyQixLQUM5RE4sZ0JBQWdCLEtBQUlBLGdCQUFnQixhQUFoQkEsZ0JBQWdCLGdEQUFoQkEsZ0JBQWdCLENBQUVJLFdBQVcsb0ZBQTdCLHNCQUErQkMsTUFBTSwyREFBckMsdUJBQXVDQywyQkFBMkIsQ0FBQyxDQUFDO1VBQzNGLElBQUlILHFCQUFxQixFQUFFO1lBQzFCO1lBQ0E7VUFDRDs7VUFFQTtVQUNBLE1BQU1JLHVCQUF1QixHQUFHdEMsYUFBYSxJQUFJQSxhQUFhLENBQUNlLEtBQUssR0FBR2YsYUFBYSxDQUFDZSxLQUFLLEdBQUdmLGFBQWE7VUFDMUcsTUFBTXVDLFVBQVUsR0FBR0MsV0FBVyxDQUFDRix1QkFBdUIsRUFBRW5GLGNBQWMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFdUQsbUJBQW1CLEVBQUUrQixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7VUFDMUgsTUFBTUMsY0FBYyxHQUFHQyxNQUFNLENBQUNDLElBQUksQ0FBQ0MsUUFBUSxDQUFDO1VBQzVDLE1BQU1DLGdCQUFnQixHQUFHLENBQUMsQ0FBQ1AsVUFBVSxJQUFJRyxjQUFjLENBQUNLLFFBQVEsQ0FBQ1IsVUFBVSxDQUFhO1VBQ3hGLE1BQU1TLFFBQVEsR0FBRyxDQUFDLENBQUNULFVBQVUsS0FBTU8sZ0JBQWdCLElBQUlQLFVBQVUsS0FBS00sUUFBUSxDQUFDSSxRQUFRLElBQUssQ0FBQ0gsZ0JBQWdCLENBQUM7VUFDOUcsTUFBTUksd0JBQXdCLEdBQUd2SCxpQkFBaUIsQ0FBQ29ILFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSXJELGlCQUFpQjtVQUNyRixJQUFJLENBQUNzRCxRQUFRLElBQUlFLHdCQUF3QixFQUFFO1lBQzFDO1VBQ0Q7VUFFQSxNQUFNN0YsU0FBUyxHQUFHM0MsY0FBYyxDQUFDc0MsWUFBWSxDQUFDZ0QsYUFBYSxFQUFFVSxtQkFBbUIsRUFBRXZELGNBQWMsQ0FBQztVQUVqRyxJQUFJRSxTQUFTLEVBQUU7WUFDZCxNQUFNOEYsWUFBWSxHQUFHQyxnQkFBZ0IsQ0FBQ2pHLGNBQWMsQ0FBQztZQUNyRCxNQUFNa0csVUFBVSxHQUFHQyxvQkFBb0IsQ0FBQ3RELGFBQWEsRUFBRW1ELFlBQVksQ0FBQztZQUNwRSxNQUFNakYsV0FBVyxHQUFHcUYsV0FBVyxDQUFDQyxrQkFBa0IsQ0FBQzVDLGdCQUFnQixDQUFDdEUsU0FBUyxFQUFFLENBQUM7WUFDaEYsTUFBTW1ILGtCQUFrQixHQUFHL0QsaUJBQWlCLEdBQUdBLGlCQUFpQixHQUFHLEtBQUs7WUFDeEUsTUFBTWdFLHlCQUF5QixHQUM5QjlELHdCQUF3QixJQUFJLENBQUNELGlCQUFpQixDQUFDb0QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHbkQsd0JBQXdCLEdBQUcsS0FBSztZQUNoRyxNQUFNK0QsWUFBWSxHQUFHaEUsaUJBQWlCLElBQUksQ0FBQ2hFLGlCQUFpQixDQUFDb0gsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHcEQsaUJBQWlCLEdBQUcsS0FBSztZQUV0R0gsT0FBTyxHQUFHO2NBQ1RTLEtBQUssRUFBRVIsVUFBVTtjQUNqQk0sWUFBWSxFQUFFcEUsaUJBQWlCO2NBQy9COEgsa0JBQWtCLEVBQUUvRCxpQkFBaUIsR0FBR0EsaUJBQWlCLEdBQUcsS0FBSztjQUNqRWlFLFlBQVk7Y0FDWkMsZUFBZSxFQUFFQyxxQkFBcUIsQ0FBQzdELGFBQWEsRUFBRVUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRXZELGNBQWMsQ0FBQztjQUMzRzJHLG9CQUFvQixFQUFFbkksaUJBQWlCLEdBQ3BDakIsY0FBYyxDQUFDcUIsK0JBQStCLENBQUNDLFNBQVMsRUFBRUwsaUJBQWlCLENBQUMsR0FDNUUsS0FBSztjQUNSb0ksd0JBQXdCLEVBQUVwRSxpQkFBaUIsR0FDeENqRixjQUFjLENBQUNxQiwrQkFBK0IsQ0FBQ0MsU0FBUyxFQUFFMkQsaUJBQWlCLENBQUMsR0FDNUUsS0FBSztjQUNScUUsU0FBUyxFQUFFbkYscUJBQXFCO2NBQ2hDb0YsT0FBTyxFQUFFL0YsV0FBVztjQUNwQkMsZUFBZSxFQUFFekQsY0FBYyxDQUFDcUQsV0FBVyxDQUFDcEMsaUJBQWlCLEVBQUVrRSxZQUFZLEVBQUUzQixXQUFXLENBQUM7Y0FDekZnRyxRQUFRLEVBQUVsRSxhQUFhLENBQUNrRSxRQUFRLEtBQUsxSSxTQUFTLEdBQUd3RSxhQUFhLENBQUNrRSxRQUFRLEdBQUcsSUFBSTtjQUM5RUMsa0JBQWtCLEVBQUVkLFVBQVUsS0FBSzdILFNBQVMsR0FBRzZILFVBQVUsR0FBRyxLQUFLO2NBQ2pFaEcsU0FBUyxFQUFFQSxTQUFTO2NBQ3BCK0csUUFBUSxFQUFFcEIsUUFBUSxHQUFHVCxVQUFVLEdBQUcvRyxTQUFTO2NBQzNDeUIsWUFBWSxFQUFFO2dCQUNib0gsS0FBSyxFQUFFWixrQkFBa0I7Z0JBQ3pCYSxXQUFXLEVBQUUscUJBQXFCO2dCQUNsQ25CLFlBQVksRUFBRXhILGlCQUFpQjtnQkFDL0I0SSwwQkFBMEIsRUFBRXZFLGFBQWEsQ0FBQ3dFLGtCQUFrQjtnQkFDNURDLHdCQUF3QixFQUFHLEdBQUU1RixxQkFBc0IsSUFBR2xELGlCQUFrQjtjQUN6RSxDQUFDO2NBQ0QrSSxRQUFRLEVBQUVmLFlBQVksSUFBSTtnQkFDekJVLEtBQUssRUFBRVgseUJBQXlCO2dCQUNoQ1ksV0FBVyxFQUFFLHVCQUF1QjtnQkFDcENuQixZQUFZLEVBQUVRLFlBQVk7Z0JBQzFCYyx3QkFBd0IsRUFBRyxHQUFFNUYscUJBQXNCLElBQUc4RSxZQUFhO2NBQ3BFO1lBQ0QsQ0FBQztZQUNEbEYsVUFBVSxDQUFDaEMsSUFBSSxDQUFDK0MsT0FBTyxDQUFDO1VBQ3pCO1FBQ0Q7TUFDRCxDQUFDLENBQUM7TUFDRkYsZUFBZSxDQUFDcUYsT0FBTyxDQUFDbEcsVUFBVSxDQUFDO01BQ25DLE9BQU9hLGVBQWU7SUFDdkIsQ0FBQztJQUVETixjQUFjLEVBQUUsVUFBVVIsTUFBVyxFQUFFO01BQ3RDLE1BQU1vRyxRQUFRLEdBQUlwRyxNQUFNLElBQUlBLE1BQU0sQ0FBQ3FHLFVBQVUsRUFBRSxJQUFLLEVBQUU7TUFDdEQsTUFBTUMsV0FBVyxHQUFHdEcsTUFBTSxJQUFJQSxNQUFNLENBQUN1RyxTQUFTLEVBQUUsQ0FBQ0Msa0JBQWtCLEVBQUUsQ0FBQ0MsT0FBTztNQUM3RSxPQUFPTCxRQUFRLENBQUNNLEdBQUcsQ0FBQyxVQUFVQyxPQUFZLEVBQUU7UUFDM0MsTUFBTUMsYUFBYSxHQUFHRCxPQUFPLElBQUlBLE9BQU8sQ0FBQ0UsZUFBZSxFQUFFO1VBQ3pEQyxrQkFBa0IsR0FDakJSLFdBQVcsSUFDWEEsV0FBVyxDQUFDbkksTUFBTSxDQUFDLFVBQVVtRCxXQUFnQixFQUFFO1lBQzlDLE9BQU9BLFdBQVcsQ0FBQ1EsSUFBSSxLQUFLOEUsYUFBYSxJQUFJdEYsV0FBVyxDQUFDeUYsSUFBSSxLQUFLLFlBQVk7VUFDL0UsQ0FBQyxDQUFDO1FBQ0osT0FBTztVQUNOeEYsWUFBWSxFQUFFcUYsYUFBYTtVQUMzQm5GLEtBQUssRUFBRWtGLE9BQU8sQ0FBQ0ssU0FBUyxFQUFFO1VBQzFCL0UsY0FBYyxFQUFFNkUsa0JBQWtCLElBQUlBLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxJQUFJQSxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQzdFO1FBQ3RGLENBQUM7TUFDRixDQUFDLENBQUM7SUFDSCxDQUFDO0lBRURnRix3QkFBd0IsRUFBRSxVQUFVQyxlQUFvQixFQUFFQyxpQkFBc0IsRUFBRW5ILE1BQVcsRUFBRTtNQUM5RjtNQUNBLE1BQU1vSCxZQUFZLEdBQUdwSCxNQUFNLENBQUNNLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxLQUFLLE1BQU07TUFFekUsT0FBTztRQUNOK0csa0JBQWtCLEVBQUUsUUFBUTtRQUM1QkMsZUFBZSxFQUFFLGlCQUFpQjtRQUNsQ0MsZUFBZSxFQUFFLGtCQUFrQjtRQUNuQ0MsYUFBYSxFQUFFTixlQUFlLENBQUNPLE9BQU8sQ0FBQywwQkFBMEIsRUFBRU4saUJBQWlCLENBQUNPLFFBQVEsRUFBRSxDQUFDO1FBQ2hHQyxlQUFlLEVBQUVQLFlBQVksR0FDMUJGLGVBQWUsQ0FBQ08sT0FBTyxDQUFDLDhCQUE4QixDQUFDLEdBQ3ZEUCxlQUFlLENBQUNPLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQztRQUMzREcsaUJBQWlCLEVBQUUsb0JBQW9CO1FBQ3ZDQyxnQkFBZ0IsRUFBRVgsZUFBZSxDQUFDTyxPQUFPLENBQUMsNkJBQTZCLENBQUM7UUFDeEVLLFFBQVEsRUFBRVosZUFBZSxDQUFDTyxPQUFPLENBQUMsZ0NBQWdDLENBQUM7UUFDbkVNLFlBQVksRUFBRWIsZUFBZSxDQUFDTyxPQUFPLENBQUMsb0JBQW9CO01BQzNELENBQUM7SUFDRixDQUFDO0lBRUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0M7SUFDQTs7SUFFQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NPLHdCQUF3QixFQUFFLFVBQVUzTCxPQUFZLEVBQUU0TCxjQUFtQixFQUFFekcsYUFBa0IsRUFBRTBHLFNBQW1CLEVBQUU7TUFDL0csTUFBTXRMLGFBQWEsR0FBR3NMLFNBQVMsR0FBRzFHLGFBQWEsQ0FBQzJELFlBQVksR0FBRzNELGFBQWEsQ0FBQ0QsWUFBWTtRQUN4RjRHLFVBQVUsR0FBRzNHLGFBQWEsQ0FBQzNDLFNBQVM7UUFDcEN1SixpQkFBaUIsR0FBRzVHLGFBQWEsQ0FBQzRELGVBQWU7TUFDbEQ7TUFDQSxNQUFNaUQsc0JBQXNCLEdBQUcsUUFBUTtNQUN2Q2hNLE9BQU8sQ0FBQ2lNLGNBQWMsR0FBR2pNLE9BQU8sQ0FBQ2lNLGNBQWMsSUFBSSxFQUFFO01BQ3JELE1BQU1DLGtCQUFrQixHQUFHbE0sT0FBTyxDQUFDbU0sYUFBYSxJQUFJbk0sT0FBTyxDQUFDbU0sYUFBYSxDQUFDL0ssTUFBTSxHQUFHLENBQUM7TUFDcEYsTUFBTWdMLFNBQVMsR0FBRztRQUNqQkMsSUFBSSxFQUFHLEdBQUVULGNBQWMsQ0FBQ1osa0JBQW1CLElBQUdnQixzQkFBdUIsSUFBRztRQUN4RU0sR0FBRyxFQUFHLFdBQVUvTCxhQUFjO01BQy9CLENBQUM7TUFFRCxJQUFJdUwsVUFBVSxLQUFLLFVBQVUsRUFBRTtRQUM5QixNQUFNUyxVQUFVLEdBQUc7VUFBRUYsSUFBSSxFQUFFLElBQUk7VUFBRUMsR0FBRyxFQUFHLEdBQUUvTCxhQUFjLFFBQU87VUFBRWlNLFFBQVEsRUFBRTtZQUFFdkosS0FBSyxFQUFFO1VBQU07UUFBRSxDQUFDO1FBQzVGLE1BQU13SixXQUFXLEdBQUc7VUFBRUosSUFBSSxFQUFFLEtBQUs7VUFBRUMsR0FBRyxFQUFHLEdBQUUvTCxhQUFjLE9BQU07VUFBRWlNLFFBQVEsRUFBRTtZQUFFdkosS0FBSyxFQUFFO1VBQUs7UUFBRSxDQUFDO1FBQzVGakQsT0FBTyxDQUFDME0sT0FBTyxDQUFDSCxVQUFVLENBQUM7UUFDM0J2TSxPQUFPLENBQUNpTSxjQUFjLENBQUNTLE9BQU8sQ0FBQ0gsVUFBVSxDQUFDO1FBQzFDdk0sT0FBTyxDQUFDME0sT0FBTyxDQUFDRCxXQUFXLENBQUM7UUFDNUJ6TSxPQUFPLENBQUNpTSxjQUFjLENBQUNTLE9BQU8sQ0FBQ0QsV0FBVyxDQUFDO1FBQzNDek0sT0FBTyxDQUFDME0sT0FBTyxDQUFDTixTQUFTLENBQUM7UUFDMUJwTSxPQUFPLENBQUNpTSxjQUFjLENBQUNTLE9BQU8sQ0FBQ04sU0FBUyxDQUFDO01BQzFDLENBQUMsTUFBTTtRQUFBO1FBQ04sSUFBSWpILGFBQWEsYUFBYkEsYUFBYSx3Q0FBYkEsYUFBYSxDQUFFL0MsWUFBWSxrREFBM0Isc0JBQTZCb0gsS0FBSyxJQUFLckUsYUFBYSxhQUFiQSxhQUFhLHdDQUFiQSxhQUFhLENBQUUwRSxRQUFRLGtEQUF2QixzQkFBeUJMLEtBQUssSUFBSXFDLFNBQVUsRUFBRTtVQUN4RixNQUFNYyxRQUFRLEdBQUc7WUFBRU4sSUFBSSxFQUFFVCxjQUFjLENBQUNMLGlCQUFpQjtZQUFFZSxHQUFHLEVBQUcscUJBQW9CL0wsYUFBYztVQUFFLENBQUM7VUFDdEdQLE9BQU8sQ0FBQzBNLE9BQU8sQ0FBQ0MsUUFBUSxDQUFDO1VBQ3pCM00sT0FBTyxDQUFDaU0sY0FBYyxDQUFDUyxPQUFPLENBQUNDLFFBQVEsQ0FBQztRQUN6QztRQUNBLElBQUlULGtCQUFrQixFQUFFO1VBQ3ZCLElBQUlILGlCQUFpQixLQUFLLE1BQU0sSUFBSSxDQUFDRixTQUFTLEVBQUU7WUFDL0MsTUFBTWUsVUFBVSxHQUFHO2NBQUVQLElBQUksRUFBRVQsY0FBYyxDQUFDVixlQUFlO2NBQUVvQixHQUFHLEVBQUcsbUJBQWtCL0wsYUFBYztZQUFFLENBQUM7WUFDcEdQLE9BQU8sQ0FBQzBNLE9BQU8sQ0FBQ0UsVUFBVSxDQUFDO1lBQzNCNU0sT0FBTyxDQUFDaU0sY0FBYyxDQUFDUyxPQUFPLENBQUNFLFVBQVUsQ0FBQztVQUMzQztVQUNBNU0sT0FBTyxDQUFDME0sT0FBTyxDQUFDTixTQUFTLENBQUM7VUFDMUJwTSxPQUFPLENBQUNpTSxjQUFjLENBQUNTLE9BQU8sQ0FBQ04sU0FBUyxDQUFDO1FBQzFDLENBQUMsTUFBTTtVQUNOLE1BQU1TLFVBQVUsR0FBRztZQUFFUixJQUFJLEVBQUVULGNBQWMsQ0FBQ1gsZUFBZTtZQUFFcUIsR0FBRyxFQUFHLFdBQVUvTCxhQUFjO1VBQUUsQ0FBQztVQUM1RlAsT0FBTyxDQUFDME0sT0FBTyxDQUFDRyxVQUFVLENBQUM7VUFDM0I3TSxPQUFPLENBQUNpTSxjQUFjLENBQUNTLE9BQU8sQ0FBQ0csVUFBVSxDQUFDO1FBQzNDO01BQ0Q7SUFDRCxDQUFDO0lBRUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLHNCQUFzQixFQUFFLFVBQ3ZCM0osUUFBZ0IsRUFDaEJHLGVBQXVCLEVBQ3ZCRCxXQUFtQixFQUNuQjBKLGVBQXdCLEVBQ0Y7TUFDdEIsSUFBSTlKLEtBQUssR0FBRzhKLGVBQWUsQ0FBQ3RMLFNBQVMsQ0FBQzBCLFFBQVEsQ0FBQztRQUM5QzZKLGdCQUFnQjtRQUNoQkMsUUFBUTtNQUNULElBQUkzSixlQUFlLElBQUlILFFBQVEsRUFBRTtRQUNoQyxRQUFRRSxXQUFXO1VBQ2xCLEtBQUssYUFBYTtZQUNqQjJKLGdCQUFnQixHQUFHRCxlQUFlLENBQUN0TCxTQUFTLENBQUM2QixlQUFlLENBQUMsSUFBSSxFQUFFO1lBQ25FMkosUUFBUSxHQUFHRCxnQkFBZ0I7WUFDM0I7VUFDRCxLQUFLLE9BQU87WUFDWC9KLEtBQUssR0FBRzhKLGVBQWUsQ0FBQ3RMLFNBQVMsQ0FBQzBCLFFBQVEsQ0FBQyxJQUFJLEVBQUU7WUFDakQ4SixRQUFRLEdBQUdoSyxLQUFLO1lBQ2hCO1VBQ0QsS0FBSyxrQkFBa0I7WUFDdEJBLEtBQUssR0FBRzhKLGVBQWUsQ0FBQ3RMLFNBQVMsQ0FBQzBCLFFBQVEsQ0FBQyxJQUFJLEVBQUU7WUFDakQ2SixnQkFBZ0IsR0FBR0QsZUFBZSxDQUFDdEwsU0FBUyxDQUFDNkIsZUFBZSxDQUFDLElBQUksRUFBRTtZQUNuRTJKLFFBQVEsR0FBR0QsZ0JBQWdCLEdBQUksR0FBRS9KLEtBQU0sS0FBSStKLGdCQUFpQixHQUFFLEdBQUcvSixLQUFLO1lBQ3RFO1VBQ0QsS0FBSyxrQkFBa0I7WUFDdEJBLEtBQUssR0FBRzhKLGVBQWUsQ0FBQ3RMLFNBQVMsQ0FBQzBCLFFBQVEsQ0FBQyxJQUFJLEVBQUU7WUFDakQ2SixnQkFBZ0IsR0FBR0QsZUFBZSxDQUFDdEwsU0FBUyxDQUFDNkIsZUFBZSxDQUFDLElBQUksRUFBRTtZQUNuRTJKLFFBQVEsR0FBR0QsZ0JBQWdCLEdBQUksR0FBRUEsZ0JBQWlCLEtBQUkvSixLQUFNLEdBQUUsR0FBR0EsS0FBSztZQUN0RTtVQUNEO1lBQ0NpSyxHQUFHLENBQUNDLElBQUksQ0FBRSxvQ0FBbUNoSyxRQUFTLEVBQUMsQ0FBQztZQUN4RDtRQUFNO01BRVQ7TUFFQSxPQUFPO1FBQ05pSyxlQUFlLEVBQUUvSixXQUFXO1FBQzVCZ0ssU0FBUyxFQUFFbEssUUFBUTtRQUNuQkcsZUFBZSxFQUFFQSxlQUFlO1FBQ2hDTCxLQUFLLEVBQUVBLEtBQUs7UUFDWnFLLFdBQVcsRUFBRU4sZ0JBQWdCO1FBQzdCQyxRQUFRLEVBQUVBO01BQ1gsQ0FBQztJQUNGLENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ00sVUFBVSxFQUFFLFVBQVVDLEdBQVksRUFBVztNQUM1QyxNQUFNQyxPQUFPLEdBQUdELEdBQUcsQ0FBQ0UsVUFBVSxDQUFDLEtBQUssQ0FBQztNQUNyQyxNQUFNekssS0FBSyxHQUFJd0ssT0FBTyxDQUFTRSxnQkFBZ0IsRUFBRTtNQUNqRCxPQUFPMUssS0FBSyxLQUFLK0UsUUFBUSxDQUFDSSxRQUFRO0lBQ25DLENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ3dGLHVCQUF1QixFQUFFLFVBQVVDLGdCQUEyQixFQUFFM0ksWUFBb0IsRUFBUTtNQUMzRixNQUFNNEksb0JBQW9CLEdBQUdELGdCQUFnQixDQUFDRSxXQUFXLENBQUUsV0FBVTdJLFlBQWEsdUJBQXNCLENBQUMsSUFBSSxFQUFFO01BQy9HLE1BQU1pRCxRQUFRLEdBQUcyRixvQkFBb0IsQ0FBQzVMLElBQUksQ0FBQ3JDLGNBQWMsQ0FBQzBOLFVBQVUsQ0FBQztNQUVyRSxJQUFJcEYsUUFBUSxFQUFFO1FBQ2IwRixnQkFBZ0IsQ0FBQ0csV0FBVyxDQUFFLFdBQVU5SSxZQUFhLFVBQVMsRUFBRWlELFFBQVEsQ0FBQztNQUMxRTtJQUNELENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0M4RixxQkFBcUIsRUFBRSxVQUFVQyxPQUFnQixFQUFFTCxnQkFBMkIsRUFBRTNJLFlBQW9CLEVBQUVpSixNQUFXLEVBQUU7TUFDbEgsTUFBTVYsT0FBTyxHQUFHUyxPQUFPLENBQUNSLFVBQVUsQ0FBQyxLQUFLLENBQUM7TUFFekNTLE1BQU0sQ0FBQ0wsb0JBQW9CLEdBQUdLLE1BQU0sQ0FBQ0wsb0JBQW9CLElBQUksRUFBRTtNQUMvREssTUFBTSxDQUFDTCxvQkFBb0IsQ0FBQ2xNLElBQUksQ0FBQ3NNLE9BQU8sQ0FBQztNQUV6Q1QsT0FBTyxhQUFQQSxPQUFPLHVCQUFQQSxPQUFPLENBQUVXLFlBQVksQ0FBQ3ZPLGNBQWMsQ0FBQytOLHVCQUF1QixDQUFDUyxJQUFJLENBQUMsSUFBSSxFQUFFUixnQkFBZ0IsRUFBRTNJLFlBQVksQ0FBQyxDQUFDO0lBQ3pHLENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDb0osY0FBYyxFQUFFLFVBQVU1RyxVQUE0QyxFQUFFcEIsT0FBZ0IsRUFBVztNQUNsRyxNQUFNNEgsT0FBTyxHQUFHLElBQUlLLEdBQUcsQ0FBQztRQUFFZixHQUFHLEVBQUU5RjtNQUFXLENBQUMsQ0FBQztNQUM1QyxNQUFNOEcsS0FBSyxHQUFHbEksT0FBTyxDQUFDeEMsUUFBUSxFQUFFO01BQ2hDb0ssT0FBTyxDQUFDTyxRQUFRLENBQUNELEtBQUssQ0FBQztNQUN2Qk4sT0FBTyxDQUFDUSxpQkFBaUIsQ0FBQ3BJLE9BQU8sQ0FBQztNQUVsQyxPQUFPNEgsT0FBTztJQUNmLENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDUyxpQkFBaUIsRUFBRSxVQUNsQmpILFVBQTRDLEVBQzVDbUcsZ0JBQTJCLEVBQzNCM0ksWUFBb0IsRUFDcEJpSixNQUFXLEVBQ1g3SCxPQUFnQixFQUNOO01BQ1YsTUFBTTRILE9BQU8sR0FBR3JPLGNBQWMsQ0FBQ3lPLGNBQWMsQ0FBQzVHLFVBQVUsRUFBRXBCLE9BQU8sQ0FBQztNQUNsRSxNQUFNc0ksaUJBQWlCLEdBQUcvTyxjQUFjLENBQUMwTixVQUFVLENBQUNXLE9BQU8sQ0FBQztNQUU1RCxJQUFJLENBQUNVLGlCQUFpQixFQUFFO1FBQ3ZCL08sY0FBYyxDQUFDb08scUJBQXFCLENBQUNDLE9BQU8sRUFBRUwsZ0JBQWdCLEVBQUUzSSxZQUFZLEVBQUVpSixNQUFNLENBQUM7TUFDdEY7TUFDQSxPQUFPUyxpQkFBaUI7SUFDekIsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsdUJBQXVCLEVBQUUsVUFBVTFOLFNBQWdCLEVBQUV5QyxVQUFpQixFQUFFZ0ksY0FBbUIsRUFBRWtELGFBQXNCLEVBQUU7TUFDcEgsTUFBTTlPLE9BQWMsR0FBRyxFQUFFO01BQ3pCLE1BQU0rTyxTQUFnQixHQUFHLEVBQUU7TUFDM0IsTUFBTUMsUUFBZSxHQUFHLEVBQUU7TUFDMUIsTUFBTUMsU0FBZ0IsR0FBRyxFQUFFO01BQzNCLE1BQU1DLGtCQUF5QixHQUFHLEVBQUU7TUFFcEMsTUFBTUMsS0FBSyxHQUFHO1FBQ2JoQixNQUFNLEVBQUVuTyxPQUFPO1FBQ2ZvUCxRQUFRLEVBQUVMLFNBQVM7UUFDbkJNLE9BQU8sRUFBRUwsUUFBUTtRQUNqQk0sb0JBQW9CLEVBQUVKLGtCQUFrQjtRQUN4Q0ssV0FBVyxFQUFFNU8sU0FBUztRQUN0QnNPLFNBQVMsRUFBRUEsU0FBUztRQUNwQnhELFFBQVEsRUFBRUcsY0FBYyxDQUFDSDtNQUMxQixDQUFDO01BQ0QsTUFBTW9DLGdCQUFnQixHQUFHLElBQUluSixTQUFTLENBQUN5SyxLQUFLLENBQUM7TUFDN0N2TCxVQUFVLENBQUN0RCxPQUFPLENBQUMsVUFBVWtQLE9BQVksRUFBRTtRQUMxQyxJQUFJQyxTQUFTO1FBQ2IsSUFBSUMsWUFBWTtRQUNoQixJQUFJQyxpQkFBaUI7UUFDckIsTUFBTUMsaUJBQXNCLEdBQUcsQ0FBQyxDQUFDO1FBQ2pDLE1BQU1DLGdCQUFxQixHQUFHLENBQUMsQ0FBQztRQUNoQyxJQUFJTCxPQUFPLENBQUN0SyxZQUFZLElBQUlzSyxPQUFPLENBQUN0SyxZQUFZLENBQUN0RSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7VUFDbkUsTUFBTVgsVUFBVSxHQUFHSixjQUFjLENBQUNDLDJCQUEyQixDQUFDMFAsT0FBTyxDQUFDdEssWUFBWSxFQUFFbEYsT0FBTyxDQUFDLHFCQUFxQjtVQUNqSCxNQUFNaUIsY0FBYyxHQUFHdU8sT0FBTyxDQUFDdEssWUFBWSxDQUFDOUUsS0FBSyxDQUFDLEdBQUcsQ0FBQztVQUV0RCxLQUFLLE1BQU1rRyxPQUFPLElBQUluRixTQUFTLEVBQUU7WUFDaEMsTUFBTTJPLG9CQUFvQixHQUFHeEosT0FBTyxDQUFDN0UsU0FBUyxDQUFDK04sT0FBTyxDQUFDdEssWUFBWSxDQUFDO1lBQ3BFd0ssWUFBWSxHQUFJLEdBQUVGLE9BQU8sQ0FBQ3RLLFlBQWEsSUFBRzRLLG9CQUFxQixFQUFDO1lBQ2hFLElBQUksQ0FBQ0YsaUJBQWlCLENBQUNGLFlBQVksQ0FBQyxJQUFJelAsVUFBVSxDQUFDZ0IsY0FBYyxDQUFDQSxjQUFjLENBQUNHLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO2NBQzlGcU8sU0FBUyxHQUFHNVAsY0FBYyxDQUFDaU4sc0JBQXNCLENBQ2hEMEMsT0FBTyxDQUFDdEssWUFBWSxFQUNwQnNLLE9BQU8sQ0FBQ2xNLGVBQWUsRUFDdkJrTSxPQUFPLENBQUNwRyxPQUFPLEVBQ2Y5QyxPQUFPLENBQ1A7Y0FDRHJHLFVBQVUsQ0FBQ2dCLGNBQWMsQ0FBQ0EsY0FBYyxDQUFDRyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQ1EsSUFBSSxDQUFDO2dCQUMxRHlLLElBQUksRUFBR29ELFNBQVMsSUFBSUEsU0FBUyxDQUFDeEMsUUFBUSxJQUFLNkMsb0JBQW9CO2dCQUMvRHhELEdBQUcsRUFBRW9ELFlBQVk7Z0JBQ2pCbEQsUUFBUSxFQUFFaUQ7Y0FDWCxDQUFDLENBQUM7Y0FDRkcsaUJBQWlCLENBQUNGLFlBQVksQ0FBQyxHQUFHSSxvQkFBb0I7WUFDdkQ7VUFDRDtVQUNBO1VBQ0E7VUFDQTs7VUFFQTdQLFVBQVUsQ0FBQ2dCLGNBQWMsQ0FBQ0EsY0FBYyxDQUFDRyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQ29MLFFBQVEsR0FBRztZQUNoRWxKLGVBQWUsRUFBRWtNLE9BQU8sQ0FBQ2xNLGVBQWU7WUFDeEMrSixTQUFTLEVBQUVtQyxPQUFPLENBQUN0SyxZQUFZO1lBQy9CN0IsV0FBVyxFQUFFbU0sT0FBTyxDQUFDcEc7VUFDdEIsQ0FBQztRQUNGLENBQUMsTUFBTTtVQUNOcEosT0FBTyxDQUFDd1AsT0FBTyxDQUFDdEssWUFBWSxDQUFDLEdBQUdsRixPQUFPLENBQUN3UCxPQUFPLENBQUN0SyxZQUFZLENBQUMsSUFBSSxFQUFFO1VBQ25FbEYsT0FBTyxDQUFDd1AsT0FBTyxDQUFDdEssWUFBWSxDQUFDLENBQUMsZUFBZSxDQUFDLEdBQUdsRixPQUFPLENBQUN3UCxPQUFPLENBQUN0SyxZQUFZLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFO1VBQ3JHLElBQUlzSyxPQUFPLENBQUMxRyxZQUFZLEVBQUU7WUFDekJpRyxTQUFTLENBQUNTLE9BQU8sQ0FBQzFHLFlBQVksQ0FBQyxHQUFHaUcsU0FBUyxDQUFDUyxPQUFPLENBQUMxRyxZQUFZLENBQUMsSUFBSSxFQUFFO1lBQ3ZFaUcsU0FBUyxDQUFDUyxPQUFPLENBQUMxRyxZQUFZLENBQUMsQ0FBQyxlQUFlLENBQUMsR0FBR2lHLFNBQVMsQ0FBQ1MsT0FBTyxDQUFDMUcsWUFBWSxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRTtVQUMxRztVQUNBLEtBQUssTUFBTXhDLE9BQU8sSUFBSW5GLFNBQVMsRUFBRTtZQUNoQyxNQUFNSyxXQUFXLEdBQUc4RSxPQUFPLENBQUM3RSxTQUFTLEVBQUU7WUFDdkNpTyxZQUFZLEdBQUksR0FBRUYsT0FBTyxDQUFDdEssWUFBYSxJQUFHMUQsV0FBVyxDQUFDZ08sT0FBTyxDQUFDdEssWUFBWSxDQUFFLEVBQUM7WUFDN0UsSUFBSXNLLE9BQU8sQ0FBQ3RLLFlBQVksSUFBSTFELFdBQVcsQ0FBQ2dPLE9BQU8sQ0FBQ3RLLFlBQVksQ0FBQyxJQUFJLENBQUMwSyxpQkFBaUIsQ0FBQ0YsWUFBWSxDQUFDLEVBQUU7Y0FDbEcsSUFBSUYsT0FBTyxDQUFDaE4sU0FBUyxJQUFJLFVBQVUsRUFBRTtnQkFDcENpTixTQUFTLEdBQUc1UCxjQUFjLENBQUNpTixzQkFBc0IsQ0FDaEQwQyxPQUFPLENBQUN0SyxZQUFZLEVBQ3BCc0ssT0FBTyxDQUFDbE0sZUFBZSxFQUN2QmtNLE9BQU8sQ0FBQ3BHLE9BQU8sRUFDZjlDLE9BQU8sQ0FDUDtnQkFDRCxNQUFNeUosS0FBSyxHQUFHO2tCQUNiMUQsSUFBSSxFQUFHb0QsU0FBUyxJQUFJQSxTQUFTLENBQUN4QyxRQUFRLElBQUt6TCxXQUFXLENBQUNnTyxPQUFPLENBQUN0SyxZQUFZLENBQUM7a0JBQzVFb0gsR0FBRyxFQUFFb0QsWUFBWTtrQkFDakJsRCxRQUFRLEVBQUVpRDtnQkFDWCxDQUFDO2dCQUNEelAsT0FBTyxDQUFDd1AsT0FBTyxDQUFDdEssWUFBWSxDQUFDLENBQUN0RCxJQUFJLENBQUNtTyxLQUFLLENBQUM7Z0JBQ3pDL1AsT0FBTyxDQUFDd1AsT0FBTyxDQUFDdEssWUFBWSxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUN0RCxJQUFJLENBQUNtTyxLQUFLLENBQUM7Y0FDM0Q7Y0FDQUgsaUJBQWlCLENBQUNGLFlBQVksQ0FBQyxHQUFHbE8sV0FBVyxDQUFDZ08sT0FBTyxDQUFDdEssWUFBWSxDQUFDO1lBQ3BFO1lBQ0EsSUFBSXNLLE9BQU8sQ0FBQzFHLFlBQVksSUFBSXRILFdBQVcsQ0FBQ2dPLE9BQU8sQ0FBQzFHLFlBQVksQ0FBQyxFQUFFO2NBQzlENkcsaUJBQWlCLEdBQUksR0FBRUgsT0FBTyxDQUFDMUcsWUFBYSxJQUFHdEgsV0FBVyxDQUFDZ08sT0FBTyxDQUFDMUcsWUFBWSxDQUFFLEVBQUM7Y0FDbEYsSUFBSSxDQUFDK0csZ0JBQWdCLENBQUNGLGlCQUFpQixDQUFDLEVBQUU7Z0JBQ3pDLElBQUlILE9BQU8sQ0FBQ2hOLFNBQVMsSUFBSSxVQUFVLEVBQUU7a0JBQ3BDaU4sU0FBUyxHQUFHNVAsY0FBYyxDQUFDaU4sc0JBQXNCLENBQ2hEMEMsT0FBTyxDQUFDMUcsWUFBWSxFQUNwQjBHLE9BQU8sQ0FBQ2xNLGVBQWUsRUFDdkJrTSxPQUFPLENBQUNwRyxPQUFPLEVBQ2Y5QyxPQUFPLENBQ1A7a0JBQ0QsTUFBTTBKLFNBQVMsR0FBRztvQkFDakIzRCxJQUFJLEVBQUdvRCxTQUFTLElBQUlBLFNBQVMsQ0FBQ3hDLFFBQVEsSUFBS3pMLFdBQVcsQ0FBQ2dPLE9BQU8sQ0FBQzFHLFlBQVksQ0FBQztvQkFDNUV3RCxHQUFHLEVBQUVxRCxpQkFBaUI7b0JBQ3RCbkQsUUFBUSxFQUFFaUQ7a0JBQ1gsQ0FBQztrQkFDRFYsU0FBUyxDQUFDUyxPQUFPLENBQUMxRyxZQUFZLENBQUMsQ0FBQ2xILElBQUksQ0FBQ29PLFNBQVMsQ0FBQztrQkFDL0NqQixTQUFTLENBQUNTLE9BQU8sQ0FBQzFHLFlBQVksQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDbEgsSUFBSSxDQUFDb08sU0FBUyxDQUFDO2dCQUNqRTtnQkFDQUgsZ0JBQWdCLENBQUNGLGlCQUFpQixDQUFDLEdBQUduTyxXQUFXLENBQUNnTyxPQUFPLENBQUMxRyxZQUFZLENBQUM7Y0FDeEU7WUFDRDtVQUNEO1VBQ0E5SSxPQUFPLENBQUN3UCxPQUFPLENBQUN0SyxZQUFZLENBQUMsQ0FBQ3NILFFBQVEsR0FBRztZQUN4Q2xKLGVBQWUsRUFBRWtNLE9BQU8sQ0FBQ2xNLGVBQWU7WUFDeEMrSixTQUFTLEVBQUVtQyxPQUFPLENBQUN0SyxZQUFZO1lBQy9CN0IsV0FBVyxFQUFFbU0sT0FBTyxDQUFDcEc7VUFDdEIsQ0FBQztVQUNELElBQUl0QixNQUFNLENBQUNDLElBQUksQ0FBQzZILGlCQUFpQixDQUFDLENBQUN4TyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ2hEME4sYUFBYSxDQUFDZCxXQUFXLENBQUN3QixPQUFPLENBQUN0SyxZQUFZLEVBQUV3SyxZQUFZLElBQUlFLGlCQUFpQixDQUFDRixZQUFZLENBQUMsQ0FBQztVQUNqRztVQUNBLElBQUk1SCxNQUFNLENBQUNDLElBQUksQ0FBQzhILGdCQUFnQixDQUFDLENBQUN6TyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQy9DME4sYUFBYSxDQUFDZCxXQUFXLENBQUN3QixPQUFPLENBQUMxRyxZQUFZLEVBQUU2RyxpQkFBaUIsSUFBSUUsZ0JBQWdCLENBQUNGLGlCQUFpQixDQUFDLENBQUM7VUFDMUc7UUFDRDtRQUNBVixTQUFTLENBQUNPLE9BQU8sQ0FBQ3RLLFlBQVksQ0FBQyxHQUFHc0ssT0FBTyxDQUFDbE0sZUFBZSxHQUFHLENBQUNrTSxPQUFPLENBQUNsTSxlQUFlLENBQUMsR0FBRyxFQUFFO01BQzNGLENBQUMsQ0FBQztNQUNGTSxVQUFVLENBQUN0RCxPQUFPLENBQUMsVUFBVWtQLE9BQVksRUFBRTtRQUMxQyxJQUFJckIsTUFBVyxHQUFHLENBQUMsQ0FBQztRQUNwQixJQUFJcUIsT0FBTyxDQUFDdEssWUFBWSxDQUFDdEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO1VBQzNDLE1BQU1xUCx3QkFBd0IsR0FBR3BRLGNBQWMsQ0FBQ2dCLHlCQUF5QixDQUFDMk8sT0FBTyxDQUFDdEssWUFBWSxFQUFFbEYsT0FBTyxDQUFDO1VBQ3hHLElBQUksQ0FBQ2lRLHdCQUF3QixFQUFFO1lBQzlCQSx3QkFBd0IsQ0FBQ3JPLElBQUksQ0FBQztjQUFFeUssSUFBSSxFQUFFVCxjQUFjLENBQUNYLGVBQWU7Y0FBRXFCLEdBQUcsRUFBRyxTQUFRa0QsT0FBTyxDQUFDdEssWUFBYTtZQUFFLENBQUMsQ0FBQztVQUM5RyxDQUFDLE1BQU07WUFDTnJGLGNBQWMsQ0FBQzhMLHdCQUF3QixDQUFDc0Usd0JBQXdCLEVBQUVyRSxjQUFjLEVBQUU0RCxPQUFPLENBQUM7VUFDM0Y7VUFDQXJCLE1BQU0sR0FBRzhCLHdCQUF3QjtRQUNsQyxDQUFDLE1BQU0sSUFBSWpRLE9BQU8sQ0FBQ3dQLE9BQU8sQ0FBQ3RLLFlBQVksQ0FBQyxFQUFFO1VBQ3pDbEYsT0FBTyxDQUFDd1AsT0FBTyxDQUFDdEssWUFBWSxDQUFDLEdBQUdsRixPQUFPLENBQUN3UCxPQUFPLENBQUN0SyxZQUFZLENBQUMsSUFBSSxFQUFFO1VBQ25FckYsY0FBYyxDQUFDOEwsd0JBQXdCLENBQUMzTCxPQUFPLENBQUN3UCxPQUFPLENBQUN0SyxZQUFZLENBQUMsRUFBRTBHLGNBQWMsRUFBRTRELE9BQU8sQ0FBQztVQUMvRnJCLE1BQU0sR0FBR25PLE9BQU8sQ0FBQ3dQLE9BQU8sQ0FBQ3RLLFlBQVksQ0FBQztRQUN2QztRQUVBLElBQUk2SixTQUFTLENBQUNTLE9BQU8sQ0FBQzFHLFlBQVksQ0FBQyxJQUFJaUcsU0FBUyxDQUFDUyxPQUFPLENBQUMxRyxZQUFZLENBQUMsQ0FBQzFILE1BQU0sRUFBRTtVQUM5RXZCLGNBQWMsQ0FBQzhMLHdCQUF3QixDQUFDb0QsU0FBUyxDQUFDUyxPQUFPLENBQUMxRyxZQUFZLENBQUMsRUFBRThDLGNBQWMsRUFBRTRELE9BQU8sRUFBRSxJQUFJLENBQUM7VUFDdkdULFNBQVMsQ0FBQ1MsT0FBTyxDQUFDMUcsWUFBWSxDQUFDLENBQUMwRCxRQUFRLEdBQUcsQ0FBQyxDQUFDO1VBQzdDdUMsU0FBUyxDQUFDUyxPQUFPLENBQUMxRyxZQUFZLENBQUMsQ0FBQ3lHLFdBQVcsR0FBRzFQLGNBQWMsQ0FBQ3FCLCtCQUErQixDQUMzRkMsU0FBUyxFQUNUcU8sT0FBTyxDQUFDMUcsWUFBWSxDQUNwQjtVQUNEaUcsU0FBUyxDQUFDUyxPQUFPLENBQUMxRyxZQUFZLENBQUMsQ0FBQ3RHLFNBQVMsR0FBR2dOLE9BQU8sQ0FBQ2hOLFNBQVM7UUFDOUQsQ0FBQyxNQUFNLElBQ0xnTixPQUFPLENBQUN0SyxZQUFZLElBQUlsRixPQUFPLENBQUN3UCxPQUFPLENBQUN0SyxZQUFZLENBQUMsSUFBSSxDQUFDbEYsT0FBTyxDQUFDd1AsT0FBTyxDQUFDdEssWUFBWSxDQUFDLENBQUM5RCxNQUFNLElBQzlGb08sT0FBTyxDQUFDMUcsWUFBWSxJQUFJaUcsU0FBUyxDQUFDUyxPQUFPLENBQUMxRyxZQUFZLENBQUMsSUFBSSxDQUFDaUcsU0FBUyxDQUFDUyxPQUFPLENBQUMxRyxZQUFZLENBQUMsQ0FBQzFILE1BQU8sRUFDbkc7VUFDRCxNQUFNOE8sNkJBQTZCLEdBQ2xDbFEsT0FBTyxDQUFDd1AsT0FBTyxDQUFDdEssWUFBWSxDQUFDLElBQzdCbEYsT0FBTyxDQUFDd1AsT0FBTyxDQUFDdEssWUFBWSxDQUFDLENBQUNoRCxJQUFJLENBQUMsVUFBVWlPLEdBQVEsRUFBRTtZQUN0RCxPQUFPQSxHQUFHLENBQUM5RCxJQUFJLEtBQUssa0JBQWtCLElBQUk4RCxHQUFHLENBQUM5RCxJQUFJLEtBQUssaUJBQWlCO1VBQ3pFLENBQUMsQ0FBQztVQUNILElBQUltRCxPQUFPLENBQUN0SyxZQUFZLElBQUksQ0FBQ2dMLDZCQUE2QixFQUFFO1lBQzNEbFEsT0FBTyxDQUFDd1AsT0FBTyxDQUFDdEssWUFBWSxDQUFDLENBQUN0RCxJQUFJLENBQUM7Y0FBRXlLLElBQUksRUFBRVQsY0FBYyxDQUFDWCxlQUFlO2NBQUVxQixHQUFHLEVBQUcsU0FBUWtELE9BQU8sQ0FBQ3RLLFlBQWE7WUFBRSxDQUFDLENBQUM7VUFDbkg7VUFDQSxNQUFNa0wsaUNBQWlDLEdBQ3RDckIsU0FBUyxDQUFDUyxPQUFPLENBQUMxRyxZQUFZLENBQUMsSUFDL0JpRyxTQUFTLENBQUNTLE9BQU8sQ0FBQzFHLFlBQVksQ0FBQyxDQUFDNUcsSUFBSSxDQUFDLFVBQVVpTyxHQUFRLEVBQUU7WUFDeEQsT0FBT0EsR0FBRyxDQUFDOUQsSUFBSSxLQUFLLGtCQUFrQixJQUFJOEQsR0FBRyxDQUFDOUQsSUFBSSxLQUFLLGlCQUFpQjtVQUN6RSxDQUFDLENBQUM7VUFDSCxJQUFJbUQsT0FBTyxDQUFDMUcsWUFBWSxFQUFFO1lBQ3pCLElBQUksQ0FBQ3NILGlDQUFpQyxFQUFFO2NBQ3ZDckIsU0FBUyxDQUFDUyxPQUFPLENBQUMxRyxZQUFZLENBQUMsQ0FBQ2xILElBQUksQ0FBQztnQkFDcEN5SyxJQUFJLEVBQUVULGNBQWMsQ0FBQ1gsZUFBZTtnQkFDcENxQixHQUFHLEVBQUcsU0FBUWtELE9BQU8sQ0FBQzFHLFlBQWE7Y0FDcEMsQ0FBQyxDQUFDO1lBQ0g7WUFDQWlHLFNBQVMsQ0FBQ1MsT0FBTyxDQUFDMUcsWUFBWSxDQUFDLENBQUMwRCxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQzdDdUMsU0FBUyxDQUFDUyxPQUFPLENBQUMxRyxZQUFZLENBQUMsQ0FBQ3lHLFdBQVcsR0FBRzFQLGNBQWMsQ0FBQ3FCLCtCQUErQixDQUMzRkMsU0FBUyxFQUNUcU8sT0FBTyxDQUFDMUcsWUFBWSxDQUNwQjtZQUNEaUcsU0FBUyxDQUFDUyxPQUFPLENBQUMxRyxZQUFZLENBQUMsQ0FBQ3RHLFNBQVMsR0FBR2dOLE9BQU8sQ0FBQ2hOLFNBQVM7VUFDOUQ7UUFDRDtRQUNBLElBQUlnTixPQUFPLENBQUNsRyxrQkFBa0IsSUFBSSxPQUFPa0csT0FBTyxDQUFDbEcsa0JBQWtCLEtBQUssU0FBUyxFQUFFO1VBQ2xGNEYsa0JBQWtCLENBQUN0TixJQUFJLENBQUM7WUFBRXVCLFFBQVEsRUFBRXFNLE9BQU8sQ0FBQ3RLLFlBQVk7WUFBRWpDLEtBQUssRUFBRXVNLE9BQU8sQ0FBQ2xHLGtCQUFrQjtZQUFFb0IsSUFBSSxFQUFFO1VBQVUsQ0FBQyxDQUFDO1FBQ2hILENBQUMsTUFBTSxJQUNOOEUsT0FBTyxDQUFDbEcsa0JBQWtCLElBQzFCa0csT0FBTyxDQUFDbEcsa0JBQWtCLENBQUMrRyxRQUFRLElBQ25DYixPQUFPLENBQUNsRyxrQkFBa0IsQ0FBQytHLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFDdENiLE9BQU8sQ0FBQ2xHLGtCQUFrQixDQUFDK0csUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDQyxRQUFRLElBQy9DZCxPQUFPLENBQUNsRyxrQkFBa0IsQ0FBQytHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQ0UsUUFBUSxFQUM5QztVQUNEO1VBQ0FyQixrQkFBa0IsQ0FBQ3ROLElBQUksQ0FBQztZQUN2QnVCLFFBQVEsRUFBRXFNLE9BQU8sQ0FBQ3RLLFlBQVk7WUFDOUJzTCxZQUFZLEVBQUVoQixPQUFPLENBQUNsRyxrQkFBa0IsQ0FBQytHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQ0MsUUFBUSxDQUFDL00sSUFBSTtZQUNsRWtOLGFBQWEsRUFBRWpCLE9BQU8sQ0FBQ2xHLGtCQUFrQixDQUFDK0csUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDRSxRQUFRLENBQUN0TixLQUFLO1lBQ3BFeUgsSUFBSSxFQUFFO1VBQ1AsQ0FBQyxDQUFDO1FBQ0g7O1FBRUE7UUFDQSxJQUFJOEUsT0FBTyxDQUFDakcsUUFBUSxFQUFFO1VBQ3JCNEUsTUFBTSxDQUFDdUMsT0FBTyxHQUNibEIsT0FBTyxDQUFDakcsUUFBUSxLQUFLdkIsUUFBUSxDQUFDSSxRQUFRLElBQ3RDakgsU0FBUyxDQUFDZSxJQUFJLENBQ2JyQyxjQUFjLENBQUM4TyxpQkFBaUIsQ0FBQ04sSUFBSSxDQUNwQ3hPLGNBQWMsRUFDZDJQLE9BQU8sQ0FBQ2pHLFFBQVEsRUFDaEJzRSxnQkFBZ0IsRUFDaEIyQixPQUFPLENBQUN0SyxZQUFZLEVBQ3BCaUosTUFBTSxDQUNOLENBQ0Q7UUFDSCxDQUFDLE1BQU07VUFDTkEsTUFBTSxDQUFDdUMsT0FBTyxHQUFHLElBQUk7UUFDdEI7UUFDQXZDLE1BQU0sQ0FBQ29CLFdBQVcsR0FBRzFQLGNBQWMsQ0FBQ3FCLCtCQUErQixDQUFDQyxTQUFTLEVBQUVxTyxPQUFPLENBQUN0SyxZQUFZLENBQUM7UUFDcEdpSixNQUFNLENBQUMzTCxTQUFTLEdBQUdnTixPQUFPLENBQUNoTixTQUFTO1FBQ3BDMkwsTUFBTSxDQUFDckYsWUFBWSxHQUFHMEcsT0FBTyxDQUFDMUcsWUFBWTtNQUMzQyxDQUFDLENBQUM7TUFFRixPQUFPK0UsZ0JBQWdCO0lBQ3hCLENBQUM7SUFDRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDOEMsZ0JBQWdCLEVBQUUsVUFBVUMsS0FBWSxFQUFFQyxNQUFlLEVBQVc7TUFDbkUsSUFBSUMsUUFBaUIsR0FBSUQsTUFBTSxJQUFJQSxNQUFNLENBQUNFLGlCQUFpQixFQUFjO01BRXpFLElBQUksQ0FBQ0QsUUFBUSxFQUFFO1FBQ2QsTUFBTXRDLEtBQUssR0FBR29DLEtBQUssQ0FBQzlNLFFBQVEsRUFBRTtRQUM5QixNQUFNa04sV0FBVyxHQUFHSixLQUFLLENBQUNLLGFBQWEsRUFBRTtRQUN6QyxNQUFNQyxvQkFBb0IsR0FBRzFDLEtBQUssQ0FBQzJDLFFBQVEsQ0FBQ0gsV0FBVyxDQUFDekssT0FBTyxFQUFFLEVBQUV5SyxXQUFXLENBQUMzTSxVQUFVLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO1VBQ3BHK00sZUFBZSxFQUFFO1FBQ2xCLENBQUMsQ0FBcUI7UUFDckJGLG9CQUFvQixDQUFTRyxlQUFlLEdBQUcsWUFBWTtVQUMzRDtRQUFBLENBQ0E7UUFDRFAsUUFBUSxHQUFHSSxvQkFBb0IsQ0FBQ0ksTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQztNQUNqRDtNQUVBLE9BQU9SLFFBQVE7SUFDaEIsQ0FBQztJQUVEUyxZQUFZLEVBQUUsVUFBVUMsS0FBVSxFQUFRO01BQ3pDLE1BQU1DLE1BQU0sR0FBR0QsS0FBSyxDQUFDRSxTQUFTLEVBQUU7TUFDaEMsTUFBTUMsZUFBZSxHQUFHRixNQUFNLENBQUMzTixRQUFRLENBQUMsWUFBWSxDQUFDO01BQ3JENk4sZUFBZSxDQUFDM0QsV0FBVyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUM7SUFDN0MsQ0FBQztJQUVENEQsV0FBVyxFQUFFLFVBQVVDLE9BQVksRUFBRTtNQUNwQ0EsT0FBTyxDQUFDQyxLQUFLLEVBQUU7TUFDZkQsT0FBTyxDQUFDRSxPQUFPLEVBQUU7SUFDbEIsQ0FBQztJQUVEQywwQkFBMEIsRUFBRSxnQkFDM0JyTyxNQUFhLEVBQ2J4QyxTQUFjLEVBQ2Q4USxXQUEyQixFQUMzQkMsU0FBYyxFQUNkbEQsUUFBYSxFQUNibUQsYUFBa0IsRUFDakI7TUFBQTtNQUNELE1BQU1DLFdBQVcsR0FBR0MsU0FBUyxDQUFDRCxXQUFXO01BQ3pDLE1BQU12SCxlQUFlLEdBQUd5SCxJQUFJLENBQUNDLHdCQUF3QixDQUFDLGFBQWEsQ0FBQztNQUNwRSx3QkFBQ04sV0FBVyxDQUFDTyxPQUFPLEVBQUUsa0ZBQXJCLHFCQUF1QnpCLGlCQUFpQixDQUFDLFVBQVUsQ0FBQywwREFBckQsc0JBQWdGL0MsV0FBVyxDQUFDLDZCQUE2QixFQUFFLElBQUksQ0FBQztNQUNoSWlFLFdBQVcsQ0FBQ1EsY0FBYyxDQUFDQyxZQUFZLENBQUM7UUFDdkNDLG1CQUFtQixFQUFFLFVBQVVDLFFBQWEsRUFBRUMscUJBQTBCLEVBQUU7VUFDekU7VUFDQUEscUJBQXFCLENBQUNDLG9CQUFvQixHQUFHQyxlQUFlLENBQUNDLGtCQUFrQixDQUFDM0UsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFMUssTUFBTSxFQUFFeEMsU0FBUyxDQUFDO1VBQzNHLE1BQU04UixhQUFvQixHQUFHLEVBQUU7VUFDL0JMLFFBQVEsQ0FBQ3RTLE9BQU8sQ0FBQyxVQUFVNFMsT0FBWSxFQUFFO1lBQ3hDLElBQUksQ0FBQ0EsT0FBTyxDQUFDQyxTQUFTLEVBQUUsRUFBRTtjQUN6QkYsYUFBYSxDQUFDclIsSUFBSSxDQUFDc1IsT0FBTyxDQUFDO1lBQzVCO1VBQ0QsQ0FBQyxDQUFDO1VBRUYsSUFBSWxFLFFBQVEsQ0FBQzVOLE1BQU0sR0FBRyxDQUFDLElBQUkrUSxhQUFhLENBQUMvUSxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3RENlEsV0FBVyxDQUFDbUIsUUFBUSxDQUFDQyxjQUFjLENBQUNqQixXQUFXLENBQUNrQixLQUFLLENBQUM7WUFDdEQsTUFBTUMsWUFBWSxHQUFHMUksZUFBZSxDQUFDTyxPQUFPLENBQUMsMkJBQTJCLENBQUM7WUFDekVvSSxZQUFZLENBQUNDLElBQUksQ0FBQ0YsWUFBWSxDQUFDO1VBQ2hDLENBQUMsTUFBTSxJQUFJcEIsYUFBYSxDQUFDL1EsTUFBTSxHQUFJdUMsTUFBTSxDQUFTK1AsbUJBQW1CLEVBQUUsQ0FBQ3RTLE1BQU0sRUFBRTtZQUMvRTZRLFdBQVcsQ0FBQ21CLFFBQVEsQ0FBQ0MsY0FBYyxDQUFDakIsV0FBVyxDQUFDa0IsS0FBSyxDQUFDO1VBQ3ZELENBQUMsTUFBTSxJQUFJbkIsYUFBYSxDQUFDL1EsTUFBTSxLQUFNdUMsTUFBTSxDQUFTK1AsbUJBQW1CLEVBQUUsQ0FBQ3RTLE1BQU0sRUFBRTtZQUNqRjZRLFdBQVcsQ0FBQ21CLFFBQVEsQ0FBQ0MsY0FBYyxDQUFDakIsV0FBVyxDQUFDdUIsS0FBSyxDQUFDO1VBQ3ZEO1VBRUEsSUFBSTFCLFdBQVcsQ0FBQ25PLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQ2lLLFdBQVcsQ0FBQyxhQUFhLENBQUMsSUFBSWtGLGFBQWEsQ0FBQzdSLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDeEZ5UixxQkFBcUIsQ0FBQ2UsY0FBYyxHQUFHLEtBQUs7WUFDNUNmLHFCQUFxQixDQUFDZ0IsaUJBQWlCLEdBQUcsS0FBSztVQUNoRDtVQUNBLE9BQU9oQixxQkFBcUI7UUFDN0I7TUFDRCxDQUFDLENBQUM7TUFDRixJQUFJWCxTQUFTLENBQUM0QixNQUFNLEVBQUUsRUFBRTtRQUFBO1FBQ3ZCalUsY0FBYyxDQUFDK1IsV0FBVyxDQUFDTSxTQUFTLENBQUM7UUFDckMseUJBQUNELFdBQVcsQ0FBQ08sT0FBTyxFQUFFLG1GQUFyQixzQkFBdUJ6QixpQkFBaUIsQ0FBQyxVQUFVLENBQUMsMERBQXJELHNCQUFnRi9DLFdBQVcsQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLENBQUM7TUFDeEg7TUFDQSx5QkFBQ2lFLFdBQVcsQ0FBQ08sT0FBTyxFQUFFLG1GQUFyQixzQkFBdUJ6QixpQkFBaUIsQ0FBQyxVQUFVLENBQUMsMERBQXJELHNCQUFnRi9DLFdBQVcsQ0FBQyw2QkFBNkIsRUFBRSxLQUFLLENBQUM7SUFDbEksQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDK0YsdUJBQXVCLEVBQUUsVUFBVXpQLGlCQUFzQixFQUFFMFAsWUFBaUIsRUFBRS9CLFdBQTJCLEVBQUVqRCxRQUFhLEVBQUU7TUFDekgsTUFBTWlGLGdCQUFnQixHQUFHM1AsaUJBQWlCLENBQUN5SixXQUFXLENBQUMsT0FBTyxDQUFDO01BQy9ELE1BQU1tRyx1QkFBNEIsR0FBRyxDQUFDLENBQUM7TUFFdkNsRixRQUFRLENBQUMxTyxPQUFPLENBQUVVLE1BQVcsSUFBSztRQUNqQyxNQUFNakIsS0FBSyxHQUFHaUIsTUFBTSxDQUFDbVQsUUFBUTtRQUM3QixNQUFNQyxpQkFBaUIsR0FBR0osWUFBWSxDQUFDSyxxQkFBcUIsRUFBRTtRQUM5RCxNQUFNQyxhQUFhLEdBQUdGLGlCQUFpQixDQUFDRyxvQkFBb0IsQ0FBQ04sZ0JBQWdCLEVBQUVqVCxNQUFNLENBQUMwSSwwQkFBMEIsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFO1FBQzdId0ssdUJBQXVCLENBQUNuVSxLQUFLLENBQUMsR0FBR2tTLFdBQVcsQ0FBQ3VDLFlBQVksQ0FBQ0MsK0JBQStCLENBQUNILGFBQWEsQ0FBQztNQUN6RyxDQUFDLENBQUM7TUFDRixPQUFPSix1QkFBdUI7SUFDL0IsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ1EsMEJBQTBCLEVBQUUsVUFBVTNVLEtBQVUsRUFBRTRVLFdBQWdCLEVBQUU5USxVQUFlLEVBQUU7TUFDcEY7TUFDQSxNQUFNK1EsZUFBZSxHQUNuQjdVLEtBQUssQ0FBQ2EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcrVCxXQUFXLEdBQUcsR0FBRyxHQUFHNVUsS0FBSyxDQUFDOFUsTUFBTSxDQUFDLENBQUMsRUFBRTlVLEtBQUssQ0FBQytVLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxhQUFhLEdBQUcsS0FBSztRQUN2SEMsWUFBWSxHQUFHLENBQUNILGVBQWUsR0FBR0ksT0FBTyxDQUFDQyxPQUFPLENBQUNOLFdBQVcsQ0FBQyxHQUFHOVEsVUFBVSxDQUFDcVIsYUFBYSxDQUFDTixlQUFlLENBQUM7TUFDM0c3VSxLQUFLLEdBQUc2VSxlQUFlLEdBQUc3VSxLQUFLLENBQUM4VSxNQUFNLENBQUM5VSxLQUFLLENBQUMrVSxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcvVSxLQUFLO01BQzFFLE9BQU87UUFBRUEsS0FBSztRQUFFZ1YsWUFBWTtRQUFFSDtNQUFnQixDQUFDO0lBQ2hELENBQUM7SUFFRE8sc0JBQXNCLEVBQUUsVUFBVXRSLFVBQWUsRUFBRXVSLFdBQW1CLEVBQUU5USxpQkFBc0IsRUFBRStRLFlBQW9CLEVBQUVDLFFBQWEsRUFBRTtNQUNwSSxNQUFNQyxlQUFlLEdBQUdqUixpQkFBaUIsQ0FBQ3lKLFdBQVcsQ0FBQyxPQUFPLENBQUM7TUFDOUQsTUFBTTtRQUFFaEwsS0FBSyxFQUFFeVMsTUFBTTtRQUFFQyxRQUFRLEVBQUVDO01BQWEsQ0FBQyxHQUFHN1IsVUFBVSxDQUFDcEMsU0FBUyxDQUFFLEdBQUU2QyxpQkFBa0IsSUFBRzhRLFdBQVksRUFBQyxDQUFDLENBQUMsQ0FBQztNQUMvRyxJQUFJTSxZQUFZLEVBQUU7UUFDakIsTUFBTUMsdUJBQXVCLEdBQUc5UixVQUFVLENBQUNwQyxTQUFTLENBQUUsSUFBRytULE1BQU8sSUFBR0UsWUFBYSxFQUFDLENBQUM7UUFDbEYsSUFBSUMsdUJBQXVCLEVBQUU7VUFDNUIsTUFBTUMsd0JBQXdCLEdBQUdELHVCQUF1QixDQUFDLE9BQU8sQ0FBQztVQUNqRTtVQUNBLElBQUlDLHdCQUF3QixLQUFLTCxlQUFlLEVBQUU7WUFDakQ7WUFDQUQsUUFBUSxDQUFDMVQsSUFBSSxDQUFDeVQsWUFBWSxDQUFDO1VBQzVCO1FBQ0Q7TUFDRCxDQUFDLE1BQU07UUFDTjtRQUNBQyxRQUFRLENBQUMxVCxJQUFJLENBQUN5VCxZQUFZLENBQUM7TUFDNUI7TUFDQSxPQUFPQyxRQUFRO0lBQ2hCLENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDTyx1QkFBdUIsRUFBRSxVQUFVQyxlQUFxQyxFQUFFeFIsaUJBQXNCLEVBQUVxUSxXQUFnQixFQUFFOVEsVUFBZSxFQUFFO01BQ3BJLE1BQU07UUFBRWtTLGdCQUFnQixFQUFFQyxpQkFBaUI7UUFBRUMsY0FBYyxFQUFFQztNQUFnQixDQUFDLEdBQUdKLGVBQWU7TUFDaEcsTUFBTUssU0FBYyxHQUFHLEVBQUU7TUFDekIsSUFBSWIsUUFBYSxHQUFHLEVBQUU7TUFDdEIsTUFBTUMsZUFBZSxHQUFHalIsaUJBQWlCLENBQUN5SixXQUFXLENBQUMsT0FBTyxDQUFDO01BRTlELElBQUk0RyxXQUFXLEtBQUtZLGVBQWUsRUFBRTtRQUNwQztRQUNBVyxlQUFlLGFBQWZBLGVBQWUsdUJBQWZBLGVBQWUsQ0FBRTVWLE9BQU8sQ0FBRStVLFlBQWlCLElBQUs7VUFDL0NBLFlBQVksR0FBR0EsWUFBWSxDQUFDLHlCQUF5QixDQUFDO1VBQ3RELElBQUlELFdBQW1CO1VBQ3ZCLElBQUlDLFlBQVksQ0FBQ25OLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUMvQmtOLFdBQVcsR0FBR0MsWUFBWSxDQUFDalYsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztVQUN6QyxDQUFDLE1BQU07WUFDTmdWLFdBQVcsR0FBR0MsWUFBWTtVQUMzQjtVQUNBQyxRQUFRLEdBQUd6VixjQUFjLENBQUNzVixzQkFBc0IsQ0FBQ3RSLFVBQVUsRUFBRXVSLFdBQVcsRUFBRTlRLGlCQUFpQixFQUFFK1EsWUFBWSxFQUFFQyxRQUFRLENBQUM7UUFDckgsQ0FBQyxDQUFDO01BQ0g7TUFFQSxJQUFJVSxpQkFBaUIsQ0FBQzVVLE1BQU0sRUFBRTtRQUM3QjRVLGlCQUFpQixDQUFDMVYsT0FBTyxDQUFFOFYsVUFBZSxJQUFLO1VBQzlDLE1BQU07WUFBRXJCO1VBQWEsQ0FBQyxHQUFHbFYsY0FBYyxDQUFDNlUsMEJBQTBCLENBQUMwQixVQUFVLEVBQUV6QixXQUFXLEVBQUU5USxVQUFVLENBQUM7VUFDdkdzUyxTQUFTLENBQUN2VSxJQUFJLENBQ2JtVCxZQUFZLENBQUNzQixJQUFJLENBQUVDLFlBQWlCLElBQUs7WUFDeEM7WUFDQSxJQUFJQSxZQUFZLEtBQUtmLGVBQWUsRUFBRTtjQUNyQ0QsUUFBUSxDQUFDMVQsSUFBSSxDQUFDd1UsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUM1QixDQUFDLE1BQU0sSUFBSUEsVUFBVSxDQUFDbE8sUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2NBQ3BDLE1BQU1rTixXQUFXLEdBQUdnQixVQUFVLENBQUNoVyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2NBQzVDa1YsUUFBUSxHQUFHelYsY0FBYyxDQUFDc1Ysc0JBQXNCLENBQy9DdFIsVUFBVSxFQUNWdVIsV0FBVyxFQUNYOVEsaUJBQWlCLEVBQ2pCOFIsVUFBVSxFQUNWZCxRQUFRLENBQ1I7WUFDRjtZQUNBLE9BQU9OLE9BQU8sQ0FBQ0MsT0FBTyxDQUFDSyxRQUFRLENBQUM7VUFDakMsQ0FBQyxDQUFDLENBQ0Y7UUFDRixDQUFDLENBQUM7TUFDSCxDQUFDLE1BQU07UUFDTmEsU0FBUyxDQUFDdlUsSUFBSSxDQUFDb1QsT0FBTyxDQUFDQyxPQUFPLENBQUNLLFFBQVEsQ0FBQyxDQUFDO01BQzFDO01BRUEsT0FBT04sT0FBTyxDQUFDdUIsR0FBRyxDQUFDSixTQUFTLENBQUM7SUFDOUIsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0ssaUNBQWlDLEVBQUUsQ0FDbENDLGNBQTZFLEVBQzdFblMsaUJBQTBCLEtBQ3RCO01BQ0osTUFBTWlSLGVBQWUsR0FBR2pSLGlCQUFpQixDQUFDeUosV0FBVyxDQUFDLE9BQU8sQ0FBQztNQUM5RCxNQUFNMkksd0JBQStELEdBQUc1TyxNQUFNLENBQUNxRyxNQUFNLENBQUNzSSxjQUFjLENBQUMsQ0FBQzNVLE1BQU0sQ0FDMUdxTyxHQUF3QyxJQUFLO1FBQzdDLE9BQU9BLEdBQUcsQ0FBQzFLLElBQUksQ0FBQzdFLE9BQU8sQ0FBQzJVLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztNQUMvQyxDQUFDLENBQ0Q7TUFFRCxNQUFNb0IsYUFBYSxHQUFHclMsaUJBQWlCLENBQUNpQyxPQUFPLEVBQUUsQ0FBQ25HLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQ3dXLEdBQUcsRUFBRTtNQUNsRSxNQUFNQyxvQ0FBb0MsR0FBR0gsd0JBQXdCLENBQUM1VSxNQUFNLENBQUVxTyxHQUF3QyxJQUFLO1FBQzFILE1BQU0yRyxtQkFBd0QsR0FBRzNHLEdBQUcsQ0FBQzRHLFdBQVcsQ0FBQ2QsY0FBYztRQUMvRixPQUFPYSxtQkFBbUIsYUFBbkJBLG1CQUFtQixlQUFuQkEsbUJBQW1CLENBQUVoVixNQUFNLENBQUVrVixRQUErQixJQUFLQSxRQUFRLENBQUMseUJBQXlCLENBQUMsS0FBS0wsYUFBYSxDQUFDLENBQzVIdlYsTUFBTSxHQUNMK08sR0FBRyxHQUNILEtBQUs7TUFDVCxDQUFDLENBQUM7TUFDRixPQUFPMEcsb0NBQW9DLENBQUN6VixNQUFNO0lBQ25ELENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQzZWLDhDQUE4QyxFQUFFLGdCQUFnQkMsT0FBNEMsRUFBRTtNQUM3RyxNQUFNO1FBQ0xqRixXQUFXO1FBQ1hrRixhQUFhO1FBQ2JWLGNBQWM7UUFDZHhILFNBQVM7UUFDVG1JLE9BQU87UUFDUDlLLEdBQUc7UUFDSGhJLGlCQUFpQjtRQUNqQlQsVUFBVTtRQUNWeEMsZ0JBQWdCO1FBQ2hCZ1c7TUFDRCxDQUFDLEdBQUdILE9BQU87TUFDWCxNQUFNSSw0QkFBNEIsR0FBRyxDQUFDSCxhQUFhLENBQUM7TUFDcEQsTUFBTTVCLGVBQWUsR0FBR2pSLGlCQUFpQixDQUFDeUosV0FBVyxDQUFDLE9BQU8sQ0FBQztNQUM5RCxNQUFNd0osYUFBYSxHQUFHN08sV0FBVyxDQUFDOE8sZUFBZSxDQUFDdkYsV0FBVyxDQUFDTyxPQUFPLEVBQUUsQ0FBQztNQUN4RSxNQUFNaUYsbUJBQW1CLEdBQUdGLGFBQWEsQ0FBQ2xELHFCQUFxQixFQUFFO01BRWpFLE1BQU1xRCxzQ0FBc0MsR0FBRzdYLGNBQWMsQ0FBQzJXLGlDQUFpQyxDQUFDQyxjQUFjLEVBQUVuUyxpQkFBaUIsQ0FBQztNQUVsSSxJQUFJbVMsY0FBYyxFQUFFO1FBQ25CLE1BQU1rQiwyQkFBMkIsR0FBRzdQLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDME8sY0FBYyxDQUFDO1FBQy9ELE1BQU1tQix1QkFBNEIsR0FBRzlQLE1BQU0sQ0FBQ3FHLE1BQU0sQ0FBQ3NJLGNBQWMsQ0FBQztRQUVsRSxNQUFNb0IsbUJBQXdCLEdBQUcsQ0FBQyxDQUFDO1FBQ25DUixnQ0FBZ0MsQ0FBQy9LLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQyxLQUFLLE1BQU0sQ0FBQ3BNLEtBQUssRUFBRStELElBQUksQ0FBQyxJQUFJMlQsdUJBQXVCLENBQUNFLE9BQU8sRUFBRSxFQUFFO1VBQzlELE1BQU1DLHVCQUF1QixHQUFHSiwyQkFBMkIsQ0FBQ3pYLEtBQUssQ0FBQztVQUNsRSxNQUFNeVUsV0FBVyxHQUFHb0QsdUJBQXVCLENBQUMzWCxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1VBQ3pELE1BQU1tQixRQUFhLEdBQUcwUSxXQUFXLENBQUN1QyxZQUFZLENBQUN3RCx3QkFBd0IsQ0FBQzNXLGdCQUFnQixFQUFFc1QsV0FBVyxDQUFDO1VBQ3RHMVEsSUFBSSxDQUFDcUMsT0FBTyxHQUFHL0UsUUFBUTtVQUV2QixNQUFNMFcsb0JBQW9CLEdBQUdoRyxXQUFXLENBQUN1QyxZQUFZLENBQUMwRCwyQkFBMkIsRUFBRTtVQUNuRixNQUFNQyxrQkFBa0IsR0FBR0Ysb0JBQW9CLENBQUMxVyxRQUFRLENBQUNnRixPQUFPLEVBQUUsQ0FBQztVQUNuRTBMLFdBQVcsQ0FBQ3VDLFlBQVksQ0FBQzRELHNDQUFzQyxDQUFDN1csUUFBUSxDQUFDO1VBQ3pFLElBQUk4Vyw0QkFBNEIsR0FBRyxDQUFDcFUsSUFBSSxDQUFDOFMsV0FBVyxDQUFDO1VBQ3JEc0IsNEJBQTRCLEdBQzNCRixrQkFBa0IsSUFBSUEsa0JBQWtCLENBQUMvVyxNQUFNLEdBQzVDaVgsNEJBQTRCLENBQUNDLE1BQU0sQ0FBQ0gsa0JBQWtCLENBQUMsR0FDdkRFLDRCQUE0QjtVQUNoQ1IsbUJBQW1CLENBQUN0VyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7VUFDbEMsS0FBSyxNQUFNZ1gsV0FBVyxJQUFJRiw0QkFBNEIsRUFBRTtZQUN2RCxJQUFJLENBQUNSLG1CQUFtQixDQUFDdFcsUUFBUSxDQUFDLENBQUNJLGNBQWMsQ0FBQzRXLFdBQVcsQ0FBQzVPLGtCQUFrQixDQUFDLEVBQUU7Y0FDbEZrTyxtQkFBbUIsQ0FBQ3RXLFFBQVEsQ0FBQyxDQUFDZ1gsV0FBVyxDQUFDNU8sa0JBQWtCLENBQUMsR0FBRyxJQUFJO2NBQ3BFLElBQUk2TyxpQkFBd0IsR0FBRyxFQUFFO2dCQUNoQ0MsVUFBaUIsR0FBRyxFQUFFO2dCQUN0QkMsaUJBQXFDO2NBRXRDLE1BQU1DLCtCQUErQixHQUFHLGdCQUFnQkMsV0FBaUMsRUFBRTtnQkFDMUYsTUFBTTtrQkFBRTdDLGdCQUFnQixFQUFFQyxpQkFBaUI7a0JBQUVDLGNBQWMsRUFBRUM7Z0JBQWdCLENBQUMsR0FBRzBDLFdBQVc7Z0JBQzVGLE1BQU1DLG9CQUFvQixHQUFHRCxXQUFXLENBQUNqUCxrQkFBa0IsQ0FBQ3ZKLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pFLE1BQU0wWSw0QkFBNEIsR0FBRyxNQUFNalosY0FBYyxDQUFDZ1csdUJBQXVCLENBQ2hGK0MsV0FBVyxFQUNYdFUsaUJBQWlCLEVBQ2pCdVUsb0JBQW9CLEVBQ3BCaFYsVUFBVSxDQUNWO2dCQUNEMlUsaUJBQWlCLEdBQUdNLDRCQUE0QixDQUFDLENBQUMsQ0FBQztnQkFDbkRMLFVBQVUsR0FBRyxDQUFDekMsaUJBQWlCLElBQUksRUFBRSxFQUFFc0MsTUFBTSxDQUFFcEMsZUFBZSxJQUFjLEVBQUUsQ0FBQztnQkFFL0UsTUFBTTZDLFVBQThCLEdBQUdILFdBQVcsQ0FBQ0ksYUFBYTtnQkFDaEUsTUFBTUMsZ0JBQWdCLEdBQUdSLFVBQVUsQ0FBQzNXLE1BQU0sQ0FBRW9YLE1BQVcsSUFBSztrQkFDM0QsT0FBTyxDQUFDVixpQkFBaUIsQ0FBQ3RRLFFBQVEsQ0FBQ2dSLE1BQU0sQ0FBQztnQkFDM0MsQ0FBQyxDQUFDO2dCQUVGN0IsZ0NBQWdDLENBQUMvSyxHQUFHLENBQUMsQ0FBQ3NNLFdBQVcsQ0FBQ2pQLGtCQUFrQixDQUFDLEdBQUc7a0JBQ3ZFMkwsUUFBUSxFQUFFMkQsZ0JBQWdCO2tCQUMxQjFYLFFBQVEsRUFBRUEsUUFBUTtrQkFDbEJxWDtnQkFDRCxDQUFDOztnQkFFRDtnQkFDQSxJQUFJRyxVQUFVLElBQUlGLG9CQUFvQixLQUFLdEQsZUFBZSxFQUFFO2tCQUMzRDtrQkFDQSxNQUFNNEQsY0FBYyxHQUFHQyxXQUFXLENBQUNDLGVBQWUsQ0FBQ3hWLFVBQVUsQ0FBQ3BDLFNBQVMsQ0FBRSxJQUFHc1gsVUFBVyxFQUFDLENBQUMsRUFBRUEsVUFBVSxDQUFDO2tCQUN0RyxJQUFJLENBQUNJLGNBQWMsRUFBRTtvQkFDcEJULGlCQUFpQixHQUFHSyxVQUFVO2tCQUMvQixDQUFDLE1BQU07b0JBQ04xQixnQ0FBZ0MsQ0FBQy9LLEdBQUcsQ0FBQyxDQUFDc00sV0FBVyxDQUFDalAsa0JBQWtCLENBQUMsQ0FBQyxlQUFlLENBQUMsR0FBR29QLFVBQVU7a0JBQ3BHO2dCQUNELENBQUMsTUFBTTtrQkFDTjFCLGdDQUFnQyxDQUFDL0ssR0FBRyxDQUFDLENBQUNzTSxXQUFXLENBQUNqUCxrQkFBa0IsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxHQUFHb1AsVUFBVTtnQkFDcEc7Z0JBRUEsSUFBSXJCLHNDQUFzQyxFQUFFO2tCQUMzQ2MsaUJBQWlCLEdBQUcsRUFBRTtnQkFDdkI7Z0JBQ0EsT0FBTztrQkFDTmxELFFBQVEsRUFBRWtELGlCQUFpQjtrQkFDM0JjLGFBQWEsRUFBRVo7Z0JBQ2hCLENBQUM7Y0FDRixDQUFDO2NBQ0RwQiw0QkFBNEIsQ0FBQzFWLElBQUksQ0FDaENxUSxXQUFXLENBQUN1QyxZQUFZLENBQUMrRSxrQkFBa0IsQ0FBQ2hCLFdBQVcsRUFBRWhYLFFBQVEsRUFBRTZWLE9BQU8sRUFBRXVCLCtCQUErQixDQUFDLENBQzVHO1lBQ0Y7VUFDRDtRQUNEO01BQ0Q7TUFDQSxJQUFJMUosU0FBUyxhQUFUQSxTQUFTLGVBQVRBLFNBQVMsQ0FBRzNDLEdBQUcsQ0FBQyxJQUFJMkMsU0FBUyxDQUFDM0MsR0FBRyxDQUFDLENBQUNsTCxNQUFNLEVBQUU7UUFDOUNrVyw0QkFBNEIsQ0FBQzFWLElBQUksQ0FBQzZWLG1CQUFtQixDQUFDOEIsa0JBQWtCLENBQUN0SyxTQUFTLENBQUMzQyxHQUFHLENBQUMsRUFBRWpMLGdCQUFnQixFQUFFK1YsT0FBTyxDQUFDLENBQUM7TUFDckg7TUFDQSxPQUFRcEMsT0FBTyxDQUFTd0UsVUFBVSxDQUFDbEMsNEJBQTRCLENBQUM7SUFDakUsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ21DLFlBQVksRUFBRSxnQkFBZ0I5VixNQUFhLEVBQUV4QyxTQUFnQixFQUFFOFEsV0FBMkIsRUFBZ0I7TUFDekcsTUFBTXlILGFBQWEsR0FBRyw4Q0FBOEM7UUFDbkU5VixVQUFpQixHQUFHLEVBQUU7UUFDdEJpSCxlQUFlLEdBQUd5SCxJQUFJLENBQUNDLHdCQUF3QixDQUFDLGFBQWEsQ0FBQztRQUM5RDNHLGNBQWMsR0FBRy9MLGNBQWMsQ0FBQytLLHdCQUF3QixDQUFDQyxlQUFlLEVBQUUxSixTQUFTLENBQUNDLE1BQU0sRUFBRXVDLE1BQU0sQ0FBQztRQUNuR2MsZUFBZSxHQUFHNUUsY0FBYyxDQUFDNkQsb0JBQW9CLENBQUNDLE1BQU0sRUFBRXhDLFNBQVMsRUFBRXlDLFVBQVUsQ0FBQztRQUNwRmtMLGFBQWEsR0FBR2pQLGNBQWMsQ0FBQzhRLGdCQUFnQixDQUFDaE4sTUFBTSxDQUFDO1FBQ3ZEa0ssZ0JBQWdCLEdBQUdoTyxjQUFjLENBQUNnUCx1QkFBdUIsQ0FBQzFOLFNBQVMsRUFBRXlDLFVBQVUsRUFBRWdJLGNBQWMsRUFBRWtELGFBQWEsQ0FBQztRQUMvR04sS0FBSyxHQUFHN0ssTUFBTSxDQUFDRyxRQUFRLEVBQUU7UUFDekI2VixTQUFTLEdBQUduTCxLQUFLLENBQUN6SyxZQUFZLEVBQW9CO1FBQ2xENlYsVUFBVSxHQUFHLElBQUlDLGFBQWEsQ0FBQ3BWLGVBQWUsQ0FBQ3FWLE9BQU8sRUFBRSxFQUFFSCxTQUFTLENBQUM7TUFFckUsTUFBTUksU0FBUyxHQUFHQyxvQkFBb0IsQ0FBQ0MsWUFBWSxDQUFDUCxhQUFhLEVBQUUsVUFBVSxDQUFDO01BRTlFLE1BQU1RLGdCQUFnQixHQUFHLE1BQU1sRixPQUFPLENBQUNDLE9BQU8sQ0FDN0NrRixlQUFlLENBQUNDLE9BQU8sQ0FDdEJMLFNBQVMsRUFDVDtRQUFFdFUsSUFBSSxFQUFFaVU7TUFBYyxDQUFDLEVBQ3ZCO1FBQ0NXLGVBQWUsRUFBRTtVQUNoQkMsY0FBYyxFQUFFVixVQUFVLENBQUNXLG9CQUFvQixDQUFDLEdBQUcsQ0FBQztVQUNwRFosU0FBUyxFQUFFQSxTQUFTLENBQUNZLG9CQUFvQixDQUFDLEdBQUcsQ0FBQztVQUM5Q0MsV0FBVyxFQUFFYixTQUFTLENBQUNZLG9CQUFvQixDQUFDWixTQUFTLENBQUNjLFdBQVcsQ0FBQzNMLGFBQWEsQ0FBQ3ZJLE9BQU8sRUFBRSxDQUFDO1FBQzNGLENBQUM7UUFDRG1VLE1BQU0sRUFBRTtVQUNQSixjQUFjLEVBQUVWLFVBQVU7VUFDMUJELFNBQVMsRUFBRUEsU0FBUztVQUNwQmEsV0FBVyxFQUFFYjtRQUNkO01BQ0QsQ0FBQyxDQUNELENBQ0Q7TUFDRCxNQUFNZ0IsY0FBYyxHQUFHLE1BQU1DLFFBQVEsQ0FBQ0MsSUFBSSxDQUFDO1FBQUVDLFVBQVUsRUFBRVo7TUFBaUIsQ0FBQyxDQUFDO01BQzVFLE1BQU1ySSxPQUFPLEdBQUcsSUFBSWtKLE1BQU0sQ0FBQztRQUMxQkMsU0FBUyxFQUFFLElBQUk7UUFDZkMsS0FBSyxFQUFFclAsY0FBYyxDQUFDVCxhQUFhO1FBQ25DK1AsT0FBTyxFQUFFLENBQUNQLGNBQWMsQ0FBUTtRQUNoQ1EsU0FBUyxFQUFFdGIsY0FBYyxDQUFDMFIsWUFBWTtRQUN0QzZKLFdBQVcsRUFBRSxJQUFJQyxNQUFNLENBQUM7VUFDdkJoUCxJQUFJLEVBQUV4TSxjQUFjLENBQUN5YixPQUFPLENBQUNDLDhCQUE4QixDQUFDM1AsY0FBYyxFQUFFbkgsZUFBZSxDQUFDaEQsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1VBQzNHaUosSUFBSSxFQUFFLFlBQVk7VUFDbEI4USxLQUFLLEVBQUUsZ0JBQWdCQyxNQUFXLEVBQUU7WUFBQTtZQUNuQzFJLGVBQWUsQ0FBQzJJLDZCQUE2QixFQUFFO1lBQy9DM0ksZUFBZSxDQUFDNEksK0JBQStCLEVBQUU7WUFDakQseUJBQUMxSixXQUFXLENBQUNPLE9BQU8sRUFBRSxtRkFBckIsc0JBQXVCekIsaUJBQWlCLENBQUMsVUFBVSxDQUFDLDBEQUFyRCxzQkFBZ0YvQyxXQUFXLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDO1lBQ3RILE1BQU1nRyxZQUFZLEdBQUd0TCxXQUFXLENBQUM4TyxlQUFlLENBQUN2RixXQUFXLENBQUNPLE9BQU8sRUFBRSxDQUFDO1lBQ3ZFLE1BQU1OLFNBQVMsR0FBR3VKLE1BQU0sQ0FBQy9KLFNBQVMsRUFBRSxDQUFDeEgsU0FBUyxFQUFFO1lBQ2hELE1BQU0wUixNQUFNLEdBQUcxSixTQUFTLENBQUNwTyxRQUFRLENBQUMsWUFBWSxDQUFDO1lBQy9DLE1BQU1rTCxRQUFRLEdBQUc0TSxNQUFNLENBQUM3TixXQUFXLENBQUMsVUFBVSxDQUFDO1lBRS9DLE1BQU1sSyxVQUFVLEdBQUdGLE1BQU0sSUFBS0EsTUFBTSxDQUFDRyxRQUFRLEVBQUUsQ0FBQ0MsWUFBWSxFQUFVO2NBQ3JFQyxxQkFBcUIsR0FBR0wsTUFBTSxDQUFDTSxJQUFJLENBQUMsVUFBVSxDQUFDO2NBQy9DSyxpQkFBaUIsR0FBR1QsVUFBVSxDQUFDUSxVQUFVLENBQUNMLHFCQUFxQixDQUFDO1lBQ2pFLE1BQU1tTyxhQUFvQixHQUFHLEVBQUU7WUFDL0IsTUFBTWxELFNBQVMsR0FBRzJNLE1BQU0sQ0FBQzdOLFdBQVcsQ0FBQyxZQUFZLENBQUM7WUFDbEQsTUFBTThOLHFCQUFxQixHQUFHRCxNQUFNLENBQUM3TixXQUFXLENBQUMsdUJBQXVCLENBQUM7WUFDekUsSUFBSXFKLE9BQWU7WUFDbkIsSUFBSTBFLGNBQXFCO1lBQ3pCLE1BQU1DLGdCQUFxQixHQUFHLEVBQUU7WUFDaEMsTUFBTUMsZ0JBQXFCLEdBQUcsQ0FBQyxDQUFDO1lBQ2hDLE1BQU1DLGtCQUFrQixHQUFHOWEsU0FBUyxDQUFDQyxNQUFNO1lBQzNDLE1BQU1pVyxnQ0FBcUMsR0FBRyxDQUFDLENBQUM7WUFDaEQsTUFBTW5ELHVCQUF1QixHQUFHclUsY0FBYyxDQUFDa1UsdUJBQXVCLENBQ3JFelAsaUJBQWlCLEVBQ2pCMFAsWUFBWSxFQUNaL0IsV0FBVyxFQUNYakQsUUFBUSxDQUNSO1lBQ0Q7WUFDQTtZQUNBOztZQUVBN04sU0FBUyxDQUFDYixPQUFPLENBQUMsVUFBVWUsZ0JBQXFCLEVBQUU2YSxHQUFXLEVBQUU7Y0FDL0RKLGNBQWMsR0FBRyxFQUFFO2NBQ25COU0sUUFBUSxDQUFDMU8sT0FBTyxDQUFDLGdCQUFnQnFFLE9BQVksRUFBRTtnQkFDOUMsSUFBSSxDQUFDcVgsZ0JBQWdCLENBQUNyYSxjQUFjLENBQUNnRCxPQUFPLENBQUN3UCxRQUFRLENBQUMsRUFBRTtrQkFDdkQ2SCxnQkFBZ0IsQ0FBQ3JYLE9BQU8sQ0FBQ3dQLFFBQVEsQ0FBQyxHQUFHLENBQUM7Z0JBQ3ZDO2dCQUNBO2dCQUNBLElBQUlELHVCQUF1QixDQUFDdlAsT0FBTyxDQUFDd1AsUUFBUSxDQUFDLEVBQUU7a0JBQzlDMkgsY0FBYyxDQUFDblgsT0FBTyxDQUFDd1AsUUFBUSxDQUFDLEdBQUdELHVCQUF1QixDQUFDdlAsT0FBTyxDQUFDd1AsUUFBUSxDQUFDO2dCQUM3RTtnQkFFQSxJQUFJMEgscUJBQXFCLEVBQUU7a0JBQzFCQSxxQkFBcUIsQ0FBQzNaLElBQUksQ0FBQyxVQUFVaUQsYUFBa0IsRUFBRTtvQkFDeEQsSUFBSVIsT0FBTyxDQUFDd1AsUUFBUSxLQUFLaFAsYUFBYSxDQUFDaEMsUUFBUSxFQUFFO3NCQUNoRCxJQUFJZ0MsYUFBYSxDQUFDdUYsSUFBSSxLQUFLLFNBQVMsRUFBRTt3QkFDckMsT0FBT3ZGLGFBQWEsQ0FBQ2xDLEtBQUssS0FBSyxJQUFJO3NCQUNwQyxDQUFDLE1BQU0sSUFDTmtDLGFBQWEsQ0FBQ3VGLElBQUksS0FBSyxNQUFNLElBQzdCdkYsYUFBYSxDQUFDc0wsYUFBYSxJQUMzQnRMLGFBQWEsQ0FBQ3FMLFlBQVksRUFDekI7d0JBQ0QsT0FBT25QLGdCQUFnQixDQUFDSSxTQUFTLENBQUMwRCxhQUFhLENBQUNxTCxZQUFZLENBQUMsS0FBS3JMLGFBQWEsQ0FBQ3NMLGFBQWE7c0JBQzlGO29CQUNEO2tCQUNELENBQUMsQ0FBQztnQkFDSDtnQkFDQTJHLE9BQU8sR0FBSSxTQUFROEUsR0FBSSxFQUFDO2dCQUN4QixNQUFNL0UsYUFBYSxHQUFHOVYsZ0JBQWdCLENBQ3BDMk0sV0FBVyxDQUFDckosT0FBTyxDQUFDd1AsUUFBUSxFQUFFeFAsT0FBTyxDQUFDMUIsS0FBSyxFQUFFbVUsT0FBTyxDQUFDLENBQ3JEK0UsS0FBSyxDQUFDLFVBQVVDLE1BQVcsRUFBRTtrQkFDN0JqSyxhQUFhLENBQUN2USxJQUFJLENBQUNQLGdCQUFnQixDQUFDSSxTQUFTLEVBQUUsQ0FBQztrQkFDaER5TCxHQUFHLENBQUNtUCxLQUFLLENBQUMsc0RBQXNELEVBQUVELE1BQU0sQ0FBQztrQkFDekVKLGdCQUFnQixDQUFDclgsT0FBTyxDQUFDd1AsUUFBUSxDQUFDLEdBQUc2SCxnQkFBZ0IsQ0FBQ3JYLE9BQU8sQ0FBQ3dQLFFBQVEsQ0FBQyxHQUFHLENBQUM7a0JBQzNFLE9BQU9hLE9BQU8sQ0FBQ3NILE1BQU0sQ0FBQztvQkFBRUMsbUJBQW1CLEVBQUU7a0JBQUssQ0FBQyxDQUFDO2dCQUNyRCxDQUFDLENBQUM7Z0JBRUgsTUFBTUMsK0JBQW9FLEdBQUc7a0JBQzVFdkssV0FBVztrQkFDWGtGLGFBQWE7a0JBQ2JWLGNBQWMsRUFBRXZDLHVCQUF1QixDQUFDdlAsT0FBTyxDQUFDd1AsUUFBUSxDQUFDO2tCQUN6RGxGLFNBQVM7a0JBQ1RtSSxPQUFPO2tCQUNQOUssR0FBRyxFQUFFM0gsT0FBTyxDQUFDd1AsUUFBUTtrQkFDckI3UCxpQkFBaUI7a0JBQ2pCVCxVQUFVO2tCQUNWeEMsZ0JBQWdCO2tCQUNoQmdXO2dCQUNELENBQUM7Z0JBQ0QwRSxnQkFBZ0IsQ0FBQ25hLElBQUksQ0FDcEIvQixjQUFjLENBQUNvWCw4Q0FBOEMsQ0FBQ3VGLCtCQUErQixDQUFDLENBQzlGO2NBQ0YsQ0FBQyxDQUFDO1lBQ0gsQ0FBQyxDQUFDO1lBRUYsTUFBT3hILE9BQU8sQ0FDWndFLFVBQVUsQ0FBQ3VDLGdCQUFnQixDQUFDLENBQzVCMUYsSUFBSSxDQUFDLGtCQUFrQjtjQUN2QmUsT0FBTyxHQUFJLHdCQUF1QjtjQUNsQyxNQUFNcUYsZ0JBQWdCLEdBQUcsRUFBRTtjQUMzQixNQUFNQyx5QkFBOEIsR0FBRzVVLE1BQU0sQ0FBQ3FHLE1BQU0sQ0FBQ2tKLGdDQUFnQyxDQUFDO2NBQ3RGLE1BQU1zRixtQkFBMEIsR0FBRzdVLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDc1AsZ0NBQWdDLENBQUM7Y0FFaEZxRix5QkFBeUIsQ0FBQ3BjLE9BQU8sQ0FBQyxDQUFDaVksV0FBZ0IsRUFBRXJZLEtBQVUsS0FBSztnQkFDbkUsTUFBTTBjLFVBQVUsR0FBR0QsbUJBQW1CLENBQUN6YyxLQUFLLENBQUM7Z0JBQzdDLElBQUk4YixnQkFBZ0IsQ0FBQ1ksVUFBVSxDQUFDLEtBQUtYLGtCQUFrQixFQUFFO2tCQUN4RCxNQUFNWSx1QkFBdUIsR0FBRy9VLE1BQU0sQ0FBQ3FHLE1BQU0sQ0FBQ29LLFdBQVcsQ0FBQztrQkFDMURzRSx1QkFBdUIsQ0FBQ3ZjLE9BQU8sQ0FBRXdjLEdBQVEsSUFBSztvQkFDN0MsTUFBTTtzQkFBRXhILFFBQVE7c0JBQUUvVCxRQUFRO3NCQUFFK1gsYUFBYTtzQkFBRVY7b0JBQVksQ0FBQyxHQUFHa0UsR0FBRztvQkFDOUQsTUFBTUMsb0JBQW9CLEdBQUcsWUFBWTtzQkFDeEMsT0FBT3pILFFBQVE7b0JBQ2hCLENBQUM7b0JBQ0QsTUFBTTBILDhCQUE4QixHQUFHLFlBQVk7c0JBQ2xELE9BQU87d0JBQ04xSCxRQUFRLEVBQUV5SCxvQkFBb0IsRUFBRTt3QkFDaEN6RCxhQUFhLEVBQUVBO3NCQUNoQixDQUFDO29CQUNGLENBQUM7b0JBRURtRCxnQkFBZ0IsQ0FBQzdhLElBQUk7b0JBQ3BCO29CQUNBcVEsV0FBVyxDQUFDdUMsWUFBWSxDQUFDK0Usa0JBQWtCLENBQzFDWCxXQUFXLEVBQ1hyWCxRQUFRLEVBQ1I2VixPQUFPLEVBQ1A0Riw4QkFBOEIsQ0FDOUIsQ0FDRDtrQkFDRixDQUFDLENBQUM7Z0JBQ0g7Y0FDRCxDQUFDLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FDRDNHLElBQUksQ0FBQyxZQUFZO2NBQ2pCeFcsY0FBYyxDQUFDbVMsMEJBQTBCLENBQUNyTyxNQUFNLEVBQUV4QyxTQUFTLEVBQUU4USxXQUFXLEVBQUVDLFNBQVMsRUFBRWxELFFBQVEsRUFBRW1ELGFBQWEsQ0FBQztZQUM5RyxDQUFDLENBQUMsQ0FDRGdLLEtBQUssQ0FBRWMsQ0FBTSxJQUFLO2NBQ2xCcGQsY0FBYyxDQUFDK1IsV0FBVyxDQUFDQyxPQUFPLENBQUM7Y0FDbkMsT0FBT21ELE9BQU8sQ0FBQ3NILE1BQU0sQ0FBQ1csQ0FBQyxDQUFDO1lBQ3pCLENBQUMsQ0FBQztVQUNKO1FBQ0QsQ0FBQyxDQUFDO1FBQ0ZDLFNBQVMsRUFBRSxJQUFJN0IsTUFBTSxDQUFDO1VBQ3JCaFAsSUFBSSxFQUFFVCxjQUFjLENBQUNKLGdCQUFnQjtVQUNyQ2tGLE9BQU8sRUFBRTdRLGNBQWMsQ0FBQ3liLE9BQU8sQ0FBQzZCLHdCQUF3QixDQUFDMVksZUFBZSxDQUFDaEQsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBUTtVQUNyRytaLEtBQUssRUFBRSxVQUFVQyxNQUFXLEVBQUU7WUFDN0IsTUFBTXZKLFNBQVMsR0FBR3VKLE1BQU0sQ0FBQy9KLFNBQVMsRUFBRSxDQUFDeEgsU0FBUyxFQUFFO1lBQ2hEckssY0FBYyxDQUFDK1IsV0FBVyxDQUFDTSxTQUFTLENBQUM7VUFDdEM7UUFDRCxDQUFDO01BQ0YsQ0FBQyxDQUFDO01BQ0ZMLE9BQU8sQ0FBQ3BELFFBQVEsQ0FBQ1osZ0JBQWdCLEVBQUUsWUFBWSxDQUFDO01BQ2hEZ0UsT0FBTyxDQUFDcEQsUUFBUSxDQUFDRCxLQUFLLENBQUM7TUFDdkJxRCxPQUFPLENBQUNuRCxpQkFBaUIsQ0FBQ0ksYUFBYSxDQUFDO01BQ3hDLE9BQU8rQyxPQUFPO0lBQ2YsQ0FBQztJQUVEeUosT0FBTyxFQUFFO01BQ1I4QixpQ0FBaUMsRUFBRSxDQUFDQyxNQUFXLEVBQUVsVixRQUFpQixLQUFLO1FBQ3RFLE1BQU1tVixRQUFRLEdBQUdELE1BQU0sQ0FBQ0UsTUFBTSxDQUM3QixDQUFDQyxVQUFlLEVBQUVDLEtBQVUsS0FDM0JDLEVBQUUsQ0FDREYsVUFBVSxFQUNWRyxXQUFXLENBQUMsVUFBVSxHQUFHRixLQUFLLENBQUN2WSxZQUFZLEdBQUcsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUN2RSxFQUNGMEMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUNmO1FBQ0QsT0FBT08sUUFBUSxHQUFHbVYsUUFBUSxHQUFHTSxHQUFHLENBQUNOLFFBQVEsQ0FBQztNQUMzQyxDQUFDO01BRUQvQiw4QkFBOEIsRUFBRSxDQUFDc0MsYUFBa0IsRUFBRVIsTUFBZSxLQUFLO1FBQ3hFLE1BQU1TLFdBQVcsR0FBR2plLGNBQWMsQ0FBQ3liLE9BQU8sQ0FBQzhCLGlDQUFpQyxDQUFDQyxNQUFNLEVBQUUsSUFBSSxDQUFDO1FBQzFGLE1BQU1DLFFBQVEsR0FBR1MsTUFBTSxDQUFDRCxXQUFXLEVBQUVsVyxRQUFRLENBQUNpVyxhQUFhLENBQUN2UyxlQUFlLENBQUMsRUFBRTFELFFBQVEsQ0FBQ2lXLGFBQWEsQ0FBQ25TLFlBQVksQ0FBQyxDQUFDO1FBQ25ILE9BQU9zUyxpQkFBaUIsQ0FBQ1YsUUFBUSxDQUFDO01BQ25DLENBQUM7TUFFREgsd0JBQXdCLEVBQUUsQ0FBQ0UsTUFBVyxFQUFFbFYsUUFBaUIsS0FBSztRQUM3RCxPQUFPNlYsaUJBQWlCLENBQUNuZSxjQUFjLENBQUN5YixPQUFPLENBQUM4QixpQ0FBaUMsQ0FBQ0MsTUFBTSxFQUFFbFYsUUFBUSxDQUFDLENBQUM7TUFDckc7SUFDRDtFQUNELENBQUM7RUFBQyxPQUVhdEksY0FBYztBQUFBIn0=