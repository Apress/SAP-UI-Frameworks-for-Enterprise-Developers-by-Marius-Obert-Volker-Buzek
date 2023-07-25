/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Element","./library"],function(e){"use strict";var t=e.extend("sap.ui.ux3.ThingGroup",{metadata:{deprecated:true,library:"sap.ui.ux3",properties:{title:{type:"string",group:"Misc",defaultValue:null},colspan:{type:"boolean",group:"Misc",defaultValue:false}},defaultAggregation:"content",aggregations:{content:{type:"sap.ui.core.Control",multiple:true,singularName:"content"},actions:{type:"sap.ui.ux3.ThingGroup",multiple:true,singularName:"action"}}}});return t});