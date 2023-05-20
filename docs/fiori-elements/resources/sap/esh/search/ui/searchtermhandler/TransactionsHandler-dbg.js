/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../suggestions/SuggestionType", "../SearchShellHelper", "../SearchShellHelperHorizonTheme", "../flp/FrontendSystem", "../flp/BackendSystem"], function (___suggestions_SuggestionType, __SearchShellHelper, __SearchShellHelperHorizonTheme, __FrontendSystem, __BackendSystem) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
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
  var SuggestionType = ___suggestions_SuggestionType["Type"];
  var SearchShellHelper = _interopRequireDefault(__SearchShellHelper);
  var SearchShellHelperHorizonTheme = _interopRequireDefault(__SearchShellHelperHorizonTheme);
  var FrontendSystem = _interopRequireDefault(__FrontendSystem);
  var BackendSystem = _interopRequireDefault(__BackendSystem);
  var TransactionsHandler = /*#__PURE__*/function () {
    function TransactionsHandler(searchModel) {
      _classCallCheck(this, TransactionsHandler);
      this.searchModel = searchModel;
      var eshBackendSystemInfo = BackendSystem.getSystem(searchModel);
      if (eshBackendSystemInfo && !eshBackendSystemInfo.equals(FrontendSystem.getSystem())) {
        // add sid(XYZ.123) url parameter
        this.tCodeStartUrl = "#Shell-startGUI?sap-system=sid(".concat(eshBackendSystemInfo.id, ")&sap-ui2-tcode=");
      } else {
        this.tCodeStartUrl = "#Shell-startGUI?sap-ui2-tcode=";
      }
    }
    _createClass(TransactionsHandler, [{
      key: "_addItemToRecentlyUsedStorage",
      value: function _addItemToRecentlyUsedStorage(searchTerm, slicedSearchTerm) {
        var recentItem = {
          label: searchTerm,
          // dataSourceId: "All",
          url: this.tCodeStartUrl + slicedSearchTerm,
          icon: "sap-icon://generate-shortcut",
          uiSuggestionType: SuggestionType.Transaction,
          searchTerm: searchTerm
        };
        if (this.searchModel.config.bRecentSearches && this.searchModel.recentlyUsedStorage) {
          this.searchModel.recentlyUsedStorage.addItem(recentItem);
        }
      }
    }, {
      key: "handleSearchTerm",
      value: function handleSearchTerm(searchTerm, searchInput) {
        var _userCategoryManager$;
        var returnValue = {
          navigateToSearchApp: true
        };
        var dataSource = this.searchModel.getDataSource();
        var userCategoryManager = this.searchModel.userCategoryManager;
        var favoritesIncludeApps = (userCategoryManager === null || userCategoryManager === void 0 ? void 0 : userCategoryManager.isFavActive()) && (userCategoryManager === null || userCategoryManager === void 0 ? void 0 : (_userCategoryManager$ = userCategoryManager.getCategory("MyFavorites")) === null || _userCategoryManager$ === void 0 ? void 0 : _userCategoryManager$.includeApps);
        // check that datasource is all, apps or my favorites and my favorites include apps:
        if (dataSource !== this.searchModel.allDataSource && dataSource !== this.searchModel.appDataSource && !(dataSource === this.searchModel.favDataSource && favoritesIncludeApps)) {
          return returnValue;
        }
        if (window.sap.cf) {
          // no transaction handling in cFLP/multiprovider
          return returnValue;
        }
        // if search term starts with /n or /o start transaction directly:
        if (searchTerm.toLowerCase().indexOf("/n") === 0) {
          var slicedSearchTerm = searchTerm.slice(2);
          this._addItemToRecentlyUsedStorage(searchTerm, slicedSearchTerm);
          if (window.hasher) {
            window.hasher.setHash(this.tCodeStartUrl + slicedSearchTerm);
          } else {
            window.location.href = this.tCodeStartUrl + slicedSearchTerm;
          }
          returnValue.navigateToSearchApp = false;
        }
        if (searchTerm.toLowerCase().indexOf("/o") === 0) {
          var _slicedSearchTerm = searchTerm.slice(2);
          this._addItemToRecentlyUsedStorage(searchTerm, _slicedSearchTerm);
          window.open(this.tCodeStartUrl + _slicedSearchTerm, "_blank", "noopener,noreferrer");
          returnValue.navigateToSearchApp = false;
        }
        if (returnValue.navigateToSearchApp === false) {
          // transaction is started, reset search input state:
          searchInput.destroySuggestionRows();
          searchInput.setValue("");
          if (!SearchShellHelperHorizonTheme.isSearchFieldExpandedByDefault()) {
            SearchShellHelper.collapseSearch();
          }
        }
        return returnValue;
      }
    }]);
    return TransactionsHandler;
  }();
  return TransactionsHandler;
});
})();