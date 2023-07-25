import { EDM_TYPE_MAPPING } from "sap/fe/core/helpers/BindingToolkit";
import merge from "sap/base/util/merge";
import BaseType from "sap/ui/mdc/enum/BaseType";
import type { Constraints, FormatOptions } from "sap/ui/mdc/odata/TypeUtil";
import ODataTypeUtil from "sap/ui/mdc/odata/TypeUtil";
import type SimpleType from "sap/ui/model/SimpleType";

const ODataV4TypeUtil = Object.assign({}, ODataTypeUtil);
ODataV4TypeUtil.getBaseType = function (type: string, formatOptions?: FormatOptions, constraints?: Constraints): BaseType {
	switch (type) {
		case "sap.ui.model.odata.type.Date":
			return BaseType.Date;
		case "sap.ui.model.odata.type.TimeOfDay":
			return BaseType.Time;
		case "sap.ui.model.odata.type.Unit":
		case "sap.ui.model.odata.type.Currency":
			if (
				!formatOptions ||
				((!formatOptions.hasOwnProperty("showMeasure") || formatOptions.showMeasure) &&
					(!formatOptions.hasOwnProperty("showNumber") || formatOptions.showNumber))
			) {
				return BaseType.Unit;
			} else if (!formatOptions.hasOwnProperty("showNumber") || formatOptions.showNumber) {
				return BaseType.Numeric; // only number to show
			} else {
				return BaseType.String; // only unit to show
			}
		default:
			return ODataTypeUtil.getBaseType.call(ODataV4TypeUtil, type, formatOptions, constraints);
	}
};
ODataV4TypeUtil.getDataTypeClassName = function (type: string): string {
	// V4 specific types
	if (EDM_TYPE_MAPPING[type]) {
		type = EDM_TYPE_MAPPING[type].type;
	} else {
		type = ODataTypeUtil.getDataTypeClassName.call(ODataV4TypeUtil, type);
	}
	return type;
};
ODataV4TypeUtil.getDataTypeInstance = function (dataType: string, formatOptions?: FormatOptions, constraints?: Constraints): SimpleType {
	switch (dataType) {
		case "sap.ui.model.odata.type.DateTimeOffset":
		case "Edm.DateTimeOffset":
			constraints = merge({}, constraints || {});
			constraints.V4 = true;
			break;
		default:
	}
	const TypeClass = ODataV4TypeUtil.getDataTypeClass(dataType);
	return new TypeClass(formatOptions, constraints);
};
export default ODataV4TypeUtil;
