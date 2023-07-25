/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * @namespace Factory to access services outside of sap.ui.mdc library like for example <code>ushell</code> services.
	 * @name sap.ui.mdc.link.Factory
	 * @author SAP SE
	 * @version 1.113.0
	 * @private
	 * @since 1.54.0
	 */
	return {
		getService: function(sServiceName) {
			switch (sServiceName) {
				case "CrossApplicationNavigation":
					return sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");
				case "URLParsing":
					return sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("URLParsing");
				default:
					return null;
			}
		}
	};
});
