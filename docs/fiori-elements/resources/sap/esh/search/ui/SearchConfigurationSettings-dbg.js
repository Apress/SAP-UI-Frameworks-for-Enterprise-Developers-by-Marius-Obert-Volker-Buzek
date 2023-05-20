/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./performancelogging/PerformanceLogger"], function (__PerformanceLogger) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  var PerformanceLogger = _interopRequireDefault(__PerformanceLogger);
  /*
   * Search Result View Type Setting Paramaters Explaination:
   *                                                                                | In which case gettable and settable?
   * Files & Paramaters                         | Explain                           | Search in Apps         | Search in All / Category         | Search in Business Object
   * -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
   * 1. SearchConfigurationSettings (Design Time External Settings)
   * 1.1. resultViewTypes                       | view types                        |                        |                                  | gettable, settable
   * 1.2. fallbackResultViewType (DWC using)    | fallback initial active view type |                        |                                  | gettable, settable
   * -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
   * 2. SearchCompositeControl (Run Time External Settings)
   * 2.1. resultViewTypes                       | active view types                 | gettable, not settable | gettable, not settable in Ushell | gettable, settable
   * 2.2. resultViewType                        | active view type                  | gettable, not settable | gettable, not settable in Ushell | gettable, settable
   * -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
   * 3. SearchModel (Internal Perperties)
   * 3.1. "/resultViewTypes"                    | active view types                 | internal               | internal                         | internal
   * 3.2. "/resultViewType"                     | active view type                  | internal               | internal                         | internal
   * -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
   * 4. Storage (Internal Perperties)
   * 4.1. resultViewTypeForAllAndCategorySearch | last-used view type               | internal               | internal                         | internal
   * 4.2. resultViewTypeForBusinessObjectSearch | last-used view type               | internal               | internal                         | internal
   */
  var SearchConfigurationSettings = /*#__PURE__*/_createClass(function SearchConfigurationSettings() {
    _classCallCheck(this, SearchConfigurationSettings);
    _defineProperty(this, "id", "");
    _defineProperty(this, "applicationComponent", "HAN-AS-INA-UI");
    _defineProperty(this, "facetPanelResizable", true);
    _defineProperty(this, "facetPanelWidthInPercent", 25);
    _defineProperty(this, "getCustomNoResultScreen", function () {
      return null;
    });
    _defineProperty(this, "searchOnStart", true);
    _defineProperty(this, "filterRootCondition", null);
    _defineProperty(this, "dataSource", "");
    _defineProperty(this, "dataSources", []);
    _defineProperty(this, "personalizationStorage", "auto");
    _defineProperty(this, "optimizeForValueHelp", false);
    _defineProperty(this, "overwriteBrowserTitle", true);
    _defineProperty(this, "defaultDataSource", "");
    _defineProperty(this, "defaultSearchScopeApps", false);
    _defineProperty(this, "searchScopeWithoutAll", false);
    _defineProperty(this, "resultViewTypes", ["searchResultList", "searchResultTable"]);
    _defineProperty(this, "titleColumnName", "");
    _defineProperty(this, "titleColumnWidth", "");
    _defineProperty(this, "extendTableColumn", null);
    _defineProperty(this, "customGridView", null);
    _defineProperty(this, "getCustomToolbar", function () {
      return [];
    });
    _defineProperty(this, "beforeNavigation", function () {
      return;
    });
    _defineProperty(this, "filterDataSources", function (dataSources) {
      return dataSources;
    });
    _defineProperty(this, "boSuggestions", false);
    _defineProperty(this, "folderMode", false);
    _defineProperty(this, "autoAdjustResultViewTypeInFolderMode", false);
    _defineProperty(this, "displayFacetPanelInCaseOfNoResults", false);
    _defineProperty(this, "sinaConfiguration", null);
    _defineProperty(this, "enableQueryLanguage", false);
    _defineProperty(this, "tabStripsFormatter", function (tabStrips) {
      return tabStrips;
    });
    _defineProperty(this, "updateUrl", true);
    _defineProperty(this, "renderSearchUrl", function (properties) {
      return "#Action-search&/top=" + properties.top + (properties.orderby ? "&orderBy=" + properties.orderby : "") + (properties.sortorder ? "&sortOrder=" + properties.sortorder : "") + "&filter=" + properties.filter;
    });
    _defineProperty(this, "isSearchUrl", function (url) {
      return url.indexOf("#Action-search") === 0;
    });
    _defineProperty(this, "parseSearchUrlParameters", function (parameters) {
      return parameters;
    });
    _defineProperty(this, "quickSelectDataSources", []);
    _defineProperty(this, "selectionChange", function () {
      /* */
    });
    _defineProperty(this, "initAsync", function () {
      return Promise.resolve();
    });
    _defineProperty(this, "usageCollectionService", undefined);
    _defineProperty(this, "performanceLogger", new PerformanceLogger());
    _defineProperty(this, "userDefinedDatasourcesMulti", true);
    _defineProperty(this, "searchFieldCheckInterval", 100);
    _defineProperty(this, "searchInAreaOverwriteMode", false);
    _defineProperty(this, "resetQuickSelectDataSourceAll", null);
    _defineProperty(this, "searchBusinessObjects", true);
    _defineProperty(this, "suggestionKeyboardRelaxationTime", 400);
    _defineProperty(this, "suggestionStartingCharacters", 3);
    _defineProperty(this, "modulePaths", undefined);
    _defineProperty(this, "isUshell", false);
    _defineProperty(this, "bResetSearchTermOnQuickSelectDataSourceItemPress", false);
    _defineProperty(this, "bRecentSearches", false);
    _defineProperty(this, "showSearchBarForNoResults", true);
    _defineProperty(this, "FF_sortOrderInUrl", true);
    _defineProperty(this, "enableMultiSelectionResultItems", false);
    _defineProperty(this, "pageSize", 10);
    _defineProperty(this, "searchInAttibuteFacetPostion", {});
    _defineProperty(this, "cleanUpSpaceFilters", null);
    _defineProperty(this, "setSearchInLabelIconBindings", null);
    _defineProperty(this, "getSearchInFacetListMode", null);
    _defineProperty(this, "checkAndSetSpaceIcon", null);
    _defineProperty(this, "getFirstSpaceCondition", null);
    _defineProperty(this, "getPlaceholderLabelForDatasourceAll", null);
    _defineProperty(this, "setQuickSelectDataSourceAllAppearsNotSelected", null);
    _defineProperty(this, "bPlaceHolderFixedValue", false);
    _defineProperty(this, "FF_bOptimizedQuickSelectDataSourceLabels", false);
    _defineProperty(this, "metaDataJsonType", false);
    _defineProperty(this, "FF_staticHierarchyFacets", false);
    _defineProperty(this, "FF_dynamicHierarchyFacets", true);
    _defineProperty(this, "FF_hierarchyBreadcrumbs", false);
    _defineProperty(this, "FF_dynamicHierarchyFacetsInShowMore", false);
    _defineProperty(this, "FF_DWCO_REPOSITORY_EXPLORER_FOLDER", false);
    _defineProperty(this, "getSpaceFacetId", undefined);
    _defineProperty(this, "dimensionNameSpace_Description", "");
    _defineProperty(this, "hasSpaceFiltersOnly", undefined);
    _defineProperty(this, "showSpaceFacetInShowMoreDialog", undefined);
    _defineProperty(this, "openSpaceShowMoreDialog", undefined);
  } //Jiong
  ); // list of configuration parameters which are also known in sina
  // (these parameters are automatically passed to sina via sinaConfiguration)
  var sinaParameters = ["renderSearchUrl", "FF_hierarchyBreadcrumbs", "folderMode", "enableQueryLanguage", "updateUrl", "pageSize"];

  /**
   * Add deprecated parameters and the replacement of it here.
   * It will print a deprecation warning to the console using
   * UI5 assertions.
   */
  var deprecatedParameters = {
    searchBarDoNotHideForNoResults: "showSearchBarForNoResults",
    browserTitleOverwritten: "overwriteBrowserTitle",
    combinedResultviewToolbar: "",
    layoutUseResponsiveSplitter: "",
    searchFilterBarShowWithFacets: "",
    FF_facetPanelUnifiedHeaderStyling: "",
    FF_errorMessagesAsButton: "",
    FF_optimizeForValueHelp: "optimizeForValueHelp",
    bNoAppSearch: ""
  };
  var defaultSearchConfigurationSettings = new SearchConfigurationSettings();
  SearchConfigurationSettings.sinaParameters = sinaParameters;
  SearchConfigurationSettings.deprecatedParameters = deprecatedParameters;
  SearchConfigurationSettings.defaultSearchConfigurationSettings = defaultSearchConfigurationSettings;
  return SearchConfigurationSettings;
});
})();