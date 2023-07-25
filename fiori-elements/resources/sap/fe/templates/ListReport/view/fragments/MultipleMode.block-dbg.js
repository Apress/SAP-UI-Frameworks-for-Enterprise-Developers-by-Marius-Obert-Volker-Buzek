/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase","sap/fe/core/buildingBlocks/BuildingBlockSupport","sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor"],function(t,e,n){"use strict";var r,i,o,l,a;var s={};var c=n.xml;var p=e.defineBuildingBlock;var u=e.blockAttribute;function f(t,e,n,r){if(!n)return;Object.defineProperty(t,e,{enumerable:n.enumerable,configurable:n.configurable,writable:n.writable,value:n.initializer?n.initializer.call(r):void 0})}function d(t){if(t===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return t}function v(t,e){t.prototype=Object.create(e.prototype);t.prototype.constructor=t;m(t,e)}function m(t,e){m=Object.setPrototypeOf?Object.setPrototypeOf.bind():function t(e,n){e.__proto__=n;return e};return m(t,e)}function b(t,e,n,r,i){var o={};Object.keys(r).forEach(function(t){o[t]=r[t]});o.enumerable=!!o.enumerable;o.configurable=!!o.configurable;if("value"in o||o.initializer){o.writable=true}o=n.slice().reverse().reduce(function(n,r){return r(t,e,n)||n},o);if(i&&o.initializer!==void 0){o.value=o.initializer?o.initializer.call(i):void 0;o.initializer=undefined}if(o.initializer===void 0){Object.defineProperty(t,e,o);o=null}return o}function h(t,e){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let C=(r=p({name:"MultipleMode",namespace:"sap.fe.templates.ListReport.view.fragments",isOpen:true}),i=u({type:"object"}),r(o=(l=function(t){v(e,t);function e(){var e;for(var n=arguments.length,r=new Array(n),i=0;i<n;i++){r[i]=arguments[i]}e=t.call(this,...r)||this;f(e,"converterContext",a,d(e));return e}s=e;var n=e.prototype;n.getInnerControlsAPI=function t(){var e;return((e=this.converterContext)===null||e===void 0?void 0:e.views.reduce((t,e)=>{const n=e.tableControlId||e.chartControlId;if(n){t.push(`${n}::${e.tableControlId?"Table":"Chart"}`)}return t},[]).join(","))||""};n.getTemplate=function t(){var e,n,r;return c`
			<fe:MultipleModeControl
				xmlns="sap.m"
				xmlns:fe="sap.fe.templates.ListReport.controls"
				xmlns:core="sap.ui.core"
				xmlns:macro="sap.fe.macros"
				innerControls="${this.getInnerControlsAPI()}"
				filterControl="${this.converterContext.filterBarId}"
				showCounts="${(e=this.converterContext.multiViewsControl)===null||e===void 0?void 0:e.showTabCounts}"
				freezeContent="${!!this.converterContext.filterBarId}"
				id="${(n=this.converterContext.multiViewsControl)===null||n===void 0?void 0:n.id}::Control"
			>
				<IconTabBar
				core:require="{
					MULTICONTROL: 'sap/fe/templates/ListReport/controls/MultipleModeControl'
				}"
					expandable="false"
					headerMode="Inline"
					id="${(r=this.converterContext.multiViewsControl)===null||r===void 0?void 0:r.id}"
					stretchContentHeight="true"
					select="MULTICONTROL.handleTabChange($event)"
				>
					<items>
					${this.converterContext.views.map((t,e)=>`<template:with path="converterContext>views/${e}/" var="view"\n\t\t\t\t\t\t\t\t\t\ttemplate:require="{\n\t\t\t\t\t\t\t\t\t\t\tID: 'sap/fe/core/helpers/StableIdHelper'\n\t\t\t\t\t\t\t\t\t\t}"\n\t\t\t\t\t\t\t\t\t\txmlns:core="sap.ui.core"\n\t\t\t\t\t\t\t\t\t\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1">\n\t\t\t\t\t\t\t\t<template:with path="view>presentation" var="presentationContext">\n\t\t\t\t\t\t\t\t<IconTabFilter\n\t\t\t\t\t\t\t\t\ttext="${t.title}"\n\t\t\t\t\t\t\t\t\tkey="{= ID.generate([\${view>tableControlId} || \${view>customTabId} || \${view>chartControlId}])}"\n\t\t\t\t\t\t\t\t\tvisible="{view>visible}"\n\t\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\t\t<content>\n\t\t\t\t\t\t\t\t\t\t<template:if test="{= \${view>type} === 'Custom'}">\n\t\t\t\t\t\t\t\t\t\t\t<template:then>\n\t\t\t\t\t\t\t\t\t\t\t\t<core:Fragment fragmentName="sap.fe.templates.ListReport.view.fragments.CustomView" type="XML" />\n\t\t\t\t\t\t\t\t\t\t\t</template:then>\n\t\t\t\t\t\t\t\t\t\t\t<template:else>\n\t\t\t\t\t\t\t\t\t\t\t\t<MessageStrip\n\t\t\t\t\t\t\t\t\t\t\t\t\ttext="{= '{= (\${tabsInternal>/' + (\${view>tableControlId} || \${view>chartControlId}) + '/notApplicable/title} ) }' }"\n\t\t\t\t\t\t\t\t\t\t\t\t\ttype="Information"\n\t\t\t\t\t\t\t\t\t\t\t\t\tshowIcon="true"\n\t\t\t\t\t\t\t\t\t\t\t\t\tshowCloseButton="true"\n\t\t\t\t\t\t\t\t\t\t\t\t\tclass="sapUiTinyMargin"\n\t\t\t\t\t\t\t\t\t\t\t\t\tvisible="{= '{= (\${tabsInternal>/' + (\${view>tableControlId} || \${view>chartControlId}) + '/notApplicable/fields} || []).length>0 }' }"\n\t\t\t\t\t\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\t\t\t\t\t</MessageStrip>\n\t\t\t\t\t\t\t\t\t\t\t\t<core:Fragment fragmentName="sap.fe.templates.ListReport.view.fragments.CollectionVisualization" type="XML" />\n\t\t\t\t\t\t\t\t\t\t\t</template:else>\n\t\t\t\t\t\t\t\t\t\t</template:if>\n\t\t\t\t\t\t\t\t\t</content>\n\t\t\t\t\t\t\t\t</IconTabFilter>\n\t\t\t\t\t\t\t</template:with></template:with>`).join("")}
					</items>
				</IconTabBar>
			</fe:MultipleModeControl>`};return e}(t),a=b(l.prototype,"converterContext",[i],{configurable:true,enumerable:true,writable:true,initializer:null}),l))||o);s=C;return s},false);