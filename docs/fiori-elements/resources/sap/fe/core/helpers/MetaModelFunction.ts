// The goal of this file is to disappear as soon as we can.
// It is a temporary solution to move all metamodel related operation from CommonUtils to a separate file.

import type * as Edm from "@sap-ux/vocabularies-types/Edm";
import type {
	FilterRestrictionsType,
	NavigationPropertyRestrictionTypes,
	NavigationRestrictionsType,
	SearchRestrictionsType
} from "@sap-ux/vocabularies-types/vocabularies/Capabilities";
import type AppComponent from "sap/fe/core/AppComponent";
import { IssueCategory, IssueCategoryType, IssueSeverity } from "sap/fe/core/converters/helpers/IssueManager";
import type { CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { compileExpression, not, or, pathInModel } from "sap/fe/core/helpers/BindingToolkit";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import type { DefaultTypeForEdmType } from "sap/fe/core/type/EDM";
import { isTypeFilterable } from "sap/fe/core/type/EDM";
import type Context from "sap/ui/model/Context";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import type { ExpandPathType, MetaModelEntitySetAnnotation, MetaModelEntityType, MetaModelType } from "types/metamodel_types";

// From FilterBar.block.ts only
export function getSearchRestrictions(fullPath: string, metaModel: ODataMetaModel) {
	let searchRestrictions;
	let navigationSearchRestrictions;
	const navigationText = "$NavigationPropertyBinding";
	const searchRestrictionsTerm = "@Org.OData.Capabilities.V1.SearchRestrictions";
	const entityTypePathParts = fullPath.replaceAll("%2F", "/").split("/").filter(ModelHelper.filterOutNavPropBinding);
	const entitySetPath = ModelHelper.getEntitySetPath(fullPath, metaModel);
	const entitySetPathParts = entitySetPath.split("/").filter(ModelHelper.filterOutNavPropBinding);
	const isContainment = metaModel.getObject(`/${entityTypePathParts.join("/")}/$ContainsTarget`) ? true : false;
	const containmentNavPath = isContainment ? entityTypePathParts[entityTypePathParts.length - 1] : "";

	//LEAST PRIORITY - Search restrictions directly at Entity Set
	//e.g. FR in "NS.EntityContainer/SalesOrderManage" ContextPath: /SalesOrderManage
	if (!isContainment) {
		searchRestrictions = metaModel.getObject(`${entitySetPath}${searchRestrictionsTerm}`) as
			| MetaModelType<SearchRestrictionsType>
			| undefined;
	}
	if (entityTypePathParts.length > 1) {
		const navPath: string = isContainment ? containmentNavPath : entitySetPathParts[entitySetPathParts.length - 1];
		// In case of containment we take entitySet provided as parent. And in case of normal we would remove the last navigation from entitySetPath.
		const parentEntitySetPath = isContainment ? entitySetPath : `/${entitySetPathParts.slice(0, -1).join(`/${navigationText}/`)}`;

		//HIGHEST priority - Navigation restrictions
		//e.g. Parent "/Customer" with NavigationPropertyPath="Set" ContextPath: Customer/Set
		const navigationRestrictions = METAMODEL_FUNCTIONS.getNavigationRestrictions(
			metaModel,
			parentEntitySetPath,
			navPath.replaceAll("%2F", "/")
		);
		navigationSearchRestrictions = navigationRestrictions?.SearchRestrictions;
	}
	return navigationSearchRestrictions ?? searchRestrictions;
}

// From CommonUtils
export function getNavigationRestrictions(metaModelContext: ODataMetaModel, entitySetPath: string, navigationPath: string) {
	const navigationRestrictions = metaModelContext.getObject(`${entitySetPath}@Org.OData.Capabilities.V1.NavigationRestrictions`) as
		| MetaModelType<NavigationRestrictionsType>
		| undefined;
	const restrictedProperties = navigationRestrictions?.RestrictedProperties;
	return restrictedProperties?.find(function (restrictedProperty) {
		return restrictedProperty.NavigationProperty?.$NavigationPropertyPath === navigationPath;
	});
}

// Internal usage only
function isInNonFilterableProperties(metamodelContext: ODataMetaModel, entitySetPath: string, contextPath: string) {
	let isNotFilterable = false;
	const filterRestrictionsAnnotation = metamodelContext.getObject(`${entitySetPath}@Org.OData.Capabilities.V1.FilterRestrictions`) as
		| MetaModelType<FilterRestrictionsType>
		| undefined;
	if (filterRestrictionsAnnotation?.NonFilterableProperties) {
		isNotFilterable = filterRestrictionsAnnotation.NonFilterableProperties.some(function (property) {
			return (
				(property as unknown as ExpandPathType<Edm.NavigationPropertyPath>).$NavigationPropertyPath === contextPath ||
				property.$PropertyPath === contextPath
			);
		});
	}
	return isNotFilterable;
}

// Internal usage only
export function isCustomAggregate(metamodelContext: ODataMetaModel, entitySetPath: string, contextPath: string) {
	let interanlIsCustomAggregate = false;
	// eslint-disable-next-line regex/invalid-warn
	const isApplySupported = metamodelContext.getObject(entitySetPath + "@Org.OData.Aggregation.V1.ApplySupported") ? true : false;
	if (isApplySupported) {
		const entitySetAnnotations = metamodelContext.getObject(`${entitySetPath}@`) as MetaModelEntitySetAnnotation;
		const customAggregatesAnnotations = METAMODEL_FUNCTIONS.getAllCustomAggregates(entitySetAnnotations) as object | undefined;
		const customAggregates = customAggregatesAnnotations ? Object.keys(customAggregatesAnnotations) : undefined;
		if (customAggregates?.includes(contextPath)) {
			interanlIsCustomAggregate = true;
		}
	}
	return interanlIsCustomAggregate;
}

// Internal usage only

function checkEntitySetIsFilterable(
	entitySetPath: string,
	metaModelContext: ODataMetaModel,
	property: string,
	navigationContext: Context | null
) {
	let isFilterable =
		entitySetPath.split("/").length === 2 && !property.includes("/")
			? !isInNonFilterableProperties(metaModelContext, entitySetPath, property) &&
			  !isCustomAggregate(metaModelContext, entitySetPath, property)
			: !isContextPathFilterable(metaModelContext, entitySetPath, property);
	// check if type can be used for filtering
	if (isFilterable && navigationContext) {
		const propertyDataType = getPropertyDataType(navigationContext);
		if (propertyDataType) {
			isFilterable = propertyDataType ? isTypeFilterable(propertyDataType as keyof typeof DefaultTypeForEdmType) : false;
		} else {
			isFilterable = false;
		}
	}
	return isFilterable;
}

// Internal usage only
function isContextPathFilterable(metaModelContext: ODataMetaModel, entitySetPath: string, contextPath: string) {
	const fullPath = `${entitySetPath}/${contextPath}`,
		esParts = fullPath.split("/").splice(0, 2),
		contexts = fullPath.split("/").splice(2);
	let isNoFilterable = false,
		context = "";

	entitySetPath = esParts.join("/");

	isNoFilterable = contexts.some(function (item: string, index: number, array: string[]) {
		if (context.length > 0) {
			context += `/${item}`;
		} else {
			context = item;
		}
		if (index === array.length - 2) {
			// In case of "/Customer/Set/Property" this is to check navigation restrictions of "Customer" for non-filterable properties in "Set"
			const navigationRestrictions = METAMODEL_FUNCTIONS.getNavigationRestrictions(metaModelContext, entitySetPath, item);
			const filterRestrictions = navigationRestrictions?.FilterRestrictions;
			const nonFilterableProperties = filterRestrictions?.NonFilterableProperties;
			const targetPropertyPath = array[array.length - 1];
			if (
				nonFilterableProperties?.find(function (propertyPath) {
					return propertyPath.$PropertyPath === targetPropertyPath;
				})
			) {
				return true;
			}
		}
		if (index === array.length - 1) {
			//last path segment
			isNoFilterable = isInNonFilterableProperties(metaModelContext, entitySetPath, context);
		} else if (metaModelContext.getObject(`${entitySetPath}/$NavigationPropertyBinding/${item}`)) {
			//check existing context path and initialize it
			isNoFilterable = isInNonFilterableProperties(metaModelContext, entitySetPath, context);
			context = "";
			//set the new EntitySet
			entitySetPath = `/${metaModelContext.getObject(`${entitySetPath}/$NavigationPropertyBinding/${item}`) as string}`;
		}
		return isNoFilterable;
	});
	return isNoFilterable;
}

// Internal usage only

function getPropertyDataType(navigationContext: Context) {
	let dataType = navigationContext.getProperty("$Type") as string | undefined;
	// if $kind exists, it's not a DataField and we have the final type already
	if (!navigationContext.getProperty("$kind")) {
		switch (dataType) {
			case "com.sap.vocabularies.UI.v1.DataFieldForAction":
			case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
				dataType = undefined;
				break;

			case "com.sap.vocabularies.UI.v1.DataField":
			case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
			case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
			case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
			case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
				dataType = navigationContext.getProperty("Value/$Path/$Type") as string | undefined;
				break;

			case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
			default:
				const annotationPath = navigationContext.getProperty("Target/$AnnotationPath") as string | undefined;
				if (annotationPath) {
					if (annotationPath.includes("com.sap.vocabularies.Communication.v1.Contact")) {
						dataType = navigationContext.getProperty("Target/$AnnotationPath/fn/$Path/$Type") as string | undefined;
					} else if (annotationPath.includes("com.sap.vocabularies.UI.v1.DataPoint")) {
						dataType = navigationContext.getProperty("Value/$Path/$Type") as string | undefined;
					} else {
						// e.g. FieldGroup or Chart
						dataType = undefined;
					}
				} else {
					dataType = undefined;
				}
				break;
		}
	}

	return dataType;
}

// From CommonUtils, CommonHelper, FilterBarDelegate, FilterField, ValueListHelper, TableDelegate
// TODO check used places and rework this
export function isPropertyFilterable(
	metaModelContext: ODataMetaModel,
	entitySetPath: string,
	property: string,
	skipHiddenFilters?: boolean
): boolean | CompiledBindingToolkitExpression {
	if (typeof property !== "string") {
		throw new Error("sProperty parameter must be a string");
	}

	// Parameters should be rendered as filterfields
	if (metaModelContext.getObject(`${entitySetPath}/@com.sap.vocabularies.Common.v1.ResultContext`) === true) {
		return true;
	}

	const navigationContext = metaModelContext.createBindingContext(`${entitySetPath}/${property}`);

	if (navigationContext && !skipHiddenFilters) {
		if (
			navigationContext.getProperty("@com.sap.vocabularies.UI.v1.Hidden") === true ||
			navigationContext.getProperty("@com.sap.vocabularies.UI.v1.HiddenFilter") === true
		) {
			return false;
		}
		const hiddenPath = navigationContext.getProperty("@com.sap.vocabularies.UI.v1.Hidden/$Path") as string | undefined;
		const hiddenFilterPath = navigationContext.getProperty("@com.sap.vocabularies.UI.v1.HiddenFilter/$Path") as string | undefined;

		if (hiddenPath && hiddenFilterPath) {
			return compileExpression(not(or(pathInModel(hiddenPath), pathInModel(hiddenFilterPath))));
		} else if (hiddenPath) {
			return compileExpression(not(pathInModel(hiddenPath)));
		} else if (hiddenFilterPath) {
			return compileExpression(not(pathInModel(hiddenFilterPath)));
		}
	}
	return checkEntitySetIsFilterable(entitySetPath, metaModelContext, property, navigationContext);
}

// From TransactionHelper / EditFlow
export function getNonComputedVisibleFields(metaModelContext: ODataMetaModel, path: string, appComponent?: AppComponent) {
	const technicalKeys: string[] = (metaModelContext.getObject(`${path}/`) as MetaModelEntityType).$Key;
	const nonComputedVisibleKeys: unknown[] = [];
	const immutableVisibleFields: unknown[] = [];
	const entityType = metaModelContext.getObject(`${path}/`) as MetaModelEntityType;
	for (const item in entityType) {
		if (entityType[item].$kind && entityType[item].$kind === "Property") {
			const annotations = (metaModelContext.getObject(`${path}/${item}@`) || {}) as Record<string, unknown>,
				isKey = technicalKeys.includes(item),
				isImmutable = annotations["@Org.OData.Core.V1.Immutable"],
				isNonComputed = !annotations["@Org.OData.Core.V1.Computed"],
				isVisible = !annotations["@com.sap.vocabularies.UI.v1.Hidden"],
				isComputedDefaultValue = annotations["@Org.OData.Core.V1.ComputedDefaultValue"],
				isKeyComputedDefaultValueWithText =
					isKey && entityType[item].$Type === "Edm.Guid"
						? isComputedDefaultValue && annotations["@com.sap.vocabularies.Common.v1.Text"]
						: false;
			if ((isKeyComputedDefaultValueWithText || (isKey && entityType[item].$Type !== "Edm.Guid")) && isNonComputed && isVisible) {
				nonComputedVisibleKeys.push(item);
			} else if (isImmutable && isNonComputed && isVisible) {
				immutableVisibleFields.push(item);
			}

			if (!isNonComputed && isComputedDefaultValue && appComponent) {
				const diagnostics = appComponent.getDiagnostics();
				const message = "Core.ComputedDefaultValue is ignored as Core.Computed is already set to true";
				diagnostics.addIssue(
					IssueCategory.Annotation,
					IssueSeverity.Medium,
					message,
					IssueCategoryType,
					IssueCategoryType.Annotations.IgnoredAnnotation
				);
			}
		}
	}
	const requiredProperties = METAMODEL_FUNCTIONS.getRequiredPropertiesFromInsertRestrictions(path, metaModelContext);
	if (requiredProperties.length) {
		requiredProperties.forEach(function (property: string) {
			const annotations = metaModelContext.getObject(`${path}/${property}@`) as Record<string, unknown> | undefined,
				isVisible = !annotations?.["@com.sap.vocabularies.UI.v1.Hidden"];
			if (isVisible && !nonComputedVisibleKeys.includes(property) && !immutableVisibleFields.includes(property)) {
				nonComputedVisibleKeys.push(property);
			}
		});
	}
	return nonComputedVisibleKeys.concat(immutableVisibleFields);
}
// Internal only, exposed for tests
function getRequiredProperties(path: string, metaModelContext: ODataMetaModel, checkUpdateRestrictions = false) {
	const requiredProperties: string[] = [];
	let requiredPropertiesWithPath: { $PropertyPath: string }[] = [];
	const navigationText = "$NavigationPropertyBinding";
	let entitySetAnnotation: MetaModelEntitySetAnnotation | null = null;
	if (path.endsWith("$")) {
		// if sPath comes with a $ in the end, removing it as it is of no significance
		path = path.replace("/$", "");
	}
	const entityTypePathParts = path.replaceAll("%2F", "/").split("/").filter(ModelHelper.filterOutNavPropBinding);
	const entitySetPath = ModelHelper.getEntitySetPath(path, metaModelContext);
	const entitySetPathParts = entitySetPath.split("/").filter(ModelHelper.filterOutNavPropBinding);
	const isContainment = metaModelContext.getObject(`/${entityTypePathParts.join("/")}/$ContainsTarget`) ? true : false;
	const containmentNavPath = isContainment ? entityTypePathParts[entityTypePathParts.length - 1] : "";

	//Restrictions directly at Entity Set
	//e.g. FR in "NS.EntityContainer/SalesOrderManage" ContextPath: /SalesOrderManage
	if (!isContainment) {
		entitySetAnnotation = metaModelContext.getObject(`${entitySetPath}@`) as MetaModelEntitySetAnnotation;
	}
	if (entityTypePathParts.length > 1) {
		const navPath = isContainment ? containmentNavPath : entitySetPathParts[entitySetPathParts.length - 1];
		const parentEntitySetPath = isContainment ? entitySetPath : `/${entitySetPathParts.slice(0, -1).join(`/${navigationText}/`)}`;
		//Navigation restrictions
		//e.g. Parent "/Customer" with NavigationPropertyPath="Set" ContextPath: Customer/Set
		const navigationRestrictions = METAMODEL_FUNCTIONS.getNavigationRestrictions(
			metaModelContext,
			parentEntitySetPath,
			navPath.replaceAll("%2F", "/")
		);

		if (
			navigationRestrictions !== undefined &&
			METAMODEL_FUNCTIONS.hasRestrictedPropertiesInAnnotations(navigationRestrictions, true, checkUpdateRestrictions)
		) {
			requiredPropertiesWithPath = checkUpdateRestrictions
				? navigationRestrictions.UpdateRestrictions?.RequiredProperties ?? []
				: navigationRestrictions.InsertRestrictions?.RequiredProperties ?? [];
		}
		if (
			!requiredPropertiesWithPath.length &&
			METAMODEL_FUNCTIONS.hasRestrictedPropertiesInAnnotations(entitySetAnnotation, false, checkUpdateRestrictions)
		) {
			requiredPropertiesWithPath = METAMODEL_FUNCTIONS.getRequiredPropertiesFromAnnotations(
				entitySetAnnotation,
				checkUpdateRestrictions
			);
		}
	} else if (METAMODEL_FUNCTIONS.hasRestrictedPropertiesInAnnotations(entitySetAnnotation, false, checkUpdateRestrictions)) {
		requiredPropertiesWithPath = METAMODEL_FUNCTIONS.getRequiredPropertiesFromAnnotations(entitySetAnnotation, checkUpdateRestrictions);
	}
	requiredPropertiesWithPath.forEach(function (requiredProperty) {
		const propertyPath = requiredProperty.$PropertyPath;
		requiredProperties.push(propertyPath);
	});
	return requiredProperties;
}

// TransactionHelper // InternalField
export function getRequiredPropertiesFromInsertRestrictions(path: string, metamodelContext: ODataMetaModel) {
	return METAMODEL_FUNCTIONS.getRequiredProperties(path, metamodelContext);
}

// InternalField
export function getRequiredPropertiesFromUpdateRestrictions(path: string, metamodelContext: ODataMetaModel) {
	return METAMODEL_FUNCTIONS.getRequiredProperties(path, metamodelContext, true);
}

// Internal only, exposed for tests
function getRequiredPropertiesFromAnnotations(annotations: MetaModelEntitySetAnnotation | null, checkUpdateRestrictions = false) {
	if (checkUpdateRestrictions) {
		return annotations?.["@Org.OData.Capabilities.V1.UpdateRestrictions"]?.RequiredProperties ?? [];
	}
	return annotations?.["@Org.OData.Capabilities.V1.InsertRestrictions"]?.RequiredProperties ?? [];
}

// Internal only, exposed for tests
function hasRestrictedPropertiesInAnnotations(
	annotations: MetaModelType<NavigationPropertyRestrictionTypes> | MetaModelEntitySetAnnotation | null,
	isNavigationRestrictions = false,
	checkUpdateRestrictions = false
) {
	if (isNavigationRestrictions) {
		const navAnnotations = annotations as MetaModelType<NavigationPropertyRestrictionTypes> | undefined;
		if (checkUpdateRestrictions) {
			return navAnnotations?.UpdateRestrictions?.RequiredProperties ? true : false;
		}
		return navAnnotations?.InsertRestrictions?.RequiredProperties ? true : false;
	} else if (checkUpdateRestrictions) {
		const entityAnnotations = annotations as MetaModelEntitySetAnnotation | undefined;
		return entityAnnotations?.["@Org.OData.Capabilities.V1.UpdateRestrictions"]?.RequiredProperties ? true : false;
	}
	const entitytSetAnnotations = annotations as MetaModelEntitySetAnnotation | undefined;
	return entitytSetAnnotations?.["@Org.OData.Capabilities.V1.InsertRestrictions"]?.RequiredProperties ? true : false;
}

export type CustomAggregateDefinition = {
	contextDefiningProperties?: string[];
	label?: string;
	name?: string;
	propertyPath?: string;
	sortable?: boolean;
	sortOrder?: string;
	custom?: boolean;
};

// Used in this file and FilterUtils
/**
 * Returns custom aggregates for a given entitySet.
 *
 * @param annotations A list of annotations of the entity set
 * @returns A map to the custom aggregates keyed by their qualifiers
 */
export function getAllCustomAggregates(annotations: MetaModelEntitySetAnnotation): Record<string, CustomAggregateDefinition> {
	const customAggregates: Record<string, CustomAggregateDefinition> = {};
	let annotation;
	for (const annotationKey in annotations) {
		if (annotationKey.startsWith("@Org.OData.Aggregation.V1.CustomAggregate")) {
			annotation = annotationKey.replace("@Org.OData.Aggregation.V1.CustomAggregate#", "");
			const annotationParts = annotation.split("@");

			if (annotationParts.length == 2) {
				const customAggregate: CustomAggregateDefinition = {};
				//inner annotation that is not part of 	Validation.AggregatableTerms
				if (annotationParts[1] == "Org.OData.Aggregation.V1.ContextDefiningProperties") {
					customAggregate.contextDefiningProperties = annotations[annotationKey] as string[];
				}

				if (annotationParts[1] == "com.sap.vocabularies.Common.v1.Label") {
					customAggregate.label = annotations[annotationKey] as string;
				}
				customAggregates[annotationParts[0]] = customAggregate;
			} else if (annotationParts.length == 1) {
				customAggregates[annotationParts[0]] = {
					name: annotationParts[0],
					propertyPath: annotationParts[0],
					label: `Custom Aggregate (${annotation})`,
					sortable: true,
					sortOrder: "both",
					custom: true
				};
			}
		}
	}

	return customAggregates;
}

// Used in ValueListHelper, ChartDelegate and ValueHelp-TableDelegate
export type SortRestrictionsPropertyInfoType = {
	sortable: boolean;
	sortDirection?: string;
};

export type SortRestrictionsInfoType = {
	sortable: boolean;
	propertyInfo: Record<string, SortRestrictionsPropertyInfoType>;
};
/**
 * Determines the sorting information from the restriction annotation.
 *
 * @param entitySetAnnotations EntitySet or collection annotations with the sort restrictions annotation
 * @returns An object containing the sort restriction information
 */
export function getSortRestrictionsInfo(entitySetAnnotations: MetaModelEntitySetAnnotation): SortRestrictionsInfoType {
	const sortRestrictionsInfo: SortRestrictionsInfoType = {
		sortable: true,
		propertyInfo: {}
	};

	const sortRestrictions = entitySetAnnotations["@Org.OData.Capabilities.V1.SortRestrictions"];

	if (!sortRestrictions) {
		return sortRestrictionsInfo;
	}

	if (sortRestrictions.Sortable === false) {
		sortRestrictionsInfo.sortable = false;
	}

	for (const propertyItem of sortRestrictions.NonSortableProperties || []) {
		const propertyName = propertyItem.$PropertyPath;
		sortRestrictionsInfo.propertyInfo[propertyName] = {
			sortable: false
		};
	}

	for (const propertyItem of sortRestrictions.AscendingOnlyProperties || []) {
		const propertyName = propertyItem.$PropertyPath;
		sortRestrictionsInfo.propertyInfo[propertyName] = {
			sortable: true,
			sortDirection: "asc" // not used, yet
		};
	}

	for (const propertyItem of sortRestrictions.DescendingOnlyProperties || []) {
		const propertyName = propertyItem.$PropertyPath;
		sortRestrictionsInfo.propertyInfo[propertyName] = {
			sortable: true,
			sortDirection: "desc" // not used, yet
		};
	}

	return sortRestrictionsInfo;
}

// Used in ChartDelegate and ValueHelp-TableDelegate
export type FilterRestrictionsPropertyInfoType = {
	filterable: boolean;
	allowedExpressions?: string[];
};

export type FilterRestrictionsInfoType = {
	filterable: boolean;
	requiresFilter: boolean;
	propertyInfo: Record<string, FilterRestrictionsPropertyInfoType>;
	requiredProperties: string[];
};
/**
 * Determines the filter information based on the filter restrictions annoation.
 *
 * @param filterRestrictions The filter restrictions annotation
 * @returns An object containing the filter restriction information
 */
export function getFilterRestrictionsInfo(filterRestrictions?: MetaModelType<FilterRestrictionsType>): FilterRestrictionsInfoType {
	let i, propertyName;
	const filterRestrictionsInfo: FilterRestrictionsInfoType = {
		filterable: true,
		requiresFilter: (filterRestrictions?.RequiresFilter as boolean) || false,
		propertyInfo: {},
		requiredProperties: []
	};

	if (!filterRestrictions) {
		return filterRestrictionsInfo;
	}

	if (filterRestrictions.Filterable === false) {
		filterRestrictionsInfo.filterable = false;
	}

	//Hierarchical Case
	if (filterRestrictions.RequiredProperties) {
		for (i = 0; i < filterRestrictions.RequiredProperties.length; i++) {
			propertyName = filterRestrictions.RequiredProperties[i].$PropertyPath;
			filterRestrictionsInfo.requiredProperties.push(propertyName);
		}
	}

	if (filterRestrictions.NonFilterableProperties) {
		for (i = 0; i < filterRestrictions.NonFilterableProperties.length; i++) {
			propertyName = filterRestrictions.NonFilterableProperties[i].$PropertyPath;
			filterRestrictionsInfo.propertyInfo[propertyName] = {
				filterable: false
			};
		}
	}

	if (filterRestrictions.FilterExpressionRestrictions) {
		//TBD
		for (i = 0; i < filterRestrictions.FilterExpressionRestrictions.length; i++) {
			propertyName = filterRestrictions.FilterExpressionRestrictions[i].Property?.$PropertyPath;
			if (propertyName) {
				filterRestrictionsInfo.propertyInfo[propertyName] = {
					filterable: true,
					allowedExpressions: filterRestrictions.FilterExpressionRestrictions[i].AllowedExpressions as string[]
				};
			}
		}
	}

	return filterRestrictionsInfo;
}

// Used in ChartDelegate and ValueHelp-TableDelegate
/**
 * Provides the information if the FilterExpression is a multiValue Filter Expression.
 *
 * @param filterExpression The FilterExpressionType
 * @returns A boolean value wether it is a multiValue Filter Expression or not
 */
export function isMultiValueFilterExpression(filterExpression: String) {
	let isMultiValue = true;

	//SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
	switch (filterExpression) {
		case "SearchExpression":
		case "SingleRange":
		case "SingleValue":
			isMultiValue = false;
			break;
		default:
			break;
	}

	return isMultiValue;
}

// DO NOT USE, only for tests and internally in this file
export const METAMODEL_FUNCTIONS = {
	getRequiredProperties,
	getRequiredPropertiesFromAnnotations,
	hasRestrictedPropertiesInAnnotations,
	getRequiredPropertiesFromInsertRestrictions,
	getNavigationRestrictions,
	getAllCustomAggregates
};
