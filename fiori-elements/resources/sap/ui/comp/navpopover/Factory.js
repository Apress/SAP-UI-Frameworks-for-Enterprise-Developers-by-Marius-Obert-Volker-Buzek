/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/comp/library"],function(e){"use strict";var a={getService:function(e){switch(e){case"CrossApplicationNavigation":return sap.ushell&&sap.ushell.Container&&sap.ushell.Container.getService("CrossApplicationNavigation");case"URLParsing":return sap.ushell&&sap.ushell.Container&&sap.ushell.Container.getService("URLParsing");default:return null}}};return a},true);