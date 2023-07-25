/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/comp/library","sap/ui/core/Element","sap/ui/model/FilterOperator"],function(e,t,r){"use strict";var i=t.extend("sap.ui.comp.smartfilterbar.SelectOption",{metadata:{library:"sap.ui.comp",properties:{sign:{type:"sap.ui.comp.smartfilterbar.SelectOptionSign",group:"Misc",defaultValue:"I"},operator:{type:"sap.ui.model.FilterOperator",group:"Misc",defaultValue:"EQ"},low:{type:"string",group:"Misc",defaultValue:null},high:{type:"string",group:"Misc",defaultValue:null}}}});i.SIGN=e.smartfilterbar.SelectOptionSign;i.OPERATOR=r;return i});