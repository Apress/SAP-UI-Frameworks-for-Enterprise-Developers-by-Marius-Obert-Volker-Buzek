/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../error/ErrorHandler", "sap/ui/Device", "./JsSearchFactory"], function (__ErrorHandler, device, __jsSearchFactory) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var ErrorHandler = _interopRequireDefault(__ErrorHandler);
  // TODO
  var jsSearchFactory = _interopRequireDefault(__jsSearchFactory); //["sap/esh/search/ui/appsearch/JsSearchFactory", "sap/ui/Device", "../error/ErrorHandler"],
  var CatalogSearch = /*#__PURE__*/function () {
    function CatalogSearch() {
      _classCallCheck(this, CatalogSearch);
      this.errorHandler = new ErrorHandler();
      this.initPromise = sap.ushell.Container.getServiceAsync("SearchableContent").then(function (searchService) {
        return searchService.getApps();
      }, function (error) {
        this.errorHandler.onErrorDeferred(error);
        return Promise.resolve([]);
      }.bind(this)).then(function (apps) {
        // format
        apps = this.formatApps(apps);

        // decide whether jsSearch should do normalization
        var shouldNormalize = true;
        var isIE = device && device.browser && device.browser.msie || false;
        if (!String.prototype.normalize || isIE) {
          shouldNormalize = false;
        }

        // create js search engine
        this.searchEngine = jsSearchFactory.createJsSearch({
          objects: apps,
          fields: ["title", "subtitle", "keywords"],
          shouldNormalize: shouldNormalize,
          algorithm: {
            id: "contains-ranked",
            options: [50, 49, 40, 39, 5, 4, 51]
          }
        });
      }.bind(this));
    }
    _createClass(CatalogSearch, [{
      key: "formatApps",
      value: function formatApps(apps) {
        var resultApps = [];
        apps.forEach(function (app) {
          app.visualizations.forEach(function (vis) {
            var label = vis.title;
            if (vis.subtitle) {
              label = label + " - " + vis.subtitle;
            }
            resultApps.push({
              title: vis.title || "",
              subtitle: vis.subtitle || "",
              keywords: vis.keywords ? vis.keywords.join(" ") : "",
              icon: vis.icon || "",
              label: label,
              visualization: vis,
              url: vis.targetURL
            });
          });
        });
        return resultApps;
      }
    }, {
      key: "prefetch",
      value: function prefetch() {
        // empty
      }
    }, {
      key: "search",
      value: function search(query) {
        return this.initPromise.then(function () {
          // use js search for searching
          var searchResults = this.searchEngine.search({
            searchFor: query.searchTerm,
            top: query.top,
            skip: query.skip
          });

          // convert to result structure
          var items = [];
          for (var i = 0; i < searchResults.results.length; ++i) {
            var result = searchResults.results[i];
            var formattedResult = Object.assign({}, result.object);
            var highlightedLabel = result.highlighted.title || result.object.title;
            if (result.highlighted.subtitle) {
              highlightedLabel = highlightedLabel + " - " + result.highlighted.subtitle;
            } else if (result.object.subtitle) {
              highlightedLabel = highlightedLabel + " - " + result.object.subtitle;
            }
            if (highlightedLabel) {
              formattedResult.label = highlightedLabel;
            }
            items.push(formattedResult);
          }

          // return search result
          return {
            totalCount: searchResults.totalCount,
            tiles: items
          };
        }.bind(this));
      }
    }]);
    return CatalogSearch;
  }();
  return CatalogSearch;
});
})();