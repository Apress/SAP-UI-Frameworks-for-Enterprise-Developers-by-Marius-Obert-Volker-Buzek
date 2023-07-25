/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor","sap/fe/core/helpers/StableIdHelper","../InteractiveChartHelper"],function(e,t,a){"use strict";var r={};var i=t.generate;var s=e.xml;function o(e){const t=a.getInteractiveChartProperties(e);if(t){var r,o,l,n;const a=i([(r=e.metaPath)===null||r===void 0?void 0:r.getPath()]);const u=(o=e.chartAnnotation)===null||o===void 0?void 0:o.Dimensions[0];return s`<InteractiveBarChart
                            xmlns="sap.suite.ui.microchart"
                            xmlns:core="sap.ui.core"
                            xmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
                            core:require="{VisualFilterRuntime: 'sap/fe/macros/visualfilters/VisualFilterRuntime'}"
                            visible="{= ${t.showErrorExpression}}"
                            selectionChanged="VisualFilterRuntime.selectionChanged"
                            showError="{= ${t.showErrorExpression}}"
                            errorMessageTitle="${t.errorMessageTitleExpression}"
                            errorMessage="${t.errorMessageExpression}"
                            bars="${t.aggregationBinding}"
                            customData:outParameter="${e.outParameter}"
                            customData:valuelistProperty="${e.valuelistProperty}"
                            customData:multipleSelectionAllowed="${e.multipleSelectionAllowed}"
                            customData:dimension="${u===null||u===void 0?void 0:u.$target.name}"
                            customData:dimensionText="${u===null||u===void 0?void 0:(l=u.$target.annotations.Common)===null||l===void 0?void 0:(n=l.Text)===null||n===void 0?void 0:n.path}"
                            customData:scalefactor="${t.scalefactor}"
                            customData:measure="${e.chartMeasure}"
                            customData:uom="${t.uom}"
                            customData:inParameters="${t.inParameters}"
                            customData:inParameterFilters="${t.inParameterFilters}"
                            customData:dimensionType="${u===null||u===void 0?void 0:u.$target.type}"
                            customData:selectionVariantAnnotation="${t.selectionVariantAnnotation}"
                            customData:required="${e.required}"
                            customData:showOverlayInitially="${e.showOverlayInitially}"
                            customData:requiredProperties="${e.requiredProperties}"
                            customData:infoPath="${a}"
                            customData:parameters="${t.stringifiedParameters}"
                            customData:draftSupported="${e.draftSupported}"
                        >
                            <bars>
                                <InteractiveBarChartBar
                                    core:require="{VisualFilterRuntime: 'sap/fe/macros/visualfilters/VisualFilterRuntime'}"
                                    label="${t.chartLabel}"
                                    value="${t.measure}"
                                    displayedValue="${t.displayedValue}"
                                    color="${t.color}"
                                    selected="{path: '$field>/conditions', formatter: 'sap.fe.macros.visualfilters.VisualFilterRuntime.getAggregationSelected'}"
                                />
                            </bars>
                        </InteractiveBarChart>`}return s``}r.getInteractiveBarChartTemplate=o;return r},false);