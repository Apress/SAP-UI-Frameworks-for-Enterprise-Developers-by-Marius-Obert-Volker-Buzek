import Log from "sap/base/Log";
import type AppComponent from "sap/fe/core/AppComponent";
import BusyLocker from "sap/fe/core/controllerextensions/BusyLocker";
import messageHandling from "sap/fe/core/controllerextensions/messageHandler/messageHandling";
import Placeholder from "sap/fe/core/controllerextensions/Placeholder";
import NavigationReason from "sap/fe/core/controllerextensions/routing/NavigationReason";
import type RouterProxy from "sap/fe/core/controllerextensions/routing/RouterProxy";
import AppStartupHelper from "sap/fe/core/helpers/AppStartupHelper";
import { defineUI5Class, event } from "sap/fe/core/helpers/ClassSupport";
import EditState from "sap/fe/core/helpers/EditState";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import SemanticKeyHelper from "sap/fe/core/helpers/SemanticKeyHelper";
import CollaborationHelper from "sap/suite/ui/commons/collaboration/CollaborationHelper";
import BindingParser from "sap/ui/base/BindingParser";
import type Event from "sap/ui/base/Event";
import EventProvider from "sap/ui/base/EventProvider";
import type Router from "sap/ui/core/routing/Router";
import Service from "sap/ui/core/service/Service";
import ServiceFactory from "sap/ui/core/service/ServiceFactory";
import type Context from "sap/ui/model/odata/v4/Context";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";
import ODataUtils from "sap/ui/model/odata/v4/ODataUtils";
import type { ServiceContext } from "types/metamodel_types";

type RoutingServiceSettings = {};
@defineUI5Class("sap.fe.core.services.RoutingServiceEventing")
class RoutingServiceEventing extends EventProvider {
	@event()
	routeMatched!: Function;

	@event()
	afterRouteMatched!: Function;
}

export type SemanticMapping = {
	semanticPath: string;
	technicalPath: string;
};
export class RoutingService extends Service<RoutingServiceSettings> {
	oAppComponent!: AppComponent;

	oModel!: ODataModel;

	oMetaModel!: ODataMetaModel;

	oRouter!: Router;

	oRouterProxy!: RouterProxy;

	eventProvider!: EventProvider;

	initPromise!: Promise<any>;

	outbounds: any;

	_mTargets: any;

	_mRoutes: any;

	oLastSemanticMapping?: SemanticMapping;

	bExitOnNavigateBackToRoot?: boolean;

	sCurrentRouteName?: string;

	sCurrentRoutePattern?: string;

	aCurrentViews?: any[];

	navigationInfoQueue: any[] = [];

	sContextPath!: string;

	_fnOnRouteMatched!: Function;

	init() {
		const oContext = this.getContext();
		if (oContext.scopeType === "component") {
			this.oAppComponent = oContext.scopeObject;
			this.oModel = this.oAppComponent.getModel() as ODataModel;
			this.oMetaModel = this.oModel.getMetaModel();
			this.oRouter = this.oAppComponent.getRouter();
			this.oRouterProxy = this.oAppComponent.getRouterProxy();
			this.eventProvider = new (RoutingServiceEventing as any)();

			const oRoutingConfig = this.oAppComponent.getManifestEntry("sap.ui5").routing;
			this._parseRoutingConfiguration(oRoutingConfig);

			const oAppConfig = this.oAppComponent.getManifestEntry("sap.app");
			this.outbounds = oAppConfig.crossNavigation?.outbounds;
		}

		this.initPromise = Promise.resolve(this);
	}

	beforeExit() {
		this.oRouter.detachRouteMatched(this._fnOnRouteMatched, this);
		this.eventProvider.fireEvent("routeMatched", {});
	}

	exit() {
		this.eventProvider.destroy();
	}

