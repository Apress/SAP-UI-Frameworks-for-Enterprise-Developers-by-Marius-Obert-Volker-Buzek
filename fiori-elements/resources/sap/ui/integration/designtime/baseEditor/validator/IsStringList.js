/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/integration/designtime/baseEditor/validator/IsValidBinding"],function(e){"use strict";return{async:false,errorMessage:e.errorMessage,validate:function(i){return i===undefined||i.every(function(i){return e.validate(i)})}}});