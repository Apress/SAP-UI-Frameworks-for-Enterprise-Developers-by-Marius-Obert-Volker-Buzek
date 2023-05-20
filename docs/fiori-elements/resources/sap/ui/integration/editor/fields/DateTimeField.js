/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/integration/editor/fields/BaseField","sap/m/DateTimePicker"],function(e,t){"use strict";var i=e.extend("sap.ui.integration.editor.fields.DateTimeField",{metadata:{library:"sap.ui.integration"},renderer:e.getMetadata().getRenderer()});i.prototype.initVisualization=function(e){var i=e.visualization;var a=e.formatter;if(e.value!==""){e.value=new Date(e.value)}if(!i){i={type:t,settings:{value:{path:"currentSettings>value",type:"sap.ui.model.type.DateTime",formatOptions:a},editable:e.editable,width:"100%",change:function(e){if(e.getParameters().valid){var t=e.getSource();t.getBinding("value").setValue(t.getDateValue().toISOString());t.getBinding("value").checkUpdate()}else{var t=e.getSource();t.getBinding("value").setValue("");t.getBinding("value").checkUpdate(true)}}}}}this._visualization=i};return i});