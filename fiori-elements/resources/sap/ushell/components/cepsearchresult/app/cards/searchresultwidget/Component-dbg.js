// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ushell/components/cepsearchresult/app/util/appendStyleVars"
], function (UIComponent, appendStyleVars) {
  "use strict";
  appendStyleVars([
    "sapUiShadowLevel0"
  ]);
  // Stylesheet is included by the component
  /**
   * Component of the Search Result Widget (Component Card - UI Integration Card)
   * The Card should be registered as a visualization of the Search Result Application
   * It is reusable on any WorkPage for the standard and advanced editions of Work Zone.
   *
   * @param {string} sId Component id
   * @param {object} oParams Component parameter
   *
   * @class
   * @extends sap.ui.core.UIComponent
   *
   * @private
   *
   * @since 1.110.0
   * @alias sap.ushell.components.cepsearchresult.cards.searchresultwidget.Component
   */
  var Component = UIComponent.extend("sap.ushell.components.cepsearchresult.cards.searchresultwidget.Component", /** @lends sap.ushell.components.cepsearchresult.cards.searchresultwidget.Component */{
    onCardReady: function (oCard) {
      // Holds the card for use inside the controller
      this.oCard = oCard;
      // add a style class to identify the card root in css
      this.oCard
        .addStyleClass("sapCEPSearchResultCard")
        .addStyleClass("sapFCardTransparent");
      // allow access to the card parameters
      this.mCardParameters = oCard.getCombinedParameters();
      this.oCard.setSearchTerm = function (sSearchTerm) {
        this.mCardParameters.searchTerm = sSearchTerm;
      };
    },
    /**
     * Returns the search term the component was initialized with by the corresponding intent.
     *
     * @private
     * @returns {string} the current search term.
     */
    getSearchTerm: function () {
      return this.mCardParameters.searchTerm;
    },
    /**
     * Returns the categories the card should display.
     *
     * @private
     * @returns {string} the current search term.
     */
    getCategories: function () {
      if (Array.isArray(this.mCardParameters.categories)) {
        return this.mCardParameters.categories.join(",");
      }
      return this.mCardParameters.categories;
    },
    /**
     * Returns the config the card should use for this category.
     *
     * @private
     * @returns {string} the config.
     */
    getConfig: function () {
      return this.mCardParameters._config;
    },
    /**
     * Returns the edition the card should use.
     *
     * @private
     * @returns {string} the edition.
     */
    getEdition: function () {
      return this.mCardParameters.edition;
    }
  });
  return Component;
});
