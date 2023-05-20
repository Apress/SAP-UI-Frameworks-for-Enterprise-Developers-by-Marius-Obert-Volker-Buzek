/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./SearchShellHelperHorizonTheme"], function (__SearchShellHelperHorizonTheme) {
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
  var SearchShellHelperHorizonTheme = _interopRequireDefault(__SearchShellHelperHorizonTheme);
  var State = /*#__PURE__*/function () {
    function State(props) {
      _classCallCheck(this, State);
      this.isSearchInputFocused = props.isSearchInputFocused;
      this.isNoResultsScreen = props.isNoResultsScreen;
      this.isSearchFieldExpandedByDefault = props.isSearchFieldExpandedByDefault;
    }
    _createClass(State, [{
      key: "equals",
      value: function equals(other) {
        return this.isSearchInputFocused === other.isSearchInputFocused && this.isNoResultsScreen === other.isNoResultsScreen && this.isSearchFieldExpandedByDefault === other.isSearchFieldExpandedByDefault;
      }
    }, {
      key: "toString",
      value: function toString() {
        return "focused:".concat(this.isSearchInputFocused, " no-results:").concat(this.isNoResultsScreen, " shall-be-expanded:").concat(this.isSearchFieldExpandedByDefault);
      }
    }]);
    return State;
  }();
  var SearchFieldStateManager = /*#__PURE__*/function () {
    function SearchFieldStateManager(props) {
      var _this$model$config$se, _this$model, _this$model$config;
      _classCallCheck(this, SearchFieldStateManager);
      this.shellHeader = props.shellHeader;
      this.cancelButton = props.cancelButton;
      this.searchInput = props.searchInput;
      this.model = props.model;
      this.isNoResultsScreen = props.isNoResultsScreen;
      var checkInterval = (_this$model$config$se = this === null || this === void 0 ? void 0 : (_this$model = this.model) === null || _this$model === void 0 ? void 0 : (_this$model$config = _this$model.config) === null || _this$model$config === void 0 ? void 0 : _this$model$config.searchFieldCheckInterval) !== null && _this$model$config$se !== void 0 ? _this$model$config$se : 100;
      if (checkInterval > 0) {
        setInterval(this.checkStateChange.bind(this), checkInterval);
      }
    }
    _createClass(SearchFieldStateManager, [{
      key: "checkStateChange",
      value: function checkStateChange() {
        var currentState = this.getState();
        if (!this.checkMode) {
          if (!this.state || !currentState.equals(this.state)) {
            this.checkMode = true;
            this.checkState = currentState;
          }
        } else {
          if (currentState.equals(this.checkState)) {
            this.handleStateChanged(currentState);
          }
          this.checkMode = false;
        }
      }
    }, {
      key: "getState",
      value: function getState() {
        return new State({
          isNoResultsScreen: this.isNoResultsScreen(),
          isSearchInputFocused: this.isSearchInputFocused(),
          isSearchFieldExpandedByDefault: SearchShellHelperHorizonTheme.isSearchFieldExpandedByDefault()
        });
      }
    }, {
      key: "isOverlayShown",
      value: function isOverlayShown() {
        return !!document.querySelector(".sapUshellShellShowSearchOverlay");
      }
    }, {
      key: "isSearchInputFocused",
      value: function isSearchInputFocused() {
        if (!this.searchInput || !this.searchInput.getDomRef()) {
          return false;
        }
        return this.searchInput.getDomRef().contains(document.activeElement);
      }
    }, {
      key: "handleStateChanged",
      value: function handleStateChanged(newState) {
        var oldState = this.state;
        this.state = newState;
        if (this.model) {
          this.model.calculateSearchButtonStatus();
        }
        var shallShowOverlay = newState.isSearchInputFocused && !newState.isNoResultsScreen;
        switch (this.shellHeader.getSearchState()) {
          case "EXP":
            if (!newState.isSearchFieldExpandedByDefault && oldState && oldState.isSearchFieldExpandedByDefault && this.searchInput.getValue() === "") {
              this.collapseSearch();
              return;
            }
            if (shallShowOverlay && !this.isOverlayShown()) {
              this.shellHeader.setSearchState("EXP_S", 35, false); // intermediate state to force shell to show overlay
              this.shellHeader.setSearchState("EXP", 35, true);
            }
            if (!shallShowOverlay && this.isOverlayShown) {
              this.shellHeader.setSearchState("EXP_S", 35, false); // intermediate state to force shell to disable overlay
              this.shellHeader.setSearchState("EXP", 35, false);
            }
            break;
          case "COL":
            if (newState.isSearchFieldExpandedByDefault) {
              this.expandSearch();
            }
            break;
        }
      }
    }, {
      key: "getShellSearchButton",
      value: function getShellSearchButton() {
        return sap.ui.getCore().byId("sf");
      }
    }, {
      key: "expandSearch",
      value: function expandSearch(focusSearchField) {
        var shellSearchButton = this.getShellSearchButton();
        if (!shellSearchButton) {
          return;
        }
        this.shellHeader.setSearchState("EXP", 35, false);
        this.cancelButton.setVisible(true);
        shellSearchButton.setVisible(false);
        if (focusSearchField) {
          this.focusInputField({
            selectContent: false
          });
        }
      }
    }, {
      key: "collapseSearch",
      value: function collapseSearch(focusMagnifier) {
        var shellSearchButton = this.getShellSearchButton();
        if (!shellSearchButton) {
          return;
        }
        this.model.abortSuggestions();
        this.shellHeader.setSearchState("COL", 35, false);
        this.cancelButton.setVisible(false);
        shellSearchButton.setVisible(true);
        if (focusMagnifier) {
          window.setTimeout(function () {
            sap.ui.getCore().byId("sf").focus();
          }, 1000);
        }
      }
    }, {
      key: "focusInputField",
      value: function focusInputField() {
        var _this = this;
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        if (this.focusInputFieldTimeout) {
          window.clearTimeout(this.focusInputFieldTimeout);
          this.focusInputFieldTimeout = null;
        }
        var doFocus = function doFocus(retry) {
          if (!_this.searchInput) {
            return;
          }
          _this.focusInputFieldTimeout = null;
          var domRef = _this.searchInput.getDomRef();
          if (domRef && jQuery(domRef).is(":visible") && !sap.ui.getCore().getUIDirty()) {
            if (_this.searchInput.getEnabled()) {
              _this.searchInput.focus();
              if (options.selectContent) {
                _this.searchInput.selectText(0, 9999);
              }
              return;
            }
          }
          if (retry > 0) {
            _this.focusInputFieldTimeout = window.setTimeout(function () {
              if (!_this.model.getProperty("/initializingObjSearch")) {
                retry--;
              }
              doFocus(retry);
            }, 100);
          }
        };
        doFocus(10);
      }
    }]);
    return SearchFieldStateManager;
  }();
  return SearchFieldStateManager;
});
})();