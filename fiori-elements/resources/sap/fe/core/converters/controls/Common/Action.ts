import type { Action } from "@sap-ux/vocabularies-types";
import type { SemanticObjectMappingType } from "@sap-ux/vocabularies-types/vocabularies/Common";
import type { DataFieldForActionTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import { UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log from "sap/base/Log";
import { bindingContextPathVisitor } from "sap/fe/core/converters/helpers/BindingHelper";
import type { ConfigurableObject, CustomElement, OverrideType } from "sap/fe/core/converters/helpers/ConfigurableObject";
import { Placement } from "sap/fe/core/converters/helpers/ConfigurableObject";
import { getCustomActionID } from "sap/fe/core/converters/helpers/ID";
import type {
	CustomDefinedTableColumnForOverride,
	ManifestAction,
	NavigationSettingsConfiguration
} from "sap/fe/core/converters/ManifestSettings";
import { ActionType } from "sap/fe/core/converters/ManifestSettings";
import fpmFormatter from "sap/fe/core/formatters/FPMFormatter";
import {
	and,
	BindingToolkitExpression,
	CompiledBindingToolkitExpression,
	compileExpression,
	constant,
	equal,
	formatResult,
	getExpressionFromAnnotation,
	greaterOrEqual,
	ifElse,
	isConstant,
	or,
	pathInModel,
	resolveBindingString
} from "sap/fe/core/helpers/BindingToolkit";
import { replaceSpecialChars } from "sap/fe/core/helpers/StableIdHelper";
import type View from "sap/ui/core/mvc/View";
import type Context from "sap/ui/model/Context";
import { MetaModelType } from "types/metamodel_types";
import type ConverterContext from "../../ConverterContext";

export enum ButtonType {
	Accept = "Accept",
	Attention = "Attention",
	Back = "Back",
	Critical = "Critical",
	Default = "Default",
	Emphasized = "Emphasized",
	Ghost = "Ghost",
	Negative = "Negative",
	Neutral = "Neutral",
	Reject = "Reject",
	Success = "Success",
	Transparent = "Transparent",
	Unstyled = "Unstyled",
	Up = "Up"
}

export type BaseAction = ConfigurableObject & {
	id?: string;
	text?: string;
	type?: ActionType;
	press?: string;
	enabled?: CompiledBindingToolkitExpression;
	visible?: CompiledBindingToolkitExpression;
	enableOnSelect?: string;
	annotationPath?: string;
	defaultValuesExtensionFunction?: string;
	isNavigable?: boolean;
	enableAutoScroll?: boolean;
	requiresDialog?: string;
	binding?: string;
	buttonType?: ButtonType.Ghost | ButtonType.Transparent | string;
	parentEntityDeleteEnabled?: CompiledBindingToolkitExpression;
	menu?: (string | BaseAction)[];
	facetName?: string;
	command?: string | undefined;
};

export type AnnotationAction = BaseAction & {
	type: ActionType.DataFieldForIntentBasedNavigation | ActionType.DataFieldForAction;
	annotationPath: string;
	id?: string;
	customData?: string;
};

/**
 * Definition for custom actions
 *
 * @typedef CustomAction
 */
export type CustomAction = CustomElement<
	BaseAction & {
		handlerMethod?: string;
		handlerModule?: string;
		noWrap?: boolean; // Indicates that we want to avoid the wrapping from the FPMHelper
		requiresSelection?: boolean;
		defaultAction?: string | CustomAction | BaseAction; //Indicates whether a default action exists in this context
	}
>;

// Reuse of ConfigurableObject and CustomElement is done for ordering
export type ConverterAction = AnnotationAction | CustomAction;

export type CombinedAction = {
	actions: BaseAction[];
	commandActions: Record<string, CustomAction>;
};

export type OverrideTypeAction = {
	enableAutoScroll?: OverrideType.overwrite;
	defaultValuesExtensionFunction?: OverrideType.overwrite;
	isNavigable?: OverrideType.overwrite;
	enableOnSelect?: OverrideType.overwrite;

	// Can be overwritten by manifest configuration and should be aligned for all actions
	enabled: OverrideType.overwrite;
	visible: OverrideType.overwrite;
	command: OverrideType.overwrite;
};

/**
 * Maps an action by its key, based on the given annotation actions and manifest configuration. The result already represents the
 * merged action from both configuration sources.
 *
 * This function also returns an indication whether the action can be a menu item, saying whether it is visible or of a specific type
 * that allows this.
 *
 * @param manifestActions Actions defined in the manifest
 * @param annotationActions Actions defined through annotations
 * @param hiddenActions Actions that are configured as hidden (additional to the visible property)
 * @param actionKey Key to look up
 * @returns Merged action and indicator whether it can be a menu item
 */
function mapActionByKey(
	manifestActions: Record<string, CustomAction>,
	annotationActions: BaseAction[],
	hiddenActions: BaseAction[],
	actionKey: string
) {
	const annotationAction: BaseAction | CustomAction | undefined = annotationActions.find(
		(action: BaseAction) => action.key === actionKey
	);
	const manifestAction = manifestActions[actionKey];
	const resultAction: CustomAction | BaseAction = { ...(annotationAction ?? manifestAction) };

	// Annotation action and manifest configuration already has to be merged here as insertCustomElements only considers top-level actions
	if (annotationAction) {
		// If enabled or visible is not set in the manifest, use the annotation value and hence do not overwrite
		resultAction.enabled = manifestAction?.enabled ?? annotationAction.enabled;
		resultAction.visible = manifestAction?.visible ?? annotationAction.visible;

		for (const prop in manifestAction || {}) {
			const propKey = prop as keyof BaseAction;
			if (!annotationAction[propKey] && propKey !== "menu") {
				resultAction[propKey] = manifestAction[propKey] as never;
			}
		}
	}

	const canBeMenuItem =
		(resultAction?.visible ||
			resultAction?.type === ActionType.DataFieldForAction ||
			resultAction?.type === ActionType.DataFieldForIntentBasedNavigation) &&
		!hiddenActions.find((hiddenAction) => hiddenAction.key === resultAction?.key);

	return {
		action: resultAction,
		canBeMenuItem
	};
}

/**
 * Map the default action key of a menu to its actual action configuration and identify whether this default action is a command.
 *
 * @param menuAction Menu action to map the default action for
 * @param manifestActions Actions defined in the manifest
 * @param annotationActions Actions defined through annotations
 * @param commandActions Array of command actions to push the default action to if applicable
 * @param hiddenActions Actions that are configured as hidden (additional to the visible property)
 */
function mapMenuDefaultAction(
	menuAction: CustomAction,
	manifestActions: Record<string, CustomAction>,
	annotationActions: BaseAction[],
	commandActions: Record<string, CustomAction | BaseAction>,
	hiddenActions: BaseAction[]
) {
	const { action, canBeMenuItem } = mapActionByKey(manifestActions, annotationActions, hiddenActions, menuAction.defaultAction as string);

	if (canBeMenuItem) {
		menuAction.defaultAction = action;
	}

	if (action.command) {
		commandActions[action.key] = action;
	}
}

/**
 * Map the menu item keys of a menu to their actual action configurations and identify whether they are commands.
 *
 * @param menuAction Menu action to map the menu items for
 * @param manifestActions Actions defined in the manifest
 * @param annotationActions Actions defined through annotations
 * @param commandActions Array of command actions to push the menu item actions to if applicable
 * @param hiddenActions Actions that are configured as hidden (additional to the visible property)
 */
function mapMenuItems(
	menuAction: CustomAction,
	manifestActions: Record<string, CustomAction>,
	annotationActions: BaseAction[],
	commandActions: Record<string, BaseAction | CustomAction>,
	hiddenActions: BaseAction[]
) {
	const mappedMenuItems: (CustomAction | BaseAction)[] = [];

	for (const menuItemKey of menuAction.menu ?? []) {
		const { action, canBeMenuItem } = mapActionByKey(manifestActions, annotationActions, hiddenActions, menuItemKey as string);

		if (canBeMenuItem) {
			mappedMenuItems.push(action);
		}

		if (action.command) {
			commandActions[menuItemKey as string] = action;
		}
	}

	menuAction.menu = mappedMenuItems;

	// If the menu is set to invisible, it should be invisible, otherwise the visibility should be calculated from the items
	const visibleExpressions: BindingToolkitExpression<boolean>[] = mappedMenuItems.map((menuItem) =>
		resolveBindingString(menuItem.visible as string, "boolean")
	);
	menuAction.visible = compileExpression(and(resolveBindingString(menuAction.visible as string, "boolean"), or(...visibleExpressions)));
}

/**
 * Transforms the flat collection of actions into a nested structures of menus. The result is a record of actions that are either menus or
 * ones that do not appear in menus as menu items. It also returns a list of actions that have an assigned command.
 *
 * Note that menu items are already the merged result of annotation actions and their manifest configuration, as {@link insertCustomElements}
 * only considers root-level actions.
 *
 * @param manifestActions Actions defined in the manifest
 * @param annotationActions Actions defined through annotations
 * @param hiddenActions Actions that are configured as hidden (additional to the visible property)
 * @returns The transformed actions from the manifest and a list of command actions
 */
function transformMenuActionsAndIdentifyCommands(
	manifestActions: Record<string, CustomAction>,
	annotationActions: BaseAction[],
	hiddenActions: BaseAction[]
): Record<string, Record<string, CustomAction>> {
	const allActions: Record<string, CustomAction> = {};
	const actionKeysToDelete: string[] = [];
	const commandActions: Record<string, CustomAction> = {};

	for (const actionKey in manifestActions) {
		const manifestAction: CustomAction = manifestActions[actionKey];

		if (manifestAction.defaultAction !== undefined) {
			mapMenuDefaultAction(manifestAction, manifestActions, annotationActions, commandActions, hiddenActions);
		}

		if (manifestAction.type === ActionType.Menu) {
			// Menu items should not appear as top-level actions themselves
			actionKeysToDelete.push(...(manifestAction.menu as string[]));

			mapMenuItems(manifestAction, manifestActions, annotationActions, commandActions, hiddenActions);

			// Menu has no visible items, so remove it
			if (!manifestAction.menu?.length) {
				actionKeysToDelete.push(manifestAction.key);
			}
		}

		if (manifestAction.command) {
			commandActions[actionKey] = manifestAction;
		}

		allActions[actionKey] = manifestAction;
	}

	actionKeysToDelete.forEach((actionKey: string) => delete allActions[actionKey]);

	return {
		actions: allActions,
		commandActions: commandActions
	};
}

/**
 * Gets the binding expression for the enablement of a manifest action.
 *
 * @param manifestAction The action configured in the manifest
 * @param isAnnotationAction Whether the action, defined in manifest, corresponds to an existing annotation action.
 * @param converterContext
 * @returns Determined property value for the enablement
 */
const _getManifestEnabled = function (
	manifestAction: ManifestAction,
	isAnnotationAction: boolean,
	converterContext: ConverterContext
): CompiledBindingToolkitExpression | undefined {
	if (isAnnotationAction && manifestAction.enabled === undefined) {
		// If annotation action has no property defined in manifest,
		// do not overwrite it with manifest action's default value.
		return undefined;
	}

	const result = getManifestActionBooleanPropertyWithFormatter(manifestAction.enabled, converterContext);

	// Consider requiresSelection property to include selectedContexts in the binding expression
	return compileExpression(
		ifElse(
			manifestAction.requiresSelection === true,
			and(greaterOrEqual(pathInModel("numberOfSelectedContexts", "internal"), 1), result),
			result
		)
	);
};

/**
 * Gets the binding expression for the visibility of a manifest action.
 *
 * @param manifestAction The action configured in the manifest
 * @param isAnnotationAction Whether the action, defined in manifest, corresponds to an existing annotation action.
 * @param converterContext
 * @returns Determined property value for the visibility
 */
const _getManifestVisible = function (
	manifestAction: ManifestAction,
	isAnnotationAction: boolean,
	converterContext: ConverterContext
): CompiledBindingToolkitExpression | undefined {
	if (isAnnotationAction && manifestAction.visible === undefined) {
		// If annotation action has no property defined in manifest,
		// do not overwrite it with manifest action's default value.
		return undefined;
	}

	const result = getManifestActionBooleanPropertyWithFormatter(manifestAction.visible, converterContext);
	return compileExpression(result);
};

/**
 * As some properties should not be overridable by the manifest, make sure that the manifest configuration gets the annotation values for these.
 *
 * @param manifestAction Action defined in the manifest
 * @param annotationAction Action defined through annotations
 */
function overrideManifestConfigurationWithAnnotation(manifestAction: CustomAction, annotationAction?: BaseAction) {
	if (!annotationAction) {
		return;
	}

	// Do not override the 'type' given in an annotation action
	manifestAction.type = annotationAction.type;
	manifestAction.annotationPath = annotationAction.annotationPath;
	manifestAction.press = annotationAction.press;

	// Only use the annotation values for enablement and visibility if not set in the manifest
	manifestAction.enabled = manifestAction.enabled ?? annotationAction.enabled;
	manifestAction.visible = manifestAction.visible ?? annotationAction.visible;
}

/**
 * Hide an action if it is a hidden header action.
 *
 * @param action The action to hide
 * @param hiddenActions Actions that are configured as hidden (additional to the visible property)
 */
function hideActionIfHiddenAction(action: CustomAction, hiddenActions?: BaseAction[]) {
	if (hiddenActions?.find((hiddenAction) => hiddenAction.key === action.key)) {
		action.visible = "false";
	}
}

/**
 * Creates the action configuration based on the manifest settings.
 *
 * @param manifestActions The manifest actions
 * @param converterContext The converter context
 * @param annotationActions The annotation actions definition
 * @param navigationSettings The navigation settings
 * @param considerNavigationSettings The navigation settings to be considered
 * @param hiddenActions Actions that are configured as hidden (additional to the visible property)
 * @param facetName The facet where an action is displayed if it is inline
 * @returns The actions from the manifest
 */
export function getActionsFromManifest(
	manifestActions: Record<string, ManifestAction> | undefined,
	converterContext: ConverterContext,
	annotationActions?: BaseAction[],
	navigationSettings?: NavigationSettingsConfiguration,
	considerNavigationSettings?: boolean,
	hiddenActions?: BaseAction[],
	facetName?: string
): Record<string, Record<string, CustomAction>> {
	const actions: Record<string, CustomAction> = {};
	for (const actionKey in manifestActions) {
		const manifestAction: ManifestAction = manifestActions[actionKey];
		const lastDotIndex = manifestAction.press?.lastIndexOf(".") || -1;
		const oAnnotationAction = annotationActions?.find((obj) => obj.key === actionKey);

		// To identify the annotation action property overwrite via manifest use-case.
		const isAnnotationAction = !!oAnnotationAction;
		if (manifestAction.facetName) {
			facetName = manifestAction.facetName;
		}

		actions[actionKey] = {
			id: oAnnotationAction ? actionKey : getCustomActionID(actionKey),
			type: manifestAction.menu ? ActionType.Menu : ActionType.Default,
			visible: _getManifestVisible(manifestAction, isAnnotationAction, converterContext),
			enabled: _getManifestEnabled(manifestAction, isAnnotationAction, converterContext),
			handlerModule: manifestAction.press && manifestAction.press.substring(0, lastDotIndex).replace(/\./gi, "/"),
			handlerMethod: manifestAction.press && manifestAction.press.substring(lastDotIndex + 1),
			press: manifestAction.press,
			text: manifestAction.text,
			noWrap: manifestAction.__noWrap,
			key: replaceSpecialChars(actionKey),
			enableOnSelect: manifestAction.enableOnSelect,
			defaultValuesExtensionFunction: manifestAction.defaultValuesFunction,
			position: {
				anchor: manifestAction.position?.anchor,
				placement: manifestAction.position === undefined ? Placement.After : manifestAction.position.placement
			},
			isNavigable: isActionNavigable(manifestAction, navigationSettings, considerNavigationSettings),
			command: manifestAction.command,
			requiresSelection: manifestAction.requiresSelection === undefined ? false : manifestAction.requiresSelection,
			enableAutoScroll: enableAutoScroll(manifestAction),
			menu: manifestAction.menu ?? [],
			facetName: manifestAction.inline ? facetName : undefined,
			defaultAction: manifestAction.defaultAction
		};

		overrideManifestConfigurationWithAnnotation(actions[actionKey], oAnnotationAction);
		hideActionIfHiddenAction(actions[actionKey], hiddenActions);
	}

	return transformMenuActionsAndIdentifyCommands(actions, annotationActions ?? [], hiddenActions ?? []);
}

/**
 * Gets a binding expression representing a Boolean manifest property that can either be represented by a static value, a binding string,
 * or a runtime formatter function.
 *
 * @param propertyValue String representing the configured property value
 * @param converterContext
 * @returns A binding expression representing the property
 */
function getManifestActionBooleanPropertyWithFormatter(
	propertyValue: string | undefined,
	converterContext: ConverterContext
): BindingToolkitExpression<boolean> {
	const resolvedBinding = resolveBindingString<boolean>(propertyValue as string, "boolean");
	let result: BindingToolkitExpression<boolean>;
	if (isConstant(resolvedBinding) && resolvedBinding.value === undefined) {
		// No property value configured in manifest for the custom action --> default value is true
		result = constant(true);
	} else if (isConstant(resolvedBinding) && typeof resolvedBinding.value === "string") {
		// Then it's a module-method reference "sap.xxx.yyy.doSomething"
		const methodPath = resolvedBinding.value;
		// FIXME: The custom "isEnabled" check does not trigger (because none of the bound values changes)
		result = formatResult(
			[pathInModel<View>("/", "$view"), methodPath, pathInModel<Context[]>("selectedContexts", "internal")],
			fpmFormatter.customBooleanPropertyCheck,
			converterContext.getDataModelObjectPath().contextLocation?.targetEntityType || converterContext.getEntityType()
		);
	} else {
		// then it's a binding
		result = resolvedBinding;
	}

	return result;
}

export const removeDuplicateActions = (actions: BaseAction[]): BaseAction[] => {
	let oMenuItemKeys: Record<string, boolean> = {};
	actions.forEach((action) => {
		if (action?.menu?.length) {
			const actionMenu: (BaseAction | CustomAction)[] = action.menu as (BaseAction | CustomAction)[];
			oMenuItemKeys = actionMenu.reduce((item: Record<string, boolean>, { key }) => {
				if (key && !item[key]) {
					item[key] = true;
				}
				return item;
			}, oMenuItemKeys);
		}
	});
	return actions.filter((action) => !oMenuItemKeys[action.key]);
};

/**
 * Method to determine the value of the 'enabled' property of an annotation-based action.
 *
 * @param converterContext The instance of the converter context
 * @param actionTarget The instance of the action
 * @returns The binding expression for the 'enabled' property of the action button.
 */
export function getEnabledForAnnotationAction(
	converterContext: ConverterContext,
	actionTarget: Action | undefined
): CompiledBindingToolkitExpression {
	const bindingParameterFullName = actionTarget?.isBound ? actionTarget?.parameters[0]?.fullyQualifiedName : undefined;
	const operationAvailableExpression = getExpressionFromAnnotation(
		actionTarget?.annotations.Core?.OperationAvailable,
		[],
		undefined,
		(path: string) => bindingContextPathVisitor(path, converterContext, bindingParameterFullName)
	);
	if (actionTarget?.annotations.Core?.OperationAvailable !== undefined) {
		return compileExpression(equal(operationAvailableExpression, true));
	}
	return "true";
}

export function getSemanticObjectMapping(mappings?: SemanticObjectMappingType[]): MetaModelType<SemanticObjectMappingType>[] {
	return mappings
		? mappings.map((mapping) => {
				return {
					LocalProperty: {
						$PropertyPath: mapping.LocalProperty.value
					},
					SemanticObjectProperty: mapping.SemanticObjectProperty
				};
		  })
		: [];
}

export function isActionNavigable(
	action: ManifestAction | CustomDefinedTableColumnForOverride,
	navigationSettings?: NavigationSettingsConfiguration,
	considerNavigationSettings?: boolean
): boolean {
	let bIsNavigationConfigured = true;
	if (considerNavigationSettings) {
		const detailOrDisplay = navigationSettings && (navigationSettings.detail || navigationSettings.display);
		bIsNavigationConfigured = detailOrDisplay?.route ? true : false;
	}
	// when enableAutoScroll is true the navigateToInstance feature is disabled
	if (
		(action &&
			action.afterExecution &&
			(action.afterExecution?.navigateToInstance === false || action.afterExecution?.enableAutoScroll === true)) ||
		!bIsNavigationConfigured
	) {
		return false;
	}
	return true;
}

export function enableAutoScroll(action: ManifestAction): boolean {
	return action?.afterExecution?.enableAutoScroll === true;
}

export function dataFieldIsCopyAction(dataField: DataFieldForActionTypes): boolean {
	return dataField.annotations?.UI?.IsCopyAction?.valueOf() === true && dataField.$Type === UIAnnotationTypes.DataFieldForAction;
}

export function getCopyAction(copyDataFields: DataFieldForActionTypes[]): DataFieldForActionTypes | undefined {
	if (copyDataFields.length === 1) {
		return copyDataFields[0];
	}
	if (copyDataFields.length > 1) {
		Log.error("Multiple actions are annotated with isCopyAction. There can be only one standard copy action.");
	}
	return undefined;
}
