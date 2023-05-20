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
sap.ui.define(["../../sina/SinaObject", "../../core/util", "./typeConverter", "../tools/WhyfoundProcessor"], function (____sina_SinaObject, util, typeConverter, ___tools_WhyfoundProcessor) {
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
  var SinaObject = ____sina_SinaObject["SinaObject"];
  // import { SearchResultSetItemAttribute } from "../../sina/SearchResultSetItemAttribute";
  var WhyfoundProcessor = ___tools_WhyfoundProcessor["WhyfoundProcessor"];
  var ItemParser = /*#__PURE__*/function (_SinaObject) {
    _inherits(ItemParser, _SinaObject);
    var _super = _createSuper(ItemParser);
    function ItemParser(provider) {
      var _this;
      _classCallCheck(this, ItemParser);
      _this = _super.call(this);
      _this.provider = provider;
      _this.sina = provider.sina;
      _this.intentsResolver = _this.sina._createFioriIntentsResolver();
      _this.suvNavTargetResolver = _this.sina._createSuvNavTargetResolver();
      return _this;
    }
    _createClass(ItemParser, [{
      key: "parse",
      value: function parse(searchQuery, data) {
        if (data.ResultList.SearchResults === null) {
          return Promise.resolve([]);
        }
        var itemsData = data.ResultList.SearchResults.results;
        return this.parseItems(itemsData);
      }
    }, {
      key: "parseItems",
      value: function parseItems(itemsData) {
        var itemProms = [];
        for (var i = 0; i < itemsData.length; ++i) {
          var itemData = itemsData[i];
          var itemProm = this.parseItem(itemData);
          itemProms.push(itemProm);
        }
        return Promise.all(itemProms);
      }
    }, {
      key: "parseItem",
      value: function parseItem(itemData) {
        try {
          const _this2 = this;
          var j;
          var allAttributes = {}; // all server attributes (response attributes, hit attributes, ...)
          var titleAttributes = [];
          var titleDescriptionAttributes = [];
          var attributes = [];
          var detailAttributes = [];
          var semanticObjectTypeAttributes = [];
          var fallbackDefaultNavigationTarget;
          var dataSource = _this2.sina.getDataSource(itemData.DataSourceId);
          var attributeData, metadata, attribute, semanticObjectType;
          var score = itemData.Score / 100;
          var suvHighlightTerms = [];
          var suvAttribute, suvAttributeName, suvUrlAttribute, suvMimeTypeAttribute;
          var suvAttributes = {};
          var whyFounds = {};
          var whyFoundProcessor = new WhyfoundProcessor(_this2.sina);
          for (j = 0; j < itemData.Attributes.results.length; j++) {
            attributeData = itemData.Attributes.results[j];
            metadata = dataSource.getAttributeMetadata(attributeData.Id);
            attribute = _this2.sina._createSearchResultSetItemAttribute({
              id: attributeData.Id,
              label: metadata.label,
              value: typeConverter.odata2Sina(metadata.type, attributeData.Value),
              valueFormatted: attributeData.ValueFormatted !== undefined ? attributeData.ValueFormatted : attributeData.Value,
              // replace: attributeData.ValueFormatted || attributeData.Value
              // "" || "0000-00-00" -> "0000-00-00" is meaningless value
              valueHighlighted: attributeData.Snippet || "",
              isHighlighted: attributeData.Snippet.indexOf("<b>") > -1 && attributeData.Snippet.indexOf("</b>") > -1,
              metadata: metadata,
              groups: []
            });

            // envalue valueFormatted in ResultValueFormatter.js
            //attribute.valueFormatted = attributeData.ValueFormatted;
            //attribute.valueHighlighted = attributeData.Snippet || attributeData.ValueFormatted;

            allAttributes[attribute.id] = attribute;

            // collect highlight terms needed for creation of suv viewer link
            util.appendRemovingDuplicates(suvHighlightTerms, util.extractHighlightedTerms(attribute.valueHighlighted));
            if (metadata.suvUrlAttribute && metadata.suvMimeTypeAttribute) {
              suvUrlAttribute = allAttributes[metadata.suvUrlAttribute] || metadata.suvUrlAttribute.id;
              suvMimeTypeAttribute = allAttributes[metadata.suvMimeTypeAttribute] || metadata.suvMimeTypeAttribute.id;
              suvAttributes[attributeData.Id] = {
                suvThumbnailAttribute: attribute,
                suvTargetUrlAttribute: suvUrlAttribute,
                suvTargetMimeTypeAttribute: suvMimeTypeAttribute
              };
            }

            //attribute = util.addPotentialNavTargetsToAttribute(this.sina, attribute); //find emails phone nrs etc and augment attribute if required

            if (metadata.usage.Navigation) {
              if (metadata.usage.Navigation.mainNavigation) {
                fallbackDefaultNavigationTarget = _this2.sina._createNavigationTarget({
                  label: attribute.value,
                  targetUrl: attribute.value,
                  target: "_blank"
                });
              }
            }
            attributes.push(attribute);
            if (metadata.usage.Detail) {
              detailAttributes.push(attribute);
            }
            if (metadata.usage.Title) {
              titleAttributes.push(attribute);
            }
            if (metadata.usage.TitleDescription) {
              titleDescriptionAttributes.push(attribute);
            }
            semanticObjectType = dataSource.attributeMetadataMap[attribute.id]._private.semanticObjectType;
            if (semanticObjectType && semanticObjectType.length > 0) {
              semanticObjectTypeAttributes.push({
                name: semanticObjectType,
                value: attribute.value,
                type: attribute.metadata.type
              });
            }

            // push response attributes (highlighted and not visible) to whyFounds
            if (attribute.isHighlighted || attribute.descriptionAttribute && attribute.descriptionAttribute.isHighlighted) {
              if (!_this2._isVisible(metadata) && typeof whyFounds[attribute.id] === "undefined") {
                // this._isVisible means:
                // attribute is used as title or title description or detail, or
                // attribute is in Template of ancestor group attribute, that is used as title or title description or detail
                whyFounds[attribute.id] = [attribute.valueHighlighted];
              }
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

          // sort attributes
          titleAttributes.sort(function (a1, a2) {
            return a1.metadata.usage.Title.displayOrder - a2.metadata.usage.Title.displayOrder;
          });
          detailAttributes.sort(function (a1, a2) {
            return a1.metadata.usage.Detail.displayOrder - a2.metadata.usage.Detail.displayOrder;
          });

          // // parse HitAttributes -> replaced by this._parseHitAttributes(itemData);
          // const hitAttributes = this._parseHitAttributes(itemData, dataSource, suvHighlightTerms);
          // whyFoundAttributes = whyFoundAttributes.concat(hitAttributes);
          // // concatinate whyFound attributes to detail attributes
          // detailAttributes = detailAttributes.concat(whyFoundAttributes);

          _this2.suvNavTargetResolver.resolveSuvNavTargets(dataSource, suvAttributes, suvHighlightTerms);
          var searchResultSetItem = _this2.sina._createSearchResultSetItem({
            dataSource: dataSource,
            attributes: attributes,
            titleAttributes: titleAttributes,
            titleDescriptionAttributes: titleDescriptionAttributes,
            detailAttributes: detailAttributes,
            defaultNavigationTarget: fallbackDefaultNavigationTarget,
            navigationTargets: [],
            score: score
          });
          searchResultSetItem._private.allAttributesMap = allAttributes;
          searchResultSetItem._private.semanticObjectTypeAttributes = semanticObjectTypeAttributes;
          var itemPostParser = _this2.sina._createItemPostParser({
            searchResultSetItem: searchResultSetItem
          });
          var ungrouppedDetailAttributes = searchResultSetItem.detailAttributes;
          return _await(itemPostParser.postParseResultSetItem(), function (postResultSetItem) {
            whyFounds = _this2._pushAdditionalWhyFounds(itemData, whyFounds, ungrouppedDetailAttributes); // push request attributes (highlighted and not visible) to whyFounds
            return _await(whyFoundProcessor.processAdditionalWhyfoundAttributes(whyFounds, postResultSetItem));
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }

      // check single attribute is visible (stand-alone or in group attribute)
    }, {
      key: "_isVisible",
      value: function _isVisible(metadata) {
        if (typeof metadata.usage.Title !== "undefined" || typeof metadata.usage.Detail !== "undefined" || typeof metadata.isDescription !== "undefined") {
          return true;
        }
        if (Array.isArray(metadata.groups)) {
          // const isVisible = false;
          for (var i = 0; i < metadata.groups.length; i++) {
            var group = metadata.groups[i].group;
            if (this._isVisible(group) && this._isInTamplate(metadata.id, group)) {
              return true;
            }
          }
          return false;
        }
        return false;
      }

      // check child attribute in template of group attribute
    }, {
      key: "_isInTamplate",
      value: function _isInTamplate(id, group) {
        if (group.template && group.attributes && group.attributes.length > 0) {
          var nameInTemplate = this._getNameInGroup(id, group.attributes);
          if (nameInTemplate && group.template.includes("{" + nameInTemplate + "}")) {
            return true;
          }
        }
        return false;
      }

      // get child attribute's alias name used in template of group attribute
      // eslint-disable-next-line
    }, {
      key: "_getNameInGroup",
      value: function _getNameInGroup(id, attributesInGroup) {
        for (var i = 0; i < attributesInGroup.length; i++) {
          if (attributesInGroup[i].attribute.id === id) {
            return attributesInGroup[i].nameInGroup;
          }
        }
        return undefined;
      }

      // push highlighted request attribute
      // eslint-disable-next-line
    }, {
      key: "_pushAdditionalWhyFounds",
      value: function _pushAdditionalWhyFounds(itemData, whyFounds, ungrouppedDetailAttributes) {
        if (itemData.HitAttributes && Array.isArray(itemData.HitAttributes.results)) {
          for (var i = 0; i < itemData.HitAttributes.results.length; i++) {
            var attributeData = itemData.HitAttributes.results[i];
            if (typeof whyFounds[attributeData.id] === "undefined" && !this._isUngrouppedDetailAttribute(attributeData.Id, ungrouppedDetailAttributes)) {
              // avoid duplicated whyfounds:
              // attribute is a response attribute + highlighted + visible
              // and it is a request attribute + highlighted (hitAttribute)
              whyFounds[attributeData.Id] = [attributeData.Snippet];
            }
          }
        }
        return whyFounds;
      }

      // check attribute (hitAttribue) has been already in ungroupped detail attribute set
      // eslint-disable-next-line
    }, {
      key: "_isUngrouppedDetailAttribute",
      value: function _isUngrouppedDetailAttribute(id, ungrouppedDetailAttributes) {
        for (var k = 0; k < ungrouppedDetailAttributes.length; k++) {
          if (id === ungrouppedDetailAttributes[k].id) {
            return true;
          }
        }
        return false;
      }

      // file view's suvHighlightTerms is not used!
      // _parseHitAttributes(itemData, dataSource, suvHighlightTerms): Array<SearchResultSetItemAttribute> {
      //     const hitAttributes = [];
      //     if (itemData.HitAttributes !== null) {
      //         for (let i = 0; i < itemData.HitAttributes.results.length; i++) {
      //             const attributeData = itemData.HitAttributes.results[i];
      //             const metadata = dataSource.getAttributeMetadata(attributeData.Id);
      //             const value = typeConverter.odata2Sina(
      //                 metadata.type,
      //                 util.filterString(attributeData.Snippet, ["<b>", "</b>"])
      //             );
      //             const attribute = this.sina._createSearchResultSetItemAttribute({
      //                 id: attributeData.Id,
      //                 label: metadata.label,
      //                 //TO DO: abap_odata2Sina
      //                 value: value,
      //                 valueFormatted: value,
      //                 valueHighlighted: attributeData.Snippet,
      //                 isHighlighted:
      //                     attributeData.Snippet.indexOf("<b>") > -1 &&
      //                     attributeData.Snippet.indexOf("</b>") > -1,
      //                 metadata: metadata,
      //             });

      //             util.appendRemovingDuplicates(
      //                 suvHighlightTerms,
      //                 util.extractHighlightedTerms(attribute.valueHighlighted)
      //             );
      //             hitAttributes.push(attribute);
      //         }
      //     }
      //     return hitAttributes;
      // }
    }]);

    return ItemParser;
  }(SinaObject);
  var __exports = {
    __esModule: true
  };
  __exports.ItemParser = ItemParser;
  return __exports;
});
})();