import Any from "sap/fe/core/controls/Any";
import type { CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { compileExpression, constant, transformRecursively } from "sap/fe/core/helpers/BindingToolkit";
import type Control from "sap/ui/core/Control";

const evaluateComplexExpression = function (this: Control, expressionAsString: string, ...partsToConcat: string[]): string {
	const myExpression = JSON.parse(expressionAsString);
	transformRecursively(
		myExpression,
		"PathInModel",
		(pathInModelDef: any) => {
			if (pathInModelDef.modelName === "$") {
				return constant(partsToConcat[parseInt(pathInModelDef.path.substring(1), 10)]);
			}
			return pathInModelDef;
		},
		true
	);
	transformRecursively(myExpression, "ComplexType", (complexTypeDef: any) => {
		const compiledExpression = compileExpression(complexTypeDef);
		if (compiledExpression) {
			return constant(getValue(compiledExpression, this));
		}
		return constant(compiledExpression);
	});

	const myCompiledExpression = compileExpression(myExpression);

	return getValue(myCompiledExpression, this);
};

const getValue = function (myExpression: CompiledBindingToolkitExpression, target: Control) {
	const myAny = new Any({ anyText: myExpression });
	myAny.setModel(target.getModel());
	myAny.setBindingContext(target.getBindingContext());
	return myAny.getAnyText();
};
evaluateComplexExpression.__functionName = "sap.fe.core.formatters.StandardFormatter#evaluateComplexExpression";
const concat = function (...partsToConcat: string[]): string {
	return partsToConcat.join("");
};
concat.__functionName = "sap.fe.core.formatters.StandardFormatter#concat";

const ifElse = function (condition: any, onTrue: string, onFalse: string): string {
	return condition ? onTrue : onFalse;
};
ifElse.__functionName = "sap.fe.core.formatters.StandardFormatter#ifElse";

/**
 * Collection of table formatters.
 *
 * @param this The context
 * @param sName The inner function name
 * @param oArgs The inner function parameters
 * @returns The value from the inner function
 */
const standardFormatter = function (this: object, sName: string, ...oArgs: any[]): any {
	if (standardFormatter.hasOwnProperty(sName)) {
		return (standardFormatter as any)[sName].apply(this, oArgs);
	} else {
		return "";
	}
};

standardFormatter.evaluateComplexExpression = evaluateComplexExpression;
standardFormatter.concat = concat;
standardFormatter.ifElse = ifElse;

/**
 * @global
 */
export default standardFormatter;
