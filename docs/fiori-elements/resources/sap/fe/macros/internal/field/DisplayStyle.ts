import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import * as MetaModelConverter from "sap/fe/core/converters/MetaModelConverter";
import InternalFieldBlock from "../InternalField.block";
//import COMMON from 'sap/fe/macros/CommonHelper';
import { UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import { buildExpressionForCriticalityButtonType } from "sap/fe/core/templating/CriticalityFormatters";
import FieldHelper from "sap/fe/macros/field/FieldHelper";
import EditMode from "sap/ui/mdc/enum/EditMode";

//This is not yet a "real" building block, but rather a wrapper for the later on yet to be defined solution.
const DisplayStyle = {
	/**
	 * Generates the button template.
	 *
	 * @param internalField Reference to the current internal field instance
	 * @returns An XML-based string with the definition of the field control
	 */
	getButtonTemplate: (internalField: InternalFieldBlock) => {
		const convertedDataField = MetaModelConverter.convertMetaModelContext(internalField.dataField);
		const oDataModelPath = MetaModelConverter.getInvolvedDataModelObjects(internalField.dataField, internalField.entitySet);

		const icon = internalField.formatOptions?.showIconUrl ?? false ? convertedDataField.IconUrl : undefined;
		const text = !(internalField.formatOptions?.showIconUrl ?? false) ? convertedDataField.Label : undefined;
		const tooltip = internalField.formatOptions?.showIconUrl ?? false ? convertedDataField.Label : undefined;
		let button = "";
		if (convertedDataField.$Type === UIAnnotationTypes.DataFieldForIntentBasedNavigation) {
			button = xml`<Button
				xmlns="sap.m"
				visible="${internalField.visible}"
				text="${text}"
				icon="${icon}"
				enabled="${internalField.navigationAvailable}"
				tooltip="${tooltip}"
				press="${internalField.buttonPress}"
			/>`;
		} else if (
			FieldHelper.isDataFieldActionButtonVisible(
				this,
				convertedDataField,
				internalField.buttonIsBound,
				internalField.buttonOperationAvailable
			)
		) {
			const enabled = FieldHelper.isDataFieldActionButtonEnabled(
				convertedDataField,
				internalField.buttonIsBound as unknown as boolean,
				internalField.buttonOperationAvailable,
				internalField.buttonOperationAvailableFormatted as string
			);
			const type = buildExpressionForCriticalityButtonType(oDataModelPath);

			button = xml`<Button
				xmlns="sap.m"
			    class="${internalField.class}"
				text="${text}"
				icon="${icon}"
				tooltip="${tooltip}"
				press="${internalField.buttonPress}"
				enabled="${enabled}"
				visible="${internalField.visible}"
				type="${type}"
				/>`;
		}
		return button;
	},

	/**
	 * Generates the Contact template.
	 *
	 * @param internalField Reference to the current internal field instance
	 * @returns An XML-based string with the definition of the field control
	 */
	getContactTemplate(internalField: InternalFieldBlock) {
		const contextMetaPath = internalField.dataField.getModel().createBindingContext("Target/$AnnotationPath", internalField.dataField);

		return xml`
		<macros:Contact
			idPrefix="${internalField.idPrefix}"
			ariaLabelledBy="${internalField.ariaLabelledBy}"
			metaPath="${contextMetaPath}"
			contextPath="${internalField.entitySet}"
			_flexId="${internalField._flexId}"
			visible="${internalField.contactVisible}"
		/>`;
	},

	/**
	 * Generates the innerpart of the data point to be used in getDataPointTemplate.
	 *
	 * @param internalField Reference to the current internal field instance
	 * @param withConditionalWrapper Boolean value to determine whether the DataPoint
	 * 					  			shall be generated for the conditional wrapper case
	 * @returns An XML-based string with the definition of the field control
	 */
	getDataPointInnerPart(internalField: InternalFieldBlock, withConditionalWrapper: boolean) {
		const formatOptions = xml`<internalMacro:formatOptions 
				xmlns:internalMacro="sap.fe.macros.internal"
				measureDisplayMode="${internalField.formatOptions.measureDisplayMode}"
				showEmptyIndicator="${internalField.formatOptions.showEmptyIndicator}"
				isAnalytics="${internalField.formatOptions.isAnalytics}"
			/>`;

		return xml`<internalMacro:DataPoint 
			xmlns:internalMacro="sap.fe.macros.internal"
			idPrefix="${internalField.idPrefix}"
			visible="${!withConditionalWrapper ? internalField.displayVisible : ""}"
			ariaLabelledBy="${internalField.ariaLabelledBy}"
			_flexId="${internalField._flexId}"
			metaPath="${internalField.annotationPath}"
			contextPath="${internalField.entitySet}"
		>
			${formatOptions}
		</internalMacro:DataPoint>`;
	},

	/**
	 * Generates the DataPoint template.
	 *
	 * @param internalField Reference to the current internal field instance
	 * @returns An XML-based string with the definition of the field control
	 */
	getDataPointTemplate(internalField: InternalFieldBlock) {
		if ((internalField.formatOptions.isAnalytics ?? false) && (internalField.hasUnitOrCurrency ?? false)) {
			return xml`<controls:ConditionalWrapper xmlns:controls="sap.fe.macros.controls" visible="${
				internalField.displayVisible
			}" condition="${internalField.hasValidAnalyticalCurrencyOrUnit}">
				<controls:contentTrue>
					 ${this.getDataPointInnerPart(internalField, true)}
				</controls:contentTrue>
					<controls:contentFalse>
						<Text xmlns="sap.m" text="*" />
				</controls:contentFalse>
			</controls:ConditionalWrapper>`;
		} else {
			return this.getDataPointInnerPart(internalField, false);
		}
	},

	/**
	 * Generates the ExpandableText template.
	 *
	 * @param internalField Reference to the current internal field instance
	 * @returns An XML-based string with the definition of the field control
	 */
	getExpandableText(internalField: InternalFieldBlock) {
		return xml`
			<ExpandableText
				xmlns="sap.m"
				id="${internalField?.noWrapperId}"
				visible="${internalField?.displayVisible}"
				text="${internalField?.text}"
				overflowMode="${internalField?.formatOptions?.textExpandBehaviorDisplay}"
				maxCharacters="${internalField?.formatOptions?.textMaxCharactersDisplay}"
				emptyIndicatorMode="${internalField?.emptyIndicatorMode}"
		/>`;
	},

	/**
	 * Generates the File template.
	 *
	 * @param internalField Reference to the current internal field instance
	 * @returns An XML-based string with the definition of the field control
	 */
	getFile(internalField: InternalFieldBlock) {
		let innerFilePart;
		if (internalField.fileIsImage) {
			innerFilePart = xml`
			<controls:avatar xmlns:controls="sap.fe.macros.controls">
				<Avatar
					xmlns="sap.m"
					visible="${internalField.displayVisible}"
					src="${internalField.fileAvatarSrc}"
					displaySize="S"
					class="sapUiSmallMarginEnd"
					displayShape="Square"
				/>
			</controls:avatar>`;
		} else {
			innerFilePart = xml`
			<controls:icon xmlns:controls="sap.fe.macros.controls">
				<core:Icon src="${internalField.fileIconSrc}" class="sapUiSmallMarginEnd" visible="${internalField.fileStreamNotEmpty}" />
			</controls:icon>
			<controls:link>
				<Link
					xmlns="sap.m"
					text="${internalField.fileLinkText}"
					target="_blank"
					href="${internalField.fileLinkHref}"
					visible="${internalField.fileStreamNotEmpty}"
					wrapping="true"
				/>
			</controls:link>
			<controls:text>
				<Text xmlns="sap.m" emptyIndicatorMode="On" text="" visible="${internalField.fileTextVisible}" />
			</controls:text>`;
		}

		if (internalField.editMode !== EditMode.Display) {
			const beforeDialogOpen = internalField.collaborationEnabled ? "FIELDRUNTIME.handleOpenUploader" : undefined;
			const afterDialogOpen = internalField.collaborationEnabled ? "FIELDRUNTIME.handleCloseUploader" : undefined;

			innerFilePart += xml`
			<controls:fileUploader xmlns:controls="sap.fe.macros.controls">
				<u:FileUploader
					xmlns:u="sap.ui.unified"
					name="FEV4FileUpload"
					visible="${internalField.editableExpression}"
					buttonOnly="true"
					iconOnly="true"
					multiple="false"
					tooltip="{sap.fe.i18n>M_FIELD_FILEUPLOADER_UPLOAD_BUTTON_TOOLTIP}"
					icon="sap-icon://upload"
					style="Transparent"
					sendXHR="true"
					useMultipart="false"
					sameFilenameAllowed="true"
					mimeType="${internalField.fileAcceptableMediaTypes}"
					typeMissmatch="FIELDRUNTIME.handleTypeMissmatch"
					maximumFileSize="${internalField.fileMaximumSize}"
					fileSizeExceed="FIELDRUNTIME.handleFileSizeExceed"
					uploadOnChange="false"
					uploadComplete="FIELDRUNTIME.handleUploadComplete($event, ${internalField.fileFilenameExpression || "undefined"}, '${
				internalField.fileRelativePropertyPath
			}', $controller)"
					httpRequestMethod="Put"
					change="FIELDRUNTIME.uploadStream($controller, $event)"
					beforeDialogOpen="${beforeDialogOpen}"
					afterDialogClose="${afterDialogOpen}"
					uploadStart="FIELDRUNTIME.handleOpenUploader"
				/>
			</controls:fileUploader>
			<controls:deleteButton>
				<Button
					xmlns="sap.m"
					icon="sap-icon://sys-cancel"
					type="Transparent"
					press="FIELDRUNTIME.removeStream($event, ${internalField.fileFilenameExpression || "undefined"}, '${
				internalField.fileRelativePropertyPath
			}', $controller)"
					tooltip="{sap.fe.i18n>M_FIELD_FILEUPLOADER_DELETE_BUTTON_TOOLTIP}"
					visible="${internalField.editableExpression}"
					enabled="${internalField.fileStreamNotEmpty}"
				/>
			</controls:deleteButton>`;
		}

		return xml`
			<controls:FileWrapper
				xmlns:controls="sap.fe.macros.controls"
				core:require="{FIELDRUNTIME: 'sap/fe/macros/field/FieldRuntime'}"
				visible="${internalField.visible}"
				uploadUrl="${internalField.fileUploadUrl}"
				propertyPath="${internalField.fileRelativePropertyPath}"
				filename="${internalField.fileFilenamePath}"
				mediaType="${internalField.fileMediaType}"
				fieldGroupIds="${internalField.fieldGroupIds}"
				validateFieldGroup="FIELDRUNTIME.onValidateFieldGroup($controller, $event)"
				customData:sourcePath="${internalField.dataSourcePath}"
			>${innerFilePart}</controls:FileWrapper>`;
	},

	/**
	 * Generates the Avatar template.
	 *
	 * @param internalField Reference to the current internal field instance
	 * @returns An XML-based string with the definition of the field control
	 */
	getAvatarTemplate(internalField: InternalFieldBlock) {
		let avatarId;
		if (internalField._flexId) {
			avatarId = internalField._flexId;
		} else if (internalField.idPrefix) {
			avatarId = generate([internalField.idPrefix, "Field-content"]);
		}

		return xml`
			<controls:FormElementWrapper
				xmlns:controls="sap.fe.core.controls"
				visible="${internalField.avatarVisible}"
			>
			<Avatar
				xmlns="sap.m"
				id="${avatarId}"
				src="${internalField.avatarSrc}"
				displaySize="S"
				class="sapUiSmallMarginEnd"
				displayShape="Square"
			/>
		</controls:FormElementWrapper>`;
	},

	/**
	 * Entry point for further templating processings.
	 *
	 * @param internalField Reference to the current internal field instance
	 * @returns An XML-based string with the definition of the field control
	 */
	getTemplate: (internalField: InternalFieldBlock) => {
		let innerFieldContent;

		switch (internalField.displayStyle) {
			case "Button":
				innerFieldContent = DisplayStyle.getButtonTemplate(internalField);
				break;
			case "DataPoint":
				innerFieldContent = DisplayStyle.getDataPointTemplate(internalField);
				break;
			case "ExpandableText":
				innerFieldContent = DisplayStyle.getExpandableText(internalField);
				break;
			case "Avatar":
				innerFieldContent = DisplayStyle.getAvatarTemplate(internalField);
				break;
			case "Contact":
				innerFieldContent = DisplayStyle.getContactTemplate(internalField);
				break;
			case "File":
				innerFieldContent = DisplayStyle.getFile(internalField);
				break;
			default:
				innerFieldContent = xml`<core:Fragment fragmentName="sap.fe.macros.internal.field.displayStyle.${internalField.displayStyle}" type="XML" />`;
		}

		return innerFieldContent;
	}
};

export default DisplayStyle;
