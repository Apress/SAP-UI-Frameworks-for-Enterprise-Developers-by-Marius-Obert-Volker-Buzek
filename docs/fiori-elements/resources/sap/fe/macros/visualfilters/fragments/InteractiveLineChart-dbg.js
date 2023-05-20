/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor","sap/fe/core/helpers/StableIdHelper","../InteractiveChartHelper"],function(e,t,a){"use strict";var r={};var i=t.generate;var o=e.xml;function s(e){const t=a.getInteractiveChartProperties(e);if(t){var r,s,n,l,u;const a=i([(r=e.metaPath)===null||r===void 0?void 0:r.getPath()]);const c=(s=e.chartAnnotation)===null||s===void 0?void 0:s.Dimensions[0];return o`<InteractiveLineChart
                        xmlns="sap.suite.ui.microchart"
                        xmlns:core="sap.ui.core"
                        xmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
                        core:require="{VisualFilterRuntime: 'sap/fe/macros/visualfilters/VisualFilterRuntime'}"
                        visible="{= ${t.showErrorExpression}}"
                        selectionChanged="VisualFilterRuntime.selectionChanged"
                        showError="{= ${t.showErrorExpression}}"
                        errorMessageTitle="${t.errorMessageTitleExpression}"
                        errorMessage="${t.errorMessageExpression}"
                        points="${t.aggregationBinding}"
                        customData:outParameter="${e.outParameter}"
                        customData:valuelistProperty="${e.valuelistProperty}"
                        customData:multipleSelectionAllowed="${e.multipleSelectionAllowed}"
                        customData:dimension="${c===null||c===void 0?void 0:(n=c.$target)===null||n===void 0?void 0:n.name}"
                        customData:dimensionText="${c===null||c===void 0?void 0:(l=c.$target.annotations.Common)===null||l===void 0?void 0:(u=l.Text)===null||u===void 0?void 0:u.path}"
                        customData:measure="${e.chartMeasure}"
                        customData:scalefactor="${t.scalefactor}"
                        customData:uom="${t.uom}"
                        customData:inParameters="${t.inParameters}"
                        customData:inParameterConditions="${t.inParameterFilters}"
                        customData:dimensionType="${c===null||c===void 0?void 0:c.$target.type}"
                        customData:selectionVariantAnnotation="${t.selectionVariantAnnotation}"
                        customData:required="${e.required}"
                        customData:showOverlayInitially="${e.showOverlayInitially}"
                        customData:requiredProperties="${e.requiredProperties}"
                        customData:infoPath="${a}"
                        customData:parameters="${t.stringifiedParameters}"
                        customData:draftSupported="${e.draftSupported}"
                    >
                        <points>
                            <InteractiveLineChartPoint
                                core:require="{VisualFilterRuntime: 'sap/fe/macros/visualfilters/VisualFilterRuntime'}"
                                label="${t.chartLabel}"
                                value="${t.measure}"
                                displayedValue="${t.displayedValue}"
                                color="${t.color}"
                                selected="{path: '$field>/conditions', formatter: 'sap.fe.macros.visualfilters.VisualFilterRuntime.getAggregationSelected'}"
                            />
                        </points>
             </InteractiveLineChart>`}return o``}r.getInteractiveLineChartTemplate=s;return r},false);