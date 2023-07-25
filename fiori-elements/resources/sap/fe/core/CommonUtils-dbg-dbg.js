/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/array/uniqueSort", "sap/base/util/merge", "sap/fe/core/converters/ConverterContext", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/SemanticDateOperators", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/type/TypeUtil", "sap/ui/core/Component", "sap/ui/core/Fragment", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/Device", "sap/ui/mdc/condition/FilterOperatorUtil", "sap/ui/mdc/condition/RangeOperator", "sap/ui/model/Filter", "./controls/AnyElement", "./helpers/MetaModelFunction", "./templating/FilterHelper"], function (Log, uniqueSort, mergeObjects, ConverterContext, MetaModelConverter, BindingToolkit, ModelHelper, SemanticDateOperators, StableIdHelper, TypeUtil, Component, Fragment, XMLPreprocessor, XMLTemplateProcessor, Device, FilterOperatorUtil, RangeOperator, Filter, AnyElement, MetaModelFunction, FilterHelper) {
  "use strict";

  var _exports = {};
  var getConditions = FilterHelper.getConditions;
  var system = Device.system;
  var generate = StableIdHelper.generate;
  var pathInModel = BindingToolkit.pathInModel;
  var compileExpression = BindingToolkit.compileExpression;
  function normalizeSearchTerm(sSearchTerm) {
    if (!sSearchTerm) {
      return undefined;
    }
    return sSearchTerm.replace(/"/g, " ").replace(/\\/g, "\\\\") //escape backslash characters. Can be removed if odata/binding handles backend errors responds.
    .split(/\s+/).reduce(function (sNormalized, sCurrentWord) {
      if (sCurrentWord !== "") {
        sNormalized = `${sNormalized ? `${sNormalized} ` : ""}"${sCurrentWord}"`;
      }
      return sNormalized;
    }, undefined);
  }
  async function waitForContextRequested(bindingContext) {
    var _dataModel$targetEnti;
    const model = bindingContext.getModel();
    const metaModel = model.getMetaModel();
    const entityPath = metaModel.getMetaPath(bindingContext.getPath());
    const dataModel = MetaModelConverter.getInvolvedDataModelObjects(metaModel.getContext(entityPath));
    await bindingContext.requestProperty((_dataModel$targetEnti = dataModel.targetEntityType.keys[0]) === null || _dataModel$targetEnti === void 0 ? void 0 : _dataModel$targetEnti.name);
  }
  function fnHasTransientContexts(oListBinding) {
    let bHasTransientContexts = false;
    if (oListBinding) {
      oListBinding.getCurrentContexts().forEach(function (oContext) {
        if (oContext && oContext.isTransient()) {
          bHasTransientContexts = true;
        }
      });
    }
    return bHasTransientContexts;
  }

  // there is no navigation in entitySet path and property path

  async function _getSOIntents(oShellServiceHelper, oObjectPageLayout, oSemanticObject, oParam) {
    return oShellServiceHelper.getLinks({
      semanticObject: oSemanticObject,
      params: oParam
    });
  }

  // TO-DO add this as part of applySemanticObjectmappings logic in IntentBasednavigation controller extension
  function _createMappings(oMapping) {
    const aSOMappings = [];
    const aMappingKeys = Object.keys(oMapping);
    let oSemanticMapping;
    for (let i = 0; i < aMappingKeys.length; i++) {
      oSemanticMapping = {
        LocalProperty: {
          $PropertyPath: aMappingKeys[i]
        },
        SemanticObjectProperty: oMapping[aMappingKeys[i]]
      };
      aSOMappings.push(oSemanticMapping);
    }
    return aSOMappings;
  }
  /**
   * @param aLinks
   * @param aExcludedActions
   * @param oTargetParams
   * @param aItems
   * @param aAllowedActions
   */
  function _getRelatedAppsMenuItems(aLinks, aExcludedActions, oTargetParams, aItems, aAllowedActions) {
    for (let i = 0; i < aLinks.length; i++) {
      const oLink = aLinks[i];
      const sIntent = oLink.intent;
      const sAction = sIntent.split("-")[1].split("?")[0];
      if (aAllowedActions && aAllowedActions.includes(sAction)) {
        aItems.push({
          text: oLink.text,
          targetSemObject: sIntent.split("#")[1].split("-")[0],
          targetAction: sAction.split("~")[0],
          targetParams: oTargetParams
        });
      } else if (!aAllowedActions && aExcludedActions && aExcludedActions.indexOf(sAction) === -1) {
        aItems.push({
          text: oLink.text,
          targetSemObject: sIntent.split("#")[1].split("-")[0],
          targetAction: sAction.split("~")[0],
          targetParams: oTargetParams
        });
      }
    }
  }
  function _getRelatedIntents(oAdditionalSemanticObjects, oBindingContext, aManifestSOItems, aLinks) {
    if (aLinks && aLinks.length > 0) {
      const aAllowedActions = oAdditionalSemanticObjects.allowedActions || undefined;
      const aExcludedActions = oAdditionalSemanticObjects.unavailableActions ? oAdditionalSemanticObjects.unavailableActions : [];
      const aSOMappings = oAdditionalSemanticObjects.mapping ? _createMappings(oAdditionalSemanticObjects.mapping) : [];
      const oTargetParams = {
        navigationContexts: oBindingContext,
        semanticObjectMapping: aSOMappings
      };
      _getRelatedAppsMenuItems(aLinks, aExcludedActions, oTargetParams, aManifestSOItems, aAllowedActions);
    }
  }

  /**
   * @description This function fetches the related intents when semantic object and action are passed from feEnvironment.getIntent() only in case of My Inbox integration
   * @param semanticObjectAndAction This specifies the semantic object and action for fetching the intents
   * @param oBindingContext This sepcifies the binding context for updating related apps
   * @param appComponentSOItems This is a list of semantic items used for updating the related apps button
   * @param aLinks This is an array comprising of related intents
   */

  function _getRelatedIntentsWithSemanticObjectsAndAction(semanticObjectAndAction, oBindingContext, appComponentSOItems, aLinks) {
    if (aLinks.length > 0) {
      const actions = [semanticObjectAndAction.action];
      const excludedActions = [];
      const soMappings = [];
      const targetParams = {
        navigationContexts: oBindingContext,
        semanticObjectMapping: soMappings
      };
      _getRelatedAppsMenuItems(aLinks, excludedActions, targetParams, appComponentSOItems, actions);
    }
  }
  async function updateRelateAppsModel(oBindingContext, oEntry, oObjectPageLayout, aSemKeys, oMetaModel, oMetaPath, appComponent) {
    const oShellServiceHelper = appComponent.getShellServices();
    const oParam = {};
    let sCurrentSemObj = "",
      sCurrentAction = "";
    let oSemanticObjectAnnotations;
    let aRelatedAppsMenuItems = [];
    let aExcludedActions = [];
    let aManifestSOKeys;
    async function fnGetParseShellHashAndGetLinks() {
      const oParsedUrl = oShellServiceHelper.parseShellHash(document.location.hash);
      sCurrentSemObj = oParsedUrl.semanticObject; // Current Semantic Object
      sCurrentAction = oParsedUrl.action;
      return _getSOIntents(oShellServiceHelper, oObjectPageLayout, sCurrentSemObj, oParam);
    }
    try {
      if (oEntry) {
        if (aSemKeys && aSemKeys.length > 0) {
          for (let j = 0; j < aSemKeys.length; j++) {
            const sSemKey = aSemKeys[j].$PropertyPath;
            if (!oParam[sSemKey]) {
              oParam[sSemKey] = {
                value: oEntry[sSemKey]
              };
            }
          }
        } else {
          // fallback to Technical Keys if no Semantic Key is present
          const aTechnicalKeys = oMetaModel.getObject(`${oMetaPath}/$Type/$Key`);
          for (const key in aTechnicalKeys) {
            const sObjKey = aTechnicalKeys[key];
            if (!oParam[sObjKey]) {
              oParam[sObjKey] = {
                value: oEntry[sObjKey]
              };
            }
          }
        }
      }
      // Logic to read additional SO from manifest and updated relatedapps model

      const oManifestData = getTargetView(oObjectPageLayout).getViewData();
      const aManifestSOItems = [];
      let semanticObjectIntents;
      if (oManifestData.additionalSemanticObjects) {
        aManifestSOKeys = Object.keys(oManifestData.additionalSemanticObjects);
        for (let key = 0; key < aManifestSOKeys.length; key++) {
          semanticObjectIntents = await Promise.resolve(_getSOIntents(oShellServiceHelper, oObjectPageLayout, aManifestSOKeys[key], oParam));
          _getRelatedIntents(oManifestData.additionalSemanticObjects[aManifestSOKeys[key]], oBindingContext, aManifestSOItems, semanticObjectIntents);
        }
      }

      // appComponentSOItems is updated in case of My Inbox integration when semantic object and action are passed from feEnvironment.getIntent() method
      // In other cases it remains as an empty list
      // We concat this list towards the end with aManifestSOItems

      const appComponentSOItems = [];
      const componentData = appComponent.getComponentData();
      if (componentData.feEnvironment && componentData.feEnvironment.getIntent()) {
        const intent = componentData.feEnvironment.getIntent();
        semanticObjectIntents = await Promise.resolve(_getSOIntents(oShellServiceHelper, oObjectPageLayout, intent.semanticObject, oParam));
        _getRelatedIntentsWithSemanticObjectsAndAction(intent, oBindingContext, appComponentSOItems, semanticObjectIntents);
      }
      const internalModelContext = oObjectPageLayout.getBindingContext("internal");
      const aLinks = await fnGetParseShellHashAndGetLinks();
      if (aLinks) {
        if (aLinks.length > 0) {
          let isSemanticObjectHasSameTargetInManifest = false;
          const oTargetParams = {};
          const aAnnotationsSOItems = [];
          const sEntitySetPath = `${oMetaPath}@`;
          const sEntityTypePath = `${oMetaPath}/@`;
          const oEntitySetAnnotations = oMetaModel.getObject(sEntitySetPath);
          oSemanticObjectAnnotations = CommonUtils.getSemanticObjectAnnotations(oEntitySetAnnotations, sCurrentSemObj);
          if (!oSemanticObjectAnnotations.bHasEntitySetSO) {
            const oEntityTypeAnnotations = oMetaModel.getObject(sEntityTypePath);
            oSemanticObjectAnnotations = CommonUtils.getSemanticObjectAnnotations(oEntityTypeAnnotations, sCurrentSemObj);
          }
          aExcludedActions = oSemanticObjectAnnotations.aUnavailableActions;
          //Skip same application from Related Apps
          aExcludedActions.push(sCurrentAction);
          oTargetParams.navigationContexts = oBindingContext;
          oTargetParams.semanticObjectMapping = oSemanticObjectAnnotations.aMappings;
          _getRelatedAppsMenuItems(aLinks, aExcludedActions, oTargetParams, aAnnotationsSOItems);
          aManifestSOItems.forEach(function (_ref) {
            var _aAnnotationsSOItems$;
            let {
              targetSemObject
            } = _ref;
            if (((_aAnnotationsSOItems$ = aAnnotationsSOItems[0]) === null || _aAnnotationsSOItems$ === void 0 ? void 0 : _aAnnotationsSOItems$.targetSemObject) === targetSemObject) {
              isSemanticObjectHasSameTargetInManifest = true;
            }
          });

          // remove all actions from current hash application if manifest contains empty allowedActions
          if (oManifestData.additionalSemanticObjects && aAnnotationsSOItems[0] && oManifestData.additionalSemanticObjects[aAnnotationsSOItems[0].targetSemObject] && !!oManifestData.additionalSemanticObjects[aAnnotationsSOItems[0].targetSemObject].allowedActions) {
            isSemanticObjectHasSameTargetInManifest = true;
          }
          const soItems = aManifestSOItems.concat(appComponentSOItems);
          aRelatedAppsMenuItems = isSemanticObjectHasSameTargetInManifest ? soItems : soItems.concat(aAnnotationsSOItems);
          // If no app in list, related apps button will be hidden
          internalModelContext.setProperty("relatedApps/visibility", aRelatedAppsMenuItems.length > 0);
          internalModelContext.setProperty("relatedApps/items", aRelatedAppsMenuItems);
        } else {
          internalModelContext.setProperty("relatedApps/visibility", false);
        }
      } else {
        internalModelContext.setProperty("relatedApps/visibility", false);
      }
    } catch (error) {
      Log.error("Cannot read links", error);
    }
    return aRelatedAppsMenuItems;
  }
  function _getSemanticObjectAnnotations(oEntityAnnotations, sCurrentSemObj) {
    const oSemanticObjectAnnotations = {
      bHasEntitySetSO: false,
      aAllowedActions: [],
      aUnavailableActions: [],
      aMappings: []
    };
    let sAnnotationMappingTerm, sAnnotationActionTerm;
    let sQualifier;
    for (const key in oEntityAnnotations) {
      if (key.indexOf("com.sap.vocabularies.Common.v1.SemanticObject") > -1 && oEntityAnnotations[key] === sCurrentSemObj) {
        oSemanticObjectAnnotations.bHasEntitySetSO = true;
        sAnnotationMappingTerm = `@${"com.sap.vocabularies.Common.v1.SemanticObjectMapping"}`;
        sAnnotationActionTerm = `@${"com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions"}`;
        if (key.indexOf("#") > -1) {
          sQualifier = key.split("#")[1];
          sAnnotationMappingTerm = `${sAnnotationMappingTerm}#${sQualifier}`;
          sAnnotationActionTerm = `${sAnnotationActionTerm}#${sQualifier}`;
        }
        if (oEntityAnnotations[sAnnotationMappingTerm]) {
          oSemanticObjectAnnotations.aMappings = oSemanticObjectAnnotations.aMappings.concat(oEntityAnnotations[sAnnotationMappingTerm]);
        }
        if (oEntityAnnotations[sAnnotationActionTerm]) {
          oSemanticObjectAnnotations.aUnavailableActions = oSemanticObjectAnnotations.aUnavailableActions.concat(oEntityAnnotations[sAnnotationActionTerm]);
        }
        break;
      }
    }
    return oSemanticObjectAnnotations;
  }
  function fnUpdateRelatedAppsDetails(oObjectPageLayout, appComponent) {
    const oMetaModel = oObjectPageLayout.getModel().getMetaModel();
    const oBindingContext = oObjectPageLayout.getBindingContext();
    const path = oBindingContext && oBindingContext.getPath() || "";
    const oMetaPath = oMetaModel.getMetaPath(path);
    // Semantic Key Vocabulary
    const sSemanticKeyVocabulary = `${oMetaPath}/` + `@com.sap.vocabularies.Common.v1.SemanticKey`;
    //Semantic Keys
    const aSemKeys = oMetaModel.getObject(sSemanticKeyVocabulary);
    // Unavailable Actions
    const oEntry = oBindingContext === null || oBindingContext === void 0 ? void 0 : oBindingContext.getObject();
    if (!oEntry && oBindingContext) {
      oBindingContext.requestObject().then(async function (requestedObject) {
        return CommonUtils.updateRelateAppsModel(oBindingContext, requestedObject, oObjectPageLayout, aSemKeys, oMetaModel, oMetaPath, appComponent);
      }).catch(function (oError) {
        Log.error("Cannot update the related app details", oError);
      });
    } else {
      return CommonUtils.updateRelateAppsModel(oBindingContext, oEntry, oObjectPageLayout, aSemKeys, oMetaModel, oMetaPath, appComponent);
    }
  }

  /**
   * @param oButton
   */
  function fnFireButtonPress(oButton) {
    if (oButton && oButton.isA(["sap.m.Button", "sap.m.OverflowToolbarButton"]) && oButton.getVisible() && oButton.getEnabled()) {
      oButton.firePress();
    }
  }
  function getAppComponent(oControl) {
    if (oControl.isA("sap.fe.core.AppComponent")) {
      return oControl;
    }
    const oOwner = Component.getOwnerComponentFor(oControl);
    if (!oOwner) {
      throw new Error("There should be a sap.fe.core.AppComponent as owner of the control");
    } else {
      return getAppComponent(oOwner);
    }
  }
  function getCurrentPageView(oAppComponent) {
    const rootViewController = oAppComponent.getRootViewController();
    return rootViewController.isFclEnabled() ? rootViewController.getRightmostView() : CommonUtils.getTargetView(oAppComponent.getRootContainer().getCurrentPage());
  }
  function getTargetView(oControl) {
    if (oControl && oControl.isA("sap.ui.core.ComponentContainer")) {
      const oComponent = oControl.getComponentInstance();
      oControl = oComponent && oComponent.getRootControl();
    }
    while (oControl && !oControl.isA("sap.ui.core.mvc.View")) {
      oControl = oControl.getParent();
    }
    return oControl;
  }
  function _fnCheckIsMatch(oObject, oKeysToCheck) {
    for (const sKey in oKeysToCheck) {
      if (oKeysToCheck[sKey] !== oObject[sKey]) {
        return false;
      }
    }
    return true;
  }
  function fnGetContextPathProperties(metaModelContext, sContextPath, oFilter) {
    const oEntityType = metaModelContext.getObject(`${sContextPath}/`) || {},
      oProperties = {};
    for (const sKey in oEntityType) {
      if (oEntityType.hasOwnProperty(sKey) && !/^\$/i.test(sKey) && oEntityType[sKey].$kind && _fnCheckIsMatch(oEntityType[sKey], oFilter || {
        $kind: "Property"
      })) {
        oProperties[sKey] = oEntityType[sKey];
      }
    }
    return oProperties;
  }
  function fnGetMandatoryFilterFields(oMetaModel, sContextPath) {
    let aMandatoryFilterFields = [];
    if (oMetaModel && sContextPath) {
      aMandatoryFilterFields = oMetaModel.getObject(`${sContextPath}@Org.OData.Capabilities.V1.FilterRestrictions/RequiredProperties`);
    }
    return aMandatoryFilterFields;
  }
  function fnGetIBNActions(oControl, aIBNActions) {
    const aActions = oControl && oControl.getActions();
    if (aActions) {
      aActions.forEach(function (oAction) {
        if (oAction.isA("sap.ui.mdc.actiontoolbar.ActionToolbarAction")) {
          oAction = oAction.getAction();
        }
        if (oAction.isA("sap.m.MenuButton")) {
          const oMenu = oAction.getMenu();
          const aItems = oMenu.getItems();
          aItems.forEach(oItem => {
            if (oItem.data("IBNData")) {
              aIBNActions.push(oItem);
            }
          });
        } else if (oAction.data("IBNData")) {
          aIBNActions.push(oAction);
        }
      });
    }
    return aIBNActions;
  }

  /**
   * @param aIBNActions
   * @param oView
   */
  function fnUpdateDataFieldForIBNButtonsVisibility(aIBNActions, oView) {
    const oParams = {};
    const oAppComponent = CommonUtils.getAppComponent(oView);
    const isSticky = ModelHelper.isStickySessionSupported(oView.getModel().getMetaModel());
    const fnGetLinks = function (oData) {
      if (oData) {
        const aKeys = Object.keys(oData);
        aKeys.forEach(function (sKey) {
          if (sKey.indexOf("_") !== 0 && sKey.indexOf("odata.context") === -1) {
            oParams[sKey] = {
              value: oData[sKey]
            };
          }
        });
      }
      if (aIBNActions.length) {
        aIBNActions.forEach(function (oIBNAction) {
          const sSemanticObject = oIBNAction.data("IBNData").semanticObject;
          const sAction = oIBNAction.data("IBNData").action;
          oAppComponent.getShellServices().getLinks({
            semanticObject: sSemanticObject,
            action: sAction,
            params: oParams
          }).then(function (aLink) {
            oIBNAction.setVisible(oIBNAction.getVisible() && aLink && aLink.length === 1);
            if (isSticky) {
              oIBNAction.getBindingContext("internal").setProperty(oIBNAction.getId().split("--")[1], {
                shellNavigationNotAvailable: !(aLink && aLink.length === 1)
              });
            }
            return;
          }).catch(function (oError) {
            Log.error("Cannot retrieve the links from the shell service", oError);
          });
        });
      }
    };
    if (oView && oView.getBindingContext()) {
      var _oView$getBindingCont;
      (_oView$getBindingCont = oView.getBindingContext()) === null || _oView$getBindingCont === void 0 ? void 0 : _oView$getBindingCont.requestObject().then(function (oData) {
        return fnGetLinks(oData);
      }).catch(function (oError) {
        Log.error("Cannot retrieve the links from the shell service", oError);
      });
    } else {
      fnGetLinks();
    }
  }
  function getActionPath(actionContext, bReturnOnlyPath, inActionName, bCheckStaticValue) {
    const sActionName = !inActionName ? actionContext.getObject(actionContext.getPath()).toString() : inActionName;
    let sContextPath = actionContext.getPath().split("/@")[0];
    const sEntityTypeName = actionContext.getObject(sContextPath).$Type;
    const sEntityName = getEntitySetName(actionContext.getModel(), sEntityTypeName);
    if (sEntityName) {
      sContextPath = `/${sEntityName}`;
    }
    if (bCheckStaticValue) {
      return actionContext.getObject(`${sContextPath}/${sActionName}@Org.OData.Core.V1.OperationAvailable`);
    }
    if (bReturnOnlyPath) {
      return `${sContextPath}/${sActionName}`;
    } else {
      return {
        sContextPath: sContextPath,
        sProperty: actionContext.getObject(`${sContextPath}/${sActionName}@Org.OData.Core.V1.OperationAvailable/$Path`),
        sBindingParameter: actionContext.getObject(`${sContextPath}/${sActionName}/@$ui5.overload/0/$Parameter/0/$Name`)
      };
    }
  }
  function getEntitySetName(oMetaModel, sEntityType) {
    const oEntityContainer = oMetaModel.getObject("/");
    for (const key in oEntityContainer) {
      if (typeof oEntityContainer[key] === "object" && oEntityContainer[key].$Type === sEntityType) {
        return key;
      }
    }
  }
  function computeDisplayMode(oPropertyAnnotations, oCollectionAnnotations) {
    const oTextAnnotation = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"],
      oTextArrangementAnnotation = oTextAnnotation && (oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"] || oCollectionAnnotations && oCollectionAnnotations["@com.sap.vocabularies.UI.v1.TextArrangement"]);
    if (oTextArrangementAnnotation) {
      if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly") {
        return "Description";
      } else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast") {
        return "ValueDescription";
      } else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextSeparate") {
        return "Value";
      }
      //Default should be TextFirst if there is a Text annotation and neither TextOnly nor TextLast are set
      return "DescriptionValue";
    }
    return oTextAnnotation ? "DescriptionValue" : "Value";
  }
  function _getEntityType(oContext) {
    const oMetaModel = oContext.getModel().getMetaModel();
    return oMetaModel.getObject(`${oMetaModel.getMetaPath(oContext.getPath())}/$Type`);
  }
  async function _requestObject(sAction, oSelectedContext, sProperty) {
    let oContext = oSelectedContext;
    const nBracketIndex = sAction.indexOf("(");
    if (nBracketIndex > -1) {
      const sTargetType = sAction.slice(nBracketIndex + 1, -1);
      let sCurrentType = _getEntityType(oContext);
      while (sCurrentType !== sTargetType) {
        // Find parent binding context and retrieve entity type
        oContext = oContext.getBinding().getContext();
        if (oContext) {
          sCurrentType = _getEntityType(oContext);
        } else {
          Log.warning("Cannot determine target type to request property value for bound action invocation");
          return Promise.resolve(undefined);
        }
      }
    }
    return oContext.requestObject(sProperty);
  }
  async function requestProperty(oSelectedContext, sAction, sProperty, sDynamicActionEnabledPath) {
    const oPromise = sProperty && sProperty.indexOf("/") === 0 ? requestSingletonProperty(sProperty, oSelectedContext.getModel()) : _requestObject(sAction, oSelectedContext, sProperty);
    return oPromise.then(function (vPropertyValue) {
      return {
        vPropertyValue: vPropertyValue,
        oSelectedContext: oSelectedContext,
        sAction: sAction,
        sDynamicActionEnabledPath: sDynamicActionEnabledPath
      };
    });
  }
  async function setContextsBasedOnOperationAvailable(oInternalModelContext, aRequestPromises) {
    return Promise.all(aRequestPromises).then(function (aResults) {
      if (aResults.length) {
        const aApplicableContexts = [],
          aNotApplicableContexts = [];
        aResults.forEach(function (aResult) {
          if (aResult) {
            if (aResult.vPropertyValue) {
              oInternalModelContext.getModel().setProperty(aResult.sDynamicActionEnabledPath, true);
              aApplicableContexts.push(aResult.oSelectedContext);
            } else {
              aNotApplicableContexts.push(aResult.oSelectedContext);
            }
          }
        });
        setDynamicActionContexts(oInternalModelContext, aResults[0].sAction, aApplicableContexts, aNotApplicableContexts);
      }
      return;
    }).catch(function (oError) {
      Log.trace("Cannot retrieve property value from path", oError);
    });
  }

  /**
   * @param oInternalModelContext
   * @param sAction
   * @param aApplicable
   * @param aNotApplicable
   */
  function setDynamicActionContexts(oInternalModelContext, sAction, aApplicable, aNotApplicable) {
    const sDynamicActionPathPrefix = `${oInternalModelContext.getPath()}/dynamicActions/${sAction}`,
      oInternalModel = oInternalModelContext.getModel();
    oInternalModel.setProperty(`${sDynamicActionPathPrefix}/aApplicable`, aApplicable);
    oInternalModel.setProperty(`${sDynamicActionPathPrefix}/aNotApplicable`, aNotApplicable);
  }
  function _getDefaultOperators(sPropertyType) {
    // mdc defines the full set of operations that are meaningful for each Edm Type
    // TODO Replace with model / internal way of retrieving the actual model type used for the property
    const oDataClass = TypeUtil.getDataTypeClassName(sPropertyType);
    // TODO need to pass proper formatOptions, constraints here
    const oBaseType = TypeUtil.getBaseType(oDataClass, {}, {});
    return FilterOperatorUtil.getOperatorsForType(oBaseType);
  }
  function _getRestrictions(aDefaultOps, aExpressionOps) {
    // From the default set of Operators for the Base Type, select those that are defined in the Allowed Value.
    // In case that no operators are found, return undefined so that the default set is used.
    return aDefaultOps.filter(function (sElement) {
      return aExpressionOps.indexOf(sElement) > -1;
    });
  }
  function getSpecificAllowedExpression(aExpressions) {
    const aAllowedExpressionsPriority = CommonUtils.AllowedExpressionsPrio;
    aExpressions.sort(function (a, b) {
      return aAllowedExpressionsPriority.indexOf(a) - aAllowedExpressionsPriority.indexOf(b);
    });
    return aExpressions[0];
  }

  /**
   * Method to fetch the correct operators based on the filter restrictions that can be annotated on an entity set or a navigation property.
   * We return the correct operators based on the specified restriction and also check for the operators defined in the manifest to include or exclude them.
   *
   * @param sProperty String name of the property
   * @param sEntitySetPath String path to the entity set
   * @param oContext Context used during templating
   * @param sType String data type od the property, for example edm.Date
   * @param bUseSemanticDateRange Boolean passed from the manifest for semantic date range
   * @param sSettings Stringified object of the property settings
   * @returns An array of strings representing operators for filtering
   */
  function getOperatorsForProperty(sProperty, sEntitySetPath, oContext, sType, bUseSemanticDateRange, sSettings) {
    const oFilterRestrictions = CommonUtils.getFilterRestrictionsByPath(sEntitySetPath, oContext);
    const aEqualsOps = ["EQ"];
    const aSingleRangeOps = ["EQ", "GE", "LE", "LT", "GT", "BT", "NOTLE", "NOTLT", "NOTGE", "NOTGT"];
    const aSingleRangeDTBasicOps = ["EQ", "BT"];
    const aSingleValueDateOps = ["TODAY", "TOMORROW", "YESTERDAY", "DATE", "FIRSTDAYWEEK", "LASTDAYWEEK", "FIRSTDAYMONTH", "LASTDAYMONTH", "FIRSTDAYQUARTER", "LASTDAYQUARTER", "FIRSTDAYYEAR", "LASTDAYYEAR"];
    const aMultiRangeOps = ["EQ", "GE", "LE", "LT", "GT", "BT", "NE", "NOTBT", "NOTLE", "NOTLT", "NOTGE", "NOTGT"];
    const aSearchExpressionOps = ["Contains", "NotContains", "StartsWith", "NotStartsWith", "EndsWith", "NotEndsWith"];
    const aSemanticDateOpsExt = SemanticDateOperators.getSupportedOperations();
    const bSemanticDateRange = bUseSemanticDateRange === "true" || bUseSemanticDateRange === true;
    let aSemanticDateOps = [];
    const oSettings = sSettings && typeof sSettings === "string" ? JSON.parse(sSettings).customData : sSettings;
    if (oContext.getObject(`${sEntitySetPath}/@com.sap.vocabularies.Common.v1.ResultContext`) === true) {
      return aEqualsOps;
    }
    if (oSettings && oSettings.operatorConfiguration && oSettings.operatorConfiguration.length > 0) {
      aSemanticDateOps = SemanticDateOperators.getFilterOperations(oSettings.operatorConfiguration, sType);
    } else {
      aSemanticDateOps = SemanticDateOperators.getSemanticDateOperations(sType);
    }
    // Get the default Operators for this Property Type
    let aDefaultOperators = _getDefaultOperators(sType);
    if (bSemanticDateRange) {
      aDefaultOperators = aSemanticDateOpsExt.concat(aDefaultOperators);
    }
    let restrictions = [];

    // Is there a Filter Restriction defined for this property?
    if (oFilterRestrictions && oFilterRestrictions.FilterAllowedExpressions && oFilterRestrictions.FilterAllowedExpressions[sProperty]) {
      // Extending the default operators list with Semantic Date options DATERANGE, DATE, FROM and TO
      const sAllowedExpression = CommonUtils.getSpecificAllowedExpression(oFilterRestrictions.FilterAllowedExpressions[sProperty]);
      // In case more than one Allowed Expressions has been defined for a property
      // choose the most restrictive Allowed Expression

      // MultiValue has same Operator as SingleValue, but there can be more than one (maxConditions)
      switch (sAllowedExpression) {
        case "SingleValue":
          const aSingleValueOps = sType === "Edm.Date" && bSemanticDateRange ? aSingleValueDateOps : aEqualsOps;
          restrictions = _getRestrictions(aDefaultOperators, aSingleValueOps);
          break;
        case "MultiValue":
          restrictions = _getRestrictions(aDefaultOperators, aEqualsOps);
          break;
        case "SingleRange":
          let aExpressionOps;
          if (bSemanticDateRange) {
            if (sType === "Edm.Date") {
              aExpressionOps = aSemanticDateOps;
            } else if (sType === "Edm.DateTimeOffset") {
              aExpressionOps = aSemanticDateOps;
            } else {
              aExpressionOps = aSingleRangeOps;
            }
          } else if (sType === "Edm.DateTimeOffset") {
            aExpressionOps = aSingleRangeDTBasicOps;
          } else {
            aExpressionOps = aSingleRangeOps;
          }
          const sOperators = _getRestrictions(aDefaultOperators, aExpressionOps);
          restrictions = sOperators;
          break;
        case "MultiRange":
          restrictions = _getRestrictions(aDefaultOperators, aMultiRangeOps);
          break;
        case "SearchExpression":
          restrictions = _getRestrictions(aDefaultOperators, aSearchExpressionOps);
          break;
        case "MultiRangeOrSearchExpression":
          restrictions = _getRestrictions(aDefaultOperators, aSearchExpressionOps.concat(aMultiRangeOps));
          break;
        default:
          break;
      }
      // In case AllowedExpressions is not recognised, undefined in return results in the default set of
      // operators for the type.
    }

    return restrictions;
  }

  /**
   * Method to return allowed operators for type Guid.
   *
   * @function
   * @name getOperatorsForGuidProperty
   * @returns Allowed operators for type Guid
   */
  _exports.getOperatorsForProperty = getOperatorsForProperty;
  function getOperatorsForGuidProperty() {
    const allowedOperatorsForGuid = ["EQ", "NE"];
    return allowedOperatorsForGuid.toString();
  }
  function getOperatorsForDateProperty(propertyType) {
    // In case AllowedExpressions is not provided for type Edm.Date then all the default
    // operators for the type should be returned excluding semantic operators from the list.
    const aDefaultOperators = _getDefaultOperators(propertyType);
    const aMultiRangeOps = ["EQ", "GE", "LE", "LT", "GT", "BT", "NE", "NOTBT", "NOTLE", "NOTLT", "NOTGE", "NOTGT"];
    return _getRestrictions(aDefaultOperators, aMultiRangeOps);
  }
  function getParameterInfo(metaModelContext, sContextPath) {
    const sParameterContextPath = sContextPath.substring(0, sContextPath.lastIndexOf("/"));
    const bResultContext = metaModelContext.getObject(`${sParameterContextPath}/@com.sap.vocabularies.Common.v1.ResultContext`);
    const oParameterInfo = {};
    if (bResultContext && sParameterContextPath !== sContextPath) {
      oParameterInfo.contextPath = sParameterContextPath;
      oParameterInfo.parameterProperties = CommonUtils.getContextPathProperties(metaModelContext, sParameterContextPath);
    }
    return oParameterInfo;
  }

  /**
   * Method to add the select Options to filter conditions.
   *
   * @function
   * @name addSelectOptionToConditions
   * @param oPropertyMetadata Property metadata information
   * @param aValidOperators Operators for all the data types
   * @param aSemanticDateOperators Operators for the Date type
   * @param aCumulativeConditions Filter conditions
   * @param oSelectOption Selectoption of selection variant
   * @returns The filter conditions
   */
  function addSelectOptionToConditions(oPropertyMetadata, aValidOperators, aSemanticDateOperators, aCumulativeConditions, oSelectOption) {
    var _oSelectOption$Semant;
    const oCondition = getConditions(oSelectOption, oPropertyMetadata);
    if (oSelectOption !== null && oSelectOption !== void 0 && oSelectOption.SemanticDates && aSemanticDateOperators && aSemanticDateOperators.indexOf(oSelectOption === null || oSelectOption === void 0 ? void 0 : (_oSelectOption$Semant = oSelectOption.SemanticDates) === null || _oSelectOption$Semant === void 0 ? void 0 : _oSelectOption$Semant.operator) > -1) {
      const semanticDates = CommonUtils.addSemanticDatesToConditions(oSelectOption === null || oSelectOption === void 0 ? void 0 : oSelectOption.SemanticDates);
      if (semanticDates && Object.keys(semanticDates).length > 0) {
        aCumulativeConditions.push(semanticDates);
      }
    } else if (oCondition) {
      if (aValidOperators.length === 0 || aValidOperators.indexOf(oCondition.operator) > -1) {
        aCumulativeConditions.push(oCondition);
      }
    }
    return aCumulativeConditions;
  }

  /**
   * Method to add the semantic dates to filter conditions
   *
   * @function
   * @name addSemanticDatesToConditions
   * @param oSemanticDates Semantic date infomation
   * @returns The filter conditions containing semantic dates
   */

  function addSemanticDatesToConditions(oSemanticDates) {
    const values = [];
    if (oSemanticDates !== null && oSemanticDates !== void 0 && oSemanticDates.high) {
      values.push(oSemanticDates === null || oSemanticDates === void 0 ? void 0 : oSemanticDates.high);
    }
    if (oSemanticDates !== null && oSemanticDates !== void 0 && oSemanticDates.low) {
      values.push(oSemanticDates === null || oSemanticDates === void 0 ? void 0 : oSemanticDates.low);
    }
    return {
      values: values,
      operator: oSemanticDates === null || oSemanticDates === void 0 ? void 0 : oSemanticDates.operator,
      isEmpty: undefined
    };
  }
  function addSelectOptionsToConditions(sContextPath, oSelectionVariant, sSelectOptionProp, oConditions, sConditionPath, sConditionProp, oValidProperties, metaModelContext, isParameter, bIsFLPValuePresent, bUseSemanticDateRange, oViewData) {
    let aConditions = [],
      aSelectOptions,
      aValidOperators,
      aSemanticDateOperators = [];
    if (isParameter || MetaModelFunction.isPropertyFilterable(metaModelContext, sContextPath, sConditionProp, true)) {
      const oPropertyMetadata = oValidProperties[sConditionProp];
      aSelectOptions = oSelectionVariant.getSelectOption(sSelectOptionProp);
      const settings = getFilterConfigurationSetting(oViewData, sConditionProp);
      aValidOperators = isParameter ? ["EQ"] : CommonUtils.getOperatorsForProperty(sConditionProp, sContextPath, metaModelContext);
      if (bUseSemanticDateRange) {
        aSemanticDateOperators = isParameter ? ["EQ"] : CommonUtils.getOperatorsForProperty(sConditionProp, sContextPath, metaModelContext, oPropertyMetadata === null || oPropertyMetadata === void 0 ? void 0 : oPropertyMetadata.$Type, bUseSemanticDateRange, settings);
      }
      // Create conditions for all the selectOptions of the property
      aConditions = isParameter ? CommonUtils.addSelectOptionToConditions(oPropertyMetadata, aValidOperators, aSemanticDateOperators, aConditions, aSelectOptions[0]) : aSelectOptions.reduce(CommonUtils.addSelectOptionToConditions.bind(null, oPropertyMetadata, aValidOperators, aSemanticDateOperators), aConditions);
      if (aConditions.length) {
        if (sConditionPath) {
          oConditions[sConditionPath + sConditionProp] = oConditions.hasOwnProperty(sConditionPath + sConditionProp) ? oConditions[sConditionPath + sConditionProp].concat(aConditions) : aConditions;
        } else if (bIsFLPValuePresent) {
          // If FLP values are present replace it with FLP values
          aConditions.forEach(element => {
            element["filtered"] = true;
          });
          if (oConditions.hasOwnProperty(sConditionProp)) {
            oConditions[sConditionProp].forEach(element => {
              element["filtered"] = false;
            });
            oConditions[sConditionProp] = oConditions[sConditionProp].concat(aConditions);
          } else {
            oConditions[sConditionProp] = aConditions;
          }
        } else {
          oConditions[sConditionProp] = oConditions.hasOwnProperty(sConditionProp) ? oConditions[sConditionProp].concat(aConditions) : aConditions;
        }
      }
    }
  }

  /**
   * Method to create the semantic dates from filter conditions
   *
   * @function
   * @name createSemanticDatesFromConditions
   * @param oCondition Filter field condition
   * @param sFilterName Filter Field Path
   * @returns The Semantic date conditions
   */

  function createSemanticDatesFromConditions(oCondition) {
    var _oCondition$values, _oCondition$values2;
    return {
      high: (oCondition === null || oCondition === void 0 ? void 0 : (_oCondition$values = oCondition.values) === null || _oCondition$values === void 0 ? void 0 : _oCondition$values[0]) || null,
      low: (oCondition === null || oCondition === void 0 ? void 0 : (_oCondition$values2 = oCondition.values) === null || _oCondition$values2 === void 0 ? void 0 : _oCondition$values2[1]) || null,
      operator: oCondition === null || oCondition === void 0 ? void 0 : oCondition.operator
    };
  }

  /**
   * Method to Return the filter configuration
   *
   * @function
   * @name getFilterConfigurationSetting
   * @param oViewData manifest Configuration
   * @param sProperty Filter Field Path
   * @returns The Filter Field Configuration
   */

  function getFilterConfigurationSetting() {
    var _oConfig$ComSapVoc, _filterConfig$sProper;
    let oViewData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    let sProperty = arguments.length > 1 ? arguments[1] : undefined;
    const oConfig = oViewData === null || oViewData === void 0 ? void 0 : oViewData.controlConfiguration;
    const filterConfig = oConfig && ((_oConfig$ComSapVoc = oConfig["@com.sap.vocabularies.UI.v1.SelectionFields"]) === null || _oConfig$ComSapVoc === void 0 ? void 0 : _oConfig$ComSapVoc.filterFields);
    return filterConfig !== null && filterConfig !== void 0 && filterConfig[sProperty] ? (_filterConfig$sProper = filterConfig[sProperty]) === null || _filterConfig$sProper === void 0 ? void 0 : _filterConfig$sProper.settings : undefined;
  }
  function addSelectionVariantToConditions(oSelectionVariant, oConditions, oMetaModelContext, sContextPath, bIsFLPValues, bUseSemanticDateRange, oViewData) {
    const aSelectOptionsPropertyNames = oSelectionVariant.getSelectOptionsPropertyNames(),
      oValidProperties = CommonUtils.getContextPathProperties(oMetaModelContext, sContextPath),
      aMetadatProperties = Object.keys(oValidProperties),
      oParameterInfo = CommonUtils.getParameterInfo(oMetaModelContext, sContextPath),
      sParameterContextPath = oParameterInfo.contextPath,
      oValidParameterProperties = oParameterInfo.parameterProperties;
    if (sParameterContextPath !== undefined && oValidParameterProperties && Object.keys(oValidParameterProperties).length > 0) {
      const aMetadataParameters = Object.keys(oValidParameterProperties);
      aMetadataParameters.forEach(function (sMetadataParameter) {
        let sSelectOptionName;
        if (aSelectOptionsPropertyNames.includes(`$Parameter.${sMetadataParameter}`)) {
          sSelectOptionName = `$Parameter.${sMetadataParameter}`;
        } else if (aSelectOptionsPropertyNames.includes(sMetadataParameter)) {
          sSelectOptionName = sMetadataParameter;
        } else if (sMetadataParameter.startsWith("P_") && aSelectOptionsPropertyNames.includes(`$Parameter.${sMetadataParameter.slice(2, sMetadataParameter.length)}`)) {
          sSelectOptionName = `$Parameter.${sMetadataParameter.slice(2, sMetadataParameter.length)}`;
        } else if (sMetadataParameter.startsWith("P_") && aSelectOptionsPropertyNames.includes(sMetadataParameter.slice(2, sMetadataParameter.length))) {
          sSelectOptionName = sMetadataParameter.slice(2, sMetadataParameter.length);
        } else if (aSelectOptionsPropertyNames.includes(`$Parameter.P_${sMetadataParameter}`)) {
          sSelectOptionName = `$Parameter.P_${sMetadataParameter}`;
        } else if (aSelectOptionsPropertyNames.includes(`P_${sMetadataParameter}`)) {
          sSelectOptionName = `P_${sMetadataParameter}`;
        }
        if (sSelectOptionName) {
          addSelectOptionsToConditions(sParameterContextPath, oSelectionVariant, sSelectOptionName, oConditions, undefined, sMetadataParameter, oValidParameterProperties, oMetaModelContext, true, bIsFLPValues, bUseSemanticDateRange, oViewData);
        }
      });
    }
    aMetadatProperties.forEach(function (sMetadataProperty) {
      let sSelectOptionName;
      if (aSelectOptionsPropertyNames.includes(sMetadataProperty)) {
        sSelectOptionName = sMetadataProperty;
      } else if (sMetadataProperty.startsWith("P_") && aSelectOptionsPropertyNames.includes(sMetadataProperty.slice(2, sMetadataProperty.length))) {
        sSelectOptionName = sMetadataProperty.slice(2, sMetadataProperty.length);
      } else if (aSelectOptionsPropertyNames.includes(`P_${sMetadataProperty}`)) {
        sSelectOptionName = `P_${sMetadataProperty}`;
      }
      if (sSelectOptionName) {
        addSelectOptionsToConditions(sContextPath, oSelectionVariant, sSelectOptionName, oConditions, undefined, sMetadataProperty, oValidProperties, oMetaModelContext, false, bIsFLPValues, bUseSemanticDateRange, oViewData);
      }
    });
    aSelectOptionsPropertyNames.forEach(function (sSelectOption) {
      if (sSelectOption.indexOf(".") > 0 && !sSelectOption.includes("$Parameter")) {
        const sReplacedOption = sSelectOption.replaceAll(".", "/");
        const sFullContextPath = `/${sReplacedOption}`.startsWith(sContextPath) ? `/${sReplacedOption}` : `${sContextPath}/${sReplacedOption}`; // check if the full path, eg SalesOrderManage._Item.Material exists in the metamodel
        if (oMetaModelContext.getObject(sFullContextPath.replace("P_", ""))) {
          _createConditionsForNavProperties(sFullContextPath, sContextPath, oSelectionVariant, sSelectOption, oMetaModelContext, oConditions, bIsFLPValues, bUseSemanticDateRange, oViewData);
        }
      }
    });
    return oConditions;
  }
  function _createConditionsForNavProperties(sFullContextPath, sMainEntitySetPath, oSelectionVariant, sSelectOption, oMetaModelContext, oConditions, bIsFLPValuePresent, bSemanticDateRange, oViewData) {
    let aNavObjectNames = sSelectOption.split(".");
    // Eg: "SalesOrderManage._Item._Material.Material" or "_Item.Material"
    if (`/${sSelectOption.replaceAll(".", "/")}`.startsWith(sMainEntitySetPath)) {
      const sFullPath = `/${sSelectOption}`.replaceAll(".", "/"),
        sNavPath = sFullPath.replace(`${sMainEntitySetPath}/`, "");
      aNavObjectNames = sNavPath.split("/");
    }
    let sConditionPath = "";
    const sPropertyName = aNavObjectNames[aNavObjectNames.length - 1]; // Material from SalesOrderManage._Item.Material
    for (let i = 0; i < aNavObjectNames.length - 1; i++) {
      if (oMetaModelContext.getObject(`${sMainEntitySetPath}/${aNavObjectNames[i].replace("P_", "")}`).$isCollection) {
        sConditionPath = `${sConditionPath + aNavObjectNames[i]}*/`; // _Item*/ in case of 1:n cardinality
      } else {
        sConditionPath = `${sConditionPath + aNavObjectNames[i]}/`; // _Item/ in case of 1:1 cardinality
      }

      sMainEntitySetPath = `${sMainEntitySetPath}/${aNavObjectNames[i]}`;
    }
    const sNavPropertyPath = sFullContextPath.slice(0, sFullContextPath.lastIndexOf("/")),
      oValidProperties = CommonUtils.getContextPathProperties(oMetaModelContext, sNavPropertyPath),
      aSelectOptionsPropertyNames = oSelectionVariant.getSelectOptionsPropertyNames();
    let sSelectOptionName = sPropertyName;
    if (oValidProperties[sPropertyName]) {
      sSelectOptionName = sPropertyName;
    } else if (sPropertyName.startsWith("P_") && oValidProperties[sPropertyName.replace("P_", "")]) {
      sSelectOptionName = sPropertyName.replace("P_", "");
    } else if (oValidProperties[`P_${sPropertyName}`] && aSelectOptionsPropertyNames.includes(`P_${sPropertyName}`)) {
      sSelectOptionName = `P_${sPropertyName}`;
    }
    if (sPropertyName.startsWith("P_") && oConditions[sConditionPath + sSelectOptionName]) {
      // if there is no SalesOrderManage._Item.Material yet in the oConditions
    } else if (!sPropertyName.startsWith("P_") && oConditions[sConditionPath + sSelectOptionName]) {
      delete oConditions[sConditionPath + sSelectOptionName];
      addSelectOptionsToConditions(sNavPropertyPath, oSelectionVariant, sSelectOption, oConditions, sConditionPath, sSelectOptionName, oValidProperties, oMetaModelContext, false, bIsFLPValuePresent, bSemanticDateRange, oViewData);
    } else {
      addSelectOptionsToConditions(sNavPropertyPath, oSelectionVariant, sSelectOption, oConditions, sConditionPath, sSelectOptionName, oValidProperties, oMetaModelContext, false, bIsFLPValuePresent, bSemanticDateRange, oViewData);
    }
  }
  function addPageContextToSelectionVariant(oSelectionVariant, mPageContext, oView) {
    const oAppComponent = CommonUtils.getAppComponent(oView);
    const oNavigationService = oAppComponent.getNavigationService();
    return oNavigationService.mixAttributesAndSelectionVariant(mPageContext, oSelectionVariant.toJSONString());
  }
  function addExternalStateFiltersToSelectionVariant(oSelectionVariant, mFilters, oTargetInfo, oFilterBar) {
    let sFilter;
    const fnGetSignAndOption = function (sOperator, sLowValue, sHighValue) {
      const oSelectOptionState = {
        option: "",
        sign: "I",
        low: sLowValue,
        high: sHighValue
      };
      switch (sOperator) {
        case "Contains":
          oSelectOptionState.option = "CP";
          break;
        case "StartsWith":
          oSelectOptionState.option = "CP";
          oSelectOptionState.low += "*";
          break;
        case "EndsWith":
          oSelectOptionState.option = "CP";
          oSelectOptionState.low = `*${oSelectOptionState.low}`;
          break;
        case "BT":
        case "LE":
        case "LT":
        case "GT":
        case "NE":
        case "EQ":
          oSelectOptionState.option = sOperator;
          break;
        case "DATE":
          oSelectOptionState.option = "EQ";
          break;
        case "DATERANGE":
          oSelectOptionState.option = "BT";
          break;
        case "FROM":
          oSelectOptionState.option = "GE";
          break;
        case "TO":
          oSelectOptionState.option = "LE";
          break;
        case "EEQ":
          oSelectOptionState.option = "EQ";
          break;
        case "Empty":
          oSelectOptionState.option = "EQ";
          oSelectOptionState.low = "";
          break;
        case "NotContains":
          oSelectOptionState.option = "CP";
          oSelectOptionState.sign = "E";
          break;
        case "NOTBT":
          oSelectOptionState.option = "BT";
          oSelectOptionState.sign = "E";
          break;
        case "NotStartsWith":
          oSelectOptionState.option = "CP";
          oSelectOptionState.low += "*";
          oSelectOptionState.sign = "E";
          break;
        case "NotEndsWith":
          oSelectOptionState.option = "CP";
          oSelectOptionState.low = `*${oSelectOptionState.low}`;
          oSelectOptionState.sign = "E";
          break;
        case "NotEmpty":
          oSelectOptionState.option = "NE";
          oSelectOptionState.low = "";
          break;
        case "NOTLE":
          oSelectOptionState.option = "LE";
          oSelectOptionState.sign = "E";
          break;
        case "NOTGE":
          oSelectOptionState.option = "GE";
          oSelectOptionState.sign = "E";
          break;
        case "NOTLT":
          oSelectOptionState.option = "LT";
          oSelectOptionState.sign = "E";
          break;
        case "NOTGT":
          oSelectOptionState.option = "GT";
          oSelectOptionState.sign = "E";
          break;
        default:
          Log.warning(`${sOperator} is not supported. ${sFilter} could not be added to the navigation context`);
      }
      return oSelectOptionState;
    };
    const oFilterConditions = mFilters.filterConditions;
    const oFiltersWithoutConflict = mFilters.filterConditionsWithoutConflict ? mFilters.filterConditionsWithoutConflict : {};
    const oTablePropertiesWithoutConflict = oTargetInfo.propertiesWithoutConflict ? oTargetInfo.propertiesWithoutConflict : {};
    const addFiltersToSelectionVariant = function (selectionVariant, sFilterName, sPath) {
      const aConditions = oFilterConditions[sFilterName];
      const oPropertyInfo = oFilterBar && oFilterBar.getPropertyHelper().getProperty(sFilterName);
      const oTypeConfig = oPropertyInfo === null || oPropertyInfo === void 0 ? void 0 : oPropertyInfo.typeConfig;
      const oTypeUtil = oFilterBar && oFilterBar.getControlDelegate().getTypeUtil();
      for (const item in aConditions) {
        const oCondition = aConditions[item];
        let option = "",
          sign = "I",
          low = "",
          high = null,
          semanticDates;
        const oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
        if (oOperator instanceof RangeOperator) {
          var _oModelFilter$getFilt;
          semanticDates = CommonUtils.createSemanticDatesFromConditions(oCondition);
          // handling of Date RangeOperators
          const oModelFilter = oOperator.getModelFilter(oCondition, sFilterName, oTypeConfig === null || oTypeConfig === void 0 ? void 0 : oTypeConfig.typeInstance, false, oTypeConfig === null || oTypeConfig === void 0 ? void 0 : oTypeConfig.baseType);
          if (!(oModelFilter !== null && oModelFilter !== void 0 && oModelFilter.getFilters()) && !(oModelFilter !== null && oModelFilter !== void 0 && (_oModelFilter$getFilt = oModelFilter.getFilters()) !== null && _oModelFilter$getFilt !== void 0 && _oModelFilter$getFilt.length)) {
            sign = oOperator.exclude ? "E" : "I";
            low = oTypeUtil.externalizeValue(oModelFilter.getValue1(), oTypeConfig.typeInstance);
            high = oTypeUtil.externalizeValue(oModelFilter.getValue2(), oTypeConfig.typeInstance);
            option = oModelFilter.getOperator();
          }
        } else {
          const aSemanticDateOpsExt = SemanticDateOperators.getSupportedOperations();
          if (aSemanticDateOpsExt.includes(oCondition === null || oCondition === void 0 ? void 0 : oCondition.operator)) {
            semanticDates = CommonUtils.createSemanticDatesFromConditions(oCondition);
          }
          const value1 = oCondition.values[0] && oCondition.values[0].toString() || "";
          const value2 = oCondition.values[1] && oCondition.values[1].toString() || null;
          const oSelectOption = fnGetSignAndOption(oCondition.operator, value1, value2);
          sign = oOperator !== null && oOperator !== void 0 && oOperator.exclude ? "E" : "I";
          low = oSelectOption === null || oSelectOption === void 0 ? void 0 : oSelectOption.low;
          high = oSelectOption === null || oSelectOption === void 0 ? void 0 : oSelectOption.high;
          option = oSelectOption === null || oSelectOption === void 0 ? void 0 : oSelectOption.option;
        }
        if (option && semanticDates) {
          selectionVariant.addSelectOption(sPath ? sPath : sFilterName, sign, option, low, high, undefined, semanticDates);
        } else if (option) {
          selectionVariant.addSelectOption(sPath ? sPath : sFilterName, sign, option, low, high);
        }
      }
    };
    for (sFilter in oFilterConditions) {
      // only add the filter values if it is not already present in the SV already
      if (!oSelectionVariant.getSelectOption(sFilter)) {
        // TODO : custom filters should be ignored more generically
        if (sFilter === "$editState") {
          continue;
        }
        addFiltersToSelectionVariant(oSelectionVariant, sFilter);
      } else {
        if (oTablePropertiesWithoutConflict && sFilter in oTablePropertiesWithoutConflict) {
          addFiltersToSelectionVariant(oSelectionVariant, sFilter, oTablePropertiesWithoutConflict[sFilter]);
        }
        // if property was without conflict in page context then add path from page context to SV
        if (sFilter in oFiltersWithoutConflict) {
          addFiltersToSelectionVariant(oSelectionVariant, sFilter, oFiltersWithoutConflict[sFilter]);
        }
      }
    }
    return oSelectionVariant;
  }
  function isStickyEditMode(oControl) {
    const bIsStickyMode = ModelHelper.isStickySessionSupported(oControl.getModel().getMetaModel());
    const bUIEditable = oControl.getModel("ui").getProperty("/isEditable");
    return bIsStickyMode && bUIEditable;
  }

  /**
   * @param aMandatoryFilterFields
   * @param oSelectionVariant
   * @param oSelectionVariantDefaults
   */
  function addDefaultDisplayCurrency(aMandatoryFilterFields, oSelectionVariant, oSelectionVariantDefaults) {
    if (oSelectionVariant && aMandatoryFilterFields && aMandatoryFilterFields.length) {
      for (let i = 0; i < aMandatoryFilterFields.length; i++) {
        const aSVOption = oSelectionVariant.getSelectOption("DisplayCurrency"),
          aDefaultSVOption = oSelectionVariantDefaults && oSelectionVariantDefaults.getSelectOption("DisplayCurrency");
        if (aMandatoryFilterFields[i].$PropertyPath === "DisplayCurrency" && (!aSVOption || !aSVOption.length) && aDefaultSVOption && aDefaultSVOption.length) {
          const displayCurrencySelectOption = aDefaultSVOption[0];
          const sSign = displayCurrencySelectOption["Sign"];
          const sOption = displayCurrencySelectOption["Option"];
          const sLow = displayCurrencySelectOption["Low"];
          const sHigh = displayCurrencySelectOption["High"];
          oSelectionVariant.addSelectOption("DisplayCurrency", sSign, sOption, sLow, sHigh);
        }
      }
    }
  }
  /**
   * Retrieves the user defaults from the startup app state (if available) or the startup parameter and sets them to a model.
   *
   * @param oAppComponent
   * @param aParameters
   * @param oModel
   * @param bIsAction
   * @param bIsCreate
   * @param oActionDefaultValues
   */
  async function setUserDefaults(oAppComponent, aParameters, oModel, bIsAction, bIsCreate, oActionDefaultValues) {
    const oComponentData = oAppComponent.getComponentData(),
      oStartupParameters = oComponentData && oComponentData.startupParameters || {},
      oShellServices = oAppComponent.getShellServices();
    const oStartupAppState = await oShellServices.getStartupAppState(oAppComponent);
    const oData = (oStartupAppState === null || oStartupAppState === void 0 ? void 0 : oStartupAppState.getData()) || {},
      aExtendedParameters = oData.selectionVariant && oData.selectionVariant.SelectOptions || [];
    aParameters.forEach(function (oParameter) {
      var _oParameter$getPath;
      const sPropertyName = bIsAction ? `/${oParameter.$Name}` : (_oParameter$getPath = oParameter.getPath) === null || _oParameter$getPath === void 0 ? void 0 : _oParameter$getPath.call(oParameter).slice(oParameter.getPath().lastIndexOf("/") + 1);
      const sParameterName = bIsAction ? sPropertyName.slice(1) : sPropertyName;
      if (oActionDefaultValues && bIsCreate) {
        if (oActionDefaultValues[sParameterName]) {
          oModel.setProperty(sPropertyName, oActionDefaultValues[sParameterName]);
        }
      } else if (oStartupParameters[sParameterName]) {
        oModel.setProperty(sPropertyName, oStartupParameters[sParameterName][0]);
      } else if (aExtendedParameters.length > 0) {
        for (const oExtendedParameter of aExtendedParameters) {
          if (oExtendedParameter.PropertyName === sParameterName) {
            const oRange = oExtendedParameter.Ranges.length ? oExtendedParameter.Ranges[oExtendedParameter.Ranges.length - 1] : undefined;
            if (oRange && oRange.Sign === "I" && oRange.Option === "EQ") {
              oModel.setProperty(sPropertyName, oRange.Low); // high is ignored when Option=EQ
            }
          }
        }
      }
    });
  }

  function getAdditionalParamsForCreate(oStartupParameters, oInboundParameters) {
    const oInbounds = oInboundParameters,
      aCreateParameters = oInbounds !== undefined ? Object.keys(oInbounds).filter(function (sParameter) {
        return oInbounds[sParameter].useForCreate;
      }) : [];
    let oRet;
    for (let i = 0; i < aCreateParameters.length; i++) {
      const sCreateParameter = aCreateParameters[i];
      const aValues = oStartupParameters && oStartupParameters[sCreateParameter];
      if (aValues && aValues.length === 1) {
        oRet = oRet || Object.create(null);
        oRet[sCreateParameter] = aValues[0];
      }
    }
    return oRet;
  }
  function getSemanticObjectMapping(oOutbound) {
    const aSemanticObjectMapping = [];
    if (oOutbound.parameters) {
      const aParameters = Object.keys(oOutbound.parameters) || [];
      if (aParameters.length > 0) {
        aParameters.forEach(function (sParam) {
          const oMapping = oOutbound.parameters[sParam];
          if (oMapping.value && oMapping.value.value && oMapping.value.format === "binding") {
            // using the format of UI.Mapping
            const oSemanticMapping = {
              LocalProperty: {
                $PropertyPath: oMapping.value.value
              },
              SemanticObjectProperty: sParam
            };
            if (aSemanticObjectMapping.length > 0) {
              // To check if the semanticObject Mapping is done for the same local property more that once then first one will be considered
              for (let i = 0; i < aSemanticObjectMapping.length; i++) {
                var _aSemanticObjectMappi;
                if (((_aSemanticObjectMappi = aSemanticObjectMapping[i].LocalProperty) === null || _aSemanticObjectMappi === void 0 ? void 0 : _aSemanticObjectMappi.$PropertyPath) !== oSemanticMapping.LocalProperty.$PropertyPath) {
                  aSemanticObjectMapping.push(oSemanticMapping);
                }
              }
            } else {
              aSemanticObjectMapping.push(oSemanticMapping);
            }
          }
        });
      }
    }
    return aSemanticObjectMapping;
  }
  function getHeaderFacetItemConfigForExternalNavigation(oViewData, oCrossNav) {
    const oHeaderFacetItems = {};
    let sId;
    const oControlConfig = oViewData.controlConfiguration;
    for (const config in oControlConfig) {
      if (config.indexOf("@com.sap.vocabularies.UI.v1.DataPoint") > -1 || config.indexOf("@com.sap.vocabularies.UI.v1.Chart") > -1) {
        var _oControlConfig$confi, _oControlConfig$confi2;
        const sOutbound = (_oControlConfig$confi = oControlConfig[config].navigation) === null || _oControlConfig$confi === void 0 ? void 0 : (_oControlConfig$confi2 = _oControlConfig$confi.targetOutbound) === null || _oControlConfig$confi2 === void 0 ? void 0 : _oControlConfig$confi2.outbound;
        if (sOutbound !== undefined) {
          const oOutbound = oCrossNav[sOutbound];
          if (oOutbound.semanticObject && oOutbound.action) {
            if (config.indexOf("Chart") > -1) {
              sId = generate(["fe", "MicroChartLink", config]);
            } else {
              sId = generate(["fe", "HeaderDPLink", config]);
            }
            const aSemanticObjectMapping = CommonUtils.getSemanticObjectMapping(oOutbound);
            oHeaderFacetItems[sId] = {
              semanticObject: oOutbound.semanticObject,
              action: oOutbound.action,
              semanticObjectMapping: aSemanticObjectMapping
            };
          } else {
            Log.error(`Cross navigation outbound is configured without semantic object and action for ${sOutbound}`);
          }
        }
      }
    }
    return oHeaderFacetItems;
  }
  function setSemanticObjectMappings(oSelectionVariant, vMappings) {
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
  async function fnGetSemanticObjectsFromPath(oMetaModel, sPath, sQualifier) {
    return new Promise(function (resolve) {
      let sSemanticObject, aSemanticObjectUnavailableActions;
      if (sQualifier === "") {
        sSemanticObject = oMetaModel.getObject(`${sPath}@${"com.sap.vocabularies.Common.v1.SemanticObject"}`);
        aSemanticObjectUnavailableActions = oMetaModel.getObject(`${sPath}@${"com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions"}`);
      } else {
        sSemanticObject = oMetaModel.getObject(`${sPath}@${"com.sap.vocabularies.Common.v1.SemanticObject"}#${sQualifier}`);
        aSemanticObjectUnavailableActions = oMetaModel.getObject(`${sPath}@${"com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions"}#${sQualifier}`);
      }
      const aSemanticObjectForGetLinks = [{
        semanticObject: sSemanticObject
      }];
      const oSemanticObject = {
        semanticObject: sSemanticObject
      };
      resolve({
        semanticObjectPath: sPath,
        semanticObjectForGetLinks: aSemanticObjectForGetLinks,
        semanticObject: oSemanticObject,
        unavailableActions: aSemanticObjectUnavailableActions
      });
    });
  }
  async function fnUpdateSemanticTargetsModel(aGetLinksPromises, aSemanticObjects, oInternalModelContext, sCurrentHash) {
    return Promise.all(aGetLinksPromises).then(function (aValues) {
      let aLinks,
        _oLink,
        _sLinkIntentAction,
        aFinalLinks = [];
      let oFinalSemanticObjects = {};
      const bIntentHasActions = function (sIntent, aActions) {
        for (const intent in aActions) {
          if (intent === sIntent) {
            return true;
          } else {
            return false;
          }
        }
      };
      for (let k = 0; k < aValues.length; k++) {
        aLinks = aValues[k];
        if (aLinks && aLinks.length > 0 && aLinks[0] !== undefined) {
          const oSemanticObject = {};
          let oTmp;
          let sAlternatePath;
          for (let i = 0; i < aLinks.length; i++) {
            aFinalLinks.push([]);
            let hasTargetsNotFiltered = false;
            let hasTargets = false;
            for (let iLinkCount = 0; iLinkCount < aLinks[i][0].length; iLinkCount++) {
              _oLink = aLinks[i][0][iLinkCount];
              _sLinkIntentAction = _oLink && _oLink.intent.split("?")[0].split("-")[1];
              if (!(_oLink && _oLink.intent && _oLink.intent.indexOf(sCurrentHash) === 0)) {
                hasTargetsNotFiltered = true;
                if (!bIntentHasActions(_sLinkIntentAction, aSemanticObjects[k].unavailableActions)) {
                  aFinalLinks[i].push(_oLink);
                  hasTargets = true;
                }
              }
            }
            oTmp = {
              semanticObject: aSemanticObjects[k].semanticObject,
              path: aSemanticObjects[k].path,
              HasTargets: hasTargets,
              HasTargetsNotFiltered: hasTargetsNotFiltered
            };
            if (oSemanticObject[aSemanticObjects[k].semanticObject] === undefined) {
              oSemanticObject[aSemanticObjects[k].semanticObject] = {};
            }
            sAlternatePath = aSemanticObjects[k].path.replace(/\//g, "_");
            if (oSemanticObject[aSemanticObjects[k].semanticObject][sAlternatePath] === undefined) {
              oSemanticObject[aSemanticObjects[k].semanticObject][sAlternatePath] = {};
            }
            oSemanticObject[aSemanticObjects[k].semanticObject][sAlternatePath] = Object.assign(oSemanticObject[aSemanticObjects[k].semanticObject][sAlternatePath], oTmp);
          }
          const sSemanticObjectName = Object.keys(oSemanticObject)[0];
          if (Object.keys(oFinalSemanticObjects).includes(sSemanticObjectName)) {
            oFinalSemanticObjects[sSemanticObjectName] = Object.assign(oFinalSemanticObjects[sSemanticObjectName], oSemanticObject[sSemanticObjectName]);
          } else {
            oFinalSemanticObjects = Object.assign(oFinalSemanticObjects, oSemanticObject);
          }
          aFinalLinks = [];
        }
      }
      if (Object.keys(oFinalSemanticObjects).length > 0) {
        oInternalModelContext.setProperty("semanticsTargets", mergeObjects(oFinalSemanticObjects, oInternalModelContext.getProperty("semanticsTargets")));
        return oFinalSemanticObjects;
      }
      return;
    }).catch(function (oError) {
      Log.error("fnUpdateSemanticTargetsModel: Cannot read links", oError);
    });
  }
  async function fnGetSemanticObjectPromise(oAppComponent, oView, oMetaModel, sPath, sQualifier) {
    return CommonUtils.getSemanticObjectsFromPath(oMetaModel, sPath, sQualifier);
  }
  function fnPrepareSemanticObjectsPromises(_oAppComponent, _oView, _oMetaModel, _aSemanticObjectsFound, _aSemanticObjectsPromises) {
    let _Keys, sPath;
    let sQualifier, regexResult;
    for (let i = 0; i < _aSemanticObjectsFound.length; i++) {
      sPath = _aSemanticObjectsFound[i];
      _Keys = Object.keys(_oMetaModel.getObject(sPath + "@"));
      for (let index = 0; index < _Keys.length; index++) {
        if (_Keys[index].indexOf(`@${"com.sap.vocabularies.Common.v1.SemanticObject"}`) === 0 && _Keys[index].indexOf(`@${"com.sap.vocabularies.Common.v1.SemanticObjectMapping"}`) === -1 && _Keys[index].indexOf(`@${"com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions"}`) === -1) {
          regexResult = /#(.*)/.exec(_Keys[index]);
          sQualifier = regexResult ? regexResult[1] : "";
          _aSemanticObjectsPromises.push(CommonUtils.getSemanticObjectPromise(_oAppComponent, _oView, _oMetaModel, sPath, sQualifier));
        }
      }
    }
  }
  function fnGetSemanticTargetsFromPageModel(oController, sPageModel) {
    const _fnfindValuesHelper = function (obj, key, list) {
      if (!obj) {
        return list;
      }
      if (obj instanceof Array) {
        obj.forEach(item => {
          list = list.concat(_fnfindValuesHelper(item, key, []));
        });
        return list;
      }
      if (obj[key]) {
        list.push(obj[key]);
      }
      if (typeof obj == "object" && obj !== null) {
        const children = Object.keys(obj);
        if (children.length > 0) {
          for (let i = 0; i < children.length; i++) {
            list = list.concat(_fnfindValuesHelper(obj[children[i]], key, []));
          }
        }
      }
      return list;
    };
    const _fnfindValues = function (obj, key) {
      return _fnfindValuesHelper(obj, key, []);
    };
    const _fnDeleteDuplicateSemanticObjects = function (aSemanticObjectPath) {
      return aSemanticObjectPath.filter(function (value, index) {
        return aSemanticObjectPath.indexOf(value) === index;
      });
    };
    const oView = oController.getView();
    const oInternalModelContext = oView.getBindingContext("internal");
    if (oInternalModelContext) {
      const aSemanticObjectsPromises = [];
      const oComponent = oController.getOwnerComponent();
      const oAppComponent = Component.getOwnerComponentFor(oComponent);
      const oMetaModel = oAppComponent.getMetaModel();
      let oPageModel = oComponent.getModel(sPageModel).getData();
      if (JSON.stringify(oPageModel) === "{}") {
        oPageModel = oComponent.getModel(sPageModel)._getObject("/", undefined);
      }
      let aSemanticObjectsFound = _fnfindValues(oPageModel, "semanticObjectPath");
      aSemanticObjectsFound = _fnDeleteDuplicateSemanticObjects(aSemanticObjectsFound);
      const oShellServiceHelper = oAppComponent.getShellServices();
      let sCurrentHash = oShellServiceHelper.getHash();
      const aSemanticObjectsForGetLinks = [];
      const aSemanticObjects = [];
      let _oSemanticObject;
      if (sCurrentHash && sCurrentHash.indexOf("?") !== -1) {
        // sCurrentHash can contain query string, cut it off!
        sCurrentHash = sCurrentHash.split("?")[0];
      }
      fnPrepareSemanticObjectsPromises(oAppComponent, oView, oMetaModel, aSemanticObjectsFound, aSemanticObjectsPromises);
      if (aSemanticObjectsPromises.length === 0) {
        return Promise.resolve();
      } else {
        Promise.all(aSemanticObjectsPromises).then(async function (aValues) {
          const aGetLinksPromises = [];
          let sSemObjExpression;
          const aSemanticObjectsResolved = aValues.filter(function (element) {
            if (element.semanticObject !== undefined && element.semanticObject.semanticObject && typeof element.semanticObject.semanticObject === "object") {
              sSemObjExpression = compileExpression(pathInModel(element.semanticObject.semanticObject.$Path));
              element.semanticObject.semanticObject = sSemObjExpression;
              element.semanticObjectForGetLinks[0].semanticObject = sSemObjExpression;
              return true;
            } else if (element) {
              return element.semanticObject !== undefined;
            } else {
              return false;
            }
          });
          for (let j = 0; j < aSemanticObjectsResolved.length; j++) {
            _oSemanticObject = aSemanticObjectsResolved[j];
            if (_oSemanticObject && _oSemanticObject.semanticObject && !(_oSemanticObject.semanticObject.semanticObject.indexOf("{") === 0)) {
              aSemanticObjectsForGetLinks.push(_oSemanticObject.semanticObjectForGetLinks);
              aSemanticObjects.push({
                semanticObject: _oSemanticObject.semanticObject.semanticObject,
                unavailableActions: _oSemanticObject.unavailableActions,
                path: aSemanticObjectsResolved[j].semanticObjectPath
              });
              aGetLinksPromises.push(oShellServiceHelper.getLinksWithCache([_oSemanticObject.semanticObjectForGetLinks]));
            }
          }
          return CommonUtils.updateSemanticTargets(aGetLinksPromises, aSemanticObjects, oInternalModelContext, sCurrentHash);
        }).catch(function (oError) {
          Log.error("fnGetSemanticTargetsFromTable: Cannot get Semantic Objects", oError);
        });
      }
    } else {
      return Promise.resolve();
    }
  }
  function getFilterAllowedExpression(oFilterRestrictionsAnnotation) {
    const mAllowedExpressions = {};
    if (oFilterRestrictionsAnnotation && oFilterRestrictionsAnnotation.FilterExpressionRestrictions !== undefined) {
      oFilterRestrictionsAnnotation.FilterExpressionRestrictions.forEach(function (oProperty) {
        if (oProperty.Property && oProperty.AllowedExpressions !== undefined) {
          //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
          if (mAllowedExpressions[oProperty.Property.$PropertyPath] !== undefined) {
            mAllowedExpressions[oProperty.Property.$PropertyPath].push(oProperty.AllowedExpressions);
          } else {
            mAllowedExpressions[oProperty.Property.$PropertyPath] = [oProperty.AllowedExpressions];
          }
        }
      });
    }
    return mAllowedExpressions;
  }
  function getFilterRestrictions(oFilterRestrictionsAnnotation, sRestriction) {
    let aProps = [];
    if (oFilterRestrictionsAnnotation && oFilterRestrictionsAnnotation[sRestriction]) {
      aProps = oFilterRestrictionsAnnotation[sRestriction].map(function (oProperty) {
        return oProperty.$PropertyPath;
      });
    }
    return aProps;
  }
  function _fetchPropertiesForNavPath(paths, navPath, props) {
    const navPathPrefix = navPath + "/";
    return paths.reduce((outPaths, pathToCheck) => {
      if (pathToCheck.startsWith(navPathPrefix)) {
        const outPath = pathToCheck.replace(navPathPrefix, "");
        if (outPaths.indexOf(outPath) === -1) {
          outPaths.push(outPath);
        }
      }
      return outPaths;
    }, props);
  }
  function getFilterRestrictionsByPath(entityPath, oContext) {
    const oRet = {
      RequiredProperties: [],
      NonFilterableProperties: [],
      FilterAllowedExpressions: {}
    };
    let oFilterRestrictions;
    const navigationText = "$NavigationPropertyBinding";
    const frTerm = "@Org.OData.Capabilities.V1.FilterRestrictions";
    const entityTypePathParts = entityPath.replaceAll("%2F", "/").split("/").filter(ModelHelper.filterOutNavPropBinding);
    const entityTypePath = `/${entityTypePathParts.join("/")}/`;
    const entitySetPath = ModelHelper.getEntitySetPath(entityPath, oContext);
    const entitySetPathParts = entitySetPath.split("/").filter(ModelHelper.filterOutNavPropBinding);
    const isContainment = oContext.getObject(`${entityTypePath}$ContainsTarget`);
    const containmentNavPath = !!isContainment && entityTypePathParts[entityTypePathParts.length - 1];

    //LEAST PRIORITY - Filter restrictions directly at Entity Set
    //e.g. FR in "NS.EntityContainer/SalesOrderManage" ContextPath: /SalesOrderManage
    if (!isContainment) {
      oFilterRestrictions = oContext.getObject(`${entitySetPath}${frTerm}`);
      oRet.RequiredProperties = getFilterRestrictions(oFilterRestrictions, "RequiredProperties") || [];
      const resultContextCheck = oContext.getObject(`${entityTypePath}@com.sap.vocabularies.Common.v1.ResultContext`);
      if (!resultContextCheck) {
        oRet.NonFilterableProperties = getFilterRestrictions(oFilterRestrictions, "NonFilterableProperties") || [];
      }
      //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
      oRet.FilterAllowedExpressions = getFilterAllowedExpression(oFilterRestrictions) || {};
    }
    if (entityTypePathParts.length > 1) {
      const navPath = isContainment ? containmentNavPath : entitySetPathParts[entitySetPathParts.length - 1];
      // In case of containment we take entitySet provided as parent. And in case of normal we would remove the last navigation from entitySetPath.
      const parentEntitySetPath = isContainment ? entitySetPath : `/${entitySetPathParts.slice(0, -1).join(`/${navigationText}/`)}`;
      //THIRD HIGHEST PRIORITY - Reading property path restrictions - Annotation at main entity but directly on navigation property path
      //e.g. Parent Customer with PropertyPath="Set/CityName" ContextPath: Customer/Set
      const oParentRet = {
        RequiredProperties: [],
        NonFilterableProperties: [],
        FilterAllowedExpressions: {}
      };
      if (!navPath.includes("%2F")) {
        const oParentFR = oContext.getObject(`${parentEntitySetPath}${frTerm}`);
        oRet.RequiredProperties = _fetchPropertiesForNavPath(getFilterRestrictions(oParentFR, "RequiredProperties") || [], navPath, oRet.RequiredProperties || []);
        oRet.NonFilterableProperties = _fetchPropertiesForNavPath(getFilterRestrictions(oParentFR, "NonFilterableProperties") || [], navPath, oRet.NonFilterableProperties || []);
        //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
        const completeAllowedExps = getFilterAllowedExpression(oParentFR) || {};
        oParentRet.FilterAllowedExpressions = Object.keys(completeAllowedExps).reduce((outProp, propPath) => {
          if (propPath.startsWith(navPath + "/")) {
            const outPropPath = propPath.replace(navPath + "/", "");
            outProp[outPropPath] = completeAllowedExps[propPath];
          }
          return outProp;
        }, {});
      }

      //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
      oRet.FilterAllowedExpressions = mergeObjects({}, oRet.FilterAllowedExpressions || {}, oParentRet.FilterAllowedExpressions || {});

      //SECOND HIGHEST priority - Navigation restrictions
      //e.g. Parent "/Customer" with NavigationPropertyPath="Set" ContextPath: Customer/Set
      const oNavRestrictions = MetaModelFunction.getNavigationRestrictions(oContext, parentEntitySetPath, navPath.replaceAll("%2F", "/"));
      const oNavFilterRest = oNavRestrictions && oNavRestrictions["FilterRestrictions"];
      const navResReqProps = getFilterRestrictions(oNavFilterRest, "RequiredProperties") || [];
      oRet.RequiredProperties = uniqueSort(oRet.RequiredProperties.concat(navResReqProps));
      const navNonFilterProps = getFilterRestrictions(oNavFilterRest, "NonFilterableProperties") || [];
      oRet.NonFilterableProperties = uniqueSort(oRet.NonFilterableProperties.concat(navNonFilterProps));
      //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
      oRet.FilterAllowedExpressions = mergeObjects({}, oRet.FilterAllowedExpressions || {}, getFilterAllowedExpression(oNavFilterRest) || {});

      //HIGHEST priority - Restrictions having target with navigation association entity
      // e.g. FR in "CustomerParameters/Set" ContextPath: "Customer/Set"
      const navAssociationEntityRest = oContext.getObject(`/${entityTypePathParts.join("/")}${frTerm}`);
      const navAssocReqProps = getFilterRestrictions(navAssociationEntityRest, "RequiredProperties") || [];
      oRet.RequiredProperties = uniqueSort(oRet.RequiredProperties.concat(navAssocReqProps));
      const navAssocNonFilterProps = getFilterRestrictions(navAssociationEntityRest, "NonFilterableProperties") || [];
      oRet.NonFilterableProperties = uniqueSort(oRet.NonFilterableProperties.concat(navAssocNonFilterProps));
      //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
      oRet.FilterAllowedExpressions = mergeObjects({}, oRet.FilterAllowedExpressions, getFilterAllowedExpression(navAssociationEntityRest) || {});
    }
    return oRet;
  }
  async function templateControlFragment(sFragmentName, oPreprocessorSettings, oOptions, oModifier) {
    oOptions = oOptions || {};
    if (oModifier) {
      return oModifier.templateControlFragment(sFragmentName, oPreprocessorSettings, oOptions.view).then(function (oFragment) {
        // This is required as Flex returns an HTMLCollection as templating result in XML time.
        return oModifier.targets === "xmlTree" && oFragment.length > 0 ? oFragment[0] : oFragment;
      });
    } else {
      const oFragment = await XMLPreprocessor.process(XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment"), {
        name: sFragmentName
      }, oPreprocessorSettings);
      const oControl = oFragment.firstElementChild;
      if (!!oOptions.isXML && oControl) {
        return oControl;
      }
      return Fragment.load({
        id: oOptions.id,
        definition: oFragment,
        controller: oOptions.controller
      });
    }
  }
  function getSingletonPath(path, metaModel) {
    const parts = path.split("/").filter(Boolean),
      propertyName = parts.pop(),
      navigationPath = parts.join("/"),
      entitySet = navigationPath && metaModel.getObject(`/${navigationPath}`);
    if ((entitySet === null || entitySet === void 0 ? void 0 : entitySet.$kind) === "Singleton") {
      const singletonName = parts[parts.length - 1];
      return `/${singletonName}/${propertyName}`;
    }
    return undefined;
  }
  async function requestSingletonProperty(path, model) {
    if (!path || !model) {
      return Promise.resolve(null);
    }
    const metaModel = model.getMetaModel();
    // Find the underlying entity set from the property path and check whether it is a singleton.
    const resolvedPath = getSingletonPath(path, metaModel);
    if (resolvedPath) {
      const propertyBinding = model.bindProperty(resolvedPath);
      return propertyBinding.requestValue();
    }
    return Promise.resolve(null);
  }

  // Get the path for action parameters that is needed to read the annotations
  function getParameterPath(sPath, sParameter) {
    let sContext;
    if (sPath.indexOf("@$ui5.overload") > -1) {
      sContext = sPath.split("@$ui5.overload")[0];
    } else {
      // For Unbound Actions in Action Parameter Dialogs
      const aAction = sPath.split("/0")[0].split(".");
      sContext = `/${aAction[aAction.length - 1]}/`;
    }
    return sContext + sParameter;
  }

  /**
   * Get resolved expression binding used for texts at runtime.
   *
   * @param expBinding
   * @param control
   * @function
   * @static
   * @memberof sap.fe.core.CommonUtils
   * @returns A string after resolution.
   * @ui5-restricted
   */
  function _fntranslatedTextFromExpBindingString(expBinding, control) {
    // The idea here is to create dummy element with the expresion binding.
    // Adding it as dependent to the view/control would propagate all the models to the dummy element and resolve the binding.
    // We remove the dummy element after that and destroy it.

    const anyResourceText = new AnyElement({
      anyText: expBinding
    });
    control.addDependent(anyResourceText);
    const resultText = anyResourceText.getAnyText();
    control.removeDependent(anyResourceText);
    anyResourceText.destroy();
    return resultText;
  }
  /**
   * Check if the current device has a small screen.
   *
   * @returns A Boolean.
   * @private
   */
  function isSmallDevice() {
    return !system.desktop || Device.resize.width <= 320;
  }
  /**
   * Get filter information for a SelectionVariant annotation.
   *
   * @param oControl The table/chart instance
   * @param selectionVariantPath Relative SelectionVariant annotation path
   * @param isChart
   * @returns Information on filters
   *  filters: array of sap.ui.model.filters
   * text: Text property of the SelectionVariant
   * @private
   * @ui5-restricted
   */

  function getFiltersInfoForSV(oControl, selectionVariantPath, isChart) {
    const sEntityTypePath = oControl.data("entityType"),
      oMetaModel = CommonUtils.getAppComponent(oControl).getMetaModel(),
      mPropertyFilters = {},
      aFilters = [],
      aPaths = [];
    let sText = "";
    let oSelectionVariant = oMetaModel.getObject(`${sEntityTypePath}${selectionVariantPath}`);
    // for chart the structure varies hence read it from main object
    if (isChart) {
      oSelectionVariant = oSelectionVariant.SelectionVariant;
    }
    if (oSelectionVariant) {
      sText = oSelectionVariant.Text;
      (oSelectionVariant.SelectOptions || []).filter(function (oSelectOption) {
        return oSelectOption && oSelectOption.PropertyName && oSelectOption.PropertyName.$PropertyPath;
      }).forEach(function (oSelectOption) {
        const sPath = oSelectOption.PropertyName.$PropertyPath;
        if (!aPaths.includes(sPath)) {
          aPaths.push(sPath);
        }
        for (const j in oSelectOption.Ranges) {
          var _oRange$Option, _oRange$Option$$EnumM;
          const oRange = oSelectOption.Ranges[j];
          mPropertyFilters[sPath] = (mPropertyFilters[sPath] || []).concat(new Filter(sPath, (_oRange$Option = oRange.Option) === null || _oRange$Option === void 0 ? void 0 : (_oRange$Option$$EnumM = _oRange$Option.$EnumMember) === null || _oRange$Option$$EnumM === void 0 ? void 0 : _oRange$Option$$EnumM.split("/").pop(), oRange.Low, oRange.High));
        }
      });
      for (const sPropertyPath in mPropertyFilters) {
        aFilters.push(new Filter({
          filters: mPropertyFilters[sPropertyPath],
          and: false
        }));
      }
    }
    return {
      properties: aPaths,
      filters: aFilters,
      text: sText
    };
  }
  function getConverterContextForPath(sMetaPath, oMetaModel, sEntitySet, oDiagnostics) {
    const oContext = oMetaModel.createBindingContext(sMetaPath);
    return ConverterContext === null || ConverterContext === void 0 ? void 0 : ConverterContext.createConverterContextForMacro(sEntitySet, oContext || oMetaModel, oDiagnostics, mergeObjects, undefined);
  }

  /**
   * This function returns an ID which should be used in the internal chart for the measure or dimension.
   * For standard cases, this is just the ID of the property.
   * If it is necessary to use another ID internally inside the chart (e.g. on duplicate property IDs) this method can be overwritten.
   * In this case, <code>getPropertyFromNameAndKind</code> needs to be overwritten as well.
   *
   * @param name ID of the property
   * @param kind Type of the property (measure or dimension)
   * @returns Internal ID for the sap.chart.Chart
   * @private
   * @ui5-restricted
   */
  function getInternalChartNameFromPropertyNameAndKind(name, kind) {
    return name.replace("_fe_" + kind + "_", "");
  }

  /**
   * This function returns an array of chart properties by remvoing _fe_groupable prefix.
   *
   * @param {Array} aFilters Chart filter properties
   * @returns Chart properties without prefixes
   * @private
   * @ui5-restricted
   */

  function getChartPropertiesWithoutPrefixes(aFilters) {
    aFilters.forEach(element => {
      if (element.sPath && element.sPath.includes("fe_groupable")) {
        element.sPath = CommonUtils.getInternalChartNameFromPropertyNameAndKind(element.sPath, "groupable");
      }
    });
    return aFilters;
  }
  const CommonUtils = {
    fireButtonPress: fnFireButtonPress,
    getTargetView: getTargetView,
    getCurrentPageView: getCurrentPageView,
    hasTransientContext: fnHasTransientContexts,
    updateRelatedAppsDetails: fnUpdateRelatedAppsDetails,
    getAppComponent: getAppComponent,
    getMandatoryFilterFields: fnGetMandatoryFilterFields,
    getContextPathProperties: fnGetContextPathProperties,
    getParameterInfo: getParameterInfo,
    updateDataFieldForIBNButtonsVisibility: fnUpdateDataFieldForIBNButtonsVisibility,
    getEntitySetName: getEntitySetName,
    getActionPath: getActionPath,
    computeDisplayMode: computeDisplayMode,
    isStickyEditMode: isStickyEditMode,
    getOperatorsForProperty: getOperatorsForProperty,
    getOperatorsForDateProperty: getOperatorsForDateProperty,
    getOperatorsForGuidProperty: getOperatorsForGuidProperty,
    addSelectionVariantToConditions: addSelectionVariantToConditions,
    addExternalStateFiltersToSelectionVariant: addExternalStateFiltersToSelectionVariant,
    addPageContextToSelectionVariant: addPageContextToSelectionVariant,
    addDefaultDisplayCurrency: addDefaultDisplayCurrency,
    setUserDefaults: setUserDefaults,
    getIBNActions: fnGetIBNActions,
    getHeaderFacetItemConfigForExternalNavigation: getHeaderFacetItemConfigForExternalNavigation,
    getSemanticObjectMapping: getSemanticObjectMapping,
    setSemanticObjectMappings: setSemanticObjectMappings,
    getSemanticObjectPromise: fnGetSemanticObjectPromise,
    getSemanticTargetsFromPageModel: fnGetSemanticTargetsFromPageModel,
    getSemanticObjectsFromPath: fnGetSemanticObjectsFromPath,
    updateSemanticTargets: fnUpdateSemanticTargetsModel,
    waitForContextRequested: waitForContextRequested,
    getFilterRestrictionsByPath: getFilterRestrictionsByPath,
    getSpecificAllowedExpression: getSpecificAllowedExpression,
    getAdditionalParamsForCreate: getAdditionalParamsForCreate,
    requestSingletonProperty: requestSingletonProperty,
    templateControlFragment: templateControlFragment,
    FilterRestrictions: {
      REQUIRED_PROPERTIES: "RequiredProperties",
      NON_FILTERABLE_PROPERTIES: "NonFilterableProperties",
      ALLOWED_EXPRESSIONS: "FilterAllowedExpressions"
    },
    AllowedExpressionsPrio: ["SingleValue", "MultiValue", "SingleRange", "MultiRange", "SearchExpression", "MultiRangeOrSearchExpression"],
    normalizeSearchTerm: normalizeSearchTerm,
    setContextsBasedOnOperationAvailable: setContextsBasedOnOperationAvailable,
    setDynamicActionContexts: setDynamicActionContexts,
    requestProperty: requestProperty,
    getParameterPath: getParameterPath,
    getRelatedAppsMenuItems: _getRelatedAppsMenuItems,
    getTranslatedTextFromExpBindingString: _fntranslatedTextFromExpBindingString,
    addSemanticDatesToConditions: addSemanticDatesToConditions,
    addSelectOptionToConditions: addSelectOptionToConditions,
    createSemanticDatesFromConditions: createSemanticDatesFromConditions,
    updateRelateAppsModel: updateRelateAppsModel,
    getSemanticObjectAnnotations: _getSemanticObjectAnnotations,
    getFiltersInfoForSV: getFiltersInfoForSV,
    getInternalChartNameFromPropertyNameAndKind: getInternalChartNameFromPropertyNameAndKind,
    getChartPropertiesWithoutPrefixes: getChartPropertiesWithoutPrefixes,
    isSmallDevice,
    getConverterContextForPath
  };
  return CommonUtils;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJub3JtYWxpemVTZWFyY2hUZXJtIiwic1NlYXJjaFRlcm0iLCJ1bmRlZmluZWQiLCJyZXBsYWNlIiwic3BsaXQiLCJyZWR1Y2UiLCJzTm9ybWFsaXplZCIsInNDdXJyZW50V29yZCIsIndhaXRGb3JDb250ZXh0UmVxdWVzdGVkIiwiYmluZGluZ0NvbnRleHQiLCJtb2RlbCIsImdldE1vZGVsIiwibWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwiZW50aXR5UGF0aCIsImdldE1ldGFQYXRoIiwiZ2V0UGF0aCIsImRhdGFNb2RlbCIsIk1ldGFNb2RlbENvbnZlcnRlciIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsImdldENvbnRleHQiLCJyZXF1ZXN0UHJvcGVydHkiLCJ0YXJnZXRFbnRpdHlUeXBlIiwia2V5cyIsIm5hbWUiLCJmbkhhc1RyYW5zaWVudENvbnRleHRzIiwib0xpc3RCaW5kaW5nIiwiYkhhc1RyYW5zaWVudENvbnRleHRzIiwiZ2V0Q3VycmVudENvbnRleHRzIiwiZm9yRWFjaCIsIm9Db250ZXh0IiwiaXNUcmFuc2llbnQiLCJfZ2V0U09JbnRlbnRzIiwib1NoZWxsU2VydmljZUhlbHBlciIsIm9PYmplY3RQYWdlTGF5b3V0Iiwib1NlbWFudGljT2JqZWN0Iiwib1BhcmFtIiwiZ2V0TGlua3MiLCJzZW1hbnRpY09iamVjdCIsInBhcmFtcyIsIl9jcmVhdGVNYXBwaW5ncyIsIm9NYXBwaW5nIiwiYVNPTWFwcGluZ3MiLCJhTWFwcGluZ0tleXMiLCJPYmplY3QiLCJvU2VtYW50aWNNYXBwaW5nIiwiaSIsImxlbmd0aCIsIkxvY2FsUHJvcGVydHkiLCIkUHJvcGVydHlQYXRoIiwiU2VtYW50aWNPYmplY3RQcm9wZXJ0eSIsInB1c2giLCJfZ2V0UmVsYXRlZEFwcHNNZW51SXRlbXMiLCJhTGlua3MiLCJhRXhjbHVkZWRBY3Rpb25zIiwib1RhcmdldFBhcmFtcyIsImFJdGVtcyIsImFBbGxvd2VkQWN0aW9ucyIsIm9MaW5rIiwic0ludGVudCIsImludGVudCIsInNBY3Rpb24iLCJpbmNsdWRlcyIsInRleHQiLCJ0YXJnZXRTZW1PYmplY3QiLCJ0YXJnZXRBY3Rpb24iLCJ0YXJnZXRQYXJhbXMiLCJpbmRleE9mIiwiX2dldFJlbGF0ZWRJbnRlbnRzIiwib0FkZGl0aW9uYWxTZW1hbnRpY09iamVjdHMiLCJvQmluZGluZ0NvbnRleHQiLCJhTWFuaWZlc3RTT0l0ZW1zIiwiYWxsb3dlZEFjdGlvbnMiLCJ1bmF2YWlsYWJsZUFjdGlvbnMiLCJtYXBwaW5nIiwibmF2aWdhdGlvbkNvbnRleHRzIiwic2VtYW50aWNPYmplY3RNYXBwaW5nIiwiX2dldFJlbGF0ZWRJbnRlbnRzV2l0aFNlbWFudGljT2JqZWN0c0FuZEFjdGlvbiIsInNlbWFudGljT2JqZWN0QW5kQWN0aW9uIiwiYXBwQ29tcG9uZW50U09JdGVtcyIsImFjdGlvbnMiLCJhY3Rpb24iLCJleGNsdWRlZEFjdGlvbnMiLCJzb01hcHBpbmdzIiwidXBkYXRlUmVsYXRlQXBwc01vZGVsIiwib0VudHJ5IiwiYVNlbUtleXMiLCJvTWV0YU1vZGVsIiwib01ldGFQYXRoIiwiYXBwQ29tcG9uZW50IiwiZ2V0U2hlbGxTZXJ2aWNlcyIsInNDdXJyZW50U2VtT2JqIiwic0N1cnJlbnRBY3Rpb24iLCJvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucyIsImFSZWxhdGVkQXBwc01lbnVJdGVtcyIsImFNYW5pZmVzdFNPS2V5cyIsImZuR2V0UGFyc2VTaGVsbEhhc2hBbmRHZXRMaW5rcyIsIm9QYXJzZWRVcmwiLCJwYXJzZVNoZWxsSGFzaCIsImRvY3VtZW50IiwibG9jYXRpb24iLCJoYXNoIiwiaiIsInNTZW1LZXkiLCJ2YWx1ZSIsImFUZWNobmljYWxLZXlzIiwiZ2V0T2JqZWN0Iiwia2V5Iiwic09iaktleSIsIm9NYW5pZmVzdERhdGEiLCJnZXRUYXJnZXRWaWV3IiwiZ2V0Vmlld0RhdGEiLCJzZW1hbnRpY09iamVjdEludGVudHMiLCJhZGRpdGlvbmFsU2VtYW50aWNPYmplY3RzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJjb21wb25lbnREYXRhIiwiZ2V0Q29tcG9uZW50RGF0YSIsImZlRW52aXJvbm1lbnQiLCJnZXRJbnRlbnQiLCJpbnRlcm5hbE1vZGVsQ29udGV4dCIsImdldEJpbmRpbmdDb250ZXh0IiwiaXNTZW1hbnRpY09iamVjdEhhc1NhbWVUYXJnZXRJbk1hbmlmZXN0IiwiYUFubm90YXRpb25zU09JdGVtcyIsInNFbnRpdHlTZXRQYXRoIiwic0VudGl0eVR5cGVQYXRoIiwib0VudGl0eVNldEFubm90YXRpb25zIiwiQ29tbW9uVXRpbHMiLCJnZXRTZW1hbnRpY09iamVjdEFubm90YXRpb25zIiwiYkhhc0VudGl0eVNldFNPIiwib0VudGl0eVR5cGVBbm5vdGF0aW9ucyIsImFVbmF2YWlsYWJsZUFjdGlvbnMiLCJhTWFwcGluZ3MiLCJzb0l0ZW1zIiwiY29uY2F0Iiwic2V0UHJvcGVydHkiLCJlcnJvciIsIkxvZyIsIl9nZXRTZW1hbnRpY09iamVjdEFubm90YXRpb25zIiwib0VudGl0eUFubm90YXRpb25zIiwic0Fubm90YXRpb25NYXBwaW5nVGVybSIsInNBbm5vdGF0aW9uQWN0aW9uVGVybSIsInNRdWFsaWZpZXIiLCJmblVwZGF0ZVJlbGF0ZWRBcHBzRGV0YWlscyIsInBhdGgiLCJzU2VtYW50aWNLZXlWb2NhYnVsYXJ5IiwicmVxdWVzdE9iamVjdCIsInRoZW4iLCJyZXF1ZXN0ZWRPYmplY3QiLCJjYXRjaCIsIm9FcnJvciIsImZuRmlyZUJ1dHRvblByZXNzIiwib0J1dHRvbiIsImlzQSIsImdldFZpc2libGUiLCJnZXRFbmFibGVkIiwiZmlyZVByZXNzIiwiZ2V0QXBwQ29tcG9uZW50Iiwib0NvbnRyb2wiLCJvT3duZXIiLCJDb21wb25lbnQiLCJnZXRPd25lckNvbXBvbmVudEZvciIsIkVycm9yIiwiZ2V0Q3VycmVudFBhZ2VWaWV3Iiwib0FwcENvbXBvbmVudCIsInJvb3RWaWV3Q29udHJvbGxlciIsImdldFJvb3RWaWV3Q29udHJvbGxlciIsImlzRmNsRW5hYmxlZCIsImdldFJpZ2h0bW9zdFZpZXciLCJnZXRSb290Q29udGFpbmVyIiwiZ2V0Q3VycmVudFBhZ2UiLCJvQ29tcG9uZW50IiwiZ2V0Q29tcG9uZW50SW5zdGFuY2UiLCJnZXRSb290Q29udHJvbCIsImdldFBhcmVudCIsIl9mbkNoZWNrSXNNYXRjaCIsIm9PYmplY3QiLCJvS2V5c1RvQ2hlY2siLCJzS2V5IiwiZm5HZXRDb250ZXh0UGF0aFByb3BlcnRpZXMiLCJtZXRhTW9kZWxDb250ZXh0Iiwic0NvbnRleHRQYXRoIiwib0ZpbHRlciIsIm9FbnRpdHlUeXBlIiwib1Byb3BlcnRpZXMiLCJoYXNPd25Qcm9wZXJ0eSIsInRlc3QiLCIka2luZCIsImZuR2V0TWFuZGF0b3J5RmlsdGVyRmllbGRzIiwiYU1hbmRhdG9yeUZpbHRlckZpZWxkcyIsImZuR2V0SUJOQWN0aW9ucyIsImFJQk5BY3Rpb25zIiwiYUFjdGlvbnMiLCJnZXRBY3Rpb25zIiwib0FjdGlvbiIsImdldEFjdGlvbiIsIm9NZW51IiwiZ2V0TWVudSIsImdldEl0ZW1zIiwib0l0ZW0iLCJkYXRhIiwiZm5VcGRhdGVEYXRhRmllbGRGb3JJQk5CdXR0b25zVmlzaWJpbGl0eSIsIm9WaWV3Iiwib1BhcmFtcyIsImlzU3RpY2t5IiwiTW9kZWxIZWxwZXIiLCJpc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQiLCJmbkdldExpbmtzIiwib0RhdGEiLCJhS2V5cyIsIm9JQk5BY3Rpb24iLCJzU2VtYW50aWNPYmplY3QiLCJhTGluayIsInNldFZpc2libGUiLCJnZXRJZCIsInNoZWxsTmF2aWdhdGlvbk5vdEF2YWlsYWJsZSIsImdldEFjdGlvblBhdGgiLCJhY3Rpb25Db250ZXh0IiwiYlJldHVybk9ubHlQYXRoIiwiaW5BY3Rpb25OYW1lIiwiYkNoZWNrU3RhdGljVmFsdWUiLCJzQWN0aW9uTmFtZSIsInRvU3RyaW5nIiwic0VudGl0eVR5cGVOYW1lIiwiJFR5cGUiLCJzRW50aXR5TmFtZSIsImdldEVudGl0eVNldE5hbWUiLCJzUHJvcGVydHkiLCJzQmluZGluZ1BhcmFtZXRlciIsInNFbnRpdHlUeXBlIiwib0VudGl0eUNvbnRhaW5lciIsImNvbXB1dGVEaXNwbGF5TW9kZSIsIm9Qcm9wZXJ0eUFubm90YXRpb25zIiwib0NvbGxlY3Rpb25Bbm5vdGF0aW9ucyIsIm9UZXh0QW5ub3RhdGlvbiIsIm9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uIiwiJEVudW1NZW1iZXIiLCJfZ2V0RW50aXR5VHlwZSIsIl9yZXF1ZXN0T2JqZWN0Iiwib1NlbGVjdGVkQ29udGV4dCIsIm5CcmFja2V0SW5kZXgiLCJzVGFyZ2V0VHlwZSIsInNsaWNlIiwic0N1cnJlbnRUeXBlIiwiZ2V0QmluZGluZyIsIndhcm5pbmciLCJzRHluYW1pY0FjdGlvbkVuYWJsZWRQYXRoIiwib1Byb21pc2UiLCJyZXF1ZXN0U2luZ2xldG9uUHJvcGVydHkiLCJ2UHJvcGVydHlWYWx1ZSIsInNldENvbnRleHRzQmFzZWRPbk9wZXJhdGlvbkF2YWlsYWJsZSIsIm9JbnRlcm5hbE1vZGVsQ29udGV4dCIsImFSZXF1ZXN0UHJvbWlzZXMiLCJhbGwiLCJhUmVzdWx0cyIsImFBcHBsaWNhYmxlQ29udGV4dHMiLCJhTm90QXBwbGljYWJsZUNvbnRleHRzIiwiYVJlc3VsdCIsInNldER5bmFtaWNBY3Rpb25Db250ZXh0cyIsInRyYWNlIiwiYUFwcGxpY2FibGUiLCJhTm90QXBwbGljYWJsZSIsInNEeW5hbWljQWN0aW9uUGF0aFByZWZpeCIsIm9JbnRlcm5hbE1vZGVsIiwiX2dldERlZmF1bHRPcGVyYXRvcnMiLCJzUHJvcGVydHlUeXBlIiwib0RhdGFDbGFzcyIsIlR5cGVVdGlsIiwiZ2V0RGF0YVR5cGVDbGFzc05hbWUiLCJvQmFzZVR5cGUiLCJnZXRCYXNlVHlwZSIsIkZpbHRlck9wZXJhdG9yVXRpbCIsImdldE9wZXJhdG9yc0ZvclR5cGUiLCJfZ2V0UmVzdHJpY3Rpb25zIiwiYURlZmF1bHRPcHMiLCJhRXhwcmVzc2lvbk9wcyIsImZpbHRlciIsInNFbGVtZW50IiwiZ2V0U3BlY2lmaWNBbGxvd2VkRXhwcmVzc2lvbiIsImFFeHByZXNzaW9ucyIsImFBbGxvd2VkRXhwcmVzc2lvbnNQcmlvcml0eSIsIkFsbG93ZWRFeHByZXNzaW9uc1ByaW8iLCJzb3J0IiwiYSIsImIiLCJnZXRPcGVyYXRvcnNGb3JQcm9wZXJ0eSIsInNUeXBlIiwiYlVzZVNlbWFudGljRGF0ZVJhbmdlIiwic1NldHRpbmdzIiwib0ZpbHRlclJlc3RyaWN0aW9ucyIsImdldEZpbHRlclJlc3RyaWN0aW9uc0J5UGF0aCIsImFFcXVhbHNPcHMiLCJhU2luZ2xlUmFuZ2VPcHMiLCJhU2luZ2xlUmFuZ2VEVEJhc2ljT3BzIiwiYVNpbmdsZVZhbHVlRGF0ZU9wcyIsImFNdWx0aVJhbmdlT3BzIiwiYVNlYXJjaEV4cHJlc3Npb25PcHMiLCJhU2VtYW50aWNEYXRlT3BzRXh0IiwiU2VtYW50aWNEYXRlT3BlcmF0b3JzIiwiZ2V0U3VwcG9ydGVkT3BlcmF0aW9ucyIsImJTZW1hbnRpY0RhdGVSYW5nZSIsImFTZW1hbnRpY0RhdGVPcHMiLCJvU2V0dGluZ3MiLCJKU09OIiwicGFyc2UiLCJjdXN0b21EYXRhIiwib3BlcmF0b3JDb25maWd1cmF0aW9uIiwiZ2V0RmlsdGVyT3BlcmF0aW9ucyIsImdldFNlbWFudGljRGF0ZU9wZXJhdGlvbnMiLCJhRGVmYXVsdE9wZXJhdG9ycyIsInJlc3RyaWN0aW9ucyIsIkZpbHRlckFsbG93ZWRFeHByZXNzaW9ucyIsInNBbGxvd2VkRXhwcmVzc2lvbiIsImFTaW5nbGVWYWx1ZU9wcyIsInNPcGVyYXRvcnMiLCJnZXRPcGVyYXRvcnNGb3JHdWlkUHJvcGVydHkiLCJhbGxvd2VkT3BlcmF0b3JzRm9yR3VpZCIsImdldE9wZXJhdG9yc0ZvckRhdGVQcm9wZXJ0eSIsInByb3BlcnR5VHlwZSIsImdldFBhcmFtZXRlckluZm8iLCJzUGFyYW1ldGVyQ29udGV4dFBhdGgiLCJzdWJzdHJpbmciLCJsYXN0SW5kZXhPZiIsImJSZXN1bHRDb250ZXh0Iiwib1BhcmFtZXRlckluZm8iLCJjb250ZXh0UGF0aCIsInBhcmFtZXRlclByb3BlcnRpZXMiLCJnZXRDb250ZXh0UGF0aFByb3BlcnRpZXMiLCJhZGRTZWxlY3RPcHRpb25Ub0NvbmRpdGlvbnMiLCJvUHJvcGVydHlNZXRhZGF0YSIsImFWYWxpZE9wZXJhdG9ycyIsImFTZW1hbnRpY0RhdGVPcGVyYXRvcnMiLCJhQ3VtdWxhdGl2ZUNvbmRpdGlvbnMiLCJvU2VsZWN0T3B0aW9uIiwib0NvbmRpdGlvbiIsImdldENvbmRpdGlvbnMiLCJTZW1hbnRpY0RhdGVzIiwib3BlcmF0b3IiLCJzZW1hbnRpY0RhdGVzIiwiYWRkU2VtYW50aWNEYXRlc1RvQ29uZGl0aW9ucyIsIm9TZW1hbnRpY0RhdGVzIiwidmFsdWVzIiwiaGlnaCIsImxvdyIsImlzRW1wdHkiLCJhZGRTZWxlY3RPcHRpb25zVG9Db25kaXRpb25zIiwib1NlbGVjdGlvblZhcmlhbnQiLCJzU2VsZWN0T3B0aW9uUHJvcCIsIm9Db25kaXRpb25zIiwic0NvbmRpdGlvblBhdGgiLCJzQ29uZGl0aW9uUHJvcCIsIm9WYWxpZFByb3BlcnRpZXMiLCJpc1BhcmFtZXRlciIsImJJc0ZMUFZhbHVlUHJlc2VudCIsIm9WaWV3RGF0YSIsImFDb25kaXRpb25zIiwiYVNlbGVjdE9wdGlvbnMiLCJNZXRhTW9kZWxGdW5jdGlvbiIsImlzUHJvcGVydHlGaWx0ZXJhYmxlIiwiZ2V0U2VsZWN0T3B0aW9uIiwic2V0dGluZ3MiLCJnZXRGaWx0ZXJDb25maWd1cmF0aW9uU2V0dGluZyIsImJpbmQiLCJlbGVtZW50IiwiY3JlYXRlU2VtYW50aWNEYXRlc0Zyb21Db25kaXRpb25zIiwib0NvbmZpZyIsImNvbnRyb2xDb25maWd1cmF0aW9uIiwiZmlsdGVyQ29uZmlnIiwiZmlsdGVyRmllbGRzIiwiYWRkU2VsZWN0aW9uVmFyaWFudFRvQ29uZGl0aW9ucyIsIm9NZXRhTW9kZWxDb250ZXh0IiwiYklzRkxQVmFsdWVzIiwiYVNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzIiwiZ2V0U2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMiLCJhTWV0YWRhdFByb3BlcnRpZXMiLCJvVmFsaWRQYXJhbWV0ZXJQcm9wZXJ0aWVzIiwiYU1ldGFkYXRhUGFyYW1ldGVycyIsInNNZXRhZGF0YVBhcmFtZXRlciIsInNTZWxlY3RPcHRpb25OYW1lIiwic3RhcnRzV2l0aCIsInNNZXRhZGF0YVByb3BlcnR5Iiwic1NlbGVjdE9wdGlvbiIsInNSZXBsYWNlZE9wdGlvbiIsInJlcGxhY2VBbGwiLCJzRnVsbENvbnRleHRQYXRoIiwiX2NyZWF0ZUNvbmRpdGlvbnNGb3JOYXZQcm9wZXJ0aWVzIiwic01haW5FbnRpdHlTZXRQYXRoIiwiYU5hdk9iamVjdE5hbWVzIiwic0Z1bGxQYXRoIiwic05hdlBhdGgiLCJzUHJvcGVydHlOYW1lIiwiJGlzQ29sbGVjdGlvbiIsInNOYXZQcm9wZXJ0eVBhdGgiLCJhZGRQYWdlQ29udGV4dFRvU2VsZWN0aW9uVmFyaWFudCIsIm1QYWdlQ29udGV4dCIsIm9OYXZpZ2F0aW9uU2VydmljZSIsImdldE5hdmlnYXRpb25TZXJ2aWNlIiwibWl4QXR0cmlidXRlc0FuZFNlbGVjdGlvblZhcmlhbnQiLCJ0b0pTT05TdHJpbmciLCJhZGRFeHRlcm5hbFN0YXRlRmlsdGVyc1RvU2VsZWN0aW9uVmFyaWFudCIsIm1GaWx0ZXJzIiwib1RhcmdldEluZm8iLCJvRmlsdGVyQmFyIiwic0ZpbHRlciIsImZuR2V0U2lnbkFuZE9wdGlvbiIsInNPcGVyYXRvciIsInNMb3dWYWx1ZSIsInNIaWdoVmFsdWUiLCJvU2VsZWN0T3B0aW9uU3RhdGUiLCJvcHRpb24iLCJzaWduIiwib0ZpbHRlckNvbmRpdGlvbnMiLCJmaWx0ZXJDb25kaXRpb25zIiwib0ZpbHRlcnNXaXRob3V0Q29uZmxpY3QiLCJmaWx0ZXJDb25kaXRpb25zV2l0aG91dENvbmZsaWN0Iiwib1RhYmxlUHJvcGVydGllc1dpdGhvdXRDb25mbGljdCIsInByb3BlcnRpZXNXaXRob3V0Q29uZmxpY3QiLCJhZGRGaWx0ZXJzVG9TZWxlY3Rpb25WYXJpYW50Iiwic2VsZWN0aW9uVmFyaWFudCIsInNGaWx0ZXJOYW1lIiwic1BhdGgiLCJvUHJvcGVydHlJbmZvIiwiZ2V0UHJvcGVydHlIZWxwZXIiLCJnZXRQcm9wZXJ0eSIsIm9UeXBlQ29uZmlnIiwidHlwZUNvbmZpZyIsIm9UeXBlVXRpbCIsImdldENvbnRyb2xEZWxlZ2F0ZSIsImdldFR5cGVVdGlsIiwiaXRlbSIsIm9PcGVyYXRvciIsImdldE9wZXJhdG9yIiwiUmFuZ2VPcGVyYXRvciIsIm9Nb2RlbEZpbHRlciIsImdldE1vZGVsRmlsdGVyIiwidHlwZUluc3RhbmNlIiwiYmFzZVR5cGUiLCJnZXRGaWx0ZXJzIiwiZXhjbHVkZSIsImV4dGVybmFsaXplVmFsdWUiLCJnZXRWYWx1ZTEiLCJnZXRWYWx1ZTIiLCJ2YWx1ZTEiLCJ2YWx1ZTIiLCJhZGRTZWxlY3RPcHRpb24iLCJpc1N0aWNreUVkaXRNb2RlIiwiYklzU3RpY2t5TW9kZSIsImJVSUVkaXRhYmxlIiwiYWRkRGVmYXVsdERpc3BsYXlDdXJyZW5jeSIsIm9TZWxlY3Rpb25WYXJpYW50RGVmYXVsdHMiLCJhU1ZPcHRpb24iLCJhRGVmYXVsdFNWT3B0aW9uIiwiZGlzcGxheUN1cnJlbmN5U2VsZWN0T3B0aW9uIiwic1NpZ24iLCJzT3B0aW9uIiwic0xvdyIsInNIaWdoIiwic2V0VXNlckRlZmF1bHRzIiwiYVBhcmFtZXRlcnMiLCJvTW9kZWwiLCJiSXNBY3Rpb24iLCJiSXNDcmVhdGUiLCJvQWN0aW9uRGVmYXVsdFZhbHVlcyIsIm9Db21wb25lbnREYXRhIiwib1N0YXJ0dXBQYXJhbWV0ZXJzIiwic3RhcnR1cFBhcmFtZXRlcnMiLCJvU2hlbGxTZXJ2aWNlcyIsIm9TdGFydHVwQXBwU3RhdGUiLCJnZXRTdGFydHVwQXBwU3RhdGUiLCJnZXREYXRhIiwiYUV4dGVuZGVkUGFyYW1ldGVycyIsIlNlbGVjdE9wdGlvbnMiLCJvUGFyYW1ldGVyIiwiJE5hbWUiLCJzUGFyYW1ldGVyTmFtZSIsIm9FeHRlbmRlZFBhcmFtZXRlciIsIlByb3BlcnR5TmFtZSIsIm9SYW5nZSIsIlJhbmdlcyIsIlNpZ24iLCJPcHRpb24iLCJMb3ciLCJnZXRBZGRpdGlvbmFsUGFyYW1zRm9yQ3JlYXRlIiwib0luYm91bmRQYXJhbWV0ZXJzIiwib0luYm91bmRzIiwiYUNyZWF0ZVBhcmFtZXRlcnMiLCJzUGFyYW1ldGVyIiwidXNlRm9yQ3JlYXRlIiwib1JldCIsInNDcmVhdGVQYXJhbWV0ZXIiLCJhVmFsdWVzIiwiY3JlYXRlIiwiZ2V0U2VtYW50aWNPYmplY3RNYXBwaW5nIiwib091dGJvdW5kIiwiYVNlbWFudGljT2JqZWN0TWFwcGluZyIsInBhcmFtZXRlcnMiLCJzUGFyYW0iLCJmb3JtYXQiLCJnZXRIZWFkZXJGYWNldEl0ZW1Db25maWdGb3JFeHRlcm5hbE5hdmlnYXRpb24iLCJvQ3Jvc3NOYXYiLCJvSGVhZGVyRmFjZXRJdGVtcyIsInNJZCIsIm9Db250cm9sQ29uZmlnIiwiY29uZmlnIiwic091dGJvdW5kIiwibmF2aWdhdGlvbiIsInRhcmdldE91dGJvdW5kIiwib3V0Ym91bmQiLCJnZW5lcmF0ZSIsInNldFNlbWFudGljT2JqZWN0TWFwcGluZ3MiLCJ2TWFwcGluZ3MiLCJvTWFwcGluZ3MiLCJzTG9jYWxQcm9wZXJ0eSIsInNTZW1hbnRpY09iamVjdFByb3BlcnR5IiwicmVtb3ZlU2VsZWN0T3B0aW9uIiwibWFzc0FkZFNlbGVjdE9wdGlvbiIsImZuR2V0U2VtYW50aWNPYmplY3RzRnJvbVBhdGgiLCJhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMiLCJhU2VtYW50aWNPYmplY3RGb3JHZXRMaW5rcyIsInNlbWFudGljT2JqZWN0UGF0aCIsInNlbWFudGljT2JqZWN0Rm9yR2V0TGlua3MiLCJmblVwZGF0ZVNlbWFudGljVGFyZ2V0c01vZGVsIiwiYUdldExpbmtzUHJvbWlzZXMiLCJhU2VtYW50aWNPYmplY3RzIiwic0N1cnJlbnRIYXNoIiwiX29MaW5rIiwiX3NMaW5rSW50ZW50QWN0aW9uIiwiYUZpbmFsTGlua3MiLCJvRmluYWxTZW1hbnRpY09iamVjdHMiLCJiSW50ZW50SGFzQWN0aW9ucyIsImsiLCJvVG1wIiwic0FsdGVybmF0ZVBhdGgiLCJoYXNUYXJnZXRzTm90RmlsdGVyZWQiLCJoYXNUYXJnZXRzIiwiaUxpbmtDb3VudCIsIkhhc1RhcmdldHMiLCJIYXNUYXJnZXRzTm90RmlsdGVyZWQiLCJhc3NpZ24iLCJzU2VtYW50aWNPYmplY3ROYW1lIiwibWVyZ2VPYmplY3RzIiwiZm5HZXRTZW1hbnRpY09iamVjdFByb21pc2UiLCJnZXRTZW1hbnRpY09iamVjdHNGcm9tUGF0aCIsImZuUHJlcGFyZVNlbWFudGljT2JqZWN0c1Byb21pc2VzIiwiX29BcHBDb21wb25lbnQiLCJfb1ZpZXciLCJfb01ldGFNb2RlbCIsIl9hU2VtYW50aWNPYmplY3RzRm91bmQiLCJfYVNlbWFudGljT2JqZWN0c1Byb21pc2VzIiwiX0tleXMiLCJyZWdleFJlc3VsdCIsImluZGV4IiwiZXhlYyIsImdldFNlbWFudGljT2JqZWN0UHJvbWlzZSIsImZuR2V0U2VtYW50aWNUYXJnZXRzRnJvbVBhZ2VNb2RlbCIsIm9Db250cm9sbGVyIiwic1BhZ2VNb2RlbCIsIl9mbmZpbmRWYWx1ZXNIZWxwZXIiLCJvYmoiLCJsaXN0IiwiQXJyYXkiLCJjaGlsZHJlbiIsIl9mbmZpbmRWYWx1ZXMiLCJfZm5EZWxldGVEdXBsaWNhdGVTZW1hbnRpY09iamVjdHMiLCJhU2VtYW50aWNPYmplY3RQYXRoIiwiZ2V0VmlldyIsImFTZW1hbnRpY09iamVjdHNQcm9taXNlcyIsImdldE93bmVyQ29tcG9uZW50Iiwib1BhZ2VNb2RlbCIsInN0cmluZ2lmeSIsIl9nZXRPYmplY3QiLCJhU2VtYW50aWNPYmplY3RzRm91bmQiLCJnZXRIYXNoIiwiYVNlbWFudGljT2JqZWN0c0ZvckdldExpbmtzIiwiX29TZW1hbnRpY09iamVjdCIsInNTZW1PYmpFeHByZXNzaW9uIiwiYVNlbWFudGljT2JqZWN0c1Jlc29sdmVkIiwiY29tcGlsZUV4cHJlc3Npb24iLCJwYXRoSW5Nb2RlbCIsIiRQYXRoIiwiZ2V0TGlua3NXaXRoQ2FjaGUiLCJ1cGRhdGVTZW1hbnRpY1RhcmdldHMiLCJnZXRGaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbiIsIm9GaWx0ZXJSZXN0cmljdGlvbnNBbm5vdGF0aW9uIiwibUFsbG93ZWRFeHByZXNzaW9ucyIsIkZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvbnMiLCJvUHJvcGVydHkiLCJQcm9wZXJ0eSIsIkFsbG93ZWRFeHByZXNzaW9ucyIsImdldEZpbHRlclJlc3RyaWN0aW9ucyIsInNSZXN0cmljdGlvbiIsImFQcm9wcyIsIm1hcCIsIl9mZXRjaFByb3BlcnRpZXNGb3JOYXZQYXRoIiwicGF0aHMiLCJuYXZQYXRoIiwicHJvcHMiLCJuYXZQYXRoUHJlZml4Iiwib3V0UGF0aHMiLCJwYXRoVG9DaGVjayIsIm91dFBhdGgiLCJSZXF1aXJlZFByb3BlcnRpZXMiLCJOb25GaWx0ZXJhYmxlUHJvcGVydGllcyIsIm5hdmlnYXRpb25UZXh0IiwiZnJUZXJtIiwiZW50aXR5VHlwZVBhdGhQYXJ0cyIsImZpbHRlck91dE5hdlByb3BCaW5kaW5nIiwiZW50aXR5VHlwZVBhdGgiLCJqb2luIiwiZW50aXR5U2V0UGF0aCIsImdldEVudGl0eVNldFBhdGgiLCJlbnRpdHlTZXRQYXRoUGFydHMiLCJpc0NvbnRhaW5tZW50IiwiY29udGFpbm1lbnROYXZQYXRoIiwicmVzdWx0Q29udGV4dENoZWNrIiwicGFyZW50RW50aXR5U2V0UGF0aCIsIm9QYXJlbnRSZXQiLCJvUGFyZW50RlIiLCJjb21wbGV0ZUFsbG93ZWRFeHBzIiwib3V0UHJvcCIsInByb3BQYXRoIiwib3V0UHJvcFBhdGgiLCJvTmF2UmVzdHJpY3Rpb25zIiwiZ2V0TmF2aWdhdGlvblJlc3RyaWN0aW9ucyIsIm9OYXZGaWx0ZXJSZXN0IiwibmF2UmVzUmVxUHJvcHMiLCJ1bmlxdWVTb3J0IiwibmF2Tm9uRmlsdGVyUHJvcHMiLCJuYXZBc3NvY2lhdGlvbkVudGl0eVJlc3QiLCJuYXZBc3NvY1JlcVByb3BzIiwibmF2QXNzb2NOb25GaWx0ZXJQcm9wcyIsInRlbXBsYXRlQ29udHJvbEZyYWdtZW50Iiwic0ZyYWdtZW50TmFtZSIsIm9QcmVwcm9jZXNzb3JTZXR0aW5ncyIsIm9PcHRpb25zIiwib01vZGlmaWVyIiwidmlldyIsIm9GcmFnbWVudCIsInRhcmdldHMiLCJYTUxQcmVwcm9jZXNzb3IiLCJwcm9jZXNzIiwiWE1MVGVtcGxhdGVQcm9jZXNzb3IiLCJsb2FkVGVtcGxhdGUiLCJmaXJzdEVsZW1lbnRDaGlsZCIsImlzWE1MIiwiRnJhZ21lbnQiLCJsb2FkIiwiaWQiLCJkZWZpbml0aW9uIiwiY29udHJvbGxlciIsImdldFNpbmdsZXRvblBhdGgiLCJwYXJ0cyIsIkJvb2xlYW4iLCJwcm9wZXJ0eU5hbWUiLCJwb3AiLCJuYXZpZ2F0aW9uUGF0aCIsImVudGl0eVNldCIsInNpbmdsZXRvbk5hbWUiLCJyZXNvbHZlZFBhdGgiLCJwcm9wZXJ0eUJpbmRpbmciLCJiaW5kUHJvcGVydHkiLCJyZXF1ZXN0VmFsdWUiLCJnZXRQYXJhbWV0ZXJQYXRoIiwic0NvbnRleHQiLCJhQWN0aW9uIiwiX2ZudHJhbnNsYXRlZFRleHRGcm9tRXhwQmluZGluZ1N0cmluZyIsImV4cEJpbmRpbmciLCJjb250cm9sIiwiYW55UmVzb3VyY2VUZXh0IiwiQW55RWxlbWVudCIsImFueVRleHQiLCJhZGREZXBlbmRlbnQiLCJyZXN1bHRUZXh0IiwiZ2V0QW55VGV4dCIsInJlbW92ZURlcGVuZGVudCIsImRlc3Ryb3kiLCJpc1NtYWxsRGV2aWNlIiwic3lzdGVtIiwiZGVza3RvcCIsIkRldmljZSIsInJlc2l6ZSIsIndpZHRoIiwiZ2V0RmlsdGVyc0luZm9Gb3JTViIsInNlbGVjdGlvblZhcmlhbnRQYXRoIiwiaXNDaGFydCIsIm1Qcm9wZXJ0eUZpbHRlcnMiLCJhRmlsdGVycyIsImFQYXRocyIsInNUZXh0IiwiU2VsZWN0aW9uVmFyaWFudCIsIlRleHQiLCJGaWx0ZXIiLCJIaWdoIiwic1Byb3BlcnR5UGF0aCIsImZpbHRlcnMiLCJhbmQiLCJwcm9wZXJ0aWVzIiwiZ2V0Q29udmVydGVyQ29udGV4dEZvclBhdGgiLCJzTWV0YVBhdGgiLCJzRW50aXR5U2V0Iiwib0RpYWdub3N0aWNzIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJDb252ZXJ0ZXJDb250ZXh0IiwiY3JlYXRlQ29udmVydGVyQ29udGV4dEZvck1hY3JvIiwiZ2V0SW50ZXJuYWxDaGFydE5hbWVGcm9tUHJvcGVydHlOYW1lQW5kS2luZCIsImtpbmQiLCJnZXRDaGFydFByb3BlcnRpZXNXaXRob3V0UHJlZml4ZXMiLCJmaXJlQnV0dG9uUHJlc3MiLCJoYXNUcmFuc2llbnRDb250ZXh0IiwidXBkYXRlUmVsYXRlZEFwcHNEZXRhaWxzIiwiZ2V0TWFuZGF0b3J5RmlsdGVyRmllbGRzIiwidXBkYXRlRGF0YUZpZWxkRm9ySUJOQnV0dG9uc1Zpc2liaWxpdHkiLCJnZXRJQk5BY3Rpb25zIiwiZ2V0U2VtYW50aWNUYXJnZXRzRnJvbVBhZ2VNb2RlbCIsIkZpbHRlclJlc3RyaWN0aW9ucyIsIlJFUVVJUkVEX1BST1BFUlRJRVMiLCJOT05fRklMVEVSQUJMRV9QUk9QRVJUSUVTIiwiQUxMT1dFRF9FWFBSRVNTSU9OUyIsImdldFJlbGF0ZWRBcHBzTWVudUl0ZW1zIiwiZ2V0VHJhbnNsYXRlZFRleHRGcm9tRXhwQmluZGluZ1N0cmluZyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQ29tbW9uVXRpbHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgKiBhcyBFZG0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL0VkbVwiO1xuaW1wb3J0IHR5cGUgeyBGaWx0ZXJSZXN0cmljdGlvbnNUeXBlIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9DYXBhYmlsaXRpZXNcIjtcbmltcG9ydCB0eXBlIHsgU2VtYW50aWNPYmplY3RNYXBwaW5nVHlwZSwgU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW1vblwiO1xuaW1wb3J0IHsgQ29tbW9uQW5ub3RhdGlvblRlcm1zIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tb25cIjtcbmltcG9ydCB0eXBlIHsgVGV4dEFycmFuZ2VtZW50IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdW5pcXVlU29ydCBmcm9tIFwic2FwL2Jhc2UvdXRpbC9hcnJheS91bmlxdWVTb3J0XCI7XG5pbXBvcnQgbWVyZ2VPYmplY3RzIGZyb20gXCJzYXAvYmFzZS91dGlsL21lcmdlXCI7XG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IHR5cGUgeyBDb21wb25lbnREYXRhIH0gZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IENvbnZlcnRlckNvbnRleHQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0ICogYXMgTWV0YU1vZGVsQ29udmVydGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHsgY29tcGlsZUV4cHJlc3Npb24sIHBhdGhJbk1vZGVsIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB0eXBlIHsgSW50ZXJuYWxNb2RlbENvbnRleHQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgU2VtYW50aWNEYXRlT3BlcmF0b3JzIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1NlbWFudGljRGF0ZU9wZXJhdG9yc1wiO1xuaW1wb3J0IHsgZ2VuZXJhdGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgdHlwZSB7IElTaGVsbFNlcnZpY2VzIH0gZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL1NoZWxsU2VydmljZXNGYWN0b3J5XCI7XG5pbXBvcnQgdHlwZSBEaWFnbm9zdGljcyBmcm9tIFwic2FwL2ZlL2NvcmUvc3VwcG9ydC9EaWFnbm9zdGljc1wiO1xuaW1wb3J0IFR5cGVVdGlsIGZyb20gXCJzYXAvZmUvY29yZS90eXBlL1R5cGVVdGlsXCI7XG5pbXBvcnQgdHlwZSBTZWxlY3Rpb25WYXJpYW50IGZyb20gXCJzYXAvZmUvbmF2aWdhdGlvbi9TZWxlY3Rpb25WYXJpYW50XCI7XG5pbXBvcnQgdHlwZSB7IFNlbGVjdE9wdGlvbiwgU2VtYW50aWNEYXRlQ29uZmlndXJhdGlvbiB9IGZyb20gXCJzYXAvZmUvbmF2aWdhdGlvbi9TZWxlY3Rpb25WYXJpYW50XCI7XG5pbXBvcnQgdHlwZSBCdXR0b24gZnJvbSBcInNhcC9tL0J1dHRvblwiO1xuaW1wb3J0IHR5cGUgTWVudUJ1dHRvbiBmcm9tIFwic2FwL20vTWVudUJ1dHRvblwiO1xuaW1wb3J0IHR5cGUgTmF2Q29udGFpbmVyIGZyb20gXCJzYXAvbS9OYXZDb250YWluZXJcIjtcbmltcG9ydCB0eXBlIE92ZXJmbG93VG9vbGJhckJ1dHRvbiBmcm9tIFwic2FwL20vT3ZlcmZsb3dUb29sYmFyQnV0dG9uXCI7XG5pbXBvcnQgdHlwZSBNYW5hZ2VkT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gXCJzYXAvdWkvY29yZS9Db21wb25lbnRcIjtcbmltcG9ydCB0eXBlIENvbXBvbmVudENvbnRhaW5lciBmcm9tIFwic2FwL3VpL2NvcmUvQ29tcG9uZW50Q29udGFpbmVyXCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgdHlwZSBVSTVFbGVtZW50IGZyb20gXCJzYXAvdWkvY29yZS9FbGVtZW50XCI7XG5pbXBvcnQgRnJhZ21lbnQgZnJvbSBcInNhcC91aS9jb3JlL0ZyYWdtZW50XCI7XG5pbXBvcnQgdHlwZSBDb250cm9sbGVyIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvQ29udHJvbGxlclwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCBYTUxQcmVwcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL3V0aWwvWE1MUHJlcHJvY2Vzc29yXCI7XG5pbXBvcnQgWE1MVGVtcGxhdGVQcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL1hNTFRlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgRGV2aWNlLCB7IHN5c3RlbSB9IGZyb20gXCJzYXAvdWkvRGV2aWNlXCI7XG5pbXBvcnQgdHlwZSBBY3Rpb25Ub29sYmFyQWN0aW9uIGZyb20gXCJzYXAvdWkvbWRjL2FjdGlvbnRvb2xiYXIvQWN0aW9uVG9vbGJhckFjdGlvblwiO1xuaW1wb3J0IHR5cGUgeyBkZWZhdWx0IGFzIE1EQ0NoYXJ0IH0gZnJvbSBcInNhcC91aS9tZGMvQ2hhcnRcIjtcbmltcG9ydCB0eXBlIHsgQ29uZGl0aW9uT2JqZWN0IH0gZnJvbSBcInNhcC91aS9tZGMvY29uZGl0aW9uL0NvbmRpdGlvblwiO1xuaW1wb3J0IEZpbHRlck9wZXJhdG9yVXRpbCBmcm9tIFwic2FwL3VpL21kYy9jb25kaXRpb24vRmlsdGVyT3BlcmF0b3JVdGlsXCI7XG5pbXBvcnQgUmFuZ2VPcGVyYXRvciBmcm9tIFwic2FwL3VpL21kYy9jb25kaXRpb24vUmFuZ2VPcGVyYXRvclwiO1xuaW1wb3J0IHR5cGUgRmlsdGVyQmFyIGZyb20gXCJzYXAvdWkvbWRjL0ZpbHRlckJhclwiO1xuaW1wb3J0IHR5cGUgVGFibGUgZnJvbSBcInNhcC91aS9tZGMvVGFibGVcIjtcbmltcG9ydCB0eXBlIE1EQ1RhYmxlIGZyb20gXCJzYXAvdWkvbWRjL3ZhbHVlaGVscC9jb250ZW50L01EQ1RhYmxlXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IEZpbHRlciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlclwiO1xuaW1wb3J0IHR5cGUgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhVjRDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFMaXN0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTGlzdEJpbmRpbmdcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBPYmplY3RQYWdlRHluYW1pY0hlYWRlclRpdGxlIGZyb20gXCJzYXAvdXhhcC9PYmplY3RQYWdlRHluYW1pY0hlYWRlclRpdGxlXCI7XG5pbXBvcnQgdHlwZSBPYmplY3RQYWdlTGF5b3V0IGZyb20gXCJzYXAvdXhhcC9PYmplY3RQYWdlTGF5b3V0XCI7XG5pbXBvcnQgdHlwZSB7XG5cdEV4cGFuZFBhdGhUeXBlLFxuXHRNZXRhTW9kZWxFbnRpdHlUeXBlLFxuXHRNZXRhTW9kZWxFbnVtLFxuXHRNZXRhTW9kZWxOYXZQcm9wZXJ0eSxcblx0TWV0YU1vZGVsUHJvcGVydHksXG5cdE1ldGFNb2RlbFR5cGVcbn0gZnJvbSBcInR5cGVzL21ldGFtb2RlbF90eXBlc1wiO1xuaW1wb3J0IEFueUVsZW1lbnQgZnJvbSBcIi4vY29udHJvbHMvQW55RWxlbWVudFwiO1xuaW1wb3J0ICogYXMgTWV0YU1vZGVsRnVuY3Rpb24gZnJvbSBcIi4vaGVscGVycy9NZXRhTW9kZWxGdW5jdGlvblwiO1xuaW1wb3J0IHsgZ2V0Q29uZGl0aW9ucyB9IGZyb20gXCIuL3RlbXBsYXRpbmcvRmlsdGVySGVscGVyXCI7XG5cbnR5cGUgQ29uZGl0aW9uVHlwZSA9IHtcblx0b3BlcmF0b3I6IHN0cmluZztcblx0dmFsdWVzOiBBcnJheTx1bmtub3duPiB8IHVuZGVmaW5lZDtcblx0dmFsaWRhdGVkPzogc3RyaW5nO1xufTtcblxudHlwZSBNeUluYm94SW50ZW50ID0ge1xuXHRzZW1hbnRpY09iamVjdDogc3RyaW5nO1xuXHRhY3Rpb246IHN0cmluZztcbn07XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVNlYXJjaFRlcm0oc1NlYXJjaFRlcm06IHN0cmluZykge1xuXHRpZiAoIXNTZWFyY2hUZXJtKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdHJldHVybiBzU2VhcmNoVGVybVxuXHRcdC5yZXBsYWNlKC9cIi9nLCBcIiBcIilcblx0XHQucmVwbGFjZSgvXFxcXC9nLCBcIlxcXFxcXFxcXCIpIC8vZXNjYXBlIGJhY2tzbGFzaCBjaGFyYWN0ZXJzLiBDYW4gYmUgcmVtb3ZlZCBpZiBvZGF0YS9iaW5kaW5nIGhhbmRsZXMgYmFja2VuZCBlcnJvcnMgcmVzcG9uZHMuXG5cdFx0LnNwbGl0KC9cXHMrLylcblx0XHQucmVkdWNlKGZ1bmN0aW9uIChzTm9ybWFsaXplZDogc3RyaW5nIHwgdW5kZWZpbmVkLCBzQ3VycmVudFdvcmQ6IHN0cmluZykge1xuXHRcdFx0aWYgKHNDdXJyZW50V29yZCAhPT0gXCJcIikge1xuXHRcdFx0XHRzTm9ybWFsaXplZCA9IGAke3NOb3JtYWxpemVkID8gYCR7c05vcm1hbGl6ZWR9IGAgOiBcIlwifVwiJHtzQ3VycmVudFdvcmR9XCJgO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHNOb3JtYWxpemVkO1xuXHRcdH0sIHVuZGVmaW5lZCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHdhaXRGb3JDb250ZXh0UmVxdWVzdGVkKGJpbmRpbmdDb250ZXh0OiBPRGF0YVY0Q29udGV4dCkge1xuXHRjb25zdCBtb2RlbCA9IGJpbmRpbmdDb250ZXh0LmdldE1vZGVsKCk7XG5cdGNvbnN0IG1ldGFNb2RlbCA9IG1vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRjb25zdCBlbnRpdHlQYXRoID0gbWV0YU1vZGVsLmdldE1ldGFQYXRoKGJpbmRpbmdDb250ZXh0LmdldFBhdGgoKSk7XG5cdGNvbnN0IGRhdGFNb2RlbCA9IE1ldGFNb2RlbENvbnZlcnRlci5nZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMobWV0YU1vZGVsLmdldENvbnRleHQoZW50aXR5UGF0aCkpO1xuXHRhd2FpdCBiaW5kaW5nQ29udGV4dC5yZXF1ZXN0UHJvcGVydHkoZGF0YU1vZGVsLnRhcmdldEVudGl0eVR5cGUua2V5c1swXT8ubmFtZSk7XG59XG5cbmZ1bmN0aW9uIGZuSGFzVHJhbnNpZW50Q29udGV4dHMob0xpc3RCaW5kaW5nOiBPRGF0YUxpc3RCaW5kaW5nKSB7XG5cdGxldCBiSGFzVHJhbnNpZW50Q29udGV4dHMgPSBmYWxzZTtcblx0aWYgKG9MaXN0QmluZGluZykge1xuXHRcdG9MaXN0QmluZGluZy5nZXRDdXJyZW50Q29udGV4dHMoKS5mb3JFYWNoKGZ1bmN0aW9uIChvQ29udGV4dDogT0RhdGFWNENvbnRleHQpIHtcblx0XHRcdGlmIChvQ29udGV4dCAmJiBvQ29udGV4dC5pc1RyYW5zaWVudCgpKSB7XG5cdFx0XHRcdGJIYXNUcmFuc2llbnRDb250ZXh0cyA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGJIYXNUcmFuc2llbnRDb250ZXh0cztcbn1cblxuLy8gdGhlcmUgaXMgbm8gbmF2aWdhdGlvbiBpbiBlbnRpdHlTZXQgcGF0aCBhbmQgcHJvcGVydHkgcGF0aFxuXG5hc3luYyBmdW5jdGlvbiBfZ2V0U09JbnRlbnRzKFxuXHRvU2hlbGxTZXJ2aWNlSGVscGVyOiBJU2hlbGxTZXJ2aWNlcyxcblx0b09iamVjdFBhZ2VMYXlvdXQ6IE9iamVjdFBhZ2VMYXlvdXQsXG5cdG9TZW1hbnRpY09iamVjdDogdW5rbm93bixcblx0b1BhcmFtOiB1bmtub3duXG4pOiBQcm9taXNlPExpbmtEZWZpbml0aW9uW10+IHtcblx0cmV0dXJuIG9TaGVsbFNlcnZpY2VIZWxwZXIuZ2V0TGlua3Moe1xuXHRcdHNlbWFudGljT2JqZWN0OiBvU2VtYW50aWNPYmplY3QsXG5cdFx0cGFyYW1zOiBvUGFyYW1cblx0fSkgYXMgUHJvbWlzZTxMaW5rRGVmaW5pdGlvbltdPjtcbn1cblxuLy8gVE8tRE8gYWRkIHRoaXMgYXMgcGFydCBvZiBhcHBseVNlbWFudGljT2JqZWN0bWFwcGluZ3MgbG9naWMgaW4gSW50ZW50QmFzZWRuYXZpZ2F0aW9uIGNvbnRyb2xsZXIgZXh0ZW5zaW9uXG5mdW5jdGlvbiBfY3JlYXRlTWFwcGluZ3Mob01hcHBpbmc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSB7XG5cdGNvbnN0IGFTT01hcHBpbmdzID0gW107XG5cdGNvbnN0IGFNYXBwaW5nS2V5cyA9IE9iamVjdC5rZXlzKG9NYXBwaW5nKTtcblx0bGV0IG9TZW1hbnRpY01hcHBpbmc7XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgYU1hcHBpbmdLZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0b1NlbWFudGljTWFwcGluZyA9IHtcblx0XHRcdExvY2FsUHJvcGVydHk6IHtcblx0XHRcdFx0JFByb3BlcnR5UGF0aDogYU1hcHBpbmdLZXlzW2ldXG5cdFx0XHR9LFxuXHRcdFx0U2VtYW50aWNPYmplY3RQcm9wZXJ0eTogb01hcHBpbmdbYU1hcHBpbmdLZXlzW2ldXVxuXHRcdH07XG5cdFx0YVNPTWFwcGluZ3MucHVzaChvU2VtYW50aWNNYXBwaW5nKTtcblx0fVxuXG5cdHJldHVybiBhU09NYXBwaW5ncztcbn1cbnR5cGUgTGlua0RlZmluaXRpb24gPSB7XG5cdGludGVudDogc3RyaW5nO1xuXHR0ZXh0OiBzdHJpbmc7XG59O1xudHlwZSBTZW1hbnRpY0l0ZW0gPSB7XG5cdHRleHQ6IHN0cmluZztcblx0dGFyZ2V0U2VtT2JqZWN0OiBzdHJpbmc7XG5cdHRhcmdldEFjdGlvbjogc3RyaW5nO1xuXHR0YXJnZXRQYXJhbXM6IHVua25vd247XG59O1xuLyoqXG4gKiBAcGFyYW0gYUxpbmtzXG4gKiBAcGFyYW0gYUV4Y2x1ZGVkQWN0aW9uc1xuICogQHBhcmFtIG9UYXJnZXRQYXJhbXNcbiAqIEBwYXJhbSBhSXRlbXNcbiAqIEBwYXJhbSBhQWxsb3dlZEFjdGlvbnNcbiAqL1xuZnVuY3Rpb24gX2dldFJlbGF0ZWRBcHBzTWVudUl0ZW1zKFxuXHRhTGlua3M6IExpbmtEZWZpbml0aW9uW10sXG5cdGFFeGNsdWRlZEFjdGlvbnM6IHVua25vd25bXSxcblx0b1RhcmdldFBhcmFtczogdW5rbm93bixcblx0YUl0ZW1zOiBTZW1hbnRpY0l0ZW1bXSxcblx0YUFsbG93ZWRBY3Rpb25zPzogdW5rbm93bltdXG4pIHtcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhTGlua3MubGVuZ3RoOyBpKyspIHtcblx0XHRjb25zdCBvTGluayA9IGFMaW5rc1tpXTtcblx0XHRjb25zdCBzSW50ZW50ID0gb0xpbmsuaW50ZW50O1xuXHRcdGNvbnN0IHNBY3Rpb24gPSBzSW50ZW50LnNwbGl0KFwiLVwiKVsxXS5zcGxpdChcIj9cIilbMF07XG5cdFx0aWYgKGFBbGxvd2VkQWN0aW9ucyAmJiBhQWxsb3dlZEFjdGlvbnMuaW5jbHVkZXMoc0FjdGlvbikpIHtcblx0XHRcdGFJdGVtcy5wdXNoKHtcblx0XHRcdFx0dGV4dDogb0xpbmsudGV4dCxcblx0XHRcdFx0dGFyZ2V0U2VtT2JqZWN0OiBzSW50ZW50LnNwbGl0KFwiI1wiKVsxXS5zcGxpdChcIi1cIilbMF0sXG5cdFx0XHRcdHRhcmdldEFjdGlvbjogc0FjdGlvbi5zcGxpdChcIn5cIilbMF0sXG5cdFx0XHRcdHRhcmdldFBhcmFtczogb1RhcmdldFBhcmFtc1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIGlmICghYUFsbG93ZWRBY3Rpb25zICYmIGFFeGNsdWRlZEFjdGlvbnMgJiYgYUV4Y2x1ZGVkQWN0aW9ucy5pbmRleE9mKHNBY3Rpb24pID09PSAtMSkge1xuXHRcdFx0YUl0ZW1zLnB1c2goe1xuXHRcdFx0XHR0ZXh0OiBvTGluay50ZXh0LFxuXHRcdFx0XHR0YXJnZXRTZW1PYmplY3Q6IHNJbnRlbnQuc3BsaXQoXCIjXCIpWzFdLnNwbGl0KFwiLVwiKVswXSxcblx0XHRcdFx0dGFyZ2V0QWN0aW9uOiBzQWN0aW9uLnNwbGl0KFwiflwiKVswXSxcblx0XHRcdFx0dGFyZ2V0UGFyYW1zOiBvVGFyZ2V0UGFyYW1zXG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cbn1cblxudHlwZSBTZW1hbnRpY09iamVjdCA9IHtcblx0YWxsb3dlZEFjdGlvbnM/OiB1bmtub3duW107XG5cdHVuYXZhaWxhYmxlQWN0aW9ucz86IHVua25vd25bXTtcblx0c2VtYW50aWNPYmplY3Q6IHN0cmluZztcblx0cGF0aDogc3RyaW5nO1xuXHRtYXBwaW5nPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn07XG5cbmZ1bmN0aW9uIF9nZXRSZWxhdGVkSW50ZW50cyhcblx0b0FkZGl0aW9uYWxTZW1hbnRpY09iamVjdHM6IFNlbWFudGljT2JqZWN0LFxuXHRvQmluZGluZ0NvbnRleHQ6IENvbnRleHQsXG5cdGFNYW5pZmVzdFNPSXRlbXM6IFNlbWFudGljSXRlbVtdLFxuXHRhTGlua3M6IExpbmtEZWZpbml0aW9uW11cbikge1xuXHRpZiAoYUxpbmtzICYmIGFMaW5rcy5sZW5ndGggPiAwKSB7XG5cdFx0Y29uc3QgYUFsbG93ZWRBY3Rpb25zID0gb0FkZGl0aW9uYWxTZW1hbnRpY09iamVjdHMuYWxsb3dlZEFjdGlvbnMgfHwgdW5kZWZpbmVkO1xuXHRcdGNvbnN0IGFFeGNsdWRlZEFjdGlvbnMgPSBvQWRkaXRpb25hbFNlbWFudGljT2JqZWN0cy51bmF2YWlsYWJsZUFjdGlvbnMgPyBvQWRkaXRpb25hbFNlbWFudGljT2JqZWN0cy51bmF2YWlsYWJsZUFjdGlvbnMgOiBbXTtcblx0XHRjb25zdCBhU09NYXBwaW5ncyA9IG9BZGRpdGlvbmFsU2VtYW50aWNPYmplY3RzLm1hcHBpbmcgPyBfY3JlYXRlTWFwcGluZ3Mob0FkZGl0aW9uYWxTZW1hbnRpY09iamVjdHMubWFwcGluZykgOiBbXTtcblx0XHRjb25zdCBvVGFyZ2V0UGFyYW1zID0geyBuYXZpZ2F0aW9uQ29udGV4dHM6IG9CaW5kaW5nQ29udGV4dCwgc2VtYW50aWNPYmplY3RNYXBwaW5nOiBhU09NYXBwaW5ncyB9O1xuXHRcdF9nZXRSZWxhdGVkQXBwc01lbnVJdGVtcyhhTGlua3MsIGFFeGNsdWRlZEFjdGlvbnMsIG9UYXJnZXRQYXJhbXMsIGFNYW5pZmVzdFNPSXRlbXMsIGFBbGxvd2VkQWN0aW9ucyk7XG5cdH1cbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gVGhpcyBmdW5jdGlvbiBmZXRjaGVzIHRoZSByZWxhdGVkIGludGVudHMgd2hlbiBzZW1hbnRpYyBvYmplY3QgYW5kIGFjdGlvbiBhcmUgcGFzc2VkIGZyb20gZmVFbnZpcm9ubWVudC5nZXRJbnRlbnQoKSBvbmx5IGluIGNhc2Ugb2YgTXkgSW5ib3ggaW50ZWdyYXRpb25cbiAqIEBwYXJhbSBzZW1hbnRpY09iamVjdEFuZEFjdGlvbiBUaGlzIHNwZWNpZmllcyB0aGUgc2VtYW50aWMgb2JqZWN0IGFuZCBhY3Rpb24gZm9yIGZldGNoaW5nIHRoZSBpbnRlbnRzXG4gKiBAcGFyYW0gb0JpbmRpbmdDb250ZXh0IFRoaXMgc2VwY2lmaWVzIHRoZSBiaW5kaW5nIGNvbnRleHQgZm9yIHVwZGF0aW5nIHJlbGF0ZWQgYXBwc1xuICogQHBhcmFtIGFwcENvbXBvbmVudFNPSXRlbXMgVGhpcyBpcyBhIGxpc3Qgb2Ygc2VtYW50aWMgaXRlbXMgdXNlZCBmb3IgdXBkYXRpbmcgdGhlIHJlbGF0ZWQgYXBwcyBidXR0b25cbiAqIEBwYXJhbSBhTGlua3MgVGhpcyBpcyBhbiBhcnJheSBjb21wcmlzaW5nIG9mIHJlbGF0ZWQgaW50ZW50c1xuICovXG5cbmZ1bmN0aW9uIF9nZXRSZWxhdGVkSW50ZW50c1dpdGhTZW1hbnRpY09iamVjdHNBbmRBY3Rpb24oXG5cdHNlbWFudGljT2JqZWN0QW5kQWN0aW9uOiBNeUluYm94SW50ZW50LFxuXHRvQmluZGluZ0NvbnRleHQ6IENvbnRleHQsXG5cdGFwcENvbXBvbmVudFNPSXRlbXM6IFNlbWFudGljSXRlbVtdLFxuXHRhTGlua3M6IExpbmtEZWZpbml0aW9uW11cbikge1xuXHRpZiAoYUxpbmtzLmxlbmd0aCA+IDApIHtcblx0XHRjb25zdCBhY3Rpb25zID0gW3NlbWFudGljT2JqZWN0QW5kQWN0aW9uLmFjdGlvbl07XG5cdFx0Y29uc3QgZXhjbHVkZWRBY3Rpb25zOiBbXSA9IFtdO1xuXHRcdGNvbnN0IHNvTWFwcGluZ3M6IFtdID0gW107XG5cdFx0Y29uc3QgdGFyZ2V0UGFyYW1zID0geyBuYXZpZ2F0aW9uQ29udGV4dHM6IG9CaW5kaW5nQ29udGV4dCwgc2VtYW50aWNPYmplY3RNYXBwaW5nOiBzb01hcHBpbmdzIH07XG5cdFx0X2dldFJlbGF0ZWRBcHBzTWVudUl0ZW1zKGFMaW5rcywgZXhjbHVkZWRBY3Rpb25zLCB0YXJnZXRQYXJhbXMsIGFwcENvbXBvbmVudFNPSXRlbXMsIGFjdGlvbnMpO1xuXHR9XG59XG5cbnR5cGUgU2VtYW50aWNPYmplY3RDb25maWcgPSB7XG5cdGFkZGl0aW9uYWxTZW1hbnRpY09iamVjdHM6IFJlY29yZDxzdHJpbmcsIFNlbWFudGljT2JqZWN0Pjtcbn07XG50eXBlIFJlbGF0ZWRBcHBzQ29uZmlnID0ge1xuXHR0ZXh0OiBzdHJpbmc7XG5cdHRhcmdldFNlbU9iamVjdDogc3RyaW5nO1xuXHR0YXJnZXRBY3Rpb246IHN0cmluZztcbn07XG5hc3luYyBmdW5jdGlvbiB1cGRhdGVSZWxhdGVBcHBzTW9kZWwoXG5cdG9CaW5kaW5nQ29udGV4dDogQ29udGV4dCxcblx0b0VudHJ5OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZCxcblx0b09iamVjdFBhZ2VMYXlvdXQ6IE9iamVjdFBhZ2VMYXlvdXQsXG5cdGFTZW1LZXlzOiB7ICRQcm9wZXJ0eVBhdGg6IHN0cmluZyB9W10sXG5cdG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLFxuXHRvTWV0YVBhdGg6IHN0cmluZyxcblx0YXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnRcbik6IFByb21pc2U8UmVsYXRlZEFwcHNDb25maWdbXT4ge1xuXHRjb25zdCBvU2hlbGxTZXJ2aWNlSGVscGVyOiBJU2hlbGxTZXJ2aWNlcyA9IGFwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCk7XG5cdGNvbnN0IG9QYXJhbTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcblx0bGV0IHNDdXJyZW50U2VtT2JqID0gXCJcIixcblx0XHRzQ3VycmVudEFjdGlvbiA9IFwiXCI7XG5cdGxldCBvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucztcblx0bGV0IGFSZWxhdGVkQXBwc01lbnVJdGVtczogUmVsYXRlZEFwcHNDb25maWdbXSA9IFtdO1xuXHRsZXQgYUV4Y2x1ZGVkQWN0aW9uczogdW5rbm93bltdID0gW107XG5cdGxldCBhTWFuaWZlc3RTT0tleXM6IHN0cmluZ1tdO1xuXG5cdGFzeW5jIGZ1bmN0aW9uIGZuR2V0UGFyc2VTaGVsbEhhc2hBbmRHZXRMaW5rcygpIHtcblx0XHRjb25zdCBvUGFyc2VkVXJsID0gb1NoZWxsU2VydmljZUhlbHBlci5wYXJzZVNoZWxsSGFzaChkb2N1bWVudC5sb2NhdGlvbi5oYXNoKTtcblx0XHRzQ3VycmVudFNlbU9iaiA9IG9QYXJzZWRVcmwuc2VtYW50aWNPYmplY3Q7IC8vIEN1cnJlbnQgU2VtYW50aWMgT2JqZWN0XG5cdFx0c0N1cnJlbnRBY3Rpb24gPSBvUGFyc2VkVXJsLmFjdGlvbjtcblx0XHRyZXR1cm4gX2dldFNPSW50ZW50cyhvU2hlbGxTZXJ2aWNlSGVscGVyLCBvT2JqZWN0UGFnZUxheW91dCwgc0N1cnJlbnRTZW1PYmosIG9QYXJhbSk7XG5cdH1cblxuXHR0cnkge1xuXHRcdGlmIChvRW50cnkpIHtcblx0XHRcdGlmIChhU2VtS2V5cyAmJiBhU2VtS2V5cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgYVNlbUtleXMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHRjb25zdCBzU2VtS2V5ID0gYVNlbUtleXNbal0uJFByb3BlcnR5UGF0aDtcblx0XHRcdFx0XHRpZiAoIW9QYXJhbVtzU2VtS2V5XSkge1xuXHRcdFx0XHRcdFx0b1BhcmFtW3NTZW1LZXldID0geyB2YWx1ZTogb0VudHJ5W3NTZW1LZXldIH07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBmYWxsYmFjayB0byBUZWNobmljYWwgS2V5cyBpZiBubyBTZW1hbnRpYyBLZXkgaXMgcHJlc2VudFxuXHRcdFx0XHRjb25zdCBhVGVjaG5pY2FsS2V5cyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke29NZXRhUGF0aH0vJFR5cGUvJEtleWApO1xuXHRcdFx0XHRmb3IgKGNvbnN0IGtleSBpbiBhVGVjaG5pY2FsS2V5cykge1xuXHRcdFx0XHRcdGNvbnN0IHNPYmpLZXkgPSBhVGVjaG5pY2FsS2V5c1trZXldO1xuXHRcdFx0XHRcdGlmICghb1BhcmFtW3NPYmpLZXldKSB7XG5cdFx0XHRcdFx0XHRvUGFyYW1bc09iaktleV0gPSB7IHZhbHVlOiBvRW50cnlbc09iaktleV0gfTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gTG9naWMgdG8gcmVhZCBhZGRpdGlvbmFsIFNPIGZyb20gbWFuaWZlc3QgYW5kIHVwZGF0ZWQgcmVsYXRlZGFwcHMgbW9kZWxcblxuXHRcdGNvbnN0IG9NYW5pZmVzdERhdGEgPSBnZXRUYXJnZXRWaWV3KG9PYmplY3RQYWdlTGF5b3V0KS5nZXRWaWV3RGF0YSgpIGFzIFNlbWFudGljT2JqZWN0Q29uZmlnO1xuXHRcdGNvbnN0IGFNYW5pZmVzdFNPSXRlbXM6IFNlbWFudGljSXRlbVtdID0gW107XG5cdFx0bGV0IHNlbWFudGljT2JqZWN0SW50ZW50cztcblx0XHRpZiAob01hbmlmZXN0RGF0YS5hZGRpdGlvbmFsU2VtYW50aWNPYmplY3RzKSB7XG5cdFx0XHRhTWFuaWZlc3RTT0tleXMgPSBPYmplY3Qua2V5cyhvTWFuaWZlc3REYXRhLmFkZGl0aW9uYWxTZW1hbnRpY09iamVjdHMpO1xuXHRcdFx0Zm9yIChsZXQga2V5ID0gMDsga2V5IDwgYU1hbmlmZXN0U09LZXlzLmxlbmd0aDsga2V5KyspIHtcblx0XHRcdFx0c2VtYW50aWNPYmplY3RJbnRlbnRzID0gYXdhaXQgUHJvbWlzZS5yZXNvbHZlKFxuXHRcdFx0XHRcdF9nZXRTT0ludGVudHMob1NoZWxsU2VydmljZUhlbHBlciwgb09iamVjdFBhZ2VMYXlvdXQsIGFNYW5pZmVzdFNPS2V5c1trZXldLCBvUGFyYW0pXG5cdFx0XHRcdCk7XG5cdFx0XHRcdF9nZXRSZWxhdGVkSW50ZW50cyhcblx0XHRcdFx0XHRvTWFuaWZlc3REYXRhLmFkZGl0aW9uYWxTZW1hbnRpY09iamVjdHNbYU1hbmlmZXN0U09LZXlzW2tleV1dLFxuXHRcdFx0XHRcdG9CaW5kaW5nQ29udGV4dCxcblx0XHRcdFx0XHRhTWFuaWZlc3RTT0l0ZW1zLFxuXHRcdFx0XHRcdHNlbWFudGljT2JqZWN0SW50ZW50c1xuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIGFwcENvbXBvbmVudFNPSXRlbXMgaXMgdXBkYXRlZCBpbiBjYXNlIG9mIE15IEluYm94IGludGVncmF0aW9uIHdoZW4gc2VtYW50aWMgb2JqZWN0IGFuZCBhY3Rpb24gYXJlIHBhc3NlZCBmcm9tIGZlRW52aXJvbm1lbnQuZ2V0SW50ZW50KCkgbWV0aG9kXG5cdFx0Ly8gSW4gb3RoZXIgY2FzZXMgaXQgcmVtYWlucyBhcyBhbiBlbXB0eSBsaXN0XG5cdFx0Ly8gV2UgY29uY2F0IHRoaXMgbGlzdCB0b3dhcmRzIHRoZSBlbmQgd2l0aCBhTWFuaWZlc3RTT0l0ZW1zXG5cblx0XHRjb25zdCBhcHBDb21wb25lbnRTT0l0ZW1zOiBTZW1hbnRpY0l0ZW1bXSA9IFtdO1xuXHRcdGNvbnN0IGNvbXBvbmVudERhdGE6IENvbXBvbmVudERhdGEgPSBhcHBDb21wb25lbnQuZ2V0Q29tcG9uZW50RGF0YSgpO1xuXHRcdGlmIChjb21wb25lbnREYXRhLmZlRW52aXJvbm1lbnQgJiYgY29tcG9uZW50RGF0YS5mZUVudmlyb25tZW50LmdldEludGVudCgpKSB7XG5cdFx0XHRjb25zdCBpbnRlbnQ6IE15SW5ib3hJbnRlbnQgPSBjb21wb25lbnREYXRhLmZlRW52aXJvbm1lbnQuZ2V0SW50ZW50KCk7XG5cdFx0XHRzZW1hbnRpY09iamVjdEludGVudHMgPSBhd2FpdCBQcm9taXNlLnJlc29sdmUoXG5cdFx0XHRcdF9nZXRTT0ludGVudHMob1NoZWxsU2VydmljZUhlbHBlciwgb09iamVjdFBhZ2VMYXlvdXQsIGludGVudC5zZW1hbnRpY09iamVjdCwgb1BhcmFtKVxuXHRcdFx0KTtcblx0XHRcdF9nZXRSZWxhdGVkSW50ZW50c1dpdGhTZW1hbnRpY09iamVjdHNBbmRBY3Rpb24oaW50ZW50LCBvQmluZGluZ0NvbnRleHQsIGFwcENvbXBvbmVudFNPSXRlbXMsIHNlbWFudGljT2JqZWN0SW50ZW50cyk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgaW50ZXJuYWxNb2RlbENvbnRleHQgPSBvT2JqZWN0UGFnZUxheW91dC5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdGNvbnN0IGFMaW5rcyA9IGF3YWl0IGZuR2V0UGFyc2VTaGVsbEhhc2hBbmRHZXRMaW5rcygpO1xuXHRcdGlmIChhTGlua3MpIHtcblx0XHRcdGlmIChhTGlua3MubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRsZXQgaXNTZW1hbnRpY09iamVjdEhhc1NhbWVUYXJnZXRJbk1hbmlmZXN0ID0gZmFsc2U7XG5cdFx0XHRcdGNvbnN0IG9UYXJnZXRQYXJhbXM6IHtcblx0XHRcdFx0XHRuYXZpZ2F0aW9uQ29udGV4dHM/OiBDb250ZXh0O1xuXHRcdFx0XHRcdHNlbWFudGljT2JqZWN0TWFwcGluZz86IE1ldGFNb2RlbFR5cGU8U2VtYW50aWNPYmplY3RNYXBwaW5nVHlwZT5bXTtcblx0XHRcdFx0fSA9IHt9O1xuXHRcdFx0XHRjb25zdCBhQW5ub3RhdGlvbnNTT0l0ZW1zOiBTZW1hbnRpY0l0ZW1bXSA9IFtdO1xuXHRcdFx0XHRjb25zdCBzRW50aXR5U2V0UGF0aCA9IGAke29NZXRhUGF0aH1AYDtcblx0XHRcdFx0Y29uc3Qgc0VudGl0eVR5cGVQYXRoID0gYCR7b01ldGFQYXRofS9AYDtcblx0XHRcdFx0Y29uc3Qgb0VudGl0eVNldEFubm90YXRpb25zID0gb01ldGFNb2RlbC5nZXRPYmplY3Qoc0VudGl0eVNldFBhdGgpO1xuXHRcdFx0XHRvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucyA9IENvbW1vblV0aWxzLmdldFNlbWFudGljT2JqZWN0QW5ub3RhdGlvbnMob0VudGl0eVNldEFubm90YXRpb25zLCBzQ3VycmVudFNlbU9iaik7XG5cdFx0XHRcdGlmICghb1NlbWFudGljT2JqZWN0QW5ub3RhdGlvbnMuYkhhc0VudGl0eVNldFNPKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb0VudGl0eVR5cGVBbm5vdGF0aW9ucyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KHNFbnRpdHlUeXBlUGF0aCk7XG5cdFx0XHRcdFx0b1NlbWFudGljT2JqZWN0QW5ub3RhdGlvbnMgPSBDb21tb25VdGlscy5nZXRTZW1hbnRpY09iamVjdEFubm90YXRpb25zKG9FbnRpdHlUeXBlQW5ub3RhdGlvbnMsIHNDdXJyZW50U2VtT2JqKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRhRXhjbHVkZWRBY3Rpb25zID0gb1NlbWFudGljT2JqZWN0QW5ub3RhdGlvbnMuYVVuYXZhaWxhYmxlQWN0aW9ucztcblx0XHRcdFx0Ly9Ta2lwIHNhbWUgYXBwbGljYXRpb24gZnJvbSBSZWxhdGVkIEFwcHNcblx0XHRcdFx0YUV4Y2x1ZGVkQWN0aW9ucy5wdXNoKHNDdXJyZW50QWN0aW9uKTtcblx0XHRcdFx0b1RhcmdldFBhcmFtcy5uYXZpZ2F0aW9uQ29udGV4dHMgPSBvQmluZGluZ0NvbnRleHQ7XG5cdFx0XHRcdG9UYXJnZXRQYXJhbXMuc2VtYW50aWNPYmplY3RNYXBwaW5nID0gb1NlbWFudGljT2JqZWN0QW5ub3RhdGlvbnMuYU1hcHBpbmdzO1xuXHRcdFx0XHRfZ2V0UmVsYXRlZEFwcHNNZW51SXRlbXMoYUxpbmtzLCBhRXhjbHVkZWRBY3Rpb25zLCBvVGFyZ2V0UGFyYW1zLCBhQW5ub3RhdGlvbnNTT0l0ZW1zKTtcblxuXHRcdFx0XHRhTWFuaWZlc3RTT0l0ZW1zLmZvckVhY2goZnVuY3Rpb24gKHsgdGFyZ2V0U2VtT2JqZWN0IH0pIHtcblx0XHRcdFx0XHRpZiAoYUFubm90YXRpb25zU09JdGVtc1swXT8udGFyZ2V0U2VtT2JqZWN0ID09PSB0YXJnZXRTZW1PYmplY3QpIHtcblx0XHRcdFx0XHRcdGlzU2VtYW50aWNPYmplY3RIYXNTYW1lVGFyZ2V0SW5NYW5pZmVzdCA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQvLyByZW1vdmUgYWxsIGFjdGlvbnMgZnJvbSBjdXJyZW50IGhhc2ggYXBwbGljYXRpb24gaWYgbWFuaWZlc3QgY29udGFpbnMgZW1wdHkgYWxsb3dlZEFjdGlvbnNcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdG9NYW5pZmVzdERhdGEuYWRkaXRpb25hbFNlbWFudGljT2JqZWN0cyAmJlxuXHRcdFx0XHRcdGFBbm5vdGF0aW9uc1NPSXRlbXNbMF0gJiZcblx0XHRcdFx0XHRvTWFuaWZlc3REYXRhLmFkZGl0aW9uYWxTZW1hbnRpY09iamVjdHNbYUFubm90YXRpb25zU09JdGVtc1swXS50YXJnZXRTZW1PYmplY3RdICYmXG5cdFx0XHRcdFx0ISFvTWFuaWZlc3REYXRhLmFkZGl0aW9uYWxTZW1hbnRpY09iamVjdHNbYUFubm90YXRpb25zU09JdGVtc1swXS50YXJnZXRTZW1PYmplY3RdLmFsbG93ZWRBY3Rpb25zXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdGlzU2VtYW50aWNPYmplY3RIYXNTYW1lVGFyZ2V0SW5NYW5pZmVzdCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3Qgc29JdGVtcyA9IGFNYW5pZmVzdFNPSXRlbXMuY29uY2F0KGFwcENvbXBvbmVudFNPSXRlbXMpO1xuXHRcdFx0XHRhUmVsYXRlZEFwcHNNZW51SXRlbXMgPSBpc1NlbWFudGljT2JqZWN0SGFzU2FtZVRhcmdldEluTWFuaWZlc3QgPyBzb0l0ZW1zIDogc29JdGVtcy5jb25jYXQoYUFubm90YXRpb25zU09JdGVtcyk7XG5cdFx0XHRcdC8vIElmIG5vIGFwcCBpbiBsaXN0LCByZWxhdGVkIGFwcHMgYnV0dG9uIHdpbGwgYmUgaGlkZGVuXG5cdFx0XHRcdGludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwicmVsYXRlZEFwcHMvdmlzaWJpbGl0eVwiLCBhUmVsYXRlZEFwcHNNZW51SXRlbXMubGVuZ3RoID4gMCk7XG5cdFx0XHRcdGludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwicmVsYXRlZEFwcHMvaXRlbXNcIiwgYVJlbGF0ZWRBcHBzTWVudUl0ZW1zKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwicmVsYXRlZEFwcHMvdmlzaWJpbGl0eVwiLCBmYWxzZSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwicmVsYXRlZEFwcHMvdmlzaWJpbGl0eVwiLCBmYWxzZSk7XG5cdFx0fVxuXHR9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuXHRcdExvZy5lcnJvcihcIkNhbm5vdCByZWFkIGxpbmtzXCIsIGVycm9yIGFzIHN0cmluZyk7XG5cdH1cblx0cmV0dXJuIGFSZWxhdGVkQXBwc01lbnVJdGVtcztcbn1cblxuZnVuY3Rpb24gX2dldFNlbWFudGljT2JqZWN0QW5ub3RhdGlvbnMob0VudGl0eUFubm90YXRpb25zOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgc0N1cnJlbnRTZW1PYmo6IHN0cmluZykge1xuXHRjb25zdCBvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucyA9IHtcblx0XHRiSGFzRW50aXR5U2V0U086IGZhbHNlLFxuXHRcdGFBbGxvd2VkQWN0aW9uczogW10sXG5cdFx0YVVuYXZhaWxhYmxlQWN0aW9uczogW10gYXMgTWV0YU1vZGVsVHlwZTxTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucz5bXSxcblx0XHRhTWFwcGluZ3M6IFtdIGFzIE1ldGFNb2RlbFR5cGU8U2VtYW50aWNPYmplY3RNYXBwaW5nVHlwZT5bXVxuXHR9O1xuXHRsZXQgc0Fubm90YXRpb25NYXBwaW5nVGVybSwgc0Fubm90YXRpb25BY3Rpb25UZXJtO1xuXHRsZXQgc1F1YWxpZmllcjtcblx0Zm9yIChjb25zdCBrZXkgaW4gb0VudGl0eUFubm90YXRpb25zKSB7XG5cdFx0aWYgKGtleS5pbmRleE9mKENvbW1vbkFubm90YXRpb25UZXJtcy5TZW1hbnRpY09iamVjdCkgPiAtMSAmJiBvRW50aXR5QW5ub3RhdGlvbnNba2V5XSA9PT0gc0N1cnJlbnRTZW1PYmopIHtcblx0XHRcdG9TZW1hbnRpY09iamVjdEFubm90YXRpb25zLmJIYXNFbnRpdHlTZXRTTyA9IHRydWU7XG5cdFx0XHRzQW5ub3RhdGlvbk1hcHBpbmdUZXJtID0gYEAke0NvbW1vbkFubm90YXRpb25UZXJtcy5TZW1hbnRpY09iamVjdE1hcHBpbmd9YDtcblx0XHRcdHNBbm5vdGF0aW9uQWN0aW9uVGVybSA9IGBAJHtDb21tb25Bbm5vdGF0aW9uVGVybXMuU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnN9YDtcblxuXHRcdFx0aWYgKGtleS5pbmRleE9mKFwiI1wiKSA+IC0xKSB7XG5cdFx0XHRcdHNRdWFsaWZpZXIgPSBrZXkuc3BsaXQoXCIjXCIpWzFdO1xuXHRcdFx0XHRzQW5ub3RhdGlvbk1hcHBpbmdUZXJtID0gYCR7c0Fubm90YXRpb25NYXBwaW5nVGVybX0jJHtzUXVhbGlmaWVyfWA7XG5cdFx0XHRcdHNBbm5vdGF0aW9uQWN0aW9uVGVybSA9IGAke3NBbm5vdGF0aW9uQWN0aW9uVGVybX0jJHtzUXVhbGlmaWVyfWA7XG5cdFx0XHR9XG5cdFx0XHRpZiAob0VudGl0eUFubm90YXRpb25zW3NBbm5vdGF0aW9uTWFwcGluZ1Rlcm1dKSB7XG5cdFx0XHRcdG9TZW1hbnRpY09iamVjdEFubm90YXRpb25zLmFNYXBwaW5ncyA9IG9TZW1hbnRpY09iamVjdEFubm90YXRpb25zLmFNYXBwaW5ncy5jb25jYXQoXG5cdFx0XHRcdFx0b0VudGl0eUFubm90YXRpb25zW3NBbm5vdGF0aW9uTWFwcGluZ1Rlcm1dIGFzIE1ldGFNb2RlbFR5cGU8U2VtYW50aWNPYmplY3RNYXBwaW5nVHlwZT5cblx0XHRcdFx0KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG9FbnRpdHlBbm5vdGF0aW9uc1tzQW5ub3RhdGlvbkFjdGlvblRlcm1dKSB7XG5cdFx0XHRcdG9TZW1hbnRpY09iamVjdEFubm90YXRpb25zLmFVbmF2YWlsYWJsZUFjdGlvbnMgPSBvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucy5hVW5hdmFpbGFibGVBY3Rpb25zLmNvbmNhdChcblx0XHRcdFx0XHRvRW50aXR5QW5ub3RhdGlvbnNbc0Fubm90YXRpb25BY3Rpb25UZXJtXSBhcyBNZXRhTW9kZWxUeXBlPFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zPlxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblx0cmV0dXJuIG9TZW1hbnRpY09iamVjdEFubm90YXRpb25zO1xufVxuXG5mdW5jdGlvbiBmblVwZGF0ZVJlbGF0ZWRBcHBzRGV0YWlscyhvT2JqZWN0UGFnZUxheW91dDogT2JqZWN0UGFnZUxheW91dCwgYXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQpIHtcblx0Y29uc3Qgb01ldGFNb2RlbCA9IG9PYmplY3RQYWdlTGF5b3V0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWw7XG5cdGNvbnN0IG9CaW5kaW5nQ29udGV4dCA9IG9PYmplY3RQYWdlTGF5b3V0LmdldEJpbmRpbmdDb250ZXh0KCkgYXMgT0RhdGFWNENvbnRleHQ7XG5cdGNvbnN0IHBhdGggPSAob0JpbmRpbmdDb250ZXh0ICYmIG9CaW5kaW5nQ29udGV4dC5nZXRQYXRoKCkpIHx8IFwiXCI7XG5cdGNvbnN0IG9NZXRhUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgocGF0aCk7XG5cdC8vIFNlbWFudGljIEtleSBWb2NhYnVsYXJ5XG5cdGNvbnN0IHNTZW1hbnRpY0tleVZvY2FidWxhcnkgPSBgJHtvTWV0YVBhdGh9L2AgKyBgQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY0tleWA7XG5cdC8vU2VtYW50aWMgS2V5c1xuXHRjb25zdCBhU2VtS2V5cyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KHNTZW1hbnRpY0tleVZvY2FidWxhcnkpO1xuXHQvLyBVbmF2YWlsYWJsZSBBY3Rpb25zXG5cdGNvbnN0IG9FbnRyeSA9IG9CaW5kaW5nQ29udGV4dD8uZ2V0T2JqZWN0KCk7XG5cdGlmICghb0VudHJ5ICYmIG9CaW5kaW5nQ29udGV4dCkge1xuXHRcdG9CaW5kaW5nQ29udGV4dFxuXHRcdFx0LnJlcXVlc3RPYmplY3QoKVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKHJlcXVlc3RlZE9iamVjdDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQpIHtcblx0XHRcdFx0cmV0dXJuIENvbW1vblV0aWxzLnVwZGF0ZVJlbGF0ZUFwcHNNb2RlbChcblx0XHRcdFx0XHRvQmluZGluZ0NvbnRleHQsXG5cdFx0XHRcdFx0cmVxdWVzdGVkT2JqZWN0LFxuXHRcdFx0XHRcdG9PYmplY3RQYWdlTGF5b3V0LFxuXHRcdFx0XHRcdGFTZW1LZXlzLFxuXHRcdFx0XHRcdG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0b01ldGFQYXRoLFxuXHRcdFx0XHRcdGFwcENvbXBvbmVudFxuXHRcdFx0XHQpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiB1bmtub3duKSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkNhbm5vdCB1cGRhdGUgdGhlIHJlbGF0ZWQgYXBwIGRldGFpbHNcIiwgb0Vycm9yIGFzIHN0cmluZyk7XG5cdFx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gQ29tbW9uVXRpbHMudXBkYXRlUmVsYXRlQXBwc01vZGVsKG9CaW5kaW5nQ29udGV4dCwgb0VudHJ5LCBvT2JqZWN0UGFnZUxheW91dCwgYVNlbUtleXMsIG9NZXRhTW9kZWwsIG9NZXRhUGF0aCwgYXBwQ29tcG9uZW50KTtcblx0fVxufVxuXG4vKipcbiAqIEBwYXJhbSBvQnV0dG9uXG4gKi9cbmZ1bmN0aW9uIGZuRmlyZUJ1dHRvblByZXNzKG9CdXR0b246IENvbnRyb2wpIHtcblx0aWYgKFxuXHRcdG9CdXR0b24gJiZcblx0XHRvQnV0dG9uLmlzQTxCdXR0b24gfCBPdmVyZmxvd1Rvb2xiYXJCdXR0b24+KFtcInNhcC5tLkJ1dHRvblwiLCBcInNhcC5tLk92ZXJmbG93VG9vbGJhckJ1dHRvblwiXSkgJiZcblx0XHRvQnV0dG9uLmdldFZpc2libGUoKSAmJlxuXHRcdG9CdXR0b24uZ2V0RW5hYmxlZCgpXG5cdCkge1xuXHRcdG9CdXR0b24uZmlyZVByZXNzKCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0QXBwQ29tcG9uZW50KG9Db250cm9sOiBDb250cm9sIHwgQ29tcG9uZW50KTogQXBwQ29tcG9uZW50IHtcblx0aWYgKG9Db250cm9sLmlzQTxBcHBDb21wb25lbnQ+KFwic2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50XCIpKSB7XG5cdFx0cmV0dXJuIG9Db250cm9sO1xuXHR9XG5cdGNvbnN0IG9Pd25lciA9IENvbXBvbmVudC5nZXRPd25lckNvbXBvbmVudEZvcihvQ29udHJvbCk7XG5cdGlmICghb093bmVyKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiVGhlcmUgc2hvdWxkIGJlIGEgc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50IGFzIG93bmVyIG9mIHRoZSBjb250cm9sXCIpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBnZXRBcHBDb21wb25lbnQob093bmVyKTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRDdXJyZW50UGFnZVZpZXcob0FwcENvbXBvbmVudDogQXBwQ29tcG9uZW50KSB7XG5cdGNvbnN0IHJvb3RWaWV3Q29udHJvbGxlciA9IG9BcHBDb21wb25lbnQuZ2V0Um9vdFZpZXdDb250cm9sbGVyKCk7XG5cdHJldHVybiByb290Vmlld0NvbnRyb2xsZXIuaXNGY2xFbmFibGVkKClcblx0XHQ/IHJvb3RWaWV3Q29udHJvbGxlci5nZXRSaWdodG1vc3RWaWV3KClcblx0XHQ6IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcoKG9BcHBDb21wb25lbnQuZ2V0Um9vdENvbnRhaW5lcigpIGFzIE5hdkNvbnRhaW5lcikuZ2V0Q3VycmVudFBhZ2UoKSk7XG59XG5cbmZ1bmN0aW9uIGdldFRhcmdldFZpZXcob0NvbnRyb2w6IE1hbmFnZWRPYmplY3QgfCBudWxsKTogVmlldyB7XG5cdGlmIChvQ29udHJvbCAmJiBvQ29udHJvbC5pc0E8Q29tcG9uZW50Q29udGFpbmVyPihcInNhcC51aS5jb3JlLkNvbXBvbmVudENvbnRhaW5lclwiKSkge1xuXHRcdGNvbnN0IG9Db21wb25lbnQgPSBvQ29udHJvbC5nZXRDb21wb25lbnRJbnN0YW5jZSgpO1xuXHRcdG9Db250cm9sID0gb0NvbXBvbmVudCAmJiBvQ29tcG9uZW50LmdldFJvb3RDb250cm9sKCk7XG5cdH1cblx0d2hpbGUgKG9Db250cm9sICYmICFvQ29udHJvbC5pc0E8Vmlldz4oXCJzYXAudWkuY29yZS5tdmMuVmlld1wiKSkge1xuXHRcdG9Db250cm9sID0gb0NvbnRyb2wuZ2V0UGFyZW50KCk7XG5cdH1cblx0cmV0dXJuIG9Db250cm9sITtcbn1cblxuZnVuY3Rpb24gX2ZuQ2hlY2tJc01hdGNoKG9PYmplY3Q6IG9iamVjdCwgb0tleXNUb0NoZWNrOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikge1xuXHRmb3IgKGNvbnN0IHNLZXkgaW4gb0tleXNUb0NoZWNrKSB7XG5cdFx0aWYgKG9LZXlzVG9DaGVja1tzS2V5XSAhPT0gb09iamVjdFtzS2V5IGFzIGtleW9mIHR5cGVvZiBvT2JqZWN0XSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gZm5HZXRDb250ZXh0UGF0aFByb3BlcnRpZXMoXG5cdG1ldGFNb2RlbENvbnRleHQ6IE9EYXRhTWV0YU1vZGVsLFxuXHRzQ29udGV4dFBhdGg6IHN0cmluZyxcblx0b0ZpbHRlcj86IFJlY29yZDxzdHJpbmcsIHVua25vd24+XG4pOiBSZWNvcmQ8c3RyaW5nLCBNZXRhTW9kZWxQcm9wZXJ0eT4gfCBSZWNvcmQ8c3RyaW5nLCBNZXRhTW9kZWxOYXZQcm9wZXJ0eT4ge1xuXHRjb25zdCBvRW50aXR5VHlwZTogTWV0YU1vZGVsRW50aXR5VHlwZSA9IChtZXRhTW9kZWxDb250ZXh0LmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9L2ApIHx8IHt9KSBhcyBNZXRhTW9kZWxFbnRpdHlUeXBlLFxuXHRcdG9Qcm9wZXJ0aWVzOiBSZWNvcmQ8c3RyaW5nLCBNZXRhTW9kZWxQcm9wZXJ0eT4gfCBSZWNvcmQ8c3RyaW5nLCBNZXRhTW9kZWxOYXZQcm9wZXJ0eT4gPSB7fTtcblxuXHRmb3IgKGNvbnN0IHNLZXkgaW4gb0VudGl0eVR5cGUpIHtcblx0XHRpZiAoXG5cdFx0XHRvRW50aXR5VHlwZS5oYXNPd25Qcm9wZXJ0eShzS2V5KSAmJlxuXHRcdFx0IS9eXFwkL2kudGVzdChzS2V5KSAmJlxuXHRcdFx0b0VudGl0eVR5cGVbc0tleV0uJGtpbmQgJiZcblx0XHRcdF9mbkNoZWNrSXNNYXRjaChvRW50aXR5VHlwZVtzS2V5XSwgb0ZpbHRlciB8fCB7ICRraW5kOiBcIlByb3BlcnR5XCIgfSlcblx0XHQpIHtcblx0XHRcdG9Qcm9wZXJ0aWVzW3NLZXldID0gb0VudGl0eVR5cGVbc0tleV07XG5cdFx0fVxuXHR9XG5cdHJldHVybiBvUHJvcGVydGllcztcbn1cblxuZnVuY3Rpb24gZm5HZXRNYW5kYXRvcnlGaWx0ZXJGaWVsZHMob01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwsIHNDb250ZXh0UGF0aDogc3RyaW5nKSB7XG5cdGxldCBhTWFuZGF0b3J5RmlsdGVyRmllbGRzOiBFeHBhbmRQYXRoVHlwZTxFZG0uUHJvcGVydHlQYXRoPltdID0gW107XG5cdGlmIChvTWV0YU1vZGVsICYmIHNDb250ZXh0UGF0aCkge1xuXHRcdGFNYW5kYXRvcnlGaWx0ZXJGaWVsZHMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChcblx0XHRcdGAke3NDb250ZXh0UGF0aH1AT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5GaWx0ZXJSZXN0cmljdGlvbnMvUmVxdWlyZWRQcm9wZXJ0aWVzYFxuXHRcdCkgYXMgRXhwYW5kUGF0aFR5cGU8RWRtLlByb3BlcnR5UGF0aD5bXTtcblx0fVxuXHRyZXR1cm4gYU1hbmRhdG9yeUZpbHRlckZpZWxkcztcbn1cblxuZnVuY3Rpb24gZm5HZXRJQk5BY3Rpb25zKG9Db250cm9sOiBUYWJsZSB8IE9iamVjdFBhZ2VEeW5hbWljSGVhZGVyVGl0bGUsIGFJQk5BY3Rpb25zOiB1bmtub3duW10pIHtcblx0Y29uc3QgYUFjdGlvbnMgPSBvQ29udHJvbCAmJiBvQ29udHJvbC5nZXRBY3Rpb25zKCk7XG5cdGlmIChhQWN0aW9ucykge1xuXHRcdGFBY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKG9BY3Rpb24pIHtcblx0XHRcdGlmIChvQWN0aW9uLmlzQTxBY3Rpb25Ub29sYmFyQWN0aW9uPihcInNhcC51aS5tZGMuYWN0aW9udG9vbGJhci5BY3Rpb25Ub29sYmFyQWN0aW9uXCIpKSB7XG5cdFx0XHRcdG9BY3Rpb24gPSBvQWN0aW9uLmdldEFjdGlvbigpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG9BY3Rpb24uaXNBPE1lbnVCdXR0b24+KFwic2FwLm0uTWVudUJ1dHRvblwiKSkge1xuXHRcdFx0XHRjb25zdCBvTWVudSA9IG9BY3Rpb24uZ2V0TWVudSgpO1xuXHRcdFx0XHRjb25zdCBhSXRlbXMgPSBvTWVudS5nZXRJdGVtcygpO1xuXHRcdFx0XHRhSXRlbXMuZm9yRWFjaCgob0l0ZW0pID0+IHtcblx0XHRcdFx0XHRpZiAob0l0ZW0uZGF0YShcIklCTkRhdGFcIikpIHtcblx0XHRcdFx0XHRcdGFJQk5BY3Rpb25zLnB1c2gob0l0ZW0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2UgaWYgKG9BY3Rpb24uZGF0YShcIklCTkRhdGFcIikpIHtcblx0XHRcdFx0YUlCTkFjdGlvbnMucHVzaChvQWN0aW9uKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gYUlCTkFjdGlvbnM7XG59XG5cbi8qKlxuICogQHBhcmFtIGFJQk5BY3Rpb25zXG4gKiBAcGFyYW0gb1ZpZXdcbiAqL1xuZnVuY3Rpb24gZm5VcGRhdGVEYXRhRmllbGRGb3JJQk5CdXR0b25zVmlzaWJpbGl0eShhSUJOQWN0aW9uczogQ29udHJvbFtdLCBvVmlldzogVmlldykge1xuXHRjb25zdCBvUGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCB7IHZhbHVlOiB1bmtub3duIH0+ID0ge307XG5cdGNvbnN0IG9BcHBDb21wb25lbnQgPSBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQob1ZpZXcpO1xuXHRjb25zdCBpc1N0aWNreSA9IE1vZGVsSGVscGVyLmlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCgob1ZpZXcuZ2V0TW9kZWwoKSBhcyBPRGF0YU1vZGVsKS5nZXRNZXRhTW9kZWwoKSk7XG5cdGNvbnN0IGZuR2V0TGlua3MgPSBmdW5jdGlvbiAob0RhdGE/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZCkge1xuXHRcdGlmIChvRGF0YSkge1xuXHRcdFx0Y29uc3QgYUtleXMgPSBPYmplY3Qua2V5cyhvRGF0YSk7XG5cdFx0XHRhS2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChzS2V5OiBzdHJpbmcpIHtcblx0XHRcdFx0aWYgKHNLZXkuaW5kZXhPZihcIl9cIikgIT09IDAgJiYgc0tleS5pbmRleE9mKFwib2RhdGEuY29udGV4dFwiKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRvUGFyYW1zW3NLZXldID0geyB2YWx1ZTogb0RhdGFbc0tleV0gfTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGlmIChhSUJOQWN0aW9ucy5sZW5ndGgpIHtcblx0XHRcdGFJQk5BY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKG9JQk5BY3Rpb24pIHtcblx0XHRcdFx0Y29uc3Qgc1NlbWFudGljT2JqZWN0ID0gb0lCTkFjdGlvbi5kYXRhKFwiSUJORGF0YVwiKS5zZW1hbnRpY09iamVjdDtcblx0XHRcdFx0Y29uc3Qgc0FjdGlvbiA9IG9JQk5BY3Rpb24uZGF0YShcIklCTkRhdGFcIikuYWN0aW9uO1xuXHRcdFx0XHRvQXBwQ29tcG9uZW50XG5cdFx0XHRcdFx0LmdldFNoZWxsU2VydmljZXMoKVxuXHRcdFx0XHRcdC5nZXRMaW5rcyh7XG5cdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdDogc1NlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdFx0YWN0aW9uOiBzQWN0aW9uLFxuXHRcdFx0XHRcdFx0cGFyYW1zOiBvUGFyYW1zXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAoYUxpbmspIHtcblx0XHRcdFx0XHRcdG9JQk5BY3Rpb24uc2V0VmlzaWJsZShvSUJOQWN0aW9uLmdldFZpc2libGUoKSAmJiBhTGluayAmJiBhTGluay5sZW5ndGggPT09IDEpO1xuXHRcdFx0XHRcdFx0aWYgKGlzU3RpY2t5KSB7XG5cdFx0XHRcdFx0XHRcdChvSUJOQWN0aW9uLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQpLnNldFByb3BlcnR5KFxuXHRcdFx0XHRcdFx0XHRcdG9JQk5BY3Rpb24uZ2V0SWQoKS5zcGxpdChcIi0tXCIpWzFdLFxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdHNoZWxsTmF2aWdhdGlvbk5vdEF2YWlsYWJsZTogIShhTGluayAmJiBhTGluay5sZW5ndGggPT09IDEpXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IHVua25vd24pIHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkNhbm5vdCByZXRyaWV2ZSB0aGUgbGlua3MgZnJvbSB0aGUgc2hlbGwgc2VydmljZVwiLCBvRXJyb3IgYXMgc3RyaW5nKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcblx0aWYgKG9WaWV3ICYmIG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KCkpIHtcblx0XHQob1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBPRGF0YVY0Q29udGV4dClcblx0XHRcdD8ucmVxdWVzdE9iamVjdCgpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAob0RhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHJldHVybiBmbkdldExpbmtzKG9EYXRhKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogdW5rbm93bikge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJDYW5ub3QgcmV0cmlldmUgdGhlIGxpbmtzIGZyb20gdGhlIHNoZWxsIHNlcnZpY2VcIiwgb0Vycm9yIGFzIHN0cmluZyk7XG5cdFx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRmbkdldExpbmtzKCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0QWN0aW9uUGF0aChhY3Rpb25Db250ZXh0OiBDb250ZXh0LCBiUmV0dXJuT25seVBhdGg6IGJvb2xlYW4sIGluQWN0aW9uTmFtZT86IHN0cmluZywgYkNoZWNrU3RhdGljVmFsdWU/OiBib29sZWFuKSB7XG5cdGNvbnN0IHNBY3Rpb25OYW1lOiBzdHJpbmcgPSAhaW5BY3Rpb25OYW1lID8gYWN0aW9uQ29udGV4dC5nZXRPYmplY3QoYWN0aW9uQ29udGV4dC5nZXRQYXRoKCkpLnRvU3RyaW5nKCkgOiBpbkFjdGlvbk5hbWU7XG5cdGxldCBzQ29udGV4dFBhdGggPSBhY3Rpb25Db250ZXh0LmdldFBhdGgoKS5zcGxpdChcIi9AXCIpWzBdO1xuXHRjb25zdCBzRW50aXR5VHlwZU5hbWUgPSAoYWN0aW9uQ29udGV4dC5nZXRPYmplY3Qoc0NvbnRleHRQYXRoKSBhcyBNZXRhTW9kZWxFbnRpdHlUeXBlKS4kVHlwZTtcblx0Y29uc3Qgc0VudGl0eU5hbWUgPSBnZXRFbnRpdHlTZXROYW1lKGFjdGlvbkNvbnRleHQuZ2V0TW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCwgc0VudGl0eVR5cGVOYW1lKTtcblx0aWYgKHNFbnRpdHlOYW1lKSB7XG5cdFx0c0NvbnRleHRQYXRoID0gYC8ke3NFbnRpdHlOYW1lfWA7XG5cdH1cblx0aWYgKGJDaGVja1N0YXRpY1ZhbHVlKSB7XG5cdFx0cmV0dXJuIGFjdGlvbkNvbnRleHQuZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aH0vJHtzQWN0aW9uTmFtZX1AT3JnLk9EYXRhLkNvcmUuVjEuT3BlcmF0aW9uQXZhaWxhYmxlYCk7XG5cdH1cblx0aWYgKGJSZXR1cm5Pbmx5UGF0aCkge1xuXHRcdHJldHVybiBgJHtzQ29udGV4dFBhdGh9LyR7c0FjdGlvbk5hbWV9YDtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0c0NvbnRleHRQYXRoOiBzQ29udGV4dFBhdGgsXG5cdFx0XHRzUHJvcGVydHk6IGFjdGlvbkNvbnRleHQuZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aH0vJHtzQWN0aW9uTmFtZX1AT3JnLk9EYXRhLkNvcmUuVjEuT3BlcmF0aW9uQXZhaWxhYmxlLyRQYXRoYCksXG5cdFx0XHRzQmluZGluZ1BhcmFtZXRlcjogYWN0aW9uQ29udGV4dC5nZXRPYmplY3QoYCR7c0NvbnRleHRQYXRofS8ke3NBY3Rpb25OYW1lfS9AJHVpNS5vdmVybG9hZC8wLyRQYXJhbWV0ZXIvMC8kTmFtZWApXG5cdFx0fTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRFbnRpdHlTZXROYW1lKG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLCBzRW50aXR5VHlwZTogc3RyaW5nKSB7XG5cdGNvbnN0IG9FbnRpdHlDb250YWluZXIgPSBvTWV0YU1vZGVsLmdldE9iamVjdChcIi9cIik7XG5cdGZvciAoY29uc3Qga2V5IGluIG9FbnRpdHlDb250YWluZXIpIHtcblx0XHRpZiAodHlwZW9mIG9FbnRpdHlDb250YWluZXJba2V5XSA9PT0gXCJvYmplY3RcIiAmJiBvRW50aXR5Q29udGFpbmVyW2tleV0uJFR5cGUgPT09IHNFbnRpdHlUeXBlKSB7XG5cdFx0XHRyZXR1cm4ga2V5O1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBjb21wdXRlRGlzcGxheU1vZGUob1Byb3BlcnR5QW5ub3RhdGlvbnM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBvQ29sbGVjdGlvbkFubm90YXRpb25zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pIHtcblx0Y29uc3Qgb1RleHRBbm5vdGF0aW9uID0gb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIl0sXG5cdFx0b1RleHRBcnJhbmdlbWVudEFubm90YXRpb24gPSAob1RleHRBbm5vdGF0aW9uICYmXG5cdFx0XHQoKG9Qcm9wZXJ0eUFubm90YXRpb25zICYmXG5cdFx0XHRcdG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0QGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFwiXSkgfHxcblx0XHRcdFx0KG9Db2xsZWN0aW9uQW5ub3RhdGlvbnMgJiZcblx0XHRcdFx0XHRvQ29sbGVjdGlvbkFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFwiXSkpKSBhcyBNZXRhTW9kZWxFbnVtPFRleHRBcnJhbmdlbWVudD47XG5cblx0aWYgKG9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uKSB7XG5cdFx0aWYgKG9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uLiRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFR5cGUvVGV4dE9ubHlcIikge1xuXHRcdFx0cmV0dXJuIFwiRGVzY3JpcHRpb25cIjtcblx0XHR9IGVsc2UgaWYgKG9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uLiRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFR5cGUvVGV4dExhc3RcIikge1xuXHRcdFx0cmV0dXJuIFwiVmFsdWVEZXNjcmlwdGlvblwiO1xuXHRcdH0gZWxzZSBpZiAob1RleHRBcnJhbmdlbWVudEFubm90YXRpb24uJEVudW1NZW1iZXIgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0U2VwYXJhdGVcIikge1xuXHRcdFx0cmV0dXJuIFwiVmFsdWVcIjtcblx0XHR9XG5cdFx0Ly9EZWZhdWx0IHNob3VsZCBiZSBUZXh0Rmlyc3QgaWYgdGhlcmUgaXMgYSBUZXh0IGFubm90YXRpb24gYW5kIG5laXRoZXIgVGV4dE9ubHkgbm9yIFRleHRMYXN0IGFyZSBzZXRcblx0XHRyZXR1cm4gXCJEZXNjcmlwdGlvblZhbHVlXCI7XG5cdH1cblx0cmV0dXJuIG9UZXh0QW5ub3RhdGlvbiA/IFwiRGVzY3JpcHRpb25WYWx1ZVwiIDogXCJWYWx1ZVwiO1xufVxuXG5mdW5jdGlvbiBfZ2V0RW50aXR5VHlwZShvQ29udGV4dDogT0RhdGFWNENvbnRleHQpIHtcblx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdHJldHVybiBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtvTWV0YU1vZGVsLmdldE1ldGFQYXRoKG9Db250ZXh0LmdldFBhdGgoKSl9LyRUeXBlYCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIF9yZXF1ZXN0T2JqZWN0KHNBY3Rpb246IHN0cmluZywgb1NlbGVjdGVkQ29udGV4dDogT0RhdGFWNENvbnRleHQsIHNQcm9wZXJ0eTogc3RyaW5nKSB7XG5cdGxldCBvQ29udGV4dCA9IG9TZWxlY3RlZENvbnRleHQ7XG5cdGNvbnN0IG5CcmFja2V0SW5kZXggPSBzQWN0aW9uLmluZGV4T2YoXCIoXCIpO1xuXG5cdGlmIChuQnJhY2tldEluZGV4ID4gLTEpIHtcblx0XHRjb25zdCBzVGFyZ2V0VHlwZSA9IHNBY3Rpb24uc2xpY2UobkJyYWNrZXRJbmRleCArIDEsIC0xKTtcblx0XHRsZXQgc0N1cnJlbnRUeXBlID0gX2dldEVudGl0eVR5cGUob0NvbnRleHQpO1xuXG5cdFx0d2hpbGUgKHNDdXJyZW50VHlwZSAhPT0gc1RhcmdldFR5cGUpIHtcblx0XHRcdC8vIEZpbmQgcGFyZW50IGJpbmRpbmcgY29udGV4dCBhbmQgcmV0cmlldmUgZW50aXR5IHR5cGVcblx0XHRcdG9Db250ZXh0ID0gb0NvbnRleHQuZ2V0QmluZGluZygpLmdldENvbnRleHQoKSBhcyBPRGF0YVY0Q29udGV4dDtcblx0XHRcdGlmIChvQ29udGV4dCkge1xuXHRcdFx0XHRzQ3VycmVudFR5cGUgPSBfZ2V0RW50aXR5VHlwZShvQ29udGV4dCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRMb2cud2FybmluZyhcIkNhbm5vdCBkZXRlcm1pbmUgdGFyZ2V0IHR5cGUgdG8gcmVxdWVzdCBwcm9wZXJ0eSB2YWx1ZSBmb3IgYm91bmQgYWN0aW9uIGludm9jYXRpb25cIik7XG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodW5kZWZpbmVkKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gb0NvbnRleHQucmVxdWVzdE9iamVjdChzUHJvcGVydHkpO1xufVxuXG5leHBvcnQgdHlwZSBfUmVxdWVzdGVkUHJvcGVydHkgPSB7XG5cdHZQcm9wZXJ0eVZhbHVlOiB1bmtub3duO1xuXHRvU2VsZWN0ZWRDb250ZXh0OiBDb250ZXh0O1xuXHRzQWN0aW9uOiBzdHJpbmc7XG5cdHNEeW5hbWljQWN0aW9uRW5hYmxlZFBhdGg6IHN0cmluZztcbn07XG5hc3luYyBmdW5jdGlvbiByZXF1ZXN0UHJvcGVydHkoXG5cdG9TZWxlY3RlZENvbnRleHQ6IE9EYXRhVjRDb250ZXh0LFxuXHRzQWN0aW9uOiBzdHJpbmcsXG5cdHNQcm9wZXJ0eTogc3RyaW5nLFxuXHRzRHluYW1pY0FjdGlvbkVuYWJsZWRQYXRoOiBzdHJpbmdcbik6IFByb21pc2U8X1JlcXVlc3RlZFByb3BlcnR5PiB7XG5cdGNvbnN0IG9Qcm9taXNlID1cblx0XHRzUHJvcGVydHkgJiYgc1Byb3BlcnR5LmluZGV4T2YoXCIvXCIpID09PSAwXG5cdFx0XHQ/IHJlcXVlc3RTaW5nbGV0b25Qcm9wZXJ0eShzUHJvcGVydHksIG9TZWxlY3RlZENvbnRleHQuZ2V0TW9kZWwoKSlcblx0XHRcdDogX3JlcXVlc3RPYmplY3Qoc0FjdGlvbiwgb1NlbGVjdGVkQ29udGV4dCwgc1Byb3BlcnR5KTtcblxuXHRyZXR1cm4gb1Byb21pc2UudGhlbihmdW5jdGlvbiAodlByb3BlcnR5VmFsdWU6IHVua25vd24pIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dlByb3BlcnR5VmFsdWU6IHZQcm9wZXJ0eVZhbHVlLFxuXHRcdFx0b1NlbGVjdGVkQ29udGV4dDogb1NlbGVjdGVkQ29udGV4dCxcblx0XHRcdHNBY3Rpb246IHNBY3Rpb24sXG5cdFx0XHRzRHluYW1pY0FjdGlvbkVuYWJsZWRQYXRoOiBzRHluYW1pY0FjdGlvbkVuYWJsZWRQYXRoXG5cdFx0fTtcblx0fSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNldENvbnRleHRzQmFzZWRPbk9wZXJhdGlvbkF2YWlsYWJsZShcblx0b0ludGVybmFsTW9kZWxDb250ZXh0OiBJbnRlcm5hbE1vZGVsQ29udGV4dCxcblx0YVJlcXVlc3RQcm9taXNlczogUHJvbWlzZTxfUmVxdWVzdGVkUHJvcGVydHk+W11cbikge1xuXHRyZXR1cm4gUHJvbWlzZS5hbGwoYVJlcXVlc3RQcm9taXNlcylcblx0XHQudGhlbihmdW5jdGlvbiAoYVJlc3VsdHMpIHtcblx0XHRcdGlmIChhUmVzdWx0cy5sZW5ndGgpIHtcblx0XHRcdFx0Y29uc3QgYUFwcGxpY2FibGVDb250ZXh0czogdW5rbm93bltdID0gW10sXG5cdFx0XHRcdFx0YU5vdEFwcGxpY2FibGVDb250ZXh0czogdW5rbm93bltdID0gW107XG5cdFx0XHRcdGFSZXN1bHRzLmZvckVhY2goZnVuY3Rpb24gKGFSZXN1bHQpIHtcblx0XHRcdFx0XHRpZiAoYVJlc3VsdCkge1xuXHRcdFx0XHRcdFx0aWYgKGFSZXN1bHQudlByb3BlcnR5VmFsdWUpIHtcblx0XHRcdFx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LmdldE1vZGVsKCkuc2V0UHJvcGVydHkoYVJlc3VsdC5zRHluYW1pY0FjdGlvbkVuYWJsZWRQYXRoLCB0cnVlKTtcblx0XHRcdFx0XHRcdFx0YUFwcGxpY2FibGVDb250ZXh0cy5wdXNoKGFSZXN1bHQub1NlbGVjdGVkQ29udGV4dCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRhTm90QXBwbGljYWJsZUNvbnRleHRzLnB1c2goYVJlc3VsdC5vU2VsZWN0ZWRDb250ZXh0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRzZXREeW5hbWljQWN0aW9uQ29udGV4dHMob0ludGVybmFsTW9kZWxDb250ZXh0LCBhUmVzdWx0c1swXS5zQWN0aW9uLCBhQXBwbGljYWJsZUNvbnRleHRzLCBhTm90QXBwbGljYWJsZUNvbnRleHRzKTtcblx0XHRcdH1cblx0XHRcdHJldHVybjtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiB1bmtub3duKSB7XG5cdFx0XHRMb2cudHJhY2UoXCJDYW5ub3QgcmV0cmlldmUgcHJvcGVydHkgdmFsdWUgZnJvbSBwYXRoXCIsIG9FcnJvciBhcyBzdHJpbmcpO1xuXHRcdH0pO1xufVxuXG4vKipcbiAqIEBwYXJhbSBvSW50ZXJuYWxNb2RlbENvbnRleHRcbiAqIEBwYXJhbSBzQWN0aW9uXG4gKiBAcGFyYW0gYUFwcGxpY2FibGVcbiAqIEBwYXJhbSBhTm90QXBwbGljYWJsZVxuICovXG5mdW5jdGlvbiBzZXREeW5hbWljQWN0aW9uQ29udGV4dHMoXG5cdG9JbnRlcm5hbE1vZGVsQ29udGV4dDogSW50ZXJuYWxNb2RlbENvbnRleHQsXG5cdHNBY3Rpb246IHN0cmluZyxcblx0YUFwcGxpY2FibGU6IHVua25vd25bXSxcblx0YU5vdEFwcGxpY2FibGU6IHVua25vd25bXVxuKSB7XG5cdGNvbnN0IHNEeW5hbWljQWN0aW9uUGF0aFByZWZpeCA9IGAke29JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQYXRoKCl9L2R5bmFtaWNBY3Rpb25zLyR7c0FjdGlvbn1gLFxuXHRcdG9JbnRlcm5hbE1vZGVsID0gb0ludGVybmFsTW9kZWxDb250ZXh0LmdldE1vZGVsKCk7XG5cdG9JbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KGAke3NEeW5hbWljQWN0aW9uUGF0aFByZWZpeH0vYUFwcGxpY2FibGVgLCBhQXBwbGljYWJsZSk7XG5cdG9JbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KGAke3NEeW5hbWljQWN0aW9uUGF0aFByZWZpeH0vYU5vdEFwcGxpY2FibGVgLCBhTm90QXBwbGljYWJsZSk7XG59XG5cbmZ1bmN0aW9uIF9nZXREZWZhdWx0T3BlcmF0b3JzKHNQcm9wZXJ0eVR5cGU/OiBzdHJpbmcpIHtcblx0Ly8gbWRjIGRlZmluZXMgdGhlIGZ1bGwgc2V0IG9mIG9wZXJhdGlvbnMgdGhhdCBhcmUgbWVhbmluZ2Z1bCBmb3IgZWFjaCBFZG0gVHlwZVxuXHQvLyBUT0RPIFJlcGxhY2Ugd2l0aCBtb2RlbCAvIGludGVybmFsIHdheSBvZiByZXRyaWV2aW5nIHRoZSBhY3R1YWwgbW9kZWwgdHlwZSB1c2VkIGZvciB0aGUgcHJvcGVydHlcblx0Y29uc3Qgb0RhdGFDbGFzcyA9IFR5cGVVdGlsLmdldERhdGFUeXBlQ2xhc3NOYW1lKHNQcm9wZXJ0eVR5cGUpO1xuXHQvLyBUT0RPIG5lZWQgdG8gcGFzcyBwcm9wZXIgZm9ybWF0T3B0aW9ucywgY29uc3RyYWludHMgaGVyZVxuXHRjb25zdCBvQmFzZVR5cGUgPSBUeXBlVXRpbC5nZXRCYXNlVHlwZShvRGF0YUNsYXNzLCB7fSwge30pO1xuXHRyZXR1cm4gRmlsdGVyT3BlcmF0b3JVdGlsLmdldE9wZXJhdG9yc0ZvclR5cGUob0Jhc2VUeXBlKTtcbn1cblxuZnVuY3Rpb24gX2dldFJlc3RyaWN0aW9ucyhhRGVmYXVsdE9wczogc3RyaW5nW10sIGFFeHByZXNzaW9uT3BzOiBzdHJpbmdbXSk6IHN0cmluZ1tdIHtcblx0Ly8gRnJvbSB0aGUgZGVmYXVsdCBzZXQgb2YgT3BlcmF0b3JzIGZvciB0aGUgQmFzZSBUeXBlLCBzZWxlY3QgdGhvc2UgdGhhdCBhcmUgZGVmaW5lZCBpbiB0aGUgQWxsb3dlZCBWYWx1ZS5cblx0Ly8gSW4gY2FzZSB0aGF0IG5vIG9wZXJhdG9ycyBhcmUgZm91bmQsIHJldHVybiB1bmRlZmluZWQgc28gdGhhdCB0aGUgZGVmYXVsdCBzZXQgaXMgdXNlZC5cblx0cmV0dXJuIGFEZWZhdWx0T3BzLmZpbHRlcihmdW5jdGlvbiAoc0VsZW1lbnQpIHtcblx0XHRyZXR1cm4gYUV4cHJlc3Npb25PcHMuaW5kZXhPZihzRWxlbWVudCkgPiAtMTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGdldFNwZWNpZmljQWxsb3dlZEV4cHJlc3Npb24oYUV4cHJlc3Npb25zOiBzdHJpbmdbXSkge1xuXHRjb25zdCBhQWxsb3dlZEV4cHJlc3Npb25zUHJpb3JpdHkgPSBDb21tb25VdGlscy5BbGxvd2VkRXhwcmVzc2lvbnNQcmlvO1xuXG5cdGFFeHByZXNzaW9ucy5zb3J0KGZ1bmN0aW9uIChhOiBzdHJpbmcsIGI6IHN0cmluZykge1xuXHRcdHJldHVybiBhQWxsb3dlZEV4cHJlc3Npb25zUHJpb3JpdHkuaW5kZXhPZihhKSAtIGFBbGxvd2VkRXhwcmVzc2lvbnNQcmlvcml0eS5pbmRleE9mKGIpO1xuXHR9KTtcblxuXHRyZXR1cm4gYUV4cHJlc3Npb25zWzBdO1xufVxuXG4vKipcbiAqIE1ldGhvZCB0byBmZXRjaCB0aGUgY29ycmVjdCBvcGVyYXRvcnMgYmFzZWQgb24gdGhlIGZpbHRlciByZXN0cmljdGlvbnMgdGhhdCBjYW4gYmUgYW5ub3RhdGVkIG9uIGFuIGVudGl0eSBzZXQgb3IgYSBuYXZpZ2F0aW9uIHByb3BlcnR5LlxuICogV2UgcmV0dXJuIHRoZSBjb3JyZWN0IG9wZXJhdG9ycyBiYXNlZCBvbiB0aGUgc3BlY2lmaWVkIHJlc3RyaWN0aW9uIGFuZCBhbHNvIGNoZWNrIGZvciB0aGUgb3BlcmF0b3JzIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0IHRvIGluY2x1ZGUgb3IgZXhjbHVkZSB0aGVtLlxuICpcbiAqIEBwYXJhbSBzUHJvcGVydHkgU3RyaW5nIG5hbWUgb2YgdGhlIHByb3BlcnR5XG4gKiBAcGFyYW0gc0VudGl0eVNldFBhdGggU3RyaW5nIHBhdGggdG8gdGhlIGVudGl0eSBzZXRcbiAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IHVzZWQgZHVyaW5nIHRlbXBsYXRpbmdcbiAqIEBwYXJhbSBzVHlwZSBTdHJpbmcgZGF0YSB0eXBlIG9kIHRoZSBwcm9wZXJ0eSwgZm9yIGV4YW1wbGUgZWRtLkRhdGVcbiAqIEBwYXJhbSBiVXNlU2VtYW50aWNEYXRlUmFuZ2UgQm9vbGVhbiBwYXNzZWQgZnJvbSB0aGUgbWFuaWZlc3QgZm9yIHNlbWFudGljIGRhdGUgcmFuZ2VcbiAqIEBwYXJhbSBzU2V0dGluZ3MgU3RyaW5naWZpZWQgb2JqZWN0IG9mIHRoZSBwcm9wZXJ0eSBzZXR0aW5nc1xuICogQHJldHVybnMgQW4gYXJyYXkgb2Ygc3RyaW5ncyByZXByZXNlbnRpbmcgb3BlcmF0b3JzIGZvciBmaWx0ZXJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE9wZXJhdG9yc0ZvclByb3BlcnR5KFxuXHRzUHJvcGVydHk6IHN0cmluZyxcblx0c0VudGl0eVNldFBhdGg6IHN0cmluZyxcblx0b0NvbnRleHQ6IE9EYXRhTWV0YU1vZGVsLFxuXHRzVHlwZT86IHN0cmluZyxcblx0YlVzZVNlbWFudGljRGF0ZVJhbmdlPzogYm9vbGVhbiB8IHN0cmluZyxcblx0c1NldHRpbmdzPzogc3RyaW5nXG4pOiBzdHJpbmdbXSB7XG5cdGNvbnN0IG9GaWx0ZXJSZXN0cmljdGlvbnMgPSBDb21tb25VdGlscy5nZXRGaWx0ZXJSZXN0cmljdGlvbnNCeVBhdGgoc0VudGl0eVNldFBhdGgsIG9Db250ZXh0KTtcblx0Y29uc3QgYUVxdWFsc09wcyA9IFtcIkVRXCJdO1xuXHRjb25zdCBhU2luZ2xlUmFuZ2VPcHMgPSBbXCJFUVwiLCBcIkdFXCIsIFwiTEVcIiwgXCJMVFwiLCBcIkdUXCIsIFwiQlRcIiwgXCJOT1RMRVwiLCBcIk5PVExUXCIsIFwiTk9UR0VcIiwgXCJOT1RHVFwiXTtcblx0Y29uc3QgYVNpbmdsZVJhbmdlRFRCYXNpY09wcyA9IFtcIkVRXCIsIFwiQlRcIl07XG5cdGNvbnN0IGFTaW5nbGVWYWx1ZURhdGVPcHMgPSBbXG5cdFx0XCJUT0RBWVwiLFxuXHRcdFwiVE9NT1JST1dcIixcblx0XHRcIllFU1RFUkRBWVwiLFxuXHRcdFwiREFURVwiLFxuXHRcdFwiRklSU1REQVlXRUVLXCIsXG5cdFx0XCJMQVNUREFZV0VFS1wiLFxuXHRcdFwiRklSU1REQVlNT05USFwiLFxuXHRcdFwiTEFTVERBWU1PTlRIXCIsXG5cdFx0XCJGSVJTVERBWVFVQVJURVJcIixcblx0XHRcIkxBU1REQVlRVUFSVEVSXCIsXG5cdFx0XCJGSVJTVERBWVlFQVJcIixcblx0XHRcIkxBU1REQVlZRUFSXCJcblx0XTtcblx0Y29uc3QgYU11bHRpUmFuZ2VPcHMgPSBbXCJFUVwiLCBcIkdFXCIsIFwiTEVcIiwgXCJMVFwiLCBcIkdUXCIsIFwiQlRcIiwgXCJORVwiLCBcIk5PVEJUXCIsIFwiTk9UTEVcIiwgXCJOT1RMVFwiLCBcIk5PVEdFXCIsIFwiTk9UR1RcIl07XG5cdGNvbnN0IGFTZWFyY2hFeHByZXNzaW9uT3BzID0gW1wiQ29udGFpbnNcIiwgXCJOb3RDb250YWluc1wiLCBcIlN0YXJ0c1dpdGhcIiwgXCJOb3RTdGFydHNXaXRoXCIsIFwiRW5kc1dpdGhcIiwgXCJOb3RFbmRzV2l0aFwiXTtcblx0Y29uc3QgYVNlbWFudGljRGF0ZU9wc0V4dCA9IFNlbWFudGljRGF0ZU9wZXJhdG9ycy5nZXRTdXBwb3J0ZWRPcGVyYXRpb25zKCk7XG5cdGNvbnN0IGJTZW1hbnRpY0RhdGVSYW5nZSA9IGJVc2VTZW1hbnRpY0RhdGVSYW5nZSA9PT0gXCJ0cnVlXCIgfHwgYlVzZVNlbWFudGljRGF0ZVJhbmdlID09PSB0cnVlO1xuXHRsZXQgYVNlbWFudGljRGF0ZU9wczogc3RyaW5nW10gPSBbXTtcblx0Y29uc3Qgb1NldHRpbmdzID0gc1NldHRpbmdzICYmIHR5cGVvZiBzU2V0dGluZ3MgPT09IFwic3RyaW5nXCIgPyBKU09OLnBhcnNlKHNTZXR0aW5ncykuY3VzdG9tRGF0YSA6IHNTZXR0aW5ncztcblxuXHRpZiAoKG9Db250ZXh0LmdldE9iamVjdChgJHtzRW50aXR5U2V0UGF0aH0vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5SZXN1bHRDb250ZXh0YCkgYXMgdW5rbm93bikgPT09IHRydWUpIHtcblx0XHRyZXR1cm4gYUVxdWFsc09wcztcblx0fVxuXG5cdGlmIChvU2V0dGluZ3MgJiYgb1NldHRpbmdzLm9wZXJhdG9yQ29uZmlndXJhdGlvbiAmJiBvU2V0dGluZ3Mub3BlcmF0b3JDb25maWd1cmF0aW9uLmxlbmd0aCA+IDApIHtcblx0XHRhU2VtYW50aWNEYXRlT3BzID0gU2VtYW50aWNEYXRlT3BlcmF0b3JzLmdldEZpbHRlck9wZXJhdGlvbnMob1NldHRpbmdzLm9wZXJhdG9yQ29uZmlndXJhdGlvbiwgc1R5cGUpO1xuXHR9IGVsc2Uge1xuXHRcdGFTZW1hbnRpY0RhdGVPcHMgPSBTZW1hbnRpY0RhdGVPcGVyYXRvcnMuZ2V0U2VtYW50aWNEYXRlT3BlcmF0aW9ucyhzVHlwZSk7XG5cdH1cblx0Ly8gR2V0IHRoZSBkZWZhdWx0IE9wZXJhdG9ycyBmb3IgdGhpcyBQcm9wZXJ0eSBUeXBlXG5cdGxldCBhRGVmYXVsdE9wZXJhdG9ycyA9IF9nZXREZWZhdWx0T3BlcmF0b3JzKHNUeXBlKTtcblx0aWYgKGJTZW1hbnRpY0RhdGVSYW5nZSkge1xuXHRcdGFEZWZhdWx0T3BlcmF0b3JzID0gYVNlbWFudGljRGF0ZU9wc0V4dC5jb25jYXQoYURlZmF1bHRPcGVyYXRvcnMpO1xuXHR9XG5cdGxldCByZXN0cmljdGlvbnM6IHN0cmluZ1tdID0gW107XG5cblx0Ly8gSXMgdGhlcmUgYSBGaWx0ZXIgUmVzdHJpY3Rpb24gZGVmaW5lZCBmb3IgdGhpcyBwcm9wZXJ0eT9cblx0aWYgKG9GaWx0ZXJSZXN0cmljdGlvbnMgJiYgb0ZpbHRlclJlc3RyaWN0aW9ucy5GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnMgJiYgb0ZpbHRlclJlc3RyaWN0aW9ucy5GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnNbc1Byb3BlcnR5XSkge1xuXHRcdC8vIEV4dGVuZGluZyB0aGUgZGVmYXVsdCBvcGVyYXRvcnMgbGlzdCB3aXRoIFNlbWFudGljIERhdGUgb3B0aW9ucyBEQVRFUkFOR0UsIERBVEUsIEZST00gYW5kIFRPXG5cdFx0Y29uc3Qgc0FsbG93ZWRFeHByZXNzaW9uID0gQ29tbW9uVXRpbHMuZ2V0U3BlY2lmaWNBbGxvd2VkRXhwcmVzc2lvbihvRmlsdGVyUmVzdHJpY3Rpb25zLkZpbHRlckFsbG93ZWRFeHByZXNzaW9uc1tzUHJvcGVydHldKTtcblx0XHQvLyBJbiBjYXNlIG1vcmUgdGhhbiBvbmUgQWxsb3dlZCBFeHByZXNzaW9ucyBoYXMgYmVlbiBkZWZpbmVkIGZvciBhIHByb3BlcnR5XG5cdFx0Ly8gY2hvb3NlIHRoZSBtb3N0IHJlc3RyaWN0aXZlIEFsbG93ZWQgRXhwcmVzc2lvblxuXG5cdFx0Ly8gTXVsdGlWYWx1ZSBoYXMgc2FtZSBPcGVyYXRvciBhcyBTaW5nbGVWYWx1ZSwgYnV0IHRoZXJlIGNhbiBiZSBtb3JlIHRoYW4gb25lIChtYXhDb25kaXRpb25zKVxuXHRcdHN3aXRjaCAoc0FsbG93ZWRFeHByZXNzaW9uKSB7XG5cdFx0XHRjYXNlIFwiU2luZ2xlVmFsdWVcIjpcblx0XHRcdFx0Y29uc3QgYVNpbmdsZVZhbHVlT3BzID0gc1R5cGUgPT09IFwiRWRtLkRhdGVcIiAmJiBiU2VtYW50aWNEYXRlUmFuZ2UgPyBhU2luZ2xlVmFsdWVEYXRlT3BzIDogYUVxdWFsc09wcztcblx0XHRcdFx0cmVzdHJpY3Rpb25zID0gX2dldFJlc3RyaWN0aW9ucyhhRGVmYXVsdE9wZXJhdG9ycywgYVNpbmdsZVZhbHVlT3BzKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiTXVsdGlWYWx1ZVwiOlxuXHRcdFx0XHRyZXN0cmljdGlvbnMgPSBfZ2V0UmVzdHJpY3Rpb25zKGFEZWZhdWx0T3BlcmF0b3JzLCBhRXF1YWxzT3BzKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiU2luZ2xlUmFuZ2VcIjpcblx0XHRcdFx0bGV0IGFFeHByZXNzaW9uT3BzOiBzdHJpbmdbXTtcblx0XHRcdFx0aWYgKGJTZW1hbnRpY0RhdGVSYW5nZSkge1xuXHRcdFx0XHRcdGlmIChzVHlwZSA9PT0gXCJFZG0uRGF0ZVwiKSB7XG5cdFx0XHRcdFx0XHRhRXhwcmVzc2lvbk9wcyA9IGFTZW1hbnRpY0RhdGVPcHM7XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChzVHlwZSA9PT0gXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIikge1xuXHRcdFx0XHRcdFx0YUV4cHJlc3Npb25PcHMgPSBhU2VtYW50aWNEYXRlT3BzO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRhRXhwcmVzc2lvbk9wcyA9IGFTaW5nbGVSYW5nZU9wcztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAoc1R5cGUgPT09IFwiRWRtLkRhdGVUaW1lT2Zmc2V0XCIpIHtcblx0XHRcdFx0XHRhRXhwcmVzc2lvbk9wcyA9IGFTaW5nbGVSYW5nZURUQmFzaWNPcHM7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YUV4cHJlc3Npb25PcHMgPSBhU2luZ2xlUmFuZ2VPcHM7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3Qgc09wZXJhdG9ycyA9IF9nZXRSZXN0cmljdGlvbnMoYURlZmF1bHRPcGVyYXRvcnMsIGFFeHByZXNzaW9uT3BzKTtcblx0XHRcdFx0cmVzdHJpY3Rpb25zID0gc09wZXJhdG9ycztcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiTXVsdGlSYW5nZVwiOlxuXHRcdFx0XHRyZXN0cmljdGlvbnMgPSBfZ2V0UmVzdHJpY3Rpb25zKGFEZWZhdWx0T3BlcmF0b3JzLCBhTXVsdGlSYW5nZU9wcyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIlNlYXJjaEV4cHJlc3Npb25cIjpcblx0XHRcdFx0cmVzdHJpY3Rpb25zID0gX2dldFJlc3RyaWN0aW9ucyhhRGVmYXVsdE9wZXJhdG9ycywgYVNlYXJjaEV4cHJlc3Npb25PcHMpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJNdWx0aVJhbmdlT3JTZWFyY2hFeHByZXNzaW9uXCI6XG5cdFx0XHRcdHJlc3RyaWN0aW9ucyA9IF9nZXRSZXN0cmljdGlvbnMoYURlZmF1bHRPcGVyYXRvcnMsIGFTZWFyY2hFeHByZXNzaW9uT3BzLmNvbmNhdChhTXVsdGlSYW5nZU9wcykpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHQvLyBJbiBjYXNlIEFsbG93ZWRFeHByZXNzaW9ucyBpcyBub3QgcmVjb2duaXNlZCwgdW5kZWZpbmVkIGluIHJldHVybiByZXN1bHRzIGluIHRoZSBkZWZhdWx0IHNldCBvZlxuXHRcdC8vIG9wZXJhdG9ycyBmb3IgdGhlIHR5cGUuXG5cdH1cblx0cmV0dXJuIHJlc3RyaWN0aW9ucztcbn1cblxuLyoqXG4gKiBNZXRob2QgdG8gcmV0dXJuIGFsbG93ZWQgb3BlcmF0b3JzIGZvciB0eXBlIEd1aWQuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBnZXRPcGVyYXRvcnNGb3JHdWlkUHJvcGVydHlcbiAqIEByZXR1cm5zIEFsbG93ZWQgb3BlcmF0b3JzIGZvciB0eXBlIEd1aWRcbiAqL1xuZnVuY3Rpb24gZ2V0T3BlcmF0b3JzRm9yR3VpZFByb3BlcnR5KCk6IHN0cmluZyB7XG5cdGNvbnN0IGFsbG93ZWRPcGVyYXRvcnNGb3JHdWlkID0gW1wiRVFcIiwgXCJORVwiXTtcblx0cmV0dXJuIGFsbG93ZWRPcGVyYXRvcnNGb3JHdWlkLnRvU3RyaW5nKCk7XG59XG5cbmZ1bmN0aW9uIGdldE9wZXJhdG9yc0ZvckRhdGVQcm9wZXJ0eShwcm9wZXJ0eVR5cGU6IHN0cmluZyk6IHN0cmluZ1tdIHtcblx0Ly8gSW4gY2FzZSBBbGxvd2VkRXhwcmVzc2lvbnMgaXMgbm90IHByb3ZpZGVkIGZvciB0eXBlIEVkbS5EYXRlIHRoZW4gYWxsIHRoZSBkZWZhdWx0XG5cdC8vIG9wZXJhdG9ycyBmb3IgdGhlIHR5cGUgc2hvdWxkIGJlIHJldHVybmVkIGV4Y2x1ZGluZyBzZW1hbnRpYyBvcGVyYXRvcnMgZnJvbSB0aGUgbGlzdC5cblx0Y29uc3QgYURlZmF1bHRPcGVyYXRvcnMgPSBfZ2V0RGVmYXVsdE9wZXJhdG9ycyhwcm9wZXJ0eVR5cGUpO1xuXHRjb25zdCBhTXVsdGlSYW5nZU9wcyA9IFtcIkVRXCIsIFwiR0VcIiwgXCJMRVwiLCBcIkxUXCIsIFwiR1RcIiwgXCJCVFwiLCBcIk5FXCIsIFwiTk9UQlRcIiwgXCJOT1RMRVwiLCBcIk5PVExUXCIsIFwiTk9UR0VcIiwgXCJOT1RHVFwiXTtcblx0cmV0dXJuIF9nZXRSZXN0cmljdGlvbnMoYURlZmF1bHRPcGVyYXRvcnMsIGFNdWx0aVJhbmdlT3BzKTtcbn1cblxudHlwZSBQYXJhbWV0ZXJJbmZvID0ge1xuXHRjb250ZXh0UGF0aD86IHN0cmluZztcblx0cGFyYW1ldGVyUHJvcGVydGllcz86IFJlY29yZDxzdHJpbmcsIE1ldGFNb2RlbFByb3BlcnR5Pjtcbn07XG5mdW5jdGlvbiBnZXRQYXJhbWV0ZXJJbmZvKG1ldGFNb2RlbENvbnRleHQ6IE9EYXRhTWV0YU1vZGVsLCBzQ29udGV4dFBhdGg6IHN0cmluZykge1xuXHRjb25zdCBzUGFyYW1ldGVyQ29udGV4dFBhdGggPSBzQ29udGV4dFBhdGguc3Vic3RyaW5nKDAsIHNDb250ZXh0UGF0aC5sYXN0SW5kZXhPZihcIi9cIikpO1xuXHRjb25zdCBiUmVzdWx0Q29udGV4dCA9IG1ldGFNb2RlbENvbnRleHQuZ2V0T2JqZWN0KGAke3NQYXJhbWV0ZXJDb250ZXh0UGF0aH0vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5SZXN1bHRDb250ZXh0YCk7XG5cdGNvbnN0IG9QYXJhbWV0ZXJJbmZvOiBQYXJhbWV0ZXJJbmZvID0ge307XG5cdGlmIChiUmVzdWx0Q29udGV4dCAmJiBzUGFyYW1ldGVyQ29udGV4dFBhdGggIT09IHNDb250ZXh0UGF0aCkge1xuXHRcdG9QYXJhbWV0ZXJJbmZvLmNvbnRleHRQYXRoID0gc1BhcmFtZXRlckNvbnRleHRQYXRoO1xuXHRcdG9QYXJhbWV0ZXJJbmZvLnBhcmFtZXRlclByb3BlcnRpZXMgPSBDb21tb25VdGlscy5nZXRDb250ZXh0UGF0aFByb3BlcnRpZXMobWV0YU1vZGVsQ29udGV4dCwgc1BhcmFtZXRlckNvbnRleHRQYXRoKTtcblx0fVxuXHRyZXR1cm4gb1BhcmFtZXRlckluZm87XG59XG5cbi8qKlxuICogTWV0aG9kIHRvIGFkZCB0aGUgc2VsZWN0IE9wdGlvbnMgdG8gZmlsdGVyIGNvbmRpdGlvbnMuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBhZGRTZWxlY3RPcHRpb25Ub0NvbmRpdGlvbnNcbiAqIEBwYXJhbSBvUHJvcGVydHlNZXRhZGF0YSBQcm9wZXJ0eSBtZXRhZGF0YSBpbmZvcm1hdGlvblxuICogQHBhcmFtIGFWYWxpZE9wZXJhdG9ycyBPcGVyYXRvcnMgZm9yIGFsbCB0aGUgZGF0YSB0eXBlc1xuICogQHBhcmFtIGFTZW1hbnRpY0RhdGVPcGVyYXRvcnMgT3BlcmF0b3JzIGZvciB0aGUgRGF0ZSB0eXBlXG4gKiBAcGFyYW0gYUN1bXVsYXRpdmVDb25kaXRpb25zIEZpbHRlciBjb25kaXRpb25zXG4gKiBAcGFyYW0gb1NlbGVjdE9wdGlvbiBTZWxlY3RvcHRpb24gb2Ygc2VsZWN0aW9uIHZhcmlhbnRcbiAqIEByZXR1cm5zIFRoZSBmaWx0ZXIgY29uZGl0aW9uc1xuICovXG5mdW5jdGlvbiBhZGRTZWxlY3RPcHRpb25Ub0NvbmRpdGlvbnMoXG5cdG9Qcm9wZXJ0eU1ldGFkYXRhOiB1bmtub3duLFxuXHRhVmFsaWRPcGVyYXRvcnM6IHN0cmluZ1tdLFxuXHRhU2VtYW50aWNEYXRlT3BlcmF0b3JzOiBzdHJpbmdbXSxcblx0YUN1bXVsYXRpdmVDb25kaXRpb25zOiBDb25kaXRpb25PYmplY3RbXSxcblx0b1NlbGVjdE9wdGlvbjogU2VsZWN0T3B0aW9uXG4pIHtcblx0Y29uc3Qgb0NvbmRpdGlvbiA9IGdldENvbmRpdGlvbnMob1NlbGVjdE9wdGlvbiwgb1Byb3BlcnR5TWV0YWRhdGEpO1xuXHRpZiAoXG5cdFx0b1NlbGVjdE9wdGlvbj8uU2VtYW50aWNEYXRlcyAmJlxuXHRcdGFTZW1hbnRpY0RhdGVPcGVyYXRvcnMgJiZcblx0XHRhU2VtYW50aWNEYXRlT3BlcmF0b3JzLmluZGV4T2Yob1NlbGVjdE9wdGlvbj8uU2VtYW50aWNEYXRlcz8ub3BlcmF0b3IpID4gLTFcblx0KSB7XG5cdFx0Y29uc3Qgc2VtYW50aWNEYXRlcyA9IENvbW1vblV0aWxzLmFkZFNlbWFudGljRGF0ZXNUb0NvbmRpdGlvbnMob1NlbGVjdE9wdGlvbj8uU2VtYW50aWNEYXRlcyk7XG5cdFx0aWYgKHNlbWFudGljRGF0ZXMgJiYgT2JqZWN0LmtleXMoc2VtYW50aWNEYXRlcykubGVuZ3RoID4gMCkge1xuXHRcdFx0YUN1bXVsYXRpdmVDb25kaXRpb25zLnB1c2goc2VtYW50aWNEYXRlcyk7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKG9Db25kaXRpb24pIHtcblx0XHRpZiAoYVZhbGlkT3BlcmF0b3JzLmxlbmd0aCA9PT0gMCB8fCBhVmFsaWRPcGVyYXRvcnMuaW5kZXhPZihvQ29uZGl0aW9uLm9wZXJhdG9yKSA+IC0xKSB7XG5cdFx0XHRhQ3VtdWxhdGl2ZUNvbmRpdGlvbnMucHVzaChvQ29uZGl0aW9uKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGFDdW11bGF0aXZlQ29uZGl0aW9ucztcbn1cblxuLyoqXG4gKiBNZXRob2QgdG8gYWRkIHRoZSBzZW1hbnRpYyBkYXRlcyB0byBmaWx0ZXIgY29uZGl0aW9uc1xuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgYWRkU2VtYW50aWNEYXRlc1RvQ29uZGl0aW9uc1xuICogQHBhcmFtIG9TZW1hbnRpY0RhdGVzIFNlbWFudGljIGRhdGUgaW5mb21hdGlvblxuICogQHJldHVybnMgVGhlIGZpbHRlciBjb25kaXRpb25zIGNvbnRhaW5pbmcgc2VtYW50aWMgZGF0ZXNcbiAqL1xuXG5mdW5jdGlvbiBhZGRTZW1hbnRpY0RhdGVzVG9Db25kaXRpb25zKG9TZW1hbnRpY0RhdGVzOiBTZW1hbnRpY0RhdGVDb25maWd1cmF0aW9uKTogQ29uZGl0aW9uT2JqZWN0IHtcblx0Y29uc3QgdmFsdWVzOiB1bmtub3duW10gPSBbXTtcblx0aWYgKG9TZW1hbnRpY0RhdGVzPy5oaWdoKSB7XG5cdFx0dmFsdWVzLnB1c2gob1NlbWFudGljRGF0ZXM/LmhpZ2gpO1xuXHR9XG5cdGlmIChvU2VtYW50aWNEYXRlcz8ubG93KSB7XG5cdFx0dmFsdWVzLnB1c2gob1NlbWFudGljRGF0ZXM/Lmxvdyk7XG5cdH1cblx0cmV0dXJuIHtcblx0XHR2YWx1ZXM6IHZhbHVlcyxcblx0XHRvcGVyYXRvcjogb1NlbWFudGljRGF0ZXM/Lm9wZXJhdG9yLFxuXHRcdGlzRW1wdHk6IHVuZGVmaW5lZFxuXHR9O1xufVxuXG5mdW5jdGlvbiBhZGRTZWxlY3RPcHRpb25zVG9Db25kaXRpb25zKFxuXHRzQ29udGV4dFBhdGg6IHN0cmluZyxcblx0b1NlbGVjdGlvblZhcmlhbnQ6IFNlbGVjdGlvblZhcmlhbnQsXG5cdHNTZWxlY3RPcHRpb25Qcm9wOiBzdHJpbmcsXG5cdG9Db25kaXRpb25zOiBSZWNvcmQ8c3RyaW5nLCBDb25kaXRpb25PYmplY3RbXT4sXG5cdHNDb25kaXRpb25QYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQsXG5cdHNDb25kaXRpb25Qcm9wOiBzdHJpbmcsXG5cdG9WYWxpZFByb3BlcnRpZXM6IFJlY29yZDxzdHJpbmcsIE1ldGFNb2RlbFByb3BlcnR5Pixcblx0bWV0YU1vZGVsQ29udGV4dDogT0RhdGFNZXRhTW9kZWwsXG5cdGlzUGFyYW1ldGVyOiBib29sZWFuLFxuXHRiSXNGTFBWYWx1ZVByZXNlbnQ/OiBib29sZWFuLFxuXHRiVXNlU2VtYW50aWNEYXRlUmFuZ2U/OiBib29sZWFuIHwgc3RyaW5nLFxuXHRvVmlld0RhdGE/OiBvYmplY3Rcbikge1xuXHRsZXQgYUNvbmRpdGlvbnM6IENvbmRpdGlvbk9iamVjdFtdID0gW10sXG5cdFx0YVNlbGVjdE9wdGlvbnM6IFNlbGVjdE9wdGlvbltdLFxuXHRcdGFWYWxpZE9wZXJhdG9yczogc3RyaW5nW10sXG5cdFx0YVNlbWFudGljRGF0ZU9wZXJhdG9yczogc3RyaW5nW10gPSBbXTtcblxuXHRpZiAoaXNQYXJhbWV0ZXIgfHwgTWV0YU1vZGVsRnVuY3Rpb24uaXNQcm9wZXJ0eUZpbHRlcmFibGUobWV0YU1vZGVsQ29udGV4dCwgc0NvbnRleHRQYXRoLCBzQ29uZGl0aW9uUHJvcCwgdHJ1ZSkpIHtcblx0XHRjb25zdCBvUHJvcGVydHlNZXRhZGF0YSA9IG9WYWxpZFByb3BlcnRpZXNbc0NvbmRpdGlvblByb3BdO1xuXHRcdGFTZWxlY3RPcHRpb25zID0gb1NlbGVjdGlvblZhcmlhbnQuZ2V0U2VsZWN0T3B0aW9uKHNTZWxlY3RPcHRpb25Qcm9wKSBhcyBTZWxlY3RPcHRpb25bXTtcblx0XHRjb25zdCBzZXR0aW5ncyA9IGdldEZpbHRlckNvbmZpZ3VyYXRpb25TZXR0aW5nKG9WaWV3RGF0YSwgc0NvbmRpdGlvblByb3ApO1xuXHRcdGFWYWxpZE9wZXJhdG9ycyA9IGlzUGFyYW1ldGVyID8gW1wiRVFcIl0gOiBDb21tb25VdGlscy5nZXRPcGVyYXRvcnNGb3JQcm9wZXJ0eShzQ29uZGl0aW9uUHJvcCwgc0NvbnRleHRQYXRoLCBtZXRhTW9kZWxDb250ZXh0KTtcblx0XHRpZiAoYlVzZVNlbWFudGljRGF0ZVJhbmdlKSB7XG5cdFx0XHRhU2VtYW50aWNEYXRlT3BlcmF0b3JzID0gaXNQYXJhbWV0ZXJcblx0XHRcdFx0PyBbXCJFUVwiXVxuXHRcdFx0XHQ6IENvbW1vblV0aWxzLmdldE9wZXJhdG9yc0ZvclByb3BlcnR5KFxuXHRcdFx0XHRcdFx0c0NvbmRpdGlvblByb3AsXG5cdFx0XHRcdFx0XHRzQ29udGV4dFBhdGgsXG5cdFx0XHRcdFx0XHRtZXRhTW9kZWxDb250ZXh0LFxuXHRcdFx0XHRcdFx0b1Byb3BlcnR5TWV0YWRhdGE/LiRUeXBlLFxuXHRcdFx0XHRcdFx0YlVzZVNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdFx0XHRcdFx0c2V0dGluZ3Ncblx0XHRcdFx0ICApO1xuXHRcdH1cblx0XHQvLyBDcmVhdGUgY29uZGl0aW9ucyBmb3IgYWxsIHRoZSBzZWxlY3RPcHRpb25zIG9mIHRoZSBwcm9wZXJ0eVxuXHRcdGFDb25kaXRpb25zID0gaXNQYXJhbWV0ZXJcblx0XHRcdD8gQ29tbW9uVXRpbHMuYWRkU2VsZWN0T3B0aW9uVG9Db25kaXRpb25zKFxuXHRcdFx0XHRcdG9Qcm9wZXJ0eU1ldGFkYXRhLFxuXHRcdFx0XHRcdGFWYWxpZE9wZXJhdG9ycyxcblx0XHRcdFx0XHRhU2VtYW50aWNEYXRlT3BlcmF0b3JzLFxuXHRcdFx0XHRcdGFDb25kaXRpb25zLFxuXHRcdFx0XHRcdGFTZWxlY3RPcHRpb25zWzBdXG5cdFx0XHQgIClcblx0XHRcdDogYVNlbGVjdE9wdGlvbnMucmVkdWNlKFxuXHRcdFx0XHRcdENvbW1vblV0aWxzLmFkZFNlbGVjdE9wdGlvblRvQ29uZGl0aW9ucy5iaW5kKG51bGwsIG9Qcm9wZXJ0eU1ldGFkYXRhLCBhVmFsaWRPcGVyYXRvcnMsIGFTZW1hbnRpY0RhdGVPcGVyYXRvcnMpLFxuXHRcdFx0XHRcdGFDb25kaXRpb25zXG5cdFx0XHQgICk7XG5cdFx0aWYgKGFDb25kaXRpb25zLmxlbmd0aCkge1xuXHRcdFx0aWYgKHNDb25kaXRpb25QYXRoKSB7XG5cdFx0XHRcdG9Db25kaXRpb25zW3NDb25kaXRpb25QYXRoICsgc0NvbmRpdGlvblByb3BdID0gb0NvbmRpdGlvbnMuaGFzT3duUHJvcGVydHkoc0NvbmRpdGlvblBhdGggKyBzQ29uZGl0aW9uUHJvcClcblx0XHRcdFx0XHQ/IG9Db25kaXRpb25zW3NDb25kaXRpb25QYXRoICsgc0NvbmRpdGlvblByb3BdLmNvbmNhdChhQ29uZGl0aW9ucylcblx0XHRcdFx0XHQ6IGFDb25kaXRpb25zO1xuXHRcdFx0fSBlbHNlIGlmIChiSXNGTFBWYWx1ZVByZXNlbnQpIHtcblx0XHRcdFx0Ly8gSWYgRkxQIHZhbHVlcyBhcmUgcHJlc2VudCByZXBsYWNlIGl0IHdpdGggRkxQIHZhbHVlc1xuXHRcdFx0XHRhQ29uZGl0aW9ucy5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG5cdFx0XHRcdFx0ZWxlbWVudFtcImZpbHRlcmVkXCJdID0gdHJ1ZTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGlmIChvQ29uZGl0aW9ucy5oYXNPd25Qcm9wZXJ0eShzQ29uZGl0aW9uUHJvcCkpIHtcblx0XHRcdFx0XHRvQ29uZGl0aW9uc1tzQ29uZGl0aW9uUHJvcF0uZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuXHRcdFx0XHRcdFx0ZWxlbWVudFtcImZpbHRlcmVkXCJdID0gZmFsc2U7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0b0NvbmRpdGlvbnNbc0NvbmRpdGlvblByb3BdID0gb0NvbmRpdGlvbnNbc0NvbmRpdGlvblByb3BdLmNvbmNhdChhQ29uZGl0aW9ucyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b0NvbmRpdGlvbnNbc0NvbmRpdGlvblByb3BdID0gYUNvbmRpdGlvbnM7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9Db25kaXRpb25zW3NDb25kaXRpb25Qcm9wXSA9IG9Db25kaXRpb25zLmhhc093blByb3BlcnR5KHNDb25kaXRpb25Qcm9wKVxuXHRcdFx0XHRcdD8gb0NvbmRpdGlvbnNbc0NvbmRpdGlvblByb3BdLmNvbmNhdChhQ29uZGl0aW9ucylcblx0XHRcdFx0XHQ6IGFDb25kaXRpb25zO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG4vKipcbiAqIE1ldGhvZCB0byBjcmVhdGUgdGhlIHNlbWFudGljIGRhdGVzIGZyb20gZmlsdGVyIGNvbmRpdGlvbnNcbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIGNyZWF0ZVNlbWFudGljRGF0ZXNGcm9tQ29uZGl0aW9uc1xuICogQHBhcmFtIG9Db25kaXRpb24gRmlsdGVyIGZpZWxkIGNvbmRpdGlvblxuICogQHBhcmFtIHNGaWx0ZXJOYW1lIEZpbHRlciBGaWVsZCBQYXRoXG4gKiBAcmV0dXJucyBUaGUgU2VtYW50aWMgZGF0ZSBjb25kaXRpb25zXG4gKi9cblxuZnVuY3Rpb24gY3JlYXRlU2VtYW50aWNEYXRlc0Zyb21Db25kaXRpb25zKG9Db25kaXRpb246IENvbmRpdGlvblR5cGUpOiBTZW1hbnRpY0RhdGVDb25maWd1cmF0aW9uIHtcblx0cmV0dXJuIHtcblx0XHRoaWdoOiAob0NvbmRpdGlvbj8udmFsdWVzPy5bMF0gYXMgc3RyaW5nKSB8fCBudWxsLFxuXHRcdGxvdzogKG9Db25kaXRpb24/LnZhbHVlcz8uWzFdIGFzIHN0cmluZykgfHwgbnVsbCxcblx0XHRvcGVyYXRvcjogb0NvbmRpdGlvbj8ub3BlcmF0b3Jcblx0fTtcbn1cblxuLyoqXG4gKiBNZXRob2QgdG8gUmV0dXJuIHRoZSBmaWx0ZXIgY29uZmlndXJhdGlvblxuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgZ2V0RmlsdGVyQ29uZmlndXJhdGlvblNldHRpbmdcbiAqIEBwYXJhbSBvVmlld0RhdGEgbWFuaWZlc3QgQ29uZmlndXJhdGlvblxuICogQHBhcmFtIHNQcm9wZXJ0eSBGaWx0ZXIgRmllbGQgUGF0aFxuICogQHJldHVybnMgVGhlIEZpbHRlciBGaWVsZCBDb25maWd1cmF0aW9uXG4gKi9cbnR5cGUgVmlld0RhdGEgPSB7XG5cdGNvbnRyb2xDb25maWd1cmF0aW9uPzogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgdW5rbm93bj4+O1xufTtcbmZ1bmN0aW9uIGdldEZpbHRlckNvbmZpZ3VyYXRpb25TZXR0aW5nKG9WaWV3RGF0YTogVmlld0RhdGEgPSB7fSwgc1Byb3BlcnR5OiBzdHJpbmcpIHtcblx0Y29uc3Qgb0NvbmZpZyA9IG9WaWV3RGF0YT8uY29udHJvbENvbmZpZ3VyYXRpb247XG5cdGNvbnN0IGZpbHRlckNvbmZpZyA9XG5cdFx0b0NvbmZpZyAmJiAob0NvbmZpZ1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25GaWVsZHNcIl0/LmZpbHRlckZpZWxkcyBhcyBSZWNvcmQ8c3RyaW5nLCB7IHNldHRpbmdzOiBzdHJpbmcgfT4pO1xuXHRyZXR1cm4gZmlsdGVyQ29uZmlnPy5bc1Byb3BlcnR5XSA/IGZpbHRlckNvbmZpZ1tzUHJvcGVydHldPy5zZXR0aW5ncyA6IHVuZGVmaW5lZDtcbn1cbmZ1bmN0aW9uIGFkZFNlbGVjdGlvblZhcmlhbnRUb0NvbmRpdGlvbnMoXG5cdG9TZWxlY3Rpb25WYXJpYW50OiBTZWxlY3Rpb25WYXJpYW50LFxuXHRvQ29uZGl0aW9uczogUmVjb3JkPHN0cmluZywgQ29uZGl0aW9uT2JqZWN0W10+LFxuXHRvTWV0YU1vZGVsQ29udGV4dDogT0RhdGFNZXRhTW9kZWwsXG5cdHNDb250ZXh0UGF0aDogc3RyaW5nLFxuXHRiSXNGTFBWYWx1ZXM/OiBib29sZWFuLFxuXHRiVXNlU2VtYW50aWNEYXRlUmFuZ2U/OiBib29sZWFuLFxuXHRvVmlld0RhdGE/OiBvYmplY3Rcbikge1xuXHRjb25zdCBhU2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMgPSBvU2VsZWN0aW9uVmFyaWFudC5nZXRTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcygpLFxuXHRcdG9WYWxpZFByb3BlcnRpZXMgPSBDb21tb25VdGlscy5nZXRDb250ZXh0UGF0aFByb3BlcnRpZXMob01ldGFNb2RlbENvbnRleHQsIHNDb250ZXh0UGF0aCksXG5cdFx0YU1ldGFkYXRQcm9wZXJ0aWVzID0gT2JqZWN0LmtleXMob1ZhbGlkUHJvcGVydGllcyksXG5cdFx0b1BhcmFtZXRlckluZm8gPSBDb21tb25VdGlscy5nZXRQYXJhbWV0ZXJJbmZvKG9NZXRhTW9kZWxDb250ZXh0LCBzQ29udGV4dFBhdGgpLFxuXHRcdHNQYXJhbWV0ZXJDb250ZXh0UGF0aCA9IG9QYXJhbWV0ZXJJbmZvLmNvbnRleHRQYXRoLFxuXHRcdG9WYWxpZFBhcmFtZXRlclByb3BlcnRpZXMgPSBvUGFyYW1ldGVySW5mby5wYXJhbWV0ZXJQcm9wZXJ0aWVzO1xuXG5cdGlmIChzUGFyYW1ldGVyQ29udGV4dFBhdGggIT09IHVuZGVmaW5lZCAmJiBvVmFsaWRQYXJhbWV0ZXJQcm9wZXJ0aWVzICYmIE9iamVjdC5rZXlzKG9WYWxpZFBhcmFtZXRlclByb3BlcnRpZXMpLmxlbmd0aCA+IDApIHtcblx0XHRjb25zdCBhTWV0YWRhdGFQYXJhbWV0ZXJzID0gT2JqZWN0LmtleXMob1ZhbGlkUGFyYW1ldGVyUHJvcGVydGllcyk7XG5cdFx0YU1ldGFkYXRhUGFyYW1ldGVycy5mb3JFYWNoKGZ1bmN0aW9uIChzTWV0YWRhdGFQYXJhbWV0ZXI6IHN0cmluZykge1xuXHRcdFx0bGV0IHNTZWxlY3RPcHRpb25OYW1lO1xuXHRcdFx0aWYgKGFTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcy5pbmNsdWRlcyhgJFBhcmFtZXRlci4ke3NNZXRhZGF0YVBhcmFtZXRlcn1gKSkge1xuXHRcdFx0XHRzU2VsZWN0T3B0aW9uTmFtZSA9IGAkUGFyYW1ldGVyLiR7c01ldGFkYXRhUGFyYW1ldGVyfWA7XG5cdFx0XHR9IGVsc2UgaWYgKGFTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcy5pbmNsdWRlcyhzTWV0YWRhdGFQYXJhbWV0ZXIpKSB7XG5cdFx0XHRcdHNTZWxlY3RPcHRpb25OYW1lID0gc01ldGFkYXRhUGFyYW1ldGVyO1xuXHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0c01ldGFkYXRhUGFyYW1ldGVyLnN0YXJ0c1dpdGgoXCJQX1wiKSAmJlxuXHRcdFx0XHRhU2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMuaW5jbHVkZXMoYCRQYXJhbWV0ZXIuJHtzTWV0YWRhdGFQYXJhbWV0ZXIuc2xpY2UoMiwgc01ldGFkYXRhUGFyYW1ldGVyLmxlbmd0aCl9YClcblx0XHRcdCkge1xuXHRcdFx0XHRzU2VsZWN0T3B0aW9uTmFtZSA9IGAkUGFyYW1ldGVyLiR7c01ldGFkYXRhUGFyYW1ldGVyLnNsaWNlKDIsIHNNZXRhZGF0YVBhcmFtZXRlci5sZW5ndGgpfWA7XG5cdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRzTWV0YWRhdGFQYXJhbWV0ZXIuc3RhcnRzV2l0aChcIlBfXCIpICYmXG5cdFx0XHRcdGFTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcy5pbmNsdWRlcyhzTWV0YWRhdGFQYXJhbWV0ZXIuc2xpY2UoMiwgc01ldGFkYXRhUGFyYW1ldGVyLmxlbmd0aCkpXG5cdFx0XHQpIHtcblx0XHRcdFx0c1NlbGVjdE9wdGlvbk5hbWUgPSBzTWV0YWRhdGFQYXJhbWV0ZXIuc2xpY2UoMiwgc01ldGFkYXRhUGFyYW1ldGVyLmxlbmd0aCk7XG5cdFx0XHR9IGVsc2UgaWYgKGFTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcy5pbmNsdWRlcyhgJFBhcmFtZXRlci5QXyR7c01ldGFkYXRhUGFyYW1ldGVyfWApKSB7XG5cdFx0XHRcdHNTZWxlY3RPcHRpb25OYW1lID0gYCRQYXJhbWV0ZXIuUF8ke3NNZXRhZGF0YVBhcmFtZXRlcn1gO1xuXHRcdFx0fSBlbHNlIGlmIChhU2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMuaW5jbHVkZXMoYFBfJHtzTWV0YWRhdGFQYXJhbWV0ZXJ9YCkpIHtcblx0XHRcdFx0c1NlbGVjdE9wdGlvbk5hbWUgPSBgUF8ke3NNZXRhZGF0YVBhcmFtZXRlcn1gO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoc1NlbGVjdE9wdGlvbk5hbWUpIHtcblx0XHRcdFx0YWRkU2VsZWN0T3B0aW9uc1RvQ29uZGl0aW9ucyhcblx0XHRcdFx0XHRzUGFyYW1ldGVyQ29udGV4dFBhdGgsXG5cdFx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnQsXG5cdFx0XHRcdFx0c1NlbGVjdE9wdGlvbk5hbWUsXG5cdFx0XHRcdFx0b0NvbmRpdGlvbnMsXG5cdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdHNNZXRhZGF0YVBhcmFtZXRlcixcblx0XHRcdFx0XHRvVmFsaWRQYXJhbWV0ZXJQcm9wZXJ0aWVzLFxuXHRcdFx0XHRcdG9NZXRhTW9kZWxDb250ZXh0LFxuXHRcdFx0XHRcdHRydWUsXG5cdFx0XHRcdFx0YklzRkxQVmFsdWVzLFxuXHRcdFx0XHRcdGJVc2VTZW1hbnRpY0RhdGVSYW5nZSxcblx0XHRcdFx0XHRvVmlld0RhdGFcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHRhTWV0YWRhdFByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbiAoc01ldGFkYXRhUHJvcGVydHk6IHN0cmluZykge1xuXHRcdGxldCBzU2VsZWN0T3B0aW9uTmFtZTtcblx0XHRpZiAoYVNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzLmluY2x1ZGVzKHNNZXRhZGF0YVByb3BlcnR5KSkge1xuXHRcdFx0c1NlbGVjdE9wdGlvbk5hbWUgPSBzTWV0YWRhdGFQcm9wZXJ0eTtcblx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0c01ldGFkYXRhUHJvcGVydHkuc3RhcnRzV2l0aChcIlBfXCIpICYmXG5cdFx0XHRhU2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMuaW5jbHVkZXMoc01ldGFkYXRhUHJvcGVydHkuc2xpY2UoMiwgc01ldGFkYXRhUHJvcGVydHkubGVuZ3RoKSlcblx0XHQpIHtcblx0XHRcdHNTZWxlY3RPcHRpb25OYW1lID0gc01ldGFkYXRhUHJvcGVydHkuc2xpY2UoMiwgc01ldGFkYXRhUHJvcGVydHkubGVuZ3RoKTtcblx0XHR9IGVsc2UgaWYgKGFTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcy5pbmNsdWRlcyhgUF8ke3NNZXRhZGF0YVByb3BlcnR5fWApKSB7XG5cdFx0XHRzU2VsZWN0T3B0aW9uTmFtZSA9IGBQXyR7c01ldGFkYXRhUHJvcGVydHl9YDtcblx0XHR9XG5cdFx0aWYgKHNTZWxlY3RPcHRpb25OYW1lKSB7XG5cdFx0XHRhZGRTZWxlY3RPcHRpb25zVG9Db25kaXRpb25zKFxuXHRcdFx0XHRzQ29udGV4dFBhdGgsXG5cdFx0XHRcdG9TZWxlY3Rpb25WYXJpYW50LFxuXHRcdFx0XHRzU2VsZWN0T3B0aW9uTmFtZSxcblx0XHRcdFx0b0NvbmRpdGlvbnMsXG5cdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0c01ldGFkYXRhUHJvcGVydHksXG5cdFx0XHRcdG9WYWxpZFByb3BlcnRpZXMsXG5cdFx0XHRcdG9NZXRhTW9kZWxDb250ZXh0LFxuXHRcdFx0XHRmYWxzZSxcblx0XHRcdFx0YklzRkxQVmFsdWVzLFxuXHRcdFx0XHRiVXNlU2VtYW50aWNEYXRlUmFuZ2UsXG5cdFx0XHRcdG9WaWV3RGF0YVxuXHRcdFx0KTtcblx0XHR9XG5cdH0pO1xuXG5cdGFTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcy5mb3JFYWNoKGZ1bmN0aW9uIChzU2VsZWN0T3B0aW9uOiBzdHJpbmcpIHtcblx0XHRpZiAoc1NlbGVjdE9wdGlvbi5pbmRleE9mKFwiLlwiKSA+IDAgJiYgIXNTZWxlY3RPcHRpb24uaW5jbHVkZXMoXCIkUGFyYW1ldGVyXCIpKSB7XG5cdFx0XHRjb25zdCBzUmVwbGFjZWRPcHRpb24gPSBzU2VsZWN0T3B0aW9uLnJlcGxhY2VBbGwoXCIuXCIsIFwiL1wiKTtcblx0XHRcdGNvbnN0IHNGdWxsQ29udGV4dFBhdGggPSBgLyR7c1JlcGxhY2VkT3B0aW9ufWAuc3RhcnRzV2l0aChzQ29udGV4dFBhdGgpXG5cdFx0XHRcdD8gYC8ke3NSZXBsYWNlZE9wdGlvbn1gXG5cdFx0XHRcdDogYCR7c0NvbnRleHRQYXRofS8ke3NSZXBsYWNlZE9wdGlvbn1gOyAvLyBjaGVjayBpZiB0aGUgZnVsbCBwYXRoLCBlZyBTYWxlc09yZGVyTWFuYWdlLl9JdGVtLk1hdGVyaWFsIGV4aXN0cyBpbiB0aGUgbWV0YW1vZGVsXG5cdFx0XHRpZiAob01ldGFNb2RlbENvbnRleHQuZ2V0T2JqZWN0KHNGdWxsQ29udGV4dFBhdGgucmVwbGFjZShcIlBfXCIsIFwiXCIpKSkge1xuXHRcdFx0XHRfY3JlYXRlQ29uZGl0aW9uc0Zvck5hdlByb3BlcnRpZXMoXG5cdFx0XHRcdFx0c0Z1bGxDb250ZXh0UGF0aCxcblx0XHRcdFx0XHRzQ29udGV4dFBhdGgsXG5cdFx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnQsXG5cdFx0XHRcdFx0c1NlbGVjdE9wdGlvbixcblx0XHRcdFx0XHRvTWV0YU1vZGVsQ29udGV4dCxcblx0XHRcdFx0XHRvQ29uZGl0aW9ucyxcblx0XHRcdFx0XHRiSXNGTFBWYWx1ZXMsXG5cdFx0XHRcdFx0YlVzZVNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdFx0XHRcdG9WaWV3RGF0YVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cdHJldHVybiBvQ29uZGl0aW9ucztcbn1cblxuZnVuY3Rpb24gX2NyZWF0ZUNvbmRpdGlvbnNGb3JOYXZQcm9wZXJ0aWVzKFxuXHRzRnVsbENvbnRleHRQYXRoOiBzdHJpbmcsXG5cdHNNYWluRW50aXR5U2V0UGF0aDogc3RyaW5nLFxuXHRvU2VsZWN0aW9uVmFyaWFudDogU2VsZWN0aW9uVmFyaWFudCxcblx0c1NlbGVjdE9wdGlvbjogc3RyaW5nLFxuXHRvTWV0YU1vZGVsQ29udGV4dDogT0RhdGFNZXRhTW9kZWwsXG5cdG9Db25kaXRpb25zOiBSZWNvcmQ8c3RyaW5nLCBDb25kaXRpb25PYmplY3RbXT4sXG5cdGJJc0ZMUFZhbHVlUHJlc2VudD86IGJvb2xlYW4sXG5cdGJTZW1hbnRpY0RhdGVSYW5nZT86IGJvb2xlYW4sXG5cdG9WaWV3RGF0YT86IG9iamVjdFxuKSB7XG5cdGxldCBhTmF2T2JqZWN0TmFtZXMgPSBzU2VsZWN0T3B0aW9uLnNwbGl0KFwiLlwiKTtcblx0Ly8gRWc6IFwiU2FsZXNPcmRlck1hbmFnZS5fSXRlbS5fTWF0ZXJpYWwuTWF0ZXJpYWxcIiBvciBcIl9JdGVtLk1hdGVyaWFsXCJcblx0aWYgKGAvJHtzU2VsZWN0T3B0aW9uLnJlcGxhY2VBbGwoXCIuXCIsIFwiL1wiKX1gLnN0YXJ0c1dpdGgoc01haW5FbnRpdHlTZXRQYXRoKSkge1xuXHRcdGNvbnN0IHNGdWxsUGF0aCA9IGAvJHtzU2VsZWN0T3B0aW9ufWAucmVwbGFjZUFsbChcIi5cIiwgXCIvXCIpLFxuXHRcdFx0c05hdlBhdGggPSBzRnVsbFBhdGgucmVwbGFjZShgJHtzTWFpbkVudGl0eVNldFBhdGh9L2AsIFwiXCIpO1xuXHRcdGFOYXZPYmplY3ROYW1lcyA9IHNOYXZQYXRoLnNwbGl0KFwiL1wiKTtcblx0fVxuXHRsZXQgc0NvbmRpdGlvblBhdGggPSBcIlwiO1xuXHRjb25zdCBzUHJvcGVydHlOYW1lID0gYU5hdk9iamVjdE5hbWVzW2FOYXZPYmplY3ROYW1lcy5sZW5ndGggLSAxXTsgLy8gTWF0ZXJpYWwgZnJvbSBTYWxlc09yZGVyTWFuYWdlLl9JdGVtLk1hdGVyaWFsXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgYU5hdk9iamVjdE5hbWVzLmxlbmd0aCAtIDE7IGkrKykge1xuXHRcdGlmIChvTWV0YU1vZGVsQ29udGV4dC5nZXRPYmplY3QoYCR7c01haW5FbnRpdHlTZXRQYXRofS8ke2FOYXZPYmplY3ROYW1lc1tpXS5yZXBsYWNlKFwiUF9cIiwgXCJcIil9YCkuJGlzQ29sbGVjdGlvbikge1xuXHRcdFx0c0NvbmRpdGlvblBhdGggPSBgJHtzQ29uZGl0aW9uUGF0aCArIGFOYXZPYmplY3ROYW1lc1tpXX0qL2A7IC8vIF9JdGVtKi8gaW4gY2FzZSBvZiAxOm4gY2FyZGluYWxpdHlcblx0XHR9IGVsc2Uge1xuXHRcdFx0c0NvbmRpdGlvblBhdGggPSBgJHtzQ29uZGl0aW9uUGF0aCArIGFOYXZPYmplY3ROYW1lc1tpXX0vYDsgLy8gX0l0ZW0vIGluIGNhc2Ugb2YgMToxIGNhcmRpbmFsaXR5XG5cdFx0fVxuXHRcdHNNYWluRW50aXR5U2V0UGF0aCA9IGAke3NNYWluRW50aXR5U2V0UGF0aH0vJHthTmF2T2JqZWN0TmFtZXNbaV19YDtcblx0fVxuXHRjb25zdCBzTmF2UHJvcGVydHlQYXRoID0gc0Z1bGxDb250ZXh0UGF0aC5zbGljZSgwLCBzRnVsbENvbnRleHRQYXRoLmxhc3RJbmRleE9mKFwiL1wiKSksXG5cdFx0b1ZhbGlkUHJvcGVydGllcyA9IENvbW1vblV0aWxzLmdldENvbnRleHRQYXRoUHJvcGVydGllcyhvTWV0YU1vZGVsQ29udGV4dCwgc05hdlByb3BlcnR5UGF0aCksXG5cdFx0YVNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzID0gb1NlbGVjdGlvblZhcmlhbnQuZ2V0U2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMoKTtcblx0bGV0IHNTZWxlY3RPcHRpb25OYW1lID0gc1Byb3BlcnR5TmFtZTtcblx0aWYgKG9WYWxpZFByb3BlcnRpZXNbc1Byb3BlcnR5TmFtZV0pIHtcblx0XHRzU2VsZWN0T3B0aW9uTmFtZSA9IHNQcm9wZXJ0eU5hbWU7XG5cdH0gZWxzZSBpZiAoc1Byb3BlcnR5TmFtZS5zdGFydHNXaXRoKFwiUF9cIikgJiYgb1ZhbGlkUHJvcGVydGllc1tzUHJvcGVydHlOYW1lLnJlcGxhY2UoXCJQX1wiLCBcIlwiKV0pIHtcblx0XHRzU2VsZWN0T3B0aW9uTmFtZSA9IHNQcm9wZXJ0eU5hbWUucmVwbGFjZShcIlBfXCIsIFwiXCIpO1xuXHR9IGVsc2UgaWYgKG9WYWxpZFByb3BlcnRpZXNbYFBfJHtzUHJvcGVydHlOYW1lfWBdICYmIGFTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcy5pbmNsdWRlcyhgUF8ke3NQcm9wZXJ0eU5hbWV9YCkpIHtcblx0XHRzU2VsZWN0T3B0aW9uTmFtZSA9IGBQXyR7c1Byb3BlcnR5TmFtZX1gO1xuXHR9XG5cdGlmIChzUHJvcGVydHlOYW1lLnN0YXJ0c1dpdGgoXCJQX1wiKSAmJiBvQ29uZGl0aW9uc1tzQ29uZGl0aW9uUGF0aCArIHNTZWxlY3RPcHRpb25OYW1lXSkge1xuXHRcdC8vIGlmIHRoZXJlIGlzIG5vIFNhbGVzT3JkZXJNYW5hZ2UuX0l0ZW0uTWF0ZXJpYWwgeWV0IGluIHRoZSBvQ29uZGl0aW9uc1xuXHR9IGVsc2UgaWYgKCFzUHJvcGVydHlOYW1lLnN0YXJ0c1dpdGgoXCJQX1wiKSAmJiBvQ29uZGl0aW9uc1tzQ29uZGl0aW9uUGF0aCArIHNTZWxlY3RPcHRpb25OYW1lXSkge1xuXHRcdGRlbGV0ZSBvQ29uZGl0aW9uc1tzQ29uZGl0aW9uUGF0aCArIHNTZWxlY3RPcHRpb25OYW1lXTtcblx0XHRhZGRTZWxlY3RPcHRpb25zVG9Db25kaXRpb25zKFxuXHRcdFx0c05hdlByb3BlcnR5UGF0aCxcblx0XHRcdG9TZWxlY3Rpb25WYXJpYW50LFxuXHRcdFx0c1NlbGVjdE9wdGlvbixcblx0XHRcdG9Db25kaXRpb25zLFxuXHRcdFx0c0NvbmRpdGlvblBhdGgsXG5cdFx0XHRzU2VsZWN0T3B0aW9uTmFtZSxcblx0XHRcdG9WYWxpZFByb3BlcnRpZXMsXG5cdFx0XHRvTWV0YU1vZGVsQ29udGV4dCxcblx0XHRcdGZhbHNlLFxuXHRcdFx0YklzRkxQVmFsdWVQcmVzZW50LFxuXHRcdFx0YlNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdFx0b1ZpZXdEYXRhXG5cdFx0KTtcblx0fSBlbHNlIHtcblx0XHRhZGRTZWxlY3RPcHRpb25zVG9Db25kaXRpb25zKFxuXHRcdFx0c05hdlByb3BlcnR5UGF0aCxcblx0XHRcdG9TZWxlY3Rpb25WYXJpYW50LFxuXHRcdFx0c1NlbGVjdE9wdGlvbixcblx0XHRcdG9Db25kaXRpb25zLFxuXHRcdFx0c0NvbmRpdGlvblBhdGgsXG5cdFx0XHRzU2VsZWN0T3B0aW9uTmFtZSxcblx0XHRcdG9WYWxpZFByb3BlcnRpZXMsXG5cdFx0XHRvTWV0YU1vZGVsQ29udGV4dCxcblx0XHRcdGZhbHNlLFxuXHRcdFx0YklzRkxQVmFsdWVQcmVzZW50LFxuXHRcdFx0YlNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdFx0b1ZpZXdEYXRhXG5cdFx0KTtcblx0fVxufVxuXG5mdW5jdGlvbiBhZGRQYWdlQ29udGV4dFRvU2VsZWN0aW9uVmFyaWFudChvU2VsZWN0aW9uVmFyaWFudDogU2VsZWN0aW9uVmFyaWFudCwgbVBhZ2VDb250ZXh0OiB1bmtub3duW10sIG9WaWV3OiBWaWV3KSB7XG5cdGNvbnN0IG9BcHBDb21wb25lbnQgPSBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQob1ZpZXcpO1xuXHRjb25zdCBvTmF2aWdhdGlvblNlcnZpY2UgPSBvQXBwQ29tcG9uZW50LmdldE5hdmlnYXRpb25TZXJ2aWNlKCk7XG5cdHJldHVybiBvTmF2aWdhdGlvblNlcnZpY2UubWl4QXR0cmlidXRlc0FuZFNlbGVjdGlvblZhcmlhbnQobVBhZ2VDb250ZXh0LCBvU2VsZWN0aW9uVmFyaWFudC50b0pTT05TdHJpbmcoKSk7XG59XG5cbmZ1bmN0aW9uIGFkZEV4dGVybmFsU3RhdGVGaWx0ZXJzVG9TZWxlY3Rpb25WYXJpYW50KFxuXHRvU2VsZWN0aW9uVmFyaWFudDogU2VsZWN0aW9uVmFyaWFudCxcblx0bUZpbHRlcnM6IHtcblx0XHRmaWx0ZXJDb25kaXRpb25zOiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBDb25kaXRpb25PYmplY3Q+Pjtcblx0XHRmaWx0ZXJDb25kaXRpb25zV2l0aG91dENvbmZsaWN0OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuXHR9LFxuXHRvVGFyZ2V0SW5mbzoge1xuXHRcdHByb3BlcnRpZXNXaXRob3V0Q29uZmxpY3Q/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuXHR9LFxuXHRvRmlsdGVyQmFyPzogRmlsdGVyQmFyXG4pIHtcblx0bGV0IHNGaWx0ZXI6IHN0cmluZztcblx0Y29uc3QgZm5HZXRTaWduQW5kT3B0aW9uID0gZnVuY3Rpb24gKHNPcGVyYXRvcjogc3RyaW5nLCBzTG93VmFsdWU6IHN0cmluZywgc0hpZ2hWYWx1ZTogc3RyaW5nKSB7XG5cdFx0Y29uc3Qgb1NlbGVjdE9wdGlvblN0YXRlID0ge1xuXHRcdFx0b3B0aW9uOiBcIlwiLFxuXHRcdFx0c2lnbjogXCJJXCIsXG5cdFx0XHRsb3c6IHNMb3dWYWx1ZSxcblx0XHRcdGhpZ2g6IHNIaWdoVmFsdWVcblx0XHR9O1xuXHRcdHN3aXRjaCAoc09wZXJhdG9yKSB7XG5cdFx0XHRjYXNlIFwiQ29udGFpbnNcIjpcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLm9wdGlvbiA9IFwiQ1BcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiU3RhcnRzV2l0aFwiOlxuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUub3B0aW9uID0gXCJDUFwiO1xuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUubG93ICs9IFwiKlwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJFbmRzV2l0aFwiOlxuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUub3B0aW9uID0gXCJDUFwiO1xuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUubG93ID0gYCoke29TZWxlY3RPcHRpb25TdGF0ZS5sb3d9YDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiQlRcIjpcblx0XHRcdGNhc2UgXCJMRVwiOlxuXHRcdFx0Y2FzZSBcIkxUXCI6XG5cdFx0XHRjYXNlIFwiR1RcIjpcblx0XHRcdGNhc2UgXCJORVwiOlxuXHRcdFx0Y2FzZSBcIkVRXCI6XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5vcHRpb24gPSBzT3BlcmF0b3I7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkRBVEVcIjpcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLm9wdGlvbiA9IFwiRVFcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiREFURVJBTkdFXCI6XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5vcHRpb24gPSBcIkJUXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkZST01cIjpcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLm9wdGlvbiA9IFwiR0VcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiVE9cIjpcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLm9wdGlvbiA9IFwiTEVcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiRUVRXCI6XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5vcHRpb24gPSBcIkVRXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkVtcHR5XCI6XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5vcHRpb24gPSBcIkVRXCI7XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5sb3cgPSBcIlwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJOb3RDb250YWluc1wiOlxuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUub3B0aW9uID0gXCJDUFwiO1xuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUuc2lnbiA9IFwiRVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJOT1RCVFwiOlxuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUub3B0aW9uID0gXCJCVFwiO1xuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUuc2lnbiA9IFwiRVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJOb3RTdGFydHNXaXRoXCI6XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5vcHRpb24gPSBcIkNQXCI7XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5sb3cgKz0gXCIqXCI7XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5zaWduID0gXCJFXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIk5vdEVuZHNXaXRoXCI6XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5vcHRpb24gPSBcIkNQXCI7XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5sb3cgPSBgKiR7b1NlbGVjdE9wdGlvblN0YXRlLmxvd31gO1xuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUuc2lnbiA9IFwiRVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJOb3RFbXB0eVwiOlxuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUub3B0aW9uID0gXCJORVwiO1xuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUubG93ID0gXCJcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiTk9UTEVcIjpcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLm9wdGlvbiA9IFwiTEVcIjtcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLnNpZ24gPSBcIkVcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiTk9UR0VcIjpcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLm9wdGlvbiA9IFwiR0VcIjtcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLnNpZ24gPSBcIkVcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiTk9UTFRcIjpcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLm9wdGlvbiA9IFwiTFRcIjtcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLnNpZ24gPSBcIkVcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiTk9UR1RcIjpcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLm9wdGlvbiA9IFwiR1RcIjtcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLnNpZ24gPSBcIkVcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRMb2cud2FybmluZyhgJHtzT3BlcmF0b3J9IGlzIG5vdCBzdXBwb3J0ZWQuICR7c0ZpbHRlcn0gY291bGQgbm90IGJlIGFkZGVkIHRvIHRoZSBuYXZpZ2F0aW9uIGNvbnRleHRgKTtcblx0XHR9XG5cdFx0cmV0dXJuIG9TZWxlY3RPcHRpb25TdGF0ZTtcblx0fTtcblx0Y29uc3Qgb0ZpbHRlckNvbmRpdGlvbnMgPSBtRmlsdGVycy5maWx0ZXJDb25kaXRpb25zO1xuXHRjb25zdCBvRmlsdGVyc1dpdGhvdXRDb25mbGljdCA9IG1GaWx0ZXJzLmZpbHRlckNvbmRpdGlvbnNXaXRob3V0Q29uZmxpY3QgPyBtRmlsdGVycy5maWx0ZXJDb25kaXRpb25zV2l0aG91dENvbmZsaWN0IDoge307XG5cdGNvbnN0IG9UYWJsZVByb3BlcnRpZXNXaXRob3V0Q29uZmxpY3QgPSBvVGFyZ2V0SW5mby5wcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0ID8gb1RhcmdldEluZm8ucHJvcGVydGllc1dpdGhvdXRDb25mbGljdCA6IHt9O1xuXHRjb25zdCBhZGRGaWx0ZXJzVG9TZWxlY3Rpb25WYXJpYW50ID0gZnVuY3Rpb24gKHNlbGVjdGlvblZhcmlhbnQ6IFNlbGVjdGlvblZhcmlhbnQsIHNGaWx0ZXJOYW1lOiBzdHJpbmcsIHNQYXRoPzogc3RyaW5nKSB7XG5cdFx0Y29uc3QgYUNvbmRpdGlvbnMgPSBvRmlsdGVyQ29uZGl0aW9uc1tzRmlsdGVyTmFtZV07XG5cdFx0Y29uc3Qgb1Byb3BlcnR5SW5mbyA9IG9GaWx0ZXJCYXIgJiYgb0ZpbHRlckJhci5nZXRQcm9wZXJ0eUhlbHBlcigpLmdldFByb3BlcnR5KHNGaWx0ZXJOYW1lKTtcblx0XHRjb25zdCBvVHlwZUNvbmZpZyA9IG9Qcm9wZXJ0eUluZm8/LnR5cGVDb25maWc7XG5cdFx0Y29uc3Qgb1R5cGVVdGlsID0gb0ZpbHRlckJhciAmJiBvRmlsdGVyQmFyLmdldENvbnRyb2xEZWxlZ2F0ZSgpLmdldFR5cGVVdGlsKCk7XG5cblx0XHRmb3IgKGNvbnN0IGl0ZW0gaW4gYUNvbmRpdGlvbnMpIHtcblx0XHRcdGNvbnN0IG9Db25kaXRpb24gPSBhQ29uZGl0aW9uc1tpdGVtXTtcblxuXHRcdFx0bGV0IG9wdGlvbjogc3RyaW5nIHwgdW5kZWZpbmVkID0gXCJcIixcblx0XHRcdFx0c2lnbiA9IFwiSVwiLFxuXHRcdFx0XHRsb3cgPSBcIlwiLFxuXHRcdFx0XHRoaWdoID0gbnVsbCxcblx0XHRcdFx0c2VtYW50aWNEYXRlcztcblxuXHRcdFx0Y29uc3Qgb09wZXJhdG9yID0gRmlsdGVyT3BlcmF0b3JVdGlsLmdldE9wZXJhdG9yKG9Db25kaXRpb24ub3BlcmF0b3IpO1xuXHRcdFx0aWYgKG9PcGVyYXRvciBpbnN0YW5jZW9mIFJhbmdlT3BlcmF0b3IpIHtcblx0XHRcdFx0c2VtYW50aWNEYXRlcyA9IENvbW1vblV0aWxzLmNyZWF0ZVNlbWFudGljRGF0ZXNGcm9tQ29uZGl0aW9ucyhvQ29uZGl0aW9uKTtcblx0XHRcdFx0Ly8gaGFuZGxpbmcgb2YgRGF0ZSBSYW5nZU9wZXJhdG9yc1xuXHRcdFx0XHRjb25zdCBvTW9kZWxGaWx0ZXIgPSBvT3BlcmF0b3IuZ2V0TW9kZWxGaWx0ZXIoXG5cdFx0XHRcdFx0b0NvbmRpdGlvbixcblx0XHRcdFx0XHRzRmlsdGVyTmFtZSxcblx0XHRcdFx0XHRvVHlwZUNvbmZpZz8udHlwZUluc3RhbmNlLFxuXHRcdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRcdG9UeXBlQ29uZmlnPy5iYXNlVHlwZVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoIW9Nb2RlbEZpbHRlcj8uZ2V0RmlsdGVycygpICYmICFvTW9kZWxGaWx0ZXI/LmdldEZpbHRlcnMoKT8ubGVuZ3RoKSB7XG5cdFx0XHRcdFx0c2lnbiA9IG9PcGVyYXRvci5leGNsdWRlID8gXCJFXCIgOiBcIklcIjtcblx0XHRcdFx0XHRsb3cgPSBvVHlwZVV0aWwuZXh0ZXJuYWxpemVWYWx1ZShvTW9kZWxGaWx0ZXIuZ2V0VmFsdWUxKCksIG9UeXBlQ29uZmlnLnR5cGVJbnN0YW5jZSk7XG5cdFx0XHRcdFx0aGlnaCA9IG9UeXBlVXRpbC5leHRlcm5hbGl6ZVZhbHVlKG9Nb2RlbEZpbHRlci5nZXRWYWx1ZTIoKSwgb1R5cGVDb25maWcudHlwZUluc3RhbmNlKTtcblx0XHRcdFx0XHRvcHRpb24gPSBvTW9kZWxGaWx0ZXIuZ2V0T3BlcmF0b3IoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgYVNlbWFudGljRGF0ZU9wc0V4dCA9IFNlbWFudGljRGF0ZU9wZXJhdG9ycy5nZXRTdXBwb3J0ZWRPcGVyYXRpb25zKCk7XG5cdFx0XHRcdGlmIChhU2VtYW50aWNEYXRlT3BzRXh0LmluY2x1ZGVzKG9Db25kaXRpb24/Lm9wZXJhdG9yKSkge1xuXHRcdFx0XHRcdHNlbWFudGljRGF0ZXMgPSBDb21tb25VdGlscy5jcmVhdGVTZW1hbnRpY0RhdGVzRnJvbUNvbmRpdGlvbnMob0NvbmRpdGlvbik7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3QgdmFsdWUxID0gKG9Db25kaXRpb24udmFsdWVzWzBdICYmIG9Db25kaXRpb24udmFsdWVzWzBdLnRvU3RyaW5nKCkpIHx8IFwiXCI7XG5cdFx0XHRcdGNvbnN0IHZhbHVlMiA9IChvQ29uZGl0aW9uLnZhbHVlc1sxXSAmJiBvQ29uZGl0aW9uLnZhbHVlc1sxXS50b1N0cmluZygpKSB8fCBudWxsO1xuXHRcdFx0XHRjb25zdCBvU2VsZWN0T3B0aW9uID0gZm5HZXRTaWduQW5kT3B0aW9uKG9Db25kaXRpb24ub3BlcmF0b3IsIHZhbHVlMSwgdmFsdWUyKTtcblx0XHRcdFx0c2lnbiA9IG9PcGVyYXRvcj8uZXhjbHVkZSA/IFwiRVwiIDogXCJJXCI7XG5cdFx0XHRcdGxvdyA9IG9TZWxlY3RPcHRpb24/Lmxvdztcblx0XHRcdFx0aGlnaCA9IG9TZWxlY3RPcHRpb24/LmhpZ2g7XG5cdFx0XHRcdG9wdGlvbiA9IG9TZWxlY3RPcHRpb24/Lm9wdGlvbjtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG9wdGlvbiAmJiBzZW1hbnRpY0RhdGVzKSB7XG5cdFx0XHRcdHNlbGVjdGlvblZhcmlhbnQuYWRkU2VsZWN0T3B0aW9uKHNQYXRoID8gc1BhdGggOiBzRmlsdGVyTmFtZSwgc2lnbiwgb3B0aW9uLCBsb3csIGhpZ2gsIHVuZGVmaW5lZCwgc2VtYW50aWNEYXRlcyk7XG5cdFx0XHR9IGVsc2UgaWYgKG9wdGlvbikge1xuXHRcdFx0XHRzZWxlY3Rpb25WYXJpYW50LmFkZFNlbGVjdE9wdGlvbihzUGF0aCA/IHNQYXRoIDogc0ZpbHRlck5hbWUsIHNpZ24sIG9wdGlvbiwgbG93LCBoaWdoKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0Zm9yIChzRmlsdGVyIGluIG9GaWx0ZXJDb25kaXRpb25zKSB7XG5cdFx0Ly8gb25seSBhZGQgdGhlIGZpbHRlciB2YWx1ZXMgaWYgaXQgaXMgbm90IGFscmVhZHkgcHJlc2VudCBpbiB0aGUgU1YgYWxyZWFkeVxuXHRcdGlmICghb1NlbGVjdGlvblZhcmlhbnQuZ2V0U2VsZWN0T3B0aW9uKHNGaWx0ZXIpKSB7XG5cdFx0XHQvLyBUT0RPIDogY3VzdG9tIGZpbHRlcnMgc2hvdWxkIGJlIGlnbm9yZWQgbW9yZSBnZW5lcmljYWxseVxuXHRcdFx0aWYgKHNGaWx0ZXIgPT09IFwiJGVkaXRTdGF0ZVwiKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0YWRkRmlsdGVyc1RvU2VsZWN0aW9uVmFyaWFudChvU2VsZWN0aW9uVmFyaWFudCwgc0ZpbHRlcik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmIChvVGFibGVQcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0ICYmIHNGaWx0ZXIgaW4gb1RhYmxlUHJvcGVydGllc1dpdGhvdXRDb25mbGljdCkge1xuXHRcdFx0XHRhZGRGaWx0ZXJzVG9TZWxlY3Rpb25WYXJpYW50KG9TZWxlY3Rpb25WYXJpYW50LCBzRmlsdGVyLCBvVGFibGVQcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0W3NGaWx0ZXJdKTtcblx0XHRcdH1cblx0XHRcdC8vIGlmIHByb3BlcnR5IHdhcyB3aXRob3V0IGNvbmZsaWN0IGluIHBhZ2UgY29udGV4dCB0aGVuIGFkZCBwYXRoIGZyb20gcGFnZSBjb250ZXh0IHRvIFNWXG5cdFx0XHRpZiAoc0ZpbHRlciBpbiBvRmlsdGVyc1dpdGhvdXRDb25mbGljdCkge1xuXHRcdFx0XHRhZGRGaWx0ZXJzVG9TZWxlY3Rpb25WYXJpYW50KG9TZWxlY3Rpb25WYXJpYW50LCBzRmlsdGVyLCBvRmlsdGVyc1dpdGhvdXRDb25mbGljdFtzRmlsdGVyXSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBvU2VsZWN0aW9uVmFyaWFudDtcbn1cblxuZnVuY3Rpb24gaXNTdGlja3lFZGl0TW9kZShvQ29udHJvbDogQ29udHJvbCkge1xuXHRjb25zdCBiSXNTdGlja3lNb2RlID0gTW9kZWxIZWxwZXIuaXNTdGlja3lTZXNzaW9uU3VwcG9ydGVkKChvQ29udHJvbC5nZXRNb2RlbCgpIGFzIE9EYXRhTW9kZWwpLmdldE1ldGFNb2RlbCgpKTtcblx0Y29uc3QgYlVJRWRpdGFibGUgPSBvQ29udHJvbC5nZXRNb2RlbChcInVpXCIpLmdldFByb3BlcnR5KFwiL2lzRWRpdGFibGVcIik7XG5cdHJldHVybiBiSXNTdGlja3lNb2RlICYmIGJVSUVkaXRhYmxlO1xufVxuXG4vKipcbiAqIEBwYXJhbSBhTWFuZGF0b3J5RmlsdGVyRmllbGRzXG4gKiBAcGFyYW0gb1NlbGVjdGlvblZhcmlhbnRcbiAqIEBwYXJhbSBvU2VsZWN0aW9uVmFyaWFudERlZmF1bHRzXG4gKi9cbmZ1bmN0aW9uIGFkZERlZmF1bHREaXNwbGF5Q3VycmVuY3koXG5cdGFNYW5kYXRvcnlGaWx0ZXJGaWVsZHM6IEV4cGFuZFBhdGhUeXBlPEVkbS5Qcm9wZXJ0eVBhdGg+W10sXG5cdG9TZWxlY3Rpb25WYXJpYW50OiBTZWxlY3Rpb25WYXJpYW50LFxuXHRvU2VsZWN0aW9uVmFyaWFudERlZmF1bHRzOiBTZWxlY3Rpb25WYXJpYW50XG4pIHtcblx0aWYgKG9TZWxlY3Rpb25WYXJpYW50ICYmIGFNYW5kYXRvcnlGaWx0ZXJGaWVsZHMgJiYgYU1hbmRhdG9yeUZpbHRlckZpZWxkcy5sZW5ndGgpIHtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFNYW5kYXRvcnlGaWx0ZXJGaWVsZHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNvbnN0IGFTVk9wdGlvbiA9IG9TZWxlY3Rpb25WYXJpYW50LmdldFNlbGVjdE9wdGlvbihcIkRpc3BsYXlDdXJyZW5jeVwiKSxcblx0XHRcdFx0YURlZmF1bHRTVk9wdGlvbiA9IG9TZWxlY3Rpb25WYXJpYW50RGVmYXVsdHMgJiYgb1NlbGVjdGlvblZhcmlhbnREZWZhdWx0cy5nZXRTZWxlY3RPcHRpb24oXCJEaXNwbGF5Q3VycmVuY3lcIik7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdGFNYW5kYXRvcnlGaWx0ZXJGaWVsZHNbaV0uJFByb3BlcnR5UGF0aCA9PT0gXCJEaXNwbGF5Q3VycmVuY3lcIiAmJlxuXHRcdFx0XHQoIWFTVk9wdGlvbiB8fCAhYVNWT3B0aW9uLmxlbmd0aCkgJiZcblx0XHRcdFx0YURlZmF1bHRTVk9wdGlvbiAmJlxuXHRcdFx0XHRhRGVmYXVsdFNWT3B0aW9uLmxlbmd0aFxuXHRcdFx0KSB7XG5cdFx0XHRcdGNvbnN0IGRpc3BsYXlDdXJyZW5jeVNlbGVjdE9wdGlvbiA9IGFEZWZhdWx0U1ZPcHRpb25bMF07XG5cdFx0XHRcdGNvbnN0IHNTaWduID0gZGlzcGxheUN1cnJlbmN5U2VsZWN0T3B0aW9uW1wiU2lnblwiXTtcblx0XHRcdFx0Y29uc3Qgc09wdGlvbiA9IGRpc3BsYXlDdXJyZW5jeVNlbGVjdE9wdGlvbltcIk9wdGlvblwiXTtcblx0XHRcdFx0Y29uc3Qgc0xvdyA9IGRpc3BsYXlDdXJyZW5jeVNlbGVjdE9wdGlvbltcIkxvd1wiXTtcblx0XHRcdFx0Y29uc3Qgc0hpZ2ggPSBkaXNwbGF5Q3VycmVuY3lTZWxlY3RPcHRpb25bXCJIaWdoXCJdO1xuXHRcdFx0XHRvU2VsZWN0aW9uVmFyaWFudC5hZGRTZWxlY3RPcHRpb24oXCJEaXNwbGF5Q3VycmVuY3lcIiwgc1NpZ24sIHNPcHRpb24sIHNMb3csIHNIaWdoKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxudHlwZSBVc2VyRGVmYXVsdFBhcmFtZXRlciA9IHtcblx0JE5hbWU6IHN0cmluZztcblx0Z2V0UGF0aD8oKTogc3RyaW5nO1xufTtcblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIHVzZXIgZGVmYXVsdHMgZnJvbSB0aGUgc3RhcnR1cCBhcHAgc3RhdGUgKGlmIGF2YWlsYWJsZSkgb3IgdGhlIHN0YXJ0dXAgcGFyYW1ldGVyIGFuZCBzZXRzIHRoZW0gdG8gYSBtb2RlbC5cbiAqXG4gKiBAcGFyYW0gb0FwcENvbXBvbmVudFxuICogQHBhcmFtIGFQYXJhbWV0ZXJzXG4gKiBAcGFyYW0gb01vZGVsXG4gKiBAcGFyYW0gYklzQWN0aW9uXG4gKiBAcGFyYW0gYklzQ3JlYXRlXG4gKiBAcGFyYW0gb0FjdGlvbkRlZmF1bHRWYWx1ZXNcbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2V0VXNlckRlZmF1bHRzKFxuXHRvQXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdGFQYXJhbWV0ZXJzOiBVc2VyRGVmYXVsdFBhcmFtZXRlcltdLFxuXHRvTW9kZWw6IEpTT05Nb2RlbCB8IE9EYXRhVjRDb250ZXh0LFxuXHRiSXNBY3Rpb246IGJvb2xlYW4sXG5cdGJJc0NyZWF0ZT86IGJvb2xlYW4sXG5cdG9BY3Rpb25EZWZhdWx0VmFsdWVzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPlxuKTogUHJvbWlzZTx2b2lkPiB7XG5cdGNvbnN0IG9Db21wb25lbnREYXRhID0gb0FwcENvbXBvbmVudC5nZXRDb21wb25lbnREYXRhKCksXG5cdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzID0gKG9Db21wb25lbnREYXRhICYmIG9Db21wb25lbnREYXRhLnN0YXJ0dXBQYXJhbWV0ZXJzKSB8fCB7fSxcblx0XHRvU2hlbGxTZXJ2aWNlcyA9IG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpO1xuXHRjb25zdCBvU3RhcnR1cEFwcFN0YXRlID0gYXdhaXQgb1NoZWxsU2VydmljZXMuZ2V0U3RhcnR1cEFwcFN0YXRlKG9BcHBDb21wb25lbnQpO1xuXHRjb25zdCBvRGF0YSA9IG9TdGFydHVwQXBwU3RhdGU/LmdldERhdGEoKSB8fCB7fSxcblx0XHRhRXh0ZW5kZWRQYXJhbWV0ZXJzID0gKG9EYXRhLnNlbGVjdGlvblZhcmlhbnQgJiYgb0RhdGEuc2VsZWN0aW9uVmFyaWFudC5TZWxlY3RPcHRpb25zKSB8fCBbXTtcblx0YVBhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbiAob1BhcmFtZXRlcikge1xuXHRcdGNvbnN0IHNQcm9wZXJ0eU5hbWUgPSBiSXNBY3Rpb25cblx0XHRcdD8gYC8ke29QYXJhbWV0ZXIuJE5hbWV9YFxuXHRcdFx0OiAob1BhcmFtZXRlci5nZXRQYXRoPy4oKS5zbGljZShvUGFyYW1ldGVyLmdldFBhdGgoKS5sYXN0SW5kZXhPZihcIi9cIikgKyAxKSBhcyBzdHJpbmcpO1xuXHRcdGNvbnN0IHNQYXJhbWV0ZXJOYW1lID0gYklzQWN0aW9uID8gc1Byb3BlcnR5TmFtZS5zbGljZSgxKSA6IHNQcm9wZXJ0eU5hbWU7XG5cdFx0aWYgKG9BY3Rpb25EZWZhdWx0VmFsdWVzICYmIGJJc0NyZWF0ZSkge1xuXHRcdFx0aWYgKG9BY3Rpb25EZWZhdWx0VmFsdWVzW3NQYXJhbWV0ZXJOYW1lXSkge1xuXHRcdFx0XHRvTW9kZWwuc2V0UHJvcGVydHkoc1Byb3BlcnR5TmFtZSwgb0FjdGlvbkRlZmF1bHRWYWx1ZXNbc1BhcmFtZXRlck5hbWVdKTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKG9TdGFydHVwUGFyYW1ldGVyc1tzUGFyYW1ldGVyTmFtZV0pIHtcblx0XHRcdG9Nb2RlbC5zZXRQcm9wZXJ0eShzUHJvcGVydHlOYW1lLCBvU3RhcnR1cFBhcmFtZXRlcnNbc1BhcmFtZXRlck5hbWVdWzBdKTtcblx0XHR9IGVsc2UgaWYgKGFFeHRlbmRlZFBhcmFtZXRlcnMubGVuZ3RoID4gMCkge1xuXHRcdFx0Zm9yIChjb25zdCBvRXh0ZW5kZWRQYXJhbWV0ZXIgb2YgYUV4dGVuZGVkUGFyYW1ldGVycykge1xuXHRcdFx0XHRpZiAob0V4dGVuZGVkUGFyYW1ldGVyLlByb3BlcnR5TmFtZSA9PT0gc1BhcmFtZXRlck5hbWUpIHtcblx0XHRcdFx0XHRjb25zdCBvUmFuZ2UgPSBvRXh0ZW5kZWRQYXJhbWV0ZXIuUmFuZ2VzLmxlbmd0aFxuXHRcdFx0XHRcdFx0PyBvRXh0ZW5kZWRQYXJhbWV0ZXIuUmFuZ2VzW29FeHRlbmRlZFBhcmFtZXRlci5SYW5nZXMubGVuZ3RoIC0gMV1cblx0XHRcdFx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdFx0XHRcdGlmIChvUmFuZ2UgJiYgb1JhbmdlLlNpZ24gPT09IFwiSVwiICYmIG9SYW5nZS5PcHRpb24gPT09IFwiRVFcIikge1xuXHRcdFx0XHRcdFx0b01vZGVsLnNldFByb3BlcnR5KHNQcm9wZXJ0eU5hbWUsIG9SYW5nZS5Mb3cpOyAvLyBoaWdoIGlzIGlnbm9yZWQgd2hlbiBPcHRpb249RVFcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufVxuXG5leHBvcnQgdHlwZSBJbmJvdW5kUGFyYW1ldGVyID0ge1xuXHR1c2VGb3JDcmVhdGU6IGJvb2xlYW47XG59O1xuZnVuY3Rpb24gZ2V0QWRkaXRpb25hbFBhcmFtc0ZvckNyZWF0ZShcblx0b1N0YXJ0dXBQYXJhbWV0ZXJzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duW10+LFxuXHRvSW5ib3VuZFBhcmFtZXRlcnM/OiBSZWNvcmQ8c3RyaW5nLCBJbmJvdW5kUGFyYW1ldGVyPlxuKSB7XG5cdGNvbnN0IG9JbmJvdW5kcyA9IG9JbmJvdW5kUGFyYW1ldGVycyxcblx0XHRhQ3JlYXRlUGFyYW1ldGVycyA9XG5cdFx0XHRvSW5ib3VuZHMgIT09IHVuZGVmaW5lZFxuXHRcdFx0XHQ/IE9iamVjdC5rZXlzKG9JbmJvdW5kcykuZmlsdGVyKGZ1bmN0aW9uIChzUGFyYW1ldGVyOiBzdHJpbmcpIHtcblx0XHRcdFx0XHRcdHJldHVybiBvSW5ib3VuZHNbc1BhcmFtZXRlcl0udXNlRm9yQ3JlYXRlO1xuXHRcdFx0XHQgIH0pXG5cdFx0XHRcdDogW107XG5cdGxldCBvUmV0O1xuXHRmb3IgKGxldCBpID0gMDsgaSA8IGFDcmVhdGVQYXJhbWV0ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y29uc3Qgc0NyZWF0ZVBhcmFtZXRlciA9IGFDcmVhdGVQYXJhbWV0ZXJzW2ldO1xuXHRcdGNvbnN0IGFWYWx1ZXMgPSBvU3RhcnR1cFBhcmFtZXRlcnMgJiYgb1N0YXJ0dXBQYXJhbWV0ZXJzW3NDcmVhdGVQYXJhbWV0ZXJdO1xuXHRcdGlmIChhVmFsdWVzICYmIGFWYWx1ZXMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRvUmV0ID0gb1JldCB8fCBPYmplY3QuY3JlYXRlKG51bGwpO1xuXHRcdFx0b1JldFtzQ3JlYXRlUGFyYW1ldGVyXSA9IGFWYWx1ZXNbMF07XG5cdFx0fVxuXHR9XG5cdHJldHVybiBvUmV0O1xufVxudHlwZSBPdXRib3VuZFBhcmFtZXRlciA9IHtcblx0cGFyYW1ldGVyczogUmVjb3JkPHN0cmluZywgT3V0Ym91bmRQYXJhbWV0ZXJWYWx1ZT47XG5cdHNlbWFudGljT2JqZWN0Pzogc3RyaW5nO1xuXHRhY3Rpb24/OiBzdHJpbmc7XG59O1xudHlwZSBPdXRib3VuZFBhcmFtZXRlclZhbHVlID0ge1xuXHR2YWx1ZT86IHtcblx0XHR2YWx1ZT86IHN0cmluZztcblx0XHRmb3JtYXQ/OiBzdHJpbmc7XG5cdH07XG59O1xuZnVuY3Rpb24gZ2V0U2VtYW50aWNPYmplY3RNYXBwaW5nKG9PdXRib3VuZDogT3V0Ym91bmRQYXJhbWV0ZXIpIHtcblx0Y29uc3QgYVNlbWFudGljT2JqZWN0TWFwcGluZzogTWV0YU1vZGVsVHlwZTxTZW1hbnRpY09iamVjdE1hcHBpbmdUeXBlPltdID0gW107XG5cdGlmIChvT3V0Ym91bmQucGFyYW1ldGVycykge1xuXHRcdGNvbnN0IGFQYXJhbWV0ZXJzID0gT2JqZWN0LmtleXMob091dGJvdW5kLnBhcmFtZXRlcnMpIHx8IFtdO1xuXHRcdGlmIChhUGFyYW1ldGVycy5sZW5ndGggPiAwKSB7XG5cdFx0XHRhUGFyYW1ldGVycy5mb3JFYWNoKGZ1bmN0aW9uIChzUGFyYW06IHN0cmluZykge1xuXHRcdFx0XHRjb25zdCBvTWFwcGluZyA9IG9PdXRib3VuZC5wYXJhbWV0ZXJzW3NQYXJhbV07XG5cdFx0XHRcdGlmIChvTWFwcGluZy52YWx1ZSAmJiBvTWFwcGluZy52YWx1ZS52YWx1ZSAmJiBvTWFwcGluZy52YWx1ZS5mb3JtYXQgPT09IFwiYmluZGluZ1wiKSB7XG5cdFx0XHRcdFx0Ly8gdXNpbmcgdGhlIGZvcm1hdCBvZiBVSS5NYXBwaW5nXG5cdFx0XHRcdFx0Y29uc3Qgb1NlbWFudGljTWFwcGluZyA9IHtcblx0XHRcdFx0XHRcdExvY2FsUHJvcGVydHk6IHtcblx0XHRcdFx0XHRcdFx0JFByb3BlcnR5UGF0aDogb01hcHBpbmcudmFsdWUudmFsdWVcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRTZW1hbnRpY09iamVjdFByb3BlcnR5OiBzUGFyYW1cblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0aWYgKGFTZW1hbnRpY09iamVjdE1hcHBpbmcubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0Ly8gVG8gY2hlY2sgaWYgdGhlIHNlbWFudGljT2JqZWN0IE1hcHBpbmcgaXMgZG9uZSBmb3IgdGhlIHNhbWUgbG9jYWwgcHJvcGVydHkgbW9yZSB0aGF0IG9uY2UgdGhlbiBmaXJzdCBvbmUgd2lsbCBiZSBjb25zaWRlcmVkXG5cdFx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFTZW1hbnRpY09iamVjdE1hcHBpbmcubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0aWYgKGFTZW1hbnRpY09iamVjdE1hcHBpbmdbaV0uTG9jYWxQcm9wZXJ0eT8uJFByb3BlcnR5UGF0aCAhPT0gb1NlbWFudGljTWFwcGluZy5Mb2NhbFByb3BlcnR5LiRQcm9wZXJ0eVBhdGgpIHtcblx0XHRcdFx0XHRcdFx0XHRhU2VtYW50aWNPYmplY3RNYXBwaW5nLnB1c2gob1NlbWFudGljTWFwcGluZyk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0YVNlbWFudGljT2JqZWN0TWFwcGluZy5wdXNoKG9TZW1hbnRpY01hcHBpbmcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBhU2VtYW50aWNPYmplY3RNYXBwaW5nO1xufVxuXG5mdW5jdGlvbiBnZXRIZWFkZXJGYWNldEl0ZW1Db25maWdGb3JFeHRlcm5hbE5hdmlnYXRpb24ob1ZpZXdEYXRhOiBWaWV3RGF0YSwgb0Nyb3NzTmF2OiBSZWNvcmQ8c3RyaW5nLCBPdXRib3VuZFBhcmFtZXRlcj4pIHtcblx0Y29uc3Qgb0hlYWRlckZhY2V0SXRlbXM6IFJlY29yZDxcblx0XHRzdHJpbmcsXG5cdFx0e1xuXHRcdFx0c2VtYW50aWNPYmplY3Q6IHN0cmluZztcblx0XHRcdGFjdGlvbjogc3RyaW5nO1xuXHRcdFx0c2VtYW50aWNPYmplY3RNYXBwaW5nOiBNZXRhTW9kZWxUeXBlPFNlbWFudGljT2JqZWN0TWFwcGluZ1R5cGU+W107XG5cdFx0fVxuXHQ+ID0ge307XG5cdGxldCBzSWQ7XG5cdGNvbnN0IG9Db250cm9sQ29uZmlnID0gb1ZpZXdEYXRhLmNvbnRyb2xDb25maWd1cmF0aW9uIGFzIFJlY29yZDxcblx0XHRzdHJpbmcsXG5cdFx0e1xuXHRcdFx0bmF2aWdhdGlvbj86IHtcblx0XHRcdFx0dGFyZ2V0T3V0Ym91bmQ/OiB7XG5cdFx0XHRcdFx0b3V0Ym91bmQ6IHN0cmluZztcblx0XHRcdFx0fTtcblx0XHRcdH07XG5cdFx0fVxuXHQ+O1xuXHRmb3IgKGNvbnN0IGNvbmZpZyBpbiBvQ29udHJvbENvbmZpZykge1xuXHRcdGlmIChjb25maWcuaW5kZXhPZihcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhUG9pbnRcIikgPiAtMSB8fCBjb25maWcuaW5kZXhPZihcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFwiKSA+IC0xKSB7XG5cdFx0XHRjb25zdCBzT3V0Ym91bmQgPSBvQ29udHJvbENvbmZpZ1tjb25maWddLm5hdmlnYXRpb24/LnRhcmdldE91dGJvdW5kPy5vdXRib3VuZDtcblx0XHRcdGlmIChzT3V0Ym91bmQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRjb25zdCBvT3V0Ym91bmQgPSBvQ3Jvc3NOYXZbc091dGJvdW5kXTtcblx0XHRcdFx0aWYgKG9PdXRib3VuZC5zZW1hbnRpY09iamVjdCAmJiBvT3V0Ym91bmQuYWN0aW9uKSB7XG5cdFx0XHRcdFx0aWYgKGNvbmZpZy5pbmRleE9mKFwiQ2hhcnRcIikgPiAtMSkge1xuXHRcdFx0XHRcdFx0c0lkID0gZ2VuZXJhdGUoW1wiZmVcIiwgXCJNaWNyb0NoYXJ0TGlua1wiLCBjb25maWddKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c0lkID0gZ2VuZXJhdGUoW1wiZmVcIiwgXCJIZWFkZXJEUExpbmtcIiwgY29uZmlnXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IGFTZW1hbnRpY09iamVjdE1hcHBpbmcgPSBDb21tb25VdGlscy5nZXRTZW1hbnRpY09iamVjdE1hcHBpbmcob091dGJvdW5kKTtcblx0XHRcdFx0XHRvSGVhZGVyRmFjZXRJdGVtc1tzSWRdID0ge1xuXHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IG9PdXRib3VuZC5zZW1hbnRpY09iamVjdCxcblx0XHRcdFx0XHRcdGFjdGlvbjogb091dGJvdW5kLmFjdGlvbixcblx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0TWFwcGluZzogYVNlbWFudGljT2JqZWN0TWFwcGluZ1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKGBDcm9zcyBuYXZpZ2F0aW9uIG91dGJvdW5kIGlzIGNvbmZpZ3VyZWQgd2l0aG91dCBzZW1hbnRpYyBvYmplY3QgYW5kIGFjdGlvbiBmb3IgJHtzT3V0Ym91bmR9YCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIG9IZWFkZXJGYWNldEl0ZW1zO1xufVxuXG5mdW5jdGlvbiBzZXRTZW1hbnRpY09iamVjdE1hcHBpbmdzKG9TZWxlY3Rpb25WYXJpYW50OiBTZWxlY3Rpb25WYXJpYW50LCB2TWFwcGluZ3M6IHVua25vd24pIHtcblx0Y29uc3Qgb01hcHBpbmdzID0gdHlwZW9mIHZNYXBwaW5ncyA9PT0gXCJzdHJpbmdcIiA/IEpTT04ucGFyc2Uodk1hcHBpbmdzKSA6IHZNYXBwaW5ncztcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBvTWFwcGluZ3MubGVuZ3RoOyBpKyspIHtcblx0XHRjb25zdCBzTG9jYWxQcm9wZXJ0eSA9XG5cdFx0XHQob01hcHBpbmdzW2ldW1wiTG9jYWxQcm9wZXJ0eVwiXSAmJiBvTWFwcGluZ3NbaV1bXCJMb2NhbFByb3BlcnR5XCJdW1wiJFByb3BlcnR5UGF0aFwiXSkgfHxcblx0XHRcdChvTWFwcGluZ3NbaV1bXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxvY2FsUHJvcGVydHlcIl0gJiZcblx0XHRcdFx0b01hcHBpbmdzW2ldW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Mb2NhbFByb3BlcnR5XCJdW1wiJFBhdGhcIl0pO1xuXHRcdGNvbnN0IHNTZW1hbnRpY09iamVjdFByb3BlcnR5ID1cblx0XHRcdG9NYXBwaW5nc1tpXVtcIlNlbWFudGljT2JqZWN0UHJvcGVydHlcIl0gfHwgb01hcHBpbmdzW2ldW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdFByb3BlcnR5XCJdO1xuXHRcdGNvbnN0IG9TZWxlY3RPcHRpb24gPSBvU2VsZWN0aW9uVmFyaWFudC5nZXRTZWxlY3RPcHRpb24oc0xvY2FsUHJvcGVydHkpO1xuXHRcdGlmIChvU2VsZWN0T3B0aW9uKSB7XG5cdFx0XHQvL0NyZWF0ZSBhIG5ldyBTZWxlY3RPcHRpb24gd2l0aCBzU2VtYW50aWNPYmplY3RQcm9wZXJ0eSBhcyB0aGUgcHJvcGVydHkgTmFtZSBhbmQgcmVtb3ZlIHRoZSBvbGRlciBvbmVcblx0XHRcdG9TZWxlY3Rpb25WYXJpYW50LnJlbW92ZVNlbGVjdE9wdGlvbihzTG9jYWxQcm9wZXJ0eSk7XG5cdFx0XHRvU2VsZWN0aW9uVmFyaWFudC5tYXNzQWRkU2VsZWN0T3B0aW9uKHNTZW1hbnRpY09iamVjdFByb3BlcnR5LCBvU2VsZWN0T3B0aW9uKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG9TZWxlY3Rpb25WYXJpYW50O1xufVxuXG50eXBlIFNlbWFudGljT2JqZWN0RnJvbVBhdGggPSB7XG5cdHNlbWFudGljT2JqZWN0UGF0aDogc3RyaW5nO1xuXHRzZW1hbnRpY09iamVjdEZvckdldExpbmtzOiB7IHNlbWFudGljT2JqZWN0OiBzdHJpbmcgfVtdO1xuXHRzZW1hbnRpY09iamVjdDoge1xuXHRcdHNlbWFudGljT2JqZWN0OiB7ICRQYXRoOiBzdHJpbmcgfTtcblx0fTtcblx0dW5hdmFpbGFibGVBY3Rpb25zOiBzdHJpbmdbXTtcbn07XG5hc3luYyBmdW5jdGlvbiBmbkdldFNlbWFudGljT2JqZWN0c0Zyb21QYXRoKG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLCBzUGF0aDogc3RyaW5nLCBzUXVhbGlmaWVyOiBzdHJpbmcpIHtcblx0cmV0dXJuIG5ldyBQcm9taXNlPFNlbWFudGljT2JqZWN0RnJvbVBhdGg+KGZ1bmN0aW9uIChyZXNvbHZlKSB7XG5cdFx0bGV0IHNTZW1hbnRpY09iamVjdCwgYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zO1xuXHRcdGlmIChzUXVhbGlmaWVyID09PSBcIlwiKSB7XG5cdFx0XHRzU2VtYW50aWNPYmplY3QgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzUGF0aH1AJHtDb21tb25Bbm5vdGF0aW9uVGVybXMuU2VtYW50aWNPYmplY3R9YCk7XG5cdFx0XHRhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzUGF0aH1AJHtDb21tb25Bbm5vdGF0aW9uVGVybXMuU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnN9YCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNTZW1hbnRpY09iamVjdCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NQYXRofUAke0NvbW1vbkFubm90YXRpb25UZXJtcy5TZW1hbnRpY09iamVjdH0jJHtzUXVhbGlmaWVyfWApO1xuXHRcdFx0YVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zID0gb01ldGFNb2RlbC5nZXRPYmplY3QoXG5cdFx0XHRcdGAke3NQYXRofUAke0NvbW1vbkFubm90YXRpb25UZXJtcy5TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc30jJHtzUXVhbGlmaWVyfWBcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgYVNlbWFudGljT2JqZWN0Rm9yR2V0TGlua3MgPSBbeyBzZW1hbnRpY09iamVjdDogc1NlbWFudGljT2JqZWN0IH1dO1xuXHRcdGNvbnN0IG9TZW1hbnRpY09iamVjdCA9IHtcblx0XHRcdHNlbWFudGljT2JqZWN0OiBzU2VtYW50aWNPYmplY3Rcblx0XHR9O1xuXHRcdHJlc29sdmUoe1xuXHRcdFx0c2VtYW50aWNPYmplY3RQYXRoOiBzUGF0aCxcblx0XHRcdHNlbWFudGljT2JqZWN0Rm9yR2V0TGlua3M6IGFTZW1hbnRpY09iamVjdEZvckdldExpbmtzLFxuXHRcdFx0c2VtYW50aWNPYmplY3Q6IG9TZW1hbnRpY09iamVjdCxcblx0XHRcdHVuYXZhaWxhYmxlQWN0aW9uczogYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zXG5cdFx0fSk7XG5cdH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBmblVwZGF0ZVNlbWFudGljVGFyZ2V0c01vZGVsKFxuXHRhR2V0TGlua3NQcm9taXNlczogUHJvbWlzZTxMaW5rRGVmaW5pdGlvbltdW11bXT5bXSxcblx0YVNlbWFudGljT2JqZWN0czogU2VtYW50aWNPYmplY3RbXSxcblx0b0ludGVybmFsTW9kZWxDb250ZXh0OiBJbnRlcm5hbE1vZGVsQ29udGV4dCxcblx0c0N1cnJlbnRIYXNoOiBzdHJpbmdcbikge1xuXHR0eXBlIFNlbWFudGljT2JqZWN0SW5mbyA9IHsgc2VtYW50aWNPYmplY3Q6IHN0cmluZzsgcGF0aDogc3RyaW5nOyBIYXNUYXJnZXRzOiBib29sZWFuOyBIYXNUYXJnZXRzTm90RmlsdGVyZWQ6IGJvb2xlYW4gfTtcblx0cmV0dXJuIFByb21pc2UuYWxsKGFHZXRMaW5rc1Byb21pc2VzKVxuXHRcdC50aGVuKGZ1bmN0aW9uIChhVmFsdWVzKSB7XG5cdFx0XHRsZXQgYUxpbmtzOiBMaW5rRGVmaW5pdGlvbltdW11bXSxcblx0XHRcdFx0X29MaW5rLFxuXHRcdFx0XHRfc0xpbmtJbnRlbnRBY3Rpb24sXG5cdFx0XHRcdGFGaW5hbExpbmtzOiBMaW5rRGVmaW5pdGlvbltdW10gPSBbXTtcblx0XHRcdGxldCBvRmluYWxTZW1hbnRpY09iamVjdHM6IFJlY29yZDxzdHJpbmcsIFNlbWFudGljT2JqZWN0SW5mbz4gPSB7fTtcblx0XHRcdGNvbnN0IGJJbnRlbnRIYXNBY3Rpb25zID0gZnVuY3Rpb24gKHNJbnRlbnQ6IHN0cmluZywgYUFjdGlvbnM/OiB1bmtub3duW10pIHtcblx0XHRcdFx0Zm9yIChjb25zdCBpbnRlbnQgaW4gYUFjdGlvbnMpIHtcblx0XHRcdFx0XHRpZiAoaW50ZW50ID09PSBzSW50ZW50KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0Zm9yIChsZXQgayA9IDA7IGsgPCBhVmFsdWVzLmxlbmd0aDsgaysrKSB7XG5cdFx0XHRcdGFMaW5rcyA9IGFWYWx1ZXNba107XG5cdFx0XHRcdGlmIChhTGlua3MgJiYgYUxpbmtzLmxlbmd0aCA+IDAgJiYgYUxpbmtzWzBdICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRjb25zdCBvU2VtYW50aWNPYmplY3Q6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIFNlbWFudGljT2JqZWN0SW5mbz4+ID0ge307XG5cdFx0XHRcdFx0bGV0IG9UbXA6IFNlbWFudGljT2JqZWN0SW5mbztcblx0XHRcdFx0XHRsZXQgc0FsdGVybmF0ZVBhdGg7XG5cdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhTGlua3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdGFGaW5hbExpbmtzLnB1c2goW10pO1xuXHRcdFx0XHRcdFx0bGV0IGhhc1RhcmdldHNOb3RGaWx0ZXJlZCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0bGV0IGhhc1RhcmdldHMgPSBmYWxzZTtcblx0XHRcdFx0XHRcdGZvciAobGV0IGlMaW5rQ291bnQgPSAwOyBpTGlua0NvdW50IDwgYUxpbmtzW2ldWzBdLmxlbmd0aDsgaUxpbmtDb3VudCsrKSB7XG5cdFx0XHRcdFx0XHRcdF9vTGluayA9IGFMaW5rc1tpXVswXVtpTGlua0NvdW50XTtcblx0XHRcdFx0XHRcdFx0X3NMaW5rSW50ZW50QWN0aW9uID0gX29MaW5rICYmIF9vTGluay5pbnRlbnQuc3BsaXQoXCI/XCIpWzBdLnNwbGl0KFwiLVwiKVsxXTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoIShfb0xpbmsgJiYgX29MaW5rLmludGVudCAmJiBfb0xpbmsuaW50ZW50LmluZGV4T2Yoc0N1cnJlbnRIYXNoKSA9PT0gMCkpIHtcblx0XHRcdFx0XHRcdFx0XHRoYXNUYXJnZXRzTm90RmlsdGVyZWQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdGlmICghYkludGVudEhhc0FjdGlvbnMoX3NMaW5rSW50ZW50QWN0aW9uLCBhU2VtYW50aWNPYmplY3RzW2tdLnVuYXZhaWxhYmxlQWN0aW9ucykpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGFGaW5hbExpbmtzW2ldLnB1c2goX29MaW5rKTtcblx0XHRcdFx0XHRcdFx0XHRcdGhhc1RhcmdldHMgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0b1RtcCA9IHtcblx0XHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IGFTZW1hbnRpY09iamVjdHNba10uc2VtYW50aWNPYmplY3QsXG5cdFx0XHRcdFx0XHRcdHBhdGg6IGFTZW1hbnRpY09iamVjdHNba10ucGF0aCxcblx0XHRcdFx0XHRcdFx0SGFzVGFyZ2V0czogaGFzVGFyZ2V0cyxcblx0XHRcdFx0XHRcdFx0SGFzVGFyZ2V0c05vdEZpbHRlcmVkOiBoYXNUYXJnZXRzTm90RmlsdGVyZWRcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRpZiAob1NlbWFudGljT2JqZWN0W2FTZW1hbnRpY09iamVjdHNba10uc2VtYW50aWNPYmplY3RdID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdFx0b1NlbWFudGljT2JqZWN0W2FTZW1hbnRpY09iamVjdHNba10uc2VtYW50aWNPYmplY3RdID0ge307XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRzQWx0ZXJuYXRlUGF0aCA9IGFTZW1hbnRpY09iamVjdHNba10ucGF0aC5yZXBsYWNlKC9cXC8vZywgXCJfXCIpO1xuXHRcdFx0XHRcdFx0aWYgKG9TZW1hbnRpY09iamVjdFthU2VtYW50aWNPYmplY3RzW2tdLnNlbWFudGljT2JqZWN0XVtzQWx0ZXJuYXRlUGF0aF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHRvU2VtYW50aWNPYmplY3RbYVNlbWFudGljT2JqZWN0c1trXS5zZW1hbnRpY09iamVjdF1bc0FsdGVybmF0ZVBhdGhdID0ge30gYXMgU2VtYW50aWNPYmplY3RJbmZvO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0b1NlbWFudGljT2JqZWN0W2FTZW1hbnRpY09iamVjdHNba10uc2VtYW50aWNPYmplY3RdW3NBbHRlcm5hdGVQYXRoXSA9IE9iamVjdC5hc3NpZ24oXG5cdFx0XHRcdFx0XHRcdG9TZW1hbnRpY09iamVjdFthU2VtYW50aWNPYmplY3RzW2tdLnNlbWFudGljT2JqZWN0XVtzQWx0ZXJuYXRlUGF0aF0sXG5cdFx0XHRcdFx0XHRcdG9UbXBcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IHNTZW1hbnRpY09iamVjdE5hbWUgPSBPYmplY3Qua2V5cyhvU2VtYW50aWNPYmplY3QpWzBdO1xuXHRcdFx0XHRcdGlmIChPYmplY3Qua2V5cyhvRmluYWxTZW1hbnRpY09iamVjdHMpLmluY2x1ZGVzKHNTZW1hbnRpY09iamVjdE5hbWUpKSB7XG5cdFx0XHRcdFx0XHRvRmluYWxTZW1hbnRpY09iamVjdHNbc1NlbWFudGljT2JqZWN0TmFtZV0gPSBPYmplY3QuYXNzaWduKFxuXHRcdFx0XHRcdFx0XHRvRmluYWxTZW1hbnRpY09iamVjdHNbc1NlbWFudGljT2JqZWN0TmFtZV0sXG5cdFx0XHRcdFx0XHRcdG9TZW1hbnRpY09iamVjdFtzU2VtYW50aWNPYmplY3ROYW1lXVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0b0ZpbmFsU2VtYW50aWNPYmplY3RzID0gT2JqZWN0LmFzc2lnbihvRmluYWxTZW1hbnRpY09iamVjdHMsIG9TZW1hbnRpY09iamVjdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGFGaW5hbExpbmtzID0gW107XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChPYmplY3Qua2V5cyhvRmluYWxTZW1hbnRpY09iamVjdHMpLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFxuXHRcdFx0XHRcdFwic2VtYW50aWNzVGFyZ2V0c1wiLFxuXHRcdFx0XHRcdG1lcmdlT2JqZWN0cyhvRmluYWxTZW1hbnRpY09iamVjdHMsIG9JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShcInNlbWFudGljc1RhcmdldHNcIikpXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBvRmluYWxTZW1hbnRpY09iamVjdHM7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm47XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogdW5rbm93bikge1xuXHRcdFx0TG9nLmVycm9yKFwiZm5VcGRhdGVTZW1hbnRpY1RhcmdldHNNb2RlbDogQ2Fubm90IHJlYWQgbGlua3NcIiwgb0Vycm9yIGFzIHN0cmluZyk7XG5cdFx0fSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGZuR2V0U2VtYW50aWNPYmplY3RQcm9taXNlKFxuXHRvQXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdG9WaWV3OiBWaWV3LFxuXHRvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCxcblx0c1BhdGg6IHN0cmluZyxcblx0c1F1YWxpZmllcjogc3RyaW5nXG4pIHtcblx0cmV0dXJuIENvbW1vblV0aWxzLmdldFNlbWFudGljT2JqZWN0c0Zyb21QYXRoKG9NZXRhTW9kZWwsIHNQYXRoLCBzUXVhbGlmaWVyKTtcbn1cblxuZnVuY3Rpb24gZm5QcmVwYXJlU2VtYW50aWNPYmplY3RzUHJvbWlzZXMoXG5cdF9vQXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdF9vVmlldzogVmlldyxcblx0X29NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLFxuXHRfYVNlbWFudGljT2JqZWN0c0ZvdW5kOiBzdHJpbmdbXSxcblx0X2FTZW1hbnRpY09iamVjdHNQcm9taXNlczogUHJvbWlzZTxTZW1hbnRpY09iamVjdEZyb21QYXRoPltdXG4pIHtcblx0bGV0IF9LZXlzOiBzdHJpbmdbXSwgc1BhdGg7XG5cdGxldCBzUXVhbGlmaWVyOiBzdHJpbmcsIHJlZ2V4UmVzdWx0O1xuXHRmb3IgKGxldCBpID0gMDsgaSA8IF9hU2VtYW50aWNPYmplY3RzRm91bmQubGVuZ3RoOyBpKyspIHtcblx0XHRzUGF0aCA9IF9hU2VtYW50aWNPYmplY3RzRm91bmRbaV07XG5cdFx0X0tleXMgPSBPYmplY3Qua2V5cyhfb01ldGFNb2RlbC5nZXRPYmplY3Qoc1BhdGggKyBcIkBcIikpO1xuXHRcdGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfS2V5cy5sZW5ndGg7IGluZGV4KyspIHtcblx0XHRcdGlmIChcblx0XHRcdFx0X0tleXNbaW5kZXhdLmluZGV4T2YoYEAke0NvbW1vbkFubm90YXRpb25UZXJtcy5TZW1hbnRpY09iamVjdH1gKSA9PT0gMCAmJlxuXHRcdFx0XHRfS2V5c1tpbmRleF0uaW5kZXhPZihgQCR7Q29tbW9uQW5ub3RhdGlvblRlcm1zLlNlbWFudGljT2JqZWN0TWFwcGluZ31gKSA9PT0gLTEgJiZcblx0XHRcdFx0X0tleXNbaW5kZXhdLmluZGV4T2YoYEAke0NvbW1vbkFubm90YXRpb25UZXJtcy5TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc31gKSA9PT0gLTFcblx0XHRcdCkge1xuXHRcdFx0XHRyZWdleFJlc3VsdCA9IC8jKC4qKS8uZXhlYyhfS2V5c1tpbmRleF0pO1xuXHRcdFx0XHRzUXVhbGlmaWVyID0gcmVnZXhSZXN1bHQgPyByZWdleFJlc3VsdFsxXSA6IFwiXCI7XG5cdFx0XHRcdF9hU2VtYW50aWNPYmplY3RzUHJvbWlzZXMucHVzaChcblx0XHRcdFx0XHRDb21tb25VdGlscy5nZXRTZW1hbnRpY09iamVjdFByb21pc2UoX29BcHBDb21wb25lbnQsIF9vVmlldywgX29NZXRhTW9kZWwsIHNQYXRoLCBzUXVhbGlmaWVyKVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG50eXBlIEludGVybmFsSlNPTk1vZGVsID0ge1xuXHRfZ2V0T2JqZWN0KHZhbDogc3RyaW5nLCBjb250ZXh0PzogQ29udGV4dCk6IG9iamVjdDtcbn07XG5mdW5jdGlvbiBmbkdldFNlbWFudGljVGFyZ2V0c0Zyb21QYWdlTW9kZWwob0NvbnRyb2xsZXI6IFBhZ2VDb250cm9sbGVyLCBzUGFnZU1vZGVsOiBzdHJpbmcpIHtcblx0Y29uc3QgX2ZuZmluZFZhbHVlc0hlbHBlciA9IGZ1bmN0aW9uIChcblx0XHRvYmo6IHVuZGVmaW5lZCB8IG51bGwgfCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+W10gfCBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcblx0XHRrZXk6IHN0cmluZyxcblx0XHRsaXN0OiBzdHJpbmdbXVxuXHQpIHtcblx0XHRpZiAoIW9iaikge1xuXHRcdFx0cmV0dXJuIGxpc3Q7XG5cdFx0fVxuXHRcdGlmIChvYmogaW5zdGFuY2VvZiBBcnJheSkge1xuXHRcdFx0b2JqLmZvckVhY2goKGl0ZW0pID0+IHtcblx0XHRcdFx0bGlzdCA9IGxpc3QuY29uY2F0KF9mbmZpbmRWYWx1ZXNIZWxwZXIoaXRlbSwga2V5LCBbXSkpO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gbGlzdDtcblx0XHR9XG5cdFx0aWYgKG9ialtrZXldKSB7XG5cdFx0XHRsaXN0LnB1c2gob2JqW2tleV0gYXMgc3RyaW5nKTtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIG9iaiA9PSBcIm9iamVjdFwiICYmIG9iaiAhPT0gbnVsbCkge1xuXHRcdFx0Y29uc3QgY2hpbGRyZW4gPSBPYmplY3Qua2V5cyhvYmopO1xuXHRcdFx0aWYgKGNoaWxkcmVuLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGxpc3QgPSBsaXN0LmNvbmNhdChfZm5maW5kVmFsdWVzSGVscGVyKG9ialtjaGlsZHJlbltpXV0gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIGtleSwgW10pKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gbGlzdDtcblx0fTtcblx0Y29uc3QgX2ZuZmluZFZhbHVlcyA9IGZ1bmN0aW9uIChvYmo6IHVuZGVmaW5lZCB8IG51bGwgfCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+W10gfCBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwga2V5OiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gX2ZuZmluZFZhbHVlc0hlbHBlcihvYmosIGtleSwgW10pO1xuXHR9O1xuXHRjb25zdCBfZm5EZWxldGVEdXBsaWNhdGVTZW1hbnRpY09iamVjdHMgPSBmdW5jdGlvbiAoYVNlbWFudGljT2JqZWN0UGF0aDogc3RyaW5nW10pIHtcblx0XHRyZXR1cm4gYVNlbWFudGljT2JqZWN0UGF0aC5maWx0ZXIoZnVuY3Rpb24gKHZhbHVlOiBzdHJpbmcsIGluZGV4OiBudW1iZXIpIHtcblx0XHRcdHJldHVybiBhU2VtYW50aWNPYmplY3RQYXRoLmluZGV4T2YodmFsdWUpID09PSBpbmRleDtcblx0XHR9KTtcblx0fTtcblx0Y29uc3Qgb1ZpZXcgPSBvQ29udHJvbGxlci5nZXRWaWV3KCk7XG5cdGNvbnN0IG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cblx0aWYgKG9JbnRlcm5hbE1vZGVsQ29udGV4dCkge1xuXHRcdGNvbnN0IGFTZW1hbnRpY09iamVjdHNQcm9taXNlczogUHJvbWlzZTxTZW1hbnRpY09iamVjdEZyb21QYXRoPltdID0gW107XG5cdFx0Y29uc3Qgb0NvbXBvbmVudCA9IG9Db250cm9sbGVyLmdldE93bmVyQ29tcG9uZW50KCk7XG5cdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IENvbXBvbmVudC5nZXRPd25lckNvbXBvbmVudEZvcihvQ29tcG9uZW50KSBhcyBBcHBDb21wb25lbnQ7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9BcHBDb21wb25lbnQuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0bGV0IG9QYWdlTW9kZWwgPSAob0NvbXBvbmVudC5nZXRNb2RlbChzUGFnZU1vZGVsKSBhcyBKU09OTW9kZWwpLmdldERhdGEoKTtcblx0XHRpZiAoSlNPTi5zdHJpbmdpZnkob1BhZ2VNb2RlbCkgPT09IFwie31cIikge1xuXHRcdFx0b1BhZ2VNb2RlbCA9IChvQ29tcG9uZW50LmdldE1vZGVsKHNQYWdlTW9kZWwpIGFzIHVua25vd24gYXMgSW50ZXJuYWxKU09OTW9kZWwpLl9nZXRPYmplY3QoXCIvXCIsIHVuZGVmaW5lZCk7XG5cdFx0fVxuXHRcdGxldCBhU2VtYW50aWNPYmplY3RzRm91bmQgPSBfZm5maW5kVmFsdWVzKG9QYWdlTW9kZWwsIFwic2VtYW50aWNPYmplY3RQYXRoXCIpO1xuXHRcdGFTZW1hbnRpY09iamVjdHNGb3VuZCA9IF9mbkRlbGV0ZUR1cGxpY2F0ZVNlbWFudGljT2JqZWN0cyhhU2VtYW50aWNPYmplY3RzRm91bmQpO1xuXHRcdGNvbnN0IG9TaGVsbFNlcnZpY2VIZWxwZXIgPSBvQXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKTtcblx0XHRsZXQgc0N1cnJlbnRIYXNoID0gb1NoZWxsU2VydmljZUhlbHBlci5nZXRIYXNoKCk7XG5cdFx0Y29uc3QgYVNlbWFudGljT2JqZWN0c0ZvckdldExpbmtzID0gW107XG5cdFx0Y29uc3QgYVNlbWFudGljT2JqZWN0czogU2VtYW50aWNPYmplY3RbXSA9IFtdO1xuXHRcdGxldCBfb1NlbWFudGljT2JqZWN0O1xuXG5cdFx0aWYgKHNDdXJyZW50SGFzaCAmJiBzQ3VycmVudEhhc2guaW5kZXhPZihcIj9cIikgIT09IC0xKSB7XG5cdFx0XHQvLyBzQ3VycmVudEhhc2ggY2FuIGNvbnRhaW4gcXVlcnkgc3RyaW5nLCBjdXQgaXQgb2ZmIVxuXHRcdFx0c0N1cnJlbnRIYXNoID0gc0N1cnJlbnRIYXNoLnNwbGl0KFwiP1wiKVswXTtcblx0XHR9XG5cblx0XHRmblByZXBhcmVTZW1hbnRpY09iamVjdHNQcm9taXNlcyhvQXBwQ29tcG9uZW50LCBvVmlldywgb01ldGFNb2RlbCwgYVNlbWFudGljT2JqZWN0c0ZvdW5kLCBhU2VtYW50aWNPYmplY3RzUHJvbWlzZXMpO1xuXG5cdFx0aWYgKGFTZW1hbnRpY09iamVjdHNQcm9taXNlcy5sZW5ndGggPT09IDApIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0UHJvbWlzZS5hbGwoYVNlbWFudGljT2JqZWN0c1Byb21pc2VzKVxuXHRcdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoYVZhbHVlcykge1xuXHRcdFx0XHRcdGNvbnN0IGFHZXRMaW5rc1Byb21pc2VzID0gW107XG5cdFx0XHRcdFx0bGV0IHNTZW1PYmpFeHByZXNzaW9uO1xuXHRcdFx0XHRcdHR5cGUgU2VtYW50aWNPYmplY3RSZXNvbHZlZCA9IHtcblx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0UGF0aDogc3RyaW5nO1xuXHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3RGb3JHZXRMaW5rczogeyBzZW1hbnRpY09iamVjdDogc3RyaW5nIH1bXTtcblx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiB7XG5cdFx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBzdHJpbmc7XG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0dW5hdmFpbGFibGVBY3Rpb25zOiBzdHJpbmdbXTtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGNvbnN0IGFTZW1hbnRpY09iamVjdHNSZXNvbHZlZDogU2VtYW50aWNPYmplY3RSZXNvbHZlZFtdID0gYVZhbHVlcy5maWx0ZXIoZnVuY3Rpb24gKGVsZW1lbnQpIHtcblx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0ZWxlbWVudC5zZW1hbnRpY09iamVjdCAhPT0gdW5kZWZpbmVkICYmXG5cdFx0XHRcdFx0XHRcdGVsZW1lbnQuc2VtYW50aWNPYmplY3Quc2VtYW50aWNPYmplY3QgJiZcblx0XHRcdFx0XHRcdFx0dHlwZW9mIGVsZW1lbnQuc2VtYW50aWNPYmplY3Quc2VtYW50aWNPYmplY3QgPT09IFwib2JqZWN0XCJcblx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRzU2VtT2JqRXhwcmVzc2lvbiA9IGNvbXBpbGVFeHByZXNzaW9uKHBhdGhJbk1vZGVsKGVsZW1lbnQuc2VtYW50aWNPYmplY3Quc2VtYW50aWNPYmplY3QuJFBhdGgpKSE7XG5cdFx0XHRcdFx0XHRcdChlbGVtZW50IGFzIHVua25vd24gYXMgU2VtYW50aWNPYmplY3RSZXNvbHZlZCkuc2VtYW50aWNPYmplY3Quc2VtYW50aWNPYmplY3QgPSBzU2VtT2JqRXhwcmVzc2lvbjtcblx0XHRcdFx0XHRcdFx0ZWxlbWVudC5zZW1hbnRpY09iamVjdEZvckdldExpbmtzWzBdLnNlbWFudGljT2JqZWN0ID0gc1NlbU9iakV4cHJlc3Npb247XG5cdFx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChlbGVtZW50KSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBlbGVtZW50LnNlbWFudGljT2JqZWN0ICE9PSB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSkgYXMgdW5rbm93biBhcyBTZW1hbnRpY09iamVjdFJlc29sdmVkW107XG5cdFx0XHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBhU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHRcdF9vU2VtYW50aWNPYmplY3QgPSBhU2VtYW50aWNPYmplY3RzUmVzb2x2ZWRbal07XG5cdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdF9vU2VtYW50aWNPYmplY3QgJiZcblx0XHRcdFx0XHRcdFx0X29TZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdCAmJlxuXHRcdFx0XHRcdFx0XHQhKF9vU2VtYW50aWNPYmplY3Quc2VtYW50aWNPYmplY3Quc2VtYW50aWNPYmplY3QuaW5kZXhPZihcIntcIikgPT09IDApXG5cdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0YVNlbWFudGljT2JqZWN0c0ZvckdldExpbmtzLnB1c2goX29TZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdEZvckdldExpbmtzKTtcblx0XHRcdFx0XHRcdFx0YVNlbWFudGljT2JqZWN0cy5wdXNoKHtcblx0XHRcdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdDogX29TZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdCxcblx0XHRcdFx0XHRcdFx0XHR1bmF2YWlsYWJsZUFjdGlvbnM6IF9vU2VtYW50aWNPYmplY3QudW5hdmFpbGFibGVBY3Rpb25zLFxuXHRcdFx0XHRcdFx0XHRcdHBhdGg6IGFTZW1hbnRpY09iamVjdHNSZXNvbHZlZFtqXS5zZW1hbnRpY09iamVjdFBhdGhcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdGFHZXRMaW5rc1Byb21pc2VzLnB1c2gob1NoZWxsU2VydmljZUhlbHBlci5nZXRMaW5rc1dpdGhDYWNoZShbX29TZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdEZvckdldExpbmtzXSkpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gQ29tbW9uVXRpbHMudXBkYXRlU2VtYW50aWNUYXJnZXRzKGFHZXRMaW5rc1Byb21pc2VzLCBhU2VtYW50aWNPYmplY3RzLCBvSW50ZXJuYWxNb2RlbENvbnRleHQsIHNDdXJyZW50SGFzaCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiB1bmtub3duKSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKFwiZm5HZXRTZW1hbnRpY1RhcmdldHNGcm9tVGFibGU6IENhbm5vdCBnZXQgU2VtYW50aWMgT2JqZWN0c1wiLCBvRXJyb3IgYXMgc3RyaW5nKTtcblx0XHRcdFx0fSk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRGaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbihvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbj86IE1ldGFNb2RlbFR5cGU8RmlsdGVyUmVzdHJpY3Rpb25zVHlwZT4pIHtcblx0Y29uc3QgbUFsbG93ZWRFeHByZXNzaW9uczogX0ZpbHRlckFsbG93ZWRFeHByZXNzaW9ucyA9IHt9O1xuXHRpZiAob0ZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb24gJiYgb0ZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb24uRmlsdGVyRXhwcmVzc2lvblJlc3RyaWN0aW9ucyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0b0ZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb24uRmlsdGVyRXhwcmVzc2lvblJlc3RyaWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChvUHJvcGVydHkpIHtcblx0XHRcdGlmIChvUHJvcGVydHkuUHJvcGVydHkgJiYgb1Byb3BlcnR5LkFsbG93ZWRFeHByZXNzaW9ucyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdC8vU2luZ2xlVmFsdWUgfCBNdWx0aVZhbHVlIHwgU2luZ2xlUmFuZ2UgfCBNdWx0aVJhbmdlIHwgU2VhcmNoRXhwcmVzc2lvbiB8IE11bHRpUmFuZ2VPclNlYXJjaEV4cHJlc3Npb25cblx0XHRcdFx0aWYgKG1BbGxvd2VkRXhwcmVzc2lvbnNbb1Byb3BlcnR5LlByb3BlcnR5LiRQcm9wZXJ0eVBhdGhdICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRtQWxsb3dlZEV4cHJlc3Npb25zW29Qcm9wZXJ0eS5Qcm9wZXJ0eS4kUHJvcGVydHlQYXRoXS5wdXNoKG9Qcm9wZXJ0eS5BbGxvd2VkRXhwcmVzc2lvbnMgYXMgc3RyaW5nKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRtQWxsb3dlZEV4cHJlc3Npb25zW29Qcm9wZXJ0eS5Qcm9wZXJ0eS4kUHJvcGVydHlQYXRoXSA9IFtvUHJvcGVydHkuQWxsb3dlZEV4cHJlc3Npb25zIGFzIHN0cmluZ107XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gbUFsbG93ZWRFeHByZXNzaW9ucztcbn1cbmZ1bmN0aW9uIGdldEZpbHRlclJlc3RyaWN0aW9ucyhcblx0b0ZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb24/OiBNZXRhTW9kZWxUeXBlPEZpbHRlclJlc3RyaWN0aW9uc1R5cGU+LFxuXHRzUmVzdHJpY3Rpb24/OiBcIlJlcXVpcmVkUHJvcGVydGllc1wiIHwgXCJOb25GaWx0ZXJhYmxlUHJvcGVydGllc1wiXG4pIHtcblx0bGV0IGFQcm9wczogc3RyaW5nW10gPSBbXTtcblx0aWYgKG9GaWx0ZXJSZXN0cmljdGlvbnNBbm5vdGF0aW9uICYmIG9GaWx0ZXJSZXN0cmljdGlvbnNBbm5vdGF0aW9uW3NSZXN0cmljdGlvbiBhcyBrZXlvZiBNZXRhTW9kZWxUeXBlPEZpbHRlclJlc3RyaWN0aW9uc1R5cGU+XSkge1xuXHRcdGFQcm9wcyA9IChcblx0XHRcdG9GaWx0ZXJSZXN0cmljdGlvbnNBbm5vdGF0aW9uW3NSZXN0cmljdGlvbiBhcyBrZXlvZiBNZXRhTW9kZWxUeXBlPEZpbHRlclJlc3RyaWN0aW9uc1R5cGU+XSBhcyBFeHBhbmRQYXRoVHlwZTxFZG0uUHJvcGVydHlQYXRoPltdXG5cdFx0KS5tYXAoZnVuY3Rpb24gKG9Qcm9wZXJ0eTogRXhwYW5kUGF0aFR5cGU8RWRtLlByb3BlcnR5UGF0aD4pIHtcblx0XHRcdHJldHVybiBvUHJvcGVydHkuJFByb3BlcnR5UGF0aDtcblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gYVByb3BzO1xufVxuXG5mdW5jdGlvbiBfZmV0Y2hQcm9wZXJ0aWVzRm9yTmF2UGF0aChwYXRoczogc3RyaW5nW10sIG5hdlBhdGg6IHN0cmluZywgcHJvcHM6IHN0cmluZ1tdKSB7XG5cdGNvbnN0IG5hdlBhdGhQcmVmaXggPSBuYXZQYXRoICsgXCIvXCI7XG5cdHJldHVybiBwYXRocy5yZWR1Y2UoKG91dFBhdGhzOiBzdHJpbmdbXSwgcGF0aFRvQ2hlY2s6IHN0cmluZykgPT4ge1xuXHRcdGlmIChwYXRoVG9DaGVjay5zdGFydHNXaXRoKG5hdlBhdGhQcmVmaXgpKSB7XG5cdFx0XHRjb25zdCBvdXRQYXRoID0gcGF0aFRvQ2hlY2sucmVwbGFjZShuYXZQYXRoUHJlZml4LCBcIlwiKTtcblx0XHRcdGlmIChvdXRQYXRocy5pbmRleE9mKG91dFBhdGgpID09PSAtMSkge1xuXHRcdFx0XHRvdXRQYXRocy5wdXNoKG91dFBhdGgpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb3V0UGF0aHM7XG5cdH0sIHByb3BzKTtcbn1cbnR5cGUgX0ZpbHRlckFsbG93ZWRFeHByZXNzaW9ucyA9IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPjtcbnR5cGUgX0ZpbHRlclJlc3RyaWN0aW9ucyA9IHtcblx0UmVxdWlyZWRQcm9wZXJ0aWVzOiBzdHJpbmdbXTtcblx0Tm9uRmlsdGVyYWJsZVByb3BlcnRpZXM6IHN0cmluZ1tdO1xuXHRGaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnM6IF9GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnM7XG59O1xuZnVuY3Rpb24gZ2V0RmlsdGVyUmVzdHJpY3Rpb25zQnlQYXRoKGVudGl0eVBhdGg6IHN0cmluZywgb0NvbnRleHQ6IE9EYXRhTWV0YU1vZGVsKSB7XG5cdGNvbnN0IG9SZXQ6IF9GaWx0ZXJSZXN0cmljdGlvbnMgPSB7XG5cdFx0UmVxdWlyZWRQcm9wZXJ0aWVzOiBbXSxcblx0XHROb25GaWx0ZXJhYmxlUHJvcGVydGllczogW10sXG5cdFx0RmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zOiB7fVxuXHR9O1xuXHRsZXQgb0ZpbHRlclJlc3RyaWN0aW9ucztcblx0Y29uc3QgbmF2aWdhdGlvblRleHQgPSBcIiROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nXCI7XG5cdGNvbnN0IGZyVGVybSA9IFwiQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRmlsdGVyUmVzdHJpY3Rpb25zXCI7XG5cdGNvbnN0IGVudGl0eVR5cGVQYXRoUGFydHMgPSBlbnRpdHlQYXRoLnJlcGxhY2VBbGwoXCIlMkZcIiwgXCIvXCIpLnNwbGl0KFwiL1wiKS5maWx0ZXIoTW9kZWxIZWxwZXIuZmlsdGVyT3V0TmF2UHJvcEJpbmRpbmcpO1xuXHRjb25zdCBlbnRpdHlUeXBlUGF0aCA9IGAvJHtlbnRpdHlUeXBlUGF0aFBhcnRzLmpvaW4oXCIvXCIpfS9gO1xuXHRjb25zdCBlbnRpdHlTZXRQYXRoID0gTW9kZWxIZWxwZXIuZ2V0RW50aXR5U2V0UGF0aChlbnRpdHlQYXRoLCBvQ29udGV4dCk7XG5cdGNvbnN0IGVudGl0eVNldFBhdGhQYXJ0cyA9IGVudGl0eVNldFBhdGguc3BsaXQoXCIvXCIpLmZpbHRlcihNb2RlbEhlbHBlci5maWx0ZXJPdXROYXZQcm9wQmluZGluZyk7XG5cdGNvbnN0IGlzQ29udGFpbm1lbnQgPSBvQ29udGV4dC5nZXRPYmplY3QoYCR7ZW50aXR5VHlwZVBhdGh9JENvbnRhaW5zVGFyZ2V0YCk7XG5cdGNvbnN0IGNvbnRhaW5tZW50TmF2UGF0aCA9ICEhaXNDb250YWlubWVudCAmJiBlbnRpdHlUeXBlUGF0aFBhcnRzW2VudGl0eVR5cGVQYXRoUGFydHMubGVuZ3RoIC0gMV07XG5cblx0Ly9MRUFTVCBQUklPUklUWSAtIEZpbHRlciByZXN0cmljdGlvbnMgZGlyZWN0bHkgYXQgRW50aXR5IFNldFxuXHQvL2UuZy4gRlIgaW4gXCJOUy5FbnRpdHlDb250YWluZXIvU2FsZXNPcmRlck1hbmFnZVwiIENvbnRleHRQYXRoOiAvU2FsZXNPcmRlck1hbmFnZVxuXHRpZiAoIWlzQ29udGFpbm1lbnQpIHtcblx0XHRvRmlsdGVyUmVzdHJpY3Rpb25zID0gb0NvbnRleHQuZ2V0T2JqZWN0KGAke2VudGl0eVNldFBhdGh9JHtmclRlcm19YCkgYXMgTWV0YU1vZGVsVHlwZTxGaWx0ZXJSZXN0cmljdGlvbnNUeXBlPiB8IHVuZGVmaW5lZDtcblx0XHRvUmV0LlJlcXVpcmVkUHJvcGVydGllcyA9IGdldEZpbHRlclJlc3RyaWN0aW9ucyhvRmlsdGVyUmVzdHJpY3Rpb25zLCBcIlJlcXVpcmVkUHJvcGVydGllc1wiKSB8fCBbXTtcblx0XHRjb25zdCByZXN1bHRDb250ZXh0Q2hlY2sgPSBvQ29udGV4dC5nZXRPYmplY3QoYCR7ZW50aXR5VHlwZVBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5SZXN1bHRDb250ZXh0YCk7XG5cdFx0aWYgKCFyZXN1bHRDb250ZXh0Q2hlY2spIHtcblx0XHRcdG9SZXQuTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMgPSBnZXRGaWx0ZXJSZXN0cmljdGlvbnMob0ZpbHRlclJlc3RyaWN0aW9ucywgXCJOb25GaWx0ZXJhYmxlUHJvcGVydGllc1wiKSB8fCBbXTtcblx0XHR9XG5cdFx0Ly9TaW5nbGVWYWx1ZSB8IE11bHRpVmFsdWUgfCBTaW5nbGVSYW5nZSB8IE11bHRpUmFuZ2UgfCBTZWFyY2hFeHByZXNzaW9uIHwgTXVsdGlSYW5nZU9yU2VhcmNoRXhwcmVzc2lvblxuXHRcdG9SZXQuRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zID0gZ2V0RmlsdGVyQWxsb3dlZEV4cHJlc3Npb24ob0ZpbHRlclJlc3RyaWN0aW9ucykgfHwge307XG5cdH1cblxuXHRpZiAoZW50aXR5VHlwZVBhdGhQYXJ0cy5sZW5ndGggPiAxKSB7XG5cdFx0Y29uc3QgbmF2UGF0aCA9IGlzQ29udGFpbm1lbnQgPyAoY29udGFpbm1lbnROYXZQYXRoIGFzIHN0cmluZykgOiBlbnRpdHlTZXRQYXRoUGFydHNbZW50aXR5U2V0UGF0aFBhcnRzLmxlbmd0aCAtIDFdO1xuXHRcdC8vIEluIGNhc2Ugb2YgY29udGFpbm1lbnQgd2UgdGFrZSBlbnRpdHlTZXQgcHJvdmlkZWQgYXMgcGFyZW50LiBBbmQgaW4gY2FzZSBvZiBub3JtYWwgd2Ugd291bGQgcmVtb3ZlIHRoZSBsYXN0IG5hdmlnYXRpb24gZnJvbSBlbnRpdHlTZXRQYXRoLlxuXHRcdGNvbnN0IHBhcmVudEVudGl0eVNldFBhdGggPSBpc0NvbnRhaW5tZW50ID8gZW50aXR5U2V0UGF0aCA6IGAvJHtlbnRpdHlTZXRQYXRoUGFydHMuc2xpY2UoMCwgLTEpLmpvaW4oYC8ke25hdmlnYXRpb25UZXh0fS9gKX1gO1xuXHRcdC8vVEhJUkQgSElHSEVTVCBQUklPUklUWSAtIFJlYWRpbmcgcHJvcGVydHkgcGF0aCByZXN0cmljdGlvbnMgLSBBbm5vdGF0aW9uIGF0IG1haW4gZW50aXR5IGJ1dCBkaXJlY3RseSBvbiBuYXZpZ2F0aW9uIHByb3BlcnR5IHBhdGhcblx0XHQvL2UuZy4gUGFyZW50IEN1c3RvbWVyIHdpdGggUHJvcGVydHlQYXRoPVwiU2V0L0NpdHlOYW1lXCIgQ29udGV4dFBhdGg6IEN1c3RvbWVyL1NldFxuXHRcdGNvbnN0IG9QYXJlbnRSZXQ6IF9GaWx0ZXJSZXN0cmljdGlvbnMgPSB7XG5cdFx0XHRSZXF1aXJlZFByb3BlcnRpZXM6IFtdLFxuXHRcdFx0Tm9uRmlsdGVyYWJsZVByb3BlcnRpZXM6IFtdLFxuXHRcdFx0RmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zOiB7fVxuXHRcdH07XG5cdFx0aWYgKCFuYXZQYXRoLmluY2x1ZGVzKFwiJTJGXCIpKSB7XG5cdFx0XHRjb25zdCBvUGFyZW50RlIgPSBvQ29udGV4dC5nZXRPYmplY3QoYCR7cGFyZW50RW50aXR5U2V0UGF0aH0ke2ZyVGVybX1gKSBhcyBNZXRhTW9kZWxUeXBlPEZpbHRlclJlc3RyaWN0aW9uc1R5cGU+IHwgdW5kZWZpbmVkO1xuXHRcdFx0b1JldC5SZXF1aXJlZFByb3BlcnRpZXMgPSBfZmV0Y2hQcm9wZXJ0aWVzRm9yTmF2UGF0aChcblx0XHRcdFx0Z2V0RmlsdGVyUmVzdHJpY3Rpb25zKG9QYXJlbnRGUiwgXCJSZXF1aXJlZFByb3BlcnRpZXNcIikgfHwgW10sXG5cdFx0XHRcdG5hdlBhdGgsXG5cdFx0XHRcdG9SZXQuUmVxdWlyZWRQcm9wZXJ0aWVzIHx8IFtdXG5cdFx0XHQpO1xuXHRcdFx0b1JldC5Ob25GaWx0ZXJhYmxlUHJvcGVydGllcyA9IF9mZXRjaFByb3BlcnRpZXNGb3JOYXZQYXRoKFxuXHRcdFx0XHRnZXRGaWx0ZXJSZXN0cmljdGlvbnMob1BhcmVudEZSLCBcIk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzXCIpIHx8IFtdLFxuXHRcdFx0XHRuYXZQYXRoLFxuXHRcdFx0XHRvUmV0Lk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzIHx8IFtdXG5cdFx0XHQpO1xuXHRcdFx0Ly9TaW5nbGVWYWx1ZSB8IE11bHRpVmFsdWUgfCBTaW5nbGVSYW5nZSB8IE11bHRpUmFuZ2UgfCBTZWFyY2hFeHByZXNzaW9uIHwgTXVsdGlSYW5nZU9yU2VhcmNoRXhwcmVzc2lvblxuXHRcdFx0Y29uc3QgY29tcGxldGVBbGxvd2VkRXhwcyA9IGdldEZpbHRlckFsbG93ZWRFeHByZXNzaW9uKG9QYXJlbnRGUikgfHwge307XG5cdFx0XHRvUGFyZW50UmV0LkZpbHRlckFsbG93ZWRFeHByZXNzaW9ucyA9IE9iamVjdC5rZXlzKGNvbXBsZXRlQWxsb3dlZEV4cHMpLnJlZHVjZShcblx0XHRcdFx0KG91dFByb3A6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiwgcHJvcFBhdGg6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRcdGlmIChwcm9wUGF0aC5zdGFydHNXaXRoKG5hdlBhdGggKyBcIi9cIikpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG91dFByb3BQYXRoID0gcHJvcFBhdGgucmVwbGFjZShuYXZQYXRoICsgXCIvXCIsIFwiXCIpO1xuXHRcdFx0XHRcdFx0b3V0UHJvcFtvdXRQcm9wUGF0aF0gPSBjb21wbGV0ZUFsbG93ZWRFeHBzW3Byb3BQYXRoXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIG91dFByb3A7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHt9IGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHQvL1NpbmdsZVZhbHVlIHwgTXVsdGlWYWx1ZSB8IFNpbmdsZVJhbmdlIHwgTXVsdGlSYW5nZSB8IFNlYXJjaEV4cHJlc3Npb24gfCBNdWx0aVJhbmdlT3JTZWFyY2hFeHByZXNzaW9uXG5cdFx0b1JldC5GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnMgPSBtZXJnZU9iamVjdHMoXG5cdFx0XHR7fSxcblx0XHRcdG9SZXQuRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zIHx8IHt9LFxuXHRcdFx0b1BhcmVudFJldC5GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnMgfHwge31cblx0XHQpIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPjtcblxuXHRcdC8vU0VDT05EIEhJR0hFU1QgcHJpb3JpdHkgLSBOYXZpZ2F0aW9uIHJlc3RyaWN0aW9uc1xuXHRcdC8vZS5nLiBQYXJlbnQgXCIvQ3VzdG9tZXJcIiB3aXRoIE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg9XCJTZXRcIiBDb250ZXh0UGF0aDogQ3VzdG9tZXIvU2V0XG5cdFx0Y29uc3Qgb05hdlJlc3RyaWN0aW9ucyA9IE1ldGFNb2RlbEZ1bmN0aW9uLmdldE5hdmlnYXRpb25SZXN0cmljdGlvbnMob0NvbnRleHQsIHBhcmVudEVudGl0eVNldFBhdGgsIG5hdlBhdGgucmVwbGFjZUFsbChcIiUyRlwiLCBcIi9cIikpO1xuXHRcdGNvbnN0IG9OYXZGaWx0ZXJSZXN0ID0gb05hdlJlc3RyaWN0aW9ucyAmJiAob05hdlJlc3RyaWN0aW9uc1tcIkZpbHRlclJlc3RyaWN0aW9uc1wiXSBhcyBNZXRhTW9kZWxUeXBlPEZpbHRlclJlc3RyaWN0aW9uc1R5cGU+KTtcblx0XHRjb25zdCBuYXZSZXNSZXFQcm9wcyA9IGdldEZpbHRlclJlc3RyaWN0aW9ucyhvTmF2RmlsdGVyUmVzdCwgXCJSZXF1aXJlZFByb3BlcnRpZXNcIikgfHwgW107XG5cdFx0b1JldC5SZXF1aXJlZFByb3BlcnRpZXMgPSB1bmlxdWVTb3J0KG9SZXQuUmVxdWlyZWRQcm9wZXJ0aWVzLmNvbmNhdChuYXZSZXNSZXFQcm9wcykpO1xuXHRcdGNvbnN0IG5hdk5vbkZpbHRlclByb3BzID0gZ2V0RmlsdGVyUmVzdHJpY3Rpb25zKG9OYXZGaWx0ZXJSZXN0LCBcIk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzXCIpIHx8IFtdO1xuXHRcdG9SZXQuTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMgPSB1bmlxdWVTb3J0KG9SZXQuTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMuY29uY2F0KG5hdk5vbkZpbHRlclByb3BzKSk7XG5cdFx0Ly9TaW5nbGVWYWx1ZSB8IE11bHRpVmFsdWUgfCBTaW5nbGVSYW5nZSB8IE11bHRpUmFuZ2UgfCBTZWFyY2hFeHByZXNzaW9uIHwgTXVsdGlSYW5nZU9yU2VhcmNoRXhwcmVzc2lvblxuXHRcdG9SZXQuRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zID0gbWVyZ2VPYmplY3RzKFxuXHRcdFx0e30sXG5cdFx0XHRvUmV0LkZpbHRlckFsbG93ZWRFeHByZXNzaW9ucyB8fCB7fSxcblx0XHRcdGdldEZpbHRlckFsbG93ZWRFeHByZXNzaW9uKG9OYXZGaWx0ZXJSZXN0KSB8fCB7fVxuXHRcdCkgYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nW10+O1xuXG5cdFx0Ly9ISUdIRVNUIHByaW9yaXR5IC0gUmVzdHJpY3Rpb25zIGhhdmluZyB0YXJnZXQgd2l0aCBuYXZpZ2F0aW9uIGFzc29jaWF0aW9uIGVudGl0eVxuXHRcdC8vIGUuZy4gRlIgaW4gXCJDdXN0b21lclBhcmFtZXRlcnMvU2V0XCIgQ29udGV4dFBhdGg6IFwiQ3VzdG9tZXIvU2V0XCJcblx0XHRjb25zdCBuYXZBc3NvY2lhdGlvbkVudGl0eVJlc3QgPSBvQ29udGV4dC5nZXRPYmplY3QoXG5cdFx0XHRgLyR7ZW50aXR5VHlwZVBhdGhQYXJ0cy5qb2luKFwiL1wiKX0ke2ZyVGVybX1gXG5cdFx0KSBhcyBNZXRhTW9kZWxUeXBlPEZpbHRlclJlc3RyaWN0aW9uc1R5cGU+O1xuXHRcdGNvbnN0IG5hdkFzc29jUmVxUHJvcHMgPSBnZXRGaWx0ZXJSZXN0cmljdGlvbnMobmF2QXNzb2NpYXRpb25FbnRpdHlSZXN0LCBcIlJlcXVpcmVkUHJvcGVydGllc1wiKSB8fCBbXTtcblx0XHRvUmV0LlJlcXVpcmVkUHJvcGVydGllcyA9IHVuaXF1ZVNvcnQob1JldC5SZXF1aXJlZFByb3BlcnRpZXMuY29uY2F0KG5hdkFzc29jUmVxUHJvcHMpKTtcblx0XHRjb25zdCBuYXZBc3NvY05vbkZpbHRlclByb3BzID0gZ2V0RmlsdGVyUmVzdHJpY3Rpb25zKG5hdkFzc29jaWF0aW9uRW50aXR5UmVzdCwgXCJOb25GaWx0ZXJhYmxlUHJvcGVydGllc1wiKSB8fCBbXTtcblx0XHRvUmV0Lk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzID0gdW5pcXVlU29ydChvUmV0Lk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzLmNvbmNhdChuYXZBc3NvY05vbkZpbHRlclByb3BzKSk7XG5cdFx0Ly9TaW5nbGVWYWx1ZSB8IE11bHRpVmFsdWUgfCBTaW5nbGVSYW5nZSB8IE11bHRpUmFuZ2UgfCBTZWFyY2hFeHByZXNzaW9uIHwgTXVsdGlSYW5nZU9yU2VhcmNoRXhwcmVzc2lvblxuXHRcdG9SZXQuRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zID0gbWVyZ2VPYmplY3RzKFxuXHRcdFx0e30sXG5cdFx0XHRvUmV0LkZpbHRlckFsbG93ZWRFeHByZXNzaW9ucyxcblx0XHRcdGdldEZpbHRlckFsbG93ZWRFeHByZXNzaW9uKG5hdkFzc29jaWF0aW9uRW50aXR5UmVzdCkgfHwge31cblx0XHQpIGFzIF9GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnM7XG5cdH1cblx0cmV0dXJuIG9SZXQ7XG59XG5cbnR5cGUgUHJlcHJvY2Vzc29yU2V0dGluZ3MgPSB7XG5cdGJpbmRpbmdDb250ZXh0czogb2JqZWN0O1xuXHRtb2RlbHM6IG9iamVjdDtcbn07XG50eXBlIEJhc2VUcmVlTW9kaWZpZXIgPSB7XG5cdHRlbXBsYXRlQ29udHJvbEZyYWdtZW50KFxuXHRcdHNGcmFnbWVudE5hbWU6IHN0cmluZyxcblx0XHRtUHJlcHJvY2Vzc29yU2V0dGluZ3M6IFByZXByb2Nlc3NvclNldHRpbmdzLFxuXHRcdG9WaWV3PzogVmlld1xuXHQpOiBQcm9taXNlPFVJNUVsZW1lbnRbXSB8IEVsZW1lbnRbXT47XG5cdHRhcmdldHM6IHN0cmluZztcbn07XG5cbmFzeW5jIGZ1bmN0aW9uIHRlbXBsYXRlQ29udHJvbEZyYWdtZW50KFxuXHRzRnJhZ21lbnROYW1lOiBzdHJpbmcsXG5cdG9QcmVwcm9jZXNzb3JTZXR0aW5nczogUHJlcHJvY2Vzc29yU2V0dGluZ3MsXG5cdG9PcHRpb25zOiB7IHZpZXc/OiBWaWV3OyBpc1hNTD86IGJvb2xlYW47IGlkOiBzdHJpbmc7IGNvbnRyb2xsZXI6IENvbnRyb2xsZXIgfSxcblx0b01vZGlmaWVyPzogQmFzZVRyZWVNb2RpZmllclxuKTogUHJvbWlzZTxFbGVtZW50IHwgVUk1RWxlbWVudCB8IEVsZW1lbnRbXSB8IFVJNUVsZW1lbnRbXT4ge1xuXHRvT3B0aW9ucyA9IG9PcHRpb25zIHx8IHt9O1xuXHRpZiAob01vZGlmaWVyKSB7XG5cdFx0cmV0dXJuIG9Nb2RpZmllci50ZW1wbGF0ZUNvbnRyb2xGcmFnbWVudChzRnJhZ21lbnROYW1lLCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MsIG9PcHRpb25zLnZpZXcpLnRoZW4oZnVuY3Rpb24gKG9GcmFnbWVudCkge1xuXHRcdFx0Ly8gVGhpcyBpcyByZXF1aXJlZCBhcyBGbGV4IHJldHVybnMgYW4gSFRNTENvbGxlY3Rpb24gYXMgdGVtcGxhdGluZyByZXN1bHQgaW4gWE1MIHRpbWUuXG5cdFx0XHRyZXR1cm4gb01vZGlmaWVyLnRhcmdldHMgPT09IFwieG1sVHJlZVwiICYmIG9GcmFnbWVudC5sZW5ndGggPiAwID8gb0ZyYWdtZW50WzBdIDogb0ZyYWdtZW50O1xuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IG9GcmFnbWVudCA9IGF3YWl0IFhNTFByZXByb2Nlc3Nvci5wcm9jZXNzKFxuXHRcdFx0WE1MVGVtcGxhdGVQcm9jZXNzb3IubG9hZFRlbXBsYXRlKHNGcmFnbWVudE5hbWUsIFwiZnJhZ21lbnRcIiksXG5cdFx0XHR7IG5hbWU6IHNGcmFnbWVudE5hbWUgfSxcblx0XHRcdG9QcmVwcm9jZXNzb3JTZXR0aW5nc1xuXHRcdCk7XG5cdFx0Y29uc3Qgb0NvbnRyb2wgPSBvRnJhZ21lbnQuZmlyc3RFbGVtZW50Q2hpbGQ7XG5cdFx0aWYgKCEhb09wdGlvbnMuaXNYTUwgJiYgb0NvbnRyb2wpIHtcblx0XHRcdHJldHVybiBvQ29udHJvbDtcblx0XHR9XG5cdFx0cmV0dXJuIEZyYWdtZW50LmxvYWQoe1xuXHRcdFx0aWQ6IG9PcHRpb25zLmlkLFxuXHRcdFx0ZGVmaW5pdGlvbjogb0ZyYWdtZW50IGFzIHVua25vd24gYXMgc3RyaW5nLFxuXHRcdFx0Y29udHJvbGxlcjogb09wdGlvbnMuY29udHJvbGxlclxuXHRcdH0pO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldFNpbmdsZXRvblBhdGgocGF0aDogc3RyaW5nLCBtZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0Y29uc3QgcGFydHMgPSBwYXRoLnNwbGl0KFwiL1wiKS5maWx0ZXIoQm9vbGVhbiksXG5cdFx0cHJvcGVydHlOYW1lID0gcGFydHMucG9wKCkhLFxuXHRcdG5hdmlnYXRpb25QYXRoID0gcGFydHMuam9pbihcIi9cIiksXG5cdFx0ZW50aXR5U2V0ID0gbmF2aWdhdGlvblBhdGggJiYgbWV0YU1vZGVsLmdldE9iamVjdChgLyR7bmF2aWdhdGlvblBhdGh9YCk7XG5cdGlmIChlbnRpdHlTZXQ/LiRraW5kID09PSBcIlNpbmdsZXRvblwiKSB7XG5cdFx0Y29uc3Qgc2luZ2xldG9uTmFtZSA9IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdO1xuXHRcdHJldHVybiBgLyR7c2luZ2xldG9uTmFtZX0vJHtwcm9wZXJ0eU5hbWV9YDtcblx0fVxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5hc3luYyBmdW5jdGlvbiByZXF1ZXN0U2luZ2xldG9uUHJvcGVydHkocGF0aDogc3RyaW5nLCBtb2RlbDogT0RhdGFNb2RlbCkge1xuXHRpZiAoIXBhdGggfHwgIW1vZGVsKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcblx0fVxuXHRjb25zdCBtZXRhTW9kZWwgPSBtb2RlbC5nZXRNZXRhTW9kZWwoKTtcblx0Ly8gRmluZCB0aGUgdW5kZXJseWluZyBlbnRpdHkgc2V0IGZyb20gdGhlIHByb3BlcnR5IHBhdGggYW5kIGNoZWNrIHdoZXRoZXIgaXQgaXMgYSBzaW5nbGV0b24uXG5cdGNvbnN0IHJlc29sdmVkUGF0aCA9IGdldFNpbmdsZXRvblBhdGgocGF0aCwgbWV0YU1vZGVsKTtcblx0aWYgKHJlc29sdmVkUGF0aCkge1xuXHRcdGNvbnN0IHByb3BlcnR5QmluZGluZyA9IG1vZGVsLmJpbmRQcm9wZXJ0eShyZXNvbHZlZFBhdGgpO1xuXHRcdHJldHVybiBwcm9wZXJ0eUJpbmRpbmcucmVxdWVzdFZhbHVlKCk7XG5cdH1cblxuXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xufVxuXG4vLyBHZXQgdGhlIHBhdGggZm9yIGFjdGlvbiBwYXJhbWV0ZXJzIHRoYXQgaXMgbmVlZGVkIHRvIHJlYWQgdGhlIGFubm90YXRpb25zXG5mdW5jdGlvbiBnZXRQYXJhbWV0ZXJQYXRoKHNQYXRoOiBzdHJpbmcsIHNQYXJhbWV0ZXI6IHN0cmluZykge1xuXHRsZXQgc0NvbnRleHQ7XG5cdGlmIChzUGF0aC5pbmRleE9mKFwiQCR1aTUub3ZlcmxvYWRcIikgPiAtMSkge1xuXHRcdHNDb250ZXh0ID0gc1BhdGguc3BsaXQoXCJAJHVpNS5vdmVybG9hZFwiKVswXTtcblx0fSBlbHNlIHtcblx0XHQvLyBGb3IgVW5ib3VuZCBBY3Rpb25zIGluIEFjdGlvbiBQYXJhbWV0ZXIgRGlhbG9nc1xuXHRcdGNvbnN0IGFBY3Rpb24gPSBzUGF0aC5zcGxpdChcIi8wXCIpWzBdLnNwbGl0KFwiLlwiKTtcblx0XHRzQ29udGV4dCA9IGAvJHthQWN0aW9uW2FBY3Rpb24ubGVuZ3RoIC0gMV19L2A7XG5cdH1cblx0cmV0dXJuIHNDb250ZXh0ICsgc1BhcmFtZXRlcjtcbn1cblxuLyoqXG4gKiBHZXQgcmVzb2x2ZWQgZXhwcmVzc2lvbiBiaW5kaW5nIHVzZWQgZm9yIHRleHRzIGF0IHJ1bnRpbWUuXG4gKlxuICogQHBhcmFtIGV4cEJpbmRpbmdcbiAqIEBwYXJhbSBjb250cm9sXG4gKiBAZnVuY3Rpb25cbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5Db21tb25VdGlsc1xuICogQHJldHVybnMgQSBzdHJpbmcgYWZ0ZXIgcmVzb2x1dGlvbi5cbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5mdW5jdGlvbiBfZm50cmFuc2xhdGVkVGV4dEZyb21FeHBCaW5kaW5nU3RyaW5nKGV4cEJpbmRpbmc6IHN0cmluZywgY29udHJvbDogQ29udHJvbCkge1xuXHQvLyBUaGUgaWRlYSBoZXJlIGlzIHRvIGNyZWF0ZSBkdW1teSBlbGVtZW50IHdpdGggdGhlIGV4cHJlc2lvbiBiaW5kaW5nLlxuXHQvLyBBZGRpbmcgaXQgYXMgZGVwZW5kZW50IHRvIHRoZSB2aWV3L2NvbnRyb2wgd291bGQgcHJvcGFnYXRlIGFsbCB0aGUgbW9kZWxzIHRvIHRoZSBkdW1teSBlbGVtZW50IGFuZCByZXNvbHZlIHRoZSBiaW5kaW5nLlxuXHQvLyBXZSByZW1vdmUgdGhlIGR1bW15IGVsZW1lbnQgYWZ0ZXIgdGhhdCBhbmQgZGVzdHJveSBpdC5cblxuXHRjb25zdCBhbnlSZXNvdXJjZVRleHQgPSBuZXcgQW55RWxlbWVudCh7IGFueVRleHQ6IGV4cEJpbmRpbmcgfSk7XG5cdGNvbnRyb2wuYWRkRGVwZW5kZW50KGFueVJlc291cmNlVGV4dCk7XG5cdGNvbnN0IHJlc3VsdFRleHQgPSBhbnlSZXNvdXJjZVRleHQuZ2V0QW55VGV4dCgpO1xuXHRjb250cm9sLnJlbW92ZURlcGVuZGVudChhbnlSZXNvdXJjZVRleHQpO1xuXHRhbnlSZXNvdXJjZVRleHQuZGVzdHJveSgpO1xuXG5cdHJldHVybiByZXN1bHRUZXh0O1xufVxuLyoqXG4gKiBDaGVjayBpZiB0aGUgY3VycmVudCBkZXZpY2UgaGFzIGEgc21hbGwgc2NyZWVuLlxuICpcbiAqIEByZXR1cm5zIEEgQm9vbGVhbi5cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGlzU21hbGxEZXZpY2UoKSB7XG5cdHJldHVybiAhc3lzdGVtLmRlc2t0b3AgfHwgRGV2aWNlLnJlc2l6ZS53aWR0aCA8PSAzMjA7XG59XG4vKipcbiAqIEdldCBmaWx0ZXIgaW5mb3JtYXRpb24gZm9yIGEgU2VsZWN0aW9uVmFyaWFudCBhbm5vdGF0aW9uLlxuICpcbiAqIEBwYXJhbSBvQ29udHJvbCBUaGUgdGFibGUvY2hhcnQgaW5zdGFuY2VcbiAqIEBwYXJhbSBzZWxlY3Rpb25WYXJpYW50UGF0aCBSZWxhdGl2ZSBTZWxlY3Rpb25WYXJpYW50IGFubm90YXRpb24gcGF0aFxuICogQHBhcmFtIGlzQ2hhcnRcbiAqIEByZXR1cm5zIEluZm9ybWF0aW9uIG9uIGZpbHRlcnNcbiAqICBmaWx0ZXJzOiBhcnJheSBvZiBzYXAudWkubW9kZWwuZmlsdGVyc1xuICogdGV4dDogVGV4dCBwcm9wZXJ0eSBvZiB0aGUgU2VsZWN0aW9uVmFyaWFudFxuICogQHByaXZhdGVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5pbnRlcmZhY2UgSVNlbGVjdGlvbk9wdGlvbiB7XG5cdFByb3BlcnR5TmFtZTogeyAkUHJvcGVydHlQYXRoOiBzdHJpbmcgfTtcblx0UmFuZ2VzOiB7XG5cdFx0W2tleTogc3RyaW5nXToge1xuXHRcdFx0T3B0aW9uOiB7ICRFbnVtTWVtYmVyOiBTdHJpbmcgfTtcblx0XHRcdExvdzogdW5rbm93bjtcblx0XHRcdEhpZ2g6IHVua25vd247XG5cdFx0fTtcblx0fTtcbn1cbmZ1bmN0aW9uIGdldEZpbHRlcnNJbmZvRm9yU1Yob0NvbnRyb2w6IENvbnRyb2wgfCBNRENDaGFydCB8IE1EQ1RhYmxlLCBzZWxlY3Rpb25WYXJpYW50UGF0aDogc3RyaW5nLCBpc0NoYXJ0PzogYm9vbGVhbikge1xuXHRjb25zdCBzRW50aXR5VHlwZVBhdGggPSBvQ29udHJvbC5kYXRhKFwiZW50aXR5VHlwZVwiKSxcblx0XHRvTWV0YU1vZGVsID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KG9Db250cm9sIGFzIENvbnRyb2wpLmdldE1ldGFNb2RlbCgpLFxuXHRcdG1Qcm9wZXJ0eUZpbHRlcnM6IFJlY29yZDxzdHJpbmcsIEZpbHRlcltdPiA9IHt9LFxuXHRcdGFGaWx0ZXJzID0gW10sXG5cdFx0YVBhdGhzOiBzdHJpbmdbXSA9IFtdO1xuXHRsZXQgc1RleHQgPSBcIlwiO1xuXHRsZXQgb1NlbGVjdGlvblZhcmlhbnQgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzRW50aXR5VHlwZVBhdGh9JHtzZWxlY3Rpb25WYXJpYW50UGF0aH1gKTtcblx0Ly8gZm9yIGNoYXJ0IHRoZSBzdHJ1Y3R1cmUgdmFyaWVzIGhlbmNlIHJlYWQgaXQgZnJvbSBtYWluIG9iamVjdFxuXHRpZiAoaXNDaGFydCkge1xuXHRcdG9TZWxlY3Rpb25WYXJpYW50ID0gb1NlbGVjdGlvblZhcmlhbnQuU2VsZWN0aW9uVmFyaWFudDtcblx0fVxuXHRpZiAob1NlbGVjdGlvblZhcmlhbnQpIHtcblx0XHRzVGV4dCA9IG9TZWxlY3Rpb25WYXJpYW50LlRleHQ7XG5cdFx0KG9TZWxlY3Rpb25WYXJpYW50LlNlbGVjdE9wdGlvbnMgfHwgW10pXG5cdFx0XHQuZmlsdGVyKGZ1bmN0aW9uIChvU2VsZWN0T3B0aW9uOiBJU2VsZWN0aW9uT3B0aW9uKSB7XG5cdFx0XHRcdHJldHVybiBvU2VsZWN0T3B0aW9uICYmIG9TZWxlY3RPcHRpb24uUHJvcGVydHlOYW1lICYmIG9TZWxlY3RPcHRpb24uUHJvcGVydHlOYW1lLiRQcm9wZXJ0eVBhdGg7XG5cdFx0XHR9KVxuXHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKG9TZWxlY3RPcHRpb246IElTZWxlY3Rpb25PcHRpb24pIHtcblx0XHRcdFx0Y29uc3Qgc1BhdGggPSBvU2VsZWN0T3B0aW9uLlByb3BlcnR5TmFtZS4kUHJvcGVydHlQYXRoO1xuXHRcdFx0XHRpZiAoIWFQYXRocy5pbmNsdWRlcyhzUGF0aCkpIHtcblx0XHRcdFx0XHRhUGF0aHMucHVzaChzUGF0aCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Zm9yIChjb25zdCBqIGluIG9TZWxlY3RPcHRpb24uUmFuZ2VzKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1JhbmdlID0gb1NlbGVjdE9wdGlvbi5SYW5nZXNbal07XG5cdFx0XHRcdFx0bVByb3BlcnR5RmlsdGVyc1tzUGF0aF0gPSAobVByb3BlcnR5RmlsdGVyc1tzUGF0aF0gfHwgW10pLmNvbmNhdChcblx0XHRcdFx0XHRcdG5ldyBGaWx0ZXIoc1BhdGgsIG9SYW5nZS5PcHRpb24/LiRFbnVtTWVtYmVyPy5zcGxpdChcIi9cIikucG9wKCkgYXMgdW5kZWZpbmVkLCBvUmFuZ2UuTG93LCBvUmFuZ2UuSGlnaClcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdGZvciAoY29uc3Qgc1Byb3BlcnR5UGF0aCBpbiBtUHJvcGVydHlGaWx0ZXJzKSB7XG5cdFx0XHRhRmlsdGVycy5wdXNoKFxuXHRcdFx0XHRuZXcgRmlsdGVyKHtcblx0XHRcdFx0XHRmaWx0ZXJzOiBtUHJvcGVydHlGaWx0ZXJzW3NQcm9wZXJ0eVBhdGhdLFxuXHRcdFx0XHRcdGFuZDogZmFsc2Vcblx0XHRcdFx0fSlcblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRwcm9wZXJ0aWVzOiBhUGF0aHMsXG5cdFx0ZmlsdGVyczogYUZpbHRlcnMsXG5cdFx0dGV4dDogc1RleHRcblx0fTtcbn1cblxuZnVuY3Rpb24gZ2V0Q29udmVydGVyQ29udGV4dEZvclBhdGgoc01ldGFQYXRoOiBzdHJpbmcsIG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLCBzRW50aXR5U2V0OiBzdHJpbmcsIG9EaWFnbm9zdGljczogRGlhZ25vc3RpY3MpIHtcblx0Y29uc3Qgb0NvbnRleHQgPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNNZXRhUGF0aCkgYXMgT0RhdGFWNENvbnRleHQ7XG5cdHJldHVybiBDb252ZXJ0ZXJDb250ZXh0Py5jcmVhdGVDb252ZXJ0ZXJDb250ZXh0Rm9yTWFjcm8oc0VudGl0eVNldCwgb0NvbnRleHQgfHwgb01ldGFNb2RlbCwgb0RpYWdub3N0aWNzLCBtZXJnZU9iamVjdHMsIHVuZGVmaW5lZCk7XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiByZXR1cm5zIGFuIElEIHdoaWNoIHNob3VsZCBiZSB1c2VkIGluIHRoZSBpbnRlcm5hbCBjaGFydCBmb3IgdGhlIG1lYXN1cmUgb3IgZGltZW5zaW9uLlxuICogRm9yIHN0YW5kYXJkIGNhc2VzLCB0aGlzIGlzIGp1c3QgdGhlIElEIG9mIHRoZSBwcm9wZXJ0eS5cbiAqIElmIGl0IGlzIG5lY2Vzc2FyeSB0byB1c2UgYW5vdGhlciBJRCBpbnRlcm5hbGx5IGluc2lkZSB0aGUgY2hhcnQgKGUuZy4gb24gZHVwbGljYXRlIHByb3BlcnR5IElEcykgdGhpcyBtZXRob2QgY2FuIGJlIG92ZXJ3cml0dGVuLlxuICogSW4gdGhpcyBjYXNlLCA8Y29kZT5nZXRQcm9wZXJ0eUZyb21OYW1lQW5kS2luZDwvY29kZT4gbmVlZHMgdG8gYmUgb3ZlcndyaXR0ZW4gYXMgd2VsbC5cbiAqXG4gKiBAcGFyYW0gbmFtZSBJRCBvZiB0aGUgcHJvcGVydHlcbiAqIEBwYXJhbSBraW5kIFR5cGUgb2YgdGhlIHByb3BlcnR5IChtZWFzdXJlIG9yIGRpbWVuc2lvbilcbiAqIEByZXR1cm5zIEludGVybmFsIElEIGZvciB0aGUgc2FwLmNoYXJ0LkNoYXJ0XG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmZ1bmN0aW9uIGdldEludGVybmFsQ2hhcnROYW1lRnJvbVByb3BlcnR5TmFtZUFuZEtpbmQobmFtZTogc3RyaW5nLCBraW5kOiBzdHJpbmcpIHtcblx0cmV0dXJuIG5hbWUucmVwbGFjZShcIl9mZV9cIiArIGtpbmQgKyBcIl9cIiwgXCJcIik7XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiByZXR1cm5zIGFuIGFycmF5IG9mIGNoYXJ0IHByb3BlcnRpZXMgYnkgcmVtdm9pbmcgX2ZlX2dyb3VwYWJsZSBwcmVmaXguXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYUZpbHRlcnMgQ2hhcnQgZmlsdGVyIHByb3BlcnRpZXNcbiAqIEByZXR1cm5zIENoYXJ0IHByb3BlcnRpZXMgd2l0aG91dCBwcmVmaXhlc1xuICogQHByaXZhdGVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5pbnRlcmZhY2UgSUZpbHRlclByb3Age1xuXHRzUGF0aDogc3RyaW5nO1xufVxuZnVuY3Rpb24gZ2V0Q2hhcnRQcm9wZXJ0aWVzV2l0aG91dFByZWZpeGVzKGFGaWx0ZXJzOiBJRmlsdGVyUHJvcFtdKSB7XG5cdGFGaWx0ZXJzLmZvckVhY2goKGVsZW1lbnQ6IElGaWx0ZXJQcm9wKSA9PiB7XG5cdFx0aWYgKGVsZW1lbnQuc1BhdGggJiYgZWxlbWVudC5zUGF0aC5pbmNsdWRlcyhcImZlX2dyb3VwYWJsZVwiKSkge1xuXHRcdFx0ZWxlbWVudC5zUGF0aCA9IENvbW1vblV0aWxzLmdldEludGVybmFsQ2hhcnROYW1lRnJvbVByb3BlcnR5TmFtZUFuZEtpbmQoZWxlbWVudC5zUGF0aCwgXCJncm91cGFibGVcIik7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIGFGaWx0ZXJzO1xufVxuXG5jb25zdCBDb21tb25VdGlscyA9IHtcblx0ZmlyZUJ1dHRvblByZXNzOiBmbkZpcmVCdXR0b25QcmVzcyxcblx0Z2V0VGFyZ2V0VmlldzogZ2V0VGFyZ2V0Vmlldyxcblx0Z2V0Q3VycmVudFBhZ2VWaWV3OiBnZXRDdXJyZW50UGFnZVZpZXcsXG5cdGhhc1RyYW5zaWVudENvbnRleHQ6IGZuSGFzVHJhbnNpZW50Q29udGV4dHMsXG5cdHVwZGF0ZVJlbGF0ZWRBcHBzRGV0YWlsczogZm5VcGRhdGVSZWxhdGVkQXBwc0RldGFpbHMsXG5cdGdldEFwcENvbXBvbmVudDogZ2V0QXBwQ29tcG9uZW50LFxuXHRnZXRNYW5kYXRvcnlGaWx0ZXJGaWVsZHM6IGZuR2V0TWFuZGF0b3J5RmlsdGVyRmllbGRzLFxuXHRnZXRDb250ZXh0UGF0aFByb3BlcnRpZXM6IGZuR2V0Q29udGV4dFBhdGhQcm9wZXJ0aWVzLFxuXHRnZXRQYXJhbWV0ZXJJbmZvOiBnZXRQYXJhbWV0ZXJJbmZvLFxuXHR1cGRhdGVEYXRhRmllbGRGb3JJQk5CdXR0b25zVmlzaWJpbGl0eTogZm5VcGRhdGVEYXRhRmllbGRGb3JJQk5CdXR0b25zVmlzaWJpbGl0eSxcblx0Z2V0RW50aXR5U2V0TmFtZTogZ2V0RW50aXR5U2V0TmFtZSxcblx0Z2V0QWN0aW9uUGF0aDogZ2V0QWN0aW9uUGF0aCxcblx0Y29tcHV0ZURpc3BsYXlNb2RlOiBjb21wdXRlRGlzcGxheU1vZGUsXG5cdGlzU3RpY2t5RWRpdE1vZGU6IGlzU3RpY2t5RWRpdE1vZGUsXG5cdGdldE9wZXJhdG9yc0ZvclByb3BlcnR5OiBnZXRPcGVyYXRvcnNGb3JQcm9wZXJ0eSxcblx0Z2V0T3BlcmF0b3JzRm9yRGF0ZVByb3BlcnR5OiBnZXRPcGVyYXRvcnNGb3JEYXRlUHJvcGVydHksXG5cdGdldE9wZXJhdG9yc0Zvckd1aWRQcm9wZXJ0eTogZ2V0T3BlcmF0b3JzRm9yR3VpZFByb3BlcnR5LFxuXHRhZGRTZWxlY3Rpb25WYXJpYW50VG9Db25kaXRpb25zOiBhZGRTZWxlY3Rpb25WYXJpYW50VG9Db25kaXRpb25zLFxuXHRhZGRFeHRlcm5hbFN0YXRlRmlsdGVyc1RvU2VsZWN0aW9uVmFyaWFudDogYWRkRXh0ZXJuYWxTdGF0ZUZpbHRlcnNUb1NlbGVjdGlvblZhcmlhbnQsXG5cdGFkZFBhZ2VDb250ZXh0VG9TZWxlY3Rpb25WYXJpYW50OiBhZGRQYWdlQ29udGV4dFRvU2VsZWN0aW9uVmFyaWFudCxcblx0YWRkRGVmYXVsdERpc3BsYXlDdXJyZW5jeTogYWRkRGVmYXVsdERpc3BsYXlDdXJyZW5jeSxcblx0c2V0VXNlckRlZmF1bHRzOiBzZXRVc2VyRGVmYXVsdHMsXG5cdGdldElCTkFjdGlvbnM6IGZuR2V0SUJOQWN0aW9ucyxcblx0Z2V0SGVhZGVyRmFjZXRJdGVtQ29uZmlnRm9yRXh0ZXJuYWxOYXZpZ2F0aW9uOiBnZXRIZWFkZXJGYWNldEl0ZW1Db25maWdGb3JFeHRlcm5hbE5hdmlnYXRpb24sXG5cdGdldFNlbWFudGljT2JqZWN0TWFwcGluZzogZ2V0U2VtYW50aWNPYmplY3RNYXBwaW5nLFxuXHRzZXRTZW1hbnRpY09iamVjdE1hcHBpbmdzOiBzZXRTZW1hbnRpY09iamVjdE1hcHBpbmdzLFxuXHRnZXRTZW1hbnRpY09iamVjdFByb21pc2U6IGZuR2V0U2VtYW50aWNPYmplY3RQcm9taXNlLFxuXHRnZXRTZW1hbnRpY1RhcmdldHNGcm9tUGFnZU1vZGVsOiBmbkdldFNlbWFudGljVGFyZ2V0c0Zyb21QYWdlTW9kZWwsXG5cdGdldFNlbWFudGljT2JqZWN0c0Zyb21QYXRoOiBmbkdldFNlbWFudGljT2JqZWN0c0Zyb21QYXRoLFxuXHR1cGRhdGVTZW1hbnRpY1RhcmdldHM6IGZuVXBkYXRlU2VtYW50aWNUYXJnZXRzTW9kZWwsXG5cdHdhaXRGb3JDb250ZXh0UmVxdWVzdGVkOiB3YWl0Rm9yQ29udGV4dFJlcXVlc3RlZCxcblx0Z2V0RmlsdGVyUmVzdHJpY3Rpb25zQnlQYXRoOiBnZXRGaWx0ZXJSZXN0cmljdGlvbnNCeVBhdGgsXG5cdGdldFNwZWNpZmljQWxsb3dlZEV4cHJlc3Npb246IGdldFNwZWNpZmljQWxsb3dlZEV4cHJlc3Npb24sXG5cdGdldEFkZGl0aW9uYWxQYXJhbXNGb3JDcmVhdGU6IGdldEFkZGl0aW9uYWxQYXJhbXNGb3JDcmVhdGUsXG5cdHJlcXVlc3RTaW5nbGV0b25Qcm9wZXJ0eTogcmVxdWVzdFNpbmdsZXRvblByb3BlcnR5LFxuXHR0ZW1wbGF0ZUNvbnRyb2xGcmFnbWVudDogdGVtcGxhdGVDb250cm9sRnJhZ21lbnQsXG5cdEZpbHRlclJlc3RyaWN0aW9uczoge1xuXHRcdFJFUVVJUkVEX1BST1BFUlRJRVM6IFwiUmVxdWlyZWRQcm9wZXJ0aWVzXCIsXG5cdFx0Tk9OX0ZJTFRFUkFCTEVfUFJPUEVSVElFUzogXCJOb25GaWx0ZXJhYmxlUHJvcGVydGllc1wiLFxuXHRcdEFMTE9XRURfRVhQUkVTU0lPTlM6IFwiRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zXCJcblx0fSxcblx0QWxsb3dlZEV4cHJlc3Npb25zUHJpbzogW1wiU2luZ2xlVmFsdWVcIiwgXCJNdWx0aVZhbHVlXCIsIFwiU2luZ2xlUmFuZ2VcIiwgXCJNdWx0aVJhbmdlXCIsIFwiU2VhcmNoRXhwcmVzc2lvblwiLCBcIk11bHRpUmFuZ2VPclNlYXJjaEV4cHJlc3Npb25cIl0sXG5cdG5vcm1hbGl6ZVNlYXJjaFRlcm06IG5vcm1hbGl6ZVNlYXJjaFRlcm0sXG5cdHNldENvbnRleHRzQmFzZWRPbk9wZXJhdGlvbkF2YWlsYWJsZTogc2V0Q29udGV4dHNCYXNlZE9uT3BlcmF0aW9uQXZhaWxhYmxlLFxuXHRzZXREeW5hbWljQWN0aW9uQ29udGV4dHM6IHNldER5bmFtaWNBY3Rpb25Db250ZXh0cyxcblx0cmVxdWVzdFByb3BlcnR5OiByZXF1ZXN0UHJvcGVydHksXG5cdGdldFBhcmFtZXRlclBhdGg6IGdldFBhcmFtZXRlclBhdGgsXG5cdGdldFJlbGF0ZWRBcHBzTWVudUl0ZW1zOiBfZ2V0UmVsYXRlZEFwcHNNZW51SXRlbXMsXG5cdGdldFRyYW5zbGF0ZWRUZXh0RnJvbUV4cEJpbmRpbmdTdHJpbmc6IF9mbnRyYW5zbGF0ZWRUZXh0RnJvbUV4cEJpbmRpbmdTdHJpbmcsXG5cdGFkZFNlbWFudGljRGF0ZXNUb0NvbmRpdGlvbnM6IGFkZFNlbWFudGljRGF0ZXNUb0NvbmRpdGlvbnMsXG5cdGFkZFNlbGVjdE9wdGlvblRvQ29uZGl0aW9uczogYWRkU2VsZWN0T3B0aW9uVG9Db25kaXRpb25zLFxuXHRjcmVhdGVTZW1hbnRpY0RhdGVzRnJvbUNvbmRpdGlvbnM6IGNyZWF0ZVNlbWFudGljRGF0ZXNGcm9tQ29uZGl0aW9ucyxcblx0dXBkYXRlUmVsYXRlQXBwc01vZGVsOiB1cGRhdGVSZWxhdGVBcHBzTW9kZWwsXG5cdGdldFNlbWFudGljT2JqZWN0QW5ub3RhdGlvbnM6IF9nZXRTZW1hbnRpY09iamVjdEFubm90YXRpb25zLFxuXHRnZXRGaWx0ZXJzSW5mb0ZvclNWOiBnZXRGaWx0ZXJzSW5mb0ZvclNWLFxuXHRnZXRJbnRlcm5hbENoYXJ0TmFtZUZyb21Qcm9wZXJ0eU5hbWVBbmRLaW5kOiBnZXRJbnRlcm5hbENoYXJ0TmFtZUZyb21Qcm9wZXJ0eU5hbWVBbmRLaW5kLFxuXHRnZXRDaGFydFByb3BlcnRpZXNXaXRob3V0UHJlZml4ZXM6IGdldENoYXJ0UHJvcGVydGllc1dpdGhvdXRQcmVmaXhlcyxcblx0aXNTbWFsbERldmljZSxcblx0Z2V0Q29udmVydGVyQ29udGV4dEZvclBhdGhcbn07XG5cbmV4cG9ydCBkZWZhdWx0IENvbW1vblV0aWxzO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7O0VBOEVBLFNBQVNBLG1CQUFtQixDQUFDQyxXQUFtQixFQUFFO0lBQ2pELElBQUksQ0FBQ0EsV0FBVyxFQUFFO01BQ2pCLE9BQU9DLFNBQVM7SUFDakI7SUFFQSxPQUFPRCxXQUFXLENBQ2hCRSxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUNsQkEsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztJQUFBLENBQ3ZCQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQ1pDLE1BQU0sQ0FBQyxVQUFVQyxXQUErQixFQUFFQyxZQUFvQixFQUFFO01BQ3hFLElBQUlBLFlBQVksS0FBSyxFQUFFLEVBQUU7UUFDeEJELFdBQVcsR0FBSSxHQUFFQSxXQUFXLEdBQUksR0FBRUEsV0FBWSxHQUFFLEdBQUcsRUFBRyxJQUFHQyxZQUFhLEdBQUU7TUFDekU7TUFDQSxPQUFPRCxXQUFXO0lBQ25CLENBQUMsRUFBRUosU0FBUyxDQUFDO0VB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