import BindingParser from "sap/ui/base/BindingParser";

function getObject(oObject: any, sPath: any): any {
	if (!oObject) {
		return null;
	}
	const sPathSplit = sPath.split("/");
	if (sPathSplit.length === 1) {
		return oObject[sPath];
	} else {
		return getObject(oObject[sPathSplit[0]], sPathSplit.splice(1).join("/"));
	}
}
/**
 * Resolve a dynamic annotation path down to a standard annotation path.
 *
 * @param sAnnotationPath
 * @param oMetaModel
 * @returns The non dynamic version of the annotation path
 */
export function resolveDynamicExpression(sAnnotationPath: any, oMetaModel: any) {
	if (sAnnotationPath.indexOf("[") !== -1) {
		const firstBracket = sAnnotationPath.indexOf("[");
		const sStableBracket = sAnnotationPath.substr(0, firstBracket);
		const sRest = sAnnotationPath.substr(firstBracket + 1);
		const lastBracket = sRest.indexOf("]");
		const aValue = oMetaModel.getObject(sStableBracket);
		const oExpression = BindingParser.parseExpression(sRest.substr(0, lastBracket));
		if (
			Array.isArray(aValue) &&
			oExpression &&
			oExpression.result &&
			oExpression.result.parts &&
			oExpression.result.parts[0] &&
			oExpression.result.parts[0].path
		) {
			let i;
			let bFound = false;
			for (i = 0; i < aValue.length && !bFound; i++) {
				const oObjectValue = getObject(aValue[i], oExpression.result.parts[0].path);
				const bResult = oExpression.result.formatter(oObjectValue);
				if (bResult) {
					bFound = true;
				}
			}
			if (bFound) {
				sAnnotationPath = resolveDynamicExpression(sStableBracket + (i - 1) + sRest.substr(lastBracket + 1), oMetaModel);
			}
		}
	}
	return sAnnotationPath;
}
