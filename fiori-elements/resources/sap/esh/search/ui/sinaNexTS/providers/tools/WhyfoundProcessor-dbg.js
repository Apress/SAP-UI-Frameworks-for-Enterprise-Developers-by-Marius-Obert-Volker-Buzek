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
sap.ui.define(["../../sina/SearchResultSetItemAttributeGroup"], function (____sina_SearchResultSetItemAttributeGroup) {
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
  var SearchResultSetItemAttributeGroup = ____sina_SearchResultSetItemAttributeGroup["SearchResultSetItemAttributeGroup"];
  var WhyfoundProcessor = /*#__PURE__*/function () {
    function WhyfoundProcessor(sina) {
      _classCallCheck(this, WhyfoundProcessor);
      this.sina = sina;
    }
    _createClass(WhyfoundProcessor, [{
      key: "processRegularWhyFoundAttributes",
      value: function processRegularWhyFoundAttributes(attributeName, structuredAttribute, whyFounds, metadata) {
        var attrWhyFound;

        // Process whyfound attributes which belongs to title, title description and detail
        for (var attributeNameWhyfound in whyFounds) {
          if (attributeNameWhyfound === attributeName && whyFounds[attributeNameWhyfound][0]) {
            // replace attribue value with whyfound value
            attrWhyFound = whyFounds[attributeNameWhyfound][0];
            if (metadata.usage.Title || metadata.usage.TitleDescription || metadata.usage.Detail) {
              delete whyFounds[attributeNameWhyfound];
            }
          }
        }
        attrWhyFound = this.calculateValueHighlighted(structuredAttribute, metadata, attrWhyFound);
        return attrWhyFound;
      }

      // Precondition: attribute group has been prepared in itemPostParser
      // If a remaining whyfound attribute (after the regular processing above) is no displayAttribute in a attribute group
      // it's either not modeled for display or just a request attribute.
      // Add it to detail attributes and will be displayed in case of no hit in other displayed attributes.
    }, {
      key: "processAdditionalWhyfoundAttributes",
      value: function processAdditionalWhyfoundAttributes(whyFounds, searchResultSetItem) {
        try {
          const _this2 = this;
          var _this = _this2;
          // Check whether there is still whyfoundattr remaining
          // If yes, it means hits in request attributes
          // Convert it to attribute and concat it to detailAttributes
          // No display order normally, candidates for the additional line for whyfounds
          for (var restWhyfoundAttribute in whyFounds) {
            if (whyFounds[restWhyfoundAttribute][0]) {
              (function () {
                var metadata = searchResultSetItem.dataSource.getAttributeMetadata(restWhyfoundAttribute);
                var attributeId = metadata.id || restWhyfoundAttribute;
                var valueTemp = whyFounds[restWhyfoundAttribute][0];
                var valueFormattedTemp = "";
                if (searchResultSetItem.attributesMap[restWhyfoundAttribute]) {
                  valueFormattedTemp = searchResultSetItem.attributesMap[restWhyfoundAttribute].valueFormatted;
                  valueFormattedTemp = typeof valueFormattedTemp === "string" ? valueFormattedTemp : JSON.stringify(valueFormattedTemp);
                }
                var valueHighlightedTemp = typeof valueTemp === "string" ? valueTemp : JSON.stringify(valueTemp);
                var wAttribute = _this.sina._createSearchResultSetItemAttribute({
                  id: attributeId,
                  label: metadata.label || restWhyfoundAttribute,
                  value: "",
                  valueFormatted: valueFormattedTemp,
                  valueHighlighted: valueHighlightedTemp,
                  isHighlighted: true,
                  metadata: metadata
                });
                var originalAttribute = searchResultSetItem.attributes.find(function (attr) {
                  return attr.id === attributeId;
                });

                // If the attribute is already part of display attribute of a group
                // it unnecessary to add it to detail attributes
                if (searchResultSetItem.detailAttributes.find(function (attr) {
                  return attr instanceof SearchResultSetItemAttributeGroup && attr.isAttributeDisplayed(attributeId);
                }) === undefined) {
                  searchResultSetItem.detailAttributes.push(wAttribute);
                  if (originalAttribute === undefined) {
                    searchResultSetItem.attributes.push(wAttribute);
                  }
                } else if (originalAttribute === undefined) {
                  // If wAttribute is not in the original attributes, e.g. a request attribute, just add it
                  searchResultSetItem.attributes.push(wAttribute);
                  searchResultSetItem.detailAttributes.push(wAttribute);
                } else {
                  // If wAttribute is already in the list of original attributes
                  // copy the value from original attribute and replace the original attribute with wAttribute
                  wAttribute.value = originalAttribute.value;
                  originalAttribute = wAttribute;
                }
                delete whyFounds[restWhyfoundAttribute];
              })();
            }
          }
          return _await(searchResultSetItem);
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "_getFirstItemIfArray",
      value: function _getFirstItemIfArray(value) {
        if (Array.isArray(value)) {
          value = value[0];
        }
        return value;
      }

      // valueHiglighted  =
      // multiline: true => input.highlighted | input.snippet | why found
      // multiline: false => input.snippet | input.highlighted | why found
    }, {
      key: "calculateValueHighlighted",
      value: function calculateValueHighlighted(structuredAttribute, metadata, attrWhyFound) {
        var identifierHighlight = "com.sap.vocabularies.Search.v1.Highlighted";
        var identifierSnippet = "com.sap.vocabularies.Search.v1.Snippets";
        var value = "";
        if (metadata.format === "MultilineText") {
          value = structuredAttribute[identifierHighlight];
          if (value) {
            return this._getFirstItemIfArray(value);
          }
          value = structuredAttribute[identifierSnippet];
          if (value) {
            return this._getFirstItemIfArray(value);
          }
          return attrWhyFound;
        }
        value = structuredAttribute[identifierSnippet];
        if (value) {
          return this._getFirstItemIfArray(value);
        }
        value = structuredAttribute[identifierHighlight];
        if (value) {
          return this._getFirstItemIfArray(value);
        }
        return this._getFirstItemIfArray(attrWhyFound);
      }
    }, {
      key: "calIsHighlighted",
      value: function calIsHighlighted(attrWhyFound) {
        if (typeof attrWhyFound === "string" && attrWhyFound.length > 0 && attrWhyFound.indexOf("<b>") > -1 && attrWhyFound.indexOf("</b>") > -1) {
          return true;
        }

        // Must not come from Snippets and Highlighted
        if (Array.isArray(attrWhyFound) && attrWhyFound.length > 0) {
          return true;
        }
        return false;
      }
    }]);
    return WhyfoundProcessor;
  }();
  var __exports = {
    __esModule: true
  };
  __exports.WhyfoundProcessor = WhyfoundProcessor;
  return __exports;
});
})();