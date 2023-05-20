/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase","sap/fe/core/buildingBlocks/BuildingBlockSupport","sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor","sap/fe/core/converters/controls/Common/Form","sap/fe/core/converters/helpers/BindingHelper","sap/fe/core/converters/helpers/ID","sap/fe/core/converters/MetaModelConverter","sap/fe/core/helpers/BindingToolkit","sap/fe/core/templating/DataModelPathHelper","sap/fe/macros/form/FormHelper","sap/ui/core/library","sap/ui/model/odata/v4/AnnotationHelper"],function(e,t,a,i,r,n,o,l,s,u,c,p){"use strict";var m,f,b,h,y,d,g,v,P,C,$,L,F,x,S,T,w,I,M,z,E,O,k,B,j,A,_,D,X;var U={};var N=c.TitleLevel;var R=s.getContextRelativeTargetObjectPath;var V=l.resolveBindingString;var q=l.ifElse;var G=l.equal;var H=l.compileExpression;var Q=o.getInvolvedDataModelObjects;var W=n.getFormContainerID;var J=r.UI;var K=i.createFormDefinition;var Y=a.xml;var Z=t.defineBuildingBlock;var ee=t.blockEvent;var te=t.blockAttribute;var ae=t.blockAggregation;function ie(e,t,a,i){if(!a)return;Object.defineProperty(e,t,{enumerable:a.enumerable,configurable:a.configurable,writable:a.writable,value:a.initializer?a.initializer.call(i):void 0})}function re(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function ne(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;oe(e,t)}function oe(e,t){oe=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,a){t.__proto__=a;return t};return oe(e,t)}function le(e,t,a,i,r){var n={};Object.keys(i).forEach(function(e){n[e]=i[e]});n.enumerable=!!n.enumerable;n.configurable=!!n.configurable;if("value"in n||n.initializer){n.writable=true}n=a.slice().reverse().reduce(function(a,i){return i(e,t,a)||a},n);if(r&&n.initializer!==void 0){n.value=n.initializer?n.initializer.call(r):void 0;n.initializer=undefined}if(n.initializer===void 0){Object.defineProperty(e,t,n);n=null}return n}function se(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let ue=(m=Z({name:"Form",namespace:"sap.fe.macros.internal",publicNamespace:"sap.fe.macros"}),f=te({type:"string",isPublic:true,required:true}),b=te({type:"sap.ui.model.Context",required:true,isPublic:true,expectedTypes:["EntitySet","NavigationProperty","Singleton","EntityType"]}),h=te({type:"sap.ui.model.Context",isPublic:true,required:true,expectedAnnotationTypes:["com.sap.vocabularies.UI.v1.FieldGroupType","com.sap.vocabularies.UI.v1.CollectionFacet","com.sap.vocabularies.UI.v1.ReferenceFacet"],expectedTypes:["EntitySet","EntityType","Singleton","NavigationProperty"]}),y=te({type:"array"}),d=te({type:"boolean"}),g=te({type:"boolean"}),v=te({type:"string",isPublic:true}),P=te({type:"sap.ui.core.TitleLevel",isPublic:true}),C=te({type:"string"}),$=te({type:"string"}),L=ee(),F=ae({type:"sap.fe.macros.form.FormElement",isPublic:true,slot:"formElements",isDefault:true}),x=te({type:"object",isPublic:true}),m(S=(T=function(e){ne(t,e);function t(t,a,i){var r;r=e.call(this,t,a,i)||this;ie(r,"id",w,re(r));ie(r,"contextPath",I,re(r));ie(r,"metaPath",M,re(r));ie(r,"formContainers",z,re(r));ie(r,"useFormContainerLabels",E,re(r));ie(r,"partOfPreview",O,re(r));ie(r,"title",k,re(r));ie(r,"titleLevel",B,re(r));ie(r,"displayMode",j,re(r));ie(r,"isVisible",A,re(r));ie(r,"onChange",_,re(r));ie(r,"formElements",D,re(r));ie(r,"layout",X,re(r));if(r.metaPath&&r.contextPath&&(r.formContainers===undefined||r.formContainers===null)){const e=Q(r.metaPath,r.contextPath);const t={};let a=e.targetObject;let n=false;if(a&&a.$Type==="com.sap.vocabularies.UI.v1.FieldGroupType"){n=true;a={$Type:"com.sap.vocabularies.UI.v1.ReferenceFacet",Label:a.Label,Target:{$target:a,fullyQualifiedName:a.fullyQualifiedName,path:"",term:"",type:"AnnotationPath",value:R(e)},annotations:{},fullyQualifiedName:a.fullyQualifiedName};t[a.Target.value]={fields:r.formElements}}const o=r.getConverterContext(e,undefined,i,t);const l=K(a,r.isVisible,o);if(n){l.formContainers[0].annotationPath=r.metaPath.getPath()}r.formContainers=l.formContainers;r.useFormContainerLabels=l.useFormContainerLabels;r.facetType=a&&a.$Type}else{var n;r.facetType=(n=r.metaPath.getObject())===null||n===void 0?void 0:n.$Type}if(!r.isPublic){r._apiId=r.createId("Form");r._contentId=r.id}else{r._apiId=r.id;r._contentId=`${r.id}-content`}if(r.displayMode!==undefined){r._editable=H(q(G(V(r.displayMode,"boolean"),false),true,false))}else{r._editable=H(J.IsEditable)}return r}U=t;var a=t.prototype;a.getDataFieldCollection=function e(t,a){const i=Q(a).targetObject;let r;let n;if(i.$Type==="com.sap.vocabularies.UI.v1.ReferenceFacet"){r=p.getNavigationPath(i.Target.value);n=i}else{const e=this.contextPath.getPath();let t=a.getPath();if(t.startsWith(e)){t=t.substring(e.length)}r=p.getNavigationPath(t);n=t}const o=u.getFormContainerTitleLevel(this.title,this.titleLevel);const l=this.useFormContainerLabels&&i?p.label(i,{context:a}):"";const s=this.id?W(n):undefined;return Y`
					<macro:FormContainer
					xmlns:macro="sap.fe.macros"
					${this.attr("id",s)}
					title="${l}"
					titleLevel="${o}"
					contextPath="${r?t.entitySet:this.contextPath}"
					metaPath="${a}"
					dataFieldCollection="${t.formElements}"
					navigationPath="${r}"
					visible="${t.isVisible}"
					displayMode="${this.displayMode}"
					onChange="${this.onChange}"
					actions="${t.actions}"
				>
				<macro:formElements>
					<slot name="formElements" />
				</macro:formElements>
			</macro:FormContainer>`};a.getFormContainers=function e(){if(this.formContainers.length===0){return""}if(this.facetType.indexOf("com.sap.vocabularies.UI.v1.CollectionFacet")>=0){return this.formContainers.map((e,t)=>{if(e.isVisible){const a=this.contextPath.getModel().createBindingContext(e.annotationPath,this.contextPath);const i=a.getObject();if(i.$Type==="com.sap.vocabularies.UI.v1.ReferenceFacet"&&u.isReferenceFacetPartOfPreview(i,this.partOfPreview)){if(i.Target.$AnnotationPath.$Type==="com.sap.vocabularies.Communication.v1.AddressType"){return Y`<template:with path="formContainers>${t}" var="formContainer">
											<template:with path="formContainers>${t}/annotationPath" var="facet">
												<core:Fragment fragmentName="sap.fe.macros.form.AddressSection" type="XML" />
											</template:with>
										</template:with>`}return this.getDataFieldCollection(e,a)}}return""})}else if(this.facetType==="com.sap.vocabularies.UI.v1.ReferenceFacet"){return this.formContainers.map(e=>{if(e.isVisible){const t=this.contextPath.getModel().createBindingContext(e.annotationPath,this.contextPath);return this.getDataFieldCollection(e,t)}else{return""}})}return Y``};a.getLayoutInformation=function e(){switch(this.layout.type){case"ResponsiveGridLayout":return Y`<f:ResponsiveGridLayout adjustLabelSpan="${this.layout.adjustLabelSpan}"
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
													singleContainerFullSize="${this.layout.singleContainerFullSize}" />`;case"ColumnLayout":default:return Y`<f:ColumnLayout
								columnsM="${this.layout.columnsM}"
								columnsL="${this.layout.columnsL}"
								columnsXL="${this.layout.columnsXL}"
								labelCellsLarge="${this.layout.labelCellsLarge}"
								emptyCellsLarge="${this.layout.emptyCellsLarge}" />`}};a.getTemplate=function e(){const t=this.onChange&&this.onChange.replace("{","\\{").replace("}","\\}")||"";const a=this.metaPath.getPath();const i=this.contextPath.getPath();if(!this.isVisible){return Y``}else{return Y`<macro:FormAPI xmlns:macro="sap.fe.macros.form"
					xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
					xmlns:f="sap.ui.layout.form"
					xmlns:fl="sap.ui.fl"
					id="${this._apiId}"
					metaPath="${a}"
					contextPath="${i}">
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
					macrodata:navigationPath="${i}"
					macrodata:onChange="${t}"
				>
					${this.addConditionally(this.title!==undefined,Y`<f:title>
							<core:Title level="${this.titleLevel}" text="${this.title}" />
						</f:title>`)}
					<f:layout>
					${this.getLayoutInformation()}

					</f:layout>
					<f:formContainers>
						${this.getFormContainers()}
					</f:formContainers>
				</f:Form>
			</macro:FormAPI>`}};return t}(e),w=le(T.prototype,"id",[f],{configurable:true,enumerable:true,writable:true,initializer:null}),I=le(T.prototype,"contextPath",[b],{configurable:true,enumerable:true,writable:true,initializer:null}),M=le(T.prototype,"metaPath",[h],{configurable:true,enumerable:true,writable:true,initializer:null}),z=le(T.prototype,"formContainers",[y],{configurable:true,enumerable:true,writable:true,initializer:null}),E=le(T.prototype,"useFormContainerLabels",[d],{configurable:true,enumerable:true,writable:true,initializer:null}),O=le(T.prototype,"partOfPreview",[g],{configurable:true,enumerable:true,writable:true,initializer:function(){return true}}),k=le(T.prototype,"title",[v],{configurable:true,enumerable:true,writable:true,initializer:null}),B=le(T.prototype,"titleLevel",[P],{configurable:true,enumerable:true,writable:true,initializer:function(){return N.Auto}}),j=le(T.prototype,"displayMode",[C],{configurable:true,enumerable:true,writable:true,initializer:null}),A=le(T.prototype,"isVisible",[$],{configurable:true,enumerable:true,writable:true,initializer:function(){return"true"}}),_=le(T.prototype,"onChange",[L],{configurable:true,enumerable:true,writable:true,initializer:null}),D=le(T.prototype,"formElements",[F],{configurable:true,enumerable:true,writable:true,initializer:null}),X=le(T.prototype,"layout",[x],{configurable:true,enumerable:true,writable:true,initializer:function(){return{type:"ColumnLayout",columnsM:2,columnsXL:6,columnsL:3,labelCellsLarge:12}}}),T))||S);U=ue;return U},false);