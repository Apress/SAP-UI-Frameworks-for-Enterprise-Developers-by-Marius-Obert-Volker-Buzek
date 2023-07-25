/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/integration/designtime/baseEditor/validator/IsValidBinding"],function(i){"use strict";return{async:false,errorMessage:"BASE_EDITOR.VALIDATOR.NOT_A_NUMBER",validate:function(a){return a===undefined||i.validate(a,{allowPlainStrings:false})||!isNaN(a)}}});