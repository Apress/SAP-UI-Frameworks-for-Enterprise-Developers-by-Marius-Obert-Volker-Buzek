import ManagedObject from "sap/ui/base/ManagedObject";

export type AnyType = ManagedObject & {
	mBindingInfos: object;
	getAny(): any;
	getAnyText(): any;
	setAny(value: any): void;
	setAnyText(value: any): void;
	getBindingInfo(property: string): object;
	extend(sName: string, sExtension: any): AnyType;
};

/**
 * @class
 * A custom element to evaluate the value of Binding.
 * @name sap.fe.core.controls.Any
 * @hideconstructor
 */
const Any = ManagedObject.extend("sap.fe.core.controls.Any", {
	metadata: {
		properties: {
			any: "any",
			anyText: "string"
		}
	},
	updateProperty: function (this: AnyType, sName: string) {
		// Avoid Promise processing in ManagedObject and set Promise as value directly
		if (sName === "any") {
			this.setAny((this.getBindingInfo(sName) as any).binding.getExternalValue());
		} else {
			this.setAnyText((this.getBindingInfo(sName) as any).binding.getExternalValue());
		}
	}
});

export default Any as any;
