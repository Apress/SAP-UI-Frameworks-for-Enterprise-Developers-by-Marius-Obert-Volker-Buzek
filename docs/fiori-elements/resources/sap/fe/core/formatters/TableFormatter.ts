import { MessageType } from "sap/fe/core/formatters/TableFormatterTypes";
import DelegateUtil from "sap/fe/macros/DelegateUtil";
import TableSizeHelper from "sap/fe/macros/table/TableSizeHelper";
import type Table from "sap/m/Table";
import type ManagedObject from "sap/ui/base/ManagedObject";
import EditMode from "sap/ui/mdc/enum/EditMode";
import MDCTable from "sap/ui/mdc/Table";
import Column from "sap/ui/mdc/table/Column";
import type Context from "sap/ui/model/odata/v4/Context";
import CommonUtils from "../CommonUtils";

const getMessagetypeOrder = function (messageType: string): number {
	switch (messageType) {
		case "Error":
			return 4;
		case "Warning":
			return 3;
		case "Information":
			return 2;
		case "None":
			return 1;
		default:
			return -1;
	}
};

/**
 * Gets the validity of creation row fields.
 *
 * @function
 * @name validateCreationRowFields
 * @param fieldValidityObject Object holding the fields
 * @returns `true` if all the fields in the creation row are valid, `false` otherwise
 */
const validateCreationRowFields = function (fieldValidityObject?: any) {
	if (!fieldValidityObject) {
		return false;
	}
	const fieldKeys = Object.keys(fieldValidityObject);
	return (
		fieldKeys.length > 0 &&
		fieldKeys.every(function (key) {
			return fieldValidityObject[key]["validity"];
		})
	);
};
validateCreationRowFields.__functionName = "sap.fe.core.formatters.TableFormatter#validateCreationRowFields";

/**
 * @param this The object status control.
 * @param semanticKeyHasDraftIndicator The property name of the draft indicator.
 * @param aFilteredMessages Array of messages.
 * @param columnName
 * @param isSemanticKeyInFieldGroup Flag which says if semantic key is a part of field group.
 * @returns The value for the visibility property of the object status
 */
const getErrorStatusTextVisibilityFormatter = function (
	this: ManagedObject | any,
	semanticKeyHasDraftIndicator: string,
	aFilteredMessages: any,
	columnName: string,
	isSemanticKeyInFieldGroup?: Boolean
) {
	let bStatusVisibility = false;
	if (aFilteredMessages && aFilteredMessages.length > 0 && (isSemanticKeyInFieldGroup || columnName === semanticKeyHasDraftIndicator)) {
		const sCurrentContextPath = this.getBindingContext() ? this.getBindingContext().getPath() : undefined;
		aFilteredMessages.forEach((oMessage: any) => {
			if (oMessage.type === "Error" && oMessage.aTargets[0].indexOf(sCurrentContextPath) === 0) {
				bStatusVisibility = true;
				return bStatusVisibility;
			}
		});
	}
	return bStatusVisibility;
};
getErrorStatusTextVisibilityFormatter.__functionName = "sap.fe.core.formatters.TableFormatter#getErrorStatusTextVisibilityFormatter";

/**
 * rowHighlighting
 *
 * @param {object} this The context
 * @param {string|number} CriticalityValue The criticality value
 * @param {number} messageLastUpdate Timestamp of the last message that was created. It's defined as an input value, but not used in the body of the function
 * It is used to refresh the formatting of the table each time a new message is updated
 * @returns {object} The value from the inner function
 */

