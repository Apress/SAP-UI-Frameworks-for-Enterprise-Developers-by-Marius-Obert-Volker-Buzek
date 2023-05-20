/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase","sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor","sap/fe/core/buildingBlocks/RuntimeBuildingBlockFragment","sap/fe/core/helpers/TypeGuards"],function(e,t,n,i){"use strict";var o={};var r=i.isContext;var s=n.storeRuntimeBlock;var u=t.xml;var c=t.registerBuildingBlock;function p(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;l(e,t)}function l(e,t){l=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,n){t.__proto__=n;return t};return l(e,t)}let f=function(e){p(t,e);function t(){return e.apply(this,arguments)||this}o=t;t.register=function e(){c(this);s(this)};var n=t.prototype;n.getTemplate=function e(t){const n=this.constructor.metadata;const i=`${n.namespace??n.publicNamespace}.${n.name}`;const o=[];const s=[];const c=[];const p=[];for(const e in n.properties){let t=this[e];if(t!==undefined&&t!==null){if(r(t)){t=t.getPath()}if(n.properties[e].type==="function"){s.push(t);p.push(t);c.push(e)}else{o.push(u`feBB:${e}="${t}"`)}}}if(s.length>0){o.push(u`functionHolder="${s.join(";")}"`);o.push(u`feBB:functionStringInOrder="${p.join(",")}"`);o.push(u`feBB:propertiesAssignedToFunction="${c.join(",")}"`)}const l=(t===null||t===void 0?void 0:t.getAttribute("core:require"))||undefined;if(l){o.push(u`core:require="${l}"`)}return u`<feBB:RuntimeBuildingBlockFragment
					xmlns:core="sap.ui.core"
					xmlns:feBB="sap.fe.core.buildingBlocks"
					fragmentName="${i}"

					id="{this>id}"
					type="FE_COMPONENTS"
					${o}
				>
				</feBB:RuntimeBuildingBlockFragment>`};return t}(e);f.isRuntime=true;o=f;return o},false);