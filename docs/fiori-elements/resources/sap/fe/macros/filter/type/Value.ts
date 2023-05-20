import Log from "sap/base/Log";
import { defineUI5Class } from "sap/fe/core/helpers/ClassSupport";
import type { ConditionObject } from "sap/ui/mdc/condition/Condition";
import FilterOperatorUtil from "sap/ui/mdc/condition/FilterOperatorUtil";
import Operator from "sap/ui/mdc/condition/Operator";
import FieldDisplay from "sap/ui/mdc/enum/FieldDisplay";
import type Filter from "sap/ui/model/Filter";
import SimpleType from "sap/ui/model/SimpleType";
import type Type from "sap/ui/model/Type";
import BooleanType from "sap/ui/model/type/Boolean";
import DateType from "sap/ui/model/type/Date";
import FloatType from "sap/ui/model/type/Float";
import IntegerType from "sap/ui/model/type/Integer";
import StringType from "sap/ui/model/type/String";

/**
 * Type used to extend the MDC operator type with hidden fields
 *
 * @typedef AugmentedOperator
 */
type AugmentedOperator = Operator & {
	name: string;
	valueTypes: string[];
};

/**
 * Handle format/parse single filter value.
 */
@defineUI5Class("sap.fe.macros.filter.type.Value")
export default class Value extends SimpleType {
	private static readonly INTERNAL_VALUE_TYPE = "string";

	private static readonly OPERATOR_VALUE_TYPE_STATIC = "static";

	protected operator: AugmentedOperator;

	/**
	 * Creates a new value type instance with the given parameters.
	 *
	 * @param formatOptions Format options for this value type
	 * @param formatOptions.operator The name of a (possibly custom) operator to use
	 * @param constraints Constraints for this value type
	 * @protected
	 */
	constructor(formatOptions: { operator?: string }, constraints: object) {
		super(formatOptions, constraints);
		const operatorName = formatOptions?.operator || this.getDefaultOperatorName();
		this.operator = FilterOperatorUtil.getOperator(operatorName) as AugmentedOperator;

		if (!this.operator && operatorName.includes(".")) {
			this._registerCustomOperator(operatorName);
		}
	}

	/**
	 * Registers a custom binding operator.
	 *
	 * @param operatorName The binding operator name
	 * @private
	 */
	private _registerCustomOperator(operatorName: string): void {
		const handlerFileName = operatorName.substring(0, operatorName.lastIndexOf(".")).replace(/\./g, "/"),
			methodName = operatorName.substring(operatorName.lastIndexOf(".") + 1);

		sap.ui.require([handlerFileName], (customOperatorHandler: { [key: string]: (value: string | string[]) => Filter }) => {
			if (!customOperatorHandler) {
				return;
			}

			this.operator = new Operator({
				filterOperator: "",
				tokenFormat: "",
				name: operatorName,
				valueTypes: ["self"],
				tokenParse: "^(.*)$",
				format: (value: ConditionObject): string | string[] => {
					return this.formatConditionValues(value.values as string[]);
				},
				parse: function (text: ConditionObject, type: Type, displayFormat: FieldDisplay, defaultOperator: boolean) {
					if (typeof text === "object") {
						if (text.operator !== operatorName) {
							throw Error("not matching operator");
						}
						return text.values;
					}
					return Operator.prototype.parse.apply(this, [text, type, displayFormat, defaultOperator]);
				},
				getModelFilter: (condition: ConditionObject): Filter => {
					return customOperatorHandler[methodName].call(customOperatorHandler, this.formatConditionValues(condition.values));
				}
			}) as AugmentedOperator;
			FilterOperatorUtil.addOperator(this.operator);
		});
	}

	/**
	 * Returns whether the specified operator is a multi-value operator.
	 *
	 * @param operator The binding operator
	 * @returns `true`, if multi-value operator (`false` otherwise)
	 * @private
	 */
	private _isMultiValueOperator(operator: AugmentedOperator): boolean {
		return (
			operator.valueTypes.filter(function (valueType: string) {
				return !!valueType && valueType !== Value.OPERATOR_VALUE_TYPE_STATIC;
			}).length > 1
		);
	}

	/**
	 * Returns whether the specified operator is a custom operator.
	 *
	 * @returns `true`, if custom operator (`false` otherwise)
	 * @private
	 */
	private hasCustomOperator(): boolean {
		return this.operator.name.includes(".");
	}

	/**
	 * Parses the internal string value to the external value of type 'externalValueType'.
	 *
	 * @param value The internal string value to be parsed
	 * @param externalValueType The external value type, e.g. int, float[], string, etc.
	 * @returns The parsed value
	 * @private
	 */
	private _stringToExternal(value: string | string[], externalValueType: string | undefined): string[] {
		let externalValue;
		const externalType = this._getTypeInstance(externalValueType);

		if (externalValueType && Value._isArrayType(externalValueType)) {
			if (!Array.isArray(value)) {
				value = [value];
			}
			externalValue = value.map((valueElement: string) => {
				return externalType ? externalType.parseValue(valueElement, Value.INTERNAL_VALUE_TYPE) : valueElement;
			});
		} else {
			externalValue = externalType ? externalType.parseValue(value as string, Value.INTERNAL_VALUE_TYPE) : value;
		}

		return externalValue;
	}

