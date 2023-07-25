/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/fe/core/buildingBlocks/BuildingBlockBase","sap/fe/core/buildingBlocks/BuildingBlockSupport","sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor","sap/fe/core/converters/controls/Common/DataVisualization","sap/fe/core/converters/controls/ListReport/FilterBar","sap/fe/core/converters/MetaModelConverter","sap/fe/core/helpers/MetaModelFunction","sap/fe/core/helpers/ModelHelper","sap/fe/core/helpers/StableIdHelper","sap/fe/core/TemplateModel","sap/fe/core/templating/FilterHelper","sap/fe/macros/CommonHelper"],function(e,t,r,i,a,l,n,o,s,u,c,p,d){"use strict";var f,b,h,g,m,y,v,F,C,S,w,B,P,$,I,_,D,z,x,A,M,k,E,H,T,R,O,V,L,N,j,q,U,J,X,G,W,K,Q,Y,Z,ee,te,re,ie,ae,le,ne,oe,se,ue,ce,pe,de,fe,be,he,ge,me,ye,ve,Fe,Ce;var Se={};var we=p.getFilterConditions;var Be=u.generate;var Pe=o.getSearchRestrictions;var $e=n.getInvolvedDataModelObjects;var Ie=l.getSelectionFields;var _e=a.getSelectionVariant;var De=i.xml;var ze=r.defineBuildingBlock;var xe=r.blockEvent;var Ae=r.blockAttribute;var Me=r.blockAggregation;function ke(e,t,r,i){if(!r)return;Object.defineProperty(e,t,{enumerable:r.enumerable,configurable:r.configurable,writable:r.writable,value:r.initializer?r.initializer.call(i):void 0})}function Ee(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function He(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;Te(e,t)}function Te(e,t){Te=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,r){t.__proto__=r;return t};return Te(e,t)}function Re(e,t,r,i,a){var l={};Object.keys(i).forEach(function(e){l[e]=i[e]});l.enumerable=!!l.enumerable;l.configurable=!!l.configurable;if("value"in l||l.initializer){l.writable=true}l=r.slice().reverse().reduce(function(r,i){return i(e,t,r)||r},l);if(a&&l.initializer!==void 0){l.value=l.initializer?l.initializer.call(a):void 0;l.initializer=undefined}if(l.initializer===void 0){Object.defineProperty(e,t,l);l=null}return l}function Oe(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}const Ve=function(e,t){t.slotName=t.key;t.key=t.key.replace("InlineXML_","");t.label=e.getAttribute("label");t.required=e.getAttribute("required")==="true";return t};let Le=(f=ze({name:"FilterBar",namespace:"sap.fe.macros.internal",publicNamespace:"sap.fe.macros"}),b=Ae({type:"string",isPublic:true}),h=Ae({type:"boolean",isPublic:true}),g=Ae({type:"sap.ui.model.Context"}),m=Ae({type:"string"}),y=Ae({type:"sap.ui.model.Context",isPublic:true}),v=Ae({type:"sap.ui.model.Context",isPublic:true}),F=Ae({type:"boolean",isPublic:true}),C=Ae({type:"string"}),S=Ae({type:"boolean"}),w=Ae({type:"boolean"}),B=Ae({type:"boolean"}),P=Ae({type:"sap.ui.mdc.FilterBarP13nMode[]"}),$=Ae({type:"string"}),I=Ae({type:"boolean"}),_=Ae({type:"boolean",isPublic:true}),D=Ae({type:"string",required:false}),z=Ae({type:"boolean"}),x=Ae({type:"boolean"}),A=Ae({type:"boolean"}),M=Ae({type:"string"}),k=Ae({type:"string"}),E=Ae({type:"boolean",isPublic:true}),H=Ae({type:"boolean"}),T=xe(),R=xe(),O=xe(),V=xe(),L=xe(),N=xe(),j=Me({type:"sap.fe.macros.FilterField",isPublic:true,hasVirtualNode:true,processAggregations:Ve}),f(q=(U=function(t){He(r,t);function r(r,i,a){var l,n,o,u;var p;p=t.call(this,r,i,a)||this;ke(p,"id",J,Ee(p));ke(p,"visible",X,Ee(p));ke(p,"selectionFields",G,Ee(p));ke(p,"filterBarDelegate",W,Ee(p));ke(p,"metaPath",K,Ee(p));ke(p,"contextPath",Q,Ee(p));ke(p,"showMessages",Y,Ee(p));ke(p,"variantBackreference",Z,Ee(p));ke(p,"hideBasicSearch",ee,Ee(p));ke(p,"enableFallback",te,Ee(p));ke(p,"showAdaptFiltersButton",re,Ee(p));ke(p,"p13nMode",ie,Ee(p));ke(p,"propertyInfo",ae,Ee(p));ke(p,"useSemanticDateRange",le,Ee(p));ke(p,"liveMode",ne,Ee(p));ke(p,"filterConditions",oe,Ee(p));ke(p,"suspendSelection",se,Ee(p));ke(p,"showDraftEditState",ue,Ee(p));ke(p,"isDraftCollaborative",ce,Ee(p));ke(p,"toggleControlId",pe,Ee(p));ke(p,"initialLayout",de,Ee(p));ke(p,"showClearButton",fe,Ee(p));ke(p,"_applyIdToContent",be,Ee(p));ke(p,"search",he,Ee(p));ke(p,"filterChanged",ge,Ee(p));ke(p,"stateChange",me,Ee(p));ke(p,"internalFilterChanged",ye,Ee(p));ke(p,"internalSearch",ve,Ee(p));ke(p,"afterClear",Fe,Ee(p));ke(p,"filterFields",Ce,Ee(p));p.checkIfCollaborationDraftSupported=e=>{if(s.isCollaborationDraftSupported(e)){p.isDraftCollaborative=true}};p.getEntityTypePath=e=>e[0].endsWith("/")?e[0]:e[0]+"/";p.getSearch=()=>{if(!p.hideBasicSearch){return De`<control:basicSearchField>
			<mdc:FilterField
				id="${Be([p.id,"BasicSearchField"])}"
				placeholder="{sap.fe.i18n>M_FILTERBAR_SEARCH}"
				conditions="{$filters>/conditions/$search}"
				dataType="sap.ui.model.odata.type.String"
				maxConditions="1"
			/>
		</control:basicSearchField>`}return De``};p.processSelectionFields=()=>{var e,t,r,i;let a=De``;if(p.showDraftEditState){a=`<core:Fragment fragmentName="sap.fe.macros.filter.DraftEditState" type="XML" />`}p._valueHelps=[];p._filterFields=[];(e=p._filterFields)===null||e===void 0?void 0:e.push(a);if(!Array.isArray(p.selectionFields)){p.selectionFields=p.selectionFields.getObject()}(t=p.selectionFields)===null||t===void 0?void 0:t.forEach((e,t)=>{if(e.availability==="Default"){p.setFilterFieldsAndValueHelps(e,t)}});p._filterFields=((r=p._filterFields)===null||r===void 0?void 0:r.length)>0?p._filterFields:"";p._valueHelps=((i=p._valueHelps)===null||i===void 0?void 0:i.length)>0?p._valueHelps:""};p.setFilterFieldsAndValueHelps=(e,t)=>{if(e.template===undefined&&e.type!=="Slot"){p.pushFilterFieldsAndValueHelps(e)}else if(Array.isArray(p._filterFields)){var r;(r=p._filterFields)===null||r===void 0?void 0:r.push(De`<template:with path="selectionFields>${t}" var="item">
					<core:Fragment fragmentName="sap.fe.macros.filter.CustomFilter" type="XML" />
				</template:with>`)}};p.pushFilterFieldsAndValueHelps=e=>{if(Array.isArray(p._filterFields)){var t;(t=p._filterFields)===null||t===void 0?void 0:t.push(De`<internalMacro:FilterField
			idPrefix="${Be([p.id,"FilterField",d.getNavigationPath(e.annotationPath)])}"
			vhIdPrefix="${Be([p.id,"FilterFieldValueHelp"])}"
			property="${e.annotationPath}"
			contextPath="${p._getContextPathForFilterField(e,p._internalContextPath)}"
			useSemanticDateRange="${p.useSemanticDateRange}"
			settings="${d.stringifyCustomData(e.settings)}"
			visualFilter="${e.visualFilter}"
			/>`)}if(Array.isArray(p._valueHelps)){var r;(r=p._valueHelps)===null||r===void 0?void 0:r.push(De`<macro:ValueHelp
			idPrefix="${Be([p.id,"FilterFieldValueHelp"])}"
			conditionModel="$filters"
			property="${e.annotationPath}"
			contextPath="${p._getContextPathForFilterField(e,p._internalContextPath)}"
			filterFieldValueHelp="true"
			useSemanticDateRange="${p.useSemanticDateRange}"
		/>`)}};const f=p.contextPath;const b=p.metaPath;if(!b){e.error("Context Path not available for FilterBar Macro.");return Ee(p)}const h=b===null||b===void 0?void 0:b.getPath();let g="";const m=(h===null||h===void 0?void 0:h.split("/@com.sap.vocabularies.UI.v1.SelectionFields"))||[];if(m.length>0){g=p.getEntityTypePath(m)}const y=s.getEntitySetPath(g);const v=f===null||f===void 0?void 0:f.getModel();p._internalContextPath=v===null||v===void 0?void 0:v.createBindingContext(g);const F="@com.sap.vocabularies.UI.v1.SelectionFields";const C="@com.sap.vocabularies.UI.v1.SelectionFields"+(m.length&&m[1]||"");const S={};S[F]={filterFields:p.filterFields};const w=$e(p._internalContextPath);const B=p.getConverterContext(w,undefined,a,S);if(!p.propertyInfo){p.propertyInfo=Ie(B,[],C).sPropertyInfo}if(!p.selectionFields){const e=Ie(B,[],C).selectionFields;p.selectionFields=new c(e,v).createBindingContext("/");const t=B.getEntityType(),r=_e(t,B),i=v.getContext(y),a=we(i,{selectionVariant:r});p.filterConditions=a}p._processPropertyInfos(p.propertyInfo);const P=$e(f).targetObject;if((l=P.annotations)!==null&&l!==void 0&&(n=l.Common)!==null&&n!==void 0&&n.DraftRoot||(o=P.annotations)!==null&&o!==void 0&&(u=o.Common)!==null&&u!==void 0&&u.DraftNode){p.showDraftEditState=true;p.checkIfCollaborationDraftSupported(v)}if(p._applyIdToContent){p._apiId=p.id+"::FilterBar";p._contentId=p.id}else{p._apiId=p.id;p._contentId=p.getContentId(p.id+"")}if(p.hideBasicSearch!==true){const e=Pe(y,v);p.hideBasicSearch=Boolean(e&&!e.Searchable)}p.processSelectionFields();return p}Se=r;var i=r.prototype;i._processPropertyInfos=function e(t){const r=[];if(t){const e=t.replace(/\\{/g,"{").replace(/\\}/g,"}");const i=JSON.parse(e);const a=this.getTranslatedText("FILTERBAR_EDITING_STATUS");i.forEach(function(e){if(e.isParameter){r.push(e.name)}if(e.path==="$editState"){e.label=a}});this.propertyInfo=JSON.stringify(i).replace(/\{/g,"\\{").replace(/\}/g,"\\}")}this._parameters=JSON.stringify(r)};i._getContextPathForFilterField=function e(t,r){let i=r;if(t.isParameter){const e=t.annotationPath;i=e.substring(0,e.lastIndexOf("/")+1)}return i};i.getTemplate=function e(){var t;const r=(t=this._internalContextPath)===null||t===void 0?void 0:t.getPath();let i="";if(this.filterBarDelegate){i=this.filterBarDelegate}else{i="{name:'sap/fe/macros/filterBar/FilterBarDelegate', payload: {entityTypePath: '"+r+"'}}"}return De`<macroFilterBar:FilterBarAPI
        xmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"
        xmlns:core="sap.ui.core"
        xmlns:mdc="sap.ui.mdc"
        xmlns:control="sap.fe.core.controls"
        xmlns:macroFilterBar="sap.fe.macros.filterBar"
        xmlns:macro="sap.fe.macros"
        xmlns:internalMacro="sap.fe.macros.internal"
        xmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
		id="${this._apiId}"
		search="${this.search}"
		filterChanged="${this.filterChanged}"
		afterClear="${this.afterClear}"
		internalSearch="${this.internalSearch}"
		internalFilterChanged="${this.internalFilterChanged}"
		stateChange="${this.stateChange}"
	>
		<control:FilterBar
			core:require="{API: 'sap/fe/macros/filterBar/FilterBarAPI'}"
			id="${this._contentId}"
			liveMode="${this.liveMode}"
			delegate="${i}"
			variantBackreference="${this.variantBackreference}"
			showAdaptFiltersButton="${this.showAdaptFiltersButton}"
			showClearButton="${this.showClearButton}"
			p13nMode="${this.p13nMode}"
			search="API.handleSearch($event)"
			filtersChanged="API.handleFilterChanged($event)"
			filterConditions="${this.filterConditions}"
			suspendSelection="${this.suspendSelection}"
			showMessages="${this.showMessages}"
			toggleControl="${this.toggleControlId}"
			initialLayout="${this.initialLayout}"
			propertyInfo="${this.propertyInfo}"
			customData:localId="${this.id}"
			visible="${this.visible}"
			customData:hideBasicSearch="${this.hideBasicSearch}"
			customData:showDraftEditState="${this.showDraftEditState}"
			customData:useSemanticDateRange="${this.useSemanticDateRange}"
			customData:entityType="${r}"
			customData:parameters="${this._parameters}"
		>
			<control:dependents>
				${this._valueHelps}
			</control:dependents>
			${this.getSearch()}
			<control:filterItems>
				${this._filterFields}
			</control:filterItems>
		</control:FilterBar>
	</macroFilterBar:FilterBarAPI>`};return r}(t),J=Re(U.prototype,"id",[b],{configurable:true,enumerable:true,writable:true,initializer:null}),X=Re(U.prototype,"visible",[h],{configurable:true,enumerable:true,writable:true,initializer:null}),G=Re(U.prototype,"selectionFields",[g],{configurable:true,enumerable:true,writable:true,initializer:null}),W=Re(U.prototype,"filterBarDelegate",[m],{configurable:true,enumerable:true,writable:true,initializer:null}),K=Re(U.prototype,"metaPath",[y],{configurable:true,enumerable:true,writable:true,initializer:null}),Q=Re(U.prototype,"contextPath",[v],{configurable:true,enumerable:true,writable:true,initializer:null}),Y=Re(U.prototype,"showMessages",[F],{configurable:true,enumerable:true,writable:true,initializer:function(){return false}}),Z=Re(U.prototype,"variantBackreference",[C],{configurable:true,enumerable:true,writable:true,initializer:null}),ee=Re(U.prototype,"hideBasicSearch",[S],{configurable:true,enumerable:true,writable:true,initializer:null}),te=Re(U.prototype,"enableFallback",[w],{configurable:true,enumerable:true,writable:true,initializer:function(){return false}}),re=Re(U.prototype,"showAdaptFiltersButton",[B],{configurable:true,enumerable:true,writable:true,initializer:function(){return true}}),ie=Re(U.prototype,"p13nMode",[P],{configurable:true,enumerable:true,writable:true,initializer:function(){return"Item,Value"}}),ae=Re(U.prototype,"propertyInfo",[$],{configurable:true,enumerable:true,writable:true,initializer:null}),le=Re(U.prototype,"useSemanticDateRange",[I],{configurable:true,enumerable:true,writable:true,initializer:function(){return true}}),ne=Re(U.prototype,"liveMode",[_],{configurable:true,enumerable:true,writable:true,initializer:function(){return false}}),oe=Re(U.prototype,"filterConditions",[D],{configurable:true,enumerable:true,writable:true,initializer:null}),se=Re(U.prototype,"suspendSelection",[z],{configurable:true,enumerable:true,writable:true,initializer:function(){return false}}),ue=Re(U.prototype,"showDraftEditState",[x],{configurable:true,enumerable:true,writable:true,initializer:function(){return false}}),ce=Re(U.prototype,"isDraftCollaborative",[A],{configurable:true,enumerable:true,writable:true,initializer:function(){return false}}),pe=Re(U.prototype,"toggleControlId",[M],{configurable:true,enumerable:true,writable:true,initializer:null}),de=Re(U.prototype,"initialLayout",[k],{configurable:true,enumerable:true,writable:true,initializer:function(){return"compact"}}),fe=Re(U.prototype,"showClearButton",[E],{configurable:true,enumerable:true,writable:true,initializer:function(){return false}}),be=Re(U.prototype,"_applyIdToContent",[H],{configurable:true,enumerable:true,writable:true,initializer:function(){return false}}),he=Re(U.prototype,"search",[T],{configurable:true,enumerable:true,writable:true,initializer:null}),ge=Re(U.prototype,"filterChanged",[R],{configurable:true,enumerable:true,writable:true,initializer:null}),me=Re(U.prototype,"stateChange",[O],{configurable:true,enumerable:true,writable:true,initializer:null}),ye=Re(U.prototype,"internalFilterChanged",[V],{configurable:true,enumerable:true,writable:true,initializer:null}),ve=Re(U.prototype,"internalSearch",[L],{configurable:true,enumerable:true,writable:true,initializer:null}),Fe=Re(U.prototype,"afterClear",[N],{configurable:true,enumerable:true,writable:true,initializer:null}),Ce=Re(U.prototype,"filterFields",[j],{configurable:true,enumerable:true,writable:true,initializer:null}),U))||q);Se=Le;return Se},false);