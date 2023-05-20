/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define([], function () {
  function createTemplateDetails(oContext, gen) {
    var res = {
      george: [oContext.sina._createSearchResultSetItemAttribute({
        id: "SALARY",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Salary",
        value: "2800",
        valueFormatted: "1000.00",
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
        value: "175",
        valueFormatted: "175",
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
        label: "Site Location",
        value: "Schaumburg, Illinois",
        valueFormatted: "Schaumburg, Illinois",
        metadata: gen.getMetadataById(gen.metadata, "LOCATION")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "WEBSITE",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Website",
        value: "https://www.abebooks.com/Journal-American-Folklore-Society-Vol-368/22552416159/bd",
        valueFormatted: "https://www.abebooks.com/Journal-American-Folklore-Society-Vol-368/22552416159/bd",
        metadata: gen.getMetadataById(gen.metadata, "WEBSITE")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "SUMMARY",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Summary",
        value: "While most legends are based on rumors, embellished half truths or unsubstantiated claims, the legend of aligators in the sewers can be traced back to historical documentation.",
        valueFormatted: "While most legends are based on rumors, embellished half truths or unsubstantiated claims, the legend of aligators in the sewers can be traced back to historical documentation.",
        metadata: gen.getMetadataById(gen.metadata, "SUMMARY")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "PHONE",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Phone",
        value: "+1 212 6539539",
        valueFormatted: "+1 212 6539539",
        metadata: gen.getMetadataById(gen.metadata, "PHONE")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "EMAIL",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Contact",
        value: "andrew.mccain@example.com",
        valueFormatted: "andrew.mccain@example.com",
        metadata: gen.getMetadataById(gen.metadata, "EMAIL")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "fieldoffice",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Andrew McCain (Field Office, Schaumburg, Illinois",
        value: '{ "type": "Point", "coordinates": [-69.040601, 47.082589] }',
        valueFormatted: '{ "type": "Point", "coordinates": [-69.040601, 47.082589] }',
        defaultNavigationTarget: oContext.sina._createNavigationTarget({
          label: "Send Mail",
          targetUrl: "mailto:andrew.mccain@example.com"
        }),
        metadata: gen.getMetadataById(gen.metadata, "LOC_4326")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "DISCIPLINE",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Discipline",
        value: "Alligator Legends",
        valueFormatted: "Alligator Legends",
        metadata: gen.getMetadataById(gen.metadata, "DISCIPLINE")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "SEX",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Sex",
        value: "♂",
        valueFormatted: "♂",
        metadata: gen.getMetadataById(gen.metadata, "SEX"),
        description: oContext.sina._createSearchResultSetItemAttribute({
          id: "SEX_DESC",
          valueHighlighted: "",
          isHighlighted: false,
          label: "Description for Gender",
          value: "Male",
          valueFormatted: "Male",
          metadata: gen.getMetadataById(gen.metadata, "SEX_DESC")
        })
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "PUBLICATION",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Publication",
        value: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/suv_thumbnail.jpg",
        valueFormatted: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/suv_thumbnail.jpg",
        metadata: gen.getMetadataById(gen.metadata, "PUB")
      })
      /*,
      oContext.sina._createSearchResultSetItemAttribute({
          id: 'PIC',
          valueHighlighted: '',
          isHighlighted: false,
          label: 'Picture',
          value: '/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/folklorist_fergus.jpg',
          valueFormatted: '/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/folklorist_fergus.jpg',
          metadata: gen.getMetadataById(gen.metadata, "PIC")
      })*/],

      shira: [oContext.sina._createSearchResultSetItemAttribute({
        id: "SALARY",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Salary",
        value: "3000",
        valueFormatted: "3000.00",
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
        value: "188",
        valueFormatted: "188",
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
        label: "Site Location",
        value: "University of Georgia",
        valueFormatted: "University of Georgia",
        metadata: gen.getMetadataById(gen.metadata, "LOCATION")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "fieldoffice",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Carol Mandelbaum (Offices)",
        value: '{ "type": "Point", "coordinates": [-118.236036, 34.050492] }',
        valueFormatted: '{ "type": "Point", "coordinates": [-118.236036, 34.050492] }',
        metadata: gen.getMetadataById(gen.metadata, "LOC_4326")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "DISCIPLINE",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Discipline",
        value: "Entertainment and Media Studies",
        valueFormatted: "Entertainment and Media Studies",
        metadata: gen.getMetadataById(gen.metadata, "DISCIPLINE")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "SEX",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Sex",
        value: "♀",
        valueFormatted: "♀",
        metadata: gen.getMetadataById(gen.metadata, "SEX"),
        description: oContext.sina._createSearchResultSetItemAttribute({
          id: "SEX_DESC",
          valueHighlighted: "",
          isHighlighted: false,
          label: "Description for Gender",
          value: "Female",
          valueFormatted: "Female",
          metadata: gen.getMetadataById(gen.metadata, "SEX_DESC")
        })
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "PIC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Picture",
        value: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/folklorist_chess.jpg",
        valueFormatted: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/folklorist_chess.jpg",
        metadata: gen.getMetadataById(gen.metadata, "PIC")
      })],
      benjamin: [oContext.sina._createSearchResultSetItemAttribute({
        id: "SALARY",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Salary",
        value: "3200",
        valueFormatted: "3200.00",
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
        value: "165",
        valueFormatted: "165",
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
        label: "Site Location",
        value: "Center for Inquiry (CFI), Amherst, New York",
        valueFormatted: "Center for Inquiry (CFI), Amherst, New York",
        metadata: gen.getMetadataById(gen.metadata, "LOCATION")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "fieldoffice",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Center for Inquiry (CFI), Amherst, New York",
        value: '{ "type": "Point", "coordinates": [-73.995589, 40.730355] }',
        valueFormatted: '{ "type": "Point", "coordinates": [-73.995589, 40.730355] }',
        metadata: gen.getMetadataById(gen.metadata, "LOC_4326")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "DISCIPLINE",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Discipline",
        value: "Paranormal Investigations",
        valueFormatted: "Paranormal Investigations",
        metadata: gen.getMetadataById(gen.metadata, "DISCIPLINE")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "SEX",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Sex",
        value: "♂",
        valueFormatted: "♂",
        metadata: gen.getMetadataById(gen.metadata, "SEX"),
        description: oContext.sina._createSearchResultSetItemAttribute({
          id: "SEX_DESC",
          valueHighlighted: "",
          isHighlighted: false,
          label: "Description for Gender",
          value: "Male",
          valueFormatted: "Male",
          metadata: gen.getMetadataById(gen.metadata, "SEX_DESC")
        })
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "PIC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Picture",
        value: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/folklorist_radford.jpg",
        valueFormatted: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/folklorist_radford.jpg",
        metadata: gen.getMetadataById(gen.metadata, "PIC")
      })],
      richard: [oContext.sina._createSearchResultSetItemAttribute({
        id: "SALARY",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Salary",
        value: "2100",
        valueFormatted: "2100.00",
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
        value: "182",
        valueFormatted: "182",
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
        label: "Site Location",
        value: "Cripple Creek, Colorado",
        valueFormatted: "Cripple Creek, Colorado",
        metadata: gen.getMetadataById(gen.metadata, "LOCATION")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "fieldoffice",
        valueHighlighted: "",
        isHighlighted: false,
        label: "University of California, Berkeley",
        value: '{ "type": "Point", "coordinates": [-1.387958, 50.933494] }',
        valueFormatted: '{ "type": "Point", "coordinates": [-1.387958, 50.933494] }',
        metadata: gen.getMetadataById(gen.metadata, "LOC_4326")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "DISCIPLINE",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Discipline",
        value: "Anthropologist",
        valueFormatted: "Anthropologist",
        metadata: gen.getMetadataById(gen.metadata, "DISCIPLINE")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "SEX",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Sex",
        value: "♂",
        valueFormatted: "♂",
        metadata: gen.getMetadataById(gen.metadata, "SEX"),
        description: oContext.sina._createSearchResultSetItemAttribute({
          id: "SEX_DESC",
          valueHighlighted: "",
          isHighlighted: false,
          label: "Description for Gender",
          value: "Male",
          valueFormatted: "Male",
          metadata: gen.getMetadataById(gen.metadata, "SEX_DESC")
        })
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "PIC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Picture",
        value: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/folklorist_beardfy.jpg",
        valueFormatted: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/folklorist_beardsley.jpg",
        metadata: gen.getMetadataById(gen.metadata, "PIC")
      })],
      rosalie: [oContext.sina._createSearchResultSetItemAttribute({
        id: "SALARY",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Salary",
        value: "1500",
        valueFormatted: "1500.00",
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
        value: "195",
        valueFormatted: "195",
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
        label: "Birthplace",
        value: "Des Plaines, Illinois",
        valueFormatted: "Des Plaines, Illinois",
        metadata: gen.getMetadataById(gen.metadata, "LOCATION")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "fieldoffice",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Tulelake, California",
        value: '{ "type": "Point", "coordinates": [11.016959, 49.600319] }',
        valueFormatted: '{ "type": "Point", "coordinates": [11.016959, 49.600319] }',
        metadata: gen.getMetadataById(gen.metadata, "LOC_4326")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "DISCIPLINE",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Discipline",
        value: "Applied Anthropology",
        valueFormatted: "Applied Anthropology",
        metadata: gen.getMetadataById(gen.metadata, "DISCIPLINE")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "SEX",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Sex",
        value: "♀",
        valueFormatted: "♀",
        metadata: gen.getMetadataById(gen.metadata, "SEX"),
        description: oContext.sina._createSearchResultSetItemAttribute({
          id: "SEX_DESC",
          valueHighlighted: "",
          isHighlighted: false,
          label: "Description for Gender",
          value: "Female",
          valueFormatted: "Female",
          metadata: gen.getMetadataById(gen.metadata, "SEX_DESC")
        })
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "PIC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Picture",
        value: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/folklorist_handkey.jpg",
        valueFormatted: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/folklorist_handkey.jpg",
        metadata: gen.getMetadataById(gen.metadata, "PIC")
      })],
      bill: [oContext.sina._createSearchResultSetItemAttribute({
        id: "SALARY",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Salary",
        value: "1500",
        valueFormatted: "1500.00",
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
        value: "195",
        valueFormatted: "195",
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
        label: "Birthplace",
        value: "Bundaberg, Australia",
        valueFormatted: "Bundaberg, Australia",
        metadata: gen.getMetadataById(gen.metadata, "LOCATION")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "fieldoffice",
        valueHighlighted: "",
        isHighlighted: false,
        label: "A small town north of Sydney",
        value: '{ "type": "Point", "coordinates": [11.016959, 49.600319] }',
        valueFormatted: '{ "type": "Point", "coordinates": [11.016959, 49.600319] }',
        metadata: gen.getMetadataById(gen.metadata, "LOC_4326")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "DISCIPLINE",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Discipline",
        value: "Author and folklorist",
        valueFormatted: "Author and folklorist",
        metadata: gen.getMetadataById(gen.metadata, "DISCIPLINE")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "SEX",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Sex",
        value: "♂",
        valueFormatted: "♂",
        metadata: gen.getMetadataById(gen.metadata, "SEX"),
        description: oContext.sina._createSearchResultSetItemAttribute({
          id: "SEX_DESC",
          valueHighlighted: "",
          isHighlighted: false,
          label: "Description for Gender",
          value: "Male",
          valueFormatted: "Male",
          metadata: gen.getMetadataById(gen.metadata, "SEX_DESC")
        })
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "PIC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Picture",
        value: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/scott.jpg",
        valueFormatted: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/scott.jpg",
        metadata: gen.getMetadataById(gen.metadata, "PIC")
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