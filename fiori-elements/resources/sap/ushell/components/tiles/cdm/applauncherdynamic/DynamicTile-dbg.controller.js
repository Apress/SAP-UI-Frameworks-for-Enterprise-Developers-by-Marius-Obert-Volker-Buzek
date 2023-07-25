// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ushell/components/tiles/utils",
    "sap/ui/core/format/NumberFormat",
    "sap/ushell/Config",
    "sap/ushell/utils/WindowUtils",
    "sap/ui/model/json/JSONModel",
    "sap/m/library",
    "sap/ushell/library",
    "sap/base/Log",
    "sap/base/util/merge",
    "sap/ushell/utils/DynamicTileRequest",
    "sap/ushell/utils",
    "sap/ushell/utils/UrlParsing"
], function (
    Controller,
    utils,
    NumberFormat,
    Config,
    WindowUtils,
    JSONModel,
    mobileLibrary,
    ushellLibrary,
    Log,
    merge,
    DynamicTileRequest,
    ushellUtils,
    UrlParsing
) {
    "use strict";

    // shortcut for sap.m.GenericTileScope
    var GenericTileScope = mobileLibrary.GenericTileScope;

    // shortcut for sap.m.DeviationIndicator
    var DeviationIndicator = mobileLibrary.DeviationIndicator;

    // shortcut for sap.m.ValueColor
    var ValueColor = mobileLibrary.ValueColor;

    // shortcut for sap.m.FrameType
    var FrameType = mobileLibrary.FrameType;

    // shortcut for sap.ushell.DisplayFormat
    var DisplayFormat = ushellLibrary.DisplayFormat;

    // shortcut for sap.ushell.AppType
    var AppType = ushellLibrary.AppType;

    var COMPONENT_NAME = "sap.ushell.components.tiles.cdm.applauncherdynamic.DynamicTile";

    var RESET_STRING = "<RESET>";

    var DEFAULT_VALUES = {
        title: "",
        subtitle: "",
        icon: "",
        info: "",
        infoState: ValueColor.Neutral,
        targetURL: "",
        number_value: "...",
        number_unit: "",
        number_factor: "",
        number_state_arrow: DeviationIndicator.None,
        number_value_state: ValueColor.Neutral
    };

    /* global hasher */

    return Controller.extend(COMPONENT_NAME, {
        _aDoables: [],

        // handle to control/cancel browser's setTimeout()
        timer: null,
        // timestamp of the last regular setTimeout started
        iLastTimeoutStart: 0,
        // handle to control/cancel request
        oDataRequest: null,
        // Whether this tile has defined a interval=0 and a request was already sent
        // This prevents tiles to request again when leaving the tab and navigating back
        bShouldNotRefreshDataAfterInit: false,

        /**
         * Calculates the model data, based on the viewData and defaults
         * @param {object} oViewData The viewData provided by the component
         * @returns {object} The formatted model data
         *
         * @private
         */
        _getConfiguration: function (oViewData) {
            var oConfig = {};
            var oHash;

            oConfig.configuration = oViewData.configuration;
            oConfig.properties = oViewData.properties;

            // a special handling for info, as by the configuration we should not get info anymore.
            // nevertheless - it is used by the dynamic-data response. So we must initialize it to be empty string
            // in case it is not supplied.
            oConfig.properties.info = oConfig.properties.info || DEFAULT_VALUES.info;

            oConfig.properties.number_value = DEFAULT_VALUES.number_value;
            oConfig.properties.number_value_state = DEFAULT_VALUES.number_value_state;
            oConfig.properties.number_state_arrow = DEFAULT_VALUES.number_state_arrow;
            oConfig.properties.number_factor = DEFAULT_VALUES.number_factor;
            oConfig.properties.number_unit = oConfig.properties.numberUnit || DEFAULT_VALUES.number_unit;

            // adding sap-system
            var sSystem = oConfig.configuration["sap-system"];
            var sTargetURL = oConfig.properties.targetURL;
            if (sTargetURL && sSystem) {
                // when the navigation url is hash we want to make sure system parameter is in the parameters part
                if (UrlParsing.isIntentUrl(sTargetURL)) {
                    oHash = UrlParsing.parseShellHash(sTargetURL);
                    if (!oHash.params) {
                        oHash.params = {};
                    }
                    oHash.params["sap-system"] = sSystem;
                    sTargetURL = "#" + UrlParsing.constructShellHash(oHash);
                } else {
                    sTargetURL += ((sTargetURL.indexOf("?") < 0) ? "?" : "&")
                        + "sap-system=" + sSystem;
                }
                oConfig.properties.targetURL = sTargetURL;
            }

            oConfig.properties.sizeBehavior = Config.last("/core/home/sizeBehavior");
            oConfig.properties.wrappingType = Config.last("/core/home/wrappingType");

            switch (oConfig.properties.displayFormat) {
                case DisplayFormat.Flat:
                    oConfig.properties.frameType = FrameType.OneByHalf;
                    break;
                case DisplayFormat.FlatWide:
                    oConfig.properties.frameType = FrameType.TwoByHalf;
                    break;
                case DisplayFormat.StandardWide:
                    oConfig.properties.frameType = FrameType.TwoByOne;
                    break;
                default: {
                    oConfig.properties.frameType = FrameType.OneByOne;
                }
            }

            oConfig.originalProperties = merge({}, oViewData.properties);
            return oConfig;
        },

        onInit: function () {
            var oView = this.getView();
            var oModel = new JSONModel();
            var oViewData = oView.getViewData();
            var oViewDataProperties = oViewData.properties;
            oModel.setData(this._getConfiguration(oViewData));

            var sContentProviderId = oViewDataProperties.contentProviderId;
            if (Config.last("/core/contentProviders/providerInfo/enabled")) {
                this.oSystemContextPromise = sap.ushell.Container.getServiceAsync("ClientSideTargetResolution")
                    .then(function (oCSTR) {
                        return oCSTR.getSystemContext(sContentProviderId);
                    })
                    .then(function (oSystemContext) {
                        oModel.setProperty("/properties/contentProviderLabel", oSystemContext.label);

                        if (Config.last("/core/contentProviders/providerInfo/userConfigurable")) {
                            oModel.setProperty("/properties/showContentProviderOnViz", true);
                        }
                    })
                    .catch(function (oError) {
                        Log.error("DynamicTile.controller threw an error:", oError);
                    });
            }

            // set model, add content
            oView.setModel(oModel);
            // listen for changes of the size behavior, as the end user can change it in the settings (if enabled)
            this._aDoables.push(Config.on("/core/home/sizeBehavior").do(function (sSizeBehavior) {
                oModel.setProperty("/properties/sizeBehavior", sSizeBehavior);
            }));

            // Do not retrieve data initially, wait until the visible handler is called
            // otherwise requests may be triggered which are canceled immediately again.
        },

        /**
         * loads data once if not in configuration mode regardless of the timer
         */
        refreshHandler: function () {
            this.loadData(0, true);
        },

        /**
         * Starts the timer if tile got visible
         * Stops the timer if tile got invisible
         * @param {boolean} isVisible Whether the tile is no visible
         */
        visibleHandler: function (isVisible) {
            if (isVisible) {
                if (!this.oDataRequest || this.timer === null) {
                    //tile is visible and data wasn't requested yet or was invisible before
                    this.initRequestInterval();
                }
            } else {
                this.stopRequests();
            }
        },

        /**
         * Sets the scope property to the model according to the value of "editable".
         *
         * @param {boolean} editable Indicating if edit mode should be active.
         */
        editModeHandler: function (editable) {
            var sScope = editable ? GenericTileScope.ActionMore : GenericTileScope.Display;
            this.getView().getModel().setProperty("/properties/scope", sScope);
        },

        /**
         * API called by the Component to update the static and current properties of the tile
         * @param {object} oNewProperties The new properties
         */
        updateVisualPropertiesHandler: function (oNewProperties) {
            // existing properties
            var oCurrentProperties = this.getView().getModel().getProperty("/properties");
            var oOriginalProperties = this.getView().getModel().getProperty("/originalProperties");

            // override relevant property
            if (ushellUtils.isDefined(oNewProperties.title)) {
                oCurrentProperties.title = oNewProperties.title;
                oOriginalProperties.title = oNewProperties.title;
            }

            if (ushellUtils.isDefined(oNewProperties.subtitle)) {
                oCurrentProperties.subtitle = oNewProperties.subtitle;
                oOriginalProperties.subtitle = oNewProperties.subtitle;
            }

            if (ushellUtils.isDefined(oNewProperties.icon)) {
                oCurrentProperties.icon = oNewProperties.icon;
                oOriginalProperties.icon = oNewProperties.icon;
            }

            if (ushellUtils.isDefined(oNewProperties.targetURL)) {
                oCurrentProperties.targetURL = oNewProperties.targetURL;
                oOriginalProperties.targetURL = oNewProperties.targetURL;
            }

            if (ushellUtils.isDefined(oNewProperties.info)) {
                oCurrentProperties.info = oNewProperties.info;
                oOriginalProperties.info = oNewProperties.info;
            }

            this.getView().getModel().refresh();
        },

        /**
         * Aborts all running requests and clears all running timeouts
         * @private
         */
        stopRequests: function () {
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            if (this.oDataRequest) {
                this.oDataRequest.abort();
            }
        },

        // trigger to show the configuration UI if the tile is pressed in Admin mode
        onPress: function (oEvent) {
            if (oEvent.getSource().getScope && oEvent.getSource().getScope() === GenericTileScope.Display) {
                var sTargetURL = this.getView().getModel().getProperty("/properties/targetURL");
                var sTitle = this.getView().getModel().getProperty("/properties/title");
                if (!sTargetURL) {
                    return;
                } else if (sTargetURL[0] === "#") {
                    hasher.setHash(sTargetURL);
                } else {
                    // add theURL to recent activity log
                    var bLogRecentActivity = Config.last("/core/shell/enableRecentActivity") && Config.last("/core/shell/enableRecentActivityLogging");
                    if (bLogRecentActivity) {
                        var oRecentEntry = {
                            title: sTitle,
                            appType: AppType.URL,
                            url: sTargetURL,
                            appId: sTargetURL
                        };
                        sap.ushell.Container.getRenderer("fiori2").logRecentActivity(oRecentEntry);
                    }

                    WindowUtils.openURL(sTargetURL, "_blank");
                }
            }
        },

        /**
         * Initializes the The interval by calling loadData with the sanitized refreshInterval
         * @private
         */
        initRequestInterval: function () {
            var oModel = this.getView().getModel();
            var iServiceRefreshInterval = oModel.getProperty("/configuration/serviceRefreshInterval");

            // default to refresh interval 0
            if (!iServiceRefreshInterval || iServiceRefreshInterval === "0") {
                iServiceRefreshInterval = 0;
                if (this.oDataRequest) {
                    // Tile is configured to not refresh its data after the initial fetch
                    // Since a request is already saved we can assume this has happened
                    this.bShouldNotRefreshDataAfterInit = true;
                }
            } else if (iServiceRefreshInterval < 10) {
                var sServiceUrl = oModel.getProperty("/configuration/serviceUrl");
                Log.warning(
                    "Refresh Interval " + iServiceRefreshInterval + " seconds for service URL " + sServiceUrl
                    + " is less than 10 seconds, which is not supported. Increased to 10 seconds automatically.",
                    null, COMPONENT_NAME
                );

                // interval of 10 seconds is the minimum allowed for cyclic dynamic data fetching
                // (value of 0 means that no timer is used, e.g. no cyclic fetching but only once).
                iServiceRefreshInterval = 10;
            }
            this.loadData(iServiceRefreshInterval, false);
        },

        /**
         * Creates the request object and triggers the loading of the data
         * @param {number} iServiceRefreshInterval The interval between the requests in seconds
         * @param {boolean} bForce Whether the data should be loaded regardless of the interval
         *
         * @private
         */
        loadData: function (iServiceRefreshInterval, bForce) {
            // Tile is configured (interval=0) to only fetch data once and never update
            if (!bForce && this.bShouldNotRefreshDataAfterInit) {
                return;
            }

            var oModel = this.getView().getModel();
            var sUrl = oModel.getProperty("/configuration/serviceUrl");

            if (!sUrl) {
                Log.error("No service URL given!", COMPONENT_NAME);
                this._setTileIntoErrorState();
                return;
            }

            // check whether a timer is running and the previous timeout is over already and wait for it if not
            var iDiff = (iServiceRefreshInterval * 1000) - (Date.now() - this.iLastTimeoutStart);
            if (!bForce && !this.timer && iDiff > 0) {
                Log.info("Started timeout to call " + sUrl + " again in " + Math.ceil(iDiff / 1000) + " seconds", null, COMPONENT_NAME);
                this.timer = setTimeout(this.loadData.bind(this, iServiceRefreshInterval, false), ushellUtils.sanitizeTimeoutDelay(iDiff));
                return;
            }

            // keep request until url changes
            if (!this.oDataRequest || this.oDataRequest.sUrl !== sUrl) {
                if (this.oDataRequest) {
                    this.oDataRequest.destroy();
                }

                var sContentProviderId = oModel.getProperty("/properties/contentProviderId");
                var oOptions = {
                    dataSource: oModel.getProperty("/properties/dataSource")
                };

                this.oDataRequest = new DynamicTileRequest(sUrl, this.successHandlerFn.bind(this), this.errorHandlerFn.bind(this), sContentProviderId, oOptions);
            } else if (this.oDataRequest) {
                this.oDataRequest.refresh();
            }

            // Initialize timeout
            if (iServiceRefreshInterval > 0) {
                Log.info("Started timeout to call " + sUrl + " again in " + iServiceRefreshInterval + " seconds", null, COMPONENT_NAME);
                this.iLastTimeoutStart = Date.now();
                this.timer = setTimeout(this.loadData.bind(this, iServiceRefreshInterval, false), ushellUtils.sanitizeTimeoutDelay(iServiceRefreshInterval * 1000));
            }
        },

        successHandlerFn: function (oResult) {
            // fetching a merged configuration which includes overrides from the dynamic data received
            this.updatePropertiesHandler(oResult);
        },

        // error handler
        errorHandlerFn: function (oMessage) {
            var sMessage = oMessage && oMessage.message ? oMessage.message : oMessage;
            var sUrl = this.getView().getModel().getProperty("/configuration/serviceUrl");

            if (oMessage.statusText === "Abort" || oMessage.aborted === true) {
                Log.info("Data request from service " + sUrl + " was aborted", null, COMPONENT_NAME);
                this.bShouldNotRefreshDataAfterInit = false;
            } else {
                if (oMessage.response) {
                    sMessage += " - " + oMessage.response.statusCode + " " + oMessage.response.statusText;
                }

                Log.error("Failed to update data via service " + sUrl + ": " + sMessage, null, COMPONENT_NAME);

                this._setTileIntoErrorState();
            }
        },

        _setTileIntoErrorState: function () {
            var oResourceBundle = utils.getResourceBundleModel().getResourceBundle();
            // update model
            this.updatePropertiesHandler({
                number: "???",
                info: oResourceBundle.getText("dynamic_data.error")
            });
        },

        _normalizeNumber: function (numValue, maxCharactersInDisplayNumber, numberFactor, iNumberDigits) {
            var number;

            if (isNaN(numValue)) {
                number = numValue;
            } else {
                var oNForm = NumberFormat.getFloatInstance({ maxFractionDigits: iNumberDigits });

                if (!numberFactor) {
                    var absNumValue = Math.abs(numValue);
                    if (absNumValue >= 1000000000) {
                        numberFactor = "B";
                        numValue /= 1000000000;
                    } else if (absNumValue >= 1000000) {
                        numberFactor = "M";
                        numValue /= 1000000;
                    } else if (absNumValue >= 1000) {
                        numberFactor = "K";
                        numValue /= 1000;
                    }
                }
                number = oNForm.format(numValue);
            }

            var displayNumber = number;
            //we have to crop numbers to prevent overflow
            var cLastAllowedChar = displayNumber[maxCharactersInDisplayNumber - 1];
            //if last character is '.' or ',', we need to crop it also
            maxCharactersInDisplayNumber -= (cLastAllowedChar === "." || cLastAllowedChar === ",") ? 1 : 0;
            displayNumber = displayNumber.substring(0, maxCharactersInDisplayNumber);

            return {
                displayNumber: displayNumber,
                numberFactor: numberFactor
            };
        },

        /**
         * Updates the tile properties with the new values from the service
         * The values for each request are kept separately and do not mix
         * In case a value was not set by the request it either defaults to
         * the initial static values or to proper defaults
         *
         * @param {object} oData Response from the the request
         *
         * @private
         */
        updatePropertiesHandler: function (oData) {
            var oOriginalProperties = this.getView().getModel().getProperty("/originalProperties");
            var oCurrentProperties = this.getView().getModel().getProperty("/properties");

            // when providing empty string or null the original (static) value is displayed
            // when excluding the property from the response the original (static) value is displayed
            // when providing the string the value is unset to a proper default

            var aPropertyMappings = [
                { dataField: "title", modelField: "title" },
                { dataField: "subtitle", modelField: "subtitle" },
                { dataField: "icon", modelField: "icon" },
                { dataField: "info", modelField: "info" },
                { dataField: "infoState", modelField: "infoState" },
                { dataField: "targetURL", modelField: "targetURL" },
                { dataField: "stateArrow", modelField: "number_state_arrow" },
                { dataField: "numberState", modelField: "number_value_state" },
                { dataField: "numberUnit", modelField: "number_unit" },
                { dataField: "numberFactor", modelField: "number_factor" }
            ];

            aPropertyMappings.forEach(function (oMapping) {
                var vValue = oData[oMapping.dataField];
                var bIsUndefined = !vValue;
                var vDefaultValue = DEFAULT_VALUES[oMapping.modelField];

                if (bIsUndefined) {
                    oCurrentProperties[oMapping.modelField] = oOriginalProperties[oMapping.modelField] || vDefaultValue;
                } else if (this._isResetValue(vValue)) {
                    oCurrentProperties[oMapping.modelField] = vDefaultValue;
                } else { // response defines a value
                    oCurrentProperties[oMapping.modelField] = vValue;
                }
            }.bind(this));

            oCurrentProperties.number_value = !isNaN(oData.number) ? oData.number : DEFAULT_VALUES.number_value;
            oCurrentProperties.number_digits = oData.numberDigits >= 0 ? oData.numberDigits : 4;

            // push target parameters to local array
            var aTargetURLParams = [];
            if (oData.targetParams) {
                aTargetURLParams.push(oData.targetParams);
            }

            // accumulate results field
            if (oData.results) {
                var sCurrentTargetParams;
                var oCurrentNumber;

                var nSum = 0;
                oData.results.forEach(function (oResult) {
                    oCurrentNumber = oResult.number || 0;
                    if (typeof oCurrentNumber === "string") {
                        oCurrentNumber = parseFloat(oCurrentNumber);
                    }
                    nSum += oCurrentNumber;
                    sCurrentTargetParams = oResult.targetParams;
                    if (sCurrentTargetParams) {
                        // push target parameters to local array
                        aTargetURLParams.push(sCurrentTargetParams);
                    }
                });
                oCurrentProperties.number_value = nSum;
            }

            // add target URL properties from local array to targetURL in case needed
            if (aTargetURLParams.length > 0) {
                var sConcatSymbol = oCurrentProperties.targetURL.indexOf("?") !== -1 ? "&" : "?";
                oCurrentProperties.targetURL += sConcatSymbol + aTargetURLParams.join("&");
            }

            if (!isNaN(oData.number)) {
                // in case number is string isNaN returns true, but we need either to trim() it as the redundant " "
                // such as in case of "579 " as a value (Bug), parsing it to float causes redundant '.' even where it should not
                if (typeof oData.number === "string") {
                    oData.number = oData.number.trim();
                }

                var bShouldProcessDigits = this._shouldProcessDigits(oData.number, oData.numberDigits);
                var maxCharactersInDisplayNumber = oCurrentProperties.icon ? 4 : 5;

                if (oData.number && oData.number.toString().length >= maxCharactersInDisplayNumber || bShouldProcessDigits) {
                    var oNormalizedNumberData = this._normalizeNumber(oData.number, maxCharactersInDisplayNumber, oData.numberFactor, oData.numberDigits);

                    oCurrentProperties.number_factor = oNormalizedNumberData.numberFactor;
                    oCurrentProperties.number_value = oNormalizedNumberData.displayNumber;
                } else {
                    var oNForm = NumberFormat.getFloatInstance({ maxFractionDigits: maxCharactersInDisplayNumber });

                    oCurrentProperties.number_value = oNForm.format(oData.number);
                }
            }

            oCurrentProperties.sizeBehavior = Config.last("/core/home/sizeBehavior");

            this.getView().getModel().refresh();
        },

        _shouldProcessDigits: function (sDisplayNumber, iDigitsToDisplay) {
            var nNumberOfDigits;

            sDisplayNumber = typeof (sDisplayNumber) !== "string" ? sDisplayNumber.toString() : sDisplayNumber;
            if (sDisplayNumber.indexOf(".") !== -1) {
                nNumberOfDigits = sDisplayNumber.split(".")[1].length;
                if (nNumberOfDigits > iDigitsToDisplay) {
                    return true;
                }
            }

            return false;
        },

        // Return lean url for the <a> tag of the Generic Tile
        _getLeanUrl: function (targetURL) {
            return WindowUtils.getLeanURL(targetURL);
        },

        /**
         * Formats the to be a valid enum value
         * @param {string} sColor A ValueColor
         * @returns {sap.m.ValueColor} The formatted ValueColor
         *
         * @since 1.108.0
         * @private
         */
        _formatValueColor: function (sColor) {
            // BCP: 1670054463
            if (sColor === "Positive") {
                return ValueColor.Good;
            }
            if (sColor === "Negative") {
                return ValueColor.Error;
            }

            return ValueColor[sColor] || ValueColor.Neutral;
        },

        /**
         * Formats the to be a valid enum value and replaces 'Neutral' with 'None'
         * @param {string} sValueState The ValueColor of the tile
         * @returns {sap.m.ValueColor} The formatted ValueColor
         *
         * @private
         */
        _getValueColor: function (sValueState) {
            var sColor = this._formatValueColor(sValueState);
            if (sColor === ValueColor.Neutral) {
                return ValueColor.None;
            }
            return sColor;
        },

        /**
         * Checks whether a value matches the static reset string
         * @param {*} vValue A value provided as response by the request
         * @returns {boolean} Whether the given value matches the static reset string
         *
         * @since 1.108.0
         * @private
         */
        _isResetValue: function (vValue) {
            if (typeof vValue !== "string") {
                return false;
            }

            return vValue === RESET_STRING;
        },

        // destroy handler stops requests
        onExit: function () {
            if (this.oDataRequest) {
                this.stopRequests();
                this.oDataRequest.destroy();
            }
            this._aDoables.forEach(function (oDoable) {
                oDoable.off();
            });
            this._aDoables = [];
        }
    });
}, /* bExport= */ true);
