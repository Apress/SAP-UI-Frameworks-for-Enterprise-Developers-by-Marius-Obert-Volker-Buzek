/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/model/Filter", "sap/ui/model/FilterOperator", "./ModelHelper"], function (Filter, FilterOperator, ModelHelper) {
  "use strict";

  const AppStartupHelper = {
    /**
     * Retrieves a set of key values from startup parameters.
     *
     * @param aKeyNames The array of key names
     * @param oStartupParameters The startup parameters
     * @returns An array of pairs \{name, value\} if all key values could be found in the startup parameters, undefined otherwise
     */
    _getKeysFromStartupParams: function (aKeyNames, oStartupParameters) {
      let bAllFound = true;
      const aKeys = aKeyNames.map(name => {
        if (oStartupParameters[name] && oStartupParameters[name].length === 1) {
          return {
            name,
            value: oStartupParameters[name][0]
          };
        } else {
          // A unique key value couldn't be found in the startup parameters
          bAllFound = false;
          return {
            name,
            value: ""
          };
        }
      });
      return bAllFound ? aKeys : undefined;
    },
    /**
     * Creates a filter from a list of key values.
     *
     * @param aKeys Array of semantic keys or technical keys (with values)
     * @param bDraftMode True if the entity supports draft mode
     * @param oMetaModel The metamodel
     * @returns The filter
     */
    _createFilterFromKeys: function (aKeys, bDraftMode, oMetaModel) {
      const bFilterCaseSensitive = ModelHelper.isFilteringCaseSensitive(oMetaModel);
      let bFilterOnActiveEntity = false;
      const aFilters = aKeys.map(key => {
        if (key.name === "IsActiveEntity") {
          bFilterOnActiveEntity = true;
        }
        return new Filter({
          path: key.name,
          operator: FilterOperator.EQ,
          value1: key.value,
          caseSensitive: bFilterCaseSensitive
        });
      });
      if (bDraftMode && !bFilterOnActiveEntity) {
        const oDraftFilter = new Filter({
          filters: [new Filter("IsActiveEntity", "EQ", false), new Filter("SiblingEntity/IsActiveEntity", "EQ", null)],
          and: false
        });
        aFilters.push(oDraftFilter);
      }
      return new Filter(aFilters, true);
    },
    /**
     * Loads all contexts for a list of page infos.
     *
     * @param aStartupPages The list of page infos
     * @param oModel The model used to load the contexts
     * @returns A Promise for all contexts
     */
    _requestObjectsFromParameters: function (aStartupPages, oModel) {
      // Load the respective objects for all object pages found in aExternallyNavigablePages
      const aContextPromises = aStartupPages.map(pageInfo => {
        const aKeys = pageInfo.semanticKeys || pageInfo.technicalKeys || [];
        const oFilter = this._createFilterFromKeys(aKeys, pageInfo.draftMode, oModel.getMetaModel());

        // only request a minimum of fields to boost backend performance since this is only used to check if an object exists
        const oListBind = oModel.bindList(pageInfo.contextPath, undefined, undefined, oFilter, {
          $select: aKeys.map(key => {
            return key.name;
          }).join(",")
        });
        return oListBind.requestContexts(0, 2);
      });
      return Promise.all(aContextPromises);
    },
    /**
     * Creates a PageInfo from a route if it's reachable from the startup parameters.
     *
     * @param oRoute The route
     * @param oManifestRouting The app manifest routing section
     * @param oStartupParameters The startup parameters
     * @param oMetaModel The app metamodel
     * @returns A page info if the page is reachable, undefined otherwise
     */
    _getReachablePageInfoFromRoute: function (oRoute, oManifestRouting, oStartupParameters, oMetaModel) {
      var _oTarget$options, _oTarget$options$sett;
      // Remove trailing ':?query:' and '/'
      let sPattern = oRoute.pattern.replace(":?query:", "");
      sPattern = sPattern.replace(/\/$/, "");
      if (!sPattern || !sPattern.endsWith(")")) {
        // Ignore level-0 routes (ListReport) or routes corresponding to a 1-1 relation (no keys in the URL in this case)
        return undefined;
      }
      sPattern = sPattern.replace(/\(\{[^}]*\}\)/g, "(#)"); // Replace keys with #

      // Get the rightmost target for this route
      const sTargetName = Array.isArray(oRoute.target) ? oRoute.target[oRoute.target.length - 1] : oRoute.target;
      const oTarget = oManifestRouting.targets[sTargetName];
      const aPatternSegments = sPattern.split("/");
      const pageLevel = aPatternSegments.length - 1;
      if (pageLevel !== 0 && (oTarget === null || oTarget === void 0 ? void 0 : (_oTarget$options = oTarget.options) === null || _oTarget$options === void 0 ? void 0 : (_oTarget$options$sett = _oTarget$options.settings) === null || _oTarget$options$sett === void 0 ? void 0 : _oTarget$options$sett.allowDeepLinking) !== true) {
        // The first level of object page allows deep linking by default.
        // Otherwise, the target must allow deep linking explicitely in the manifest
        return undefined;
      }
      const sContextPath = oTarget.options.settings.contextPath || oTarget.options.settings.entitySet && `/${oTarget.options.settings.entitySet}`;
      const oEntityType = sContextPath && oMetaModel.getObject(`/$EntityContainer${sContextPath}/`);
      if (!oEntityType) {
        return undefined;
      }

      // Get the semantic key values for the entity
      const aSemanticKeyNames = oMetaModel.getObject(`/$EntityContainer${sContextPath}/@com.sap.vocabularies.Common.v1.SemanticKey`);
      const aSemantickKeys = aSemanticKeyNames ? this._getKeysFromStartupParams(aSemanticKeyNames.map(semKey => {
        return semKey.$PropertyPath;
      }), oStartupParameters) : undefined;

      // Get the technical keys only if we couldn't find the semantic key values, and on first level OP
      const aTechnicalKeys = !aSemantickKeys && pageLevel === 0 ? this._getKeysFromStartupParams(oEntityType["$Key"], oStartupParameters) : undefined;
      if (aSemantickKeys === undefined && aTechnicalKeys === undefined) {
        // We couldn't find the semantic/technical keys in the startup parameters
        return undefined;
      }

      // The startup parameters contain values for all semantic keys (or technical keys) --> we can store the page info in the corresponding level
      const draftMode = oMetaModel.getObject(`/$EntityContainer${sContextPath}@com.sap.vocabularies.Common.v1.DraftRoot`) || oMetaModel.getObject(`/$EntityContainer${sContextPath}@com.sap.vocabularies.Common.v1.DraftNode`) ? true : false;
      return {
        pattern: sPattern,
        contextPath: sContextPath,
        draftMode,
        technicalKeys: aTechnicalKeys,
        semanticKeys: aSemantickKeys,
        target: sTargetName,
        pageLevel
      };
    },
    /**
     * Returns the list of all pages that allow deeplink and that can be reached using the startup parameters.
     *
     * @param oManifestRouting The routing information from the app manifest
     * @param oStartupParameters The startup parameters
     * @param oMetaModel The metamodel
     * @returns The reachable pages
     */
    _getReachablePages: function (oManifestRouting, oStartupParameters, oMetaModel) {
      const aRoutes = oManifestRouting.routes;
      const mPagesByLevel = {};
      aRoutes.forEach(oRoute => {
        const oPageInfo = this._getReachablePageInfoFromRoute(oRoute, oManifestRouting, oStartupParameters, oMetaModel);
        if (oPageInfo) {
          if (!mPagesByLevel[oPageInfo.pageLevel]) {
            mPagesByLevel[oPageInfo.pageLevel] = [];
          }
          mPagesByLevel[oPageInfo.pageLevel].push(oPageInfo);
        }
      });

      // A page is reachable only if all its parents are also reachable
      // So if we couldn't find any pages for a given level, all pages with a higher level won't be reachable anyway
      const aReachablePages = [];
      let level = 0;
      while (mPagesByLevel[level]) {
        aReachablePages.push(mPagesByLevel[level]);
        level++;
      }
      return aReachablePages;
    },
    /**
     * Get the list of startup pages.
     *
     * @param oManifestRouting The routing information from the app manifest
     * @param oStartupParameters The startup parameters
     * @param oMetaModel The metamodel
     * @returns An array of startup page infos
     */
    _getStartupPagesFromStartupParams: function (oManifestRouting, oStartupParameters, oMetaModel) {
      // Find all pages that can be reached with the startup parameters
      const aReachablePages = this._getReachablePages(oManifestRouting, oStartupParameters, oMetaModel);
      if (aReachablePages.length === 0) {
        return [];
      }

      // Find the longest sequence of pages that can be reached (recursively)
      let result = [];
      const current = [];
      function findRecursive(level) {
        const aCurrentLevelPages = aReachablePages[level];
        const lastPage = current.length ? current[current.length - 1] : undefined;
        if (aCurrentLevelPages) {
          aCurrentLevelPages.forEach(function (nextPage) {
            if (!lastPage || nextPage.pattern.indexOf(lastPage.pattern) === 0) {
              // We only consider pages that can be reached from the page at the previous level,
              // --> their pattern must be the pattern of the previous page with another segment appended
              current.push(nextPage);
              findRecursive(level + 1);
              current.pop();
            }
          });
        }
        if (current.length > result.length) {
          result = current.slice(); // We have found a sequence longer than our previous best --> store it as the new longest
        }
      }

      findRecursive(0);
      return result;
    },
    /**
     * Creates the startup object from the list of pages and contexts.
     *
     * @param aStartupPages The pages
     * @param aContexts The contexts
     * @returns An object containing either a hash or a context to navigate to, or an empty object if no deep link was found
     */
    _getDeepLinkObject: function (aStartupPages, aContexts) {
      if (aContexts.length === 1) {
        return {
          context: aContexts[0]
        };
      } else if (aContexts.length > 1) {
        // Navigation to a deeper level --> use the pattern of the deepest object page
        // and replace the parameters by the ID from the contexts
        let hash = aStartupPages[aStartupPages.length - 1].pattern;
        aContexts.forEach(function (oContext) {
          hash = hash.replace("(#)", `(${oContext.getPath().split("(")[1]}`);
        });
        return {
          hash
        };
      } else {
        return {};
      }
    },
    /**
     * Calculates startup parameters for a deeplink case, from startup parameters and routing infoirmation.
     *
     * @param oManifestRouting The routing information from the app manifest
     * @param oStartupParameters The startup parameters
     * @param oModel The OData model
     * @returns An object containing either a hash or a context to navigate to, or an empty object if no deep link was found
     */
    getDeepLinkStartupHash: function (oManifestRouting, oStartupParameters, oModel) {
      let aStartupPages;
      return oModel.getMetaModel().requestObject("/$EntityContainer/").then(() => {
        // Check if semantic keys are present in url parameters for every object page at each level
        aStartupPages = this._getStartupPagesFromStartupParams(oManifestRouting, oStartupParameters, oModel.getMetaModel());
        return this._requestObjectsFromParameters(aStartupPages, oModel);
      }).then(aValues => {
        if (aValues.length) {
          // Make sure we only get 1 context per promise, and flatten the array
          const aContexts = [];
          aValues.forEach(function (aFoundContexts) {
            if (aFoundContexts.length === 1) {
              aContexts.push(aFoundContexts[0]);
            }
          });
          return aContexts.length === aValues.length ? this._getDeepLinkObject(aStartupPages, aContexts) : {};
        } else {
          return {};
        }
      });
    },
    /**
     * Calculates the new hash based on the startup parameters.
     *
     * @param oStartupParameters The startup parameter values (map parameter name -> array of values)
     * @param sContextPath The context path for the startup of the app (generally the path to the main entity set)
     * @param oRouter The router instance
     * @param oMetaModel The meta model
     * @returns A promise containing the hash to navigate to, or an empty string if there's no need to navigate
     */
    getCreateStartupHash: function (oStartupParameters, sContextPath, oRouter, oMetaModel) {
      return oMetaModel.requestObject(`${sContextPath}@`).then(oEntitySetAnnotations => {
        let sMetaPath = "";
        let bCreatable = true;
        if (oEntitySetAnnotations["@com.sap.vocabularies.Common.v1.DraftRoot"] && oEntitySetAnnotations["@com.sap.vocabularies.Common.v1.DraftRoot"]["NewAction"]) {
          sMetaPath = `${sContextPath}@com.sap.vocabularies.Common.v1.DraftRoot/NewAction@Org.OData.Core.V1.OperationAvailable`;
        } else if (oEntitySetAnnotations["@com.sap.vocabularies.Session.v1.StickySessionSupported"] && oEntitySetAnnotations["@com.sap.vocabularies.Session.v1.StickySessionSupported"]["NewAction"]) {
          sMetaPath = `${sContextPath}@com.sap.vocabularies.Session.v1.StickySessionSupported/NewAction@Org.OData.Core.V1.OperationAvailable`;
        }
        if (sMetaPath) {
          const bNewActionOperationAvailable = oMetaModel.getObject(sMetaPath);
          if (bNewActionOperationAvailable === false) {
            bCreatable = false;
          }
        } else {
          const oInsertRestrictions = oEntitySetAnnotations["@Org.OData.Capabilities.V1.InsertRestrictions"];
          if (oInsertRestrictions && oInsertRestrictions.Insertable === false) {
            bCreatable = false;
          }
        }
        if (bCreatable) {
          return this.getDefaultCreateHash(oStartupParameters, sContextPath, oRouter);
        } else {
          return "";
        }
      });
    },
    /**
     * Calculates the hash to create a new object.
     *
     * @param oStartupParameters The startup parameter values (map parameter name -> array of values)
     * @param sContextPath The context path of the entity set to be used for the creation
     * @param oRouter The router instance
     * @returns The hash
     */
    getDefaultCreateHash: function (oStartupParameters, sContextPath, oRouter) {
      let sDefaultCreateHash = oStartupParameters && oStartupParameters.preferredMode ? oStartupParameters.preferredMode[0] : "create";
      let sHash = "";
      sDefaultCreateHash = sDefaultCreateHash.indexOf(":") !== -1 && sDefaultCreateHash.length > sDefaultCreateHash.indexOf(":") + 1 ? sDefaultCreateHash.substr(0, sDefaultCreateHash.indexOf(":")) : "create";
      sHash = `${sContextPath.substring(1)}(...)?i-action=${sDefaultCreateHash}`;
      if (oRouter.getRouteInfoByHash(sHash)) {
        return sHash;
      } else {
        throw new Error(`No route match for creating a new ${sContextPath.substring(1)}`);
      }
    }
  };
  return AppStartupHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBcHBTdGFydHVwSGVscGVyIiwiX2dldEtleXNGcm9tU3RhcnR1cFBhcmFtcyIsImFLZXlOYW1lcyIsIm9TdGFydHVwUGFyYW1ldGVycyIsImJBbGxGb3VuZCIsImFLZXlzIiwibWFwIiwibmFtZSIsImxlbmd0aCIsInZhbHVlIiwidW5kZWZpbmVkIiwiX2NyZWF0ZUZpbHRlckZyb21LZXlzIiwiYkRyYWZ0TW9kZSIsIm9NZXRhTW9kZWwiLCJiRmlsdGVyQ2FzZVNlbnNpdGl2ZSIsIk1vZGVsSGVscGVyIiwiaXNGaWx0ZXJpbmdDYXNlU2Vuc2l0aXZlIiwiYkZpbHRlck9uQWN0aXZlRW50aXR5IiwiYUZpbHRlcnMiLCJrZXkiLCJGaWx0ZXIiLCJwYXRoIiwib3BlcmF0b3IiLCJGaWx0ZXJPcGVyYXRvciIsIkVRIiwidmFsdWUxIiwiY2FzZVNlbnNpdGl2ZSIsIm9EcmFmdEZpbHRlciIsImZpbHRlcnMiLCJhbmQiLCJwdXNoIiwiX3JlcXVlc3RPYmplY3RzRnJvbVBhcmFtZXRlcnMiLCJhU3RhcnR1cFBhZ2VzIiwib01vZGVsIiwiYUNvbnRleHRQcm9taXNlcyIsInBhZ2VJbmZvIiwic2VtYW50aWNLZXlzIiwidGVjaG5pY2FsS2V5cyIsIm9GaWx0ZXIiLCJkcmFmdE1vZGUiLCJnZXRNZXRhTW9kZWwiLCJvTGlzdEJpbmQiLCJiaW5kTGlzdCIsImNvbnRleHRQYXRoIiwiJHNlbGVjdCIsImpvaW4iLCJyZXF1ZXN0Q29udGV4dHMiLCJQcm9taXNlIiwiYWxsIiwiX2dldFJlYWNoYWJsZVBhZ2VJbmZvRnJvbVJvdXRlIiwib1JvdXRlIiwib01hbmlmZXN0Um91dGluZyIsInNQYXR0ZXJuIiwicGF0dGVybiIsInJlcGxhY2UiLCJlbmRzV2l0aCIsInNUYXJnZXROYW1lIiwiQXJyYXkiLCJpc0FycmF5IiwidGFyZ2V0Iiwib1RhcmdldCIsInRhcmdldHMiLCJhUGF0dGVyblNlZ21lbnRzIiwic3BsaXQiLCJwYWdlTGV2ZWwiLCJvcHRpb25zIiwic2V0dGluZ3MiLCJhbGxvd0RlZXBMaW5raW5nIiwic0NvbnRleHRQYXRoIiwiZW50aXR5U2V0Iiwib0VudGl0eVR5cGUiLCJnZXRPYmplY3QiLCJhU2VtYW50aWNLZXlOYW1lcyIsImFTZW1hbnRpY2tLZXlzIiwic2VtS2V5IiwiJFByb3BlcnR5UGF0aCIsImFUZWNobmljYWxLZXlzIiwiX2dldFJlYWNoYWJsZVBhZ2VzIiwiYVJvdXRlcyIsInJvdXRlcyIsIm1QYWdlc0J5TGV2ZWwiLCJmb3JFYWNoIiwib1BhZ2VJbmZvIiwiYVJlYWNoYWJsZVBhZ2VzIiwibGV2ZWwiLCJfZ2V0U3RhcnR1cFBhZ2VzRnJvbVN0YXJ0dXBQYXJhbXMiLCJyZXN1bHQiLCJjdXJyZW50IiwiZmluZFJlY3Vyc2l2ZSIsImFDdXJyZW50TGV2ZWxQYWdlcyIsImxhc3RQYWdlIiwibmV4dFBhZ2UiLCJpbmRleE9mIiwicG9wIiwic2xpY2UiLCJfZ2V0RGVlcExpbmtPYmplY3QiLCJhQ29udGV4dHMiLCJjb250ZXh0IiwiaGFzaCIsIm9Db250ZXh0IiwiZ2V0UGF0aCIsImdldERlZXBMaW5rU3RhcnR1cEhhc2giLCJyZXF1ZXN0T2JqZWN0IiwidGhlbiIsImFWYWx1ZXMiLCJhRm91bmRDb250ZXh0cyIsImdldENyZWF0ZVN0YXJ0dXBIYXNoIiwib1JvdXRlciIsIm9FbnRpdHlTZXRBbm5vdGF0aW9ucyIsInNNZXRhUGF0aCIsImJDcmVhdGFibGUiLCJiTmV3QWN0aW9uT3BlcmF0aW9uQXZhaWxhYmxlIiwib0luc2VydFJlc3RyaWN0aW9ucyIsIkluc2VydGFibGUiLCJnZXREZWZhdWx0Q3JlYXRlSGFzaCIsInNEZWZhdWx0Q3JlYXRlSGFzaCIsInByZWZlcnJlZE1vZGUiLCJzSGFzaCIsInN1YnN0ciIsInN1YnN0cmluZyIsImdldFJvdXRlSW5mb0J5SGFzaCIsIkVycm9yIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJBcHBTdGFydHVwSGVscGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIFJvdXRlciBmcm9tIFwic2FwL3VpL2NvcmUvcm91dGluZy9Sb3V0ZXJcIjtcbmltcG9ydCBGaWx0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJcIjtcbmltcG9ydCBGaWx0ZXJPcGVyYXRvciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlck9wZXJhdG9yXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTW9kZWxcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwiLi9Nb2RlbEhlbHBlclwiO1xuXG50eXBlIFZhbHVlZEtleSA9IHtcblx0bmFtZTogc3RyaW5nO1xuXHR2YWx1ZTogc3RyaW5nO1xufTtcblxudHlwZSBQYWdlSW5mbyA9IHtcblx0cGF0dGVybjogc3RyaW5nO1xuXHRjb250ZXh0UGF0aDogc3RyaW5nO1xuXHRkcmFmdE1vZGU6IEJvb2xlYW47XG5cdHRlY2huaWNhbEtleXM6IFZhbHVlZEtleVtdIHwgdW5kZWZpbmVkO1xuXHRzZW1hbnRpY0tleXM6IFZhbHVlZEtleVtdIHwgdW5kZWZpbmVkO1xuXHR0YXJnZXQ6IHN0cmluZztcblx0cGFnZUxldmVsOiBudW1iZXI7XG59O1xuXG5jb25zdCBBcHBTdGFydHVwSGVscGVyID0ge1xuXHQvKipcblx0ICogUmV0cmlldmVzIGEgc2V0IG9mIGtleSB2YWx1ZXMgZnJvbSBzdGFydHVwIHBhcmFtZXRlcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBhS2V5TmFtZXMgVGhlIGFycmF5IG9mIGtleSBuYW1lc1xuXHQgKiBAcGFyYW0gb1N0YXJ0dXBQYXJhbWV0ZXJzIFRoZSBzdGFydHVwIHBhcmFtZXRlcnNcblx0ICogQHJldHVybnMgQW4gYXJyYXkgb2YgcGFpcnMgXFx7bmFtZSwgdmFsdWVcXH0gaWYgYWxsIGtleSB2YWx1ZXMgY291bGQgYmUgZm91bmQgaW4gdGhlIHN0YXJ0dXAgcGFyYW1ldGVycywgdW5kZWZpbmVkIG90aGVyd2lzZVxuXHQgKi9cblx0X2dldEtleXNGcm9tU3RhcnR1cFBhcmFtczogZnVuY3Rpb24gKGFLZXlOYW1lczogc3RyaW5nW10sIG9TdGFydHVwUGFyYW1ldGVyczogYW55KTogVmFsdWVkS2V5W10gfCB1bmRlZmluZWQge1xuXHRcdGxldCBiQWxsRm91bmQgPSB0cnVlO1xuXHRcdGNvbnN0IGFLZXlzID0gYUtleU5hbWVzLm1hcCgobmFtZSkgPT4ge1xuXHRcdFx0aWYgKG9TdGFydHVwUGFyYW1ldGVyc1tuYW1lXSAmJiBvU3RhcnR1cFBhcmFtZXRlcnNbbmFtZV0ubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdHJldHVybiB7IG5hbWUsIHZhbHVlOiBvU3RhcnR1cFBhcmFtZXRlcnNbbmFtZV1bMF0gYXMgc3RyaW5nIH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBBIHVuaXF1ZSBrZXkgdmFsdWUgY291bGRuJ3QgYmUgZm91bmQgaW4gdGhlIHN0YXJ0dXAgcGFyYW1ldGVyc1xuXHRcdFx0XHRiQWxsRm91bmQgPSBmYWxzZTtcblx0XHRcdFx0cmV0dXJuIHsgbmFtZSwgdmFsdWU6IFwiXCIgfTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiBiQWxsRm91bmQgPyBhS2V5cyA6IHVuZGVmaW5lZDtcblx0fSxcblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIGZpbHRlciBmcm9tIGEgbGlzdCBvZiBrZXkgdmFsdWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gYUtleXMgQXJyYXkgb2Ygc2VtYW50aWMga2V5cyBvciB0ZWNobmljYWwga2V5cyAod2l0aCB2YWx1ZXMpXG5cdCAqIEBwYXJhbSBiRHJhZnRNb2RlIFRydWUgaWYgdGhlIGVudGl0eSBzdXBwb3J0cyBkcmFmdCBtb2RlXG5cdCAqIEBwYXJhbSBvTWV0YU1vZGVsIFRoZSBtZXRhbW9kZWxcblx0ICogQHJldHVybnMgVGhlIGZpbHRlclxuXHQgKi9cblx0X2NyZWF0ZUZpbHRlckZyb21LZXlzOiBmdW5jdGlvbiAoYUtleXM6IFZhbHVlZEtleVtdLCBiRHJhZnRNb2RlOiBCb29sZWFuLCBvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCk6IEZpbHRlciB7XG5cdFx0Y29uc3QgYkZpbHRlckNhc2VTZW5zaXRpdmUgPSBNb2RlbEhlbHBlci5pc0ZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUob01ldGFNb2RlbCk7XG5cblx0XHRsZXQgYkZpbHRlck9uQWN0aXZlRW50aXR5ID0gZmFsc2U7XG5cdFx0Y29uc3QgYUZpbHRlcnMgPSBhS2V5cy5tYXAoKGtleSkgPT4ge1xuXHRcdFx0aWYgKGtleS5uYW1lID09PSBcIklzQWN0aXZlRW50aXR5XCIpIHtcblx0XHRcdFx0YkZpbHRlck9uQWN0aXZlRW50aXR5ID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBuZXcgRmlsdGVyKHtcblx0XHRcdFx0cGF0aDoga2V5Lm5hbWUsXG5cdFx0XHRcdG9wZXJhdG9yOiBGaWx0ZXJPcGVyYXRvci5FUSxcblx0XHRcdFx0dmFsdWUxOiBrZXkudmFsdWUsXG5cdFx0XHRcdGNhc2VTZW5zaXRpdmU6IGJGaWx0ZXJDYXNlU2Vuc2l0aXZlXG5cdFx0XHR9KTtcblx0XHR9KTtcblx0XHRpZiAoYkRyYWZ0TW9kZSAmJiAhYkZpbHRlck9uQWN0aXZlRW50aXR5KSB7XG5cdFx0XHRjb25zdCBvRHJhZnRGaWx0ZXIgPSBuZXcgRmlsdGVyKHtcblx0XHRcdFx0ZmlsdGVyczogW25ldyBGaWx0ZXIoXCJJc0FjdGl2ZUVudGl0eVwiLCBcIkVRXCIsIGZhbHNlKSwgbmV3IEZpbHRlcihcIlNpYmxpbmdFbnRpdHkvSXNBY3RpdmVFbnRpdHlcIiwgXCJFUVwiLCBudWxsKV0sXG5cdFx0XHRcdGFuZDogZmFsc2Vcblx0XHRcdH0pO1xuXHRcdFx0YUZpbHRlcnMucHVzaChvRHJhZnRGaWx0ZXIpO1xuXHRcdH1cblxuXHRcdHJldHVybiBuZXcgRmlsdGVyKGFGaWx0ZXJzLCB0cnVlKTtcblx0fSxcblxuXHQvKipcblx0ICogTG9hZHMgYWxsIGNvbnRleHRzIGZvciBhIGxpc3Qgb2YgcGFnZSBpbmZvcy5cblx0ICpcblx0ICogQHBhcmFtIGFTdGFydHVwUGFnZXMgVGhlIGxpc3Qgb2YgcGFnZSBpbmZvc1xuXHQgKiBAcGFyYW0gb01vZGVsIFRoZSBtb2RlbCB1c2VkIHRvIGxvYWQgdGhlIGNvbnRleHRzXG5cdCAqIEByZXR1cm5zIEEgUHJvbWlzZSBmb3IgYWxsIGNvbnRleHRzXG5cdCAqL1xuXHRfcmVxdWVzdE9iamVjdHNGcm9tUGFyYW1ldGVyczogZnVuY3Rpb24gKGFTdGFydHVwUGFnZXM6IFBhZ2VJbmZvW10sIG9Nb2RlbDogT0RhdGFNb2RlbCk6IFByb21pc2U8Q29udGV4dFtdW10+IHtcblx0XHQvLyBMb2FkIHRoZSByZXNwZWN0aXZlIG9iamVjdHMgZm9yIGFsbCBvYmplY3QgcGFnZXMgZm91bmQgaW4gYUV4dGVybmFsbHlOYXZpZ2FibGVQYWdlc1xuXHRcdGNvbnN0IGFDb250ZXh0UHJvbWlzZXMgPSBhU3RhcnR1cFBhZ2VzLm1hcCgocGFnZUluZm8pID0+IHtcblx0XHRcdGNvbnN0IGFLZXlzID0gcGFnZUluZm8uc2VtYW50aWNLZXlzIHx8IHBhZ2VJbmZvLnRlY2huaWNhbEtleXMgfHwgW107XG5cdFx0XHRjb25zdCBvRmlsdGVyID0gdGhpcy5fY3JlYXRlRmlsdGVyRnJvbUtleXMoYUtleXMsIHBhZ2VJbmZvLmRyYWZ0TW9kZSwgb01vZGVsLmdldE1ldGFNb2RlbCgpKTtcblxuXHRcdFx0Ly8gb25seSByZXF1ZXN0IGEgbWluaW11bSBvZiBmaWVsZHMgdG8gYm9vc3QgYmFja2VuZCBwZXJmb3JtYW5jZSBzaW5jZSB0aGlzIGlzIG9ubHkgdXNlZCB0byBjaGVjayBpZiBhbiBvYmplY3QgZXhpc3RzXG5cdFx0XHRjb25zdCBvTGlzdEJpbmQgPSBvTW9kZWwuYmluZExpc3QocGFnZUluZm8uY29udGV4dFBhdGgsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBvRmlsdGVyLCB7XG5cdFx0XHRcdCRzZWxlY3Q6IGFLZXlzXG5cdFx0XHRcdFx0Lm1hcCgoa2V5KSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4ga2V5Lm5hbWU7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuam9pbihcIixcIilcblx0XHRcdH0gYXMgYW55KTtcblx0XHRcdHJldHVybiBvTGlzdEJpbmQucmVxdWVzdENvbnRleHRzKDAsIDIpO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKGFDb250ZXh0UHJvbWlzZXMpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgUGFnZUluZm8gZnJvbSBhIHJvdXRlIGlmIGl0J3MgcmVhY2hhYmxlIGZyb20gdGhlIHN0YXJ0dXAgcGFyYW1ldGVycy5cblx0ICpcblx0ICogQHBhcmFtIG9Sb3V0ZSBUaGUgcm91dGVcblx0ICogQHBhcmFtIG9NYW5pZmVzdFJvdXRpbmcgVGhlIGFwcCBtYW5pZmVzdCByb3V0aW5nIHNlY3Rpb25cblx0ICogQHBhcmFtIG9TdGFydHVwUGFyYW1ldGVycyBUaGUgc3RhcnR1cCBwYXJhbWV0ZXJzXG5cdCAqIEBwYXJhbSBvTWV0YU1vZGVsIFRoZSBhcHAgbWV0YW1vZGVsXG5cdCAqIEByZXR1cm5zIEEgcGFnZSBpbmZvIGlmIHRoZSBwYWdlIGlzIHJlYWNoYWJsZSwgdW5kZWZpbmVkIG90aGVyd2lzZVxuXHQgKi9cblx0X2dldFJlYWNoYWJsZVBhZ2VJbmZvRnJvbVJvdXRlOiBmdW5jdGlvbiAoXG5cdFx0b1JvdXRlOiBhbnksXG5cdFx0b01hbmlmZXN0Um91dGluZzogYW55LFxuXHRcdG9TdGFydHVwUGFyYW1ldGVyczogYW55LFxuXHRcdG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsXG5cdCk6IFBhZ2VJbmZvIHwgdW5kZWZpbmVkIHtcblx0XHQvLyBSZW1vdmUgdHJhaWxpbmcgJzo/cXVlcnk6JyBhbmQgJy8nXG5cdFx0bGV0IHNQYXR0ZXJuOiBzdHJpbmcgPSBvUm91dGUucGF0dGVybi5yZXBsYWNlKFwiOj9xdWVyeTpcIiwgXCJcIik7XG5cdFx0c1BhdHRlcm4gPSBzUGF0dGVybi5yZXBsYWNlKC9cXC8kLywgXCJcIik7XG5cblx0XHRpZiAoIXNQYXR0ZXJuIHx8ICFzUGF0dGVybi5lbmRzV2l0aChcIilcIikpIHtcblx0XHRcdC8vIElnbm9yZSBsZXZlbC0wIHJvdXRlcyAoTGlzdFJlcG9ydCkgb3Igcm91dGVzIGNvcnJlc3BvbmRpbmcgdG8gYSAxLTEgcmVsYXRpb24gKG5vIGtleXMgaW4gdGhlIFVSTCBpbiB0aGlzIGNhc2UpXG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdHNQYXR0ZXJuID0gc1BhdHRlcm4ucmVwbGFjZSgvXFwoXFx7W159XSpcXH1cXCkvZywgXCIoIylcIik7IC8vIFJlcGxhY2Uga2V5cyB3aXRoICNcblxuXHRcdC8vIEdldCB0aGUgcmlnaHRtb3N0IHRhcmdldCBmb3IgdGhpcyByb3V0ZVxuXHRcdGNvbnN0IHNUYXJnZXROYW1lOiBzdHJpbmcgPSBBcnJheS5pc0FycmF5KG9Sb3V0ZS50YXJnZXQpID8gb1JvdXRlLnRhcmdldFtvUm91dGUudGFyZ2V0Lmxlbmd0aCAtIDFdIDogb1JvdXRlLnRhcmdldDtcblx0XHRjb25zdCBvVGFyZ2V0ID0gb01hbmlmZXN0Um91dGluZy50YXJnZXRzW3NUYXJnZXROYW1lXTtcblxuXHRcdGNvbnN0IGFQYXR0ZXJuU2VnbWVudHMgPSBzUGF0dGVybi5zcGxpdChcIi9cIik7XG5cdFx0Y29uc3QgcGFnZUxldmVsID0gYVBhdHRlcm5TZWdtZW50cy5sZW5ndGggLSAxO1xuXG5cdFx0aWYgKHBhZ2VMZXZlbCAhPT0gMCAmJiBvVGFyZ2V0Py5vcHRpb25zPy5zZXR0aW5ncz8uYWxsb3dEZWVwTGlua2luZyAhPT0gdHJ1ZSkge1xuXHRcdFx0Ly8gVGhlIGZpcnN0IGxldmVsIG9mIG9iamVjdCBwYWdlIGFsbG93cyBkZWVwIGxpbmtpbmcgYnkgZGVmYXVsdC5cblx0XHRcdC8vIE90aGVyd2lzZSwgdGhlIHRhcmdldCBtdXN0IGFsbG93IGRlZXAgbGlua2luZyBleHBsaWNpdGVseSBpbiB0aGUgbWFuaWZlc3Rcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgc0NvbnRleHRQYXRoOiBzdHJpbmcgPVxuXHRcdFx0b1RhcmdldC5vcHRpb25zLnNldHRpbmdzLmNvbnRleHRQYXRoIHx8IChvVGFyZ2V0Lm9wdGlvbnMuc2V0dGluZ3MuZW50aXR5U2V0ICYmIGAvJHtvVGFyZ2V0Lm9wdGlvbnMuc2V0dGluZ3MuZW50aXR5U2V0fWApO1xuXHRcdGNvbnN0IG9FbnRpdHlUeXBlID0gc0NvbnRleHRQYXRoICYmIG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJEVudGl0eUNvbnRhaW5lciR7c0NvbnRleHRQYXRofS9gKTtcblxuXHRcdGlmICghb0VudGl0eVR5cGUpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0Ly8gR2V0IHRoZSBzZW1hbnRpYyBrZXkgdmFsdWVzIGZvciB0aGUgZW50aXR5XG5cdFx0Y29uc3QgYVNlbWFudGljS2V5TmFtZXM6IGFueSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJEVudGl0eUNvbnRhaW5lciR7c0NvbnRleHRQYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljS2V5YCk7XG5cblx0XHRjb25zdCBhU2VtYW50aWNrS2V5cyA9IGFTZW1hbnRpY0tleU5hbWVzXG5cdFx0XHQ/IHRoaXMuX2dldEtleXNGcm9tU3RhcnR1cFBhcmFtcyhcblx0XHRcdFx0XHRhU2VtYW50aWNLZXlOYW1lcy5tYXAoKHNlbUtleTogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gc2VtS2V5LiRQcm9wZXJ0eVBhdGggYXMgc3RyaW5nO1xuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdG9TdGFydHVwUGFyYW1ldGVyc1xuXHRcdFx0ICApXG5cdFx0XHQ6IHVuZGVmaW5lZDtcblxuXHRcdC8vIEdldCB0aGUgdGVjaG5pY2FsIGtleXMgb25seSBpZiB3ZSBjb3VsZG4ndCBmaW5kIHRoZSBzZW1hbnRpYyBrZXkgdmFsdWVzLCBhbmQgb24gZmlyc3QgbGV2ZWwgT1Bcblx0XHRjb25zdCBhVGVjaG5pY2FsS2V5cyA9XG5cdFx0XHQhYVNlbWFudGlja0tleXMgJiYgcGFnZUxldmVsID09PSAwID8gdGhpcy5fZ2V0S2V5c0Zyb21TdGFydHVwUGFyYW1zKG9FbnRpdHlUeXBlW1wiJEtleVwiXSwgb1N0YXJ0dXBQYXJhbWV0ZXJzKSA6IHVuZGVmaW5lZDtcblxuXHRcdGlmIChhU2VtYW50aWNrS2V5cyA9PT0gdW5kZWZpbmVkICYmIGFUZWNobmljYWxLZXlzID09PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIFdlIGNvdWxkbid0IGZpbmQgdGhlIHNlbWFudGljL3RlY2huaWNhbCBrZXlzIGluIHRoZSBzdGFydHVwIHBhcmFtZXRlcnNcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0Ly8gVGhlIHN0YXJ0dXAgcGFyYW1ldGVycyBjb250YWluIHZhbHVlcyBmb3IgYWxsIHNlbWFudGljIGtleXMgKG9yIHRlY2huaWNhbCBrZXlzKSAtLT4gd2UgY2FuIHN0b3JlIHRoZSBwYWdlIGluZm8gaW4gdGhlIGNvcnJlc3BvbmRpbmcgbGV2ZWxcblx0XHRjb25zdCBkcmFmdE1vZGUgPVxuXHRcdFx0b01ldGFNb2RlbC5nZXRPYmplY3QoYC8kRW50aXR5Q29udGFpbmVyJHtzQ29udGV4dFBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdFJvb3RgKSB8fFxuXHRcdFx0b01ldGFNb2RlbC5nZXRPYmplY3QoYC8kRW50aXR5Q29udGFpbmVyJHtzQ29udGV4dFBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdE5vZGVgKVxuXHRcdFx0XHQ/IHRydWVcblx0XHRcdFx0OiBmYWxzZTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRwYXR0ZXJuOiBzUGF0dGVybixcblx0XHRcdGNvbnRleHRQYXRoOiBzQ29udGV4dFBhdGgsXG5cdFx0XHRkcmFmdE1vZGUsXG5cdFx0XHR0ZWNobmljYWxLZXlzOiBhVGVjaG5pY2FsS2V5cyxcblx0XHRcdHNlbWFudGljS2V5czogYVNlbWFudGlja0tleXMsXG5cdFx0XHR0YXJnZXQ6IHNUYXJnZXROYW1lLFxuXHRcdFx0cGFnZUxldmVsXG5cdFx0fTtcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgbGlzdCBvZiBhbGwgcGFnZXMgdGhhdCBhbGxvdyBkZWVwbGluayBhbmQgdGhhdCBjYW4gYmUgcmVhY2hlZCB1c2luZyB0aGUgc3RhcnR1cCBwYXJhbWV0ZXJzLlxuXHQgKlxuXHQgKiBAcGFyYW0gb01hbmlmZXN0Um91dGluZyBUaGUgcm91dGluZyBpbmZvcm1hdGlvbiBmcm9tIHRoZSBhcHAgbWFuaWZlc3Rcblx0ICogQHBhcmFtIG9TdGFydHVwUGFyYW1ldGVycyBUaGUgc3RhcnR1cCBwYXJhbWV0ZXJzXG5cdCAqIEBwYXJhbSBvTWV0YU1vZGVsIFRoZSBtZXRhbW9kZWxcblx0ICogQHJldHVybnMgVGhlIHJlYWNoYWJsZSBwYWdlc1xuXHQgKi9cblx0X2dldFJlYWNoYWJsZVBhZ2VzOiBmdW5jdGlvbiAob01hbmlmZXN0Um91dGluZzogYW55LCBvU3RhcnR1cFBhcmFtZXRlcnM6IGFueSwgb01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwpOiBQYWdlSW5mb1tdW10ge1xuXHRcdGNvbnN0IGFSb3V0ZXM6IGFueVtdID0gb01hbmlmZXN0Um91dGluZy5yb3V0ZXM7XG5cdFx0Y29uc3QgbVBhZ2VzQnlMZXZlbDogUmVjb3JkPG51bWJlciwgUGFnZUluZm9bXT4gPSB7fTtcblxuXHRcdGFSb3V0ZXMuZm9yRWFjaCgob1JvdXRlKSA9PiB7XG5cdFx0XHRjb25zdCBvUGFnZUluZm8gPSB0aGlzLl9nZXRSZWFjaGFibGVQYWdlSW5mb0Zyb21Sb3V0ZShvUm91dGUsIG9NYW5pZmVzdFJvdXRpbmcsIG9TdGFydHVwUGFyYW1ldGVycywgb01ldGFNb2RlbCk7XG5cblx0XHRcdGlmIChvUGFnZUluZm8pIHtcblx0XHRcdFx0aWYgKCFtUGFnZXNCeUxldmVsW29QYWdlSW5mby5wYWdlTGV2ZWxdKSB7XG5cdFx0XHRcdFx0bVBhZ2VzQnlMZXZlbFtvUGFnZUluZm8ucGFnZUxldmVsXSA9IFtdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG1QYWdlc0J5TGV2ZWxbb1BhZ2VJbmZvLnBhZ2VMZXZlbF0ucHVzaChvUGFnZUluZm8pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gQSBwYWdlIGlzIHJlYWNoYWJsZSBvbmx5IGlmIGFsbCBpdHMgcGFyZW50cyBhcmUgYWxzbyByZWFjaGFibGVcblx0XHQvLyBTbyBpZiB3ZSBjb3VsZG4ndCBmaW5kIGFueSBwYWdlcyBmb3IgYSBnaXZlbiBsZXZlbCwgYWxsIHBhZ2VzIHdpdGggYSBoaWdoZXIgbGV2ZWwgd29uJ3QgYmUgcmVhY2hhYmxlIGFueXdheVxuXHRcdGNvbnN0IGFSZWFjaGFibGVQYWdlczogUGFnZUluZm9bXVtdID0gW107XG5cdFx0bGV0IGxldmVsID0gMDtcblx0XHR3aGlsZSAobVBhZ2VzQnlMZXZlbFtsZXZlbF0pIHtcblx0XHRcdGFSZWFjaGFibGVQYWdlcy5wdXNoKG1QYWdlc0J5TGV2ZWxbbGV2ZWxdKTtcblx0XHRcdGxldmVsKys7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFSZWFjaGFibGVQYWdlcztcblx0fSxcblxuXHQvKipcblx0ICogR2V0IHRoZSBsaXN0IG9mIHN0YXJ0dXAgcGFnZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvTWFuaWZlc3RSb3V0aW5nIFRoZSByb3V0aW5nIGluZm9ybWF0aW9uIGZyb20gdGhlIGFwcCBtYW5pZmVzdFxuXHQgKiBAcGFyYW0gb1N0YXJ0dXBQYXJhbWV0ZXJzIFRoZSBzdGFydHVwIHBhcmFtZXRlcnNcblx0ICogQHBhcmFtIG9NZXRhTW9kZWwgVGhlIG1ldGFtb2RlbFxuXHQgKiBAcmV0dXJucyBBbiBhcnJheSBvZiBzdGFydHVwIHBhZ2UgaW5mb3Ncblx0ICovXG5cdF9nZXRTdGFydHVwUGFnZXNGcm9tU3RhcnR1cFBhcmFtczogZnVuY3Rpb24gKG9NYW5pZmVzdFJvdXRpbmc6IGFueSwgb1N0YXJ0dXBQYXJhbWV0ZXJzOiBhbnksIG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsKTogUGFnZUluZm9bXSB7XG5cdFx0Ly8gRmluZCBhbGwgcGFnZXMgdGhhdCBjYW4gYmUgcmVhY2hlZCB3aXRoIHRoZSBzdGFydHVwIHBhcmFtZXRlcnNcblx0XHRjb25zdCBhUmVhY2hhYmxlUGFnZXMgPSB0aGlzLl9nZXRSZWFjaGFibGVQYWdlcyhvTWFuaWZlc3RSb3V0aW5nLCBvU3RhcnR1cFBhcmFtZXRlcnMsIG9NZXRhTW9kZWwpO1xuXG5cdFx0aWYgKGFSZWFjaGFibGVQYWdlcy5sZW5ndGggPT09IDApIHtcblx0XHRcdHJldHVybiBbXTtcblx0XHR9XG5cblx0XHQvLyBGaW5kIHRoZSBsb25nZXN0IHNlcXVlbmNlIG9mIHBhZ2VzIHRoYXQgY2FuIGJlIHJlYWNoZWQgKHJlY3Vyc2l2ZWx5KVxuXHRcdGxldCByZXN1bHQ6IFBhZ2VJbmZvW10gPSBbXTtcblx0XHRjb25zdCBjdXJyZW50OiBQYWdlSW5mb1tdID0gW107XG5cblx0XHRmdW5jdGlvbiBmaW5kUmVjdXJzaXZlKGxldmVsOiBudW1iZXIpIHtcblx0XHRcdGNvbnN0IGFDdXJyZW50TGV2ZWxQYWdlcyA9IGFSZWFjaGFibGVQYWdlc1tsZXZlbF07XG5cdFx0XHRjb25zdCBsYXN0UGFnZSA9IGN1cnJlbnQubGVuZ3RoID8gY3VycmVudFtjdXJyZW50Lmxlbmd0aCAtIDFdIDogdW5kZWZpbmVkO1xuXG5cdFx0XHRpZiAoYUN1cnJlbnRMZXZlbFBhZ2VzKSB7XG5cdFx0XHRcdGFDdXJyZW50TGV2ZWxQYWdlcy5mb3JFYWNoKGZ1bmN0aW9uIChuZXh0UGFnZSkge1xuXHRcdFx0XHRcdGlmICghbGFzdFBhZ2UgfHwgbmV4dFBhZ2UucGF0dGVybi5pbmRleE9mKGxhc3RQYWdlLnBhdHRlcm4pID09PSAwKSB7XG5cdFx0XHRcdFx0XHQvLyBXZSBvbmx5IGNvbnNpZGVyIHBhZ2VzIHRoYXQgY2FuIGJlIHJlYWNoZWQgZnJvbSB0aGUgcGFnZSBhdCB0aGUgcHJldmlvdXMgbGV2ZWwsXG5cdFx0XHRcdFx0XHQvLyAtLT4gdGhlaXIgcGF0dGVybiBtdXN0IGJlIHRoZSBwYXR0ZXJuIG9mIHRoZSBwcmV2aW91cyBwYWdlIHdpdGggYW5vdGhlciBzZWdtZW50IGFwcGVuZGVkXG5cdFx0XHRcdFx0XHRjdXJyZW50LnB1c2gobmV4dFBhZ2UpO1xuXHRcdFx0XHRcdFx0ZmluZFJlY3Vyc2l2ZShsZXZlbCArIDEpO1xuXHRcdFx0XHRcdFx0Y3VycmVudC5wb3AoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGN1cnJlbnQubGVuZ3RoID4gcmVzdWx0Lmxlbmd0aCkge1xuXHRcdFx0XHRyZXN1bHQgPSBjdXJyZW50LnNsaWNlKCk7IC8vIFdlIGhhdmUgZm91bmQgYSBzZXF1ZW5jZSBsb25nZXIgdGhhbiBvdXIgcHJldmlvdXMgYmVzdCAtLT4gc3RvcmUgaXQgYXMgdGhlIG5ldyBsb25nZXN0XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0ZmluZFJlY3Vyc2l2ZSgwKTtcblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgdGhlIHN0YXJ0dXAgb2JqZWN0IGZyb20gdGhlIGxpc3Qgb2YgcGFnZXMgYW5kIGNvbnRleHRzLlxuXHQgKlxuXHQgKiBAcGFyYW0gYVN0YXJ0dXBQYWdlcyBUaGUgcGFnZXNcblx0ICogQHBhcmFtIGFDb250ZXh0cyBUaGUgY29udGV4dHNcblx0ICogQHJldHVybnMgQW4gb2JqZWN0IGNvbnRhaW5pbmcgZWl0aGVyIGEgaGFzaCBvciBhIGNvbnRleHQgdG8gbmF2aWdhdGUgdG8sIG9yIGFuIGVtcHR5IG9iamVjdCBpZiBubyBkZWVwIGxpbmsgd2FzIGZvdW5kXG5cdCAqL1xuXHRfZ2V0RGVlcExpbmtPYmplY3Q6IGZ1bmN0aW9uIChhU3RhcnR1cFBhZ2VzOiBQYWdlSW5mb1tdLCBhQ29udGV4dHM6IENvbnRleHRbXSk6IHsgaGFzaD86IHN0cmluZzsgY29udGV4dD86IENvbnRleHQgfSB7XG5cdFx0aWYgKGFDb250ZXh0cy5sZW5ndGggPT09IDEpIHtcblx0XHRcdHJldHVybiB7IGNvbnRleHQ6IGFDb250ZXh0c1swXSB9O1xuXHRcdH0gZWxzZSBpZiAoYUNvbnRleHRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdC8vIE5hdmlnYXRpb24gdG8gYSBkZWVwZXIgbGV2ZWwgLS0+IHVzZSB0aGUgcGF0dGVybiBvZiB0aGUgZGVlcGVzdCBvYmplY3QgcGFnZVxuXHRcdFx0Ly8gYW5kIHJlcGxhY2UgdGhlIHBhcmFtZXRlcnMgYnkgdGhlIElEIGZyb20gdGhlIGNvbnRleHRzXG5cdFx0XHRsZXQgaGFzaCA9IGFTdGFydHVwUGFnZXNbYVN0YXJ0dXBQYWdlcy5sZW5ndGggLSAxXS5wYXR0ZXJuO1xuXHRcdFx0YUNvbnRleHRzLmZvckVhY2goZnVuY3Rpb24gKG9Db250ZXh0KSB7XG5cdFx0XHRcdGhhc2ggPSBoYXNoLnJlcGxhY2UoXCIoIylcIiwgYCgke29Db250ZXh0LmdldFBhdGgoKS5zcGxpdChcIihcIilbMV19YCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIHsgaGFzaCB9O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4ge307XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBDYWxjdWxhdGVzIHN0YXJ0dXAgcGFyYW1ldGVycyBmb3IgYSBkZWVwbGluayBjYXNlLCBmcm9tIHN0YXJ0dXAgcGFyYW1ldGVycyBhbmQgcm91dGluZyBpbmZvaXJtYXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBvTWFuaWZlc3RSb3V0aW5nIFRoZSByb3V0aW5nIGluZm9ybWF0aW9uIGZyb20gdGhlIGFwcCBtYW5pZmVzdFxuXHQgKiBAcGFyYW0gb1N0YXJ0dXBQYXJhbWV0ZXJzIFRoZSBzdGFydHVwIHBhcmFtZXRlcnNcblx0ICogQHBhcmFtIG9Nb2RlbCBUaGUgT0RhdGEgbW9kZWxcblx0ICogQHJldHVybnMgQW4gb2JqZWN0IGNvbnRhaW5pbmcgZWl0aGVyIGEgaGFzaCBvciBhIGNvbnRleHQgdG8gbmF2aWdhdGUgdG8sIG9yIGFuIGVtcHR5IG9iamVjdCBpZiBubyBkZWVwIGxpbmsgd2FzIGZvdW5kXG5cdCAqL1xuXHRnZXREZWVwTGlua1N0YXJ0dXBIYXNoOiBmdW5jdGlvbiAoXG5cdFx0b01hbmlmZXN0Um91dGluZzogYW55LFxuXHRcdG9TdGFydHVwUGFyYW1ldGVyczogYW55LFxuXHRcdG9Nb2RlbDogT0RhdGFNb2RlbFxuXHQpOiBQcm9taXNlPHsgaGFzaD86IHN0cmluZzsgY29udGV4dD86IENvbnRleHQgfT4ge1xuXHRcdGxldCBhU3RhcnR1cFBhZ2VzOiBQYWdlSW5mb1tdO1xuXG5cdFx0cmV0dXJuIG9Nb2RlbFxuXHRcdFx0LmdldE1ldGFNb2RlbCgpXG5cdFx0XHQucmVxdWVzdE9iamVjdChcIi8kRW50aXR5Q29udGFpbmVyL1wiKVxuXHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHQvLyBDaGVjayBpZiBzZW1hbnRpYyBrZXlzIGFyZSBwcmVzZW50IGluIHVybCBwYXJhbWV0ZXJzIGZvciBldmVyeSBvYmplY3QgcGFnZSBhdCBlYWNoIGxldmVsXG5cdFx0XHRcdGFTdGFydHVwUGFnZXMgPSB0aGlzLl9nZXRTdGFydHVwUGFnZXNGcm9tU3RhcnR1cFBhcmFtcyhvTWFuaWZlc3RSb3V0aW5nLCBvU3RhcnR1cFBhcmFtZXRlcnMsIG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSk7XG5cblx0XHRcdFx0cmV0dXJuIHRoaXMuX3JlcXVlc3RPYmplY3RzRnJvbVBhcmFtZXRlcnMoYVN0YXJ0dXBQYWdlcywgb01vZGVsKTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbigoYVZhbHVlczogQ29udGV4dFtdW10pID0+IHtcblx0XHRcdFx0aWYgKGFWYWx1ZXMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0Ly8gTWFrZSBzdXJlIHdlIG9ubHkgZ2V0IDEgY29udGV4dCBwZXIgcHJvbWlzZSwgYW5kIGZsYXR0ZW4gdGhlIGFycmF5XG5cdFx0XHRcdFx0Y29uc3QgYUNvbnRleHRzOiBDb250ZXh0W10gPSBbXTtcblx0XHRcdFx0XHRhVmFsdWVzLmZvckVhY2goZnVuY3Rpb24gKGFGb3VuZENvbnRleHRzKSB7XG5cdFx0XHRcdFx0XHRpZiAoYUZvdW5kQ29udGV4dHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdFx0XHRcdGFDb250ZXh0cy5wdXNoKGFGb3VuZENvbnRleHRzWzBdKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdHJldHVybiBhQ29udGV4dHMubGVuZ3RoID09PSBhVmFsdWVzLmxlbmd0aCA/IHRoaXMuX2dldERlZXBMaW5rT2JqZWN0KGFTdGFydHVwUGFnZXMsIGFDb250ZXh0cykgOiB7fTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4ge307XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDYWxjdWxhdGVzIHRoZSBuZXcgaGFzaCBiYXNlZCBvbiB0aGUgc3RhcnR1cCBwYXJhbWV0ZXJzLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1N0YXJ0dXBQYXJhbWV0ZXJzIFRoZSBzdGFydHVwIHBhcmFtZXRlciB2YWx1ZXMgKG1hcCBwYXJhbWV0ZXIgbmFtZSAtPiBhcnJheSBvZiB2YWx1ZXMpXG5cdCAqIEBwYXJhbSBzQ29udGV4dFBhdGggVGhlIGNvbnRleHQgcGF0aCBmb3IgdGhlIHN0YXJ0dXAgb2YgdGhlIGFwcCAoZ2VuZXJhbGx5IHRoZSBwYXRoIHRvIHRoZSBtYWluIGVudGl0eSBzZXQpXG5cdCAqIEBwYXJhbSBvUm91dGVyIFRoZSByb3V0ZXIgaW5zdGFuY2Vcblx0ICogQHBhcmFtIG9NZXRhTW9kZWwgVGhlIG1ldGEgbW9kZWxcblx0ICogQHJldHVybnMgQSBwcm9taXNlIGNvbnRhaW5pbmcgdGhlIGhhc2ggdG8gbmF2aWdhdGUgdG8sIG9yIGFuIGVtcHR5IHN0cmluZyBpZiB0aGVyZSdzIG5vIG5lZWQgdG8gbmF2aWdhdGVcblx0ICovXG5cdGdldENyZWF0ZVN0YXJ0dXBIYXNoOiBmdW5jdGlvbiAoXG5cdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzOiBhbnksXG5cdFx0c0NvbnRleHRQYXRoOiBzdHJpbmcsXG5cdFx0b1JvdXRlcjogUm91dGVyLFxuXHRcdG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsXG5cdCk6IFByb21pc2U8U3RyaW5nPiB7XG5cdFx0cmV0dXJuIG9NZXRhTW9kZWwucmVxdWVzdE9iamVjdChgJHtzQ29udGV4dFBhdGh9QGApLnRoZW4oKG9FbnRpdHlTZXRBbm5vdGF0aW9uczogYW55KSA9PiB7XG5cdFx0XHRsZXQgc01ldGFQYXRoID0gXCJcIjtcblx0XHRcdGxldCBiQ3JlYXRhYmxlID0gdHJ1ZTtcblxuXHRcdFx0aWYgKFxuXHRcdFx0XHRvRW50aXR5U2V0QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Um9vdFwiXSAmJlxuXHRcdFx0XHRvRW50aXR5U2V0QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Um9vdFwiXVtcIk5ld0FjdGlvblwiXVxuXHRcdFx0KSB7XG5cdFx0XHRcdHNNZXRhUGF0aCA9IGAke3NDb250ZXh0UGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Um9vdC9OZXdBY3Rpb25AT3JnLk9EYXRhLkNvcmUuVjEuT3BlcmF0aW9uQXZhaWxhYmxlYDtcblx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdG9FbnRpdHlTZXRBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5TZXNzaW9uLnYxLlN0aWNreVNlc3Npb25TdXBwb3J0ZWRcIl0gJiZcblx0XHRcdFx0b0VudGl0eVNldEFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlNlc3Npb24udjEuU3RpY2t5U2Vzc2lvblN1cHBvcnRlZFwiXVtcIk5ld0FjdGlvblwiXVxuXHRcdFx0KSB7XG5cdFx0XHRcdHNNZXRhUGF0aCA9IGAke3NDb250ZXh0UGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuU2Vzc2lvbi52MS5TdGlja3lTZXNzaW9uU3VwcG9ydGVkL05ld0FjdGlvbkBPcmcuT0RhdGEuQ29yZS5WMS5PcGVyYXRpb25BdmFpbGFibGVgO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoc01ldGFQYXRoKSB7XG5cdFx0XHRcdGNvbnN0IGJOZXdBY3Rpb25PcGVyYXRpb25BdmFpbGFibGUgPSBvTWV0YU1vZGVsLmdldE9iamVjdChzTWV0YVBhdGgpO1xuXHRcdFx0XHRpZiAoYk5ld0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZSA9PT0gZmFsc2UpIHtcblx0XHRcdFx0XHRiQ3JlYXRhYmxlID0gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IG9JbnNlcnRSZXN0cmljdGlvbnMgPSBvRW50aXR5U2V0QW5ub3RhdGlvbnNbXCJAT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5JbnNlcnRSZXN0cmljdGlvbnNcIl07XG5cdFx0XHRcdGlmIChvSW5zZXJ0UmVzdHJpY3Rpb25zICYmIG9JbnNlcnRSZXN0cmljdGlvbnMuSW5zZXJ0YWJsZSA9PT0gZmFsc2UpIHtcblx0XHRcdFx0XHRiQ3JlYXRhYmxlID0gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChiQ3JlYXRhYmxlKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmdldERlZmF1bHRDcmVhdGVIYXNoKG9TdGFydHVwUGFyYW1ldGVycywgc0NvbnRleHRQYXRoLCBvUm91dGVyKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBcIlwiO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDYWxjdWxhdGVzIHRoZSBoYXNoIHRvIGNyZWF0ZSBhIG5ldyBvYmplY3QuXG5cdCAqXG5cdCAqIEBwYXJhbSBvU3RhcnR1cFBhcmFtZXRlcnMgVGhlIHN0YXJ0dXAgcGFyYW1ldGVyIHZhbHVlcyAobWFwIHBhcmFtZXRlciBuYW1lIC0+IGFycmF5IG9mIHZhbHVlcylcblx0ICogQHBhcmFtIHNDb250ZXh0UGF0aCBUaGUgY29udGV4dCBwYXRoIG9mIHRoZSBlbnRpdHkgc2V0IHRvIGJlIHVzZWQgZm9yIHRoZSBjcmVhdGlvblxuXHQgKiBAcGFyYW0gb1JvdXRlciBUaGUgcm91dGVyIGluc3RhbmNlXG5cdCAqIEByZXR1cm5zIFRoZSBoYXNoXG5cdCAqL1xuXHRnZXREZWZhdWx0Q3JlYXRlSGFzaDogZnVuY3Rpb24gKG9TdGFydHVwUGFyYW1ldGVyczogYW55LCBzQ29udGV4dFBhdGg6IHN0cmluZywgb1JvdXRlcjogUm91dGVyKTogc3RyaW5nIHtcblx0XHRsZXQgc0RlZmF1bHRDcmVhdGVIYXNoID1cblx0XHRcdG9TdGFydHVwUGFyYW1ldGVycyAmJiBvU3RhcnR1cFBhcmFtZXRlcnMucHJlZmVycmVkTW9kZSA/IChvU3RhcnR1cFBhcmFtZXRlcnMucHJlZmVycmVkTW9kZVswXSBhcyBzdHJpbmcpIDogXCJjcmVhdGVcIjtcblx0XHRsZXQgc0hhc2ggPSBcIlwiO1xuXG5cdFx0c0RlZmF1bHRDcmVhdGVIYXNoID1cblx0XHRcdHNEZWZhdWx0Q3JlYXRlSGFzaC5pbmRleE9mKFwiOlwiKSAhPT0gLTEgJiYgc0RlZmF1bHRDcmVhdGVIYXNoLmxlbmd0aCA+IHNEZWZhdWx0Q3JlYXRlSGFzaC5pbmRleE9mKFwiOlwiKSArIDFcblx0XHRcdFx0PyBzRGVmYXVsdENyZWF0ZUhhc2guc3Vic3RyKDAsIHNEZWZhdWx0Q3JlYXRlSGFzaC5pbmRleE9mKFwiOlwiKSlcblx0XHRcdFx0OiBcImNyZWF0ZVwiO1xuXHRcdHNIYXNoID0gYCR7c0NvbnRleHRQYXRoLnN1YnN0cmluZygxKX0oLi4uKT9pLWFjdGlvbj0ke3NEZWZhdWx0Q3JlYXRlSGFzaH1gO1xuXHRcdGlmIChvUm91dGVyLmdldFJvdXRlSW5mb0J5SGFzaChzSGFzaCkpIHtcblx0XHRcdHJldHVybiBzSGFzaDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBObyByb3V0ZSBtYXRjaCBmb3IgY3JlYXRpbmcgYSBuZXcgJHtzQ29udGV4dFBhdGguc3Vic3RyaW5nKDEpfWApO1xuXHRcdH1cblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgQXBwU3RhcnR1cEhlbHBlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztFQXVCQSxNQUFNQSxnQkFBZ0IsR0FBRztJQUN4QjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDQyx5QkFBeUIsRUFBRSxVQUFVQyxTQUFtQixFQUFFQyxrQkFBdUIsRUFBMkI7TUFDM0csSUFBSUMsU0FBUyxHQUFHLElBQUk7TUFDcEIsTUFBTUMsS0FBSyxHQUFHSCxTQUFTLENBQUNJLEdBQUcsQ0FBRUMsSUFBSSxJQUFLO1FBQ3JDLElBQUlKLGtCQUFrQixDQUFDSSxJQUFJLENBQUMsSUFBSUosa0JBQWtCLENBQUNJLElBQUksQ0FBQyxDQUFDQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1VBQ3RFLE9BQU87WUFBRUQsSUFBSTtZQUFFRSxLQUFLLEVBQUVOLGtCQUFrQixDQUFDSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1VBQVksQ0FBQztRQUM5RCxDQUFDLE1BQU07VUFDTjtVQUNBSCxTQUFTLEdBQUcsS0FBSztVQUNqQixPQUFPO1lBQUVHLElBQUk7WUFBRUUsS0FBSyxFQUFFO1VBQUcsQ0FBQztRQUMzQjtNQUNELENBQUMsQ0FBQztNQUVGLE9BQU9MLFNBQVMsR0FBR0MsS0FBSyxHQUFHSyxTQUFTO0lBQ3JDLENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLHFCQUFxQixFQUFFLFVBQVVOLEtBQWtCLEVBQUVPLFVBQW1CLEVBQUVDLFVBQTBCLEVBQVU7TUFDN0csTUFBTUMsb0JBQW9CLEdBQUdDLFdBQVcsQ0FBQ0Msd0JBQXdCLENBQUNILFVBQVUsQ0FBQztNQUU3RSxJ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