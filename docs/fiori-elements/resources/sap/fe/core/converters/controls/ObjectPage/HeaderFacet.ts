import type {
	DataFieldAbstractTypes,
	DataPoint,
	FacetTypes,
	FieldGroup,
	ReferenceFacetTypes
} from "@sap-ux/vocabularies-types/vocabularies/UI";
import { UIAnnotationTerms, UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import { getSemanticObjectPath } from "sap/fe/core/converters/annotations/DataField";
import type { ConfigurableObject, ConfigurableRecord, CustomElement, Position } from "sap/fe/core/converters/helpers/ConfigurableObject";
import { insertCustomElements, Placement } from "sap/fe/core/converters/helpers/ConfigurableObject";
import {
	getCustomHeaderFacetID,
	getHeaderFacetContainerID,
	getHeaderFacetFormID,
	getHeaderFacetID
} from "sap/fe/core/converters/helpers/ID";
import { KeyHelper } from "sap/fe/core/converters/helpers/Key";
import type { ManifestHeaderFacet } from "sap/fe/core/converters/ManifestSettings";
import type { CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { compileExpression, equal, getExpressionFromAnnotation, not } from "sap/fe/core/helpers/BindingToolkit";
import { createIdForAnnotation } from "../../../helpers/StableIdHelper";
import type ConverterContext from "../../ConverterContext";
import { isAnnotationFieldStaticallyHidden, isReferencePropertyStaticallyHidden } from "../../helpers/DataFieldHelper";
import type { AnnotationFormElement, FormElement } from "../Common/Form";
import { FormElementType, getFormElementsFromManifest } from "../Common/Form";

// region definitions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Definitions: Header Facet Types, Generic OP Header Facet, Manifest Properties for Custom Header Facet
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export enum HeaderFacetType {
	Annotation = "Annotation",
	XMLFragment = "XMLFragment"
}

export enum FacetType {
	Reference = "Reference",
	Collection = "Collection"
}

export enum FlexDesignTimeType {
	Default = "Default",
	NotAdaptable = "not-adaptable", // disable all actions on that instance
	NotAdaptableTree = "not-adaptable-tree", // disable all actions on that instance and on all children of that instance
	NotAdaptableVisibility = "not-adaptable-visibility" // disable all actions that influence the visibility, namely reveal and remove
}

export type FlexSettings = {
	designtime?: FlexDesignTimeType;
};

type HeaderFormData = {
	id: string;
	label?: string;
	formElements: FormElement[];
};

enum HeaderDataPointType {
	ProgressIndicator = "ProgressIndicator",
	RatingIndicator = "RatingIndicator",
	Content = "Content"
}

type HeaderDataPointData = {
	type: HeaderDataPointType;
	semanticObjectPath?: string;
};

enum TargetAnnotationType {
	None = "None",
	DataPoint = "DataPoint",
	Chart = "Chart",
	Identification = "Identification",
	Contact = "Contact",
	Address = "Address",
	FieldGroup = "FieldGroup"
}

type BaseHeaderFacet = ConfigurableObject & {
	type?: HeaderFacetType; // Manifest or Metadata
	id: string;
	containerId: string;
	annotationPath?: string;
	flexSettings: FlexSettings;
	stashed: boolean;
	visible: CompiledBindingToolkitExpression;
	targetAnnotationValue?: string;
	targetAnnotationType?: TargetAnnotationType;
};

type BaseReferenceFacet = BaseHeaderFacet & {
	facetType: FacetType.Reference;
};

export type FieldGroupFacet = BaseReferenceFacet & {
	headerFormData: HeaderFormData;
};

type DataPointFacet = BaseReferenceFacet & {
	headerDataPointData?: HeaderDataPointData;
};

type ReferenceFacet = FieldGroupFacet | DataPointFacet;

export type CollectionFacet = BaseHeaderFacet & {
	facetType: FacetType.Collection;
	facets: ReferenceFacet[];
};

export type ObjectPageHeaderFacet = ReferenceFacet | CollectionFacet;

export type CustomObjectPageHeaderFacet = CustomElement<ObjectPageHeaderFacet> & {
	fragmentName?: string;
	title?: string;
	subTitle?: string;
	stashed?: boolean;
	binding?: string;
	templateEdit?: string;
};

// endregion definitions

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Collect All Header Facets: Custom (via Manifest) and Annotation Based (via Metamodel)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Retrieve header facets from annotations.
 *
 * @param converterContext
 * @returns Header facets from annotations
 */
export function getHeaderFacetsFromAnnotations(converterContext: ConverterContext): ObjectPageHeaderFacet[] {
	const headerFacets: ObjectPageHeaderFacet[] = [];
	converterContext.getEntityType().annotations?.UI?.HeaderFacets?.forEach((facet) => {
		const headerFacet: ObjectPageHeaderFacet | undefined = createHeaderFacet(facet, converterContext);
		if (headerFacet) {
			headerFacets.push(headerFacet);
		}
	});

	return headerFacets;
}

/**
 * Retrieve custom header facets from manifest.
 *
 * @param manifestCustomHeaderFacets
 * @returns HeaderFacets from manifest
 */
export function getHeaderFacetsFromManifest(
	manifestCustomHeaderFacets: ConfigurableRecord<ManifestHeaderFacet>
): Record<string, CustomObjectPageHeaderFacet> {
	const customHeaderFacets: Record<string, CustomObjectPageHeaderFacet> = {};

	Object.keys(manifestCustomHeaderFacets).forEach((manifestHeaderFacetKey) => {
		const customHeaderFacet: ManifestHeaderFacet = manifestCustomHeaderFacets[manifestHeaderFacetKey];
		customHeaderFacets[manifestHeaderFacetKey] = createCustomHeaderFacet(customHeaderFacet, manifestHeaderFacetKey);
	});

	return customHeaderFacets;
}

/**
 * Retrieve stashed settings for header facets from manifest.
 *
 * @param facetDefinition
 * @param collectionFacetDefinition
 * @param converterContext
 * @returns Stashed setting for header facet or false
 */
export function getStashedSettingsForHeaderFacet(
	facetDefinition: FacetTypes,
	collectionFacetDefinition: FacetTypes,
	converterContext: ConverterContext
): boolean {
	// When a HeaderFacet is nested inside a CollectionFacet, stashing is not supported
	if (
		facetDefinition.$Type === UIAnnotationTypes.ReferenceFacet &&
		collectionFacetDefinition.$Type === UIAnnotationTypes.CollectionFacet
	) {
		return false;
	}
	const headerFacetID = createIdForAnnotation(facetDefinition) ?? "";
	const headerFacetsControlConfig = converterContext.getManifestWrapper().getHeaderFacets();
	const stashedSetting = headerFacetsControlConfig[headerFacetID]?.stashed;
	return stashedSetting === true;
}

/**
 * Retrieve flexibility designtime settings from manifest.
 *
 * @param facetDefinition
 * @param collectionFacetDefinition
 * @param converterContext
 * @returns Designtime setting or default
 */
export function getDesignTimeMetadataSettingsForHeaderFacet(
	facetDefinition: FacetTypes,
	collectionFacetDefinition: FacetTypes,
	converterContext: ConverterContext
): FlexDesignTimeType {
	let designTimeMetadata: FlexDesignTimeType = FlexDesignTimeType.Default;
	const headerFacetID = createIdForAnnotation(facetDefinition);

	// For HeaderFacets nested inside CollectionFacet RTA should be disabled, therefore set to "not-adaptable-tree"
	if (
		facetDefinition.$Type === UIAnnotationTypes.ReferenceFacet &&
		collectionFacetDefinition.$Type === UIAnnotationTypes.CollectionFacet
	) {
		designTimeMetadata = FlexDesignTimeType.NotAdaptableTree;
	} else {
		const headerFacetsControlConfig = converterContext.getManifestWrapper().getHeaderFacets();
		if (headerFacetID) {
			const designTime = headerFacetsControlConfig[headerFacetID]?.flexSettings?.designtime;
			switch (designTime) {
				case FlexDesignTimeType.NotAdaptable:
				case FlexDesignTimeType.NotAdaptableTree:
				case FlexDesignTimeType.NotAdaptableVisibility:
					designTimeMetadata = designTime;
					break;
				default:
					break;
			}
		}
	}
	return designTimeMetadata;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Convert & Build Annotation Based Header Facets
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function createReferenceHeaderFacet(
	facetDefinition: FacetTypes,
	collectionFacetDefinition: FacetTypes,
	converterContext: ConverterContext
): ReferenceFacet | undefined {
	if (facetDefinition.$Type === UIAnnotationTypes.ReferenceFacet && !(facetDefinition.annotations?.UI?.Hidden?.valueOf() === true)) {
		const headerFacetID = getHeaderFacetID(facetDefinition),
			getHeaderFacetKey = (facetDefinitionToCheck: FacetTypes, fallback: string): string => {
				return facetDefinitionToCheck.ID?.toString() || facetDefinitionToCheck.Label?.toString() || fallback;
			},
			targetAnnotationValue = facetDefinition.Target.value,
			targetAnnotationType = getTargetAnnotationType(facetDefinition);

		let headerFormData: HeaderFormData | undefined;
		let headerDataPointData: HeaderDataPointData | undefined;

		switch (targetAnnotationType) {
			case TargetAnnotationType.FieldGroup:
				headerFormData = getFieldGroupFormData(facetDefinition, converterContext);
				break;

			case TargetAnnotationType.DataPoint:
				headerDataPointData = getDataPointData(facetDefinition, converterContext);
				break;
			// ToDo: Handle other cases
			default:
				break;
		}

		const { annotations } = facetDefinition;
		if (facetDefinition.Target?.$target?.term === UIAnnotationTerms.Chart && isAnnotationFieldStaticallyHidden(facetDefinition)) {
			return undefined;
		} else {
			return {
				type: HeaderFacetType.Annotation,
				facetType: FacetType.Reference,
				id: headerFacetID,
				containerId: getHeaderFacetContainerID(facetDefinition),
				key: getHeaderFacetKey(facetDefinition, headerFacetID),
				flexSettings: {
					designtime: getDesignTimeMetadataSettingsForHeaderFacet(facetDefinition, collectionFacetDefinition, converterContext)
				},
				stashed: getStashedSettingsForHeaderFacet(facetDefinition, collectionFacetDefinition, converterContext),
				visible: compileExpression(not(equal(getExpressionFromAnnotation(annotations?.UI?.Hidden?.valueOf()), true))),
				annotationPath: `${converterContext.getEntitySetBasedAnnotationPath(facetDefinition.fullyQualifiedName)}/`,
				targetAnnotationValue,
				targetAnnotationType,
				headerFormData,
				headerDataPointData
			};
		}
	}

	return undefined;
}

function createCollectionHeaderFacet(
	collectionFacetDefinition: FacetTypes,
	converterContext: ConverterContext
): CollectionFacet | undefined {
	if (collectionFacetDefinition.$Type === UIAnnotationTypes.CollectionFacet) {
		const facets: ReferenceFacet[] = [],
			headerFacetID = getHeaderFacetID(collectionFacetDefinition),
			getHeaderFacetKey = (facetDefinition: FacetTypes, fallback: string): string => {
				return facetDefinition.ID?.toString() || facetDefinition.Label?.toString() || fallback;
			};

		collectionFacetDefinition.Facets.forEach((facetDefinition) => {
			const facet: ReferenceFacet | undefined = createReferenceHeaderFacet(
				facetDefinition,
				collectionFacetDefinition,
				converterContext
			);
			if (facet) {
				facets.push(facet);
			}
		});

		return {
			type: HeaderFacetType.Annotation,
			facetType: FacetType.Collection,
			id: headerFacetID,
			containerId: getHeaderFacetContainerID(collectionFacetDefinition),
			key: getHeaderFacetKey(collectionFacetDefinition, headerFacetID),
			flexSettings: {
				designtime: getDesignTimeMetadataSettingsForHeaderFacet(
					collectionFacetDefinition,
					collectionFacetDefinition,
					converterContext
				)
			},
			stashed: getStashedSettingsForHeaderFacet(collectionFacetDefinition, collectionFacetDefinition, converterContext),
			visible: compileExpression(
				not(equal(getExpressionFromAnnotation(collectionFacetDefinition.annotations?.UI?.Hidden?.valueOf()), true))
			),
			annotationPath: `${converterContext.getEntitySetBasedAnnotationPath(collectionFacetDefinition.fullyQualifiedName)}/`,
			facets
		};
	}

	return undefined;
}

function getTargetAnnotationType(facetDefinition: FacetTypes): TargetAnnotationType {
	let annotationType = TargetAnnotationType.None;
	const annotationTypeMap: Record<string, TargetAnnotationType> = {
		"com.sap.vocabularies.UI.v1.DataPoint": TargetAnnotationType.DataPoint,
		"com.sap.vocabularies.UI.v1.Chart": TargetAnnotationType.Chart,
		"com.sap.vocabularies.UI.v1.Identification": TargetAnnotationType.Identification,
		"com.sap.vocabularies.Communication.v1.Contact": TargetAnnotationType.Contact,
		"com.sap.vocabularies.Communication.v1.Address": TargetAnnotationType.Address,
		"com.sap.vocabularies.UI.v1.FieldGroup": TargetAnnotationType.FieldGroup
	};
	// ReferenceURLFacet and CollectionFacet do not have Target property.
	if (facetDefinition.$Type !== UIAnnotationTypes.ReferenceURLFacet && facetDefinition.$Type !== UIAnnotationTypes.CollectionFacet) {
		annotationType = annotationTypeMap[facetDefinition.Target?.$target?.term] || TargetAnnotationType.None;
	}

	return annotationType;
}

function getFieldGroupFormData(facetDefinition: ReferenceFacetTypes, converterContext: ConverterContext): HeaderFormData {
	// split in this from annotation + getFieldGroupFromDefault
	if (!facetDefinition) {
		throw new Error("Cannot get FieldGroup form data without facet definition");
	}

	const formElements = insertCustomElements(
		getFormElementsFromAnnotations(facetDefinition, converterContext),
		getFormElementsFromManifest(facetDefinition, converterContext)
	);

	return {
		id: getHeaderFacetFormID(facetDefinition),
		label: facetDefinition.Label?.toString(),
		formElements
	};
}

/**
 * Creates an array of manifest-based FormElements.
 *
 * @param facetDefinition The definition of the facet
 * @param converterContext The converter context for the facet
 * @returns Annotation-based FormElements
 */
function getFormElementsFromAnnotations(facetDefinition: FacetTypes, converterContext: ConverterContext): AnnotationFormElement[] {
	const annotationBasedFormElements: AnnotationFormElement[] = [];

	// ReferenceURLFacet and CollectionFacet do not have Target property.
	if (facetDefinition.$Type !== UIAnnotationTypes.ReferenceURLFacet && facetDefinition.$Type !== UIAnnotationTypes.CollectionFacet) {
		(facetDefinition.Target?.$target as FieldGroup)?.Data.forEach((dataField: DataFieldAbstractTypes) => {
			if (!(dataField.annotations?.UI?.Hidden?.valueOf() === true)) {
				const semanticObjectAnnotationPath = getSemanticObjectPath(converterContext, dataField);
				if (
					(dataField.$Type === UIAnnotationTypes.DataField ||
						dataField.$Type === UIAnnotationTypes.DataFieldWithUrl ||
						dataField.$Type === UIAnnotationTypes.DataFieldWithNavigationPath ||
						dataField.$Type === UIAnnotationTypes.DataFieldWithIntentBasedNavigation ||
						dataField.$Type === UIAnnotationTypes.DataFieldWithAction) &&
					!isReferencePropertyStaticallyHidden(dataField)
				) {
					const { annotations } = dataField;
					annotationBasedFormElements.push({
						isValueMultilineText: dataField.Value?.$target?.annotations?.UI?.MultiLineText?.valueOf() === true,
						type: FormElementType.Annotation,
						key: KeyHelper.generateKeyFromDataField(dataField),
						visible: compileExpression(not(equal(getExpressionFromAnnotation(annotations?.UI?.Hidden?.valueOf()), true))),
						label: dataField.Value?.$target?.annotations?.Common?.Label || dataField.Label,
						idPrefix: getHeaderFacetFormID(facetDefinition, dataField),
						annotationPath: `${converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName)}/`,
						semanticObjectPath: semanticObjectAnnotationPath
					});
				} else if (
					dataField.$Type === UIAnnotationTypes.DataFieldForAnnotation &&
					!isReferencePropertyStaticallyHidden(dataField)
				) {
					const { annotations } = dataField;

					annotationBasedFormElements.push({
						isValueMultilineText: false, // was dataField.Target?.$target?.annotations?.UI?.MultiLineText?.valueOf() === true but that doesn't make sense as the target cannot have that annotation
						type: FormElementType.Annotation,
						key: KeyHelper.generateKeyFromDataField(dataField),
						visible: compileExpression(not(equal(getExpressionFromAnnotation(annotations?.UI?.Hidden?.valueOf()), true))),
						label: dataField.Target?.$target?.annotations?.Common?.Label?.toString() || dataField.Label?.toString(),
						idPrefix: getHeaderFacetFormID(facetDefinition, dataField),
						annotationPath: `${converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName)}/`,
						semanticObjectPath: semanticObjectAnnotationPath
					});
				}
			}
		});
	}

	return annotationBasedFormElements;
}

function getDataPointData(facetDefinition: FacetTypes, converterContext: ConverterContext): HeaderDataPointData {
	let type = HeaderDataPointType.Content;
	let semanticObjectPath;
	if (facetDefinition.$Type === UIAnnotationTypes.ReferenceFacet && !isAnnotationFieldStaticallyHidden(facetDefinition)) {
		if ((facetDefinition.Target?.$target as DataPoint)?.Visualization === "UI.VisualizationType/Progress") {
			type = HeaderDataPointType.ProgressIndicator;
		} else if ((facetDefinition.Target?.$target as DataPoint)?.Visualization === "UI.VisualizationType/Rating") {
			type = HeaderDataPointType.RatingIndicator;
		}
		const dataPoint = facetDefinition.Target?.$target as DataPoint;

		if (typeof dataPoint === "object") {
			if (dataPoint?.Value?.$target) {
				const property = dataPoint.Value.$target;
				if (property?.annotations?.Common?.SemanticObject !== undefined) {
					semanticObjectPath = converterContext.getEntitySetBasedAnnotationPath(property?.fullyQualifiedName);
				}
			}
		}
	}

	return { type, semanticObjectPath };
}

/**
 * Creates an annotation-based header facet.
 *
 * @param facetDefinition The definition of the facet
 * @param converterContext The converter context
 * @returns The created annotation-based header facet
 */
function createHeaderFacet(facetDefinition: FacetTypes, converterContext: ConverterContext): ObjectPageHeaderFacet | undefined {
	let headerFacet: ObjectPageHeaderFacet | undefined;
	switch (facetDefinition.$Type) {
		case UIAnnotationTypes.ReferenceFacet:
			headerFacet = createReferenceHeaderFacet(facetDefinition, facetDefinition, converterContext);
			break;

		case UIAnnotationTypes.CollectionFacet:
			headerFacet = createCollectionHeaderFacet(facetDefinition, converterContext);
			break;
		default:
			break;
	}

	return headerFacet;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Convert & Build Manifest Based Header Facets
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function generateBinding(requestGroupId?: string): string | undefined {
	if (!requestGroupId) {
		return undefined;
	}
	const groupId =
		["Heroes", "Decoration", "Workers", "LongRunners"].indexOf(requestGroupId) !== -1 ? `$auto.${requestGroupId}` : requestGroupId;

	return `{ path : '', parameters : { $$groupId : '${groupId}' } }`;
}

/**
 * Create a manifest based custom header facet.
 *
 * @param customHeaderFacetDefinition
 * @param headerFacetKey
 * @returns The manifest based custom header facet created
 */
function createCustomHeaderFacet(customHeaderFacetDefinition: ManifestHeaderFacet, headerFacetKey: string): CustomObjectPageHeaderFacet {
	const customHeaderFacetID = getCustomHeaderFacetID(headerFacetKey);

	let position: Position | undefined = customHeaderFacetDefinition.position;
	if (!position) {
		position = {
			placement: Placement.After
		};
	}
	// TODO for an non annotation fragment the name is mandatory -> Not checked
	return {
		facetType: FacetType.Reference,
		facets: {},
		type: customHeaderFacetDefinition.type,
		id: customHeaderFacetID,
		containerId: customHeaderFacetID,
		key: headerFacetKey,
		position: position,
		visible: customHeaderFacetDefinition.visible,
		fragmentName: customHeaderFacetDefinition.template || customHeaderFacetDefinition.name,
		title: customHeaderFacetDefinition.title,
		subTitle: customHeaderFacetDefinition.subTitle,
		stashed: customHeaderFacetDefinition.stashed || false,
		flexSettings: { ...{ designtime: FlexDesignTimeType.Default }, ...customHeaderFacetDefinition.flexSettings },
		binding: generateBinding(customHeaderFacetDefinition.requestGroupId),
		templateEdit: customHeaderFacetDefinition.templateEdit
	};
}
