import { PathAnnotationExpression } from "@sap-ux/vocabularies-types";
import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import InteractiveChartHelper from "../InteractiveChartHelper";
import VisualFilterBlock from "../VisualFilter.block";

export function getInteractiveBarChartTemplate(visualFilter: VisualFilterBlock) {
	const interactiveChartProperties = InteractiveChartHelper.getInteractiveChartProperties(visualFilter);
	if (interactiveChartProperties) {
		const id = generate([visualFilter.metaPath?.getPath()]);
		const dimension = visualFilter.chartAnnotation?.Dimensions[0];
		return xml`<InteractiveBarChart
                            xmlns="sap.suite.ui.microchart"
                            xmlns:core="sap.ui.core"
                            xmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
                            core:require="{VisualFilterRuntime: 'sap/fe/macros/visualfilters/VisualFilterRuntime'}"
                            visible="{= ${interactiveChartProperties.showErrorExpression}}"
                            selectionChanged="VisualFilterRuntime.selectionChanged"
                            showError="{= ${interactiveChartProperties.showErrorExpression}}"
                            errorMessageTitle="${interactiveChartProperties.errorMessageTitleExpression}"
                            errorMessage="${interactiveChartProperties.errorMessageExpression}"
                            bars="${interactiveChartProperties.aggregationBinding}"
                            customData:outParameter="${visualFilter.outParameter}"
                            customData:valuelistProperty="${visualFilter.valuelistProperty}"
                            customData:multipleSelectionAllowed="${visualFilter.multipleSelectionAllowed}"
                            customData:dimension="${dimension?.$target.name}"
                            customData:dimensionText="${
								(dimension?.$target.annotations.Common?.Text as unknown as PathAnnotationExpression<string>)?.path
							}"
                            customData:scalefactor="${interactiveChartProperties.scalefactor}"
                            customData:measure="${visualFilter.chartMeasure}"
                            customData:uom="${interactiveChartProperties.uom}"
                            customData:inParameters="${interactiveChartProperties.inParameters}"
                            customData:inParameterFilters="${interactiveChartProperties.inParameterFilters}"
                            customData:dimensionType="${dimension?.$target.type}"
                            customData:selectionVariantAnnotation="${interactiveChartProperties.selectionVariantAnnotation}"
                            customData:required="${visualFilter.required}"
                            customData:showOverlayInitially="${visualFilter.showOverlayInitially}"
                            customData:requiredProperties="${visualFilter.requiredProperties}"
                            customData:infoPath="${id}"
                            customData:parameters="${interactiveChartProperties.stringifiedParameters}"
                            customData:draftSupported="${visualFilter.draftSupported}"
                        >
                            <bars>
                                <InteractiveBarChartBar
                                    core:require="{VisualFilterRuntime: 'sap/fe/macros/visualfilters/VisualFilterRuntime'}"
                                    label="${interactiveChartProperties.chartLabel}"
                                    value="${interactiveChartProperties.measure}"
                                    displayedValue="${interactiveChartProperties.displayedValue}"
                                    color="${interactiveChartProperties.color}"
                                    selected="{path: '$field>/conditions', formatter: 'sap.fe.macros.visualfilters.VisualFilterRuntime.getAggregationSelected'}"
                                />
                            </bars>
                        </InteractiveBarChart>`;
	}
	return xml``;
}
