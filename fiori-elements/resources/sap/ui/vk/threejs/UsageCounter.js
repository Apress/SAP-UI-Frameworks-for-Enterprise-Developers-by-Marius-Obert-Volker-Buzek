/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["../thirdparty/three"],function(e){"use strict";var r=function(){};r.increaseMaterialUsed=function(e){if(e&&e.userData&&e.userData.materialUsed!==undefined){e.userData.materialUsed++;return true}return false};r.decreaseMaterialUsed=function(e){if(e&&e.userData&&e.userData.materialUsed!==undefined){e.userData.materialUsed--;return true}return false};r.increaseGeometryUsed=function(e){if(e&&e.userData&&e.userData.geometryUsed!==undefined){e.userData.geometryUsed++;return true}return false};r.decreaseGeometryUsed=function(e){if(e&&e.userData&&e.userData.geometryUsed!==undefined){e.userData.geometryUsed--;return true}return false};return r});