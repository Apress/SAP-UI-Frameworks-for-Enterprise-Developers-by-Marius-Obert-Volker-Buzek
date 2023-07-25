/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"./findIndexInArray"
], function(
	ManagedObject,
	findIndexInArray
) {
	"use strict";

	/**
	 * Constructor for a new View Group.
	 *
	 * The objects of this class contain necessary information about View Group
	 *
	 * @class Provides the interface for the view group.
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.vk.ViewGroup
	 */
	var ViewGroup = ManagedObject.extend("sap.ui.vk.ViewGroup", /** @lends sap.ui.vk.ViewGroup.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				viewGroupId: { type: "string" },
				name: { type: "string" },
				description: { type: "string" }
			},
			associations: {
			}
		}
	});

	ViewGroup.prototype.init = function() {
		this._views = [];
	};

	ViewGroup.prototype.exit = function() {
		this._views = null;
	};

	/**
	 * Gets a list of views
	 * @returns {sap.ui.vk.View[]} list of views
	 *
	 * @public
	 */
	ViewGroup.prototype.getViews = function() {
		return this._views;
	};

	/**
	 * Add a view to the view group
	 * @param {sap.ui.vk.View} view view to add
	 * @returns {this} <code>this</code> to allow method chaining.
	 *
	 * @public
	 */
	ViewGroup.prototype.addView = function(view) {

		this._views.push(view);

		return this;
	};

	/**
	 * Inserts a view
	 * @param {sap.ui.vk.View} view view to insert
	 * @param {int} index index where to insert the view
	 * @returns {this} <code>this</code> to allow method chaining.
	 *
	 * @public
	 */
	ViewGroup.prototype.insertView = function(view, index) {

		if (index < 0) {
			index = 0;
		} else if (index !== 0 && index >= this._views.length) {
			index = this._views.length;
		}

		this._views.splice(index, 0, view);

		return this;
	};

	/**
	 * Gets index of a view in the view group
	 * @param {sap.ui.vk.View} view view to locate
	 * @returns {int} view index of found or -1 otherwise
	 *
	 * @public
	 */
	ViewGroup.prototype.indexOfView = function(view) {
		return findIndexInArray(this._views, function(item) {
			return item == view;
		});
	};

	/**
	 * Removes a view from the view group
	 * @param {sap.ui.vk.View} view view to remove
	 * @returns {this} <code>this</code> to allow method chaining.
	 *
	 * @public
	 */
	ViewGroup.prototype.removeView = function(view) {
		var index = this.indexOfView(view);
		if (index >= 0) {
			this._views.splice(index, 1);
		}

		return this;
	};

	/**
	 * Removes all views from the view group
	 * @returns {this} <code>this</code> to allow method chaining.
	 *
	 * @public
	 */
	ViewGroup.prototype.removeViews = function() {
		if (this._views) {
			this._views.splice(0);
		}

		return this;
	};


	return ViewGroup;
});
