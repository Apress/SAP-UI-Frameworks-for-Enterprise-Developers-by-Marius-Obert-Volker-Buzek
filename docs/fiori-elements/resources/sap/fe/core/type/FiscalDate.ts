import { CommonAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/Common";
import FiscalFormat from "sap/fe/core/formatters/FiscalFormat";
import { defineUI5Class } from "sap/fe/core/helpers/ClassSupport";
import CalendarType from "sap/ui/core/CalendarType";
import Core from "sap/ui/core/Core";
import ODataStringType from "sap/ui/model/odata/type/String";
import ValidateException from "sap/ui/model/ValidateException";

/**
 * Define the UI5 class for a type of fiscal date.
 *
 * @class The data type Fiscal Date supports the parsing and formatting of fiscal dates that follow the pattern 'yM'
 * @param formatOptions Format options
 * @param formatOptions.fiscalType String with a fiscal annotation type
 * @param constraints Constraints
 * @since 1.110.0
 * @experimental
 * @extends sap.ui.model.odata.type.String
 * @alias {sap.fe.core.type.FiscalDate} The implementation of the fiscal date
 */
@defineUI5Class("sap.fe.core.type.FiscalDate")
class FiscalDate extends ODataStringType {
	private annotationType: CommonAnnotationTerms | undefined;

	private fullYear: string | undefined;

	private static dateFormats = {
		[CommonAnnotationTerms.IsFiscalYear]: "YYYY",
		[CommonAnnotationTerms.IsFiscalPeriod]: "PPP",
		[CommonAnnotationTerms.IsFiscalYearPeriod]: "YYYYPPP",
		[CommonAnnotationTerms.IsFiscalQuarter]: "Q",
		[CommonAnnotationTerms.IsFiscalYearQuarter]: "YYYYQ",
		[CommonAnnotationTerms.IsFiscalWeek]: "WW",
		[CommonAnnotationTerms.IsFiscalYearWeek]: "YYYYWW",
		[CommonAnnotationTerms.IsDayOfFiscalYear]: "d",
		[CommonAnnotationTerms.IsFiscalYearVariant]: ""
	};

	private formatter: FiscalFormat | undefined;

	constructor(formatOptions: any, constraints: any) {
		if (
			(formatOptions.fiscalType === CommonAnnotationTerms.IsFiscalYearPeriod ||
				formatOptions.fiscalType === CommonAnnotationTerms.IsFiscalYearQuarter ||
				formatOptions.fiscalType === CommonAnnotationTerms.IsFiscalYearWeek) &&
			constraints?.maxLength
		) {
			// We increase maxLength for +1 for any fiscal type that have delimiter in locale format.
			// It's necessary for validation to work correctly.
			// Also for validation to function properly user also should specify constraints.isDigitSequence = true
			// isDigitSequence and maxLength combination ensures that missing characters will be populated with leading zeros
			// that will ensure user will receive correct validation results.
			constraints.maxLength = constraints.maxLength + 1;
		}
		super(formatOptions, constraints);
		this.annotationType = formatOptions.fiscalType;
		const format = FiscalDate.dateFormats[this.annotationType as keyof typeof FiscalDate.dateFormats];
		if (format) {
			this.formatter = FiscalFormat.getDateInstance({
				format,
				calendarType: CalendarType.Gregorian
			});
		}
	}

	/**
	 * Return pattern for fiscal date type.
	 *
	 * @returns The fiscal date pattern
	 */
	public getPattern(): string | undefined {
		return this.formatter?.getPattern();
	}

	/**
	 * Formats the given value to the given fiscal type.
	 *
	 * @param value The value to be formatted
	 * @returns The formatted output value; <code>undefined</code> is always formatted to <code>null</code>
	 * @override
	 */
	public formatValue(value: string, targetType: string): string | number | boolean {
		return this.formatter ? this.formatter.format(super.formatValue(value, targetType)) : super.formatValue(value, targetType);
	}

	/**
	 * Parses the given value, which is expected to be of the fiscal type, to a string.
	 *
	 * @param value The value to be parsed
	 * @returns The parsed value
	 * @override
	 */
	public parseValue(value: string | number | boolean, sourceType: string): string {
		return this.formatter ? this.formatter.parse(super.parseValue(value, sourceType)) : super.parseValue(value, sourceType);
	}

	/**
	 * @inheritDoc
	 */
	public validateValue(value: string): void {
		try {
			super.validateValue(value);
		} catch (error) {
			if (!this.formatter) {
				throw error;
			}
			if (!this.formatter.validate(value)) {
				throw new ValidateException(this.getErrorMessage(this.annotationType));
			}
		}

		if (!this.formatter || value === "" || value === null) {
			return;
		}
		if (!this.formatter.validate(value)) {
			throw new ValidateException(this.getErrorMessage(this.annotationType));
		}
	}

	/**
	 * Returns the matching locale-dependent error message for the type based on the fiscal annotation.
	 *
	 * @param annotationType The fiscal annotation type
	 * @returns The locale-dependent error message
	 */
	public getErrorMessage(annotationType: CommonAnnotationTerms | undefined): string {
		let sValue = "";
		this.fullYear = this.fullYear || new Date().getFullYear().toString();

		switch (annotationType) {
			case CommonAnnotationTerms.IsFiscalYear:
				sValue = this.fullYear;
				break;
			case CommonAnnotationTerms.IsFiscalPeriod:
				sValue = "001";
				break;
			case CommonAnnotationTerms.IsFiscalYearPeriod:
				sValue = this.fullYear + "001";
				break;
			case CommonAnnotationTerms.IsFiscalQuarter:
				sValue = "1";
				break;
			case CommonAnnotationTerms.IsFiscalYearQuarter:
				sValue = this.fullYear + "1";
				break;
			case CommonAnnotationTerms.IsFiscalWeek:
				sValue = "01";
				break;
			case CommonAnnotationTerms.IsFiscalYearWeek:
				sValue = this.fullYear + "01";
				break;
			case CommonAnnotationTerms.IsDayOfFiscalYear:
				sValue = "1";
				break;
			case CommonAnnotationTerms.IsFiscalYearVariant:
				break;
			default:
				sValue = this.fullYear;
		}

		return Core.getLibraryResourceBundle("sap.fe.core").getText("FISCAL_VALIDATION_FAILS", [this.formatValue(sValue, "string")]);
	}

	/**
	 * @inheritDoc
	 */
	public getName(): string {
		return "sap.fe.core.type.FiscalDate";
	}

	/**
	 * Returns the formatter that is assigned to this particular FiscalDate type.
	 *
	 * @returns The assigned instance of FiscalFormat
	 */
	public getFormatter(): FiscalFormat | undefined {
		return this.formatter;
	}
}
export default FiscalDate;
