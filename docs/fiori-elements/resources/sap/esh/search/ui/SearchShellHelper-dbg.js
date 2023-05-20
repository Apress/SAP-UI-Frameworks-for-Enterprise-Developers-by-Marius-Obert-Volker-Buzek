/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./i18n", "sap/esh/search/ui/controls/SearchFieldGroup", "sap/esh/search/ui/SearchHelper", "sap/ui/core/InvisibleText", "./SearchFieldStateManager", "./SearchShellHelperHorizonTheme", "./UIEvents"], function (__i18n, SearchFieldGroup, SearchHelper, InvisibleText, __SearchFieldStateManager, __SearchShellHelperHorizonTheme, __UIEvents) {
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
  // logging
  // autofocus collapse
  // test:
  // page reload
  // navigation facet sheet and back
  // all occurences of expand collapse
  var i18n = _interopRequireDefault(__i18n);
  var SearchFieldStateManager = _interopRequireDefault(__SearchFieldStateManager);
  var SearchShellHelperHorizonTheme = _interopRequireDefault(__SearchShellHelperHorizonTheme);
  var UIEvents = _interopRequireDefault(__UIEvents);
  var SearchShellHelper = /*#__PURE__*/function () {
    function SearchShellHelper() {
      _classCallCheck(this, SearchShellHelper);
      throw new Error("Cannot instantiate static class 'SearchShellHelper'");
    }
    _createClass(SearchShellHelper, null, [{
      key: "init",
      value: function init() {
        var _this = this;
        // check already initialized
        if (this.isInitialized) {
          return;
        }
        this.isInitialized = true;

        // pre-fetch all app tiles
        sap.ushell.Container.getServiceAsync("Search").then(function (service) {
          service.prefetch();
        });

        // get search model
        this.oModel = sap.esh.search.ui.getModelSingleton({}, "flp");

        // create search field group control
        this.oSearchFieldGroup = new SearchFieldGroup("searchFieldInShell");
        this.oSearchFieldGroup.setModel(this.oModel);

        // initialize search input
        this.oSearchInput = this.oSearchFieldGroup.input;
        this.oSearchInput.setMaxSuggestionWidth("30rem");
        this.oSearchInput.setValue(this.oModel.getSearchBoxTerm());

        // initialize search select
        this.oSearchSelect = this.oSearchFieldGroup.select;
        this.oLabel = new InvisibleText("searchShellSelectLabel", {
          text: i18n.getText("searchIn")
        });
        if (this.oLabel) {
          // avoid grunt error: "oLabel" is defined but never used
          this.oSearchSelect.addAriaLabelledBy("searchShellSelectLabel");
        }
        this.oSearchSelect.setTooltip(i18n.getText("searchInTooltip"));
        this.oSearchSelect.addEventDelegate({
          onAfterRendering: function onAfterRendering() {
            jQuery('[id$="searchFieldInShell-select-icon"]').attr("title", i18n.getText("searchIn"));
          }
        }, this.oSearchSelect);
        this.oSearchSelect.setTooltip(i18n.getText("searchIn"));
        this.oSearchSelect.attachChange(function () {
          _this.searchFieldStateManager.focusInputField({
            selectContent: true
          });
        });

        // initialize search button
        this.oSearchButton = this.oSearchFieldGroup.button;
        this.oSearchButton.attachPress(function () {
          _this.handleClickSearchButton();
        });

        // initialize cancel button
        this.oSearchCancelButton = this.oSearchFieldGroup.cancelButton;
        this.oSearchCancelButton.attachPress(function () {
          _this.collapseSearch(true);
        });
        this.oSearchFieldGroup.setCancelButtonActive(false);

        // add search field to shell header
        this.oShellHeader = sap.ui.getCore().byId("shell-header");
        this.oShellHeader.setSearch(this.oSearchFieldGroup);

        // create search field state manager
        this.searchFieldStateManager = new SearchFieldStateManager({
          shellHeader: this.oShellHeader,
          searchInput: this.oSearchInput,
          model: this.oModel,
          cancelButton: this.oSearchCancelButton,
          isNoResultsScreen: this.isNoSearchResultsScreen.bind(this)
        });

        // esc key handler
        jQuery(document).on("keydown", this.fnEscCallBack.bind(this));

        // register for global events
        sap.ui.getCore().getEventBus().subscribe("shell", "searchCompLoaded", this.onSearchComponentLoaded.bind(this), {});
        this.oModel.subscribe(UIEvents.ESHSearchFinished, this.onAllSearchFinished.bind(this), {});
        sap.ui.getCore().byId("viewPortContainer").attachAfterNavigate(this.onAfterNavigate.bind(this), {}); // ToDo 'any' -> sap.m.NavContainer
        sap.ui.getCore().getEventBus().subscribe("sap.ushell", "appComponentLoaded", function () {
          var _this$oModel;
          if (_this !== null && _this !== void 0 && (_this$oModel = _this.oModel) !== null && _this$oModel !== void 0 && _this$oModel.focusHandler && SearchHelper.isSearchAppActive()) {
            _this.oModel.focusHandler.setFocus();
          }
        });
        this.oShellHeader.attachSearchSizeChanged(this.sizeSearchFieldChanged.bind(this));
      }
    }, {
      key: "fnEscCallBack",
      value: function fnEscCallBack(oEvent) {
        // check for ESC
        if (oEvent.keyCode !== 27) {
          return;
        }
        // check that search field is focused
        if (!this.oSearchInput.getDomRef().contains(document.activeElement)) {
          return;
        }
        // check that search app is active
        if (SearchHelper.isSearchAppActive()) {
          return;
        }
        oEvent.preventDefault(); // browser would delete value
        if (this.oSearchInput.getValue() === "") {
          this.collapseSearch(true);
        } else if (this.oSearchInput.getValue() === " ") {
          this.oSearchInput.setValue(""); // ??
        }
      }

      // helper method for injecting SearchModel module from
      // SearchShellHelperAndModuleLoader
    }, {
      key: "injectSearchModel",
      value: function injectSearchModel(_SearchModel) {
        // SearchModel - circular dependency
        this.SearchModel = this.oModel || _SearchModel;
      }
    }, {
      key: "sizeSearchFieldChanged",
      value: function sizeSearchFieldChanged(event) {
        var size = event.getParameters()["remSize"];
        // display mode of connector dropdown
        var limit = 24;
        if (size <= limit) {
          this.oSearchSelect.setDisplayMode("icon");
        } else {
          this.oSearchSelect.setDisplayMode("default");
        }
        // visibility of search button
        limit = 9;
        if (size < limit) {
          this.oSearchButton.setVisible(false);
        } else {
          this.oSearchButton.setVisible(true);
        }
        // cancel button
        if (event.getParameter("isFullWidth")) {
          this.oSearchFieldGroup.setCancelButtonActive(true);
          this.oSearchFieldGroup.addStyleClass("sapUshellSearchInputFullWidth");
        } else {
          this.oSearchFieldGroup.setCancelButtonActive(false);
          this.oSearchFieldGroup.removeStyleClass("sapUshellSearchInputFullWidth");
        }
      }
    }, {
      key: "sizeChanged",
      value: function sizeChanged(params) {
        switch (params.name) {
          case "Phone":
            this.oSearchFieldGroup.setCancelButtonActive(true);
            break;
          case "Tablet":
            this.oSearchFieldGroup.setCancelButtonActive(false);
            break;
          case "Desktop":
            this.oSearchFieldGroup.setCancelButtonActive(false);
            break;
          default:
            break;
        }
      }
    }, {
      key: "expandSearch",
      value: function expandSearch(focusSearchField) {
        this.searchFieldStateManager.expandSearch(focusSearchField);
      }
    }, {
      key: "collapseSearch",
      value: function collapseSearch(focusMagnifier) {
        this.searchFieldStateManager.collapseSearch(focusMagnifier);
      }
    }, {
      key: "isNoSearchResultsScreen",
      value: function isNoSearchResultsScreen() {
        return SearchHelper.isSearchAppActive() && this.oModel.getProperty("/boCount") === 0 && this.oModel.getProperty("/appCount") === 0;
      }
    }, {
      key: "onShellSearchButtonPressed",
      value: function onShellSearchButtonPressed() {
        SearchShellHelper.init();
        if (!SearchHelper.isSearchAppActive() && this.oShellHeader.getSearchState() === "COL") {
          this.resetModel();
        }
        this.expandSearch(true);
      }
    }, {
      key: "handleClickSearchButton",
      value: function handleClickSearchButton() {
        if (this.oSearchInput.getValue() === "" && this.oModel.getDataSource() === this.oModel.getDefaultDataSource()) {
          if (SearchShellHelperHorizonTheme.isSearchFieldExpandedByDefault()) {
            // screen size XL: focus input field
            this.searchFieldStateManager.focusInputField();
          } else {
            // small screen size: collapse input field + focus shell magnifier
            this.collapseSearch(true);
            window.setTimeout(function () {
              sap.ui.getCore().byId("sf").focus();
            }, 1000);
          }
        }
      }
    }, {
      key: "getSearchInput",
      value: function getSearchInput() {
        return this.oSearchFieldGroup ? this.oSearchFieldGroup.input : null;
      }
    }, {
      key: "onAfterNavigate",
      value: function onAfterNavigate(oEvent) {
        // navigation tries to restore the focus -> but application knows better how to set the focus
        // -> after navigation call focus setter of search application
        if (oEvent.getParameter("toId") !== "shellPage-Action-search" && oEvent.getParameter("toId") !== "applicationShellPage-Action-search" && oEvent.getParameter("toId") !== "application-Action-search") {
          return;
        }
        this.oModel.focusHandler.setFocus();
        this.oModel.notifySubscribers(UIEvents.ESHSearchLayoutChanged);
      }
    }, {
      key: "onAllSearchFinished",
      value: function onAllSearchFinished() {
        this.oSearchInput.setValue(this.oModel.getSearchBoxTerm());
      }
    }, {
      key: "onSearchComponentLoaded",
      value: function onSearchComponentLoaded() {
        // triggered by shell after search component is loaded
        // (search field is created in search component)
        if (!SearchHelper.isSearchAppActive()) {
          return;
        }
        this.expandSearch();
      }
    }, {
      key: "resetModel",
      value: function resetModel() {
        this.oSearchInput.setValue("");
        this.oModel.resetQuery(); // ToDo, remove 'any' as soon as SearchModel is TS
      }

      // ====================================================================
      // from here:
      // compatability functions for outdated ushell versions
      // to be removed
      // ====================================================================
    }, {
      key: "setSearchState",
      value: function setSearchState(state) {
        switch (state) {
          case "EXP":
          case "EXP_S":
            this.searchFieldStateManager.expandSearch();
            break;
          case "COL":
            this.searchFieldStateManager.collapseSearch();
            break;
        }
      }
    }, {
      key: "setSearchStateSync",
      value: function setSearchStateSync(state) {
        this.setSearchState(state);
      }
    }, {
      key: "getDefaultOpen",
      value: function getDefaultOpen() {
        return this.isDefaultOpen;
      }
    }, {
      key: "setDefaultOpen",
      value: function setDefaultOpen(isDefaultOpen) {
        this.isDefaultOpen = isDefaultOpen;
      }
    }]);
    return SearchShellHelper;
  }();
  return SearchShellHelper;
});
})();