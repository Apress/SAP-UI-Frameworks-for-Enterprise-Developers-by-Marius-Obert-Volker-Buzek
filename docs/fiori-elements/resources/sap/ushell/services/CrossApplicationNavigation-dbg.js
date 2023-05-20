// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Cross Application Navigation.
 * This file exposes an API to perform (invoke) Cross Application Navigation for applications.
 * It exposes interfaces to perform a hash change and/or trigger an external navigation.
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/services/AppConfiguration",
    "sap/ushell/services/_CrossApplicationNavigation/utils",
    "sap/ushell/utils/type",
    "sap/ushell/TechnicalParameters",
    "sap/ushell/components/applicationIntegration/AppLifeCycle",
    "sap/base/util/deepExtend",
    "sap/base/util/isPlainObject",
    "sap/ui/thirdparty/jquery",
    "sap/base/util/ObjectPath",
    "sap/base/util/merge",
    "sap/ushell/utils",
    "sap/ushell/ApplicationType",
    "sap/ushell/UI5ComponentType",
    "sap/base/Log",
    "sap/ushell/utils/UrlParsing",
    "sap/base/util/deepClone",
    "sap/ui/base/Object"
], function (
    oAppConfiguration,
    oUtils,
    oType,
    TechnicalParameters,
    oAppLifeCycle,
    deepExtend,
    isPlainObject,
    jQuery,
    ObjectPath,
    merge,
    utils,
    ApplicationType,
    UI5ComponentType,
    Log,
    UrlParsing,
    deepClone,
    BaseObject
) {
    "use strict";

    /**
     * @class
     * @alias sap.ushell.services.CrossApplicationNavigation
     * @classdesc
     * The Unified Shell's CrossApplicationNavigation service allows to navigate to "external" targets outside of the currently running app (but still in scope
     * of the current Fiori launchpad) or create links to such external targets.
     *
     * To use the CrossApplicationNavigation service you can retrieve an instance via ushell's Container:
     * <pre>
     * sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (CrossApplicationNavigationService) {
     *   // Use the CrossApplicationNavigation service
     * });
     * </pre>
     *
     * The CrossApplicationNavigation service currently provides platform independent functionality.
     *
     * The service is meant to be used by applications, plugins and shell components.
     *
     * Usage:
     *   <pre>
     *   sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then( function (oService) {
     *
     *      oService.hrefForExternalAsync({
     *          target : {
     *              semanticObject: "Product",
     *              action: "display"
     *          },
     *          params: {
     *              "ProductID": "102343333"
     *          }
     *      }).then( function(sHref) {
     *          // Place sHref somewhere in the DOM
     *      });
     *   });
     *   </pre>
     *
     * Parameter names and values are case sensitive.
     *
     * Note that the usage of multi-valued parameters (specifying an array with more than one member as parameter value,
     * e.g. <code>params : { A : ["a1", "a2"] }</code>) is possible with this API but <b>strongly discouraged</b>.
     * Depending on the used platform / back-end implementation the target matching might not supported multi-value parameters.
     * Furthermore, it is not guaranteed that additional parameter values specified in the back-end configuration are merged with
     * parameter values passed in this method.
     *
     * Note that the application parameter length (including SemanticObject/Action) shall not exceed 512 bytes when serialized as UTF-8.
     *
     * Note that when receiving the values as startup parameters (as part of the component data object)
     * single values are represented as an array of size 1.
     * Above example is returned as <code> deepEqual(getComponentData().startupParameters ,  { "ProductID" : [ "102343333" ] } ) </code>
     *
     * Make sure not to store security critical data within an URL.
     * URLs may appear in a server log, be persisted inside and outside the system.
     *
     * Note: When constructing large URLs, the URLs may be shortened and persisted on a database server for prolonged time,
     * the actual data is persisted under a key accessible to any User (guessing the key).
     *
     * The same restrictions apply for the Application state.
     *
     * @param {object} oContainerInterface The Container Interface.
     * @param {string} sParameters The parameters.
     * @param {object} oServiceConf Service Configuration.
     *
     * @hideconstructor
     *
     * @see sap.ushell.services.Container#getServiceAsync
     *
     * @since 1.15.0
     * @public
     */
    function CrossApplicationNavigation (oContainerInterface, sParameters, oServiceConf) {
        var oServiceConfiguration;
        if (oServiceConf && oServiceConf.config) {
            oServiceConfiguration = oServiceConf.config;
        }

        /**
         * Adds the system of the current application specified as <code>sap-system</code> parameter in its URL to the
         * parameter object <code>oTarget</code> used in the methods {@link sap.ushell.services.CrossApplicationNavigation#hrefForExternal}
         * and {@link sap.ushell.services.CrossApplicationNavigation#toExternal}.
         * The system is only added if the current application specifies it and <code>oTarget</code>
         * does not already contain this parameter.
         *
         * @param {object|string} vTarget The navigation target object or string, for example:
         * <pre>
         *   {
         *     target: {
         *       semanticObject: "AnObject",
         *       action: "action"
         *     },
         *     params: { A: "B" }
         *   }
         * </pre>
         *   or
         * <pre>
         *   {
         *     target: {
         *       semanticObject: "AnObject",
         *       action: "action"
         *     },
         *     params: {
         *       A: ["B"],
         *       c: "e"
         *     }
         *   }
         * </pre>
         *   or
         *   <code>{ target: { shellHash: "SO-36&jumper=postman" } }</code>
         *   or
         *   <code>"#SO-36&jumper=postman"</code>
         *   <b>Important</b> The target expressed in this parameter should not contain an inner-app route.
         * @param {object} [oComponent] the root component of the application
         * @returns {string|object} the vTarget with the sap-system parameter appended (unless already present).
         * @private
         */
        function getTargetWithCurrentSystem (vTarget, oComponent) {
            var sSystem;
            var sNextNavMode;
            var sAppOrigin;

            if (typeof vTarget !== "string" && !isPlainObject(vTarget) && vTarget !== undefined) {
                Log.error("Unexpected input type", null, "sap.ushell.services.CrossApplicationNavigation");
                return undefined;
            }

            if (vTarget === undefined) {
                return undefined;
            }

            var oResolution = oAppConfiguration.getCurrentApplication();
            if (oComponent) {
                // Take sap-system, sap-ushell-next-navmode and sap-app-origin-hint parameters from the component
                if (typeof oComponent.getComponentData !== "function" ||
                    !isPlainObject(oComponent.getComponentData()) ||
                    !oComponent.getComponentData().startupParameters ||
                    !isPlainObject(oComponent.getComponentData().startupParameters)) {
                    Log.error(
                        "Cannot call getComponentData on component",
                        "the component should be an application root component",
                        "sap.ushell.services.CrossApplicationNavigation"
                    );
                } else {
                    var oComponentStartupParams = oComponent.getComponentData().startupParameters; // assume always present on root component
                    if (oComponentStartupParams.hasOwnProperty("sap-system")) {
                        sSystem = oComponentStartupParams["sap-system"][0];
                    }
                    if (oComponentStartupParams.hasOwnProperty("sap-ushell-next-navmode")) {
                        sNextNavMode = oComponentStartupParams["sap-ushell-next-navmode"][0];
                    }
                }
            } else {
                // Take sap-system, sap-ushell-next-navmode and sap-app-origin-hint parameters from the current application
                if (oResolution && oResolution["sap-system"]) {
                    sSystem = oResolution["sap-system"];
                } else if (oResolution && oResolution.url) {
                    sSystem = new URL(oResolution.url, window.location.href).searchParams.get("sap-system");
                }
                if (oResolution && oResolution["sap-ushell-next-navmode"]) {
                    sNextNavMode = oResolution["sap-ushell-next-navmode"];
                } else if (oResolution && oResolution.url) {
                    sNextNavMode = new URL(oResolution.url, window.location.href).searchParams.get("sap-ushell-next-navmode");
                }
            }

            if (oResolution) {
                sAppOrigin = oResolution.contentProviderId;
            }

            var vInjectedTarget = oUtils._injectParameters({
                type: oType,
                inject: {
                    "sap-system": sSystem,
                    "sap-ushell-navmode": sNextNavMode,
                    "sap-app-origin-hint": sAppOrigin
                },
                injectEmptyString: {
                    "sap-app-origin-hint": true
                },
                args: vTarget
            });

            return vInjectedTarget;
        }

        /**
         * Adds the system of the current application specified as <code>sap-ushell-test-enc</code> parameter in its URL to the parameter
         * object <code>oTarget</code> used in the methods {@link sap.ushell.services.CrossApplicationNavigation#hrefForExternal} and {@link sap.ushell.services.CrossApplicationNavigation#toExternal}.
         * The parameter is always added. It will be overwritten or duplicated if present.
         * <code>oTarget</code> does not already contain this parameter.
         *
         * @param {object|string} vTarget The navigation target object or string, for example:
         * <pre>
         *   {
         *     target: {
         *       semanticObject: "AnObject",
         *       action: "action"
         *     },
         *     params: { A: "B" }
         *   }
         * </pre>
         *   or
         * <pre>
         *   {
         *     target: {
         *       semanticObject: "AnObject",
         *       action: "action"
         *     },
         *     params: {
         *       A: ["B"],
         *       c: "e"
         *     }
         *   }
         * </pre>
         *   or
         *   <code>{ target: { shellHash: "SO-36&jumper=postman" } }</code>
         *   or
         *   <code>"#SO-36&jumper=postman"  </code>
         * @returns {string|object} the vTarget with the sap-system parameter appended, e.g.
         * <pre>
         *   {
         *     target: {
         *       semanticObject: "AnObject",
         *       action: "action"
         *     },
         *     params: {
         *       A: "B",
         *       "sap-ushell-test-enc" : [ "A B%20C" ]
         *     }
         *   }
         * </pre>
         *   or
         * <pre>
         *   {
         *     target: {
         *       semanticObject: "AnObject",
         *       action: "action"
         *     },
         *     params: {
         *       "A": ["B"],
         *       "sap-ushell-test-enc": [ "A B%20C" ],
         *       "c": "e"
         *     }
         *   }
         * </pre>
         *   or
         *   <code>{ target: { shellHash: "SO-36&jumper=postman&sap-ushell-enc=A%20B%2520C" } }</code>
         * @private
         */
        function amendTargetWithSapUshellEncTestParameter (vTarget) {
            if (localStorage && localStorage["sap-ushell-enc-test"] === "false") {
                return vTarget;
            }
            if (!oServiceConfiguration || !oServiceConfiguration["sap-ushell-enc-test"]) {
                if (localStorage && localStorage["sap-ushell-enc-test"] !== "true") {
                    return vTarget;
                }
            }
            if (typeof vTarget !== "string" && !isPlainObject(vTarget) && vTarget !== undefined) {
                Log.error("Unexpected input type", null, "sap.ushell.services.CrossApplicationNavigation");
                return undefined;
            }

            if (vTarget === undefined) {
                return undefined;
            }

            if (isPlainObject(vTarget)) {
                // needs deep copy
                var oClonedTarget = deepExtend({}, vTarget);
                if (oClonedTarget.target && oClonedTarget.target.shellHash) {
                    if (typeof oClonedTarget.target.shellHash === "string") {
                        // process shell hash as a string
                        if (oClonedTarget.target.shellHash !== "#" && oClonedTarget.target.shellHash !== "") {
                            oClonedTarget.target.shellHash = amendTargetWithSapUshellEncTestParameter(
                                oClonedTarget.target.shellHash);
                        }
                    }
                    return oClonedTarget;
                }

                oClonedTarget.params = oClonedTarget.params || {};
                oClonedTarget.params["sap-ushell-enc-test"] = ["A B%20C"];

                return oClonedTarget;
            }
            var sShellHash = vTarget;

            if (!/[?&]sap-system=/.test(sShellHash)) {
                var sSeparator = (sShellHash.indexOf("?") > -1) ? "&" : "?";
                sShellHash += sSeparator + "sap-ushell-enc-test=" + encodeURIComponent("A B%20C");
            }
            return sShellHash;
        }

        /**
         * Extracts the inner app route from a given intent.
         *
         * This method actually amends the input parameter if it is not provided as a string (which is immutable in Javascript).
         *
         * @param {variant} vIntent The input intent. It can be an object or a string in the format:
         *   <pre>
         *   {
         *     target : { semanticObject : "AnObject", action: "action" },
         *     params : { A : "B" },
         *     appSpecificRoute: "some/inner-app/route"
         *   }
         *   </pre>
         *   or
         *   <pre>
         *   {
         *     target : {
         *       semanticObject : "AnObject",
         *       action: "action", context  : "AB7F3C"
         *     },
         *     params : {
         *       A : "B",
         *       c : "e"
         *     },
         *     appSpecificRoute: "some/inner-app/route"
         *   }
         *   </pre>
         *   or
         *   <pre>{ target : { shellHash : "SO-36?jumper=postman&/some/inner-app/route" } }</pre>
         * @returns {object} An object like:
         *   <pre>
         *   {
         *     innerAppRoute: "&/some/inner-app/route", // always present. "" if none found. Includes separator if found.
         *     intent: { }                              // vIntent without inner app route
         *   }
         *   </pre>
         *   NOTE: the returned <code>intent</code> field will be a string if the input <code>vIntent</code> was a string.
         * @private
         */
        this._extractInnerAppRoute = function (vIntent) {
            var that = this;

            if (typeof vIntent === "string") {
                var aParts = vIntent.split("&/"); // ["Object-action", "inner-app/route", ... ]
                var sIntent = aParts.shift(); // aParts now contains parts of inner-app route

                return {
                    intent: sIntent,
                    innerAppRoute: aParts.length > 0
                        ? "&/" + aParts.join("&/")
                        : ""
                };
            }

            if (Object.prototype.toString.apply(vIntent) === "[object Object]") {
                var sShellHash = ObjectPath.get("target.shellHash", vIntent);
                if (typeof sShellHash === "string") {
                    var oResult = that._extractInnerAppRoute(sShellHash);

                    // modify the source object
                    vIntent.target.shellHash = oResult.intent;

                    return {
                        intent: vIntent,
                        innerAppRoute: oResult.innerAppRoute
                    };
                }

                if (vIntent.hasOwnProperty("appSpecificRoute")) {
                    var vAppSpecificRoute = vIntent.appSpecificRoute;

                    delete vIntent.appSpecificRoute;

                    var bIsStringWithoutSeparator = typeof vAppSpecificRoute === "string"
                        && vAppSpecificRoute.indexOf("&/") !== 0
                        && vAppSpecificRoute.length > 0;

                    return {
                        innerAppRoute: bIsStringWithoutSeparator
                            ? "&/" + vAppSpecificRoute // vAppSpecificRoute guaranteed to be string
                            : vAppSpecificRoute, // can be an object
                        intent: vIntent
                    };
                }

                return {
                    intent: vIntent,
                    innerAppRoute: ""
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
         * Adds an inner app route to the given intent.
         *
         * @param {variant} vIntent The same input object or string that #_extractInnerAppRoute takes.
         * @param {string} [sInnerAppRoute] The inner app route.
         *   This method assumes that, if provided and non empty, it always starts wih "&/".
         * @returns {variant} The intent with the given <code>sInnerAppRoute</code> parameter.
         * @private
         */
        this._injectInnerAppRoute = function (vIntent, sInnerAppRoute) {
            var that = this;

            if (!sInnerAppRoute) {
                return vIntent;
            }

            if (typeof vIntent === "string") {
                return vIntent + sInnerAppRoute;
            }

            if (Object.prototype.toString.apply(vIntent) === "[object Object]") {
                var sShellHash = ObjectPath.get("target.shellHash", vIntent);
                if (typeof sShellHash === "string") {
                    vIntent.target.shellHash = that._injectInnerAppRoute(
                        sShellHash, sInnerAppRoute
                    );

                    return vIntent;
                }

                vIntent.appSpecificRoute = sInnerAppRoute;
            }

            return vIntent;
        };

        /**
         * Returns a string which can be put into the DOM (e.g. in a link tag).
         * <b>Note:</b> The generated url / url segment must not be used as <code>shellHash</code> in the target definition
         * of {@link sap.ushell.services.CrossApplicationNavigation#toExternal}
         *
         * @param {object} oArgs object encoding a semantic object and action, e.g.
         *   <pre>
         *   {
         *     target : { semanticObject : "AnObject", action: "action" },
         *     params : { A : "B" }
         *   }
         *   </pre>
         *   or
         *   e.g.
         *   <pre>
         *   {
         *     target : {
         *       semanticObject : "AnObject",
         *       action: "action", context  : "AB7F3C"
         *     },
         *     params : {
         *       A : "B",
         *       c : "e"
         *     }
         *   }
         *   </pre>
         *   or
         *   <pre>{ target : { shellHash : "SO-36?jumper=postman" } }</pre>
         * @param {object} [oComponent] the root component of the application
         * @param {boolean} bAsync if set to <code>true</code>, a promise will be returned instead of the direct argument.
         *   The promise will only succeed after all compaction requests have been sent.
         *   <code>bAsync=false</code> is deprecated since 1.94.
         * @returns {string|Promise<string>} the href for the specified parameters as an external shell hash;
         *   always starting with a hash character;
         *   all parameters and parameter names are URL-encoded (via encodeURIComponent) and the complete string is encoded via encodeURI (!).
         *   The generated string can not be used in the majority of interfaces which expect a internal shell hash.
         *
         * A proper way for an application to generate a link to return to the home page of the Fiori launchpad is:
         *   <code>hrefForExternal( { target : { shellHash : "#" }})</code>
         *
         * Do not use "#Shell-home" to navigate to a specific homepage!
         *
         * Note: if object is undefined, the current shell hash is returned.
         *
         * Note that the application parameter length (including SemanticObject/Action) shall not exceed 512 bytes when serialized as UTF-8.
         *
         * The function can be used to convert an shell hash internal format commonly encountered into the URL format to use in link tags:
         *   <pre>
         *   externalHash = oCrossApplicationNavigationService.hrefForExternal({
         *       target: { shellHash: oLink.intent }
         *   }, that.oComponent);
         *   </pre>
         *
         * Since version 1.56 this API accepts a sap-xapp-state-data parameter that can be used generate a url that can be used to launch
         *   and application with certain data, for example:
         *   <pre>
         *   {
         *     target : { semanticObject : "AnObject", action: "action" },
         *     params : { "sap-xapp-state-data" : JSON.stringify({ a: "b", c: "d" }) }
         *   }
         *   </pre>
         *
         * Using the arguments as in the example above, a link with a sap-xapp-state parameter that encodes the provided data is returned.
         * The sap-xapp-state-data parameter does not appear in the generated link.
         *
         * @since 1.15.0
         * @public
         * @deprecated since 1.98. Please use {@link #hrefForExternalAsync} instead.
         * @alias sap.ushell.services.CrossApplicationNavigation#hrefForExternal
         */
        this.hrefForExternal = function (oArgs, oComponent, bAsync) {
            // Check oComponent and bAsync as oComponent is optional
            if (typeof oComponent !== "object" && oComponent !== undefined && oComponent !== null) {
                bAsync = oComponent;
                oComponent = undefined;
            }

            if (bAsync) {
                var oDeferred = new jQuery.Deferred();
                this.hrefForExternalAsync(oArgs, oComponent)
                    .then(oDeferred.resolve)
                    .catch(oDeferred.reject);

                return oDeferred.promise();
            }

            Log.error("Deprecated option 'bAsync=false'. Please use 'bAsync=true' instead",
                null,
                "sap.ushell.services.CrossApplicationNavigation"
            );

            // clone because _extractInnerAppRoute may change the original structure
            // (we don't want to create side effects on the original object).
            var oArgsClone = merge({}, oArgs);
            var oExtraction = this._extractInnerAppRoute(oArgsClone);

            var vIntentNoAppRoute = oExtraction.intent;

            oUtils.addXAppStateFromParameter(
                vIntentNoAppRoute,
                "sap-xapp-state-data" /* parameter containing data */
            );

            oArgsClone = getTargetWithCurrentSystem(vIntentNoAppRoute, oComponent);
            oArgsClone = oUtils.injectStickyParameters({
                args: oArgsClone,
                appLifeCycle: oAppLifeCycle,
                technicalParameters: TechnicalParameters,
                type: oType
            });
            oArgsClone = amendTargetWithSapUshellEncTestParameter(oArgsClone);

            oArgsClone = this._injectInnerAppRoute(oArgsClone, oExtraction.innerAppRoute);

            var ShellNavigation = sap.ushell.Container.getService("ShellNavigation"); // LEGACY API (deprecated)

            if (!ShellNavigation) {
                Log.debug("Shell not available, no Cross App Navigation");
                return "";
            }

            return ShellNavigation.hrefForExternal(oArgsClone, undefined, oComponent, bAsync);
        };

        /**
         * Returns a promise resolving to a URL that launches an app with certain parameters.
         * The URL can be used to define a link to a Fiori application, for example.
         *
         * @param {object} oArgs object encoding a semantic object and action, e.g.
         * <pre>
         *   {
         *     target : { semanticObject : "AnObject", action: "action" },
         *     params : { A : "B" }
         *   }
         * </pre>
         *   or
         *   e.g.
         * <pre>
         *   {
         *     target : {
         *       semanticObject : "AnObject",
         *       action: "action", context  : "AB7F3C"
         *     },
         *     params : {
         *       A : "B",
         *       c : "e"
         *     }
         *   }
         * </pre>
         *   or
         * <pre>
         *   {
         *     target : {
         *       shellHash : "SO-36?jumper=postman"
         *     }
         *   }
         *  </pre>
         * @param {object} [oComponent] the root component of the application
         * @returns {Promise<string>} A Promise which resolves href for the specified parameters as an *external* shell hash;
         *   always starting with a hash character;
         *   all parameters and parameter names are URL-encoded (via encodeURIComponent) and the complete string is encoded via encodeURI (!).
         *   The generated string can not be used in the majority of interfaces which expect a internal shell hash.
         *
         * A proper way for an application to generate a link to return to the home page of the Fiori launchpad is:
         *   <code>hrefForExternalAsync( { target : { shellHash : "#" }})</code>
         *
         * Do *not* use "#Shell-home" to navigate to a specific homepage!
         *
         * Note: if object is undefined, the current shell hash is returned.
         *
         * Note that the application parameter length (including SemanticObject/Action) shall not exceed 512 bytes when serialized as UTF-8.
         *
         * The function can be used to convert an shell hash internal format commonly encountered into the URL format to use in link tags:
         * <pre>
         *   sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then( function (oService) {
         *     oService.hrefForExternalAsync({
         *         target: { shellHash: oLink.intent }
         *     }, that.oComponent).then( function (sExternalHref) {
         *          // do something with the resolved sExternalHref.
         *        });
         *   });
         * </pre>
         *
         * This API accepts a sap-xapp-state-data parameter that can be used generate a url that can be used to launch
         *   and application with certain data, for example:
         *
         * <pre>
         *   {
         *     target : { semanticObject : "AnObject", action: "action" },
         *     params : { "sap-xapp-state-data" : JSON.stringify({ a: "b", c: "d" }) }
         *   }
         * </pre>
         *
         * Using the arguments as in the example above, a link with a sap-xapp-state parameter that encodes the provided data is returned.
         * The sap-xapp-state-data parameter does not appear in the generated link.
         *
         * @since 1.94.0
         * @public
         * @alias sap.ushell.services.CrossApplicationNavigation#hrefForExternalAsync
         */
        this.hrefForExternalAsync = function (oArgs, oComponent) {
            // clone because _extractInnerAppRoute may change the original structure
            // (we don't want to create side effects on the original object).
            var oArgsClone = merge({}, oArgs);
            var oExtraction = this._extractInnerAppRoute(oArgsClone);

            var vIntentNoAppRoute = oExtraction.intent;

            return Promise.resolve()
                .then(function () {
                    return oUtils.addXAppStateFromParameterAsync(
                        vIntentNoAppRoute,
                        "sap-xapp-state-data" /* parameter containing data */
                    );
                })
                .then(function () {
                    oArgsClone = getTargetWithCurrentSystem(vIntentNoAppRoute, oComponent);
                    return oUtils.injectStickyParametersAsync({
                        args: oArgsClone,
                        appLifeCycle: oAppLifeCycle,
                        technicalParameters: TechnicalParameters,
                        type: oType
                    });
                })
                .then(function (oArgsCloneResult) {
                    oArgsClone = oArgsCloneResult;
                    oArgsClone = amendTargetWithSapUshellEncTestParameter(oArgsClone);
                    oArgsClone = this._injectInnerAppRoute(oArgsClone, oExtraction.innerAppRoute);

                    return sap.ushell.Container.getServiceAsync("ShellNavigation");
                }.bind(this))
                .then(function (ShellNavigation) {
                    return new Promise(function (resolve, reject) {
                        ShellNavigation.hrefForExternal(oArgsClone, undefined, oComponent, true)
                            .done(resolve)
                            .fail(reject);
                    });
                })
                .catch(function () {
                    Log.debug("Shell not available, no Cross App Navigation");
                    return "";
                });
        };

        /**
         * if sHashFragment is a compacted hash (sap-intent-param is present),
         * in a hash, this function replaces it into a long url with all parameters expanded
         *
         * @param {string} sHashFragment an (internal format) shell hash
         * @returns {jQuery.Promise} promise the success handler of the resolve promise get an expanded shell hash as first argument
         * @public
         * @alias sap.ushell.services.CrossApplicationNavigation#expandCompactHash
         */
        this.expandCompactHash = function (sHashFragment) {
            var oDeferred = new jQuery.Deferred();

            sap.ushell.Container.getServiceAsync("NavTargetResolution").then(function (NavTargetResolution) {
                NavTargetResolution.expandCompactHash(sHashFragment)
                    .done(oDeferred.resolve)
                    .fail(oDeferred.reject);
            });

            return oDeferred.promise();
        };

        /**
         * Attempts to use the browser history to navigate to the previous app.
         *
         * A navigation to the Fiori launchpad Home is performed when this method is called on a first navigation.
         * In all other cases, this function simply performs a browser back navigation.
         *
         * Please note that the behavior of this method is subject to change and therefore it may not yield to the expected results
         * especially on mobile devices where "back" is the previous inner-app state if these are put into the history!
         *
         * @returns {Promise<void>} A promise which resolves once the back navigation was triggered
         *
         * @public
         * @alias sap.ushell.services.CrossApplicationNavigation#backToPreviousApp
         */
        this.backToPreviousApp = function () {
            return this.isInitialNavigationAsync()
                .then(function (bIsInitial) {
                    if (bIsInitial) {
                        // go back home
                        return this.toExternal({ target: { shellHash: "#" }, writeHistory: false });
                    }

                    this.historyBack();
                    return undefined;
                }.bind(this));
        };

        /**
         * Navigates back in history the number of given steps if this is supported by the underlying platform.
         * If no argument is provided it will navigate back 1 step.
         *
         * @param {number} iSteps positive integer representing the steps to go back in the history
         * @public
         * @alias sap.ushell.services.CrossApplicationNavigation#historyBack
         */
        this.historyBack = function (iSteps) {
            var iActualStepsBack = -1;
            if (iSteps && typeof iSteps === "number") {
                if (iSteps <= 0) {
                    Log.warning(
                        "historyBack called with an argument <= 0 and will result in a forward navigation or refresh",
                        "expected was an argument > 0",
                        "sap.ushell.services.CrossApplicationNavigation#historyBack"
                    );
                }
                iActualStepsBack = iSteps * -1;
            }
            window.history.go(iActualStepsBack);
        };

        /**
         * Checks wether the FLP currently shows the initially loaded navigation target (i.e. the intent it was started with).
         * This method can be used to e.g. detect whether the current app was started directly, that is,
         * without a navigation from another app or FLP home.
         *
         * @returns {boolean} Whether the initial navigation occurred.
         * @public
         * @deprecated since 1.94. Please use {@link #isInitialNavigationAsync} instead.
         * @alias sap.ushell.services.CrossApplicationNavigation#isInitialNavigation
         * @since 1.36.0
         */
        this.isInitialNavigation = function () {
            Log.error("Deprecated API call of 'sap.ushell.CrossApplicationNavigation.isInitialNavigation'. Please use 'isInitialNavigationAsync' instead",
                null,
                "sap.ushell.services.CrossApplicationNavigation"
            );

            var oContainer = ObjectPath.get("sap.ushell.Container");
            var oShellNavigation = oContainer
                && typeof oContainer.getService === "function"
                && oContainer.getService("ShellNavigation");

            if (!oShellNavigation) {
                Log.debug(
                    "ShellNavigation service not available",
                    "This will be treated as the initial navigation",
                    "sap.ushell.services.CrossApplicationNavigation"
                );
                return true;
            }

            var bIsInitialNavigation = oShellNavigation.isInitialNavigation();

            /*
             * An undefined value indicates that the ShellNavigation service did not initialize the ShellNavigationHashChanger yet.
             * Hence this is the first navigation in case asked at this point in time.
             */
            if (typeof bIsInitialNavigation === "undefined") {
                return true;
            }

            return bIsInitialNavigation;
        };

        /**
         * Checks whether the FLP has performed the first navigation.
         * This method can be used to detect whether the current app was started directly, that is,
         * without a previous navigation to another app, to the FLP home, or another target that adds an entry in the browser history.
         *
         * @returns {Promise<boolean>} This promise resolves with a boolean indicating if the current navigation is considered initial
         * @public
         * @alias sap.ushell.services.CrossApplicationNavigation#isInitialNavigationAsync
         * @since 1.94.0
         */
        this.isInitialNavigationAsync = function () {
            return sap.ushell.Container.getServiceAsync("ShellNavigation")
                .then(function (ShellNavigation) {
                    var bIsInitialNavigation = ShellNavigation.isInitialNavigation();

                    /*
                    * An undefined value indicates that the ShellNavigation service did not initialize the ShellNavigationHashChanger yet.
                    * Hence this is the first navigation in case asked at this point in time.
                    */
                    if (typeof bIsInitialNavigation === "undefined") {
                        return true;
                    }

                    return bIsInitialNavigation;
                })
                .catch(function () {
                    Log.debug(
                        "ShellNavigation service not available",
                        "This will be treated as the initial navigation",
                        "sap.ushell.services.CrossApplicationNavigation"
                    );
                    return true;
                });
        };

        /**
         * Triggers a navigation to a specified target outside of the currently running application (e.g. different launchpad application).
         * Invocation will trigger a hash change and subsequent invocation of the target.
         *
         * If the navigation target opens in a new window the running application may be retained.
         *
         * @param {object} oArgs A configuration object describing the navigation target.
         * The navigation target can be provided as its separate aspects like semantic object, action, parameters etc. in separate members of
         * the configuration object.
         *
         * <b>Note:</b> Parameter values can contain special characters and must be provided unencoded; the function takes care for necessary encodings itself.
         *
         * Simple Example:
         * <pre>
         * {
         *   target: {
         *     semanticObject: "Customer",
         *     action: "display"
         *   },
         *   params: {
         *     customerId: "0815-4711"
         *   }
         * }
         * </pre>
         *
         * Example with text:
         * <pre>
         * {
         *   target: {
         *     semanticObject: "Note",
         *     action: "create"
         *   },
         *   params: {
         *     noteText: "Thanks for reading the documentation!"
         *   }
         * }
         * </pre>
         *
         * Example with a given context:
         * <pre>
         * {
         *   target: {
         *     semanticObject: "AnObject",
         *     action: "action",
         *     context: "AB7F3C"
         *   },
         *   params: {
         *     param1: "Value One"
         *   }
         * }
         * </pre>
         *
         * Alternatively a <code>shellHash</code> can be provided that includes already all aspects of the navigation target:
         * semantic object, action, intent parameters, app-specific route (including app parameters)
         *
         * <b>Note:</b> While parameters need to be url-encoded once when used in the <code>shellHash</code> the app specific route must not be encoded.
         *
         * Example with shellHash as target:
         * <pre>
         * {
         *   target: {
         *     shellHash: "Note-update?noteText=You%20got%20quite%20far&/Notes/My First Note"
         *   }
         * }
         * </pre>
         *
         * To navigate to the homepage of the Fiori launchpad, navigate to <code>{target: {shellHash: "#"}}</code>. Do not use
         * "#Shell-home" or "Shell-home" to navigate to!
         *
         * To provide a complex parameter structure to a target app the pseudo parameter <code>sap-xapp-state-data</code> can be used.
         *
         * Example:
         * <pre>
         * {
         *   ...
         *   params : {
         *     "sap-xapp-state-data": JSON.stringify({ a: "b", c: "d" })
         *   }
         * }
         * </pre>
         *
         * The data specified via <code>sap-xapp-state-data</code> is passed to the target application in the <code>sap-xapp-state</code> parameter.
         * The <code>sap-xapp-state-data</code> parameter itself is not passed to the target application.
         *
         * <b>Note:</b> The parameter length (including semantic object and action) shall not exceed 512 bytes when serialized as UTF-8.
         *
         * @param {object} [oComponent] an optional UI5 component, used to logically attach a possibly generated app state.
         *
         * @returns {Promise<void>} A <code>Promise</code> which resolves once the navigation was triggered. The <code>Promise</code> might never reject or resolve
         * when an error occurs during the navigation.
         *
         * @since 1.15.0
         * @public
         * @alias sap.ushell.services.CrossApplicationNavigation#toExternal
         */
        this.toExternal = function (oArgs, oComponent) {
            var bWriteHistory = oArgs.writeHistory;
            // clone because _extractInnerAppRoute may change the original structure
            // (we don't want to create side effects on the original object).
            var oArgsClone = merge({}, oArgs);
            // clone again because _extractInnerAppRoute may change the original structure
            var oNavTarget = merge({}, oArgsClone);
            this._processShellHashWithParams(oArgsClone);
            var oExtraction = this._extractInnerAppRoute(oArgsClone);

            var vIntentNoAppRoute = oExtraction.intent;
            var oShellNavigationService;
            var oCurrentApplication;

            return Promise.all([
                sap.ushell.Container.getServiceAsync("AppLifeCycle"),
                sap.ushell.Container.getServiceAsync("ShellNavigation")
            ])
                .then(function (aServices) {
                    var oAppLifeCycleService = aServices[0];
                    oShellNavigationService = aServices[1];
                    oCurrentApplication = oAppLifeCycleService.getCurrentApplication();
                    return oCurrentApplication && oCurrentApplication.getIntent();
                })
                .then(function (oIntent) {
                    this._checkIfAppNeedsToBeReloaded(oNavTarget, oCurrentApplication, oIntent, oShellNavigationService.hashChanger);
                    return oUtils.addXAppStateFromParameterAsync(
                        vIntentNoAppRoute,
                        "sap-xapp-state-data" /* parameter containing data */
                    );
                }.bind(this))
                .then(function () {
                    oArgsClone = getTargetWithCurrentSystem(vIntentNoAppRoute, oComponent);
                    return oUtils.injectStickyParametersAsync({
                        args: oArgsClone,
                        appLifeCycle: oAppLifeCycle,
                        technicalParameters: TechnicalParameters,
                        type: oType
                    });
                })
                .then(function (oArgsCloneResult) {
                    oArgsClone = oArgsCloneResult;
                    oArgsClone = amendTargetWithSapUshellEncTestParameter(oArgsClone);

                    delete oArgsClone.writeHistory;

                    oArgsClone = this._injectInnerAppRoute(oArgsClone, oExtraction.innerAppRoute);

                    return oShellNavigationService.toExternal(oArgsClone, oComponent, bWriteHistory);
                }.bind(this))
                .catch(function (oError) {
                    Log.error("CrossAppNavigation.toExternal failed", oError, "sap.ushell.services.CrossApplicationNavigation");
                });
        };

        /**
         * Check if an external navigation without an inner-app route is triggered to the currently running app.
         * This should cause the app to reload.
         *
         * @param {object} navTarget A configuration object describing the navigation target.
         * @param {object|undefined} currentApplication The application that is currently active.
         * @param {object|undefined} currentApplicationIntent The intent of the currently active application.
         * @param {sap.ushell.services.ShellNavigationHashChanger} shellNavigationHashChanger The shell navigation hash changer.
         *
         * @since 1.106
         * @private
         * @alias sap.ushell.services.CrossApplicationNavigation#_checkIfAppNeedsToBeReloaded
         */
        this._checkIfAppNeedsToBeReloaded = function (navTarget, currentApplication, currentApplicationIntent, shellNavigationHashChanger) {
            if (!currentApplication || !currentApplicationIntent || !navTarget || !navTarget.target) {
                return; // current application intent needs to be known and there needs to be a target
            }

            if (navTarget.target.shellHash) {
                // convert shell hash in to semantic object and action form
                var oHash = UrlParsing.parseShellHash(navTarget.target.shellHash) || {};

                navTarget.target = {
                    semanticObject: oHash.semanticObject,
                    action: oHash.action,
                    contextRaw: oHash.contextRaw
                };
                navTarget.appSpecificRoute = oHash.appSpecificRoute;
                navTarget.params = Object.assign({}, navTarget.params, oHash.params);
            }

            if (navTarget.appSpecificRoute) {
                return; // appSpecificRoute must be empty
            }

            if (currentApplication.applicationType !== "UI5") {
                return; // must be a fiori application
            }

            if (navTarget.target.semanticObject !== currentApplicationIntent.semanticObject) {
                return; // semanticObject must match
            }

            if (navTarget.target.action !== currentApplicationIntent.action) {
                return; // action must match
            }

            // Navigation parameter may not be inside an array and might not be strings
            // So they have to be adjusted in order to be matched against the current parameters
            var oTargetParameters = {};
            if (navTarget.params) {
                Object.keys(navTarget.params).forEach(function (sKey) {
                    var vValue = navTarget.params[sKey];
                    var aValue = Array.isArray(vValue) ? vValue : [vValue];
                    oTargetParameters[sKey] = aValue.map(function (vInnerValue) {
                        return vInnerValue.toString();
                    });
                });
            }

            if (!shellNavigationHashChanger.haveSameIntentParameters(oTargetParameters, currentApplicationIntent.params)) {
                return; // intent parameters must match
            }

            shellNavigationHashChanger.setReloadApplication(true);
        };

        /**
         * Returns a string which can be put into the DOM (e.g. in a link tag) given an application specific hash suffix
         *
         * Example:
         * <code>hrefForAppSpecificHash("View1/details/0/")</code>
         * returns
         * <code>#SemanticObject-action&/View1/details/0/</code>
         * if the current application runs in the shell and was started using "SemanticObject-action" as shell navigation hash
         *
         * @param {string} sAppHash the app specific router, obtained e.g. via router.getURL(...).
         *   Note that sAppHash shall not exceed 512 bytes when serialized as UTF-8.
         * @returns {string} A string which can be put into the link tag, containing the current shell navigation target
         *   and the specified application specific hash suffix
         * @since 1.15.0
         * @public
         * @deprecated since 1.94. Please use {@link #hrefForAppSpecificHashAsync} instead.
         * @alias sap.ushell.services.CrossApplicationNavigation#hrefForAppSpecificHash
         */
        this.hrefForAppSpecificHash = function (sAppHash) {
            Log.error("Deprecated API call of 'sap.ushell.CrossApplicationNavigation.hrefForAppSpecificHash'. Please use 'hrefForAppSpecificHashAsync' instead",
                null,
                "sap.ushell.services.CrossApplicationNavigation"
            );

            var oContainer = ObjectPath.get("sap.ushell.Container");
            if (oContainer && typeof oContainer.getService === "function") {
                var oShellNavigation = oContainer.getService("ShellNavigation");
                if (oShellNavigation) {
                    return oShellNavigation.hrefForAppSpecificHash(sAppHash);
                }
            }
            Log.debug("Shell not available, no Cross App Navigation; fallback to app-specific part only");
            // Note: this encoding is to be kept aligned with the encoding in hasher.js ( see _encodePath( ) )
            return "#" + encodeURI(sAppHash);
        };

        /**
         * Returns a Promise which resolves a string that can be put into the DOM (e.g. in a link tag) given an application specific hash suffix
         *
         * Example:
         * <code>hrefForAppSpecificHashAsync("View1/details/0/")</code>
         * returns a Promise that resolves:
         * <code>#SemanticObject-action&/View1/details/0/</code>
         * if the current application runs in the shell and was started using "SemanticObject-action" as shell navigation hash
         *
         * @param {string} sAppHash the app specific router, obtained e.g. via router.getURL(...).
         *   Note that sAppHash shall not exceed 512 bytes when serialized as UTF-8.
         * @returns {Promise<string>} A promise which resolves a string which can be put into the link tag, containing the current
         *   shell navigation target and the specified application specific hash suffix
         * @since 1.94.0
         * @public
         * @alias sap.ushell.services.CrossApplicationNavigation#hrefForAppSpecificHashAsync
         */
        this.hrefForAppSpecificHashAsync = function (sAppHash) {
            return sap.ushell.Container.getServiceAsync("ShellNavigation")
                .then(function (ShellNavigation) {
                    return ShellNavigation.hrefForAppSpecificHash(sAppHash);
                })
                .catch(function () {
                    Log.debug("Shell not available, no Cross App Navigation; fallback to app-specific part only");
                    // Note: this encoding is to be kept aligned with the encoding in hasher.js ( see _encodePath( ) )
                    return "#" + encodeURI(sAppHash);
                });
        };

        /**
         * For a given semantic object, this method considers all actions associated with the semantic object and
         * returns the one tagged as a "primaryAction".
         * If no inbound tagged as "primaryAction" exists, then the intent of the first inbound
         * (after sorting has been applied) matching the action "displayFactSheet".
         *
         * The primary intent is determined by querying {@link sap.ushell.services.CrossApplicationNavigation#getLinks}
         * with the given semantic object and optional parameter.
         * Then the resulting list is filtered to the outcome that a single item remains.
         *
         * @param {string} sSemanticObject Semantic object.
         * @param {object} [mParameters] @see sap.ushell.services.CrossApplicationNavigation#getSemanticObjectLinks for description.
         * @returns {jQuery.Deferred} When a relevant link object exists,
         *   it will return a promise that resolves to an object of the following form:
         *   <pre>
         *   {
         *     intent: "#AnObject-Action?A=B&C=e&C=j",
         *     text: "Perform action",
         *     icon: "sap-icon://Fiori2/F0018", // optional
         *     shortTitle: "Perform"            // optional
         *     tags: ["tag-1", "tag-2"]         // optional
         *   }
         *   </pre>
         *   Otherwise, the returned promise will resolve to null when no relevant link object exists.
         * @public
         * @since 1.48
         * @alias sap.ushell.services.CrossApplicationNavigation#getPrimaryIntent
         */
        this.getPrimaryIntent = function (sSemanticObject, mParameters) {
            var oQuery = {};
            var fnSortPredicate;
            var rgxDisplayFactSheetAction = /^#\w+-displayFactSheet(?:$|\?.)/;

            oQuery.tags = ["primaryAction"];
            oQuery.semanticObject = sSemanticObject;
            if (mParameters) {
                oQuery.params = mParameters;
            }

            return this.getLinks(oQuery)
                .then(function (aLinks) {
                    if (aLinks.length === 0) {
                        delete oQuery.tags;
                        oQuery.action = "displayFactSheet";

                        // Priority given to intents with the action "displayFactSheet"
                        fnSortPredicate = function (oLink, oOtherLink) {
                            var bEitherIsFactSheetAction;

                            if (oLink.intent === oOtherLink.intent) {
                                return 0;
                            }

                            bEitherIsFactSheetAction = rgxDisplayFactSheetAction.test(oLink.intent)
                                ^ rgxDisplayFactSheetAction.test(oOtherLink.intent);

                            if (bEitherIsFactSheetAction) {
                                return rgxDisplayFactSheetAction.test(oLink.intent) ? -1 : 1;
                            }

                            return oLink.intent < oOtherLink.intent ? -1 : 1;
                        };

                        return this.getLinks(oQuery);
                    }

                    // simple left-right-lexicographic order, based on intent
                    fnSortPredicate = function (oLink, oOtherLink) {
                        if (oLink.intent === oOtherLink.intent) {
                            return 0;
                        }

                        return oLink.intent < oOtherLink.intent ? -1 : 1;
                    };

                    return aLinks;
                }.bind(this))
                .then(function (aLinks) {
                    return aLinks.length === 0 ? null : aLinks.sort(fnSortPredicate)[0];
                });
        };

        /**
         * Resolves a given semantic object and business parameters to a list of links,
         * taking into account the form factor of the current device.
         *
         * @param {string} sSemanticObject the semantic object such as <code>"AnObject"</code>
         * @param {object} [mParameters] the map of business parameters with values, for instance
         * <pre>
         *   {
         *     A: "B",
         *     c: "e"
         *   }
         * </pre>
         * @param {boolean} [bIgnoreFormFactor=false] when set to <code>true</code> the form factor of the current device is ignored
         * @param {object} [oComponent] SAP UI5 Component invoking the service
         * @param {string} [sAppStateKey] application state key to add to the generated links, SAP internal usage only
         * @param {boolean} [bCompactIntents] whether the returned intents should be returned in compact format. Defaults to false.
         * @returns {jQuery.Promise} A <code>jQuery.Deferred</code> object's promise which is resolved with
         *   an array of link objects containing (at least) the following properties:
         * <pre>
         *   {
         *     intent: "#AnObject-action?A=B&C=e",
         *     text: "Perform action",
         *     icon: "sap-icon://Fiori2/F0018", //optional
         *     subTitle: "Action", //optional
         *     shortTitle: "Perform" //optional
         *   }
         * </pre>
         *
         * <b>NOTE:</b> the intents returned are in <b>internal</b> format and cannot be directly put into a link tag.
         * <p>
         * Example: Let the string <code>"C&A != H&M"</code> be a parameter value.
         * Intent will be encoded as<code>#AnObject-action?text=C%26A%20!%3D%20H%26M<code>.
         * Note that the intent is in <b>internal</b> format, before putting it into a link tag, you must invoke:
         * <pre>
         *   externalHash = oCrossApplicationNavigationService.hrefForExternal({ target : { shellHash :  oLink.intent} }, that.oComponent);
         * </pre>
         * </p>
         *
         * @deprecated since 1.38. Please use {@link #getLinks} instead.
         * @since 1.19.0
         * @public
         * @alias sap.ushell.services.CrossApplicationNavigation#getSemanticObjectLinks
         */
        this.getSemanticObjectLinks = function (sSemanticObject, mParameters, bIgnoreFormFactor, oComponent, sAppStateKey, bCompactIntents) {
            var oDeferred = new jQuery.Deferred();

            Promise.resolve()
                .then(function () {
                    return oUtils.injectStickyParametersAsync({
                        args: { params: mParameters },
                        appLifeCycle: oAppLifeCycle,
                        technicalParameters: TechnicalParameters,
                        type: oType
                    });
                })
                .then(function (mParametersPlusSapSystem) {
                    mParametersPlusSapSystem = getTargetWithCurrentSystem(mParametersPlusSapSystem, oComponent).params;
                    mParametersPlusSapSystem = amendTargetWithSapUshellEncTestParameter({ params: mParametersPlusSapSystem }).params;

                    // deal with multi-arg calls
                    var vArgs;
                    if (Array.isArray(sSemanticObject)) {
                        vArgs = [];
                        sSemanticObject.forEach(function (aArgs) {
                            vArgs.push([{
                                semanticObject: aArgs[0],
                                params: aArgs[1],
                                ignoreFormFactor: !!aArgs[2],
                                ui5Component: aArgs[3],
                                appStateKey: aArgs[4],
                                compactIntents: !!(aArgs[5])
                            }]);
                        });
                    } else {
                        vArgs = {
                            // note: no action keeps backward compatible behavior
                            semanticObject: sSemanticObject,
                            params: mParametersPlusSapSystem,
                            ignoreFormFactor: bIgnoreFormFactor,
                            ui5Component: oComponent,
                            appStateKey: sAppStateKey,
                            compactIntents: !!bCompactIntents
                        };
                    }

                    return Promise.all([
                        sap.ushell.Container.getServiceAsync("NavTargetResolution"),
                        vArgs
                    ]);
                })
                .then(function (aResults) {
                    var NavTargetResolution = aResults[0];
                    var vArgs = aResults[1];
                    utils.invokeUnfoldingArrayArguments(NavTargetResolution.getLinks.bind(NavTargetResolution), [vArgs])
                        .done(oDeferred.resolve)
                        .fail(oDeferred.reject);
                });

            return oDeferred.promise();
        };

        /**
         * Resolves the given semantic object (and action) and business parameters to a list of links available to the user.
         *
         * @param {object|object[]} [vArgs] An object containing nominal arguments for the method, having the following structure:
         *   <pre>
         *   {
         *      semanticObject: "Object", // optional, matches any semantic objects if undefined
         *      action: "action",         // optional, matches any actions if undefined
         *      params: {                 // optional business parameters
         *         A: "B",
         *         C: ["e", "j"]
         *      },
         *      withAtLeastOneUsedParam: true, // optional, defaults to false.
         *                                     // If true, returns only the links that use at least one (non sap-) parameter from 'params'.
         *
         *      sortResultsBy: "intent", // optional parameter that decides on how the returned results will be sorted.
         *                               // Possible values are:
         *                               //   - "intent" (default) lexicographical sort on returned 'intent' field
         *                               //   - "text" lexicographical sort on returned 'text' field
         *                               //   - "priority" experimental - top intents are returned first
         *
         *      treatTechHintAsFilter : true, // optional, defaults to false
         *                                    // if true, only apps that match
         *                                    // exactly the supplied technology
         *                                    // (e.g. sap-ui-tech-hint=WDA) will be considered
         *
         *      ui5Component: UI5Component, // mandatory, the UI5 component invoking the service, shall be a root component!
         *
         *      appStateKey: "abc123...",   // optional, application state key to add to the generated links, SAP internal usage only
         *
         *      compactIntents: true        // optional, whether intents should be returned in compact format.
         *                                  // Defaults to false.
         *
         *      ignoreFormFactor: true,     // optional, defaults to false, deprecated, do not use, may have no effect in the future
         *
         *      tags: ["tag-1", "tag-2"]    // optional, if specified, only returns links that match inbound with certain tags.
         *   }
         *   </pre>
         *
         *   Starting from UI5 version 1.52.0 the <code>params</code> argument can be specified in the extended format:
         *
         *   <pre>
         *   ...
         *   params: {
         *      P1: { value: "v1" },
         *      P2: { value: ["v2", "v3"] }
         *   }
         *   </pre>
         *
         *   When the parameter is expressed in this format, the caller can specify additional search options.
         *
         *   Besides 'value', supported search options for the extended format are:
         *   <ul>
         *     <li>
         *     <b>required</b>: whether the parameter must be required (true) or not required (false) in the signature of the matching target
         *     (once the navigation occurs to the returned link). Please note that this option will be effective if the Fiori Launchpad is
         *     configured to resolve navigation targets via <code>sap.ushell.services.ClientSideTargetResolution</code>
         *     and therefore may not be supported in all platforms.<br />
         *
         *     Example:
         *       <pre>
         *         ...
         *         params: {
         *           P1: { value: "v1", required: true },
         *           P2: { value: ["v2", "v3"] }
         *         }
         *         ...
         *       </pre>
         *     </li>
         *   </ul>
         *
         *   <p>This method supports a mass invocation interface to obtain multiple results with a single call, as shown in the following example:
         *
         *   <pre>
         *     oCrossApplicationService.getLinks([ // array, because multiple invocations are to be made
         *        [                           // arguments for the first invocation
         *          { semanticObject: "SO" }  // this method supports one parameter only in each call
         *        ],
         *        [                           // arguments for the second invocation
         *          { action: "someAction" }
         *        ]
         *        // ... and so on
         *     ]).done(…);
         *   </pre>
         *
         *   <p>Calling this method with no arguments will produce the same result as if the method was called with an empty object.</p>
         * @returns {jQuery.Deferred.promise} A promise that resolves with an array of link objects containing (at least)
         *   the following properties:
         *  <pre>
         *   {
         *     intent: "#AnObject-Action?A=B&C=e&C=j",
         *     text: "Perform action",
         *     icon: "sap-icon://Fiori2/F0018", // optional
         *     subTitle: "Action", //optional
         *     shortTitle: "Perform"            // optional
         *     tags: ["tag-1", "tag-2"]         // optional
         *   }
         *  </pre>
         *
         *   <p>
         *   Properties marked as 'optional' in the example above may not be present in the returned result.
         *
         *   <p>
         *   <b>NOTE:</b> the intents returned are in <b>internal</b> format and cannot be directly put into a link tag.
         *   <p>
         *   Example: Let the string <code>"C&A != H&M"</code> be a parameter value.
         *
         *   Intent will be encoded as<code>#AnObject-action?text=C%26A%20!%3D%20H%26M<code>.
         *   Note that the intent is in <b>internal</b> format, before putting it into a link tag, you must invoke:
         * <pre>
         *   externalHash = oCrossApplicationNavigationService.hrefForExternal({ target : { shellHash :  oLink.intent} }, that.oComponent);
         * </pre>
         *   </p>
         *   <p>
         *   NOTE: in case the mass invocation interface is used (see <code>vArgs</code> parameter explanation above),
         *   the promise will resolve to an array of arrays of arrays.
         *   For example, if the mass interface specified two arguments, the promise would resolve as follows:
         *     <pre>
         *     [     // mass interface was used, so return multiple values
         *       [  // values returned from the first call (functions may return multiple values)
         *          // value returned from first getLinks call (as returned by single getLinks call)
         *          [
         *            {intent: "#SO-something1", text: "Perform navigation"},
         *            {intent: "#SO-something2", text: "Perform action"} ],
         *          ]
         *       ],
         *       [
         *          // value returned from second getLinks call (as returned by single getLinks call)
         *          [
         *            {intent: "#Object-someAction", text: "Some action1"}
         *          ]
         *       ]
         *       // ... and so on
         *     ]
         *     </pre>
         * @public
         * @alias sap.ushell.services.CrossApplicationNavigation#getLinks
         * @since 1.38.0
         */
        this.getLinks = function (vArgs) {
            var aExpandedIntents;

            /*
             * the invokeUnfoldingArrayArguments does not want [oArg1, oArg2, oArg3], but [ [oArg1], [oArg2], [oArg3] ], because the
             * logic in that method is based on positional parameters - however we have only one argument (the oArg object in this case).
             */
            aExpandedIntents = utils.invokeUnfoldingArrayArguments(this._getLinks.bind(this), [vArgs]);

            return aExpandedIntents;
        };

        this._getLinks = function (oNominalArgs) {
            var oDeferred = new jQuery.Deferred();

            // If method gets called without vArgs, the result should be the same as if vArgs was an empty object.
            if (typeof oNominalArgs === "undefined") {
                oNominalArgs = {};
            }

            // ensure certain parameters are specified
            var oNominalArgsClone = deepExtend({}, oNominalArgs);
            oNominalArgsClone.compactIntents = !!oNominalArgsClone.compactIntents;
            oNominalArgsClone.action = oNominalArgsClone.action || undefined;
            oNominalArgsClone.paramsOptions = oUtils.extractGetLinksParameterOptions(oNominalArgsClone.params);

            Promise.resolve()
                .then(function () {
                    return oUtils.injectStickyParametersAsync({
                        args: oNominalArgsClone,
                        appLifeCycle: oAppLifeCycle,
                        technicalParameters: TechnicalParameters,
                        type: oType
                    });
                })
                .then(function (oNominalArgsCloneResult) {
                    oNominalArgsClone = oNominalArgsCloneResult;
                    var mParameterDefinition;
                    if (oNominalArgsClone.params) {
                        mParameterDefinition = oUtils.extractGetLinksParameterDefinition(oNominalArgsClone.params);
                    } else {
                        mParameterDefinition = oNominalArgsClone.params;
                    }

                    // propagate sap-system into parameters
                    var mParametersPlusSapSystem = getTargetWithCurrentSystem(
                        { params: mParameterDefinition }, oNominalArgsClone.ui5Component
                    ).params;

                    mParametersPlusSapSystem = amendTargetWithSapUshellEncTestParameter({
                        params: mParametersPlusSapSystem
                    }).params;
                    if (oNominalArgsClone.appStateKey) {
                        mParametersPlusSapSystem["sap-xapp-state"] = [oNominalArgsClone.appStateKey];
                        delete oNominalArgsClone.appStateKey;
                    }

                    oNominalArgsClone.params = mParametersPlusSapSystem;

                    return sap.ushell.Container.getServiceAsync("NavTargetResolution");
                })
                .then(function (NavTargetResolution) {
                    NavTargetResolution.getLinks(oNominalArgsClone)
                        .done(oDeferred.resolve)
                        .fail(oDeferred.reject);
                });

            return oDeferred.promise();
        };

        /**
         * Returns a list of semantic objects of the intents the current user can navigate to.
         *
         * @returns {jQuery.Deferred.promise} A promise that resolves with an array of strings representing the semantic objects
         *   of the intents the current user can navigate to, or rejects with an error message.
         *   The returned array will not contain duplicates.
         *   <p>NOTE: the caller should not rely on the specific order the semantic objects appear in the returned array.</p>
         * @public
         * @alias sap.ushell.services.CrossApplicationNavigation#getDistinctSemanticObjects
         * @since 1.38.0
         */
        this.getDistinctSemanticObjects = function () {
            var oDeferred = new jQuery.Deferred();

            sap.ushell.Container.getServiceAsync("NavTargetResolution").then(function (NavTargetResolution) {
                NavTargetResolution.getDistinctSemanticObjects()
                    .done(oDeferred.resolve)
                    .fail(oDeferred.reject);
            });

            return oDeferred.promise();
        };

        /**
         * Tells whether the given intent(s) are supported, taking into account the form factor of the current device.
         * "Supported" means that navigation to the intent is possible.
         * Note that the intents are assumed to be in internal format  and expanded.
         *
         * @param {string[]} aIntents the intents (such as <code>["#AnObject-action?A=B&c=e"]</code>) to be checked
         * @param {object} [oComponent] the root component of the application
         * @returns {jQuery.Promise} A <code>jQuery.Deferred</code> object's promise which is resolved with a map containing
         *   the intents from <code>aIntents</code> as keys.
         *   The map values are objects with a property <code>supported</code> of type <code>boolean</code>.<br/>
         *   Example:
         *     <pre>
         *     {
         *       "#AnObject-action?A=B&c=e": { supported: false },
         *       "#AnotherObject-action2": { supported: true }
         *     }
         *     </pre>
         *
         * Example usage:
         * <pre>
         *   this.oCrossAppNav.isIntentSupported(["SalesOrder-approve?SOId=1234"])
         *   .done(function(aResponses) {
         *     if (oResponse["SalesOrder-approve?SOId=1234"].supported===true){
         *       // enable link
         *     }
         *     else {
         *       // disable link
         *     }
         *   })
         *   .fail(function() {
         *     // disable link
         *     // request failed or other error
         *   });
         * </pre>
         * @deprecated since 1.31. Please use {@link #isNavigationSupported} instead. Note that this has a slightly different response format.
         * @since 1.19.1
         * @public
         * @alias sap.ushell.services.CrossApplicationNavigation#isIntentSupported
         */
        this.isIntentSupported = function (aIntents, oComponent) {
            var oDeferred = new jQuery.Deferred();
            var mOriginalIntentHash = {}; // used for remapping
            var aClonedIntentsWithSapSystem = aIntents.map(function (sIntent) {
                var sIntentWithSystem = getTargetWithCurrentSystem(sIntent, oComponent); // returns clone
                mOriginalIntentHash[sIntentWithSystem] = sIntent;
                return sIntentWithSystem;
            });

            sap.ushell.Container.getServiceAsync("NavTargetResolution").then(function (NavTargetResolution) {
                NavTargetResolution.isIntentSupported(aClonedIntentsWithSapSystem)
                    .done(function (mIntentSupportedPlusSapSystem) {
                        // Must restore keys to what the application expects, as per NavTargetResolution contract.
                        var mIntentSupportedNoSapSystem = {};
                        Object.keys(mIntentSupportedPlusSapSystem).forEach(function (sKeyPlusSapSystem) {
                            mIntentSupportedNoSapSystem[
                                mOriginalIntentHash[sKeyPlusSapSystem]
                            ] = mIntentSupportedPlusSapSystem[sKeyPlusSapSystem];
                        });
                        oDeferred.resolve(mIntentSupportedNoSapSystem);
                    })
                    .fail(oDeferred.reject.bind(oDeferred));
            });

            return oDeferred.promise();
        };

        /**
         * Tells whether the given navigation intents are supported for the given parameters, form factor etc. .
         * "Supported" means that a valid navigation target is configured for the user and for the given device.
         *
         * <code>isNavigationSupported</code> is effectively a test function for
         * {@link sap.ushell.services.CrossApplicationNavigation#toExternal} and
         * {@link sap.ushell.services.CrossApplicationNavigation#hrefForExternal}.
         *
         * It is functionally equivalent to {@link sap.ushell.services.CrossApplicationNavigation#isIntentSupported}
         * but accepts the same interface as {@link sap.ushell.services.CrossApplicationNavigation#toExternal}
         * and {@link sap.ushell.services.CrossApplicationNavigation#hrefForExternal}.
         *
         * @param {object[]} aIntents The intents to be checked, with <code>object[]</code> being instances of the
         * <code>oArgs</code> argument of the <code>toExternal</code> or <code>hrefForExternal</code> methods, e.g.
         * <pre>
         *   {
         *     target: {
         *       semanticObject: "AnObject",
         *       action: "action"
         *     },
         *     params: { A: "B" }
         *   }
         * </pre>
         *   or
         *   e.g.
         * <pre>
         *   {
         *     target: {
         *       semanticObject: "AnObject",
         *       action: "action"
         *     },
         *     params: {
         *       A: "B",
         *       c: "e"
         *     }
         *   }
         * </pre>
         *   or
         * <pre>
         *   {
         *     target: {
         *        shellHash: "SalesOrder-approve?SOId=1234"
         *     }
         *   }
         * </pre>
         * @param {object} [oComponent] The root component of the application
         * @returns {jQuery.Promise} Promise of a <code>jQuery.Deferred</code> object that resolves to an array
         *   of objects indicating whether the intent is supported or not. Each object has a property
         *   <code>supported</code> of type <code>boolean</code>.
         *
         *   Example:
         *
         * <code>aIntents</code>:
         *   <pre>
         *   [
         *     {
         *       target : {
         *         semanticObject : "AnObject",
         *         action: "action"
         *       },
         *       params : { P1 : "B", P2 : [ "V2a", "V2b"]  }
         *     },
         *     {
         *       target : {
         *         semanticObject : "SalesOrder",
         *         action: "display"
         *       },
         *       params : { P3 : "B", SalesOrderIds : [ "4711", "472"] }
         *     }
         *   ]
         *   </pre>
         *
         * <code>response</code>:
         *   <pre>
         *   [
         *     { supported: false },
         *     { supported: true }
         *   ]
         *   </pre>
         *
         * Example usage:
         * <pre>
         *   this.oCrossAppNav.isNavigationSupported([
         *     target: { shellHash: "SalesOrder-approve?SOId=1234" }
         *   ])
         *   .done(function(aResponses) {
         *     if (oResponse[0].supported===true){
         *       // enable link
         *     }
         *     else {
         *       // disable link
         *     }
         *   })
         *   .fail(function() {
         *     // disable link
         *     // request failed or other fatal error
         *   });
         * </pre>
         *
         * @since 1.32
         * @public
         * @alias sap.ushell.services.CrossApplicationNavigation#isNavigationSupported
         */
        this.isNavigationSupported = function (aIntents, oComponent) {
            var oDeferred = new jQuery.Deferred();
            var aClonedIntents = deepClone(aIntents)
                .map(function (oIntent) {
                    var oExtraction = this._extractInnerAppRoute(oIntent);
                    return getTargetWithCurrentSystem(oExtraction.intent, oComponent); // returns only shallow clone
                }.bind(this));

            sap.ushell.Container.getServiceAsync("NavTargetResolution").then(function (NavTargetResolution) {
                NavTargetResolution.isNavigationSupported(aClonedIntents)
                    .done(oDeferred.resolve)
                    .fail(oDeferred.reject);
            });

            return oDeferred.promise();
        };

        /**
         * Tells whether the given URL is supported for the current User.
         *
         * A URL is either supported if it is an intent and a target for the user exists or
         * if it not recognized as a Fiori intent of the same launchpad:
         * Examples for URLs qualified as "supported", e.g.:
         *   * a non-fiori url, e.g. <code>www.sap.com</code> <code>http://mycorp.com/sap/its/webgui</code>
         *   * a hash not recognized as an intent  <code>#someotherhash</code>
         *   * a Fiori URL pointing to a different launchpad
         *
         * <pre>
         * "https://www.sap.com" -> true, not rejected
         * "#NotAFioriHash" -> true, not rejected
         * "#PurchaseOrder-approve?POId=1899" -> true (if application is assigned to user)
         * "#SystemSettings-change?par=critical_par" -> false (assuming application is not assigned to user)
         * "https://some.other.system/Fiori#PurchaseOrder-approve?POId=1899" -> true, not rejected
         * </pre>
         *
         * Note that this only disqualifies intents for the same Launchpad.
         * It does not validate whether a URL is valid in general.
         *
         * @param {string} sUrl URL to test
         * @returns {jQuery.Promise} A <code>jQuery.Deferred</code> object's promise which is resolved if the URL
         *   is supported and rejected if not. The promise does not return parameters.
         * @since 1.30.0
         * @private
         */
        this.isUrlSupported = function (sUrl) {
            var oDeferred = new jQuery.Deferred();

            if (typeof sUrl !== "string") {
                oDeferred.reject();
                return oDeferred.promise();
            }

            if (UrlParsing.isIntentUrl(sUrl)) {
                var sHash = UrlParsing.getHash(sUrl);
                this.isIntentSupported(["#" + sHash])
                    .done(function (oResult) {
                        if (oResult["#" + sHash] && oResult["#" + sHash].supported) {
                            oDeferred.resolve();
                        } else {
                            oDeferred.reject();
                        }
                    })
                    .fail(function () {
                        oDeferred.reject();
                    });
            } else {
                oDeferred.resolve();
            }
            return oDeferred.promise();
        };

        /**
         * Resolves a given navigation intent (if valid) and returns the respective component instance for further processing.
         *
         * This method should be accessed by the Unified Inbox only.
         *
         * @param {string} sIntent Semantic object and action as a string with a "#" as prefix
         * @param {object} [oConfig] Configuration used to instantiate the component, when given it is expected that the only
         *   property contained in this object is `componentData`.
         *   When the `componentData` is not relevant, then this method should be called with an empty object or null otherwise it throws.
         *   Note that the `componentData` member is cloned for use by this method, and the following properties are unconditionally set by
         *   this method and should not be passed in `componentData`:
         *     -- componentData.startupParameters, componentData.config, componentData["sap-xapp-state"].
         * @param {object} [oOwnerComponent] If specified, the created component will be called within the context of the oOwnerComponent
         *   (via oOwnerComponent.runAsOwner(fn))
         * @returns {jQuery.Promise} promise (component instance)
         * @since 1.32.0
         * @private
         */
        this.createComponentInstance = function (sIntent, oConfig, oOwnerComponent) {
            var oDeferred = new jQuery.Deferred();
            var oContainer = sap.ushell.Container;
            var oModifiedComponentData;

            this.createComponentData(sIntent, oConfig).then(
                function (oComponentData) {
                    oContainer.getServiceAsync("Ui5ComponentLoader")
                        .then(function (ui5ComponentLoader) {
                            return ui5ComponentLoader.modifyComponentProperties(oComponentData, UI5ComponentType.Application)
                                .then(function (oData) {
                                    oModifiedComponentData = oData;
                                    return ui5ComponentLoader;
                                });
                        })
                        .then(function (ui5ComponentLoader) {
                            if (oOwnerComponent) {
                                oOwnerComponent.runAsOwner(function () {
                                    createComponent(oModifiedComponentData);
                                });
                            } else {
                                createComponent(oModifiedComponentData);
                            }
                            function createComponent (oAppProperties) {
                                oAppProperties.loadDefaultDependencies = false;
                                ui5ComponentLoader.instantiateComponent(oAppProperties).then(
                                    function (oAppPropertiesWithComponentHandle) {
                                        oDeferred.resolve(
                                            oAppPropertiesWithComponentHandle.componentHandle
                                                .getInstance()
                                        );
                                    },
                                    function (oError) {
                                        oError = oError || "";
                                        Log.error(
                                            "Cannot create UI5 component: " + oError,
                                            oError.stack,
                                            "sap.ushell.services.CrossApplicationNavigation"
                                        );
                                        oDeferred.reject(oError);
                                    });
                            }
                        });
                },
                function (sError) {
                    oDeferred.reject(sError);
                });

            return oDeferred.promise();
        };

        /**
         * Resolves a given navigation intent (if valid) and returns the respective component data only for further processing.
         *
         * This method should be accessed by the Unified Inbox only.
         *
         * @param {string} sIntent Semantic object and action as a string with a "#" as prefix
         * @param {object} [oConfig] Configuration used to instantiate the component, when given it is expected that the only
         *   property contained in this object is `componentData`.
         *   When the `componentData` is not relevant, then this method should be called with an empty object or null otherwise it throws.
         *   Note that the `componentData` member is cloned for use by this method, and the following properties are unconditionally set by
         *   this method and should not be passed in `componentData`:
         *     -- componentData.startupParameters, componentData.config, componentData["sap-xapp-state"].
         * @returns {Promise<object>} promise (component data)
         * @since 1.88.0
         * @private
         */
        this.createComponentData = function (sIntent, oConfig) {
            return new Promise(function (fnResolve, fnReject) {
                var oContainer = sap.ushell.Container;

                if (!oConfig) {
                    oConfig = {};
                } else {
                    var iConfigPropertyCount = Object.keys(oConfig).length;
                    if (iConfigPropertyCount > 1 ||
                        (iConfigPropertyCount === 1 && !oConfig.componentData)) {
                        fnReject("`oConfig` argument should either be an empty object or contain only the `componentData` property.");
                        return;
                    }
                }

                if (oConfig.componentData) {
                    delete oConfig.componentData.startupParameters;
                    delete oConfig.componentData.config;
                    delete oConfig.componentData["sap-xapp-state"];
                }

                var sCanonicalIntent = UrlParsing.constructShellHash(UrlParsing.parseShellHash(sIntent));
                if (!sCanonicalIntent) {
                    fnReject("Navigation intent invalid!");
                    return;
                }

                oContainer.getServiceAsync("NavTargetResolution").then(function (NavTargetResolution) {
                    NavTargetResolution.resolveHashFragment("#" + sCanonicalIntent).then(function (oResult) {
                        function finalizeResult (oResultNew) {
                            oResultNew = deepExtend({}, oResultNew, oConfig);

                            if (!oResultNew.ui5ComponentName) {
                                if (oResultNew.additionalInformation) {
                                    oResultNew.ui5ComponentName = oResultNew.additionalInformation.replace(/^SAPUI5\.Component=/, "");
                                } else if (oResultNew.name) {
                                    oResultNew.ui5ComponentName = oResultNew.name;
                                }
                            }

                            return oResultNew;
                        }

                        // if my-inbox is running in cFLP inside an iframe, we need to
                        //  call app index to get the app info so it can be created embedded inside my-inbox.
                        if (oResult.applicationType === ApplicationType.URL.type &&
                            oResult.appCapabilities &&
                            oResult.appCapabilities.appFrameworkId === "UI5" &&
                            sap.ushell.Container.inAppRuntime()) {
                            // do not change the ["require"] to .require. This is to avoid
                            //  adding dependencies for non cFLP scenario.
                            sap.ui.require(["sap/ushell/appRuntime/ui5/services/AppLifeCycleAgent"], function (AppLifeCycleAgent) {
                                AppLifeCycleAgent.getAppInfo(oResult.appCapabilities.technicalAppComponentId).then(function (oAppInfo) {
                                    if (oAppInfo.hasOwnProperty("oResolvedHashFragment")) {
                                        oAppInfo = oAppInfo.oResolvedHashFragment;
                                    }
                                    oAppInfo = finalizeResult(oAppInfo);
                                    if (oAppInfo.url && sIntent.indexOf("?") > 0) {
                                        oAppInfo.url += "?" + sIntent.split("?")[1];
                                    }
                                    // Create the component data and resolve the promise
                                    createComponentData({
                                        ui5ComponentName: oResult.appCapabilities.technicalAppComponentId,
                                        applicationDependencies: oAppInfo,
                                        url: oAppInfo.url
                                    });
                                });
                            });
                        } else if (oResult.applicationType !== ApplicationType.URL.type
                            && !(/^SAPUI5\.Component=/.test(oResult.additionalInformation))) {
                            // If the application type equals "URL" and additionalInformation is undefined,
                            // the promise will be rejected if additionalInformation is not checked for existence.
                            fnReject("The resolved target mapping is not of type UI5 component.");
                        } else {
                            // Create the component data and resolve the promise
                            createComponentData(oResult);
                        }
                        function createComponentData (oResolvedHashFragment) {
                            oContainer.getServiceAsync("Ui5ComponentLoader").then(function (ui5ComponentLoader) {
                                oResolvedHashFragment = finalizeResult(oResolvedHashFragment);
                                oResolvedHashFragment.loadDefaultDependencies = false;
                                ui5ComponentLoader.createComponentData(oResolvedHashFragment).then(
                                    function (oComponentData) {
                                        fnResolve(oComponentData);
                                    },
                                    function (oError) {
                                        oError = oError || "";
                                        Log.error(
                                            "Cannot get UI5 component data: " + oError,
                                            oError.stack,
                                            "sap.ushell.services.CrossApplicationNavigation"
                                        );
                                        fnReject(oError);
                                    }
                                );
                            });
                        }
                    });
                });
            });
        };

        /**
         * Creates an empty app state object which acts as a parameter container for cross app navigation.
         *
         * @param {object} oAppComponent A UI5 component used as context for the app state.
         * @param {boolean} bTransientEnforced If set to <code>true</code> the appstate is not persisted on the backend. If set to
         *        <code>false</code> or <code>undefined</code> the persistency location is determined by the global ushell configuration.
         * @param {string} sPersistencyMethod See sap/ushell/services/_AppState/AppStatePersistencyMethod for possible values.
         *        Support depends on the used platform.
         * @param {object} oPersistencySettings Persistency settings.
         * @returns {object} App state container
         * @since 1.28
         * @deprecated since 1.95. Please use {@link #createEmptyAppStateAsync} instead.
         *
         * @private
         * @ui5-restricted SAP-internally public, must not be changed. Not part of public documentation.
         */
        this.createEmptyAppState = function (oAppComponent, bTransientEnforced, sPersistencyMethod, oPersistencySettings) {
            Log.error("Deprecated API call of 'sap.ushell.CrossApplicationNavigation.createEmptyAppState'. Please use 'createEmptyAppStateAsync' instead",
                null,
                "sap.ushell.services.CrossApplicationNavigation"
            );

            var AppStateService = sap.ushell.Container.getService("AppState");

            if (!BaseObject.isA(oAppComponent, "sap.ui.core.UIComponent")) {
                throw new Error("The passed oAppComponent must be a UI5 Component.");
            }
            return AppStateService.createEmptyAppState(oAppComponent, bTransientEnforced, sPersistencyMethod, oPersistencySettings);
        };

        /**
         * Creates an empty app state object which acts as a parameter container for cross app navigation.
         *
         * @param {object} oAppComponent A UI5 component used as context for the app state.
         * @param {boolean} bTransientEnforced If set to <code>true</code> the appstate is not persisted on the backend. If set to
         *        <code>false</code> or <code>undefined</code> the persistency location is determined by the global ushell configuration.
         * @param {string} sPersistencyMethod See sap/ushell/services/_AppState/AppStatePersistencyMethod for possible values.
         *        Support depends on the used platform.
         * @param {object} oPersistencySettings Persistency settings.
         * @returns {Promise<object>} A <code>Promise</code>, resolving the app state container.
         * @since 1.95
         *
         * @private
         * @ui5-restricted SAP-internally public, must not be changed. Not part of public documentation.
         */
        this.createEmptyAppStateAsync = function (oAppComponent, bTransientEnforced, sPersistencyMethod, oPersistencySettings) {
            if (!BaseObject.isA(oAppComponent, "sap.ui.core.UIComponent")) {
                return Promise.reject("The passed oAppComponent must be a UI5 Component.");
            }
            return sap.ushell.Container.getServiceAsync("AppState")
                .then(function (AppStateService) {
                    return AppStateService.createEmptyAppState(oAppComponent, bTransientEnforced, sPersistencyMethod, oPersistencySettings);
                });
        };

        /**
         * Get the app state object that was used for the current cross application navigation
         *
         * @param {object} oAppComponent - UI5 component, key will be extracted from component data
         * @returns {jQuery.Promise} promise object returning the app state object.
         *   Note that this is an unmodifiable container and its data must be copied into a writable container!
         * @since 1.28
         * @ignore SAP Internal usage only, beware! internally public, cannot be changed, but not part of the public documentation
         */
        this.getStartupAppState = function (oAppComponent) {
            this._checkComponent(oAppComponent);
            var sContainerKey = oAppComponent.getComponentData() && oAppComponent.getComponentData()["sap-xapp-state"] && oAppComponent.getComponentData()["sap-xapp-state"][0];
            return this.getAppState(oAppComponent, sContainerKey);
        };

        /**
         * Check that oAppComponent is of proper type.
         * Throws if not correct, returns undefined.
         *
         * @param {object} oAppComponent application component
         * @private
         */
        this._checkComponent = function (oAppComponent) {
            if (!BaseObject.isA(oAppComponent, "sap.ui.core.UIComponent")) {
                throw new Error("oComponent passed must be a UI5 Component");
            }
        };

        /**
         * Get an app state object given a key.
         * A lookup for a cross user app state will be performed.
         *
         * @param {object} oAppComponent - UI5 component, key will be extracted from component data
         * @param {object} sAppStateKey - the application state key. SAP internal usage only.
         * @returns {jQuery.Promise} promise object returning the app state object.
         *   Note that this is an unmodifiable container and its data must be copied into a writable container!
         * @since 1.28
         * @ignore SAP Internal usage only, beware! internally public, cannot be changed, but not part of the public documentation
         */
        this.getAppState = function (oAppComponent, sAppStateKey) {
            // see stakeholders in SFIN etc.
            var oContainer;
            var oDeferred = new jQuery.Deferred();
            this._checkComponent(oAppComponent);

            sap.ushell.Container.getServiceAsync("AppState").then(function (AppState) {
                if (typeof sAppStateKey !== "string") {
                    if (sAppStateKey !== undefined) {
                        Log.error("Illegal Argument sAppStateKey ");
                    }
                    setTimeout(function () {
                        oContainer = AppState.createEmptyUnmodifiableAppState(oAppComponent);
                        oDeferred.resolve(oContainer);
                    }, 0);
                    return;
                }
                AppState.getAppState(sAppStateKey)
                    .done(oDeferred.resolve)
                    .fail(oDeferred.reject);
            });

            return oDeferred.promise();
        };

        /**
         * Get data of an AppStates data given a key.
         * A lookup for a cross user app state will be performed.
         *
         * @param {object} sAppStateKeyOrArray - the application state key, or an array, see below. SAP internal usage only
         * @returns {jQuery.Promise} promise object returning the data of an AppState object, or an empty <code>{}</code> javascript
         *   object if the key could not be resolved or an error occurred!
         * @since 1.32
         * @ignore SAP Internal usage only, beware! internally public, cannot be changed, but not part of the public documentation
         *
         * This is interface exposed to platforms who need a serializable form of the application state data
         *
         * Note: this function may also be used in a multivalued invocation:
         *   pass as sAppStateKey an array <code>[["AppStateKey1"],["AppStateKey2"],...]</code>
         *   the result of the response will an corresponding array of array
         *   <code>[[{asdata1}],[{asdata2}]</code>
         *
         * @private internal usage(exposure to WebDynpro ABAP)
         */
        this.getAppStateData = function (sAppStateKeyOrArray) {
            return utils.invokeUnfoldingArrayArguments(this._getAppStateData.bind(this),
                [sAppStateKeyOrArray]);
        };

        /**
         * Get data of an AppStates data given a key.
         * A lookup for a cross user app state will be performed.
         *
         * @param {object} sAppStateKey - the application state key, or an array, see below. SAP internal usage only.
         * @returns {jQuery.Promise} promise object returning the data of an AppState object, or an empty <code>{}</code> javascript
         *   object if the key could not be resolved or an error occurred!
         * @since 1.32
         * @ignore SAP Internal usage only, beware! internally public, cannot be changed, but not part of the public documentation.
         *
         * This is interface exposed to platforms who need a serializable form of the application state data
         *
         * Note: this function may also be used in a multivalued invocation:
         *   pass as sAppStateKey an array <code>[["AppStateKey1"],["AppStateKey2"],...]</code>
         *   the result of the response will an corresponding array of array
         *   <code>[[{asdata1}],[{asdata2}]</code>
         *
         * @private
         */
        this._getAppStateData = function (sAppStateKey) {
            var oDeferred = new jQuery.Deferred();

            sap.ushell.Container.getServiceAsync("AppState").then(function (AppState) {
                if (typeof sAppStateKey !== "string") {
                    if (sAppStateKey !== undefined) {
                        Log.error("Illegal Argument sAppStateKey ");
                    }
                    setTimeout(function () {
                        oDeferred.resolve(undefined);
                    }, 0);
                } else {
                    AppState.getAppState(sAppStateKey)
                        .done(function (oAppState) {
                            oDeferred.resolve(oAppState.getData());
                        })
                        .fail(oDeferred.resolve.bind(oDeferred, undefined));
                }
            });

            return oDeferred.promise();
        };

        /**
         * persist multiple app states (in future potentially batched in a single roundtrip)
         *
         * @param {Array} aAppStates Array of application States
         * @returns {jQuery.Promise} a jQuery.Deferred. Returns a promise,
         *   in case of success an array of individual save promise objects is returned as argument
         *   in case of a reject, individual responses are not available
         * @private see remarks in getAppState
         */
        this.saveMultipleAppStates = function (aAppStates) {
            var aResult = [];
            var oDeferred = new jQuery.Deferred();
            aAppStates.forEach(function (oAppState) {
                aResult.push(oAppState.save());
            });
            jQuery.when.apply(this, aResult).done(function () {
                oDeferred.resolve(aResult);
            }).fail(function () {
                oDeferred.reject("save failed");
            });
            return oDeferred.promise();
        };

        /*
         * Process navigation parameters to allow "shellHash" together with parameters section, something that is currently not allowed.
         * This functionality is enabled only upon flag that is added to the navigation parameters. e.g.:
         * <pre>
         *   {
         *     target: {
         *       shellHash: "SO-36&jumper=postman"
         *     },
         *     params: {
         *       A: "B",
         *       c: "e"
         *     },
         *     processParams: true
         *   }
         * </pre>
         *
         */
        this._processShellHashWithParams = function (oArgs) {
            if (oArgs && oArgs.processParams === true && oArgs.target && oArgs.target.shellHash && oArgs.params) {
                var oHash = UrlParsing.parseShellHash(oArgs.target.shellHash);

                oArgs.target = {
                    semanticObject: oHash.semanticObject,
                    action: oHash.action,
                    contextRaw: oHash.contextRaw
                };
                oArgs.appSpecificRoute = oHash.appSpecificRoute;
                oArgs.params = Object.assign({}, oArgs.params, oHash.params);
            }
        };

        /**
         * Method to get an array of sap.ushell.services.AppStatePersistencyMethod.
         *
         * @returns {string[]} Returns an array of sap.ushell.services.AppStatePersistencyMethod.
         *   An empty array indicates that the platform does not support persistent states
         * @deprecated since 1.95. Please use {@link #getSupportedAppStatePersistencyMethodsAsync} instead.
         */
        this.getSupportedAppStatePersistencyMethods = function () {
            Log.error("Deprecated API call of 'sap.ushell.CrossApplicationNavigation.getSupportedAppStatePersistencyMethods'. Please use 'getSupportedAppStatePersistencyMethodsAsync' instead",
                null,
                "sap.ushell.services.CrossApplicationNavigation"
            );
            var AppStateService = sap.ushell.Container.getService("AppState");

            return AppStateService.getSupportedPersistencyMethods();
        };

        /**
         * Method to get an array of sap.ushell.services.AppStatePersistencyMethod.
         *
         * @returns {string[]} Returns an array of sap.ushell.services.AppStatePersistencyMethod.
         *   An empty array indicates that the platform does not support persistent states
         * @since 1.95
         */
        this.getSupportedAppStatePersistencyMethodsAsync = function () {
            return sap.ushell.Container.getServiceAsync("AppState")
                .then(function (AppStateService) {
                    return AppStateService.getSupportedPersistencyMethods();
                });
        };

        /**
         * Method to set or modify the AppState's persistency method of a state identified by key
         *
         * @param {string} sKey the AppState key
         * @param {number} iPersistencyMethod The chosen persistency method
         * @param {object} oPersistencySettings The additional settings PersistencySettings
         *
         * @returns {jQuery.Promise<string>} A promise which resolves a new key
         */
        this.makeStatePersistent = function (sKey, iPersistencyMethod, oPersistencySettings) {
            var oDeferred = new jQuery.Deferred();
            sap.ushell.Container.getServiceAsync("AppState").then(function (AppState) {
                AppState.makeStatePersistent(sKey, iPersistencyMethod, oPersistencySettings)
                    .done(oDeferred.resolve)
                    .fail(oDeferred.reject);
            });

            return oDeferred.promise();
        };

        /**
         * Resolves the URL hash fragment.
         *
         * This function gets the hash part of the URL and returns the URL of the target application.
         *
         * This is an asynchronous operation.
         *
         * @param {string} sHashFragment The formatted URL hash fragment in internal format (as obtained by the SAPUI5 hasher service) not as given in <code>location.hash</code>)!
         *   Example: <code>#SemanticObject-action?P1=V1&P2=A%20B%20C</code>
         * @returns {jQuery.Promise} A jQuery.Promise.
         * @protected
         */
        this.resolveIntent = function (sHashFragment) {
            var oDeferred = new jQuery.Deferred();

            sap.ushell.Container.getServiceAsync("NavTargetResolution").then(function (NavTargetResolution) {
                NavTargetResolution.resolveHashFragment(sHashFragment).then(function (oResult) {
                    oDeferred.resolve({ url: oResult.url });
                }).fail(function (sMessage) {
                    oDeferred.reject(sMessage);
                });
            });
            return oDeferred.promise();
        };
    }

    CrossApplicationNavigation.hasNoAdapter = true;
    return CrossApplicationNavigation;
}, true /* bExport */);
