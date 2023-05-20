sap.ui.define([
	"sap/ui/base/Object"
], function(BaseObject) {
	"use strict";

	/**
	 *
	 * @class Abstract base class for all {@link sap.suite.ui.commons.imageeditor.ImageEditor} action history items.
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.66.0
	 *
	 * @abstract
	 * @public
	 *
	 * @alias sap.suite.ui.commons.imageeditor.HistoryItem
	 */
	var HistoryItem = BaseObject.extend("sap.suite.ui.commons.imageeditor.HistoryItem", {
		metadata: {
			"abstract": true
		}
	});

	HistoryItem.prototype._isSameClass = function(oHistoryItem) {
		return this.getMetadata().getName() === oHistoryItem.getMetadata().getName();
	};

	HistoryItem.prototype._compare = function(oHistoryItem, aMethods) {
		var that = this;

		return this._isSameClass(oHistoryItem) && aMethods.reduce(function(bEqual, sMethod) {
			return that[sMethod]() === oHistoryItem[sMethod]();
		}, true);
	};

	return HistoryItem;
});
