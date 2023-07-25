/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/mdc/filterbar/IFilterContainer","sap/ui/layout/AlignedFlowLayout"],function(t,e){"use strict";var o=t.extend("sap.ui.mdc.filterbar.aligned.FilterContainer");o.prototype.init=function(){t.prototype.init.apply(this,arguments);this.oLayout=new e};o.prototype.addButton=function(t){this.oLayout.addEndContent(t)};o.prototype.insertFilterField=function(t,e){this.oLayout.insertContent(t,e)};o.prototype.removeFilterField=function(t){this.oLayout.removeContent(t)};o.prototype.getFilterFields=function(){return this.oLayout.getContent()};return o});