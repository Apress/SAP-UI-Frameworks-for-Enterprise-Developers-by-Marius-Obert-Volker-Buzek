import type { ConnectedFieldsTypeTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import type { BindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { compileExpression, concat, constant } from "sap/fe/core/helpers/BindingToolkit";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { enhanceDataModelPath } from "sap/fe/core/templating/DataModelPathHelper";
import { getTextBindingExpression } from "sap/fe/macros/field/FieldTemplating";

const connectedFieldsTemplateRegex = /(?:({[^}]+})[^{]*)/g;
const connectedFieldsTemplateSubRegex = /{([^}]+)}(.*)/;
export const getLabelForConnectedFields = function (oConnectedFieldsPath: DataModelObjectPath, compileBindingExpression: boolean = true) {
	const oConnectedFields: ConnectedFieldsTypeTypes = oConnectedFieldsPath.targetObject;
	// First we separate each group of `{TemplatePart} xxx`
	const aTemplateMatches = oConnectedFields.Template.toString().match(connectedFieldsTemplateRegex);
	if (aTemplateMatches) {
		const aPartsToConcat = aTemplateMatches.reduce((aSubPartsToConcat: BindingToolkitExpression<string>[], oMatch) => {
			// Then for each sub-group, we retrieve the name of the data object and the remaining text, if it exists
			const aSubMatch = oMatch.match(connectedFieldsTemplateSubRegex);
			if (aSubMatch && aSubMatch.length > 1) {
				const targetValue = aSubMatch[1];
				if ((oConnectedFields.Data as any)[targetValue]) {
					const oDataFieldPath = enhanceDataModelPath(
						oConnectedFieldsPath,
						// TODO Better type for the Edm.Dictionary
						(oConnectedFields.Data as any)[targetValue].fullyQualifiedName.replace(
							oConnectedFieldsPath.targetEntityType.fullyQualifiedName,
							""
						)
					);
					oDataFieldPath.targetObject = oDataFieldPath.targetObject.Value;
					aSubPartsToConcat.push(getTextBindingExpression(oDataFieldPath, {}));
					if (aSubMatch.length > 2) {
						aSubPartsToConcat.push(constant(aSubMatch[2]));
					}
				}
			}
			return aSubPartsToConcat;
		}, []);
		return compileBindingExpression ? compileExpression(concat(...aPartsToConcat)) : concat(...aPartsToConcat);
	}

	return "";
};
