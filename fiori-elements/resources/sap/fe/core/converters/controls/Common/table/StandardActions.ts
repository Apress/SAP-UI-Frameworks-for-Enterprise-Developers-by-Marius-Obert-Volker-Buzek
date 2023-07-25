import type { EntitySet, PropertyAnnotationValue } from "@sap-ux/vocabularies-types";
import type { EntitySetAnnotations_UI } from "@sap-ux/vocabularies-types/vocabularies/UI_Edm";
import tableFormatters from "sap/fe/core/formatters/TableFormatter";
import type { BindingToolkitExpression, CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import {
	and,
	compileExpression,
	constant,
	equal,
	formatResult,
	getExpressionFromAnnotation,
	greaterOrEqual,
	greaterThan,
	ifElse,
	isConstant,
	isPathInModelExpression,
	length,
	not,
	notEqual,
	or,
	pathInModel
} from "sap/fe/core/helpers/BindingToolkit";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import { isEntitySet, isNavigationProperty } from "sap/fe/core/helpers/TypeGuards";
import { getTargetObjectPath, isPathDeletable, isPathInsertable, isPathUpdatable } from "sap/fe/core/templating/DataModelPathHelper";
import type ConverterContext from "../../../ConverterContext";
import { singletonPathVisitor, UI } from "../../../helpers/BindingHelper";
import type { ViewPathConfiguration } from "../../../ManifestSettings";
import { CreationMode, TemplateType } from "../../../ManifestSettings";
import type { TableControlConfiguration } from "../Table";

enum AnnotationHiddenProperty {
	CreateHidden = "CreateHidden",
	DeleteHidden = "DeleteHidden",
	UpdateHidden = "UpdateHidden"
}

export type StandardActionConfigType = {
	isTemplated?: CompiledBindingToolkitExpression;
	visible: CompiledBindingToolkitExpression;
	enabled: CompiledBindingToolkitExpression;
};

type ExpressionRestrictionsType = {
	expression: BindingToolkitExpression<boolean>;
	navigationExpression: BindingToolkitExpression<boolean>;
};
type StandardActionsRestrictionsType = Record<string, ExpressionRestrictionsType>;

export type StandardActionsContext = {
	collectionPath: string;
	hiddenAnnotation: {
		create: BindingToolkitExpression<boolean>;
		delete: BindingToolkitExpression<boolean>;
		update: BindingToolkitExpression<boolean>;
	};
	creationMode: CreationMode;
	isDraftOrStickySupported: boolean;
	isViewWithMultipleVisualizations: boolean;
	newAction?: {
		name: string;
		available: BindingToolkitExpression<boolean>;
	};
	tableManifestConfiguration: TableControlConfiguration;
	restrictions: StandardActionsRestrictionsType;
};

/**
 * Generates the context for the standard actions.
 *
 * @param converterContext
 * @param creationMode
 * @param tableManifestConfiguration
 * @param viewConfiguration
 * @returns  The context for table actions
 */
export function generateStandardActionsContext(
	converterContext: ConverterContext,
	creationMode: CreationMode,
	tableManifestConfiguration: TableControlConfiguration,
	viewConfiguration?: ViewPathConfiguration
): StandardActionsContext {
	return {
		collectionPath: getTargetObjectPath(converterContext.getDataModelObjectPath()),
		hiddenAnnotation: {
			create: isActionAnnotatedHidden(converterContext, AnnotationHiddenProperty.CreateHidden),
			delete: isActionAnnotatedHidden(converterContext, AnnotationHiddenProperty.DeleteHidden),
			update: isActionAnnotatedHidden(converterContext, AnnotationHiddenProperty.UpdateHidden)
		},
		creationMode: creationMode,
		isDraftOrStickySupported: isDraftOrStickySupported(converterContext),
		isViewWithMultipleVisualizations: viewConfiguration
			? converterContext.getManifestWrapper().hasMultipleVisualizations(viewConfiguration)
			: false,
		newAction: getNewAction(converterContext),
		tableManifestConfiguration: tableManifestConfiguration,
		restrictions: getRestrictions(converterContext)
	};
}

/**
 * Checks if sticky or draft is supported.
 *
 * @param converterContext
 * @returns `true` if it is supported
 */
export function isDraftOrStickySupported(converterContext: ConverterContext): boolean {
	const dataModelObjectPath = converterContext.getDataModelObjectPath();
	const bIsDraftSupported = ModelHelper.isObjectPathDraftSupported(dataModelObjectPath);
	const bIsStickySessionSupported = (dataModelObjectPath.startingEntitySet as EntitySet)?.annotations?.Session?.StickySessionSupported
		? true
		: false;

	return bIsDraftSupported || bIsStickySessionSupported;
}

/**
 * Gets the configured newAction into annotation.
 *
 * @param converterContext
 * @returns The new action info
 */
export function getNewAction(converterContext: ConverterContext) {
	const currentEntitySet = converterContext.getEntitySet();
	const newAction = isEntitySet(currentEntitySet)
		? currentEntitySet.annotations.Common?.DraftRoot?.NewAction ??
		  currentEntitySet.annotations.Session?.StickySessionSupported?.NewAction
		: undefined;
	const newActionName: CompiledBindingToolkitExpression = newAction?.toString();
	if (newActionName) {
		let availableProperty = converterContext?.getEntityType().actions[newActionName]?.annotations?.Core?.OperationAvailable?.valueOf();
		availableProperty = availableProperty !== undefined ? availableProperty : true;
		return {
			name: newActionName,
			available: getExpressionFromAnnotation<boolean>(availableProperty as unknown as PropertyAnnotationValue<boolean>)
		};
	}
	return undefined;
}

/**
 * Gets the binding expression for the action visibility configured into annotation.
 *
 * @param converterContext
 * @param sAnnotationTerm
 * @param bWithNavigationPath
 * @returns The binding expression for the action visibility
 */
export function isActionAnnotatedHidden(
	converterContext: ConverterContext,
	sAnnotationTerm: keyof EntitySetAnnotations_UI,
	bWithNavigationPath = true
): BindingToolkitExpression<boolean> {
	const currentEntitySet = converterContext.getEntitySet();
	const dataModelObjectPath = converterContext.getDataModelObjectPath();
	// Consider only the last level of navigation. The others are already considered in the element binding of the page.
	const visitedNavigationPaths =
		dataModelObjectPath.navigationProperties.length > 0 && bWithNavigationPath
			? [dataModelObjectPath.navigationProperties[dataModelObjectPath.navigationProperties.length - 1].name]
			: [];
	const actionAnnotationValue =
		((currentEntitySet?.annotations.UI as EntitySetAnnotations_UI)?.[sAnnotationTerm] as PropertyAnnotationValue<boolean>) || false;

	return currentEntitySet
		? getExpressionFromAnnotation(actionAnnotationValue, visitedNavigationPaths, undefined, (path: string) =>
				singletonPathVisitor(path, converterContext.getConvertedTypes(), visitedNavigationPaths)
		  )
		: constant(false);
}

/**
 * Gets the annotated restrictions for the actions.
 *
 * @param converterContext
 * @returns The restriction information
 */
export function getRestrictions(converterContext: ConverterContext): StandardActionsRestrictionsType {
	const dataModelObjectPath = converterContext.getDataModelObjectPath();
	const restrictionsDef = [
		{
			key: "isInsertable",
			function: isPathInsertable
		},
		{
			key: "isUpdatable",
			function: isPathUpdatable
		},
		{
			key: "isDeletable",
			function: isPathDeletable
		}
	];
	const result: Record<string, ExpressionRestrictionsType> = {};
	restrictionsDef.forEach(function (def) {
		const defFunction = def["function"];
		result[def.key] = {
			expression: defFunction.apply(null, [
				dataModelObjectPath,
				{
					pathVisitor: (path: string, navigationPaths: string[]) =>
						singletonPathVisitor(path, converterContext.getConvertedTypes(), navigationPaths)
				}
			]),
			navigationExpression: defFunction.apply(null, [
				dataModelObjectPath,
				{
					ignoreTargetCollection: true,
					authorizeUnresolvable: true,
					pathVisitor: (path: string, navigationPaths: string[]) =>
						singletonPathVisitor(path, converterContext.getConvertedTypes(), navigationPaths)
				}
			])
		};
	});
	return result;
}

/**
 * Checks if templating for insert/update actions is mandatory.
 *
 * @param standardActionsContext
 * @param isDraftOrSticky
 * @returns True if we need to template insert or update actions, false otherwise
 */
export function getInsertUpdateActionsTemplating(standardActionsContext: StandardActionsContext, isDraftOrSticky: boolean): boolean {
	return isDraftOrSticky || standardActionsContext.creationMode === CreationMode.External;
}

/**
 * Gets the binding expressions for the properties of the 'Create' action.
 *
 * @param converterContext
 * @param standardActionsContext
 * @returns The standard action info
 */
export function getStandardActionCreate(
	converterContext: ConverterContext,
	standardActionsContext: StandardActionsContext
): StandardActionConfigType {
	const createVisibility = getCreateVisibility(converterContext, standardActionsContext);
	return {
		isTemplated: compileExpression(getCreateTemplating(standardActionsContext, createVisibility)),
		visible: compileExpression(createVisibility),
		enabled: compileExpression(getCreateEnablement(converterContext, standardActionsContext, createVisibility))
	};
}

/**
 * Gets the binding expressions for the properties of the 'Delete' action.
 *
 * @param converterContext
 * @param standardActionsContext
 * @returns The binding expressions for the properties of the 'Delete' action.
 */
export function getStandardActionDelete(
	converterContext: ConverterContext,
	standardActionsContext: StandardActionsContext
): StandardActionConfigType {
	const deleteVisibility = getDeleteVisibility(converterContext, standardActionsContext);

	return {
		isTemplated: compileExpression(getDefaultTemplating(deleteVisibility)),
		visible: compileExpression(deleteVisibility),
		enabled: compileExpression(getDeleteEnablement(converterContext, standardActionsContext, deleteVisibility))
	};
}

/**
 * @param converterContext
 * @param standardActionsContext
 * @returns StandardActionConfigType
 */
export function getCreationRow(
	converterContext: ConverterContext,
	standardActionsContext: StandardActionsContext
): StandardActionConfigType {
	const creationRowVisibility = getCreateVisibility(converterContext, standardActionsContext, true);

	return {
		isTemplated: compileExpression(getCreateTemplating(standardActionsContext, creationRowVisibility, true)),
		visible: compileExpression(creationRowVisibility),
		enabled: compileExpression(getCreationRowEnablement(converterContext, standardActionsContext, creationRowVisibility))
	};
}

/**
 * Gets the binding expressions for the properties of the 'Paste' action.
 *
 * @param converterContext
 * @param standardActionsContext
 * @param isInsertUpdateActionsTemplated
 * @returns The binding expressions for the properties of the 'Paste' action.
 */
export function getStandardActionPaste(
	converterContext: ConverterContext,
	standardActionsContext: StandardActionsContext,
	isInsertUpdateActionsTemplated: boolean
): StandardActionConfigType {
	const createVisibility = getCreateVisibility(converterContext, standardActionsContext);
	const createEnablement = getCreateEnablement(converterContext, standardActionsContext, createVisibility);
	const pasteVisibility = getPasteVisibility(converterContext, standardActionsContext, createVisibility, isInsertUpdateActionsTemplated);
	return {
		visible: compileExpression(pasteVisibility),
		enabled: compileExpression(getPasteEnablement(pasteVisibility, createEnablement))
	};
}

/**
 * Gets the binding expressions for the properties of the 'MassEdit' action.
 *
 * @param converterContext
 * @param standardActionsContext
 * @returns The binding expressions for the properties of the 'MassEdit' action.
 */
export function getStandardActionMassEdit(
	converterContext: ConverterContext,
	standardActionsContext: StandardActionsContext
): StandardActionConfigType {
	const massEditVisibility = getMassEditVisibility(converterContext, standardActionsContext);

	return {
		isTemplated: compileExpression(getDefaultTemplating(massEditVisibility)),
		visible: compileExpression(massEditVisibility),
		enabled: compileExpression(getMassEditEnablement(converterContext, standardActionsContext, massEditVisibility))
	};
}

/**
 * Gets the binding expression for the templating of the 'Create' action.
 *
 * @param standardActionsContext
 * @param createVisibility
 * @param isForCreationRow
 * @returns The create binding expression
 */
export function getCreateTemplating(
	standardActionsContext: StandardActionsContext,
	createVisibility: BindingToolkitExpression<boolean>,
	isForCreationRow = false
): BindingToolkitExpression<boolean> {
	//Templating of Create Button is not done:
	// 	 - If Button is never visible(covered the External create button, new Action)
	//	 - or CreationMode is on CreationRow for Create Button
	//	 - or CreationMode is not on CreationRow for CreationRow Button

	return and(
		//XNOR gate
		or(
			and(isForCreationRow, standardActionsContext.creationMode === CreationMode.CreationRow),
			and(!isForCreationRow, standardActionsContext.creationMode !== CreationMode.CreationRow)
		),
		or(not(isConstant(createVisibility)), createVisibility)
	);
}

/**
 * Gets the binding expression for the templating of the non-Create actions.
 *
 * @param actionVisibility
 * @returns The binding expression for the templating of the non-Create actions.
 */
export function getDefaultTemplating(actionVisibility: BindingToolkitExpression<boolean>): BindingToolkitExpression<boolean> {
	return or(not(isConstant(actionVisibility)), actionVisibility);
}

/**
 * Gets the binding expression for the 'visible' property of the 'Create' action.
 *
 * @param converterContext
 * @param standardActionsContext
 * @param isForCreationRow
 * @returns The binding expression for the 'visible' property of the 'Create' action.
 */
export function getCreateVisibility(
	converterContext: ConverterContext,
	standardActionsContext: StandardActionsContext,
	isForCreationRow = false
): BindingToolkitExpression<boolean> {
	const isInsertable = standardActionsContext.restrictions.isInsertable.expression;
	const isCreateHidden = isForCreationRow
		? isActionAnnotatedHidden(converterContext, AnnotationHiddenProperty.CreateHidden, false)
		: standardActionsContext.hiddenAnnotation.create;
	const newAction = standardActionsContext.newAction;
	//Create Button is visible:
	// 	 - If the creation mode is external
	//      - If we're on the list report and create is not hidden
	//		- Otherwise this depends on the value of the UI.IsEditable
	//	 - Otherwise
	//		- If any of the following conditions is valid then create button isn't visible
	//			- no newAction available
	//			- It's not insertable and there is not a new action
	//			- create is hidden
	//			- There are multiple visualizations
	//			- It's an Analytical List Page
	//			- Uses InlineCreationRows mode and a Responsive table type, with the parameter inlineCreationRowsHiddenInEditMode to true while not in create mode
	//   - Otherwise
	// 	 	- If we're on the list report ->
	// 	 		- If UI.CreateHidden points to a property path -> provide a negated binding to this path
	// 	 		- Otherwise, create is visible
	// 	 	- Otherwise
	// 	  	 - This depends on the value of the UI.IsEditable
	return ifElse(
		standardActionsContext.creationMode === CreationMode.External,
		and(not(isCreateHidden), or(converterContext.getTemplateType() === TemplateType.ListReport, UI.IsEditable)),
		ifElse(
			or(
				and(isConstant(newAction?.available), equal(newAction?.available, false)),
				and(isConstant(isInsertable), equal(isInsertable, false), !newAction),
				and(isConstant(isCreateHidden), equal(isCreateHidden, true)),
				and(
					standardActionsContext.creationMode === CreationMode.InlineCreationRows,
					standardActionsContext.tableManifestConfiguration?.type === "ResponsiveTable",
					ifElse(
						standardActionsContext?.tableManifestConfiguration?.inlineCreationRowsHiddenInEditMode === false,
						true,
						UI.IsCreateMode
					)
				)
			),
			false,
			ifElse(
				converterContext.getTemplateType() === TemplateType.ListReport,
				or(not(isPathInModelExpression(isCreateHidden)), not(isCreateHidden)),
				and(not(isCreateHidden), UI.IsEditable)
			)
		)
	);
}

/**
 * Gets the binding expression for the 'visible' property of the 'Delete' action.
 *
 * @param converterContext
 * @param standardActionsContext
 * @returns The binding expression for the 'visible' property of the 'Delete' action.
 */
export function getDeleteVisibility(
	converterContext: ConverterContext,
	standardActionsContext: StandardActionsContext
): BindingToolkitExpression<boolean> {
	const isDeleteHidden = standardActionsContext.hiddenAnnotation.delete;
	const pathDeletableExpression = standardActionsContext.restrictions.isDeletable.expression;

	//Delete Button is visible:
	// 	 Prerequisites:
	//	 - If we're not on ALP
	//   - If restrictions on deletable set to false -> not visible
	//   - Otherwise
	//			- If UI.DeleteHidden is true -> not visible
	//			- Otherwise
	// 	 			- If we're on OP -> depending if UI is editable and restrictions on deletable
	//				- Otherwise
	//				 	- If UI.DeleteHidden points to a property path -> provide a negated binding to this path
	//	 	 		 	- Otherwise, delete is visible

	return ifElse(
		converterContext.getTemplateType() === TemplateType.AnalyticalListPage,
		false,
		ifElse(
			and(isConstant(pathDeletableExpression), equal(pathDeletableExpression, false)),
			false,
			ifElse(
				and(isConstant(isDeleteHidden), equal(isDeleteHidden, constant(true))),
				false,
				ifElse(
					converterContext.getTemplateType() !== TemplateType.ListReport,
					and(not(isDeleteHidden), UI.IsEditable),
					not(and(isPathInModelExpression(isDeleteHidden), isDeleteHidden))
				)
			)
		)
	);
}

/**
 * Gets the binding expression for the 'visible' property of the 'Paste' action.
 *
 * @param converterContext
 * @param standardActionsContext
 * @param createVisibility
 * @param isInsertUpdateActionsTemplated
 * @returns The binding expression for the 'visible' property of the 'Paste' action.
 */
export function getPasteVisibility(
	converterContext: ConverterContext,
	standardActionsContext: StandardActionsContext,
	createVisibility: BindingToolkitExpression<boolean>,
	isInsertUpdateActionsTemplated: boolean
): BindingToolkitExpression<boolean> {
	// If Create is visible, enablePaste is not disabled into manifest and we are on OP/blocks outside Fiori elements templates
	// Then button will be visible according to insertable restrictions and create visibility
	// Otherwise it's not visible
	return and(
		notEqual(standardActionsContext.tableManifestConfiguration.enablePaste, false),
		createVisibility,
		isInsertUpdateActionsTemplated,
		[TemplateType.ListReport, TemplateType.AnalyticalListPage].indexOf(converterContext.getTemplateType()) === -1,
		standardActionsContext.restrictions.isInsertable.expression
	);
}

/**
 * Gets the binding expression for the 'visible' property of the 'MassEdit' action.
 *
 * @param converterContext
 * @param standardActionsContext
 * @returns The binding expression for the 'visible' property of the 'MassEdit' action.
 */
export function getMassEditVisibility(
	converterContext: ConverterContext,
	standardActionsContext: StandardActionsContext
): BindingToolkitExpression<boolean> {
	const isUpdateHidden = standardActionsContext.hiddenAnnotation.update,
		pathUpdatableExpression = standardActionsContext.restrictions.isUpdatable.expression,
		bMassEditEnabledInManifest: boolean = standardActionsContext.tableManifestConfiguration?.enableMassEdit || false;
	const templateBindingExpression =
		converterContext.getTemplateType() === TemplateType.ObjectPage
			? UI.IsEditable
			: converterContext.getTemplateType() === TemplateType.ListReport;
	//MassEdit is visible
	// If
	//		- there is no static restrictions set to false
	//		- and enableMassEdit is not set to false into the manifest
	//		- and the selectionMode is relevant
	//	Then MassEdit is always visible in LR or dynamically visible in OP according to ui>Editable and hiddenAnnotation
	//  Button is hidden for all other cases
	return and(
		not(and(isConstant(pathUpdatableExpression), equal(pathUpdatableExpression, false))),
		bMassEditEnabledInManifest,
		templateBindingExpression,
		not(isUpdateHidden)
	);
}

/**
 * Gets the binding expression for the 'enabled' property of the creationRow.
 *
 * @param converterContext
 * @param standardActionsContext
 * @param creationRowVisibility
 * @returns The binding expression for the 'enabled' property of the creationRow.
 */
export function getCreationRowEnablement(
	converterContext: ConverterContext,
	standardActionsContext: StandardActionsContext,
	creationRowVisibility: BindingToolkitExpression<boolean>
): BindingToolkitExpression<boolean> {
	const restrictionsInsertable = isPathInsertable(converterContext.getDataModelObjectPath(), {
		ignoreTargetCollection: true,
		authorizeUnresolvable: true,
		pathVisitor: (path: string, navigationPaths: string[]) => {
			if (path.indexOf("/") === 0) {
				path = singletonPathVisitor(path, converterContext.getConvertedTypes(), navigationPaths);
				return path;
			}
			const navigationProperties = converterContext.getDataModelObjectPath().navigationProperties;
			if (navigationProperties) {
				const lastNav = navigationProperties[navigationProperties.length - 1];
				const partner = isNavigationProperty(lastNav) && lastNav.partner;
				if (partner) {
					path = `${partner}/${path}`;
				}
			}
			return path;
		}
	});
	const isInsertable =
		restrictionsInsertable._type === "Unresolvable"
			? isPathInsertable(converterContext.getDataModelObjectPath(), {
					pathVisitor: (path: string) => singletonPathVisitor(path, converterContext.getConvertedTypes(), [])
			  })
			: restrictionsInsertable;

	return and(
		creationRowVisibility,
		isInsertable,
		or(
			!standardActionsContext.tableManifestConfiguration.disableAddRowButtonForEmptyData,
			formatResult([pathInModel("creationRowFieldValidity", "internal")], tableFormatters.validateCreationRowFields)
		)
	);
}

/**
 * Gets the binding expression for the 'enabled' property of the 'Create' action.
 *
 * @param converterContext
 * @param standardActionsContext
 * @param createVisibility
 * @returns The binding expression for the 'enabled' property of the 'Create' action.
 */
export function getCreateEnablement(
	converterContext: ConverterContext,
	standardActionsContext: StandardActionsContext,
	createVisibility: BindingToolkitExpression<boolean>
): BindingToolkitExpression<boolean> {
	let condition;
	if (standardActionsContext.creationMode === CreationMode.InlineCreationRows) {
		// for Inline creation rows create can be hidden via manifest and this should not impact its enablement
		condition = not(standardActionsContext.hiddenAnnotation.create);
	} else {
		condition = createVisibility;
	}
	const isInsertable = standardActionsContext.restrictions.isInsertable.expression;
	const CollectionType = converterContext.resolveAbsolutePath<EntitySet>(standardActionsContext.collectionPath).target;
	return and(
		condition,
		or(
			isEntitySet(CollectionType),
			and(isInsertable, or(converterContext.getTemplateType() !== TemplateType.ObjectPage, UI.IsEditable))
		)
	);
}

/**
 * Gets the binding expression for the 'enabled' property of the 'Delete' action.
 *
 * @param converterContext
 * @param standardActionsContext
 * @param deleteVisibility
 * @returns The binding expression for the 'enabled' property of the 'Delete' action.
 */
export function getDeleteEnablement(
	converterContext: ConverterContext,
	standardActionsContext: StandardActionsContext,
	deleteVisibility: BindingToolkitExpression<boolean>
): BindingToolkitExpression<boolean> {
	const deletableContexts = pathInModel("deletableContexts", "internal");
	const unSavedContexts = pathInModel("unSavedContexts", "internal");
	const draftsWithDeletableActive = pathInModel("draftsWithDeletableActive", "internal");
	const draftsWithNonDeletableActive = pathInModel("draftsWithNonDeletableActive", "internal");

	return and(
		deleteVisibility,
		ifElse(
			converterContext.getTemplateType() === TemplateType.ObjectPage,
			or(
				and(notEqual(deletableContexts, undefined), greaterThan(length(deletableContexts), 0)),
				and(notEqual(draftsWithDeletableActive, undefined), greaterThan(length(draftsWithDeletableActive), 0))
			),
			or(
				and(notEqual(deletableContexts, undefined), greaterThan(length(deletableContexts), 0)),
				and(notEqual(draftsWithDeletableActive, undefined), greaterThan(length(draftsWithDeletableActive), 0)),
				// on LR, also enable delete button to cancel drafts
				and(notEqual(draftsWithNonDeletableActive, undefined), greaterThan(length(draftsWithNonDeletableActive), 0)),
				// deletable contexts with unsaved changes are counted separately (LR only)
				and(notEqual(unSavedContexts, undefined), greaterThan(length(unSavedContexts), 0))
			)
		)
	);
}

/**
 * Gets the binding expression for the 'enabled' property of the 'Paste' action.
 *
 * @param pasteVisibility
 * @param createEnablement
 * @returns The binding expression for the 'enabled' property of the 'Paste' action.
 */
export function getPasteEnablement(
	pasteVisibility: BindingToolkitExpression<boolean>,
	createEnablement: BindingToolkitExpression<boolean>
): BindingToolkitExpression<boolean> {
	return and(pasteVisibility, createEnablement);
}

/**
 * Gets the binding expression for the 'enabled' property of the 'MassEdit' action.
 *
 * @param converterContext
 * @param standardActionsContext
 * @param massEditVisibility
 * @returns The binding expression for the 'enabled' property of the 'MassEdit' action.
 */
export function getMassEditEnablement(
	converterContext: ConverterContext,
	standardActionsContext: StandardActionsContext,
	massEditVisibility: BindingToolkitExpression<boolean>
): BindingToolkitExpression<boolean> {
	const pathUpdatableExpression = standardActionsContext.restrictions.isUpdatable.expression;
	const isOnlyDynamicOnCurrentEntity =
		!isConstant(pathUpdatableExpression) &&
		standardActionsContext.restrictions.isUpdatable.navigationExpression._type === "Unresolvable";
	const numberOfSelectedContexts = greaterOrEqual(pathInModel("numberOfSelectedContexts", "internal"), 1);
	const numberOfUpdatableContexts = greaterOrEqual(length(pathInModel("updatableContexts", "internal")), 1);
	const bIsDraftSupported = ModelHelper.isObjectPathDraftSupported(converterContext.getDataModelObjectPath());
	const bDisplayMode = isInDisplayMode(converterContext);

	// numberOfUpdatableContexts needs to be added to the binding in case
	// 1. Update is dependent on current entity property (isOnlyDynamicOnCurrentEntity is true).
	// 2. The table is read only and draft enabled(like LR), in this case only active contexts can be mass edited.
	//    So, update depends on 'IsActiveEntity' value which needs to be checked runtime.
	const runtimeBinding = ifElse(
		or(and(bDisplayMode, bIsDraftSupported), isOnlyDynamicOnCurrentEntity),
		and(numberOfSelectedContexts, numberOfUpdatableContexts),
		and(numberOfSelectedContexts)
	);

	return and(massEditVisibility, ifElse(isOnlyDynamicOnCurrentEntity, runtimeBinding, and(runtimeBinding, pathUpdatableExpression)));
}

/**
 * Tells if the table in template is in display mode.
 *
 * @param converterContext
 * @param viewConfiguration
 * @returns `true` if the table is in display mode
 */
export function isInDisplayMode(converterContext: ConverterContext, viewConfiguration?: ViewPathConfiguration): boolean {
	const templateType = converterContext.getTemplateType();
	if (
		templateType === TemplateType.ListReport ||
		templateType === TemplateType.AnalyticalListPage ||
		(viewConfiguration && converterContext.getManifestWrapper().hasMultipleVisualizations(viewConfiguration))
	) {
		return true;
	}
	// updatable will be handled at the property level
	return false;
}
