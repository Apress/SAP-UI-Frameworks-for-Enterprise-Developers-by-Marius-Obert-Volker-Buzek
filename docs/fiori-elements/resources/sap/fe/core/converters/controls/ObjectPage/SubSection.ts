import type { Action } from "@sap-ux/vocabularies-types/Edm";
import { CommunicationAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/Communication";
import type {
	CollectionFacet,
	CollectionFacetTypes,
	DataFieldAbstractTypes,
	Emphasized,
	FacetTypes,
	FieldGroup,
	OperationGroupingType,
	ReferenceFacet,
	ReferenceFacetTypes
} from "@sap-ux/vocabularies-types/vocabularies/UI";
import { UIAnnotationTerms, UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log from "sap/base/Log";
import type { NavigationParameters } from "sap/fe/core/controllerextensions/InternalIntentBasedNavigation";
import type {
	BaseAction,
	CombinedAction,
	ConverterAction,
	CustomAction,
	OverrideTypeAction
} from "sap/fe/core/converters/controls/Common/Action";
import {
	ButtonType,
	getActionsFromManifest,
	getEnabledForAnnotationAction,
	getSemanticObjectMapping,
	isActionNavigable,
	removeDuplicateActions
} from "sap/fe/core/converters/controls/Common/Action";
import type { ChartVisualization } from "sap/fe/core/converters/controls/Common/Chart";
import type { TableVisualization } from "sap/fe/core/converters/controls/Common/Table";
import type { CustomObjectPageHeaderFacet, FlexSettings } from "sap/fe/core/converters/controls/ObjectPage/HeaderFacet";
import {
	getDesignTimeMetadataSettingsForHeaderFacet,
	getHeaderFacetsFromManifest,
	getStashedSettingsForHeaderFacet
} from "sap/fe/core/converters/controls/ObjectPage/HeaderFacet";
import { IssueCategory, IssueSeverity, IssueType } from "sap/fe/core/converters/helpers/IssueManager";
import { KeyHelper } from "sap/fe/core/converters/helpers/Key";
import type { BindingToolkitExpression, CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import {
	and,
	compileExpression,
	equal,
	fn,
	getExpressionFromAnnotation,
	ifElse,
	not,
	notEqual,
	or,
	pathInModel,
	ref,
	resolveBindingString
} from "sap/fe/core/helpers/BindingToolkit";
import { isPathAnnotationExpression } from "sap/fe/core/helpers/TypeGuards";
import { isActionWithDialog } from "../../annotations/DataField";
import type ConverterContext from "../../ConverterContext";
import type { ConfigurableObject, ConfigurableRecord, CustomElement } from "../../helpers/ConfigurableObject";
import { insertCustomElements, OverrideType, Placement } from "../../helpers/ConfigurableObject";
import { getCustomSubSectionID, getFormID, getSideContentID, getSubSectionID } from "../../helpers/ID";
import type { ManifestAction, ManifestSubSection } from "../../ManifestSettings";
import { ActionType } from "../../ManifestSettings";
import { getFormActions, getFormHiddenActions, getVisibilityEnablementFormMenuActions } from "../../objectPage/FormMenuActions";
import type { DataVisualizationDefinition } from "../Common/DataVisualization";
import { getDataVisualizationConfiguration } from "../Common/DataVisualization";
import type { FormDefinition } from "../Common/Form";
import { createFormDefinition, isReferenceFacet } from "../Common/Form";

export enum SubSectionType {
	Unknown = "Unknown", // Default Type
	Form = "Form",
	DataVisualization = "DataVisualization",
	XMLFragment = "XMLFragment",
	Placeholder = "Placeholder",
	Mixed = "Mixed",
	EmbeddedComponent = "EmbeddedComponent"
}

export type ObjectPageSubSection =
	| UnsupportedSubSection
	| FormSubSection
	| DataVisualizationSubSection
	| ContactSubSection
	| XMLFragmentSubSection
	| PlaceholderFragmentSubSection
	| MixedSubSection
	| ReuseComponentSubSection;

type BaseSubSection = {
	id: string;
	key: string;
	title: CompiledBindingToolkitExpression;
	annotationPath: string;
	type: SubSectionType;
	visible: CompiledBindingToolkitExpression;
	isVisibilityDynamic?: boolean | "";
	flexSettings?: FlexSettings;
	stashed?: boolean;
	level: number;
	content?: Array<ObjectPageSubSection>;
	sideContent?: SideContentDef;
	objectPageLazyLoaderEnabled: boolean;
	class?: string;
};

type UnsupportedSubSection = BaseSubSection & {
	text: string;
};

export type DataVisualizationSubSection = BaseSubSection & {
	type: SubSectionType.DataVisualization;
	presentation: DataVisualizationDefinition;
	showTitle: boolean | CompiledBindingToolkitExpression;
	titleVisible?: string | boolean;
	isPartOfPreview?: boolean;
};

type ContactSubSection = UnsupportedSubSection;

type XMLFragmentSubSection = Omit<BaseSubSection, "annotationPath"> & {
	type: SubSectionType.XMLFragment;
	template: string;
	actions: Record<string, CustomAction>;
};

type ReuseComponentSubSection = BaseSubSection & {
	type: SubSectionType.EmbeddedComponent;
	componentName: string;
	settings: string;
};

type PlaceholderFragmentSubSection = Omit<BaseSubSection, "annotationPath"> & {
	type: SubSectionType.Placeholder;
	actions: Record<string, CustomAction>;
};

export type MixedSubSection = BaseSubSection & {
	content: Array<ObjectPageSubSection>;
};

export type FormSubSection = BaseSubSection & {
	type: SubSectionType.Form;
	formDefinition: FormDefinition;
	actions: ConverterAction[] | BaseAction[];
	commandActions: Record<string, CustomAction>;
};

export type ObjectPageSection = ConfigurableObject & {
	id: string;
	title: CompiledBindingToolkitExpression;
	showTitle?: boolean;
	visible: CompiledBindingToolkitExpression;
	subSections: ObjectPageSubSection[];
};

type SideContentDef = {
	template?: string;
	id?: string;
	sideContentFallDown?: string;
	containerQuery?: string;
	visible?: boolean;
	equalSplit?: boolean;
};

export type CustomObjectPageSection = CustomElement<ObjectPageSection>;

export type CustomObjectPageSubSection = CustomElement<ObjectPageSubSection>;

const visualizationTerms: string[] = [
	UIAnnotationTerms.LineItem,
	UIAnnotationTerms.Chart,
	UIAnnotationTerms.PresentationVariant,
	UIAnnotationTerms.SelectionPresentationVariant
];

/**
 * Create subsections based on facet definition.
 *
 * @param facetCollection Collection of facets
 * @param converterContext The converter context
 * @param isHeaderSection True if header section is generated in this iteration
 * @returns The current subsections
 */
export function createSubSections(
	facetCollection: FacetTypes[],
	converterContext: ConverterContext,
	isHeaderSection?: boolean
): ObjectPageSubSection[] {
	// First we determine which sub section we need to create
	const facetsToCreate = facetCollection.reduce((facetsToCreate: FacetTypes[], facetDefinition) => {
		switch (facetDefinition.$Type) {
			case UIAnnotationTypes.ReferenceFacet:
				facetsToCreate.push(facetDefinition);
				break;
			case UIAnnotationTypes.CollectionFacet:
				// TODO If the Collection Facet has a child of type Collection Facet we bring them up one level (Form + Table use case) ?
				// first case facet Collection is combination of collection and reference facet or not all facets are reference facets.
				if (facetDefinition.Facets.find((facetType) => facetType.$Type === UIAnnotationTypes.CollectionFacet)) {
					facetsToCreate.splice(facetsToCreate.length, 0, ...facetDefinition.Facets);
				} else {
					facetsToCreate.push(facetDefinition);
				}
				break;
			case UIAnnotationTypes.ReferenceURLFacet:
				// Not supported
				break;
		}
		return facetsToCreate;
	}, []);

	// Then we create the actual subsections
	return facetsToCreate.map((facet) =>
		createSubSection(facet, facetsToCreate, converterContext, 0, !(facet as CollectionFacet)?.Facets?.length, isHeaderSection)
	);
}

/**
 * Creates subsections based on the definition of the custom header facet.
 *
 * @param converterContext The converter context
 * @returns The current subsections
 */
export function createCustomHeaderFacetSubSections(converterContext: ConverterContext): ObjectPageSubSection[] {
	const customHeaderFacets: Record<string, CustomObjectPageHeaderFacet> = getHeaderFacetsFromManifest(
		converterContext.getManifestWrapper().getHeaderFacets()
	);
	const aCustomHeaderFacets: CustomObjectPageHeaderFacet[] = [];
	Object.keys(customHeaderFacets).forEach(function (key) {
		aCustomHeaderFacets.push(customHeaderFacets[key]);
		return aCustomHeaderFacets;
	});
	const facetsToCreate = aCustomHeaderFacets.reduce((facetsToCreate: CustomObjectPageHeaderFacet[], customHeaderFacet) => {
		if (customHeaderFacet.templateEdit) {
			facetsToCreate.push(customHeaderFacet);
		}
		return facetsToCreate;
	}, []);

	return facetsToCreate.map((customHeaderFacet) => createCustomHeaderFacetSubSection(customHeaderFacet));
}

/**
 * Creates a subsection based on a custom header facet.
 *
 * @param customHeaderFacet A custom header facet
 * @returns A definition for a subsection
 */
function createCustomHeaderFacetSubSection(customHeaderFacet: CustomObjectPageHeaderFacet): ObjectPageSubSection {
	const subSectionID = getCustomSubSectionID(customHeaderFacet.key);
	const subSection: XMLFragmentSubSection = {
		id: subSectionID,
		key: customHeaderFacet.key,
		title: customHeaderFacet.title,
		type: SubSectionType.XMLFragment,
		template: customHeaderFacet.templateEdit || "",
		visible: customHeaderFacet.visible,
		level: 1,
		sideContent: undefined,
		stashed: customHeaderFacet.stashed,
		flexSettings: customHeaderFacet.flexSettings,
		actions: {},
		objectPageLazyLoaderEnabled: false
	};
	return subSection;
}

// function isTargetForCompliant(annotationPath: AnnotationPath) {
// 	return /.*com\.sap\.vocabularies\.UI\.v1\.(FieldGroup|Identification|DataPoint|StatusInfo).*/.test(annotationPath.value);
// }
const getSubSectionKey = (facetDefinition: FacetTypes, fallback: string): string => {
	return facetDefinition.ID?.toString() || facetDefinition.Label?.toString() || fallback;
};
/**
 * Adds Form menu action to all form actions, removes duplicate actions and hidden actions.
 *
 * @param actions The actions involved
 * @param facetDefinition The definition for the facet
 * @param converterContext The converter context
 * @returns The form menu actions
 */
function addFormMenuActions(actions: ConverterAction[], facetDefinition: FacetTypes, converterContext: ConverterContext): CombinedAction {
	const hiddenActions: BaseAction[] = getFormHiddenActions(facetDefinition, converterContext) || [],
		formActions: ConfigurableRecord<ManifestAction> = getFormActions(facetDefinition, converterContext),
		manifestActions = getActionsFromManifest(formActions, converterContext, actions, undefined, undefined, hiddenActions),
		actionOverwriteConfig: OverrideTypeAction = {
			enabled: OverrideType.overwrite,
			visible: OverrideType.overwrite,
			command: OverrideType.overwrite
		},
		formAllActions = insertCustomElements(actions, manifestActions.actions, actionOverwriteConfig);
	return {
		actions: formAllActions ? getVisibilityEnablementFormMenuActions(removeDuplicateActions(formAllActions)) : actions,
		commandActions: manifestActions.commandActions
	};
}

/**
 * Retrieves the action form a facet.
 *
 * @param facetDefinition
 * @param converterContext
 * @returns The current facet actions
 */
function getFacetActions(facetDefinition: FacetTypes, converterContext: ConverterContext): CombinedAction {
	let actions: ConverterAction[] = [];
	switch (facetDefinition.$Type) {
		case UIAnnotationTypes.CollectionFacet:
			actions = (
				facetDefinition.Facets.filter((subFacetDefinition) => isReferenceFacet(subFacetDefinition)) as ReferenceFacetTypes[]
			).reduce(
				(actionReducer: ConverterAction[], referenceFacet) =>
					createFormActionReducer(actionReducer, referenceFacet, converterContext),
				[]
			);
			break;
		case UIAnnotationTypes.ReferenceFacet:
			actions = createFormActionReducer([], facetDefinition, converterContext);
			break;
		default:
			break;
	}
	return addFormMenuActions(actions, facetDefinition, converterContext);
}
/**
 * Returns the button type based on @UI.Emphasized annotation.
 *
 * @param emphasized Emphasized annotation value.
 * @returns The button type or path based expression.
 */
function getButtonType(emphasized: Emphasized | undefined): ButtonType {
	// Emphasized is a boolean so if it's equal to true we show the button as Ghost, otherwise as Transparent
	const buttonTypeCondition = equal(getExpressionFromAnnotation(emphasized), true);
	return compileExpression(ifElse(buttonTypeCondition, ButtonType.Ghost, ButtonType.Transparent)) as ButtonType;
}

/**
 * Create a subsection based on FacetTypes.
 *
 * @param facetDefinition
 * @param facetsToCreate
 * @param converterContext
 * @param level
 * @param hasSingleContent
 * @param isHeaderSection
 * @returns A subsection definition
 */
export function createSubSection(
	facetDefinition: FacetTypes,
	facetsToCreate: FacetTypes[],
	converterContext: ConverterContext,
	level: number,
	hasSingleContent: boolean,
	isHeaderSection?: boolean
): ObjectPageSubSection {
	const subSectionID = getSubSectionID(facetDefinition);
	const oHiddenAnnotation = facetDefinition.annotations?.UI?.Hidden;
	const isVisibleExpression = not(equal(true, getExpressionFromAnnotation(oHiddenAnnotation)));
	const isVisible = compileExpression(isVisibleExpression);
	const isDynamicExpression =
		isVisible !== undefined &&
		typeof isVisible === "string" &&
		isVisible.indexOf("{=") === 0 &&
		!isPathAnnotationExpression(oHiddenAnnotation);
	const isVisibleDynamicExpression =
		isVisible && isDynamicExpression
			? isVisible.substring(isVisible.indexOf("{=") + 2, isVisible.lastIndexOf("}")) !== undefined
			: false;
	const title = compileExpression(getExpressionFromAnnotation(facetDefinition.Label));
	const subSection: BaseSubSection = {
		id: subSectionID,
		key: getSubSectionKey(facetDefinition, subSectionID),
		title: title,
		type: SubSectionType.Unknown,
		annotationPath: converterContext.getEntitySetBasedAnnotationPath(facetDefinition.fullyQualifiedName),
		visible: isVisible,
		isVisibilityDynamic: isDynamicExpression,
		level: level,
		sideContent: undefined,
		objectPageLazyLoaderEnabled: converterContext.getManifestWrapper().getEnableLazyLoading()
	};
	if (isHeaderSection) {
		subSection.stashed = getStashedSettingsForHeaderFacet(facetDefinition, facetDefinition, converterContext);
		subSection.flexSettings = {
			designtime: getDesignTimeMetadataSettingsForHeaderFacet(facetDefinition, facetDefinition, converterContext)
		};
	}
	let unsupportedText = "";
	level++;
	switch (facetDefinition.$Type) {
		case UIAnnotationTypes.CollectionFacet:
			const facets = facetDefinition.Facets;

			// Filter for all facets of this subsection that are referring to an annotation describing a visualization (e.g. table or chart)
			const visualizationFacets = facets
				.map((facet, index) => ({ index, facet })) // Remember the index assigned to each facet
				.filter(({ facet }) => {
					return visualizationTerms.includes((facet as ReferenceFacet).Target?.$target?.term);
				});

			// Filter out all visualization facets; "visualizationFacets" and "nonVisualizationFacets" are disjoint
			const nonVisualizationFacets = facets.filter(
				(facet) => !visualizationFacets.find((visualization) => visualization.facet === facet)
			);

			if (visualizationFacets.length > 0) {
				// CollectionFacets with visualizations must be handled separately as they cannot be included in forms
				const visualizationContent: ObjectPageSubSection[] = [];
				const formContent: ObjectPageSubSection[] = [];
				const mixedContent: ObjectPageSubSection[] = [];

				// Create each visualization facet as if it was its own subsection (via recursion), and keep their relative ordering
				for (const { facet } of visualizationFacets) {
					visualizationContent.push(createSubSection(facet, [], converterContext, level, true, isHeaderSection));
				}

				if (nonVisualizationFacets.length > 0) {
					// This subsection includes visualizations and other content, so it is a "Mixed" subsection
					Log.warning(
						`Warning: CollectionFacet '${facetDefinition.ID}' includes a combination of either a chart or a table and other content. This can lead to rendering issues. Consider moving the chart or table into a separate CollectionFacet.`
					);

					const fakeFormFacet = { ...facetDefinition };
					fakeFormFacet.Facets = nonVisualizationFacets;
					// Create a joined form of all facets that are not referring to visualizations
					formContent.push(createSubSection(fakeFormFacet, [], converterContext, level, hasSingleContent, isHeaderSection));
				}

				// Merge the visualization content with the form content
				if (visualizationFacets.find(({ index }) => index === 0)) {
					// If the first facet is a visualization, display the visualizations first
					mixedContent.push(...visualizationContent);
					mixedContent.push(...formContent);
				} else {
					// Otherwise, display the form first
					mixedContent.push(...formContent);
					mixedContent.push(...visualizationContent);
				}

				const mixedSubSection: MixedSubSection = {
					...subSection,
					type: SubSectionType.Mixed,
					level: level,
					content: mixedContent
				};
				return mixedSubSection;
			} else {
				// This CollectionFacet only includes content that can be rendered in a merged form
				const facetActions = getFacetActions(facetDefinition, converterContext),
					formCollectionSubSection: FormSubSection = {
						...subSection,
						type: SubSectionType.Form,
						formDefinition: createFormDefinition(facetDefinition, isVisible, converterContext, facetActions.actions),
						level: level,
						actions: facetActions.actions.filter((action) => action.facetName === undefined),
						commandActions: facetActions.commandActions
					};
				return formCollectionSubSection;
			}
		case UIAnnotationTypes.ReferenceFacet:
			if (!facetDefinition.Target.$target) {
				unsupportedText = `Unable to find annotationPath ${facetDefinition.Target.value}`;
			} else {
				switch (facetDefinition.Target.$target.term) {
					case UIAnnotationTerms.LineItem:
					case UIAnnotationTerms.Chart:
					case UIAnnotationTerms.PresentationVariant:
					case UIAnnotationTerms.SelectionPresentationVariant:
						const presentation = getDataVisualizationConfiguration(
							facetDefinition.Target.value,
							getCondensedTableLayoutCompliance(facetDefinition, facetsToCreate, converterContext),
							converterContext,
							undefined,
							isHeaderSection
						);
						const subSectionTitle: string = subSection.title ? subSection.title : "";
						const controlTitle =
							(presentation.visualizations[0] as TableVisualization)?.annotation?.title ||
							(presentation.visualizations[0] as ChartVisualization)?.title;
						const isPartOfPreview = facetDefinition.annotations?.UI?.PartOfPreview?.valueOf() !== false;
						const showTitle = getTitleVisibility(controlTitle ?? "", subSectionTitle, hasSingleContent);

						// Either calculate the title visibility statically or dynamically
						// Additionally to checking whether a title exists,
						// we also need to check that the facet title is not the same as the control (i.e. visualization) title;
						// this is done by including "showTitle" in the and expression
						const titleVisible = ifElse(
							isDynamicExpression,
							and(isVisibleDynamicExpression, not(equal(title, "undefined")), showTitle),
							and(isVisible !== undefined, title !== "undefined", title !== undefined, isVisibleExpression, showTitle)
						);

						const dataVisualizationSubSection: DataVisualizationSubSection = {
							...subSection,
							type: SubSectionType.DataVisualization,
							level: level,
							presentation: presentation,
							showTitle: compileExpression(showTitle), // This is used on the ObjectPageSubSection
							isPartOfPreview,
							titleVisible: compileExpression(titleVisible) // This is used to hide the actual Title control
						};
						return dataVisualizationSubSection;

					case UIAnnotationTerms.FieldGroup:
					case UIAnnotationTerms.Identification:
					case UIAnnotationTerms.DataPoint:
					case UIAnnotationTerms.StatusInfo:
					case CommunicationAnnotationTerms.Contact:
						// All those element belong to a from facet
						const facetActions = getFacetActions(facetDefinition, converterContext),
							formElementSubSection: FormSubSection = {
								...subSection,
								type: SubSectionType.Form,
								level: level,
								formDefinition: createFormDefinition(facetDefinition, isVisible, converterContext, facetActions.actions),
								actions: facetActions.actions.filter((action) => action.facetName === undefined),
								commandActions: facetActions.commandActions
							};
						return formElementSubSection;

					default:
						unsupportedText = `For ${facetDefinition.Target.$target.term} Fragment`;
						break;
				}
			}
			break;
		case UIAnnotationTypes.ReferenceURLFacet:
			unsupportedText = "For Reference URL Facet";
			break;
		default:
			break;
	}
	// If we reach here we ended up with an unsupported SubSection type
	const unsupportedSubSection: UnsupportedSubSection = {
		...subSection,
		text: unsupportedText
	};
	return unsupportedSubSection;
}

/**
 * Checks whether to hide or show subsection title.
 *
 * @param controlTitle
 * @param subSectionTitle
 * @param hasSingleContent
 * @returns Boolean value or expression for showTitle
 */
export function getTitleVisibility(
	controlTitle: string,
	subSectionTitle: string,
	hasSingleContent: boolean
): BindingToolkitExpression<boolean> {
	// visible shall be true if there are multiple content or if the control and subsection title are different
	return or(not(hasSingleContent), notEqual(resolveBindingString(controlTitle), resolveBindingString(subSectionTitle)));
}

function createFormActionReducer(
	actions: ConverterAction[],
	facetDefinition: ReferenceFacetTypes,
	converterContext: ConverterContext
): ConverterAction[] {
	const referenceTarget = facetDefinition.Target.$target;
	const targetValue = facetDefinition.Target.value;
	let manifestActions: Record<string, CustomAction> = {};
	let dataFieldCollection: DataFieldAbstractTypes[] = [];
	let navigationPropertyPath: string | undefined;
	[navigationPropertyPath] = targetValue.split("@");
	if (navigationPropertyPath.length > 0) {
		if (navigationPropertyPath.lastIndexOf("/") === navigationPropertyPath.length - 1) {
			navigationPropertyPath = navigationPropertyPath.substr(0, navigationPropertyPath.length - 1);
		}
	} else {
		navigationPropertyPath = undefined;
	}

	if (referenceTarget) {
		switch (referenceTarget.term) {
			case UIAnnotationTerms.FieldGroup:
				dataFieldCollection = (referenceTarget as FieldGroup).Data;
				manifestActions = getActionsFromManifest(
					converterContext.getManifestControlConfiguration(referenceTarget).actions,
					converterContext,
					undefined,
					undefined,
					undefined,
					undefined,
					facetDefinition.fullyQualifiedName
				).actions;
				break;
			case UIAnnotationTerms.Identification:
			case UIAnnotationTerms.StatusInfo:
				if (referenceTarget.qualifier) {
					dataFieldCollection = referenceTarget;
				}
				break;
			default:
				break;
		}
	}

	actions = dataFieldCollection.reduce((actionReducer, dataField: DataFieldAbstractTypes) => {
		switch (dataField.$Type) {
			case UIAnnotationTypes.DataFieldForIntentBasedNavigation:
				if (dataField.RequiresContext?.valueOf() === true) {
					converterContext
						.getDiagnostics()
						.addIssue(IssueCategory.Annotation, IssueSeverity.Low, IssueType.MALFORMED_DATAFIELD_FOR_IBN.REQUIRESCONTEXT);
				}
				if (dataField.Inline?.valueOf() === true) {
					converterContext
						.getDiagnostics()
						.addIssue(IssueCategory.Annotation, IssueSeverity.Low, IssueType.MALFORMED_DATAFIELD_FOR_IBN.INLINE);
				}
				if (dataField.Determining?.valueOf() === true) {
					converterContext
						.getDiagnostics()
						.addIssue(IssueCategory.Annotation, IssueSeverity.Low, IssueType.MALFORMED_DATAFIELD_FOR_IBN.DETERMINING);
				}
				const mNavigationParameters: NavigationParameters = {};
				if (dataField.Mapping) {
					mNavigationParameters.semanticObjectMapping = getSemanticObjectMapping(dataField.Mapping);
				}
				actionReducer.push({
					type: ActionType.DataFieldForIntentBasedNavigation,
					id: getFormID(facetDefinition, dataField),
					key: KeyHelper.generateKeyFromDataField(dataField),
					text: dataField.Label?.toString(),
					annotationPath: "",
					enabled:
						dataField.NavigationAvailable !== undefined
							? compileExpression(equal(getExpressionFromAnnotation(dataField.NavigationAvailable?.valueOf()), true))
							: "true",
					visible: compileExpression(not(equal(getExpressionFromAnnotation(dataField.annotations?.UI?.Hidden?.valueOf()), true))),
					buttonType: getButtonType(dataField.annotations?.UI?.Emphasized),
					press: compileExpression(
						fn("._intentBasedNavigation.navigate", [
							getExpressionFromAnnotation(dataField.SemanticObject),
							getExpressionFromAnnotation(dataField.Action),
							mNavigationParameters
						])
					),
					customData: compileExpression({
						semanticObject: getExpressionFromAnnotation(dataField.SemanticObject),
						action: getExpressionFromAnnotation(dataField.Action)
					})
				});
				break;
			case UIAnnotationTypes.DataFieldForAction:
				const formManifestActionsConfiguration = converterContext.getManifestControlConfiguration(referenceTarget).actions;
				const key: string = KeyHelper.generateKeyFromDataField(dataField);
				actionReducer.push({
					type: ActionType.DataFieldForAction,
					id: getFormID(facetDefinition, dataField),
					key: key,
					text: dataField.Label?.toString(),
					annotationPath: "",
					enabled: getEnabledForAnnotationAction(converterContext, dataField.ActionTarget),
					binding: navigationPropertyPath ? `{ 'path' : '${navigationPropertyPath}'}` : undefined,
					visible: compileExpression(not(equal(getExpressionFromAnnotation(dataField.annotations?.UI?.Hidden?.valueOf()), true))),
					requiresDialog: isActionWithDialog(dataField),
					buttonType: getButtonType(dataField.annotations?.UI?.Emphasized),
					press: compileExpression(
						fn(
							"invokeAction",
							[
								dataField.Action,
								{
									contexts: fn("getBindingContext", [], pathInModel("", "$source")),
									invocationGrouping: (dataField.InvocationGrouping === "UI.OperationGroupingType/ChangeSet"
										? "ChangeSet"
										: "Isolated") as OperationGroupingType,
									label: getExpressionFromAnnotation(dataField.Label),
									model: fn("getModel", [], pathInModel("/", "$source")),
									isNavigable: isActionNavigable(
										formManifestActionsConfiguration && formManifestActionsConfiguration[key]
									)
								}
							],
							ref(".editFlow")
						)
					),
					facetName: dataField.Inline ? facetDefinition.fullyQualifiedName : undefined
				});
				break;
			default:
				break;
		}
		return actionReducer;
	}, actions);
	// Overwriting of actions happens in addFormMenuActions
	return insertCustomElements(actions, manifestActions);
}

export function isDialog(actionDefinition: Action | undefined): string {
	if (actionDefinition) {
		const bCritical = actionDefinition.annotations?.Common?.IsActionCritical;
		if (actionDefinition.parameters.length > 1 || bCritical) {
			return "Dialog";
		} else {
			return "None";
		}
	} else {
		return "None";
	}
}

export function createCustomSubSections(
	manifestSubSections: Record<string, ManifestSubSection>,
	converterContext: ConverterContext
): Record<string, CustomObjectPageSubSection> {
	const subSections: Record<string, CustomObjectPageSubSection> = {};
	Object.keys(manifestSubSections).forEach(
		(subSectionKey) =>
			(subSections[subSectionKey] = createCustomSubSection(manifestSubSections[subSectionKey], subSectionKey, converterContext))
	);
	return subSections;
}

export function createCustomSubSection(
	manifestSubSection: ManifestSubSection,
	subSectionKey: string,
	converterContext: ConverterContext
): CustomObjectPageSubSection {
	const sideContent: SideContentDef | undefined = manifestSubSection.sideContent
		? {
				template: manifestSubSection.sideContent.template,
				id: getSideContentID(subSectionKey),
				visible: false,
				equalSplit: manifestSubSection.sideContent.equalSplit
		  }
		: undefined;
	let position = manifestSubSection.position;
	if (!position) {
		position = {
			placement: Placement.After
		};
	}
	const isVisible = manifestSubSection.visible !== undefined ? manifestSubSection.visible : true;
	const isDynamicExpression = isVisible && typeof isVisible === "string" && isVisible.indexOf("{=") === 0;
	const manifestActions = getActionsFromManifest(manifestSubSection.actions, converterContext);
	const subSectionDefinition = {
		type: SubSectionType.Unknown,
		id: manifestSubSection.id || getCustomSubSectionID(subSectionKey),
		actions: manifestActions.actions,
		key: subSectionKey,
		title: manifestSubSection.title,
		level: 1,
		position: position,
		visible: manifestSubSection.visible !== undefined ? manifestSubSection.visible : "true",
		sideContent: sideContent,
		isVisibilityDynamic: isDynamicExpression,
		objectPageLazyLoaderEnabled: manifestSubSection.enableLazyLoading ?? false,
		componentName: "",
		settings: ""
	};
	if (manifestSubSection.template || manifestSubSection.name) {
		subSectionDefinition.type = SubSectionType.XMLFragment;
		(subSectionDefinition as unknown as XMLFragmentSubSection).template = manifestSubSection.template || manifestSubSection.name || "";
	} else if (manifestSubSection.embeddedComponent !== undefined) {
		subSectionDefinition.type = SubSectionType.EmbeddedComponent;
		subSectionDefinition.componentName = manifestSubSection.embeddedComponent.name;
		if (manifestSubSection.embeddedComponent.settings !== undefined) {
			subSectionDefinition.settings = JSON.stringify(manifestSubSection.embeddedComponent.settings);
		}
	} else {
		subSectionDefinition.type = SubSectionType.Placeholder;
	}
	return subSectionDefinition as CustomObjectPageSubSection;
}

/**
 * Evaluate if the condensed mode can be applied on the table.
 *
 * @param currentFacet
 * @param facetsToCreateInSection
 * @param converterContext
 * @returns `true` for compliant, false otherwise
 */
function getCondensedTableLayoutCompliance(
	currentFacet: FacetTypes,
	facetsToCreateInSection: FacetTypes[],
	converterContext: ConverterContext
): boolean {
	const manifestWrapper = converterContext.getManifestWrapper();
	if (manifestWrapper.useIconTabBar()) {
		// If the OP use the tab based we check if the facets that will be created for this section are all non visible
		return hasNoOtherVisibleTableInTargets(currentFacet, facetsToCreateInSection);
	} else {
		const entityType = converterContext.getEntityType();
		if (entityType.annotations?.UI?.Facets?.length && entityType.annotations?.UI?.Facets?.length > 1) {
			return hasNoOtherVisibleTableInTargets(currentFacet, facetsToCreateInSection);
		} else {
			return true;
		}
	}
}

function hasNoOtherVisibleTableInTargets(currentFacet: FacetTypes, facetsToCreateInSection: FacetTypes[]): boolean {
	return facetsToCreateInSection.every(function (subFacet) {
		if (subFacet !== currentFacet) {
			if (subFacet.$Type === UIAnnotationTypes.ReferenceFacet) {
				const refFacet = subFacet;
				if (
					refFacet.Target?.$target?.term === UIAnnotationTerms.LineItem ||
					refFacet.Target?.$target?.term === UIAnnotationTerms.PresentationVariant ||
					refFacet.Target.$target?.term === UIAnnotationTerms.SelectionPresentationVariant
				) {
					return refFacet.annotations?.UI?.Hidden !== undefined ? refFacet.annotations?.UI?.Hidden : false;
				}
				return true;
			} else {
				const subCollectionFacet = subFacet as CollectionFacetTypes;
				return subCollectionFacet.Facets.every(function (facet) {
					const subRefFacet = facet as ReferenceFacetTypes;
					if (
						subRefFacet.Target?.$target?.term === UIAnnotationTerms.LineItem ||
						subRefFacet.Target?.$target?.term === UIAnnotationTerms.PresentationVariant ||
						subRefFacet.Target?.$target?.term === UIAnnotationTerms.SelectionPresentationVariant
					) {
						return subRefFacet.annotations?.UI?.Hidden !== undefined ? subRefFacet.annotations?.UI?.Hidden : false;
					}
					return true;
				});
			}
		}
		return true;
	});
}