	/**
	 * Parse a manifest routing configuration for internal usage.
	 *
	 * @param oRoutingConfig The routing configuration from the manifest
	 * @private
	 */
	_parseRoutingConfiguration(oRoutingConfig: any) {
		const isFCL = oRoutingConfig?.config?.routerClass === "sap.f.routing.Router";

		// Information of targets
		this._mTargets = {};
		Object.keys(oRoutingConfig.targets).forEach((sTargetName: string) => {
			this._mTargets[sTargetName] = Object.assign({ targetName: sTargetName }, oRoutingConfig.targets[sTargetName]);

			// View level for FCL cases is calculated from the target pattern
			if (this._mTargets[sTargetName].contextPattern !== undefined) {
				this._mTargets[sTargetName].viewLevel = this._getViewLevelFromPattern(this._mTargets[sTargetName].contextPattern, 0);
			}
		});

		// Information of routes
		this._mRoutes = {};
		for (const sRouteKey in oRoutingConfig.routes) {
			const oRouteManifestInfo = oRoutingConfig.routes[sRouteKey],
				aRouteTargets = Array.isArray(oRouteManifestInfo.target) ? oRouteManifestInfo.target : [oRouteManifestInfo.target],
				sRouteName = Array.isArray(oRoutingConfig.routes) ? oRouteManifestInfo.name : sRouteKey,
				sRoutePattern = oRouteManifestInfo.pattern;

			// Check route pattern: all patterns need to end with ':?query:', that we use for parameters
			if (sRoutePattern.length < 8 || sRoutePattern.indexOf(":?query:") !== sRoutePattern.length - 8) {
				Log.warning(`Pattern for route ${sRouteName} doesn't end with ':?query:' : ${sRoutePattern}`);
			}
			const iRouteLevel = this._getViewLevelFromPattern(sRoutePattern, 0);
			this._mRoutes[sRouteName] = {
				name: sRouteName,
				pattern: sRoutePattern,
				targets: aRouteTargets,
				routeLevel: iRouteLevel
			};

			// Add the parent targets in the list of targets for the route
			for (let i = 0; i < aRouteTargets.length; i++) {
				const sParentTargetName = this._mTargets[aRouteTargets[i]].parent;
				if (sParentTargetName) {
					aRouteTargets.push(sParentTargetName);
				}
			}

			if (!isFCL) {
				// View level for non-FCL cases is calculated from the route pattern
				if (this._mTargets[aRouteTargets[0]].viewLevel === undefined || this._mTargets[aRouteTargets[0]].viewLevel < iRouteLevel) {
					// There are cases when different routes point to the same target. We take the
					// largest viewLevel in that case.
					this._mTargets[aRouteTargets[0]].viewLevel = iRouteLevel;
				}

				// FCL level for non-FCL cases is equal to -1
				this._mTargets[aRouteTargets[0]].FCLLevel = -1;
			} else if (aRouteTargets.length === 1 && this._mTargets[aRouteTargets[0]].controlAggregation !== "beginColumnPages") {
				// We're in the case where there's only 1 target for the route, and it's not in the first column
				// --> this is a fullscreen column after all columns in the FCL have been used
				this._mTargets[aRouteTargets[0]].FCLLevel = 3;
			} else {
				// Other FCL cases
				aRouteTargets.forEach((sTargetName: any) => {
					switch (this._mTargets[sTargetName].controlAggregation) {
						case "beginColumnPages":
							this._mTargets[sTargetName].FCLLevel = 0;
							break;

						case "midColumnPages":
							this._mTargets[sTargetName].FCLLevel = 1;
							break;

						default:
							this._mTargets[sTargetName].FCLLevel = 2;
					}
				});
			}
		}

		// Propagate viewLevel, contextPattern, FCLLevel and controlAggregation to parent targets
		Object.keys(this._mTargets).forEach((sTargetName: string) => {
			while (this._mTargets[sTargetName].parent) {
				const sParentTargetName = this._mTargets[sTargetName].parent;
				this._mTargets[sParentTargetName].viewLevel =
					this._mTargets[sParentTargetName].viewLevel || this._mTargets[sTargetName].viewLevel;
				this._mTargets[sParentTargetName].contextPattern =
					this._mTargets[sParentTargetName].contextPattern || this._mTargets[sTargetName].contextPattern;
				this._mTargets[sParentTargetName].FCLLevel =
					this._mTargets[sParentTargetName].FCLLevel || this._mTargets[sTargetName].FCLLevel;
				this._mTargets[sParentTargetName].controlAggregation =
					this._mTargets[sParentTargetName].controlAggregation || this._mTargets[sTargetName].controlAggregation;
				sTargetName = sParentTargetName;
			}
		});

		// Determine the root entity for the app
		const aLevel0RouteNames = [];
		const aLevel1RouteNames = [];
		let sDefaultRouteName;

		for (const sName in this._mRoutes) {
			const iLevel = this._mRoutes[sName].routeLevel;
			if (iLevel === 0) {
				aLevel0RouteNames.push(sName);
			} else if (iLevel === 1) {
				aLevel1RouteNames.push(sName);
			}
		}

		if (aLevel0RouteNames.length === 1) {
			sDefaultRouteName = aLevel0RouteNames[0];
		} else if (aLevel1RouteNames.length === 1) {
			sDefaultRouteName = aLevel1RouteNames[0];
		}

		if (sDefaultRouteName) {
			const sDefaultTargetName = this._mRoutes[sDefaultRouteName].targets.slice(-1)[0];
			this.sContextPath = "";
			if (this._mTargets[sDefaultTargetName].options && this._mTargets[sDefaultTargetName].options.settings) {
				const oSettings = this._mTargets[sDefaultTargetName].options.settings;
				this.sContextPath = oSettings.contextPath || `/${oSettings.entitySet}`;
			}
			if (!this.sContextPath) {
				Log.warning(
					`Cannot determine default contextPath: contextPath or entitySet missing in default target: ${sDefaultTargetName}`
				);
			}
		} else {
			Log.warning("Cannot determine default contextPath: no default route found.");
		}

		// We need to establish the correct path to the different pages, including the navigation properties
		Object.keys(this._mTargets)
			.map((sTargetKey: string) => {
				return this._mTargets[sTargetKey];
			})
			.sort((a: any, b: any) => {
				return a.viewLevel < b.viewLevel ? -1 : 1;
			})
			.forEach((target: any) => {
				// After sorting the targets per level we can then go through their navigation object and update the paths accordingly.
				if (target.options) {
					const settings = target.options.settings;
					const sContextPath = settings.contextPath || (settings.entitySet ? `/${settings.entitySet}` : "");
					if (!settings.fullContextPath && sContextPath) {
						settings.fullContextPath = `${sContextPath}/`;
					}
					Object.keys(settings.navigation || {}).forEach((sNavName: string) => {
						// Check if it's a navigation property
						const targetRoute = this._mRoutes[settings.navigation[sNavName].detail.route];
						if (targetRoute && targetRoute.targets) {
							targetRoute.targets.forEach((sTargetName: any) => {
								if (
									this._mTargets[sTargetName].options &&
									this._mTargets[sTargetName].options.settings &&
									!this._mTargets[sTargetName].options.settings.fullContextPath
								) {
									if (target.viewLevel === 0) {
										this._mTargets[sTargetName].options.settings.fullContextPath = `${
											(sNavName.startsWith("/") ? "" : "/") + sNavName
										}/`;
									} else {
										this._mTargets[sTargetName].options.settings.fullContextPath = `${
											settings.fullContextPath + sNavName
										}/`;
									}
								}
							});
						}
					});
				}
			});
	}

