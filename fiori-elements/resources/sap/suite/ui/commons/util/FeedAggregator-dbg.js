/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'./DateUtils',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/xml/XMLModel'
], function (jQuery, DateUtils, JSONModel, XMLModel) {
	"use strict";

	/**
	 * Constructor for FeedAggregator - must not be used. All functions are static, so it is illegal to call this constructor.
	 * FeedAggregator is a static class for feed aggregation functions.
	 *
	 * @class
	 * @private
	 */
	var FeedAggregator = function () {
		throw new Error();
	};

	/**
	 * Filters $xml to include/exclude articles that matches the inclusion/exclusion filter criteria. Filter title by the entire phrase and apply OR operator between different filters.
	 *
	 * @param {Object} $xml jQuery object with XML
	 * @param {String[]} aInclusionFilters Array of filtering phrases
	 * @param {String[]} aExclusionFilters Array of filtering phrases
	 * @private
	 */
	FeedAggregator.filterItems = function ($xml, aInclusionFilters, aExclusionFilters) {

		var filter = function (aFilters, inclusive) {
			var $items = $xml.find("rss>channel>item");
			if ($items.length > 0) {
				for (var i = $items.length - 1; i >= 0; i--) {
					var $item = jQuery($items[i]);
					var $title = $item.find("title");
					var match = false;
					for (var j = 0; j < aFilters.length; j++) {
						var filter = aFilters[j];
						if (filter) {
							if ($title.text().toLowerCase().indexOf(filter.toLowerCase()) !== -1) {
								match = true;
								break;
							}
						}
					}
					if (match !== inclusive) {
						$item.remove();
					}
				}
			}
		};

		if (aInclusionFilters && aInclusionFilters.length > 0) {
			filter(aInclusionFilters, true);
		}
		if (aExclusionFilters && aExclusionFilters.length > 0) {
			filter(aExclusionFilters, false);
		}
	};

	/**
	 * Performs XHR to the given URLs and trigger fnCompleted function when all requests are completed. If the request is completed with error fnCompleted is still called but then the
	 * fnFailed is called.
	 *
	 * @param {String[]} aFeedUrls URLs to get data from
	 * @param {String[]} aInclusionFilters Filters to include articles into result model. Filter title by the entire phrase and apply OR operator between different filters.
	 * @param {String[]}  aExclusionFilters Filters to exclude articles from result model. Filter title by the entire phrase and apply OR operator between different filters.
	 * @param {function} fnCompleted callback function to handle data received from URL
	 * @param {function} [fnFailed] callback function to handle failed request
	 * @private
	 * @returns {sap.ui.model.json.JSONModel} The newly created feed model
	 */
	FeedAggregator.getFeeds = function (aFeedUrls, aInclusionFilters, aExclusionFilters, fnCompleted, fnFailed) {
		var jsResult = {
			items: []
		}; // array of RSS items
		var result = new JSONModel();
		var feedNumber = aFeedUrls.length;
		var counter = 0;

		var fnCompleteOneFeed = function (oControlEvent) {

			var $xml = jQuery(this.getData());
			FeedAggregator.filterItems($xml, aInclusionFilters, aExclusionFilters);
			if ($xml.find("rss>channel>item>title").length > 0) {
				var items = $xml.find("rss>channel>item");
				var source = jQuery($xml.find("rss>channel>title")).text();
				var imageUrl = jQuery($xml.find("rss>channel>image>url")).text();

				for (var i = 0; i < items.length; i++) {
					var $item = jQuery(items[i]);
					var date = new Date($item.children("pubDate").text());
					var itemImageUrl = $item.children("image").text();

					if (itemImageUrl) {
						imageUrl = itemImageUrl;
					}

					if (!DateUtils.isValidDate(date)) {
						date = null;
					}
					jsResult.items.push({
						title: $item.children("title").text(),
						link: $item.children("link").text(),
						description: $item.children("description").text(),
						pubDate: date,
						source: source,
						image: imageUrl
					});
				}
			}
			counter++;
			if (counter === feedNumber) {
				// place fnComplete function in the queue
				result.setData(jsResult);
				if (fnCompleted) {
					fnCompleted();
				}
			}
		};

		for (var i = 0; i < aFeedUrls.length; i++) {
			var tmpXmlModel = new XMLModel();
			tmpXmlModel.attachRequestCompleted(fnCompleteOneFeed);
			tmpXmlModel.loadData(aFeedUrls[i]);
		}

		return result;
	};

	return FeedAggregator;

}, /* bExport= */ true);
