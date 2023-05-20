/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
sap.ui.define(["../SearchHelper"], function (___SearchHelper) {
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
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var convertJQueryDeferredToPromise = ___SearchHelper["convertJQueryDeferredToPromise"];
  var FLPPersonalizationStorage = /*#__PURE__*/function () {
    function FLPPersonalizationStorage(container) {
      _classCallCheck(this, FLPPersonalizationStorage);
      _defineProperty(this, "eshIsStorageOfPersonalDataAllowedKey", "ESH-IsStorageOfPersonalDataAllowed");
      this.container = container;
    }
    _createClass(FLPPersonalizationStorage, [{
      key: "deletePersonalData",
      value: function deletePersonalData() {
        return _await();
      } // this.searchModel.getRecentlyUsedStore().deleteAllItems();
    }, {
      key: "setIsStorageOfPersonalDataAllowed",
      value: function setIsStorageOfPersonalDataAllowed(isAllowed) {
        this.setItem(this.eshIsStorageOfPersonalDataAllowedKey, isAllowed);
      }
    }, {
      key: "isStorageOfPersonalDataAllowed",
      value: function isStorageOfPersonalDataAllowed() {
        var isAllowed = this.getItem(this.eshIsStorageOfPersonalDataAllowedKey);
        if (typeof isAllowed === "boolean") {
          return isAllowed;
        }
        return true;
      }
    }, {
      key: "save",
      value: function save() {
        var deferred = this.container.save();
        return convertJQueryDeferredToPromise(deferred);
      }
    }, {
      key: "getItem",
      value: function getItem(key) {
        key = this.limitLength(key);
        return this.container.getItemValue(key);
      }
    }, {
      key: "setItem",
      value: function setItem(key, data) {
        key = this.limitLength(key);
        var oldData = this.getItem(key);
        if (JSON.stringify(oldData) === JSON.stringify(data)) {
          return true;
        }
        // eslint-disable-next-line @typescript-eslint/ban-types
        this.container.setItemValue(key, data);
        this.save();
        return true;
      }
    }, {
      key: "deleteItem",
      value: function deleteItem(key) {
        this.container.delItem(key);
      }
    }, {
      key: "limitLength",
      value: function limitLength(key) {
        return key.slice(-40);
      }
    }], [{
      key: "create",
      value: function create() {
        try {
          var servicePromise = sap.ushell.Container.getServiceAsync("Personalization").then(function (service) {
            return service.getContainer("ushellSearchPersoServiceContainer");
          }).then(function (container) {
            return new FLPPersonalizationStorage(container);
          });
          return _await(servicePromise);
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }]);
    return FLPPersonalizationStorage;
  }();
  return FLPPersonalizationStorage;
});
})();