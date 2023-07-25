/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/esh/search/ui/SearchHelper", "sap/base/security/encodeXML"], function (sap_esh_search_ui_SearchHelper, encodeXml) {
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
  var Tester = sap_esh_search_ui_SearchHelper["Tester"];
  var SearchHelper = sap_esh_search_ui_SearchHelper;
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var Highlighter = /*#__PURE__*/function () {
    function Highlighter() {
      _classCallCheck(this, Highlighter);
      this._softHyphenRegExp = new RegExp("[\xAD]", "g");
    }
    _createClass(Highlighter, [{
      key: "setHighlightTerms",
      value: function setHighlightTerms(highlightTerms) {
        this.tester = new Tester(highlightTerms, "sapUshellSearchHighlight", true, "or");
      }
    }, {
      key: "highlight",
      value: function highlight(tileView) {
        var node = tileView.getDomRef();
        if (!node) {
          return;
        }

        // bcp ticket 1970162338 + bcp 0000369369
        var oHyphenation = sap.ui.core.hyphenation.Hyphenation.getInstance();
        if (!oHyphenation.isLanguageInitialized()) {
          oHyphenation.initialize().then(function () {
            this.doHighlight(node);
          }.bind(this), function () {
            this.doHighlight(node);
          }.bind(this));
        } else {
          this.doHighlight(node);
        }
      }
    }, {
      key: "doHighlight",
      value: function doHighlight(node) {
        if (node.nodeType === window.Node.TEXT_NODE) {
          this.highlightTextNode(node);
          return;
        }
        for (var i = 0; i < node.childNodes.length; ++i) {
          var child = node.childNodes[i];
          this.doHighlight(child);
        }
      }
    }, {
      key: "removeSoftHyphens",
      value: function removeSoftHyphens(text) {
        return text.replace(this._softHyphenRegExp, "");
      }
    }, {
      key: "highlightTextNode",
      value: function highlightTextNode(node) {
        // check for match
        var testResult = this.tester.test(this.removeSoftHyphens(node.textContent));
        if (!testResult.bMatch) {
          return;
        }
        // match -> replace dom node
        var spanNode = document.createElement("span");
        spanNode.innerHTML = encodeXml(testResult.sHighlightedText); // ToDo: jQuery["sap"]
        SearchHelper.boldTagUnescaper(spanNode, "sapUshellSearchHighlight");
        node.parentNode.insertBefore(spanNode, node);
        node.parentNode.removeChild(node);
      }
    }]);
    return Highlighter;
  }();
  var __exports = {
    __esModule: true
  };
  __exports.Highlighter = Highlighter;
  return __exports;
});
})();