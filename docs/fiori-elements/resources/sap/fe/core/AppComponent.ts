import Log from "sap/base/Log";
import type FlexibleColumnLayout from "sap/f/FlexibleColumnLayout";
import AppStateHandler from "sap/fe/core/AppStateHandler";
import RouterProxy from "sap/fe/core/controllerextensions/routing/RouterProxy";
import type { ContentDensitiesType } from "sap/fe/core/converters/ManifestSettings";
import { defineUI5Class } from "sap/fe/core/helpers/ClassSupport";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import library from "sap/fe/core/library";
import { changeConfiguration, cleanPageConfigurationChanges } from "sap/fe/core/manifestMerger/ChangePageConfiguration";
import type RootViewBaseController from "sap/fe/core/rootView/RootViewBaseController";
import type { EnvironmentCapabilitiesService } from "sap/fe/core/services/EnvironmentServiceFactory";
import type { NavigationService } from "sap/fe/core/services/NavigationServiceFactory";
import type { RoutingService } from "sap/fe/core/services/RoutingServiceFactory";
import type { IShellServices } from "sap/fe/core/services/ShellServicesFactory";
import type { SideEffectsService } from "sap/fe/core/services/SideEffectsServiceFactory";
import Diagnostics from "sap/fe/core/support/Diagnostics";
import type NavContainer from "sap/m/NavContainer";
import Core from "sap/ui/core/Core";
import type View from "sap/ui/core/mvc/View";
import UIComponent from "sap/ui/core/UIComponent";
import JSONModel from "sap/ui/model/json/JSONModel";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";
import BusyLocker from "./controllerextensions/BusyLocker";
import { deleteModelCacheData } from "./converters/MetaModelConverter";
import SemanticDateOperators from "./helpers/SemanticDateOperators";

const StartupMode = library.StartupMode;

const NAVCONF = {
	FCL: {
		VIEWNAME: "sap.fe.core.rootView.Fcl",
		VIEWNAME_COMPATIBILITY: "sap.fe.templates.RootContainer.view.Fcl",
		ROUTERCLASS: "sap.f.routing.Router"
	},
	NAVCONTAINER: {
		VIEWNAME: "sap.fe.core.rootView.NavContainer",
		VIEWNAME_COMPATIBILITY: "sap.fe.templates.RootContainer.view.NavContainer",
		ROUTERCLASS: "sap.m.routing.Router"
	}
};

export type ManifestContentApp = {
	crossNavigation?: {
		outbounds?: Record<
			string,
			{
				semanticObject: string;
				action: string;
				parameters: string;
			}
		>;
	};
	title?: string;
	subTitle?: string;
	icon?: string;
};

export type ManifestContentUI5 = {
	contentDensities?: ContentDensitiesType;
	pageReadyTimeout?: number;
	rootView?: {
		viewName: string;
	};
	routing?: {
		config?: {
			routerClass: string;
			controlId?: string;
		};
		routes: {
			pattern: string;
			name: string;
			target: string;
		}[];
		targets?: Record<
			string,
			{
				id: string;
				name: string;
				options?: {
					settings?: object;
				};
			}
		>;
	};
	models: Record<
		string,
		{
			type?: string;
			dataSource?: string;
			settings?: object;
		}
	>;
};

export type ManifestContent = {
	"sap.app"?: ManifestContentApp;
	"sap.ui5"?: ManifestContentUI5;
	"sap.fe"?: {
		form?: {
			retrieveTextFromValueList?: boolean;
		};
	};
};
export type ComponentData = {
	startupParameters?: {
		preferredMode?: string[];
	} & Record<string, unknown[]>;
	//feEnvironment is object which is received as a part of the component data for My Inbox applications.
	feEnvironment?: {
		//Within this object they pass a function called getIntent() which returns an object containing the semanticObject and action as separate property-value entries that are then used to update the related apps button.
		getIntent: Function;
		//Within this object they pass a function called getShareControlVisibility() that returns boolean values(true or false) which determines the visibility of the share button.
		getShareControlVisibility: Function;
	};
};

