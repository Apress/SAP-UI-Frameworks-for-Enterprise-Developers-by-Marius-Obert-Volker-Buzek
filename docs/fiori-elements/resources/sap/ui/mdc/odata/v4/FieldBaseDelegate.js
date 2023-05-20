/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/mdc/field/FieldBaseDelegate","sap/ui/mdc/odata/v4/TypeUtil"],function(e,i){"use strict";var t=Object.assign({},e);t.initializeTypeFromBinding=function(e,i,t){var n={};if(i&&(i.isA("sap.ui.model.odata.type.Unit")||i.isA("sap.ui.model.odata.type.Currency"))&&Array.isArray(t)&&t.length>2&&t[2]!==undefined){i.formatValue(t,"string");n.bTypeInitialized=true;n.mCustomUnits=t[2]}return n};t.initializeInternalUnitType=function(e,i,t){if(t&&t.mCustomUnits!==undefined){i.formatValue([null,null,t.mCustomUnits],"string")}};t.enhanceValueForUnit=function(e,i,t){if(t&&t.bTypeInitialized&&i.length===2){i.push(t.mCustomUnits);return i}};t.getDefaultValueHelpDelegate=function(e){return{name:"sap/ui/mdc/odata/v4/ValueHelpDelegate",payload:{}}};t.getTypeUtil=function(e){return i};return t});