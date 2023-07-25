/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase","sap/fe/core/buildingBlocks/BuildingBlockSupport","sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor","sap/fe/core/converters/MetaModelConverter","sap/fe/core/helpers/BindingToolkit","sap/fe/core/helpers/StableIdHelper","sap/fe/core/templating/DataModelPathHelper"],function(e,t,i,r,a,n,l){"use strict";var o,u,s,c,d,p,f,b,m,h,g,v,y,P,x;var B={};var w=l.getRelativePaths;var z=n.generate;var k=a.getExpressionFromAnnotation;var O=r.getInvolvedDataModelObjects;var C=r.convertMetaModelContext;var I=i.xml;var _=t.defineBuildingBlock;var j=t.blockAttribute;function F(e,t,i,r){if(!i)return;Object.defineProperty(e,t,{enumerable:i.enumerable,configurable:i.configurable,writable:i.writable,value:i.initializer?i.initializer.call(r):void 0})}function M(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function T(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;D(e,t)}function D(e,t){D=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,i){t.__proto__=i;return t};return D(e,t)}function E(e,t,i,r,a){var n={};Object.keys(r).forEach(function(e){n[e]=r[e]});n.enumerable=!!n.enumerable;n.configurable=!!n.configurable;if("value"in n||n.initializer){n.writable=true}n=i.slice().reverse().reduce(function(i,r){return r(e,t,i)||i},n);if(a&&n.initializer!==void 0){n.value=n.initializer?n.initializer.call(a):void 0;n.initializer=undefined}if(n.initializer===void 0){Object.defineProperty(e,t,n);n=null}return n}function L(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let S=(o=_({name:"Contact",namespace:"sap.fe.macros",designtime:"sap/fe/macros/Contact.designtime"}),u=j({type:"string"}),s=j({type:"string"}),c=j({type:"sap.ui.model.Context",expectedTypes:["com.sap.vocabularies.Communication.v1.ContactType"],required:true}),d=j({type:"sap.ui.model.Context",expectedTypes:["EntitySet","NavigationProperty","EntityType","Singleton"]}),p=j({type:"string"}),f=j({type:"boolean"}),o(b=(m=function(e){T(t,e);function t(){var t;for(var i=arguments.length,r=new Array(i),a=0;a<i;a++){r[a]=arguments[a]}t=e.call(this,...r)||this;F(t,"idPrefix",h,M(t));F(t,"_flexId",g,M(t));F(t,"metaPath",v,M(t));F(t,"contextPath",y,M(t));F(t,"ariaLabelledBy",P,M(t));F(t,"visible",x,M(t));return t}B=t;var i=t.prototype;i.getTemplate=function e(){let t;if(this._flexId){t=this._flexId}else{t=this.idPrefix?z([this.idPrefix,"Field-content"]):undefined}const i=C(this.metaPath);const r=O(this.metaPath,this.contextPath);const a=k(i.fn,w(r));const n={name:"sap/fe/macros/contact/ContactDelegate",payload:{contact:this.metaPath.getPath()}};return I`<mdc:Field
		xmlns:mdc="sap.ui.mdc"
		delegate="{name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate'}"
		${this.attr("id",t)}
		editMode="Display"
		width="100%"
		${this.attr("visible",this.visible)}
		${this.attr("value",a)}
		${this.attr("ariaLabelledBy",this.ariaLabelledBy)}
	>
		<mdc:fieldInfo>
			<mdc:Link
				core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				enablePersonalization="false"
				${this.attr("delegate",JSON.stringify(n))}
			/>
		</mdc:fieldInfo>
	</mdc:Field>
			`};return t}(e),h=E(m.prototype,"idPrefix",[u],{configurable:true,enumerable:true,writable:true,initializer:null}),g=E(m.prototype,"_flexId",[s],{configurable:true,enumerable:true,writable:true,initializer:null}),v=E(m.prototype,"metaPath",[c],{configurable:true,enumerable:true,writable:true,initializer:null}),y=E(m.prototype,"contextPath",[d],{configurable:true,enumerable:true,writable:true,initializer:null}),P=E(m.prototype,"ariaLabelledBy",[p],{configurable:true,enumerable:true,writable:true,initializer:null}),x=E(m.prototype,"visible",[f],{configurable:true,enumerable:true,writable:true,initializer:null}),m))||b);B=S;return B},false);