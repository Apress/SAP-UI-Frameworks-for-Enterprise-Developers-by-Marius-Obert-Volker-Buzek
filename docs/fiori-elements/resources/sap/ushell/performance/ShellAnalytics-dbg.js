// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview Provides analytical data like duration for navigation steps in the shell, in FLP,
 *               in particular an array of all statistical records
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/EventHub",
    "sap/ushell/services/AppConfiguration",
    "sap/ushell/performance/StatisticalRecord",
    "sap/ushell/utils",
    "sap/ushell/Config"
], function (EventHub, AppConfiguration, StatisticalRecord, Utils, Config) {
    "use strict";

    var aStatisticalRecords = [],
        aDoable = [],
        oStatisticalRecord, // current statistical record
        oCurrentApplication,
        lastHashChangeTime,
        bHomePageLoaded = false,
        bInitialized = false;

    var TRIGGERS = {
        dashboardTileClick: "HOMEPAGE_TILE",
        dashboardTileLinkClick: "HOMEPAGE_LINK",
        catalogTileClick: "FINDER_TILE"
    };

    var NAVIGATION_MODE = {
        EXPLACE: "EXPLACE",
        INPLACE: "INPLACE"
    };

    var FLP_APPLICATION_LOOKUP = {
        "sap.ushell.components.appfinder": "FLP_FINDER",
        "sap.ushell.components.pages": "FLP_PAGE",
        "sap.ushell.components.homepage": "FLP_HOME"
    };

    var aTriggers = ["dashboardTileClick", "dashboardTileLinkClick", "catalogTileClick"];

    /**
     * Gets the event bus
     * @returns {object} oEventBus The event bus
     */
    function _getEventBus () {
        return sap.ui.getCore().getEventBus();
    }

    /**
     * Check if application id is homepage
     *
     * @param {string} sApplicationId fiori id
     * @param {boolean} isHomeApp true if it is a home app
     *
     * @returns {boolean} true for homepage and page runtime and for special case that it is a home application
     */
    function _isHomePage (sApplicationId, isHomeApp) {
        if (isHomeApp) {
            return true;
    }
        return sApplicationId && (sApplicationId === "FLP_HOME" || sApplicationId === "FLP_PAGE");
    }

    /**
     * Gets all statistical records
     * @returns {array} aStatisticalRecords Array of statistical records
     */
    function getAllRecords () {
        return aStatisticalRecords;
    }

    /**
     * Gets last closed record
     * @returns {object} oLastClosedRecord last closed record
     */
    function getLastClosedRecord () {
        var aClosedRecords = getAllRecords().filter(function (oRecord) {
            return oRecord.isClosed();
        });
        if (aClosedRecords.length > 0) {
            return aClosedRecords[aClosedRecords.length - 1];
        }
        return null;
    }
    /**
     * Gets the next record acording to the start time in a navigation given a last tracked record
     * @param {object} oLastTrackedRecord The last tracked record
     * @returns {object} oNextNavigationRecord The next navigation record or undefined if it does not exist
     */
    function getNextNavigationRecords (oLastTrackedRecord) {
        if (!oLastTrackedRecord) {
            return getAllRecords();
        }

        return getAllRecords().filter(function (oRecord) {
            return oLastTrackedRecord.getTimeStart() < oRecord.getTimeStart() && oRecord.isClosed();
        });

    }

    function getCurrentApplication () {
        return oCurrentApplication;
    }

    function _setCurrentApplication (oApplication) {
        oCurrentApplication = oApplication;
    }

    /**
     * Tracks the time the hash changes
     */
    function _trackHashChangeTime () {
        lastHashChangeTime = performance.now();
        Utils.setPerformanceMark("FLP -- change hash");
    }
    /**
     * Gets the current statistical record or creates it if it does not exist
     * @returns {object} oStatisticalRecord The current statistical record
     */
    function _getOrCreateCurrentStatisticalRecord () {
        if (!oStatisticalRecord) {
            oStatisticalRecord = new StatisticalRecord();
            aStatisticalRecords.push(oStatisticalRecord);
        }
        return oStatisticalRecord;
    }

    /**
     * Handles home page action
     * @param {string} sChannel EventBus channel
     * @param {string} sEvent EventBus event name
     */
    function _handleHomepageAction (sChannel, sEvent) {
        _getOrCreateCurrentStatisticalRecord().setTrigger(TRIGGERS[sEvent]);
    }

    /**
     * Tracks a new target hash with time in a statistical record
     * @param {object} sNewHash New hash value
     */
    function trackNewTargetHash (sNewHash) {
        _getOrCreateCurrentStatisticalRecord().setTargetHash(sNewHash);
        _getOrCreateCurrentStatisticalRecord().setTimeStart(lastHashChangeTime || performance.now());
    }
    /**
     * Removes the parameters of a technical name that comes
     * with a transaction name and parameters.
     * Removes star at the beginning if it exists.
     * Replaces the string (TCODE) by the string (TR) at the end.
     * @param {string} sTechnicalName Technical name of a transaction with parameters or WD application
     * @returns {stirng} The transaction name or an empty string if input is not a transaction
     */
    function _removeParametersIfTransaction (sTechnicalName) {
       var sTechnicalNameWithDefault = sTechnicalName || "";
       if (sTechnicalNameWithDefault.slice(-7) === "(TCODE)") {
           return sTechnicalNameWithDefault
           .replace(/ .*/, "") // remove all starting with a space
           .replace(/^\*/, "") // remove star at the beginning
           .substring(0, 15) // trim 15 char
           .concat(" (TR)"); // add type
       }
       return sTechnicalNameWithDefault;
   }

/**
     * Gets the current application id from the manifest.
     * @param {object} oCurrentApp The application object from sap.ushell.Container.getServiceAsync("AppLifeCycle")
     * @returns {string} Application id like sap.ushell.components.homepage
     */
    function _getAppIdFromManifest (oCurrentApp) {
        var sApplicationId = "";
        var oApplicationManifest = oCurrentApp && oCurrentApp.componentInstance && oCurrentApp.componentInstance.getManifest();
        if (oApplicationManifest && oApplicationManifest["sap.app"] && oApplicationManifest["sap.app"].id) {
            sApplicationId = oApplicationManifest["sap.app"].id;
        }
        return sApplicationId;
    }

    /**
     * Gets the current application. This can be a UI5, Web Dynpro, SAP GUI or WCF application
     * @returns {Promise<object>} A promise to be resolved after service is loaded. The promise resolves to the current application.
     */
    function _getCurrentApplication () {
        return sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function (oAppLifeCycleService) {
            // error case
            var oCurrentApp = oAppLifeCycleService.getCurrentApplication();
            if (!oCurrentApp) {
                return {};
            }
            // some preparation
            var bIsHomeApp = oCurrentApp
                && oCurrentApp.componentInstance
                && oCurrentApp.componentInstance.sId
                && oCurrentApp.componentInstance.sId.includes("homeApp-component");
            var oPromiseFioriIds;
            // Method getTechnicalParamter might not exists.
            if (oCurrentApp.getTechnicalParameter) {
                oPromiseFioriIds = oCurrentApp.getTechnicalParameter("sap-fiori-id");
            } else {
                oPromiseFioriIds = Promise.resolve([]);
            }

            // get Fiori Id
            return oPromiseFioriIds.then(function (aFiorids) {
                var sApplicationId = aFiorids && aFiorids[0];
                // custom home
                if (bIsHomeApp) {
                        return {
                            type: "UI5",
                            id: sApplicationId,
                            isHomeApp: true
                        };
                }

                // home page
                if (oCurrentApp.homePage) {
                    var sId = FLP_APPLICATION_LOOKUP[_getAppIdFromManifest(oCurrentApp)] || "FLP_HOME";
                    return {
                        type: "UI5",
                        id: sId
                    };
                }

                // UI5 app
                if (oCurrentApp.applicationType === "UI5") {
                    if (!sApplicationId) {
                        sApplicationId = _getAppIdFromManifest(oCurrentApp);
                        //Additional check that it is not flp application
                        sApplicationId = FLP_APPLICATION_LOOKUP[sApplicationId] || sApplicationId;
                    }
                    //sApplicationId from sap.app.id can have comma (there is no validation from manifest validation)
                    sApplicationId = sApplicationId.replace(/,/g, "");
                    return {
                        type: "UI5",
                        id: sApplicationId
                    };
                }

                // application Type WDA / TR / WCF
                // get technicalName from application configuration
                var sTechnicalNameFromAppConfiguration = AppConfiguration.getMetadata().technicalName || AppConfiguration.getCurrentApplication().text || oCurrentApp.applicationType;
                var sTechnicalNameForFESR = _removeParametersIfTransaction(
                    //need to remove all comma, because fesr has the csv format with comma separation
                        sTechnicalNameFromAppConfiguration.replace(/,/g, "")
                    );

                return {
                    type: oCurrentApp.applicationType,
                    id: sTechnicalNameForFESR
                };
            });
        });
    }



    /**
     * Closes Navigation by closing the statistical record with updated data.
     * Additionally method check if the homepage loaded the first time (use global bHomePageLoaded variable)
     * and update the record respectively.
     *
     * @param {string} sSourceApplication source application id
     * @param {object} oTargetApplication target application
     * @param {string} oTargetApplication.id Fiori id for ui5 application or sTechnicalName for others
     * @param {string} oTargetApplication.type Type of the application. For example, UI5
     * @param {string} sNavigationMode navigation mode
     */
    function _closeNavigation (sSourceApplication, oTargetApplication, sNavigationMode) {
        if (oStatisticalRecord) {
            var sTargetApplication = oTargetApplication ? oTargetApplication.id : null;
            oStatisticalRecord.setSourceApplication(sSourceApplication);
            oStatisticalRecord.setTargetApplication(sTargetApplication);
            oStatisticalRecord.setApplicationType(oTargetApplication ? oTargetApplication.type : null);
            oStatisticalRecord.setNavigationMode(sNavigationMode);
            oStatisticalRecord.setIsHomeApp(oTargetApplication && oTargetApplication.isHomeApp);
            if (!bHomePageLoaded && _isHomePage(sTargetApplication, oTargetApplication && oTargetApplication.isHomeApp)) {
                bHomePageLoaded = true;
                oStatisticalRecord.setHomepageLoading(true);
            }
            oStatisticalRecord.closeRecord();
            oStatisticalRecord = null;
        }
    }

    /**
     * Closes the inplace navigation
     * @param {object} oEventData data for the event
     */
    function _closeInplaceNavigation (oEventData) {
        if (!oStatisticalRecord) {
            return;
        }
        _getCurrentApplication().then(function (oTargetApplication) {
            var oCurrentApp = getCurrentApplication();
            // correct the target application in stateful case
            if (oEventData && oEventData.technicalName) {
                oTargetApplication.id = _removeParametersIfTransaction(oEventData.technicalName);
                oTargetApplication.type = oTargetApplication.id.slice(-4) === "(TR)" ? "GUI" : "NWBC";
            }
            _setCurrentApplication(oTargetApplication);
            _closeNavigation(oCurrentApp ? oCurrentApp.id : undefined, oTargetApplication, NAVIGATION_MODE.INPLACE);
        });
    }

    /**
     * Closes explace navigation
     */
    function _closeExplaceNavigation () {
        var oCurrentApp = getCurrentApplication();
        _closeNavigation(oCurrentApp ? oCurrentApp.id : undefined, null, NAVIGATION_MODE.EXPLACE);
    }

    /**
     * Closes navigation in the error case
     */
    function _closeNavigationWithError () {
        if (oStatisticalRecord) {
            var oCurrentApp = getCurrentApplication();
            oStatisticalRecord.setSourceApplication(oCurrentApp ? oCurrentApp.id : undefined);
            oStatisticalRecord.closeRecordWithError();
            oStatisticalRecord = null;
        }
    }

    /**
     * attaches change listener
     */
    function _attachHashChangeListener () {
        sap.ushell.Container.getServiceAsync("ShellNavigation").then(function (oShellNavigation) {
            oShellNavigation.hashChanger.attachEvent("hashChanged", _trackHashChangeTime);
            oShellNavigation.hashChanger.attachEvent("shellHashChanged", _trackHashChangeTime);
        });
    }
    /**
     * detach change listener
     */
    function _detachHashChangeListener () {
        sap.ushell.Container.getServiceAsync("ShellNavigation").then(function (oShellNavigation) {
            oShellNavigation.hashChanger.detachEvent("hashChanged", _trackHashChangeTime);
            oShellNavigation.hashChanger.detachEvent("shellHashChanged", _trackHashChangeTime);

        });
    }

    /**
     * enables shell analytics
     * the following events are listened to and record the completion of the step
     *  ShellNavigationInitialized: track the time of hash change
     *  AppRendered: open app inplace
     *  openedAppInNewWindow: open app explace
     *  firstSegmentCompleteLoaded: start home page
     *  doHashChangeError: error during the resolving
     */
    function enable () {
        if (bInitialized) {
            return;
        }
        bInitialized = true;

        aTriggers.forEach(function (item) {
            _getEventBus().subscribe("launchpad", item, _handleHomepageAction);
        });

        var oDoable;
        //track the time of hash change
        oDoable = EventHub.once("ShellNavigationInitialized").do(_attachHashChangeListener);
        aDoable.push(oDoable);
        //Event handling for all target applications
        oDoable = EventHub.on("trackHashChange").do(trackNewTargetHash);
        aDoable.push(oDoable);
        //open app inplace
        oDoable = EventHub.on("AppRendered").do(_closeInplaceNavigation);
        aDoable.push(oDoable);
        // open custom home
        oDoable = EventHub.on("CustomHomeRendered").do(_closeInplaceNavigation);
        aDoable.push(oDoable);
        //open app explace
        oDoable = EventHub.on("openedAppInNewWindow").do(_closeExplaceNavigation);
        aDoable.push(oDoable);
        // home page starten
        oDoable = EventHub.on("firstSegmentCompleteLoaded").do(_closeInplaceNavigation);
        aDoable.push(oDoable);
        //error during the resolving
        oDoable = EventHub.on("doHashChangeError").do(_closeNavigationWithError);
        aDoable.push(oDoable);
        //Render page runtime
        oDoable = EventHub.on("PagesRuntimeRendered").do(_closeInplaceNavigation);
        aDoable.push(oDoable);
        //Stateful container, cached application, etc.
        oDoable = EventHub.on("CloseFesrRecord").do(_closeInplaceNavigation);
        aDoable.push(oDoable);

    }

    /**
     * disables shell analytics
     */
    function disable () {
        if (!bInitialized) {
            return;
        }

        aTriggers.forEach(function (item) {
            _getEventBus().unsubscribe("launchpad", item, _handleHomepageAction);
        });

        aDoable.forEach(function (oDoable) {
            oDoable.off();
        });

        _detachHashChangeListener();
        _setCurrentApplication(null);
        aStatisticalRecords = [];
        oStatisticalRecord = null;
        bInitialized = false;
    }

    return {
        enable: enable,
        disable: disable,
        getAllRecords: getAllRecords,
        getCurrentApplication: getCurrentApplication,
        getLastClosedRecord: getLastClosedRecord,
        getNextNavigationRecords: getNextNavigationRecords
    };

}, /* bExport= */ false);
