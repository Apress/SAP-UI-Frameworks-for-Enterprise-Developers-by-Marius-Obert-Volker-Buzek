// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview URLShortening
 *
 * Service wrapper for the sap/ushell/utils/UrlShortening module.
 * Deprecated. Please use the UrlShortening module directly.
 *
 * @version 1.113.0
 */
 sap.ui.define(["sap/ushell/utils/UrlShortening"], function (UrlShortening) {
    "use strict";
    function URLShortening () {
        this.compactHash = UrlShortening.compactHash.bind(UrlShortening);
        this.checkHashLength = UrlShortening.checkHashLength.bind(UrlShortening);
        this.expandHash = UrlShortening.expandHash.bind(UrlShortening);
        this.expandParamGivenRetrievalFunction = UrlShortening.expandParamGivenRetrievalFunction.bind(UrlShortening);
    }

    URLShortening.hasNoAdapter = true;
    return URLShortening;
}, true /* bExport */);
