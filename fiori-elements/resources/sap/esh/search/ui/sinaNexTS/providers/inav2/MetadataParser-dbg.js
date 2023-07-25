/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../core/errors", "../../sina/AttributeFormatType", "../../sina/AttributeType", "../../sina/MatchingStrategy"], function (____core_errors, ____sina_AttributeFormatType, ____sina_AttributeType, ____sina_MatchingStrategy) {
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
  var UnknownDataTypeError = ____core_errors["UnknownDataTypeError"];
  var UnknownPresentationUsageError = ____core_errors["UnknownPresentationUsageError"];
  var AttributeFormatType = ____sina_AttributeFormatType["AttributeFormatType"];
  var AttributeType = ____sina_AttributeType["AttributeType"];
  var MatchingStrategy = ____sina_MatchingStrategy["MatchingStrategy"];
  var MetadataParser = /*#__PURE__*/function () {
    function MetadataParser(provider) {
      _classCallCheck(this, MetadataParser);
      this.provider = provider;
      this.sina = provider.sina;
    }
    _createClass(MetadataParser, [{
      key: "normalizeAttributeMetadata",
      value: function normalizeAttributeMetadata(attributeMetadata) {
        attributeMetadata.IsKey = attributeMetadata.isKey; // normalize, probably a typo in abap ina
      }
    }, {
      key: "parseRequestAttributes",
      value: function parseRequestAttributes(dataSource, data) {
        var dimensions = data.Cube.Dimensions;
        var filteredAttributes = [];
        for (var i = 0; i < dimensions.length; ++i) {
          var dimension = dimensions[i];
          if (dimension.Name.slice(0, 2) === "$$") {
            continue;
          }
          var attribute = dimension.Attributes[0];
          this.normalizeAttributeMetadata(attribute);
          filteredAttributes.push(attribute);
        }
        this.provider.fillInternalMetadata(dataSource, "metadataRequest", filteredAttributes);
      }
    }, {
      key: "parseResponseAttributes",
      value: function parseResponseAttributes(dataSource, data) {
        var filteredAttributes = [];
        var attributes = data.Cube.Dimensions[0].Attributes;
        for (var i = 0; i < attributes.length; ++i) {
          var attribute = attributes[i];
          if (attribute.Name.slice(0, 2) === "$$") {
            continue;
          }
          this.normalizeAttributeMetadata(attribute);
          filteredAttributes.push(attribute);
        }
        this.provider.fillInternalMetadata(dataSource, "metadataRequest", filteredAttributes);
      }
    }, {
      key: "parseMetadataRequestMetadata",
      value: function parseMetadataRequestMetadata(dataSource, data) {
        // parse metadata loaded via explicitely metadata request
        // (this metadata includes hasFulltextIndex information but not the display order information)

        // check whether buffer already filled
        var metadataLoadStatus = this.provider.getInternalMetadataLoadStatus(dataSource);
        if (metadataLoadStatus.metadataRequest) {
          return;
        }
        // parse attribute metadata
        this.parseRequestAttributes(dataSource, data);
        this.parseResponseAttributes(dataSource, data);
        // fill public metadata from internal metadata
        this.fillPublicMetadataBuffer(dataSource);
      }
    }, {
      key: "parseSearchRequestMetadata",
      value: function parseSearchRequestMetadata(itemData) {
        // parse metadata loaded implicitly by search request
        // (this metadata includes the display order information but not the hasFulltextIndex information)

        // get data source from data
        var dataSource = this.sina.getDataSource(itemData.$$DataSourceMetaData$$[0].ObjectName);
        // check whether buffer already filled
        var metadataLoadStatus = this.provider.getInternalMetadataLoadStatus(dataSource);
        if (metadataLoadStatus.searchRequest) {
          return;
        }
        // fill internal metadata buffer
        this.provider.fillInternalMetadata(dataSource, "searchRequest", itemData.$$AttributeMetadata$$);
        // fill public metadata from internal metadata
        this.fillPublicMetadataBuffer(dataSource);
        // calculate attribute display sequence from sequence in result item
        this.calculateAttributeDisplayOrder(dataSource, itemData);
      }
    }, {
      key: "fillPublicMetadataBuffer",
      value: function fillPublicMetadataBuffer(dataSource) {
        // clear old public metadata
        dataSource.attributesMetadata = [];
        dataSource.attributeMetadataMap = {};
        // create new public metadata
        var attributesMetadata = this.provider.getInternalMetadataAttributes(dataSource);
        for (var i = 0; i < attributesMetadata.length; ++i) {
          var attributeMetadata = attributesMetadata[i];
          var attributeTypeAndFormat = this._parseAttributeTypeAndFormat(attributeMetadata);
          var publicAttributeMetadata = this.sina._createAttributeMetadata({
            type: attributeTypeAndFormat.type,
            format: attributeTypeAndFormat.format,
            id: attributeMetadata.Name,
            label: attributeMetadata.Description,
            isSortable: this._parseIsSortable(attributeMetadata),
            isKey: attributeMetadata.IsKey,
            matchingStrategy: this._parseMatchingStrategy(attributeMetadata),
            usage: this._parseUsage(attributeMetadata)
          });
          dataSource.attributesMetadata.push(publicAttributeMetadata);
          dataSource.attributeMetadataMap[attributeMetadata.Name] = publicAttributeMetadata;
        }
        dataSource._configure();
      }
    }, {
      key: "calculateAttributeDisplayOrder",
      value: function calculateAttributeDisplayOrder(dataSource, itemData) {
        var attributeId, attributeMetadata, i;
        var titleAttributes = [];
        var detailAttributesPrio1 = [];
        var detailAttributesPrio2 = [];
        var detailAttributes = [];

        // distribute attributes in lists according to presentationUsage
        for (var j = 0; j < itemData.$$ResultItemAttributes$$.length; ++j) {
          var attributeData = itemData.$$ResultItemAttributes$$[j];
          var attributeInternalMetadata = this.provider.getInternalMetadataAttribute(dataSource, attributeData.Name);
          if (attributeInternalMetadata.presentationUsage.indexOf("Title") >= 0 || attributeInternalMetadata.IsTitle) {
            titleAttributes.push(attributeData.Name);
          }
          if (attributeInternalMetadata.presentationUsage.indexOf("Summary") >= 0 || attributeInternalMetadata.presentationUsage.indexOf("Image") >= 0 || attributeInternalMetadata.presentationUsage.indexOf("Thumbnail") >= 0) {
            detailAttributesPrio1.push(attributeData.Name);
          } else if (attributeInternalMetadata.presentationUsage.indexOf("Detail") >= 0) {
            detailAttributesPrio2.push(attributeData.Name);
          }
        }

        // calculate title display order
        for (i = 0; i < titleAttributes.length; ++i) {
          attributeId = titleAttributes[i];
          attributeMetadata = dataSource.getAttributeMetadata(attributeId);
          attributeMetadata.usage.Title.displayOrder = i;
        }

        // calculate attribute area display order
        detailAttributes.push.apply(detailAttributes, detailAttributesPrio1);
        detailAttributes.push.apply(detailAttributes, detailAttributesPrio2);
        for (i = 0; i < detailAttributes.length; ++i) {
          attributeId = detailAttributes[i];
          attributeMetadata = dataSource.getAttributeMetadata(attributeId);
          attributeMetadata.usage.Detail.displayOrder = i;
        }
      }
    }, {
      key: "_parseIsSortable",
      value: function _parseIsSortable(attributeMetadata) {
        if (typeof attributeMetadata.IsSortable === "undefined") {
          return false;
        }
        return attributeMetadata.IsSortable;
      }
    }, {
      key: "_parseMatchingStrategy",
      value: function _parseMatchingStrategy(attributeMetadata) {
        if (attributeMetadata.hasFulltextIndex) {
          return MatchingStrategy.Text;
        }
        return MatchingStrategy.Exact;
      }
    }, {
      key: "_parseUsage",
      value: function _parseUsage(attributeMetadata) {
        var usage = {};
        if (attributeMetadata.presentationUsage.indexOf("Title") >= 0 || attributeMetadata.IsTitle) {
          usage.Title = {
            displayOrder: 0
          };
        }
        if (attributeMetadata.presentationUsage.indexOf("Summary") >= 0 || attributeMetadata.presentationUsage.indexOf("Image") >= 0 || attributeMetadata.presentationUsage.indexOf("Thumbnail") >= 0 || attributeMetadata.presentationUsage.indexOf("Detail") >= 0) {
          usage.Detail = {
            displayOrder: 0
          };
        }
        if (attributeMetadata.accessUsage.indexOf("AutoFacet") >= 0) {
          usage.Facet = {
            displayOrder: 0
          };
        }
        if (attributeMetadata.accessUsage.indexOf("AdvancedSearch") >= 0) {
          usage.AdvancedSearch = {
            displayOrder: 0
          };
        }
        return usage;
      }
    }, {
      key: "_parseAttributeTypeAndFormat",
      value: function _parseAttributeTypeAndFormat(attributeMetadata) {
        // 1. evaluate presentation usage
        for (var i = 0; i < attributeMetadata.presentationUsage.length; i++) {
          var presentationUsage = attributeMetadata.presentationUsage[i];
          switch (presentationUsage) {
            case "Summary":
              continue;
            case "Detail":
              continue;
            case "Title":
              continue;
            case "Hidden":
              continue;
            case "FactSheet":
              continue;
            case "Thumbnail":
            case "Image":
              return {
                type: AttributeType.ImageUrl
              };
            case "Text":
              return {
                type: AttributeType.String,
                format: AttributeFormatType.LongText
              };
            default:
              throw new UnknownPresentationUsageError("Unknown presentation usage " + presentationUsage);
          }
        }

        // 2. evaluate data type
        switch (attributeMetadata.DataType) {
          case "Integer":
          case "Long":
            return {
              type: AttributeType.Integer
            };
          case "Double":
            return {
              type: AttributeType.Double
            };
          case "String":
            return {
              type: AttributeType.String
            };
          case "Date":
            return {
              type: AttributeType.Date
            };
          case "Time":
            return {
              type: AttributeType.Time
            };
          case "Timestamp":
            return {
              type: AttributeType.Timestamp
            };
          case "GeoJson":
            return {
              type: AttributeType.GeoJson
            };
          default:
            throw new UnknownDataTypeError("Unknown data type " + attributeMetadata.DataType);
        }
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