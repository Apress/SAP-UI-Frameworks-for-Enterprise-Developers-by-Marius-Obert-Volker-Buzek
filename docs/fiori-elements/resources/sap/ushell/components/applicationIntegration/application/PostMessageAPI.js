// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/utils","sap/ui/core/library","sap/ui/thirdparty/jquery","sap/base/Log","sap/ui/core/UIComponent","sap/ushell/services/AppConfiguration","sap/ushell/EventHub","sap/ushell/components/applicationIntegration/application/PostMessageAPIInterface","sap/ui/thirdparty/URI","sap/base/util/deepExtend","sap/ushell/Config","sap/ushell/utils/UrlParsing","sap/ui/core/Core","sap/m/Button","sap/m/library","sap/ui/thirdparty/hasher","sap/ushell/resources","sap/ushell/ui/shell/ShellHeadItem"],function(e,t,r,n,a,o,s,i,l,c,u,p,d,f,v,g,h,y){"use strict";var C="sap.ushell.";var S=new a;var m=v.URLHelper;var D={"sap.ushell.services.CrossApplicationNavigation":{oServiceCalls:{hrefForExternal:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(r){r.hrefForExternalAsync(e.oMessageData.body.oArgs,undefined,true).then(t.resolve,t.reject)});return t.promise()}},getSemanticObjectLinks:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(r){r.getSemanticObjectLinks(e.oMessageData.body.sSemanticObject,e.oMessageData.body.mParameters,e.oMessageData.body.bIgnoreFormFactors,undefined,undefined,e.oMessageData.body.bCompactIntents).then(t.resolve,t.reject)});return t.promise()}},isIntentSupported:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(r){r.isIntentSupported(e.oMessageData.body.aIntents).then(t.resolve,t.reject)});return t.promise()}},isNavigationSupported:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(r){r.isNavigationSupported(e.oMessageData.body.aIntents).then(t.resolve,t.reject)});return t.promise()}},backToPreviousApp:{executeServiceCallFn:function(){sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(e){e.backToPreviousApp()});return(new r.Deferred).resolve().promise()}},historyBack:{executeServiceCallFn:function(e){sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(t){t.historyBack(e.oMessageData.body.iSteps)});return(new r.Deferred).resolve().promise()}},getAppStateData:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(r){r.getAppStateData(e.oMessageData.body.sAppStateKey).then(t.resolve,t.reject)});return t.promise()}},toExternal:{executeServiceCallFn:function(t){var n=new r.Deferred,a=c({},t.oMessageData.body.oArgs);e.storeSapSystemToLocalStorage(a);sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(e){e.toExternal(a).then(n.resolve,n.reject)});return n.promise()}},registerBeforeAppCloseEvent:{executeServiceCallFn:function(e){e.oContainer.setProperty("beforeAppCloseEvent",{enabled:true,params:e.oMessageData.body},true);return(new r.Deferred).resolve().promise()}},expandCompactHash:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(r){r.expandCompactHash(e.oMessageData.body.sHashFragment).then(t.resolve,t.reject)});return t.promise()}},getDistinctSemanticObjects:{executeServiceCallFn:function(){var e=new r.Deferred;sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(t){t.getDistinctSemanticObjects().then(e.resolve,e.reject)});return e.promise()}},getLinks:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(r){r.getLinks(e.oMessageData.body).then(t.resolve,t.reject)});return t.promise()}},getPrimaryIntent:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(r){r.getPrimaryIntent(e.oMessageData.body.sSemanticObject,e.oMessageData.body.mParameters).then(t.resolve,t.reject)});return t.promise()}},hrefForAppSpecificHash:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(r){r.hrefForAppSpecificHashAsync(e.oMessageData.body.sAppHash).then(t.resolve,t.reject)});return t.promise()}},isInitialNavigation:{executeServiceCallFn:function(){var e=new r.Deferred;sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(t){t.isInitialNavigationAsync().then(function(t){e.resolve(t)})});return e.promise()}},getAppState:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(r){r.getAppState(S,e.oMessageData.body.sAppStateKey).done(function(e){delete e._oServiceInstance;t.resolve(e)})});return t.promise()}},setInnerAppRoute:{executeServiceCallFn:function(e){var t=p.parseShellHash(g.getHash()),n;if(t.appSpecificRoute===e.oMessageData.body.appSpecificRoute){return(new r.Deferred).resolve().promise()}t.appSpecificRoute=e.oMessageData.body.appSpecificRoute;n="#"+p.constructShellHash(t);g.disableBlueBoxHashChangeTrigger=true;if(e.oMessageData.body.writeHistory===true||e.oMessageData.body.writeHistory==="true"){g.setHash(n)}else{g.replaceHash(n)}g.disableBlueBoxHashChangeTrigger=false;return(new r.Deferred).resolve().promise()}},setInnerAppStateData:{executeServiceCallFn:function(e){var t=new r.Deferred;b.prototype._createNewInnerAppState(e).then(t.resolve);return t.promise()}},resolveIntent:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(r){r.resolveIntent(e.oMessageData.body.sHashFragment).then(t.resolve,t.reject)});return t.promise()}}}},"sap.ushell.ui5service.ShellUIService":{oServiceCalls:{setTitle:{executeServiceCallFn:function(e){return(new r.Deferred).resolve(e.oContainer.getShellUIService().setTitle(e.oMessageData.body.sTitle)).promise()}},setBackNavigation:{executeServiceCallFn:function(e){return e.executeSetBackNavigationService(e.oMessage,e.oMessageData)}}}},"sap.ushell.services.ShellUIService":{oServiceCalls:{setTitle:{executeServiceCallFn:function(e){return(new r.Deferred).resolve(e.oContainer.getShellUIService().setTitle(e.oMessageData.body.sTitle)).promise()}},setHierarchy:{executeServiceCallFn:function(e){return(new r.Deferred).resolve(e.oContainer.getShellUIService().setHierarchy(e.oMessageData.body.aHierarchyLevels)).promise()}},setRelatedApps:{executeServiceCallFn:function(e){return(new r.Deferred).resolve(e.oContainer.getShellUIService().setRelatedApps(e.oMessageData.body.aRelatedApps)).promise()}},setDirtyFlag:{executeServiceCallFn:function(e){sap.ushell.Container.setDirtyFlag(e.oMessageData.body.bIsDirty);return(new r.Deferred).resolve().promise()}},showShellUIBlocker:{executeServiceCallFn:function(e){var t=e.oMessageData.body.bShow;M(t);sap.ui.getCore().getEventBus().publish("sap.ushell.services.ShellUIService","showShellUIBlocker",{bShow:t});return(new r.Deferred).resolve().promise()}},getFLPUrl:{executeServiceCallFn:function(e){var t=false;if(e.oMessageData.body&&e.oMessageData.body.bIncludeHash===true){t=true}return(new r.Deferred).resolve(sap.ushell.Container.getFLPUrl(t)).promise()}},getShellGroupIDs:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("Bookmark").then(function(r){r.getShellGroupIDs(e.oMessageData.body?e.oMessageData.body.bGetAll:undefined).then(t.resolve,t.reject)});return t.promise()}},addBookmark:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("Bookmark").then(function(r){r.addBookmarkByGroupId(e.oMessageData.body.oParameters,e.oMessageData.body.groupId).then(t.resolve,t.reject)});return t.promise()}},addBookmarkDialog:{executeServiceCallFn:function(e){sap.ui["require"](["sap/ushell/ui/footerbar/AddBookmarkButton"],function(e){var t=new e;t.firePress({})});return(new r.Deferred).resolve().promise()}},getShellGroupTiles:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("LaunchPage").then(function(r){r.getTilesByGroupId(e.oMessageData.body.groupId).then(t.resolve,t.reject)});return t.promise()}},sendUrlAsEmail:{executeServiceCallFn:function(e){var t=u.last("/core/shellHeader/application").title;var n=t===undefined?h.i18n.getText("linkToApplication"):h.i18n.getText("linkTo")+" '"+t+"'";b.prototype._sendEmail("",n,document.URL,"","",document.URL,true);return(new r.Deferred).resolve().promise()}},sendEmailWithFLPButton:{executeServiceCallFn:function(e){var t=u.last("/core/shellHeader/application").title;var n=t===undefined?h.i18n.getText("linkToApplication"):h.i18n.getText("linkTo")+" '"+t+"'";b.prototype._sendEmail("",n,document.URL,"","",document.URL,e.oMessageData.body.bSetAppStateToPublic);return(new r.Deferred).resolve().promise()}},sendEmail:{executeServiceCallFn:function(e){b.prototype._sendEmail(e.oMessageData.body.sTo,e.oMessageData.body.sSubject,e.oMessageData.body.sBody,e.oMessageData.body.sCc,e.oMessageData.body.sBcc,e.oMessageData.body.sIFrameURL,e.oMessageData.body.bSetAppStateToPublic);return(new r.Deferred).resolve().promise()}},processHotKey:{executeServiceCallFn:function(e){var t;try{t=new KeyboardEvent("keydown",e.oMessageData.body)}catch(r){var n=document.createEvent("KeyboardEvent"),a="";if(e.oMessageData.body.altKey){a+="Alt "}if(e.oMessageData.body.ctrlKey){a+="Control "}if(e.oMessageData.body.shiftKey){a+="Shift "}n.initKeyboardEvent("keydown",false,false,null,e.oMessageData.body.key,e.oMessageData.body.keyCode,a,0,false);t=n}document.dispatchEvent(t);return(new r.Deferred).resolve().promise()}}}},"sap.ushell.services.Container":{oServiceCalls:{setDirtyFlag:{executeServiceCallFn:function(e){sap.ushell.Container.setDirtyFlag(e.oMessageData.body.bIsDirty);return(new r.Deferred).resolve().promise()}},registerDirtyStateProvider:{executeServiceCallFn:function(e){if(e.oMessageData.body.bRegister){b.prototype.registerAsyncDirtyStateProvider(e)}else{b.prototype.deregisterAsyncDirtyStateProvider(e)}return(new r.Deferred).resolve().promise()}},getFLPUrl:{executeServiceCallFn:function(e){var t=false;if(e.oMessageData.body&&e.oMessageData.body.bIncludeHash===true){t=true}return(new r.Deferred).resolve(sap.ushell.Container.getFLPUrl(t)).promise()}},getFLPConfig:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getFLPConfig().then(function(e){t.resolve(e)});return t.promise()}},getFLPPlatform:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getFLPPlatform().then(t.resolve);return t.promise()}}}},"sap.ushell.services.AppState":{oServiceCalls:{getAppState:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("AppState").then(function(r){r.getAppState(e.oMessageData.body.sKey).done(function(e){delete e._oServiceInstance;t.resolve(e)}).fail(function(e){delete e._oServiceInstance;t.resolve(e)})});return t.promise()}},_saveAppState:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("AppState").then(function(r){r._saveAppState(e.oMessageData.body.sKey,e.oMessageData.body.sData,e.oMessageData.body.sAppName,e.oMessageData.body.sComponent,e.oMessageData.body.bTransient,e.oMessageData.body.iPersistencyMethod,e.oMessageData.body.oPersistencySettings).then(t.resolve,t.reject)});return t.promise()}},_loadAppState:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("AppState").then(function(r){r._loadAppState(e.oMessageData.body.sKey).then(t.resolve,t.reject)});return t.promise()}},deleteAppState:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("AppState").then(function(r){r.deleteAppState(e.oMessageData.body.sKey).then(t.resolve,t.reject)});return t.promise()}},makeStatePersistent:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("AppState").then(function(r){r.makeStatePersistent(e.oMessageData.body.sKey,e.oMessageData.body.iPersistencyMethod,e.oMessageData.body.oPersistencySettings).then(t.resolve,t.reject)});return t.promise()}}},"sap.ushell.services.Bookmark":{oServiceCalls:{addBookmarkUI5:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function(r){r.getCurrentApplication().getSystemContext().then(function(r){b.prototype._stripBookmarkServiceUrlForLocalContentProvider(e.oMessageData.body.oParameters,r);sap.ushell.Container.getServiceAsync("Bookmark").then(function(n){n.addBookmark(e.oMessageData.body.oParameters,e.oMessageData.body.vContainer,r.id).then(t.resolve,t.reject)})})});return t.promise()}},addBookmark:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("Bookmark").then(function(r){r.addBookmarkByGroupId(e.oMessageData.body.oParameters,e.oMessageData.body.groupId).then(t.resolve,t.reject)});return t.promise()}},getShellGroupIDs:{executeServiceCallFn:function(){var e=new r.Deferred;sap.ushell.Container.getServiceAsync("Bookmark").then(function(t){t.getShellGroupIDs().then(e.resolve,e.reject)});return e.promise()}},addCatalogTileToGroup:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("Bookmark").then(function(r){r.addCatalogTileToGroup(e.oMessageData.body.sCatalogTileId,e.oMessageData.body.sGroupId,e.oMessageData.body.oCatalogData).then(t.resolve,t.reject)});return t.promise()}},countBookmarks:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function(r){r.getCurrentApplication().getSystemContext().then(function(r){sap.ushell.Container.getServiceAsync("Bookmark").then(function(n){n.countBookmarks(e.oMessageData.body.sUrl,r.id).then(t.resolve,t.reject)})})});return t.promise()}},deleteBookmarks:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function(r){r.getCurrentApplication().getSystemContext().then(function(r){sap.ushell.Container.getServiceAsync("Bookmark").then(function(n){n.deleteBookmarks(e.oMessageData.body.sUrl,r.id).then(t.resolve,t.reject)})})});return t.promise()}},updateBookmarks:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function(r){r.getCurrentApplication().getSystemContext().then(function(r){sap.ushell.Container.getServiceAsync("Bookmark").then(function(n){n.updateBookmarks(e.oMessageData.body.sUrl,e.oMessageData.body.oParameters,r.id).then(t.resolve,t.reject)})})});return t.promise()}},getContentNodes:{executeServiceCallFn:function(){var e=new r.Deferred;sap.ushell.Container.getServiceAsync("Bookmark").then(function(t){t.getContentNodes().then(e.resolve,e.reject)});return e.promise()}},addCustomBookmark:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function(r){r.getCurrentApplication().getSystemContext().then(function(r){sap.ushell.Container.getServiceAsync("Bookmark").then(function(n){n.addCustomBookmark(e.oMessageData.body.sVizType,e.oMessageData.body.oConfig,e.oMessageData.body.vContentNodes,r.id).then(t.resolve,t.reject)})})});return t.promise()}},countCustomBookmarks:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function(r){r.getCurrentApplication().getSystemContext().then(function(r){e.oMessageData.body.oIdentifier.contentProviderId=r.id;sap.ushell.Container.getServiceAsync("Bookmark").then(function(r){r.countCustomBookmarks(e.oMessageData.body.oIdentifier).then(t.resolve,t.reject)})})});return t.promise()}},updateCustomBookmarks:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function(r){r.getCurrentApplication().getSystemContext().then(function(r){e.oMessageData.body.oIdentifier.contentProviderId=r.id;sap.ushell.Container.getServiceAsync("Bookmark").then(function(r){r.updateCustomBookmarks(e.oMessageData.body.oIdentifier,e.oMessageData.body.oConfig).then(t.resolve,t.reject)})})});return t.promise()}},deleteCustomBookmarks:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function(r){r.getCurrentApplication().getSystemContext().then(function(r){e.oMessageData.body.oIdentifier.contentProviderId=r.id;sap.ushell.Container.getServiceAsync("Bookmark").then(function(r){r.deleteCustomBookmarks(e.oMessageData.body.oIdentifier).then(t.resolve,t.reject)})})});return t.promise()}},addBookmarkToPage:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function(r){r.getCurrentApplication().getSystemContext().then(function(r){sap.ushell.Container.getServiceAsync("Bookmark").then(function(n){n.addBookmarkToPage(e.oMessageData.body.oParameters,e.oMessageData.body.sPageId,r.id).then(t.resolve,t.reject)})})});return t.promise()}}}},"sap.ushell.services.AppLifeCycle":{oServiceCalls:{getFullyQualifiedXhrUrl:{executeServiceCallFn:function(e){var t="",n="",a=new r.Deferred,o=e.oMessageData.body.path;if(o!==""&&o!==undefined&&o!==null){sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function(e){e.getCurrentApplication().getSystemContext().then(function(e){n=e.getFullyQualifiedXhrUrl(o);var r="",s="",i="",c=sap.ushell.Container.getFLPUrl(true),u=new l(c);if(u.protocol()!==null&&u.protocol()!==undefined&&u.protocol()!==""){s=u.protocol()+"://"}if(u.hostname()!==null&&u.hostname()!==undefined&&u.hostname()!==""){r=u.hostname()}if(u.port()!==null&&u.port()!==undefined&&u.port()!==""){i=":"+u.port()}t=s+r+i+n;a.resolve(t)})})}return a.promise()}},getSystemAlias:{executeServiceCallFn:function(e){var t=e.oContainer.getSystemAlias();if(t===null||t===undefined){t=""}return(new r.Deferred).resolve(t).promise()}},setNewAppInfo:{executeServiceCallFn:function(e){sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function(t){t.setAppInfo(e.oMessageData.body,true)});return(new r.Deferred).resolve().promise()}},updateCurrentAppInfo:{executeServiceCallFn:function(e){sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function(t){t.setAppInfo(e.oMessageData.body,false)});return(new r.Deferred).resolve().promise()}}}},"sap.ushell.services.AppConfiguration":{oServiceCalls:{setApplicationFullWidth:{executeServiceCallFn:function(e){o.setApplicationFullWidth(e.oMessageData.body.bValue);return(new r.Deferred).resolve().promise()}}}},"sap.ushell.appRuntime":{oRequestCalls:{innerAppRouteChange:{isActiveOnly:true,distributionType:["all"]},keepAliveAppHide:{isActiveOnly:true,distributionType:["all"]},keepAliveAppShow:{isActiveOnly:true,distributionType:["all"]},hashChange:{isActiveOnly:true,distributionType:["URL"]},setDirtyFlag:{isActiveOnly:true,distributionType:["URL"]},getDirtyFlag:{isActiveOnly:true,distributionType:["URL"]},themeChange:{isActiveOnly:false,distributionType:["all"]},uiDensityChange:{isActiveOnly:false,distributionType:["all"]}},oServiceCalls:{hashChange:{executeServiceCallFn:function(e){var t=new r.Deferred;g.disableBlueBoxHashChangeTrigger=true;g.replaceHash(e.oMessageData.body.newHash);g.disableBlueBoxHashChangeTrigger=false;var a=e.oMessageData.body.direction;if(a){sap.ushell.Container.getServiceAsync("ShellNavigation").then(function(e){e.hashChanger.fireEvent("hashReplaced",{hash:e.hashChanger.getHash(),direction:a});n.debug("PostMessageAPI.hashChange :: Informed by the Iframe, to change the "+"History direction property in FLP to: "+a);t.resolve()})}else{t.resolve()}return t.promise()}},iframeIsValid:{executeServiceCallFn:function(e){e.oContainer.setProperty("isIframeValidTime",{time:(new Date).getTime()},true);return(new r.Deferred).resolve().promise()}},iframeIsBusy:{executeServiceCallFn:function(e){e.oContainer.setProperty("isIframeBusy",e.oMessageData.body.bValue,true);return(new r.Deferred).resolve().promise()}},isInvalidIframe:{executeServiceCallFn:function(e){e.oContainer.setProperty("isInvalidIframe",e.oMessageData.body.bValue,true);return(new r.Deferred).resolve().promise()}}}},"sap.ushell.services.UserInfo":{oServiceCalls:{getThemeList:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("UserInfo").then(function(e){e.getThemeList().then(t.resolve,t.reject)});return t.promise()}},getLanguageList:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("UserInfo").then(function(e){e.getLanguageList().then(t.resolve,t.reject)});return t.promise()}},updateUserPreferences:{executeServiceCallFn:function(e){var t=new r.Deferred;if(e.oMessageData.body.language){sap.ushell.Container.getUser().setLanguage(e.oMessageData.body.language);sap.ushell.Container.getServiceAsync("UserInfo").then(function(e){e.updateUserPreferences().then(function(){sap.ushell.Container.getUser().resetChangedProperty("language");t.resolve()},t.reject)})}else{t.resolve()}return t.promise()}},openThemeManager:{executeServiceCallFn:function(e){s.emit("openThemeManager",Date.now());return(new r.Deferred).resolve().promise()}}}},"sap.ushell.services.ShellNavigation":{oServiceCalls:{toExternal:{executeServiceCallFn:function(e){sap.ushell.Container.getServiceAsync("ShellNavigation").then(function(t){t.toExternal(e.oMessageData.body.oArgs,undefined,e.oMessageData.body.bWriteHistory)});return(new r.Deferred).resolve().promise()}},toAppHash:{executeServiceCallFn:function(e){sap.ushell.Container.getServiceAsync("ShellNavigation").then(function(t){t.toAppHash(e.oMessageData.body.sAppHash,e.oMessageData.body.bWriteHistory)});return(new r.Deferred).resolve().promise()}}}},"sap.ushell.services.NavTargetResolution":{oServiceCalls:{getDistinctSemanticObjects:{executeServiceCallFn:function(){var e=new r.Deferred;sap.ushell.Container.getServiceAsync("NavTargetResolution").then(function(t){t.getDistinctSemanticObjects().then(e.resolve,e.reject)});return e.promise()}},expandCompactHash:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("NavTargetResolution").then(function(r){r.expandCompactHash(e.oMessageData.body.sHashFragment).then(t.resolve,t.reject)});return t.promise()}},resolveHashFragment:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("NavTargetResolution").then(function(r){r.resolveHashFragment(e.oMessageData.body.sHashFragment).then(t.resolve,t.reject)});return t.promise()}},isIntentSupported:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("NavTargetResolution").then(function(r){r.isIntentSupported(e.oMessageData.body.aIntents).then(t.resolve,t.reject)});return t.promise()}},isNavigationSupported:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("NavTargetResolution").then(function(r){r.isNavigationSupported(e.oMessageData.body.aIntents).then(t.resolve,t.reject)});return t.promise()}}}},"sap.ushell.services.Renderer":{oServiceCalls:{addHeaderItem:{executeServiceCallFn:function(e){x("addHeaderItem",e);return(new r.Deferred).resolve().promise()}},addHeaderEndItem:{executeServiceCallFn:function(e){x("addHeaderEndItem",e);return(new r.Deferred).resolve().promise()}},showHeaderItem:{executeServiceCallFn:function(e){sap.ushell.Container.getRenderer("fiori2").showHeaderItem(e.oMessageData.body.aIds,e.oMessageData.body.bCurrentState||true,e.oMessageData.body.aStates);return(new r.Deferred).resolve().promise()}},showHeaderEndItem:{executeServiceCallFn:function(e){sap.ushell.Container.getRenderer("fiori2").showHeaderEndItem(e.oMessageData.body.aIds,e.oMessageData.body.bCurrentState||true,e.oMessageData.body.aStates);return(new r.Deferred).resolve().promise()}},hideHeaderItem:{executeServiceCallFn:function(e){sap.ushell.Container.getRenderer("fiori2").hideHeaderItem(e.oMessageData.body.aIds,e.oMessageData.body.bCurrentState||true,e.oMessageData.body.aStates);return(new r.Deferred).resolve().promise()}},hideHeaderEndItem:{executeServiceCallFn:function(e){sap.ushell.Container.getRenderer("fiori2").hideHeaderEndItem(e.oMessageData.body.aIds,e.oMessageData.body.bCurrentState||true,e.oMessageData.body.aStates);return(new r.Deferred).resolve().promise()}},setHeaderTitle:{executeServiceCallFn:function(e){sap.ushell.Container.getRenderer("fiori2").setHeaderTitle(e.oMessageData.body.sTitle);return(new r.Deferred).resolve().promise()}},setHeaderVisibility:{executeServiceCallFn:function(e){sap.ushell.Container.getRenderer("fiori2").setHeaderVisibility(e.oMessageData.body.bVisible,e.oMessageData.body.bCurrentState||true,e.oMessageData.body.aStates);return(new r.Deferred).resolve().promise()}},createShellHeadItem:{executeServiceCallFn:function(e){var t=e.oMessageData.body.params;t.press=function(){e.oContainer.postMessageRequest("sap.ushell.appRuntime.buttonClick",{buttonId:t.id})};new y(t);return(new r.Deferred).resolve().promise()}},showActionButton:{executeServiceCallFn:function(e){sap.ushell.Container.getRenderer("fiori2").showActionButton(e.oMessageData.body.aIds,e.oMessageData.body.bCurrentState,e.oMessageData.body.aStates);return(new r.Deferred).resolve().promise()}},hideActionButton:{executeServiceCallFn:function(e){sap.ushell.Container.getRenderer("fiori2").hideActionButton(e.oMessageData.body.aIds,e.oMessageData.body.bCurrentState,e.oMessageData.body.aStates);return(new r.Deferred).resolve().promise()}},addUserAction:{executeServiceCallFn:function(e){e.oMessageData.body.oParameters.oControlProperties.press=function(){e.oContainer.postMessageRequest("sap.ushell.appRuntime.buttonClick",{buttonId:e.oMessageData.body.oParameters.oControlProperties.id})};sap.ushell.Container.getRenderer("fiori2").addUserAction(e.oMessageData.body.oParameters);return(new r.Deferred).resolve().promise()}},addOptionsActionSheetButton:{executeServiceCallFn:function(e){var t=Array.isArray(e.oMessageData.body)?e.oMessageData.body:[e.oMessageData.body];t.forEach(function(t){if(d.byId(t.id)){d.byId(t.id).destroy()}new f({id:t.id,text:t.text,icon:t.icon,tooltip:t.tooltip,press:function(){e.oContainer.postMessageRequest("sap.ushell.appRuntime.buttonClick",{buttonId:t.id})}});sap.ushell.Container.getRenderer("fiori2").showActionButton([t.id],true,t.aStates)});return(new r.Deferred).resolve().promise()}},removeOptionsActionSheetButton:{executeServiceCallFn:function(e){var t=Array.isArray(e.oMessageData.body)?e.oMessageData.body:[e.oMessageData.body];t.forEach(function(e){sap.ushell.Container.getRenderer("fiori2").hideActionButton(e.id,true,e.aStates);if(d.byId(e.id)){d.byId(e.id).destroy()}});return(new r.Deferred).resolve().promise()}},updateHeaderItem:{executeServiceCallFn:function(e){sap.ushell.Container.getRenderer("fiori2").updateHeaderItem(e.oMessageData.body.sId,e.oMessageData.body.oControlProperties);return(new r.Deferred).resolve().promise()}},destroyButton:{executeServiceCallFn:function(e){sap.ushell.Container.getRenderer("fiori2").destroyButton(e.oMessageData.body.aIds);return(new r.Deferred).resolve().promise()}}}},"sap.ushell.services.LaunchPage":{oServiceCalls:{getGroupsForBookmarks:{executeServiceCallFn:function(){var e=new r.Deferred;sap.ushell.Container.getServiceAsync("LaunchPage").then(function(t){t.getGroupsForBookmarks().then(e.resolve,e.reject)});return e.promise()}}}},"sap.ushell.services.Menu":{oServiceCalls:{getSpacesPagesHierarchy:{executeServiceCallFn:function(){var e=new r.Deferred;sap.ushell.Container.getServiceAsync("Menu").then(function(t){t.getSpacesPagesHierarchy().then(function(t){e.resolve(t)})});return e.promise()}}}},"sap.ushell.services.CommonDataModel":{oServiceCalls:{getAllPages:{executeServiceCallFn:function(){var e=new r.Deferred;sap.ushell.Container.getServiceAsync("CommonDataModel").then(function(t){t.getAllPages().then(function(t){e.resolve(t)})});return e.promise()}}}},"sap.ushell.services.MessageBroker":{oServiceCalls:{_execute:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ui.require(["sap/ushell/services/_MessageBroker/MessageBrokerEngine"],function(r){r.processPostMessage(e).then(function(e){t.resolve(e)}).catch(function(e){t.reject(e)})});return t.promise()}}}},"sap.ushell.services.SearchableContent":{oServiceCalls:{getApps:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("SearchableContent").then(function(r){var n;try{n=e.oMessageData.body.oOptions}catch(e){n={}}r.getApps(n).then(function(e){t.resolve(e)})});return t.promise()}}}},"sap.ushell.services.ReferenceResolver":{oServiceCalls:{resolveReferences:{executeServiceCallFn:function(e){var t=new r.Deferred;sap.ushell.Container.getServiceAsync("ReferenceResolver").then(function(r){r.resolveReferences(e.oMessageData.body.aReferences).then(t.resolve,t.reject)});return t.promise()}}}}};function b(){this._getBrowserURL=function(){return document.URL};Object.keys(D).forEach(function(e){if(e.indexOf(C)!==0){throw new Error("All Post Message APIs must start with '"+C+"' - "+e)}});i.init(true,b.prototype.registerShellCommunicationHandler.bind(this))}b.prototype.getAPIs=function(){return D};function A(e,t){var r=D[e],n;if(r){if(t.oServiceCalls){Object.keys(t.oServiceCalls).forEach(function(e){r.oServiceCalls[e]=t.oServiceCalls[e]})}if(t.oRequestCalls){Object.keys(t.oRequestCalls).forEach(function(e){r.oRequestCalls[e]=t.oRequestCalls[e]})}return}n={oRequestCalls:{},oServiceCalls:{}};if(t.oServiceCalls){Object.keys(t.oServiceCalls).forEach(function(e){n.oServiceCalls[e]=t.oServiceCalls[e]})}if(t.oRequestCalls){Object.keys(t.oRequestCalls).forEach(function(e){n.oRequestCalls[e]=t.oRequestCalls[e]})}D[e]=n}b.prototype._getPostMesageInterface=function(e,t){var r,n=this.getAPIs();if(n[e]){r=n[e];if(r&&r.oRequestCalls&&r.oRequestCalls[t]){return r.oRequestCalls[t]}}return undefined};b.prototype.registerShellCommunicationHandler=function(e){Object.keys(e).forEach(function(t){A(t,e[t])})};b.prototype.isActiveOnly=function(e,t){var r=this._getPostMesageInterface(e,t);if(r){return r.isActiveOnly}return undefined};b.prototype.getResponseHandler=function(e,t){var r=this._getPostMesageInterface(e,t);if(r){return r.fnResponseHandler}return undefined};b.prototype._createNewInnerAppState=function(e){return new Promise(function(t){var r,n,a,o,s;sap.ushell.Container.getServiceAsync("AppState").then(function(i){r=i.createEmptyAppState(undefined,false);if(e.oMessageData.body.sData!==undefined){try{s=JSON.parse(e.oMessageData.body.sData)}catch(t){s=e.oMessageData.body.sData}}else{s=""}r.setData(s);r.save();o=r.getKey();n=g.getHash();if(n.indexOf("&/")>0){if(n.indexOf("sap-iapp-state=")>0){a=/(?:sap-iapp-state=)([^&/]+)/.exec(n)[1];n=n.replace(a,o)}else{n=n+"/sap-iapp-state="+o}}else{n=n+"&/sap-iapp-state="+o}g.disableBlueBoxHashChangeTrigger=true;g.replaceHash(n);g.disableBlueBoxHashChangeTrigger=false;t(o)})})};function M(e){if(e===true){if(d.byId("shell-header")){d.byId("shell-header").setBlocked(true);var t=r("#shell-header-blockedLayer");t.addClass("sapUshellShellBlocked")}if(d.byId("menuBar")){d.byId("menuBar").setBlocked(true);var n=r("#menuBar-blockedLayer");n.addClass("sapUshellMenuBarBlocked")}}else if(e===false){if(d.byId("shell-header")){d.byId("shell-header").setBlocked(false)}if(d.byId("menuBar")){d.byId("menuBar").setBlocked(false)}}}function x(e,t){sap.ushell.Container.getRenderer("fiori2")[e]("sap.ushell.ui.shell.ShellHeadItem",{id:t.oMessageData.body.sId,tooltip:t.oMessageData.body.sTooltip,icon:t.oMessageData.body.sIcon,floatingNumber:t.oMessageData.body.iFloatingNumber,press:function(){t.oContainer.postMessageRequest("sap.ushell.appRuntime.buttonClick",{buttonId:t.oMessageData.body.sId})}},t.oMessageData.body.bVisible,t.oMessageData.body.bCurrentState||true,t.oMessageData.body.aStates)}b.prototype.registerAsyncDirtyStateProvider=function(e){sap.ushell.Container.setAsyncDirtyStateProvider(function(t){return new Promise(function(r){var n=e.oContainer.createPostMessageRequest("sap.ushell.appRuntime.handleDirtyStateProvider",{oNavigationContext:t}),a;e.oContainer.postMessageToCurrentIframe(n,true).then(function(e){if(a){clearTimeout(a)}r(e&&e.body&&e.body.result||false)});a=setTimeout(function(){r(false)},2500)})})};b.prototype.deregisterAsyncDirtyStateProvider=function(e){sap.ushell.Container.setAsyncDirtyStateProvider(undefined)};b.prototype._sendEmail=function(e,t,r,a,o,s,i){var l=this._getBrowserURL&&this._getBrowserURL()||document.URL;function c(e,n,a,o,s,i){t=t&&t.includes(e)?t.replace(e,n):t;r=r&&r.includes(e)?r.replace(e,n):r;t=t&&a&&s&&t.includes(a)?t.replace(a,s):t;t=t&&o&&i&&t.includes(o)?t.replace(o,i):t;r=r&&a&&s&&r.includes(a)?r.replace(a,s):r;r=r&&o&&i&&r.includes(o)?r.replace(o,i):r}if(i){sap.ushell.Container.getServiceAsync("AppState").then(function(i){i.setAppStateToPublic(s).done(function(n,i,u,p,d){if(p!==undefined){l=l.replace(i,p)}if(d!==undefined){l=l.replace(u,d)}c(s,l,i,u,p,d);m.triggerEmail(e,t,r,a,o)}).fail(n.error)})}else{c(s,l);m.triggerEmail(e,t,r,a,o)}};b.prototype._stripBookmarkServiceUrlForLocalContentProvider=function(e,t){if(!e||!e.serviceUrl||!t){return}if(t.id===""||t.id==="saas_approuter"){e.serviceUrl=undefined;n.warning("Dynamic data bookmarks tiles are not supported for local content providers",null,"sap/ushell/components/applicationIntegration/application/PostMessageAPI")}};return new b});