import type { EntityType } from "@sap-ux/vocabularies-types";
import type {
	Chart,
	LineItem,
	PresentationVariant,
	PresentationVariantType,
	SelectionPresentationVariant,
	SelectionVariant,
	SelectionVariantType
} from "@sap-ux/vocabularies-types/vocabularies/UI";
import { UIAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/UI";
import { IssueCategory, IssueSeverity, IssueType } from "sap/fe/core/converters/helpers/IssueManager";
import * as MetaModelConverter from "sap/fe/core/converters/MetaModelConverter";
import CommonHelper from "sap/fe/macros/CommonHelper";
import type Context from "sap/ui/model/Context";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import type ConverterContext from "../../ConverterContext";
import type { ViewPathConfiguration } from "../../ManifestSettings";
import { TemplateType } from "../../ManifestSettings";
import type { ChartVisualization } from "./Chart";
import { createBlankChartVisualization, createChartVisualization } from "./Chart";
import type { TableVisualization } from "./Table";
import Table from "./Table";

export type DataVisualizationAnnotations = LineItem | Chart | PresentationVariant | SelectionVariant | SelectionPresentationVariant;

export type ActualVisualizationAnnotations = LineItem | Chart;

export type PresentationVisualizationAnnotations = UIAnnotationTerms.LineItem | UIAnnotationTerms.Chart;

export type VisualizationAndPath = {
	visualization: ActualVisualizationAnnotations;
	annotationPath: string;
	selectionVariantPath?: string;
	converterContext: ConverterContext;
};

export type DataVisualizationDefinition = {
	visualizations: (TableVisualization | ChartVisualization)[];
	annotationPath: string;
};

export const getVisualizationsFromPresentationVariant = function (
	presentationVariantAnnotation: PresentationVariantType,
	visualizationPath: string,
	converterContext: ConverterContext,
	isMacroOrMultipleView?: boolean
): VisualizationAndPath[] {
	const visualizationAnnotations: VisualizationAndPath[] = [];

	const isALP = isAlpAnnotation(converterContext);

	const baseVisualizationPath = visualizationPath.split("@")[0];

	if ((isMacroOrMultipleView === true || isALP) && !isPresentationCompliant(presentationVariantAnnotation, isALP)) {
		if (!annotationExistsInPresentationVariant(presentationVariantAnnotation, UIAnnotationTerms.LineItem)) {
			const defaultLineItemAnnotation = prepareDefaultVisualization(
				UIAnnotationTerms.LineItem,
				baseVisualizationPath,
				converterContext
			);

			if (defaultLineItemAnnotation) {
				visualizationAnnotations.push(defaultLineItemAnnotation);
			}
		}
		if (!annotationExistsInPresentationVariant(presentationVariantAnnotation, UIAnnotationTerms.Chart)) {
			const defaultChartAnnotation = prepareDefaultVisualization(UIAnnotationTerms.Chart, baseVisualizationPath, converterContext);

			if (defaultChartAnnotation) {
				visualizationAnnotations.push(defaultChartAnnotation);
			}
		}
	}

	const visualizations = presentationVariantAnnotation.Visualizations;

	const pushFirstVizOfType = function (allowedTerms: string[]) {
		const firstViz = visualizations?.find((viz) => {
			return allowedTerms.indexOf(viz.$target?.term) >= 0;
		});

		if (firstViz) {
			visualizationAnnotations.push({
				visualization: firstViz.$target as ActualVisualizationAnnotations,
				annotationPath: `${baseVisualizationPath}${firstViz.value}`,
				converterContext: converterContext
			});
		}
	};

	if (isALP) {
		// In case of ALP, we use the first LineItem and the first Chart
		pushFirstVizOfType([UIAnnotationTerms.LineItem]);
		pushFirstVizOfType([UIAnnotationTerms.Chart]);
	} else {
		// Otherwise, we use the first viz only (Chart or LineItem)
		pushFirstVizOfType([UIAnnotationTerms.LineItem, UIAnnotationTerms.Chart]);
	}
	return visualizationAnnotations;
};

export function getSelectionPresentationVariant(
	entityType: EntityType,
	annotationPath: string | undefined,
	converterContext: ConverterContext
): SelectionPresentationVariant | undefined {
	if (annotationPath) {
		const resolvedTarget = converterContext.getEntityTypeAnnotation(annotationPath);
		const selectionPresentationVariant = resolvedTarget.annotation as SelectionPresentationVariant;
		if (selectionPresentationVariant) {
			if (selectionPresentationVariant.term === UIAnnotationTerms.SelectionPresentationVariant) {
				return selectionPresentationVariant;
			}
		} else {
			throw new Error("Annotation Path for the SPV mentioned in the manifest is not found, Please add the SPV in the annotation");
		}
	} else {
		return entityType.annotations?.UI?.SelectionPresentationVariant;
	}
}

export function isSelectionPresentationCompliant(
	selectionPresentationVariant: SelectionPresentationVariant,
	isALP: boolean
): boolean | undefined {
	const presentationVariant = selectionPresentationVariant && selectionPresentationVariant.PresentationVariant;
	if (presentationVariant) {
		return isPresentationCompliant(presentationVariant, isALP);
	} else {
		throw new Error("Presentation Variant is not present in the SPV annotation");
	}
}

export function isPresentationCompliant(presentationVariant: PresentationVariantType, isALP = false): boolean {
	let hasTable = false,
		hasChart = false;
	if (isALP) {
		if (presentationVariant?.Visualizations) {
			const visualizations = presentationVariant.Visualizations;
			visualizations.forEach((visualization) => {
				if (visualization.$target?.term === UIAnnotationTerms.LineItem) {
					hasTable = true;
				}
				if (visualization.$target?.term === UIAnnotationTerms.Chart) {
					hasChart = true;
				}
			});
		}
		return hasChart && hasTable;
	} else {
		return (
			presentationVariant?.Visualizations &&
			!!presentationVariant.Visualizations.find((visualization) => {
				return (
					visualization.$target?.term === UIAnnotationTerms.LineItem || visualization.$target?.term === UIAnnotationTerms.Chart
				);
			})
		);
	}
}

export function getDefaultLineItem(entityType: EntityType): LineItem | undefined {
	return entityType.annotations.UI?.LineItem;
}
export function getDefaultChart(entityType: EntityType): Chart | undefined {
	return entityType.annotations.UI?.Chart;
}
export function getDefaultPresentationVariant(entityType: EntityType): PresentationVariant | undefined {
	return entityType.annotations?.UI?.PresentationVariant;
}

export function getDefaultSelectionVariant(entityType: EntityType): SelectionVariant | undefined {
	return entityType.annotations?.UI?.SelectionVariant;
}

export function getSelectionVariant(entityType: EntityType, converterContext: ConverterContext): SelectionVariantType | undefined {
	const annotationPath = converterContext.getManifestWrapper().getDefaultTemplateAnnotationPath();
	const selectionPresentationVariant = getSelectionPresentationVariant(entityType, annotationPath, converterContext);
	let selectionVariant;
	if (selectionPresentationVariant) {
		selectionVariant = selectionPresentationVariant.SelectionVariant as SelectionVariant;
		if (selectionVariant) {
			return selectionVariant;
		}
	} else {
		selectionVariant = getDefaultSelectionVariant(entityType);
		return selectionVariant;
	}
}

export function getDataVisualizationConfiguration(
	visualizationPath: string,
	isCondensedTableLayoutCompliant: boolean | undefined,
	inConverterContext: ConverterContext,
	viewConfiguration?: ViewPathConfiguration,
	doNotCheckApplySupported?: boolean | undefined,
	associatedPresentationVariantPath?: string,
	isMacroOrMultipleView?: boolean
): DataVisualizationDefinition {
	const resolvedTarget =
		visualizationPath !== ""
			? inConverterContext.getEntityTypeAnnotation(visualizationPath)
			: { annotation: undefined, converterContext: inConverterContext };
	const resolvedAssociatedPresentationVariant = associatedPresentationVariantPath
		? inConverterContext.getEntityTypeAnnotation(associatedPresentationVariantPath)
		: null;
	const resolvedVisualization = resolvedTarget.annotation as DataVisualizationAnnotations;
	inConverterContext = resolvedTarget.converterContext;
	let visualizationAnnotations: VisualizationAndPath[] = [];
	let presentationVariantAnnotation: PresentationVariantType;
	let presentationPath = "";
	let chartVisualization, tableVisualization;
	const term = resolvedVisualization?.term;
	if (term) {
		switch (term) {
			case UIAnnotationTerms.LineItem:
			case UIAnnotationTerms.Chart:
				presentationVariantAnnotation = resolvedAssociatedPresentationVariant?.annotation;
				visualizationAnnotations.push({
					visualization: resolvedVisualization as ActualVisualizationAnnotations,
					annotationPath: visualizationPath,
					converterContext: inConverterContext
				});
				break;
			case UIAnnotationTerms.PresentationVariant:
				presentationVariantAnnotation = resolvedVisualization;
				visualizationAnnotations = visualizationAnnotations.concat(
					getVisualizationsFromPresentationVariant(
						resolvedVisualization,
						visualizationPath,
						inConverterContext,
						isMacroOrMultipleView
					)
				);
				break;
			case UIAnnotationTerms.SelectionPresentationVariant:
				presentationVariantAnnotation = resolvedVisualization.PresentationVariant;
				// Presentation can be inline or outside the SelectionPresentationVariant
				presentationPath = presentationVariantAnnotation.fullyQualifiedName;
				visualizationAnnotations = visualizationAnnotations.concat(
					getVisualizationsFromPresentationVariant(
						presentationVariantAnnotation,
						visualizationPath,
						inConverterContext,
						isMacroOrMultipleView
					)
				);

				break;
			default:
				break;
		}
		visualizationAnnotations.forEach((visualizationAnnotation) => {
			const { visualization, annotationPath, converterContext } = visualizationAnnotation;
			switch (visualization.term) {
				case UIAnnotationTerms.Chart:
					chartVisualization = createChartVisualization(
						visualization,
						annotationPath,
						converterContext,
						doNotCheckApplySupported,
						viewConfiguration
					);
					break;
				case UIAnnotationTerms.LineItem:
				default:
					tableVisualization = Table.createTableVisualization(
						visualization,
						annotationPath,
						converterContext,
						presentationVariantAnnotation,
						isCondensedTableLayoutCompliant,
						viewConfiguration
					);
					break;
			}
		});
	}

	const visualizations: any = [];
	let path = term === UIAnnotationTerms.SelectionPresentationVariant ? presentationPath : resolvedVisualization?.fullyQualifiedName;
	if (path === undefined) {
		path = "/";
	}
	const isALP = isAlpAnnotation(inConverterContext);

	if (!term || (isALP && tableVisualization === undefined)) {
		tableVisualization = Table.createDefaultTableVisualization(inConverterContext, isMacroOrMultipleView !== true);
		inConverterContext.getDiagnostics().addIssue(IssueCategory.Annotation, IssueSeverity.Medium, IssueType.MISSING_LINEITEM);
	}
	if (isALP && chartVisualization === undefined) {
		chartVisualization = createBlankChartVisualization(inConverterContext);
		inConverterContext.getDiagnostics().addIssue(IssueCategory.Annotation, IssueSeverity.Medium, IssueType.MISSING_CHART);
	}

	if (chartVisualization) {
		visualizations.push(chartVisualization);
	}
	if (tableVisualization) {
		visualizations.push(tableVisualization);
	}
	return {
		visualizations: visualizations,
		annotationPath: inConverterContext.getEntitySetBasedAnnotationPath(path)
	};
}

/**
 * Returns the context of the UI controls (either a UI.LineItem, or a UI.Chart).
 *
 * @function
 * @name getUiControl
 * @param presentationContext Object of the presentation context (either a presentation variant, or a UI.LineItem, or a UI.Chart)
 * @param controlPath Control path
 * @returns The context of the control (either a UI.LineItem, or a UI.Chart)
 */
export function getUiControl(presentationContext: Context, controlPath: string): Context {
	CommonHelper.validatePresentationMetaPath(presentationContext.getPath(), controlPath);

	const presentation = MetaModelConverter.convertMetaModelContext(presentationContext),
		presentationVariantPath = CommonHelper.createPresentationPathContext(presentationContext),
		model = presentationContext.getModel() as ODataMetaModel;
	if (presentation) {
		if (CommonHelper._isPresentationVariantAnnotation(presentationVariantPath.getPath())) {
			const visualizations = presentation.PresentationVariant
				? presentation.PresentationVariant.Visualizations
				: presentation.Visualizations;
			if (Array.isArray(visualizations)) {
				for (const visualization of visualizations) {
					if (
						visualization.type == "AnnotationPath" &&
						visualization.value.indexOf(controlPath) !== -1 &&
						// check if object exists for PresentationVariant visualization
						!!model.getMetaContext(presentationContext.getPath().split("@")[0] + visualization.value).getObject()
					) {
						controlPath = visualization.value;
						break;
					}
				}
			}
		} else {
			return presentationContext;
		}
	}

	return model.getMetaContext(presentationContext.getPath().split("@")[0] + controlPath);
}

export const annotationExistsInPresentationVariant = function (
	presentationVariantAnnotation: PresentationVariantType,
	annotationTerm: PresentationVisualizationAnnotations
): boolean {
	return presentationVariantAnnotation.Visualizations?.some((visualization) => visualization.value.indexOf(annotationTerm) > -1) ?? false;
};

export const prepareDefaultVisualization = function (
	visualizationType: PresentationVisualizationAnnotations,
	baseVisualizationPath: string,
	converterContext: ConverterContext
): VisualizationAndPath | undefined {
	const entityType = converterContext.getEntityType();
	const defaultAnnotation =
		visualizationType === UIAnnotationTerms.LineItem ? getDefaultLineItem(entityType) : getDefaultChart(entityType);

	if (defaultAnnotation) {
		return {
			visualization: defaultAnnotation,
			annotationPath: `${baseVisualizationPath}${converterContext.getRelativeAnnotationPath(
				defaultAnnotation.fullyQualifiedName,
				entityType
			)}`,
			converterContext: converterContext
		};
	}

	return undefined;
};

export const isAlpAnnotation = function (converterContext: ConverterContext): boolean {
	return (
		converterContext.getManifestWrapper().hasMultipleVisualizations() ||
		converterContext.getTemplateType() === TemplateType.AnalyticalListPage
	);
};
