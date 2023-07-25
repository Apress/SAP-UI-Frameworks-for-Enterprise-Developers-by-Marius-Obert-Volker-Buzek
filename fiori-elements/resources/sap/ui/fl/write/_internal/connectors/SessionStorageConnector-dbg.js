/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/api/connectors/ObjectStorageConnector"
], function(
	merge,
	ObjectStorageConnector
) {
	"use strict";

	/**
	 * Connector for saving data to the <code>window.SessionStorage</code>.
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.SessionStorageConnector
	 * @experimental Since 1.70
	 * @since 1.70
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Storage
	 */
	var SessionStorageConnector = merge({}, ObjectStorageConnector, /** @lends sap.ui.fl.write._internal.connectors.SessionStorageConnector */ {
		storage: window.sessionStorage
	});

	SessionStorageConnector.loadFeatures = function() {
		return ObjectStorageConnector.loadFeatures.apply(this, arguments).then(function(oFeatures) {
			return merge({
				isPublicLayerAvailable: true,
				isVariantAdaptationEnabled: true
			}, oFeatures);
		});
	};

	return SessionStorageConnector;
});
