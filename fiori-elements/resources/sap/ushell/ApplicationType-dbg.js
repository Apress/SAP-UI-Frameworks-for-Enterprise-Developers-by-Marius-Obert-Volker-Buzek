// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepExtend",
    "sap/base/util/ObjectPath",
    "sap/ui/core/Configuration",
    "sap/ui/core/routing/History",
    "sap/ui/thirdparty/URI",
    "sap/ushell/_ApplicationType/guiResolution",
    "sap/ushell/_ApplicationType/systemAlias",
    "sap/ushell/_ApplicationType/utils",
    "sap/ushell/_ApplicationType/wdaResolution",
    "sap/ushell/Config",
    "sap/ushell/URLTemplateProcessor",
    "sap/ushell/User",
    "sap/ushell/utils",
    "sap/ui/thirdparty/hasher"
], function (
    Log,
    deepExtend,
    ObjectPath,
    Configuration,
    History,
    URI,
    oGuiResolution,
    oSystemAlias,
    oApplicationTypeUtils,
    oWdaResolution,
    Config,
    URLTemplateProcessor,
    User,
    oUtils,
    hasher
) {
    "use strict";

    var sIframeURLDomainForTests = (new URI(document.URL)).search(true)["iframe-url"];

    function generateWDAResolutionResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        var oInbound = oMatchingTarget.inbound;
        var oResolutionResult = oInbound && oInbound.resolutionResult;
        var oPromise;

        if (oInbound && oResolutionResult) {
            if (oResolutionResult["sap.wda"]) {
                oPromise = oWdaResolution.constructFullWDAResolutionResult(oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver);
            } else {
                oPromise = oWdaResolution.constructWDAResolutionResult(oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver);
            }
        }

        if (oPromise) {
            oPromise.then(function (oResult) {
                checkOpenWithPost(oMatchingTarget, oResult);
                return oResult;
            });
        }

        return oPromise;
    }

    function generateTRResolutionResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        return oGuiResolution.generateTRResolutionResult(oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver)
            .then(function (oResult) {
                checkOpenWithPost(oMatchingTarget, oResult);
                return oResult;
            });
    }

    function generateWCFResolutionResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        var oUri = new URI(sBaseUrl);
        var oInbound = oMatchingTarget.inbound;
        var oInboundResolutionResult = oInbound && oInbound.resolutionResult;
        var oEffectiveParameters = deepExtend({}, oMatchingTarget.mappedIntentParamsPlusSimpleDefaults);
        var sSapSystem;
        var sSapSystemDataSrc;

        if (oEffectiveParameters["sap-system"]) {
            sSapSystem = oEffectiveParameters["sap-system"][0];
            delete oEffectiveParameters["sap-system"];
        }

        if (oEffectiveParameters["sap-system-src"]) {
            sSapSystemDataSrc = oEffectiveParameters["sap-system-src"][0];
            delete oEffectiveParameters["sap-system-src"];
        }

        return new Promise(function (fnResolve, fnReject) {
            oSystemAlias.spliceSapSystemIntoURI(
                oUri,
                oInboundResolutionResult.systemAlias,
                sSapSystem,
                sSapSystemDataSrc,
                "WCF",
                oInboundResolutionResult.systemAliasSemantics || oSystemAlias.SYSTEM_ALIAS_SEMANTICS.applied,
                fnExternalSystemAliasResolver
            )
                .done(function (oURI) {
                    var sParameters = oApplicationTypeUtils.getURLParsing().paramsToString(oEffectiveParameters),
                        sFinalUrl = oApplicationTypeUtils.appendParametersToUrl(sParameters, oURI.toString());

                    var oResolutionResult = {
                        url: sFinalUrl,
                        text: oInboundResolutionResult.text || "",
                        additionalInformation: oInboundResolutionResult.additionalInformation || "",
                        applicationType: "WCF",
                        fullWidth: true
                    };

                    checkOpenWithPost(oMatchingTarget, oResolutionResult);
                    addIframeCacheHintToURL(oResolutionResult, "WCF");
                    fnResolve(oResolutionResult);
                })
                .fail(function (sError) {
                    fnReject(sError);
                });
        });
    }

    function generateUI5ResolutionResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        var oInbound = oMatchingTarget.inbound;
        var oResolutionResult = {};

        // propagate properties from the inbound in the resolution result
        // NOTE: we **propagate** applicationType here, as we want to handle URLs as well
        ["applicationType", "additionalInformation", "applicationDependencies"].forEach(function (sPropName) {
            if (oInbound.resolutionResult.hasOwnProperty(sPropName)) {
                oResolutionResult[sPropName] = oInbound.resolutionResult[sPropName];
            }
        });

        oResolutionResult.url = sBaseUrl;

        // urls are not required if:
        // - the UI5 specifies the manifestUrl among the application dependencies or
        // - the component is part of the dist layer
        if (oResolutionResult.applicationDependencies
            && typeof oResolutionResult.url === "undefined") {

            oResolutionResult.url = ""; // relative url
        }

        // Because of a lazy loading of application properties, we don't want to reject the promise for undefined
        //url. therefore, we set it to empty string
        if (typeof oResolutionResult.url === "undefined") {
            oResolutionResult.url = "";
            // eslint-disable-next-line no-undef
            Log.warning("The component url is undefined. We set it to empty string avoid rejection of the promise");
        }

        // construct effective parameters including defaults
        var oEffectiveParameters = deepExtend({}, oMatchingTarget.mappedIntentParamsPlusSimpleDefaults);

        /*
         * Deal with reserved parameters
         *
         * Reserved parameters are removed from the result url and moved
         * to a separate section of the resolution result.
         */
        oResolutionResult.reservedParameters = {};
        var oReservedParameters = {
            //
            // Used by the RT plugin to determine whether the RT change was made
            // by a key user or by a end-user.
            //
            "sap-ui-fl-max-layer": true,
            //
            // Used by RTA to determine which control variant id(s) should be
            // selected when the application is loaded.
            //
            "sap-ui-fl-control-variant-id": true,
            //
            // Used by RTA to determine draft app which user starts to
            // adapt but don't want to activate immediately.
            //
            "sap-ui-fl-version": true
        };
        Object.keys(oReservedParameters).forEach(function (sName) {
            var sValue = oEffectiveParameters[sName];
            if (sValue) {
                delete oEffectiveParameters[sName];
                oResolutionResult.reservedParameters[sName] = sValue;
            }

        });
        // don't list reserved parameters as defaulted
        oMatchingTarget.mappedDefaultedParamNames = oMatchingTarget.mappedDefaultedParamNames
            .filter(function (sDefaultedParameterName) {
                return !oReservedParameters[sDefaultedParameterName];
            });

        if (oMatchingTarget.mappedDefaultedParamNames.length > 0) {
            oEffectiveParameters["sap-ushell-defaultedParameterNames"] = [JSON.stringify(oMatchingTarget.mappedDefaultedParamNames)];
        }

        var sSapSystem = oEffectiveParameters["sap-system"] && oEffectiveParameters["sap-system"][0];
        var sSapSystemSrc = oEffectiveParameters["sap-system-src"] && oEffectiveParameters["sap-system-src"][0];

        // contrarily to the WDA case, in the SAPUI5 case sap-system and
        // sap-system-src are part of the final URL
        oResolutionResult["sap-system"] = sSapSystem;
        if (typeof sSapSystemSrc === "string") {
            oResolutionResult["sap-system-src"] = sSapSystemSrc;
        }

        oMatchingTarget.effectiveParameters = oEffectiveParameters;

        // prepare a proper URL!
        var sUrlParams = oApplicationTypeUtils.getURLParsing().paramsToString(oEffectiveParameters);
        if (sUrlParams) {
            // append parameters to URL
            oResolutionResult.url = oResolutionResult.url + ((oResolutionResult.url.indexOf("?") < 0) ? "?" : "&") + sUrlParams;
        }

        // IMPORTANT: check for no ui5ComponentName to avoid adding it to URL types
        if (typeof oInbound.resolutionResult.ui5ComponentName !== "undefined") {
            oResolutionResult.ui5ComponentName = oInbound.resolutionResult.ui5ComponentName;
        }

        oResolutionResult.text = oInbound.title;

        return Promise.resolve(oResolutionResult);
    }

    // extracts the inner app route from the browser hash
    function getInnerAppRoute (oTemplatePayload) {
        var sInnerAppRoute = undefined;
        var sHashFragment = hasher.getHash() || window.location.hash;
        var indexOfInnerRoute = sHashFragment.lastIndexOf("&/");
        var iOffset = 1; //to avoid the starting "&";

        if (indexOfInnerRoute > 0) {
            if (oTemplatePayload && oTemplatePayload.capabilities && oTemplatePayload.capabilities.appFrameworkId === "UI5") {
                iOffset = 2; //to avoid the starting "&/"
            }
            sInnerAppRoute = sHashFragment.substring(indexOfInnerRoute + iOffset);
            try {
                if (sInnerAppRoute && sInnerAppRoute.length > 0) {
                    sInnerAppRoute = decodeURIComponent(sInnerAppRoute);
                }
            } catch (e) {
                Log.warning("inner route should be double encoded", e, "sap.ushell.ApplicationType.getInnerAppRoute");
            }
        }
        return sInnerAppRoute;
    }

    function getTargetNavigationMode (oMatchingTarget) {
        var sMode = oMatchingTarget.targetNavigationMode;
        if (sMode === undefined || sMode === "") {
            sMode = "inplace";
        }

        return sMode;
    }

    function getInnerAppState () {
        var sHash = window.hasher && window.hasher.getHash();
        var sKey = "";

        if (sHash && sHash.length > 0 && sHash.indexOf("sap-iapp-state=") > 0) {
            var aParams = /(?:sap-iapp-state=)([^&/\\]+)/.exec(sHash);
            if (aParams && aParams.length === 2) {
                sKey = aParams[1];
            }
        }

        return sKey;
    }

    function createEnv () {
        return new Promise(function (fnResolve) {
            Promise.all([
                sap.ushell.Container.getServiceAsync("UserInfo"),
                sap.ushell.Container.getServiceAsync("PluginManager"),
                oUtils.getUi5VersionAsync()
            ]).then(function (aResults) {
                var oUserInfoService = aResults[0];
                var oPluginsService = aResults[1];
                var sUi5Version = aResults[2];

                var oUser = oUserInfoService.getUser();
                var sContentDensity = oUser.getContentDensity() || (document.body.classList.contains("sapUiSizeCompact") ? "compact" : "cozy");
                var sTheme = oUser.getTheme();
                if (sTheme.indexOf("sap_") !== 0) {
                    var sThemeFormat = User.prototype.constants.themeFormat.THEME_NAME_PLUS_URL;
                    sTheme = oUser.getTheme(sThemeFormat);
                }

                var sLanguage = Configuration.getLanguage && Configuration.getLanguage();
                var sLogonLanguage = Configuration.getSAPLogonLanguage && Configuration.getSAPLogonLanguage();

                var themeServiceRoot = window.location.protocol + "//" + window.location.host // host
                    + "/comsapuitheming.runtime/themeroot/v1"; // route to theme service
                var sessionTimeout = 0;
                if (Config.last("/core/shell/sessionTimeoutIntervalInMinutes") > 0) {
                    sessionTimeout = Config.last("/core/shell/sessionTimeoutIntervalInMinutes");
                }

                var debugMode = false;
                if (window["sap-ui-debug"] !== false && window["sap-ui-debug"] !== undefined) {
                    debugMode = window['sap-ui-debug'];
                }

                fnResolve({
                    language: sLanguage,
                    logonLanguage: sLogonLanguage,
                    theme: sTheme,
                    themeServiceRoot: themeServiceRoot,
                    isDebugMode: debugMode,
                    ui5Version: sUi5Version,
                    contentDensity: sContentDensity,
                    sapPlugins: oPluginsService._getNamesOfPluginsWithAgents(),
                    innerAppState: getInnerAppState(),
                    sessionTimeout: sessionTimeout,
                    historyDirection: History.getInstance().getDirection() || ""
                });
            });
        });
    }

    /**
     * URLTemplates used to expose external navigation modes but it should
     * expose internal navigation modes instead. For backward compatibility, we
     * convert any external navigation mode to the respective internal
     * navigation mode.
     *
     * @param {string} sMaybeExternalNavigationMode
     *  The navigation mode from the template capabilities. Which may erroneously
     *  be an external navigation mode.
     *
     * @return {string}
     *  The internal navigation mode.
     */
    function getURLTemplateInternalNavigationMode (sMaybeExternalNavigationMode) {
        var sInternalNavigationMode;

        switch (sMaybeExternalNavigationMode) {
            case "inplace":
                sInternalNavigationMode = "embedded";
                break;
            case "explace":
                sInternalNavigationMode = "newWindow";
                break;
            default:
                sInternalNavigationMode = sMaybeExternalNavigationMode || "newWindow";
        }

        return sInternalNavigationMode;
    }

    /**
     * Define the navigation mode app capability based on the template internal
     * navigation mode and the external navigation mode configured on the app.
     *
     * @param {string} sTemplateNavigationMode
     *   The template navigation mode
     *
     * @param {object} oSiteAppSection
     *   The site app section
     *
     * @return {string}
     *   The internal navigation mode capability that can be used by the shell
     *   to launch the application.
     */
    function getNavigationModeAppCapability (sTemplateNavigationMode, oSiteAppSection) {
        var sTemplateInternalNavigationMode = getURLTemplateInternalNavigationMode(sTemplateNavigationMode);
        var sAppExternalNavMode = oUtils.getMember(oSiteAppSection, "sap|integration.navMode");

        switch (sAppExternalNavMode) {
            case "inplace":
                // Force the application to be opened in place (ignore template capability)
                return "embedded";

            case "explace":
                if (sTemplateInternalNavigationMode === "embedded") {
                    return "newWindowThenEmbedded"; // app can be opened in embedded mode
                }

                if (["newWindowThenEmbedded", "newWindow"].indexOf(sTemplateInternalNavigationMode) >= 0) {
                    // Use the template defined external navigation mode
                    return sTemplateInternalNavigationMode;
                }

                Log.error(
                    "App-defined navigation mode was ignored",
                    "Application requests to be opened in a new window but no expected navigation mode was defined on the template",
                    "sap.ushell.ApplicationType"
                );

            default:
                // Fallback to template-defined navigation mode.
                return sTemplateInternalNavigationMode;
        }
    }

    /**
     * Creates app capabilities from the template capabilities.
     *
     * The app capabilities are the capabilities of the application instance
     * and may be influenced by the specific configuration of the application.
     *
     *
     * @param {object} oTemplateCapabilities
     *   Template capabilities are default capabilities that indicate how an
     *   application can be configured.
     * @param {object} oSiteAppSection
     *   site application section
     *
     * @param {function} fnInstantiateTemplate
     * A function that instantiates an attribute, like appId of a template.
     *
     * @returns {object} oAppCapabilities
     *   application capabilities
     * @private
     *
     */
    function createAppCapabilities (oTemplateCapabilities, oSiteAppSection, fnInstantiateTemplate) {
        var oAppCapabilities = oUtils.clone(oTemplateCapabilities);
        oAppCapabilities.navigationMode = getNavigationModeAppCapability(oTemplateCapabilities.navigationMode, oSiteAppSection);
        oAppCapabilities.appId = fnInstantiateTemplate(oTemplateCapabilities.appId || "");
        oAppCapabilities.technicalAppComponentId = fnInstantiateTemplate(oTemplateCapabilities.technicalAppComponentId || "");
        oAppCapabilities.appSupportInfo = oSiteAppSection["sap.app"] && oSiteAppSection["sap.app"].ach;
        oAppCapabilities.appFrameworkId = oTemplateCapabilities.appFrameworkId;
        delete oAppCapabilities.urlTransformation;
        return oAppCapabilities;
    }

    function getExtendedInfo (oSite, oSiteAppSection, oMatchingTarget) {
        var oInfo = {
            appParams: {},
            system: undefined
        };

        // set all parameters list
        if (oMatchingTarget.mappedIntentParamsPlusSimpleDefaults) {
            oInfo.appParams = JSON.parse(JSON.stringify(oMatchingTarget.mappedIntentParamsPlusSimpleDefaults));
        }

        // get the system attributes
        var sSystem = oUtils.getMember(oSiteAppSection, "sap|app.destination");
        if (typeof sSystem === "string" && sSystem.length > 0) {
            oInfo.system = oSite.systemAliases[sSystem] && JSON.parse(JSON.stringify(oSite.systemAliases[sSystem]));
            if (typeof oInfo.system === "object") {
                oInfo.system.alias = sSystem;
            }
        }

        return oInfo;
    }

    function compactURLParameters (sUrlExpanded, vTargetNavMode, oCapabilities) {
        return new Promise(function (fnResolve, fnReject) {
            var oUrl = new URI(sUrlExpanded);
            var oParams = oUrl.query(true /* bAsObject */);
            var bIsTransient = true;
            var aRetainParameterList = ["sap-language", "sap-theme", "sap-shell", "sap-ui-app-id", "transaction", "sap-iframe-hint",
                "sap-keep-alive", "sap-ui-versionedLibCss", "sap-wd-configId"]/* retain list */;
            if (oCapabilities && oCapabilities.mandatoryUrlParams) {
                aRetainParameterList = aRetainParameterList.concat(oCapabilities.mandatoryUrlParams.split(","));
                // Remove duplicates
                aRetainParameterList = aRetainParameterList.filter(function (value, index) {
                    return aRetainParameterList.indexOf(value) === index;
                });
            }

            if (vTargetNavMode === "explace") {
                bIsTransient = false;
            }
            sap.ushell.Container.getServiceAsync("ShellNavigation").then(function (oShellNavigationService) {
                oShellNavigationService.compactParams(
                    oParams,
                    aRetainParameterList,
                    undefined /* no Component*/,
                    bIsTransient /*transient*/
                ).done(function (oCompactedParams) {
                    if (!oCompactedParams.hasOwnProperty("sap-intent-param")) {
                        // Return original URL if no compaction happened,
                        // because compacted parameters are sorted when compacting
                        // the shell hash (URLParsing#constructShellHash sorts).
                        // Here we try to keep the specified order from the URL
                        // template if possible.
                        fnResolve(sUrlExpanded);
                        return;
                    }

                    var sUrlCompacted;
                    if (oCompactedParams["sap-theme"]) {
                        var sThemeParam = "sap-theme=" + oCompactedParams["sap-theme"];
                        oCompactedParams["sap-theme"] = "sap-theme-temp-placeholder";
                        oUrl.query(oCompactedParams);
                        sUrlCompacted = oUrl.toString();
                        sUrlCompacted = sUrlCompacted.replace("sap-theme=sap-theme-temp-placeholder", sThemeParam);
                    } else {
                        oUrl.query(oCompactedParams);
                        sUrlCompacted = oUrl.toString();
                    }

                    fnResolve(sUrlCompacted);
                }).fail(function (sError) {
                    fnReject(sError);
                });
            });
        });
    }

    /*
    add "sap-iframe-hint" parameter that will help to identify the
     correct cached iframe in case the URL is opened in stateful container
     */
    function addIframeCacheHintToURL (oResult, sFrameworkId) {
        if (sFrameworkId) {
            appParameterToUrl(oResult, "sap-iframe-hint", sFrameworkId);
        }
    }

    /*
    allow legacy app to be opened with GET and not POST when a parameter is set in the app
     */
    function checkOpenWithPost (oMatchingTarget, oResult) {
        var oAppParams = oMatchingTarget.intentParamsPlusAllDefaults;
        if (oAppParams && oAppParams["sap-post"] && oAppParams["sap-post"][0] === "false") {
            oResult.openWithPostByAppParam = false;
        }
    }

    /*
    add "sap-keep-alive" parameter as a url parameter
     */
    function addKeepAliveToURLTemplateResult (oResult) {
        var sKeepAlive = oResult.extendedInfo.appParams["sap-keep-alive"];
        if (sKeepAlive !== undefined) {
            appParameterToUrl(oResult, "sap-keep-alive", sKeepAlive[0]);
        }
    }

    /*
    add "sap-spaces" parameter as a url parameter
    */
    function addSpacesModeToURLTemplateResult (oResult) {
        var sSpacesMode = Config.last("/core/spaces/enabled");
        if (sSpacesMode === true) {
            appParameterToUrl(oResult, "sap-spaces", sSpacesMode);
        }
    }

    /*
     * this is a temp solution until the url template is changed
     */
    function addLanguageToURLTemplateResult (oResult, oSiteAppSection, oRuntime) {
        var sTemplateId = oUtils.getMember(oSiteAppSection, "sap|integration.urlTemplateId");
        if (sTemplateId === "urltemplate.url-dynamic" && oResult.url.indexOf("sap-language=") === -1) {
            appParameterToUrl(oResult, "sap-language", oRuntime.env.language);
        }
    }

    function appParameterToUrl (oResult, sName, sValue) {
        if (oResult.url) {
            var iHash = oResult.url.indexOf("#");
            var sLeft = oResult.url;
            var sRight = "";

            if (iHash > 0) {
                sLeft = oResult.url.slice(0, iHash);
                sRight = oResult.url.slice(iHash);
            }

            oResult.url = sLeft +
                (sLeft.indexOf("?") >= 0 ? "&" : "?") +
                sName + "=" + sValue +
                sRight;
        }
    }

    function generateURLTemplateResolutionResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        return new Promise(function (fnResolveGlobal) {
            var oInbound = oMatchingTarget.inbound;
            var oTemplateContext = oInbound.templateContext;
            var oCapabilities = oTemplateContext.payload.capabilities || {};

            if (oMatchingTarget.mappedIntentParamsPlusSimpleDefaults &&
                oMatchingTarget.mappedIntentParamsPlusSimpleDefaults.hasOwnProperty("sap-ushell-innerAppRoute")) {
                var sTopHash = window.hasher.getHash();
                if (oMatchingTarget.mappedIntentParamsPlusSimpleDefaults["sap-ushell-innerAppRoute"].length > 0 &&
                    sTopHash.indexOf("&/") === -1) {
                    sTopHash += "&/" + oMatchingTarget.mappedIntentParamsPlusSimpleDefaults["sap-ushell-innerAppRoute"];
                    window.hasher.replaceHash(sTopHash);
                }
            }

            /*
             * Attention: the names in this object must be kept stable. They might
             * appear at any time in any template at runtime. Also, choose a name
             * that can be read by a user. E.g., defaultParameterNames is good,
             * mappedDefaultedParamNames is bad.
             */
            var oRuntime = {
                // the inner app route
                innerAppRoute: getInnerAppRoute(oTemplateContext.payload) || oMatchingTarget.parsedIntent.appSpecificRoute,
                // the target navigation mode
                targetNavMode: getTargetNavigationMode(oMatchingTarget),
                // the names of default parameters among the startupParameters
                defaultParameterNames: oMatchingTarget.mappedDefaultedParamNames,
                /*
                 * the parameters (defaults + inent parameters) that must be passed
                 * to the application in order to start it
                 */
                startupParameter: oMatchingTarget.mappedIntentParamsPlusSimpleDefaults,
                // remote application information (for the scube scenario)
                remoteApplication: {
                    remoteSO: undefined,
                    remoteAction: undefined
                }
            };

            createEnv().then(function (oEnv) {
                // the runtime environment, containing data from the current state of the FLP
                oRuntime.env = oEnv;

                var oTemplateParams = ObjectPath.get(["sap.integration", "urlTemplateParams", "query"], oTemplateContext.siteAppSection) || {};
                if (oTemplateParams.hasOwnProperty("sap-cssurl")) {
                    oRuntime.env.themeServiceRoot = undefined;
                    oRuntime.env.theme = undefined;
                }

                if (oCapabilities.appFrameworkId === "UI5" && oRuntime.startupParameter) {
                    for (var key in oRuntime.startupParameter) {
                        if (key !== "sap-ushell-innerAppRoute") {
                            oRuntime.startupParameter[key][0] = encodeURIComponent(oRuntime.startupParameter[key][0]);
                        }
                        if (key === "sap-shell-so") {
                            oRuntime.remoteApplication.remoteSO = oRuntime.startupParameter[key][0];
                        }
                        if (key === "sap-shell-action") {
                            oRuntime.remoteApplication.remoteAction = oRuntime.startupParameter[key][0];
                        }
                    }
                    if (oMatchingTarget.mappedDefaultedParamNames && oMatchingTarget.mappedDefaultedParamNames.length > 0) {
                        var tmpMappedDefaultedParamNames = oMatchingTarget.mappedDefaultedParamNames.filter(function (paramName) {
                            return paramName !== "sap-shell-so" && paramName !== "sap-shell-action" && paramName !== "sap-system";
                        });
                        oRuntime.startupParameter["sap-ushell-defaultedParameterNames"] = [JSON.stringify(tmpMappedDefaultedParamNames)];
                    }
                    delete oRuntime.startupParameter["sap-shell-so"];
                    delete oRuntime.startupParameter["sap-shell-action"];
                }

                //this is a hot fix made for an escelation opened by
                // Lockheed Martin 885662/2021 about sap workzone, which
                // is the only quick way to solve the issue. A more
                // deep process to solve the issue in a proper way will
                // be done via a BLI as the issue is very complex
                var sJamSearchPref = "/universal_search/search?query=",
                    iJamSearchPos = oRuntime.innerAppRoute && oRuntime.innerAppRoute.indexOf(sJamSearchPref),
                    JamSearchVal;
                if (iJamSearchPos === 0) {
                    JamSearchVal = oRuntime.innerAppRoute.substring(sJamSearchPref.length);
                    oRuntime.innerAppRoute = "/JAMSEARCHPATHH?JAMSEARCHVALUEE=VALUEE";
                }

                var sURL = URLTemplateProcessor.expand(
                    oTemplateContext.payload,
                    oTemplateContext.site,
                    oRuntime,
                    oTemplateContext.siteAppSection,
                    "startupParameter"
                );

                if (iJamSearchPos === 0) {
                    sURL = sURL.replace("/JAMSEARCHPATHH?JAMSEARCHVALUEE=VALUEE", sJamSearchPref + encodeURIComponent(JamSearchVal));
                }

                if (oRuntime.env.theme === undefined) {
                    sURL = sURL.replace("&sap-theme=", "");
                }

                //temporary bug fix until URITemplate.js will be fixed.
                //for ui5 apps, the hash added to the URL in the template processing is encoded twice
                //and there for it does not match the hash of FLP (browser url). we need to replace the
                //hash in the URL with the correct hash of FLP which is encoded only once.
                //currently, there is no way to do that in the template itself.
                if (oCapabilities.appFrameworkId === "UI5" && document.URL.indexOf("#") > 0) {
                    var sResURLParts = sURL.split("#"),
                        sResHashParts = sResURLParts[1].split("&/"),
                        sCurrURLParts = sap.ushell.Container.getFLPUrl(true).split("#"),
                        sCurrHashParts = sCurrURLParts[1].split("&/");

                    sURL = sResURLParts[0] + "#" + sCurrHashParts[0] + (sResHashParts.length > 1 ? "&/" + sResHashParts[1] : "");
                    Log.debug("- created URL with fixed hash: " + sURL, "sap.ushell.ApplicationType");
                }

                //returns a function that instantiates an attribute, like appId of a template
                var fnInstantiateTemplate = function (sTemplate) {

                    var oPayloadClone = oUtils.clone(oTemplateContext.payload);
                    oPayloadClone.urlTemplate = sTemplate;
                    return URLTemplateProcessor.expand(
                        oPayloadClone,
                        oTemplateContext.site,
                        oRuntime,
                        oTemplateContext.siteAppSection,
                        "startupParameter"
                    );
                };

                var oResult = {
                    applicationType: "URL",
                    text: oInbound.title,
                    appCapabilities: createAppCapabilities(
                        oCapabilities,
                        oTemplateContext.siteAppSection,
                        fnInstantiateTemplate
                    ),
                    url: sURL,
                    extendedInfo: getExtendedInfo(oTemplateContext.site, oTemplateContext.siteAppSection, oMatchingTarget),
                    contentProviderId: oInbound.contentProviderId || "",
                    systemAlias: (oTemplateContext.siteAppSection["sap.app"] &&
                        oTemplateContext.siteAppSection["sap.app"].destination) ||
                        oTemplateContext.siteAppSection.destination || ""
                };
                addIframeCacheHintToURL(oResult, oResult.appCapabilities.appFrameworkId);
                addKeepAliveToURLTemplateResult(oResult);
                addSpacesModeToURLTemplateResult(oResult);
                addLanguageToURLTemplateResult(oResult, oTemplateContext.siteAppSection, oRuntime);

                var oPromisePostTemplateProcessing = new Promise(function (fnResolve) {
                    sap.ushell.Container.getServiceAsync("URLTemplate").then(function (srv) {
                        sap.ui.require(["sap/ushell/components/applicationIntegration/application/BlueBoxesCache"], function (BlueBoxesCache) {
                            var bForNewIframe = (BlueBoxesCache.get(oResult.url) === undefined);
                            srv.handlePostTemplateProcessing(oResult.url, oTemplateContext.siteAppSection, bForNewIframe).then(fnResolve);
                        });
                    });
                });

                oPromisePostTemplateProcessing.then(function (sURLNew) {
                    //special case for selenium tests that use different iframe domain
                    if (sIframeURLDomainForTests && sURLNew.indexOf("ui5appruntime.html") > 0) {
                        var arrUrlParts = sURLNew.split("?");
                        arrUrlParts[0] = sIframeURLDomainForTests;
                        sURLNew = arrUrlParts.join("?");
                    }
                    oResult.url = sURLNew;
                    handleURLTransformation(oResult.url, oCapabilities, oTemplateContext).then(function (sTransformedURL) {
                        oResult.url = sTransformedURL;
                        //GUI url should not be compacted as it is not compacted in ABAP FLP
                        if (oResult.url && typeof oResult.url === "string" && oResult.url.indexOf("sap-iframe-hint=GUI") > 0) {
                            fnResolveGlobal(oResult);
                        } else {
                            compactURLParameters(oResult.url, oRuntime.targetNavMode, oCapabilities)
                                .then(function (sCompactURL) {
                                    oResult.url = sCompactURL;
                                    fnResolveGlobal(oResult);
                                }, function () {
                                    fnResolveGlobal(oResult);
                                });
                        }
                    });
                });
            });
        });
    }

    function handleURLTransformation (sUrl, oCapabilities, oTemplateContext) {
        return new Promise(function (fnResolve) {
            var oTransformation = oCapabilities.urlTransformation || { enabled: false };


            if (isTransformationEnabled(oTransformation, oTemplateContext)) {
                var oIframeURI = new URI(sUrl);
                var oFirstTransformation = oTransformation.transformations[0];
                var oService = oFirstTransformation.service.uri;
                var oTransformData = URLTemplateProcessor.prepareExpandData(
                    {
                        urlTemplate: "",
                        parameters: {
                            names: oService.queryOptions
                        }
                    },
                    {},
                    {
                        urlComponent: {
                            query: oIframeURI.query(),
                            fragment: oIframeURI.fragment()
                        }
                    },
                    oTemplateContext.siteAppSection,
                    ""
                );

                var sServiceUrl = URI.expand("{+rootPath}/{+resourcePath}{?queryParams*}", {
                    rootPath: oService.rootPath,
                    resourcePath: oService.resourcePath,
                    queryParams: oTransformData.oResolvedParameters
                }).toString();

                sap.ui.require(["sap/ui/thirdparty/datajs"], function (OData) {
                    OData.read({
                            requestUri: sServiceUrl,
                            headers: {
                                "Cache-Control": "no-cache, no-store, must-revalidate",
                                Pragma: "no-cache",
                                Expires: "0"
                            }
                        },
                        // Success handler
                        function (oRes) {
                            var resVal = ObjectPath.get("transformAppLaunchQueryString.value", oRes);
                            if (resVal === undefined) {
                                resVal = ObjectPath.get("transformAppLaunchIntent.value", oRes);
                            }
                            if (resVal === undefined) {
                                resVal = ObjectPath.get("transformAppLaunchQueryString.queryString", oRes);
                            }

                            Log.info(
                                "URL Transformation Succeeded",
                                JSON.stringify({
                                    URLBeforeTransformation: sUrl,
                                    URLAfterTransformation: resVal
                                }),
                                "sap.ushell.ApplicationType"
                            );

                            var sSourceURLComponent = oFirstTransformation.sourceURLComponent;
                            if (sSourceURLComponent === undefined) {
                                sSourceURLComponent = "query";
                            }

                            if (sSourceURLComponent === "query" || sSourceURLComponent === "fragment") {
                                sUrl = oIframeURI[sSourceURLComponent].apply(oIframeURI, [resVal]).toString();
                            } else {
                                Log.error(
                                    "The " + sSourceURLComponent + " component of the URL in URI.js is not transformed",
                                    "",
                                    "sap.ushell.ApplicationType"
                                );
                            }
                            fnResolve(sUrl);
                        },
                        // Fail handler
                        function (oMessage) {
                            Log.error(
                                "URL Transformation Failed",
                                JSON.stringify(oMessage),
                                "sap.ushell.ApplicationType"
                            );
                            fnResolve(sUrl);
                        }
                    );
                });
            } else {
                fnResolve(sUrl);
            }
        });
    }

    function isTransformationEnabled (oTransformation, oTemplateContext) {
        if (typeof oTransformation.enabled === "boolean") {
            return oTransformation.enabled;
        }
        var oTransformData = URLTemplateProcessor.prepareExpandData(
            {
                urlTemplate: "",
                parameters: {
                    names: {
                        enabled: oTransformation.enabled
                    }
                }
            },
            {},
            {},
            oTemplateContext.siteAppSection,
            ""
        );

        return (typeof oTransformData.oResolvedParameters.enabled === "boolean" ?
            oTransformData.oResolvedParameters.enabled : false);
    }


    function generateURLResolutionResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        var oInbound = oMatchingTarget.inbound;
        var oInboundResolutionResult = oInbound && oInbound.resolutionResult;
        var oResolutionResult = {};

        // splice parameters into url
        var oURI = new URI(sBaseUrl);

        // construct effective parameters including defaults
        var oEffectiveParameters = deepExtend({}, oMatchingTarget.mappedIntentParamsPlusSimpleDefaults);

        // a special hack to work around the AA modelling of Tile Intents in the export
        // the special intent Shell-launchURL with a dedicated parameter sap-external-url
        // which shall *not* be propagated into the final url
        if (oMatchingTarget.inbound
            && oMatchingTarget.inbound.action === "launchURL"
            && oMatchingTarget.inbound.semanticObject === "Shell"
        ) {
            delete oEffectiveParameters["sap-external-url"];
        }

        var sSapSystem = oEffectiveParameters["sap-system"] && oEffectiveParameters["sap-system"][0];
        var sSapSystemDataSrc = oEffectiveParameters["sap-system-src"] && oEffectiveParameters["sap-system-src"][0];

        // do not include the sap-system parameter in the URL
        oResolutionResult["sap-system"] = sSapSystem;
        delete oEffectiveParameters["sap-system"];

        // do not include the sap-system-src parameter in the URL
        if (typeof sSapSystemDataSrc === "string") {
            oResolutionResult["sap-system-src"] = sSapSystemDataSrc;
            delete oEffectiveParameters["sap-system-src"];
        }

        return (new Promise(function (fnResolve, fnReject) {
            if (
                oApplicationTypeUtils.absoluteUrlDefinedByUser(
                    oURI, oInboundResolutionResult.systemAlias,
                    oInboundResolutionResult.systemAliasSemantics
                )
            ) {
                fnResolve(sBaseUrl);
            } else {
                oSystemAlias.spliceSapSystemIntoURI(
                    oURI, oInboundResolutionResult.systemAlias,
                    sSapSystem,
                    sSapSystemDataSrc,
                    "URL",
                    oInboundResolutionResult.systemAliasSemantics || oSystemAlias.SYSTEM_ALIAS_SEMANTICS.applied,
                    fnExternalSystemAliasResolver
                )
                    .fail(fnReject)
                    .done(function (oSapSystemURI) {
                        var sSapSystemUrl = oSapSystemURI.toString();
                        fnResolve(sSapSystemUrl);
                    });
            }
        }))
            .then(function (sUrlWithoutParameters) {
                var bAppendParams = false,
                    sParameters,
                    sFLPURLDetectionPattern = Config.last("/core/navigation/flpURLDetectionPattern"),
                    rFLPURLDetectionRegex = new RegExp(sFLPURLDetectionPattern);

                if (oEffectiveParameters && oEffectiveParameters.hasOwnProperty("sap-params-append")) {
                    delete oEffectiveParameters["sap-params-append"];
                    bAppendParams = true;
                }
                sParameters = oApplicationTypeUtils.getURLParsing().paramsToString(oEffectiveParameters);
                return rFLPURLDetectionRegex.test(sUrlWithoutParameters) || (bAppendParams === true)
                    ? oApplicationTypeUtils.appendParametersToIntentURL(oEffectiveParameters, sUrlWithoutParameters)
                    : oApplicationTypeUtils.appendParametersToUrl(sParameters, sUrlWithoutParameters);

            }, Promise.reject.bind(Promise))
            .then(function (sUrlWithParameters) {
                // propagate properties from the inbound in the resolution result
                ["additionalInformation", "applicationDependencies", "systemAlias"].forEach(function (sPropName) {
                    if (oInbound.resolutionResult.hasOwnProperty(sPropName)) {
                        oResolutionResult[sPropName] = oInbound.resolutionResult[sPropName];
                    }
                });

                oResolutionResult.url = sUrlWithParameters;
                oResolutionResult.text = oInbound.title;
                oResolutionResult.applicationType = "URL";

                return Promise.resolve(oResolutionResult);
            }, Promise.reject.bind(Promise));
    }

    var oApplicationType = {
        /**
         * This type represents web applications identified by any uniform resource locator. They
         * will be embedded into an <code>IFRAME</code>.
         *
         * @constant
         * @default "URL"
         * @name ApplicationType.URL
         * @since 1.15.0
         * @type string
         */
        URL: {
            type: "URL",
            defaultFullWidthSetting: true,
            generateResolutionResult: function (oMatchingTarget) {
                var bUseTemplate = oMatchingTarget.inbound.hasOwnProperty("templateContext");
                return bUseTemplate
                    ? generateURLTemplateResolutionResult.apply(null, arguments)
                    : generateURLResolutionResult.apply(null, arguments);
            },
            easyAccessMenu: {
                intent: "Shell-startURL",
                resolver: null,
                showSystemSelectionInUserMenu: true,
                showSystemSelectionInSapMenu: false,
                systemSelectionPriority: 1
            }
        },
        /**
         * This type represents applications built with Web Dynpro for ABAP. The embedding
         * container knows how to embed such applications in a smart way.
         *
         * @constant
         * @default "WDA"
         * @name ApplicationType.WDA
         * @since 1.15.0
         * @type string
         */
        WDA: {
            type: "WDA",
            defaultFullWidthSetting: true,
            enableWdaCompatibilityMode: Config.last("/core/navigation/enableWdaCompatibilityMode"),
            generateResolutionResult: generateWDAResolutionResult,
            easyAccessMenu: {
                intent: "Shell-startWDA",
                resolver: oWdaResolution.resolveEasyAccessMenuIntentWDA,
                showSystemSelectionInUserMenu: true,
                showSystemSelectionInSapMenu: true,
                systemSelectionPriority: 2 // preferred over URL
            }
        },
        /**
         * This type represents transaction applications.
         * The embedding container knows how to embed such applications in a smart way.
         *
         * @constant
         * @default "TR"
         * @name ApplicationType.TR
         * @since 1.36.0
         * @type string
         */
        TR: {
            type: "TR",
            defaultFullWidthSetting: true,
            generateResolutionResult: generateTRResolutionResult,
            easyAccessMenu: {
                intent: "Shell-startGUI",
                resolver: oGuiResolution.resolveEasyAccessMenuIntentWebgui,
                showSystemSelectionInUserMenu: true,
                showSystemSelectionInSapMenu: true,
                systemSelectionPriority: 3 // startGUI titles are preferred over WDA and URL
            }
        },
        /**
         * This type represents applications embedded via NetWeaver Business Client.
         * The embedding container knows how to embed such applications in a smart way.
         *
         * @constant
         * @default "NWBC"
         * @name ApplicationType.NWBC
         * @since 1.19.0
         * @type string
         */
        NWBC: {
            type: "NWBC",
            defaultFullWidthSetting: true
            // there is no input application type like this
        },
        /**
         * This type represents applications built with the WebClient UI Framework (aka CRM UI).
         * The embedding container knows how to embed such applications in a smart way.
         *
         * @constant
         * @default "WCF"
         * @name ApplicationType.WCF
         * @since 1.56.0
         * @type string
         */
        WCF: {
            type: "WCF",
            generateResolutionResult: generateWCFResolutionResult,
            defaultFullWidthSetting: true
        },
        SAPUI5: {
            type: "SAPUI5",
            generateResolutionResult: generateUI5ResolutionResult,
            defaultFullWidthSetting: false
        }
    };

    function getEasyAccessMenuDefinitions () {
        return Object.keys(oApplicationType)
            .map(function (sApplicationType) {
                return oApplicationType[sApplicationType];
            })
            .filter(function (oApplicationTypeDefinition) {
                return typeof oApplicationTypeDefinition.easyAccessMenu === "object";
            });
    }

    function createEasyAccessMenuResolverGetter () {
        var oEasyAccessMenuIntentResolver = {};
        getEasyAccessMenuDefinitions()
            .forEach(function (oApplicationTypeDefinitionWithEasyAccessMenu) {
                oEasyAccessMenuIntentResolver[
                    oApplicationTypeDefinitionWithEasyAccessMenu.easyAccessMenu.intent
                ] = oApplicationTypeDefinitionWithEasyAccessMenu.easyAccessMenu.resolver;
            });

        return function (sMaybeEasyAccessMenuIntent, sResolvedApplicationType) {
            if (
                oEasyAccessMenuIntentResolver[sMaybeEasyAccessMenuIntent]
                && (!sResolvedApplicationType || sResolvedApplicationType !== "SAPUI5")
            ) {
                return oEasyAccessMenuIntentResolver[sMaybeEasyAccessMenuIntent];
            }
            return null;
        };
    }

    function getDefaultFullWidthSetting (sApplicationType) {
        return !!oApplicationType[sApplicationType] && oApplicationType[sApplicationType].defaultFullWidthSetting;
    }

    /**
     * The application types supported by the embedding container.
     *
     * @since 1.15.0
     * @enum {String}
     * @private
     */
    Object.defineProperty(oApplicationType, "enum", {
        value: Object.keys(oApplicationType).reduce(function (oAccumulator, sCurrentKey) {
            if (oApplicationType[sCurrentKey].type) {
                oAccumulator[sCurrentKey] = oApplicationType[sCurrentKey].type;
            }
            return oAccumulator;
        }, {})
    });

    var oMethods = {
        getEasyAccessMenuResolver: createEasyAccessMenuResolverGetter(),
        getEasyAccessMenuDefinitions: getEasyAccessMenuDefinitions,
        getDefaultFullWidthSetting: getDefaultFullWidthSetting,
        handleURLTransformation: handleURLTransformation
    };

    Object.keys(oMethods).forEach(function (sMethodName) {
        Object.defineProperty(oApplicationType, sMethodName, {
            value: oMethods[sMethodName]
        });
    });

    return oApplicationType;
}, false);
