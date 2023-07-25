/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/BaseController","sap/fe/core/controllerextensions/EditFlow","sap/fe/core/controllerextensions/IntentBasedNavigation","sap/fe/core/controllerextensions/InternalIntentBasedNavigation","sap/fe/core/controllerextensions/InternalRouting","sap/fe/core/controllerextensions/MassEdit","sap/fe/core/controllerextensions/MessageHandler","sap/fe/core/controllerextensions/PageReady","sap/fe/core/controllerextensions/Paginator","sap/fe/core/controllerextensions/Placeholder","sap/fe/core/controllerextensions/Routing","sap/fe/core/controllerextensions/Share","sap/fe/core/controllerextensions/SideEffects","sap/fe/core/controllerextensions/ViewState","sap/fe/core/ExtensionAPI","sap/fe/core/helpers/ClassSupport","sap/ui/core/Component","sap/ui/core/mvc/OverrideExecution"],function(e,t,r,n,i,o,a,l,s,u,p,c,f,g,b,d,y,h){"use strict";var w,m,v,P,x,z,E,I,O,A,_,R,C,j,B,M,V,S,H,N,D,F,k,T,U,$,q,G,J,K,L,Q,W,X;var Y=d.usingExtension;var Z=d.publicExtension;var ee=d.extensible;var te=d.defineUI5Class;function re(e,t,r,n){if(!r)return;Object.defineProperty(e,t,{enumerable:r.enumerable,configurable:r.configurable,writable:r.writable,value:r.initializer?r.initializer.call(n):void 0})}function ne(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function ie(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;oe(e,t)}function oe(e,t){oe=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,r){t.__proto__=r;return t};return oe(e,t)}function ae(e,t,r,n,i){var o={};Object.keys(n).forEach(function(e){o[e]=n[e]});o.enumerable=!!o.enumerable;o.configurable=!!o.configurable;if("value"in o||o.initializer){o.writable=true}o=r.slice().reverse().reduce(function(r,n){return n(e,t,r)||r},o);if(i&&o.initializer!==void 0){o.value=o.initializer?o.initializer.call(i):void 0;o.initializer=undefined}if(o.initializer===void 0){Object.defineProperty(e,t,o);o=null}return o}function le(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let se=(w=te("sap.fe.core.PageController"),m=Y(p),v=Y(i),P=Y(t),x=Y(r),z=Y(n),E=Y(l),I=Y(a),O=Y(c),A=Y(s),_=Y(g),R=Y(u),C=Y(f),j=Y(o),B=Z(),M=Z(),V=Z(),S=Z(),H=ee(h.After),w(N=(D=function(e){ie(t,e);function t(){var t;for(var r=arguments.length,n=new Array(r),i=0;i<r;i++){n[i]=arguments[i]}t=e.call(this,...n)||this;re(t,"routing",F,ne(t));re(t,"_routing",k,ne(t));re(t,"editFlow",T,ne(t));re(t,"intentBasedNavigation",U,ne(t));re(t,"_intentBasedNavigation",$,ne(t));re(t,"pageReady",q,ne(t));re(t,"messageHandler",G,ne(t));re(t,"share",J,ne(t));re(t,"paginator",K,ne(t));re(t,"viewState",L,ne(t));re(t,"placeholder",Q,ne(t));re(t,"_sideEffects",W,ne(t));re(t,"massEdit",X,ne(t));return t}var r=t.prototype;r.onInit=function e(){const t=this.getAppComponent().getModel("ui"),r=this.getAppComponent().getModel("internal"),n=`/pages/${this.getView().getId()}`;t.setProperty(n,{controls:{}});r.setProperty(n,{controls:{},collaboration:{}});this.getView().bindElement({path:n,model:"ui"});this.getView().bindElement({path:n,model:"internal"});this.getView().bindElement({path:n,model:"pageInternal"});this.getView().setModel(r,"pageInternal");this.getView().setModel(t,"ui");this.getView().setModel(r,"internal")};r.onBeforeRendering=function e(){if(this.placeholder.attachHideCallback){this.placeholder.attachHideCallback()}};r.getExtensionAPI=function e(){if(!this.extensionAPI){this.extensionAPI=new b(this)}return this.extensionAPI};r.onPageReady=function e(t){this.getAppComponent().getAppStateHandler().applyAppState()};r._getPageTitleInformation=function e(){return{}};r._getPageModel=function e(){const t=y.getOwnerComponentFor(this.getView());return t===null||t===void 0?void 0:t.getModel("_pageModel")};return t}(e),F=ae(D.prototype,"routing",[m],{configurable:true,enumerable:true,writable:true,initializer:null}),k=ae(D.prototype,"_routing",[v],{configurable:true,enumerable:true,writable:true,initializer:null}),T=ae(D.prototype,"editFlow",[P],{configurable:true,enumerable:true,writable:true,initializer:null}),U=ae(D.prototype,"intentBasedNavigation",[x],{configurable:true,enumerable:true,writable:true,initializer:null}),$=ae(D.prototype,"_intentBasedNavigation",[z],{configurable:true,enumerable:true,writable:true,initializer:null}),q=ae(D.prototype,"pageReady",[E],{configurable:true,enumerable:true,writable:true,initializer:null}),G=ae(D.prototype,"messageHandler",[I],{configurable:true,enumerable:true,writable:true,initializer:null}),J=ae(D.prototype,"share",[O],{configurable:true,enumerable:true,writable:true,initializer:null}),K=ae(D.prototype,"paginator",[A],{configurable:true,enumerable:true,writable:true,initializer:null}),L=ae(D.prototype,"viewState",[_],{configurable:true,enumerable:true,writable:true,initializer:null}),Q=ae(D.prototype,"placeholder",[R],{configurable:true,enumerable:true,writable:true,initializer:null}),W=ae(D.prototype,"_sideEffects",[C],{configurable:true,enumerable:true,writable:true,initializer:null}),X=ae(D.prototype,"massEdit",[j],{configurable:true,enumerable:true,writable:true,initializer:null}),ae(D.prototype,"onInit",[B],Object.getOwnPropertyDescriptor(D.prototype,"onInit"),D.prototype),ae(D.prototype,"onBeforeRendering",[M],Object.getOwnPropertyDescriptor(D.prototype,"onBeforeRendering"),D.prototype),ae(D.prototype,"getExtensionAPI",[V],Object.getOwnPropertyDescriptor(D.prototype,"getExtensionAPI"),D.prototype),ae(D.prototype,"onPageReady",[S,H],Object.getOwnPropertyDescriptor(D.prototype,"onPageReady"),D.prototype),D))||N);return se},false);