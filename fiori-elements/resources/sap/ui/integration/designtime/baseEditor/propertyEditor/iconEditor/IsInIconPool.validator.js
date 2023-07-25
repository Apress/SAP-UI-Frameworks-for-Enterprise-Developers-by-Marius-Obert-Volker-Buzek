/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/integration/designtime/baseEditor/validator/IsValidBinding","sap/base/util/restricted/_isNil","sap/ui/core/IconPool"],function(i,e,a){"use strict";return{async:false,errorMessage:"BASE_EDITOR.VALIDATOR.NOT_AN_ICON",validate:function(n){return e(n)||typeof n==="string"&&a.isIconURI(n)&&!!a.getIconInfo(n)||i.validate(n,{allowPlainStrings:false})}}});