import BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import type { BindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { compileConstant, compileExpression, isConstant } from "sap/fe/core/helpers/BindingToolkit";
import type { ControlProperties, JSXContext, NonControlProperties, Ref } from "sap/fe/core/jsx-runtime/jsx";
import Text from "sap/m/Text";
import DataType from "sap/ui/base/DataType";
import type ManagedObjectMetadata from "sap/ui/base/ManagedObjectMetadata";
import type Control from "sap/ui/core/Control";
import type { $ControlSettings } from "sap/ui/core/Control";
import type Element from "sap/ui/core/Element";

const addChildAggregation = function (aggregationChildren: any, aggregationName: string, child: any) {
	if (child === undefined || typeof child === "string") {
		return;
	}
	if (!aggregationChildren[aggregationName]) {
		aggregationChildren[aggregationName] = [];
	}
	if (isChildAnElement(child)) {
		aggregationChildren[aggregationName].push(child);
	} else if (Array.isArray(child)) {
		child.forEach((subChild) => {
			addChildAggregation(aggregationChildren, aggregationName, subChild);
		});
	} else {
		Object.keys(child).forEach((childKey) => {
			addChildAggregation(aggregationChildren, childKey, child[childKey]);
		});
	}
};
const isChildAnElement = function <T>(children?: Element | ControlProperties<T>): children is Element {
	return (children as Element)?.isA?.("sap.ui.core.Element");
};
const isAControl = function (children?: typeof Control | Function): children is typeof Control {
	return !!(children as typeof Control)?.getMetadata;
};

function processAggregations(metadata: ManagedObjectMetadata, mSettings: Record<string, any>) {
	const metadataAggregations = metadata.getAllAggregations() as any;
	const defaultAggregationName = metadata.getDefaultAggregationName();
	const aggregationChildren: Record<string, string[]> = {};
	addChildAggregation(aggregationChildren, defaultAggregationName, mSettings.children);
	delete mSettings.children;
	// find out which aggregation are bound (both in children and directly under it)
	Object.keys(metadataAggregations).forEach((aggregationName) => {
		if (aggregationChildren[aggregationName] !== undefined) {
			if (mSettings.hasOwnProperty(aggregationName)) {
				// always use the first item as template according to UI5 logic
				(mSettings as any)[aggregationName].template = aggregationChildren[aggregationName][0];
			} else {
				(mSettings as any)[aggregationName] = aggregationChildren[aggregationName];
			}
		}
	});
}

/**
 * Processes the properties.
 *
 * If the property is a bindingToolkit expression we need to compile it.
 * Else if the property is set as string (compiled binding expression returns string by default even if it's a boolean, int, etc.) and it doesn't match with expected
 * format the value is parsed to provide expected format.
 *
 * @param metadata Metadata of the control
 * @param settings Settings of the control
 * @returns {void}
 */
function processProperties(metadata: ManagedObjectMetadata, settings: Record<string, any>) {
	let settingsKey: keyof typeof settings;
	for (settingsKey in settings) {
		const value = settings[settingsKey];
		if (value?._type) {
			const bindingToolkitExpression: BindingToolkitExpression<any> = value;
			if (isConstant(bindingToolkitExpression)) {
				settings[settingsKey] = compileConstant(value, false, true, true);
			} else {
				settings[settingsKey] = compileExpression(bindingToolkitExpression) as any;
			}
		} else if (typeof settings[settingsKey] === "string" && !settings[settingsKey].startsWith("{")) {
			const propertyType = (metadata.getAllProperties()[settingsKey] as any)?.getType?.();
			if (propertyType && propertyType instanceof DataType && ["boolean", "int", "float"].indexOf(propertyType.getName()) > -1) {
				settings[settingsKey] = propertyType.parseValue(value);
			}
		}
	}
}

const jsxControl = function <T extends Element>(
	ControlType: typeof Control | Function,
	mSettings: NonControlProperties<T> & { key: string; children?: Element | ControlProperties<T>; ref?: Ref<T>; class?: string },
	key: string,
	jsxContext: JSXContext
): Control | Control[] {
	let targetControl;

	if ((ControlType as any)?.isFragment) {
		targetControl = mSettings.children;
	} else if ((ControlType as typeof BuildingBlockBase)?.isRuntime) {
		const runtimeBuildingBlock = new (ControlType as any)(mSettings);
		targetControl = runtimeBuildingBlock.getContent(jsxContext.view, jsxContext.appComponent);
	} else if (isAControl(ControlType)) {
		const metadata = ControlType.getMetadata();
		if (key !== undefined) {
			mSettings["key"] = key;
		}
		processAggregations(metadata, mSettings);
		const classDef = mSettings.class;
		const refDef = mSettings.ref;
		delete mSettings.ref;
		delete mSettings.class;
		processProperties(metadata, mSettings);
		targetControl = new ControlType(mSettings as $ControlSettings);
		if (classDef) {
			targetControl.addStyleClass(classDef);
		}
		if (refDef) {
			refDef.setCurrent(targetControl as any);
		}
	} else if (typeof ControlType === "function") {
		const controlTypeFn = ControlType;
		targetControl = controlTypeFn(mSettings as $ControlSettings);
	} else {
		targetControl = new Text({ text: "Missing component " + (ControlType as any) });
	}

	return targetControl;
};

export default jsxControl;
