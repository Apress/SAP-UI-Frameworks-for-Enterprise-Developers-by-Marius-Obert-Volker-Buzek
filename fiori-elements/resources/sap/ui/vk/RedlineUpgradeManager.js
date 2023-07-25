/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define([],function(){"use strict";var e={};e.schemaVersions=[{version:"1.0"}];e.currentSchema=e.schemaVersions[e.schemaVersions.length-1];e.upgrade=function(r){return e._upgradeIfRequired(r)};e._upgradeIfRequired=function(r){var s;if(r.hasOwnProperty("schemaVersion")){r.schemaVersion=r.schemaVersion?r.schemaVersion:"1.0"}else{r.schemaVersion="1.0"}if(e.currentSchema.version!==r.schemaVersion){var n=e.schemaVersions.find(function(e){return e.version===r.schemaVersion});if(n&&n.upgradeFunction){s=n.upgradeFunction(r);s.schemaVersion=n.upgradeTargetVersion;s=e._upgradeIfRequired(s)}else{throw"There is no rule to upgrade Redline JSON from schema version "+r.schemaVersion}}else{s=r}return s};return e});