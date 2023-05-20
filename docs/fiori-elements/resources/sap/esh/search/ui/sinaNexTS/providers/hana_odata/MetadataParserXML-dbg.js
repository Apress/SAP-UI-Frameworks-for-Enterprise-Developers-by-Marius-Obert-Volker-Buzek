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
sap.ui.define(["../../sina/DataSourceType", "./MetadataParser", "./HierarchyMetadataParser"], function (____sina_DataSourceType, ___MetadataParser, ___HierarchyMetadataParser) {
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
  var HierarchyMetadataParser = ___HierarchyMetadataParser["HierarchyMetadataParser"];
  var MetadataParserXML = /*#__PURE__*/function (_MetadataParser) {
    _inherits(MetadataParserXML, _MetadataParser);
    var _super = _createSuper(MetadataParserXML);
    function MetadataParserXML(provider) {
      _classCallCheck(this, MetadataParserXML);
      return _super.call(this, provider);
    }
    _createClass(MetadataParserXML, [{
      key: "_getWindow",
      value: function _getWindow() {
        try {
          const _this = this;
          if (typeof window === "undefined") {
            if (typeof _this.jsDOMWindow === "undefined") {
              var jsdom = require("jsdom");
              var fs = require("fs");
              var jquery = fs.readFileSync("./node_modules/jquery/dist/jquery.js", "utf-8");
              var dom = new jsdom.JSDOM("<html><script>" + jquery + "</script><body></body></html>", {
                runScripts: "dangerously"
              });
              _this.jsDOMWindow = dom.window;
              dom.window.$ = dom.window.jQuery;
            }
            return _await(_this.jsDOMWindow);
          }
          return _await(window);
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "fireRequest",
      value: function fireRequest(client, url) {
        try {
          return _await(client.getXML(url));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "parseResponse",
      value: function parseResponse(metaXML) {
        try {
          const _this2 = this;
          var that = _this2;

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
          return _await(_this2._getWindow(), function (window) {
            var xmlDoc = window.$.parseXML(metaXML);
            window.$(xmlDoc).find("Schema").each(function () {
              var $this = window.$(this);
              var helperMap = that._parseEntityType($this, window);
              that._parseEntityContainer($this, helperMap, allInOneMap, window);
            });
            return allInOneMap;
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }

      //parse entityset and its attributes from EntityType
    }, {
      key: "_parseEntityType",
      value: function _parseEntityType(schema, window) {
        var that = this;
        var helperMap = {};
        schema = window.$(schema);
        var hierarchyMetadataParser = new HierarchyMetadataParser(window.$);
        schema.find("EntityType").each(function () {
          var entityTypeName = window.$(this).attr("Name");
          var entitySet = {
            schema: schema.attr("Namespace"),
            keys: [],
            attributeMap: {},
            resourceBundle: "",
            labelResourceBundle: "",
            label: "",
            labelPlural: "",
            annotations: {},
            hierarchyDefinitionsMap: {},
            icon: ""
          };
          helperMap[entityTypeName] = entitySet;

          //oData keys for accessing a entity
          window.$(this).find("Key>PropertyRef").each(function () {
            entitySet.keys.push(window.$(this).attr("Name"));
          });
          window.$(this).find('>Annotation[Term="EnterpriseSearch.hierarchy.parentChild"]').each(function () {
            entitySet.hierarchyDefinitionsMap = hierarchyMetadataParser.parse(entityTypeName, this);
          });
          window.$(this).find('Annotation[Term="Search.searchable"]').each(function () {
            //window.$(this).find('Annotation').each(function () {
            // if (window.$(this).attr('Term') === 'EnterpriseSearchHana.uiResource.label.bundle') {
            //     var resourceUrl = window.$(this).attr('String');
            //     try {
            //         entitySet.resourceBundle = jQuery.sap.resources({
            //             url: resourceUrl,
            //             language: sap.ui.getCore().getConfiguration().getLanguage()
            //         });
            //     } catch (e) {
            //         sinaLog.error("Resource bundle of " + entityTypeName + " '" + resourceUrl + "' can't be found:" + e.toString());
            //     }

            //Get sibling annotation element of attr EnterpriseSearchHana.uiResource.label.key
            window.$(this).siblings("Annotation").each(function () {
              var $element = window.$(this);
              var annotationName = $element.attr("Term");
              if (annotationName !== undefined && annotationName.length > 0) {
                annotationName = annotationName.toUpperCase();
                var annotationValue = that._getValueFromElement(this, window);
                if (annotationName === "ENTERPRISESEARCHHANA.UIRESOURCE.LABEL.BUNDLE") {
                  var resourceUrl = annotationValue;
                  try {
                    entitySet.resourceBundle = window.jQuery.sap.resources({
                      url: resourceUrl,
                      language: window.sap.ui.getCore().getConfiguration().getLanguage()
                    });
                  } catch (e) {
                    that.log.error("Resource bundle of " + entityTypeName + " '" + resourceUrl + "' can't be found:" + e.toString());
                  }
                } else if (annotationName === "ENTERPRISESEARCHHANA.UIRESOURCE.LABEL.KEY") {
                  var sKey = annotationValue;
                  if (sKey && entitySet.resourceBundle) {
                    var sTranslatedText = entitySet.resourceBundle.getText(sKey);
                    if (sTranslatedText) {
                      entitySet.labelResourceBundle = sTranslatedText;
                    }
                  }
                } else if (annotationName === "UI.HEADERINFO.TYPENAME") {
                  entitySet.label = annotationValue;
                } else if (annotationName === "UI.HEADERINFO.TYPENAMEPLURAL") {
                  entitySet.labelPlural = annotationValue;
                } else if (annotationName === "UI.HEADERINFO.TITLE.TYPE") {
                  that._setAnnotationValue(entitySet.annotations, annotationName, annotationValue);
                } else if (annotationName === "UI.HEADERINFO.TITLE.VALUEQUALIFIER") {
                  that._setAnnotationValue(entitySet.annotations, annotationName, annotationValue);
                } else if (annotationName === "UI.HEADERINFO.TYPEIMAGEURL") {
                  entitySet.icon = annotationValue;
                } else {
                  // var annoAttributes = window.$(this)[0].attributes;
                  // // In case of collection, say usageMode, it shall be handled differently
                  // if (annoAttributes.length === 2) {
                  //     var annoTerm = annoAttributes.item(0).value.toUpperCase();
                  //     var annoValue = annoAttributes.item(1).value;
                  //     entitySet.annotations[annoTerm] = annoValue;
                  // }

                  that._setAnnotationValue(entitySet.annotations, annotationName, annotationValue);
                }
              }
            });
            //}
          });

          //Loop attributes
          window.$(this).find("Property").each(function (index) {
            var attributeName = window.$(this).attr("Name");
            var attribute = {
              labelRaw: attributeName,
              label: null,
              type: window.$(this).attr("Type"),
              presentationUsage: [],
              // accessUsage: [],
              isFacet: false,
              isSortable: false,
              supportsTextSearch: false,
              displayOrder: index,
              annotationsAttr: {},
              unknownAnnotation: [],
              hierarchyDefinition: entitySet.hierarchyDefinitionsMap[attributeName]
            };
            entitySet.attributeMap[attributeName] = attribute;
            window.$(this).find("Annotation").each(function () {
              var annotationName = window.$(this).attr("Term");
              if (annotationName !== undefined && annotationName.length > 0) {
                annotationName = annotationName.toUpperCase();
                var annotationValue = that._getValueFromElement(this, window);
                if (annotationValue == undefined) {
                  window.$(this).children("Collection").children("Record").each(function () {
                    annotationValue = annotationValue || [];
                    var arrayEntry = {};
                    annotationValue.push(arrayEntry);
                    window.$(this).children("PropertyValue").each(function () {
                      var entryAnnoName = window.$(this).attr("Property");
                      if (entryAnnoName !== undefined && entryAnnoName.length > 0) {
                        entryAnnoName = entryAnnoName.toUpperCase();
                        var entryAnnoValue = that._getValueFromElement(this, window);
                        if (entryAnnoValue !== undefined) {
                          arrayEntry[entryAnnoName] = entryAnnoValue;
                        }
                      }
                    });
                  });
                }
                if (annotationValue !== undefined) {
                  switch (annotationName) {
                    case "SAP.COMMON.LABEL":
                      if (!attribute.label) {
                        attribute.label = annotationValue;
                      }
                      break;
                    case "ENTERPRISESEARCHHANA.UIRESOURCE.LABEL.KEY":
                      if (annotationValue && entitySet.resourceBundle) {
                        var sTranslatedText = entitySet.resourceBundle.getText(annotationValue);
                        if (sTranslatedText) {
                          attribute.label = sTranslatedText;
                        }
                      }
                      break;
                    case "ENTERPRISESEARCH.KEY":
                      attribute.isKey = annotationValue;
                      break;
                    case "ENTERPRISESEARCH.PRESENTATIONMODE":
                      window.$(this).find("Collection>String").each(function () {
                        var presentationUsage = that._getValueFromElement(this, window);
                        // presentationUsage = that.presentationUsageConversionMap[presentationUsage];
                        if (presentationUsage) {
                          attribute.presentationUsage.push(presentationUsage);
                        }
                      });
                      break;
                    // case 'EnterpriseSearch.usageMode': // No longer available in v5
                    //     window.$(this).find('Collection>String').each(function() {
                    //         var accessUsage = annotationValue;
                    //         accessUsage = that.accessUsageConversionMap[accessUsage];
                    //         if (accessUsage) {
                    //             attribute.accessUsage.push(accessUsage);
                    //         }
                    //     });
                    //     break;
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
                    // case '@EnterpriseSearch.filteringFacet.numberOfValues':
                    //     attribute.numberOfFacetValues = annotationValue;
                    default:
                      if (annotationName.startsWith("UI") || annotationName.startsWith("OBJECTMODEL") || annotationName.startsWith("SEMANTICS")) {
                        that._setAnnotationValue(attribute.annotationsAttr, annotationName, annotationValue);
                      } else {
                        attribute.unknownAnnotation.push(window.$(this));
                      }
                  }
                }
              }
            });
            var identification = attribute.annotationsAttr.UI && attribute.annotationsAttr.UI.IDENTIFICATION;
            if (identification) {
              if (identification.POSITION !== undefined) {
                attribute.displayOrder = identification.POSITION;
              } else if (Array.isArray(identification)) {
                for (var i = 0; i < identification.length; i++) {
                  if (identification[i].TYPE == undefined && identification[i].POSITION !== undefined) {
                    attribute.displayOrder = identification[i].POSITION;
                    break;
                  }
                }
              }
            }
          });
        });
        return helperMap;
      }
    }, {
      key: "_getValueFromElement",
      value: function _getValueFromElement(element, window) {
        var $element = window.$(element);
        var value = $element.text();
        if (!value || value.trim().length == 0) {
          value = undefined;
          if ($element.attr("String") !== undefined) {
            value = $element.attr("String");
          } else if ($element.attr("Decimal") !== undefined) {
            try {
              value = Number.parseFloat($element.attr("Decimal"));
              if (isNaN(value)) {
                value = undefined;
              }
            } catch (e) {
              value = undefined;
            }
          } else if ($element.attr("Int") !== undefined) {
            try {
              value = Number.parseInt($element.attr("Int"), 10);
              if (isNaN(value)) {
                value = undefined;
              }
            } catch (e) {
              value = undefined;
            }
          } else if ($element.attr("Bool") !== undefined) {
            value = $element.attr("Bool") == "true";
          }
        }
        return value;
      }

      //parse datasources from EntityContainer
    }, {
      key: "_parseEntityContainer",
      value: function _parseEntityContainer(schemaXML, helperMap, allInOneMap, window) {
        var that = this;
        schemaXML.find("EntityContainer>EntitySet").each(function () {
          if (window.$(this).attr("Name") && window.$(this).attr("EntityType")) {
            var name = window.$(this).attr("Name");
            var entityTypeFullQualified = window.$(this).attr("EntityType");

            // var schema = entityTypeFullQualified.slice(0, entityTypeFullQualified.lastIndexOf('.'));
            var entityType = entityTypeFullQualified.slice(entityTypeFullQualified.lastIndexOf(".") + 1);
            var entitySet = helperMap[entityType];
            if (entitySet === undefined) {
              throw "EntityType " + entityType + " has no corresponding meta data!";
            }
            var newDatasource = that.sina._createDataSource({
              id: name,
              label: entitySet.labelResourceBundle || entitySet.label || name,
              labelPlural: entitySet.labelResourceBundle || entitySet.labelPlural || entitySet.label || name,
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
            entitySet.name = name;
            entitySet.dataSource = newDatasource;
            allInOneMap.businessObjectMap[name] = entitySet;
            allInOneMap.businessObjectList.push(entitySet);
          }
        });
      }
    }]);
    return MetadataParserXML;
  }(MetadataParser);
  var __exports = {
    __esModule: true
  };
  __exports.MetadataParserXML = MetadataParserXML;
  return __exports;
});
})();