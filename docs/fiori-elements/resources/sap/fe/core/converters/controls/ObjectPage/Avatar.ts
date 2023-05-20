import type { CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { compileExpression, getExpressionFromAnnotation } from "sap/fe/core/helpers/BindingToolkit";
import type ConverterContext from "../../ConverterContext";
enum AvatarShape {
	Circle = "Circle",
	Square = "Square"
}

export type Avatar = {
	src?: CompiledBindingToolkitExpression;
	initials: CompiledBindingToolkitExpression;
	fallbackIcon?: CompiledBindingToolkitExpression;
	displayShape: CompiledBindingToolkitExpression;
};

const isNaturalPerson = (converterContext: ConverterContext): Boolean => {
	return converterContext.getEntityType().annotations.Common?.IsNaturalPerson?.valueOf() === true;
};

const getFallBackIcon = (converterContext: ConverterContext): CompiledBindingToolkitExpression | undefined => {
	const headerInfo = converterContext.getEntityType().annotations?.UI?.HeaderInfo;
	if (!headerInfo || (headerInfo && !headerInfo.ImageUrl && !headerInfo.TypeImageUrl)) {
		return undefined;
	}
	if (headerInfo.ImageUrl && headerInfo.TypeImageUrl) {
		return compileExpression(getExpressionFromAnnotation(headerInfo.TypeImageUrl));
	}
	return compileExpression(isNaturalPerson(converterContext) ? "sap-icon://person-placeholder" : "sap-icon://product");
};

const getSource = (converterContext: ConverterContext): CompiledBindingToolkitExpression | undefined => {
	const headerInfo = converterContext.getEntityType().annotations?.UI?.HeaderInfo;
	if (!headerInfo || !(headerInfo.ImageUrl || headerInfo.TypeImageUrl)) {
		return undefined;
	}
	return compileExpression(getExpressionFromAnnotation(headerInfo.ImageUrl || headerInfo.TypeImageUrl));
};

export const getAvatar = (converterContext: ConverterContext): Avatar | undefined => {
	const headerInfo = converterContext.getEntityType().annotations?.UI?.HeaderInfo;
	const oSource = headerInfo && (headerInfo.ImageUrl || headerInfo.TypeImageUrl || headerInfo.Initials);
	if (!oSource) {
		return undefined;
	}
	return {
		src: getSource(converterContext),
		initials: compileExpression(getExpressionFromAnnotation(headerInfo?.Initials || "")),
		fallbackIcon: getFallBackIcon(converterContext),
		displayShape: compileExpression(isNaturalPerson(converterContext) ? AvatarShape.Circle : AvatarShape.Square)
	};
};