const rowHighlighting = function (
	this: ManagedObject,
	criticalityValue: string | number,
	aFilteredMessages: any[],
	hasActiveEntity: boolean,
	isActiveEntity: boolean,
	isDraftMode: string,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	...args: any[]
): MessageType {
	let iHighestCriticalityValue: number = -1;
	if (aFilteredMessages && aFilteredMessages.length > 0) {
		const sCurrentContextPath = this.getBindingContext()?.getPath();
		aFilteredMessages.forEach((oMessage: any) => {
			if (oMessage.aTargets[0].indexOf(sCurrentContextPath) === 0 && iHighestCriticalityValue < getMessagetypeOrder(oMessage.type)) {
				iHighestCriticalityValue = getMessagetypeOrder(oMessage.type);
				criticalityValue = oMessage.type;
			}
		});
	}
	if (typeof criticalityValue !== "string") {
		switch (criticalityValue) {
			case 1:
				criticalityValue = MessageType.Error;
				break;
			case 2:
				criticalityValue = MessageType.Warning;
				break;
			case 3:
				criticalityValue = MessageType.Success;
				break;
			case 5:
				criticalityValue = MessageType.Information;
				break;
			default:
				criticalityValue = MessageType.None;
		}
	}

	// If we have calculated a criticality <> None, return it
	if (criticalityValue !== MessageType.None) {
		return criticalityValue as MessageType;
	}

	// If not, we set criticality to 'Information' for newly created rows in Draft mode, and keep 'None' otherwise
	const isInactive = (this.getBindingContext() as Context)?.isInactive() ?? false;
	const isNewObject = !hasActiveEntity && !isActiveEntity && !isInactive;
	return isDraftMode === "true" && isNewObject ? MessageType.Information : MessageType.None;
};
rowHighlighting.__functionName = "sap.fe.core.formatters.TableFormatter#rowHighlighting";

const navigatedRow = function (this: ManagedObject, sDeepestPath: string) {
	const sPath = this.getBindingContext()?.getPath();
	if (sPath && sDeepestPath) {
		return sDeepestPath.indexOf(sPath) === 0;
	} else {
		return false;
	}
};
navigatedRow.__functionName = "sap.fe.core.formatters.TableFormatter#navigatedRow";

/**
 * Method to calculate the width of an MDCColumn based on the property definition.
 *
 * @function
 * @name getColumnWidth
 * @param this The MDCColumn object
 * @param editMode The EditMode of the table
 * @param isPropertiesCacheAvailable Indicates if the properties cache is available
 * @param propertyName The name of the property we want to calculate le width
 * @param useRemUnit Indicates if the rem unit must be concatenated with the column width result
 * @returns The width of the column
 * @private
 */
const getColumnWidth = function (
	this: Column,
	editMode: EditMode,
	isPropertiesCacheAvailable: boolean,
	propertyName: string,
	useRemUnit = true
): string | null | number {
	if (!isPropertiesCacheAvailable) {
		return null;
	}
	const table = this.getParent() as MDCTable;
	const properties = DelegateUtil.getCachedProperties(table);
	const property = properties?.find((prop) => prop.name === propertyName);
	if (property) {
		let columnWidth = properties ? TableSizeHelper.getMDCColumnWidthFromProperty(property, properties, true) : null;
		if (columnWidth && editMode === EditMode.Editable) {
			switch (property.typeConfig?.baseType) {
				case "Date":
				case "Time":
				case "DateTime":
					columnWidth += 2.8;
					break;
				default:
			}
		}
		if (useRemUnit) {
			return columnWidth + "rem";
		}
		return columnWidth;
	}

	return null;
};
getColumnWidth.__functionName = "sap.fe.core.formatters.TableFormatter#getColumnWidth";

/**
 * Method to calculate the width of an MDCColumn for valueHelp the table.
 *
 * @function
 * @name getColumnWidthForValueHelpTable
 * @param this The MDCColumn object
 * @param isPropertiesCacheAvailable Indicates if the properties cache is available
 * @param propertyName The name of the property we want to calculate le width
 * @param isTargetSmallDevice Indicates the current device has a small device
 * @returns The width of the column
 * @private
 */
