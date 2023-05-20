/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["./AnimationTrackValueType"],function(e){"use strict";var r={};r.get=function(r){switch(r){case e.Vector3:return 3;case e.AngleAxis:return 4;case e.Quaternion:return 4;case e.Euler:return 4;default:return 1}};return r},true);