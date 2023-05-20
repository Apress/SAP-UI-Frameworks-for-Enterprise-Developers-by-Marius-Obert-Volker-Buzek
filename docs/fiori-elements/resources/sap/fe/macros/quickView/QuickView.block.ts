import type { AnnotationTerm, EntityType, NavigationProperty, Property, PropertyAnnotationValue } from "@sap-ux/vocabularies-types";
import type * as Edm from "@sap-ux/vocabularies-types/Edm";
import type { CommonAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/Common";
import * as MetaModelConverter from "sap/fe/core/converters/MetaModelConverter";
import {
	compileExpression,
	getExpressionFromAnnotation,
	pathInModel,
	type BindingToolkitExpression,
	type CompiledBindingToolkitExpression
} from "sap/fe/core/helpers/BindingToolkit";
import { isProperty } from "sap/fe/core/helpers/TypeGuards";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import {
	getDynamicPathFromSemanticObject,
	getSemanticObjectMappings,
	getSemanticObjects,
	getSemanticObjectUnavailableActions
} from "sap/fe/core/templating/SemanticObjectHelper";
import {
	getDataModelObjectPathForValue,
	getPropertyWithSemanticObject,
	isUsedInNavigationWithQuickViewFacets
} from "sap/fe/macros/field/FieldTemplating";

import BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import { blockAttribute, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import type { TemplateProcessorSettings } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import type { PropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import type {
	RegisteredPayload,
	RegisteredSemanticObjectMapping,
	RegisteredSemanticObjectUnavailableActions
} from "sap/fe/macros/quickView/QuickViewDelegate";
import type Context from "sap/ui/model/Context";

@defineBuildingBlock({
	name: "QuickView",
	namespace: "sap.fe.macros",
	designtime: "sap/fe/macros/quickView/QuickView.designtime"
})
export default class QuickViewBlock extends BuildingBlockBase {
	/**
	 * Metadata path to the dataField.
	 * This property is usually a metadataContext pointing to a DataField having
	 * $Type of DataField, DataFieldWithUrl, DataFieldForAnnotation, DataFieldForAction, DataFieldForIntentBasedNavigation, DataFieldWithNavigationPath, or DataPointType.
	 * But it can also be a Property with $kind="Property"
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
		required: true,
		expectedTypes: ["Property"],
		expectedAnnotationTypes: [
			"com.sap.vocabularies.UI.v1.DataField",
			"com.sap.vocabularies.UI.v1.DataFieldWithUrl",
			"com.sap.vocabularies.UI.v1.DataFieldForAnnotation",
			"com.sap.vocabularies.UI.v1.DataPointType"
		]
	})
	public dataField!: Context;

	/**
	 * Metadata path to the entity set
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
		required: true,
		expectedTypes: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
	})
	public contextPath!: Context;

	/**
	 * Custom semantic object
	 */
	@blockAttribute({
		type: "string"
	})
	public semanticObject?: string;

	private payload!: RegisteredPayload;

	/**
	 * Get the relative path to the entity which quick view Facets we want to display.
	 *
	 * @param propertyDataModelPath
	 * @returns A path if it exists.
	 */
	static getRelativePathToQuickViewEntity(propertyDataModelPath: DataModelObjectPath): string | undefined {
		let relativePathToQuickViewEntity: string | undefined;
		const quickViewNavProp = this.getNavPropToQuickViewEntity(propertyDataModelPath);
		if (quickViewNavProp) {
			relativePathToQuickViewEntity = propertyDataModelPath.navigationProperties.reduce((relativPath: string, navProp) => {
				if (
					navProp.name !== quickViewNavProp.name &&
					!propertyDataModelPath.contextLocation?.navigationProperties.find(
						(contextNavProp) => contextNavProp.name === navProp.name
					)
				) {
					// we keep only navProperties that are part of the relativePath and not the one for quickViewNavProp
					return `${relativPath}${navProp.name}/`;
				}
				return relativPath;
			}, "");
			relativePathToQuickViewEntity = `${relativePathToQuickViewEntity}${quickViewNavProp.name}`;
		}
		return relativePathToQuickViewEntity;
	}

	/**
	 * Get the semanticObject compile biding from metadata and a map to the qualifiers.
	 *
	 * @param propertyWithSemanticObject The property that holds semanticObject annotataions if it exists
	 * @returns An object containing semanticObjectList and qualifierMap
	 */
	static getSemanticObjectsForPayloadAndQualifierMap(propertyWithSemanticObject: Property | NavigationProperty | undefined) {
		const qualifierMap: Record<string, CompiledBindingToolkitExpression> = {};
		const semanticObjectsList: string[] = [];
		if (propertyWithSemanticObject !== undefined) {
			for (const semanticObject of getSemanticObjects(propertyWithSemanticObject)) {
				const compiledSemanticObject = compileExpression(
					getExpressionFromAnnotation(
						semanticObject as unknown as PropertyAnnotationValue<Property>
					) as BindingToolkitExpression<string>
				);
				// this should not happen, but we make sure not to add twice the semanticObject otherwise the mdcLink crashes
				if (compiledSemanticObject && !semanticObjectsList.includes(compiledSemanticObject)) {
					qualifierMap[semanticObject.qualifier || ""] = compiledSemanticObject;
					semanticObjectsList.push(compiledSemanticObject);
				}
			}
		}
		return { semanticObjectsList, qualifierMap };
	}

	/**
	 * Get the semanticObjectMappings from metadata in the payload expected structure.
	 *
	 * @param propertyWithSemanticObject
	 * @param qualifierMap
	 * @returns A payload structure for semanticObjectMappings
	 */
	static getSemanticObjectMappingsForPayload(
		propertyWithSemanticObject: Property | NavigationProperty | undefined,
		qualifierMap: Record<string, CompiledBindingToolkitExpression>
	) {
		const semanticObjectMappings: RegisteredSemanticObjectMapping[] = [];
		if (propertyWithSemanticObject !== undefined) {
			for (const semanticObjectMapping of getSemanticObjectMappings(propertyWithSemanticObject)) {
				const correspondingSemanticObject = qualifierMap[semanticObjectMapping.qualifier || ""];
				if (correspondingSemanticObject) {
					semanticObjectMappings.push({
						semanticObject: correspondingSemanticObject,
						items: semanticObjectMapping.map((semanticObjectMappingType) => {
							return {
								key: semanticObjectMappingType.LocalProperty.value,
								value: semanticObjectMappingType.SemanticObjectProperty.valueOf() as string
							};
						})
					});
				}
			}
		}
		return semanticObjectMappings;
	}

	/**
	 * Get the semanticObjectUnavailableActions from metadata in the payload expected structure.
	 *
	 * @param propertyWithSemanticObject
	 * @param qualifierMap
	 * @returns A payload structure for semanticObjectUnavailableActions
	 */
	static getSemanticObjectUnavailableActionsForPayload(
		propertyWithSemanticObject: Property | NavigationProperty | undefined,
		qualifierMap: Record<string, CompiledBindingToolkitExpression>
	) {
		const semanticObjectUnavailableActions: RegisteredSemanticObjectUnavailableActions = [];
		if (propertyWithSemanticObject !== undefined) {
			for (const unavailableActionAnnotation of getSemanticObjectUnavailableActions(propertyWithSemanticObject) as ({
				term: CommonAnnotationTerms.SemanticObjectUnavailableActions;
			} & AnnotationTerm<Edm.String[]>)[]) {
				const correspondingSemanticObject = qualifierMap[unavailableActionAnnotation.qualifier || ""];
				if (correspondingSemanticObject) {
					semanticObjectUnavailableActions.push({
						semanticObject: correspondingSemanticObject,
						actions: unavailableActionAnnotation.map((unavailableAction) => unavailableAction as string)
					});
				}
			}
		}
		return semanticObjectUnavailableActions;
	}

	/**
	 * Add customObject(s) to the semanticObject list for the payload if it exists.
	 *
	 * @param semanticObjectsList
	 * @param customSemanticObject
	 */
	static addCustomSemanticObjectToSemanticObjectListForPayload(
		semanticObjectsList: string[],
		customSemanticObject: string | undefined
	): void {
		if (customSemanticObject) {
			// the custom semantic objects are either a single string/key to custom data or a stringified array
			if (!customSemanticObject.startsWith("[")) {
				// customSemanticObject = "semanticObject" | "{pathInModel}"
				if (!semanticObjectsList.includes(customSemanticObject)) {
					semanticObjectsList.push(customSemanticObject);
				}
			} else {
				// customSemanticObject = '["semanticObject1","semanticObject2"]'
				for (const semanticObject of JSON.parse(customSemanticObject) as string[]) {
					if (!semanticObjectsList.includes(semanticObject)) {
						semanticObjectsList.push(semanticObject);
					}
				}
			}
		}
	}

	/**
	 * Get the navigationProperty to an entity with QuickViewFacets that can be linked to the property.
	 *
	 * @param propertyDataModelPath
	 * @returns A navigation property if it exists.
	 */
	static getNavPropToQuickViewEntity(propertyDataModelPath: DataModelObjectPath) {
		//TODO we should investigate to put this code as common with FieldTemplating.isUsedInNavigationWithQuickViewFacets
		const property = propertyDataModelPath.targetObject as Property;
		const navigationProperties = propertyDataModelPath.targetEntityType.navigationProperties;
		let quickViewNavProp = navigationProperties.find((navProp: NavigationProperty) => {
			return navProp.referentialConstraint.some((referentialConstraint) => {
				return referentialConstraint.sourceProperty === property.name && navProp.targetType.annotations.UI?.QuickViewFacets;
			});
		});
		if (!quickViewNavProp && propertyDataModelPath.contextLocation?.targetEntitySet !== propertyDataModelPath.targetEntitySet) {
			const semanticKeys = propertyDataModelPath.targetEntityType.annotations.Common?.SemanticKey || [];
			const isPropertySemanticKey = semanticKeys.some(function (semanticKey) {
				return semanticKey.$target.name === property.name;
			});
			const lastNavProp = propertyDataModelPath.navigationProperties[propertyDataModelPath.navigationProperties.length - 1];
			if ((isPropertySemanticKey || property.isKey) && propertyDataModelPath.targetEntityType.annotations.UI?.QuickViewFacets) {
				quickViewNavProp = lastNavProp as unknown as NavigationProperty;
			}
		}
		return quickViewNavProp;
	}

	constructor(props: PropertiesOf<QuickViewBlock>, controlConfiguration: unknown, settings: TemplateProcessorSettings) {
		super(props, controlConfiguration, settings);
		let metaPathDataModelPath = MetaModelConverter.getInvolvedDataModelObjects(this.dataField, this.contextPath);
		const valueDataModelPath = getDataModelObjectPathForValue(metaPathDataModelPath);
		metaPathDataModelPath = valueDataModelPath || metaPathDataModelPath;

		const valueProperty = isProperty(metaPathDataModelPath.targetObject) ? metaPathDataModelPath.targetObject : undefined;
		const hasQuickViewFacets =
			valueProperty && isUsedInNavigationWithQuickViewFacets(metaPathDataModelPath, valueProperty) ? "true" : "false";

		const relativePathToQuickViewEntity = QuickViewBlock.getRelativePathToQuickViewEntity(metaPathDataModelPath);
		// it can be that there is no targetEntityset for the context location so we use the targetObjectFullyQualifiedName
		const absoluteContextPath =
			metaPathDataModelPath.contextLocation?.targetEntitySet?.name ??
			(metaPathDataModelPath.contextLocation?.targetObject as NavigationProperty | EntityType).fullyQualifiedName;
		const quickViewEntity = relativePathToQuickViewEntity ? `/${absoluteContextPath}/${relativePathToQuickViewEntity}` : undefined;
		const navigationPath = relativePathToQuickViewEntity ? compileExpression(pathInModel(relativePathToQuickViewEntity)) : undefined;

		const propertyWithSemanticObject = getPropertyWithSemanticObject(metaPathDataModelPath);
		let mainSemanticObject;
		const { semanticObjectsList, qualifierMap } =
			QuickViewBlock.getSemanticObjectsForPayloadAndQualifierMap(propertyWithSemanticObject);
		const semanticObjectMappings = QuickViewBlock.getSemanticObjectMappingsForPayload(propertyWithSemanticObject, qualifierMap);
		const semanticObjectUnavailableActions = QuickViewBlock.getSemanticObjectUnavailableActionsForPayload(
			propertyWithSemanticObject,
			qualifierMap
		);
		if (isProperty(propertyWithSemanticObject)) {
			// TODO why should this be different for navigation: when we add this some links disappear
			mainSemanticObject = qualifierMap.main || qualifierMap[""];
		}
		QuickViewBlock.addCustomSemanticObjectToSemanticObjectListForPayload(semanticObjectsList, this.semanticObject);
		const propertyPathLabel = (valueProperty?.annotations.Common?.Label?.valueOf() as string) || "";

		this.payload = {
			semanticObjects: semanticObjectsList,
			entityType: quickViewEntity,
			semanticObjectUnavailableActions: semanticObjectUnavailableActions,
			semanticObjectMappings: semanticObjectMappings,
			mainSemanticObject: mainSemanticObject,
			propertyPathLabel: propertyPathLabel,
			dataField: quickViewEntity === undefined ? this.dataField.getPath() : undefined,
			contact: undefined,
			navigationPath: navigationPath,
			hasQuickViewFacets: hasQuickViewFacets
		};
	}

	/**
	 * The building block template function.
	 *
	 * @returns An XML-based string with the definition of the field control
	 */
	getTemplate() {
		const delegateConfiguration = {
			name: "sap/fe/macros/quickView/QuickViewDelegate",
			payload: this.payload
		};

		return xml`<mdc:Link xmlns:mdc="sap.ui.mdc" delegate="${JSON.stringify(delegateConfiguration)}">
			${this.writeCustomData(this.payload.semanticObjects)}
			</mdc:Link>`;
	}

	writeCustomData(semanticObjects: string[]) {
		let customData = "";
		for (const semanticObject of semanticObjects) {
			const dynamicPath = getDynamicPathFromSemanticObject(semanticObject);
			if (dynamicPath) {
				customData = `${customData}
				<core:CustomData xmlns:core="sap.ui.core" key="${dynamicPath}" value="${semanticObject}" />`;
			}
		}
		if (customData.length) {
			return `<mdc:customData>
				${customData}
			</mdc:customData>`;
		}
		return "";
	}
}
