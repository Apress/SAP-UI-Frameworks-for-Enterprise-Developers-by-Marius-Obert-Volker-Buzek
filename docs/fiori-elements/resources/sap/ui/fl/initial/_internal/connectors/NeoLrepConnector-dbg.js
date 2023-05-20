/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/initial/_internal/connectors/LrepConnector"
], function(
	merge,
	LrepConnector
) {
	"use strict";
	/**
	 * Connector for requesting data from a Neo LRep based back end.
	 *
	 * @namespace sap.ui.fl.initial._internal.connectors.NeoLrepConnector
	 * @implements {sap.ui.fl.interfaces.BaseLoadConnector}
	 * @since 1.81
	 * @private
	 * @ui5-restricted sap.ui.fl.initial._internal.Storage, sap.ui.fl.write._internal.Storage
	 */
	return merge({}, LrepConnector, {});
});
