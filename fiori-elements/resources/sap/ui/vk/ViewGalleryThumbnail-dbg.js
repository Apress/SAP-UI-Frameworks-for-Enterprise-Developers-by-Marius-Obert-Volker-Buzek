/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/m/Image",
	"./Core",
	"./ViewGalleryThumbnailRenderer"
], function(
	Image,
	vkCore,
	ViewGalleryThumbnailRenderer
) {

	"use strict";

	/**
	 *  Constructor for a new ViewGalleryThumbnail.
	 *
	 * @class
	 * Creates a thumbnail for use in a ViewGallery control
	 *
	 * @param {string} [sId] ID for the new control. This ID is generated automatically if no ID is provided.
	 * @param {object} [mSettings] Initial settings for the new ViewGalleryThumbnail.
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.m.Image
	 * @alias sap.ui.vk.ViewGalleryThumbnail
	 * @since 1.72.0
	 */

	var ViewGalleryThumbnail = Image.extend("sap.ui.vk.ViewGalleryThumbnail", /** @lends sap.m.Image.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			associations: {
				viewGallery: {
					type: "sap.ui.vk.ViewGallery"
				}
			},
			properties: {
				enabled: { type: "boolean", defaultValue: true },
				thumbnailWidth: { type: "sap.ui.core.CSSSize", defaultValue: "5rem" },
				thumbnailHeight: { type: "sap.ui.core.CSSSize", defaultValue: "5rem" },
				source: { type: "string", defaultValue: "" },
				tooltip: { type: "string", defaultValue: "" },
				selected: { type: "boolean", defaultValue: false },
				processing: { type: "boolean", defaultValue: false },
				animated: { type: "boolean", defaultValue: false }
			}
		},

		constructor: function(sId, mSettings) {
			Image.apply(this, arguments);
			this._viewGallery = null;
			vkCore.observeAssociations(this);
		}
	});

	ViewGalleryThumbnail.prototype.onSetViewGallery = function(viewGallery) {
		this._viewGallery = viewGallery;
	};

	ViewGalleryThumbnail.prototype.onUnsetViewGallery = function(viewGallery) {
		this._viewGallery = null;
	};

	ViewGalleryThumbnail.prototype._getIndex = function() {
		return this._viewGallery ? this._viewGallery._viewItems.indexOf(this) : -1;
	};

	return ViewGalleryThumbnail;
});