	/**
	 * Calculates a view level from a pattern by counting the number of segments.
	 *
	 * @param sPattern The pattern
	 * @param viewLevel The current level of view
	 * @returns The level
	 */
	_getViewLevelFromPattern(sPattern: string, viewLevel: number): number {
		sPattern = sPattern.replace(":?query:", "");
		const regex = new RegExp("/[^/]*$");
		if (sPattern && sPattern[0] !== "/" && sPattern[0] !== "?") {
			sPattern = `/${sPattern}`;
		}
		if (sPattern.length) {
			sPattern = sPattern.replace(regex, "");
			if (this.oRouter.match(sPattern) || sPattern === "") {
				return this._getViewLevelFromPattern(sPattern, ++viewLevel);
			} else {
				return this._getViewLevelFromPattern(sPattern, viewLevel);
			}
		} else {
			return viewLevel;
		}
	}

	_getRouteInformation(sRouteName: any) {
		return this._mRoutes[sRouteName];
	}

	_getTargetInformation(sTargetName: any) {
		return this._mTargets[sTargetName];
	}

	_getComponentId(sOwnerId: any, sComponentId: any) {
		if (sComponentId.indexOf(`${sOwnerId}---`) === 0) {
			return sComponentId.substr(sOwnerId.length + 3);
		}
		return sComponentId;
	}

	/**
	 * Get target information for a given component.
	 *
	 * @param oComponentInstance Instance of the component
	 * @returns The configuration for the target
	 */
	getTargetInformationFor(oComponentInstance: any) {
		const sTargetComponentId = this._getComponentId(oComponentInstance._sOwnerId, oComponentInstance.getId());
		let sCorrectTargetName = null;
		Object.keys(this._mTargets).forEach((sTargetName: string) => {
			if (this._mTargets[sTargetName].id === sTargetComponentId || this._mTargets[sTargetName].viewId === sTargetComponentId) {
				sCorrectTargetName = sTargetName;
			}
		});
		return this._getTargetInformation(sCorrectTargetName);
	}

	getLastSemanticMapping(): SemanticMapping | undefined {
		return this.oLastSemanticMapping;
	}

	setLastSemanticMapping(oMapping?: SemanticMapping) {
		this.oLastSemanticMapping = oMapping;
	}

	navigateTo(oContext: any, sRouteName: any, mParameterMapping: any, bPreserveHistory: any) {
		let sTargetURLPromise, bIsStickyMode: boolean;
		if (oContext.getModel() && oContext.getModel().getMetaModel && oContext.getModel().getMetaModel()) {
			bIsStickyMode = ModelHelper.isStickySessionSupported(oContext.getModel().getMetaModel());
		}
		if (!mParameterMapping) {
			// if there is no parameter mapping define this mean we rely entirely on the binding context path
			sTargetURLPromise = Promise.resolve(SemanticKeyHelper.getSemanticPath(oContext));
		} else {
			sTargetURLPromise = this.prepareParameters(mParameterMapping, sRouteName, oContext).then((mParameters: any) => {
				return this.oRouter.getURL(sRouteName, mParameters);
			});
		}
		return sTargetURLPromise.then((sTargetURL: any) => {
			this.oRouterProxy.navToHash(sTargetURL, bPreserveHistory, false, false, !bIsStickyMode);
		});
	}

