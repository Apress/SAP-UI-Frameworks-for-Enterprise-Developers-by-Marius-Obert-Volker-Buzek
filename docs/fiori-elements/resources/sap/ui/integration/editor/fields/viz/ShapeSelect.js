/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/integration/editor/fields/viz/VizBase","sap/m/SegmentedButton","sap/m/SegmentedButtonItem","sap/base/util/merge"],function(e,t,i,n){"use strict";var o=e.extend("sap.ui.integration.editor.fields.viz.ShapeSelect",{metadata:{library:"sap.ui.integration",properties:{value:{type:"string",defaultValue:"Circle"}}},renderer:{apiVersion:2}});o.prototype.onInit=function(){this._oControl=new t({items:[new i({icon:"sap-icon://circle-task",key:"Circle"}),new i({icon:"sap-icon://border",key:"Square"})]})};o.prototype.applyStyle=function(e){e.class("sapUiIntegrationShapeSelect")};o.prototype.bindPropertyToControl=function(e,t){if(e==="editable"){var i=n({},t);this._oControl.bindProperty("enabled",i)}if(e==="value"){var i=n({},t);this._oControl.bindProperty("selectedKey",i)}};return o});