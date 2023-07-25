/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/base/util/ObjectPath","./ViewportBase","./ViewStateManager","./ViewportRenderer","./VisibilityMode","./RenderMode","./Scene","./Camera","sap/base/Log"],function(t,e,i,o,n,s,r,a,l){"use strict";var m=e.extend("sap.ui.vk.Viewport",{metadata:{library:"sap.ui.vk",designtime:"sap/ui/vk/designtime/Viewport.designtime"}});var p=m.getMetadata().getParent().getClass().prototype;m.prototype.init=function(){if(p.init){p.init.call(this)}this._implementation=null};m.prototype.exit=function(){this._destroyImplementation();if(p.exit){p.exit.call(this)}};m.prototype.getImplementation=function(){return this._implementation};m.prototype._destroyImplementation=function(){if(this._implementation){var t=this.removeAllContent();var e=this;t.forEach(function(t){e.addAggregation("content",t)});this.setAggregation("safeArea",this._implementation.getSafeArea());this._implementation.destroy();this._implementation=null}return this};m.prototype.getShowDebugInfo=function(){if(this._implementation){return this._implementation.getShowDebugInfo()}return p.getShowDebugInfo.call(this)};m.prototype.setShowDebugInfo=function(t){p.setShowDebugInfo.call(this,t);if(this._implementation){this._implementation.setShowDebugInfo(t)}return this};m.prototype.getAutoStartRendering=function(){if(this._implementation){return this._implementation.getAutoStartRendering()}return p.getAutoStartRendering.call(this)};m.prototype.setAutoStartRendering=function(t){p.setAutoStartRendering.call(this,t);if(this._implementation){this._implementation.setAutoStartRendering(t)}return this};m.prototype.getBackgroundColorTop=function(){if(this._implementation){return this._implementation.getBackgroundColorTop()}return p.getBackgroundColorTop.call(this)};m.prototype.setBackgroundColorTop=function(t){p.setBackgroundColorTop.call(this,t);if(this._implementation){this._implementation.setBackgroundColorTop(t)}return this};m.prototype.getBackgroundColorBottom=function(){if(this._implementation){return this._implementation.getBackgroundColorBottom()}return p.getBackgroundColorBottom.call(this)};m.prototype.setBackgroundColorBottom=function(t){p.setBackgroundColorBottom.call(this,t);if(this._implementation){this._implementation.setBackgroundColorBottom(t)}return this};m.prototype.setWidth=function(t){p.setWidth.call(this,t);if(this._implementation){this._implementation.setWidth(t)}return this};m.prototype.setHeight=function(t){p.setHeight.call(this,t);if(this._implementation){this._implementation.setHeight(t)}return this};m.prototype.setSelectionMode=function(t){this.setProperty("selectionMode",t,true);if(this._implementation){this._implementation.setProperty("selectionMode",t,true)}return this};m.prototype.getSelectionMode=function(){if(this._implementation){return this._implementation.getSelectionMode()}return p.getSelectionMode.call(this)};m.prototype.setSelectionDisplayMode=function(t){p.setSelectionDisplayMode.call(this,t);if(this._implementation){this._implementation.setSelectionDisplayMode(t)}return this};m.prototype.getSelectionDisplayMode=function(){if(this._implementation){return this._implementation.getSelectionDisplayMode()}return p.getSelectionDisplayMode.call(this)};m.prototype.setShowSelectionBoundingBoxes=function(t){p.setShowSelectionBoundingBoxes.call(this,t);if(this._implementation){this._implementation.setShowSelectionBoundingBoxes(t)}return this};m.prototype.getShowSelectionBoundingBoxes=function(){if(this._implementation){return this._implementation.getShowSelectionBoundingBoxes()}return p.getShowSelectionBoundingBoxes.call(this)};m.prototype.setShowSafeArea=function(t){p.setShowSafeArea.call(this,t);if(this._implementation){this._implementation.setShowSafeArea(t)}return this};m.prototype.getShowSafeArea=function(){if(this._implementation){return this._implementation.getShowSafeArea()}return p.getShowSafeArea.call(this)};m.prototype.setShowAllHotspots=function(t){p.setShowAllHotspots.call(this,t);if(this._implementation){this._implementation.setShowAllHotspots(t)}return this};m.prototype.getShowAllHotspots=function(){if(this._implementation){return this._implementation.getShowAllHotspots()}return p.getShowAllHotspots.call(this)};m.prototype.setDisableHotspotHovering=function(t){p.setDisableHotspotHovering.call(this,t);if(this._implementation){this._implementation.setDisableHotspotHovering(t)}return this};m.prototype.getDisableHotspotHovering=function(){if(this._implementation){return this._implementation.getDisableHotspotHovering()}return p.getDisableHotspotHovering.call(this)};m.prototype.setHotspotColorABGR=function(t){p.setHotspotColorABGR.call(this,t);if(this._implementation){this._implementation.setHotspotColorABGR(t)}return this};m.prototype.getHotspotColorABGR=function(){if(this._implementation){return this._implementation.getHotspotColorABGR()}return p.getHotspotColorABGR.call(this)};m.prototype.setHotspotColor=function(t){p.setHotspotColor.call(this,t);if(this._implementation){this._implementation.setHotspotColor(t)}return this};m.prototype.getHotspotColor=function(){if(this._implementation){return this._implementation.getHotspotColor()}return p.getHotspotColor.call(this)};m.prototype.setKeepOutputSize=function(t){if(this._implementation&&this._implementation.setKeepOutputSize){this._implementation.setKeepOutputSize(t)}else{this.setProperty("keepOutputSize",t)}};m.prototype.getKeepOutputSize=function(){if(this._implementation&&this._implementation.getKeepOutputSize){return this._implementation.getKeepOutputSize()}return this.getProperty("keepOutputSize")};m.prototype.setShowAllHotspotsTintColor=function(t){if(this._implementation&&this._implementation.setShowAllHotspotsTintColor){this._implementation.setShowAllHotspotsTintColor(t)}else{this.setProperty("showAllHotspotsTintColor",t)}};m.prototype.getShowAllHotspotsTintColor=function(t){if(this._implementation&&this._implementation.getShowAllHotspotsTintColor){this._implementation.getShowAllHotspotsTintColor(t)}else{this.getProperty("showAllHotspotsTintColor",t)}};m.prototype.setCamera=function(t){p.setCamera.call(this,t);if(this._implementation){this._implementation.setCamera(t);return this}return this};m.prototype.getCamera=function(){if(this._implementation){return this._implementation.getCamera()}return p.getCamera.call(this)};m.prototype.setShouldRenderFrame=function(){if(this._implementation){this._implementation.setShouldRenderFrame()}return this};m.prototype.shouldRenderFrame=function(){if(this._implementation){this._implementation.shouldRenderFrame()}};m.prototype.setRenderMode=function(t){if(this._implementation&&this._implementation.setRenderMode){this._implementation.setRenderMode(t)}return this};m.prototype.getRenderMode=function(){if(this._implementation&&this._implementation.getRenderMode){return this._implementation.getRenderMode()}return s.Default};m.prototype.setFreezeCamera=function(t){p.setFreezeCamera.call(this,t);if(this._implementation){this._implementation.setFreezeCamera(t)}return this};m.prototype.showHotspots=function(t,e,i){if(this._implementation&&this._implementation.showHotspots){this._implementation.showHotspots(t,e,i)}return this};m.prototype.addTool=function(t){this.addAssociation("tools",t);if(this._implementation){this._implementation.addTool(t)}};m.prototype.removeTool=function(t){this.removeAssociation("tools",t);if(this._implementation){this._implementation.removeTool(t)}};m.prototype.getTools=function(){if(this._implementation){return this._implementation.getTools()}return this.getAssociation("tools",[])};m.prototype.removeAllTools=function(){this.removeAllAssociation("tools");if(this._implementation){this._implementation.removeAllTools()}};m.prototype.addContent=function(t){if(this._implementation){this._implementation.addContent(t)}else{this.addAggregation("content",t)}};m.prototype.removeContent=function(t){if(this._implementation){return this._implementation.removeContent(t)}return this.removeAggregation("content",t)};m.prototype.getContent=function(){if(this._implementation){return this._implementation.getContent()}return this.getAggregation("content")};m.prototype.removeAllContent=function(){if(this._implementation){return this._implementation.removeAllContent()}return this.removeAggregation("content")};m.prototype.setOutputSettings=function(t){if(this._implementation&&this._implementation.setOutputSettings){this._implementation.setOutputSettings(t)}else{this.setAggregation("outputSettings",t)}};m.prototype.getOutputSettings=function(){if(this._implementation&&this._implementation.getOutputSettings){return this._implementation.getOutputSettings()}return this.getAggregation("outputSettings")};m.prototype.removeOutputSettings=function(){if(this._implementation){return this._implementation.removeAggregation("outputSettings")}return this.removeAggregation("outputSettings")};m.prototype.setSafeArea=function(t){if(this._implementation){this._implementation.setSafeArea(t)}else{this.setAggregation("safeArea",t)}};m.prototype.getSafeArea=function(){if(this._implementation){return this._implementation.getSafeArea()}return this.getAggregation("safeArea")};m.prototype.removeSafeArea=function(){if(this._implementation){return this._implementation.removeAggregation("safeArea")}return this.removeAggregation("safeArea")};m.prototype.addAnnotation=function(t){if(this._implementation){this._implementation.addAnnotation(t)}else{this.addAggregation("annotations",t)}};m.prototype.destroyAnnotations=function(){if(this._implementation){return this._implementation.destroyAnnotations()}return this.destroyAggregation("annotations")};m.prototype.getAnnotations=function(){if(this._implementation){return this._implementation.getAnnotations()}return this.getAggregation("annotations")};m.prototype.getSymbolNodes=function(t){if(this._implementation&&this._implementation.getSymbolNodes){return this._implementation.getSymbolNodes(t)}return[]};m.prototype.indexOfAnnotation=function(t){if(this._implementation){return this._implementation.indexOfAnnotation(t)}return this.indexOfAggregation("annotations",t)};m.prototype.removeAllAnnotations=function(){if(this._implementation){return this._implementation.removeAllAnnotations()}return this.removeAggregation("annotations")};m.prototype.removeAnnotation=function(t){if(this._implementation){return this._implementation.removeAnnotation(t)}return this.removeAggregation("annotations",t)};m.prototype.insertAnnotation=function(t,e){if(this._implementation){return this._implementation.insertAnnotation(t,e)}return this.insertAggregation("annotations",t,e)};m.prototype.getCurrentView=function(){if(this._implementation&&this._implementation.getCurrentView){return this._implementation.getCurrentView()}return null};m.prototype.pan=function(t,e){if(this._implementation&&this._implementation.pan){this._implementation.pan(t,e)}};m.prototype.rotate=function(t,e){if(this._implementation&&this._implementation.rotate){this._implementation.rotate(t,e)}};m.prototype.zoom=function(t){if(this._implementation&&this._implementation.zoom){this._implementation.zoom(t)}};m.prototype._setContent=function(t){p._setContent.apply(this,arguments);if(t instanceof HTMLImageElement||t instanceof HTMLObjectElement){this._setImage(t);return this}var e=null;var i=null;if(t){e=t;if(!(e instanceof r)){e=null}i=t.camera;if(!(i instanceof a)){i=null}}this._setScene(e);if(i){this.setCamera(i)}return this};m.prototype._setImage=function(e){var i="sap.ui.vk.NativeViewport";if(!this._implementation||this._implementation.getMetadata().getName()!==i){this._destroyImplementation();var o=t.get(i);this._implementation=new o({tools:this.getAssociation("tools"),content:this.getContent(),contentConnector:this.getAssociation("contentConnector")});this._implementation.setParent(this);this.invalidate()}return this};m.prototype._setScene=function(e){if(e instanceof r){var i=e.getMetadata().getName(),o=this._implementation&&this._implementation.getMetadata().getName(),n=i==="sap.ui.vk.dvl.Scene"&&o==="sap.ui.vk.dvl.Viewport"||i==="sap.ui.vk.threejs.Scene"&&o==="sap.ui.vk.threejs.Viewport"||i==="sap.ui.vk.svg.Scene"&&o==="sap.ui.vk.svg.Viewport";if(!n){this._destroyImplementation();var s;var a=this.getCamera();if(i==="sap.ui.vk.dvl.Scene"){s="sap.ui.vk.dvl.Viewport"}else if(i==="sap.ui.vk.threejs.Scene"){s="sap.ui.vk.threejs.Viewport"}else if(i==="sap.ui.vk.svg.Scene"){s="sap.ui.vk.svg.Viewport"}if(s){var l=t.get(s);this._implementation=new l({viewStateManager:this.getViewStateManager(),tools:this.getAssociation("tools"),content:this.getContent(),outputSettings:this.getOutputSettings(),safeArea:this.getSafeArea(),showSafeArea:this.getShowSafeArea(),showAllHotspots:this.getShowAllHotspots(),showAllHotspotsTintColor:this.getShowAllHotspotsTintColor(),disableHotspotHovering:this.getDisableHotspotHovering(),hotspotColorABGR:this.getHotspotColorABGR(),keepOutputSize:this.getKeepOutputSize(),showDebugInfo:this.getShowDebugInfo(),width:this.getWidth(),height:this.getHeight(),backgroundColorTop:this.getBackgroundColorTop(),backgroundColorBottom:this.getBackgroundColorBottom(),selectionMode:this.getSelectionMode(),selectionDisplayMode:this.getSelectionDisplayMode(),showSelectionBoundingBoxes:this.getShowSelectionBoundingBoxes(),freezeCamera:this.getFreezeCamera(),renderMode:this.getRenderMode(),autoStartRendering:this.getAutoStartRendering()});this._implementation.setContentConnector(this.getContentConnector());var m=this.getAggregation("annotations");if(m){m.forEach(function(t){this.removeAggregation("annotations",t);this._implementation.addAnnotation(t)},this)}if(a){this._camera=null;this._implementation.setCamera(a)}this._implementation.setParent(this)}this.invalidate()}}else{this._destroyImplementation();this.invalidate()}return this};m.prototype.onSetViewStateManager=function(t){if(this._implementation){this._implementation.setViewStateManager(t)}};m.prototype.onUnsetViewStateManager=function(t){if(this._implementation){this._implementation.setViewStateManager(null)}};m.prototype.activateView=function(t,e,i){if(this._implementation){this._implementation.activateView(t,e,i);return this}else{l.error("no implementation");return this}};m.prototype.resetCurrentView=function(){if(this._implementation&&this._implementation.resetCurrentView){this._implementation.resetCurrentView();return this}else{l.error("no implementation");return this}};m.prototype.zoomTo=function(t,e,i,o){if(this._implementation){this._implementation.zoomTo(t,e,i,o)}else{l.error("zoomTo: no implementation")}return this};m.prototype.tap=function(t,e,i){if(this._implementation){this._implementation.tap(t,e,i)}return this};m.prototype.tapObject=function(t){if(this._implementation&&this._implementation.tapObject){this._implementation.tapObject(t)}return this};var h=function(t){t.camera={}};var u=function(t){if(typeof t.camera==="object"&&t.camera!==null){t.camera.matrices=false}};var f=function(t){if(typeof t.camera==="object"&&t.camera!==null){t.camera.useTransitionCamera=false}};var g=function(t){t.animation=true};var c=function(t){t.visibility=false};var _=function(t){if(typeof t.visibility==="object"&&t.visibility!==null){t.visibility.mode=n.Complete}};var d=function(t){t.selection=false};m.prototype.getViewInfo=function(t){if(!this._implementation){l.error("no implementation");return null}var e={};if(typeof t!=="object"||t===null){h(e);u(e);f(e);g(e);c(e);_(e);d(e)}else{if(typeof t.camera==="object"&&t.camera!==null){e.camera={};if(typeof t.camera.matrices==="boolean"){e.camera.matrices=t.camera.matrices}else if("matrices"in t.camera){e.camera.matrices=false}else{u(e)}if(typeof t.camera.useTransitionCamera==="boolean"){e.camera.useTransitionCamera=t.camera.useTransitionCamera}else if("useTransitionCamera"in t.camera){e.camera.useTransitionCamera=false}else{f(e)}}else if(typeof t.camera==="boolean"){if(t.camera===true){e.camera={};u(e);f(e)}else{e.camera=false}}else if("camera"in t){e.camera=false}else{h(e);u(e);f(e)}if(typeof t.animation==="boolean"){e.animation=t.animation}else if("animation"in t){e.animation=false}else{g(e)}if(typeof t.visibility==="object"&&t.visibility!==null){e.visibility={};if(t.visibility.mode===n.Complete||t.visibility.mode===n.Differences){e.visibility.mode=t.visibility.mode}else{_(e)}}else if(typeof t.visibility==="boolean"){if(t.visibility===true){e.visibility={};_(e)}else{e.visibility=false}}else if("visibility"in t){e.visibility=false}else{c(e);_(e)}if(typeof t.selection==="boolean"){e.selection=t.selection}else if("selection"in t){e.selection=false}else{d(e)}}return this._implementation.getViewInfo(e)};m.prototype.setViewInfo=function(t,e){if(this._implementation){this._implementation.setViewInfo(t,e)}else{l.error("no implementation")}return this};m.prototype.getImage=function(t,e,i,o,n){if(this._implementation&&this._implementation.getImage){return this._implementation.getImage(t,e,i,o,n)}return null};m.prototype.projectToScreen=function(t,e,i,o){if(this._implementation&&this._implementation.projectToScreen){return this._implementation.projectToScreen(t,e,i,o)}return p.projectToScreen(t,e,i,o)};m.prototype.normalizeRectangle=function(t,e,i,o){if(this._implementation&&this._implementation.normalizeRectangle){return this._implementation.normalizeRectangle(t,e,i,o)}return p.normalizeRectangle(t,e,i,o)};m.prototype.deNormalizeRectangle=function(t,e,i,o){if(this._implementation&&this._implementation.deNormalizeRectangle){return this._implementation.deNormalizeRectangle(t,e,i,o)}return p.deNormalizeRectangle(t,e,i,o)};m.prototype.getMeasurementSurface=function(){var t=this._implementation;return t==null?null:t.getMeasurementSurface()};m.prototype.getShowAllHotspotsTintColorDef=function(){if(this._implementation&&this._implementation.getShowAllHotspotsTintColorDef){return this._implementation.getShowAllHotspotsTintColorDef()}return this};return m});