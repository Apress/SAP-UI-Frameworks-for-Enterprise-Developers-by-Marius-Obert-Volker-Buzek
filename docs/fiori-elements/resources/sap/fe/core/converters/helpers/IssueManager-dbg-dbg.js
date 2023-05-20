/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  var _exports = {};
  let IssueSeverity;
  (function (IssueSeverity) {
    IssueSeverity[IssueSeverity["High"] = 0] = "High";
    IssueSeverity[IssueSeverity["Low"] = 1] = "Low";
    IssueSeverity[IssueSeverity["Medium"] = 2] = "Medium";
  })(IssueSeverity || (IssueSeverity = {}));
  _exports.IssueSeverity = IssueSeverity;
  const IssueCategoryType = {
    Facets: {
      MissingID: "MissingID",
      UnSupportedLevel: "UnsupportedLevel"
    },
    AnnotationColumns: {
      InvalidKey: "InvalidKey"
    },
    Annotations: {
      IgnoredAnnotation: "IgnoredAnnotation"
    }
  };
  _exports.IssueCategoryType = IssueCategoryType;
  let IssueCategory;
  (function (IssueCategory) {
    IssueCategory["Annotation"] = "Annotation";
    IssueCategory["Template"] = "Template";
    IssueCategory["Manifest"] = "Manifest";
    IssueCategory["Facets"] = "Facets";
  })(IssueCategory || (IssueCategory = {}));
  _exports.IssueCategory = IssueCategory;
  const IssueType = {
    MISSING_CHART: "We couldn't find a chart annotation for the current entitySet, you should consider adding one.",
    MISSING_LINEITEM: "We couldn't find a line item annotation for the current entitySet, you should consider adding one.",
    MISSING_SELECTIONFIELD: "We couldn't find the defined selection field.",
    MALFORMED_DATAFIELD_FOR_IBN: {
      REQUIRESCONTEXT: "DataFieldForIntentBasedNavigation cannot use RequiresContext in the form or header.",
      INLINE: "DataFieldForIntentBasedNavigation cannot use Inline in the form or header.",
      DETERMINING: "DataFieldForIntentBasedNavigation cannot use Determining in the form or header."
    },
    MALFORMED_VISUALFILTERS: {
      VALUELIST: "We couldn't find the ValueList path provided in the manifest",
      PRESENTATIONVARIANT: "PresentationVariant is missing for the VisualFilters",
      CHART: "Chart is missing from the PV configured for the VisualFilters",
      VALUELISTCONFIG: "ValueList has not been configured inside the Visual Filter Settings",
      FilterRestrictions: "For VisualFilters, range expressions are not allowed"
    },
    FULLSCREENMODE_NOT_ON_LISTREPORT: "enableFullScreenMode is not supported on list report pages.",
    KPI_ISSUES: {
      KPI_NOT_FOUND: "Couldn't find KPI or SPV with qualifier ",
      KPI_DETAIL_NOT_FOUND: "Can't find proper datapoint or chart definition for KPI ",
      NO_ANALYTICS: "The following entitySet used in a KPI definition doesn't support $apply queries:",
      MAIN_PROPERTY_NOT_AGGREGATABLE: "Main property used in KPI cannot be aggregated "
    }
  };
  _exports.IssueType = IssueType;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJc3N1ZVNldmVyaXR5IiwiSXNzdWVDYXRlZ29yeVR5cGUiLCJGYWNldHMiLCJNaXNzaW5nSUQiLCJVblN1cHBvcnRlZExldmVsIiwiQW5ub3RhdGlvbkNvbHVtbnMiLCJJbnZhbGlkS2V5IiwiQW5ub3RhdGlvbnMiLCJJZ25vcmVkQW5ub3RhdGlvbiIsIklzc3VlQ2F0ZWdvcnkiLCJJc3N1ZVR5cGUiLCJNSVNTSU5HX0NIQVJUIiwiTUlTU0lOR19MSU5FSVRFTSIsIk1JU1NJTkdfU0VMRUNUSU9ORklFTEQiLCJNQUxGT1JNRURfREFUQUZJRUxEX0ZPUl9JQk4iLCJSRVFVSVJFU0NPTlRFWFQiLCJJTkxJTkUiLCJERVRFUk1JTklORyIsIk1BTEZPUk1FRF9WSVNVQUxGSUxURVJTIiwiVkFMVUVMSVNUIiwiUFJFU0VOVEFUSU9OVkFSSUFOVCIsIkNIQVJUIiwiVkFMVUVMSVNUQ09ORklHIiwiRmlsdGVyUmVzdHJpY3Rpb25zIiwiRlVMTFNDUkVFTk1PREVfTk9UX09OX0xJU1RSRVBPUlQiLCJLUElfSVNTVUVTIiwiS1BJX05PVF9GT1VORCIsIktQSV9ERVRBSUxfTk9UX0ZPVU5EIiwiTk9fQU5BTFlUSUNTIiwiTUFJTl9QUk9QRVJUWV9OT1RfQUdHUkVHQVRBQkxFIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJJc3N1ZU1hbmFnZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGVudW0gSXNzdWVTZXZlcml0eSB7XG5cdEhpZ2gsXG5cdExvdyxcblx0TWVkaXVtXG59XG5cbmV4cG9ydCBjb25zdCBJc3N1ZUNhdGVnb3J5VHlwZSA9IHtcblx0RmFjZXRzOiB7XG5cdFx0TWlzc2luZ0lEOiBcIk1pc3NpbmdJRFwiLFxuXHRcdFVuU3VwcG9ydGVkTGV2ZWw6IFwiVW5zdXBwb3J0ZWRMZXZlbFwiXG5cdH0sXG5cdEFubm90YXRpb25Db2x1bW5zOiB7XG5cdFx0SW52YWxpZEtleTogXCJJbnZhbGlkS2V5XCJcblx0fSxcblx0QW5ub3RhdGlvbnM6IHtcblx0XHRJZ25vcmVkQW5ub3RhdGlvbjogXCJJZ25vcmVkQW5ub3RhdGlvblwiXG5cdH1cbn07XG5cbmV4cG9ydCBlbnVtIElzc3VlQ2F0ZWdvcnkge1xuXHRBbm5vdGF0aW9uID0gXCJBbm5vdGF0aW9uXCIsXG5cdFRlbXBsYXRlID0gXCJUZW1wbGF0ZVwiLFxuXHRNYW5pZmVzdCA9IFwiTWFuaWZlc3RcIixcblx0RmFjZXRzID0gXCJGYWNldHNcIlxufVxuZXhwb3J0IGNvbnN0IElzc3VlVHlwZSA9IHtcblx0TUlTU0lOR19DSEFSVDogXCJXZSBjb3VsZG4ndCBmaW5kIGEgY2hhcnQgYW5ub3RhdGlvbiBmb3IgdGhlIGN1cnJlbnQgZW50aXR5U2V0LCB5b3Ugc2hvdWxkIGNvbnNpZGVyIGFkZGluZyBvbmUuXCIsXG5cdE1JU1NJTkdfTElORUlURU06IFwiV2UgY291bGRuJ3QgZmluZCBhIGxpbmUgaXRlbSBhbm5vdGF0aW9uIGZvciB0aGUgY3VycmVudCBlbnRpdHlTZXQsIHlvdSBzaG91bGQgY29uc2lkZXIgYWRkaW5nIG9uZS5cIixcblx0TUlTU0lOR19TRUxFQ1RJT05GSUVMRDogXCJXZSBjb3VsZG4ndCBmaW5kIHRoZSBkZWZpbmVkIHNlbGVjdGlvbiBmaWVsZC5cIixcblx0TUFMRk9STUVEX0RBVEFGSUVMRF9GT1JfSUJOOiB7XG5cdFx0UkVRVUlSRVNDT05URVhUOiBcIkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiBjYW5ub3QgdXNlIFJlcXVpcmVzQ29udGV4dCBpbiB0aGUgZm9ybSBvciBoZWFkZXIuXCIsXG5cdFx0SU5MSU5FOiBcIkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiBjYW5ub3QgdXNlIElubGluZSBpbiB0aGUgZm9ybSBvciBoZWFkZXIuXCIsXG5cdFx0REVURVJNSU5JTkc6IFwiRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIGNhbm5vdCB1c2UgRGV0ZXJtaW5pbmcgaW4gdGhlIGZvcm0gb3IgaGVhZGVyLlwiXG5cdH0sXG5cdE1BTEZPUk1FRF9WSVNVQUxGSUxURVJTOiB7XG5cdFx0VkFMVUVMSVNUOiBcIldlIGNvdWxkbid0IGZpbmQgdGhlIFZhbHVlTGlzdCBwYXRoIHByb3ZpZGVkIGluIHRoZSBtYW5pZmVzdFwiLFxuXHRcdFBSRVNFTlRBVElPTlZBUklBTlQ6IFwiUHJlc2VudGF0aW9uVmFyaWFudCBpcyBtaXNzaW5nIGZvciB0aGUgVmlzdWFsRmlsdGVyc1wiLFxuXHRcdENIQVJUOiBcIkNoYXJ0IGlzIG1pc3NpbmcgZnJvbSB0aGUgUFYgY29uZmlndXJlZCBmb3IgdGhlIFZpc3VhbEZpbHRlcnNcIixcblx0XHRWQUxVRUxJU1RDT05GSUc6IFwiVmFsdWVMaXN0IGhhcyBub3QgYmVlbiBjb25maWd1cmVkIGluc2lkZSB0aGUgVmlzdWFsIEZpbHRlciBTZXR0aW5nc1wiLFxuXHRcdEZpbHRlclJlc3RyaWN0aW9uczogXCJGb3IgVmlzdWFsRmlsdGVycywgcmFuZ2UgZXhwcmVzc2lvbnMgYXJlIG5vdCBhbGxvd2VkXCJcblx0fSxcblx0RlVMTFNDUkVFTk1PREVfTk9UX09OX0xJU1RSRVBPUlQ6IFwiZW5hYmxlRnVsbFNjcmVlbk1vZGUgaXMgbm90IHN1cHBvcnRlZCBvbiBsaXN0IHJlcG9ydCBwYWdlcy5cIixcblx0S1BJX0lTU1VFUzoge1xuXHRcdEtQSV9OT1RfRk9VTkQ6IFwiQ291bGRuJ3QgZmluZCBLUEkgb3IgU1BWIHdpdGggcXVhbGlmaWVyIFwiLFxuXHRcdEtQSV9ERVRBSUxfTk9UX0ZPVU5EOiBcIkNhbid0IGZpbmQgcHJvcGVyIGRhdGFwb2ludCBvciBjaGFydCBkZWZpbml0aW9uIGZvciBLUEkgXCIsXG5cdFx0Tk9fQU5BTFlUSUNTOiBcIlRoZSBmb2xsb3dpbmcgZW50aXR5U2V0IHVzZWQgaW4gYSBLUEkgZGVmaW5pdGlvbiBkb2Vzbid0IHN1cHBvcnQgJGFwcGx5IHF1ZXJpZXM6XCIsXG5cdFx0TUFJTl9QUk9QRVJUWV9OT1RfQUdHUkVHQVRBQkxFOiBcIk1haW4gcHJvcGVydHkgdXNlZCBpbiBLUEkgY2Fubm90IGJlIGFnZ3JlZ2F0ZWQgXCJcblx0fVxufTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7TUFBWUEsYUFBYTtFQUFBLFdBQWJBLGFBQWE7SUFBYkEsYUFBYSxDQUFiQSxhQUFhO0lBQWJBLGFBQWEsQ0FBYkEsYUFBYTtJQUFiQSxhQUFhLENBQWJBLGFBQWE7RUFBQSxHQUFiQSxhQUFhLEtBQWJBLGFBQWE7RUFBQTtFQU1sQixNQUFNQyxpQkFBaUIsR0FBRztJQUNoQ0MsTUFBTSxFQUFFO01BQ1BDLFNBQVMsRUFBRSxXQUFXO01BQ3RCQyxnQkFBZ0IsRUFBRTtJQUNuQixDQUFDO0lBQ0RDLGlCQUFpQixFQUFFO01BQ2xCQyxVQUFVLEVBQUU7SUFDYixDQUFDO0lBQ0RDLFdBQVcsRUFBRTtNQUNaQyxpQkFBaUIsRUFBRTtJQUNwQjtFQUNELENBQUM7RUFBQztFQUFBLElBRVVDLGFBQWE7RUFBQSxXQUFiQSxhQUFhO0lBQWJBLGFBQWE7SUFBYkEsYUFBYTtJQUFiQSxhQUFhO0lBQWJBLGFBQWE7RUFBQSxHQUFiQSxhQUFhLEtBQWJBLGFBQWE7RUFBQTtFQU1sQixNQUFNQyxTQUFTLEdBQUc7SUFDeEJDLGFBQWEsRUFBRSxnR0FBZ0c7SUFDL0dDLGdCQUFnQixFQUFFLG9HQUFvRztJQUN0SEMsc0JBQXNCLEVBQUUsK0NBQStDO0lBQ3ZFQywyQkFBMkIsRUFBRTtNQUM1QkMsZUFBZSxFQUFFLHFGQUFxRjtNQUN0R0MsTUFBTSxFQUFFLDRFQUE0RTtNQUNwRkMsV0FBVyxFQUFFO0lBQ2QsQ0FBQztJQUNEQyx1QkFBdUIsRUFBRTtNQUN4QkMsU0FBUyxFQUFFLDhEQUE4RDtNQUN6RUMsbUJBQW1CLEVBQUUsc0RBQXNEO01BQzNFQyxLQUFLLEVBQUUsK0RBQStEO01BQ3RFQyxlQUFlLEVBQUUscUVBQXFFO01BQ3RGQyxrQkFBa0IsRUFBRTtJQUNyQixDQUFDO0lBQ0RDLGdDQUFnQyxFQUFFLDZEQUE2RDtJQUMvRkMsVUFBVSxFQUFFO01BQ1hDLGFBQWEsRUFBRSwwQ0FBMEM7TUFDekRDLG9CQUFvQixFQUFFLDBEQUEwRDtNQUNoRkMsWUFBWSxFQUFFLGtGQUFrRjtNQUNoR0MsOEJBQThCLEVBQUU7SUFDakM7RUFDRCxDQUFDO0VBQUM7RUFBQTtBQUFBIn0=