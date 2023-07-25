/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/deepClone", "sap/base/util/deepEqual", "sap/base/util/isPlainObject", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/KeepAliveHelper", "sap/fe/core/helpers/ToES6Promise", "sap/fe/core/templating/SemanticObjectHelper", "sap/fe/macros/field/FieldHelper", "sap/fe/macros/field/FieldRuntime", "sap/fe/navigation/SelectionVariant", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/mdc/link/Factory", "sap/ui/mdc/link/LinkItem", "sap/ui/mdc/link/SemanticObjectMapping", "sap/ui/mdc/link/SemanticObjectMappingItem", "sap/ui/mdc/link/SemanticObjectUnavailableAction", "sap/ui/mdc/LinkDelegate", "sap/ui/model/json/JSONModel"], function (Log, deepClone, deepEqual, isPlainObject, CommonUtils, KeepAliveHelper, toES6Promise, SemanticObjectHelper, FieldHelper, FieldRuntime, SelectionVariant, Core, Fragment, XMLPreprocessor, XMLTemplateProcessor, Factory, LinkItem, SemanticObjectMapping, SemanticObjectMappingItem, SemanticObjectUnavailableAction, LinkDelegate, JSONModel) {
  "use strict";

  var getDynamicPathFromSemanticObject = SemanticObjectHelper.getDynamicPathFromSemanticObject;
  const SimpleLinkDelegate = Object.assign({}, LinkDelegate);
  const CONSTANTS = {
    iLinksShownInPopup: 3,
    sapmLink: "sap.m.Link",
    sapuimdcLink: "sap.ui.mdc.Link",
    sapuimdclinkLinkItem: "sap.ui.mdc.link.LinkItem",
    sapmObjectIdentifier: "sap.m.ObjectIdentifier",
    sapmObjectStatus: "sap.m.ObjectStatus"
  };
  SimpleLinkDelegate.getConstants = function () {
    return CONSTANTS;
  };
  /**
   * This will return an array of the SemanticObjects as strings given by the payload.
   *
   * @private
   * @param oPayload The payload defined by the application
   * @param oMetaModel The ODataMetaModel received from the Link
   * @returns The context pointing to the current EntityType.
   */
  SimpleLinkDelegate._getEntityType = function (oPayload, oMetaModel) {
    if (oMetaModel) {
      return oMetaModel.createBindingContext(oPayload.entityType);
    } else {
      return undefined;
    }
  };
  /**
   * This will return an array of the SemanticObjects as strings given by the payload.
   *
   * @private
   * @param oPayload The payload defined by the application
   * @param oMetaModel The ODataMetaModel received from the Link
   * @returns A model containing the payload information
   */
  SimpleLinkDelegate._getSemanticsModel = function (oPayload, oMetaModel) {
    if (oMetaModel) {
      return new JSONModel(oPayload);
    } else {
      return undefined;
    }
  };
  /**
   * This will return an array of the SemanticObjects as strings given by the payload.
   *
   * @private
   * @param oPayload The payload defined by the application
   * @param oMetaModel The ODataMetaModel received from the Link
   * @returns An array containing SemanticObjects based of the payload
   */
  SimpleLinkDelegate._getDataField = function (oPayload, oMetaModel) {
    return oMetaModel.createBindingContext(oPayload.dataField);
  };
  /**
   * This will return an array of the SemanticObjects as strings given by the payload.
   *
   * @private
   * @param oPayload The payload defined by the application
   * @param oMetaModel The ODataMetaModel received from the Link
   * @returns Ancontaining SemanticObjects based of the payload
   */
  SimpleLinkDelegate._getContact = function (oPayload, oMetaModel) {
    return oMetaModel.createBindingContext(oPayload.contact);
  };
  SimpleLinkDelegate.fnTemplateFragment = function () {
    let sFragmentName, titleLinkHref;
    const oFragmentModel = {};
    let oPayloadToUse;

    // payload has been modified by fetching Semantic Objects names with path
    if (this.resolvedpayload) {
      oPayloadToUse = this.resolvedpayload;
    } else {
      oPayloadToUse = this.payload;
    }
    if (oPayloadToUse && !oPayloadToUse.LinkId) {
      oPayloadToUse.LinkId = this.oControl && this.oControl.isA(CONSTANTS.sapuimdcLink) ? this.oControl.getId() : undefined;
    }
    if (oPayloadToUse.LinkId) {
      titleLinkHref = this.oControl.getModel("$sapuimdcLink").getProperty("/titleLinkHref");
      oPayloadToUse.titlelink = titleLinkHref;
    }
    const oSemanticsModel = this._getSemanticsModel(oPayloadToUse, this.oMetaModel);
    this.semanticModel = oSemanticsModel;
    if (oPayloadToUse.entityType && this._getEntityType(oPayloadToUse, this.oMetaModel)) {
      sFragmentName = "sap.fe.macros.quickView.fragments.EntityQuickView";
      oFragmentModel.bindingContexts = {
        entityType: this._getEntityType(oPayloadToUse, this.oMetaModel),
        semantic: oSemanticsModel.createBindingContext("/")
      };
      oFragmentModel.models = {
        entityType: this.oMetaModel,
        semantic: oSemanticsModel
      };
    } else if (oPayloadToUse.dataField && this._getDataField(oPayloadToUse, this.oMetaModel)) {
      sFragmentName = "sap.fe.macros.quickView.fragments.DataFieldQuickView";
      oFragmentModel.bindingContexts = {
        dataField: this._getDataField(oPayloadToUse, this.oMetaModel),
        semantic: oSemanticsModel.createBindingContext("/")
      };
      oFragmentModel.models = {
        dataField: this.oMetaModel,
        semantic: oSemanticsModel
      };
    }
    oFragmentModel.models.entitySet = this.oMetaModel;
    oFragmentModel.models.metaModel = this.oMetaModel;
    if (this.oControl && this.oControl.getModel("viewData")) {
      oFragmentModel.models.viewData = this.oControl.getModel("viewData");
      oFragmentModel.bindingContexts.viewData = this.oControl.getModel("viewData").createBindingContext("/");
    }
    const oFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment");
    return Promise.resolve(XMLPreprocessor.process(oFragment, {
      name: sFragmentName
    }, oFragmentModel)).then(_internalFragment => {
      return Fragment.load({
        definition: _internalFragment,
        controller: this
      });
    }).then(oPopoverContent => {
      if (oPopoverContent) {
        if (oFragmentModel.models && oFragmentModel.models.semantic) {
          oPopoverContent.setModel(oFragmentModel.models.semantic, "semantic");
          oPopoverContent.setBindingContext(oFragmentModel.bindingContexts.semantic, "semantic");
        }
        if (oFragmentModel.bindingContexts && oFragmentModel.bindingContexts.entityType) {
          oPopoverContent.setModel(oFragmentModel.models.entityType, "entityType");
          oPopoverContent.setBindingContext(oFragmentModel.bindingContexts.entityType, "entityType");
        }
      }
      this.resolvedpayload = undefined;
      return oPopoverContent;
    });
  };
  SimpleLinkDelegate.fetchAdditionalContent = function (oPayLoad, oMdcLinkControl) {
    var _oPayLoad$navigationP;
    this.oControl = oMdcLinkControl;
    const aNavigateRegexpMatch = oPayLoad === null || oPayLoad === void 0 ? void 0 : (_oPayLoad$navigationP = oPayLoad.navigationPath) === null || _oPayLoad$navigationP === void 0 ? void 0 : _oPayLoad$navigationP.match(/{(.*?)}/);
    const oBindingContext = aNavigateRegexpMatch && aNavigateRegexpMatch.length > 1 && aNavigateRegexpMatch[1] ? oMdcLinkControl.getModel().bindContext(aNavigateRegexpMatch[1], oMdcLinkControl.getBindingContext(), {
      $$ownRequest: true
    }) : null;
    this.payload = oPayLoad;
    if (oMdcLinkControl && oMdcLinkControl.isA(CONSTANTS.sapuimdcLink)) {
      this.oMetaModel = oMdcLinkControl.getModel().getMetaModel();
      return this.fnTemplateFragment().then(function (oPopoverContent) {
        if (oBindingContext) {
          oPopoverContent.setBindingContext(oBindingContext.getBoundContext());
        }
        return [oPopoverContent];
      });
    }
    return Promise.resolve([]);
  };
  SimpleLinkDelegate._fetchLinkCustomData = function (_oLink) {
    if (_oLink.getParent() && _oLink.isA(CONSTANTS.sapuimdcLink) && (_oLink.getParent().isA(CONSTANTS.sapmLink) || _oLink.getParent().isA(CONSTANTS.sapmObjectIdentifier) || _oLink.getParent().isA(CONSTANTS.sapmObjectStatus))) {
      return _oLink.getCustomData();
    } else {
      return undefined;
    }
  };
  /**
   * Fetches the relevant {@link sap.ui.mdc.link.LinkItem} for the Link and returns them.
   *
   * @public
   * @param oPayload The Payload of the Link given by the application
   * @param oBindingContext The ContextObject of the Link
   * @param oInfoLog The InfoLog of the Link
   * @returns Once resolved an array of {@link sap.ui.mdc.link.LinkItem} is returned
   */
  SimpleLinkDelegate.fetchLinkItems = function (oPayload, oBindingContext, oInfoLog) {
    if (oBindingContext && SimpleLinkDelegate._getSemanticObjects(oPayload)) {
      const oContextObject = oBindingContext.getObject();
      if (oInfoLog) {
        oInfoLog.initialize(SimpleLinkDelegate._getSemanticObjects(oPayload));
      }
      const _oLinkCustomData = this._link && this._fetchLinkCustomData(this._link);
      this.aLinkCustomData = _oLinkCustomData && this._fetchLinkCustomData(this._link).map(function (linkItem) {
        return linkItem.mProperties.value;
      });
      const oSemanticAttributesResolved = SimpleLinkDelegate._calculateSemanticAttributes(oContextObject, oPayload, oInfoLog, this._link);
      const oSemanticAttributes = oSemanticAttributesResolved.results;
      const oPayloadResolved = oSemanticAttributesResolved.payload;
      return SimpleLinkDelegate._retrieveNavigationTargets("", oSemanticAttributes, oPayloadResolved, oInfoLog, this._link).then(function (aLinks) {
        return aLinks.length === 0 ? null : aLinks;
      });
    } else {
      return Promise.resolve(null);
    }
  };

  /**
   * Find the type of the link.
   *
   * @param payload The payload of the mdc link.
   * @param aLinkItems Links returned by call to mdc _retrieveUnmodifiedLinkItems.
   * @returns The type of the link as defined by mdc.
   */
  SimpleLinkDelegate._findLinkType = function (payload, aLinkItems) {
    let nLinkType, oLinkItem;
    if ((aLinkItems === null || aLinkItems === void 0 ? void 0 : aLinkItems.length) === 1) {
      oLinkItem = new LinkItem({
        text: aLinkItems[0].getText(),
        href: aLinkItems[0].getHref()
      });
      nLinkType = payload.hasQuickViewFacets === "false" ? 1 : 2;
    } else if (payload.hasQuickViewFacets === "false" && (aLinkItems === null || aLinkItems === void 0 ? void 0 : aLinkItems.length) === 0) {
      nLinkType = 0;
    } else {
      nLinkType = 2;
    }
    return {
      linkType: nLinkType,
      linkItem: oLinkItem
    };
  };
  SimpleLinkDelegate.fetchLinkType = async function (oPayload, oLink) {
    const _oCurrentLink = oLink;
    const _oPayload = Object.assign({}, oPayload);
    const oDefaultInitialType = {
      initialType: {
        type: 2,
        directLink: undefined
      },
      runtimeType: undefined
    };
    // clean appStateKeyMap storage
    if (!this.appStateKeyMap) {
      this.appStateKeyMap = {};
    }
    try {
      var _oPayload$contact;
      if (_oPayload !== null && _oPayload !== void 0 && _oPayload.semanticObjects) {
        this._link = oLink;
        let aLinkItems = await _oCurrentLink._retrieveUnmodifiedLinkItems();
        if (aLinkItems.length === 1) {
          // This is the direct navigation use case so we need to perform the appropriate checks / transformations
          aLinkItems = await _oCurrentLink.retrieveLinkItems();
        }
        const _LinkType = SimpleLinkDelegate._findLinkType(_oPayload, aLinkItems);
        return {
          initialType: {
            type: _LinkType.linkType,
            directLink: _LinkType.linkItem ? _LinkType.linkItem : undefined
          },
          runtimeType: undefined
        };
      } else if ((_oPayload === null || _oPayload === void 0 ? void 0 : (_oPayload$contact = _oPayload.contact) === null || _oPayload$contact === void 0 ? void 0 : _oPayload$contact.length) > 0) {
        return oDefaultInitialType;
      } else if (_oPayload !== null && _oPayload !== void 0 && _oPayload.entityType && _oPayload !== null && _oPayload !== void 0 && _oPayload.navigationPath) {
        return oDefaultInitialType;
      }
      throw new Error("no payload or semanticObjects found");
    } catch (oError) {
      Log.error("Error in SimpleLinkDelegate.fetchLinkType: ", oError);
    }
  };
  SimpleLinkDelegate._RemoveTitleLinkFromTargets = function (_aLinkItems, _bTitleHasLink, _aTitleLink) {
    let _sTitleLinkHref, _oMDCLink;
    let bResult = false;
    if (_bTitleHasLink && _aTitleLink && _aTitleLink[0]) {
      let linkIsPrimaryAction, _sLinkIntentWithoutParameters;
      const _sTitleIntent = _aTitleLink[0].intent.split("?")[0];
      if (_aLinkItems && _aLinkItems[0]) {
        _sLinkIntentWithoutParameters = `#${_aLinkItems[0].getProperty("key")}`;
        linkIsPrimaryAction = _sTitleIntent === _sLinkIntentWithoutParameters;
        if (linkIsPrimaryAction) {
          _sTitleLinkHref = _aLinkItems[0].getProperty("href");
          this.payload.titlelinkhref = _sTitleLinkHref;
          if (_aLinkItems[0].isA(CONSTANTS.sapuimdclinkLinkItem)) {
            _oMDCLink = _aLinkItems[0].getParent();
            _oMDCLink.getModel("$sapuimdcLink").setProperty("/titleLinkHref", _sTitleLinkHref);
            const aMLinkItems = _oMDCLink.getModel("$sapuimdcLink").getProperty("/linkItems").filter(function (oLinkItem) {
              if (`#${oLinkItem.key}` !== _sLinkIntentWithoutParameters) {
                return oLinkItem;
              }
            });
            if (aMLinkItems && aMLinkItems.length > 0) {
              _oMDCLink.getModel("$sapuimdcLink").setProperty("/linkItems/", aMLinkItems);
            }
            bResult = true;
          }
        }
      }
    }
    return bResult;
  };
  SimpleLinkDelegate._IsSemanticObjectDynamic = function (aNewLinkCustomData, oThis) {
    if (aNewLinkCustomData && oThis.aLinkCustomData) {
      return oThis.aLinkCustomData.filter(function (link) {
        return aNewLinkCustomData.filter(function (otherLink) {
          return otherLink !== link;
        }).length > 0;
      }).length > 0;
    } else {
      return false;
    }
  };
  SimpleLinkDelegate._getLineContext = function (oView, mLineContext) {
    if (!mLineContext) {
      if (oView.getAggregation("content")[0] && oView.getAggregation("content")[0].getBindingContext()) {
        return oView.getAggregation("content")[0].getBindingContext();
      }
    }
    return mLineContext;
  };
  SimpleLinkDelegate._setFilterContextUrlForSelectionVariant = function (oView, oSelectionVariant, oNavigationService) {
    if (oView.getViewData().entitySet && oSelectionVariant) {
      const sContextUrl = oNavigationService.constructContextUrl(oView.getViewData().entitySet, oView.getModel());
      oSelectionVariant.setFilterContextUrl(sContextUrl);
    }
    return oSelectionVariant;
  };
  SimpleLinkDelegate._setObjectMappings = function (sSemanticObject, oParams, aSemanticObjectMappings, oSelectionVariant) {
    let hasChanged = false;
    const modifiedSelectionVariant = new SelectionVariant(oSelectionVariant.toJSONObject());
    // if semanticObjectMappings has items with dynamic semanticObjects we need to resolve them using oParams
    aSemanticObjectMappings.forEach(function (mapping) {
      let mappingSemanticObject = mapping.semanticObject;
      const mappingSemanticObjectPath = getDynamicPathFromSemanticObject(mapping.semanticObject);
      if (mappingSemanticObjectPath && oParams[mappingSemanticObjectPath]) {
        mappingSemanticObject = oParams[mappingSemanticObjectPath];
      }
      if (sSemanticObject === mappingSemanticObject) {
        const oMappings = mapping.items;
        for (const i in oMappings) {
          const sLocalProperty = oMappings[i].key;
          const sSemanticObjectProperty = oMappings[i].value;
          if (sLocalProperty !== sSemanticObjectProperty) {
            if (oParams[sLocalProperty]) {
              modifiedSelectionVariant.removeParameter(sSemanticObjectProperty);
              modifiedSelectionVariant.removeSelectOption(sSemanticObjectProperty);
              modifiedSelectionVariant.renameParameter(sLocalProperty, sSemanticObjectProperty);
              modifiedSelectionVariant.renameSelectOption(sLocalProperty, sSemanticObjectProperty);
              oParams[sSemanticObjectProperty] = oParams[sLocalProperty];
              delete oParams[sLocalProperty];
              hasChanged = true;
            }
            // We remove the parameter as there is no value

            // The local property comes from a navigation property
            else if (sLocalProperty.split("/").length > 1) {
              // find the property to be removed
              const propertyToBeRemoved = sLocalProperty.split("/").slice(-1)[0];
              // The navigation property has no value
              if (!oParams[propertyToBeRemoved]) {
                delete oParams[propertyToBeRemoved];
                modifiedSelectionVariant.removeParameter(propertyToBeRemoved);
                modifiedSelectionVariant.removeSelectOption(propertyToBeRemoved);
              } else if (propertyToBeRemoved !== sSemanticObjectProperty) {
                // The navigation property has a value and properties names are different
                modifiedSelectionVariant.renameParameter(propertyToBeRemoved, sSemanticObjectProperty);
                modifiedSelectionVariant.renameSelectOption(propertyToBeRemoved, sSemanticObjectProperty);
                oParams[sSemanticObjectProperty] = oParams[propertyToBeRemoved];
                delete oParams[propertyToBeRemoved];
              }
            } else {
              delete oParams[sLocalProperty];
              modifiedSelectionVariant.removeParameter(sSemanticObjectProperty);
              modifiedSelectionVariant.removeSelectOption(sSemanticObjectProperty);
            }
          }
        }
      }
    });
    return {
      params: oParams,
      hasChanged,
      selectionVariant: modifiedSelectionVariant
    };
  };

  /**
   * Call getAppStateKeyAndUrlParameters in navigation service and cache its results.
   *
   * @param _this The instance of quickviewdelegate.
   * @param navigationService The navigation service.
   * @param selectionVariant The current selection variant.
   * @param semanticObject The current semanticObject.
   */
  SimpleLinkDelegate._getAppStateKeyAndUrlParameters = async function (_this, navigationService, selectionVariant, semanticObject) {
    var _this$appStateKeyMap$;
    let aValues = [];

    // check if default cache contains already the unmodified selectionVariant
    if (deepEqual(selectionVariant, (_this$appStateKeyMap$ = _this.appStateKeyMap[""]) === null || _this$appStateKeyMap$ === void 0 ? void 0 : _this$appStateKeyMap$.selectionVariant)) {
      const defaultCache = _this.appStateKeyMap[""];
      return [defaultCache.semanticAttributes, defaultCache.appstatekey];
    }
    // update url parameters because there is a change in selection variant
    if (_this.appStateKeyMap[`${semanticObject}`] === undefined || !deepEqual(_this.appStateKeyMap[`${semanticObject}`].selectionVariant, selectionVariant)) {
      aValues = await toES6Promise(navigationService.getAppStateKeyAndUrlParameters(selectionVariant.toJSONString()));
      _this.appStateKeyMap[`${semanticObject}`] = {
        semanticAttributes: aValues[0],
        appstatekey: aValues[1],
        selectionVariant: selectionVariant
      };
    } else {
      const cache = _this.appStateKeyMap[`${semanticObject}`];
      aValues = [cache.semanticAttributes, cache.appstatekey];
    }
    return aValues;
  };
  SimpleLinkDelegate._getLinkItemWithNewParameter = async function (_that, _bTitleHasLink, _aTitleLink, _oLinkItem, _oShellServices, _oPayload, _oParams, _sAppStateKey, _oSelectionVariant, _oNavigationService) {
    return _oShellServices.expandCompactHash(_oLinkItem.getHref()).then(async function (sHash) {
      const oShellHash = _oShellServices.parseShellHash(sHash);
      const params = Object.assign({}, _oParams);
      const {
        params: oNewParams,
        hasChanged,
        selectionVariant: newSelectionVariant
      } = SimpleLinkDelegate._setObjectMappings(oShellHash.semanticObject, params, _oPayload.semanticObjectMappings, _oSelectionVariant);
      if (hasChanged) {
        const aValues = await SimpleLinkDelegate._getAppStateKeyAndUrlParameters(_that, _oNavigationService, newSelectionVariant, oShellHash.semanticObject);
        _sAppStateKey = aValues[1];
      }
      const oNewShellHash = {
        target: {
          semanticObject: oShellHash.semanticObject,
          action: oShellHash.action
        },
        params: oNewParams,
        appStateKey: _sAppStateKey
      };
      delete oNewShellHash.params["sap-xapp-state"];
      _oLinkItem.setHref(`#${_oShellServices.constructShellHash(oNewShellHash)}`);
      _oPayload.aSemanticLinks.push(_oLinkItem.getHref());
      // The link is removed from the target list because the title link has same target.
      return SimpleLinkDelegate._RemoveTitleLinkFromTargets.bind(_that)([_oLinkItem], _bTitleHasLink, _aTitleLink);
    });
  };
  SimpleLinkDelegate._removeEmptyLinkItem = function (aLinkItems) {
    return aLinkItems.filter(linkItem => {
      return linkItem !== undefined;
    });
  };
  /**
   * Enables the modification of LinkItems before the popover opens. This enables additional parameters
   * to be added to the link.
   *
   * @param oPayload The payload of the Link given by the application
   * @param oBindingContext The binding context of the Link
   * @param aLinkItems The LinkItems of the Link that can be modified
   * @returns Once resolved an array of {@link sap.ui.mdc.link.LinkItem} is returned
   */
  SimpleLinkDelegate.modifyLinkItems = async function (oPayload, oBindingContext, aLinkItems) {
    if (aLinkItems.length !== 0) {
      this.payload = oPayload;
      const oLink = aLinkItems[0].getParent();
      const oView = CommonUtils.getTargetView(oLink);
      const oAppComponent = CommonUtils.getAppComponent(oView);
      const primaryActionIsActive = await FieldHelper.checkPrimaryActions(oPayload, true, oAppComponent);
      const aTitleLink = primaryActionIsActive.titleLink;
      const bTitleHasLink = primaryActionIsActive.hasTitleLink;
      const oShellServices = oAppComponent.getShellServices();
      if (!oShellServices.hasUShell()) {
        Log.error("QuickViewDelegate: Cannot retrieve the shell services");
        return Promise.reject();
      }
      const oMetaModel = oView.getModel().getMetaModel();
      let mLineContext = oLink.getBindingContext();
      const oTargetInfo = {
        semanticObject: oPayload.mainSemanticObject,
        action: ""
      };
      try {
        const aNewLinkCustomData = oLink && this._fetchLinkCustomData(oLink).map(function (linkItem) {
          return linkItem.mProperties.value;
        });
        // check if all link items in this.aLinkCustomData are also present in aNewLinkCustomData
        if (SimpleLinkDelegate._IsSemanticObjectDynamic(aNewLinkCustomData, this)) {
          // if the customData changed there are different LinkItems to display
          const oSemanticAttributesResolved = SimpleLinkDelegate._calculateSemanticAttributes(oBindingContext.getObject(), oPayload, undefined, this._link);
          const oSemanticAttributes = oSemanticAttributesResolved.results;
          const oPayloadResolved = oSemanticAttributesResolved.payload;
          aLinkItems = await SimpleLinkDelegate._retrieveNavigationTargets("", oSemanticAttributes, oPayloadResolved, undefined, this._link);
        }
        const oNavigationService = oAppComponent.getNavigationService();
        const oController = oView.getController();
        let oSelectionVariant;
        let mLineContextData;
        mLineContext = SimpleLinkDelegate._getLineContext(oView, mLineContext);
        const sMetaPath = oMetaModel.getMetaPath(mLineContext.getPath());
        mLineContextData = oController._intentBasedNavigation.removeSensitiveData(mLineContext.getObject(), sMetaPath);
        mLineContextData = oController._intentBasedNavigation.prepareContextForExternalNavigation(mLineContextData, mLineContext);
        oSelectionVariant = oNavigationService.mixAttributesAndSelectionVariant(mLineContextData.semanticAttributes, {});
        oTargetInfo.propertiesWithoutConflict = mLineContextData.propertiesWithoutConflict;
        //TO modify the selection variant from the Extension API
        oController.intentBasedNavigation.adaptNavigationContext(oSelectionVariant, oTargetInfo);
        SimpleLinkDelegate._removeTechnicalParameters(oSelectionVariant);
        oSelectionVariant = SimpleLinkDelegate._setFilterContextUrlForSelectionVariant(oView, oSelectionVariant, oNavigationService);
        const aValues = await SimpleLinkDelegate._getAppStateKeyAndUrlParameters(this, oNavigationService, oSelectionVariant, "");
        const oParams = aValues[0];
        const appStateKey = aValues[1];
        let titleLinktoBeRemove;
        oPayload.aSemanticLinks = [];
        aLinkItems = SimpleLinkDelegate._removeEmptyLinkItem(aLinkItems);
        for (const index in aLinkItems) {
          titleLinktoBeRemove = await SimpleLinkDelegate._getLinkItemWithNewParameter(this, bTitleHasLink, aTitleLink, aLinkItems[index], oShellServices, oPayload, oParams, appStateKey, oSelectionVariant, oNavigationService);
          if (titleLinktoBeRemove === true) {
            aLinkItems[index] = undefined;
          }
        }
        return SimpleLinkDelegate._removeEmptyLinkItem(aLinkItems);
      } catch (oError) {
        Log.error("Error while getting the navigation service", oError);
        return undefined;
      }
    } else {
      return aLinkItems;
    }
  };
  SimpleLinkDelegate.beforeNavigationCallback = function (oPayload, oEvent) {
    const oSource = oEvent.getSource(),
      sHref = oEvent.getParameter("href"),
      oURLParsing = Factory.getService("URLParsing"),
      oHash = sHref && oURLParsing.parseShellHash(sHref);
    KeepAliveHelper.storeControlRefreshStrategyForHash(oSource, oHash);
    return Promise.resolve(true);
  };
  SimpleLinkDelegate._removeTechnicalParameters = function (oSelectionVariant) {
    oSelectionVariant.removeSelectOption("@odata.context");
    oSelectionVariant.removeSelectOption("@odata.metadataEtag");
    oSelectionVariant.removeSelectOption("SAP__Messages");
  };
  SimpleLinkDelegate._getSemanticObjectCustomDataValue = function (aLinkCustomData, oSemanticObjectsResolved) {
    let sPropertyName, sCustomDataValue;
    for (let iCustomDataCount = 0; iCustomDataCount < aLinkCustomData.length; iCustomDataCount++) {
      sPropertyName = aLinkCustomData[iCustomDataCount].getKey();
      sCustomDataValue = aLinkCustomData[iCustomDataCount].getValue();
      oSemanticObjectsResolved[sPropertyName] = {
        value: sCustomDataValue
      };
    }
  };

  /**
   * Check the semantic object name if it is dynamic or not.
   *
   * @private
   * @param pathOrValue The semantic object path or name
   * @returns True if semantic object is dynamic
   */
  SimpleLinkDelegate._isDynamicPath = function (pathOrValue) {
    if (pathOrValue && pathOrValue.indexOf("{") === 0 && pathOrValue.indexOf("}") === pathOrValue.length - 1) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * Update the payload with semantic object values from custom data of Link.
   *
   * @private
   * @param payload The payload of the mdc link.
   * @param newPayload The new updated payload.
   * @param semanticObjectName The semantic object name resolved.
   */
  SimpleLinkDelegate._updatePayloadWithResolvedSemanticObjectValue = function (payload, newPayload, semanticObjectName) {
    var _newPayload$semanticO;
    if (SimpleLinkDelegate._isDynamicPath(payload.mainSemanticObject)) {
      if (semanticObjectName) {
        newPayload.mainSemanticObject = semanticObjectName;
      } else {
        // no value from Custom Data, so removing mainSemanticObject
        newPayload.mainSemanticObject = undefined;
      }
    }
    switch (typeof semanticObjectName) {
      case "string":
        (_newPayload$semanticO = newPayload.semanticObjectsResolved) === null || _newPayload$semanticO === void 0 ? void 0 : _newPayload$semanticO.push(semanticObjectName);
        newPayload.semanticObjects.push(semanticObjectName);
        break;
      case "object":
        for (const j in semanticObjectName) {
          var _newPayload$semanticO2;
          (_newPayload$semanticO2 = newPayload.semanticObjectsResolved) === null || _newPayload$semanticO2 === void 0 ? void 0 : _newPayload$semanticO2.push(semanticObjectName[j]);
          newPayload.semanticObjects.push(semanticObjectName[j]);
        }
        break;
      default:
    }
  };
  SimpleLinkDelegate._createNewPayloadWithDynamicSemanticObjectsResolved = function (payload, semanticObjectsResolved, newPayload) {
    let semanticObjectName, tmpPropertyName;
    for (const i in payload.semanticObjects) {
      semanticObjectName = payload.semanticObjects[i];
      if (SimpleLinkDelegate._isDynamicPath(semanticObjectName)) {
        tmpPropertyName = semanticObjectName.substr(1, semanticObjectName.indexOf("}") - 1);
        semanticObjectName = semanticObjectsResolved[tmpPropertyName].value;
        SimpleLinkDelegate._updatePayloadWithResolvedSemanticObjectValue(payload, newPayload, semanticObjectName);
      } else {
        newPayload.semanticObjects.push(semanticObjectName);
      }
    }
  };

  /**
   * Update the semantic object name from the resolved value for the mappings attributes.
   *
   * @private
   * @param mdcPayload The payload given by the application.
   * @param mdcPayloadWithDynamicSemanticObjectsResolved The payload with the resolved value for the semantic object name.
   * @param newPayload The new updated payload.
   */
  SimpleLinkDelegate._updateSemanticObjectsForMappings = function (mdcPayload, mdcPayloadWithDynamicSemanticObjectsResolved, newPayload) {
    // update the semantic object name from the resolved ones in the semantic object mappings.
    mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjectMappings.forEach(function (semanticObjectMapping) {
      if (semanticObjectMapping.semanticObject && SimpleLinkDelegate._isDynamicPath(semanticObjectMapping.semanticObject)) {
        semanticObjectMapping.semanticObject = newPayload.semanticObjects[mdcPayload.semanticObjects.indexOf(semanticObjectMapping.semanticObject)];
      }
    });
  };

  /**
   * Update the semantic object name from the resolved value for the unavailable actions.
   *
   * @private
   * @param mdcPayload The payload given by the application.
   * @param mdcPayloadSemanticObjectUnavailableActions The unavailable actions given by the application.
   * @param mdcPayloadWithDynamicSemanticObjectsResolved The updated payload with the resolved value for the semantic object name for the unavailable actions.
   */
  SimpleLinkDelegate._updateSemanticObjectsUnavailableActions = function (mdcPayload, mdcPayloadSemanticObjectUnavailableActions, mdcPayloadWithDynamicSemanticObjectsResolved) {
    let _Index;
    mdcPayloadSemanticObjectUnavailableActions.forEach(function (semanticObjectUnavailableAction) {
      // Dynamic SemanticObject has an unavailable action
      if (semanticObjectUnavailableAction !== null && semanticObjectUnavailableAction !== void 0 && semanticObjectUnavailableAction.semanticObject && SimpleLinkDelegate._isDynamicPath(semanticObjectUnavailableAction.semanticObject)) {
        _Index = mdcPayload.semanticObjects.findIndex(function (semanticObject) {
          return semanticObject === semanticObjectUnavailableAction.semanticObject;
        });
        if (_Index !== undefined) {
          // Get the SemanticObject name resolved to a value
          semanticObjectUnavailableAction.semanticObject = mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjects[_Index];
        }
      }
    });
  };

  /**
   * Update the semantic object name from the resolved value for the unavailable actions.
   *
   * @private
   * @param mdcPayload The updated payload with the information from custom data provided in the link.
   * @param mdcPayloadWithDynamicSemanticObjectsResolved The payload updated with resolved semantic objects names.
   */
  SimpleLinkDelegate._updateSemanticObjectsWithResolvedValue = function (mdcPayload, mdcPayloadWithDynamicSemanticObjectsResolved) {
    for (let newSemanticObjectsCount = 0; newSemanticObjectsCount < mdcPayload.semanticObjects.length; newSemanticObjectsCount++) {
      if (mdcPayloadWithDynamicSemanticObjectsResolved.mainSemanticObject === (mdcPayload.semanticObjectsResolved && mdcPayload.semanticObjectsResolved[newSemanticObjectsCount])) {
        mdcPayloadWithDynamicSemanticObjectsResolved.mainSemanticObject = mdcPayload.semanticObjects[newSemanticObjectsCount];
      }
      if (mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjects[newSemanticObjectsCount]) {
        mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjects[newSemanticObjectsCount] = mdcPayload.semanticObjects[newSemanticObjectsCount];
      } else {
        // no Custom Data value for a Semantic Object name with path
        mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjects.splice(newSemanticObjectsCount, 1);
      }
    }
  };

  /**
   * Remove empty semantic object mappings and if there is no semantic object name, link to it.
   *
   * @private
   * @param mdcPayloadWithDynamicSemanticObjectsResolved The payload used to check the mappings of the semantic objects.
   */
  SimpleLinkDelegate._removeEmptySemanticObjectsMappings = function (mdcPayloadWithDynamicSemanticObjectsResolved) {
    // remove undefined Semantic Object Mapping
    for (let mappingsCount = 0; mappingsCount < mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjectMappings.length; mappingsCount++) {
      if (mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjectMappings[mappingsCount] && mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjectMappings[mappingsCount].semanticObject === undefined) {
        mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjectMappings.splice(mappingsCount, 1);
      }
    }
  };
  SimpleLinkDelegate._setPayloadWithDynamicSemanticObjectsResolved = function (payload, newPayload) {
    let oPayloadWithDynamicSemanticObjectsResolved;
    if (newPayload.semanticObjectsResolved && newPayload.semanticObjectsResolved.length > 0) {
      oPayloadWithDynamicSemanticObjectsResolved = {
        entityType: payload.entityType,
        dataField: payload.dataField,
        contact: payload.contact,
        mainSemanticObject: payload.mainSemanticObject,
        navigationPath: payload.navigationPath,
        propertyPathLabel: payload.propertyPathLabel,
        semanticObjectMappings: deepClone(payload.semanticObjectMappings),
        semanticObjects: newPayload.semanticObjects
      };
      SimpleLinkDelegate._updateSemanticObjectsForMappings(payload, oPayloadWithDynamicSemanticObjectsResolved, newPayload);
      const _SemanticObjectUnavailableActions = deepClone(payload.semanticObjectUnavailableActions);
      SimpleLinkDelegate._updateSemanticObjectsUnavailableActions(payload, _SemanticObjectUnavailableActions, oPayloadWithDynamicSemanticObjectsResolved);
      oPayloadWithDynamicSemanticObjectsResolved.semanticObjectUnavailableActions = _SemanticObjectUnavailableActions;
      if (newPayload.mainSemanticObject) {
        oPayloadWithDynamicSemanticObjectsResolved.mainSemanticObject = newPayload.mainSemanticObject;
      } else {
        oPayloadWithDynamicSemanticObjectsResolved.mainSemanticObject = undefined;
      }
      SimpleLinkDelegate._updateSemanticObjectsWithResolvedValue(newPayload, oPayloadWithDynamicSemanticObjectsResolved);
      SimpleLinkDelegate._removeEmptySemanticObjectsMappings(oPayloadWithDynamicSemanticObjectsResolved);
      return oPayloadWithDynamicSemanticObjectsResolved;
    } else {
      return {};
    }
  };
  SimpleLinkDelegate._getPayloadWithDynamicSemanticObjectsResolved = function (payload, linkCustomData) {
    let oPayloadWithDynamicSemanticObjectsResolved;
    const oSemanticObjectsResolved = {};
    const newPayload = {
      semanticObjects: [],
      semanticObjectsResolved: [],
      semanticObjectMappings: []
    };
    if (payload.semanticObjects) {
      // sap.m.Link has custom data with Semantic Objects names resolved
      if (linkCustomData && linkCustomData.length > 0) {
        SimpleLinkDelegate._getSemanticObjectCustomDataValue(linkCustomData, oSemanticObjectsResolved);
        SimpleLinkDelegate._createNewPayloadWithDynamicSemanticObjectsResolved(payload, oSemanticObjectsResolved, newPayload);
        oPayloadWithDynamicSemanticObjectsResolved = SimpleLinkDelegate._setPayloadWithDynamicSemanticObjectsResolved(payload, newPayload);
        return oPayloadWithDynamicSemanticObjectsResolved;
      }
    } else {
      return undefined;
    }
  };
  SimpleLinkDelegate._updatePayloadWithSemanticAttributes = function (aSemanticObjects, oInfoLog, oContextObject, oResults, mSemanticObjectMappings) {
    aSemanticObjects.forEach(function (sSemanticObject) {
      if (oInfoLog) {
        oInfoLog.addContextObject(sSemanticObject, oContextObject);
      }
      oResults[sSemanticObject] = {};
      for (const sAttributeName in oContextObject) {
        let oAttribute = null,
          oTransformationAdditional = null;
        if (oInfoLog) {
          oAttribute = oInfoLog.getSemanticObjectAttribute(sSemanticObject, sAttributeName);
          if (!oAttribute) {
            oAttribute = oInfoLog.createAttributeStructure();
            oInfoLog.addSemanticObjectAttribute(sSemanticObject, sAttributeName, oAttribute);
          }
        }
        // Ignore undefined and null values
        if (oContextObject[sAttributeName] === undefined || oContextObject[sAttributeName] === null) {
          if (oAttribute) {
            oAttribute.transformations.push({
              value: undefined,
              description: "\u2139 Undefined and null values have been removed in SimpleLinkDelegate."
            });
          }
          continue;
        }
        // Ignore plain objects (BCP 1770496639)
        if (isPlainObject(oContextObject[sAttributeName])) {
          if (mSemanticObjectMappings && mSemanticObjectMappings[sSemanticObject]) {
            const aKeys = Object.keys(mSemanticObjectMappings[sSemanticObject]);
            let sNewAttributeNameMapped, sNewAttributeName, sValue, sKey;
            for (let index = 0; index < aKeys.length; index++) {
              sKey = aKeys[index];
              if (sKey.indexOf(sAttributeName) === 0) {
                sNewAttributeNameMapped = mSemanticObjectMappings[sSemanticObject][sKey];
                sNewAttributeName = sKey.split("/")[sKey.split("/").length - 1];
                sValue = oContextObject[sAttributeName][sNewAttributeName];
                if (sNewAttributeNameMapped && sNewAttributeName && sValue) {
                  oResults[sSemanticObject][sNewAttributeNameMapped] = sValue;
                }
              }
            }
          }
          if (oAttribute) {
            oAttribute.transformations.push({
              value: undefined,
              description: "\u2139 Plain objects has been removed in SimpleLinkDelegate."
            });
          }
          continue;
        }

        // Map the attribute name only if 'semanticObjectMapping' is defined.
        // Note: under defined 'semanticObjectMapping' we also mean an empty annotation or an annotation with empty record
        const sAttributeNameMapped = mSemanticObjectMappings && mSemanticObjectMappings[sSemanticObject] && mSemanticObjectMappings[sSemanticObject][sAttributeName] ? mSemanticObjectMappings[sSemanticObject][sAttributeName] : sAttributeName;
        if (oAttribute && sAttributeName !== sAttributeNameMapped) {
          oTransformationAdditional = {
            value: undefined,
            description: `\u2139 The attribute ${sAttributeName} has been renamed to ${sAttributeNameMapped} in SimpleLinkDelegate.`,
            reason: `\ud83d\udd34 A com.sap.vocabularies.Common.v1.SemanticObjectMapping annotation is defined for semantic object ${sSemanticObject} with source attribute ${sAttributeName} and target attribute ${sAttributeNameMapped}. You can modify the annotation if the mapping result is not what you expected.`
          };
        }

        // If more then one local property maps to the same target property (clash situation)
        // we take the value of the last property and write an error log
        if (oResults[sSemanticObject][sAttributeNameMapped]) {
          Log.error(`SimpleLinkDelegate: The attribute ${sAttributeName} can not be renamed to the attribute ${sAttributeNameMapped} due to a clash situation. This can lead to wrong navigation later on.`);
        }

        // Copy the value replacing the attribute name by semantic object name
        oResults[sSemanticObject][sAttributeNameMapped] = oContextObject[sAttributeName];
        if (oAttribute) {
          if (oTransformationAdditional) {
            oAttribute.transformations.push(oTransformationAdditional);
            const aAttributeNew = oInfoLog.createAttributeStructure();
            aAttributeNew.transformations.push({
              value: oContextObject[sAttributeName],
              description: `\u2139 The attribute ${sAttributeNameMapped} with the value ${oContextObject[sAttributeName]} has been added due to a mapping rule regarding the attribute ${sAttributeName} in SimpleLinkDelegate.`
            });
            oInfoLog.addSemanticObjectAttribute(sSemanticObject, sAttributeNameMapped, aAttributeNew);
          }
        }
      }
    });
  };

  /**
   * Checks which attributes of the ContextObject belong to which SemanticObject and maps them into a two dimensional array.
   *
   * @private
   * @param oContextObject The BindingContext of the SourceControl of the Link / of the Link itself if not set
   * @param oPayload The payload given by the application
   * @param oInfoLog The corresponding InfoLog of the Link
   * @param oLink The corresponding Link
   * @returns A two dimensional array which maps a given SemanticObject name together with a given attribute name to the value of that given attribute
   */
  SimpleLinkDelegate._calculateSemanticAttributes = function (oContextObject, oPayload, oInfoLog, oLink) {
    const aLinkCustomData = oLink && this._fetchLinkCustomData(oLink);
    const oPayloadWithDynamicSemanticObjectsResolved = SimpleLinkDelegate._getPayloadWithDynamicSemanticObjectsResolved(oPayload, aLinkCustomData);
    const oPayloadResolved = oPayloadWithDynamicSemanticObjectsResolved ? oPayloadWithDynamicSemanticObjectsResolved : oPayload;
    this.resolvedpayload = oPayloadWithDynamicSemanticObjectsResolved;
    const aSemanticObjects = SimpleLinkDelegate._getSemanticObjects(oPayloadResolved);
    const mSemanticObjectMappings = SimpleLinkDelegate._convertSemanticObjectMapping(SimpleLinkDelegate._getSemanticObjectMappings(oPayloadResolved));
    if (!aSemanticObjects.length) {
      return {
        payload: oPayloadResolved,
        results: {}
      };
    }
    const oResults = {};
    SimpleLinkDelegate._updatePayloadWithSemanticAttributes(aSemanticObjects, oInfoLog, oContextObject, oResults, mSemanticObjectMappings);
    return {
      payload: oPayloadResolved,
      results: oResults
    };
  };
  /**
   * Retrieves the actual targets for the navigation of the link. This uses the UShell loaded by the {@link sap.ui.mdc.link.Factory} to retrieve
   * the navigation targets from the FLP service.
   *
   * @private
   * @param sAppStateKey Key of the appstate (not used yet)
   * @param oSemanticAttributes The calculated by _calculateSemanticAttributes
   * @param oPayload The payload given by the application
   * @param oInfoLog The corresponding InfoLog of the Link
   * @param oLink The corresponding Link
   * @returns Resolving into availableAtions and ownNavigation containing an array of {@link sap.ui.mdc.link.LinkItem}
   */
  SimpleLinkDelegate._retrieveNavigationTargets = function (sAppStateKey, oSemanticAttributes, oPayload, oInfoLog, oLink) {
    if (!oPayload.semanticObjects) {
      return Promise.resolve([]);
    }
    const aSemanticObjects = oPayload.semanticObjects;
    const oNavigationTargets = {
      ownNavigation: undefined,
      availableActions: []
    };
    let iSuperiorActionLinksFound = 0;
    return Core.loadLibrary("sap.ui.fl", {
      async: true
    }).then(() => {
      return new Promise(resolve => {
        sap.ui.require(["sap/ui/fl/Utils"], async Utils => {
          const oAppComponent = Utils.getAppComponentForControl(oLink === undefined ? this.oControl : oLink);
          const oShellServices = oAppComponent ? oAppComponent.getShellServices() : null;
          if (!oShellServices) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
          }
          if (!oShellServices.hasUShell()) {
            Log.error("SimpleLinkDelegate: Service 'CrossApplicationNavigation' or 'URLParsing' could not be obtained");
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
          }
          const aParams = aSemanticObjects.map(function (sSemanticObject) {
            return [{
              semanticObject: sSemanticObject,
              params: oSemanticAttributes ? oSemanticAttributes[sSemanticObject] : undefined,
              appStateKey: sAppStateKey,
              sortResultsBy: "text"
            }];
          });
          try {
            const aLinks = await oShellServices.getLinks(aParams);
            let bHasLinks = false;
            for (let i = 0; i < aLinks.length; i++) {
              for (let j = 0; j < aLinks[i].length; j++) {
                if (aLinks[i][j].length > 0) {
                  bHasLinks = true;
                  break;
                }
                if (bHasLinks) {
                  break;
                }
              }
            }
            if (!aLinks || !aLinks.length || !bHasLinks) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
            }
            const aSemanticObjectUnavailableActions = SimpleLinkDelegate._getSemanticObjectUnavailableActions(oPayload);
            const oUnavailableActions = SimpleLinkDelegate._convertSemanticObjectUnavailableAction(aSemanticObjectUnavailableActions);
            let sCurrentHash = FieldRuntime._fnFixHashQueryString(oAppComponent.getShellServices().getHash());
            if (sCurrentHash) {
              // BCP 1770315035: we have to set the end-point '?' of action in order to avoid matching of "#SalesOrder-manage" in "#SalesOrder-manageFulfillment"
              sCurrentHash += "?";
            }
            const fnIsUnavailableAction = function (sSemanticObject, sAction) {
              return !!oUnavailableActions && !!oUnavailableActions[sSemanticObject] && oUnavailableActions[sSemanticObject].indexOf(sAction) > -1;
            };
            const fnAddLink = function (_oLink) {
              const oShellHash = oShellServices.parseShellHash(_oLink.intent);
              if (fnIsUnavailableAction(oShellHash.semanticObject, oShellHash.action)) {
                return;
              }
              const sHref = `#${oShellServices.constructShellHash({
                target: {
                  shellHash: _oLink.intent
                }
              })}`;
              if (_oLink.intent && _oLink.intent.indexOf(sCurrentHash) === 0) {
                // Prevent current app from being listed
                // NOTE: If the navigation target exists in
                // multiple contexts (~XXXX in hash) they will all be skipped
                oNavigationTargets.ownNavigation = new LinkItem({
                  href: sHref,
                  text: _oLink.text
                });
                return;
              }
              const oLinkItem = new LinkItem({
                // As the retrieveNavigationTargets method can be called several time we can not create the LinkItem instance with the same id
                key: oShellHash.semanticObject && oShellHash.action ? `${oShellHash.semanticObject}-${oShellHash.action}` : undefined,
                text: _oLink.text,
                description: undefined,
                href: sHref,
                // target: not supported yet
                icon: undefined,
                //_oLink.icon,
                initiallyVisible: _oLink.tags && _oLink.tags.indexOf("superiorAction") > -1
              });
              if (oLinkItem.getProperty("initiallyVisible")) {
                iSuperiorActionLinksFound++;
              }
              oNavigationTargets.availableActions.push(oLinkItem);
              if (oInfoLog) {
                oInfoLog.addSemanticObjectIntent(oShellHash.semanticObject, {
                  intent: oLinkItem.getHref(),
                  text: oLinkItem.getText()
                });
              }
            };
            for (let n = 0; n < aSemanticObjects.length; n++) {
              aLinks[n][0].forEach(fnAddLink);
            }
            if (iSuperiorActionLinksFound === 0) {
              for (let iLinkItemIndex = 0; iLinkItemIndex < oNavigationTargets.availableActions.length; iLinkItemIndex++) {
                if (iLinkItemIndex < this.getConstants().iLinksShownInPopup) {
                  oNavigationTargets.availableActions[iLinkItemIndex].setProperty("initiallyVisible", true);
                } else {
                  break;
                }
              }
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
          } catch (oError) {
            Log.error("SimpleLinkDelegate: '_retrieveNavigationTargets' failed executing getLinks method");
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
          }
        });
      });
    });
  };
  SimpleLinkDelegate._getSemanticObjects = function (oPayload) {
    return oPayload.semanticObjects ? oPayload.semanticObjects : [];
  };
  SimpleLinkDelegate._getSemanticObjectUnavailableActions = function (oPayload) {
    const aSemanticObjectUnavailableActions = [];
    if (oPayload.semanticObjectUnavailableActions) {
      oPayload.semanticObjectUnavailableActions.forEach(function (oSemanticObjectUnavailableAction) {
        aSemanticObjectUnavailableActions.push(new SemanticObjectUnavailableAction({
          semanticObject: oSemanticObjectUnavailableAction.semanticObject,
          actions: oSemanticObjectUnavailableAction.actions
        }));
      });
    }
    return aSemanticObjectUnavailableActions;
  };

  /**
   * This will return an array of {@link sap.ui.mdc.link.SemanticObjectMapping} depending on the given payload.
   *
   * @private
   * @param oPayload The payload defined by the application
   * @returns An array of semantic object mappings.
   */
  SimpleLinkDelegate._getSemanticObjectMappings = function (oPayload) {
    const aSemanticObjectMappings = [];
    let aSemanticObjectMappingItems = [];
    if (oPayload.semanticObjectMappings) {
      oPayload.semanticObjectMappings.forEach(function (oSemanticObjectMapping) {
        aSemanticObjectMappingItems = [];
        if (oSemanticObjectMapping.items) {
          oSemanticObjectMapping.items.forEach(function (oSemanticObjectMappingItem) {
            aSemanticObjectMappingItems.push(new SemanticObjectMappingItem({
              key: oSemanticObjectMappingItem.key,
              value: oSemanticObjectMappingItem.value
            }));
          });
        }
        aSemanticObjectMappings.push(new SemanticObjectMapping({
          semanticObject: oSemanticObjectMapping.semanticObject,
          items: aSemanticObjectMappingItems
        }));
      });
    }
    return aSemanticObjectMappings;
  };
  /**
   * Converts a given array of SemanticObjectMapping into a Map containing SemanticObjects as Keys and a Map of it's corresponding SemanticObjectMappings as values.
   *
   * @private
   * @param aSemanticObjectMappings An array of SemanticObjectMappings.
   * @returns The converterd SemanticObjectMappings
   */
  SimpleLinkDelegate._convertSemanticObjectMapping = function (aSemanticObjectMappings) {
    if (!aSemanticObjectMappings.length) {
      return undefined;
    }
    const mSemanticObjectMappings = {};
    aSemanticObjectMappings.forEach(function (oSemanticObjectMapping) {
      if (!oSemanticObjectMapping.getSemanticObject()) {
        throw Error(`SimpleLinkDelegate: 'semanticObject' property with value '${oSemanticObjectMapping.getSemanticObject()}' is not valid`);
      }
      mSemanticObjectMappings[oSemanticObjectMapping.getSemanticObject()] = oSemanticObjectMapping.getItems().reduce(function (oMap, oItem) {
        oMap[oItem.getKey()] = oItem.getValue();
        return oMap;
      }, {});
    });
    return mSemanticObjectMappings;
  };
  /**
   * Converts a given array of SemanticObjectUnavailableActions into a map containing SemanticObjects as keys and a map of its corresponding SemanticObjectUnavailableActions as values.
   *
   * @private
   * @param aSemanticObjectUnavailableActions The SemanticObjectUnavailableActions converted
   * @returns The map containing the converted SemanticObjectUnavailableActions
   */
  SimpleLinkDelegate._convertSemanticObjectUnavailableAction = function (aSemanticObjectUnavailableActions) {
    let _SemanticObjectName;
    let _SemanticObjectHasAlreadyUnavailableActions;
    let _UnavailableActions = [];
    if (!aSemanticObjectUnavailableActions.length) {
      return undefined;
    }
    const mSemanticObjectUnavailableActions = {};
    aSemanticObjectUnavailableActions.forEach(function (oSemanticObjectUnavailableActions) {
      _SemanticObjectName = oSemanticObjectUnavailableActions.getSemanticObject();
      if (!_SemanticObjectName) {
        throw Error(`SimpleLinkDelegate: 'semanticObject' property with value '${_SemanticObjectName}' is not valid`);
      }
      _UnavailableActions = oSemanticObjectUnavailableActions.getActions();
      if (mSemanticObjectUnavailableActions[_SemanticObjectName] === undefined) {
        mSemanticObjectUnavailableActions[_SemanticObjectName] = _UnavailableActions;
      } else {
        _SemanticObjectHasAlreadyUnavailableActions = mSemanticObjectUnavailableActions[_SemanticObjectName];
        _UnavailableActions.forEach(function (UnavailableAction) {
          _SemanticObjectHasAlreadyUnavailableActions.push(UnavailableAction);
        });
        mSemanticObjectUnavailableActions[_SemanticObjectName] = _SemanticObjectHasAlreadyUnavailableActions;
      }
    });
    return mSemanticObjectUnavailableActions;
  };
  return SimpleLinkDelegate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW1wbGVMaW5rRGVsZWdhdGUiLCJPYmplY3QiLCJhc3NpZ24iLCJMaW5rRGVsZWdhdGUiLCJDT05TVEFOVFMiLCJpTGlua3NTaG93bkluUG9wdXAiLCJzYXBtTGluayIsInNhcHVpbWRjTGluayIsInNhcHVpbWRjbGlua0xpbmtJdGVtIiwic2FwbU9iamVjdElkZW50aWZpZXIiLCJzYXBtT2JqZWN0U3RhdHVzIiwiZ2V0Q29uc3RhbnRzIiwiX2dldEVudGl0eVR5cGUiLCJvUGF5bG9hZCIsIm9NZXRhTW9kZWwiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImVudGl0eVR5cGUiLCJ1bmRlZmluZWQiLCJfZ2V0U2VtYW50aWNzTW9kZWwiLCJKU09OTW9kZWwiLCJfZ2V0RGF0YUZpZWxkIiwiZGF0YUZpZWxkIiwiX2dldENvbnRhY3QiLCJjb250YWN0IiwiZm5UZW1wbGF0ZUZyYWdtZW50Iiwic0ZyYWdtZW50TmFtZSIsInRpdGxlTGlua0hyZWYiLCJvRnJhZ21lbnRNb2RlbCIsIm9QYXlsb2FkVG9Vc2UiLCJyZXNvbHZlZHBheWxvYWQiLCJwYXlsb2FkIiwiTGlua0lkIiwib0NvbnRyb2wiLCJpc0EiLCJnZXRJZCIsImdldE1vZGVsIiwiZ2V0UHJvcGVydHkiLCJ0aXRsZWxpbmsiLCJvU2VtYW50aWNzTW9kZWwiLCJzZW1hbnRpY01vZGVsIiwiYmluZGluZ0NvbnRleHRzIiwic2VtYW50aWMiLCJtb2RlbHMiLCJlbnRpdHlTZXQiLCJtZXRhTW9kZWwiLCJ2aWV3RGF0YSIsIm9GcmFnbWVudCIsIlhNTFRlbXBsYXRlUHJvY2Vzc29yIiwibG9hZFRlbXBsYXRlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJYTUxQcmVwcm9jZXNzb3IiLCJwcm9jZXNzIiwibmFtZSIsInRoZW4iLCJfaW50ZXJuYWxGcmFnbWVudCIsIkZyYWdtZW50IiwibG9hZCIsImRlZmluaXRpb24iLCJjb250cm9sbGVyIiwib1BvcG92ZXJDb250ZW50Iiwic2V0TW9kZWwiLCJzZXRCaW5kaW5nQ29udGV4dCIsImZldGNoQWRkaXRpb25hbENvbnRlbnQiLCJvUGF5TG9hZCIsIm9NZGNMaW5rQ29udHJvbCIsImFOYXZpZ2F0ZVJlZ2V4cE1hdGNoIiwibmF2aWdhdGlvblBhdGgiLCJtYXRjaCIsIm9CaW5kaW5nQ29udGV4dCIsImxlbmd0aCIsImJpbmRDb250ZXh0IiwiZ2V0QmluZGluZ0NvbnRleHQiLCIkJG93blJlcXVlc3QiLCJnZXRNZXRhTW9kZWwiLCJnZXRCb3VuZENvbnRleHQiLCJfZmV0Y2hMaW5rQ3VzdG9tRGF0YSIsIl9vTGluayIsImdldFBhcmVudCIsImdldEN1c3RvbURhdGEiLCJmZXRjaExpbmtJdGVtcyIsIm9JbmZvTG9nIiwiX2dldFNlbWFudGljT2JqZWN0cyIsIm9Db250ZXh0T2JqZWN0IiwiZ2V0T2JqZWN0IiwiaW5pdGlhbGl6ZSIsIl9vTGlua0N1c3RvbURhdGEiLCJfbGluayIsImFMaW5rQ3VzdG9tRGF0YSIsIm1hcCIsImxpbmtJdGVtIiwibVByb3BlcnRpZXMiLCJ2YWx1ZSIsIm9TZW1hbnRpY0F0dHJpYnV0ZXNSZXNvbHZlZCIsIl9jYWxjdWxhdGVTZW1hbnRpY0F0dHJpYnV0ZXMiLCJvU2VtYW50aWNBdHRyaWJ1dGVzIiwicmVzdWx0cyIsIm9QYXlsb2FkUmVzb2x2ZWQiLCJfcmV0cmlldmVOYXZpZ2F0aW9uVGFyZ2V0cyIsImFMaW5rcyIsIl9maW5kTGlua1R5cGUiLCJhTGlua0l0ZW1zIiwibkxpbmtUeXBlIiwib0xpbmtJdGVtIiwiTGlua0l0ZW0iLCJ0ZXh0IiwiZ2V0VGV4dCIsImhyZWYiLCJnZXRIcmVmIiwiaGFzUXVpY2tWaWV3RmFjZXRzIiwibGlua1R5cGUiLCJmZXRjaExpbmtUeXBlIiwib0xpbmsiLCJfb0N1cnJlbnRMaW5rIiwiX29QYXlsb2FkIiwib0RlZmF1bHRJbml0aWFsVHlwZSIsImluaXRpYWxUeXBlIiwidHlwZSIsImRpcmVjdExpbmsiLCJydW50aW1lVHlwZSIsImFwcFN0YXRlS2V5TWFwIiwic2VtYW50aWNPYmplY3RzIiwiX3JldHJpZXZlVW5tb2RpZmllZExpbmtJdGVtcyIsInJldHJpZXZlTGlua0l0ZW1zIiwiX0xpbmtUeXBlIiwiRXJyb3IiLCJvRXJyb3IiLCJMb2ciLCJlcnJvciIsIl9SZW1vdmVUaXRsZUxpbmtGcm9tVGFyZ2V0cyIsIl9hTGlua0l0ZW1zIiwiX2JUaXRsZUhhc0xpbmsiLCJfYVRpdGxlTGluayIsIl9zVGl0bGVMaW5rSHJlZiIsIl9vTURDTGluayIsImJSZXN1bHQiLCJsaW5rSXNQcmltYXJ5QWN0aW9uIiwiX3NMaW5rSW50ZW50V2l0aG91dFBhcmFtZXRlcnMiLCJfc1RpdGxlSW50ZW50IiwiaW50ZW50Iiwic3BsaXQiLCJ0aXRsZWxpbmtocmVmIiwic2V0UHJvcGVydHkiLCJhTUxpbmtJdGVtcyIsImZpbHRlciIsImtleSIsIl9Jc1NlbWFudGljT2JqZWN0RHluYW1pYyIsImFOZXdMaW5rQ3VzdG9tRGF0YSIsIm9UaGlzIiwibGluayIsIm90aGVyTGluayIsIl9nZXRMaW5lQ29udGV4dCIsIm9WaWV3IiwibUxpbmVDb250ZXh0IiwiZ2V0QWdncmVnYXRpb24iLCJfc2V0RmlsdGVyQ29udGV4dFVybEZvclNlbGVjdGlvblZhcmlhbnQiLCJvU2VsZWN0aW9uVmFyaWFudCIsIm9OYXZpZ2F0aW9uU2VydmljZSIsImdldFZpZXdEYXRhIiwic0NvbnRleHRVcmwiLCJjb25zdHJ1Y3RDb250ZXh0VXJsIiwic2V0RmlsdGVyQ29udGV4dFVybCIsIl9zZXRPYmplY3RNYXBwaW5ncyIsInNTZW1hbnRpY09iamVjdCIsIm9QYXJhbXMiLCJhU2VtYW50aWNPYmplY3RNYXBwaW5ncyIsImhhc0NoYW5nZWQiLCJtb2RpZmllZFNlbGVjdGlvblZhcmlhbnQiLCJTZWxlY3Rpb25WYXJpYW50IiwidG9KU09OT2JqZWN0IiwiZm9yRWFjaCIsIm1hcHBpbmciLCJtYXBwaW5nU2VtYW50aWNPYmplY3QiLCJzZW1hbnRpY09iamVjdCIsIm1hcHBpbmdTZW1hbnRpY09iamVjdFBhdGgiLCJnZXREeW5hbWljUGF0aEZyb21TZW1hbnRpY09iamVjdCIsIm9NYXBwaW5ncyIsIml0ZW1zIiwiaSIsInNMb2NhbFByb3BlcnR5Iiwic1NlbWFudGljT2JqZWN0UHJvcGVydHkiLCJyZW1vdmVQYXJhbWV0ZXIiLCJyZW1vdmVTZWxlY3RPcHRpb24iLCJyZW5hbWVQYXJhbWV0ZXIiLCJyZW5hbWVTZWxlY3RPcHRpb24iLCJwcm9wZXJ0eVRvQmVSZW1vdmVkIiwic2xpY2UiLCJwYXJhbXMiLCJzZWxlY3Rpb25WYXJpYW50IiwiX2dldEFwcFN0YXRlS2V5QW5kVXJsUGFyYW1ldGVycyIsIl90aGlzIiwibmF2aWdhdGlvblNlcnZpY2UiLCJhVmFsdWVzIiwiZGVlcEVxdWFsIiwiZGVmYXVsdENhY2hlIiwic2VtYW50aWNBdHRyaWJ1dGVzIiwiYXBwc3RhdGVrZXkiLCJ0b0VTNlByb21pc2UiLCJnZXRBcHBTdGF0ZUtleUFuZFVybFBhcmFtZXRlcnMiLCJ0b0pTT05TdHJpbmciLCJjYWNoZSIsIl9nZXRMaW5rSXRlbVdpdGhOZXdQYXJhbWV0ZXIiLCJfdGhhdCIsIl9vTGlua0l0ZW0iLCJfb1NoZWxsU2VydmljZXMiLCJfb1BhcmFtcyIsIl9zQXBwU3RhdGVLZXkiLCJfb1NlbGVjdGlvblZhcmlhbnQiLCJfb05hdmlnYXRpb25TZXJ2aWNlIiwiZXhwYW5kQ29tcGFjdEhhc2giLCJzSGFzaCIsIm9TaGVsbEhhc2giLCJwYXJzZVNoZWxsSGFzaCIsIm9OZXdQYXJhbXMiLCJuZXdTZWxlY3Rpb25WYXJpYW50Iiwic2VtYW50aWNPYmplY3RNYXBwaW5ncyIsIm9OZXdTaGVsbEhhc2giLCJ0YXJnZXQiLCJhY3Rpb24iLCJhcHBTdGF0ZUtleSIsInNldEhyZWYiLCJjb25zdHJ1Y3RTaGVsbEhhc2giLCJhU2VtYW50aWNMaW5rcyIsInB1c2giLCJiaW5kIiwiX3JlbW92ZUVtcHR5TGlua0l0ZW0iLCJtb2RpZnlMaW5rSXRlbXMiLCJDb21tb25VdGlscyIsImdldFRhcmdldFZpZXciLCJvQXBwQ29tcG9uZW50IiwiZ2V0QXBwQ29tcG9uZW50IiwicHJpbWFyeUFjdGlvbklzQWN0aXZlIiwiRmllbGRIZWxwZXIiLCJjaGVja1ByaW1hcnlBY3Rpb25zIiwiYVRpdGxlTGluayIsInRpdGxlTGluayIsImJUaXRsZUhhc0xpbmsiLCJoYXNUaXRsZUxpbmsiLCJvU2hlbGxTZXJ2aWNlcyIsImdldFNoZWxsU2VydmljZXMiLCJoYXNVU2hlbGwiLCJyZWplY3QiLCJvVGFyZ2V0SW5mbyIsIm1haW5TZW1hbnRpY09iamVjdCIsImdldE5hdmlnYXRpb25TZXJ2aWNlIiwib0NvbnRyb2xsZXIiLCJnZXRDb250cm9sbGVyIiwibUxpbmVDb250ZXh0RGF0YSIsInNNZXRhUGF0aCIsImdldE1ldGFQYXRoIiwiZ2V0UGF0aCIsIl9pbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJyZW1vdmVTZW5zaXRpdmVEYXRhIiwicHJlcGFyZUNvbnRleHRGb3JFeHRlcm5hbE5hdmlnYXRpb24iLCJtaXhBdHRyaWJ1dGVzQW5kU2VsZWN0aW9uVmFyaWFudCIsInByb3BlcnRpZXNXaXRob3V0Q29uZmxpY3QiLCJpbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJhZGFwdE5hdmlnYXRpb25Db250ZXh0IiwiX3JlbW92ZVRlY2huaWNhbFBhcmFtZXRlcnMiLCJ0aXRsZUxpbmt0b0JlUmVtb3ZlIiwiaW5kZXgiLCJiZWZvcmVOYXZpZ2F0aW9uQ2FsbGJhY2siLCJvRXZlbnQiLCJvU291cmNlIiwiZ2V0U291cmNlIiwic0hyZWYiLCJnZXRQYXJhbWV0ZXIiLCJvVVJMUGFyc2luZyIsIkZhY3RvcnkiLCJnZXRTZXJ2aWNlIiwib0hhc2giLCJLZWVwQWxpdmVIZWxwZXIiLCJzdG9yZUNvbnRyb2xSZWZyZXNoU3RyYXRlZ3lGb3JIYXNoIiwiX2dldFNlbWFudGljT2JqZWN0Q3VzdG9tRGF0YVZhbHVlIiwib1NlbWFudGljT2JqZWN0c1Jlc29sdmVkIiwic1Byb3BlcnR5TmFtZSIsInNDdXN0b21EYXRhVmFsdWUiLCJpQ3VzdG9tRGF0YUNvdW50IiwiZ2V0S2V5IiwiZ2V0VmFsdWUiLCJfaXNEeW5hbWljUGF0aCIsInBhdGhPclZhbHVlIiwiaW5kZXhPZiIsIl91cGRhdGVQYXlsb2FkV2l0aFJlc29sdmVkU2VtYW50aWNPYmplY3RWYWx1ZSIsIm5ld1BheWxvYWQiLCJzZW1hbnRpY09iamVjdE5hbWUiLCJzZW1hbnRpY09iamVjdHNSZXNvbHZlZCIsImoiLCJfY3JlYXRlTmV3UGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQiLCJ0bXBQcm9wZXJ0eU5hbWUiLCJzdWJzdHIiLCJfdXBkYXRlU2VtYW50aWNPYmplY3RzRm9yTWFwcGluZ3MiLCJtZGNQYXlsb2FkIiwibWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQiLCJzZW1hbnRpY09iamVjdE1hcHBpbmciLCJfdXBkYXRlU2VtYW50aWNPYmplY3RzVW5hdmFpbGFibGVBY3Rpb25zIiwibWRjUGF5bG9hZFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIiwiX0luZGV4Iiwic2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbiIsImZpbmRJbmRleCIsIl91cGRhdGVTZW1hbnRpY09iamVjdHNXaXRoUmVzb2x2ZWRWYWx1ZSIsIm5ld1NlbWFudGljT2JqZWN0c0NvdW50Iiwic3BsaWNlIiwiX3JlbW92ZUVtcHR5U2VtYW50aWNPYmplY3RzTWFwcGluZ3MiLCJtYXBwaW5nc0NvdW50IiwiX3NldFBheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkIiwib1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkIiwicHJvcGVydHlQYXRoTGFiZWwiLCJkZWVwQ2xvbmUiLCJfU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMiLCJzZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyIsIl9nZXRQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZCIsImxpbmtDdXN0b21EYXRhIiwiX3VwZGF0ZVBheWxvYWRXaXRoU2VtYW50aWNBdHRyaWJ1dGVzIiwiYVNlbWFudGljT2JqZWN0cyIsIm9SZXN1bHRzIiwibVNlbWFudGljT2JqZWN0TWFwcGluZ3MiLCJhZGRDb250ZXh0T2JqZWN0Iiwic0F0dHJpYnV0ZU5hbWUiLCJvQXR0cmlidXRlIiwib1RyYW5zZm9ybWF0aW9uQWRkaXRpb25hbCIsImdldFNlbWFudGljT2JqZWN0QXR0cmlidXRlIiwiY3JlYXRlQXR0cmlidXRlU3RydWN0dXJlIiwiYWRkU2VtYW50aWNPYmplY3RBdHRyaWJ1dGUiLCJ0cmFuc2Zvcm1hdGlvbnMiLCJkZXNjcmlwdGlvbiIsImlzUGxhaW5PYmplY3QiLCJhS2V5cyIsImtleXMiLCJzTmV3QXR0cmlidXRlTmFtZU1hcHBlZCIsInNOZXdBdHRyaWJ1dGVOYW1lIiwic1ZhbHVlIiwic0tleSIsInNBdHRyaWJ1dGVOYW1lTWFwcGVkIiwicmVhc29uIiwiYUF0dHJpYnV0ZU5ldyIsIl9jb252ZXJ0U2VtYW50aWNPYmplY3RNYXBwaW5nIiwiX2dldFNlbWFudGljT2JqZWN0TWFwcGluZ3MiLCJzQXBwU3RhdGVLZXkiLCJvTmF2aWdhdGlvblRhcmdldHMiLCJvd25OYXZpZ2F0aW9uIiwiYXZhaWxhYmxlQWN0aW9ucyIsImlTdXBlcmlvckFjdGlvbkxpbmtzRm91bmQiLCJDb3JlIiwibG9hZExpYnJhcnkiLCJhc3luYyIsInNhcCIsInVpIiwicmVxdWlyZSIsIlV0aWxzIiwiZ2V0QXBwQ29tcG9uZW50Rm9yQ29udHJvbCIsImFQYXJhbXMiLCJzb3J0UmVzdWx0c0J5IiwiZ2V0TGlua3MiLCJiSGFzTGlua3MiLCJhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMiLCJfZ2V0U2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMiLCJvVW5hdmFpbGFibGVBY3Rpb25zIiwiX2NvbnZlcnRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uIiwic0N1cnJlbnRIYXNoIiwiRmllbGRSdW50aW1lIiwiX2ZuRml4SGFzaFF1ZXJ5U3RyaW5nIiwiZ2V0SGFzaCIsImZuSXNVbmF2YWlsYWJsZUFjdGlvbiIsInNBY3Rpb24iLCJmbkFkZExpbmsiLCJzaGVsbEhhc2giLCJpY29uIiwiaW5pdGlhbGx5VmlzaWJsZSIsInRhZ3MiLCJhZGRTZW1hbnRpY09iamVjdEludGVudCIsIm4iLCJpTGlua0l0ZW1JbmRleCIsIm9TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uIiwiU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbiIsImFjdGlvbnMiLCJhU2VtYW50aWNPYmplY3RNYXBwaW5nSXRlbXMiLCJvU2VtYW50aWNPYmplY3RNYXBwaW5nIiwib1NlbWFudGljT2JqZWN0TWFwcGluZ0l0ZW0iLCJTZW1hbnRpY09iamVjdE1hcHBpbmdJdGVtIiwiU2VtYW50aWNPYmplY3RNYXBwaW5nIiwiZ2V0U2VtYW50aWNPYmplY3QiLCJnZXRJdGVtcyIsInJlZHVjZSIsIm9NYXAiLCJvSXRlbSIsIl9TZW1hbnRpY09iamVjdE5hbWUiLCJfU2VtYW50aWNPYmplY3RIYXNBbHJlYWR5VW5hdmFpbGFibGVBY3Rpb25zIiwiX1VuYXZhaWxhYmxlQWN0aW9ucyIsIm1TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyIsIm9TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyIsImdldEFjdGlvbnMiLCJVbmF2YWlsYWJsZUFjdGlvbiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiUXVpY2tWaWV3RGVsZWdhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgZGVlcENsb25lIGZyb20gXCJzYXAvYmFzZS91dGlsL2RlZXBDbG9uZVwiO1xuaW1wb3J0IGRlZXBFcXVhbCBmcm9tIFwic2FwL2Jhc2UvdXRpbC9kZWVwRXF1YWxcIjtcbmltcG9ydCBpc1BsYWluT2JqZWN0IGZyb20gXCJzYXAvYmFzZS91dGlsL2lzUGxhaW5PYmplY3RcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBLZWVwQWxpdmVIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvS2VlcEFsaXZlSGVscGVyXCI7XG5pbXBvcnQgdG9FUzZQcm9taXNlIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1RvRVM2UHJvbWlzZVwiO1xuaW1wb3J0IFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IHsgTmF2aWdhdGlvblNlcnZpY2UgfSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvTmF2aWdhdGlvblNlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgeyBnZXREeW5hbWljUGF0aEZyb21TZW1hbnRpY09iamVjdCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1NlbWFudGljT2JqZWN0SGVscGVyXCI7XG5pbXBvcnQgRmllbGRIZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRIZWxwZXJcIjtcbmltcG9ydCBGaWVsZFJ1bnRpbWUgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRSdW50aW1lXCI7XG5pbXBvcnQgU2VsZWN0aW9uVmFyaWFudCBmcm9tIFwic2FwL2ZlL25hdmlnYXRpb24vU2VsZWN0aW9uVmFyaWFudFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBGcmFnbWVudCBmcm9tIFwic2FwL3VpL2NvcmUvRnJhZ21lbnRcIjtcbmltcG9ydCBYTUxQcmVwcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL3V0aWwvWE1MUHJlcHJvY2Vzc29yXCI7XG5pbXBvcnQgWE1MVGVtcGxhdGVQcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL1hNTFRlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgRmFjdG9yeSBmcm9tIFwic2FwL3VpL21kYy9saW5rL0ZhY3RvcnlcIjtcbmltcG9ydCBMaW5rSXRlbSBmcm9tIFwic2FwL3VpL21kYy9saW5rL0xpbmtJdGVtXCI7XG5pbXBvcnQgU2VtYW50aWNPYmplY3RNYXBwaW5nIGZyb20gXCJzYXAvdWkvbWRjL2xpbmsvU2VtYW50aWNPYmplY3RNYXBwaW5nXCI7XG5pbXBvcnQgU2VtYW50aWNPYmplY3RNYXBwaW5nSXRlbSBmcm9tIFwic2FwL3VpL21kYy9saW5rL1NlbWFudGljT2JqZWN0TWFwcGluZ0l0ZW1cIjtcbmltcG9ydCBTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uIGZyb20gXCJzYXAvdWkvbWRjL2xpbmsvU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvblwiO1xuaW1wb3J0IExpbmtEZWxlZ2F0ZSBmcm9tIFwic2FwL3VpL21kYy9MaW5rRGVsZWdhdGVcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcblxuZXhwb3J0IHR5cGUgUmVnaXN0ZXJlZFNlbWFudGljT2JqZWN0TWFwcGluZyA9IHsgc2VtYW50aWNPYmplY3Q6IHN0cmluZzsgaXRlbXM6IHsga2V5OiBzdHJpbmc7IHZhbHVlOiBzdHJpbmcgfVtdIH07XG50eXBlIFJlZ2lzdGVyZWRTZW1hbnRpY09iamVjdE1hcHBpbmdzID0gUmVnaXN0ZXJlZFNlbWFudGljT2JqZWN0TWFwcGluZ1tdO1xuZXhwb3J0IHR5cGUgUmVnaXN0ZXJlZFBheWxvYWQgPSB7XG5cdG1haW5TZW1hbnRpY09iamVjdD86IHN0cmluZztcblx0c2VtYW50aWNPYmplY3RzOiBzdHJpbmdbXTtcblx0c2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ/OiBzdHJpbmdbXTtcblx0c2VtYW50aWNPYmplY3RNYXBwaW5nczogUmVnaXN0ZXJlZFNlbWFudGljT2JqZWN0TWFwcGluZ3M7XG5cdHNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zPzogUmVnaXN0ZXJlZFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zO1xuXHRlbnRpdHlUeXBlPzogc3RyaW5nO1xuXHRkYXRhRmllbGQ/OiBzdHJpbmc7XG5cdGNvbnRhY3Q/OiBzdHJpbmc7XG5cdG5hdmlnYXRpb25QYXRoPzogc3RyaW5nO1xuXHRwcm9wZXJ0eVBhdGhMYWJlbD86IHN0cmluZztcblx0aGFzUXVpY2tWaWV3RmFjZXRzPzogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgUmVnaXN0ZXJlZFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zID0ge1xuXHRzZW1hbnRpY09iamVjdDogc3RyaW5nO1xuXHRhY3Rpb25zOiBzdHJpbmdbXTtcbn1bXTtcblxuY29uc3QgU2ltcGxlTGlua0RlbGVnYXRlID0gT2JqZWN0LmFzc2lnbih7fSwgTGlua0RlbGVnYXRlKSBhcyBhbnk7XG5jb25zdCBDT05TVEFOVFMgPSB7XG5cdGlMaW5rc1Nob3duSW5Qb3B1cDogMyxcblx0c2FwbUxpbms6IFwic2FwLm0uTGlua1wiLFxuXHRzYXB1aW1kY0xpbms6IFwic2FwLnVpLm1kYy5MaW5rXCIsXG5cdHNhcHVpbWRjbGlua0xpbmtJdGVtOiBcInNhcC51aS5tZGMubGluay5MaW5rSXRlbVwiLFxuXHRzYXBtT2JqZWN0SWRlbnRpZmllcjogXCJzYXAubS5PYmplY3RJZGVudGlmaWVyXCIsXG5cdHNhcG1PYmplY3RTdGF0dXM6IFwic2FwLm0uT2JqZWN0U3RhdHVzXCJcbn07XG5TaW1wbGVMaW5rRGVsZWdhdGUuZ2V0Q29uc3RhbnRzID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gQ09OU1RBTlRTO1xufTtcbi8qKlxuICogVGhpcyB3aWxsIHJldHVybiBhbiBhcnJheSBvZiB0aGUgU2VtYW50aWNPYmplY3RzIGFzIHN0cmluZ3MgZ2l2ZW4gYnkgdGhlIHBheWxvYWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBvUGF5bG9hZCBUaGUgcGF5bG9hZCBkZWZpbmVkIGJ5IHRoZSBhcHBsaWNhdGlvblxuICogQHBhcmFtIG9NZXRhTW9kZWwgVGhlIE9EYXRhTWV0YU1vZGVsIHJlY2VpdmVkIGZyb20gdGhlIExpbmtcbiAqIEByZXR1cm5zIFRoZSBjb250ZXh0IHBvaW50aW5nIHRvIHRoZSBjdXJyZW50IEVudGl0eVR5cGUuXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0RW50aXR5VHlwZSA9IGZ1bmN0aW9uIChvUGF5bG9hZDogYW55LCBvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCkge1xuXHRpZiAob01ldGFNb2RlbCkge1xuXHRcdHJldHVybiBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KG9QYXlsb2FkLmVudGl0eVR5cGUpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cbn07XG4vKipcbiAqIFRoaXMgd2lsbCByZXR1cm4gYW4gYXJyYXkgb2YgdGhlIFNlbWFudGljT2JqZWN0cyBhcyBzdHJpbmdzIGdpdmVuIGJ5IHRoZSBwYXlsb2FkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gb1BheWxvYWQgVGhlIHBheWxvYWQgZGVmaW5lZCBieSB0aGUgYXBwbGljYXRpb25cbiAqIEBwYXJhbSBvTWV0YU1vZGVsIFRoZSBPRGF0YU1ldGFNb2RlbCByZWNlaXZlZCBmcm9tIHRoZSBMaW5rXG4gKiBAcmV0dXJucyBBIG1vZGVsIGNvbnRhaW5pbmcgdGhlIHBheWxvYWQgaW5mb3JtYXRpb25cbiAqL1xuU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRTZW1hbnRpY3NNb2RlbCA9IGZ1bmN0aW9uIChvUGF5bG9hZDogb2JqZWN0LCBvTWV0YU1vZGVsOiBvYmplY3QpIHtcblx0aWYgKG9NZXRhTW9kZWwpIHtcblx0XHRyZXR1cm4gbmV3IEpTT05Nb2RlbChvUGF5bG9hZCk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxufTtcbi8qKlxuICogVGhpcyB3aWxsIHJldHVybiBhbiBhcnJheSBvZiB0aGUgU2VtYW50aWNPYmplY3RzIGFzIHN0cmluZ3MgZ2l2ZW4gYnkgdGhlIHBheWxvYWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBvUGF5bG9hZCBUaGUgcGF5bG9hZCBkZWZpbmVkIGJ5IHRoZSBhcHBsaWNhdGlvblxuICogQHBhcmFtIG9NZXRhTW9kZWwgVGhlIE9EYXRhTWV0YU1vZGVsIHJlY2VpdmVkIGZyb20gdGhlIExpbmtcbiAqIEByZXR1cm5zIEFuIGFycmF5IGNvbnRhaW5pbmcgU2VtYW50aWNPYmplY3RzIGJhc2VkIG9mIHRoZSBwYXlsb2FkXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0RGF0YUZpZWxkID0gZnVuY3Rpb24gKG9QYXlsb2FkOiBhbnksIG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsKSB7XG5cdHJldHVybiBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KG9QYXlsb2FkLmRhdGFGaWVsZCk7XG59O1xuLyoqXG4gKiBUaGlzIHdpbGwgcmV0dXJuIGFuIGFycmF5IG9mIHRoZSBTZW1hbnRpY09iamVjdHMgYXMgc3RyaW5ncyBnaXZlbiBieSB0aGUgcGF5bG9hZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIG9QYXlsb2FkIFRoZSBwYXlsb2FkIGRlZmluZWQgYnkgdGhlIGFwcGxpY2F0aW9uXG4gKiBAcGFyYW0gb01ldGFNb2RlbCBUaGUgT0RhdGFNZXRhTW9kZWwgcmVjZWl2ZWQgZnJvbSB0aGUgTGlua1xuICogQHJldHVybnMgQW5jb250YWluaW5nIFNlbWFudGljT2JqZWN0cyBiYXNlZCBvZiB0aGUgcGF5bG9hZFxuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUuX2dldENvbnRhY3QgPSBmdW5jdGlvbiAob1BheWxvYWQ6IGFueSwgb01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwpIHtcblx0cmV0dXJuIG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQob1BheWxvYWQuY29udGFjdCk7XG59O1xuU2ltcGxlTGlua0RlbGVnYXRlLmZuVGVtcGxhdGVGcmFnbWVudCA9IGZ1bmN0aW9uICgpIHtcblx0bGV0IHNGcmFnbWVudE5hbWU6IHN0cmluZywgdGl0bGVMaW5rSHJlZjtcblx0Y29uc3Qgb0ZyYWdtZW50TW9kZWw6IGFueSA9IHt9O1xuXHRsZXQgb1BheWxvYWRUb1VzZTtcblxuXHQvLyBwYXlsb2FkIGhhcyBiZWVuIG1vZGlmaWVkIGJ5IGZldGNoaW5nIFNlbWFudGljIE9iamVjdHMgbmFtZXMgd2l0aCBwYXRoXG5cdGlmICh0aGlzLnJlc29sdmVkcGF5bG9hZCkge1xuXHRcdG9QYXlsb2FkVG9Vc2UgPSB0aGlzLnJlc29sdmVkcGF5bG9hZDtcblx0fSBlbHNlIHtcblx0XHRvUGF5bG9hZFRvVXNlID0gdGhpcy5wYXlsb2FkO1xuXHR9XG5cblx0aWYgKG9QYXlsb2FkVG9Vc2UgJiYgIW9QYXlsb2FkVG9Vc2UuTGlua0lkKSB7XG5cdFx0b1BheWxvYWRUb1VzZS5MaW5rSWQgPSB0aGlzLm9Db250cm9sICYmIHRoaXMub0NvbnRyb2wuaXNBKENPTlNUQU5UUy5zYXB1aW1kY0xpbmspID8gdGhpcy5vQ29udHJvbC5nZXRJZCgpIDogdW5kZWZpbmVkO1xuXHR9XG5cblx0aWYgKG9QYXlsb2FkVG9Vc2UuTGlua0lkKSB7XG5cdFx0dGl0bGVMaW5rSHJlZiA9IHRoaXMub0NvbnRyb2wuZ2V0TW9kZWwoXCIkc2FwdWltZGNMaW5rXCIpLmdldFByb3BlcnR5KFwiL3RpdGxlTGlua0hyZWZcIik7XG5cdFx0b1BheWxvYWRUb1VzZS50aXRsZWxpbmsgPSB0aXRsZUxpbmtIcmVmO1xuXHR9XG5cblx0Y29uc3Qgb1NlbWFudGljc01vZGVsID0gdGhpcy5fZ2V0U2VtYW50aWNzTW9kZWwob1BheWxvYWRUb1VzZSwgdGhpcy5vTWV0YU1vZGVsKTtcblx0dGhpcy5zZW1hbnRpY01vZGVsID0gb1NlbWFudGljc01vZGVsO1xuXG5cdGlmIChvUGF5bG9hZFRvVXNlLmVudGl0eVR5cGUgJiYgdGhpcy5fZ2V0RW50aXR5VHlwZShvUGF5bG9hZFRvVXNlLCB0aGlzLm9NZXRhTW9kZWwpKSB7XG5cdFx0c0ZyYWdtZW50TmFtZSA9IFwic2FwLmZlLm1hY3Jvcy5xdWlja1ZpZXcuZnJhZ21lbnRzLkVudGl0eVF1aWNrVmlld1wiO1xuXHRcdG9GcmFnbWVudE1vZGVsLmJpbmRpbmdDb250ZXh0cyA9IHtcblx0XHRcdGVudGl0eVR5cGU6IHRoaXMuX2dldEVudGl0eVR5cGUob1BheWxvYWRUb1VzZSwgdGhpcy5vTWV0YU1vZGVsKSxcblx0XHRcdHNlbWFudGljOiBvU2VtYW50aWNzTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpXG5cdFx0fTtcblx0XHRvRnJhZ21lbnRNb2RlbC5tb2RlbHMgPSB7XG5cdFx0XHRlbnRpdHlUeXBlOiB0aGlzLm9NZXRhTW9kZWwsXG5cdFx0XHRzZW1hbnRpYzogb1NlbWFudGljc01vZGVsXG5cdFx0fTtcblx0fSBlbHNlIGlmIChvUGF5bG9hZFRvVXNlLmRhdGFGaWVsZCAmJiB0aGlzLl9nZXREYXRhRmllbGQob1BheWxvYWRUb1VzZSwgdGhpcy5vTWV0YU1vZGVsKSkge1xuXHRcdHNGcmFnbWVudE5hbWUgPSBcInNhcC5mZS5tYWNyb3MucXVpY2tWaWV3LmZyYWdtZW50cy5EYXRhRmllbGRRdWlja1ZpZXdcIjtcblx0XHRvRnJhZ21lbnRNb2RlbC5iaW5kaW5nQ29udGV4dHMgPSB7XG5cdFx0XHRkYXRhRmllbGQ6IHRoaXMuX2dldERhdGFGaWVsZChvUGF5bG9hZFRvVXNlLCB0aGlzLm9NZXRhTW9kZWwpLFxuXHRcdFx0c2VtYW50aWM6IG9TZW1hbnRpY3NNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIilcblx0XHR9O1xuXHRcdG9GcmFnbWVudE1vZGVsLm1vZGVscyA9IHtcblx0XHRcdGRhdGFGaWVsZDogdGhpcy5vTWV0YU1vZGVsLFxuXHRcdFx0c2VtYW50aWM6IG9TZW1hbnRpY3NNb2RlbFxuXHRcdH07XG5cdH1cblx0b0ZyYWdtZW50TW9kZWwubW9kZWxzLmVudGl0eVNldCA9IHRoaXMub01ldGFNb2RlbDtcblx0b0ZyYWdtZW50TW9kZWwubW9kZWxzLm1ldGFNb2RlbCA9IHRoaXMub01ldGFNb2RlbDtcblx0aWYgKHRoaXMub0NvbnRyb2wgJiYgdGhpcy5vQ29udHJvbC5nZXRNb2RlbChcInZpZXdEYXRhXCIpKSB7XG5cdFx0b0ZyYWdtZW50TW9kZWwubW9kZWxzLnZpZXdEYXRhID0gdGhpcy5vQ29udHJvbC5nZXRNb2RlbChcInZpZXdEYXRhXCIpO1xuXHRcdG9GcmFnbWVudE1vZGVsLmJpbmRpbmdDb250ZXh0cy52aWV3RGF0YSA9IHRoaXMub0NvbnRyb2wuZ2V0TW9kZWwoXCJ2aWV3RGF0YVwiKS5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIik7XG5cdH1cblxuXHRjb25zdCBvRnJhZ21lbnQgPSBYTUxUZW1wbGF0ZVByb2Nlc3Nvci5sb2FkVGVtcGxhdGUoc0ZyYWdtZW50TmFtZSEsIFwiZnJhZ21lbnRcIik7XG5cblx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShYTUxQcmVwcm9jZXNzb3IucHJvY2VzcyhvRnJhZ21lbnQsIHsgbmFtZTogc0ZyYWdtZW50TmFtZSEgfSwgb0ZyYWdtZW50TW9kZWwpKVxuXHRcdC50aGVuKChfaW50ZXJuYWxGcmFnbWVudDogYW55KSA9PiB7XG5cdFx0XHRyZXR1cm4gRnJhZ21lbnQubG9hZCh7XG5cdFx0XHRcdGRlZmluaXRpb246IF9pbnRlcm5hbEZyYWdtZW50LFxuXHRcdFx0XHRjb250cm9sbGVyOiB0aGlzXG5cdFx0XHR9KTtcblx0XHR9KVxuXHRcdC50aGVuKChvUG9wb3ZlckNvbnRlbnQ6IGFueSkgPT4ge1xuXHRcdFx0aWYgKG9Qb3BvdmVyQ29udGVudCkge1xuXHRcdFx0XHRpZiAob0ZyYWdtZW50TW9kZWwubW9kZWxzICYmIG9GcmFnbWVudE1vZGVsLm1vZGVscy5zZW1hbnRpYykge1xuXHRcdFx0XHRcdG9Qb3BvdmVyQ29udGVudC5zZXRNb2RlbChvRnJhZ21lbnRNb2RlbC5tb2RlbHMuc2VtYW50aWMsIFwic2VtYW50aWNcIik7XG5cdFx0XHRcdFx0b1BvcG92ZXJDb250ZW50LnNldEJpbmRpbmdDb250ZXh0KG9GcmFnbWVudE1vZGVsLmJpbmRpbmdDb250ZXh0cy5zZW1hbnRpYywgXCJzZW1hbnRpY1wiKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChvRnJhZ21lbnRNb2RlbC5iaW5kaW5nQ29udGV4dHMgJiYgb0ZyYWdtZW50TW9kZWwuYmluZGluZ0NvbnRleHRzLmVudGl0eVR5cGUpIHtcblx0XHRcdFx0XHRvUG9wb3ZlckNvbnRlbnQuc2V0TW9kZWwob0ZyYWdtZW50TW9kZWwubW9kZWxzLmVudGl0eVR5cGUsIFwiZW50aXR5VHlwZVwiKTtcblx0XHRcdFx0XHRvUG9wb3ZlckNvbnRlbnQuc2V0QmluZGluZ0NvbnRleHQob0ZyYWdtZW50TW9kZWwuYmluZGluZ0NvbnRleHRzLmVudGl0eVR5cGUsIFwiZW50aXR5VHlwZVwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGhpcy5yZXNvbHZlZHBheWxvYWQgPSB1bmRlZmluZWQ7XG5cdFx0XHRyZXR1cm4gb1BvcG92ZXJDb250ZW50O1xuXHRcdH0pO1xufTtcblNpbXBsZUxpbmtEZWxlZ2F0ZS5mZXRjaEFkZGl0aW9uYWxDb250ZW50ID0gZnVuY3Rpb24gKG9QYXlMb2FkOiBhbnksIG9NZGNMaW5rQ29udHJvbDogYW55KSB7XG5cdHRoaXMub0NvbnRyb2wgPSBvTWRjTGlua0NvbnRyb2w7XG5cdGNvbnN0IGFOYXZpZ2F0ZVJlZ2V4cE1hdGNoID0gb1BheUxvYWQ/Lm5hdmlnYXRpb25QYXRoPy5tYXRjaCgveyguKj8pfS8pO1xuXHRjb25zdCBvQmluZGluZ0NvbnRleHQgPVxuXHRcdGFOYXZpZ2F0ZVJlZ2V4cE1hdGNoICYmIGFOYXZpZ2F0ZVJlZ2V4cE1hdGNoLmxlbmd0aCA+IDEgJiYgYU5hdmlnYXRlUmVnZXhwTWF0Y2hbMV1cblx0XHRcdD8gb01kY0xpbmtDb250cm9sLmdldE1vZGVsKCkuYmluZENvbnRleHQoYU5hdmlnYXRlUmVnZXhwTWF0Y2hbMV0sIG9NZGNMaW5rQ29udHJvbC5nZXRCaW5kaW5nQ29udGV4dCgpLCB7ICQkb3duUmVxdWVzdDogdHJ1ZSB9KVxuXHRcdFx0OiBudWxsO1xuXHR0aGlzLnBheWxvYWQgPSBvUGF5TG9hZDtcblx0aWYgKG9NZGNMaW5rQ29udHJvbCAmJiBvTWRjTGlua0NvbnRyb2wuaXNBKENPTlNUQU5UUy5zYXB1aW1kY0xpbmspKSB7XG5cdFx0dGhpcy5vTWV0YU1vZGVsID0gb01kY0xpbmtDb250cm9sLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0cmV0dXJuIHRoaXMuZm5UZW1wbGF0ZUZyYWdtZW50KCkudGhlbihmdW5jdGlvbiAob1BvcG92ZXJDb250ZW50OiBhbnkpIHtcblx0XHRcdGlmIChvQmluZGluZ0NvbnRleHQpIHtcblx0XHRcdFx0b1BvcG92ZXJDb250ZW50LnNldEJpbmRpbmdDb250ZXh0KG9CaW5kaW5nQ29udGV4dC5nZXRCb3VuZENvbnRleHQoKSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gW29Qb3BvdmVyQ29udGVudF07XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XG59O1xuU2ltcGxlTGlua0RlbGVnYXRlLl9mZXRjaExpbmtDdXN0b21EYXRhID0gZnVuY3Rpb24gKF9vTGluazogYW55KSB7XG5cdGlmIChcblx0XHRfb0xpbmsuZ2V0UGFyZW50KCkgJiZcblx0XHRfb0xpbmsuaXNBKENPTlNUQU5UUy5zYXB1aW1kY0xpbmspICYmXG5cdFx0KF9vTGluay5nZXRQYXJlbnQoKS5pc0EoQ09OU1RBTlRTLnNhcG1MaW5rKSB8fFxuXHRcdFx0X29MaW5rLmdldFBhcmVudCgpLmlzQShDT05TVEFOVFMuc2FwbU9iamVjdElkZW50aWZpZXIpIHx8XG5cdFx0XHRfb0xpbmsuZ2V0UGFyZW50KCkuaXNBKENPTlNUQU5UUy5zYXBtT2JqZWN0U3RhdHVzKSlcblx0KSB7XG5cdFx0cmV0dXJuIF9vTGluay5nZXRDdXN0b21EYXRhKCk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxufTtcbi8qKlxuICogRmV0Y2hlcyB0aGUgcmVsZXZhbnQge0BsaW5rIHNhcC51aS5tZGMubGluay5MaW5rSXRlbX0gZm9yIHRoZSBMaW5rIGFuZCByZXR1cm5zIHRoZW0uXG4gKlxuICogQHB1YmxpY1xuICogQHBhcmFtIG9QYXlsb2FkIFRoZSBQYXlsb2FkIG9mIHRoZSBMaW5rIGdpdmVuIGJ5IHRoZSBhcHBsaWNhdGlvblxuICogQHBhcmFtIG9CaW5kaW5nQ29udGV4dCBUaGUgQ29udGV4dE9iamVjdCBvZiB0aGUgTGlua1xuICogQHBhcmFtIG9JbmZvTG9nIFRoZSBJbmZvTG9nIG9mIHRoZSBMaW5rXG4gKiBAcmV0dXJucyBPbmNlIHJlc29sdmVkIGFuIGFycmF5IG9mIHtAbGluayBzYXAudWkubWRjLmxpbmsuTGlua0l0ZW19IGlzIHJldHVybmVkXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5mZXRjaExpbmtJdGVtcyA9IGZ1bmN0aW9uIChvUGF5bG9hZDogYW55LCBvQmluZGluZ0NvbnRleHQ6IENvbnRleHQsIG9JbmZvTG9nOiBhbnkpIHtcblx0aWYgKG9CaW5kaW5nQ29udGV4dCAmJiBTaW1wbGVMaW5rRGVsZWdhdGUuX2dldFNlbWFudGljT2JqZWN0cyhvUGF5bG9hZCkpIHtcblx0XHRjb25zdCBvQ29udGV4dE9iamVjdCA9IG9CaW5kaW5nQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRpZiAob0luZm9Mb2cpIHtcblx0XHRcdG9JbmZvTG9nLmluaXRpYWxpemUoU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRTZW1hbnRpY09iamVjdHMob1BheWxvYWQpKTtcblx0XHR9XG5cdFx0Y29uc3QgX29MaW5rQ3VzdG9tRGF0YSA9IHRoaXMuX2xpbmsgJiYgdGhpcy5fZmV0Y2hMaW5rQ3VzdG9tRGF0YSh0aGlzLl9saW5rKTtcblx0XHR0aGlzLmFMaW5rQ3VzdG9tRGF0YSA9XG5cdFx0XHRfb0xpbmtDdXN0b21EYXRhICYmXG5cdFx0XHR0aGlzLl9mZXRjaExpbmtDdXN0b21EYXRhKHRoaXMuX2xpbmspLm1hcChmdW5jdGlvbiAobGlua0l0ZW06IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gbGlua0l0ZW0ubVByb3BlcnRpZXMudmFsdWU7XG5cdFx0XHR9KTtcblxuXHRcdGNvbnN0IG9TZW1hbnRpY0F0dHJpYnV0ZXNSZXNvbHZlZCA9IFNpbXBsZUxpbmtEZWxlZ2F0ZS5fY2FsY3VsYXRlU2VtYW50aWNBdHRyaWJ1dGVzKG9Db250ZXh0T2JqZWN0LCBvUGF5bG9hZCwgb0luZm9Mb2csIHRoaXMuX2xpbmspO1xuXHRcdGNvbnN0IG9TZW1hbnRpY0F0dHJpYnV0ZXMgPSBvU2VtYW50aWNBdHRyaWJ1dGVzUmVzb2x2ZWQucmVzdWx0cztcblx0XHRjb25zdCBvUGF5bG9hZFJlc29sdmVkID0gb1NlbWFudGljQXR0cmlidXRlc1Jlc29sdmVkLnBheWxvYWQ7XG5cblx0XHRyZXR1cm4gU2ltcGxlTGlua0RlbGVnYXRlLl9yZXRyaWV2ZU5hdmlnYXRpb25UYXJnZXRzKFwiXCIsIG9TZW1hbnRpY0F0dHJpYnV0ZXMsIG9QYXlsb2FkUmVzb2x2ZWQsIG9JbmZvTG9nLCB0aGlzLl9saW5rKS50aGVuKFxuXHRcdFx0ZnVuY3Rpb24gKGFMaW5rczogYW55IC8qb093bk5hdmlnYXRpb25MaW5rOiBhbnkqLykge1xuXHRcdFx0XHRyZXR1cm4gYUxpbmtzLmxlbmd0aCA9PT0gMCA/IG51bGwgOiBhTGlua3M7XG5cdFx0XHR9XG5cdFx0KTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXHR9XG59O1xuXG4vKipcbiAqIEZpbmQgdGhlIHR5cGUgb2YgdGhlIGxpbmsuXG4gKlxuICogQHBhcmFtIHBheWxvYWQgVGhlIHBheWxvYWQgb2YgdGhlIG1kYyBsaW5rLlxuICogQHBhcmFtIGFMaW5rSXRlbXMgTGlua3MgcmV0dXJuZWQgYnkgY2FsbCB0byBtZGMgX3JldHJpZXZlVW5tb2RpZmllZExpbmtJdGVtcy5cbiAqIEByZXR1cm5zIFRoZSB0eXBlIG9mIHRoZSBsaW5rIGFzIGRlZmluZWQgYnkgbWRjLlxuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUuX2ZpbmRMaW5rVHlwZSA9IGZ1bmN0aW9uIChwYXlsb2FkOiBhbnksIGFMaW5rSXRlbXM6IGFueVtdKTogYW55IHtcblx0bGV0IG5MaW5rVHlwZSwgb0xpbmtJdGVtO1xuXHRpZiAoYUxpbmtJdGVtcz8ubGVuZ3RoID09PSAxKSB7XG5cdFx0b0xpbmtJdGVtID0gbmV3IExpbmtJdGVtKHtcblx0XHRcdHRleHQ6IGFMaW5rSXRlbXNbMF0uZ2V0VGV4dCgpLFxuXHRcdFx0aHJlZjogYUxpbmtJdGVtc1swXS5nZXRIcmVmKClcblx0XHR9KTtcblx0XHRuTGlua1R5cGUgPSBwYXlsb2FkLmhhc1F1aWNrVmlld0ZhY2V0cyA9PT0gXCJmYWxzZVwiID8gMSA6IDI7XG5cdH0gZWxzZSBpZiAocGF5bG9hZC5oYXNRdWlja1ZpZXdGYWNldHMgPT09IFwiZmFsc2VcIiAmJiBhTGlua0l0ZW1zPy5sZW5ndGggPT09IDApIHtcblx0XHRuTGlua1R5cGUgPSAwO1xuXHR9IGVsc2Uge1xuXHRcdG5MaW5rVHlwZSA9IDI7XG5cdH1cblx0cmV0dXJuIHtcblx0XHRsaW5rVHlwZTogbkxpbmtUeXBlLFxuXHRcdGxpbmtJdGVtOiBvTGlua0l0ZW1cblx0fTtcbn07XG5TaW1wbGVMaW5rRGVsZWdhdGUuZmV0Y2hMaW5rVHlwZSA9IGFzeW5jIGZ1bmN0aW9uIChvUGF5bG9hZDogYW55LCBvTGluazogYW55KSB7XG5cdGNvbnN0IF9vQ3VycmVudExpbmsgPSBvTGluaztcblx0Y29uc3QgX29QYXlsb2FkID0gT2JqZWN0LmFzc2lnbih7fSwgb1BheWxvYWQpO1xuXHRjb25zdCBvRGVmYXVsdEluaXRpYWxUeXBlID0ge1xuXHRcdGluaXRpYWxUeXBlOiB7XG5cdFx0XHR0eXBlOiAyLFxuXHRcdFx0ZGlyZWN0TGluazogdW5kZWZpbmVkXG5cdFx0fSxcblx0XHRydW50aW1lVHlwZTogdW5kZWZpbmVkXG5cdH07XG5cdC8vIGNsZWFuIGFwcFN0YXRlS2V5TWFwIHN0b3JhZ2Vcblx0aWYgKCF0aGlzLmFwcFN0YXRlS2V5TWFwKSB7XG5cdFx0dGhpcy5hcHBTdGF0ZUtleU1hcCA9IHt9O1xuXHR9XG5cblx0dHJ5IHtcblx0XHRpZiAoX29QYXlsb2FkPy5zZW1hbnRpY09iamVjdHMpIHtcblx0XHRcdHRoaXMuX2xpbmsgPSBvTGluaztcblx0XHRcdGxldCBhTGlua0l0ZW1zID0gYXdhaXQgX29DdXJyZW50TGluay5fcmV0cmlldmVVbm1vZGlmaWVkTGlua0l0ZW1zKCk7XG5cdFx0XHRpZiAoYUxpbmtJdGVtcy5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0Ly8gVGhpcyBpcyB0aGUgZGlyZWN0IG5hdmlnYXRpb24gdXNlIGNhc2Ugc28gd2UgbmVlZCB0byBwZXJmb3JtIHRoZSBhcHByb3ByaWF0ZSBjaGVja3MgLyB0cmFuc2Zvcm1hdGlvbnNcblx0XHRcdFx0YUxpbmtJdGVtcyA9IGF3YWl0IF9vQ3VycmVudExpbmsucmV0cmlldmVMaW5rSXRlbXMoKTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IF9MaW5rVHlwZSA9IFNpbXBsZUxpbmtEZWxlZ2F0ZS5fZmluZExpbmtUeXBlKF9vUGF5bG9hZCwgYUxpbmtJdGVtcyk7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRpbml0aWFsVHlwZToge1xuXHRcdFx0XHRcdHR5cGU6IF9MaW5rVHlwZS5saW5rVHlwZSxcblx0XHRcdFx0XHRkaXJlY3RMaW5rOiBfTGlua1R5cGUubGlua0l0ZW0gPyBfTGlua1R5cGUubGlua0l0ZW0gOiB1bmRlZmluZWRcblx0XHRcdFx0fSxcblx0XHRcdFx0cnVudGltZVR5cGU6IHVuZGVmaW5lZFxuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKF9vUGF5bG9hZD8uY29udGFjdD8ubGVuZ3RoID4gMCkge1xuXHRcdFx0cmV0dXJuIG9EZWZhdWx0SW5pdGlhbFR5cGU7XG5cdFx0fSBlbHNlIGlmIChfb1BheWxvYWQ/LmVudGl0eVR5cGUgJiYgX29QYXlsb2FkPy5uYXZpZ2F0aW9uUGF0aCkge1xuXHRcdFx0cmV0dXJuIG9EZWZhdWx0SW5pdGlhbFR5cGU7XG5cdFx0fVxuXHRcdHRocm93IG5ldyBFcnJvcihcIm5vIHBheWxvYWQgb3Igc2VtYW50aWNPYmplY3RzIGZvdW5kXCIpO1xuXHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdExvZy5lcnJvcihcIkVycm9yIGluIFNpbXBsZUxpbmtEZWxlZ2F0ZS5mZXRjaExpbmtUeXBlOiBcIiwgb0Vycm9yKTtcblx0fVxufTtcblxuU2ltcGxlTGlua0RlbGVnYXRlLl9SZW1vdmVUaXRsZUxpbmtGcm9tVGFyZ2V0cyA9IGZ1bmN0aW9uIChfYUxpbmtJdGVtczogYW55W10sIF9iVGl0bGVIYXNMaW5rOiBib29sZWFuLCBfYVRpdGxlTGluazogYW55KTogYW55IHtcblx0bGV0IF9zVGl0bGVMaW5rSHJlZiwgX29NRENMaW5rO1xuXHRsZXQgYlJlc3VsdDogYm9vbGVhbiA9IGZhbHNlO1xuXHRpZiAoX2JUaXRsZUhhc0xpbmsgJiYgX2FUaXRsZUxpbmsgJiYgX2FUaXRsZUxpbmtbMF0pIHtcblx0XHRsZXQgbGlua0lzUHJpbWFyeUFjdGlvbjogYm9vbGVhbiwgX3NMaW5rSW50ZW50V2l0aG91dFBhcmFtZXRlcnM6IHN0cmluZztcblx0XHRjb25zdCBfc1RpdGxlSW50ZW50ID0gX2FUaXRsZUxpbmtbMF0uaW50ZW50LnNwbGl0KFwiP1wiKVswXTtcblx0XHRpZiAoX2FMaW5rSXRlbXMgJiYgX2FMaW5rSXRlbXNbMF0pIHtcblx0XHRcdF9zTGlua0ludGVudFdpdGhvdXRQYXJhbWV0ZXJzID0gYCMke19hTGlua0l0ZW1zWzBdLmdldFByb3BlcnR5KFwia2V5XCIpfWA7XG5cdFx0XHRsaW5rSXNQcmltYXJ5QWN0aW9uID0gX3NUaXRsZUludGVudCA9PT0gX3NMaW5rSW50ZW50V2l0aG91dFBhcmFtZXRlcnM7XG5cdFx0XHRpZiAobGlua0lzUHJpbWFyeUFjdGlvbikge1xuXHRcdFx0XHRfc1RpdGxlTGlua0hyZWYgPSBfYUxpbmtJdGVtc1swXS5nZXRQcm9wZXJ0eShcImhyZWZcIik7XG5cdFx0XHRcdHRoaXMucGF5bG9hZC50aXRsZWxpbmtocmVmID0gX3NUaXRsZUxpbmtIcmVmO1xuXHRcdFx0XHRpZiAoX2FMaW5rSXRlbXNbMF0uaXNBKENPTlNUQU5UUy5zYXB1aW1kY2xpbmtMaW5rSXRlbSkpIHtcblx0XHRcdFx0XHRfb01EQ0xpbmsgPSBfYUxpbmtJdGVtc1swXS5nZXRQYXJlbnQoKTtcblx0XHRcdFx0XHRfb01EQ0xpbmsuZ2V0TW9kZWwoXCIkc2FwdWltZGNMaW5rXCIpLnNldFByb3BlcnR5KFwiL3RpdGxlTGlua0hyZWZcIiwgX3NUaXRsZUxpbmtIcmVmKTtcblx0XHRcdFx0XHRjb25zdCBhTUxpbmtJdGVtcyA9IF9vTURDTGlua1xuXHRcdFx0XHRcdFx0LmdldE1vZGVsKFwiJHNhcHVpbWRjTGlua1wiKVxuXHRcdFx0XHRcdFx0LmdldFByb3BlcnR5KFwiL2xpbmtJdGVtc1wiKVxuXHRcdFx0XHRcdFx0LmZpbHRlcihmdW5jdGlvbiAob0xpbmtJdGVtOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0aWYgKGAjJHtvTGlua0l0ZW0ua2V5fWAgIT09IF9zTGlua0ludGVudFdpdGhvdXRQYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9MaW5rSXRlbTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0aWYgKGFNTGlua0l0ZW1zICYmIGFNTGlua0l0ZW1zLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdF9vTURDTGluay5nZXRNb2RlbChcIiRzYXB1aW1kY0xpbmtcIikuc2V0UHJvcGVydHkoXCIvbGlua0l0ZW1zL1wiLCBhTUxpbmtJdGVtcyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJSZXN1bHQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBiUmVzdWx0O1xufTtcblNpbXBsZUxpbmtEZWxlZ2F0ZS5fSXNTZW1hbnRpY09iamVjdER5bmFtaWMgPSBmdW5jdGlvbiAoYU5ld0xpbmtDdXN0b21EYXRhOiBhbnksIG9UaGlzOiBhbnkpIHtcblx0aWYgKGFOZXdMaW5rQ3VzdG9tRGF0YSAmJiBvVGhpcy5hTGlua0N1c3RvbURhdGEpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0b1RoaXMuYUxpbmtDdXN0b21EYXRhLmZpbHRlcihmdW5jdGlvbiAobGluazogYW55KSB7XG5cdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0YU5ld0xpbmtDdXN0b21EYXRhLmZpbHRlcihmdW5jdGlvbiAob3RoZXJMaW5rOiBhbnkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBvdGhlckxpbmsgIT09IGxpbms7XG5cdFx0XHRcdFx0fSkubGVuZ3RoID4gMFxuXHRcdFx0XHQpO1xuXHRcdFx0fSkubGVuZ3RoID4gMFxuXHRcdCk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59O1xuU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRMaW5lQ29udGV4dCA9IGZ1bmN0aW9uIChvVmlldzogYW55LCBtTGluZUNvbnRleHQ6IGFueSkge1xuXHRpZiAoIW1MaW5lQ29udGV4dCkge1xuXHRcdGlmIChvVmlldy5nZXRBZ2dyZWdhdGlvbihcImNvbnRlbnRcIilbMF0gJiYgb1ZpZXcuZ2V0QWdncmVnYXRpb24oXCJjb250ZW50XCIpWzBdLmdldEJpbmRpbmdDb250ZXh0KCkpIHtcblx0XHRcdHJldHVybiBvVmlldy5nZXRBZ2dyZWdhdGlvbihcImNvbnRlbnRcIilbMF0uZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG1MaW5lQ29udGV4dDtcbn07XG5TaW1wbGVMaW5rRGVsZWdhdGUuX3NldEZpbHRlckNvbnRleHRVcmxGb3JTZWxlY3Rpb25WYXJpYW50ID0gZnVuY3Rpb24gKFxuXHRvVmlldzogYW55LFxuXHRvU2VsZWN0aW9uVmFyaWFudDogU2VsZWN0aW9uVmFyaWFudCxcblx0b05hdmlnYXRpb25TZXJ2aWNlOiBhbnlcbik6IFNlbGVjdGlvblZhcmlhbnQge1xuXHRpZiAob1ZpZXcuZ2V0Vmlld0RhdGEoKS5lbnRpdHlTZXQgJiYgb1NlbGVjdGlvblZhcmlhbnQpIHtcblx0XHRjb25zdCBzQ29udGV4dFVybCA9IG9OYXZpZ2F0aW9uU2VydmljZS5jb25zdHJ1Y3RDb250ZXh0VXJsKG9WaWV3LmdldFZpZXdEYXRhKCkuZW50aXR5U2V0LCBvVmlldy5nZXRNb2RlbCgpKTtcblx0XHRvU2VsZWN0aW9uVmFyaWFudC5zZXRGaWx0ZXJDb250ZXh0VXJsKHNDb250ZXh0VXJsKTtcblx0fVxuXHRyZXR1cm4gb1NlbGVjdGlvblZhcmlhbnQ7XG59O1xuXG5TaW1wbGVMaW5rRGVsZWdhdGUuX3NldE9iamVjdE1hcHBpbmdzID0gZnVuY3Rpb24gKFxuXHRzU2VtYW50aWNPYmplY3Q6IHN0cmluZyxcblx0b1BhcmFtczogYW55LFxuXHRhU2VtYW50aWNPYmplY3RNYXBwaW5nczogUmVnaXN0ZXJlZFNlbWFudGljT2JqZWN0TWFwcGluZ3MsXG5cdG9TZWxlY3Rpb25WYXJpYW50OiBTZWxlY3Rpb25WYXJpYW50XG4pIHtcblx0bGV0IGhhc0NoYW5nZWQgPSBmYWxzZTtcblx0Y29uc3QgbW9kaWZpZWRTZWxlY3Rpb25WYXJpYW50ID0gbmV3IFNlbGVjdGlvblZhcmlhbnQob1NlbGVjdGlvblZhcmlhbnQudG9KU09OT2JqZWN0KCkpO1xuXHQvLyBpZiBzZW1hbnRpY09iamVjdE1hcHBpbmdzIGhhcyBpdGVtcyB3aXRoIGR5bmFtaWMgc2VtYW50aWNPYmplY3RzIHdlIG5lZWQgdG8gcmVzb2x2ZSB0aGVtIHVzaW5nIG9QYXJhbXNcblx0YVNlbWFudGljT2JqZWN0TWFwcGluZ3MuZm9yRWFjaChmdW5jdGlvbiAobWFwcGluZykge1xuXHRcdGxldCBtYXBwaW5nU2VtYW50aWNPYmplY3QgPSBtYXBwaW5nLnNlbWFudGljT2JqZWN0O1xuXHRcdGNvbnN0IG1hcHBpbmdTZW1hbnRpY09iamVjdFBhdGggPSBnZXREeW5hbWljUGF0aEZyb21TZW1hbnRpY09iamVjdChtYXBwaW5nLnNlbWFudGljT2JqZWN0KTtcblx0XHRpZiAobWFwcGluZ1NlbWFudGljT2JqZWN0UGF0aCAmJiBvUGFyYW1zW21hcHBpbmdTZW1hbnRpY09iamVjdFBhdGhdKSB7XG5cdFx0XHRtYXBwaW5nU2VtYW50aWNPYmplY3QgPSBvUGFyYW1zW21hcHBpbmdTZW1hbnRpY09iamVjdFBhdGhdO1xuXHRcdH1cblx0XHRpZiAoc1NlbWFudGljT2JqZWN0ID09PSBtYXBwaW5nU2VtYW50aWNPYmplY3QpIHtcblx0XHRcdGNvbnN0IG9NYXBwaW5ncyA9IG1hcHBpbmcuaXRlbXM7XG5cdFx0XHRmb3IgKGNvbnN0IGkgaW4gb01hcHBpbmdzKSB7XG5cdFx0XHRcdGNvbnN0IHNMb2NhbFByb3BlcnR5ID0gb01hcHBpbmdzW2ldLmtleTtcblx0XHRcdFx0Y29uc3Qgc1NlbWFudGljT2JqZWN0UHJvcGVydHkgPSBvTWFwcGluZ3NbaV0udmFsdWU7XG5cdFx0XHRcdGlmIChzTG9jYWxQcm9wZXJ0eSAhPT0gc1NlbWFudGljT2JqZWN0UHJvcGVydHkpIHtcblx0XHRcdFx0XHRpZiAob1BhcmFtc1tzTG9jYWxQcm9wZXJ0eV0pIHtcblx0XHRcdFx0XHRcdG1vZGlmaWVkU2VsZWN0aW9uVmFyaWFudC5yZW1vdmVQYXJhbWV0ZXIoc1NlbWFudGljT2JqZWN0UHJvcGVydHkpO1xuXHRcdFx0XHRcdFx0bW9kaWZpZWRTZWxlY3Rpb25WYXJpYW50LnJlbW92ZVNlbGVjdE9wdGlvbihzU2VtYW50aWNPYmplY3RQcm9wZXJ0eSk7XG5cdFx0XHRcdFx0XHRtb2RpZmllZFNlbGVjdGlvblZhcmlhbnQucmVuYW1lUGFyYW1ldGVyKHNMb2NhbFByb3BlcnR5LCBzU2VtYW50aWNPYmplY3RQcm9wZXJ0eSk7XG5cdFx0XHRcdFx0XHRtb2RpZmllZFNlbGVjdGlvblZhcmlhbnQucmVuYW1lU2VsZWN0T3B0aW9uKHNMb2NhbFByb3BlcnR5LCBzU2VtYW50aWNPYmplY3RQcm9wZXJ0eSk7XG5cdFx0XHRcdFx0XHRvUGFyYW1zW3NTZW1hbnRpY09iamVjdFByb3BlcnR5XSA9IG9QYXJhbXNbc0xvY2FsUHJvcGVydHldO1xuXHRcdFx0XHRcdFx0ZGVsZXRlIG9QYXJhbXNbc0xvY2FsUHJvcGVydHldO1xuXHRcdFx0XHRcdFx0aGFzQ2hhbmdlZCA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIFdlIHJlbW92ZSB0aGUgcGFyYW1ldGVyIGFzIHRoZXJlIGlzIG5vIHZhbHVlXG5cblx0XHRcdFx0XHQvLyBUaGUgbG9jYWwgcHJvcGVydHkgY29tZXMgZnJvbSBhIG5hdmlnYXRpb24gcHJvcGVydHlcblx0XHRcdFx0XHRlbHNlIGlmIChzTG9jYWxQcm9wZXJ0eS5zcGxpdChcIi9cIikubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdFx0Ly8gZmluZCB0aGUgcHJvcGVydHkgdG8gYmUgcmVtb3ZlZFxuXHRcdFx0XHRcdFx0Y29uc3QgcHJvcGVydHlUb0JlUmVtb3ZlZCA9IHNMb2NhbFByb3BlcnR5LnNwbGl0KFwiL1wiKS5zbGljZSgtMSlbMF07XG5cdFx0XHRcdFx0XHQvLyBUaGUgbmF2aWdhdGlvbiBwcm9wZXJ0eSBoYXMgbm8gdmFsdWVcblx0XHRcdFx0XHRcdGlmICghb1BhcmFtc1twcm9wZXJ0eVRvQmVSZW1vdmVkXSkge1xuXHRcdFx0XHRcdFx0XHRkZWxldGUgb1BhcmFtc1twcm9wZXJ0eVRvQmVSZW1vdmVkXTtcblx0XHRcdFx0XHRcdFx0bW9kaWZpZWRTZWxlY3Rpb25WYXJpYW50LnJlbW92ZVBhcmFtZXRlcihwcm9wZXJ0eVRvQmVSZW1vdmVkKTtcblx0XHRcdFx0XHRcdFx0bW9kaWZpZWRTZWxlY3Rpb25WYXJpYW50LnJlbW92ZVNlbGVjdE9wdGlvbihwcm9wZXJ0eVRvQmVSZW1vdmVkKTtcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAocHJvcGVydHlUb0JlUmVtb3ZlZCAhPT0gc1NlbWFudGljT2JqZWN0UHJvcGVydHkpIHtcblx0XHRcdFx0XHRcdFx0Ly8gVGhlIG5hdmlnYXRpb24gcHJvcGVydHkgaGFzIGEgdmFsdWUgYW5kIHByb3BlcnRpZXMgbmFtZXMgYXJlIGRpZmZlcmVudFxuXHRcdFx0XHRcdFx0XHRtb2RpZmllZFNlbGVjdGlvblZhcmlhbnQucmVuYW1lUGFyYW1ldGVyKHByb3BlcnR5VG9CZVJlbW92ZWQsIHNTZW1hbnRpY09iamVjdFByb3BlcnR5KTtcblx0XHRcdFx0XHRcdFx0bW9kaWZpZWRTZWxlY3Rpb25WYXJpYW50LnJlbmFtZVNlbGVjdE9wdGlvbihwcm9wZXJ0eVRvQmVSZW1vdmVkLCBzU2VtYW50aWNPYmplY3RQcm9wZXJ0eSk7XG5cdFx0XHRcdFx0XHRcdG9QYXJhbXNbc1NlbWFudGljT2JqZWN0UHJvcGVydHldID0gb1BhcmFtc1twcm9wZXJ0eVRvQmVSZW1vdmVkXTtcblx0XHRcdFx0XHRcdFx0ZGVsZXRlIG9QYXJhbXNbcHJvcGVydHlUb0JlUmVtb3ZlZF07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGRlbGV0ZSBvUGFyYW1zW3NMb2NhbFByb3BlcnR5XTtcblx0XHRcdFx0XHRcdG1vZGlmaWVkU2VsZWN0aW9uVmFyaWFudC5yZW1vdmVQYXJhbWV0ZXIoc1NlbWFudGljT2JqZWN0UHJvcGVydHkpO1xuXHRcdFx0XHRcdFx0bW9kaWZpZWRTZWxlY3Rpb25WYXJpYW50LnJlbW92ZVNlbGVjdE9wdGlvbihzU2VtYW50aWNPYmplY3RQcm9wZXJ0eSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIHsgcGFyYW1zOiBvUGFyYW1zLCBoYXNDaGFuZ2VkLCBzZWxlY3Rpb25WYXJpYW50OiBtb2RpZmllZFNlbGVjdGlvblZhcmlhbnQgfTtcbn07XG5cbi8qKlxuICogQ2FsbCBnZXRBcHBTdGF0ZUtleUFuZFVybFBhcmFtZXRlcnMgaW4gbmF2aWdhdGlvbiBzZXJ2aWNlIGFuZCBjYWNoZSBpdHMgcmVzdWx0cy5cbiAqXG4gKiBAcGFyYW0gX3RoaXMgVGhlIGluc3RhbmNlIG9mIHF1aWNrdmlld2RlbGVnYXRlLlxuICogQHBhcmFtIG5hdmlnYXRpb25TZXJ2aWNlIFRoZSBuYXZpZ2F0aW9uIHNlcnZpY2UuXG4gKiBAcGFyYW0gc2VsZWN0aW9uVmFyaWFudCBUaGUgY3VycmVudCBzZWxlY3Rpb24gdmFyaWFudC5cbiAqIEBwYXJhbSBzZW1hbnRpY09iamVjdCBUaGUgY3VycmVudCBzZW1hbnRpY09iamVjdC5cbiAqL1xuU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRBcHBTdGF0ZUtleUFuZFVybFBhcmFtZXRlcnMgPSBhc3luYyBmdW5jdGlvbiAoXG5cdF90aGlzOiB0eXBlb2YgU2ltcGxlTGlua0RlbGVnYXRlLFxuXHRuYXZpZ2F0aW9uU2VydmljZTogYW55LFxuXHRzZWxlY3Rpb25WYXJpYW50OiBTZWxlY3Rpb25WYXJpYW50LFxuXHRzZW1hbnRpY09iamVjdDogc3RyaW5nXG4pOiBQcm9taXNlPHN0cmluZ1tdPiB7XG5cdGxldCBhVmFsdWVzID0gW107XG5cblx0Ly8gY2hlY2sgaWYgZGVmYXVsdCBjYWNoZSBjb250YWlucyBhbHJlYWR5IHRoZSB1bm1vZGlmaWVkIHNlbGVjdGlvblZhcmlhbnRcblx0aWYgKGRlZXBFcXVhbChzZWxlY3Rpb25WYXJpYW50LCBfdGhpcy5hcHBTdGF0ZUtleU1hcFtcIlwiXT8uc2VsZWN0aW9uVmFyaWFudCkpIHtcblx0XHRjb25zdCBkZWZhdWx0Q2FjaGUgPSBfdGhpcy5hcHBTdGF0ZUtleU1hcFtcIlwiXTtcblx0XHRyZXR1cm4gW2RlZmF1bHRDYWNoZS5zZW1hbnRpY0F0dHJpYnV0ZXMsIGRlZmF1bHRDYWNoZS5hcHBzdGF0ZWtleV07XG5cdH1cblx0Ly8gdXBkYXRlIHVybCBwYXJhbWV0ZXJzIGJlY2F1c2UgdGhlcmUgaXMgYSBjaGFuZ2UgaW4gc2VsZWN0aW9uIHZhcmlhbnRcblx0aWYgKFxuXHRcdF90aGlzLmFwcFN0YXRlS2V5TWFwW2Ake3NlbWFudGljT2JqZWN0fWBdID09PSB1bmRlZmluZWQgfHxcblx0XHQhZGVlcEVxdWFsKF90aGlzLmFwcFN0YXRlS2V5TWFwW2Ake3NlbWFudGljT2JqZWN0fWBdLnNlbGVjdGlvblZhcmlhbnQsIHNlbGVjdGlvblZhcmlhbnQpXG5cdCkge1xuXHRcdGFWYWx1ZXMgPSBhd2FpdCB0b0VTNlByb21pc2UobmF2aWdhdGlvblNlcnZpY2UuZ2V0QXBwU3RhdGVLZXlBbmRVcmxQYXJhbWV0ZXJzKHNlbGVjdGlvblZhcmlhbnQudG9KU09OU3RyaW5nKCkpKTtcblx0XHRfdGhpcy5hcHBTdGF0ZUtleU1hcFtgJHtzZW1hbnRpY09iamVjdH1gXSA9IHtcblx0XHRcdHNlbWFudGljQXR0cmlidXRlczogYVZhbHVlc1swXSxcblx0XHRcdGFwcHN0YXRla2V5OiBhVmFsdWVzWzFdLFxuXHRcdFx0c2VsZWN0aW9uVmFyaWFudDogc2VsZWN0aW9uVmFyaWFudFxuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0Y29uc3QgY2FjaGUgPSBfdGhpcy5hcHBTdGF0ZUtleU1hcFtgJHtzZW1hbnRpY09iamVjdH1gXTtcblx0XHRhVmFsdWVzID0gW2NhY2hlLnNlbWFudGljQXR0cmlidXRlcywgY2FjaGUuYXBwc3RhdGVrZXldO1xuXHR9XG5cdHJldHVybiBhVmFsdWVzO1xufTtcblxuU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRMaW5rSXRlbVdpdGhOZXdQYXJhbWV0ZXIgPSBhc3luYyBmdW5jdGlvbiAoXG5cdF90aGF0OiBhbnksXG5cdF9iVGl0bGVIYXNMaW5rOiBib29sZWFuLFxuXHRfYVRpdGxlTGluazogc3RyaW5nW10sXG5cdF9vTGlua0l0ZW06IGFueSxcblx0X29TaGVsbFNlcnZpY2VzOiBhbnksXG5cdF9vUGF5bG9hZDogYW55LFxuXHRfb1BhcmFtczogYW55LFxuXHRfc0FwcFN0YXRlS2V5OiBzdHJpbmcsXG5cdF9vU2VsZWN0aW9uVmFyaWFudDogU2VsZWN0aW9uVmFyaWFudCxcblx0X29OYXZpZ2F0aW9uU2VydmljZTogTmF2aWdhdGlvblNlcnZpY2Vcbik6IFByb21pc2U8YW55PiB7XG5cdHJldHVybiBfb1NoZWxsU2VydmljZXMuZXhwYW5kQ29tcGFjdEhhc2goX29MaW5rSXRlbS5nZXRIcmVmKCkpLnRoZW4oYXN5bmMgZnVuY3Rpb24gKHNIYXNoOiBhbnkpIHtcblx0XHRjb25zdCBvU2hlbGxIYXNoID0gX29TaGVsbFNlcnZpY2VzLnBhcnNlU2hlbGxIYXNoKHNIYXNoKTtcblx0XHRjb25zdCBwYXJhbXMgPSBPYmplY3QuYXNzaWduKHt9LCBfb1BhcmFtcyk7XG5cdFx0Y29uc3Qge1xuXHRcdFx0cGFyYW1zOiBvTmV3UGFyYW1zLFxuXHRcdFx0aGFzQ2hhbmdlZCxcblx0XHRcdHNlbGVjdGlvblZhcmlhbnQ6IG5ld1NlbGVjdGlvblZhcmlhbnRcblx0XHR9ID0gU2ltcGxlTGlua0RlbGVnYXRlLl9zZXRPYmplY3RNYXBwaW5ncyhvU2hlbGxIYXNoLnNlbWFudGljT2JqZWN0LCBwYXJhbXMsIF9vUGF5bG9hZC5zZW1hbnRpY09iamVjdE1hcHBpbmdzLCBfb1NlbGVjdGlvblZhcmlhbnQpO1xuXHRcdGlmIChoYXNDaGFuZ2VkKSB7XG5cdFx0XHRjb25zdCBhVmFsdWVzID0gYXdhaXQgU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRBcHBTdGF0ZUtleUFuZFVybFBhcmFtZXRlcnMoXG5cdFx0XHRcdF90aGF0LFxuXHRcdFx0XHRfb05hdmlnYXRpb25TZXJ2aWNlLFxuXHRcdFx0XHRuZXdTZWxlY3Rpb25WYXJpYW50LFxuXHRcdFx0XHRvU2hlbGxIYXNoLnNlbWFudGljT2JqZWN0XG5cdFx0XHQpO1xuXG5cdFx0XHRfc0FwcFN0YXRlS2V5ID0gYVZhbHVlc1sxXTtcblx0XHR9XG5cdFx0Y29uc3Qgb05ld1NoZWxsSGFzaCA9IHtcblx0XHRcdHRhcmdldDoge1xuXHRcdFx0XHRzZW1hbnRpY09iamVjdDogb1NoZWxsSGFzaC5zZW1hbnRpY09iamVjdCxcblx0XHRcdFx0YWN0aW9uOiBvU2hlbGxIYXNoLmFjdGlvblxuXHRcdFx0fSxcblx0XHRcdHBhcmFtczogb05ld1BhcmFtcyxcblx0XHRcdGFwcFN0YXRlS2V5OiBfc0FwcFN0YXRlS2V5XG5cdFx0fTtcblx0XHRkZWxldGUgb05ld1NoZWxsSGFzaC5wYXJhbXNbXCJzYXAteGFwcC1zdGF0ZVwiXTtcblx0XHRfb0xpbmtJdGVtLnNldEhyZWYoYCMke19vU2hlbGxTZXJ2aWNlcy5jb25zdHJ1Y3RTaGVsbEhhc2gob05ld1NoZWxsSGFzaCl9YCk7XG5cdFx0X29QYXlsb2FkLmFTZW1hbnRpY0xpbmtzLnB1c2goX29MaW5rSXRlbS5nZXRIcmVmKCkpO1xuXHRcdC8vIFRoZSBsaW5rIGlzIHJlbW92ZWQgZnJvbSB0aGUgdGFyZ2V0IGxpc3QgYmVjYXVzZSB0aGUgdGl0bGUgbGluayBoYXMgc2FtZSB0YXJnZXQuXG5cdFx0cmV0dXJuIFNpbXBsZUxpbmtEZWxlZ2F0ZS5fUmVtb3ZlVGl0bGVMaW5rRnJvbVRhcmdldHMuYmluZChfdGhhdCkoW19vTGlua0l0ZW1dLCBfYlRpdGxlSGFzTGluaywgX2FUaXRsZUxpbmspO1xuXHR9KTtcbn07XG5TaW1wbGVMaW5rRGVsZWdhdGUuX3JlbW92ZUVtcHR5TGlua0l0ZW0gPSBmdW5jdGlvbiAoYUxpbmtJdGVtczogYW55KTogYW55W10ge1xuXHRyZXR1cm4gYUxpbmtJdGVtcy5maWx0ZXIoKGxpbmtJdGVtOiBhbnkpID0+IHtcblx0XHRyZXR1cm4gbGlua0l0ZW0gIT09IHVuZGVmaW5lZDtcblx0fSk7XG59O1xuLyoqXG4gKiBFbmFibGVzIHRoZSBtb2RpZmljYXRpb24gb2YgTGlua0l0ZW1zIGJlZm9yZSB0aGUgcG9wb3ZlciBvcGVucy4gVGhpcyBlbmFibGVzIGFkZGl0aW9uYWwgcGFyYW1ldGVyc1xuICogdG8gYmUgYWRkZWQgdG8gdGhlIGxpbmsuXG4gKlxuICogQHBhcmFtIG9QYXlsb2FkIFRoZSBwYXlsb2FkIG9mIHRoZSBMaW5rIGdpdmVuIGJ5IHRoZSBhcHBsaWNhdGlvblxuICogQHBhcmFtIG9CaW5kaW5nQ29udGV4dCBUaGUgYmluZGluZyBjb250ZXh0IG9mIHRoZSBMaW5rXG4gKiBAcGFyYW0gYUxpbmtJdGVtcyBUaGUgTGlua0l0ZW1zIG9mIHRoZSBMaW5rIHRoYXQgY2FuIGJlIG1vZGlmaWVkXG4gKiBAcmV0dXJucyBPbmNlIHJlc29sdmVkIGFuIGFycmF5IG9mIHtAbGluayBzYXAudWkubWRjLmxpbmsuTGlua0l0ZW19IGlzIHJldHVybmVkXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5tb2RpZnlMaW5rSXRlbXMgPSBhc3luYyBmdW5jdGlvbiAob1BheWxvYWQ6IGFueSwgb0JpbmRpbmdDb250ZXh0OiBDb250ZXh0LCBhTGlua0l0ZW1zOiBhbnkpIHtcblx0aWYgKGFMaW5rSXRlbXMubGVuZ3RoICE9PSAwKSB7XG5cdFx0dGhpcy5wYXlsb2FkID0gb1BheWxvYWQ7XG5cdFx0Y29uc3Qgb0xpbmsgPSBhTGlua0l0ZW1zWzBdLmdldFBhcmVudCgpO1xuXHRcdGNvbnN0IG9WaWV3ID0gQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0VmlldyhvTGluayk7XG5cdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudChvVmlldyk7XG5cdFx0Y29uc3QgcHJpbWFyeUFjdGlvbklzQWN0aXZlID0gKGF3YWl0IEZpZWxkSGVscGVyLmNoZWNrUHJpbWFyeUFjdGlvbnMob1BheWxvYWQsIHRydWUsIG9BcHBDb21wb25lbnQpKSBhcyBhbnk7XG5cdFx0Y29uc3QgYVRpdGxlTGluayA9IHByaW1hcnlBY3Rpb25Jc0FjdGl2ZS50aXRsZUxpbms7XG5cdFx0Y29uc3QgYlRpdGxlSGFzTGluazogYm9vbGVhbiA9IHByaW1hcnlBY3Rpb25Jc0FjdGl2ZS5oYXNUaXRsZUxpbms7XG5cdFx0Y29uc3Qgb1NoZWxsU2VydmljZXMgPSBvQXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKTtcblx0XHRpZiAoIW9TaGVsbFNlcnZpY2VzLmhhc1VTaGVsbCgpKSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJRdWlja1ZpZXdEZWxlZ2F0ZTogQ2Fubm90IHJldHJpZXZlIHRoZSBzaGVsbCBzZXJ2aWNlc1wiKTtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdCgpO1xuXHRcdH1cblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb1ZpZXcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbDtcblx0XHRsZXQgbUxpbmVDb250ZXh0ID0gb0xpbmsuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0XHRjb25zdCBvVGFyZ2V0SW5mbzogYW55ID0ge1xuXHRcdFx0c2VtYW50aWNPYmplY3Q6IG9QYXlsb2FkLm1haW5TZW1hbnRpY09iamVjdCxcblx0XHRcdGFjdGlvbjogXCJcIlxuXHRcdH07XG5cblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgYU5ld0xpbmtDdXN0b21EYXRhID1cblx0XHRcdFx0b0xpbmsgJiZcblx0XHRcdFx0dGhpcy5fZmV0Y2hMaW5rQ3VzdG9tRGF0YShvTGluaykubWFwKGZ1bmN0aW9uIChsaW5rSXRlbTogYW55KSB7XG5cdFx0XHRcdFx0cmV0dXJuIGxpbmtJdGVtLm1Qcm9wZXJ0aWVzLnZhbHVlO1xuXHRcdFx0XHR9KTtcblx0XHRcdC8vIGNoZWNrIGlmIGFsbCBsaW5rIGl0ZW1zIGluIHRoaXMuYUxpbmtDdXN0b21EYXRhIGFyZSBhbHNvIHByZXNlbnQgaW4gYU5ld0xpbmtDdXN0b21EYXRhXG5cdFx0XHRpZiAoU2ltcGxlTGlua0RlbGVnYXRlLl9Jc1NlbWFudGljT2JqZWN0RHluYW1pYyhhTmV3TGlua0N1c3RvbURhdGEsIHRoaXMpKSB7XG5cdFx0XHRcdC8vIGlmIHRoZSBjdXN0b21EYXRhIGNoYW5nZWQgdGhlcmUgYXJlIGRpZmZlcmVudCBMaW5rSXRlbXMgdG8gZGlzcGxheVxuXHRcdFx0XHRjb25zdCBvU2VtYW50aWNBdHRyaWJ1dGVzUmVzb2x2ZWQgPSBTaW1wbGVMaW5rRGVsZWdhdGUuX2NhbGN1bGF0ZVNlbWFudGljQXR0cmlidXRlcyhcblx0XHRcdFx0XHRvQmluZGluZ0NvbnRleHQuZ2V0T2JqZWN0KCksXG5cdFx0XHRcdFx0b1BheWxvYWQsXG5cdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdHRoaXMuX2xpbmtcblx0XHRcdFx0KTtcblx0XHRcdFx0Y29uc3Qgb1NlbWFudGljQXR0cmlidXRlcyA9IG9TZW1hbnRpY0F0dHJpYnV0ZXNSZXNvbHZlZC5yZXN1bHRzO1xuXHRcdFx0XHRjb25zdCBvUGF5bG9hZFJlc29sdmVkID0gb1NlbWFudGljQXR0cmlidXRlc1Jlc29sdmVkLnBheWxvYWQ7XG5cdFx0XHRcdGFMaW5rSXRlbXMgPSBhd2FpdCBTaW1wbGVMaW5rRGVsZWdhdGUuX3JldHJpZXZlTmF2aWdhdGlvblRhcmdldHMoXG5cdFx0XHRcdFx0XCJcIixcblx0XHRcdFx0XHRvU2VtYW50aWNBdHRyaWJ1dGVzLFxuXHRcdFx0XHRcdG9QYXlsb2FkUmVzb2x2ZWQsXG5cdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdHRoaXMuX2xpbmtcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IG9OYXZpZ2F0aW9uU2VydmljZSA9IG9BcHBDb21wb25lbnQuZ2V0TmF2aWdhdGlvblNlcnZpY2UoKTtcblx0XHRcdGNvbnN0IG9Db250cm9sbGVyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIFBhZ2VDb250cm9sbGVyO1xuXHRcdFx0bGV0IG9TZWxlY3Rpb25WYXJpYW50O1xuXHRcdFx0bGV0IG1MaW5lQ29udGV4dERhdGE7XG5cdFx0XHRtTGluZUNvbnRleHQgPSBTaW1wbGVMaW5rRGVsZWdhdGUuX2dldExpbmVDb250ZXh0KG9WaWV3LCBtTGluZUNvbnRleHQpO1xuXHRcdFx0Y29uc3Qgc01ldGFQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aChtTGluZUNvbnRleHQuZ2V0UGF0aCgpKTtcblx0XHRcdG1MaW5lQ29udGV4dERhdGEgPSBvQ29udHJvbGxlci5faW50ZW50QmFzZWROYXZpZ2F0aW9uLnJlbW92ZVNlbnNpdGl2ZURhdGEobUxpbmVDb250ZXh0LmdldE9iamVjdCgpLCBzTWV0YVBhdGgpO1xuXHRcdFx0bUxpbmVDb250ZXh0RGF0YSA9IG9Db250cm9sbGVyLl9pbnRlbnRCYXNlZE5hdmlnYXRpb24ucHJlcGFyZUNvbnRleHRGb3JFeHRlcm5hbE5hdmlnYXRpb24obUxpbmVDb250ZXh0RGF0YSwgbUxpbmVDb250ZXh0KTtcblx0XHRcdG9TZWxlY3Rpb25WYXJpYW50ID0gb05hdmlnYXRpb25TZXJ2aWNlLm1peEF0dHJpYnV0ZXNBbmRTZWxlY3Rpb25WYXJpYW50KG1MaW5lQ29udGV4dERhdGEuc2VtYW50aWNBdHRyaWJ1dGVzLCB7fSk7XG5cdFx0XHRvVGFyZ2V0SW5mby5wcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0ID0gbUxpbmVDb250ZXh0RGF0YS5wcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0O1xuXHRcdFx0Ly9UTyBtb2RpZnkgdGhlIHNlbGVjdGlvbiB2YXJpYW50IGZyb20gdGhlIEV4dGVuc2lvbiBBUElcblx0XHRcdG9Db250cm9sbGVyLmludGVudEJhc2VkTmF2aWdhdGlvbi5hZGFwdE5hdmlnYXRpb25Db250ZXh0KG9TZWxlY3Rpb25WYXJpYW50LCBvVGFyZ2V0SW5mbyk7XG5cdFx0XHRTaW1wbGVMaW5rRGVsZWdhdGUuX3JlbW92ZVRlY2huaWNhbFBhcmFtZXRlcnMob1NlbGVjdGlvblZhcmlhbnQpO1xuXHRcdFx0b1NlbGVjdGlvblZhcmlhbnQgPSBTaW1wbGVMaW5rRGVsZWdhdGUuX3NldEZpbHRlckNvbnRleHRVcmxGb3JTZWxlY3Rpb25WYXJpYW50KG9WaWV3LCBvU2VsZWN0aW9uVmFyaWFudCwgb05hdmlnYXRpb25TZXJ2aWNlKTtcblx0XHRcdGNvbnN0IGFWYWx1ZXMgPSBhd2FpdCBTaW1wbGVMaW5rRGVsZWdhdGUuX2dldEFwcFN0YXRlS2V5QW5kVXJsUGFyYW1ldGVycyh0aGlzLCBvTmF2aWdhdGlvblNlcnZpY2UsIG9TZWxlY3Rpb25WYXJpYW50LCBcIlwiKTtcblx0XHRcdGNvbnN0IG9QYXJhbXMgPSBhVmFsdWVzWzBdO1xuXHRcdFx0Y29uc3QgYXBwU3RhdGVLZXkgPSBhVmFsdWVzWzFdO1xuXHRcdFx0bGV0IHRpdGxlTGlua3RvQmVSZW1vdmU6IGFueTtcblx0XHRcdG9QYXlsb2FkLmFTZW1hbnRpY0xpbmtzID0gW107XG5cdFx0XHRhTGlua0l0ZW1zID0gU2ltcGxlTGlua0RlbGVnYXRlLl9yZW1vdmVFbXB0eUxpbmtJdGVtKGFMaW5rSXRlbXMpO1xuXHRcdFx0Zm9yIChjb25zdCBpbmRleCBpbiBhTGlua0l0ZW1zKSB7XG5cdFx0XHRcdHRpdGxlTGlua3RvQmVSZW1vdmUgPSBhd2FpdCBTaW1wbGVMaW5rRGVsZWdhdGUuX2dldExpbmtJdGVtV2l0aE5ld1BhcmFtZXRlcihcblx0XHRcdFx0XHR0aGlzLFxuXHRcdFx0XHRcdGJUaXRsZUhhc0xpbmssXG5cdFx0XHRcdFx0YVRpdGxlTGluayxcblx0XHRcdFx0XHRhTGlua0l0ZW1zW2luZGV4XSxcblx0XHRcdFx0XHRvU2hlbGxTZXJ2aWNlcyxcblx0XHRcdFx0XHRvUGF5bG9hZCxcblx0XHRcdFx0XHRvUGFyYW1zLFxuXHRcdFx0XHRcdGFwcFN0YXRlS2V5LFxuXHRcdFx0XHRcdG9TZWxlY3Rpb25WYXJpYW50LFxuXHRcdFx0XHRcdG9OYXZpZ2F0aW9uU2VydmljZVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAodGl0bGVMaW5rdG9CZVJlbW92ZSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRcdGFMaW5rSXRlbXNbaW5kZXhdID0gdW5kZWZpbmVkO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gU2ltcGxlTGlua0RlbGVnYXRlLl9yZW1vdmVFbXB0eUxpbmtJdGVtKGFMaW5rSXRlbXMpO1xuXHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBnZXR0aW5nIHRoZSBuYXZpZ2F0aW9uIHNlcnZpY2VcIiwgb0Vycm9yKTtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBhTGlua0l0ZW1zO1xuXHR9XG59O1xuU2ltcGxlTGlua0RlbGVnYXRlLmJlZm9yZU5hdmlnYXRpb25DYWxsYmFjayA9IGZ1bmN0aW9uIChvUGF5bG9hZDogYW55LCBvRXZlbnQ6IGFueSkge1xuXHRjb25zdCBvU291cmNlID0gb0V2ZW50LmdldFNvdXJjZSgpLFxuXHRcdHNIcmVmID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImhyZWZcIiksXG5cdFx0b1VSTFBhcnNpbmcgPSBGYWN0b3J5LmdldFNlcnZpY2UoXCJVUkxQYXJzaW5nXCIpLFxuXHRcdG9IYXNoID0gc0hyZWYgJiYgb1VSTFBhcnNpbmcucGFyc2VTaGVsbEhhc2goc0hyZWYpO1xuXG5cdEtlZXBBbGl2ZUhlbHBlci5zdG9yZUNvbnRyb2xSZWZyZXNoU3RyYXRlZ3lGb3JIYXNoKG9Tb3VyY2UsIG9IYXNoKTtcblxuXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xufTtcblNpbXBsZUxpbmtEZWxlZ2F0ZS5fcmVtb3ZlVGVjaG5pY2FsUGFyYW1ldGVycyA9IGZ1bmN0aW9uIChvU2VsZWN0aW9uVmFyaWFudDogYW55KSB7XG5cdG9TZWxlY3Rpb25WYXJpYW50LnJlbW92ZVNlbGVjdE9wdGlvbihcIkBvZGF0YS5jb250ZXh0XCIpO1xuXHRvU2VsZWN0aW9uVmFyaWFudC5yZW1vdmVTZWxlY3RPcHRpb24oXCJAb2RhdGEubWV0YWRhdGFFdGFnXCIpO1xuXHRvU2VsZWN0aW9uVmFyaWFudC5yZW1vdmVTZWxlY3RPcHRpb24oXCJTQVBfX01lc3NhZ2VzXCIpO1xufTtcblxuU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRTZW1hbnRpY09iamVjdEN1c3RvbURhdGFWYWx1ZSA9IGZ1bmN0aW9uIChhTGlua0N1c3RvbURhdGE6IGFueSwgb1NlbWFudGljT2JqZWN0c1Jlc29sdmVkOiBhbnkpOiB2b2lkIHtcblx0bGV0IHNQcm9wZXJ0eU5hbWU6IHN0cmluZywgc0N1c3RvbURhdGFWYWx1ZTogc3RyaW5nO1xuXHRmb3IgKGxldCBpQ3VzdG9tRGF0YUNvdW50ID0gMDsgaUN1c3RvbURhdGFDb3VudCA8IGFMaW5rQ3VzdG9tRGF0YS5sZW5ndGg7IGlDdXN0b21EYXRhQ291bnQrKykge1xuXHRcdHNQcm9wZXJ0eU5hbWUgPSBhTGlua0N1c3RvbURhdGFbaUN1c3RvbURhdGFDb3VudF0uZ2V0S2V5KCk7XG5cdFx0c0N1c3RvbURhdGFWYWx1ZSA9IGFMaW5rQ3VzdG9tRGF0YVtpQ3VzdG9tRGF0YUNvdW50XS5nZXRWYWx1ZSgpO1xuXHRcdG9TZW1hbnRpY09iamVjdHNSZXNvbHZlZFtzUHJvcGVydHlOYW1lXSA9IHsgdmFsdWU6IHNDdXN0b21EYXRhVmFsdWUgfTtcblx0fVxufTtcblxuLyoqXG4gKiBDaGVjayB0aGUgc2VtYW50aWMgb2JqZWN0IG5hbWUgaWYgaXQgaXMgZHluYW1pYyBvciBub3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBwYXRoT3JWYWx1ZSBUaGUgc2VtYW50aWMgb2JqZWN0IHBhdGggb3IgbmFtZVxuICogQHJldHVybnMgVHJ1ZSBpZiBzZW1hbnRpYyBvYmplY3QgaXMgZHluYW1pY1xuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUuX2lzRHluYW1pY1BhdGggPSBmdW5jdGlvbiAocGF0aE9yVmFsdWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuXHRpZiAocGF0aE9yVmFsdWUgJiYgcGF0aE9yVmFsdWUuaW5kZXhPZihcIntcIikgPT09IDAgJiYgcGF0aE9yVmFsdWUuaW5kZXhPZihcIn1cIikgPT09IHBhdGhPclZhbHVlLmxlbmd0aCAtIDEpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn07XG5cbi8qKlxuICogVXBkYXRlIHRoZSBwYXlsb2FkIHdpdGggc2VtYW50aWMgb2JqZWN0IHZhbHVlcyBmcm9tIGN1c3RvbSBkYXRhIG9mIExpbmsuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBwYXlsb2FkIFRoZSBwYXlsb2FkIG9mIHRoZSBtZGMgbGluay5cbiAqIEBwYXJhbSBuZXdQYXlsb2FkIFRoZSBuZXcgdXBkYXRlZCBwYXlsb2FkLlxuICogQHBhcmFtIHNlbWFudGljT2JqZWN0TmFtZSBUaGUgc2VtYW50aWMgb2JqZWN0IG5hbWUgcmVzb2x2ZWQuXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fdXBkYXRlUGF5bG9hZFdpdGhSZXNvbHZlZFNlbWFudGljT2JqZWN0VmFsdWUgPSBmdW5jdGlvbiAoXG5cdHBheWxvYWQ6IFJlZ2lzdGVyZWRQYXlsb2FkLFxuXHRuZXdQYXlsb2FkOiBSZWdpc3RlcmVkUGF5bG9hZCxcblx0c2VtYW50aWNPYmplY3ROYW1lOiBzdHJpbmdcbik6IHZvaWQge1xuXHRpZiAoU2ltcGxlTGlua0RlbGVnYXRlLl9pc0R5bmFtaWNQYXRoKHBheWxvYWQubWFpblNlbWFudGljT2JqZWN0KSkge1xuXHRcdGlmIChzZW1hbnRpY09iamVjdE5hbWUpIHtcblx0XHRcdG5ld1BheWxvYWQubWFpblNlbWFudGljT2JqZWN0ID0gc2VtYW50aWNPYmplY3ROYW1lO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBubyB2YWx1ZSBmcm9tIEN1c3RvbSBEYXRhLCBzbyByZW1vdmluZyBtYWluU2VtYW50aWNPYmplY3Rcblx0XHRcdG5ld1BheWxvYWQubWFpblNlbWFudGljT2JqZWN0ID0gdW5kZWZpbmVkO1xuXHRcdH1cblx0fVxuXHRzd2l0Y2ggKHR5cGVvZiBzZW1hbnRpY09iamVjdE5hbWUpIHtcblx0XHRjYXNlIFwic3RyaW5nXCI6XG5cdFx0XHRuZXdQYXlsb2FkLnNlbWFudGljT2JqZWN0c1Jlc29sdmVkPy5wdXNoKHNlbWFudGljT2JqZWN0TmFtZSk7XG5cdFx0XHRuZXdQYXlsb2FkLnNlbWFudGljT2JqZWN0cy5wdXNoKHNlbWFudGljT2JqZWN0TmFtZSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwib2JqZWN0XCI6XG5cdFx0XHRmb3IgKGNvbnN0IGogaW4gc2VtYW50aWNPYmplY3ROYW1lIGFzIHN0cmluZ1tdKSB7XG5cdFx0XHRcdG5ld1BheWxvYWQuc2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ/LnB1c2goc2VtYW50aWNPYmplY3ROYW1lW2pdKTtcblx0XHRcdFx0bmV3UGF5bG9hZC5zZW1hbnRpY09iamVjdHMucHVzaChzZW1hbnRpY09iamVjdE5hbWVbal0pO1xuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0fVxufTtcblxuU2ltcGxlTGlua0RlbGVnYXRlLl9jcmVhdGVOZXdQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZCA9IGZ1bmN0aW9uIChcblx0cGF5bG9hZDogUmVnaXN0ZXJlZFBheWxvYWQsXG5cdHNlbWFudGljT2JqZWN0c1Jlc29sdmVkOiBhbnksXG5cdG5ld1BheWxvYWQ6IFJlZ2lzdGVyZWRQYXlsb2FkXG4pOiB2b2lkIHtcblx0bGV0IHNlbWFudGljT2JqZWN0TmFtZTogc3RyaW5nLCB0bXBQcm9wZXJ0eU5hbWU6IHN0cmluZztcblx0Zm9yIChjb25zdCBpIGluIHBheWxvYWQuc2VtYW50aWNPYmplY3RzKSB7XG5cdFx0c2VtYW50aWNPYmplY3ROYW1lID0gcGF5bG9hZC5zZW1hbnRpY09iamVjdHNbaV07XG5cdFx0aWYgKFNpbXBsZUxpbmtEZWxlZ2F0ZS5faXNEeW5hbWljUGF0aChzZW1hbnRpY09iamVjdE5hbWUpKSB7XG5cdFx0XHR0bXBQcm9wZXJ0eU5hbWUgPSBzZW1hbnRpY09iamVjdE5hbWUuc3Vic3RyKDEsIHNlbWFudGljT2JqZWN0TmFtZS5pbmRleE9mKFwifVwiKSAtIDEpO1xuXHRcdFx0c2VtYW50aWNPYmplY3ROYW1lID0gc2VtYW50aWNPYmplY3RzUmVzb2x2ZWRbdG1wUHJvcGVydHlOYW1lXS52YWx1ZTtcblx0XHRcdFNpbXBsZUxpbmtEZWxlZ2F0ZS5fdXBkYXRlUGF5bG9hZFdpdGhSZXNvbHZlZFNlbWFudGljT2JqZWN0VmFsdWUocGF5bG9hZCwgbmV3UGF5bG9hZCwgc2VtYW50aWNPYmplY3ROYW1lKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bmV3UGF5bG9hZC5zZW1hbnRpY09iamVjdHMucHVzaChzZW1hbnRpY09iamVjdE5hbWUpO1xuXHRcdH1cblx0fVxufTtcblxuLyoqXG4gKiBVcGRhdGUgdGhlIHNlbWFudGljIG9iamVjdCBuYW1lIGZyb20gdGhlIHJlc29sdmVkIHZhbHVlIGZvciB0aGUgbWFwcGluZ3MgYXR0cmlidXRlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIG1kY1BheWxvYWQgVGhlIHBheWxvYWQgZ2l2ZW4gYnkgdGhlIGFwcGxpY2F0aW9uLlxuICogQHBhcmFtIG1kY1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkIFRoZSBwYXlsb2FkIHdpdGggdGhlIHJlc29sdmVkIHZhbHVlIGZvciB0aGUgc2VtYW50aWMgb2JqZWN0IG5hbWUuXG4gKiBAcGFyYW0gbmV3UGF5bG9hZCBUaGUgbmV3IHVwZGF0ZWQgcGF5bG9hZC5cbiAqL1xuU2ltcGxlTGlua0RlbGVnYXRlLl91cGRhdGVTZW1hbnRpY09iamVjdHNGb3JNYXBwaW5ncyA9IGZ1bmN0aW9uIChcblx0bWRjUGF5bG9hZDogUmVnaXN0ZXJlZFBheWxvYWQsXG5cdG1kY1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkOiBSZWdpc3RlcmVkUGF5bG9hZCxcblx0bmV3UGF5bG9hZDogUmVnaXN0ZXJlZFBheWxvYWRcbik6IHZvaWQge1xuXHQvLyB1cGRhdGUgdGhlIHNlbWFudGljIG9iamVjdCBuYW1lIGZyb20gdGhlIHJlc29sdmVkIG9uZXMgaW4gdGhlIHNlbWFudGljIG9iamVjdCBtYXBwaW5ncy5cblx0bWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQuc2VtYW50aWNPYmplY3RNYXBwaW5ncy5mb3JFYWNoKGZ1bmN0aW9uIChcblx0XHRzZW1hbnRpY09iamVjdE1hcHBpbmc6IFJlZ2lzdGVyZWRTZW1hbnRpY09iamVjdE1hcHBpbmdcblx0KSB7XG5cdFx0aWYgKHNlbWFudGljT2JqZWN0TWFwcGluZy5zZW1hbnRpY09iamVjdCAmJiBTaW1wbGVMaW5rRGVsZWdhdGUuX2lzRHluYW1pY1BhdGgoc2VtYW50aWNPYmplY3RNYXBwaW5nLnNlbWFudGljT2JqZWN0KSkge1xuXHRcdFx0c2VtYW50aWNPYmplY3RNYXBwaW5nLnNlbWFudGljT2JqZWN0ID1cblx0XHRcdFx0bmV3UGF5bG9hZC5zZW1hbnRpY09iamVjdHNbbWRjUGF5bG9hZC5zZW1hbnRpY09iamVjdHMuaW5kZXhPZihzZW1hbnRpY09iamVjdE1hcHBpbmcuc2VtYW50aWNPYmplY3QpXTtcblx0XHR9XG5cdH0pO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgdGhlIHNlbWFudGljIG9iamVjdCBuYW1lIGZyb20gdGhlIHJlc29sdmVkIHZhbHVlIGZvciB0aGUgdW5hdmFpbGFibGUgYWN0aW9ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIG1kY1BheWxvYWQgVGhlIHBheWxvYWQgZ2l2ZW4gYnkgdGhlIGFwcGxpY2F0aW9uLlxuICogQHBhcmFtIG1kY1BheWxvYWRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyBUaGUgdW5hdmFpbGFibGUgYWN0aW9ucyBnaXZlbiBieSB0aGUgYXBwbGljYXRpb24uXG4gKiBAcGFyYW0gbWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQgVGhlIHVwZGF0ZWQgcGF5bG9hZCB3aXRoIHRoZSByZXNvbHZlZCB2YWx1ZSBmb3IgdGhlIHNlbWFudGljIG9iamVjdCBuYW1lIGZvciB0aGUgdW5hdmFpbGFibGUgYWN0aW9ucy5cbiAqL1xuU2ltcGxlTGlua0RlbGVnYXRlLl91cGRhdGVTZW1hbnRpY09iamVjdHNVbmF2YWlsYWJsZUFjdGlvbnMgPSBmdW5jdGlvbiAoXG5cdG1kY1BheWxvYWQ6IFJlZ2lzdGVyZWRQYXlsb2FkLFxuXHRtZGNQYXlsb2FkU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnM6IFJlZ2lzdGVyZWRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyxcblx0bWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ6IFJlZ2lzdGVyZWRQYXlsb2FkXG4pOiB2b2lkIHtcblx0bGV0IF9JbmRleDogYW55O1xuXHRtZGNQYXlsb2FkU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoc2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbjogYW55KSB7XG5cdFx0Ly8gRHluYW1pYyBTZW1hbnRpY09iamVjdCBoYXMgYW4gdW5hdmFpbGFibGUgYWN0aW9uXG5cdFx0aWYgKFxuXHRcdFx0c2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbj8uc2VtYW50aWNPYmplY3QgJiZcblx0XHRcdFNpbXBsZUxpbmtEZWxlZ2F0ZS5faXNEeW5hbWljUGF0aChzZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uLnNlbWFudGljT2JqZWN0KVxuXHRcdCkge1xuXHRcdFx0X0luZGV4ID0gbWRjUGF5bG9hZC5zZW1hbnRpY09iamVjdHMuZmluZEluZGV4KGZ1bmN0aW9uIChzZW1hbnRpY09iamVjdDogc3RyaW5nKSB7XG5cdFx0XHRcdHJldHVybiBzZW1hbnRpY09iamVjdCA9PT0gc2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbi5zZW1hbnRpY09iamVjdDtcblx0XHRcdH0pO1xuXHRcdFx0aWYgKF9JbmRleCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdC8vIEdldCB0aGUgU2VtYW50aWNPYmplY3QgbmFtZSByZXNvbHZlZCB0byBhIHZhbHVlXG5cdFx0XHRcdHNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb24uc2VtYW50aWNPYmplY3QgPSBtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5zZW1hbnRpY09iamVjdHNbX0luZGV4XTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgdGhlIHNlbWFudGljIG9iamVjdCBuYW1lIGZyb20gdGhlIHJlc29sdmVkIHZhbHVlIGZvciB0aGUgdW5hdmFpbGFibGUgYWN0aW9ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIG1kY1BheWxvYWQgVGhlIHVwZGF0ZWQgcGF5bG9hZCB3aXRoIHRoZSBpbmZvcm1hdGlvbiBmcm9tIGN1c3RvbSBkYXRhIHByb3ZpZGVkIGluIHRoZSBsaW5rLlxuICogQHBhcmFtIG1kY1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkIFRoZSBwYXlsb2FkIHVwZGF0ZWQgd2l0aCByZXNvbHZlZCBzZW1hbnRpYyBvYmplY3RzIG5hbWVzLlxuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUuX3VwZGF0ZVNlbWFudGljT2JqZWN0c1dpdGhSZXNvbHZlZFZhbHVlID0gZnVuY3Rpb24gKFxuXHRtZGNQYXlsb2FkOiBSZWdpc3RlcmVkUGF5bG9hZCxcblx0bWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ6IFJlZ2lzdGVyZWRQYXlsb2FkXG4pOiB2b2lkIHtcblx0Zm9yIChsZXQgbmV3U2VtYW50aWNPYmplY3RzQ291bnQgPSAwOyBuZXdTZW1hbnRpY09iamVjdHNDb3VudCA8IG1kY1BheWxvYWQuc2VtYW50aWNPYmplY3RzLmxlbmd0aDsgbmV3U2VtYW50aWNPYmplY3RzQ291bnQrKykge1xuXHRcdGlmIChcblx0XHRcdG1kY1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkLm1haW5TZW1hbnRpY09iamVjdCA9PT1cblx0XHRcdChtZGNQYXlsb2FkLnNlbWFudGljT2JqZWN0c1Jlc29sdmVkICYmIG1kY1BheWxvYWQuc2VtYW50aWNPYmplY3RzUmVzb2x2ZWRbbmV3U2VtYW50aWNPYmplY3RzQ291bnRdKVxuXHRcdCkge1xuXHRcdFx0bWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQubWFpblNlbWFudGljT2JqZWN0ID0gbWRjUGF5bG9hZC5zZW1hbnRpY09iamVjdHNbbmV3U2VtYW50aWNPYmplY3RzQ291bnRdO1xuXHRcdH1cblx0XHRpZiAobWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQuc2VtYW50aWNPYmplY3RzW25ld1NlbWFudGljT2JqZWN0c0NvdW50XSkge1xuXHRcdFx0bWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQuc2VtYW50aWNPYmplY3RzW25ld1NlbWFudGljT2JqZWN0c0NvdW50XSA9XG5cdFx0XHRcdG1kY1BheWxvYWQuc2VtYW50aWNPYmplY3RzW25ld1NlbWFudGljT2JqZWN0c0NvdW50XTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gbm8gQ3VzdG9tIERhdGEgdmFsdWUgZm9yIGEgU2VtYW50aWMgT2JqZWN0IG5hbWUgd2l0aCBwYXRoXG5cdFx0XHRtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5zZW1hbnRpY09iamVjdHMuc3BsaWNlKG5ld1NlbWFudGljT2JqZWN0c0NvdW50LCAxKTtcblx0XHR9XG5cdH1cbn07XG5cbi8qKlxuICogUmVtb3ZlIGVtcHR5IHNlbWFudGljIG9iamVjdCBtYXBwaW5ncyBhbmQgaWYgdGhlcmUgaXMgbm8gc2VtYW50aWMgb2JqZWN0IG5hbWUsIGxpbmsgdG8gaXQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZCBUaGUgcGF5bG9hZCB1c2VkIHRvIGNoZWNrIHRoZSBtYXBwaW5ncyBvZiB0aGUgc2VtYW50aWMgb2JqZWN0cy5cbiAqL1xuU2ltcGxlTGlua0RlbGVnYXRlLl9yZW1vdmVFbXB0eVNlbWFudGljT2JqZWN0c01hcHBpbmdzID0gZnVuY3Rpb24gKG1kY1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkOiBSZWdpc3RlcmVkUGF5bG9hZCk6IHZvaWQge1xuXHQvLyByZW1vdmUgdW5kZWZpbmVkIFNlbWFudGljIE9iamVjdCBNYXBwaW5nXG5cdGZvciAoXG5cdFx0bGV0IG1hcHBpbmdzQ291bnQgPSAwO1xuXHRcdG1hcHBpbmdzQ291bnQgPCBtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5zZW1hbnRpY09iamVjdE1hcHBpbmdzLmxlbmd0aDtcblx0XHRtYXBwaW5nc0NvdW50Kytcblx0KSB7XG5cdFx0aWYgKFxuXHRcdFx0bWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQuc2VtYW50aWNPYmplY3RNYXBwaW5nc1ttYXBwaW5nc0NvdW50XSAmJlxuXHRcdFx0bWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQuc2VtYW50aWNPYmplY3RNYXBwaW5nc1ttYXBwaW5nc0NvdW50XS5zZW1hbnRpY09iamVjdCA9PT0gdW5kZWZpbmVkXG5cdFx0KSB7XG5cdFx0XHRtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5zZW1hbnRpY09iamVjdE1hcHBpbmdzLnNwbGljZShtYXBwaW5nc0NvdW50LCAxKTtcblx0XHR9XG5cdH1cbn07XG5cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fc2V0UGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQgPSBmdW5jdGlvbiAoXG5cdHBheWxvYWQ6IGFueSxcblx0bmV3UGF5bG9hZDogUmVnaXN0ZXJlZFBheWxvYWRcbik6IFJlZ2lzdGVyZWRQYXlsb2FkIHtcblx0bGV0IG9QYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZDogUmVnaXN0ZXJlZFBheWxvYWQ7XG5cdGlmIChuZXdQYXlsb2FkLnNlbWFudGljT2JqZWN0c1Jlc29sdmVkICYmIG5ld1BheWxvYWQuc2VtYW50aWNPYmplY3RzUmVzb2x2ZWQubGVuZ3RoID4gMCkge1xuXHRcdG9QYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZCA9IHtcblx0XHRcdGVudGl0eVR5cGU6IHBheWxvYWQuZW50aXR5VHlwZSxcblx0XHRcdGRhdGFGaWVsZDogcGF5bG9hZC5kYXRhRmllbGQsXG5cdFx0XHRjb250YWN0OiBwYXlsb2FkLmNvbnRhY3QsXG5cdFx0XHRtYWluU2VtYW50aWNPYmplY3Q6IHBheWxvYWQubWFpblNlbWFudGljT2JqZWN0LFxuXHRcdFx0bmF2aWdhdGlvblBhdGg6IHBheWxvYWQubmF2aWdhdGlvblBhdGgsXG5cdFx0XHRwcm9wZXJ0eVBhdGhMYWJlbDogcGF5bG9hZC5wcm9wZXJ0eVBhdGhMYWJlbCxcblx0XHRcdHNlbWFudGljT2JqZWN0TWFwcGluZ3M6IGRlZXBDbG9uZShwYXlsb2FkLnNlbWFudGljT2JqZWN0TWFwcGluZ3MpLFxuXHRcdFx0c2VtYW50aWNPYmplY3RzOiBuZXdQYXlsb2FkLnNlbWFudGljT2JqZWN0c1xuXHRcdH07XG5cdFx0U2ltcGxlTGlua0RlbGVnYXRlLl91cGRhdGVTZW1hbnRpY09iamVjdHNGb3JNYXBwaW5ncyhwYXlsb2FkLCBvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQsIG5ld1BheWxvYWQpO1xuXHRcdGNvbnN0IF9TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uczogUmVnaXN0ZXJlZFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zID0gZGVlcENsb25lKFxuXHRcdFx0cGF5bG9hZC5zZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc1xuXHRcdCk7XG5cdFx0U2ltcGxlTGlua0RlbGVnYXRlLl91cGRhdGVTZW1hbnRpY09iamVjdHNVbmF2YWlsYWJsZUFjdGlvbnMoXG5cdFx0XHRwYXlsb2FkLFxuXHRcdFx0X1NlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zLFxuXHRcdFx0b1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkXG5cdFx0KTtcblx0XHRvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQuc2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgPSBfU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnM7XG5cdFx0aWYgKG5ld1BheWxvYWQubWFpblNlbWFudGljT2JqZWN0KSB7XG5cdFx0XHRvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQubWFpblNlbWFudGljT2JqZWN0ID0gbmV3UGF5bG9hZC5tYWluU2VtYW50aWNPYmplY3Q7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9QYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5tYWluU2VtYW50aWNPYmplY3QgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdFNpbXBsZUxpbmtEZWxlZ2F0ZS5fdXBkYXRlU2VtYW50aWNPYmplY3RzV2l0aFJlc29sdmVkVmFsdWUobmV3UGF5bG9hZCwgb1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkKTtcblx0XHRTaW1wbGVMaW5rRGVsZWdhdGUuX3JlbW92ZUVtcHR5U2VtYW50aWNPYmplY3RzTWFwcGluZ3Mob1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkKTtcblx0XHRyZXR1cm4gb1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB7fSBhcyBhbnk7XG5cdH1cbn07XG5cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0UGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQgPSBmdW5jdGlvbiAocGF5bG9hZDogYW55LCBsaW5rQ3VzdG9tRGF0YTogYW55KTogYW55IHtcblx0bGV0IG9QYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZDogYW55O1xuXHRjb25zdCBvU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ6IGFueSA9IHt9O1xuXHRjb25zdCBuZXdQYXlsb2FkOiBSZWdpc3RlcmVkUGF5bG9hZCA9IHsgc2VtYW50aWNPYmplY3RzOiBbXSwgc2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ6IFtdLCBzZW1hbnRpY09iamVjdE1hcHBpbmdzOiBbXSB9O1xuXHRpZiAocGF5bG9hZC5zZW1hbnRpY09iamVjdHMpIHtcblx0XHQvLyBzYXAubS5MaW5rIGhhcyBjdXN0b20gZGF0YSB3aXRoIFNlbWFudGljIE9iamVjdHMgbmFtZXMgcmVzb2x2ZWRcblx0XHRpZiAobGlua0N1c3RvbURhdGEgJiYgbGlua0N1c3RvbURhdGEubGVuZ3RoID4gMCkge1xuXHRcdFx0U2ltcGxlTGlua0RlbGVnYXRlLl9nZXRTZW1hbnRpY09iamVjdEN1c3RvbURhdGFWYWx1ZShsaW5rQ3VzdG9tRGF0YSwgb1NlbWFudGljT2JqZWN0c1Jlc29sdmVkKTtcblx0XHRcdFNpbXBsZUxpbmtEZWxlZ2F0ZS5fY3JlYXRlTmV3UGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQocGF5bG9hZCwgb1NlbWFudGljT2JqZWN0c1Jlc29sdmVkLCBuZXdQYXlsb2FkKTtcblx0XHRcdG9QYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZCA9IFNpbXBsZUxpbmtEZWxlZ2F0ZS5fc2V0UGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQoXG5cdFx0XHRcdHBheWxvYWQsXG5cdFx0XHRcdG5ld1BheWxvYWRcblx0XHRcdCk7XG5cdFx0XHRyZXR1cm4gb1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG59O1xuXG5TaW1wbGVMaW5rRGVsZWdhdGUuX3VwZGF0ZVBheWxvYWRXaXRoU2VtYW50aWNBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKFxuXHRhU2VtYW50aWNPYmplY3RzOiBhbnksXG5cdG9JbmZvTG9nOiBhbnksXG5cdG9Db250ZXh0T2JqZWN0OiBhbnksXG5cdG9SZXN1bHRzOiBhbnksXG5cdG1TZW1hbnRpY09iamVjdE1hcHBpbmdzOiBhbnlcbik6IHZvaWQge1xuXHRhU2VtYW50aWNPYmplY3RzLmZvckVhY2goZnVuY3Rpb24gKHNTZW1hbnRpY09iamVjdDogYW55KSB7XG5cdFx0aWYgKG9JbmZvTG9nKSB7XG5cdFx0XHRvSW5mb0xvZy5hZGRDb250ZXh0T2JqZWN0KHNTZW1hbnRpY09iamVjdCwgb0NvbnRleHRPYmplY3QpO1xuXHRcdH1cblx0XHRvUmVzdWx0c1tzU2VtYW50aWNPYmplY3RdID0ge307XG5cdFx0Zm9yIChjb25zdCBzQXR0cmlidXRlTmFtZSBpbiBvQ29udGV4dE9iamVjdCkge1xuXHRcdFx0bGV0IG9BdHRyaWJ1dGUgPSBudWxsLFxuXHRcdFx0XHRvVHJhbnNmb3JtYXRpb25BZGRpdGlvbmFsID0gbnVsbDtcblx0XHRcdGlmIChvSW5mb0xvZykge1xuXHRcdFx0XHRvQXR0cmlidXRlID0gb0luZm9Mb2cuZ2V0U2VtYW50aWNPYmplY3RBdHRyaWJ1dGUoc1NlbWFudGljT2JqZWN0LCBzQXR0cmlidXRlTmFtZSk7XG5cdFx0XHRcdGlmICghb0F0dHJpYnV0ZSkge1xuXHRcdFx0XHRcdG9BdHRyaWJ1dGUgPSBvSW5mb0xvZy5jcmVhdGVBdHRyaWJ1dGVTdHJ1Y3R1cmUoKTtcblx0XHRcdFx0XHRvSW5mb0xvZy5hZGRTZW1hbnRpY09iamVjdEF0dHJpYnV0ZShzU2VtYW50aWNPYmplY3QsIHNBdHRyaWJ1dGVOYW1lLCBvQXR0cmlidXRlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gSWdub3JlIHVuZGVmaW5lZCBhbmQgbnVsbCB2YWx1ZXNcblx0XHRcdGlmIChvQ29udGV4dE9iamVjdFtzQXR0cmlidXRlTmFtZV0gPT09IHVuZGVmaW5lZCB8fCBvQ29udGV4dE9iamVjdFtzQXR0cmlidXRlTmFtZV0gPT09IG51bGwpIHtcblx0XHRcdFx0aWYgKG9BdHRyaWJ1dGUpIHtcblx0XHRcdFx0XHRvQXR0cmlidXRlLnRyYW5zZm9ybWF0aW9ucy5wdXNoKHtcblx0XHRcdFx0XHRcdHZhbHVlOiB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRkZXNjcmlwdGlvbjogXCJcXHUyMTM5IFVuZGVmaW5lZCBhbmQgbnVsbCB2YWx1ZXMgaGF2ZSBiZWVuIHJlbW92ZWQgaW4gU2ltcGxlTGlua0RlbGVnYXRlLlwiXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHQvLyBJZ25vcmUgcGxhaW4gb2JqZWN0cyAoQkNQIDE3NzA0OTY2MzkpXG5cdFx0XHRpZiAoaXNQbGFpbk9iamVjdChvQ29udGV4dE9iamVjdFtzQXR0cmlidXRlTmFtZV0pKSB7XG5cdFx0XHRcdGlmIChtU2VtYW50aWNPYmplY3RNYXBwaW5ncyAmJiBtU2VtYW50aWNPYmplY3RNYXBwaW5nc1tzU2VtYW50aWNPYmplY3RdKSB7XG5cdFx0XHRcdFx0Y29uc3QgYUtleXMgPSBPYmplY3Qua2V5cyhtU2VtYW50aWNPYmplY3RNYXBwaW5nc1tzU2VtYW50aWNPYmplY3RdKTtcblx0XHRcdFx0XHRsZXQgc05ld0F0dHJpYnV0ZU5hbWVNYXBwZWQsIHNOZXdBdHRyaWJ1dGVOYW1lLCBzVmFsdWUsIHNLZXk7XG5cdFx0XHRcdFx0Zm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGFLZXlzLmxlbmd0aDsgaW5kZXgrKykge1xuXHRcdFx0XHRcdFx0c0tleSA9IGFLZXlzW2luZGV4XTtcblx0XHRcdFx0XHRcdGlmIChzS2V5LmluZGV4T2Yoc0F0dHJpYnV0ZU5hbWUpID09PSAwKSB7XG5cdFx0XHRcdFx0XHRcdHNOZXdBdHRyaWJ1dGVOYW1lTWFwcGVkID0gbVNlbWFudGljT2JqZWN0TWFwcGluZ3Nbc1NlbWFudGljT2JqZWN0XVtzS2V5XTtcblx0XHRcdFx0XHRcdFx0c05ld0F0dHJpYnV0ZU5hbWUgPSBzS2V5LnNwbGl0KFwiL1wiKVtzS2V5LnNwbGl0KFwiL1wiKS5sZW5ndGggLSAxXTtcblx0XHRcdFx0XHRcdFx0c1ZhbHVlID0gb0NvbnRleHRPYmplY3Rbc0F0dHJpYnV0ZU5hbWVdW3NOZXdBdHRyaWJ1dGVOYW1lXTtcblx0XHRcdFx0XHRcdFx0aWYgKHNOZXdBdHRyaWJ1dGVOYW1lTWFwcGVkICYmIHNOZXdBdHRyaWJ1dGVOYW1lICYmIHNWYWx1ZSkge1xuXHRcdFx0XHRcdFx0XHRcdG9SZXN1bHRzW3NTZW1hbnRpY09iamVjdF1bc05ld0F0dHJpYnV0ZU5hbWVNYXBwZWRdID0gc1ZhbHVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChvQXR0cmlidXRlKSB7XG5cdFx0XHRcdFx0b0F0dHJpYnV0ZS50cmFuc2Zvcm1hdGlvbnMucHVzaCh7XG5cdFx0XHRcdFx0XHR2YWx1ZTogdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0ZGVzY3JpcHRpb246IFwiXFx1MjEzOSBQbGFpbiBvYmplY3RzIGhhcyBiZWVuIHJlbW92ZWQgaW4gU2ltcGxlTGlua0RlbGVnYXRlLlwiXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdC8vIE1hcCB0aGUgYXR0cmlidXRlIG5hbWUgb25seSBpZiAnc2VtYW50aWNPYmplY3RNYXBwaW5nJyBpcyBkZWZpbmVkLlxuXHRcdFx0Ly8gTm90ZTogdW5kZXIgZGVmaW5lZCAnc2VtYW50aWNPYmplY3RNYXBwaW5nJyB3ZSBhbHNvIG1lYW4gYW4gZW1wdHkgYW5ub3RhdGlvbiBvciBhbiBhbm5vdGF0aW9uIHdpdGggZW1wdHkgcmVjb3JkXG5cdFx0XHRjb25zdCBzQXR0cmlidXRlTmFtZU1hcHBlZCA9XG5cdFx0XHRcdG1TZW1hbnRpY09iamVjdE1hcHBpbmdzICYmXG5cdFx0XHRcdG1TZW1hbnRpY09iamVjdE1hcHBpbmdzW3NTZW1hbnRpY09iamVjdF0gJiZcblx0XHRcdFx0bVNlbWFudGljT2JqZWN0TWFwcGluZ3Nbc1NlbWFudGljT2JqZWN0XVtzQXR0cmlidXRlTmFtZV1cblx0XHRcdFx0XHQ/IG1TZW1hbnRpY09iamVjdE1hcHBpbmdzW3NTZW1hbnRpY09iamVjdF1bc0F0dHJpYnV0ZU5hbWVdXG5cdFx0XHRcdFx0OiBzQXR0cmlidXRlTmFtZTtcblxuXHRcdFx0aWYgKG9BdHRyaWJ1dGUgJiYgc0F0dHJpYnV0ZU5hbWUgIT09IHNBdHRyaWJ1dGVOYW1lTWFwcGVkKSB7XG5cdFx0XHRcdG9UcmFuc2Zvcm1hdGlvbkFkZGl0aW9uYWwgPSB7XG5cdFx0XHRcdFx0dmFsdWU6IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRkZXNjcmlwdGlvbjogYFxcdTIxMzkgVGhlIGF0dHJpYnV0ZSAke3NBdHRyaWJ1dGVOYW1lfSBoYXMgYmVlbiByZW5hbWVkIHRvICR7c0F0dHJpYnV0ZU5hbWVNYXBwZWR9IGluIFNpbXBsZUxpbmtEZWxlZ2F0ZS5gLFxuXHRcdFx0XHRcdHJlYXNvbjogYFxcdWQ4M2RcXHVkZDM0IEEgY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljT2JqZWN0TWFwcGluZyBhbm5vdGF0aW9uIGlzIGRlZmluZWQgZm9yIHNlbWFudGljIG9iamVjdCAke3NTZW1hbnRpY09iamVjdH0gd2l0aCBzb3VyY2UgYXR0cmlidXRlICR7c0F0dHJpYnV0ZU5hbWV9IGFuZCB0YXJnZXQgYXR0cmlidXRlICR7c0F0dHJpYnV0ZU5hbWVNYXBwZWR9LiBZb3UgY2FuIG1vZGlmeSB0aGUgYW5ub3RhdGlvbiBpZiB0aGUgbWFwcGluZyByZXN1bHQgaXMgbm90IHdoYXQgeW91IGV4cGVjdGVkLmBcblx0XHRcdFx0fTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gSWYgbW9yZSB0aGVuIG9uZSBsb2NhbCBwcm9wZXJ0eSBtYXBzIHRvIHRoZSBzYW1lIHRhcmdldCBwcm9wZXJ0eSAoY2xhc2ggc2l0dWF0aW9uKVxuXHRcdFx0Ly8gd2UgdGFrZSB0aGUgdmFsdWUgb2YgdGhlIGxhc3QgcHJvcGVydHkgYW5kIHdyaXRlIGFuIGVycm9yIGxvZ1xuXHRcdFx0aWYgKG9SZXN1bHRzW3NTZW1hbnRpY09iamVjdF1bc0F0dHJpYnV0ZU5hbWVNYXBwZWRdKSB7XG5cdFx0XHRcdExvZy5lcnJvcihcblx0XHRcdFx0XHRgU2ltcGxlTGlua0RlbGVnYXRlOiBUaGUgYXR0cmlidXRlICR7c0F0dHJpYnV0ZU5hbWV9IGNhbiBub3QgYmUgcmVuYW1lZCB0byB0aGUgYXR0cmlidXRlICR7c0F0dHJpYnV0ZU5hbWVNYXBwZWR9IGR1ZSB0byBhIGNsYXNoIHNpdHVhdGlvbi4gVGhpcyBjYW4gbGVhZCB0byB3cm9uZyBuYXZpZ2F0aW9uIGxhdGVyIG9uLmBcblx0XHRcdFx0KTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQ29weSB0aGUgdmFsdWUgcmVwbGFjaW5nIHRoZSBhdHRyaWJ1dGUgbmFtZSBieSBzZW1hbnRpYyBvYmplY3QgbmFtZVxuXHRcdFx0b1Jlc3VsdHNbc1NlbWFudGljT2JqZWN0XVtzQXR0cmlidXRlTmFtZU1hcHBlZF0gPSBvQ29udGV4dE9iamVjdFtzQXR0cmlidXRlTmFtZV07XG5cblx0XHRcdGlmIChvQXR0cmlidXRlKSB7XG5cdFx0XHRcdGlmIChvVHJhbnNmb3JtYXRpb25BZGRpdGlvbmFsKSB7XG5cdFx0XHRcdFx0b0F0dHJpYnV0ZS50cmFuc2Zvcm1hdGlvbnMucHVzaChvVHJhbnNmb3JtYXRpb25BZGRpdGlvbmFsKTtcblx0XHRcdFx0XHRjb25zdCBhQXR0cmlidXRlTmV3ID0gb0luZm9Mb2cuY3JlYXRlQXR0cmlidXRlU3RydWN0dXJlKCk7XG5cdFx0XHRcdFx0YUF0dHJpYnV0ZU5ldy50cmFuc2Zvcm1hdGlvbnMucHVzaCh7XG5cdFx0XHRcdFx0XHR2YWx1ZTogb0NvbnRleHRPYmplY3Rbc0F0dHJpYnV0ZU5hbWVdLFxuXHRcdFx0XHRcdFx0ZGVzY3JpcHRpb246IGBcXHUyMTM5IFRoZSBhdHRyaWJ1dGUgJHtzQXR0cmlidXRlTmFtZU1hcHBlZH0gd2l0aCB0aGUgdmFsdWUgJHtvQ29udGV4dE9iamVjdFtzQXR0cmlidXRlTmFtZV19IGhhcyBiZWVuIGFkZGVkIGR1ZSB0byBhIG1hcHBpbmcgcnVsZSByZWdhcmRpbmcgdGhlIGF0dHJpYnV0ZSAke3NBdHRyaWJ1dGVOYW1lfSBpbiBTaW1wbGVMaW5rRGVsZWdhdGUuYFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdG9JbmZvTG9nLmFkZFNlbWFudGljT2JqZWN0QXR0cmlidXRlKHNTZW1hbnRpY09iamVjdCwgc0F0dHJpYnV0ZU5hbWVNYXBwZWQsIGFBdHRyaWJ1dGVOZXcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn07XG5cbi8qKlxuICogQ2hlY2tzIHdoaWNoIGF0dHJpYnV0ZXMgb2YgdGhlIENvbnRleHRPYmplY3QgYmVsb25nIHRvIHdoaWNoIFNlbWFudGljT2JqZWN0IGFuZCBtYXBzIHRoZW0gaW50byBhIHR3byBkaW1lbnNpb25hbCBhcnJheS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIG9Db250ZXh0T2JqZWN0IFRoZSBCaW5kaW5nQ29udGV4dCBvZiB0aGUgU291cmNlQ29udHJvbCBvZiB0aGUgTGluayAvIG9mIHRoZSBMaW5rIGl0c2VsZiBpZiBub3Qgc2V0XG4gKiBAcGFyYW0gb1BheWxvYWQgVGhlIHBheWxvYWQgZ2l2ZW4gYnkgdGhlIGFwcGxpY2F0aW9uXG4gKiBAcGFyYW0gb0luZm9Mb2cgVGhlIGNvcnJlc3BvbmRpbmcgSW5mb0xvZyBvZiB0aGUgTGlua1xuICogQHBhcmFtIG9MaW5rIFRoZSBjb3JyZXNwb25kaW5nIExpbmtcbiAqIEByZXR1cm5zIEEgdHdvIGRpbWVuc2lvbmFsIGFycmF5IHdoaWNoIG1hcHMgYSBnaXZlbiBTZW1hbnRpY09iamVjdCBuYW1lIHRvZ2V0aGVyIHdpdGggYSBnaXZlbiBhdHRyaWJ1dGUgbmFtZSB0byB0aGUgdmFsdWUgb2YgdGhhdCBnaXZlbiBhdHRyaWJ1dGVcbiAqL1xuU2ltcGxlTGlua0RlbGVnYXRlLl9jYWxjdWxhdGVTZW1hbnRpY0F0dHJpYnV0ZXMgPSBmdW5jdGlvbiAob0NvbnRleHRPYmplY3Q6IGFueSwgb1BheWxvYWQ6IGFueSwgb0luZm9Mb2c6IGFueSwgb0xpbms6IGFueSkge1xuXHRjb25zdCBhTGlua0N1c3RvbURhdGEgPSBvTGluayAmJiB0aGlzLl9mZXRjaExpbmtDdXN0b21EYXRhKG9MaW5rKTtcblx0Y29uc3Qgb1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkOiBhbnkgPSBTaW1wbGVMaW5rRGVsZWdhdGUuX2dldFBheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkKFxuXHRcdG9QYXlsb2FkLFxuXHRcdGFMaW5rQ3VzdG9tRGF0YVxuXHQpO1xuXHRjb25zdCBvUGF5bG9hZFJlc29sdmVkID0gb1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkID8gb1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkIDogb1BheWxvYWQ7XG5cdHRoaXMucmVzb2x2ZWRwYXlsb2FkID0gb1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkO1xuXHRjb25zdCBhU2VtYW50aWNPYmplY3RzID0gU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRTZW1hbnRpY09iamVjdHMob1BheWxvYWRSZXNvbHZlZCk7XG5cdGNvbnN0IG1TZW1hbnRpY09iamVjdE1hcHBpbmdzID0gU2ltcGxlTGlua0RlbGVnYXRlLl9jb252ZXJ0U2VtYW50aWNPYmplY3RNYXBwaW5nKFxuXHRcdFNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0U2VtYW50aWNPYmplY3RNYXBwaW5ncyhvUGF5bG9hZFJlc29sdmVkKVxuXHQpO1xuXHRpZiAoIWFTZW1hbnRpY09iamVjdHMubGVuZ3RoKSB7XG5cdFx0cmV0dXJuIHsgcGF5bG9hZDogb1BheWxvYWRSZXNvbHZlZCwgcmVzdWx0czoge30gfTtcblx0fVxuXHRjb25zdCBvUmVzdWx0czogYW55ID0ge307XG5cdFNpbXBsZUxpbmtEZWxlZ2F0ZS5fdXBkYXRlUGF5bG9hZFdpdGhTZW1hbnRpY0F0dHJpYnV0ZXMoYVNlbWFudGljT2JqZWN0cywgb0luZm9Mb2csIG9Db250ZXh0T2JqZWN0LCBvUmVzdWx0cywgbVNlbWFudGljT2JqZWN0TWFwcGluZ3MpO1xuXHRyZXR1cm4geyBwYXlsb2FkOiBvUGF5bG9hZFJlc29sdmVkLCByZXN1bHRzOiBvUmVzdWx0cyB9O1xufTtcbi8qKlxuICogUmV0cmlldmVzIHRoZSBhY3R1YWwgdGFyZ2V0cyBmb3IgdGhlIG5hdmlnYXRpb24gb2YgdGhlIGxpbmsuIFRoaXMgdXNlcyB0aGUgVVNoZWxsIGxvYWRlZCBieSB0aGUge0BsaW5rIHNhcC51aS5tZGMubGluay5GYWN0b3J5fSB0byByZXRyaWV2ZVxuICogdGhlIG5hdmlnYXRpb24gdGFyZ2V0cyBmcm9tIHRoZSBGTFAgc2VydmljZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHNBcHBTdGF0ZUtleSBLZXkgb2YgdGhlIGFwcHN0YXRlIChub3QgdXNlZCB5ZXQpXG4gKiBAcGFyYW0gb1NlbWFudGljQXR0cmlidXRlcyBUaGUgY2FsY3VsYXRlZCBieSBfY2FsY3VsYXRlU2VtYW50aWNBdHRyaWJ1dGVzXG4gKiBAcGFyYW0gb1BheWxvYWQgVGhlIHBheWxvYWQgZ2l2ZW4gYnkgdGhlIGFwcGxpY2F0aW9uXG4gKiBAcGFyYW0gb0luZm9Mb2cgVGhlIGNvcnJlc3BvbmRpbmcgSW5mb0xvZyBvZiB0aGUgTGlua1xuICogQHBhcmFtIG9MaW5rIFRoZSBjb3JyZXNwb25kaW5nIExpbmtcbiAqIEByZXR1cm5zIFJlc29sdmluZyBpbnRvIGF2YWlsYWJsZUF0aW9ucyBhbmQgb3duTmF2aWdhdGlvbiBjb250YWluaW5nIGFuIGFycmF5IG9mIHtAbGluayBzYXAudWkubWRjLmxpbmsuTGlua0l0ZW19XG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fcmV0cmlldmVOYXZpZ2F0aW9uVGFyZ2V0cyA9IGZ1bmN0aW9uIChcblx0c0FwcFN0YXRlS2V5OiBzdHJpbmcsXG5cdG9TZW1hbnRpY0F0dHJpYnV0ZXM6IGFueSxcblx0b1BheWxvYWQ6IGFueSxcblx0b0luZm9Mb2c6IGFueSxcblx0b0xpbms6IGFueVxuKSB7XG5cdGlmICghb1BheWxvYWQuc2VtYW50aWNPYmplY3RzKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XG5cdH1cblx0Y29uc3QgYVNlbWFudGljT2JqZWN0cyA9IG9QYXlsb2FkLnNlbWFudGljT2JqZWN0cztcblx0Y29uc3Qgb05hdmlnYXRpb25UYXJnZXRzOiBhbnkgPSB7XG5cdFx0b3duTmF2aWdhdGlvbjogdW5kZWZpbmVkLFxuXHRcdGF2YWlsYWJsZUFjdGlvbnM6IFtdXG5cdH07XG5cdGxldCBpU3VwZXJpb3JBY3Rpb25MaW5rc0ZvdW5kID0gMDtcblx0cmV0dXJuIENvcmUubG9hZExpYnJhcnkoXCJzYXAudWkuZmxcIiwge1xuXHRcdGFzeW5jOiB0cnVlXG5cdH0pLnRoZW4oKCkgPT4ge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdFx0c2FwLnVpLnJlcXVpcmUoW1wic2FwL3VpL2ZsL1V0aWxzXCJdLCBhc3luYyAoVXRpbHM6IGFueSkgPT4ge1xuXHRcdFx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gVXRpbHMuZ2V0QXBwQ29tcG9uZW50Rm9yQ29udHJvbChvTGluayA9PT0gdW5kZWZpbmVkID8gdGhpcy5vQ29udHJvbCA6IG9MaW5rKTtcblx0XHRcdFx0Y29uc3Qgb1NoZWxsU2VydmljZXMgPSBvQXBwQ29tcG9uZW50ID8gb0FwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCkgOiBudWxsO1xuXHRcdFx0XHRpZiAoIW9TaGVsbFNlcnZpY2VzKSB7XG5cdFx0XHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRyZXNvbHZlKG9OYXZpZ2F0aW9uVGFyZ2V0cy5hdmFpbGFibGVBY3Rpb25zLCBvTmF2aWdhdGlvblRhcmdldHMub3duTmF2aWdhdGlvbik7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCFvU2hlbGxTZXJ2aWNlcy5oYXNVU2hlbGwoKSkge1xuXHRcdFx0XHRcdExvZy5lcnJvcihcIlNpbXBsZUxpbmtEZWxlZ2F0ZTogU2VydmljZSAnQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb24nIG9yICdVUkxQYXJzaW5nJyBjb3VsZCBub3QgYmUgb2J0YWluZWRcIik7XG5cdFx0XHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRyZXNvbHZlKG9OYXZpZ2F0aW9uVGFyZ2V0cy5hdmFpbGFibGVBY3Rpb25zLCBvTmF2aWdhdGlvblRhcmdldHMub3duTmF2aWdhdGlvbik7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3QgYVBhcmFtcyA9IGFTZW1hbnRpY09iamVjdHMubWFwKGZ1bmN0aW9uIChzU2VtYW50aWNPYmplY3Q6IGFueSkge1xuXHRcdFx0XHRcdHJldHVybiBbXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBzU2VtYW50aWNPYmplY3QsXG5cdFx0XHRcdFx0XHRcdHBhcmFtczogb1NlbWFudGljQXR0cmlidXRlcyA/IG9TZW1hbnRpY0F0dHJpYnV0ZXNbc1NlbWFudGljT2JqZWN0XSA6IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdFx0YXBwU3RhdGVLZXk6IHNBcHBTdGF0ZUtleSxcblx0XHRcdFx0XHRcdFx0c29ydFJlc3VsdHNCeTogXCJ0ZXh0XCJcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRdO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRjb25zdCBhTGlua3MgPSBhd2FpdCBvU2hlbGxTZXJ2aWNlcy5nZXRMaW5rcyhhUGFyYW1zKTtcblx0XHRcdFx0XHRsZXQgYkhhc0xpbmtzID0gZmFsc2U7XG5cdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhTGlua3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgYUxpbmtzW2ldLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChhTGlua3NbaV1bal0ubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0XHRcdGJIYXNMaW5rcyA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0aWYgKGJIYXNMaW5rcykge1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCFhTGlua3MgfHwgIWFMaW5rcy5sZW5ndGggfHwgIWJIYXNMaW5rcykge1xuXHRcdFx0XHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuXHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0cmVzb2x2ZShvTmF2aWdhdGlvblRhcmdldHMuYXZhaWxhYmxlQWN0aW9ucywgb05hdmlnYXRpb25UYXJnZXRzLm93bk5hdmlnYXRpb24pO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNvbnN0IGFTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyA9IFNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0U2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMob1BheWxvYWQpO1xuXHRcdFx0XHRcdGNvbnN0IG9VbmF2YWlsYWJsZUFjdGlvbnMgPVxuXHRcdFx0XHRcdFx0U2ltcGxlTGlua0RlbGVnYXRlLl9jb252ZXJ0U2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbihhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMpO1xuXHRcdFx0XHRcdGxldCBzQ3VycmVudEhhc2ggPSBGaWVsZFJ1bnRpbWUuX2ZuRml4SGFzaFF1ZXJ5U3RyaW5nKG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpLmdldEhhc2goKSk7XG5cblx0XHRcdFx0XHRpZiAoc0N1cnJlbnRIYXNoKSB7XG5cdFx0XHRcdFx0XHQvLyBCQ1AgMTc3MDMxNTAzNTogd2UgaGF2ZSB0byBzZXQgdGhlIGVuZC1wb2ludCAnPycgb2YgYWN0aW9uIGluIG9yZGVyIHRvIGF2b2lkIG1hdGNoaW5nIG9mIFwiI1NhbGVzT3JkZXItbWFuYWdlXCIgaW4gXCIjU2FsZXNPcmRlci1tYW5hZ2VGdWxmaWxsbWVudFwiXG5cdFx0XHRcdFx0XHRzQ3VycmVudEhhc2ggKz0gXCI/XCI7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc3QgZm5Jc1VuYXZhaWxhYmxlQWN0aW9uID0gZnVuY3Rpb24gKHNTZW1hbnRpY09iamVjdDogYW55LCBzQWN0aW9uOiBhbnkpIHtcblx0XHRcdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0XHRcdCEhb1VuYXZhaWxhYmxlQWN0aW9ucyAmJlxuXHRcdFx0XHRcdFx0XHQhIW9VbmF2YWlsYWJsZUFjdGlvbnNbc1NlbWFudGljT2JqZWN0XSAmJlxuXHRcdFx0XHRcdFx0XHRvVW5hdmFpbGFibGVBY3Rpb25zW3NTZW1hbnRpY09iamVjdF0uaW5kZXhPZihzQWN0aW9uKSA+IC0xXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0Y29uc3QgZm5BZGRMaW5rID0gZnVuY3Rpb24gKF9vTGluazogYW55KSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvU2hlbGxIYXNoID0gb1NoZWxsU2VydmljZXMucGFyc2VTaGVsbEhhc2goX29MaW5rLmludGVudCk7XG5cdFx0XHRcdFx0XHRpZiAoZm5Jc1VuYXZhaWxhYmxlQWN0aW9uKG9TaGVsbEhhc2guc2VtYW50aWNPYmplY3QsIG9TaGVsbEhhc2guYWN0aW9uKSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjb25zdCBzSHJlZiA9IGAjJHtvU2hlbGxTZXJ2aWNlcy5jb25zdHJ1Y3RTaGVsbEhhc2goeyB0YXJnZXQ6IHsgc2hlbGxIYXNoOiBfb0xpbmsuaW50ZW50IH0gfSl9YDtcblxuXHRcdFx0XHRcdFx0aWYgKF9vTGluay5pbnRlbnQgJiYgX29MaW5rLmludGVudC5pbmRleE9mKHNDdXJyZW50SGFzaCkgPT09IDApIHtcblx0XHRcdFx0XHRcdFx0Ly8gUHJldmVudCBjdXJyZW50IGFwcCBmcm9tIGJlaW5nIGxpc3RlZFxuXHRcdFx0XHRcdFx0XHQvLyBOT1RFOiBJZiB0aGUgbmF2aWdhdGlvbiB0YXJnZXQgZXhpc3RzIGluXG5cdFx0XHRcdFx0XHRcdC8vIG11bHRpcGxlIGNvbnRleHRzICh+WFhYWCBpbiBoYXNoKSB0aGV5IHdpbGwgYWxsIGJlIHNraXBwZWRcblx0XHRcdFx0XHRcdFx0b05hdmlnYXRpb25UYXJnZXRzLm93bk5hdmlnYXRpb24gPSBuZXcgTGlua0l0ZW0oe1xuXHRcdFx0XHRcdFx0XHRcdGhyZWY6IHNIcmVmLFxuXHRcdFx0XHRcdFx0XHRcdHRleHQ6IF9vTGluay50ZXh0XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjb25zdCBvTGlua0l0ZW0gPSBuZXcgTGlua0l0ZW0oe1xuXHRcdFx0XHRcdFx0XHQvLyBBcyB0aGUgcmV0cmlldmVOYXZpZ2F0aW9uVGFyZ2V0cyBtZXRob2QgY2FuIGJlIGNhbGxlZCBzZXZlcmFsIHRpbWUgd2UgY2FuIG5vdCBjcmVhdGUgdGhlIExpbmtJdGVtIGluc3RhbmNlIHdpdGggdGhlIHNhbWUgaWRcblx0XHRcdFx0XHRcdFx0a2V5OlxuXHRcdFx0XHRcdFx0XHRcdG9TaGVsbEhhc2guc2VtYW50aWNPYmplY3QgJiYgb1NoZWxsSGFzaC5hY3Rpb25cblx0XHRcdFx0XHRcdFx0XHRcdD8gYCR7b1NoZWxsSGFzaC5zZW1hbnRpY09iamVjdH0tJHtvU2hlbGxIYXNoLmFjdGlvbn1gXG5cdFx0XHRcdFx0XHRcdFx0XHQ6IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdFx0dGV4dDogX29MaW5rLnRleHQsXG5cdFx0XHRcdFx0XHRcdGRlc2NyaXB0aW9uOiB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcdGhyZWY6IHNIcmVmLFxuXHRcdFx0XHRcdFx0XHQvLyB0YXJnZXQ6IG5vdCBzdXBwb3J0ZWQgeWV0XG5cdFx0XHRcdFx0XHRcdGljb246IHVuZGVmaW5lZCwgLy9fb0xpbmsuaWNvbixcblx0XHRcdFx0XHRcdFx0aW5pdGlhbGx5VmlzaWJsZTogX29MaW5rLnRhZ3MgJiYgX29MaW5rLnRhZ3MuaW5kZXhPZihcInN1cGVyaW9yQWN0aW9uXCIpID4gLTFcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0aWYgKG9MaW5rSXRlbS5nZXRQcm9wZXJ0eShcImluaXRpYWxseVZpc2libGVcIikpIHtcblx0XHRcdFx0XHRcdFx0aVN1cGVyaW9yQWN0aW9uTGlua3NGb3VuZCsrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0b05hdmlnYXRpb25UYXJnZXRzLmF2YWlsYWJsZUFjdGlvbnMucHVzaChvTGlua0l0ZW0pO1xuXG5cdFx0XHRcdFx0XHRpZiAob0luZm9Mb2cpIHtcblx0XHRcdFx0XHRcdFx0b0luZm9Mb2cuYWRkU2VtYW50aWNPYmplY3RJbnRlbnQob1NoZWxsSGFzaC5zZW1hbnRpY09iamVjdCwge1xuXHRcdFx0XHRcdFx0XHRcdGludGVudDogb0xpbmtJdGVtLmdldEhyZWYoKSxcblx0XHRcdFx0XHRcdFx0XHR0ZXh0OiBvTGlua0l0ZW0uZ2V0VGV4dCgpXG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0Zm9yIChsZXQgbiA9IDA7IG4gPCBhU2VtYW50aWNPYmplY3RzLmxlbmd0aDsgbisrKSB7XG5cdFx0XHRcdFx0XHRhTGlua3Nbbl1bMF0uZm9yRWFjaChmbkFkZExpbmspO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoaVN1cGVyaW9yQWN0aW9uTGlua3NGb3VuZCA9PT0gMCkge1xuXHRcdFx0XHRcdFx0Zm9yIChsZXQgaUxpbmtJdGVtSW5kZXggPSAwOyBpTGlua0l0ZW1JbmRleCA8IG9OYXZpZ2F0aW9uVGFyZ2V0cy5hdmFpbGFibGVBY3Rpb25zLmxlbmd0aDsgaUxpbmtJdGVtSW5kZXgrKykge1xuXHRcdFx0XHRcdFx0XHRpZiAoaUxpbmtJdGVtSW5kZXggPCB0aGlzLmdldENvbnN0YW50cygpLmlMaW5rc1Nob3duSW5Qb3B1cCkge1xuXHRcdFx0XHRcdFx0XHRcdG9OYXZpZ2F0aW9uVGFyZ2V0cy5hdmFpbGFibGVBY3Rpb25zW2lMaW5rSXRlbUluZGV4XS5zZXRQcm9wZXJ0eShcImluaXRpYWxseVZpc2libGVcIiwgdHJ1ZSk7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRyZXNvbHZlKG9OYXZpZ2F0aW9uVGFyZ2V0cy5hdmFpbGFibGVBY3Rpb25zLCBvTmF2aWdhdGlvblRhcmdldHMub3duTmF2aWdhdGlvbik7XG5cdFx0XHRcdH0gY2F0Y2ggKG9FcnJvcikge1xuXHRcdFx0XHRcdExvZy5lcnJvcihcIlNpbXBsZUxpbmtEZWxlZ2F0ZTogJ19yZXRyaWV2ZU5hdmlnYXRpb25UYXJnZXRzJyBmYWlsZWQgZXhlY3V0aW5nIGdldExpbmtzIG1ldGhvZFwiKTtcblx0XHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdHJlc29sdmUob05hdmlnYXRpb25UYXJnZXRzLmF2YWlsYWJsZUFjdGlvbnMsIG9OYXZpZ2F0aW9uVGFyZ2V0cy5vd25OYXZpZ2F0aW9uKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH0pO1xufTtcblNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0U2VtYW50aWNPYmplY3RzID0gZnVuY3Rpb24gKG9QYXlsb2FkOiBhbnkpIHtcblx0cmV0dXJuIG9QYXlsb2FkLnNlbWFudGljT2JqZWN0cyA/IG9QYXlsb2FkLnNlbWFudGljT2JqZWN0cyA6IFtdO1xufTtcblNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0U2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgPSBmdW5jdGlvbiAob1BheWxvYWQ6IGFueSkge1xuXHRjb25zdCBhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnM6IGFueVtdID0gW107XG5cdGlmIChvUGF5bG9hZC5zZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucykge1xuXHRcdG9QYXlsb2FkLnNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKG9TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uOiBhbnkpIHtcblx0XHRcdGFTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucy5wdXNoKFxuXHRcdFx0XHRuZXcgU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbih7XG5cdFx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IG9TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uLnNlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdGFjdGlvbnM6IG9TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uLmFjdGlvbnNcblx0XHRcdFx0fSlcblx0XHRcdCk7XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGFTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucztcbn07XG5cbi8qKlxuICogVGhpcyB3aWxsIHJldHVybiBhbiBhcnJheSBvZiB7QGxpbmsgc2FwLnVpLm1kYy5saW5rLlNlbWFudGljT2JqZWN0TWFwcGluZ30gZGVwZW5kaW5nIG9uIHRoZSBnaXZlbiBwYXlsb2FkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gb1BheWxvYWQgVGhlIHBheWxvYWQgZGVmaW5lZCBieSB0aGUgYXBwbGljYXRpb25cbiAqIEByZXR1cm5zIEFuIGFycmF5IG9mIHNlbWFudGljIG9iamVjdCBtYXBwaW5ncy5cbiAqL1xuU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRTZW1hbnRpY09iamVjdE1hcHBpbmdzID0gZnVuY3Rpb24gKG9QYXlsb2FkOiBhbnkpIHtcblx0Y29uc3QgYVNlbWFudGljT2JqZWN0TWFwcGluZ3M6IGFueVtdID0gW107XG5cdGxldCBhU2VtYW50aWNPYmplY3RNYXBwaW5nSXRlbXM6IGFueVtdID0gW107XG5cdGlmIChvUGF5bG9hZC5zZW1hbnRpY09iamVjdE1hcHBpbmdzKSB7XG5cdFx0b1BheWxvYWQuc2VtYW50aWNPYmplY3RNYXBwaW5ncy5mb3JFYWNoKGZ1bmN0aW9uIChvU2VtYW50aWNPYmplY3RNYXBwaW5nOiBhbnkpIHtcblx0XHRcdGFTZW1hbnRpY09iamVjdE1hcHBpbmdJdGVtcyA9IFtdO1xuXHRcdFx0aWYgKG9TZW1hbnRpY09iamVjdE1hcHBpbmcuaXRlbXMpIHtcblx0XHRcdFx0b1NlbWFudGljT2JqZWN0TWFwcGluZy5pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uIChvU2VtYW50aWNPYmplY3RNYXBwaW5nSXRlbTogYW55KSB7XG5cdFx0XHRcdFx0YVNlbWFudGljT2JqZWN0TWFwcGluZ0l0ZW1zLnB1c2goXG5cdFx0XHRcdFx0XHRuZXcgU2VtYW50aWNPYmplY3RNYXBwaW5nSXRlbSh7XG5cdFx0XHRcdFx0XHRcdGtleTogb1NlbWFudGljT2JqZWN0TWFwcGluZ0l0ZW0ua2V5LFxuXHRcdFx0XHRcdFx0XHR2YWx1ZTogb1NlbWFudGljT2JqZWN0TWFwcGluZ0l0ZW0udmFsdWVcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRhU2VtYW50aWNPYmplY3RNYXBwaW5ncy5wdXNoKFxuXHRcdFx0XHRuZXcgU2VtYW50aWNPYmplY3RNYXBwaW5nKHtcblx0XHRcdFx0XHRzZW1hbnRpY09iamVjdDogb1NlbWFudGljT2JqZWN0TWFwcGluZy5zZW1hbnRpY09iamVjdCxcblx0XHRcdFx0XHRpdGVtczogYVNlbWFudGljT2JqZWN0TWFwcGluZ0l0ZW1zXG5cdFx0XHRcdH0pXG5cdFx0XHQpO1xuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBhU2VtYW50aWNPYmplY3RNYXBwaW5ncztcbn07XG4vKipcbiAqIENvbnZlcnRzIGEgZ2l2ZW4gYXJyYXkgb2YgU2VtYW50aWNPYmplY3RNYXBwaW5nIGludG8gYSBNYXAgY29udGFpbmluZyBTZW1hbnRpY09iamVjdHMgYXMgS2V5cyBhbmQgYSBNYXAgb2YgaXQncyBjb3JyZXNwb25kaW5nIFNlbWFudGljT2JqZWN0TWFwcGluZ3MgYXMgdmFsdWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gYVNlbWFudGljT2JqZWN0TWFwcGluZ3MgQW4gYXJyYXkgb2YgU2VtYW50aWNPYmplY3RNYXBwaW5ncy5cbiAqIEByZXR1cm5zIFRoZSBjb252ZXJ0ZXJkIFNlbWFudGljT2JqZWN0TWFwcGluZ3NcbiAqL1xuU2ltcGxlTGlua0RlbGVnYXRlLl9jb252ZXJ0U2VtYW50aWNPYmplY3RNYXBwaW5nID0gZnVuY3Rpb24gKGFTZW1hbnRpY09iamVjdE1hcHBpbmdzOiBhbnlbXSkge1xuXHRpZiAoIWFTZW1hbnRpY09iamVjdE1hcHBpbmdzLmxlbmd0aCkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblx0Y29uc3QgbVNlbWFudGljT2JqZWN0TWFwcGluZ3M6IGFueSA9IHt9O1xuXHRhU2VtYW50aWNPYmplY3RNYXBwaW5ncy5mb3JFYWNoKGZ1bmN0aW9uIChvU2VtYW50aWNPYmplY3RNYXBwaW5nOiBhbnkpIHtcblx0XHRpZiAoIW9TZW1hbnRpY09iamVjdE1hcHBpbmcuZ2V0U2VtYW50aWNPYmplY3QoKSkge1xuXHRcdFx0dGhyb3cgRXJyb3IoXG5cdFx0XHRcdGBTaW1wbGVMaW5rRGVsZWdhdGU6ICdzZW1hbnRpY09iamVjdCcgcHJvcGVydHkgd2l0aCB2YWx1ZSAnJHtvU2VtYW50aWNPYmplY3RNYXBwaW5nLmdldFNlbWFudGljT2JqZWN0KCl9JyBpcyBub3QgdmFsaWRgXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRtU2VtYW50aWNPYmplY3RNYXBwaW5nc1tvU2VtYW50aWNPYmplY3RNYXBwaW5nLmdldFNlbWFudGljT2JqZWN0KCldID0gb1NlbWFudGljT2JqZWN0TWFwcGluZ1xuXHRcdFx0LmdldEl0ZW1zKClcblx0XHRcdC5yZWR1Y2UoZnVuY3Rpb24gKG9NYXA6IGFueSwgb0l0ZW06IGFueSkge1xuXHRcdFx0XHRvTWFwW29JdGVtLmdldEtleSgpXSA9IG9JdGVtLmdldFZhbHVlKCk7XG5cdFx0XHRcdHJldHVybiBvTWFwO1xuXHRcdFx0fSwge30pO1xuXHR9KTtcblx0cmV0dXJuIG1TZW1hbnRpY09iamVjdE1hcHBpbmdzO1xufTtcbi8qKlxuICogQ29udmVydHMgYSBnaXZlbiBhcnJheSBvZiBTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyBpbnRvIGEgbWFwIGNvbnRhaW5pbmcgU2VtYW50aWNPYmplY3RzIGFzIGtleXMgYW5kIGEgbWFwIG9mIGl0cyBjb3JyZXNwb25kaW5nIFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIGFzIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIGFTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyBUaGUgU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgY29udmVydGVkXG4gKiBAcmV0dXJucyBUaGUgbWFwIGNvbnRhaW5pbmcgdGhlIGNvbnZlcnRlZCBTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc1xuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUuX2NvbnZlcnRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uID0gZnVuY3Rpb24gKGFTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uczogYW55W10pIHtcblx0bGV0IF9TZW1hbnRpY09iamVjdE5hbWU6IGFueTtcblx0bGV0IF9TZW1hbnRpY09iamVjdEhhc0FscmVhZHlVbmF2YWlsYWJsZUFjdGlvbnM6IGFueTtcblx0bGV0IF9VbmF2YWlsYWJsZUFjdGlvbnM6IGFueVtdID0gW107XG5cdGlmICghYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zLmxlbmd0aCkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblx0Y29uc3QgbVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zOiBhbnkgPSB7fTtcblx0YVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKG9TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uczogYW55KSB7XG5cdFx0X1NlbWFudGljT2JqZWN0TmFtZSA9IG9TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucy5nZXRTZW1hbnRpY09iamVjdCgpO1xuXHRcdGlmICghX1NlbWFudGljT2JqZWN0TmFtZSkge1xuXHRcdFx0dGhyb3cgRXJyb3IoYFNpbXBsZUxpbmtEZWxlZ2F0ZTogJ3NlbWFudGljT2JqZWN0JyBwcm9wZXJ0eSB3aXRoIHZhbHVlICcke19TZW1hbnRpY09iamVjdE5hbWV9JyBpcyBub3QgdmFsaWRgKTtcblx0XHR9XG5cdFx0X1VuYXZhaWxhYmxlQWN0aW9ucyA9IG9TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucy5nZXRBY3Rpb25zKCk7XG5cdFx0aWYgKG1TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc1tfU2VtYW50aWNPYmplY3ROYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRtU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnNbX1NlbWFudGljT2JqZWN0TmFtZV0gPSBfVW5hdmFpbGFibGVBY3Rpb25zO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRfU2VtYW50aWNPYmplY3RIYXNBbHJlYWR5VW5hdmFpbGFibGVBY3Rpb25zID0gbVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zW19TZW1hbnRpY09iamVjdE5hbWVdO1xuXHRcdFx0X1VuYXZhaWxhYmxlQWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChVbmF2YWlsYWJsZUFjdGlvbjogc3RyaW5nKSB7XG5cdFx0XHRcdF9TZW1hbnRpY09iamVjdEhhc0FscmVhZHlVbmF2YWlsYWJsZUFjdGlvbnMucHVzaChVbmF2YWlsYWJsZUFjdGlvbik7XG5cdFx0XHR9KTtcblx0XHRcdG1TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc1tfU2VtYW50aWNPYmplY3ROYW1lXSA9IF9TZW1hbnRpY09iamVjdEhhc0FscmVhZHlVbmF2YWlsYWJsZUFjdGlvbnM7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG1TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucztcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFNpbXBsZUxpbmtEZWxlZ2F0ZTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7RUFnREEsTUFBTUEsa0JBQWtCLEdBQUdDLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFQyxZQUFZLENBQVE7RUFDakUsTUFBTUMsU0FBUyxHQUFHO0lBQ2pCQyxrQkFBa0IsRUFBRSxDQUFDO0lBQ3JCQyxRQUFRLEVBQUUsWUFBWTtJQUN0QkMsWUFBWSxFQUFFLGlCQUFpQjtJQUMvQkMsb0JBQW9CLEVBQUUsMEJBQTBCO0lBQ2hEQyxvQkFBb0IsRUFBRSx3QkFBd0I7SUFDOUNDLGdCQUFnQixFQUFFO0VBQ25CLENBQUM7RUFDRFYsa0JBQWtCLENBQUNXLFlBQVksR0FBRyxZQUFZO0lBQzdDLE9BQU9QLFNBQVM7RUFDakIsQ0FBQztFQUNEO0FBQ0E7QUFDQTtB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