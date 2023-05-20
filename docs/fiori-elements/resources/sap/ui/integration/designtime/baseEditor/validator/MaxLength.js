/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/integration/designtime/baseEditor/validator/IsValidBinding","sap/base/util/restricted/_isNil"],function(e,i){"use strict";return{async:false,errorMessage:{message:"BASE_EDITOR.VALIDATOR.MAX_LENGTH",placeholders:function(e){return[e.maxLength]}},validate:function(t,a){return i(t)||typeof t==="string"&&t.length<=a.maxLength||e.validate(t,{allowPlainStrings:false})}}});