import type { Action, ConvertedMetadata, EntityType, NavigationPropertyPath, PropertyPath } from "@sap-ux/vocabularies-types";
import type { SideEffectsType as CommonSideEffectsType } from "@sap-ux/vocabularies-types/vocabularies/Common";
import { CommonAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/Common";
import Log from "sap/base/Log";
import { convertTypes, EnvironmentCapabilities, getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import { isComplexType, isEntityType, isProperty } from "sap/fe/core/helpers/TypeGuards";
import { getAssociatedTextPropertyPath } from "sap/fe/core/templating/PropertyHelper";
import Service from "sap/ui/core/service/Service";
import ServiceFactory from "sap/ui/core/service/ServiceFactory";
import type Context from "sap/ui/model/odata/v4/Context";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import type { ServiceContext } from "types/metamodel_types";
import { DataModelObjectPath, enhanceDataModelPath, getTargetNavigationPath, getTargetObjectPath } from "../templating/DataModelPathHelper";

type SideEffectsSettings = {};

export type SideEffectsEntityType = {
	$NavigationPropertyPath: string;
};
export type SideEffectsTarget = SideEffectsEntityType | string;

export type SideEffectsTargetType = {
	targetProperties: string[];
	targetEntities: SideEffectsEntityType[];
};

type BaseSideEffectsType = {
	sourceProperties?: string[];
	sourceEntities?: SideEffectsEntityType[];
	fullyQualifiedName: string;
} & SideEffectsTargetType;

export type ODataSideEffectsType = BaseSideEffectsType & {
	triggerAction?: string;
};

export type ActionSideEffectsType = {
	pathExpressions: SideEffectsTarget[];
	triggerActions?: string[];
};

export type ControlSideEffectsType = Partial<BaseSideEffectsType> & {
	fullyQualifiedName: string;
	sourceProperties: string[];
	sourceControlId: string;
};

export type SideEffectsType = ControlSideEffectsType | ODataSideEffectsType;

//TODO fix this type in the ux vocabularies
type CommonSideEffectTypeWithQualifier = CommonSideEffectsType & { qualifier?: string };

export type ODataSideEffectsEntityDictionary = Record<string, ODataSideEffectsType>;
export type ODataSideEffectsActionDictionary = Record<string, ActionSideEffectsType>;
export type ControlSideEffectsEntityDictionary = Record<string, ControlSideEffectsType>;

export type SideEffectInfoForSource = { entity: string; qualifier?: string; hasUniqueSourceProperty?: boolean };

type SideEffectsOriginRegistry = {
	oData: {
		entities: {
			[entity: string]: Record<string, ODataSideEffectsType>;
		};
		actions: {
			[entity: string]: Record<string, ActionSideEffectsType>;
		};
	};
	control: {
		[entity: string]: Record<string, ControlSideEffectsType>;
	};
};

export class SideEffectsService extends Service<SideEffectsSettings> {
	initPromise!: Promise<SideEffectsService>;

	private sideEffectsRegistry!: SideEffectsOriginRegistry;

	private capabilities!: EnvironmentCapabilities | undefined;

	private isInitialized!: boolean;

	private sourcesToSideEffectMappings!: {
		entities: Record<string, SideEffectInfoForSource[]>;
		properties: Record<string, SideEffectInfoForSource[]>;
	};

	// !: means that we know it will be assigned before usage
	init() {
		this.sideEffectsRegistry = {
			oData: {
				entities: {},
				actions: {}
			},
			control: {}
		};
		this.isInitialized = false;
		this.initPromise = Promise.resolve(this);
	}

	/**
	 * Adds a SideEffects control
	 * SideEffects definition is added by a control to keep data up to date
	 * These SideEffects get limited scope compared with SideEffects coming from an OData service:
	 * - Only one SideEffects definition can be defined for the combination entity type - control Id
	 * - Only SideEffects source properties are recognized and used to trigger SideEffects
	 *
	 * Ensure the sourceControlId matches the associated SAPUI5 control ID.
	 *
	 * @ui5-restricted
	 * @param entityType Name of the entity type
	 * @param sideEffect SideEffects definition
	 */
	public addControlSideEffects(entityType: string, sideEffect: Omit<ControlSideEffectsType, "fullyQualifiedName">): void {
		if (sideEffect.sourceControlId) {
			const controlSideEffect: ControlSideEffectsType = {
				...sideEffect,
				fullyQualifiedName: `${entityType}/SideEffectsForControl/${sideEffect.sourceControlId}`
			};
			const entityControlSideEffects = this.sideEffectsRegistry.control[entityType] || {};
			entityControlSideEffects[controlSideEffect.sourceControlId] = controlSideEffect;
			this.sideEffectsRegistry.control[entityType] = entityControlSideEffects;
		}
	}

	/**
	 * Executes SideEffects action.
	 *
	 * @ui5-restricted
	 * @param triggerAction Name of the action
	 * @param context Context
	 * @param groupId The group ID to be used for the request
	 * @returns A promise that is resolved without data or with a return value context when the action call succeeded
	 */
	public executeAction(triggerAction: string, context: Context, groupId?: string): Promise<void> {
		const action = context.getModel().bindContext(`${triggerAction}(...)`, context);
		return action.execute(groupId || context.getBinding().getUpdateGroupId());
	}

	/**
	 * Gets converted OData metaModel.
	 *
	 * @ui5-restricted
	 * @returns Converted OData metaModel
	 */
	public getConvertedMetaModel(): ConvertedMetadata {
		return convertTypes(this.getMetaModel(), this.capabilities);
	}

	/**
	 * Gets the entity type of a context.
	 *
	 * @param context Context
	 * @returns Entity Type
	 */
	public getEntityTypeFromContext(context: Context): string | undefined {
		const metaModel = context.getModel().getMetaModel(),
			metaPath = metaModel.getMetaPath(context.getPath()),
			entityType = metaModel.getObject(metaPath)["$Type"];
		return entityType;
	}

	/**
	 * Gets the SideEffects that come from an OData service.
	 *
	 * @ui5-restricted
	 * @param entityTypeName Name of the entity type
	 * @returns SideEffects dictionary
	 */
	public getODataEntitySideEffects(entityTypeName: string): Record<string, ODataSideEffectsType> {
		return this.sideEffectsRegistry.oData.entities[entityTypeName] || {};
	}

	/**
	 * Gets the global SideEffects that come from an OData service.
	 *
	 * @ui5-restricted
	 * @param entityTypeName Name of the entity type
	 * @returns Global SideEffects
	 */
	public getGlobalODataEntitySideEffects(entityTypeName: string): ODataSideEffectsType[] {
		const entitySideEffects = this.getODataEntitySideEffects(entityTypeName);
		const globalSideEffects: ODataSideEffectsType[] = [];
		for (const key in entitySideEffects) {
			const sideEffects = entitySideEffects[key];
			if (!sideEffects.sourceEntities && !sideEffects.sourceProperties) {
				globalSideEffects.push(sideEffects);
			}
		}
		return globalSideEffects;
	}

	/**
	 * Gets the SideEffects that come from an OData service.
	 *
	 * @ui5-restricted
	 * @param actionName Name of the action
	 * @param context Context
	 * @returns SideEffects definition
	 */
	public getODataActionSideEffects(actionName: string, context?: Context): ActionSideEffectsType | undefined {
		if (context) {
			const entityType = this.getEntityTypeFromContext(context);
			if (entityType) {
				return this.sideEffectsRegistry.oData.actions[entityType]?.[actionName];
			}
		}
		return undefined;
	}

	/**
	 * Generates the dictionary for the SideEffects.
	 *
	 * @ui5-restricted
	 * @param capabilities The current capabilities
	 */
	public initializeSideEffects(capabilities?: EnvironmentCapabilities): void {
		this.capabilities = capabilities;
		if (!this.isInitialized) {
			const sideEffectSources: {
				entities: Record<string, SideEffectInfoForSource[]>;
				properties: Record<string, SideEffectInfoForSource[]>;
			} = {
				entities: {},
				properties: {}
			};
			const convertedMetaModel = this.getConvertedMetaModel();
			convertedMetaModel.entityTypes.forEach((entityType: EntityType) => {
				this.sideEffectsRegistry.oData.entities[entityType.fullyQualifiedName] = this.retrieveODataEntitySideEffects(entityType);
				this.sideEffectsRegistry.oData.actions[entityType.fullyQualifiedName] = this.retrieveODataActionsSideEffects(entityType); // only bound actions are analyzed since unbound ones don't get SideEffects
				this.mapSideEffectSources(entityType, sideEffectSources);
			});
			this.sourcesToSideEffectMappings = sideEffectSources;
			this.isInitialized = true;
		}
	}

	/**
	 * Removes all SideEffects related to a control.
	 *
	 * @ui5-restricted
	 * @param controlId Control Id
	 */
	public removeControlSideEffects(controlId: string): void {
		Object.keys(this.sideEffectsRegistry.control).forEach((sEntityType) => {
			if (this.sideEffectsRegistry.control[sEntityType][controlId]) {
				delete this.sideEffectsRegistry.control[sEntityType][controlId];
			}
		});
	}

	/**
	 * Requests the SideEffects on a specific context.
	 *
	 * @param pathExpressions Targets of SideEffects to be executed
	 * @param context Context where SideEffects need to be executed
	 * @param groupId The group ID to be used for the request
	 * @returns Promise on SideEffects request
	 */
	public requestSideEffects(pathExpressions: SideEffectsTarget[], context: Context, groupId?: string): Promise<undefined> {
		this.logRequest(pathExpressions, context);
		return context.requestSideEffects(pathExpressions as object[], groupId);
	}

	/**
	 * Requests the SideEffects for an OData action.
	 *
	 * @param sideEffects SideEffects definition
	 * @param context Context where SideEffects need to be executed
	 * @returns Promise on SideEffects requests and action execution
	 */
	public requestSideEffectsForODataAction(sideEffects: ActionSideEffectsType, context: Context): Promise<(void | undefined)[]> {
		let promises: Promise<void | undefined>[];

		if (sideEffects.triggerActions?.length) {
			promises = sideEffects.triggerActions.map((actionName) => {
				return this.executeAction(actionName, context);
			});
		} else {
			promises = [];
		}

		if (sideEffects.pathExpressions?.length) {
			promises.push(this.requestSideEffects(sideEffects.pathExpressions, context));
		}

		return promises.length ? Promise.all(promises) : Promise.resolve([]);
	}

	/**
	 * Requests the SideEffects for a navigation property on a specific context.
	 *
	 * @function
	 * @param navigationProperty Navigation property
	 * @param context Context where SideEffects need to be executed
	 * @param groupId Batch group for the query
	 * @returns SideEffects request on SAPUI5 context
	 */
	public requestSideEffectsForNavigationProperty(
		navigationProperty: string,
		context: Context,
		groupId?: string
	): Promise<void | undefined> {
		const baseEntityType = this.getEntityTypeFromContext(context);
		if (baseEntityType) {
			const navigationPath = `${navigationProperty}/`;
			const entitySideEffects = this.getODataEntitySideEffects(baseEntityType);
			let targetProperties: string[] = [];
			let targetEntities: SideEffectsEntityType[] = [];
			let sideEffectsTargets: SideEffectsTarget[] = [];
			Object.keys(entitySideEffects)
				.filter(
					// Keep relevant SideEffects
					(annotationName) => {
						const sideEffects: ODataSideEffectsType = entitySideEffects[annotationName];
						return (
							(sideEffects.sourceProperties || []).some(
								(propertyPath) =>
									propertyPath.startsWith(navigationPath) && propertyPath.replace(navigationPath, "").indexOf("/") === -1
							) ||
							(sideEffects.sourceEntities || []).some(
								(navigation) => navigation.$NavigationPropertyPath === navigationProperty
							)
						);
					}
				)
				.forEach((sAnnotationName) => {
					const sideEffects = entitySideEffects[sAnnotationName];
					if (sideEffects.triggerAction) {
						this.executeAction(sideEffects.triggerAction, context, groupId);
					}
					targetProperties = targetProperties.concat(sideEffects.targetProperties);
					targetEntities = targetEntities.concat(sideEffects.targetEntities);
				});
			// Remove duplicate targets
			const sideEffectsTargetDefinition = this.removeDuplicateTargets({
				targetProperties: targetProperties,
				targetEntities: targetEntities
			});
			sideEffectsTargets = [...sideEffectsTargetDefinition.targetProperties, ...sideEffectsTargetDefinition.targetEntities];
			if (sideEffectsTargets.length) {
				return this.requestSideEffects(sideEffectsTargets, context, groupId).catch((error) =>
					Log.error(`SideEffects - Error while processing SideEffects for Navigation Property ${navigationProperty}`, error)
				);
			}
		}
		return Promise.resolve();
	}

	/**
	 * Gets the SideEffects that come from controls.
	 *
	 * @ui5-restricted
	 * @param entityTypeName Entity type Name
	 * @returns SideEffects dictionary
	 */
	public getControlEntitySideEffects(entityTypeName: string): Record<string, ControlSideEffectsType> {
		return this.sideEffectsRegistry.control[entityTypeName] || {};
	}

	/**
	 * Gets SideEffects' qualifier and owner entity where this entity is used as source.
	 *
	 * @param entityTypeName Entity type fully qualified name
	 * @returns Array of sideEffects info
	 */
	public getSideEffectWhereEntityIsSource(entityTypeName: string): SideEffectInfoForSource[] {
		return this.sourcesToSideEffectMappings.entities[entityTypeName] || [];
	}

	/**
	 * Common method to get the field groupIds for a source entity and a source property.
	 *
	 * @param sourceEntityType
	 * @param sourceProperty
	 * @returns A collection of fieldGroupIds
	 */
	public computeFieldGroupIds(sourceEntityType: string, sourceProperty: string): string[] {
		const entityFieldGroupIds = this.getSideEffectWhereEntityIsSource(sourceEntityType).map((sideEffectInfo) =>
			this.getFieldGroupIdForSideEffect(sideEffectInfo, true)
		);
		return entityFieldGroupIds.concat(
			this.getSideEffectWherePropertyIsSource(sourceProperty).map((sideEffectInfo) =>
				this.getFieldGroupIdForSideEffect(sideEffectInfo)
			)
		);
	}

	/**
	 * Gets SideEffects' qualifier and owner entity where this property is used as source.
	 *
	 * @param propertyName Property fully qualified name
	 * @returns Array of sideEffects info
	 */
	public getSideEffectWherePropertyIsSource(propertyName: string): SideEffectInfoForSource[] {
		return this.sourcesToSideEffectMappings.properties[propertyName] || [];
	}

	/**
	 * Adds the text properties required for SideEffects
	 * If a property has an associated text then this text needs to be added as targetProperties.
	 *
	 * @ui5-restricted
	 * @param sideEffectsTargets SideEffects Targets
	 * @param entityType Entity type
	 * @returns SideEffects definition with added text properties
	 */
	private addTextProperties(sideEffectsTargets: SideEffectsTargetType, entityType: EntityType): SideEffectsTargetType {
		const setOfProperties = new Set(sideEffectsTargets.targetProperties);
		const setOfEntities = new Set(sideEffectsTargets.targetEntities.map((target) => target.$NavigationPropertyPath));

		// Generate all dataModelPath for the properties to analyze (cover "*" and /*)
		const propertiesToAnalyze = sideEffectsTargets.targetProperties.reduce(
			(dataModelPropertyPaths: DataModelObjectPath[], propertyPath) => {
				return dataModelPropertyPaths.concat(this.getDataModelPropertiesFromAPath(propertyPath, entityType));
			},
			[]
		);

		// Generate all paths related to the text properties and not already covered by the SideEffects
		for (const dataModelPropertyPath of propertiesToAnalyze) {
			const associatedTextPath = getAssociatedTextPropertyPath(dataModelPropertyPath.targetObject);
			if (associatedTextPath) {
				const dataModelTextPath = enhanceDataModelPath(dataModelPropertyPath, associatedTextPath);
				const relativeNavigation = getTargetNavigationPath(dataModelTextPath, true);
				const targetPath = getTargetObjectPath(dataModelTextPath, true);
				if (
					isProperty(dataModelTextPath.targetObject) &&
					!setOfProperties.has(targetPath) && // the property is already listed
					!setOfProperties.has(`${relativeNavigation}${dataModelTextPath.navigationProperties.length ? "/" : ""}*`) && // the property is already listed thanks to the "*"
					!setOfEntities.has(`${relativeNavigation}`) // the property is not part of a TargetEntities
				) {
					// The Text association is added as TargetEntities if
					//  - it's contained on a different entitySet than the SideEffects
					//  -  and it's contained on a different entitySet than the sourced property
					// Otherwise it's added as targetProperties
					if (
						dataModelPropertyPath.targetEntitySet !== dataModelTextPath.targetEntitySet &&
						dataModelTextPath.navigationProperties &&
						dataModelTextPath.targetEntityType
					) {
						setOfEntities.add(relativeNavigation);
					} else {
						setOfProperties.add(targetPath);
					}
				}
			}
		}

		return {
			targetProperties: Array.from(setOfProperties),
			targetEntities: Array.from(setOfEntities).map((navigation) => {
				return { $NavigationPropertyPath: navigation };
			})
		};
	}

	/**
	 * Converts the SideEffects to expected format
	 *  - Set TriggerAction as string
	 *  - Converts SideEffects targets to expected format
	 *  - Removes binding parameter from SideEffects targets properties
	 *  - Adds the text properties
	 *  - Replaces TargetProperties having reference to Source Properties for a SideEffects.
	 *
	 * @ui5-restricted
	 * @param sideEffects SideEffects definition
	 * @param entityType Entity type
	 * @param bindingParameter Name of the binding parameter
	 * @returns SideEffects definition
	 */
	private convertSideEffects(
		sideEffects: CommonSideEffectsType,
		entityType: EntityType,
		bindingParameter?: string
	): ODataSideEffectsType {
		const triggerAction = sideEffects.TriggerAction as string;
		const newSideEffects = this.convertSideEffectsFormat(sideEffects);
		let sideEffectsTargets = { targetProperties: newSideEffects.targetProperties, targetEntities: newSideEffects.targetEntities };
		sideEffectsTargets = this.removeBindingParameter(sideEffectsTargets, bindingParameter);
		sideEffectsTargets = this.addTextProperties(sideEffectsTargets, entityType);
		sideEffectsTargets = this.removeDuplicateTargets(sideEffectsTargets);
		return {
			...newSideEffects,
			...{ targetEntities: sideEffectsTargets.targetEntities, targetProperties: sideEffectsTargets.targetProperties, triggerAction }
		};
	}

	/**
	 * Converts the SideEffects targets (TargetEntities and TargetProperties) to expected format
	 *  - TargetProperties as array of string
	 *  - TargetEntities as array of object with property $NavigationPropertyPath.
	 *
	 * @ui5-restricted
	 * @param sideEffects SideEffects definition
	 * @returns Converted SideEffects
	 */
	private convertSideEffectsFormat(sideEffects: CommonSideEffectsType): ODataSideEffectsType {
		const formatProperties = (properties?: (string | PropertyPath)[]) => {
			return properties
				? properties.reduce((targetProperties: string[], target) => {
						const path = ((target as PropertyPath).type && (target as PropertyPath).value) || (target as string);
						if (path) {
							targetProperties.push(path);
						} else {
							Log.error(
								`SideEffects - Error while processing TargetProperties for SideEffects ${sideEffects.fullyQualifiedName}`
							);
						}
						return targetProperties;
				  }, [])
				: properties;
		};
		const formatEntities = (entities?: NavigationPropertyPath[]) => {
			return entities
				? entities.map((targetEntity) => {
						return { $NavigationPropertyPath: targetEntity.value };
				  })
				: entities;
		};
		return {
			fullyQualifiedName: sideEffects.fullyQualifiedName,
			sourceProperties: formatProperties(sideEffects.SourceProperties),
			sourceEntities: formatEntities(sideEffects.SourceEntities),
			targetProperties: formatProperties(sideEffects.TargetProperties as (string | PropertyPath)[]) ?? [],
			targetEntities: formatEntities(sideEffects.TargetEntities) ?? []
		};
	}

	/**
	 * Gets all dataModelObjectPath related to properties listed by a path
	 *
	 * The path can be:
	 *  - a path targeting a property on a complexType or an EntityType
	 *  - a path with a star targeting all properties on a complexType or an EntityType.
	 *
	 * @ui5-restricted
	 * @param path The path to analyze
	 * @param entityType Entity type
	 * @returns Array of dataModelObjectPath representing the properties
	 */
	private getDataModelPropertiesFromAPath(path: string, entityType: EntityType): DataModelObjectPath[] {
		let dataModelObjectPaths: DataModelObjectPath[] = [];
		const convertedMetaModel = this.getConvertedMetaModel();
		const entitySet =
			convertedMetaModel.entitySets.find((relatedEntitySet) => relatedEntitySet.entityType === entityType) ||
			convertedMetaModel.singletons.find((singleton) => singleton.entityType === entityType);

		if (entitySet) {
			const metaModel = this.getMetaModel(),
				entitySetContext = metaModel.createBindingContext(`/${entitySet.name}`);
			if (entitySetContext) {
				const dataModelEntitySet = getInvolvedDataModelObjects(entitySetContext);
				const dataModelObjectPath = enhanceDataModelPath(dataModelEntitySet, path.replace("*", "") || "/"), // "*" is replaced by "/" to target the current EntityType
					targetObject = dataModelObjectPath.targetObject;
				if (isProperty(targetObject)) {
					if (isComplexType(targetObject.targetType)) {
						dataModelObjectPaths = dataModelObjectPaths.concat(
							targetObject.targetType.properties.map((property) => enhanceDataModelPath(dataModelObjectPath, property.name))
						);
					} else {
						dataModelObjectPaths.push(dataModelObjectPath);
					}
				} else if (isEntityType(targetObject)) {
					dataModelObjectPaths = dataModelObjectPaths.concat(
						dataModelObjectPath.targetEntityType.entityProperties.map((entityProperty) => {
							return enhanceDataModelPath(dataModelObjectPath, entityProperty.name);
						})
					);
				}
				entitySetContext.destroy();
			}
		}
		return dataModelObjectPaths.filter((dataModelObjectPath) => dataModelObjectPath.targetObject);
	}

	/**
	 * Gets the Odata metamodel.
	 *
	 * @ui5-restricted
	 * @returns The OData metamodel
	 */
	private getMetaModel(): ODataMetaModel {
		const oContext = this.getContext();
		const oComponent = oContext.scopeObject;
		return oComponent.getModel().getMetaModel();
	}

	/**
	 * Gets the SideEffects related to an entity type or action that come from an OData Service
	 * Internal routine to get, from converted oData metaModel, SideEffects related to a specific entity type or action
	 * and to convert these SideEffects with expected format.
	 *
	 * @ui5-restricted
	 * @param source Entity type or action
	 * @returns Array of SideEffects
	 */
	private getSideEffectsFromSource(source: EntityType | Action): ODataSideEffectsType[] {
		let bindingAlias = "";
		const isSourceEntityType = isEntityType(source);
		const entityType: EntityType | undefined = isSourceEntityType ? source : source.sourceEntityType;
		const commonAnnotation = source.annotations?.Common as undefined | unknown as Record<string, CommonAnnotationTypes>;
		if (entityType && commonAnnotation) {
			if (!isSourceEntityType) {
				const bindingParameter = source.parameters?.find((parameter) => parameter.type === entityType.fullyQualifiedName);
				bindingAlias = bindingParameter?.fullyQualifiedName.split("/")[1] ?? "";
			}
			return this.getSideEffectsAnnotationFromSource(source).map((sideEffectAnno) =>
				this.convertSideEffects(sideEffectAnno, entityType, bindingAlias)
			);
		}
		return [];
	}
	/**
	 * Gets the SideEffects related to an entity type or action that come from an OData Service
	 * Internal routine to get, from converted oData metaModel, SideEffects related to a specific entity type or action.
	 *
	 * @param source Entity type or action
	 * @returns Array of SideEffects
	 */
	private getSideEffectsAnnotationFromSource(source: EntityType | Action): CommonSideEffectTypeWithQualifier[] {
		const sideEffects: CommonSideEffectsType[] = [];
		const commonAnnotation = source.annotations?.Common as undefined | unknown as Record<string, CommonSideEffectTypeWithQualifier>;
		for (const key in commonAnnotation) {
			const annotation = commonAnnotation[key];
			if (this.isSideEffectsAnnotation(annotation)) {
				sideEffects.push(annotation);
			}
		}
		return sideEffects;
	}

	/**
	 * Checks if the annotation is a SideEffects annotation.
	 *
	 * @ui5-restricted
	 * @param annotation Annotation
	 * @returns Boolean
	 */
	private isSideEffectsAnnotation(annotation: unknown): annotation is CommonSideEffectsType {
		return (annotation as CommonSideEffectsType)?.$Type === CommonAnnotationTypes.SideEffectsType;
	}

	/**
	 * Logs the SideEffects request.
	 *
	 * @ui5-restricted
	 * @param pathExpressions SideEffects targets
	 * @param context Context
	 */
	private logRequest(pathExpressions: SideEffectsTarget[], context: Context) {
		const targetPaths = pathExpressions.reduce(function (paths, target) {
			return `${paths}\n\t\t${(target as SideEffectsEntityType).$NavigationPropertyPath || target || ""}`;
		}, "");
		Log.debug(`SideEffects - Request:\n\tContext path : ${context.getPath()}\n\tProperty paths :${targetPaths}`);
	}

	/**
	 * Removes the name of the binding parameter on the SideEffects targets.
	 *
	 * @ui5-restricted
	 * @param sideEffectsTargets SideEffects Targets
	 * @param bindingParameterName Name of binding parameter
	 * @returns SideEffects definition
	 */
	private removeBindingParameter(sideEffectsTargets: SideEffectsTargetType, bindingParameterName?: string): SideEffectsTargetType {
		if (bindingParameterName) {
			const replaceBindingParameter = function (value: string) {
				return value.replace(new RegExp(`^${bindingParameterName}/?`), "");
			};
			return {
				targetProperties: sideEffectsTargets.targetProperties.map((targetProperty) => replaceBindingParameter(targetProperty)),
				targetEntities: sideEffectsTargets.targetEntities.map((targetEntity) => {
					return { $NavigationPropertyPath: replaceBindingParameter(targetEntity.$NavigationPropertyPath) };
				})
			};
		}
		return {
			targetProperties: sideEffectsTargets.targetProperties,
			targetEntities: sideEffectsTargets.targetEntities
		};
	}

	/**
	 * Remove duplicates in SideEffects targets.
	 *
	 * @ui5-restricted
	 * @param sideEffectsTargets SideEffects Targets
	 * @returns SideEffects targets without duplicates
	 */
	private removeDuplicateTargets(sideEffectsTargets: SideEffectsTargetType): SideEffectsTargetType {
		const targetEntitiesPaths = sideEffectsTargets.targetEntities.map((targetEntity) => targetEntity.$NavigationPropertyPath);
		const uniqueTargetedEntitiesPath = new Set<string>(targetEntitiesPaths);
		const uniqueTargetProperties = new Set<string>(sideEffectsTargets.targetProperties);

		const uniqueTargetedEntities = Array.from(uniqueTargetedEntitiesPath).map((entityPath) => {
			return {
				$NavigationPropertyPath: entityPath
			};
		});

		return { targetProperties: Array.from(uniqueTargetProperties), targetEntities: uniqueTargetedEntities };
	}

	/**
	 * Gets SideEffects action type that come from an OData Service
	 * Internal routine to get, from converted oData metaModel, SideEffects on actions
	 * related to a specific entity type and to convert these SideEffects with
	 * expected format.
	 *
	 * @ui5-restricted
	 * @param entityType Entity type
	 * @returns Entity type SideEffects dictionary
	 */
	private retrieveODataActionsSideEffects(entityType: EntityType): Record<string, ActionSideEffectsType> {
		const sideEffects: Record<string, ActionSideEffectsType> = {};
		const actions = entityType.actions;
		if (actions) {
			Object.keys(actions).forEach((actionName) => {
				const action = entityType.actions[actionName];
				const triggerActions = new Set<string>();
				let targetProperties: string[] = [];
				let targetEntities: SideEffectsEntityType[] = [];

				this.getSideEffectsFromSource(action).forEach((oDataSideEffect) => {
					const triggerAction = oDataSideEffect.triggerAction;
					targetProperties = targetProperties.concat(oDataSideEffect.targetProperties);
					targetEntities = targetEntities.concat(oDataSideEffect.targetEntities);
					if (triggerAction) {
						triggerActions.add(triggerAction);
					}
				});
				const sideEffectsTargets = this.removeDuplicateTargets({ targetProperties, targetEntities });
				sideEffects[actionName] = {
					pathExpressions: [...sideEffectsTargets.targetProperties, ...sideEffectsTargets.targetEntities],
					triggerActions: Array.from(triggerActions)
				};
			});
		}
		return sideEffects;
	}

	/**
	 * Gets SideEffects entity type that come from an OData Service
	 * Internal routine to get, from converted oData metaModel, SideEffects
	 * related to a specific entity type and to convert these SideEffects with
	 * expected format.
	 *
	 * @ui5-restricted
	 * @param entityType Entity type
	 * @returns Entity type SideEffects dictionary
	 */
	private retrieveODataEntitySideEffects(entityType: EntityType): Record<string, ODataSideEffectsType> {
		const entitySideEffects: Record<string, ODataSideEffectsType> = {};
		this.getSideEffectsFromSource(entityType).forEach((sideEffects) => {
			entitySideEffects[sideEffects.fullyQualifiedName] = sideEffects;
		});
		return entitySideEffects;
	}

	/**
	 * Defines a map for the Sources of sideEffect on the entity to track where those sources are used in SideEffects annotation.
	 *
	 * @param entityType The entityType we look for side Effects annotation
	 * @param sideEffectsSources The mapping object in construction
	 * @param sideEffectsSources.entities
	 * @param sideEffectsSources.properties
	 */
	private mapSideEffectSources(
		entityType: EntityType,
		sideEffectsSources: { entities: Record<string, SideEffectInfoForSource[]>; properties: Record<string, SideEffectInfoForSource[]> }
	): void {
		for (const sideEffectDefinition of this.getSideEffectsAnnotationFromSource(entityType)) {
			for (const sourceEntity of sideEffectDefinition.SourceEntities ?? []) {
				const targetEntityType = sourceEntity.value ? sourceEntity.$target?.targetType : entityType;
				if (targetEntityType) {
					if (!sideEffectsSources.entities[targetEntityType.fullyQualifiedName]) {
						sideEffectsSources.entities[targetEntityType.fullyQualifiedName] = [];
					}
					sideEffectsSources.entities[targetEntityType.fullyQualifiedName].push({
						entity: entityType.fullyQualifiedName,
						qualifier: sideEffectDefinition.qualifier
					});
				}
			}
			const hasUniqueSourceProperty = sideEffectDefinition.SourceProperties?.length === 1;
			for (const sourceProperty of sideEffectDefinition.SourceProperties ?? []) {
				if (!sideEffectsSources.properties[sourceProperty.$target?.fullyQualifiedName]) {
					sideEffectsSources.properties[sourceProperty.$target?.fullyQualifiedName] = [];
				}
				sideEffectsSources.properties[sourceProperty.$target?.fullyQualifiedName].push({
					entity: entityType.fullyQualifiedName,
					qualifier: sideEffectDefinition.qualifier,
					hasUniqueSourceProperty
				});
			}
		}
	}

	/**
	 * Get the fieldGroupId based on the stored information on th side effect.
	 *
	 * @param sideEffectInfo
	 * @param isImmediate
	 * @returns A string for the fieldGroupId.
	 */
	private getFieldGroupIdForSideEffect(sideEffectInfo: SideEffectInfoForSource, isImmediate: boolean = false): string {
		const sideEffectWithQualifier = sideEffectInfo.qualifier
			? `${sideEffectInfo.entity}#${sideEffectInfo.qualifier}`
			: sideEffectInfo.entity;
		return isImmediate || sideEffectInfo.hasUniqueSourceProperty === true
			? `${sideEffectWithQualifier}$$ImmediateRequest`
			: sideEffectWithQualifier;
	}

	getInterface(): SideEffectsService {
		return this;
	}
}

class SideEffectsServiceFactory extends ServiceFactory<SideEffectsSettings> {
	createInstance(oServiceContext: ServiceContext<SideEffectsSettings>): Promise<SideEffectsService> {
		const SideEffectsServiceService = new SideEffectsService(oServiceContext);
		return SideEffectsServiceService.initPromise;
	}
}

export default SideEffectsServiceFactory;
