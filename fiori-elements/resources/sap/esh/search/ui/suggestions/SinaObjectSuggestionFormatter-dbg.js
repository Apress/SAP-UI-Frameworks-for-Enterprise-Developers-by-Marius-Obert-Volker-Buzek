/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/esh/search/ui/SearchNavigationObjectForSinaNavTarget", "../sinaNexTS/sina/SearchResultSetItemAttribute"], function (SearchNavigationObjectForSinaNavTarget, ___sinaNexTS_sina_SearchResultSetItemAttribute) {
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
  var SearchResultSetItemAttribute = ___sinaNexTS_sina_SearchResultSetItemAttribute["SearchResultSetItemAttribute"];
  var Formatter = /*#__PURE__*/function () {
    function Formatter() {
      _classCallCheck(this, Formatter);
    }
    _createClass(Formatter, [{
      key: "assembleLabel1",
      value: function assembleLabel1(sinaSuggestion) {
        var title = [];
        var isHighlighted = false;
        var attribute;
        var titleAttributes = sinaSuggestion.object.titleAttributes;
        for (var i = 0; i < titleAttributes.length; ++i) {
          attribute = titleAttributes[i];
          title.push(attribute.valueHighlighted);
          if (attribute.isHighlighted) {
            isHighlighted = true;
          }
        }
        return {
          label: title.join(" "),
          isHighlighted: isHighlighted
        };
      }
    }, {
      key: "assembleLabel2",
      value: function assembleLabel2(label1IsHighlighted, sinaSuggestion) {
        var detailAttributes = sinaSuggestion.object.detailAttributes;
        var attribute;
        if (detailAttributes.length === 0) {
          return "";
        }
        if (!label1IsHighlighted) {
          attribute = this.getFirstHighlightedAttribute(detailAttributes);
          if (attribute) {
            return attribute.valueHighlighted;
          }
        }
        attribute = this.getFirstStringAttribute(detailAttributes);
        if (attribute) {
          return attribute.label + ": " + attribute.valueHighlighted;
        }
        return "";
      }
    }, {
      key: "getFirstHighlightedAttribute",
      value: function getFirstHighlightedAttribute(attributes) {
        for (var i = 0; i < attributes.length; ++i) {
          var attribute = attributes[i];
          if (attribute.isHighlighted) {
            return attribute;
          }
        }
      }
    }, {
      key: "getFirstStringAttribute",
      value: function getFirstStringAttribute(attributes) {
        var sortOrder = {
          Date: 40,
          Double: 70,
          GeoJson: 130,
          ImageBlob: 120,
          ImageUrl: 110,
          Integer: 60,
          String: 10,
          Time: 50,
          Timestamp: 30
        };
        if (attributes.length === 0) {
          return null;
        }
        attributes = attributes.slice();
        attributes.sort(function (a1, a2) {
          return sortOrder[a1.metadata.type] - sortOrder[a2.metadata.type];
        });
        var attribute = attributes[0];
        if (sortOrder[attribute.metadata.type] > 100) {
          return null;
        }
        return attribute;
      }
    }, {
      key: "assembleNavigation",
      value: function assembleNavigation(sinaSuggestion, searchModel) {
        if (!sinaSuggestion.object.defaultNavigationTarget) {
          return null;
        }
        var navigationTarget = new SearchNavigationObjectForSinaNavTarget(sinaSuggestion.object.defaultNavigationTarget, searchModel);
        navigationTarget.setLoggingType("OBJECT_SUGGESTION_NAVIGATE");
        return navigationTarget;
      }
    }, {
      key: "assembleImageUrl",
      value: function assembleImageUrl(sinaSuggestion) {
        var aAttributes = sinaSuggestion.object.detailAttributes.concat(sinaSuggestion.object.titleAttributes);
        for (var i = 0; i < aAttributes.length; ++i) {
          var attribute = aAttributes[i];
          if (attribute instanceof SearchResultSetItemAttribute && attribute.metadata.type === attribute.sina.AttributeType.ImageUrl) {
            return {
              imageUrl: attribute.value,
              imageExists: true,
              imageIsCircular: attribute.metadata.format && attribute.metadata.format === sinaSuggestion.sina.AttributeFormatType.Round
            };
          }
        }
        return {
          exists: false
        };
      }
    }, {
      key: "format",
      value: function format(suggestionProvider, sinaSuggestion) {
        // create suggestion
        var suggestion = sinaSuggestion;

        // assemble label
        var label1 = this.assembleLabel1(sinaSuggestion);
        suggestion.label1 = label1.label;

        // assemble second label (second line in UI)
        suggestion.label2 = this.assembleLabel2(label1.isHighlighted, sinaSuggestion);

        // assemble navigation target
        suggestion.titleNavigation = this.assembleNavigation(sinaSuggestion, suggestionProvider.model);

        // assemble image url
        var imageUrl = this.assembleImageUrl(sinaSuggestion);
        sinaSuggestion.sina.core.extend(suggestion, imageUrl);

        // position
        suggestion.position = sinaSuggestion.position;

        // add
        suggestionProvider.addSuggestion(suggestion);
      }
    }]);
    return Formatter;
  }();
  return Formatter;
});
})();