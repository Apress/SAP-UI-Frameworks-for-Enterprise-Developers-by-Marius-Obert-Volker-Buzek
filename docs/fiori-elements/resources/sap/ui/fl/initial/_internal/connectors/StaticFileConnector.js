/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/Log","sap/base/util/LoaderExtensions","sap/ui/core/Configuration"],function(e,r,n){"use strict";function a(a,o){var i=a.replace(/\./g,"/")+"/changes/"+o+".json";var t=!!sap.ui.loader._.getModuleState(i);var s=n;if(t||s.getDebug()||s.getComponentPreload()==="off"){try{return r.loadResource(i)}catch(r){if(r.name.includes("SyntaxError")){e.error(r)}e.warning("flexibility did not find a "+o+".json for the application: "+a)}}}return{loadFlexData:function(e){var r=e.componentName;if(!r){r=e.reference.replace(/.Component/g,"")}var n=a(r,"flexibility-bundle");if(n){n.changes=n.changes.concat(n.compVariants);delete n.compVariants;return Promise.resolve(n)}var o=a(r,"changes-bundle");if(o){return Promise.resolve({changes:o})}return Promise.resolve()}}});