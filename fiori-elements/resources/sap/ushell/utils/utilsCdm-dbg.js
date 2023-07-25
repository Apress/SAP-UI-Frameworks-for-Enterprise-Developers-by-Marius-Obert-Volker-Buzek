// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepExtend",
    "sap/base/util/ObjectPath",
    "sap/ushell/utils/objectOperations",
    "sap/ushell/utils/UrlParsing"
], function (
    Log,
    deepExtend,
    ObjectPath,
    ushellObjectOperations,
    UrlParsing
) {
    "use strict";

    function getMember (oObject, sAccessPath) {
        return ushellObjectOperations.getMember(oObject, sAccessPath);
    }

    /**
     * Compiles information about a given inbound, enriched with app data.
     *
     * @param {string} sKey Inbound ID of UI5 app.
     * @param {object} oSrc Inbound definition from the app's manifest.
     * @param {object} oApp Other segments of the app's manifest.
     * @returns {object} Inbound information, enriched for further processing.
     * @private
     */
    function mapOne (sKey, oSrc, oApp) {
        oSrc = deepExtend({}, oSrc); // do not modify input parameters
        oApp = deepExtend({}, oApp); // do not modify input parameters

        var oInbound = {};
        oInbound.semanticObject = oSrc.semanticObject;
        oInbound.action = oSrc.action;
        oInbound.title = oSrc.title || getMember(oApp, "sap|app.title");
        oInbound.info = oSrc.info || getMember(oApp, "sap|app.info");
        oInbound.icon = oSrc.icon || getMember(oApp, "sap|ui.icons.icon");
        oInbound.subTitle = oSrc.subTitle || getMember(oApp, "sap|app.subTitle");
        oInbound.shortTitle = oSrc.shortTitle || getMember(oApp, "sap|app.shortTitle");

        var sTileSize,
            sTileDescription,
            sTileTechnicalInformation,
            oTargetOutbound,
            oDataSource,
            sAppId,
            bIsCustomTile = false;

        var oSapPlatformRuntime = getMember(oApp, "sap|platform|runtime");

        oInbound.resolutionResult = deepExtend({}, oSapPlatformRuntime);

        if (oSapPlatformRuntime) {
            oInbound.resolutionResult["sap.platform.runtime"] = deepExtend({}, oSapPlatformRuntime);
        }

        // copy a GUI/WDA namespace if provided
        if (getMember(oApp, "sap|ui.technology") === "GUI") {
            oInbound.resolutionResult["sap.gui"] = getMember(oApp, "sap|gui");
        }

        if (getMember(oApp, "sap|ui.technology") === "WDA") {
            oInbound.resolutionResult["sap.wda"] = getMember(oApp, "sap|wda");
        }

        if (getMember(oApp, "sap|ui.technology") === "URL") {
            if (oApp["sap.url"]) {
                oInbound.resolutionResult["sap.platform.runtime"] = oInbound.resolutionResult["sap.platform.runtime"] || {};

                oInbound.resolutionResult.url = oApp["sap.url"].uri;
                oInbound.resolutionResult["sap.platform.runtime"].url = oApp["sap.url"].uri;
            } else if (oSapPlatformRuntime && oSapPlatformRuntime.uri) {
                oInbound.resolutionResult["sap.platform.runtime"].url = oSapPlatformRuntime.uri;
                oInbound.resolutionResult.url = oSapPlatformRuntime.uri;
            }
        }

        // forward sap.ui technology parameter
        if (!oInbound.resolutionResult["sap.ui"]) {
            oInbound.resolutionResult["sap.ui"] = {};
        }
        oInbound.resolutionResult["sap.ui"].technology = getMember(oApp, "sap|ui.technology");

        oInbound.resolutionResult.applicationType = this._formatApplicationType(oInbound.resolutionResult, oApp);

        // Forward the name of the systemAlias used to interpolate the URL
        // ClientSideTargetResolution will de-interpolate the URL before applying sap-system
        oInbound.resolutionResult.systemAlias = oInbound.resolutionResult.systemAlias || oSrc.systemAlias; // NOTE: "" is the local system alias

        // In the CDM platform the "systemAlias" value is meant as: "apply this
        // system alias to the resolved URL if no sap-system is given".
        oInbound.resolutionResult.systemAliasSemantics = "apply";

        oInbound.resolutionResult.text = oInbound.title;
        oInbound.deviceTypes = getMember(oApp, "sap|ui.deviceTypes") || {};
        oInbound.resolutionResult.appId = getMember(oApp, "sap|app.id");

        // if not supplied, default is true (!)
        ["desktop", "tablet", "phone"].forEach(function (sMember) {
            // we overwrite member by member if deviceType specified in oSrc!
            if (Object.prototype.hasOwnProperty.call(oSrc.deviceTypes || {}, sMember)) {
                oInbound.deviceTypes[sMember] = oSrc.deviceTypes[sMember];
            }
            if (!Object.prototype.hasOwnProperty.call(oInbound.deviceTypes, sMember)) {
                oInbound.deviceTypes[sMember] = true;
            }
            oInbound.deviceTypes[sMember] = !!oInbound.deviceTypes[sMember];
        });

        // signature
        oInbound.signature = oSrc.signature || {};
        oInbound.signature.parameters = oInbound.signature.parameters || {};
        oInbound.signature.additionalParameters = (oSrc.signature || {}).additionalParameters || "allowed";

        var indicatorDataSource = oSrc.indicatorDataSource || getMember(oApp, "sap|app.crossNavigation.inbounds." + sKey + ".indicatorDataSource");

        var oTempTileComponent = indicatorDataSource ? "#Shell-dynamicTile" : "#Shell-staticTile";

        if (getMember(oApp, "sap|app.type") === "tile" || getMember(oApp, "sap|flp.type") === "tile") {
            // this is a custom tile

            oTempTileComponent = oInbound.resolutionResult;
            oTempTileComponent.url = getMember(oApp, "sap|platform|runtime.componentProperties.url");
            oTempTileComponent.componentName = getMember(oApp, "sap|ui5.componentName");

            if (getMember(oApp, "sap|platform|runtime.includeManifest")) {
                // with includeManifest the server specifies that the application from CDM site
                // includes the entire manifest (App Descriptor) properties and can directly be used for instantiation of the tile
                oTempTileComponent.componentProperties = oTempTileComponent.componentProperties || {};
                oTempTileComponent.componentProperties.manifest = deepExtend({}, oApp);

                // sap.platform.runtime needs to be removed because it is added by the server
                // and is not part of the actual App Descriptor schema!
                delete oTempTileComponent.componentProperties.manifest["sap.platform.runtime"];
            }

            oTargetOutbound = getMember(oApp, "sap|app.crossNavigation.outbounds.target");
            bIsCustomTile = true;
        }

        if (getMember(oApp, "sap|app.type") === "plugin" || getMember(oApp, "sap|flp.type") === "plugin") {
            return undefined;
        }

        if (getMember(oApp, "sap|flp.tileSize")) {
            sTileSize = getMember(oApp, "sap|flp.tileSize");
        }

        if (getMember(oApp, "sap|app.description")) {
            sTileDescription = getMember(oApp, "sap|app.description");
        }

        if (getMember(oApp, "sap|ui.technology") === "GUI" && getMember(oApp, "sap|gui.transaction")) {
            sTileTechnicalInformation = getMember(oApp, "sap|gui.transaction");
        }

        if (getMember(oApp, "sap|ui.technology") === "WDA" &&
            getMember(oApp, "sap|wda.applicationId")) {
            sTileTechnicalInformation = getMember(oApp, "sap|wda.applicationId");
        }
        if (getMember(oApp, "sap|app.dataSources")) {
            oDataSource = getMember(oApp, "sap|app.dataSources");
        }

        if (getMember(oApp, "sap|app.id")) {
            sAppId = getMember(oApp, "sap|app.id");
        }

        oInbound.tileResolutionResult = {
            appId: sAppId,
            title: oInbound.title,
            subTitle: oInbound.subTitle,
            icon: oInbound.icon,
            size: sTileSize,
            info: oInbound.info,
            tileComponentLoadInfo: oTempTileComponent,
            indicatorDataSource: indicatorDataSource,
            dataSources: oDataSource,
            description: sTileDescription,
            runtimeInformation: oSapPlatformRuntime,
            technicalInformation: sTileTechnicalInformation,
            deviceTypes: oInbound.deviceTypes
        };

        oInbound.tileResolutionResult.isCustomTile = bIsCustomTile;
        if (oTargetOutbound) {
            oInbound.tileResolutionResult.targetOutbound = oTargetOutbound;
        }

        return oInbound;
    }

    /**
     * Extracts a valid <code>applicationType</code> field for ClientSideTargetResolution from the site application resolution result.
     *
     * @param {object} oResolutionResult The application resolution result. An object like:
     *   <pre>
     *   {
     *     "sap.platform.runtime": { ... },
     *     "sap.gui": { ... } // or "sap.wda" for wda applications
     *   }
     *   </pre>
     * @param {object} oApp A site application object.
     * @returns {string} The application type compatible with ClientSideTargetResolution service: "TR", "SAPUI5", "WDA", or "URL".
     */
    function formatApplicationType (oResolutionResult, oApp) {
        var sApplicationType = oResolutionResult.applicationType;

        if (sApplicationType) {
            return sApplicationType;
        }

        var sComponentName = getMember(oApp, "sap|platform|runtime.componentProperties.self.name") || getMember(oApp, "sap|ui5.componentName");

        if (getMember(oApp, "sap|flp.appType") === "UI5" ||
            getMember(oApp, "sap|ui.technology") === "UI5") {

            oResolutionResult.applicationType = "SAPUI5";
            oResolutionResult.additionalInformation = "SAPUI5.Component=" + sComponentName;
            oResolutionResult.url = getMember(oApp, "sap|platform|runtime.componentProperties.url");
            oResolutionResult.applicationDependencies = getMember(oApp, "sap|platform|runtime.componentProperties");
            return "SAPUI5";
        }

        if (getMember(oApp, "sap|ui.technology") === "GUI") {
            oResolutionResult.applicationType = "TR";
            // oResult.url = getMember(oApp, "sap|platform|runtime.uri");
            oResolutionResult["sap.gui"] = getMember(oApp, "sap|gui");
            oResolutionResult.systemAlias = getMember(oApp, "sap|app.destination.name");
            return "TR";
        }

        if (getMember(oApp, "sap|ui.technology") === "WDA") {
            oResolutionResult.applicationType = "WDA";
            // oResult.url = getMember(oApp, "sap|platform|runtime.uri");
            oResolutionResult["sap.wda"] = getMember(oApp, "sap|wda");
            oResolutionResult.systemAlias = getMember(oApp, "sap|app.destination.name");
            return "WDA";
        }

        if (getMember(oApp, "sap|ui.technology") === "URL") {
            oResolutionResult.applicationType = "URL";
            oResolutionResult.systemAlias = getMember(oApp, "sap|app.destination.name");
        }

        return "URL";
    }

    /**
     * Formats the target mappings contained in the CDM site projection into inbounds.
     *
     * @param {object} oSite the CDM site projection.
     * @return {object[]} The inbounds suitable for ClientSideTargetResolution service consumption.
     */
    function formatSite (oSite) {
        if (!oSite) {
            return [];
        }

        var aInbounds = [];
        try {
            var aSiteApplications = Object.keys(oSite.applications || {}).sort();
            aSiteApplications.forEach(function (sApplicationKey) {
                try {
                    var oApp = oSite.applications[sApplicationKey];
                    var oApplicationInbounds = getMember(oApp, "sap|app.crossNavigation.inbounds");
                    if (oApplicationInbounds) {
                        var lst2 = Object.keys(oApplicationInbounds).sort();
                        lst2.forEach(function (sInboundKey) {
                            var oInbound = oApplicationInbounds[sInboundKey];
                            var r = this.mapOne(sInboundKey, oInbound, oApp);
                            if (r) {
                                aInbounds.push(r);
                            }
                        }.bind(this));
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
    }

    /**
     * Constructs a hash string from the given inbound.
     *
     * @param {object} oInbound oInbound structure as specified in App Descriptor schema.
     * @return {string} The constructed hash without leading "#", or undefined if not successful.
     */
    function toHashFromInbound (oInbound) {
        var oShellHash,
            oParams,
            sConstructedHash;

        oShellHash = {
            target: {
                semanticObject: oInbound.semanticObject,
                action: oInbound.action
            },
            params: {}
        };

        oParams = ObjectPath.get("signature.parameters", oInbound) || {};

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

        sConstructedHash = UrlParsing.constructShellHash(oShellHash);

        if (!sConstructedHash) {
            return undefined;
        }
        return sConstructedHash;
    }

    /**
     * Constructs an hash string from the given outbound.
     *
     * @param {object} oOutbound Outbound structure as specified in App Descriptor schema.
     * @return {string} The constructed hash without leading "#", or undefined if not successful.
     */
    function toHashFromOutbound (oOutbound) {
        var oShellHash,
            oParams,
            sConstructedHash;

        oShellHash = {
            target: {
                semanticObject: oOutbound.semanticObject,
                action: oOutbound.action
            },
            params: {}
        };

        oParams = oOutbound.parameters || {};

        Object.keys(oParams).forEach(function (sKey) {
            if (oParams.hasOwnProperty(sKey) && typeof oParams[sKey].value === "object") {
                oShellHash.params[sKey] = [oParams[sKey].value.value];
            }
        });

        sConstructedHash = UrlParsing.constructShellHash(oShellHash);

        if (!sConstructedHash) {
            return undefined;
        }
        return sConstructedHash;
    }

    return {
        formatSite: formatSite,
        toHashFromInbound: toHashFromInbound,
        toHashFromOutbound: toHashFromOutbound,
        // Expose private methods for testing:
        // - test can stub these
        // - code in this module consumes the stubs because they consume "this._method()" instead of "method()"
        mapOne: mapOne,
        _formatApplicationType: formatApplicationType
    };
}, /* bExport= */ true);
