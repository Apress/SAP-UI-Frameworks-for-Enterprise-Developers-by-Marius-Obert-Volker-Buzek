// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview
 *
 * Exposes functions to create the system context.
 *
 * <p>This is a dependency of ClientSideTargetResolution. Interfaces exposed
 * by this module may change at any time without notice.</p>
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/base/util/ObjectPath",
    "sap/ui/thirdparty/URI"
], function (ObjectPath, URI) {
    "use strict";

    var SystemContext = {};

    /**
     * Returns the protocol currently used by the browser.
     * @returns {string} The current protocol.
     *
     * @private
     * @since 1.78.0
     */
    SystemContext._getProtocol = function () {
        return new URI(window.location.toString()).protocol();
    };

     /**
      * @typedef {object} SystemContext
      * An object representing the context of a system.
      * @property {function} getFullyQualifiedXhrUrl
      * A function that returns a URL to issue XHR requests to a service endpoint (existing on a specific system)
      * starting from the path to a service endpoint (existing on all systems).
      * The given path should not be fully qualified.
      * Any fully qualified path will be returned unchanged to support cases where the caller does not control the path (e.g., path argument coming from external data),
      * or a request should be issued to a specific system in the context of the current system.
      * @property {function} getProperty
      * A function that returns the value of a property which may or may not be known in the context of the specific system.
      * Given input values are namespaced, e.g., "esearch.provider".
      * This function returns undefined when the property cannot be obtained
      * from the system context. Other types of return values than undefined
      * represent that the property was defined or configured in the context
      * of the system.
      */

    /**
     * Returns the systemContext of a given contentProvider.
     * @param {object} systemAlias The SystemAlias of which the system context should be returned.
     * @returns {Promise<SystemContext>} A Promise that resolves to the systemContext of the given SystemAlias.
     *
     * @private
     * @since 1.78.0
     */
    SystemContext.createSystemContextFromSystemAlias = function (systemAlias) {
        return {
            id: systemAlias.id,
            label: systemAlias.label || systemAlias.id,
            getFullyQualifiedXhrUrl: function (sPath) {
                var sPathProtocol = new URI(sPath).protocol();

                //Absolute URLs are not changed
                if (sPathProtocol === "http" || sPathProtocol === "https") {
                    return sPath;
                }

                var sProtocol = this._getProtocol();
                var sPathPrefix = "";

                if (sProtocol === "https") {
                    sPathPrefix = ObjectPath.get("https.xhr.pathPrefix", systemAlias) || "";
                } else if (sProtocol === "http") {
                    sPathPrefix = ObjectPath.get("http.xhr.pathPrefix", systemAlias) || "";
                }

                if (sPathPrefix) {
                    if (sPath.indexOf("dynamic_dest") > -1) {
                        return sPath;
                    }
                    return URI.joinPaths(sPathPrefix, sPath).query(new URI(sPath).query()).href();
                }

                return sPath;
            }.bind(this),
            getProperty: function (sPropertyKey) {
                var oAvailableProperties = ObjectPath.get("properties", systemAlias) || {};

                return oAvailableProperties[sPropertyKey];
            }
        };
    };
    return SystemContext;
});
