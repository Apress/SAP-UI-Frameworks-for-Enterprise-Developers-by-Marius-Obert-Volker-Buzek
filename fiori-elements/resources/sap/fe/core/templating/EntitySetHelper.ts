import type { EntitySet, Singleton } from "@sap-ux/vocabularies-types";
import { isEntitySet } from "sap/fe/core/helpers/TypeGuards";

/**
 * Reads all SortRestrictions of the main entity and the (first level) navigation restrictions.
 * This does not work for more than one level of navigation.
 *
 * @param entitySet Entity set to be analyzed
 * @returns Array containing the property names of all non-sortable properties
 */
export const getNonSortablePropertiesRestrictions = function (entitySet: EntitySet | Singleton | undefined): string[] {
	let nonSortableProperties = [];
	// Check annotations for main entity
	if (isEntitySet(entitySet)) {
		if (entitySet.annotations.Capabilities?.SortRestrictions?.Sortable === false) {
			// add all properties of the entity to the nonSortableProperties
			nonSortableProperties.push(...entitySet.entityType.entityProperties.map((property) => property.name));
		} else {
			nonSortableProperties =
				entitySet.annotations.Capabilities?.SortRestrictions?.NonSortableProperties?.map((property) => property.value) || [];
		}
	} else {
		return [];
	}
	// Check for every navigationRestriction if it has sortRestrictions
	entitySet.annotations.Capabilities?.NavigationRestrictions?.RestrictedProperties?.forEach((navigationRestriction) => {
		if (navigationRestriction?.SortRestrictions?.Sortable === false) {
			// find correct navigation property
			const navigationProperty = entitySet.entityType.navigationProperties.by_name(navigationRestriction?.NavigationProperty?.value);
			if (navigationProperty) {
				// add all properties of the navigation property to the nonSortableProperties
				nonSortableProperties.push(
					...navigationProperty.targetType.entityProperties.map((property) => `${navigationProperty.name}/${property.name}`)
				);
			}
		} else {
			// leave the property path unchanged (it is relative to the annotation target!)
			const nonSortableNavigationProperties = navigationRestriction?.SortRestrictions?.NonSortableProperties?.map(
				(property) => property.value
			);
			if (nonSortableNavigationProperties) {
				nonSortableProperties.push(...nonSortableNavigationProperties);
			}
		}
	});
	return nonSortableProperties;
};