	/**
	 * Method to return a map of routing target parameters where the binding syntax is resolved to the current model.
	 *
	 * @param mParameters Parameters map in the format [k: string] : ComplexBindingSyntax
	 * @param sTargetRoute Name of the target route
	 * @param oContext The instance of the binding context
	 * @returns A promise which resolves to the routing target parameters
	 */
	prepareParameters(mParameters: any, sTargetRoute: string, oContext: Context) {
		let oParametersPromise;
		try {
			const sContextPath = oContext.getPath();
			const oMetaModel: ODataMetaModel = oContext.getModel().getMetaModel();
			const aContextPathParts = sContextPath.split("/");
			const aAllResolvedParameterPromises = Object.keys(mParameters).map((sParameterKey: any) => {
				const sParameterMappingExpression = mParameters[sParameterKey];
				// We assume the defined parameters will be compatible with a binding expression
				const oParsedExpression = BindingParser.complexParser(sParameterMappingExpression);
				const aParts = oParsedExpression.parts || [oParsedExpression];
				const aResolvedParameterPromises = aParts.map(function (oPathPart: any) {
					const aRelativeParts = oPathPart.path.split("../");
					// We go up the current context path as many times as necessary
					const aLocalParts = aContextPathParts.slice(0, aContextPathParts.length - aRelativeParts.length + 1);
					aLocalParts.push(aRelativeParts[aRelativeParts.length - 1]);

					const sPropertyPath = aLocalParts.join("/");
					const oMetaContext = (oMetaModel as any).getMetaContext(sPropertyPath);
					return oContext.requestProperty(sPropertyPath).then(function (oValue: any) {
						const oPropertyInfo = oMetaContext.getObject();
						const sEdmType = oPropertyInfo.$Type;
						return ODataUtils.formatLiteral(oValue, sEdmType);
					});
				});

				return Promise.all(aResolvedParameterPromises).then((aResolvedParameters: any) => {
					const value = oParsedExpression.formatter
						? oParsedExpression.formatter.apply(this, aResolvedParameters)
						: aResolvedParameters.join("");
					return { key: sParameterKey, value: value };
				});
			});

			oParametersPromise = Promise.all(aAllResolvedParameterPromises).then(function (
				aAllResolvedParameters: { key: any; value: any }[]
			) {
				const oParameters: any = {};
				aAllResolvedParameters.forEach(function (oResolvedParameter: { key: any; value: any }) {
					oParameters[oResolvedParameter.key] = oResolvedParameter.value;
				});
				return oParameters;
			});
		} catch (oError) {
			Log.error(`Could not parse the parameters for the navigation to route ${sTargetRoute}`);
			oParametersPromise = Promise.resolve(undefined);
		}
		return oParametersPromise;
	}

	_fireRouteMatchEvents(mParameters: any) {
		this.eventProvider.fireEvent("routeMatched", mParameters);
		this.eventProvider.fireEvent("afterRouteMatched", mParameters);

		EditState.cleanProcessedEditState(); // Reset UI state when all bindings have been refreshed
	}

