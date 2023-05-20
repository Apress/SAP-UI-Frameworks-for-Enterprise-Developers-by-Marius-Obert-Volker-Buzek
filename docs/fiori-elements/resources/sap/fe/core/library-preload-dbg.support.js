//@ui5-bundle sap/fe/core/library-preload.support.js
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/core/library.support", ["./support/AnnotationIssue.support", "./support/CollectionFacetMissingID.support", "./support/CollectionFacetUnsupportedLevel.support", "./support/InvalidAnnotationColumnKey.support"], function (AnnotationIssue, CollectionFacetMissingID, CollectionFacetUnsupportedLevel, InvalidAnnotationColumnKey) {
  "use strict";

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  sap.ui.support.SystemPresets.FeV4 = {
    id: "FioriElementsV4",
    title: "Fiori Elements V4",
    description: "Fiori Elements V4 rules",
    selections: [{
      ruleId: "annotationIssue",
      libName: "sap.fe.core"
    }]
  };
  /**
   * Adds support rules of the sap.fe.core library to the support infrastructure.
   */
  return {
    name: "sap.fe.core",
    niceName: "SAP.FE V4 - Core library",
    ruleset: [AnnotationIssue.getRules(), CollectionFacetMissingID.getRules(), CollectionFacetUnsupportedLevel.getRules(), InvalidAnnotationColumnKey.getRules()]
  };
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/core/support/AnnotationIssue.support", ["sap/fe/core/converters/helpers/IssueManager", "sap/fe/core/support/CommonHelper"], function (IssueManager, CommonHelper) {
  "use strict";

  var _exports = {};
  var getIssueByCategory = CommonHelper.getIssueByCategory;
  var Categories = CommonHelper.Categories;
  var Audiences = CommonHelper.Audiences;
  var IssueCategory = IssueManager.IssueCategory;
  const oIncorrectPathAnnotationIssue = {
    id: "annotationIssue",
    title: "Annotations: Incorrect path or target",
    minversion: "1.85",
    audiences: [Audiences.Application],
    categories: [Categories.Usage],
    description: "This rule identifies the incorrect path or targets defined in the metadata of the annotation.xml file or CDS annotations.",
    resolution: "Please review the message details for more information.",
    resolutionurls: [{
      text: "CDS Annotations reference",
      href: "https://cap.cloud.sap/docs/cds/common"
    }],
    check: function (oIssueManager, oCoreFacade) {
      getIssueByCategory(oIssueManager, oCoreFacade, IssueCategory.Annotation);
    }
  };
  const oIgnoredComputedDVAnnotationIssue = {
    id: "ignoredAnnotationIssue",
    title: "Annotations: Ignore Annotation",
    minversion: "1.99",
    audiences: [Audiences.Application],
    categories: [Categories.Usage],
    description: "This rule identifies the ignored annotations",
    resolution: "Only one annotation from either Core.Computed or ComputedDefaultValue must be used",
    check: function (oIssueManager, oCoreFacade) {
      getIssueByCategory(oIssueManager, oCoreFacade, IssueCategory.Annotation, "IgnoredAnnotation");
    }
  };
  function getRules() {
    return [oIncorrectPathAnnotationIssue, oIgnoredComputedDVAnnotationIssue];
  }
  _exports.getRules = getRules;
  return _exports;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/core/support/CollectionFacetMissingID.support", ["sap/fe/core/converters/helpers/IssueManager", "sap/fe/core/support/CommonHelper"], function (IssueManager, CommonHelper) {
  "use strict";

  var _exports = {};
  var getIssueByCategory = CommonHelper.getIssueByCategory;
  var Categories = CommonHelper.Categories;
  var Audiences = CommonHelper.Audiences;
  var IssueCategory = IssueManager.IssueCategory;
  const oCollectionFacetMissingIDIssue = {
    id: "collectionFacetMissingId",
    title: "CollectionFacet: Missing IDs",
    minversion: "1.85",
    audiences: [Audiences.Application],
    categories: [Categories.Usage],
    description: "A collection facet requires an ID in the annotation file to derive a control ID from it.",
    resolution: "Always provide a unique ID to a collection facet.",
    resolutionurls: [{
      text: "CollectionFacets",
      href: "https://ui5.sap.com/#/topic/facfea09018d4376acaceddb7e3f03b6"
    }],
    check: function (oIssueManager, oCoreFacade) {
      getIssueByCategory(oIssueManager, oCoreFacade, IssueCategory.Facets, "MissingID");
    }
  };
  function getRules() {
    return [oCollectionFacetMissingIDIssue];
  }
  _exports.getRules = getRules;
  return _exports;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/core/support/CollectionFacetUnsupportedLevel.support", ["sap/fe/core/converters/helpers/IssueManager", "sap/fe/core/support/CommonHelper"], function (IssueManager, CommonHelper) {
  "use strict";

  var _exports = {};
  var getIssueByCategory = CommonHelper.getIssueByCategory;
  var Categories = CommonHelper.Categories;
  var Audiences = CommonHelper.Audiences;
  var IssueCategory = IssueManager.IssueCategory;
  const oCollectionFacetUnsupportedLevelIssue = {
    id: "collectionFacetUnsupportedLevel",
    title: "CollectionFacet: Unsupported Levels",
    minversion: "1.80",
    audiences: [Audiences.Application],
    categories: [Categories.Usage],
    description: "Collection facets at level 3 or lower (level 4, 5…) are not supported and will not be visible on the UI.",
    resolution: "At level 3 you can only use reference facets, but not collection facets.",
    resolutionurls: [{
      text: "CollectionFacets",
      href: "https://ui5.sap.com/#/topic/facfea09018d4376acaceddb7e3f03b6"
    }],
    check: function (oIssueManager, oCoreFacade) {
      getIssueByCategory(oIssueManager, oCoreFacade, IssueCategory.Facets, "UnsupportedLevel");
    }
  };
  function getRules() {
    return [oCollectionFacetUnsupportedLevelIssue];
  }
  _exports.getRules = getRules;
  return _exports;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/core/support/InvalidAnnotationColumnKey.support", ["sap/fe/core/converters/helpers/IssueManager", "sap/fe/core/support/CommonHelper"], function (IssueManager, CommonHelper) {
  "use strict";

  var _exports = {};
  var getIssueByCategory = CommonHelper.getIssueByCategory;
  var Categories = CommonHelper.Categories;
  var Audiences = CommonHelper.Audiences;
  var IssueCategory = IssueManager.IssueCategory;
  const oInvalidAnnotationColumnKey = {
    id: "invalidAnnotationColumnKey",
    title: "AnnotationColumnKey: Invalid Key",
    minversion: "1.98",
    audiences: [Audiences.Application],
    categories: [Categories.Usage],
    description: "The key of the annotation column is needed as a valid identifier in the application manifest.",
    resolution: "A column key set in the application manifest must correspond to an existing annotation column.",
    resolutionurls: [{
      text: "InvalidAnnotationColumnKey",
      href: "https://ui5.sap.com/#/topic/d525522c1bf54672ae4e02d66b38e60c"
    }],
    check: function (oIssueManager, oCoreFacade) {
      getIssueByCategory(oIssueManager, oCoreFacade, IssueCategory.Manifest, "InvalidKey");
    }
  };
  function getRules() {
    return [oInvalidAnnotationColumnKey];
  }
  _exports.getRules = getRules;
  return _exports;
}, false);
//# sourceMappingURL=library-preload.support.js.map
