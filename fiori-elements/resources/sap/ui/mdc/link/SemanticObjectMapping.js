/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Element"],function(e){"use strict";var t=e.extend("sap.ui.mdc.link.SemanticObjectMapping",{metadata:{library:"sap.ui.mdc",properties:{semanticObject:{type:"string"}},defaultAggregation:"items",aggregations:{items:{type:"sap.ui.mdc.link.SemanticObjectMappingItem",multiple:true,singularName:"item"}}}});return t});