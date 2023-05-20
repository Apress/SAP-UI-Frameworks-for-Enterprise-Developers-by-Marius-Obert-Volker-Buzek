/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["jquery.sap.global","sap/ui/Device","sap/ui/base/EventProvider","sap/ui/base/Interface","sap/ui/base/Object","sap/ui/base/ManagedObject","./Component","./Configuration","./Element","./ElementMetadata","./Lib","./Rendering","./RenderManager","./UIArea","./message/MessageManager","sap/base/Log","sap/ui/performance/Measurement","sap/ui/security/FrameOptions","sap/base/assert","sap/base/util/ObjectPath","sap/ui/performance/trace/initTraces","sap/base/util/isEmptyObject","sap/base/util/each","sap/ui/VersionInfo","sap/ui/events/jquery/EventSimulation"],function(e,t,n,o,i,r,a,s,u,c,p,d,l,f,h,g,y,m,v,E,b,C,T,M){"use strict";if(sap.ui.getCore&&sap.ui.getCore()){return sap.ui.getCore()}var S;var I;b();var _;var L=function(e,t){var n=[],o=0,i=0;this.startTask=function(e){var t=n.length;n[t]={name:e,finished:false};o++;return t};this.finishTask=function(t,a){if(!n[t]||n[t].finished){throw new Error("trying to finish non existing or already finished task")}n[t].finished=true;o--;if(a===false){i++}if(o===0){g.info("Sync point '"+e+"' finished (tasks:"+n.length+", open:"+o+", failures:"+i+")");r()}};function r(){if(t){t(o,i)}t=null}g.info("Sync point '"+e+"' created")};var P=i.extend("sap.ui.core.Core",{constructor:function(){var e=this,t="sap.ui.core.Core";if(sap.ui.getCore&&sap.ui.getCore()){g.error("Only the framework must create an instance of sap/ui/core/Core."+" To get access to its functionality, use sap.ui.getCore().");return sap.ui.getCore()}i.call(this);_=new n;["attachEvent","detachEvent","getEventingParent"].forEach(function(e){P.prototype[e]=_[e].bind(_)});this.bBooted=false;this.bInitialized=false;this.aPlugins=[];this.oModels={};this.oEventBus=null;Object.defineProperty(this,"mElements",{get:function(){g.error("oCore.mElements was a private member and has been removed. Use one of the methods in sap.ui.core.Element.registry instead");return u.registry.all()},configurable:false});this.mObjects={template:{}};this.oRootComponent=null;this.aInitListeners=[];this.bInitLegacyLib=false;g.info("Creating Core",null,t);y.start("coreComplete","Core.js - complete");y.start("coreBoot","Core.js - boot");y.start("coreInit","Core.js - init");s.setCore(this);var o=s.getValue("frameOptionsConfig")||{};o.mode=s.getFrameOptions();o.allowlistService=s.getAllowlistService();this.oFrameOptions=new m(o);this._grantFriendAccess();var r=this.aModules=s.getValue("modules");if(s.getDebug()){r.unshift("sap.ui.debug.DebugEnv")}var a=r.indexOf("sap.ui.core.library");if(a!=0){if(a>0){r.splice(a,1)}r.unshift("sap.ui.core.library")}if(s.getValue("xx-lesssupport")&&r.indexOf("sap.ui.core.plugin.LessSupport")==-1){g.info("Including LessSupport into declared modules");r.push("sap.ui.core.plugin.LessSupport")}var c=s.getPreload();var d=c==="async"||sap.ui.loader.config().async;document.documentElement.classList.add("sapUiTheme-"+s.getTheme());g.info("Declared theme "+s.getTheme(),null,t);g.info("Declared modules: "+r,t);this._setupContentDirection();this._setupBrowser();this._setupOS();this._setupLang();this._setupAnimation();sap.ui.getCore=function(){return e.getInterface()};var l=new L("UI5 Document Ready",function(t,n){e.init()});var f=l.startTask("document.ready");var h=l.startTask("preload and boot");var v=function(){g.trace("document is ready");l.finishTask(f);document.removeEventListener("DOMContentLoaded",v)};if(document.readyState!=="loading"){v()}else{document.addEventListener("DOMContentLoaded",v)}var E=new L("UI5 Core Preloads and Bootstrap Script",function(t,n){g.trace("Core loaded: open="+t+", failures="+n);e._boot(d,function(){l.finishTask(h);y.end("coreBoot")})});var b=E.startTask("create sp2 tasks task");if(s.getValue("versionedLibCss")){var C=E.startTask("load version info");var T=function(e){if(e){g.trace('Loaded "sap-ui-version.json".')}else{g.error('Could not load "sap-ui-version.json".')}E.finishTask(C)};if(d){M.load().then(T,function(e){g.error('Unexpected error when loading "sap-ui-version.json": '+e);E.finishTask(C)})}else{T(sap.ui.getVersionInfo({async:d,failOnError:false}))}}this._polyfillFlexbox();var S=E.startTask("bootstrap script");this.boot=function(){if(this.bBooted){return}this.bBooted=true;I.call(this);E.finishTask(S)};function I(){var t=s.getValue("xx-bootTask");if(t){var n=E.startTask("custom boot task");t(function(e){E.finishTask(n,typeof e==="undefined"||e===true)})}if(c==="sync"||c==="async"){var o=e.aModules.reduce(function(e,t){var n=t.search(/\.library$/);if(n>=0){e.push(t.slice(0,n))}return e},[]);var i=p._load(o,{sync:!d,preloadOnly:true});if(d){var r=E.startTask("preload bootstrap libraries");i.then(function(){E.finishTask(r)},function(){E.finishTask(r,false)})}}var a=s.getAppCacheBuster();if(a&&a.length>0){if(d){var u=E.startTask("require AppCachebuster");sap.ui.require(["sap/ui/core/AppCacheBuster"],function(e){e.boot(E);E.finishTask(u)})}else{var l=sap.ui.requireSync("sap/ui/core/AppCacheBuster");l.boot(E)}}if(s.getSupportMode()!==null){var f=E.startTask("support info script");var h=function(e,t){e.initializeSupportMode(s.getSupportMode(),d);t.initSupportRules(s.getSupportMode());E.finishTask(f)};if(d){sap.ui.require(["sap/ui/core/support/Support","sap/ui/support/Bootstrap"],h,function(e){g.error("Could not load support mode modules:",e)})}else{g.warning("Synchronous loading of Support mode. Set preload configuration to 'async' or switch to asynchronous bootstrap to prevent these synchronous request.","SyncXHR",null,function(){return{type:"SyncXHR",name:"support-mode"}});h(sap.ui.requireSync("sap/ui/core/support/Support"),sap.ui.requireSync("sap/ui/support/Bootstrap"))}}if(s.getTestRecorderMode()!==null){var y=E.startTask("test recorder script");var m=function(e){e.init(s.getTestRecorderMode());E.finishTask(y)};if(d){sap.ui.require(["sap/ui/testrecorder/Bootstrap"],m,function(e){g.error("Could not load test recorder:",e)})}else{g.warning("Synchronous loading of Test recorder mode. Set preload configuration to 'async' or switch to asynchronous bootstrap to prevent these synchronous request.","SyncXHR",null,function(){return{type:"SyncXHR",name:"test-recorder-mode"}});m(sap.ui.requireSync("sap/ui/testrecorder/Bootstrap"))}}E.finishTask(b)}},metadata:{publicMethods:["isInitialized","attachInit","getConfiguration","lock","unlock","isLocked","createUIArea","getUIArea","getUIDirty","applyChanges","getStaticAreaRef","createRenderManager","applyTheme","setThemeRoot","attachThemeChanged","detachThemeChanged","isThemeApplied","notifyContentDensityChanged","getCurrentFocusedControlId","isMobile","getEventBus","byId","byFieldGroupId","getLoadedLibraries","loadLibrary","initLibrary","getLibraryResourceBundle","setModel","getModel","hasModel","getMessageManager","attachEvent","detachEvent","attachControlEvent","detachControlEvent","attachParseError","detachParseError","attachValidationError","detachValidationError","attachFormatError","detachFormatError","attachValidationSuccess","detachValidationSuccess","attachLocalizationChanged","detachLocalizationChanged","isStaticAreaRef","fireFormatError","fireValidationSuccess","fireValidationError","fireParseError","boot","addPrerenderingTask","setMessageManager","attachLibraryChanged","detachLibraryChanged","loadLibraries","attachThemeScopingChanged","detachThemeScopingChanged","fireThemeScopingChanged","includeLibraryTheme","attachInitEvent","registerPlugin","unregisterPlugin","setRoot","getRootComponent","getApplication","getControl","getComponent","getTemplate","createComponent","attachIntervalTimer","detachIntervalTimer","getElementById","getRenderManager"]}});P.M_EVENTS={ControlEvent:"ControlEvent",UIUpdated:"UIUpdated",ThemeChanged:"ThemeChanged",ThemeScopingChanged:"themeScopingChanged",LocalizationChanged:"localizationChanged",LibraryChanged:"libraryChanged",ValidationError:"validationError",ParseError:"parseError",FormatError:"formatError",ValidationSuccess:"validationSuccess"};P.prototype._grantFriendAccess=function(){c.prototype.register=function(e){p._registerElement(e)}};P.prototype._setupContentDirection=function(){var e="sap.ui.core.Core",t=s.getRTL()?"rtl":"ltr";document.documentElement.setAttribute("dir",t);g.info("Content direction set to '"+t+"'",null,e)};P.prototype._setupBrowser=function(){var e="sap.ui.core.Core";var n=document.documentElement;var o=t.browser;var i=o.name;if(i){if(i===o.BROWSER.SAFARI&&o.mobile){i="m"+i}i=i+(o.version===-1?"":Math.floor(o.version));n.dataset.sapUiBrowser=i;g.debug("Browser-Id: "+i,null,e)}};P.prototype._setupOS=function(){var e=document.documentElement;e.dataset.sapUiOs=t.os.name+t.os.versionStr;var n=null;switch(t.os.name){case t.os.OS.IOS:n="sap-ios";break;case t.os.OS.ANDROID:n="sap-android";break}if(n){e.classList.add(n)}};P.prototype._setupLang=function(){var e=document.documentElement;var t=function(){var t=s.getLocale();t?e.setAttribute("lang",t.toString()):e.removeAttribute("lang")};t.call(this);this.attachLocalizationChanged(t,this)};P.prototype._setupAnimation=function(){var t=document.documentElement;var n=s.getAnimationMode();t.dataset.sapUiAnimationMode=n;var o=n!==s.AnimationMode.minimal&&n!==s.AnimationMode.none;t.dataset.sapUiAnimation=o?"on":"off";if(typeof e!=="undefined"){e.fx.off=!o}};P.prototype._polyfillFlexbox=function(){e.support.useFlexBoxPolyfill=false};P.prototype._boot=function(e,t){this.aModules.push("sap/ui/core/date/"+s.getCalendarType());if(e){return this._requireModulesAsync().then(function(){t()})}g.warning("Modules and libraries declared via bootstrap-configuration are loaded synchronously. Set preload configuration to"+" 'async' or switch to asynchronous bootstrap to prevent these requests.","SyncXHR",null,function(){return{type:"SyncXHR",name:"legacy-module"}});this.aModules.forEach(function(e){var t=e.match(/^(.*)\.library$/);if(t){p._load(t[1],{sync:true})}else{sap.ui.requireSync(/^jquery\.sap\./.test(e)?e:e.replace(/\./g,"/"))}});t()};P.prototype._requireModulesAsync=function(){var e=[],t=[];this.aModules.forEach(function(n){var o=n.match(/^(.*)\.library$/);if(o){e.push(o[1])}else{t.push(/^jquery\.sap\./.test(n)?n:n.replace(/\./g,"/"))}});return Promise.all([p._load(e),new Promise(function(e){sap.ui.require(t,function(){e(Array.prototype.slice.call(arguments))})})])};P.prototype.applyTheme=function(e,t){v(typeof e==="string","sThemeName must be a string");v(typeof t==="string"||typeof t==="undefined","sThemeBaseUrl must be a string or undefined");e=s.normalizeTheme(e,t);if(e&&s.getTheme()!=e){s.setTheme(e);this._getThemeManager().then(function(n){n.applyTheme(e,t,true)})}};P.prototype.setThemeRoot=function(e,t,n,o){this._getThemeManager().then(function(i){i.setThemeRoot(e,t,n,o)});return this};P.prototype.init=function(){if(this.bInitialized){return}f.setCore(this);var e="sap.ui.core.Core.init()";g.info("Initializing",null,e);y.end("coreInit");this._setBodyAccessibilityRole();var t=s.getValue("xx-waitForTheme");if(this.isThemeApplied()||!t){this._executeInitialization()}else{d.suspend();var n=function(e){this._getThemeManager().then(function(t){if(t.themeLoaded){e()}else{t.attachEventOnce("ThemeChanged",e)}})}.bind(this);if(t==="rendering"){d.notifyInteractionStep();this._executeInitialization();d.getLogger().debug("delay initial rendering until theme has been loaded");n(function(){d.resume("after theme has been loaded")})}else if(t==="init"){d.getLogger().debug("delay init event and initial rendering until theme has been loaded");d.notifyInteractionStep();n(function(){this._executeInitialization();d.resume("after theme has been loaded")}.bind(this))}}};P.prototype._executeOnInit=function(){var e=s.getValue("onInit");if(e){if(typeof e==="function"){e()}else if(typeof e==="string"){var t=/^module\:((?:[_$.\-a-zA-Z0-9]+\/)*[_$.\-a-zA-Z0-9]+)$/.exec(e);if(t&&t[1]){setTimeout(sap.ui.require.bind(sap.ui,[t[1]]),0)}else{var n=E.get(e);if(typeof n==="function"){n()}else{g.warning("[Deprecated] Do not use inline JavaScript code with the oninit attribute."+" Use the module:... syntax or the name of a global function");window.eval(e)}}}}};P.prototype._setupRootComponent=function(){var e="sap.ui.core.Core.init()";var t=s.getRootComponent();if(t){g.info("Loading Root Component: "+t,null,e);var n=sap.ui.component({name:t});this.oRootComponent=n;var o=s.getValue("xx-rootComponentNode");if(o&&n.isA("sap.ui.core.UIComponent")){var r=document.getElementById(o);if(r){g.info("Creating ComponentContainer for Root Component: "+t,null,e);var a=sap.ui.requireSync("sap/ui/core/ComponentContainer"),u=new a({component:n,propagateModel:true});u.placeAt(r)}}}else{var c=s.getApplication();if(c){g.warning("The configuration 'application' is deprecated. Please use the configuration 'component' instead! "+"Please migrate from sap.ui.app.Application to sap.ui.core.Component.","SyncXHR",null,function(){return{type:"Deprecation",name:"sap.ui.core"}});g.info("Loading Application: "+c,null,e);sap.ui.requireSync(c.replace(/\./g,"/"));var p=E.get(c);v(p!==undefined,'The specified application "'+c+'" could not be found!');var d=new p;v(i.isA(d,"sap.ui.app.Application"),'The specified application "'+c+'" must be an instance of sap.ui.app.Application!')}}};P.prototype._setBodyAccessibilityRole=function(){var e=document.body;if(s.getAccessibility()&&s.getAutoAriaBodyRole()&&!e.getAttribute("role")){e.setAttribute("role","application")}};P.prototype._executeInitListeners=function(){var e="sap.ui.core.Core.init()";var t=this.aInitListeners;this.aInitListeners=undefined;if(t&&t.length>0){g.info("Fire Loaded Event",null,e);t.forEach(function(e){e()})}};P.prototype._executeInitialization=function(){var e="sap.ui.core.Core.init()";if(this.bInitialized){return}this.bInitialized=true;g.info("Initialized",null,e);g.info("Starting Plugins",null,e);this.startPlugins();g.info("Plugins started",null,e);this._executeOnInit();this._setupRootComponent();this._executeInitListeners()};P.prototype.isInitialized=function(){return this.bInitialized};P.prototype.isThemeApplied=function(){I=I||sap.ui.require("sap/ui/core/theming/ThemeManager");return I?I.themeLoaded:false};P.prototype._getThemeManager=function(e){I=I||sap.ui.require("sap/ui/core/theming/ThemeManager");if(!this.pThemeManager){if(!I){this.pThemeManager=new Promise(function(e,t){sap.ui.require(["sap/ui/core/theming/ThemeManager"],function(t){e(t)},t)})}else{this.pThemeManager=Promise.resolve(I)}this.pThemeManager=this.pThemeManager.then(function(e){e.attachEvent("ThemeChanged",function(e){this.fireThemeChanged(e.getParameters())}.bind(this));return e}.bind(this))}if(I&&e){I.reset()}return this.pThemeManager};P.prototype.attachInitEvent=function(e){v(typeof e==="function","fnFunction must be a function");if(this.aInitListeners){this.aInitListeners.push(e)}};P.prototype.attachInit=function(e){v(typeof e==="function","fnFunction must be a function");if(this.aInitListeners){this.aInitListeners.push(e)}else{e()}};P.prototype.lock=function(){this.bLocked=true};P.prototype.unlock=function(){this.bLocked=false};P.prototype.isLocked=function(){return this.bLocked};P.prototype.getConfiguration=function(){return s};P.prototype.getRenderManager=function(){return this.createRenderManager()};P.prototype.createRenderManager=function(){v(this.isInitialized(),"A RenderManager should be created only after the Core has been initialized");var e=new l;return e.getInterface()};P.prototype.getCurrentFocusedControlId=function(){if(!this.isInitialized()){throw new Error("Core must be initialized")}S=S||sap.ui.require("sap/ui/core/FocusHandler");return S?S.getCurrentFocusedControlId():null};P.prototype.loadLibrary=function(e,t){var n={name:e};var o={sync:true};if(typeof t==="boolean"){o.sync=!t}else if(typeof t==="string"){n.url=t}else if(typeof t==="object"){o.sync=!t.async;n.url=t.url}var i=p._load(n,o);if(!o.sync){return i.then(function(e){return e[0]})}else{return i[0]}};P.prototype.loadLibraries=function(e,t){t=Object.assign({async:true},t);t.sync=!t.async;var n=p._load(e,t);if(!t.sync){return n}else{return undefined}};P.prototype.createComponent=function(e,t,n,o){if(typeof e==="string"){e={name:e,url:t};if(typeof n==="object"){e.settings=n}else{e.id=n;e.settings=o}}if(e.async&&(e.manifest!==undefined||e.manifestFirst===undefined&&e.manifestUrl===undefined)){if(e.manifest===undefined){e.manifest=false}return a.create(e)}return sap.ui.component(e)};P.prototype.getRootComponent=function(){return this.oRootComponent};P.prototype.initLibrary=function(e){v(typeof e==="string"||typeof e==="object","oLibInfo must be a string or object");var t=typeof e==="string";if(t){e={name:e}}var n=e.name,o="sap.ui.core.Core.initLibrary()";if(t){g.error("[Deprecated] library "+n+" uses old fashioned initLibrary() call (rebuild with newest generator)")}if(!n){g.error("A library name must be provided.",null,o);return}var i=p.get(n);if(i&&i.isSettingsEnhanced()){return E.get(n)}return p.init(e)};P.prototype.includeLibraryTheme=function(e,t,n){var o=p._get(e,true);o._includeTheme(t,n)};P.prototype.getLoadedLibraries=function(){return p.all()};P.prototype.getLibraryResourceBundle=function(e,t,n){if(typeof e==="boolean"){n=e;e=undefined;t=undefined}if(typeof t==="boolean"){n=t;t=undefined}v(e===undefined&&t===undefined||typeof e==="string","sLibraryName must be a string or there is no argument given at all");v(t===undefined||typeof t==="string","sLocale must be a string or omitted");e=e||"sap.ui.core";var o=p._get(e||"sap.ui.core",true);return o._loadResourceBundle(t,!n)};function A(e,t){v(typeof e==="string"||typeof e==="object","oDomRef must be a string or object");v(t instanceof o||i.isA(t,"sap.ui.core.Control"),"oControl must be a Control or Interface");if(t){t.placeAt(e,"only")}}P.prototype.setRoot=A;P.prototype.createUIArea=function(e){return f.create(e)};P.prototype.getUIArea=function(e){v(typeof e==="string"||typeof e==="object","o must be a string or object");var t="";if(typeof e=="string"){t=e}else{t=e.id}if(t){return f.registry.get(t)}return null};P.prototype.getUIDirty=function(){return d.getUIDirty()};P.prototype.attachUIUpdated=function(e,t){_.attachEvent(P.M_EVENTS.UIUpdated,e,t)};P.prototype.detachUIUpdated=function(e,t){_.detachEvent(P.M_EVENTS.UIUpdated,e,t)};d.attachUIUpdated(function(e){_.fireEvent(P.M_EVENTS.UIUpdated,e.getParameters())});P.prototype.notifyContentDensityChanged=function(){this._getThemeManager().then(function(e){e.notifyContentDensityChanged()})};P.prototype.attachThemeChanged=function(e,t){this._getThemeManager();_.attachEvent(P.M_EVENTS.ThemeChanged,e,t)};P.prototype.detachThemeChanged=function(e,t){_.detachEvent(P.M_EVENTS.ThemeChanged,e,t)};P.prototype.fireThemeChanged=function(e){var t=P.M_EVENTS.ThemeChanged;_.fireEvent(t,e)};P.prototype.attachThemeScopingChanged=function(e,t){_.attachEvent(P.M_EVENTS.ThemeScopingChanged,e,t)};P.prototype.detachThemeScopingChanged=function(e,t){_.detachEvent(P.M_EVENTS.ThemeScopingChanged,e,t)};P.prototype.fireThemeScopingChanged=function(e){_.fireEvent(P.M_EVENTS.ThemeScopingChanged,e)};P.prototype.attachLocalizationChanged=function(e,t){_.attachEvent(P.M_EVENTS.LocalizationChanged,e,t)};P.prototype.detachLocalizationChanged=function(e,t){_.detachEvent(P.M_EVENTS.LocalizationChanged,e,t)};P.prototype.fireLocalizationChanged=function(t){var n=P.M_EVENTS.LocalizationChanged,o=e.Event(n,{changes:t}),i=r._handleLocalizationChange;g.info("localization settings changed: "+Object.keys(t).join(","),null,"sap.ui.core.Core");T(this.oModels,function(e,t){if(t&&t._handleLocalizationChange){t._handleLocalizationChange()}});function c(e){f.registry.forEach(function(t){i.call(t,e)});a.registry.forEach(function(t){i.call(t,e)});u.registry.forEach(function(t){i.call(t,e)})}c.call(this,1);c.call(this,2);if(t.rtl!=undefined){document.documentElement.setAttribute("dir",t.rtl?"rtl":"ltr");this._getThemeManager().then(function(e){e._updateThemeUrls(s.getTheme())});f.registry.forEach(function(e){e.invalidate()});g.info("RTL mode "+t.rtl?"activated":"deactivated")}u.registry.forEach(function(e){e._handleEvent(o)});_.fireEvent(n,{changes:t})};P.prototype.attachLibraryChanged=function(e,t){_.attachEvent(P.M_EVENTS.LibraryChanged,e,t)};P.prototype.detachLibraryChanged=function(e,t){_.detachEvent(P.M_EVENTS.LibraryChanged,e,t)};p.attachLibraryChanged(function(e){_.fireEvent(P.M_EVENTS.LibraryChanged,e.getParameters())});P.prototype.applyChanges=function(){d.renderPendingUIUpdates("forced by applyChanges")};P.prototype.registerObject=function(e){var t=e.getId(),n=e.getMetadata().getStereotype(),o=this.getObject(n,t);if(o&&o!==e){g.error('adding object "'+n+"\" with duplicate id '"+t+"'");throw new Error('Error: adding object "'+n+"\" with duplicate id '"+t+"'")}this.mObjects[n][t]=e};P.prototype.deregisterObject=function(e){var t=e.getId(),n=e.getMetadata().getStereotype();delete this.mObjects[n][t]};P.prototype.byId=u.registry.get;P.prototype.getControl=u.registry.get;P.prototype.getElementById=u.registry.get;P.prototype.getObject=function(e,t){v(t==null||typeof t==="string","sId must be a string when defined");v(this.mObjects[e]!==undefined,"sType must be a supported stereotype");return t==null?undefined:this.mObjects[e]&&this.mObjects[e][t]};P.prototype.getComponent=a.registry.get;P.prototype.getTemplate=function(e){g.warning("Synchronous loading of 'sap/ui/core/tmpl/Template'. Use 'sap/ui/core/tmpl/Template' module and"+" call Template.byId instead","SyncXHR",null,function(){return{type:"SyncXHR",name:"Core.prototype.getTemplate"}});var t=sap.ui.requireSync("sap/ui/core/tmpl/Template");return t.byId(e)};P.prototype.getStaticAreaRef=function(){return f.getStaticAreaRef()};P.prototype.isStaticAreaRef=function(e){return f.isStaticAreaRef(e)};var V;P.prototype.attachIntervalTimer=function(e,t){g.warning("Usage of sap.ui.getCore().attachIntervalTimer() is deprecated. "+"Please use 'IntervalTrigger.addListener()' from 'sap/ui/core/IntervalTrigger' module instead.","Deprecation",null,function(){return{type:"sap.ui.core.Core",name:"Core"}});if(!V){V=sap.ui.require("sap/ui/core/IntervalTrigger")||sap.ui.requireSync("sap/ui/core/IntervalTrigger")}V.addListener(e,t)};P.prototype.detachIntervalTimer=function(e,t){if(V){V.removeListener(e,t)}};P.prototype.attachControlEvent=function(e,t){_.attachEvent(P.M_EVENTS.ControlEvent,e,t)};P.prototype.detachControlEvent=function(e,t){_.detachEvent(P.M_EVENTS.ControlEvent,e,t)};P.prototype.fireControlEvent=function(e){_.fireEvent(P.M_EVENTS.ControlEvent,e)};P.prototype._handleControlEvent=function(t,n){var o=e.Event(t.type);Object.assign(o,t);o.originalEvent=undefined;this.fireControlEvent({browserEvent:o,uiArea:n})};P.prototype.getApplication=function(){return sap.ui.getApplication&&sap.ui.getApplication()};P.prototype.registerPlugin=function(e){v(typeof e==="object","oPlugin must be an object");if(!e){return}for(var t=0,n=this.aPlugins.length;t<n;t++){if(this.aPlugins[t]===e){return}}this.aPlugins.push(e);if(this.bInitialized&&e&&e.startPlugin){e.startPlugin(this)}};P.prototype.unregisterPlugin=function(e){v(typeof e==="object","oPlugin must be an object");if(!e){return}var t=-1;for(var n=this.aPlugins.length;n--;n>=0){if(this.aPlugins[n]===e){t=n;break}}if(t==-1){return}if(this.bInitialized&&e&&e.stopPlugin){e.stopPlugin(this)}this.aPlugins.splice(t,1)};P.prototype.startPlugins=function(){for(var e=0,t=this.aPlugins.length;e<t;e++){var n=this.aPlugins[e];if(n&&n.startPlugin){n.startPlugin(this,true)}}};P.prototype.stopPlugins=function(){for(var e=0,t=this.aPlugins.length;e<t;e++){var n=this.aPlugins[e];if(n&&n.stopPlugin){n.stopPlugin(this)}}};P.prototype.setModel=function(e,t){v(e==null||i.isA(e,"sap.ui.model.Model"),"oModel must be an instance of sap.ui.model.Model, null or undefined");v(t===undefined||typeof t==="string"&&!/^(undefined|null)?$/.test(t),"sName must be a string or omitted");var n=this,o;if(!e&&this.oModels[t]){delete this.oModels[t];if(C(n.oModels)&&C(n.oBindingContexts)){o=r._oEmptyPropagatedProperties}else{o={oModels:Object.assign({},n.oModels),oBindingContexts:{},aPropagationListeners:[]}}f.registry.forEach(function(n){if(e!=n.getModel(t)){n._propagateProperties(t,n,o,false,t)}})}else if(e&&e!==this.oModels[t]){this.oModels[t]=e;f.registry.forEach(function(n){if(e!=n.getModel(t)){var o={oModels:Object.assign({},this.oModels),oBindingContexts:{},aPropagationListeners:[]};n._propagateProperties(t,n,o,false,t)}}.bind(this))}return this};P.prototype.setMessageManager=function(e){this.oMessageManager=e};P.prototype.getMessageManager=function(){if(!this.oMessageManager){this.oMessageManager=new h}return this.oMessageManager};P.prototype.byFieldGroupId=function(e){return u.registry.filter(function(t){return t.isA("sap.ui.core.Control")&&t.checkFieldGroupIds(e)})};P.prototype.getModel=function(e){v(e===undefined||typeof e==="string"&&!/^(undefined|null)?$/.test(e),"sName must be a string or omitted");return this.oModels[e]};P.prototype.hasModel=function(){return!C(this.oModels)};P.prototype.getEventBus=function(){if(!this.oEventBus){var e=sap.ui.require("sap/ui/core/EventBus");if(!e){g.warning("Synchronous loading of EventBus. Ensure that 'sap/ui/core/EventBus' module is loaded"+" before this function is called.","SyncXHR",null,function(){return{type:"SyncXHR",name:"core-eventbus"}});e=sap.ui.requireSync("sap/ui/core/EventBus")}var t=this.oEventBus=new e;this._preserveHandler=function(e){t.publish("sap.ui","__preserveContent",{domNode:e.domNode})};l.attachPreserveContent(this._preserveHandler)}return this.oEventBus};P.prototype.attachValidationError=function(e,t,n){if(typeof e==="function"){n=t;t=e;e=undefined}_.attachEvent(P.M_EVENTS.ValidationError,e,t,n);return this};P.prototype.detachValidationError=function(e,t){_.detachEvent(P.M_EVENTS.ValidationError,e,t);return this};P.prototype.attachParseError=function(e,t,n){if(typeof e==="function"){n=t;t=e;e=undefined}_.attachEvent(P.M_EVENTS.ParseError,e,t,n);return this};P.prototype.detachParseError=function(e,t){_.detachEvent(P.M_EVENTS.ParseError,e,t);return this};P.prototype.attachFormatError=function(e,t,n){if(typeof e==="function"){n=t;t=e;e=undefined}_.attachEvent(P.M_EVENTS.FormatError,e,t,n);return this};P.prototype.detachFormatError=function(e,t){_.detachEvent(P.M_EVENTS.FormatError,e,t);return this};P.prototype.attachValidationSuccess=function(e,t,n){if(typeof e==="function"){n=t;t=e;e=undefined}_.attachEvent(P.M_EVENTS.ValidationSuccess,e,t,n);return this};P.prototype.detachValidationSuccess=function(e,t){_.detachEvent(P.M_EVENTS.ValidationSuccess,e,t);return this};P.prototype.fireParseError=function(e){_.fireEvent(P.M_EVENTS.ParseError,e);return this};P.prototype.fireValidationError=function(e){_.fireEvent(P.M_EVENTS.ValidationError,e);return this};P.prototype.fireFormatError=function(e){_.fireEvent(P.M_EVENTS.FormatError,e);return this};P.prototype.fireValidationSuccess=function(e){_.fireEvent(P.M_EVENTS.ValidationSuccess,e);return this};P.prototype.isMobile=function(){return t.browser.mobile};P.prototype._getEventProvider=function(){return _};P.prototype.addPrerenderingTask=function(e,t){d.addPrerenderingTask(e,t)};P.prototype.destroy=function(){l.detachPreserveContent(this._preserveHandler);_.destroy();i.prototype.destroy.call(this)};sap.ui.setRoot=A;return(new P).getInterface()});