/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Control","sap/ui/mdc/mixin/DelegateMixin","sap/ui/mdc/mixin/PropertyHelperMixin","sap/ui/mdc/mixin/AdaptationMixin"],function(e,i,r,t){"use strict";var a=e.extend("sap.ui.mdc.Control",{metadata:{library:"sap.ui.mdc",properties:{delegate:{type:"object",group:"Data"}}},renderer:e.renderer});i.call(a.prototype);t.call(a.prototype);r.call(a.prototype);return a});