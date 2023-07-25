import type { BindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { compileExpression, constant, equal, getExpressionFromAnnotation, ifElse, or } from "sap/fe/core/helpers/BindingToolkit";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { getRelativePaths } from "sap/fe/core/templating/DataModelPathHelper";
/**
 * Returns an expression to set button type based on Criticality
 * Supported Criticality: Positive, Negative, Critical and Information leading to Success, Error, Warning and None state respectively.
 *
 * @function
 * @static
 * @name sap.fe.core.CriticalityFormatters.buildExpressionForCriticalityColor
 * @memberof sap.fe.core.CriticalityFormatters
 * @param oTarget A DataField a DataPoint or a DataModelObjectPath.
 * @param [oPropertyDataModelPath] DataModelObjectPath.
 * @returns An expression to deduce the state of an objectStatus.
 * @private
 * @ui5-restricted
 */
export const buildExpressionForCriticalityColor = (oTarget: any, oPropertyDataModelPath: DataModelObjectPath): string | undefined => {
	const oAnnotationTarget = oTarget.targetObject ? oTarget.targetObject : oTarget;
	const oCriticalityProperty = oAnnotationTarget?.Criticality;
	const relativeLocation = oPropertyDataModelPath ? getRelativePaths(oPropertyDataModelPath) : undefined;
	const oCriticalityExpression: BindingToolkitExpression<string> = getExpressionFromAnnotation(oCriticalityProperty, relativeLocation);
	let sValueStateExpression;
	if (oCriticalityProperty) {
		sValueStateExpression = ifElse(
			or(
				equal(oCriticalityExpression, constant("UI.CriticalityType/Negative")),
				equal(oCriticalityExpression as BindingToolkitExpression<Number>, constant(1)),
				equal(oCriticalityExpression, constant("1"))
			),
			constant("Error"),
			ifElse(
				or(
					equal(oCriticalityExpression, constant("UI.CriticalityType/Critical")),
					equal(oCriticalityExpression as BindingToolkitExpression<Number>, constant(2)),
					equal(oCriticalityExpression, constant("2"))
				),
				constant("Warning"),
				ifElse(
					or(
						equal(oCriticalityExpression, constant("UI.CriticalityType/Positive")),
						equal(oCriticalityExpression as BindingToolkitExpression<Number>, constant(3)),
						equal(oCriticalityExpression, constant("3"))
					),
					constant("Success"),
					ifElse(
						or(
							equal(oCriticalityExpression, constant("UI.CriticalityType/Information")),
							equal(oCriticalityExpression as BindingToolkitExpression<Number>, constant(5)),
							equal(oCriticalityExpression, constant("5"))
						),
						constant("Information"),
						constant("None")
					)
				)
			)
		);
	} else {
		// Any other cases are not valid, the default value of 'None' will be returned
		sValueStateExpression = constant("None");
	}
	return compileExpression(sValueStateExpression);
};

/**
 * Returns an expression to set icon type based on Criticality
 * Supported Criticality: Positive, Negative, Critical and Information.
 *
 * @function
 * @static
 * @name sap.fe.core.CriticalityFormatters.buildExpressionForCriticalityIcon
 * @memberof sap.fe.core.CriticalityFormatters
 * @param oTarget A DataField a DataPoint or a DataModelObjectPath.
 * @param [oPropertyDataModelPath] DataModelObjectPath.
 * @returns An expression to deduce the icon of an objectStatus.
 * @private
 * @ui5-restricted
 */
export const buildExpressionForCriticalityIcon = (oTarget: any, oPropertyDataModelPath: DataModelObjectPath): string | undefined => {
	const oAnnotationTarget = oTarget?.targetObject ? oTarget.targetObject : oTarget;
	const oCriticalityProperty = oAnnotationTarget?.Criticality;
	const relativeLocation = oPropertyDataModelPath ? getRelativePaths(oPropertyDataModelPath) : undefined;
	const oCriticalityExpression: BindingToolkitExpression<string> = getExpressionFromAnnotation(oCriticalityProperty, relativeLocation);
	const bCondition =
		oAnnotationTarget?.CriticalityRepresentation &&
		oAnnotationTarget?.CriticalityRepresentation === "UI.CriticalityRepresentationType/WithoutIcon";
	let sIconPath;
	if (!bCondition) {
		if (oCriticalityProperty) {
			sIconPath = ifElse(
				or(
					equal(oCriticalityExpression, constant("UI.CriticalityType/Negative")),
					equal(oCriticalityExpression as BindingToolkitExpression<Number>, constant(1)),
					equal(oCriticalityExpression, constant("1"))
				),
				constant("sap-icon://message-error"),
				ifElse(
					or(
						equal(oCriticalityExpression, constant("UI.CriticalityType/Critical")),
						equal(oCriticalityExpression as BindingToolkitExpression<Number>, constant(2)),
						equal(oCriticalityExpression, constant("2"))
					),
					constant("sap-icon://message-warning"),
					ifElse(
						or(
							equal(oCriticalityExpression, constant("UI.CriticalityType/Positive")),
							equal(oCriticalityExpression as BindingToolkitExpression<Number>, constant(3)),
							equal(oCriticalityExpression, constant("3"))
						),
						constant("sap-icon://message-success"),
						ifElse(
							or(
								equal(oCriticalityExpression, constant("UI.CriticalityType/Information")),
								equal(oCriticalityExpression as BindingToolkitExpression<Number>, constant(5)),
								equal(oCriticalityExpression, constant("5"))
							),
							constant("sap-icon://message-information"),
							constant("")
						)
					)
				)
			);
		} else {
			sIconPath = constant("");
		}
	} else {
		sIconPath = constant("");
	}
	return compileExpression(sIconPath);
};

/**
 * Returns an expression to set button type based on Criticality
 * Supported Criticality: Positive and Negative leading to Accept and Reject button type respectively.
 *
 * @function
 * @static
 * @name sap.fe.core.CriticalityFormatters.buildExpressionForCriticalityButtonType
 * @memberof sap.fe.core.CriticalityFormatters
 * @param oTarget A DataField, DataPoint, DataModelObjectPath.
 * @returns An expression to deduce button type.
 * @private
 * @ui5-restricted
 */
export const buildExpressionForCriticalityButtonType = (oTarget: any): string | undefined => {
	const oAnnotationTarget = oTarget?.targetObject ? oTarget.targetObject : oTarget;
	const oCriticalityProperty = oAnnotationTarget?.Criticality;
	const oCriticalityExpression: BindingToolkitExpression<string> = getExpressionFromAnnotation(oCriticalityProperty);
	let sButtonTypeExpression;
	if (oCriticalityProperty) {
		sButtonTypeExpression = ifElse(
			or(
				equal(oCriticalityExpression, constant("UI.CriticalityType/Negative")),
				equal(oCriticalityExpression as BindingToolkitExpression<Number>, constant(1)),
				equal(oCriticalityExpression, constant("1"))
			),
			constant("Reject"),
			ifElse(
				or(
					equal(oCriticalityExpression, constant("UI.CriticalityType/Positive")),
					equal(oCriticalityExpression as BindingToolkitExpression<Number>, constant(3)),
					equal(oCriticalityExpression, constant("3"))
				),
				constant("Accept"),
				constant("Default")
			)
		);
	} else {
		// Any other cases are not valid, the default value of 'Default' will be returned
		sButtonTypeExpression = constant("Default");
	}
	return compileExpression(sButtonTypeExpression);
};

/**
 * Returns an expression to set color in MicroCharts based on Criticality
 * Supported Criticality: Positive, Negative and Critical leading to Good, Error and Critical color respectively.
 *
 * @function
 * @static
 * @name sap.fe.core.CriticalityFormatters.buildExpressionForCriticalityColorMicroChart
 * @memberof sap.fe.core.CriticalityFormatters
 * @param oTarget A DataField, DataPoint, DataModelObjectPath
 * @returns An expression to deduce colors in Microcharts
 * @private
 * @ui5-restricted
 */
export const buildExpressionForCriticalityColorMicroChart = (oTarget: any): string | undefined => {
	const oAnnotationTarget = oTarget?.targetObject ? oTarget.targetObject : oTarget;
	const oCriticalityProperty = oAnnotationTarget?.Criticality;
	const oCriticalityExpression: BindingToolkitExpression<string> = getExpressionFromAnnotation(oCriticalityProperty);
	let sColorExpression;
	if (oCriticalityProperty) {
		sColorExpression = ifElse(
			or(
				equal(oCriticalityExpression, constant("UI.CriticalityType/Negative")),
				equal(oCriticalityExpression as BindingToolkitExpression<Number>, constant(1)),
				equal(oCriticalityExpression, constant("1"))
			),
			constant("Error"),
			ifElse(
				or(
					equal(oCriticalityExpression, constant("UI.CriticalityType/Critical")),
					equal(oCriticalityExpression as BindingToolkitExpression<Number>, constant(2)),
					equal(oCriticalityExpression, constant("2"))
				),
				constant("Critical"),
				ifElse(
					or(
						equal(oCriticalityExpression, constant("UI.CriticalityType/Positive")),
						equal(oCriticalityExpression as BindingToolkitExpression<Number>, constant(3)),
						equal(oCriticalityExpression, constant("3"))
					),
					constant("Good"),
					constant("Neutral")
				)
			)
		);
	} else {
		sColorExpression = constant("Neutral");
	}
	return compileExpression(sColorExpression);
};
