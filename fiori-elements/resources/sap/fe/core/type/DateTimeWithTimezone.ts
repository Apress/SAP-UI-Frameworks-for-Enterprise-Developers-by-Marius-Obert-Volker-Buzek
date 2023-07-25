import { defineUI5Class } from "sap/fe/core/helpers/ClassSupport";
import _DateTimeWithTimezone from "sap/ui/model/odata/type/DateTimeWithTimezone";

@defineUI5Class("sap.fe.core.type.DateTimeWithTimezone")
class DateTimeWithTimezone extends _DateTimeWithTimezone {
	private bShowTimezoneForEmptyValues: boolean;

	constructor(oFormatOptions?: any, oConstraints?: any) {
		super(oFormatOptions, oConstraints);
		this.bShowTimezoneForEmptyValues = oFormatOptions?.showTimezoneForEmptyValues ?? true;
	}

	formatValue(aValues: any[], sTargetType: string) {
		const oTimestamp = aValues && aValues[0];
		if (
			oTimestamp === undefined || // data is not yet available
			// if time zone is not shown falsy timestamps cannot be formatted -> return null
			(!oTimestamp && !this.bShowTimezoneForEmptyValues)
		) {
			return null;
		}
		return super.formatValue(aValues, sTargetType);
	}
}
export default DateTimeWithTimezone;
