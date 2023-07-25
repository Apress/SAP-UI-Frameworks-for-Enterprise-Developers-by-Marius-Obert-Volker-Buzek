sap.ui.define(["sap/ui/test/opaQunit"], function (opaTest) {
  "use strict";

  var Journey = {
    run: function () {
      QUnit.module("First journey");

      opaTest("Start application", function (Given, When, Then) {
        Given.iStartMyApp();

        Then.onTheBeersList.iSeeThisPage();
      });

      opaTest("Navigate to ObjectPage", function (Given, When, Then) {
        // Note: this test will fail if the ListReport page doesn't show any data
        When.onTheBeersList.onFilterBar().iExecuteSearch();
        Then.onTheBeersList.onTable().iCheckRows();

        When.onTheBeersList.onTable().iPressRow(0);
        Then.onTheBeersObjectPage.iSeeThisPage();
      });

      opaTest("Teardown", function (Given, When, Then) {
        // Cleanup
        Given.iTearDownMyApp();
      });
    },
  };

  return Journey;
});
