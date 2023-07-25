/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./library","sap/ui/core/Element"],function(e,a){"use strict";var r=a.extend("sap.ui.commons.ToolbarSeparator",{metadata:{interfaces:["sap.ui.commons.ToolbarItem"],library:"sap.ui.commons",deprecated:true,properties:{displayVisualSeparator:{type:"boolean",group:"Appearance",defaultValue:true},design:{type:"sap.ui.commons.ToolbarSeparatorDesign",group:"Misc",defaultValue:null}}}});r.prototype.getFocusDomRef=function(){return undefined};return r});