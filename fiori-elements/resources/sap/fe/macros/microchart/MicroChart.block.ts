import type { Chart } from "@sap-ux/vocabularies-types/vocabularies/UI";
import BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import { blockAttribute, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import { convertMetaModelContext, getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import { equal, not, or, pathInModel } from "sap/fe/core/helpers/BindingToolkit";
import type { PropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import { hasValidAnalyticalCurrencyOrUnit } from "sap/fe/core/templating/UIFormatters";
import CommonHelper from "sap/fe/macros/CommonHelper";
import AnnotationHelper from "sap/ui/model/odata/v4/AnnotationHelper";
import type Context from "sap/ui/model/odata/v4/Context";

/**
 * Building block used to create a MicroChart based on the metadata provided by OData V4.
 *
 * @hideconstructor
 * @public
 * @since 1.93.0
 */
@defineBuildingBlock({
	name: "MicroChart",
	namespace: "sap.fe.macros.internal",
	publicNamespace: "sap.fe.macros"
})
export default class MicroChartBlock extends BuildingBlockBase {
	/**
	 * ID of the MicroChart.
	 */
	@blockAttribute({ type: "string", isPublic: true, required: true })
	id!: string;

	/**
	 * Metadata path to the entitySet or navigationProperty.
	 */
	@blockAttribute({ type: "sap.ui.model.Context", expectedTypes: ["EntitySet", "NavigationProperty"], isPublic: true })
	contextPath?: Context;

	/**
	 * Metadata path to the Chart annotations.
	 */
	@blockAttribute({ type: "sap.ui.model.Context", isPublic: true, required: true })
	metaPath!: Context;

	/**
	 * To control the rendering of Title, Subtitle and Currency Labels. When the size is xs then we do
	 * not see the inner labels of the MicroChart as well.
	 */
	@blockAttribute({ type: "string", isPublic: true })
	showOnlyChart: string | boolean = false;

	/**
	 * Batch group ID along with which this call should be grouped.
	 */
	@blockAttribute({ type: "string" })
	batchGroupId = "";

	/**
	 * Title for the MicroChart. If no title is provided, the title from the Chart annotation is used.
	 */
	@blockAttribute({ type: "string" })
	title = "";

	/**
	 * Show blank space in case there is no data in the chart
	 */
	@blockAttribute({ type: "string" })
	hideOnNoData: string | boolean = false;

	/**
	 * Description for the MicroChart. If no description is provided, the description from the Chart annotation is used.
	 */
	@blockAttribute({ type: "string" })
	description = "";

	/**
	 * Type of navigation, that is, External or InPage
	 */
	@blockAttribute({ type: "sap.fe.macros.NavigationType" })
	navigationType = "None";

	/**
	 * Event handler for onTitlePressed event
	 */
	@blockAttribute({ type: "function" })
	onTitlePressed?: string;

	/**
	 * Size of the MicroChart
	 */
	@blockAttribute({ type: "string", isPublic: true })
	size?: string;

	/**
	 * Defines whether the MicroChart is part of an analytical table
	 */
	@blockAttribute({ type: "boolean" })
	isAnalytics = false;

	/*
	 * This is used in inner fragments, so we need to declare it as block attribute context.
	 */
	@blockAttribute({ type: "sap.ui.model.Context" })
	// eslint-disable-next-line @typescript-eslint/naming-convention
	private readonly DataPoint?: Context;

	constructor(props: PropertiesOf<MicroChartBlock>) {
		super(props);

		this.metaPath = this.metaPath.getModel().createBindingContext(AnnotationHelper.resolve$Path(this.metaPath));
		const measureAttributePath = CommonHelper.getMeasureAttributeForMeasure(
			this.metaPath.getModel().createBindingContext("Measures/0", this.metaPath)
		);
		if (measureAttributePath) {
			this.DataPoint = this.metaPath.getModel().createBindingContext(measureAttributePath);
		}
	}

	/**
	 * Gets the content of the micro chart, i.e. a reference to the fragment for the given chart type.
	 *
	 * @returns XML string
	 */
	getMicroChartContent() {
		const convertedChart = convertMetaModelContext(this.metaPath) as Chart;

		switch (convertedChart.ChartType) {
			case "UI.ChartType/Bullet":
				return `<core:Fragment fragmentName="sap.fe.macros.microchart.fragments.BulletMicroChart" type="XML" />`;
			case "UI.ChartType/Donut":
				return `<core:Fragment fragmentName="sap.fe.macros.microchart.fragments.RadialMicroChart" type="XML" />`;
			case "UI.ChartType/Pie":
				return `<core:Fragment fragmentName="sap.fe.macros.microchart.fragments.HarveyBallMicroChart" type="XML" />`;
			case "UI.ChartType/BarStacked":
				return `<core:Fragment fragmentName="sap.fe.macros.microchart.fragments.StackedBarMicroChart" type="XML" />`;
			case "UI.ChartType/Area":
				return `<core:Fragment fragmentName="sap.fe.macros.microchart.fragments.AreaMicroChart" type="XML" />`;
			case "UI.ChartType/Column":
				return `<core:Fragment fragmentName="sap.fe.macros.microchart.fragments.ColumnMicroChart" type="XML" />`;
			case "UI.ChartType/Line":
				return `<core:Fragment fragmentName="sap.fe.macros.microchart.fragments.LineMicroChart" type="XML" />`;
			case "UI.ChartType/Bar":
				return `<core:Fragment fragmentName="sap.fe.macros.microchart.fragments.ComparisonMicroChart" type="XML" />`;
			default:
				return `<m:Text text="This chart type is not supported. Other Types yet to be implemented.." />`;
		}
	}

	/**
	 * The building block template function.
	 *
	 * @returns An XML-based string
	 */
	getTemplate() {
		const dataPointValueObjects = getInvolvedDataModelObjects(
			this.metaPath.getModel().createBindingContext("Value/$Path", this.DataPoint),
			this.contextPath
		);
		const wrapperConditionBinding = hasValidAnalyticalCurrencyOrUnit(dataPointValueObjects);
		const wrapperVisibleBinding = or(not(pathInModel("@$ui5.node.isExpanded")), equal(pathInModel("@$ui5.node.level"), 0));

		if (this.isAnalytics) {
			return xml`<controls:ConditionalWrapper
				xmlns:controls="sap.fe.macros.controls"
				condition="${wrapperConditionBinding}"
				visible="${wrapperVisibleBinding}" >
				<controls:contentTrue>
					${this.getMicroChartContent()}
				</controls:contentTrue>
				<controls:contentFalse>
					<m:Text text="*" />
				</controls:contentFalse>
			</controls:ConditionalWrapper>`;
		} else {
			return this.getMicroChartContent();
		}
	}
}
