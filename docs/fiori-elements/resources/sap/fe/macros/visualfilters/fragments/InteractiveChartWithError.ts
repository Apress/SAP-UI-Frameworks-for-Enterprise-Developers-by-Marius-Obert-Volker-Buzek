import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import VisualFilterBlock from "../VisualFilter.block";

export function getInteractiveChartWithErrorTemplate(visualFilter: VisualFilterBlock): string {
	const chartAnnotation = visualFilter.chartAnnotation;
	if (visualFilter.chartMeasure && chartAnnotation?.Dimensions && chartAnnotation.Dimensions[0]) {
		return xml`<InteractiveLineChart
                        xmlns="sap.suite.ui.microchart"
                        xmlns:core="sap.ui.core"
                        core:require="{VisualFilterRuntime: 'sap/fe/macros/visualfilters/VisualFilterRuntime'}"
                        showError="${visualFilter.showError}"
                        errorMessageTitle="${visualFilter.errorMessageTitle}"
                        errorMessage="${visualFilter.errorMessage}"
                    />`;
	}
	return xml``;
}
