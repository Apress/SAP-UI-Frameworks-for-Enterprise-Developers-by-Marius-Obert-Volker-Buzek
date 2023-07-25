// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's sap.ushell.adapters.cdm.CommonDataModelAdapter for the 'CDM'
 *               platform.
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/extend",
    "sap/base/util/UriParameters",
    "sap/base/util/Version",
    "sap/ui/thirdparty/URI",
    "sap/ui/thirdparty/jquery"
], function (
    Log,
    extend,
    UriParameters,
    Version,
    URI,
    jQuery
) {
    "use strict";

    /**
     * This method MUST be called by the Unified Shell's container only.
     * Constructs a new instance of the CommonDataModelAdapter for the CDM platform.
     *
     * @param {object} oUnused
     * @param {string} sParameter
     * @param {object} oAdapterConfiguration
     * @param {string} oAdapterConfiguration.siteDataUrl
     *  - The url to load the CDM site from
     * @param {boolean} oAdapterConfiguration.ignoreSiteDataPersonalization
     *  - Whether existing site data personalization should be ignored, default is false
     * @param {boolean} oAdapterConfiguration.allowSiteSourceFromURLParameter
     *  - Whether it should be allowed to specify a custom site url via url parameter, default is false
     *
     * @class
     * @constructor
     * @see {@link sap.ushell.adapters.cdm.CommonDataModelAdapter}
     */

    var CommonDataModelAdapter = function (oUnused, sParameter, oAdapterConfiguration) {
        this.oAdapterConfiguration = oAdapterConfiguration;
        if (oAdapterConfiguration && oAdapterConfiguration.config && oAdapterConfiguration.config.siteData) {
            this.oCdmSiteDataRequestPromise = new jQuery.Deferred().resolve(oAdapterConfiguration.config.siteData);
        } else if (oAdapterConfiguration && oAdapterConfiguration.config && oAdapterConfiguration.config.siteDataPromise) {
            this.oCdmSiteDataRequestPromise = oAdapterConfiguration.config.siteDataPromise;
        } else {
            var sSiteUrl = this._identifySiteUrlFromConfig(oAdapterConfiguration);
            var sAbsoluteSiteUrl = this._normalizeUrl(sSiteUrl, location.href);

            this.oCdmSiteDataRequestPromise = this._requestSiteData(sAbsoluteSiteUrl);
        }
    };

    /**
     * Bundles the request logic for fetching the CDM site
     *
     * @param {string} sUrl
     *   Url for fetching the cdm site data
     * @returns {object} promise
     *   The promise's done handler returns the parsed CDM site object.
     *   In case an error occurred, the promise's fail handler returns an error message.
     * @private
     */
    CommonDataModelAdapter.prototype._requestSiteData = function (sUrl) {
        var oSiteDataRequestDeferred = new jQuery.Deferred();

        if (!sUrl) {
            return oSiteDataRequestDeferred.reject(
                "Cannot load site: configuration property 'siteDataUrl' is missing for CommonDataModelAdapter.");
        }

        jQuery.ajax({
            type: "GET",
            dataType: "json",
            url: sUrl
        }).done(function (oResponseData) {
            oSiteDataRequestDeferred.resolve(oResponseData);
        }).fail(function (oError) {
            Log.error(oError.responseText);
            oSiteDataRequestDeferred.reject("CDM Site was requested but could not be loaded.");
        });

        return oSiteDataRequestDeferred.promise();
    };

    /**
     * Normalize a URL with respect to the current URL.
     *
     * @param {string} sUrl
     *    Any HTTP/HTTPS URL (relative or absolute
     *
     * @param {string} sCurrentURL
     *    The URL where the Launchpad is running.
     *
     * @return {string}
     *    An normalized URL absolute to the given <code>sCurrentUrl</code>
     *
     * @private
     */
    CommonDataModelAdapter.prototype._normalizeUrl = function (sUrl, sCurrentURL) {
        if (typeof sUrl !== "string") {
            return sUrl;
        }

        if (sUrl.indexOf("http") === 0) {
            return sUrl;
        }

        // <base href=""> tags should be considered for the URI normalization
        // as per the HTML specification, there must not more than one base tag. If so,
        // only the first href which is found will be considered.
        var oBaseTag = document.getElementsByTagName("base")[0];
        return (new URI(sUrl, oBaseTag).absoluteTo(sCurrentURL)).toString();
    };


    /**
     * Retrieves the CDM site
     *
     * @returns {object} promise
     *   The promise's done handler returns the CDM site object.
     *   In case an error occurred, the promise's fail handler returns an error message.
     * @public
     */
    CommonDataModelAdapter.prototype.getSite = function () {
        var oDeferred = new jQuery.Deferred();

        this.oCdmSiteDataRequestPromise.done(function (oSiteData) {
            var oSiteWithoutPers = extend({}, oSiteData);

            delete oSiteWithoutPers.personalization;
            oDeferred.resolve(oSiteWithoutPers);
        }).fail(function (sMessage) {
            oDeferred.reject(sMessage);
        });

        return oDeferred.promise();
    };

    /**
     * Retrieves the personalization part of the CDM site
     *
     * @returns {object} promise
     *   The promise's done handler returns the personalization object of the CDM site.
     *   In case an error occurred, the promise's fail handler returns an error message.
     * @public
     */
    CommonDataModelAdapter.prototype.getPersonalization = function () {
        var oDeferred = new jQuery.Deferred(),
            that = this;

        this.oCdmSiteDataRequestPromise.done(function (oSiteData) {
            var oSiteDataCopy = extend({}, oSiteData),
                sSiteVersion = oSiteDataCopy._version,
                sPersonalizationVersion;

            if (that.oAdapterConfiguration && that.oAdapterConfiguration.config && that.oAdapterConfiguration.config.ignoreSiteDataPersonalization) {
                delete oSiteDataCopy.personalization;
            }
            if (oSiteDataCopy.personalization) {
                sPersonalizationVersion = oSiteDataCopy.personalization._version;
                if (Object.keys(oSiteDataCopy.personalization).length > 0 && !that._isPersonalizationVersionValid(sSiteVersion, sPersonalizationVersion)) {
                    Log.error("Personalization version is not compatible to the site version and will not be loaded."
                        + " Please proceed to personalize the homepage again if needed. Personalization version: " + sPersonalizationVersion + "; Site version: " + sSiteVersion);
                    oDeferred.resolve();
                    return;
                }
                oDeferred.resolve(oSiteDataCopy.personalization);
            } else {
                that._readPersonalizationDataFromStorage(sSiteVersion)
                    .done(function (oPersonalizationData) {
                        sPersonalizationVersion = oPersonalizationData._version;
                        if (Object.keys(oPersonalizationData).length > 0 && !that._isPersonalizationVersionValid(sSiteVersion, sPersonalizationVersion)) {
                            Log.error("Personalization version is not compatible to the site version and will not be loaded."
                                + " Please proceed to personalize the homepage again if needed. Personalization version: " + sPersonalizationVersion + "; Site version: " + sSiteVersion);
                            oDeferred.resolve();
                            return;
                        }
                        oDeferred.resolve(oPersonalizationData);
                    })
                    .fail(function (sMessage) {
                        oDeferred.reject(sMessage);
                    });
            }
        }).fail(function (sMessage) {
            oDeferred.reject(sMessage);
        });

        return oDeferred.promise();
    };

    /**
     * <pre>
     * Compares the Personalization version to the site version to validate it's compatibility.
     * Currently the compatibility is as follows:
     * - Sites below version 3.0.0 are compatible with personalizations below 3.0.0. EG: Site 2.0.0 and Personalization 1.0.0 is compatible
     * -- Note: This is due to a technical restriction. We did not have a personalization version in the past so we cannot simply compare 2.0.0 and 1.0.0. In fact those two are not compatible!
     * - 3.0.0 Sites are only compatible with 3.0.0 personalizations
     * - If no personalization version property is available, we assume a version below 3.0.0 since it was introduced at a later point
     * </pre>
     * @param {String} siteVersion
     *   The site version to be compared with
     * @param {String} personalizationVersion
     *   The personalization version. Might be empty
     * @returns {boolean} result
     *   The result of the validation. True if personalization version is okay, false if it's not compatible
     * @private
     */
    CommonDataModelAdapter.prototype._isPersonalizationVersionValid = function (siteVersion, personalizationVersion) {
        if (!siteVersion) {
            return false;
        }

        var iSiteVersionMajor = new Version(siteVersion).getMajor(),
            oPersonalizationVersion = new Version(personalizationVersion);

        if (iSiteVersionMajor >= 3) {
            return oPersonalizationVersion.getMajor() === iSiteVersionMajor;
        }
        return oPersonalizationVersion.getMajor() < 3;
    };

    /**
     * Wraps the logic for storing the personalization data.
     *
     * @param {object} oPersonalizationData
     *   Personalization data which should get stored
     * @returns {object} promise
     *   The promise's done handler indicates successful storing of personalization data.
     *   In case an error occurred, the promise's fail handler returns an error message.
     * @private
     */
    CommonDataModelAdapter.prototype.setPersonalization = function (oPersonalizationData) {
        var oPersonalizationDeferred = new jQuery.Deferred();

        sap.ushell.Container.getServiceAsync("Personalization").then(function (oPersonalizationService) {
            var oComponent,
                oScope = {
                    keyCategory: oPersonalizationService.constants.keyCategory.FIXED_KEY,
                    writeFrequency: oPersonalizationService.constants.writeFrequency.LOW,
                    clientStorageAllowed: true
                },
                oPersId = {
                    container: "sap.ushell.cdm.personalization",
                    item: "data"
                },
                oCdmSiteVersion = new Version(oPersonalizationData.version);

            if (oCdmSiteVersion.inRange("3.1.0", "4.0.0")) {
                oPersId = {
                    container: "sap.ushell.cdm3-1.personalization",
                    item: "data"
                };
            }
            var oPersonalizer = oPersonalizationService.getPersonalizer(oPersId, oScope, oComponent);

            oPersonalizer.setPersData(oPersonalizationData)
                .done(function () {
                    Log.info("Personalization data has been stored successfully.");
                    oPersonalizationDeferred.resolve();
                })
                .fail(function () {
                    oPersonalizationDeferred.reject("Writing personalization data failed.");
                });
        });

        return oPersonalizationDeferred.promise();
    };

    /**
     * Wraps the logic for fetching the personalization data.
     *
     * @param {string} [cdmSiteVersion]
     *   The version of the CDM site of which the personalization should been read.
     *   If not provided the 'sap.ushell.cdm.personalization' will be read.
     *
     * @returns {object} promise
     *   The promise's done handler returns the parsed personalization data.
     *   In case an error occurred, the promise's fail handler returns an error message.
     * @private
     */
    CommonDataModelAdapter.prototype._readPersonalizationDataFromStorage = function (cdmSiteVersion) {
        var oPersonalizationDeferred = new jQuery.Deferred();

        sap.ushell.Container.getServiceAsync("Personalization").then(function (oPersonalizationService) {
            var oScope = {
                keyCategory: oPersonalizationService.constants.keyCategory.FIXED_KEY,
                writeFrequency: oPersonalizationService.constants.writeFrequency.LOW,
                clientStorageAllowed: true
            };
            var oPersId = {
                container: "sap.ushell.cdm.personalization",
                item: "data"
            };

            if (cdmSiteVersion) {
                var oVersion = new Version(cdmSiteVersion);

                if (oVersion && oVersion.inRange("3.1.0", "4.0.0")) {
                    oPersId = {
                        container: "sap.ushell.cdm3-1.personalization",
                        item: "data"
                    };
                }
            }

            oPersonalizationService.getPersonalizer(oPersId, oScope).getPersData()
                .done(function (oPersonalizationData) {
                    oPersonalizationDeferred.resolve(oPersonalizationData || {});
                })
                .fail(function () {
                    oPersonalizationDeferred.reject("Fetching personalization data failed.");
                });
        });
        return oPersonalizationDeferred.promise();
    };

    /**
     * Wraps the logic for identifying the valid SiteURL based on this priorities:
     * 1. Provided as URL parameter "sap-ushell-cdm-site-url"
     * 2. Provided as part of the adapter configuration object as:
     * 2a. siteDataUrl
     * 2b. cdmSiteUrl
     *
     * @param {object} oAdapterConfiguration
     *   The adapter configuration object
     * @returns {string} sSiteUrl
     *   The valid site URL based on the defined priority
     * @private
     */
    CommonDataModelAdapter.prototype._identifySiteUrlFromConfig = function (oAdapterConfiguration) {
        var oParams = UriParameters.fromQuery(window.location.search);
        var sSiteURL = oParams.get("sap-ushell-cdm-site-url");
        var oConfig = oAdapterConfiguration && oAdapterConfiguration.config;
        // take the site URL from the url parameter "sap-ushell-cdm-site-url" preferred if provided
        // to enable the loading of a test site but only if explicitly set via configuration to allow this
        if ((oConfig && !oConfig.allowSiteSourceFromURLParameter) && sSiteURL) {
            sSiteURL = null;
        }
        if (oConfig && !sSiteURL) {
            // if cdm site data is not directly set in configuration, a URL has to be defined
            // for consistency, the property should be called 'siteDataUrl', but we still support
            // 'cdmSiteUrl' for backwards compatibility
            sSiteURL = oConfig.siteDataUrl || oConfig.cdmSiteUrl;
        }
        this.sCdmSiteUrl = sSiteURL;
        return sSiteURL;
    };

    return CommonDataModelAdapter;
}, /*export=*/ false);
