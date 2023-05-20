/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./BaseAction"],function(t){"use strict";var i=t.extend("sap.ui.integration.cards.actions.CustomAction",{metadata:{library:"sap.ui.integration"}});i.prototype.execute=function(){var t=this.getConfig();if(typeof t.action==="function"){t.action(this.getCardInstance(),this.getSourceInstance())}};return i});