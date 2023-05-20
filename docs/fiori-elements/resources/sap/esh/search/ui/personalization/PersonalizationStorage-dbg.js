/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./Personalizer"], function (__Personalizer) {
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
  var Personalizer = _interopRequireDefault(__Personalizer);
  var PersonalizationStorage = /*#__PURE__*/function () {
    function PersonalizationStorage(keyValueStore, searchModel) {
      var prefix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "default";
      _classCallCheck(this, PersonalizationStorage);
      this.keyValueStore = keyValueStore;
      this.searchModel = searchModel;
      this.prefix = prefix;
    }
    _createClass(PersonalizationStorage, [{
      key: "isStorageOfPersonalDataAllowed",
      value: function isStorageOfPersonalDataAllowed() {
        return this.keyValueStore.isStorageOfPersonalDataAllowed({
          searchModel: this.searchModel
        });
      }
    }, {
      key: "saveNotDelayed",
      value: function saveNotDelayed() {
        return Promise.resolve();
      }
    }, {
      key: "save",
      value: function save() {
        return this.keyValueStore.save({
          searchModel: this.searchModel
        });
      }
    }, {
      key: "getPersonalizer",
      value: function getPersonalizer(key) {
        return new Personalizer(key, this);
      }
    }, {
      key: "deleteItem",
      value: function deleteItem(key) {
        this.keyValueStore.deleteItem(key, {
          searchModel: this.searchModel
        });
      }
    }, {
      key: "getItem",
      value: function getItem(key) {
        return this.keyValueStore.getItem(key, {
          searchModel: this.searchModel
        });
      }
    }, {
      key: "setItem",
      value: function setItem(key, data) {
        return this.keyValueStore.setItem(key, data, {
          searchModel: this.searchModel
        });
      }
    }]);
    return PersonalizationStorage;
  }();
  return PersonalizationStorage;
});
})();