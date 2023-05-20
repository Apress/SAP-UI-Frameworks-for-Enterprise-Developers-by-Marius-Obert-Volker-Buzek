/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
*/
sap.ui.define(["sap/ui/fl/util/DescriptorChangeCheck"],function(n){"use strict";function o(n){var o=Object.keys(n["inbound"]);if(o.length>1){throw new Error("It is not allowed to add more than one inbound")}if(o.length<1){throw new Error("Inbound does not exist")}if(o[0]===""){throw new Error("The ID of your inbound is empty")}return o[o.length-1]}var a={applyChange:function(a,i){if(!a["sap.app"]["crossNavigation"]){a["sap.app"]["crossNavigation"]={}}if(!a["sap.app"]["crossNavigation"]["inbounds"]){a["sap.app"]["crossNavigation"]["inbounds"]={}}var r=i.getContent();var e=o(r);var t=a["sap.app"]["crossNavigation"]["inbounds"][e];if(!t){n.checkIdNamespaceCompliance(e,i);a["sap.app"]["crossNavigation"]["inbounds"][e]=r["inbound"][e]}else{throw new Error('Inbound with ID "'+e+'" already exist.')}return a}};return a});