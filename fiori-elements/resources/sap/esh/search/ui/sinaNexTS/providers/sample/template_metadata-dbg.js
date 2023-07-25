/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../sina/AttributeFormatType"], function (____sina_AttributeFormatType) {
  var AttributeFormatType = ____sina_AttributeFormatType["AttributeFormatType"];
  function createTemplateMetadata(oContext) {
    var res = {
      /*
          folklorists
      */
      metadata: [oContext.sina._createAttributeMetadata({
        id: "FOLKLORIST",
        label: "Folklorist",
        type: oContext.sina.AttributeType.String,
        usage: {
          Title: {},
          AdvancedSearch: {
            displayOrder: 0
          },
          // necessary to open show-more dialog
          Facet: {}
        },
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "LOCATION",
        label: "Location",
        // ToDo: has no effect??
        type: oContext.sina.AttributeType.String,
        usage: {
          Detail: {},
          AdvancedSearch: {
            displayOrder: 0
          },
          // necessary to open sho-wmore dialog
          Facet: {}
        },
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "WEBSITE",
        label: "Website",
        // ToDo: has no effect??
        type: oContext.sina.AttributeType.String,
        usage: {
          Detail: {},
          AdvancedSearch: {
            displayOrder: 0
          } // necessary to open show-more dialog
        },

        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "SUMMARY",
        label: "Summary",
        // ToDo: has no effect??
        // dataType: oContext.sina.AttributeType.Longtext,
        type: oContext.sina.AttributeType.String,
        format: oContext.sina.AttributeFormatType.LongText,
        usage: {
          Detail: {},
          AdvancedSearch: {
            displayOrder: 0
          } // necessary to open show-more dialog
        },

        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "LOC_4326",
        label: "LOC_4326",
        // ToDo: has no effect??
        // dataType: oContext.sina.AttributeType.GeoJson,
        type: oContext.sina.AttributeType.GeoJson,
        usage: {},
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "SEX",
        label: "Sex",
        type: oContext.sina.AttributeType.String,
        usage: {
          Title: {},
          AdvancedSearch: {
            displayOrder: 0
          },
          // necessary to open show-more dialog
          Facet: {}
        },
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "SEX_DESC",
        label: "Description for Gender",
        type: oContext.sina.AttributeType.String,
        usage: {
          Title: {},
          AdvancedSearch: {
            displayOrder: 0
          },
          // necessary to open show-more dialog
          Facet: {}
        },
        isSortable: false,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "DISCIPLINE",
        label: "Discipline",
        type: oContext.sina.AttributeType.String,
        usage: {
          Detail: {}
        },
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "DESC",
        label: "Descritption",
        type: oContext.sina.AttributeType.String,
        usage: {
          Detail: {}
        },
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "PIC",
        label: "picture",
        type: oContext.sina.AttributeType.ImageUrl,
        usage: {
          Title: {}
        },
        format: AttributeFormatType.Round,
        isSortable: false,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "SALARY",
        label: "Salary",
        type: oContext.sina.AttributeType.Integer,
        usage: {
          Title: {},
          AdvancedSearch: {
            displayOrder: 0
          },
          // necessary to open show-more dialog
          Facet: {}
        },
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "CURRENCY",
        label: "Currency",
        type: oContext.sina.AttributeType.String,
        usage: {
          Detail: {}
        },
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "HEIGHT",
        label: "Height",
        type: oContext.sina.AttributeType.Integer,
        usage: {
          Detail: {}
        },
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "UOM_HEIGHT",
        label: "Unit of Measure for Height Attribute",
        type: oContext.sina.AttributeType.String,
        usage: {
          Detail: {}
        },
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "PHONE",
        label: "Phone",
        type: oContext.sina.AttributeType.String,
        usage: {
          Detail: {}
        },
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "PUB",
        label: "Publication",
        type: oContext.sina.AttributeType.ImageUrl,
        format: oContext.sina.AttributeFormatType.DocumentThumbnail,
        usage: {
          Title: {},
          AdvancedSearch: {
            displayOrder: 0
          } // necessary to open show-more dialog
        },

        isSortable: false,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "EMAIL",
        label: "Email",
        type: oContext.sina.AttributeType.String,
        usage: {
          Detail: {}
        },
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      })],
      /*
          legends
      */
      metadata2: [oContext.sina._createAttributeMetadata({
        id: "CAPTION",
        label: "Caption",
        type: oContext.sina.AttributeType.String,
        usage: {
          Title: {}
        },
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
          // necessary to open show-more dialog
          Facet: {}
        },
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "LOC_4326",
        label: "LOC_4326",
        // ToDo: has no effect??
        // dataType: oContext.sina.AttributeType.GeoJson,
        type: oContext.sina.AttributeType.GeoJson,
        usage: {
          Detail: {
            displayOrder: 1
          }
        },
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "FOLKLORIST",
        label: "Folklorist",
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
        format: oContext.sina.AttributeFormatType.LongText,
        usage: {
          Detail: {}
        },
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "PIC",
        label: "picture",
        type: oContext.sina.AttributeType.ImageUrl,
        usage: {
          Title: {}
        },
        isSortable: false,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "URL",
        label: "URL",
        type: oContext.sina.AttributeType.String,
        usage: {
          Detail: {}
        },
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      })],
      /*
          publications
      */
      metadata3: [oContext.sina._createAttributeMetadata({
        id: "PUB",
        label: "Publication",
        type: oContext.sina.AttributeType.ImageUrl,
        format: oContext.sina.AttributeFormatType.DocumentThumbnail,
        usage: {
          Title: {},
          AdvancedSearch: {
            displayOrder: 0
          } // necessary to open show-more dialog
        },

        isSortable: false,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "FOLKLORIST",
        label: "Folklorist",
        type: oContext.sina.AttributeType.String,
        usage: {
          Detail: {},
          AdvancedSearch: {
            displayOrder: 0
          },
          // necessary to open show-more dialog
          Facet: {}
        },
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      }), oContext.sina._createAttributeMetadata({
        id: "DESC",
        label: "Description",
        type: oContext.sina.AttributeType.String,
        format: oContext.sina.AttributeFormatType.LongText,
        usage: {
          Detail: {}
        },
        isSortable: true,
        isKey: false,
        matchingStrategy: oContext.sina.MatchingStrategy.Exact
      })]
    };
    return res;
  }
  var __exports = {
    __esModule: true
  };
  __exports.createTemplateMetadata = createTemplateMetadata;
  return __exports;
});
})();