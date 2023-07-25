/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/apply/_internal/flexObjects/UIChange"],function(e){"use strict";var t=e.extend("sap.ui.fl.apply._internal.flexObjects.UpdatableChange",{metadata:{aggregations:{revertInfo:{type:"sap.ui.base.ManagedObject",multiple:true,singularName:"revertInfo"}}}});t.getMappingInfo=function(){return Object.assign(e.getMappingInfo(),{})};t.prototype.popLatestRevertInfo=function(){var e=this.getRevertInfo().pop();this.removeRevertInfo(e);return e};return t});