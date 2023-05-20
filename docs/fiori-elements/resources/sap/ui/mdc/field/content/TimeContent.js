/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/mdc/field/content/DefaultContent","sap/ui/mdc/field/content/DateContent"],function(t,e){"use strict";var n=Object.assign({},e,{getEditOperator:function(){return{EQ:{name:"sap/m/TimePicker",create:this._createDatePickerControl}}},getEdit:function(){return t.getEdit.apply(this,arguments)},createEditMultiLine:function(){throw new Error("sap.ui.mdc.field.content.TimeContent - createEditMultiLine not defined!")},createEdit:function(e,n,i){return t.createEdit.apply(this,arguments)}});return n});