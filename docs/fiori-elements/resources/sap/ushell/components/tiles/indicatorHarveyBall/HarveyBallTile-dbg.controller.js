// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Harvey Ball Tile
 * This SAP Smart Business module is only used for SAP Business Suite hub deployments.
 *
 * @deprecated since 1.96
 */
sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/suite/ui/commons/library"
    // "sap/ushell/components/tiles/indicatorTileUtils/cache" // do not migrate
], function (
    JSONModel,
    commonsLibrary
    // cache // do not migrate
) {
    "use strict";

    // shortcut for sap.suite.ui.commons.InfoTileValueColor
    var InfoTileValueColor = commonsLibrary.InfoTileValueColor;

    // shortcut for sap.suite.ui.commons.InfoTileSize
    var InfoTileSize = commonsLibrary.InfoTileSize;

    // shortcut for sap.suite.ui.commons.LoadState
    var LoadState = commonsLibrary.LoadState;

    /* eslint-disable block-scoped-var */ // TODO: remove eslint-disable

    sap.ui.controller("tiles.indicatorHarveyBall.HarveyBallTile", {
        onInit: function () {
            this.getView().setModel(new JSONModel());
            this.initializeVariables();
            this.attachHandlers();
            this.getVariable("tile").setState(LoadState.Loading);
            this.readChipConfiguration();
        },
        attachHandlers: function () {
            var that = this;
            var oChip = this.getVariable("chip");
            if (oChip.visible) {
                oChip.visible.attachVisible(function (bVisible) {
                    if (bVisible) {
                        that.onVisible();
                    } else {
                        that.abortAllOpenODataRequests();
                    }
                });
            }
            this.getVariable("tile").attachPress(function () {
                that.abortAllOpenODataRequests();
                var indicatorUtils = that.getVariable("indicatorUtils");
                that.getVariable("cache").setKpivalueById(that.getVariable("chipId"), null);
                window.location.hash = indicatorUtils.getNavigationTarget(that.getVariable("evalData"), that.getVariable("system"));
            });
        },
        initializeVariables: function () {
            this._variables = {};
            this._oDataRequests = {};
            var oView = this.getView();
            var oViewData = oView.getViewData();
            var oTile = oView.oTile;
            var oChip = oViewData.chip;
            this.setVariable("indicatorUtils", sap.ushell.components.tiles.indicatorTileUtils.util);
            this.setVariable("cache", sap.ushell.components.tiles.indicatorTileUtils.cache);
            this.setVariable("hasAppeared", false);
            this.setVariable("chip", oChip);
            this.setVariable("tile", oTile);
            this.setVariable("tileControl", oTile.getTileContent()[0].getContent());
            this.setVariable("configurationString", oChip.configuration.getParameterValueAsString("tileConfiguration"));
            this.setVariable("system", oChip.url.getApplicationSystem());
        },
        getVariable: function (sKey) {
            return this._variables[sKey];
        },
        setVariable: function (sKey, oVal) {
            this._variables[sKey] = oVal;
        },
        readChipConfiguration: function () {
            var that = this;
            var oChip = this.getVariable("chip");
            var utils = this.getVariable("indicatorUtils");
            utils.getParsedChip(this.getVariable("configurationString"), function (evalData) {
                that.setVariable("evalData", evalData);
                that.setVariable("chipId", evalData.TILE_PROPERTIES.id);
                that.setVariable("tileProperties", evalData.TILE_PROPERTIES);
                if (oChip.preview) {
                    oChip.preview.setTargetUrl(utils.getNavigationTarget(evalData, that.getVariable("system")));
                    that.loadPreviewData();
                    if (oChip.preview.isEnabled()) {
                        that.getVariable("tile").setState(LoadState.Loaded);
                    } else {
                        that.loadActualData();
                    }
                }
            });
        },
        loadPreviewData: function () {
            var oTitle = this.getVariable("indicatorUtils").getTileTitleSubtitle(this.getVariable("chip"));
            this.getView().getModel().setData({
                fractionValue: 34,
                value: 100,
                size: InfoTileSize.Auto,
                frameType: "OneByOne",
                color: "Good",
                state: LoadState.Loading,
                header: oTitle.title || this.getVariable("indicatorUtils").getChipTitle(this.getVariable("evalData")),
                subheader: oTitle.subTitle || this.getVariable("indicatorUtils").getChipSubTitle(this.getVariable("evalData"))
            });
        },
        loadActualData: function () {
            if (Number(this.getVariable("chip").configuration.getParameterValueAsString("isSufficient"))) {
                this.getVariable("cache").setEvaluationById(this.getVariable("chipId"), this.getVariable("evalData"));
                this.onEvalFiltersFetched();
            } else {
                this.fetchEvalFilters(this.onEvalFiltersFetched);
            }
        },
        registerOpenODataRequest: function (sKey, oRequest) {
            this._oDataRequests[sKey] = oRequest;
        },
        deregisterOpenODataRequest: function (sKey) {
            delete this._oDataRequests[sKey];
        },
        abortAllOpenODataRequests: function () {
            for (var each in this._oDataRequests) {
                try {
                    this.getVariable("indicatorUtils").abortPendingODataCalls(this._oDataRequests[each]);
                    delete this._oDataRequests[each];
                } catch (e) {
                    //do nothing on exception
                }
            }
        },
        fetchKpiValue: function (oParam) {
            function makeODataRequest (oModel, sUri, oConfig, fnS, fnE) {
                var oDataRef = oModel.read(sUri, null, null, true, function (data) {
                    that.deregisterOpenODataRequest(oConfig.type);
                    if (data && data.results && data.results.length) {
                        try {
                            if (oConfig.thresholds && oConfig.thresholds.length) {
                                that._setThresholdValues(data.results[0]);
                            }
                            kpiData[oConfig.type] = data.results[0][oConfig.measure];
                            kpiData.unit = kpiData.unit || data.results[0][oConfig.unit] || "";
                            if (--semaphore == 0) { // when both the requests are successfully served
                                that.getVariable("cache").setKpivalueById(that.getVariable("chipId"), kpiData);
                                fnS.call(that, kpiData);
                            }
                        } catch (e) {
                            that.logError(e);
                        }
                    } else {
                        fnE.call(that, "no data");
                    }
                }, function (e) {
                    that.deregisterOpenODataRequest(oConfig.type);
                    if (e && e.response) {
                        fnE.call(that, e.message);
                    }
                });
                that.registerOpenODataRequest(oConfig.type, oDataRef);
            }

            var that = this;
            var indicatorUtils = this.getVariable("indicatorUtils");
            var cachedValue = this.getVariable("cache").getKpivalueById(this.getVariable("chipId"));
            if (cachedValue) {
                oParam.fnS.call(that, cachedValue);
            } else {
                var sMeasure1 = oParam.measure1, sMeasure2 = oParam.measure2;
                var sUri = oParam.url, sEntitySet = oParam.entitySet;
                var variantFilters = oParam.filters;
                var fractionValueFilters = oParam.fractionFilters.concat(variantFilters);
                var oQuery1, oQuery2;
                var unitColumn1, unitColumn2, kpiData;
                var semaphore = 2;//to keep track of race around condition
                fractionValueFilters.forEach(function (cur) { // this code written only for now. to handler the exception thrown by prepareQueryServiceUri
                    cur.value = cur.value + ""; // it assumes everyting is string and tries to call split
                    cur.valueTo = cur.valueTo + "";
                });
                if (oParam.thresholds && oParam.thresholds.length) {
                    oQuery1 = indicatorUtils.prepareQueryServiceUri(this.getVariable("chip").url.addSystemToServiceUrl(sUri), sEntitySet, sMeasure1 + "," + oParam.thresholds, null, variantFilters);
                } else {
                    oQuery1 = indicatorUtils.prepareQueryServiceUri(this.getVariable("chip").url.addSystemToServiceUrl(sUri), sEntitySet, sMeasure1, null, variantFilters);
                }
                oQuery2 = indicatorUtils.prepareQueryServiceUri(this.getVariable("chip").url.addSystemToServiceUrl(sUri), sEntitySet, sMeasure2, null, fractionValueFilters);
                unitColumn1 = oQuery1.unit[0];
                unitColumn2 = oQuery2.unit[0];
                kpiData = {
                    kpiValue: null,
                    fractionValue: null,
                    unit: ""
                };
                if (oQuery1) {
                    makeODataRequest(oQuery1.model, oQuery1.uri, {
                        measure: sMeasure1,
                        type: "kpiValue",
                        unit: unitColumn1,
                        thresholds: oParam.thresholds
                    }, oParam.fnS, oParam.fnE);
                }
                if (oQuery2) {
                    makeODataRequest(oQuery2.model, oQuery2.uri, {
                        measure: sMeasure2,
                        type: "fractionValue",
                        unit: unitColumn2
                    }, oParam.fnS, oParam.fnE);
                }
                if (!(oQuery1 && oQuery2)) {
                    oParam.fnE.call(that, "Error Preparing Query Service URI");
                }
            }
        },
        _setThresholdValues: function (data) {
            var oThreshold = this.getVariable("oThreshold"),
                each;
            if (oThreshold) {
                if (this.getVariable("evalData").EVALUATION.VALUES_SOURCE == "RELATIVE") {
                    if (oThreshold.TA.COLUMN_NAME) { // only if target threshold is a measure column
                        oThreshold.TA.VALUE = parseFloat(data[oThreshold.TA.COLUMN_NAME]);
                        for (each in oThreshold) {
                            if (!oThreshold[each].COLUMN_NAME) {
                                oThreshold[each].VALUE = oThreshold.TA.VALUE * oThreshold[each].VALUE / 100;
                            }
                        }
                    }
                } else {
                    for (each in oThreshold) {
                        if (oThreshold[each].COLUMN_NAME) {
                            oThreshold[each].VALUE = parseFloat(data[oThreshold[each].COLUMN_NAME]);
                        }
                    }
                }
            } this.setVariable("oThreshold", oThreshold);
        },
        getThresholdObject: function () {
            var oThreshold = this.getVariable("oThreshold");
            if (!oThreshold) {
                var aThresholds = this.getVariable("evalData").EVALUATION_VALUES;
                oThreshold = {};
                for (var i = 0, l = aThresholds.length; i < l; i++) {
                    oThreshold[aThresholds[i].TYPE] = {
                        VALUE: parseFloat(aThresholds[i].FIXED),
                        COLUMN_NAME: aThresholds[i].COLUMN_NAME
                    };
                }
                this.setVariable("oThreshold", oThreshold);
            }
            return oThreshold;
        },
        hasSomeValue: function () {
            var flag = true;
            if (arguments.length) {
                for (var i = 0, l = arguments.length; i < l; i++) {
                    if (!(arguments[i] || arguments[i] == "0")) {
                        flag = false;
                        break;
                    }
                }
            } else {
                flag = false;
            }
            return flag;
        },
        getTrendColor: function (kpiValue) {
            var color = "Neutral";
            var oThreshold, goalType, WL, WH, CL, CH;
            if (this.getVariable("tileProperties").isFractionMeasure) {
                oThreshold = this.getThresholdObject();
                goalType = this.getVariable("evalData").EVALUATION.GOAL_TYPE;

                if (goalType == "MA") {
                    WL = oThreshold.WL;
                    CL = oThreshold.CL;
                    if (this.hasSomeValue(WL, CL)) {
                        color = "Good";
                        if (kpiValue < CL.VALUE) {
                            color = "Error";
                        } else if (kpiValue <= WL.VALUE) {
                            color = "Critical";
                        }
                    }
                } else if (goalType == "MI") {
                    WH = oThreshold.WH;
                    CH = oThreshold.CH;
                    if (this.hasSomeValue(WH, CH)) {
                        color = "Error";
                        if (kpiValue < WH.VALUE) {
                            color = "Good";
                        } else if (kpiValue <= CH.VALUE) {
                            color = "Critical";
                        }
                    }
                } else {
                    WL = oThreshold.WL;
                    CL = oThreshold.CL;
                    WH = oThreshold.WH;
                    CH = oThreshold.CH;
                    if (this.hasSomeValue(WH, CH, CL, WL)) {
                        if (kpiValue <= CL.VALUE || kpiValue >= WH.VALUE) {
                            color = "Error";
                        } else if ((WL.VALUE >= kpiValue && kpiValue >= CL.VALUE) || (CH.VALUE >= kpiValue && kpiValue >= WH.VALUE)) {
                            color = "Critical";
                        } else {
                            color = "Good";
                        }
                    }
                }
            } return InfoTileValueColor[color];
        },
        _getThresholdMeasures: function () {
            var aThresholds = [];
            var oThreshold = this.getThresholdObject();
            for (var each in oThreshold) {
                if (oThreshold[each].COLUMN_NAME) {
                    aThresholds.push(oThreshold[each].COLUMN_NAME);
                }
            } return aThresholds;
        },
        onEvalFiltersFetched: function () {
            var that = this;
            if (this.getVariable("chip").visible.isVisible() && !this.getVariable("hasAppeared")) {
                try {
                    var kpiDefinition = this.getVariable("evalData");
                    var sUri = kpiDefinition.EVALUATION.ODATA_URL;
                    var sEntitySet = kpiDefinition.EVALUATION.ODATA_ENTITYSET;
                    var tileProperties = this.getVariable("tileProperties");
                    var harveyFilters = [];
                    var variantFilters = this.getVariable("indicatorUtils").prepareFilterStructure(kpiDefinition.EVALUATION_FILTERS, kpiDefinition.ADDITIONAL_FILTERS);
                    var fractionMeasure = kpiDefinition.EVALUATION.COLUMN_NAME;
                    var totalMeasure = fractionMeasure;
                    var thresholdMeasures = [];
                    if (tileProperties.isFractionMeasure) {
                        totalMeasure = tileProperties.harveyTotalMeasure;
                        thresholdMeasures = this._getThresholdMeasures();
                    } else {
                        harveyFilters = this.getVariable("indicatorUtils").prepareFilterStructure(tileProperties.harveyFilters || harveyFilters);
                    }
                    this.setVariable("totalMeasure", totalMeasure);
                    this.setVariable("fractionMeasure", fractionMeasure);
                    this.fetchKpiValue({
                        measure1: totalMeasure,
                        measure2: fractionMeasure,
                        entitySet: sEntitySet,
                        thresholds: thresholdMeasures,
                        url: sUri,
                        filters: variantFilters,
                        fractionFilters: harveyFilters,
                        fnS: function (kpiData) {
                            kpiData.kpiValue = Number(kpiData.kpiValue);
                            kpiData.fractionValue = Number(kpiData.fractionValue);
                            that.setVariable("kpiValue", kpiData.kpiValue);
                            that.setVariable("fractionValue", kpiData.fractionValue);
                            that.onKpiValueFetched(kpiData.kpiValue, kpiData.unit, kpiData.fractionValue);
                        },
                        fnE: this.logError
                    });
                    that.setVariable("hasAppeared", true);
                } catch (e) {
                    this.logError(e);
                }
            }
        },
        fetchEvalFilters: function (fnS) {
            var that = this;
            try {
                var evaluationData = this.getVariable("cache").getEvaluationById(this.getVariable("chipId"));
                if (evaluationData) {
                    this.getVariable("evalData").EVALUATION_FILTERS = evaluationData.EVALUATION_FILTERS;
                    fnS();
                } else {
                    var oDataRef = this.getVariable("indicatorUtils").getFilterFromRunTimeService(this.getVariable("evalData"), function (filter) {
                        that.deregisterOpenODataRequest("kpiFilterRequest");
                        that.getVariable("evalData").EVALUATION_FILTERS = filter;
                        that.getVariable("cache").setEvaluationById(that.getVariable("chipId"), that.getVariable("evalData"));
                        fnS.call(that);
                    }, function (e) {
                        this.logError(e);
                        that.deregisterOpenODataRequest("kpiFilterRequest");
                    });

                    this.registerOpenODataRequest("kpiFilterRequest", oDataRef);
                }
            } catch (e) {
                this.logError(e);
            }
        },
        onKpiValueFetched: function (kpiValue, kpiValueUnit, fractionValue, fractionValueUnit) {
            var indicatorUtil = this.getVariable("indicatorUtils");
            var scaledKpiValue = kpiValue;
            var scaledFractionValue = fractionValue;
            var evalData = this.getVariable("evalData");
            var scalingFactor = evalData.EVALUATION.SCALING;
            if (scalingFactor == -2) {
                scaledKpiValue *= 100;
                scaledFractionValue *= 100;
            }
            var c = this.isACurrencyMeasure(this.getVariable("totalMeasure"));
            scaledKpiValue = indicatorUtil.getLocaleFormattedValue(Number(scaledKpiValue), scalingFactor, null, c, kpiValueUnit);
            c = this.isACurrencyMeasure(this.getVariable("fractionMeasure"));
            scaledFractionValue = indicatorUtil.getLocaleFormattedValue(Number(scaledFractionValue), scalingFactor, null, c, kpiValueUnit);

            this.getView().getModel().setProperty("/totalLabel", scaledKpiValue + " " + kpiValueUnit);
            this.getView().getModel().setProperty("/fractionLabel", scaledFractionValue + " " + fractionValueUnit);
            this.getView().getModel().setProperty("/color", this.getTrendColor(fractionValue));
            this.getView().getModel().setProperty("/value", kpiValue);
            this.getView().getModel().setProperty("/fractionValue", fractionValue);

            var navTarget = indicatorUtil.getNavigationTarget(this.getVariable("evalData"), this.getVariable("system"));
            this.getVariable("tile").$().wrap("<a href ='" + navTarget + "'></a>");
            this.getVariable("tile").setState(LoadState.Loaded);
        },
        logError: function (err) {
            this.getVariable("tile").setState(LoadState.Failed);
            this.getVariable("indicatorUtils").logError(err, this.getVariable("tile"));
        },
        onVisible: function () {
            if (!this.getVariable("hasAppeared")) {
                if (Number(this.getVariable("chip").configuration.getParameterValueAsString("isSufficient"))) {
                    this.onEvalFiltersFetched();
                } else {
                    this.fetchEvalFilters(this.onEvalFiltersFetched);
                }
            }
        },
        onExit: function () {
            this.abortAllOpenODataRequests();
        }
    });
});
