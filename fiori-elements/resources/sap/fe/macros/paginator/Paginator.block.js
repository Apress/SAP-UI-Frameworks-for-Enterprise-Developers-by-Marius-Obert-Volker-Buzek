/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase","sap/fe/core/buildingBlocks/BuildingBlockSupport","sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor","sap/fe/core/helpers/BindingToolkit","sap/fe/core/helpers/StableIdHelper"],function(e,i,r,t,n){"use strict";var a,o,l,u,c;var s={};var p=n.generate;var d=t.pathInModel;var f=t.or;var b=r.xml;var g=i.defineBuildingBlock;var v=i.blockAttribute;function O(e,i,r,t){if(!r)return;Object.defineProperty(e,i,{enumerable:r.enumerable,configurable:r.configurable,writable:r.writable,value:r.initializer?r.initializer.call(t):void 0})}function m(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function h(e,i){e.prototype=Object.create(i.prototype);e.prototype.constructor=e;B(e,i)}function B(e,i){B=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(i,r){i.__proto__=r;return i};return B(e,i)}function P(e,i,r,t,n){var a={};Object.keys(t).forEach(function(e){a[e]=t[e]});a.enumerable=!!a.enumerable;a.configurable=!!a.configurable;if("value"in a||a.initializer){a.writable=true}a=r.slice().reverse().reduce(function(r,t){return t(e,i,r)||r},a);if(n&&a.initializer!==void 0){a.value=a.initializer?a.initializer.call(n):void 0;a.initializer=undefined}if(a.initializer===void 0){Object.defineProperty(e,i,a);a=null}return a}function T(e,i){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let y=(a=g({name:"Paginator",namespace:"sap.fe.macros.internal",publicNamespace:"sap.fe.macros"}),o=v({type:"string",isPublic:true}),a(l=(u=function(e){h(i,e);function i(){var i;for(var r=arguments.length,t=new Array(r),n=0;n<r;n++){t[n]=arguments[n]}i=e.call(this,...t)||this;O(i,"id",c,m(i));return i}s=i;var r=i.prototype;r.getTemplate=function e(){const i=d("/navUpEnabled","paginator");const r=d("/navDownEnabled","paginator");const t=f(i,r);const n=d("T_PAGINATOR_CONTROL_PAGINATOR_TOOLTIP_UP","sap.fe.i18n");const a=d("T_PAGINATOR_CONTROL_PAGINATOR_TOOLTIP_DOWN","sap.fe.i18n");return b`
			<m:HBox displayInline="true" id="${this.id}" visible="${t}">
				<uxap:ObjectPageHeaderActionButton
					xmlns:uxap="sap.uxap"
					id="${p([this.id,"previousItem"])}"
					enabled="${i}"
					tooltip="${n}"
					icon="sap-icon://navigation-up-arrow"
					press=".paginator.updateCurrentContext(-1)"
					type="Transparent"
					importance="High"
				/>
				<uxap:ObjectPageHeaderActionButton
					xmlns:uxap="sap.uxap"
					id="${p([this.id,"nextItem"])}"
					enabled="${r}"
					tooltip="${a}"
					icon="sap-icon://navigation-down-arrow"
					press=".paginator.updateCurrentContext(1)"
					type="Transparent"
					importance="High"
				/>
			</m:HBox>`};return i}(e),c=P(u.prototype,"id",[o],{configurable:true,enumerable:true,writable:true,initializer:function(){return""}}),u))||l);s=y;return s},false);