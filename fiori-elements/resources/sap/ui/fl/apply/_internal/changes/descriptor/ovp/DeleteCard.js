/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";var e={applyChange:function(e,r){var t=r.getContent();var n=e["sap.ovp"].cards;if(t.cardId in n){delete n[t.cardId]}else{throw Error("The card to be deleted was not found")}return e}};return e});