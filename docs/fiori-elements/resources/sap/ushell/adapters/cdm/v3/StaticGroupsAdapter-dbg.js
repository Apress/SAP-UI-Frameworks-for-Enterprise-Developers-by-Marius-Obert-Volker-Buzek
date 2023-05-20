// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview The Unified Shell's LaunchPageAdapter for the
 *               'CDM' platform - Version 3 (V3)
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/adapters/cdm/v3/AdapterBase",
    "sap/ui/thirdparty/jquery"
], function (AdapterBase, jQuery) {
    "use strict";

    function StaticGroupsAdapter (oSystem, sParamterm, oAdapterConfiguration) {
        AdapterBase.call(this, oSystem, sParamterm, oAdapterConfiguration);
    }

    StaticGroupsAdapter.prototype = AdapterBase.prototype;

    StaticGroupsAdapter.prototype._addDefaultGroup = function (aGroups, oSite) {
        return aGroups;
    };

    StaticGroupsAdapter.prototype._getSiteData = function () {
        var oDeferred = new jQuery.Deferred();
        return oDeferred.resolve(this.oAdapterConfiguration.config);
    };

    return StaticGroupsAdapter;
}, /* bExport = */ false);
