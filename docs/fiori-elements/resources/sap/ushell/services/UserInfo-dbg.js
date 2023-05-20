// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's user information service, which allows you to retrieve
 *     information about the user.
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ushell/Config",
    "sap/ushell/User"
], function (
    Log,
    Config,
    User
) {
    "use strict";
    /**
     * This method MUST be called by the Unified Shell's container only, others MUST call
     * <code>sap.ushell.Container.getServiceAsync("UserInfo").then(function (UserInfo) {});</code>.
     * Constructs a new instance of the user information service.
     *
     * The Unified Shell's user information service, which allows you to retrieve
     *     information about the logged-in user.
     *
     * @name sap.ushell.services.UserInfo
     * @param {object} oAdapter Adapter
     * @param {object} oContainerInterface interface
     *
     * @constructor
     * @class
     * @see sap.ushell.services.Container#getServiceAsync
     * @since 1.16.3
     *
     * @public
     */
    function UserInfo (oAdapter, oContainerInterface) {
        /**
         * Returns the id of the user.
         *
         * @returns {string}
         *   The user id.
         *
         * @since 1.16.3
         *
         * @public
         * @alias sap.ushell.services.UserInfo#getId
         */
        this.getId = function () {
            return sap.ushell.Container.getUser().getId();
        };

        /**
         * Returns the first name of the user.
         *
         * @returns {string}
         *   The user's first name.
         *
         * @since 1.86.0
         *
         * @public
         * @alias sap.ushell.services.UserInfo#getFirstName
         */
        this.getFirstName = function () {
            return sap.ushell.Container.getUser().getFirstName();
        };

        /**
         * Returns the last name of the user.
         *
         * @returns {string}
         *   The user's last name.
         *
         * @since 1.86.0
         *
         * @public
         * @alias sap.ushell.services.UserInfo#getLastName
         */
        this.getLastName = function () {
            return sap.ushell.Container.getUser().getLastName();
        };

        /**
         * Returns the full name of the user.
         *
         * @returns {string}
         *   The user's full name.
         *
         * @since 1.86.0
         *
         * @public
         * @alias sap.ushell.services.UserInfo#getFullName
         */
        this.getFullName = function () {
            return sap.ushell.Container.getUser().getFullName();
        };

        /**
         * Returns the email address of the user.
         *
         * @returns {string}
         *   The user's email address.
         *
         * @since 1.86.0
         *
         * @public
         * @alias sap.ushell.services.UserInfo#getEmail
         */
        this.getEmail = function () {
            return sap.ushell.Container.getUser().getEmail();
        };

        /**
         * Returns an object representing the logged-in user.
         *
         * @returns {User}
         *      object providing information about the logged-in user
         *
         * @since 1.15.0
         *
         * @private
         */
        this.getUser = function () {
            return sap.ushell.Container.getUser();
        };

        /**
         * Returns the list of themes available for the user.
         * In case of success, the <code>done</code> function returns an 'anonymous' object
         * representing the list of themes.
         * In case of failure, the <code>fail</code> function of the jQuery.promise object is called.
         *
         * @returns {object}
         *  jQuery.promise object.
         *
         * @private
         */
        this.getThemeList = function () {
            var oPromise = oAdapter.getThemeList();
            oPromise.fail(function () {
                Log.error("getThemeList failed");
            });
            return oPromise;
        };

        /**
         * Sends the updated user attributes to the adapter.
         * In case of success, the <code>done</code> function returns nothing.
         * In case of failure, the <code>fail</code> function of the jQuery.promise object is called.
         *
         *  @returns {object}
         *  jQuery.promise object
         */
        this.updateUserPreferences = function () {
            var oPromise = oAdapter.updateUserPreferences(sap.ushell.Container.getUser());
            oPromise.fail(function () {
                Log.error("updateAttributes: ");
            });
            return oPromise;
        };

        /**
         * Returns the list of languages or locales available for the user.
         * In case of success, the <code>done</code> function returns an object
         * representing a list of language (e.g., en) or locale IDs (e.g., en-us).
         * In case of failure, the <code>fail</code> function of the jQuery.promise object is called.
         * The first item is the browser language - e.g. {"Browser Language":"en-us"}
         * @returns {object}
         *  jQuery.promise object.
         *
         * @private
         */
        this.getLanguageList = function () {
            var oPromise = oAdapter.getLanguageList();
            oPromise.fail(function () {
                Log.error("getLanguageList failed");
            });
            return oPromise;
        };

        /**
         * Returns the list of User Profile Property ValueLists .
         * In case of success, the <code>done</code> function returns an object
         * @returns {object}
         *  jQuery.promise object.
         *
         * @private
         */
        this.getUserSettingList = function () {
            var oPromise = oAdapter.getUserProfilePropertyValueLists();
            oPromise.fail(function () {
                Log.error("getUserProfilePropertyValueLists failed");
            });
            return oPromise;
        };

        /**
         * Returns if the adapter supports editing User profile value list
         * @returns {boolean} true if the adapter allows it, false otherwise
         *
         * @private
         */
        this.getUserSettingListEditSupported = function () {
            if (typeof oAdapter.getUserProfilePropertyValueLists !== "undefined") {
                return true;
            }
            return false;
        };
    }

    UserInfo.hasNoAdapter = false;
    return UserInfo;
}, true /* bExport */);
