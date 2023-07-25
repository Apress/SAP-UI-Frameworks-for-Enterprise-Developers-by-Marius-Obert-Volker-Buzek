/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";return{getService:function(e){switch(e){case"CrossApplicationNavigation":return sap.ushell&&sap.ushell.Container&&sap.ushell.Container.getService("CrossApplicationNavigation");case"URLParsing":return sap.ushell&&sap.ushell.Container&&sap.ushell.Container.getService("URLParsing");default:return null}}}});