/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/merge", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/editFlow/draft", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/KeepAliveHelper", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/ResourceModelHelper", "sap/fe/navigation/SelectionVariant", "sap/ui/core/Core", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution", "../converters/helpers/Aggregation", "./editFlow/NotApplicableContextDialog"], function (Log, mergeObjects, CommonUtils, draft, MetaModelConverter, ClassSupport, KeepAliveHelper, ModelHelper, ResourceModelHelper, SelectionVariant, Core, ControllerExtension, OverrideExecution, Aggregation, NotApplicableContextDialog) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _class, _class2;
  var AggregationHelper = Aggregation.AggregationHelper;
  var getResourceModel = ResourceModelHelper.getResourceModel;
  var publicExtension = ClassSupport.publicExtension;
  var privateExtension = ClassSupport.privateExtension;
  var methodOverride = ClassSupport.methodOverride;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var convertTypes = MetaModelConverter.convertTypes;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  /**
   * {@link sap.ui.core.mvc.ControllerExtension Controller extension}
   *
   * @namespace
   * @alias sap.fe.core.controllerextensions.InternalInternalBasedNavigation
   * @private
   * @since 1.84.0
   */
  let InternalIntentBasedNavigation = (_dec = defineUI5Class("sap.fe.core.controllerextensions.InternalInternalBasedNavigation"), _dec2 = methodOverride(), _dec3 = publicExtension(), _dec4 = finalExtension(), _dec5 = publicExtension(), _dec6 = finalExtension(), _dec7 = publicExtension(), _dec8 = finalExtension(), _dec9 = publicExtension(), _dec10 = extensible(OverrideExecution.Instead), _dec11 = publicExtension(), _dec12 = finalExtension(), _dec13 = privateExtension(), _dec14 = publicExtension(), _dec15 = finalExtension(), _dec16 = publicExtension(), _dec17 = finalExtension(), _dec18 = publicExtension(), _dec19 = finalExtension(), _dec20 = publicExtension(), _dec21 = finalExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(InternalIntentBasedNavigation, _ControllerExtension);
    function InternalIntentBasedNavigation() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = InternalIntentBasedNavigation.prototype;
    _proto.onInit = function onInit() {
      this._oAppComponent = this.base.getAppComponent();
      this._oMetaModel = this._oAppComponent.getModel().getMetaModel();
      this._oNavigationService = this._oAppComponent.getNavigationService();
      this._oView = this.base.getView();
    }

    /**
     * Enables intent-based navigation (SemanticObject-Action) with the provided context.
     * If semantic object mapping is provided, this is also applied to the selection variant after the adaptation by a consumer.
     * This takes care of removing any technical parameters and determines if an explace or inplace navigation should take place.
     *
     * @param sSemanticObject Semantic object for the target app
     * @param sAction  Action for the target app
     * @param [mNavigationParameters] Optional parameters to be passed to the external navigation
     * @param [mNavigationParameters.navigationContexts] Uses one of the following to be passed to the intent:
     *    a single instance of {@link sap.ui.model.odata.v4.Context}
     *    multiple instances of {@link sap.ui.model.odata.v4.Context}
     *    an object or an array of objects
     *		  If an array of objects is passed, the context is used to determine the metaPath and to remove any sensitive data
     *		  If an array of objects is passed, the following format ix expected:
     *		  {
     *			data: {
     *	 			ProductID: 7634,
     *				Name: "Laptop"
     *			 },
     *			 metaPath: "/SalesOrderManage"
     *        }
     * @param [mNavigationParameters.semanticObjectMapping] String representation of the SemanticObjectMapping or SemanticObjectMapping that applies to this navigation
     * @param [mNavigationParameters.defaultRefreshStrategy] Default refresh strategy to be used in case no refresh strategy is specified for the intent in the view.
     * @param [mNavigationParameters.refreshStrategies]
     * @param [mNavigationParameters.additionalNavigationParameters] Additional navigation parameters configured in the crossAppNavigation outbound parameters.
     */;
    _proto.navigate = function navigate(sSemanticObject, sAction, mNavigationParameters) {
      const _doNavigate = oContext => {
        const vNavigationContexts = mNavigationParameters && mNavigationParameters.navigationContexts,
          aNavigationContexts = vNavigationContexts && !Array.isArray(vNavigationContexts) ? [vNavigationContexts] : vNavigationContexts,
          vSemanticObjectMapping = mNavigationParameters && mNavigationParameters.semanticObjectMapping,
          vOutboundParams = mNavigationParameters && mNavigationParameters.additionalNavigationParameters,
          oTargetInfo = {
            semanticObject: sSemanticObject,
            action: sAction
          },
          oView = this.base.getView(),
          oController = oView.getController();
        if (oContext) {
          this._oView.setBindingContext(oContext);
        }
        if (sSemanticObject && sAction) {
          let aSemanticAttributes = [],
            oSelectionVariant = new SelectionVariant();
          // 1. get SemanticAttributes for navigation
          if (aNavigationContexts && aNavigationContexts.length) {
            aNavigationContexts.forEach(oNavigationContext => {
              // 1.1.a if navigation context is instance of sap.ui.mode.odata.v4.Context
              // else check if navigation context is of type object
              if (oNavigationContext.isA && oNavigationContext.isA("sap.ui.model.odata.v4.Context")) {
                // 1.1.b remove sensitive data
                let oSemanticAttributes = oNavigationContext.getObject();
                const sMetaPath = this._oMetaModel.getMetaPath(oNavigationContext.getPath());
                // TODO: also remove sensitive data from  navigation properties
                oSemanticAttributes = this.removeSensitiveData(oSemanticAttributes, sMetaPath);
                const oNavContext = this.prepareContextForExternalNavigation(oSemanticAttributes, oNavigationContext);
                oTargetInfo["propertiesWithoutConflict"] = oNavContext.propertiesWithoutConflict;
                aSemanticAttributes.push(oNavContext.semanticAttributes);
              } else if (!(oNavigationContext && Array.isArray(oNavigationContext.data)) && typeof oNavigationContext === "object") {
                // 1.1.b remove sensitive data from object
                aSemanticAttributes.push(this.removeSensitiveData(oNavigationContext.data, oNavigationContext.metaPath));
              } else if (oNavigationContext && Array.isArray(oNavigationContext.data)) {
                // oNavigationContext.data can be array already ex : [{Customer: "10001"}, {Customer: "10091"}]
                // hence assigning it to the aSemanticAttributes
                aSemanticAttributes = this.removeSensitiveData(oNavigationContext.data, oNavigationContext.metaPath);
              }
            });
          }
          // 2.1 Merge base selection variant and sanitized semantic attributes into one SelectionVariant
          if (aSemanticAttributes && aSemanticAttributes.length) {
            oSelectionVariant = this._oNavigationService.mixAttributesAndSelectionVariant(aSemanticAttributes, oSelectionVariant.toJSONString());
          }

          // 3. Add filterContextUrl to SV so the NavigationHandler can remove any sensitive data based on view entitySet
          const oModel = this._oView.getModel(),
            sEntitySet = this.getEntitySet(),
            sContextUrl = sEntitySet ? this._oNavigationService.constructContextUrl(sEntitySet, oModel) : undefined;
          if (sContextUrl) {
            oSelectionVariant.setFilterContextUrl(sContextUrl);
          }

          // Apply Outbound Parameters to the SV
          if (vOutboundParams) {
            this._applyOutboundParams(oSelectionVariant, vOutboundParams);
          }

          // 4. give an opportunity for the application to influence the SelectionVariant
          oController.intentBasedNavigation.adaptNavigationContext(oSelectionVariant, oTargetInfo);

          // 5. Apply semantic object mappings to the SV
          if (vSemanticObjectMapping) {
            this._applySemanticObjectMappings(oSelectionVariant, vSemanticObjectMapping);
          }

          // 6. remove technical parameters from Selection Variant
          this._removeTechnicalParameters(oSelectionVariant);

          // 7. check if programming model is sticky and page is editable
          const sNavMode = oController._intentBasedNavigation.getNavigationMode();

          // 8. Updating refresh strategy in internal model
          const mRefreshStrategies = mNavigationParameters && mNavigationParameters.refreshStrategies || {},
            oInternalModel = oView.getModel("internal");
          if (oInternalModel) {
            if ((oView && oView.getViewData()).refreshStrategyOnAppRestore) {
              const mViewRefreshStrategies = oView.getViewData().refreshStrategyOnAppRestore || {};
              mergeObjects(mRefreshStrategies, mViewRefreshStrategies);
            }
            const mRefreshStrategy = KeepAliveHelper.getRefreshStrategyForIntent(mRefreshStrategies, sSemanticObject, sAction);
            if (mRefreshStrategy) {
              oInternalModel.setProperty("/refreshStrategyOnAppRestore", mRefreshStrategy);
            }
          }

          // 9. Navigate via NavigationHandler
          const onError = function () {
            sap.ui.require(["sap/m/MessageBox"], function (MessageBox) {
              const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
              MessageBox.error(oResourceBundle.getText("C_COMMON_HELPER_NAVIGATION_ERROR_MESSAGE"), {
                title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR")
              });
            });
          };
          this._oNavigationService.navigate(sSemanticObject, sAction, oSelectionVariant.toJSONString(), undefined, onError, undefined, sNavMode);
        } else {
          throw new Error("Semantic Object/action is not provided");
        }
      };
      const oBindingContext = this.base.getView().getBindingContext();
      const oMetaModel = oBindingContext && oBindingContext.getModel().getMetaModel();
      if (this.getView().getViewData().converterType === "ObjectPage" && oMetaModel && !ModelHelper.isStickySessionSupported(oMetaModel)) {
        draft.processDataLossOrDraftDiscardConfirmation(_doNavigate.bind(this), Function.prototype, this.base.getView().getBindingContext(), this.base.getView().getController(), true, draft.NavigationType.ForwardNavigation);
      } else {
        _doNavigate();
      }
    }

    /**
     * Prepare attributes to be passed to external navigation.
     *
     * @param oSemanticAttributes Context data after removing all sensitive information.
     * @param oContext Actual context from which the semanticAttributes were derived.
     * @returns Object of prepared attributes for external navigation and no conflict properties.
     */;
    _proto.prepareContextForExternalNavigation = function prepareContextForExternalNavigation(oSemanticAttributes, oContext) {
      // 1. Find all distinct keys in the object SemanticAttributes
      // Store meta path for each occurence of the key
      const oDistinctKeys = {},
        sContextPath = oContext.getPath(),
        oMetaModel = oContext.getModel().getMetaModel(),
        sMetaPath = oMetaModel.getMetaPath(sContextPath),
        aMetaPathParts = sMetaPath.split("/").filter(Boolean);
      function _findDistinctKeysInObject(LookUpObject, sLookUpObjectMetaPath) {
        for (const sKey in LookUpObject) {
          // null case??
          if (LookUpObject[sKey] === null || typeof LookUpObject[sKey] !== "object") {
            if (!oDistinctKeys[sKey]) {
              // if key is found for the first time then create array
              oDistinctKeys[sKey] = [];
            }
            // push path to array
            oDistinctKeys[sKey].push(sLookUpObjectMetaPath);
          } else {
            // if a nested object is found
            const oNewLookUpObject = LookUpObject[sKey];
            _findDistinctKeysInObject(oNewLookUpObject, `${sLookUpObjectMetaPath}/${sKey}`);
          }
        }
      }
      _findDistinctKeysInObject(oSemanticAttributes, sMetaPath);

      // 2. Determine distinct key value and add conflicted paths to semantic attributes
      const sMainEntitySetName = aMetaPathParts[0],
        sMainEntityTypeName = oMetaModel.getObject(`/${sMainEntitySetName}/@sapui.name`),
        oPropertiesWithoutConflict = {};
      let sMainEntityValuePath, sCurrentValuePath, sLastValuePath;
      for (const sDistinctKey in oDistinctKeys) {
        const aConflictingPaths = oDistinctKeys[sDistinctKey];
        let sWinnerValuePath;
        // Find winner value for each distinct key in case of conflict by the following rule:

        // -> A. if any meta path for a distinct key is the same as main entity take that as the value
        // -> B. if A is not met keep the value from the current context (sMetaPath === path of distince key)
        // -> C. if A, B or C are not met take the last path for value
        if (aConflictingPaths.length > 1) {
          // conflict
          for (let i = 0; i <= aConflictingPaths.length - 1; i++) {
            const sPath = aConflictingPaths[i];
            let sPathInContext = sPath.replace(sPath === sMetaPath ? sMetaPath : `${sMetaPath}/`, "");
            sPathInContext = (sPathInContext === "" ? sPathInContext : `${sPathInContext}/`) + sDistinctKey;
            const sEntityTypeName = oMetaModel.getObject(`${sPath}/@sapui.name`);
            // rule A

            // rule A
            if (sEntityTypeName === sMainEntityTypeName) {
              sMainEntityValuePath = sPathInContext;
            }

            // rule B
            if (sPath === sMetaPath) {
              sCurrentValuePath = sPathInContext;
            }

            // rule C
            sLastValuePath = sPathInContext;

            // add conflicted path to semantic attributes
            // check if the current path points to main entity and prefix attribute names accordingly
            oSemanticAttributes[`${sMetaPath}/${sPathInContext}`.split("/").filter(function (sValue) {
              return sValue != "";
            }).join(".")] = oContext.getProperty(sPathInContext);
          }
          // A || B || C
          sWinnerValuePath = sMainEntityValuePath || sCurrentValuePath || sLastValuePath;
          oSemanticAttributes[sDistinctKey] = oContext.getProperty(sWinnerValuePath);
          sMainEntityValuePath = undefined;
          sCurrentValuePath = undefined;
          sLastValuePath = undefined;
        } else {
          // no conflict, add distinct key without adding paths
          const sPath = aConflictingPaths[0]; // because there is only one and hence no conflict
          let sPathInContext = sPath.replace(sPath === sMetaPath ? sMetaPath : `${sMetaPath}/`, "");
          sPathInContext = (sPathInContext === "" ? sPathInContext : `${sPathInContext}/`) + sDistinctKey;
          oSemanticAttributes[sDistinctKey] = oContext.getProperty(sPathInContext);
          oPropertiesWithoutConflict[sDistinctKey] = `${sMetaPath}/${sPathInContext}`.split("/").filter(function (sValue) {
            return sValue != "";
          }).join(".");
        }
      }
      // 3. Remove all Navigation properties
      for (const sProperty in oSemanticAttributes) {
        if (oSemanticAttributes[sProperty] !== null && typeof oSemanticAttributes[sProperty] === "object") {
          delete oSemanticAttributes[sProperty];
        }
      }
      return {
        semanticAttributes: oSemanticAttributes,
        propertiesWithoutConflict: oPropertiesWithoutConflict
      };
    }

    /**
     * Prepare filter conditions to be passed to external navigation.
     *
     * @param oFilterBarConditions Filter conditions.
     * @param sRootPath Root path of the application.
     * @param aParameters Names of parameters to be considered.
     * @returns Object of prepared filter conditions for external navigation and no conflict filters.
     */;
    _proto.prepareFiltersForExternalNavigation = function prepareFiltersForExternalNavigation(oFilterBarConditions, sRootPath, aParameters) {
      let sPath;
      const oDistinctKeys = {};
      const oFilterConditionsWithoutConflict = {};
      let sMainEntityValuePath, sCurrentValuePath, sFullContextPath, sWinnerValuePath, sPathInContext;
      function _findDistinctKeysInObject(LookUpObject) {
        let sLookUpObjectMetaPath;
        for (let sKey in LookUpObject) {
          if (LookUpObject[sKey]) {
            if (sKey.includes("/")) {
              sLookUpObjectMetaPath = sKey; // "/SalesOrdermanage/_Item/Material"
              const aPathParts = sKey.split("/");
              sKey = aPathParts[aPathParts.length - 1];
            } else {
              sLookUpObjectMetaPath = sRootPath;
            }
            if (!oDistinctKeys[sKey]) {
              // if key is found for the first time then create array
              oDistinctKeys[sKey] = [];
            }

            // push path to array
            oDistinctKeys[sKey].push(sLookUpObjectMetaPath);
          }
        }
      }
      _findDistinctKeysInObject(oFilterBarConditions);
      for (const sDistinctKey in oDistinctKeys) {
        const aConflictingPaths = oDistinctKeys[sDistinctKey];
        if (aConflictingPaths.length > 1) {
          // conflict
          for (let i = 0; i <= aConflictingPaths.length - 1; i++) {
            sPath = aConflictingPaths[i];
            if (sPath === sRootPath) {
              sFullContextPath = `${sRootPath}/${sDistinctKey}`;
              sPathInContext = sDistinctKey;
              sMainEntityValuePath = sDistinctKey;
              if (aParameters && aParameters.includes(sDistinctKey)) {
                oFilterBarConditions[`$Parameter.${sDistinctKey}`] = oFilterBarConditions[sDistinctKey];
              }
            } else {
              sPathInContext = sPath;
              sFullContextPath = `${sRootPath}/${sPath}`.replaceAll(/\*/g, "");
              sCurrentValuePath = sPath;
            }
            oFilterBarConditions[sFullContextPath.split("/").filter(function (sValue) {
              return sValue != "";
            }).join(".")] = oFilterBarConditions[sPathInContext];
            delete oFilterBarConditions[sPath];
          }
          sWinnerValuePath = sMainEntityValuePath || sCurrentValuePath;
          oFilterBarConditions[sDistinctKey] = oFilterBarConditions[sWinnerValuePath];
        } else {
          // no conflict, add distinct key without adding paths
          sPath = aConflictingPaths[0];
          sFullContextPath = sPath === sRootPath ? `${sRootPath}/${sDistinctKey}` : `${sRootPath}/${sPath}`.replaceAll("*", "");
          oFilterConditionsWithoutConflict[sDistinctKey] = sFullContextPath.split("/").filter(function (sValue) {
            return sValue != "";
          }).join(".");
          if (aParameters && aParameters.includes(sDistinctKey)) {
            oFilterBarConditions[`$Parameter.${sDistinctKey}`] = oFilterBarConditions[sDistinctKey];
          }
        }
      }
      return {
        filterConditions: oFilterBarConditions,
        filterConditionsWithoutConflict: oFilterConditionsWithoutConflict
      };
    }

    /**
     * Get Navigation mode.
     *
     * @returns The navigation mode
     */;
    _proto.getNavigationMode = function getNavigationMode() {
      return undefined;
    }

    /**
     * Allows for navigation to a given intent (SemanticObject-Action) with the provided context, using a dialog that shows the contexts which cannot be passed
     * If semantic object mapping is provided, this setting is also applied to the selection variant after adaptation by a consumer.
     * This setting also removes any technical parameters and determines if an inplace or explace navigation should take place.
     *
     * @param sSemanticObject Semantic object for the target app
     * @param sAction  Action for the target app
     * @param [mNavigationParameters] Optional parameters to be passed to the external navigation
     */;
    _proto.navigateWithConfirmationDialog = async function navigateWithConfirmationDialog(sSemanticObject, sAction, mNavigationParameters) {
      var _mNavigationParameter;
      let shouldContinue = true;
      if (mNavigationParameters !== null && mNavigationParameters !== void 0 && mNavigationParameters.notApplicableContexts && ((_mNavigationParameter = mNavigationParameters.notApplicableContexts) === null || _mNavigationParameter === void 0 ? void 0 : _mNavigationParameter.length) >= 1) {
        const metaModel = this.getView().getModel().getMetaModel();
        const entitySetPath = metaModel.getMetaPath(mNavigationParameters.notApplicableContexts[0].getPath());
        const convertedMetadata = convertTypes(metaModel);
        const entitySet = convertedMetadata.resolvePath(entitySetPath).target;
        // Show the contexts that are not applicable and will not therefore be processed
        const notApplicableContextsDialog = new NotApplicableContextDialog({
          title: "",
          entityType: entitySet.entityType,
          resourceModel: getResourceModel(this.getView()),
          notApplicableContexts: mNavigationParameters.notApplicableContexts
        });
        mNavigationParameters.navigationContexts = mNavigationParameters.applicableContexts;
        shouldContinue = await notApplicableContextsDialog.open(this.getView());
      }
      if (shouldContinue) {
        this.navigate(sSemanticObject, sAction, mNavigationParameters);
      }
    };
    _proto._removeTechnicalParameters = function _removeTechnicalParameters(oSelectionVariant) {
      oSelectionVariant.removeSelectOption("@odata.context");
      oSelectionVariant.removeSelectOption("@odata.metadataEtag");
      oSelectionVariant.removeSelectOption("SAP__Messages");
    }

    /**
     * Get targeted Entity set.
     *
     * @returns Entity set name
     */;
    _proto.getEntitySet = function getEntitySet() {
      return this._oView.getViewData().entitySet;
    }

    /**
     * Removes sensitive data from the semantic attribute with respect to the entitySet.
     *
     * @param oAttributes Context data
     * @param sMetaPath Meta path to reach the entitySet in the MetaModel
     * @returns Array of semantic Attributes
     * @private
     */
    // TO-DO add unit tests for this function in the controller extension qunit.
    ;
    _proto.removeSensitiveData = function removeSensitiveData(oAttributes, sMetaPath) {
      if (oAttributes) {
        const {
          transAggregations,
          customAggregates
        } = this._getAggregates(sMetaPath, this.base.getView(), this.base.getAppComponent().getDiagnostics());
        const aProperties = Object.keys(oAttributes);
        if (aProperties.length) {
          delete oAttributes["@odata.context"];
          delete oAttributes["@odata.metadataEtag"];
          delete oAttributes["SAP__Messages"];
          for (const element of aProperties) {
            if (oAttributes[element] && typeof oAttributes[element] === "object") {
              this.removeSensitiveData(oAttributes[element], `${sMetaPath}/${element}`);
            }
            if (element.indexOf("@odata.type") > -1) {
              delete oAttributes[element];
              continue;
            }
            this._deleteAggregates([...transAggregations, ...customAggregates], element, oAttributes);
            const aPropertyAnnotations = this._getPropertyAnnotations(element, sMetaPath, oAttributes, this._oMetaModel);
            if (aPropertyAnnotations) {
              var _aPropertyAnnotations, _aPropertyAnnotations2, _aPropertyAnnotations3, _aPropertyAnnotations4;
              if ((_aPropertyAnnotations = aPropertyAnnotations.PersonalData) !== null && _aPropertyAnnotations !== void 0 && _aPropertyAnnotations.IsPotentiallySensitive || (_aPropertyAnnotations2 = aPropertyAnnotations.UI) !== null && _aPropertyAnnotations2 !== void 0 && _aPropertyAnnotations2.ExcludeFromNavigationContext || (_aPropertyAnnotations3 = aPropertyAnnotations.Analytics) !== null && _aPropertyAnnotations3 !== void 0 && _aPropertyAnnotations3.Measure) {
                delete oAttributes[element];
              } else if ((_aPropertyAnnotations4 = aPropertyAnnotations.Common) !== null && _aPropertyAnnotations4 !== void 0 && _aPropertyAnnotations4.FieldControl) {
                const oFieldControl = aPropertyAnnotations.Common.FieldControl;
                if (oFieldControl["$EnumMember"] && oFieldControl["$EnumMember"].split("/")[1] === "Inapplicable" || oFieldControl["$Path"] && this._isFieldControlPathInapplicable(oFieldControl["$Path"], oAttributes)) {
                  delete oAttributes[element];
                }
              }
            }
          }
        }
      }
      return oAttributes;
    }

    /**
     * Remove the attribute from navigation data if it is a measure.
     *
     * @param aggregates Array of Aggregates
     * @param sProp Attribute name
     * @param oAttributes SemanticAttributes
     */;
    _proto._deleteAggregates = function _deleteAggregates(aggregates, sProp, oAttributes) {
      if (aggregates && aggregates.indexOf(sProp) > -1) {
        delete oAttributes[sProp];
      }
    }

    /**
     * Returns the property annotations.
     *
     * @param sProp
     * @param sMetaPath
     * @param oAttributes
     * @param oMetaModel
     * @returns - The property annotations
     */;
    _proto._getPropertyAnnotations = function _getPropertyAnnotations(sProp, sMetaPath, oAttributes, oMetaModel) {
      if (oAttributes[sProp] && sMetaPath && !sMetaPath.includes("undefined")) {
        var _oFullContext$targetO;
        const oContext = oMetaModel.createBindingContext(`${sMetaPath}/${sProp}`);
        const oFullContext = MetaModelConverter.getInvolvedDataModelObjects(oContext);
        return oFullContext === null || oFullContext === void 0 ? void 0 : (_oFullContext$targetO = oFullContext.targetObject) === null || _oFullContext$targetO === void 0 ? void 0 : _oFullContext$targetO.annotations;
      }
      return null;
    }

    /**
     * Returns the aggregates part of the EntitySet or EntityType.
     *
     * @param sMetaPath
     * @param oView
     * @param oDiagnostics
     * @returns - The aggregates
     */;
    _proto._getAggregates = function _getAggregates(sMetaPath, oView, oDiagnostics) {
      const converterContext = this._getConverterContext(sMetaPath, oView, oDiagnostics);
      const aggregationHelper = new AggregationHelper(converterContext.getEntityType(), converterContext);
      const isAnalyticsSupported = aggregationHelper.isAnalyticsSupported();
      let transAggregations, customAggregates;
      if (isAnalyticsSupported) {
        var _transAggregations, _customAggregates;
        transAggregations = aggregationHelper.getTransAggregations();
        if ((_transAggregations = transAggregations) !== null && _transAggregations !== void 0 && _transAggregations.length) {
          transAggregations = transAggregations.map(transAgg => {
            return transAgg.Name || transAgg.Value;
          });
        }
        customAggregates = aggregationHelper.getCustomAggregateDefinitions();
        if ((_customAggregates = customAggregates) !== null && _customAggregates !== void 0 && _customAggregates.length) {
          customAggregates = customAggregates.map(customAggregate => {
            return customAggregate.qualifier;
          });
        }
      }
      transAggregations = transAggregations ? transAggregations : [];
      customAggregates = customAggregates ? customAggregates : [];
      return {
        transAggregations,
        customAggregates
      };
    }

    /**
     * Returns converterContext.
     *
     * @param sMetaPath
     * @param oView
     * @param oDiagnostics
     * @returns - ConverterContext
     */;
    _proto._getConverterContext = function _getConverterContext(sMetaPath, oView, oDiagnostics) {
      const oViewData = oView.getViewData();
      let sEntitySet = oViewData.entitySet;
      const sContextPath = oViewData.contextPath;
      if (sContextPath && (!sEntitySet || sEntitySet.includes("/"))) {
        sEntitySet = oViewData === null || oViewData === void 0 ? void 0 : oViewData.fullContextPath.split("/")[1];
      }
      return CommonUtils.getConverterContextForPath(sMetaPath, oView.getModel().getMetaModel(), sEntitySet, oDiagnostics);
    }

    /**
     * Check if path-based FieldControl evaluates to inapplicable.
     *
     * @param sFieldControlPath Field control path
     * @param oAttribute SemanticAttributes
     * @returns `true` if inapplicable
     */;
    _proto._isFieldControlPathInapplicable = function _isFieldControlPathInapplicable(sFieldControlPath, oAttribute) {
      let bInapplicable = false;
      const aParts = sFieldControlPath.split("/");
      // sensitive data is removed only if the path has already been resolved.
      if (aParts.length > 1) {
        bInapplicable = oAttribute[aParts[0]] && oAttribute[aParts[0]].hasOwnProperty(aParts[1]) && oAttribute[aParts[0]][aParts[1]] === 0;
      } else {
        bInapplicable = oAttribute[sFieldControlPath] === 0;
      }
      return bInapplicable;
    }

    /**
     * Method to replace Local Properties with Semantic Object mappings.
     *
     * @param oSelectionVariant SelectionVariant consisting of filterbar, Table and Page Context
     * @param vMappings A string representation of semantic object mapping
     * @returns - Modified SelectionVariant with LocalProperty replaced with SemanticObjectProperties.
     */;
    _proto._applySemanticObjectMappings = function _applySemanticObjectMappings(oSelectionVariant, vMappings) {
      const oMappings = typeof vMappings === "string" ? JSON.parse(vMappings) : vMappings;
      for (let i = 0; i < oMappings.length; i++) {
        const sLocalProperty = oMappings[i]["LocalProperty"] && oMappings[i]["LocalProperty"]["$PropertyPath"] || oMappings[i]["@com.sap.vocabularies.Common.v1.LocalProperty"] && oMappings[i]["@com.sap.vocabularies.Common.v1.LocalProperty"]["$Path"];
        const sSemanticObjectProperty = oMappings[i]["SemanticObjectProperty"] || oMappings[i]["@com.sap.vocabularies.Common.v1.SemanticObjectProperty"];
        const oSelectOption = oSelectionVariant.getSelectOption(sLocalProperty);
        if (oSelectOption) {
          //Create a new SelectOption with sSemanticObjectProperty as the property Name and remove the older one
          oSelectionVariant.removeSelectOption(sLocalProperty);
          oSelectionVariant.massAddSelectOption(sSemanticObjectProperty, oSelectOption);
        }
      }
      return oSelectionVariant;
    }

    /**
     * Navigates to an Outbound provided in the manifest.
     *
     * @function
     * @param sOutbound Identifier to location the outbound in the manifest
     * @param mNavigationParameters Optional map containing key/value pairs to be passed to the intent
     * @alias sap.fe.core.controllerextensions.IntentBasedNavigation#navigateOutbound
     * @since 1.86.0
     */;
    _proto.navigateOutbound = function navigateOutbound(sOutbound, mNavigationParameters) {
      var _oManifestEntry$cross, _oManifestEntry$cross2;
      let aNavParams;
      const oManifestEntry = this.base.getAppComponent().getManifestEntry("sap.app"),
        oOutbound = (_oManifestEntry$cross = oManifestEntry.crossNavigation) === null || _oManifestEntry$cross === void 0 ? void 0 : (_oManifestEntry$cross2 = _oManifestEntry$cross.outbounds) === null || _oManifestEntry$cross2 === void 0 ? void 0 : _oManifestEntry$cross2[sOutbound];
      if (!oOutbound) {
        Log.error("Outbound is not defined in manifest!!");
        return;
      }
      const sSemanticObject = oOutbound.semanticObject,
        sAction = oOutbound.action,
        outboundParams = oOutbound.parameters && this.getOutboundParams(oOutbound.parameters);
      if (mNavigationParameters) {
        aNavParams = [];
        Object.keys(mNavigationParameters).forEach(function (key) {
          let oParams;
          if (Array.isArray(mNavigationParameters[key])) {
            const aValues = mNavigationParameters[key];
            for (let i = 0; i < aValues.length; i++) {
              var _aNavParams;
              oParams = {};
              oParams[key] = aValues[i];
              (_aNavParams = aNavParams) === null || _aNavParams === void 0 ? void 0 : _aNavParams.push(oParams);
            }
          } else {
            var _aNavParams2;
            oParams = {};
            oParams[key] = mNavigationParameters[key];
            (_aNavParams2 = aNavParams) === null || _aNavParams2 === void 0 ? void 0 : _aNavParams2.push(oParams);
          }
        });
      }
      if (aNavParams || outboundParams) {
        mNavigationParameters = {
          navigationContexts: {
            data: aNavParams || outboundParams
          }
        };
      }
      this.base._intentBasedNavigation.navigate(sSemanticObject, sAction, mNavigationParameters);
    }

    /**
     * Method to apply outbound parameters defined in the manifest.
     *
     * @param oSelectionVariant SelectionVariant consisting of a filter bar, a table, and a page context
     * @param vOutboundParams Outbound Properties defined in the manifest
     * @returns - The modified SelectionVariant with outbound parameters.
     */;
    _proto._applyOutboundParams = function _applyOutboundParams(oSelectionVariant, vOutboundParams) {
      const aParameters = Object.keys(vOutboundParams);
      const aSelectProperties = oSelectionVariant.getSelectOptionsPropertyNames();
      aParameters.forEach(function (key) {
        if (!aSelectProperties.includes(key)) {
          oSelectionVariant.addSelectOption(key, "I", "EQ", vOutboundParams[key]);
        }
      });
      return oSelectionVariant;
    }

    /**
     * Method to get the outbound parameters defined in the manifest.
     *
     * @function
     * @param oOutboundParams Parameters defined in the outbounds. Only "plain" is supported
     * @returns Parameters with the key-Value pair
     */;
    _proto.getOutboundParams = function getOutboundParams(oOutboundParams) {
      const oParamsMapping = {};
      if (oOutboundParams) {
        const aParameters = Object.keys(oOutboundParams) || [];
        if (aParameters.length > 0) {
          aParameters.forEach(function (key) {
            const oMapping = oOutboundParams[key];
            if (oMapping.value && oMapping.value.value && oMapping.value.format === "plain") {
              if (!oParamsMapping[key]) {
                oParamsMapping[key] = oMapping.value.value;
              }
            }
          });
        }
      }
      return oParamsMapping;
    }

    /**
     * Triggers an outbound navigation when a user chooses the chevron.
     *
     * @param {object} oController
     * @param {string} sOutboundTarget Name of the outbound target (needs to be defined in the manifest)
     * @param {sap.ui.model.odata.v4.Context} oContext The context that contains the data for the target app
     * @param {string} sCreatePath Create path when the chevron is created.
     * @returns {Promise} Promise which is resolved once the navigation is triggered
     */;
    _proto.onChevronPressNavigateOutBound = function onChevronPressNavigateOutBound(oController, sOutboundTarget, oContext, sCreatePath) {
      const oOutbounds = oController.getAppComponent().getRoutingService().getOutbounds();
      const oDisplayOutbound = oOutbounds[sOutboundTarget];
      let additionalNavigationParameters;
      if (oDisplayOutbound && oDisplayOutbound.semanticObject && oDisplayOutbound.action) {
        const oRefreshStrategies = {
          intents: {}
        };
        const oDefaultRefreshStrategy = {};
        let sMetaPath;
        if (oContext) {
          if (oContext.isA && oContext.isA("sap.ui.model.odata.v4.Context")) {
            sMetaPath = ModelHelper.getMetaPathForContext(oContext);
            oContext = [oContext];
          } else {
            sMetaPath = ModelHelper.getMetaPathForContext(oContext[0]);
          }
          oDefaultRefreshStrategy[sMetaPath] = "self";
          oRefreshStrategies["_feDefault"] = oDefaultRefreshStrategy;
        }
        if (sCreatePath) {
          const sKey = `${oDisplayOutbound.semanticObject}-${oDisplayOutbound.action}`;
          oRefreshStrategies.intents[sKey] = {};
          oRefreshStrategies.intents[sKey][sCreatePath] = "self";
        }
        if (oDisplayOutbound && oDisplayOutbound.parameters) {
          const oParams = oDisplayOutbound.parameters && this.getOutboundParams(oDisplayOutbound.parameters);
          if (Object.keys(oParams).length > 0) {
            additionalNavigationParameters = oParams;
          }
        }
        oController._intentBasedNavigation.navigate(oDisplayOutbound.semanticObject, oDisplayOutbound.action, {
          navigationContexts: oContext,
          refreshStrategies: oRefreshStrategies,
          additionalNavigationParameters: additionalNavigationParameters
        });

        //TODO: check why returning a promise is required
        return Promise.resolve();
      } else {
        throw new Error(`outbound target ${sOutboundTarget} not found in cross navigation definition of manifest`);
      }
    };
    return InternalIntentBasedNavigation;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigate", [_dec3, _dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "navigate"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "prepareContextForExternalNavigation", [_dec5, _dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "prepareContextForExternalNavigation"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "prepareFiltersForExternalNavigation", [_dec7, _dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "prepareFiltersForExternalNavigation"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getNavigationMode", [_dec9, _dec10], Object.getOwnPropertyDescriptor(_class2.prototype, "getNavigationMode"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateWithConfirmationDialog", [_dec11, _dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateWithConfirmationDialog"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getEntitySet", [_dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "getEntitySet"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "removeSensitiveData", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "removeSensitiveData"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateOutbound", [_dec16, _dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateOutbound"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getOutboundParams", [_dec18, _dec19], Object.getOwnPropertyDescriptor(_class2.prototype, "getOutboundParams"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onChevronPressNavigateOutBound", [_dec20, _dec21], Object.getOwnPropertyDescriptor(_class2.prototype, "onChevronPressNavigateOutBound"), _class2.prototype)), _class2)) || _class);
  return InternalIntentBasedNavigation;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbiIsImRlZmluZVVJNUNsYXNzIiwibWV0aG9kT3ZlcnJpZGUiLCJwdWJsaWNFeHRlbnNpb24iLCJmaW5hbEV4dGVuc2lvbiIsImV4dGVuc2libGUiLCJPdmVycmlkZUV4ZWN1dGlvbiIsIkluc3RlYWQiLCJwcml2YXRlRXh0ZW5zaW9uIiwib25Jbml0IiwiX29BcHBDb21wb25lbnQiLCJiYXNlIiwiZ2V0QXBwQ29tcG9uZW50IiwiX29NZXRhTW9kZWwiLCJnZXRNb2RlbCIsImdldE1ldGFNb2RlbCIsIl9vTmF2aWdhdGlvblNlcnZpY2UiLCJnZXROYXZpZ2F0aW9uU2VydmljZSIsIl9vVmlldyIsImdldFZpZXciLCJuYXZpZ2F0ZSIsInNTZW1hbnRpY09iamVjdCIsInNBY3Rpb24iLCJtTmF2aWdhdGlvblBhcmFtZXRlcnMiLCJfZG9OYXZpZ2F0ZSIsIm9Db250ZXh0Iiwidk5hdmlnYXRpb25Db250ZXh0cyIsIm5hdmlnYXRpb25Db250ZXh0cyIsImFOYXZpZ2F0aW9uQ29udGV4dHMiLCJBcnJheSIsImlzQXJyYXkiLCJ2U2VtYW50aWNPYmplY3RNYXBwaW5nIiwic2VtYW50aWNPYmplY3RNYXBwaW5nIiwidk91dGJvdW5kUGFyYW1zIiwiYWRkaXRpb25hbE5hdmlnYXRpb25QYXJhbWV0ZXJzIiwib1RhcmdldEluZm8iLCJzZW1hbnRpY09iamVjdCIsImFjdGlvbiIsIm9WaWV3Iiwib0NvbnRyb2xsZXIiLCJnZXRDb250cm9sbGVyIiwic2V0QmluZGluZ0NvbnRleHQiLCJhU2VtYW50aWNBdHRyaWJ1dGVzIiwib1NlbGVjdGlvblZhcmlhbnQiLCJTZWxlY3Rpb25WYXJpYW50IiwibGVuZ3RoIiwiZm9yRWFjaCIsIm9OYXZpZ2F0aW9uQ29udGV4dCIsImlzQSIsIm9TZW1hbnRpY0F0dHJpYnV0ZXMiLCJnZXRPYmplY3QiLCJzTWV0YVBhdGgiLCJnZXRNZXRhUGF0aCIsImdldFBhdGgiLCJyZW1vdmVTZW5zaXRpdmVEYXRhIiwib05hdkNvbnRleHQiLCJwcmVwYXJlQ29udGV4dEZvckV4dGVybmFsTmF2aWdhdGlvbiIsInByb3BlcnRpZXNXaXRob3V0Q29uZmxpY3QiLCJwdXNoIiwic2VtYW50aWNBdHRyaWJ1dGVzIiwiZGF0YSIsIm1ldGFQYXRoIiwibWl4QXR0cmlidXRlc0FuZFNlbGVjdGlvblZhcmlhbnQiLCJ0b0pTT05TdHJpbmciLCJvTW9kZWwiLCJzRW50aXR5U2V0IiwiZ2V0RW50aXR5U2V0Iiwic0NvbnRleHRVcmwiLCJjb25zdHJ1Y3RDb250ZXh0VXJsIiwidW5kZWZpbmVkIiwic2V0RmlsdGVyQ29udGV4dFVybCIsIl9hcHBseU91dGJvdW5kUGFyYW1zIiwiaW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiYWRhcHROYXZpZ2F0aW9uQ29udGV4dCIsIl9hcHBseVNlbWFudGljT2JqZWN0TWFwcGluZ3MiLCJfcmVtb3ZlVGVjaG5pY2FsUGFyYW1ldGVycyIsInNOYXZNb2RlIiwiX2ludGVudEJhc2VkTmF2aWdhdGlvbiIsImdldE5hdmlnYXRpb25Nb2RlIiwibVJlZnJlc2hTdHJhdGVnaWVzIiwicmVmcmVzaFN0cmF0ZWdpZXMiLCJvSW50ZXJuYWxNb2RlbCIsImdldFZpZXdEYXRhIiwicmVmcmVzaFN0cmF0ZWd5T25BcHBSZXN0b3JlIiwibVZpZXdSZWZyZXNoU3RyYXRlZ2llcyIsIm1lcmdlT2JqZWN0cyIsIm1SZWZyZXNoU3RyYXRlZ3kiLCJLZWVwQWxpdmVIZWxwZXIiLCJnZXRSZWZyZXNoU3RyYXRlZ3lGb3JJbnRlbnQiLCJzZXRQcm9wZXJ0eSIsIm9uRXJyb3IiLCJzYXAiLCJ1aSIsInJlcXVpcmUiLCJNZXNzYWdlQm94Iiwib1Jlc291cmNlQnVuZGxlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsImVycm9yIiwiZ2V0VGV4dCIsInRpdGxlIiwiRXJyb3IiLCJvQmluZGluZ0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsIm9NZXRhTW9kZWwiLCJjb252ZXJ0ZXJUeXBlIiwiTW9kZWxIZWxwZXIiLCJpc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQiLCJkcmFmdCIsInByb2Nlc3NEYXRhTG9zc09yRHJhZnREaXNjYXJkQ29uZmlybWF0aW9uIiwiYmluZCIsIkZ1bmN0aW9uIiwicHJvdG90eXBlIiwiTmF2aWdhdGlvblR5cGUiLCJGb3J3YXJkTmF2aWdhdGlvbiIsIm9EaXN0aW5jdEtleXMiLCJzQ29udGV4dFBhdGgiLCJhTWV0YVBhdGhQYXJ0cyIsInNwbGl0IiwiZmlsdGVyIiwiQm9vbGVhbiIsIl9maW5kRGlzdGluY3RLZXlzSW5PYmplY3QiLCJMb29rVXBPYmplY3QiLCJzTG9va1VwT2JqZWN0TWV0YVBhdGgiLCJzS2V5Iiwib05ld0xvb2tVcE9iamVjdCIsInNNYWluRW50aXR5U2V0TmFtZSIsInNNYWluRW50aXR5VHlwZU5hbWUiLCJvUHJvcGVydGllc1dpdGhvdXRDb25mbGljdCIsInNNYWluRW50aXR5VmFsdWVQYXRoIiwic0N1cnJlbnRWYWx1ZVBhdGgiLCJzTGFzdFZhbHVlUGF0aCIsInNEaXN0aW5jdEtleSIsImFDb25mbGljdGluZ1BhdGhzIiwic1dpbm5lclZhbHVlUGF0aCIsImkiLCJzUGF0aCIsInNQYXRoSW5Db250ZXh0IiwicmVwbGFjZSIsInNFbnRpdHlUeXBlTmFtZSIsInNWYWx1ZSIsImpvaW4iLCJnZXRQcm9wZXJ0eSIsInNQcm9wZXJ0eSIsInByZXBhcmVGaWx0ZXJzRm9yRXh0ZXJuYWxOYXZpZ2F0aW9uIiwib0ZpbHRlckJhckNvbmRpdGlvbnMiLCJzUm9vdFBhdGgiLCJhUGFyYW1ldGVycyIsIm9GaWx0ZXJDb25kaXRpb25zV2l0aG91dENvbmZsaWN0Iiwic0Z1bGxDb250ZXh0UGF0aCIsImluY2x1ZGVzIiwiYVBhdGhQYXJ0cyIsInJlcGxhY2VBbGwiLCJmaWx0ZXJDb25kaXRpb25zIiwiZmlsdGVyQ29uZGl0aW9uc1dpdGhvdXRDb25mbGljdCIsIm5hdmlnYXRlV2l0aENvbmZpcm1hdGlvbkRpYWxvZyIsInNob3VsZENvbnRpbnVlIiwibm90QXBwbGljYWJsZUNvbnRleHRzIiwibWV0YU1vZGVsIiwiZW50aXR5U2V0UGF0aCIsImNvbnZlcnRlZE1ldGFkYXRhIiwiY29udmVydFR5cGVzIiwiZW50aXR5U2V0IiwicmVzb2x2ZVBhdGgiLCJ0YXJnZXQiLCJub3RBcHBsaWNhYmxlQ29udGV4dHNEaWFsb2ciLCJOb3RBcHBsaWNhYmxlQ29udGV4dERpYWxvZyIsImVudGl0eVR5cGUiLCJyZXNvdXJjZU1vZGVsIiwiZ2V0UmVzb3VyY2VNb2RlbCIsImFwcGxpY2FibGVDb250ZXh0cyIsIm9wZW4iLCJyZW1vdmVTZWxlY3RPcHRpb24iLCJvQXR0cmlidXRlcyIsInRyYW5zQWdncmVnYXRpb25zIiwiY3VzdG9tQWdncmVnYXRlcyIsIl9nZXRBZ2dyZWdhdGVzIiwiZ2V0RGlhZ25vc3RpY3MiLCJhUHJvcGVydGllcyIsIk9iamVjdCIsImtleXMiLCJlbGVtZW50IiwiaW5kZXhPZiIsIl9kZWxldGVBZ2dyZWdhdGVzIiwiYVByb3BlcnR5QW5ub3RhdGlvbnMiLCJfZ2V0UHJvcGVydHlBbm5vdGF0aW9ucyIsIlBlcnNvbmFsRGF0YSIsIklzUG90ZW50aWFsbHlTZW5zaXRpdmUiLCJVSSIsIkV4Y2x1ZGVGcm9tTmF2aWdhdGlvbkNvbnRleHQiLCJBbmFseXRpY3MiLCJNZWFzdXJlIiwiQ29tbW9uIiwiRmllbGRDb250cm9sIiwib0ZpZWxkQ29udHJvbCIsIl9pc0ZpZWxkQ29udHJvbFBhdGhJbmFwcGxpY2FibGUiLCJhZ2dyZWdhdGVzIiwic1Byb3AiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsIm9GdWxsQ29udGV4dCIsIk1ldGFNb2RlbENvbnZlcnRlciIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsInRhcmdldE9iamVjdCIsImFubm90YXRpb25zIiwib0RpYWdub3N0aWNzIiwiY29udmVydGVyQ29udGV4dCIsIl9nZXRDb252ZXJ0ZXJDb250ZXh0IiwiYWdncmVnYXRpb25IZWxwZXIiLCJBZ2dyZWdhdGlvbkhlbHBlciIsImdldEVudGl0eVR5cGUiLCJpc0FuYWx5dGljc1N1cHBvcnRlZCIsImdldFRyYW5zQWdncmVnYXRpb25zIiwibWFwIiwidHJhbnNBZ2ciLCJOYW1lIiwiVmFsdWUiLCJnZXRDdXN0b21BZ2dyZWdhdGVEZWZpbml0aW9ucyIsImN1c3RvbUFnZ3JlZ2F0ZSIsInF1YWxpZmllciIsIm9WaWV3RGF0YSIsImNvbnRleHRQYXRoIiwiZnVsbENvbnRleHRQYXRoIiwiQ29tbW9uVXRpbHMiLCJnZXRDb252ZXJ0ZXJDb250ZXh0Rm9yUGF0aCIsInNGaWVsZENvbnRyb2xQYXRoIiwib0F0dHJpYnV0ZSIsImJJbmFwcGxpY2FibGUiLCJhUGFydHMiLCJoYXNPd25Qcm9wZXJ0eSIsInZNYXBwaW5ncyIsIm9NYXBwaW5ncyIsIkpTT04iLCJwYXJzZSIsInNMb2NhbFByb3BlcnR5Iiwic1NlbWFudGljT2JqZWN0UHJvcGVydHkiLCJvU2VsZWN0T3B0aW9uIiwiZ2V0U2VsZWN0T3B0aW9uIiwibWFzc0FkZFNlbGVjdE9wdGlvbiIsIm5hdmlnYXRlT3V0Ym91bmQiLCJzT3V0Ym91bmQiLCJhTmF2UGFyYW1zIiwib01hbmlmZXN0RW50cnkiLCJnZXRNYW5pZmVzdEVudHJ5Iiwib091dGJvdW5kIiwiY3Jvc3NOYXZpZ2F0aW9uIiwib3V0Ym91bmRzIiwiTG9nIiwib3V0Ym91bmRQYXJhbXMiLCJwYXJhbWV0ZXJzIiwiZ2V0T3V0Ym91bmRQYXJhbXMiLCJrZXkiLCJvUGFyYW1zIiwiYVZhbHVlcyIsImFTZWxlY3RQcm9wZXJ0aWVzIiwiZ2V0U2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMiLCJhZGRTZWxlY3RPcHRpb24iLCJvT3V0Ym91bmRQYXJhbXMiLCJvUGFyYW1zTWFwcGluZyIsIm9NYXBwaW5nIiwidmFsdWUiLCJmb3JtYXQiLCJvbkNoZXZyb25QcmVzc05hdmlnYXRlT3V0Qm91bmQiLCJzT3V0Ym91bmRUYXJnZXQiLCJzQ3JlYXRlUGF0aCIsIm9PdXRib3VuZHMiLCJnZXRSb3V0aW5nU2VydmljZSIsImdldE91dGJvdW5kcyIsIm9EaXNwbGF5T3V0Ym91bmQiLCJvUmVmcmVzaFN0cmF0ZWdpZXMiLCJpbnRlbnRzIiwib0RlZmF1bHRSZWZyZXNoU3RyYXRlZ3kiLCJnZXRNZXRhUGF0aEZvckNvbnRleHQiLCJQcm9taXNlIiwicmVzb2x2ZSIsIkNvbnRyb2xsZXJFeHRlbnNpb24iXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkludGVybmFsSW50ZW50QmFzZWROYXZpZ2F0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVudGl0eVNldCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0eUFubm90YXRpb25zIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9FZG1fVHlwZXNcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IG1lcmdlT2JqZWN0cyBmcm9tIFwic2FwL2Jhc2UvdXRpbC9tZXJnZVwiO1xuaW1wb3J0IHR5cGUgQXBwQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9BcHBDb21wb25lbnRcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBkcmFmdCBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvZWRpdEZsb3cvZHJhZnRcIjtcbmltcG9ydCAqIGFzIE1ldGFNb2RlbENvbnZlcnRlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB7IGNvbnZlcnRUeXBlcyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHtcblx0ZGVmaW5lVUk1Q2xhc3MsXG5cdGV4dGVuc2libGUsXG5cdGZpbmFsRXh0ZW5zaW9uLFxuXHRtZXRob2RPdmVycmlkZSxcblx0cHJpdmF0ZUV4dGVuc2lvbixcblx0cHVibGljRXh0ZW5zaW9uXG59IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IEtlZXBBbGl2ZUhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9LZWVwQWxpdmVIZWxwZXJcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0UmVzb3VyY2VNb2RlbCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1Jlc291cmNlTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB0eXBlIFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IHR5cGUgeyBOYXZpZ2F0aW9uU2VydmljZSB9IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9OYXZpZ2F0aW9uU2VydmljZUZhY3RvcnlcIjtcbmltcG9ydCB0eXBlIERpYWdub3N0aWNzIGZyb20gXCJzYXAvZmUvY29yZS9zdXBwb3J0L0RpYWdub3N0aWNzXCI7XG5pbXBvcnQgU2VsZWN0aW9uVmFyaWFudCBmcm9tIFwic2FwL2ZlL25hdmlnYXRpb24vU2VsZWN0aW9uVmFyaWFudFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBDb250cm9sbGVyRXh0ZW5zaW9uIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvQ29udHJvbGxlckV4dGVuc2lvblwiO1xuaW1wb3J0IE92ZXJyaWRlRXhlY3V0aW9uIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvT3ZlcnJpZGVFeGVjdXRpb25cIjtcbmltcG9ydCB0eXBlIFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9WaWV3XCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgdHlwZSBPRGF0YVY0Q29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCB7IEFnZ3JlZ2F0aW9uSGVscGVyIH0gZnJvbSBcIi4uL2NvbnZlcnRlcnMvaGVscGVycy9BZ2dyZWdhdGlvblwiO1xuaW1wb3J0IE5vdEFwcGxpY2FibGVDb250ZXh0RGlhbG9nIGZyb20gXCIuL2VkaXRGbG93L05vdEFwcGxpY2FibGVDb250ZXh0RGlhbG9nXCI7XG5cbi8qKlxuICogTmF2aWdhdGlvbiBQYXJhbWV0ZXJzIHVzZWQgZHVyaW5nIG5hdmlnYXRpb25cbiAqL1xuZXhwb3J0IHR5cGUgTmF2aWdhdGlvblBhcmFtZXRlcnMgPSB7XG5cdC8qKlxuXHQgKiBTaW5nbGUgaW5zdGFuY2Ugb3IgbXVsdGlwbGUgaW5zdGFuY2VzIG9mIHtAbGluayBzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dH0sIG9yIGFsdGVybmF0aXZlbHkgYW4gb2JqZWN0IG9yIGFycmF5IG9mIG9iamVjdHMsIHRvIGJlIHBhc3NlZCB0byB0aGUgaW50ZW50LlxuXHQgKi9cblx0bmF2aWdhdGlvbkNvbnRleHRzPzogb2JqZWN0IHwgYW55W10gfCB1bmRlZmluZWQ7XG5cdC8qKlxuXHQgKiBTdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgU2VtYW50aWNPYmplY3RNYXBwaW5nIG9yIFNlbWFudGljT2JqZWN0TWFwcGluZyB0aGF0IGFwcGxpZXMgdG8gdGhpcyBuYXZpZ2F0aW9uLlxuXHQgKi9cblx0c2VtYW50aWNPYmplY3RNYXBwaW5nPzogc3RyaW5nIHwgb2JqZWN0IHwgdW5kZWZpbmVkO1xuXHRkZWZhdWx0UmVmcmVzaFN0cmF0ZWd5Pzogb2JqZWN0IHwgdW5kZWZpbmVkO1xuXHRyZWZyZXNoU3RyYXRlZ2llcz86IGFueTtcblx0YWRkaXRpb25hbE5hdmlnYXRpb25QYXJhbWV0ZXJzPzogb2JqZWN0IHwgdW5kZWZpbmVkO1xuXHQvKipcblx0ICogU2luZ2xlIGluc3RhbmNlIG9yIG11bHRpcGxlIGluc3RhbmNlcyBvZiB7QGxpbmsgc2FwLnVpLm1vZGVsLm9kYXRhLnY0LkNvbnRleHR9LCBvciBhbHRlcm5hdGl2ZWx5IGFuIG9iamVjdCBvciBhcnJheSBvZiBvYmplY3RzLCB0byBiZSBwYXNzZWQgdG8gdGhlIGludGVudCBhbmQgZm9yIHdoaWNoIHRoZSBJQk4gYnV0dG9uIGlzIGVuYWJsZWRcblx0ICovXG5cdGFwcGxpY2FibGVDb250ZXh0cz86IG9iamVjdCB8IGFueVtdO1xuXHQvKipcblx0ICogU2luZ2xlIGluc3RhbmNlIG9yIG11bHRpcGxlIGluc3RhbmNlcyBvZiB7QGxpbmsgc2FwLnVpLm1vZGVsLm9kYXRhLnY0LkNvbnRleHR9LCBvciBhbHRlcm5hdGl2ZWx5IGFuIG9iamVjdCBvciBhcnJheSBvZiBvYmplY3RzLCB3aGljaCBjYW5ub3QgYmUgcGFzc2VkIHRvIHRoZSBpbnRlbnQuXG5cdCAqIFx0aWYgYW4gYXJyYXkgb2YgY29udGV4dHMgaXMgcGFzc2VkIHRoZSBjb250ZXh0IGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBtZXRhIHBhdGggYW5kIGFjY29yZGluZ2x5IHJlbW92ZSB0aGUgc2Vuc2l0aXZlIGRhdGFcblx0ICogSWYgYW4gYXJyYXkgb2Ygb2JqZWN0cyBpcyBwYXNzZWQsIHRoZSBmb2xsb3dpbmcgZm9ybWF0IGlzIGV4cGVjdGVkOlxuXHQgKiB7XG5cdCAqIFx0ZGF0YToge1xuXHQgKiBcdFx0UHJvZHVjdElEOiA3NjM0LFxuXHQgKiBcdFx0XHROYW1lOiBcIkxhcHRvcFwiXG5cdCAqIFx0fSxcblx0ICogXHRtZXRhUGF0aDogXCIvU2FsZXNPcmRlck1hbmFnZVwiXG5cdCAqIH1cblx0ICogVGhlIG1ldGFQYXRoIGlzIHVzZWQgdG8gcmVtb3ZlIGFueSBzZW5zaXRpdmUgZGF0YS5cblx0ICovXG5cdG5vdEFwcGxpY2FibGVDb250ZXh0cz86IGFueTtcblxuXHRsYWJlbD86IHN0cmluZztcbn07XG4vKipcbiAqIHtAbGluayBzYXAudWkuY29yZS5tdmMuQ29udHJvbGxlckV4dGVuc2lvbiBDb250cm9sbGVyIGV4dGVuc2lvbn1cbiAqXG4gKiBAbmFtZXNwYWNlXG4gKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuSW50ZXJuYWxJbnRlcm5hbEJhc2VkTmF2aWdhdGlvblxuICogQHByaXZhdGVcbiAqIEBzaW5jZSAxLjg0LjBcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuSW50ZXJuYWxJbnRlcm5hbEJhc2VkTmF2aWdhdGlvblwiKVxuY2xhc3MgSW50ZXJuYWxJbnRlbnRCYXNlZE5hdmlnYXRpb24gZXh0ZW5kcyBDb250cm9sbGVyRXh0ZW5zaW9uIHtcblx0cHJvdGVjdGVkIGJhc2UhOiBQYWdlQ29udHJvbGxlcjtcblxuXHRwcml2YXRlIF9vQXBwQ29tcG9uZW50ITogQXBwQ29tcG9uZW50O1xuXG5cdHByaXZhdGUgX29NZXRhTW9kZWwhOiBPRGF0YU1ldGFNb2RlbDtcblxuXHRwcml2YXRlIF9vTmF2aWdhdGlvblNlcnZpY2UhOiBOYXZpZ2F0aW9uU2VydmljZTtcblxuXHRwcml2YXRlIF9vVmlldyE6IFZpZXc7XG5cblx0QG1ldGhvZE92ZXJyaWRlKClcblx0b25Jbml0KCkge1xuXHRcdHRoaXMuX29BcHBDb21wb25lbnQgPSB0aGlzLmJhc2UuZ2V0QXBwQ29tcG9uZW50KCk7XG5cdFx0dGhpcy5fb01ldGFNb2RlbCA9IHRoaXMuX29BcHBDb21wb25lbnQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbDtcblx0XHR0aGlzLl9vTmF2aWdhdGlvblNlcnZpY2UgPSB0aGlzLl9vQXBwQ29tcG9uZW50LmdldE5hdmlnYXRpb25TZXJ2aWNlKCk7XG5cdFx0dGhpcy5fb1ZpZXcgPSB0aGlzLmJhc2UuZ2V0VmlldygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEVuYWJsZXMgaW50ZW50LWJhc2VkIG5hdmlnYXRpb24gKFNlbWFudGljT2JqZWN0LUFjdGlvbikgd2l0aCB0aGUgcHJvdmlkZWQgY29udGV4dC5cblx0ICogSWYgc2VtYW50aWMgb2JqZWN0IG1hcHBpbmcgaXMgcHJvdmlkZWQsIHRoaXMgaXMgYWxzbyBhcHBsaWVkIHRvIHRoZSBzZWxlY3Rpb24gdmFyaWFudCBhZnRlciB0aGUgYWRhcHRhdGlvbiBieSBhIGNvbnN1bWVyLlxuXHQgKiBUaGlzIHRha2VzIGNhcmUgb2YgcmVtb3ZpbmcgYW55IHRlY2huaWNhbCBwYXJhbWV0ZXJzIGFuZCBkZXRlcm1pbmVzIGlmIGFuIGV4cGxhY2Ugb3IgaW5wbGFjZSBuYXZpZ2F0aW9uIHNob3VsZCB0YWtlIHBsYWNlLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1NlbWFudGljT2JqZWN0IFNlbWFudGljIG9iamVjdCBmb3IgdGhlIHRhcmdldCBhcHBcblx0ICogQHBhcmFtIHNBY3Rpb24gIEFjdGlvbiBmb3IgdGhlIHRhcmdldCBhcHBcblx0ICogQHBhcmFtIFttTmF2aWdhdGlvblBhcmFtZXRlcnNdIE9wdGlvbmFsIHBhcmFtZXRlcnMgdG8gYmUgcGFzc2VkIHRvIHRoZSBleHRlcm5hbCBuYXZpZ2F0aW9uXG5cdCAqIEBwYXJhbSBbbU5hdmlnYXRpb25QYXJhbWV0ZXJzLm5hdmlnYXRpb25Db250ZXh0c10gVXNlcyBvbmUgb2YgdGhlIGZvbGxvd2luZyB0byBiZSBwYXNzZWQgdG8gdGhlIGludGVudDpcblx0ICogICAgYSBzaW5nbGUgaW5zdGFuY2Ugb2Yge0BsaW5rIHNhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0fVxuXHQgKiAgICBtdWx0aXBsZSBpbnN0YW5jZXMgb2Yge0BsaW5rIHNhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0fVxuXHQgKiAgICBhbiBvYmplY3Qgb3IgYW4gYXJyYXkgb2Ygb2JqZWN0c1xuXHQgKlx0XHQgIElmIGFuIGFycmF5IG9mIG9iamVjdHMgaXMgcGFzc2VkLCB0aGUgY29udGV4dCBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgbWV0YVBhdGggYW5kIHRvIHJlbW92ZSBhbnkgc2Vuc2l0aXZlIGRhdGFcblx0ICpcdFx0ICBJZiBhbiBhcnJheSBvZiBvYmplY3RzIGlzIHBhc3NlZCwgdGhlIGZvbGxvd2luZyBmb3JtYXQgaXggZXhwZWN0ZWQ6XG5cdCAqXHRcdCAge1xuXHQgKlx0XHRcdGRhdGE6IHtcblx0ICpcdCBcdFx0XHRQcm9kdWN0SUQ6IDc2MzQsXG5cdCAqXHRcdFx0XHROYW1lOiBcIkxhcHRvcFwiXG5cdCAqXHRcdFx0IH0sXG5cdCAqXHRcdFx0IG1ldGFQYXRoOiBcIi9TYWxlc09yZGVyTWFuYWdlXCJcblx0ICogICAgICAgIH1cblx0ICogQHBhcmFtIFttTmF2aWdhdGlvblBhcmFtZXRlcnMuc2VtYW50aWNPYmplY3RNYXBwaW5nXSBTdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIFNlbWFudGljT2JqZWN0TWFwcGluZyBvciBTZW1hbnRpY09iamVjdE1hcHBpbmcgdGhhdCBhcHBsaWVzIHRvIHRoaXMgbmF2aWdhdGlvblxuXHQgKiBAcGFyYW0gW21OYXZpZ2F0aW9uUGFyYW1ldGVycy5kZWZhdWx0UmVmcmVzaFN0cmF0ZWd5XSBEZWZhdWx0IHJlZnJlc2ggc3RyYXRlZ3kgdG8gYmUgdXNlZCBpbiBjYXNlIG5vIHJlZnJlc2ggc3RyYXRlZ3kgaXMgc3BlY2lmaWVkIGZvciB0aGUgaW50ZW50IGluIHRoZSB2aWV3LlxuXHQgKiBAcGFyYW0gW21OYXZpZ2F0aW9uUGFyYW1ldGVycy5yZWZyZXNoU3RyYXRlZ2llc11cblx0ICogQHBhcmFtIFttTmF2aWdhdGlvblBhcmFtZXRlcnMuYWRkaXRpb25hbE5hdmlnYXRpb25QYXJhbWV0ZXJzXSBBZGRpdGlvbmFsIG5hdmlnYXRpb24gcGFyYW1ldGVycyBjb25maWd1cmVkIGluIHRoZSBjcm9zc0FwcE5hdmlnYXRpb24gb3V0Ym91bmQgcGFyYW1ldGVycy5cblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRuYXZpZ2F0ZShzU2VtYW50aWNPYmplY3Q6IHN0cmluZywgc0FjdGlvbjogc3RyaW5nLCBtTmF2aWdhdGlvblBhcmFtZXRlcnM6IE5hdmlnYXRpb25QYXJhbWV0ZXJzIHwgdW5kZWZpbmVkKSB7XG5cdFx0Y29uc3QgX2RvTmF2aWdhdGUgPSAob0NvbnRleHQ/OiBhbnkpID0+IHtcblx0XHRcdGNvbnN0IHZOYXZpZ2F0aW9uQ29udGV4dHMgPSBtTmF2aWdhdGlvblBhcmFtZXRlcnMgJiYgbU5hdmlnYXRpb25QYXJhbWV0ZXJzLm5hdmlnYXRpb25Db250ZXh0cyxcblx0XHRcdFx0YU5hdmlnYXRpb25Db250ZXh0cyA9XG5cdFx0XHRcdFx0dk5hdmlnYXRpb25Db250ZXh0cyAmJiAhQXJyYXkuaXNBcnJheSh2TmF2aWdhdGlvbkNvbnRleHRzKSA/IFt2TmF2aWdhdGlvbkNvbnRleHRzXSA6IHZOYXZpZ2F0aW9uQ29udGV4dHMsXG5cdFx0XHRcdHZTZW1hbnRpY09iamVjdE1hcHBpbmcgPSBtTmF2aWdhdGlvblBhcmFtZXRlcnMgJiYgbU5hdmlnYXRpb25QYXJhbWV0ZXJzLnNlbWFudGljT2JqZWN0TWFwcGluZyxcblx0XHRcdFx0dk91dGJvdW5kUGFyYW1zID0gbU5hdmlnYXRpb25QYXJhbWV0ZXJzICYmIG1OYXZpZ2F0aW9uUGFyYW1ldGVycy5hZGRpdGlvbmFsTmF2aWdhdGlvblBhcmFtZXRlcnMsXG5cdFx0XHRcdG9UYXJnZXRJbmZvOiBhbnkgPSB7XG5cdFx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IHNTZW1hbnRpY09iamVjdCxcblx0XHRcdFx0XHRhY3Rpb246IHNBY3Rpb25cblx0XHRcdFx0fSxcblx0XHRcdFx0b1ZpZXcgPSB0aGlzLmJhc2UuZ2V0VmlldygpLFxuXHRcdFx0XHRvQ29udHJvbGxlciA9IG9WaWV3LmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcjtcblxuXHRcdFx0aWYgKG9Db250ZXh0KSB7XG5cdFx0XHRcdHRoaXMuX29WaWV3LnNldEJpbmRpbmdDb250ZXh0KG9Db250ZXh0KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHNTZW1hbnRpY09iamVjdCAmJiBzQWN0aW9uKSB7XG5cdFx0XHRcdGxldCBhU2VtYW50aWNBdHRyaWJ1dGVzOiBhbnlbXSA9IFtdLFxuXHRcdFx0XHRcdG9TZWxlY3Rpb25WYXJpYW50OiBhbnkgPSBuZXcgU2VsZWN0aW9uVmFyaWFudCgpO1xuXHRcdFx0XHQvLyAxLiBnZXQgU2VtYW50aWNBdHRyaWJ1dGVzIGZvciBuYXZpZ2F0aW9uXG5cdFx0XHRcdGlmIChhTmF2aWdhdGlvbkNvbnRleHRzICYmIGFOYXZpZ2F0aW9uQ29udGV4dHMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0YU5hdmlnYXRpb25Db250ZXh0cy5mb3JFYWNoKChvTmF2aWdhdGlvbkNvbnRleHQ6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0Ly8gMS4xLmEgaWYgbmF2aWdhdGlvbiBjb250ZXh0IGlzIGluc3RhbmNlIG9mIHNhcC51aS5tb2RlLm9kYXRhLnY0LkNvbnRleHRcblx0XHRcdFx0XHRcdC8vIGVsc2UgY2hlY2sgaWYgbmF2aWdhdGlvbiBjb250ZXh0IGlzIG9mIHR5cGUgb2JqZWN0XG5cdFx0XHRcdFx0XHRpZiAob05hdmlnYXRpb25Db250ZXh0LmlzQSAmJiBvTmF2aWdhdGlvbkNvbnRleHQuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0LkNvbnRleHRcIikpIHtcblx0XHRcdFx0XHRcdFx0Ly8gMS4xLmIgcmVtb3ZlIHNlbnNpdGl2ZSBkYXRhXG5cdFx0XHRcdFx0XHRcdGxldCBvU2VtYW50aWNBdHRyaWJ1dGVzID0gb05hdmlnYXRpb25Db250ZXh0LmdldE9iamVjdCgpO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBzTWV0YVBhdGggPSB0aGlzLl9vTWV0YU1vZGVsLmdldE1ldGFQYXRoKG9OYXZpZ2F0aW9uQ29udGV4dC5nZXRQYXRoKCkpO1xuXHRcdFx0XHRcdFx0XHQvLyBUT0RPOiBhbHNvIHJlbW92ZSBzZW5zaXRpdmUgZGF0YSBmcm9tICBuYXZpZ2F0aW9uIHByb3BlcnRpZXNcblx0XHRcdFx0XHRcdFx0b1NlbWFudGljQXR0cmlidXRlcyA9IHRoaXMucmVtb3ZlU2Vuc2l0aXZlRGF0YShvU2VtYW50aWNBdHRyaWJ1dGVzLCBzTWV0YVBhdGgpO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBvTmF2Q29udGV4dCA9IHRoaXMucHJlcGFyZUNvbnRleHRGb3JFeHRlcm5hbE5hdmlnYXRpb24ob1NlbWFudGljQXR0cmlidXRlcywgb05hdmlnYXRpb25Db250ZXh0KTtcblx0XHRcdFx0XHRcdFx0b1RhcmdldEluZm9bXCJwcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0XCJdID0gb05hdkNvbnRleHQucHJvcGVydGllc1dpdGhvdXRDb25mbGljdDtcblx0XHRcdFx0XHRcdFx0YVNlbWFudGljQXR0cmlidXRlcy5wdXNoKG9OYXZDb250ZXh0LnNlbWFudGljQXR0cmlidXRlcyk7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRcdFx0XHQhKG9OYXZpZ2F0aW9uQ29udGV4dCAmJiBBcnJheS5pc0FycmF5KG9OYXZpZ2F0aW9uQ29udGV4dC5kYXRhKSkgJiZcblx0XHRcdFx0XHRcdFx0dHlwZW9mIG9OYXZpZ2F0aW9uQ29udGV4dCA9PT0gXCJvYmplY3RcIlxuXHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdC8vIDEuMS5iIHJlbW92ZSBzZW5zaXRpdmUgZGF0YSBmcm9tIG9iamVjdFxuXHRcdFx0XHRcdFx0XHRhU2VtYW50aWNBdHRyaWJ1dGVzLnB1c2godGhpcy5yZW1vdmVTZW5zaXRpdmVEYXRhKG9OYXZpZ2F0aW9uQ29udGV4dC5kYXRhLCBvTmF2aWdhdGlvbkNvbnRleHQubWV0YVBhdGgpKTtcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAob05hdmlnYXRpb25Db250ZXh0ICYmIEFycmF5LmlzQXJyYXkob05hdmlnYXRpb25Db250ZXh0LmRhdGEpKSB7XG5cdFx0XHRcdFx0XHRcdC8vIG9OYXZpZ2F0aW9uQ29udGV4dC5kYXRhIGNhbiBiZSBhcnJheSBhbHJlYWR5IGV4IDogW3tDdXN0b21lcjogXCIxMDAwMVwifSwge0N1c3RvbWVyOiBcIjEwMDkxXCJ9XVxuXHRcdFx0XHRcdFx0XHQvLyBoZW5jZSBhc3NpZ25pbmcgaXQgdG8gdGhlIGFTZW1hbnRpY0F0dHJpYnV0ZXNcblx0XHRcdFx0XHRcdFx0YVNlbWFudGljQXR0cmlidXRlcyA9IHRoaXMucmVtb3ZlU2Vuc2l0aXZlRGF0YShvTmF2aWdhdGlvbkNvbnRleHQuZGF0YSwgb05hdmlnYXRpb25Db250ZXh0Lm1ldGFQYXRoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyAyLjEgTWVyZ2UgYmFzZSBzZWxlY3Rpb24gdmFyaWFudCBhbmQgc2FuaXRpemVkIHNlbWFudGljIGF0dHJpYnV0ZXMgaW50byBvbmUgU2VsZWN0aW9uVmFyaWFudFxuXHRcdFx0XHRpZiAoYVNlbWFudGljQXR0cmlidXRlcyAmJiBhU2VtYW50aWNBdHRyaWJ1dGVzLmxlbmd0aCkge1xuXHRcdFx0XHRcdG9TZWxlY3Rpb25WYXJpYW50ID0gdGhpcy5fb05hdmlnYXRpb25TZXJ2aWNlLm1peEF0dHJpYnV0ZXNBbmRTZWxlY3Rpb25WYXJpYW50KFxuXHRcdFx0XHRcdFx0YVNlbWFudGljQXR0cmlidXRlcyxcblx0XHRcdFx0XHRcdG9TZWxlY3Rpb25WYXJpYW50LnRvSlNPTlN0cmluZygpXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIDMuIEFkZCBmaWx0ZXJDb250ZXh0VXJsIHRvIFNWIHNvIHRoZSBOYXZpZ2F0aW9uSGFuZGxlciBjYW4gcmVtb3ZlIGFueSBzZW5zaXRpdmUgZGF0YSBiYXNlZCBvbiB2aWV3IGVudGl0eVNldFxuXHRcdFx0XHRjb25zdCBvTW9kZWwgPSB0aGlzLl9vVmlldy5nZXRNb2RlbCgpLFxuXHRcdFx0XHRcdHNFbnRpdHlTZXQgPSB0aGlzLmdldEVudGl0eVNldCgpLFxuXHRcdFx0XHRcdHNDb250ZXh0VXJsID0gc0VudGl0eVNldCA/IHRoaXMuX29OYXZpZ2F0aW9uU2VydmljZS5jb25zdHJ1Y3RDb250ZXh0VXJsKHNFbnRpdHlTZXQsIG9Nb2RlbCkgOiB1bmRlZmluZWQ7XG5cdFx0XHRcdGlmIChzQ29udGV4dFVybCkge1xuXHRcdFx0XHRcdG9TZWxlY3Rpb25WYXJpYW50LnNldEZpbHRlckNvbnRleHRVcmwoc0NvbnRleHRVcmwpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gQXBwbHkgT3V0Ym91bmQgUGFyYW1ldGVycyB0byB0aGUgU1Zcblx0XHRcdFx0aWYgKHZPdXRib3VuZFBhcmFtcykge1xuXHRcdFx0XHRcdHRoaXMuX2FwcGx5T3V0Ym91bmRQYXJhbXMob1NlbGVjdGlvblZhcmlhbnQsIHZPdXRib3VuZFBhcmFtcyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyA0LiBnaXZlIGFuIG9wcG9ydHVuaXR5IGZvciB0aGUgYXBwbGljYXRpb24gdG8gaW5mbHVlbmNlIHRoZSBTZWxlY3Rpb25WYXJpYW50XG5cdFx0XHRcdG9Db250cm9sbGVyLmludGVudEJhc2VkTmF2aWdhdGlvbi5hZGFwdE5hdmlnYXRpb25Db250ZXh0KG9TZWxlY3Rpb25WYXJpYW50LCBvVGFyZ2V0SW5mbyk7XG5cblx0XHRcdFx0Ly8gNS4gQXBwbHkgc2VtYW50aWMgb2JqZWN0IG1hcHBpbmdzIHRvIHRoZSBTVlxuXHRcdFx0XHRpZiAodlNlbWFudGljT2JqZWN0TWFwcGluZykge1xuXHRcdFx0XHRcdHRoaXMuX2FwcGx5U2VtYW50aWNPYmplY3RNYXBwaW5ncyhvU2VsZWN0aW9uVmFyaWFudCwgdlNlbWFudGljT2JqZWN0TWFwcGluZyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyA2LiByZW1vdmUgdGVjaG5pY2FsIHBhcmFtZXRlcnMgZnJvbSBTZWxlY3Rpb24gVmFyaWFudFxuXHRcdFx0XHR0aGlzLl9yZW1vdmVUZWNobmljYWxQYXJhbWV0ZXJzKG9TZWxlY3Rpb25WYXJpYW50KTtcblxuXHRcdFx0XHQvLyA3LiBjaGVjayBpZiBwcm9ncmFtbWluZyBtb2RlbCBpcyBzdGlja3kgYW5kIHBhZ2UgaXMgZWRpdGFibGVcblx0XHRcdFx0Y29uc3Qgc05hdk1vZGUgPSBvQ29udHJvbGxlci5faW50ZW50QmFzZWROYXZpZ2F0aW9uLmdldE5hdmlnYXRpb25Nb2RlKCk7XG5cblx0XHRcdFx0Ly8gOC4gVXBkYXRpbmcgcmVmcmVzaCBzdHJhdGVneSBpbiBpbnRlcm5hbCBtb2RlbFxuXHRcdFx0XHRjb25zdCBtUmVmcmVzaFN0cmF0ZWdpZXMgPSAobU5hdmlnYXRpb25QYXJhbWV0ZXJzICYmIG1OYXZpZ2F0aW9uUGFyYW1ldGVycy5yZWZyZXNoU3RyYXRlZ2llcykgfHwge30sXG5cdFx0XHRcdFx0b0ludGVybmFsTW9kZWwgPSBvVmlldy5nZXRNb2RlbChcImludGVybmFsXCIpIGFzIEpTT05Nb2RlbDtcblx0XHRcdFx0aWYgKG9JbnRlcm5hbE1vZGVsKSB7XG5cdFx0XHRcdFx0aWYgKChvVmlldyAmJiAob1ZpZXcuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpKS5yZWZyZXNoU3RyYXRlZ3lPbkFwcFJlc3RvcmUpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG1WaWV3UmVmcmVzaFN0cmF0ZWdpZXMgPSAob1ZpZXcuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpLnJlZnJlc2hTdHJhdGVneU9uQXBwUmVzdG9yZSB8fCB7fTtcblx0XHRcdFx0XHRcdG1lcmdlT2JqZWN0cyhtUmVmcmVzaFN0cmF0ZWdpZXMsIG1WaWV3UmVmcmVzaFN0cmF0ZWdpZXMpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25zdCBtUmVmcmVzaFN0cmF0ZWd5ID0gS2VlcEFsaXZlSGVscGVyLmdldFJlZnJlc2hTdHJhdGVneUZvckludGVudChtUmVmcmVzaFN0cmF0ZWdpZXMsIHNTZW1hbnRpY09iamVjdCwgc0FjdGlvbik7XG5cdFx0XHRcdFx0aWYgKG1SZWZyZXNoU3RyYXRlZ3kpIHtcblx0XHRcdFx0XHRcdG9JbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KFwiL3JlZnJlc2hTdHJhdGVneU9uQXBwUmVzdG9yZVwiLCBtUmVmcmVzaFN0cmF0ZWd5KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyA5LiBOYXZpZ2F0ZSB2aWEgTmF2aWdhdGlvbkhhbmRsZXJcblx0XHRcdFx0Y29uc3Qgb25FcnJvciA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRzYXAudWkucmVxdWlyZShbXCJzYXAvbS9NZXNzYWdlQm94XCJdLCBmdW5jdGlvbiAoTWVzc2FnZUJveDogYW55KSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvUmVzb3VyY2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXHRcdFx0XHRcdFx0TWVzc2FnZUJveC5lcnJvcihvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX0hFTFBFUl9OQVZJR0FUSU9OX0VSUk9SX01FU1NBR0VcIiksIHtcblx0XHRcdFx0XHRcdFx0dGl0bGU6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19DT01NT05fU0FQRkVfRVJST1JcIilcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9O1xuXHRcdFx0XHR0aGlzLl9vTmF2aWdhdGlvblNlcnZpY2UubmF2aWdhdGUoXG5cdFx0XHRcdFx0c1NlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdHNBY3Rpb24sXG5cdFx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnQudG9KU09OU3RyaW5nKCksXG5cdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdG9uRXJyb3IsXG5cdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdHNOYXZNb2RlXG5cdFx0XHRcdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJTZW1hbnRpYyBPYmplY3QvYWN0aW9uIGlzIG5vdCBwcm92aWRlZFwiKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdGNvbnN0IG9CaW5kaW5nQ29udGV4dCA9IHRoaXMuYmFzZS5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0JpbmRpbmdDb250ZXh0ICYmIChvQmluZGluZ0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCk7XG5cdFx0aWYgKFxuXHRcdFx0KHRoaXMuZ2V0VmlldygpLmdldFZpZXdEYXRhKCkgYXMgYW55KS5jb252ZXJ0ZXJUeXBlID09PSBcIk9iamVjdFBhZ2VcIiAmJlxuXHRcdFx0b01ldGFNb2RlbCAmJlxuXHRcdFx0IU1vZGVsSGVscGVyLmlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZChvTWV0YU1vZGVsKVxuXHRcdCkge1xuXHRcdFx0ZHJhZnQucHJvY2Vzc0RhdGFMb3NzT3JEcmFmdERpc2NhcmRDb25maXJtYXRpb24oXG5cdFx0XHRcdF9kb05hdmlnYXRlLmJpbmQodGhpcyksXG5cdFx0XHRcdEZ1bmN0aW9uLnByb3RvdHlwZSxcblx0XHRcdFx0dGhpcy5iYXNlLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dCgpLFxuXHRcdFx0XHR0aGlzLmJhc2UuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSxcblx0XHRcdFx0dHJ1ZSxcblx0XHRcdFx0ZHJhZnQuTmF2aWdhdGlvblR5cGUuRm9yd2FyZE5hdmlnYXRpb25cblx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdF9kb05hdmlnYXRlKCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFByZXBhcmUgYXR0cmlidXRlcyB0byBiZSBwYXNzZWQgdG8gZXh0ZXJuYWwgbmF2aWdhdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIG9TZW1hbnRpY0F0dHJpYnV0ZXMgQ29udGV4dCBkYXRhIGFmdGVyIHJlbW92aW5nIGFsbCBzZW5zaXRpdmUgaW5mb3JtYXRpb24uXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBBY3R1YWwgY29udGV4dCBmcm9tIHdoaWNoIHRoZSBzZW1hbnRpY0F0dHJpYnV0ZXMgd2VyZSBkZXJpdmVkLlxuXHQgKiBAcmV0dXJucyBPYmplY3Qgb2YgcHJlcGFyZWQgYXR0cmlidXRlcyBmb3IgZXh0ZXJuYWwgbmF2aWdhdGlvbiBhbmQgbm8gY29uZmxpY3QgcHJvcGVydGllcy5cblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRwcmVwYXJlQ29udGV4dEZvckV4dGVybmFsTmF2aWdhdGlvbihvU2VtYW50aWNBdHRyaWJ1dGVzOiBhbnksIG9Db250ZXh0OiBDb250ZXh0KSB7XG5cdFx0Ly8gMS4gRmluZCBhbGwgZGlzdGluY3Qga2V5cyBpbiB0aGUgb2JqZWN0IFNlbWFudGljQXR0cmlidXRlc1xuXHRcdC8vIFN0b3JlIG1ldGEgcGF0aCBmb3IgZWFjaCBvY2N1cmVuY2Ugb2YgdGhlIGtleVxuXHRcdGNvbnN0IG9EaXN0aW5jdEtleXM6IGFueSA9IHt9LFxuXHRcdFx0c0NvbnRleHRQYXRoID0gb0NvbnRleHQuZ2V0UGF0aCgpLFxuXHRcdFx0b01ldGFNb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWwsXG5cdFx0XHRzTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKHNDb250ZXh0UGF0aCksXG5cdFx0XHRhTWV0YVBhdGhQYXJ0cyA9IHNNZXRhUGF0aC5zcGxpdChcIi9cIikuZmlsdGVyKEJvb2xlYW4pO1xuXG5cdFx0ZnVuY3Rpb24gX2ZpbmREaXN0aW5jdEtleXNJbk9iamVjdChMb29rVXBPYmplY3Q6IGFueSwgc0xvb2tVcE9iamVjdE1ldGFQYXRoOiBhbnkpIHtcblx0XHRcdGZvciAoY29uc3Qgc0tleSBpbiBMb29rVXBPYmplY3QpIHtcblx0XHRcdFx0Ly8gbnVsbCBjYXNlPz9cblx0XHRcdFx0aWYgKExvb2tVcE9iamVjdFtzS2V5XSA9PT0gbnVsbCB8fCB0eXBlb2YgTG9va1VwT2JqZWN0W3NLZXldICE9PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdFx0aWYgKCFvRGlzdGluY3RLZXlzW3NLZXldKSB7XG5cdFx0XHRcdFx0XHQvLyBpZiBrZXkgaXMgZm91bmQgZm9yIHRoZSBmaXJzdCB0aW1lIHRoZW4gY3JlYXRlIGFycmF5XG5cdFx0XHRcdFx0XHRvRGlzdGluY3RLZXlzW3NLZXldID0gW107XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIHB1c2ggcGF0aCB0byBhcnJheVxuXHRcdFx0XHRcdG9EaXN0aW5jdEtleXNbc0tleV0ucHVzaChzTG9va1VwT2JqZWN0TWV0YVBhdGgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIGlmIGEgbmVzdGVkIG9iamVjdCBpcyBmb3VuZFxuXHRcdFx0XHRcdGNvbnN0IG9OZXdMb29rVXBPYmplY3QgPSBMb29rVXBPYmplY3Rbc0tleV07XG5cdFx0XHRcdFx0X2ZpbmREaXN0aW5jdEtleXNJbk9iamVjdChvTmV3TG9va1VwT2JqZWN0LCBgJHtzTG9va1VwT2JqZWN0TWV0YVBhdGh9LyR7c0tleX1gKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdF9maW5kRGlzdGluY3RLZXlzSW5PYmplY3Qob1NlbWFudGljQXR0cmlidXRlcywgc01ldGFQYXRoKTtcblxuXHRcdC8vIDIuIERldGVybWluZSBkaXN0aW5jdCBrZXkgdmFsdWUgYW5kIGFkZCBjb25mbGljdGVkIHBhdGhzIHRvIHNlbWFudGljIGF0dHJpYnV0ZXNcblx0XHRjb25zdCBzTWFpbkVudGl0eVNldE5hbWUgPSBhTWV0YVBhdGhQYXJ0c1swXSxcblx0XHRcdHNNYWluRW50aXR5VHlwZU5hbWUgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgLyR7c01haW5FbnRpdHlTZXROYW1lfS9Ac2FwdWkubmFtZWApLFxuXHRcdFx0b1Byb3BlcnRpZXNXaXRob3V0Q29uZmxpY3Q6IGFueSA9IHt9O1xuXHRcdGxldCBzTWFpbkVudGl0eVZhbHVlUGF0aCwgc0N1cnJlbnRWYWx1ZVBhdGgsIHNMYXN0VmFsdWVQYXRoO1xuXHRcdGZvciAoY29uc3Qgc0Rpc3RpbmN0S2V5IGluIG9EaXN0aW5jdEtleXMpIHtcblx0XHRcdGNvbnN0IGFDb25mbGljdGluZ1BhdGhzID0gb0Rpc3RpbmN0S2V5c1tzRGlzdGluY3RLZXldO1xuXHRcdFx0bGV0IHNXaW5uZXJWYWx1ZVBhdGg7XG5cdFx0XHQvLyBGaW5kIHdpbm5lciB2YWx1ZSBmb3IgZWFjaCBkaXN0aW5jdCBrZXkgaW4gY2FzZSBvZiBjb25mbGljdCBieSB0aGUgZm9sbG93aW5nIHJ1bGU6XG5cblx0XHRcdC8vIC0+IEEuIGlmIGFueSBtZXRhIHBhdGggZm9yIGEgZGlzdGluY3Qga2V5IGlzIHRoZSBzYW1lIGFzIG1haW4gZW50aXR5IHRha2UgdGhhdCBhcyB0aGUgdmFsdWVcblx0XHRcdC8vIC0+IEIuIGlmIEEgaXMgbm90IG1ldCBrZWVwIHRoZSB2YWx1ZSBmcm9tIHRoZSBjdXJyZW50IGNvbnRleHQgKHNNZXRhUGF0aCA9PT0gcGF0aCBvZiBkaXN0aW5jZSBrZXkpXG5cdFx0XHQvLyAtPiBDLiBpZiBBLCBCIG9yIEMgYXJlIG5vdCBtZXQgdGFrZSB0aGUgbGFzdCBwYXRoIGZvciB2YWx1ZVxuXHRcdFx0aWYgKGFDb25mbGljdGluZ1BhdGhzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0Ly8gY29uZmxpY3Rcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPD0gYUNvbmZsaWN0aW5nUGF0aHMubGVuZ3RoIC0gMTsgaSsrKSB7XG5cdFx0XHRcdFx0Y29uc3Qgc1BhdGggPSBhQ29uZmxpY3RpbmdQYXRoc1tpXTtcblx0XHRcdFx0XHRsZXQgc1BhdGhJbkNvbnRleHQgPSBzUGF0aC5yZXBsYWNlKHNQYXRoID09PSBzTWV0YVBhdGggPyBzTWV0YVBhdGggOiBgJHtzTWV0YVBhdGh9L2AsIFwiXCIpO1xuXHRcdFx0XHRcdHNQYXRoSW5Db250ZXh0ID0gKHNQYXRoSW5Db250ZXh0ID09PSBcIlwiID8gc1BhdGhJbkNvbnRleHQgOiBgJHtzUGF0aEluQ29udGV4dH0vYCkgKyBzRGlzdGluY3RLZXk7XG5cdFx0XHRcdFx0Y29uc3Qgc0VudGl0eVR5cGVOYW1lID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c1BhdGh9L0BzYXB1aS5uYW1lYCk7XG5cdFx0XHRcdFx0Ly8gcnVsZSBBXG5cblx0XHRcdFx0XHQvLyBydWxlIEFcblx0XHRcdFx0XHRpZiAoc0VudGl0eVR5cGVOYW1lID09PSBzTWFpbkVudGl0eVR5cGVOYW1lKSB7XG5cdFx0XHRcdFx0XHRzTWFpbkVudGl0eVZhbHVlUGF0aCA9IHNQYXRoSW5Db250ZXh0O1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIHJ1bGUgQlxuXHRcdFx0XHRcdGlmIChzUGF0aCA9PT0gc01ldGFQYXRoKSB7XG5cdFx0XHRcdFx0XHRzQ3VycmVudFZhbHVlUGF0aCA9IHNQYXRoSW5Db250ZXh0O1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIHJ1bGUgQ1xuXHRcdFx0XHRcdHNMYXN0VmFsdWVQYXRoID0gc1BhdGhJbkNvbnRleHQ7XG5cblx0XHRcdFx0XHQvLyBhZGQgY29uZmxpY3RlZCBwYXRoIHRvIHNlbWFudGljIGF0dHJpYnV0ZXNcblx0XHRcdFx0XHQvLyBjaGVjayBpZiB0aGUgY3VycmVudCBwYXRoIHBvaW50cyB0byBtYWluIGVudGl0eSBhbmQgcHJlZml4IGF0dHJpYnV0ZSBuYW1lcyBhY2NvcmRpbmdseVxuXHRcdFx0XHRcdG9TZW1hbnRpY0F0dHJpYnV0ZXNbXG5cdFx0XHRcdFx0XHRgJHtzTWV0YVBhdGh9LyR7c1BhdGhJbkNvbnRleHR9YFxuXHRcdFx0XHRcdFx0XHQuc3BsaXQoXCIvXCIpXG5cdFx0XHRcdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKHNWYWx1ZTogc3RyaW5nKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHNWYWx1ZSAhPSBcIlwiO1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQuam9pbihcIi5cIilcblx0XHRcdFx0XHRdID0gb0NvbnRleHQuZ2V0UHJvcGVydHkoc1BhdGhJbkNvbnRleHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIEEgfHwgQiB8fCBDXG5cdFx0XHRcdHNXaW5uZXJWYWx1ZVBhdGggPSBzTWFpbkVudGl0eVZhbHVlUGF0aCB8fCBzQ3VycmVudFZhbHVlUGF0aCB8fCBzTGFzdFZhbHVlUGF0aDtcblx0XHRcdFx0b1NlbWFudGljQXR0cmlidXRlc1tzRGlzdGluY3RLZXldID0gb0NvbnRleHQuZ2V0UHJvcGVydHkoc1dpbm5lclZhbHVlUGF0aCk7XG5cdFx0XHRcdHNNYWluRW50aXR5VmFsdWVQYXRoID0gdW5kZWZpbmVkO1xuXHRcdFx0XHRzQ3VycmVudFZhbHVlUGF0aCA9IHVuZGVmaW5lZDtcblx0XHRcdFx0c0xhc3RWYWx1ZVBhdGggPSB1bmRlZmluZWQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBubyBjb25mbGljdCwgYWRkIGRpc3RpbmN0IGtleSB3aXRob3V0IGFkZGluZyBwYXRoc1xuXHRcdFx0XHRjb25zdCBzUGF0aCA9IGFDb25mbGljdGluZ1BhdGhzWzBdOyAvLyBiZWNhdXNlIHRoZXJlIGlzIG9ubHkgb25lIGFuZCBoZW5jZSBubyBjb25mbGljdFxuXHRcdFx0XHRsZXQgc1BhdGhJbkNvbnRleHQgPSBzUGF0aC5yZXBsYWNlKHNQYXRoID09PSBzTWV0YVBhdGggPyBzTWV0YVBhdGggOiBgJHtzTWV0YVBhdGh9L2AsIFwiXCIpO1xuXHRcdFx0XHRzUGF0aEluQ29udGV4dCA9IChzUGF0aEluQ29udGV4dCA9PT0gXCJcIiA/IHNQYXRoSW5Db250ZXh0IDogYCR7c1BhdGhJbkNvbnRleHR9L2ApICsgc0Rpc3RpbmN0S2V5O1xuXHRcdFx0XHRvU2VtYW50aWNBdHRyaWJ1dGVzW3NEaXN0aW5jdEtleV0gPSBvQ29udGV4dC5nZXRQcm9wZXJ0eShzUGF0aEluQ29udGV4dCk7XG5cdFx0XHRcdG9Qcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0W3NEaXN0aW5jdEtleV0gPSBgJHtzTWV0YVBhdGh9LyR7c1BhdGhJbkNvbnRleHR9YFxuXHRcdFx0XHRcdC5zcGxpdChcIi9cIilcblx0XHRcdFx0XHQuZmlsdGVyKGZ1bmN0aW9uIChzVmFsdWU6IHN0cmluZykge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHNWYWx1ZSAhPSBcIlwiO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmpvaW4oXCIuXCIpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyAzLiBSZW1vdmUgYWxsIE5hdmlnYXRpb24gcHJvcGVydGllc1xuXHRcdGZvciAoY29uc3Qgc1Byb3BlcnR5IGluIG9TZW1hbnRpY0F0dHJpYnV0ZXMpIHtcblx0XHRcdGlmIChvU2VtYW50aWNBdHRyaWJ1dGVzW3NQcm9wZXJ0eV0gIT09IG51bGwgJiYgdHlwZW9mIG9TZW1hbnRpY0F0dHJpYnV0ZXNbc1Byb3BlcnR5XSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHRkZWxldGUgb1NlbWFudGljQXR0cmlidXRlc1tzUHJvcGVydHldO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4ge1xuXHRcdFx0c2VtYW50aWNBdHRyaWJ1dGVzOiBvU2VtYW50aWNBdHRyaWJ1dGVzLFxuXHRcdFx0cHJvcGVydGllc1dpdGhvdXRDb25mbGljdDogb1Byb3BlcnRpZXNXaXRob3V0Q29uZmxpY3Rcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIFByZXBhcmUgZmlsdGVyIGNvbmRpdGlvbnMgdG8gYmUgcGFzc2VkIHRvIGV4dGVybmFsIG5hdmlnYXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBvRmlsdGVyQmFyQ29uZGl0aW9ucyBGaWx0ZXIgY29uZGl0aW9ucy5cblx0ICogQHBhcmFtIHNSb290UGF0aCBSb290IHBhdGggb2YgdGhlIGFwcGxpY2F0aW9uLlxuXHQgKiBAcGFyYW0gYVBhcmFtZXRlcnMgTmFtZXMgb2YgcGFyYW1ldGVycyB0byBiZSBjb25zaWRlcmVkLlxuXHQgKiBAcmV0dXJucyBPYmplY3Qgb2YgcHJlcGFyZWQgZmlsdGVyIGNvbmRpdGlvbnMgZm9yIGV4dGVybmFsIG5hdmlnYXRpb24gYW5kIG5vIGNvbmZsaWN0IGZpbHRlcnMuXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0cHJlcGFyZUZpbHRlcnNGb3JFeHRlcm5hbE5hdmlnYXRpb24ob0ZpbHRlckJhckNvbmRpdGlvbnM6IGFueSwgc1Jvb3RQYXRoOiBzdHJpbmcsIGFQYXJhbWV0ZXJzPzogYW55W10pIHtcblx0XHRsZXQgc1BhdGg7XG5cdFx0Y29uc3Qgb0Rpc3RpbmN0S2V5czogYW55ID0ge307XG5cdFx0Y29uc3Qgb0ZpbHRlckNvbmRpdGlvbnNXaXRob3V0Q29uZmxpY3Q6IGFueSA9IHt9O1xuXHRcdGxldCBzTWFpbkVudGl0eVZhbHVlUGF0aCwgc0N1cnJlbnRWYWx1ZVBhdGgsIHNGdWxsQ29udGV4dFBhdGgsIHNXaW5uZXJWYWx1ZVBhdGgsIHNQYXRoSW5Db250ZXh0O1xuXG5cdFx0ZnVuY3Rpb24gX2ZpbmREaXN0aW5jdEtleXNJbk9iamVjdChMb29rVXBPYmplY3Q6IGFueSkge1xuXHRcdFx0bGV0IHNMb29rVXBPYmplY3RNZXRhUGF0aDtcblx0XHRcdGZvciAobGV0IHNLZXkgaW4gTG9va1VwT2JqZWN0KSB7XG5cdFx0XHRcdGlmIChMb29rVXBPYmplY3Rbc0tleV0pIHtcblx0XHRcdFx0XHRpZiAoc0tleS5pbmNsdWRlcyhcIi9cIikpIHtcblx0XHRcdFx0XHRcdHNMb29rVXBPYmplY3RNZXRhUGF0aCA9IHNLZXk7IC8vIFwiL1NhbGVzT3JkZXJtYW5hZ2UvX0l0ZW0vTWF0ZXJpYWxcIlxuXHRcdFx0XHRcdFx0Y29uc3QgYVBhdGhQYXJ0cyA9IHNLZXkuc3BsaXQoXCIvXCIpO1xuXHRcdFx0XHRcdFx0c0tleSA9IGFQYXRoUGFydHNbYVBhdGhQYXJ0cy5sZW5ndGggLSAxXTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c0xvb2tVcE9iamVjdE1ldGFQYXRoID0gc1Jvb3RQYXRoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoIW9EaXN0aW5jdEtleXNbc0tleV0pIHtcblx0XHRcdFx0XHRcdC8vIGlmIGtleSBpcyBmb3VuZCBmb3IgdGhlIGZpcnN0IHRpbWUgdGhlbiBjcmVhdGUgYXJyYXlcblx0XHRcdFx0XHRcdG9EaXN0aW5jdEtleXNbc0tleV0gPSBbXTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBwdXNoIHBhdGggdG8gYXJyYXlcblx0XHRcdFx0XHRvRGlzdGluY3RLZXlzW3NLZXldLnB1c2goc0xvb2tVcE9iamVjdE1ldGFQYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdF9maW5kRGlzdGluY3RLZXlzSW5PYmplY3Qob0ZpbHRlckJhckNvbmRpdGlvbnMpO1xuXHRcdGZvciAoY29uc3Qgc0Rpc3RpbmN0S2V5IGluIG9EaXN0aW5jdEtleXMpIHtcblx0XHRcdGNvbnN0IGFDb25mbGljdGluZ1BhdGhzID0gb0Rpc3RpbmN0S2V5c1tzRGlzdGluY3RLZXldO1xuXG5cdFx0XHRpZiAoYUNvbmZsaWN0aW5nUGF0aHMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHQvLyBjb25mbGljdFxuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8PSBhQ29uZmxpY3RpbmdQYXRocy5sZW5ndGggLSAxOyBpKyspIHtcblx0XHRcdFx0XHRzUGF0aCA9IGFDb25mbGljdGluZ1BhdGhzW2ldO1xuXHRcdFx0XHRcdGlmIChzUGF0aCA9PT0gc1Jvb3RQYXRoKSB7XG5cdFx0XHRcdFx0XHRzRnVsbENvbnRleHRQYXRoID0gYCR7c1Jvb3RQYXRofS8ke3NEaXN0aW5jdEtleX1gO1xuXHRcdFx0XHRcdFx0c1BhdGhJbkNvbnRleHQgPSBzRGlzdGluY3RLZXk7XG5cdFx0XHRcdFx0XHRzTWFpbkVudGl0eVZhbHVlUGF0aCA9IHNEaXN0aW5jdEtleTtcblx0XHRcdFx0XHRcdGlmIChhUGFyYW1ldGVycyAmJiBhUGFyYW1ldGVycy5pbmNsdWRlcyhzRGlzdGluY3RLZXkpKSB7XG5cdFx0XHRcdFx0XHRcdG9GaWx0ZXJCYXJDb25kaXRpb25zW2AkUGFyYW1ldGVyLiR7c0Rpc3RpbmN0S2V5fWBdID0gb0ZpbHRlckJhckNvbmRpdGlvbnNbc0Rpc3RpbmN0S2V5XTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c1BhdGhJbkNvbnRleHQgPSBzUGF0aDtcblx0XHRcdFx0XHRcdHNGdWxsQ29udGV4dFBhdGggPSAoYCR7c1Jvb3RQYXRofS8ke3NQYXRofWAgYXMgYW55KS5yZXBsYWNlQWxsKC9cXCovZywgXCJcIik7XG5cdFx0XHRcdFx0XHRzQ3VycmVudFZhbHVlUGF0aCA9IHNQYXRoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRvRmlsdGVyQmFyQ29uZGl0aW9uc1tcblx0XHRcdFx0XHRcdHNGdWxsQ29udGV4dFBhdGhcblx0XHRcdFx0XHRcdFx0LnNwbGl0KFwiL1wiKVxuXHRcdFx0XHRcdFx0XHQuZmlsdGVyKGZ1bmN0aW9uIChzVmFsdWU6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBzVmFsdWUgIT0gXCJcIjtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0LmpvaW4oXCIuXCIpXG5cdFx0XHRcdFx0XSA9IG9GaWx0ZXJCYXJDb25kaXRpb25zW3NQYXRoSW5Db250ZXh0XTtcblx0XHRcdFx0XHRkZWxldGUgb0ZpbHRlckJhckNvbmRpdGlvbnNbc1BhdGhdO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0c1dpbm5lclZhbHVlUGF0aCA9IHNNYWluRW50aXR5VmFsdWVQYXRoIHx8IHNDdXJyZW50VmFsdWVQYXRoO1xuXHRcdFx0XHRvRmlsdGVyQmFyQ29uZGl0aW9uc1tzRGlzdGluY3RLZXldID0gb0ZpbHRlckJhckNvbmRpdGlvbnNbc1dpbm5lclZhbHVlUGF0aF07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBubyBjb25mbGljdCwgYWRkIGRpc3RpbmN0IGtleSB3aXRob3V0IGFkZGluZyBwYXRoc1xuXHRcdFx0XHRzUGF0aCA9IGFDb25mbGljdGluZ1BhdGhzWzBdO1xuXHRcdFx0XHRzRnVsbENvbnRleHRQYXRoID1cblx0XHRcdFx0XHRzUGF0aCA9PT0gc1Jvb3RQYXRoID8gYCR7c1Jvb3RQYXRofS8ke3NEaXN0aW5jdEtleX1gIDogKGAke3NSb290UGF0aH0vJHtzUGF0aH1gIGFzIGFueSkucmVwbGFjZUFsbChcIipcIiwgXCJcIik7XG5cdFx0XHRcdG9GaWx0ZXJDb25kaXRpb25zV2l0aG91dENvbmZsaWN0W3NEaXN0aW5jdEtleV0gPSBzRnVsbENvbnRleHRQYXRoXG5cdFx0XHRcdFx0LnNwbGl0KFwiL1wiKVxuXHRcdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKHNWYWx1ZTogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gc1ZhbHVlICE9IFwiXCI7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuam9pbihcIi5cIik7XG5cdFx0XHRcdGlmIChhUGFyYW1ldGVycyAmJiBhUGFyYW1ldGVycy5pbmNsdWRlcyhzRGlzdGluY3RLZXkpKSB7XG5cdFx0XHRcdFx0b0ZpbHRlckJhckNvbmRpdGlvbnNbYCRQYXJhbWV0ZXIuJHtzRGlzdGluY3RLZXl9YF0gPSBvRmlsdGVyQmFyQ29uZGl0aW9uc1tzRGlzdGluY3RLZXldO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGZpbHRlckNvbmRpdGlvbnM6IG9GaWx0ZXJCYXJDb25kaXRpb25zLFxuXHRcdFx0ZmlsdGVyQ29uZGl0aW9uc1dpdGhvdXRDb25mbGljdDogb0ZpbHRlckNvbmRpdGlvbnNXaXRob3V0Q29uZmxpY3Rcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCBOYXZpZ2F0aW9uIG1vZGUuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBuYXZpZ2F0aW9uIG1vZGVcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5JbnN0ZWFkKVxuXHRnZXROYXZpZ2F0aW9uTW9kZSgpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFsbG93cyBmb3IgbmF2aWdhdGlvbiB0byBhIGdpdmVuIGludGVudCAoU2VtYW50aWNPYmplY3QtQWN0aW9uKSB3aXRoIHRoZSBwcm92aWRlZCBjb250ZXh0LCB1c2luZyBhIGRpYWxvZyB0aGF0IHNob3dzIHRoZSBjb250ZXh0cyB3aGljaCBjYW5ub3QgYmUgcGFzc2VkXG5cdCAqIElmIHNlbWFudGljIG9iamVjdCBtYXBwaW5nIGlzIHByb3ZpZGVkLCB0aGlzIHNldHRpbmcgaXMgYWxzbyBhcHBsaWVkIHRvIHRoZSBzZWxlY3Rpb24gdmFyaWFudCBhZnRlciBhZGFwdGF0aW9uIGJ5IGEgY29uc3VtZXIuXG5cdCAqIFRoaXMgc2V0dGluZyBhbHNvIHJlbW92ZXMgYW55IHRlY2huaWNhbCBwYXJhbWV0ZXJzIGFuZCBkZXRlcm1pbmVzIGlmIGFuIGlucGxhY2Ugb3IgZXhwbGFjZSBuYXZpZ2F0aW9uIHNob3VsZCB0YWtlIHBsYWNlLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1NlbWFudGljT2JqZWN0IFNlbWFudGljIG9iamVjdCBmb3IgdGhlIHRhcmdldCBhcHBcblx0ICogQHBhcmFtIHNBY3Rpb24gIEFjdGlvbiBmb3IgdGhlIHRhcmdldCBhcHBcblx0ICogQHBhcmFtIFttTmF2aWdhdGlvblBhcmFtZXRlcnNdIE9wdGlvbmFsIHBhcmFtZXRlcnMgdG8gYmUgcGFzc2VkIHRvIHRoZSBleHRlcm5hbCBuYXZpZ2F0aW9uXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0YXN5bmMgbmF2aWdhdGVXaXRoQ29uZmlybWF0aW9uRGlhbG9nKHNTZW1hbnRpY09iamVjdDogc3RyaW5nLCBzQWN0aW9uOiBzdHJpbmcsIG1OYXZpZ2F0aW9uUGFyYW1ldGVycz86IE5hdmlnYXRpb25QYXJhbWV0ZXJzKSB7XG5cdFx0bGV0IHNob3VsZENvbnRpbnVlID0gdHJ1ZTtcblx0XHRpZiAobU5hdmlnYXRpb25QYXJhbWV0ZXJzPy5ub3RBcHBsaWNhYmxlQ29udGV4dHMgJiYgbU5hdmlnYXRpb25QYXJhbWV0ZXJzLm5vdEFwcGxpY2FibGVDb250ZXh0cz8ubGVuZ3RoID49IDEpIHtcblx0XHRcdGNvbnN0IG1ldGFNb2RlbCA9IHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWw7XG5cdFx0XHRjb25zdCBlbnRpdHlTZXRQYXRoID0gbWV0YU1vZGVsLmdldE1ldGFQYXRoKG1OYXZpZ2F0aW9uUGFyYW1ldGVycy5ub3RBcHBsaWNhYmxlQ29udGV4dHNbMF0uZ2V0UGF0aCgpKTtcblx0XHRcdGNvbnN0IGNvbnZlcnRlZE1ldGFkYXRhID0gY29udmVydFR5cGVzKG1ldGFNb2RlbCk7XG5cdFx0XHRjb25zdCBlbnRpdHlTZXQgPSBjb252ZXJ0ZWRNZXRhZGF0YS5yZXNvbHZlUGF0aDxFbnRpdHlTZXQ+KGVudGl0eVNldFBhdGgpLnRhcmdldCE7XG5cdFx0XHQvLyBTaG93IHRoZSBjb250ZXh0cyB0aGF0IGFyZSBub3QgYXBwbGljYWJsZSBhbmQgd2lsbCBub3QgdGhlcmVmb3JlIGJlIHByb2Nlc3NlZFxuXHRcdFx0Y29uc3Qgbm90QXBwbGljYWJsZUNvbnRleHRzRGlhbG9nID0gbmV3IE5vdEFwcGxpY2FibGVDb250ZXh0RGlhbG9nKHtcblx0XHRcdFx0dGl0bGU6IFwiXCIsXG5cdFx0XHRcdGVudGl0eVR5cGU6IGVudGl0eVNldC5lbnRpdHlUeXBlLFxuXHRcdFx0XHRyZXNvdXJjZU1vZGVsOiBnZXRSZXNvdXJjZU1vZGVsKHRoaXMuZ2V0VmlldygpKSxcblx0XHRcdFx0bm90QXBwbGljYWJsZUNvbnRleHRzOiBtTmF2aWdhdGlvblBhcmFtZXRlcnMubm90QXBwbGljYWJsZUNvbnRleHRzXG5cdFx0XHR9KTtcblx0XHRcdG1OYXZpZ2F0aW9uUGFyYW1ldGVycy5uYXZpZ2F0aW9uQ29udGV4dHMgPSBtTmF2aWdhdGlvblBhcmFtZXRlcnMuYXBwbGljYWJsZUNvbnRleHRzO1xuXHRcdFx0c2hvdWxkQ29udGludWUgPSBhd2FpdCBub3RBcHBsaWNhYmxlQ29udGV4dHNEaWFsb2cub3Blbih0aGlzLmdldFZpZXcoKSk7XG5cdFx0fVxuXHRcdGlmIChzaG91bGRDb250aW51ZSkge1xuXHRcdFx0dGhpcy5uYXZpZ2F0ZShzU2VtYW50aWNPYmplY3QsIHNBY3Rpb24sIG1OYXZpZ2F0aW9uUGFyYW1ldGVycyk7XG5cdFx0fVxuXHR9XG5cblx0X3JlbW92ZVRlY2huaWNhbFBhcmFtZXRlcnMob1NlbGVjdGlvblZhcmlhbnQ6IGFueSkge1xuXHRcdG9TZWxlY3Rpb25WYXJpYW50LnJlbW92ZVNlbGVjdE9wdGlvbihcIkBvZGF0YS5jb250ZXh0XCIpO1xuXHRcdG9TZWxlY3Rpb25WYXJpYW50LnJlbW92ZVNlbGVjdE9wdGlvbihcIkBvZGF0YS5tZXRhZGF0YUV0YWdcIik7XG5cdFx0b1NlbGVjdGlvblZhcmlhbnQucmVtb3ZlU2VsZWN0T3B0aW9uKFwiU0FQX19NZXNzYWdlc1wiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgdGFyZ2V0ZWQgRW50aXR5IHNldC5cblx0ICpcblx0ICogQHJldHVybnMgRW50aXR5IHNldCBuYW1lXG5cdCAqL1xuXHRAcHJpdmF0ZUV4dGVuc2lvbigpXG5cdGdldEVudGl0eVNldCgpIHtcblx0XHRyZXR1cm4gKHRoaXMuX29WaWV3LmdldFZpZXdEYXRhKCkgYXMgYW55KS5lbnRpdHlTZXQ7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBzZW5zaXRpdmUgZGF0YSBmcm9tIHRoZSBzZW1hbnRpYyBhdHRyaWJ1dGUgd2l0aCByZXNwZWN0IHRvIHRoZSBlbnRpdHlTZXQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQXR0cmlidXRlcyBDb250ZXh0IGRhdGFcblx0ICogQHBhcmFtIHNNZXRhUGF0aCBNZXRhIHBhdGggdG8gcmVhY2ggdGhlIGVudGl0eVNldCBpbiB0aGUgTWV0YU1vZGVsXG5cdCAqIEByZXR1cm5zIEFycmF5IG9mIHNlbWFudGljIEF0dHJpYnV0ZXNcblx0ICogQHByaXZhdGVcblx0ICovXG5cdC8vIFRPLURPIGFkZCB1bml0IHRlc3RzIGZvciB0aGlzIGZ1bmN0aW9uIGluIHRoZSBjb250cm9sbGVyIGV4dGVuc2lvbiBxdW5pdC5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdHJlbW92ZVNlbnNpdGl2ZURhdGEob0F0dHJpYnV0ZXM6IGFueSwgc01ldGFQYXRoOiBzdHJpbmcpIHtcblx0XHRpZiAob0F0dHJpYnV0ZXMpIHtcblx0XHRcdGNvbnN0IHsgdHJhbnNBZ2dyZWdhdGlvbnMsIGN1c3RvbUFnZ3JlZ2F0ZXMgfSA9IHRoaXMuX2dldEFnZ3JlZ2F0ZXMoXG5cdFx0XHRcdHNNZXRhUGF0aCxcblx0XHRcdFx0dGhpcy5iYXNlLmdldFZpZXcoKSxcblx0XHRcdFx0dGhpcy5iYXNlLmdldEFwcENvbXBvbmVudCgpLmdldERpYWdub3N0aWNzKClcblx0XHRcdCk7XG5cdFx0XHRjb25zdCBhUHJvcGVydGllcyA9IE9iamVjdC5rZXlzKG9BdHRyaWJ1dGVzKTtcblx0XHRcdGlmIChhUHJvcGVydGllcy5sZW5ndGgpIHtcblx0XHRcdFx0ZGVsZXRlIG9BdHRyaWJ1dGVzW1wiQG9kYXRhLmNvbnRleHRcIl07XG5cdFx0XHRcdGRlbGV0ZSBvQXR0cmlidXRlc1tcIkBvZGF0YS5tZXRhZGF0YUV0YWdcIl07XG5cdFx0XHRcdGRlbGV0ZSBvQXR0cmlidXRlc1tcIlNBUF9fTWVzc2FnZXNcIl07XG5cdFx0XHRcdGZvciAoY29uc3QgZWxlbWVudCBvZiBhUHJvcGVydGllcykge1xuXHRcdFx0XHRcdGlmIChvQXR0cmlidXRlc1tlbGVtZW50XSAmJiB0eXBlb2Ygb0F0dHJpYnV0ZXNbZWxlbWVudF0gPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0XHRcdHRoaXMucmVtb3ZlU2Vuc2l0aXZlRGF0YShvQXR0cmlidXRlc1tlbGVtZW50XSwgYCR7c01ldGFQYXRofS8ke2VsZW1lbnR9YCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChlbGVtZW50LmluZGV4T2YoXCJAb2RhdGEudHlwZVwiKSA+IC0xKSB7XG5cdFx0XHRcdFx0XHRkZWxldGUgb0F0dHJpYnV0ZXNbZWxlbWVudF07XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy5fZGVsZXRlQWdncmVnYXRlcyhbLi4udHJhbnNBZ2dyZWdhdGlvbnMsIC4uLmN1c3RvbUFnZ3JlZ2F0ZXNdLCBlbGVtZW50LCBvQXR0cmlidXRlcyk7XG5cdFx0XHRcdFx0Y29uc3QgYVByb3BlcnR5QW5ub3RhdGlvbnMgPSB0aGlzLl9nZXRQcm9wZXJ0eUFubm90YXRpb25zKGVsZW1lbnQsIHNNZXRhUGF0aCwgb0F0dHJpYnV0ZXMsIHRoaXMuX29NZXRhTW9kZWwpO1xuXHRcdFx0XHRcdGlmIChhUHJvcGVydHlBbm5vdGF0aW9ucykge1xuXHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRhUHJvcGVydHlBbm5vdGF0aW9ucy5QZXJzb25hbERhdGE/LklzUG90ZW50aWFsbHlTZW5zaXRpdmUgfHxcblx0XHRcdFx0XHRcdFx0YVByb3BlcnR5QW5ub3RhdGlvbnMuVUk/LkV4Y2x1ZGVGcm9tTmF2aWdhdGlvbkNvbnRleHQgfHxcblx0XHRcdFx0XHRcdFx0YVByb3BlcnR5QW5ub3RhdGlvbnMuQW5hbHl0aWNzPy5NZWFzdXJlXG5cdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0ZGVsZXRlIG9BdHRyaWJ1dGVzW2VsZW1lbnRdO1xuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChhUHJvcGVydHlBbm5vdGF0aW9ucy5Db21tb24/LkZpZWxkQ29udHJvbCkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBvRmllbGRDb250cm9sID0gYVByb3BlcnR5QW5ub3RhdGlvbnMuQ29tbW9uLkZpZWxkQ29udHJvbCBhcyBhbnk7XG5cdFx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0XHQob0ZpZWxkQ29udHJvbFtcIiRFbnVtTWVtYmVyXCJdICYmIG9GaWVsZENvbnRyb2xbXCIkRW51bU1lbWJlclwiXS5zcGxpdChcIi9cIilbMV0gPT09IFwiSW5hcHBsaWNhYmxlXCIpIHx8XG5cdFx0XHRcdFx0XHRcdFx0KG9GaWVsZENvbnRyb2xbXCIkUGF0aFwiXSAmJiB0aGlzLl9pc0ZpZWxkQ29udHJvbFBhdGhJbmFwcGxpY2FibGUob0ZpZWxkQ29udHJvbFtcIiRQYXRoXCJdLCBvQXR0cmlidXRlcykpXG5cdFx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRcdGRlbGV0ZSBvQXR0cmlidXRlc1tlbGVtZW50XTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb0F0dHJpYnV0ZXM7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlIHRoZSBhdHRyaWJ1dGUgZnJvbSBuYXZpZ2F0aW9uIGRhdGEgaWYgaXQgaXMgYSBtZWFzdXJlLlxuXHQgKlxuXHQgKiBAcGFyYW0gYWdncmVnYXRlcyBBcnJheSBvZiBBZ2dyZWdhdGVzXG5cdCAqIEBwYXJhbSBzUHJvcCBBdHRyaWJ1dGUgbmFtZVxuXHQgKiBAcGFyYW0gb0F0dHJpYnV0ZXMgU2VtYW50aWNBdHRyaWJ1dGVzXG5cdCAqL1xuXHRfZGVsZXRlQWdncmVnYXRlcyhhZ2dyZWdhdGVzOiBzdHJpbmdbXSB8IHVuZGVmaW5lZCwgc1Byb3A6IHN0cmluZywgb0F0dHJpYnV0ZXM6IGFueSkge1xuXHRcdGlmIChhZ2dyZWdhdGVzICYmIGFnZ3JlZ2F0ZXMuaW5kZXhPZihzUHJvcCkgPiAtMSkge1xuXHRcdFx0ZGVsZXRlIG9BdHRyaWJ1dGVzW3NQcm9wXTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgcHJvcGVydHkgYW5ub3RhdGlvbnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBzUHJvcFxuXHQgKiBAcGFyYW0gc01ldGFQYXRoXG5cdCAqIEBwYXJhbSBvQXR0cmlidXRlc1xuXHQgKiBAcGFyYW0gb01ldGFNb2RlbFxuXHQgKiBAcmV0dXJucyAtIFRoZSBwcm9wZXJ0eSBhbm5vdGF0aW9uc1xuXHQgKi9cblx0X2dldFByb3BlcnR5QW5ub3RhdGlvbnMoc1Byb3A6IHN0cmluZywgc01ldGFQYXRoOiBzdHJpbmcsIG9BdHRyaWJ1dGVzOiBhbnksIG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsKSB7XG5cdFx0aWYgKG9BdHRyaWJ1dGVzW3NQcm9wXSAmJiBzTWV0YVBhdGggJiYgIXNNZXRhUGF0aC5pbmNsdWRlcyhcInVuZGVmaW5lZFwiKSkge1xuXHRcdFx0Y29uc3Qgb0NvbnRleHQgPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGAke3NNZXRhUGF0aH0vJHtzUHJvcH1gKSBhcyBPRGF0YVY0Q29udGV4dDtcblx0XHRcdGNvbnN0IG9GdWxsQ29udGV4dCA9IE1ldGFNb2RlbENvbnZlcnRlci5nZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMob0NvbnRleHQpO1xuXHRcdFx0cmV0dXJuIG9GdWxsQ29udGV4dD8udGFyZ2V0T2JqZWN0Py5hbm5vdGF0aW9ucyBhcyBQcm9wZXJ0eUFubm90YXRpb25zIHwgdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBhZ2dyZWdhdGVzIHBhcnQgb2YgdGhlIEVudGl0eVNldCBvciBFbnRpdHlUeXBlLlxuXHQgKlxuXHQgKiBAcGFyYW0gc01ldGFQYXRoXG5cdCAqIEBwYXJhbSBvVmlld1xuXHQgKiBAcGFyYW0gb0RpYWdub3N0aWNzXG5cdCAqIEByZXR1cm5zIC0gVGhlIGFnZ3JlZ2F0ZXNcblx0ICovXG5cdF9nZXRBZ2dyZWdhdGVzKHNNZXRhUGF0aDogc3RyaW5nLCBvVmlldzogVmlldywgb0RpYWdub3N0aWNzOiBEaWFnbm9zdGljcykge1xuXHRcdGNvbnN0IGNvbnZlcnRlckNvbnRleHQgPSB0aGlzLl9nZXRDb252ZXJ0ZXJDb250ZXh0KHNNZXRhUGF0aCwgb1ZpZXcsIG9EaWFnbm9zdGljcyk7XG5cdFx0Y29uc3QgYWdncmVnYXRpb25IZWxwZXIgPSBuZXcgQWdncmVnYXRpb25IZWxwZXIoY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCksIGNvbnZlcnRlckNvbnRleHQpO1xuXHRcdGNvbnN0IGlzQW5hbHl0aWNzU3VwcG9ydGVkID0gYWdncmVnYXRpb25IZWxwZXIuaXNBbmFseXRpY3NTdXBwb3J0ZWQoKTtcblx0XHRsZXQgdHJhbnNBZ2dyZWdhdGlvbnMsIGN1c3RvbUFnZ3JlZ2F0ZXM7XG5cdFx0aWYgKGlzQW5hbHl0aWNzU3VwcG9ydGVkKSB7XG5cdFx0XHR0cmFuc0FnZ3JlZ2F0aW9ucyA9IGFnZ3JlZ2F0aW9uSGVscGVyLmdldFRyYW5zQWdncmVnYXRpb25zKCk7XG5cdFx0XHRpZiAodHJhbnNBZ2dyZWdhdGlvbnM/Lmxlbmd0aCkge1xuXHRcdFx0XHR0cmFuc0FnZ3JlZ2F0aW9ucyA9IHRyYW5zQWdncmVnYXRpb25zLm1hcCgodHJhbnNBZ2c6IGFueSkgPT4ge1xuXHRcdFx0XHRcdHJldHVybiB0cmFuc0FnZy5OYW1lIHx8IHRyYW5zQWdnLlZhbHVlO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGN1c3RvbUFnZ3JlZ2F0ZXMgPSBhZ2dyZWdhdGlvbkhlbHBlci5nZXRDdXN0b21BZ2dyZWdhdGVEZWZpbml0aW9ucygpO1xuXHRcdFx0aWYgKGN1c3RvbUFnZ3JlZ2F0ZXM/Lmxlbmd0aCkge1xuXHRcdFx0XHRjdXN0b21BZ2dyZWdhdGVzID0gY3VzdG9tQWdncmVnYXRlcy5tYXAoKGN1c3RvbUFnZ3JlZ2F0ZTogYW55KSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIGN1c3RvbUFnZ3JlZ2F0ZS5xdWFsaWZpZXI7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR0cmFuc0FnZ3JlZ2F0aW9ucyA9IHRyYW5zQWdncmVnYXRpb25zID8gdHJhbnNBZ2dyZWdhdGlvbnMgOiBbXTtcblx0XHRjdXN0b21BZ2dyZWdhdGVzID0gY3VzdG9tQWdncmVnYXRlcyA/IGN1c3RvbUFnZ3JlZ2F0ZXMgOiBbXTtcblx0XHRyZXR1cm4geyB0cmFuc0FnZ3JlZ2F0aW9ucywgY3VzdG9tQWdncmVnYXRlcyB9O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgY29udmVydGVyQ29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIHNNZXRhUGF0aFxuXHQgKiBAcGFyYW0gb1ZpZXdcblx0ICogQHBhcmFtIG9EaWFnbm9zdGljc1xuXHQgKiBAcmV0dXJucyAtIENvbnZlcnRlckNvbnRleHRcblx0ICovXG5cdF9nZXRDb252ZXJ0ZXJDb250ZXh0KHNNZXRhUGF0aDogc3RyaW5nLCBvVmlldzogVmlldywgb0RpYWdub3N0aWNzOiBEaWFnbm9zdGljcykge1xuXHRcdGNvbnN0IG9WaWV3RGF0YTogYW55ID0gb1ZpZXcuZ2V0Vmlld0RhdGEoKTtcblx0XHRsZXQgc0VudGl0eVNldCA9IG9WaWV3RGF0YS5lbnRpdHlTZXQ7XG5cdFx0Y29uc3Qgc0NvbnRleHRQYXRoID0gb1ZpZXdEYXRhLmNvbnRleHRQYXRoO1xuXHRcdGlmIChzQ29udGV4dFBhdGggJiYgKCFzRW50aXR5U2V0IHx8IHNFbnRpdHlTZXQuaW5jbHVkZXMoXCIvXCIpKSkge1xuXHRcdFx0c0VudGl0eVNldCA9IG9WaWV3RGF0YT8uZnVsbENvbnRleHRQYXRoLnNwbGl0KFwiL1wiKVsxXTtcblx0XHR9XG5cdFx0cmV0dXJuIENvbW1vblV0aWxzLmdldENvbnZlcnRlckNvbnRleHRGb3JQYXRoKFxuXHRcdFx0c01ldGFQYXRoLFxuXHRcdFx0b1ZpZXcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCxcblx0XHRcdHNFbnRpdHlTZXQsXG5cdFx0XHRvRGlhZ25vc3RpY3Ncblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrIGlmIHBhdGgtYmFzZWQgRmllbGRDb250cm9sIGV2YWx1YXRlcyB0byBpbmFwcGxpY2FibGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBzRmllbGRDb250cm9sUGF0aCBGaWVsZCBjb250cm9sIHBhdGhcblx0ICogQHBhcmFtIG9BdHRyaWJ1dGUgU2VtYW50aWNBdHRyaWJ1dGVzXG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiBpbmFwcGxpY2FibGVcblx0ICovXG5cdF9pc0ZpZWxkQ29udHJvbFBhdGhJbmFwcGxpY2FibGUoc0ZpZWxkQ29udHJvbFBhdGg6IHN0cmluZywgb0F0dHJpYnV0ZTogYW55KSB7XG5cdFx0bGV0IGJJbmFwcGxpY2FibGUgPSBmYWxzZTtcblx0XHRjb25zdCBhUGFydHMgPSBzRmllbGRDb250cm9sUGF0aC5zcGxpdChcIi9cIik7XG5cdFx0Ly8gc2Vuc2l0aXZlIGRhdGEgaXMgcmVtb3ZlZCBvbmx5IGlmIHRoZSBwYXRoIGhhcyBhbHJlYWR5IGJlZW4gcmVzb2x2ZWQuXG5cdFx0aWYgKGFQYXJ0cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRiSW5hcHBsaWNhYmxlID1cblx0XHRcdFx0b0F0dHJpYnV0ZVthUGFydHNbMF1dICYmIG9BdHRyaWJ1dGVbYVBhcnRzWzBdXS5oYXNPd25Qcm9wZXJ0eShhUGFydHNbMV0pICYmIG9BdHRyaWJ1dGVbYVBhcnRzWzBdXVthUGFydHNbMV1dID09PSAwO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRiSW5hcHBsaWNhYmxlID0gb0F0dHJpYnV0ZVtzRmllbGRDb250cm9sUGF0aF0gPT09IDA7XG5cdFx0fVxuXHRcdHJldHVybiBiSW5hcHBsaWNhYmxlO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byByZXBsYWNlIExvY2FsIFByb3BlcnRpZXMgd2l0aCBTZW1hbnRpYyBPYmplY3QgbWFwcGluZ3MuXG5cdCAqXG5cdCAqIEBwYXJhbSBvU2VsZWN0aW9uVmFyaWFudCBTZWxlY3Rpb25WYXJpYW50IGNvbnNpc3Rpbmcgb2YgZmlsdGVyYmFyLCBUYWJsZSBhbmQgUGFnZSBDb250ZXh0XG5cdCAqIEBwYXJhbSB2TWFwcGluZ3MgQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2Ygc2VtYW50aWMgb2JqZWN0IG1hcHBpbmdcblx0ICogQHJldHVybnMgLSBNb2RpZmllZCBTZWxlY3Rpb25WYXJpYW50IHdpdGggTG9jYWxQcm9wZXJ0eSByZXBsYWNlZCB3aXRoIFNlbWFudGljT2JqZWN0UHJvcGVydGllcy5cblx0ICovXG5cdF9hcHBseVNlbWFudGljT2JqZWN0TWFwcGluZ3Mob1NlbGVjdGlvblZhcmlhbnQ6IFNlbGVjdGlvblZhcmlhbnQsIHZNYXBwaW5nczogb2JqZWN0IHwgc3RyaW5nKSB7XG5cdFx0Y29uc3Qgb01hcHBpbmdzID0gdHlwZW9mIHZNYXBwaW5ncyA9PT0gXCJzdHJpbmdcIiA/IEpTT04ucGFyc2Uodk1hcHBpbmdzKSA6IHZNYXBwaW5ncztcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IG9NYXBwaW5ncy5sZW5ndGg7IGkrKykge1xuXHRcdFx0Y29uc3Qgc0xvY2FsUHJvcGVydHkgPVxuXHRcdFx0XHQob01hcHBpbmdzW2ldW1wiTG9jYWxQcm9wZXJ0eVwiXSAmJiBvTWFwcGluZ3NbaV1bXCJMb2NhbFByb3BlcnR5XCJdW1wiJFByb3BlcnR5UGF0aFwiXSkgfHxcblx0XHRcdFx0KG9NYXBwaW5nc1tpXVtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTG9jYWxQcm9wZXJ0eVwiXSAmJlxuXHRcdFx0XHRcdG9NYXBwaW5nc1tpXVtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTG9jYWxQcm9wZXJ0eVwiXVtcIiRQYXRoXCJdKTtcblx0XHRcdGNvbnN0IHNTZW1hbnRpY09iamVjdFByb3BlcnR5ID1cblx0XHRcdFx0b01hcHBpbmdzW2ldW1wiU2VtYW50aWNPYmplY3RQcm9wZXJ0eVwiXSB8fCBvTWFwcGluZ3NbaV1bXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljT2JqZWN0UHJvcGVydHlcIl07XG5cdFx0XHRjb25zdCBvU2VsZWN0T3B0aW9uID0gb1NlbGVjdGlvblZhcmlhbnQuZ2V0U2VsZWN0T3B0aW9uKHNMb2NhbFByb3BlcnR5KTtcblx0XHRcdGlmIChvU2VsZWN0T3B0aW9uKSB7XG5cdFx0XHRcdC8vQ3JlYXRlIGEgbmV3IFNlbGVjdE9wdGlvbiB3aXRoIHNTZW1hbnRpY09iamVjdFByb3BlcnR5IGFzIHRoZSBwcm9wZXJ0eSBOYW1lIGFuZCByZW1vdmUgdGhlIG9sZGVyIG9uZVxuXHRcdFx0XHRvU2VsZWN0aW9uVmFyaWFudC5yZW1vdmVTZWxlY3RPcHRpb24oc0xvY2FsUHJvcGVydHkpO1xuXHRcdFx0XHRvU2VsZWN0aW9uVmFyaWFudC5tYXNzQWRkU2VsZWN0T3B0aW9uKHNTZW1hbnRpY09iamVjdFByb3BlcnR5LCBvU2VsZWN0T3B0aW9uKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG9TZWxlY3Rpb25WYXJpYW50O1xuXHR9XG5cblx0LyoqXG5cdCAqIE5hdmlnYXRlcyB0byBhbiBPdXRib3VuZCBwcm92aWRlZCBpbiB0aGUgbWFuaWZlc3QuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0gc091dGJvdW5kIElkZW50aWZpZXIgdG8gbG9jYXRpb24gdGhlIG91dGJvdW5kIGluIHRoZSBtYW5pZmVzdFxuXHQgKiBAcGFyYW0gbU5hdmlnYXRpb25QYXJhbWV0ZXJzIE9wdGlvbmFsIG1hcCBjb250YWluaW5nIGtleS92YWx1ZSBwYWlycyB0byBiZSBwYXNzZWQgdG8gdGhlIGludGVudFxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuSW50ZW50QmFzZWROYXZpZ2F0aW9uI25hdmlnYXRlT3V0Ym91bmRcblx0ICogQHNpbmNlIDEuODYuMFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdG5hdmlnYXRlT3V0Ym91bmQoc091dGJvdW5kOiBzdHJpbmcsIG1OYXZpZ2F0aW9uUGFyYW1ldGVyczogYW55KSB7XG5cdFx0bGV0IGFOYXZQYXJhbXM6IGFueVtdIHwgdW5kZWZpbmVkO1xuXHRcdGNvbnN0IG9NYW5pZmVzdEVudHJ5ID0gdGhpcy5iYXNlLmdldEFwcENvbXBvbmVudCgpLmdldE1hbmlmZXN0RW50cnkoXCJzYXAuYXBwXCIpLFxuXHRcdFx0b091dGJvdW5kID0gb01hbmlmZXN0RW50cnkuY3Jvc3NOYXZpZ2F0aW9uPy5vdXRib3VuZHM/LltzT3V0Ym91bmRdO1xuXHRcdGlmICghb091dGJvdW5kKSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJPdXRib3VuZCBpcyBub3QgZGVmaW5lZCBpbiBtYW5pZmVzdCEhXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBzU2VtYW50aWNPYmplY3QgPSBvT3V0Ym91bmQuc2VtYW50aWNPYmplY3QsXG5cdFx0XHRzQWN0aW9uID0gb091dGJvdW5kLmFjdGlvbixcblx0XHRcdG91dGJvdW5kUGFyYW1zID0gb091dGJvdW5kLnBhcmFtZXRlcnMgJiYgdGhpcy5nZXRPdXRib3VuZFBhcmFtcyhvT3V0Ym91bmQucGFyYW1ldGVycyk7XG5cblx0XHRpZiAobU5hdmlnYXRpb25QYXJhbWV0ZXJzKSB7XG5cdFx0XHRhTmF2UGFyYW1zID0gW107XG5cdFx0XHRPYmplY3Qua2V5cyhtTmF2aWdhdGlvblBhcmFtZXRlcnMpLmZvckVhY2goZnVuY3Rpb24gKGtleTogc3RyaW5nKSB7XG5cdFx0XHRcdGxldCBvUGFyYW1zOiBhbnk7XG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KG1OYXZpZ2F0aW9uUGFyYW1ldGVyc1trZXldKSkge1xuXHRcdFx0XHRcdGNvbnN0IGFWYWx1ZXMgPSBtTmF2aWdhdGlvblBhcmFtZXRlcnNba2V5XTtcblx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFWYWx1ZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdG9QYXJhbXMgPSB7fTtcblx0XHRcdFx0XHRcdG9QYXJhbXNba2V5XSA9IGFWYWx1ZXNbaV07XG5cdFx0XHRcdFx0XHRhTmF2UGFyYW1zPy5wdXNoKG9QYXJhbXMpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvUGFyYW1zID0ge307XG5cdFx0XHRcdFx0b1BhcmFtc1trZXldID0gbU5hdmlnYXRpb25QYXJhbWV0ZXJzW2tleV07XG5cdFx0XHRcdFx0YU5hdlBhcmFtcz8ucHVzaChvUGFyYW1zKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGlmIChhTmF2UGFyYW1zIHx8IG91dGJvdW5kUGFyYW1zKSB7XG5cdFx0XHRtTmF2aWdhdGlvblBhcmFtZXRlcnMgPSB7XG5cdFx0XHRcdG5hdmlnYXRpb25Db250ZXh0czoge1xuXHRcdFx0XHRcdGRhdGE6IGFOYXZQYXJhbXMgfHwgb3V0Ym91bmRQYXJhbXNcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9XG5cdFx0dGhpcy5iYXNlLl9pbnRlbnRCYXNlZE5hdmlnYXRpb24ubmF2aWdhdGUoc1NlbWFudGljT2JqZWN0LCBzQWN0aW9uLCBtTmF2aWdhdGlvblBhcmFtZXRlcnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBhcHBseSBvdXRib3VuZCBwYXJhbWV0ZXJzIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0LlxuXHQgKlxuXHQgKiBAcGFyYW0gb1NlbGVjdGlvblZhcmlhbnQgU2VsZWN0aW9uVmFyaWFudCBjb25zaXN0aW5nIG9mIGEgZmlsdGVyIGJhciwgYSB0YWJsZSwgYW5kIGEgcGFnZSBjb250ZXh0XG5cdCAqIEBwYXJhbSB2T3V0Ym91bmRQYXJhbXMgT3V0Ym91bmQgUHJvcGVydGllcyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuXHQgKiBAcmV0dXJucyAtIFRoZSBtb2RpZmllZCBTZWxlY3Rpb25WYXJpYW50IHdpdGggb3V0Ym91bmQgcGFyYW1ldGVycy5cblx0ICovXG5cdF9hcHBseU91dGJvdW5kUGFyYW1zKG9TZWxlY3Rpb25WYXJpYW50OiBTZWxlY3Rpb25WYXJpYW50LCB2T3V0Ym91bmRQYXJhbXM6IGFueSkge1xuXHRcdGNvbnN0IGFQYXJhbWV0ZXJzID0gT2JqZWN0LmtleXModk91dGJvdW5kUGFyYW1zKTtcblx0XHRjb25zdCBhU2VsZWN0UHJvcGVydGllcyA9IG9TZWxlY3Rpb25WYXJpYW50LmdldFNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzKCk7XG5cdFx0YVBhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbiAoa2V5OiBzdHJpbmcpIHtcblx0XHRcdGlmICghYVNlbGVjdFByb3BlcnRpZXMuaW5jbHVkZXMoa2V5KSkge1xuXHRcdFx0XHRvU2VsZWN0aW9uVmFyaWFudC5hZGRTZWxlY3RPcHRpb24oa2V5LCBcIklcIiwgXCJFUVwiLCB2T3V0Ym91bmRQYXJhbXNba2V5XSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIG9TZWxlY3Rpb25WYXJpYW50O1xuXHR9XG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgdGhlIG91dGJvdW5kIHBhcmFtZXRlcnMgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3QuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0gb091dGJvdW5kUGFyYW1zIFBhcmFtZXRlcnMgZGVmaW5lZCBpbiB0aGUgb3V0Ym91bmRzLiBPbmx5IFwicGxhaW5cIiBpcyBzdXBwb3J0ZWRcblx0ICogQHJldHVybnMgUGFyYW1ldGVycyB3aXRoIHRoZSBrZXktVmFsdWUgcGFpclxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGdldE91dGJvdW5kUGFyYW1zKG9PdXRib3VuZFBhcmFtczogYW55KSB7XG5cdFx0Y29uc3Qgb1BhcmFtc01hcHBpbmc6IGFueSA9IHt9O1xuXHRcdGlmIChvT3V0Ym91bmRQYXJhbXMpIHtcblx0XHRcdGNvbnN0IGFQYXJhbWV0ZXJzID0gT2JqZWN0LmtleXMob091dGJvdW5kUGFyYW1zKSB8fCBbXTtcblx0XHRcdGlmIChhUGFyYW1ldGVycy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGFQYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gKGtleTogc3RyaW5nKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb01hcHBpbmcgPSBvT3V0Ym91bmRQYXJhbXNba2V5XTtcblx0XHRcdFx0XHRpZiAob01hcHBpbmcudmFsdWUgJiYgb01hcHBpbmcudmFsdWUudmFsdWUgJiYgb01hcHBpbmcudmFsdWUuZm9ybWF0ID09PSBcInBsYWluXCIpIHtcblx0XHRcdFx0XHRcdGlmICghb1BhcmFtc01hcHBpbmdba2V5XSkge1xuXHRcdFx0XHRcdFx0XHRvUGFyYW1zTWFwcGluZ1trZXldID0gb01hcHBpbmcudmFsdWUudmFsdWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG9QYXJhbXNNYXBwaW5nO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRyaWdnZXJzIGFuIG91dGJvdW5kIG5hdmlnYXRpb24gd2hlbiBhIHVzZXIgY2hvb3NlcyB0aGUgY2hldnJvbi5cblx0ICpcblx0ICogQHBhcmFtIHtvYmplY3R9IG9Db250cm9sbGVyXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBzT3V0Ym91bmRUYXJnZXQgTmFtZSBvZiB0aGUgb3V0Ym91bmQgdGFyZ2V0IChuZWVkcyB0byBiZSBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdClcblx0ICogQHBhcmFtIHtzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dH0gb0NvbnRleHQgVGhlIGNvbnRleHQgdGhhdCBjb250YWlucyB0aGUgZGF0YSBmb3IgdGhlIHRhcmdldCBhcHBcblx0ICogQHBhcmFtIHtzdHJpbmd9IHNDcmVhdGVQYXRoIENyZWF0ZSBwYXRoIHdoZW4gdGhlIGNoZXZyb24gaXMgY3JlYXRlZC5cblx0ICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hpY2ggaXMgcmVzb2x2ZWQgb25jZSB0aGUgbmF2aWdhdGlvbiBpcyB0cmlnZ2VyZWRcblx0ICovXG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdG9uQ2hldnJvblByZXNzTmF2aWdhdGVPdXRCb3VuZChvQ29udHJvbGxlcjogUGFnZUNvbnRyb2xsZXIsIHNPdXRib3VuZFRhcmdldDogc3RyaW5nLCBvQ29udGV4dDogYW55LCBzQ3JlYXRlUGF0aDogc3RyaW5nKSB7XG5cdFx0Y29uc3Qgb091dGJvdW5kcyA9IChvQ29udHJvbGxlci5nZXRBcHBDb21wb25lbnQoKSBhcyBhbnkpLmdldFJvdXRpbmdTZXJ2aWNlKCkuZ2V0T3V0Ym91bmRzKCk7XG5cdFx0Y29uc3Qgb0Rpc3BsYXlPdXRib3VuZCA9IG9PdXRib3VuZHNbc091dGJvdW5kVGFyZ2V0XTtcblx0XHRsZXQgYWRkaXRpb25hbE5hdmlnYXRpb25QYXJhbWV0ZXJzO1xuXHRcdGlmIChvRGlzcGxheU91dGJvdW5kICYmIG9EaXNwbGF5T3V0Ym91bmQuc2VtYW50aWNPYmplY3QgJiYgb0Rpc3BsYXlPdXRib3VuZC5hY3Rpb24pIHtcblx0XHRcdGNvbnN0IG9SZWZyZXNoU3RyYXRlZ2llczogYW55ID0ge1xuXHRcdFx0XHRpbnRlbnRzOiB7fVxuXHRcdFx0fTtcblx0XHRcdGNvbnN0IG9EZWZhdWx0UmVmcmVzaFN0cmF0ZWd5OiBhbnkgPSB7fTtcblx0XHRcdGxldCBzTWV0YVBhdGg7XG5cblx0XHRcdGlmIChvQ29udGV4dCkge1xuXHRcdFx0XHRpZiAob0NvbnRleHQuaXNBICYmIG9Db250ZXh0LmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0XCIpKSB7XG5cdFx0XHRcdFx0c01ldGFQYXRoID0gTW9kZWxIZWxwZXIuZ2V0TWV0YVBhdGhGb3JDb250ZXh0KG9Db250ZXh0KTtcblx0XHRcdFx0XHRvQ29udGV4dCA9IFtvQ29udGV4dF07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c01ldGFQYXRoID0gTW9kZWxIZWxwZXIuZ2V0TWV0YVBhdGhGb3JDb250ZXh0KG9Db250ZXh0WzBdKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRvRGVmYXVsdFJlZnJlc2hTdHJhdGVneVtzTWV0YVBhdGhdID0gXCJzZWxmXCI7XG5cdFx0XHRcdG9SZWZyZXNoU3RyYXRlZ2llc1tcIl9mZURlZmF1bHRcIl0gPSBvRGVmYXVsdFJlZnJlc2hTdHJhdGVneTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHNDcmVhdGVQYXRoKSB7XG5cdFx0XHRcdGNvbnN0IHNLZXkgPSBgJHtvRGlzcGxheU91dGJvdW5kLnNlbWFudGljT2JqZWN0fS0ke29EaXNwbGF5T3V0Ym91bmQuYWN0aW9ufWA7XG5cdFx0XHRcdG9SZWZyZXNoU3RyYXRlZ2llcy5pbnRlbnRzW3NLZXldID0ge307XG5cdFx0XHRcdG9SZWZyZXNoU3RyYXRlZ2llcy5pbnRlbnRzW3NLZXldW3NDcmVhdGVQYXRoXSA9IFwic2VsZlwiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG9EaXNwbGF5T3V0Ym91bmQgJiYgb0Rpc3BsYXlPdXRib3VuZC5wYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdGNvbnN0IG9QYXJhbXMgPSBvRGlzcGxheU91dGJvdW5kLnBhcmFtZXRlcnMgJiYgdGhpcy5nZXRPdXRib3VuZFBhcmFtcyhvRGlzcGxheU91dGJvdW5kLnBhcmFtZXRlcnMpO1xuXHRcdFx0XHRpZiAoT2JqZWN0LmtleXMob1BhcmFtcykubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdGFkZGl0aW9uYWxOYXZpZ2F0aW9uUGFyYW1ldGVycyA9IG9QYXJhbXM7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0b0NvbnRyb2xsZXIuX2ludGVudEJhc2VkTmF2aWdhdGlvbi5uYXZpZ2F0ZShvRGlzcGxheU91dGJvdW5kLnNlbWFudGljT2JqZWN0LCBvRGlzcGxheU91dGJvdW5kLmFjdGlvbiwge1xuXHRcdFx0XHRuYXZpZ2F0aW9uQ29udGV4dHM6IG9Db250ZXh0LFxuXHRcdFx0XHRyZWZyZXNoU3RyYXRlZ2llczogb1JlZnJlc2hTdHJhdGVnaWVzLFxuXHRcdFx0XHRhZGRpdGlvbmFsTmF2aWdhdGlvblBhcmFtZXRlcnM6IGFkZGl0aW9uYWxOYXZpZ2F0aW9uUGFyYW1ldGVyc1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vVE9ETzogY2hlY2sgd2h5IHJldHVybmluZyBhIHByb21pc2UgaXMgcmVxdWlyZWRcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBvdXRib3VuZCB0YXJnZXQgJHtzT3V0Ym91bmRUYXJnZXR9IG5vdCBmb3VuZCBpbiBjcm9zcyBuYXZpZ2F0aW9uIGRlZmluaXRpb24gb2YgbWFuaWZlc3RgKTtcblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSW50ZXJuYWxJbnRlbnRCYXNlZE5hdmlnYXRpb247XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBdUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFQQSxJQVNNQSw2QkFBNkIsV0FEbENDLGNBQWMsQ0FBQyxrRUFBa0UsQ0FBQyxVQVlqRkMsY0FBYyxFQUFFLFVBa0NoQkMsZUFBZSxFQUFFLFVBQ2pCQyxjQUFjLEVBQUUsVUFtSmhCRCxlQUFlLEVBQUUsVUFDakJDLGNBQWMsRUFBRSxVQW9IaEJELGVBQWUsRUFBRSxVQUNqQkMsY0FBYyxFQUFFLFVBMEZoQkQsZUFBZSxFQUFFLFdBQ2pCRSxVQUFVLENBQUNDLGlCQUFpQixDQUFDQyxPQUFPLENBQUMsV0FjckNKLGVBQWUsRUFBRSxXQUNqQkMsY0FBYyxFQUFFLFdBa0NoQkksZ0JBQWdCLEVBQUUsV0FjbEJMLGVBQWUsRUFBRSxXQUNqQkMsY0FBYyxFQUFFLFdBMkxoQkQsZUFBZSxFQUFFLFdBQ2pCQyxjQUFjLEVBQUUsV0FrRWhCRCxlQUFlLEVBQUUsV0FDakJDLGNBQWMsRUFBRSxXQTZCaEJELGVBQWUsRUFBRSxXQUNqQkMsY0FBYyxFQUFFO0lBQUE7SUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBLE9BbnVCakJLLE1BQU0sR0FETixrQkFDUztNQUNSLElBQUksQ0FBQ0MsY0FBYyxHQUFHLElBQUksQ0FBQ0MsSUFBSSxDQUFDQyxlQUFlLEVBQUU7TUFDakQsSUFBSSxDQUFDQyxXQUFXLEdBQUcsSUFBSSxDQUFDSCxjQUFjLENBQUNJLFFB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