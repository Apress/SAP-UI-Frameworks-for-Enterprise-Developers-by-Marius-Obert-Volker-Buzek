import type { ComputedAnnotationInterface, MetaModelContext } from "sap/fe/core/templating/UIFormatters";

export const getPath = function (oContext: MetaModelContext, oInterface: ComputedAnnotationInterface): string {
	if (oInterface && oInterface.context) {
		return oInterface.context.getPath();
	}
	return "";
};
getPath.requiresIContext = true;
