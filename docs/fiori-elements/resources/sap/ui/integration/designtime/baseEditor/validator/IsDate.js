/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/integration/designtime/baseEditor/validator/IsValidBinding"],function(e){"use strict";return{async:false,errorMessage:"BASE_EDITOR.VALIDATOR.INVALID_DATE",validate:function(a,i){var n=i.formatterInstance;var t=n&&n.parse(a)||new Date(a);return a===undefined||e.validate(a,{allowPlainStrings:false})||t&&!isNaN(new Date(t).getTime())}}});