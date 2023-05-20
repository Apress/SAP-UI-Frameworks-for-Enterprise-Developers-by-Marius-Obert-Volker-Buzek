/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define([], function () {
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
  var Ranking = /*#__PURE__*/function () {
    function Ranking() {
      _classCallCheck(this, Ranking);
    }
    _createClass(Ranking, [{
      key: "sort",
      value:
      //sorting method according ranking
      function sort(resultSetItemList) {
        var results = [];
        for (var j = 0; j < resultSetItemList.length; j++) {
          results = results.concat(resultSetItemList[j]);
        }
        results.sort(function (a, b) {
          var ret = b.score - a.score; //high score is first
          return ret;
        });
        return results;
      }
    }]);
    return Ranking;
  }();
  var RoundRobin = /*#__PURE__*/function () {
    function RoundRobin() {
      _classCallCheck(this, RoundRobin);
    }
    _createClass(RoundRobin, [{
      key: "sort",
      value:
      //simple round robin method
      function sort(resultSetItemList) {
        var sortedResults = [];
        for (var i = 0; i < resultSetItemList.length; i++) {
          sortedResults = this.mergeMultiResults(sortedResults, resultSetItemList[i], i + 1);
        }
        return sortedResults;
      }
    }, {
      key: "mergeMultiResults",
      value: function mergeMultiResults(firstResults, secondResults, mergeIndex) {
        if (mergeIndex < 1) {
          return [];
        }
        if (mergeIndex === 1) {
          return secondResults;
        }
        var firstLength = firstResults.length;
        var secondLength = secondResults.length;
        var results = [];
        for (var k = 0; k < firstLength; k++) {
          results.push(firstResults[k]);
        }
        for (var i = 0; i < firstLength; i++) {
          if (i >= secondLength) {
            break;
          }
          results.splice(mergeIndex * (i + 1) - 1, 0, secondResults[i]);
        }
        if (secondLength > firstLength) {
          results = results.concat(secondResults.slice(firstLength - secondLength));
        }
        return results;
      }
    }]);
    return RoundRobin;
  }();
  var AdvancedRoundRobin = /*#__PURE__*/function () {
    function AdvancedRoundRobin() {
      _classCallCheck(this, AdvancedRoundRobin);
    }
    _createClass(AdvancedRoundRobin, [{
      key: "sort",
      value:
      //advanced round robin method
      function sort(resultSetItemList) {
        var results = [];
        for (var j = 0; j < resultSetItemList.length; j++) {
          results = results.concat(resultSetItemList[j]);
        }
        var dataSourceId;

        //result list map, key: dataSourceId, value: array list of resultlist
        var dataSourceIdMap = {};
        for (var i = 0; i < results.length; i++) {
          dataSourceId = results[i].dataSource.id;
          if (!dataSourceIdMap[dataSourceId]) {
            dataSourceIdMap[dataSourceId] = [];
          }
          dataSourceIdMap[dataSourceId].push(results[i]);
        }

        //array of objects: dataSouceId, high score, original index
        var dataSourceScoreArray = [];
        var index = 0;
        for (var key in dataSourceIdMap) {
          var item = dataSourceIdMap[key][0];
          dataSourceId = item.dataSource.id;
          var score = item.score;
          dataSourceScoreArray.push({
            dataSourceId: dataSourceId,
            score: score,
            index: index
          });
          index++;
        }

        //sort dataSourceScoreArray
        dataSourceScoreArray.sort(function (a, b) {
          var ret = b.score - a.score; //high score is first
          if (ret === 0) {
            ret = a.index - b.index; //low index is first
          }

          return ret;
        });

        //rebuild the results
        var sortedResults = [];
        var dsIndex = 0;
        for (var r = 0; r < results.length;) {
          var selectDs = dataSourceScoreArray[dsIndex];
          var selectRs = dataSourceIdMap[selectDs.dataSourceId];
          if (selectRs.length > 0) {
            sortedResults.push(selectRs.shift());
            r++;
          }
          dsIndex = (dsIndex + 1) % dataSourceScoreArray.length;
        }
        return sortedResults;
      }
    }]);
    return AdvancedRoundRobin;
  }();
  var __exports = {
    __esModule: true
  };
  __exports.Ranking = Ranking;
  __exports.RoundRobin = RoundRobin;
  __exports.AdvancedRoundRobin = AdvancedRoundRobin;
  return __exports;
});
})();