/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/changeHandler/HideControl","sap/ui/fl/changeHandler/UnhideControl"],function(e,n){"use strict";return{createChanges:function(e){return e.map(function(e){var n=sap.ui.getCore().byId(e.id);if(!n){throw new Error("Invalid 'id'. For the id "+e.id+" no existing control could be found")}return{selectorElement:n,changeSpecificData:{changeType:e.visible?"revealItem":"hideItem"}}})},revealItem:{layers:{USER:true},changeHandler:n},hideItem:{layers:{USER:true},changeHandler:e}}},true);