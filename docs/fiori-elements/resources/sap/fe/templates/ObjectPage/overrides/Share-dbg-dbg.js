/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/SemanticKeyHelper", "sap/ui/core/routing/HashChanger", "sap/ui/model/Filter", "sap/ui/model/FilterOperator"], function (Log, ModelHelper, SemanticKeyHelper, HashChanger, Filter, FilterOperator) {
  "use strict";

  let bGlobalIsStickySupported;
  function createFilterToFetchActiveContext(mKeyValues, bIsActiveEntityDefined) {
    const aKeys = Object.keys(mKeyValues);
    const aFilters = aKeys.map(function (sKey) {
      const sValue = mKeyValues[sKey];
      if (sValue !== undefined) {
        return new Filter(sKey, FilterOperator.EQ, sValue);
      }
    });
    if (bIsActiveEntityDefined) {
      const oActiveFilter = new Filter({
        filters: [new Filter("SiblingEntity/IsActiveEntity", FilterOperator.EQ, true)],
        and: false
      });
      aFilters.push(oActiveFilter);
    }
    return new Filter(aFilters, true);
  }
  function getActiveContextPath(oController, sPageEntityName, oFilter) {
    const oListBinding = oController.getView().getBindingContext().getModel().bindList(`/${sPageEntityName}`, undefined, undefined, oFilter, {
      $$groupId: "$auto.Heroes"
    });
    return oListBinding.requestContexts(0, 2).then(function (oContexts) {
      if (oContexts && oContexts.length) {
        return oContexts[0].getPath();
      }
    });
  }
  function getActiveContextInstances(oContext, oController, oEntitySet) {
    const aActiveContextpromises = [];
    const aPages = [];
    let sMetaPath = oContext.getModel().getMetaModel().getMetaPath(oContext.getPath());
    if (sMetaPath.indexOf("/") === 0) {
      sMetaPath = sMetaPath.substring(1);
    }
    const aMetaPathArray = sMetaPath.split("/");
    const sCurrentHashNoParams = HashChanger.getInstance().getHash().split("?")[0];
    const aCurrentHashArray = sCurrentHashNoParams.split("/");

    // oPageMap - creating an object that contains map of metapath name and it's technical details
    // which is required to create a filter to fetch the relavant/correct active context
    // Example: {SalesOrderManage:{technicalID:technicalIDValue}, _Item:{technicalID:technicalIDValue}} etc.,
    const oPageMap = {};
    const aPageHashArray = [];
    aCurrentHashArray.forEach(function (sPageHash) {
      const aKeyValues = sPageHash.substring(sPageHash.indexOf("(") + 1, sPageHash.length - 1).split(",");
      const mKeyValues = {};
      const sPageHashName = sPageHash.split("(")[0];
      oPageMap[sPageHashName] = {};
      aPageHashArray.push(sPageHashName);
      oPageMap[sPageHashName]["bIsActiveEntityDefined"] = true;
      for (let i = 0; i < aKeyValues.length; i++) {
        const sKeyAssignment = aKeyValues[i];
        const aParts = sKeyAssignment.split("=");
        let sKeyValue = aParts[1];
        let sKey = aParts[0];
        // In case if only one technical key is defined then the url just contains the technicalIDValue but not the technicalID
        // Example: SalesOrderManage(ID=11111129-aaaa-bbbb-cccc-ddddeeeeffff,IsActiveEntity=false)/_Item(11111129-aaaa-bbbb-cccc-ddddeeeeffff)
        // In above example SalesOrderItem has only one technical key defined, hence technicalID info is not present in the url
        // Hence in such cases we get technical key and use them to fetch active context
        if (sKeyAssignment.indexOf("=") === -1) {
          const oMetaModel = oContext.getModel().getMetaModel();
          const aTechnicalKeys = oMetaModel.getObject(`/${aPageHashArray.join("/")}/$Type/$Key`);
          sKeyValue = aParts[0];
          sKey = aTechnicalKeys[0];
          oPageMap[sPageHash.split("(")[0]]["bIsActiveEntityDefined"] = false;
        }
        if (sKey !== "IsActiveEntity") {
          if (sKeyValue.indexOf("'") === 0 && sKeyValue.lastIndexOf("'") === sKeyValue.length - 1) {
            // Remove the quotes from the value and decode special chars
            sKeyValue = decodeURIComponent(sKeyValue.substring(1, sKeyValue.length - 1));
          }
          mKeyValues[sKey] = sKeyValue;
        }
      }
      oPageMap[sPageHashName].mKeyValues = mKeyValues;
    });
    let oPageEntitySet = oEntitySet;
    aMetaPathArray.forEach(function (sNavigationPath) {
      const oPageInfo = {};
      const sPageEntitySetName = oPageEntitySet.$NavigationPropertyBinding && oPageEntitySet.$NavigationPropertyBinding[sNavigationPath];
      if (sPageEntitySetName) {
        oPageInfo.pageEntityName = oPageEntitySet.$NavigationPropertyBinding[sNavigationPath];
        oPageEntitySet = oContext.getModel().getMetaModel().getObject(`/${sPageEntitySetName}`) || oEntitySet;
      } else {
        oPageInfo.pageEntityName = sNavigationPath;
      }
      oPageInfo.mKeyValues = oPageMap[sNavigationPath].mKeyValues;
      oPageInfo.bIsActiveEntityDefined = oPageMap[sNavigationPath].bIsActiveEntityDefined;
      aPages.push(oPageInfo);
    });
    aPages.forEach(function (oPageInfo) {
      const oFilter = createFilterToFetchActiveContext(oPageInfo.mKeyValues, oPageInfo.bIsActiveEntityDefined);
      aActiveContextpromises.push(getActiveContextPath(oController, oPageInfo.pageEntityName, oFilter));
    });
    return aActiveContextpromises;
  }

  /**
   * Method to fetch active context path's.
   *
   * @param oContext The Page Context
   * @param oController
   * @returns Promise which is resolved once the active context's are fetched
   */
  function getActiveContextPaths(oContext, oController) {
    const sCurrentHashNoParams = HashChanger.getInstance().getHash().split("?")[0];
    let sRootEntityName = sCurrentHashNoParams && sCurrentHashNoParams.substr(0, sCurrentHashNoParams.indexOf("("));
    if (sRootEntityName.indexOf("/") === 0) {
      sRootEntityName = sRootEntityName.substring(1);
    }
    const oEntitySet = oContext.getModel().getMetaModel().getObject(`/${sRootEntityName}`);
    const oPageContext = oContext;
    const aActiveContextpromises = getActiveContextInstances(oContext, oController, oEntitySet);
    if (aActiveContextpromises.length > 0) {
      return Promise.all(aActiveContextpromises).then(function (aData) {
        const aActiveContextPaths = [];
        let oPageEntitySet = oEntitySet;
        if (aData[0].indexOf("/") === 0) {
          aActiveContextPaths.push(aData[0].substring(1));
        } else {
          aActiveContextPaths.push(aData[0]);
        }
        // In the active context paths identify and replace the entitySet Name with corresponding navigation property name
        // Required to form the url pointing to active context
        // Example : SalesOrderItem --> _Item, MaterialDetails --> _MaterialDetails etc.,
        for (let i = 1; i < aData.length; i++) {
          let sActiveContextPath = aData[i];
          let sNavigatioProperty = "";
          let sEntitySetName = sActiveContextPath && sActiveContextPath.substr(0, sActiveContextPath.indexOf("("));
          if (sEntitySetName.indexOf("/") === 0) {
            sEntitySetName = sEntitySetName.substring(1);
          }
          if (sActiveContextPath.indexOf("/") === 0) {
            sActiveContextPath = sActiveContextPath.substring(1);
          }
          sNavigatioProperty = Object.keys(oPageEntitySet.$NavigationPropertyBinding)[Object.values(oPageEntitySet.$NavigationPropertyBinding).indexOf(sEntitySetName)];
          if (sNavigatioProperty) {
            aActiveContextPaths.push(sActiveContextPath.replace(sEntitySetName, sNavigatioProperty));
            oPageEntitySet = oPageContext.getModel().getMetaModel().getObject(`/${sEntitySetName}`) || oEntitySet;
          } else {
            aActiveContextPaths.push(sActiveContextPath);
          }
        }
        return aActiveContextPaths;
      }).catch(function (oError) {
        Log.info("Failed to retrieve one or more active context path's", oError);
      });
    } else {
      return Promise.resolve();
    }
  }
  function fetchActiveContextPaths(oContext, oController) {
    let oPromise, aSemanticKeys;
    const sCurrentHashNoParams = HashChanger.getInstance().getHash().split("?")[0];
    if (oContext) {
      const oModel = oContext.getModel();
      const oMetaModel = oModel.getMetaModel();
      bGlobalIsStickySupported = ModelHelper.isStickySessionSupported(oMetaModel);
      let sRootEntityName = sCurrentHashNoParams && sCurrentHashNoParams.substr(0, sCurrentHashNoParams.indexOf("("));
      if (sRootEntityName.indexOf("/") === 0) {
        sRootEntityName = sRootEntityName.substring(1);
      }
      aSemanticKeys = SemanticKeyHelper.getSemanticKeys(oMetaModel, sRootEntityName);
    }
    // Fetch active context details incase of below scenario's(where page is not sticky supported(we do not have draft instance))
    // 1. In case of draft enabled Object page where semantic key based URL is not possible(like semantic keys are not modeled in the entity set)
    // 2. In case of draft enabled Sub Object Pages (where semantic bookmarking is not supported)
    const oViewData = oController.getView().getViewData();
    if (oContext && !bGlobalIsStickySupported && (oViewData.viewLevel === 1 && !aSemanticKeys || oViewData.viewLevel >= 2)) {
      oPromise = getActiveContextPaths(oContext, oController);
      return oPromise;
    } else {
      return Promise.resolve();
    }
  }

  // /**
  //  * Get share URL.
  //  * @param bIsEditable
  //  * @param bIsStickySupported
  //  * @param aActiveContextPaths
  //  * @returns {string} The share URL
  //  * @protected
  //  * @static
  //  */
  function getShareUrl(bIsEditable, bIsStickySupported, aActiveContextPaths) {
    let sShareUrl;
    const sHash = HashChanger.getInstance().getHash();
    const sBasePath = HashChanger.getInstance().hrefForAppSpecificHash ? HashChanger.getInstance().hrefForAppSpecificHash("") : "";
    if (bIsEditable && !bIsStickySupported && aActiveContextPaths) {
      sShareUrl = sBasePath + aActiveContextPaths.join("/");
    } else {
      sShareUrl = sHash ? sBasePath + sHash : window.location.hash;
    }
    return window.location.origin + window.location.pathname + window.location.search + sShareUrl;
  }
  function getShareEmailUrl() {
    const oUShellContainer = sap.ushell && sap.ushell.Container;
    if (oUShellContainer) {
      return oUShellContainer.getFLPUrlAsync(true).then(function (sFLPUrl) {
        return sFLPUrl;
      }).catch(function (sError) {
        Log.error("Could not retrieve cFLP URL for the sharing dialog (dialog will not be opened)", sError);
      });
    } else {
      return Promise.resolve(document.URL);
    }
  }
  function getJamUrl(bIsEditMode, bIsStickySupported, aActiveContextPaths) {
    let sJamUrl;
    const sHash = HashChanger.getInstance().getHash();
    const sBasePath = HashChanger.getInstance().hrefForAppSpecificHash ? HashChanger.getInstance().hrefForAppSpecificHash("") : "";
    if (bIsEditMode && !bIsStickySupported && aActiveContextPaths) {
      sJamUrl = sBasePath + aActiveContextPaths.join("/");
    } else {
      sJamUrl = sHash ? sBasePath + sHash : window.location.hash;
    }
    // in case we are in cFLP scenario, the application is running
    // inside an iframe, and there for we need to get the cFLP URL
    // and not 'document.URL' that represents the iframe URL
    if (sap.ushell && sap.ushell.Container && sap.ushell.Container.runningInIframe && sap.ushell.Container.runningInIframe()) {
      sap.ushell.Container.getFLPUrl(true).then(function (sUrl) {
        return sUrl.substr(0, sUrl.indexOf("#")) + sJamUrl;
      }).catch(function (sError) {
        Log.error("Could not retrieve cFLP URL for the sharing dialog (dialog will not be opened)", sError);
      });
    } else {
      return Promise.resolve(window.location.origin + window.location.pathname + sJamUrl);
    }
  }
  const ShareExtensionOverride = {
    adaptShareMetadata: async function (oShareMetadata) {
      const oContext = this.base.getView().getBindingContext();
      const oUIModel = this.base.getView().getModel("ui");
      const bIsEditable = oUIModel.getProperty("/isEditable");
      try {
        const aActiveContextPaths = await fetchActiveContextPaths(oContext, this.base.getView().getController());
        const oPageTitleInfo = this.base.getView().getController()._getPageTitleInformation();
        const oData = await Promise.all([getJamUrl(bIsEditable, bGlobalIsStickySupported, aActiveContextPaths), getShareUrl(bIsEditable, bGlobalIsStickySupported, aActiveContextPaths), getShareEmailUrl()]);
        let sTitle = oPageTitleInfo.title;
        const sObjectSubtitle = oPageTitleInfo.subtitle ? oPageTitleInfo.subtitle.toString() : "";
        if (sObjectSubtitle) {
          sTitle = `${sTitle} - ${sObjectSubtitle}`;
        }
        oShareMetadata.tile = {
          title: oPageTitleInfo.title,
          subtitle: sObjectSubtitle
        };
        oShareMetadata.email.title = sTitle;
        oShareMetadata.title = sTitle;
        oShareMetadata.jam.url = oData[0];
        oShareMetadata.url = oData[1];
        oShareMetadata.email.url = oData[2];
        // MS Teams collaboration does not want to allow further changes to the URL
        // so update colloborationInfo model at LR override to ignore further extension changes at multiple levels
        const collaborationInfoModel = this.base.getView().getModel("collaborationInfo");
        collaborationInfoModel.setProperty("/url", oShareMetadata.url);
        collaborationInfoModel.setProperty("/appTitle", oShareMetadata.title);
        collaborationInfoModel.setProperty("/subTitle", sObjectSubtitle);
      } catch (error) {
        Log.error(error);
      }
      return oShareMetadata;
    }
  };
  return ShareExtensionOverride;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJiR2xvYmFsSXNTdGlja3lTdXBwb3J0ZWQiLCJjcmVhdGVGaWx0ZXJUb0ZldGNoQWN0aXZlQ29udGV4dCIsIm1LZXlWYWx1ZXMiLCJiSXNBY3RpdmVFbnRpdHlEZWZpbmVkIiwiYUtleXMiLCJPYmplY3QiLCJrZXlzIiwiYUZpbHRlcnMiLCJtYXAiLCJzS2V5Iiwic1ZhbHVlIiwidW5kZWZpbmVkIiwiRmlsdGVyIiwiRmlsdGVyT3BlcmF0b3IiLCJFUSIsIm9BY3RpdmVGaWx0ZXIiLCJmaWx0ZXJzIiwiYW5kIiwicHVzaCIsImdldEFjdGl2ZUNvbnRleHRQYXRoIiwib0NvbnRyb2xsZXIiLCJzUGFnZUVudGl0eU5hbWUiLCJvRmlsdGVyIiwib0xpc3RCaW5kaW5nIiwiZ2V0VmlldyIsImdldEJpbmRpbmdDb250ZXh0IiwiZ2V0TW9kZWwiLCJiaW5kTGlzdCIsIiQkZ3JvdXBJZCIsInJlcXVlc3RDb250ZXh0cyIsInRoZW4iLCJvQ29udGV4dHMiLCJsZW5ndGgiLCJnZXRQYXRoIiwiZ2V0QWN0aXZlQ29udGV4dEluc3RhbmNlcyIsIm9Db250ZXh0Iiwib0VudGl0eVNldCIsImFBY3RpdmVDb250ZXh0cHJvbWlzZXMiLCJhUGFnZXMiLCJzTWV0YVBhdGgiLCJnZXRNZXRhTW9kZWwiLCJnZXRNZXRhUGF0aCIsImluZGV4T2YiLCJzdWJzdHJpbmciLCJhTWV0YVBhdGhBcnJheSIsInNwbGl0Iiwic0N1cnJlbnRIYXNoTm9QYXJhbXMiLCJIYXNoQ2hhbmdlciIsImdldEluc3RhbmNlIiwiZ2V0SGFzaCIsImFDdXJyZW50SGFzaEFycmF5Iiwib1BhZ2VNYXAiLCJhUGFnZUhhc2hBcnJheSIsImZvckVhY2giLCJzUGFnZUhhc2giLCJhS2V5VmFsdWVzIiwic1BhZ2VIYXNoTmFtZSIsImkiLCJzS2V5QXNzaWdubWVudCIsImFQYXJ0cyIsInNLZXlWYWx1ZSIsIm9NZXRhTW9kZWwiLCJhVGVjaG5pY2FsS2V5cyIsImdldE9iamVjdCIsImpvaW4iLCJsYXN0SW5kZXhPZiIsImRlY29kZVVSSUNvbXBvbmVudCIsIm9QYWdlRW50aXR5U2V0Iiwic05hdmlnYXRpb25QYXRoIiwib1BhZ2VJbmZvIiwic1BhZ2VFbnRpdHlTZXROYW1lIiwiJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmciLCJwYWdlRW50aXR5TmFtZSIsImdldEFjdGl2ZUNvbnRleHRQYXRocyIsInNSb290RW50aXR5TmFtZSIsInN1YnN0ciIsIm9QYWdlQ29udGV4dCIsIlByb21pc2UiLCJhbGwiLCJhRGF0YSIsImFBY3RpdmVDb250ZXh0UGF0aHMiLCJzQWN0aXZlQ29udGV4dFBhdGgiLCJzTmF2aWdhdGlvUHJvcGVydHkiLCJzRW50aXR5U2V0TmFtZSIsInZhbHVlcyIsInJlcGxhY2UiLCJjYXRjaCIsIm9FcnJvciIsIkxvZyIsImluZm8iLCJyZXNvbHZlIiwiZmV0Y2hBY3RpdmVDb250ZXh0UGF0aHMiLCJvUHJvbWlzZSIsImFTZW1hbnRpY0tleXMiLCJvTW9kZWwiLCJNb2RlbEhlbHBlciIsImlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCIsIlNlbWFudGljS2V5SGVscGVyIiwiZ2V0U2VtYW50aWNLZXlzIiwib1ZpZXdEYXRhIiwiZ2V0Vmlld0RhdGEiLCJ2aWV3TGV2ZWwiLCJnZXRTaGFyZVVybCIsImJJc0VkaXRhYmxlIiwiYklzU3RpY2t5U3VwcG9ydGVkIiwic1NoYXJlVXJsIiwic0hhc2giLCJzQmFzZVBhdGgiLCJocmVmRm9yQXBwU3BlY2lmaWNIYXNoIiwid2luZG93IiwibG9jYXRpb24iLCJoYXNoIiwib3JpZ2luIiwicGF0aG5hbWUiLCJzZWFyY2giLCJnZXRTaGFyZUVtYWlsVXJsIiwib1VTaGVsbENvbnRhaW5lciIsInNhcCIsInVzaGVsbCIsIkNvbnRhaW5lciIsImdldEZMUFVybEFzeW5jIiwic0ZMUFVybCIsInNFcnJvciIsImVycm9yIiwiZG9jdW1lbnQiLCJVUkwiLCJnZXRKYW1VcmwiLCJiSXNFZGl0TW9kZSIsInNKYW1VcmwiLCJydW5uaW5nSW5JZnJhbWUiLCJnZXRGTFBVcmwiLCJzVXJsIiwiU2hhcmVFeHRlbnNpb25PdmVycmlkZSIsImFkYXB0U2hhcmVNZXRhZGF0YSIsIm9TaGFyZU1ldGFkYXRhIiwiYmFzZSIsIm9VSU1vZGVsIiwiZ2V0UHJvcGVydHkiLCJnZXRDb250cm9sbGVyIiwib1BhZ2VUaXRsZUluZm8iLCJfZ2V0UGFnZVRpdGxlSW5mb3JtYXRpb24iLCJvRGF0YSIsInNUaXRsZSIsInRpdGxlIiwic09iamVjdFN1YnRpdGxlIiwic3VidGl0bGUiLCJ0b1N0cmluZyIsInRpbGUiLCJlbWFpbCIsImphbSIsInVybCIsImNvbGxhYm9yYXRpb25JbmZvTW9kZWwiLCJzZXRQcm9wZXJ0eSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiU2hhcmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdHlwZSBTaGFyZSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvU2hhcmVcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IFNlbWFudGljS2V5SGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1NlbWFudGljS2V5SGVscGVyXCI7XG5pbXBvcnQgdHlwZSBPYmplY3RQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9PYmplY3RQYWdlL09iamVjdFBhZ2VDb250cm9sbGVyLmNvbnRyb2xsZXJcIjtcbmltcG9ydCBIYXNoQ2hhbmdlciBmcm9tIFwic2FwL3VpL2NvcmUvcm91dGluZy9IYXNoQ2hhbmdlclwiO1xuaW1wb3J0IEZpbHRlciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlclwiO1xuaW1wb3J0IEZpbHRlck9wZXJhdG9yIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyT3BlcmF0b3JcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuXG5sZXQgYkdsb2JhbElzU3RpY2t5U3VwcG9ydGVkOiBib29sZWFuO1xuXG5mdW5jdGlvbiBjcmVhdGVGaWx0ZXJUb0ZldGNoQWN0aXZlQ29udGV4dChtS2V5VmFsdWVzOiBhbnksIGJJc0FjdGl2ZUVudGl0eURlZmluZWQ6IGFueSkge1xuXHRjb25zdCBhS2V5cyA9IE9iamVjdC5rZXlzKG1LZXlWYWx1ZXMpO1xuXG5cdGNvbnN0IGFGaWx0ZXJzID0gYUtleXMubWFwKGZ1bmN0aW9uIChzS2V5OiBzdHJpbmcpIHtcblx0XHRjb25zdCBzVmFsdWUgPSBtS2V5VmFsdWVzW3NLZXldO1xuXHRcdGlmIChzVmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuIG5ldyBGaWx0ZXIoc0tleSwgRmlsdGVyT3BlcmF0b3IuRVEsIHNWYWx1ZSk7XG5cdFx0fVxuXHR9KTtcblxuXHRpZiAoYklzQWN0aXZlRW50aXR5RGVmaW5lZCkge1xuXHRcdGNvbnN0IG9BY3RpdmVGaWx0ZXIgPSBuZXcgRmlsdGVyKHtcblx0XHRcdGZpbHRlcnM6IFtuZXcgRmlsdGVyKFwiU2libGluZ0VudGl0eS9Jc0FjdGl2ZUVudGl0eVwiLCBGaWx0ZXJPcGVyYXRvci5FUSwgdHJ1ZSldLFxuXHRcdFx0YW5kOiBmYWxzZVxuXHRcdH0pO1xuXG5cdFx0YUZpbHRlcnMucHVzaChvQWN0aXZlRmlsdGVyKTtcblx0fVxuXG5cdHJldHVybiBuZXcgRmlsdGVyKGFGaWx0ZXJzIGFzIGFueSwgdHJ1ZSk7XG59XG5mdW5jdGlvbiBnZXRBY3RpdmVDb250ZXh0UGF0aChvQ29udHJvbGxlcjogYW55LCBzUGFnZUVudGl0eU5hbWU6IGFueSwgb0ZpbHRlcjogYW55KSB7XG5cdGNvbnN0IG9MaXN0QmluZGluZyA9IG9Db250cm9sbGVyXG5cdFx0LmdldFZpZXcoKVxuXHRcdC5nZXRCaW5kaW5nQ29udGV4dCgpXG5cdFx0LmdldE1vZGVsKClcblx0XHQuYmluZExpc3QoYC8ke3NQYWdlRW50aXR5TmFtZX1gLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgb0ZpbHRlciwgeyAkJGdyb3VwSWQ6IFwiJGF1dG8uSGVyb2VzXCIgfSk7XG5cdHJldHVybiBvTGlzdEJpbmRpbmcucmVxdWVzdENvbnRleHRzKDAsIDIpLnRoZW4oZnVuY3Rpb24gKG9Db250ZXh0czogYW55KSB7XG5cdFx0aWYgKG9Db250ZXh0cyAmJiBvQ29udGV4dHMubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gb0NvbnRleHRzWzBdLmdldFBhdGgoKTtcblx0XHR9XG5cdH0pO1xufVxuZnVuY3Rpb24gZ2V0QWN0aXZlQ29udGV4dEluc3RhbmNlcyhvQ29udGV4dDogYW55LCBvQ29udHJvbGxlcjogYW55LCBvRW50aXR5U2V0OiBhbnkpIHtcblx0Y29uc3QgYUFjdGl2ZUNvbnRleHRwcm9taXNlczogYW55W10gPSBbXTtcblx0Y29uc3QgYVBhZ2VzOiBhbnlbXSA9IFtdO1xuXHRsZXQgc01ldGFQYXRoID0gb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKS5nZXRNZXRhUGF0aChvQ29udGV4dC5nZXRQYXRoKCkpO1xuXHRpZiAoc01ldGFQYXRoLmluZGV4T2YoXCIvXCIpID09PSAwKSB7XG5cdFx0c01ldGFQYXRoID0gc01ldGFQYXRoLnN1YnN0cmluZygxKTtcblx0fVxuXHRjb25zdCBhTWV0YVBhdGhBcnJheSA9IHNNZXRhUGF0aC5zcGxpdChcIi9cIik7XG5cdGNvbnN0IHNDdXJyZW50SGFzaE5vUGFyYW1zID0gSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKS5nZXRIYXNoKCkuc3BsaXQoXCI/XCIpWzBdO1xuXHRjb25zdCBhQ3VycmVudEhhc2hBcnJheSA9IHNDdXJyZW50SGFzaE5vUGFyYW1zLnNwbGl0KFwiL1wiKTtcblxuXHQvLyBvUGFnZU1hcCAtIGNyZWF0aW5nIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIG1hcCBvZiBtZXRhcGF0aCBuYW1lIGFuZCBpdCdzIHRlY2huaWNhbCBkZXRhaWxzXG5cdC8vIHdoaWNoIGlzIHJlcXVpcmVkIHRvIGNyZWF0ZSBhIGZpbHRlciB0byBmZXRjaCB0aGUgcmVsYXZhbnQvY29ycmVjdCBhY3RpdmUgY29udGV4dFxuXHQvLyBFeGFtcGxlOiB7U2FsZXNPcmRlck1hbmFnZTp7dGVjaG5pY2FsSUQ6dGVjaG5pY2FsSURWYWx1ZX0sIF9JdGVtOnt0ZWNobmljYWxJRDp0ZWNobmljYWxJRFZhbHVlfX0gZXRjLixcblx0Y29uc3Qgb1BhZ2VNYXA6IGFueSA9IHt9O1xuXHRjb25zdCBhUGFnZUhhc2hBcnJheTogYW55W10gPSBbXTtcblx0YUN1cnJlbnRIYXNoQXJyYXkuZm9yRWFjaChmdW5jdGlvbiAoc1BhZ2VIYXNoOiBhbnkpIHtcblx0XHRjb25zdCBhS2V5VmFsdWVzID0gc1BhZ2VIYXNoLnN1YnN0cmluZyhzUGFnZUhhc2guaW5kZXhPZihcIihcIikgKyAxLCBzUGFnZUhhc2gubGVuZ3RoIC0gMSkuc3BsaXQoXCIsXCIpO1xuXHRcdGNvbnN0IG1LZXlWYWx1ZXM6IGFueSA9IHt9O1xuXHRcdGNvbnN0IHNQYWdlSGFzaE5hbWUgPSBzUGFnZUhhc2guc3BsaXQoXCIoXCIpWzBdO1xuXHRcdG9QYWdlTWFwW3NQYWdlSGFzaE5hbWVdID0ge307XG5cdFx0YVBhZ2VIYXNoQXJyYXkucHVzaChzUGFnZUhhc2hOYW1lKTtcblx0XHRvUGFnZU1hcFtzUGFnZUhhc2hOYW1lXVtcImJJc0FjdGl2ZUVudGl0eURlZmluZWRcIl0gPSB0cnVlO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYUtleVZhbHVlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0Y29uc3Qgc0tleUFzc2lnbm1lbnQgPSBhS2V5VmFsdWVzW2ldO1xuXHRcdFx0Y29uc3QgYVBhcnRzID0gc0tleUFzc2lnbm1lbnQuc3BsaXQoXCI9XCIpO1xuXHRcdFx0bGV0IHNLZXlWYWx1ZSA9IGFQYXJ0c1sxXTtcblx0XHRcdGxldCBzS2V5ID0gYVBhcnRzWzBdO1xuXHRcdFx0Ly8gSW4gY2FzZSBpZiBvbmx5IG9uZSB0ZWNobmljYWwga2V5IGlzIGRlZmluZWQgdGhlbiB0aGUgdXJsIGp1c3QgY29udGFpbnMgdGhlIHRlY2huaWNhbElEVmFsdWUgYnV0IG5vdCB0aGUgdGVjaG5pY2FsSURcblx0XHRcdC8vIEV4YW1wbGU6IFNhbGVzT3JkZXJNYW5hZ2UoSUQ9MTExMTExMjktYWFhYS1iYmJiLWNjY2MtZGRkZGVlZWVmZmZmLElzQWN0aXZlRW50aXR5PWZhbHNlKS9fSXRlbSgxMTExMTEyOS1hYWFhLWJiYmItY2NjYy1kZGRkZWVlZWZmZmYpXG5cdFx0XHQvLyBJbiBhYm92ZSBleGFtcGxlIFNhbGVzT3JkZXJJdGVtIGhhcyBvbmx5IG9uZSB0ZWNobmljYWwga2V5IGRlZmluZWQsIGhlbmNlIHRlY2huaWNhbElEIGluZm8gaXMgbm90IHByZXNlbnQgaW4gdGhlIHVybFxuXHRcdFx0Ly8gSGVuY2UgaW4gc3VjaCBjYXNlcyB3ZSBnZXQgdGVjaG5pY2FsIGtleSBhbmQgdXNlIHRoZW0gdG8gZmV0Y2ggYWN0aXZlIGNvbnRleHRcblx0XHRcdGlmIChzS2V5QXNzaWdubWVudC5pbmRleE9mKFwiPVwiKSA9PT0gLTEpIHtcblx0XHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0XHRcdGNvbnN0IGFUZWNobmljYWxLZXlzID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYC8ke2FQYWdlSGFzaEFycmF5LmpvaW4oXCIvXCIpfS8kVHlwZS8kS2V5YCk7XG5cdFx0XHRcdHNLZXlWYWx1ZSA9IGFQYXJ0c1swXTtcblx0XHRcdFx0c0tleSA9IGFUZWNobmljYWxLZXlzWzBdO1xuXHRcdFx0XHRvUGFnZU1hcFtzUGFnZUhhc2guc3BsaXQoXCIoXCIpWzBdXVtcImJJc0FjdGl2ZUVudGl0eURlZmluZWRcIl0gPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHNLZXkgIT09IFwiSXNBY3RpdmVFbnRpdHlcIikge1xuXHRcdFx0XHRpZiAoc0tleVZhbHVlLmluZGV4T2YoXCInXCIpID09PSAwICYmIHNLZXlWYWx1ZS5sYXN0SW5kZXhPZihcIidcIikgPT09IHNLZXlWYWx1ZS5sZW5ndGggLSAxKSB7XG5cdFx0XHRcdFx0Ly8gUmVtb3ZlIHRoZSBxdW90ZXMgZnJvbSB0aGUgdmFsdWUgYW5kIGRlY29kZSBzcGVjaWFsIGNoYXJzXG5cdFx0XHRcdFx0c0tleVZhbHVlID0gZGVjb2RlVVJJQ29tcG9uZW50KHNLZXlWYWx1ZS5zdWJzdHJpbmcoMSwgc0tleVZhbHVlLmxlbmd0aCAtIDEpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRtS2V5VmFsdWVzW3NLZXldID0gc0tleVZhbHVlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRvUGFnZU1hcFtzUGFnZUhhc2hOYW1lXS5tS2V5VmFsdWVzID0gbUtleVZhbHVlcztcblx0fSk7XG5cblx0bGV0IG9QYWdlRW50aXR5U2V0ID0gb0VudGl0eVNldDtcblx0YU1ldGFQYXRoQXJyYXkuZm9yRWFjaChmdW5jdGlvbiAoc05hdmlnYXRpb25QYXRoOiBhbnkpIHtcblx0XHRjb25zdCBvUGFnZUluZm86IGFueSA9IHt9O1xuXHRcdGNvbnN0IHNQYWdlRW50aXR5U2V0TmFtZSA9IG9QYWdlRW50aXR5U2V0LiROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nICYmIG9QYWdlRW50aXR5U2V0LiROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nW3NOYXZpZ2F0aW9uUGF0aF07XG5cdFx0aWYgKHNQYWdlRW50aXR5U2V0TmFtZSkge1xuXHRcdFx0b1BhZ2VJbmZvLnBhZ2VFbnRpdHlOYW1lID0gb1BhZ2VFbnRpdHlTZXQuJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdbc05hdmlnYXRpb25QYXRoXTtcblx0XHRcdG9QYWdlRW50aXR5U2V0ID0gb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKS5nZXRPYmplY3QoYC8ke3NQYWdlRW50aXR5U2V0TmFtZX1gKSB8fCBvRW50aXR5U2V0O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvUGFnZUluZm8ucGFnZUVudGl0eU5hbWUgPSBzTmF2aWdhdGlvblBhdGg7XG5cdFx0fVxuXHRcdG9QYWdlSW5mby5tS2V5VmFsdWVzID0gb1BhZ2VNYXBbc05hdmlnYXRpb25QYXRoXS5tS2V5VmFsdWVzO1xuXHRcdG9QYWdlSW5mby5iSXNBY3RpdmVFbnRpdHlEZWZpbmVkID0gb1BhZ2VNYXBbc05hdmlnYXRpb25QYXRoXS5iSXNBY3RpdmVFbnRpdHlEZWZpbmVkO1xuXHRcdGFQYWdlcy5wdXNoKG9QYWdlSW5mbyk7XG5cdH0pO1xuXG5cdGFQYWdlcy5mb3JFYWNoKGZ1bmN0aW9uIChvUGFnZUluZm86IGFueSkge1xuXHRcdGNvbnN0IG9GaWx0ZXIgPSBjcmVhdGVGaWx0ZXJUb0ZldGNoQWN0aXZlQ29udGV4dChvUGFnZUluZm8ubUtleVZhbHVlcywgb1BhZ2VJbmZvLmJJc0FjdGl2ZUVudGl0eURlZmluZWQpO1xuXHRcdGFBY3RpdmVDb250ZXh0cHJvbWlzZXMucHVzaChnZXRBY3RpdmVDb250ZXh0UGF0aChvQ29udHJvbGxlciwgb1BhZ2VJbmZvLnBhZ2VFbnRpdHlOYW1lLCBvRmlsdGVyKSk7XG5cdH0pO1xuXG5cdHJldHVybiBhQWN0aXZlQ29udGV4dHByb21pc2VzO1xufVxuXG4vKipcbiAqIE1ldGhvZCB0byBmZXRjaCBhY3RpdmUgY29udGV4dCBwYXRoJ3MuXG4gKlxuICogQHBhcmFtIG9Db250ZXh0IFRoZSBQYWdlIENvbnRleHRcbiAqIEBwYXJhbSBvQ29udHJvbGxlclxuICogQHJldHVybnMgUHJvbWlzZSB3aGljaCBpcyByZXNvbHZlZCBvbmNlIHRoZSBhY3RpdmUgY29udGV4dCdzIGFyZSBmZXRjaGVkXG4gKi9cbmZ1bmN0aW9uIGdldEFjdGl2ZUNvbnRleHRQYXRocyhvQ29udGV4dDogYW55LCBvQ29udHJvbGxlcjogYW55KSB7XG5cdGNvbnN0IHNDdXJyZW50SGFzaE5vUGFyYW1zID0gSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKS5nZXRIYXNoKCkuc3BsaXQoXCI/XCIpWzBdO1xuXHRsZXQgc1Jvb3RFbnRpdHlOYW1lID0gc0N1cnJlbnRIYXNoTm9QYXJhbXMgJiYgc0N1cnJlbnRIYXNoTm9QYXJhbXMuc3Vic3RyKDAsIHNDdXJyZW50SGFzaE5vUGFyYW1zLmluZGV4T2YoXCIoXCIpKTtcblx0aWYgKHNSb290RW50aXR5TmFtZS5pbmRleE9mKFwiL1wiKSA9PT0gMCkge1xuXHRcdHNSb290RW50aXR5TmFtZSA9IHNSb290RW50aXR5TmFtZS5zdWJzdHJpbmcoMSk7XG5cdH1cblx0Y29uc3Qgb0VudGl0eVNldCA9IG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkuZ2V0T2JqZWN0KGAvJHtzUm9vdEVudGl0eU5hbWV9YCk7XG5cdGNvbnN0IG9QYWdlQ29udGV4dCA9IG9Db250ZXh0O1xuXHRjb25zdCBhQWN0aXZlQ29udGV4dHByb21pc2VzID0gZ2V0QWN0aXZlQ29udGV4dEluc3RhbmNlcyhvQ29udGV4dCwgb0NvbnRyb2xsZXIsIG9FbnRpdHlTZXQpO1xuXHRpZiAoYUFjdGl2ZUNvbnRleHRwcm9taXNlcy5sZW5ndGggPiAwKSB7XG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKGFBY3RpdmVDb250ZXh0cHJvbWlzZXMpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoYURhdGE6IGFueVtdKSB7XG5cdFx0XHRcdGNvbnN0IGFBY3RpdmVDb250ZXh0UGF0aHMgPSBbXTtcblx0XHRcdFx0bGV0IG9QYWdlRW50aXR5U2V0ID0gb0VudGl0eVNldDtcblx0XHRcdFx0aWYgKGFEYXRhWzBdLmluZGV4T2YoXCIvXCIpID09PSAwKSB7XG5cdFx0XHRcdFx0YUFjdGl2ZUNvbnRleHRQYXRocy5wdXNoKGFEYXRhWzBdLnN1YnN0cmluZygxKSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YUFjdGl2ZUNvbnRleHRQYXRocy5wdXNoKGFEYXRhWzBdKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBJbiB0aGUgYWN0aXZlIGNvbnRleHQgcGF0aHMgaWRlbnRpZnkgYW5kIHJlcGxhY2UgdGhlIGVudGl0eVNldCBOYW1lIHdpdGggY29ycmVzcG9uZGluZyBuYXZpZ2F0aW9uIHByb3BlcnR5IG5hbWVcblx0XHRcdFx0Ly8gUmVxdWlyZWQgdG8gZm9ybSB0aGUgdXJsIHBvaW50aW5nIHRvIGFjdGl2ZSBjb250ZXh0XG5cdFx0XHRcdC8vIEV4YW1wbGUgOiBTYWxlc09yZGVySXRlbSAtLT4gX0l0ZW0sIE1hdGVyaWFsRGV0YWlscyAtLT4gX01hdGVyaWFsRGV0YWlscyBldGMuLFxuXHRcdFx0XHRmb3IgKGxldCBpID0gMTsgaSA8IGFEYXRhLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0bGV0IHNBY3RpdmVDb250ZXh0UGF0aCA9IGFEYXRhW2ldO1xuXHRcdFx0XHRcdGxldCBzTmF2aWdhdGlvUHJvcGVydHkgPSBcIlwiO1xuXHRcdFx0XHRcdGxldCBzRW50aXR5U2V0TmFtZSA9IHNBY3RpdmVDb250ZXh0UGF0aCAmJiBzQWN0aXZlQ29udGV4dFBhdGguc3Vic3RyKDAsIHNBY3RpdmVDb250ZXh0UGF0aC5pbmRleE9mKFwiKFwiKSk7XG5cdFx0XHRcdFx0aWYgKHNFbnRpdHlTZXROYW1lLmluZGV4T2YoXCIvXCIpID09PSAwKSB7XG5cdFx0XHRcdFx0XHRzRW50aXR5U2V0TmFtZSA9IHNFbnRpdHlTZXROYW1lLnN1YnN0cmluZygxKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHNBY3RpdmVDb250ZXh0UGF0aC5pbmRleE9mKFwiL1wiKSA9PT0gMCkge1xuXHRcdFx0XHRcdFx0c0FjdGl2ZUNvbnRleHRQYXRoID0gc0FjdGl2ZUNvbnRleHRQYXRoLnN1YnN0cmluZygxKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0c05hdmlnYXRpb1Byb3BlcnR5ID0gT2JqZWN0LmtleXMob1BhZ2VFbnRpdHlTZXQuJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcpW1xuXHRcdFx0XHRcdFx0T2JqZWN0LnZhbHVlcyhvUGFnZUVudGl0eVNldC4kTmF2aWdhdGlvblByb3BlcnR5QmluZGluZykuaW5kZXhPZihzRW50aXR5U2V0TmFtZSlcblx0XHRcdFx0XHRdO1xuXHRcdFx0XHRcdGlmIChzTmF2aWdhdGlvUHJvcGVydHkpIHtcblx0XHRcdFx0XHRcdGFBY3RpdmVDb250ZXh0UGF0aHMucHVzaChzQWN0aXZlQ29udGV4dFBhdGgucmVwbGFjZShzRW50aXR5U2V0TmFtZSwgc05hdmlnYXRpb1Byb3BlcnR5KSk7XG5cdFx0XHRcdFx0XHRvUGFnZUVudGl0eVNldCA9IG9QYWdlQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLmdldE9iamVjdChgLyR7c0VudGl0eVNldE5hbWV9YCkgfHwgb0VudGl0eVNldDtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0YUFjdGl2ZUNvbnRleHRQYXRocy5wdXNoKHNBY3RpdmVDb250ZXh0UGF0aCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBhQWN0aXZlQ29udGV4dFBhdGhzO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0TG9nLmluZm8oXCJGYWlsZWQgdG8gcmV0cmlldmUgb25lIG9yIG1vcmUgYWN0aXZlIGNvbnRleHQgcGF0aCdzXCIsIG9FcnJvcik7XG5cdFx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdH1cbn1cbmZ1bmN0aW9uIGZldGNoQWN0aXZlQ29udGV4dFBhdGhzKG9Db250ZXh0OiBhbnksIG9Db250cm9sbGVyOiBhbnkpIHtcblx0bGV0IG9Qcm9taXNlLCBhU2VtYW50aWNLZXlzO1xuXHRjb25zdCBzQ3VycmVudEhhc2hOb1BhcmFtcyA9IEhhc2hDaGFuZ2VyLmdldEluc3RhbmNlKCkuZ2V0SGFzaCgpLnNwbGl0KFwiP1wiKVswXTtcblx0aWYgKG9Db250ZXh0KSB7XG5cdFx0Y29uc3Qgb01vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKTtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdGJHbG9iYWxJc1N0aWNreVN1cHBvcnRlZCA9IE1vZGVsSGVscGVyLmlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZChvTWV0YU1vZGVsKTtcblx0XHRsZXQgc1Jvb3RFbnRpdHlOYW1lID0gc0N1cnJlbnRIYXNoTm9QYXJhbXMgJiYgc0N1cnJlbnRIYXNoTm9QYXJhbXMuc3Vic3RyKDAsIHNDdXJyZW50SGFzaE5vUGFyYW1zLmluZGV4T2YoXCIoXCIpKTtcblx0XHRpZiAoc1Jvb3RFbnRpdHlOYW1lLmluZGV4T2YoXCIvXCIpID09PSAwKSB7XG5cdFx0XHRzUm9vdEVudGl0eU5hbWUgPSBzUm9vdEVudGl0eU5hbWUuc3Vic3RyaW5nKDEpO1xuXHRcdH1cblx0XHRhU2VtYW50aWNLZXlzID0gU2VtYW50aWNLZXlIZWxwZXIuZ2V0U2VtYW50aWNLZXlzKG9NZXRhTW9kZWwsIHNSb290RW50aXR5TmFtZSk7XG5cdH1cblx0Ly8gRmV0Y2ggYWN0aXZlIGNvbnRleHQgZGV0YWlscyBpbmNhc2Ugb2YgYmVsb3cgc2NlbmFyaW8ncyh3aGVyZSBwYWdlIGlzIG5vdCBzdGlja3kgc3VwcG9ydGVkKHdlIGRvIG5vdCBoYXZlIGRyYWZ0IGluc3RhbmNlKSlcblx0Ly8gMS4gSW4gY2FzZSBvZiBkcmFmdCBlbmFibGVkIE9iamVjdCBwYWdlIHdoZXJlIHNlbWFudGljIGtleSBiYXNlZCBVUkwgaXMgbm90IHBvc3NpYmxlKGxpa2Ugc2VtYW50aWMga2V5cyBhcmUgbm90IG1vZGVsZWQgaW4gdGhlIGVudGl0eSBzZXQpXG5cdC8vIDIuIEluIGNhc2Ugb2YgZHJhZnQgZW5hYmxlZCBTdWIgT2JqZWN0IFBhZ2VzICh3aGVyZSBzZW1hbnRpYyBib29rbWFya2luZyBpcyBub3Qgc3VwcG9ydGVkKVxuXHRjb25zdCBvVmlld0RhdGEgPSBvQ29udHJvbGxlci5nZXRWaWV3KCkuZ2V0Vmlld0RhdGEoKTtcblx0aWYgKG9Db250ZXh0ICYmICFiR2xvYmFsSXNTdGlja3lTdXBwb3J0ZWQgJiYgKChvVmlld0RhdGEudmlld0xldmVsID09PSAxICYmICFhU2VtYW50aWNLZXlzKSB8fCBvVmlld0RhdGEudmlld0xldmVsID49IDIpKSB7XG5cdFx0b1Byb21pc2UgPSBnZXRBY3RpdmVDb250ZXh0UGF0aHMob0NvbnRleHQsIG9Db250cm9sbGVyKTtcblx0XHRyZXR1cm4gb1Byb21pc2U7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9XG59XG5cbi8vIC8qKlxuLy8gICogR2V0IHNoYXJlIFVSTC5cbi8vICAqIEBwYXJhbSBiSXNFZGl0YWJsZVxuLy8gICogQHBhcmFtIGJJc1N0aWNreVN1cHBvcnRlZFxuLy8gICogQHBhcmFtIGFBY3RpdmVDb250ZXh0UGF0aHNcbi8vICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzaGFyZSBVUkxcbi8vICAqIEBwcm90ZWN0ZWRcbi8vICAqIEBzdGF0aWNcbi8vICAqL1xuZnVuY3Rpb24gZ2V0U2hhcmVVcmwoYklzRWRpdGFibGU6IGFueSwgYklzU3RpY2t5U3VwcG9ydGVkOiBhbnksIGFBY3RpdmVDb250ZXh0UGF0aHM6IGFueSkge1xuXHRsZXQgc1NoYXJlVXJsO1xuXHRjb25zdCBzSGFzaCA9IEhhc2hDaGFuZ2VyLmdldEluc3RhbmNlKCkuZ2V0SGFzaCgpO1xuXHRjb25zdCBzQmFzZVBhdGggPSAoSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKSBhcyBhbnkpLmhyZWZGb3JBcHBTcGVjaWZpY0hhc2hcblx0XHQ/IChIYXNoQ2hhbmdlci5nZXRJbnN0YW5jZSgpIGFzIGFueSkuaHJlZkZvckFwcFNwZWNpZmljSGFzaChcIlwiKVxuXHRcdDogXCJcIjtcblx0aWYgKGJJc0VkaXRhYmxlICYmICFiSXNTdGlja3lTdXBwb3J0ZWQgJiYgYUFjdGl2ZUNvbnRleHRQYXRocykge1xuXHRcdHNTaGFyZVVybCA9IHNCYXNlUGF0aCArIGFBY3RpdmVDb250ZXh0UGF0aHMuam9pbihcIi9cIik7XG5cdH0gZWxzZSB7XG5cdFx0c1NoYXJlVXJsID0gc0hhc2ggPyBzQmFzZVBhdGggKyBzSGFzaCA6IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuXHR9XG5cdHJldHVybiB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgd2luZG93LmxvY2F0aW9uLnNlYXJjaCArIHNTaGFyZVVybDtcbn1cbmZ1bmN0aW9uIGdldFNoYXJlRW1haWxVcmwoKSB7XG5cdGNvbnN0IG9VU2hlbGxDb250YWluZXIgPSBzYXAudXNoZWxsICYmIHNhcC51c2hlbGwuQ29udGFpbmVyO1xuXHRpZiAob1VTaGVsbENvbnRhaW5lcikge1xuXHRcdHJldHVybiBvVVNoZWxsQ29udGFpbmVyXG5cdFx0XHQuZ2V0RkxQVXJsQXN5bmModHJ1ZSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChzRkxQVXJsOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIHNGTFBVcmw7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChzRXJyb3I6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJDb3VsZCBub3QgcmV0cmlldmUgY0ZMUCBVUkwgZm9yIHRoZSBzaGFyaW5nIGRpYWxvZyAoZGlhbG9nIHdpbGwgbm90IGJlIG9wZW5lZClcIiwgc0Vycm9yKTtcblx0XHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoZG9jdW1lbnQuVVJMKTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRKYW1VcmwoYklzRWRpdE1vZGU6IGJvb2xlYW4sIGJJc1N0aWNreVN1cHBvcnRlZDogYW55LCBhQWN0aXZlQ29udGV4dFBhdGhzOiBhbnkpIHtcblx0bGV0IHNKYW1Vcmw6IHN0cmluZztcblx0Y29uc3Qgc0hhc2ggPSBIYXNoQ2hhbmdlci5nZXRJbnN0YW5jZSgpLmdldEhhc2goKTtcblx0Y29uc3Qgc0Jhc2VQYXRoID0gKEhhc2hDaGFuZ2VyLmdldEluc3RhbmNlKCkgYXMgYW55KS5ocmVmRm9yQXBwU3BlY2lmaWNIYXNoXG5cdFx0PyAoSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKSBhcyBhbnkpLmhyZWZGb3JBcHBTcGVjaWZpY0hhc2goXCJcIilcblx0XHQ6IFwiXCI7XG5cdGlmIChiSXNFZGl0TW9kZSAmJiAhYklzU3RpY2t5U3VwcG9ydGVkICYmIGFBY3RpdmVDb250ZXh0UGF0aHMpIHtcblx0XHRzSmFtVXJsID0gc0Jhc2VQYXRoICsgYUFjdGl2ZUNvbnRleHRQYXRocy5qb2luKFwiL1wiKTtcblx0fSBlbHNlIHtcblx0XHRzSmFtVXJsID0gc0hhc2ggPyBzQmFzZVBhdGggKyBzSGFzaCA6IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuXHR9XG5cdC8vIGluIGNhc2Ugd2UgYXJlIGluIGNGTFAgc2NlbmFyaW8sIHRoZSBhcHBsaWNhdGlvbiBpcyBydW5uaW5nXG5cdC8vIGluc2lkZSBhbiBpZnJhbWUsIGFuZCB0aGVyZSBmb3Igd2UgbmVlZCB0byBnZXQgdGhlIGNGTFAgVVJMXG5cdC8vIGFuZCBub3QgJ2RvY3VtZW50LlVSTCcgdGhhdCByZXByZXNlbnRzIHRoZSBpZnJhbWUgVVJMXG5cdGlmIChzYXAudXNoZWxsICYmIHNhcC51c2hlbGwuQ29udGFpbmVyICYmIHNhcC51c2hlbGwuQ29udGFpbmVyLnJ1bm5pbmdJbklmcmFtZSAmJiBzYXAudXNoZWxsLkNvbnRhaW5lci5ydW5uaW5nSW5JZnJhbWUoKSkge1xuXHRcdHNhcC51c2hlbGwuQ29udGFpbmVyLmdldEZMUFVybCh0cnVlKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHNVcmw6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gc1VybC5zdWJzdHIoMCwgc1VybC5pbmRleE9mKFwiI1wiKSkgKyBzSmFtVXJsO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoc0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiQ291bGQgbm90IHJldHJpZXZlIGNGTFAgVVJMIGZvciB0aGUgc2hhcmluZyBkaWFsb2cgKGRpYWxvZyB3aWxsIG5vdCBiZSBvcGVuZWQpXCIsIHNFcnJvcik7XG5cdFx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyBzSmFtVXJsKTtcblx0fVxufVxuXG5jb25zdCBTaGFyZUV4dGVuc2lvbk92ZXJyaWRlID0ge1xuXHRhZGFwdFNoYXJlTWV0YWRhdGE6IGFzeW5jIGZ1bmN0aW9uICh0aGlzOiBTaGFyZSwgb1NoYXJlTWV0YWRhdGE6IGFueSkge1xuXHRcdGNvbnN0IG9Db250ZXh0ID0gdGhpcy5iYXNlLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdGNvbnN0IG9VSU1vZGVsID0gdGhpcy5iYXNlLmdldFZpZXcoKS5nZXRNb2RlbChcInVpXCIpO1xuXHRcdGNvbnN0IGJJc0VkaXRhYmxlID0gb1VJTW9kZWwuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKTtcblxuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBhQWN0aXZlQ29udGV4dFBhdGhzID0gYXdhaXQgZmV0Y2hBY3RpdmVDb250ZXh0UGF0aHMob0NvbnRleHQsIHRoaXMuYmFzZS5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpKTtcblx0XHRcdGNvbnN0IG9QYWdlVGl0bGVJbmZvID0gKHRoaXMuYmFzZS5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIE9iamVjdFBhZ2VDb250cm9sbGVyKS5fZ2V0UGFnZVRpdGxlSW5mb3JtYXRpb24oKTtcblx0XHRcdGNvbnN0IG9EYXRhID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuXHRcdFx0XHRnZXRKYW1VcmwoYklzRWRpdGFibGUsIGJHbG9iYWxJc1N0aWNreVN1cHBvcnRlZCwgYUFjdGl2ZUNvbnRleHRQYXRocyksXG5cdFx0XHRcdGdldFNoYXJlVXJsKGJJc0VkaXRhYmxlLCBiR2xvYmFsSXNTdGlja3lTdXBwb3J0ZWQsIGFBY3RpdmVDb250ZXh0UGF0aHMpLFxuXHRcdFx0XHRnZXRTaGFyZUVtYWlsVXJsKClcblx0XHRcdF0pO1xuXG5cdFx0XHRsZXQgc1RpdGxlID0gb1BhZ2VUaXRsZUluZm8udGl0bGU7XG5cdFx0XHRjb25zdCBzT2JqZWN0U3VidGl0bGUgPSBvUGFnZVRpdGxlSW5mby5zdWJ0aXRsZSA/IG9QYWdlVGl0bGVJbmZvLnN1YnRpdGxlLnRvU3RyaW5nKCkgOiBcIlwiO1xuXHRcdFx0aWYgKHNPYmplY3RTdWJ0aXRsZSkge1xuXHRcdFx0XHRzVGl0bGUgPSBgJHtzVGl0bGV9IC0gJHtzT2JqZWN0U3VidGl0bGV9YDtcblx0XHRcdH1cblx0XHRcdG9TaGFyZU1ldGFkYXRhLnRpbGUgPSB7XG5cdFx0XHRcdHRpdGxlOiBvUGFnZVRpdGxlSW5mby50aXRsZSxcblx0XHRcdFx0c3VidGl0bGU6IHNPYmplY3RTdWJ0aXRsZVxuXHRcdFx0fTtcblx0XHRcdG9TaGFyZU1ldGFkYXRhLmVtYWlsLnRpdGxlID0gc1RpdGxlO1xuXHRcdFx0b1NoYXJlTWV0YWRhdGEudGl0bGUgPSBzVGl0bGU7XG5cdFx0XHRvU2hhcmVNZXRhZGF0YS5qYW0udXJsID0gb0RhdGFbMF07XG5cdFx0XHRvU2hhcmVNZXRhZGF0YS51cmwgPSBvRGF0YVsxXTtcblx0XHRcdG9TaGFyZU1ldGFkYXRhLmVtYWlsLnVybCA9IG9EYXRhWzJdO1xuXHRcdFx0Ly8gTVMgVGVhbXMgY29sbGFib3JhdGlvbiBkb2VzIG5vdCB3YW50IHRvIGFsbG93IGZ1cnRoZXIgY2hhbmdlcyB0byB0aGUgVVJMXG5cdFx0XHQvLyBzbyB1cGRhdGUgY29sbG9ib3JhdGlvbkluZm8gbW9kZWwgYXQgTFIgb3ZlcnJpZGUgdG8gaWdub3JlIGZ1cnRoZXIgZXh0ZW5zaW9uIGNoYW5nZXMgYXQgbXVsdGlwbGUgbGV2ZWxzXG5cdFx0XHRjb25zdCBjb2xsYWJvcmF0aW9uSW5mb01vZGVsOiBKU09OTW9kZWwgPSB0aGlzLmJhc2UuZ2V0VmlldygpLmdldE1vZGVsKFwiY29sbGFib3JhdGlvbkluZm9cIikgYXMgSlNPTk1vZGVsO1xuXHRcdFx0Y29sbGFib3JhdGlvbkluZm9Nb2RlbC5zZXRQcm9wZXJ0eShcIi91cmxcIiwgb1NoYXJlTWV0YWRhdGEudXJsKTtcblx0XHRcdGNvbGxhYm9yYXRpb25JbmZvTW9kZWwuc2V0UHJvcGVydHkoXCIvYXBwVGl0bGVcIiwgb1NoYXJlTWV0YWRhdGEudGl0bGUpO1xuXHRcdFx0Y29sbGFib3JhdGlvbkluZm9Nb2RlbC5zZXRQcm9wZXJ0eShcIi9zdWJUaXRsZVwiLCBzT2JqZWN0U3VidGl0bGUpO1xuXHRcdH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcblx0XHRcdExvZy5lcnJvcihlcnJvcik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9TaGFyZU1ldGFkYXRhO1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBTaGFyZUV4dGVuc2lvbk92ZXJyaWRlO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBVUEsSUFBSUEsd0JBQWlDO0VBRXJDLFNBQVNDLGdDQUFnQyxDQUFDQyxVQUFlLEVBQUVDLHNCQUEyQixFQUFFO0lBQ3ZGLE1BQU1DLEtBQUssR0FBR0MsTUFBTSxDQUFDQyxJQUFJLENBQUNKLFVBQVUsQ0FBQztJQUVyQyxNQUFNSyxRQUFRLEdBQUdILEtBQUssQ0FBQ0ksR0FBRyxDQUFDLFVBQVVDLElBQVksRUFBRTtNQUNsRCxNQUFNQyxNQUFNLEdBQUdSLFVBQVUsQ0FBQ08sSUFBSSxDQUFDO01BQy9CLElBQUlDLE1BQU0sS0FBS0MsU0FBUyxFQUFFO1FBQ3pCLE9BQU8sSUFBSUMsTUFBTSxDQUFDSCxJQUFJLEVBQUVJLGNBQWMsQ0FBQ0MsRUFBRSxFQUFFSixNQUFNLENBQUM7TUFDbkQ7SUFDRCxDQUFDLENBQUM7SUFFRixJQUFJUCxzQkFBc0IsRUFBRTtNQUMzQixNQUFNWSxhQUFhLEdBQUcsSUFBSUgsTUFBTSxDQUFDO1FBQ2hDSSxPQUFPLEVBQUUsQ0FBQyxJQUFJSixNQUFNLENBQUMsOEJBQThCLEVBQUVDLGNBQWMsQ0FBQ0MsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzlFRyxHQUFHLEVBQUU7TUFDTixDQUFDLENBQUM7TUFFRlYsUUFBUSxDQUFDVyxJQUFJLENB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