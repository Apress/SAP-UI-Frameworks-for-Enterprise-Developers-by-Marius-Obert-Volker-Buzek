// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
  "sap/base/Log",
  "sap/base/assert",
  "sap/ui/model/json/JSONModel",
  "sap/ui/base/ManagedObject",
  "sap/ui/core/Core",
  "sap/ui/integration/util/DataProviderFactory",
  "sap/ui/integration/util/BindingResolver",
  "sap/ui/integration/util/BindingHelper",
  "sap/ui/integration/util/Destinations"
], function (Log, assert, JSONModel, ManagedObject, Core, DataProviderFactory, BindingResolver, BindingHelper, Destinations) {
  "use strict";

  // Control to pass models to binding resolver
  var oModelControl = new ManagedObject();
  var SearchResultModel = JSONModel.extend("sap.ushell.components.cepsearchresult.app.util.SearchResultModel", {
    constructor: function () {
      JSONModel.apply(this, arguments);
      Core.attachThemeChanged(function () {
        this.checkUpdate(true);
      }.bind(this));
    }
  });

  // allow to pass a extension used to fetch data
  SearchResultModel.prototype.setDestinations = function (oDestinations) {
    this._destinations = oDestinations;
  };

  // allow to pass a extension used to fetch data
  SearchResultModel.prototype.setExtension = function (oExtension) {
    this._extension = oExtension;
  };

  // Add additional formatter
  SearchResultModel.prototype.addFormatters = function (sName, oFormatters) {
    if (!this._oFormatters) {
      this._oFormatters = {};
    }
    this._oFormatters[sName] = oFormatters;
  };

  // Add additional formatter
  SearchResultModel.prototype.removeFormatters = function (sName) {
    if (this._oFormatters && this._oFormatters[sName]) {
      delete this._oFormatters[sName];
    }
  };

  // allow to pass a host to resolve
  SearchResultModel.prototype.setHost = function (oHost) {
    this._host = oHost;
  };

  SearchResultModel.prototype.setCard = function (oCard) {
    this._card = oCard;
  };

  SearchResultModel.prototype.fetchCategoryData = function (iPage) {
    var oCategory = this.getData();

    oCategory._status = oCategory._status || {};
    oCategory.list = oCategory.list || { data: {} };
    oCategory.list.data = oCategory.list.data || {};

    // ensure list result entry
    oCategory.list.data._result = [];
    oCategory.list.data._count = 0;
    oCategory.list._currentView = oCategory.list._currentView || oCategory.list.defaultView;

    // set values before data request
    oCategory._status.dataStatusText = oCategory.list.loadingDataText;

    oCategory.list.paginator.currentPage = iPage;
    oCategory.list.paginator.skip = (oCategory.list.paginator.currentPage - 1) * oCategory.list.paginator.pageSize;
    oCategory.list.paginator.top = oCategory.list.paginator.pageSize;

    var oPaginatorModel = new JSONModel(oCategory.list.paginator);
    var oHost = Core.byId(this._host);
    this.oDataProviderFactory = new DataProviderFactory({
      destinations: new Destinations({
        host: oHost,
        manifestConfig: this._destinations,
        data: oCategory.list.data
      }),
      card: this._card,
      extension: this._extension,
      host: oHost
    });

    oModelControl.setModel(oPaginatorModel, "paginator");
    oModelControl.setModel(this._card.getModel("parameters"), "parameters");

    var oRequest = oCategory.list.data.request;
    var oExtension = oCategory.list.data.extension;

    var oDataProvider;

    if (oRequest && oRequest.url && oCategory.list.data.destinations) {
      // Currently the Binding Resolver erases the url for destination placeholders
      var rPattern = /\{\{destinations.([^}]+)/;
      var aMatch = oRequest.url.match(rPattern);
      if (aMatch && aMatch[1]) {
        var sPlaceholder = "{{destinations." + aMatch[1] + "}}";
        oRequest.url = oRequest.url.replace(sPlaceholder, "{destinations>/placeholder}");
        oModelControl.setModel(new JSONModel({ placeholder: sPlaceholder }), "destinations");
      }
    }

    if (oRequest) {
      oRequest = BindingResolver.resolveValue(oRequest, oModelControl);
      oDataProvider = this.oDataProviderFactory.create({ request: oRequest });
    }

    if (oExtension) {
      oExtension = BindingResolver.resolveValue(oExtension, oModelControl);
      oDataProvider = this.oDataProviderFactory.create({ extension: oExtension });
    }

    // reset the oModelControl used to resolve bindings
    oModelControl.setModel(null, "paginator");
    oModelControl.setModel(null, "parameters");
    oModelControl.setModel(null, "destinations");

    return oDataProvider.getData()
      .then(function (oData) {

        var oDataModel = new JSONModel(oData);
        oCategory.list.data._result = oDataModel.getProperty(oCategory.list.data.path);
        oCategory.list.data._count = oDataModel.getProperty(oCategory.list.data.count);

        // update the status
        if (!oCategory.list.data._result ||
          !Array.isArray(oCategory.list.data._result) ||
          oCategory.list.data._result.length === 0) {
          oCategory._status.dataStatusText = oCategory.list.noDataText;
        }

        //pages
        if (oCategory.list.data.clientSplice) {
          oCategory.list.data._result.splice(0, oCategory.list.paginator.skip);
          oCategory.list.data._result.splice(oCategory.list.paginator.top);
        }


        for (var i = 0; i < oCategory.list.data._result.length; i++) {
          var oResult = BindingResolver.resolveValue(
            BindingHelper.createBindingInfos(oCategory.list.data.mapping, this._oFormatters),
            oDataModel, oCategory.list.data.path + "/" + i);
          oCategory.list.data._result[i] = oResult;
        }
        this.checkUpdate();
      }.bind(this))
      .catch(function () {
        oCategory.list.data._result = [];
        oCategory.list.data._count = 0;
        oCategory._status.dataStatusText = oCategory.list.noDataText;
        this.checkUpdate();
      }.bind(this));
  };

  return SearchResultModel;
});

