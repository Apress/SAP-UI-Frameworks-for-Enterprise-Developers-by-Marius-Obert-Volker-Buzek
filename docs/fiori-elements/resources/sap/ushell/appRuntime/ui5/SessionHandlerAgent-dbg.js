// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/appRuntime/ui5/AppRuntimePostMessageAPI",
    "sap/ushell/appRuntime/ui5/AppRuntimeService",
    "sap/ui/thirdparty/URI",
    "sap/base/Log",
    "sap/ui/thirdparty/jquery"
], function (AppRuntimePostMessageAPI, AppRuntimeService, URI, Log, jQuery) {
    "use strict";

    function SessionHandlerAgent () {

        this.init = function () {

            var that = this;

            //register for logout event from the shell
            AppRuntimePostMessageAPI.registerCommunicationHandler("sap.ushell.sessionHandler", {
                oServiceCalls: {
                    logout: {
                        executeServiceCallFn: function (oMessageData) {
                            return that.handleLogoutEvent(oMessageData);
                        }
                    },
                    extendSessionEvent: {
                        executeServiceCallFn: function (oMessageData) {
                            return that.handleExtendSessionEvent(oMessageData);
                        }
                    }
                }
            });

            this.attachUserEvents();
            this.userActivityHandler();
        };

        this.handleLogoutEvent = function () {
            var oDeferred = new jQuery.Deferred(),
                that = this;

            this.detachUserEvents();
            sap.ushell.Container.getFLPUrl(true).then(function (sFlpURL) {
                if (that.isSameDomain(sFlpURL, document.URL) === false) {
                    sap.ushell.Container.logout().then(oDeferred.resolve, oDeferred.resolve);
                } else {
                    oDeferred.resolve();
                }
            });

            return oDeferred.promise();
        };

        this.isSameDomain = function (sURL1, sURL2) {
            var oUri1,
                oUri2,
                bSame = false;

            try {
                oUri1 = new URI(sURL1);
                oUri2 = new URI(sURL2);
                if (oUri1.origin() === oUri2.origin()) {
                    bSame = true;
                }
            } catch (ex) {
                Log.error(
                    "Check for same domain of iframe and FLP failed: " + sURL1 + " " + sURL2,
                    ex,
                    "sap.ushell.appRuntime.ui5.SessionHandlerAgent"
                );
            }

            return bSame;
        };

        this.handleExtendSessionEvent = function () {
            //send extend session  to the app
            sap.ushell.Container.sessionKeepAlive();
            return new jQuery.Deferred().resolve().promise();
        };

        this.attachUserEvents = function () {
            jQuery(document).on("mousedown.sessionTimeout mousemove.sessionTimeout", this.userActivityHandler.bind(this));
            jQuery(document).on("keyup.sessionTimeout", this.userActivityHandler.bind(this));
            jQuery(document).on("touchstart.sessionTimeout", this.userActivityHandler.bind(this));
        };

        this.detachUserEvents = function () {
            jQuery(document).off("mousedown.sessionTimeout mousemove.sessionTimeout");
            jQuery(document).off("keydown.sessionTimeout");
            jQuery(document).off("touchstart.sessionTimeout");
        };

        this.userActivityHandler = function (oEventData) {
            if (this.oUserActivityTimer !== undefined) {
                return;
            }

            var that = this;
            this.oUserActivityTimer = setTimeout(function () {

                //send notify extend session to the Shell
                AppRuntimeService.sendMessageToOuterShell("sap.ushell.sessionHandler.notifyUserActive", {});

                that.oUserActivityTimer = undefined;

            }, 1000);
        };
    }

    var sessionHandlerAgent = new SessionHandlerAgent();
    return sessionHandlerAgent;
});
