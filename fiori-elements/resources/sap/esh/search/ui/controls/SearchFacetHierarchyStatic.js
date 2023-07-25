/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["sap/m/List","sap/m/GroupHeaderListItem","sap/m/CustomListItem","./SearchFacetHierarchyStaticTreeItem","sap/m/Label","sap/m/library","sap/ui/core/Icon","sap/m/FlexBox","../tree/TreeView","sap/m/FlexItemData"],function(e,t,r,n,o,a,c,i,u,f){function l(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}function s(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function p(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(e,n.key,n)}}function d(e,t,r){if(t)p(e.prototype,t);if(r)p(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}function y(e,t){if(typeof t!=="function"&&t!==null){throw new TypeError("Super expression must either be null or a function")}e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:true,configurable:true}});Object.defineProperty(e,"prototype",{writable:false});if(t)b(e,t)}function b(e,t){b=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,r){t.__proto__=r;return t};return b(e,t)}function h(e){var t=m();return function r(){var n=g(e),o;if(t){var a=g(this).constructor;o=Reflect.construct(n,arguments,a)}else{o=n.apply(this,arguments)}return v(this,o)}}function v(e,t){if(t&&(typeof t==="object"||typeof t==="function")){return t}else if(t!==void 0){throw new TypeError("Derived constructors may only return object or undefined")}return w(e)}function w(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function m(){if(typeof Reflect==="undefined"||!Reflect.construct)return false;if(Reflect.construct.sham)return false;if(typeof Proxy==="function")return true;try{Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}));return true}catch(e){return false}}function g(e){g=Object.setPrototypeOf?Object.getPrototypeOf.bind():function e(t){return t.__proto__||Object.getPrototypeOf(t)};return g(e)}function O(e,t,r){if(t in e){Object.defineProperty(e,t,{value:r,enumerable:true,configurable:true,writable:true})}else{e[t]=r}return e}var S=l(n);var j=a["ListSeparators"];var I=a["ListMode"];var F=l(u);var L=function(e){y(a,e);var n=h(a);function a(e,o){var c;s(this,a);c=n.call(this,e,o);c.setShowSeparators(j.None);c.setMode(I.SingleSelectMaster);c.addItem(new t("",{title:"{title}"}));var i=new F("",{treeNodeFactory:"{treeNodeFactory}",items:{path:"rootTreeNode/childTreeNodes",factory:c.createTreeItem.bind(w(c))}});c.addItem(new r({content:i}));return c}d(a,[{key:"createTreeItem",value:function e(t,r){var n=new o({text:"{label}",width:"100%"});n.setLayoutData(new f({growFactor:1}));n.addStyleClass("sapUshellSearchHierarchyFacetItemLabel");var a=r.getObject();n.attachBrowserEvent("click",function(){a.toggleFilter()});var u=new c("",{src:"{icon}"});u.addStyleClass("sapUshellSearchHierarchyFacetItemIcon");u.setLayoutData(new f({growFactor:0}));u.attachBrowserEvent("click",function(){a.toggleFilter()});var l=new i("",{items:[u,n],width:"100%"});var s=new S("",{content:l,selectLine:"{hasFilter}"});return s}},{key:"onAfterRendering",value:function e(){var t=this.getModel();if(t.config.searchInAreaOverwriteMode&&typeof t.config.setQuickSelectDataSourceAllAppearsNotSelected==="function"){t.config.setQuickSelectDataSourceAllAppearsNotSelected(t)}}}]);return a}(e);O(L,"renderer",{apiVersion:2});return L})})();