/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/requireAsync","sap/base/Log"],function(e,r){"use strict";var n={registry:function(){return e("sap/ui/fl/apply/_internal/changes/descriptor/Registration")},handleError:function(e){r.error(e)},processTexts:function(e,n){var t=JSON.stringify(e);Object.keys(n).forEach(function(e){if(n[e].value[""]){t=t.replace("{{"+e+"}}",n[e].value[""])}else{r.error("Text change has to contain default language")}});return JSON.parse(t)}};var t={getRuntimeStrategy:function(){return n}};return t});