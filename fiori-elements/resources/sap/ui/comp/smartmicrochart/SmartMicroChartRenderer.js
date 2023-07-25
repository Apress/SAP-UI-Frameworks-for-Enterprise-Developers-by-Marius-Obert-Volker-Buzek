/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define([],function(){"use strict";var e={apiVersion:2};e.render=function(e,i){if(i._bIsInitialized){e.openStart("div",i);if(i.getIsResponsive()){e.class("sapSuiteUiSmartMicroChartResponsive")}e.openEnd();e.renderControl(i.getAggregation("_chart"));e.close("div")}};return e},true);