/*
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/comp/smartfield/type/TextArrangement","sap/ui/comp/smartfield/type/String","sap/ui/model/ValidateException"],function(t,e,r){"use strict";var i=t.extend("sap.ui.comp.smartfield.type.TextArrangementString");i.prototype.getName=function(){return"sap.ui.comp.smartfield.type.TextArrangementString"};i.prototype.validateValue=function(e){var i=this.oConstraints||{},n=i.maxLength,a=e[0];if(this.oFormatOptions.textArrangement==="descriptionOnly"&&(a&&a.length>n)){throw new r(sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("ENTER_A_VALID_VALUE"))}else{return t.prototype.validateValue.apply(this,arguments)}};i.prototype.getPrimaryType=function(){return e};return i});