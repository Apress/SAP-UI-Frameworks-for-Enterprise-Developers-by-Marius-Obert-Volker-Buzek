// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ushell/services/_Personalization/WindowAdapterContainer"
], function (jQuery, WindowAdapterContainer) {
    "use strict";

    /**
     * Container for storage with window validity, data is stored in WindowAdapter.prototype.data
     *
     * @param {object} oPersonalizationService
     *            ignored
     * @param {object} oBackendAdapter
     *            BackendAdapter -> may be undefined
     *
     * @private
     */

    var WindowAdapter = function (oPersonalizationService, oBackendAdapter) {
        this._oBackendAdapter = oBackendAdapter;

        if (oBackendAdapter) {
            this.supportsGetWithoutSubsequentLoad = oBackendAdapter.supportsGetWithoutSubsequentLoad;
        }
    };

    WindowAdapter.prototype.data = {};

    WindowAdapter.prototype.getAdapterContainer = function (sContainerKey, oScope, sAppName) {
        var oBackendContainer = this._oBackendAdapter && this._oBackendAdapter.getAdapterContainer(sContainerKey, oScope, sAppName);
        return new WindowAdapterContainer(sContainerKey, oScope, oBackendContainer, WindowAdapter);
    };

    WindowAdapter.prototype.delAdapterContainer = function (sContainerKey, oScope) {
        var oDeferred = new jQuery.Deferred();
        delete WindowAdapter.prototype.data[sContainerKey];
        if (this._oBackendAdapter) {
            this._oBackendAdapter.delAdapterContainer(sContainerKey, oScope).done(function () {
                oDeferred.resolve();
            }).fail(function (sMsg) {
                oDeferred.reject(sMsg);
            });
        } else {
            oDeferred.resolve();
        }
        return oDeferred.promise();
    };

    return WindowAdapter;

});
