// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
  "sap/ui/integration/Extension",
  "sap/ushell/components/cepsearchresult/app/util/jsSearch"
], function (Extension, JSSearchFactory) {
  "use strict";
  var AppDataExtension = Extension.extend("sap.ushell.components.cepsearchresult.app.util.AppDataExtension");

  AppDataExtension.prototype.normalize = function (aApps) {
    if (!Array.isArray(aApps)) {
      aApps = [];
    }
    var aResultApps = [];
    aApps.forEach(function (oApp) {
      oApp.visualizations.forEach(function (oVis) {
        var label = oVis.title;
        if (oVis.subtitle) {
          label = label + " - " + oVis.subtitle;
        }
        aResultApps.push({
          title: oVis.title || "",
          subtitle: oVis.subtitle || "",
          keywords: oVis.keywords ? oVis.keywords.join(" ") : "",
          icon: oVis.icon || "",
          label: label,
          visualization: oVis,
          url: oVis.targetURL
        });
      });
    });
    return aResultApps;
  };

  AppDataExtension.prototype.filter = function (aResult, sSearchTerm, iSkip, iTop) {
    // eslint-disable-next-line new-cap
    this.searchEngine = new JSSearchFactory({
      objects: aResult,
      fields: ["title", "subtitle", "keywords"],
      shouldNormalize: !String.prototype.normalize,
      algorithm: {
        id: "contains-ranked",
        options: [50, 49, 40, 39, 5, 4, 51]
      }
    });
    // format of the result is { results:[{object:{aResult[i]}}], totalCount:number}
    if (sSearchTerm) {
      //search only works with searchTerm today
      return this.searchEngine.search({
        searchFor: sSearchTerm,
        top: iTop,
        skip: iSkip
      });
    }
    // no searchTerm needs to create a unified result for { results:[{object:{aResult[i]}}], totalCount:number}
    var aTargetResult = {
      results: [],
      totalCount: aResult.length
    };
    // sort alphabetically
    aResult.sort(function (a, b) {
      return a.title.localeCompare(b.title);
    }).splice(iSkip, iTop).forEach(function (o) {
      aTargetResult.results.push({
        object: o
      });
    });
    return aTargetResult;
  };

  AppDataExtension.prototype.getData = function (sSearchTerm, iSkip, iTop) {

    var oResult = {
      results: [],
      totalCount: 0
    };

    // embedded in flp
    if (sap.ushell.Container && sap.ushell.Container.getServiceAsync) {
      return sap.ushell.Container.getServiceAsync("SearchableContent")
        .then(function (Service) {
          Service._changeVizType = function () {

          };
          return Service.getApps()
            .then(function (aResult) {
              aResult = this.normalize(aResult);
              return this.filter(aResult, sSearchTerm, iSkip, iTop);
            }.bind(this));
        }.bind(this));
    }
    return Promise.resolve(oResult);
  };

  return AppDataExtension;
});
