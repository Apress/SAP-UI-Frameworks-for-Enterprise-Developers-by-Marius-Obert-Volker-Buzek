/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/ui/util/Storage"], function (Storage) {
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
  var BrowserPersonalizationStorage = /*#__PURE__*/function () {
    function BrowserPersonalizationStorage() {
      var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "default";
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "local";
      _classCallCheck(this, BrowserPersonalizationStorage);
      this.prefix = prefix;
      this.storage = new Storage(type);
      if (!this.storage.isSupported()) {
        throw new Error("Storage of type ".concat(type, " is not supported by UI5 in this environment"));
      }
    }
    _createClass(BrowserPersonalizationStorage, [{
      key: "isStorageOfPersonalDataAllowed",
      value: function isStorageOfPersonalDataAllowed() {
        return true;
      }
    }, {
      key: "save",
      value: function save() {
        return Promise.resolve();
      }
    }, {
      key: "getItem",
      value: function getItem(key) {
        return this.storage.get(this.prefix + ".Search.Personalization." + key);
      }
    }, {
      key: "setItem",
      value: function setItem(key, data) {
        return this.storage.put(this.prefix + ".Search.Personalization." + key, data);
        // officially this store only accepts strings as data, see
        // https://sapui5.hana.ondemand.com/#/api/module:sap/ui/util/Storage
        // but it was used the wrong way until now (.ts conversion) and for
        // compatibility reasons this method still accepts everything/unknown
        // until we can change all setItem callers. Then uncomment this code:
        // if (typeof data === "string") {
        //     return this.storage.put(this.prefix + ".Search.Personalization." + key, data);
        // }
        // throw new Error("BrowserPersonalizationStorage can only store strings!");
      }
    }, {
      key: "deleteItem",
      value: function deleteItem(key) {
        this.storage.remove(key);
      }
    }], [{
      key: "create",
      value: function create(prefix) {
        try {
          return Promise.resolve(new BrowserPersonalizationStorage(prefix));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }]);
    return BrowserPersonalizationStorage;
  }();
  return BrowserPersonalizationStorage;
});
})();