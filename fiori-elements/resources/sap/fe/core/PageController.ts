import BaseController from "sap/fe/core/BaseController";
import EditFlow from "sap/fe/core/controllerextensions/EditFlow";
import IntentBasedNavigation from "sap/fe/core/controllerextensions/IntentBasedNavigation";
import InternalIntentBasedNavigation from "sap/fe/core/controllerextensions/InternalIntentBasedNavigation";
import InternalRouting from "sap/fe/core/controllerextensions/InternalRouting";
import MassEdit from "sap/fe/core/controllerextensions/MassEdit";
import MessageHandler from "sap/fe/core/controllerextensions/MessageHandler";
import PageReady from "sap/fe/core/controllerextensions/PageReady";
import Paginator from "sap/fe/core/controllerextensions/Paginator";
import Placeholder from "sap/fe/core/controllerextensions/Placeholder";
import Routing from "sap/fe/core/controllerextensions/Routing";
import Share from "sap/fe/core/controllerextensions/Share";
import SideEffects from "sap/fe/core/controllerextensions/SideEffects";
import ViewState from "sap/fe/core/controllerextensions/ViewState";
import ExtensionAPI from "sap/fe/core/ExtensionAPI";
import { defineUI5Class, extensible, publicExtension, usingExtension } from "sap/fe/core/helpers/ClassSupport";
import Component from "sap/ui/core/Component";
import OverrideExecution from "sap/ui/core/mvc/OverrideExecution";
import type JSONModel from "sap/ui/model/json/JSONModel";

/**
 * Base controller class for your custom page used inside an SAP Fiori elements application.
 *
 * This controller provides preconfigured extensions that will ensure you have the basic functionalities required to use the building blocks.
 *
 * @hideconstructor
 * @public
 * @since 1.88.0
 */
@defineUI5Class("sap.fe.core.PageController")
class PageController extends BaseController {
	@usingExtension(Routing)
	routing!: Routing;

	@usingExtension(InternalRouting)
	_routing!: InternalRouting;

	@usingExtension(EditFlow)
	editFlow!: EditFlow;

	@usingExtension(IntentBasedNavigation)
	intentBasedNavigation!: IntentBasedNavigation;

	@usingExtension(InternalIntentBasedNavigation)
	_intentBasedNavigation!: InternalIntentBasedNavigation;

	@usingExtension(PageReady)
	pageReady!: PageReady;

	@usingExtension(MessageHandler)
	messageHandler!: MessageHandler;

	@usingExtension(Share)
	share!: Share;

	@usingExtension(Paginator)
	paginator!: Paginator;

	@usingExtension(ViewState)
	viewState!: ViewState;

	@usingExtension(Placeholder)
	placeholder!: Placeholder;

	@usingExtension(SideEffects)
	_sideEffects!: SideEffects;

	@usingExtension(MassEdit)
	massEdit!: MassEdit;

	extension!: Record<string, unknown>;
	// @Public
	// getView(): { getController(): PageController } & View {
	// 	return super.getView() as any;
	// }

	protected extensionAPI?: ExtensionAPI;
	/**
	 * @private
	 * @name sap.fe.core.PageController.getMetadata
	 * @function
	 */
	/**
	 * @private
	 * @name sap.fe.core.PageController.extend
	 * @function
	 */

	@publicExtension()
	onInit() {
		const oUIModel = this.getAppComponent().getModel("ui") as JSONModel,
			oInternalModel = this.getAppComponent().getModel("internal") as JSONModel,
			sPath = `/pages/${this.getView().getId()}`;

		oUIModel.setProperty(sPath, {
			controls: {}
		});
		oInternalModel.setProperty(sPath, {
			controls: {},
			collaboration: {}
		});
		this.getView().bindElement({
			path: sPath,
			model: "ui"
		});
		this.getView().bindElement({
			path: sPath,
			model: "internal"
		});

		// for the time being provide it also pageInternal as some macros access it - to be removed
		this.getView().bindElement({
			path: sPath,
			model: "pageInternal"
		});
		this.getView().setModel(oInternalModel, "pageInternal");

		// as the model propagation happens after init but we actually want to access the binding context in the
		// init phase already setting the model here
		this.getView().setModel(oUIModel, "ui");
		this.getView().setModel(oInternalModel, "internal");
	}

	@publicExtension()
	onBeforeRendering() {
		if (this.placeholder.attachHideCallback) {
			this.placeholder.attachHideCallback();
		}
	}

	/**
	 * Get the extension API for the current page.
	 *
	 * @public
	 * @returns The extension API.
	 */
	@publicExtension()
	getExtensionAPI(): ExtensionAPI {
		if (!this.extensionAPI) {
			this.extensionAPI = new ExtensionAPI(this);
		}
		return this.extensionAPI;
	}

	// We specify the extensibility here the same way as it is done in the object page controller
	// since the specification here overrides it and if we do not specify anything here, the
	// behavior defaults to an execute instead!
	// TODO This may not be ideal, since it also influences the list report controller but currently it's the best solution.
	@publicExtension()
	@extensible(OverrideExecution.After)
	onPageReady(_mParameters: unknown) {
		// Apply app state only after the page is ready with the first section selected
		this.getAppComponent().getAppStateHandler().applyAppState();
	}

	_getPageTitleInformation() {
		return {};
	}

	_getPageModel(): JSONModel | undefined {
		const pageComponent = Component.getOwnerComponentFor(this.getView());
		return pageComponent?.getModel("_pageModel") as JSONModel;
	}
}

export default PageController;
