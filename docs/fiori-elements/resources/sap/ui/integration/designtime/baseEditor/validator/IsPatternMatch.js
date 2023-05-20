/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/integration/designtime/baseEditor/validator/IsValidBinding"],function(e){"use strict";return{async:false,errorMessage:"BASE_EDITOR.VALIDATOR.FAILED_PATTERN_TEST",validate:function(a,i){var t=i.modifiers||"";var r=new RegExp(i.pattern,t);var n=i.exactMatch!==false;if(a===undefined){return true}var s;if(n){var d=a.match(r);s=d&&a===d[0]}else{s=r.test(a)}return s||e.validate(a,{allowPlainStrings:false})}}});