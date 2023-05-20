/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/commons/library","sap/ui/core/CustomStyleClassSupport","sap/ui/core/Element"],function(a,e,t){"use strict";var o=t.extend("sap.ui.commons.layout.MatrixLayoutCell",{metadata:{deprecated:true,library:"sap.ui.commons",properties:{backgroundDesign:{type:"sap.ui.commons.layout.BackgroundDesign",defaultValue:"Transparent"},colSpan:{type:"int",defaultValue:1},hAlign:{type:"sap.ui.commons.layout.HAlign",defaultValue:"Begin"},padding:{type:"sap.ui.commons.layout.Padding",defaultValue:"End"},rowSpan:{type:"int",defaultValue:1},separation:{type:"sap.ui.commons.layout.Separation",defaultValue:"None"},vAlign:{type:"sap.ui.commons.layout.VAlign",defaultValue:"Middle"}},defaultAggregation:"content",aggregations:{content:{type:"sap.ui.core.Control",multiple:true,singularName:"content"}}}});e.apply(o.prototype);return o});