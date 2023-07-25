/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/ui/model/json/JSONListBinding"
], function (
	JSONListBinding
) {
	"use strict";

	/**
	 * Creates a new PagingModelListBinding object.
	 *
	 * @class
	 *
	 * Extends the JSONModel to provide pagination.
	 *
	 * @extends sap.ui.model.json.JSONListBinding
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @constructor
	 * @private
	 * @alias sap.ui.integration.model.PagingModelListBinding
	 */
	var PagingModelListBinding = JSONListBinding.extend("sap.ui.integration.model.PagingModelListBinding", {});

	PagingModelListBinding.prototype.update = function () {
		JSONListBinding.prototype.update.call(this);

		if (this._iStartIndex !== undefined) {
			this.aIndices = this.aIndices.slice(this._iStartIndex, this._iEndIndex);
		}
	};

	return PagingModelListBinding;
});
