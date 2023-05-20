import type AppComponent from "sap/fe/core/AppComponent";
import CommonUtils from "sap/fe/core/CommonUtils";
import type ConverterContext from "sap/fe/core/converters/ConverterContext";
import { defineUI5Class, event, implementInterface, property } from "sap/fe/core/helpers/ClassSupport";
import type PageController from "sap/fe/core/PageController";
import type Event from "sap/ui/base/Event";
import type ComponentContainer from "sap/ui/core/ComponentContainer";
import type { IAsyncContentCreation } from "sap/ui/core/library";
import type View from "sap/ui/core/mvc/View";
import UIComponent from "sap/ui/core/UIComponent";
import StateUtil from "sap/ui/mdc/p13n/StateUtil";
import type ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";

type NavigationConfiguration = {
	detail: {
		route: string;
		parameters: unknown;
	};
};

@defineUI5Class("sap.fe.core.TemplateComponent")
class TemplateComponent extends UIComponent implements IAsyncContentCreation {
	@implementInterface("sap.ui.core.IAsyncContentCreation")
	__implements__sap_ui_core_IAsyncContentCreation = true;

	/**
	 * Name of the OData entity set
	 */
	@property({ type: "string", defaultValue: null })
	entitySet: string | null = null;

	/**
	 * Context Path for rendering the template
	 */
	@property({ type: "string", defaultValue: null })
	contextPath: string | null = null;

	/**
	 * The pattern for the binding context to be create based on the parameters from the navigation
	 * If not provided we'll default to what was passed in the URL
	 */
	@property({ type: "string" })
	bindingContextPattern!: string;

	/**
	 * Map of used OData navigations and its routing targets
	 */
	@property({ type: "object" })
	navigation!: Record<string, NavigationConfiguration>;

	/**
	 * Enhance the i18n bundle used for this page with one or more app specific i18n resource bundles or resource models
	 * or a combination of both. The last resource bundle/model is given highest priority
	 */
	@property({ type: "string[]" })
	enhanceI18n!: string[];

	/**
	 * Define control related configuration settings
	 */
	@property({ type: "object" })
	controlConfiguration?: Record<string, unknown>;

	/**
	 * Adjusts the template content
	 */
	@property({ type: "object" })
	content?: Record<string, unknown>;

	/**
	 * Whether or not you can reach this page directly through semantic bookmarks
	 */
	@property({ type: "boolean" })
	allowDeepLinking!: boolean;

	/**
	 * Defines the context path on the component that is refreshed when the app is restored using keep alive mode
	 */
	@property({ type: "object" })
	refreshStrategyOnAppRestore: unknown;

	@property({ type: "string" })
	viewType = "XML";

	@event()
	containerDefined!: Function;

	@event()
	heroesBatchReceived!: Function;

	@event()
	workersBatchReceived!: Function;

	protected oAppComponent!: AppComponent;

	setContainer(oContainer: ComponentContainer): this {
		super.setContainer(oContainer);
		this.fireEvent("containerDefined", { container: oContainer });
		return this;
	}

	init() {
		this.oAppComponent = CommonUtils.getAppComponent(this);
		super.init();
		const oStateChangeHandler = function (oEvent: Event) {
			const oControl = oEvent.getParameter("control");
			if (oControl.isA("sap.ui.mdc.Table") || oControl.isA("sap.ui.mdc.FilterBar") || oControl.isA("sap.ui.mdc.Chart")) {
				const oMacroAPI = oControl.getParent();
				if (oMacroAPI?.fireStateChange) {
					oMacroAPI.fireStateChange();
				}
			}
		};
		StateUtil.detachStateChange(oStateChangeHandler);
		StateUtil.attachStateChange(oStateChangeHandler);
	}

	// This method is called by UI5 core to access to the component containing the customizing configuration.
	// as controller extensions are defined in the manifest for the app component and not for the
	// template component we return the app component.
	getExtensionComponent(): AppComponent {
		return this.oAppComponent;
	}

	getRootController(): PageController | undefined {
		const rootControl: View = this.getRootControl();
		let rootController: PageController | undefined;
		if (rootControl && rootControl.getController) {
			rootController = rootControl.getController() as PageController;
		}
		return rootController;
	}

	onPageReady(mParameters: unknown) {
		const rootController = this.getRootController();
		if (rootController && rootController.onPageReady) {
			rootController.onPageReady(mParameters);
		}
	}

	getNavigationConfiguration(sTargetPath: string): NavigationConfiguration {
		const mNavigation = this.navigation;
		return mNavigation[sTargetPath];
	}

	getViewData() {
		const mProperties = this.getMetadata().getAllProperties();
		const oViewData = Object.keys(mProperties).reduce((mViewData: Record<string, unknown>, sPropertyName: string) => {
			mViewData[sPropertyName] = mProperties[sPropertyName].get!(this);
			return mViewData;
		}, {});

		// Access the internal _isFclEnabled which will be there
		oViewData.fclEnabled = this.oAppComponent._isFclEnabled();

		return oViewData;
	}

	_getPageTitleInformation() {
		const rootControl = this.getRootControl();
		if (rootControl && rootControl.getController() && rootControl.getController()._getPageTitleInformation) {
			return rootControl.getController()._getPageTitleInformation();
		} else {
			return {};
		}
	}

	getExtensionAPI() {
		return this.getRootControl().getController().getExtensionAPI();
	}
}
interface TemplateComponent {
	// TODO: this should be ideally be handled by the editflow/routing without the need to have this method in the object page - for now keep it here
	createDeferredContext?(sPath: string, oListBinding: ODataListBinding, bActionCreate: boolean): void;
	getRootControl(): { getController(): PageController } & View;
	extendPageDefinition?(pageDefinition: {}, converterContext?: ConverterContext): {};
}
export default TemplateComponent;
