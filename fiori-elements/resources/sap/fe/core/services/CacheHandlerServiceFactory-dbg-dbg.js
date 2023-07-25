/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/strings/hash", "sap/ui/core/cache/CacheManager", "sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory"], function (hash, CacheManager, Service, ServiceFactory) {
  "use strict";

  var _exports = {};
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function getMetadataETag(sUrl, sETag, mUpdatedMetaModelETags) {
    return new Promise(function (resolve) {
      // There is an Url in the FE cache, that's not in the MetaModel yet -> we need to check the ETag
      jQuery.ajax(sUrl, {
        method: "GET"
      }).done(function (oResponse, sTextStatus, jqXHR) {
        // ETag is not the same -> invalid
        // ETag is the same -> valid
        // If ETag is available use it, otherwise use Last-Modified
        mUpdatedMetaModelETags[sUrl] = jqXHR.getResponseHeader("ETag") || jqXHR.getResponseHeader("Last-Modified");
        resolve(sETag === mUpdatedMetaModelETags[sUrl]);
      }).fail(function () {
        // Case 2z - Make sure we update the map so that we invalidate the cache
        mUpdatedMetaModelETags[sUrl] = "";
        resolve(false);
      });
    });
  }
  let CacheHandlerService = /*#__PURE__*/function (_Service) {
    _inheritsLoose(CacheHandlerService, _Service);
    function CacheHandlerService() {
      return _Service.apply(this, arguments) || this;
    }
    _exports.CacheHandlerService = CacheHandlerService;
    var _proto = CacheHandlerService.prototype;
    _proto.init = function init() {
      const oContext = this.getContext();
      this.oFactory = oContext.factory;
      const mSettings = oContext.settings;
      if (!mSettings.metaModel) {
        throw new Error("a `metaModel` property is expected when instantiating the CacheHandlerService");
      }
      this.oMetaModel = mSettings.metaModel;
      this.oAppComponent = mSettings.appComponent;
      this.oComponent = mSettings.component;
      this.initPromise = this.oMetaModel.fetchEntityContainer().then(() => {
        return this;
      });
      this.mCacheNeedsInvalidate = {};
    };
    _proto.exit = function exit() {
      // Deregister global instance
      this.oFactory.removeGlobalInstance(this.oMetaModel);
    };
    _proto.validateCacheKey = async function validateCacheKey(sCacheIdentifier, oComponent) {
      // Keep track if the cache will anyway need to be updated
      let bCacheNeedUpdate = true;
      let sCacheKey;
      try {
        const mCacheOutput = await CacheManager.get(sCacheIdentifier);
        // We provide a default key so that an xml view cache is written
        const mMetaModelETags = this.getETags(oComponent);
        sCacheKey = JSON.stringify(mMetaModelETags);
        // Case #1a - No cache, so mCacheOuput is empty, cacheKey = current metamodel ETags
        if (mCacheOutput) {
          // Case #2 - Cache entry found, check if it's still valid
          const mUpdatedMetaModelETags = {};
          const mCachedETags = JSON.parse(mCacheOutput.cachedETags);
          const aValidETags = await Promise.all(Object.keys(mCachedETags).map(function (sUrl) {
            // Check validity of every single Url that's in the FE Cache object
            if (mCachedETags[sUrl]) {
              if (mMetaModelETags[sUrl]) {
                // Case #2a - Same number of ETags in the cache and in the metadata
                mUpdatedMetaModelETags[sUrl] = mMetaModelETags[sUrl];
                return mCachedETags[sUrl] === mMetaModelETags[sUrl];
              } else {
                // Case #2b - No ETag in the cache for that URL, cachedETags was enhanced
                return getMetadataETag(sUrl, mCachedETags[sUrl], mUpdatedMetaModelETags);
              }
            } else {
              // Case #2z - Last Templating added an URL without ETag
              mUpdatedMetaModelETags[sUrl] = mMetaModelETags[sUrl];
              return mCachedETags[sUrl] === mMetaModelETags[sUrl];
            }
          }));
          bCacheNeedUpdate = aValidETags.indexOf(false) >= 0;
          // Case #2a - Same number of ETags and all valid -> we return the viewCacheKey
          // Case #2b - Different number of ETags and still all valid -> we return the viewCacheKey
          // Case #2c - Same number of ETags but different values, main service Etag has changed, use that as cache key
          // Case #2d - Different number of ETags but different value, main service Etag or linked service Etag has changed, new ETags should be used as cacheKey
          // Case #2z - Cache has an invalid Etag - if there is an Etag provided from MetaModel use it as cacheKey
          if (Object.keys(mUpdatedMetaModelETags).some(function (sUrl) {
            return !mUpdatedMetaModelETags[sUrl];
          })) {
            // At least one of the MetaModel URLs doesn't provide an ETag, so no caching
            sCacheKey = null;
          } else {
            sCacheKey = bCacheNeedUpdate ? JSON.stringify(mUpdatedMetaModelETags) : mCacheOutput.viewCacheKey;
          }
        } else if (Object.keys(mMetaModelETags).some(function (sUrl) {
          return !mMetaModelETags[sUrl];
        })) {
          // Check if cache can be used (all the metadata and annotations have to provide at least a ETag or a Last-Modified header)
          // Case #1-b - No Cache, mCacheOuput is empty, but metamodel etags cannot be used, so no caching
          bCacheNeedUpdate = true;
          sCacheKey = null;
        }
      } catch (e) {
        // Don't use view cache in case of issues with the LRU cache
        bCacheNeedUpdate = true;
        sCacheKey = null;
      }
      this.mCacheNeedsInvalidate[sCacheIdentifier] = bCacheNeedUpdate;
      return sCacheKey;
    };
    _proto.invalidateIfNeeded = function invalidateIfNeeded(sCacheKeys, sCacheIdentifier, oComponent) {
      // Check FE cache after XML view is processed completely
      const sDataSourceETags = JSON.stringify(this.getETags(oComponent));
      if (this.mCacheNeedsInvalidate[sCacheIdentifier] || sCacheKeys && sCacheKeys !== sDataSourceETags) {
        // Something in the sources and/or its ETags changed -> update the FE cache
        const mCacheKeys = {};
        // New ETags that need to be verified, may differ from the one used to generate the view
        mCacheKeys.cachedETags = sDataSourceETags;
        // Old ETags that are used for the xml view cache as key
        mCacheKeys.viewCacheKey = sCacheKeys;
        return CacheManager.set(sCacheIdentifier, mCacheKeys);
      } else {
        return Promise.resolve();
      }
    };
    _proto.getETags = function getETags(oComponent) {
      const mMetaModelETags = this.oMetaModel.getETags();
      // ETags from UI5 are either a Date or a string, let's rationalize that
      Object.keys(mMetaModelETags).forEach(function (sMetaModelKey) {
        if (mMetaModelETags[sMetaModelKey] instanceof Date) {
          // MetaModel contains a Last-Modified timestamp for the URL
          mMetaModelETags[sMetaModelKey] = mMetaModelETags[sMetaModelKey].toISOString();
        }
      });

      // add also the manifest hash as UI5 only considers the root component hash
      const oManifestContent = this.oAppComponent.getManifest();
      const sManifestHash = hash(JSON.stringify({
        sapApp: oManifestContent["sap.app"],
        viewData: oComponent.getViewData()
      }));
      mMetaModelETags["manifest"] = sManifestHash;
      return mMetaModelETags;
    };
    _proto.getInterface = function getInterface() {
      return this;
    };
    return CacheHandlerService;
  }(Service);
  _exports.CacheHandlerService = CacheHandlerService;
  let CacheHandlerServiceFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inheritsLoose(CacheHandlerServiceFactory, _ServiceFactory);
    function CacheHandlerServiceFactory() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _ServiceFactory.call(this, ...args) || this;
      _this._oInstanceRegistry = {};
      return _this;
    }
    var _proto2 = CacheHandlerServiceFactory.prototype;
    _proto2.createInstance = function createInstance(oServiceContext) {
      const sMetaModelId = oServiceContext.settings.metaModel.getId();
      let cacheHandlerInstance = this._oInstanceRegistry[sMetaModelId];
      if (!cacheHandlerInstance) {
        this._oInstanceRegistry[sMetaModelId] = cacheHandlerInstance = new CacheHandlerService(Object.assign({
          factory: this,
          scopeObject: null,
          scopeType: "service"
        }, oServiceContext));
      }
      return cacheHandlerInstance.initPromise.then(() => {
        return this._oInstanceRegistry[sMetaModelId];
      }).catch(e => {
        // In case of error delete the global instance;
        this._oInstanceRegistry[sMetaModelId] = null;
        throw e;
      });
    };
    _proto2.getInstance = function getInstance(oMetaModel) {
      return this._oInstanceRegistry[oMetaModel.getId()];
    };
    _proto2.removeGlobalInstance = function removeGlobalInstance(oMetaModel) {
      this._oInstanceRegistry[oMetaModel.getId()] = null;
    };
    return CacheHandlerServiceFactory;
  }(ServiceFactory);
  return CacheHandlerServiceFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRNZXRhZGF0YUVUYWciLCJzVXJsIiwic0VUYWciLCJtVXBkYXRlZE1ldGFNb2RlbEVUYWdzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJqUXVlcnkiLCJhamF4IiwibWV0aG9kIiwiZG9uZSIsIm9SZXNwb25zZSIsInNUZXh0U3RhdHVzIiwianFYSFIiLCJnZXRSZXNwb25zZUhlYWRlciIsImZhaWwiLCJDYWNoZUhhbmRsZXJTZXJ2aWNlIiwiaW5pdCIsIm9Db250ZXh0IiwiZ2V0Q29udGV4dCIsIm9GYWN0b3J5IiwiZmFjdG9yeSIsIm1TZXR0aW5ncyIsInNldHRpbmdzIiwibWV0YU1vZGVsIiwiRXJyb3IiLCJvTWV0YU1vZGVsIiwib0FwcENvbXBvbmVudCIsImFwcENvbXBvbmVudCIsIm9Db21wb25lbnQiLCJjb21wb25lbnQiLCJpbml0UHJvbWlzZSIsImZldGNoRW50aXR5Q29udGFpbmVyIiwidGhlbiIsIm1DYWNoZU5lZWRzSW52YWxpZGF0ZSIsImV4aXQiLCJyZW1vdmVHbG9iYWxJbnN0YW5jZSIsInZhbGlkYXRlQ2FjaGVLZXkiLCJzQ2FjaGVJZGVudGlmaWVyIiwiYkNhY2hlTmVlZFVwZGF0ZSIsInNDYWNoZUtleSIsIm1DYWNoZU91dHB1dCIsIkNhY2hlTWFuYWdlciIsImdldCIsIm1NZXRhTW9kZWxFVGFncyIsImdldEVUYWdzIiwiSlNPTiIsInN0cmluZ2lmeSIsIm1DYWNoZWRFVGFncyIsInBhcnNlIiwiY2FjaGVkRVRhZ3MiLCJhVmFsaWRFVGFncyIsImFsbCIsIk9iamVjdCIsImtleXMiLCJtYXAiLCJpbmRleE9mIiwic29tZSIsInZpZXdDYWNoZUtleSIsImUiLCJpbnZhbGlkYXRlSWZOZWVkZWQiLCJzQ2FjaGVLZXlzIiwic0RhdGFTb3VyY2VFVGFncyIsIm1DYWNoZUtleXMiLCJzZXQiLCJmb3JFYWNoIiwic01ldGFNb2RlbEtleSIsIkRhdGUiLCJ0b0lTT1N0cmluZyIsIm9NYW5pZmVzdENvbnRlbnQiLCJnZXRNYW5pZmVzdCIsInNNYW5pZmVzdEhhc2giLCJoYXNoIiwic2FwQXBwIiwidmlld0RhdGEiLCJnZXRWaWV3RGF0YSIsImdldEludGVyZmFjZSIsIlNlcnZpY2UiLCJDYWNoZUhhbmRsZXJTZXJ2aWNlRmFjdG9yeSIsIl9vSW5zdGFuY2VSZWdpc3RyeSIsImNyZWF0ZUluc3RhbmNlIiwib1NlcnZpY2VDb250ZXh0Iiwic01ldGFNb2RlbElkIiwiZ2V0SWQiLCJjYWNoZUhhbmRsZXJJbnN0YW5jZSIsImFzc2lnbiIsInNjb3BlT2JqZWN0Iiwic2NvcGVUeXBlIiwiY2F0Y2giLCJnZXRJbnN0YW5jZSIsIlNlcnZpY2VGYWN0b3J5Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDYWNoZUhhbmRsZXJTZXJ2aWNlRmFjdG9yeS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaGFzaCBmcm9tIFwic2FwL2Jhc2Uvc3RyaW5ncy9oYXNoXCI7XG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IENhY2hlTWFuYWdlciBmcm9tIFwic2FwL3VpL2NvcmUvY2FjaGUvQ2FjaGVNYW5hZ2VyXCI7XG5pbXBvcnQgU2VydmljZSBmcm9tIFwic2FwL3VpL2NvcmUvc2VydmljZS9TZXJ2aWNlXCI7XG5pbXBvcnQgU2VydmljZUZhY3RvcnkgZnJvbSBcInNhcC91aS9jb3JlL3NlcnZpY2UvU2VydmljZUZhY3RvcnlcIjtcbmltcG9ydCB0eXBlIFVJQ29tcG9uZW50IGZyb20gXCJzYXAvdWkvY29yZS9VSUNvbXBvbmVudFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuaW1wb3J0IHsgU2VydmljZUNvbnRleHQgfSBmcm9tIFwidHlwZXMvbWV0YW1vZGVsX3R5cGVzXCI7XG5cbmZ1bmN0aW9uIGdldE1ldGFkYXRhRVRhZyhzVXJsOiBhbnksIHNFVGFnOiBhbnksIG1VcGRhdGVkTWV0YU1vZGVsRVRhZ3M6IGFueSkge1xuXHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcblx0XHQvLyBUaGVyZSBpcyBhbiBVcmwgaW4gdGhlIEZFIGNhY2hlLCB0aGF0J3Mgbm90IGluIHRoZSBNZXRhTW9kZWwgeWV0IC0+IHdlIG5lZWQgdG8gY2hlY2sgdGhlIEVUYWdcblx0XHQoalF1ZXJ5IGFzIGFueSlcblx0XHRcdC5hamF4KHNVcmwsIHsgbWV0aG9kOiBcIkdFVFwiIH0pXG5cdFx0XHQuZG9uZShmdW5jdGlvbiAob1Jlc3BvbnNlOiBhbnksIHNUZXh0U3RhdHVzOiBhbnksIGpxWEhSOiBhbnkpIHtcblx0XHRcdFx0Ly8gRVRhZyBpcyBub3QgdGhlIHNhbWUgLT4gaW52YWxpZFxuXHRcdFx0XHQvLyBFVGFnIGlzIHRoZSBzYW1lIC0+IHZhbGlkXG5cdFx0XHRcdC8vIElmIEVUYWcgaXMgYXZhaWxhYmxlIHVzZSBpdCwgb3RoZXJ3aXNlIHVzZSBMYXN0LU1vZGlmaWVkXG5cdFx0XHRcdG1VcGRhdGVkTWV0YU1vZGVsRVRhZ3Nbc1VybF0gPSBqcVhIUi5nZXRSZXNwb25zZUhlYWRlcihcIkVUYWdcIikgfHwganFYSFIuZ2V0UmVzcG9uc2VIZWFkZXIoXCJMYXN0LU1vZGlmaWVkXCIpO1xuXHRcdFx0XHRyZXNvbHZlKHNFVGFnID09PSBtVXBkYXRlZE1ldGFNb2RlbEVUYWdzW3NVcmxdKTtcblx0XHRcdH0pXG5cdFx0XHQuZmFpbChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdC8vIENhc2UgMnogLSBNYWtlIHN1cmUgd2UgdXBkYXRlIHRoZSBtYXAgc28gdGhhdCB3ZSBpbnZhbGlkYXRlIHRoZSBjYWNoZVxuXHRcdFx0XHRtVXBkYXRlZE1ldGFNb2RlbEVUYWdzW3NVcmxdID0gXCJcIjtcblx0XHRcdFx0cmVzb2x2ZShmYWxzZSk7XG5cdFx0XHR9KTtcblx0fSk7XG59XG50eXBlIENhY2hlSGFuZGxlclNlcnZpY2VTZXR0aW5ncyA9IHtcblx0bWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbDtcbn07XG5cbmV4cG9ydCBjbGFzcyBDYWNoZUhhbmRsZXJTZXJ2aWNlIGV4dGVuZHMgU2VydmljZTxDYWNoZUhhbmRsZXJTZXJ2aWNlU2V0dGluZ3M+IHtcblx0cmVzb2x2ZUZuOiBhbnk7XG5cblx0cmVqZWN0Rm46IGFueTtcblxuXHRpbml0UHJvbWlzZSE6IFByb21pc2U8YW55PjtcblxuXHRvRmFjdG9yeSE6IENhY2hlSGFuZGxlclNlcnZpY2VGYWN0b3J5O1xuXG5cdG9NZXRhTW9kZWwhOiBPRGF0YU1ldGFNb2RlbDtcblxuXHRvQXBwQ29tcG9uZW50ITogQXBwQ29tcG9uZW50O1xuXG5cdG9Db21wb25lbnQhOiBVSUNvbXBvbmVudDtcblxuXHRtQ2FjaGVOZWVkc0ludmFsaWRhdGU6IGFueTtcblxuXHRpbml0KCkge1xuXHRcdGNvbnN0IG9Db250ZXh0ID0gdGhpcy5nZXRDb250ZXh0KCk7XG5cdFx0dGhpcy5vRmFjdG9yeSA9IG9Db250ZXh0LmZhY3Rvcnk7XG5cdFx0Y29uc3QgbVNldHRpbmdzID0gb0NvbnRleHQuc2V0dGluZ3M7XG5cdFx0aWYgKCFtU2V0dGluZ3MubWV0YU1vZGVsKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJhIGBtZXRhTW9kZWxgIHByb3BlcnR5IGlzIGV4cGVjdGVkIHdoZW4gaW5zdGFudGlhdGluZyB0aGUgQ2FjaGVIYW5kbGVyU2VydmljZVwiKTtcblx0XHR9XG5cdFx0dGhpcy5vTWV0YU1vZGVsID0gbVNldHRpbmdzLm1ldGFNb2RlbDtcblx0XHR0aGlzLm9BcHBDb21wb25lbnQgPSBtU2V0dGluZ3MuYXBwQ29tcG9uZW50O1xuXHRcdHRoaXMub0NvbXBvbmVudCA9IG1TZXR0aW5ncy5jb21wb25lbnQ7XG5cdFx0dGhpcy5pbml0UHJvbWlzZSA9ICh0aGlzLm9NZXRhTW9kZWwgYXMgYW55KS5mZXRjaEVudGl0eUNvbnRhaW5lcigpLnRoZW4oKCkgPT4ge1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSk7XG5cdFx0dGhpcy5tQ2FjaGVOZWVkc0ludmFsaWRhdGUgPSB7fTtcblx0fVxuXG5cdGV4aXQoKSB7XG5cdFx0Ly8gRGVyZWdpc3RlciBnbG9iYWwgaW5zdGFuY2Vcblx0XHR0aGlzLm9GYWN0b3J5LnJlbW92ZUdsb2JhbEluc3RhbmNlKHRoaXMub01ldGFNb2RlbCk7XG5cdH1cblxuXHRhc3luYyB2YWxpZGF0ZUNhY2hlS2V5KHNDYWNoZUlkZW50aWZpZXI6IGFueSwgb0NvbXBvbmVudDogYW55KTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG5cdFx0Ly8gS2VlcCB0cmFjayBpZiB0aGUgY2FjaGUgd2lsbCBhbnl3YXkgbmVlZCB0byBiZSB1cGRhdGVkXG5cdFx0bGV0IGJDYWNoZU5lZWRVcGRhdGUgPSB0cnVlO1xuXHRcdGxldCBzQ2FjaGVLZXk6IHN0cmluZyB8IG51bGw7XG5cblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgbUNhY2hlT3V0cHV0ID0gYXdhaXQgQ2FjaGVNYW5hZ2VyLmdldChzQ2FjaGVJZGVudGlmaWVyKTtcblx0XHRcdC8vIFdlIHByb3ZpZGUgYSBkZWZhdWx0IGtleSBzbyB0aGF0IGFuIHhtbCB2aWV3IGNhY2hlIGlzIHdyaXR0ZW5cblx0XHRcdGNvbnN0IG1NZXRhTW9kZWxFVGFncyA9IHRoaXMuZ2V0RVRhZ3Mob0NvbXBvbmVudCk7XG5cdFx0XHRzQ2FjaGVLZXkgPSBKU09OLnN0cmluZ2lmeShtTWV0YU1vZGVsRVRhZ3MpO1xuXHRcdFx0Ly8gQ2FzZSAjMWEgLSBObyBjYWNoZSwgc28gbUNhY2hlT3VwdXQgaXMgZW1wdHksIGNhY2hlS2V5ID0gY3VycmVudCBtZXRhbW9kZWwgRVRhZ3Ncblx0XHRcdGlmIChtQ2FjaGVPdXRwdXQpIHtcblx0XHRcdFx0Ly8gQ2FzZSAjMiAtIENhY2hlIGVudHJ5IGZvdW5kLCBjaGVjayBpZiBpdCdzIHN0aWxsIHZhbGlkXG5cdFx0XHRcdGNvbnN0IG1VcGRhdGVkTWV0YU1vZGVsRVRhZ3M6IGFueSA9IHt9O1xuXHRcdFx0XHRjb25zdCBtQ2FjaGVkRVRhZ3MgPSBKU09OLnBhcnNlKG1DYWNoZU91dHB1dC5jYWNoZWRFVGFncyk7XG5cdFx0XHRcdGNvbnN0IGFWYWxpZEVUYWdzID0gYXdhaXQgUHJvbWlzZS5hbGwoXG5cdFx0XHRcdFx0T2JqZWN0LmtleXMobUNhY2hlZEVUYWdzKS5tYXAoZnVuY3Rpb24gKHNVcmw6IHN0cmluZykge1xuXHRcdFx0XHRcdFx0Ly8gQ2hlY2sgdmFsaWRpdHkgb2YgZXZlcnkgc2luZ2xlIFVybCB0aGF0J3MgaW4gdGhlIEZFIENhY2hlIG9iamVjdFxuXHRcdFx0XHRcdFx0aWYgKG1DYWNoZWRFVGFnc1tzVXJsXSkge1xuXHRcdFx0XHRcdFx0XHRpZiAobU1ldGFNb2RlbEVUYWdzW3NVcmxdKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gQ2FzZSAjMmEgLSBTYW1lIG51bWJlciBvZiBFVGFncyBpbiB0aGUgY2FjaGUgYW5kIGluIHRoZSBtZXRhZGF0YVxuXHRcdFx0XHRcdFx0XHRcdG1VcGRhdGVkTWV0YU1vZGVsRVRhZ3Nbc1VybF0gPSBtTWV0YU1vZGVsRVRhZ3Nbc1VybF07XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG1DYWNoZWRFVGFnc1tzVXJsXSA9PT0gbU1ldGFNb2RlbEVUYWdzW3NVcmxdO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdC8vIENhc2UgIzJiIC0gTm8gRVRhZyBpbiB0aGUgY2FjaGUgZm9yIHRoYXQgVVJMLCBjYWNoZWRFVGFncyB3YXMgZW5oYW5jZWRcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZ2V0TWV0YWRhdGFFVGFnKHNVcmwsIG1DYWNoZWRFVGFnc1tzVXJsXSwgbVVwZGF0ZWRNZXRhTW9kZWxFVGFncyk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdC8vIENhc2UgIzJ6IC0gTGFzdCBUZW1wbGF0aW5nIGFkZGVkIGFuIFVSTCB3aXRob3V0IEVUYWdcblx0XHRcdFx0XHRcdFx0bVVwZGF0ZWRNZXRhTW9kZWxFVGFnc1tzVXJsXSA9IG1NZXRhTW9kZWxFVGFnc1tzVXJsXTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG1DYWNoZWRFVGFnc1tzVXJsXSA9PT0gbU1ldGFNb2RlbEVUYWdzW3NVcmxdO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdCk7XG5cblx0XHRcdFx0YkNhY2hlTmVlZFVwZGF0ZSA9IGFWYWxpZEVUYWdzLmluZGV4T2YoZmFsc2UpID49IDA7XG5cdFx0XHRcdC8vIENhc2UgIzJhIC0gU2FtZSBudW1iZXIgb2YgRVRhZ3MgYW5kIGFsbCB2YWxpZCAtPiB3ZSByZXR1cm4gdGhlIHZpZXdDYWNoZUtleVxuXHRcdFx0XHQvLyBDYXNlICMyYiAtIERpZmZlcmVudCBudW1iZXIgb2YgRVRhZ3MgYW5kIHN0aWxsIGFsbCB2YWxpZCAtPiB3ZSByZXR1cm4gdGhlIHZpZXdDYWNoZUtleVxuXHRcdFx0XHQvLyBDYXNlICMyYyAtIFNhbWUgbnVtYmVyIG9mIEVUYWdzIGJ1dCBkaWZmZXJlbnQgdmFsdWVzLCBtYWluIHNlcnZpY2UgRXRhZyBoYXMgY2hhbmdlZCwgdXNlIHRoYXQgYXMgY2FjaGUga2V5XG5cdFx0XHRcdC8vIENhc2UgIzJkIC0gRGlmZmVyZW50IG51bWJlciBvZiBFVGFncyBidXQgZGlmZmVyZW50IHZhbHVlLCBtYWluIHNlcnZpY2UgRXRhZyBvciBsaW5rZWQgc2VydmljZSBFdGFnIGhhcyBjaGFuZ2VkLCBuZXcgRVRhZ3Mgc2hvdWxkIGJlIHVzZWQgYXMgY2FjaGVLZXlcblx0XHRcdFx0Ly8gQ2FzZSAjMnogLSBDYWNoZSBoYXMgYW4gaW52YWxpZCBFdGFnIC0gaWYgdGhlcmUgaXMgYW4gRXRhZyBwcm92aWRlZCBmcm9tIE1ldGFNb2RlbCB1c2UgaXQgYXMgY2FjaGVLZXlcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdE9iamVjdC5rZXlzKG1VcGRhdGVkTWV0YU1vZGVsRVRhZ3MpLnNvbWUoZnVuY3Rpb24gKHNVcmw6IHN0cmluZykge1xuXHRcdFx0XHRcdFx0cmV0dXJuICFtVXBkYXRlZE1ldGFNb2RlbEVUYWdzW3NVcmxdO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdC8vIEF0IGxlYXN0IG9uZSBvZiB0aGUgTWV0YU1vZGVsIFVSTHMgZG9lc24ndCBwcm92aWRlIGFuIEVUYWcsIHNvIG5vIGNhY2hpbmdcblx0XHRcdFx0XHRzQ2FjaGVLZXkgPSBudWxsO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHNDYWNoZUtleSA9IGJDYWNoZU5lZWRVcGRhdGUgPyBKU09OLnN0cmluZ2lmeShtVXBkYXRlZE1ldGFNb2RlbEVUYWdzKSA6IG1DYWNoZU91dHB1dC52aWV3Q2FjaGVLZXk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdE9iamVjdC5rZXlzKG1NZXRhTW9kZWxFVGFncykuc29tZShmdW5jdGlvbiAoc1VybDogc3RyaW5nKSB7XG5cdFx0XHRcdFx0cmV0dXJuICFtTWV0YU1vZGVsRVRhZ3Nbc1VybF07XG5cdFx0XHRcdH0pXG5cdFx0XHQpIHtcblx0XHRcdFx0Ly8gQ2hlY2sgaWYgY2FjaGUgY2FuIGJlIHVzZWQgKGFsbCB0aGUgbWV0YWRhdGEgYW5kIGFubm90YXRpb25zIGhhdmUgdG8gcHJvdmlkZSBhdCBsZWFzdCBhIEVUYWcgb3IgYSBMYXN0LU1vZGlmaWVkIGhlYWRlcilcblx0XHRcdFx0Ly8gQ2FzZSAjMS1iIC0gTm8gQ2FjaGUsIG1DYWNoZU91cHV0IGlzIGVtcHR5LCBidXQgbWV0YW1vZGVsIGV0YWdzIGNhbm5vdCBiZSB1c2VkLCBzbyBubyBjYWNoaW5nXG5cdFx0XHRcdGJDYWNoZU5lZWRVcGRhdGUgPSB0cnVlO1xuXHRcdFx0XHRzQ2FjaGVLZXkgPSBudWxsO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdC8vIERvbid0IHVzZSB2aWV3IGNhY2hlIGluIGNhc2Ugb2YgaXNzdWVzIHdpdGggdGhlIExSVSBjYWNoZVxuXHRcdFx0YkNhY2hlTmVlZFVwZGF0ZSA9IHRydWU7XG5cdFx0XHRzQ2FjaGVLZXkgPSBudWxsO1xuXHRcdH1cblxuXHRcdHRoaXMubUNhY2hlTmVlZHNJbnZhbGlkYXRlW3NDYWNoZUlkZW50aWZpZXJdID0gYkNhY2hlTmVlZFVwZGF0ZTtcblx0XHRyZXR1cm4gc0NhY2hlS2V5O1xuXHR9XG5cblx0aW52YWxpZGF0ZUlmTmVlZGVkKHNDYWNoZUtleXM6IHN0cmluZywgc0NhY2hlSWRlbnRpZmllcjogc3RyaW5nLCBvQ29tcG9uZW50OiBhbnkpIHtcblx0XHQvLyBDaGVjayBGRSBjYWNoZSBhZnRlciBYTUwgdmlldyBpcyBwcm9jZXNzZWQgY29tcGxldGVseVxuXHRcdGNvbnN0IHNEYXRhU291cmNlRVRhZ3MgPSBKU09OLnN0cmluZ2lmeSh0aGlzLmdldEVUYWdzKG9Db21wb25lbnQpKTtcblx0XHRpZiAodGhpcy5tQ2FjaGVOZWVkc0ludmFsaWRhdGVbc0NhY2hlSWRlbnRpZmllcl0gfHwgKHNDYWNoZUtleXMgJiYgc0NhY2hlS2V5cyAhPT0gc0RhdGFTb3VyY2VFVGFncykpIHtcblx0XHRcdC8vIFNvbWV0aGluZyBpbiB0aGUgc291cmNlcyBhbmQvb3IgaXRzIEVUYWdzIGNoYW5nZWQgLT4gdXBkYXRlIHRoZSBGRSBjYWNoZVxuXHRcdFx0Y29uc3QgbUNhY2hlS2V5czogYW55ID0ge307XG5cdFx0XHQvLyBOZXcgRVRhZ3MgdGhhdCBuZWVkIHRvIGJlIHZlcmlmaWVkLCBtYXkgZGlmZmVyIGZyb20gdGhlIG9uZSB1c2VkIHRvIGdlbmVyYXRlIHRoZSB2aWV3XG5cdFx0XHRtQ2FjaGVLZXlzLmNhY2hlZEVUYWdzID0gc0RhdGFTb3VyY2VFVGFncztcblx0XHRcdC8vIE9sZCBFVGFncyB0aGF0IGFyZSB1c2VkIGZvciB0aGUgeG1sIHZpZXcgY2FjaGUgYXMga2V5XG5cdFx0XHRtQ2FjaGVLZXlzLnZpZXdDYWNoZUtleSA9IHNDYWNoZUtleXM7XG5cdFx0XHRyZXR1cm4gQ2FjaGVNYW5hZ2VyLnNldChzQ2FjaGVJZGVudGlmaWVyLCBtQ2FjaGVLZXlzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdH1cblx0fVxuXG5cdGdldEVUYWdzKG9Db21wb25lbnQ6IGFueSkge1xuXHRcdGNvbnN0IG1NZXRhTW9kZWxFVGFncyA9ICh0aGlzLm9NZXRhTW9kZWwgYXMgYW55KS5nZXRFVGFncygpO1xuXHRcdC8vIEVUYWdzIGZyb20gVUk1IGFyZSBlaXRoZXIgYSBEYXRlIG9yIGEgc3RyaW5nLCBsZXQncyByYXRpb25hbGl6ZSB0aGF0XG5cdFx0T2JqZWN0LmtleXMobU1ldGFNb2RlbEVUYWdzKS5mb3JFYWNoKGZ1bmN0aW9uIChzTWV0YU1vZGVsS2V5OiBzdHJpbmcpIHtcblx0XHRcdGlmIChtTWV0YU1vZGVsRVRhZ3Nbc01ldGFNb2RlbEtleV0gaW5zdGFuY2VvZiBEYXRlKSB7XG5cdFx0XHRcdC8vIE1ldGFNb2RlbCBjb250YWlucyBhIExhc3QtTW9kaWZpZWQgdGltZXN0YW1wIGZvciB0aGUgVVJMXG5cdFx0XHRcdG1NZXRhTW9kZWxFVGFnc1tzTWV0YU1vZGVsS2V5XSA9IG1NZXRhTW9kZWxFVGFnc1tzTWV0YU1vZGVsS2V5XS50b0lTT1N0cmluZygpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gYWRkIGFsc28gdGhlIG1hbmlmZXN0IGhhc2ggYXMgVUk1IG9ubHkgY29uc2lkZXJzIHRoZSByb290IGNvbXBvbmVudCBoYXNoXG5cdFx0Y29uc3Qgb01hbmlmZXN0Q29udGVudDogYW55ID0gdGhpcy5vQXBwQ29tcG9uZW50LmdldE1hbmlmZXN0KCk7XG5cdFx0Y29uc3Qgc01hbmlmZXN0SGFzaCA9IGhhc2goXG5cdFx0XHRKU09OLnN0cmluZ2lmeSh7XG5cdFx0XHRcdHNhcEFwcDogb01hbmlmZXN0Q29udGVudFtcInNhcC5hcHBcIl0sXG5cdFx0XHRcdHZpZXdEYXRhOiBvQ29tcG9uZW50LmdldFZpZXdEYXRhKClcblx0XHRcdH0pXG5cdFx0KTtcblx0XHRtTWV0YU1vZGVsRVRhZ3NbXCJtYW5pZmVzdFwiXSA9IHNNYW5pZmVzdEhhc2g7XG5cdFx0cmV0dXJuIG1NZXRhTW9kZWxFVGFncztcblx0fVxuXG5cdGdldEludGVyZmFjZSgpOiBhbnkge1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59XG5cbmNsYXNzIENhY2hlSGFuZGxlclNlcnZpY2VGYWN0b3J5IGV4dGVuZHMgU2VydmljZUZhY3Rvcnk8Q2FjaGVIYW5kbGVyU2VydmljZVNldHRpbmdzPiB7XG5cdF9vSW5zdGFuY2VSZWdpc3RyeTogUmVjb3JkPHN0cmluZywgQ2FjaGVIYW5kbGVyU2VydmljZSB8IG51bGw+ID0ge307XG5cblx0Y3JlYXRlSW5zdGFuY2Uob1NlcnZpY2VDb250ZXh0OiBTZXJ2aWNlQ29udGV4dDxDYWNoZUhhbmRsZXJTZXJ2aWNlU2V0dGluZ3M+KSB7XG5cdFx0Y29uc3Qgc01ldGFNb2RlbElkID0gb1NlcnZpY2VDb250ZXh0LnNldHRpbmdzLm1ldGFNb2RlbC5nZXRJZCgpO1xuXHRcdGxldCBjYWNoZUhhbmRsZXJJbnN0YW5jZSA9IHRoaXMuX29JbnN0YW5jZVJlZ2lzdHJ5W3NNZXRhTW9kZWxJZF07XG5cdFx0aWYgKCFjYWNoZUhhbmRsZXJJbnN0YW5jZSkge1xuXHRcdFx0dGhpcy5fb0luc3RhbmNlUmVnaXN0cnlbc01ldGFNb2RlbElkXSA9IGNhY2hlSGFuZGxlckluc3RhbmNlID0gbmV3IENhY2hlSGFuZGxlclNlcnZpY2UoXG5cdFx0XHRcdE9iamVjdC5hc3NpZ24oXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZmFjdG9yeTogdGhpcyxcblx0XHRcdFx0XHRcdHNjb3BlT2JqZWN0OiBudWxsLFxuXHRcdFx0XHRcdFx0c2NvcGVUeXBlOiBcInNlcnZpY2VcIlxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0b1NlcnZpY2VDb250ZXh0XG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNhY2hlSGFuZGxlckluc3RhbmNlLmluaXRQcm9taXNlXG5cdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9vSW5zdGFuY2VSZWdpc3RyeVtzTWV0YU1vZGVsSWRdIGFzIENhY2hlSGFuZGxlclNlcnZpY2U7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKChlOiBhbnkpID0+IHtcblx0XHRcdFx0Ly8gSW4gY2FzZSBvZiBlcnJvciBkZWxldGUgdGhlIGdsb2JhbCBpbnN0YW5jZTtcblx0XHRcdFx0dGhpcy5fb0luc3RhbmNlUmVnaXN0cnlbc01ldGFNb2RlbElkXSA9IG51bGw7XG5cdFx0XHRcdHRocm93IGU7XG5cdFx0XHR9KTtcblx0fVxuXG5cdGdldEluc3RhbmNlKG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsKSB7XG5cdFx0cmV0dXJuIHRoaXMuX29JbnN0YW5jZVJlZ2lzdHJ5W29NZXRhTW9kZWwuZ2V0SWQoKV07XG5cdH1cblxuXHRyZW1vdmVHbG9iYWxJbnN0YW5jZShvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCkge1xuXHRcdHRoaXMuX29JbnN0YW5jZVJlZ2lzdHJ5W29NZXRhTW9kZWwuZ2V0SWQoKV0gPSBudWxsO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENhY2hlSGFuZGxlclNlcnZpY2VGYWN0b3J5O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7O0VBU0EsU0FBU0EsZUFBZSxDQUFDQyxJQUFTLEVBQUVDLEtBQVUsRUFBRUMsc0JBQTJCLEVBQUU7SUFDNUUsT0FBTyxJQUFJQyxPQUFPLENBQUMsVUFBVUMsT0FBTyxFQUFFO01BQ3JDO01BQ0NDLE1BQU0sQ0FDTEMsSUFBSSxDQUFDTixJQUFJLEVBQUU7UUFBRU8sTUFBTSxFQUFFO01BQU0sQ0FBQyxDQUFDLENBQzdCQyxJQUFJLENBQUMsVUFBVUMsU0FBYyxFQUFFQyxXQUFnQixFQUFFQyxLQUFVLEVBQUU7UUFDN0Q7UUFDQTtRQUNBO1FBQ0FULHNCQUFzQixDQUFDRixJQUFJLENBQUMsR0FBR1csS0FBSyxDQUFDQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsSUFBSUQsS0FBSyxDQUFDQyxpQkFBaUIsQ0FBQyxlQUFlLENB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