export type StartupParameters = {
	preferredMode?: string[];
} & Record<string, unknown[]>;
/**
 * Main class for components used for an application in SAP Fiori elements.
 *
 * Application developers using the templates and building blocks provided by SAP Fiori elements should create their apps by extending this component.
 * This ensures that all the necessary services that you need for the building blocks and templates to work properly are started.
 *
 * When you use sap.fe.core.AppComponent as the base component, you also need to use a rootView. SAP Fiori elements provides two options: <br/>
 *  - sap.fe.core.rootView.NavContainer when using sap.m.routing.Router <br/>
 *  - sap.fe.core.rootView.Fcl when using sap.f.routing.Router (FCL use case) <br/>
 *
 * @hideconstructor
 * @public
 * @name sap.fe.core.AppComponent
 */
@defineUI5Class("sap.fe.core.AppComponent", {
	interfaces: ["sap.ui.core.IAsyncContentCreation"],
	config: {
		fullWidth: true
	},
	manifest: {
		"sap.ui5": {
			services: {
				resourceModel: {
					factoryName: "sap.fe.core.services.ResourceModelService",
					startup: "waitFor",
					settings: {
						bundles: ["sap.fe.core.messagebundle"],
						modelName: "sap.fe.i18n"
					}
				},
				routingService: {
					factoryName: "sap.fe.core.services.RoutingService",
					startup: "waitFor"
				},
				shellServices: {
					factoryName: "sap.fe.core.services.ShellServices",
					startup: "waitFor"
				},
				ShellUIService: {
					factoryName: "sap.ushell.ui5service.ShellUIService"
				},
				navigationService: {
					factoryName: "sap.fe.core.services.NavigationService",
					startup: "waitFor"
				},
				environmentCapabilities: {
					factoryName: "sap.fe.core.services.EnvironmentService",
					startup: "waitFor"
				},
				sideEffectsService: {
					factoryName: "sap.fe.core.services.SideEffectsService",
					startup: "waitFor"
				},
				asyncComponentService: {
					factoryName: "sap.fe.core.services.AsyncComponentService",
					startup: "waitFor"
				}
			},
			rootView: {
				viewName: NAVCONF.NAVCONTAINER.VIEWNAME,
				type: "XML",
				async: true,
				id: "appRootView"
			},
			routing: {
				config: {
					controlId: "appContent",
					routerClass: NAVCONF.NAVCONTAINER.ROUTERCLASS,
					viewType: "XML",
					controlAggregation: "pages",
					async: true,
					containerOptions: {
						propagateModel: true
					}
				}
			}
		}
	},
	designtime: "sap/fe/core/designtime/AppComponent.designtime",

	library: "sap.fe.core"
})
class AppComponent extends UIComponent {
	static instanceMap: Record<string, AppComponent> = {};

	private _oRouterProxy!: RouterProxy;

	private _oAppStateHandler!: AppStateHandler;

	private bInitializeRouting?: boolean;

	private _oDiagnostics!: Diagnostics;

	private entityContainer!: Promise<void>;

	private startupMode: string = StartupMode.Normal;

	/**
	 * @private
	 * @name sap.fe.core.AppComponent.getMetadata
	 * @function
	 */

	_isFclEnabled() {
		const oManifestUI5 = this.getManifestEntry("sap.ui5");
		return oManifestUI5?.routing?.config?.routerClass === NAVCONF.FCL.ROUTERCLASS;
	}

	/**
	 * Provides a hook to initialize feature toggles.
	 *
	 * This hook is being called by the SAP Fiori elements AppComponent at the time feature toggles can be initialized.
	 * To change page configuration use the {@link sap.fe.core.AppComponent#changePageConfiguration} method.
	 *
	 * @function
	 * @name sap.fe.core.AppComponent#initializeFeatureToggles
	 * @memberof sap.fe.core.AppComponent
	 * @public
	 */
	async initializeFeatureToggles(): Promise<void> {
		// this method can be overridden by applications
		return Promise.resolve();
	}

