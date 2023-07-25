import type { ConvertedMetadata, Singleton } from "@sap-ux/vocabularies-types";
import type ConverterContext from "sap/fe/core/converters/ConverterContext";
import type { BindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { and, equal, not, or, pathInModel } from "sap/fe/core/helpers/BindingToolkit";

export const UI = {
	IsCreateMode: pathInModel("createMode", "ui") as BindingToolkitExpression<boolean>,
	IsEditable: pathInModel("/isEditable", "ui") as BindingToolkitExpression<boolean>,
	IsTransientBinding: equal(pathInModel("@$ui5.context.isTransient"), true),
	IsTotal: equal(pathInModel("@$ui5.node.isTotal"), true),
	IsExpanded: equal(pathInModel("@$ui5.node.isExpanded"), true),
	NodeLevel: pathInModel("@$ui5.node.level"),
	IsInactive: pathInModel("@$ui5.context.isInactive")
};

export const Entity = {
	HasDraft: pathInModel("HasDraftEntity"),
	HasActive: pathInModel("HasActiveEntity"),
	IsActive: pathInModel("IsActiveEntity")
};

export const Draft = {
	IsNewObject: and(not(Entity.HasActive), not(Entity.IsActive)),
	HasNoDraftForCurrentUser: or(
		not(Entity.HasDraft),
		and(Entity.HasDraft, not(pathInModel("DraftAdministrativeData/DraftIsCreatedByMe") as BindingToolkitExpression<boolean>))
	)
};

/**
 * Gets a singleton based on the fully qualified name.
 *
 * @param convertedTypes The converted types
 * @param fullyQualifiedName The fully qualified name of the singleton
 * @returns The singleton instance.
 */
function getSingleton(convertedTypes: ConvertedMetadata, fullyQualifiedName: string): Singleton | undefined {
	return convertedTypes.singletons.find((singleton) => singleton.fullyQualifiedName === fullyQualifiedName);
}

/**
 * Function to adjust singleton paths in the annotation.
 * The absolute path via EntityContainer needs to be shortened to /SingletonName/PropertyName.
 *
 * @param path The path configured in the annotation
 * @param convertedTypes The instance of the converter context
 * @param visitedNavigationPaths The array of visited navigation paths
 * @returns The adjusted path for the reference of the singleton property, otherwise the input path itself.
 */
export const singletonPathVisitor = function (path: string, convertedTypes: ConvertedMetadata, visitedNavigationPaths: string[]): string {
	// Determine whether the path is absolute and whether it points to a singleton.
	if (path.indexOf("/") === 0) {
		const parts = path.split("/").filter(Boolean),
			propertyName = parts.pop(),
			entitySetName = parts.join("/"),
			singleton = getSingleton(convertedTypes, entitySetName);
		if (singleton) {
			// Set the absolute binding path to access the singleton property
			path = `/${singleton.name}/${propertyName}`;
		}
	} else {
		// Not a singleton reference.
		// Prefix the navigation path to the property path
		const localPath = visitedNavigationPaths.concat();
		localPath.push(path);
		path = localPath.join("/");
	}
	return path;
};

/**
 * Function to adjust property paths defined in the binding of an action.
 *
 * The binding parameter name needs to be removed. Singleton paths need to be resolved.
 *
 * @param path The path configured in the annotation
 * @param converterContext The instance of the converter context
 * @param bindingParameterFullName The fully qualified name of the binding parameter
 * @returns The adjusted property path
 */
export function bindingContextPathVisitor(path: string, converterContext: ConverterContext, bindingParameterFullName?: string) {
	if (bindingParameterFullName) {
		const bindingParameterPrefix = `${bindingParameterFullName?.substring(bindingParameterFullName.lastIndexOf("/") + 1)}/`;
		// Strip the binding parameter name from OperationAvailable path
		// For e.g. _it/property1 --> property1
		if (path.startsWith(bindingParameterPrefix)) {
			return path.substring(bindingParameterPrefix.length);
		}
	}
	return singletonPathVisitor(path, converterContext.getConvertedTypes(), []);
}
