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
sap.ui.define(["../../core/util", "./typeConverter", "../../core/Log", "../../core/errors", "../tools/WhyfoundProcessor", "./HierarchyNodePathParser"], function (util, typeConverter, ____core_Log, ____core_errors, ___tools_WhyfoundProcessor, ___HierarchyNodePathParser) {
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
  var Log = ____core_Log["Log"];
  var InternalServerError = ____core_errors["InternalServerError"];
  var WhyfoundProcessor = ___tools_WhyfoundProcessor["WhyfoundProcessor"];
  var HierarchyNodePathParser = ___HierarchyNodePathParser["HierarchyNodePathParser"];
  var ItemParser = /*#__PURE__*/function () {
    function ItemParser(provider) {
      _classCallCheck(this, ItemParser);
      _defineProperty(this, "log", new Log("hana_odata item parser"));
      this.provider = provider;
      this.sina = provider.sina;
      this.intentsResolver = this.sina._createFioriIntentsResolver({
        sina: this.sina
      });
      this.suvNavTargetResolver = this.sina._createSuvNavTargetResolver({
        sina: this.sina
      });
      this.hierarchyNodePathParser = new HierarchyNodePathParser(this.sina);
    }
    _createClass(ItemParser, [{
      key: "parse",
      value: function parse(searchQuery, data) {
        try {
          const _this = this;
          if (data.error && !data.value) {
            return Promise.reject(new InternalServerError(data.error.message));
          }
          if (!data.value) {
            return Promise.resolve([]);
          }
          if (data.error) {
            _this.log.warn("Server-side Warning: " + data.error.message);
          }
          var itemsData = data.value;
          var itemProms = [];
          for (var i = 0; i < itemsData.length; ++i) {
            var itemData = itemsData[i];
            var itemProm = void 0;
            try {
              itemProm = _this.parseItem(itemData, searchQuery);
              itemProms.push(itemProm);
            } catch (e) {
              _this.log.warn("Error occurred by parsing result item number " + i + ": " + e.message);
            }
          }
          return Promise.all(itemProms);
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "parseItem",
      value: function parseItem(itemData, query) {
        try {
          const _this2 = this;
          var _this$sina$getDataSou;
          var attributes = [];
          var titleAttributes = [];
          var detailAttributes = [];
          var titleDescriptionAttributes = [];
          var allAttributes = {};
          var semanticObjectTypeAttributes = {};
          var entitySetName = itemData["@odata.context"] || "";
          var posOfSeparator = entitySetName.lastIndexOf("#");
          if (posOfSeparator > -1) {
            entitySetName = entitySetName.slice(posOfSeparator + 1);
          }
          var dataSource = (_this$sina$getDataSou = _this2.sina.getDataSource(entitySetName)) !== null && _this$sina$getDataSou !== void 0 ? _this$sina$getDataSou : query.getDataSource();
          var hierarchyNodePaths = undefined;
          if (itemData["@com.sap.vocabularies.Search.v1.ParentHierarchies"]) {
            var itemResponse = {
              data: {
                "@com.sap.vocabularies.Search.v1.ParentHierarchies": itemData["@com.sap.vocabularies.Search.v1.ParentHierarchies"]
              }
            };
            hierarchyNodePaths = _this2.hierarchyNodePathParser.parse(itemResponse, query);
          }
          var whyFounds = itemData["@com.sap.vocabularies.Search.v1.WhyFound"] || {};
          var hasHierarchyNodeChild = itemData["@com.sap.vocabularies.Search.v1.hasChildren"] || false;
          var hasHierarchyNodeChildAttribute = _this2.sina._createSearchResultSetItemAttribute({
            id: "HASHIERARCHYNODECHILD",
            label: "HASHIERARCHYNODECHILD",
            value: hasHierarchyNodeChild.toString(),
            valueFormatted: hasHierarchyNodeChild.toString(),
            valueHighlighted: hasHierarchyNodeChild.toString(),
            isHighlighted: false,
            metadata: undefined,
            groups: []
          });
          allAttributes[hasHierarchyNodeChildAttribute.id] = hasHierarchyNodeChildAttribute;
          attributes.push(hasHierarchyNodeChildAttribute);
          var metadata;
          var semanticObjectType = "";
          var suvAttributes = {};
          var suvAttribute, suvAttributeName;
          var suvHighlightTerms = [];
          var fallbackDefaultNavigationTarget;
          var rankingScore = itemData["@com.sap.vocabularies.Search.v1.Ranking"];
          var whyFoundProcessor = new WhyfoundProcessor(_this2.sina);

          // parse attributes
          var itemDataStructured = _this2.preParseItem(itemData);
          for (var attributeName in itemDataStructured) {
            if (query.groupBy && query.groupBy.aggregateCountAlias && query.groupBy.aggregateCountAlias === attributeName) {
              continue;
            }
            var structuredAttribute = itemDataStructured[attributeName];
            metadata = dataSource.getAttributeMetadata(attributeName);
            if (metadata.id == "LOC_4326") {
              // required to get maps to frontend // TODO: move to metadata parser
              metadata.usage.Detail.displayOrder = -1;
            }

            // Input:
            // value
            // highlighted
            // snippets

            // Output:
            // value            = input.value
            // valueFormatted   = TypeConverter(input.value)
            // valueHiglighted  =
            // multiline: true => input.highlighted | input.snippet | why found
            // multiline: false => input.snippet | input.highlighted | why found

            var attrValue = typeConverter.odata2Sina(metadata.type, structuredAttribute.value);
            var attrWhyFound = whyFoundProcessor.processRegularWhyFoundAttributes(attributeName, structuredAttribute, whyFounds, metadata);
            var valueString = "";
            if (typeof attrValue === "string") {
              valueString = attrValue;
            } else if (attrValue !== null && attrValue !== undefined) {
              valueString = JSON.stringify(attrValue);
            }
            var attribute = _this2.sina._createSearchResultSetItemAttribute({
              id: metadata.id,
              label: metadata.label,
              value: attrValue,
              valueFormatted: valueString,
              valueHighlighted: attrWhyFound,
              isHighlighted: whyFoundProcessor.calIsHighlighted(attrWhyFound),
              metadata: metadata,
              groups: []
            });

            // Add iconUrl if there is referred iconUrlAttributeName
            if (metadata.iconUrlAttributeName && itemDataStructured[metadata.iconUrlAttributeName]) {
              var iconUrlValue = itemDataStructured[metadata.iconUrlAttributeName];
              if (_typeof(iconUrlValue) === "object" && iconUrlValue.value) {
                attribute.iconUrl = iconUrlValue.value;
              } else {
                attribute.iconUrl = iconUrlValue;
              }
            }
            util.appendRemovingDuplicates(suvHighlightTerms, util.extractHighlightedTerms(attribute.valueHighlighted));

            // deprecated as of 1.92 since fileviewer is also deprecated
            // if (metadata.suvUrlAttribute && metadata.suvMimeTypeAttribute) {
            //     suvUrlAttribute = allAttributes[metadata.suvUrlAttribute] || metadata.suvUrlAttribute.id;
            //     suvMimeTypeAttribute =
            //         allAttributes[metadata.suvMimeTypeAttribute] || metadata.suvMimeTypeAttribute.id;
            //     suvAttributes[metadata.id] = {
            //         suvThumbnailAttribute: attribute,
            //         suvTargetUrlAttribute: suvUrlAttribute,
            //         suvTargetMimeTypeAttribute: suvMimeTypeAttribute,
            //     };
            // }

            if (metadata.usage.Title) {
              titleAttributes.push(attribute);
            }
            if (metadata.usage.TitleDescription) {
              titleDescriptionAttributes.push(attribute);
            }
            if (metadata.usage.Detail) {
              detailAttributes.push(attribute);
            }
            attributes.push(attribute);
            if (metadata.usage.Navigation) {
              if (metadata.usage.Navigation.mainNavigation) {
                fallbackDefaultNavigationTarget = _this2.sina._createNavigationTarget({
                  label: attribute.value,
                  targetUrl: attribute.value,
                  target: "_blank"
                });
              }
            }
            allAttributes[attribute.id] = attribute;
            semanticObjectType = dataSource.attributeMetadataMap[metadata.id]._private.semanticObjectType || "";
            if (semanticObjectType.length > 0) {
              semanticObjectTypeAttributes[semanticObjectType] = attrValue;
            }
          }
          for (suvAttributeName in suvAttributes) {
            suvAttribute = suvAttributes[suvAttributeName];
            if (typeof suvAttribute.suvTargetUrlAttribute === "string") {
              suvAttribute.suvTargetUrlAttribute = allAttributes[suvAttribute.suvTargetUrlAttribute];
            }
            if (typeof suvAttribute.suvTargetMimeTypeAttribute === "string") {
              suvAttribute.suvTargetMimeTypeAttribute = allAttributes[suvAttribute.suvTargetMimeTypeAttribute];
            }
            if (!(suvAttribute.suvTargetUrlAttribute || suvAttribute.suvTargetMimeTypeAttribute)) {
              delete suvAttributes[suvAttributeName];
            }
          }
          titleAttributes.sort(function (a1, a2) {
            return a1.metadata.usage.Title.displayOrder - a2.metadata.usage.Title.displayOrder;
          });
          detailAttributes.sort(function (a1, a2) {
            return a1.metadata.usage.Detail.displayOrder - a2.metadata.usage.Detail.displayOrder;
          });
          _this2.suvNavTargetResolver.resolveSuvNavTargets(dataSource, suvAttributes, suvHighlightTerms);
          var searchResultSetItem = _this2.sina._createSearchResultSetItem({
            dataSource: dataSource,
            attributes: attributes,
            titleAttributes: titleAttributes,
            titleDescriptionAttributes: titleDescriptionAttributes,
            detailAttributes: detailAttributes,
            defaultNavigationTarget: fallbackDefaultNavigationTarget,
            navigationTargets: [],
            score: rankingScore
          });
          if (Array.isArray(hierarchyNodePaths) && hierarchyNodePaths.length > 0) {
            searchResultSetItem.hierarchyNodePaths = hierarchyNodePaths;
          }
          searchResultSetItem._private.allAttributesMap = allAttributes;
          searchResultSetItem._private.semanticObjectTypeAttributes = semanticObjectTypeAttributes;
          var itemPostParser = _this2.sina._createItemPostParser({
            searchResultSetItem: searchResultSetItem
          });
          return _await(itemPostParser.postParseResultSetItem(), function (postResultSetItem) {
            return _await(whyFoundProcessor.processAdditionalWhyfoundAttributes(whyFounds, postResultSetItem));
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "preParseItem",
      value: function preParseItem(itemData) {
        var itemDataStructured = {};
        for (var originalPropertyName in itemData) {
          if (originalPropertyName[0] === "@" || originalPropertyName[0] === "_") {
            continue;
          }
          var value = itemData[originalPropertyName];
          var splitted = originalPropertyName.split("@");
          var propertyName = splitted[0];
          var substructure = itemDataStructured[propertyName];
          if (!substructure) {
            substructure = {};
            itemDataStructured[propertyName] = substructure;
          }
          if (splitted.length === 1) {
            substructure.value = value;
            continue;
          }
          if (splitted.length === 2) {
            substructure[splitted[1]] = value;
            continue;
          }
          throw "more than two @ in property name";
        }
        return itemDataStructured;
      }
    }]);
    return ItemParser;
  }();
  var __exports = {
    __esModule: true
  };
  __exports.ItemParser = ItemParser;
  return __exports;
});
})();