/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/support/library","sap/base/Log"],function(e,i){"use strict";var r=e.Severity;var t={DOCU_REF:"https://ui5.sap.com/",normalizeRule:function(e){if(e.id&&e.id!==""){e.id="gridTable"+e.id}return e},createDocuRef:function(e,i){return{text:e,href:t.DOCU_REF+i}},createFioriGuidelineResolutionEntry:function(){return{text:"SAP Fiori Design Guidelines: Grid Table",href:"https://experience.sap.com/fiori-design-web/grid-table"}},reportIssue:function(e,i,t,n){e.addIssue({severity:t||r.Medium,details:i,context:{id:n||"WEBPAGE"}})},find:function(e,i,r){var t=e.getElements();var n=[];for(var u in t){var s=t[u];if(s.isA(r)){if(i&&s.getDomRef()||!i){n.push(s)}}}return n},checkLogEntries:function(e,r){var t=i.getLogEntries();var n;for(var u=0;u<t.length;u++){n=t[u];if(e(n)){if(r(n)){return}}}}};return t},true);