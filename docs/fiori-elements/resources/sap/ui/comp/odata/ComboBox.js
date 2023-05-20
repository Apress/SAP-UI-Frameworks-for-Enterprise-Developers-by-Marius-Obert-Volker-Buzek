/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/m/ComboBox","sap/m/ComboBoxRenderer","sap/ui/comp/util/ComboBoxUtils"],function(e,t,r){"use strict";var o=e.extend("sap.ui.comp.odata.ComboBox",{metadata:{library:"sap.ui.comp",interfaces:["sap.ui.comp.IDropDownTextArrangement"],properties:{textArrangement:{type:"string",group:"Misc",defaultValue:""}}},renderer:t});o.prototype.onBeforeRendering=function(){e.prototype.onBeforeRendering.apply(this,arguments);this._processTextArrangement()};o.prototype._processTextArrangement=function(){var e,t=this.getSelectedKey(),o=this.getItemByKey(""+t),n=this.getTextArrangement();if(!n||o===null){return}e=r.formatDisplayBehaviour(o,n);if(e){this.setValue(e)}};return o});