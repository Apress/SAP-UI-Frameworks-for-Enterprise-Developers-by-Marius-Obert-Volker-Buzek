/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/ui/layout/ResponsiveSplitter", "sap/ui/layout/SplitterLayoutData", "sap/m/ScrollContainer", "sap/m/VBox", "sap/m/BusyDialog", "sap/ui/layout/SplitPane", "sap/ui/layout/PaneContainer", "sap/ui/core/library", "sap/m/Text", "../UIEvents", "./SearchResultList", "sap/ui/layout/VerticalLayout"], function (ResponsiveSplitter, SplitterLayoutData, ScrollContainer, VBox, BusyDialog, SplitPane, PaneContainer, sap_ui_core_library, Text, __UIEvents, __SearchResultList, VerticalLayout) {
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
  var Orientation = sap_ui_core_library["Orientation"];
  var UIEvents = _interopRequireDefault(__UIEvents);
  var SearchResultList = _interopRequireDefault(__SearchResultList);
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchLayoutResponsive = ResponsiveSplitter.extend("sap.esh.search.ui.controls.SearchLayoutResponsive", {
    renderer: {
      apiVersion: 2
    },
    metadata: {
      properties: {
        searchIsBusy: {
          type: "boolean"
        },
        busyDelay: {
          type: "int"
        },
        showFacets: {
          type: "boolean"
        },
        showFooter: {
          type: "boolean"
        },
        facetPanelResizable: {
          type: "boolean",
          defaultValue: false
        },
        facetPanelWidthInPercent: {
          type: "int",
          defaultValue: 25
        },
        facetPanelMinWidth: {
          type: "int",
          defaultValue: 288
        },
        animateFacetTransition: {
          type: "boolean",
          defaultValue: false
        },
        resultContainer: {
          // container for table, grid, list (, map)
          type: "sap.ui.core.Control",
          multiple: false
        }
      },
      aggregations: {
        facetPanelContent: {
          type: "sap.ui.core.Control",
          multiple: false
        },
        footer: {
          type: "sap.ui.core.Control",
          multiple: false
        }
      }
    },
    constructor: function _constructor(sId, options) {
      var _this = this;
      ResponsiveSplitter.prototype.constructor.call(this, sId, options);

      // facets
      var facetsDummyContainer = new VBox("", {
        items: [new Text()] // dummy for initialization
      });

      this._paneLeftContent = new SplitPane({
        requiredParentWidth: 10,
        // use minimal width -> single pane mode disabled
        content: facetsDummyContainer
      });
      this._paneLeftContainer = new PaneContainer({
        orientation: Orientation.Vertical,
        panes: [this._paneLeftContent]
      });
      // result list
      var resultScrollContainer = new ScrollContainer("", {
        height: "100%",
        vertical: true
      });
      // pane right, content
      var resultContainer = new VBox("", {
        items: [resultScrollContainer]
      });
      this._paneRightContent = new SplitPane({
        requiredParentWidth: 10,
        // use minimal width -> single pane mode disabled
        content: resultContainer
      });
      // pane right, container: header + content
      var combinedToolbar = new VBox();
      combinedToolbar.addStyleClass("sapUiNoMarginBottom");
      this._paneRightHeader = new SplitPane({
        requiredParentWidth: 10,
        // use minimal width -> single pane mode disabled
        content: combinedToolbar
      });
      this._paneRightContainer = new PaneContainer({
        orientation: Orientation.Vertical,
        panes: [this._paneRightHeader, this._paneRightContent]
      });
      // facet panel "hidden"
      this._paneLeftContainer.setLayoutData(new SplitterLayoutData({
        size: "0%",
        // width
        // minSize: this.getProperty("facetPanelMinWidth"),
        resizable: false
      }));
      // vertical
      this._paneRightHeader.setLayoutData(new SplitterLayoutData({
        size: "0%",
        // height
        resizable: false
      }));
      /* this._paneRightContent.setLayoutData(
          new SplitterLayoutData({
              size: "100%", // height
          })
      ); */
      // footer
      var footerDummyContainer = new VBox("", {
        items: [] // dummy for initialization
      });
      // panes
      this._paneMainContainer = new PaneContainer({
        orientation: Orientation.Horizontal,
        panes: [this._paneLeftContainer, this._paneRightContainer],
        resize: function resize() {
          _this.triggerUpdateLayout();
        }
      });
      this._paneMainFooter = new SplitPane({
        requiredParentWidth: 10,
        // use minimal width -> single pane mode disabled
        content: footerDummyContainer
      });
      this._paneMainContainer.setLayoutData(new SplitterLayoutData({
        size: "100%",
        // height
        resizable: false
      }));
      this._paneMainFooter.setLayoutData(new SplitterLayoutData({
        size: "0%",
        // height
        resizable: false
      }));
      var paneContainer = new PaneContainer({
        orientation: Orientation.Vertical,
        panes: [this._paneMainContainer, this._paneMainFooter]
      });
      this.setRootPaneContainer(paneContainer);
      this.setDefaultPane(this._paneRightContent);
    },
    getFacetPanelContent: function _getFacetPanelContent() {
      var facetContainer = this._paneLeftContent;
      if (facetContainer !== null && facetContainer !== void 0 && facetContainer.getContent()) {
        return facetContainer.getContent();
      }
      return undefined;
    },
    setFacetPanelContent: function _setFacetPanelContent(oControl) {
      this._facetPanelContent = oControl;
      var facetContainer = this._paneLeftContent;
      if (facetContainer) {
        this._paneLeftContainer.removeAllPanes();
        facetContainer.setContent(oControl);
        this._paneLeftContainer.addPane(facetContainer);
      }
    },
    getFooter: function _getFooter() {
      var footerContainer = this._paneMainFooter;
      if (footerContainer !== null && footerContainer !== void 0 && footerContainer.getContent()) {
        return footerContainer.getContent();
      }
      return undefined;
    },
    setFooter: function _setFooter(oControl) {
      this._footer = oControl;
      var footerContainer = this._paneMainFooter;
      if (footerContainer) {
        this.getRootPaneContainer().removeAllPanes();
        footerContainer.setContent(oControl);
        this.getRootPaneContainer().addPane(this._paneMainContainer);
        this.getRootPaneContainer().addPane(footerContainer);
      }
    },
    getResultContainer: function _getResultContainer() {
      var resultListScrollContainer = this._paneRightContent.getContent();
      if (resultListScrollContainer) {
        return resultListScrollContainer;
      }
      return undefined;
    },
    setResultContainer: function _setResultContainer(oControl) {
      this._resultContainer = oControl;
      // update result list
      if (this._paneRightContent) {
        this._paneRightContainer.removeAllPanes();
        this._paneRightContent.setContent(oControl);
        this._paneRightContainer.addPane(this._paneRightHeader);
        this._paneRightContainer.addPane(this._paneRightContent);
      }
    },
    setSearchIsBusy: function _setSearchIsBusy(isBusy) {
      var _this2 = this;
      if (isBusy) {
        if (this._busyFlag) {
          return;
        }
        if (this._busyTimeout) {
          return;
        }
        this._busyTimeout = setTimeout(function () {
          _this2._busyTimeout = null;
          _this2._setIsBusy(isBusy);
        }, this.getProperty("busyDelay"));
      } else {
        if (this._busyFlag) {
          this._setIsBusy(isBusy);
          return;
        }
        if (this._busyTimeout) {
          clearTimeout(this._busyTimeout);
          this._busyTimeout = null;
          return;
        }
      }
    },
    _setIsBusy: function _setIsBusy(isBusy) {
      var oModel = this.getModel();
      if (isBusy) {
        if (oModel.config.isUshell) {
          if (!this._busyIndicatorModal) {
            this._busyIndicatorModal = new BusyDialog();
          }
          this._busyIndicatorModal.open();
        } else {
          this.setBusyIndicatorDelay(0); // delay handled in setSearchBusy
          this.setBusy(true);
        }
        this._busyFlag = true;
      } else if (this._busyFlag) {
        if (oModel.config.isUshell) {
          if (this._busyIndicatorModal) {
            this._busyIndicatorModal.close();
          }
        } else {
          this.setBusy(false);
        }
        this._busyFlag = false;
      }
      this.setProperty("searchIsBusy", isBusy, true);
    },
    setShowFacets: function _setShowFacets(showFacets) {
      var _this$_footer;
      var oModel = this.getModel();
      if (!this._paneRightContainer) {
        return;
      }
      if (!this.getResultContainer()) {
        return;
      }
      var headerContent = this._paneRightHeader.getContent();
      var contextBarContainer = this._resultContainer.getAggregation("contextBarContainer");
      if (contextBarContainer && contextBarContainer instanceof VerticalLayout) {
        // if (contextBarContainer && contextBarContainer instanceof VBox) {
        contextBarContainer.addStyleClass("sapElisaSearchContainerCountBreadcrumbs");
        if (oModel.config.optimizeForValueHelp) {
          contextBarContainer.addStyleClass("sapElisaSearchContainerCountBreadcrumbsValueHelp");
        }
        if (headerContent instanceof VBox && headerContent.getItems().length === 0 || this._paneRightHeader.getContent() !== contextBarContainer) {
          // separate toolbar for context (breadcrumb+count)
          this._paneRightContainer.removeAllPanes();
          this._paneRightHeader.setContent(contextBarContainer);
          this._paneRightContainer.addPane(this._paneRightHeader);
          this._paneRightContainer.addPane(this._paneRightContent);
        }
      }
      var footerIsVisible = (_this$_footer = this._footer) === null || _this$_footer === void 0 ? void 0 : _this$_footer.getVisible();
      this.updateLayout(showFacets, footerIsVisible);
      return this; // return "this" to allow method chaining
    },

    setShowFooter: function _setShowFooter(showFooter) {
      if (!this._paneMainFooter) {
        return;
      }
      if (!this.getResultContainer()) {
        return;
      }
      var paneLeftContainerLayoutData = this === null || this === void 0 ? void 0 : this._paneLeftContainer.getLayoutData();
      var widthString = paneLeftContainerLayoutData.getProperty("size").replace("%", "");
      var facetPanelPaneWidth = parseInt(widthString);
      var facetsAreVisible = facetPanelPaneWidth > 0;
      this.updateLayout(facetsAreVisible, showFooter);
      return this; // return "this" to allow method chaining
    },

    setFacetPanelWidthInPercent: function _setFacetPanelWidthInPercent(facetPanelWidthInPercentValue) {
      // the 3rd parameter supresses rerendering
      this.setProperty("facetPanelWidthInPercent", facetPanelWidthInPercentValue, true); // this validates and stores the new value
      this._facetPanelWidthSizeIsOutdated = true;
      return this; // return "this" to allow method chaining
    },

    triggerUpdateLayout: function _triggerUpdateLayout() {
      var _this$_footer2;
      var paneLeftContainerLayoutData = this === null || this === void 0 ? void 0 : this._paneLeftContainer.getLayoutData();
      var widthString = paneLeftContainerLayoutData.getProperty("size").replace("%", "");
      var facetPanelPaneWidth = parseInt(widthString);
      var facetsAreVisible = facetPanelPaneWidth > 0;
      var footerIsVisible = (_this$_footer2 = this._footer) === null || _this$_footer2 === void 0 ? void 0 : _this$_footer2.getVisible();
      this.updateLayout(facetsAreVisible, footerIsVisible);
    },
    updateLayout: function _updateLayout(facetsAreVisible, footerIsVisible) {
      var _this$_paneRightConte,
        _this$_paneLeftConten,
        _this3 = this;
      // update facets
      // adjust the facet content
      var facetContainer = this._paneLeftContent;
      if ((facetContainer === null || facetContainer === void 0 ? void 0 : facetContainer.getContent()) instanceof VBox) {
        var vBoxItems = facetContainer.getContent().getItems();
        if ((vBoxItems === null || vBoxItems === void 0 ? void 0 : vBoxItems.length) > 0 && vBoxItems[0] instanceof Text) {
          this._paneLeftContainer.removeAllPanes();
          facetContainer.setContent(this._facetPanelContent);
          this._paneLeftContainer.addPane(facetContainer);
        }
      }
      // update result view
      // adjust the container
      if (((_this$_paneRightConte = this._paneRightContent) === null || _this$_paneRightConte === void 0 ? void 0 : _this$_paneRightConte.getContent()) instanceof VBox) {
        var _vBoxItems = this._paneRightContent.getContent().getItems();
        if ((_vBoxItems === null || _vBoxItems === void 0 ? void 0 : _vBoxItems.length) > 0 && _vBoxItems[0] instanceof ScrollContainer) {
          if (_vBoxItems[0].getContent().length === 0) {
            this._paneRightContainer.removeAllPanes();
            this._paneRightContent.setContent(this._resultContainer);
            this._paneRightContainer.addPane(this._paneRightHeader);
            this._paneRightContainer.addPane(this._paneRightContent);
          }
        }
      }
      // animation
      if (this._facetPanelContent) {
        // robustness when triggered by constructor
        if (this.getProperty("animateFacetTransition")) {
          this._facetPanelContent.addStyleClass("sapUshellSearchFacetAnimation");
        } else {
          this._facetPanelContent.removeStyleClass("sapUshellSearchFacetAnimation");
        }
      }
      // right pane - header height / splitter position
      // sum of all bar-heights
      var headerContent = this._paneRightHeader.getContent();
      var headerItems = headerContent.getContent();
      // const headerContent = this._paneRightHeader.getContent() as VBox;
      // const headerItems = headerContent.getItems();
      var visibleBarItemsTotalHeightPx = 0;
      var _iterator = _createForOfIteratorHelper(headerItems),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var headerItem = _step.value;
          if (headerItem.getVisible() && headerItem.getDomRef()) {
            visibleBarItemsTotalHeightPx += headerItem.getDomRef().getBoundingClientRect().height;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      var contextBarHeightRem = this.convertPixelToRem(visibleBarItemsTotalHeightPx);
      // set layout
      this._paneRightHeader.setLayoutData(new SplitterLayoutData({
        size: "".concat(contextBarHeightRem, "rem"),
        resizable: false
      }));
      // left pane - facets width / splitter position
      if (this !== null && this !== void 0 && (_this$_paneLeftConten = this._paneLeftContent) !== null && _this$_paneLeftConten !== void 0 && _this$_paneLeftConten.getContent()) {
        var currentFacetPanelWidthSize;
        var paneLeftContainerLayoutData = this === null || this === void 0 ? void 0 : this._paneLeftContainer.getLayoutData();
        if (!facetsAreVisible) {
          this._paneLeftContainer.setLayoutData(new SplitterLayoutData({
            size: "0%",
            // width
            minSize: 0,
            resizable: false
          }));
        } else {
          var oModel = this.getModel();
          var facetPanelMinWidth = this.getProperty("facetPanelMinWidth");
          if (oModel.config.optimizeForValueHelp) {
            currentFacetPanelWidthSize = 0.01; // facet panel currently needs to be visible/rendered to open filter dialog
            facetPanelMinWidth = 0;
          } else if (this._facetPanelWidthSizeIsOutdated) {
            currentFacetPanelWidthSize = this.getProperty("facetPanelWidthInPercent");
            this._facetPanelWidthSizeIsOutdated = false;
          } else {
            currentFacetPanelWidthSize = parseInt(paneLeftContainerLayoutData.getProperty("size").replace("%", ""));
            if (currentFacetPanelWidthSize < 1) {
              if (this._previousFacetPanelWidthSize) {
                currentFacetPanelWidthSize = this._previousFacetPanelWidthSize;
              } else {
                currentFacetPanelWidthSize = this.getProperty("facetPanelWidthInPercent");
              }
            }
          }
          this._paneLeftContainer.setLayoutData(new SplitterLayoutData({
            size: currentFacetPanelWidthSize + "%",
            minSize: facetPanelMinWidth,
            resizable: this.getProperty("facetPanelResizable")
          }));
          this._previousFacetPanelWidthSize = currentFacetPanelWidthSize; // remember width to restore when showing facets (after having closed them before)
        }
      }
      // footer
      var footerContent = this._paneMainFooter.getContent();
      if (typeof footerContent["getItems"] === "function" && footerContent["getItems"]().length === 0 && typeof this._footer !== "undefined") {
        this.getRootPaneContainer().removeAllPanes();
        this._paneMainFooter.setContent(this._footer);
        this.getRootPaneContainer().addPane(this._paneMainContainer);
        this.getRootPaneContainer().addPane(this._paneMainFooter);
      }
      if (footerIsVisible && window.document.getElementById(this._paneMainContainer.getParent().getParent().getId()) // check if already rendered
      ) {
        var footerHeight = 52;
        var searchUiHeight = window.document.getElementById(this._paneMainContainer.getParent().getParent().getId()).getBoundingClientRect().height;
        var mainContainerHeight = searchUiHeight - footerHeight;
        this._paneMainContainer.setLayoutData(new SplitterLayoutData({
          size: "".concat(mainContainerHeight, "px"),
          resizable: false
        }));
        this._paneMainFooter.setLayoutData(new SplitterLayoutData({
          size: "".concat(footerHeight, "px"),
          resizable: false
        }));
      } else {
        this._paneMainContainer.setLayoutData(new SplitterLayoutData({
          size: "100%",
          resizable: false
        }));
        this._paneMainFooter.setLayoutData(new SplitterLayoutData({
          size: "0%",
          resizable: false
        }));
      }
      var handleAnimationEnd = function handleAnimationEnd() {
        _this3.getModel().notifySubscribers(UIEvents.ESHSearchLayoutChanged);
      };

      // tell result list to resize/adopt
      var resultViewItems = this._resultContainer.getAggregation("centerArea"); // ToDo, improve resizing mechanism of SearchCompositeControl
      var _iterator2 = _createForOfIteratorHelper(resultViewItems),
        _step2;
      try {
        var _loop = function _loop() {
          var resultViewItem = _step2.value;
          if (resultViewItem instanceof SearchResultList) {
            if (_this3._postponedResultViewResizeTimer) {
              clearTimeout(_this3._postponedResultViewResizeTimer);
            }
            _this3._postponedResultViewResizeTimer = setTimeout(function () {
              return resultViewItem.resize();
            }, 10); // prevent rendering within 'After Rendering Phase'
          }
        };

        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          _loop();
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      var $searchFacets = jQuery(".sapUiFixFlexFixed"); // TODO: JQuery
      $searchFacets.one("transitionend", handleAnimationEnd); //  TODO: JQuery
    },

    convertRemToPixel: function _convertRemToPixel(remValue) {
      return remValue * parseFloat(getComputedStyle(document.documentElement).fontSize);
    },
    convertPixelToRem: function _convertPixelToRem(pxValue) {
      return pxValue / parseFloat(getComputedStyle(document.documentElement).fontSize);
    }
  });
  return SearchLayoutResponsive;
});
})();