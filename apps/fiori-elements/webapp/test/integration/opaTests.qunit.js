sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/apress/beershop/test/integration/FirstJourney',
		'com/apress/beershop/test/integration/pages/BeersList',
		'com/apress/beershop/test/integration/pages/BeersObjectPage'
    ],
    function(JourneyRunner, opaJourney, BeersList, BeersObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/apress/beershop') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheBeersList: BeersList,
					onTheBeersObjectPage: BeersObjectPage
                }
            },
            opaJourney.run
        );
    }
);