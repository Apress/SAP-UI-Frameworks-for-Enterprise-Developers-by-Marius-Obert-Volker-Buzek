// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepExtend",
    "sap/base/util/ObjectPath",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/User",
    "sap/ui/core/Configuration"
], function (
    Log,
    deepExtend,
    ObjectPath,
    jQuery,
    User,
    Configuration
) {
    "use strict";
    var ContainerAdapter = function (oSystem, sParameter, oConfig) {

        var oUser,
            sLogoutUrl,
            sLogoutMethod,
            sCsrfTokenUrl,
            sKeepAliveURL,
            sKeepAliveMethod;

        this.load = function () {
            var userInfo;

            sLogoutUrl = ObjectPath.get("config.systemProperties.logoutUrl", oConfig);
            sLogoutMethod = ObjectPath.get("config.systemProperties.logoutMethod", oConfig) || "GET";
            sCsrfTokenUrl = ObjectPath.get("config.systemProperties.csrfTokenUrl", oConfig);
            sKeepAliveURL = ObjectPath.get("config.systemProperties.sessionKeepAlive.url", oConfig);
            sKeepAliveMethod = ObjectPath.get("config.systemProperties.sessionKeepAlive.method", oConfig);

            //prepare user object
            userInfo = deepExtend(
                {id: ""},
                ObjectPath.get("config.userProfile.defaults", oConfig)
            );
            oUser = new User(userInfo);
            setSAPUI5Settings(userInfo);

            return new jQuery.Deferred().resolve().promise();
        };

        this.getSystem = function () {
            return oSystem;
        };

        this.getUser = function () {
            return oUser;
        };

        this._getLogoutUrl = function () {
            return sLogoutUrl;
        };

        this._setWindowLocation = function (data) {
            window.location.href = data;
        };

        this.logout = function () {
            var oDeferred = new jQuery.Deferred(),
                that = this;

            if (sLogoutMethod === "POST") {
                Log.info("performing logout from system via POST", undefined, "sap.ushell.appRuntime.ui5.services.adapters.ContainerAdapter::logout");
                jQuery.ajax({
                    type: "HEAD",
                    url: sCsrfTokenUrl,
                    headers: {
                        "X-CSRF-Token": "Fetch"
                    },
                    success: function (oData, oStatus, oXhr) {
                        jQuery.ajax({
                            type: "POST",
                            url: sLogoutUrl,
                            headers: {
                                "X-CSRF-Token": oXhr.getResponseHeader("X-CSRF-Token")
                            },
                            success: function (data) {
                                that._setWindowLocation(data);
                                oDeferred.resolve();
                            },
                            error: function () {
                                Log.error("Logging out via POST failed",
                                    undefined, "sap.ushell.appRuntime.ui5.services.adapters.ContainerAdapter::logout");
                                oDeferred.resolve();
                            }
                        });
                    },
                    error: function () {
                        Log.error("fetching X-CSRF-Token for logout via POST failed for system: " + oSystem.getAlias(),
                            undefined, "sap.ushell.appRuntime.ui5.services.adapters.ContainerAdapter::logout");
                        oDeferred.resolve();
                    }
                });
            } else {
                try {
                    if (typeof sLogoutUrl === "string" && sLogoutUrl.length > 0) {
                        this._logoutViaHiddenIFrame(oDeferred, sLogoutUrl);
                        //resolve after 4 seconds if no response came from the logout iframe
                        setTimeout(oDeferred.resolve, 4000);
                    } else {
                        oDeferred.resolve();
                    }
                } catch (e) {
                    Log.error(
                        "logout from iframe " + document.URL + " failed",
                        e,
                        "sap.ushell.appRuntime.ui5.SessionHandlerAgent");
                    oDeferred.resolve();
                }
            }

            return oDeferred.promise();
        };

        this._logoutViaHiddenIFrame = function (oDeferred, sUrl) {
            var oFrame = document.createElement("iframe"),
                sSafeUrl = sUrl.replace(/"/g, "\\\"");

            window.addEventListener("message", function (oEvent) {
                if ((oEvent.data && oEvent.data.url) === sUrl) {
                    oDeferred.resolve();
                }
            });

            oFrame.style.visibility = "hidden";
            oFrame.setAttribute("src", sUrl);

            function onload () {
                this.contentWindow.parent.postMessage({
                    url: sSafeUrl,
                    request_id: "dummy-logout-id"
                }, "*");
            }

            oFrame.addEventListener("load", onload);
            oFrame.addEventListener("error", onload);

            document.body.appendChild(oFrame);
        };

        this.sessionKeepAlive = function () {
            if (typeof sKeepAliveURL === "string" && sKeepAliveURL.length > 0 &&
                typeof sKeepAliveMethod === "string" && sKeepAliveMethod.length > 0) {
                var oXHR = new XMLHttpRequest();
                oXHR.open(sKeepAliveMethod, sKeepAliveURL, /*async=*/true);

                oXHR.onreadystatechange = function () {
                    if (this.readyState === /*DONE*/4) {
                        Log.debug("Server session was extended");
                    }
                };

                oXHR.send();
            }
        };

        function setSAPUI5Settings (oSettings) {
            var oFormatSettings = Configuration.getFormatSettings();
            if (oSettings.sapDateFormat) {
                oFormatSettings.setLegacyDateFormat(oSettings.sapDateFormat);
            }
            if (oSettings.sapDateCalendarCustomizing) {
                oFormatSettings.setLegacyDateCalendarCustomizing(oSettings.sapDateCalendarCustomizing);
            }
            if (oSettings.sapNumberFormat) {
                oFormatSettings.setLegacyNumberFormat(oSettings.sapNumberFormat);
            }
            if (oSettings.sapTimeFormat) {
                oFormatSettings.setLegacyTimeFormat(oSettings.sapTimeFormat);
            }
            if (typeof oSettings.currencyFormats === "object") {
                oFormatSettings.addCustomCurrencies(oSettings.currencyFormats);
            }
        }
    };

    return ContainerAdapter;
}, /* bExport= */ true);
