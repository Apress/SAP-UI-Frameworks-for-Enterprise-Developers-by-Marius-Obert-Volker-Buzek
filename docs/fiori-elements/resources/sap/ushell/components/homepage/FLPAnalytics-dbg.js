// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/services/AppConfiguration", // TODO: pending dependency migration
    "sap/base/Log",
    "sap/ui/thirdparty/jquery"
], function (
    AppConfiguration,
    Log,
    jQuery
) {
    "use strict";

    /* global hasher */

    /**
     * Manage UsageAnalytics event logging as a result of FLP user flows
     */

    // Launchpad action events that trigger logging
    var aObservedLaunchpadActions = ["deleteTile", "actionModeActive", "catalogTileClick", "dashboardTileClick", "dashboardTileLinkClick"],
        oEventBus = sap.ui.getCore().getEventBus(),
        that = this,
        oLaunchedApplications = {};

    function _logCustomEvent (eventType, customEventValue, aAdditionalValues) {
        sap.ushell.Container.getServiceAsync("UsageAnalytics").then(function (oUsageAnalytics) {
            oUsageAnalytics.logCustomEvent(eventType, customEventValue, aAdditionalValues);
        });
    }

    /**
     * Updates oLaunchedApplications with the title and opening time of the given application
     */
    function saveOpenAppicationData (applicationId) {
        var oMetadataOfTarget = AppConfiguration.getMetadata(); // TODO: pending dependency migration
        oLaunchedApplications[applicationId] = {};
        oLaunchedApplications[applicationId].startTime = new Date();
        oLaunchedApplications[applicationId].title = oMetadataOfTarget.title;
    }

    /**
     * Logs a "Time in App" event according to the given application ID
     *
     * Calculates the time according to the current (closing) time
     *  and the opening time that is kept on oLaunchedApplications[applicationId]
     */
    function logTimeInAppEvent (applicationId) {
        try {
            var appDuration = (new Date() - oLaunchedApplications[applicationId].startTime) / 1000;
            var additionalValue = oLaunchedApplications[applicationId].title;
            _logCustomEvent("FLP: Time in Application (sec)", appDuration, [additionalValue]);
        } catch (e) {
            Log.warning("Duration in application " + applicationId + " could not be calculated", null, "sap.ushell.components.homepage.FLPAnalytics");
        }
    }

    /**
     * Handler for published usageAnalytics events.
     */
    function handleAction (sChannelId, sEventId, oData) {
        var sApplicationId = hasher.getHash(),
            sApplicationTitle;

        window.swa.custom1 = { ref: sApplicationId };
        switch (sEventId) {
            case "appOpened":
                // In order to be notified when applications are launched - we rely on navContainer's attachAfterNavigate event.
                // but for the first navigation (e.g. login or direct URL in a new tab) we still need the "appOpened" event.
                saveOpenAppicationData(sApplicationId);
                _logCustomEvent("FLP: Application Opened", "Direct Launch", [oLaunchedApplications[sApplicationId].title]);
                oEventBus.unsubscribe("sap.ushell", "appOpened", handleAction);
                break;
            case "bookmarkTileAdded":
                sApplicationTitle = window.document.title;
                _logCustomEvent("FLP: Personalization", "Save as Tile", [
                    sApplicationTitle,
                    oData && oData.group && oData.group.title ? oData.group.title : "",
                    oData && oData.group && oData.group.id ? oData.group.id : "",
                    oData && oData.tile && oData.tile.title ? oData.tile.title : sApplicationTitle
                ]);
                break;
            case "actionModeActive":
                _logCustomEvent("FLP: Personalization", "Enter Action Mode", [oData.source]);
                break;
            case "catalogTileClick":
                _logCustomEvent("FLP: Application Launch point", "Catalog", []);
                break;
            case "dashboardTileClick":
                _logCustomEvent("FLP: Application Launch point", "Homepage", []);
                break;
            case "dashboardTileLinkClick":
                _logCustomEvent("FLP: Application Launch point", "Tile Group Link", []);
                break;
            default:
                break;
        }
    }

    /**
     * Handler of navContainer's AfterNavigate event (i.e. navigation between the container's pages)
     *
     * - Logs "TimeInAppEvent" for the source application (i.e. from which the navigation occurred)
     * - Updated data about the opened application
     * - Logs "Application Opened" event
     */
    function handleAfterNavigate (oEvent) {
        var sFromApplicationId,
            sToApplicationId,
            oTargetApplication;

        // For the source application (the one from which the user navigates) -
        // Calculate the time duration and log a "Time in Application" event
        if (oEvent.getParameter("from") && oEvent.getParameter("to")) {
            sFromApplicationId = oEvent.getParameter("from").getId().replace("application-", "").replace("applicationShellPage-", "");
            window.swa.custom1 = { ref: sFromApplicationId };
            logTimeInAppEvent(sFromApplicationId);
            // For the target application (the one to which the user navigates) -
            // Keep the opening time and title, and log an "Application Opened" event
            oTargetApplication = oEvent.getParameter("to");
            sToApplicationId = oTargetApplication.getId().replace("application-", "").replace("applicationShellPage-", "");
            saveOpenAppicationData(sToApplicationId);
            window.swa.custom1 = { ref: sToApplicationId };
            _logCustomEvent("FLP: Application Opened", "Fiori Navigation", [oLaunchedApplications[sToApplicationId].title]);
        }
    }

    /**
     * Handler of browser tab close event
     *
     * Logs a "Time in App" event
     */
    jQuery(window).on("unload", function (event) {
        var currentApp = window.location.hash.substr(1);
        logTimeInAppEvent(currentApp);
    });

    try {
        sap.ui.getCore().byId("viewPortContainer").attachAfterNavigate(handleAfterNavigate, that);
    } catch (e) {
        Log.warning("Failure when subscribing to viewPortContainer 'AfterNavigate' event", null, "sap.ushell.components.homepage.FLPAnalytics");
    }
    oEventBus.subscribe("sap.ushell.services.Bookmark", "bookmarkTileAdded", handleAction, that);
    aObservedLaunchpadActions.forEach(function (item) {
        oEventBus.subscribe("launchpad", item, handleAction, that);
    });
    oEventBus.subscribe("sap.ushell", "appOpened", handleAction, that);
});
