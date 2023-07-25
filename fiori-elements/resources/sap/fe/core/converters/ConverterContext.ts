import type {
	AnnotationTerm,
	ConvertedMetadata,
	EntityContainer,
	EntitySet,
	EntityType,
	NavigationProperty,
	ResolutionTarget,
	ServiceObject,
	ServiceObjectAndAnnotation,
	Singleton
} from "@sap-ux/vocabularies-types";
import type { EntityTypeAnnotations } from "@sap-ux/vocabularies-types/vocabularies/Edm_Types";
import type { BaseManifestSettings, TemplateType } from "sap/fe/core/converters/ManifestSettings";
import ManifestWrapper from "sap/fe/core/converters/ManifestWrapper";
import { convertTypes, getInvolvedDataModelObjectFromPath } from "sap/fe/core/converters/MetaModelConverter";
import type { IDiagnostics } from "sap/fe/core/converters/TemplateConverter";
import { isServiceObject } from "sap/fe/core/helpers/TypeGuards";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { enhanceDataModelPath, getContextRelativeTargetObjectPath, getTargetObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import Context from "sap/ui/model/Context";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";

export type ResolvedAnnotationContext = {
	annotation: AnnotationTerm<any>;
	converterContext: ConverterContext;
};

/**
 * Checks whether an object is an annotation term.
 *
 * @param vAnnotationPath
 * @returns `true` if it's an annotation term
 */
const isAnnotationTerm = function (vAnnotationPath: string | AnnotationTerm<any>): vAnnotationPath is AnnotationTerm<any> {
	return typeof vAnnotationPath === "object";
};

const getDataModelPathForEntitySet = function (
	resolvedMetaPath: ResolutionTarget<any>,
	convertedTypes: ConvertedMetadata
): DataModelObjectPath {
	let rootEntitySet: EntitySet | undefined;
	let currentEntitySet: EntitySet | undefined;
	let previousEntitySet: EntitySet | undefined;
	let currentEntityType: EntityType | undefined;
	let navigatedPaths: string[] = [];
	const navigationProperties: NavigationProperty[] = [];
	resolvedMetaPath.objectPath.forEach((objectPart: ServiceObjectAndAnnotation) => {
		if (isServiceObject(objectPart)) {
			switch (objectPart._type) {
				case "NavigationProperty":
					navigatedPaths.push(objectPart.name);
					navigationProperties.push(objectPart);
					currentEntityType = objectPart.targetType;
					if (previousEntitySet && previousEntitySet.navigationPropertyBinding.hasOwnProperty(navigatedPaths.join("/"))) {
						currentEntitySet = previousEntitySet.navigationPropertyBinding[navigatedPaths.join("/")] as EntitySet;
						previousEntitySet = currentEntitySet;
						navigatedPaths = [];
					} else {
						currentEntitySet = undefined;
					}
					break;
				case "EntitySet":
					if (rootEntitySet === undefined) {
						rootEntitySet = objectPart;
					}
					currentEntitySet = objectPart;
					previousEntitySet = currentEntitySet;
					currentEntityType = currentEntitySet?.entityType;
					break;
				default:
					break;
			}
		}
	});
	const dataModelPath: DataModelObjectPath = {
		startingEntitySet: rootEntitySet as EntitySet,
		targetEntityType: currentEntityType as EntityType,
		targetEntitySet: currentEntitySet,
		navigationProperties: navigationProperties,
		contextLocation: undefined,
		targetObject: resolvedMetaPath.target,
		convertedTypes: convertedTypes
	};
	dataModelPath.contextLocation = dataModelPath;
	return dataModelPath;
};

/**
 * Create a ConverterContext object that will be used within the converters.
 *
 * @param {ConvertedMetadata} oConvertedTypes The converted annotation and service types
 * @param {BaseManifestSettings} oManifestSettings The manifestSettings that applies to this page
 * @param {TemplateType} templateType The type of template we're looking at right now
 * @param {IDiagnostics} diagnostics The diagnostics shim
 * @param {Function} mergeFn The function to be used to perfom some deep merges between object
 * @param {DataModelObjectPath} targetDataModelPath The global path to reach the entitySet
 * @returns {ConverterContext} A converter context for the converters
 */
class ConverterContext {
	private manifestWrapper: ManifestWrapper;

	private baseContextPath: string;

	constructor(
		private convertedTypes: ConvertedMetadata,
		private manifestSettings: BaseManifestSettings,
		private diagnostics: IDiagnostics,
		private mergeFn: Function,
		private targetDataModelPath: DataModelObjectPath
	) {
		this.manifestWrapper = new ManifestWrapper(this.manifestSettings, mergeFn);
		this.baseContextPath = getTargetObjectPath(this.targetDataModelPath);
	}

	private _getEntityTypeFromFullyQualifiedName(fullyQualifiedName: string): EntityType | undefined {
		return this.convertedTypes.entityTypes.find((entityType) => {
			if (fullyQualifiedName.startsWith(entityType.fullyQualifiedName)) {
				const replaceAnnotation = fullyQualifiedName.replace(entityType.fullyQualifiedName, "");
				return replaceAnnotation.startsWith("/") || replaceAnnotation.startsWith("@");
			}
			return false;
		});
	}

	/**
	 * Retrieve the entityType associated with an annotation object.
	 *
	 * @param annotation The annotation object for which we want to find the entityType
	 * @returns The EntityType the annotation refers to
	 */
	getAnnotationEntityType(annotation?: AnnotationTerm<any>): EntityType {
		if (annotation) {
			const annotationPath = annotation.fullyQualifiedName;
			const targetEntityType = this._getEntityTypeFromFullyQualifiedName(annotationPath);
			if (!targetEntityType) {
				throw new Error(`Cannot find Entity Type for ${annotation.fullyQualifiedName}`);
			}
			return targetEntityType;
		} else {
			return this.targetDataModelPath.targetEntityType;
		}
	}

	/**
	 * Retrieve the manifest settings defined for a specific control within controlConfiguration.
	 *
	 * @param vAnnotationPath The annotation path or object to evaluate
	 * @returns The control configuration for that specific annotation path if it exists
	 */
	getManifestControlConfiguration(vAnnotationPath: string | AnnotationTerm<any>): any {
		if (isAnnotationTerm(vAnnotationPath)) {
			return this.manifestWrapper.getControlConfiguration(
				vAnnotationPath.fullyQualifiedName.replace(this.targetDataModelPath.targetEntityType.fullyQualifiedName, "")
			);
		}
		// Checking if there are multiple entity set in the manifest, and comparing the entity set of the ControlConfiguration with the one from the annotation.
		const sAnnotationPath =
			this.manifestWrapper.hasMultipleEntitySets() && this.baseContextPath !== `/${this.manifestWrapper.getEntitySet()}`
				? `${this.baseContextPath}/${vAnnotationPath}`
				: vAnnotationPath;
		return this.manifestWrapper.getControlConfiguration(sAnnotationPath);
	}

	/**
	 * Create an absolute annotation path based on the current meta model context.
	 *
	 * @param sAnnotationPath The relative annotation path
	 * @returns The correct annotation path based on the current context
	 */
	getAbsoluteAnnotationPath(sAnnotationPath: string): string {
		if (!sAnnotationPath) {
			return sAnnotationPath;
		}
		if (sAnnotationPath[0] === "/") {
			return sAnnotationPath;
		}
		return `${this.baseContextPath}/${sAnnotationPath}`;
	}

	/**
	 * Retrieve the current entitySet.
	 *
	 * @returns The current EntitySet if it exists.
	 */
	getEntitySet(): EntitySet | Singleton | undefined {
		return this.targetDataModelPath.targetEntitySet as EntitySet | Singleton;
	}

	/**
	 * Retrieve the context path.
	 *
	 * @returns The context path of the converter.
	 */
	getContextPath(): string {
		return this.baseContextPath;
	}

	/**
	 * Retrieve the current data model object path.
	 *
	 * @returns The current data model object path
	 */
	getDataModelObjectPath(): DataModelObjectPath {
		return this.targetDataModelPath;
	}

	/**
	 * Get the EntityContainer.
	 *
	 * @returns The current service EntityContainer
	 */
	getEntityContainer(): EntityContainer {
		return this.convertedTypes.entityContainer;
	}

	/**
	 * Get the EntityType based on the fully qualified name.
	 *
	 * @returns The current EntityType.
	 */
	getEntityType(): EntityType {
		return this.targetDataModelPath.targetEntityType;
	}

	/**
	 * Gets the entity type of the parameter in case of a parameterized service.
	 *
	 * @returns The entity type of the parameter
	 */
	getParameterEntityType(): EntityType {
		const parameterEntityType = this.targetDataModelPath.startingEntitySet.entityType;
		const isParameterized = !!parameterEntityType.annotations?.Common?.ResultContext;
		return (isParameterized && parameterEntityType) as EntityType;
	}

	/**
	 * Retrieves an annotation from an entity type based on annotation path.
	 *
	 * @param annotationPath The annotation path to be evaluated
	 * @returns The target annotation path as well as a converter context to go with it
	 */
	getEntityTypeAnnotation(annotationPath: string): ResolvedAnnotationContext {
		if (!annotationPath.includes("@")) {
			throw new Error(`Not an annotation path: '${annotationPath}'`);
		}

		const isAbsolute = annotationPath.startsWith("/");
		let path: string;

		if (isAbsolute) {
			// path can be used as-is
			path = annotationPath;
		} else {
			// build an absolute path based on the entity type (this function works on the type!)
			const base = this.getContextPath().split("@", 1)[0];
			path = base.endsWith("/") ? base + annotationPath : `${base}/${annotationPath}`;
		}

		const target: ResolutionTarget<any> = this.resolveAbsolutePath(path);

		const dataModelObjectPath = getInvolvedDataModelObjectFromPath(
			{ target: target.target, visitedObjects: target.objectPath },
			this.convertedTypes,
			isAbsolute ? undefined : this.targetDataModelPath.contextLocation,
			true
		);

		return {
			annotation: target.target,
			converterContext: new ConverterContext(
				this.convertedTypes,
				this.manifestSettings,
				this.diagnostics,
				this.mergeFn,
				dataModelObjectPath
			)
		};
	}

	/**
	 * Retrieve the type of template we're working on (e.g. ListReport / ObjectPage / ...).
	 *
	 * @returns The current tenplate type
	 */
	getTemplateType(): TemplateType {
		return this.manifestWrapper.getTemplateType();
	}

	/**
	 * Retrieve the converted types.
	 *
	 * @returns The current converted types
	 */
	getConvertedTypes(): ConvertedMetadata {
		return this.convertedTypes;
	}

	/**
	 * Retrieve a relative annotation path between an annotation path and an entity type.
	 *
	 * @param annotationPath
	 * @param entityType
	 * @returns The relative anntotation path.
	 */
	getRelativeAnnotationPath(annotationPath: string, entityType: EntityType): string {
		return annotationPath.replace(entityType.fullyQualifiedName, "");
	}

	/**
	 * Transform an entityType based path to an entitySet based one (ui5 templating generally expect an entitySetBasedPath).
	 *
	 * @param annotationPath
	 * @returns The EntitySet based annotation path
	 */
	getEntitySetBasedAnnotationPath(annotationPath: string): string {
		if (!annotationPath) {
			return annotationPath;
		}
		const entityTypeFQN = this.targetDataModelPath.targetEntityType.fullyQualifiedName;
		if (
			this.targetDataModelPath.targetEntitySet ||
			((this.baseContextPath.startsWith("/") && this.baseContextPath.match(/\//g)) || []).length > 1
		) {
			let replacedAnnotationPath = annotationPath.replace(entityTypeFQN, "/");
			if (replacedAnnotationPath.length > 2 && replacedAnnotationPath[0] === "/" && replacedAnnotationPath[1] === "/") {
				replacedAnnotationPath = replacedAnnotationPath.substr(1);
			}
			return this.baseContextPath + (replacedAnnotationPath.startsWith("/") ? replacedAnnotationPath : `/${replacedAnnotationPath}`);
		} else {
			return `/${annotationPath}`;
		}
	}

	/**
	 * Retrieve the manifest wrapper for the current context.
	 *
	 * @returns The current manifest wrapper
	 */
	getManifestWrapper(): ManifestWrapper {
		return this.manifestWrapper;
	}

	getDiagnostics(): IDiagnostics {
		return this.diagnostics;
	}

	/**
	 * Retrieve the target from an absolute path.
	 *
	 * @param path The path we want to get the target
	 * @returns The absolute path
	 */
	resolveAbsolutePath<T>(path: string): ResolutionTarget<T> {
		return this.convertedTypes.resolvePath(path);
	}

	/**
	 * Retrieve a new converter context, scoped for a different context path.
	 *
	 * @param contextPath The path we want to orchestrate the converter context around
	 * @returns The converted context for the sub path
	 */
	getConverterContextFor<T>(contextPath: string): ConverterContext {
		const resolvedMetaPath: ResolutionTarget<T> = this.convertedTypes.resolvePath(contextPath);
		const targetPath = getDataModelPathForEntitySet(resolvedMetaPath, this.convertedTypes);
		return new ConverterContext(this.convertedTypes, this.manifestSettings, this.diagnostics, this.mergeFn, targetPath);
	}

	/**
	 * Get all annotations of a given term and vocabulary on an entity type
	 * (or on the current entity type if entityType isn't specified).
	 *
	 * @param vocabularyName
	 * @param annotationTerm
	 * @param [annotationSources]
	 * @returns All the annotation for a specific term and vocabulary from an entity type
	 */
	getAnnotationsByTerm(
		vocabularyName: keyof EntityTypeAnnotations,
		annotationTerm: string,
		annotationSources: (ServiceObject | undefined)[] = [this.getEntityType()]
	): AnnotationTerm<any>[] {
		let outAnnotations: AnnotationTerm<any>[] = [];
		annotationSources.forEach((annotationSource) => {
			if (annotationSource) {
				const annotations: Record<string, AnnotationTerm<any>> = annotationSource?.annotations[vocabularyName] || {};
				if (annotations) {
					outAnnotations = Object.keys(annotations)
						.filter((annotation) => annotations[annotation].term === annotationTerm)
						.reduce((previousValue: AnnotationTerm<any>[], key: string) => {
							previousValue.push(annotations[key]);
							return previousValue;
						}, outAnnotations);
				}
			}
		});
		return outAnnotations;
	}

	/**
	 * Retrieves the relative model path based on the current context path.
	 *
	 * @returns The relative model path or undefined if the path is not resolveable
	 */
	getRelativeModelPathFunction(): Function {
		const targetDataModelPath = this.targetDataModelPath;
		return function (sPath: string) {
			const enhancedPath = enhanceDataModelPath(targetDataModelPath, sPath);
			return getContextRelativeTargetObjectPath(enhancedPath, true);
		};
	}

	/**
	 * Create the converter context necessary for a macro based on a metamodel context.
	 *
	 * @param sEntitySetName
	 * @param oMetaModelContext
	 * @param diagnostics
	 * @param mergeFn
	 * @param targetDataModelPath
	 * @param manifestSettings
	 * @returns The current converter context
	 */
	static createConverterContextForMacro(
		sEntitySetName: string,
		oMetaModelContext: Context | ODataMetaModel,
		diagnostics: IDiagnostics,
		mergeFn: Function,
		targetDataModelPath: DataModelObjectPath | undefined,
		manifestSettings: BaseManifestSettings = {} as BaseManifestSettings
	): ConverterContext {
		const oMetaModel: ODataMetaModel = oMetaModelContext.isA("sap.ui.model.odata.v4.ODataMetaModel")
			? (oMetaModelContext as ODataMetaModel)
			: ((oMetaModelContext as Context).getModel() as unknown as ODataMetaModel);
		const oConvertedMetadata = convertTypes(oMetaModel);
		let targetEntitySet: Singleton | EntitySet = oConvertedMetadata.entitySets.find(
			(entitySet) => entitySet.name === sEntitySetName
		) as EntitySet;
		if (!targetEntitySet) {
			targetEntitySet = oConvertedMetadata.singletons.find((entitySet) => entitySet.name === sEntitySetName) as Singleton;
		}
		if (!targetDataModelPath || targetEntitySet !== targetDataModelPath.startingEntitySet) {
			targetDataModelPath = {
				startingEntitySet: targetEntitySet,
				navigationProperties: [],
				targetEntitySet: targetEntitySet,
				targetEntityType: targetEntitySet.entityType,
				targetObject: targetEntitySet,
				convertedTypes: oConvertedMetadata
			};
		}
		return new ConverterContext(oConvertedMetadata, manifestSettings, diagnostics, mergeFn, targetDataModelPath);
	}
}

export default ConverterContext;
