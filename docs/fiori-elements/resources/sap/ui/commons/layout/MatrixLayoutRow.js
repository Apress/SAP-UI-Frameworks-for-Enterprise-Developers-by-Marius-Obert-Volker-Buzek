/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/commons/library","sap/ui/core/CustomStyleClassSupport","sap/ui/core/Element"],function(e,a,t){"use strict";var o=t.extend("sap.ui.commons.layout.MatrixLayoutRow",{metadata:{deprecated:true,library:"sap.ui.commons",properties:{height:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:null}},defaultAggregation:"cells",aggregations:{cells:{type:"sap.ui.commons.layout.MatrixLayoutCell",multiple:true,singularName:"cell"}}}});a.apply(o.prototype);return o});