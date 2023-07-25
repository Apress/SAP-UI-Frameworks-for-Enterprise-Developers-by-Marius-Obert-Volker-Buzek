import Log from "sap/base/Log";
import type { BaseManifestSettings } from "sap/fe/core/converters/ManifestSettings";
import type { RefreshStrategies, SOAction, SORefreshStrategy } from "sap/fe/core/helpers/KeepAliveRefreshTypes";
import { PATH_TO_STORE, RefreshStrategyType } from "sap/fe/core/helpers/KeepAliveRefreshTypes";
import type Control from "sap/ui/core/Control";
import type View from "sap/ui/core/mvc/View";
import type JSONModel from "sap/ui/model/json/JSONModel";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import type { InternalModelContext } from "./ModelHelper";
import ModelHelper from "./ModelHelper";

// Private functions - start
const _fnSimplifyEntitySetPath = function (metaModel: ODataMetaModel, entitySetPathToUse: string): string {
	const entitySetPath = ModelHelper.getEntitySetPath(entitySetPathToUse);
	const entitySet = entitySetPath.indexOf("$NavigationPropertyBinding") > -1 && metaModel.getObject(entitySetPath);
	return entitySet ? `/${entitySet}` : entitySetPathToUse;
};
const _fnIsApplicable = function (primaryPath: string, key: string, strategy: RefreshStrategyType): boolean {
	return primaryPath === key || (strategy === RefreshStrategyType.IncludingDependents && primaryPath.startsWith(key));
};
/**
 * Check if given path resides in the context path provided.
 *
 * @param metaModel MetaModel to be used
 * @param contextPath Context path to be used
 * @param path Path to be used
 * @param strategy Strategy, it could be 'self' | 'includingDependents'
 * @returns Returns true if the context path is applicable.
 */
const _isPathApplicableToContextPath = function (
	metaModel: ODataMetaModel,
	contextPath: string,
	path: string,
	strategy: RefreshStrategyType
): boolean {
	let contextPathToCheck = contextPath.startsWith("/") ? contextPath : `/${contextPath}`,
		pathToCheck = path.startsWith("/") ? path : `/${path}`;
	if (!_fnIsApplicable(contextPathToCheck, pathToCheck, strategy)) {
		contextPathToCheck = _fnSimplifyEntitySetPath(metaModel, contextPathToCheck);
		if (!_fnIsApplicable(contextPathToCheck, pathToCheck, strategy)) {
			pathToCheck = _fnSimplifyEntitySetPath(metaModel, pathToCheck);
		} else {
			return true;
		}
	}
	return _fnIsApplicable(contextPathToCheck, pathToCheck, strategy);
};
// Private functions - end
/**
 * Get controls to refresh in a view.
 *
 * @param view View of the controls
 * @param controls Context path to be used
 * @returns Returns controls that need to be refreshed.
 */
const getControlsForRefresh = function (view: View, controls: Control[]): Control[] {
	const controlsForRefresh: Control[] = [];
	const metaModel = view.getModel().getMetaModel() as ODataMetaModel;
	const internalModel = view.getModel("internal");
	const refreshStrategy = internalModel.getProperty(PATH_TO_STORE) || {};
	if (controls) {
		controls.forEach(function (control) {
			const contextPath = control.data("targetCollectionPath");
			for (const key in refreshStrategy) {
				const strategy = refreshStrategy[key];
				if (controlsForRefresh.indexOf(control) === -1 && _isPathApplicableToContextPath(metaModel, contextPath, key, strategy)) {
					controlsForRefresh.push(control);
				}
			}
		});
	}
	return controlsForRefresh;
};
/**
 * Get refresh strategy for the control for a context path.
 *
 * @param control Control from which refresh info is needed
 * @param contextPath ContextPath for properities
 * @returns Returns strategy for control refresh.
 */
