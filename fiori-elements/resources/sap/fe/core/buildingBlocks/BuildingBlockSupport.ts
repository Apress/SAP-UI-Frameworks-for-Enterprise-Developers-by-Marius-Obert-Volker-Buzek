import type BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import type Context from "sap/ui/model/Context";

export type ObjectValue2 = string | boolean | number | Context | undefined | object | null;
type ObjectValue3<T> = T | Record<string, T> | T[];
export type ObjectValue = ObjectValue3<ObjectValue2 | Record<string, ObjectValue2> | ObjectValue2[]>;

/**
 * Type for the accessor decorator that we end up with in babel.
 */
type AccessorDescriptor<T> = TypedPropertyDescriptor<T> & { initializer?: () => T };
type BaseBuildingBlockPropertyDefinition = {
	type: string;
	isPublic?: boolean;
	/** @deprecated Prefer the native TypeScript initializer */
	defaultValue?: unknown;
	/** Make sure to type the optionality of your TypeScript property correctly */
	required?: boolean;
	/** This property is only considered for runtime building blocks */
	bindable?: boolean;
	/** Function that allows to validate or transform the given input */
	validate?: Function;
};
export type BuildingBlockMetadataContextDefinition = BaseBuildingBlockPropertyDefinition & {
	type: "sap.ui.model.Context";
	expectedTypes: string[];
	expectedAnnotationTypes: string[];
};
/**
 * Available properties to define a building block property
 */
export type BuildingBlockPropertyDefinition = BaseBuildingBlockPropertyDefinition | BuildingBlockMetadataContextDefinition;

/**
 * Available properties to define a building block aggregation
 */
export type BuildingBlockAggregationDefinition = {
	isPublic?: boolean;
	type: string;
	slot?: string;
	isDefault?: boolean;
	/** Defines whether the element is based on an actual node that will be rendered or only on XML that will be interpreted */
	hasVirtualNode?: boolean;
	processAggregations?: Function;
};

/**
 * Available properties to define a building block class
 */
export type BuildingBlockDefinition = {
	name: string;
	namespace?: string;
	publicNamespace?: string;
	xmlTag?: string;
	fragment?: string;
	designtime?: string;
	isOpen?: boolean;
} & ({ namespace: string } | { publicNamespace: string });

/**
 * Metadata attached to each building block class
 */
export type BuildingBlockMetadata = BuildingBlockDefinition & {
	properties: Record<string, BuildingBlockPropertyDefinition>;
	aggregations: Record<string, BuildingBlockAggregationDefinition>;
	stereotype: string;
	defaultAggregation?: string;
};

/**
 * Indicates that the property shall be declared as an xml attribute that can be used from the outside of the building block.
 *
 * If defining a runtime Building Block, please make sure to use the correct typings: Depending on its metadata,
 * a property can either be a {@link sap.ui.model.Context} (<code>type: 'sap.ui.model.Context'</code>),
 * a constant (<code>bindable: false</code>), or a {@link BindingToolkitExpression} (<code>bindable: true</code>).
 *
 * This decorator should only be used for properties that are to be set from outside or are used in inner XML templating.
 * If you just need simple computed properties, use undecorated, private TypeScript properties.
 *
 * @param attributeDefinition
 * @returns The decorated property
 */
export function blockAttribute(attributeDefinition: BuildingBlockPropertyDefinition): PropertyDecorator {
	return function (target: BuildingBlockBase, propertyKey: string | Symbol, propertyDescriptor: AccessorDescriptor<unknown>) {
		const metadata = (target.constructor as typeof BuildingBlockBase).metadata;
		if (attributeDefinition.defaultValue === undefined) {
			// If there is no defaultValue we can take the value from the initializer (natural way of defining defaults)
			attributeDefinition.defaultValue = propertyDescriptor.initializer?.();
		}
		delete propertyDescriptor.initializer;
		if (metadata.properties[propertyKey.toString()] === undefined) {
			metadata.properties[propertyKey.toString()] = attributeDefinition;
		}

		return propertyDescriptor;
	} as unknown as PropertyDecorator; // Needed to make TS happy with those decorators;
}

/**
 * Decorator for building blocks.
 *
 * This is an alias for @blockAttribute({ type: "function" }).
 *
 * @returns The decorated property
 */
export function blockEvent(): PropertyDecorator {
	return blockAttribute({ type: "function" });
}

/**
 * Indicates that the property shall be declared as an xml aggregation that can be used from the outside of the building block.
 *
 * @param aggregationDefinition
 * @returns The decorated property
 */
export function blockAggregation(aggregationDefinition: BuildingBlockAggregationDefinition): PropertyDecorator {
	return function (target: BuildingBlockBase, propertyKey: string, propertyDescriptor: AccessorDescriptor<unknown>) {
		const metadata = (target.constructor as typeof BuildingBlockBase).metadata;
		delete propertyDescriptor.initializer;
		if (metadata.aggregations[propertyKey] === undefined) {
			metadata.aggregations[propertyKey] = aggregationDefinition;
		}
		if (aggregationDefinition.isDefault === true) {
			metadata.defaultAggregation = propertyKey;
		}

		return propertyDescriptor;
	} as unknown as PropertyDecorator;
}

export function defineBuildingBlock(oBuildingBlockDefinition: BuildingBlockDefinition): ClassDecorator {
	return function (classDefinition: Partial<typeof BuildingBlockBase>) {
		const metadata = classDefinition.metadata!;
		metadata.namespace = oBuildingBlockDefinition.namespace;
		metadata.publicNamespace = oBuildingBlockDefinition.publicNamespace;
		metadata.name = oBuildingBlockDefinition.name;
		metadata.xmlTag = oBuildingBlockDefinition.xmlTag;
		metadata.fragment = oBuildingBlockDefinition.fragment;
		metadata.designtime = oBuildingBlockDefinition.designtime;
		metadata.isOpen = oBuildingBlockDefinition.isOpen;
	};
}
