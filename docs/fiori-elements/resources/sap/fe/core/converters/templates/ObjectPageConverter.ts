import type { EntityType } from "@sap-ux/vocabularies-types";
import type { FacetTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import type { BaseAction, CombinedAction, CustomAction, OverrideTypeAction } from "sap/fe/core/converters/controls/Common/Action";
import { getActionsFromManifest, removeDuplicateActions } from "sap/fe/core/converters/controls/Common/Action";
import type { TableControlConfiguration, TableVisualization } from "sap/fe/core/converters/controls/Common/Table";
import {
	getFooterDefaultActions,
	getHeaderDefaultActions,
	getHiddenHeaderActions
} from "sap/fe/core/converters/objectPage/HeaderAndFooterAction";
import type { BindingToolkitExpression, CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { compileExpression, constant, equal, getExpressionFromAnnotation, ifElse, not } from "sap/fe/core/helpers/BindingToolkit";
import type { Avatar } from "../controls/ObjectPage/Avatar";
import { getAvatar } from "../controls/ObjectPage/Avatar";
import type { ObjectPageHeaderFacet } from "../controls/ObjectPage/HeaderFacet";
import { getHeaderFacetsFromAnnotations, getHeaderFacetsFromManifest } from "../controls/ObjectPage/HeaderFacet";
import type {
	CustomObjectPageSection,
	DataVisualizationSubSection,
	FormSubSection,
	ObjectPageSection,
	ObjectPageSubSection
} from "../controls/ObjectPage/SubSection";
import {
	createCustomHeaderFacetSubSections,
	createCustomSubSections,
	createSubSections,
	SubSectionType
} from "../controls/ObjectPage/SubSection";
import type ConverterContext from "../ConverterContext";
import { UI } from "../helpers/BindingHelper";
import type { ConfigurableRecord, Position } from "../helpers/ConfigurableObject";
import { insertCustomElements, OverrideType, Placement } from "../helpers/ConfigurableObject";
import { getCustomSectionID, getEditableHeaderSectionID, getSectionID } from "../helpers/ID";
import type { ManifestSection, ManifestSubSection } from "../ManifestSettings";
import { TemplateType, VisualizationType } from "../ManifestSettings";
import type { PageDefinition } from "../TemplateConverter";

export type ObjectPageDefinition = PageDefinition & {
	header: {
		visible: boolean;
		section?: ObjectPageSection;
		facets: ObjectPageHeaderFacet[];
		actions: BaseAction[];
		showContent: CompiledBindingToolkitExpression;
		hasContent: boolean;
		avatar?: Avatar;
		title: {
			expandedImageVisible: CompiledBindingToolkitExpression;
		};
	};
	sections: ObjectPageSection[];
	footerActions: BaseAction[];
	headerCommandActions: Record<string, CustomAction>;
	footerCommandActions: Record<string, CustomAction>;
	showAnchorBar: boolean;
	useIconTabBar: boolean;
};

const getSectionKey = (facetDefinition: FacetTypes, fallback: string): string => {
	return facetDefinition.ID?.toString() || facetDefinition.Label?.toString() || fallback;
};

/**
 * Creates a section that represents the editable header part; it is only visible in edit mode.
 *
 * @param converterContext The converter context
 * @param allHeaderFacets The converter context
 * @returns The section representing the editable header parts
 */
export function createEditableHeaderSection(
	converterContext: ConverterContext,
	allHeaderFacets: ObjectPageHeaderFacet[]
): ObjectPageSection {
	const editableHeaderSectionID = getEditableHeaderSectionID();
	const headerFacets = converterContext.getEntityType().annotations?.UI?.HeaderFacets;
	const headerfacetSubSections = headerFacets ? createSubSections(headerFacets, converterContext, true) : [];
	const customHeaderFacetSubSections = createCustomHeaderFacetSubSections(converterContext);
	let allHeaderFacetsSubSections: ObjectPageSubSection[] = [];
	if (customHeaderFacetSubSections.length > 0) {
		// merge annotation based header facets and custom header facets in the right order
		let i = 0;
		allHeaderFacets.forEach(function (item) {
			// hidden header facets are not included in allHeaderFacets array => add them anyway
			while (headerfacetSubSections.length > i && headerfacetSubSections[i].visible === "false") {
				allHeaderFacetsSubSections.push(headerfacetSubSections[i]);
				i++;
			}
			if (
				headerfacetSubSections.length > i &&
				(item.key === headerfacetSubSections[i].key ||
					// for header facets with no id the keys of header facet and subsection are different => check only the last part
					item.key.slice(item.key.lastIndexOf("::") + 2) ===
						headerfacetSubSections[i].key.slice(headerfacetSubSections[i].key.lastIndexOf("::") + 2))
			) {
				allHeaderFacetsSubSections.push(headerfacetSubSections[i]);
				i++;
			} else {
				customHeaderFacetSubSections.forEach(function (customItem) {
					if (item.key === customItem.key) {
						allHeaderFacetsSubSections.push(customItem);
					}
				});
			}
		});
	} else {
		allHeaderFacetsSubSections = headerfacetSubSections;
	}
	const headerSection: ObjectPageSection = {
		id: editableHeaderSectionID,
		key: "EditableHeaderContent",
		title: "{sap.fe.i18n>T_COMMON_OBJECT_PAGE_HEADER_SECTION}",
		visible: compileExpression(UI.IsEditable),
		subSections: allHeaderFacetsSubSections
	};
	return headerSection;
}

/**
 * Creates a definition for a section based on the Facet annotation.
 *
 * @param converterContext The converter context
 * @returns All sections
 */
function getSectionsFromAnnotation(converterContext: ConverterContext): ObjectPageSection[] {
	const entityType = converterContext.getEntityType();
	const objectPageSections: ObjectPageSection[] =
		entityType.annotations?.UI?.Facets?.map((facetDefinition: FacetTypes) =>
			getSectionFromAnnotation(facetDefinition, converterContext)
		) || [];
	return objectPageSections;
}

/**
 * Create an annotation based section.
 *
 * @param facet
 * @param converterContext
 * @returns The current section
 */
function getSectionFromAnnotation(facet: FacetTypes, converterContext: ConverterContext): ObjectPageSection {
	const sectionID = getSectionID(facet);
	const section: ObjectPageSection = {
		id: sectionID,
		key: getSectionKey(facet, sectionID),
		title: facet.Label ? compileExpression(getExpressionFromAnnotation(facet.Label)) : undefined,
		showTitle: !!facet.Label,
		visible: compileExpression(not(equal(getExpressionFromAnnotation(facet.annotations?.UI?.Hidden?.valueOf()), true))),
		subSections: createSubSections([facet], converterContext)
	};
	return section;
}

/**
 * Creates section definitions based on the manifest definitions.
 *
 * @param manifestSections The sections defined in the manifest
 * @param converterContext
 * @returns The sections defined in the manifest
 */
function getSectionsFromManifest(
	manifestSections: ConfigurableRecord<ManifestSection>,
	converterContext: ConverterContext
): Record<string, CustomObjectPageSection> {
	const sections: Record<string, CustomObjectPageSection> = {};
	Object.keys(manifestSections).forEach((manifestSectionKey) => {
		sections[manifestSectionKey] = getSectionFromManifest(manifestSections[manifestSectionKey], manifestSectionKey, converterContext);
	});
	return sections;
}

/**
 * Create a manifest-based custom section.
 *
 * @param customSectionDefinition
 * @param sectionKey
 * @param converterContext
 * @returns The current custom section
 */
function getSectionFromManifest(
	customSectionDefinition: ManifestSection,
	sectionKey: string,
	converterContext: ConverterContext
): CustomObjectPageSection {
	const customSectionID = customSectionDefinition.id || getCustomSectionID(sectionKey);
	let position: Position | undefined = customSectionDefinition.position;
	if (!position) {
		position = {
			placement: Placement.After
		};
	}
	let manifestSubSections: Record<string, ManifestSubSection>;
	if (!customSectionDefinition.subSections) {
		// If there is no subSection defined, we add the content of the custom section as subsections
		// and make sure to set the visibility to 'true', as the actual visibility is handled by the section itself
		manifestSubSections = {
			[sectionKey]: {
				...customSectionDefinition,
				position: undefined,
				visible: "true"
			}
		};
	} else {
		manifestSubSections = customSectionDefinition.subSections;
	}
	const subSections = createCustomSubSections(manifestSubSections, converterContext);

	const customSection: CustomObjectPageSection = {
		id: customSectionID,
		key: sectionKey,
		title: customSectionDefinition.title,
		showTitle: !!customSectionDefinition.title,
		visible: customSectionDefinition.visible !== undefined ? customSectionDefinition.visible : "true",
		position: position,
		subSections: subSections as any
	};
	return customSection;
}

/**
 * Retrieves the ObjectPage header actions (both the default ones and the custom ones defined in the manifest).
 *
 * @param converterContext The converter context
 * @returns An array containing all the actions for this ObjectPage header
 */
export const getHeaderActions = function (converterContext: ConverterContext): CombinedAction {
	const aAnnotationHeaderActions: BaseAction[] = getHeaderDefaultActions(converterContext);
	const manifestWrapper = converterContext.getManifestWrapper();
	const manifestActions = getActionsFromManifest(
		manifestWrapper.getHeaderActions(),
		converterContext,
		aAnnotationHeaderActions,
		undefined,
		undefined,
		getHiddenHeaderActions(converterContext)
	);
	const actionOverwriteConfig: OverrideTypeAction = {
		isNavigable: OverrideType.overwrite,
		enabled: OverrideType.overwrite,
		visible: OverrideType.overwrite,
		defaultValuesExtensionFunction: OverrideType.overwrite,
		command: OverrideType.overwrite
	};
	const headerActions = insertCustomElements(aAnnotationHeaderActions, manifestActions.actions, actionOverwriteConfig);
	return {
		actions: removeDuplicateActions(headerActions),
		commandActions: manifestActions.commandActions
	};
};

/**
 * Retrieves the ObjectPage footer actions (both the default ones and the custom ones defined in the manifest).
 *
 * @param converterContext The converter context
 * @returns An array containing all the actions for this ObjectPage footer
 */
export const getFooterActions = function (converterContext: ConverterContext): CombinedAction {
	const manifestWrapper = converterContext.getManifestWrapper();
	const aAnnotationFooterActions: BaseAction[] = getFooterDefaultActions(manifestWrapper.getViewLevel(), converterContext);
	const manifestActions = getActionsFromManifest(manifestWrapper.getFooterActions(), converterContext, aAnnotationFooterActions);

	const actionOverwriteConfig: OverrideTypeAction = {
		isNavigable: OverrideType.overwrite,
		enabled: OverrideType.overwrite,
		visible: OverrideType.overwrite,
		defaultValuesExtensionFunction: OverrideType.overwrite,
		command: OverrideType.overwrite
	};
	const footerActions = insertCustomElements(aAnnotationFooterActions, manifestActions.actions, actionOverwriteConfig);
	return {
		actions: footerActions,
		commandActions: manifestActions.commandActions
	};
};

function _getSubSectionVisualization(subSection: DataVisualizationSubSection): TableVisualization {
	return (subSection?.presentation?.visualizations[0] ? subSection.presentation.visualizations[0] : undefined) as TableVisualization;
}

function _isFacetHasGridTableVisible(
	dataVisualizationSubSection: DataVisualizationSubSection,
	subSectionVisualization: TableVisualization
): boolean {
	return (
		dataVisualizationSubSection.visible === "true" &&
		dataVisualizationSubSection?.presentation?.visualizations &&
		subSectionVisualization?.type === "Table" &&
		subSectionVisualization?.control?.type === "GridTable"
	);
}

function _setGridTableVisualizationInformation(
	sections: ObjectPageSection[],
	dataVisualizationSubSection: DataVisualizationSubSection,
	subSectionVisualization: TableVisualization,
	sectionLayout: string
): void {
	if (_isFacetHasGridTableVisible(dataVisualizationSubSection, subSectionVisualization)) {
		const tableControlConfiguration: TableControlConfiguration = subSectionVisualization.control;
		if (!(sectionLayout === "Page" && sections.length > 1)) {
			tableControlConfiguration.rowCountMode = "Auto";
		}
		if (sectionLayout !== "Tabs") {
			tableControlConfiguration.useCondensedTableLayout = false;
		}
	}
}

function _setGridTableWithMixFacetsInformation(subSection: DataVisualizationSubSection, sectionLayout: string): void {
	if (subSection?.content?.length === 1) {
		const tableControl = ((subSection.content[0] as DataVisualizationSubSection).presentation?.visualizations[0] as TableVisualization)
			.control;
		if (tableControl.type === "GridTable") {
			tableControl.rowCountMode = "Auto";
			if (sectionLayout !== "Tabs") {
				tableControl.useCondensedTableLayout = false;
			}
		}
	}
}

/**
 * Set the GridTable display information.
 *
 * @param sections The ObjectPage sections
 * @param section The current ObjectPage section processed
 * @param sectionLayout
 */
function _setGridTableSubSectionControlConfiguration(
	sections: ObjectPageSection[],
	section: ObjectPageSection,
	sectionLayout: string
): void {
	let dataVisualizationSubSection: DataVisualizationSubSection;
	let subSectionVisualization: TableVisualization;
	const subSections = section.subSections;
	if (subSections.length === 1) {
		dataVisualizationSubSection = subSections[0] as DataVisualizationSubSection;
		switch (subSections[0].type) {
			case "DataVisualization":
				subSectionVisualization = _getSubSectionVisualization(dataVisualizationSubSection);
				_setGridTableVisualizationInformation(sections, dataVisualizationSubSection, subSectionVisualization, sectionLayout);
				break;
			case "Mixed":
				_setGridTableWithMixFacetsInformation(dataVisualizationSubSection, sectionLayout);
				break;
			default:
				break;
		}
		return;
	}
	_removeCondensedFromSubSections(subSections);
}

/**
 * Remove the condense layout mode from the subsections.
 *
 * @param subSections The subSections where we need to remove the condensed layout
 */
function _removeCondensedFromSubSections(subSections: ObjectPageSubSection[]) {
	let dataVisualizationSubSection: DataVisualizationSubSection;
	// We check in each subsection if there is visualizations
	subSections.forEach((subSection) => {
		dataVisualizationSubSection = subSection as DataVisualizationSubSection;
		if (dataVisualizationSubSection?.presentation?.visualizations) {
			dataVisualizationSubSection?.presentation?.visualizations.forEach((singleVisualization) => {
				if (singleVisualization.type === VisualizationType.Table) {
					singleVisualization.control.useCondensedTableLayout = false;
				}
			});
		}
		// Then we check the content of the subsection, and in each content we check if there is a table to set its condensed layout to false
		if (dataVisualizationSubSection?.content) {
			dataVisualizationSubSection.content.forEach((singleContent) => {
				(singleContent as DataVisualizationSubSection).presentation?.visualizations.forEach((singleVisualization) => {
					if (singleVisualization.type === VisualizationType.Table) {
						singleVisualization.control.useCondensedTableLayout = false;
					}
				});
			});
		}
	});
}
/**
 * Retrieves and merges the ObjectPage sections defined in the annotation and in the manifest.
 *
 * @param converterContext The converter context
 * @returns An array of sections.
 */

export const getSections = function (converterContext: ConverterContext): ObjectPageSection[] {
	const manifestWrapper = converterContext.getManifestWrapper();
	const sections = insertCustomElements(
		getSectionsFromAnnotation(converterContext),
		getSectionsFromManifest(manifestWrapper.getSections(), converterContext),
		{
			title: OverrideType.overwrite,
			visible: OverrideType.overwrite,
			subSections: {
				actions: OverrideType.merge,
				title: OverrideType.overwrite,
				sideContent: OverrideType.overwrite,
				objectPageLazyLoaderEnabled: OverrideType.overwrite
			}
		}
	);
	// Level Adjustment for "Mixed" Collection Facets:
	// ==============================================
	// The manifest definition of custom side contents and actions still needs to be aligned for "Mixed" collection facets:
	// Collection facets containing tables gain an extra reference facet as a table wrapper to ensure, that the table is always
	// placed in an own individual Object Page Block; this additional hierarchy level is unknown to app developers, which are
	// defining the side content and actions in the manifest at collection facet level; now, since the sideContent always needs
	// to be assigned to a block, and actions always need to be assigned to a form,
	// we need to move the sideContent and actions from a mixed collection facet to its content.
	// ==============================================
	sections.forEach(function (section) {
		_setGridTableSubSectionControlConfiguration(sections, section, manifestWrapper.getSectionLayout());
		section.subSections?.forEach(function (subSection) {
			subSection.title = subSection.title === "undefined" ? undefined : subSection.title;
			if (subSection.type === "Mixed") {
				subSection.content?.forEach((content) => {
					content.objectPageLazyLoaderEnabled = subSection.objectPageLazyLoaderEnabled;
				});
			}
			if (subSection.type === "Mixed" && subSection.content?.length) {
				const firstForm = subSection.content.find(
					(element) => (element as FormSubSection).type === SubSectionType.Form
				) as FormSubSection;

				// 1. Copy sideContent to the SubSection's first form; or -- if unavailable -- to its first content
				// 2. Copy actions to the first form of the SubSection's content
				// 3. Delete sideContent / actions at the (invalid) manifest level

				if (subSection.sideContent) {
					if (firstForm) {
						// If there is a form, it always needs to be attached to the form, as the form inherits the ID of the SubSection
						firstForm.sideContent = subSection.sideContent;
					} else {
						subSection.content[0].sideContent = subSection.sideContent;
					}
					subSection.sideContent = undefined;
				}

				if (firstForm && (subSection as FormSubSection).actions?.length) {
					firstForm.actions = (subSection as FormSubSection).actions;
					(subSection as FormSubSection).actions = [];
				}
			}
		});
	});
	return sections;
};

/**
 * Determines if the ObjectPage has header content.
 *
 * @param converterContext The instance of the converter context
 * @returns `true` if there is at least on header facet
 */
function hasHeaderContent(converterContext: ConverterContext): boolean {
	const manifestWrapper = converterContext.getManifestWrapper();
	return (
		(converterContext.getEntityType().annotations?.UI?.HeaderFacets || []).length > 0 ||
		Object.keys(manifestWrapper.getHeaderFacets()).length > 0
	);
}

/**
 * Gets the expression to evaluate the visibility of the header content.
 *
 * @param converterContext The instance of the converter context
 * @returns The binding expression for the Delete button
 */
function getShowHeaderContentExpression(converterContext: ConverterContext): BindingToolkitExpression<any> {
	const manifestWrapper = converterContext.getManifestWrapper();
	return ifElse(
		!hasHeaderContent(converterContext),
		constant(false),
		ifElse(equal(manifestWrapper.isHeaderEditable(), false), constant(true), not(UI.IsEditable))
	);
}

/**
 * Gets the binding expression to evaluate the visibility of the header content.
 *
 * @param converterContext The instance of the converter context
 * @returns The binding expression for the Delete button
 */
export const getShowHeaderContent = function (converterContext: ConverterContext): CompiledBindingToolkitExpression {
	return compileExpression(getShowHeaderContentExpression(converterContext));
};

/**
 * Gets the binding expression to evaluate the visibility of the avatar when the header is in expanded state.
 *
 * @param converterContext The instance of the converter context
 * @returns The binding expression for the Delete button
 */
export const getExpandedImageVisible = function (converterContext: ConverterContext): CompiledBindingToolkitExpression {
	return compileExpression(not(getShowHeaderContentExpression(converterContext)));
};

export const convertPage = function (converterContext: ConverterContext): ObjectPageDefinition {
	const manifestWrapper = converterContext.getManifestWrapper();
	let headerSection: ObjectPageSection | undefined;
	const entityType: EntityType = converterContext.getEntityType();

	// Retrieve all header facets (from annotations & custom)
	const headerFacets = insertCustomElements(
		getHeaderFacetsFromAnnotations(converterContext),
		getHeaderFacetsFromManifest(manifestWrapper.getHeaderFacets())
	);

	// Retrieve the page header actions
	const headerActions = getHeaderActions(converterContext);

	// Retrieve the page footer actions
	const footerActions = getFooterActions(converterContext);

	if (manifestWrapper.isHeaderEditable() && (entityType.annotations.UI?.HeaderFacets || entityType.annotations.UI?.HeaderInfo)) {
		headerSection = createEditableHeaderSection(converterContext, headerFacets);
	}

	const sections = getSections(converterContext);

	return {
		template: TemplateType.ObjectPage,
		header: {
			visible: manifestWrapper.getShowObjectPageHeader(),
			section: headerSection,
			facets: headerFacets,
			actions: headerActions.actions,
			showContent: getShowHeaderContent(converterContext),
			hasContent: hasHeaderContent(converterContext),
			avatar: getAvatar(converterContext),
			title: {
				expandedImageVisible: getExpandedImageVisible(converterContext)
			}
		},
		sections: sections,
		footerActions: footerActions.actions,
		headerCommandActions: headerActions.commandActions,
		footerCommandActions: footerActions.commandActions,
		showAnchorBar: manifestWrapper.getShowAnchorBar(),
		useIconTabBar: manifestWrapper.useIconTabBar()
	};
};
