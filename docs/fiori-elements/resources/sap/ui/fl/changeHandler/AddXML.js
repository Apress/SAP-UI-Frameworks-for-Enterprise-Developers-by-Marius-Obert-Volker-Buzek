/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/changeHandler/BaseAddXml"],function(e){"use strict";var t={};t.applyChange=function(t,n,r){var g=t.getContent();var a={aggregationName:g.targetAggregation,index:g.index};return e.applyChange(t,n,r,a)};t.revertChange=e.revertChange;t.completeChangeContent=function(t,n){var r={};if(n.targetAggregation){r.targetAggregation=n.targetAggregation}else{e._throwMissingAttributeError("targetAggregation")}if(n.index!==undefined){r.index=n.index}else{e._throwMissingAttributeError("index")}e.completeChangeContent(t,n,r)};return t},true);