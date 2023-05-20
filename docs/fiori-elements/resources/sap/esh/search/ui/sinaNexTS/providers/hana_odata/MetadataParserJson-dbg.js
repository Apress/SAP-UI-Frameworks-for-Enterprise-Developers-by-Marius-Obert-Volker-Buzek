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
sap.ui.define(["../../sina/DataSourceType", "./MetadataParser"], function (____sina_DataSourceType, ___MetadataParser) {
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
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
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  /* eslint-disable @typescript-eslint/no-var-requires */
  /* eslint-disable @typescript-eslint/no-this-alias */
  var DataSourceType = ____sina_DataSourceType["DataSourceType"];
  var MetadataParser = ___MetadataParser["MetadataParser"];
  var MetadataParserJson = /*#__PURE__*/function (_MetadataParser) {
    _inherits(MetadataParserJson, _MetadataParser);
    var _super = _createSuper(MetadataParserJson);
    function MetadataParserJson(provider) {
      _classCallCheck(this, MetadataParserJson);
      return _super.call(this, provider);
    }
    _createClass(MetadataParserJson, [{
      key: "fireRequest",
      value: function fireRequest(client, url) {
        try {
          return _await(client.getJson(url));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "parseResponse",
      value: function parseResponse(metaJson) {
        try {
          const _this = this;
          // all in one metadata map
          var allInOneMap = {
            businessObjectMap: {},
            // entity map with attributes and entityset name as key
            businessObjectList: [],
            // list of all entities for convenience
            dataSourceMap: {},
            // datasource map with entityset name as key
            dataSourcesList: [] // list of all datasources for convenience
          };

          var metaData = metaJson.data && metaJson.data.metadata || metaJson.data || metaJson;
          var entityContainer = metaData["$EntityContainer"];
          if (typeof entityContainer !== "string" || entityContainer.length < 1) {
            throw "Meta data contains invalid EntityContainer!";
          }
          var aEntityContainer = entityContainer.split(".");
          var schemaNameSpace = aEntityContainer[0];
          var entityContainerName = aEntityContainer[1];
          var schemaObject = metaData[schemaNameSpace];
          var entityContainerObject = schemaObject[entityContainerName];
          var helperMap = _this._parseEntityType(schemaNameSpace, schemaObject, entityContainerName, entityContainerObject);
          _this._parseEntityContainer(entityContainerObject, helperMap, allInOneMap);
          return _await(allInOneMap);
        } catch (e) {
          return Promise.reject(e);
        }
      }

      //parse entityset and its attributes from EntityType
    }, {
      key: "_parseEntityType",
      value: function _parseEntityType(schemaNameSpace, schemaObject, entityContainerName, entityContainerObject) {
        var helperMap = {};
        for (var entityTypeName in schemaObject) {
          // Skip entityContainerObject
          if (entityTypeName === entityContainerName) {
            continue;
          }
          var entityTypeOrigin = schemaObject[entityTypeName];
          if (entityTypeOrigin["@EnterpriseSearch.enabled"] !== true) {
            continue;
          }
          entityTypeName = entityTypeName.substring(0, entityTypeName.length - 4);
          var entityType = {
            schema: schemaNameSpace,
            keys: [],
            attributeMap: {},
            // resourceBundle: "" as any,
            // labelResourceBundle: "",
            label: entityContainerObject[entityTypeName]["@SAP.Common.Label"] || "",
            labelPlural: entityContainerObject[entityTypeName]["@SAP.Common.Label"] || "",
            annotations: {}
          };
          helperMap[entityTypeName] = entityType;

          // resourceBundle brings dependencies to window and jQuery
          // activate this if necessary
          // const resourceBundle = entityTypeOrigin["@EnterpriseSearchHana.uiResource.label.bundle"];
          // const resourceKey = entityTypeOrigin["@EnterpriseSearchHana.uiResource.label.key"];
          // if (resourceBundle && resourceKey) {
          //     try {
          //         entityType.resourceBundle = window.jQuery.sap.resources({
          //             url: resourceBundle,
          //             language: window.sap.ui.getCore().getConfiguration().getLanguage()
          //         });
          //         const sTranslatedText = entityType.resourceBundle.getText(resourceKey);
          //         if (sTranslatedText) {
          //             entityType.labelResourceBundle = sTranslatedText;
          //         }
          //     } catch (e) {
          //         that.log.error("Resource bundle of " + entityTypeName + " '" + resourceBundle + "' can't be found:" + e.toString());
          //     }
          // }
          var index = 0;
          for (var annoOrAttrName in entityTypeOrigin) {
            var annoOrAttr = entityTypeOrigin[annoOrAttrName];
            if (annoOrAttrName === "$Key") {
              entityType.keys = annoOrAttr;
              continue;
            }
            if (annoOrAttrName.startsWith("@")) {
              this._parseEntityTypeAnnotations(annoOrAttrName, annoOrAttr, entityType);
              continue;
            }
            this._parseAttribute(annoOrAttrName, annoOrAttr, entityType, index);
            index++;
          }
        }
        return helperMap;
      }
    }, {
      key: "_parseEntityTypeAnnotations",
      value: function _parseEntityTypeAnnotations(annoName, annoValue, entityType) {
        annoName = annoName.substring(1).toUpperCase();
        switch (annoName) {
          case "UI.HEADERINFO.TYPENAME":
            entityType.label = annoValue;
            break;
          case "UI.HEADERINFO.TYPENAMEPLURAL":
            entityType.label = annoValue;
            break;
          case "UI.HEADERINFO.TITLE.TYPE":
            this._setAnnotationValue(entityType.annotations, annoName, annoValue);
            break;
          case "UI.HEADERINFO.TITLE.VALUEQUALIFIER":
            this._setAnnotationValue(entityType.annotations, annoName, annoValue);
            break;
          case "UI.HEADERINFO.TYPEIMAGEURL":
            entityType.icon = annoValue;
            break;
          default:
            this._setAnnotationValue(entityType.annotations, annoName, annoValue);
        }
      }
    }, {
      key: "_parseAttribute",
      value: function _parseAttribute(attributeName, attributeValue, entityType, index) {
        if (_typeof(attributeValue) !== "object") {
          return;
        }
        var attribute = {
          labelRaw: attributeName,
          label: null,
          type: "",
          presentationUsage: [],
          isFacet: false,
          isSortable: false,
          supportsTextSearch: false,
          displayOrder: index,
          annotationsAttr: {},
          unknownAnnotation: []
        };
        entityType.attributeMap[attributeName] = attribute;
        for (var annoOrProp in attributeValue) {
          var annoOrPropValue = attributeValue[annoOrProp];
          if (annoOrProp === "$Type" || annoOrProp === "Type") {
            attribute["type"] = annoOrPropValue;
            continue;
          }
          if (annoOrProp.startsWith("@")) {
            this._parseAttributeAnnotations(annoOrProp, annoOrPropValue, attribute);
          }
        }
      }
    }, {
      key: "_parseAttributeAnnotations",
      value: function _parseAttributeAnnotations(annotationName, annotationValue, attribute) {
        annotationName = annotationName.substring(1).toUpperCase();
        if (annotationValue !== undefined) {
          this._normalizeAnnotationValueOfArrayOrObject(annotationValue);
          switch (annotationName) {
            case "SAP.COMMON.LABEL":
              if (!attribute.label) {
                attribute.label = annotationValue;
              }
              break;
            // case "ENTERPRISESEARCHHANA.UIRESOURCE.LABEL.KEY":
            //     if (annotationValue && entitySet.resourceBundle) {
            //         const sTranslatedText = entitySet.resourceBundle.getText(annotationValue);
            //         if (sTranslatedText) {
            //             attribute.label = sTranslatedText;
            //         }
            //     }
            //     break;
            case "ENTERPRISESEARCH.KEY":
              attribute.isKey = annotationValue;
              break;
            case "ENTERPRISESEARCH.PRESENTATIONMODE":
              // eslint-disable-next-line no-case-declarations
              // const presentationUsage: PresentationUsageConversionMap = this._getValueFromArrayWithSingleEntry(annotationValue);
              // presentationUsage = that.presentationUsageConversionMap[presentationUsage];
              // if (presentationUsage) {
              // attribute.presentationUsage.push(presentationUsage);
              // }
              attribute.presentationUsage = annotationValue;
              break;
            case "ENTERPRISESEARCHHANA.ISSORTABLE":
              attribute.isSortable = annotationValue;
              break;
            case "ENTERPRISESEARCHHANA.SUPPORTSTEXTSEARCH":
              attribute.supportsTextSearch = annotationValue;
              break;
            case "ENTERPRISESEARCH.FILTERINGFACET.DEFAULT":
              attribute.isFacet = annotationValue;
              break;
            case "ENTERPRISESEARCH.FILTERINGFACET.DISPLAYPOSITION":
              attribute.facetPosition = annotationValue;
              break;
            case "ENTERPRISESEARCH.FILTERINGFACET.ICONURL":
              attribute.facetIconUrlAttributeName = annotationValue;
              break;
            case "ENTERPRISESEARCH.FILTERINGATTRIBUTE.DEFAULT":
              attribute.isFilteringAttribute = annotationValue;
              break;
            case "ENTERPRISESEARCH.FILTERINGATTRIBUTE.DISPLAYPOSITION":
              attribute.facetPosition = annotationValue;
              break;
            case "ENTERPRISESEARCH.FILTERINGATTRIBUTE.ICONURL":
              attribute.facetIconUrlAttributeName = annotationValue;
              break;
            case "ENTERPRISESEARCH.DISPLAYORDER":
              attribute.displayOrder = annotationValue;
              break;
            default:
              if (annotationName.startsWith("UI") || annotationName.startsWith("OBJECTMODEL") || annotationName.startsWith("SEMANTICS")) {
                this._setAnnotationValue(attribute.annotationsAttr, annotationName, annotationValue);
              } else {
                attribute.unknownAnnotation.push(annotationName);
              }
          }
        }
      }
    }, {
      key: "_normalizeAnnotationValueOfArrayOrObject",
      value: function _normalizeAnnotationValueOfArrayOrObject(annotationValue) {
        if (Array.isArray(annotationValue)) {
          for (var i = 0; i < annotationValue.length; i++) {
            this._normalizeAnnotationValueOfObject(annotationValue[i]);
          }
        } else this._normalizeAnnotationValueOfObject(annotationValue);
        //system
        return annotationValue;
      }
    }, {
      key: "_normalizeAnnotationValueOfObject",
      value: function _normalizeAnnotationValueOfObject(annotationValue) {
        if (_typeof(annotationValue) === "object") {
          for (var keyName in annotationValue) {
            var keyNameUpperCase = keyName.toUpperCase();
            annotationValue[keyNameUpperCase] = annotationValue[keyName];
            delete annotationValue[keyName];
          }
        }
        return annotationValue;
      }
    }, {
      key: "_getValueFromArrayWithSingleEntry",
      value: function _getValueFromArrayWithSingleEntry(aArray) {
        if (Array.isArray(aArray) && aArray.length === 1) {
          return aArray[0];
        }
        return aArray;
      }

      //parse datasources from EntityContainer
    }, {
      key: "_parseEntityContainer",
      value: function _parseEntityContainer(entityContainerObject, helperMap, allInOneMap) {
        for (var entityObject in entityContainerObject) {
          var entitySet = helperMap[entityObject];
          if (entityObject === "$Kind") {
            continue;
          }
          if (entitySet === undefined) {
            throw "EntityType " + entityObject + " has no corresponding meta data!";
          }
          var newDatasource = this.sina._createDataSource({
            id: entityObject,
            label: entitySet.label || entityObject,
            labelPlural: entitySet.labelPlural || entitySet.label || entityObject,
            icon: entitySet.icon || "",
            type: DataSourceType.BusinessObject,
            attributesMetadata: [{
              id: "dummy"
            }] // fill with dummy attribute
          });

          newDatasource.annotations = entitySet.annotations;
          allInOneMap.dataSourceMap[newDatasource.id] = newDatasource;
          allInOneMap.dataSourcesList.push(newDatasource);

          //that.fillMetadataBuffer(newDatasource, entitySet);
          entitySet.name = entityObject;
          entitySet.dataSource = newDatasource;
          allInOneMap.businessObjectMap[entityObject] = entitySet;
          allInOneMap.businessObjectList.push(entitySet);
        }
      }
    }]);
    return MetadataParserJson;
  }(MetadataParser);
  var __exports = {
    __esModule: true
  };
  __exports.MetadataParserJson = MetadataParserJson;
  return __exports;
});
})();