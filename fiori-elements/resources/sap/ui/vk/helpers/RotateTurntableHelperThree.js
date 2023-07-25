/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/base/EventProvider"],function(t){"use strict";var e=t.extend("sap.ui.vk.helpers.RotateTurntableHelperThree",{metadata:{library:"sap.ui.vk",publicMethods:["rotate"]},constructor:function(t){this._tool=t}});e.prototype.destroy=function(){this._tool=null};e.prototype.activateTurntableMode=function(){this._tool._viewport._viewportGestureHandler._cameraController.isTurnTableMode=true;return this};e.prototype.deactivateTurntableMode=function(){this._tool._viewport._viewportGestureHandler._cameraController.isTurnTableMode=false;return this};e.prototype.rotate=function(t,e){this._tool._viewport._viewportGestureHandler._cameraController.rotate(t,e,true);this._tool.fireRotate({dx:t,dy:e});return this};return e});