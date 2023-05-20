import type { Property } from "@sap-ux/vocabularies-types";
import type ConverterContext from "sap/fe/core/converters/ConverterContext";
import { isEntitySet } from "sap/fe/core/helpers/TypeGuards";

export function getIsRequired(converterContext: ConverterContext, sPropertyPath: string): boolean {
	const entitySet = converterContext.getEntitySet();
	let capabilities;

	if (isEntitySet(entitySet)) {
		capabilities = entitySet.annotations.Capabilities;
	}
	const aRequiredProperties = capabilities?.FilterRestrictions?.RequiredProperties as any[];
	let bIsRequired = false;
	if (aRequiredProperties) {
		aRequiredProperties.forEach(function (oRequiredProperty) {
			if (sPropertyPath === oRequiredProperty?.value) {
				bIsRequired = true;
			}
		});
	}
	return bIsRequired;
}

export function isPropertyFilterable(converterContext: ConverterContext, valueListProperty: string): boolean | undefined {
	let bNotFilterable, bHidden;
	const entityType = converterContext.getEntityType();
	const entitySet = converterContext.getEntitySet();
	let capabilities;
	if (isEntitySet(entitySet)) {
		capabilities = entitySet.annotations.Capabilities;
	}
	const nonFilterableProperties = capabilities?.FilterRestrictions?.NonFilterableProperties as any[];
	const properties = entityType.entityProperties;
	properties.forEach((property: Property) => {
		const PropertyPath = property.name;
		if (PropertyPath === valueListProperty) {
			bHidden = property.annotations?.UI?.Hidden?.valueOf();
		}
	});
	if (nonFilterableProperties && nonFilterableProperties.length > 0) {
		for (let i = 0; i < nonFilterableProperties.length; i++) {
			const sPropertyName = nonFilterableProperties[i]?.value;
			if (sPropertyName === valueListProperty) {
				bNotFilterable = true;
			}
		}
	}
	return bNotFilterable || bHidden;
}
