sap.ui.define(["sap/ui/test/opaQunit"],function(e){"use strict";var i={run:function(){QUnit.module("First journey");e("Start application",function(e,i,t){e.iStartMyApp();t.onTheBeersList.iSeeThisPage()});e("Navigate to ObjectPage",function(e,i,t){i.onTheBeersList.onFilterBar().iExecuteSearch();t.onTheBeersList.onTable().iCheckRows();i.onTheBeersList.onTable().iPressRow(0);t.onTheBeersObjectPage.iSeeThisPage()});e("Teardown",function(e,i,t){e.iTearDownMyApp()})}};return i});