	/**
	 * Changes the page configuration of SAP Fiori elements.
	 *
	 * This method enables you to change the page configuration of SAP Fiori elements.
	 *
	 * @function
	 * @name sap.fe.core.AppComponent#changePageConfiguration
	 * @memberof sap.fe.core.AppComponent
	 * @param pageId The ID of the page for which the configuration is to be changed.
	 * @param path The path in the page settings for which the configuration is to be changed.
	 * @param value The new value of the configuration. This could be a plain value like a string, or a Boolean, or a structured object.
	 * @public
	 */
	changePageConfiguration(pageId: string, path: string, value: unknown): void {
		changeConfiguration(this.getManifest(), pageId, path, value, true);
	}

	/**
	 * Get a reference to the RouterProxy.
	 *
	 * @function
	 * @name sap.fe.core.AppComponent#getRouterProxy
	 * @memberof sap.fe.core.AppComponent
	 * @returns A Reference to the RouterProxy
	 * @ui5-restricted
	 * @final
	 */
	getRouterProxy(): RouterProxy {
		return this._oRouterProxy;
	}

	/**
	 * Get a reference to the AppStateHandler.
	 *
	 * @function
	 * @name sap.fe.core.AppComponent#getAppStateHandler
	 * @memberof sap.fe.core.AppComponent
	 * @returns A reference to the AppStateHandler
	 * @ui5-restricted
	 * @final
	 */
	getAppStateHandler() {
		return this._oAppStateHandler;
	}

	/**
	 * Get a reference to the nav/FCL Controller.
	 *
	 * @function
	 * @name sap.fe.core.AppComponent#getRootViewController
	 * @memberof sap.fe.core.AppComponent
	 * @returns  A reference to the FCL Controller
	 * @ui5-restricted
	 * @final
	 */
	getRootViewController(): RootViewBaseController {
		return this.getRootControl().getController();
	}

	/**
	 * Get the NavContainer control or the FCL control.
	 *
	 * @function
	 * @name sap.fe.core.AppComponent#getRootContainer
	 * @memberof sap.fe.core.AppComponent
	 * @returns  A reference to NavContainer control or the FCL control
	 * @ui5-restricted
	 * @final
	 */
	getRootContainer() {
		return this.getRootControl().getContent()[0] as NavContainer | FlexibleColumnLayout;
	}

	/**
	 * Get the startup mode of the app.
	 *
	 * @returns The startup mode
	 * @private
	 */
	getStartupMode(): string {
		return this.startupMode;
	}

	/**
	 * Set the startup mode for the app to 'Create'.
	 *
	 * @private
	 */
	setStartupModeCreate() {
		this.startupMode = StartupMode.Create;
	}

	/**
	 * Set the startup mode for the app to 'AutoCreate'.
	 *
	 * @private
	 */
	setStartupModeAutoCreate() {
		this.startupMode = StartupMode.AutoCreate;
	}

	/**
	 * Set the startup mode for the app to 'Deeplink'.
	 *
	 * @private
	 */
	setStartupModeDeeplink() {
		this.startupMode = StartupMode.Deeplink;
	}

