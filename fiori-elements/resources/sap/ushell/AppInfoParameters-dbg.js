// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ushell/services/AppConfiguration",
    "sap/base/util/restricted/_curry",
    "sap/base/util/restricted/_zipObject",
    "sap/ui/VersionInfo",
    "sap/ushell/Config",
    "sap/ushell/TechnicalParameters"
], function (Log, oAppConfiguration, _curry, _zipObject, VersionInfo, Config, TechnicalParameters) {
    "use strict";
    /*global */

    /**
     *  AppInfoParameters component responsible to direct the recovery of each app info parameter value
     */

    var LAUNCHPAD = "LAUNCHPAD";

    /**
     * Retrieves the application type
     * It looks up application type
     * @param {object} oCurrentApplication current application
     * @returns {string} the application type
     */
    function getApplicationType (oCurrentApplication) {
        var sApplicationType = oCurrentApplication.applicationType;
        if (sApplicationType === "TR") {
            sApplicationType = "GUI";
        }
        return sApplicationType;
    }

    function getCurrentAppCapabilities () {
        return (oAppConfiguration.getCurrentApplication() && oAppConfiguration.getCurrentApplication().appCapabilities) || {};
    }

    function getFrameworkVersion (oCurrentApplication) {
        function constructVersion (oVersion) {
            return (oVersion.version || "") + (" (" + (oVersion.buildTimestamp || "") + ")") || "";
        }
        if (getApplicationType(oCurrentApplication) === "UI5") {
            return VersionInfo.load()
                .then(constructVersion)
                .catch(function () {
                    Log.error("VersionInfo could not be loaded");
                });
        }
        return undefined;
    }

    function getAppVersion (oCurrentApplication) {

        return Promise.resolve().then(function () {
            var oComponentInstance = oCurrentApplication.componentInstance;
            if (oComponentInstance) {
                var sAppVersion = oComponentInstance.getManifestEntry("/sap.app/applicationVersion/version");
                return sAppVersion;
            }
            return undefined;
        });
    }

    /**
     * Provider for support info
     * It looks up using the sequence
     *   1. technical parameter sap-ach, that is SAP application component hierarchy
     *   2. appSupportInfo parameter in capability section of the URL template
     * @param {object} oCurrentApplication Current Application
     * @returns {function} function that resolves to a promise with the support info
     */
    function getSupportInfo (oCurrentApplication) {
        // 1. sap-ach
        // 2. app capabilities
        var oTechnicalParameterPromise = oCurrentApplication.getTechnicalParameter("sap-ach");
        return oTechnicalParameterPromise.then(function (aAch) {
            var sAch = aAch && aAch[0];
            if (sAch) {
                return sAch;
            }
            return getCurrentAppCapabilities().appSupportInfo;
        });
    }

    /**
     * Provider for technical application component
     * It looks up depending on the technology
     * if UI5: take it from the manifest
     * if GUI or WDA: parse the application name from the launch URL
     * if WCF:  parse the wcf-target-id parameter
     * if URL-template: looks up technicalAppComponentId in capabilities section
     * @param {object} oCurrentApplication Current Application
     * @returns {function} function that resolves to a promise with the technical application component
     */
    function getTechnicalAppComponentId (oCurrentApplication) {


        function getFromMetadata () {
            var oMetadata = oAppConfiguration.getMetadata();
            return oMetadata.technicalName;
        }

        var oEnabledApplicationTypes = {
            UI5: function () {
                var oComponentInstance = oCurrentApplication.componentInstance;
                if (oComponentInstance) {
                    var sComponentName = oComponentInstance.getMetadata().getManifestEntry("/sap.ui5/componentName");
                    if (!sComponentName) {
                        sComponentName = oComponentInstance.getMetadata().getComponentName();
                    }

                    return sComponentName;
                }

                return getFromMetadata();
            },
            TR: function () {
                return (getFromMetadata() || "").replace(/\s[(]TCODE[)]$/, "");
            },
            WDA: getFromMetadata,
            NWBC: getFromMetadata,
            URL: function () {
                return Promise.resolve().then(function () {

                    var oCurrentApp = oAppConfiguration.getCurrentApplication();
                    if (oCurrentApp.appCapabilities.technicalAppComponentId) {
                        return oCurrentApp.appCapabilities.technicalAppComponentId;
                    }
                    return undefined;
                });
            }
        };

        var sApplicationType = oCurrentApplication.applicationType;
        if (oEnabledApplicationTypes.hasOwnProperty(sApplicationType)) {
            return oEnabledApplicationTypes[sApplicationType]();
        }

        return undefined;
    }

    /**
     * Provider for application
     * It looks up using the sequence
     *  1. if on homepage, appfinder use constant LAUNCHPAD or LAUNCHPAD(FXXX) if fiori ID is provided
     *  2. technical parameter sap-fiori-id
     *  3. looks up parameter appId in capabilities section
     *  4. inbound permanent key
     * @param {object} oCurrentApplication current application
     * @returns {function} function that resolves to a promise with application id.
     */
     function getAppId (oCurrentApplication) {

        var sAppId = "";
        return oCurrentApplication.getTechnicalParameter("sap-fiori-id")
            .then(function (aFioriId) {
                // case home page
                if (oCurrentApplication.homePage) {
                    // case fiori ID is a string
                    if (aFioriId && typeof aFioriId[0] === "string") {
                        // case fiori ID is not empty
                        // home app
                        if (aFioriId[0] !== "") {
                            sAppId = LAUNCHPAD + " (" + aFioriId[0] + ")";
                        // case fiori id is empty
                        // This is relevant for app home error page
                        } else {
                            sAppId = LAUNCHPAD;
                        }
                    } else {
                    // no Fiori ID is provided
                    // This is shell home, no custapp or appfinder
                        sAppId = LAUNCHPAD;
                    }
                // case app
                } else if (aFioriId && typeof aFioriId[0] === "string") {
                    // case fiori ID is a string
                    sAppId = aFioriId[0];
                } else {
                    sAppId = getCurrentAppCapabilities().appId || oCurrentApplication.inboundPermanentKey;
                }
                return sAppId;
            });
    }

    /**
     * Provider for user environment
     * It looks up using reference resolver
     * @param {string} sUserEnv Parameter name of the user environment
     * @returns {Promise<string>} The promise resolves the user parameter
     */
    function getUserEnv (sUserEnv) {
        return sap.ushell.Container.getServiceAsync("ReferenceResolver")
            .then(function (oReferenceResolverService) {
                return new Promise(function (fnResolve, fnReject) {
                    oReferenceResolverService.resolveReferences([sUserEnv])
                        .then(function (oResolvedReferences) {
                            fnResolve(oResolvedReferences[sUserEnv]);
                        })
                        .catch(fnReject);
                });
            });
    }

    /**
     * Provider for framework id
     * It looks up framework id in capabilities section if it is a URL template
     * else it looks up the application type
     * @param {*} oCurrentApplication current application
     * @returns {function} Function that resolves to a promise with the framework id
    */
    function getAppFrameworkId (oCurrentApplication) {
        return Promise.resolve().then(function () {
            var oCurrentApp = oAppConfiguration.getCurrentApplication();
            var sApplicationType = getApplicationType(oCurrentApplication);

            if (sApplicationType && sApplicationType !== "URL") {
                return sApplicationType;
            }

            return oCurrentApp.appCapabilities && oCurrentApp.appCapabilities.appFrameworkId;
        }).then(function (sApplicationType) {
            var oAppTypeToFrameworkId = {
                NWBC: "WDA",
                TR: "GUI"
            };
            return oAppTypeToFrameworkId[sApplicationType] || sApplicationType;
        });
    }

    /**
     * Retrieves the value of a given property in the system context
     * @param {string} sProperty A property in the system context
     * @param {object} oCurrentApplication The current application
     * @returns {function} Function that resolves to a promise with the property
     */
    function getSystemContext (sProperty, oCurrentApplication) {
        return oCurrentApplication.getSystemContext().then(function (oSystemContext) {
            return oSystemContext.getProperty(sProperty);
        });
    }

    /**
     * Retrieves the app intent
     * @returns {function} Function that resolves to a promise with app intent
     */
    function getAppIntent () {
        var sHash = window.hasher && window.hasher.getHash();
        if (!sHash) {
            return Promise.reject("Could not identify current application hash");
        }
        return Promise.resolve().then(
            function () {
                return sHash;
            }
        );
    }

    // map of application info parameters to provider functions
    var oHandlers = {
        theme: getUserEnv.bind(null, "User.env.sap-theme-NWBC"),
        languageTag: getUserEnv.bind(null, "User.env.sap-languagebcp47"),
        appIntent: getAppIntent,
        appFrameworkId: getAppFrameworkId,
        appFrameworkVersion: getFrameworkVersion,
        appSupportInfo: getSupportInfo,
        technicalAppComponentId: getTechnicalAppComponentId,
        appId: getAppId,
        appVersion: getAppVersion,
        productName: _curry(getSystemContext)("productName")
    };


    /**
     * Returns <code>true</code> if the given parameter is a custom property.
     * This is the case when:
     * - parameter is not listed in AppINfoParameters' oHandlers list
     * - parameter name contains a "."
     *
     * @param {string} sParameter Parameter to be tested
     *
     * @returns {boolean} Result of check
     *
     */
    function _isCustom (sParameter) {
        return !oHandlers[sParameter] && /[.]/.test(sParameter);
    }

    function getAllAppInfo (bValues, oCurrentApplication, oComponentInstance, oApplicationContainer, sApplicationType) {
        return new Promise(function (fnResolve) {
            var allAppInfo = {};

            for (var sCustomerAttribute in getCustomAttributes()) {
                if (bValues) {
                    allAppInfo[sCustomerAttribute] = getCustomAttributes()[sCustomerAttribute].value;
                } else {
                    allAppInfo[sCustomerAttribute] = getCustomAttributes()[sCustomerAttribute];
                }
            }

            var arrResults = {},
            aPromises = [];
            aPromises.push(_getInfo(["appFrameworkId"], oCurrentApplication)
                .then(function () {
                    return _getInfo(Object.keys(oHandlers), oCurrentApplication);
                }));
            aPromises.push(TechnicalParameters.getTechnicalParametersAppInfo(oComponentInstance, oApplicationContainer, sApplicationType));
            Promise.allSettled(aPromises).then(function (aResults) {
                if (aResults[0].status === "fulfilled") {
                        for (var handler in aResults[0].value) {
                            if (aResults[0].value[handler] !== undefined) {
                                if (bValues) {
                                    arrResults[handler] = aResults[0].value[handler];
                                } else {
                                    arrResults[handler] = {
                                        value: aResults[0].value[handler]
                                    };
                                }
                            }
                        }
                }
                if (aResults[1].status === "fulfilled") {
                    for (var sTechnicalParameter in aResults[1].value) {
                        if (!allAppInfo.hasOwnProperty(sTechnicalParameter)) {
                            if (aResults[1].value[sTechnicalParameter].value && aResults[1].value[sTechnicalParameter].value[0] !== undefined) {
                                if (bValues) {
                                    arrResults[sTechnicalParameter] = aResults[1].value[sTechnicalParameter].value[0];
                                } else {
                                    arrResults[sTechnicalParameter] = {
                                        value: aResults[1].value[sTechnicalParameter].value[0]
                                    };
                                }
                            }
                        }
                    }
                }
                allAppInfo = Object.assign(arrResults, allAppInfo);
                fnResolve(allAppInfo);
            });
        });
    }

    /**
     * Internal central function to collect the values of the given parameters
     * @param {string[]} aParameters Array of requested parameters
     * @param {object} oCurrentApplication The current application
     * @returns {Promise} oPromise Promise that resolves to an object
     *    keeping the application info parameters with values
     */
        function _getInfo (aParameters, oCurrentApplication) {
            var aPromises = aParameters.map(function (sParameter) {
                if (isAttributeExist(sParameter)) {
                    return Promise.resolve(getCustomValue(sParameter));
                }
                // add handler function in case of custom property
                if (_isCustom(sParameter)) {
                    oHandlers[sParameter] = _curry(getSystemContext)(sParameter);
                }
                if (!oHandlers[sParameter]) {
                    Log.error(sParameter + " is not a valid app info parameter");
                    return undefined;
                }
                return oHandlers[sParameter](oCurrentApplication);
            });

        return Promise.all(aPromises).then(function (aValues) {
            return _zipObject(aParameters, aValues);
        });
    }

    //object of all app info
    var oCustomAttribute = {};

    function getCustomAttributes () {
        return oCustomAttribute;
    }

    function setCustomAttributes (oAppInfo) {
        if (oAppInfo === undefined || Object.keys(oAppInfo).length === 0) {
            oCustomAttribute = {};
            return;
        }
        for (var sParameter in oAppInfo.info) {
            if (sParameter !== "customProperties") {
                oCustomAttribute[sParameter] = {
                    value: oAppInfo.info[sParameter]};
            }
        }
        for (var sCustomProperties in oAppInfo.info.customProperties) {
            oCustomAttribute[sCustomProperties] = oAppInfo.info.customProperties[sCustomProperties];
        }
    }

    function isAttributeExist (sParameterName) {
        return oCustomAttribute.hasOwnProperty(sParameterName);
    }

    //function that check if the attribute exist in oCustomAttribute
    function getCustomValue (sParameterName) {
        if (isAttributeExist(sParameterName)) {
            return oCustomAttribute[sParameterName].value;
        }
        return undefined;
    }

    /**
     * Interface
     */
    return {
        /**
         * A function to collect the values of the given parameters
         * @param {string[]} aParameters Array of requested parameters
         * @param {object} oCurrentApplication The current application
         * @returns {Promise} Promise that resolves to an object
         *    keeping the application info parameters with values
         */
        getInfo: function (aParameters, oCurrentApplication) {
            if (!oCurrentApplication) {
                return Promise.reject("Parameter application missing");
            }
            return _getInfo(
                ["appFrameworkId"],
                oCurrentApplication
            ).then(function () {
                return _getInfo(aParameters, oCurrentApplication);
            });
        },
        getCustomValue : getCustomValue,
        isAttributeExist : isAttributeExist,
        setCustomAttributes : setCustomAttributes,
        getAllAppInfo : getAllAppInfo
    };



}, false /* bExport= */);
