import CommonUtils from "sap/fe/core/CommonUtils";
import { aggregation, defineUI5Class } from "sap/fe/core/helpers/ClassSupport";
import KeepAliveHelper from "sap/fe/core/helpers/KeepAliveHelper";
import DelegateUtil from "sap/fe/macros/DelegateUtil";
import QuickViewPage from "sap/m/QuickViewPage";
import type Control from "sap/ui/core/Control";
import type Link from "sap/ui/mdc/Link";

@defineUI5Class("sap.fe.macros.controls.CustomQuickViewPage")
class CustomQuickViewPage extends QuickViewPage {
	@aggregation({ type: "sap.ui.core.Control", multiple: true })
	customContent!: Control[];

	@aggregation({ type: "sap.m.QuickViewGroup", multiple: true, singularName: "group", isDefault: true })
	groups!: Control[];

	onBeforeRendering(oEvent: any) {
		const parent = this.getParent();
		if (parent && parent.isA("sap.fe.macros.controls.ConditionalWrapper") && parent.getProperty("condition") === true) {
			this.setCrossAppNavCallback(() => {
				const sQuickViewPageTitleLinkHref = (DelegateUtil.getCustomData as any)(this, "titleLink");
				const oView = CommonUtils.getTargetView(this);
				const oAppComponent = CommonUtils.getAppComponent(oView);
				const oShellServiceHelper = oAppComponent.getShellServices();
				let oShellHash = oShellServiceHelper.parseShellHash(sQuickViewPageTitleLinkHref);
				const oNavArgs = {
					target: {
						semanticObject: oShellHash.semanticObject,
						action: oShellHash.action
					},
					params: oShellHash.params
				};
				const sQuickViewPageTitleLinkIntent = `${oNavArgs.target.semanticObject}-${oNavArgs.target.action}`;

				if (
					sQuickViewPageTitleLinkIntent &&
					this.oCrossAppNavigator &&
					this.oCrossAppNavigator.isNavigationSupported([sQuickViewPageTitleLinkIntent])
				) {
					if (sQuickViewPageTitleLinkIntent && sQuickViewPageTitleLinkIntent !== "") {
						if (typeof sQuickViewPageTitleLinkIntent === "string" && sQuickViewPageTitleLinkIntent !== "") {
							let oLinkControl = this.getParent();
							while (oLinkControl && !oLinkControl.isA<Link>("sap.ui.mdc.Link")) {
								oLinkControl = oLinkControl.getParent();
							}
							const sTargetHref: string = oLinkControl?.getModel("$sapuimdcLink").getProperty("/titleLinkHref");
							if (sTargetHref) {
								oShellHash = oShellServiceHelper.parseShellHash(sTargetHref);
							} else {
								oShellHash = oShellServiceHelper.parseShellHash(sQuickViewPageTitleLinkIntent);
								oShellHash.params = oNavArgs.params;
							}
							KeepAliveHelper.storeControlRefreshStrategyForHash(oView, oShellHash);
							return {
								target: {
									semanticObject: oShellHash.semanticObject,
									action: oShellHash.action
								},
								params: oShellHash.params
							};
						}
					}
				} else {
					const oCurrentShellHash = oShellServiceHelper.parseShellHash(window.location.hash);
					KeepAliveHelper.storeControlRefreshStrategyForHash(oView, oCurrentShellHash);

					return {
						target: {
							semanticObject: oCurrentShellHash.semanticObject,
							action: oCurrentShellHash.action,
							appSpecificRoute: oCurrentShellHash.appSpecificRoute
						},
						params: oCurrentShellHash.params
					};
				}
			});
		}
		super.onBeforeRendering(oEvent);
		const oPageContent = this.getPageContent();
		const oForm = oPageContent.form;
		if (oForm) {
			const _aContent = this.customContent;
			if (_aContent && _aContent.length > 0) {
				_aContent.forEach((_oContent: any) => {
					const _oContentClone = _oContent.clone();
					_oContentClone.setModel(this.getModel());
					_oContentClone.setBindingContext(this.getBindingContext());
					oForm.addContent(_oContentClone);
				});
				setTimeout(function () {
					oForm.rerender();
				}, 0);
			}
		}
	}
}

interface CustomQuickViewPage {
	// Private in UI5
	oCrossAppNavigator: any;

	// Private in UI5
	getPageContent(): any;
}

export default CustomQuickViewPage;