	/**
	 * Navigates to a context.
	 *
	 * @param oContext The Context to be navigated to
	 * @param [mParameters] Optional, map containing the following attributes:
	 * @param [mParameters.checkNoHashChange] Navigate to the context without changing the URL
	 * @param [mParameters.asyncContext] The context is created async, navigate to (...) and
	 *                    wait for Promise to be resolved and then navigate into the context
	 * @param [mParameters.bDeferredContext] The context shall be created deferred at the target page
	 * @param [mParameters.editable] The target page shall be immediately in the edit mode to avoid flickering
	 * @param [mParameters.bPersistOPScroll] The bPersistOPScroll will be used for scrolling to first tab
	 * @param [mParameters.updateFCLLevel] `+1` if we add a column in FCL, `-1` to remove a column, 0 to stay on the same column
	 * @param [mParameters.noPreservationCache] Do navigation without taking into account the preserved cache mechanism
	 * @param [mParameters.bRecreateContext] Force re-creation of the context instead of using the one passed as parameter
	 * @param [mParameters.bForceFocus] Forces focus selection after navigation
	 * @param [oViewData] View data
	 * @param [oCurrentTargetInfo] The target information from which the navigation is triggered
	 * @returns Promise which is resolved once the navigation is triggered
	 * @ui5-restricted
	 * @final
	 */
	navigateToContext(
		oContext: any,
		mParameters:
			| {
					checkNoHashChange?: boolean;
					asyncContext?: Promise<any>;
					bDeferredContext?: boolean;
					editable?: boolean;
					transient?: boolean;
					bPersistOPScroll?: boolean;
					updateFCLLevel?: number;
					noPreservationCache?: boolean;
					bRecreateContext?: boolean;
					bForceFocus?: boolean;
					targetPath?: string;
					showPlaceholder?: boolean;
					bDraftNavigation?: boolean;
					reason?: NavigationReason;
			  }
			| undefined,
		oViewData: any | undefined,
		oCurrentTargetInfo: any | undefined
	): Promise<boolean> {
		let sTargetRoute: string = "",
			oRouteParametersPromise,
			bIsStickyMode: boolean = false;

		if (oContext.getModel() && oContext.getModel().getMetaModel) {
			bIsStickyMode = ModelHelper.isStickySessionSupported(oContext.getModel().getMetaModel());
		}
		// Manage parameter mapping
		if (mParameters && mParameters.targetPath && oViewData && oViewData.navigation) {
			const oRouteDetail = oViewData.navigation[mParameters.targetPath].detail;
			sTargetRoute = oRouteDetail.route;

			if (oRouteDetail.parameters) {
				oRouteParametersPromise = this.prepareParameters(oRouteDetail.parameters, sTargetRoute, oContext);
			}
		}

		let sTargetPath = this._getPathFromContext(oContext, mParameters);
		// If the path is empty, we're supposed to navigate to the first page of the app
		// Check if we need to exit from the app instead
		if (sTargetPath.length === 0 && this.bExitOnNavigateBackToRoot) {
			this.oRouterProxy.exitFromApp();
			return Promise.resolve(true);
		}

		// If the context is deferred or async, we add (...) to the path
		if (mParameters?.asyncContext || mParameters?.bDeferredContext) {
			sTargetPath += "(...)";
		}

		// Add layout parameter if needed
		const sLayout = this._calculateLayout(sTargetPath, mParameters);
		if (sLayout) {
			sTargetPath += `?layout=${sLayout}`;
		}

		// Navigation parameters for later usage
		const oNavigationInfo = {
			oAsyncContext: mParameters?.asyncContext,
			bDeferredContext: mParameters?.bDeferredContext,
			bTargetEditable: mParameters?.editable,
			bPersistOPScroll: mParameters?.bPersistOPScroll,
			useContext: mParameters?.updateFCLLevel === -1 || mParameters?.bRecreateContext ? undefined : oContext,
			bDraftNavigation: mParameters?.bDraftNavigation,
			bShowPlaceholder: mParameters?.showPlaceholder !== undefined ? mParameters?.showPlaceholder : true,
			reason: mParameters?.reason
		};

		if (mParameters?.checkNoHashChange) {
			// Check if the new hash is different from the current one
			const sCurrentHashNoAppState = this.oRouterProxy.getHash().replace(/[&?]{1}sap-iapp-state=[A-Z0-9]+/, "");
			if (sTargetPath === sCurrentHashNoAppState) {
				// The hash doesn't change, but we fire the routeMatch event to trigger page refresh / binding
				const mEventParameters: any = this.oRouter.getRouteInfoByHash(this.oRouterProxy.getHash());
				if (mEventParameters) {
					mEventParameters.navigationInfo = oNavigationInfo;
					mEventParameters.routeInformation = this._getRouteInformation(this.sCurrentRouteName);
					mEventParameters.routePattern = this.sCurrentRoutePattern;
					mEventParameters.views = this.aCurrentViews;
				}

				this.oRouterProxy.setFocusForced(!!mParameters.bForceFocus);

				this._fireRouteMatchEvents(mEventParameters);

				return Promise.resolve(true);
			}
		}

		if (mParameters?.transient && mParameters.editable == true && sTargetPath.indexOf("(...)") === -1) {
			if (sTargetPath.indexOf("?") > -1) {
				sTargetPath += "&i-action=create";
			} else {
				sTargetPath += "?i-action=create";
			}
		}

		// Clear unbound messages upon navigating from LR to OP
		// This is to ensure stale error messages from LR are not shown to the user after navigation to OP.
		if (oCurrentTargetInfo && oCurrentTargetInfo.name === "sap.fe.templates.ListReport") {
			const oRouteInfo = this.oRouter.getRouteInfoByHash(sTargetPath);
			if (oRouteInfo) {
				const oRoute = this._getRouteInformation(oRouteInfo.name);
				if (oRoute && oRoute.targets && oRoute.targets.length > 0) {
					const sLastTargetName = oRoute.targets[oRoute.targets.length - 1];
					const oTarget = this._getTargetInformation(sLastTargetName);
					if (oTarget && oTarget.name === "sap.fe.templates.ObjectPage") {
						messageHandling.removeUnboundTransitionMessages();
					}
				}
			}
		}

		// Add the navigation parameters in the queue
		this.navigationInfoQueue.push(oNavigationInfo);

		if (sTargetRoute && oRouteParametersPromise) {
			return oRouteParametersPromise.then((oRouteParameters: any) => {
				oRouteParameters.bIsStickyMode = bIsStickyMode;
				this.oRouter.navTo(sTargetRoute, oRouteParameters);
				return Promise.resolve(true);
			});
		}
		return this.oRouterProxy
			.navToHash(sTargetPath, false, mParameters?.noPreservationCache, mParameters?.bForceFocus, !bIsStickyMode)
			.then((bNavigated: any) => {
				if (!bNavigated) {
					// The navigation did not happen --> remove the navigation parameters from the queue as they shouldn't be used
					this.navigationInfoQueue.pop();
				}
				return bNavigated;
			});
	}

