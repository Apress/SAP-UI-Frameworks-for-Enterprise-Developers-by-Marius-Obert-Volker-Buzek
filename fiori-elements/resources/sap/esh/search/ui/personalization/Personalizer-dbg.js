/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define([], function () {
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
  var Personalizer = /*#__PURE__*/function () {
    function Personalizer(key, personalizationStorageInstance) {
      _classCallCheck(this, Personalizer);
      this.key = key;
      this.personalizationStorageInstance = personalizationStorageInstance;
      this.key = key;
      this.personalizationStorageInstance = personalizationStorageInstance;
    }
    _createClass(Personalizer, [{
      key: "getKey",
      value: function getKey() {
        return this.key;
      }
    }, {
      key: "setPersData",
      value: function setPersData(data) {
        // sap.m.TablePersoController uses deferred.done()
        // NOT to convert to promise
        return jQuery.Deferred().resolve(this.personalizationStorageInstance.setItem(this.key, data));
      }
    }, {
      key: "getPersData",
      value: function getPersData() {
        // sap.m.TablePersoController uses deferred.done()
        // NOT to convert to promise
        return jQuery.Deferred().resolve(this.personalizationStorageInstance.getItem(this.key));
      }
    }, {
      key: "getResetPersData",
      value: function getResetPersData() {
        // sap.m.TablePersoController uses deferred.done()
        // NOT to convert to promise
        return jQuery.Deferred().resolve(this.personalizationStorageInstance.getItem(this.key + "INITIAL"));
      }
    }]);
    return Personalizer;
  }();
  return Personalizer;
});
})();