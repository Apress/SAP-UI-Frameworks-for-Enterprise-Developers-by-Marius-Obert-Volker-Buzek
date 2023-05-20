//Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview MyHome migrate functionality for the PageRuntime view
 *
 * @version 1.113.0
 */

sap.ui.define([
    "sap/ushell/EventHub",
    "sap/ushell/Config",
    "sap/ushell/utils/HttpClient",
    "sap/base/util/ObjectPath",
    "sap/ui/core/Configuration"
], function (
    EventHub,
    Config,
    HttpClient,
    ObjectPath,
    Configuration
) {
    "use strict";
    var MyHomeImport = {};
    var sDefaultGroupId = "/UI2/Fiori2LaunchpadHome";

    /**
     * Requests the classical home page personalization
     *
     * @returns {Promise} Promise with array of personalized home page groups
     * @private
     */
    MyHomeImport.getData = function () {
        if (!this.oPageSetPromise) {
            this.oPageSetPromise = new Promise(function (resolve, reject) {
                var sRequestUrl = "PageSets('%2FUI2%2FFiori2LaunchpadHome')"
                    + "?$expand=Pages/PageChipInstances/ChipInstanceBags/ChipInstanceProperties,"
                    + "Pages/PageChipInstances/Chip"
                    + "&$format=json";

                var oHeaders = {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    Expires: "0",
                    "Accept-Language": Configuration.getLanguage() || "",
                    Accept: "application/json, text/plain"
                };
                var sSAPLogonLanguage = sap.ushell.Container.getUser().getLanguage();
                if (sSAPLogonLanguage) {
                    oHeaders["sap-language"] = sSAPLogonLanguage;
                }
                var oLogonSystem = sap.ushell.Container.getLogonSystem();
                var sSapClient = oLogonSystem && oLogonSystem.getClient();
                if (sSapClient) {
                    oHeaders["sap-client"] = sSapClient;
                }

                var oServiceConfig = (window["sap-ushell-config"].services && window["sap-ushell-config"].services.PageBuilding) || {};
                var sBaseUrl = (ObjectPath.get("config.services.pageBuilding.baseUrl", oServiceConfig.adapter) || "").replace(/\/?$/, "/");
                var oHttpClient = new HttpClient(sBaseUrl, {
                    headers: oHeaders
                });
                oHttpClient.get(sRequestUrl).then(function (result) {
                    resolve(this.parseData.bind(this)(result));
                }.bind(this)).catch(reject);
            }.bind(this));
        }
        return this.oPageSetPromise;
    };

    /**
     * Check if the import is enabled.
     * MYHOME_IMPORT_FROM_CLASSIC is set or classical home page contains personalized data to migrate.
     * If MYHOME_IMPORT_FROM_CLASSIC is not defined yet, read classic personalisation and update the flag accordingly.
     *
     * @returns {Promise} true if the migration is possible or needed.
     * @private
     */
    MyHomeImport.isImportEnabled = function () {
        //Respect MYHOME_IMPORT_FROM_CLASSIC before calling .getData()
        return sap.ushell.Container.getServiceAsync("UserInfo").then(function (oUserInfo) {
            var oUser = oUserInfo.getUser();
            var sImportBookmarksFlag = oUser.getImportBookmarksFlag();
            switch (sImportBookmarksFlag) {
                case "done":
                case "dismissed":
                case "not_required":
                    return false; // do not need to show the "import" message strip
                case null:
                    // MYHOME_IMPORT_FROM_CLASSIC is null. Check if there is data to import.
                    return this.getData().then(function (aGroups) {
                        var bImportNeeded = !!(aGroups.length);
                        var sImportFlag = bImportNeeded ? "pending" : "not_required";

                        oUser.setImportBookmarksFlag(sImportFlag);
                        oUserInfo.updateUserPreferences(); // Save MYHOME_IMPORT_FROM_CLASSIC in the back end
                        oUser.resetChangedProperty("importBookmarks");
                        return bImportNeeded;
                    });
                default:
                    return true; // show the message strip
            }
        }.bind(this));
    };

    /**
     * Convert response into required format. Keep only personalized groups.
     * @param {object} response HTTP response from Page Building Service
     * @returns {Array} Array of personalized home page groups or null in case of error
     */
    MyHomeImport.parseData = function (response) {
        try {
            var oPageSetData = JSON.parse(response.responseText);

            if (oPageSetData && oPageSetData.d) {
                oPageSetData = oPageSetData.d;
            }

            var oConfiguration = oPageSetData.configuration && JSON.parse(oPageSetData.configuration) || {};
            var aHiddenGroups = oConfiguration.hiddenGroups || [];

            // only display personalized not empty not hidden groups
            var aPages = oPageSetData.Pages.results.filter(function (page) {
                var bIsPersonalized = page.scope === "PERSONALIZATION";
                var bHasTiles = page.PageChipInstances.results.length > 0;
                var bIsNotHidden = aHiddenGroups.indexOf(page.id) === -1;
                return bIsPersonalized && bHasTiles && bIsNotHidden;
            });

            var aGroupOrder = oConfiguration.order || [];

            // sort groups to personalized order
            aPages.sort(function (x, y) {
                if (aGroupOrder.indexOf(x.id) > aGroupOrder.indexOf(y.id)) { return 1; }
                if (aGroupOrder.indexOf(x.id) < aGroupOrder.indexOf(y.id)) { return -1; }
                return 0;
            });
            var aLockedGroups = [];
            var oDefaultGroup;
            var aNonLockedGroups = [];

            // generate group model data and sort model data into different arrays
            aPages.forEach(function (page) {
                var oLayout;
                if (page.layout) {
                    oLayout = JSON.parse(page.layout);
                }

                var oModelGroup = {
                    id: page.id,
                    title: page.title,
                    isLocked: page.isPersLocked === "X",
                    isDefault: page.id === sDefaultGroupId,
                    tileOrder: oLayout && oLayout.order || [],
                    linkOrder: oLayout && oLayout.linkOrder || [],
                    chips: page.PageChipInstances.results
                };

                if (oModelGroup.isLocked) {
                    aLockedGroups.push(oModelGroup);
                } else if (oModelGroup.isDefault) {
                    oDefaultGroup = oModelGroup;
                } else {
                    aNonLockedGroups.push(oModelGroup);
                }
            });

            // sort only locked groups
            if (!Config.last("/core/home/disableSortedLockedGroups")) {
                aLockedGroups.sort(function (x, y) {
                    return x.title.toLowerCase() < y.title.toLowerCase() ? -1 : 1;
                });
            }

            // only concat default group if it was personalized
            if (oDefaultGroup) {
                aLockedGroups = aLockedGroups.concat(oDefaultGroup);
            }

            // update model with group model data
            return aLockedGroups.concat(aNonLockedGroups);
        } catch (e) {
            return null;
        }
    };

    /**
     * Set MYHOME_IMPORT_FROM_CLASSIC according to the user decision
     *
     * @param {boolean} bEnabled boolean flag.
     * @private
     */
     MyHomeImport.setImportEnabled = function (bEnabled) {
        EventHub.emit("importBookmarksFlag", !!bEnabled); // Inform MyHome view to hide the message strip
        sap.ushell.Container.getServiceAsync("UserInfo").then(function (oUserInfo) {
            var oUser = oUserInfo.getUser();
            var sImportFlag = bEnabled ? null : "dismissed";
            oUser.setImportBookmarksFlag(sImportFlag);
            oUserInfo.updateUserPreferences(); // Save MYHOME_IMPORT_FROM_CLASSIC in the back end
            oUser.resetChangedProperty("importBookmarks");
        });
    };

    return MyHomeImport;
});