	/**
	 * Navigates to a route.
	 *
	 * @function
	 * @name sap.fe.core.controllerextensions.Routing#navigateToRoute
	 * @memberof sap.fe.core.controllerextensions.Routing
	 * @static
	 * @param sTargetRouteName Name of the target route
	 * @param [oRouteParameters] Parameters to be used with route to create the target hash
	 * @returns Promise that is resolved when the navigation is finalized
	 * @ui5-restricted
	 * @final
	 */
	navigateToRoute(sTargetRouteName: string, oRouteParameters?: any) {
		const sTargetURL = this.oRouter.getURL(sTargetRouteName, oRouteParameters);
		return this.oRouterProxy.navToHash(sTargetURL, undefined, undefined, undefined, !oRouteParameters.bIsStickyMode);
	}

	/**
	 * Checks if one of the current views on the screen is bound to a given context.
	 *
	 * @param oContext The context
	 * @returns `true` or `false` if the current state is impacted or not
	 */
	isCurrentStateImpactedBy(oContext: any) {
		const sPath = oContext.getPath();

		// First, check with the technical path. We have to try it, because for level > 1, we
		// uses technical keys even if Semantic keys are enabled
		if (this.oRouterProxy.isCurrentStateImpactedBy(sPath)) {
			return true;
		} else if (/^[^()]+\([^()]+\)$/.test(sPath)) {
			// If the current path can be semantic (i.e. is like xxx(yyy))
			// check with the semantic path if we can find it
			let sSemanticPath;
			if (this.oLastSemanticMapping && this.oLastSemanticMapping.technicalPath === sPath) {
				// We have already resolved this semantic path
				sSemanticPath = this.oLastSemanticMapping.semanticPath;
			} else {
				sSemanticPath = SemanticKeyHelper.getSemanticPath(oContext);
			}

			return sSemanticPath != sPath ? this.oRouterProxy.isCurrentStateImpactedBy(sSemanticPath) : false;
		} else {
			return false;
		}
	}

	_findPathToNavigate(sPath: any): string {
		const regex = new RegExp("/[^/]*$");
		sPath = sPath.replace(regex, "");
		if (this.oRouter.match(sPath) || sPath === "") {
			return sPath;
		} else {
			return this._findPathToNavigate(sPath);
		}
	}

	_checkIfContextSupportsSemanticPath(oContext: Context) {
		const sPath = oContext.getPath();

		// First, check if this is a level-1 object (path = /aaa(bbb))
		if (!/^\/[^(]+\([^)]+\)$/.test(sPath)) {
			return false;
		}

		// Then check if the entity has semantic keys
		const oMetaModel = oContext.getModel().getMetaModel();
		const sEntitySetName = oMetaModel.getMetaContext(oContext.getPath()).getObject("@sapui.name") as string;
		if (!SemanticKeyHelper.getSemanticKeys(oMetaModel, sEntitySetName)) {
			return false;
		}

		// Then check the entity is draft-enabled
		return ModelHelper.isDraftSupported(oMetaModel, sPath);
	}

	_getPathFromContext(oContext: any, mParameters: any) {
		let sPath;

		if (oContext.isA("sap.ui.model.odata.v4.ODataListBinding") && oContext.isRelative()) {
			sPath = oContext.getHeaderContext().getPath();
		} else {
			sPath = oContext.getPath();
		}

		if (mParameters.updateFCLLevel === -1) {
			// When navigating back from a context, we need to remove the last component of the path
			sPath = this._findPathToNavigate(sPath);

			// Check if we're navigating back to a semantic path that was previously resolved
			if (this.oLastSemanticMapping && this.oLastSemanticMapping.technicalPath === sPath) {
				sPath = this.oLastSemanticMapping.semanticPath;
			}
		} else if (this._checkIfContextSupportsSemanticPath(oContext)) {
			// We check if we have to use a semantic path
			const sSemanticPath = SemanticKeyHelper.getSemanticPath(oContext, true);

			if (!sSemanticPath) {
				// We were not able to build the semantic path --> Use the technical path and
				// clear the previous mapping, otherwise the old mapping is used in EditFlow#updateDocument
				// and it leads to unwanted page reloads
				this.setLastSemanticMapping(undefined);
			} else if (sSemanticPath !== sPath) {
				// Store the mapping technical <-> semantic path to avoid recalculating it later
				// and use the semantic path instead of the technical one
				this.setLastSemanticMapping({ technicalPath: sPath, semanticPath: sSemanticPath });
				sPath = sSemanticPath;
			}
		}

		// remove extra '/' at the beginning of path
		if (sPath[0] === "/") {
			sPath = sPath.substring(1);
		}

		return sPath;
	}

