import { defineUI5Class } from "sap/fe/core/helpers/ClassSupport";
import Value from "sap/fe/macros/filter/type/Value";
import type { ConditionObject } from "sap/ui/mdc/condition/Condition";

/**
 * Handle format/parse of multi value filters.
 */
@defineUI5Class("sap.fe.macros.filter.type.MultiValue")
export default class MultiValue extends Value {
	/**
	 * Returns the unchanged values.
	 *
	 * @param values Input condition value
	 * @returns First value of array or input
	 * @protected
	 */
	formatConditionValues(values: string[] | string): string[] | string {
		return values;
	}

	/**
	 * Returns the string value parsed to the external value type.
	 *
	 * @param internalValue The internal string value to be formatted
	 * @param externalValueType The external value type, e.g. int, float[], string, etc.
	 * @returns The formatted value
	 * @protected
	 */
	formatValue(internalValue: any | undefined, externalValueType: string | undefined): any {
		let result = internalValue;

		if (typeof result === "string") {
			result = result.split(",");
		}

		if (Array.isArray(result)) {
			result = result
				.map((value: string) => super.formatValue(value, this.getElementTypeName(externalValueType)))
				.filter((value: string) => value !== undefined);
		}

		return result || [];
	}

	/**
	 * Returns the value parsed to the internal string value.
	 *
	 * @param externalValue The value to be parsed
	 * @param externalValueType The external value type, e.g. int, float[], string, etc.
	 * @returns The parsed value
	 * @protected
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	parseValue(externalValue: any | undefined, externalValueType: string | undefined): any {
		if (!externalValue) {
			externalValue = [];
		}
		return externalValue.map((value: any) => {
			if (value === undefined) {
				value = [];
			} else if (!Array.isArray(value)) {
				value = [value];
			}
			return this.operator.format({ values: value } as ConditionObject);
		});
	}
}
