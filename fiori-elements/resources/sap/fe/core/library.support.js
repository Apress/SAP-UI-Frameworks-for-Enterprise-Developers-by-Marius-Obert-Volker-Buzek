/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["./support/AnnotationIssue.support","./support/CollectionFacetMissingID.support","./support/CollectionFacetUnsupportedLevel.support","./support/InvalidAnnotationColumnKey.support"],function(e,s,t,o){"use strict";sap.ui.support.SystemPresets.FeV4={id:"FioriElementsV4",title:"Fiori Elements V4",description:"Fiori Elements V4 rules",selections:[{ruleId:"annotationIssue",libName:"sap.fe.core"}]};return{name:"sap.fe.core",niceName:"SAP.FE V4 - Core library",ruleset:[e.getRules(),s.getRules(),t.getRules(),o.getRules()]}},false);