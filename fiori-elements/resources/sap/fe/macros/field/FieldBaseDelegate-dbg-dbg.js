/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/type/TypeUtil", "sap/ui/mdc/field/FieldBaseDelegate", "sap/ui/model/Filter"], function (Log, CommonUtils, TypeUtil, FieldBaseDelegate, Filter) {
  "use strict";

  return Object.assign({}, FieldBaseDelegate, {
    /**
     * If the <code>Field</code> control is used, the used data type might come from the binding.
     * In V4-unit or currency case it might need to be formatted once.
     * To initialize the internal type later on, the currencies must be returned.
     *
     * @param _payload Payload for delegate
     * @param type Type from binding
     * @param value Given value
     * @returns Information needed to initialize internal type (needs to set bTypeInitialized to true if initialized)
     */
    initializeTypeFromBinding: function (_payload, type, value) {
      // V4 Unit and Currency types have a map with valid units and create an internal customizing for it.
      // The Field needs to keep this customizing logic when creating the internal type.
      // (As external RAW binding is used there is no formatting on parsing.)

      const result = {};
      if (type && type.isA(["sap.ui.model.odata.type.Unit", "sap.ui.model.odata.type.Currency"]) && Array.isArray(value) && value.length > 2 && value[2] !== undefined) {
        // format once to set internal customizing. Allow null as valid values for custom units
        type.formatValue(value, "string");
        result.bTypeInitialized = true;
        result.mCustomUnits = value[2]; // TODO: find a better way to provide custom units to internal type
      }

      return result;
    },
    /**
     * This function initializes the unit type.
     * If the <code>Field</code> control is used, the used data type might come from the binding.
     * If the type is a V4 unit or currency, it might need to be formatted once.
     *
     * @param _payload Payload for delegate
     * @param type Type from binding
     * @param typeInitialization Information needed to initialize internal type
     */
    initializeInternalUnitType: function (_payload, type, typeInitialization) {
      if ((typeInitialization === null || typeInitialization === void 0 ? void 0 : typeInitialization.mCustomUnits) !== undefined) {
        // if already initialized initialize new type too.
        type.formatValue([null, null, typeInitialization.mCustomUnits], "string");
      }
    },
    /**
     * This function enhances the value with unit or currency information if needed by the data type.
     *
     * @param _payload Payload for delegate
     * @param  values Values
     * @param  typeInitialization Information needed to initialize internal type
     * @returns Values
     */
    enhanceValueForUnit: function (_payload, values, typeInitialization) {
      if ((typeInitialization === null || typeInitialization === void 0 ? void 0 : typeInitialization.bTypeInitialized) === true && values.length === 2) {
        values.push(typeInitialization.mCustomUnits);
        return values;
      }
      return undefined;
    },
    /**
     * This function returns which <code>ValueHelpDelegate</code> is used
     * if a default field help (for example, for defining conditions in </code>FilterField</code>)
     * is created.
     *
     * @param _payload Payload for delegate
     * @returns Delegate object with name and payload
     */
    getDefaultValueHelpDelegate: function (_payload) {
      return {
        name: "sap/ui/mdc/odata/v4/ValueHelpDelegate",
        payload: {}
      };
    },
    getTypeUtil: function (_payload) {
      return TypeUtil;
    },
    /**
     * Determine all parameters in a value help that use a specific property.
     *
     * @param valueListInfo Value list info
     * @param propertyName Name of the property
     * @returns List of all found parameters
     */
    _getValueListParameter: function (valueListInfo, propertyName) {
      //determine path to value list property
      return valueListInfo.Parameters.filter(function (entry) {
        if (entry.LocalDataProperty) {
          return entry.LocalDataProperty.$PropertyPath === propertyName;
        } else {
          return false;
        }
      });
    },
    /**
     * Build filters for each relevant parameter.
     *
     * @param valueList Value list info
     * @param propertyName Name of the property
     * @param valueHelpProperty Name of the value help property
     * @param keyValue Value of the property
     * @param valuehelpPayload Payload of the value help
     * @param valuehelpConditionPayload Additional condition information for this key
     * @returns List of filters
     */
    _getFilter: function (valueList, propertyName, valueHelpProperty, keyValue, valuehelpPayload, valuehelpConditionPayload) {
      const filters = [];
      const parameters = valueList.Parameters.filter(function (parameter) {
        var _parameter$LocalDataP;
        return parameter.$Type === "com.sap.vocabularies.Common.v1.ValueListParameterIn" || parameter.$Type === "com.sap.vocabularies.Common.v1.ValueListParameterInOut" || ((_parameter$LocalDataP = parameter.LocalDataProperty) === null || _parameter$LocalDataP === void 0 ? void 0 : _parameter$LocalDataP.$PropertyPath) === propertyName && parameter.ValueListProperty === valueHelpProperty;
      });
      for (const parameter of parameters) {
        var _parameter$LocalDataP2;
        let filterValue;
        if (((_parameter$LocalDataP2 = parameter.LocalDataProperty) === null || _parameter$LocalDataP2 === void 0 ? void 0 : _parameter$LocalDataP2.$PropertyPath) === propertyName) {
          filterValue = keyValue;
        } else if ((valuehelpPayload === null || valuehelpPayload === void 0 ? void 0 : valuehelpPayload.isActionParameterDialog) === true) {
          var _parameter$LocalDataP3;
          const apdFieldPath = `APD_::${(_parameter$LocalDataP3 = parameter.LocalDataProperty) === null || _parameter$LocalDataP3 === void 0 ? void 0 : _parameter$LocalDataP3.$PropertyPath}`;
          const apdField = sap.ui.getCore().byId(apdFieldPath);
          filterValue = apdField === null || apdField === void 0 ? void 0 : apdField.getValue();
        } else if (valuehelpConditionPayload !== undefined) {
          var _parameter$LocalDataP4;
          const sourcePath = (_parameter$LocalDataP4 = parameter.LocalDataProperty) === null || _parameter$LocalDataP4 === void 0 ? void 0 : _parameter$LocalDataP4.$PropertyPath;
          const conditionPayload = valuehelpConditionPayload === null || valuehelpConditionPayload === void 0 ? void 0 : valuehelpConditionPayload[0];
          filterValue = sourcePath && (conditionPayload === null || conditionPayload === void 0 ? void 0 : conditionPayload[sourcePath]);
        }
        /* Add value to the filter for the text determination */
        if (filterValue !== null && filterValue !== undefined) {
          filters.push(new Filter({
            path: parameter.ValueListProperty,
            operator: "EQ",
            value1: filterValue
          }));
        }
      }
      return filters;
    },
    getItemForValue: function (payload, fieldHelp, config) {
      //BCP: 2270162887 . The MDC field should not try to get the item when the field is emptied
      if (config.value !== "") {
        return FieldBaseDelegate.getItemForValue(payload, fieldHelp, config);
      }
      return undefined;
    },
    /**
     * Determines the description for a given key.
     *
     * @param payload Payload for delegate
     * @param valueHelp Field help assigned to the <code>Field</code> or <code>FilterField</code> control
     * @param key Key value of the description
     * @param _conditionIn In parameters for the key (no longer supported)
     * @param _conditionOut Out parameters for the key (no longer supported)
     * @param bindingContext BindingContext <code>BindingContext</code> of the checked field. Inside a table, the <code>FieldHelp</code> element can be connected to a different row
     * @param _ConditionModel ConditionModel</code>, if bound to one
     * @param _conditionModelName Name of the <code>ConditionModel</code>, if bound to one
     * @param conditionPayload Additional context information for this key
     * @param control Instance of the calling control
     * @param _type Type of the value
     * @returns Description for the key or object containing a description, key and payload. If the description is not available right away (it must be requested), a <code>Promise</code> is returned
     */
    getDescription: async function (payload, valueHelp, key, _conditionIn, _conditionOut, bindingContext, _ConditionModel, _conditionModelName, conditionPayload, control, _type) {
      var _payload2, _payload3;
      //JIRA: FIORITECHP1-22022 . The MDC field should not  tries to determine description with the initial GET of the data.
      // it should rely on the data we already received from the backend
      // But The getDescription function is also called in the FilterField case if a variant is loaded.
      // As the description text could be language dependent it is not stored in the variant, so it needs to be read on rendering.

      /* Retrieve text from value help, if value was set by out-parameter (BCP 2270160633) */
      if (!payload && control !== null && control !== void 0 && control.getDisplay().includes("Description")) {
        payload = {
          retrieveTextFromValueList: true
        };
      }
      if (((_payload2 = payload) === null || _payload2 === void 0 ? void 0 : _payload2.retrieveTextFromValueList) === true || ((_payload3 = payload) === null || _payload3 === void 0 ? void 0 : _payload3.isFilterField) === true) {
        const dataModel = valueHelp.getModel();
        const metaModel = dataModel ? dataModel.getMetaModel() : CommonUtils.getAppComponent(valueHelp).getModel().getMetaModel();
        const valuehelpPayload = valueHelp.getPayload();
        const valuehelpConditionPayload = conditionPayload === null || conditionPayload === void 0 ? void 0 : conditionPayload[valuehelpPayload.valueHelpQualifier];
        const propertyPath = valuehelpPayload === null || valuehelpPayload === void 0 ? void 0 : valuehelpPayload.propertyPath;
        let textProperty;
        try {
          var _valueHelpParameters$;
          /* Request value help metadata */
          const valueListInfo = await metaModel.requestValueListInfo(propertyPath, true, bindingContext);
          const propertyName = metaModel.getObject(`${propertyPath}@sapui.name`);
          // take the first value list annotation - alternatively take the one without qualifier or the first one
          const valueList = valueListInfo[Object.keys(valueListInfo)[0]];
          const valueHelpParameters = this._getValueListParameter(valueList, propertyName);
          const valueHelpProperty = valueHelpParameters === null || valueHelpParameters === void 0 ? void 0 : (_valueHelpParameters$ = valueHelpParameters[0]) === null || _valueHelpParameters$ === void 0 ? void 0 : _valueHelpParameters$.ValueListProperty;
          if (!valueHelpProperty) {
            throw Error(`Inconsistent value help annotation for ${propertyName}`);
          }
          // get text annotation for this value list property
          const valueListModel = valueList.$model;
          const textAnnotation = valueListModel.getMetaModel().getObject(`/${valueList.CollectionPath}/${valueHelpProperty}@com.sap.vocabularies.Common.v1.Text`);
          if (textAnnotation && textAnnotation.$Path) {
            textProperty = textAnnotation.$Path;
            /* Build the filter for the relevant parameters */
            const filters = this._getFilter(valueList, propertyName, valueHelpProperty, key, valuehelpPayload, valuehelpConditionPayload);
            const listBinding = valueListModel.bindList(`/${valueList.CollectionPath}`, undefined, undefined, filters, {
              $select: textProperty
            });
            /* Request description for given key from value list entity */
            const contexts = await listBinding.requestContexts(0, 2);
            return contexts.length ? contexts[0].getObject(textProperty) : undefined;
          } else {
            const message = `Text Annotation for ${valueHelpProperty} is not defined`;
            Log.error(message);
            return undefined;
          }
        } catch (error) {
          const status = error ? error.status : undefined;
          const message = error instanceof Error ? error.message : String(error);
          const msg = status === 404 ? `Metadata not found (${status}) for value help of property ${propertyPath}` : message;
          Log.error(msg);
        }
      }
      return undefined;
    }
  });
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPYmplY3QiLCJhc3NpZ24iLCJGaWVsZEJhc2VEZWxlZ2F0ZSIsImluaXRpYWxpemVUeXBlRnJvbUJpbmRpbmciLCJfcGF5bG9hZCIsInR5cGUiLCJ2YWx1ZSIsInJlc3VsdCIsImlzQSIsIkFycmF5IiwiaXNBcnJheSIsImxlbmd0aCIsInVuZGVmaW5lZCIsImZvcm1hdFZhbHVlIiwiYlR5cGVJbml0aWFsaXplZCIsIm1DdXN0b21Vbml0cyIsImluaXRpYWxpemVJbnRlcm5hbFVuaXRUeXBlIiwidHlwZUluaXRpYWxpemF0aW9uIiwiZW5oYW5jZVZhbHVlRm9yVW5pdCIsInZhbHVlcyIsInB1c2giLCJnZXREZWZhdWx0VmFsdWVIZWxwRGVsZWdhdGUiLCJuYW1lIiwicGF5bG9hZCIsImdldFR5cGVVdGlsIiwiVHlwZVV0aWwiLCJfZ2V0VmFsdWVMaXN0UGFyYW1ldGVyIiwidmFsdWVMaXN0SW5mbyIsInByb3BlcnR5TmFtZSIsIlBhcmFtZXRlcnMiLCJmaWx0ZXIiLCJlbnRyeSIsIkxvY2FsRGF0YVByb3BlcnR5IiwiJFByb3BlcnR5UGF0aCIsIl9nZXRGaWx0ZXIiLCJ2YWx1ZUxpc3QiLCJ2YWx1ZUhlbHBQcm9wZXJ0eSIsImtleVZhbHVlIiwidmFsdWVoZWxwUGF5bG9hZCIsInZhbHVlaGVscENvbmRpdGlvblBheWxvYWQiLCJmaWx0ZXJzIiwicGFyYW1ldGVycyIsInBhcmFtZXRlciIsIiRUeXBlIiwiVmFsdWVMaXN0UHJvcGVydHkiLCJmaWx0ZXJWYWx1ZSIsImlzQWN0aW9uUGFyYW1ldGVyRGlhbG9nIiwiYXBkRmllbGRQYXRoIiwiYXBkRmllbGQiLCJzYXAiLCJ1aSIsImdldENvcmUiLCJieUlkIiwiZ2V0VmFsdWUiLCJzb3VyY2VQYXRoIiwiY29uZGl0aW9uUGF5bG9hZCIsIkZpbHRlciIsInBhdGgiLCJvcGVyYXRvciIsInZhbHVlMSIsImdldEl0ZW1Gb3JWYWx1ZSIsImZpZWxkSGVscCIsImNvbmZpZyIsImdldERlc2NyaXB0aW9uIiwidmFsdWVIZWxwIiwia2V5IiwiX2NvbmRpdGlvbkluIiwiX2NvbmRpdGlvbk91dCIsImJpbmRpbmdDb250ZXh0IiwiX0NvbmRpdGlvbk1vZGVsIiwiX2NvbmRpdGlvbk1vZGVsTmFtZSIsImNvbnRyb2wiLCJfdHlwZSIsImdldERpc3BsYXkiLCJpbmNsdWRlcyIsInJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3QiLCJpc0ZpbHRlckZpZWxkIiwiZGF0YU1vZGVsIiwiZ2V0TW9kZWwiLCJtZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJDb21tb25VdGlscyIsImdldEFwcENvbXBvbmVudCIsImdldFBheWxvYWQiLCJ2YWx1ZUhlbHBRdWFsaWZpZXIiLCJwcm9wZXJ0eVBhdGgiLCJ0ZXh0UHJvcGVydHkiLCJyZXF1ZXN0VmFsdWVMaXN0SW5mbyIsImdldE9iamVjdCIsImtleXMiLCJ2YWx1ZUhlbHBQYXJhbWV0ZXJzIiwiRXJyb3IiLCJ2YWx1ZUxpc3RNb2RlbCIsIiRtb2RlbCIsInRleHRBbm5vdGF0aW9uIiwiQ29sbGVjdGlvblBhdGgiLCIkUGF0aCIsImxpc3RCaW5kaW5nIiwiYmluZExpc3QiLCIkc2VsZWN0IiwiY29udGV4dHMiLCJyZXF1ZXN0Q29udGV4dHMiLCJtZXNzYWdlIiwiTG9nIiwiZXJyb3IiLCJzdGF0dXMiLCJTdHJpbmciLCJtc2ciXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpZWxkQmFzZURlbGVnYXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW1vbkFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBUeXBlVXRpbCBmcm9tIFwic2FwL2ZlL2NvcmUvdHlwZS9UeXBlVXRpbFwiO1xuaW1wb3J0IHR5cGUge1xuXHRBbm5vdGF0aW9uVmFsdWVMaXN0VHlwZSxcblx0QW5ub3RhdGlvblZhbHVlTGlzdFR5cGVCeVF1YWxpZmllcixcblx0VmFsdWVIZWxwUGF5bG9hZFxufSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC92YWx1ZWhlbHAvVmFsdWVMaXN0SGVscGVyXCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgdHlwZSBDb25kaXRpb25Nb2RlbCBmcm9tIFwic2FwL3VpL21kYy9jb25kaXRpb24vQ29uZGl0aW9uTW9kZWxcIjtcbmltcG9ydCB0eXBlIEZpZWxkIGZyb20gXCJzYXAvdWkvbWRjL0ZpZWxkXCI7XG5pbXBvcnQgdHlwZSBGaWVsZEJhc2UgZnJvbSBcInNhcC91aS9tZGMvZmllbGQvRmllbGRCYXNlXCI7XG5pbXBvcnQgRmllbGRCYXNlRGVsZWdhdGUgZnJvbSBcInNhcC91aS9tZGMvZmllbGQvRmllbGRCYXNlRGVsZWdhdGVcIjtcbmltcG9ydCB0eXBlIEZpZWxkSGVscEJhc2UgZnJvbSBcInNhcC91aS9tZGMvZmllbGQvRmllbGRIZWxwQmFzZVwiO1xuaW1wb3J0IHR5cGUgVmFsdWVIZWxwIGZyb20gXCJzYXAvdWkvbWRjL1ZhbHVlSGVscFwiO1xuaW1wb3J0IEZpbHRlciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlclwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBTaW1wbGVUeXBlIGZyb20gXCJzYXAvdWkvbW9kZWwvU2ltcGxlVHlwZVwiO1xuaW1wb3J0IHR5cGUgeyBDb25kaXRpb25QYXlsb2FkTWFwLCBDb25kaXRpb25QYXlsb2FkVHlwZSB9IGZyb20gXCIuLi92YWx1ZWhlbHAvVmFsdWVIZWxwRGVsZWdhdGVcIjtcblxudHlwZSBGaWVsZFBheWxvYWQgPSB7XG5cdHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3Q/OiBib29sZWFuO1xuXHRpc0ZpbHRlckZpZWxkPzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIFZhbHVlID0gc3RyaW5nIHwgRGF0ZSB8IG51bWJlciB8IGJvb2xlYW4gfCB1bmRlZmluZWQgfCBudWxsO1xuXG5leHBvcnQgdHlwZSBUeXBlSW5pdGlhbGl6YXRpb24gPSB7XG5cdGJUeXBlSW5pdGlhbGl6ZWQ/OiBib29sZWFuO1xuXHRtQ3VzdG9tVW5pdHM/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBDb25maWcgPSB7XG5cdHZhbHVlOiBWYWx1ZTtcblx0cGFyc2VkVmFsdWU6IFZhbHVlO1xuXHRiaW5kaW5nQ29udGV4dDogQ29udGV4dDtcblx0Y2hlY2tLZXk6IGJvb2xlYW47XG5cdGNoZWNrRGVzY3JpcHRpb246IGJvb2xlYW47XG5cdGNvbmRpdGlvbk1vZGVsPzogQ29uZGl0aW9uTW9kZWw7XG5cdGNvbmRpdGlvbk1vZGVsTmFtZT86IHN0cmluZztcblx0Y29udHJvbD86IG9iamVjdDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IE9iamVjdC5hc3NpZ24oe30sIEZpZWxkQmFzZURlbGVnYXRlLCB7XG5cdC8qKlxuXHQgKiBJZiB0aGUgPGNvZGU+RmllbGQ8L2NvZGU+IGNvbnRyb2wgaXMgdXNlZCwgdGhlIHVzZWQgZGF0YSB0eXBlIG1pZ2h0IGNvbWUgZnJvbSB0aGUgYmluZGluZy5cblx0ICogSW4gVjQtdW5pdCBvciBjdXJyZW5jeSBjYXNlIGl0IG1pZ2h0IG5lZWQgdG8gYmUgZm9ybWF0dGVkIG9uY2UuXG5cdCAqIFRvIGluaXRpYWxpemUgdGhlIGludGVybmFsIHR5cGUgbGF0ZXIgb24sIHRoZSBjdXJyZW5jaWVzIG11c3QgYmUgcmV0dXJuZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBfcGF5bG9hZCBQYXlsb2FkIGZvciBkZWxlZ2F0ZVxuXHQgKiBAcGFyYW0gdHlwZSBUeXBlIGZyb20gYmluZGluZ1xuXHQgKiBAcGFyYW0gdmFsdWUgR2l2ZW4gdmFsdWVcblx0ICogQHJldHVybnMgSW5mb3JtYXRpb24gbmVlZGVkIHRvIGluaXRpYWxpemUgaW50ZXJuYWwgdHlwZSAobmVlZHMgdG8gc2V0IGJUeXBlSW5pdGlhbGl6ZWQgdG8gdHJ1ZSBpZiBpbml0aWFsaXplZClcblx0ICovXG5cdGluaXRpYWxpemVUeXBlRnJvbUJpbmRpbmc6IGZ1bmN0aW9uIChfcGF5bG9hZDogRmllbGRQYXlsb2FkLCB0eXBlOiBTaW1wbGVUeXBlIHwgdW5kZWZpbmVkLCB2YWx1ZTogVmFsdWUgfCBWYWx1ZVtdKSB7XG5cdFx0Ly8gVjQgVW5pdCBhbmQgQ3VycmVuY3kgdHlwZXMgaGF2ZSBhIG1hcCB3aXRoIHZhbGlkIHVuaXRzIGFuZCBjcmVhdGUgYW4gaW50ZXJuYWwgY3VzdG9taXppbmcgZm9yIGl0LlxuXHRcdC8vIFRoZSBGaWVsZCBuZWVkcyB0byBrZWVwIHRoaXMgY3VzdG9taXppbmcgbG9naWMgd2hlbiBjcmVhdGluZyB0aGUgaW50ZXJuYWwgdHlwZS5cblx0XHQvLyAoQXMgZXh0ZXJuYWwgUkFXIGJpbmRpbmcgaXMgdXNlZCB0aGVyZSBpcyBubyBmb3JtYXR0aW5nIG9uIHBhcnNpbmcuKVxuXG5cdFx0Y29uc3QgcmVzdWx0OiBUeXBlSW5pdGlhbGl6YXRpb24gPSB7fTtcblx0XHRpZiAoXG5cdFx0XHR0eXBlICYmXG5cdFx0XHR0eXBlLmlzQShbXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5Vbml0XCIsIFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuQ3VycmVuY3lcIl0pICYmXG5cdFx0XHRBcnJheS5pc0FycmF5KHZhbHVlKSAmJlxuXHRcdFx0dmFsdWUubGVuZ3RoID4gMiAmJlxuXHRcdFx0dmFsdWVbMl0gIT09IHVuZGVmaW5lZFxuXHRcdCkge1xuXHRcdFx0Ly8gZm9ybWF0IG9uY2UgdG8gc2V0IGludGVybmFsIGN1c3RvbWl6aW5nLiBBbGxvdyBudWxsIGFzIHZhbGlkIHZhbHVlcyBmb3IgY3VzdG9tIHVuaXRzXG5cdFx0XHR0eXBlLmZvcm1hdFZhbHVlKHZhbHVlLCBcInN0cmluZ1wiKTtcblx0XHRcdHJlc3VsdC5iVHlwZUluaXRpYWxpemVkID0gdHJ1ZTtcblx0XHRcdHJlc3VsdC5tQ3VzdG9tVW5pdHMgPSB2YWx1ZVsyXSBhcyBzdHJpbmc7IC8vIFRPRE86IGZpbmQgYSBiZXR0ZXIgd2F5IHRvIHByb3ZpZGUgY3VzdG9tIHVuaXRzIHRvIGludGVybmFsIHR5cGVcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGluaXRpYWxpemVzIHRoZSB1bml0IHR5cGUuXG5cdCAqIElmIHRoZSA8Y29kZT5GaWVsZDwvY29kZT4gY29udHJvbCBpcyB1c2VkLCB0aGUgdXNlZCBkYXRhIHR5cGUgbWlnaHQgY29tZSBmcm9tIHRoZSBiaW5kaW5nLlxuXHQgKiBJZiB0aGUgdHlwZSBpcyBhIFY0IHVuaXQgb3IgY3VycmVuY3ksIGl0IG1pZ2h0IG5lZWQgdG8gYmUgZm9ybWF0dGVkIG9uY2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBfcGF5bG9hZCBQYXlsb2FkIGZvciBkZWxlZ2F0ZVxuXHQgKiBAcGFyYW0gdHlwZSBUeXBlIGZyb20gYmluZGluZ1xuXHQgKiBAcGFyYW0gdHlwZUluaXRpYWxpemF0aW9uIEluZm9ybWF0aW9uIG5lZWRlZCB0byBpbml0aWFsaXplIGludGVybmFsIHR5cGVcblx0ICovXG5cdGluaXRpYWxpemVJbnRlcm5hbFVuaXRUeXBlOiBmdW5jdGlvbiAoX3BheWxvYWQ6IEZpZWxkUGF5bG9hZCwgdHlwZTogU2ltcGxlVHlwZSwgdHlwZUluaXRpYWxpemF0aW9uPzogVHlwZUluaXRpYWxpemF0aW9uKSB7XG5cdFx0aWYgKHR5cGVJbml0aWFsaXphdGlvbj8ubUN1c3RvbVVuaXRzICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIGlmIGFscmVhZHkgaW5pdGlhbGl6ZWQgaW5pdGlhbGl6ZSBuZXcgdHlwZSB0b28uXG5cdFx0XHR0eXBlLmZvcm1hdFZhbHVlKFtudWxsLCBudWxsLCB0eXBlSW5pdGlhbGl6YXRpb24ubUN1c3RvbVVuaXRzXSwgXCJzdHJpbmdcIik7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGVuaGFuY2VzIHRoZSB2YWx1ZSB3aXRoIHVuaXQgb3IgY3VycmVuY3kgaW5mb3JtYXRpb24gaWYgbmVlZGVkIGJ5IHRoZSBkYXRhIHR5cGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBfcGF5bG9hZCBQYXlsb2FkIGZvciBkZWxlZ2F0ZVxuXHQgKiBAcGFyYW0gIHZhbHVlcyBWYWx1ZXNcblx0ICogQHBhcmFtICB0eXBlSW5pdGlhbGl6YXRpb24gSW5mb3JtYXRpb24gbmVlZGVkIHRvIGluaXRpYWxpemUgaW50ZXJuYWwgdHlwZVxuXHQgKiBAcmV0dXJucyBWYWx1ZXNcblx0ICovXG5cdGVuaGFuY2VWYWx1ZUZvclVuaXQ6IGZ1bmN0aW9uIChfcGF5bG9hZDogRmllbGRQYXlsb2FkLCB2YWx1ZXM6IFZhbHVlW10sIHR5cGVJbml0aWFsaXphdGlvbj86IFR5cGVJbml0aWFsaXphdGlvbikge1xuXHRcdGlmICh0eXBlSW5pdGlhbGl6YXRpb24/LmJUeXBlSW5pdGlhbGl6ZWQgPT09IHRydWUgJiYgdmFsdWVzLmxlbmd0aCA9PT0gMikge1xuXHRcdFx0dmFsdWVzLnB1c2godHlwZUluaXRpYWxpemF0aW9uLm1DdXN0b21Vbml0cyk7XG5cdFx0XHRyZXR1cm4gdmFsdWVzO1xuXHRcdH1cblxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyB3aGljaCA8Y29kZT5WYWx1ZUhlbHBEZWxlZ2F0ZTwvY29kZT4gaXMgdXNlZFxuXHQgKiBpZiBhIGRlZmF1bHQgZmllbGQgaGVscCAoZm9yIGV4YW1wbGUsIGZvciBkZWZpbmluZyBjb25kaXRpb25zIGluIDwvY29kZT5GaWx0ZXJGaWVsZDwvY29kZT4pXG5cdCAqIGlzIGNyZWF0ZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBfcGF5bG9hZCBQYXlsb2FkIGZvciBkZWxlZ2F0ZVxuXHQgKiBAcmV0dXJucyBEZWxlZ2F0ZSBvYmplY3Qgd2l0aCBuYW1lIGFuZCBwYXlsb2FkXG5cdCAqL1xuXHRnZXREZWZhdWx0VmFsdWVIZWxwRGVsZWdhdGU6IGZ1bmN0aW9uIChfcGF5bG9hZDogRmllbGRQYXlsb2FkKSB7XG5cdFx0cmV0dXJuIHsgbmFtZTogXCJzYXAvdWkvbWRjL29kYXRhL3Y0L1ZhbHVlSGVscERlbGVnYXRlXCIsIHBheWxvYWQ6IHt9IH07XG5cdH0sXG5cblx0Z2V0VHlwZVV0aWw6IGZ1bmN0aW9uIChfcGF5bG9hZDogRmllbGRQYXlsb2FkKSB7XG5cdFx0cmV0dXJuIFR5cGVVdGlsO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBEZXRlcm1pbmUgYWxsIHBhcmFtZXRlcnMgaW4gYSB2YWx1ZSBoZWxwIHRoYXQgdXNlIGEgc3BlY2lmaWMgcHJvcGVydHkuXG5cdCAqXG5cdCAqIEBwYXJhbSB2YWx1ZUxpc3RJbmZvIFZhbHVlIGxpc3QgaW5mb1xuXHQgKiBAcGFyYW0gcHJvcGVydHlOYW1lIE5hbWUgb2YgdGhlIHByb3BlcnR5XG5cdCAqIEByZXR1cm5zIExpc3Qgb2YgYWxsIGZvdW5kIHBhcmFtZXRlcnNcblx0ICovXG5cdF9nZXRWYWx1ZUxpc3RQYXJhbWV0ZXI6IGZ1bmN0aW9uICh2YWx1ZUxpc3RJbmZvOiBBbm5vdGF0aW9uVmFsdWVMaXN0VHlwZSwgcHJvcGVydHlOYW1lOiBzdHJpbmcpIHtcblx0XHQvL2RldGVybWluZSBwYXRoIHRvIHZhbHVlIGxpc3QgcHJvcGVydHlcblx0XHRyZXR1cm4gdmFsdWVMaXN0SW5mby5QYXJhbWV0ZXJzLmZpbHRlcihmdW5jdGlvbiAoZW50cnkpIHtcblx0XHRcdGlmIChlbnRyeS5Mb2NhbERhdGFQcm9wZXJ0eSkge1xuXHRcdFx0XHRyZXR1cm4gZW50cnkuTG9jYWxEYXRhUHJvcGVydHkuJFByb3BlcnR5UGF0aCA9PT0gcHJvcGVydHlOYW1lO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXHQvKipcblx0ICogQnVpbGQgZmlsdGVycyBmb3IgZWFjaCByZWxldmFudCBwYXJhbWV0ZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSB2YWx1ZUxpc3QgVmFsdWUgbGlzdCBpbmZvXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eU5hbWUgTmFtZSBvZiB0aGUgcHJvcGVydHlcblx0ICogQHBhcmFtIHZhbHVlSGVscFByb3BlcnR5IE5hbWUgb2YgdGhlIHZhbHVlIGhlbHAgcHJvcGVydHlcblx0ICogQHBhcmFtIGtleVZhbHVlIFZhbHVlIG9mIHRoZSBwcm9wZXJ0eVxuXHQgKiBAcGFyYW0gdmFsdWVoZWxwUGF5bG9hZCBQYXlsb2FkIG9mIHRoZSB2YWx1ZSBoZWxwXG5cdCAqIEBwYXJhbSB2YWx1ZWhlbHBDb25kaXRpb25QYXlsb2FkIEFkZGl0aW9uYWwgY29uZGl0aW9uIGluZm9ybWF0aW9uIGZvciB0aGlzIGtleVxuXHQgKiBAcmV0dXJucyBMaXN0IG9mIGZpbHRlcnNcblx0ICovXG5cdF9nZXRGaWx0ZXI6IGZ1bmN0aW9uIChcblx0XHR2YWx1ZUxpc3Q6IEFubm90YXRpb25WYWx1ZUxpc3RUeXBlLFxuXHRcdHByb3BlcnR5TmFtZTogc3RyaW5nLFxuXHRcdHZhbHVlSGVscFByb3BlcnR5OiBzdHJpbmcsXG5cdFx0a2V5VmFsdWU6IHN0cmluZyxcblx0XHR2YWx1ZWhlbHBQYXlsb2FkOiBWYWx1ZUhlbHBQYXlsb2FkLFxuXHRcdHZhbHVlaGVscENvbmRpdGlvblBheWxvYWQ6IENvbmRpdGlvblBheWxvYWRUeXBlW11cblx0KSB7XG5cdFx0Y29uc3QgZmlsdGVycyA9IFtdO1xuXHRcdGNvbnN0IHBhcmFtZXRlcnMgPSB2YWx1ZUxpc3QuUGFyYW1ldGVycy5maWx0ZXIoZnVuY3Rpb24gKHBhcmFtZXRlcikge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0cGFyYW1ldGVyLiRUeXBlID09PSBDb21tb25Bbm5vdGF0aW9uVHlwZXMuVmFsdWVMaXN0UGFyYW1ldGVySW4gfHxcblx0XHRcdFx0cGFyYW1ldGVyLiRUeXBlID09PSBDb21tb25Bbm5vdGF0aW9uVHlwZXMuVmFsdWVMaXN0UGFyYW1ldGVySW5PdXQgfHxcblx0XHRcdFx0KHBhcmFtZXRlci5Mb2NhbERhdGFQcm9wZXJ0eT8uJFByb3BlcnR5UGF0aCA9PT0gcHJvcGVydHlOYW1lICYmIHBhcmFtZXRlci5WYWx1ZUxpc3RQcm9wZXJ0eSA9PT0gdmFsdWVIZWxwUHJvcGVydHkpXG5cdFx0XHQpO1xuXHRcdH0pO1xuXHRcdGZvciAoY29uc3QgcGFyYW1ldGVyIG9mIHBhcmFtZXRlcnMpIHtcblx0XHRcdGxldCBmaWx0ZXJWYWx1ZTtcblx0XHRcdGlmIChwYXJhbWV0ZXIuTG9jYWxEYXRhUHJvcGVydHk/LiRQcm9wZXJ0eVBhdGggPT09IHByb3BlcnR5TmFtZSkge1xuXHRcdFx0XHRmaWx0ZXJWYWx1ZSA9IGtleVZhbHVlO1xuXHRcdFx0fSBlbHNlIGlmICh2YWx1ZWhlbHBQYXlsb2FkPy5pc0FjdGlvblBhcmFtZXRlckRpYWxvZyA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRjb25zdCBhcGRGaWVsZFBhdGggPSBgQVBEXzo6JHtwYXJhbWV0ZXIuTG9jYWxEYXRhUHJvcGVydHk/LiRQcm9wZXJ0eVBhdGh9YDtcblx0XHRcdFx0Y29uc3QgYXBkRmllbGQgPSBzYXAudWkuZ2V0Q29yZSgpLmJ5SWQoYXBkRmllbGRQYXRoKSBhcyBGaWVsZDtcblx0XHRcdFx0ZmlsdGVyVmFsdWUgPSBhcGRGaWVsZD8uZ2V0VmFsdWUoKTtcblx0XHRcdH0gZWxzZSBpZiAodmFsdWVoZWxwQ29uZGl0aW9uUGF5bG9hZCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGNvbnN0IHNvdXJjZVBhdGggPSBwYXJhbWV0ZXIuTG9jYWxEYXRhUHJvcGVydHk/LiRQcm9wZXJ0eVBhdGg7XG5cdFx0XHRcdGNvbnN0IGNvbmRpdGlvblBheWxvYWQgPSB2YWx1ZWhlbHBDb25kaXRpb25QYXlsb2FkPy5bMF07XG5cdFx0XHRcdGZpbHRlclZhbHVlID0gc291cmNlUGF0aCAmJiBjb25kaXRpb25QYXlsb2FkPy5bc291cmNlUGF0aF07XG5cdFx0XHR9XG5cdFx0XHQvKiBBZGQgdmFsdWUgdG8gdGhlIGZpbHRlciBmb3IgdGhlIHRleHQgZGV0ZXJtaW5hdGlvbiAqL1xuXHRcdFx0aWYgKGZpbHRlclZhbHVlICE9PSBudWxsICYmIGZpbHRlclZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0ZmlsdGVycy5wdXNoKG5ldyBGaWx0ZXIoeyBwYXRoOiBwYXJhbWV0ZXIuVmFsdWVMaXN0UHJvcGVydHksIG9wZXJhdG9yOiBcIkVRXCIsIHZhbHVlMTogZmlsdGVyVmFsdWUgfSkpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmlsdGVycztcblx0fSxcblx0Z2V0SXRlbUZvclZhbHVlOiBmdW5jdGlvbiAocGF5bG9hZDogRmllbGRQYXlsb2FkLCBmaWVsZEhlbHA6IEZpZWxkSGVscEJhc2UsIGNvbmZpZzogQ29uZmlnKSB7XG5cdFx0Ly9CQ1A6IDIyNzAxNjI4ODcgLiBUaGUgTURDIGZpZWxkIHNob3VsZCBub3QgdHJ5IHRvIGdldCB0aGUgaXRlbSB3aGVuIHRoZSBmaWVsZCBpcyBlbXB0aWVkXG5cdFx0aWYgKGNvbmZpZy52YWx1ZSAhPT0gXCJcIikge1xuXHRcdFx0cmV0dXJuIEZpZWxkQmFzZURlbGVnYXRlLmdldEl0ZW1Gb3JWYWx1ZShwYXlsb2FkLCBmaWVsZEhlbHAsIGNvbmZpZyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fSxcblxuXHQvKipcblx0ICogRGV0ZXJtaW5lcyB0aGUgZGVzY3JpcHRpb24gZm9yIGEgZ2l2ZW4ga2V5LlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF5bG9hZCBQYXlsb2FkIGZvciBkZWxlZ2F0ZVxuXHQgKiBAcGFyYW0gdmFsdWVIZWxwIEZpZWxkIGhlbHAgYXNzaWduZWQgdG8gdGhlIDxjb2RlPkZpZWxkPC9jb2RlPiBvciA8Y29kZT5GaWx0ZXJGaWVsZDwvY29kZT4gY29udHJvbFxuXHQgKiBAcGFyYW0ga2V5IEtleSB2YWx1ZSBvZiB0aGUgZGVzY3JpcHRpb25cblx0ICogQHBhcmFtIF9jb25kaXRpb25JbiBJbiBwYXJhbWV0ZXJzIGZvciB0aGUga2V5IChubyBsb25nZXIgc3VwcG9ydGVkKVxuXHQgKiBAcGFyYW0gX2NvbmRpdGlvbk91dCBPdXQgcGFyYW1ldGVycyBmb3IgdGhlIGtleSAobm8gbG9uZ2VyIHN1cHBvcnRlZClcblx0ICogQHBhcmFtIGJpbmRpbmdDb250ZXh0IEJpbmRpbmdDb250ZXh0IDxjb2RlPkJpbmRpbmdDb250ZXh0PC9jb2RlPiBvZiB0aGUgY2hlY2tlZCBmaWVsZC4gSW5zaWRlIGEgdGFibGUsIHRoZSA8Y29kZT5GaWVsZEhlbHA8L2NvZGU+IGVsZW1lbnQgY2FuIGJlIGNvbm5lY3RlZCB0byBhIGRpZmZlcmVudCByb3dcblx0ICogQHBhcmFtIF9Db25kaXRpb25Nb2RlbCBDb25kaXRpb25Nb2RlbDwvY29kZT4sIGlmIGJvdW5kIHRvIG9uZVxuXHQgKiBAcGFyYW0gX2NvbmRpdGlvbk1vZGVsTmFtZSBOYW1lIG9mIHRoZSA8Y29kZT5Db25kaXRpb25Nb2RlbDwvY29kZT4sIGlmIGJvdW5kIHRvIG9uZVxuXHQgKiBAcGFyYW0gY29uZGl0aW9uUGF5bG9hZCBBZGRpdGlvbmFsIGNvbnRleHQgaW5mb3JtYXRpb24gZm9yIHRoaXMga2V5XG5cdCAqIEBwYXJhbSBjb250cm9sIEluc3RhbmNlIG9mIHRoZSBjYWxsaW5nIGNvbnRyb2xcblx0ICogQHBhcmFtIF90eXBlIFR5cGUgb2YgdGhlIHZhbHVlXG5cdCAqIEByZXR1cm5zIERlc2NyaXB0aW9uIGZvciB0aGUga2V5IG9yIG9iamVjdCBjb250YWluaW5nIGEgZGVzY3JpcHRpb24sIGtleSBhbmQgcGF5bG9hZC4gSWYgdGhlIGRlc2NyaXB0aW9uIGlzIG5vdCBhdmFpbGFibGUgcmlnaHQgYXdheSAoaXQgbXVzdCBiZSByZXF1ZXN0ZWQpLCBhIDxjb2RlPlByb21pc2U8L2NvZGU+IGlzIHJldHVybmVkXG5cdCAqL1xuXHRnZXREZXNjcmlwdGlvbjogYXN5bmMgZnVuY3Rpb24gKFxuXHRcdHBheWxvYWQ6IEZpZWxkUGF5bG9hZCB8IHVuZGVmaW5lZCxcblx0XHR2YWx1ZUhlbHA6IFZhbHVlSGVscCxcblx0XHRrZXk6IHN0cmluZyxcblx0XHRfY29uZGl0aW9uSW46IG9iamVjdCxcblx0XHRfY29uZGl0aW9uT3V0OiBvYmplY3QsXG5cdFx0YmluZGluZ0NvbnRleHQ6IENvbnRleHQsXG5cdFx0X0NvbmRpdGlvbk1vZGVsOiBDb25kaXRpb25Nb2RlbCxcblx0XHRfY29uZGl0aW9uTW9kZWxOYW1lOiBzdHJpbmcsXG5cdFx0Y29uZGl0aW9uUGF5bG9hZDogQ29uZGl0aW9uUGF5bG9hZE1hcCxcblx0XHRjb250cm9sOiBDb250cm9sLFxuXHRcdF90eXBlOiB1bmtub3duXG5cdCkge1xuXHRcdC8vSklSQTogRklPUklURUNIUDEtMjIwMjIgLiBUaGUgTURDIGZpZWxkIHNob3VsZCBub3QgIHRyaWVzIHRvIGRldGVybWluZSBkZXNjcmlwdGlvbiB3aXRoIHRoZSBpbml0aWFsIEdFVCBvZiB0aGUgZGF0YS5cblx0XHQvLyBpdCBzaG91bGQgcmVseSBvbiB0aGUgZGF0YSB3ZSBhbHJlYWR5IHJlY2VpdmVkIGZyb20gdGhlIGJhY2tlbmRcblx0XHQvLyBCdXQgVGhlIGdldERlc2NyaXB0aW9uIGZ1bmN0aW9uIGlzIGFsc28gY2FsbGVkIGluIHRoZSBGaWx0ZXJGaWVsZCBjYXNlIGlmIGEgdmFyaWFudCBpcyBsb2FkZWQuXG5cdFx0Ly8gQXMgdGhlIGRlc2NyaXB0aW9uIHRleHQgY291bGQgYmUgbGFuZ3VhZ2UgZGVwZW5kZW50IGl0IGlzIG5vdCBzdG9yZWQgaW4gdGhlIHZhcmlhbnQsIHNvIGl0IG5lZWRzIHRvIGJlIHJlYWQgb24gcmVuZGVyaW5nLlxuXG5cdFx0LyogUmV0cmlldmUgdGV4dCBmcm9tIHZhbHVlIGhlbHAsIGlmIHZhbHVlIHdhcyBzZXQgYnkgb3V0LXBhcmFtZXRlciAoQkNQIDIyNzAxNjA2MzMpICovXG5cdFx0aWYgKCFwYXlsb2FkICYmIChjb250cm9sIGFzIEZpZWxkQmFzZSk/LmdldERpc3BsYXkoKS5pbmNsdWRlcyhcIkRlc2NyaXB0aW9uXCIpKSB7XG5cdFx0XHRwYXlsb2FkID0ge1xuXHRcdFx0XHRyZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0OiB0cnVlXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGlmIChwYXlsb2FkPy5yZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0ID09PSB0cnVlIHx8IHBheWxvYWQ/LmlzRmlsdGVyRmllbGQgPT09IHRydWUpIHtcblx0XHRcdGNvbnN0IGRhdGFNb2RlbCA9IHZhbHVlSGVscC5nZXRNb2RlbCgpIGFzIE9EYXRhTW9kZWwgfCB1bmRlZmluZWQ7XG5cdFx0XHRjb25zdCBtZXRhTW9kZWwgPSBkYXRhTW9kZWxcblx0XHRcdFx0PyBkYXRhTW9kZWwuZ2V0TWV0YU1vZGVsKClcblx0XHRcdFx0OiAoQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHZhbHVlSGVscCBhcyB1bmtub3duIGFzIENvbnRyb2wpXG5cdFx0XHRcdFx0XHQuZ2V0TW9kZWwoKVxuXHRcdFx0XHRcdFx0LmdldE1ldGFNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsKTtcblx0XHRcdGNvbnN0IHZhbHVlaGVscFBheWxvYWQgPSB2YWx1ZUhlbHAuZ2V0UGF5bG9hZCgpIGFzIFZhbHVlSGVscFBheWxvYWQ7XG5cdFx0XHRjb25zdCB2YWx1ZWhlbHBDb25kaXRpb25QYXlsb2FkID0gY29uZGl0aW9uUGF5bG9hZD8uW3ZhbHVlaGVscFBheWxvYWQudmFsdWVIZWxwUXVhbGlmaWVyXTtcblx0XHRcdGNvbnN0IHByb3BlcnR5UGF0aDogc3RyaW5nID0gdmFsdWVoZWxwUGF5bG9hZD8ucHJvcGVydHlQYXRoO1xuXHRcdFx0bGV0IHRleHRQcm9wZXJ0eTogc3RyaW5nO1xuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHQvKiBSZXF1ZXN0IHZhbHVlIGhlbHAgbWV0YWRhdGEgKi9cblx0XHRcdFx0Y29uc3QgdmFsdWVMaXN0SW5mbyA9IChhd2FpdCBtZXRhTW9kZWwucmVxdWVzdFZhbHVlTGlzdEluZm8oXG5cdFx0XHRcdFx0cHJvcGVydHlQYXRoLFxuXHRcdFx0XHRcdHRydWUsXG5cdFx0XHRcdFx0YmluZGluZ0NvbnRleHRcblx0XHRcdFx0KSkgYXMgQW5ub3RhdGlvblZhbHVlTGlzdFR5cGVCeVF1YWxpZmllcjtcblxuXHRcdFx0XHRjb25zdCBwcm9wZXJ0eU5hbWUgPSBtZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3Byb3BlcnR5UGF0aH1Ac2FwdWkubmFtZWApIGFzIHN0cmluZztcblx0XHRcdFx0Ly8gdGFrZSB0aGUgZmlyc3QgdmFsdWUgbGlzdCBhbm5vdGF0aW9uIC0gYWx0ZXJuYXRpdmVseSB0YWtlIHRoZSBvbmUgd2l0aG91dCBxdWFsaWZpZXIgb3IgdGhlIGZpcnN0IG9uZVxuXHRcdFx0XHRjb25zdCB2YWx1ZUxpc3QgPSB2YWx1ZUxpc3RJbmZvW09iamVjdC5rZXlzKHZhbHVlTGlzdEluZm8pWzBdXTtcblx0XHRcdFx0Y29uc3QgdmFsdWVIZWxwUGFyYW1ldGVycyA9IHRoaXMuX2dldFZhbHVlTGlzdFBhcmFtZXRlcih2YWx1ZUxpc3QsIHByb3BlcnR5TmFtZSk7XG5cdFx0XHRcdGNvbnN0IHZhbHVlSGVscFByb3BlcnR5ID0gdmFsdWVIZWxwUGFyYW1ldGVycz8uWzBdPy5WYWx1ZUxpc3RQcm9wZXJ0eTtcblx0XHRcdFx0aWYgKCF2YWx1ZUhlbHBQcm9wZXJ0eSkge1xuXHRcdFx0XHRcdHRocm93IEVycm9yKGBJbmNvbnNpc3RlbnQgdmFsdWUgaGVscCBhbm5vdGF0aW9uIGZvciAke3Byb3BlcnR5TmFtZX1gKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBnZXQgdGV4dCBhbm5vdGF0aW9uIGZvciB0aGlzIHZhbHVlIGxpc3QgcHJvcGVydHlcblx0XHRcdFx0Y29uc3QgdmFsdWVMaXN0TW9kZWwgPSB2YWx1ZUxpc3QuJG1vZGVsO1xuXHRcdFx0XHRjb25zdCB0ZXh0QW5ub3RhdGlvbiA9IHZhbHVlTGlzdE1vZGVsXG5cdFx0XHRcdFx0LmdldE1ldGFNb2RlbCgpXG5cdFx0XHRcdFx0LmdldE9iamVjdChgLyR7dmFsdWVMaXN0LkNvbGxlY3Rpb25QYXRofS8ke3ZhbHVlSGVscFByb3BlcnR5fUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dGApO1xuXHRcdFx0XHRpZiAodGV4dEFubm90YXRpb24gJiYgdGV4dEFubm90YXRpb24uJFBhdGgpIHtcblx0XHRcdFx0XHR0ZXh0UHJvcGVydHkgPSB0ZXh0QW5ub3RhdGlvbi4kUGF0aDtcblx0XHRcdFx0XHQvKiBCdWlsZCB0aGUgZmlsdGVyIGZvciB0aGUgcmVsZXZhbnQgcGFyYW1ldGVycyAqL1xuXHRcdFx0XHRcdGNvbnN0IGZpbHRlcnMgPSB0aGlzLl9nZXRGaWx0ZXIoXG5cdFx0XHRcdFx0XHR2YWx1ZUxpc3QsXG5cdFx0XHRcdFx0XHRwcm9wZXJ0eU5hbWUsXG5cdFx0XHRcdFx0XHR2YWx1ZUhlbHBQcm9wZXJ0eSxcblx0XHRcdFx0XHRcdGtleSxcblx0XHRcdFx0XHRcdHZhbHVlaGVscFBheWxvYWQsXG5cdFx0XHRcdFx0XHR2YWx1ZWhlbHBDb25kaXRpb25QYXlsb2FkXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRjb25zdCBsaXN0QmluZGluZyA9IHZhbHVlTGlzdE1vZGVsLmJpbmRMaXN0KGAvJHt2YWx1ZUxpc3QuQ29sbGVjdGlvblBhdGh9YCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGZpbHRlcnMsIHtcblx0XHRcdFx0XHRcdCRzZWxlY3Q6IHRleHRQcm9wZXJ0eVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdC8qIFJlcXVlc3QgZGVzY3JpcHRpb24gZm9yIGdpdmVuIGtleSBmcm9tIHZhbHVlIGxpc3QgZW50aXR5ICovXG5cdFx0XHRcdFx0Y29uc3QgY29udGV4dHMgPSBhd2FpdCBsaXN0QmluZGluZy5yZXF1ZXN0Q29udGV4dHMoMCwgMik7XG5cdFx0XHRcdFx0cmV0dXJuIGNvbnRleHRzLmxlbmd0aCA/IGNvbnRleHRzWzBdLmdldE9iamVjdCh0ZXh0UHJvcGVydHkpIDogdW5kZWZpbmVkO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IG1lc3NhZ2UgPSBgVGV4dCBBbm5vdGF0aW9uIGZvciAke3ZhbHVlSGVscFByb3BlcnR5fSBpcyBub3QgZGVmaW5lZGA7XG5cdFx0XHRcdFx0TG9nLmVycm9yKG1lc3NhZ2UpO1xuXHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHRcdH1cblx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdGNvbnN0IHN0YXR1cyA9IGVycm9yID8gKGVycm9yIGFzIFhNTEh0dHBSZXF1ZXN0KS5zdGF0dXMgOiB1bmRlZmluZWQ7XG5cdFx0XHRcdGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG5cdFx0XHRcdGNvbnN0IG1zZyA9IHN0YXR1cyA9PT0gNDA0ID8gYE1ldGFkYXRhIG5vdCBmb3VuZCAoJHtzdGF0dXN9KSBmb3IgdmFsdWUgaGVscCBvZiBwcm9wZXJ0eSAke3Byb3BlcnR5UGF0aH1gIDogbWVzc2FnZTtcblx0XHRcdFx0TG9nLmVycm9yKG1zZyk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cbn0pO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O1NBOENlQSxNQUFNLENBQUNDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRUMsaUJBQWlCLEVBQUU7SUFDbkQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MseUJBQXlCLEVBQUUsVUFBVUMsUUFBc0IsRUFBRUMsSUFBNEIsRUFBRUMsS0FBc0IsRUFBRTtNQUNsSDtNQUNB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