const getColumnWidthForValueHelpTable = function (
	this: Column,
	isPropertiesCacheAvailable: boolean,
	propertyName: string,
	isTargetSmallDevice: boolean
): null | number {
	const isSmallDevice = CommonUtils.isSmallDevice();
	const withUnit = !isSmallDevice;

	return (isSmallDevice && isTargetSmallDevice) || (!isSmallDevice && !isTargetSmallDevice)
		? (tableFormatter.getColumnWidth.call(this, EditMode.Display, isPropertiesCacheAvailable, propertyName, withUnit) as null | number)
		: null;
};
getColumnWidthForValueHelpTable.__functionName = "sap.fe.core.formatters.TableFormatter#getColumnWidthForValueHelpTable";

function isRatingIndicator(oControl: any): boolean {
	if (oControl.isA("sap.fe.macros.controls.FieldWrapper")) {
		const vContentDisplay = Array.isArray(oControl.getContentDisplay())
			? oControl.getContentDisplay()[0]
			: oControl.getContentDisplay();
		if (vContentDisplay && vContentDisplay.isA("sap.m.RatingIndicator")) {
			return true;
		}
	}
	return false;
}
function _updateStyleClassForRatingIndicator(oFieldWrapper: any, bLast: boolean) {
	const vContentDisplay = Array.isArray(oFieldWrapper.getContentDisplay())
		? oFieldWrapper.getContentDisplay()[0]
		: oFieldWrapper.getContentDisplay();
	const vContentEdit = Array.isArray(oFieldWrapper.getContentEdit()) ? oFieldWrapper.getContentEdit()[0] : oFieldWrapper.getContentEdit();

	if (bLast) {
		vContentDisplay.addStyleClass("sapUiNoMarginBottom");
		vContentDisplay.addStyleClass("sapUiNoMarginTop");
		vContentEdit.removeStyleClass("sapUiTinyMarginBottom");
	} else {
		vContentDisplay.addStyleClass("sapUiNoMarginBottom");
		vContentDisplay.removeStyleClass("sapUiNoMarginTop");
		vContentEdit.addStyleClass("sapUiTinyMarginBottom");
	}
}
function getVBoxVisibility(this: Table, ...args: any[]) {
	const aItems = this.getItems();
	let bLastElementFound = false;
	for (let index = aItems.length - 1; index >= 0; index--) {
		if (!bLastElementFound) {
			if (args[index] !== true) {
				bLastElementFound = true;
				if (isRatingIndicator(aItems[index])) {
					_updateStyleClassForRatingIndicator(aItems[index], true);
				} else {
					aItems[index].removeStyleClass("sapUiTinyMarginBottom");
				}
			}
		} else if (isRatingIndicator(aItems[index])) {
			_updateStyleClassForRatingIndicator(aItems[index], false);
		} else {
			aItems[index].addStyleClass("sapUiTinyMarginBottom");
		}
	}
	return true;
}
getVBoxVisibility.__functionName = "sap.fe.core.formatters.TableFormatter#getVBoxVisibility";

// See https://www.typescriptlang.org/docs/handbook/functions.html#this-parameters for more detail on this weird syntax
/**
 * Collection of table formatters.
 *
 * @param this The context
 * @param sName The inner function name
 * @param oArgs The inner function parameters
 * @returns The value from the inner function
 */
const tableFormatter = function (this: object, sName: string, ...oArgs: any[]): any {
	if (tableFormatter.hasOwnProperty(sName)) {
		return (tableFormatter as any)[sName].apply(this, oArgs);
	} else {
		return "";
	}
};

tableFormatter.validateCreationRowFields = validateCreationRowFields;
tableFormatter.rowHighlighting = rowHighlighting;
tableFormatter.navigatedRow = navigatedRow;
tableFormatter.getErrorStatusTextVisibilityFormatter = getErrorStatusTextVisibilityFormatter;
tableFormatter.getVBoxVisibility = getVBoxVisibility;
tableFormatter.isRatingIndicator = isRatingIndicator; // for unit tests
tableFormatter.getColumnWidth = getColumnWidth;
tableFormatter.getColumnWidthForValueHelpTable = getColumnWidthForValueHelpTable;

/**
 * @global
 */
export default tableFormatter;
