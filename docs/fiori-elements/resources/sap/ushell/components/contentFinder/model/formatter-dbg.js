// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Filter, FilterOperator) {
    "use strict";
    return {
        /**
         * Formatter for the dialog title.
         *
         * @param {string} sNavigationTarget Current navigation target.
         * @return {string} The dialog title.
         * @since 1.113.0
         */
        formatDialogTitle: function (sNavigationTarget) {
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            var oModel = this.getView().getModel();

            if (sNavigationTarget === oModel.getProperty("/navigationTargets/widgetGallery")) {
                return oResourceBundle.getText("ContentFinder.WidgetGallery.Title");
            } else if (sNavigationTarget === oModel.getProperty("/navigationTargets/appSearchTiles")) {
                return oResourceBundle.getText("ContentFinder.AppSearch.AddTiles.Title");
            } else if (sNavigationTarget === oModel.getProperty("/navigationTargets/appSearchCards")) {
                return oResourceBundle.getText("ContentFinder.AppSearch.AddCards.Title");
            }
            return "";
        },

        /**
         * Formatter to set the title of AppSearch list.
         *
         * @param {string} sActiveNavigationTarget The currently selected/active navigation target.
         * @param {string} sSearchTerm GridContainer search field query.
         * @param {boolean} bShowSelectedPressed Show All Selected Button pressed property.
         * @param {int} iSelectedAppCount Count of all the Selected Apps.
         * @param {array} aTiles Array of tiles.
         * @param {array} aCards Array of cards.
         * @param {array} aRestrictedVisualizations Array of restricted visualizations.
         * @param {int} iFilteredAppCount Amount of filtered Viz.
         * @return {string} The GridContainer Title text.
         * @since 1.113.0
         */
        formatAppSearchTitle: function (sActiveNavigationTarget, sSearchTerm, bShowSelectedPressed, iSelectedAppCount, aTiles, aCards, aRestrictedVisualizations, iFilteredAppCount) {
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            var sResultText = "";
            var bItemsAvailable = false;

            //AppSearchTiles
            if (sActiveNavigationTarget === "appSearch_tiles") {
                bItemsAvailable = !!aTiles.length;

                if (!bItemsAvailable) {
                    sResultText = oResourceBundle.getText("ContentFinder.AppSearch.Title.NoTiles");
                } else {
                    sResultText = oResourceBundle.getText("ContentFinder.AppSearch.Title.AllTiles", aTiles.length);
                }

                if (bShowSelectedPressed) {
                    if (iSelectedAppCount) {
                        sResultText = oResourceBundle.getText("ContentFinder.AppSearch.Title.SelectedApp", iSelectedAppCount + aRestrictedVisualizations.length);
                    } else {
                        sResultText = oResourceBundle.getText("ContentFinder.AppSearch.Title.NoSelectedApp");
                    }
                }
            }

            //AppSearchCards
            if (sActiveNavigationTarget === "appSearch_cards") {
                bItemsAvailable = !!aCards.length;

                if (!bItemsAvailable) {
                    sResultText = oResourceBundle.getText("ContentFinder.AppSearch.Title.NoCards");
                } else {
                    sResultText = oResourceBundle.getText("ContentFinder.AppSearch.Title.AllCards", aCards.length);
                }
            }

            //Search
            if (sSearchTerm && !bItemsAvailable) {
                sResultText = oResourceBundle.getText("ContentFinder.AppSearch.Title.NoSearchResult", sSearchTerm);
            }

            if (sSearchTerm && bItemsAvailable) {
                sResultText = oResourceBundle.getText("ContentFinder.AppSearch.Title.SearchResult", [sSearchTerm, iFilteredAppCount]);
            }

            return sResultText;
        },

        /**
         * Determines the visibility property of ContentFinder dialog's 'Add' button.
         *
         * Currently, the "Add" button is only shown for tiles as cards are added directly.
         *
         * @param {string} sActiveNavigationTarget The currently active navigation target.
         * @since 1.113.0
         * @returns {boolean} Returns <code>true</code> in case the navigation target points to the appSearch.
         */
        addButtonIsVisibleInAppSearch: function (sActiveNavigationTarget) {
            var oModel = this.getView().getModel();

            return (sActiveNavigationTarget === oModel.getProperty("/navigationTargets/appSearchTiles"));
        }
    };
});
