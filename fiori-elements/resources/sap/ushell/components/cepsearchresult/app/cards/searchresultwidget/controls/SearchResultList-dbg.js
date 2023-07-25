/*!
 * Copyright (c) 2009-2023 SAP SE, All Rights Reserved
 */
sap.ui.define([
  "sap/base/Log",
  "sap/m/List",
  "sap/m/ListRenderer",
  "sap/m/CustomListItem",
  "sap/m/OverflowToolbar",
  "sap/m/ToolbarSpacer",
  "sap/m/Button",
  "sap/m/SegmentedButton",
  "sap/m/SegmentedButtonItem",
  "sap/m/Title",
  "sap/ui/core/ResizeHandler",
  "sap/ui/Device",
  "sap/ui/dom/includeStylesheet",
  "sap/ushell/components/cepsearchresult/app/util/appendStyleVars",
  "sap/ui/core/Fragment",
  "./Paginator",
  "sap/m/Text",
  "./Highlighter"
], function (
  Log,
  List,
  ListRenderer,
  CustomListItem,
  OverflowToolbar,
  ToolbarSpacer,
  Button,
  SegmentedButton,
  SegmentedButtonItem,
  Title,
  ResizeHandler,
  Device,
  includeStylesheet,
  appendStyleVars,
  Fragment,
  Paginator,
  Text,
  Highlighter
) {
  "use strict";

  // Append style vars based on theme
  appendStyleVars([
    "sapUiShadowLevel0",
    "sapUiShadowLevel1",
    "sapUiBaseText",
    "sapUiContentLabelColor",
    "sapUiElementBorderCornerRadius",
    "sapMFontMediumSize",
    "sapUiListBorderColor",
    "sapMFontHeader4Size",
    "sapMFontMediumSize",
    "sapBackgroundColor",
    "sapUiTileBackground",
    "sapUiMarginSmall",
    "sapUiMarginTiny",
    "sapUiContentLabelColor",
    "sapUiAccent1",
    "sapUiAccentBackgroundColor1",
    "sapUiAccent2",
    "sapUiAccentBackgroundColor2",
    "sapUiAccent3",
    "sapUiAccentBackgroundColor3",
    "sapUiAccent4",
    "sapUiAccentBackgroundColor4",
    "sapUiAccent5",
    "sapUiAccentBackgroundColor5",
    "sapUiAccent6",
    "sapUiAccentBackgroundColor6",
    "sapUiAccent7",
    "sapUiAccentBackgroundColor7",
    "sapUiAccent8",
    "sapUiAccentBackgroundColor8",
    "sapUiAccent9",
    "sapUiAccentBackgroundColor8",
    "sapUiAccent10",
    "sapUiAccentBackgroundColor10",
    "sapMFontSmallSize",
    "sapUiButtonNegativeActiveBackground",
    "sapUiButtonSuccessActiveBackground",
    "sapUiButtonInformationActiveBackground",
    "sapUiButtonCriticalBackground",
    "sapUiIndication8HoverBackground"
  ]);
  // Include the css for the control once
  includeStylesheet(sap.ui.require.toUrl("sap/ushell/components/cepsearchresult/app/cards/searchresultwidget/controls/SearchResultList.css"));
  // Measure the current 1x1 tile size in px
  var oTileSpan = document.createElement("span");
  oTileSpan.classList.add("sapMGT", "OneByOne");
  oTileSpan.style.position = "absolute";
  oTileSpan.style.top = "-1000";
  document.body.appendChild(oTileSpan);
  var iStandardTileWidth = oTileSpan.offsetWidth + 5;
  oTileSpan.remove();
  // Header toolbar for cloning
  var oToolbarTemplate = new OverflowToolbar({
    content: [
      new ToolbarSpacer({ width: "0.5rem" }),
      new Title({ text: "{category>title} ({= ${count>}})", level: "H1" }),
      new ToolbarSpacer(),
      new SegmentedButton({
        selectedKey: "{category>list/_currentView}",
        visible: "{= ${category>list/views}.length > 1}",
        items: [
          new SegmentedButtonItem({
            icon: "sap-icon://text-align-justified",
            key: "List",
            visible: "{= ${category>list/views}.indexOf('List') > -1}"
          }),
          new SegmentedButtonItem({
            icon: "sap-icon://grid",
            key: "Tile",
            visible: "{= ${category>list/views}.indexOf('Tile') > -1}"
          }),
          new SegmentedButtonItem({
            icon: "sap-icon://business-card",
            key: "Card",
            visible: "{= ${category>list/views}.indexOf('Card') > -1}"
          })
        ]
      }),
      new ToolbarSpacer({ width: "1rem" })
    ]
  });

  function getFooterBar (oContent) {
    var oFooterBar = new OverflowToolbar({
      style: "Clear",
      content: [
        new ToolbarSpacer({ width: "1rem" }),
        new Text({
          visible: false,
          text: "Found {= ${count>}} items"
        }),
        new ToolbarSpacer(),
        oContent,
        new ToolbarSpacer({ width: "1rem" })
      ]
    });
    oFooterBar.addStyleClass("sapUiCEPCatFooterBar");
    oFooterBar.addStyleClass("sapUiTinyMarginBottom");
    oFooterBar.addStyleClass("sapUiTinyMarginTop");
    return oFooterBar;
  }
  // Footer toolbar for cloning
  function getPaginatorFooterBar (fHandler) {
    var oContent = new Paginator({
      visible: "{= ${count>} > ${category>list/paginator/pageSize}}",
      count: "{= ${count>} || 0}",
      pageSize: "{category>list/paginator/pageSize}",
      currentPage: "{category>list/paginator/currentPage}",
      selectPage: fHandler
    });
    return getFooterBar(oContent);
  }
  function getViewAllFooterBar (fHandler) {
    var oContent = new Button({
      text: "{i18n>CARD.List.Button.ViewAll}",
      press: fHandler
    });
    return getFooterBar(oContent);
  }

  /**
   * SearchResultList for search results
   */
  var SearchResultList = List.extend(
    "sap.ushell.components.cepsearchresult.app.cards.searchresultwidget.controls.SearchResultList",
    /** @lends sap.ushell.components.cepsearchresult.app.cards.serchresult.controls.SearchResultList.prototype */ {
      metadata: {
        properties: {
          category: {
            type: "object"
          },
          paging: {
            type: "boolean",
            defaultValue: true
          },
          viewAll: {
            type: "boolean",
            defaultValue: false
          },
          view: {
            type: "string",
            defaultValue: ""
          },
          template: {
            type: "object"
          },
          highlightTerm: {
            type: "string",
            defaultValue: ""
          }
        },
        aggregations: {
          _footer: {
            type: "sap.m.OverflowToolbar",
            multiple: false,
            hidden: true
          }
        },
        events: {
          selectPage: {},
          fetchData: {},
          showAll: {}
        }
      },
      renderer: function (rm, oControl) {
        ListRenderer.render(rm, oControl);
        if (oControl.getPaging() || oControl.getViewAll()) {
          rm.renderControl(oControl.getAggregation("_footer"));
        }
      }
    });
  // Initialize
  SearchResultList.prototype.init = function () {
    this.addStyleClass("sapUiCEPCatList");
    this._initToolbar();
    this._sViewHeight = "unset"; //let the browser decide the initial height
  };
  // Initialize the toolbar
  SearchResultList.prototype._initToolbar = function () {
    this.setHeaderToolbar(oToolbarTemplate.clone());
  };
  // Initialize the footer toolbar
  SearchResultList.prototype._initFooterBar = function () {
    var oFooter;
    if (this.getViewAll()) {
      oFooter = getViewAllFooterBar(this.handleViewAll.bind(this));
    } else {
      oFooter = getPaginatorFooterBar(this.handleSelectPage.bind(this));
    }
    this.setAggregation("_footer", oFooter);
  };
  // Initialize the item fragment from the Template names property.
  // Read from sap.ushell.components.cepsearchresult.app.cards.searchresultwidget.controls path
  SearchResultList.prototype._initTemplate = function () {
    if (!this.oTemplatePromise) {
      var oTemplateProperty = this.getTemplate();
      var sTemplate = "default";
      var sView = this.getView();
      if (oTemplateProperty && oTemplateProperty[sView]) {
        sTemplate = oTemplateProperty[sView];
      }
      this.oTemplatePromise = Fragment.load({
        type: "XML",
        name: "sap.ushell.components.cepsearchresult.app.cards.searchresultwidget.templates." +
          sTemplate,
        controller: this
      }).then(function (oFragment) {
        this.oTemplate = oFragment;
        this.oTemplatePromise = null;
        this.updateItems();
      }.bind(this));
    }
    return this.oTemplatePromise;
  };
  /**
    * Override  bindAggregation to define the factory based on the item template
    *
    * @param {sName} sName - the name of the aggregation to bind
    * @param {*} vBindingInfo - the binding info
    *
    * @return {this} this to allow method chaining
    *
    * @private
    */
  SearchResultList.prototype.bindAggregation = function (sName, vBindingInfo) {
    if (sName === "items") {
      vBindingInfo.factory = function (sId, oBindingInfo) {
        if (this.oTemplate) {
          return this.oTemplate.clone(sId);
        }
        return new CustomListItem();
      }.bind(this);
    }
    return List.prototype.bindAggregation.apply(this, [sName, vBindingInfo]);
  };

  /**
   * Calculates how many columns are currently occupied by flex cols LI tags in the list.
   *
   * @return {int} the number of cols
   *
   * @private
   */
  SearchResultList.prototype._getCurrentColCount = function () {
    if (this.getDomRef()) {
      var aItems = this.getDomRef().querySelectorAll(".sapMListItems > LI");
      var iCols = 1;
      var iTop = aItems[0].offsetTop;
      for (var i = 1; i < aItems.length; i++) {
        if (aItems[i].offsetTop <= iTop) {
          iCols = iCols + 1;
        } else {
          break;
        }
      }
      return iCols;
    }
  };
  /**
    * Override _startItemNavigation to modify the column navigation based on the view
    *
    * @private
    */
  SearchResultList.prototype._startItemNavigation = function () {
    List.prototype._startItemNavigation.apply(this, [false]);
    if (this._oItemNavigation) {
      if (this.getView() === "Tile") {
        this._oItemNavigation.setItemDomRefs(
          Array.from(this.getDomRef().querySelectorAll(".sapMGT"))
        );
      }
      this._oItemNavigation.setTableMode(false, true).setColumns(this._getCurrentColCount());
    }
  };
  /**
   * Sets the view property. Adds style classes depending on the view property
   *
   * @param {string} sValue - the view setting List, Tile, Card
   *
   * @return {this} this to allow method chaining
   *
   * @private
   */
  SearchResultList.prototype.setView = function (sValue) {
    var sCurrentValue = this.getProperty("view");
    this.setProperty("view", sValue);
    this.removeStyleClass("sapUiCEPCatListCard");
    this.removeStyleClass("sapUiCEPCatListTile");
    switch (sValue) {
      case "Card": this.addStyleClass("sapUiCEPCatListCard"); break;
      case "Tile": this.addStyleClass("sapUiCEPCatListTile"); break;
      default:
    }
    if (this._iGivenPageSize && this.getDomRef() && this.getDomRef().offsetWidth) {
      this.loadForVisibleItemCount(this._iGivenPageSize, this.getDomRef());
    }
    if (sValue && sCurrentValue !== sValue) {
      // reset the height and let the browser decide the height for this view
      this._sViewHeight = "unset";
    }
    if (this.getTemplate() !== null) {
      this._changeTemplate();
    }
    this.updateItems();
    return this;
  };

  SearchResultList.prototype.setViewAll = function (bValue) {
    this.setProperty("viewAll", bValue);
    this._initFooterBar();
  };
  SearchResultList.prototype.setTemplate = function (vValue) {
    if (vValue !== this.getTemplate() || !this.oTemplate) {
      this._changeTemplate();
      this.setProperty("template", vValue);
      this.updateItems();
    }
  };
  SearchResultList.prototype._changeTemplate = function () {
    if (this.oTemplatePromise) {
      // a fragment loading is already in progress, but the template changed
      // retrigger after loading
      this.oTemplatePromise
        .then(this._changeTemplate.bind(this), this._changeTemplate.bind(this));
      return;
    }
    this.oTemplatePromise = null;
    this.oTemplate = null;
    this._initTemplate();
  };

  SearchResultList.prototype.loadForVisibleItemCount = function (iGivenPageSize, oMeasureDomRef) {
    this._iGivenPageSize = iGivenPageSize;
    this._iCurrentPageSize = iGivenPageSize;
    var iCols, iRows;
    if (this.getView() === "Tile" && oMeasureDomRef) {
      iCols = Math.floor((oMeasureDomRef.offsetWidth - 30) / (iStandardTileWidth + 5));
      iRows = Math.ceil(iGivenPageSize / iCols);
      this._iCurrentPageSize = iRows * iCols;
    }
    if (this.getView() === "Card" && oMeasureDomRef) {
      iCols = Math.min(Math.floor((oMeasureDomRef.offsetWidth - 20) / 300), 3);
      iRows = Math.ceil(iGivenPageSize / iCols);
      this._iCurrentPageSize = iRows * iCols;
    }
    this.fireFetchData({
      page: 1,
      pageSize: this._iCurrentPageSize
    });
  };
  // Handles a selection of a page in the paginator
  SearchResultList.prototype.handleSelectPage = function (oEvent) {
    // keep the same height for the also for the navigated page
    // assumption the items height is stable
    this._sViewHeight = this.getDomRef().offsetHeight + "px";
    this.fireFetchData({
      page: oEvent.getParameter("page"),
      pageSize: this._iCurrentPageSize
    });
  };
  // Handles a selection of a page in the paginator
  SearchResultList.prototype.handleViewAll = function (oEvent) {
    this.fireShowAll({
      category: this.getModel("category").getProperty("/name")
    });
  };
  // Handles resize event and recalculates the columns
  SearchResultList.prototype._onResize = function (oEvent) {
    if (this._oItemNavigation) {
      this._oItemNavigation.setColumns(this._getCurrentColCount());
    }
    var sView = this.getView();
    // sometimes this event comes without a size or a old size
    if (sView === "Tile" &&
      oEvent.size &&
      Math.abs(this.getDomRef().offsetWidth - this.iCurrentWidth) > iStandardTileWidth) {
      this.loadForVisibleItemCount(this._iGivenPageSize, this.getDomRef());
      this._sViewHeight = "unset";
      this.getDomRef().style.height = this._sViewHeight;
    }
    if (this.getDomRef()) {
      this.iCurrentWidth = this.getDomRef().offsetWidth;
    }
  };
  SearchResultList.prototype.applyModelContexts = function (oModel, mContexts) {
    for (var n in mContexts) {
      this.setModel(oModel, n);
      this.setElementBindingContext(oModel.createBindingContext(mContexts[n]), n);
    }
  };
  SearchResultList.prototype.itemNavigate = function (oEvent) {
    //find ListItem
    var oParent = oEvent.getSource();
    while (oParent.getParent()) {
      if (oParent.getParent() === this) {
        this.fireItemPress({
          listItem: oParent,
          srcControl: oEvent.getSource()
        });
        break;
      }
      oParent = oParent.getParent();
    }
  };
  // Deregister Resize handler and erase footer dom ref for force rendering.
  SearchResultList.prototype.onBeforeRendering = function () {
    if (this._iResizeListenerId) {
      Device.resize.detachHandler(this._fnResizeListener);
      ResizeHandler.deregister(this._iResizeListenerId);
      this._iResizeListenerId = null;
    }
    if (this.getDomRef()) {
      this.getDomRef().nextElementSibling.remove();
    }
    if (this.getItems().length > 0) {
      this.removeStyleClass("sapUiCEPCatListNoData");
    } else {
      this.addStyleClass("sapUiCEPCatListNoData");
    }
    if (this._oHighlighter) {
      this._oHighlighter.destroy();
      this._oHighlighter = null;
    }
    List.prototype.onBeforeRendering.apply(this, arguments);
  };
  SearchResultList.prototype.onAfterRendering = function () {
    if (!this._iResizeListenerId) {
      this._fnResizeListener = this._onResize.bind(this);
      Device.resize.attachHandler(this._fnResizeListener);
      this._iResizeListenerId = ResizeHandler.register(this, this._fnResizeListener);
    }
    List.prototype.onAfterRendering.apply(this, arguments);
    this.getDomRef().style.height = this._sViewHeight;
    if (this.getHighlightTerm() && this.getItems().length > 0) {
      this._oHighlighter = new Highlighter(this.getDomRef().querySelector(".sapMListItems"), { isCaseSensitive: false, shouldBeObserved: true });
      this._oHighlighter.highlight(this.getHighlightTerm());
    }
  };
  return SearchResultList;
});
