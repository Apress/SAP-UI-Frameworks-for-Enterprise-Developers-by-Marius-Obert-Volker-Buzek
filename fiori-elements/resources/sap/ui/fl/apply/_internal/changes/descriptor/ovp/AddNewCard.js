/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";var r={applyChange:function(r,e){var n=e.getContent();var a=r["sap.ovp"].cards;if("card"in n&&Object.keys(n.card).length>0&&!(Object.keys(n.card)in a)){Object.assign(a,n.card)}else{throw Error("No new card found")}return r}};return r});