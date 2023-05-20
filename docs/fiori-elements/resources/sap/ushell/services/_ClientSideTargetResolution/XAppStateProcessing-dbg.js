// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview
 * <p>This module performs operations on the sap-xapp-state data passed to an intent before the target application is launched.</p>
 * Operations in this module are assumed to be executed after the target mapping has been identified (post search).
 *
 * @private
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/utils",
    "sap/ushell/services/_ClientSideTargetResolution/Utils",
    "sap/ushell/navigationMode",
    "sap/ushell/services/AppConfiguration",
    "sap/ushell/Config",
    "sap/ui/thirdparty/jquery",
    "sap/base/util/ObjectPath",
    "sap/base/util/isEmptyObject",
    "sap/base/util/isPlainObject",
    "sap/ui/generic/app/navigation/service/SelectionVariant",
    "sap/base/Log"
], function (
    oUtils,
    oCSTRUtils,
    oNavigationMode,
    oAppConfiguration,
    Config,
    jQuery,
    ObjectPath,
    isEmptyObject,
    isPlainObject,
    SelectionVariant,
    Log
) {
    "use strict";

    /**
     * This method modifies a passed Application State if extended User Defaults are to be merged with an AppState or renaming takes place.
     *
     * It also *always* takes care of renaming parameters (generating mappedDefauledParamNames)
     * Thus it must be invoked in the flow even for targets which do not deal with appstate
     *
     * If one or more extended user default values are present, they will be added to a new AppState unless already present
     *
     * A new Appstate is created when renaming has to occur or parameters are merged
     * <note>
     * If an incoming AppState content is encountered which is not a) undefined or (b) an object,
     * no new AppState is created and no renaming or default merging takes place.
     * The original passed AppState is returned unchanged
     * </note>
     *
     * Note that within this function also renaming of default Parameter names takes place
     * (independent of whether the AppState was tampered with!)
     *
     * Technically, we
     *   a) remove defaulted parameters which are already present
     *   b) merge the remaining parameters into the appstate
     *   c) rename the app state, logging collisions
     *   d) remove effectively not used defaults from defaultParamNames
     *   e) remap defaultParamNames in case of renameTo
     *
     * The new AppState is mixed it into the resolution result
     *
     * After the invocation, the oMatchingTarget.resolutionResult.oNewAppStateMembers
     * contains the actually *used* members (members present are deleted from the collection)
     * Thus all defaultedParameterNames which are thus the following defaultedParameterNames can be a) complex and b) not part of
     * oMatchingTarget.resolutionResult.oNewAppStateMembers can be removed, as they were effectively not defaulted
     *
     * If one or more extended user default values are present, they will be added to a new AppState.
     * In case there is an existing AppState, it's values will be copied as well.
     * The new AppState is mixed it into the resolution result.
     * If no extended user default value is present, the existing AppState is reused.
     *
     * @param {object} oMatchingTarget One of the objects returned by {@link #_getMatchingInbounds}.
     * @param {object} oAppStateService the app state service instance
     * @returns {object} jQuery promise
     * @private
     * @since 1.34.0
     */
    function mixAppStateIntoResolutionResultAndRename (oMatchingTarget, oAppStateService) {
        var oDeferred = new jQuery.Deferred(),
            oNewAppState,
            oResolutionResult = oMatchingTarget.resolutionResult,
            oSignature = oMatchingTarget.inbound && (oMatchingTarget.inbound.signature || {}),
            bChangeExistingAppState = hasExtendedUserDefaults(oResolutionResult)
                || oSignature.additionalParameters === "ignored"
                || hasRenameTo(oMatchingTarget);

        if (!bChangeExistingAppState) {
            cleanupAndResolve(oDeferred, oMatchingTarget);
            return oDeferred.promise();
        }

        var sSourceAppStateKey = oMatchingTarget.intentParamsPlusAllDefaults["sap-xapp-state"]
            && oMatchingTarget.intentParamsPlusAllDefaults["sap-xapp-state"][0];
        if (sSourceAppStateKey) {
            getAppStateData(oAppStateService, sSourceAppStateKey)
                .then(checkValidAppStateData)
                .then(function (oValidAppStateData) {
                    if (hasExtendedUserDefaults(oResolutionResult)) {
                        var oParameterDominatorMap = oCSTRUtils.constructParameterDominatorMap(oSignature.parameters);
                        Object.keys(oResolutionResult.oNewAppStateMembers).forEach(function (sAppStateMemberName) {
                            var aDominatorParams = oParameterDominatorMap[sAppStateMemberName].dominatedBy;
                            if (isParameterContainedInSelectionVariant(oValidAppStateData, aDominatorParams)) {
                                delete oResolutionResult.oNewAppStateMembers[sAppStateMemberName];
                            }
                        });
                    }

                    var bIgnoreAdditionalParameters = oSignature.additionalParameters === "ignored";
                    if (!hasExtendedUserDefaults(oResolutionResult) && !hasRenameTo(oMatchingTarget) && !bIgnoreAdditionalParameters) {
                        // keep old AppState
                        cleanupAndResolve(oDeferred, oMatchingTarget);
                        return;
                    }

                    oNewAppState = oAppStateService.createEmptyAppState(undefined, true);
                    if (oNewAppState) {
                        oNewAppState.setData(oValidAppStateData);
                        mergeAppState(oNewAppState, oMatchingTarget, oDeferred);
                    }
                }, function () { // invalid app state data
                    delete oResolutionResult.oNewAppStateMembers; // remove all extended user defaults
                    cleanupAndResolve(oDeferred, oMatchingTarget); // keep old app state
                    return;
                });

            return oDeferred.promise();
        }

        if (hasExtendedUserDefaults(oResolutionResult)) {
            var oEmptyAppState = oAppStateService.createEmptyAppState(undefined, true);
            mergeAppState(oEmptyAppState, oMatchingTarget, oDeferred);
            return oDeferred.promise();
        }

        // no need to rename in nonexisting appstate
        cleanupAndResolve(oDeferred, oMatchingTarget);

        return oDeferred.promise();
    }

    function mergeAppState (oNewAppState0, oMatchingTarget, oDeferred) {
        // at this point, oNewAppState Members only contains members which are to be added!
        // (there should be no collisions!)
        var oNewAppStateData = oNewAppState0.getData() || {},
            oSelectionVariant,
            oChangeRecorder = {},
            oSignature = oMatchingTarget.inbound.signature,
            oResolutionResult = oMatchingTarget.resolutionResult;

        if (oNewAppStateData.selectionVariant) {
            oSelectionVariant = new SelectionVariant(JSON.stringify(oNewAppStateData.selectionVariant));
        } else {
            oSelectionVariant = new SelectionVariant();
        }

        if (hasExtendedUserDefaults(oResolutionResult)) {
            Object.keys(oResolutionResult.oNewAppStateMembers).forEach(function (sName) {
                oSelectionVariant.massAddSelectOption(sName, oResolutionResult.oNewAppStateMembers[sName].Ranges);
            });
        }

        var bIgnoreAdditionalParameters = oSignature.additionalParameters === "ignored";
        oSelectionVariant = renameAndRemoveDuplicates(oSelectionVariant, oChangeRecorder, oSignature.parameters, bIgnoreAdditionalParameters);

        if (oSelectionVariant.getParameterNames().length !== 0 || oSelectionVariant.getSelectOptionsPropertyNames().length !== 0 || oChangeRecorder.deleted) {
            oNewAppStateData.selectionVariant = oSelectionVariant.toJSONObject();
        }

        if (!oChangeRecorder.changed && !oChangeRecorder.deleted && !hasExtendedUserDefaults(oResolutionResult)) {
            // there was no effective change -> retain old appstate
            cleanupAndResolve(oDeferred, oMatchingTarget);
            return;
        }
        oNewAppState0.setData(oNewAppStateData);
        oNewAppState0.save().done(function () {
            oMatchingTarget.intentParamsPlusAllDefaults["sap-xapp-state"] = [oNewAppState0.getKey()];
            oMatchingTarget.mappedIntentParamsPlusSimpleDefaults["sap-xapp-state"] = [oNewAppState0.getKey()];
            cleanupAndResolve(oDeferred, oMatchingTarget);
        });
    }

    function cleanupAndResolve (oDeferred, oMatchingTarget) {
        var oNavModeProperties;

        removeUnusedComplexParameterValuesFromDefaultList(oMatchingTarget);
        mapDefaultParameterNames(oMatchingTarget);

        // compute NavigationMode
        oNavModeProperties = oNavigationMode.compute(
            ObjectPath.get("inbound.resolutionResult.applicationType", oMatchingTarget),
            (oMatchingTarget.intentParamsPlusAllDefaults["sap-ushell-next-navmode"] || [])[0],
            (oMatchingTarget.intentParamsPlusAllDefaults["sap-ushell-navmode"] || [])[0],
            (oAppConfiguration.getCurrentApplication() || {}).applicationType,
            Config.last("/core/navigation/enableInPlaceForClassicUIs")
        );
        oUtils.shallowMergeObject(oMatchingTarget.resolutionResult, oNavModeProperties);

        // remove oNewAppStateMembers as it is not needed afterwards anymore
        delete oMatchingTarget.resolutionResult.oNewAppStateMembers;
        oDeferred.resolve(oMatchingTarget);
    }

    function hasExtendedUserDefaults (oResolutionResult) {
        return oResolutionResult.oNewAppStateMembers && !isEmptyObject(oResolutionResult.oNewAppStateMembers);
    }

    function isPresentProperty (aList, aParamName) {
        return Array.isArray(aList) && aList.some(function (oMember) {
            return (aParamName.indexOf(oMember) !== -1);
        });
    }

    function isParameterContainedInSelectionVariant (oAppStateData, aParamName) {
        // check whether parameter exists as part of selectionVariant.Parameters or SelectOptions
        if (oAppStateData && oAppStateData.selectionVariant) {
            var oSelectionVariant = new SelectionVariant(JSON.stringify(oAppStateData.selectionVariant)),
                aSelectionVariantSelectOptionsPropertyNames = (oSelectionVariant.getSelectOptionsPropertyNames() || []),
                aSelectionVariantParameterNames = (oSelectionVariant.getParameterNames() || []);

            if (isPresentProperty(aSelectionVariantSelectOptionsPropertyNames, aParamName) ||
                isPresentProperty(aSelectionVariantParameterNames, aParamName)) {
                return true;
            }
        }
        return false;
    }

    function renameAndRemoveDuplicates (oSelectionVariant, oRecordChange, oParameters, bIgnoreAdditionalParameters) {
        var oResultingSelectionVariant = new SelectionVariant(),
            aSelectionVariantParameterNames = (oSelectionVariant.getParameterNames() || []),
            aSelectionVariantSelectOptionsPropertyNames = (oSelectionVariant.getSelectOptionsPropertyNames() || []),
            sParamValue,
            aSelectOption;

        // Rename parameters and remove duplicates
        aSelectionVariantParameterNames.forEach(function (sParamName) {
            sParamValue = oSelectionVariant.getParameter(sParamName);

            // ignore parameter if it's not required
            if (bIgnoreAdditionalParameters && !oParameters[sParamName]) {
                oRecordChange.deleted = true;
                return;
            }

            if (oParameters[sParamName] && oParameters[sParamName].renameTo) { // parameter is in signature
                // Check whether a parameter with the -renameTo- name already exists as part of the SelectionVariant
                if ((oResultingSelectionVariant.getParameter(oParameters[sParamName].renameTo) === undefined) &&
                    (oResultingSelectionVariant.getSelectOption(oParameters[sParamName].renameTo) === undefined)) {

                    oResultingSelectionVariant.addParameter(oParameters[sParamName].renameTo, sParamValue);
                    oRecordChange.changed = true;
                } else {
                    Log.error("renaming of appstate creates duplicates " + sParamName + "->" + oParameters[sParamName].renameTo);
                }
            } else if ((oResultingSelectionVariant.getParameter(sParamName) === undefined) &&
                (oResultingSelectionVariant.getSelectOption(sParamName) === undefined)) {
                oResultingSelectionVariant.addParameter(sParamName, sParamValue);
            }
        });

        // Rename SelectOptions and remove duplicates
        aSelectionVariantSelectOptionsPropertyNames.forEach(function (sSelectOptionPropertyName) {
            aSelectOption = oSelectionVariant.getSelectOption(sSelectOptionPropertyName);

            // ignore parameter if it's not required
            if (bIgnoreAdditionalParameters && !oParameters[sSelectOptionPropertyName]) {
                oRecordChange.deleted = true;
                return;
            }

            if (oParameters[sSelectOptionPropertyName] && oParameters[sSelectOptionPropertyName].renameTo) {
                // Check whether a parameter with the -renameTo- name already exists as part of the SelectionVariant
                if ((oResultingSelectionVariant.getSelectOption(oParameters[sSelectOptionPropertyName].renameTo) === undefined) &&
                    (oResultingSelectionVariant.getParameter(oParameters[sSelectOptionPropertyName].renameTo) === undefined)) {
                    oResultingSelectionVariant.massAddSelectOption(oParameters[sSelectOptionPropertyName].renameTo, aSelectOption);
                    oRecordChange.changed = true;
                } else {
                    Log.error("renaming of appstate creates duplicates " + sSelectOptionPropertyName + "->" + oParameters[sSelectOptionPropertyName].renameTo);
                }
            } else if ((oResultingSelectionVariant.getSelectOption(sSelectOptionPropertyName) === undefined) &&
                (oResultingSelectionVariant.getParameter(sSelectOptionPropertyName) === undefined)) {
                oResultingSelectionVariant.massAddSelectOption(sSelectOptionPropertyName, aSelectOption);
            }
        });

        // Remove all parameters from source SelectionVariant
        aSelectionVariantParameterNames.forEach(function (sParamName) {
            oSelectionVariant.removeParameter(sParamName);
        });
        // Remove all SelectOptions from source SelectionVariant
        aSelectionVariantSelectOptionsPropertyNames.forEach(function (sSelectOptionPropertyName) {
            oSelectionVariant.removeSelectOption(sSelectOptionPropertyName);
        });

        // Copy all parameters and SelectOptions from resulting SelectionVariant into source SelectionVariant,
        // because other important attributes as ID, Text, ParameterContextUrl, FilterContextUrl need to be kept as they were before
        oResultingSelectionVariant.getParameterNames().forEach(function (sParamName) {
            oSelectionVariant.addParameter(sParamName, oResultingSelectionVariant.getParameter(sParamName));
        });
        oResultingSelectionVariant.getSelectOptionsPropertyNames().forEach(function (sSelectOptionPropertyName) {
            oSelectionVariant.massAddSelectOption(sSelectOptionPropertyName, oResultingSelectionVariant.getSelectOption(sSelectOptionPropertyName));
        });

        return oSelectionVariant;
    }

    function isInvalidAppStateData (oData) {
        if (oData === undefined || isPlainObject(oData)) {
            return false;
        }
        return true;
    }

    /**
     * return true iff any of the signature parameters of oMatchingTarget indicate a renaming is happening
     *
     * @param {object} oMatchingTarget a matchign target
     * @return {boolean} whether a renaming is part of the signature
     */
    function hasRenameTo (oMatchingTarget) {
        return oMatchingTarget.inbound && oMatchingTarget.inbound.signature && oMatchingTarget.inbound.signature.parameters
            && Object.keys(oMatchingTarget.inbound.signature.parameters).some(function (sKey) {
                return !!(oMatchingTarget.inbound.signature.parameters[sKey].renameTo);
            });
    }

    /**
     * Clean up the unused complex parameter values from the default list
     *
     * After the invocation, the oMatchingTarget.resolutionResult.oNewAppStateMembers contains the
     * actually *used* members (members present are deleted from the collection) Thus all defaultedParameterNames
     * which are  thus the following defaultedParameterNames can be a) complex and b) not part of
     * oMatchingTarget.resolutionResult.oNewAppStateMembers can be removed, as they were effectively not defaulted
     *
     * @param {object} oMatchingTarget the matching target
     * @private
     */
    function removeUnusedComplexParameterValuesFromDefaultList (oMatchingTarget) {
        oMatchingTarget.defaultedParamNames = oMatchingTarget.defaultedParamNames.filter(function (sName) {
            if (oMatchingTarget.intentParamsPlusAllDefaults[sName] && !Array.isArray(oMatchingTarget.intentParamsPlusAllDefaults[sName])) {
                if (!(oMatchingTarget.resolutionResult.oNewAppStateMembers && oMatchingTarget.resolutionResult.oNewAppStateMembers[sName])) {
                    return false;
                }
            }
            return true;
        });
    }

    /**
     * read: defaultedParamNames
     *       inbound.signature.parameters
     * created: mappedDefaultedParamNames
     *
     * @param {object} oMatchingTarget the matching target
     * @private
     */
    function mapDefaultParameterNames (oMatchingTarget) {
        var oParameters = (ObjectPath.get("inbound.signature.parameters", oMatchingTarget) || {}),
            oMap = {};
        oMatchingTarget.defaultedParamNames.forEach(function (sName) {
            var sNewName = (oParameters[sName] && oParameters[sName].renameTo) || sName;
            if (oMap[sNewName]) {
                Log.error("renaming of defaultedParamNames creates duplicates" + sName + "->" + sNewName);
            } else {
                oMap[sNewName] = true;
            }
        });
        oMatchingTarget.mappedDefaultedParamNames = Object.keys(oMap).sort();
    }

    function checkValidAppStateData (oAppStateData) {
        if (isInvalidAppStateData(oAppStateData)) {
            return Promise.reject();
        }
        return Promise.resolve(oAppStateData);
    }

    function getAppStateData (oAppStateService, sAppStateKey) {
        return new Promise(function (fnResolve, fnReject) {
            oAppStateService.getAppState(sAppStateKey).done(function (oAppState) {
                fnResolve(oAppState.getData());
            }).fail(function (sError) {
                fnReject(sError);
            });
        });
    }

    return {
        mixAppStateIntoResolutionResultAndRename: mixAppStateIntoResolutionResultAndRename,
        _hasRenameTo: hasRenameTo
    };
});
