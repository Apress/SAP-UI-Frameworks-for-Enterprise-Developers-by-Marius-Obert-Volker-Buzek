/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/integration/editor/fields/BaseField","sap/m/Input"],function(t,e){"use strict";var i=t.extend("sap.ui.integration.editor.fields.NumberField",{metadata:{library:"sap.ui.integration"},renderer:t.getMetadata().getRenderer()});i.prototype.initVisualization=function(t){var i=t.visualization;var a=t.formatter;if(!i){i={type:e,settings:{value:{path:"currentSettings>value",type:"sap.ui.model.type.Float",formatOptions:a},editable:t.editable,type:"Number"}}}this._visualization=i};return i});