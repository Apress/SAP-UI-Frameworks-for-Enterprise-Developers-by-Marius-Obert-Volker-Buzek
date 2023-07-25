/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/esh/search/ui/SearchNavigationObject", "sap/esh/search/ui/SearchNavigationObjectForSinaNavTarget", "./SearchResultBaseFormatter", "./sinaNexTS/providers/abap_odata/UserEventLogger", "./sinaNexTS/sina/SearchResultSetItemAttribute"], function (SearchNavigationObject, SearchNavigationObjectForSinaNavTarget, __SearchResultBaseFormatter, ___sinaNexTS_providers_abap_odata_UserEventLogger, ___sinaNexTS_sina_SearchResultSetItemAttribute) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
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
  var SearchResultBaseFormatter = _interopRequireDefault(__SearchResultBaseFormatter);
  var UserEventType = ___sinaNexTS_providers_abap_odata_UserEventLogger["UserEventType"];
  var SearchResultSetItemAttribute = ___sinaNexTS_sina_SearchResultSetItemAttribute["SearchResultSetItemAttribute"];
  var SearchResultFormatter = /*#__PURE__*/function (_SearchResultBaseForm) {
    _inherits(SearchResultFormatter, _SearchResultBaseForm);
    var _super = _createSuper(SearchResultFormatter);
    function SearchResultFormatter(model) {
      var _this;
      _classCallCheck(this, SearchResultFormatter);
      _this = _super.call(this, model);
      _this.model = model;
      return _this;
    }
    _createClass(SearchResultFormatter, [{
      key: "format",
      value: function format(searchResultSet, terms, options) {
        options = options || {};
        options.suppressHighlightedValues = options.suppressHighlightedValues || false;
        var sina = searchResultSet.sina;
        var layoutCache = {};
        var formattedResultItems = [];
        var resultItems = searchResultSet.items;
        for (var i = 0; i < resultItems.length; i++) {
          var resultItem = resultItems[i];
          var formattedResultItem = {};
          var aItemAttributes = [];
          for (var z = 0; z < resultItem.detailAttributes.length; z++) {
            var detailAttribute = resultItem.detailAttributes[z];
            var attributeValue = "";
            var format = "";
            var defaultNavigationTarget = undefined;
            if (detailAttribute instanceof SearchResultSetItemAttribute) {
              attributeValue = detailAttribute.value;
              format = detailAttribute.metadata.format;
              defaultNavigationTarget = detailAttribute.defaultNavigationTarget;
            }
            switch (detailAttribute.metadata.type) {
              case sina.AttributeType.ImageBlob:
                if (attributeValue && attributeValue.trim().length > 0) {
                  attributeValue = "data:;base64," + attributeValue;
                }
                break;
              case sina.AttributeType.ImageUrl:
                formattedResultItem.imageUrl = attributeValue;
                formattedResultItem.imageFormat = format ? format.toLowerCase() : undefined;
                if (defaultNavigationTarget) {
                  formattedResultItem.imageNavigation = new SearchNavigationObjectForSinaNavTarget(defaultNavigationTarget, this.model);
                }
                break;
              case sina.AttributeType.GeoJson:
                formattedResultItem.geoJson = {
                  value: attributeValue,
                  label: /* resultItem.title || */detailAttribute.label // ToDo
                };

                break;
              case sina.AttributeType.Group:
                {
                  var attributeGroupAsAttribute = this._formatAttributeGroup(detailAttribute, options, /*index*/z);
                  aItemAttributes.push(attributeGroupAsAttribute);
                  break;
                }
              case sina.AttributeType.Double:
              case sina.AttributeType.Integer:
              case sina.AttributeType.String:
              case sina.AttributeType.Date:
              case sina.AttributeType.Time:
              case sina.AttributeType.Timestamp:
                {
                  var oItemAttribute = this._formatSingleAttribute(detailAttribute, options, /*index*/z);
                  aItemAttributes.push(oItemAttribute);
                  break;
                }
            }
            // }
          }

          formattedResultItem.key = resultItem.key; // ToDo, key, keystatus n.a.
          formattedResultItem.keystatus = resultItem.keystatus;
          formattedResultItem.dataSource = resultItem.dataSource;
          formattedResultItem.dataSourceName = resultItem.dataSource.label;
          formattedResultItem.attributesMap = resultItem.attributesMap;
          if (resultItem.titleAttributes) {
            var titleAttribute = void 0,
              formattedTitleAttribute = void 0,
              formattedTitle = void 0;
            var title = [];
            for (var _z = 0; _z < resultItem.titleAttributes.length; _z++) {
              titleAttribute = resultItem.titleAttributes[_z];
              if (titleAttribute.metadata.type === sina.AttributeType.Group) {
                formattedTitleAttribute = this._formatAttributeGroup(titleAttribute, options, /*index*/_z);
              } else if (titleAttribute.metadata.type === sina.AttributeType.ImageUrl) {
                formattedTitleAttribute = this._formatSingleAttribute(titleAttribute, options, /*index*/_z);
                formattedResultItem.titleIconUrl = titleAttribute.value;
                formattedTitleAttribute.value = "";
              } else {
                formattedTitleAttribute = this._formatSingleAttribute(titleAttribute, options, /*index*/_z);
              }
              if (titleAttribute.infoIconUrl) {
                formattedResultItem.titleInfoIconUrl = titleAttribute.infoIconUrl;
                formattedTitleAttribute.value = "";
              }
              formattedTitle = formattedTitleAttribute.value;
              title.push(formattedTitle);
            }
            formattedResultItem.title = title.join(" ");
          } else {
            formattedResultItem.title = options.suppressHighlightedValues ? resultItem.title // ToDo
            : resultItem.titleHighlighted; // ToDo
          }

          if (resultItem.titleDescriptionAttributes && resultItem.titleDescriptionAttributes.length > 0) {
            var titleDescriptionAttribute = void 0,
              formattedTitleDescriptionAttribute = void 0,
              formattedTitleDescription = void 0;
            var titleDescription = [];
            var titleDescriptionLabel = [];
            for (var _z2 = 0; _z2 < resultItem.titleDescriptionAttributes.length; _z2++) {
              titleDescriptionAttribute = resultItem.titleDescriptionAttributes[_z2];
              if (titleDescriptionAttribute.metadata.type === sina.AttributeType.Group) {
                formattedTitleDescriptionAttribute = this._formatAttributeGroup(titleDescriptionAttribute, options, /*index*/_z2);
              } else {
                formattedTitleDescriptionAttribute = this._formatSingleAttribute(titleDescriptionAttribute, options, /*index*/_z2);
              }
              formattedTitleDescription = formattedTitleDescriptionAttribute.value;
              titleDescription.push(formattedTitleDescription);
              titleDescriptionLabel.push(formattedTitleDescriptionAttribute.name);
            }
            formattedResultItem.titleDescription = titleDescription.join(" ");
            formattedResultItem.titleDescriptionLabel = titleDescriptionLabel.join(" ");
          }
          formattedResultItem.itemattributes = aItemAttributes;
          if (resultItem.defaultNavigationTarget) {
            formattedResultItem.titleNavigation = new SearchNavigationObjectForSinaNavTarget(resultItem.defaultNavigationTarget, this.model);
            if (!formattedResultItem.title || formattedResultItem.title.length === 0) {
              formattedResultItem.title = resultItem.defaultNavigationTarget.label;
            }
          }
          if (resultItem.navigationTargets && resultItem.navigationTargets.length > 0) {
            formattedResultItem.navigationObjects = [];
            for (var j = 0; j < resultItem.navigationTargets.length; j++) {
              var navTarget = resultItem.navigationTargets[j];
              navTarget.parent = resultItem;
              var navigationTarget = new SearchNavigationObjectForSinaNavTarget(navTarget, this.model);
              navigationTarget.setLoggingType(UserEventType.RESULT_LIST_ITEM_NAVIGATE_CONTEXT);
              formattedResultItem.navigationObjects.push(navigationTarget);
            }
          }
          var layoutCacheForItemType = layoutCache[resultItem.dataSource.id] || {};
          layoutCache[resultItem.dataSource.id] = layoutCacheForItemType;
          formattedResultItem.layoutCache = layoutCacheForItemType;
          formattedResultItem.selected = formattedResultItem.selected || false;
          formattedResultItem.expanded = formattedResultItem.expanded || false;
          var additionalParameters = {};
          this._formatResultForDocuments(resultItem, additionalParameters);
          this._formatResultForNotes(resultItem, additionalParameters);
          formattedResultItem.additionalParameters = additionalParameters;
          formattedResultItem.positionInList = i;
          formattedResultItem.resultSetId = searchResultSet.id;
          formattedResultItems.push(formattedResultItem);
        }
        return formattedResultItems;
      }
    }, {
      key: "_formatAttributeGroup",
      value: function _formatAttributeGroup(attributeGroup, options, index) {
        // workaround for attribute icons which have been set via @ObjectModel.text.element
        // TODO: clarify which attribute is the text to be shown and which contains the icon URL
        if (attributeGroup.attributes.length === 2 && typeof attributeGroup.attributes[1].attribute.value === "string" && attributeGroup.attributes[1].attribute.value.startsWith("sap-icon://")) {
          var formattedAttr = this._formatSingleAttribute(attributeGroup.attributes[0].attribute, options, index);
          formattedAttr.iconUrl = attributeGroup.attributes[1].attribute.value;
          formattedAttr.key = attributeGroup.id;
          formattedAttr.isTitle = false; // used in table view
          formattedAttr.isSortable = attributeGroup.metadata.isSortable; // used in table view
          formattedAttr.attributeIndex = index; // used in table view
          formattedAttr.displayOrder = attributeGroup.metadata.usage.Detail && attributeGroup.metadata.usage.Detail.displayOrder;

          // if (isLongtext) {
          //     formattedAttr.longtext = attributeGroupAsAttribute.value;
          // }
          return formattedAttr;
        }
        var attributeGroupAsAttribute = {};
        var attributes = {};
        attributeGroupAsAttribute.name = attributeGroup.label;
        var isWhyFound = false;
        var isLongtext = false;
        var privateGroupMetadata = attributeGroup.metadata._private;
        var parentAttribute, childAttribute;

        // for (var attributeName in attributeGroup.attributes) {
        for (var i = 0; i < attributeGroup.attributes.length; i++) {
          // var _attribute = attributeGroup.attributes[attributeName].attribute;

          var attributeGroupMembership = attributeGroup.attributes[i];
          var _attribute = attributeGroupMembership.attribute;
          var attributeNameInGroup = attributeGroupMembership.metadata.nameInGroup;
          var _formattedAttribute = void 0;
          if (_attribute.metadata.type === _attribute.sina.AttributeType.Group) {
            _formattedAttribute = this._formatAttributeGroup(_attribute, options, index);
          } else {
            _formattedAttribute = this._formatSingleAttribute(_attribute, options, index);
          }
          if (privateGroupMetadata) {
            if (privateGroupMetadata.parentAttribute === _attribute.metadata) {
              parentAttribute = _formattedAttribute;
            } else if (privateGroupMetadata.childAttribute === _attribute.metadata) {
              childAttribute = _formattedAttribute;
            }
          }

          // attributes[attributeGroup.attributes[attributeName].attribute.nameInGroup] = _formattedAttribute;
          if (_formattedAttribute.value !== undefined && _formattedAttribute.value.length > 0) {
            attributes[attributeNameInGroup] = _formattedAttribute;
            isWhyFound = isWhyFound || _formattedAttribute.whyfound;
            isLongtext = isLongtext || _formattedAttribute.longtext !== undefined;
          }
        }
        attributeGroupAsAttribute.value = "";
        attributeGroupAsAttribute.valueRaw = undefined;
        attributeGroupAsAttribute.valueWithoutWhyfound = "";
        attributeGroupAsAttribute.whyfound = false;
        if (Object.keys(attributes).length > 0) {
          var regularFormatting = true;
          if (privateGroupMetadata && parentAttribute && childAttribute && (privateGroupMetadata.isUnitOfMeasure || privateGroupMetadata.isCurrency || privateGroupMetadata.isDescription)) {
            var parentAttributeValue = parentAttribute.value;
            var childAttributeValue = childAttribute.value;
            parentAttributeValue = parentAttributeValue !== undefined && parentAttributeValue.trim().length > 0 ? parentAttributeValue : undefined;
            childAttributeValue = childAttributeValue !== undefined && childAttributeValue.trim().length > 0 ? childAttributeValue : undefined;
            if (!(parentAttributeValue && childAttributeValue)) {
              if (privateGroupMetadata.isUnitOfMeasure || privateGroupMetadata.isCurrency) {
                if (parentAttributeValue && !childAttributeValue) {
                  attributeGroupAsAttribute.value = parentAttribute.value;
                  attributeGroupAsAttribute.valueRaw = parentAttribute.valueRaw;
                  attributeGroupAsAttribute.valueWithoutWhyfound = parentAttribute.valueWithoutWhyfound;
                  regularFormatting = false;
                }
              } else if (privateGroupMetadata.isDescription) {
                var textArrangement = privateGroupMetadata.textArrangement;
                var sina = attributeGroup.sina;
                if (textArrangement === sina.AttributeGroupTextArrangement.TextFirst) {
                  if (!parentAttributeValue && childAttributeValue) {
                    attributeGroupAsAttribute.value = childAttribute.value;
                    attributeGroupAsAttribute.valueRaw = childAttribute.valueRaw;
                    attributeGroupAsAttribute.valueWithoutWhyfound = childAttribute.valueWithoutWhyfound;
                    regularFormatting = false;
                  }
                } else if (textArrangement === sina.AttributeGroupTextArrangement.TextLast) {
                  if (parentAttributeValue && !childAttributeValue) {
                    attributeGroupAsAttribute.value = parentAttribute.value;
                    attributeGroupAsAttribute.valueRaw = parentAttribute.valueRaw;
                    attributeGroupAsAttribute.valueWithoutWhyfound = parentAttribute.valueWithoutWhyfound;
                    regularFormatting = false;
                  }
                } else if (textArrangement === sina.AttributeGroupTextArrangement.TextOnly) {
                  if (!childAttributeValue) {
                    regularFormatting = false;
                  }
                }
              }
            }
          }
          if (regularFormatting) {
            attributeGroupAsAttribute.value = this._formatBasedOnGroupTemplate(attributeGroup.template, attributes, "value");
            attributeGroupAsAttribute.valueRaw = this._formatBasedOnGroupTemplate(attributeGroup.template, attributes, "valueRaw");
            attributeGroupAsAttribute.valueWithoutWhyfound = this._formatBasedOnGroupTemplate(attributeGroup.template, attributes, "valueWithoutWhyfound");
          }
          attributeGroupAsAttribute.whyfound = isWhyFound;
        }
        attributeGroupAsAttribute.key = attributeGroup.id;
        attributeGroupAsAttribute.isTitle = false; // used in table view
        attributeGroupAsAttribute.isSortable = attributeGroup.metadata.isSortable; // used in table view
        attributeGroupAsAttribute.attributeIndex = index; // used in table view
        attributeGroupAsAttribute.displayOrder = attributeGroup.metadata.usage.Detail && attributeGroup.metadata.usage.Detail.displayOrder;
        if (isLongtext) {
          attributeGroupAsAttribute.longtext = attributeGroupAsAttribute.value;
        }
        return attributeGroupAsAttribute;
      }
    }, {
      key: "_formatSingleAttribute",
      value: function _formatSingleAttribute(detailAttribute, options, index) {
        var oItemAttribute = {};
        var sina = detailAttribute.sina;
        oItemAttribute.name = detailAttribute.label;
        oItemAttribute.valueRaw = detailAttribute.value;
        oItemAttribute.value = options.suppressHighlightedValues ? detailAttribute.valueFormatted : detailAttribute.valueHighlighted;
        oItemAttribute.valueWithoutWhyfound = detailAttribute.valueFormatted; //result[propDisplay].valueWithoutWhyfound;

        // if (detailAttribute.isHighlighted && detailAttribute.metadata.type.toLowerCase() === "longtext") {
        //     // mix snippet into longtext values
        //     var valueHighlighted = detailAttribute.valueHighlighted;
        //     valueHighlighted = valueHighlighted.replace(/(^[.][.][.])|([.][.][.]$)/, "").trim();
        //     var valueUnHighlighted = valueHighlighted.replace(/[<]([/])?b[>]/g, "");
        //     oItemAttribute.value = detailAttribute.valueFormatted.replace(valueUnHighlighted, valueHighlighted);
        // }

        oItemAttribute.key = detailAttribute.id;
        oItemAttribute.isTitle = false; // used in table view
        oItemAttribute.isSortable = detailAttribute.metadata.isSortable; // used in table view
        oItemAttribute.attributeIndex = index; // used in table view
        oItemAttribute.displayOrder = detailAttribute.metadata.usage.Detail && detailAttribute.metadata.usage.Detail.displayOrder;
        oItemAttribute.whyfound = detailAttribute.isHighlighted;
        if (detailAttribute.defaultNavigationTarget) {
          oItemAttribute.defaultNavigationTarget = new SearchNavigationObjectForSinaNavTarget(detailAttribute.defaultNavigationTarget, this.model);
        }
        // oItemAttribute.hidden = detailAttribute.metadata.hidden;
        if (detailAttribute.metadata.format && (detailAttribute.metadata.format === sina.AttributeFormatType.MultilineText || detailAttribute.metadata.format === sina.AttributeFormatType.LongText)) {
          oItemAttribute.longtext = detailAttribute.valueHighlighted;
        }
        return oItemAttribute;
      }
    }, {
      key: "_formatBasedOnGroupTemplate",
      value: function _formatBasedOnGroupTemplate(template, attributes, valuePropertyName) {
        if (!(template && attributes && valuePropertyName)) {
          return "";
        }
        var regex = /{\w+}/gi;
        var value = "";
        var pos = 0;
        var match;
        while ((match = regex.exec(template)) !== null) {
          value += template.substring(pos, match.index);
          var attributeName = match[0].slice(1, -1);
          value += attributes[attributeName] && attributes[attributeName][valuePropertyName] || "";
          pos = regex.lastIndex;
        }
        value += template.substring(pos);
        return value;
      }
    }, {
      key: "_formatResultForDocuments",
      value: function _formatResultForDocuments(resultItem, additionalParameters) {
        var keyFields = "";
        additionalParameters.isDocumentConnector = false;
        var detailAttribute;
        for (var j = 0; j < resultItem.detailAttributes.length; j++) {
          detailAttribute = resultItem.detailAttributes[j];
          if (detailAttribute.metadata.id === "FILE_PROPERTY") {
            additionalParameters.isDocumentConnector = true;
          }
          if (detailAttribute.metadata.isKey === true) {
            if (keyFields.length > 0) {
              keyFields += ";";
            }
            keyFields = keyFields + detailAttribute.metadata.id + "=" + detailAttribute.value; //encodeURIComponent(result[prop].valueRaw);
          }
        }

        // fileloader
        if (additionalParameters.isDocumentConnector === true) {
          var sidClient = ";o=sid(" + resultItem.dataSource.system + "." + resultItem.dataSource.client + ")";
          var connectorName = resultItem.dataSource.id;
          additionalParameters.imageUrl = "/sap/opu/odata/SAP/ESH_SEARCH_SRV" + sidClient + "/FileLoaderFiles(ConnectorId='" + connectorName + "',FileType='ThumbNail',SelectionParameters='" + keyFields + "')/$value";
          additionalParameters.titleUrl = "/sap/opu/odata/SAP/ESH_SEARCH_SRV" + sidClient + "/FileLoaderFiles(ConnectorId='" + connectorName + "',FileType='BinaryContent',SelectionParameters='" + keyFields + "')/$value";
          // const suvlink = "/sap/opu/odata/SAP/ESH_SEARCH_SRV/FileLoaderFiles(ConnectorId='" + connectorName + "',FileType='SUVFile',SelectionParameters='PHIO_ID=" + resultItem.PHIO_ID.valueRaw + "')/$value?sap-client=" + client;
          // const suvlink = '/sap-pdfjs/web/viewer.html?file=' + encodeURIComponent(suvlink);
          var suvlink = "/sap/opu/odata/SAP/ESH_SEARCH_SRV" + sidClient + "/FileLoaderFiles(ConnectorId='" + connectorName + "',FileType='SUVFile',SelectionParameters='" + keyFields + "')/$value";
          additionalParameters.suvlink = "/sap/bc/ui5_ui5/ui2/ushell/resources/sap/fileviewer/viewer/web/viewer.html?file=" + encodeURIComponent(suvlink);
          if (!resultItem.navigationObjects) {
            resultItem.navigationObjects = [];
          }
          var navOptions = {
            text: "Show Document",
            href: additionalParameters.suvlink,
            target: "_blank"
          };
          var navigationTarget = new SearchNavigationObject(navOptions, this.model);
          resultItem.navigationObjects.push(navigationTarget);
          for (var _j = 0; _j < resultItem.detailAttributes.length; _j++) {
            detailAttribute = resultItem.detailAttributes[_j];
            if (detailAttribute.id === "PHIO_ID_THUMBNAIL" && detailAttribute.value) {
              additionalParameters.containsThumbnail = true;
            }
            if (detailAttribute.id === "PHIO_ID_SUV" && detailAttribute.value) {
              additionalParameters.containsSuvFile = true;
            }
          }
        }
      }
    }, {
      key: "_formatResultForNotes",
      value: function _formatResultForNotes(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      resultItem,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      additionalParameters) {
        //
      }
    }]);
    return SearchResultFormatter;
  }(SearchResultBaseFormatter);
  return SearchResultFormatter;
});
})();