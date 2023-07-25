/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/base/ManagedObject","sap/ui/core/Core","sap/ui/integration/util/BindingResolver"],function(e,t,i){"use strict";var n=e.extend("sap.ui.integration.cards.actions.BaseAction",{metadata:{library:"sap.ui.integration",properties:{config:{type:"object"},parameters:{type:"object"},actionHandler:{type:"object"}},associations:{card:{type:"sap.ui.integration.widgets.Card",multiple:false},source:{type:"sap.ui.base.EventProvider",multiple:false}}}});n.prototype.execute=function(){};n.prototype.getResolvedConfig=function(){var e=this.getSourceInstance(),t=e.getBindingContext(),n;if(t){n=e.getBindingContext().getPath()}return i.resolveValue(this.getConfig(),e,n)};n.prototype.getCardInstance=function(){return t.byId(this.getCard())};n.prototype.getSourceInstance=function(){return t.byId(this.getSource())};return n});