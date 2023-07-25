/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/integration/editor/fields/BaseField","sap/ui/core/ListItem","sap/m/ComboBox","sap/ui/model/Sorter"],function(t,e,i,a){"use strict";var n=t.extend("sap.ui.integration.editor.fields.DestinationField",{metadata:{library:"sap.ui.integration"},renderer:t.getMetadata().getRenderer()});n.prototype.initVisualization=function(t){var n=t.visualization;if(!n){n={type:i,settings:{busy:{path:"destinations>_loading"},selectedKey:{path:"currentSettings>value"},width:"100%",items:{path:"destinations>_values",template:new e({text:"{destinations>name}",key:"{destinations>name}"}),sorter:[new a({path:"name"})]}}}}this._visualization=n};return n});