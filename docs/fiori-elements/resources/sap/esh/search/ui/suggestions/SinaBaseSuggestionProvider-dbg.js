/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./SuggestionType"], function (___SuggestionType) {
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
  var UISuggestionType = ___SuggestionType["Type"];
  var SinaBaseSuggestionProvider = /*#__PURE__*/function () {
    function SinaBaseSuggestionProvider(sinaNext) {
      _classCallCheck(this, SinaBaseSuggestionProvider);
      this.sinaNext = sinaNext;
      this.suggestionQuery = this.sinaNext.createSuggestionQuery();
    }

    // prepare suggestions query
    // ===================================================================
    _createClass(SinaBaseSuggestionProvider, [{
      key: "prepareSuggestionQuery",
      value: function prepareSuggestionQuery(filter) {
        this.suggestionQuery.resetResultSet();
        this.suggestionQuery.setFilter(filter);
        var sinaSuggestionTypes = this.assembleSinaSuggestionTypesAndCalcModes();
        this.suggestionQuery.setTypes(sinaSuggestionTypes.types);
        this.suggestionQuery.setCalculationModes(sinaSuggestionTypes.calculationModes);
        this.suggestionQuery.setTop(20);
      }

      // assemble suggestion types and calculation modes
      // ===================================================================
    }, {
      key: "assembleSinaSuggestionTypesAndCalcModes",
      value: function assembleSinaSuggestionTypesAndCalcModes() {
        var append = function append(list, element) {
          if (list.indexOf(element) >= 0) {
            return;
          }
          list.push(element);
        };
        var result = {
          types: [],
          calculationModes: []
        };
        for (var i = 0; i < this.suggestionTypes.length; ++i) {
          var suggestionType = this.suggestionTypes[i];
          switch (suggestionType) {
            case UISuggestionType.SearchTermHistory:
              append(result.types, this.sinaNext.SuggestionType.SearchTerm);
              append(result.calculationModes, this.sinaNext.SuggestionCalculationMode.History);
              break;
            case UISuggestionType.SearchTermData:
              append(result.types, this.sinaNext.SuggestionType.SearchTerm);
              append(result.calculationModes, this.sinaNext.SuggestionCalculationMode.Data);
              break;
            case UISuggestionType.DataSource:
              append(result.types, this.sinaNext.SuggestionType.DataSource);
              append(result.calculationModes, this.sinaNext.SuggestionCalculationMode.Data);
              break;
            case UISuggestionType.Object:
              append(result.types, this.sinaNext.SuggestionType.Object);
              append(result.calculationModes, this.sinaNext.SuggestionCalculationMode.Data);
              break;
          }
        }
        return result;
      }
    }]);
    return SinaBaseSuggestionProvider;
  }();
  return SinaBaseSuggestionProvider;
});
})();