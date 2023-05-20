/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/InvisibleText"],function(e){"use strict";var t={getAriaRole:function(e,t){var r=e.getAriaAttributes();if(r.role){return r.role}else{return t.getAriaRole.apply(this,arguments)}},getAccessibilityState:function(t,r){var i=t.getAriaAttributes();var a=r.getAccessibilityState.apply(this,arguments);if(i.aria){for(var s in i.aria){a[s]=i.aria[s]}}if(!i.valueHelpEnabled&&a.describedby){var l=e.getStaticId("sap.m","INPUT_VALUEHELP");var n=a.describedby.value.split(" ");var u="";for(var b=0;b<n.length;b++){var v=n[b];if(v!==l){u=u?u+" "+v:v}}if(u){a.describedby.value=u}else{delete a.describedby}}return a},writeInnerAttributes:function(e,t,r){r.writeInnerAttributes.apply(this,arguments);var i=t.getAriaAttributes();for(var a in i){if(a!=="aria"&&a!=="role"&&a!=="valueHelpEnabled"){e.attr(a,i[a])}}}};return t});