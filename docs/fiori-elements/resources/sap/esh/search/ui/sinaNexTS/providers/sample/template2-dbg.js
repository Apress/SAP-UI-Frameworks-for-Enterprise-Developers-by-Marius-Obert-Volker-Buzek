/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../sina/NavigationTarget", "../../sina/AttributeFormatType"], function (____sina_NavigationTarget, ____sina_AttributeFormatType) {
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var NavigationTarget = ____sina_NavigationTarget["NavigationTarget"];
  var AttributeFormatType = ____sina_AttributeFormatType["AttributeFormatType"];
  function createTemplate(oContext) {
    var gen = {};
    gen.metadata = [];
    gen.metadata2 = [];
    gen.getMetadataById = function (list, id) {
      var res = null;
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) {
          res = list[i];
          break;
        }
      }
      return res;
    };
    gen.searchResultSetItemArray = [];
    gen.searchResultSetItemArray2 = [];
    gen.chartResultSetArray = [];
    var titleAttributes, detailAttributes;
    gen._init = function (metadataRoot) {
      var metadata1 = metadataRoot.metadata;
      var metadata2 = metadataRoot.metadata2;
      oContext.sina._createDataSource({
        id: "Scientists",
        label: "Scientist",
        labelPlural: "Scientists",
        type: oContext.sina.DataSourceType.BusinessObject,
        attributesMetadata: metadata1
      });
      oContext.sina._createDataSource({
        id: "Mysterious_Sightings",
        label: "Mysterious Sighting",
        labelPlural: "Mysterious Sightings",
        type: oContext.sina.DataSourceType.BusinessObject,
        attributesMetadata: metadata2
      });
    };

    /*
     *
     *     Metadata
     *
     *
     */

    if (oContext.sina) {
      //metadata for scientists
      gen.metadata = [oContext.sina._createAttributeMetadata({
        id: "SCIENTIST",
        label: "Scientist",
        type: oContext.sina.AttributeType.String,
        usage: {
          Title: {},
          AdvancedSearch: {
            displayOrder: 0
          },
          //necessary to open showmore dialog
          Facet: {}
        },
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "LOCATION",
        label: "Location",
        //to do: has no effect??
        type: oContext.sina.AttributeType.String,
        usage: {
          Title: {},
          Detail: {},
          AdvancedSearch: {
            displayOrder: 0
          },
          //necessary to open showmore dialog
          Facet: {}
        },
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "LOC_4326",
        label: "LOC_4326",
        //to do: has no effect??
        //dataType: oContext.sina.AttributeType.GeoJson,
        type: oContext.sina.AttributeType.GeoJson,
        usage: {
          Title: {},
          Detail: {},
          AdvancedSearch: {
            displayOrder: 0
          },
          //necessary to open showmore dialog
          Facet: {}
        },
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "SEX",
        label: "Sex",
        type: oContext.sina.AttributeType.String,
        usage: {
          Detail: {},
          AdvancedSearch: {
            displayOrder: 0
          },
          //necessary to open showmore dialog
          Facet: {}
        },
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "SEX_DESC",
        label: "Description for Gender",
        type: oContext.sina.AttributeType.String,
        usage: {},
        isSortable: false,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "DISCIPLINE",
        label: "Discipline",
        type: oContext.sina.AttributeType.String,
        usage: {},
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "DESC",
        label: "Descritption",
        type: oContext.sina.AttributeType.String,
        usage: {},
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "PIC",
        label: "picture",
        type: oContext.sina.AttributeType.ImageUrl,
        usage: {},
        format: AttributeFormatType.Round,
        isSortable: false,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "SALARY",
        label: "Salary",
        type: oContext.sina.AttributeType.Integer,
        usage: {},
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "CURRENCY",
        label: "Currency",
        type: oContext.sina.AttributeType.String,
        usage: {},
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "HEIGHT",
        label: "Height",
        type: oContext.sina.AttributeType.Integer,
        usage: {},
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "UOM_HEIGHT",
        label: "Unit of Measure for Height Attribute",
        type: oContext.sina.AttributeType.String,
        usage: {},
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "PHONE",
        label: "Phone",
        type: oContext.sina.AttributeType.String,
        usage: {},
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "EMAIL",
        label: "Email",
        type: oContext.sina.AttributeType.String,
        usage: {},
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      })];
      //metadata for sightings
      gen.metadata2 = [oContext.sina._createAttributeMetadata({
        id: "CAPTION",
        label: "Caption",
        type: oContext.sina.AttributeType.String,
        usage: {},
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "LOCATION",
        label: "Location",
        type: oContext.sina.AttributeType.String,
        usage: {
          Detail: {},
          AdvancedSearch: {
            displayOrder: 0
          },
          //necessary to open showmore dialog
          Facet: {}
        },
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "LOC_4326",
        label: "LOC_4326",
        //to do: has no effect??
        //dataType: oContext.sina.AttributeType.GeoJson,
        type: oContext.sina.AttributeType.GeoJson,
        usage: {},
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "SCIENTIST",
        label: "Scientist",
        type: oContext.sina.AttributeType.String,
        usage: {
          Title: {},
          AdvancedSearch: {
            displayOrder: 0
          },
          //necessary to open showmore dialog
          Facet: {}
        },
        isSortable: false,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "DESC",
        label: "Descritption",
        type: oContext.sina.AttributeType.String,
        usage: {},
        format: oContext.sina.AttributeFormatType.LongText,
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "PIC",
        label: "picture",
        type: oContext.sina.AttributeType.ImageUrl,
        usage: {},
        isSortable: false,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "URL",
        label: "URL",
        type: oContext.sina.AttributeType.String,
        usage: {},
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      })];
    }
    if (oContext.searchQuery && oContext.searchQuery.filter && oContext.searchQuery.filter.dataSource && oContext.sina && oContext.sina.getDataSource("Scientists")) {
      /*
       *
       *     'scientists' searchResultSetItem 1: Hannah White
       *
       *
       */

      titleAttributes = [oContext.sina._createSearchResultSetItemAttribute({
        id: "SCIENTIST",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Scientist",
        value: "Hannah White",
        valueFormatted: "Hannah White",
        metadata: gen.getMetadataById(gen.metadata, "SCIENTIST")
      })];
      detailAttributes = [oContext.sina._createSearchResultSetItemAttribute({
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
        value: "Galapagos",
        valueFormatted: "Galapagos",
        metadata: gen.getMetadataById(gen.metadata, "LOCATION")
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
        value: "hannah.white@example.com",
        valueFormatted: "hannah.white@example.com",
        metadata: gen.getMetadataById(gen.metadata, "EMAIL")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "fieldoffice",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Hannah White (Field Office, Allagash, Maine)",
        value: '{ "type": "Point", "coordinates": [-69.040601, 47.082589] }',
        valueFormatted: '{ "type": "Point", "coordinates": [-69.040601, 47.082589] }',
        defaultNavigationTarget: oContext.sina._createNavigationTarget({
          label: "Send Mail",
          targetUrl: "mailto:hanna.white@example.com"
        }),
        metadata: gen.getMetadataById(gen.metadata, "LOC_4326")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "DISCIPLINE",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Discipline",
        value: "Multidisciplinary",
        valueFormatted: "Multidisciplinary",
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
        value: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/scientist_hannah.jpg",
        valueFormatted: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/scientist_hannah.jpg",
        metadata: gen.getMetadataById(gen.metadata, "PIC")
      })];
      gen.searchResultSetItemArray.push(oContext.sina._createSearchResultSetItem({
        attributes: [],
        dataSource: oContext.sina.getDataSource("Scientists"),
        titleAttributes: titleAttributes,
        titleDescriptionAttributes: [],
        detailAttributes: detailAttributes
      }));

      /*
       *
       *     'scientists' searchResultSetItem 2:Barry Williamson
       *
       *
       */

      titleAttributes = [oContext.sina._createSearchResultSetItemAttribute({
        id: "SCIENTIST",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Scientist",
        value: "Barry Williamson",
        valueFormatted: "Barry Williamson",
        metadata: gen.getMetadataById(gen.metadata, "SCIENTIST")
      })];
      detailAttributes = [oContext.sina._createSearchResultSetItemAttribute({
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
        value: "Cyprus",
        valueFormatted: "Off East Cyprus",
        metadata: gen.getMetadataById(gen.metadata, "LOCATION")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "fieldoffice",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Barry Williamson (Offices)",
        value: '{ "type": "Point", "coordinates": [-118.236036, 34.050492] }',
        valueFormatted: '{ "type": "Point", "coordinates": [-118.236036, 34.050492] }',
        metadata: gen.getMetadataById(gen.metadata, "LOC_4326")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "DISCIPLINE",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Discipline",
        value: "Ancient History",
        valueFormatted: "Ancient History",
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
        value: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/scientist_RobertSarmast.jpg",
        valueFormatted: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/scientist_RobertSarmast.jpg",
        metadata: gen.getMetadataById(gen.metadata, "PIC")
      })];
      gen.searchResultSetItemArray.push(oContext.sina._createSearchResultSetItem({
        attributes: [],
        dataSource: oContext.sina.getDataSource("Scientists"),
        titleAttributes: titleAttributes,
        titleDescriptionAttributes: [],
        detailAttributes: detailAttributes
      }));

      /*
       *
       *     'scientists' searchResultSetItem 3:Conrad Atkinson
       *
       *
       */

      titleAttributes = [oContext.sina._createSearchResultSetItemAttribute({
        id: "SCIENTIST",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Scientist",
        value: "Conrad Atkinson",
        valueFormatted: "Conrad Atkinson",
        metadata: gen.getMetadataById(gen.metadata, "SCIENTIST")
      })];
      detailAttributes = [oContext.sina._createSearchResultSetItemAttribute({
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
        value: "Baalbek",
        valueFormatted: "Baalbek, Lebanon",
        metadata: gen.getMetadataById(gen.metadata, "LOCATION")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "fieldoffice",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Conrad Atkinson (NYU)",
        value: '{ "type": "Point", "coordinates": [-73.995589, 40.730355] }',
        valueFormatted: '{ "type": "Point", "coordinates": [-73.995589, 40.730355] }',
        metadata: gen.getMetadataById(gen.metadata, "LOC_4326")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "DISCIPLINE",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Discipline",
        value: "Archeology",
        valueFormatted: "Archeology",
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
        value: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/sitchin.jpg",
        valueFormatted: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/sitchin.jpg",
        metadata: gen.getMetadataById(gen.metadata, "PIC")
      })];
      gen.searchResultSetItemArray.push(oContext.sina._createSearchResultSetItem({
        attributes: [],
        dataSource: oContext.sina.getDataSource("Scientists"),
        titleAttributes: titleAttributes,
        titleDescriptionAttributes: [],
        detailAttributes: detailAttributes
      }));
      /*
       *
       *     'scientists' searchResultSetItem 4:Roger Murdoch
       *
       *
       */

      titleAttributes = [oContext.sina._createSearchResultSetItemAttribute({
        id: "SCIENTIST",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Scientist",
        value: "Roger Murdoch",
        valueFormatted: "Roger Murdoch",
        metadata: gen.getMetadataById(gen.metadata, "SCIENTIST")
      })];
      detailAttributes = [oContext.sina._createSearchResultSetItemAttribute({
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
        value: "Baalbek",
        valueFormatted: "Baalbek, Lebanon",
        metadata: gen.getMetadataById(gen.metadata, "LOCATION")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "fieldoffice",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Roger Murdoch (Eridu Books)",
        value: '{ "type": "Point", "coordinates": [-1.387958, 50.933494] }',
        valueFormatted: '{ "type": "Point", "coordinates": [-1.387958, 50.933494] }',
        metadata: gen.getMetadataById(gen.metadata, "LOC_4326")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "DISCIPLINE",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Discipline",
        value: "Egyptology",
        valueFormatted: "Egyptology",
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
        value: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/alford.jpg",
        valueFormatted: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/alford.jpg",
        metadata: gen.getMetadataById(gen.metadata, "PIC")
      })];
      gen.searchResultSetItemArray.push(oContext.sina._createSearchResultSetItem({
        attributes: [],
        dataSource: oContext.sina.getDataSource("Scientists"),
        titleAttributes: titleAttributes,
        titleDescriptionAttributes: [],
        detailAttributes: detailAttributes
      }));
      /*
       *
       *     'scientists' searchResultSetItem 5:Alan Cameron
       *
       *
       */

      titleAttributes = [oContext.sina._createSearchResultSetItemAttribute({
        id: "SCIENTIST",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Scientist",
        value: "Alan Cameron",
        valueFormatted: "Alan Cameron",
        metadata: gen.getMetadataById(gen.metadata, "SCIENTIST")
      })];
      detailAttributes = [oContext.sina._createSearchResultSetItemAttribute({
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
        label: "Site Location",
        value: "Göbekli Tepe",
        valueFormatted: "Göbekli Tepe, Turkey",
        metadata: gen.getMetadataById(gen.metadata, "LOCATION")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "fieldoffice",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Alan Cameron (Institut für Ur- und Frühgeschichte, Erlangen)",
        value: '{ "type": "Point", "coordinates": [11.016959, 49.600319] }',
        valueFormatted: '{ "type": "Point", "coordinates": [11.016959, 49.600319] }',
        metadata: gen.getMetadataById(gen.metadata, "LOC_4326")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "DISCIPLINE",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Discipline",
        value: "Prehistory",
        valueFormatted: "Prehistory",
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
        value: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/kschmidt.jpg",
        valueFormatted: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/kschmidt.jpg",
        metadata: gen.getMetadataById(gen.metadata, "PIC")
      })];
      gen.searchResultSetItemArray.push(oContext.sina._createSearchResultSetItem({
        attributes: [],
        dataSource: oContext.sina.getDataSource("Scientists"),
        titleAttributes: titleAttributes,
        titleDescriptionAttributes: [],
        detailAttributes: detailAttributes
      }));

      /*
       *
       *     'sightings' searchResultSetItem 1: Alien Landing Zone 22
       *
       *
       */

      titleAttributes = [oContext.sina._createSearchResultSetItemAttribute({
        id: "CAPTION",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Caption",
        value: "",
        valueFormatted: "",
        metadata: gen.getMetadataById(gen.metadata2, "CAPTION")
      })];
      detailAttributes = [oContext.sina._createSearchResultSetItemAttribute({
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
        value: "I heard the sound of a baby crying... I heard the sound of a baby crying... I heard the sound of a baby crying... I heard the sound of a baby crying... ",
        valueFormatted: '"I heard the sound of a baby crying... I heard the sound of a baby crying... I heard the sound of a baby crying... I heard the sound of a baby crying... "',
        metadata: gen.getMetadataById(gen.metadata2, "DESC")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "LOCATION",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Location",
        value: "Galapagos",
        valueFormatted: "Galapagos",
        metadata: gen.getMetadataById(gen.metadata2, "LOCATION")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "sightinglocation",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Isabela Island, Ecuador",
        value: '{ "type": "Point", "coordinates": [-91.132139, -0.828628] }',
        valueFormatted: '{ "type": "Point", "coordinates": [-91.132139, -0.828628] }',
        metadata: gen.getMetadataById(gen.metadata2, "LOC_4326")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "SCIENTIST",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Scientist",
        value: "Hannah White",
        valueFormatted: "Hannah White",
        metadata: gen.getMetadataById(gen.metadata2, "SCIENTIST")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "PIC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Picture",
        value: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/galapagos.jpg",
        valueFormatted: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/galapagos.jpg",
        metadata: gen.getMetadataById(gen.metadata2, "PIC")
      })];
      gen.searchResultSetItemArray2.push(oContext.sina._createSearchResultSetItem({
        attributes: [],
        dataSource: oContext.sina.getDataSource("Mysterious_Sightings"),
        titleAttributes: titleAttributes,
        detailAttributes: detailAttributes,
        titleDescriptionAttributes: [],
        defaultNavigationTarget: new NavigationTarget({
          label: "Alien species pathways to the Galapagos Islands, Ecuador",
          targetUrl: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5597199/",
          target: "_blank",
          sina: oContext.sina
        })
      }));
      /*
       *
       *     'sightings' searchResultSetItem 2: Atlantis
       *
       *
       */

      titleAttributes = [oContext.sina._createSearchResultSetItemAttribute({
        id: "CAPTION",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Caption",
        value: "",
        valueFormatted: "",
        metadata: gen.getMetadataById(gen.metadata2, "CAPTION")
      })];
      detailAttributes = [oContext.sina._createSearchResultSetItemAttribute({
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
        value: "Cyprus",
        valueFormatted: "Off East Cyprus",
        metadata: gen.getMetadataById(gen.metadata2, "LOCATION")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "SCIENTIST",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Scientist",
        value: "Barry Williamson",
        valueFormatted: "Barry Williamson",
        metadata: gen.getMetadataById(gen.metadata2, "SCIENTIST")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "sightinglocation",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Atlantis, Off East Cyprus",
        value: '{ "type": "Point", "coordinates": [35.102514, 34.824097] }',
        valueFormatted: '{ "type": "Point", "coordinates": [35.102514, 34.824097] }',
        metadata: gen.getMetadataById(gen.metadata2, "LOC_4326")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "DESC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Quote",
        value: "The discovery could mean a tourism bonanza for Cyprus once the word gets out",
        valueFormatted: '"The discovery could mean a tourism bonanza for Cyprus once the word gets out"',
        metadata: gen.getMetadataById(gen.metadata2, "DESC")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "PIC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Picture",
        value: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/atlantis.jpg",
        valueFormatted: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/atlantis.jpg",
        metadata: gen.getMetadataById(gen.metadata2, "PIC")
      })];
      gen.searchResultSetItemArray2.push(oContext.sina._createSearchResultSetItem({
        attributes: [],
        dataSource: oContext.sina.getDataSource("Mysterious_Sightings"),
        titleAttributes: titleAttributes,
        detailAttributes: detailAttributes,
        titleDescriptionAttributes: [],
        defaultNavigationTarget: new NavigationTarget({
          label: "Barry Williamson on the Hunt for Atlantis",
          targetUrl: "https://www.youtube.com/watch?v=6f8jzITECRM",
          target: "_blank",
          sina: oContext.sina
        })
      }));

      /*
       *
       *     'sightings' searchResultSetItem 3: Baalbek
       *
       *
       */

      titleAttributes = [oContext.sina._createSearchResultSetItemAttribute({
        id: "CAPTION",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Caption",
        value: "",
        valueFormatted: "",
        metadata: gen.getMetadataById(gen.metadata2, "CAPTION")
      })];
      detailAttributes = [oContext.sina._createSearchResultSetItemAttribute({
        id: "LOCATION",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Location",
        value: "Baalbek",
        valueFormatted: "Baalbek, Lebanon",
        metadata: gen.getMetadataById(gen.metadata2, "LOCATION")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "SCIENTIST",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Scientist",
        value: "Conrad Atkinson",
        valueFormatted: "Conrad Atkinson",
        metadata: gen.getMetadataById(gen.metadata2, "SCIENTIST")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "sightinglocation",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Stone of the Pregnant Woman (Hajar al-Hibla), Baalbek, Lebanon",
        value: '{ "type": "Point", "coordinates": [36.199993, 33.999453] }',
        valueFormatted: '{ "type": "Point", "coordinates": [36.199993, 33.999453] }',
        metadata: gen.getMetadataById(gen.metadata2, "LOC_4326")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "DESC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Summary",
        value: "it would be impossible for ancient humans with their limited technology to accomplish such a thing",
        valueFormatted: "it would be impossible for ancient humans with their limited technology to accomplish such a thing",
        metadata: gen.getMetadataById(gen.metadata2, "DESC")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "PIC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Picture",
        value: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/megalith.jpg",
        valueFormatted: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/megalith.jpg",
        metadata: gen.getMetadataById(gen.metadata2, "PIC")
      })];
      gen.searchResultSetItemArray2.push(oContext.sina._createSearchResultSetItem({
        attributes: [],
        dataSource: oContext.sina.getDataSource("Mysterious_Sightings"),
        titleAttributes: titleAttributes,
        detailAttributes: detailAttributes,
        titleDescriptionAttributes: [],
        defaultNavigationTarget: new NavigationTarget({
          label: "In The News: Baalbek",
          targetUrl: "http://www.sitchin.com/landplace.htm",
          target: "_blank",
          sina: oContext.sina
        })
      }));

      /*
       *
       *     'sightings' searchResultSetItem 3: Baalbek 2
       *
       *
       */

      titleAttributes = [oContext.sina._createSearchResultSetItemAttribute({
        id: "CAPTION",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Caption",
        value: "",
        valueFormatted: "",
        metadata: gen.getMetadataById(gen.metadata2, "CAPTION")
      })];
      detailAttributes = [oContext.sina._createSearchResultSetItemAttribute({
        id: "LOCATION",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Location",
        value: "Baalbek",
        valueFormatted: "Baalbek, Lebanon",
        metadata: gen.getMetadataById(gen.metadata2, "LOCATION")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "SCIENTIST",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Scientist",
        value: "Roger Murdoch",
        valueFormatted: "Roger Murdoch",
        metadata: gen.getMetadataById(gen.metadata2, "SCIENTIST")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "sightinglocation",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Temple Compex, Baalbek, Lebanon",
        value: '{ "type": "Point", "coordinates": [36.204944, 34.006899] }',
        valueFormatted: '{ "type": "Point", "coordinates": [36.204944, 34.006899] }',
        metadata: gen.getMetadataById(gen.metadata2, "LOC_4326")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "DESC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Summary",
        value: "Was the temple platorm a huge landing site for the aliens who once visited our planet?",
        valueFormatted: "Was the temple platorm a huge landing site for the aliens who once visited our planet?",
        metadata: gen.getMetadataById(gen.metadata2, "DESC")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "PIC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Picture",
        value: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/heliopolis.jpg",
        valueFormatted: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/heliopolis.jpg",
        metadata: gen.getMetadataById(gen.metadata2, "PIC")
      })];
      gen.searchResultSetItemArray2.push(oContext.sina._createSearchResultSetItem({
        attributes: [],
        dataSource: oContext.sina.getDataSource("Mysterious_Sightings"),
        titleAttributes: titleAttributes,
        detailAttributes: detailAttributes,
        titleDescriptionAttributes: [],
        defaultNavigationTarget: new NavigationTarget({
          label: "The Mystery of the Stones at Baalbek",
          targetUrl: "http://www.eridu.co.uk/Author/Mysteries_of_the_World/Baalbek/baalbek2.html",
          target: "_blank",
          sina: oContext.sina
        })
      }));

      /*
       *
       *     'sightings' searchResultSetItem 4: Wycliffe Well
       *
       *
       */

      titleAttributes = [oContext.sina._createSearchResultSetItemAttribute({
        id: "CAPTION",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Caption",
        value: "",
        valueFormatted: "",
        metadata: gen.getMetadataById(gen.metadata2, "CAPTION")
      })];
      detailAttributes = [oContext.sina._createSearchResultSetItemAttribute({
        id: "LOCATION",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Location",
        value: "Wycliffe Well",
        valueFormatted: "Wycliffe Well",
        metadata: gen.getMetadataById(gen.metadata2, "LOCATION")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "SCIENTIST",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Scientist",
        value: "Hannah White",
        valueFormatted: "Hannah White",
        metadata: gen.getMetadataById(gen.metadata2, "SCIENTIST")
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
        value: "Numerous people have reported seeing strange lights in the sky while staying a Wycliffe.",
        valueFormatted: "Numerous people have reported seeing strange lights in the sky while staying a Wycliffe.",
        metadata: gen.getMetadataById(gen.metadata2, "DESC")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "PIC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Picture",
        value: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/Wycliffe_Well.jpg",
        valueFormatted: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/Wycliffe_Well.jpg",
        metadata: gen.getMetadataById(gen.metadata2, "PIC")
      })];
      gen.searchResultSetItemArray2.push(oContext.sina._createSearchResultSetItem({
        attributes: [],
        dataSource: oContext.sina.getDataSource("Mysterious_Sightings"),
        titleAttributes: titleAttributes,
        detailAttributes: detailAttributes,
        titleDescriptionAttributes: [],
        defaultNavigationTarget: new NavigationTarget({
          label: "Wycliffe Well Australia's premier UFO hotspot",
          targetUrl: "https://www.youtube.com/watch?v=hMDRHqcatyg",
          target: "_blank",
          sina: oContext.sina
        })
      }));
      /*
       *
       *     'sightings' searchResultSetItem 5: Göbekli Tepel
       *
       *
       */

      titleAttributes = [oContext.sina._createSearchResultSetItemAttribute({
        id: "CAPTION",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Caption",
        value: "",
        valueFormatted: "",
        metadata: gen.getMetadataById(gen.metadata2, "CAPTION")
      })];
      detailAttributes = [oContext.sina._createSearchResultSetItemAttribute({
        id: "LOCATION",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Location",
        value: "Göbekli Tepe",
        valueFormatted: "Göbekli Tepe",
        metadata: gen.getMetadataById(gen.metadata2, "LOCATION")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "SCIENTIST",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Scientist",
        value: "Alan Cameron",
        valueFormatted: "Alan Cameron",
        metadata: gen.getMetadataById(gen.metadata2, "SCIENTIST")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "sightinglocation",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Göbekli Tepe, Şanlıurfa",
        value: '{ "type": "Point", "coordinates": [38.855842, 37.217718] }',
        valueFormatted: '{ "type": "Point", "coordinates": [38.855842, 37.217718] }',
        metadata: gen.getMetadataById(gen.metadata2, "LOC_4326")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "DESC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Summary",
        value: "11,000 year old stone structures that predate stonehenge by 6,000 years - crafted and arranged by prehistoric people who had not yet developed metal tools or even pottery; but no evidence that people resided there.",
        valueFormatted: "11,000 year old stone structures that predate stonehenge by 6,000 years - crafted and arranged by prehistoric people who had not yet developed metal tools or even pottery; but no evidence that people resided there.",
        metadata: gen.getMetadataById(gen.metadata2, "SCIENTIST")
      }), oContext.sina._createSearchResultSetItemAttribute({
        id: "PIC",
        valueHighlighted: "",
        isHighlighted: false,
        label: "Picture",
        value: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/Goebekli_Tepe_Urfa.jpg",
        valueFormatted: "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/images/Goebekli_Tepe_Urfa.jpg",
        metadata: gen.getMetadataById(gen.metadata2, "PIC")
      })];
      gen.searchResultSetItemArray2.push(oContext.sina._createSearchResultSetItem({
        attributes: [],
        dataSource: oContext.sina.getDataSource("Mysterious_Sightings"),
        titleAttributes: titleAttributes,
        detailAttributes: detailAttributes,
        titleDescriptionAttributes: [],
        defaultNavigationTarget: new NavigationTarget({
          label: "Gobekli Tepe: The World's First Temple?",
          targetUrl: "https://www.smithsonianmag.com/history/gobekli-tepe-the-worlds-first-temple-83613665/",
          target: "_blank",
          sina: oContext.sina
        })
      }));
    } //end if datasource etc

    return gen;
  }
  var __exports = {
    __esModule: true
  };
  __exports.createTemplate = createTemplate;
  return __exports;
});
})();