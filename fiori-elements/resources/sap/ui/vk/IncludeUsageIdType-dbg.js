/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/ui/base/DataType"
], function(DataType) {
	"use strict";

	/**
	 * @classdesc
	 * This type defines possible valid values for property {@link sap.ui.vk.ContentResource#getIncludeUsageId ContentResource.includeUsageId}.
	 *
	 * The possible valid values:
	 * <ul>
	 *   <li><code>true</code> - Load all UsageIds. This is potentially very expensive, as there could be many UsageIds defined for the tenant which are not relevant to the current application.
	 *   <li><code>false</code> - Do not load any UsageIds.
	 *   <li><code>string</code> - A single non-empty string which defines the name of the requested UsageId.
	 *   <li><code>string[]</code> - An array of non-empty strings which define the names of requested UsageIds.
	 * </ul>
	 * @namespace
	 * @final
	 * @public
	 * @alias sap.ui.vk.IncludeUsageIdType
	 * @since 1.96.0
	 */
	var IncludeUsageIdType = DataType.createType(
		"sap.ui.vk.IncludeUsageIdType",
		{
			isValid: function(value) {
				if (typeof value === "boolean") {
					return true;
				}

				if (typeof value === "string") {
					return value.trim().length > 0;
				}

				if (Array.isArray(value)) {
					return value.every(function(value) {
						return typeof value === "string" && value.trim().length > 0;
					});
				}

				return false;
			}
		},
		DataType.getType("any")
	);

	/**
	 * Transforms IncludeUsageIdType parameter into an array of usageId parameters for expand query
	 * @param {sap.ui.vk.IncludeUsageIdType} includeUsageId the includeUsageId content resource parameter
	 * @returns {string[]} The array of usageId parameters for expand query
	 * @private
	 */
	IncludeUsageIdType.to$expandQueryParameter = function(includeUsageId) {
		function toURI(usageId) {
			usageId = usageId.replaceAll("'", "''");
			return (usageId.indexOf(".") !== -1 || usageId.indexOf(",") !== -1) ? "'" + usageId + "'" : usageId;
		}

		if (Array.isArray(includeUsageId)) {
			return includeUsageId.map(function(usageId) { return "usageId." + toURI(usageId); });
		} else if (typeof includeUsageId === "string") {
			return ["usageId." + toURI(includeUsageId)];
		} else if (includeUsageId) {
			return ["usageId"];
		} else {
			return [];
		}
	};

	return IncludeUsageIdType;
}, /* bExport = */ true);
