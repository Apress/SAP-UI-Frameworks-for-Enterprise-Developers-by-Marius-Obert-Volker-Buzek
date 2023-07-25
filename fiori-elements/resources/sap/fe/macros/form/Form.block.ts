import { CommunicationAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/Communication";
import type { FacetTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import { UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import { blockAggregation, blockAttribute, blockEvent, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import type { FormContainer } from "sap/fe/core/converters/controls/Common/Form";
import { createFormDefinition } from "sap/fe/core/converters/controls/Common/Form";
import { UI } from "sap/fe/core/converters/helpers/BindingHelper";
import { getFormContainerID } from "sap/fe/core/converters/helpers/ID";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import type { CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { compileExpression, equal, ifElse, resolveBindingString } from "sap/fe/core/helpers/BindingToolkit";
import type { PropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import { getContextRelativeTargetObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import FormHelper from "sap/fe/macros/form/FormHelper";
import { TitleLevel } from "sap/ui/core/library";
import type { $ColumnLayoutSettings } from "sap/ui/layout/form/ColumnLayout";
import type { $ResponsiveGridLayoutSettings } from "sap/ui/layout/form/ResponsiveGridLayout";
import type Context from "sap/ui/model/Context";
import AnnotationHelper from "sap/ui/model/odata/v4/AnnotationHelper";

type ColumnLayout = $ColumnLayoutSettings & {
	type: "ColumnLayout";
};
type ResponsiveGridLayout = $ResponsiveGridLayoutSettings & {
	type: "ResponsiveGridLayout";
};
type FormLayoutInformation = ColumnLayout | ResponsiveGridLayout;

/**
 * Building block for creating a Form based on the metadata provided by OData V4.
 * <br>
 * It is designed to work based on a FieldGroup annotation but can also work if you provide a ReferenceFacet or a CollectionFacet
 *
 *
 * Usage example:
 * <pre>
 * &lt;macro:Form id="MyForm" metaPath="@com.sap.vocabularies.UI.v1.FieldGroup#GeneralInformation" /&gt;
 * </pre>
 *
 * @alias sap.fe.macros.Form
 * @public
 */
@defineBuildingBlock({
	name: "Form",
	namespace: "sap.fe.macros.internal",
	publicNamespace: "sap.fe.macros"
})
export default class FormBlock extends BuildingBlockBase {
	/**
	 * The identifier of the form control.
	 *
	 * @public
	 */
	@blockAttribute({ type: "string", isPublic: true, required: true })
	id!: string;

	/**
	 * Defines the path of the context used in the current page or block.
	 * This setting is defined by the framework.
	 *
	 * @public
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
		required: true,
		isPublic: true,
		expectedTypes: ["EntitySet", "NavigationProperty", "Singleton", "EntityType"]
	})
	contextPath!: Context;

	/**
	 * Defines the relative path of the property in the metamodel, based on the current contextPath.
	 *
	 * @public
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
		isPublic: true,
		required: true,
		expectedAnnotationTypes: [
			"com.sap.vocabularies.UI.v1.FieldGroupType",
			"com.sap.vocabularies.UI.v1.CollectionFacet",
			"com.sap.vocabularies.UI.v1.ReferenceFacet"
		],
		expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty"]
	})
	metaPath!: Context;

	/**
	 * The manifest defined form containers to be shown in the action area of the table
	 */
	@blockAttribute({ type: "array" })
	formContainers?: FormContainer[];

	/**
	 * Control the rendering of the form container labels
	 */
	@blockAttribute({ type: "boolean" })
	useFormContainerLabels?: boolean;

	/**
	 * Toggle Preview: Part of Preview / Preview via 'Show More' Button
	 */
	@blockAttribute({ type: "boolean" })
	partOfPreview: boolean = true;

	/**
	 * The title of the form control.
	 *
	 * @public
	 */
	@blockAttribute({ type: "string", isPublic: true })
	title?: string;

	/**
	 * Defines the "aria-level" of the form title, titles of internally used form containers are nested subsequently
	 */
	@blockAttribute({ type: "sap.ui.core.TitleLevel", isPublic: true })
	titleLevel: TitleLevel = TitleLevel.Auto;

	@blockAttribute({ type: "string" })
	displayMode?: CompiledBindingToolkitExpression;

	/**
	 * 	If set to false, the Form is not rendered.
	 */
	@blockAttribute({ type: "string" })
	isVisible: string = "true";
	// Independent from the form title, can be a bit confusing in standalone usage at is not showing anything by default

	// Just proxied down to the Field may need to see if needed or not
	@blockEvent()
	onChange?: string;

	@blockAggregation({ type: "sap.fe.macros.form.FormElement", isPublic: true, slot: "formElements", isDefault: true })
	formElements?: any;

	/**
	 * Defines the layout to be used within the form.
	 * It defaults to the ColumnLayout, but you can also use a ResponsiveGridLayout.
	 * All the properties of the ResponsiveGridLayout can be added to the configuration.
	 */
	@blockAttribute({ type: "object", isPublic: true })
	layout: FormLayoutInformation = { type: "ColumnLayout", columnsM: 2, columnsXL: 6, columnsL: 3, labelCellsLarge: 12 };

	// Useful for our dynamic thing but also depends on the metadata -> make sure this is taken into account
	_editable: CompiledBindingToolkitExpression;

	_apiId: string;

	_contentId: string;

	facetType: string;

	constructor(props: PropertiesOf<FormBlock>, configuration: any, mSettings: any) {
		super(props, configuration, mSettings);
		if (this.metaPath && this.contextPath && (this.formContainers === undefined || this.formContainers === null)) {
			const oContextObjectPath = getInvolvedDataModelObjects(this.metaPath, this.contextPath);
			const mExtraSettings: Record<string, any> = {};
			let oFacetDefinition = oContextObjectPath.targetObject;
			let hasFieldGroup = false;
			if (oFacetDefinition && oFacetDefinition.$Type === UIAnnotationTypes.FieldGroupType) {
				// Wrap the facet in a fake Facet annotation
				hasFieldGroup = true;
				oFacetDefinition = {
					$Type: "com.sap.vocabularies.UI.v1.ReferenceFacet",
					Label: oFacetDefinition.Label,
					Target: {
						$target: oFacetDefinition,
						fullyQualifiedName: oFacetDefinition.fullyQualifiedName,
						path: "",
						term: "",
						type: "AnnotationPath",
						value: getContextRelativeTargetObjectPath(oContextObjectPath)
					},
					annotations: {},
					fullyQualifiedName: oFacetDefinition.fullyQualifiedName
				};
				mExtraSettings[oFacetDefinition.Target.value] = { fields: this.formElements };
			}

			const oConverterContext = this.getConverterContext(
				oContextObjectPath,
				/*this.contextPath*/ undefined,
				mSettings,
				mExtraSettings
			);
			const oFormDefinition = createFormDefinition(oFacetDefinition, this.isVisible, oConverterContext);
			if (hasFieldGroup) {
				oFormDefinition.formContainers[0].annotationPath = this.metaPath.getPath();
			}
			this.formContainers = oFormDefinition.formContainers;
			this.useFormContainerLabels = oFormDefinition.useFormContainerLabels;
			this.facetType = oFacetDefinition && oFacetDefinition.$Type;
		} else {
			this.facetType = this.metaPath.getObject()?.$Type;
		}

		if (!this.isPublic) {
			this._apiId = this.createId("Form")!;
			this._contentId = this.id;
		} else {
			this._apiId = this.id;
			this._contentId = `${this.id}-content`;
		}
		// if displayMode === true -> _editable = false
		// if displayMode === false -> _editable = true
		//  => if displayMode === {myBindingValue} -> _editable = {myBindingValue} === true ? true : false
		// if DisplayMode === undefined -> _editable = {ui>/isEditable}
		if (this.displayMode !== undefined) {
			this._editable = compileExpression(ifElse(equal(resolveBindingString(this.displayMode, "boolean"), false), true, false));
		} else {
			this._editable = compileExpression(UI.IsEditable);
		}
	}

	getDataFieldCollection(formContainer: FormContainer, facetContext: Context) {
		const facet = getInvolvedDataModelObjects(facetContext).targetObject as FacetTypes;
		let navigationPath;
		let idPart;
		if (facet.$Type === UIAnnotationTypes.ReferenceFacet) {
			navigationPath = AnnotationHelper.getNavigationPath(facet.Target.value);
			idPart = facet;
		} else {
			const contextPathPath = this.contextPath.getPath();
			let facetPath = facetContext.getPath();
			if (facetPath.startsWith(contextPathPath)) {
				facetPath = facetPath.substring(contextPathPath.length);
			}
			navigationPath = AnnotationHelper.getNavigationPath(facetPath);
			idPart = facetPath;
		}
		const titleLevel = FormHelper.getFormContainerTitleLevel(this.title, this.titleLevel);
		const title = this.useFormContainerLabels && facet ? (AnnotationHelper.label(facet, { context: facetContext }) as string) : "";
		const id = this.id ? getFormContainerID(idPart) : undefined;

		return xml`
					<macro:FormContainer
					xmlns:macro="sap.fe.macros"
					${this.attr("id", id)}
					title="${title}"
					titleLevel="${titleLevel}"
					contextPath="${navigationPath ? formContainer.entitySet : this.contextPath}"
					metaPath="${facetContext}"
					dataFieldCollection="${formContainer.formElements}"
					navigationPath="${navigationPath}"
					visible="${formContainer.isVisible}"
					displayMode="${this.displayMode}"
					onChange="${this.onChange}"
					actions="${formContainer.actions}"
				>
				<macro:formElements>
					<slot name="formElements" />
				</macro:formElements>
			</macro:FormContainer>`;
	}

	getFormContainers() {
		if (this.formContainers!.length === 0) {
			return "";
		}
		if (this.facetType.indexOf("com.sap.vocabularies.UI.v1.CollectionFacet") >= 0) {
			return this.formContainers!.map((formContainer, formContainerIdx) => {
				if (formContainer.isVisible) {
					const facetContext = this.contextPath.getModel().createBindingContext(formContainer.annotationPath, this.contextPath);
					const facet = facetContext.getObject();
					if (
						facet.$Type === UIAnnotationTypes.ReferenceFacet &&
						FormHelper.isReferenceFacetPartOfPreview(facet, this.partOfPreview)
					) {
						if (facet.Target.$AnnotationPath.$Type === CommunicationAnnotationTypes.AddressType) {
							return xml`<template:with path="formContainers>${formContainerIdx}" var="formContainer">
											<template:with path="formContainers>${formContainerIdx}/annotationPath" var="facet">
												<core:Fragment fragmentName="sap.fe.macros.form.AddressSection" type="XML" />
											</template:with>
										</template:with>`;
						}
						return this.getDataFieldCollection(formContainer, facetContext);
					}
				}
				return "";
			});
		} else if (this.facetType === "com.sap.vocabularies.UI.v1.ReferenceFacet") {
			return this.formContainers!.map((formContainer) => {
				if (formContainer.isVisible) {
					const facetContext = this.contextPath.getModel().createBindingContext(formContainer.annotationPath, this.contextPath);
					return this.getDataFieldCollection(formContainer, facetContext);
				} else {
					return "";
				}
			});
		}
		return xml``;
	}

	/**
	 * Create the proper layout information based on the `layout` property defined externally.
	 *
	 * @returns The layout information for the xml.
	 */
	getLayoutInformation() {
		switch (this.layout.type) {
			case "ResponsiveGridLayout":
				return xml`<f:ResponsiveGridLayout adjustLabelSpan="${this.layout.adjustLabelSpan}"
													breakpointL="${this.layout.breakpointL}"
													breakpointM="${this.layout.breakpointM}"
													breakpointXL="${this.layout.breakpointXL}"
													columnsL="${this.layout.columnsL}"
													columnsM="${this.layout.columnsM}"
													columnsXL="${this.layout.columnsXL}"
													emptySpanL="${this.layout.emptySpanL}"
													emptySpanM="${this.layout.emptySpanM}"
													emptySpanS="${this.layout.emptySpanS}"
													emptySpanXL="${this.layout.emptySpanXL}"
													labelSpanL="${this.layout.labelSpanL}"
													labelSpanM="${this.layout.labelSpanM}"
													labelSpanS="${this.layout.labelSpanS}"
													labelSpanXL="${this.layout.labelSpanXL}"
													singleContainerFullSize="${this.layout.singleContainerFullSize}" />`;
			case "ColumnLayout":
			default:
				return xml`<f:ColumnLayout
								columnsM="${this.layout.columnsM}"
								columnsL="${this.layout.columnsL}"
								columnsXL="${this.layout.columnsXL}"
								labelCellsLarge="${this.layout.labelCellsLarge}"
								emptyCellsLarge="${this.layout.emptyCellsLarge}" />`;
		}
	}

	getTemplate() {
		const onChangeStr = (this.onChange && this.onChange.replace("{", "\\{").replace("}", "\\}")) || "";
		const metaPathPath = this.metaPath.getPath();
		const contextPathPath = this.contextPath.getPath();
		if (!this.isVisible) {
			return xml``;
		} else {
			return xml`<macro:FormAPI xmlns:macro="sap.fe.macros.form"
					xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
					xmlns:f="sap.ui.layout.form"
					xmlns:fl="sap.ui.fl"
					id="${this._apiId}"
					metaPath="${metaPathPath}"
					contextPath="${contextPathPath}">
				<f:Form
					fl:delegate='{
						"name": "sap/fe/macros/form/FormDelegate",
						"delegateType": "complete"
					}'
					id="${this._contentId}"
					editable="${this._editable}"
					macrodata:entitySet="{contextPath>@sapui.name}"
					visible="${this.isVisible}"
					class="sapUxAPObjectPageSubSectionAlignContent"
					macrodata:navigationPath="${contextPathPath}"
					macrodata:onChange="${onChangeStr}"
				>
					${this.addConditionally(
						this.title !== undefined,
						xml`<f:title>
							<core:Title level="${this.titleLevel}" text="${this.title}" />
						</f:title>`
					)}
					<f:layout>
					${this.getLayoutInformation()}

					</f:layout>
					<f:formContainers>
						${this.getFormContainers()}
					</f:formContainers>
				</f:Form>
			</macro:FormAPI>`;
		}
	}
}
