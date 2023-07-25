// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/* eslint-disable max-len */
/* eslint-disable complexity */

/**
 * @fileOverview Contribution Tile
 * This SAP Smart Business module is only used for SAP Business Suite hub deployments.
 *
 * @deprecated since 1.96
 */
sap.ui.define([
    "sap/ushell/components/tiles/generic",
    "sap/m/library",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log"
    // "sap/ushell/components/tiles/indicatorTileUtils/cache" // do not migrate
], function (
    generic,
    mobileLibrary,
    jQuery,
    Log
    // cache // do not migrate
) {
    "use strict";

    // shortcut for sap.m.DeviationIndicator
    var DeviationIndicator = mobileLibrary.DeviationIndicator;

    // shortcut for sap.m.ValueColor
    var ValueColor = mobileLibrary.ValueColor;

    // shortcut for sap.m.Size
    var Size = mobileLibrary.Size;

    // shortcut for sap.m.LoadState
    var LoadState = mobileLibrary.LoadState;

    // shortcut for sap.m.FrameType
    var FrameType = mobileLibrary.FrameType;

    /* eslint-disable block-scoped-var */ // TODO: remove eslint-disable

    var ContributionTileController = generic.extend("sap.ushell.components.tiles.indicatorcontribution.ContributionTile", {
        onInit: function () {
            this.KPI_VALUE_REQUIRED = false;
        },
        _processDataForComparisonChart: function (data, measure, dimension, unitProperty) {
            var semanticColor = this.oConfig.TILE_PROPERTIES.semanticColorContribution;
            var finalOutput = [];
            var tempVar;
            var unitValue;
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
                var c = this.isCurrencyMeasure(measure);
                unitValue = eachData[unitProperty];
                tempVar = sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(calculatedValueForScaling, this.oConfig.EVALUATION.SCALING, this.oConfig.EVALUATION.DECIMAL_PRECISION, c, unitValue);
                temp.displayValue = tempVar.toString();

                if (typeof semanticColor === "undefined") {
                    temp.color = "Neutral";
                } else {
                    temp.color = semanticColor;
                }
                if (temp && unitProperty) {
                    temp[unitProperty] = unitValue;
                }

                finalOutput.push(temp);
            }
            return finalOutput;
        },
        fetchChartData: function (bRefreshClick, isAutoRefresh, fnSuccess, fnError) {
            var that = this;

            try {
                /* Preparing arguments for the prepareQueryServiceUri function */
                var entitySet = this.oConfig.EVALUATION.ODATA_ENTITYSET,
                    measure;
                that.setThresholdValues();
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
                var unitProperty = null;
                var dimension = this.oConfig.TILE_PROPERTIES.dimension;
                var isRefreshClick = sap.ushell.components.tiles.indicatorTileUtils.util.getBoolValue(bRefreshClick);
                var cachedValue = sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(that.oConfig.TILE_PROPERTIES.id);

                if (sap.ushell.components.tiles.indicatorTileUtils.util.isDualTile(that.oConfig)) {
                    if (cachedValue) {
                        var tempData = cachedValue.Data && JSON.parse(cachedValue.Data);
                    }
                }

                var chipUpdateTime = that.oTileApi.configuration.getParameterValueAsString("timeStamp");
                var isCacheValid = sap.ushell.components.tiles.indicatorTileUtils.util.isCacheValid(that.oConfig.TILE_PROPERTIES.id, chipUpdateTime, that.chipCacheTime, that.chipCacheTimeUnit, that.tilePressed);
                if ((tempData && !tempData.rightData) || !cachedValue || (!isCacheValid && that.oTileApi.visible.isVisible()) || isRefreshClick || (isAutoRefresh && that.oTileApi.visible.isVisible()) || that.getView().getViewData().refresh) {
                    if (that.kpiValueFetchDeferred) {
                        that.kpiValueFetchDeferred = false;
                        var variants = sap.ushell.components.tiles.indicatorTileUtils.util.prepareFilterStructure(this.oConfig.EVALUATION_FILTERS, this.oConfig.ADDITIONAL_FILTERS);
                        var orderByObject = {};
                        orderByObject["0"] = measure + ",asc";
                        orderByObject["1"] = measure + ",desc";
                        orderByObject["2"] = dimension + ",asc";
                        orderByObject["3"] = dimension + ",desc";
                        var orderByElement = orderByObject[this.oConfig.TILE_PROPERTIES.sortOrder || "0"].split(",");
                        var finalQuery = sap.ushell.components.tiles.indicatorTileUtils.util.prepareQueryServiceUri(that.oRunTimeODataModel, entitySet, measure, dimension, variants, 3);
                        if (this.oConfig.TILE_PROPERTIES.semanticMeasure) {
                            finalQuery.uri += "&$top=3&$orderby=" + orderByElement[0] + " " + orderByElement[2];
                        } else {
                            finalQuery.uri += "&$top=3&$orderby=" + orderByElement[0] + " " + orderByElement[1];
                        }

                        this.comparisionChartODataRef = finalQuery.model.read(finalQuery.uri, null, null, true, function (data) {
                            that.kpiValueFetchDeferred = true;
                            var writeData = {};
                            if (data && data.results && data.results.length) {
                                if (finalQuery.unit[0]) {
                                    that._updateTileModel({
                                        unit: data.results[0][finalQuery.unit[0].name]
                                    });
                                    unitProperty = finalQuery.unit[0].name;
                                    writeData.unit = finalQuery.unit[0];
                                    writeData.unit.name = finalQuery.unit[0].name;
                                }
                                dimension = sap.ushell.components.tiles.indicatorTileUtils.util.findTextPropertyForDimension(that.oRunTimeODataModel, entitySet, dimension);
                                writeData.dimension = dimension;
                                that.oConfig.TILE_PROPERTIES.FINALVALUE = data;
                                that.oConfig.TILE_PROPERTIES.FINALVALUE = that._processDataForComparisonChart(that.oConfig.TILE_PROPERTIES.FINALVALUE, measure.split(",")[0], dimension, unitProperty);
                                writeData.data = that.oConfig.TILE_PROPERTIES.FINALVALUE;
                                writeData.isCurM = that.isACurrencyMeasure(that.oConfig.EVALUATION.COLUMN_NAME);
                                var cacheData = {};
                                that.cacheTime = sap.ushell.components.tiles.indicatorTileUtils.util.getUTCDate();

                                cacheData.ChipId = that.oConfig.TILE_PROPERTIES.id;
                                cacheData.Data = JSON.stringify(writeData);
                                cacheData.CacheMaxAge = Number(that.chipCacheTime);
                                cacheData.CacheMaxAgeUnit = that.chipCacheTimeUnit;
                                cacheData.CacheType = 1;

                                var localCache = that.getLocalCache(cacheData);

                                that.updateDatajobScheduled = false;
                                var key = that.oConfig.TILE_PROPERTIES.id + "data";
                                var runningJob = sap.ushell.components.tiles.indicatorTileUtils.util.getScheduledJob(key);
                                if (runningJob) {
                                    clearTimeout(runningJob);
                                    runningJob = undefined;
                                }
                                if (!sap.ushell.components.tiles.indicatorTileUtils.util.isDualTile(that.oConfig)) {
                                    sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(that.oConfig.TILE_PROPERTIES.id, localCache);
                                    var bUpdate = false;
                                    if (cachedValue) {
                                        bUpdate = true;
                                    }
                                    if (that.chipCacheTime) {
                                        sap.ushell.components.tiles.indicatorTileUtils.util.writeFrontendCacheByChipAndUserId(that.oTileApi, that.oConfig.TILE_PROPERTIES.id, cacheData,
                                            bUpdate, function (data) {
                                                if (data) {
                                                    that.cacheTime = data && data.CachedTime;
                                                    sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(that.oConfig.TILE_PROPERTIES.id, data);
                                                }
                                                if (that.chipCacheTime &&
                                                    !sap.ushell.components.tiles.indicatorTileUtils.util.isDualTile(that.oConfig)) {
                                                    jQuery.proxy(that.setTimeStamp(that.cacheTime), that);
                                                }
                                            });
                                    }
                                } else {
                                    var tempCacheData = sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(that.oConfig.TILE_PROPERTIES.id),
                                        avilableCacheData;
                                    if (tempCacheData) {
                                        if (!tempCacheData.CachedTime) {
                                            tempCacheData.CachedTime = sap.ushell.components.tiles.indicatorTileUtils.util.getUTCDate();
                                        }
                                        avilableCacheData = tempCacheData.Data;
                                        if (avilableCacheData) {
                                            avilableCacheData = JSON.parse(avilableCacheData);
                                            if (that.oKpiTileView.getViewName() == "tiles.indicatornumeric.NumericTile") {
                                                avilableCacheData.leftData = writeData;
                                            } else {
                                                avilableCacheData.rightData = writeData;
                                            }
                                        }
                                        tempCacheData.Data = JSON.stringify(avilableCacheData);
                                        sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(that.oConfig.TILE_PROPERTIES.id, tempCacheData);
                                    } else {
                                        avilableCacheData = {};
                                        avilableCacheData.rightData = writeData;
                                        localCache.Data = JSON.stringify(avilableCacheData);
                                        sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(that.oConfig.TILE_PROPERTIES.id, localCache);
                                    }
                                    that.cacheWriteData = writeData;
                                }
                                fnSuccess.call(that, that.oConfig.TILE_PROPERTIES.FINALVALUE);
                            } else if (data.results.length == 0) {
                                that.oConfig.TILE_PROPERTIES.FINALVALUE = data;
                                if (sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(that.oConfig.TILE_PROPERTIES.id)) {
                                    writeData = sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(that.oConfig.TILE_PROPERTIES.id);
                                    writeData.data = data;
                                } else {
                                    writeData.data = data;
                                }
                                sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(that.oConfig.TILE_PROPERTIES.id, writeData);
                                fnSuccess.call(that, that.oConfig.TILE_PROPERTIES.FINALVALUE);
                                that.setNoData();
                            } else {
                                sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(that.oConfig.TILE_PROPERTIES.id, { empty: "empty" });
                                that.setNoData();
                            }
                        }, function (eObject) {
                            that.kpiValueFetchDeferred = true;
                            if (eObject && eObject.response) {
                                Log.error(eObject.message + " : " + eObject.request.requestUri);
                                fnError.call(that, eObject);
                            }
                        });
                    }
                } else if (cachedValue && cachedValue.Data) {
                    var kpiData;
                    var tileType = that.oConfig && that.oConfig.TILE_PROPERTIES && that.oConfig.TILE_PROPERTIES.tileType;
                    if (tileType.indexOf("DT-") == -1) {
                        kpiData = cachedValue.Data && JSON.parse(cachedValue.Data);
                    } else {
                        kpiData = cachedValue.Data && JSON.parse(cachedValue.Data);
                        kpiData = kpiData.rightData;
                    }
                    that.cacheTime = cachedValue.CachedTime;
                    if (that.chipCacheTime &&
                        !sap.ushell.components.tiles.indicatorTileUtils.util.isDualTile(that.oConfig)) {
                        jQuery.proxy(that.setTimeStamp(that.cacheTime), that);
                    }
                    if (kpiData.data && kpiData.data.length) {
                        if (kpiData.unit) {
                            that._updateTileModel({
                                unit: kpiData.data[0][kpiData.unit.name]
                            });
                        }
                        dimension = kpiData.dimension;
                        that.oConfig.TILE_PROPERTIES.FINALVALUE = kpiData.data;

                        fnSuccess.call(that, that.oConfig.TILE_PROPERTIES.FINALVALUE);
                    } else if (kpiData && kpiData.data && kpiData.data instanceof Array && kpiData.data.length == 0) {
                        that.oConfig.TILE_PROPERTIES.FINALVALUE = kpiData.data;
                        fnSuccess.call(that, that.oConfig.TILE_PROPERTIES.FINALVALUE);
                        that.setNoData();
                    } else {
                        that.setNoData();
                    }
                } else {
                    that.setNoData();
                }
            } catch (e) {
                that.kpiValueFetchDeferred = true;
                fnError.call(that, e);
            }
        },
        doProcess: function (bRefreshClick, isAutoRefresh) {
            var that = this;
            this.DEFINITION_DATA = this.oConfig;
            this._updateTileModel(this.DEFINITION_DATA);
            this.setTextInTile();
            this.fetchChartData(bRefreshClick, isAutoRefresh, function (kpiValue) {
                this.CALCULATED_KPI_VALUE = kpiValue;
                this._updateTileModel({
                    data: this.CALCULATED_KPI_VALUE
                });
                if (that.oConfig.TILE_PROPERTIES.frameType == FrameType.TwoByOne) {
                    that.oKpiTileView.oGenericTile.setFrameType(FrameType.TwoByOne);
                    that.oKpiTileView.oGenericTile.removeAllTileContent();
                    that.getView().getViewData().parentController._updateTileModel(this.getTile().getModel().getData());
                    that.getView().getViewData().deferredObj.resolve();
                } else {
                    that.oKpiTileView.oGenericTile.setFrameType(FrameType.OneByOne);
                    that.oKpiTileView.oGenericTile.removeAllTileContent();
                    that.oKpiTileView.oGenericTile.addTileContent(that.oKpiTileView.oNVConfS);
                    this.oKpiTileView.oGenericTile.setState(LoadState.Loaded);
                }

                this.setToolTip(null, this.CALCULATED_KPI_VALUE, "CONT");
                if (this.chipCacheTime &&
                    !sap.ushell.components.tiles.indicatorTileUtils.util.isDualTile(this.oConfig)) {
                    sap.ushell.components.tiles.indicatorTileUtils.util.scheduleFetchDataJob.call(this, this.oTileApi.visible.isVisible());
                }
            }, this.logError);
        },

        doDummyProcess: function () {
            var that = this;
            that.setTextInTile();
            that._updateTileModel({
                value: 8888,
                size: Size.Auto,
                frameType: FrameType.OneByOne,
                state: LoadState.Loading,
                valueColor: ValueColor.Error,
                indicator: DeviationIndicator.None,
                title: "US Profit Margin",
                footer: "Current Quarter",
                description: "Maximum deviation",
                data: [
                    { title: "Americas", value: 10, color: "Neutral" },
                    { title: "EMEA", value: 50, color: "Neutral" },
                    { title: "APAC", value: -20, color: "Neutral" }
                ]

            });
            this.oKpiTileView.oGenericTile.setState(LoadState.Loaded);
        }
    });
    return ContributionTileController;
});
