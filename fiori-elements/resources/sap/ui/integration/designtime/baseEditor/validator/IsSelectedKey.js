/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/integration/designtime/baseEditor/validator/IsValidBinding"],function(e){"use strict";return{async:false,errorMessage:"BASE_EDITOR.VALIDATOR.FORBIDDEN_CUSTOM_VALUE",validate:function(i,a){if(Array.isArray(i)){var n=true;if(i.length>0){for(var r=0;r<i.length;r++){if(!(i[r]===undefined||(a.keys||[]).includes(i[r])||e.validate(i[r],{allowPlainStrings:false}))){n=false;break}}}return n}else{return i===undefined||(a.keys||[]).includes(i)||e.validate(i,{allowPlainStrings:false})}}}});