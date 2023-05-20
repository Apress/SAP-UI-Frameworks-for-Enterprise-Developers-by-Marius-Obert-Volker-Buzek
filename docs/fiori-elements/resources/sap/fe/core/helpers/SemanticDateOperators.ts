import FilterOperatorUtil from "sap/ui/mdc/condition/FilterOperatorUtil";
import Operator from "sap/ui/mdc/condition/Operator";
import Filter from "sap/ui/model/Filter";
import ModelOperator from "sap/ui/model/FilterOperator";
import ValidateException from "sap/ui/model/ValidateException";

const aSupportedOperations = ["DATE", "FROM", "TO", "DATERANGE"];
const DYNAMIC_DATE_CATEGORY = "DYNAMIC.DATE";
const FIXED_DATE_CATEGORY = "FIXED.DATE";
const DYNAMIC_DATE_INT_CATEGORY = "DYNAMIC.DATE.INT";
const DYNAMIC_DATERANGE_CATEGORY = "DYNAMIC.DATERANGE";
const DYNAMIC_MONTH_CATEGORY = "DYNAMIC.MONTH";
const FIXED_WEEK_CATEGORY = "FIXED.WEEK";
const FIXED_MONTH_CATEGORY = "FIXED.MONTH";
const FIXED_QUARTER_CATEGORY = "FIXED.QUARTER";
const FIXED_YEAR_CATEGORY = "FIXED.YEAR";
const DYNAMIC_WEEK_INT_CATEGORY = "DYNAMIC.WEEK.INT";
const DYNAMIC_MONTH_INT_CATEGORY = "DYNAMIC.MONTH.INT";
const DYNAMIC_QUARTER_INT_CATEGORY = "DYNAMIC.QUARTER.INT";
const DYNAMIC_YEAR_INT_CATEGORY = "DYNAMIC.YEAR.INT";
const DYNAMIC_MINUTE_INT_CATEGORY = "DYNAMIC.MINUTE.INT";
const DYNAMIC_HOUR_INT_CATEGORY = "DYNAMIC.HOUR.INT";
const basicDateTimeOps = {
	EQ: {
		key: "EQ",
		category: DYNAMIC_DATE_CATEGORY
	},
	BT: {
		key: "BT",
		category: DYNAMIC_DATERANGE_CATEGORY
	}
};
const mSemanticDateOperations: any = {
	DATE: {
		key: "DATE",
		category: DYNAMIC_DATE_CATEGORY
	},
	FROM: {
		key: "FROM",
		category: DYNAMIC_DATE_CATEGORY
	},
	TO: {
		key: "TO",
		category: DYNAMIC_DATE_CATEGORY
	},
	DATERANGE: {
		key: "DATERANGE",
		category: DYNAMIC_DATERANGE_CATEGORY
	},
	SPECIFICMONTH: {
		key: "SPECIFICMONTH",
		category: DYNAMIC_MONTH_CATEGORY
	},
	TODAY: {
		key: "TODAY",
		category: FIXED_DATE_CATEGORY
	},
	TODAYFROMTO: {
		key: "TODAYFROMTO",
		category: DYNAMIC_DATE_INT_CATEGORY
	},
	YESTERDAY: {
		key: "YESTERDAY",
		category: FIXED_DATE_CATEGORY
	},
	TOMORROW: {
		key: "TOMORROW",
		category: FIXED_DATE_CATEGORY
	},
	LASTDAYS: {
		key: "LASTDAYS",
		category: DYNAMIC_DATE_INT_CATEGORY
	},
	NEXTDAYS: {
		key: "NEXTDAYS",
		category: DYNAMIC_DATE_INT_CATEGORY
	},
	THISWEEK: {
		key: "THISWEEK",
		category: FIXED_WEEK_CATEGORY
	},
	LASTWEEK: {
		key: "LASTWEEK",
		category: FIXED_WEEK_CATEGORY
	},
	LASTWEEKS: {
		key: "LASTWEEKS",
		category: DYNAMIC_WEEK_INT_CATEGORY
	},
	NEXTWEEK: {
		key: "NEXTWEEK",
		category: FIXED_WEEK_CATEGORY
	},
	NEXTWEEKS: {
		key: "NEXTWEEKS",
		category: DYNAMIC_WEEK_INT_CATEGORY
	},
	THISMONTH: {
		key: "THISMONTH",
		category: FIXED_MONTH_CATEGORY
	},
	LASTMONTH: {
		key: "LASTMONTH",
		category: FIXED_MONTH_CATEGORY
	},
	LASTMONTHS: {
		key: "LASTMONTHS",
		category: DYNAMIC_MONTH_INT_CATEGORY
	},
	NEXTMONTH: {
		key: "NEXTMONTH",
		category: FIXED_MONTH_CATEGORY
	},
	NEXTMONTHS: {
		key: "NEXTMONTHS",
		category: DYNAMIC_MONTH_INT_CATEGORY
	},
	THISQUARTER: {
		key: "THISQUARTER",
		category: FIXED_QUARTER_CATEGORY
	},
	LASTQUARTER: {
		key: "LASTQUARTER",
		category: FIXED_QUARTER_CATEGORY
	},
	LASTQUARTERS: {
		key: "LASTQUARTERS",
		category: DYNAMIC_QUARTER_INT_CATEGORY
	},
	NEXTQUARTER: {
		key: "NEXTQUARTER",
		category: FIXED_QUARTER_CATEGORY
	},
	NEXTQUARTERS: {
		key: "NEXTQUARTERS",
		category: DYNAMIC_QUARTER_INT_CATEGORY
	},
	QUARTER1: {
		key: "QUARTER1",
		category: FIXED_QUARTER_CATEGORY
	},
	QUARTER2: {
		key: "QUARTER2",
		category: FIXED_QUARTER_CATEGORY
	},
	QUARTER3: {
		key: "QUARTER3",
		category: FIXED_QUARTER_CATEGORY
	},
	QUARTER4: {
		key: "QUARTER4",
		category: FIXED_QUARTER_CATEGORY
	},
	THISYEAR: {
		key: "THISYEAR",
		category: FIXED_YEAR_CATEGORY
	},
	LASTYEAR: {
		key: "LASTYEAR",
		category: FIXED_YEAR_CATEGORY
	},
	LASTYEARS: {
		key: "LASTYEARS",
		category: DYNAMIC_YEAR_INT_CATEGORY
	},
	NEXTYEAR: {
		key: "NEXTYEAR",
		category: FIXED_YEAR_CATEGORY
	},
	NEXTYEARS: {
		key: "NEXTYEARS",
		category: DYNAMIC_YEAR_INT_CATEGORY
	},
	LASTMINUTES: {
		key: "LASTMINUTES",
		category: DYNAMIC_MINUTE_INT_CATEGORY
	},
	NEXTMINUTES: {
		key: "NEXTMINUTES",
		category: DYNAMIC_MINUTE_INT_CATEGORY
	},
	LASTHOURS: {
		key: "LASTHOURS",
		category: DYNAMIC_HOUR_INT_CATEGORY
	},
	NEXTHOURS: {
		key: "NEXTHOURS",
		category: DYNAMIC_HOUR_INT_CATEGORY
	},
	YEARTODATE: {
		key: "YEARTODATE",
		category: FIXED_YEAR_CATEGORY
	},
	DATETOYEAR: {
		key: "DATETOYEAR",
		category: FIXED_YEAR_CATEGORY
	}
};

