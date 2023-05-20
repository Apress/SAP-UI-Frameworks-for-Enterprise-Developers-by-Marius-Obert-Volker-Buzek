/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../../sina/SinaObject", "../../../sina/AttributeGroupTextArrangement", "../../../sina/AttributeType", "../../../sina/AttributeFormatType", "../../../sina/AttributeSemanticsType", "../../../core/Log"], function (_____sina_SinaObject, _____sina_AttributeGroupTextArrangement, _____sina_AttributeType, _____sina_AttributeFormatType, _____sina_AttributeSemanticsType, _____core_Log) {
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
  /* eslint-disable @typescript-eslint/ban-types */
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var SinaObject = _____sina_SinaObject["SinaObject"];
  var AttributeGroupTextArrangement = _____sina_AttributeGroupTextArrangement["AttributeGroupTextArrangement"];
  var AttributeType = _____sina_AttributeType["AttributeType"];
  var AttributeFormatType = _____sina_AttributeFormatType["AttributeFormatType"];
  var AttributeSemanticsType = _____sina_AttributeSemanticsType["AttributeSemanticsType"];
  var Log = _____core_Log["Log"];
  var CDSAnnotationsParser = /*#__PURE__*/function (_SinaObject) {
    _inherits(CDSAnnotationsParser, _SinaObject);
    var _super = _createSuper(CDSAnnotationsParser);
    function CDSAnnotationsParser(properties) {
      var _this;
      _classCallCheck(this, CDSAnnotationsParser);
      _this = _super.call(this, properties);
      _defineProperty(_assertThisInitialized(_this), "log", new Log("hana odata cds annotations parser"));
      _this._datasource = properties.dataSource;
      _this._cdsAnnotations = properties.cdsAnnotations;
      _this._parsedAttributes = {};
      _this._knownAttributeGroups = {};
      _this._knownAttributeGroupsArray = [];
      _this._attributeGroupReplacements = {};
      _this._AttributeUsagePrio = {
        HIGH: "HIGH",
        MEDIUM: "MEDIUM",
        NONE: "NONE"
      };

      /*
              Example Usage Stub:
              var usage = {
                  attribute: <some attribute or attribute group object>,
                  displayOrder: <integer vaue>,
                  prio: <Enumeration this._AttributeUsagePrio>,
                  obsolete: <boolean>
              }
           */
      _this._detailUsageStubsMap = {};
      _this._detailUsageStubsPrioHigh = [];
      _this._detailUsageStubsPrioMedium = [];
      _this._detailUsageStubsPrioNone = [];
      _this._defaultTextArrangement = AttributeGroupTextArrangement.TextLast;
      return _this;
    }

    /////////////////////////////////
    // Main Parse Function
    ///
    _createClass(CDSAnnotationsParser, [{
      key: "parseCDSAnnotationsForDataSource",
      value: function parseCDSAnnotationsForDataSource() {
        this._parsingResult = {
          dataSourceIsCdsBased: false,
          detailAttributesAreSorted: false,
          titleAttributesAreSorted: false
        };

        // CDS Annotations Object looks like:
        // cdsAnnotations = {
        //     dataSourceAnnotations: {}, // JSON object representing the structure of CDS annotations
        //     attributeAnnotations: {} // Key-Value-Map (keys: attribute names) of JSON objects representing the structure of CDS annotations per attribute
        // };

        this._parseDefaultTextArrangement();
        this._parseAttributeAnnotations();
        this._parseDataSourceAnnotations();
        return this._parsingResult;
      }

      //////////////////////////////////////////////////////////
      // Setters and Getters for internal Variables
      //////////////////////////////////////////////////////////
    }, {
      key: "_addDetailUsageStub",
      value: function _addDetailUsageStub(attribute, displayOrder, prio) {
        var attributeId;
        if (typeof attribute === "string") {
          attributeId = attribute;
          attribute = undefined;
        } else {
          attributeId = attribute.id;
        }
        var usageStub = {
          attribute: attribute,
          displayOrder: displayOrder,
          prio: prio,
          obsolete: false
        };
        this._detailUsageStubsMap[attributeId] = usageStub;
        if (prio === this._AttributeUsagePrio.HIGH) {
          this._detailUsageStubsPrioHigh.push(usageStub);
        } else if (prio === this._AttributeUsagePrio.MEDIUM) {
          this._detailUsageStubsPrioMedium.push(usageStub);
        } else {
          this._detailUsageStubsPrioNone.push(usageStub);
        }
      }
    }, {
      key: "_getDetailUsageStub",
      value: function _getDetailUsageStub(attribute) {
        if (!attribute) {
          return undefined;
        }
        var attributeId;
        if (typeof attribute === "string") {
          attributeId = attribute;
        } else {
          attributeId = attribute.id;
        }
        return this._detailUsageStubsMap[attributeId];
      }
    }, {
      key: "_setParsedAttribute",
      value: function _setParsedAttribute(attributeName, attribute) {
        this._parsedAttributes[attributeName.toUpperCase()] = attribute;
      }
    }, {
      key: "_getParsedAttribute",
      value: function _getParsedAttribute(attributeName) {
        return this._parsedAttributes[attributeName.toUpperCase()];
      }
    }, {
      key: "_setknownAttributeGroup",
      value: function _setknownAttributeGroup(qualifier, attributeGroup) {
        this._knownAttributeGroups[qualifier.toUpperCase()] = attributeGroup;
      }
    }, {
      key: "_getknownAttributeGroup",
      value: function _getknownAttributeGroup(qualifier) {
        return this._knownAttributeGroups[qualifier.toUpperCase()];
      }

      ////////////////////////////////////////////////////
      // Set default Text Arrangement for Descriptions
      ///
    }, {
      key: "_parseDefaultTextArrangement",
      value: function _parseDefaultTextArrangement() {
        try {
          var defaultTextArrangement = this._deriveTextArrangementFromCdsAnnotation(this._cdsAnnotations.dataSourceAnnotations.UI && this._cdsAnnotations.dataSourceAnnotations.UI.TEXTARRANGEMENT);
          this._defaultTextArrangement = defaultTextArrangement || this._defaultTextArrangement;
        } catch (e) {
          // TODO: write error message to browser console (needs sinaNext logger)
          // console.log("Could not parse default text arrangement for datasource: " + e);
        }
      }

      //////////////////////////////////////////////////////////////////////
      // Parse Data Source Annotations
      //////////////////////////////////////////////////////////////////////
    }, {
      key: "_parseDataSourceAnnotations",
      value: function _parseDataSourceAnnotations() {
        if (Object.keys(this._cdsAnnotations.dataSourceAnnotations).length > 0) {
          try {
            var ui = this._cdsAnnotations.dataSourceAnnotations.UI;
            var headerInfo = ui && ui.HEADERINFO;
            var title = headerInfo && headerInfo.TITLE;
            var type, groupQualifier, attributeGroup;
            if (title) {
              type = title.TYPE && title.TYPE.toUpperCase();
              if (type === "AS_CONNECTED_FIELDS") {
                groupQualifier = title.VALUEQUALIFIER;
                if (groupQualifier && groupQualifier.trim().length > 0) {
                  attributeGroup = this._getknownAttributeGroup(groupQualifier);
                  if (attributeGroup) {
                    //&& attributeGroup === titleAttribute.group) {
                    attributeGroup.usage.Title = {
                      displayOrder: 1
                    };
                  }
                }
              } else if (!type) {
                var titleAttributeName = title.VALUE;
                if (titleAttributeName) {
                  var titleAttribute = this._getParsedAttribute(titleAttributeName);
                  if (titleAttribute) {
                    titleAttribute.usage.Title = {
                      displayOrder: 1
                    };
                  }
                }
              }
              var urlAttributeName = title.URL;
              if (urlAttributeName) {
                var urlAttribute = this._getParsedAttribute(urlAttributeName);
                if (urlAttribute) {
                  urlAttribute.usage.Navigation = {
                    mainNavigation: true
                  };
                }
              }
            }
            var description = headerInfo && headerInfo.DESCRIPTION;
            if (description) {
              type = description.TYPE;
              if (type === "AS_CONNECTED_FIELDS") {
                groupQualifier = description.VALUEQUALIFIER;
                if (groupQualifier && groupQualifier.trim().length > 0) {
                  attributeGroup = this._getknownAttributeGroup(groupQualifier);
                  if (attributeGroup) {
                    //&& attributeGroup === titleAttribute.group) {
                    attributeGroup.usage.TitleDescription = {
                      displayOrder: 1
                    };
                  }
                }
              } else if (!type) {
                var titleDescriptionAttributeName = description.VALUE;
                if (titleDescriptionAttributeName) {
                  var titleDescriptionAttribute = this._getParsedAttribute(titleDescriptionAttributeName);
                  if (titleDescriptionAttribute) {
                    titleDescriptionAttribute.usage.TitleDescription = {};
                  }
                }
              }
            }
            var titleIconAttributeName = headerInfo && headerInfo.IMAGEURL;
            if (titleIconAttributeName) {
              var titleIconAttribute = this._getParsedAttribute(titleIconAttributeName);
              if (titleIconAttribute) {
                titleIconAttribute.usage.Title = {};
                titleIconAttribute.type = this.sina.AttributeType.ImageUrl;
              }
            }
          } catch (e) {
            this.log.warn("Could not parse attribute for datasource: " + e);
          }
        }
      }

      //////////////////////////////////////////////////////////////////////
      // Parse Attribute Annotations
      //////////////////////////////////////////////////////////////////////
    }, {
      key: "_parseAttributeAnnotations",
      value: function _parseAttributeAnnotations() {
        for (var attributeId in this._datasource.attributeMetadataMap) {
          this._parseSingleAttribute(attributeId);
        }
        this._datasource.attributesMetadata = this._datasource.attributesMetadata.concat(this._knownAttributeGroupsArray);
        this._datasource.attributeMetadataMap = Object.assign(this._datasource.attributeMetadataMap, this._knownAttributeGroups);
        this._sortAttributes();
      }
    }, {
      key: "_parseSingleAttribute",
      value: function _parseSingleAttribute(attributeId) {
        var parsedAttribute = this._getParsedAttribute(attributeId);
        if (!parsedAttribute) {
          parsedAttribute = this._getPropertyFromObject(this._datasource.attributeMetadataMap, attributeId);
          if (parsedAttribute && parsedAttribute.id) {
            this._setParsedAttribute(parsedAttribute.id, parsedAttribute);
            var attributeAnnotations = this._cdsAnnotations.attributeAnnotations[parsedAttribute.id] || {};
            if (Object.keys(attributeAnnotations).length > 0) {
              this._parsingResult.dataSourceIsCdsBased = true;
              try {
                // catch and write any parsing error to browser console

                if (attributeAnnotations.UI !== undefined) {
                  /// Identification (Positions, URLs)
                  this._parseSingleAnnotationOrArray(parsedAttribute, attributeAnnotations.UI.IDENTIFICATION, this._parseIdentification);

                  /// Groups
                  this._parseSingleAnnotationOrArray(parsedAttribute, attributeAnnotations.UI.CONNECTEDFIELDS, this._parseConnectedFields);
                  this._parseURLsForDocumentResultItemThumbnail(parsedAttribute, attributeAnnotations.UI.IDENTIFICATION, attributeAnnotations.SEMANTICS);
                  if (attributeAnnotations.UI.MULTILINETEXT !== undefined) {
                    parsedAttribute.format = AttributeFormatType.MultilineText;
                  }
                }
                this._parseSemantics(parsedAttribute, attributeAnnotations.SEMANTICS);
                this._parseDescriptionAttribute(parsedAttribute, attributeAnnotations.OBJECTMODEL, attributeAnnotations.UI);
              } catch (e) {
                // TODO: write error message to browser console (needs sinaNext logger)
                // console.log("Could not parse attribute for datasource: " + e);
              }
            }
          }
        }
        return parsedAttribute;
      }
    }, {
      key: "_parseConnectedFields",
      value: function _parseConnectedFields(attribute, connectedFields) {
        var qualifier = connectedFields.QUALIFIER;
        if (qualifier) {
          var attributesMap = {};
          if (connectedFields.NAME) {
            attributesMap[connectedFields.NAME] = attribute;
          }
          this._createAttributeGroup(qualifier, connectedFields.GROUPLABEL, connectedFields.TEMPLATE, attributesMap);
        }
      }
    }, {
      key: "_createAttributeGroup",
      value: function _createAttributeGroup(qualifier, label, template, attributesMap, displayAttributes) {
        var attributeGroup = this._getknownAttributeGroup(qualifier);
        if (!attributeGroup) {
          attributeGroup = this.sina._createAttributeGroupMetadata({
            id: qualifier,
            // equals original qualifier (not converted to lower case)
            label: label || "",
            type: AttributeType.Group,
            template: template || "",
            attributes: [],
            usage: {},
            displayAttributes: displayAttributes || []
          });
          this._setknownAttributeGroup(qualifier, attributeGroup);
          this._knownAttributeGroupsArray.push(attributeGroup);
          this._datasource.attributeGroupsMetadata.push(attributeGroup);
          this._datasource.attributeGroupMetadataMap[qualifier] = attributeGroup;
          var usageStub = this._getDetailUsageStub(qualifier);
          if (usageStub) {
            usageStub.attribute = attributeGroup;
          }
        } else {
          if (label && !attributeGroup.label) {
            attributeGroup.label = label;
          }
          if (template && !attributeGroup.template) {
            attributeGroup.template = template;
          }
          if (displayAttributes && !attributeGroup.displayAttributes) {
            attributeGroup.displayAttributes = displayAttributes;
          }
        }
        if (attributesMap) {
          for (var nameOfAttributeInGroup in attributesMap) {
            var attribute = attributesMap[nameOfAttributeInGroup];
            var attributeGroupMembership = this.sina._createAttributeGroupMembership({
              group: attributeGroup,
              attribute: attribute,
              nameInGroup: nameOfAttributeInGroup
            });
            attributeGroup.attributes.push(attributeGroupMembership);
            attribute.groups.push(attributeGroupMembership);
          }
        }
        return attributeGroup;
      }

      // display position and potential iconUrlAttribute which referred to attribute
    }, {
      key: "_parseIdentification",
      value: function _parseIdentification(attribute, identification) {
        this._parseAttributePositions(attribute, identification);
        this._parseIconUrlAttributeName(attribute, identification);
      }
    }, {
      key: "_parseIconUrlAttributeName",
      value: function _parseIconUrlAttributeName(attribute, identification) {
        if (identification) {
          if (Array.isArray(identification)) {
            // in case @UI.identification is an array, we look for the first entry which holds a URL sub-entry
            for (var i = 0; i < identification.length; i++) {
              if (identification[i].ICONURL) {
                attribute.iconUrlAttibuteName = identification[i].ICONURL;
                break;
              }
            }
          } else if (identification.ICONURL) {
            attribute.iconUrlAttributeName = identification.ICONURL;
          }
        }
      }
    }, {
      key: "_parseAttributePositions",
      value: function _parseAttributePositions(attribute, identification) {
        // Following also takes care of a fallback:
        // in case that there is an importance, but no position (like it could have happened in the past), set position to a default (Number.MAX_VALUE)

        var importance = identification.IMPORTANCE && identification.IMPORTANCE.toUpperCase();
        var position = identification.POSITION;
        if (importance && !position) {
          position = Number.MAX_VALUE;
        }
        if (position !== undefined) {
          switch (importance) {
            case "HIGH":
            case "MEDIUM":
            case undefined:
              {
                position = this._parsePosition(position);
                var type = identification.TYPE && identification.TYPE.toUpperCase();
                switch (type) {
                  case "AS_CONNECTED_FIELDS":
                    {
                      var qualifier = identification.VALUEQUALIFIER;
                      if (qualifier) {
                        var attributeGroup = this._getknownAttributeGroup(qualifier);
                        if (attributeGroup) {
                          // We already know the group
                          attribute = attributeGroup;
                        } else {
                          // We don't know the group yet, so we remember the usage for later
                          attribute = qualifier;
                        }
                      }
                    }
                  // fall-through to undefined case..
                  // eslint-disable-next-line no-fallthrough
                  case undefined:
                    {
                      // if type is anything but AS_CONNECTED_FIELDS or undefined, we'll ignore the position
                      var usageStub = this._getDetailUsageStub(attribute);
                      if (usageStub) {
                        if (!usageStub.attribute && typeof attribute !== "string") {
                          usageStub.attribute = attribute;
                        }
                      } else {
                        var prio;
                        if (importance === "HIGH") {
                          prio = this._AttributeUsagePrio.HIGH;
                        } else if (importance === "MEDIUM") {
                          prio = this._AttributeUsagePrio.MEDIUM;
                        } else {
                          prio = this._AttributeUsagePrio.NONE;
                        }
                        this._addDetailUsageStub(attribute, position, prio);
                      }
                    }
                }
              }
          }
        }
      }

      // @UI.identification.url: 'SUV_URL'
      // @Semantics.imageUrl
      // ESH_FL_TASK.THUMBNAIL_URL AS THUMB_URL,
      //
      // @Semantics.url.mimeType: ‘SUV_MIME‘
      // @UI.hidden
      // ESH_FL_TASK.SUV_URL AS SUV_URL,
      //
      // @UI.hidden
      // ESH_FL_TAS.SUV_MIME AS SUV_MIME,
      //
    }, {
      key: "_parseURLsForDocumentResultItemThumbnail",
      value: function _parseURLsForDocumentResultItemThumbnail(attribute, identification, semantics) {
        if (!(semantics && semantics.IMAGEURL)) {
          return;
        }
        var urlAttributeName;
        if (identification) {
          if (Array.isArray(identification)) {
            // in case @UI.identification is an array, we look for the first entry which holds a URL sub-entry
            for (var i = 0; i < identification.length; i++) {
              if (identification[i].URL) {
                urlAttributeName = identification[i].URL;
                break;
              }
            }
          } else {
            urlAttributeName = identification.URL;
          }
        }
        if (urlAttributeName && semantics && semantics.IMAGEURL) {
          var urlAttributeAnnotations = this._getPropertyFromObject(this._cdsAnnotations.attributeAnnotations, urlAttributeName);
          if (urlAttributeAnnotations) {
            var mimeTypeAttributeName = urlAttributeAnnotations.SEMANTICS && urlAttributeAnnotations.SEMANTICS.URL && urlAttributeAnnotations.SEMANTICS.URL.MIMETYPE;
            if (mimeTypeAttributeName) {
              var urlAttribute = this._getPropertyFromObject(this._datasource.attributeMetadataMap, urlAttributeName);
              var mimeTypeAttribute = this._getPropertyFromObject(this._datasource.attributeMetadataMap, mimeTypeAttributeName);
              attribute.suvUrlAttribute = urlAttribute;
              attribute.suvMimeTypeAttribute = mimeTypeAttribute;
              attribute.format = AttributeFormatType.DocumentThumbnail;
            }
          }
        }
      }
    }, {
      key: "_parseSemantics",
      value: function _parseSemantics(attribute, semantics) {
        if (semantics) {
          if (semantics.CONTACT && semantics.CONTACT.PHOTO !== undefined) {
            attribute.format = AttributeFormatType.Round;
            if (attribute.type !== AttributeType.ImageBlob) {
              attribute.type = AttributeType.ImageUrl;
            }
          }
          if (semantics.IMAGEURL !== undefined) {
            if (attribute.type !== AttributeType.ImageBlob) {
              attribute.type = AttributeType.ImageUrl;
            }
          }
          if (semantics.NAME !== undefined) {
            if (semantics.NAME.GIVENNAME !== undefined) {
              attribute.semantics = AttributeSemanticsType.FirstName;
            }
            if (semantics.NAME.FAMILYNAME !== undefined) {
              attribute.semantics = AttributeSemanticsType.LastName;
            }
          }
          if (semantics.EMAIL && semantics.EMAIL.ADDRESS !== undefined) {
            attribute.semantics = AttributeSemanticsType.EmailAddress;
          }
          if (semantics.TELEPHONE && semantics.TELEPHONE.TYPE !== undefined) {
            attribute.semantics = AttributeSemanticsType.PhoneNr;
          }
          if (semantics && semantics.URL !== undefined) {
            attribute.semantics = AttributeSemanticsType.HTTPURL;
          }
          if (semantics && semantics.CURRENCYCODE !== undefined) {
            attribute._private.isCurrency = true;
          }
          if (semantics && semantics.UNITOFMEASURE !== undefined) {
            attribute._private.isUnitOfMeasure = true;
          }
          var unitOfMeasureAttribute, currencyCodeAttribute, template;
          var displayAttributes;
          var unitOfMeasure = semantics.QUANTITY && semantics.QUANTITY.UNITOFMEASURE;
          if (unitOfMeasure) {
            displayAttributes = [];
            attribute._private.isQuantity = true;
            unitOfMeasureAttribute = this._parseSingleAttribute(unitOfMeasure);
            if (unitOfMeasureAttribute) {
              if (unitOfMeasureAttribute._private.isUnitOfMeasure) {
                template = "{" + attribute.id + "} {" + unitOfMeasureAttribute.id + "}";
                displayAttributes.push(attribute.id);
                displayAttributes.push(unitOfMeasureAttribute.id);
                this._createAttributeGroupForParentChildAttributes(attribute, unitOfMeasureAttribute, "____UnitOfMeasureGroup", template, displayAttributes);
              }
            }
          }
          var currencyCode = semantics.AMOUNT && semantics.AMOUNT.CURRENCYCODE;
          if (currencyCode) {
            displayAttributes = [];
            currencyCodeAttribute = this._parseSingleAttribute(currencyCode);
            if (currencyCodeAttribute) {
              if (currencyCodeAttribute._private.isCurrency) {
                template = "{" + attribute.id + "} {" + currencyCodeAttribute.id + "}";
                displayAttributes.push(attribute.id);
                displayAttributes.push(currencyCodeAttribute.id);
                this._createAttributeGroupForParentChildAttributes(attribute, currencyCodeAttribute, "____CurrencyGroup", template, displayAttributes);
              }
            }
          }
        }
      }
    }, {
      key: "_parseDescriptionAttribute",
      value: function _parseDescriptionAttribute(attribute, objectModel, ui) {
        var descriptionAttributeName = objectModel && objectModel.TEXT && objectModel.TEXT.ELEMENT;
        if (descriptionAttributeName) {
          if (Array.isArray(descriptionAttributeName)) {
            if (descriptionAttributeName.length > 0) {
              descriptionAttributeName = descriptionAttributeName[0];
            } else {
              return;
            }
          }
          var descriptionAttribute = this._parseSingleAttribute(descriptionAttributeName);
          if (descriptionAttribute) {
            var textArrangement = this._deriveTextArrangementFromCdsAnnotation(ui && ui.TEXTARRANGEMENT) || this._defaultTextArrangement;
            var useParentheses = !(attribute.semantics == AttributeSemanticsType.FirstName && descriptionAttribute.semantics == AttributeSemanticsType.LastName || descriptionAttribute.semantics == AttributeSemanticsType.FirstName && attribute.semantics == AttributeSemanticsType.LastName);
            var parenthesesOpen = useParentheses ? "(" : "";
            var parenthesesClose = useParentheses ? ")" : "";
            var template;
            if (textArrangement === AttributeGroupTextArrangement.TextFirst) {
              template = "{" + descriptionAttribute.id + "} " + parenthesesOpen + "{" + attribute.id + "}" + parenthesesClose;
            } else if (textArrangement === AttributeGroupTextArrangement.TextLast) {
              template = "{" + attribute.id + "} " + parenthesesOpen + "{" + descriptionAttribute.id + "}" + parenthesesClose;
            } else if (textArrangement === AttributeGroupTextArrangement.TextOnly) {
              template = "{" + descriptionAttribute.id + "}";
            } else {
              template = "{" + attribute.id + "} " + parenthesesOpen + "{" + descriptionAttribute.id + "}" + parenthesesClose;
            }

            // Prepare the list of attributes to be displayed in UI
            var displayAttributes = [];
            if (textArrangement === AttributeGroupTextArrangement.TextOnly) {
              displayAttributes.push(descriptionAttribute.id);
            } else {
              displayAttributes.push(attribute.id);
              displayAttributes.push(descriptionAttribute.id);
            }
            var attributeGroup = this._createAttributeGroupForParentChildAttributes(attribute, descriptionAttribute, "____Description", template, displayAttributes);
            attributeGroup._private.isDescription = true;
            attributeGroup._private.textArrangement = textArrangement;
            if (attribute._private.isUnitOfMeasure || descriptionAttribute._private.isUnitOfMeasure) {
              attributeGroup._private.isUnitOfMeasure = true;
            }
            if (attribute._private.isCurrency || descriptionAttribute._private.isCurrency) {
              attributeGroup._private.isCurrency = true;
            }
          }
        }
      }
    }, {
      key: "_deriveTextArrangementFromCdsAnnotation",
      value: function _deriveTextArrangementFromCdsAnnotation(cdsTextArrangement) {
        if (cdsTextArrangement) {
          switch (cdsTextArrangement.toUpperCase()) {
            case "TEXT_FIRST":
              return AttributeGroupTextArrangement.TextFirst;
            case "TEXT_LAST":
              return AttributeGroupTextArrangement.TextLast;
            case "TEXT_ONLY":
            case "#TEXT_ONLY":
              return AttributeGroupTextArrangement.TextOnly;
            case "TEXT_SEPARATE":
              return AttributeGroupTextArrangement.TextSeparate;
          }
        }
        return undefined;
      }
    }, {
      key: "_createAttributeGroupForParentChildAttributes",
      value: function _createAttributeGroupForParentChildAttributes(parentAttribute, childAttribute, qualifierSuffix, template, displayAttributes) {
        var qualifier = parentAttribute.id + qualifierSuffix;
        var attributesMap = {};
        attributesMap[parentAttribute.id] = parentAttribute;
        attributesMap[childAttribute.id] = childAttribute;
        var attributeGroup = this._createAttributeGroup(qualifier, parentAttribute.label, template, attributesMap, displayAttributes);
        var obsoleteUsageStub = this._getDetailUsageStub(parentAttribute);
        if (obsoleteUsageStub) {
          obsoleteUsageStub.obsolete = true;
          this._addDetailUsageStub(attributeGroup, obsoleteUsageStub.displayOrder, obsoleteUsageStub.prio);
        }
        this._replaceAttributeWithGroup(parentAttribute, attributeGroup);
        attributeGroup._private.parentAttribute = parentAttribute;
        attributeGroup._private.childAttribute = childAttribute;
        if (childAttribute._private && childAttribute._private.isCurrency) {
          attributeGroup._private.isCurrency = true;
        }
        if (childAttribute._private && childAttribute._private.isUnitOfMeasure) {
          attributeGroup._private.isUnitOfMeasure = true;
        }
        return attributeGroup;
      }
    }, {
      key: "_replaceAttributeWithGroup",
      value: function _replaceAttributeWithGroup(attribute, attributeGroupReplacement) {
        this._setParsedAttribute(attribute.id, attributeGroupReplacement);
        for (var i = 0; i < attribute.groups.length; i++) {
          var groupMembership = attribute.groups[i];
          if (groupMembership.group != attributeGroupReplacement) {
            groupMembership.attribute = attributeGroupReplacement;
          }
        }
      }
    }, {
      key: "_sortAttributes",
      value: function _sortAttributes() {
        var sortFunction = function sortFunction(entry1, entry2) {
          if (entry1.displayOrder < entry2.displayOrder) {
            return -1;
          } else if (entry1.displayOrder > entry2.displayOrder) {
            return 1;
          }
          return 0;
        };
        var i, allEntries;
        if (this._detailUsageStubsPrioHigh.length > 0 || this._detailUsageStubsPrioMedium.length > 0) {
          this._detailUsageStubsPrioHigh.sort(sortFunction);
          this._detailUsageStubsPrioMedium.sort(sortFunction);
          var _allEntries = this._detailUsageStubsPrioHigh.concat(this._detailUsageStubsPrioMedium);
          for (i = 0; i < _allEntries.length; i++) {
            if (!_allEntries[i].obsolete) {
              allEntries = _allEntries;
              break;
            }
          }
        }
        if (!allEntries) {
          allEntries = this._detailUsageStubsPrioNone.sort(sortFunction);
        }
        for (i = 0; i < allEntries.length; i++) {
          var entry = allEntries[i];
          if (!entry.obsolete && entry.attribute && typeof entry.attribute !== "string") {
            entry.attribute.usage = entry.attribute.usage || {};
            entry.attribute.usage.Detail = {
              displayOrder: i
            };
          }
        }
        this._parsingResult.detailAttributesAreSorted = true;
      }
    }, {
      key: "_parseSingleAnnotationOrArray",
      value: function _parseSingleAnnotationOrArray(attribute, annotation, parseFunction) {
        if (annotation !== undefined) {
          if (Array.isArray(annotation)) {
            for (var j = 0; j < annotation.length; j++) {
              parseFunction.apply(this, [attribute, annotation[j]]);
            }
          } else {
            parseFunction.apply(this, [attribute, annotation]);
          }
        }
      }
    }, {
      key: "_parsePosition",
      value: function _parsePosition(position) {
        if (typeof position === "string") {
          try {
            position = parseInt(position, 10);
          } catch (e) {
            position = Number.MAX_VALUE;
          }
        }
        if (typeof position !== "number" || isNaN(position)) {
          position = Number.MAX_VALUE; // or use Number.POSITIVE_INFINITY ?
        }

        return position;
      }

      // get a property from an object, even if the property names differ regarding case-sensitivity
    }, {
      key: "_getPropertyFromObject",
      value: function _getPropertyFromObject(object, propertyName) {
        if (object[propertyName]) {
          return object[propertyName];
        }
        propertyName = propertyName.toLowerCase();
        for (var key in object) {
          if (key.toLowerCase() === propertyName) {
            return object[key];
          }
        }
        return undefined;
      }
    }]);
    return CDSAnnotationsParser;
  }(SinaObject);
  var __exports = {
    __esModule: true
  };
  __exports.CDSAnnotationsParser = CDSAnnotationsParser;
  return __exports;
});
})();