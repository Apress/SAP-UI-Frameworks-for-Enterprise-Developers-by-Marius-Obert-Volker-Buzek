// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/* eslint-disable max-len */
/* eslint-disable complexity */

/**
 * @fileOverview Dual Contribution Tile
 * This SAP Smart Business module is only used for SAP Business Suite hub deployments.
 *
 * @deprecated since 1.96
 */
sap.ui.define([
    "sap/m/library",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log"
    // "sap/ushell/components/tiles/indicatorTileUtils/cache" // do not migrate
], function (
    mobileLibrary,
    jQuery,
    Log
    // cache // do not migrate
) {
    "use strict";

    // shortcut for sap.m.ValueColor
    var ValueColor = mobileLibrary.ValueColor;

    // shortcut for sap.m.Size
    var Size = mobileLibrary.Size;

    // shortcut for sap.m.DeviationIndicator
    var DeviationIndicator = mobileLibrary.DeviationIndicator;

    // shortcut for sap.m.LoadState
    var LoadState = mobileLibrary.LoadState;

    sap.ui.controller("tiles.indicatorDualContribution.DualContribution", {

        getTile: function () {
            return this.oDualContributionView.oGenericTile;
        },

        _updateTileModel: function (newData) {
            var modelData = this.getTile().getModel().getData();
            jQuery.extend(modelData, newData);
            this.getTile().getModel().setData(modelData);
            this.getTile().getModel().updateBindings();
        },

        setTitle: function () {
            var that = this;
            var titleObj = sap.ushell.components.tiles.indicatorTileUtils.util.getTileTitleSubtitle(this.oChip);
            this._updateTileModel({
                header: titleObj.title || sap.ushell.components.tiles.indicatorTileUtils.util.getChipTitle(that.oConfig),
                subheader: titleObj.subTitle || sap.ushell.components.tiles.indicatorTileUtils.util.getChipSubTitle(that.oConfig)
            });
        },

        formSelectStatement: function (object) {
            var tmpArray = Object.keys(object);
            var sFormedMeasure = "";
            for (var i = 0; i < tmpArray.length; i++) {
                if ((object[tmpArray[i]] !== undefined) && (object.fullyFormedMeasure)) {
                    sFormedMeasure += "," + object[tmpArray[i]];
                }
            } return sFormedMeasure;
        },

        logError: function (err) {
            this.oDualContributionView.oGenericTile.setState(LoadState.Failed);
            this.oDualContributionView.oGenericTile.setState(LoadState.Failed);
            sap.ushell.components.tiles.indicatorTileUtils.util.logError(err);
        },

        setThresholdValues: function () {
            var that = this;
            try {
                var oThresholdObject = {};
                oThresholdObject.fullyFormedMeasure = this.DEFINITION_DATA.EVALUATION.COLUMN_NAME;
                if (this.DEFINITION_DATA.EVALUATION.VALUES_SOURCE == "MEASURE") {
                    switch (this.DEFINITION_DATA.EVALUATION.GOAL_TYPE) {
                        case "MI":
                            oThresholdObject.sWarningHigh = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WH", "MEASURE");
                            oThresholdObject.sCriticalHigh = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CH", "MEASURE");
                            oThresholdObject.sTarget = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TA", "MEASURE");
                            oThresholdObject.sTrend = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TC", "MEASURE");
                            oThresholdObject.fullyFormedMeasure += that.formSelectStatement(oThresholdObject);
                            break;
                        case "MA":
                            oThresholdObject.sWarningLow = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WL", "MEASURE");
                            oThresholdObject.sCriticalLow = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CL", "MEASURE");
                            oThresholdObject.sTarget = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TA", "MEASURE");
                            oThresholdObject.sTrend = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TC", "MEASURE");
                            oThresholdObject.fullyFormedMeasure += that.formSelectStatement(oThresholdObject);
                            break;
                        case "RA":
                            oThresholdObject.sWarningHigh = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WH", "MEASURE");
                            oThresholdObject.sCriticalHigh = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CH", "MEASURE");
                            oThresholdObject.sTarget = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TA", "MEASURE");
                            oThresholdObject.sTrend = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TC", "MEASURE");
                            oThresholdObject.sWarningLow = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WL", "MEASURE");
                            oThresholdObject.sCriticalLow = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CL", "MEASURE");
                            oThresholdObject.fullyFormedMeasure += that.formSelectStatement(oThresholdObject);
                            break;
                    }
                } else {
                    oThresholdObject.criticalHighValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CH", "FIXED");
                    oThresholdObject.criticalLowValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CL", "FIXED");
                    oThresholdObject.warningHighValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WH", "FIXED");
                    oThresholdObject.warningLowValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WL", "FIXED");
                    oThresholdObject.targetValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TA", "FIXED");
                    oThresholdObject.trendValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TC", "FIXED");
                }
                return oThresholdObject;
            } catch (e) {
                that.logError(e);
            }
        },

        getTrendIndicator: function (trendValue, value) {
            var that = this;
            trendValue = Number(trendValue);
            try {
                var trendIndicator = DeviationIndicator.None;
                if (trendValue > value) {
                    trendIndicator = DeviationIndicator.Down;
                } else if (trendValue < value) {
                    trendIndicator = DeviationIndicator.Up;
                }
                return trendIndicator;
            } catch (e) {
                that.logError(e);
            }
        },

        _processDataForComparisonChart: function (data, measure, dimension) {
            var semanticMeasure = this.oConfig.TILE_PROPERTIES.semanticMeasure;
            var finalOutput = [];
            var tempVar;
            for (var i = 0; i < data.results.length; i++) {
                var eachData = data.results[i];
                var temp = {};
                try {
                    temp.title = eachData[dimension].toString();
                } catch (e) {
                    temp.title = "";
                }
                temp.value = Number(eachData[measure]);
                var calculatedValueForScaling = Number(eachData[measure]);
                if (this.oConfig.EVALUATION.SCALING == -2) {
                    calculatedValueForScaling *= 100;
                }
                tempVar = sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(calculatedValueForScaling, this.oConfig.EVALUATION.SCALING, this.oConfig.EVALUATION.DECIMAL_PRECISION);
                temp.displayValue = tempVar.toString();
                if (typeof semanticMeasure === "undefined") {
                    temp.color = "Neutral";
                } else if (this.oConfig.EVALUATION.GOAL_TYPE === "MA") {
                    if (temp.value > eachData[semanticMeasure]) {
                        temp.color = "Good";
                    } else {
                        temp.color = "Error";
                    }
                } else if (this.oConfig.EVALUATION.GOAL_TYPE === "MI") {
                    if (temp.value < eachData[semanticMeasure]) {
                        temp.color = "Good";
                    } else {
                        temp.color = "Error";
                    }
                } else {
                    temp.color = "Neutral";
                } finalOutput.push(temp);
            }
            return finalOutput;
        },

        fetchKpiValue: function (fnSuccess, fnError) {
            var that = this;

            try {
                /* Preparing arguments for the prepareQueryServiceUri function */
                var sUri = this.oConfig.EVALUATION.ODATA_URL,
                    entitySet = this.oConfig.EVALUATION.ODATA_ENTITYSET,
                    measure;
                if (this.oConfig.TILE_PROPERTIES.semanticMeasure) {
                    /*
                     * Semantic Measure Inclusion (for Future use)
                     * var measure = [];
                     * measure.push(this.oConfig.EVALUATION.COLUMN_NAME);
                     * measure.push(this.oConfig.TILE_PROPERTIES.semanticMeasure);
                     * */
                    measure = this.oConfig.EVALUATION.COLUMN_NAME + "," + this.oConfig.TILE_PROPERTIES.semanticMeasure;
                } else {
                    measure = this.oConfig.EVALUATION.COLUMN_NAME;
                }
                var dimension = this.oConfig.TILE_PROPERTIES.dimension;
                var data = this.oConfig.EVALUATION_VALUES;
                var cachedValue = sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(that.oConfig.TILE_PROPERTIES.id);
                if (!cachedValue) {
                    var variants = sap.ushell.components.tiles.indicatorTileUtils.util.prepareFilterStructure(this.oConfig.EVALUATION_FILTERS, this.oConfig.ADDITIONAL_FILTERS);
                    var orderByObject = {};
                    orderByObject["0"] = measure + ",asc";
                    orderByObject["1"] = measure + ",desc";
                    orderByObject["2"] = dimension + ",asc";
                    orderByObject["3"] = dimension + ",desc";
                    var orderByElement = orderByObject[this.oConfig.TILE_PROPERTIES.sortOrder || "0"].split(",");
                    var finalQuery = sap.ushell.components.tiles.indicatorTileUtils.util.prepareQueryServiceUri(that.oChip.url.addSystemToServiceUrl(sUri), entitySet, measure, dimension, variants, 3);
                    if (this.oConfig.TILE_PROPERTIES.semanticMeasure) {
                        finalQuery.uri += "&$top=3&$orderby=" + orderByElement[0] + " " + orderByElement[2];
                    } else {
                        finalQuery.uri += "&$top=3&$orderby=" + orderByElement[0] + " " + orderByElement[1];
                    }

                    this.comparisionChartODataRef = finalQuery.model.read(finalQuery.uri, null, null, true, function (data) {
                        if (finalQuery.unit[0]) {
                            that._updateTileModel({
                                unitContribution: data.results[0][finalQuery.unit[0].name]
                            });
                            that.writeData.unitContribution = finalQuery.unit[0];
                            that.writeData.unitContribution.name = finalQuery.unit[0].name;
                        }

                        if (data && data.results && data.results.length) {
                            dimension = sap.ushell.components.tiles.indicatorTileUtils.util.findTextPropertyForDimension(that.oChip.url.addSystemToServiceUrl(sUri), entitySet, dimension);
                            that.writeData.dimension = dimension;
                            that.oConfig.TILE_PROPERTIES.FINALVALUE = data;
                            that.oConfig.TILE_PROPERTIES.FINALVALUE = that._processDataForComparisonChart(that.oConfig.TILE_PROPERTIES.FINALVALUE, measure.split(",")[0], dimension);
                            that.writeData.data = data;
                            sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(that.oConfig.TILE_PROPERTIES.id, that.writeData);
                            fnSuccess.call(that, that.oConfig.TILE_PROPERTIES.FINALVALUE);
                        } else if (data.results.length == 0) {
                            that.oConfig.TILE_PROPERTIES.FINALVALUE = data;
                            that.writeData.data = data;
                            sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(that.oConfig.TILE_PROPERTIES.id, that.writeData);
                        } else {
                            fnError.call(that, "no Response from QueryServiceUri");
                        }
                    }, function (eObject) {
                        if (eObject && eObject.response) {
                            Log.error(eObject.message + " : " + eObject.request.requestUri);
                            fnError.call(that, eObject);
                        }
                    });
                    var variantData = sap.ushell.components.tiles.indicatorTileUtils.util.prepareFilterStructure(
                        that.DEFINITION_DATA.EVALUATION_FILTERS, that.DEFINITION_DATA.ADDITIONAL_FILTERS);

                    var oQuery = sap.ushell.components.tiles.indicatorTileUtils.util.prepareQueryServiceUri(
                        that.oChip.url.addSystemToServiceUrl(sUri), entitySet, measure, null, variantData);
                    if (oQuery) {
                        that.QUERY_SERVICE_MODEL = oQuery.model;
                        that.queryUriForKpiValue = oQuery.uri;

                        that.numericODataReadRef = that.QUERY_SERVICE_MODEL.read(oQuery.uri, null, null, true, function (data) {
                            if (data && data.results && data.results.length) {
                                if (oQuery.unit) {
                                    that._updateTileModel({
                                        unitNumeric: data.results[0][oQuery.unit.name]
                                    });

                                    that.writeData.unitNumeric = oQuery.unit;
                                    that.writeData.unitNumeric.name = oQuery.unit.name;
                                }
                                that.writeData.numericData = data;
                                var oScaledValue = "";
                                var calculatedValueForScaling = data.results[0][that.DEFINITION_DATA.EVALUATION.COLUMN_NAME];

                                var trendIndicator = that.getTrendIndicator(that.setThresholdValues().trendValue, calculatedValueForScaling);
                                if (that.oConfig.EVALUATION.SCALING == -2) {
                                    calculatedValueForScaling *= 100;
                                    that.getView().oNumericContent.setFormatterValue(false);
                                }
                                that.DEFINITION_DATA.value = calculatedValueForScaling;
                                oScaledValue = sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(Number(calculatedValueForScaling), that.oConfig.EVALUATION.SCALING, that.oConfig.EVALUATION.DECIMAL_PRECISION);
                                if (that.oConfig.EVALUATION.SCALING == -2) {
                                    that._updateTileModel({
                                        scale: "%"
                                    });
                                }

                                that._updateTileModel({
                                    value: oScaledValue.toString(),
                                    valueColor: that.DEFINITION_DATA.TILE_PROPERTIES.semanticColorContribution,
                                    indicator: trendIndicator

                                });
                                fnSuccess.call(that, that.oConfig.TILE_PROPERTIES.FINALVALUE, calculatedValueForScaling);
                            } else {
                                fnError.call(that, "no Response from QueryServiceUri");
                            }
                        });
                    }
                } else {
                    var sThresholdObj = that.setThresholdValues();
                    var calculatedValueForScaling;

                    if (cachedValue.unitContribution) {
                        that._updateTileModel({
                            unitContribution: cachedValue.data.results[0][cachedValue.unitContribution.name]
                        });
                    }
                    if (cachedValue.unitNumeric) {
                        that._updateTileModel({
                            unitNumeric: cachedValue.numericData.results[0][cachedValue.unitNumeric.name]
                        });
                    }
                    if (cachedValue.data && cachedValue.data.results && cachedValue.data.results.length) {
                        dimension = cachedValue.dimension;
                        that.oConfig.TILE_PROPERTIES.FINALVALUE = cachedValue.data;
                        that.oConfig.TILE_PROPERTIES.FINALVALUE = that._processDataForComparisonChart(that.oConfig.TILE_PROPERTIES.FINALVALUE, measure.split(",")[0], dimension);
                        fnSuccess.call(that, that.oConfig.TILE_PROPERTIES.FINALVALUE);
                    } else if (data.results.length == 0) {
                        that.oConfig.TILE_PROPERTIES.FINALVALUE = cachedValue.data;

                    } else {
                        fnError.call(that, "no Response from QueryServiceUri");
                    }

                    if (cachedValue.numericData && cachedValue.numericData.results && cachedValue.numericData.results.length) {
                        calculatedValueForScaling = cachedValue.numericData.results[0][that.DEFINITION_DATA.EVALUATION.COLUMN_NAME];
                        if (that.oConfig.EVALUATION.SCALING == -2) {
                            calculatedValueForScaling *= 100;
                            that.getView().oNumericContent.setFormatterValue(false);
                        }
                        var oScaledValue = sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(Number(calculatedValueForScaling), that.oConfig.EVALUATION.SCALING, that.oConfig.EVALUATION.DECIMAL_PRECISION);
                        if (that.oConfig.EVALUATION.SCALING == -2) {
                            that._updateTileModel({
                                scale: "%"
                            });
                        }

                        var trendIndicator = that.getTrendIndicator(sThresholdObj.trendValue, calculatedValueForScaling);

                        that._updateTileModel({
                            value: oScaledValue.toString(),
                            indicator: trendIndicator,
                            valueColor: that.DEFINITION_DATA.TILE_PROPERTIES.semanticColorContribution

                        });
                        fnSuccess.call(that, that.oConfig.TILE_PROPERTIES.FINALVALUE, calculatedValueForScaling);
                    } else {
                        fnError.call(that, "no Response from QueryServiceUri");
                    }
                }
            } catch (e) {
                fnError.call(that, e);
            }
        },

        flowWithoutDesignTimeCall: function () {
            var that = this;
            this.DEFINITION_DATA = this.oConfig;
            this._updateTileModel(this.DEFINITION_DATA);
            if (this.oChip.visible.isVisible() && !this.firstTimeVisible) {
                this.firstTimeVisible = true;
                this.fetchKpiValue(function (kpiValue, calculatedValueForScaling) {
                    this.CALCULATED_KPI_VALUE = kpiValue;
                    if (that.oConfig.TILE_PROPERTIES.frameType == "TwoByOne") {
                        that.oDualContributionView.oGenericTile.setFrameType("TwoByOne");
                        that.oDualContributionView.oGenericTile.removeAllTileContent();
                        that.oDualContributionView.oGenericTile.addTileContent(that.oDualContributionView.oNumericTile);
                        that.oDualContributionView.oGenericTile.addTileContent(that.oDualContributionView.oComparisonTile);
                    } else {
                        that.oDualContributionView.oGenericTile.setFrameType("OneByOne");
                        that.oDualContributionView.oGenericTile.removeAllTileContent();
                        that.oDualContributionView.oGenericTile.addTileContent(that.oDualContributionView.oComparisonTile);
                    }
                    var data = this.CALCULATED_KPI_VALUE;
                    var applyColor = this.DEFINITION_DATA.TILE_PROPERTIES.semanticColorContribution;
                    for (var i = 0; i < this.CALCULATED_KPI_VALUE.length; i++) {
                        data[i].color = applyColor;
                    }

                    this._updateTileModel({
                        data: data

                    });
                    var sThresholdObj = that.setThresholdValues();
                    var navTarget = sap.ushell.components.tiles.indicatorTileUtils.util.getNavigationTarget(that.oConfig, that.system);
                    that.oDualContributionView.oGenericTile.$().wrap("<a href ='" + navTarget + "'></a>");
                    this.oDualContributionView.oGenericTile.setState(LoadState.Loaded);
                    var status = "";
                    if (applyColor == "Error") {
                        status = "sb.error";
                    }
                    if (applyColor == "Neutral") {
                        status = "sb.neutral";
                    }
                    if (applyColor == "Critical") {
                        status = "sb.critical";
                    }
                    if (applyColor == "Good") {
                        status = "sb.good";
                    }
                    sThresholdObj = that.setThresholdValues();

                    var m1, m2, m3, v1, v2, v3, c1, c2, c3;
                    if (this.CALCULATED_KPI_VALUE && this.CALCULATED_KPI_VALUE[0]) {
                        m1 = this.CALCULATED_KPI_VALUE[0].title;
                        v1 = this.CALCULATED_KPI_VALUE[0].value;
                        c1 = sap.ushell.components.tiles.indicatorTileUtils.util.getSemanticColorName(this.CALCULATED_KPI_VALUE[0].color);
                    }
                    if (this.CALCULATED_KPI_VALUE && this.CALCULATED_KPI_VALUE[1]) {
                        m2 = this.CALCULATED_KPI_VALUE[1].title;
                        v2 = this.CALCULATED_KPI_VALUE[1].value;
                        c2 = sap.ushell.components.tiles.indicatorTileUtils.util.getSemanticColorName(this.CALCULATED_KPI_VALUE[1].color);
                    }
                    if (this.CALCULATED_KPI_VALUE && this.CALCULATED_KPI_VALUE[2]) {
                        m3 = this.CALCULATED_KPI_VALUE[2].title;
                        v3 = this.CALCULATED_KPI_VALUE[2].value;
                        c3 = sap.ushell.components.tiles.indicatorTileUtils.util.getSemanticColorName(this.CALCULATED_KPI_VALUE[2].color);
                    }

                    var valueObjNumeric = {
                        status: status,
                        actual: calculatedValueForScaling,
                        target: sThresholdObj.targetValue,
                        cH: sThresholdObj.criticalHighValue,
                        wH: sThresholdObj.warningHighValue,
                        wL: sThresholdObj.warningLowValue,
                        cL: sThresholdObj.criticalLowValue
                    };
                    var valueObjContribution = {
                        m1: m1,
                        v1: v1,
                        c1: c1,
                        m2: m2,
                        v2: v2,
                        c2: c2,
                        m3: m3,
                        v3: v3,
                        c3: c3
                    };

                    var oControlNumeric = that.oDualContributionView.oGenericTile.getTileContent()[0].getContent();
                    var oControlContribution = that.oDualContributionView.oGenericTile.getTileContent()[1].getContent();
                    sap.ushell.components.tiles.indicatorTileUtils.util.setTooltipInTile(oControlNumeric, "NT", valueObjNumeric);
                    sap.ushell.components.tiles.indicatorTileUtils.util.setTooltipInTile(oControlContribution, "CONT", valueObjContribution);
                }, this.logError);
            }
        },

        flowWithDesignTimeCall: function () {
            var that = this;
            try {
                var evaluationData = sap.ushell.components.tiles.indicatorTileUtils.cache.getEvaluationById(this.oConfig.EVALUATION.ID);
                if (evaluationData) {
                    that.oConfig.EVALUATION_FILTERS = evaluationData.EVALUATION_FILTERS;
                    that.flowWithoutDesignTimeCall();
                } else {
                    sap.ushell.components.tiles.indicatorTileUtils.util.getFilterFromRunTimeService(this.oConfig, function (filter) {
                        that.oConfig.EVALUATION_FILTERS = filter;
                        sap.ushell.components.tiles.indicatorTileUtils.cache.setEvaluationById(that.oConfig.TILE_PROPERTIES.id, that.oConfig);
                        that.flowWithoutDesignTimeCall();
                    });
                }
            } catch (e) {
                this.logError(e);
            }
        },

        refreshHandler: function (oController) {
            if (!oController.firstTimeVisible) {
                if (Number(this.oChip.configuration.getParameterValueAsString("isSufficient"))) {
                    oController.flowWithoutDesignTimeCall();
                } else {
                    oController.flowWithDesignTimeCall();
                }
            }
        },
        visibleHandler: function (isVisible) {
            if (!isVisible) {
                this.firstTimeVisible = false;
                sap.ushell.components.tiles.indicatorTileUtils.util.abortPendingODataCalls(this.comparisionChartODataRef);
            }
            if (isVisible) {
                this.refreshHandler(this);
            }
        },

        onInit: function () {
            var that = this;
            that.writeData = {};
            this.firstTimeVisible = false;
            this.oDualContributionView = this.getView();
            this.oChip = this.oDualContributionView.getViewData().chip;
            if (this.oChip.visible) {
                this.oChip.visible.attachVisible(this.visibleHandler.bind(this));
            }
            this.system = this.oChip.url.getApplicationSystem();
            this.oDualContributionView.oGenericTile.setState(LoadState.Loading);
            try {
                sap.ushell.components.tiles.indicatorTileUtils.util.getParsedChip(
                    this.oChip.configuration.getParameterValueAsString("tileConfiguration"), this.oChip.preview.isEnabled(), function (config) {
                        that.oConfig = config;
                        if (that.oChip.preview) {
                            that.oChip.preview.setTargetUrl(sap.ushell.components.tiles.indicatorTileUtils.util.getNavigationTarget(that.oConfig, that.system));
                        }
                        if (that.oChip.preview.isEnabled()) {
                            that.setTitle();
                            that._updateTileModel({
                                value: 8888,
                                size: Size.Auto,
                                frameType: "TwoByOne",
                                state: LoadState.Loading,
                                valueColor: ValueColor.Error,
                                indicator: DeviationIndicator.None,
                                title: "US Profit Margin",
                                footer: "Current Quarter",
                                description: "Maximum deviation",
                                data: [
                                    { title: "Americas", value: 10, color: "Neutral", displayValue: "" },
                                    { title: "EMEA", value: 50, color: "Neutral", displayValue: "" },
                                    { title: "APAC", value: -20, color: "Neutral", displayValue: "" }
                                ]
                            });

                            that.oDualContributionView.oGenericTile.setState(LoadState.Loaded);
                        } else {
                            that.setTitle();
                            that.oDualContributionView.oGenericTile.attachPress(function () {
                                sap.ushell.components.tiles.indicatorTileUtils.util.abortPendingODataCalls(that.comparisionChartODataRef);
                                sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(that.oConfig.TILE_PROPERTIES.id, null);
                                window.location.hash = sap.ushell.components.tiles.indicatorTileUtils.util.getNavigationTarget(that.oConfig, that.system);
                            });
                            if (Number(that.oChip.configuration.getParameterValueAsString("isSufficient"))) {
                                sap.ushell.components.tiles.indicatorTileUtils.cache.setEvaluationById(that.oConfig.TILE_PROPERTIES.id, that.oConfig);
                                that.flowWithoutDesignTimeCall();
                            } else {
                                that.flowWithDesignTimeCall();
                            }
                        }
                    });
            } catch (e) {
                this.logError(e);
            }
        },

        onExit: function () {
            sap.ushell.components.tiles.indicatorTileUtils.util.abortPendingODataCalls(this.comparisionChartODataRef);
        }
    });
}, /* bExport= */ true);
