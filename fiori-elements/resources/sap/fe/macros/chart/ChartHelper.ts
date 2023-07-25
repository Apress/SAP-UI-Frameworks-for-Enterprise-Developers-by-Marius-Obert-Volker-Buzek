import type * as Edm from "@sap-ux/vocabularies-types/Edm";
import { AggregationAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/Aggregation";
import { CommonAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/Common";
import type { Chart, ChartType, DataFieldForAction } from "@sap-ux/vocabularies-types/vocabularies/UI";
import { UIAnnotationTerms, UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log from "sap/base/Log";
import type AttributeModel from "sap/fe/core/buildingBlocks/AttributeModel";
import { getUiControl } from "sap/fe/core/converters/controls/Common/DataVisualization";
import type { ComputedAnnotationInterface } from "sap/fe/core/templating/UIFormatters";
import CommonHelper from "sap/fe/macros/CommonHelper";
import ActionHelper from "sap/fe/macros/internal/helpers/ActionHelper";
import type Context from "sap/ui/model/Context";
import JSONModel from "sap/ui/model/json/JSONModel";
import ODataModelAnnotationHelper from "sap/ui/model/odata/v4/AnnotationHelper";
import { ExpandPathType, MetaModelEnum } from "types/metamodel_types";

function getEntitySetPath(annotationContext: Context) {
	return annotationContext.getPath().replace(/@com.sap.vocabularies.UI.v1.(Chart|PresentationVariant).*/, "");
}

enum ChartTypeEnum {
	"com.sap.vocabularies.UI.v1.ChartType/Column" = "column",
	"com.sap.vocabularies.UI.v1.ChartType/ColumnStacked" = "stacked_column",
	"com.sap.vocabularies.UI.v1.ChartType/ColumnDual" = "dual_column",
	"com.sap.vocabularies.UI.v1.ChartType/ColumnStackedDual" = "dual_stacked_column",
	"com.sap.vocabularies.UI.v1.ChartType/ColumnStacked100" = "100_stacked_column",
	"com.sap.vocabularies.UI.v1.ChartType/ColumnStackedDual100" = "100_dual_stacked_column",
	"com.sap.vocabularies.UI.v1.ChartType/Bar" = "bar",
	"com.sap.vocabularies.UI.v1.ChartType/BarStacked" = "stacked_bar",
	"com.sap.vocabularies.UI.v1.ChartType/BarDual" = "dual_bar",
	"com.sap.vocabularies.UI.v1.ChartType/BarStackedDual" = "dual_stacked_bar",
	"com.sap.vocabularies.UI.v1.ChartType/BarStacked100" = "100_stacked_bar",
	"com.sap.vocabularies.UI.v1.ChartType/BarStackedDual100" = "100_dual_stacked_bar",
	"com.sap.vocabularies.UI.v1.ChartType/Area" = "area",
	"com.sap.vocabularies.UI.v1.ChartType/AreaStacked" = "stacked_column",
	"com.sap.vocabularies.UI.v1.ChartType/AreaStacked100" = "100_stacked_column",
	"com.sap.vocabularies.UI.v1.ChartType/HorizontalArea" = "bar",
	"com.sap.vocabularies.UI.v1.ChartType/HorizontalAreaStacked" = "stacked_bar",
	"com.sap.vocabularies.UI.v1.ChartType/HorizontalAreaStacked100" = "100_stacked_bar",
	"com.sap.vocabularies.UI.v1.ChartType/Line" = "line",
	"com.sap.vocabularies.UI.v1.ChartType/LineDual" = "dual_line",
	"com.sap.vocabularies.UI.v1.ChartType/Combination" = "combination",
	"com.sap.vocabularies.UI.v1.ChartType/CombinationStacked" = "stacked_combination",
	"com.sap.vocabularies.UI.v1.ChartType/CombinationDual" = "dual_combination",
	"com.sap.vocabularies.UI.v1.ChartType/CombinationStackedDual" = "dual_stacked_combination",
	"com.sap.vocabularies.UI.v1.ChartType/HorizontalCombinationStacked" = "horizontal_stacked_combination",
	"com.sap.vocabularies.UI.v1.ChartType/Pie" = "pie",
	"com.sap.vocabularies.UI.v1.ChartType/Donut" = "donut",
	"com.sap.vocabularies.UI.v1.ChartType/Scatter" = "scatter",
	"com.sap.vocabularies.UI.v1.ChartType/Bubble" = "bubble",
	"com.sap.vocabularies.UI.v1.ChartType/Radar" = "line",
	"com.sap.vocabularies.UI.v1.ChartType/HeatMap" = "heatmap",
	"com.sap.vocabularies.UI.v1.ChartType/TreeMap" = "treemap",
	"com.sap.vocabularies.UI.v1.ChartType/Waterfall" = "waterfall",
	"com.sap.vocabularies.UI.v1.ChartType/Bullet" = "bullet",
	"com.sap.vocabularies.UI.v1.ChartType/VerticalBullet" = "vertical_bullet",
	"com.sap.vocabularies.UI.v1.ChartType/HorizontalWaterfall" = "horizontal_waterfall",
	"com.sap.vocabularies.UI.v1.ChartType/HorizontalCombinationDual" = "dual_horizontal_combination",
	"com.sap.vocabularies.UI.v1.ChartType/HorizontalCombinationStackedDual" = "dual_horizontal_stacked_combination"
}
enum DimensionRoleTypeEnum {
	"com.sap.vocabularies.UI.v1.ChartDimensionRoleType/Category" = "category",
	"com.sap.vocabularies.UI.v1.ChartDimensionRoleType/Series" = "series",
	"com.sap.vocabularies.UI.v1.ChartDimensionRoleType/Category2" = "category2"
}
/**
 * Helper class for sap.fe.macros Chart phantom control for preprocessing.
 * <h3><b>Note:</b></h3>
 * The class is experimental and the API/behaviour is not finalised
 * and hence this should not be used for productive usage.
 * Especially this class is not intended to be used for the FE scenario,
 * here we shall use sap.fe.macros.ChartHelper that is especially tailored for V4
 * meta model
 *
 * @author SAP SE
 * @private
 * @experimental
 * @since 1.62.0
 * @alias sap.fe.macros.ChartHelper
 */
const ChartHelper = {
	formatJSONToString(crit: object) {
		if (!crit) {
			return undefined;
		}

		let criticality = JSON.stringify(crit);
		criticality = criticality.replace(new RegExp("{", "g"), "\\{");
		criticality = criticality.replace(new RegExp("}", "g"), "\\}");
		return criticality;
	},
	formatChartType(chartType: ChartType) {
		return ChartTypeEnum[(chartType as unknown as MetaModelEnum<ChartTypeEnum>)?.$EnumMember as keyof typeof ChartTypeEnum];
	},
	formatDimensions(annotationContext: Context) {
		const annotation = annotationContext.getObject("./") as Chart,
			metaModel = annotationContext.getModel(),
			entitySetPath = getEntitySetPath(annotationContext),
			dimensions = [];

		let isNavigationText = false;

		//perhaps there are no dimension
		annotation.DimensionAttributes = annotation.DimensionAttributes || [];

		for (const dimension of annotation.Dimensions) {
			const key = (dimension as unknown as ExpandPathType<Edm.PropertyPath>).$PropertyPath;
			const text = metaModel.getObject(`${entitySetPath + key}@${CommonAnnotationTerms.Text}`) || {};
			if (key.indexOf("/") > -1) {
				Log.error(`$expand is not yet supported. Dimension: ${key} from an association cannot be used`);
			}
			if (text.$Path && text.$Path.indexOf("/") > -1) {
				Log.error(
					`$expand is not yet supported. Text Property: ${text.$Path} from an association cannot be used for the dimension ${key}`
				);
				isNavigationText = true;
			}

			const chartDimension: { [key: string]: string } = {
				key: key,
				textPath: !isNavigationText ? text.$Path : undefined,
				label: metaModel.getObject(`${entitySetPath + key}@${CommonAnnotationTerms.Label}`),
				role: "category"
			};

			for (const attribute of annotation.DimensionAttributes) {
				if (chartDimension.key === (attribute.Dimension as unknown as ExpandPathType<Edm.PropertyPath>)?.$PropertyPath) {
					chartDimension.role =
						DimensionRoleTypeEnum[
							(attribute.Role as unknown as MetaModelEnum<DimensionRoleTypeEnum>)
								?.$EnumMember as keyof typeof DimensionRoleTypeEnum
						] || chartDimension.role;
					break;
				}
			}

			chartDimension.criticality = this.fetchCriticality(metaModel, metaModel.createBindingContext(entitySetPath + key)).then(
				this.formatJSONToString
			);

			dimensions.push(chartDimension);
		}

		const dimensionModel = new JSONModel(dimensions);
		(dimensionModel as AttributeModel).$$valueAsPromise = true;
		return dimensionModel.createBindingContext("/");
	},

	fetchCriticality(oMetaModel: any, oCtx: any) {
		const UI = "@com.sap.vocabularies.UI.v1";
		return oMetaModel.requestObject(`${UI}.ValueCriticality`, oCtx).then(function (aValueCriticality: any) {
			let oCriticality, oValueCriticality: any;

			if (aValueCriticality) {
				oCriticality = {
					VeryPositive: [],
					Positive: [],
					Critical: [],
					VeryNegative: [],
					Negative: [],
					Neutral: []
				} as any;

				for (let i = 0; i < aValueCriticality.length; i++) {
					oValueCriticality = aValueCriticality[i];

					if (oValueCriticality.Criticality.$EnumMember.endsWith("VeryPositive")) {
						oCriticality.VeryPositive.push(oValueCriticality.Value);
					} else if (oValueCriticality.Criticality.$EnumMember.endsWith("Positive")) {
						oCriticality.Positive.push(oValueCriticality.Value);
					} else if (oValueCriticality.Criticality.$EnumMember.endsWith("Critical")) {
						oCriticality.Critical.push(oValueCriticality.Value);
					} else if (oValueCriticality.Criticality.$EnumMember.endsWith("VeryNegative")) {
						oCriticality.VeryNegative.push(oValueCriticality.Value);
					} else if (oValueCriticality.Criticality.$EnumMember.endsWith("Negative")) {
						oCriticality.Negative.push(oValueCriticality.Value);
					} else {
						oCriticality.Neutral.push(oValueCriticality.Value);
					}
				}

				for (const sKey in oCriticality) {
					if (oCriticality[sKey].length == 0) {
						delete oCriticality[sKey];
					}
				}
			}

			return oCriticality;
		});
	},

	formatMeasures(annotationContext: Context) {
		return (annotationContext.getModel() as JSONModel).getData();
	},

	getUiChart(presentationContext: Context) {
		return getUiControl(presentationContext, `@${UIAnnotationTerms.Chart}`);
	},
	getOperationAvailableMap(chart: Chart, contextContext: ComputedAnnotationInterface) {
		const chartCollection = chart?.Actions || [];
		return JSON.stringify(ActionHelper.getOperationAvailableMap(chartCollection, "chart", contextContext));
	},
	/**
	 * Returns a stringified JSON object containing Presentation Variant sort conditions.
	 *
	 * @param oContext
	 * @param oPresentationVariant Presentation Variant annotation
	 * @param sPresentationVariantPath
	 * @param oApplySupported
	 * @returns Stringified JSON object
	 */
	getSortConditions: function (oContext: any, oPresentationVariant: any, sPresentationVariantPath: string, oApplySupported: any) {
		if (
			oPresentationVariant &&
			CommonHelper._isPresentationVariantAnnotation(sPresentationVariantPath) &&
			oPresentationVariant.SortOrder
		) {
			const aSortConditions: any = {
				sorters: []
			};
			const sEntityPath = oContext.getPath(0).split("@")[0];
			oPresentationVariant.SortOrder.forEach(function (oCondition: any = {}) {
				let oSortProperty: any = "";
				const oSorter: any = {};
				if (oCondition.DynamicProperty) {
					oSortProperty =
						"_fe_aggregatable_" +
						oContext.getModel(0).getObject(sEntityPath + oCondition.DynamicProperty.$AnnotationPath)?.Name;
				} else if (oCondition.Property) {
					const aGroupableProperties = oApplySupported.GroupableProperties;
					if (aGroupableProperties && aGroupableProperties.length) {
						for (let i = 0; i < aGroupableProperties.length; i++) {
							if (aGroupableProperties[i].$PropertyPath === oCondition.Property.$PropertyPath) {
								oSortProperty = "_fe_groupable_" + oCondition.Property.$PropertyPath;
								break;
							}
							if (!oSortProperty) {
								oSortProperty = "_fe_aggregatable_" + oCondition.Property.$PropertyPath;
							}
						}
					} else if (
						oContext
							.getModel(0)
							.getObject(`${sEntityPath + oCondition.Property.$PropertyPath}@${AggregationAnnotationTerms.Groupable}`)
					) {
						oSortProperty = "_fe_groupable_" + oCondition.Property.$PropertyPath;
					} else {
						oSortProperty = "_fe_aggregatable_" + oCondition.Property.$PropertyPath;
					}
				}
				if (oSortProperty) {
					oSorter.name = oSortProperty;
					oSorter.descending = !!oCondition.Descending;
					aSortConditions.sorters.push(oSorter);
				} else {
					throw new Error("Please define the right path to the sort property");
				}
			});
			return JSON.stringify(aSortConditions);
		}
		return undefined;
	},
	getBindingData(sTargetCollection: any, oContext: any, aActions: any) {
		const aOperationAvailablePath = [];
		let sSelect;
		for (const i in aActions) {
			if (aActions[i].$Type === UIAnnotationTypes.DataFieldForAction) {
				const sActionName = aActions[i].Action;
				const oActionOperationAvailable = CommonHelper.getActionPath(oContext, false, sActionName, true);
				if (oActionOperationAvailable && oActionOperationAvailable.$Path) {
					aOperationAvailablePath.push(`'${oActionOperationAvailable.$Path}'`);
				} else if (oActionOperationAvailable === null) {
					// We disabled action advertisement but kept it in the code for the time being
					//aOperationAvailablePath.push(sActionName);
				}
			}
		}
		if (aOperationAvailablePath.length > 0) {
			//TODO: request fails with $select. check this with odata v4 model
			sSelect = " $select: '" + aOperationAvailablePath.join() + "'";
		}
		return (
			"'{path: '" +
			(oContext.getObject("$kind") === "EntitySet" ? "/" : "") +
			oContext.getObject("@sapui.name") +
			"'" +
			(sSelect ? ",parameters:{" + sSelect + "}" : "") +
			"}'"
		);
	},
	_getModel(oCollection: any, oInterface: any) {
		return oInterface.context;
	},
	// TODO: combine this one with the one from the table
	isDataFieldForActionButtonEnabled(
		bIsBound: boolean,
		sAction: string,
		oCollection: Context,
		sOperationAvailableMap: string,
		sEnableSelectOn: string
	) {
		if (bIsBound !== true) {
			return "true";
		}
		const oModel = oCollection.getModel();
		const sNavPath = oCollection.getPath();
		const sPartner = oModel.getObject(sNavPath).$Partner;
		const oOperationAvailableMap = sOperationAvailableMap && JSON.parse(sOperationAvailableMap);
		const aPath = oOperationAvailableMap && oOperationAvailableMap[sAction] && oOperationAvailableMap[sAction].split("/");
		const sNumberOfSelectedContexts = ActionHelper.getNumberOfContextsExpression(sEnableSelectOn);
		if (aPath && aPath[0] === sPartner) {
			const sPath = oOperationAvailableMap[sAction].replace(sPartner + "/", "");
			return "{= ${" + sNumberOfSelectedContexts + " && ${" + sPath + "}}";
		} else {
			return "{= ${" + sNumberOfSelectedContexts + "}";
		}
	},
	getHiddenPathExpressionForTableActionsAndIBN(sHiddenPath: any, oDetails: any) {
		const oContext = oDetails.context,
			sPropertyPath = oContext.getPath(),
			sEntitySetPath = ODataModelAnnotationHelper.getNavigationPath(sPropertyPath);
		if (sHiddenPath.indexOf("/") > 0) {
			const aSplitHiddenPath = sHiddenPath.split("/");
			const sNavigationPath = aSplitHiddenPath[0];
			// supports visiblity based on the property from the partner association
			if (oContext.getObject(sEntitySetPath + "/$Partner") === sNavigationPath) {
				return "{= !%{" + aSplitHiddenPath.slice(1).join("/") + "} }";
			}
			// any other association will be ignored and the button will be made visible
		}
		return true;
	},
	/**
	 * Method to get press event for DataFieldForActionButton.
	 *
	 * @function
	 * @name getPressEventForDataFieldForActionButton
	 * @param id Current control ID
	 * @param action DataFieldForAction model
	 * @param operationAvailableMap Stringified JSON object
	 * @returns A binding expression for the press property of the DataFieldForActionButton
	 */
	getPressEventForDataFieldForActionButton(id: string, action: DataFieldForAction, operationAvailableMap: string): string {
		return ActionHelper.getPressEventDataFieldForActionButton(
			id,
			action,
			{
				contexts: "${internal>selectedContexts}"
			},
			operationAvailableMap
		);
	},
	/**
	 * @function
	 * @name getActionType
	 * @param action DataFieldForAction model
	 * @returns A Boolean value depending on the action type
	 */
	getActionType(action: DataFieldForAction) {
		return (
			(action["$Type"].indexOf(UIAnnotationTypes.DataFieldForIntentBasedNavigation) > -1 ||
				action["$Type"].indexOf(UIAnnotationTypes.DataFieldForAction) > -1) &&
			action["Inline"]
		);
	},
	getCollectionName(collection: string) {
		return collection.split("/")[collection.split("/").length - 1];
	}
};
(ChartHelper.getSortConditions as any).requiresIContext = true;

export default ChartHelper;
