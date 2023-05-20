/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define([], function () {
  function createTemplateDetails(oContext, gen) {
    var res = {
      alligator: [oContext.sina._createSearchResultSetItemAttribute({
        id: "SALARY",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Salary",
        value: "5123",
        valueFormatted: "5123.00",
        metadata: gen.getMetadataById(gen.metadata, "SALARY"),
        unitOfMeasure: oContext.sina._createSearchResultSetItemAttribute({
          id: "CURRENCY",
          valueHighlighted: "",
          isHighlighted: false,
          label: "Currency",
          value: "Euro",
          valueFormatted: "€",
          metadata: gen.getMetadataById(gen.metadata, "CURRENCY")
        })
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "HEIGHT",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Height",
        value: "169",
        valueFormatted: "169",
        metadata: gen.getMetadataById(gen.metadata, "HEIGHT"),
        unitOfMeasure: oContext.sina._createSearchResultSetItemAttribute({
          id: "UOM_HEIGHT",
          valueHighlighted: "",
          isHighlighted: false,
          label: "Unit of Measure for Height",
          value: "cm",
          valueFormatted: "cm",
          metadata: gen.getMetadataById(gen.metadata, "UOM_HEIGHT")
        })
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "DESC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Quote",
        value: 'In "The World Beneath The City" (1959), Robert Daley describes the history of the problems encountered while developing the network of utilities beneath Manhattan island, and reports that sewer inspectors first saw aligators in 1935, and that their average length was about 2 feet.',
        valueFormatted: 'In "The World Beneath The City" (1959), Robert Daley describes the history of the problems encountered while developing the network of utilities beneath Manhattan island, and reports that sewer inspectors first saw aligators in 1935, and that their average length was about 2 feet.',
        metadata: gen.getMetadataById(gen.metadata2, "DESC")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "LOCATION",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Location",
        value: "NYC",
        valueFormatted: "NYC",
        metadata: gen.getMetadataById(gen.metadata2, "LOCATION")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "sightinglocation",
        valueHighlighted: "",
        isHighlighted: false,
        label: "New York City",
        value: '{ "type": "Point", "coordinates": [-91.132139, -0.828628] }',
        valueFormatted: '{ "type": "Point", "coordinates": [-91.132139, -0.828628] }',
        metadata: gen.getMetadataById(gen.metadata2, "LOC_4326")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "FOLKLORIST",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Folklorist",
        value: "Andrew McCain",
        valueFormatted: "Andrew McCain",
        metadata: gen.getMetadataById(gen.metadata2, "FOLKLORIST")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "PIC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Picture",
        value: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/alligator.jpg",
        valueFormatted: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/alligator.jpg",
        metadata: gen.getMetadataById(gen.metadata2, "PIC")
      })],
      slenderman: [oContext.sina._createSearchResultSetItemAttribute({
        id: "SALARY",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Salary",
        value: "4300",
        valueFormatted: "4300.00",
        metadata: gen.getMetadataById(gen.metadata, "SALARY"),
        unitOfMeasure: oContext.sina._createSearchResultSetItemAttribute({
          id: "CURRENCY",
          valueHighlighted: "",
          isHighlighted: false,
          label: "Currency",
          value: "Euro",
          valueFormatted: "€",
          metadata: gen.getMetadataById(gen.metadata, "CURRENCY")
        })
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "HEIGHT",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Height",
        value: "171",
        valueFormatted: "171",
        metadata: gen.getMetadataById(gen.metadata, "HEIGHT"),
        unitOfMeasure: oContext.sina._createSearchResultSetItemAttribute({
          id: "UOM_HEIGHT",
          valueHighlighted: "",
          isHighlighted: false,
          label: "Unit of Measure for Height",
          value: "cm",
          valueFormatted: "cm",
          metadata: gen.getMetadataById(gen.metadata, "UOM_HEIGHT")
        })
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "LOCATION",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Location",
        value: "University of Georgia",
        valueFormatted: "University of Georgia",
        metadata: gen.getMetadataById(gen.metadata2, "LOCATION")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "FOLKLORIST",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Folklorist",
        value: "Carol Mandelbaum",
        valueFormatted: "Carol Mandelbaum",
        metadata: gen.getMetadataById(gen.metadata2, "FOLKLORIST")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "sightinglocation",
        valueHighlighted: "",
        isHighlighted: false,
        label: "University of Georgia",
        value: '{ "type": "Point", "coordinates": [35.102514, 34.824097] }',
        valueFormatted: '{ "type": "Point", "coordinates": [35.102514, 34.824097] }',
        metadata: gen.getMetadataById(gen.metadata2, "LOC_4326")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "DESC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Summary",
        value: "Slender Man is a fictional character that originated as an Internet meme created by Something Awful forums user Victor Surge in 2009, depicted as a thin, unnaturally tall man with a blank and usually featureless face and wearing a black suit, commonly said to stalk, abduct, or traumatize people, particularly children.",
        valueFormatted: "Slender Man is a fictional character that originated as an Internet meme created by Something Awful forums user Victor Surge in 2009, depicted as a thin, unnaturally tall man with a blank and usually featureless face and wearing a black suit, commonly said to stalk, abduct, or traumatize people, particularly children.",
        metadata: gen.getMetadataById(gen.metadata2, "DESC")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "PIC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Picture",
        value: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/slender_man.jpg",
        valueFormatted: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/slender_man.jpg",
        metadata: gen.getMetadataById(gen.metadata2, "PIC")
      })],
      chupacabra: [oContext.sina._createSearchResultSetItemAttribute({
        id: "LOCATION",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Location",
        value: "Puerto Rico",
        valueFormatted: "Puerto Rico",
        metadata: gen.getMetadataById(gen.metadata2, "LOCATION")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "FOLKLORIST",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Folklorist",
        value: "Ryan Anderson",
        valueFormatted: "Ryan Anderson",
        metadata: gen.getMetadataById(gen.metadata2, "FOLKLORIST")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "sightinglocation",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Chupacabra, sighting, Puerto Rico",
        value: '{ "type": "Point", "coordinates": [36.199993, 33.999453] }',
        valueFormatted: '{ "type": "Point", "coordinates": [36.199993, 33.999453] }',
        metadata: gen.getMetadataById(gen.metadata2, "LOC_4326")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "DESC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Summary",
        value: "The first sightings of the Chupacabra were reported in Puerto Rico. The name originates from the their reported habit of attacking and drinking the blood of livestock, including goats.",
        valueFormatted: "The first sightings of the Chupacabra were reported in Puerto Rico. The name originates from the their reported habit of attacking and drinking the blood of livestock, including goats.",
        metadata: gen.getMetadataById(gen.metadata2, "DESC")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "PIC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Picture",
        value: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/chupacabra.jpg",
        valueFormatted: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/chupacabra.jpg",
        metadata: gen.getMetadataById(gen.metadata2, "PIC")
      })],
      hitchhiker: [oContext.sina._createSearchResultSetItemAttribute({
        id: "LOCATION",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Location",
        value: "University of California, Berkeley",
        valueFormatted: "University of California, Berkeley",
        metadata: gen.getMetadataById(gen.metadata2, "LOCATION")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "FOLKLORIST",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Folklorist",
        value: "Cynthia MacDonald",
        valueFormatted: "Cynthia MacDonald",
        metadata: gen.getMetadataById(gen.metadata2, "FOLKLORIST")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "sightinglocation",
        valueHighlighted: "",
        isHighlighted: false,
        label: "University of California, Berkeley",
        value: '{ "type": "Point", "coordinates": [36.204944, 34.006899] }',
        valueFormatted: '{ "type": "Point", "coordinates": [36.204944, 34.006899] }',
        metadata: gen.getMetadataById(gen.metadata2, "LOC_4326")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "DESC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Summary",
        value: "People traveling by vehicle encounter a hitchhiker who later vanishes without explanation, sometimes from the moving vehicle. The vanishing hitchhiker can also leave information that encourages the motorist to later try to make contact with them.",
        valueFormatted: "People traveling by vehicle encounter a hitchhiker who later vanishes without explanation, sometimes from the moving vehicle. The vanishing hitchhiker can also leave information that encourages the motorist to later try to make contact with them.",
        metadata: gen.getMetadataById(gen.metadata2, "DESC")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "PIC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Picture",
        value: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/hitchhiker.jpg",
        valueFormatted: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/hitchhiker.jpg",
        metadata: gen.getMetadataById(gen.metadata2, "PIC")
      })],
      hitchhiker2: [oContext.sina._createSearchResultSetItemAttribute({
        id: "LOCATION",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Location",
        value: "Cripple Creek, Colorado",
        valueFormatted: "Cripple Creek, Colorado",
        metadata: gen.getMetadataById(gen.metadata2, "LOCATION")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "FOLKLORIST",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Folklorist",
        value: "Simon Kingston",
        valueFormatted: "Simon Kingston",
        metadata: gen.getMetadataById(gen.metadata2, "FOLKLORIST")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "sightinglocation",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Wycliffe Well, NT, Australia",
        value: '{ "type": "Point", "coordinates": [134.236761, -20.795279] }',
        valueFormatted: '{ "type": "Point", "coordinates": [134.236761, -20.795279] }',
        metadata: gen.getMetadataById(gen.metadata2, "LOC_4326")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "DESC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Summary",
        value: 'The general public became widely aware of the legend after the publication of the book "The Vanishing Hitchhiker" (1981) in which the author, Harold Brunvan, suggests that the legend can be traced as far back as the 1870s and has parallels in Korea, Russia, China, and among Mormons and people living in Arkansas mountains.',
        valueFormatted: 'The general public became widely aware of the legend after the publication of the book "The Vanishing Hitchhiker" (1981) in which the author, Harold Brunvan, suggests that the legend can be traced as far back as the 1870s and has parallels in Korea, Russia, China, and among Mormons and people living in Arkansas mountains.',
        metadata: gen.getMetadataById(gen.metadata2, "DESC")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "PIC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Picture",
        value: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/vanishing.jpg",
        valueFormatted: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/vanishing.jpg",
        metadata: gen.getMetadataById(gen.metadata2, "PIC")
      })],
      babytrain: [oContext.sina._createSearchResultSetItemAttribute({
        id: "LOCATION",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Location",
        value: "A Small Town",
        valueFormatted: "A Small Town",
        metadata: gen.getMetadataById(gen.metadata2, "LOCATION")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "FOLKLORIST",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Folklorist",
        value: "Douglas Milford",
        valueFormatted: "Douglas Milford",
        metadata: gen.getMetadataById(gen.metadata2, "FOLKLORIST")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "sightinglocation",
        valueHighlighted: "",
        isHighlighted: false,
        label: "a little town on the coast, not too far north of Sydney",
        value: '{ "type": "Point", "coordinates": [38.855842, 37.217718] }',
        valueFormatted: '{ "type": "Point", "coordinates": [38.855842, 37.217718] }',
        metadata: gen.getMetadataById(gen.metadata2, "LOC_4326")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "DESC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Summary",
        value: "Legend has it there was a small town which had an unusually high birth rate because a train would pass through the center of town at 5 am and blow its whistle, waking up all the townsfolk. Since it was too late to go back to sleep and too early to get up, residents passed the time by cuddling up. This resulted in a mini baby-boom.",
        valueFormatted: "Legend has it there was a small town which had an unusually high birth rate because a train would pass through the center of town at 5 am and blow its whistle, waking up all the townsfolk. Since it was too late to go back to sleep and too early to get up, residents passed the time by cuddling up. This resulted in a mini baby-boom.",
        metadata: gen.getMetadataById(gen.metadata2, "FOLKLORIST")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "PIC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Picture",
        value: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/babytrain.jpg",
        valueFormatted: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/babytrain.jpg",
        metadata: gen.getMetadataById(gen.metadata2, "PIC")
      })]
    };
    return res;
  }
  var __exports = {
    __esModule: true
  };
  __exports.createTemplateDetails = createTemplateDetails;
  return __exports;
});
})();