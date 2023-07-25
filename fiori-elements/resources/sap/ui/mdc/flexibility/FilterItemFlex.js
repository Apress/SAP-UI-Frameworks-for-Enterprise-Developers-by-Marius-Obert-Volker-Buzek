/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./ItemBaseFlex"],function(e){"use strict";var i=Object.assign({},e);i.findItem=function(e,i,n){return i.find(function(i){var t;if(e.targets==="jsControlTree"){t=i.getFieldPath()}else{t=i.getAttribute("conditions");if(t){var r,a=t.indexOf("/conditions/");if(a>=0){t=t.slice(a+12);r=t.indexOf("}");if(r>=0){t=t.slice(0,r)}}}}return t===n})};i.beforeApply=function(e){if(e.applyConditionsAfterChangesApplied){e.applyConditionsAfterChangesApplied()}};i.addFilter=i.createAddChangeHandler();i.removeFilter=i.createRemoveChangeHandler();i.moveFilter=i.createMoveChangeHandler();return i},true);