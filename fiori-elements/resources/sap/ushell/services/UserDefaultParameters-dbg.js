// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview The Unified Shell's UserDefaultParameters service provides
 *               read and write access to the User Default Parameter values.
 *               This is *not* an application facing service, but for Shell
 *               Internal usage.
 *               This service should be accessed by the application
 *               via the CrossApplicationNavigation service.
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepEqual",
    "sap/base/util/deepExtend",
    "sap/base/util/isEmptyObject",
    "sap/ui/base/EventProvider",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/utils"
], function (
    Log,
    deepEqual,
    deepExtend,
    isEmptyObject,
    EventProvider,
    jQuery,
    oUtils
) {
    "use strict";

    var sEventNameValueStored = "valueStored";
    var aStoreMembers = ["value", "noEdit", "noStore", "extendedValue", "alwaysAskPlugin"];
    /**
     * The Unified Shell's UserDefaultParameters service
     * This method MUST be called by the Unified Shell's container only, others
     * MUST call <code>sap.ushell.Container.getServiceAsync("UserDefaultParameters").then(function (UserDefaultParameters) {});</code>.
     * Constructs a new instance of the UserDefaultParameters service.
     *
     * @param {object} oAdapter
     *   The service adapter for the UserDefaultParameters service,
     *   as already provided by the container
     * @param {object} oContainerInterface interface
     * @param {string} sParameter Service instantiation
     * @param {object} oConfig service configuration (not in use)
     *
     *
     * @private
     * @constructor
     * @class
     * @see sap.ushell.services.Container#getServiceAsync
     *
     * @since 1.32.0
     */
    function UserDefaultParameters (oAdapter, oContainerInterface, sParameter, oConfig) {
        this._aPlugins = []; // list of registered plugins, in order
        this._oUserDefaultParametersNames = {};

        // Indicates whether a parameter was already persisted or scheduled for
        // persistence.
        this._oWasParameterPersisted = {};

        var that = this;
        var oStoreValueEventProvider = new EventProvider();

        /**
         * Obtain an integer representing the priority of the plugin
         *
         * @param {object} oPlugin a plug-in
         *
         * @returns {number} an integer value (default 0) representing the priority of the plug-in
         *
         */
        function getPrio (oPlugin) {
            var val = (typeof oPlugin.getComponentData === "function" && oPlugin.getComponentData() && oPlugin.getComponentData().config && oPlugin.getComponentData().config["sap-priority"]) || 0;
            if (typeof val !== "number" || isNaN(val)) {
                return 0;
            }
            return val;
        }

        /**
        * Plugins with higher priority are moved to *lower* places in the queue
        *
        * @param {array} aPlugins list of present plugins, modified!
        * @param {object} oPlugin the plugin to insert
        *
        * @returns {array}
        *  amended list of plugins
        *
        * @private
        *
        * @since 1.32.0
        */
        this._insertPluginOrdered = function (aPlugins, oPlugin) {
            var prioPlugin = getPrio(oPlugin),
                i,
                prioNth;
            for (i = 0; (i < aPlugins.length) && oPlugin; ++i) {
                prioNth = getPrio(aPlugins[i]);
                if (oPlugin && (prioPlugin > prioNth)) {
                    aPlugins.splice(i, 0, oPlugin); // insert at index i;
                    oPlugin = undefined;
                }
            }
            if (oPlugin) {
                aPlugins.push(oPlugin);
            }
            return aPlugins;
        };

        // PLUGIN Registration IFFacingPlugin
        /**
         * @param {object} oPlugin the Plugin to register with the service
         * @public
         * @alias sap.ushell.services.UserDefaultParameters#registerPlugin
         */
        this.registerPlugin = function (oPlugin) {
            this._aPlugins = this._insertPluginOrdered(this._aPlugins, oPlugin);
        };

        /**
         * Tries to get a given user default value from a given plugin.
         * This is a helper function for _iterateOverPluginsToGetDefaultValue below.
         * In case of error or if the given plugin can't return a default value,
         * the original value passed to the function is returned.
         *
         * @param {object} oPlugin Plugin that will be called.
         * @param {string} sParameterName Name of the parameter (search criteria)
         * @param {object} oSystemContext The system context object
         * @param {object} oValue The current value (if any) to which to default if nothing is returned.
         *
         * @returns {Promise<object>} A promise that resolves to either
         *          the value returned by the plugin or the original oValue
         * @private
         */
        this._getUserDefaultValueFromPlugin = function (oPlugin, sParameterName, oSystemContext, oValue) {
            var oResult;
            if (typeof oPlugin.getUserDefault === "function") {
                oResult = new Promise(function (resolve, reject) {
                    oPlugin.getUserDefault(sParameterName, oValue, oSystemContext)
                        .done(function (oNewValue) {
                            var oResolveValue = oNewValue || oValue;

                            var sPluginName = this._getComponentNameOfPlugin(oPlugin);
                            Log.debug(
                                "[UserDefaults] Fetched \"" + sParameterName + "\" for SystemContext=" + oSystemContext.id + " from Plugin=" + sPluginName,
                                JSON.stringify(oResolveValue, null, 2)
                            );

                            resolve(oResolveValue);
                        }.bind(this))
                        .fail(function () {
                            Log.error("invocation of getUserDefault(\"" + sParameterName + "\") for plugin " + that._getComponentNameOfPlugin(oPlugin) + " rejected.", null,
                            "sap.ushell.services.UserDefaultParameters");
                            resolve(oValue);
                        });
                }.bind(this));
            } else {
                oResult = Promise.resolve(oValue);
            }
            return oResult;
        };

        /**
         * Iterates the plugins and searches for a parameter that is
         * handled by the plugin to deliver a value
         * Plugins are called sequentially in the order given by the _aPlugins array,
         * in order to allow us to pass the value returned by a plugin to the next one
         * and enable the plugins to react to previous values (generally keeping the
         * existing one instead of overriding it).
         *
         * @param {string} sParameterName Name of the parameter (search criteria)
         * @param {object} oStartValue Value which will be returned if it is handled by any plugin
         * @param {object} oSystemContext The system context object
         * @param {sap.ushell.services.PluginManager} oPluginManagerService The instance of the PluginManager service
         * @returns {Promise<object>} A promise that resolves to either
         *          the value returned by the plugins or the start value if the plugins do not
         *          return a value.
         * @private
         * @see sap.ushell.services.Container#getServiceAsync
         *
         * @since 1.32.0
         */
        this._iterateOverPluginsToGetDefaultValue = function (sParameterName, oStartValue, oSystemContext, oPluginManagerService) {
            // Main promise chain construction: a plugin will only be called once the previous one's promise has resolved
            // so that we have access to the value returned by that promise.
            return new Promise(function (resolve, reject) {
                oPluginManagerService.loadPlugins("UserDefaults")
                    .done(function () {
                        var oPluginPromiseChain = this._aPlugins.reduce(function (oChain, oPlugin) {
                            var oExtendedChain = oChain.then(this._getUserDefaultValueFromPlugin.bind(this, oPlugin, sParameterName, oSystemContext /*oValue - resolved value*/));
                            return oExtendedChain;
                        }.bind(this), Promise.resolve(oStartValue));

                        oPluginPromiseChain.then(resolve);
                    }.bind(this))
                    .fail(function () {
                        Log.error("Cannot get value for " + sParameterName + ". One or more plugins could not be loaded.");
                        reject("Initialization of plugins failed");
                    });
            }.bind(this));
        };

        this._getStoreDate = function () {
            return new Date().toString();
        };

        /**
         * Stores the value & persists it.
         * Note, if oValueObject.value is undefined, the value is deleted!
         *
         * @param {string} sParameterName Name of the parameter for the value which has to be saved
         * @param {object} oValueObject Value which has to be saved
         * @param {boolean} bFromEditor true if invoked from editor, in this case an undefined value is interpreted as a "delete value operation"
         * @param {object} oSystemContext The system context object
         * @returns {Promise<string>} A promise that is resolved to the parameter name if saving its value succeeds
         *
         * @private
         * @since 1.32.0
         */
        this._storeValue = function (sParameterName, oValueObject, bFromEditor, oSystemContext) {
            if (bFromEditor && oValueObject.extendedValue) {
                return sap.ushell.Container.getServiceAsync("ClientSideTargetResolution")
                    .then(function (oClientSideTargetResolutionService) {
                        return new Promise(function (resolve) {
                            oClientSideTargetResolutionService.getUserDefaultParameterNames(oSystemContext)
                                .done(function (oParametersAndExtendedParameters) {
                                    var oExtractedArrays = this._extractKeyArrays(oParametersAndExtendedParameters);
                                    var bRemoveExtendedValue = oExtractedArrays.extended.indexOf(sParameterName) < 0;

                                    this._saveParameterValue(sParameterName, oValueObject, bFromEditor, bRemoveExtendedValue, oSystemContext)
                                        .then(resolve);
                                }.bind(this))
                                .fail(function () {
                                    this._saveParameterValue(sParameterName, oValueObject, bFromEditor, false, oSystemContext)
                                        .then(resolve);
                                }.bind(this));
                        }.bind(this));
                    }.bind(this));
            }

            return this._saveParameterValue(sParameterName, oValueObject, bFromEditor, false, oSystemContext);
        };

        /**
         * Persists the given parameter's value.
         * Note: If oValueObject is undefined, the value is deleted.
         *
         * @param {string} sParameterName Name of the parameter for the value which has to be saved
         * @param {object} oValueObject Value which has to be saved
         * @param {boolean} bFromEditor true if invoked from editor, in this case an undefined value is interpreted as a "delete value operation"
         * @param {boolean} bRemoveExtendedValue Whether or not to remove the extended value from the object before saving
         * @param {object} oSystemContext The system context object
         * @returns {Promise<string>} A promises that is resolved with the parameter name that has been saved.
         *
         * @private
         * @since 1.79.0
         */
        this._saveParameterValue = function (sParameterName, oValueObject, bFromEditor, bRemoveExtendedValue, oSystemContext) {
            if (bRemoveExtendedValue) {
                oValueObject.extendedValue = undefined;
            }
            if (bFromEditor && this._valueIsEmpty(oValueObject)) {
                oValueObject = undefined; // indicates removal
                this._oWasParameterPersisted[sParameterName] = false;
            } else {
                oValueObject._shellData = deepExtend({
                    storeDate: this._getStoreDate()
                }, oValueObject._shellData);
            }

            return sap.ushell.Container.getServiceAsync("UserDefaultParameterPersistence")
                .then(function (oUserDefaultParameterPersistenceService) {
                    return new Promise(function (resolve) {

                        oUserDefaultParameterPersistenceService
                            .saveParameterValue(sParameterName, oValueObject, oSystemContext)
                            .always(function () {
                                var oStoreValue = {
                                    parameterName: sParameterName,
                                    parameterValue: oUtils.clone(oValueObject || {}),
                                    systemContext: oSystemContext
                                };

                                oStoreValueEventProvider.fireEvent(sEventNameValueStored, oStoreValue);

                                resolve(sParameterName);
                            });
                    });
                });
        };

        /**
         * Obtain a present value from the internal store, may return an
         * *empty* <code>{value : undefined}</code> object if not present.
         *
         * @param {string} sParameterName Name of the parameter for the value which has to be received
         * @param {object} oSystemContext The system context object
         *
         * @returns {Promise<object>}
         *      A jQuery promise that resolves with an object representing the
         *      persisted value for the parameter or rejects in case the
         *      parameter was not found in the persistence.
         *
         * @private
         * @see sap.ushell.services.Container#getServiceAsync
         *
         * @since 1.32.0
         */
        this._getPersistedValue = function (sParameterName, oSystemContext) {
            return new Promise(function (resolve, reject) {
                sap.ushell.Container.getServiceAsync("UserDefaultParameterPersistence")
                    .then(function (oUserDefaultParameterPersistenceService) {
                        oUserDefaultParameterPersistenceService.loadParameterValue(sParameterName, oSystemContext)
                            .done(resolve)
                            .fail(reject);
                    });
            });
        };

        /**
         * Determine whether the value is completely empty
         * @param {object} oValue value object
         * @returns {boolean} boolean indicating whether oValue represents a Never set Value
         */
        this._valueIsEmpty = function (oValue) {
            return !oValue || (!oValue.value && !oValue.extendedValue);
        };

        /**
         * Checks whether two objects have the same value for a given set of
         * members.
         *
         * @param {object} oObject1
         *   The first object to compare
         * @param {object} oObject2
         *   The second object to compare
         * @param {array} aMembersToCheck
         *   An array of members to check
         *
         * @return {boolean}
         *   true if each member in <code>aMembersToCheck</code> has the same
         *   value in both the objects. false in case at least one member
         *   differs.
         */
        this._haveSameMembersValue = function (oObject1, oObject2, aMembersToCheck) {
            return aMembersToCheck.every(function (sRelevantMember) {
                return oObject1[sRelevantMember] === oObject2[sRelevantMember]
                    || deepEqual(oObject1[sRelevantMember], oObject2[sRelevantMember]);
            });
        };

        /**
         * Obtains a list of user default parameter names which are available for the respective end user.
         *
         * @param {object} systemContext the systemContext for which the parameter names should be obtained
         *
         * @returns {Promise<object>}
         *      A promise, which resolves to a rich parameter object containing the following structure:
         *
         * <pre>
         *      {
         *          aAllParameterNames: [],
         *          aExtendedParameterNames: [],
         *          oMetadataObject: {}
         *      }
         * </pre>.
         *
         *      The promise will typically always be resolved.
         *      In case there are no user default parameter names found, an empty object will be received.
         *
         *      Note: oMetadataObject is the object representation of aAllParameterNames, which is an array.
         */
        this._getUserDefaultParameterNames = function (systemContext) {
            if (!this._oUserDefaultParametersNames[systemContext.id]) {
                this._oUserDefaultParametersNames[systemContext.id] = new Promise(function (resolve) {
                    sap.ushell.Container.getServiceAsync("ClientSideTargetResolution")
                        .then(function (ClientSideTargetResolutionService) {
                            ClientSideTargetResolutionService.getUserDefaultParameterNames(systemContext)
                                .done(function (oParametersAndExtendedParameters) {
                                    var oExtractedArrays = this._extractKeyArrays(oParametersAndExtendedParameters);
                                    var aExtendedParameterNames = oExtractedArrays.extended;
                                    var aAllParameterNames = oExtractedArrays.allParameters;
                                    var oMetadataObject = this._arrayToObject(aAllParameterNames);

                                    resolve({
                                        aAllParameterNames: aAllParameterNames,
                                        aExtendedParameterNames: aExtendedParameterNames,
                                        oMetadataObject: oMetadataObject
                                    });
                                }.bind(this));
                        }.bind(this));
                }.bind(this));
            }

            return this._oUserDefaultParametersNames[systemContext.id];
        };

        this._isRelevantParameter = function (sParamName, oSystemContext) {
            return this._getUserDefaultParameterNames(oSystemContext)
                .then(function (oResult) {
                    if (!oResult.aAllParameterNames || oResult.aAllParameterNames.indexOf(sParamName) === -1) {
                        throw new Error("The given parameter \"" + sParamName + "\" is not part of the list of parameters for the given system context.");
                    }
                });
        };

        /**
         * Attempt to determine whether there are user default parameters
         * maintainable for the end user or not.
         *
         * @param {object} systemContext The system context object.
         * @returns {Promise<boolean|undefined>}
         *      A promise that is resolved with a boolean value
         *      which has the value <code>true</code> if user default parameters are
         *      maintainable, and <code>false</code> if not.
         *      The promise will always be resolved.
         *      Note: In case an error occurs, the promise is resolved with <code>undefined</code>.
         */
        this.hasRelevantMaintainableParameters = function (systemContext) {
            var bHasRelevantParameters = false;
            var aGetValuePromises = [];

            return new Promise(function (resolve) {
                this._getUserDefaultParameterNames(systemContext)
                    .then(function (oParameterNames) {
                        if (!isEmptyObject(oParameterNames) && oParameterNames.aAllParameterNames) {
                            oParameterNames.aAllParameterNames.forEach(function (sParameterName) {
                                var oGetValuePromise = this.getValue(sParameterName, systemContext);
                                aGetValuePromises.push(oGetValuePromise);
                                oGetValuePromise.done(function (oValue) {
                                    if (oValue && !oValue.hasOwnProperty("noEdit")) {
                                        bHasRelevantParameters = true;
                                    }
                                });
                            }.bind(this));

                            jQuery.when.apply(undefined, aGetValuePromises).done(function () {
                                resolve(bHasRelevantParameters);
                            }).fail(function () {
                                resolve();
                            });
                        } else {
                            resolve();
                        }
                    }.bind(this));
            }.bind(this));
        };

        /**
         * Attempt to determine a value for the parameter name
         * <code>sParameterName</code>.
         *
         * @param {string} sParameterName The parameter name
         * @param {object} oSystemContext The system context object
         * @returns {object}
         *      A jQuery promise, whose done handler receives as first argument a rich parameter
         *      object containing a value, e.g. <code>{ value : "value" }</code>.
         *      The promise will typically always be resolved.
         *      Note: It will always return an object, the value property may be
         *      <code>undefined</code> if no value could be retrieved.
         */
        this.getValue = function (sParameterName, oSystemContext) {
            // Strategy is as follows
            // a) get value from persistence,
            // b) if required ask all plugins in order whether they want to alter value
            // c) return value
            // c2) if value was altered, including set to undefined,
            //    [not on critical path] update value in remote persistence
            //    (potentially deleting value if set to undefined!)
            var oDeferred = new jQuery.Deferred();

            this._isRelevantParameter(sParameterName, oSystemContext)
                // no relevant parameter -> no value
                // This is handled at the end of the chain, as all "then" will
                // be ignored in case of a rejection in _isRelevantParameter
                .then(function () {
                    return this._getPersistedValue(sParameterName, oSystemContext)
                        .then(function (oPersistedValue) {
                            this._oWasParameterPersisted[sParameterName] = true;

                            return oPersistedValue || {};
                        }.bind(this))
                        // If the server call fails, this ensures that the plugins get called.
                        .catch(function () {
                            return { value: undefined };
                        });
                }.bind(this))
                .then(function (oPersistedValue) {
                    var oValueClone = oUtils.clone(oPersistedValue);

                    var bAskValueToPlugins =
                        (!oPersistedValue._shellData && this._valueIsEmpty(oPersistedValue)) // _shellData is added by the shell when the parameter is stored
                        || oPersistedValue.noStore // i.e., don't use the stored value
                        || oPersistedValue.alwaysAskPlugin;

                    if (!bAskValueToPlugins) {
                        oDeferred.resolve(oPersistedValue);
                        return;
                    }

                    return Promise.all([
                        oValueClone,
                        oPersistedValue,
                        sap.ushell.Container.getServiceAsync("PluginManager")
                    ]);
                }.bind(this))
                .then(function (aValues) {
                    var oValueClone = aValues[0];
                    var oPersistedValue = aValues[1];
                    var oPluginManagerService = aValues[2];

                    return this._iterateOverPluginsToGetDefaultValue(sParameterName, oPersistedValue, oSystemContext, oPluginManagerService)
                        .then(function (oNewValue) {
                            if (!this._oWasParameterPersisted[sParameterName] || !this._haveSameMembersValue(oValueClone, oNewValue, aStoreMembers)) {
                                // avoid multiple calls result in storing a parameter, as we fire and forget via _storeValue below.
                                this._oWasParameterPersisted[sParameterName] = true;

                                this._storeValue(sParameterName, oNewValue, false, oSystemContext)
                                    .then(function () {
                                        oDeferred.resolve(oNewValue);
                                    });
                            } else {
                                oDeferred.resolve(oNewValue);
                            }
                        }.bind(this))
                        .catch(oDeferred.reject);
                }.bind(this))
                .catch(function () {
                    oDeferred.resolve({ value: undefined });
                });

            return oDeferred.promise();
        };

        /**
         * Adds each of the parameter names from the given list to the given parameters object as key-value pairs.
         *
         * @param {object} oParameters The map the new parameters are to be added to
         * @param {string[]} aParameterNames A list containing the new parameter names
         * @param {object} oSystemContext The system context object
         * @returns {jQuery.Promise} A jQuery promise that is resolved with the amended parameter map
         * @private
         */
        this._addParameterValuesToParameters = function (oParameters, aParameterNames, oSystemContext) {
            var oDeferred = new jQuery.Deferred();
            var aPromises = [];

            aParameterNames.forEach(function (sParameterName) {
                var oGetValuePromise = this.getValue(sParameterName, oSystemContext);
                aPromises.push(oGetValuePromise);

                oGetValuePromise.done(function (oValueObject) {
                    oParameters[sParameterName].valueObject = oValueObject;
                });
            }.bind(this));

            jQuery.when.apply(jQuery, aPromises)
                .done(oDeferred.resolve.bind(oDeferred, oParameters))
                .fail(oDeferred.reject.bind(oDeferred, oParameters));

            return oDeferred.promise();
        };

        this._arrayToObject = function (aParameterNames) {
            var oRes = {};
            aParameterNames.forEach(function (sParameterName) {
                oRes[sParameterName] = {};
            });
            return oRes;
        };

        this._getComponentNameOfPlugin = function (oPlugin) {
            try {
                return oPlugin.getMetadata().getComponentName() || "";
            } catch (error) {
                return "'name of plugin could not be determined'";
            }
        };

        /**
         * given
         * @param {object} oDeferred a jQuery Deferred, which is to be resolved if the execution
         *  succeeded
         * @param {string[]} aAllParameterNames all assigned parameter names as array of strings
         * @param {string[]} aExtendedParameterNames the parameter names as array of strings
         * @param {object} oMetadataObject a raw metadata object, not yet amended by plugin data
         * @param {object} oSystemContext The system context object
         * @private
         */
        this._getEditorDataAndValue = function (oDeferred, aAllParameterNames, aExtendedParameterNames, oMetadataObject, oSystemContext) {
            var that = this;
            var aDeferreds = [];
            var aResultsOfMetadataPluginCalls = [];

            this._aPlugins.forEach(function (oPlugin) {
                if (typeof oPlugin.getEditorMetadata === "function") {
                    var oPluginDeferred = new jQuery.Deferred();
                    aDeferreds.push(oPluginDeferred);

                    try {
                        var iPromisesLength = aDeferreds.length - 1;

                        oPlugin.getEditorMetadata(oMetadataObject, oSystemContext)
                            .done(function (oResultMetadata) {
                                aResultsOfMetadataPluginCalls[iPromisesLength] = oResultMetadata;
                            }).always(oPluginDeferred.resolve)
                            .fail(function () {
                                Log.error("EditorMetadata for plugin " + that._getComponentNameOfPlugin(oPlugin) + "cannot be invoked.", null, "sap.ushell.services.UserDefaultParameters");
                                oPluginDeferred.resolve();
                            });
                    } catch (ex) {
                        Log.error("Error invoking getEditorMetaData on plugin: " + ex + ex.stack, null,
                        "sap.ushell.services.UserDefaultParameters");
                        oPluginDeferred.resolve();
                    }
                }
            });

            jQuery.when.apply(jQuery, aDeferreds).done(function () {
                // all metadata present
                var aParameterNamesWithoutMetadata = [];
                var oParametersWithMetadata = aResultsOfMetadataPluginCalls.reverse().reduce(function (oPreviousValue, oNthResult) {
                    aAllParameterNames.forEach(function (sParameterName) {
                        if (oNthResult[sParameterName] && oNthResult[sParameterName].editorMetadata) {
                            oPreviousValue[sParameterName].editorMetadata = oNthResult[sParameterName].editorMetadata;
                        }
                    });
                    return oPreviousValue;
                }, oMetadataObject);
                aAllParameterNames.forEach(function (sParameterName) {
                    if (!(oParametersWithMetadata[sParameterName] && oParametersWithMetadata[sParameterName].editorMetadata)) {
                        aParameterNamesWithoutMetadata.push(sParameterName);
                    }
                });

                // blend in parameters
                that._addParameterValuesToParameters(oParametersWithMetadata, aAllParameterNames, oSystemContext).done(function (oParameters) {
                    // create a deep copy
                    var oParametersDeepCopy = deepExtend({}, oParameters),
                        aKeys;
                    // mark extended parameters!
                    aExtendedParameterNames.forEach(function (sParameterName) {
                        if (oParametersDeepCopy[sParameterName]) {
                            oParametersDeepCopy[sParameterName].editorMetadata = oParametersDeepCopy[sParameterName].editorMetadata || {};
                            oParametersDeepCopy[sParameterName].editorMetadata.extendedUsage = true;
                        }
                    });
                    // remove all noEdit parameters
                    aKeys = Object.keys(oParametersDeepCopy).splice(0);
                    aKeys.forEach(function (sParameterName) {
                        var idx;
                        if (oParametersDeepCopy[sParameterName].valueObject &&
                            oParametersDeepCopy[sParameterName].valueObject.noEdit === true) {
                            delete oParametersDeepCopy[sParameterName];
                            // also from the error log list (noEdit parameters w.o. editorMetadata are no cause of concern)
                            idx = aParameterNamesWithoutMetadata.indexOf(sParameterName);
                            if (idx >= 0) {
                                aParameterNamesWithoutMetadata.splice(idx, 1);
                            }
                        }
                    });
                    if (aParameterNamesWithoutMetadata.length > 0) {
                        Log.error("The following parameter names have no editor metadata and thus likely no configured plugin:\n\"" + aParameterNamesWithoutMetadata.join("\",\n\"") + "\".");
                    }
                    oDeferred.resolve(oParametersDeepCopy);
                }).fail(oDeferred.reject.bind(oDeferred));
            });
        };

        /**
         * Obtain the set or parameters, including values and metadata
         * for the UserDefaultParameterEditor
         *
         * This set is defined by all parameter values relevant for a given user
         * as determined by all values contained in Target mappings currently assigned to
         * the user
         *
         * @param {object} oSystemContext The system context object
         *
         * @returns {jQuery.Deferred} promise
         * The first argument of the resolved promise is an object with parameter names as members
         *
         * The order of parameters is suitable order for parameter display.
         *
            <pre>{
                CostCenter: {
                    valueObject: {
                        "value": "1000",
                        "noEdit": false, // filtered out
                        "noStore": true // not relevant for editor
                    },
                    "editorMetadata":{
                        "displayText": "Company code",
                        "description": "This is the company code",
                        "groupId": "EXAMPLE-FIN-GRP1",
                        "groupTitle": "FIN User Defaults (UShell examples)",
                        "parameterIndex": 2,
                        "editorInfo": {
                           "odataURL": "/sap/opu/odata/sap/ZFIN_USER_DEFAULTPARAMETER_SRV",
                           "entityName": "Defaultparameter",
                           "propertyName": "CompanyCode",
                           "bindingPath": "/Defaultparameters('FIN')"
                        }
                    }
                },
                Plant: {
                    valueObject: {
                        "value": "4711",
                        "extendedValue": {
                            "Ranges": [
                                {
                                    "Sign": "I",
                                    "Option": "EQ",
                                    "Low": "4800",
                                    "High": null
                                }, {
                                    "Sign": "I",
                                    "Option": "BT",
                                    "Low": "6000",
                                    "High": "8500"
                              }
                           ]
                        },
                        "noEdit": false, // filtered out
                        "noStore": true // not relevant for editor
                    },
                    "editorMetadata":{
                        "displayText": "Company code",
                        "description": "This is the company code",
                        "groupId": "EXAMPLE-FIN-GRP1",
                        "groupTitle": "FIN User Defaults (UShell examples)",
                        "parameterIndex": 2,
                        "extendedUsage" : true,
                        "editorInfo": {
                           "odataURL": "/sap/opu/odata/sap/ZFIN_USER_DEFAULTPARAMETER_SRV",
                           "entityName": "Defaultparameter",
                           "propertyName": "CompanyCode",
                           "bindingPath": "/Defaultparameters('FIN')"
                        }
                    }
                }
            }</pre>
         * the list will not contain values which have noEdit set
         *
         * Note: whether maintenance of extended User Default values is to be enabled is
         * indicated by the boolean <code>extendedUsage</code> property(!), not
         * by the presence of an extendedValue.
         * When editing a simple user default ( extendedUsage : undefined ) the extendedValue
         * property is to be ignored
         *
         * The promise will typically always be resolved.
         * The first argument of the resolved response is
         * a list value object:
         * <code>{ value : sValueOrUndefined }</code>
         * Note: It will always return an object, the value property may be
         * undefined if no value could be retrieved.
         */
        this.editorGetParameters = function (oSystemContext) {
            var oDeferred = new jQuery.Deferred();

            Promise.all([
                sap.ushell.Container.getServiceAsync("PluginManager"),
                this._getUserDefaultParameterNames(oSystemContext)
            ]).then(function (aResults) {
                var PluginManagerService = aResults[0];
                var oParametersAndExtendedParameters = aResults[1];

                if (oParametersAndExtendedParameters.oMetadataObject.length === 0) {
                    // if array is empty, nothing to display in editor
                    oDeferred.resolve({});
                } else {
                    PluginManagerService.loadPlugins("UserDefaults")
                        .done(function () {
                            // eslint-disable-next-line max-len
                            this._getEditorDataAndValue(oDeferred, oParametersAndExtendedParameters.aAllParameterNames, oParametersAndExtendedParameters.aExtendedParameterNames, oParametersAndExtendedParameters.oMetadataObject, oSystemContext);
                        }.bind(this))
                        .fail(function () {
                            Log.error("One or more plugins could not be loaded");
                            oDeferred.reject("Initialization of plugins failed");
                        });
                }
            }.bind(this));

            return oDeferred.promise();
        };

        /**
         * Extracts and sorts the parameter names from the given object and ensures non-undefined values.
         *
         * @param {object} oParameters A object containing parameter names and values
         * @returns {object} An object containing simple, extended, and all parameters as lists
         * @private
         */
        this._extractKeyArrays = function (oParameters) {
            var oResult = {
                simple: oParameters && oParameters.simple && Object.keys(oParameters.simple).sort() || [],
                extended: oParameters && oParameters.extended && Object.keys(oParameters.extended).sort() || []
            };

            var aOnlyExtendedParameters = oResult.extended.filter(function (sExtendedParameter) {
                return oResult.simple.indexOf(sExtendedParameter) < 0;
            });

            oResult.allParameters = oResult.simple.concat(aOnlyExtendedParameters).sort();

            return oResult;
        };


        /**
         * Stores the value & persists it.
         * Note, if oValueObject.value is undefined, the value is deleted!
         *
         * @param {string} sParameterName Name of the parameter for the value which has to be saved
         * @param {object} oValueObject Value which has to be saved
         * @param {object} oSystemContext The system context object
         * @returns {jQuery.Promise} A jQuery promise
         *
         * @private
         * @see sap.ushell.services.Container#getServiceAsync
         *
         * @since 1.32.0
         */
        this.editorSetValue = function (sParameterName, oValueObject, oSystemContext) {
            var oDeferred = new jQuery.Deferred();

            this._storeValue(sParameterName, oValueObject, true, oSystemContext)
                .then(oDeferred.resolve);

            return oDeferred.promise();
        };

        /**
         * Attaches a listener to the valueStored event.
         *
         * @param {function} fnFunction
         *     Event handler to be attached.
         *
         * @methodOf sap.ushell.services.UserDefaultParameters#
         * @name attachValueStored
         * @since 1.34.0
         * @public
         * @alias sap.ushell.services.UserDefaultParameters#attachValueStored
         */
        this.attachValueStored = function (fnFunction) {
            oStoreValueEventProvider.attachEvent(sEventNameValueStored, fnFunction);
        };

        /**
         * Detaches a listener from the valueStored event.
         *
         * @param {function} fnFunction
         *     Event handler to be detached.
         *
         * @methodOf sap.ushell.services.UserDefaultParameters#
         * @name detachValueStored
         * @since 1.34.0
         * @public
         * @alias sap.ushell.services.UserDefaultParameters#detachValueStored
         */
        this.detachValueStored = function (fnFunction) {
            oStoreValueEventProvider.detachEvent(sEventNameValueStored, fnFunction);
        };
    }

    UserDefaultParameters.hasNoAdapter = true;
    return UserDefaultParameters;
}, true /* bExport */);
