sap.ui.require(["sap/fe/test/JourneyRunner","com/apress/beershop/test/integration/FirstJourney","com/apress/beershop/test/integration/pages/BeersList","com/apress/beershop/test/integration/pages/BeersObjectPage"],function(e,s,r,t){"use strict";var e=new e({launchUrl:sap.ui.require.toUrl("com/apress/beershop")+"/index.html"});e.run({pages:{onTheBeersList:r,onTheBeersObjectPage:t}},s.run)});