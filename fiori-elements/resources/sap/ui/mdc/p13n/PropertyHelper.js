/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["../util/PropertyHelper"],function(e){"use strict";var r=e.extend("sap.ui.mdc.p13n.PropertyHelper",{constructor:function(r,t){e.call(this,r,t,{filterable:true,sortable:true})}});r.prototype.validateProperties=function(){};r.prototype.prepareProperty=function(r){e.prototype.prepareProperty.apply(this,arguments);r.label=r.label||r.name};return r});