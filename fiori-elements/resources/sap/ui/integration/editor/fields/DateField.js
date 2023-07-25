/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/integration/editor/fields/BaseField","sap/m/DatePicker"],function(e,t){"use strict";var a=e.extend("sap.ui.integration.editor.fields.DateField",{metadata:{library:"sap.ui.integration"},renderer:e.getMetadata().getRenderer()});a.prototype.initVisualization=function(e){var a=e.visualization;var i=e.formatter;if(e.value!==""){e.value=new Date(e.value)}if(!a){a={type:t,settings:{value:{path:"currentSettings>value",type:"sap.ui.model.type.Date",formatOptions:i},editable:e.editable,width:"100%",change:function(e){if(e.getParameters().valid){var t=e.getSource();t.getBinding("value").setValue(t.getDateValue());t.getBinding("value").checkUpdate()}else{var t=e.getSource();t.getBinding("value").setValue("")}}}}}this._visualization=a};return a});