// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Transforms relative URIs as used e.g. for data sources in the
 * manifest.json
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ui/thirdparty/URI"
], function (URI) {

    "use strict";

    /**
     * Transforms a URI, which is relative to its parent URI, and the parent URI, which
     * is relative to a base URI, so that these - the URI and the parent URI - refer
     * to a new base URI instead.
     *
     * transform(...) in addition calculates the absolute URI location of the URI provided.
     *
     * Use case:
     * - The URI holds the OData service internal path to a resource providing
     *   the value dynamically indicated on a tile of the SAP Fiori launch pad.
     * - The parent URI points to the root of the underlying OData service.
     * - The base URI points to the component launched when the tile is clicked.
     *   It serves as reference point for a relative parent URI.
     * - The new base URI (absolute) points to the html page currently executed
     *   in the browser
     *
     * The URI, the parent URI and the base URI may be "relative" (without a host and
     * not starting from the root directory '/') or "absolute" (with or without a host
     * starting from the root directory.
     *
     * @param  {string} sUri
     *  URI, absolute or relative
     * @param  {string} sUriParent
     *  Parent URI, reference point if URI is relative; may be null, absolute or relative
     * @param  {string} sUriBase
     *  Base URI, reference point for parent URI; absolute or relative, refers to current page if null
     * @param  {string} sUriNewBase
     *  New base URI; absolute, refers to current page if null
     * @returns {object}
     *  having the attributes "uri", "uriParent", "uriRelative", "uriBase" and "uriAbsolute"
     */
    function transform (sUri, sUriParent, sUriBase, sUriNewBase) {
        // Handle uri is relative (=absolute (with protocoll and host) or relative to root)
        var oUri = (isNonEmptyString(sUri)) ? new URI(sUri) : null;
        if (!oUri) {
            return { error: "Error: Parameter sUri is empty or not a string, use case not supported." };
        }

        if (!isRelative(oUri)) {
            return result(sUri, null, null, null, sUri);
        }

        // Handle uri is relative and parent uri is absolute
        var oUriParent = (isNonEmptyString(sUriParent)) ? new URI(sUriParent) : null;
        if (oUriParent && !isRelative(oUriParent)) {
            return result(sUri, sUriParent, null, null, oUri.absoluteTo(oUriParent));
        }

        // Get absolute uri of current page
        var oUriPageAbsolute = new URI().search("");
        if (oUriPageAbsolute.toString() === "") { // for unit testing without browser
            oUriPageAbsolute = new URI("https://x.y.z:8443/sap/bc/ui5_ui5/ui2/ushell/test-resources/sap/ushell/shells/cdm/fioriCDM.html?params");
        }

        // Handle uri and parent uri is relative and base uri is absolute and new base is initial
        var oUriBase = (isNonEmptyString(sUriBase)) ? new URI(makePath(sUriBase)) : oUriPageAbsolute;
        if (!isRelative(oUriBase) && !sUriNewBase) {
            return result(sUri, sUriParent, URI.joinPaths(oUriParent, oUri), toDirectoryBase(oUriBase),
                URI.joinPaths(oUriParent, oUri).absoluteTo(oUriBase)
            );
        }

        // All use cases without new Uri Base have been handled above
        var oUriNewBase = (isNonEmptyString(sUriNewBase)) ? new URI(sUriNewBase) : oUriPageAbsolute;
        if (!oUriBase || !oUriNewBase.toString()) {
            return { error: "Error: Parameter sUriNewBase is empty or not a string, use case not supported." };
        }

        // Error if uri new base is not absolute
        if (isRelative(oUriNewBase)) {
            return { error: "Error: Parameter sUriNewBase is a relative uri, but must be absolute." };
        }

        // Handle uri, parent uri and base uri are relative, new base is absolute
        if (isRelative(oUriBase) && !isRelative(oUriNewBase)) {
            oUriBase = oUriBase.absoluteTo(oUriNewBase);
        }

        // Handle uri and parent uri are relative, base uri as well as new base are absolute
        if (!isRelative(oUriBase) && !isRelative(oUriNewBase)) {
            // Error if host of base uri is given and does not match that of new base
            if (oUriBase.host() && oUriNewBase.host() && oUriBase.host() != oUriNewBase.host()) {
                return { error: "Error: Hosts of the parameters sUriBase and sUriNewBase are given but do not match." };
            }

            // Relative uri from new base to base
            var oUriNewBaseToBaseRelative = new URI(directoryPath(oUriBase)).relativeTo(directoryPath(oUriNewBase));
            var oUriAbsolute;
            if (isNonEmptyString(sUriParent)) {
                oUriAbsolute = oUri.absoluteTo(oUriParent.absoluteTo(oUriNewBaseToBaseRelative.absoluteTo(oUriNewBase)));
                var oUriParentNew = joinPaths(oUriNewBaseToBaseRelative, oUriParent);
                var oUriRelative = joinPaths(oUriParentNew, oUri);
                return result(oUri, oUriParentNew, oUriRelative, toDirectoryBase(oUriNewBase), oUriAbsolute);
            }
            oUriAbsolute = oUri.absoluteTo(oUriNewBaseToBaseRelative.absoluteTo(oUriNewBase));
            var oUriNew = joinPaths(oUriNewBaseToBaseRelative, oUri);
            oUriNew.query(oUri.query());
            return result(oUriNew, null, oUriNew, toDirectoryBase(oUriNewBase), oUriAbsolute);
        }

        return { error: "Error: Parameter combination not supported." };
    }

    // ***** Local functions *****

    // Return transformation result
    function result (oUri, oUriParent, oUriRelative, oUriBase, oUriAbsolute) {
        var result = {};
        if (oUri) {
            result.uri = oUri.toString();
        }
        if (oUriParent) {
            result.uriParent = oUriParent.toString();
        }
        if (oUriRelative) {
            result.uriRelative = oUriRelative.toString();
        }
        if (oUriBase) {
            result.uriBase = oUriBase.toString();
        }
        if (oUriAbsolute) {
            result.uriAbsolute = oUriAbsolute.toString();
        }
        return result;
    }

    // Check if uri is a relative one starting from the root folder
    function isRootRelative (oUri) {
        if (!oUri.is("relative")) {
            return false;
        }
        return oUri.toString()[0] === "/";
    }

    // Check if uri is "relative"
    function isRelative (oUri) {
        return !oUri.is("absolute") && !isRootRelative(oUri);
    }

    // Remove filename and all the other stuff
    function toDirectoryBase (oUri) {
        return oUri.filename("").search("").fragment("");
    }

    // URI.joinPaths has a bug - at least in the Node.js implementation
    function joinPaths () {
        var longPath = new URI("/1/2/3/4/5/6/7/8/9/");
        var result = longPath;
        for (var i = 0; i < arguments.length; i++) {
            result = URI.joinPaths(result, arguments[i]);
        }
        return result.relativeTo(longPath);
    }

    // Returns the directory of a URI, ending with a trailing "/"
    function directoryPath (oUri) {
        var sDirectory = oUri.directory();
        if (sDirectory === "/") {
            return "/"; // required when the path part does not end with "/" (e.g. for "https://ondemand.com/site?...")
        }
        return URI.joinPaths(sDirectory, "/").toString();
    }

    // Add trailing slash to uri if it appears to be missing
    function makePath (sUri) {
        var sUriPath = sUri;
        if (sUri) {
            var oUri_ = new URI(sUri);
            if (oUri_.filename() && oUri_.filename().indexOf(".") === -1 && oUri_.filename().slice(-1) !== "/") {
                sUriPath += "/";
            }
        }
        return sUriPath;
    }

    // Check if argument is a non empty string
    function isNonEmptyString (toCheck) {
        return (toCheck && typeof toCheck === "string");
    }

    return transform;
});
