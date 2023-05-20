import { defineUI5Class } from "sap/fe/core/helpers/ClassSupport";
import Value from "sap/fe/macros/filter/type/Value";
import type SimpleType from "sap/ui/model/SimpleType";

/**
 * Type used to extend SimpleType with hidden fields
 *
 * @typedef AugmentedSimpleType
 */
type AugmentedSimpleType = SimpleType & {
	oFormatOptions?: any;
};

/**
 * Handle format/parse of range filter values.
 */
// eslint-disable-next-line new-cap
@defineUI5Class("sap.fe.macros.filter.type.Range")
export default class Range extends Value {
	/**
	 * Returns the default operator name for range filter values ("BT").
	 *
	 * @returns The default operator name
	 * @protected
	 */
	getDefaultOperatorName(): string {
		return "BT";
	}

	/**
	 * Returns the unchanged values.
	 *
	 * @param values Input condition value
	 * @returns Unchanged input condition value
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
		let results = super.formatValue(internalValue, externalValueType);

		if (!results) {
			const minValue = (this as AugmentedSimpleType).oFormatOptions.min || Number.MIN_SAFE_INTEGER,
				maxValue = (this as AugmentedSimpleType).oFormatOptions.max || Number.MAX_SAFE_INTEGER;

			results = [minValue, maxValue];
		}

		return results;
	}
}
