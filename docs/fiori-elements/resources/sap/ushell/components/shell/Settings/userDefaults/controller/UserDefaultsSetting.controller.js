// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/Log","sap/base/util/deepExtend","sap/base/util/deepEqual","sap/m/Button","sap/m/FlexBox","sap/m/FlexItemData","sap/m/Input","sap/m/library","sap/ui/core/mvc/Controller","sap/ui/core/Configuration","sap/ui/comp/smartfield/SmartField","sap/ui/comp/smartfield/SmartLabel","sap/ui/comp/smartform/Group","sap/ui/comp/smartform/GroupElement","sap/ui/comp/smartvariants/PersonalizableInfo","sap/ui/Device","sap/ui/layout/GridData","sap/ui/model/json/JSONModel","sap/ui/model/odata/v2/ODataModel","sap/ushell/resources","sap/m/MessageBox","./ExtendedValueDialog.controller"],function(e,t,a,r,n,i,s,o,d,l,u,h,m,f,c,p,g,v,y,P,M,S){"use strict";var b=o.ButtonType;function C(e,t){if(!(t.editorMetadata&&t.editorMetadata.groupId)){return-1}if(!(e.editorMetadata&&e.editorMetadata.groupId)){return 1}if(e.editorMetadata.groupId<t.editorMetadata.groupId){return-1}if(e.editorMetadata.groupId>t.editorMetadata.groupId){return 1}return 0}function D(e,t){if(!(t.editorMetadata&&t.editorMetadata.parameterIndex)){return-1}if(!(e.editorMetadata&&e.editorMetadata.parameterIndex)){return 1}return e.editorMetadata.parameterIndex-t.editorMetadata.parameterIndex}function x(e,t){var a=C(e,t);if(a===0){return D(e,t)}return a}return d.extend("sap.ushell.components.shell.Settings.userDefaults.controller.UserDefaultsSetting",{onInit:function(){this.oModelRecords={};this.aChangedParamsNames=[];this.oBlockedParameters={};this.aDisplayedUserDefaults=[];this.oDirtyStateModel=new v({isDirty:false,selectedVariant:null});this.getView().setModel(this.oDirtyStateModel,"DirtyState");this.oOriginalParameters={};var t=this.getView();t.setBusy(true);t.setModel(P.getTranslationModel(),"i18n");this.getSystemContextsModel().then(function(e){t.setModel(e,"systemContexts");return this._fillGroups()}.bind(this)).then(this._saveIsSupportedPlatform.bind(this)).then(this._initializeSmartVariantManagement.bind(this)).then(function(){t.setBusy(false)}).catch(function(a){e.error("Error during UserDefaultsSetting controller initialization",a,"sap.ushell.components.shell.Settings.userDefaults.UserDefaultsSetting");t.setBusy(false)})},getSystemContextsModel:function(){var e=new v({systemContexts:[],selectedKey:""});var t=this._getContentProviderIds();var a=sap.ushell.Container.getServiceAsync("ClientSideTargetResolution");var r=sap.ushell.Container.getServiceAsync("UserDefaultParameters");return Promise.all([t,a,r]).then(function(t){var a=t[0];var r=t[1];var n=t[2];if(a.length===0){a.push("")}return Promise.all(a.map(function(t){return r.getSystemContext(t).then(function(t){var a=e.getProperty("/systemContexts");return n.hasRelevantMaintainableParameters(t).then(function(e){if(e){a.push(t)}})})})).then(function(){var t=e.getProperty("/systemContexts");if(t.length>0){e.setProperty("/selectedKey",t[0].id)}return e})})},_getContentProviderIds:function(){return sap.ushell.Container.getServiceAsync("CommonDataModel").then(function(e){return e.getContentProviderIds()}).catch(function(){return[""]})},handleSystemContextChanged:function(){if(this.oDirtyStateModel.getProperty("/isDirty")){var e=P.i18n.getText("userDefaultsSave");var t=P.i18n.getText("userDefaultsDiscard");M.show(P.i18n.getText("userDefaultsUnsavedChangesMessage"),{title:P.i18n.getText("userDefaultsUnsavedChangesTitle"),actions:[e,t,M.Action.CANCEL],emphasizedAction:e,icon:M.Icon.QUESTION,onClose:function(a){if(a===t){this._fillGroups();this._setDirtyState(false)}else if(a===e){this.onSave();this._fillGroups();this._setDirtyState(false)}else{this.getView().getModel("systemContexts").setProperty("/selectedKey",this.sLastSelectedKey)}}.bind(this)})}else{this._fillGroups()}},_fillGroups:function(){var e=this.getView().byId("userDefaultsForm");e.removeAllGroups();var a=this.getView().getModel("systemContexts").getProperty("/selectedKey");var r=this.getView().getModel("systemContexts").getProperty("/systemContexts").find(function(e){return e.id===a});return new Promise(function(a){sap.ushell.Container.getServiceAsync("UserDefaultParameters").then(function(n){n.editorGetParameters(r).done(function(r){this.oOriginalParameters=t({},r);this.oModel=new v(r);this.oModel.setDefaultBindingMode("TwoWay");this.getView().setModel(this.oModel,"MdlParameter");return this._getFormattedParameters(this.oModel).then(function(t){var a=this._createContent(t);a.forEach(function(t){e.addGroup(t)})}.bind(this)).then(a)}.bind(this))}.bind(this))}.bind(this))},_getFormattedParameters:function(a){var r=a.getData("/");var n=Object.keys(r).map(function(n){var i=t({},r[n]);i.parameterName=n;i.editorMetadata=i.editorMetadata||{};i.valueObject=t({value:""},i.valueObject);if(i.editorMetadata.editorInfo&&i.editorMetadata.editorInfo.propertyName){return this._createOdataModelBinding(i,a).then(function(e){i.modelBind=e;return i}).catch(function(){e.error("Metadata loading for parameter "+i.parameterName+" failed"+JSON.stringify(i.editorMetadata));i.modelBind=this._createPlainModelBinding(i,a);this.oBlockedParameters[i.parameterName]=false;return Promise.resolve(i)}.bind(this))}i.modelBind=this._createPlainModelBinding(i,a);return Promise.resolve(i)}.bind(this));return Promise.all(n).then(function(e){e.sort(x);this.aDisplayedUserDefaults=e;e.forEach(function(e){e.modelBind.model.setProperty(e.modelBind.sFullPropertyPath,e.valueObject.value);e.modelBind.model.bindTree(e.modelBind.sFullPropertyPath).attachChange(this.storeChangedData.bind(this))}.bind(this));return e}.bind(this))},_createPlainModelBinding:function(e,t){var a="/"+e.parameterName+"/valueObject/value";if(!t.getProperty("/"+e.parameterName+"/valueObject")){t.setProperty("/"+e.parameterName+"/valueObject",{})}var r={isOdata:false,model:t,extendedModel:t,sFullPropertyPath:a,sPropertyName:"{"+a+"}"};return r},_createOdataModelBinding:function(e,t){var a=e.editorMetadata.editorInfo;var r=this._getODataServiceData(a.odataURL,e);return r.metadataLoaded.then(function(){var e={isOdata:true,model:r.model,extendedModel:t,sPropertyName:"{"+a.propertyName+"}",sFullPropertyPath:a.bindingPath+"/"+a.propertyName};return e})},_getODataServiceData:function(e,t){if(!this.oModelRecords[e]){var a=new y(e,{metadataUrlParams:{"sap-documentation":"heading,quickinfo","sap-value-list":"none","sap-language":l.getLanguageTag()},json:true});a.setDefaultCountMode("None");a.setDefaultBindingMode("TwoWay");this.oModelRecords[e]={attachedListeners:[],model:a,metadataLoaded:new Promise(function(e,t){a.attachMetadataLoaded(e);a.attachMetadataFailed(t)})}}if(this.oModelRecords[e].attachedListeners.indexOf(t.parameterName)===-1){this.oModelRecords[e].attachedListeners.push(t.parameterName);this.oModelRecords[e].model.attachRequestCompleted(this._overrideOdataModelValue.bind(this,t));this.oBlockedParameters[t.parameterName]=true}return this.oModelRecords[e]},_overrideOdataModelValue:function(e,t){var a=t.getSource();var r="/"+t.getParameter("url").replace(/\?.*/,"");if(e.editorMetadata.editorInfo.bindingPath===r){var n=e.editorMetadata.editorInfo.bindingPath+"/"+e.editorMetadata.editorInfo.propertyName;if(a.getProperty(n)!==e.valueObject.value){a.setProperty(n,e.valueObject.value)}this.oBlockedParameters[e.parameterName]=false}},_createContent:function(e){var t="nevermore";var a;var r={};var n=[];for(var i=0;i<e.length;++i){var s=e[i];var o=s.modelBind;if(t!==s.editorMetadata.groupId){a=new m({label:s.editorMetadata.groupTitle||undefined,layoutData:new g({linebreak:false})});t=s.editorMetadata.groupId;n.push(a)}var d=new f({});d.setModel(o.model);if(o.isOdata){var l=s.editorMetadata.editorInfo.odataURL;if(!r[l]){var u=s.editorMetadata.editorInfo.bindingPath;d.bindElement(u);r[l]=s.modelBind.model.getContext(u)}else{d.setBindingContext(r[l])}}d.addElement(this._createControl(s));a.addGroupElement(d)}return n},_createControl:function(e){var t;var a;if(e.editorMetadata.extendedUsage){a=new r({text:P.i18n.getText("userDefaultsExtendedParametersTitle"),tooltip:P.i18n.getText("userDefaultsExtendedParametersTooltip"),type:{parts:["MdlParameter>/"+e.parameterName+"/valueObject/extendedValue/Ranges"],formatter:function(e){return e&&e.length?b.Emphasized:b.Transparent}},press:function(t){S.openDialog(e,this.saveExtendedValue.bind(this))}.bind(this)}).addStyleClass("sapUshellExtendedDefaultParamsButton")}var o=new h({width:p.system.phone?"auto":"12rem",textAlign:p.system.phone?"Left":"Right"});if(e.modelBind.isOdata&&e.editorMetadata.editorInfo){t=new u({value:e.modelBind.sPropertyName,name:e.parameterName,fieldGroupIds:["UserDefaults"]});o.setLabelFor(t)}else{t=new s({name:e.parameterName,value:e.modelBind.sPropertyName,fieldGroupIds:["UserDefaults"],type:"Text"});t.addAriaLabelledBy(o);o.setText((e.editorMetadata.displayText||e.parameterName)+":");o.setTooltip(e.editorMetadata.description||e.parameterName)}t.attachChange(this.storeChangedData.bind(this));t.attachChange(this._setDirtyState.bind(this,true),this);t.addStyleClass("sapUshellDefaultValuesSmartField");t.setLayoutData(new i({shrinkFactor:0}));var d=new n({width:p.system.phone?"100%":"auto",alignItems:p.system.phone?"Start":"Center",direction:p.system.phone&&!a?"Column":"Row",items:[o,t,a],wrap:"Wrap"});return d},saveExtendedValue:function(e){var t=e.getSource().getModel().getProperty("/parameterName");var a=this.oModel;var r=e.getParameters().tokens||[];var n="/"+t+"/valueObject/extendedValue/Ranges";var i=r.map(function(e){var t=e.data("range");return{Sign:t.exclude?"E":"I",Option:t.operation!=="Contains"?t.operation:"CP",Low:t.value1,High:t.value2||null}});if(!a.getProperty("/"+t+"/valueObject/extendedValue")){a.setProperty("/"+t+"/valueObject/extendedValue",{})}a.setProperty(n,i);this.aChangedParamsNames.push(t);if(e.getParameter("_tokensHaveChanged")){this._setDirtyState(true)}},_setDirtyState:function(e){this.oDirtyStateModel.setProperty("/isDirty",e);this._setSmartVariantModified(e);if(e){this.sLastSelectedKey=this.getView().getModel("systemContexts").getProperty("/selectedKey")}},_setSelectedVariant:function(e){this.oDirtyStateModel.setProperty("/selectedVariant",e);this.storeChangedData()},storeChangedData:function(){var e=this.aDisplayedUserDefaults||[];for(var r=0;r<e.length;++r){var n=e[r].parameterName;var i=this.oModel.getProperty("/"+n+"/valueObject/");var s=e[r].modelBind;if(!this.oBlockedParameters[n]){var o={value:i&&i.value,extendedValue:i&&i.extendedValue};if(s&&s.model){var d=s.model;var l=s.extendedModel;var u=s.sFullPropertyPath;var h={value:d.getProperty(u)!==""?d.getProperty(u):undefined,extendedValue:l.getProperty("/"+n+"/valueObject/extendedValue")||undefined};if(!a(h,o)){i.value=h.value;if(h.extendedValue){i.extendedValue={};t(i.extendedValue,h.extendedValue)}this.oModel.setProperty("/"+n+"/valueObject",i);this.aChangedParamsNames.push(n)}}}}},onCancel:function(){this._setDirtyState(false);var e=this.aDisplayedUserDefaults;if(this.aChangedParamsNames.length>0){for(var t=0;t<e.length&&this.aChangedParamsNames.length>0;t++){var a=e[t].parameterName;if(this.aChangedParamsNames.indexOf(a)>-1){var r=this.oOriginalParameters[a];var n=e[t].modelBind;n.model.setProperty(n.sFullPropertyPath,r.valueObject.value||"");if(r.editorMetadata&&r.editorMetadata.extendedUsage){n.extendedModel.setProperty("/"+a+"/valueObject/extendedValue",r.valueObject.extendedValue||{})}}}this.aChangedParamsNames=[]}this._setDefaultVariant()},onSave:function(){this.storeChangedData();this._setDirtyState(false);var e;if(this.aChangedParamsNames.length===0){e=Promise.resolve()}else{e=sap.ushell.Container.getServiceAsync("ClientSideTargetResolution").then(function(e){return e.getSystemContext(this.sLastSelectedKey)}.bind(this)).then(function(e){var t=this.aChangedParamsNames.sort();this.aChangedParamsNames=[];return this._saveParameterValues(t,e)}.bind(this))}return e.then(this._resetSmartVariantManagement.bind(this)).then(this._setDefaultVariant.bind(this))},_saveParameterValues:function(e,t){var r=[];for(var n=0;n<e.length;n++){var i=e[n];var s=this.oModel.getProperty("/"+i+"/valueObject/");var o=this.oOriginalParameters[i].valueObject;if(!a(o,s)){if(s&&s.value===null||s&&s.value===""){s.value=undefined}if(s&&s.extendedValue&&Array.isArray(s.extendedValue.Ranges)&&s.extendedValue.Ranges.length===0){s.extendedValue=undefined}var d=this._saveParameterValue(i,s,o,t);r.push(d)}}return Promise.all(r)},_saveParameterValue:function(e,t,a,r){return sap.ushell.Container.getServiceAsync("UserDefaultParameters").then(function(n){return new Promise(function(i,s){n.editorSetValue(e,t,r).done(function(){a.value=t.value;i()}).fail(s)})})},_setSmartVariantModified:function(e){if(!this._bIsSupportedPlatform){return}this.getView().byId("defaultSettingsVariantManagement").currentVariantSetModified(e)},_setDefaultVariant:function(){if(!this._bIsSupportedPlatform){return}var e=this.getView().byId("defaultSettingsVariantManagement");e.setCurrentVariantId(e.getDefaultVariantKey());this._setSelectedVariant(e.getDefaultVariantKey())},_resetSmartVariantManagement:function(){if(!this._bIsSupportedPlatform){return Promise.resolve()}this.getView().byId("defaultSettingsVariantManagement").removeAllPersonalizableControls();return this._initializeSmartVariantManagement()},_initializeSmartVariantManagement:function(){if(!this._bIsSupportedPlatform){return Promise.resolve()}var e=this.getView().byId("defaultSettingsVariantManagement");var t=function(){this._setSelectedVariant(e.getSelectionKey())}.bind(this);return new Promise(function(a){var r=this.getView().byId("userDefaultsForm");var n=new c({type:"wrapper",keyName:"persistencyKey",dataSource:"none",control:r});e.detachSelect(t).detachAfterSave(t).addPersonalizableControl(n).attachSelect(t).attachAfterSave(t).initialise(function(){e.setVisible(true);a()},r)}.bind(this)).then(t)},_saveIsSupportedPlatform:function(){var e=sap.ushell.Container.getLogonSystem().getPlatform();this._bIsSupportedPlatform=e!=="cdm";return Promise.resolve(this._bIsSupportedPlatform)},displayDiffText:function(){if(!this._bIsSupportedPlatform){return false}var e=this.getView().byId("defaultSettingsVariantManagement");var t=this.getView().byId("userDefaultsForm");var r=e.getStandardVariantKey();var n=e.getSelectionKey();if(n===r){return false}var i=e.getVariantContent(t,r);var s=e.getVariantContent(t,n);delete s.executeOnSelection;return!a(i,s)}})});