// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Dual Comparison Tile
 * This SAP Smart Business module is only used for SAP Business Suite hub deployments.
 *
 * @deprecated since 1.96
 */
sap.ui.define([
    "sap/ushell/components/tiles/indicatorTileUtils/smartBusinessUtil", // Do not remove
    "sap/m/library",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log"
    // "sap/ushell/components/tiles/indicatorTileUtils/cache" // do not migrate
], function (
    util,
    mobileLibrary,
    jQuery,
    Log
    // cache // do not migrate
) {
    "use strict";

    // shortcut for sap.m.Size
    var Size = mobileLibrary.Size;

    // shortcut for sap.m.DeviationIndicator
    var DeviationIndicator = mobileLibrary.DeviationIndicator;

    // shortcut for sap.m.ValueColor
    var ValueColor = mobileLibrary.ValueColor;

    // shortcut for sap.m.LoadState
    var LoadState = mobileLibrary.LoadState;

    /* eslint-disable block-scoped-var */ // TODO: remove eslint-disable
    /* eslint-disable no-undef */ // TODO: remove eslint-disable

    sap.ui.controller("tiles.indicatorDualComparison.DualComparison", {
        getTile: function () {
            return this.oDualComparisonView.oGenericTile;
        },

        _updateTileModel: function (newData) {
            var modelData = this.getTile().getModel().getData();
            jQuery.extend(modelData, newData);
            this.getTile().getModel().setData(modelData);
        },

        setTitle: function () {
            var that = this;
            var titleObj = sap.ushell.components.tiles.indicatorTileUtils.util.getTileTitleSubtitle(this.oChip);
            this._updateTileModel({
                header: titleObj.title || sap.ushell.components.tiles.indicatorTileUtils.util.getChipTitle(that.oConfig),
                subheader: titleObj.subTitle || sap.ushell.components.tiles.indicatorTileUtils.util.getChipSubTitle(that.oConfig)
            });
        },

        logError: function (err) {
            this.oDualComparisonView.oGenericTile.setState(LoadState.Failed);
            this.oDualComparisonView.oGenericTile.setState(LoadState.Failed);
            sap.ushell.components.tiles.indicatorTileUtils.util.logError(err);
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

        getTrendColor: function (oThresholdObj) {
            var that = this;
            var criticalHighValue,
                warningHighValue,
                criticalLowValue,
                warningLowValue;
            try {
                var improvementDirection = this.DEFINITION_DATA.EVALUATION.GOAL_TYPE;
                var returnColor = ValueColor.Neutral;
                if (improvementDirection === "MI") {
                    if (oThresholdObj.criticalHighValue && oThresholdObj.warningHighValue) {
                        criticalHighValue = Number(oThresholdObj.criticalHighValue);
                        warningHighValue = Number(oThresholdObj.warningHighValue);
                        if (this.CALCULATED_KPI_VALUE < warningHighValue) {
                            returnColor = ValueColor.Good;
                        } else if (this.CALCULATED_KPI_VALUE <= criticalHighValue) {
                            returnColor = ValueColor.Critical;
                        } else {
                            returnColor = ValueColor.Error;
                        }
                    }
                } else if (improvementDirection === "MA") {
                    if (oThresholdObj.criticalLowValue && oThresholdObj.warningLowValue) {
                        criticalLowValue = Number(oThresholdObj.criticalLowValue);
                        warningLowValue = Number(oThresholdObj.warningLowValue);
                        if (this.CALCULATED_KPI_VALUE < criticalLowValue) {
                            returnColor = ValueColor.Error;
                        } else if (this.CALCULATED_KPI_VALUE <= warningLowValue) {
                            returnColor = ValueColor.Critical;
                        } else {
                            returnColor = ValueColor.Good;
                        }
                    }
                } else if (oThresholdObj.warningLowValue && oThresholdObj.warningHighValue && oThresholdObj.criticalLowValue && oThresholdObj.criticalHighValue) {
                    criticalHighValue = Number(oThresholdObj.criticalHighValue);
                    warningHighValue = Number(oThresholdObj.warningHighValue);
                    warningLowValue = Number(oThresholdObj.warningLowValue);
                    criticalLowValue = Number(oThresholdObj.criticalLowValue);
                    if (this.CALCULATED_KPI_VALUE < criticalLowValue || this.CALCULATED_KPI_VALUE > criticalHighValue) {
                        returnColor = ValueColor.Error;
                    } else if ((this.CALCULATED_KPI_VALUE >= criticalLowValue && this.CALCULATED_KPI_VALUE <= warningLowValue) ||
                        (this.CALCULATED_KPI_VALUE >= warningHighValue && this.CALCULATED_KPI_VALUE <= criticalHighValue)
                    ) {
                        returnColor = ValueColor.Critical;
                    } else {
                        returnColor = ValueColor.Good;
                    }
                } return returnColor;
            } catch (e) {
                that.logError(e);
            }
        },

        _processDataForComparisonChart: function (data, measure, unit) {
            var finalOutput = [], LABEL_MAPPING = {}, i, tempObject, l;
            var tempVar;
            var aTitles = [];
            var that = this;

            for (i = 0; i < data.results.length; i++) {
                var eachData = data.results[i];
            }
            aTitles = sap.ushell.components.tiles.indicatorTileUtils.util.getAllMeasuresWithLabelText(this.oConfig.EVALUATION.ODATA_URL, this.oConfig.EVALUATION.ODATA_ENTITYSET);
            for (i = 0, l = aTitles.length; i < l; i++) {
                tempObject = aTitles[i];
                LABEL_MAPPING[tempObject.key] = tempObject.value;
            }
            var columnName = that.oConfig.TILE_PROPERTIES.COLUMN_NAMES || that.oConfig.EVALUATION.COLUMN_NAMES;
            for (i = 0; i < columnName.length; i++) {
                var temp = {};
                var columnObject = columnName[i];
                temp.value = Number(eachData[columnObject.COLUMN_NAME]);
                var calculatedValueForScaling = Number(eachData[columnObject.COLUMN_NAME]);
                if (that.oConfig.EVALUATION.SCALING == -2) {
                    calculatedValueForScaling *= 100;
                }
                tempVar = sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(calculatedValueForScaling, that.oConfig.EVALUATION.SCALING,
                    that.oConfig.EVALUATION.DECIMAL_PRECISION);
                if (that.oConfig.EVALUATION.SCALING == -2) {
                    tempVar += " %";
                }
                temp.displayValue = tempVar.toString();
                if (unit[i] && eachData[unit[i].name]) {
                    temp.displayValue += " " + eachData[unit[i].name];
                }
                temp.color = columnObject.semanticColor;
                temp.title = LABEL_MAPPING[columnObject.COLUMN_NAME] || columnObject.COLUMN_NAME;

                finalOutput.push(temp);
            }

            return finalOutput;
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
                    var measures = measure;
                    if (this.oConfig.TILE_PROPERTIES.COLUMN_NAMES) {
                        for (var j = 0; j < this.oConfig.TILE_PROPERTIES.COLUMN_NAMES.length; j++) {
                            if (this.oConfig.TILE_PROPERTIES.COLUMN_NAMES[j].COLUMN_NAME != this.oConfig.EVALUATION.COLUMN_NAME) {
                                measures = measures + "," + this.oConfig.TILE_PROPERTIES.COLUMN_NAMES[j].COLUMN_NAME;
                            }
                        }
                    }
                } var data = this.oConfig.EVALUATION_VALUES;
                var cachedValue = sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(that.oConfig.TILE_PROPERTIES.id);
                if (!cachedValue) {
                    var variants = sap.ushell.components.tiles.indicatorTileUtils.util.prepareFilterStructure(this.oConfig.EVALUATION_FILTERS, this.oConfig.ADDITIONAL_FILTERS);

                    var orderByObject = {};
                    orderByObject["0"] = measure + ",asc";
                    orderByObject["1"] = measure + ",desc";

                    var orderByElement = orderByObject[this.oConfig.TILE_PROPERTIES.sortOrder || "0"].split(",");
                    var finalQuery = sap.ushell.components.tiles.indicatorTileUtils.util.prepareQueryServiceUri(that.oChip.url.addSystemToServiceUrl(sUri), entitySet, measures, null, variants, 3);
                    if (this.oConfig.TILE_PROPERTIES.semanticMeasure) {
                        finalQuery.uri += "&$orderby=" + orderByElement[0] + " " + orderByElement[2];
                    } else {
                        finalQuery.uri += "&$orderby=" + orderByElement[0] + " " + orderByElement[1];
                    }

                    this.writeData = {};
                    this.comparisionChartODataRef = finalQuery.model.read(finalQuery.uri, null, null, true, function (data) {
                        if (data && data.results && data.results.length) {
                            if (finalQuery.unit) {
                                that.writeData.unit = finalQuery.unit;
                            }

                            that.oConfig.TILE_PROPERTIES.FINALVALUE = data;
                            that.oConfig.TILE_PROPERTIES.FINALVALUE = that._processDataForComparisonChart(that.oConfig.TILE_PROPERTIES.FINALVALUE, measures.split(",")[0], finalQuery.unit);
                            that.writeData.data = data;
                            var calculatedValueForScaling;

                            for (var i = 0; i < that.oConfig.TILE_PROPERTIES.FINALVALUE.length; i++) {
                                if (that.oConfig.TILE_PROPERTIES.FINALVALUE[i].title == that.DEFINITION_DATA.EVALUATION.COLUMN_NAME) {
                                    that.writeData.numericData = that.oConfig.TILE_PROPERTIES.FINALVALUE[i];
                                    calculatedValueforScaling = that.oConfig.TILE_PROPERTIES.FINALVALUE[i].value;
                                    that.getTrendIndicator(that.setThresholdValues().trendValue, calculatedValueforScaling);

                                    that._updateTileModel({
                                        valueColor: that.oConfig.TILE_PROPERTIES.FINALVALUE[i].color,
                                        value: sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(Number(calculatedValueForScaling),
                                            that.oConfig.EVALUATION.SCALING, that.oConfig.EVALUATION.DECIMAL_PRECISION).toString()
                                    });
                                    break;
                                }
                            }
                            sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(that.oConfig.TILE_PROPERTIES.id, that.writeData);
                            fnSuccess.call(that, that.oConfig.TILE_PROPERTIES.FINALVALUE);
                        } else if (data.results.length == 0) {
                            that.oConfig.TILE_PROPERTIES.FINALVALUE = data;
                            that.writeData.data = data;
                            sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(that.oConfig.TILE_PROPERTIES.id, that.writeData);
                            fnSuccess.call(that, that.oConfig.TILE_PROPERTIES.FINALVALUE);
                        } else {
                            fnError.call(that, "no Response from QueryServiceUri");
                        }
                    }, function (eObject) {
                        if (eObject && eObject.response) {
                            Log.error(eObject.message + " : " + eObject.request.requestUri);
                            fnError.call(that, eObject);
                        }
                    });

                    if (!that.writeData.numericData) {
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
                                    that.writeData.numericData = data.results[0];
                                    that.DEFINITION_DATA.value = that.writeData.numericData[that.DEFINITION_DATA.EVALUATION.COLUMN_NAME];
                                    that.writeData.numericData.color = that.getTrendColor(that.setThresholdValues());
                                    that.DEFINITION_DATA.valueColor = that.writeData.numericData.color;

                                    var oScaledValue = "";
                                    var calculatedValueForScaling = data.results[0][that.DEFINITION_DATA.EVALUATION.COLUMN_NAME];
                                    var trendIndicator = that.getTrendIndicator(that.setThresholdValues().trendValue, calculatedValueForScaling);
                                    if (that.oConfig.EVALUATION.SCALING == -2) {
                                        calculatedValueForScaling *= 100;
                                        that.getView().oNumericContent.setFormatterValue(false);
                                    }
                                    oScaledValue = sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(Number(calculatedValueForScaling),
                                        that.oConfig.EVALUATION.SCALING, that.oConfig.EVALUATION.DECIMAL_PRECISION);
                                    if (that.oConfig.EVALUATION.SCALING == -2) {
                                        that._updateTileModel({
                                            scale: "%"
                                        });
                                    }

                                    that._updateTileModel({
                                        value: oScaledValue.toString(),
                                        valueColor: that.writeData.numericData.color,
                                        indicator: trendIndicator

                                    });
                                } else {
                                    fnError.call(that, "no Response from QueryServiceUri");
                                }
                            });
                        }
                    }
                } else {
                    if (cachedValue.unit) {
                        that._updateTileModel({
                            unit: cachedValue.data.results[0][cachedValue.unit.name]
                        });
                    }
                    if (cachedValue.data && cachedValue.data.results && cachedValue.data.results.length) {
                        that.oConfig.TILE_PROPERTIES.FINALVALUE = cachedValue.data;
                        that._updateTileModel({
                            value: cachedValue.data.results[0][that.DEFINITION_DATA.EVALUATION.COLUMN_NAME]
                        });
                        that.oConfig.TILE_PROPERTIES.FINALVALUE = that._processDataForComparisonChart(that.oConfig.TILE_PROPERTIES.FINALVALUE, measures, that.writeData.unit);
                        fnSuccess.call(that, that.oConfig.TILE_PROPERTIES.FINALVALUE);
                    } else if (data.results.length == 0) {
                        that.oConfig.TILE_PROPERTIES.FINALVALUE = cachedValue.data;
                        fnSuccess.call(that, that.oConfig.TILE_PROPERTIES.FINALVALUE);
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
                this.fetchKpiValue(function (kpiValue) {
                    this.CALCULATED_KPI_VALUE = kpiValue;
                    that.oDualComparisonView.oGenericTile.setFrameType("TwoByOne");
                    that.oDualComparisonView.oGenericTile.removeAllTileContent();
                    that.oDualComparisonView.oGenericTile.addTileContent(that.oDualComparisonView.oNumericTile);
                    that.oDualComparisonView.oGenericTile.addTileContent(that.oDualComparisonView.oComparisonTile);

                    var calculatedKpiValue = this.CALCULATED_KPI_VALUE;
                    var applyColor, calculatedValueForScaling;
                    for (var i = 0; i < calculatedKpiValue.length; i++) {
                        if (calculatedKpiValue[i].title == that.DEFINITION_DATA.EVALUATION.COLUMN_NAME) {
                            calculatedValueForScaling = calculatedKpiValue[i].value;
                            applyColor = calculatedKpiValue[i].color || "Neutral";
                            that._updateTileModel({
                                value: sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(Number(calculatedValueForScaling),
                                       that.oConfig.EVALUATION.SCALING, that.oConfig.EVALUATION.DECIMAL_PRECISION).toString(),
                                valueColor: applyColor
                            });
                            break;
                        }
                    }
                    if (!applyColor && !calculatedValueForScaling) {
                        applyColor = that.DEFINITION_DATA.valueColor;
                        calculatedValueForScaling = that.DEFINITION_DATA.value;
                    }
                    this._updateTileModel({
                        value: sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(Number(calculatedValueForScaling),
                               that.oConfig.EVALUATION.SCALING, that.oConfig.EVALUATION.DECIMAL_PRECISION).toString(),
                        data: this.CALCULATED_KPI_VALUE
                    });
                    var navTarget = sap.ushell.components.tiles.indicatorTileUtils.util.getNavigationTarget(that.oConfig, that.system);
                    that.oDualComparisonView.oGenericTile.$().wrap("<a href ='" + navTarget + "'></a>");
                    this.oDualComparisonView.oGenericTile.setState(LoadState.Loaded);

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
                    var sThresholdObj = that.setThresholdValues();

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
                    var valueObjComparison = {
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

                    var oControlNumeric = that.oDualComparisonView.oGenericTile.getTileContent()[0].getContent();
                    var oControlComparison = that.oDualComparisonView.oGenericTile.getTileContent()[1].getContent();
                    sap.ushell.components.tiles.indicatorTileUtils.util.setTooltipInTile(oControlNumeric, "NT", valueObjNumeric);
                    sap.ushell.components.tiles.indicatorTileUtils.util.setTooltipInTile(oControlComparison, "COMP", valueObjComparison);
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
            this.firstTimeVisible = false;
            this.oDualComparisonView = this.getView();
            this.oChip = this.oDualComparisonView.getViewData().chip;
            if (this.oChip.visible) {
                this.oChip.visible.attachVisible(this.visibleHandler.bind(this));
            }
            this.system = this.oChip.url.getApplicationSystem();
            this.oDualComparisonView.oGenericTile.setState(LoadState.Loading);
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
                                value: 1,
                                size: Size.Auto,
                                frameType: "TwoByOne",
                                state: LoadState.Loading,
                                valueColor: ValueColor.Good,
                                indicator: DeviationIndicator.None,
                                title: "Liquidity Structure",
                                footer: "Current Quarter",
                                description: "Apr 1st 2013 (B$)",
                                data: [
                                    { title: "Measure 1", value: 1, color: "Good" },
                                    { title: "Measure 2", value: 2, color: "Good" },
                                    { title: "Measure 3", value: 3, color: "Good" }
                                ]
                            });
                            that.oDualComparisonView.oGenericTile.setState(LoadState.Loaded);
                        } else {
                            that.setTitle();
                            that.oDualComparisonView.oGenericTile.attachPress(function () {
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