const getControlRefreshStrategyForContextPath = function (control: Control, contextPath: string): RefreshStrategyType | undefined {
	const metaModel = control.getModel().getMetaModel() as ODataMetaModel;
	const internalModel = control.getModel("internal");
	const refreshStrategy = internalModel.getProperty(PATH_TO_STORE) || {};
	let strategy;
	if (contextPath) {
		for (const key in refreshStrategy) {
			const strategyToCheck = refreshStrategy[key];
			if (_isPathApplicableToContextPath(metaModel, contextPath, key, strategyToCheck)) {
				strategy = strategyToCheck;
				if (strategy === "includingDependents") {
					break;
				}
			}
		}
	}
	return strategy;
};
/**
 * Get refresh info from view.
 *
 * @param view View from which refresh info is needed
 * @returns Returns strategy for view refresh.
 */
const getViewRefreshInfo = function (view: View): RefreshStrategyType | undefined {
	const viewData = view.getViewData() as BaseManifestSettings,
		contextPath = viewData && (viewData?.contextPath || `/${viewData?.entitySet}`);
	return KeepAliveHelper.getControlRefreshStrategyForContextPath(view, contextPath);
};

/**
 * Get refresh strategy for an intent.
 *
 * @param refreshStrategies RefreshStrategies to consider
 * @param semanticObject Outbound Semantic Object
 * @param action Outbound Action
 * @returns Returns refresh strategies to use for the intent.
 */
const getRefreshStrategyForIntent = function (
	refreshStrategies: RefreshStrategies,
	semanticObject?: string,
	action?: string
): SORefreshStrategy | undefined {
	const soAction = semanticObject && action && `${semanticObject}-${action}`;
	const intents = refreshStrategies.intents;
	const soActionIntentMatch = intents && soAction && intents[soAction];
	const soIntentMatch = !soActionIntentMatch && intents && semanticObject && intents[semanticObject];

	return soActionIntentMatch || soIntentMatch || refreshStrategies?.defaultBehavior || refreshStrategies?._feDefault;
};
/**
 * Store control refresh strategy for hash in the internal model.
 *
 * @param control Control for the refresh strategy
 * @param hash Shell hash object
 */
const storeControlRefreshStrategyForHash = function (control: Control, hash: SOAction): void {
	if (control && control.getModel("viewData") && control.getModel("internal")) {
		const viewData = control.getModel("viewData");
		const refreshStrategies: RefreshStrategies = viewData.getProperty(PATH_TO_STORE);
		if (refreshStrategies) {
			const internalModel = control.getModel("internal");
			const refreshStrategy: SORefreshStrategy | undefined = KeepAliveHelper.getRefreshStrategyForIntent(
				refreshStrategies,
				hash?.semanticObject,
				hash?.action
			);
			(internalModel as JSONModel).setProperty(PATH_TO_STORE, refreshStrategy);
		}
	}
};

/**
 * Method to refresh and restore the view if neccessary.
 *
 * @param view Control for the refresh strategy
 * @returns A promise after view refresh and restore are triggered
 */
const restoreView = function (view: View): Promise<any> {
	const internalModelContext = view.getBindingContext("internal") as InternalModelContext;
	const controller = view.getController();
	const viewState = (controller as any)?.viewState;
	let refreshBindings = Promise.resolve();
	if (internalModelContext && internalModelContext.getProperty("restoreStatus") === "pending") {
		if (viewState.refreshViewBindings) {
			refreshBindings = viewState.refreshViewBindings();
			refreshBindings
				.then(function () {
					Log.info(`FE V4: Refresh was triggered successfull: ${view.getId()}`);
				})
				.catch(function (err) {
					Log.warning(`FE V4: Refresh was unsuccessfull: ${view.getId()}`, err);
				});
		}
		refreshBindings = refreshBindings
			.then(function () {
				viewState.onRestore();
				internalModelContext.setProperty("restoreStatus", "done");
			})
			.catch(function (error) {
				Log.warning(`FE V4: Restore was unsuccessfull: ${view.getId()}`, error);
			});
	}
	return refreshBindings;
};

/**
 * helper class for KeepAlive feature in sap.fe.
 */
const KeepAliveHelper = {
	getControlsForRefresh,
	getControlRefreshStrategyForContextPath,
	getViewRefreshInfo,
	getRefreshStrategyForIntent,
	storeControlRefreshStrategyForHash,
	restoreView
};
export default KeepAliveHelper;
