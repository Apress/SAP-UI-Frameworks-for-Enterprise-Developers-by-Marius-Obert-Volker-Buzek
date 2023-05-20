import type { TemplateProcessorSettings } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import type RuntimeBuildingBlock from "sap/fe/core/buildingBlocks/RuntimeBuildingBlock";
import CommonUtils from "sap/fe/core/CommonUtils";
import type { BindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { resolveBindingString } from "sap/fe/core/helpers/BindingToolkit";
import { defineUI5Class, event } from "sap/fe/core/helpers/ClassSupport";
import jsx from "sap/fe/core/jsx-runtime/jsx";
import type ResourceModel from "sap/fe/core/ResourceModel";
import type TemplateComponent from "sap/fe/core/TemplateComponent";
import ManagedObject from "sap/ui/base/ManagedObject";
import Component from "sap/ui/core/Component";
import type Control from "sap/ui/core/Control";
import Fragment from "sap/ui/core/Fragment";
import type View from "sap/ui/core/mvc/View";
import type { ManagedObjectEx } from "../../../../../../../types/extension_types";

/**
 * Internal extension to the Fragment class in order to add some place to hold functions for runtime building blocks
 */
@defineUI5Class("sap.fe.core.buildingBlocks.RuntimeBuildingBlockFragment")
export default class RuntimeBuildingBlockFragment extends Fragment {
	/*
	 * Event to hold and resolve functions for runtime building blocks
	 */
	@event()
	functionHolder!: Function;
}

type FragmentCustomData = {
	mProperties: {
		value: {
			"sap.fe.core.buildingBlocks"?: Record<string, string>;
		};
	};
};

type FEComponentFragmentSettings = {
	fragmentName: string;
	fragmentContent?: typeof RuntimeBuildingBlock;
	containingView: View;
	customData?: FragmentCustomData[];
	functionHolder?: FunctionWithHandler[][];
};

type FunctionWithHandler = Function & {
	_sapui_handlerName?: string;
};
type FragmentWithInternals = {
	_bAsync: boolean;
	_aContent: Control | Control[];
};

const RUNTIME_BLOCKS: Record<string, typeof RuntimeBuildingBlock> = {};
/**
 * Stores the class of a runtime building block to be loaded whenever the building block is used at runtime.
 *
 * @param BuildingBlockClass
 */
export function storeRuntimeBlock(BuildingBlockClass: typeof RuntimeBuildingBlock) {
	RUNTIME_BLOCKS[
		`${BuildingBlockClass.metadata.namespace ?? BuildingBlockClass.metadata.publicNamespace}.${BuildingBlockClass.metadata.name}`
	] = BuildingBlockClass;
}

RuntimeBuildingBlockFragment.registerType("FE_COMPONENTS", {
	load: async function (mSettings: FEComponentFragmentSettings) {
		return Promise.resolve(RUNTIME_BLOCKS[mSettings.fragmentName]);
	},
	init: function (this: FragmentWithInternals, mSettings: FEComponentFragmentSettings) {
		let BuildingBlockClass = mSettings.fragmentContent;
		if (BuildingBlockClass === undefined) {
			// In some case we might have been called here synchronously (unstash case for instance), which means we didn't go through the load function
			BuildingBlockClass = RUNTIME_BLOCKS[mSettings.fragmentName];
		}
		if (BuildingBlockClass === undefined) {
			throw new Error(`No building block class for runtime building block ${mSettings.fragmentName} found`);
		}

		const classSettings: Record<string, unknown> = {};
		const feCustomData: Record<string, string> = mSettings.customData?.[0]?.mProperties?.value?.["sap.fe.core.buildingBlocks"] || {};
		delete mSettings.customData;
		const functionHolder: FunctionWithHandler[][] = mSettings.functionHolder ?? [];
		delete mSettings.functionHolder;

		// containingView can also be a fragment, so we have to use the controller to be sure to get the actual view
		const containingView = mSettings.containingView.getController?.().getView?.() ?? mSettings.containingView;
		const pageComponent = Component.getOwnerComponentFor(containingView) as TemplateComponent;
		const appComponent = CommonUtils.getAppComponent(containingView);

		const metaModel = appComponent.getMetaModel();
		const pageModel = pageComponent.getModel("_pageModel");

		const functionStringInOrder: string[] | undefined = feCustomData.functionStringInOrder?.split(",");
		const propertiesAssignedToFunction: string[] | undefined = feCustomData.propertiesAssignedToFunction?.split(",");
		for (const propertyName in BuildingBlockClass.metadata.properties) {
			const propertyMetadata = BuildingBlockClass.metadata.properties[propertyName];
			const pageModelContext = pageModel.createBindingContext(feCustomData[propertyName]);

			if (pageModelContext === null) {
				// value cannot be resolved, so it is either a runtime binding or a constant
				let value: string | boolean | number | BindingToolkitExpression<string | boolean | number> | undefined =
					feCustomData[propertyName];

				if (typeof value === "string") {
					if (propertyMetadata.bindable !== true) {
						// runtime bindings are not allowed, so convert strings into actual primitive types
						switch (propertyMetadata.type) {
							case "boolean":
								value = value === "true";
								break;
							case "number":
								value = Number(value);
								break;
						}
					} else {
						// runtime bindings are allowed, so resolve the values as BindingToolkit expressions
						value = resolveBindingString(value, propertyMetadata.type);
					}
				} else if (propertyMetadata.type === "function") {
					const functionIndex = propertiesAssignedToFunction.indexOf(propertyName);
					const functionString = functionStringInOrder[functionIndex];
					const targetFunction = functionHolder?.find((functionDef) => functionDef[0]?._sapui_handlerName === functionString);
					// We use the _sapui_handlerName to identify which function is the one we want to bind here
					if (targetFunction && targetFunction.length > 1) {
						value = targetFunction[0].bind(targetFunction[1]);
					}
				}

				classSettings[propertyName] = value;
			} else if (pageModelContext.getObject() !== undefined) {
				// get value from page model
				classSettings[propertyName] = pageModelContext.getObject();
			} else {
				// bind to metamodel
				classSettings[propertyName] = metaModel.createBindingContext(feCustomData[propertyName]);
			}
		}

		return (ManagedObject as ManagedObjectEx).runWithPreprocessors(
			() => {
				const renderedControl = jsx.withContext({ view: containingView, appComponent: appComponent }, () => {
					const templateProcessingSettings = {
						models: {
							"sap.fe.i18n": containingView.getModel("sap.fe.i18n") as ResourceModel
						}
					} as TemplateProcessorSettings;
					return new BuildingBlockClass!(classSettings, {}, templateProcessingSettings).getContent?.(
						containingView,
						appComponent
					);
				});
				if (!this._bAsync) {
					this._aContent = renderedControl;
				}
				return renderedControl;
			},
			{
				id: function (sId: string) {
					return containingView.createId(sId);
				},
				settings: function (controlSettings: Record<string, string | ManagedObject | (string | ManagedObject)[]>) {
					const allAssociations = this.getMetadata().getAssociations();
					for (const associationDetailName of Object.keys(allAssociations)) {
						if (controlSettings[associationDetailName] !== undefined) {
							// The associated elements are indicated via local IDs; we need to change the references to global ones
							const associations = (
								Array.isArray(controlSettings[associationDetailName])
									? controlSettings[associationDetailName]
									: [controlSettings[associationDetailName]]
							) as (string | ManagedObject)[];

							// Create global IDs for associations given as strings, not for already resolved ManagedObjects
							controlSettings[associationDetailName] = associations.map((association: string | ManagedObject) =>
								typeof association === "string" ? mSettings.containingView.createId(association) : association
							);
						}
					}
					return controlSettings;
				}
			}
		);
	}
});
