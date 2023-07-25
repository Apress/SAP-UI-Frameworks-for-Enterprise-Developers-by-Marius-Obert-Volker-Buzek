import Log from "sap/base/Log";
import type AppComponent from "sap/fe/core/AppComponent";
import CommonUtils from "sap/fe/core/CommonUtils";
import BusyLocker from "sap/fe/core/controllerextensions/BusyLocker";
import { isConnected } from "sap/fe/core/controllerextensions/collaboration/ActivitySync";
import draft from "sap/fe/core/controllerextensions/editFlow/draft";
import NavigationReason from "sap/fe/core/controllerextensions/routing/NavigationReason";
import type RouterProxy from "sap/fe/core/controllerextensions/routing/RouterProxy";
import type { EnhanceWithUI5 } from "sap/fe/core/helpers/ClassSupport";
import { defineUI5Class, extensible, finalExtension, methodOverride, publicExtension } from "sap/fe/core/helpers/ClassSupport";
import EditState from "sap/fe/core/helpers/EditState";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import SemanticKeyHelper from "sap/fe/core/helpers/SemanticKeyHelper";
import type PageController from "sap/fe/core/PageController";
import type { RoutingService } from "sap/fe/core/services/RoutingServiceFactory";
import type TemplateComponent from "sap/fe/core/TemplateComponent";
import type Event from "sap/ui/base/Event";
import Component from "sap/ui/core/Component";
import Core from "sap/ui/core/Core";
import ControllerExtension from "sap/ui/core/mvc/ControllerExtension";
import OverrideExecution from "sap/ui/core/mvc/OverrideExecution";
import type View from "sap/ui/core/mvc/View";
import type Router from "sap/ui/core/routing/Router";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import type JSONModel from "sap/ui/model/json/JSONModel";
import type Context from "sap/ui/model/odata/v4/Context";
import ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";
import { SideEffectsTargetType } from "../services/SideEffectsServiceFactory";

/**
 * {@link sap.ui.core.mvc.ControllerExtension Controller extension}
 *
 * @namespace
 * @alias sap.fe.core.controllerextensions.InternalRouting
 * @private
 * @since 1.74.0
 */
@defineUI5Class("sap.fe.core.controllerextensions.InternalRouting")
class InternalRouting extends ControllerExtension {
	private base!: PageController;

	private _oView!: View;

	private _oAppComponent!: AppComponent;

	private _oPageComponent!: EnhanceWithUI5<TemplateComponent> | null;

	private _oRouter!: Router;

	private _oRoutingService!: RoutingService;

	private _oRouterProxy!: RouterProxy;

	private _fnRouteMatchedBound!: Function;

	protected _oTargetInformation: any;

	@methodOverride()
	onExit() {
		if (this._oRoutingService) {
			this._oRoutingService.detachRouteMatched(this._fnRouteMatchedBound);
		}
	}

	@methodOverride()
	onInit() {
		this._oView = this.base.getView();
		this._oAppComponent = CommonUtils.getAppComponent(this._oView);
		this._oPageComponent = Component.getOwnerComponentFor(this._oView) as EnhanceWithUI5<TemplateComponent>;
		this._oRouter = this._oAppComponent.getRouter();
		this._oRouterProxy = (this._oAppComponent as any).getRouterProxy();

		if (!this._oAppComponent || !this._oPageComponent) {
			throw new Error("Failed to initialize controler extension 'sap.fe.core.controllerextesions.InternalRouting");
		}

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (this._oAppComponent === this._oPageComponent) {
			// The view isn't hosted in a dedicated UIComponent, but directly in the app
			// --> just keep the view
			this._oPageComponent = null;
		}

		this._oAppComponent
			.getService("routingService")
			.then((oRoutingService: RoutingService) => {
				this._oRoutingService = oRoutingService;
				this._fnRouteMatchedBound = this._onRouteMatched.bind(this);
				this._oRoutingService.attachRouteMatched(this._fnRouteMatchedBound);
				this._oTargetInformation = oRoutingService.getTargetInformationFor(this._oPageComponent || this._oView);
			})
			.catch(function () {
				throw new Error("This controller extension cannot work without a 'routingService' on the main AppComponent");
			});
	}

