// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @file
 *
 * This module performs client side navigation target resolution.
 *
 * This Module focuses on the core algorithm of matching an intent against a list of Inbounds (aka AppDescriptor signature objects),
 * which in addition have a property resolutionResult representing an "opaque" resolutionResult.
 *
 * getLinks should be called with already expanded hash fragment.
 * The output of getLinks should then be postprocessed for compaction, outside this service.
 *
 * Missing:
 * <ul>
 *   <li>Scope mechanism</li>
 *   <li>Parameter expansion with dynamic parameters</li>
 * </ul>
 *
 * NOTE: Currently the ABAP adapter also delegates isIntentSupported <b>only</b> (=erroneously)
 * to the resolveHashFragment adapter implementation, missing intents injected via custom resolver plug-ins.
 * The custom resolver hook functionality is currently outside of this method (only affecting resolveHashFragment), as before.
 * The future architecture should handle this consistently.
 *
 * NOTE: Old implementations also gave inconsistent results.
 * For example the ABAP adapter on isIntentSupported did call directly the adapter, not the service,
 * thus missing additional targets added only via a custom resolver.
 *
 * In the future, the custom resolver mechanism should be probably moved towards modifying (or only adding to the list of Inbounds),
 * this way a single data source has to be altered to support consistently getLinks, isIntentSupported.
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/isPlainObject",
    "sap/base/util/ObjectPath",
    "sap/base/util/extend",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/ApplicationType",
    "sap/ushell/Config",
    "sap/ushell/navigationMode",
    "sap/ushell/services/_ClientSideTargetResolution/Formatter",
    "sap/ushell/services/_ClientSideTargetResolution/InboundIndex",
    "sap/ushell/services/_ClientSideTargetResolution/InboundProvider",
    "sap/ushell/services/_ClientSideTargetResolution/ParameterMapping",
    "sap/ushell/services/_ClientSideTargetResolution/PrelaunchOperations",
    "sap/ushell/services/_ClientSideTargetResolution/Search",
    "sap/ushell/services/_ClientSideTargetResolution/StagedLogger",
    "sap/ushell/services/_ClientSideTargetResolution/SystemContext",
    "sap/ushell/services/_ClientSideTargetResolution/Utils",
    "sap/ushell/services/_ClientSideTargetResolution/VirtualInbounds",
    "sap/ushell/services/_ClientSideTargetResolution/XAppStateProcessing",
    "sap/ushell/services/AppConfiguration",
    "sap/ushell/TechnicalParameters",
    "sap/ushell/utils",
    "sap/ushell/utils/UrlParsing"
], function (
    Log,
    fnIsPlainObject,
    ObjectPath,
    Extend,
    jQuery,
    ApplicationType,
    Config,
    NavigationMode,
    _Formatter,
    _InboundIndex,
    _InboundProvider,
    _ParameterMapping,
    _PrelaunchOperations,
    _Search,
    _StagedLogger,
    _SystemContext,
    _Utils,
    _VirtualInbounds,
    _XAppStateProcessing,
    AppConfiguration,
    TechnicalParameters,
    UshellUtils,
    UrlParsing
) {
    "use strict";

    /**
     * A module to perform client side target resolution where possible, based on a complete list of Inbounds.
     *
     * This list defines a common strategy for selecting <b>one</b> appropriate target (even in case of conflicts) across all platforms.
     *
     * The interface assumes a <b>complete</b> list of inbounds has been passed, including parameter signatures.
     * The array of inbounds is to be injected by the <code>oAdapter.getInbounds()</code> function.
     *
     * Note that the resolution results (e.g. targets and descriptions) may <b>not</b> be present on the client.
     *
     * All interfaces shall still be asynchronous interfaces regarding client invocation.
     *
     * The following request can be served from the client:
     * <ol>
     *   <li>isIntentSupported</li>
     *   <li>getLinks</li>
     * </ol>
     *
     * This module does <b>not</b> perform hash expansion or compaction.
     * This is performed by respective preprocessing of the hash
     * (see {@link sap.ushell.services.NavTargetResolution#resolveHashFragment}) and:
     * <ul>
     *   <li>resolveHashFragment (expansion, NavTargetResolution.isIntentSupported)</li>
     *   <li>isIntentSupported
     *   <li>getLinks (post processing, Service)</li>
     * </ul>
     *
     * The Parameter sap-ui-tech-hint can be used to attempt to give one Ui technology preference over another,
     * legal values are: UI5, WDA, GUI.
     *
     * Usage:
     * <pre>
     * var oService = sap.ushell.Container.getServiceAsync("ClientSideTargetResolution").then(function (ClientSideTargetResolution) {});
     * oService.isIntentSupported("#SemanticObject-action");
     * </pre>
     *
     * @param {object} oAdapter Adapter, provides an array of Inbounds.
     * @param {object} oContainerInterface Not in use.
     * @param {string} sParameters Parameter string, not in use.
     * @param {object} oServiceConfiguration The service configuration not in use.
     *
     * @alias sap.ushell.services.ClientSideTargetResolution
     * @class
     * @see sap.ushell.services.Container#getServiceAsync
     * @since 1.32.0
     */
    function ClientSideTargetResolution (oAdapter, oContainerInterface, sParameters, oServiceConfiguration) {
        this._init.apply(this, arguments);
    }

    ClientSideTargetResolution.prototype._init = function (oAdapter, oContainerInterface, sParameters, oServiceConfiguration) {
        // A unique (sequential) id used during logging.
        this._iLogId = 0;

        if (!this._implementsServiceInterface(oAdapter)) {
            Log.error(
                "Cannot get Inbounds",
                "ClientSideTargetResolutionAdapter should implement getInbounds method",
                "sap.ushell.services.ClientSideTargetResolution"
            );
            return;
        }

        this._oInboundProvider = new _InboundProvider(oAdapter.getInbounds.bind(oAdapter));

        // Deferred objects resolved once the easy access systems are obtained
        this._oHaveEasyAccessSystemsDeferreds = {
            userMenu: null,
            sapMenu: null
        };

        this._oServiceConfiguration = oServiceConfiguration;

        this._oAdapter = oAdapter;
    };

    /**
     * Checks whether the platform adapter has a compatible service interface.
     *
     * @param {object} oAdapter An instance of ClientSideTargetResolution Adapter for the platform at hand.
     * @return {boolean} Whether the adapter implements the ClientSideTargetResolution required interface.
     */
    ClientSideTargetResolution.prototype._implementsServiceInterface = function (oAdapter) {
        if (typeof oAdapter.getInbounds === "function") {
            return true;
        }
        return false;
    };

    /**
     * Expand inbound filter object for the CSTR Adapter if enabled via configuration.
     *
     * @param {variant} vObject An input structure to extract the filter from. Currently we support a string representing a hash fragment.
     * @returns {undefined|object[]} <code>undefined</code>, or an array of Segments (tuples semanticObject, action) in the form:
     *   <pre>
     *   [
     *     {
     *       semanticObject: "So1",
     *       action: "action1"
     *     },
     *     ...
     *   ]
     *   </pre>
     */
    ClientSideTargetResolution.prototype._extractInboundFilter = function (vObject) {
        if (!this._oAdapter.hasSegmentedAccess) {
            return undefined;
        }
        if (typeof vObject !== "string") {
            return undefined;
        }

        var sFixedHashFragment = vObject.indexOf("#") === 0 ? vObject : "#" + vObject;
        var oShellHash = UrlParsing.parseShellHash(sFixedHashFragment);

        if (!oShellHash || !oShellHash.semanticObject || !oShellHash.action) {
            return undefined;
        }

        return [{
            semanticObject: oShellHash.semanticObject,
            action: oShellHash.action
        }];
    };

    /**
     * Resolves the URL hash fragment asynchronously.
     * The form factor of the current device is used to filter the navigation targets returned.
     *
     * @param {string} sHashFragment The URL hash fragment in internal format
     *   (as obtained by the hasher service from SAPUI5, not as given in <code>location.hash</code>)
     * @returns {object} A <code>jQuery.Promise</code>. Its <code>done()</code> function gets an object that you can use to create a
     *   {@link sap.ushell.components.container.ApplicationContainer} or <code>undefined</code> in case the hash fragment was empty.
     * @private
     * @since 1.34.0
     */
    ClientSideTargetResolution.prototype.resolveHashFragment = function (sHashFragment) {
        var that = this,
            oDeferred = new jQuery.Deferred(),
            // NOTE: adapter may not implement fallback function
            fnBoundFallback = this._oAdapter.resolveHashFragmentFallback && this._oAdapter.resolveHashFragmentFallback.bind(this._oAdapter),
            aSegments = this._extractInboundFilter(sHashFragment);

        this._oInboundProvider.getInbounds(aSegments).then(
            function (oInboundIndex) {
                that._resolveHashFragment(sHashFragment, fnBoundFallback, oInboundIndex)
                    .done(function (o) {
                        return oDeferred.resolve(o);
                    })
                    .fail(oDeferred.reject.bind(oDeferred));
            },
            function () {
                oDeferred.reject.apply(oDeferred, arguments);
            }
        );
        return oDeferred.promise();
    };

    /**
     * Resolves a given intent to information that can be used to render a tile.
     *
     * @param {string} sHashFragment The intent to be resolved (including the "#" sign).
     * @return {jQuery.Deferred.promise} Resolves with an object containing the necessary information to render a tile,
     *   or rejects with an error message or <code>undefined</code>.
     * @private
     * @since 1.38.0
     */
    ClientSideTargetResolution.prototype.resolveTileIntent = function (sHashFragment) {
        var that = this,
            oDeferred = new jQuery.Deferred(),

            // NOTE: adapter may not implement fallback function
            aSegments = this._extractInboundFilter(sHashFragment);

        this._oInboundProvider.getInbounds(aSegments).then(
            function (oInboundIndex) {
                that._resolveTileIntent(sHashFragment, undefined, oInboundIndex)
                    .done(oDeferred.resolve.bind(oDeferred))
                    .fail(oDeferred.reject.bind(oDeferred));
            },
            function () {
                oDeferred.reject.apply(oDeferred, arguments);
            }
        );
        return oDeferred.promise();
    };

    /**
     * Resolves the given tile intent in the context of the given inbounds.
     *
     * @param {object[]} aInbounds The Inbounds.
     * @param {string} sHashFragment The intent to be resolved.
     * @returns {jQuery.Deferred.promise} A promise.
     * @private
     */
    ClientSideTargetResolution.prototype.resolveTileIntentInContext = function (aInbounds, sHashFragment) {
        var oInboundIndex,
            oDeferred = new jQuery.Deferred();

        // create Inbound Index for aInbounds
        oInboundIndex = _InboundIndex.createIndex(
            aInbounds.concat(_VirtualInbounds.getInbounds())
        );

        this._resolveTileIntent(sHashFragment, undefined /* fnBoundFallback */, oInboundIndex)
            .done(oDeferred.resolve.bind(oDeferred))
            .fail(oDeferred.reject.bind(oDeferred));

        return oDeferred.promise();
    };

    ClientSideTargetResolution.prototype._resolveHashFragment = function (sHashFragment, fnBoundFallback, oInboundIndex) {
        var that = this,
            oDeferred = new jQuery.Deferred(),
            sFixedHashFragment = sHashFragment.indexOf("#") === 0 ? sHashFragment : "#" + sHashFragment,
            oShellHash = UrlParsing.parseShellHash(sFixedHashFragment);

        if (oShellHash === undefined) {
            Log.error("Could not parse shell hash '" + sHashFragment + "'",
                "please specify a valid shell hash",
                "sap.ushell.services.ClientSideTargetResolution");
            return oDeferred.reject().promise();
        }

        oShellHash.formFactor = UshellUtils.getFormFactor();

        this._getMatchingInbounds(oShellHash, oInboundIndex, { bExcludeTileInbounds: true })
            .fail(function (sError) {
                Log.error("Could not resolve " + sHashFragment,
                    "_getMatchingInbounds promise rejected with: " + sError,
                    "sap.ushell.services.ClientSideTargetResolution");
                oDeferred.reject(sError);
            })
            .done(function (aMatchingTargets) {
                var oMatchingTarget;

                if (aMatchingTargets.length === 0) {
                    Log.warning(
                        "Could not resolve " + sHashFragment,
                        "rejecting promise",
                        "sap.ushell.services.ClientSideTargetResolution"
                    );
                    oDeferred.reject("Could not resolve navigation target");
                    return;
                }

                aMatchingTargets = that._applySapNavigationScopeFilter(aMatchingTargets, oShellHash);

                oMatchingTarget = aMatchingTargets[0];

                if (Log.getLevel() >= Log.Level.DEBUG) {
                    // replacer for JSON.stringify to show undefined values
                    var fnUndefinedReplacer = function (sKey, vVal) {
                        return (this[sKey] === undefined) ? "<undefined>" : vVal;
                    };
                    var fnReplacer = function (key, value) {
                        return (key === "_original") ? undefined : fnUndefinedReplacer.call(this, key, value);
                    };
                    var sMatchedTarget = JSON.stringify(oMatchingTarget, fnReplacer, "   ");

                    Log.debug(
                        "The following target will now be resolved",
                        sMatchedTarget,
                        "sap.ushell.services.ClientSideTargetResolution"
                    );
                }

                that._resolveSingleMatchingTarget(oMatchingTarget, fnBoundFallback, sFixedHashFragment)
                    .done(function (o) {
                        oDeferred.resolve(o);
                    })
                    .fail(oDeferred.reject.bind(oDeferred));
            });

        return oDeferred.promise();
    };

    /**
     * Takes the sap-navigation-scope-filter from the shell hash and finds matching inbounds by using the sap-navigation-scope parameter.
     *
     * @param {object[]} aMatchResults The set of already matched inbounds.
     * @param {object} oShellHash The shell hash object.
     * @returns {object[]} The matched inbounds that are filtered by sap-navigation-scope.
     *   If no inbound matches the sap-navigation-scope-filter, then the original aMatchResults is returned.
     * @private
     */
    ClientSideTargetResolution.prototype._applySapNavigationScopeFilter = function (aMatchResults, oShellHash) {
        var oSapNavigationScopeFilter = oShellHash && oShellHash.params && oShellHash.params["sap-navigation-scope-filter"];
        if (!oSapNavigationScopeFilter) {
            return aMatchResults;
        }

        var aFilteredResults = aMatchResults.filter(function (oMatchResult) {
            var oMatchResultParams = ObjectPath.get("inbound.signature.parameters", oMatchResult);
            var oSapNavigationScope = oMatchResultParams && oMatchResultParams["sap-navigation-scope"];
            if (oSapNavigationScope) {
                return oSapNavigationScopeFilter[0] === oSapNavigationScope.defaultValue.value;
            }
            return undefined;
        });

        return aFilteredResults.length > 0 ? aFilteredResults : aMatchResults;
    };

    ClientSideTargetResolution.prototype._resolveSingleMatchingTarget = function (oMatchingTarget, fnBoundFallback, sFixedHashFragment) {
        var that = this,
            oDeferred = new jQuery.Deferred(),
            oIntent = UrlParsing.parseShellHash(sFixedHashFragment),
            sIntent = [oIntent.semanticObject, oIntent.action].join("-"),
            sApplicationType = (oMatchingTarget.inbound.resolutionResult || {}).applicationType;


        var fnExternalSystemAliasResolver;
        if (this._oAdapter.resolveSystemAlias) {
            fnExternalSystemAliasResolver = this._oAdapter.resolveSystemAlias.bind(this._oAdapter);
        }

        var bHasUrlTemplate = !!oMatchingTarget.inbound.templateContext;
        var fnEasyAccessMenuResolver = ApplicationType.getEasyAccessMenuResolver(sIntent, sApplicationType);
        if (fnEasyAccessMenuResolver && !bHasUrlTemplate) {
            fnEasyAccessMenuResolver(oIntent, oMatchingTarget, fnExternalSystemAliasResolver, ApplicationType.WDA.enableWdaCompatibilityMode).then(
                function (oResolutionResult) {
                    // compute NavigationMode
                    var oNavModeProperties = NavigationMode.compute(
                        ObjectPath.get("inbound.resolutionResult.applicationType", oMatchingTarget),
                        (oMatchingTarget.intentParamsPlusAllDefaults["sap-ushell-next-navmode"] || [])[0],
                        (oMatchingTarget.intentParamsPlusAllDefaults["sap-ushell-navmode"] || [])[0],
                        (AppConfiguration.getCurrentApplication() || {}).applicationType,
                        Config.last("/core/navigation/enableInPlaceForClassicUIs")
                    );

                    UshellUtils.shallowMergeObject(oResolutionResult, oNavModeProperties);
                    oResolutionResult.inboundPermanentKey = oMatchingTarget.inbound.permanentKey || oMatchingTarget.inbound.id;
                    oDeferred.resolve(oResolutionResult);
                },
                function (sError) {
                    oDeferred.reject(sError);
                }
            );
            return oDeferred.promise();
        }

        var oReservedParameters = this._getReservedParameters(oMatchingTarget);

        // rename Parameters
        _ParameterMapping.mapParameterNamesAndRemoveObjects(oMatchingTarget);
        sap.ushell.Container.getServiceAsync("AppState").then(function (AppStateService) {
            _XAppStateProcessing.mixAppStateIntoResolutionResultAndRename(oMatchingTarget, AppStateService)
            .done(function (oMatchingTarget) {
                var fnResultProcessor = function () {
                    return that._constructFallbackResolutionResult.call(that, oMatchingTarget, fnBoundFallback, sFixedHashFragment);
                };
                if (ApplicationType[sApplicationType]) {
                    fnResultProcessor = ApplicationType[sApplicationType].generateResolutionResult;
                }

                // remove parameters that should not make it to the URL (in any case!)
                delete oMatchingTarget.intentParamsPlusAllDefaults["sap-tag"];
                delete oMatchingTarget.mappedIntentParamsPlusSimpleDefaults["sap-tag"];
                oMatchingTarget.mappedDefaultedParamNames = oMatchingTarget.mappedDefaultedParamNames.filter(function (sParameterName) {
                    return sParameterName !== "sap-tag";
                });

                var sBaseUrl = ObjectPath.get("inbound.resolutionResult.url", oMatchingTarget);

                _PrelaunchOperations.executePrelaunchOperations(oMatchingTarget, oReservedParameters["sap-prelaunch-operations"])
                    .then(function () {
                        return fnResultProcessor(oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver);
                    })
                    .then(function (oResolutionResult) {
                        oResolutionResult.reservedParameters = oReservedParameters;
                        oResolutionResult.inboundPermanentKey = oMatchingTarget.inbound.permanentKey || oMatchingTarget.inbound.id;
                        return oResolutionResult;
                    })
                    .then(
                        function (oResolutionResult) {
                            Log.debug(
                                "Intent was resolved to the following target",
                                JSON.stringify(oMatchingTarget.resolutionResult, null, 3),
                                "sap.ushell.services.ClientSideTargetResolution"
                            );
                            UshellUtils.shallowMergeObject(oMatchingTarget.resolutionResult, oResolutionResult);
                            oDeferred.resolve(oMatchingTarget.resolutionResult);
                        },
                        function (vMessage) {
                            if (typeof vMessage === "string" && vMessage.indexOf("fallback:") >= 0) {
                                that._constructFallbackResolutionResult.call(this, oMatchingTarget, fnBoundFallback, sFixedHashFragment)
                                    .then(
                                        function (oResolutionResult) {
                                            UshellUtils.shallowMergeObject(oMatchingTarget.resolutionResult, oResolutionResult);
                                            oDeferred.resolve(oMatchingTarget.resolutionResult);
                                        },
                                        oDeferred.reject.bind(oDeferred)
                                    );
                            } else {
                                oDeferred.reject(vMessage);
                            }
                        }
                    );
            });
        });
        return oDeferred.promise();
    };

    /**
     * Takes the parameters from startup parameters and inbound parameters.
     * For startup parameters, an array of parameter names is returned.
     * For inbound parameters, it is taken from inbound signature.
     *
     * If the inbound parameters are contained in the oMatchTarget, they are removed from the oMatchTarget function parameter.
     *
     * @param {object} oMatchingTarget The target that matches the given intent.
     * @returns {object} The reserved parameters.
     * @private
     */
    ClientSideTargetResolution.prototype._getReservedParameters = function (oMatchingTarget) {
        var aReservedStartupParameterNames = TechnicalParameters.getParameters({
            injectFrom: "startupParameter"
        }).map(function (oParam) {
            return oParam.name;
        });
        var oReservedParameters = _Utils.extractParameters(aReservedStartupParameterNames, oMatchingTarget.intentParamsPlusAllDefaults);
        // Parameter for the next navigation is always taken from the default value of the target mapping.
        // Even if the navigation was made with an intent parameter.
        TechnicalParameters.getParameters({
            injectFrom: "inboundParameter"
        }).forEach(function (oParameterToForward) {
            var sParameterToForwardName = oParameterToForward.name;
            var oSignatureParameters = oMatchingTarget.inbound && oMatchingTarget.inbound.signature && oMatchingTarget.inbound.signature.parameters;
            if (oSignatureParameters && Object.keys(oSignatureParameters).length > 0) {
                var oParameterToForwardName = oSignatureParameters[sParameterToForwardName];
                var bIsDefaultParameter = oParameterToForwardName && oParameterToForwardName.defaultValue && oParameterToForwardName.defaultValue.hasOwnProperty("value");
                var bIsFilterParameter = oParameterToForwardName && oParameterToForwardName.filter && oParameterToForwardName.filter.hasOwnProperty("value");
                if (oParameterToForwardName && (bIsFilterParameter || bIsDefaultParameter)) {
                    if (bIsDefaultParameter) {
                        oReservedParameters[sParameterToForwardName] = oParameterToForwardName.defaultValue.value;
                    } else {
                        oReservedParameters[sParameterToForwardName] = oParameterToForwardName.filter.value;
                    }
                } else {
                    delete oReservedParameters[sParameterToForwardName];
                }

                // no technical parameters should be passed to the application
                delete oMatchingTarget.intentParamsPlusAllDefaults[sParameterToForwardName];
                var iIdx = oMatchingTarget.defaultedParamNames.indexOf(sParameterToForwardName);
                if (iIdx >= 0) {
                    oMatchingTarget.defaultedParamNames.splice(iIdx, 1);
                }
            }
        });

        return oReservedParameters;
    };

    ClientSideTargetResolution.prototype._resolveTileIntent = function (sHashFragment, fnBoundFallback, oInboundIndex) {
        var that = this,
            oDeferred = new jQuery.Deferred(),
            sFixedHashFragment = sHashFragment.indexOf("#") === 0 ? sHashFragment : "#" + sHashFragment,
            oShellHash = UrlParsing.parseShellHash(sFixedHashFragment);

        if (oShellHash === undefined) {
            Log.error(
                "Could not parse shell hash '" + sHashFragment + "'",
                "please specify a valid shell hash",
                "sap.ushell.services.ClientSideTargetResolution"
            );
            return oDeferred.reject("Cannot parse shell hash").promise();
        }

        oShellHash.formFactor = UshellUtils.getFormFactor();

        this._getMatchingInbounds(oShellHash, oInboundIndex, { bExcludeTileInbounds: false })
            .fail(function (sError) {
                Log.error(
                    "Could not resolve " + sHashFragment,
                    "_getMatchingInbounds promise rejected with: " + sError,
                    "sap.ushell.services.ClientSideTargetResolution"
                );
                oDeferred.reject(sError);
            })
            .done(function (aMatchingTargets) {
                var oMatchingTarget;

                if (aMatchingTargets.length === 0) {
                    Log.warning(
                        "Could not resolve " + sHashFragment,
                        "no matching targets were found",
                        "sap.ushell.services.ClientSideTargetResolution"
                    );
                    oDeferred.reject("No matching targets found");
                    return;
                }

                oMatchingTarget = aMatchingTargets[0];
                that._resolveSingleMatchingTileIntent(oMatchingTarget, fnBoundFallback, sFixedHashFragment)
                    .done(oDeferred.resolve.bind(oDeferred))
                    .fail(oDeferred.reject.bind(oDeferred));
            });
        return oDeferred.promise();
    };

    ClientSideTargetResolution.prototype._resolveSingleMatchingTileIntent = function (oMatchingTarget, fnBoundFallback, sFixedHashFragment) {
        var oDeferred = new jQuery.Deferred(),
            sApplicationType = (oMatchingTarget.inbound.resolutionResult || {}).applicationType,
            that = this;

        var fnExternalSystemAliasResolver;
        if (this._oAdapter.resolveSystemAlias) {
            fnExternalSystemAliasResolver = this._oAdapter.resolveSystemAlias.bind(this._oAdapter);
        }

        // rename Parameters
        _ParameterMapping.mapParameterNamesAndRemoveObjects(oMatchingTarget);
        sap.ushell.Container.getServiceAsync("AppState").then(function (AppStateService) {
            _XAppStateProcessing.mixAppStateIntoResolutionResultAndRename(oMatchingTarget, AppStateService)
            .done(function (oMatchingTarget) {
                var fnResultProcessor = function () {
                    return that._constructFallbackResolutionResult.call(that, oMatchingTarget, fnBoundFallback, sFixedHashFragment);
                };
                if (ApplicationType[sApplicationType]) {
                    fnResultProcessor = ApplicationType[sApplicationType].generateResolutionResult;
                }

                // remove parameters that should not make it to the URL (in any case!)
                delete oMatchingTarget.intentParamsPlusAllDefaults["sap-tag"];
                delete oMatchingTarget.mappedIntentParamsPlusSimpleDefaults["sap-tag"];
                oMatchingTarget.mappedDefaultedParamNames = oMatchingTarget.mappedDefaultedParamNames.filter(function (sParameterName) {
                    return sParameterName !== "sap-tag";
                });

                var sBaseUrl = ObjectPath.get("inbound.resolutionResult.url", oMatchingTarget);

                fnResultProcessor(oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver).then(
                    function (oResolutionResult) {
                        UshellUtils.shallowMergeObject(oMatchingTarget.resolutionResult, oResolutionResult);

                        // beware, shallow copy of central object! only modify root properties!
                        var oTileResolutionResult = Extend({}, oMatchingTarget.inbound.tileResolutionResult);

                        oTileResolutionResult.startupParameters = oMatchingTarget.effectiveParameters;
                        oTileResolutionResult.navigationMode = oMatchingTarget.resolutionResult.navigationMode;
                        if (!oTileResolutionResult.navigationMode) {
                            oTileResolutionResult.navigationMode = NavigationMode.getNavigationMode(oMatchingTarget.resolutionResult);
                        }
                        oDeferred.resolve(oTileResolutionResult);
                        Log.debug(
                            "Tile Intent was resolved to the following target",
                            JSON.stringify(oTileResolutionResult, null, 3),
                            "sap.ushell.services.ClientSideTargetResolution"
                        );
                    },
                    function (sMessage) {
                        oDeferred.reject(sMessage);
                    }
                );
            });
        });
        return oDeferred.promise();
    };


    /*
     * The following table compares the capabilities and behavior of the different technologies:
     *                                                       SAPUI5  URL  WDA  WebGui  WebGuiWrapped  WCF
     * server/port/client etc altered                           N     Y    Y      Y          Y         Y
     * sap-system part of URL                                   Y     Y    N      N          N         N
     * sap-ushell-defaultedParametersNames part of URL          Y     Y    Y      N          N         Y
     * parameters compacted                                     Y     N    Y      N          N         Y
     */

    /**
     * Construct the resolution result of the given matching delegating the
     * actual construction of the resolution result to a given fallback function.
     *
     * @param {object} oMatchingTarget The matching target to amend with the resolution result.
     * @param {function} fnBoundFallback A fallback function used by this method to resolve the given hash fragment.
     *   It is called with the following positional parameters:
     *   <ol>
     *     <li>hash fragment string</li>
     *     <li>inbound that matched the hash fragment</li>
     *     <li>oEffectiveParameters, the parameters to be added to the resolved url</li>
     *   </ol>
     *   This function must return a jQuery promise that is resolved with an object like:
     *   <pre>
     *   {
     *     applicationType: ...,
     *     additionalInformation: ...,
     *     url: ...,
     *     applicationDependencies: ...,
     *     text: ...
     *   }
     *   </pre>
     *   Missing properties will be excluded from the resolution result.
     * @param {string} sFixedHashFragment The hash fragment to be resolved with a guaranteed "#" prefix.
     * @returns {Promise} Resolves with the ResolutionResult or rejects with an error message if either the
     *   <code>fnBoundFallback</code> parameter was undefined or failed to produce a resolution result.
     * @private
     */
    ClientSideTargetResolution.prototype._constructFallbackResolutionResult = function (oMatchingTarget, fnBoundFallback, sFixedHashFragment) {
        /*
         * The current flow is to resolve the result with all *uncompressed* default substituted parameters and alters
         * appState compress the url afterwards if needed (the fallback function takes care of this).
         */
        var oEffectiveParameters = {},
            aDefaultedParamNames;

        Object.keys(oMatchingTarget.intentParamsPlusAllDefaults).forEach(function (sParamName) {
            if (Array.isArray(oMatchingTarget.intentParamsPlusAllDefaults[sParamName])) {
                oEffectiveParameters[sParamName] = oMatchingTarget.intentParamsPlusAllDefaults[sParamName];
            }
        });
        aDefaultedParamNames = oMatchingTarget.mappedDefaultedParamNames || oMatchingTarget.defaultedParamNames;
        if (aDefaultedParamNames.length > 0) {
            oEffectiveParameters["sap-ushell-defaultedParameterNames"] = [JSON.stringify(aDefaultedParamNames)];
        }

        if (typeof fnBoundFallback !== "function") {
            // no fallback logic available
            Log.error(
                "Cannot resolve hash fragment",
                sFixedHashFragment + " has matched an inbound that cannot be resolved client side and no resolveHashFragmentFallback method was implemented in ClientSideTargetResolutionAdapter",
                "sap.ushell.services.ClientSideTargetResolution"
            );

            return Promise.reject("Cannot resolve hash fragment: no fallback provided.");
        }

        // fallback
        Log.warning(
            "Cannot resolve hash fragment client side",
            sFixedHashFragment + " has matched an inbound that cannot be resolved client side. Using fallback logic",
            "sap.ushell.services.ClientSideTargetResolution"
        );

        // NOTE: the callback function will be invoked with the effective *unmapped* parameter names! as 3rd argument
        return new Promise(function (fnResolve, fnReject) {
            fnBoundFallback(
                sFixedHashFragment,
                Extend({}, oMatchingTarget.inbound), // don't let adapters to change the inbound member
                oEffectiveParameters
            )
                .done(function (oFallbackResolutionResult) {
                    var oResolutionResult = {};
                    // propagate properties from the resolution result returned by the fallback function
                    ["applicationType", "additionalInformation", "url", "applicationDependencies", "text"].forEach(function (sPropName) {
                        if (oFallbackResolutionResult.hasOwnProperty(sPropName)) {
                            oResolutionResult[sPropName] = oFallbackResolutionResult[sPropName];
                        }
                    });

                    fnResolve(oResolutionResult);
                })
                .fail(fnReject.bind(null));
        });
    };

    /**
     * Returns a list of unique semantic objects assigned to the current user.
     * The semantic objects coming from an inbound with hideIntentLink set to <code>true</code>
     * are not returned since these inbounds are not returned by getLinks.
     *
     * @returns {jQuery.Deferred.promise} Resolves with an array of strings representing
     *   the User's semantic objects or rejects with an error message.
     *   NOTE: semantic objects are returned in lexicographical order in the result array.
     * @private
     * @since 1.38.0
     */
    ClientSideTargetResolution.prototype.getDistinctSemanticObjects = function () {
        var oDeferred = new jQuery.Deferred();

        this._oInboundProvider.getInbounds().then(
            function (oInboundIndex) {
                var oSemanticObjects = {};

                oInboundIndex.getAllInbounds().forEach(function (oInbound) {
                    if (typeof oInbound.semanticObject === "string" && oInbound.semanticObject !== "*" &&
                        !oInbound.hideIntentLink && oInbound.semanticObject.length > 0) {
                        oSemanticObjects[oInbound.semanticObject] = true;
                    }
                });

                oDeferred.resolve(
                    Object.keys(oSemanticObjects).sort()
                );
            },
            function () {
                oDeferred.reject.apply(oDeferred, arguments);
            }
        );
        return oDeferred.promise();
    };

    /**
     * Resolves a semantic object/action and business parameters to a list of links,
     * taking into account the form factor of the current device.
     *
     * @param {object} oArgs An object containing nominal arguments for the method, having the following structure:
     *   {
     *      semanticObject: "Object", // optional (matches all semantic objects)
     *      action: "action",         // optional (matches all actions)
     *      params: {                 // optional business parameters
     *         A: "B",
     *         C: ["e", "j"]
     *      },
     *      paramsOptions: [          // optional
     *         { name: "A", required: true }
     *      ],
     *      ignoreFormFactor: true,    // (optional) defaults to false
     *      treatTechHintAsFilter : true, // (optional) default false
     *
     *      // List of tags under which the returned links may belong to.
     *      tags: [ "tag-A", "tag-B" ] // (optional) defaults to undefined
     *   }
     *   Note: positional arguments supported prior to version 1.38.0 are now deprecated.
     *   The caller should always specify nominal parameters, using an object.
     *   Also, wildcards for semanticObject and action parameters are now expressed via <code>undefined</code>,
     *   or by just omitting the parameter in the object.
     *   Note: treatTechHintAsFilter does a plain filtering on technology if supplied it does *not* do conflict resolution.
     *   Example: "UI5" ?P1=1 "(UI5)"
     *            "WDA" ?P1=1 "(WDA)"
     *            "GUI"       "(GUI)"
     *   Calling getLinks with P1=1&sap-ui-tech-hint=GUI will return "A-b?P1=1&sap-ui-tech-hint=GUI" and the text "(GUI)".
     *   Resolving "A-b?P1=1&sap-ui-tech-hint=GUI" will always invoke UI5 (!).
     * @returns {jQuery.Deferred.promise} A promise that resolves with an array of links objects containing (at least) the following properties:
     *   <pre>
     *   {
     *      intent: "#AnObject-Action?A=B&C=e&C=j",
     *      text: "Perform action",
     *      icon: "sap-icon://Fiori2/F0018", // optional
     *      subTitle: "Action"               // optional
     *      shortTitle: "Perform"            // optional
     *   }
     *   </pre>
     * @private
     * @since 1.38.0
     */
    ClientSideTargetResolution.prototype.getLinks = function (oArgs) {
        var oNominalArgs,
            that = this,
            sSemanticObject, mParameters, bIgnoreFormFactor, // old 3-arguments tuple
            oDeferred = new jQuery.Deferred(),
            oCallArgs;

        if (arguments.length === 1 && fnIsPlainObject(arguments[0])) {
            oNominalArgs = arguments[0];
            oCallArgs = Extend({}, oNominalArgs);
            // assure action: undefined in transported, as there is a check on this below !?!
            ["action", "semanticObject"].forEach(function (sArg) {
                if (oNominalArgs.hasOwnProperty(sArg)) {
                    oCallArgs[sArg] = oNominalArgs[sArg];
                }
            });
            if (oCallArgs.appStateKey) {
                oCallArgs.params = oCallArgs.params || {};
                oCallArgs.params["sap-xapp-state"] = [oCallArgs.appStateKey];
                delete oCallArgs.appStateKey;
            }

            // note, may be a 1.38+ call or a pre 1.38 call if without action.
        } else if (arguments.length <= 3) {
            // 3 parameters: pre-1.38.0 behavior, parameters are sSemanticObject, mParameters, bIgnoreFormFactor
            // NOTE: in 1.38.0 only the first argument is mandatory!
            // NOTE: in theory there should be no public caller of this method (it's private) apart from some sample apps.
            Log.warning(
                "Passing positional arguments to getLinks is deprecated",
                "Please use nominal arguments instead",
                "sap.ushell.services.ClientSideTargetResolution"
            );

            sSemanticObject = arguments[0];
            mParameters = arguments[1];
            bIgnoreFormFactor = arguments[2];

            oCallArgs = { // NOTE: no action passed here
                semanticObject: sSemanticObject,
                params: mParameters,
                ignoreFormFactor: bIgnoreFormFactor
            };
        } else {
            return oDeferred.reject("invalid arguments for getLinks").promise();
        }

        this._oInboundProvider.getInbounds().then(
            function (oInboundIndex) {
                that._getLinks(oCallArgs, oInboundIndex)
                    .done(oDeferred.resolve.bind(oDeferred))
                    .fail(oDeferred.reject.bind(oDeferred));
            },
            function () {
                oDeferred.reject.apply(oDeferred, arguments);
            }
        );
        return oDeferred.promise();
    };

    /**
     * Validate input arguments for <code>_getLinks</code> and log the first input validation error.
     *
     * @param {object} oArgs An object of nominal parameters.
     * @returns {string} An error message if validation was not successful or undefined in case of successful validation.
     * @private
     */
    ClientSideTargetResolution.prototype._validateGetSemanticObjectLinksArgs = function (oArgs) {
        var sSemanticObject = oArgs.semanticObject,
            sAction = oArgs.action,
            bIsPre138Call = !oArgs.hasOwnProperty("action"); // action always passed in ushell-lib 1.38.0+

        if (typeof sSemanticObject !== "undefined" || bIsPre138Call) {
            if (typeof sSemanticObject !== "string") {
                Log.error("invalid input for _getLinks",
                    "the semantic object must be a string, got " + Object.prototype.toString.call(sSemanticObject) + " instead",
                    "sap.ushell.services.ClientSideTargetResolution");
                return "invalid semantic object";
            }
            if (bIsPre138Call && sSemanticObject.match(/^\s+$/)) {
                Log.error("invalid input for _getLinks",
                    "the semantic object must be a non-empty string, got '" + sSemanticObject + "' instead",
                    "sap.ushell.services.ClientSideTargetResolution");
                return "invalid semantic object";
            }
            if (!bIsPre138Call && sSemanticObject.length === 0) {
                Log.error("invalid input for _getLinks",
                    "the semantic object must not be an empty string, got '" + sSemanticObject + "' instead",
                    "sap.ushell.services.ClientSideTargetResolution");
                return "invalid semantic object";
            }
        }
        if (typeof sAction !== "undefined") {
            if (typeof sAction !== "string") {
                Log.error("invalid input for _getLinks",
                    "the action must be a string, got " + Object.prototype.toString.call(sAction) + " instead",
                    "sap.ushell.services.ClientSideTargetResolution");
                return "invalid action";
            }
            if (sAction.length === 0) {
                Log.error("invalid input for _getLinks",
                    "the action must not be an empty string, got '" + sAction + "' instead",
                    "sap.ushell.services.ClientSideTargetResolution");
                return "invalid action";
            }
        }

        return undefined;
    };

    /**
     * Internal implementation of getLinks.
     *
     * @param {object} oArgs An object containing nominal parameters for getLinks like:
     *   <pre>
     *   {
     *     semanticObject: "...",       // optional
     *     action: "...",               // optional
     *     params: { ... },             // optional, note this is always passed in compact format, compatibly with URLParsing.paramsToString
     *                                  // See sap.ushell.services.CrossApplicationNavigation for information on extended format.
     *     paramsOptions: [             // optional
     *        { name: "A", required: true }
     *     ],
     *     appStateKey : string         // optional, better put into params!
     *     withAtLeastOneUsedParam: true, // allows to obtain only those links that, when resolved, would result in at least one
     *                                    // of the parameters from 'params' to be used in the target URL.
     *                                    // Note that by construction this parameter is effective when inbounds specify additionalParameters:
     *                                    // "ignored". In fact if additional parameters are allowed, these would be still be processed
     *                                    // (therefore used) when the navigation occurs.
     *     ignoreFormFactor: true|false // optional, defaults to true
     *   }
     *   </pre>
     * @param {object} oInboundIndex An inbound index to retrieve the get semantic object links from.
     * @returns {object[]} An array of link objects containing (at least) the following properties:
     *   <pre>
     *   {
     *     intent: "#AnObject-Action?A=B&C=e&C=j",
     *     text: "Perform action",
     *     icon: "sap-icon://Fiori2/F0018", // optional
     *     subTitle: "Action"               // optional
     *     shortTitle: "Perform"            // optional
     *   }
     *   </pre>
     * @private
     */
    ClientSideTargetResolution.prototype._getLinks = function (oArgs, oInboundIndex) {
        var sSemanticObject = oArgs.semanticObject,
            sAction = oArgs.action,
            mParameters = oArgs.params,
            bWithAtLeastOneUsedParam = !!oArgs.withAtLeastOneUsedParam,
            bTreatTechHintAsFilter = !!oArgs.treatTechHintAsFilter,
            bIgnoreFormFactor = oArgs.ignoreFormFactor,
            sSortProperty = oArgs.hasOwnProperty("sortResultsBy")
                ? oArgs.sortResultsBy
                : "intent";

        if (oArgs.hasOwnProperty("sortResultOnTexts")) {
            Log.warning(
                "the parameter 'sortResultOnTexts' was experimental and is no longer supported",
                "getLinks results will be sorted by '" + sSortProperty + "'",
                "sap.ushell.services.ClientSideTargetResolution"
            );
        }

        var oInboundsConstraints = { bExcludeTileInbounds: true };

        var sErrorMessage = this._validateGetSemanticObjectLinksArgs(oArgs);

        if (oArgs.tags) {
            oInboundsConstraints.tags = oArgs.tags;
        }

        if (sErrorMessage) {
            return new jQuery.Deferred().reject(sErrorMessage).promise();
        }

        if (sSemanticObject === "*") {
            // shortcut: skip matching inbounds and return directly; it can only match "*" and we don't return it anyway
            return jQuery.when([]);
        }

        /*
         * Returns ?-prefixed business parameters
         */
        function fnConstructBusinessParamsString (mParams) {
            var sBusinessParams = UrlParsing.paramsToString(mParams);
            return sBusinessParams ? "?" + sBusinessParams : "";
        }

        var oDeferred = new jQuery.Deferred(),
            sFormFactor = UshellUtils.getFormFactor(),
            oAllIntentParams = UrlParsing.parseParameters(fnConstructBusinessParamsString(mParameters)),
            oShellHash = {
                semanticObject: (sSemanticObject === "" ? undefined : sSemanticObject),
                action: sAction, // undefined: match all actions
                formFactor: (
                    bIgnoreFormFactor
                        ? undefined // match any form factor
                        : sFormFactor
                ),
                params: oAllIntentParams
            };
        if (bTreatTechHintAsFilter) {
            oShellHash.treatTechHintAsFilter = true;
        }

        this._getMatchingInbounds(oShellHash, oInboundIndex, oInboundsConstraints)
            .done(function (aMatchingTargets) {
                var oUniqueIntents = {},
                    aResults = aMatchingTargets.map(function (oMatchResult) {
                        var sAdjustedSemanticObject = sSemanticObject || oMatchResult.inbound.semanticObject,
                            sIntent = "#" + sAdjustedSemanticObject + "-" + oMatchResult.inbound.action,
                            oNeededParameters;

                        // we never return "*" semantic objects from getLinks as they are not parsable links
                        if (sAdjustedSemanticObject === "*") {
                            return undefined;
                        }

                        // we never want to return "*" actions from getLinks as they are non parsable links
                        if (oMatchResult.inbound.action === "*") {
                            return undefined;
                        }

                        if (oMatchResult.inbound && oMatchResult.inbound.hasOwnProperty("hideIntentLink") && oMatchResult.inbound.hideIntentLink === true) {
                            return undefined;
                        }

                        if (!oUniqueIntents.hasOwnProperty(sIntent)) {
                            oUniqueIntents[sIntent] = {
                                matchingInbound: oMatchResult.inbound,
                                count: 1
                            };

                            if (oMatchResult.inbound.signature.additionalParameters === "ignored") {
                                // in the result do not show all intent parameters, but only those mentioned by the inbound
                                oNeededParameters = _Utils.filterObjectKeys(oAllIntentParams, function (sIntentParam) {
                                    return (sIntentParam.indexOf("sap-") === 0) ||
                                        oMatchResult.inbound.signature.parameters.hasOwnProperty(sIntentParam);
                                }, false);
                            } else {
                                oNeededParameters = oAllIntentParams;
                            }

                            // --- begin of post-match reject reasons

                            if (bWithAtLeastOneUsedParam) {
                                var bAtLeastOneNonSapParam = Object.keys(oNeededParameters).some(function (sNeededParamName) {
                                    return sNeededParamName.indexOf("sap-") !== 0;
                                });
                                if (!bAtLeastOneNonSapParam) {
                                    oUniqueIntents[sIntent].hideReason = "getLinks called with 'withAtLeastOneUsedParam = true', but the inbound had no business parameters defined.";
                                    return undefined;
                                }
                            }

                            var bSignatureMeetsParameterOptions = _Utils.inboundSignatureMeetsParameterOptions(
                                oMatchResult.inbound.signature.parameters,
                                oArgs.paramsOptions || []
                            );
                            if (!bSignatureMeetsParameterOptions) {
                                oUniqueIntents[sIntent].hideReason = "inbound signature does not meet the requested parameter filter options";
                                return undefined;
                            }

                            // --- end of post-match reject reasons

                            var oResult = {
                                intent: sIntent + fnConstructBusinessParamsString(oNeededParameters),
                                text: oMatchResult.inbound.title
                            };

                            if (oMatchResult.inbound.icon) {
                                oResult.icon = oMatchResult.inbound.icon;
                            }
                            if (oMatchResult.inbound.subTitle) {
                                oResult.subTitle = oMatchResult.inbound.subTitle;
                            }
                            if (oMatchResult.inbound.shortTitle) {
                                oResult.shortTitle = oMatchResult.inbound.shortTitle;
                            }

                            var sInboundTag = ObjectPath.get("inbound.signature.parameters.sap-tag.defaultValue.value", oMatchResult);
                            if (sInboundTag) {
                                oResult.tags = [sInboundTag];
                            }

                            return oResult;
                        }
                        // for debugging purposes
                        oUniqueIntents[sIntent].count++;

                        return undefined;
                    }).filter(function (oSemanticObjectLink) {
                        return typeof oSemanticObjectLink === "object";
                    });

                if (sSortProperty !== "priority") {
                    aResults.sort(function (oGetSoLinksResult1, oGetSoLinksResult2) {
                        return oGetSoLinksResult1[sSortProperty] < oGetSoLinksResult2[sSortProperty] ? -1 : 1;
                    });
                }

                if (aResults.length === 0) {
                    Log.debug("_getLinks returned no results");
                } else if (Log.getLevel() >= Log.Level.DEBUG) {
                    if (Log.getLevel() >= Log.Level.TRACE) {
                        var aResultLines = [];
                        var aHiddenResultLines = [];

                        aResults.forEach(function (oResult) {
                            var sIntent = oResult.intent.split("?")[0];

                            if (oUniqueIntents[sIntent].hideReason) {
                                aHiddenResultLines.push([
                                    "-", sIntent + "(" + oUniqueIntents[sIntent].hideReason + ")\n",
                                    " text:", oResult.text + "\n",
                                    " full intent:", oResult.intent
                                ].join(" "));
                            } else {
                                aResultLines.push([
                                    "-", sIntent,
                                    oUniqueIntents[sIntent].count > 1
                                        ? "(" + (oUniqueIntents[sIntent].count - 1) + " others matched)\n"
                                        : "\n",
                                    "text:", oResult.text + "\n",
                                    "full intent:", oResult.intent
                                ].join(" "));
                            }
                        });

                        Log.debug(
                            "_getLinks filtered to the following unique intents:",
                            "\n" + aResultLines.join("\n"),
                            "sap.ushell.services.ClientSideTargetResolution"
                        );

                        Log.debug(
                            "_getLinks would have also returned the following unique intents, but something prevented this:",
                            aHiddenResultLines.join("\n"),
                            "sap.ushell.services.ClientSideTargetResolution"
                        );
                    } else {
                        Log.debug(
                            "_getLinks filtered to unique intents.",
                            "Reporting histogram: \n - " + Object.keys(oUniqueIntents).join("\n - "),
                            "sap.ushell.services.ClientSideTargetResolution"
                        );
                    }
                }
                oDeferred.resolve(aResults);
            })
            .fail(oDeferred.reject.bind(oDeferred));

        return oDeferred.promise();
    };

    /**
     * Matches the given resolved shell hash against all the inbounds.
     *
     * @param {object} oShellHash The resolved hash fragment. This is an object like:
     *   <pre>
     *   {
     *     semanticObject: "SomeSO" // or undefined
     *     action: "someAction"     // or undefined
     *     formFactor: "desktop"    // or tablet, phone, or undefined
     *     params: {
     *       name: ["value"],
     *       ...
     *     }
     *   }
     *   </pre>
     *   where <code>undefined</code> value represent wildcards.
     * @param {object} oInboundIndex An inbound index to match the intent against.
     * @param {object} [oConstraints] Constraints object.
     * @param {boolean} [oConstraints.bExcludeTileInbounds] Whether the tile inbounds should be filtered out during matching.
     *   Defaults to <code>false</code>. Tile inbounds can be distinguished by other inbounds because they specify the following:
     *   <pre>
     *   {
     *     ...
     *     tileResolutionResult: { isCustomTile: true }
     *     ...
     *   }
     *   </pre>
     * @param {string[]} [oConstraints.tags] Tags to which the queried inbounds should belong to.
     * @returns {jQuery.Promise[]} A sorted array of matching targets.
     *   A target is a matching result that in addition has a specific priority with respect to other matching targets.
     * @private
     * @since 1.32.0
     */
    ClientSideTargetResolution.prototype._getMatchingInbounds = function (oShellHash, oInboundIndex, oConstraints) {
        var that = this,
            aTags,
            sAction,
            iLogId,
            aInbounds,
            sSemanticObject,
            bExcludeTileInbounds,
            aPreFilteredInbounds,
            oDeferred = new jQuery.Deferred();

        if (oConstraints) {
            aTags = oConstraints.tags;
            bExcludeTileInbounds = oConstraints.bExcludeTileInbounds;
        }

        if (Log.getLevel() >= Log.Level.DEBUG) {
            iLogId = ++that._iLogId;
        }

        _StagedLogger.begin(function () {
            // This function exists because wildcards (represented with undefined) break URLParsing#constructShellHash.
            // URLParsing wants a valid semantic object/action to produce correct output.
            function constructShellHashForLogging (oMaybeWildcardedHash) {
                var sActionExplicit = oMaybeWildcardedHash.action || (
                    typeof oMaybeWildcardedHash.action === "undefined"
                        ? "<any>"
                        : "<invalid-value>"
                );

                var sSemanticObjectExplicit = oMaybeWildcardedHash.semanticObject || (
                    typeof oMaybeWildcardedHash.semanticObject === "undefined"
                        ? "<any>"
                        : "<invalid-value>"
                );

                return UrlParsing.constructShellHash({
                    semanticObject: sSemanticObjectExplicit,
                    action: sActionExplicit,
                    params: oMaybeWildcardedHash.params
                });
            }

            var sIntent = constructShellHashForLogging(oShellHash);

            return {
                logId: iLogId,
                title: "Matching Intent '" + sIntent + "' to inbounds (form factor: " + (oShellHash.formFactor || "<any>") + ")",
                moduleName: "sap.ushell.services.ClientSideTargetResolution",
                stages: [
                    "STAGE1: Find matching inbounds",
                    "STAGE2: Resolve references",
                    "STAGE3: Rematch with references",
                    "STAGE4: Sort matched targets"
                ]
            };
        });

        sSemanticObject = oShellHash.semanticObject;
        sAction = oShellHash.action;
        this._oShellHash = oShellHash;

        // oInboundIndex.getSegment called with second argument 'sAction' although it accepts only one.
        // The test on the method in question does not test calls with 2 arguments. Does this call indicate a desirable we should implement?
        aInbounds = aTags ? oInboundIndex.getSegmentByTags(aTags) : oInboundIndex.getSegment(sSemanticObject, sAction);

        // logic that filters independently on the target to be matched goes here
        if (bExcludeTileInbounds) {
            aPreFilteredInbounds = aInbounds.filter(function (oInbound) {
                // keep all non custom tiles
                return !oInbound.tileResolutionResult || !oInbound.tileResolutionResult.isCustomTile;
            });
        } else {
            aPreFilteredInbounds = aInbounds;
        }

        var fnGetContentProviderLookup = null;
        if (this._oAdapter.getContentProviderDataOriginsLookup) {
            fnGetContentProviderLookup = this._oAdapter.getContentProviderDataOriginsLookup.bind(this._oAdapter);
        }

        // initial match
        _Search
            .match(oShellHash, aPreFilteredInbounds, {} /* known default */, fnGetContentProviderLookup, Log.getLevel() >= Log.Level.DEBUG)
            .then(function (oInitialMatchResult) {
                // resolve References

                _StagedLogger.log(function () {
                    return {
                        logId: iLogId,
                        stage: 1,
                        prefix: "\u2718", // heavy black X
                        lines: Object.keys(oInitialMatchResult.noMatchReasons || {}).map(function (sInbound) {
                            return sInbound + " " + oInitialMatchResult.noMatchReasons[sInbound];
                        })
                    };
                });

                _StagedLogger.log(function () {
                    var aLines = oInitialMatchResult.matchResults.map(function (oMatchResult) {
                        return _Formatter.formatInbound(oMatchResult.inbound);
                    });
                    return {
                        logId: iLogId,
                        stage: 1,
                        prefix: aLines.length > 0
                            ? "\u2705" // green checkmark
                            : "\u2718", // heavy black X
                        lines: aLines.length > 0
                            ? aLines
                            : ["No inbound was matched"]
                    };
                });

                var oMissingReferences = {};
                var bNeedToResolve = false;
                var aContentProviders = Object.keys(oInitialMatchResult.missingReferences);
                aContentProviders.forEach(function (sContentProviderId) {
                    var aReferences = Object.keys(oInitialMatchResult.missingReferences[sContentProviderId]);
                    bNeedToResolve = bNeedToResolve || aReferences.length > 0;
                    oMissingReferences[sContentProviderId] = aReferences;
                });

                aContentProviders = aContentProviders.filter(function (sContentProviderId) {
                    if (oMissingReferences[sContentProviderId].length > 0) {
                        return true;
                    }
                    delete oMissingReferences[sContentProviderId];
                    return false;
                });

                // no references to resolve
                if (!bNeedToResolve) {
                    _StagedLogger.log(function () {
                        return {
                            logId: iLogId,
                            stage: 2,
                            prefix: "\u2705", // green checkmark
                            line: "No need to resolve references"
                        };
                    });

                    return new jQuery.Deferred().resolve({
                        matchResults: oInitialMatchResult.matchResults,
                        referencesToInclude: null
                    }).promise();
                }

                // must resolve references
                aContentProviders.forEach(function (sContentProviderId) {
                    _StagedLogger.log(function () {
                        return {
                            logId: iLogId,
                            stage: 2,
                            line: "@ Must resolve the following references with contentProviderId = \"" + sContentProviderId + "\":",
                            prefix: "\u2022", // bullet point
                            lines: oMissingReferences[sContentProviderId]
                        };
                    });
                });

                var oReadyToRematchDeferred = new jQuery.Deferred();
                sap.ushell.Container.getServiceAsync("ReferenceResolver")
                    .then(function (oReferenceResolver) {
                        var aSystemContextPromises = aContentProviders.map(function (sContentProviderId) {
                            return this.getSystemContext(sContentProviderId);
                        }.bind(this));
                        return Promise.all(aSystemContextPromises)
                            .then(function (aSystemContexts) {
                                var aReferencePromises = aContentProviders.map(function (sContentProviderId, iIndex) {
                                    return new Promise(function (resolve, reject) {
                                        oReferenceResolver.resolveReferences(oMissingReferences[sContentProviderId], aSystemContexts[iIndex])
                                            .done(resolve)
                                            .fail(reject);
                                    });
                                });
                                return Promise.all(aReferencePromises);
                            });
                    }.bind(this))
                    .then(function (aResolvedRefs) {
                        var oResult = {
                            matchResults: oInitialMatchResult.matchResults,
                            referencesToInclude: {}
                        };
                        aContentProviders.forEach(function (sContentProviderId, iIndex) {
                            var oResolvedRefs = aResolvedRefs[iIndex];
                            oResult.referencesToInclude[sContentProviderId] = oResolvedRefs;
                            if (Object.keys(oResolvedRefs).length > 0) {
                                _StagedLogger.log(function () {
                                    return {
                                        logId: iLogId,
                                        stage: 2,
                                        line: "\u2705 resolved references with contentProviderId = \"" + sContentProviderId + "\" to the following values:",
                                        prefix: "\u2022", // bullet point
                                        lines: Object.keys(oResolvedRefs).map(function (sRefName) {
                                            return sRefName + ": '" + oResolvedRefs[sRefName] + "'";
                                        })
                                    };
                                });
                            }
                        });
                        oReadyToRematchDeferred.resolve(oResult);
                    })
                    .catch(function (sError) {
                        _StagedLogger.log(function () {
                            return {
                                logId: iLogId,
                                stage: 2,
                                prefix: "\u274c", // red X
                                line: "Failed to resolve references: " + sError
                            };
                        });

                        // don't continue processing, just exit with an empty result set
                        oDeferred.resolve([]);
                    });
                return oReadyToRematchDeferred.promise();
            }.bind(this))
            .then(function (oInitialMatchWithReferencesResult) {
                // re-match with resolved references

                var aMatchingInbounds,
                    aMatchResults,
                    oReferences = oInitialMatchWithReferencesResult.referencesToInclude;

                if (!oReferences) {
                    _StagedLogger.log(function () {
                        return {
                            logId: iLogId,
                            stage: 3,
                            line: "rematch was skipped (no references to resolve)",
                            prefix: "\u2705" // green checkmark
                        };
                    });
                    // no references, skip re-match
                    return new jQuery.Deferred().resolve(oInitialMatchWithReferencesResult).promise();
                }

                // rematch using the set of the already matched inbounds
                aMatchResults = oInitialMatchWithReferencesResult.matchResults;
                aMatchingInbounds = aMatchResults.map(function (oMatchResult) {
                    return oMatchResult.inbound;
                });

                return _Search.match(oShellHash, aMatchingInbounds, oReferences, fnGetContentProviderLookup, 0 /* iDebugLevel */).then(function (oFinalMatchResult) {
                    _StagedLogger.log(function () {
                        var aMatchResults = oFinalMatchResult.matchResults || [];
                        if (aMatchResults.length >= 1) {
                            return {
                                logId: iLogId,
                                stage: 3,
                                line: "The following inbounds re-matched:",
                                lines: aMatchResults.map(function (oMatchResult) {
                                    return _Formatter.formatInbound(oMatchResult.inbound);
                                }),
                                prefix: "\u2705" // green checkmark
                            };
                        }

                        return {
                            logId: iLogId,
                            stage: 3,
                            line: "No inbounds re-matched",
                            prefix: "-"
                        };
                    });

                    return oFinalMatchResult;
                });
            })
            .then(function (oFinalMatchResult) {
                // sorting

                var aMatchResultsToSort = oFinalMatchResult.matchResults || [];
                if (aMatchResultsToSort.length <= 1) {
                    _StagedLogger.log(function () {
                        return {
                            logId: iLogId,
                            stage: 4,
                            line: "Nothing to sort"
                        };
                    });

                    oDeferred.resolve(aMatchResultsToSort);
                    return;
                }

                var aSortedMatchResults = _Search.sortMatchingResultsDeterministic(oFinalMatchResult.matchResults || []);

                _StagedLogger.log(function () {
                    var aLines = aSortedMatchResults.map(function (oMatchResult) {
                        return _Formatter.formatInbound(oMatchResult.inbound || {}) +
                            (oMatchResult.matchesVirtualInbound ? " (virtual)" : "")
                            + "\n[ Sort Criteria ] "
                            + "\n * 1 * sap-priority: '" + oMatchResult["sap-priority"] + "'"
                            + "\n * 2 * Sort string: '" + oMatchResult.priorityString
                            + "\n * 3 * Deterministic blob: '" + _Search.serializeMatchingResult(oMatchResult) + "'";
                    });

                    return {
                        logId: iLogId,
                        stage: 4,
                        line: "Sorted inbounds as follows:",
                        lines: aLines,
                        prefix: ".",
                        number: true
                    };
                });

                oDeferred.resolve(aSortedMatchResults);
            });

        return oDeferred.promise().then(function (aMatchResults) {
            // output logs before returning
            _StagedLogger.end(function () {
                return { logId: iLogId };
            });
            return aMatchResults;
        });
    };

    /**
     * Determines whether a single intent matches one or more navigation targets.
     *
     * @param {string} sIntent The intent to be matched.
     * @param {object} oInboundIndex The index of the inbounds to be matched.
     * @returns {jQuery.Deferred.promise} A promise that is resolved with a boolean if the intent is supported and rejected if not.
     *   The promise resolves to true if only one target matches the intent, and false if multiple targets match the intent.
     * @private
     * @since 1.32.0
     */
    ClientSideTargetResolution.prototype._isIntentSupportedOne = function (sIntent, oInboundIndex) {
        var oDeferred = new jQuery.Deferred(),
            oShellHash = UrlParsing.parseShellHash(sIntent);
        // navigation to '#' is always considered possible
        if (sIntent === "#") {
            oDeferred.resolve(true);
            return oDeferred.promise();
        }
        if (oShellHash === undefined) {
            return oDeferred.reject("Could not parse shell hash '" + sIntent + "'").promise();
        }

        oShellHash.formFactor = UshellUtils.getFormFactor();

        this._getMatchingInbounds(oShellHash, oInboundIndex, { bExcludeTileInbounds: true })
            .done(function (aTargets) {
                oDeferred.resolve(aTargets.length > 0);
            })
            .fail(function () {
                oDeferred.reject();
            });

        return oDeferred.promise();
    };

    /**
     * Tells whether the given intent(s) are supported, taking into account the form factor of the current device.
     * "Supported" means that navigation to the intent is possible.
     *
     * @param {string[]} aIntents The intents (such as <code>"#AnObject-Action?A=B&C=e&C=j"</code>) to be checked.
     * @returns {object} A <code>jQuery.Deferred</code> object's promise which is resolved with a map containing the intents from
     *   <code>aIntents</code> as keys. The map values are objects with a property <code>supported</code> of type <code>boolean</code>.
     *   Example:
     *   <pre>
     *   {
     *     "#AnObject-Action?A=B&C=e&C=j": { supported: false },
     *     "#AnotherObject-Action2": { supported: true }
     *   }
     *   </pre>
     * @private
     * @since 1.32.0
     */
    ClientSideTargetResolution.prototype.isIntentSupported = function (aIntents) {
        var that = this,
            oDeferred = new jQuery.Deferred();

        this._oInboundProvider.getInbounds().then(
            function (oInboundIndex) {
                that._isIntentSupported(aIntents, oInboundIndex)
                    .done(oDeferred.resolve.bind(oDeferred))
                    .fail(oDeferred.reject.bind(oDeferred));
            },
            function () {
                oDeferred.reject.apply(oDeferred, arguments);
            }
        );
        return oDeferred.promise();
    };

    ClientSideTargetResolution.prototype._isIntentSupported = function (aIntents, oInboundIndex) {
        var that = this,
            oDeferred = new jQuery.Deferred(),
            mSupportedByIntent = {};

        oDeferred.resolve();

        /**
         * Sets the result for the given intent as indicated.
         *
         * @param {string} sIntent
         * @param {boolean} bSupported
         */
        function setResult (sIntent, bSupported) {
            mSupportedByIntent[sIntent] = {
                supported: bSupported
            };
        }

        var aRejectErrors = [];

        aIntents.forEach(function (sIntent) {
            var oNextPromise = that._isIntentSupportedOne(sIntent, oInboundIndex);
            oNextPromise.fail(function (sErrorMessage) {
                aRejectErrors.push(sErrorMessage);
            });
            oNextPromise.done(function (bResult) {
                setResult(sIntent, bResult);
            });
            oDeferred = jQuery.when(oDeferred, oNextPromise);
        });

        var oRes = new jQuery.Deferred();
        oDeferred.done(function () {
            oRes.resolve(mSupportedByIntent);
        }).fail(function () {
            oRes.reject("One or more input intents contain errors: " + aRejectErrors.join(", "));
        });

        return oRes.promise();
    };

    /**
     * Finds and returns all unique user default parameter names referenced in inbounds.
     *
     * @param {object} oSystemContext The systemContext for which the user default parameter names should be returned.
     * @returns {jQuery.Deferred.promise} A promise that resolves to an object with the following structure
     * <pre>
     *   {
     *     simple: {
     *       parameternamextractUserDefaultReferenceNamee1: {},
     *       parametername2: {}
     *     }
     *     extended: {
     *       parametername3: {},
     *       parametername4: {}
     *     }
     *   }
     * </pre>
     *   The name of a user default parameter referenced in an inbound.
     *   NOTE: the parameter names do not include surrounding special syntax. Only the inner part is returned.
     *   For example: "UserDefault.ParameterName" is returned as "ParameterName"
     * @private
     * @since 1.32.0
     */
    ClientSideTargetResolution.prototype.getUserDefaultParameterNames = function (oSystemContext) {
        // the empty objects may in future bear information like sap-system relevance
        var that = this,
            oDeferred = new jQuery.Deferred();

        this._oInboundProvider.getInbounds().then(

            function (oInboundIndex) {
                that._getUserDefaultParameterNames(oInboundIndex.getAllInbounds(), oSystemContext)
                    .then(
                        function (oRef) {
                            oDeferred.resolve(oRef);
                        },
                        function (e) {
                            oDeferred.reject("Cannot get user default parameters from inbounds: " + e);
                        }
                    );
            },
            function () {
                oDeferred.reject.apply(oDeferred, arguments);
            }
        );
        return oDeferred.promise();
    };

    ClientSideTargetResolution.prototype._getUserDefaultParameterNames = function (aInbounds, oSystemContext) {
        var oRefs = {
            simple: {},
            extended: {}
        };

        aInbounds = aInbounds.filter(function (oInb) {
            if (oInb.contentProviderId === undefined && oSystemContext.id === "") {
                return true;
            }
            return oInb.contentProviderId === oSystemContext.id;
        });
        return sap.ushell.Container.getServiceAsync("ReferenceResolver")
            .then(function (oRefResolverService) {
                aInbounds.forEach(function (oTm) {
                    var oSignatureParams = oTm.signature && oTm.signature.parameters || [];

                    Object.keys(oSignatureParams).forEach(function (sParamName) {
                        var oParam = oSignatureParams[sParamName],
                            sRefName,
                            sExtendedRefName,
                            sReferenceParamName;

                        if (oParam) {
                            // first try to get the user default value from the filter

                            if (oParam.filter && oParam.filter.format === "reference") {
                                sReferenceParamName = oParam.filter.value;
                            } else if (oParam.defaultValue && oParam.defaultValue.format === "reference") {
                                sReferenceParamName = oParam.defaultValue.value;
                            }

                            if (typeof sReferenceParamName === "string") {
                                // only extract user defaults
                                sRefName = oRefResolverService.extractUserDefaultReferenceName(sReferenceParamName);
                                if (typeof sRefName === "string") {
                                    oRefs.simple[sRefName] = {};
                                }
                                sExtendedRefName = oRefResolverService.extractExtendedUserDefaultReferenceName(sReferenceParamName);
                                if (typeof sExtendedRefName === "string") {
                                    oRefs.extended[sExtendedRefName] = {};
                                }
                            }
                        }
                    });
                });
                return oRefs;
            });


    };

    /**
     * Returns the list of easy access systems provided via specific inbounds.
     *
     * The admin can define one or more of <code>Shell-start*</code> inbounds.
     * In case multiple <code>Shell-start*</code> inbounds are defined with the same system alias,
     * the title will be chosen from the inbound with the most priority, which is as follows:
     * <ol>
     *   <li>Shell-startGUI</li>
     *   <li>Shell-startWDA</li>
     *   <li>Shell-startURL</li>
     * </ol>
     *
     * @param {string} [sMenuType=sapMenu] The type of menu to return the entries for. This can be one of "userMenu" or "sapMenu".
     *   If this parameter is not specified, just the entries for the sap menu will be returned for the sap menu are returned.
     * @returns {jQuery.Deferred.promise} Returns a promise that resolves with an object containing the systems:
     *   <pre>
     *   {
     *     <system alias {string}>: { text: <text to be displayed in the system list {string}> }
     *   }
     *   </pre>
     *   Example:
     *   <pre>
     *   {
     *     AB1CLNT000: {
     *       text: "CRM Europe",
     *       appType: {
     *         WDA: true,
     *         GUI: true,
     *         URL: true
     *       }
     *     }
     *   }
     *   </pre>
     * @private
     * @since 1.38.0
     */
    ClientSideTargetResolution.prototype.getEasyAccessSystems = function (sMenuType) {
        var oResultEasyAccessSystemSet = {}, // see @returns example in JSDOC
            oActionDefinitions,
            oValidMenuTypeIntents,
            oDeferred;

        // default
        sMenuType = sMenuType || "sapMenu";

        if (this._oHaveEasyAccessSystemsDeferreds[sMenuType]) {
            return this._oHaveEasyAccessSystemsDeferreds[sMenuType].promise();
        }
        this._oHaveEasyAccessSystemsDeferreds[sMenuType] = new jQuery.Deferred();
        oDeferred = this._oHaveEasyAccessSystemsDeferreds[sMenuType]; // shorter name

        function isValidEasyAccessMenuInbound (oInbound, sCurrentFormFactor, oValidMenuTypeIntents) {
            if (!oInbound) {
                return false;
            }
            var sIntent = [oInbound.semanticObject, oInbound.action].join("-");
            return oValidMenuTypeIntents[sMenuType][sIntent] && oInbound.deviceTypes && sCurrentFormFactor !== undefined && oInbound.deviceTypes[sCurrentFormFactor];
        }

        oActionDefinitions = ApplicationType.getEasyAccessMenuDefinitions().reduce(function (oReducibleActionDefs, oEasyAccessMenuDefinition) {
            var sEasyAccessMenuAction = oEasyAccessMenuDefinition.easyAccessMenu.intent.split("-")[1];
            oReducibleActionDefs[sEasyAccessMenuAction] = {
                appType: oEasyAccessMenuDefinition.type,
                priority: oEasyAccessMenuDefinition.easyAccessMenu.systemSelectionPriority
            };

            return oReducibleActionDefs;
        }, {});

        oValidMenuTypeIntents = {
            // list all the systems that should be considered in the userMenu
            userMenu: ApplicationType.getEasyAccessMenuDefinitions().reduce(function (oUserMenuEntries, oEasyAccessMenuDefinition) {
                var sEasyAccessMenuIntent = oEasyAccessMenuDefinition.easyAccessMenu.intent;
                oUserMenuEntries[sEasyAccessMenuIntent] = oEasyAccessMenuDefinition.easyAccessMenu.showSystemSelectionInUserMenu;

                return oUserMenuEntries;
            }, {}),
            // list all the systems that should be considered in the sapMenu
            sapMenu: ApplicationType.getEasyAccessMenuDefinitions().reduce(function (oSapMenuEntries, oEasyAccessMenuDefinition) {
                var sEasyAccessMenuIntent = oEasyAccessMenuDefinition.easyAccessMenu.intent;
                oSapMenuEntries[sEasyAccessMenuIntent] = oEasyAccessMenuDefinition.easyAccessMenu.showSystemSelectionInSapMenu;

                return oSapMenuEntries;
            }, {})
        };

        this._oInboundProvider.getInbounds().then(
            function (oInboundIndex) { // all inbounds, no segments
                var oLastPriorityPerSystem = {};

                oInboundIndex.getAllInbounds().filter(function (oInbound) {
                    return isValidEasyAccessMenuInbound(
                        oInbound, UshellUtils.getFormFactor(), oValidMenuTypeIntents
                    );
                }).forEach(function (oEasyAccessInbound) {
                    // extract the data for the easy access system list
                    var sSystemAliasName;
                    if (fnIsPlainObject(oEasyAccessInbound.signature.parameters["sap-system"]) &&
                        oEasyAccessInbound.signature.parameters["sap-system"].hasOwnProperty("filter")) {
                        sSystemAliasName = ObjectPath.get("signature.parameters.sap-system.filter.value", oEasyAccessInbound);
                    }

                    if (typeof sSystemAliasName === "string") {
                        /*
                        Code below builds the set of easy access system that should be displayed in the sapMenu/userMenu.
                        In case multiple inbounds exist with a certain system,
                        the app type with the highest priority is used to choose the title (see oActionDefinitions above).
                        Note that other app types should still appear in the result set (see 'appType' in the example result from jsdoc).
                        */
                        var iCurrentActionPriority = oActionDefinitions[oEasyAccessInbound.action].priority;
                        var sCurrentActionAppType = oActionDefinitions[oEasyAccessInbound.action].appType;

                        if (!oResultEasyAccessSystemSet[sSystemAliasName]) {
                            // provide base structure...
                            oLastPriorityPerSystem[sSystemAliasName] = -1;
                            oResultEasyAccessSystemSet[sSystemAliasName] = {
                                appType: {}
                            };
                        }

                        if (oLastPriorityPerSystem[sSystemAliasName] < iCurrentActionPriority) {
                            // ...then populate in case
                            oResultEasyAccessSystemSet[sSystemAliasName].text = oEasyAccessInbound.title;
                            oLastPriorityPerSystem[sSystemAliasName] = iCurrentActionPriority;
                        }

                        // keep track of all the app types
                        oResultEasyAccessSystemSet[sSystemAliasName].appType[sCurrentActionAppType] = true;
                    } else {
                        Log.warning(
                            "Cannot extract sap-system from easy access menu inbound: " + _Formatter.formatInbound(oEasyAccessInbound),
                            "This parameter is supposed to be a string. Got '" + sSystemAliasName + "' instead.",
                            "sap.ushell.services.ClientSideTargetResolution"
                        );
                    }
                });
                oDeferred.resolve(oResultEasyAccessSystemSet);
            },
            function () {
                oDeferred.reject.apply(oDeferred, arguments);
            }
        );
        return oDeferred.promise();
    };

    /**
     * @typedef {object} SystemContext An object representing the context of a system.
     * @property {function} getFullyQualifiedXhrUrl A function that returns a URL to issue XHR requests to a service endpoint
     *   (existing on a specific system) starting from the path to a service endpoint (existing on all systems).
     *   The given path should not be fully qualified. Any fully qualified path will be returned unchanged
     *   to support cases where the caller does not control the path (e.g. path argument coming from external data),
     *   or a request should be issued to a specific system in the context of the current system.
     */

    /**
     * Returns the systemContext of a given contentProvider.
     *
     * @param {string} [systemId] The id of the contentProvider of which the system context should be returned.
     * @returns {Promise<SystemContext>} Resolves to the systemContext of the given systemId.
     * @private
     * @since 1.78.0
     */
    ClientSideTargetResolution.prototype.getSystemContext = function (systemId) {
        var sSystemId = systemId === undefined ? "" : systemId;

        return new Promise(function (resolve, reject) {
            var oSystemContext;
            this._oAdapter.resolveSystemAlias(sSystemId)
                .done(function (oResolvedSystemAlias) {
                    oSystemContext = _SystemContext.createSystemContextFromSystemAlias(oResolvedSystemAlias);
                    resolve(oSystemContext);
                })
                .fail(function (oError) {
                    reject(oError);
                });
        }.bind(this));
    };

    ClientSideTargetResolution.hasNoAdapter = false;
    return ClientSideTargetResolution;
}, true /* bExport */);
