// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview
 *
 * Technical parameters do not normally appear in the URL as intent parameters
 * of a target application, unless explicitly entered by the user. They also do
 * not belong to the set of the application startup parameters. Instead, they
 * are accessed by the application on demand via an API call.
 *
 * Of course these parameters can appear in the target URL if the URL has
 * already been formed and entered in the address bar after clicking a link in
 * an e-mail for example. In this case technical parameters do appear in the
 * URL and this behavior should be kept stable. In principle, information should
 * never be removed from a URL once the URL enters the address bar. In this way,
 * the link can be copied or bookmarked for later access.
 *
 * Technical parameters should be used when their values originate from data
 * forwarded to, or generated during, client-side target resolution. Such data
 * could, for example, be included in inbounds.
 *
 * A technical parameter consists of a name and a value. Such a value
 * of a technical parameter is determined at runtime during navigation and
 * injected in the UI5 application component or the application container that
 * hosts the target application in an iframe. UI5 applications can, in practice,
 * access the raw value determined at runtime by
 * <code>this.getComponentData().technicalParameters</code>.
 *
 * However, in this file, we define <strong>a view</strong> over the raw value
 * which might transform the raw parameter value by executing additional logic.
 * Therefore, applications are encouraged to use
 * the <code>AppLifeCycle</code> service in the following way:
 * <pre>
 *    sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function (oAppLifeCycle) {
 *          oAppLifeCycle.getCurrentApplication().getTechnicalParameter("sap-fiori-id");
 *    });
 * </pre>
 *
 * It is also possible to prevent applications from using the technical
 * parameters. If the application tries to access an internal parameter (e.g.,
 * sap-ui-app-id-hint) via the API, the application receives an error message.
 *
 * @version 1.113.0
 * @private
 */