	/**
	 * Triggered every time this controller is a navigation target.
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	onRouteMatched() {
		/**/
	}

	@publicExtension()
	@extensible(OverrideExecution.After)
	onRouteMatchedFinished() {
		/**/
	}

	@publicExtension()
	@extensible(OverrideExecution.After)
	onBeforeBinding(oBindingContext: any, mParameters?: any) {
		const oRouting = (this.base.getView().getController() as any).routing;
		if (oRouting && oRouting.onBeforeBinding) {
			oRouting.onBeforeBinding(oBindingContext, mParameters);
		}
	}

	@publicExtension()
	@extensible(OverrideExecution.After)
	onAfterBinding(oBindingContext: any, mParameters?: any) {
		(this._oAppComponent as any).getRootViewController().onContextBoundToView(oBindingContext);
		const oRouting = (this.base.getView().getController() as any).routing;
		if (oRouting && oRouting.onAfterBinding) {
			oRouting.onAfterBinding(oBindingContext, mParameters);
		}
	}

	///////////////////////////////////////////////////////////
	// Methods triggering a navigation after a user action
	// (e.g. click on a table row, button, etc...)
	///////////////////////////////////////////////////////////

	/**
	 * Navigates to the specified navigation target.
	 *
	 * @param oContext Context instance
	 * @param sNavigationTargetName Name of the navigation target
	 * @param bPreserveHistory True to force the new URL to be added at the end of the browser history (no replace)
	 * @ui5-restricted
	 */
	@publicExtension()
	navigateToTarget(oContext: any, sNavigationTargetName: string, bPreserveHistory?: boolean) {
		const oNavigationConfiguration =
			this._oPageComponent &&
			this._oPageComponent.getNavigationConfiguration &&
			this._oPageComponent.getNavigationConfiguration(sNavigationTargetName);
		if (oNavigationConfiguration) {
			const oDetailRoute = oNavigationConfiguration.detail;
			const sRouteName = oDetailRoute.route;
			const mParameterMapping = oDetailRoute.parameters;
			this._oRoutingService.navigateTo(oContext, sRouteName, mParameterMapping, bPreserveHistory);
		} else {
			this._oRoutingService.navigateTo(oContext, null, null, bPreserveHistory);
		}
		this._oView.getViewData();
	}

	/**
	 * Navigates to the specified navigation target route.
	 *
	 * @param sTargetRouteName Name of the target route
	 * @param [oParameters] Parameters to be used with route to create the target hash
	 * @returns Promise that is resolved when the navigation is finalized
	 * @ui5-restricted
	 */
	@publicExtension()
	navigateToRoute(sTargetRouteName: string, oParameters?: object) {
		return this._oRoutingService.navigateToRoute(sTargetRouteName, oParameters);
	}

	/**
	 * Navigates to a specific context.
	 *
	 * @param oContext The context to be navigated to
	 * @param [mParameters] Optional navigation parameters
	 * @returns Promise resolved when the navigation has been triggered
	 * @ui5-restricted
	 */
	@publicExtension()
	@finalExtension()
	navigateToContext(oContext: any, mParameters?: any): Promise<boolean> {
		const oContextInfo: any = {};
		mParameters = mParameters || {};

		if (oContext.isA("sap.ui.model.odata.v4.ODataListBinding")) {
			if (mParameters.asyncContext) {
				// the context is either created async (Promise)
				// We need to activate the routeMatchSynchro on the RouterProxy to avoid that
				// the subsequent call to navigateToContext conflicts with the current one
				this._oRouterProxy.activateRouteMatchSynchronization();

				mParameters.asyncContext
					.then((asyncContext: any) => {
						// once the context is returned we navigate into it
						this.navigateToContext(asyncContext, {
							checkNoHashChange: mParameters.checkNoHashChange,
							editable: mParameters.editable,
							bPersistOPScroll: mParameters.bPersistOPScroll,
							updateFCLLevel: mParameters.updateFCLLevel,
							bForceFocus: mParameters.bForceFocus
						});
					})
					.catch(function (oError: any) {
						Log.error("Error with the async context", oError);
					});
			} else if (!mParameters.bDeferredContext) {
				// Navigate to a list binding not yet supported
				throw "navigation to a list binding is not yet supported";
			}
		}

		if (mParameters.callExtension) {
			const oInternalModel = this._oView.getModel("internal") as JSONModel;
			oInternalModel.setProperty("/paginatorCurrentContext", null);

			oContextInfo.sourceBindingContext = oContext.getObject();
			oContextInfo.bindingContext = oContext;
			if (mParameters.oEvent) {
				oContextInfo.oEvent = mParameters.oEvent;
			}
			// Storing the selected context to use it in internal route navigation if neccessary.
			const bOverrideNav = (this.base.getView().getController() as any).routing.onBeforeNavigation(oContextInfo);
			if (bOverrideNav) {
				oInternalModel.setProperty("/paginatorCurrentContext", oContext);
				return Promise.resolve(true);
			}
		}
		mParameters.FCLLevel = this._getFCLLevel();

		return this._oRoutingService.navigateToContext(oContext, mParameters, this._oView.getViewData(), this._oTargetInformation);
	}

	/**
	 * Navigates backwards from a context.
	 *
	 * @param oContext Context to be navigated from
	 * @param [mParameters] Optional navigation parameters
	 * @returns Promise resolved when the navigation has been triggered
	 * @ui5-restricted
	 */
	@publicExtension()
	@finalExtension()
	navigateBackFromContext(oContext: any, mParameters?: any) {
		mParameters = mParameters || {};
		mParameters.updateFCLLevel = -1;

		return this.navigateToContext(oContext, mParameters);
	}

	/**
	 * Navigates forwards to a context.
	 *
	 * @param oContext Context to be navigated to
	 * @param mParameters Optional navigation parameters
	 * @returns Promise resolved when the navigation has been triggered
	 * @ui5-restricted
	 */
	@publicExtension()
	@finalExtension()
	navigateForwardToContext(oContext: any, mParameters?: any): Promise<boolean> {
		if (this._oView.getBindingContext("internal")?.getProperty("messageFooterContainsErrors") === true) {
			return Promise.resolve(true);
		}
		mParameters = mParameters || {};
		mParameters.updateFCLLevel = 1;

		return this.navigateToContext(oContext, mParameters);
	}

	/**
	 * Navigates back in history if the current hash corresponds to a transient state.
	 */
	@publicExtension()
	@finalExtension()
	navigateBackFromTransientState() {
		const sHash = this._oRouterProxy.getHash();

		// if triggered while navigating to (...), we need to navigate back
		if (sHash.indexOf("(...)") !== -1) {
			this._oRouterProxy.navBack();
		}
	}

	@publicExtension()
	@finalExtension()
	navigateToMessagePage(sErrorMessage: any, mParameters: any) {
		mParameters = mParameters || {};
		if (
			this._oRouterProxy.getHash().indexOf("i-action=create") > -1 ||
			this._oRouterProxy.getHash().indexOf("i-action=autoCreate") > -1
		) {
			return this._oRouterProxy.navToHash(this._oRoutingService.getDefaultCreateHash());
		} else {
			mParameters.FCLLevel = this._getFCLLevel();

			return (this._oAppComponent as any).getRootViewController().displayErrorPage(sErrorMessage, mParameters);
		}
	}

	/**
	 * Checks if one of the current views on the screen is bound to a given context.
	 *
	 * @param oContext
	 * @returns `true` if the state is impacted by the context
	 * @ui5-restricted
	 */
	@publicExtension()
	@finalExtension()
	isCurrentStateImpactedBy(oContext: any) {
		return this._oRoutingService.isCurrentStateImpactedBy(oContext);
	}

	_isViewPartOfRoute(routeInformation: any): boolean {
		const aTargets = routeInformation?.targets;
		if (!aTargets || aTargets.indexOf(this._oTargetInformation.targetName) === -1) {
			// If the target for this view has a view level greater than the route level, it means this view comes "after" the route
			// in terms of navigation.
			// In such case, we remove its binding context, to avoid this view to have data if we navigate to it later on
			if ((this._oTargetInformation.viewLevel ?? 0) >= (routeInformation?.routeLevel ?? 0)) {
				this._setBindingContext(null); // This also call setKeepAlive(false) on the current context
			}
			return false;
		}

		return true;
	}

	_buildBindingPath(routeArguments: any, bindingPattern: string, navigationParameters: any): { path: string; deferred: boolean } {
		let path = bindingPattern.replace(":?query:", "");
		let deferred = false;

		for (const sKey in routeArguments) {
			const sValue = routeArguments[sKey];
			if (sValue === "..." && bindingPattern.indexOf(`{${sKey}}`) >= 0) {
				deferred = true;
				// Sometimes in preferredMode = create, the edit button is shown in background when the
				// action parameter dialog shows up, setting bTargetEditable passes editable as true
				// to onBeforeBinding in _bindTargetPage function
				navigationParameters.bTargetEditable = true;
			}
			path = path.replace(`{${sKey}}`, sValue);
		}
		if (routeArguments["?query"] && routeArguments["?query"].hasOwnProperty("i-action")) {
			navigationParameters.bActionCreate = true;
		}

		// the binding path is always absolute
		if (path && path[0] !== "/") {
			path = `/${path}`;
		}

		return { path, deferred };
	}

	///////////////////////////////////////////////////////////
	// Methods to bind the page when a route is matched
	///////////////////////////////////////////////////////////

	/**
	 * Called when a route is matched.
	 * Builds the binding context from the navigation parameters, and bind the page accordingly.
	 *
	 * @param oEvent
	 * @ui5-restricted
	 */
	_onRouteMatched(oEvent: Event) {
		// Check if the target for this view is part of the event targets (i.e. is a target for the current route).
		// If not, we don't need to bind it --> return
		if (!this._isViewPartOfRoute(oEvent.getParameter("routeInformation"))) {
			return;
		}

		// Retrieve the binding context pattern
		let bindingPattern;
		if (this._oPageComponent && this._oPageComponent.getBindingContextPattern) {
			bindingPattern = this._oPageComponent.getBindingContextPattern();
		}
		bindingPattern = bindingPattern || this._oTargetInformation.contextPattern;

		if (bindingPattern === null || bindingPattern === undefined) {
			// Don't do this if we already got sTarget == '', which is a valid target pattern
			bindingPattern = oEvent.getParameter("routePattern");
		}

		// Replace the parameters by their values in the binding context pattern
		const mArguments = (oEvent.getParameters() as any).arguments;
		const oNavigationParameters = oEvent.getParameter("navigationInfo");
		const { path, deferred } = this._buildBindingPath(mArguments, bindingPattern, oNavigationParameters);

		this.onRouteMatched();

		const oModel = this._oView.getModel() as ODataModel;
		let oOut;
		if (deferred) {
			oOut = this._bindDeferred(path, oNavigationParameters);
		} else {
			oOut = this._bindPage(path, oModel, oNavigationParameters);
		}
		// eslint-disable-next-line promise/catch-or-return
		oOut.finally(() => {
			this.onRouteMatchedFinished();
		});

		(this._oAppComponent as any).getRootViewController().updateUIStateForView(this._oView, this._getFCLLevel());
	}

	/**
	 * Deferred binding (during object creation).
	 *
	 * @param sTargetPath The path to the deffered context
	 * @param oNavigationParameters Navigation parameters
	 * @returns A Promise
	 * @ui5-restricted
	 */
	_bindDeferred(sTargetPath: string, oNavigationParameters: any) {
		this.onBeforeBinding(null, { editable: oNavigationParameters.bTargetEditable });

		if (oNavigationParameters.bDeferredContext || !oNavigationParameters.oAsyncContext) {
			// either the context shall be created in the target page (deferred Context) or it shall
			// be created async but the user refreshed the page / bookmarked this URL
			// TODO: currently the target component creates this document but we shall move this to
			// a central place
			if (this._oPageComponent && this._oPageComponent.createDeferredContext) {
				this._oPageComponent.createDeferredContext(
					sTargetPath,
					oNavigationParameters.useContext,
					oNavigationParameters.bActionCreate
				);
			}
		}

		const currentBindingContext = this._getBindingContext();
		if (currentBindingContext?.hasPendingChanges()) {
			// For now remove the pending changes to avoid the model raises errors and the object page is at least bound
			// Ideally the user should be asked for
			currentBindingContext.getBinding().resetChanges();
		}

		// remove the context to avoid showing old data
		this._setBindingContext(null);

		this.onAfterBinding(null);
		return Promise.resolve();
	}

	/**
	 * Sets the binding context of the page from a path.
	 *
	 * @param sTargetPath The path to the context
	 * @param oModel The OData model
	 * @param oNavigationParameters Navigation parameters
	 * @returns A Promise resolved once the binding has been set on the page
	 * @ui5-restricted
	 */
	_bindPage(sTargetPath: string, oModel: ODataModel, oNavigationParameters: object) {
		if (sTargetPath === "") {
			return Promise.resolve(this._bindPageToContext(null, oModel, oNavigationParameters));
		} else {
			return this._resolveSemanticPath(sTargetPath, oModel)
				.then((sTechnicalPath: any) => {
					this._bindPageToPath(sTechnicalPath, oModel, oNavigationParameters);
				})
				.catch((oError: any) => {
					// Error handling for erroneous metadata request
					const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");

					this.navigateToMessagePage(oResourceBundle.getText("C_COMMON_SAPFE_DATA_RECEIVED_ERROR"), {
						title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
						description: oError.message
					});
				});
		}
	}

	/**
	 * Creates the filter to retrieve a context corresponding to a semantic path.
	 *
	 * @param sSemanticPath The semantic path
	 * @param aSemanticKeys The semantic keys for the path
	 * @param oMetaModel The instance of the meta model
	 * @returns The filter
	 * @ui5-restricted
	 */
	_createFilterFromSemanticPath(sSemanticPath: string, aSemanticKeys: any[], oMetaModel: object) {
		const fnUnquoteAndDecode = function (sValue: any) {
			if (sValue.indexOf("'") === 0 && sValue.lastIndexOf("'") === sValue.length - 1) {
				// Remove the quotes from the value and decode special chars
				sValue = decodeURIComponent(sValue.substring(1, sValue.length - 1));
			}
			return sValue;
		};
		const aKeyValues = sSemanticPath.substring(sSemanticPath.indexOf("(") + 1, sSemanticPath.length - 1).split(",");
		let aFilters: Filter[];

		if (aSemanticKeys.length != aKeyValues.length) {
			return null;
		}

		const bFilteringCaseSensitive = ModelHelper.isFilteringCaseSensitive(oMetaModel);

		if (aSemanticKeys.length === 1) {
			// Take the first key value
			const sKeyValue = fnUnquoteAndDecode(aKeyValues[0]);
			aFilters = [
				new Filter({
					path: aSemanticKeys[0].$PropertyPath,
					operator: FilterOperator.EQ,
					value1: sKeyValue,
					caseSensitive: bFilteringCaseSensitive
				})
			];
		} else {
			const mKeyValues: any = {};
			// Create a map of all key values
			aKeyValues.forEach(function (sKeyAssignment: string) {
				const aParts = sKeyAssignment.split("="),
					sKeyValue = fnUnquoteAndDecode(aParts[1]);

				mKeyValues[aParts[0]] = sKeyValue;
			});

			let bFailed = false;
			aFilters = aSemanticKeys.map(function (oSemanticKey: any) {
				const sKey = oSemanticKey.$PropertyPath,
					sValue = mKeyValues[sKey];

				if (sValue !== undefined) {
					return new Filter({
						path: sKey,
						operator: FilterOperator.EQ,
						value1: sValue,
						caseSensitive: bFilteringCaseSensitive
					});
				} else {
					bFailed = true;
					return new Filter({
						path: "XX"
					}); // will be ignore anyway since we return after
				}
			});

			if (bFailed) {
				return null;
			}
		}

		// Add a draft filter to make sure we take the draft entity if there is one
		// Or the active entity otherwise
		const oDraftFilter = new Filter({
			filters: [new Filter("IsActiveEntity", "EQ", false), new Filter("SiblingEntity/IsActiveEntity", "EQ", null)],
			and: false
		});
		aFilters.push(oDraftFilter);

		return new Filter(aFilters, true);
	}

	/**
	 * Converts a path with semantic keys to a path with technical keys.
	 *
	 * @param sSemanticPath The path with semantic keys
	 * @param oModel The model for the path
	 * @param aSemanticKeys The semantic keys for the path
	 * @returns A Promise containing the path with technical keys if sSemanticPath could be interpreted as a semantic path, null otherwise
	 * @ui5-restricted
	 */
	_getTechnicalPathFromSemanticPath(sSemanticPath: string, oModel: any, aSemanticKeys: any[]) {
		const oMetaModel = oModel.getMetaModel();
		let sEntitySetPath = oMetaModel.getMetaContext(sSemanticPath).getPath();

		if (!aSemanticKeys || aSemanticKeys.length === 0) {
			// No semantic keys
			return Promise.resolve(null);
		}

		// Create a set of filters corresponding to all keys
		const oFilter = this._createFilterFromSemanticPath(sSemanticPath, aSemanticKeys, oMetaModel);
		if (oFilter === null) {
			// Couldn't interpret the path as a semantic one
			return Promise.resolve(null);
		}

		// Load the corresponding object
		if (!sEntitySetPath?.startsWith("/")) {
			sEntitySetPath = `/${sEntitySetPath}`;
		}
		const oListBinding = oModel.bindList(sEntitySetPath, undefined, undefined, oFilter, {
			$$groupId: "$auto.Heroes"
		});

		return oListBinding.requestContexts(0, 2).then(function (oContexts: any) {
			if (oContexts && oContexts.length) {
				return oContexts[0].getPath();
			} else {
				// No data could be loaded
				return null;
			}
		});
	}

	/**
	 * Checks if a path is eligible for semantic bookmarking.
	 *
	 * @param sPath The path to test
	 * @param oMetaModel The associated metadata model
	 * @returns `true` if the path is eligible
	 * @ui5-restricted
	 */
	_checkPathForSemanticBookmarking(sPath: string, oMetaModel: any) {
		// Only path on root objects allow semantic bookmarking, i.e. sPath = xxx(yyy)
		const aMatches = /^[/]?(\w+)\([^/]+\)$/.exec(sPath);
		if (!aMatches) {
			return false;
		}
		// Get the entitySet name
		const sEntitySetPath = `/${aMatches[1]}`;
		// Check the entity set supports draft (otherwise we don't support semantic bookmarking)
		const oDraftRoot = oMetaModel.getObject(`${sEntitySetPath}@com.sap.vocabularies.Common.v1.DraftRoot`);
		const oDraftNode = oMetaModel.getObject(`${sEntitySetPath}@com.sap.vocabularies.Common.v1.DraftNode`);
		return oDraftRoot || oDraftNode ? true : false;
	}

	/**
	 * Builds a path with semantic keys from a path with technical keys.
	 *
	 * @param sPathToResolve The path to be transformed
	 * @param oModel The OData model
	 * @returns String promise for the new path. If sPathToResolved couldn't be interpreted as a semantic path, it is returned as is.
	 * @ui5-restricted
	 */
	_resolveSemanticPath(sPathToResolve: string, oModel: any): Promise<string> {
		const oMetaModel = oModel.getMetaModel();
		const oLastSemanticMapping = this._oRoutingService.getLastSemanticMapping();
		let sCurrentHashNoParams = this._oRouter.getHashChanger().getHash().split("?")[0];

		if (sCurrentHashNoParams && sCurrentHashNoParams.lastIndexOf("/") === sCurrentHashNoParams.length - 1) {
			// Remove trailing '/'
			sCurrentHashNoParams = sCurrentHashNoParams.substring(0, sCurrentHashNoParams.length - 1);
		}

		let sRootEntityName = sCurrentHashNoParams && sCurrentHashNoParams.substr(0, sCurrentHashNoParams.indexOf("("));
		if (sRootEntityName.indexOf("/") === 0) {
			sRootEntityName = sRootEntityName.substring(1);
		}
		const bAllowSemanticBookmark = this._checkPathForSemanticBookmarking(sCurrentHashNoParams, oMetaModel),
			aSemanticKeys = bAllowSemanticBookmark && SemanticKeyHelper.getSemanticKeys(oMetaModel, sRootEntityName);
		if (!aSemanticKeys) {
			// No semantic keys available --> use the path as is
			return Promise.resolve(sPathToResolve);
		} else if (oLastSemanticMapping && oLastSemanticMapping.semanticPath === sPathToResolve) {
			// This semantic path has been resolved previously
			return Promise.resolve(oLastSemanticMapping.technicalPath);
		} else {
			// We need resolve the semantic path to get the technical keys
			return this._getTechnicalPathFromSemanticPath(sCurrentHashNoParams, oModel, aSemanticKeys).then((sTechnicalPath: any) => {
				if (sTechnicalPath && sTechnicalPath !== sPathToResolve) {
					// The semantic path was resolved (otherwise keep the original value for target)
					this._oRoutingService.setLastSemanticMapping({
						technicalPath: sTechnicalPath,
						semanticPath: sPathToResolve
					});
					return sTechnicalPath;
				} else {
					return sPathToResolve;
				}
			});
		}
	}

	/**
	 * Sets the binding context of the page from a path.
	 *
	 * @param sTargetPath The path to build the context. Needs to contain technical keys only.
	 * @param oModel The OData model
	 * @param oNavigationParameters Navigation parameters
	 * @ui5-restricted
	 */
	_bindPageToPath(sTargetPath: string, oModel: any, oNavigationParameters: any) {
		const oCurrentContext = this._getBindingContext(),
			sCurrentPath = oCurrentContext && oCurrentContext.getPath(),
			oUseContext = oNavigationParameters.useContext as Context | undefined | null;

		// We set the binding context only if it's different from the current one
		// or if we have a context already selected
		if (oUseContext && oUseContext.getPath() === sTargetPath) {
			if (oUseContext !== oCurrentContext) {
				// We already have the context to be used, and it's not the current one
				const oRootViewController = this._oAppComponent.getRootViewController();

				// In case of FCL, if we're reusing a context from a table (through navigation), we refresh it to avoid outdated data
				// We don't wait for the refresh to be completed (requestRefresh), so that the corresponding query goes into the same
				// batch as the ones from controls in the page.
				if (oRootViewController.isFclEnabled() && oNavigationParameters.reason === NavigationReason.RowPress) {
					const metaModel = oUseContext.getModel().getMetaModel();
					if (!oUseContext.getBinding().hasPendingChanges()) {
						oUseContext.refresh();
					} else if (
						isConnected(this.getView()) ||
						(ModelHelper.isDraftSupported(metaModel, oUseContext.getPath()) &&
							ModelHelper.isCollaborationDraftSupported(metaModel))
					) {
						// If there are pending changes but we're in collaboration draft, we force the refresh (discarding pending changes) as we need to have the latest version.
						// When navigating from LR to OP, the view is not connected yet --> check if we're in draft with collaboration from the metamodel
						oUseContext.getBinding().resetChanges();
						oUseContext.refresh();
					}
				}
				this._bindPageToContext(oUseContext, oModel, oNavigationParameters);
			}
		} else if (sCurrentPath !== sTargetPath) {
			// We need to create a new context for its path
			this._bindPageToContext(this._createContext(sTargetPath, oModel), oModel, oNavigationParameters);
		} else if (oNavigationParameters.reason !== NavigationReason.AppStateChanged && EditState.isEditStateDirty()) {
			this._refreshBindingContext(oCurrentContext);
		}
	}

	/**
	 * Binds the page to a context.
	 *
	 * @param oContext Context to be bound
	 * @param oModel The OData model
	 * @param oNavigationParameters Navigation parameters
	 * @ui5-restricted
	 */
	_bindPageToContext(oContext: Context | null, oModel: ODataModel, oNavigationParameters: any) {
		if (!oContext) {
			this.onBeforeBinding(null);
			this.onAfterBinding(null);
			return;
		}

		const oParentListBinding = oContext.getBinding();
		const oRootViewController = (this._oAppComponent as any).getRootViewController();
		if (oRootViewController.isFclEnabled()) {
			if (!oParentListBinding || !oParentListBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
				// if the parentBinding is not a listBinding, we create a new context
				oContext = this._createContext(oContext.getPath(), oModel);
			}

			try {
				this._setKeepAlive(
					oContext,
					true,
					() => {
						if (oRootViewController.isContextUsedInPages(oContext)) {
							this.navigateBackFromContext(oContext);
						}
					},
					true // Load messages, otherwise they don't get refreshed later, e.g. for side effects
				);
			} catch (oError) {
				// setKeepAlive throws an exception if the parent listbinding doesn't have $$ownRequest=true
				// This case for custom fragments is supported, but an error is logged to make the lack of synchronization apparent
				Log.error(
					`View for ${oContext.getPath()} won't be synchronized. Parent listBinding must have binding parameter $$ownRequest=true`
				);
			}
		} else if (!oParentListBinding || oParentListBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
			// We need to recreate the context otherwise we get errors
			oContext = this._createContext(oContext.getPath(), oModel);
		}

		// Set the binding context with the proper before/after callbacks
		this.onBeforeBinding(oContext, {
			editable: oNavigationParameters.bTargetEditable,
			listBinding: oParentListBinding,
			bPersistOPScroll: oNavigationParameters.bPersistOPScroll,
			bDraftNavigation: oNavigationParameters.bDraftNavigation,
			showPlaceholder: oNavigationParameters.bShowPlaceholder
		});

		this._setBindingContext(oContext);
		this.onAfterBinding(oContext);
	}

	/**
	 * Creates a context from a path.
	 *
	 * @param sPath The path
	 * @param oModel The OData model
	 * @returns The created context
	 * @ui5-restricted
	 */
	_createContext(sPath: string, oModel: ODataModel) {
		const oPageComponent = this._oPageComponent,
			sEntitySet = oPageComponent && oPageComponent.getEntitySet && oPageComponent.getEntitySet(),
			sContextPath =
				(oPageComponent && oPageComponent.getContextPath && oPageComponent.getContextPath()) || (sEntitySet && `/${sEntitySet}`),
			oMetaModel = oModel.getMetaModel(),
			mParameters: any = {
				$$groupId: "$auto.Heroes",
				$$updateGroupId: "$auto",
				$$patchWithoutSideEffects: true
			};
		// In case of draft: $select the state flags (HasActiveEntity, HasDraftEntity, and IsActiveEntity)
		const oDraftRoot = oMetaModel.getObject(`${sContextPath}@com.sap.vocabularies.Common.v1.DraftRoot`);
		const oDraftNode = oMetaModel.getObject(`${sContextPath}@com.sap.vocabularies.Common.v1.DraftNode`);
		const oRootViewController = (this._oAppComponent as any).getRootViewController();
		if (oRootViewController.isFclEnabled()) {
			const oContext = this._getKeepAliveContext(oModel, sPath, false, mParameters);
			if (!oContext) {
				throw new Error(`Cannot create keepAlive context ${sPath}`);
			} else if (oDraftRoot || oDraftNode) {
				if (oContext.getProperty("IsActiveEntity") === undefined) {
					oContext.requestProperty(["HasActiveEntity", "HasDraftEntity", "IsActiveEntity"]);
					if (oDraftRoot) {
						oContext.requestObject("DraftAdministrativeData");
					}
				} else {
					// when switching between draft and edit we need to ensure those properties are requested again even if they are in the binding's cache
					// otherwise when you edit and go to the saved version you have no way of switching back to the edit version
					oContext.requestSideEffects(
						oDraftRoot
							? ["HasActiveEntity", "HasDraftEntity", "IsActiveEntity", "DraftAdministrativeData"]
							: ["HasActiveEntity", "HasDraftEntity", "IsActiveEntity"]
					);
				}
			}

			return oContext;
		} else {
			if (sEntitySet) {
				const sMessagesPath = oMetaModel.getObject(`${sContextPath}/@com.sap.vocabularies.Common.v1.Messages/$Path`);
				if (sMessagesPath) {
					mParameters.$select = sMessagesPath;
				}
			}

			// In case of draft: $select the state flags (HasActiveEntity, HasDraftEntity, and IsActiveEntity)
			if (oDraftRoot || oDraftNode) {
				if (mParameters.$select === undefined) {
					mParameters.$select = "HasActiveEntity,HasDraftEntity,IsActiveEntity";
				} else {
					mParameters.$select += ",HasActiveEntity,HasDraftEntity,IsActiveEntity";
				}
			}
			if (this._oView.getBindingContext()) {
				const oPreviousBinding = (this._oView.getBindingContext() as any)?.getBinding();
				oPreviousBinding
					?.resetChanges()
					.then(() => {
						oPreviousBinding.destroy();
					})
					.catch((oError: any) => {
						Log.error("Error while reseting the changes to the binding", oError);
					});
			}

			const oHiddenBinding = oModel.bindContext(sPath, undefined, mParameters);

			oHiddenBinding.attachEventOnce("dataRequested", () => {
				BusyLocker.lock(this._oView);
			});
			oHiddenBinding.attachEventOnce("dataReceived", this.onDataReceived.bind(this));
			return oHiddenBinding.getBoundContext();
		}
	}

	@publicExtension()
	async onDataReceived(oEvent: Event) {
		const sErrorDescription = oEvent && oEvent.getParameter("error");
		if (BusyLocker.isLocked(this._oView)) {
			BusyLocker.unlock(this._oView);
		}

		if (sErrorDescription) {
			// TODO: in case of 404 the text shall be different
			try {
				const oResourceBundle = await Core.getLibraryResourceBundle("sap.fe.core", true);
				const messageHandler = this.base.messageHandler;
				let mParams = {};
				if (sErrorDescription.status === 503) {
					mParams = {
						isInitialLoad503Error: true,
						shellBack: true
					};
				} else if (sErrorDescription.status === 400) {
					mParams = {
						title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
						description: oResourceBundle.getText("C_COMMON_SAPFE_DATA_RECEIVED_ERROR_DESCRIPTION"),
						isDataReceivedError: true,
						shellBack: true
					};
				} else {
					mParams = {
						title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
						description: sErrorDescription,
						isDataReceivedError: true,
						shellBack: true
					};
				}
				await messageHandler.showMessages(mParams);
			} catch (oError: any) {
				Log.error("Error while getting the core resource bundle", oError);
			}
		}
	}

	/**
	 * Requests side effects on a binding context to "refresh" it.
	 * TODO: get rid of this once provided by the model
	 * a refresh on the binding context does not work in case a creation row with a transient context is
	 * used. also a requestSideEffects with an empty path would fail due to the transient context
	 * therefore we get all dependent bindings (via private model method) to determine all paths and then
	 * request them.
	 *
	 * @param oBindingContext Context to be refreshed
	 * @ui5-restricted
	 */
	_refreshBindingContext(oBindingContext: any) {
		const oPageComponent = this._oPageComponent;
		const oSideEffectsService = this._oAppComponent.getSideEffectsService();
		const sRootContextPath = oBindingContext.getPath();
		const sEntitySet = oPageComponent && oPageComponent.getEntitySet && oPageComponent.getEntitySet();
		const sContextPath =
			(oPageComponent && oPageComponent.getContextPath && oPageComponent.getContextPath()) || (sEntitySet && `/${sEntitySet}`);
		const oMetaModel = this._oView.getModel().getMetaModel() as ODataMetaModel;
		let sMessagesPath;
		const aNavigationPropertyPaths: any[] = [];
		const aPropertyPaths: any[] = [];
		const oSideEffects: SideEffectsTargetType = {
			targetProperties: [],
			targetEntities: []
		};

		function getBindingPaths(oBinding: any) {
			let aDependentBindings;
			const sRelativePath = ((oBinding.getContext() && oBinding.getContext().getPath()) || "").replace(sRootContextPath, ""); // If no context, this is an absolute binding so no relative path
			const sPath = (sRelativePath ? `${sRelativePath.slice(1)}/` : sRelativePath) + oBinding.getPath();

			if (oBinding.isA("sap.ui.model.odata.v4.ODataContextBinding")) {
				// if (sPath === "") {
				// now get the dependent bindings
				aDependentBindings = oBinding.getDependentBindings();
				if (aDependentBindings) {
					// ask the dependent bindings (and only those with the specified groupId
					//if (aDependentBindings.length > 0) {
					for (let i = 0; i < aDependentBindings.length; i++) {
						getBindingPaths(aDependentBindings[i]);
					}
				} else if (aNavigationPropertyPaths.indexOf(sPath) === -1) {
					aNavigationPropertyPaths.push(sPath);
				}
			} else if (oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
				if (aNavigationPropertyPaths.indexOf(sPath) === -1) {
					aNavigationPropertyPaths.push(sPath);
				}
			} else if (oBinding.isA("sap.ui.model.odata.v4.ODataPropertyBinding")) {
				if (aPropertyPaths.indexOf(sPath) === -1) {
					aPropertyPaths.push(sPath);
				}
			}
		}

		if (sContextPath) {
			sMessagesPath = oMetaModel.getObject(`${sContextPath}/@com.sap.vocabularies.Common.v1.Messages/$Path`);
		}

		// binding of the context must have $$PatchWithoutSideEffects true, this bound context may be needed to be fetched from the dependent binding
		getBindingPaths(oBindingContext.getBinding());

		let i;
		for (i = 0; i < aNavigationPropertyPaths.length; i++) {
			oSideEffects.targetEntities.push({
				$NavigationPropertyPath: aNavigationPropertyPaths[i]
			});
		}
		oSideEffects.targetProperties = aPropertyPaths;
		if (sMessagesPath) {
			oSideEffects.targetProperties.push(sMessagesPath);
		}
		//all this logic to be replaced with a SideEffects request for an empty path (refresh everything), after testing transient contexts
		oSideEffects.targetProperties = oSideEffects.targetProperties.reduce((targets: string[], targetProperty) => {
			if (targetProperty) {
				const index = targetProperty.indexOf("/");
				targets.push(index > 0 ? targetProperty.slice(0, index) : targetProperty);
			}
			return targets;
		}, []);
		// OData model will take care of duplicates
		oSideEffectsService.requestSideEffects([...oSideEffects.targetEntities, ...oSideEffects.targetProperties], oBindingContext);
	}

	/**
	 * Gets the binding context of the page or the component.
	 *
	 * @returns The binding context
	 * @ui5-restricted
	 */
	_getBindingContext(): Context | null | undefined {
		if (this._oPageComponent) {
			return this._oPageComponent.getBindingContext() as Context;
		} else {
			return this._oView.getBindingContext() as Context;
		}
	}

	/**
	 * Sets the binding context of the page or the component.
	 *
	 * @param oContext The binding context
	 * @ui5-restricted
	 */
	_setBindingContext(oContext: any) {
		let oPreviousContext, oTargetControl;
		if (this._oPageComponent) {
			oPreviousContext = this._oPageComponent.getBindingContext() as Context;
			oTargetControl = this._oPageComponent;
		} else {
			oPreviousContext = this._oView.getBindingContext() as Context;
			oTargetControl = this._oView;
		}

		oTargetControl.setBindingContext(oContext);

		if (oPreviousContext?.isKeepAlive() && oPreviousContext !== oContext) {
			this._setKeepAlive(oPreviousContext, false);
		}
	}

	/**
	 * Gets the flexible column layout (FCL) level corresponding to the view (-1 if the app is not FCL).
	 *
	 * @returns The level
	 * @ui5-restricted
	 */
	_getFCLLevel() {
		return this._oTargetInformation.FCLLevel;
	}

	_setKeepAlive(oContext: Context, bKeepAlive: boolean, fnBeforeDestroy?: Function, bRequestMessages?: boolean) {
		if (oContext.getPath().endsWith(")")) {
			// We keep the context alive only if they're part of a collection, i.e. if the path ends with a ')'
			const oMetaModel = oContext.getModel().getMetaModel();
			const sMetaPath = oMetaModel.getMetaPath(oContext.getPath());
			const sMessagesPath = oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.Common.v1.Messages/$Path`);
			oContext.setKeepAlive(bKeepAlive, fnBeforeDestroy, !!sMessagesPath && bRequestMessages);
		}
	}

	_getKeepAliveContext(oModel: ODataModel, path: string, bRequestMessages?: boolean, parameters?: any): Context | undefined {
		// Get the path for the context that is really kept alive (part of a collection)
		// i.e. remove all segments not ending with a ')'
		const keptAliveSegments = path.split("/");
		const additionnalSegments: string[] = [];
		while (keptAliveSegments.length && !keptAliveSegments[keptAliveSegments.length - 1].endsWith(")")) {
			additionnalSegments.push(keptAliveSegments.pop()!);
		}

		if (keptAliveSegments.length === 0) {
			return undefined;
		}

		const keptAlivePath = keptAliveSegments.join("/");
		const oKeepAliveContext = oModel.getKeepAliveContext(keptAlivePath, bRequestMessages, parameters);

		if (additionnalSegments.length === 0) {
			return oKeepAliveContext;
		} else {
			additionnalSegments.reverse();
			const additionnalPath = additionnalSegments.join("/");
			return oModel.bindContext(additionnalPath, oKeepAliveContext).getBoundContext();
		}
	}

	/**
	 * Switches between column and full-screen mode when FCL is used.
	 *
	 * @ui5-restricted
	 */

	@publicExtension()
	@finalExtension()
	switchFullScreen() {
		const oSource = this.base.getView();
		const oFCLHelperModel = oSource.getModel("fclhelper"),
			bIsFullScreen = oFCLHelperModel.getProperty("/actionButtonsInfo/isFullScreen"),
			sNextLayout = oFCLHelperModel.getProperty(
				bIsFullScreen ? "/actionButtonsInfo/exitFullScreen" : "/actionButtonsInfo/fullScreen"
			),
			oRootViewController = (this._oAppComponent as any).getRootViewController();

		const oContext = oRootViewController.getRightmostContext ? oRootViewController.getRightmostContext() : oSource.getBindingContext();

		this.base._routing.navigateToContext(oContext, { sLayout: sNextLayout }).catch(function () {
			Log.warning("cannot switch between column and fullscreen");
		});
	}

	/**
	 * Closes the column for the current view in a FCL.
	 *
	 * @ui5-restricted
	 */
	@publicExtension()
	@extensible(OverrideExecution.Before)
	closeColumn() {
		const oViewData = this._oView.getViewData() as any;
		const oContext = this._oView.getBindingContext() as Context;
		const oMetaModel = oContext.getModel().getMetaModel();
		const navigationParameters = {
			noPreservationCache: true,
			sLayout: this._oView.getModel("fclhelper").getProperty("/actionButtonsInfo/closeColumn")
		};

		if (oViewData?.viewLevel === 1 && ModelHelper.isDraftSupported(oMetaModel, oContext.getPath())) {
			draft.processDataLossOrDraftDiscardConfirmation(
				() => {
					this.navigateBackFromContext(oContext, navigationParameters);
				},
				Function.prototype,
				oContext,
				this._oView.getController(),
				false,
				draft.NavigationType.BackNavigation
			);
		} else {
			this.navigateBackFromContext(oContext, navigationParameters);
		}
	}
}

export default InternalRouting;