	_calculateLayout(sPath: any, mParameters: any) {
		let FCLLevel = mParameters.FCLLevel;
		if (mParameters.updateFCLLevel) {
			FCLLevel += mParameters.updateFCLLevel;
			if (FCLLevel < 0) {
				FCLLevel = 0;
			}
		}

		// When navigating back, try to find the layout in the navigation history if it's not provided as parameter
		// (layout calculation is not handled properly by the FlexibleColumnLayoutSemanticHelper in this case)
		if (mParameters.updateFCLLevel < 0 && !mParameters.sLayout) {
			mParameters.sLayout = this.oRouterProxy.findLayoutForHash(sPath);
		}

		return (this.oAppComponent.getRootViewController() as any).calculateLayout(
			FCLLevel,
			sPath,
			mParameters.sLayout,
			mParameters.keepCurrentLayout
		);
	}

	/**
	 * Event handler before a route is matched.
	 * Displays a busy indicator.
	 *
	 */
	_beforeRouteMatched(/*oEvent: Event*/) {
		const bPlaceholderEnabled = new Placeholder().isPlaceholderEnabled();
		if (!bPlaceholderEnabled) {
			const oRootView = this.oAppComponent.getRootControl();
			BusyLocker.lock(oRootView);
		}
	}

	/**
	 * Event handler when a route is matched.
	 * Hides the busy indicator and fires its own 'routematched' event.
	 *
	 * @param oEvent The event
	 */
	_onRouteMatched(oEvent: Event) {
		const oAppStateHandler = this.oAppComponent.getAppStateHandler(),
			oRootView = this.oAppComponent.getRootControl();
		const bPlaceholderEnabled = new Placeholder().isPlaceholderEnabled();
		if (BusyLocker.isLocked(oRootView) && !bPlaceholderEnabled) {
			BusyLocker.unlock(oRootView);
		}
		const mParameters: any = oEvent.getParameters();
		if (this.navigationInfoQueue.length) {
			mParameters.navigationInfo = this.navigationInfoQueue[0];
			this.navigationInfoQueue = this.navigationInfoQueue.slice(1);
		} else {
			mParameters.navigationInfo = {};
		}
		if (oAppStateHandler.checkIfRouteChangedByIApp()) {
			mParameters.navigationInfo.reason = NavigationReason.AppStateChanged;
			oAppStateHandler.resetRouteChangedByIApp();
		}

		this.sCurrentRouteName = oEvent.getParameter("name");
		this.sCurrentRoutePattern = mParameters.config.pattern;
		this.aCurrentViews = oEvent.getParameter("views");

		mParameters.routeInformation = this._getRouteInformation(this.sCurrentRouteName);
		mParameters.routePattern = this.sCurrentRoutePattern;

		this._fireRouteMatchEvents(mParameters);

		// Check if current hash has been set by the routerProxy.navToHash function
		// If not, rebuild history properly (both in the browser and the RouterProxy)
		if (!history.state || history.state.feLevel === undefined) {
			this.oRouterProxy
				.restoreHistory()
				.then(() => {
					this.oRouterProxy.resolveRouteMatch();
				})
				.catch(function (oError: any) {
					Log.error("Error while restoring history", oError);
				});
		} else {
			this.oRouterProxy.resolveRouteMatch();
		}
	}

	attachRouteMatched(oData: any, fnFunction?: any, oListener?: any) {
		this.eventProvider.attachEvent("routeMatched", oData, fnFunction, oListener);
	}

	detachRouteMatched(fnFunction: any, oListener?: any) {
		this.eventProvider.detachEvent("routeMatched", fnFunction, oListener);
	}

	attachAfterRouteMatched(oData: any, fnFunction: any, oListener?: any) {
		this.eventProvider.attachEvent("afterRouteMatched", oData, fnFunction, oListener);
	}

	detachAfterRouteMatched(fnFunction: any, oListener: any) {
		this.eventProvider.detachEvent("afterRouteMatched", fnFunction, oListener);
	}

	getRouteFromHash(oRouter: any, oAppComponent: any) {
		const sHash = oRouter.getHashChanger().hash;
		const oRouteInfo = oRouter.getRouteInfoByHash(sHash);
		return oAppComponent
			.getMetadata()
			.getManifestEntry("/sap.ui5/routing/routes")
			.filter(function (oRoute: any) {
				return oRoute.name === oRouteInfo.name;
			})[0];
	}

