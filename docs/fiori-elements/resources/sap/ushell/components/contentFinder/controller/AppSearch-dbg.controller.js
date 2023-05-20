// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @file AppSearch controller for AppSearch view
 * @version 1.113.0
 */
sap.ui.define([
    "./ContentFinderDialog.controller",
    "../model/formatter",
    "sap/base/Log",
    "sap/f/GridContainerItemLayoutData",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ushell/ui/contentFinder/AppBox"
], function (
    ContentFinderController,
    formatter,
    Log,
    GridContainerItemLayoutData,
    Filter,
    FilterOperator,
    AppBox
) {
    "use strict";

    /**
     * Controller of the AppSearch view.
     *
     * @param {string} sId Controller id
     * @param {object} oParams Controller parameters
     * @class
     * @assigns sap.ui.core.mvc.Controller
     * @private
     * @since 1.113.0
     * @alias sap.ushell.components.contentFinder.controller.AppSearch
     */
    return ContentFinderController.extend("sap.ushell.components.contentFinder.controller.AppSearch", {
        /**
         * The contentFinder formatters.
         *
         * @since 1.113.0
         * @private
         */
        formatter: formatter,

        /**
         * Enum for available filters.
         *
         * @since 1.111.0
         * @private
         */
        filters: {
            search: "searchFilter",
            select: "selectFilter"
        },

        /**
         * The init function called after the view is initialized.
         *
         * @since 1.113.0
         * @private
         */
        onInit: function () {
            this._oActiveFilters = {};
            this.oModel = this.getOwnerComponent().getModel();
            this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            this.getOwnerComponent().getNavContainer().then(function (oNavContainer) {
                // Attach to the navigate-event to the NavContainer only for the targets relevant to the AppSearch
                oNavContainer.attachNavigate(function () {
                    var sActiveNavigationTarget = this.oModel.getProperty("/activeNavigationTarget");
                    if (sActiveNavigationTarget === this.oModel.getProperty("/navigationTargets/appSearchTiles")
                        || sActiveNavigationTarget === this.oModel.getProperty("/navigationTargets/appSearchCards")
                    ) {
                        this._resetFilters();
                    }
                }.bind(this));
            }.bind(this));
        },

        /**
         * Event handler which is called when the App Search is triggered.
         *
         * @param {sap.ui.base.Event} oEvent SearchBox Search Event Object.
         * @since 1.113.0
         * @private
         */
        onAppSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");

            if (sQuery) {
                this._oActiveFilters[this.filters.search] = new Filter({
                    filters: [
                        new Filter("appId", FilterOperator.Contains, sQuery),
                        new Filter("title", FilterOperator.Contains, sQuery),
                        new Filter("subtitle", FilterOperator.Contains, sQuery),
                        new Filter("systemInfo", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                });
                this._applyFilters();
            } else {
                this._resetFilters([this.filters.search]);
            }
        },

        /**
         * Event handler which is called when an app box was selected.
         *
         * Updates selection related model data which shows the count of the selection in the button.
         * The selected items are added with a handler in the dialog.
         *
         * @since 1.113.0
         * @private
         */
        onAppBoxSelected: function () {
            this.oModel.setProperty("/appSearch/selectedAppCount", this.getOwnerComponent().getSelectedAppBoxes(false).length);
        },

        /**
         * Event handler which is called when an app box was selected
         * and the dialog closes.
         *
         * This is used to add a single app box and close the dialag afterwards
         * (e.g. for Cards).
         *
         * @param {sap.ui.base.Event} oEvent The Event object.
         * @since 1.113.0
         * @private
         */
        onAppBoxSelectedAndClose: function (oEvent) {
            oEvent.getSource().setSelected(true);
            this.getOwnerComponent().addVisualizations();
            this.getOwnerComponent().getRootControl().byId("contentFinderDialog").close();
        },

        /**
         * EventHandler which is called when the "show selected" button is pressed
         * to show only selected tiles/cards.
         *
         * The button can stay "pressed" after being pressed. Another press removes
         * this state which resets the filters.
         *
         * @param {sap.ui.base.Event} oEvent Button Press Event object.
         * @since 1.113.0
         * @private
         */
        onShowSelectedPressed: function (oEvent) {
            if (oEvent.getParameter("pressed")) {
                // In case the button is pressed, clear the search
                this.byId("appSearchField").clear();
                this._oActiveFilters[this.filters.select] = new Filter("selected", FilterOperator.EQ, true);
                this._applyFilters();
            } else {
                // Clear filters and the search
                this._resetFilters([this.filters.search, this.filters.select]);
                this.byId("appSearchField").clear();
            }
        },


        /**
         * Tile factory function.
         *
         * @param {string} sId The id in the DOM.
         * @param {object} oContext The binding context.
         * @returns {sap.ushell.ui.contentFinder.AppBox} The AppBox control.
         * @since 1.113.0
         * @private
         */
        tileFactory: function (sId, oContext) {
            var oLayoutData = new GridContainerItemLayoutData({
                columns: 1,
                rows: 1
            });

            return new AppBox({
                appId: oContext.getProperty("appId"),
                dataHelpId: oContext.getProperty("dataHelpId"),
                disablePreview: true,
                disabled: "{disabled}",
                gridGapSize: 1.5,
                icon: oContext.getProperty("icon"),
                id: "ContentFinderAppBoxTile-" + sId,
                info: oContext.getProperty("info"),
                launchUrl: oContext.getProperty("launchUrl"),
                layoutData: oLayoutData,
                posinset: oContext.getProperty("posinset"),
                select: this.onAppBoxSelected.bind(this),
                selectable: true,
                selected: "{selected}",
                setsize: oContext.getProperty("setsize"),
                showExtraInformation: true,
                showPreview: false,
                subtitle: oContext.getProperty("subtitle"),
                systemInfo: oContext.getProperty("systemInfo"),
                title: oContext.getProperty("title"),
                type: oContext.getProperty("type"),
                visible: "{visible}"
            });
        },

        /**
         * Cards factory function.
         *
         * @param {string} sId The id of the control.
         * @param {object} oContext Context object.
         * @returns {sap.ushell.ui.contentFinder.AppBox} The AppBox control.
         * @since 1.113.0
         * @private
         */
        cardFactory: function (sId, oContext) {
            var oLayoutData = new GridContainerItemLayoutData({
                columns: 1,
                rows: 1
            });

            return new AppBox({
                appId: oContext.getProperty("appId"),
                dataHelpId: oContext.getProperty("dataHelpId"),
                disablePreview: true,
                disabled: "{disabled}",
                gridGapSize: 0.75,
                icon: oContext.getProperty("icon"),
                id: "ContentFinderAppBoxCard-" + sId,
                info: oContext.getProperty("info"),
                launchUrl: oContext.getProperty("launchUrl"),
                layoutData: oLayoutData,
                posinset: oContext.getProperty("posinset"),
                press: this.onAppBoxSelectedAndClose.bind(this),
                previewSize: "Large",
                selectable: false,
                selected: "{selected}",
                setsize: oContext.getProperty("setsize"),
                showExtraInformation: true,
                showPreview: false,
                subtitle: oContext.getProperty("subtitle"),
                systemInfo: oContext.getProperty("systemInfo"),
                title: oContext.getProperty("title"),
                type: oContext.getProperty("type"),
                visible: "{visible}"
            });
        },

        /**
         * Apply the filter for the GridContainer List.
         *
         * @since 1.113.0
         * @private
         */
        _applyFilters: function () {
            var oGridContainer = this._getGridContainer();
            var oBinding = oGridContainer.getBinding("items");

            // Update list binding
            oBinding.filter(new Filter({
                filters: Object.values(this._oActiveFilters),
                and: true
            }), "Control");

            this.oModel.setProperty("/appSearch/filteredAppCount", oBinding.getLength());
        },

        /**
         * Resets the provided filters.
         *
         * In case no filters are provided all available filters are reset instead.
         *
         * @param {string[]} [aFilters] The filters which need to be reset. By default, all filters are reset
         * @since 1.113.0
         * @private
         */
        _resetFilters: function (aFilters) {
            if (!aFilters) {
                aFilters = Object.keys(this._oActiveFilters);
            }

            aFilters.forEach(function (filter) {
                if (!Object.values(this.filters).includes(filter)) {
                    Log.error("Invalid filter provided. Skipping.", null, this.getOwnerComponent().logComponent);
                    return;
                }
                delete this._oActiveFilters[filter];
            }.bind(this));
            this._applyFilters();
        },

        /**
         * Returns the GridContainer for the current widget type based on the active navigation target.
         *
         * In case the navigation is not valid or the GridContainer is not available, <code>null</code> is returned and an error is logged.
         *
         * @returns {sap.f.GridContainer|null} Returns the GridContainer or <code>null</code> and logs an error if not available.
         * @since 1.113.0
         * @private
         */
        _getGridContainer: function () {
            var sNavigationTargetAppSearchTiles = this.oModel.getProperty("/navigationTargets/appSearchTiles");
            var sNavigationTargetAppSearchCards = this.oModel.getProperty("/navigationTargets/appSearchCards");
            var sActiveNavigationTarget = this.oModel.getProperty("/activeNavigationTarget");

            if (sActiveNavigationTarget === sNavigationTargetAppSearchTiles) {
                return this.byId("tileGridContainer");
            } else if (sActiveNavigationTarget === sNavigationTargetAppSearchCards) {
                return this.byId("cardGridContainer");
            }

            Log.error("Invalid navigation target provided. Could not determine GridContainer.", null, this.getOwnerComponent().logComponent);

            return null;
        }
    });
});
