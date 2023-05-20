// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Core",
    "sap/ui/core/Configuration",
    "sap/ui/Device",
    "sap/ui/thirdparty/jquery"
], function (
    Log,
    Core,
    Configuration,
    Device,
    jQuery
) {
    "use strict";

    /**
     * The UsageAnalytics service exposes API for logging custom events and setting custom field values in the logged events.<br>
     * The data is sent via http and recorded on a server, whose URL is defined by the <code>baseUrl</code> service configuration property.<br>
     * The service configuration must also include the site ID from the <code>pubToken</code> attribute.<br>
     * You can find the pubToken in the code snippet provided in the WARP when creating a new site.
     *
     * Each tracked event is represented by a table entry on the server database.<br>
     * The administrator can produce reports based on the the recorded data.
     *
     * Two types of events can be logged:<br>
     *   - Automatic events: Click or pageLoad are predefined events, logged by the base tracking library.<br>
     *     You can disable these events in the service configuration.<br>
     *   - Custom events: You can use the service API to log an event with custom data using the function logCustomEvent<br>
     *
     * Each tracked event (either automatic or custom) is represented by a database row, that includes 10 custom attributes named custom1...custom10.<br>
     * Some of these values can be set using UsageAnalytics service API.<br>
     *
     * @name sap.ushell.services.UsageAnalytics
     * @class A UShell service for tracking business flows and user actions.
     * @param {object} oContainerInterface The interface provided by the container
     * @param {object} sParameter Not used in this service
     * @param {object} oServiceProperties Service configuration
     * @constructor
     * @see sap.ushell.services.Container#getServiceAsync
     * @since 1.32.0
     * @public
     */
    function UsageAnalytics (oContainerInterface, sParameter, oServiceProperties) {
        var oServiceConfig = (oServiceProperties && oServiceProperties.config) || {},
            aDelayedEvents = [],
            bAnalyticsScriptLoaded = false,
            bInitialized = false,
            sLegalText,
            oInitParameters;

        window.oCustomProperties = {};

        /**
         * Service API - Begin
         */

        /**
         * Enables the renderer to set the content of the legal message..
         *
         * @since 1.32.0
         * @public
         * @alias sap.ushell.services.UsageAnalytics#setLegalText
         */
        this.setLegalText = function (sText) {
            sLegalText = sText;

            if (oInitParameters) {
                this.init(oInitParameters.usageAnalyticsTitle,
                    oInitParameters.iAgree,
                    oInitParameters.iDisagree,
                    oInitParameters.remindMeLater);
            }
        };

        this.getLegalText = function () {
            return sLegalText;
        };

        this.setTrackUsageAnalytics = function (bState) {
            var oDeferred = jQuery.Deferred();
            var oUser = sap.ushell.Container.getUser();
            var bOldState = oUser.getTrackUsageAnalytics();

            sap.ushell.Container.getServiceAsync("UserInfo")
                .then(function (UserInfoService) {
                    if (bOldState !== bState) { //only if there was a change we would like to save it

                        oUser.setTrackUsageAnalytics(bState);
                        var oUserPreferencesPromise = UserInfoService.updateUserPreferences(oUser);

                        oUserPreferencesPromise.done(function () {
                            oUser.resetChangedProperty("trackUsageAnalytics");
                            if (!bInitialized && bState) {
                                this.start();
                            } else if (bInitialized && bState === false) {
                                window.swa.disable();
                            } else if (bInitialized && bState) {
                                window.swa.enable();
                            }
                            oDeferred.resolve();
                        }.bind(this));

                        oUserPreferencesPromise.fail(function (sErrorMessage) {
                            oUser.setTrackUsageAnalytics(bOldState);
                            oUser.resetChangedProperty("trackUsageAnalytics");
                            Log.error(sErrorMessage);
                            oDeferred.reject(sErrorMessage);
                        });
                    } else {
                        oDeferred.resolve();
                    }
                }.bind(this))
                .catch(function () {
                    Log.error("Getting UserInfo service failed.");
                    oDeferred.reject("Getting UserInfo service failed.");
                });

            return oDeferred.promise();
        };

        /**
         * Notify the user that we are about to activate the usage analytic service.
         * This message has custom term section, I agree / disagree buttons and do not show this message again button
         *
         * @since 1.32.0
         * @private
         */
        this.showLegalPopup = function () {
            sap.ui.require(["sap/m/Text", "sap/m/Dialog", "sap/m/Button", "sap/m/library"], function (Text, Dialog, Button, mobileLibrary) {
                var ButtonType = mobileLibrary.ButtonType;

                var oDialog = new Dialog("agreementMessageBox", {
                    title: oInitParameters.usageAnalyticsTitle,
                    type: "Message",
                    stretch: Device.system.phone,
                    buttons: [
                        new Button("remindMeLaterButton", {
                            text: oInitParameters.remindMeLater,
                            press: function () {
                                oDialog.close();
                            }
                        }),
                        new Button("iAgreeButton", {
                            text: oInitParameters.iAgree,
                            type: ButtonType.Emphasized,
                            press: function () {
                                this.setTrackUsageAnalytics(true);
                                oDialog.close();
                            }.bind(this)
                        }),
                        new Button("iDisagreeButton", {
                            text: oInitParameters.iDisagree,
                            press: function () {
                                this.setTrackUsageAnalytics(false);
                                oDialog.close();
                            }.bind(this)
                        })
                    ],
                    afterClose: function () {
                        oDialog.destroy();
                    },
                    content: new Text({
                        text: sLegalText
                    })
                }).addStyleClass("sapUshellUsageAnalyticsPopUp").addStyleClass("sapContrastPlus");

                oDialog.open();
            }.bind(this));
        };

        /**
         * Indicates whether the service is available.<br><br>
         *
         * Returns <code>true</code> if the following conditions exist, and <code>false</code> otherwise:<br>
         *   a) Service configuration property <code>enable</code> is set to <code>true</code><br>
         *   b) Service configuration property <code>pubToken</code> is not empty<br>
         *   c) Agreement text exists or <code>setUsageAnalyticsPermitted</code> is set to <code>false</code><br>
         *
         * @returns {boolean} A boolean value indicating whether the UsageAnalytics service is enabled
         * @since 1.32.0
         * @public
         * @alias sap.ushell.services.UsageAnalytics#systemEnabled
         */
        this.systemEnabled = function () {
            if (!oServiceConfig.enabled || !oServiceConfig.pubToken || (this.isSetUsageAnalyticsPermitted() && !sLegalText)) {
                if (!oServiceConfig.pubToken) {
                    Log.warning("No valid pubToken was found in the service configuration");
                }

                if (!sLegalText) {
                    Log.warning("No Legal text message found.");
                }
                return false;
            }
            return true;
        };

        /**
         * Indicates whether the user has specified to track activities.<br><br>
         *
         * Returns <code>true</code> if the following conditions exist, and <code>false</code> otherwise:<br>
         *   a) The function <code>system enabled</code> returns <code>true</code><br>
         *   b) The user property <code>trackUsageAnalytics</code> is set to <code>true</code><br>
         *
         * @returns {boolean} A boolean value indicating whether the user has specified to track activities
         * @since 1.32.0
         * @public
         * @alias sap.ushell.services.UsageAnalytics#userEnabled
         */
        this.userEnabled = function () {
            var oUser = sap.ushell.Container.getUser();
            if (!this.systemEnabled()) {
                return false;
            }
            return oUser.getTrackUsageAnalytics();
        };

        /**
         * Start usage analytics.
         *
         * @since 1.32.0
         * @private
         */
        this.start = function () {
            Core.getEventBus().publish("sap.ushell.services.UsageAnalytics", "usageAnalyticsStarted");
            this._initUsageAnalyticsLogging();
            bInitialized = true;
            // setting the languages for all requests
            window.swa.custom2 = { ref: Configuration.getLanguage() };
        };

        /**
         * Initializes the UsageAnalytics service
         *
         * Initialization is performed only if the following two conditions are fulfilled:<br>
         *   1. UsageAnalytics is enabled<br>
         *   2. UsageAnalytics service hasn't been initialized yet
         *
         * @since 1.32.0
         * @private
         */
        this.init = function (sUsageAnalyticsTitle, sIAgree, sIDisagree, sRemindMeLater) {
            oInitParameters = {
                usageAnalyticsTitle: sUsageAnalyticsTitle,
                iAgree: sIAgree,
                iDisagree: sIDisagree,
                remindMeLater: sRemindMeLater
            };

            if (this.systemEnabled() && !bInitialized) {
                if (!this.isSetUsageAnalyticsPermitted()) {
                    this.start();
                } else if (sLegalText) {
                    if (this.userEnabled() === true) {
                        this.start();
                    } else if (this.userEnabled() === null || this.userEnabled() === undefined) {
                        this.showLegalPopup();
                    }
                }
            }
        };

        /**
         * Sets up to 6 customer attributes of logged events according to the given object attributes.<br>
         * A customer attribute can be set only once during a session.<br>
         * Currently these attributes correspond to database columns custom5...custom10.
         *
         * @param {object} oCustomFieldValues An json object that includes attribute1...attribute6 (or subset)<br>
         *   with values of type string/number/boolean or a function that returns any of these types.<br>
         *   For example:<br>
         *   {<br>
         *     attribute1: "value3",<br>
         *     attribute2: function () {return "value4"},<br>
         *     attribute3: 55<br>
         *   }<br>
         *   in this example the custom field "custom5" gets the string "value3"<br>
         *   the custom field custom6 gets the function that returns the string "value4",<br>
         *   the custom field custom7 gets a string "55".<br>
         *   Any property of oCustomFieldValues which is not in the range of attribute1...attribute6 is ignored.
         * @since 1.32.0
         * @public
         * @alias sap.ushell.services.UsageAnalytics#setCustomAttributes
         */
        this.setCustomAttributes = function (oCustomFieldValues) {
            var index,
                sParameterKeyPrefix = "attribute",
                sParameterKey,
                sCustomPropertyKeyPrefix = "custom",
                sCustomPropertyKey,
                sFunctionName,
                sFunctionNamePrefix = "customFunction";

            if (!this.userEnabled() && this.isSetUsageAnalyticsPermitted()) {
                return;
            }
            for (index = 1; index < 6; index++) {
                // Check that the corresponding custom property wasn't set yet
                // e.g. if index=3 then the corresponding sCustomPropertyKey is "custom5" and the check verifies that swa.custom5 is empty
                sCustomPropertyKey = sCustomPropertyKeyPrefix.concat(index + 4);

                if (window.swa[sCustomPropertyKey] !== undefined) {
                    continue;
                }

                // Check that the given object (i.e. oCustomFieldValues) contains parameter with this index
                // e.g. sParameterKey is "attribute3" then check that oCustomFieldValues.attribute3 is defined
                sParameterKey = sParameterKeyPrefix + index;
                if (oCustomFieldValues[sParameterKey] === undefined) {
                    continue;
                }

                // Check if the value of oCustomFieldValues[sCustomPropertyKey] is a function
                if (jQuery.isFunction(oCustomFieldValues[sParameterKey])) {
                    // Giving the anonymous function name . e.g. "customFunction3"
                    sFunctionName = sFunctionNamePrefix + index;

                    // Make a global reference to the function. e.g. window.customFunction3 = the given function
                    window[sFunctionName] = oCustomFieldValues[sParameterKey];

                    // Set the value of the relevant custom property to be a string reference of the function.
                    // e.g. "{ref:"customFunction3"};
                    window.swa[sCustomPropertyKey] = { ref: sFunctionName };
                } else {
                    window.swa[sCustomPropertyKey] = { ref: oCustomFieldValues[sParameterKey] };
                }
            }
        };

        /**
         * Logs a custom event with the given eventType and customEventValues.<br>
         * Each event has up to an additional 10 custom attributes that correspond to database columns customEventValue, customEventValue2...customEventValue10.
         *
         * @param {string} eventType - Type of the event
         * @param {string} customEventValue - Primary value of the event
         * @param {array} aAdditionalValues An array of zero to 9 strings. Any item above the 9th is ignored.
         * @since 1.32.0
         * @private
         */
        this.logCustomEvent = function (eventType, customEventValue, aAdditionalValues) {
            if (!this.userEnabled() && this.isSetUsageAnalyticsPermitted()) {
                return;
            }
            // If not all logging scripts were loaded - keep the request for later execution, and return.
            if (!this._isAnalyticsScriptLoaded()) {
                this._addDelayedEvent(eventType, customEventValue, aAdditionalValues);
                return;
            }
            if (aAdditionalValues) {
                aAdditionalValues.unshift(customEventValue);
                aAdditionalValues.unshift(eventType);
                window.swa.trackCustomEvent.apply(window.swa.trackCustomEvent, aAdditionalValues);
            } else {
                window.swa.trackCustomEvent(eventType, customEventValue);
            }
        };

        /**
         * Service API - End
         */

        /**
         * Callback function that is called when SWA scripts are loaded.
         * Goes over all delayed custom events and logs them by calling logCustomEvent
         */
        window._trackingScriptsLoaded = function () {
            var index,
                oTempDelayedEvent;

            bAnalyticsScriptLoaded = true;
            for (index = 0; index < aDelayedEvents.length; index++) {
                oTempDelayedEvent = aDelayedEvents[index];
                this.logCustomEvent(oTempDelayedEvent.eventType, oTempDelayedEvent.customEventValue, oTempDelayedEvent.aAdditionalValues);
            }
            aDelayedEvents = null;
        };

        /**
         * Embedding SWA's tracking snippet into the renderer's code including the loading of js/privacy.j which is actually SWA's source code
         */
        this._initUsageAnalyticsLogging = function () {
            if (window.swa === undefined) {
                window.swa = {};
            }
            window.swa.pubToken = oServiceConfig.pubToken;
            window.swa.baseUrl = oServiceConfig.baseUrl;
            window.swa.bannerEnabled = false;
            window.swa.loggingEnabled = true;
            window.swa.visitorCookieTimeout = 63113852;
            window.swa.dntLevel = 1;
            window.swa.trackerReadyCallback = window._trackingScriptsLoaded.bind(this);

            // the following swa properties get the value "true" by default
            window.swa.clicksEnabled = (oServiceConfig.logClickEvents !== false);
            window.swa.pageLoadEnabled = (oServiceConfig.logPageLoadEvents !== false);
            this._handlingTrackingScripts();
        };

        this._handlingTrackingScripts = function () {
            var d = document,
                g = d.createElement("script"),
                s = d.getElementsByTagName("script")[0];

            // Callback function called when tracking script loading failed
            g.onerror = function () {
                Log.warning("SWA scripts not loaded!");
            };
            g.defer = true;
            g.async = true;
            g.src = window.swa.baseUrl + "js/privacy.js";
            s.parentNode.insertBefore(g, s);
        };

        this._isAnalyticsScriptLoaded = function () {
            return bAnalyticsScriptLoaded;
        };

        this.isSetUsageAnalyticsPermitted = function () {
            if (oServiceConfig.setUsageAnalyticsPermitted === undefined) {
                return true;
            }
            return oServiceConfig.setUsageAnalyticsPermitted;
        };

        /**
         * Called when a custom event is being logged but SWA scripts are not loaded yet.
         * Adds the logged event to aDelayedEvents.
         */
        this._addDelayedEvent = function (eventType, customEventValue, aAdditionalValues) {
            var oDelayedEvent = {
                eventType: eventType,
                customEventValue: customEventValue,
                aAdditionalValues: aAdditionalValues
            };
            aDelayedEvents.push(oDelayedEvent);
        };
    }

    UsageAnalytics.hasNoAdapter = true;
    return UsageAnalytics;
}, true /* bExport */);