	init() {
		const uiModel = new JSONModel({
			editMode: library.EditMode.Display,
			isEditable: false,
			draftStatus: library.DraftStatus.Clear,
			busy: false,
			busyLocal: {},
			pages: {}
		});
		const oInternalModel = new JSONModel({
			pages: {}
		});
		// set the binding OneWay for uiModel to prevent changes if controller extensions modify a bound property of a control
		uiModel.setDefaultBindingMode("OneWay");
		// for internal model binding needs to be two way
		ModelHelper.enhanceUiJSONModel(uiModel, library);
		ModelHelper.enhanceInternalJSONModel(oInternalModel);

		this.setModel(uiModel, "ui");
		this.setModel(oInternalModel, "internal");

		this.bInitializeRouting = this.bInitializeRouting !== undefined ? this.bInitializeRouting : true;
		this._oRouterProxy = new RouterProxy();
		this._oAppStateHandler = new AppStateHandler(this);
		this._oDiagnostics = new Diagnostics();

		const oModel = this.getModel() as ODataModel;
		if (oModel?.isA?.("sap.ui.model.odata.v4.ODataModel")) {
			this.entityContainer = oModel.getMetaModel().requestObject("/$EntityContainer/");
		} else {
			// not an OData v4 service
			this.entityContainer = Promise.resolve();
		}

		const oManifestUI5 = this.getManifest()["sap.ui5"];
		if (oManifestUI5?.rootView?.viewName) {
			// The application specified an own root view in the manifest

			// Root View was moved from sap.fe.templates to sap.fe.core - keep it compatible
			if (oManifestUI5.rootView.viewName === NAVCONF.FCL.VIEWNAME_COMPATIBILITY) {
				oManifestUI5.rootView.viewName = NAVCONF.FCL.VIEWNAME;
			} else if (oManifestUI5.rootView.viewName === NAVCONF.NAVCONTAINER.VIEWNAME_COMPATIBILITY) {
				oManifestUI5.rootView.viewName = NAVCONF.NAVCONTAINER.VIEWNAME;
			}

			if (
				oManifestUI5.rootView.viewName === NAVCONF.FCL.VIEWNAME &&
				oManifestUI5.routing?.config?.routerClass === NAVCONF.FCL.ROUTERCLASS
			) {
				Log.info(`Rootcontainer: "${NAVCONF.FCL.VIEWNAME}" - Routerclass: "${NAVCONF.FCL.ROUTERCLASS}"`);
			} else if (
				oManifestUI5.rootView.viewName === NAVCONF.NAVCONTAINER.VIEWNAME &&
				oManifestUI5.routing?.config?.routerClass === NAVCONF.NAVCONTAINER.ROUTERCLASS
			) {
				Log.info(`Rootcontainer: "${NAVCONF.NAVCONTAINER.VIEWNAME}" - Routerclass: "${NAVCONF.NAVCONTAINER.ROUTERCLASS}"`);
			} else if (oManifestUI5.rootView?.viewName?.indexOf("sap.fe.core.rootView") !== -1) {
				throw Error(
					`\nWrong configuration for the couple (rootView/routerClass) in manifest file.\n` +
						`Current values are :(${oManifestUI5.rootView.viewName}/${
							oManifestUI5.routing?.config?.routerClass || "<missing router class>"
						})\n` +
						`Expected values are \n` +
						`\t - (${NAVCONF.NAVCONTAINER.VIEWNAME}/${NAVCONF.NAVCONTAINER.ROUTERCLASS})\n` +
						`\t - (${NAVCONF.FCL.VIEWNAME}/${NAVCONF.FCL.ROUTERCLASS})`
				);
			} else {
				Log.info(`Rootcontainer: "${oManifestUI5.rootView.viewName}" - Routerclass: "${NAVCONF.NAVCONTAINER.ROUTERCLASS}"`);
			}
		}

		// Adding Semantic Date Operators
		// Commenting since it is not needed for SingleRange
		SemanticDateOperators.addSemanticDateOperators();

		// the init function configures the routing according to the settings above
		// it will call the createContent function to instantiate the RootView and add it to the UIComponent aggregations

		super.init();
		AppComponent.instanceMap[this.getId()] = this;
	}

	async onServicesStarted() {
		await this.initializeFeatureToggles();

		//router must be started once the rootcontainer is initialized
		//starting of the router
		const finalizedRoutingInitialization = () => {
			this.entityContainer
				.then(() => {
					if (this.getRootViewController().attachRouteMatchers) {
						this.getRootViewController().attachRouteMatchers();
					}
					this.getRouter().initialize();
					this.getRouterProxy().init(this, this._isFclEnabled());
					return;
				})
				.catch((error: Error) => {
					const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");

					this.getRootViewController().displayErrorPage(
						oResourceBundle.getText("C_APP_COMPONENT_SAPFE_APPSTART_TECHNICAL_ISSUES"),
						{
							title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
							description: error.message,
							FCLLevel: 0
						}
					);
				});
		};

		if (this.bInitializeRouting) {
			return this.getRoutingService()
				.initializeRouting()
				.then(() => {
					if (this.getRootViewController()) {
						finalizedRoutingInitialization();
					} else {
						this.getRootControl().attachAfterInit(function () {
							finalizedRoutingInitialization();
						});
					}
					return;
				})
				.catch(function (err: Error) {
					Log.error(`cannot cannot initialize routing: ${err.toString()}`);
				});
		}
	}

