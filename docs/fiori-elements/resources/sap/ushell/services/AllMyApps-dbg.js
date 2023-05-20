// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
], function (
) {
    "use strict";

    /**
     * A UShell service for registering an external provider of content (i.e., data source) to display All My Apps UI in the SAP Fiori launchpad.<br><br>
     * All My Apps UI is a Unified Shell module that allows the user to view their available data sources and applications
     * and to launch/navigate to an application.<br>
     * A data sources can be one of the following types:<br>
     *  - Home page apps (clustered by groups)<br>
     *  - Catalog<br>
     *  - External provider<br><br>
     * All My Apps is a master-details UI that presents a list of data sources in the master area and the contained applications in the data area.<br>
     * All My Apps feature can be disabled or enabled through service configuration (see launchpad configuration parameters).<br>
     * You can use the service function isEnabled to check whether the feature is enabled or not.<br><br>
     *
     * The various data source types are also enabled or disabled through the service configuration.<br>
     * You can use the following service functions to check if a specific data source is enabled or not:<br>
     * - isHomePageAppsEnabled<br>
     * - isCatalogAppsEnabled<br>
     * - isExternalProviderAppsEnabled<br>
     *
     * To add an external provider as a custom data source, you must registered it using the service function registerExternalProvider.<br>
     * @param {object} oContainerInterface The container interface
     * @param {string} sParameters The parameter string
     * @param {object} oServiceConfiguration The service configuration
     *
     * @since 1.45.0
     *
     * @private
     */
    function AllMyApps (oContainerInterface, sParameters, oServiceConfiguration) {
        var oServiceConfig = oServiceConfiguration && oServiceConfiguration.config,
            bEnabled = false,
            oDataProviders = {};

        // *************************************************************************************************
        // ************************************* Service API - Begin ***************************************

        /**
         * Indicates whether the All My Apps service is enabled.<br>
         * The service is enabled through launchpad configuration parameters<br>
         * or enabled by default if launchpad configuration parameters do not exist
         *
         * @returns {boolean} A Boolean value indicating whether the service is enabled
         *
         * @since 1.45.0
         *
         * @private
         */
        this.isEnabled = function () {
            bEnabled = !!((!oServiceConfig || (oServiceConfig.enabled !== false)));
            return bEnabled;
        };

        /**
         * Indicates whether home page apps are shown in the All My Apps UI.<br>
         * Home page apps are shown by default if the appropriate launchpad configuration parameters do not exist<br>
         *
         * @returns {boolean} A Boolean value indicating whether home page apps are shown in the All My Apps UI<br>
         *
         * @since 1.45.0
         *
         * @private
         */
        this.isHomePageAppsEnabled = function () {
            return !!((!oServiceConfig || (oServiceConfig.showHomePageApps !== false)));
        };

        /**
         * Indicates whether user catalog apps are shown in the All My Apps UI<br>
         * Catalog apps are shown by default if the appropriate launchpad configuration parameters do not exist<br>
         *
         * @returns {boolean} A boolean value indicating whether catalog applications are shown in All My Apps UI<br>
         *
         * @since 1.45.0
         *
         * @private
         */
        this.isCatalogAppsEnabled = function () {
            return !!((!oServiceConfig || (oServiceConfig.showCatalogApps !== false)));
        };

        /**
         * Indicates whether external providers are shown in the All My Apps UI<br>
         * External providers are shown by default if the appropriate launchpad configuration parameters do not exist<br>
         *
         * @returns {boolean} A Boolean value indicating whether external providers are shown in the All My Apps UI<br>
         *
         * @since 1.45.0
         *
         * @private
         */
        this.isExternalProviderAppsEnabled = function () {
            return !!((!oServiceConfig || (oServiceConfig.showExternalProviders !== false)));
        };

        /**
         * Register an external provider as a custom data source of applications, which  will be shown in the All My Apps UI.<br>
         *
         * @param {string} sProviderId The unique ID of the data source/provider
         * @param {object} oProvider An object that provides the data source title and applications.<br>
         * The object must implement the following two functions:<br>
         *  - <code>getTitle</code> - A function that returns the data source title that will be presented in the data source list<br>
         *  - <code>getData</code> - A function that returns a jQuery.deferred.promise() object that when resolved - returns the applications data in a group's/application's hierarchy.<br>
         *  A group is an object containing a title and an array of application objects in the following format:<br>
         *  <pre>
         *  {
         *    title: "Provider1 Group1",
         *    apps: [
         *     ...
         *    ]
         *  }
         *  </pre>
         *  <br>An application object has the following structure:<br>
         *  <pre>
         *  {
         *    title: "AppTitle",
         *    subTitle: "AppSubtitle",
         *    url: "#Action-todefaultapp"
         *  }
         *  </pre>
         *  <br><br>
         *  <code>getData</code> response example:<br>
         *  <pre>[{ // Group 1
         *      title: "Provider1 Group1",
         *       apps: [{
         *         title: "App11_title",
         *         subTitle: "App11_subTitle",
         *         url: "#Action-todefaultapp"
         *       },
         *       ...]
         *     }, { // Group 2
         *       title: "Provider1 Group2",
         *       apps: [{
         *         title: "App21_title",
         *         subTitle: "App21_subTitle",
         *         url: "http://www.ynet.co.il"
         *       },
         *       ...]
         *     }
         *   ]</pre>
         *
         * @returns {undefined}
         *
         * @since 1.45.0
         *
         * @private
         */
        this.registerExternalProvider = function (sProviderId, oProvider) {
            if (!sProviderId || (sProviderId === "")) {
                return;
            }
            if (!oProvider.getTitle || !oProvider.getData) {
                return;
            }
            oDataProviders[sProviderId] = oProvider;
        };

        /**
         * @returns {object} An object that contains all registered external data providers.
         *
         * @since 1.45.0
         *
         * @private
         */
        this.getDataProviders = function () {
            return oDataProviders;
        };

        /**
         * Initializes the service
         *
         * @private
         */
        this.init = function () {
        };
    }

    AllMyApps.hasNoAdapter = true;
    return AllMyApps;
}, true/* bExport */);
