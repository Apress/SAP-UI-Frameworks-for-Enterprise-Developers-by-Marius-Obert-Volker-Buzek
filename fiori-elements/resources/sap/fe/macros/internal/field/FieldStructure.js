/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor","sap/fe/core/helpers/StableIdHelper","sap/ui/mdc/enum/EditMode","./DisplayStyle","./EditStyle"],function(e,l,t,i,n){"use strict";var o=l.generate;var a=e.xml;function r(e,l){let i;if(e.formatOptions.fieldMode==="nowrapper"&&e.editMode===t.Display){return l}if(e._apiId){i=e._apiId}else if(e.idPrefix){i=o([e.idPrefix,"Field"])}else{i=undefined}let n="";if(e.onChange!==null&&e.onChange!=="null"&&e.onChange!==undefined){n=a`change="${e.onChange}"`}return a`
			<macroField:FieldAPI
				xmlns:macroField="sap.fe.macros.field"
				${n}
				id="${i}"
				required="${e.requiredExpression}"
				editable="${e.editableExpression}"
				collaborationEnabled="${e.collaborationEnabled}"
				visible="${e.visible}"
			>
				${l}
			</macroField:FieldAPI>
		`}function s(e){let l;if(e.editMode!==t.Display&&!!e.editStyle){const t=n.getTemplate(e);let i;if(e.collaborationEnabled??false){i=a`<HBox xmlns="sap.m" width="100%">
            ${t}
            <core:Fragment fragmentName="sap.fe.macros.internal.CollaborationAvatar" type="XML" />
        </HBox>`}else{i=t}l=a`${i}`}return l||""}function d(e){let l;if(e._flexId){l=e._flexId}else if(e.idPrefix){l=o([e.idPrefix,"Field-content"])}else{l=undefined}const t=i.getTemplate(e);const n=s(e);return a`<controls:FieldWrapper
		xmlns:controls="sap.fe.macros.controls"
		id="${l}"
		editMode="${e.editMode}"
		visible="${e.visible}"
		width="100%"
		textAlign="${e.textAlign}"
		class="${e.class}"
		>

		<controls:contentDisplay>
			${t}
		</controls:contentDisplay>
		<controls:contentEdit>
			${n}
		</controls:contentEdit>

	</controls:FieldWrapper>`}function c(e){if(e.displayStyle==="Avatar"||e.displayStyle==="Contact"||e.displayStyle==="Button"||e.displayStyle==="File"){if(e.displayStyle==="File"&&(e.collaborationEnabled??false)&&e.editMode!==t.Display){const l=a`
				<HBox xmlns="sap.m" width="100%">
				<VBox width="100%">
					${i.getFile(e)}
				</VBox>
				<core:Fragment fragmentName="sap.fe.macros.internal.CollaborationAvatar" type="XML" />
			</HBox>`;return r(e,l)}else{return r(e,i.getTemplate(e))}}else if(e.formatOptions.fieldMode==="nowrapper"&&e.editMode===t.Display){return i.getTemplate(e)}else{const l=d(e);return r(e,l)}}return c},false);