	exit() {
		this._oAppStateHandler.destroy();
		this._oRouterProxy.destroy();
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		delete this._oAppStateHandler;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		delete this._oRouterProxy;
		deleteModelCacheData(this.getMetaModel());
		this.getModel("ui").destroy();
		cleanPageConfigurationChanges();
	}

	getMetaModel(): ODataMetaModel {
		return this.getModel().getMetaModel() as ODataMetaModel;
	}

	getDiagnostics() {
		return this._oDiagnostics;
	}

	destroy(bSuppressInvalidate?: boolean) {
		// LEAKS, with workaround for some Flex / MDC issue
		try {
			// 	// This one is only a leak if you don't go back to the same component in the long run
			//delete sap.ui.fl.FlexControllerFactory._componentInstantiationPromises[this.getId()];

			delete AppComponent.instanceMap[this.getId()];

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			delete (window as unknown)._routing;
		} catch (e) {
			Log.info(e as string);
		}

		//WORKAROUND for sticky discard request : due to async callback, request triggered by the exitApplication will be send after the UIComponent.prototype.destroy
		//so we need to copy the Requestor headers as it will be destroy

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const oMainModel = this.oModels[undefined];
		let oHeaders;
		if (oMainModel.oRequestor) {
			oHeaders = jQuery.extend({}, oMainModel.oRequestor.mHeaders);
		}

		// As we need to cleanup the application / handle the dirty object we need to call our cleanup before the models are destroyed
		this.getRoutingService()?.beforeExit();
		super.destroy(bSuppressInvalidate);
		if (oHeaders && oMainModel.oRequestor) {
			oMainModel.oRequestor.mHeaders = oHeaders;
		}
	}

	getRoutingService(): RoutingService {
		return {} as RoutingService; // overriden at runtime
	}

	getShellServices(): IShellServices {
		return {} as IShellServices; // overriden at runtime
	}

	getNavigationService(): NavigationService {
		return {} as NavigationService; // overriden at runtime
	}

	getSideEffectsService(): SideEffectsService {
		return {} as SideEffectsService;
	}

	getEnvironmentCapabilities(): EnvironmentCapabilitiesService {
		return {} as EnvironmentCapabilitiesService;
	}

	async getStartupParameters() {
		const oComponentData = this.getComponentData();
		return Promise.resolve((oComponentData && oComponentData.startupParameters) || {});
	}

	restore() {
		// called by FLP when app sap-keep-alive is enabled and app is restored
		this.getRootViewController().viewState.onRestore();
	}

	suspend() {
		// called by FLP when app sap-keep-alive is enabled and app is suspended
		this.getRootViewController().viewState.onSuspend();
	}

	/**
	 * navigateBasedOnStartupParameter function is a public api that acts as a wrapper to _manageDeepLinkStartup function. It passes the startup parameters further to _manageDeepLinkStartup function
	 *
	 * @param startupParameters Defines the startup parameters which is further passed to _manageDeepLinkStartup function.
	 */

	async navigateBasedOnStartupParameter(startupParameters: StartupParameters | null | undefined) {
		try {
			if (!BusyLocker.isLocked(this.getModel("ui"))) {
				if (!startupParameters) {
					startupParameters = null;
				}
				const routingService = this.getRoutingService();
				await routingService._manageDeepLinkStartup(startupParameters);
			}
		} catch (exception: unknown) {
			Log.error(exception as string);
			BusyLocker.unlock(this.getModel("ui"));
		}
	}
}

interface AppComponent extends UIComponent {
	getManifest(): ManifestContent;
	getManifestEntry(entry: "sap.app"): ManifestContentApp;
	getManifestEntry(entry: "sap.ui5"): ManifestContentUI5;
	getComponentData(): ComponentData;
	getRootControl(): {
		getController(): RootViewBaseController;
	} & View;
}

export default AppComponent;
