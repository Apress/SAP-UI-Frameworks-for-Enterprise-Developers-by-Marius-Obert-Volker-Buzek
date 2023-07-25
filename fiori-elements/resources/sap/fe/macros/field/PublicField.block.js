/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase","sap/fe/core/buildingBlocks/BuildingBlockSupport","sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor","sap/fe/core/helpers/BindingToolkit","sap/fe/macros/field/FieldHelper"],function(e,t,i,r,a){"use strict";var n,o,l,s,u,p,c,d,f,h,m,b,y,x,g,O,v,w,M;var P={};var $=r.resolveBindingString;var D=r.ifElse;var E=r.equal;var B=r.compileExpression;var z=i.xml;var j=t.defineBuildingBlock;var F=t.blockEvent;var k=t.blockAttribute;function T(e,t,i,r){if(!i)return;Object.defineProperty(e,t,{enumerable:i.enumerable,configurable:i.configurable,writable:i.writable,value:i.initializer?i.initializer.call(r):void 0})}function H(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function V(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;q(e,t)}function q(e,t){q=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,i){t.__proto__=i;return t};return q(e,t)}function _(e,t,i,r,a){var n={};Object.keys(r).forEach(function(e){n[e]=r[e]});n.enumerable=!!n.enumerable;n.configurable=!!n.configurable;if("value"in n||n.initializer){n.writable=true}n=i.slice().reverse().reduce(function(i,r){return r(e,t,i)||i},n);if(a&&n.initializer!==void 0){n.value=n.initializer?n.initializer.call(a):void 0;n.initializer=undefined}if(n.initializer===void 0){Object.defineProperty(e,t,n);n=null}return n}function A(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let C=(n=j({name:"Field",publicNamespace:"sap.fe.macros"}),o=k({type:"string",isPublic:true,required:true}),l=k({type:"sap.ui.model.Context",isPublic:true,required:true}),s=k({type:"sap.ui.model.Context",isPublic:true,required:true}),u=k({type:"boolean",isPublic:true,required:false}),p=k({type:"string",isPublic:true,required:false}),c=k({type:"string",isPublic:true,required:false}),d=k({type:"object",isPublic:true,validate:function(e){if(e.displayMode&&!["Value","Description","ValueDescription","DescriptionValue"].includes(e.displayMode)){throw new Error(`Allowed value ${e.displayMode} for displayMode does not match`)}if(e.measureDisplayMode&&!["Hidden","ReadOnly"].includes(e.measureDisplayMode)){throw new Error(`Allowed value ${e.measureDisplayMode} for measureDisplayMode does not match`)}if(e.textExpandBehaviorDisplay&&!["InPlace","Popover"].includes(e.textExpandBehaviorDisplay)){throw new Error(`Allowed value ${e.textExpandBehaviorDisplay} for textExpandBehaviorDisplay does not match`)}return e}}),f=F(),n(h=(m=function(e){V(t,e);function t(t){var i;i=e.call(this,t)||this;T(i,"id",b,H(i));T(i,"metaPath",y,H(i));T(i,"contextPath",x,H(i));T(i,"readOnly",g,H(i));T(i,"semanticObject",O,H(i));T(i,"editModeExpression",v,H(i));T(i,"formatOptions",w,H(i));T(i,"change",M,H(i));if(i.readOnly!==undefined){i.editModeExpression=B(D(E($(i.readOnly,"boolean"),true),"Display","Editable"))}return i}P=t;var i=t.prototype;i.getFormatOptions=function e(){return z`
		<internalMacro:formatOptions
			textAlignMode="Form"
			showEmptyIndicator="true"
			displayMode="${this.formatOptions.displayMode}"
			measureDisplayMode="${this.formatOptions.measureDisplayMode}"
			textLinesEdit="${this.formatOptions.textLinesEdit}"
			textMaxLines="${this.formatOptions.textMaxLines}"
			textMaxCharactersDisplay="${this.formatOptions.textMaxCharactersDisplay}"
			textExpandBehaviorDisplay="${this.formatOptions.textExpandBehaviorDisplay}"
			textMaxLength="${this.formatOptions.textMaxLength}"
			>
			${this.writeDateFormatOptions()}
		</internalMacro:formatOptions>
			`};i.writeDateFormatOptions=function e(){if(this.formatOptions.showTime||this.formatOptions.showDate||this.formatOptions.showTimezone){return z`<internalMacro:dateFormatOptions showTime="${this.formatOptions.showTime}"
				showDate="${this.formatOptions.showDate}"
				showTimezone="${this.formatOptions.showTimezone}"
				/>`}return""};i.getPossibleValueHelpTemplate=function e(){const t=a.valueHelpProperty(this.metaPath);const i=this.metaPath.getModel().createBindingContext(t,this.metaPath);const r=a.hasValueHelpAnnotation(i.getObject("@"));if(r){return z`
			<internalMacro:dependents>
				<macros:ValueHelp _flexId="${this.id}-content_FieldValueHelp" property="${i}" contextPath="${this.contextPath}" />
			</internalMacro:dependents>`}return""};i.getTemplate=function e(){const t=this.contextPath.getPath();const i=this.metaPath.getPath();return z`
		<internalMacro:Field
			xmlns:internalMacro="sap.fe.macros.internal"
			entitySet="${t}"
			dataField="${i}"
			editMode="${this.editModeExpression}"
			onChange="${this.change}"
			_flexId="${this.id}"
			semanticObject="${this.semanticObject}"
		>
			${this.getFormatOptions()}
			${this.getPossibleValueHelpTemplate()}
		</internalMacro:Field>`};return t}(e),b=_(m.prototype,"id",[o],{configurable:true,enumerable:true,writable:true,initializer:null}),y=_(m.prototype,"metaPath",[l],{configurable:true,enumerable:true,writable:true,initializer:null}),x=_(m.prototype,"contextPath",[s],{configurable:true,enumerable:true,writable:true,initializer:null}),g=_(m.prototype,"readOnly",[u],{configurable:true,enumerable:true,writable:true,initializer:null}),O=_(m.prototype,"semanticObject",[p],{configurable:true,enumerable:true,writable:true,initializer:null}),v=_(m.prototype,"editModeExpression",[c],{configurable:true,enumerable:true,writable:true,initializer:null}),w=_(m.prototype,"formatOptions",[d],{configurable:true,enumerable:true,writable:true,initializer:function(){return{}}}),M=_(m.prototype,"change",[f],{configurable:true,enumerable:true,writable:true,initializer:null}),m))||h);P=C;return P},false);