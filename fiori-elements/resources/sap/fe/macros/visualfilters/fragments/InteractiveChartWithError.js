/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor"],function(r){"use strict";var e={};var i=r.xml;function s(r){const e=r.chartAnnotation;if(r.chartMeasure&&e!==null&&e!==void 0&&e.Dimensions&&e.Dimensions[0]){return i`<InteractiveLineChart
                        xmlns="sap.suite.ui.microchart"
                        xmlns:core="sap.ui.core"
                        core:require="{VisualFilterRuntime: 'sap/fe/macros/visualfilters/VisualFilterRuntime'}"
                        showError="${r.showError}"
                        errorMessageTitle="${r.errorMessageTitle}"
                        errorMessage="${r.errorMessage}"
                    />`}return i``}e.getInteractiveChartWithErrorTemplate=s;return e},false);