	getTargetsFromRoute(oRoute: any) {
		const oTarget = oRoute.target;
		if (typeof oTarget === "string") {
			return [this._mTargets[oTarget]];
		} else {
			const aTarget: any[] = [];
			oTarget.forEach((sTarget: any) => {
				aTarget.push(this._mTargets[sTarget]);
			});
			return aTarget;
		}
	}

	async initializeRouting() {
		// Attach router handlers
		await CollaborationHelper.processAndExpandHash();
		this._fnOnRouteMatched = this._onRouteMatched.bind(this);
		this.oRouter.attachRouteMatched(this._fnOnRouteMatched, this);
		const bPlaceholderEnabled = new Placeholder().isPlaceholderEnabled();
		if (!bPlaceholderEnabled) {
			this.oRouter.attachBeforeRouteMatched(this._beforeRouteMatched.bind(this));
		}
		// Reset internal state
		this.navigationInfoQueue = [];
		EditState.resetEditState();
		this.bExitOnNavigateBackToRoot = !this.oRouter.match("");

		const bIsIappState = this.oRouter.getHashChanger().getHash().indexOf("sap-iapp-state") !== -1;
		try {
			const oStartupParameters = await this.oAppComponent.getStartupParameters();
			const bHasStartUpParameters = oStartupParameters !== undefined && Object.keys(oStartupParameters).length !== 0;
			const sHash = this.oRouter.getHashChanger().getHash();
			// Manage startup parameters (in case of no iapp-state)
			if (!bIsIappState && bHasStartUpParameters && !sHash) {
				if (oStartupParameters.preferredMode && oStartupParameters.preferredMode[0].toUpperCase().indexOf("CREATE") !== -1) {
					// Create mode
					// This check will catch multiple modes like create, createWith and autoCreateWith which all need
					// to be handled like create startup!
					await this._manageCreateStartup(oStartupParameters);
				} else {
					// Deep link
					await this._manageDeepLinkStartup(oStartupParameters);
				}
			}
		} catch (oError: unknown) {
			Log.error("Error during routing initialization", oError as string);
		}
	}

	getDefaultCreateHash(oStartupParameters?: any) {
		return AppStartupHelper.getDefaultCreateHash(oStartupParameters, this.getContextPath(), this.oRouter);
	}

	_manageCreateStartup(oStartupParameters: any) {
		return AppStartupHelper.getCreateStartupHash(oStartupParameters, this.getContextPath(), this.oRouter, this.oMetaModel).then(
			(sNewHash: any) => {
				if (sNewHash) {
					(this.oRouter.getHashChanger().replaceHash as any)(sNewHash);
					if (
						oStartupParameters?.preferredMode &&
						oStartupParameters.preferredMode[0].toUpperCase().indexOf("AUTOCREATE") !== -1
					) {
						this.oAppComponent.setStartupModeAutoCreate();
					} else {
						this.oAppComponent.setStartupModeCreate();
					}
					this.bExitOnNavigateBackToRoot = true;
				}
			}
		);
	}

	_manageDeepLinkStartup(oStartupParameters: any) {
		return AppStartupHelper.getDeepLinkStartupHash(
			(this.oAppComponent.getManifest() as any)["sap.ui5"].routing,
			oStartupParameters,
			this.oModel
		).then((oDeepLink: any) => {
			let sHash;
			if (oDeepLink.context) {
				const sTechnicalPath = oDeepLink.context.getPath();
				const sSemanticPath = this._checkIfContextSupportsSemanticPath(oDeepLink.context)
					? SemanticKeyHelper.getSemanticPath(oDeepLink.context)
					: sTechnicalPath;

				if (sSemanticPath !== sTechnicalPath) {
					// Store the mapping technical <-> semantic path to avoid recalculating it later
					// and use the semantic path instead of the technical one
					this.setLastSemanticMapping({ technicalPath: sTechnicalPath, semanticPath: sSemanticPath });
				}

				sHash = sSemanticPath.substring(1); // To remove the leading '/'
			} else if (oDeepLink.hash) {
				sHash = oDeepLink.hash;
			}

			if (sHash) {
				//Replace the hash with newly created hash
				(this.oRouter.getHashChanger().replaceHash as any)(sHash);
				this.oAppComponent.setStartupModeDeeplink();
			}
		});
	}

	getOutbounds() {
		return this.outbounds;
	}

	/**
	 * Gets the name of the Draft root entity set or the sticky-enabled entity set.
	 *
	 * @returns The name of the root EntitySet
	 * @ui5-restricted
	 */
	getContextPath() {
		return this.sContextPath;
	}

	getInterface(): any {
		return this;
	}
}

class RoutingServiceFactory extends ServiceFactory<RoutingServiceSettings> {
	createInstance(oServiceContext: ServiceContext<RoutingServiceSettings>) {
		const oRoutingService = new RoutingService(oServiceContext);
		return oRoutingService.initPromise;
	}
}

export default RoutingServiceFactory;
