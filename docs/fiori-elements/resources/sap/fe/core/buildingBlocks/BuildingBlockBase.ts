import deepClone from "sap/base/util/deepClone";
import merge from "sap/base/util/merge";
import type { BuildingBlockMetadata, ObjectValue } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import type { TemplateProcessorSettings, XMLProcessorTypeValue } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import { registerBuildingBlock, unregisterBuildingBlock, xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import ConverterContext from "sap/fe/core/converters/ConverterContext";
import { isUndefinedExpression } from "sap/fe/core/helpers/BindingToolkit";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import type ResourceModel from "sap/fe/core/ResourceModel";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";

/**
 * Base class for building blocks
 */
export default class BuildingBlockBase {
	private static internalMetadata: BuildingBlockMetadata;

	public static get metadata(): BuildingBlockMetadata {
		// We need to store the metadata on the actual subclass, not on BuildingBlockBase
		this.internalMetadata ??= {
			namespace: "",
			name: "",
			properties: {},
			aggregations: {},
			stereotype: "xmlmacro"
		};
		return this.internalMetadata;
	}

	public static readonly isRuntime: boolean = false;

	protected isPublic = false;

	private resourceModel?: ResourceModel;

	protected id?: string;

	constructor(props: Record<string, unknown>, _controlConfiguration?: unknown, _visitorSettings?: TemplateProcessorSettings) {
		Object.keys(props).forEach((propName) => {
			this[propName as keyof this] = props[propName] as never;
		});

		this.resourceModel = _visitorSettings?.models?.["sap.fe.i18n"];
	}

	/**
	 * Only used internally
	 *
	 * @private
	 */
	public getTemplate?(oNode?: Element): string | Promise<string | undefined> | undefined;

	/**
	 * Convert the given local element ID to a globally unique ID by prefixing with the Building Block ID.
	 *
	 * @param stringParts
	 * @returns Either the global ID or undefined if the Building Block doesn't have an ID
	 * @private
	 */
	protected createId(...stringParts: string[]) {
		// If the child instance has an ID property use it otherwise return undefined
		if (this.id) {
			return generate([this.id, ...stringParts]);
		}
		return undefined;
	}

	/**
	 * Get the ID of the content control.
	 *
	 * @param buildingBlockId
	 * @returns Return the ID
	 * @private
	 */
	protected getContentId(buildingBlockId: string) {
		return `${buildingBlockId}-content`;
	}

	/**
	 * Returns translated text for a given resource key.
	 *
	 * @param textID ID of the Text
	 * @param parameters Array of parameters that are used to create the text
	 * @param metaPath Entity set name or action name to overload a text
	 * @returns Determined text
	 */
	getTranslatedText(textID: string, parameters?: unknown[], metaPath?: string): string {
		return this.resourceModel?.getText(textID, parameters, metaPath) || textID;
	}

	protected getConverterContext = function (
		dataModelObjectPath: DataModelObjectPath,
		contextPath: string | undefined,
		settings: TemplateProcessorSettings,
		extraParams?: Record<string, unknown>
	) {
		const appComponent = settings.appComponent;
		const originalViewData = settings.models.viewData?.getData();
		let viewData = Object.assign({}, originalViewData);
		delete viewData.resourceModel;
		delete viewData.appComponent;
		viewData = deepClone(viewData);
		viewData.controlConfiguration = merge(viewData.controlConfiguration, extraParams || {});
		return ConverterContext.createConverterContextForMacro(
			dataModelObjectPath.startingEntitySet.name,
			settings.models.metaModel,
			appComponent?.getDiagnostics(),
			merge,
			dataModelObjectPath.contextLocation,
			viewData
		);
	};

	/**
	 * Only used internally.
	 *
	 * @returns All the properties defined on the object with their values
	 * @private
	 */
	public getProperties() {
		const allProperties: Record<string, ObjectValue> = {};
		for (const oInstanceKey in this) {
			if (this.hasOwnProperty(oInstanceKey)) {
				allProperties[oInstanceKey] = this[oInstanceKey] as unknown as ObjectValue;
			}
		}
		return allProperties;
	}

	static register() {
		registerBuildingBlock(this);
	}

	static unregister() {
		unregisterBuildingBlock(this);
	}

	/**
	 * Add a part of string based on the condition.
	 *
	 * @param condition
	 * @param partToAdd
	 * @returns The part to add if the condition is true, otherwise an empty string
	 * @private
	 */
	protected addConditionally(condition: boolean, partToAdd: string): string {
		if (condition) {
			return partToAdd;
		} else {
			return "";
		}
	}

	/**
	 * Add an attribute depending on the current value of the property.
	 * If it's undefined the attribute is not added.
	 *
	 * @param attributeName
	 * @param value
	 * @returns The attribute to add if the value is not undefined, otherwise an empty string
	 * @private
	 */
	protected attr(attributeName: string, value?: XMLProcessorTypeValue): () => string {
		if (value !== undefined && !isUndefinedExpression(value)) {
			return () => xml`${attributeName}="${value}"`;
		} else {
			return () => "";
		}
	}
}
