// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/utils",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readVisualizations",
    "sap/base/util/deepExtend",
    "sap/base/util/isEmptyObject",
    "sap/base/util/ObjectPath",
    "sap/base/util/merge",
    "sap/base/util/deepEqual",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readApplications",
    "sap/ushell/utils/UrlParsing",
    "sap/base/Log"
], function (
    oUshellUtils,
    readVisualizations,
    deepExtend,
    isEmptyObject,
    ObjectPath,
    merge,
    deepEqual,
    readApplications,
    urlParsing,
    Log
) {
    "use strict";

    var utilsCdm = {};

    utilsCdm.getMember = function (oObject, sAccessPath) {
        return oUshellUtils.getMember(oObject, sAccessPath);
    };

    utilsCdm.getNestedObjectProperty = function (aObjects, oAccessPath, oDefault) {
        return oUshellUtils.getNestedObjectProperty(aObjects, oAccessPath, oDefault);
    };

    /**
     * Compiles information about a given inbound, enriched with app and visualization data.
     *
     * @param {string} sKey Inbound ID of UI5 app.
     * @param {object} oSrc Inbound definition from the app's manifest.
     * @param {object} oApp Other segments of the app's manifest.
     * @param {object} oVisualization Visualization of the app.
     * @param {object} oVisualizationType Visualization type of the visualization.
     * @param {object} oSite A reference to the whole CDM site.
     * @returns {object} Inbound information, enriched for further processing.
     * @private
     */
    utilsCdm.mapOne = function (sKey, oSrc, oApp, oVisualization, oVisualizationType, oSite) {
        var bIsCard = false;

        /* ---- Prepare and default inputs ---- */
        // do not modify input parameters
        oSrc = deepExtend({}, oSrc);
        oApp = deepExtend({}, oApp);
        oVisualization = deepExtend({}, oVisualization);
        oVisualizationType = deepExtend({}, oVisualizationType);

        // ... Client side target resolution doesn't supply visualization data
        oVisualization = oVisualization || {};
        oVisualizationType = oVisualizationType || {};

        /* ---- Collect inbound information ---- */

        // Intent, title, info, icon, sub title, short title
        // ... from visualization, inbound, app or visualization type

        var oInbound = {};
        oInbound.semanticObject = this.getMember(oSrc, "semanticObject");
        oInbound.action = this.getMember(oSrc, "action");

        var oVizConfig = readVisualizations.getConfig(oVisualization);

        oInbound.title = readVisualizations.getTitle([undefined, oVizConfig, oSrc, oApp]);
        oInbound.info = readVisualizations.getInfo([undefined, oVizConfig, oSrc, oApp]);
        oInbound.icon = readVisualizations.getIcon([undefined, oVizConfig, oSrc, oApp]);
        oInbound.subTitle = readVisualizations.getSubTitle([undefined, oVizConfig, oSrc, oApp]);
        oInbound.shortTitle = readVisualizations.getShortTitle([undefined, oVizConfig, oSrc, oApp]);
        oInbound.keywords = readVisualizations.getKeywords([undefined, oVizConfig, oSrc, oApp]);
        oInbound.numberUnit = readVisualizations.getNumberUnit([undefined, oVizConfig, undefined, undefined]);

        oInbound.deviceTypes = this.getMember(oApp, "sap|ui.deviceTypes") || {};

        //  Device types
        // ... if not supplied, default is true (!)
        ["desktop", "tablet", "phone"].forEach(function (sMember) {
            // we overwrite member by member if deviceType specified in oSrc!
            if (Object.prototype.hasOwnProperty.call(this.getMember(oSrc, "deviceTypes") || {}, sMember)) {
                oInbound.deviceTypes[sMember] = oSrc.deviceTypes[sMember];
            }
            if (!Object.prototype.hasOwnProperty.call(oInbound.deviceTypes, sMember)) {
                oInbound.deviceTypes[sMember] = true;
            }
            oInbound.deviceTypes[sMember] = !!oInbound.deviceTypes[sMember];
        }.bind(this));

        // Signature
        oInbound.signature = this.getMember(oSrc, "signature") || {};
        oInbound.signature.parameters = this.getMember(oInbound, "signature.parameters") || {};
        oInbound.signature.additionalParameters = this.getMember(oSrc, "signature.additionalParameters") || "allowed";

        // Hide Tile Intent
        var oSapHideIntentLinkParam = this.getMember(oInbound, "signature.parameters.sap-hide-intent-link");
        if (oSapHideIntentLinkParam && oSapHideIntentLinkParam.hasOwnProperty("defaultValue")) {
            oInbound.hideIntentLink = oSapHideIntentLinkParam.defaultValue.value === "true";
        }

        if (oSapHideIntentLinkParam && !oSapHideIntentLinkParam.required && oSapHideIntentLinkParam.hasOwnProperty("defaultValue")) {
            // NOTE: we actually delete it only if it's a default value
            delete oInbound.signature.parameters["sap-hide-intent-link"];
        }

        /* ---- Build resolution result ---- */

        // Target app's runtime data (component url)
        var oSapPlatformRuntime = this.getMember(oApp, "sap|platform|runtime");
        oInbound.resolutionResult = deepExtend({}, oSapPlatformRuntime);
        if (oSapPlatformRuntime) {
            oInbound.resolutionResult["sap.platform.runtime"] = deepExtend({}, oSapPlatformRuntime);
        }

        // Segment "sap.gui", if this is a GUI app
        if (this.getMember(oApp, "sap|ui.technology") === "GUI") {
            oInbound.resolutionResult["sap.gui"] = this.getMember(oApp, "sap|gui");
        }

        // Segment "sap.wda", if this is a web dynpro app
        if (this.getMember(oApp, "sap|ui.technology") === "WDA") {
            oInbound.resolutionResult["sap.wda"] = this.getMember(oApp, "sap|wda");
        }

        // Url, taken from segment "sap.url" or "sap.platform.runtime", if this is an app specified by a URL
        if (this.getMember(oApp, "sap|ui.technology") === "URL") {
            if (oApp["sap.url"]) {
                oInbound.resolutionResult["sap.platform.runtime"] = oInbound.resolutionResult["sap.platform.runtime"] || {};
                oInbound.resolutionResult.url = oApp["sap.url"].uri;
                oInbound.resolutionResult["sap.platform.runtime"].url = oApp["sap.url"].uri;
            } else if (oSapPlatformRuntime && oSapPlatformRuntime.uri) {
                oInbound.resolutionResult["sap.platform.runtime"].url = oSapPlatformRuntime.uri;
                oInbound.resolutionResult.url = oSapPlatformRuntime.uri;
            }
        }

        // SAP ui technology
        if (!oInbound.resolutionResult["sap.ui"]) {
            oInbound.resolutionResult["sap.ui"] = {};
        }
        oInbound.resolutionResult["sap.ui"].technology = this.getMember(oApp, "sap|ui.technology");

        // Application type
        oInbound.resolutionResult.applicationType = this._formatApplicationType(oInbound.resolutionResult, oApp);

        // System Alias : used to interpolate the URL
        // ... ClientSideTargetResolution will de-interpolate the URL before applying sap-system
        oInbound.resolutionResult.systemAlias = oInbound.resolutionResult.systemAlias || this.getMember(oSrc, "systemAlias"); // NOTE: "" is the local system alias

        // System alias semantics
        // ... In the CDM platform the "systemAlias" value is meant as: "apply this
        // ... system alias to the resolved URL if no sap-system is given".
        oInbound.resolutionResult.systemAliasSemantics = "apply";

        // App ID, device types and title
        oInbound.resolutionResult.text = oInbound.title;
        oInbound.resolutionResult.appId = this.getMember(oApp, "sap|app.id");

        /* ---- Build tile resolution result ---- */
        var sTileTechnicalInformation;
        var sAppId;

        // Pick indicator data source
        var oIndicatorDataSource = this.getMember(oVisualization, "vizConfig.sap|flp.indicatorDataSource");

        // Collect tile component data
        var oTempTileComponent = {};

        // Include manifest from visualization type
        if (!isEmptyObject(oVisualizationType)) {
            var sType = this.getMember(oVisualizationType, "sap|app.type");
            if (sType === "card") {
                bIsCard = true;
                // merge visualization.vizConfig with vizType
                oTempTileComponent = merge({}, oVisualizationType, oVisualization.vizConfig);
            } else {
                oTempTileComponent.componentName = this.getMember(oVisualizationType, "sap|ui5.componentName");
                var oComponentProperties = this.getMember(oVisualizationType, "sap|platform|runtime.componentProperties");
                if (oComponentProperties) {
                    oTempTileComponent.componentProperties = oComponentProperties;
                }

                if (this.getMember(oVisualizationType, "sap|platform|runtime.includeManifest")) {
                    // With the property "[sap.platform.runtime].includeManifest===true" the visualization type
                    // can indicate that it contains the entire manifest (descriptor) and can directly be used
                    // for instantiation of the tile.
                    //
                    // In addition, the properties of the visualization's configuration get merged into
                    // the resulting manifest, so that also configured data, e.g. the 'sap.ui.smartbusiness.app'
                    // segment, is taken into account as expected.
                    //
                    // Then all properties needed for the instantiation of a custom tile are available,
                    // and e.g. a smart business tile is displayed properly.
                    oTempTileComponent.componentProperties = oTempTileComponent.componentProperties || {};
                    oTempTileComponent.componentProperties.manifest = merge({}, oVisualizationType, oVisualization.vizConfig);

                    // Finally sap.platform.runtime gets removed from the manifest because it is added by the
                    // server and is not part of the app/component descriptor schema.
                    delete oTempTileComponent.componentProperties.manifest["sap.platform.runtime"];
                }
            }
        }

        // Application Type
        if (this.getMember(oApp, "sap|app.type") === "plugin" || this.getMember(oApp, "sap|flp.type") === "plugin") {
            return undefined;
        }

        // Tile size
        var sTileSize = this.getNestedObjectProperty([oVizConfig, oApp, oVisualizationType], "sap|flp.tileSize");

        // Tile description
        var sTileDescription = this.getNestedObjectProperty([oVizConfig, oApp, oVisualizationType], "sap|app.description");

        // TODO: Use getNestedObjectProperty for other response properties, where applicable

        // Tile technical information
        if (this.getMember(oApp, "sap|ui.technology") === "GUI" && this.getMember(oApp, "sap|gui.transaction")) {
            sTileTechnicalInformation = this.getMember(oApp, "sap|gui.transaction");
        }

        // UI technology
        if (this.getMember(oApp, "sap|ui.technology") === "WDA" &&
            this.getMember(oApp, "sap|wda.applicationId")) {
            sTileTechnicalInformation = this.getMember(oApp, "sap|wda.applicationId");
        }

        // Data sources
        var oDataSource =
            this.getNestedObjectProperty([oVizConfig, oApp, oVisualizationType], "sap|app.dataSources");

        // App ID
        if (this.getMember(oApp, "sap|app.id")) {
            sAppId = this.getMember(oApp, "sap|app.id");
        }

        var sContentProviderId = readApplications.getContentProviderId(oApp) || "";

        oInbound.tileResolutionResult = {
            appId: sAppId,
            title: oInbound.title,
            subTitle: oInbound.subTitle,
            icon: oInbound.icon,
            size: sTileSize,
            info: oInbound.info,
            keywords: oInbound.keywords,
            tileComponentLoadInfo: oTempTileComponent,
            indicatorDataSource: oIndicatorDataSource,
            dataSources: oDataSource,
            description: sTileDescription,
            runtimeInformation: oSapPlatformRuntime,
            technicalInformation: sTileTechnicalInformation,
            deviceTypes: oInbound.deviceTypes,
            isCard: bIsCard,
            contentProviderId: sContentProviderId,
            numberUnit: oInbound.numberUnit
        };

        // URL Template
        var sTemplateName = this.getMember(oApp, "sap|integration.urlTemplateId");
        var oTemplatePayload = this.getTemplatePayloadFromSite(sTemplateName, oSite);
        if (oTemplatePayload) {
            oInbound.templateContext = {
                payload: oTemplatePayload,
                site: oSite,
                siteAppSection: oApp
            };
        }

        return oInbound;
    };

    /**
     * Safely extract the template payload from a site.
     *
     * @param {string} [sTemplateName] The template name to extract from the Site.
     * @param {object} [oSite] The site.
     * @returns {object} The template payload for the given template name or null if no template payload could be extracted.
     */
    utilsCdm.getTemplatePayloadFromSite = function (sTemplateName, oSite) {
        if (!oSite || typeof sTemplateName !== "string") {
            return null;
        }
        var sTemplateNameEscaped = sTemplateName.replace(/[.]/g, "|");
        return this.getMember(oSite.urlTemplates, sTemplateNameEscaped + ".payload");
    };

    /**
     * Extracts a valid <code>applicationType</code> field for
     * ClientSideTargetResolution from the site application resolution result.
     *
     * @param {object} oResolutionResult The application resolution result. An object like:
     *   <pre>
     *   {
     *      "sap.platform.runtime": { ... },
     *      "sap.gui": { ... } // or "sap.wda" for wda applications
     *   }
     *   </pre>
     * @param {object} oApp A site application object.
     * @returns {string} One of the following application types compatible with ClientSideTargetResolution service:
     *   "TR", "SAPUI5", "WDA", "URL".
     */
    utilsCdm._formatApplicationType = function (oResolutionResult, oApp) {
        var sApplicationType = oResolutionResult.applicationType;
        if (sApplicationType) {
            return sApplicationType;
        }

        var sComponentName = this.getMember(oApp, "sap|platform|runtime.componentProperties.self.name") || this.getMember(oApp, "sap|ui5.componentName");

        if (this.getMember(oApp, "sap|flp.appType") === "UI5" ||
            this.getMember(oApp, "sap|ui.technology") === "UI5") {
            oResolutionResult.applicationType = "SAPUI5";
            oResolutionResult.additionalInformation = "SAPUI5.Component=" + sComponentName;
            oResolutionResult.url = this.getMember(oApp, "sap|platform|runtime.componentProperties.url");
            oResolutionResult.applicationDependencies = this.getMember(oApp, "sap|platform|runtime.componentProperties");
            return "SAPUI5";
        }

        if (this.getMember(oApp, "sap|ui.technology") === "GUI") {
            oResolutionResult.applicationType = "TR";
            //oResult.url = getMember(oApp,"sap|platform|runtime.uri");
            oResolutionResult["sap.gui"] = this.getMember(oApp, "sap|gui");
            oResolutionResult.systemAlias = this.getMember(oApp, "sap|app.destination.name");
            return "TR";
        }

        if (this.getMember(oApp, "sap|ui.technology") === "WDA") {
            oResolutionResult.applicationType = "WDA";
            //oResult.url = getMember(oApp,"sap|platform|runtime.uri");
            oResolutionResult["sap.wda"] = this.getMember(oApp, "sap|wda");
            oResolutionResult.systemAlias = this.getMember(oApp, "sap|app.destination.name");
            return "WDA";
        }

        if (this.getMember(oApp, "sap|ui.technology") === "URL") {
            oResolutionResult.applicationType = "URL";
            oResolutionResult.systemAlias = this.getMember(oApp, "sap|app.destination.name");
        }

        return "URL";
    };

    /**
     * Formats the target mappings contained in the CDM site projection into inbounds
     *
     * @param {object} oSite the CDM site projection.
     * @return {object[]} Inbounds suitable for ClientSideTargetResolution service consumption.
     */
    utilsCdm.formatSite = function (oSite) {
        var that = this;

        if (!oSite) {
            return [];
        }

        var aInbounds = [];
        try {
            var aSiteApplications = Object.keys(oSite.applications || {}).sort();
            aSiteApplications.forEach(function (sApplicationKey) {
                try {
                    var oApp = oSite.applications[sApplicationKey];
                    var oApplicationInbounds = this.getMember(oApp, "sap|app.crossNavigation.inbounds");
                    if (oApplicationInbounds) {
                        var lst2 = Object.keys(oApplicationInbounds).sort();
                        lst2.forEach(function (sInboundKey) {
                            var oInbound = oApplicationInbounds[sInboundKey];
                            var oResolvedInbound = that.mapOne(sInboundKey, oInbound, oApp, undefined, undefined, oSite);
                            if (oResolvedInbound) {
                                oResolvedInbound.contentProviderId = readApplications.getContentProviderId(oApp) || "";
                                aInbounds.push(oResolvedInbound);
                            }
                        });
                    }
                } catch (oError1) {
                    // this is here until validation on the CDM site is done
                    Log.error(
                        "Error in application " + sApplicationKey + ": " + oError1,
                        oError1.stack
                    );
                }
            }.bind(this));
        } catch (oError2) {
            Log.error(oError2);
            Log.error(oError2.stack);
            return [];
        }

        return aInbounds;
    };

    /**
     * Constructs a hash string from the given inbound.
     *
     * @param {object} oInbound oInbound structure as specified in App Descriptor schema
     * @return {string} The constructed hash without leading '#' or undefined if not successful
     */
    utilsCdm.toHashFromInbound = function (oInbound) {
        var oShellHash = {
            target: {
                semanticObject: oInbound.semanticObject,
                action: oInbound.action
            },
            params: {}
        };

        var oParams = ObjectPath.get("signature.parameters", oInbound) || {};
        Object.keys(oParams).forEach(function (sKey) {
            if (oParams[sKey].filter && Object.prototype.hasOwnProperty.call(oParams[sKey].filter, "value") &&
                (oParams[sKey].filter.format === undefined || oParams[sKey].filter.format === "plain")) {
                oShellHash.params[sKey] = [oParams[sKey].filter.value];
            }

            // TODO: CDM2.0: remove launcherValue
            if (oParams[sKey].launcherValue && Object.prototype.hasOwnProperty.call(oParams[sKey].launcherValue, "value") &&
                (oParams[sKey].launcherValue.format === undefined || oParams[sKey].launcherValue.format === "plain")) {
                oShellHash.params[sKey] = [oParams[sKey].launcherValue.value];
            }
        });

        var sConstructedHash = urlParsing.constructShellHash(oShellHash);
        if (!sConstructedHash) {
            return undefined;
        }
        return sConstructedHash;
    };

    /**
     * Constructs an hash string from the given outbound.
     *
     * @param {object} oOutbound oOutbound structure as specified in App Descriptor schema
     * @return {string} The constructed hash without leading '#' or undefined if not successful
     */
    utilsCdm.toHashFromOutbound = function (oOutbound) {
        var oShellHash = {
            target: {
                semanticObject: oOutbound.semanticObject,
                action: oOutbound.action
            },
            params: {}
        };

        var oParams = oOutbound.parameters || {};
        Object.keys(oParams).forEach(function (sKey) {
            if (oParams.hasOwnProperty(sKey) && typeof oParams[sKey].value === "object") {
                oShellHash.params[sKey] = [oParams[sKey].value.value];
            }
        });

        var sConstructedHash = urlParsing.constructShellHash(oShellHash);
        if (!sConstructedHash) {
            return undefined;
        }
        return sConstructedHash;
    };

    /**
     * Returns the intent for a given visualization object.
     *
     * @param {object} oVizData A vizData object for which the hash should be constructed
     * @param {object[]} oApplications All the applications of the CDM 3.1 site
     * @returns {string} The hash of the visualization
     * @private
     * @since 1.78.0
     */
    utilsCdm.toHashFromVizData = function (oVizData, oApplications) {
        if (!oVizData.target) {
            // No navigation provided
            return undefined;
        }
        var oVizTarget = oVizData.target;
        if (oVizTarget.type === "URL") {
            // Navigation with an external URL
            return oVizTarget.url;
        }

        var sAppId = oVizTarget.appId;
        var sInboundId = oVizTarget.inboundId;
        var oTarget;
        if (sAppId && sInboundId) {
            // Navigation with appId & inboundId
            var oInboundTarget = readApplications.getInboundTarget(oApplications, sAppId, sInboundId);
            oTarget = {};

            if (oInboundTarget) {
                oTarget.semanticObject = oInboundTarget.semanticObject;
                oTarget.action = oInboundTarget.action;
                oTarget.parameters = oVizTarget.parameters || {};
                oTarget.parameters["sap-ui-app-id-hint"] = {
                    value: {
                        value: sAppId,
                        format: "plain"
                    }
                };
                oTarget.appSpecificRoute = oVizTarget.appSpecificRoute || "";
            }
        } else if (oVizTarget.semanticObject && oVizTarget.action) {
            // Navigation with semanticObject & action
            oTarget = oVizTarget;
        }

        return utilsCdm.toHashFromTarget(oTarget);
    };

    /**
     * Constructs the hash for a target object consisting of semanticObject and action.
     * Additionally parameters get formatted.
     *
     * @param {object} oTarget The target object of a vizData instance for which the hash should be constructed
     * @returns {string} Constructed hash or <code>undefined</code> in case something went wrong
     * @private
     * @since 1.78.0
     */
    utilsCdm.toHashFromTarget = function (oTarget) {
        try {
            var oParams = {};
            var oRawParams = ObjectPath.get("parameters", oTarget) || {};
            Object.keys(oRawParams).forEach(function (sKey) {
                oParams[sKey] = Array.isArray(oRawParams[sKey].value.value)
                    ? oRawParams[sKey].value.value
                    : [oRawParams[sKey].value.value];
            });

            var oHashTarget = {
                target: {
                    semanticObject: oTarget.semanticObject,
                    action: oTarget.action
                },
                params: oParams,
                appSpecificRoute: oTarget.appSpecificRoute
            };

            return "#" + urlParsing.constructShellHash(oHashTarget);
        } catch (oError) {
            return undefined;
        }
    };

    /**
     * Constructs the target object for a hash or URL.
     *
     * @param {string} sHash The target hash or URL of a vizData instance for which the target object should be constructed.
     * @returns {object} Constructed Target
     * @private
     * @since 1.78.0
     */
    utilsCdm.toTargetFromHash = function (sHash) {
        var oTarget = urlParsing.parseShellHash(sHash);
        if (oTarget !== undefined) {
            var oParams = oTarget.params || {};

            if (Object.keys(oParams).length > 0) {
                oTarget.parameters = [];
                Object.keys(oParams).forEach(function (sKey) {
                    var aValues = Array.isArray(oParams[sKey]) ? oParams[sKey] : [oParams[sKey]];

                    aValues.forEach(function (oValue) {
                        var oParam = {
                            name: sKey,
                            value: oValue
                        };
                        oTarget.parameters.push(oParam);
                    });
                });
            }
            delete oTarget.params;
        } else {
            oTarget = {
                type: "URL",
                url: sHash
            };
        }
        return oTarget;
    };

    /**
     * Checks if two navigation targets are equal.
     *
     * @param {object} oTargetA The first target to compare
     * @param {object} oTargetB The second target to compare
     * @returns {boolean} Returns true if the navigation targets are equal
     * @since 1.82.0
     * @private
     */
    utilsCdm.isSameTarget = function (oTargetA, oTargetB) {
        var oResult;

        if (oTargetA.type !== oTargetB.type) {
            return false;
        }

        if (oTargetA.type === "URL") {
            oResult = oTargetA.url === oTargetB.url;
        } else {
            oResult = oTargetA.semanticObject === oTargetB.semanticObject &&
                oTargetA.action === oTargetB.action &&
                oTargetA.appSpecificRoute === oTargetB.appSpecificRoute &&
                deepEqual(oTargetA.parameters, oTargetB.parameters);
        }

        return oResult;
    };

    return utilsCdm;
});
