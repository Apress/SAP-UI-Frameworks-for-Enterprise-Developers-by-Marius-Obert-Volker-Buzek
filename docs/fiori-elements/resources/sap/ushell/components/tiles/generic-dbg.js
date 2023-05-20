// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview generic KPI tile functions
 * This SAP Smart Business module is only used for SAP Business Suite hub deployments.
 *
 * @deprecated since 1.96
 */
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/analytics/odata4analytics", // Do not remove
    "sap/ushell/components/tiles/indicatorTileUtils/smartBusinessUtil", // Do not remove
    "sap/ushell/components/tiles/sbtilecontent", // Do not remove
    "sap/m/library",
    "sap/ui/core/format/DateFormat",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log"
    // "sap/ushell/components/tiles/indicatorTileUtils/cache" // do not migrate
    // "sap/ushell/components/tiles/utils" // do not migrate
], function (
    Controller,
    odata4analytics,
    smartBusinessUtil,
    sbtilecontent,
    mobileLibrary,
    DateFormat,
    MessageToast,
    JSONModel,
    jQuery,
    Log
    // cache // do not migrate
    // utils // do not migrate
) {
    "use strict";

    // shortcut for sap.m.DeviationIndicator
    var DeviationIndicator = mobileLibrary.DeviationIndicator;

    // shortcut for sap.m.ValueColor
    var ValueColor = mobileLibrary.ValueColor;

    // shortcut for sap.m.FrameType
    var FrameType = mobileLibrary.FrameType;

    // shortcut for sap.m.LoadState
    var LoadState = mobileLibrary.LoadState;

    /* eslint-disable block-scoped-var */ // TODO: remove the disable and refactor the code

    var generic = Controller.extend("sap.ushell.components.tiles.generic", {
        getTile: function () {
            return this.oKpiTileView.oGenericTile;
        },

        _updateTileModel: function (newData) {
            var modelData = this.getTile().getModel().getData();
            jQuery.extend(modelData, newData);
            this.getTile().getModel().setData(modelData);
        },

        logError: function (err) {
            this._updateTileModel({
                value: "",
                scale: "",
                unit: ""
            });
            Log.error(err);
            if (this.getView().getViewData().deferredObj) {
                this.getView().getViewData().deferredObj.reject();
            } else {
                this.oKpiTileView.oGenericTile.setState(LoadState.Failed);
            }
        },

        getKeyForCallCheck: function () {
            if (this.oKpiTileView.getViewName() == "sap.ushell.components.tiles.indicatornumeric.NumericTile") {
                return this.oConfig.TILE_PROPERTIES.id + "left";
            }
            return this.oConfig.TILE_PROPERTIES.id + "right";
        },

        getRelativeTime: function () {
            var curDate = sap.ushell.components.tiles.indicatorTileUtils.util.getUTCDate(),
                tempCacheTime;
            if (jQuery.type(this.cacheTime) == "date") {
                tempCacheTime = this.cacheTime;
            } else {
                tempCacheTime = new Date(parseInt(this.cacheTime.substr(6), 10));
            }
            var relativeTime = sap.ushell.components.tiles.indicatorTileUtils.util.getTimeDifference(curDate - tempCacheTime),
                retDate,
                offsetInMilliSeconds;
            switch (relativeTime.unit) {
                case "minutes":
                    offsetInMilliSeconds = sap.ushell.components.tiles.indicatorTileUtils.util.getMillisecond(relativeTime.time, "minutes");
                    curDate = curDate - offsetInMilliSeconds;
                    retDate = new Date(curDate);
                    break;
                case "hours":
                    offsetInMilliSeconds = sap.ushell.components.tiles.indicatorTileUtils.util.getMillisecond(relativeTime.time, "hours");
                    curDate = curDate - offsetInMilliSeconds;
                    retDate = new Date(curDate);
                    break;
                case "days":
                    offsetInMilliSeconds = sap.ushell.components.tiles.indicatorTileUtils.util.getMillisecond(relativeTime.time, "days");
                    curDate = curDate - offsetInMilliSeconds;
                    retDate = new Date(curDate);
                    break;
            }
            return retDate;
        },

        setTimeStamp: function (/*date*/) {
            this.updateTimeStampjobScheduled = false;
            var oFormat = DateFormat.getDateTimeInstance({ relative: true, relativeSource: "auto", style: "short" });
            var timeStamp = oFormat.format(this.getRelativeTime());
            this.oKpiTileView.oNVConfS.setRefreshOption(true);
            this.oKpiTileView.oNVConfS.setTimestamp(timeStamp);
            this.updateTimeStampjobScheduled = false;
            var key = this.oConfig.TILE_PROPERTIES.id + "time";
            var runningJob = sap.ushell.components.tiles.indicatorTileUtils.util.getScheduledJob(key);
            if (runningJob) {
                clearTimeout(runningJob);
                runningJob = undefined;
            }

            sap.ushell.components.tiles.indicatorTileUtils.util.scheduleTimeStampJob.call(this, this.oTileApi.visible.isVisible());
        },

        isACurrencyMeasure: function (measure) {
            var entitySet = this.DEFINITION_DATA.EVALUATION.ODATA_ENTITYSET;
            return sap.ushell.components.tiles.indicatorTileUtils.util.getFormattingMetadata(this.oRunTimeODataModel, entitySet, measure)._hasCurrency;
        },

        isCurrencyMeasure: function (measure) {
            var that = this;
            var cachedValue = sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(that.oConfig.TILE_PROPERTIES.id);

            if (cachedValue && cachedValue.Data) {
                var kpiData = cachedValue.Data && JSON.parse(cachedValue.Data);
                if (sap.ushell.components.tiles.indicatorTileUtils.util.isDualTile(that.oConfig)) {
                    if (that.oKpiTileView.getViewName() == "sap.ushell.components.tiles.indicatornumeric.NumericTile") {
                        kpiData = kpiData.leftData;
                    } else {
                        kpiData = kpiData.rightData;
                    }
                } if (that.oKpiTileView.getViewName() == "sap.ushell.components.tiles.indicatorcomparison.ComparisonTile" ||
                    that.oConfig.TILE_PROPERTIES.tileType === "CM") {
                    if (kpiData && kpiData.data && kpiData.data.length) {
                        for (var i = 0; i < kpiData.data.length; i++) {
                            if (kpiData.data[i] && kpiData.data[i].measure == measure) {
                                if (jQuery.type(kpiData.data[i].isCurM) == "boolean") {
                                    return kpiData.data[i].isCurM;
                                }
                                return that.isACurrencyMeasure(measure);
                            }
                            return that.isACurrencyMeasure(measure);
                        }
                    } else {
                        return that.isACurrencyMeasure(measure);
                    }
                } if (kpiData && jQuery.type(kpiData.isCurM) == "boolean") {
                    return kpiData.isCurM;
                }
                return that.isACurrencyMeasure(measure);
            }
            return that.isACurrencyMeasure(measure);
        },

        formSelectStatement: function (object) {
            var tmpArray = Object.keys(object);
            var sFormedMeasure = "";
            for (var i = 0; i < tmpArray.length; i++) {
                if ((object[tmpArray[i]] !== undefined) && (object.fullyFormedMeasure)) {
                    sFormedMeasure = sFormedMeasure + "," + object[tmpArray[i]];
                }
            } return sFormedMeasure;
        },

        setThresholdValues: function () {
            var that = this;
            try {
                var oThresholdObject = {};
                oThresholdObject.fullyFormedMeasure = this.DEFINITION_DATA.EVALUATION.COLUMN_NAME;
                if (this.DEFINITION_DATA.EVALUATION.VALUES_SOURCE == "MEASURE") {
                    var cacheData = sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(that.oConfig.TILE_PROPERTIES.id);
                    switch (this.DEFINITION_DATA.EVALUATION.GOAL_TYPE) {
                        case "MI":
                            oThresholdObject.sWarningHigh = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WH", "MEASURE");
                            oThresholdObject.sCriticalHigh = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CH", "MEASURE");
                            oThresholdObject.sTarget = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TA", "MEASURE");
                            oThresholdObject.sTrend = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TC", "MEASURE");
                            oThresholdObject.fullyFormedMeasure += that.formSelectStatement(oThresholdObject);
                            /* Code fix for incident 366767. Cached Data passed was incorrect*/
                            if (cacheData && cacheData.Data && cacheData.Data.length) {
                                cacheData.Data = JSON.parse(cacheData.Data);
                                oThresholdObject.trendValue = Number(cacheData.Data.trend);
                                oThresholdObject.targetValue = Number(cacheData.Data.target);
                                oThresholdObject.criticalHighValue = Number(cacheData.Data.ch);
                                oThresholdObject.warningHighValue = Number(cacheData.Data.wh);
                                cacheData.Data = JSON.stringify(cacheData.Data);
                            }
                            break;
                        case "MA":
                            oThresholdObject.sWarningLow = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WL", "MEASURE");
                            oThresholdObject.sCriticalLow = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CL", "MEASURE");
                            oThresholdObject.sTarget = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TA", "MEASURE");
                            oThresholdObject.sTrend = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TC", "MEASURE");
                            oThresholdObject.fullyFormedMeasure += that.formSelectStatement(oThresholdObject);
                            if (cacheData && cacheData.Data && cacheData.Data.length) {
                                cacheData.Data = JSON.parse(cacheData.Data);
                                oThresholdObject.criticalLowValue = Number(cacheData.Data.cl);
                                oThresholdObject.warningLowValue = Number(cacheData.Data.wl);
                                oThresholdObject.trendValue = Number(cacheData.Data.trend);
                                oThresholdObject.targetValue = Number(cacheData.Data.target);
                                cacheData.Data = JSON.stringify(cacheData.Data);
                            }
                            break;
                        case "RA":
                            oThresholdObject.sWarningHigh = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WH", "MEASURE");
                            oThresholdObject.sCriticalHigh = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CH", "MEASURE");
                            oThresholdObject.sTarget = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TA", "MEASURE");
                            oThresholdObject.sTrend = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TC", "MEASURE");
                            oThresholdObject.sWarningLow = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WL", "MEASURE");
                            oThresholdObject.sCriticalLow = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CL", "MEASURE");
                            oThresholdObject.fullyFormedMeasure += that.formSelectStatement(oThresholdObject);
                            if (cacheData && cacheData.Data && cacheData.Data.length) {
                                cacheData.Data = JSON.parse(cacheData.Data);
                                oThresholdObject.criticalLowValue = Number(cacheData.Data.cl);
                                oThresholdObject.warningLowValue = Number(cacheData.Data.wl);
                                oThresholdObject.trendValue = Number(cacheData.Data.trend);
                                oThresholdObject.targetValue = Number(cacheData.Data.target);
                                oThresholdObject.criticalHighValue = Number(cacheData.Data.ch);
                                oThresholdObject.warningHighValue = Number(cacheData.Data.wh);
                                cacheData.Data = JSON.stringify(cacheData.Data);
                            }
                            break;
                    }
                } else if (this.DEFINITION_DATA.EVALUATION.VALUES_SOURCE == "RELATIVE") {
                    oThresholdObject.sTarget = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TA", "MEASURE");
                    oThresholdObject.sTrend = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TC", "MEASURE");
                    oThresholdObject.fullyFormedMeasure += that.formSelectStatement(oThresholdObject);
                    oThresholdObject.criticalHighValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CH", "FIXED");
                    oThresholdObject.criticalLowValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CL", "FIXED");
                    oThresholdObject.warningHighValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WH", "FIXED");
                    oThresholdObject.warningLowValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WL", "FIXED");
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

        setNoData: function () {
            var viewData = this.getView().getViewData();
            if (viewData.parentController) {
                viewData.parentController.setNoData();
                if (viewData.deferredObj) {
                    viewData.deferredObj.resolve();
                }
            } else {
                try {
                    this._updateTileModel({
                        value: "",
                        scale: "",
                        unit: "",
                        footerNum: this.oResourceBundle.getText("sb.noDataAvailable"),
                        footerComp: this.oResourceBundle.getText("sb.noDataAvailable") // in case of comparison( and mm) tiles

                    });
                    this.oKpiTileView.oGenericTile.setState(LoadState.Loaded);
                } catch (e) {
                    //do nothing
                }
            }
        },

        getLocalCache: function (cache) {
            var localCache = {};
            localCache.ChipId = cache.ChipId;
            localCache.Data = cache.Data;
            localCache.CacheMaxAge = cache.CacheMaxAgeUnit;
            localCache.CacheMaxAgeUnit = cache.CacheMaxAgeUnit;
            localCache.CacheType = cache.CacheType;
            localCache.CachedTime = sap.ushell.components.tiles.indicatorTileUtils.util.getUTCDate();
            return localCache;
        },

        fetchKpiValue: function (callback, fnError, bRefreshClick, bAutoRefresh) {
            var that = this;
            var kpiValue = 0;
            try {
                var sEntitySet = this.DEFINITION_DATA.EVALUATION.ODATA_ENTITYSET;
                var sThresholdObject = this.setThresholdValues();
                var sMeasure = sThresholdObject.fullyFormedMeasure;
                var cachedValue = sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(that.oConfig.TILE_PROPERTIES.id);
                var chipUpdateTime = that.oTileApi.configuration.getParameterValueAsString("timeStamp");
                var isCacheValid = sap.ushell.components.tiles.indicatorTileUtils.util.isCacheValid(that.oConfig.TILE_PROPERTIES.id,
                    chipUpdateTime, that.chipCacheTime, that.chipCacheTimeUnit, that.tilePressed);
                var isRefreshClick = sap.ushell.components.tiles.indicatorTileUtils.util.getBoolValue(bRefreshClick);
                var keyCallCheck = this.getKeyForCallCheck();
                var isCallInProgress = true;
                if (sap.ushell.components.tiles.indicatorTileUtils.util.isDualTile(that.oConfig)) {
                    isCallInProgress = sap.ushell.components.tiles.indicatorTileUtils.util.isCallInProgress(keyCallCheck);
                    if (isCallInProgress == undefined) {
                        isCallInProgress = true;
                    }
                } if (isCallInProgress) {
                    if ((!cachedValue || (!isCacheValid && that.oTileApi.visible.isVisible()) || isRefreshClick || (bAutoRefresh && that.oTileApi.visible.isVisible())
                       || that.getView().getViewData().refresh)) {
                        sap.ushell.components.tiles.indicatorTileUtils.util.setUnsetCallInProgress(keyCallCheck, false);
                        if (that.kpiValueFetchDeferred) {
                            that.kpiValueFetchDeferred = false;
                            var variantData = sap.ushell.components.tiles.indicatorTileUtils.util.prepareFilterStructure(
                                this.DEFINITION_DATA.EVALUATION_FILTERS, this.DEFINITION_DATA.ADDITIONAL_FILTERS);
                            var oQuery = sap.ushell.components.tiles.indicatorTileUtils.util.prepareQueryServiceUri(
                                that.oRunTimeODataModel, sEntitySet, sMeasure, null, variantData);
                            if (oQuery) {
                                this.QUERY_SERVICE_MODEL = oQuery.model;
                                this.queryUriForKpiValue = oQuery.uri;
                                this.queryServiceUriODataReadRef = this.QUERY_SERVICE_MODEL.read(oQuery.uri, null, null, true, function (data) {
                                    that.backEndCallMade = true;
                                    that.kpiValueFetchDeferred = true;
                                    sap.ushell.components.tiles.indicatorTileUtils.util.setUnsetCallInProgress(keyCallCheck, true);
                                    if (data && data.results && data.results.length && data.results[0][that.DEFINITION_DATA.EVALUATION.COLUMN_NAME] != null) {
                                        kpiValue = data.results[0][that.DEFINITION_DATA.EVALUATION.COLUMN_NAME];
                                        var writeData = {};
                                        if (oQuery.unit[0]) {
                                            that._updateTileModel({
                                                unit: data.results[0][oQuery.unit[0].name]
                                            });
                                            writeData.uom = data.results[0][oQuery.unit[0].name];
                                        }
                                        if (that.oConfig.TILE_PROPERTIES.frameType == "TwoByOne") {
                                            writeData.numericValue = kpiValue;
                                        } else {
                                            writeData.value = kpiValue;
                                        }
                                        if (that.DEFINITION_DATA.EVALUATION.VALUES_SOURCE == "MEASURE") {
                                            sThresholdObject.criticalHighValue = data.results[0][sThresholdObject.sCriticalHigh];
                                            sThresholdObject.criticalLowValue = data.results[0][sThresholdObject.sCriticalLow];
                                            sThresholdObject.warningHighValue = data.results[0][sThresholdObject.sWarningHigh];
                                            sThresholdObject.warningLowValue = data.results[0][sThresholdObject.sWarningLow];
                                            sThresholdObject.targetValue = data.results[0][sThresholdObject.sTarget];
                                            sThresholdObject.trendValue = data.results[0][sThresholdObject.sTrend];
                                        } else if (that.DEFINITION_DATA.EVALUATION.VALUES_SOURCE == "RELATIVE") {
                                            sThresholdObject.targetValue = Number(data.results[0][sThresholdObject.sTarget]);
                                            sThresholdObject.criticalHighValue = sThresholdObject.targetValue * sThresholdObject.criticalHighValue / 100;
                                            sThresholdObject.criticalLowValue = sThresholdObject.targetValue * sThresholdObject.criticalLowValue / 100;
                                            sThresholdObject.warningHighValue = sThresholdObject.targetValue * sThresholdObject.warningHighValue / 100;
                                            sThresholdObject.warningLowValue = sThresholdObject.targetValue * sThresholdObject.warningLowValue / 100;
                                            sThresholdObject.trendValue = Number(data.results[0][sThresholdObject.sTrend]);
                                        }
                                        writeData.cl = sThresholdObject.criticalLowValue;
                                        writeData.ch = sThresholdObject.criticalHighValue;
                                        writeData.wl = sThresholdObject.warningLowValue;
                                        writeData.wh = sThresholdObject.warningHighValue;
                                        writeData.trend = sThresholdObject.trendValue;
                                        writeData.target = sThresholdObject.targetValue;
                                        writeData.isCurM = that.isCurrencyMeasure(that.oConfig.EVALUATION.COLUMN_NAME);

                                        var cacheData = {};

                                        cacheData.ChipId = that.oConfig.TILE_PROPERTIES.id;
                                        cacheData.Data = JSON.stringify(writeData);
                                        cacheData.CacheMaxAge = Number(that.chipCacheTime);
                                        cacheData.CacheMaxAgeUnit = that.chipCacheTimeUnit;
                                        cacheData.CacheType = 1;

                                        var localCache = that.getLocalCache(cacheData);

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
                                                            that.setTimeStamp(that.cacheTime);
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
                                                    if (that.oKpiTileView.getViewName() == "sap.ushell.components.tiles.indicatornumeric.NumericTile") {
                                                        avilableCacheData.leftData = writeData;
                                                    } else {
                                                        avilableCacheData.rightData = writeData;
                                                    }
                                                } tempCacheData.Data = JSON.stringify(avilableCacheData);
                                                sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(that.oConfig.TILE_PROPERTIES.id, tempCacheData);
                                            } else {
                                                avilableCacheData = {};
                                                if (that.oKpiTileView.getViewName() == "sap.ushell.components.tiles.indicatornumeric.NumericTile") {
                                                    avilableCacheData.leftData = writeData;
                                                } else {
                                                    avilableCacheData.rightData = writeData;
                                                }
                                                localCache.Data = JSON.stringify(avilableCacheData);
                                                sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(that.oConfig.TILE_PROPERTIES.id, localCache);
                                            }
                                            that.cacheWriteData = writeData;
                                        }

                                        that.cacheTime = sap.ushell.components.tiles.indicatorTileUtils.util.getUTCDate();
                                        that.updateDatajobScheduled = false;

                                        var key = that.oConfig.TILE_PROPERTIES.id + "data";
                                        var runningJob = sap.ushell.components.tiles.indicatorTileUtils.util.getScheduledJob(key);
                                        if (runningJob) {
                                            clearTimeout(runningJob);
                                            runningJob = undefined;
                                        }
                                        callback.call(that, kpiValue, sThresholdObject);
                                    } else {
                                        sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(that.oConfig.TILE_PROPERTIES.id, { empty: "empty" });
                                        that.setNoData();
                                    }
                                }, function (eObject) {
                                    that.kpiValueFetchDeferred = true;
                                    sap.ushell.components.tiles.indicatorTileUtils.util.setUnsetCallInProgress(keyCallCheck, true);
                                    if (eObject && eObject.response) {
                                        Log.error(eObject.message + " : " + eObject.request.requestUri);
                                        fnError.call(that, eObject);
                                    }
                                });
                            } else {
                                that.kpiValueFetchDeferred = true;
                                sap.ushell.components.tiles.indicatorTileUtils.util.setUnsetCallInProgress(keyCallCheck, true);
                                that.logError("Error Preparing Query Service URI");
                            }
                        }
                    } else if (that.DEFINITION_DATA.TILE_PROPERTIES.frameType == FrameType.OneByOne) {
                        var kpiData;
                        if (cachedValue && cachedValue.Data) {
                            kpiData = cachedValue.Data && JSON.parse(cachedValue.Data);
                            kpiValue = kpiData.value;
                            if (kpiData.uom) {
                                that._updateTileModel({
                                    unit: kpiData.uom
                                });
                            }
                            if (that.DEFINITION_DATA.EVALUATION.VALUES_SOURCE == "MEASURE") {
                                sThresholdObject.criticalHighValue = kpiData.ch;
                                sThresholdObject.criticalLowValue = kpiData.cl;
                                sThresholdObject.warningHighValue = kpiData.wh;
                                sThresholdObject.warningLowValue = kpiData.wl;
                                sThresholdObject.targetValue = kpiData.target;
                                sThresholdObject.trendValue = kpiData.trend;
                            } else if (that.DEFINITION_DATA.EVALUATION.VALUES_SOURCE == "RELATIVE") {
                                sThresholdObject.targetValue = Number(kpiData.target);
                                sThresholdObject.criticalHighValue = sThresholdObject.targetValue * sThresholdObject.ch / 100;
                                sThresholdObject.criticalLowValue = sThresholdObject.targetValue * sThresholdObject.cl / 100;
                                sThresholdObject.warningHighValue = sThresholdObject.targetValue * sThresholdObject.wh / 100;
                                sThresholdObject.warningLowValue = sThresholdObject.targetValue * sThresholdObject.wl / 100;
                                sThresholdObject.trendValue = Number(kpiData.trend);
                            }
                            that.cacheTime = cachedValue.CachedTime;
                            if (that.chipCacheTime &&
                                !sap.ushell.components.tiles.indicatorTileUtils.util.isDualTile(that.oConfig)) {
                                jQuery.proxy(that.setTimeStamp(cachedValue.CachedTime), that);
                            }
                            callback.call(that, kpiValue, sThresholdObject);
                        } else {
                            that.setNoData();
                        }
                    } else if (cachedValue && cachedValue.Data) {
                        kpiData = cachedValue.Data && JSON.parse(cachedValue.Data);
                        if (that.oKpiTileView.getViewName() == "sap.ushell.components.tiles.indicatornumeric.NumericTile") {
                            kpiData = kpiData.leftData;
                        } else {
                            kpiData = kpiData.rightData;
                        }
                        kpiValue = kpiData.numericValue;
                        if (kpiData.unit) {
                            that._updateTileModel({
                                unit: kpiData.unit
                            });
                        }
                        if (that.DEFINITION_DATA.EVALUATION.VALUES_SOURCE == "MEASURE") {
                            sThresholdObject.criticalHighValue = kpiData.ch;
                            sThresholdObject.criticalLowValue = kpiData.cl;
                            sThresholdObject.warningHighValue = kpiData.wh;
                            sThresholdObject.warningLowValue = kpiData.wl;
                            sThresholdObject.targetValue = kpiData.target;
                            sThresholdObject.trendValue = kpiData.trend;
                        } else if (that.DEFINITION_DATA.EVALUATION.VALUES_SOURCE == "RELATIVE") {
                            sThresholdObject.targetValue = Number(kpiData.target);
                            sThresholdObject.criticalHighValue = sThresholdObject.targetValue * sThresholdObject.criticalHighValue / 100;
                            sThresholdObject.criticalLowValue = sThresholdObject.targetValue * sThresholdObject.criticalLowValue / 100;
                            sThresholdObject.warningHighValue = sThresholdObject.targetValue * sThresholdObject.warningHighValue / 100;
                            sThresholdObject.warningLowValue = sThresholdObject.targetValue * sThresholdObject.warningLowValue / 100;
                            sThresholdObject.trendValue = Number(kpiData.trend);
                        }
                        that.cacheTime = cachedValue.CachedTime;
                        if (that.chipCacheTime &&
                            !sap.ushell.components.tiles.indicatorTileUtils.util.isDualTile(that.oConfig)) {
                            jQuery.proxy(that.setTimeStamp(cachedValue.CachedTime), that);
                        }
                        callback.call(that, kpiValue, sThresholdObject);
                    } else {
                        that.setNoData();
                    }
                }
            } catch (e) {
                that.logError(e);
            }
        },

        getRunTimeODataModel: function (sUrl, fnS) {
            if (window["sap-ushell-config"].cacheBusting) {
                sUrl = sap.ushell.components.tiles.indicatorTileUtils.util.cacheBustingMechanism(sUrl);
            }
            if (!this.oRunTimeODataModel) {
                this.oRunTimeODataModel = sap.ushell.components.tiles.indicatorTileUtils.util.getODataModelByServiceUri(sUrl);
            }
            if (this.oRunTimeODataModel.getServiceMetadata()) {
                fnS();
            } else {
                this.oRunTimeODataModel.attachMetadataLoaded(fnS);
            }
        },

        parse_sapclient: function () {
            var i, SAP_CLIENT, reserved_placeholder, filters, filter;
            SAP_CLIENT = "P_SAPClient";
            reserved_placeholder = "$$$";
            filters = this.oConfig.EVALUATION_FILTERS;

            /* expected syntax
             *  evaluationData
             *  |-- FILTERS
             *  |   |-- results[]
             *  |       |-- NAME
             *  |       |-- VALUE_1
             */

            if (filters.constructor !== Array) {
                return;
            }

            if (filters.length < 1) {
                return;
            }
            for (i in filters) {
                filter = filters[i];
                if (filter.NAME === SAP_CLIENT && filter.VALUE_1 === reserved_placeholder) {
                    break;
                }
                filter = null;
            }
            if (filter) {
                jQuery.when(sap.ushell.components.tiles.indicatorTileUtils.util.getHanaClient()).done(function (client) {
                    filter.VALUE_1 = client;
                });
            }
        },

        fetchEvaluation: function (chipConfig, callback, bRefreshClick, isAutoRefresh) {
            var that = this;
            var sPlatform = this.oConfig.TILE_PROPERTIES.sb_metadata || "HANA";
            that.DEFINITION_DATA = chipConfig;
            that._updateTileModel(this.DEFINITION_DATA);
            var isRefreshClick = sap.ushell.components.tiles.indicatorTileUtils.util.getBoolValue(bRefreshClick);
            if ((that.oTileApi.visible.isVisible() && !that.firstTimeVisible) || isRefreshClick || isAutoRefresh) {
                jQuery.when(sap.ushell.components.tiles.indicatorTileUtils.util.getFrontendCache(chipConfig, that.oTileApi)).done(function (isCached) {
                    that.firstTimeVisible = true;
                    isCached = sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(that.oConfig.TILE_PROPERTIES.id);
                    if (isCached || Number(that.oTileApi.configuration.getParameterValueAsString("isSufficient"))) {
                        callback.call();
                    } else {
                        try {
                            if (!sap.ushell.components.tiles.indicatorTileUtils.util.isDualTile(that.oConfig) || !that.dataCallInProgress) {
                                that.dataCallInProgress = true;
                                var evaluationData = sap.ushell.components.tiles.indicatorTileUtils.cache.getEvaluationById(that.oConfig.TILE_PROPERTIES.id);
                                if (evaluationData) {
                                    that.oConfig.EVALUATION_FILTERS = evaluationData.EVALUATION_FILTERS;
                                    callback.call();
                                } else if (that.evaluationFetchDeferred) {
                                    that.evaluationFetchDeferred = false;
                                    sap.ushell.components.tiles.indicatorTileUtils.util.getFilterFromRunTimeService(that.oConfig, that.oTileApi, function (filter) {
                                        that.evaluationFetchDeferred = true;
                                        that.oConfig.EVALUATION_FILTERS = filter;
                                        if (sPlatform.toUpperCase() === "HANA") {
                                            that.parse_sapclient();
                                        }
                                        sap.ushell.components.tiles.indicatorTileUtils.cache.setEvaluationById(that.oConfig.TILE_PROPERTIES.id, that.oConfig);
                                        callback.call();
                                    });
                                }
                            }
                        } catch (e) {
                            that.evaluationFetchDeferred = true;
                            that.logError("no evaluation data");
                        }
                    }
                }).fail(function () {
                    that.firstTimeVisible = true;
                    if (Number(that.oTileApi.configuration.getParameterValueAsString("isSufficient"))) {
                        callback.call();
                    } else {
                        try {
                            var evaluationData = sap.ushell.components.tiles.indicatorTileUtils.cache.getEvaluationById(that.oConfig.TILE_PROPERTIES.id);
                            if (evaluationData) {
                                that.oConfig.EVALUATION_FILTERS = evaluationData.EVALUATION_FILTERS;
                                callback.call();
                            } else {
                                sap.ushell.components.tiles.indicatorTileUtils.util.getFilterFromRunTimeService(that.oConfig, that.oTileApi, function (filter) {
                                    that.oConfig.EVALUATION_FILTERS = filter;
                                    if (sPlatform.toUpperCase() === "HANA") {
                                        that.parse_sapclient();
                                    }
                                    sap.ushell.components.tiles.indicatorTileUtils.cache.setEvaluationById(that.oConfig.TILE_PROPERTIES.id, that.oConfig);
                                    callback.call();
                                });
                            }

                        } catch (e) {
                            that.logError("no evaluation data");
                        }
                    }
                });
            }
        },

        refreshHandler: function (bRefreshClick, bAutoRefresh) {
            var that = this;
            var isRefreshClick = sap.ushell.components.tiles.indicatorTileUtils.util.getBoolValue(bRefreshClick);
            var isAutoRefresh = sap.ushell.components.tiles.indicatorTileUtils.util.getBoolValue(bAutoRefresh);
            if (!that.firstTimeVisible || isRefreshClick || isAutoRefresh) {
                that.fetchEvaluation(that.oConfig, function () {
                    var sUrl;
                    if (that.oConfig.TILE_PROPERTIES.tileType == "NT" ||
                        that.oConfig.TILE_PROPERTIES.tileType == "AT" ||
                        that.oKpiTileView.getViewName() == "sap.ushell.components.tiles.indicatornumeric.NumericTile" ||
                        that.oKpiTileView.getViewName() == "sap.ushell.components.tiles.indicatordeviation.DeviationTile") {
                        sUrl = that.oTileApi.url.addSystemToServiceUrl(that.oConfig.EVALUATION.ODATA_URL);
                        that.getRunTimeODataModel(sUrl, function () {
                            if (that.KPI_VALUE_REQUIRED) {
                                that.fetchKpiValue(function (kpiValue, sThresholdObject) {
                                    this.KPIVALUE = kpiValue;
                                    that.doProcess(kpiValue, sThresholdObject);
                                }, that.logError, bRefreshClick, isAutoRefresh);
                            } else {
                                that.doProcess();
                            }
                        });
                    } else {
                        sUrl = that.oTileApi.url.addSystemToServiceUrl(that.oConfig.EVALUATION.ODATA_URL);
                        that.getRunTimeODataModel(sUrl, function () {
                            if (that.KPI_VALUE_REQUIRED) {
                                that.doProcess(that.KPIVALUE, that.setThresholdValues());
                            } else {
                                that.doProcess(isRefreshClick, isAutoRefresh);
                            }
                        });
                    }
                }, bRefreshClick, isAutoRefresh);
            }
        },

        visibleHandler: function (isVisible) {
            if (!isVisible) {
                this.firstTimeVisible = false;
                sap.ushell.components.tiles.indicatorTileUtils.util.abortPendingODataCalls(this.queryServiceUriODataReadRef);
                sap.ushell.components.tiles.indicatorTileUtils.util.abortPendingODataCalls(this.trendChartODataReadRef);
                sap.ushell.components.tiles.indicatorTileUtils.util.abortPendingODataCalls(this.comparisionChartODataRef);
            }
            if (isVisible) {
                this.refreshHandler(this);
            }
        },

        getChipConfiguration: function (callback) {
            var that = this;
            try {
                sap.ushell.components.tiles.indicatorTileUtils.util.getParsedChip(
                    that.oTileApi.configuration.getParameterValueAsString("tileConfiguration"), that.oTileApi.preview.isEnabled(), function (config) {
                        that.oConfig = config;
                        var title = sap.ushell.components.tiles.indicatorTileUtils.util.getChipTitle(that.oConfig);
                        var subtitle = sap.ushell.components.tiles.indicatorTileUtils.util.getChipSubTitle(that.oConfig);
                        if (that.oTileApi.search) {
                            that.oTileApi.search.setKeywords([title, subtitle]);
                        }
                        if (that.oTileApi.preview) {
                            that.oTileApi.preview.setTargetUrl(sap.ushell.components.tiles.indicatorTileUtils.util.getNavigationTarget(that.oConfig, that.system));
                        }
                        callback.call();
                    });
            } catch (e) {
                that.logError(e.message);
            }
        },

        onAfterTileRendering: function () {
            var that = this;
            this.firstTimeVisible = false;
            this.oKpiTileView = this.getView();
            this.updateDatajobScheduled = false;
            this.updateTimeStampjobScheduled = false;
            this.oViewData = this.oKpiTileView.getViewData();
            this.tilePressed = false;
            this.kpiValueFetchDeferred = true;
            this.evaluationFetchDeferred = true;
            this.backEndCallMade = false;
            if (!sap.ushell.components.tiles.utils) {
                // TODO: migration not possible. jQuery.sap.require is deprecated. Use <code>sap.ui.require</code> instead.
                sap.ui.require("sap.ushell.components.tiles.utils"); // TODO: remove jQuery.sap
            }
            this.oResourceBundle = sap.ushell.components.tiles.utils.getResourceBundleModel().getResourceBundle();
            this.oTileApi = this.oViewData.chip; // instance specific CHIP API

            this.system = this.oTileApi.url.getApplicationSystem();
            this.oKpiTileView.oGenericTile.setState(LoadState.Loading);

            this.getChipConfiguration(function () {
                var navTarget;
                that.chipCacheTime = sap.ushell.components.tiles.indicatorTileUtils.util.getCachingTime(that.oConfig);
                that.chipCacheTimeUnit = sap.ushell.components.tiles.indicatorTileUtils.util.getCachingTimeUnit(that.oConfig);
                if (that.oTileApi.preview.isEnabled()) {
                    that.doDummyProcess();
                    that.oKpiTileView.oGenericTile.attachPress(function () {
                        MessageToast.show(that.oResourceBundle.getText("sb.NavigationHelp"));
                    });
                } else if (that.oConfig.BLANKTILE || that.oConfig.TILE_PROPERTIES.blankTile) {
                    that.doDummyProcess();
                    navTarget = sap.ushell.components.tiles.indicatorTileUtils.util.getNavigationTarget(that.oConfig, that.system);
                    that.oKpiTileView.oGenericTile.$().wrap("<a href ='" + navTarget + "'></a>");
                    that.oKpiTileView.oGenericTile.attachPress(function () {
                        that.tilePressed = true;
                        sap.ushell.components.tiles.indicatorTileUtils.util.abortPendingODataCalls(that.queryServiceUriODataReadRef);
                        sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(that.oConfig.TILE_PROPERTIES.id, null);
                        window.location.hash = navTarget;
                    });
                } else {
                    if (that.oTileApi.visible && !sap.ushell.components.tiles.indicatorTileUtils.util.isDualTile(that.oConfig)) {
                        that.oTileApi.visible.attachVisible(that.visibleHandler.bind(that));
                    }
                    navTarget = sap.ushell.components.tiles.indicatorTileUtils.util.getNavigationTarget(that.oConfig, that.system);
                    that.oKpiTileView.oGenericTile.$().wrap("<a href ='" + navTarget + "></a>").style = "display:block;";
                    that.oKpiTileView.oGenericTile.attachPress(function () {
                        that.tilePressed = true;
                        sap.ushell.components.tiles.indicatorTileUtils.util.abortPendingODataCalls(that.queryServiceUriODataReadRef);
                        sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(that.oConfig.TILE_PROPERTIES.id, null);
                        window.location.hash = navTarget;
                    });

                    if (!sap.ushell.components.tiles.indicatorTileUtils.util.isDualTile(that.oConfig)) {
                        that.oKpiTileView.oNVConfS.attachRefresh(function () {
                            that.oKpiTileView.oGenericTile.setState(LoadState.Loading);
                            jQuery.proxy(that.refreshHandler(true), that);
                        });
                    }

                    that.fetchEvaluation(that.oConfig, function () {
                        that.DEFINITION_DATA = that.oConfig;
                        var sUrl = that.oTileApi.url.addSystemToServiceUrl(that.oConfig.EVALUATION.ODATA_URL);
                        var chipUpdateTime = that.oTileApi.configuration.getParameterValueAsString("timeStamp");
                        var isCacheValid = sap.ushell.components.tiles.indicatorTileUtils.util.isCacheValid(that.oConfig.TILE_PROPERTIES.id,
                            chipUpdateTime, that.chipCacheTime, that.chipCacheTimeUnit, that.tilePressed);
                        if (!isCacheValid || that.getView().getViewData().refresh) {
                            that.getRunTimeODataModel(sUrl, function () {
                                if (that.KPI_VALUE_REQUIRED) {
                                    that.fetchKpiValue(function (kpiValue, sThresholdObject) {
                                        this.KPIVALUE = kpiValue;
                                        that.doProcess(kpiValue, sThresholdObject);
                                    }, that.logError);
                                } else {
                                    that.doProcess();
                                }
                            });
                        } else if (that.KPI_VALUE_REQUIRED) {
                            that.fetchKpiValue(function (kpiValue, sThresholdObject) {
                                this.KPIVALUE = kpiValue;
                                that.doProcess(kpiValue, sThresholdObject);
                            }, that.logError);
                        } else {
                            that.doProcess();
                        }
                    });
                }
            });
        },

        onAfterRendering: function () {
            this.onAfterTileRendering();
        },

        _setLocalModelToTile: function () {
            if (!this.getTile().getModel()) {
                this.getTile().setModel(new JSONModel({}));
            }
        },

        autoFormatter: function (n, isACurrencyMeasure) {
            isACurrencyMeasure = isACurrencyMeasure || false;
            if (!n) {
                return "";
            }
            return sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(
                Number(n),
                this.oConfig.EVALUATION.SCALING,
                this.oConfig.EVALUATION.DECIMAL_PRECISION,
                isACurrencyMeasure
            );
        },

        setToolTip: function (applyColor, calculatedValueForScaling, tileType) {
            var that = this,
                oControl,
                sThresholdObject = this.setThresholdValues(),
                measure = this.oConfig.EVALUATION.COLUMN_NAME,
                isACurrencyMeasure = this.isCurrencyMeasure(measure),
                valueObj;
            if (tileType == "CONT" || tileType == "COMP") {
                if (this.oKpiTileView.getContent()[0].getTileContent().length) {
                    oControl = that.oKpiTileView.getContent()[0].getTileContent()[0].getContent();
                    var m1, m2, m3, v1, v2, v3, c1, c2, c3;
                    if (calculatedValueForScaling && calculatedValueForScaling[0]) {
                        m1 = calculatedValueForScaling[0].title;
                        v1 = this.autoFormatter(calculatedValueForScaling[0].value, isACurrencyMeasure);
                        c1 = sap.ushell.components.tiles.indicatorTileUtils.util.getSemanticColorName(calculatedValueForScaling[0].color);
                    }
                    if (calculatedValueForScaling && calculatedValueForScaling[1]) {
                        m2 = calculatedValueForScaling[1].title;
                        v2 = this.autoFormatter(calculatedValueForScaling[1].value, isACurrencyMeasure);
                        c2 = sap.ushell.components.tiles.indicatorTileUtils.util.getSemanticColorName(calculatedValueForScaling[1].color);
                    }
                    if (calculatedValueForScaling && calculatedValueForScaling[2]) {
                        m3 = calculatedValueForScaling[2].title;
                        v3 = this.autoFormatter(calculatedValueForScaling[2].value, isACurrencyMeasure);
                        c3 = sap.ushell.components.tiles.indicatorTileUtils.util.getSemanticColorName(calculatedValueForScaling[2].color);
                    }

                    var orderByObject = {};
                    orderByObject["0"] = this.oConfig.EVALUATION.COLUMN_NAME + ",asc";
                    orderByObject["1"] = this.oConfig.EVALUATION.COLUMN_NAME + ",desc";
                    orderByObject["2"] = this.oConfig.TILE_PROPERTIES.dimension + ",asc";
                    orderByObject["3"] = this.oConfig.TILE_PROPERTIES.dimension + ",desc";
                    var orderByElement = orderByObject[this.oConfig.TILE_PROPERTIES.sortOrder || "0"].split(",");

                    valueObj = {
                        measure: this.oConfig.EVALUATION.COLUMN_NAME,
                        contributionTile: orderByElement,
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
                    sap.ushell.components.tiles.indicatorTileUtils.util.setTooltipInTile(oControl, tileType, valueObj);
                }
            } else {
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
                valueObj = {
                    status: status,
                    actual: this.autoFormatter(calculatedValueForScaling, isACurrencyMeasure),
                    target: this.autoFormatter(sThresholdObject.targetValue, isACurrencyMeasure),
                    cH: this.autoFormatter(sThresholdObject.criticalHighValue, isACurrencyMeasure),
                    wH: this.autoFormatter(sThresholdObject.warningHighValue, isACurrencyMeasure),
                    wL: this.autoFormatter(sThresholdObject.warningLowValue, isACurrencyMeasure),
                    cL: this.autoFormatter(sThresholdObject.criticalLowValue, isACurrencyMeasure)
                };
                oControl = that.oKpiTileView.getContent()[0].getTileContent()[0] && that.oKpiTileView.getContent()[0].getTileContent()[0].getContent();
                sap.ushell.components.tiles.indicatorTileUtils.util.setTooltipInTile(oControl, tileType, valueObj);
            }
        },

        getTrendColor: function (sThresholdObj) {
            var that = this,
                warningLowValue,
                criticalLowValue,
                warningHighValue,
                criticalHighValue;
            try {
                var improvementDirection = this.DEFINITION_DATA.EVALUATION.GOAL_TYPE;
                var returnColor = ValueColor.Neutral;
                if (improvementDirection === "MI") {
                    if (sThresholdObj.criticalHighValue && sThresholdObj.warningHighValue) {
                        criticalHighValue = Number(sThresholdObj.criticalHighValue);
                        warningHighValue = Number(sThresholdObj.warningHighValue);
                        if (this.CALCULATED_KPI_VALUE < warningHighValue) {
                            returnColor = ValueColor.Good;
                        } else if (this.CALCULATED_KPI_VALUE <= criticalHighValue) {
                            returnColor = ValueColor.Critical;
                        } else {
                            returnColor = ValueColor.Error;
                        }
                    }
                } else if (improvementDirection === "MA") {
                    if (sThresholdObj.criticalLowValue && sThresholdObj.warningLowValue) {
                        criticalLowValue = Number(sThresholdObj.criticalLowValue);
                        warningLowValue = Number(sThresholdObj.warningLowValue);
                        if (this.CALCULATED_KPI_VALUE < criticalLowValue) {
                            returnColor = ValueColor.Error;
                        } else if (this.CALCULATED_KPI_VALUE <= warningLowValue) {
                            returnColor = ValueColor.Critical;
                        } else {
                            returnColor = ValueColor.Good;
                        }
                    }
                } else if (sThresholdObj.warningLowValue && sThresholdObj.warningHighValue && sThresholdObj.criticalLowValue && sThresholdObj.criticalHighValue) {
                    criticalHighValue = Number(sThresholdObj.criticalHighValue);
                    warningHighValue = Number(sThresholdObj.warningHighValue);
                    warningLowValue = Number(sThresholdObj.warningLowValue);
                    criticalLowValue = Number(sThresholdObj.criticalLowValue);
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

        getTrendIndicator: function (trendValue) {
            var that = this;
            trendValue = Number(trendValue);
            try {
                var trendIndicator = DeviationIndicator.None;
                if (trendValue > this.CALCULATED_KPI_VALUE) {
                    trendIndicator = DeviationIndicator.Down;
                } else if (trendValue < this.CALCULATED_KPI_VALUE) {
                    trendIndicator = DeviationIndicator.Up;
                }
                return trendIndicator;
            } catch (e) {
                that.logError(e);
            }
        },

        setTextInTile: function () {
            var that = this;
            var titleObj = sap.ushell.components.tiles.indicatorTileUtils.util.getTileTitleSubtitle(this.oTileApi);
            this._updateTileModel({

                header: titleObj.title || sap.ushell.components.tiles.indicatorTileUtils.util.getChipTitle(that.oConfig),
                subheader: titleObj.subTitle || sap.ushell.components.tiles.indicatorTileUtils.util.getChipSubTitle(that.oConfig)
            });
        },

        _getEvaluationThresholdMeasures: function () {
            var thresholdMeasuresArray = [];
            thresholdMeasuresArray.push(this.oConfig.EVALUATION.COLUMN_NAME);
            if (this.oConfig.EVALUATION.VALUES_SOURCE === "MEASURE") {
                var thresholdObjArray = this.oConfig.EVALUATION_VALUES;
                if (thresholdObjArray && thresholdObjArray.length) {
                    for (var i = 0; i < thresholdObjArray.length; i++) {
                        if ((thresholdObjArray[i]).COLUMN_NAME && !((thresholdObjArray[i]).FIXED)) {
                            thresholdMeasuresArray.push((thresholdObjArray[i]).COLUMN_NAME);
                        }
                    }
                }
            } return thresholdMeasuresArray;
        },

        onExit: function () {
            sap.ushell.components.tiles.indicatorTileUtils.util.abortPendingODataCalls(this.queryServiceUriODataReadRef);
            sap.ushell.components.tiles.indicatorTileUtils.util.abortPendingODataCalls(this.trendChartODataReadRef);
            sap.ushell.components.tiles.indicatorTileUtils.util.abortPendingODataCalls(this.comparisionChartODataRef);
        }
    });
    return generic;
});
