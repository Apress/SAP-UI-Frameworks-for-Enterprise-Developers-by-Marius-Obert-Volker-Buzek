/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/base/EventProvider"],function(e){"use strict";var t=e.extend("sap.ui.vk.helpers.RotateOrbitHelperDvl",{metadata:{library:"sap.ui.vk",publicMethods:["rotate"]},constructor:function(e,t){this._tool=e;this._dvl=t;this._dvlRendererId=this._tool._viewport._dvlRendererId}});t.prototype.destroy=function(){this._rotateOrbitTool=null};t.prototype.activateOrbitMode=function(){if(this._dvlRendererId){this._dvl.Renderer.SetOption(sap.ve.dvl.DVLRENDEROPTION.DVLRENDEROPTION_CAMERA_ROTATION_MODE_ORBIT,true)}return this};t.prototype.deactivateOrbitMode=function(){if(this._dvlRendererId){this._dvl.Renderer.SetOption(sap.ve.dvl.DVLRENDEROPTION.DVLRENDEROPTION_CAMERA_ROTATION_MODE_ORBIT,false)}return this};t.prototype.rotate=function(e,t){if(this._dvlRendererId){this._dvl.Renderer.Rotate(e*window.devicePixelRatio,t*window.devicePixelRatio,this._dvlRendererId);this._tool.fireRotate({dx:e,dy:t})}return this};return t});