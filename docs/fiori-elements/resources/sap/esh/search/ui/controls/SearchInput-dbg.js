/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../i18n", "sap/m/Input", "sap/m/Label", "sap/m/Text", "sap/m/library", "sap/m/Column", "sap/m/ColumnListItem", "sap/m/CustomListItem", "sap/m/FlexItemData", "sap/m/BusyIndicator", "sap/m/FlexBox", "sap/ui/core/Icon", "sap/ui/layout/HorizontalLayout", "sap/ui/layout/VerticalLayout", "sap/ui/model/BindingMode", "../SearchHelper", "../controls/SearchObjectSuggestionImage", "../suggestions/SuggestionType", "../SearchShellHelperHorizonTheme", "../sinaNexTS/providers/abap_odata/UserEventLogger", "../UIEvents"], function (__i18n, Input, Label, Text, sap_m_library, Column, ColumnListItem, CustomListItem, FlexItemData, BusyIndicator, FlexBox, Icon, HorizontalLayout, VerticalLayout, BindingMode, SearchHelper, __SearchObjectSuggestionImage, __SuggestionType, __SearchShellHelperHorizonTheme, ___sinaNexTS_providers_abap_odata_UserEventLogger, __UIEvents) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;
        var F = function () {};
        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true,
      didErr = false,
      err;
    return {
      s: function () {
        it = it.call(o);
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
  var i18n = _interopRequireDefault(__i18n);
  var ListType = sap_m_library["ListType"];
  var SearchObjectSuggestionImage = _interopRequireDefault(__SearchObjectSuggestionImage);
  var SuggestionType = _interopRequireDefault(__SuggestionType);
  var SearchShellHelperHorizonTheme = _interopRequireDefault(__SearchShellHelperHorizonTheme);
  var UserEventType = ___sinaNexTS_providers_abap_odata_UserEventLogger["UserEventType"];
  var UIEvents = _interopRequireDefault(__UIEvents);
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchInput = Input.extend("sap.esh.search.ui.controls.SearchInput", {
    renderer: {
      apiVersion: 2
    },
    constructor: function _constructor(sId, options) {
      var _this = this;
      // ugly hack disable fullscreen input on phone - start     // ToDo: remove by switching search input to sap.m.SearchField
      // see also method isMobileDevice
      var phone = sap.ui.Device.system.phone;
      try {
        sap.ui.Device.system.phone = false; // ToDo, 'phone' is a constant (read-only)
        Input.prototype.constructor.call(this, sId, options);
      } finally {
        sap.ui.Device.system.phone = phone; // ToDo, 'phone' is a constant (read-only)
        // ugly hack - end
      }

      this.setWidth("100%");
      this.setShowValueStateMessage(false);
      this.setShowTableSuggestionValueHelp(false);
      this.setEnableSuggestionsHighlighting(false);
      this.setShowSuggestion(true);
      this.setFilterSuggests(false);
      this.addSuggestionColumn(new Column(""));
      this.attachSuggestionItemSelected(this.handleSuggestionItemSelected.bind(this));
      this.setAutocomplete(false);
      this.setTooltip(i18n.getText("search"));
      this.bindProperty("placeholder", {
        path: "/searchTermPlaceholder",
        mode: BindingMode.OneWay
      });
      this.attachLiveChange(this.handleLiveChange.bind(this));
      this.bindProperty("enabled", {
        parts: [{
          path: "/initializingObjSearch"
        }],
        formatter: function formatter(initializingObjSearch) {
          return !initializingObjSearch;
        }
      });
      this.bindAggregation("suggestionRows", {
        path: "/suggestions",
        factory: function factory(sId, oContext) {
          return _this.suggestionItemFactory(sId, oContext);
        }
      });
      this.addStyleClass("searchInput");

      // disable fullscreen input on phone
      this._bUseDialog = false;
      this._bFullScreen = false;
      this._ariaDescriptionIdNoResults = sId + "-No-Results-Description";
      this.addAriaDescribedBy(this._ariaDescriptionIdNoResults);
      this.listNavigationMode = false;
      this.listNavigationModeCache = {};
    },
    isMobileDevice: function _isMobileDevice() {
      // ugly hack disable fullscreen input on phone - start
      return false;
      // ugly hack disable fullscreen input on phone - end
    },

    onfocusin: function _onfocusin(oEvent) {
      Input.prototype.onfocusin.call(this, oEvent);
      var oModel = this.getModel();
      if (oModel.getSearchBoxTerm().length === 0 && oModel.config.bRecentSearches) {
        oModel.doSuggestion();
      }
    },
    onsapenter: function _onsapenter() {
      var _this$_oSuggestionPop;
      if (!((_this$_oSuggestionPop = this["_oSuggestionPopup"]) !== null && _this$_oSuggestionPop !== void 0 && _this$_oSuggestionPop.isOpen() && this["_oSuggPopover"].getFocusedListItem())) {
        // if (!(this._oSuggestionPopup && this._oSuggestionPopup.isOpen() && this.["_oSuggPopover"]._iPopupListSelectedIndex >= 0)) {
        // check that enter happened in search input box and not on a suggestion item
        // enter on a suggestion is not handled in onsapenter but in handleSuggestionItemSelected
        this.getModel().invalidateQuery();
        this.triggerSearch();
      }
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      sap.m.Input.prototype.onsapenter.apply(this, args);
    },
    triggerSearch: function _triggerSearch() {
      // the footer is rerendered after each search in stand alone UI -> error popover losts parent and jumps to the screen top.
      // solution: if the error popover shows, set footer invisible before next search.
      // popover.close() is not working. It is closed after footer invisible, so it still jumps
      var msgPopupId = this.getModel().getProperty("/messagePopoverControlId");
      var messagePopup = sap.ui.getCore().byId(msgPopupId); // ToDo type shall be MessagePopover
      if (this.getModel().getProperty("/errors").length > 0 && messagePopup !== null && messagePopup !== void 0 && messagePopup.isOpen()) {
        messagePopup.close();
        messagePopup.setVisible(false);
      }

      // it is necessay to do this in search input (and not in search model) because otherwise navigating back from the app to the
      // search UI would result in a repeated navigation to the app
      SearchHelper.subscribeOnlyOnce("triggerSearch", UIEvents.ESHSearchFinished, function () {
        this.getModel().autoStartApp();
      }, this);
      var oModel = this.getModel();
      var searchBoxTerm = this.getValue();
      if (searchBoxTerm.trim() === "" && oModel.config.isUshell) {
        searchBoxTerm = "*"; // special behaviour for S/4
      }

      oModel.setSearchBoxTerm(searchBoxTerm, false);
      // handle transactions:
      var navigateToSearchApp = true;
      var _iterator = _createForOfIteratorHelper(oModel.searchTermHandlers),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var handler = _step.value;
          var returnValue = handler.handleSearchTerm(searchBoxTerm, this);
          if (returnValue.navigateToSearchApp === false) {
            navigateToSearchApp = false; // at least one handler says do not navigate
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      if (navigateToSearchApp) {
        this.navigateToSearchApp();
      }
      this.destroySuggestionRows();
      oModel.abortSuggestions();
    },
    handleLiveChange: function _handleLiveChange() {
      var _this2 = this;
      // ugly modifiaction: headers and busy indicator in suggestions shall not be selectable
      var suggestionPopover = this["_oSuggPopover"];
      if (suggestionPopover && suggestionPopover.handleListNavigation && !suggestionPopover.handleListNavigation.decorated) {
        var handleListNavigation = suggestionPopover.handleListNavigation;
        suggestionPopover.handleListNavigation = function () {
          _this2.listNavigationMode = true;
          _this2.listNavigationModeCache = {};
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }
          var value = handleListNavigation.apply(suggestionPopover, args);
          // -handleListNavigation calls getVisible on the suggestion items in order to determine to which suggestion items we can navigate
          // -for suggestion items of type 'header' or 'busy indicator' (to which no navigation shall take place) the getVisible function is overwritten
          // -the overwritten getVisible function returns false only for listNavigationMode=true
          // ==> this way suggestion items of type 'header' or 'busy indicator' are visible but we cannot navigate to them
          _this2.listNavigationMode = false;
          return value;
        };
        suggestionPopover.handleListNavigation.decorated = true;
      }
      var suggestTerm = this.getValue();
      var oModel = this.getModel();
      oModel.setSearchBoxTerm(suggestTerm, false);
      if (oModel.getSearchBoxTerm().length > 0 || oModel.config.bRecentSearches) {
        oModel.doSuggestion();
      } else {
        this.destroySuggestionRows();
        oModel.abortSuggestions();
      }
    },
    handleSuggestionItemSelected: function _handleSuggestionItemSelected(oEvent) {
      var _suggestion$titleNavi;
      var oModel = this.getModel();
      var searchBoxTerm = oModel.getSearchBoxTerm();
      var suggestion = oEvent.getParameter("selectedRow").getBindingContext().getObject();
      var suggestionTerm = suggestion.searchTerm || "";
      var dataSource = suggestion.dataSource || oModel.getDataSource();
      var targetURL = suggestion.url;
      var type = suggestion.uiSuggestionType;
      if (type === SuggestionType.Header) {
        return;
      }
      oModel.eventLogger.logEvent({
        type: UserEventType.SUGGESTION_SELECT,
        suggestionType: type,
        suggestionTerm: suggestionTerm,
        searchTerm: searchBoxTerm,
        targetUrl: targetURL,
        dataSourceKey: dataSource ? dataSource.id : ""
      });
      if (oModel.config.bRecentSearches && oModel.recentlyUsedStorage && type === SuggestionType.Object) {
        // Object Suggestions in DWC open in new tab, thus we need to save it here.
        // All other suggestions trigger a search which will be added as a recent item through search model.
        oModel.recentlyUsedStorage.addItem(suggestion);
      }

      // remove any selection
      this.selectText(0, 0);
      switch (type) {
        case SuggestionType.Recent:
          if ((_suggestion$titleNavi = suggestion.titleNavigation) !== null && _suggestion$titleNavi !== void 0 && _suggestion$titleNavi._href) {
            var _suggestion$titleNavi2;
            oModel.invalidateQuery();
            if ((_suggestion$titleNavi2 = suggestion.titleNavigation) !== null && _suggestion$titleNavi2 !== void 0 && _suggestion$titleNavi2._target) {
              var _suggestion$titleNavi3, _suggestion$titleNavi4;
              window.open((_suggestion$titleNavi3 = suggestion.titleNavigation) === null || _suggestion$titleNavi3 === void 0 ? void 0 : _suggestion$titleNavi3._href, (_suggestion$titleNavi4 = suggestion.titleNavigation) === null || _suggestion$titleNavi4 === void 0 ? void 0 : _suggestion$titleNavi4._target, "noopener,noreferrer");
            } else {
              var _suggestion$titleNavi5;
              window.open((_suggestion$titleNavi5 = suggestion.titleNavigation) === null || _suggestion$titleNavi5 === void 0 ? void 0 : _suggestion$titleNavi5._href, "_blank", "noopener,noreferrer");
            }
            break;
          }
        // eslint-disable-next-line no-fallthrough
        case SuggestionType.Transaction:
        case SuggestionType.App:
          // app or transactions suggestions -> start app

          // starting the app by hash change closes the suggestion popup
          // closing the suggestion popup again triggers the suggestion item selected event
          // in order to avoid to receive the event twice the suggestions are destroyed
          this.destroySuggestionRows();
          oModel.abortSuggestions();
          if (targetURL[0] === "#") {
            if (targetURL.indexOf("#Action-search") === 0 && (targetURL === SearchHelper.getHashFromUrl() || targetURL === decodeURIComponent(SearchHelper.getHashFromUrl()))) {
              // ugly workaround
              // in case the app suggestion points to the search app with query identical to current query
              // --> do noting except: restore query term + focus again the first item in the result list
              oModel.setSearchBoxTerm(oModel.getLastSearchTerm(), false);
              oModel.notifySubscribers(UIEvents.ESHSearchFinished);
              sap.ui.getCore().getEventBus().publish(UIEvents.ESHSearchFinished);
              return;
            }
            if (window["hasher"]) {
              if (targetURL[1] === window.hasher.prependHash) {
                // hasher preprends a "prependHash" character between "#" and the rest.
                // so we remove the same character to have the desired string in the end after hasher changed it
                // this avoids a wrong url if the application does not use window.hasher.getHash which removes prependHash again
                targetURL = targetURL.slice(0, 1) + targetURL.slice(2);
              }
              window["hasher"].setHash(targetURL);
            } else {
              window.location.href = targetURL;
            }
          } else {
            // special logging: only for urls started via suggestions
            // (apps/urls started via click ontile have logger in tile click handler)
            this.logRecentActivity(suggestion);
            window.open(targetURL, "_blank", "noopener,noreferrer");
            oModel.setSearchBoxTerm("", false);
            this.setValue("");
          }

          // close the search field if suggestion is not search app
          if (oModel.config.isUshell && targetURL.indexOf("#Action-search") !== 0) {
            // 1) navigate to an app <> search
            if (!SearchShellHelperHorizonTheme.isSearchFieldExpandedByDefault()) {
              sap.ui.require("sap/esh/search/ui/SearchShellHelper").collapseSearch();
            }
          } else {
            // 2) navigate to search app
            this.focus();
          }
          break;
        case SuggestionType.DataSource:
          // data source suggestions
          // -> change datasource in dropdown
          // -> do not start search
          oModel.setDataSource(dataSource, false);
          oModel.setSearchBoxTerm("", false);
          this.setValue("");
          this.focus();
          break;
        case SuggestionType.SearchTermData:
          // object data suggestion
          // -> change search term + change datasource + start search
          oModel.setDataSource(dataSource, false);
          oModel.setSearchBoxTerm(suggestionTerm, false);
          oModel.invalidateQuery();
          this.navigateToSearchApp();
          this.setValue(suggestionTerm);
          break;
        case SuggestionType.SearchTermHistory:
          // history
          // -> change search term + change datasource + start search
          oModel.setDataSource(dataSource, false);
          oModel.setSearchBoxTerm(suggestionTerm, false);
          oModel.invalidateQuery();
          this.navigateToSearchApp();
          this.setValue(suggestionTerm);
          break;
        case SuggestionType.Object:
          if (suggestion.titleNavigation) {
            suggestion.titleNavigation.performNavigation();
          }
          break;
        default:
          break;
      }
    },
    logRecentActivity: function _logRecentActivity(suggestion) {
      // load ushell deps lazy only in case of FLP
      sap.ui.require(["sap/ushell/Config", "sap/ushell/services/AppType"], function (Config, AppType) {
        // ToDo 'require'
        var bLogRecentActivity = Config.last("/core/shell/enableRecentActivity") && Config.last("/core/shell/enableRecentActivityLogging");
        if (bLogRecentActivity) {
          var oRecentEntry = {
            title: suggestion.title,
            appType: AppType.URL,
            url: suggestion.url,
            appId: suggestion.url
          };
          sap.ushell.Container.getRenderer("fiori2").logRecentActivity(oRecentEntry);
        }
      });
    },
    suggestionItemFactory: function _suggestionItemFactory(sId, oContext) {
      var suggestion = oContext.getObject();
      var uiSuggestionType = suggestion.uiSuggestionType;
      if (uiSuggestionType === SuggestionType.Recent) {
        uiSuggestionType = suggestion.originalUiSuggestionType;
      }
      switch (uiSuggestionType) {
        case SuggestionType.Object:
          return this.objectSuggestionItemFactory(sId, oContext);
        case SuggestionType.Header:
          return this.headerSuggestionItemFactory( /* sId, oContext */);
        case SuggestionType.BusyIndicator:
          return this.busyIndicatorSuggestionItemFactory( /* sId, oContext */);
        default:
          return this.regularSuggestionItemFactory(sId, oContext);
      }
    },
    busyIndicatorSuggestionItemFactory: function _busyIndicatorSuggestionItemFactory() {
      var _this3 = this;
      var cell = new VerticalLayout("", {
        content: [new BusyIndicator("", {
          size: "0.6rem"
        })]
      });
      cell["getText"] = function () {
        // ToDo, getText does not exist on type VerticalLayout
        return _this3.getValue();
      };
      var listItem = new ColumnListItem("", {
        cells: [cell],
        type: ListType.Inactive
      });
      listItem.addStyleClass("searchSuggestion");
      listItem.addStyleClass("searchBusyIndicatorSuggestion");
      listItem.getVisible = this.assembleListNavigationModeGetVisibleFunction(listItem);
      return listItem;
    },
    headerSuggestionItemFactory: function _headerSuggestionItemFactory() {
      var _this4 = this;
      var label = new Label("", {
        text: {
          path: "label"
        }
      });
      var cell = new VerticalLayout("", {
        content: [label]
      });
      cell["getText"] = function () {
        // ToDo, getText does not exist on type VerticalLayout
        return _this4.getValue();
      };
      var listItem = new ColumnListItem("", {
        cells: [cell],
        type: ListType.Inactive
      });
      listItem.addStyleClass("searchSuggestion");
      listItem.addStyleClass("searchHeaderSuggestion");
      listItem.getVisible = this.assembleListNavigationModeGetVisibleFunction(listItem);
      return listItem;
    },
    assembleListNavigationModeGetVisibleFunction: function _assembleListNavigationModeGetVisibleFunction(listItem) {
      var _this5 = this;
      return function () {
        if (!_this5.listNavigationMode) {
          return true; // without the special list navigation mode we return the default value true
        }
        // in list navigation mode
        if (!_this5.listNavigationModeCache[listItem.getId()]) {
          // the first time we return false
          _this5.listNavigationModeCache[listItem.getId()] = true;
          return false;
        } else {
          // all subsequent calls return the default true
          return true;
        }
      };
    },
    assembleObjectSuggestionLabels: function _assembleObjectSuggestionLabels(suggestion) {
      // first line: label 1
      var labels = [];
      var label1 = new Label("", {
        text: {
          path: "label1"
        }
      });
      label1.addEventDelegate({
        onAfterRendering: function onAfterRendering() {
          SearchHelper.boldTagUnescaper(label1.getDomRef());
        }
      }, label1);
      label1.addStyleClass("sapUshellSearchObjectSuggestion-Label1");
      labels.push(label1);

      // second line: label 2
      if (suggestion.label2) {
        var label2 = new Label("", {
          text: {
            path: "label2"
          }
        });
        label2.addEventDelegate({
          onAfterRendering: function onAfterRendering() {
            SearchHelper.boldTagUnescaper(label2.getDomRef());
          }
        }, label2);
        label2.addStyleClass("sapUshellSearchObjectSuggestion-Label2");
        labels.push(label2);
      }
      var vLayout = new VerticalLayout("", {
        content: labels
      });
      vLayout.addStyleClass("sapUshellSearchObjectSuggestion-Labels");
      return vLayout;
    },
    objectSuggestionItemFactory: function _objectSuggestionItemFactory(sId, oContext) {
      var _this6 = this;
      var suggestion = oContext.getObject();
      var suggestionParts = [];

      // image
      if (suggestion.imageExists && suggestion.imageUrl) {
        if (suggestion.imageUrl.startsWith("sap-icon://")) {
          suggestionParts.push(new Icon("", {
            src: suggestion.imageUrl
          }).addStyleClass("sapUshellSearchObjectSuggestIcon"));
        } else {
          suggestionParts.push(new SearchObjectSuggestionImage("", {
            src: {
              path: "imageUrl"
            },
            isCircular: {
              path: "imageIsCircular"
            }
          }));
        }
      }

      // labels
      var suggestionPartsToAdd = this.assembleObjectSuggestionLabels(suggestion);
      suggestionParts.push(suggestionPartsToAdd);

      // combine image and labels
      var cell = new HorizontalLayout("", {
        content: suggestionParts
      });
      cell.addStyleClass("sapUshellSearchObjectSuggestion-Container");
      cell["getText"] = function () {
        // ToDo, getText does not exist on type VerticalLayout
        // for preview of suggestion term in search input box
        return _this6.getValue();
      };

      // suggestion list item
      var listItem = new ColumnListItem("", {
        cells: [cell],
        type: ListType.Active
      });
      listItem.addStyleClass("searchSuggestion");
      listItem.addStyleClass("searchObjectSuggestion");
      return listItem;
    },
    regularSuggestionItemFactory: function _regularSuggestionItemFactory(sId, oContext) {
      var _this7 = this;
      // icon at the front:
      var icon = new Icon("", {
        src: {
          path: "icon"
        }
      }).addStyleClass("suggestIcon").addStyleClass("sapUshellSearchSuggestAppIcon").addStyleClass("suggestListItemCell");

      // recent search suggestions which have a filter will get this additional icon
      // at the end of the line:
      var filterIcon = new Icon("", {
        src: {
          path: "filterIcon"
        }
      }).addStyleClass("suggestIcon").addStyleClass("sapUshellSearchSuggestFilterIcon").addStyleClass("suggestListItemCell");
      var layoutData = new FlexItemData("", {
        shrinkFactor: 1,
        minWidth: "4rem"
      });

      // label
      var label = new Text("", {
        text: {
          path: "label"
        },
        layoutData: layoutData,
        wrapping: false
      }).addStyleClass("suggestText").addStyleClass("suggestNavItem").addStyleClass("suggestListItemCell");
      var suggestion = oContext.getModel().getProperty(oContext.getPath());
      label.addEventDelegate({
        onAfterRendering: function onAfterRendering() {
          if (suggestion.uiSuggestionType === SuggestionType.Recent) {
            // recent suggestions can be entered by the user. Thus he could also enter "<b>bold</b>" as search term
            // and the boldTagUnescaper would then render the search term as bold html.
            // TODO: call boldTagUnescaper for everything which is not in the <span>
            var domref = label.getDomRef();
            var innerHTML = domref.innerHTML;
            var userEntered = innerHTML.slice(innerHTML.indexOf("&lt;span&gt;") + 12, innerHTML.lastIndexOf("&lt;/span&gt;"));
            var notUserEntered = innerHTML.slice(innerHTML.lastIndexOf("&lt;/span&gt;") + 13);
            var notUserEnteredHTML = SearchHelper.boldTagUnescaperForStrings(notUserEntered);
            domref.innerHTML = "<span>" + userEntered + "</span>" + notUserEnteredHTML;
          } else {
            SearchHelper.boldTagUnescaper(label.getDomRef());
          }
        }
      }, label);
      var items = [icon, label];
      if (suggestion.filterIcon) {
        items.push(filterIcon);
      }

      // combine app, icon and label into cell
      var cell = new CustomListItem("", {
        type: ListType.Active,
        content: new FlexBox("", {
          items: items,
          alignItems: sap.m.FlexAlignItems.Center
        })
      });
      cell.addStyleClass("searchSuggestionCustomListItem");
      cell["getText"] = function () {
        return typeof suggestion.searchTerm === "string" ? suggestion.searchTerm : _this7.getValue();
      };
      var listItem = new ColumnListItem("", {
        cells: [cell],
        type: ListType.Active
      });
      cell.addStyleClass("searchSuggestionColumnListItem");
      if (suggestion.uiSuggestionType === SuggestionType.App) {
        if (suggestion.title && suggestion.title.indexOf("combinedAppSuggestion") >= 0) {
          listItem.addStyleClass("searchCombinedAppSuggestion");
        } else {
          listItem.addStyleClass("searchAppSuggestion");
        }
      }
      if (suggestion.uiSuggestionType === SuggestionType.DataSource) {
        listItem.addStyleClass("searchDataSourceSuggestion");
      }
      if (suggestion.uiSuggestionType === SuggestionType.SearchTermData) {
        listItem.addStyleClass("searchBOSuggestion");
      }
      if (suggestion.uiSuggestionType === SuggestionType.SearchTermHistory) {
        listItem.addStyleClass("searchHistorySuggestion");
      }
      if (suggestion.uiSuggestionType === SuggestionType.Recent) {
        listItem.addStyleClass("searchRecentSuggestion");
      }
      listItem.addStyleClass("searchSuggestion");
      return listItem;
    },
    navigateToSearchApp: function _navigateToSearchApp() {
      var oSearchModel = this.getModel();
      if (SearchHelper.isSearchAppActive() || !oSearchModel.config.isUshell) {
        // app running -> just fire query
        oSearchModel._firePerspectiveQuery();
      } else {
        // app not running -> start via hash
        // change hash:
        // - do not use Searchhelper.hasher here
        // - this is starting the search app from outside
        oSearchModel.resetSearchResultItemMemory();
        var sHash = oSearchModel.renderSearchURL();
        window.location.hash = sHash;
      }
    },
    getAriaDescriptionIdForNoResults: function _getAriaDescriptionIdForNoResults() {
      return this._ariaDescriptionIdNoResults;
    },
    onAfterRendering: function _onAfterRendering() {
      // const $input = $(this.getDomRef()).find("#searchFieldInShell-input-inner");
      $(this.getDomRef()).find("input").attr("autocomplete", "off");
      $(this.getDomRef()).find("input").attr("autocorrect", "off");
      // additional hacks to show the "search" button on ios keyboards:
      $(this.getDomRef()).find("input").attr("type", "search");
      $(this.getDomRef()).find("input").attr("name", "search");
      var $form = jQuery('<form action=""></form>').on("submit", function () {
        return false;
      });
      $(this.getDomRef()).children("input").parent().append($form);
      $(this.getDomRef()).children("input").detach().appendTo($form);
      // end of iOS hacks
      /* $input.attr(
          "aria-describedby",
          $input.attr("aria-describedby") + " " + this._ariaDescriptionIdNoResults
      ); */
    },

    onValueRevertedByEscape: function _onValueRevertedByEscape() {
      // this method is called if ESC was pressed and
      // the value in it was not empty
      if (SearchHelper.isSearchAppActive()) {
        // dont delete the value if search app is active
        return;
      }
      this.setValue(" "); // add space as a marker for following ESC handler
    }
  });

  return SearchInput;
});
})();