/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/apply/_internal/flexObjects/FlexObject"],function(e){"use strict";var t=e.extend("sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange",{metadata:{properties:{appDescriptorChange:{type:"boolean",defaultValue:true}}}});t.getMappingInfo=function(){return Object.assign(e.getMappingInfo(),{appDescriptorChange:"appDescriptorChange"})};t.prototype.getMappingInfo=function(){return t.getMappingInfo()};t.prototype.getSelector=function(){return{}};t.prototype.isValidForDependencyMap=function(){return false};t.prototype.getVariantReference=function(){return undefined};return t});