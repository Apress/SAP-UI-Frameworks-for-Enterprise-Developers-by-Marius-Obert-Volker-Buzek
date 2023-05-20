/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/fe/core/CommonUtils","sap/fe/core/controllerextensions/editFlow/NotApplicableContextDialog","sap/fe/core/controllerextensions/routing/NavigationReason","sap/fe/core/converters/ManifestSettings","sap/fe/core/converters/MetaModelConverter","sap/fe/core/helpers/ClassSupport","sap/fe/core/helpers/PasteHelper","sap/fe/core/helpers/ResourceModelHelper","sap/fe/macros/filter/FilterUtils","sap/fe/macros/table/Utils","sap/m/MessageBox","sap/ui/core/Core","sap/ui/core/message/Message","../MacroAPI"],function(e,t,n,i,r,o,a,l,s,u,c,p,d,g,f){"use strict";var b,y,h,m,v,w,P,C,E,T,R,x,D,M,z,I,A,B,S,O,F,V,_,j,N,L,$,U,k,q,H,W,G,Q,K,J,X,Y,Z,ee,te,ne,ie,re,oe,ae,le,se,ue,ce,pe,de,ge,fe,be,ye,he,me,ve,we,Pe,Ce,Ee,Te,Re,xe,De,Me,ze,Ie,Ae,Be,Se,Oe;var Fe=s.getResourceModel;var Ve=s.getLocalizedText;var _e=a.xmlEventHandler;var je=a.property;var Ne=a.event;var Le=a.defineUI5Class;var $e=a.aggregation;var Ue=o.convertTypes;var ke=r.CreationMode;function qe(e,t,n,i){if(!n)return;Object.defineProperty(e,t,{enumerable:n.enumerable,configurable:n.configurable,writable:n.writable,value:n.initializer?n.initializer.call(i):void 0})}function He(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function We(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;Ge(e,t)}function Ge(e,t){Ge=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,n){t.__proto__=n;return t};return Ge(e,t)}function Qe(e,t,n,i,r){var o={};Object.keys(i).forEach(function(e){o[e]=i[e]});o.enumerable=!!o.enumerable;o.configurable=!!o.configurable;if("value"in o||o.initializer){o.writable=true}o=n.slice().reverse().reduce(function(n,i){return i(e,t,n)||n},o);if(r&&o.initializer!==void 0){o.value=o.initializer?o.initializer.call(r):void 0;o.initializer=undefined}if(o.initializer===void 0){Object.defineProperty(e,t,o);o=null}return o}function Ke(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let Je=(b=Le("sap.fe.macros.table.TableAPI"),y=je({type:"string",expectedTypes:["EntitySet","EntityType","Singleton","NavigationProperty"],expectedAnnotations:["com.sap.vocabularies.UI.v1.LineItem","com.sap.vocabularies.UI.v1.PresentationVariant","com.sap.vocabularies.UI.v1.SelectionPresentationVariant"]}),h=je({type:"object"}),m=je({type:"string"}),v=je({type:"boolean"}),w=je({type:"string"}),P=je({type:"boolean",defaultValue:false}),C=je({type:"string",defaultValue:"ResponsiveTable",allowedValues:["GridTable","ResponsiveTable"]}),E=je({type:"boolean",defaultValue:true}),T=je({type:"boolean",defaultValue:false}),R=je({type:"boolean",defaultValue:false}),x=je({type:"string"}),D=je({type:"string",allowedValues:["None","Single","Multi","Auto"]}),M=je({type:"string"}),z=je({type:"boolean",defaultValue:true}),I=je({type:"boolean",defaultValue:false}),A=je({type:"boolean",defaultValue:true}),B=$e({type:"sap.fe.macros.table.Action"}),S=$e({type:"sap.fe.macros.table.Column"}),O=je({type:"boolean",defaultValue:false}),F=je({type:"boolean",defaultValue:false}),V=je({type:"boolean",defaultValue:false}),_=je({type:"boolean",defaultValue:false}),j=je({type:"boolean",defaultValue:false}),N=Ne(),L=Ne(),$=Ne(),U=je({type:"boolean | string",defaultValue:true}),k=je({type:"string",allowedValues:["Control"]}),q=je({type:"string"}),H=je({type:"boolean",defaultValue:true}),W=Ne(),G=_e(),Q=_e(),K=_e(),J=_e(),X=_e(),Y=_e(),Z=_e(),ee=_e(),te=_e(),b(ne=(ie=function(r){We(o,r);function o(e){var t;for(var n=arguments.length,i=new Array(n>1?n-1:0),o=1;o<n;o++){i[o-1]=arguments[o]}t=r.call(this,e,...i)||this;qe(t,"metaPath",re,He(t));qe(t,"tableDefinition",oe,He(t));qe(t,"entityTypeFullyQualifiedName",ae,He(t));qe(t,"readOnly",le,He(t));qe(t,"id",se,He(t));qe(t,"busy",ue,He(t));qe(t,"type",ce,He(t));qe(t,"enableExport",pe,He(t));qe(t,"enablePaste",de,He(t));qe(t,"enableFullScreen",ge,He(t));qe(t,"filterBar",fe,He(t));qe(t,"selectionMode",be,He(t));qe(t,"header",ye,He(t));qe(t,"enableAutoColumnWidth",he,He(t));qe(t,"isOptimizedForSmallDevice",me,He(t));qe(t,"headerVisible",ve,He(t));qe(t,"actions",we,He(t));qe(t,"columns",Pe,He(t));qe(t,"dataInitialized",Ce,He(t));qe(t,"bindingSuspended",Ee,He(t));qe(t,"outDatedBinding",Te,He(t));qe(t,"pendingRequest",Re,He(t));qe(t,"emptyRowsEnabled",xe,He(t));qe(t,"rowPress",De,He(t));qe(t,"stateChange",Me,He(t));qe(t,"internalDataRequested",ze,He(t));qe(t,"personalization",Ie,He(t));qe(t,"variantManagement",Ae,He(t));qe(t,"menu",Be,He(t));qe(t,"isSearchable",Se,He(t));qe(t,"selectionChange",Oe,He(t));t.updateFilterBar();if(t.content){t.content.attachEvent("selectionChange",{},t.onTableSelectionChange,He(t))}return t}var a=o.prototype;a.getSelectedContexts=function e(){return this.content.getSelectedContexts()};a.addMessage=function e(t){const n=this._getMessageManager();const i=this.content;const r=new g({target:i.getRowBinding().getResolvedPath(),type:t.type,message:t.message,processor:i.getModel(),description:t.description,persistent:t.persistent});n.addMessages(r);return r.getId()};a.removeMessage=function e(t){const n=this._getMessageManager();const i=n.getMessageModel().getData();const r=i.find(e=>e.id===t);if(r){n.removeMessages(r)}};a._getMessageManager=function e(){return sap.ui.getCore().getMessageManager()};a._getRowBinding=function e(){const t=this.getContent();return t.getRowBinding()};a.getCounts=function e(){const t=this.getContent();return c.getListBindingForCount(t,t.getBindingContext(),{batchGroupId:!this.getProperty("bindingSuspended")?t.data("batchGroupId"):"$auto",additionalFilters:c.getHiddenFilters(t)}).then(e=>c.getCountFormatted(e)).catch(()=>"0")};a.onTableRowPress=function e(t,n,r,o){if(r&&r.isInactive()&&r.isTransient()){return false}if(this.getTableDefinition().enableAnalytics&&r&&r.isA("sap.ui.model.odata.v4.Context")&&typeof r.getProperty("@$ui5.node.isExpanded")==="boolean"){return false}else{const e=Object.assign({},o,{reason:i.RowPress});n._routing.navigateForwardToContext(r,e)}};a.onInternalDataReceived=function e(t){if(t.getParameter("error")){this.getController().messageHandler.showMessageDialog()}};a.onInternalDataRequested=function e(t){this.setProperty("dataInitialized",true);this.fireEvent("internalDataRequested",t.getParameters())};a.onPaste=function e(t,n){if(!this.tableDefinition.control.enablePaste||!this.getModel("ui").getProperty("/isEditable")){return}const i=t.getParameter("data"),r=t.getSource();if(r.getEnablePaste()===true){l.pasteData(i,r,n)}else{const e=sap.ui.getCore().getLibraryResourceBundle("sap.fe.core");p.error(e.getText("T_OP_CONTROLLER_SAPFE_PASTE_DISABLED_MESSAGE"),{title:e.getText("C_COMMON_SAPFE_ERROR")})}};a.onBeforeExport=function e(t){const n=t.getParameter("userExportSettings").splitCells,i=t.getSource(),r=t.getParameter("exportSettings"),a=this.getTableDefinition();o.updateExportSettings(r,a,i,n)};o.dataStateIndicatorFilter=function e(t,n){var i;const r=(i=n.getBindingContext())===null||i===void 0?void 0:i.getPath();const o=(r?`${r}/`:"")+n.getRowBinding().getPath();return o===t.getTarget()?true:false};a.onDataStateChange=function e(t){const n=t.getSource();const i=t.getParameter("filteredMessages");if(i){const e=n.getModel("internal");e.setProperty("filteredMessages",i,n.getBindingContext("internal"))}};o.updateExportSettings=function e(t,n,i,r){const o=n.columns;if(!n.enableAnalytics&&(n.control.type==="ResponsiveTable"||n.control.type==="GridTable")){t.dataSource.sizeLimit=1e3}const a=t.workbook.columns;for(let e=a.length-1;e>=0;e--){const t=a[e];const n=d.getLibraryResourceBundle("sap.fe.macros");t.label=Ve(t.label,i);if(t.type==="Boolean"){t.falseValue=n.getText("no");t.trueValue=n.getText("yes")}const l=o===null||o===void 0?void 0:o.find(e=>{if(r){return this.columnWithTargetValueToBeAdded(e,t)}else{return false}});if(l){const i={label:n.getText("TargetValue"),property:Array.isArray(t.property)?t.property:[t.property],template:l.exportDataPointTargetValue};a.splice(e+1,0,i)}}return t};o.columnWithTargetValueToBeAdded=function e(t,n){var i;let r=false;if(t.exportDataPointTargetValue&&((i=t.propertyInfos)===null||i===void 0?void 0:i.length)===1){if(t.relativePath===n.property||n.property[0]===t.propertyInfos[0]||n.property.includes(t.relativePath)||n.property.includes(t.name)){delete n.template;r=true}}return r};a.resumeBinding=function e(t){this.setProperty("bindingSuspended",false);if(t&&!this.getDataInitialized()||this.getProperty("outDatedBinding")){var n;this.setProperty("outDatedBinding",false);(n=this.getContent())===null||n===void 0?void 0:n.rebind()}};a.refreshNotApplicableFields=function e(t){const n=this.getContent();return u.getNotApplicableFilters(t,n)};a.suspendBinding=function e(){this.setProperty("bindingSuspended",true)};a.invalidateContent=function e(){this.setProperty("dataInitialized",false);this.setProperty("outDatedBinding",false)};a.onMassEditButtonPressed=function t(n,i){const r=this.content;if(i&&i.massEdit){i.massEdit.openMassEditDialog(r)}else{e.warning("The Controller is not enhanced with Mass Edit functionality")}};a.onTableSelectionChange=function e(t){this.fireEvent("selectionChange",t.getParameters())};a.onActionPress=async function t(i,r,o,a){a.model=i.getSource().getModel();let l=true;if(a.notApplicableContexts&&a.notApplicableContexts.length>0){const e=Ue(a.model.getMetaModel());const t=e.resolvePath(this.entityTypeFullyQualifiedName,true).target;const i=new n({entityType:t,notApplicableContexts:a.notApplicableContexts,title:a.label,resourceModel:Fe(this)});a.contexts=a.applicableContexts;l=await i.open(this)}if(l){try{return await r.editFlow.invokeAction(o,a)}catch(t){e.info(t)}}};a.getTableDefinition=function e(){return this.tableDefinition};a.updateFilterBar=function e(){const t=this.getContent();const n=this.getFilterBar();if(t&&n&&t.getFilter()!==n){this._setFilterBar(n)}};a._setFilterBar=function e(n){var i;const r=this.getContent();const o=this===null||this===void 0?void 0:this.getId();const a=this.data("tableAPILocalId");const l=a&&n&&o&&o.replace(new RegExp(a+"$"),n);const s=((i=t.getTargetView(this))===null||i===void 0?void 0:i.byId(n))||d.byId(n)||d.byId(l);if(s){if(s.isA("sap.fe.macros.filterBar.FilterBarAPI")){r.setFilter(`${s.getId()}-content`)}else if(s.isA("sap.ui.mdc.FilterBar")){r.setFilter(s.getId())}}};a.checkIfColumnExists=function e(t,n){return t.some(function(e){if((e===null||e===void 0?void 0:e.columnName)===n&&e!==null&&e!==void 0&&e.sColumnNameVisible||(e===null||e===void 0?void 0:e.sTextArrangement)!==undefined&&(e===null||e===void 0?void 0:e.sTextArrangement)===n){return n}})};a.getIdentifierColumn=function e(){const t=this.getContent();const n=this.getTableDefinition().headerInfoTitle;const i=t&&t.getModel().getMetaModel(),r=t.data("metaPath");const o=i.getObject(`${r}/$Type/$Key`);const a=[];if(o&&o.length>0){o.forEach(function(e){if(e!=="IsActiveEntity"){a.push(e)}})}const l=this.getTableDefinition().semanticKeys;const s=[];const u=[];const c=t.getColumns();c.forEach(function(e){const t=e===null||e===void 0?void 0:e.getDataProperty();s.push(t)});s.forEach(function(e){var t,n;const o=i.getObject(`${r}/$Type/${e}@`);const a=o&&((t=o["@com.sap.vocabularies.Common.v1.Text"])===null||t===void 0?void 0:t.$Path);const l=o&&((n=o["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"])===null||n===void 0?void 0:n.$EnumMember);u.push({columnName:e,sTextArrangement:a,sColumnNameVisible:!(l==="com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly")})});let p;if(n!==undefined&&this.checkIfColumnExists(u,n)){p=n}else if(l!==undefined&&l.length===1&&this.checkIfColumnExists(u,l[0])){p=l[0]}else if(a!==undefined&&a.length===1&&this.checkIfColumnExists(u,a[0])){p=a[0]}return p};a.setEmptyRowsEnabled=function e(t){this.setProperty("emptyRowsEnabled",t);if(t){this.setUpEmptyRows(this.content)}else{this.deleteEmptyRows(this.content)}};a.setUpEmptyRows=async function e(t){var n,i,r;let o=arguments.length>1&&arguments[1]!==undefined?arguments[1]:false;if(((n=this.tableDefinition.control)===null||n===void 0?void 0:n.creationMode)!==ke.InlineCreationRows){return}if((i=this.tableDefinition.control)!==null&&i!==void 0&&i.inlineCreationRowsHiddenInEditMode&&!((r=t.getBindingContext("ui"))!==null&&r!==void 0&&r.getProperty("createMode"))&&!o){return}if(!this.emptyRowsEnabled){return}const a=new Promise(e=>{if(t.getDomRef()){e()}else{const n={onAfterRendering:function(){t.removeEventDelegate(n);e()}};t.addEventDelegate(n,this)}});await a;const l=t.getModel("ui");if(l.getProperty("/isEditablePending")){const e=l.bindProperty("/isEditablePending");await new Promise(t=>{const n=()=>{e.detachChange(n);e.destroy();t()};e.attachChange(n)})}const s=l.getProperty("/isEditable");if(!s){return}const u=t.getRowBinding();if(u.isResolved()&&u.isLengthFinal()){const e=u.getContext().getPath();const n=u.getAllCurrentContexts().find(function(t){return t.isInactive()&&t.getPath().startsWith(e)});if(!n){await this._createEmptyRow(u,t)}}};a.deleteEmptyRows=function e(t){const n=t.getRowBinding();if(n!==null&&n!==void 0&&n.isResolved()&&n!==null&&n!==void 0&&n.isLengthFinal()){const e=n.getContext().getPath();for(const t of n.getAllCurrentContexts()){if(t.isInactive()&&t.getPath().startsWith(e)){t.delete()}}}};a._createEmptyRow=async function n(i,r){var o;const a=((o=this.tableDefinition.control)===null||o===void 0?void 0:o.inlineCreationRowCount)||2;const l=[];for(let e=0;e<a;e+=1){l.push({})}const s=r.data("tableType")!=="ResponsiveTable";const u=true;const c=t.getTargetView(r);const p=c.getController();const d=p.editFlow;if(!this.creatingEmptyRows){this.creatingEmptyRows=true;try{const e=await d.createMultipleDocuments(i,l,s,false,p.editFlow.onBeforeCreate,u);e===null||e===void 0?void 0:e.forEach(function(e){e.created().catch(function(e){if(!e.canceled){throw e}})})}catch(t){e.error(t)}finally{this.creatingEmptyRows=false}}};return o}(f),re=Qe(ie.prototype,"metaPath",[y],{configurable:true,enumerable:true,writable:true,initializer:null}),oe=Qe(ie.prototype,"tableDefinition",[h],{configurable:true,enumerable:true,writable:true,initializer:null}),ae=Qe(ie.prototype,"entityTypeFullyQualifiedName",[m],{configurable:true,enumerable:true,writable:true,initializer:null}),le=Qe(ie.prototype,"readOnly",[v],{configurable:true,enumerable:true,writable:true,initializer:null}),se=Qe(ie.prototype,"id",[w],{configurable:true,enumerable:true,writable:true,initializer:null}),ue=Qe(ie.prototype,"busy",[P],{configurable:true,enumerable:true,writable:true,initializer:null}),ce=Qe(ie.prototype,"type",[C],{configurable:true,enumerable:true,writable:true,initializer:null}),pe=Qe(ie.prototype,"enableExport",[E],{configurable:true,enumerable:true,writable:true,initializer:null}),de=Qe(ie.prototype,"enablePaste",[T],{configurable:true,enumerable:true,writable:true,initializer:null}),ge=Qe(ie.prototype,"enableFullScreen",[R],{configurable:true,enumerable:true,writable:true,initializer:null}),fe=Qe(ie.prototype,"filterBar",[x],{configurable:true,enumerable:true,writable:true,initializer:null}),be=Qe(ie.prototype,"selectionMode",[D],{configurable:true,enumerable:true,writable:true,initializer:null}),ye=Qe(ie.prototype,"header",[M],{configurable:true,enumerable:true,writable:true,initializer:null}),he=Qe(ie.prototype,"enableAutoColumnWidth",[z],{configurable:true,enumerable:true,writable:true,initializer:null}),me=Qe(ie.prototype,"isOptimizedForSmallDevice",[I],{configurable:true,enumerable:true,writable:true,initializer:null}),ve=Qe(ie.prototype,"headerVisible",[A],{configurable:true,enumerable:true,writable:true,initializer:null}),we=Qe(ie.prototype,"actions",[B],{configurable:true,enumerable:true,writable:true,initializer:null}),Pe=Qe(ie.prototype,"columns",[S],{configurable:true,enumerable:true,writable:true,initializer:null}),Ce=Qe(ie.prototype,"dataInitialized",[O],{configurable:true,enumerable:true,writable:true,initializer:null}),Ee=Qe(ie.prototype,"bindingSuspended",[F],{configurable:true,enumerable:true,writable:true,initializer:null}),Te=Qe(ie.prototype,"outDatedBinding",[V],{configurable:true,enumerable:true,writable:true,initializer:null}),Re=Qe(ie.prototype,"pendingRequest",[_],{configurable:true,enumerable:true,writable:true,initializer:null}),xe=Qe(ie.prototype,"emptyRowsEnabled",[j],{configurable:true,enumerable:true,writable:true,initializer:null}),De=Qe(ie.prototype,"rowPress",[N],{configurable:true,enumerable:true,writable:true,initializer:null}),Me=Qe(ie.prototype,"stateChange",[L],{configurable:true,enumerable:true,writable:true,initializer:null}),ze=Qe(ie.prototype,"internalDataRequested",[$],{configurable:true,enumerable:true,writable:true,initializer:null}),Ie=Qe(ie.prototype,"personalization",[U],{configurable:true,enumerable:true,writable:true,initializer:null}),Ae=Qe(ie.prototype,"variantManagement",[k],{configurable:true,enumerable:true,writable:true,initializer:null}),Be=Qe(ie.prototype,"menu",[q],{configurable:true,enumerable:true,writable:true,initializer:null}),Se=Qe(ie.prototype,"isSearchable",[H],{configurable:true,enumerable:true,writable:true,initializer:null}),Oe=Qe(ie.prototype,"selectionChange",[W],{configurable:true,enumerable:true,writable:true,initializer:null}),Qe(ie.prototype,"onTableRowPress",[G],Object.getOwnPropertyDescriptor(ie.prototype,"onTableRowPress"),ie.prototype),Qe(ie.prototype,"onInternalDataReceived",[Q],Object.getOwnPropertyDescriptor(ie.prototype,"onInternalDataReceived"),ie.prototype),Qe(ie.prototype,"onInternalDataRequested",[K],Object.getOwnPropertyDescriptor(ie.prototype,"onInternalDataRequested"),ie.prototype),Qe(ie.prototype,"onPaste",[J],Object.getOwnPropertyDescriptor(ie.prototype,"onPaste"),ie.prototype),Qe(ie.prototype,"onBeforeExport",[X],Object.getOwnPropertyDescriptor(ie.prototype,"onBeforeExport"),ie.prototype),Qe(ie.prototype,"onDataStateChange",[Y],Object.getOwnPropertyDescriptor(ie.prototype,"onDataStateChange"),ie.prototype),Qe(ie.prototype,"onMassEditButtonPressed",[Z],Object.getOwnPropertyDescriptor(ie.prototype,"onMassEditButtonPressed"),ie.prototype),Qe(ie.prototype,"onTableSelectionChange",[ee],Object.getOwnPropertyDescriptor(ie.prototype,"onTableSelectionChange"),ie.prototype),Qe(ie.prototype,"onActionPress",[te],Object.getOwnPropertyDescriptor(ie.prototype,"onActionPress"),ie.prototype),ie))||ne);return Je},false);