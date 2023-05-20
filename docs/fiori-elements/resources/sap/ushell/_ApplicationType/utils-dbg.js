// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/utils/UrlParsing",
    "sap/ushell/_ApplicationType/systemAlias"
], function (urlParsing, oSystemAlias) {
    "use strict";

    function getURLParsing () {
        return urlParsing;
    }

    /**
     * Checks whether an absolute URL was typed in some configuration of the
     * inbound by the User or it's absolute becaus of a system alias was
     * provided.<br />
     *
     * @param {object} oURI
     *  The URI object to check.
     *
     * @param {string} sSystemAlias
     *  The system alias configured for this URL.
     *
     * @param {string} sSystemAliasSemantics
     *  How to interpret the system alias in relation to a configured URL. This
     *  can be one of the following two strings:
     *  <ul>
     *  <li>applied (default): the system alias was already applied to the URL</li>
     *  <li>apply: the system alias is to be applied to the URL</li>
     *  </ul>
     *
     * @returns {boolean}
     *  Whether the URL provided was defined as absolute by the user.
     *
     * @throws
     *  An error with a message is thrown if an invalid value of
     *  sSystemAliasSemantics is provided.
     *
     * @private
     */
    function absoluteUrlDefinedByUser (oURI, sSystemAlias, sSystemAliasSemantics) {
        if (!sSystemAliasSemantics // default semantics is 'applied'
            || sSystemAliasSemantics === oSystemAlias.SYSTEM_ALIAS_SEMANTICS.applied) {
            // In 'applied' semantics, the system alias is already
            // applied to the URL. Therefore it has protocol,
            // port and (part of the) path because the system alias was already
            // given as pre-interpolated.

            return oSystemAlias.isAbsoluteURI(oURI)
                && !sSystemAlias; // no system alias -> user has typed in the absolute URL
        }

        if (sSystemAliasSemantics === oSystemAlias.SYSTEM_ALIAS_SEMANTICS.apply) {
            // In 'apply' semantic, the system alias is not pre-interpolated to
            // the URL, but must be applied to the URL.  This excludes the
            // possibility that the URL is absolute because a system alias was
            // provided... and therefore it MUST have been typed in as absolute
            // URL by the user!

            return oSystemAlias.isAbsoluteURI(oURI);
        }

        throw new Error("Invalid system alias semantics: '" + sSystemAliasSemantics + "'");
    }

    /**
     * Append the given parameters to the URL.
     *
     * @param {object} sParameters
     *   a string of parameters to append to the url. For example like:
     *   <code>A=1&B=2&C=3</code>
     *
     * @param {string} sUrl
     *   the URL to append parameters to
     *
     * @returns {string}
     *   the URL with the parameters appended.
     *
     * @private
     */
    function appendParametersToUrl (sParameters, sUrl) {
        var sSapSystemUrlWoFragment,
            sFragment;

        if (sParameters) {
            var sUrlFragment = sUrl.match(/#.*/);
            if (sUrlFragment) {
                sFragment = sUrlFragment;
                sSapSystemUrlWoFragment = sUrl.replace(sUrlFragment, "");
            } else {
                sSapSystemUrlWoFragment = sUrl;
                sFragment = "";
            }

            sUrl = sSapSystemUrlWoFragment + ((sUrl.indexOf("?") < 0) ? "?" : "&") + sParameters + sFragment;
        }

        return sUrl;
    }

    /**
     * Append the given parameters to a remote FLP URL.
     *
     * @param {object} sParameters
     *   a string of parameters to append to the url. For example like:
     *   <code>A=1&B=2&C=3</code>
     *
     * @param {string} sUrl
     *   the Intent URL to append parameters to. For example,
     *   `/path/to/FioriLaunchpad.html#Employee-display`.
     *
     * @returns {string}
     *   the URL with the parameters appended.
     *
     * @private
     */
    function appendParametersToIntentURL (oParameters, sUrl) {
        var aUrlFragment = sUrl.match(/#.*/);

        var sUrlFragment = aUrlFragment && aUrlFragment[0];
        if (!sUrlFragment) {
            var sParameters = urlParsing.paramsToString(oParameters);

            return appendParametersToUrl(sParameters, sUrl);
        }

        var oParsedShellHash = urlParsing.parseShellHash(sUrlFragment);
        Object.keys(oParameters).forEach(function (sParameterName) {
            var sParameterValue = oParameters[sParameterName];
            oParsedShellHash.params[sParameterName] = [sParameterValue];
        });

        var oParsedShellHashDoubleEncoded = Object.keys(oParsedShellHash.params).reduce(function (o, sKey) {
            var aValue = oParsedShellHash.params[sKey];
            var aValueEncoded = aValue.map(function (sValue) {
                return encodeURIComponent(sValue);
            });

            o[encodeURIComponent(sKey)] = aValueEncoded;
            return o;
        }, {});

        oParsedShellHash.params = oParsedShellHashDoubleEncoded;

        var sUrlFragmentNoHash = sUrl.replace(sUrlFragment, "");
        var sUpdatedShellHash = urlParsing.constructShellHash(oParsedShellHash);

        return sUrlFragmentNoHash + "#" + sUpdatedShellHash;
    }

    /**
     * Set the system alias for the later use of the Iframe for internal navigation.
     * Here's how we the systemAlias is configured (in this order):
     * 1. It is taken from the sap-system property of the url (in case it exists there)
     * 2. It is taken from the sap-system default value (in case there is such a value)
     * 3. It is taken from the systemAlias property of the target mapping
     * 4. It gets a value of empty string
     *
     * @param {object} oResolutionResult
     *   The resolution result that holds the application
     *
     * @param {object} resolutionResult
     *   The resolutionResult of the target mapping
     *
     * @private
     */
    function setSystemAlias (oResolutionResult, resolutionResult) {
        if (oResolutionResult["sap-system"] && oResolutionResult["sap-system"] != null &&
            oResolutionResult["sap-system"] != undefined && oResolutionResult["sap-system"] != "") {
            oResolutionResult.systemAlias = oResolutionResult["sap-system"];
        } else {
            oResolutionResult.systemAlias = resolutionResult.systemAlias;
        }

        if (oResolutionResult.systemAlias === undefined) {
            delete oResolutionResult.systemAlias;
        }
    }

    return {
        getURLParsing: getURLParsing,
        appendParametersToUrl: appendParametersToUrl,
        appendParametersToIntentURL: appendParametersToIntentURL,
        absoluteUrlDefinedByUser: absoluteUrlDefinedByUser,
        setSystemAlias: setSystemAlias
    };
});
