/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/model/ValidateException"],function(t){"use strict";var o=function(o,i,n,e){t.call(this,o,i);this.condition=n;this.conditions=e};o.prototype=Object.create(t.prototype);o.prototype.getCondition=function(){return this.condition};o.prototype.setCondition=function(t){this.condition=t};o.prototype.getConditions=function(){return this.conditions};o.prototype.setConditions=function(t){this.conditions=t};return o},true);