sap.ui.define([
    "sap/ushell/utils/type"
], function (oTypeUtils) {
    "use strict";

    var oTechnicalParameters = {
        // Used by cross application navigation to define the target app.
        "sap-navigation-scope": {
            // Describes where the parameter value should be taken from in ClientSideTargetResolution
            injectFrom: "inboundParameter",
            // Sticky parameters should be propagated in the URL as intent parameters
            sticky: true,
            // Allows the parameter to be propagated under another name
            stickyName: "sap-navigation-scope-filter",
            // Indicates whether the parameter should be considered as intent parameter,
            // when it appears before the inner app route in the URL.
            isIntentParameter: true,
            getValue: function (sParameterName, oApplicationComponent, oApplicationContainer, sApplicationType) {
                return new Promise(function (fnSuccess, fnFail) {
                    if (sApplicationType === "UI5") {
                        fnSuccess(getValueFromComponent(sParameterName, oApplicationComponent));
                    } else {
                        fnSuccess(getValueFromContainer(sParameterName, oApplicationContainer));
                    }
                });
            },
            bExposeAsAppInfo: false
        },
        // Used by the about button to inform the user about the id of the
        // current application.
        "sap-fiori-id": {
            injectFrom: "startupParameter",
            isIntentParameter: true,
            getValue: function (sParameterName, oApplicationComponent, oApplicationContainer, sApplicationType) {
                return new Promise(function (fnSuccess, fnFail) {
                    if (sApplicationType === "UI5") {
                        fnSuccess(getValueFromComponent(sParameterName, oApplicationComponent) || getValueFromManifest("/sap.fiori/registrationIds", oApplicationComponent));
                    } else {
                        fnSuccess(getValueFromContainer(sParameterName, oApplicationContainer));
                    }
                });
            },
            bExposeAsAppInfo: true
        },
        // Used by the RT plugin to determine whether the RT change was made
        // by a key user or by a end-user.
        "sap-ui-fl-max-layer": {
            injectFrom: "startupParameter",
            isIntentParameter: true,
            getValue: function (sParameterName, oApplicationComponent) {
                return Promise.resolve().then(getValueFromComponent.bind(null, sParameterName, oApplicationComponent));
            },
            bExposeAsAppInfo: false
        },
        // Used by RTA to determine which control variant id(s) should be
        // selected when the application is loaded.
        "sap-ui-fl-control-variant-id": {
            injectFrom: "startupParameter",
            isIntentParameter: false,
            getValue: function (sParameterName, oApplicationComponent) {
                return Promise.resolve().then(getValueFromComponent.bind(null, sParameterName, oApplicationComponent));
            },
            bExposeAsAppInfo: false
        },
        // Used by RTA to determine draft app which user starts to
        // adapt but don't want to activate immediately.
        "sap-ui-fl-version": {
            injectFrom: "startupParameter",
            isIntentParameter: true,
            getValue: function (sParameterName, oApplicationComponent) {
                return Promise.resolve().then(getValueFromComponent.bind(null, sParameterName, oApplicationComponent));
            },
            bExposeAsAppInfo: false
        },
        // Used in CDM 3.0 based FLPs to navigate to specific applications.
        // The parameter should never be passed to the target application, or
        // exposed via public APIs.
        "sap-ui-app-id-hint": {
            injectFrom: "startupParameter",
            isIntentParameter: true,
            getValue: denyParameterValue,
            bExposeAsAppInfo: false
        },
        // The application component hierarchy (ACH) will for WDA and SAPGui
        // apps be provided as part of the configuration string of the target
        // mapping.
        // For UI5 apps it is contained in the app descriptor / manifest.
        "sap-ach": {
            injectFrom: "startupParameter",
            isIntentParameter: true,
            getValue: function (sParameterName, oApplicationComponent, oApplicationContainer, sApplicationType) {
                return new Promise(function (fnSuccess, fnFail) {
                    if (sApplicationType === "UI5") {
                        fnSuccess(getValueFromComponent(sParameterName, oApplicationComponent) || getValueFromManifest("/sap.app/ach", oApplicationComponent));
                    } else {
                        fnSuccess(getValueFromContainer(sParameterName, oApplicationContainer));
                    }
                });
            },
            bExposeAsAppInfo: true
        },
        // Used by ClientSideTargetResolution to execute a sequence of operations
        // on application startup parameters and selection variants in sap-xapp-state
        // before transferring these parameters to the target application
        "sap-prelaunch-operations": {
            injectFrom: "inboundParameter",
            isIntentParameter: true,
            getValue: denyParameterValue,
            bExposeAsAppInfo: false
        },
        // A parameter propagated across programmatic navigations by FLP
        // which indicates the preferred system a target application should
        // be launched into. This parameter ensures the user is kept within the
        // same content provider across navigations if possible - which is
        // desired behavior in multi-content provider scenarios.
        "sap-app-origin-hint": {
            injectFrom: "startupParameter",
            isIntentParameter: false,
            getValue: denyParameterValue,
            bExposeAsAppInfo: false
        },
        // The parameter that allows the navigation to a specific content provider
        "sap-app-origin": {
            injectFrom: "startupParameter",
            isIntentParameter: false,
            getValue: denyParameterValue,
            bExposeAsAppInfo: false
        }
    };

    function getAppInfoTechnicalParameters (oComponentInstance, oApplicationContainer, sApplicationType) {
        return new Promise(function (fnResolve) {
            var aTechnicalParametersAppInfo = getParameters({bExposeAsAppInfo: true}).map(function (oResult) {
                return oResult.name;
            });
            var promises = Object.values(aTechnicalParametersAppInfo).map(function (sParameterAppInfo) {
                return getParameterValue(sParameterAppInfo, oComponentInstance, oApplicationContainer, sApplicationType);
            });
            var oTechnicalAppInfo = {};
            Promise.allSettled(promises).then(function (values) {
                Object.keys(aTechnicalParametersAppInfo).forEach(function (key, index) {
                    if (values[index].status === "fulfilled") {
                        oTechnicalAppInfo[aTechnicalParametersAppInfo[key]] = values[index];
                    }
                });
                fnResolve(oTechnicalAppInfo);
            });
        });
        }

    /**
     * Helper method to deny access to a technical value
     *
     * @param {string} sParameterName
     *  The name of the technical parameter
     *
     * @returns {Promise<string>}
     *  A promise that always rejects with an error message.
     *
     * @private
     */
    function denyParameterValue (sParameterName) {
        return Promise.reject(sParameterName + " is reserved for shell internal usage only");
    }

    /**
     * Helper method to obtain a technical value directly from the application component.
     * This is the case if the current type of the application is not "UI5".
     *
     * @param {string} sParameterName
     * the name of the parameter
     * @param {object} oApplicationComponent
     * the component of the given application
     *
     * @returns {array}
     * returns an array of results for the given parameter name from the application component
     */
    function getValueFromComponent (sParameterName, oApplicationComponent) {
        var oComponentData = oApplicationComponent.getComponentData() || {};
        var aTechnicalParameters = oComponentData.technicalParameters || {};
        return aTechnicalParameters[sParameterName];
    }

    /**
     * Helper method to obtain a technical value from the application component manifest.
     * This is the case if the current type of the application is "UI5".
     *
     * @param {string} sPath
     * the path where to find the parameter
     * @param {object} oApplicationComponent
     * the component of the given application
     *
     * @returns {array}
     * returns an array of results for the given path from the application component manifest
     */
    function getValueFromManifest (sPath, oApplicationComponent) {
        var vValue = oApplicationComponent.getManifestEntry(sPath);
        if (vValue && !oTypeUtils.isArray(vValue)) {
            vValue = [vValue];
        }
        return vValue;
    }

    /**
     * Helper method to obtain a technical value from the application container.
     * This is the case if the current type of the application is not "UI5".
     *
     * @param {string} sParameterName
     * the name of the parameter
     * @param {object} oApplicationContainer
     * the container of the given application
     *
     * @returns {array}
     * returns an array of results for the given parameter name from the application container
     */
    function getValueFromContainer (sParameterName, oApplicationContainer) {
        var aReservedParameters = oApplicationContainer.getReservedParameters();
        return aReservedParameters && aReservedParameters[sParameterName];
    }

    /**
     * Method to obtain the value of a technical parameter
     *
     * @param {string} sParameterName
     * the name of the parameter
     * @param {object} oApplicationComponent
     * the component of the given application (only needed for UI5 applications)
     * @param {object} oApplicationContainer
     * the container of the given application (only needed for non UI5 applications)
     * @param {string} sApplicationType
     * the type of the application, in order to decide on how to get the value
     *
     * @returns {Promise}
     * returns a promise that resolve with array of all values, belonging to the
     * given parameter name or rejects with an error message. An array is returned
     * because multiple values might exist for a given technical parameter.
     *
     * @private
     */
    function getParameterValue (sParameterName, oApplicationComponent, oApplicationContainer, sApplicationType) {
            if (!oTechnicalParameters[sParameterName]) {
                return Promise.reject(sParameterName + " is not a known technical parameter");
            }

            return oTechnicalParameters[sParameterName].getValue(
                sParameterName,
                oApplicationComponent,
                oApplicationContainer,
                sApplicationType);
    }
    /**
     * Takes the filter options and returns the matching technical parameter description.
     *
     * @param {object} oFilterOptions The filter options are used to determine the correct technical parameters
     * @returns {object[]} The matching technical parameter description
     */
    function getParameters (oFilterOptions) {
        if (!oFilterOptions) {
            oFilterOptions = {};
        }

        return Object.keys(oTechnicalParameters).filter(function (oTechnicalParameterName) {
            var oParameter = oTechnicalParameters[oTechnicalParameterName];
            return Object.keys(oFilterOptions).every(function (sFilterName) {
                var vDesiredPropertyValue = oFilterOptions[sFilterName];
                var bHasParameter = oParameter.hasOwnProperty(sFilterName);
                if (bHasParameter) {
                    return oParameter[sFilterName] === vDesiredPropertyValue;
                }
                return false;
            });
        }).map(function (sMatchingParameter) {
            return Object.keys(oTechnicalParameters[sMatchingParameter]).reduce(function (oParameterDescription, sParameterAttributeName) {
                oParameterDescription[sParameterAttributeName] = oTechnicalParameters[sMatchingParameter][sParameterAttributeName];
                return oParameterDescription;
            }, {
                name: sMatchingParameter
            });
        });
    }

    /**
     * Obtains an array of all parameter names.
     *
     * @returns {array} All technical parameter names defined in this file
     *
     * @private
     */
    function getParameterNames () {
        return Object.keys(oTechnicalParameters);
    }

    /**
     * Checks whether the given parameter is a technical parameter.
     *
     * @param {string} parameterName the name of the parameter
     *
     * @return {boolean}
     *
     *  Whether the given parameter name is a technical parameter
     */
    function isTechnicalParameter (parameterName) {
        return oTechnicalParameters.hasOwnProperty(parameterName);
    }

    /**
     * Get the value of the given parameter.
     *
     * @param {string} sParameterName The name of the parameter whose value should be returned
     * @param {object} oApplicationComponent The  current application component
     * @param {object} oApplicationContainer The current application container
     * @param {string} sApplicationType The type of the current application
     * @return {array} The results for the given parameter name
     */
    function getParameterValueSync (sParameterName, oApplicationComponent, oApplicationContainer, sApplicationType) {
        if (sApplicationType === "UI5") {
            return getValueFromComponent(sParameterName, oApplicationComponent);
        }
        return getValueFromContainer(sParameterName, oApplicationContainer);
    }

    return {
        getParameterValue: getParameterValue,
        getParameterValueSync: getParameterValueSync,
        getParameters: getParameters,
        getParameterNames: getParameterNames,
        isTechnicalParameter: isTechnicalParameter,
        getTechnicalParametersAppInfo: getAppInfoTechnicalParameters
    };

}, false /* bExport= */);