function _getDateRangeOperator() {
	return new Operator({
		name: "DATERANGE",
		filterOperator: ModelOperator.BT,
		alias: { Date: "DATERANGE", DateTime: "DATERANGE" },
		valueTypes: [{ name: "sap.ui.model.odata.type.Date" }, { name: "sap.ui.model.odata.type.Date" }], // use date type to have no time part,
		getModelFilter: function (oCondition: any, sFieldPath: any, oType: any) {
			return SemanticDateOperators.getModelFilterForDateRange(oCondition, sFieldPath, oType, this);
		},
		validate: function (aValues: any, oType: any) {
			if (aValues.length < 2) {
				throw new ValidateException("Date Range must have two values");
			} else {
				const fromDate = new Date(aValues[0]);
				const toDate = new Date(aValues[1]);
				if (fromDate.getTime() > toDate.getTime()) {
					throw new ValidateException("From Date Should Be Less Than To Date");
				}
			}
			Operator.prototype.validate.apply(this, [aValues, oType]);
		}
	});
}

function _getDateOperator() {
	return new Operator({
		name: "DATE",
		alias: { Date: "DATE", DateTime: "DATE" },
		filterOperator: ModelOperator.EQ,
		valueTypes: [{ name: "sap.ui.model.odata.type.Date" }],
		getModelFilter: function (oCondition: any, sFieldPath: any, oType: any) {
			return SemanticDateOperators.getModelFilterForDate(oCondition, sFieldPath, oType, this);
		}
	});
}

