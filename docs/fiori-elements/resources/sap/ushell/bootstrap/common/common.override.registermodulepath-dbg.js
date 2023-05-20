// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

// Copied from sap/ushell_abap/pbServices/ui2/Utils.js,
// for now only a temporary workaround to get smart business tiles running.
//
// Apps following the released version of the re-use guideline should not need this
//
// TODO: remove or productize when decision for path normalization is final
sap.ui.define([
    "jquery.sap.global", // LEGACY API (deprecated) - keep for the third party legacy calls
    "sap/ui/thirdparty/URI"
], function (
    jQuery,
    URI
) {
    "use strict";

    function overrideRegisterModulePath () {
        /**
         * @deprecated As of version 1.96
         * @private
         */
        (function () {
            var fnRegisterModulePath = jQuery.sap.registerModulePath; // LEGACY API (deprecated) - keep for the third party legacy calls

            jQuery.sap.registerModulePath = function (sModuleName, vUrlPrefix) {
                // since 1.28, registerModulePath can take either a URL string or an object of form {url: "url", "final": true}
                if (typeof vUrlPrefix === "object") {
                    vUrlPrefix.url = removeCBAndNormalizeUrl(vUrlPrefix.url);
                } else if (typeof vUrlPrefix === "string") {
                    vUrlPrefix = removeCBAndNormalizeUrl(vUrlPrefix);
                }
                // any other types are just passed through

                fnRegisterModulePath(sModuleName, vUrlPrefix);
            };
        }());
    }

    /**
     * Removes a cache buster token (if available) of an Url and normalizes the url afterwards
     * @param {string} sUrl
     *  the URL to be normalized
     * @returns {string}
     *   normalized url (without a cache buster token)
     *
     * @private
     */
    function removeCBAndNormalizeUrl (sUrl) {
        var aMatches,
            sUrlPrefix,
            sCacheBusterSegment,
            sUrlPostfix;

        if (typeof sUrl !== "string" || sUrl === "" || isUriWithRelativeOrEmptyPath(sUrl)) {
            return sUrl;
        }

        function isUriWithRelativeOrEmptyPath (sUrl0) {
            var oUri = new URI(sUrl0),
                sPath = oUri.path();

            if (oUri.is("absolute")) {
                return false;
            }

            if (sPath && sPath.charAt(0) === "/") {
                return false;
            }

            return true;
        }

        // split up the URL into 3 parts: prefix, cache-buster segment, postfix
        // leading slashes are always part of the segment, the postfix might have a trailing slash
        aMatches = sUrl.match(/(.*)(\/~[\w-]+~[A-Z0-9]?)(.*)/);
        if (aMatches) {
            sUrlPrefix = aMatches[1];
            sCacheBusterSegment = aMatches[2];
            sUrlPostfix = aMatches[3];
        }

        function normalizePath (sUrl0) {
            return new URI(sUrl0).normalizePathname().toString();
        }

        function isRelativePathWithDotSegmentsThatGoOutside (sPath) {
            var aSegments = new URI(sPath).segment(),
                i,
                iPos = 0;

            for (i = 0; i < aSegments.length && iPos >= 0; i += 1) {
                if (aSegments[i] === "..") {
                    iPos = iPos - 1;
                } else {
                    iPos = iPos + 1;
                }
            }

            return iPos < 0;
        }

        // check if URL contains a cache-buster token
        if (sCacheBusterSegment) {
            // check if removal of cache-buster token is required
            if (sUrlPostfix && isRelativePathWithDotSegmentsThatGoOutside(sUrlPostfix)) {
                // remove the cache-buster token
                sUrl = sUrlPrefix + sUrlPostfix;
            }
        }

        // always normalize the URL path
        return normalizePath(sUrl);
    }

    return overrideRegisterModulePath;
});
