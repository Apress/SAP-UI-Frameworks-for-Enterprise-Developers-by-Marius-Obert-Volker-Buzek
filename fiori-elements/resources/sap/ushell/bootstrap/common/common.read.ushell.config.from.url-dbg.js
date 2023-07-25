// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/*
 * @fileOverview This module reads the sap-ushell-xx-overwrite-config query parameter from the URL
 * and generates an object out of it which can be merged with the ushell config.
 *
 * @private
 * @version
 */
sap.ui.define([
    "sap/base/util/ObjectPath"
], function (ObjectPath) {
    "use strict";

    /* Possible block list entries:
        - "a/b/c": [] --> a/b/c cannot be overwritten at all
        - "a/b/c": [ 1, 2 ] --> a/b/c cannot be overwritten with the values 1 or 2 but with any other value like 3
    */
    var oBlockList = {
        "renderers/fiori2/componentData/config/enablePersonalization": [true], // switch off only

        // Session handling
        "renderers/fiori2/componentData/config/sessionTimeoutReminderInMinutes": [],
        "renderers/fiori2/componentData/config/sessionTimeoutIntervalInMinutes": [],
        "renderers/fiori2/componentData/config/sessionTimeoutTileStopRefreshIntervalInMinutes": [],
        "renderers/fiori2/componentData/config/enableAutomaticSignout": [false], // switch on only

        // abap user must no be overwritten
        "services/Container/adapter/config/id": [], // user id
        "services/Container/adapter/config/firstName": [],
        "services/Container/adapter/config/lastName": [],
        "services/Container/adapter/config/fullName": [],

        // cdm user must no be overwritten
        "services/Container/adapter/config/userProfile/defaults/id": [], // user id
        "services/Container/adapter/config/userProfile/defaults/firstName": [],
        "services/Container/adapter/config/userProfile/defaults/lastName": [],
        "services/Container/adapter/config/userProfile/defaults/fullName": [],

        // The usageRecorder serviceUrl must not be overwritten for security reasons
        "services/NavTargetResolution/config/usageRecorder/serviceUrl": []
    };

    function isBlockListed (oConsideredBlockList, oEntry) {
        var aBlockListEntry,
            i;
        var sFullPropertyPath = "";

        if (oEntry.namespace) {
            sFullPropertyPath = oEntry.namespace + "/";
        }
        sFullPropertyPath += oEntry.propertyName;

        aBlockListEntry = oConsideredBlockList[sFullPropertyPath];
        if (!aBlockListEntry) {
            return false;
        }

        if (Array.isArray(aBlockListEntry)) {
            if (aBlockListEntry.length === 0) {
                return true;
            }
            // check if the value is on the value block list
            for (i = 0; i < aBlockListEntry.length; i += 1) {
                if (aBlockListEntry[i] === oEntry.value) {
                    return true;
                }
            }
            // the specified value is not on the block list
            return false;
        }

        throw new Error("Block list entry '" + sFullPropertyPath + "'has an unknown type");
    }

    function parseValue (sValue) {
        var nTempNumber;

        // booleans
        if (sValue === "false") {
            return false;
        }
        if (sValue === "true") {
            return true;
        }

        // numbers
        nTempNumber = Number.parseFloat(sValue);
        if (!Number.isNaN(nTempNumber)) {
            return nTempNumber;
        }

        // just a string
        return sValue;
    }

    function getConfigFromWindowLocation (oWindowLocation) {
        var aParsedQueryParamValue,
            aOverwrittenEntryCandidates;
        var aOverwrittenEntries = [];
        var oFinalConfig = {};
        // To conform with the specification of the query string ("application/x-www-form-urlencoded")
        // see: https://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.1
        var search = oWindowLocation.search.replace("+", " ");

        // find the parameter value
        aParsedQueryParamValue = /[?&]sap-ushell-xx-overwrite-config=([^&$]*)(&|$)/
            .exec(search);
        if (aParsedQueryParamValue === null) {
            return {};
        }

        // multiple entries can be overwritten at the same time, so split them
        aOverwrittenEntryCandidates = aParsedQueryParamValue[1].split(",");

        // prepare entries
        aOverwrittenEntryCandidates
            .forEach(function (sCandidate) { // .map is not used as invalid parameters are skipped
                var aParts = decodeURIComponent(sCandidate).split(":");
                var aNamespaceParts = /^\/?(.*)\/([^/]*)$/ // namespaces may contain a leading / as in sap-ui-debug
                        .exec(aParts[0]);
                var oEntry;

                if (aNamespaceParts === null) {
                    return;
                }

                oEntry = {
                    namespace: aNamespaceParts[1],
                    propertyName: aNamespaceParts[2],
                    value: parseValue(decodeURIComponent(aParts[1]))
                };

                if (isBlockListed(oBlockList, oEntry)) {
                    return;
                }

                aOverwrittenEntries.push(oEntry);
            });

        // convert entries to config
        aOverwrittenEntries.forEach(function (oOverwrite) {
            var vValue = oOverwrite.value;
            var sNamespace = oOverwrite.namespace.replace(/\//g, ".");
            var oNamespace = ObjectPath.get(sNamespace, oFinalConfig);

            if (oNamespace === undefined) {
                // create namespace as not existing yet
               ObjectPath.set(sNamespace, {}, oFinalConfig);
               oNamespace = ObjectPath.get(sNamespace, oFinalConfig);
            }

            //To be decided: support JSON properties?
            oNamespace[oOverwrite.propertyName] = vValue;
        });

        return oFinalConfig;
    }

    return {
        getConfig: getConfigFromWindowLocation.bind(null, window.location),
        _getConfigFromWindowLocation: getConfigFromWindowLocation,
        _isBlockListed: isBlockListed
    };
});
