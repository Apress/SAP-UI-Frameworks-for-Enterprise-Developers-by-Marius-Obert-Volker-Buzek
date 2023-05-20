// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/services/_Personalization/constants",
    "sap/ushell/services/_Personalization/constants.private",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log"
], function (oConstants, oPrivateConstants, jQuery, Log) {
    "use strict";

    /**
     * Checks if given value is part of enum
     * @returns {boolean}
     * @private
     */
    function checkIfEntryExistsInEnum (entry, passedEnum) {
        var enumElement;
        for (enumElement in passedEnum) {
            if (typeof passedEnum[enumElement] !== "function") {
                if (passedEnum.hasOwnProperty(enumElement)) {
                    if (enumElement === entry) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function addContainerPrefix (sContainerKey) {
        if (sContainerKey.length > 40) {
            Log.error("Personalization Service container key (\"" + sContainerKey + "\") should be less than 40 characters [current :" + sContainerKey.length + "]");
        }

        return oPrivateConstants.S_CONTAINER_PREFIX + sContainerKey;
    }

    /**
     * Chooses one adapter based on the given scope.
     *
     * @param {object} oOriginalScope
     *   The original, unadjusted scope.
     * @param {object} bLaunchpadReload
     *   Whether the launchpad is configured to reload on session timeout.
     * @param {object} oTransientAdapter
     *   An adapter that stores transient data.
     * @param {object} oPersistentAdapter
     *   An adapter that persists data.
     *
     * @return {variant}
     *   A loaded or not-yet-loaded adapter. If the adapter is not loaded, the
     *   return value is a function that when called returns a promise - that
     *   resolves to the adapter.
     *
     * @see #loadAdapter
     * @private
     */
    function pickAdapter (oOriginalScope, oTransientAdapter, oPersistentAdapter) {
        if (oOriginalScope && oOriginalScope.validity === 0) {
            return oTransientAdapter;
        }

        return oPersistentAdapter;
    }

    /**
     * Construct a cleansed scope object, returning only valid recognized parameters
     * This functionality is used to cleanse user input
     *
     * @param {object} oScope
     *    The original scope
     *
     * @return {object}
     *    The adjusted scope
     *
     * @private
     */
    function adjustScope (oScope) {
        var oAdjustedScope = {
            validity: Infinity,
            keyCategory: oConstants.keyCategory.GENERATED_KEY,
            writeFrequency: oConstants.writeFrequency.HIGH,
            clientStorageAllowed: false
        };

        if (oScope) {
            oAdjustedScope.validity = oScope.validity;
            if (oAdjustedScope.validity === null || oAdjustedScope.validity === undefined || typeof oAdjustedScope.validity !== "number") {
                oAdjustedScope.validity = Infinity;
            }
            if (!(typeof oAdjustedScope.validity === "number" && ((oAdjustedScope.validity >= 0 && oAdjustedScope.validity < 1000) || oAdjustedScope.validity === Infinity))) {
                oAdjustedScope.liftime = Infinity;
            }

            oAdjustedScope.keyCategory = checkIfEntryExistsInEnum(oScope.keyCategory, oConstants.keyCategory) ? oScope.keyCategory : oAdjustedScope.keyCategory;
            oAdjustedScope.writeFrequency = checkIfEntryExistsInEnum(oScope.writeFrequency, oConstants.writeFrequency) ? oScope.writeFrequency : oAdjustedScope.writeFrequency;
            if (typeof oScope.clientStorageAllowed === "boolean" && (oScope.clientStorageAllowed === true || oScope.clientStorageAllowed === false)) {
                oAdjustedScope.clientStorageAllowed = oScope.clientStorageAllowed;
            }

            //Combination of FixKey & CrossUserRead is an illegal combination because the user who was creating the container is no longer available
            //The other users have no chance to write on that container
            //if (oAdjustedScope.keyCategory === oConstants.keyCategory.FIXED_KEY && oAdjustedScope.access === oConstants.access.CROSS_USER_READ) {
            //    throw new utils.Error("Wrong defined scope. FixKey and CrossUserRead is an illegal combination: sap.ushell.services.Personalization", " ");
            // }
        }

        return oAdjustedScope;
    }

    /**
     * Loads the chosen adapter.
     *
     * @param {variant} oAdapter
     *   An object like: <pre>{
     *      lazy: <boolean>,
     *      instance: <function> or <object>
     *   }</pre>
     *
     * @returns {jQuery.Promise}
     *   A promise that resolves with a loaded adapter or rejects with an error
     *   message in case something went wrong while the adapter was being
     *   loaded.
     *
     * @private
     */
    function loadAdapter (oAdapter) {
        if (!oAdapter.lazy) {
            return jQuery.when(oAdapter.instance);
        }

        try {
            return oAdapter.create.call(null);
        } catch (oError) {
            return new jQuery.Deferred().reject(oError).promise();
        }
    }

    /**
     * Detects whether a given app component is an app variant based on the
     * component manifest.
     *
     * @param {object} [oComponent]
     *   The application component.
     *
     * @returns {boolean}
     *   Whether this application is an AppVariant
     */
    function isAppVariant (oComponent) {
        if (!oComponent) {
            return false;
        }

        var oAppManifest = oComponent.getManifestObject();
        if (!oAppManifest) {
            return false;
        }

        var sAppVarId = oAppManifest.getEntry("/sap.ui5/appVariantId");
        if (!sAppVarId) {
            return false;
        }

        var sComponentName = oAppManifest.getComponentName();
        if (sAppVarId === sComponentName) {
            return false;
        }

        return true;
    }

    function cloneToObject (oObject) {
        if (oObject === undefined) {
            return undefined;
        }
        try {
            return JSON.parse(oObject);
        } catch (e) {
            return undefined;
        }
    }

    function clone (oObject) {
        if (oObject === undefined) {
            return undefined;
        }
        try {
            return JSON.parse(JSON.stringify(oObject));
        } catch (e) {
            return undefined;
        }
    }

    return {
        adjustScope: adjustScope,
        cloneToObject: cloneToObject,
        clone: clone,
        addContainerPrefix: addContainerPrefix,
        pickAdapter: pickAdapter,
        isAppVariant: isAppVariant,
        loadAdapter: loadAdapter
    };
});
