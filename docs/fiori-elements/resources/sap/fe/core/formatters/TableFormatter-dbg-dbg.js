/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/formatters/TableFormatterTypes", "sap/fe/macros/DelegateUtil", "sap/fe/macros/table/TableSizeHelper", "sap/ui/mdc/enum/EditMode", "../CommonUtils"], function (TableFormatterTypes, DelegateUtil, TableSizeHelper, EditMode, CommonUtils) {
  "use strict";

  var MessageType = TableFormatterTypes.MessageType;
  const getMessagetypeOrder = function (messageType) {
    switch (messageType) {
      case "Error":
        return 4;
      case "Warning":
        return 3;
      case "Information":
        return 2;
      case "None":
        return 1;
      default:
        return -1;
    }
  };

  /**
   * Gets the validity of creation row fields.
   *
   * @function
   * @name validateCreationRowFields
   * @param fieldValidityObject Object holding the fields
   * @returns `true` if all the fields in the creation row are valid, `false` otherwise
   */
  const validateCreationRowFields = function (fieldValidityObject) {
    if (!fieldValidityObject) {
      return false;
    }
    const fieldKeys = Object.keys(fieldValidityObject);
    return fieldKeys.length > 0 && fieldKeys.every(function (key) {
      return fieldValidityObject[key]["validity"];
    });
  };
  validateCreationRowFields.__functionName = "sap.fe.core.formatters.TableFormatter#validateCreationRowFields";

  /**
   * @param this The object status control.
   * @param semanticKeyHasDraftIndicator The property name of the draft indicator.
   * @param aFilteredMessages Array of messages.
   * @param columnName
   * @param isSemanticKeyInFieldGroup Flag which says if semantic key is a part of field group.
   * @returns The value for the visibility property of the object status
   */
  const getErrorStatusTextVisibilityFormatter = function (semanticKeyHasDraftIndicator, aFilteredMessages, columnName, isSemanticKeyInFieldGroup) {
    let bStatusVisibility = false;
    if (aFilteredMessages && aFilteredMessages.length > 0 && (isSemanticKeyInFieldGroup || columnName === semanticKeyHasDraftIndicator)) {
      const sCurrentContextPath = this.getBindingContext() ? this.getBindingContext().getPath() : undefined;
      aFilteredMessages.forEach(oMessage => {
        if (oMessage.type === "Error" && oMessage.aTargets[0].indexOf(sCurrentContextPath) === 0) {
          bStatusVisibility = true;
          return bStatusVisibility;
        }
      });
    }
    return bStatusVisibility;
  };
  getErrorStatusTextVisibilityFormatter.__functionName = "sap.fe.core.formatters.TableFormatter#getErrorStatusTextVisibilityFormatter";

  /**
   * rowHighlighting
   *
   * @param {object} this The context
   * @param {string|number} CriticalityValue The criticality value
   * @param {number} messageLastUpdate Timestamp of the last message that was created. It's defined as an input value, but not used in the body of the function
   * It is used to refresh the formatting of the table each time a new message is updated
   * @returns {object} The value from the inner function
   */

  const rowHighlighting = function (criticalityValue, aFilteredMessages, hasActiveEntity, isActiveEntity, isDraftMode) {
    var _this$getBindingConte2;
    let iHighestCriticalityValue = -1;
    if (aFilteredMessages && aFilteredMessages.length > 0) {
      var _this$getBindingConte;
      const sCurrentContextPath = (_this$getBindingConte = this.getBindingContext()) === null || _this$getBindingConte === void 0 ? void 0 : _this$getBindingConte.getPath();
      aFilteredMessages.forEach(oMessage => {
        if (oMessage.aTargets[0].indexOf(sCurrentContextPath) === 0 && iHighestCriticalityValue < getMessagetypeOrder(oMessage.type)) {
          iHighestCriticalityValue = getMessagetypeOrder(oMessage.type);
          criticalityValue = oMessage.type;
        }
      });
    }
    if (typeof criticalityValue !== "string") {
      switch (criticalityValue) {
        case 1:
          criticalityValue = MessageType.Error;
          break;
        case 2:
          criticalityValue = MessageType.Warning;
          break;
        case 3:
          criticalityValue = MessageType.Success;
          break;
        case 5:
          criticalityValue = MessageType.Information;
          break;
        default:
          criticalityValue = MessageType.None;
      }
    }

    // If we have calculated a criticality <> None, return it
    if (criticalityValue !== MessageType.None) {
      return criticalityValue;
    }

    // If not, we set criticality to 'Information' for newly created rows in Draft mode, and keep 'None' otherwise
    const isInactive = ((_this$getBindingConte2 = this.getBindingContext()) === null || _this$getBindingConte2 === void 0 ? void 0 : _this$getBindingConte2.isInactive()) ?? false;
    const isNewObject = !hasActiveEntity && !isActiveEntity && !isInactive;
    return isDraftMode === "true" && isNewObject ? MessageType.Information : MessageType.None;
  };
  rowHighlighting.__functionName = "sap.fe.core.formatters.TableFormatter#rowHighlighting";
  const navigatedRow = function (sDeepestPath) {
    var _this$getBindingConte3;
    const sPath = (_this$getBindingConte3 = this.getBindingContext()) === null || _this$getBindingConte3 === void 0 ? void 0 : _this$getBindingConte3.getPath();
    if (sPath && sDeepestPath) {
      return sDeepestPath.indexOf(sPath) === 0;
    } else {
      return false;
    }
  };
  navigatedRow.__functionName = "sap.fe.core.formatters.TableFormatter#navigatedRow";

  /**
   * Method to calculate the width of an MDCColumn based on the property definition.
   *
   * @function
   * @name getColumnWidth
   * @param this The MDCColumn object
   * @param editMode The EditMode of the table
   * @param isPropertiesCacheAvailable Indicates if the properties cache is available
   * @param propertyName The name of the property we want to calculate le width
   * @param useRemUnit Indicates if the rem unit must be concatenated with the column width result
   * @returns The width of the column
   * @private
   */
  const getColumnWidth = function (editMode, isPropertiesCacheAvailable, propertyName) {
    let useRemUnit = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    if (!isPropertiesCacheAvailable) {
      return null;
    }
    const table = this.getParent();
    const properties = DelegateUtil.getCachedProperties(table);
    const property = properties === null || properties === void 0 ? void 0 : properties.find(prop => prop.name === propertyName);
    if (property) {
      let columnWidth = properties ? TableSizeHelper.getMDCColumnWidthFromProperty(property, properties, true) : null;
      if (columnWidth && editMode === EditMode.Editable) {
        var _property$typeConfig;
        switch ((_property$typeConfig = property.typeConfig) === null || _property$typeConfig === void 0 ? void 0 : _property$typeConfig.baseType) {
          case "Date":
          case "Time":
          case "DateTime":
            columnWidth += 2.8;
            break;
          default:
        }
      }
      if (useRemUnit) {
        return columnWidth + "rem";
      }
      return columnWidth;
    }
    return null;
  };
  getColumnWidth.__functionName = "sap.fe.core.formatters.TableFormatter#getColumnWidth";

  /**
   * Method to calculate the width of an MDCColumn for valueHelp the table.
   *
   * @function
   * @name getColumnWidthForValueHelpTable
   * @param this The MDCColumn object
   * @param isPropertiesCacheAvailable Indicates if the properties cache is available
   * @param propertyName The name of the property we want to calculate le width
   * @param isTargetSmallDevice Indicates the current device has a small device
   * @returns The width of the column
   * @private
   */
  const getColumnWidthForValueHelpTable = function (isPropertiesCacheAvailable, propertyName, isTargetSmallDevice) {
    const isSmallDevice = CommonUtils.isSmallDevice();
    const withUnit = !isSmallDevice;
    return isSmallDevice && isTargetSmallDevice || !isSmallDevice && !isTargetSmallDevice ? tableFormatter.getColumnWidth.call(this, EditMode.Display, isPropertiesCacheAvailable, propertyName, withUnit) : null;
  };
  getColumnWidthForValueHelpTable.__functionName = "sap.fe.core.formatters.TableFormatter#getColumnWidthForValueHelpTable";
  function isRatingIndicator(oControl) {
    if (oControl.isA("sap.fe.macros.controls.FieldWrapper")) {
      const vContentDisplay = Array.isArray(oControl.getContentDisplay()) ? oControl.getContentDisplay()[0] : oControl.getContentDisplay();
      if (vContentDisplay && vContentDisplay.isA("sap.m.RatingIndicator")) {
        return true;
      }
    }
    return false;
  }
  function _updateStyleClassForRatingIndicator(oFieldWrapper, bLast) {
    const vContentDisplay = Array.isArray(oFieldWrapper.getContentDisplay()) ? oFieldWrapper.getContentDisplay()[0] : oFieldWrapper.getContentDisplay();
    const vContentEdit = Array.isArray(oFieldWrapper.getContentEdit()) ? oFieldWrapper.getContentEdit()[0] : oFieldWrapper.getContentEdit();
    if (bLast) {
      vContentDisplay.addStyleClass("sapUiNoMarginBottom");
      vContentDisplay.addStyleClass("sapUiNoMarginTop");
      vContentEdit.removeStyleClass("sapUiTinyMarginBottom");
    } else {
      vContentDisplay.addStyleClass("sapUiNoMarginBottom");
      vContentDisplay.removeStyleClass("sapUiNoMarginTop");
      vContentEdit.addStyleClass("sapUiTinyMarginBottom");
    }
  }
  function getVBoxVisibility() {
    const aItems = this.getItems();
    let bLastElementFound = false;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    for (let index = aItems.length - 1; index >= 0; index--) {
      if (!bLastElementFound) {
        if (args[index] !== true) {
          bLastElementFound = true;
          if (isRatingIndicator(aItems[index])) {
            _updateStyleClassForRatingIndicator(aItems[index], true);
          } else {
            aItems[index].removeStyleClass("sapUiTinyMarginBottom");
          }
        }
      } else if (isRatingIndicator(aItems[index])) {
        _updateStyleClassForRatingIndicator(aItems[index], false);
      } else {
        aItems[index].addStyleClass("sapUiTinyMarginBottom");
      }
    }
    return true;
  }
  getVBoxVisibility.__functionName = "sap.fe.core.formatters.TableFormatter#getVBoxVisibility";

  // See https://www.typescriptlang.org/docs/handbook/functions.html#this-parameters for more detail on this weird syntax
  /**
   * Collection of table formatters.
   *
   * @param this The context
   * @param sName The inner function name
   * @param oArgs The inner function parameters
   * @returns The value from the inner function
   */
  const tableFormatter = function (sName) {
    if (tableFormatter.hasOwnProperty(sName)) {
      for (var _len2 = arguments.length, oArgs = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        oArgs[_key2 - 1] = arguments[_key2];
      }
      return tableFormatter[sName].apply(this, oArgs);
    } else {
      return "";
    }
  };
  tableFormatter.validateCreationRowFields = validateCreationRowFields;
  tableFormatter.rowHighlighting = rowHighlighting;
  tableFormatter.navigatedRow = navigatedRow;
  tableFormatter.getErrorStatusTextVisibilityFormatter = getErrorStatusTextVisibilityFormatter;
  tableFormatter.getVBoxVisibility = getVBoxVisibility;
  tableFormatter.isRatingIndicator = isRatingIndicator; // for unit tests
  tableFormatter.getColumnWidth = getColumnWidth;
  tableFormatter.getColumnWidthForValueHelpTable = getColumnWidthForValueHelpTable;

  /**
   * @global
   */
  return tableFormatter;
}, true);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRNZXNzYWdldHlwZU9yZGVyIiwibWVzc2FnZVR5cGUiLCJ2YWxpZGF0ZUNyZWF0aW9uUm93RmllbGRzIiwiZmllbGRWYWxpZGl0eU9iamVjdCIsImZpZWxkS2V5cyIsIk9iamVjdCIsImtleXMiLCJsZW5ndGgiLCJldmVyeSIsImtleSIsIl9fZnVuY3Rpb25OYW1lIiwiZ2V0RXJyb3JTdGF0dXNUZXh0VmlzaWJpbGl0eUZvcm1hdHRlciIsInNlbWFudGljS2V5SGFzRHJhZnRJbmRpY2F0b3IiLCJhRmlsdGVyZWRNZXNzYWdlcyIsImNvbHVtbk5hbWUiLCJpc1NlbWFudGljS2V5SW5GaWVsZEdyb3VwIiwiYlN0YXR1c1Zpc2liaWxpdHkiLCJzQ3VycmVudENvbnRleHRQYXRoIiwiZ2V0QmluZGluZ0NvbnRleHQiLCJnZXRQYXRoIiwidW5kZWZpbmVkIiwiZm9yRWFjaCIsIm9NZXNzYWdlIiwidHlwZSIsImFUYXJnZXRzIiwiaW5kZXhPZiIsInJvd0hpZ2hsaWdodGluZyIsImNyaXRpY2FsaXR5VmFsdWUiLCJoYXNBY3RpdmVFbnRpdHkiLCJpc0FjdGl2ZUVudGl0eSIsImlzRHJhZnRNb2RlIiwiaUhpZ2hlc3RDcml0aWNhbGl0eVZhbHVlIiwiTWVzc2FnZVR5cGUiLCJFcnJvciIsIldhcm5pbmciLCJTdWNjZXNzIiwiSW5mb3JtYXRpb24iLCJOb25lIiwiaXNJbmFjdGl2ZSIsImlzTmV3T2JqZWN0IiwibmF2aWdhdGVkUm93Iiwic0RlZXBlc3RQYXRoIiwic1BhdGgiLCJnZXRDb2x1bW5XaWR0aCIsImVkaXRNb2RlIiwiaXNQcm9wZXJ0aWVzQ2FjaGVBdmFpbGFibGUiLCJwcm9wZXJ0eU5hbWUiLCJ1c2VSZW1Vbml0IiwidGFibGUiLCJnZXRQYXJlbnQiLCJwcm9wZXJ0aWVzIiwiRGVsZWdhdGVVdGlsIiwiZ2V0Q2FjaGVkUHJvcGVydGllcyIsInByb3BlcnR5IiwiZmluZCIsInByb3AiLCJuYW1lIiwiY29sdW1uV2lkdGgiLCJUYWJsZVNpemVIZWxwZXIiLCJnZXRNRENDb2x1bW5XaWR0aEZyb21Qcm9wZXJ0eSIsIkVkaXRNb2RlIiwiRWRpdGFibGUiLCJ0eXBlQ29uZmlnIiwiYmFzZVR5cGUiLCJnZXRDb2x1bW5XaWR0aEZvclZhbHVlSGVscFRhYmxlIiwiaXNUYXJnZXRTbWFsbERldmljZSIsImlzU21hbGxEZXZpY2UiLCJDb21tb25VdGlscyIsIndpdGhVbml0IiwidGFibGVGb3JtYXR0ZXIiLCJjYWxsIiwiRGlzcGxheSIsImlzUmF0aW5nSW5kaWNhdG9yIiwib0NvbnRyb2wiLCJpc0EiLCJ2Q29udGVudERpc3BsYXkiLCJBcnJheSIsImlzQXJyYXkiLCJnZXRDb250ZW50RGlzcGxheSIsIl91cGRhdGVTdHlsZUNsYXNzRm9yUmF0aW5nSW5kaWNhdG9yIiwib0ZpZWxkV3JhcHBlciIsImJMYXN0IiwidkNvbnRlbnRFZGl0IiwiZ2V0Q29udGVudEVkaXQiLCJhZGRTdHlsZUNsYXNzIiwicmVtb3ZlU3R5bGVDbGFzcyIsImdldFZCb3hWaXNpYmlsaXR5IiwiYUl0ZW1zIiwiZ2V0SXRlbXMiLCJiTGFzdEVsZW1lbnRGb3VuZCIsImFyZ3MiLCJpbmRleCIsInNOYW1lIiwiaGFzT3duUHJvcGVydHkiLCJvQXJncyIsImFwcGx5Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJUYWJsZUZvcm1hdHRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNZXNzYWdlVHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9mb3JtYXR0ZXJzL1RhYmxlRm9ybWF0dGVyVHlwZXNcIjtcbmltcG9ydCBEZWxlZ2F0ZVV0aWwgZnJvbSBcInNhcC9mZS9tYWNyb3MvRGVsZWdhdGVVdGlsXCI7XG5pbXBvcnQgVGFibGVTaXplSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL3RhYmxlL1RhYmxlU2l6ZUhlbHBlclwiO1xuaW1wb3J0IHR5cGUgVGFibGUgZnJvbSBcInNhcC9tL1RhYmxlXCI7XG5pbXBvcnQgdHlwZSBNYW5hZ2VkT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5pbXBvcnQgRWRpdE1vZGUgZnJvbSBcInNhcC91aS9tZGMvZW51bS9FZGl0TW9kZVwiO1xuaW1wb3J0IE1EQ1RhYmxlIGZyb20gXCJzYXAvdWkvbWRjL1RhYmxlXCI7XG5pbXBvcnQgQ29sdW1uIGZyb20gXCJzYXAvdWkvbWRjL3RhYmxlL0NvbHVtblwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwiLi4vQ29tbW9uVXRpbHNcIjtcblxuY29uc3QgZ2V0TWVzc2FnZXR5cGVPcmRlciA9IGZ1bmN0aW9uIChtZXNzYWdlVHlwZTogc3RyaW5nKTogbnVtYmVyIHtcblx0c3dpdGNoIChtZXNzYWdlVHlwZSkge1xuXHRcdGNhc2UgXCJFcnJvclwiOlxuXHRcdFx0cmV0dXJuIDQ7XG5cdFx0Y2FzZSBcIldhcm5pbmdcIjpcblx0XHRcdHJldHVybiAzO1xuXHRcdGNhc2UgXCJJbmZvcm1hdGlvblwiOlxuXHRcdFx0cmV0dXJuIDI7XG5cdFx0Y2FzZSBcIk5vbmVcIjpcblx0XHRcdHJldHVybiAxO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gLTE7XG5cdH1cbn07XG5cbi8qKlxuICogR2V0cyB0aGUgdmFsaWRpdHkgb2YgY3JlYXRpb24gcm93IGZpZWxkcy5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIHZhbGlkYXRlQ3JlYXRpb25Sb3dGaWVsZHNcbiAqIEBwYXJhbSBmaWVsZFZhbGlkaXR5T2JqZWN0IE9iamVjdCBob2xkaW5nIHRoZSBmaWVsZHNcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBhbGwgdGhlIGZpZWxkcyBpbiB0aGUgY3JlYXRpb24gcm93IGFyZSB2YWxpZCwgYGZhbHNlYCBvdGhlcndpc2VcbiAqL1xuY29uc3QgdmFsaWRhdGVDcmVhdGlvblJvd0ZpZWxkcyA9IGZ1bmN0aW9uIChmaWVsZFZhbGlkaXR5T2JqZWN0PzogYW55KSB7XG5cdGlmICghZmllbGRWYWxpZGl0eU9iamVjdCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRjb25zdCBmaWVsZEtleXMgPSBPYmplY3Qua2V5cyhmaWVsZFZhbGlkaXR5T2JqZWN0KTtcblx0cmV0dXJuIChcblx0XHRmaWVsZEtleXMubGVuZ3RoID4gMCAmJlxuXHRcdGZpZWxkS2V5cy5ldmVyeShmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRyZXR1cm4gZmllbGRWYWxpZGl0eU9iamVjdFtrZXldW1widmFsaWRpdHlcIl07XG5cdFx0fSlcblx0KTtcbn07XG52YWxpZGF0ZUNyZWF0aW9uUm93RmllbGRzLl9fZnVuY3Rpb25OYW1lID0gXCJzYXAuZmUuY29yZS5mb3JtYXR0ZXJzLlRhYmxlRm9ybWF0dGVyI3ZhbGlkYXRlQ3JlYXRpb25Sb3dGaWVsZHNcIjtcblxuLyoqXG4gKiBAcGFyYW0gdGhpcyBUaGUgb2JqZWN0IHN0YXR1cyBjb250cm9sLlxuICogQHBhcmFtIHNlbWFudGljS2V5SGFzRHJhZnRJbmRpY2F0b3IgVGhlIHByb3BlcnR5IG5hbWUgb2YgdGhlIGRyYWZ0IGluZGljYXRvci5cbiAqIEBwYXJhbSBhRmlsdGVyZWRNZXNzYWdlcyBBcnJheSBvZiBtZXNzYWdlcy5cbiAqIEBwYXJhbSBjb2x1bW5OYW1lXG4gKiBAcGFyYW0gaXNTZW1hbnRpY0tleUluRmllbGRHcm91cCBGbGFnIHdoaWNoIHNheXMgaWYgc2VtYW50aWMga2V5IGlzIGEgcGFydCBvZiBmaWVsZCBncm91cC5cbiAqIEByZXR1cm5zIFRoZSB2YWx1ZSBmb3IgdGhlIHZpc2liaWxpdHkgcHJvcGVydHkgb2YgdGhlIG9iamVjdCBzdGF0dXNcbiAqL1xuY29uc3QgZ2V0RXJyb3JTdGF0dXNUZXh0VmlzaWJpbGl0eUZvcm1hdHRlciA9IGZ1bmN0aW9uIChcblx0dGhpczogTWFuYWdlZE9iamVjdCB8IGFueSxcblx0c2VtYW50aWNLZXlIYXNEcmFmdEluZGljYXRvcjogc3RyaW5nLFxuXHRhRmlsdGVyZWRNZXNzYWdlczogYW55LFxuXHRjb2x1bW5OYW1lOiBzdHJpbmcsXG5cdGlzU2VtYW50aWNLZXlJbkZpZWxkR3JvdXA/OiBCb29sZWFuXG4pIHtcblx0bGV0IGJTdGF0dXNWaXNpYmlsaXR5ID0gZmFsc2U7XG5cdGlmIChhRmlsdGVyZWRNZXNzYWdlcyAmJiBhRmlsdGVyZWRNZXNzYWdlcy5sZW5ndGggPiAwICYmIChpc1NlbWFudGljS2V5SW5GaWVsZEdyb3VwIHx8IGNvbHVtbk5hbWUgPT09IHNlbWFudGljS2V5SGFzRHJhZnRJbmRpY2F0b3IpKSB7XG5cdFx0Y29uc3Qgc0N1cnJlbnRDb250ZXh0UGF0aCA9IHRoaXMuZ2V0QmluZGluZ0NvbnRleHQoKSA/IHRoaXMuZ2V0QmluZGluZ0NvbnRleHQoKS5nZXRQYXRoKCkgOiB1bmRlZmluZWQ7XG5cdFx0YUZpbHRlcmVkTWVzc2FnZXMuZm9yRWFjaCgob01lc3NhZ2U6IGFueSkgPT4ge1xuXHRcdFx0aWYgKG9NZXNzYWdlLnR5cGUgPT09IFwiRXJyb3JcIiAmJiBvTWVzc2FnZS5hVGFyZ2V0c1swXS5pbmRleE9mKHNDdXJyZW50Q29udGV4dFBhdGgpID09PSAwKSB7XG5cdFx0XHRcdGJTdGF0dXNWaXNpYmlsaXR5ID0gdHJ1ZTtcblx0XHRcdFx0cmV0dXJuIGJTdGF0dXNWaXNpYmlsaXR5O1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBiU3RhdHVzVmlzaWJpbGl0eTtcbn07XG5nZXRFcnJvclN0YXR1c1RleHRWaXNpYmlsaXR5Rm9ybWF0dGVyLl9fZnVuY3Rpb25OYW1lID0gXCJzYXAuZmUuY29yZS5mb3JtYXR0ZXJzLlRhYmxlRm9ybWF0dGVyI2dldEVycm9yU3RhdHVzVGV4dFZpc2liaWxpdHlGb3JtYXR0ZXJcIjtcblxuLyoqXG4gKiByb3dIaWdobGlnaHRpbmdcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gdGhpcyBUaGUgY29udGV4dFxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBDcml0aWNhbGl0eVZhbHVlIFRoZSBjcml0aWNhbGl0eSB2YWx1ZVxuICogQHBhcmFtIHtudW1iZXJ9IG1lc3NhZ2VMYXN0VXBkYXRlIFRpbWVzdGFtcCBvZiB0aGUgbGFzdCBtZXNzYWdlIHRoYXQgd2FzIGNyZWF0ZWQuIEl0J3MgZGVmaW5lZCBhcyBhbiBpbnB1dCB2YWx1ZSwgYnV0IG5vdCB1c2VkIGluIHRoZSBib2R5IG9mIHRoZSBmdW5jdGlvblxuICogSXQgaXMgdXNlZCB0byByZWZyZXNoIHRoZSBmb3JtYXR0aW5nIG9mIHRoZSB0YWJsZSBlYWNoIHRpbWUgYSBuZXcgbWVzc2FnZSBpcyB1cGRhdGVkXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBUaGUgdmFsdWUgZnJvbSB0aGUgaW5uZXIgZnVuY3Rpb25cbiAqL1xuXG5jb25zdCByb3dIaWdobGlnaHRpbmcgPSBmdW5jdGlvbiAoXG5cdHRoaXM6IE1hbmFnZWRPYmplY3QsXG5cdGNyaXRpY2FsaXR5VmFsdWU6IHN0cmluZyB8IG51bWJlcixcblx0YUZpbHRlcmVkTWVzc2FnZXM6IGFueVtdLFxuXHRoYXNBY3RpdmVFbnRpdHk6IGJvb2xlYW4sXG5cdGlzQWN0aXZlRW50aXR5OiBib29sZWFuLFxuXHRpc0RyYWZ0TW9kZTogc3RyaW5nLFxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdC4uLmFyZ3M6IGFueVtdXG4pOiBNZXNzYWdlVHlwZSB7XG5cdGxldCBpSGlnaGVzdENyaXRpY2FsaXR5VmFsdWU6IG51bWJlciA9IC0xO1xuXHRpZiAoYUZpbHRlcmVkTWVzc2FnZXMgJiYgYUZpbHRlcmVkTWVzc2FnZXMubGVuZ3RoID4gMCkge1xuXHRcdGNvbnN0IHNDdXJyZW50Q29udGV4dFBhdGggPSB0aGlzLmdldEJpbmRpbmdDb250ZXh0KCk/LmdldFBhdGgoKTtcblx0XHRhRmlsdGVyZWRNZXNzYWdlcy5mb3JFYWNoKChvTWVzc2FnZTogYW55KSA9PiB7XG5cdFx0XHRpZiAob01lc3NhZ2UuYVRhcmdldHNbMF0uaW5kZXhPZihzQ3VycmVudENvbnRleHRQYXRoKSA9PT0gMCAmJiBpSGlnaGVzdENyaXRpY2FsaXR5VmFsdWUgPCBnZXRNZXNzYWdldHlwZU9yZGVyKG9NZXNzYWdlLnR5cGUpKSB7XG5cdFx0XHRcdGlIaWdoZXN0Q3JpdGljYWxpdHlWYWx1ZSA9IGdldE1lc3NhZ2V0eXBlT3JkZXIob01lc3NhZ2UudHlwZSk7XG5cdFx0XHRcdGNyaXRpY2FsaXR5VmFsdWUgPSBvTWVzc2FnZS50eXBlO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdGlmICh0eXBlb2YgY3JpdGljYWxpdHlWYWx1ZSAhPT0gXCJzdHJpbmdcIikge1xuXHRcdHN3aXRjaCAoY3JpdGljYWxpdHlWYWx1ZSkge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRjcml0aWNhbGl0eVZhbHVlID0gTWVzc2FnZVR5cGUuRXJyb3I7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRjcml0aWNhbGl0eVZhbHVlID0gTWVzc2FnZVR5cGUuV2FybmluZztcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDM6XG5cdFx0XHRcdGNyaXRpY2FsaXR5VmFsdWUgPSBNZXNzYWdlVHlwZS5TdWNjZXNzO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgNTpcblx0XHRcdFx0Y3JpdGljYWxpdHlWYWx1ZSA9IE1lc3NhZ2VUeXBlLkluZm9ybWF0aW9uO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGNyaXRpY2FsaXR5VmFsdWUgPSBNZXNzYWdlVHlwZS5Ob25lO1xuXHRcdH1cblx0fVxuXG5cdC8vIElmIHdlIGhhdmUgY2FsY3VsYXRlZCBhIGNyaXRpY2FsaXR5IDw+IE5vbmUsIHJldHVybiBpdFxuXHRpZiAoY3JpdGljYWxpdHlWYWx1ZSAhPT0gTWVzc2FnZVR5cGUuTm9uZSkge1xuXHRcdHJldHVybiBjcml0aWNhbGl0eVZhbHVlIGFzIE1lc3NhZ2VUeXBlO1xuXHR9XG5cblx0Ly8gSWYgbm90LCB3ZSBzZXQgY3JpdGljYWxpdHkgdG8gJ0luZm9ybWF0aW9uJyBmb3IgbmV3bHkgY3JlYXRlZCByb3dzIGluIERyYWZ0IG1vZGUsIGFuZCBrZWVwICdOb25lJyBvdGhlcndpc2Vcblx0Y29uc3QgaXNJbmFjdGl2ZSA9ICh0aGlzLmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dCk/LmlzSW5hY3RpdmUoKSA/PyBmYWxzZTtcblx0Y29uc3QgaXNOZXdPYmplY3QgPSAhaGFzQWN0aXZlRW50aXR5ICYmICFpc0FjdGl2ZUVudGl0eSAmJiAhaXNJbmFjdGl2ZTtcblx0cmV0dXJuIGlzRHJhZnRNb2RlID09PSBcInRydWVcIiAmJiBpc05ld09iamVjdCA/IE1lc3NhZ2VUeXBlLkluZm9ybWF0aW9uIDogTWVzc2FnZVR5cGUuTm9uZTtcbn07XG5yb3dIaWdobGlnaHRpbmcuX19mdW5jdGlvbk5hbWUgPSBcInNhcC5mZS5jb3JlLmZvcm1hdHRlcnMuVGFibGVGb3JtYXR0ZXIjcm93SGlnaGxpZ2h0aW5nXCI7XG5cbmNvbnN0IG5hdmlnYXRlZFJvdyA9IGZ1bmN0aW9uICh0aGlzOiBNYW5hZ2VkT2JqZWN0LCBzRGVlcGVzdFBhdGg6IHN0cmluZykge1xuXHRjb25zdCBzUGF0aCA9IHRoaXMuZ2V0QmluZGluZ0NvbnRleHQoKT8uZ2V0UGF0aCgpO1xuXHRpZiAoc1BhdGggJiYgc0RlZXBlc3RQYXRoKSB7XG5cdFx0cmV0dXJuIHNEZWVwZXN0UGF0aC5pbmRleE9mKHNQYXRoKSA9PT0gMDtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn07XG5uYXZpZ2F0ZWRSb3cuX19mdW5jdGlvbk5hbWUgPSBcInNhcC5mZS5jb3JlLmZvcm1hdHRlcnMuVGFibGVGb3JtYXR0ZXIjbmF2aWdhdGVkUm93XCI7XG5cbi8qKlxuICogTWV0aG9kIHRvIGNhbGN1bGF0ZSB0aGUgd2lkdGggb2YgYW4gTURDQ29sdW1uIGJhc2VkIG9uIHRoZSBwcm9wZXJ0eSBkZWZpbml0aW9uLlxuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgZ2V0Q29sdW1uV2lkdGhcbiAqIEBwYXJhbSB0aGlzIFRoZSBNRENDb2x1bW4gb2JqZWN0XG4gKiBAcGFyYW0gZWRpdE1vZGUgVGhlIEVkaXRNb2RlIG9mIHRoZSB0YWJsZVxuICogQHBhcmFtIGlzUHJvcGVydGllc0NhY2hlQXZhaWxhYmxlIEluZGljYXRlcyBpZiB0aGUgcHJvcGVydGllcyBjYWNoZSBpcyBhdmFpbGFibGVcbiAqIEBwYXJhbSBwcm9wZXJ0eU5hbWUgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHdlIHdhbnQgdG8gY2FsY3VsYXRlIGxlIHdpZHRoXG4gKiBAcGFyYW0gdXNlUmVtVW5pdCBJbmRpY2F0ZXMgaWYgdGhlIHJlbSB1bml0IG11c3QgYmUgY29uY2F0ZW5hdGVkIHdpdGggdGhlIGNvbHVtbiB3aWR0aCByZXN1bHRcbiAqIEByZXR1cm5zIFRoZSB3aWR0aCBvZiB0aGUgY29sdW1uXG4gKiBAcHJpdmF0ZVxuICovXG5jb25zdCBnZXRDb2x1bW5XaWR0aCA9IGZ1bmN0aW9uIChcblx0dGhpczogQ29sdW1uLFxuXHRlZGl0TW9kZTogRWRpdE1vZGUsXG5cdGlzUHJvcGVydGllc0NhY2hlQXZhaWxhYmxlOiBib29sZWFuLFxuXHRwcm9wZXJ0eU5hbWU6IHN0cmluZyxcblx0dXNlUmVtVW5pdCA9IHRydWVcbik6IHN0cmluZyB8IG51bGwgfCBudW1iZXIge1xuXHRpZiAoIWlzUHJvcGVydGllc0NhY2hlQXZhaWxhYmxlKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0Y29uc3QgdGFibGUgPSB0aGlzLmdldFBhcmVudCgpIGFzIE1EQ1RhYmxlO1xuXHRjb25zdCBwcm9wZXJ0aWVzID0gRGVsZWdhdGVVdGlsLmdldENhY2hlZFByb3BlcnRpZXModGFibGUpO1xuXHRjb25zdCBwcm9wZXJ0eSA9IHByb3BlcnRpZXM/LmZpbmQoKHByb3ApID0+IHByb3AubmFtZSA9PT0gcHJvcGVydHlOYW1lKTtcblx0aWYgKHByb3BlcnR5KSB7XG5cdFx0bGV0IGNvbHVtbldpZHRoID0gcHJvcGVydGllcyA/IFRhYmxlU2l6ZUhlbHBlci5nZXRNRENDb2x1bW5XaWR0aEZyb21Qcm9wZXJ0eShwcm9wZXJ0eSwgcHJvcGVydGllcywgdHJ1ZSkgOiBudWxsO1xuXHRcdGlmIChjb2x1bW5XaWR0aCAmJiBlZGl0TW9kZSA9PT0gRWRpdE1vZGUuRWRpdGFibGUpIHtcblx0XHRcdHN3aXRjaCAocHJvcGVydHkudHlwZUNvbmZpZz8uYmFzZVR5cGUpIHtcblx0XHRcdFx0Y2FzZSBcIkRhdGVcIjpcblx0XHRcdFx0Y2FzZSBcIlRpbWVcIjpcblx0XHRcdFx0Y2FzZSBcIkRhdGVUaW1lXCI6XG5cdFx0XHRcdFx0Y29sdW1uV2lkdGggKz0gMi44O1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAodXNlUmVtVW5pdCkge1xuXHRcdFx0cmV0dXJuIGNvbHVtbldpZHRoICsgXCJyZW1cIjtcblx0XHR9XG5cdFx0cmV0dXJuIGNvbHVtbldpZHRoO1xuXHR9XG5cblx0cmV0dXJuIG51bGw7XG59O1xuZ2V0Q29sdW1uV2lkdGguX19mdW5jdGlvbk5hbWUgPSBcInNhcC5mZS5jb3JlLmZvcm1hdHRlcnMuVGFibGVGb3JtYXR0ZXIjZ2V0Q29sdW1uV2lkdGhcIjtcblxuLyoqXG4gKiBNZXRob2QgdG8gY2FsY3VsYXRlIHRoZSB3aWR0aCBvZiBhbiBNRENDb2x1bW4gZm9yIHZhbHVlSGVscCB0aGUgdGFibGUuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBnZXRDb2x1bW5XaWR0aEZvclZhbHVlSGVscFRhYmxlXG4gKiBAcGFyYW0gdGhpcyBUaGUgTURDQ29sdW1uIG9iamVjdFxuICogQHBhcmFtIGlzUHJvcGVydGllc0NhY2hlQXZhaWxhYmxlIEluZGljYXRlcyBpZiB0aGUgcHJvcGVydGllcyBjYWNoZSBpcyBhdmFpbGFibGVcbiAqIEBwYXJhbSBwcm9wZXJ0eU5hbWUgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHdlIHdhbnQgdG8gY2FsY3VsYXRlIGxlIHdpZHRoXG4gKiBAcGFyYW0gaXNUYXJnZXRTbWFsbERldmljZSBJbmRpY2F0ZXMgdGhlIGN1cnJlbnQgZGV2aWNlIGhhcyBhIHNtYWxsIGRldmljZVxuICogQHJldHVybnMgVGhlIHdpZHRoIG9mIHRoZSBjb2x1bW5cbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IGdldENvbHVtbldpZHRoRm9yVmFsdWVIZWxwVGFibGUgPSBmdW5jdGlvbiAoXG5cdHRoaXM6IENvbHVtbixcblx0aXNQcm9wZXJ0aWVzQ2FjaGVBdmFpbGFibGU6IGJvb2xlYW4sXG5cdHByb3BlcnR5TmFtZTogc3RyaW5nLFxuXHRpc1RhcmdldFNtYWxsRGV2aWNlOiBib29sZWFuXG4pOiBudWxsIHwgbnVtYmVyIHtcblx0Y29uc3QgaXNTbWFsbERldmljZSA9IENvbW1vblV0aWxzLmlzU21hbGxEZXZpY2UoKTtcblx0Y29uc3Qgd2l0aFVuaXQgPSAhaXNTbWFsbERldmljZTtcblxuXHRyZXR1cm4gKGlzU21hbGxEZXZpY2UgJiYgaXNUYXJnZXRTbWFsbERldmljZSkgfHwgKCFpc1NtYWxsRGV2aWNlICYmICFpc1RhcmdldFNtYWxsRGV2aWNlKVxuXHRcdD8gKHRhYmxlRm9ybWF0dGVyLmdldENvbHVtbldpZHRoLmNhbGwodGhpcywgRWRpdE1vZGUuRGlzcGxheSwgaXNQcm9wZXJ0aWVzQ2FjaGVBdmFpbGFibGUsIHByb3BlcnR5TmFtZSwgd2l0aFVuaXQpIGFzIG51bGwgfCBudW1iZXIpXG5cdFx0OiBudWxsO1xufTtcbmdldENvbHVtbldpZHRoRm9yVmFsdWVIZWxwVGFibGUuX19mdW5jdGlvbk5hbWUgPSBcInNhcC5mZS5jb3JlLmZvcm1hdHRlcnMuVGFibGVGb3JtYXR0ZXIjZ2V0Q29sdW1uV2lkdGhGb3JWYWx1ZUhlbHBUYWJsZVwiO1xuXG5mdW5jdGlvbiBpc1JhdGluZ0luZGljYXRvcihvQ29udHJvbDogYW55KTogYm9vbGVhbiB7XG5cdGlmIChvQ29udHJvbC5pc0EoXCJzYXAuZmUubWFjcm9zLmNvbnRyb2xzLkZpZWxkV3JhcHBlclwiKSkge1xuXHRcdGNvbnN0IHZDb250ZW50RGlzcGxheSA9IEFycmF5LmlzQXJyYXkob0NvbnRyb2wuZ2V0Q29udGVudERpc3BsYXkoKSlcblx0XHRcdD8gb0NvbnRyb2wuZ2V0Q29udGVudERpc3BsYXkoKVswXVxuXHRcdFx0OiBvQ29udHJvbC5nZXRDb250ZW50RGlzcGxheSgpO1xuXHRcdGlmICh2Q29udGVudERpc3BsYXkgJiYgdkNvbnRlbnREaXNwbGF5LmlzQShcInNhcC5tLlJhdGluZ0luZGljYXRvclwiKSkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBmYWxzZTtcbn1cbmZ1bmN0aW9uIF91cGRhdGVTdHlsZUNsYXNzRm9yUmF0aW5nSW5kaWNhdG9yKG9GaWVsZFdyYXBwZXI6IGFueSwgYkxhc3Q6IGJvb2xlYW4pIHtcblx0Y29uc3QgdkNvbnRlbnREaXNwbGF5ID0gQXJyYXkuaXNBcnJheShvRmllbGRXcmFwcGVyLmdldENvbnRlbnREaXNwbGF5KCkpXG5cdFx0PyBvRmllbGRXcmFwcGVyLmdldENvbnRlbnREaXNwbGF5KClbMF1cblx0XHQ6IG9GaWVsZFdyYXBwZXIuZ2V0Q29udGVudERpc3BsYXkoKTtcblx0Y29uc3QgdkNvbnRlbnRFZGl0ID0gQXJyYXkuaXNBcnJheShvRmllbGRXcmFwcGVyLmdldENvbnRlbnRFZGl0KCkpID8gb0ZpZWxkV3JhcHBlci5nZXRDb250ZW50RWRpdCgpWzBdIDogb0ZpZWxkV3JhcHBlci5nZXRDb250ZW50RWRpdCgpO1xuXG5cdGlmIChiTGFzdCkge1xuXHRcdHZDb250ZW50RGlzcGxheS5hZGRTdHlsZUNsYXNzKFwic2FwVWlOb01hcmdpbkJvdHRvbVwiKTtcblx0XHR2Q29udGVudERpc3BsYXkuYWRkU3R5bGVDbGFzcyhcInNhcFVpTm9NYXJnaW5Ub3BcIik7XG5cdFx0dkNvbnRlbnRFZGl0LnJlbW92ZVN0eWxlQ2xhc3MoXCJzYXBVaVRpbnlNYXJnaW5Cb3R0b21cIik7XG5cdH0gZWxzZSB7XG5cdFx0dkNvbnRlbnREaXNwbGF5LmFkZFN0eWxlQ2xhc3MoXCJzYXBVaU5vTWFyZ2luQm90dG9tXCIpO1xuXHRcdHZDb250ZW50RGlzcGxheS5yZW1vdmVTdHlsZUNsYXNzKFwic2FwVWlOb01hcmdpblRvcFwiKTtcblx0XHR2Q29udGVudEVkaXQuYWRkU3R5bGVDbGFzcyhcInNhcFVpVGlueU1hcmdpbkJvdHRvbVwiKTtcblx0fVxufVxuZnVuY3Rpb24gZ2V0VkJveFZpc2liaWxpdHkodGhpczogVGFibGUsIC4uLmFyZ3M6IGFueVtdKSB7XG5cdGNvbnN0IGFJdGVtcyA9IHRoaXMuZ2V0SXRlbXMoKTtcblx0bGV0IGJMYXN0RWxlbWVudEZvdW5kID0gZmFsc2U7XG5cdGZvciAobGV0IGluZGV4ID0gYUl0ZW1zLmxlbmd0aCAtIDE7IGluZGV4ID49IDA7IGluZGV4LS0pIHtcblx0XHRpZiAoIWJMYXN0RWxlbWVudEZvdW5kKSB7XG5cdFx0XHRpZiAoYXJnc1tpbmRleF0gIT09IHRydWUpIHtcblx0XHRcdFx0Ykxhc3RFbGVtZW50Rm91bmQgPSB0cnVlO1xuXHRcdFx0XHRpZiAoaXNSYXRpbmdJbmRpY2F0b3IoYUl0ZW1zW2luZGV4XSkpIHtcblx0XHRcdFx0XHRfdXBkYXRlU3R5bGVDbGFzc0ZvclJhdGluZ0luZGljYXRvcihhSXRlbXNbaW5kZXhdLCB0cnVlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRhSXRlbXNbaW5kZXhdLnJlbW92ZVN0eWxlQ2xhc3MoXCJzYXBVaVRpbnlNYXJnaW5Cb3R0b21cIik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKGlzUmF0aW5nSW5kaWNhdG9yKGFJdGVtc1tpbmRleF0pKSB7XG5cdFx0XHRfdXBkYXRlU3R5bGVDbGFzc0ZvclJhdGluZ0luZGljYXRvcihhSXRlbXNbaW5kZXhdLCBmYWxzZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFJdGVtc1tpbmRleF0uYWRkU3R5bGVDbGFzcyhcInNhcFVpVGlueU1hcmdpbkJvdHRvbVwiKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHRydWU7XG59XG5nZXRWQm94VmlzaWJpbGl0eS5fX2Z1bmN0aW9uTmFtZSA9IFwic2FwLmZlLmNvcmUuZm9ybWF0dGVycy5UYWJsZUZvcm1hdHRlciNnZXRWQm94VmlzaWJpbGl0eVwiO1xuXG4vLyBTZWUgaHR0cHM6Ly93d3cudHlwZXNjcmlwdGxhbmcub3JnL2RvY3MvaGFuZGJvb2svZnVuY3Rpb25zLmh0bWwjdGhpcy1wYXJhbWV0ZXJzIGZvciBtb3JlIGRldGFpbCBvbiB0aGlzIHdlaXJkIHN5bnRheFxuLyoqXG4gKiBDb2xsZWN0aW9uIG9mIHRhYmxlIGZvcm1hdHRlcnMuXG4gKlxuICogQHBhcmFtIHRoaXMgVGhlIGNvbnRleHRcbiAqIEBwYXJhbSBzTmFtZSBUaGUgaW5uZXIgZnVuY3Rpb24gbmFtZVxuICogQHBhcmFtIG9BcmdzIFRoZSBpbm5lciBmdW5jdGlvbiBwYXJhbWV0ZXJzXG4gKiBAcmV0dXJucyBUaGUgdmFsdWUgZnJvbSB0aGUgaW5uZXIgZnVuY3Rpb25cbiAqL1xuY29uc3QgdGFibGVGb3JtYXR0ZXIgPSBmdW5jdGlvbiAodGhpczogb2JqZWN0LCBzTmFtZTogc3RyaW5nLCAuLi5vQXJnczogYW55W10pOiBhbnkge1xuXHRpZiAodGFibGVGb3JtYXR0ZXIuaGFzT3duUHJvcGVydHkoc05hbWUpKSB7XG5cdFx0cmV0dXJuICh0YWJsZUZvcm1hdHRlciBhcyBhbnkpW3NOYW1lXS5hcHBseSh0aGlzLCBvQXJncyk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH1cbn07XG5cbnRhYmxlRm9ybWF0dGVyLnZhbGlkYXRlQ3JlYXRpb25Sb3dGaWVsZHMgPSB2YWxpZGF0ZUNyZWF0aW9uUm93RmllbGRzO1xudGFibGVGb3JtYXR0ZXIucm93SGlnaGxpZ2h0aW5nID0gcm93SGlnaGxpZ2h0aW5nO1xudGFibGVGb3JtYXR0ZXIubmF2aWdhdGVkUm93ID0gbmF2aWdhdGVkUm93O1xudGFibGVGb3JtYXR0ZXIuZ2V0RXJyb3JTdGF0dXNUZXh0VmlzaWJpbGl0eUZvcm1hdHRlciA9IGdldEVycm9yU3RhdHVzVGV4dFZpc2liaWxpdHlGb3JtYXR0ZXI7XG50YWJsZUZvcm1hdHRlci5nZXRWQm94VmlzaWJpbGl0eSA9IGdldFZCb3hWaXNpYmlsaXR5O1xudGFibGVGb3JtYXR0ZXIuaXNSYXRpbmdJbmRpY2F0b3IgPSBpc1JhdGluZ0luZGljYXRvcjsgLy8gZm9yIHVuaXQgdGVzdHNcbnRhYmxlRm9ybWF0dGVyLmdldENvbHVtbldpZHRoID0gZ2V0Q29sdW1uV2lkdGg7XG50YWJsZUZvcm1hdHRlci5nZXRDb2x1bW5XaWR0aEZvclZhbHVlSGVscFRhYmxlID0gZ2V0Q29sdW1uV2lkdGhGb3JWYWx1ZUhlbHBUYWJsZTtcblxuLyoqXG4gKiBAZ2xvYmFsXG4gKi9cbmV4cG9ydCBkZWZhdWx0IHRhYmxlRm9ybWF0dGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztFQVdBLE1BQU1BLG1CQUFtQixHQUFHLFVBQVVDLFdBQW1CLEVBQVU7SUFDbEUsUUFBUUEsV0FBVztNQUNsQixLQUFLLE9BQU87UUFDWCxPQUFPLENBQUM7TUFDVCxLQUFLLFNBQVM7UUFDYixPQUFPLENBQUM7TUFDVCxLQUFLLGFBQWE7UUFDakIsT0FBTyxDQUFDO01BQ1QsS0FBSyxNQUFNO1FBQ1YsT0FBTyxDQUFDO01BQ1Q7UUFDQyxPQUFPLENBQUMsQ0FBQztJQUFDO0VBRWIsQ0FBQzs7RUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsTUFBTUMseUJBQXlCLEdBQUcsVUFBVUMsbUJBQXlCLEVBQUU7SUFDdEUsSUFBSSxDQUFDQSxtQkFBbUIsRUFBRTtNQUN6QixPQUFPLEtBQUs7SUFDYjtJQUNBLE1BQU1DLFNBQVMsR0FBR0MsTUFBTSxDQUFDQyxJQUFJLENBQUNILG1CQUFtQixDQUFDO0lBQ2xELE9BQ0NDLFNBQVMsQ0FBQ0csTUFBTSxHQUFHLENBQUMsSUFDcEJILFNBQVMsQ0FBQ0ksS0FBSyxDQUFDLFVBQVVDLEdBQUcsRUFBRTtNQUM5QixPQUFP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