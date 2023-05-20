/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/fe/core/buildingBlocks/BuildingBlockBase","sap/fe/core/buildingBlocks/BuildingBlockSupport","sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor","sap/fe/core/converters/MetaModelConverter","sap/fe/core/helpers/BindingToolkit","sap/fe/core/helpers/StableIdHelper","sap/fe/core/templating/DataModelPathHelper","sap/fe/core/templating/PropertyFormatters","sap/fe/macros/CommonHelper","sap/fe/macros/field/FieldHelper","sap/fe/macros/filter/FilterFieldHelper","sap/fe/macros/filter/FilterFieldTemplating"],function(e,t,i,r,a,n,l,o,s,u,p,c,d){"use strict";var f,m,b,h,v,y,g,P,F,x,$,C,O,B,T,w,z;var D={};var E=d.getFilterFieldDisplayFormat;var I=c.maxConditions;var V=c.isRequiredInFilter;var j=c.getPlaceholder;var k=c.getDataType;var H=c.getConditionsBinding;var q=c.formatOptions;var A=c.constraints;var S=s.getRelativePropertyPath;var L=o.getTargetObjectPath;var M=l.generate;var R=n.getExpressionFromAnnotation;var _=n.compileExpression;var W=r.xml;var U=r.SAP_UI_MODEL_CONTEXT;var N=i.defineBuildingBlock;var X=i.blockAttribute;function G(e,t,i,r){if(!i)return;Object.defineProperty(e,t,{enumerable:i.enumerable,configurable:i.configurable,writable:i.writable,value:i.initializer?i.initializer.call(r):void 0})}function J(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function K(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;Q(e,t)}function Q(e,t){Q=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,i){t.__proto__=i;return t};return Q(e,t)}function Y(e,t,i,r,a){var n={};Object.keys(r).forEach(function(e){n[e]=r[e]});n.enumerable=!!n.enumerable;n.configurable=!!n.configurable;if("value"in n||n.initializer){n.writable=true}n=i.slice().reverse().reduce(function(i,r){return r(e,t,i)||i},n);if(a&&n.initializer!==void 0){n.value=n.initializer?n.initializer.call(a):void 0;n.initializer=undefined}if(n.initializer===void 0){Object.defineProperty(e,t,n);n=null}return n}function Z(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let ee=(f=N({name:"FilterField",namespace:"sap.fe.macros.internal"}),m=X({type:"sap.ui.model.Context",required:true,isPublic:true}),b=X({type:"sap.ui.model.Context",required:true,isPublic:true}),h=X({type:"sap.ui.model.Context",isPublic:true}),v=X({type:"string",isPublic:true}),y=X({type:"string",isPublic:true}),g=X({type:"boolean",isPublic:true}),P=X({type:"string",isPublic:true}),f(F=(x=function(t){K(i,t);function i(e,i,r){var n,l,o,s;var c;c=t.call(this,e,i,r)||this;G(c,"property",$,J(c));G(c,"contextPath",C,J(c));G(c,"visualFilter",O,J(c));G(c,"idPrefix",B,J(c));G(c,"vhIdPrefix",T,J(c));G(c,"useSemanticDateRange",w,J(c));G(c,"settings",z,J(c));const d=a.convertMetaModelContext(c.property);const f=a.getInvolvedDataModelObjects(c.property,c.contextPath);const m=d.name,b=!!((n=d.annotations)!==null&&n!==void 0&&(l=n.Common)!==null&&l!==void 0&&l.ValueListWithFixedValues);c.controlId=c.idPrefix&&M([c.idPrefix,m]);c.sourcePath=L(f);c.dataType=k(d);const h=(d===null||d===void 0?void 0:(o=d.annotations)===null||o===void 0?void 0:(s=o.Common)===null||s===void 0?void 0:s.Label)||m;const v=R(h);c.label=_(v)||m;c.conditionsBinding=H(f)||"";c.placeholder=j(d);c.vfEnabled=!!c.visualFilter&&!(c.idPrefix&&c.idPrefix.indexOf("Adaptation")>-1);c.vfId=c.vfEnabled?M([c.idPrefix,m,"VisualFilter"]):undefined;const y=c.property,g=y.getModel(),P=p.valueHelpPropertyForFilterField(y),F=u.isPropertyFilterable(y),x=y.getObject(),D={context:y};c.display=E(f,d,D);c.isFilterable=!(F===false||F==="false");c.maxConditions=I(x,D);c.dataTypeConstraints=A(x,D);c.dataTypeFormatOptions=q(x,D);c.required=V(x,D);c.operators=p.operators(y,x,c.useSemanticDateRange,c.settings||"",c.contextPath.getPath());const W=g.createBindingContext(P);const U=W.getObject(),N={context:W},X=S(U,N),K=S(x,D);c.fieldHelpProperty=p.getFieldHelpPropertyForFilterField(y,x,x.$Type,c.vhIdPrefix,K,X,b,c.useSemanticDateRange);return c}D=i;var r=i.prototype;r.getVisualFilterContent=function e(){var t,i;let r=this.visualFilter,a=W``;if(!this.vfEnabled||!r){return a}if((t=r)!==null&&t!==void 0&&(i=t.isA)!==null&&i!==void 0&&i.call(t,U)){r=r.getObject()}const{contextPath:n,presentationAnnotation:l,outParameter:o,inParameters:s,valuelistProperty:p,selectionVariantAnnotation:c,multipleSelectionAllowed:d,required:f,requiredProperties:m=[],showOverlayInitially:b,renderLineChart:h,isValueListWithFixedValues:v}=r;a=W`
				<macro:VisualFilter
					id="${this.vfId}"
					contextPath="${n}"
					metaPath="${l}"
					outParameter="${o}"
					inParameters="${s}"
					valuelistProperty="${p}"
					selectionVariantAnnotation="${c}"
					multipleSelectionAllowed="${d}"
					required="${f}"
					requiredProperties="${u.stringifyCustomData(m)}"
					showOverlayInitially="${b}"
					renderLineChart="${h}"
					isValueListWithFixedValues="${v}"
					filterBarEntityType="${n}"
				/>
			`;return a};r.getTemplate=async function t(){let i=``;if(this.isFilterable){let t;try{t=await this.display}catch(t){e.error(`FE : FilterField BuildingBlock : Error fetching display property for ${this.sourcePath} : ${t}`)}i=W`
				<mdc:FilterField
					xmlns:mdc="sap.ui.mdc"
					xmlns:macro="sap.fe.macros"
					xmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"
					xmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
					unittest:id="UnitTest::FilterField"
					customData:sourcePath="${this.sourcePath}"
					id="${this.controlId}"
					delegate="{name: 'sap/fe/macros/field/FieldBaseDelegate', payload:{isFilterField:true}}"
					label="${this.label}"
					dataType="${this.dataType}"
					display="${t}"
					maxConditions="${this.maxConditions}"
					fieldHelp="${this.fieldHelpProperty}"
					conditions="${this.conditionsBinding}"
					dataTypeConstraints="${this.dataTypeConstraints}"
					dataTypeFormatOptions="${this.dataTypeFormatOptions}"
					required="${this.required}"
					operators="${this.operators}"
					placeholder="${this.placeholder}"

				>
					${this.vfEnabled?this.getVisualFilterContent():W``}
				</mdc:FilterField>
			`}return i};return i}(t),$=Y(x.prototype,"property",[m],{configurable:true,enumerable:true,writable:true,initializer:null}),C=Y(x.prototype,"contextPath",[b],{configurable:true,enumerable:true,writable:true,initializer:null}),O=Y(x.prototype,"visualFilter",[h],{configurable:true,enumerable:true,writable:true,initializer:null}),B=Y(x.prototype,"idPrefix",[v],{configurable:true,enumerable:true,writable:true,initializer:function(){return"FilterField"}}),T=Y(x.prototype,"vhIdPrefix",[y],{configurable:true,enumerable:true,writable:true,initializer:function(){return"FilterFieldValueHelp"}}),w=Y(x.prototype,"useSemanticDateRange",[g],{configurable:true,enumerable:true,writable:true,initializer:function(){return true}}),z=Y(x.prototype,"settings",[P],{configurable:true,enumerable:true,writable:true,initializer:function(){return""}}),x))||F);D=ee;return D},false);