/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define([], function () {
  var Type;
  (function (Type) {
    Type["App"] = "App";
    Type["DataSource"] = "DataSource";
    Type["SearchTermHistory"] = "SearchTermHistory";
    Type["SearchTermData"] = "SearchTermData";
    Type["Object"] = "Object";
    Type["Header"] = "Header";
    Type["BusyIndicator"] = "BusyIndicator";
    Type["Recent"] = "Recent";
    Type["Transaction"] = "Transaction";
  })(Type || (Type = {}));
  var SuggestionType = {
    // =======================================================================
    // constants for suggestion types
    // =======================================================================
    App: "App",
    DataSource: "DataSource",
    SearchTermHistory: "SearchTermHistory",
    SearchTermData: "SearchTermData",
    Object: "Object",
    Header: "Header",
    // section header
    BusyIndicator: "BusyIndicator",
    // busy indicator entry
    Recent: "Recent",
    // recently opened app, search or transaction
    Transaction: "Transaction",
    // =======================================================================
    // list of all suggestion types
    // =======================================================================
    types: ["App", "DataSource", "SearchTermHistory", "SearchTermData", "Object", "Recent", "Transaction"],
    // =======================================================================
    // properties of suggestion types
    // =======================================================================
    properties: {
      // Recent suggestions are shown exclusively if term is empty and selected datasource is the default datasource:
      Recent: {
        position: 25,
        limitDsAll: 10,
        limit: 10
      },
      Transaction: {
        position: 50,
        limitDsAll: 3,
        limit: 3
      },
      App: {
        position: 100,
        // TODO sinaNext check values
        limitDsAll: 3,
        limit: 7 // Ds=Apps
      },

      DataSource: {
        position: 200,
        limitDsAll: 2,
        limit: 2
      },
      SearchTermHistory: {
        position: 400,
        limitDsAll: 7,
        limit: 5
      },
      SearchTermData: {
        position: 400,
        limitDsAll: 7,
        limit: 5
      },
      Object: {
        position: 300,
        limitDsAll: 3,
        limit: 5
      },
      BusyIndicator: {
        position: 900
      }
    }
  };
  SuggestionType.Type = Type;
  SuggestionType.SuggestionType = SuggestionType;
  return SuggestionType;
});
})();