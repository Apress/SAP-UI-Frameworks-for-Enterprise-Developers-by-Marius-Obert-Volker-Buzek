/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./labelCalculation", "../../sina/SinaObject", "../../sina/MatchingStrategy", "../../sina/AttributeType", "../../sina/AttributeFormatType", "../../core/errors", "../../sina/System"], function (___labelCalculation, ____sina_SinaObject, ____sina_MatchingStrategy, ____sina_AttributeType, ____sina_AttributeFormatType, ____core_errors, ____sina_System) {
  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
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
  var createLabelCalculator = ___labelCalculation["createLabelCalculator"];
  var SinaObject = ____sina_SinaObject["SinaObject"];
  var MatchingStrategy = ____sina_MatchingStrategy["MatchingStrategy"];
  var AttributeType = ____sina_AttributeType["AttributeType"];
  var AttributeFormatType = ____sina_AttributeFormatType["AttributeFormatType"];
  var UnknownDataTypeError = ____core_errors["UnknownDataTypeError"];
  var UnknownPresentationUsageError = ____core_errors["UnknownPresentationUsageError"];
  var System = ____sina_System["System"];
  var MetadataParser = /*#__PURE__*/function (_SinaObject) {
    _inherits(MetadataParser, _SinaObject);
    var _super = _createSuper(MetadataParser);
    function MetadataParser(provider) {
      var _this;
      _classCallCheck(this, MetadataParser);
      _this = _super.call(this);
      _this._provider = provider;
      _this._sina = provider.sina;
      _this._labelCalculator = createLabelCalculator();
      _this._appSearchDataSource = undefined;
      return _this;
    }
    _createClass(MetadataParser, [{
      key: "getAppSearchDataSource",
      value: function getAppSearchDataSource() {
        return this._appSearchDataSource;
      }
    }, {
      key: "parseDataSourceData",
      value: function parseDataSourceData(dataSourcesData, sorsNavigationTargetGenerator) {
        for (var i = 0; i < dataSourcesData.length; ++i) {
          var dataSourceData = dataSourcesData[i];
          var label = dataSourceData.Name;
          if (!label) {
            label = dataSourceData.Id;
          }
          var labelPlural = dataSourceData.NamePlural;
          if (!labelPlural) {
            labelPlural = label;
          }
          var dataSource = this._sina._createDataSource({
            id: dataSourceData.Id,
            label: label,
            labelPlural: labelPlural,
            type: this._sina.DataSourceType.BusinessObject,
            usage: dataSourceData.Id.endsWith("TRANSACTIONS~") ? {
              appSearch: {}
            } : {},
            attributesMetadata: [{
              id: "dummy"
            }] // fill with dummy attribute
          });

          dataSource.system = new System({
            id: dataSourceData.SourceSystem + "." + dataSourceData.SourceClient,
            label: dataSourceData.SourceSystem + " " + dataSourceData.SourceClient
          });
          dataSource._private.semanticObjectType = dataSourceData.SemanticObjectTypeId;
          dataSource._private.annotations = dataSourceData.Annotations && dataSourceData.Annotations.results || [];
          this._labelCalculator.calculateLabel(dataSource);
          this._fillMetadataBufferForDataSource(dataSource, dataSourceData.Attributes.results);
          sorsNavigationTargetGenerator.registerObjectType({
            type: dataSource.id,
            label: dataSource.label,
            properties: dataSource.attributesMetadata
          });
          if (dataSource.id.endsWith("TRANSACTIONS~") && this._appSearchDataSource === undefined) {
            this._appSearchDataSource = dataSource;
          }
        }
      }
    }, {
      key: "_fillMetadataBufferForDataSource",
      value: function _fillMetadataBufferForDataSource(dataSource, attributes) {
        if (dataSource.attributesMetadata[0].id !== "dummy") {
          // check if buffer already filled
          return;
        }
        dataSource.attributesMetadata = [];
        dataSource.attributeMetadataMap = {};
        var i;
        var titleAttributes = [];
        var detailAttributesPrio1 = [];
        var detailAttributesPrio2 = [];
        var detailAttributes = [];
        var attributeMetadata;
        var cdsAnnotations = {
          dataSourceAnnotations: {},
          // Key-Value-Map for CDS annotations
          attributeAnnotations: {} // Key-Value-Map (keys: attribute names) of Key-Value-Maps (keys: annotation names) for CDS annotations
        };

        // Prepare data source annotations for being passed to CDS annotations parser
        cdsAnnotations.dataSourceAnnotations = this._parseAnnotationsIntoJsonStructure(dataSource._private.annotations);
        for (i = 0; i < attributes.length; i++) {
          attributeMetadata = attributes[i];
          var publicAttributeMetadata = this._fillMetadataBufferForAttribute(dataSource, attributeMetadata);

          // Prepare attribute annotations for being passed over to the CDS annotations parser
          var attributeAnnotationsSrc = attributeMetadata.Annotations && attributeMetadata.Annotations.results || [];
          var attributeAnnotations = this._parseAnnotationsIntoJsonStructure(attributeAnnotationsSrc);
          cdsAnnotations.attributeAnnotations[publicAttributeMetadata.id.toUpperCase()] = attributeAnnotations;

          // if this attribute has a Semantics property but no semantics annotation, create a new semantics annotation that corresponds to Semantics property.
          this._parseSemanticsAnnotation(attributeMetadata, attributeAnnotations);
          if (publicAttributeMetadata._private.temporaryUsage.Title !== undefined) {
            titleAttributes.push(publicAttributeMetadata);
          }
          if (publicAttributeMetadata._private.temporaryUsage.Detail !== undefined) {
            if (attributeMetadata.isSummary) {
              detailAttributesPrio1.push(publicAttributeMetadata);
            } else {
              detailAttributesPrio2.push(publicAttributeMetadata);
            }
          }
        }

        ///////////////////////////////////////////
        // Parse CDS Annotations for Data Source
        var cdsAnnotationsParser = this._sina._createCDSAnnotationsParser({
          dataSource: dataSource,
          cdsAnnotations: cdsAnnotations
        });
        var parsingResult = cdsAnnotationsParser.parseCDSAnnotationsForDataSource();
        if (!parsingResult.dataSourceIsCdsBased) {
          this._sortAttributesOfNonCDSBasedDataSource(dataSource, titleAttributes, detailAttributes, detailAttributesPrio1, detailAttributesPrio2);
        }

        ///////////////////////////////////////////////////////////////////////
        // add any usage that is neither Title nor Detail to attribute usage
        for (i = 0; i < dataSource.attributesMetadata.length; i++) {
          attributeMetadata = dataSource.attributesMetadata[i];
          if (attributeMetadata._private.temporaryUsage) {
            for (var usageName in attributeMetadata._private.temporaryUsage) {
              if (usageName != "Title" && usageName != "Detail") {
                attributeMetadata.usage[usageName] = attributeMetadata._private.temporaryUsage[usageName];
              }
            }
            // delete attributeMetadata._private.temporaryUsage;
          }
        }
      }
    }, {
      key: "_fillMetadataBufferForAttribute",
      value: function _fillMetadataBufferForAttribute(dataSource, attributeMetadata) {
        var displayOrderIndex = attributeMetadata.Displayed && attributeMetadata.DisplayOrder ? attributeMetadata.DisplayOrder : -1; // oliver

        var typeAndFormat = this._parseAttributeTypeAndFormat(attributeMetadata);
        var publicAttributeMetadata = this._sina._createAttributeMetadata({
          id: attributeMetadata.Id,
          label: attributeMetadata.Name !== "" ? attributeMetadata.Name : attributeMetadata.Id,
          isKey: attributeMetadata.Key,
          isSortable: attributeMetadata.Sortable,
          usage: {},
          //attributeMetadata.UIAreas ? this._parseUsage(attributeMetadata, displayOrderIndex) : {},
          type: typeAndFormat.type,
          format: typeAndFormat.format,
          matchingStrategy: this._parseMatchingStrategy(attributeMetadata)
        });
        publicAttributeMetadata._private.semanticObjectType = attributeMetadata.SemanticObjectTypeId;

        // temporaly store usage in this property.
        // we"ll decide later whether we use this, or whether we use annotations for setting the usage.
        publicAttributeMetadata._private.temporaryUsage = attributeMetadata.UIAreas ? this._parseUsage(attributeMetadata, displayOrderIndex) : {};
        dataSource.attributesMetadata.push(publicAttributeMetadata);
        dataSource.attributeMetadataMap[publicAttributeMetadata.id] = publicAttributeMetadata;
        return publicAttributeMetadata;
      }
    }, {
      key: "_parseSemanticsAnnotation",
      value: function _parseSemanticsAnnotation(rawAttributeMetadata, attributeAnnotations) {
        var hasSemanticsAnnotation = false;
        var semanticsPrefix = "SEMANTICS";
        for (var annotationName in attributeAnnotations) {
          if (annotationName.substr(0, semanticsPrefix.length) == semanticsPrefix) {
            hasSemanticsAnnotation = true;
            break;
          }
        }
        if (rawAttributeMetadata.Semantics && !hasSemanticsAnnotation) {
          var semanticsValue;
          switch (rawAttributeMetadata.Semantics) {
            case "EMAIL.ADDRESS":
            case "TELEPHONE.TYPE":
            case "CURRENCYCODE":
            case "UNITOFMEASURE":
              semanticsValue = "TRUE";
              break;
            case "QUANTITY.UNITOFMEASURE":
            case "AMOUNT.CURRENCYCODE":
              semanticsValue = rawAttributeMetadata.UnitAttribute;
              break;
          }
          if (semanticsValue) {
            attributeAnnotations[semanticsPrefix + rawAttributeMetadata.Semantics] = semanticsValue;
          }
        }
      }
    }, {
      key: "_sortAttributesOfNonCDSBasedDataSource",
      value: function _sortAttributesOfNonCDSBasedDataSource(dataSource, titleAttributes, detailAttributes, detailAttributesPrio1, detailAttributesPrio2) {
        var i, attributeMetadata;
        titleAttributes.sort(this._createSortFunction("Title"));
        for (i = 0; i < titleAttributes.length; ++i) {
          var attributeId = titleAttributes[i].id;
          attributeMetadata = dataSource.getAttributeMetadata(attributeId);
          attributeMetadata.usage.Title = attributeMetadata._private.temporaryUsage.Title;
          attributeMetadata.usage.Title.displayOrder = i;
        }

        // calculate attribute area display order
        var sortFunction = this._createSortFunction("Detail");
        detailAttributesPrio1.sort(sortFunction);
        detailAttributesPrio2.sort(sortFunction);
        detailAttributes.push.apply(detailAttributes, _toConsumableArray(detailAttributesPrio1));
        detailAttributes.push.apply(detailAttributes, _toConsumableArray(detailAttributesPrio2));
        for (i = 0; i < detailAttributes.length; ++i) {
          detailAttributes[i].usage.Detail = detailAttributes[i]._private.temporaryUsage.Detail;
          detailAttributes[i].usage.Detail.displayOrder = i;
        }
      }
    }, {
      key: "_arrayIncludesEntry",
      value: function _arrayIncludesEntry(array, entry, compareFunction) {
        var i;
        if (compareFunction) {
          for (i = 0; i < array.length; i++) {
            if (compareFunction(array[i], entry)) {
              return true;
            }
          }
        } else {
          for (i = 0; i < array.length; i++) {
            if (array[i] == entry) {
              return true;
            }
          }
        }
        return false;
      }
    }, {
      key: "_parseAnnotationsIntoJsonStructure",
      value: function _parseAnnotationsIntoJsonStructure(annotations) {
        if (annotations.length == 0) {
          return {};
        }
        var i, j;
        var parsedAnnotations = {};
        var annotationArrayRegex, arrayMatch;
        var annotationName, annotationPointer;
        var annotationNameParts;
        var annotationsWithDummyArrays = [];
        var dummyEntry;
        var compareDummyEntriesFunction = function compareDummyEntriesFunction(entry1, entry2) {
          return entry1.annotationPointer == entry2.annotationPointer && entry1.annotationName == entry2.annotationName;
        };
        try {
          // first step: parse flattened annotations into JSON structure (including dummy arrays)
          for (j = 0; j < annotations.length; j++) {
            annotationArrayRegex = /\[\d+\]$/g;
            annotationPointer = parsedAnnotations;
            annotationNameParts = annotations[j].Name.split(".");
            for (i = 0; i < annotationNameParts.length; i++) {
              annotationName = annotationNameParts[i].toUpperCase();
              arrayMatch = annotationArrayRegex.exec(annotationName);
              if (arrayMatch !== null) {
                annotationName = annotationName.substring(0, arrayMatch.index);
              }
              annotationPointer[annotationName] = annotationPointer[annotationName] || {};
              if (arrayMatch !== null && arrayMatch[0].length > 0) {
                //if (Object.keys(annotationPointer[annotationName]).length == 0) {
                dummyEntry = {
                  annotationPointer: annotationPointer,
                  annotationName: annotationName
                };
                if (!this._arrayIncludesEntry(annotationsWithDummyArrays, dummyEntry, compareDummyEntriesFunction)) {
                  annotationsWithDummyArrays.push(dummyEntry);
                }
                if (i < annotationNameParts.length - 1) {
                  annotationPointer[annotationName][arrayMatch[0]] = annotationPointer[annotationName][arrayMatch[0]] || {};
                  annotationPointer = annotationPointer[annotationName][arrayMatch[0]];
                } else {
                  annotationPointer[annotationName][arrayMatch[0]] = annotations[j].Value;
                }
              } else if (i < annotationNameParts.length - 1) {
                annotationPointer = annotationPointer[annotationName];
              } else {
                annotationPointer[annotationName] = annotations[j].Value;
              }
            }
          }
          var parentAnnotation;
          var annotationWithDummyArrays;
          var actualArray, dummyArrayName, artificialEntry;
          var dummyArrayKeyRegex = /\[\d+\]/g;

          // second step: replace dummy arrays with real arrays
          for (j = 0; j < annotationsWithDummyArrays.length; j++) {
            parentAnnotation = annotationsWithDummyArrays[j].annotationPointer;
            annotationName = annotationsWithDummyArrays[j].annotationName;
            annotationWithDummyArrays = parentAnnotation[annotationName];
            actualArray = [];
            artificialEntry = {};
            for (dummyArrayName in annotationWithDummyArrays) {
              if (dummyArrayName.match(dummyArrayKeyRegex)) {
                actualArray.push(annotationWithDummyArrays[dummyArrayName]);
              } else {
                // seems to be an entry that was defined besides the actual array in CDS, eg like this:
                // @UI.identification: [{ position: 4 }]
                // @UI.identification.position: 6
                // .. so we put it into its own array entry
                artificialEntry[dummyArrayName] = annotationWithDummyArrays[dummyArrayName];
              }
            }
            if (Object.keys(artificialEntry).length > 0) {
              actualArray.push(artificialEntry);
            }
            parentAnnotation[annotationName] = actualArray;
          }
        } catch (e) {
          return {};
        }
        return parsedAnnotations;
      }
    }, {
      key: "_createSortFunction",
      value: function _createSortFunction(usagePropery) {
        return function (a1, a2) {
          if (a1._private.temporaryUsage[usagePropery].displayOrder < a2._private.temporaryUsage[usagePropery].displayOrder) {
            return -1;
          } else if (a1._private.temporaryUsage[usagePropery].displayOrder > a2._private.temporaryUsage[usagePropery].displayOrder) {
            return 1;
          }
          return 0;
        };
      }
    }, {
      key: "_parseMatchingStrategy",
      value: function _parseMatchingStrategy(attributeMetadata) {
        if (attributeMetadata.TextIndexed) {
          return MatchingStrategy.Text;
        }
        return MatchingStrategy.Exact;
      }
    }, {
      key: "_parseAttributeTypeAndFormat",
      value: function _parseAttributeTypeAndFormat(attributeMetadata) {
        for (var i = 0; i < attributeMetadata.UIAreas.results.length; i++) {
          var presentationUsage = attributeMetadata.UIAreas.results[i];
          var id = presentationUsage.Id;
          switch (id) {
            case "SUMMARY":
              continue;
            case "DETAILS":
              continue;
            case "TITLE":
              continue;
            case "#HIDDEN":
            case "HIDDEN":
              continue;
            case "FACTSHEET":
              continue;
            case "DETAILIMAGE":
            case "PREVIEWIMAGE":
              return {
                type: AttributeType.ImageUrl
              };
            case "LONGTEXT":
              return {
                type: AttributeType.String,
                format: AttributeFormatType.LongText
              };
            default:
              throw new UnknownPresentationUsageError("Unknown presentation usage " + presentationUsage);
          }
        }
        switch (attributeMetadata.EDMType) {
          case "Edm.String":
          case "Edm.Binary":
          case "Edm.Boolean":
          case "Edm.Byte":
          case "Edm.Guid":
            return {
              type: AttributeType.String
            };
          case "Edm.Double":
          case "Edm.Decimal":
          case "Edm.Float":
            return {
              type: AttributeType.Double
            };
          case "Edm.Int16":
          case "Edm.Int32":
          case "Edm.Int64":
            return {
              type: AttributeType.Integer
            };
          case "Edm.Time":
            return {
              type: AttributeType.Time
            };
          case "Edm.DateTime":
            if (attributeMetadata.TypeLength > 8) {
              return {
                type: AttributeType.Timestamp
              };
            }
            return {
              type: AttributeType.Date
            };
          case "GeoJson":
            return {
              type: AttributeType.GeoJson
            };
          default:
            throw new UnknownDataTypeError("Unknown data type " + attributeMetadata.EDMType);
        }
      }
    }, {
      key: "_parseUsage",
      value: function _parseUsage(attributeMetadata, displayOrderIndex) {
        var usagesInResponse = attributeMetadata.UIAreas.results;
        var advancedSearch = attributeMetadata.AdvancedSearchRelevant;
        var facet = attributeMetadata.Facet;
        var usage = {};
        usagesInResponse.forEach(function (elem) {
          var id = elem.Id;
          if (id === "TITLE") {
            usage.Title = {
              displayOrder: displayOrderIndex
            };
          }
          if (id === "SUMMARY" || id === "DETAILIMAGE" || id === "PREVIEWIMAGE") {
            attributeMetadata.isSummary = true;
            usage.Detail = {
              displayOrder: displayOrderIndex
            };
          }
          if (id === "DETAILS" || id === "LONGTEXT"
          //||id === "#HIDDEN"
          ) {
            usage.Detail = {
              displayOrder: displayOrderIndex
            };
          }
        });
        if (advancedSearch) {
          usage.AdvancedSearch = {};
        }
        if (facet) {
          usage.Facet = {};
        }
        return usage;
      }
    }, {
      key: "parseDynamicMetadata",
      value: function parseDynamicMetadata(searchResult) {
        // get items from response
        var items;
        try {
          items = searchResult.ResultList.SearchResults.results;
        } catch (e) {
          return;
        }
        // process all items
        for (var i = 0; i < items.length; ++i) {
          var item = items[i];
          if (!item.HitAttributes || !item.HitAttributes.results) {
            continue;
          }
          var dataSource = this._sina.getDataSource(item.DataSourceId);
          var hitAttributes = item.HitAttributes.results;
          for (var j = 0; j < hitAttributes.length; ++j) {
            var hitAttribute = hitAttributes[j];
            this.parseDynamicAtributeMetadata(dataSource, hitAttribute);
          }
        }
      }
    }, {
      key: "parseDynamicAtributeMetadata",
      value: function parseDynamicAtributeMetadata(dataSource, dynamicAttributeMetadata) {
        var typeAndFormat;
        var metadata = dataSource.getAttributeMetadata(dynamicAttributeMetadata.Id);
        if (metadata) {
          // update
          if (!metadata._private.dynamic) {
            return; // only update dynamic attributes
          }

          dynamicAttributeMetadata.UIAreas = dynamicAttributeMetadata.UIAreas || {
            results: []
          };
          typeAndFormat = this._parseAttributeTypeAndFormat(dynamicAttributeMetadata);
          metadata.label = dynamicAttributeMetadata.Name;
          metadata.type = typeAndFormat.type;
          metadata.format = typeAndFormat.format;
        } else {
          // append
          dynamicAttributeMetadata.UIAreas = dynamicAttributeMetadata.UIAreas || {
            results: []
          };
          typeAndFormat = this._parseAttributeTypeAndFormat(dynamicAttributeMetadata);
          metadata = this._sina._createAttributeMetadata({
            id: dynamicAttributeMetadata.Id,
            label: dynamicAttributeMetadata.Name,
            isKey: false,
            isSortable: false,
            usage: {},
            type: typeAndFormat.type,
            format: typeAndFormat.format,
            matchingStrategy: MatchingStrategy.Exact,
            _private: {
              dynamic: true
            }
          });
          dataSource.attributesMetadata.push(metadata);
          dataSource.attributeMetadataMap[metadata.id] = metadata;
        }
      }
    }]);
    return MetadataParser;
  }(SinaObject);
  var __exports = {
    __esModule: true
  };
  __exports.MetadataParser = MetadataParser;
  return __exports;
});
})();