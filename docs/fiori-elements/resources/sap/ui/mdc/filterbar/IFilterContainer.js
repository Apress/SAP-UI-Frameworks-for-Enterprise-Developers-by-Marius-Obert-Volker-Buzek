/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Element"],function(t){"use strict";var o=t.extend("sap.ui.mdc.filterbar.IFilterContainer");o.prototype.init=function(){t.prototype.init.apply(this,arguments);this.oLayout=null};o.prototype.getInner=function(){return this.oLayout};o.prototype.insertFilterField=function(t,o){};o.prototype.removeFilterField=function(t){};o.prototype.getFilterFields=function(){};o.prototype.exit=function(){t.prototype.exit.apply(this,arguments);if(this.oLayout){this.oLayout.destroy();this.oLayout=null}};return o});