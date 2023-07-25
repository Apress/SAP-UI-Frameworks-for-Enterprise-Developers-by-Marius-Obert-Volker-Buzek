import Log from "sap/base/Log";
import type Control from "sap/ui/core/Control";
import EdmBoolean from "sap/ui/model/odata/type/Boolean";
import EdmDate from "sap/ui/model/odata/type/Date";
import DateTimeOffset from "sap/ui/model/odata/type/DateTimeOffset";
import Decimal from "sap/ui/model/odata/type/Decimal";
import Guid from "sap/ui/model/odata/type/Guid";
import Int32 from "sap/ui/model/odata/type/Int32";
import type ODataType from "sap/ui/model/odata/type/ODataType";
import EdmString from "sap/ui/model/odata/type/String";

/**
 * Attribute type.
 *
 * Situation Handling supports a subset of the EDM types.
 */
type InstanceAttributeEdmType =
	| "EDM.STRING"
	| "EDM.DATE"
	| "EDM.DATETIME"
	| "EDM.DATETIMEOFFSET"
	| "EDM.INT32"
	| "EDM.DECIMAL"
	| "EDM.GUID"
	| "EDM.BOOLEAN";

/**
 * Attribute.
 */
export type InstanceAttribute = {
	SitnInstceAttribSource: string;
	SitnInstceAttribName: string;
	SitnInstceAttribEntityType: InstanceAttributeEdmType;
	_InstanceAttributeValue?: {
		SitnInstceAttribValue: string;
	}[];
};

const types: Partial<Record<InstanceAttributeEdmType, ODataType>> = {};

function createEdmType(attributeEDMType: InstanceAttributeEdmType): ODataType {
	switch (attributeEDMType) {
		case "EDM.BOOLEAN":
			return new EdmBoolean();
		case "EDM.DATE":
		case "EDM.DATETIME":
			return new EdmDate();
		case "EDM.DATETIMEOFFSET":
			return new DateTimeOffset();
		case "EDM.DECIMAL":
			return new Decimal();
		case "EDM.GUID":
			return new Guid();
		case "EDM.INT32":
			return new Int32();
		case "EDM.STRING":
			return new EdmString();
		default:
			return createEdmType("EDM.STRING");
	}
}

function parseAttributeValue(type: InstanceAttributeEdmType, value: string, oDataType: ODataType) {
	switch (type) {
		case "EDM.STRING":
			return value;
		case "EDM.DATE":
		case "EDM.DATETIME":
		case "EDM.DATETIMEOFFSET":
			return oDataType.parseValue(value, "string");
		case "EDM.INT32":
			return parseInt(value, 10);
		case "EDM.DECIMAL":
			return parseFloat(value);
		case "EDM.GUID":
			return value;
		case "EDM.BOOLEAN":
			// ABAP style: 'X' = true, '' = false
			return value === "X";
		default:
			return value;
	}
}

function getType(attributeEDMType: InstanceAttributeEdmType): ODataType {
	let type = types[attributeEDMType];
	if (!type) {
		type = createEdmType(attributeEDMType);
		types[attributeEDMType] = type;
	}
	return type;
}

export function formatter(this: Control, key: string | undefined | null, template: string | undefined | null) {
	const context = this.getBindingContext();
	if (key === undefined || key === null || template === undefined || template === null || !context) {
		return "";
	}

	const attributes = context.getObject("_InstanceAttribute") as InstanceAttribute[] | null | undefined;
	if (attributes === undefined || attributes === null || attributes.length === 0) {
		return template;
	}

	const placeholderReplacer = (match: string, attributeSource: string, attributeName: string) => {
		const source = parseInt(attributeSource, 10).toString(); // remove leading zeros from the attribute source

		const resolvedAttribute: InstanceAttribute | undefined = attributes.find(
			(attribute) => attribute.SitnInstceAttribSource === source && attribute.SitnInstceAttribName === attributeName
		);

		if (resolvedAttribute === undefined) {
			Log.error(`Failed to resolve attribute ${attributeSource}.${attributeName}`);
			return "";
		}

		if (!resolvedAttribute._InstanceAttributeValue) {
			Log.error(`Failed to resolve a value for attribute ${attributeSource}.${attributeName}`);
			return "";
		}

		const resolvedAttributeType = getType(resolvedAttribute.SitnInstceAttribEntityType);

		// Format the value(s) - if there are multiple, concatenate them
		return resolvedAttribute._InstanceAttributeValue
			.map((value) => {
				const parsedValue = parseAttributeValue(
					resolvedAttribute.SitnInstceAttribEntityType,
					value.SitnInstceAttribValue,
					resolvedAttributeType
				);
				return resolvedAttributeType.formatValue(parsedValue, "string");
			})
			.join(", ");
	};

	// Replace placeholders for attribute values.
	// Their format is {<digitsequence>.<something>} - e.g. {01.PURCHASECONTRACT}
	return template.replace(/\{(\d+)\.([^}]+)}/g, placeholderReplacer);
}

export function bindText(textTemplatePropertyPath: string) {
	return {
		parts: [{ path: "SitnInstceKey" }, { path: `_InstanceText/${textTemplatePropertyPath}` }],
		formatter: formatter
	};
}
