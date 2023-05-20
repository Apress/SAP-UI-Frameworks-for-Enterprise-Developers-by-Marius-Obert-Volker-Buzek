/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";return{async:false,errorMessage:"BASE_EDITOR.VALIDATOR.DUPLICATE_KEY",validate:function(e,n){return n.currentKey===undefined||!n.keys.includes(e)||e===undefined||e===n.currentKey}}});