//Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @private
 */

sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/Core",
  "./util/SearchResultManager",
  "sap/ui/integration/Host",
  "sap/m/library",
  "sap/m/Menu",
  "sap/m/MenuItem",
  "./controls/FilterField",
  "sap/ushell/ui/footerbar/AddBookmarkButton"
], function (Controller, Core, SearchResultManager, Host, mLib, Menu, MenuItem, FilterField, AddBookmarkButton) {

  "use strict";
  var URLHelper = mLib.URLHelper;
  return Controller.extend("sap.ushell.components.cepsearchresult.app.Main", {

    onInit: function () {
      if (sap.ushell.Container) {
        var oShellRenderer = sap.ushell.Container.getRenderer();
        oShellRenderer.getRouter().getRoute("wzsearch").attachMatched(this.onRouteMatched.bind(this));
      }
      this.initCard();
      this.initSearchResultManager();
      this.applyPersonalization();
      this._sSearchTerm = this.getOwnerComponent().getSearchTerm();
    },
    onRouteMatched: function (oEvent) {
      var sSearchTerm = this._sSearchTerm;
      var sCategory = this._sCategory;
      var oArgs = oEvent.getParameter("arguments");
      var oQuery = oArgs["?query"];
      this._sCategory = oQuery && oQuery.category;
      this._sSearchTerm = oQuery && oQuery.searchTerm;
      if (sSearchTerm !== this._sSearchTerm && sCategory === this._sCategory) {
        this.updateSearchResultManager(this._sSearchTerm);
      } else if (sCategory !== this._sCategory) {
        this.initSearchResultManager();
      }
    },
    getSearchTerm: function () {
      return this._sSearchTerm || this.getOwnerComponent().getSearchTerm();
    },

    applyPersonalization: function () {
      this.getPersonalization("showFilterPanel", false + "").then(function (sValue) {
        this._showFilterPanel = sValue !== "true";
        this.toggleFilterPanel();
      }.bind(this));
    },

    getPersonalization: function (sKey, vDefault) {
      //personalization service missing
      var sValue = localStorage.getItem("sap.ushell.components.cepsearchresult.app-" + sKey);
      return Promise.resolve(sValue !== undefined ? sValue : vDefault);
    },

    setPersonalization: function (sKey, vValue) {
      //personalization service missing
      localStorage.setItem("sap.ushell.components.cepsearchresult.app-" + sKey, vValue + "");
    },

    initCard: function () {
      var oCard = this.getView().byId("searchResultWidget");
      if (!this.oHost) {
        this.oHost = new Host({
          id: "searchAppHost",
          resolveDestination: function (sName) {
            return null;
          }
        });
        oCard.setHost(this.oHost);
        this.oHost.attachAction(this.handleCardAction.bind(this));
      }
    },

    initSearchResultManager: function () {
      this.oSearchResultManager = new SearchResultManager(this.getOwnerComponent().getSearchConfig());
      var oModel = this.oSearchResultManager.getModel();
      this.oSearchResultManager._loaded.then(function () {
        if (oModel.getProperty("/categories/0/name") === "all" && oModel.getProperty("/categories").length === 2) {
          this.setCategory(oModel.getProperty("/categories/1/name"));
          this.byId("searchCategoriesTabs").getItems()[0].setVisible(false);
          this.byId("searchCategoriesTabs").getItems()[1].setVisible(false);
        } else {
          this.setCategory(this.getOwnerComponent().getCategory());
        }
        this.addFilterFields();
        this.setSummaryText();
        this.getView().setVisible(true);
        this.byId("searchResultWidget").setManifest(
          sap.ui.require.toUrl("sap/ushell/components/cepsearchresult/app/cards/searchresultwidget/manifest.json")
        );
      }.bind(this));
      this.getView().setModel(oModel, "manager");
    },

    updateSearchResultManager: function (sSearchTerm) {
      this._sSearchTerm = sSearchTerm;
      this.oSearchResultManager._loaded.then(function () {
        var oCard = this.getView().byId("searchResultWidget");
        if (oCard && oCard.setSearchTerm) {
          oCard.setParameter("searchTerm", sSearchTerm);
        }
        this.oSearchResultManager.getModel().setProperty("/totalCount", -1);
        this.oSearchResultManager.getModel().setProperty("/searchTerm", sSearchTerm);
      }.bind(this));
    },

    onExit: function () {
      if (this.oHost) {
        this.oHost.destroy();
      }
      this.oSearchResultManager = null;
      this.oHost = null;
    },

    tabSelectionChange: function (oEvent) {
      this.setCategory(oEvent.getParameters().item.getKey());
    },

    setCategory: function (sKey) {
      this.byId("searchCategoriesTabs").setSelectedKey(sKey);
      this.updateResultCard();
    },

    setSummaryText: function () {
      var oSummaryText = this.byId("summaryText");
      var oFilterPanel = this.byId("filterPanel");
      var aFilterItems = oFilterPanel.getItems();
      var sText = "";
      //collect sort
      sText = "Sort By: Relevance";
      //collect filter
      sText += " / ";
      var aFilters = [];
      for (var i = 1; i < aFilterItems.length; i++) {
        var oField = aFilterItems[i].getItems()[1];
        if (oField.getValue && oField.getValue()) {
          aFilters.push(aFilterItems[i].getItems()[0].getText());
        } else if (oField.getSelectedKeys && oField.getSelectedKeys().length > 0) {
          aFilters.push(aFilterItems[i].getItems()[0].getText());
        }
      }
      if (aFilters.length === 0) {
        sText += "No filters active";
      } else if (aFilters.length === 1) {
        sText += "1 filter active";
      } else {
        sText += aFilters.length + " filters active";
        oSummaryText.setTooltip("Active filters - " + aFilters.join(",\n"));
      }

      oSummaryText.setText(sText);
    },
    addFilterFields: function () {
      this.oSearchResultManager._loaded.then(function () {
        var aFilters = this.oSearchResultManager.getFilters(),
          oFilterPanel = this.byId("filterPanel"),
          oSort = oFilterPanel.getItems()[0]; // sort is in the view today.
        oFilterPanel.removeAllItems();
        oFilterPanel.addItem(oSort);
        if (aFilters) {
          aFilters.forEach(function (oConfig) {
            this.addFilterField(oConfig);
          }.bind(this));
        }
      }.bind(this));
    },

    addFilterField: function (oFilter) {
      var oFilterPanel = this.byId("filterPanel");
      var oFilterField = FilterField.create(oFilter, function () {
        this.setSummaryText();
      }.bind(this));
      oFilterPanel.addItem(oFilterField);
    },

    updateResultCard: function () {
      // remove the card from cell
      // necessary to reset the height of the cell
      // otherwise the scroll area is not updated when switching tabs
      var oCard = this.byId("searchResultWidget");
      var oCell = oCard.getParent();
      oCell.removeItem(oCard);
      oCard.setParameters({
        categories: this.byId("searchCategoriesTabs").getSelectedKey(),
        searchTerm: this.getSearchTerm(),
        edition: this.getOwnerComponent().getSearchConfig()
      });
      // add the card again
      oCell.addItem(oCard);
      this.oSearchResultManager.getModel().setProperty("/searchTerm", this.getSearchTerm());
    },

    onAfterRendering: function () {
      this.adaptScrollArea();
    },

    adaptScrollArea: function () {
      if (this.getView().getDomRef()) {
        var oContentArea = this.getView().getDomRef().querySelector(".sapUiCEPSRAppScroll");
        oContentArea.style.height = "calc( 100% - " + oContentArea.offsetTop + "px )";
      }
    },
    handleCardAction: function (oEvent) {
      if (oEvent.mParameters) {
        if (oEvent.mParameters.type === "Navigation" &&
          oEvent.mParameters.parameters.category) {
          this.setCategory(oEvent.mParameters.parameters.category);
        } else if (oEvent.mParameters.type === "Custom" &&
          oEvent.mParameters.parameters.categoryStateChange) {
          var oState = oEvent.mParameters.parameters.categoryStateChange;
          this.updateCounts(oState.name, oState.count);
        }
      }
      return true;
    },

    updateCounts: function (sName, iCount) {
      var oManagerModel = this.getView().getModel("manager");
      var oCategoriesMap = oManagerModel.getProperty("/categoriesMap");
      var iTotalCount = -1;
      oManagerModel.setProperty("/categoriesMap/" + sName + "/_state", {
        count: iCount,
        loading: iCount === -1
      });
      for (var n in oCategoriesMap) {
        var iCatCount = oManagerModel.getProperty("/categoriesMap/" + n + "/_state/count");
        if (iCatCount > -1) {
          iTotalCount = iTotalCount > -1 ? iTotalCount + iCatCount : iCatCount;
        }
      }
      oManagerModel.setProperty("/totalCount", iTotalCount);
    },

    /**
     * Formatter for the title in the xml view.
     * this method is not called in the context of the controller.
     *
     * @param {string} sTranslatedTitle - the title string.
     * @param {number} iTotalCount - the /totalCount model value.
     * @param {string} sSearchTerm - the current search term from /searchTerm.
     * @returns {string} the formatted value.
     */
    translateTitle: function (sTranslatedTitle, iTotalCount, sSearchTerm) {
      var s = sSearchTerm || "";
      var c = iTotalCount > -1 ? "(" + iTotalCount + ")" : "(...)";
      return sTranslatedTitle
        .replace("{0}", s)
        .replace("{1}", c);
    },

    /**
     * Toggles the filter panel
     */
    toggleFilterPanel: function () {
      this._showFilterPanel = !this._showFilterPanel;
      if (this._showFilterPanel) {
        this.byId("filterPanel").removeStyleClass("sapUiCEPSRFiltersHide");
        this.byId("filterPanelToggle").setPressed(true);
        this.byId("summaryText").setVisible(false);
      } else {
        this.byId("filterPanel").addStyleClass("sapUiCEPSRFiltersHide");
        this.byId("filterPanelToggle").setPressed(false);
        this.byId("summaryText").setVisible(true);
      }
      this.setPersonalization("showFilterPanel", this._showFilterPanel + "");

      // force core to apply rendering changes
      Core.applyChanges();
      this.adaptScrollArea();
    },

    /**
     * Opens the title menu and creates the menu items once.
     * @param {*} oEvent the event from the MenuButton
     */
    openTitleMenu: function (oEvent) {
      if (!this._oTitleMenu) {
        var oI18n = this.getView().getModel("appI18n");
        this._oTitleMenu = new Menu({
          items: [
            new MenuItem({
              text: "{appI18n>SEARCHRESULTAPP.TitleMenu.SaveAsTile}",
              icon: "sap-icon://header",
              press: this.triggerBookmark.bind(this)
            }),
            new MenuItem({
              text: "{appI18n>SEARCHRESULTAPP.TitleMenu.Email}",
              icon: "sap-icon://email",
              press: this.triggerEmail.bind(this)
            })
          ]
        });
        this._oTitleMenu.setModel(oI18n, "appI18n");
      }
      this._oTitleMenu.openBy(oEvent.getSource());
    },

    /**
     * Triggers the creation of a bookmark tile to this search term via AddBookmarkButton
     * @see sap/ushell/ui/footerbar/AddBookmarkButton
     */
     triggerBookmark: function () {
      var oBundle = this.getView().getModel("appI18n").getResourceBundle();
      var oBookmark = new AddBookmarkButton({
        title: oBundle.getText("SEARCHRESULTAPP.Bookmark.Title", [this._sSearchTerm]),
        subtitle: "",
        tileIcon: "sap-icon://search",
        keywords: "search,result," + this._sSearchTerm,
        showGroupSelection: false,
        customUrl: document.location.hash
      });
      oBookmark.firePress();
    },

    /**
     * Triggers native mailto: to send the search URL via mail
     */
    triggerEmail: function () {
      var oBundle = this.getView().getModel("appI18n").getResourceBundle();
      URLHelper.triggerEmail(
        "",
        oBundle.getText("SEARCHRESULTAPP.EMail.Subject", [this._sSearchTerm]),
        document.location.href);
    }
  });
});
