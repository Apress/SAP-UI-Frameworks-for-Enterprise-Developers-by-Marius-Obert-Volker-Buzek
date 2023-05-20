/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([

], function() {
    "use strict";

    var RedlineUpgradeManager = {};

    /**
    * List of all versions of collaboration schema.
    *
    *  To add a new schema version:
    * - Add a new entry to this array for a new schema version.
    * - upgradeTargetVersion of the previously latest version to be set to the new latest version.
    * - Provide upgradeFunction for the previously latest version.
    * - The latest schema version should not have upgradeTargetVersion & upgradeFunction.
    * - Add comments describing schema change.
    */

    RedlineUpgradeManager.schemaVersions = [
        {
            version: "1.0"
        }
    ];

    /**
    *
    * Current latest schema version.
    *
    */
    RedlineUpgradeManager.currentSchema = RedlineUpgradeManager.schemaVersions[RedlineUpgradeManager.schemaVersions.length - 1];

    /**
    * Performs the upgrade and returns json conforming to the latest version of schema.
    * @param {any} json The collaboration JSON to be checked
    * @returns {any} The collaboration JSON upgraded to latest schema version
    */
    RedlineUpgradeManager.upgrade = function(json) {
        return RedlineUpgradeManager._upgradeIfRequired(json);
    };

    RedlineUpgradeManager._upgradeIfRequired = function(json) {
        var upgradedJson;

        if (json.hasOwnProperty("schemaVersion")) {
            json.schemaVersion = json.schemaVersion ? json.schemaVersion : "1.0";
        } else {
            json.schemaVersion = "1.0";
        }

        if (RedlineUpgradeManager.currentSchema.version !== json.schemaVersion) {
            var jsonSchema = RedlineUpgradeManager.schemaVersions.find(function(sv) {
                return sv.version === json.schemaVersion;
            });

            if (jsonSchema && jsonSchema.upgradeFunction) {
                upgradedJson = jsonSchema.upgradeFunction(json);
                upgradedJson.schemaVersion = jsonSchema.upgradeTargetVersion;
                upgradedJson = RedlineUpgradeManager._upgradeIfRequired(upgradedJson);
            } else {
                throw "There is no rule to upgrade Redline JSON from schema version " + json.schemaVersion;
            }
        } else {
            upgradedJson = json;
        }

        return upgradedJson;
    };

    return RedlineUpgradeManager;
});
