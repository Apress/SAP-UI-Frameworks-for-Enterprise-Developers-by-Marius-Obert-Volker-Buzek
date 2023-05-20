/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/integration/editor/fields/BaseField","sap/m/CheckBox"],function(e,t){"use strict";var i=e.extend("sap.ui.integration.editor.fields.BooleanField",{metadata:{library:"sap.ui.integration"},renderer:e.getMetadata().getRenderer()});i.prototype.initVisualization=function(e){var i=e.visualization;if(!i){i={type:t,settings:{selected:{path:"currentSettings>value"},editable:e.editable}};e.withLabel=true}else if(i.type==="Switch"){i.type="sap/m/Switch"}this._visualization=i};return i});