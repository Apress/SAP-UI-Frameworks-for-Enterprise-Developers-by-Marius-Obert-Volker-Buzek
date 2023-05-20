/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor"],function(e){"use strict";var t=e.xml;const a={getCheckBoxTemplate(e){return t`
		    <CheckBox
                xmlns="sap.m"        
                xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
		        macrodata:sourcePath="${e.dataSourcePath}"
				xmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"
		        core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				unittest:id="MacroInput"
		        id="${e.editStyleId}"
		        selected="${e.valueBindingExpression}"
		        editable="${e.editableExpression}"
		        enabled="${e.enabledExpression}"
		        select="FieldRuntime.handleChange($controller, $event)"
		        fieldGroupIds="${e.fieldGroupIds}"
		        validateFieldGroup="FieldRuntime.onValidateFieldGroup($controller, $event)"
		        ariaLabelledBy="${e.ariaLabelledBy}"
	    />
        `},getTemplate:e=>{let i;switch(e.editStyle){case"CheckBox":i=a.getCheckBoxTemplate(e);break;default:i=t`<core:Fragment
			fragmentName="sap.fe.macros.internal.field.editStyle.${e.editStyle}"
			type="XML"
		/>`}return i}};return a},false);