	/**
	 * Returns whether target type is an array.
	 *
	 * @param targetType The target type name
	 * @returns `true`, if array type (`false` otherwise)
	 * @private
	 */
	private static _isArrayType(targetType: string): boolean {
		if (!targetType) {
			return false;
		}
		return targetType === "array" || targetType.endsWith("[]");
	}

	/**
	 * Returns the external value formatted as the internal string value.
	 *
	 * @param externalValue The value to be parsed
	 * @param externalValueType The external value type, e.g. int, float[], string, etc.
	 * @returns The formatted value
	 * @private
	 */
	private _externalToString(externalValue: string | string[], externalValueType: string | undefined): string {
		let value;
		const externalType = this._getTypeInstance(externalValueType);

		if (externalValueType && Value._isArrayType(externalValueType)) {
			if (!Array.isArray(externalValue)) {
				externalValue = [externalValue];
			}
			value = externalValue.map((valueElement: string) => {
				return externalType ? externalType.formatValue(valueElement, Value.INTERNAL_VALUE_TYPE) : valueElement;
			});
		} else {
			value = externalType ? externalType.formatValue(externalValue as string, Value.INTERNAL_VALUE_TYPE) : externalValue;
		}

		return value;
	}

	/**
	 * Retrieves the default type instance for given type name.
	 *
	 * @param typeName The name of the type
	 * @returns The type instance
	 * @private
	 */
	private _getTypeInstance(typeName: string | undefined): SimpleType {
		typeName = this.getElementTypeName(typeName) || typeName;

		switch (typeName) {
			case "string":
				return new StringType();
			case "number":
			case "int":
				return new IntegerType();
			case "float":
				return new FloatType();
			case "date":
				return new DateType();
			case "boolean":
				return new BooleanType();
			default:
				Log.error("Unexpected filter type");
				throw new Error("Unexpected filter type");
		}
	}

	/**
	 * Returns the default operator name ("EQ").
	 * Should be overridden on demand.
	 *
	 * @returns The default operator name
	 * @protected
	 */
	getDefaultOperatorName(): string {
		return (FilterOperatorUtil.getEQOperator() as AugmentedOperator).name;
	}

	/**
	 * Returns first value of array or input.
	 *
	 * @param values Input condition value
	 * @returns Unchanged input condition value
	 * @protected
	 */
	formatConditionValues(values: string[] | string): string[] | string {
		return Array.isArray(values) && values.length ? values[0] : (values as string);
	}

	/**
	 * Returns the element type name.
	 *
	 * @param typeName The actual type name
	 * @returns The type of its elements
	 * @protected
	 */
	getElementTypeName(typeName: string | undefined): string | undefined {
		if (typeName?.endsWith("[]")) {
			return typeName.substring(0, typeName.length - 2);
		}
		return undefined;
	}

	/**
	 * Returns the string value parsed to the external value type 'this.operator'.
	 *
	 * @param internalValue The internal string value to be formatted
	 * @param externalValueType The external value type, e.g. int, float[], string, etc.
	 * @returns The formatted value
	 * @protected
	 */
	formatValue(internalValue: any | undefined, externalValueType: string | undefined): any {
		if (!internalValue) {
			return undefined;
		}
		const isMultiValueOperator = this._isMultiValueOperator(this.operator),
			internalType = this._getTypeInstance(Value.INTERNAL_VALUE_TYPE);

		//  from internal model string with operator
		const values = this.operator.parse(internalValue || "", internalType, FieldDisplay.Value, false);
		const value = !isMultiValueOperator && Array.isArray(values) ? values[0] : values;

		return this._stringToExternal(value, externalValueType); // The value bound to a custom filter
	}

	/**
	 * Returns the value parsed to the internal string value.
	 *
	 * @param externalValue The value to be parsed
	 * @param externalValueType The external value type, e.g. int, float[], string, etc.
	 * @returns The parsed value
	 * @protected
	 */
	parseValue(externalValue: any | undefined, externalValueType: string | undefined): any {
		if (!externalValue) {
			return undefined;
		}
		const isMultiValueOperator = this._isMultiValueOperator(this.operator),
			externalType = this._getTypeInstance(externalValueType);

		const value = this._externalToString(externalValue, externalValueType);

		// Format to internal model string with operator
		const values = isMultiValueOperator ? value : [value];

		if (this.hasCustomOperator()) {
			// Return a complex object while parsing the bound value in sap.ui.model.PropertyBinding.js#_externalToRaw()
			return {
				operator: this.operator.name,
				values: [this.operator.format({ values: values } as ConditionObject, externalType)],
				validated: undefined
			};
		}
		// Return a simple string value to be stored in the internal 'filterValues' model
		return this.operator.format({ values: values } as ConditionObject, externalType);
	}

	/**
	 * Validates whether the given value in model representation is valid.
	 *
	 * @param externalValue The value to be validated
	 * @protected
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	validateValue(externalValue: unknown): void {
		/* Do Nothing */
	}
}
