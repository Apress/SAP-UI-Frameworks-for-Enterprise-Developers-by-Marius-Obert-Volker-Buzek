/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/integration/designtime/baseEditor/validator/IsPatternMatch"],function(e){"use strict";return{async:false,errorMessage:"BASE_EDITOR.VALIDATOR.FAILED_PATTERN_TEST",validate:function(t,a){return(t||[]).every(function(t){return e.validate(t,a)})}}});