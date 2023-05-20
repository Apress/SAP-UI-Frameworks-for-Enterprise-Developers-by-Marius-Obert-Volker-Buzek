/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/fl/Utils","sap/ui/core/util/reflection/JsControlTreeModifier"],function(e,t){"use strict";var n={getAppComponentForControl:function(t){return e.getAppComponentForControl(t)},getSelectorForControl:function(e,o){if(!o&&!(o===null)){o=n.getAppComponentForControl(e)}return t.getSelector(e,o)},parseChangeContent:function(e,t){if(typeof e==="string"){try{e=e.replace(/(\\{)/g,"{").replace(/(\\})/g,"}");e=JSON.parse(e);if(t){t(e)}}catch(t){e=null}}return e}};return n});