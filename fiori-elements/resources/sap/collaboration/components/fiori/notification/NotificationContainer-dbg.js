/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.define(["sap/ui/core/Control"], function(Control) {
	"use strict";

	var NotificationContainer = Control.extend("sap.collaboration.components.fiori.notification.NotificationContainer", {

		metadata: {

			aggregations: {
				"content" : {singularName: "content"}
			}

		},

		renderer: function(oRM, oControl) {

		   oRM.openStart("div", oControl); // applies the ID, ...
		   oRM.class("sapClbNotifContainerBox");
		   oRM.openEnd();

		   var aContent = oControl.getContent();
		   for (var i = 0, l = aContent.length; i < l; i++) {
				  oRM.renderControl(aContent[i]);
		   }

		   oRM.close("div");

		}

	});


	return NotificationContainer;

});
