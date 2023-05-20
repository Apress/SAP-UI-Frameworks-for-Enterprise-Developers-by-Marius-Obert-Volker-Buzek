import merge from "sap/base/util/merge";
import ObjectPath from "sap/base/util/ObjectPath";
import uid from "sap/base/util/uid";
import type UI5Event from "sap/ui/base/Event";
import Metadata from "sap/ui/base/Metadata";
import type ControllerExtension from "sap/ui/core/mvc/ControllerExtension";
import ControllerMetadata from "sap/ui/core/mvc/ControllerMetadata";
import type OverrideExecution from "sap/ui/core/mvc/OverrideExecution";

type OverrideDefinition = Record<string, Function>;
type UI5ControllerMethodDefinition = {
	overrideExecution?: OverrideExecution;
	public?: boolean;
	final?: boolean;
};
type UI5PropertyMetadata = {
	type: string;
	required?: boolean;
	group?: string;
	defaultValue?: any;
	expectedAnnotations?: string[];
	expectedTypes?: string[];
	allowedValues?: string[];
};
type UI5AggregationMetadata = {
	type: string;
	multiple?: boolean;
	isDefault?: boolean;
	singularName?: string;
	visibility?: string;
};
type UI5AssociationMetadata = {
	type: string;
	multiple?: boolean;
	singularName?: string;
};
type UI5ControlMetadataDefinition = {
	defaultAggregation?: string;
	controllerExtensions: Record<string, typeof ControllerExtension | Function>;
	properties: Record<string, UI5PropertyMetadata>;
	aggregations: Record<string, UI5AggregationMetadata>;
	associations: Record<string, UI5AssociationMetadata>;
	methods: Record<string, UI5ControllerMethodDefinition>;
	events: Record<string, {}>;
	interfaces: string[];
};
type UI5Controller = {
	override?: { extension?: Record<string, OverrideDefinition> } & {
		[k: string]: Function;
	};
	metadata?: UI5ControlMetadataDefinition;
};

type UI5Control = {
	metadata?: UI5ControlMetadataDefinition;
};

type UI5APIControl = UI5Control & {
	getAPI(event: UI5Event): UI5APIControl;
	[k: string]: Function;
};

