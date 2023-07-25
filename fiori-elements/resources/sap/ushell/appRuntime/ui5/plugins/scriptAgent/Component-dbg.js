// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
	"sap/ui/core/Component",
	"sap/ui/thirdparty/jquery",
		"sap/base/Log"
],
function (
	Component, jQuery, Log
) {
	"use strict";

	return Component.extend("sap.ushell.appRuntime.ui5.plugins.scriptAgent.Component", {
		init: function () {
			var mConfig = this.getComponentData();
			jQuery.ajaxSetup({
				cache: true
			});

			try {
				jQuery.getScript(mConfig.config.url);
			} catch (ex) {
				Log.error(ex);
			}

			jQuery.ajaxSetup({
				cache: false
			});
		}
	});
});