function _getFromOperator() {
	return new Operator({
		name: "FROM",
		alias: { Date: "FROM", DateTime: "FROM" },
		filterOperator: ModelOperator.GE,
		valueTypes: [{ name: "sap.ui.model.odata.type.Date" }],
		getModelFilter: function (oCondition: any, sFieldPath: any, oType: any) {
			return SemanticDateOperators.getModelFilterForFrom(oCondition, sFieldPath, oType, this);
		}
	});
}

function _getToOperator() {
	return new Operator({
		name: "TO",
		alias: { Date: "TO", DateTime: "TO" },
		filterOperator: ModelOperator.LE,
		valueTypes: [{ name: "sap.ui.model.odata.type.Date" }],
		getModelFilter: function (oCondition: any, sFieldPath: any, oType: any) {
			return SemanticDateOperators.getModelFilterForTo(oCondition, sFieldPath, oType, this);
		}
	});
}

function _filterOperation(oOperation: any, aOperatorConfiguration: any) {
	if (!aOperatorConfiguration) {
		return true;
	}
	aOperatorConfiguration = Array.isArray(aOperatorConfiguration) ? aOperatorConfiguration : [aOperatorConfiguration];
	let bResult;

	aOperatorConfiguration.some(function (oOperatorConfiguration: any) {
		let j;
		if (!oOperatorConfiguration.path) {
			return false;
		}

		const sValue = oOperation[oOperatorConfiguration.path];
		const bExclude = oOperatorConfiguration.exclude || false;
		let aOperatorValues;

		if (oOperatorConfiguration.contains && sValue) {
			aOperatorValues = oOperatorConfiguration.contains.split(",");
			bResult = bExclude;
			for (j = 0; j < aOperatorValues.length; j++) {
				if (bExclude && sValue.indexOf(aOperatorValues[j]) > -1) {
					bResult = false;
					return true;
				} else if (!bExclude && sValue.indexOf(aOperatorValues[j]) > -1) {
					bResult = true;
					return true;
				}
			}
		}

		if (oOperatorConfiguration.equals && sValue) {
			aOperatorValues = oOperatorConfiguration.equals.split(",");
			bResult = bExclude;
			for (j = 0; j < aOperatorValues.length; j++) {
				if (bExclude && sValue === aOperatorValues[j]) {
					bResult = false;
					return true;
				} else if (!bExclude && sValue === aOperatorValues[j]) {
					bResult = true;
					return true;
				}
			}
		}

		return false;
	});
	return bResult;
}
// Get the operators based on type
function _getOperators(type: string | undefined) {
	return type === "Edm.DateTimeOffset" ? Object.assign({}, mSemanticDateOperations, basicDateTimeOps) : mSemanticDateOperations;
}
const SemanticDateOperators = {
	// Extending operators for Sematic Date Control
	addSemanticDateOperators: function () {
		FilterOperatorUtil.addOperator(_getDateRangeOperator());
		FilterOperatorUtil.addOperator(_getDateOperator());
		FilterOperatorUtil.addOperator(_getFromOperator());
		FilterOperatorUtil.addOperator(_getToOperator());
	},
	getSupportedOperations: function () {
		return aSupportedOperations;
	},
	getSemanticDateOperations: function (type?: string) {
		const operators = _getOperators(type);
		return Object.keys(operators);
	},
	// TODO: Would need to check with MDC for removeOperator method
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	removeSemanticDateOperators: function () {},
	// To filter operators based on manifest aOperatorConfiguration settings
	getFilterOperations: function (aOperatorConfiguration: any, type?: string) {
		const aOperations = [];
		const operators = _getOperators(type);
		for (const n in operators) {
			const oOperation = operators[n];
			if (_filterOperation(oOperation, aOperatorConfiguration)) {
				aOperations.push(oOperation);
			}
		}
		return aOperations.map(function (oOperation: any) {
			return oOperation.key;
		});
	},
	hasSemanticDateOperations: function (oConditions: any) {
		const aSemanticDateOps = this.getSemanticDateOperations();
		for (const n in oConditions) {
			const aFilterCondtion = oConditions[n];
			const oSemanticOperator = aFilterCondtion.find(function (oCondition: any) {
				return aSemanticDateOps.indexOf(oCondition.operator) > -1;
			});
			if (oSemanticOperator) {
				return false;
			}
		}
		return true;
	},

	getModelFilterForDate: function (oCondition: any, sFieldPath: any, oType: any, operator: any) {
		if (oType.isA("sap.ui.model.odata.type.DateTimeOffset")) {
			const oOperatorType = operator._createLocalType(operator.valueTypes[0]);
			let sFrom = oCondition.values[0];
			const oOperatorModelFormat = oOperatorType.getModelFormat();
			const oDate = oOperatorModelFormat.parse(sFrom, false);
			sFrom = oType.getModelValue(oDate);
			oDate.setHours(23);
			oDate.setMinutes(59);
			oDate.setSeconds(59);
			oDate.setMilliseconds(999);
			const sTo = oType.getModelValue(oDate);
			return new Filter({ path: sFieldPath, operator: ModelOperator.BT, value1: sFrom, value2: sTo });
		} else {
			return new Filter({ path: sFieldPath, operator: operator.filterOperator, value1: oCondition.values[0] });
		}
	},

	getModelFilterForTo: function (oCondition: any, sFieldPath: any, oType: any, operator: any) {
		if (oType.isA("sap.ui.model.odata.type.DateTimeOffset")) {
			const oOperatorType = operator._createLocalType(operator.valueTypes[0]);
			const value = oCondition.values[0];
			const oOperatorModelFormat = oOperatorType.getModelFormat();
			const oDate = oOperatorModelFormat.parse(value, false);
			oDate.setHours(23);
			oDate.setMinutes(59);
			oDate.setSeconds(59);
			oDate.setMilliseconds(999);
			const sTo = oType.getModelValue(oDate);
			return new Filter({ path: sFieldPath, operator: ModelOperator.LE, value1: sTo });
		} else {
			return new Filter({ path: sFieldPath, operator: operator.filterOperator, value1: oCondition.values[0] });
		}
	},

	getModelFilterForFrom: function (oCondition: any, sFieldPath: any, oType: any, operator: any) {
		if (oType.isA("sap.ui.model.odata.type.DateTimeOffset")) {
			const oOperatorType = operator._createLocalType(operator.valueTypes[0]);
			const value = oCondition.values[0];
			const oOperatorModelFormat = oOperatorType.getModelFormat();
			const oDate = oOperatorModelFormat.parse(value, false);
			oDate.setHours(0);
			oDate.setMinutes(0);
			oDate.setSeconds(0);
			oDate.setMilliseconds(0);
			const sFrom = oType.getModelValue(oDate);
			return new Filter({ path: sFieldPath, operator: ModelOperator.GE, value1: sFrom });
		} else {
			return new Filter({ path: sFieldPath, operator: operator.filterOperator, value1: oCondition.values[0] });
		}
	},

	getModelFilterForDateRange: function (oCondition: any, sFieldPath: any, oType: any, operator: any) {
		if (oType.isA("sap.ui.model.odata.type.DateTimeOffset")) {
			let oOperatorType = operator._createLocalType(operator.valueTypes[0]);
			let sFrom = oCondition.values[0];
			let oOperatorModelFormat = oOperatorType.getModelFormat(); // use ModelFormat to convert in JS-Date and add 23:59:59
			let oDate = oOperatorModelFormat.parse(sFrom, false);
			sFrom = oType.getModelValue(oDate);
			oOperatorType = operator._createLocalType(operator.valueTypes[1]);
			oOperatorModelFormat = oOperatorType.getModelFormat(); // use ModelFormat to convert in JS-Date and add 23:59:59
			let sTo = oCondition.values[1];
			oDate = oOperatorModelFormat.parse(sTo, false);
			oDate.setHours(23);
			oDate.setMinutes(59);
			oDate.setSeconds(59);
			oDate.setMilliseconds(999);
			sTo = oType.getModelValue(oDate);
			return new Filter({ path: sFieldPath, operator: ModelOperator.BT, value1: sFrom, value2: sTo });
		} else {
			return new Filter({
				path: sFieldPath,
				operator: operator.filterOperator,
				value1: oCondition.values[0],
				value2: oCondition.values[1]
			});
		}
	}
};

export default SemanticDateOperators;
