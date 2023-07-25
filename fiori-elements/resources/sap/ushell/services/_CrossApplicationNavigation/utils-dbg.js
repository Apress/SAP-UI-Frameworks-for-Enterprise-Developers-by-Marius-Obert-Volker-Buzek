// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview Cross Application Navigation utility functions
 *
 * @version 1.113.0
 */


sap.ui.define([
    "sap/base/util/ObjectPath",
    "sap/base/Log",
    "sap/ushell/utils/UrlParsing"
], function (ObjectPath, Log, UrlParsing) {
    "use strict";

    var Utils = {};

    /**
     * Returns the options (i.e., parameter name and elements other than
     * values) from a given <code>CrossApplicationNavigation#getLinks</code>
     * 'params' argument - which may or may not have been expressed in extended
     * format.
     *
     * @param {object} oGetLinksParams
     *  <code>#getLinks</code> parameters, for example like:
     *  <pre>
     *  {
     *      p1: "v1",     // single value
     *      p2: ["v2"],   // array-wrapped value
     *      p3: {         // "extended" format
     *          value: ["v3", "v4"],
     *          required: true
     *      }
     *  }
     *  </pre>
     *
     * @returns {object[]}
     *  Just parameter name and options (without value fields). Only parameters
     *  with at least one option will appear in this array. If the caller
     *  specified empty options for a given parameter, the parameter will not
     *  be extracted into the array.
     *
     *  This is an array like:
     * <pre>
     *  [{
     *      name: "p1",
     *      options: {
     *          required: true
     *      }
     *   },
     *   ...
     *  ]
     * </pre>
     *
     * @private
     */
    Utils.extractGetLinksParameterOptions = function (oGetLinksParams) {
        return Utils.parseGetLinksParameters(oGetLinksParams)
            .filter(function (oParsedParam) {
                return Object.keys(oParsedParam.options).length > 0;
            })
            .map(function (oParsedParamWithOptions) {
                return {
                    name: oParsedParamWithOptions.name,
                    options: oParsedParamWithOptions.options
                };
            });
    };

    /**
     * Returns the definition (i.e., parameter name and values only) from a
     * given <code>CrossApplicationNavigation#getLinks</code> 'params' argument
     * - which may or may not have been expressed in extended format.
     *
     * @param {object} oGetLinksParams
     *  <code>#getLinks</code> parameters, for example like:
     *  <pre>
     *  {
     *      p1: "v1",     // single value
     *      p2: ["v2"],   // array-wrapped value
     *      p3: {         // "extended" format
     *          value: ["v3", "v4"],
     *          required: true
     *      }
     *  }
     *  </pre>
     *
     * @returns {object}
     *
     * Just parameter name and values (without other option fields) in compact
     * format, suitable for use in combination with <code>URLParsing</code>
     * methods (e.g., <code>URLParsing#paramsToString</code>).
     *
     * <pre>
     *  {
     *      p1: "v1",
     *      p2: ["v2"],
     *      p3: ["v3", "v4"]
     *  }
     * </pre>
     *
     * @private
     */
    Utils.extractGetLinksParameterDefinition = function (oGetLinksParams) {
        return Utils.parseGetLinksParameters(oGetLinksParams)
            .reduce(function (oResultDefinition, oParsedParam) {
                oResultDefinition[oParsedParam.name] = oParsedParam.value;
                return oResultDefinition;
            }, {} /* oResultDefinition */);
    };

    /**
     * Recognize the different parts of the
     * <code>CrossApplicationNavigation#getLinks</code> 'params' argument.
     *
     * @param {object} oGetLinksParams
     *  <code>#getLinks</code> parameters, for example like:
     *  <pre>
     *  {
     *      p1: "v1",     // single value
     *      p2: ["v2"],   // array-wrapped value
     *      p3: {         // "extended" format
     *          value: ["v3", "v4"],
     *          required: true
     *      }
     *  }
     *  </pre>
     *
     * @returns {object[]}
     *
     * Parsed parameters conveniently returned in an array like:
     * <pre>
     * [
     *    { name: "p1", value: "v1"  , options: {} },
     *    { name: "p2", value: ["v2"], options: {} },
     *    {
     *      name: "p3",
     *      value: ["v3", "v4"],
     *      options: { required: true }
     *    },
     * ]
     * </pre>
     *
     * Note:
     * <ul>
     * <li>Parameters returned by this method are not sorted, and caller should
     * assume no particular order when iterating through the results.</li>
     * <li>The name/value/options structure is consistently always returned for
     * each item of the array.</li>
     * <li>The method is pure, does not alter the input object.</li>
     * </ul>
     *
     * @private
     */
    Utils.parseGetLinksParameters = function (oGetLinksParams) {
        if (Object.prototype.toString.apply(oGetLinksParams) !== "[object Object]") {
            return [];
        }

        var oParamsCopy = JSON.parse(JSON.stringify(oGetLinksParams));

        return Object.keys(oParamsCopy).map(function (sParamName) {
            var vParamValue = oParamsCopy[sParamName];
            var oParamOptions = {};

            if (Object.prototype.toString.apply(vParamValue) === "[object Object]") {
                vParamValue = vParamValue.value; // take the value...
                delete oParamsCopy[sParamName].value;
                oParamOptions = oParamsCopy[sParamName]; // ... leave the rest
            }

            return {
                name: sParamName,
                value: vParamValue,
                options: oParamOptions
            };
        });
    };

    /**
     * Parses a string to an object safely.
     *
     * @param {string} sObject
     *   The string representing the object
     *
     * @returns {object}
     *   The parsed object. Logs an error message and returns null when the
     *   given string could not be parsed to an object.
     *
     * @private
     */
     Utils.safeParseToObject = function (sObject) {
        try {
            return JSON.parse(sObject);
        } catch (e) {
            Log.error(
                "Cannot parse the given string to object",
                sObject,
                "sap.ushell.services.CrossApplicationNavigation"
            );
        }

        return null;
    };

    /**
     * Creates an app state from the given data, returning its key. Whether
     * the created appstate is transient or not, is decided by the FLP
     * settings for the appstate service.
     *
     * @param {object} oData
     *   The data to put into the app state.
     *
     * @returns {string}
     *   The AppStateKey
     *
     * @private
     * @deprecated since 1.94. Please use {@link #createAppStateFromDataAsync} instead.
     */
     Utils.createAppStateFromData = function (oData) {
        Log.error("Deprecated API call of '_CrossApplicationNavigation.utils.createAppStateFromData'. Please use 'createAppStateFromDataAsync' instead",
            null,
            "sap.ushell.services._CrossApplicationNavigation.utils"
        );

        var oAppStateService = sap.ushell.Container.getService("AppState"); // LEGACY API (deprecated)
        var oAppState = oAppStateService.createEmptyAppState(null /* use default bTransient settings */);
        oAppState.setData(oData);
        oAppState.save();

        return oAppState.getKey();
    };

    /**
     * Creates an app state from the given data, returning its key. Whether
     * the created appstate is transient or not, is decided by the FLP
     * settings for the appstate service.
     *
     * @param {object} oData
     *   The data to put into the app state.
     *
     * @returns {Promise<string>}
     *   A Promise which resolves the AppStateKey
     *
     * @private
     * @since 1.94.0
     */
     Utils.createAppStateFromDataAsync = function (oData) {
        return sap.ushell.Container.getServiceAsync("AppState")
            .then(function (AppStateService) {
                var oAppState = AppStateService.createEmptyAppState(null /* use default bTransient settings */);
                oAppState.setData(oData);
                oAppState.save();

                return oAppState.getKey();
            });
    };

    /**
     * Extracts a parameter from the given intent
     *
     * @param {variant} vIntent
     *  The input intent. It can be an object or a string in the format:
     *
     *  <pre>
     *  {
     *     target : { semanticObject : "AnObject", action: "action" },
     *     params : { "paramA": "valueA" }
     *  }
     *  </pre>
     *
     *  or
     *
     *  <pre>
     *  {
     *     target : { shellHash : "SO-36?paramA=valueA" }
     *  }
     *  </pre>
     *
     * @param {string} sParameterName
     *   The name of the parameter to extract.
     *
     * @returns {object}
     *   An object like:
     *   {
     *      intent: <input intent without the parameter>,
     *      data: [<value of the parameter in the input intent>]
     *   }
     *
     * @private
     */
    Utils.extractParameter = function (vIntent, sParameterName) {
        var sIntentWithoutParameter;
        var aParameterValue = null;

        if (typeof vIntent === "string") {
            // Avoid using URLParsing unnecessarily.
            if (vIntent.indexOf(sParameterName + "=") === -1) {
                return { intent: vIntent, data: null };
            }

            var oParsedIntent = UrlParsing.parseShellHash(vIntent);
            if (!oParsedIntent) {
                return { intent: vIntent, data: null };
            }

            aParameterValue = oParsedIntent.params[sParameterName];
            delete oParsedIntent.params[sParameterName];
            sIntentWithoutParameter = UrlParsing.constructShellHash(oParsedIntent);

            return {
                intent: sIntentWithoutParameter,
                data: aParameterValue
            };
        }

        if (Object.prototype.toString.apply(vIntent) === "[object Object]") {
            var sShellHash = ObjectPath.get("target.shellHash", vIntent);
            if (typeof sShellHash === "string") {
                var oResult = Utils.extractParameter(sShellHash, sParameterName);

                // modify the source object
                vIntent.target.shellHash = oResult.intent;

                return {
                    intent: vIntent,
                    data: oResult.data
                };
            }

            var oParameters = vIntent.params;
            if (oParameters && oParameters[sParameterName]) {
                aParameterValue = typeof oParameters[sParameterName] === "string"
                    ? [ oParameters[sParameterName] ]
                    : oParameters[sParameterName];

                delete oParameters[sParameterName];
            }

            return {
                intent: vIntent,
                data: aParameterValue
            };
        }

        Log.error(
            "Invalid input parameter",
            "expected string or object",
            "sap.ushell.services.CrossApplicationNavigation"
        );

        return { intent: vIntent };
    };

    /**
     * Adds an sap-xapp-state parameter to the given intent.
     *
     * @param {object} vIntent
     *   The intent to add the sap-xapp-state parameter to.
     *
     * @param {string} sSourceParameter
     *   The name of the parameter that contains the sap-xapp-state data.
     */
    Utils.addXAppStateFromParameter = function (vIntent, sSourceParameter) {
        var oXAppStateDataExtraction = Utils.extractParameter(vIntent, sSourceParameter);
        var vIntentNoXAppStateData = oXAppStateDataExtraction.intent;
        var sXAppStateData = oXAppStateDataExtraction.data && oXAppStateDataExtraction.data[0];
        if (!sXAppStateData) {
            return;
        }

        var oAppStateData = Utils.safeParseToObject(sXAppStateData);
        if (!oAppStateData) {
            return;
        }

        var sAppStateKey = Utils.createAppStateFromData(oAppStateData);

        Utils.injectParameter(vIntentNoXAppStateData, "sap-xapp-state", sAppStateKey);
    };

    /**
     * Adds an sap-xapp-state parameter to the given intent.
     *
     * @param {object} vIntent
     *   The intent to add the sap-xapp-state parameter to.
     *
     * @param {string} sSourceParameter
     *   The name of the parameter that contains the sap-xapp-state data.
     * @returns {Promise<void>}
     *   A Promise which resolves once the AppState was created
     *
     * @private
     * @since 1.94.0
     */
     Utils.addXAppStateFromParameterAsync = function (vIntent, sSourceParameter) {
        var oXAppStateDataExtraction = Utils.extractParameter(vIntent, sSourceParameter);
        var vIntentNoXAppStateData = oXAppStateDataExtraction.intent;

        var sXAppStateData = oXAppStateDataExtraction.data && oXAppStateDataExtraction.data[0];
        if (!sXAppStateData) {
            return Promise.resolve();
        }

        var oAppStateData = Utils.safeParseToObject(sXAppStateData);
        if (!oAppStateData) {
            return Promise.resolve();
        }

        return Utils.createAppStateFromDataAsync(oAppStateData)
            .then(function (sAppStateKey) {
                Utils.injectParameter(vIntentNoXAppStateData, "sap-xapp-state", sAppStateKey);
            });
    };

    /**
     * Inject a parameter into the given intent.
     *
     * @param {variant} vIntent
     *   The intent
     * @param {string} sParameterName
     *   The parameter name
     * @param {variant} vParameterValue
     *   The parameter value
     *
     * @returns {variant}
     *   The input intent with the added parameter
     *
     * @private
     */
    Utils.injectParameter = function (vIntent, sParameterName, vParameterValue) {
        if (typeof vIntent === "string") {
            var oParsedIntent = UrlParsing.parseShellHash(vIntent);
            oParsedIntent.params[sParameterName] = vParameterValue;

            return UrlParsing.constructShellHash(oParsedIntent);
        }

        if (Object.prototype.toString.apply(vIntent) === "[object Object]") {
            var sShellHash = ObjectPath.get("target.shellHash", vIntent);
            if (typeof sShellHash === "string") {
                vIntent.target.shellHash = Utils.injectParameter(
                    sShellHash, sParameterName, vParameterValue
                );

                return vIntent;
            }

            if (!vIntent.params) {
                vIntent.params = {};
            }

            vIntent.params[sParameterName] = vParameterValue;
        }

        return vIntent;
    };


    /**
     *
     * @param {object} oParams
     * @param {object} oParams.type The sap.ushell.utils.type object
     * @param {object} oParams.inject The parameters to be injected
     * @param {any} oParams.args The arguments, depending on the context where the function is called, please see
     * the JSDoc of the caller functions
     *
     * @returns The oParams.args with parameters from oParams.inject appended
     * @private
     */

    Utils._injectParameters = function (oParams) {
        var oParametersToInject = oParams.inject;
        var oInjectEmptyStringNames = (oParams.injectEmptyString || {});
        var oType = oParams.type;
        var vArgs = oParams.args;

        function shouldInjectValue (sVal, bInjectWhenEmptyString) {
            return (sVal || (sVal === "" && bInjectWhenEmptyString));
        }

        if (oType.isPlainObject(vArgs)) {
            // Arguments like .target.shellHash
            if (vArgs.target && vArgs.target.shellHash) {
                if (typeof vArgs.target.shellHash === "string") {
                    vArgs.target.shellHash = Utils._injectParameters({
                        inject: oParametersToInject,
                        injectEmptyString: oInjectEmptyStringNames,
                        type: oParams.type,
                        args: vArgs.target.shellHash
                    });
                }
                return vArgs;
            }

            // Arguments like {semanticObject: ..., action: ..., params: { ... } }
            var oNewParameterObject = Object.keys(oParametersToInject).reduce(function (oInjectedParameters, sParameterToInject) {
                var sValueToInject = oParametersToInject[sParameterToInject];
                var bInjectWhenEmptyString = (oInjectEmptyStringNames[sParameterToInject] === true);
                // when params is a string
                if (shouldInjectValue(sValueToInject, bInjectWhenEmptyString) && typeof oInjectedParameters === "string") {
                    var reUrlParameter = new RegExp("[&]" + sParameterToInject);
                    var bHasNoParameterAlready = !reUrlParameter.test(oInjectedParameters);
                    if (bHasNoParameterAlready) {
                        // When oInjectedParameters is an empty string, no separator needs to be added.
                        var sSeparator = oInjectedParameters ? "&" : "";
                        oInjectedParameters += sSeparator + sParameterToInject + "=" + sValueToInject;
                    }
                } else if (shouldInjectValue(sValueToInject, bInjectWhenEmptyString) && !oInjectedParameters.hasOwnProperty(sParameterToInject)) {
                    oInjectedParameters[sParameterToInject] = sValueToInject;
                }
                return oInjectedParameters;
            }, vArgs.params || {});

            if (oNewParameterObject && Object.keys(oNewParameterObject).length > 0) {
                vArgs.params = oNewParameterObject;
            }

            return vArgs;
        }

        // Arguments like #Hash-fragment?with=parameters
        var sShellHash = vArgs;
        if (sShellHash) {
            Object.keys(oParametersToInject).forEach(function (sParameterToInject) {
                var sValueToInject = oParametersToInject[sParameterToInject];
                var bInjectWhenEmptyString = (oInjectEmptyStringNames[sParameterToInject] === true);
                var reUrlParameter = new RegExp("[?&]" + sParameterToInject);
                var bHasNoParameterAlready = !reUrlParameter.test(sShellHash);
                if (shouldInjectValue(sValueToInject, bInjectWhenEmptyString) && bHasNoParameterAlready) {
                    var sSeparator = sShellHash.indexOf("?") > -1 ? "&" : "?";
                    sShellHash += sSeparator + sParameterToInject + "=" + sValueToInject;
                }
            });
        }

        return sShellHash;
    };

    /**
     * Injects sticky parameters into the arguments of the API call.
     *
     * @param {object} oParams A parameter bag containing the following properties
     * @param {any} oParams.args The arguments, depending on the context where the function is called, please see
     * the JSDoc of the caller functions
     * @param {object} oParams.appLifeCycle App life cycle of application integration
     * @param {object} oParams.technicalParameters The technical parameter object
     * @param {object} oParams.type The object sap.ushell.utils.type object
     *
     * @returns {any} Arguments with sticky parameters
     * @private
     * @deprecated since 1.94. Please use {@link #injectStickyParametersAsync} instead.
     */
    Utils.injectStickyParameters = function (oParams) {
        Log.error("Deprecated API call of '_CrossApplicationNavigation.utils.injectStickyParameters'. Please use 'injectStickyParametersAsync' instead",
            null,
            "sap.ushell.services._CrossApplicationNavigation.utils"
        );

        var oAppLifeCycleService = sap.ushell.Container.getService("AppLifeCycle"); // LEGACY API (deprecated)
        return Utils._injectStickyParameters(oParams, oAppLifeCycleService);
    };

    /**
     * Injects sticky parameters into the arguments of the API call.
     *
     * @param {object} oParams A parameter bag containing the following properties
     * @param {any} oParams.args The arguments, depending on the context where the function is called, please see
     * the JSDoc of the caller functions
     * @param {object} oParams.appLifeCycle App life cycle of application integration
     * @param {object} oParams.technicalParameters The technical parameter object
     * @param {object} oParams.type The object sap.ushell.utils.type object
     *
     * @returns {Promise<any>} A Promise which resolves the arguments with sticky parameters
     * @private
     */
     Utils.injectStickyParametersAsync = function (oParams) {
        return sap.ushell.Container.getServiceAsync("AppLifeCycle")
            .then(function (oAppLifeCycleService) {
                return Utils._injectStickyParameters(oParams, oAppLifeCycleService);
            });
    };

    /**
     * Injects sticky parameters into the arguments of the API call.
     *
     * @param {object} oParams A parameter bag containing the following properties
     * @param {any} oParams.args The arguments, depending on the context where the function is called, please see
     * the JSDoc of the caller functions
     * @param {object} oParams.appLifeCycle App life cycle of application integration
     * @param {object} oParams.technicalParameters The technical parameter object
     * @param {object} oParams.type The object sap.ushell.utils.type object
     * @param {object} oAppLifeCycleService The AppLifeCycle Service
     *
     * @returns {any} Arguments with sticky parameters
     * @private
     */
    Utils._injectStickyParameters = function (oParams, oAppLifeCycleService) {
        if (!oAppLifeCycleService || Object.keys(oAppLifeCycleService).length <= 0) {
            return oParams.args;
        }
        var oCurrentApplication = oAppLifeCycleService.getCurrentApplication();
        if (!oCurrentApplication || Object.keys(oCurrentApplication).length <= 0) {
            return oParams.args;
        }
        var oAppIntegrationAppLifeCycle = oParams.appLifeCycle;
        var oTechnicalParameters = oParams.technicalParameters;
        var oStickyParametersToInject = oTechnicalParameters.getParameters({
            sticky: true
        })
            .reduce(function (oStickyParameters, oNextParameter) {
                var sNextParameterName = oNextParameter.name;
                var oComponentInstance = oCurrentApplication.componentInstance;
                var sApplicationType = oCurrentApplication.applicationType;
                var oApplicationContainer;
                if (sApplicationType === "UI5") {
                    oApplicationContainer = {};
                } else {
                    oApplicationContainer = oAppIntegrationAppLifeCycle.getCurrentApplication().container;
                }
                var sStickyParameterValue = oTechnicalParameters.getParameterValueSync(sNextParameterName, oComponentInstance, oApplicationContainer, sApplicationType);
                var sStickyParameterName = oNextParameter.stickyName || sNextParameterName;
                oStickyParameters[sStickyParameterName] = sStickyParameterValue;
                return oStickyParameters;
            }, {});
        var oArgs = {
            type: oParams.type,
            inject: oStickyParametersToInject,
            args: oParams.args
        };

        return Utils._injectParameters(oArgs);
    };

    return Utils;
});
