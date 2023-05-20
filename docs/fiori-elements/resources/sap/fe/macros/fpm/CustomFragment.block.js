/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase","sap/fe/core/buildingBlocks/BuildingBlockSupport","sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor"],function(e,r,t){"use strict";var i,n,a,o,l,u,c,s,f;var p={};var m=t.xml;var b=r.defineBuildingBlock;var d=r.blockAttribute;function g(e,r,t,i){if(!t)return;Object.defineProperty(e,r,{enumerable:t.enumerable,configurable:t.configurable,writable:t.writable,value:t.initializer?t.initializer.call(i):void 0})}function y(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function h(e,r){e.prototype=Object.create(r.prototype);e.prototype.constructor=e;v(e,r)}function v(e,r){v=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(r,t){r.__proto__=t;return r};return v(e,r)}function B(e,r,t,i,n){var a={};Object.keys(i).forEach(function(e){a[e]=i[e]});a.enumerable=!!a.enumerable;a.configurable=!!a.configurable;if("value"in a||a.initializer){a.writable=true}a=t.slice().reverse().reduce(function(t,i){return i(e,r,t)||t},a);if(n&&a.initializer!==void 0){a.value=a.initializer?a.initializer.call(n):void 0;a.initializer=undefined}if(a.initializer===void 0){Object.defineProperty(e,r,a);a=null}return a}function w(e,r){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let z=(i=b({name:"CustomFragment",namespace:"sap.fe.macros.fpm"}),n=d({type:"string",required:true}),a=d({type:"sap.ui.model.Context",required:false}),o=d({type:"string",required:true}),i(l=(u=function(e){h(r,e);function r(){var r;for(var t=arguments.length,i=new Array(t),n=0;n<t;n++){i[n]=arguments[n]}r=e.call(this,...i)||this;g(r,"id",c,y(r));g(r,"contextPath",s,y(r));g(r,"fragmentName",f,y(r));return r}p=r;var t=r.prototype;t.getTemplate=function e(){const r=this.fragmentName+"-JS".replace(/\//g,".");return m`<core:Fragment
			xmlns:compo="http://schemas.sap.com/sapui5/extension/sap.ui.core.xmlcomposite/1"
			fragmentName="${r}"
			id="${this.id}"
			type="CUSTOM"
		>
			<compo:fragmentContent>
				<core:FragmentDefinition>
					<core:Fragment fragmentName="${this.fragmentName}" type="XML" />
				</core:FragmentDefinition>
			</compo:fragmentContent>
		</core:Fragment>`};return r}(e),c=B(u.prototype,"id",[n],{configurable:true,enumerable:true,writable:true,initializer:null}),s=B(u.prototype,"contextPath",[a],{configurable:true,enumerable:true,writable:true,initializer:null}),f=B(u.prototype,"fragmentName",[o],{configurable:true,enumerable:true,writable:true,initializer:null}),u))||l);p=z;return p},false);