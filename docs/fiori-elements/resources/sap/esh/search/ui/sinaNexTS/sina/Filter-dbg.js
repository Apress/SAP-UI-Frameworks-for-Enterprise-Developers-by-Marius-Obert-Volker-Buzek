/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./SinaObject", "./SimpleCondition", "./ComplexCondition", "./LogicalOperator", "../core/errors", "./HierarchyDisplayType"], function (___SinaObject, ___SimpleCondition, ___ComplexCondition, ___LogicalOperator, ___core_errors, ___HierarchyDisplayType) {
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
  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    Object.defineProperty(subClass, "prototype", {
      writable: false
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }
  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };
    return _setPrototypeOf(o, p);
  }
  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();
    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
        result;
      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;
        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }
      return _possibleConstructorReturn(this, result);
    };
  }
  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }
    return _assertThisInitialized(self);
  }
  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
  }
  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;
    try {
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }
  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
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
  var SinaObject = ___SinaObject["SinaObject"];
  var SimpleCondition = ___SimpleCondition["SimpleCondition"];
  var ComplexCondition = ___ComplexCondition["ComplexCondition"];
  var LogicalOperator = ___LogicalOperator["LogicalOperator"];
  var CanOnlyAutoInsertComplexConditionError = ___core_errors["CanOnlyAutoInsertComplexConditionError"];
  var SinaProgramError = ___core_errors["SinaProgramError"];
  var HierarchyDisplayType = ___HierarchyDisplayType["HierarchyDisplayType"];
  var Filter = /*#__PURE__*/function (_SinaObject) {
    _inherits(Filter, _SinaObject);
    var _super = _createSuper(Filter);
    // _meta: {
    //     properties: {
    //         dataSource: {
    //             required: false,
    //             default: function () {
    //                 return this.sina.getAllDataSource();
    //             }
    //         },
    //         searchTerm: {
    //             required: false,
    //             default: '',
    //             setter: true
    //         },
    //         rootCondition: {
    //             required: false,
    //             default: function () {
    //                 return this.sina.createComplexCondition();
    //             },
    //             setter: true
    //         }
    //     }
    // },

    function Filter(properties) {
      var _properties$dataSourc, _properties$searchTer, _properties$rootCondi;
      var _this;
      _classCallCheck(this, Filter);
      _this = _super.call(this, properties);
      _defineProperty(_assertThisInitialized(_this), "searchTerm", "");
      _this.dataSource = (_properties$dataSourc = properties.dataSource) !== null && _properties$dataSourc !== void 0 ? _properties$dataSourc : _this.sina.getAllDataSource();
      _this.searchTerm = (_properties$searchTer = properties.searchTerm) !== null && _properties$searchTer !== void 0 ? _properties$searchTer : _this.searchTerm;
      _this.rootCondition = (_properties$rootCondi = properties.rootCondition) !== null && _properties$rootCondi !== void 0 ? _properties$rootCondi : new ComplexCondition({
        sina: _this.sina
      });
      return _this;
    }
    _createClass(Filter, [{
      key: "setSearchTerm",
      value: function setSearchTerm(searchTerm) {
        this.searchTerm = searchTerm;
      }
    }, {
      key: "setRootCondition",
      value: function setRootCondition(rootCondition) {
        this.rootCondition = rootCondition;
      }
    }, {
      key: "clone",
      value: function clone() {
        return new Filter({
          sina: this.sina,
          dataSource: this.dataSource,
          searchTerm: this.searchTerm,
          rootCondition: this.rootCondition.clone()
        });
      }
    }, {
      key: "equals",
      value: function equals(other) {
        return other instanceof Filter && this.dataSource === other.dataSource && this.searchTerm === other.searchTerm && this.rootCondition.equals(other.rootCondition);
      }
    }, {
      key: "_getAttribute",
      value: function _getAttribute(condition) {
        if (condition instanceof SimpleCondition) {
          return condition.attribute;
        }
        for (var i = 0; i < condition.conditions.length; ++i) {
          var attribute = this._getAttribute(condition.conditions[i]);
          if (attribute) {
            return attribute;
          }
        }
      }
    }, {
      key: "setDataSource",
      value: function setDataSource(dataSource) {
        if (this.dataSource === dataSource) {
          return;
        }
        this.dataSource = dataSource;
        this.resetConditions();
      }
    }, {
      key: "resetConditions",
      value: function resetConditions() {
        this.rootCondition.resetConditions();
      }
    }, {
      key: "autoInsertCondition",
      value: function autoInsertCondition(condition) {
        // consistency check
        if (!(this.rootCondition instanceof ComplexCondition)) {
          throw new CanOnlyAutoInsertComplexConditionError("cannot auto insert condition - filter root condition is not a complex condition");
        }

        // identify complex condition which is responsible for the attribute -> matchCondition
        var attribute = this._getAttribute(condition);
        var matchCondition, currentCondition;
        for (var i = 0; i < this.rootCondition.conditions.length; ++i) {
          currentCondition = this.rootCondition.conditions[i];
          var currentAttribute = this._getAttribute(currentCondition);
          if (currentAttribute === attribute) {
            matchCondition = currentCondition;
            break;
          }
        }

        // if there is no matchCondition -> create
        if (!matchCondition) {
          matchCondition = this.sina.createComplexCondition({
            operator: LogicalOperator.Or
          });
          this.rootCondition.addCondition(matchCondition);
        }

        // prevent duplicate conditions
        for (var j = 0; j < matchCondition.conditions.length; ++j) {
          currentCondition = matchCondition.conditions[j];
          if (currentCondition.equals(condition)) {
            return;
          }
        }

        // add condition
        matchCondition.addCondition(condition);
      }
    }, {
      key: "autoRemoveCondition",
      value: function autoRemoveCondition(condition) {
        // helper
        var removeCondition = function removeCondition(complexCondition, condition) {
          for (var i = 0; i < complexCondition.conditions.length; ++i) {
            var subCondition = complexCondition.conditions[i];
            if (subCondition.equals(condition)) {
              complexCondition.removeConditionAt(i);
              i--;
              continue;
            }
            if (subCondition instanceof ComplexCondition) {
              removeCondition(subCondition, condition);
              if (subCondition.conditions.length === 0) {
                complexCondition.removeConditionAt(i);
                i--;
                continue;
              }
            }
          }
        };

        // remove
        removeCondition(this.rootCondition, condition);
      }
    }, {
      key: "isFolderMode",
      value: function isFolderMode() {
        var _this$sina$configurat;
        // 1. check feature flag
        if (!((_this$sina$configurat = this.sina.configuration) !== null && _this$sina$configurat !== void 0 && _this$sina$configurat.folderMode)) {
          return false;
        }
        // 2. check metadata
        // 2.1 check for hierarchy attribute in datsource
        var hierarchyAttributes = this.dataSource.attributesMetadata.filter(function (attribute) {
          return attribute.isHierarchy && attribute.hierarchyDisplayType === HierarchyDisplayType.StaticHierarchyFacet;
        });
        var hierarchyAttributeExists = hierarchyAttributes.length > 0;
        // 2.2 check whether datasource itself is a hierarchy datasource
        var isHierarchyDataSource = this.dataSource.isHierarchyDefinition && this.dataSource.hierarchyDisplayType === HierarchyDisplayType.HierarchyResultView;
        if (!hierarchyAttributeExists && !isHierarchyDataSource) {
          return false;
        }
        // 3. check searchterm and filter conditions
        var folderAttribute = this.getFolderAttribute();
        var filterAttributes = this.rootCondition.getAttributes();
        var noneFolderFilterAttributes = filterAttributes.filter(function (attribute) {
          return attribute != folderAttribute;
        });
        var folderFilterAttributes = filterAttributes.filter(function (attribute) {
          return attribute === folderAttribute;
        });
        if (folderFilterAttributes.length === 0) {
          return false;
        }
        if ((this.searchTerm.length === 0 || this.searchTerm.trim() === "*") && noneFolderFilterAttributes.length === 0) {
          return true;
        }
        return false;
      }
    }, {
      key: "getFolderAttribute",
      value: function getFolderAttribute() {
        // use case 1: we are displaying an hierarchy (helper) datasource
        if (this.dataSource.isHierarchyDefinition && this.dataSource.hierarchyDisplayType === HierarchyDisplayType.HierarchyResultView) {
          return this.dataSource.hierarchyAttribute;
        }
        // use case 2: we display a "regular" datasource with associatea hierarchy helper datasource
        var hierarchyAttributes = this.dataSource.attributesMetadata.filter(function (attribute) {
          return attribute.isHierarchy && attribute.hierarchyDisplayType === HierarchyDisplayType.StaticHierarchyFacet;
        });
        if (hierarchyAttributes.length === 0) {
          throw new SinaProgramError();
        }
        return hierarchyAttributes[0].id;
      }
    }, {
      key: "toJson",
      value: function toJson() {
        return {
          dataSource: this.dataSource.toJson(),
          searchTerm: this.searchTerm,
          rootCondition: this.rootCondition.toJson()
        };
      }
    }]);
    return Filter;
  }(SinaObject);
  var __exports = {
    __esModule: true
  };
  __exports.Filter = Filter;
  return __exports;
});
})();