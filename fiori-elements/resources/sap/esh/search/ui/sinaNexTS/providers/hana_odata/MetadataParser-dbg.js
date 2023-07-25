/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../core/Log", "../../sina/AttributeType", "../../sina/AttributeFormatType", "../../sina/MatchingStrategy", "../../core/errors"], function (____core_Log, ____sina_AttributeType, ____sina_AttributeFormatType, ____sina_MatchingStrategy, ____core_errors) {
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
  var Log = ____core_Log["Log"];
  var AttributeType = ____sina_AttributeType["AttributeType"];
  var AttributeFormatType = ____sina_AttributeFormatType["AttributeFormatType"];
  var MatchingStrategy = ____sina_MatchingStrategy["MatchingStrategy"];
  var UnknownAttributeTypeError = ____core_errors["UnknownAttributeTypeError"];
  var UnknownPresentationUsageError = ____core_errors["UnknownPresentationUsageError"];
  var AccessUsageConversionMap;
  (function (AccessUsageConversionMap) {
    AccessUsageConversionMap[AccessUsageConversionMap["AUTO_FACET"] = 0] = "AUTO_FACET";
    AccessUsageConversionMap[AccessUsageConversionMap["SUGGESTION"] = 1] = "SUGGESTION";
  })(AccessUsageConversionMap || (AccessUsageConversionMap = {}));
  var PresentationUsageConversionMap;
  (function (PresentationUsageConversionMap) {
    PresentationUsageConversionMap[PresentationUsageConversionMap["TITLE"] = 0] = "TITLE";
    PresentationUsageConversionMap[PresentationUsageConversionMap["SUMMARY"] = 1] = "SUMMARY";
    PresentationUsageConversionMap[PresentationUsageConversionMap["DETAIL"] = 2] = "DETAIL";
    PresentationUsageConversionMap[PresentationUsageConversionMap["IMAGE"] = 3] = "IMAGE";
    PresentationUsageConversionMap[PresentationUsageConversionMap["THUMBNAIL"] = 4] = "THUMBNAIL";
    PresentationUsageConversionMap[PresentationUsageConversionMap["HIDDEN"] = 5] = "HIDDEN";
  })(PresentationUsageConversionMap || (PresentationUsageConversionMap = {}));
  var MetadataParser = /*#__PURE__*/function () {
    function MetadataParser(provider) {
      _classCallCheck(this, MetadataParser);
      this.log = new Log("hana_odata metadata parser");
      this.provider = provider;
      this.sina = provider.sina;
    }
    // annotations: Object to store parsed annotations as properties
    // annotationName: Name of annotation in Dot Notation: UI.IDENTIFICATION.POSITION
    // value: can be a single value, like a string, or an array of objects, like UI.IDENTIFICATION = [ { POSITION: 5 }, { POSITION: 6, TYPE:AS_CONNECTED_FIELD, VALUEQUALIFIER:'somegroup' } ]
    _createClass(MetadataParser, [{
      key: "_setAnnotationValue",
      value: function _setAnnotationValue(annotations, annotationName, value) {
        var annotationParts = annotationName.split(".");
        var annotationPart;
        var annotationPointer = annotations;
        var dummyEntryName = "___temporaryDummyEntriesForArrays___";
        var i;

        // Step 01: create object structure for annoation
        for (i = 0; i < annotationParts.length - 1; i++) {
          annotationPart = annotationParts[i];
          if (annotationPointer[annotationPart] === undefined) {
            annotationPointer[annotationPart] = {};
            annotationPointer = annotationPointer[annotationPart];
          } else if (Array.isArray(annotationPointer[annotationPart])) {
            // at this level an array was created for a previous annotation with the same name
            // thus we need to create a dummy entry in that array for merging the current
            // annotation into the array structure
            annotationPointer[dummyEntryName] = annotationPointer[dummyEntryName] || {};
            if (!annotationPointer[dummyEntryName][annotationPart]) {
              annotationPointer[dummyEntryName][annotationPart] = {};
              annotationPointer[annotationPart].push(annotationPointer[dummyEntryName][annotationPart]);
            }
            annotationPointer = annotationPointer[dummyEntryName][annotationPart];
          } else if (_typeof(annotationPointer[annotationPart]) === "object") {
            annotationPointer = annotationPointer[annotationPart];
          } else if (typeof annotationPointer[annotationPart] === "boolean") {
            // for handling something like this:
            //      @Semantics.URL: true
            //      @Semantics.URL.mimeType: "anotherAttribute"
            // if @Semantics.URL.mimeType is set, than @Semantics.URL is implicitely assumed to be 'true'
            annotationPointer[annotationPart] = {};
            annotationPointer = annotationPointer[annotationPart];
          } else {
            // should never happen!
            return;
          }
        }

        // Step 02: set value for annotation.
        if (i < annotationParts.length) {
          annotationPart = annotationParts[i];
          if (annotationPointer[annotationPart] === undefined) {
            // value can be simple value, like string, or array
            annotationPointer[annotationPart] = value;
          } else if (Array.isArray(annotationPointer[annotationPart])) {
            // existing value could be an array, in which case the new value needs to be mixed in
            if (Array.isArray(value)) {
              // new value is an array, which can be appended to the existing array value
              annotationPointer[annotationPart] = annotationPointer[annotationPart].concat(value);
            } else {
              // new value is a simple value. In this case create a dummy entry in the existing array
              // (or use the dummy entry which had been created before) and add the new value to that entry.
              annotationPointer[dummyEntryName] = annotationPointer[dummyEntryName] || {};
              if (!annotationPointer[dummyEntryName][annotationPart]) {
                annotationPointer[dummyEntryName][annotationPart] = value;
                annotationPointer[annotationPart].push(annotationPointer[dummyEntryName][annotationPart]);
              } else {
                for (var propName in value) {
                  if (!annotationPointer[dummyEntryName][annotationPart][propName]) {
                    annotationPointer[dummyEntryName][annotationPart][propName] = value[propName];
                  }
                }
              }
            }
          }
        }
      }
    }, {
      key: "fillMetadataBuffer",
      value: function fillMetadataBuffer(dataSource, attributes) {
        if (dataSource.attributesMetadata[0].id !== "dummy") {
          // check if buffer already filled
          return;
        }
        dataSource.attributesMetadata = [];
        dataSource.attributeMetadataMap = {};
        var cdsAnnotations = {
          dataSourceAnnotations: {},
          // Key-Value-Map for CDS annotations
          attributeAnnotations: {} // Key-Value-Map (keys: attribute names) of Key-Value-Maps (keys: annotation names) for CDS annotations
        };

        cdsAnnotations.dataSourceAnnotations = dataSource.annotations;
        for (var attributeMetadata in attributes.attributeMap) {
          try {
            this.fillPublicMetadataBuffer(dataSource, attributes.attributeMap[attributeMetadata], cdsAnnotations);
          } catch (e) {
            // not allowed by linter:
            this.log.error("Attribue " + attributeMetadata + " of DataSource " + dataSource.label + " can not be filled in meta data" + e.toString());
          }
        }
        var parser = this.sina._createCDSAnnotationsParser({
          dataSource: dataSource,
          cdsAnnotations: cdsAnnotations
        });
        parser.parseCDSAnnotationsForDataSource();
      }
    }, {
      key: "fillPublicMetadataBuffer",
      value: function fillPublicMetadataBuffer(dataSource, attributeMetadata, cdsAnnotations) {
        var displayOrderIndex = attributeMetadata.displayOrder;

        // Prepare annotations for being passed over to the CDS annotations parser
        var attributeAnnotations = cdsAnnotations.attributeAnnotations[attributeMetadata.labelRaw] = {};
        // var attributeAnnotationsSrc = attributeMetadata.annotationsAttr;

        // jQuery.extend(attributeAnnotations, attributeMetadata.annotationsAttr);
        for (var propName in attributeMetadata.annotationsAttr) {
          attributeAnnotations[propName] = attributeMetadata.annotationsAttr[propName];
        }

        // if this attribute has a Semantics property but no semantics annotation, create a new semantics annotation that corresponds to Semantics propery.
        // var hasSemanticsAnnotation = false,
        //     semanticsPrefix = "SEMANTICS.";
        // for(var key in attributeAnnotationsSrc){
        //     attributeAnnotations[key] = attributeAnnotationsSrc[key];
        // }
        // for (var j = 0; j < attributeAnnotationsSrc.length; j++) {

        // if (hasSemanticsAnnotation || attributeAnnotationsSrc[j].Name.substr(0, semanticsPrefix.length) == semanticsPrefix) {
        //     hasSemanticsAnnotation = true;
        // }
        // }
        // if (attributeMetadata.Semantics && !hasSemanticsAnnotation) {
        //     var semanticsValue;
        //     switch (attributeMetadata.Semantics) {
        //     case "EMAIL.ADDRESS":
        //     case "TELEPHONE.TYPE":
        //     case "CURRENCYCODE":
        //     case "UNITOFMEASURE":
        //         semanticsValue = "TRUE";
        //         break;
        //     case "QUANTITY.UNITOFMEASURE":
        //     case "AMOUNT.CURRENCYCODE":
        //         semanticsValue = attributeMetadata.UnitAttribute;
        //         break;
        //     }
        //     if (semanticsValue) {
        //         attributeAnnotations[semanticsPrefix + attributeMetadata.Semantics] = semanticsValue;
        //     }
        // }

        var typeAndFormat = this._parseAttributeTypeAndFormat(attributeMetadata, dataSource, attributeMetadata.labelRaw);
        if (typeAndFormat && typeAndFormat.type) {
          var _attributeMetadata$hi, _attributeMetadata$hi2, _attributeMetadata$hi3;
          var publicAttributeMetadata = this.sina._createAttributeMetadata({
            id: attributeMetadata.labelRaw,
            label: attributeMetadata.label || attributeMetadata.labelRaw,
            isKey: attributeMetadata.isKey || false,
            isSortable: attributeMetadata.isSortable,
            usage: this._parseUsage(attributeMetadata, displayOrderIndex) || {},
            type: typeAndFormat.type,
            format: typeAndFormat.format,
            matchingStrategy: this._parseMatchingStrategy(attributeMetadata),
            isHierarchy: !!attributeMetadata.hierarchyDefinition,
            hierarchyName: attributeMetadata === null || attributeMetadata === void 0 ? void 0 : (_attributeMetadata$hi = attributeMetadata.hierarchyDefinition) === null || _attributeMetadata$hi === void 0 ? void 0 : _attributeMetadata$hi.name,
            hierarchyDisplayType: attributeMetadata === null || attributeMetadata === void 0 ? void 0 : (_attributeMetadata$hi2 = attributeMetadata.hierarchyDefinition) === null || _attributeMetadata$hi2 === void 0 ? void 0 : _attributeMetadata$hi2.displayType
          });

          // move flag isHierarchyDefinition from attribute to datasource
          if ((_attributeMetadata$hi3 = attributeMetadata.hierarchyDefinition) !== null && _attributeMetadata$hi3 !== void 0 && _attributeMetadata$hi3.isHierarchyDefinition) {
            var _attributeMetadata$hi4, _attributeMetadata$hi5, _attributeMetadata$hi6, _attributeMetadata$hi7;
            dataSource.isHierarchyDefinition = (_attributeMetadata$hi4 = attributeMetadata.hierarchyDefinition) === null || _attributeMetadata$hi4 === void 0 ? void 0 : _attributeMetadata$hi4.isHierarchyDefinition;
            dataSource.hierarchyName = (_attributeMetadata$hi5 = attributeMetadata.hierarchyDefinition) === null || _attributeMetadata$hi5 === void 0 ? void 0 : _attributeMetadata$hi5.name;
            dataSource.hierarchyAttribute = (_attributeMetadata$hi6 = attributeMetadata.hierarchyDefinition) === null || _attributeMetadata$hi6 === void 0 ? void 0 : _attributeMetadata$hi6.attributeName;
            dataSource.hierarchyDisplayType = (_attributeMetadata$hi7 = attributeMetadata.hierarchyDefinition) === null || _attributeMetadata$hi7 === void 0 ? void 0 : _attributeMetadata$hi7.displayType;
          } else {
            var _attributeMetadata$hi8;
            var hierarchyDefinitionName = (_attributeMetadata$hi8 = attributeMetadata.hierarchyDefinition) === null || _attributeMetadata$hi8 === void 0 ? void 0 : _attributeMetadata$hi8.name;
            if (hierarchyDefinitionName && hierarchyDefinitionName !== dataSource.id) {
              dataSource.hierarchyHelperDatasource = this.sina.getDataSource(hierarchyDefinitionName);
            }
          }
          publicAttributeMetadata._private.semanticObjectType = attributeMetadata.SemanticObjectTypeId;
          dataSource.attributesMetadata.push(publicAttributeMetadata);
          dataSource.attributeMetadataMap[publicAttributeMetadata.id] = publicAttributeMetadata;
        }
      }
    }, {
      key: "_parseMatchingStrategy",
      value: function _parseMatchingStrategy(attributeMetadata) {
        if (attributeMetadata.supportsTextSearch === true) {
          return MatchingStrategy.Text;
        }
        return MatchingStrategy.Exact;
      }
    }, {
      key: "_parseAttributeTypeAndFormat",
      value: function _parseAttributeTypeAndFormat(attributeMetadata, dataSource, attributeId) {
        for (var i = 0; i < attributeMetadata.presentationUsage.length; i++) {
          var presentationUsage = attributeMetadata.presentationUsage[i] || "";
          switch (presentationUsage.toUpperCase()) {
            case "SUMMARY":
              continue;
            case "DETAIL":
              continue;
            case "TITLE":
              continue;
            case "HIDDEN":
              continue;
            case "FACTSHEET":
              continue;
            case "THUMBNAIL":
            case "IMAGE":
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
        switch (attributeMetadata.type) {
          case "Edm.Binary":
            if (attributeMetadata.annotationsAttr) {
              if (attributeMetadata.annotationsAttr.SEMANTICS && attributeMetadata.annotationsAttr.SEMANTICS.CONTACT && attributeMetadata.annotationsAttr.SEMANTICS.CONTACT.PHOTO || attributeMetadata.annotationsAttr.SEMANTICS && attributeMetadata.annotationsAttr.SEMANTICS.IMAGEURL) {
                return {
                  type: AttributeType.ImageBlob
                };
              }
            }
            return {
              type: AttributeType.String
            };
            break;
          case "Edm.String":
          case "Edm.PrimitiveType":
          case "Edm.Boolean":
          case "Edm.Byte":
          case "Edm.Guid":
            return {
              type: AttributeType.String
            };
          case "Edm.Double":
          case "Edm.Decimal":
          case "Edm.Float":
          case "Edm.Single":
          case "Edm.SingleRange":
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
          case "Edm.Date":
            return {
              type: AttributeType.Date
            };
          case "Edm.DateTime":
          case "Edm.DateTimeOffset":
            if (attributeMetadata.TypeLength !== undefined && attributeMetadata.TypeLength <= 8) {
              // is this necessary for backwards compatibility??
              return {
                type: AttributeType.Date
              };
            }
            return {
              type: AttributeType.Timestamp
            };
          case "Collection(Edm.String)":
            return {
              type: AttributeType.String
            };
          case "Edm.GeometryPoint":
            return {
              type: AttributeType.GeoJson
            };
          case "Edm.GeographyPoint":
            return {
              type: AttributeType.GeoJson
            };
          case "GeoJson":
            return {
              type: AttributeType.GeoJson
            };
          default:
            if (attributeMetadata.type && attributeMetadata.type.startsWith("Collection")) {
              this.log.warn("Unsupported data type " + attributeMetadata.type + " of attribute " + attributeMetadata.labelRaw + " in " + dataSource.label);
              return {
                type: AttributeType.String
              };
            }
            throw new UnknownAttributeTypeError("Unsupported oData type " + attributeMetadata.type + " of attribute " + (attributeMetadata.labelRaw || attributeId) + " in " + dataSource.label + ". " + "Please only use supported oData types in search model: " + "Edm.String, Edm.Boolean, " + "Edm.Double, Edm.Decimal, Edm.Float, Edm.Single, Edm.SingleRange, Edm.Int16, Edm.Int32, Edm.Int63, " + "Edm.Time, Edm.Date, Edm.DateTime, Edm.DateTimeOffset, " + "Edm.Byte, Edm.Binary, Edm.Guid, Edm.GeometryPoint, GeoJson.");
        }
      }
    }, {
      key: "_parseUsage",
      value: function _parseUsage(attributeMetadata, displayOrderIndex) {
        var usage = {};
        for (var i = 0; i < attributeMetadata.presentationUsage.length; i++) {
          var id = attributeMetadata.presentationUsage[i].toUpperCase() || "";
          if (id === "TITLE") {
            usage.Title = {
              displayOrder: displayOrderIndex
            };
          }
          if (id === "SUMMARY" || id === "DETAIL" || id === "IMAGE" || id === "THUMBNAIL" || id === "LONGTEXT"
          //||id === "#HIDDEN"
          ) {
            usage.Detail = {
              displayOrder: displayOrderIndex
            };
          }
        }
        if (attributeMetadata.isFacet) {
          usage.AdvancedSearch = {
            displayOrder: attributeMetadata.facetPosition || displayOrderIndex || 100,
            iconUrlAttributeName: attributeMetadata.facetIconUrlAttributeName
          };
          usage.Facet = {
            displayOrder: attributeMetadata.facetPosition || displayOrderIndex || 100,
            iconUrlAttributeName: attributeMetadata.facetIconUrlAttributeName
          };
        }
        if (attributeMetadata.isFilteringAttribute) {
          usage.AdvancedSearch = {
            displayOrder: attributeMetadata.facetPosition || displayOrderIndex || 100,
            iconUrlAttributeName: attributeMetadata.facetIconUrlAttributeName
          };
        }
        return usage;
      }
    }, {
      key: "parseDynamicMetadata",
      value: function parseDynamicMetadata(searchResult) {
        // check that we have dynamic metadata
        var data = searchResult.data;
        if (!data) {
          return;
        }
        var metadata = data["@com.sap.vocabularies.Search.v1.Metadata"];
        if (!metadata) {
          return;
        }

        // generate attributes from dynamic metadata
        for (var dataSourceId in metadata) {
          var dataSourceMetadata = metadata[dataSourceId];
          for (var attributeId in dataSourceMetadata) {
            if (attributeId === "$Kind") {
              continue;
            }
            var dynamicAttributeMetadata = dataSourceMetadata[attributeId];
            this.parseDynamicAttributeMetadata(this.sina.getDataSource(dataSourceId), attributeId, dynamicAttributeMetadata);
          }
        }
      }
    }, {
      key: "parseDynamicAttributeMetadata",
      value: function parseDynamicAttributeMetadata(dataSource, attributeId, dynamicAttributeMetadata) {
        var typeAndFormat = this._parseAttributeTypeAndFormat({
          presentationUsage: [],
          type: dynamicAttributeMetadata.$Type
        }, dataSource, attributeId);
        var attributeMetadata;
        try {
          attributeMetadata = dataSource.getAttributeMetadata(attributeId);
        } catch (e) {
          // error handling below
        }
        if (attributeMetadata) {
          var _attributeMetadata$us, _attributeMetadata$us2;
          // update
          if (!attributeMetadata._private.dynamic) {
            return; // only update dynamic attributes
          }

          attributeMetadata.label = dynamicAttributeMetadata["@SAP.Common.Label"];
          attributeMetadata.type = typeAndFormat.type;
          attributeMetadata.format = typeAndFormat === null || typeAndFormat === void 0 ? void 0 : typeAndFormat.format;
          attributeMetadata.usage = dynamicAttributeMetadata["@EnterpriseSearch.filteringFacet.default"] === true ? {
            Facet: {
              displayOrder: dynamicAttributeMetadata["@EnterpriseSearch.filteringFacet.displayPosition"] || ((_attributeMetadata$us = attributeMetadata.usage) === null || _attributeMetadata$us === void 0 ? void 0 : (_attributeMetadata$us2 = _attributeMetadata$us.Facet) === null || _attributeMetadata$us2 === void 0 ? void 0 : _attributeMetadata$us2.displayOrder) || 20,
              iconUrlAttributeName: dynamicAttributeMetadata["@EnterpriseSearch.filteringFacet.iconUrl"] || attributeMetadata.iconUrlAttributeName || ""
            }
          } : {};
          attributeMetadata.isSortable = dynamicAttributeMetadata["@EnterpriseSearchHana.isSortable"] || attributeMetadata.isSortable || false;
        } else {
          // append
          attributeMetadata = this.sina._createAttributeMetadata({
            id: attributeId,
            label: dynamicAttributeMetadata["@SAP.Common.Label"],
            isKey: false,
            isSortable: dynamicAttributeMetadata["@EnterpriseSearchHana.isSortable"] || false,
            usage: dynamicAttributeMetadata["@EnterpriseSearch.filteringFacet.default"] === true ? {
              Facet: {
                displayOrder: dynamicAttributeMetadata["@EnterpriseSearch.filteringFacet.displayPosition"] || 20,
                iconUrlAttributeName: dynamicAttributeMetadata["@EnterpriseSearch.filteringFacet.iconUrl"] || ""
              }
            } : {},
            type: typeAndFormat.type,
            format: typeAndFormat === null || typeAndFormat === void 0 ? void 0 : typeAndFormat.format,
            matchingStrategy: MatchingStrategy.Exact,
            _private: {
              dynamic: true
            }
          });
          dataSource.attributesMetadata.push(attributeMetadata);
          dataSource.attributeMetadataMap[attributeMetadata.id] = attributeMetadata;
        }
      }
    }, {
      key: "getUniqueDataSourceFromSearchResult",
      value: function getUniqueDataSourceFromSearchResult(searchResult) {
        var data = searchResult.data;
        if (!data) {
          return;
        }
        var items = data.value;
        if (!items) {
          return;
        }
        var dataSourceId, prevDataSourceId;
        for (var i = 0; i < items.length; ++i) {
          var item = items[i];
          var context = item["@odata.context"];
          if (!context) {
            return;
          }
          dataSourceId = context.split("#")[1];
          if (!dataSourceId) {
            return;
          }
          if (prevDataSourceId && prevDataSourceId !== dataSourceId) {
            return;
          }
          prevDataSourceId = dataSourceId;
        }
        return this.sina.getDataSource(dataSourceId);
      }
    }]);
    return MetadataParser;
  }();
  var __exports = {
    __esModule: true
  };
  __exports.MetadataParser = MetadataParser;
  return __exports;
});
})();