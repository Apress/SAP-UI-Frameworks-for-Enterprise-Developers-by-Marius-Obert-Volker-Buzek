/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase","sap/fe/core/buildingBlocks/BuildingBlockSupport","sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor","sap/fe/core/formatters/KPIFormatter","sap/fe/core/helpers/BindingToolkit"],function(e,t,i,r,n){"use strict";var a,o,l,s,u,p,c,d,f,g,b;var m={};var h=n.resolveBindingString;var y=n.pathInModel;var v=n.formatResult;var P=i.xml;var B=t.defineBuildingBlock;var x=t.blockAttribute;function k(e,t,i,r){if(!i)return;Object.defineProperty(e,t,{enumerable:i.enumerable,configurable:i.configurable,writable:i.writable,value:i.initializer?i.initializer.call(r):void 0})}function z(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function E(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;w(e,t)}function w(e,t){w=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,i){t.__proto__=i;return t};return w(e,t)}function $(e,t,i,r,n){var a={};Object.keys(r).forEach(function(e){a[e]=r[e]});a.enumerable=!!a.enumerable;a.configurable=!!a.configurable;if("value"in a||a.initializer){a.writable=true}a=i.slice().reverse().reduce(function(i,r){return r(e,t,i)||i},a);if(n&&a.initializer!==void 0){a.value=a.initializer?a.initializer.call(n):void 0;a.initializer=undefined}if(a.initializer===void 0){Object.defineProperty(e,t,a);a=null}return a}function K(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let O=(a=B({name:"KPITag",namespace:"sap.fe.macros"}),o=x({type:"string",required:true}),l=x({type:"sap.ui.model.Context",required:true}),s=x({type:"string",required:true}),u=x({type:"boolean",required:false}),a(p=(c=function(e){E(t,e);function t(){var t;for(var i=arguments.length,r=new Array(i),n=0;n<i;n++){r[n]=arguments[n]}t=e.call(this,...r)||this;k(t,"id",d,z(t));k(t,"metaPath",f,z(t));k(t,"kpiModelName",g,z(t));k(t,"hasUnit",b,z(t));return t}m=t;var i=t.prototype;i.getKpiPropertyExpression=function e(t){return y(`/${this.id}/manifest/sap.card/data/json/${t}`,this.kpiModelName)};i.getBindingExpressions=function e(){const t=this.metaPath.getProperty("Title");if(!t){return{text:undefined,tooltip:undefined}}const i=h(t);return{text:v([i],r.labelFormat),tooltip:v([i,this.getKpiPropertyExpression("mainValueUnscaled"),this.getKpiPropertyExpression("mainUnit"),this.getKpiPropertyExpression("mainCriticality"),String(this.hasUnit)],r.tooltipFormat)}};i.getTemplate=function e(){const{text:t,tooltip:i}=this.getBindingExpressions();return P`<m:GenericTag
			id="kpiTag-${this.id}"
			text="${t}"
			design="StatusIconHidden"
			status="${this.getKpiPropertyExpression("mainCriticality")}"
			class="sapUiTinyMarginBegin"
			tooltip="${i}"
			press=".kpiManagement.onKPIPressed(\${$source>},'${this.id}')"
		>
			<m:ObjectNumber
				state="${this.getKpiPropertyExpression("mainCriticality")}"
				emphasized="false"
				number="${this.getKpiPropertyExpression("mainValue")}"
				unit="${this.getKpiPropertyExpression("mainUnit")}"

			/>
		</m:GenericTag>`};return t}(e),d=$(c.prototype,"id",[o],{configurable:true,enumerable:true,writable:true,initializer:null}),f=$(c.prototype,"metaPath",[l],{configurable:true,enumerable:true,writable:true,initializer:null}),g=$(c.prototype,"kpiModelName",[s],{configurable:true,enumerable:true,writable:true,initializer:null}),b=$(c.prototype,"hasUnit",[u],{configurable:true,enumerable:true,writable:true,initializer:null}),c))||p);m=O;return m},false);