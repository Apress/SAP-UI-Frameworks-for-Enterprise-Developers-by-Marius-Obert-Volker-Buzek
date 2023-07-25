import ObjectPath from "sap/base/util/ObjectPath";
import UriParameters from "sap/base/util/UriParameters";
import type AppComponent from "sap/fe/core/AppComponent";
import { defineUI5Class, publicExtension } from "sap/fe/core/helpers/ClassSupport";
import type PageController from "sap/fe/core/PageController";
import "sap/fe/placeholder/library";
import Core from "sap/ui/core/Core";
import ControllerExtension from "sap/ui/core/mvc/ControllerExtension";
import Placeholder from "sap/ui/core/Placeholder";
/**
 * {@link sap.ui.core.mvc.ControllerExtension Controller extension} for Placeholder
 *
 * @namespace
 * @alias sap.fe.core.controllerextensions.Placeholder
 */
@defineUI5Class("sap.fe.core.controllerextensions.Placeholder")
class PlaceholderControllerExtension extends ControllerExtension {
	private base!: PageController;

	private oAppComponent!: AppComponent;

	private oRootContainer: any;

	private oPlaceholders: any;

	private debugStats: any;

	@publicExtension()
	public attachHideCallback() {
		if (this.isPlaceholderEnabled()) {
			const oView = this.base.getView();
			const oPage = oView.getParent() && (oView.getParent() as any).oContainer;
			const oNavContainer = oPage && oPage.getParent();

			if (!oNavContainer) {
				return;
			}
			const _fnContainerDelegate = {
				onAfterShow: function (oEvent: any) {
					if (oEvent.isBackToPage) {
						oNavContainer.hidePlaceholder();
					} else if (UriParameters.fromQuery(window.location.hash.replace(/#.*\?/, "")).get("restoreHistory") === "true") {
						// in case we navigate to the listreport using the shell
						oNavContainer.hidePlaceholder();
					}
				}
			};
			oPage.addEventDelegate(_fnContainerDelegate);

			const oPageReady = (oView.getController() as PageController).pageReady;
			//In case of objectPage, the placeholder should be hidden when heroes requests are received
			// But for some scenario like "Create item", heroes requests are not sent .
			// The pageReady event is then used as fallback

			const aAttachEvents = ["pageReady"];
			if (oView.getControllerName() === "sap.fe.templates.ObjectPage.ObjectPageController") {
				aAttachEvents.push("heroesBatchReceived");
			}
			aAttachEvents.forEach(function (sEvent: string) {
				oPageReady.attachEvent(
					sEvent,
					null,
					function () {
						oNavContainer.hidePlaceholder();
					},
					null
				);
			});
		}
	}

	@publicExtension()
	attachRouteMatchers() {
		this._init();
	}

	_init() {
		this.oAppComponent = this.base.getAppComponent();
		this.oRootContainer = this.oAppComponent.getRootContainer();
		this.oPlaceholders = {};

		// eslint-disable-next-line no-constant-condition
		if (this.isPlaceholderEnabled()) {
			Placeholder.registerProvider(function (oConfig: any) {
				switch (oConfig.name) {
					case "sap.fe.templates.ListReport":
						return {
							html: "sap/fe/placeholder/view/PlaceholderLR.fragment.html",
							autoClose: false
						};
					case "sap.fe.templates.ObjectPage":
						return {
							html: "sap/fe/placeholder/view/PlaceholderOP.fragment.html",
							autoClose: false
						};
					default:
				}
			});
		}
		if (this.isPlaceholderDebugEnabled()) {
			this.initPlaceholderDebug();
		}
	}

	@publicExtension()
	initPlaceholderDebug() {
		this.resetPlaceholderDebugStats();
		const handler = {
			apply: (target: any) => {
				if (this.oRootContainer._placeholder && this.oRootContainer._placeholder.placeholder) {
					this.debugStats.iHidePlaceholderTimestamp = Date.now();
				}
				return target.bind(this.oRootContainer)();
			}
		};
		// eslint-disable-next-line no-undef
		const proxy1 = new Proxy(this.oRootContainer.hidePlaceholder, handler);
		this.oRootContainer.hidePlaceholder = proxy1;
	}

	@publicExtension()
	isPlaceholderDebugEnabled() {
		if (UriParameters.fromQuery(window.location.search).get("sap-ui-xx-placeholder-debug") === "true") {
			return true;
		}
		return false;
	}

	@publicExtension()
	resetPlaceholderDebugStats() {
		this.debugStats = {
			iHidePlaceholderTimestamp: 0,
			iPageReadyEventTimestamp: 0,
			iHeroesBatchReceivedEventTimestamp: 0
		};
	}

	@publicExtension()
	getPlaceholderDebugStats() {
		return this.debugStats;
	}

	@publicExtension()
	isPlaceholderEnabled() {
		const bPlaceholderEnabledInFLP = ObjectPath.get("sap-ushell-config.apps.placeholder.enabled");
		if (bPlaceholderEnabledInFLP === false) {
			return false;
		}

		return Core.getConfiguration().getPlaceholder();
	}
}

export default PlaceholderControllerExtension;
