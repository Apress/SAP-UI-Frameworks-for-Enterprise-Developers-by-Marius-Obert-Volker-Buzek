// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
  "sap/base/Log",
  "sap/base/assert",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/resource/ResourceModel",
  "sap/ui/base/ManagedObject",
  "sap/ui/integration/util/DataProviderFactory",
  "sap/ushell/components/cepsearchresult/app/util/SearchResultModel",
  "sap/ushell/components/cepsearchresult/app/util/AdvancedFormatters"

], function (Log, assert, JSONModel, ResourceModel, ManagedObject, DataProviderFactory, SearchResultModel, AdvancedFormatters) {
  "use strict";

  var oTranslationProperties = {
    "/categories": ["/title", "/shortTitle", "/card/title", "/card/subTitle", "/list/noDataText", "/list/loadingDataText"],
    "/filters": ["/label", "/description"]
  };

  /**
   * Simple control instance to resolved bindings.
   */
  var SimpleControl = ManagedObject.extend("sap.ushell.components.cepsearchresult.app.util.SimpleControl", {
    metadata: {
      properties: {
        resolved: {
          type: "string"
        }
      }
    }
  });
  var oSimpleControl = new SimpleControl();


  /**
   * Creates a Search Result Manager instance for the given edition.
   * The corresponding configuration is loaded from SearchResultManager._configPath.
   * The config path can be change for testing.
   * Naming convention of the configuration is "config." + edition + ".json"
   *
   * @param {string} sEdition - the edition: 'standard' or 'advanced'
   *
   * @private
   */
  var SearchResultManager = function (sEdition) {

    assert(typeof (sEdition) === "string" && (sEdition === "standard" || sEdition === "advanced"),
      "Edition must be a string: 'standard' or 'advanced'");
    if (!sEdition) {
      sEdition = "standard";
    }
    this.oDataProviderFactory = new DataProviderFactory();
    this.sEdition = sEdition;
    this.oModel = null;
    this.oResourceModel = null;
    this._createModel(sEdition);
  };

  SearchResultManager.mExtensions = {};

  SearchResultManager.prototype.getResourceModel = function () {
    return this.oResourceModel;
  };

  /**
   * Returns the model of this SearchResultManager instance. The model instance can be used to bind
   * to the corresponding data within a view.
   *
   * @returns {JSONModel} the model of this search Manager instance
   *
   * @private
   */
  SearchResultManager.prototype.getModel = function () {
    return this.oModel;
  };

  SearchResultManager.prototype.getResourceModel = function () {
    return this.oResourceModel;
  };

  SearchResultManager.prototype.getFilters = function () {
    return this.getModel().getProperty("/filters") || [];
  };

  SearchResultManager.prototype.getCategoriesModel = function (vCategories) {
    if (typeof vCategories === "string") {
      vCategories.replace(/ /gi, "");
      vCategories = vCategories.split(",");
    }
    if (vCategories.length === 1) {
      var oCategory = this.getCategory(vCategories[0]);
      //extract the subcategories and apply new settings
      if (oCategory && Array.isArray(oCategory.subCategories)) {
        return new JSONModel(oCategory.subCategories);
      }
    }
    var aCategories = [];
    var oData = this.getModel().getData();
    vCategories.forEach(function (sCategory) {
      aCategories.push(oData.categoriesMap[sCategory]);
    });
    return new JSONModel(aCategories);
  };

  SearchResultManager.prototype.createSearchResultModel = function (sCategory, oCard, oCategoriesModel) {
    var oModel;
    var aData = oCategoriesModel.getData();
    for (var i = 0; i < aData.length; i++) {
      if (aData[i].name === sCategory) {
        oModel = new SearchResultModel(JSON.parse(JSON.stringify(aData[i])));
        break;
      }
    }
    var oCategory = oModel.getData();
    oCategory.list._currentView = oCategory.list._currentView || oCategory.list.defaultView;
    oCategory._status = oCategory._status || {};
    oCategory._status.dataStatusText = oCategory.list.loadingDataText;
    if (oCategory.extension) {
      oModel.setExtension(new SearchResultManager.mExtensions[oCategory.extension]());
    }
    if (oCard) {
      oModel.setHost(oCard.getHost());
      oModel.setCard(oCard);
    }
    if (oCategory.list && oCategory.list.data && oCategory.list.data.destinations) {
      oModel.setDestinations(oCategory.list.data.destinations);
    }

    for (var n in AdvancedFormatters) {
      oModel.addFormatters(n, AdvancedFormatters[n]);
    }

    return oModel;
  };

  SearchResultManager.prototype.getCategory = function (sCategory) {
    return this.getModel().getProperty("/categoriesMap/" + sCategory);
  };

  /**
   * Creates the ResourceModel for this SearchResultManager instance.
   * The ResourceModel is used to translate the entries in the configuration defined in oTranslationProperties.
   *
   * @private
   */
  SearchResultManager.prototype._createResourceModel = function () {
    if (!this.oResourceModel) {
      this.oResourceModel = new ResourceModel({
        bundleName: "sap.ushell.components.cepsearchresult.app.util.i18n.i18n"
      });
    }
  };

  /**
   * Creates this SearchResultManager configuration and result model for the given edition.
   *
   * @param {string} sEdition - the edition: 'standard' or 'advanced'
   */
  SearchResultManager.prototype._createModel = function (sEdition) {

    assert(typeof (sEdition) === "string" && (sEdition === "standard" || sEdition === "advanced"),
      "Edition must be a string: 'standard' or 'advanced'");

    this._createResourceModel();
    if (!this.oModel) {
      var sConfigURL = SearchResultManager._configPath + "/config." + sEdition + ".json";
      this.oModel = new JSONModel();
      this._loaded = this.oModel.loadData(sConfigURL)
        .then(function () {
          if (this.oResourceModel) {
            this._translateModel(this.oModel, this.oResourceModel);
          }
          this._normalizeCategories();
          return this._loadExtensions();
        }.bind(this))
        .catch(function () {
          Log.error("Could not load search result configuration for " + sEdition + " from " + sConfigURL,
            "sap.ushell.components.cepsearchresult.app.util.SearchResultManager");
        });
    } else {
      this._loaded = Promise.resolve();
    }
  };

  /**
   * Load the extensions for all categories and stores them in SearchResultManager.mExtensions map
   * @return {Promise} that resolves after all extensions are loaded.
   * @private
   */
  SearchResultManager.prototype._loadExtensions = function () {

    var aCategories = this.oModel.getProperty("/categories");
    var aExtensions = [];
    var aExtensionNames = [];

    // create a map for categories for easier access
    aCategories.map(function (oCategory) {
      if (oCategory.extension) {
        aExtensionNames.push(oCategory.extension);
        aExtensions.push(oCategory.extension.replace("module:", ""));
      }
    });

    // if there is no extension needed resolve
    if (aExtensionNames.length === 0) {
      return Promise.resolve();
    }

    // require all extension modules and store them in mGlobalExtensions map
    return new Promise(function (resolve) {
      sap.ui.require(aExtensions, function () {
        var aModules = Array.from(arguments);
        aModules.forEach(function (oModule, i) {
          SearchResultManager.mExtensions[aExtensionNames[i]] = oModule;
        });
        resolve();
      });
    });
  };

  SearchResultManager.prototype._normalizeCategories = function () {
    var aCategories = this.oModel.getProperty("/categories");
    var mCategories = {};

    // create a map for categories for easier access
    aCategories.map(function (oCategory) {
      mCategories[oCategory.name] = oCategory;

    });
    this.oModel.setProperty("/categoriesMap", mCategories);

    // enhance the subcategories if available
    aCategories.map(function (oCategory) {
      var aSubs = oCategory.subCategories;
      var aRealSubs = [];
      if (Array.isArray(aSubs)) {
        for (var i = 0; i < aSubs.length; i++) {
          var oOriginalSub = aSubs[i];
          var oReferredCategory = mCategories[oCategory.subCategories[i].name];
          if (!oReferredCategory) {
            continue;
          }
          // copy the referred category and overwrite the settings from original sub
          var oNewSub = JSON.parse(JSON.stringify(oReferredCategory));
          if (oOriginalSub.pageSize && oNewSub.list && oNewSub.list.paginator) {
            oNewSub.list.paginator.pageSize = oOriginalSub.pageSize;
          }
          aRealSubs.push(oNewSub);
        }
        oCategory.subCategories = aRealSubs;
      }
    });
  };

  /**
   * Translate all i18n> model references with the current users language results.
   *
   * @param {JSONModel} oManagerModel - the managerModel
   * @param {ResourceModel} oResourceModel - the managerModel
   *
   * @private
   */
  SearchResultManager.prototype._translateModel = function (oManagerModel, oResourceModel) {
    oSimpleControl.setModel(oResourceModel, "i18n");
    for (var n in oTranslationProperties) {
      var vEntries = oManagerModel.getProperty(n);
      if (Array.isArray(vEntries)) {
        for (var i = 0; i < vEntries.length; i++) {
          for (var j = 0; j < oTranslationProperties[n].length; j++) {
            oSimpleControl.applySettings({ resolved: oManagerModel.getProperty(n + "/" + i + oTranslationProperties[n][j]) });
            oManagerModel.setProperty(n + "/" + i + oTranslationProperties[n][j], oSimpleControl.getResolved());
          }
        }
      }
    }
    oSimpleControl.setModel(null, "i18n");
  };

  /**
   * Static map of extensions
   */
  SearchResultManager.mExtensions = {};

  /**
   * Set the root path to the config files
   */
  SearchResultManager._configPath = sap.ui.require.toUrl("sap/ushell/components/cepsearchresult/app/util");

  return SearchResultManager;
});

