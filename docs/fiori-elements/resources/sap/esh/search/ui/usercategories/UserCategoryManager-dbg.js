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
sap.ui.define(["../i18n", "sap/esh/search/ui/SearchHelper", "../error/errors"], function (__i18n, sap_esh_search_ui_SearchHelper, ___error_errors) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;
        var F = function () {};
        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true,
      didErr = false,
      err;
    return {
      s: function () {
        it = it.call(o);
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
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
  var i18n = _interopRequireDefault(__i18n);
  var isSearchAppActive = sap_esh_search_ui_SearchHelper["isSearchAppActive"];
  var ProgramError = ___error_errors["ProgramError"];
  var myFavDataStore = "my-fav-data";
  var UserCategoryManager = /*#__PURE__*/function () {
    function UserCategoryManager(properties) {
      _classCallCheck(this, UserCategoryManager);
      this.active = false;
      this.lastActive = false;
      this.categories = [];
      this.personalizationStorage = properties.personalizationStorage;
      this.sina = properties.sina;
    }
    _createClass(UserCategoryManager, [{
      key: "initAsync",
      value: function initAsync() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var that = this;
        var userCategory;
        var sinaSubDataSources;
        var undefinedSubDataSourceIds = [];
        var myFavData = this.personalizationStorage.getItem(myFavDataStore);
        if (!this.isPersonalizationStorageItem(myFavData)) {
          throw new ProgramError(null, "wrong myFavData type");
        }

        /* // example for storage
                        personalizationStorageInstance.setItem('my-fav-data', {
                            active: true,
                            userCatgories: [{
                                id: 'MyFavorites',
                                includeApps: true
                                subDataSources: [{
                                    id: 'CD$ALL~ZESH_EPM_P_DEMO~'
                                }, {
                                    id: 'CD$ALL~ZESH_EPM_S_DEMO~'
                                }]
                            }]
                        });*/

        // No FavData exists
        if (!myFavData) {
          userCategory = this.sina.createDataSource({
            id: "MyFavorites",
            label: i18n.getText("label_userFavorites"),
            labelPlural: i18n.getText("label_userFavorites"),
            type: this.sina.DataSourceType.UserCategory,
            includeApps: false,
            subDataSources: [],
            undefinedSubDataSourceIds: []
          });
          this.categories.push(userCategory);
          return Promise.resolve();
        }
        this.setFavActive(myFavData.active);
        if (!this.isFavActive()) {
          // null or undefined
          this.setFavActive(false);
        }
        this.setLastFavActive(this.isFavActive());

        // convert subDataSources from personalizationStorage into sina datasources
        // if not possible -> add subDataSource to undefinedSubDataSourceIds
        var _iterator = _createForOfIteratorHelper(myFavData.userCatgories),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var favUserCategory = _step.value;
            var subDataSources = favUserCategory.subDataSources;
            if (subDataSources) {
              sinaSubDataSources = subDataSources.map(function (dataSource) {
                var sinaSubDataSource = that.sina.getDataSource(dataSource.id);
                if (!sinaSubDataSource) {
                  undefinedSubDataSourceIds.push(dataSource.id);
                }
                return sinaSubDataSource;
              });
            } else {
              sinaSubDataSources = [];
            }

            // delete all undefined entries (datasources which do not exist currently)
            sinaSubDataSources = sinaSubDataSources.filter(function (x) {
              return x;
            });

            // DataSourceType.UserCategory: switch in sina.js createDataSource depending on DataSourceType
            userCategory = this.sina.createDataSource({
              id: favUserCategory.id,
              label: i18n.getText("label_userFavorites"),
              labelPlural: i18n.getText("label_userFavorites"),
              type: this.sina.DataSourceType.UserCategory,
              includeApps: favUserCategory.includeApps || false,
              subDataSources: sinaSubDataSources,
              undefinedSubDataSourceIds: undefinedSubDataSourceIds
            });
            this.categories.push(userCategory);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        return Promise.resolve();
      }
    }, {
      key: "isPersonalizationStorageItem",
      value: function isPersonalizationStorageItem(object) {
        return true;
      }
    }, {
      key: "getCategory",
      value: function getCategory(id) {
        var _iterator2 = _createForOfIteratorHelper(this.categories),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var category = _step2.value;
            if (category.id === id) {
              return category;
            }
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
        return null;
      }
    }, {
      key: "isFavActive",
      value: function isFavActive() {
        return this.active;
      }
    }, {
      key: "setFavActive",
      value: function setFavActive(active) {
        this.active = active;
      }
    }, {
      key: "isLastFavActive",
      value: function isLastFavActive() {
        return this.lastActive;
      }
    }, {
      key: "setLastFavActive",
      value: function setLastFavActive(value) {
        this.lastActive = value;
      }
    }, {
      key: "save",
      value: function save() {
        var categoriesJson = [];

        // check change of subDataSources
        // convert sina -> Fav format
        var _iterator3 = _createForOfIteratorHelper(this.categories),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var category = _step3.value;
            var subDataSourceList = [];
            // add subDataSources (active)
            var _iterator4 = _createForOfIteratorHelper(category.subDataSources),
              _step4;
            try {
              for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                var subDataSource = _step4.value;
                subDataSourceList.push({
                  id: subDataSource.id
                });
              }
              // add undefinedSubDataSources (inactive)
            } catch (err) {
              _iterator4.e(err);
            } finally {
              _iterator4.f();
            }
            var _iterator5 = _createForOfIteratorHelper(category.undefinedSubDataSourceIds),
              _step5;
            try {
              for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                var undefinedSubDataSourceId = _step5.value;
                subDataSourceList.push({
                  id: undefinedSubDataSourceId
                });
              }
            } catch (err) {
              _iterator5.e(err);
            } finally {
              _iterator5.f();
            }
            categoriesJson.push({
              id: category.id,
              includeApps: category.includeApps,
              subDataSources: subDataSourceList
            });
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
        this.personalizationStorage.setItem(myFavDataStore, {
          active: this.isFavActive(),
          userCatgories: categoriesJson
        });
        // save must be finished before reload
        // timeout necessary for MessageToast display with success message for save
        this.personalizationStorage.saveNotDelayed().then(function () {
          //search used and flag for 'Use Personalized Search Scope' changed => reset to home URL required
          //refresh of search dropdown listbox
          if (isSearchAppActive() && this.isLastFavActive() !== this.isFavActive()) {
            var result = new RegExp(/^[^#]*#/).exec(window.location.href); //new RegExp('^[^#]*') without # /
            var sUrl = result[0];
            setTimeout(function () {
              window.location.assign(sUrl);
              window.location.reload();
            }, 2000);
          } else if (
          //search not used and flag for 'Use Personalized Search Scope' changed --> refresh of search dropdown listbox OR
          //when search used and flag for 'Use Personalized Search Scope' not changed --> refresh for tree update after change of My Favorites
          !isSearchAppActive() && this.isLastFavActive() !== this.isFavActive() || isSearchAppActive() && this.isLastFavActive() === this.isFavActive()) {
            setTimeout(function () {
              window.location.reload();
            }, 2000);
          }
        }.bind(this));
      }
    }], [{
      key: "create",
      value: function create(properties) {
        try {
          var instance = new UserCategoryManager(properties);
          return _await(instance.initAsync(), function () {
            return instance;
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }]);
    return UserCategoryManager;
  }();
  return UserCategoryManager;
});
})();