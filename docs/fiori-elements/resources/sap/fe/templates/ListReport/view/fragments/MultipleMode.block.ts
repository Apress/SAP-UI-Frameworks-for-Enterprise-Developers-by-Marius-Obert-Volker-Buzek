import BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import { blockAttribute, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import type {
	ListReportDefinition,
	SingleChartViewDefinition,
	SingleTableViewDefinition
} from "sap/fe/core/converters/templates/ListReportConverter";

@defineBuildingBlock({ name: "MultipleMode", namespace: "sap.fe.templates.ListReport.view.fragments", isOpen: true })
export default class MultipleModeBlock extends BuildingBlockBase {
	@blockAttribute({ type: "object" })
	converterContext?: ListReportDefinition;

	getInnerControlsAPI() {
		return (
			this.converterContext?.views
				.reduce((innerControls: string[], view) => {
					const innerControlId =
						(view as SingleTableViewDefinition).tableControlId || (view as SingleChartViewDefinition).chartControlId;
					if (innerControlId) {
						innerControls.push(`${innerControlId}::${(view as SingleTableViewDefinition).tableControlId ? "Table" : "Chart"}`);
					}
					return innerControls;
				}, [])
				.join(",") || ""
		);
	}

	getTemplate() {
		return xml`
			<fe:MultipleModeControl
				xmlns="sap.m"
				xmlns:fe="sap.fe.templates.ListReport.controls"
				xmlns:core="sap.ui.core"
				xmlns:macro="sap.fe.macros"
				innerControls="${this.getInnerControlsAPI()}"
				filterControl="${this.converterContext!.filterBarId}"
				showCounts="${this.converterContext!.multiViewsControl?.showTabCounts}"
				freezeContent="${!!this.converterContext!.filterBarId}"
				id="${this.converterContext!.multiViewsControl?.id}::Control"
			>
				<IconTabBar
				core:require="{
					MULTICONTROL: 'sap/fe/templates/ListReport/controls/MultipleModeControl'
				}"
					expandable="false"
					headerMode="Inline"
					id="${this.converterContext!.multiViewsControl?.id}"
					stretchContentHeight="true"
					select="MULTICONTROL.handleTabChange($event)"
				>
					<items>
					${this.converterContext!.views.map((view, viewIdx) => {
						return `<template:with path="converterContext>views/${viewIdx}/" var="view"
										template:require="{
											ID: 'sap/fe/core/helpers/StableIdHelper'
										}"
										xmlns:core="sap.ui.core"
										xmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1">
								<template:with path="view>presentation" var="presentationContext">
								<IconTabFilter
									text="${view.title}"
									key="{= ID.generate([\${view>tableControlId} || \${view>customTabId} || \${view>chartControlId}])}"
									visible="{view>visible}"
								>
									<content>
										<template:if test="{= \${view>type} === 'Custom'}">
											<template:then>
												<core:Fragment fragmentName="sap.fe.templates.ListReport.view.fragments.CustomView" type="XML" />
											</template:then>
											<template:else>
												<MessageStrip
													text="{= '{= (\${tabsInternal>/' + (\${view>tableControlId} || \${view>chartControlId}) + '/notApplicable/title} ) }' }"
													type="Information"
													showIcon="true"
													showCloseButton="true"
													class="sapUiTinyMargin"
													visible="{= '{= (\${tabsInternal>/' + (\${view>tableControlId} || \${view>chartControlId}) + '/notApplicable/fields} || []).length>0 }' }"
												>
												</MessageStrip>
												<core:Fragment fragmentName="sap.fe.templates.ListReport.view.fragments.CollectionVisualization" type="XML" />
											</template:else>
										</template:if>
									</content>
								</IconTabFilter>
							</template:with></template:with>`;
					}).join("")}
					</items>
				</IconTabBar>
			</fe:MultipleModeControl>`;
	}
}
