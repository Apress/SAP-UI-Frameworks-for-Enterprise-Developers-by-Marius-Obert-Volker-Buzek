/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["../util/PropertyHelper"],function(e){"use strict";var t=e.extend("sap.ui.mdc.filterbar.PropertyHelper",{constructor:function(t,r){e.call(this,t,r,{required:{type:"boolean"},hiddenFilter:{type:"boolean"}})}});t.prototype.prepareProperty=function(t){if(!t.typeConfig){var r=this.getParent();if(r&&r._oDelegate){var p=r._oDelegate.getTypeUtil();try{t.typeConfig=p.getTypeConfig(t.dataType,t.formatOptions,t.constraints)}catch(e){}}}e.prototype.prepareProperty.apply(this,arguments)};return t});