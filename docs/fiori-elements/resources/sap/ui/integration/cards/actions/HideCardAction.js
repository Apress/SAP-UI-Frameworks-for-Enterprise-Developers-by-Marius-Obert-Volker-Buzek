/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./BaseAction","sap/m/Dialog"],function(t,e){"use strict";var a=t.extend("sap.ui.integration.cards.actions.HideCardAction",{metadata:{library:"sap.ui.integration"}});a.prototype.execute=function(){var t=this.getCardInstance(),a=t.getParent(),n=t.getHostInstance();if(n&&n.onHideCard){n.onHideCard(t);return}if(a instanceof e){a.close();a.attachAfterClose(function(){t.destroy()})}else{t.destroy()}};return a});