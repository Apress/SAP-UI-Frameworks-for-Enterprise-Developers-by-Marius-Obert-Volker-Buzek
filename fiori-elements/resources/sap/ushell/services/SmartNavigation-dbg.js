// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview
 *
 * <p>Enhanced provider of application navigation, and available navigation targets.<p>
 *
 * <p>Defines a service that provides a <code>getLinks()</code> method which complements the one provided by
 * CrossApplicationNavigation service by sorting the resulting list in the order of relevance to the calling application.</p>
 *
 * <p>Note that in order to effectively leverage the enhanced <code>getLinks()</code> method provided by this service,
 * it is pertinent that the API user employs this service's version of <code>toExternal()</code> for cross application
 * navigation (instead) of using the one provided by CrossApplicationNavigation service.</p>
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ushell/utils",
    "sap/ushell/services/AppConfiguration",
    "sap/base/Log",
    "sap/ushell/utils/UrlParsing"
], function (
    jQuery,
    utils,
    AppConfiguration,
    Log,
    UrlParsing
) {
    "use strict";

    /**
     * Constructs an instance of SmartNavigation.
     *
     * <p>
     * The constructed service provides an enhancement on {@link CrossApplicationNavigation#getLinks} and
     * {@link CrossApplicationNavigation#toExternal}. In order for an application to leverage this enhancement,
     * it is pertinent that the application uses {@link SmartNavigation#toExternal} for navigation.
     * Hence the caller can subsequently use {@link SmartNavigation#getLinks} with the outcome that it sorts the
     * resulting list in the order of frequency of <i>attempted</i> navigation from the application to respective links.
     * <p>
     * <i>Attempted</i> in the previous paragraph is emphasized due to the fact that a click on the link
     * will cause an increment of the frequency count, regardless of whether or not the navigation was successful.
     * <p>
     * Note that an instance of this service should only be obtained via <code>sap.ushell.services.Container#getServiceAsync("SmartNavigation").then(function (SmartNavigation) {});</code>
     * @see sap.ushell.services.Container#getServiceAsync
     *
     * @name sap.ushell.services.SmartNavigation
     * @constructor
     * @public
     * @deprecated since 1.112. This service has been deprecated. Please use the CrossApplicationNavigation service instead.
     * @since 1.44.0
     */
    function SmartNavigation (oContainerInterface, sParameters, oServiceConfig) {
        this._oServiceConfig = oServiceConfig;

        this._oCrossAppNavigationServicePromise = sap.ushell.Container.getServiceAsync("CrossApplicationNavigation");
        this._oPersonalizationServicePromise = sap.ushell.Container.getServiceAsync("Personalization");

        this._oHashCodeCache = { "": 0 };
    }

    SmartNavigation.STATISTIC_COLLECTION_WINDOW_DAYS = 90;
    SmartNavigation.PERS_CONTAINER_KEY_PREFIX = "ushell.smartnav.";
    SmartNavigation.ONE_DAY_IN_MILLISECOND = 24 * 60 * 60 * 1000;

    /**
     * Resolves the given semantic object (or action) and business parameters to a list
     * of links available to the user, sorted according their relevance to the calling application.
     *
     * The relevance of link is defined by the frequency with which a navigation activity
     * from the calling application to that link occurs.
     *
     * Internally, this method delegates to {@link sap.ushell.services.CrossApplicationNavigation#getLinks}
     * and then sorts the resulting list accordingly.
     *
     * @returns {jQuery.Promise} A promise that resolves with an array of link objects
     *   sorted according to their relevance to the calling application.
     * @see sap.ushell.services.CrossApplicationNavigation#getLinks
     * @since 1.44.0
     * @public
     * @function
     * @memberof sap.ushell.services.SmartNavigation#
     */
    SmartNavigation.prototype.getLinks = function (oArgs) {
        var oDeferred = new jQuery.Deferred();

        Log.error("Call to deprecated service: 'SmartNavigation.getLinks'. Please use 'CrossApplicationNavigation.getLinks' instead",
            null,
            "sap.ushell.services.SmartNavigation"
        );

        this._oCrossAppNavigationServicePromise
            .then(function (CrossApplicationNavigationService) {
                var oAllLinksPromise = CrossApplicationNavigationService.getLinks(oArgs);

                if (!this._isTrackingEnabled(this._oServiceConfig)) {
                    oAllLinksPromise
                        .done(oDeferred.resolve)
                        .fail(oDeferred.reject);

                    return;
                }

                var oCurrentApplication = AppConfiguration.getCurrentApplication();
                var sFromCurrentShellHash = oCurrentApplication.sShellHash;
                var oAppComponent = oCurrentApplication.componentHandle;

                if (oCurrentApplication.componentHandle) {
                    oAppComponent = oCurrentApplication.componentHandle.getInstance();
                }

                if (!sFromCurrentShellHash) {
                    // This may happen because, the application (the calling component belongs to) probably has not initialized fully.
                    Log.warning("Call to SmartNavigation#getLinks() simply delegated to CrossApplicationNavigation#getLinks()"
                        + " because AppConfiguration#getCurrentApplication()#sShellHash evaluates to undefined.");

                    oAllLinksPromise
                        .done(oDeferred.resolve)
                        .fail(oDeferred.reject);

                    return;
                }

                var oNavigationOccurrencesPromise = this._getNavigationOccurrences(sFromCurrentShellHash, oAppComponent);

                jQuery.when(oAllLinksPromise, oNavigationOccurrencesPromise)
                    .done(function (aLinks, aNavigationOccurrences) {
                        if (aNavigationOccurrences.length === 0) {
                            oDeferred.resolve(aLinks);
                            return;
                        }

                        var aPreparedLinks = this._prepareLinksForSorting(aLinks, aNavigationOccurrences);
                        aLinks = aPreparedLinks.sort(function (oLink, oOtherLink) {
                            return oOtherLink.clickCount - oLink.clickCount;
                        });

                        oDeferred.resolve(aLinks);
                    }.bind(this))
                    .fail(oDeferred.reject);
            }.bind(this))
            .catch(oDeferred.reject);

        return oDeferred.promise();
    };

    /**
     * Usage of this method in place of {@link sap.ushell.services.CrossApplicationNavigation#toExternal}
     * drives the smartness of the results returned by {@link sap.ushell.services.SmartNavigation#getLinks}.
     *
     * @see sap.ushell.services.CrossApplicationNavigation#toExternal
     * @since 1.44.0
     * @public
     * @function
     */
    SmartNavigation.prototype.toExternal = function (oArgs) {
        var aArguments = arguments;

        Log.error("Call to deprecated service: 'SmartNavigation.toExternal'. Please use 'CrossApplicationNavigation.toExternal' instead",
            null,
            "sap.ushell.services.SmartNavigation"
        );

        this._oCrossAppNavigationServicePromise
            .then(function (CrossApplicationNavigationService) {
                if (!this._isTrackingEnabled(this._oServiceConfig)) {
                    CrossApplicationNavigationService.toExternal.apply(CrossApplicationNavigationService, aArguments);
                    return;
                }

                var oCurrentApplication = AppConfiguration.getCurrentApplication();
                var sFromCurrentShellHash = oCurrentApplication.sShellHash;
                var oAppComponent = oCurrentApplication.componentHandle;

                if (oCurrentApplication.componentHandle) {
                    oAppComponent = oCurrentApplication.componentHandle.getInstance();
                }

                // If current application has not been instantiated fully or functions called
                // with invalid target the tracking will not be triggered.
                // In case of invalid target it is up to CrossAppNavigation#toExternal to handle the error.
                if (!sFromCurrentShellHash) {
                    Log.warning("Current shell hash could not be identified. Navigation will not be tracked.", null, "sap.ushell.services.SmartNavigation");

                    CrossApplicationNavigationService.toExternal.apply(CrossApplicationNavigationService, aArguments);
                    return;
                }

                var sDestinationShellHash = this._getHashFromOArgs(oArgs.target);
                if (!sDestinationShellHash) {
                    Log.warning("Destination hash does not conform with the ushell guidelines. Navigation will not be tracked.", null, "sap.ushell.services.SmartNavigation");

                    CrossApplicationNavigationService.toExternal.apply(CrossApplicationNavigationService, aArguments);
                    return;
                }

                this._recordNavigationOccurrences(sFromCurrentShellHash, sDestinationShellHash, oAppComponent)
                    .then(function () {
                        CrossApplicationNavigationService.toExternal.apply(CrossApplicationNavigationService, aArguments);
                    });
            }.bind(this));
    };

    /**
     * Completely delegates to {@link sap.ushell.services.CrossApplicationNavigation#hrefForExternal},
     * and may be used in place of the other with exactly the same outcome.
     *
     * @see sap.ushell.services.CrossApplicationNavigation#hrefForExternal
     * @since 1.46.0
     * @public
     * @memberof sap.ushell.services.SmartNavigation#
     * @deprecated since 1.94. Please use {@link #hrefForExternalAsync} instead.
     */
    SmartNavigation.prototype.hrefForExternal = function () {
        Log.error("Deprecated API call of 'sap.ushell.services.SmartNavigation.hrefForExternal'. Please use 'hrefForExternalAsync' instead.",
            null,
            "sap.ushell.services.SmartNavigation"
        );

        // Container.getService is OK because alternatives are provided for external use. The function is not called by ushell itself.
        var CrossApplicationNavigationService = sap.ushell.Container.getService("CrossApplicationNavigation"); // LEGACY API (deprecated)

        return CrossApplicationNavigationService.hrefForExternal.apply(CrossApplicationNavigationService, arguments);
    };

    /**
     * Completely delegates to {@link sap.ushell.services.CrossApplicationNavigation#hrefForExternalAsync},
     * and may be used in place of the other with exactly the same outcome.
     *
     * @see sap.ushell.services.CrossApplicationNavigation#hrefForExternalAsync
     * @since 1.94.0
     * @public
     * @returns {Promise<string>} A promise that is resolved to a string that can be put into an href attribute of an HTML anchor. The returned string will always start with a hash character.
     * @memberof sap.ushell.services.SmartNavigation#
     */
    SmartNavigation.prototype.hrefForExternalAsync = function () {
        var aArguments = arguments;

        Log.error("Call to deprecated service: 'SmartNavigation.hrefForExternalAsync'. Please use 'CrossApplicationNavigation.hrefForExternalAsync' instead",
            null,
            "sap.ushell.services.SmartNavigation"
        );

        return this._oCrossAppNavigationServicePromise
            .then(function (CrossApplicationNavigationService) {
                return CrossApplicationNavigationService.hrefForExternalAsync.apply(CrossApplicationNavigationService, aArguments);
            });
    };

    /**
     * Completely delegates to {@link sap.ushell.services.CrossApplicationNavigation#getPrimaryIntent},
     * and either may be used in place of the other with exactly the same outcome.
     *
     * @see sap.ushell.services.CrossApplicationNavigation#getPrimaryIntent
     * @since 1.48.0
     * @public
     * @function
     * @memberof sap.ushell.services.SmartNavigation#
     */
    SmartNavigation.prototype.getPrimaryIntent = function () {
        var oDeferred = new jQuery.Deferred();
        var aArguments = arguments;

        Log.error("Call to deprecated service: 'SmartNavigation.getPrimaryIntent'. Please use 'CrossApplicationNavigation.getPrimaryIntent' instead",
            null,
            "sap.ushell.services.SmartNavigation"
        );

        this._oCrossAppNavigationServicePromise
            .then(function (CrossApplicationNavigationService) {
                CrossApplicationNavigationService.getPrimaryIntent.apply(CrossApplicationNavigationService, aArguments)
                    .done(oDeferred.resolve)
                    .fail(oDeferred.reject);
            })
            .catch(oDeferred.reject);

        return oDeferred.promise();
    };

    /**
     * Tracks a navigation to a valid intent if provided via arguments but does not perform the navigation itself.
     * If no valid intent was provided tracking will be prevented. The intent has to consist of SemanticObject and Action.
     * It may be passed as complete shellHash (presidence) or as individual parts
     * Additional parameters will not be part of the tracking and ignored
     * This Method can be used to track a click if the actual navigation was triggered via clicking a link on the UI.
     *
     * @param {object} oArgs The navigation target as object, for example:
     *   <code>{ target: { shellHash: 'SaleOrder-display' } }</code>
     *   or
     * <pre>
     *   {
     *     target: {
     *       semanticObject: 'SalesOrder',
     *       action: 'action'
     *     }
     *   }
     * </pre>
     * @returns {object} promise, the new item created for tracking
     * @since 1.46.0
     * @public
     * @function
     * @memberof sap.ushell.services.SmartNavigation#
     */
    SmartNavigation.prototype.trackNavigation = function (oArgs) {
        Log.error("Call to deprecated service: 'SmartNavigation.trackNavigation'.",
            null,
            "sap.ushell.services.SmartNavigation"
        );

        if (!this._isTrackingEnabled(this._oServiceConfig)) {
            Log.debug("Call to SmartNavigation#trackNavigation() ignored because Service is not enabled via Configuration", null, "sap.ushell.services.SmartNavigation");
            return jQuery.when(null);
        }

        var oTarget = oArgs.target;
        var oCurrentApplication = AppConfiguration.getCurrentApplication();
        var sFromCurrentShellHash = oCurrentApplication.sShellHash;
        var sDestinationShellHash;

        if (!sFromCurrentShellHash) {
            // Possibly the application (the calling component belongs to) has not initialized fully.
            Log.warning("Call to SmartNavigation#trackNavigation() simply ignored"
                + " because AppConfiguration#getCurrentApplication()#sShellHash evaluates to undefined.");

            return jQuery.when(null);
        }

        sDestinationShellHash = this._getHashFromOArgs(oTarget);
        // Check if a valid destination was provided
        if (!sDestinationShellHash) {
            Log.warning("Navigation not tracked - no valid destination provided", null, "sap.ushell.services.SmartNavigation");

            return jQuery.when(null);
        }

        Log.debug("Navigation to " + sDestinationShellHash + " was tracked out of " + sFromCurrentShellHash, null, "sap.ushell.services.SmartNavigation");

        return this._recordNavigationOccurrences(sFromCurrentShellHash, sDestinationShellHash, oCurrentApplication.componentHandle.getInstance());
    };

    /**
     * Get the trackingEnabled configuration from the Service Config or returns the default
     *
     * @param {object} oConfig the service configuration object
     * @returns {boolean} whether the tracking is enabled for this service
     */
    SmartNavigation.prototype._isTrackingEnabled = function (oConfig) {
        return utils.isDefined(oConfig) && utils.isDefined(oConfig.config) && utils.isDefined(oConfig.config.isTrackingEnabled)
            ? oConfig.config.isTrackingEnabled
            : /* default = */ false;
    };

    /**
     * Calculates a hash code for the given input. The hash code returned is always the same for a
     * set of inputs where their equivalent string representation determined by `"" + vAny` are equal.
     *
     * For object inputs, this method is guaranteed to execute with a meaningful outcome provided
     * that the input passed has an appropriately implemented `toString` method.
     *
     * @param {object|string|number|undefined} vAny Value for which hash code should be calculated.
     * @returns {number} Hash code of the input value.
     */
    SmartNavigation.prototype._getHashCode = function (vAny) {
        var sAny = vAny + "";

        if (this._oHashCodeCache[sAny]) {
            return this._oHashCodeCache[sAny];
        }

        var iHash = 0;

        var iLength = sAny.length;
        while (iLength--) {
            iHash = (iHash << 5) - iHash + (sAny.charCodeAt(iLength) | 0);
            iHash |= 0;
        }

        this._oHashCodeCache[sAny] = iHash;

        return iHash;
    };

    /**
     * Extracts the hash part from the given intent.
     *
     * @param {string} sIntent The intent from which the hash part will be extracted.
     * @returns {string} The hash part extracted from the given intent.
     * @private
     */
    SmartNavigation.prototype._getBaseHashPart = function (sIntent) {
        var oTarget = UrlParsing.parseShellHash(sIntent);

        if (oTarget && oTarget.semanticObject && oTarget.action) {
            return oTarget.semanticObject + "-" + oTarget.action;
        }

        throw "Invalid intent `" + sIntent + "`";
    };

    /**
     * Returns a valid hash if needed parts are provided or undefined if not.
     *
     * @param {object} oArgs `oArgs` as in {@link sap.ushell.services.CrossApplicationNavigation#toExternal}
     * @returns {string} The hash if it can be determined.
     * @private
     */
    SmartNavigation.prototype._getHashFromOArgs = function (oArgs) {
        if (!oArgs) {
            return null;
        }

        if (oArgs.shellHash && UrlParsing.parseShellHash(oArgs.shellHash)) {
            return this._getBaseHashPart(oArgs.shellHash);
        }

        if (oArgs.semanticObject && oArgs.action) {
            return oArgs.semanticObject + "-" + oArgs.action;
        }

        return null;
    };

    /**
     * Computes a container key for the given shell hash.
     *
     * @param {string} sShellHash A shell hash for which a key should be computed.
     * @returns {string} The computed hash.
     * @private
     */
    SmartNavigation.prototype._getPersContainerKey = function (sShellHash) {
        return SmartNavigation.PERS_CONTAINER_KEY_PREFIX + this._getHashCode(sShellHash);
    };

    /**
     * Determines the frequency of navigation between the given origin hash and various destinations.
     *
     * @param {string} sFromCurrentShellHash An origin hash.
     * @param {object} oComponent The current application component.
     * @returns {Array} List of navigation occurrences originating from the given hash.
     *   Each item contains a destination hash and the frequency of the occurrence of navigations between the origin and the destination.
     * @private
     */
    SmartNavigation.prototype._getNavigationOccurrences = function (sFromCurrentShellHash, oComponent) {
        var oDeferred = new jQuery.Deferred();

        var sPersContainerKey = this._getPersContainerKey(sFromCurrentShellHash);

        this._oPersonalizationServicePromise
            .then(function (PersonalizationService) {
                var oContainerPromise = PersonalizationService.getContainer(sPersContainerKey, {
                    keyCategory: PersonalizationService.constants.keyCategory.FIXED_KEY,
                    writeFrequency: PersonalizationService.constants.writeFrequency.HIGH,
                    clientStorageAllowed: true
                }, oComponent);

                oContainerPromise
                    .done(function (oContainer) {
                        var aItemKeys = oContainer.getItemKeys();

                        var aItemsWithClickCount = aItemKeys.map(function (sSemanticObject) {
                            var oSemanticObjectHistoryEntry = oContainer.getItemValue(sSemanticObject);
                            var aActions = Object.keys(oSemanticObjectHistoryEntry.actions);

                            return aActions.map(function (sAction) {
                                var oAction = oSemanticObjectHistoryEntry.actions[sAction];
                                var iAggregatedClickCount = oAction.dailyFrequency.reduce(function (aggregate, iPastNthDayUsageCount) {
                                    return aggregate + iPastNthDayUsageCount;
                                }, 0);

                                return {
                                    intent: sSemanticObject + "-" + sAction,
                                    clickCount: iAggregatedClickCount
                                };
                            });
                        });

                        var aFlattenedList = aItemsWithClickCount.reduce(function (aEveryIntent, aSOSpecificIntentSet) {
                            Array.prototype.push.apply(aEveryIntent, aSOSpecificIntentSet);
                            return aEveryIntent;
                        }, []);

                        oDeferred.resolve(aFlattenedList);
                    });
            })
            .catch(oDeferred.reject);

        return oDeferred.promise();
    };

    /**
     * The function completely delegates to `_mapClickCountsIntoLinkItems`.
     * The essence of its existence is to support fluency in source code readability and thus to psychologically enhance ease of maintenance.
     *
     * This function ultimately mutates individual items in the aLinks list, because `_mapClickCountsIntoLinkItems`
     * does mutate the `aLinks` that is passed to it.
     *
     * @param {Array} aLinks List of link items for which a click count should be inserted.
     * @param {Array} aNavigationOccurrences List of known navigation occurrences from which the click count should be deduced.
     * @returns {Array} The originally passed list of links.
     * @private
     */
    SmartNavigation.prototype._prepareLinksForSorting = function (aLinks, aNavigationOccurrences) {
        var mNavigationOccurrences = {};

        aNavigationOccurrences.forEach(function (oNavigationOccurrence) {
            mNavigationOccurrences[oNavigationOccurrence.intent] = oNavigationOccurrence;
        });

        aLinks.forEach(function (oLink) {
            var sBaseHashPart = this._getBaseHashPart(oLink.intent);
            var oLinkNavigationOccurrence = mNavigationOccurrences[sBaseHashPart];

            oLink.clickCount = oLinkNavigationOccurrence
                ? oLinkNavigationOccurrence.clickCount
                : 0;
        }.bind(this));

        return aLinks;
    };

    /**
     * Record the occurrences of navigation from `sFromCurrentShellHash` to `sToDestinationShellHash` and persists it
     * to a remote storage accessed with `_oPersonalizationStore`, in the context of the currently running application.
     *
     * @param {string} sFromCurrentShellHash The origin of navigation.
     * @param {string} sToDestinationShellHash The destination of the navigation.
     * @param {object} oComponent The currently running application's component.
     * @returns {Promise|jQuery.Deferred} A promise to record navigation occurrences.
     * @private
     */
    SmartNavigation.prototype._recordNavigationOccurrences = function (sFromCurrentShellHash, sToDestinationShellHash, oComponent) {
        var oTargetDestination = UrlParsing.parseShellHash(sToDestinationShellHash);
        var sPersContainerKey = this._getPersContainerKey(sFromCurrentShellHash);
        var sSemanticObject = oTargetDestination.semanticObject;

        var oDeferred = new jQuery.Deferred();

        this._oPersonalizationServicePromise
            .then(function (PersonalizationService) {
                var oContainerPromise = PersonalizationService.getContainer(sPersContainerKey, {
                    keyCategory: PersonalizationService.constants.keyCategory.FIXED_KEY,
                    writeFrequency: PersonalizationService.constants.writeFrequency.HIGH,
                    clientStorageAllowed: true
                }, oComponent);

                oContainerPromise
                    .done(function (oContainer) {
                        var oSemanticObjectHistoryEntry = oContainer.getItemValue(sSemanticObject);
                        var sAction = oTargetDestination.action;

                        if (!oSemanticObjectHistoryEntry) {
                            oSemanticObjectHistoryEntry = {
                                actions: {},
                                // This is at least equal to the greatest `latestVisit` of its constituent actions.
                                latestVisit: Date.now(),
                                // Used like a queue, such that latest record is applied at index 0.
                                // The sum of the entries should equal the sum of all constituent actions.
                                // i.e. Record of usage 'x' days ago will be at index 'x'.
                                dailyFrequency: [ 0 ]
                            };
                        }

                        var oActionHistoryEntry = oSemanticObjectHistoryEntry.actions[sAction];

                        if (!oActionHistoryEntry) {
                            oActionHistoryEntry = {
                                latestVisit: Date.now(),
                                // Used like a queue, such that latest record is applied at index 0.
                                // i.e. Record of usage 'x' days ago will be at index 'x'.
                                dailyFrequency: [ 0 ]
                            };

                            oSemanticObjectHistoryEntry.actions[sAction] = oActionHistoryEntry;
                        }

                        this._updateHistoryEntryWithCurrentUsage(oSemanticObjectHistoryEntry);
                        this._updateHistoryEntryWithCurrentUsage(oActionHistoryEntry);

                        oContainer.setItemValue(sSemanticObject, oSemanticObjectHistoryEntry);

                        oContainer.save()
                            .done(oDeferred.resolve)
                            .fail(oDeferred.reject);
                    }.bind(this))
                    .fail(oDeferred.reject);
            }.bind(this))
            .catch(oDeferred.reject);

        return oDeferred.promise();
    };

    /**
     * Updates the given history item which may be either an instance derived from either
     * factories `SemanticObjectHistoryEntry` or `SemanticObjectHistoryEntry`.
     *
     * Note that the update is done in place. In other words, the passed `oHistoryEntry` reference will be mutated.
     *
     * @param {ActionHistoryEntry|SemanticObjectHistoryEntry} oHistoryEntry A history entry item to be updated.
     * @returns {ActionHistoryEntry|SemanticObjectHistoryEntry} A reference to the updated history entry item.
     * @private
     */
    SmartNavigation.prototype._updateHistoryEntryWithCurrentUsage = function (oHistoryEntry) {
        var iNow = Date.now();
        var iTimePassedSinceLastVisit = iNow - oHistoryEntry.latestVisit;
        var iDaysPassedSinceLastVisit = Math.floor(iTimePassedSinceLastVisit / SmartNavigation.ONE_DAY_IN_MILLISECOND);

        // Account for dormant days between previous and latest usages.
        while (iDaysPassedSinceLastVisit--) {
            oHistoryEntry.dailyFrequency.unshift(0);

            if (oHistoryEntry.dailyFrequency.length > SmartNavigation.STATISTIC_COLLECTION_WINDOW_DAYS) {
                oHistoryEntry.dailyFrequency.pop();
            }
        }

        ++oHistoryEntry.dailyFrequency[0];
        oHistoryEntry.latestVisit = iNow;

        return oHistoryEntry;
    };

    SmartNavigation.hasNoAdapter = true;

    return SmartNavigation;
});
