/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Control"],function(n){"use strict";var t=n.extend("sap.collaboration.components.fiori.notification.NotificationContainer",{metadata:{aggregations:{content:{singularName:"content"}}},renderer:function(n,t){n.openStart("div",t);n.class("sapClbNotifContainerBox");n.openEnd();var o=t.getContent();for(var e=0,a=o.length;e<a;e++){n.renderControl(o[e])}n.close("div")}});return t});