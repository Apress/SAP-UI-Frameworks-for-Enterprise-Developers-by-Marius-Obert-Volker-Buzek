/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor","sap/fe/core/converters/MetaModelConverter","sap/fe/core/helpers/StableIdHelper","sap/fe/core/templating/CriticalityFormatters","sap/fe/macros/field/FieldHelper","sap/ui/mdc/enum/EditMode"],function(e,t,a,l,o,i){"use strict";var n=l.buildExpressionForCriticalityButtonType;var r=a.generate;var s=e.xml;const d={getButtonTemplate:e=>{var a,l,i;const r=t.convertMetaModelContext(e.dataField);const d=t.getInvolvedDataModelObjects(e.dataField,e.entitySet);const p=((a=e.formatOptions)===null||a===void 0?void 0:a.showIconUrl)??false?r.IconUrl:undefined;const c=!(((l=e.formatOptions)===null||l===void 0?void 0:l.showIconUrl)??false)?r.Label:undefined;const m=((i=e.formatOptions)===null||i===void 0?void 0:i.showIconUrl)??false?r.Label:undefined;let f="";if(r.$Type==="com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation"){f=s`<Button
				xmlns="sap.m"
				visible="${e.visible}"
				text="${c}"
				icon="${p}"
				enabled="${e.navigationAvailable}"
				tooltip="${m}"
				press="${e.buttonPress}"
			/>`}else if(o.isDataFieldActionButtonVisible(void 0,r,e.buttonIsBound,e.buttonOperationAvailable)){const t=o.isDataFieldActionButtonEnabled(r,e.buttonIsBound,e.buttonOperationAvailable,e.buttonOperationAvailableFormatted);const a=n(d);f=s`<Button
				xmlns="sap.m"
			    class="${e.class}"
				text="${c}"
				icon="${p}"
				tooltip="${m}"
				press="${e.buttonPress}"
				enabled="${t}"
				visible="${e.visible}"
				type="${a}"
				/>`}return f},getContactTemplate(e){const t=e.dataField.getModel().createBindingContext("Target/$AnnotationPath",e.dataField);return s`
		<macros:Contact
			idPrefix="${e.idPrefix}"
			ariaLabelledBy="${e.ariaLabelledBy}"
			metaPath="${t}"
			contextPath="${e.entitySet}"
			_flexId="${e._flexId}"
			visible="${e.contactVisible}"
		/>`},getDataPointInnerPart(e,t){const a=s`<internalMacro:formatOptions 
				xmlns:internalMacro="sap.fe.macros.internal"
				measureDisplayMode="${e.formatOptions.measureDisplayMode}"
				showEmptyIndicator="${e.formatOptions.showEmptyIndicator}"
				isAnalytics="${e.formatOptions.isAnalytics}"
			/>`;return s`<internalMacro:DataPoint 
			xmlns:internalMacro="sap.fe.macros.internal"
			idPrefix="${e.idPrefix}"
			visible="${!t?e.displayVisible:""}"
			ariaLabelledBy="${e.ariaLabelledBy}"
			_flexId="${e._flexId}"
			metaPath="${e.annotationPath}"
			contextPath="${e.entitySet}"
		>
			${a}
		</internalMacro:DataPoint>`},getDataPointTemplate(e){if((e.formatOptions.isAnalytics??false)&&(e.hasUnitOrCurrency??false)){return s`<controls:ConditionalWrapper xmlns:controls="sap.fe.macros.controls" visible="${e.displayVisible}" condition="${e.hasValidAnalyticalCurrencyOrUnit}">
				<controls:contentTrue>
					 ${this.getDataPointInnerPart(e,true)}
				</controls:contentTrue>
					<controls:contentFalse>
						<Text xmlns="sap.m" text="*" />
				</controls:contentFalse>
			</controls:ConditionalWrapper>`}else{return this.getDataPointInnerPart(e,false)}},getExpandableText(e){var t,a;return s`
			<ExpandableText
				xmlns="sap.m"
				id="${e===null||e===void 0?void 0:e.noWrapperId}"
				visible="${e===null||e===void 0?void 0:e.displayVisible}"
				text="${e===null||e===void 0?void 0:e.text}"
				overflowMode="${e===null||e===void 0?void 0:(t=e.formatOptions)===null||t===void 0?void 0:t.textExpandBehaviorDisplay}"
				maxCharacters="${e===null||e===void 0?void 0:(a=e.formatOptions)===null||a===void 0?void 0:a.textMaxCharactersDisplay}"
				emptyIndicatorMode="${e===null||e===void 0?void 0:e.emptyIndicatorMode}"
		/>`},getFile(e){let t;if(e.fileIsImage){t=s`
			<controls:avatar xmlns:controls="sap.fe.macros.controls">
				<Avatar
					xmlns="sap.m"
					visible="${e.displayVisible}"
					src="${e.fileAvatarSrc}"
					displaySize="S"
					class="sapUiSmallMarginEnd"
					displayShape="Square"
				/>
			</controls:avatar>`}else{t=s`
			<controls:icon xmlns:controls="sap.fe.macros.controls">
				<core:Icon src="${e.fileIconSrc}" class="sapUiSmallMarginEnd" visible="${e.fileStreamNotEmpty}" />
			</controls:icon>
			<controls:link>
				<Link
					xmlns="sap.m"
					text="${e.fileLinkText}"
					target="_blank"
					href="${e.fileLinkHref}"
					visible="${e.fileStreamNotEmpty}"
					wrapping="true"
				/>
			</controls:link>
			<controls:text>
				<Text xmlns="sap.m" emptyIndicatorMode="On" text="" visible="${e.fileTextVisible}" />
			</controls:text>`}if(e.editMode!==i.Display){const a=e.collaborationEnabled?"FIELDRUNTIME.handleOpenUploader":undefined;const l=e.collaborationEnabled?"FIELDRUNTIME.handleCloseUploader":undefined;t+=s`
			<controls:fileUploader xmlns:controls="sap.fe.macros.controls">
				<u:FileUploader
					xmlns:u="sap.ui.unified"
					name="FEV4FileUpload"
					visible="${e.editableExpression}"
					buttonOnly="true"
					iconOnly="true"
					multiple="false"
					tooltip="{sap.fe.i18n>M_FIELD_FILEUPLOADER_UPLOAD_BUTTON_TOOLTIP}"
					icon="sap-icon://upload"
					style="Transparent"
					sendXHR="true"
					useMultipart="false"
					sameFilenameAllowed="true"
					mimeType="${e.fileAcceptableMediaTypes}"
					typeMissmatch="FIELDRUNTIME.handleTypeMissmatch"
					maximumFileSize="${e.fileMaximumSize}"
					fileSizeExceed="FIELDRUNTIME.handleFileSizeExceed"
					uploadOnChange="false"
					uploadComplete="FIELDRUNTIME.handleUploadComplete($event, ${e.fileFilenameExpression||"undefined"}, '${e.fileRelativePropertyPath}', $controller)"
					httpRequestMethod="Put"
					change="FIELDRUNTIME.uploadStream($controller, $event)"
					beforeDialogOpen="${a}"
					afterDialogClose="${l}"
					uploadStart="FIELDRUNTIME.handleOpenUploader"
				/>
			</controls:fileUploader>
			<controls:deleteButton>
				<Button
					xmlns="sap.m"
					icon="sap-icon://sys-cancel"
					type="Transparent"
					press="FIELDRUNTIME.removeStream($event, ${e.fileFilenameExpression||"undefined"}, '${e.fileRelativePropertyPath}', $controller)"
					tooltip="{sap.fe.i18n>M_FIELD_FILEUPLOADER_DELETE_BUTTON_TOOLTIP}"
					visible="${e.editableExpression}"
					enabled="${e.fileStreamNotEmpty}"
				/>
			</controls:deleteButton>`}return s`
			<controls:FileWrapper
				xmlns:controls="sap.fe.macros.controls"
				core:require="{FIELDRUNTIME: 'sap/fe/macros/field/FieldRuntime'}"
				visible="${e.visible}"
				uploadUrl="${e.fileUploadUrl}"
				propertyPath="${e.fileRelativePropertyPath}"
				filename="${e.fileFilenamePath}"
				mediaType="${e.fileMediaType}"
				fieldGroupIds="${e.fieldGroupIds}"
				validateFieldGroup="FIELDRUNTIME.onValidateFieldGroup($controller, $event)"
				customData:sourcePath="${e.dataSourcePath}"
			>${t}</controls:FileWrapper>`},getAvatarTemplate(e){let t;if(e._flexId){t=e._flexId}else if(e.idPrefix){t=r([e.idPrefix,"Field-content"])}return s`
			<controls:FormElementWrapper
				xmlns:controls="sap.fe.core.controls"
				visible="${e.avatarVisible}"
			>
			<Avatar
				xmlns="sap.m"
				id="${t}"
				src="${e.avatarSrc}"
				displaySize="S"
				class="sapUiSmallMarginEnd"
				displayShape="Square"
			/>
		</controls:FormElementWrapper>`},getTemplate:e=>{let t;switch(e.displayStyle){case"Button":t=d.getButtonTemplate(e);break;case"DataPoint":t=d.getDataPointTemplate(e);break;case"ExpandableText":t=d.getExpandableText(e);break;case"Avatar":t=d.getAvatarTemplate(e);break;case"Contact":t=d.getContactTemplate(e);break;case"File":t=d.getFile(e);break;default:t=s`<core:Fragment fragmentName="sap.fe.macros.internal.field.displayStyle.${e.displayStyle}" type="XML" />`}return t}};return d},false);