type ControlPropertyNames<T> = {
	[K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
export type PropertiesOf<T> = Partial<Pick<T, ControlPropertyNames<T>>>;
export type StrictPropertiesOf<T> = Pick<T, ControlPropertyNames<T>>;
export type EnhanceWithUI5<T> = {
	new (props: PropertiesOf<T>): EnhanceWithUI5<T>;
	new (sId: string, props: PropertiesOf<T>): EnhanceWithUI5<T>;
} & T & {
		// Add all the getXXX method, might add too much as I'm not filtering on actual properties...
		[P in keyof T as `get${Capitalize<string & P>}`]: () => T[P];
	};
const ensureMetadata = function (target: UI5Controller) {
	target.metadata = merge(
		{
			controllerExtensions: {},
			properties: {},
			aggregations: {},
			associations: {},
			methods: {},
			events: {},
			interfaces: []
		},
		target.metadata || {}
	) as UI5ControlMetadataDefinition;
	return target.metadata;
};

/* #region CONTROLLER EXTENSIONS */

/**
 * Defines that the following method is an override for the method name with the same name in the specific controller extension or base implementation.
 *
 * @param extensionName The name of the extension that will be overridden
 * @returns The decorated method
 */
export function methodOverride(extensionName?: string): MethodDecorator {
	return function (target: UI5Controller, propertyKey) {
		if (!target.override) {
			target.override = {};
		}
		let currentTarget = target.override;
		if (extensionName) {
			if (!currentTarget.extension) {
				currentTarget.extension = {};
			}
			if (!currentTarget.extension[extensionName]) {
				currentTarget.extension[extensionName] = {};
			}
			currentTarget = currentTarget.extension[extensionName];
		}
		currentTarget[propertyKey.toString()] = (target as any)[propertyKey.toString()];
	};
}

/**
 * Defines that the method can be extended by other controller extension based on the defined overrideExecutionType.
 *
 * @param overrideExecutionType The OverrideExecution defining when the override should run (Before / After / Instead)
 * @returns The decorated method
 */
export function extensible(overrideExecutionType?: OverrideExecution): MethodDecorator {
	return function (target: UI5Controller, propertyKey) {
		const metadata = ensureMetadata(target);
		if (!metadata.methods[propertyKey.toString()]) {
			metadata.methods[propertyKey.toString()] = {};
		}
		metadata.methods[propertyKey.toString()].overrideExecution = overrideExecutionType;
	};
}

/**
 * Defines that the method will be publicly available for controller extension usage.
 *
 * @returns The decorated method
 */
export function publicExtension(): MethodDecorator {
	return function (target: UI5Controller, propertyKey, descriptor): void {
		const metadata = ensureMetadata(target);
		descriptor.enumerable = true;
		if (!metadata.methods[propertyKey.toString()]) {
			metadata.methods[propertyKey.toString()] = {};
		}
		metadata.methods[propertyKey.toString()].public = true;
	};
}
/**
 * Defines that the method will be only available for internal usage of the controller extension.
 *
 * @returns The decorated method
 */
export function privateExtension(): MethodDecorator {
	return function (target: UI5Controller, propertyKey, descriptor) {
		const metadata = ensureMetadata(target);
		descriptor.enumerable = true;
		if (!metadata.methods[propertyKey.toString()]) {
			metadata.methods[propertyKey.toString()] = {};
		}
		metadata.methods[propertyKey.toString()].public = false;
	};
}
/**
 * Defines that the method cannot be further extended by other controller extension.
 *
 * @returns The decorated method
 */
export function finalExtension(): MethodDecorator {
	return function (target: UI5Controller, propertyKey, descriptor) {
		const metadata = ensureMetadata(target);
		descriptor.enumerable = true;
		if (!metadata.methods[propertyKey.toString()]) {
			metadata.methods[propertyKey.toString()] = {};
		}
		metadata.methods[propertyKey.toString()].final = true;
	};
}

/**
 * Defines that we are going to use instantiate a controller extension under the following variable name.
 *
 * @param extensionClass The controller extension that will be instantiated
 * @returns The decorated property
 */
export function usingExtension(extensionClass: typeof ControllerExtension | Function): PropertyDecorator {
	return function (target: UI5Controller, propertyKey: string, propertyDescriptor: TypedPropertyDescriptor<any>) {
		const metadata = ensureMetadata(target);
		delete (propertyDescriptor as any).initializer;
		metadata.controllerExtensions[propertyKey.toString()] = extensionClass;
		return propertyDescriptor;
	} as any; // This is technically an accessor decorator, but somehow the compiler doesn't like it if I declare it as such.
}

/* #endregion */

/* #region CONTROL */
/**
 * Indicates that the property shall be declared as an event on the control metadata.
 *
 * @returns The decorated property
 */
export function event(): PropertyDecorator {
	return function (target: UI5Control, eventKey) {
		const metadata = ensureMetadata(target);
		if (!metadata.events[eventKey.toString()]) {
			metadata.events[eventKey.toString()] = {};
		}
	};
}

/**
 * Defines the following property in the control metatada.
 *
 * @param attributeDefinition The property definition
 * @returns The decorated property.
 */
export function property(attributeDefinition: UI5PropertyMetadata): PropertyDecorator {
	return function (target: UI5Control, propertyKey: string, propertyDescriptor: TypedPropertyDescriptor<any>) {
		const metadata = ensureMetadata(target);
		if (!metadata.properties[propertyKey]) {
			metadata.properties[propertyKey] = attributeDefinition;
		}
		delete propertyDescriptor.writable;
		delete (propertyDescriptor as any).initializer;

		return propertyDescriptor;
	} as any; // This is technically an accessor decorator, but somehow the compiler doesn't like it if i declare it as such.;
}
/**
 * Defines and configure the following aggregation in the control metatada.
 *
 * @param aggregationDefinition The aggregation definition
 * @returns The decorated property.
 */
export function aggregation(aggregationDefinition: UI5AggregationMetadata): PropertyDecorator {
	return function (target: UI5Control, propertyKey: string, propertyDescriptor: TypedPropertyDescriptor<any>) {
		const metadata = ensureMetadata(target);
		if (aggregationDefinition.multiple === undefined) {
			// UI5 defaults this to true but this is just weird...
			aggregationDefinition.multiple = false;
		}
		if (!metadata.aggregations[propertyKey]) {
			metadata.aggregations[propertyKey] = aggregationDefinition;
		}
		if (aggregationDefinition.isDefault) {
			metadata.defaultAggregation = propertyKey;
		}
		delete propertyDescriptor.writable;
		delete (propertyDescriptor as any).initializer;

		return propertyDescriptor;
	} as any; // This is technically an accessor decorator, but somehow the compiler doesn't like it if i declare it as such.;
}

/**
 * Defines and configure the following association in the control metatada.
 *
 * @param ui5AssociationMetadata The definition of the association.
 * @returns The decorated property
 */
export function association(ui5AssociationMetadata: UI5AssociationMetadata): PropertyDecorator {
	return function (target: UI5Control, propertyKey: string, propertyDescriptor: TypedPropertyDescriptor<any>) {
		const metadata = ensureMetadata(target);
		if (!metadata.associations[propertyKey]) {
			metadata.associations[propertyKey] = ui5AssociationMetadata;
		}
		delete propertyDescriptor.writable;
		delete (propertyDescriptor as any).initializer;

		return propertyDescriptor;
	} as any; // This is technically an accessor decorator, but somehow the compiler doesn't like it if i declare it as such.;
}

/**
 * Defines in the metadata that this control implements a specific interface.
 *
 * @param interfaceName The name of the implemented interface
 * @returns The decorated method
 */
export function implementInterface(interfaceName: string): PropertyDecorator {
	return function (target: UI5Control) {
		const metadata = ensureMetadata(target);

		metadata.interfaces.push(interfaceName);
	};
}

/**
 * Indicates that the following method should also be exposed statically so we can call it from XML.
 *
 * @returns The decorated method
 */
export function xmlEventHandler(): MethodDecorator {
	return function (target: UI5Control, propertykey) {
		const currentConstructor: UI5APIControl = target.constructor as unknown as UI5APIControl;
		currentConstructor[propertykey.toString()] = function (...args: any[]) {
			if (args && args.length) {
				const currentTarget = currentConstructor.getAPI(args[0] as UI5Event);
				currentTarget?.[propertykey.toString()](...args);
			}
		};
	};
}

/**
 * Indicates that the following class should define a UI5 control of the specified name.
 *
 * @param sTarget The fully qualified name of the UI5 class
 * @param metadataDefinition Inline metadata definition
 * @class
 */
export function defineUI5Class(sTarget: string, metadataDefinition?: any): ClassDecorator {
	return function (constructor: Function) {
		if (!constructor.prototype.metadata) {
			constructor.prototype.metadata = {};
		}
		if (metadataDefinition) {
			for (const key in metadataDefinition) {
				constructor.prototype.metadata[key] = metadataDefinition[key as keyof UI5ControlMetadataDefinition];
			}
		}
		return registerUI5Metadata(constructor, sTarget, constructor.prototype);
	};
}

export function createReference<T>() {
	return {
		current: undefined as any as T,
		setCurrent: function (oControlInstance: T): void {
			this.current = oControlInstance;
		}
	};
}
/**
 * Defines that the following object will hold a reference to a control through jsx templating.
 *
 * @returns The decorated property.
 */
export function defineReference(): PropertyDecorator {
	return function (target: UI5Control, propertyKey: string, propertyDescriptor: TypedPropertyDescriptor<any>) {
		delete propertyDescriptor.writable;
		delete (propertyDescriptor as any).initializer;
		(propertyDescriptor as any).initializer = createReference;

		return propertyDescriptor;
	} as any; // This is technically an accessor decorator, but somehow the compiler doesn't like it if i declare it as such.;
}

/**
 * Internal heavy lifting that will take care of creating the class property for ui5 to use.
 *
 * @param clazz The class prototype
 * @param name The name of the class to create
 * @param inObj The metadata object
 * @returns The metadata class
 */
function registerUI5Metadata(clazz: any, name: string, inObj: any): any {
	if (clazz.getMetadata && clazz.getMetadata().isA("sap.ui.core.mvc.ControllerExtension")) {
		Object.getOwnPropertyNames(inObj).forEach((objName) => {
			const descriptor = Object.getOwnPropertyDescriptor(inObj, objName);
			if (descriptor && !descriptor.enumerable) {
				descriptor.enumerable = true;
				//		Log.error(`Property ${objName} from ${name} should be decorated as public`);
			}
		});
	}
	const obj: any = {};
	obj.metadata = inObj.metadata || {};
	obj.override = inObj.override;
	obj.constructor = clazz;
	obj.metadata.baseType = Object.getPrototypeOf(clazz.prototype).getMetadata().getName();

	if (clazz?.getMetadata()?.getStereotype() === "control") {
		const rendererDefinition = inObj.renderer || clazz.renderer || clazz.render;
		obj.renderer = { apiVersion: 2 };
		if (typeof rendererDefinition === "function") {
			obj.renderer.render = rendererDefinition;
		} else if (rendererDefinition != undefined) {
			obj.renderer = rendererDefinition;
		}
	}
	obj.metadata.interfaces = inObj.metadata?.interfaces || clazz.metadata?.interfaces;
	Object.keys(clazz.prototype).forEach((key) => {
		if (key !== "metadata") {
			try {
				obj[key] = clazz.prototype[key];
			} catch (e) {
				//console.log(e);
			}
		}
	});
	if (obj.metadata?.controllerExtensions && Object.keys(obj.metadata.controllerExtensions).length > 0) {
		for (const cExtName in obj.metadata.controllerExtensions) {
			obj[cExtName] = obj.metadata.controllerExtensions[cExtName];
		}
	}
	const output = clazz.extend(name, obj);
	const fnInit = output.prototype.init;
	output.prototype.init = function (...args: any[]) {
		if (fnInit) {
			fnInit.apply(this, args);
		}
		this.metadata = obj.metadata;

		if (obj.metadata.properties) {
			const aPropertyKeys = Object.keys(obj.metadata.properties);
			aPropertyKeys.forEach((propertyKey) => {
				Object.defineProperty(this, propertyKey, {
					configurable: true,
					set: (v: any) => {
						return this.setProperty(propertyKey, v);
					},
					get: () => {
						return this.getProperty(propertyKey);
					}
				});
			});
			const aAggregationKeys = Object.keys(obj.metadata.aggregations);
			aAggregationKeys.forEach((aggregationKey) => {
				Object.defineProperty(this, aggregationKey, {
					configurable: true,
					set: (v: any) => {
						return this.setAggregation(aggregationKey, v);
					},
					get: () => {
						const aggregationContent = this.getAggregation(aggregationKey);
						if (obj.metadata.aggregations[aggregationKey].multiple) {
							return aggregationContent || [];
						} else {
							return aggregationContent;
						}
					}
				});
			});
			const aAssociationKeys = Object.keys(obj.metadata.associations);
			aAssociationKeys.forEach((associationKey) => {
				Object.defineProperty(this, associationKey, {
					configurable: true,
					set: (v: any) => {
						return this.setAssociation(associationKey, v);
					},
					get: () => {
						const aggregationContent = this.getAssociation(associationKey);
						if (obj.metadata.associations[associationKey].multiple) {
							return aggregationContent || [];
						} else {
							return aggregationContent;
						}
					}
				});
			});
		}
	};
	clazz.override = function (oExtension: any) {
		const pol = {};
		(pol as any).constructor = function (...args: any[]) {
			return clazz.apply(this, args as any);
		};
		const oClass = (Metadata as any).createClass(clazz, `anonymousExtension~${uid()}`, pol, ControllerMetadata);
		oClass.getMetadata()._staticOverride = oExtension;
		oClass.getMetadata()._override = clazz.getMetadata()._override;
		return oClass;
	};

	ObjectPath.set(name, output);
	return output;
}
