import type AppComponent from "sap/fe/core/AppComponent";
import type ManagedObject from "sap/ui/base/ManagedObject";

type UrlParser = {
	parseParameters(url: string): Record<string, string[]>;
};

const urlParserMock: UrlParser = {
	parseParameters: function () {
		return {};
	}
};
const urlParser: UrlParser = sap.ushell?.Container ? sap.ushell.Container.getService("URLParsing") : urlParserMock;
const urlParams: Record<string, string[]> = urlParser.parseParameters(window.location.search);
const fioriToolsRtaMode: boolean = urlParams["fiori-tools-rta-mode"]?.[0]?.toLowerCase() === "true";

const isOnDynamicPage = function (element: ManagedObject): boolean {
	if (element.getMetadata().getName() === "sap.f.DynamicPage") {
		return true;
	} else {
		const parent = element.getParent();
		return parent ? isOnDynamicPage(parent) : false;
	}
};
const getAllowList = function (element: ManagedObject): Record<string, boolean> {
	let allowList: Record<string, boolean> = {};
	const elementName = element.getMetadata().getName();
	if (fioriToolsRtaMode) {
		// build the allow list for Fiori tools (developers)
		if (isOnDynamicPage(element)) {
			allowList = {
				"sap.ui.fl.variants.VariantManagement": true,
				"sap.fe.core.controls.FilterBar": true,
				"sap.ui.mdc.Table": true
			};
		}
	} else {
		// build the allow list for UI Adaptation (key users)
		allowList = {
			"sap.fe.templates.ObjectPage.controls.StashableVBox": true,
			"sap.fe.templates.ObjectPage.controls.StashableHBox": true,
			"sap.uxap.ObjectPageLayout": true,
			"sap.uxap.AnchorBar": true,
			"sap.uxap.ObjectPageSection": true,
			"sap.uxap.ObjectPageSubSection": true,
			"sap.ui.fl.util.IFrame": true,
			"sap.ui.layout.form.Form": true,
			"sap.ui.layout.form.FormContainer": true,
			"sap.ui.layout.form.FormElement": true,
			"sap.ui.fl.variants.VariantManagement": true,
			"sap.fe.core.controls.FilterBar": true,
			"sap.ui.mdc.Table": true,
			"sap.m.IconTabBar": true
		};
		// currently we support the adaptation of MenuButtons only for the AnchorBar on Object Page (adaptation of sections and subsections)
		if (elementName === "sap.m.MenuButton" && element.getParent()?.getMetadata().getName() === "sap.uxap.AnchorBar") {
			allowList["sap.m.MenuButton"] = true;
		}
		// currently we support the adaptation of Buttons only for the AnchorBar on Object Page (adaptation of sections and subsections)
		if (elementName === "sap.m.Button" && element.getParent()?.getMetadata().getName() === "sap.uxap.AnchorBar") {
			allowList["sap.m.Button"] = true;
		}
		// the adaptation of FlexBoxes is only supported for the HeaderContainer on Object Page
		if (elementName === "sap.m.FlexBox" && element.getId().indexOf("--fe::HeaderContentContainer") >= 0) {
			allowList["sap.m.FlexBox"] = true;
		}
	}
	return allowList;
};

// To enable all actions, remove the propagateMetadata function. Or, remove this file and its entry in AppComponent.js referring 'designTime'.
const AppComponentDesignTime = {
	actions: "not-adaptable",
	aggregations: {
		rootControl: {
			actions: "not-adaptable",
			propagateMetadata: function (element: ManagedObject) {
				const allowList = getAllowList(element);
				if (allowList[element.getMetadata().getName()]) {
					// by returning the empty object, the same will be merged with element's native designtime definition, i.e. all actions will be enabled for this element
					return {};
				} else {
					// not-adaptable will be interpreted by flex to disable all actions for this element
					return {
						actions: "not-adaptable"
					};
				}
			}
		}
	},
	tool: {
		start: function (appComponent: AppComponent) {
			appComponent.getEnvironmentCapabilities().setCapability("AppState", false);
		},
		stop: function (appComponent: AppComponent) {
			appComponent.getEnvironmentCapabilities().setCapability("AppState", true);
		}
	}
};

export default AppComponentDesignTime;
