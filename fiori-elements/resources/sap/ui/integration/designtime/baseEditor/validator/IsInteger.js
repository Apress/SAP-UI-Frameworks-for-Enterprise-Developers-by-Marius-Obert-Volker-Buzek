/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/integration/designtime/baseEditor/validator/IsValidBinding"],function(i){"use strict";return{async:false,errorMessage:"BASE_EDITOR.VALIDATOR.NOT_AN_INTEGER",validate:function(e){return e===undefined||i.validate(e,{allowPlainStrings:false})||!isNaN(e)&&Number.isInteger(e)}}});