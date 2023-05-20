// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/integration/Extension",
    "sap/ushell/utils/UrlParsing",
    "sap/ushell/utils/AppType",
    "sap/ushell/library",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ushell/resources"
], function (Extension, UrlParsing, AppTypeUtils, ushellLibrary, Config, EventHub, resources) {
    "use strict";

    // shortcut for sap.ushell.AppType
    var AppType = ushellLibrary.AppType;

    /**
     * Formats a title string based on the app type.
     *
     * @param {string} sTitle Title to be formatted.
     * @param {string} sAppType The app type.
     * @returns {string} The formatted title.
     *
     * @private
     */
    function _titleFormatter (sTitle, sAppType) {
        if (sAppType === AppType.SEARCH) {
            return "\"" + sTitle + "\"";
        }
        return sTitle;
    }

    /**
     * Formats the description based on the app type.
     *
     * @param {string} sAppType The app type.
     * @returns {string} The formatted description.
     *
     * @private
     */
    function _descriptionFormatter (sAppType) {
        if (sAppType === AppType.SEARCH) {
            return resources.i18n.getText("recentActivitiesSearchDescription");
        }
        return AppTypeUtils.getDisplayName(sAppType);
    }

    return Extension.extend("sap.ushell.ui.cards.FrequentActivitiesExtension", {

        /**
         * Initializes the card extension.
         */
        init: function () {
            Extension.prototype.init.apply(this, arguments);
            this.oUserRecentsPromise = sap.ushell.Container.getServiceAsync("UserRecents");
            this.oCrossAppNavPromise = sap.ushell.Container.getServiceAsync("CrossApplicationNavigation");
        },

        /**
         * Exit callback. Cleans up the objects and turns of the event listening for EventHub events.
         */
        exit: function () {
            Extension.prototype.exit.apply(this, arguments);
            EventHub.on("newUserRecentsItem").off();
            EventHub.on("userRecentsCleared").off();
        },

        /**
         * When the card is loaded and ready () we will listen to the EventHub events newUserRecentsItem and userRecentsCleared to refresh the card data.
         */
        onCardReady: function () {
            EventHub.on("newUserRecentsItem").do(function () {
                // It will call getData() again, and show loading placeholders while loading.
                // Data sorting has to be implemented in the getData() method.
                this.getCard().refreshData();
            }.bind(this));

            EventHub.on("userRecentsCleared").do(function () {
                this.getCard().refreshData();
            }.bind(this));
        },

        /**
         * Gets the Data to be used for binding the card items.
         * @returns {Promise} A Promise with the frequently used card items.
         */
        getData: function () {
            if (!Config.last("/core/shell/model/enableTrackingActivity")) {
                return Promise.resolve([]);
            }

            if (this._sortedData) {
                return Promise.resolve(this._resolvedData);
            }

            return this.oUserRecentsPromise
                .then(function (oUserRecents) { // 1: get the data
                    return new Promise(function (resolve, reject) {
                        oUserRecents.getFrequentActivity()
                            .done(resolve)
                            .fail(reject);
                    });
                })
                .then(this._getActivitiesAsCardItems.bind(this)) // 2: prepare the data for the card
                .then(this._checkEnabled.bind(this)); // 3: determine which items are enabled - set their "Enabled" property
        },

        /**
         * Generates the card item objects for the given activities.
         * @param {Object []} aActivities Array of activities that need to be used to generate card items.
         * @returns {Promise []} Array of card item objects that can be bound to the list items of the card.
         *
         * @private
         */
        _getActivitiesAsCardItems: function (aActivities) {
            var aCardItems = [];
            for (var i = 0; i < aActivities.length; i++) {
                if (aActivities[i].url && aActivities[i].url !== "") {
                    var oShellHash = UrlParsing.parseShellHash(aActivities[i].url);
                    var oCardItem = {
                        Name: _titleFormatter(aActivities[i].title, aActivities[i].appType),
                        Description: _descriptionFormatter(aActivities[i].appType),
                        Icon: aActivities[i].icon || "sap-icon://product",
                        Url: aActivities[i].url
                    };
                    if (oShellHash) {
                        oCardItem.Intent = {
                            SemanticObject: oShellHash.semanticObject,
                            Action: oShellHash.action,
                            Parameters: oShellHash.params,
                            AppSpecificRoute: oShellHash.appSpecificRoute
                        };
                    } else {
                        oCardItem.Url = aActivities[i].url;
                    }
                    aCardItems.push(oCardItem);
                }
            }
            return aCardItems;
        },

        /**
         * Checks for a given array of card activities if each of them is enabled for user interaction.
         * It adds the Enabled property to each object with the boolean representation of enablement.
         * @param {Object []} aActivities Array of activities (frequently used apps) to check if each of them is enabled for user action.
         * @returns {Promise []} Array of resolved Promises of activities with the additional information about the interaction enablement for each entry.
         *
         * @private
         */
        _checkEnabled: function (aActivities) {
            var aPromises = aActivities.map(function (oActivity) {
                return this._isActionEnabled(oActivity)
                    .then(function (bEnabled) {
                        oActivity.Enabled = bEnabled;
                        return oActivity;
                    });
            }.bind(this));

            return Promise.all(aPromises);
        },

        /**
         * Checks if the navigation for a given context is supported. This is the case if eigther the activity
         * Url property is a Url or a parseable ShellHash.
         * @param {Object} oActivity activity for which the navigation support is checked
         * @returns {Promise} Resolves to true if the navigation is supported or an Url is given, false else.
         *
         * @private
         */
        _isActionEnabled: function (oActivity) {
            var oShellHash = UrlParsing.parseShellHash(oActivity.Url);

            if (!oShellHash) {
                return Promise.resolve(true);
            }

            var oParameters = oShellHash.params;

            var oNavigation = {
                target: {
                    semanticObject: oShellHash.semanticObject,
                    action: oShellHash.action
                },
                params: oParameters
            };

            return this.oCrossAppNavPromise.then(function (oCrossAppNav) {
                return new Promise(function (resolve) {
                    oCrossAppNav.isNavigationSupported([oNavigation])
                        .done(function (aResponses) {
                            resolve(aResponses[0].supported);
                        })
                        .fail(function () {
                            resolve(false);
                        });
                });
            });
        }
    });
});
