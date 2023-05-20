// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/library",
    "sap/ui/core/mvc/Controller",
    "sap/ushell/components/tiles/utils",
    "sap/ushell/components/applicationIntegration/AppLifeCycle",
    "sap/ushell/Config",
    "sap/ushell/utils/WindowUtils",
    "sap/m/library",
    "sap/ui/model/json/JSONModel",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log",
    "sap/ushell/utils/DynamicTileRequest",
    "sap/ushell/utils/UrlParsing",
    "sap/ushell/utils"
], function (
    ushellLibrary,
    Controller,
    utils,
    AppLifeCycle,
    Config,
    WindowUtils,
    mobileLibrary,
    JSONModel,
    jQuery,
    Log,
    DynamicTileRequest,
    UrlParsing,
    ushellUtils
) {
    "use strict";

    // shortcut for sap.m.GenericTileScope
    var GenericTileScope = mobileLibrary.GenericTileScope;

    // shortcut for sap.m.GenericTileMode
    var GenericTileMode = mobileLibrary.GenericTileMode;

    // shortcut for sap.ushell.AppType
    var AppType = ushellLibrary.AppType;

    /* global hasher */

    var COMPONENT_NAME = "sap.ushell.components.tiles.applauncherdynamic.DynamicTile";

    return Controller.extend(COMPONENT_NAME, {
        _aDoables: [],

        // handle to control/cancel data.js OData.read()
        oDataRequest: null,

        sConfigNavigationTargetUrlOld: "",

        REFRESH_INTERVAL_MIN: 10,

        constructTargetUrlWithSapSystem: function (sNavigationTargetUrl, sSystem) {
            var oHash;

            if (sSystem) { // propagate system to target application
                // when the navigation url is hash we want to make sure system parameter is in the parameters part
                // BCP 1780450594
                if (UrlParsing.isIntentUrl(sNavigationTargetUrl)) {
                    oHash = UrlParsing.parseShellHash(sNavigationTargetUrl);
                    if (!oHash.params) {
                        oHash.params = {};
                    }
                    oHash.params["sap-system"] = sSystem;
                    sNavigationTargetUrl = "#" + UrlParsing.constructShellHash(oHash);
                } else {
                    sNavigationTargetUrl += ((sNavigationTargetUrl.indexOf("?") < 0) ? "?" : "&") + "sap-system=" + sSystem;
                }
            }
            return sNavigationTargetUrl;
        },

        onInit: function () {
            var that = this;
            var oView = this.getView();
            var oViewData = oView.getViewData();
            var oTileApi = oViewData.chip;
            var oConfig = utils.getAppLauncherConfig(oTileApi, oTileApi.configurationUi.isEnabled(), false);
            var sNavigationTargetUrlInit = oConfig.navigation_target_url;
            var sSystem = oTileApi.url.getApplicationSystem();

            this.sConfigNavigationTargetUrlOld = oConfig.navigation_target_url;
            Log.setLevel(2, COMPONENT_NAME);

            this.bIsRequestCompleted = false;
            this.oShellModel = AppLifeCycle.getElementsModel();
            this.navigationTargetUrl = this.constructTargetUrlWithSapSystem(sNavigationTargetUrlInit, sSystem);

            var oModel = new JSONModel({
                sizeBehavior: Config.last("/core/home/sizeBehavior"),
                wrappingType: Config.last("/core/home/wrappingType"),
                config: oConfig,
                mode: oConfig.display_mode || GenericTileMode.ContentMode,
                data: utils.getDataToDisplay(oConfig, {
                    number: ((oTileApi.preview && oTileApi.preview.isEnabled()) ? 1234 : "...")
                }),
                nav: { navigation_target_url: (oTileApi.configurationUi && oTileApi.configurationUi.isEnabled() ? "" : this.navigationTargetUrl) },
                search: { display_highlight_terms: [] }
            });
            oView.setModel(oModel);
            // listen for changes of the size behavior, as the end user can change it in the settings (if enabled)
            this._aDoables.push(Config.on("/core/home/sizeBehavior").do(function (sSizeBehavior) {
                oModel.setProperty("/sizeBehavior", sSizeBehavior);
            }));

            // implement types contact
            // default is Tile
            if (oTileApi.types) {
                oTileApi.types.attachSetType(function (sType) {
                    if (that.tileType !== sType) {
                        if (sType === "link") {
                            oModel.setProperty("/mode", GenericTileMode.LineMode);
                        } else {
                            oModel.setProperty("/mode", oModel.getProperty("/config/display_mode") || GenericTileMode.ContentMode);
                        }
                        that.tileType = sType;
                    }
                });
            }

            if (!this.tileType) {
                this.tileType = "tile";
            }

            // implement search contract
            if (oTileApi.search) {
                // split and clean keyword string (may be comma + space delimited)
                var sKeywords = oView.getModel().getProperty("/config/display_search_keywords");
                var aKeywords = sKeywords
                    .split(/[, ]+/)
                    .filter(function (n, i) { return n && n !== ""; });

                // add title, subtitle, info and number unit (if present) to keywords for better FLP searching
                if (oConfig.display_title_text && oConfig.display_title_text !== "" &&
                    aKeywords.indexOf(oConfig.display_title_text) === -1) {
                    aKeywords.push(oConfig.display_title_text);
                }
                if (oConfig.display_subtitle_text && oConfig.display_subtitle_text !== "" &&
                    aKeywords.indexOf(oConfig.display_subtitle_text) === -1) {
                    aKeywords.push(oConfig.display_subtitle_text);
                }
                if (oConfig.display_info_text && oConfig.display_info_text !== "" &&
                    aKeywords.indexOf(oConfig.display_info_text) === -1) {
                    aKeywords.push(oConfig.display_info_text);
                }
                // The Number Unit may not only be a currency but can also be something like "open leave requests"
                // which the user may want to search for.
                // Note: Number unit is the only not translatable property.
                if (oConfig.display_number_unit && oConfig.display_number_unit !== "" &&
                    aKeywords.indexOf(oConfig.display_number_unit) === -1) {
                    aKeywords.push(oConfig.display_number_unit);
                }

                // defined in search contract:
                oTileApi.search.setKeywords(aKeywords);
                oTileApi.search.attachHighlight(
                    function (aHighlightWords) {
                        // update model for highlighted search term
                        oView.getModel().setProperty("/search/display_highlight_terms", aHighlightWords);
                    }
                );
            }

            // implement bag update handler
            if (oTileApi.bag && oTileApi.bag.attachBagsUpdated) {
                // is only called by the FLP for bookmark tiles which have been updated via bookmark service
                oTileApi.bag.attachBagsUpdated(function (aUpdatedBagIds) {
                    if (aUpdatedBagIds.indexOf("tileProperties") > -1) {
                        utils._updateTilePropertiesTexts(oView, oTileApi.bag.getBag("tileProperties"));
                    }
                });
            }

            // implement configuration update handler
            if (oTileApi.configuration && oTileApi.configuration.attachConfigurationUpdated) {
                // is only called by the FLP for bookmark tiles which have been updated via bookmark service
                oTileApi.configuration.attachConfigurationUpdated(function (aUpdatedConfigKeys) {
                    if (aUpdatedConfigKeys.indexOf("tileConfiguration") > -1) {
                        utils._updateTileConfiguration(oView, oTileApi.configuration.getParameterValueAsString("tileConfiguration"));
                    }
                });
            }

            // implement preview contract
            if (oTileApi.preview) {
                oTileApi.preview.setTargetUrl(this.navigationTargetUrl);
                oTileApi.preview.setPreviewIcon(oConfig.display_icon_url);
                oTileApi.preview.setPreviewTitle(oConfig.display_title_text);
                if (oTileApi.preview.setPreviewSubtitle && typeof oTileApi.preview.setPreviewSubtitle === "function") {
                    oTileApi.preview.setPreviewSubtitle(oConfig.display_subtitle_text);
                }
            }

            // implement configurationUi contract: setup configuration UI
            if (oTileApi.configurationUi.isEnabled()) {
                oTileApi.configurationUi.setAsyncUiProvider(function () {
                    return utils.getConfigurationUi(
                        oView,
                        "sap.ushell.components.tiles.applauncherdynamic.Configuration"
                    ).then(function (oConfigurationUi) {
                        oTileApi.configurationUi.attachCancel(that.onCancelConfiguration.bind(null, oConfigurationUi));
                        oTileApi.configurationUi.attachSave(that.onSaveConfiguration.bind(null, oConfigurationUi));
                        return oConfigurationUi;
                    });
                });

                this.getView().getContent()[0].setTooltip(
                    utils.getResourceBundleModel().getResourceBundle()
                        .getText("edit_configuration.tooltip")
                );
            } else if (!oTileApi.preview || !oTileApi.preview.isEnabled()) {
                if (!sSystem) {
                    sap.ushell.Container.addRemoteSystemForServiceUrl(oConfig.service_url);
                } // else registration is skipped because registration has been done already
                // outside this controller (e.g. remote catalog registration)

                // start fetching data from backend service if not in preview or admin mode
                this.bNeedsRefresh = true;
                this.iNrOfTimerRunning = 0;
            }

            // implement refresh contract
            if (oTileApi.refresh) {
                oTileApi.refresh.attachRefresh(this.refreshHandler.bind(this));
            }

            // implement visible contract
            if (oTileApi.visible) {
                oTileApi.visible.attachVisible(this.visibleHandler.bind(this));
            }

            // attach the tile actions provider for the actions contract
            if (oTileApi.actions) {
                var aExtendedActions;
                var aActions = oConfig.actions;
                if (aActions) {
                    aExtendedActions = aActions.slice();
                } else {
                    aExtendedActions = [];
                }

                if (Config.last("/core/shell/enablePersonalization")) {
                    var sType = oModel.getProperty("/mode") === GenericTileMode.LineMode ? "link" : "tile";
                    var tileSettingsAction = utils.getTileSettingsAction(oModel, this.onSaveRuntimeSettings.bind(this), sType);
                    aExtendedActions.push(tileSettingsAction);
                }

                oTileApi.actions.setActionsProvider(function () {
                    return aExtendedActions;
                });
            }
            sap.ui.getCore().getEventBus().subscribe("launchpad", "sessionTimeout", this._clearRequest, this);
        },

        // convenience function to stop browser's timeout and OData calls
        stopRequests: function () {
            if (this.oDataRequest) {
                // actual request abort
                if (this.oDataRequest.abort()) {
                    // We didn't finish the last refresh, so we need todo one as soon as the tile becomes visible again
                    this.bNeedsRefresh = true;
                }
            }
        },

        _clearRequest: function () {
            this.stopRequests();
            clearTimeout(this.timer);
        },

        // destroy handler stops requests
        onExit: function () {
            if (this.oDataRequest) {
                this._clearRequest();
                this.oDataRequest.destroy();
            }
            sap.ui.getCore().getEventBus().unsubscribe("launchpad", "sessionTimeout", this._clearRequest, this);
            this._aDoables.forEach(function (oDoable) {
                oDoable.off();
            });
            this._aDoables = [];
        },

        // trigger to show the configuration UI if the tile is pressed in Admin mode
        onPress: function (oEvent) {
            var oView = this.getView();
            var oViewData = oView.getViewData();
            var oModel = oView.getModel();
            var sTargetUrl = oModel.getProperty("/nav/navigation_target_url");
            var oTileApi = oViewData.chip;
            var oTileConfig = oModel.getProperty("/config");

            //scope is property of generic tile. It's default value is "Display"
            if (oEvent.getSource().getScope && oEvent.getSource().getScope() === GenericTileScope.Display) {
                if (oTileApi.configurationUi.isEnabled()) {
                    oTileApi.configurationUi.display();
                } else if (sTargetUrl) {
                    if (sTargetUrl[0] === "#") {
                        hasher.setHash(sTargetUrl);
                    } else {
                        // add theURL to recent activity log
                        var bLogRecentActivity = Config.last("/core/shell/enableRecentActivity") && Config.last("/core/shell/enableRecentActivityLogging");
                        if (bLogRecentActivity) {
                            var oRecentEntry = {
                                title: oTileConfig.display_title_text,
                                appType: AppType.URL,
                                url: oTileConfig.navigation_target_url,
                                appId: oTileConfig.navigation_target_url
                            };
                            sap.ushell.Container.getRenderer("fiori2").logRecentActivity(oRecentEntry);
                        }

                        WindowUtils.openURL(sTargetUrl, "_blank");
                    }
                }
            }
        },

        // tile settings action UI save handler
        onSaveRuntimeSettings: function (oSettingsView) {
            var oView = this.getView();
            var oViewModel = oView.getModel();
            var oTileApi = oView.getViewData().chip;
            var oConfigToSave = oViewModel.getProperty("/config");
            var oSettingsViewModel = oSettingsView.getModel();

            oConfigToSave.display_title_text = oSettingsViewModel.getProperty("/title") || "";
            oConfigToSave.display_subtitle_text = oSettingsViewModel.getProperty("/subtitle") || "";
            oConfigToSave.display_info_text = oSettingsViewModel.getProperty("/info") || "";
            oConfigToSave.display_search_keywords = oSettingsViewModel.getProperty("/keywords") || "";

            // use bag contract in order to store translatable properties
            var tilePropertiesBag = oTileApi.bag.getBag("tileProperties");
            tilePropertiesBag.setText("display_title_text", oConfigToSave.display_title_text);
            tilePropertiesBag.setText("display_subtitle_text", oConfigToSave.display_subtitle_text);
            tilePropertiesBag.setText("display_info_text", oConfigToSave.display_info_text);
            tilePropertiesBag.setText("display_search_keywords", oConfigToSave.display_search_keywords);

            function logErrorAndReject (oError) {
                Log.error(oError, null, COMPONENT_NAME);
            }

            // saving the relevant properties
            tilePropertiesBag.save(
                // success handler
                function () {
                    Log.debug("property bag 'tileProperties' saved successfully");

                    // update the local tile's config - saving changes on the Model
                    oViewModel.setProperty("/config", oConfigToSave);

                    // update tile's model for changes to appear immediately
                    // (and not wait for the refresh handler which happens every 10 seconds)
                    oViewModel.setProperty("/data/display_title_text", oConfigToSave.display_title_text);
                    oViewModel.setProperty("/data/display_subtitle_text", oConfigToSave.display_subtitle_text);
                    oViewModel.setProperty("/data/display_info_text", oConfigToSave.display_info_text);

                    // call to refresh model which (due to the binding) will refresh the tile
                    oViewModel.refresh();
                },
                logErrorAndReject // error handler
            );
        },

        // configuration save handler
        onSaveConfiguration: function (oConfigurationView) {
            // the deferred object required from the configurationUi contract
            var oDeferred = new jQuery.Deferred();
            var oModel = oConfigurationView.getModel();
            // tile model placed into configuration model by getConfigurationUi
            var oTileModel = oModel.getProperty("/tileModel");
            var oTileApi = oConfigurationView.getViewData().chip;
            var aTileNavigationActions = utils.tileActionsRows2TileActionsArray(oModel.getProperty("/config/tile_actions_rows"));
            // get the configuration to save from the model
            var configToSave = {
                display_icon_url: oModel.getProperty("/config/display_icon_url"),
                display_number_unit: oModel.getProperty("/config/display_number_unit"),
                service_url: oModel.getProperty("/config/service_url"),
                service_refresh_interval: oModel.getProperty("/config/service_refresh_interval"),
                navigation_use_semantic_object: oModel.getProperty("/config/navigation_use_semantic_object"),
                navigation_target_url: oModel.getProperty("/config/navigation_target_url"),
                navigation_semantic_object: (oModel.getProperty("/config/navigation_semantic_object") || "").trim(),
                navigation_semantic_action: (oModel.getProperty("/config/navigation_semantic_action") || "").trim(),
                navigation_semantic_parameters: (oModel.getProperty("/config/navigation_semantic_parameters") || "").trim(),
                display_search_keywords: oModel.getProperty("/config/display_search_keywords")
            };
            //If the input fields icon, semantic object and action are failing the input validations, then through an error message requesting the user to enter/correct those fields
            var bReject = utils.checkInputOnSaveConfig(oConfigurationView);
            if (!bReject) {
                bReject = utils.checkTileActions(oConfigurationView);
            }
            if (bReject) {
                oDeferred.reject("mandatory_fields_missing");
                return oDeferred.promise();
            }
            // overwrite target URL in case of semantic object navigation
            if (configToSave.navigation_use_semantic_object) {
                configToSave.navigation_target_url = utils.getSemanticNavigationUrl(configToSave);
                oModel.setProperty("/config/navigation_target_url", configToSave.navigation_target_url);
            }

            // use bag contract in order to store translatable properties
            var tilePropertiesBag = oTileApi.bag.getBag("tileProperties");
            tilePropertiesBag.setText("display_title_text", oModel.getProperty("/config/display_title_text"));
            tilePropertiesBag.setText("display_subtitle_text", oModel.getProperty("/config/display_subtitle_text"));
            tilePropertiesBag.setText("display_info_text", oModel.getProperty("/config/display_info_text"));
            tilePropertiesBag.setText("display_search_keywords", configToSave.display_search_keywords);

            var tileNavigationActionsBag = oTileApi.bag.getBag("tileNavigationActions");
            //forward populating of tile navigation actions array into the bag, to Utils
            utils.populateTileNavigationActionsBag(tileNavigationActionsBag, aTileNavigationActions);

            function logErrorAndReject (oError, oErrorInfo) {
                Log.error(oError, null, COMPONENT_NAME);
                oDeferred.reject(oError, oErrorInfo);
            }

            // use configuration contract to write parameter values
            oTileApi.writeConfiguration.setParameterValues(
                { tileConfiguration: JSON.stringify(configToSave) },
                // success handler
                function () {
                    var oConfigurationConfig = utils.getAppLauncherConfig(oTileApi, false, false);
                    // get tile config data in admin mode
                    var oTileConfig = utils.getAppLauncherConfig(oTileApi, true, false);
                    // switching the model under the tile -> keep the tile model
                    var oModel = new JSONModel({
                        config: oConfigurationConfig,
                        // keep tile model
                        tileModel: oTileModel
                    });
                    oConfigurationView.setModel(oModel);

                    // update tile model
                    oTileModel.setData({ data: oTileConfig, nav: { navigation_target_url: "" } }, false);
                    if (oTileApi.preview) {
                        oTileApi.preview.setTargetUrl(oConfigurationConfig.navigation_target_url);
                        oTileApi.preview.setPreviewIcon(oConfigurationConfig.display_icon_url);
                        oTileApi.preview.setPreviewTitle(oConfigurationConfig.display_title_text);
                        if (oTileApi.preview.setPreviewSubtitle && typeof oTileApi.preview.setPreviewSubtitle === "function") {
                            oTileApi.preview.setPreviewSubtitle(oConfigurationConfig.display_subtitle_text);
                        }
                    }

                    tilePropertiesBag.save(
                        // success handler
                        function () {
                            Log.debug("property bag 'tileProperties' saved successfully");
                            // update possibly changed values via contracts
                            if (oTileApi.title) {
                                oTileApi.title.setTitle(
                                    oConfigurationConfig.display_title_text,
                                    // success handler
                                    function () {
                                        oDeferred.resolve();
                                    },
                                    logErrorAndReject // error handler
                                );
                            } else {
                                oDeferred.resolve();
                            }
                        },
                        logErrorAndReject // error handler
                    );

                    tileNavigationActionsBag.save(
                        // success handler
                        function () {
                            Log.debug("property bag 'navigationProperties' saved successfully");
                        },
                        logErrorAndReject // error handler
                    );
                },
                logErrorAndReject // error handler
            );

            return oDeferred.promise();
        },

        successHandlerFn: function (oResult) {
            var oView = this.getView();
            var oModel = oView.getModel();
            var oConfig = oModel.getProperty("/config");
            var sNavigationTargetUrl = oModel.getProperty("/config/navigation_target_url");
            var iRefreshInterval = oModel.getProperty("/config/service_refresh_interval");
            var sServiceUrl = oModel.getProperty("/config/service_url");
            var oViewData = oView.getViewData();
            var oTileApi = oViewData.chip;
            var sSystem = oTileApi.url.getApplicationSystem();

            if (oViewData.properties && oViewData.properties.info) {
                if (typeof oResult === "object") {
                    oResult.info = oViewData.properties.info;
                }
            }

            var oDataToDisplay = utils.getDataToDisplay(oConfig, oResult);

            // set data to display
            oModel.setProperty("/data", oDataToDisplay);

            // Update this.navigationTargetUrl in case that oConfig.navigation_target_url was changed
            // BCP Incident: 1670570695
            if (this.sConfigNavigationTargetUrlOld !== sNavigationTargetUrl) {
                this.navigationTargetUrl = this.constructTargetUrlWithSapSystem(sNavigationTargetUrl, sSystem);
                this.sConfigNavigationTargetUrlOld = this.navigationTargetUrl;
            }

            // rewrite target URL
            oModel.setProperty("/nav/navigation_target_url", utils.addParamsToUrl(
                this.navigationTargetUrl,
                oDataToDisplay
            ));

            if (iRefreshInterval > 0) {
                iRefreshInterval = Math.max(iRefreshInterval, this.REFRESH_INTERVAL_MIN);

                Log.info("Wait " + iRefreshInterval + " seconds before calling " + sServiceUrl + " again", null, COMPONENT_NAME);
                this.refeshAfterInterval(iRefreshInterval);
            }
        },

        // error handler
        errorHandlerFn: function (oMessage, bIsWarning) {
            var oView = this.getView();
            var oModel = oView.getModel();
            var sServiceUrl = oModel.getProperty("/config/service_url");
            var sMessage = oMessage && oMessage.message ? oMessage.message : oMessage;

            if (oMessage.statusText === "Abort" || oMessage.aborted === true) {
                Log.info("Data request from service " + sServiceUrl + " was aborted", null, COMPONENT_NAME);
            } else {
                if (oMessage.response) {
                    sMessage += " - " + oMessage.response.statusCode + " "
                        + oMessage.response.statusText;
                }
                var fnLogFunction = bIsWarning ? Log.warning : Log.error;

                // Display error in English only
                fnLogFunction("Failed to update data via service\n service URL: " + sServiceUrl + "\n " + sMessage, null, COMPONENT_NAME);

                this._setTileIntoErrorState();
            }
        },

        _setTileIntoErrorState: function () {
            var oResourceBundle = utils.getResourceBundleModel().getResourceBundle();
            var oModel = this.getView().getModel();
            var oConfig = oModel.getProperty("/config");

            oModel.setProperty("/data",
                utils.getDataToDisplay(oConfig, {
                    number: "???",
                    info: oResourceBundle.getText("dynamic_data.error"),
                    infoState: "Critical"
                })
            );
        },

        // configuration cancel handler
        onCancelConfiguration: function (oConfigurationView/*, successHandler, errorHandle*/) {
            // reload old configuration and display
            var oViewData = oConfigurationView.getViewData();
            var oModel = oConfigurationView.getModel();
            // tile model placed into configuration model by getConfigurationUi
            var oTileModel = oModel.getProperty("/tileModel");
            var oTileApi = oViewData.chip;
            var oCurrentConfig = utils.getAppLauncherConfig(oTileApi, false, false);

            oModel.setData({ config: oCurrentConfig, tileModel: oTileModel }, false);
        },

        loadData: function () {
            var oView = this.getView();
            var oTileApi = oView.getViewData().chip;
            var oModel = oView.getModel();
            var sUrl = oModel.getProperty("/config/service_url");

            if (/;o=([;/?]|$)/.test(sUrl)) { // URL has placeholder segment parameter ;o=
                sUrl = oTileApi.url.addSystemToServiceUrl(sUrl);
            }

            if (!sUrl) {
                Log.error("No service URL given!", COMPONENT_NAME);
                this._setTileIntoErrorState();
                return;
            }

            // keep request until url changes
            if (!this.oDataRequest || this.oDataRequest.sUrl !== sUrl) {
                if (this.oDataRequest) {
                    this.oDataRequest.destroy();
                }
                this.sRequestUrl = sUrl;
                var oOptions = {
                    dataSource: oModel.getProperty("/config/data_source")
                };
                this.oDataRequest = new DynamicTileRequest(sUrl, this.successHandlerFn.bind(this), this.errorHandlerFn.bind(this), "", oOptions);
            } else if (this.oDataRequest) {
                this.oDataRequest.refresh();
            }
        },

        refreshTile: function () {
            var oView = this.getView();
            var oViewData = oView.getViewData();
            var isVisible = oViewData.chip.visible.isVisible();
            if (isVisible && this.bNeedsRefresh) {
                this.bNeedsRefresh = false;
                this.loadData();
            }
        },

        refeshAfterInterval: function (iRefreshInterval) {
            this.iNrOfTimerRunning++;
            this.timer = window.setTimeout(function () {
                this.iNrOfTimerRunning--;
                if (this.iNrOfTimerRunning === 0) {
                    this.bNeedsRefresh = true;
                    this.refreshTile();
                }
            }.bind(this), ushellUtils.sanitizeTimeoutDelay(iRefreshInterval * 1000));
        },

        refreshHandler: function () {
            this.bNeedsRefresh = true;
            this.refreshTile();
        },

        visibleHandler: function (isVisible) {
            if (isVisible) {
                this.refreshTile();
            } else {
                this.stopRequests();
            }
        },

        formatters: {
            leanURL: WindowUtils.getLeanURL.bind(WindowUtils)
        }
    });
});
