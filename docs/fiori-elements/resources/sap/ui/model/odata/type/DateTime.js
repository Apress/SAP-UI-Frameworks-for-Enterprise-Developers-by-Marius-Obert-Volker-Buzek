/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/Log","sap/ui/core/date/UI5Date","sap/ui/model/odata/type/DateTimeBase"],function(e,t,a){"use strict";function i(t,a){var i={};if(a){switch(a.displayFormat){case"Date":i.isDateOnly=true;break;case undefined:break;default:e.warning("Illegal displayFormat: "+a.displayFormat,null,t.getName())}i.nullable=a.nullable}return i}var n=a.extend("sap.ui.model.odata.type.DateTime",{constructor:function(e,t){a.call(this,e,i(this,t))}});n.prototype.getConstraints=function(){var e=a.prototype.getConstraints.call(this);if(e.isDateOnly){e.displayFormat="Date";delete e.isDateOnly}return e};n.prototype.getName=function(){return"sap.ui.model.odata.type.DateTime"};n.prototype.getModelValue=function(e){var t=this._getModelValue(e);this.validateValue(t);return t};return n});