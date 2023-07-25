/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/thirdparty/jquery"
], function (BaseObject, jQuery) {
	"use strict";

	var mLoadedShapes = {};

	/**
	 * Constructor for a new ShapeFactory.
	 *
	 * @class
	 * Asynchronous loading predefined shapes from SVG file.
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @constructor
	 * @private
	 * @since 1.60.0
	 * @alias sap.suite.ui.commons.statusindicator.shapes.ShapeFactory
	 */
	var ShapeFactory = BaseObject.extend("sap.suite.ui.commons.statusindicator.shapes.ShapeFactory");

	/**
	 *
	 * @param sId
	 * @returns {Promise}
	 */
	ShapeFactory.prototype.getShapeById = function (sId) {
		var mLoadedShapes = this._getLoadedShapes(),
			sSvg = mLoadedShapes[sId] || null;

		if (!sSvg) {
			return new Promise(function (resolve, reject) {
				jQuery.ajax({
					url: sap.ui.require.toUrl("sap/suite/ui/commons/statusindicator") + "/shapes/" + sId + ".svg",
					dataType: "text"
				})
					.done(function (oData) {
						mLoadedShapes[sId] = oData;
						resolve(oData);
					})
					.fail(function (oError) {
						reject(oError);
					});
			});
		}
		return Promise.resolve(sSvg);
	};

	ShapeFactory.prototype._getLoadedShapes = function () {
		return mLoadedShapes;
	};

	ShapeFactory.prototype._removeAllLoadedShapes = function () {
		mLoadedShapes = {};
	};

	return ShapeFactory;

});