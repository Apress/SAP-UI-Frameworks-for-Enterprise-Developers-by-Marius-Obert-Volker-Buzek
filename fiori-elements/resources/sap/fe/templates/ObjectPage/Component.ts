import Log from "sap/base/Log";
import CommonUtils, { InboundParameter } from "sap/fe/core/CommonUtils";
import ConverterContext from "sap/fe/core/converters/ConverterContext";
import { ObjectPageDefinition } from "sap/fe/core/converters/templates/ObjectPageConverter";
import { defineUI5Class, property } from "sap/fe/core/helpers/ClassSupport";
import CoreLibrary from "sap/fe/core/library";
import TemplateComponent from "sap/fe/core/TemplateComponent";
import templateLib from "sap/fe/templates/library";
import { extendObjectPageDefinition, FinalPageDefinition } from "sap/fe/templates/ObjectPage/ExtendPageDefinition";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";

const VariantManagement = CoreLibrary.VariantManagement,
	CreationMode = CoreLibrary.CreationMode;
const SectionLayout = templateLib.ObjectPage.SectionLayout;
@defineUI5Class("sap.fe.templates.ObjectPage.Component", { library: "sap.fe.templates", manifest: "json" })
class ObjectPageComponent extends TemplateComponent {
	/**
	 * Defines if and on which level variants can be configured:
	 * 		None: no variant configuration at all
	 * 		Page: one variant configuration for the whole page
	 * 		Control: variant configuration on control level
	 */
	@property({
		type: "sap.fe.core.VariantManagement",
		defaultValue: VariantManagement.None
	})
	variantManagement: typeof VariantManagement;

	/**
	 * Defines how the sections are rendered
	 * 		Page: all sections are shown on one page
	 * 		Tabs: each top-level section is shown in an own tab
	 */
	@property({
		type: "sap.fe.templates.ObjectPage.SectionLayout",
		defaultValue: SectionLayout.Page
	})
	sectionLayout: typeof SectionLayout;

	/**
	 * Enables the related apps features
	 */
	@property({
		type: "boolean",
		defaultValue: false
	})
	showRelatedApps!: boolean;

	@property({ type: "object" })
	additionalSemanticObjects: any;

	/**
	 * Enables the editable object page header
	 */
	@property({
		type: "boolean",
		defaultValue: true
	})
	editableHeaderContent!: boolean;

	/**
	 * Enables the BreadCrumbs features
	 */
	@property({
		type: "boolean",
		defaultValue: true
	})
	showBreadCrumbs!: boolean;

	/**
	 * Defines the properties which can be used for inbound Navigation
	 */
	@property({
		type: "object"
	})
	inboundParameters: any;

	@property({
		type: "boolean",
		defaultValue: false
	})
	enableLazyLoading!: boolean;

	private DeferredContextCreated: Boolean = false;

	isContextExpected() {
		return true;
	}

	extendPageDefinition(pageDefinition: ObjectPageDefinition, converterContext: ConverterContext): FinalPageDefinition {
		return extendObjectPageDefinition(pageDefinition, converterContext);
	}

	// TODO: this should be ideally be handled by the editflow/routing without the need to have this method in the
	// object page - for now keep it here
	createDeferredContext(sPath: any, oListBinding: any, bActionCreate: any) {
		if (!this.DeferredContextCreated) {
			this.DeferredContextCreated = true;
			const oParameters = {
				$$groupId: "$auto.Heroes",
				$$updateGroupId: "$auto"
			};
			// In fullscreen mode, we recreate the list binding, as we don't want to have synchronization between views
			// (it causes errors, e.g. pending changes due to creationRow)
			if (
				!oListBinding ||
				(oListBinding.isRelative() === false && !(this.oAppComponent.getRootViewController() as any).isFclEnabled())
			) {
				oListBinding = new (ODataListBinding as any)(
					this.getModel(),
					sPath.replace("(...)", ""),
					undefined,
					undefined,
					undefined,
					oParameters
				);
			}
			const oStartUpParams =
					this.oAppComponent && this.oAppComponent.getComponentData() && this.oAppComponent.getComponentData().startupParameters,
				oInboundParameters = this.getViewData().inboundParameters as Record<string, InboundParameter> | undefined;
			let createParams;
			if (oStartUpParams && oStartUpParams.preferredMode && oStartUpParams.preferredMode[0].indexOf("create") !== -1) {
				createParams = CommonUtils.getAdditionalParamsForCreate(oStartUpParams, oInboundParameters);
			}

			// for now wait until the view and the controller is created
			(this.getRootControl() as any)
				.getController()
				.editFlow.createDocument(oListBinding, {
					creationMode: CreationMode.Sync,
					createAction: bActionCreate,
					data: createParams,
					bFromDeferred: true
				})
				.finally(() => {
					this.DeferredContextCreated = false;
				})
				.catch(function () {
					// Do Nothing ?
				});
		}
	}

	setVariantManagement(sVariantManagement: any) {
		if (sVariantManagement === VariantManagement.Page) {
			Log.error("ObjectPage does not support Page-level variant management yet");
			sVariantManagement = VariantManagement.None;
		}

		this.setProperty("variantManagement", sVariantManagement);
	}
}

export default ObjectPageComponent;
