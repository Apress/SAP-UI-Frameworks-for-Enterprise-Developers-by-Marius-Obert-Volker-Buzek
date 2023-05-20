/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/converters/controls/Common/Action", "sap/fe/core/converters/controls/ObjectPage/HeaderFacet", "sap/fe/core/converters/helpers/IssueManager", "sap/fe/core/converters/helpers/Key", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/TypeGuards", "../../annotations/DataField", "../../helpers/ConfigurableObject", "../../helpers/ID", "../../ManifestSettings", "../../objectPage/FormMenuActions", "../Common/DataVisualization", "../Common/Form"], function (Log, Action, HeaderFacet, IssueManager, Key, BindingToolkit, TypeGuards, DataField, ConfigurableObject, ID, ManifestSettings, FormMenuActions, DataVisualization, Form) {
  "use strict";

  var _exports = {};
  var isReferenceFacet = Form.isReferenceFacet;
  var createFormDefinition = Form.createFormDefinition;
  var getDataVisualizationConfiguration = DataVisualization.getDataVisualizationConfiguration;
  var getVisibilityEnablementFormMenuActions = FormMenuActions.getVisibilityEnablementFormMenuActions;
  var getFormHiddenActions = FormMenuActions.getFormHiddenActions;
  var getFormActions = FormMenuActions.getFormActions;
  var ActionType = ManifestSettings.ActionType;
  var getSubSectionID = ID.getSubSectionID;
  var getSideContentID = ID.getSideContentID;
  var getFormID = ID.getFormID;
  var getCustomSubSectionID = ID.getCustomSubSectionID;
  var Placement = ConfigurableObject.Placement;
  var OverrideType = ConfigurableObject.OverrideType;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var isActionWithDialog = DataField.isActionWithDialog;
  var isPathAnnotationExpression = TypeGuards.isPathAnnotationExpression;
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var ref = BindingToolkit.ref;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var notEqual = BindingToolkit.notEqual;
  var not = BindingToolkit.not;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var fn = BindingToolkit.fn;
  var equal = BindingToolkit.equal;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var KeyHelper = Key.KeyHelper;
  var IssueType = IssueManager.IssueType;
  var IssueSeverity = IssueManager.IssueSeverity;
  var IssueCategory = IssueManager.IssueCategory;
  var getStashedSettingsForHeaderFacet = HeaderFacet.getStashedSettingsForHeaderFacet;
  var getHeaderFacetsFromManifest = HeaderFacet.getHeaderFacetsFromManifest;
  var getDesignTimeMetadataSettingsForHeaderFacet = HeaderFacet.getDesignTimeMetadataSettingsForHeaderFacet;
  var removeDuplicateActions = Action.removeDuplicateActions;
  var isActionNavigable = Action.isActionNavigable;
  var getSemanticObjectMapping = Action.getSemanticObjectMapping;
  var getEnabledForAnnotationAction = Action.getEnabledForAnnotationAction;
  var getActionsFromManifest = Action.getActionsFromManifest;
  var ButtonType = Action.ButtonType;
  let SubSectionType;
  (function (SubSectionType) {
    SubSectionType["Unknown"] = "Unknown";
    SubSectionType["Form"] = "Form";
    SubSectionType["DataVisualization"] = "DataVisualization";
    SubSectionType["XMLFragment"] = "XMLFragment";
    SubSectionType["Placeholder"] = "Placeholder";
    SubSectionType["Mixed"] = "Mixed";
    SubSectionType["EmbeddedComponent"] = "EmbeddedComponent";
  })(SubSectionType || (SubSectionType = {}));
  _exports.SubSectionType = SubSectionType;
  const visualizationTerms = ["com.sap.vocabularies.UI.v1.LineItem", "com.sap.vocabularies.UI.v1.Chart", "com.sap.vocabularies.UI.v1.PresentationVariant", "com.sap.vocabularies.UI.v1.SelectionPresentationVariant"];

  /**
   * Create subsections based on facet definition.
   *
   * @param facetCollection Collection of facets
   * @param converterContext The converter context
   * @param isHeaderSection True if header section is generated in this iteration
   * @returns The current subsections
   */
  function createSubSections(facetCollection, converterContext, isHeaderSection) {
    // First we determine which sub section we need to create
    const facetsToCreate = facetCollection.reduce((facetsToCreate, facetDefinition) => {
      switch (facetDefinition.$Type) {
        case "com.sap.vocabularies.UI.v1.ReferenceFacet":
          facetsToCreate.push(facetDefinition);
          break;
        case "com.sap.vocabularies.UI.v1.CollectionFacet":
          // TODO If the Collection Facet has a child of type Collection Facet we bring them up one level (Form + Table use case) ?
          // first case facet Collection is combination of collection and reference facet or not all facets are reference facets.
          if (facetDefinition.Facets.find(facetType => facetType.$Type === "com.sap.vocabularies.UI.v1.CollectionFacet")) {
            facetsToCreate.splice(facetsToCreate.length, 0, ...facetDefinition.Facets);
          } else {
            facetsToCreate.push(facetDefinition);
          }
          break;
        case "com.sap.vocabularies.UI.v1.ReferenceURLFacet":
          // Not supported
          break;
      }
      return facetsToCreate;
    }, []);

    // Then we create the actual subsections
    return facetsToCreate.map(facet => {
      var _Facets;
      return createSubSection(facet, facetsToCreate, converterContext, 0, !(facet !== null && facet !== void 0 && (_Facets = facet.Facets) !== null && _Facets !== void 0 && _Facets.length), isHeaderSection);
    });
  }

  /**
   * Creates subsections based on the definition of the custom header facet.
   *
   * @param converterContext The converter context
   * @returns The current subsections
   */
  _exports.createSubSections = createSubSections;
  function createCustomHeaderFacetSubSections(converterContext) {
    const customHeaderFacets = getHeaderFacetsFromManifest(converterContext.getManifestWrapper().getHeaderFacets());
    const aCustomHeaderFacets = [];
    Object.keys(customHeaderFacets).forEach(function (key) {
      aCustomHeaderFacets.push(customHeaderFacets[key]);
      return aCustomHeaderFacets;
    });
    const facetsToCreate = aCustomHeaderFacets.reduce((facetsToCreate, customHeaderFacet) => {
      if (customHeaderFacet.templateEdit) {
        facetsToCreate.push(customHeaderFacet);
      }
      return facetsToCreate;
    }, []);
    return facetsToCreate.map(customHeaderFacet => createCustomHeaderFacetSubSection(customHeaderFacet));
  }

  /**
   * Creates a subsection based on a custom header facet.
   *
   * @param customHeaderFacet A custom header facet
   * @returns A definition for a subsection
   */
  _exports.createCustomHeaderFacetSubSections = createCustomHeaderFacetSubSections;
  function createCustomHeaderFacetSubSection(customHeaderFacet) {
    const subSectionID = getCustomSubSectionID(customHeaderFacet.key);
    const subSection = {
      id: subSectionID,
      key: customHeaderFacet.key,
      title: customHeaderFacet.title,
      type: SubSectionType.XMLFragment,
      template: customHeaderFacet.templateEdit || "",
      visible: customHeaderFacet.visible,
      level: 1,
      sideContent: undefined,
      stashed: customHeaderFacet.stashed,
      flexSettings: customHeaderFacet.flexSettings,
      actions: {},
      objectPageLazyLoaderEnabled: false
    };
    return subSection;
  }

  // function isTargetForCompliant(annotationPath: AnnotationPath) {
  // 	return /.*com\.sap\.vocabularies\.UI\.v1\.(FieldGroup|Identification|DataPoint|StatusInfo).*/.test(annotationPath.value);
  // }
  const getSubSectionKey = (facetDefinition, fallback) => {
    var _facetDefinition$ID, _facetDefinition$Labe;
    return ((_facetDefinition$ID = facetDefinition.ID) === null || _facetDefinition$ID === void 0 ? void 0 : _facetDefinition$ID.toString()) || ((_facetDefinition$Labe = facetDefinition.Label) === null || _facetDefinition$Labe === void 0 ? void 0 : _facetDefinition$Labe.toString()) || fallback;
  };
  /**
   * Adds Form menu action to all form actions, removes duplicate actions and hidden actions.
   *
   * @param actions The actions involved
   * @param facetDefinition The definition for the facet
   * @param converterContext The converter context
   * @returns The form menu actions
   */
  function addFormMenuActions(actions, facetDefinition, converterContext) {
    const hiddenActions = getFormHiddenActions(facetDefinition, converterContext) || [],
      formActions = getFormActions(facetDefinition, converterContext),
      manifestActions = getActionsFromManifest(formActions, converterContext, actions, undefined, undefined, hiddenActions),
      actionOverwriteConfig = {
        enabled: OverrideType.overwrite,
        visible: OverrideType.overwrite,
        command: OverrideType.overwrite
      },
      formAllActions = insertCustomElements(actions, manifestActions.actions, actionOverwriteConfig);
    return {
      actions: formAllActions ? getVisibilityEnablementFormMenuActions(removeDuplicateActions(formAllActions)) : actions,
      commandActions: manifestActions.commandActions
    };
  }

  /**
   * Retrieves the action form a facet.
   *
   * @param facetDefinition
   * @param converterContext
   * @returns The current facet actions
   */
  function getFacetActions(facetDefinition, converterContext) {
    let actions = [];
    switch (facetDefinition.$Type) {
      case "com.sap.vocabularies.UI.v1.CollectionFacet":
        actions = facetDefinition.Facets.filter(subFacetDefinition => isReferenceFacet(subFacetDefinition)).reduce((actionReducer, referenceFacet) => createFormActionReducer(actionReducer, referenceFacet, converterContext), []);
        break;
      case "com.sap.vocabularies.UI.v1.ReferenceFacet":
        actions = createFormActionReducer([], facetDefinition, converterContext);
        break;
      default:
        break;
    }
    return addFormMenuActions(actions, facetDefinition, converterContext);
  }
  /**
   * Returns the button type based on @UI.Emphasized annotation.
   *
   * @param emphasized Emphasized annotation value.
   * @returns The button type or path based expression.
   */
  function getButtonType(emphasized) {
    // Emphasized is a boolean so if it's equal to true we show the button as Ghost, otherwise as Transparent
    const buttonTypeCondition = equal(getExpressionFromAnnotation(emphasized), true);
    return compileExpression(ifElse(buttonTypeCondition, ButtonType.Ghost, ButtonType.Transparent));
  }

  /**
   * Create a subsection based on FacetTypes.
   *
   * @param facetDefinition
   * @param facetsToCreate
   * @param converterContext
   * @param level
   * @param hasSingleContent
   * @param isHeaderSection
   * @returns A subsection definition
   */
  function createSubSection(facetDefinition, facetsToCreate, converterContext, level, hasSingleContent, isHeaderSection) {
    var _facetDefinition$anno, _facetDefinition$anno2, _presentation$visuali, _presentation$visuali2, _presentation$visuali3, _facetDefinition$anno3, _facetDefinition$anno4, _facetDefinition$anno5;
    const subSectionID = getSubSectionID(facetDefinition);
    const oHiddenAnnotation = (_facetDefinition$anno = facetDefinition.annotations) === null || _facetDefinition$anno === void 0 ? void 0 : (_facetDefinition$anno2 = _facetDefinition$anno.UI) === null || _facetDefinition$anno2 === void 0 ? void 0 : _facetDefinition$anno2.Hidden;
    const isVisibleExpression = not(equal(true, getExpressionFromAnnotation(oHiddenAnnotation)));
    const isVisible = compileExpression(isVisibleExpression);
    const isDynamicExpression = isVisible !== undefined && typeof isVisible === "string" && isVisible.indexOf("{=") === 0 && !isPathAnnotationExpression(oHiddenAnnotation);
    const isVisibleDynamicExpression = isVisible && isDynamicExpression ? isVisible.substring(isVisible.indexOf("{=") + 2, isVisible.lastIndexOf("}")) !== undefined : false;
    const title = compileExpression(getExpressionFromAnnotation(facetDefinition.Label));
    const subSection = {
      id: subSectionID,
      key: getSubSectionKey(facetDefinition, subSectionID),
      title: title,
      type: SubSectionType.Unknown,
      annotationPath: converterContext.getEntitySetBasedAnnotationPath(facetDefinition.fullyQualifiedName),
      visible: isVisible,
      isVisibilityDynamic: isDynamicExpression,
      level: level,
      sideContent: undefined,
      objectPageLazyLoaderEnabled: converterContext.getManifestWrapper().getEnableLazyLoading()
    };
    if (isHeaderSection) {
      subSection.stashed = getStashedSettingsForHeaderFacet(facetDefinition, facetDefinition, converterContext);
      subSection.flexSettings = {
        designtime: getDesignTimeMetadataSettingsForHeaderFacet(facetDefinition, facetDefinition, converterContext)
      };
    }
    let unsupportedText = "";
    level++;
    switch (facetDefinition.$Type) {
      case "com.sap.vocabularies.UI.v1.CollectionFacet":
        const facets = facetDefinition.Facets;

        // Filter for all facets of this subsection that are referring to an annotation describing a visualization (e.g. table or chart)
        const visualizationFacets = facets.map((facet, index) => ({
          index,
          facet
        })) // Remember the index assigned to each facet
        .filter(_ref => {
          var _Target, _Target$$target;
          let {
            facet
          } = _ref;
          return visualizationTerms.includes((_Target = facet.Target) === null || _Target === void 0 ? void 0 : (_Target$$target = _Target.$target) === null || _Target$$target === void 0 ? void 0 : _Target$$target.term);
        });

        // Filter out all visualization facets; "visualizationFacets" and "nonVisualizationFacets" are disjoint
        const nonVisualizationFacets = facets.filter(facet => !visualizationFacets.find(visualization => visualization.facet === facet));
        if (visualizationFacets.length > 0) {
          // CollectionFacets with visualizations must be handled separately as they cannot be included in forms
          const visualizationContent = [];
          const formContent = [];
          const mixedContent = [];

          // Create each visualization facet as if it was its own subsection (via recursion), and keep their relative ordering
          for (const {
            facet
          } of visualizationFacets) {
            visualizationContent.push(createSubSection(facet, [], converterContext, level, true, isHeaderSection));
          }
          if (nonVisualizationFacets.length > 0) {
            // This subsection includes visualizations and other content, so it is a "Mixed" subsection
            Log.warning(`Warning: CollectionFacet '${facetDefinition.ID}' includes a combination of either a chart or a table and other content. This can lead to rendering issues. Consider moving the chart or table into a separate CollectionFacet.`);
            const fakeFormFacet = {
              ...facetDefinition
            };
            fakeFormFacet.Facets = nonVisualizationFacets;
            // Create a joined form of all facets that are not referring to visualizations
            formContent.push(createSubSection(fakeFormFacet, [], converterContext, level, hasSingleContent, isHeaderSection));
          }

          // Merge the visualization content with the form content
          if (visualizationFacets.find(_ref2 => {
            let {
              index
            } = _ref2;
            return index === 0;
          })) {
            // If the first facet is a visualization, display the visualizations first
            mixedContent.push(...visualizationContent);
            mixedContent.push(...formContent);
          } else {
            // Otherwise, display the form first
            mixedContent.push(...formContent);
            mixedContent.push(...visualizationContent);
          }
          const mixedSubSection = {
            ...subSection,
            type: SubSectionType.Mixed,
            level: level,
            content: mixedContent
          };
          return mixedSubSection;
        } else {
          // This CollectionFacet only includes content that can be rendered in a merged form
          const facetActions = getFacetActions(facetDefinition, converterContext),
            formCollectionSubSection = {
              ...subSection,
              type: SubSectionType.Form,
              formDefinition: createFormDefinition(facetDefinition, isVisible, converterContext, facetActions.actions),
              level: level,
              actions: facetActions.actions.filter(action => action.facetName === undefined),
              commandActions: facetActions.commandActions
            };
          return formCollectionSubSection;
        }
      case "com.sap.vocabularies.UI.v1.ReferenceFacet":
        if (!facetDefinition.Target.$target) {
          unsupportedText = `Unable to find annotationPath ${facetDefinition.Target.value}`;
        } else {
          switch (facetDefinition.Target.$target.term) {
            case "com.sap.vocabularies.UI.v1.LineItem":
            case "com.sap.vocabularies.UI.v1.Chart":
            case "com.sap.vocabularies.UI.v1.PresentationVariant":
            case "com.sap.vocabularies.UI.v1.SelectionPresentationVariant":
              const presentation = getDataVisualizationConfiguration(facetDefinition.Target.value, getCondensedTableLayoutCompliance(facetDefinition, facetsToCreate, converterContext), converterContext, undefined, isHeaderSection);
              const subSectionTitle = subSection.title ? subSection.title : "";
              const controlTitle = ((_presentation$visuali = presentation.visualizations[0]) === null || _presentation$visuali === void 0 ? void 0 : (_presentation$visuali2 = _presentation$visuali.annotation) === null || _presentation$visuali2 === void 0 ? void 0 : _presentation$visuali2.title) || ((_presentation$visuali3 = presentation.visualizations[0]) === null || _presentation$visuali3 === void 0 ? void 0 : _presentation$visuali3.title);
              const isPartOfPreview = ((_facetDefinition$anno3 = facetDefinition.annotations) === null || _facetDefinition$anno3 === void 0 ? void 0 : (_facetDefinition$anno4 = _facetDefinition$anno3.UI) === null || _facetDefinition$anno4 === void 0 ? void 0 : (_facetDefinition$anno5 = _facetDefinition$anno4.PartOfPreview) === null || _facetDefinition$anno5 === void 0 ? void 0 : _facetDefinition$anno5.valueOf()) !== false;
              const showTitle = getTitleVisibility(controlTitle ?? "", subSectionTitle, hasSingleContent);

              // Either calculate the title visibility statically or dynamically
              // Additionally to checking whether a title exists,
              // we also need to check that the facet title is not the same as the control (i.e. visualization) title;
              // this is done by including "showTitle" in the and expression
              const titleVisible = ifElse(isDynamicExpression, and(isVisibleDynamicExpression, not(equal(title, "undefined")), showTitle), and(isVisible !== undefined, title !== "undefined", title !== undefined, isVisibleExpression, showTitle));
              const dataVisualizationSubSection = {
                ...subSection,
                type: SubSectionType.DataVisualization,
                level: level,
                presentation: presentation,
                showTitle: compileExpression(showTitle),
                // This is used on the ObjectPageSubSection
                isPartOfPreview,
                titleVisible: compileExpression(titleVisible) // This is used to hide the actual Title control
              };

              return dataVisualizationSubSection;
            case "com.sap.vocabularies.UI.v1.FieldGroup":
            case "com.sap.vocabularies.UI.v1.Identification":
            case "com.sap.vocabularies.UI.v1.DataPoint":
            case "com.sap.vocabularies.UI.v1.StatusInfo":
            case "com.sap.vocabularies.Communication.v1.Contact":
              // All those element belong to a from facet
              const facetActions = getFacetActions(facetDefinition, converterContext),
                formElementSubSection = {
                  ...subSection,
                  type: SubSectionType.Form,
                  level: level,
                  formDefinition: createFormDefinition(facetDefinition, isVisible, converterContext, facetActions.actions),
                  actions: facetActions.actions.filter(action => action.facetName === undefined),
                  commandActions: facetActions.commandActions
                };
              return formElementSubSection;
            default:
              unsupportedText = `For ${facetDefinition.Target.$target.term} Fragment`;
              break;
          }
        }
        break;
      case "com.sap.vocabularies.UI.v1.ReferenceURLFacet":
        unsupportedText = "For Reference URL Facet";
        break;
      default:
        break;
    }
    // If we reach here we ended up with an unsupported SubSection type
    const unsupportedSubSection = {
      ...subSection,
      text: unsupportedText
    };
    return unsupportedSubSection;
  }

  /**
   * Checks whether to hide or show subsection title.
   *
   * @param controlTitle
   * @param subSectionTitle
   * @param hasSingleContent
   * @returns Boolean value or expression for showTitle
   */
  _exports.createSubSection = createSubSection;
  function getTitleVisibility(controlTitle, subSectionTitle, hasSingleContent) {
    // visible shall be true if there are multiple content or if the control and subsection title are different
    return or(not(hasSingleContent), notEqual(resolveBindingString(controlTitle), resolveBindingString(subSectionTitle)));
  }
  _exports.getTitleVisibility = getTitleVisibility;
  function createFormActionReducer(actions, facetDefinition, converterContext) {
    const referenceTarget = facetDefinition.Target.$target;
    const targetValue = facetDefinition.Target.value;
    let manifestActions = {};
    let dataFieldCollection = [];
    let navigationPropertyPath;
    [navigationPropertyPath] = targetValue.split("@");
    if (navigationPropertyPath.length > 0) {
      if (navigationPropertyPath.lastIndexOf("/") === navigationPropertyPath.length - 1) {
        navigationPropertyPath = navigationPropertyPath.substr(0, navigationPropertyPath.length - 1);
      }
    } else {
      navigationPropertyPath = undefined;
    }
    if (referenceTarget) {
      switch (referenceTarget.term) {
        case "com.sap.vocabularies.UI.v1.FieldGroup":
          dataFieldCollection = referenceTarget.Data;
          manifestActions = getActionsFromManifest(converterContext.getManifestControlConfiguration(referenceTarget).actions, converterContext, undefined, undefined, undefined, undefined, facetDefinition.fullyQualifiedName).actions;
          break;
        case "com.sap.vocabularies.UI.v1.Identification":
        case "com.sap.vocabularies.UI.v1.StatusInfo":
          if (referenceTarget.qualifier) {
            dataFieldCollection = referenceTarget;
          }
          break;
        default:
          break;
      }
    }
    actions = dataFieldCollection.reduce((actionReducer, dataField) => {
      var _dataField$RequiresCo, _dataField$Inline, _dataField$Determinin, _dataField$Label, _dataField$Navigation, _dataField$annotation, _dataField$annotation2, _dataField$annotation3, _dataField$annotation4, _dataField$annotation5, _dataField$Label2, _dataField$annotation6, _dataField$annotation7, _dataField$annotation8, _dataField$annotation9, _dataField$annotation10;
      switch (dataField.$Type) {
        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
          if (((_dataField$RequiresCo = dataField.RequiresContext) === null || _dataField$RequiresCo === void 0 ? void 0 : _dataField$RequiresCo.valueOf()) === true) {
            converterContext.getDiagnostics().addIssue(IssueCategory.Annotation, IssueSeverity.Low, IssueType.MALFORMED_DATAFIELD_FOR_IBN.REQUIRESCONTEXT);
          }
          if (((_dataField$Inline = dataField.Inline) === null || _dataField$Inline === void 0 ? void 0 : _dataField$Inline.valueOf()) === true) {
            converterContext.getDiagnostics().addIssue(IssueCategory.Annotation, IssueSeverity.Low, IssueType.MALFORMED_DATAFIELD_FOR_IBN.INLINE);
          }
          if (((_dataField$Determinin = dataField.Determining) === null || _dataField$Determinin === void 0 ? void 0 : _dataField$Determinin.valueOf()) === true) {
            converterContext.getDiagnostics().addIssue(IssueCategory.Annotation, IssueSeverity.Low, IssueType.MALFORMED_DATAFIELD_FOR_IBN.DETERMINING);
          }
          const mNavigationParameters = {};
          if (dataField.Mapping) {
            mNavigationParameters.semanticObjectMapping = getSemanticObjectMapping(dataField.Mapping);
          }
          actionReducer.push({
            type: ActionType.DataFieldForIntentBasedNavigation,
            id: getFormID(facetDefinition, dataField),
            key: KeyHelper.generateKeyFromDataField(dataField),
            text: (_dataField$Label = dataField.Label) === null || _dataField$Label === void 0 ? void 0 : _dataField$Label.toString(),
            annotationPath: "",
            enabled: dataField.NavigationAvailable !== undefined ? compileExpression(equal(getExpressionFromAnnotation((_dataField$Navigation = dataField.NavigationAvailable) === null || _dataField$Navigation === void 0 ? void 0 : _dataField$Navigation.valueOf()), true)) : "true",
            visible: compileExpression(not(equal(getExpressionFromAnnotation((_dataField$annotation = dataField.annotations) === null || _dataField$annotation === void 0 ? void 0 : (_dataField$annotation2 = _dataField$annotation.UI) === null || _dataField$annotation2 === void 0 ? void 0 : (_dataField$annotation3 = _dataField$annotation2.Hidden) === null || _dataField$annotation3 === void 0 ? void 0 : _dataField$annotation3.valueOf()), true))),
            buttonType: getButtonType((_dataField$annotation4 = dataField.annotations) === null || _dataField$annotation4 === void 0 ? void 0 : (_dataField$annotation5 = _dataField$annotation4.UI) === null || _dataField$annotation5 === void 0 ? void 0 : _dataField$annotation5.Emphasized),
            press: compileExpression(fn("._intentBasedNavigation.navigate", [getExpressionFromAnnotation(dataField.SemanticObject), getExpressionFromAnnotation(dataField.Action), mNavigationParameters])),
            customData: compileExpression({
              semanticObject: getExpressionFromAnnotation(dataField.SemanticObject),
              action: getExpressionFromAnnotation(dataField.Action)
            })
          });
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
          const formManifestActionsConfiguration = converterContext.getManifestControlConfiguration(referenceTarget).actions;
          const key = KeyHelper.generateKeyFromDataField(dataField);
          actionReducer.push({
            type: ActionType.DataFieldForAction,
            id: getFormID(facetDefinition, dataField),
            key: key,
            text: (_dataField$Label2 = dataField.Label) === null || _dataField$Label2 === void 0 ? void 0 : _dataField$Label2.toString(),
            annotationPath: "",
            enabled: getEnabledForAnnotationAction(converterContext, dataField.ActionTarget),
            binding: navigationPropertyPath ? `{ 'path' : '${navigationPropertyPath}'}` : undefined,
            visible: compileExpression(not(equal(getExpressionFromAnnotation((_dataField$annotation6 = dataField.annotations) === null || _dataField$annotation6 === void 0 ? void 0 : (_dataField$annotation7 = _dataField$annotation6.UI) === null || _dataField$annotation7 === void 0 ? void 0 : (_dataField$annotation8 = _dataField$annotation7.Hidden) === null || _dataField$annotation8 === void 0 ? void 0 : _dataField$annotation8.valueOf()), true))),
            requiresDialog: isActionWithDialog(dataField),
            buttonType: getButtonType((_dataField$annotation9 = dataField.annotations) === null || _dataField$annotation9 === void 0 ? void 0 : (_dataField$annotation10 = _dataField$annotation9.UI) === null || _dataField$annotation10 === void 0 ? void 0 : _dataField$annotation10.Emphasized),
            press: compileExpression(fn("invokeAction", [dataField.Action, {
              contexts: fn("getBindingContext", [], pathInModel("", "$source")),
              invocationGrouping: dataField.InvocationGrouping === "UI.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated",
              label: getExpressionFromAnnotation(dataField.Label),
              model: fn("getModel", [], pathInModel("/", "$source")),
              isNavigable: isActionNavigable(formManifestActionsConfiguration && formManifestActionsConfiguration[key])
            }], ref(".editFlow"))),
            facetName: dataField.Inline ? facetDefinition.fullyQualifiedName : undefined
          });
          break;
        default:
          break;
      }
      return actionReducer;
    }, actions);
    // Overwriting of actions happens in addFormMenuActions
    return insertCustomElements(actions, manifestActions);
  }
  function isDialog(actionDefinition) {
    if (actionDefinition) {
      var _actionDefinition$ann, _actionDefinition$ann2;
      const bCritical = (_actionDefinition$ann = actionDefinition.annotations) === null || _actionDefinition$ann === void 0 ? void 0 : (_actionDefinition$ann2 = _actionDefinition$ann.Common) === null || _actionDefinition$ann2 === void 0 ? void 0 : _actionDefinition$ann2.IsActionCritical;
      if (actionDefinition.parameters.length > 1 || bCritical) {
        return "Dialog";
      } else {
        return "None";
      }
    } else {
      return "None";
    }
  }
  _exports.isDialog = isDialog;
  function createCustomSubSections(manifestSubSections, converterContext) {
    const subSections = {};
    Object.keys(manifestSubSections).forEach(subSectionKey => subSections[subSectionKey] = createCustomSubSection(manifestSubSections[subSectionKey], subSectionKey, converterContext));
    return subSections;
  }
  _exports.createCustomSubSections = createCustomSubSections;
  function createCustomSubSection(manifestSubSection, subSectionKey, converterContext) {
    const sideContent = manifestSubSection.sideContent ? {
      template: manifestSubSection.sideContent.template,
      id: getSideContentID(subSectionKey),
      visible: false,
      equalSplit: manifestSubSection.sideContent.equalSplit
    } : undefined;
    let position = manifestSubSection.position;
    if (!position) {
      position = {
        placement: Placement.After
      };
    }
    const isVisible = manifestSubSection.visible !== undefined ? manifestSubSection.visible : true;
    const isDynamicExpression = isVisible && typeof isVisible === "string" && isVisible.indexOf("{=") === 0;
    const manifestActions = getActionsFromManifest(manifestSubSection.actions, converterContext);
    const subSectionDefinition = {
      type: SubSectionType.Unknown,
      id: manifestSubSection.id || getCustomSubSectionID(subSectionKey),
      actions: manifestActions.actions,
      key: subSectionKey,
      title: manifestSubSection.title,
      level: 1,
      position: position,
      visible: manifestSubSection.visible !== undefined ? manifestSubSection.visible : "true",
      sideContent: sideContent,
      isVisibilityDynamic: isDynamicExpression,
      objectPageLazyLoaderEnabled: manifestSubSection.enableLazyLoading ?? false,
      componentName: "",
      settings: ""
    };
    if (manifestSubSection.template || manifestSubSection.name) {
      subSectionDefinition.type = SubSectionType.XMLFragment;
      subSectionDefinition.template = manifestSubSection.template || manifestSubSection.name || "";
    } else if (manifestSubSection.embeddedComponent !== undefined) {
      subSectionDefinition.type = SubSectionType.EmbeddedComponent;
      subSectionDefinition.componentName = manifestSubSection.embeddedComponent.name;
      if (manifestSubSection.embeddedComponent.settings !== undefined) {
        subSectionDefinition.settings = JSON.stringify(manifestSubSection.embeddedComponent.settings);
      }
    } else {
      subSectionDefinition.type = SubSectionType.Placeholder;
    }
    return subSectionDefinition;
  }

  /**
   * Evaluate if the condensed mode can be applied on the table.
   *
   * @param currentFacet
   * @param facetsToCreateInSection
   * @param converterContext
   * @returns `true` for compliant, false otherwise
   */
  _exports.createCustomSubSection = createCustomSubSection;
  function getCondensedTableLayoutCompliance(currentFacet, facetsToCreateInSection, converterContext) {
    const manifestWrapper = converterContext.getManifestWrapper();
    if (manifestWrapper.useIconTabBar()) {
      // If the OP use the tab based we check if the facets that will be created for this section are all non visible
      return hasNoOtherVisibleTableInTargets(currentFacet, facetsToCreateInSection);
    } else {
      var _entityType$annotatio, _entityType$annotatio2, _entityType$annotatio3, _entityType$annotatio4, _entityType$annotatio5, _entityType$annotatio6;
      const entityType = converterContext.getEntityType();
      if ((_entityType$annotatio = entityType.annotations) !== null && _entityType$annotatio !== void 0 && (_entityType$annotatio2 = _entityType$annotatio.UI) !== null && _entityType$annotatio2 !== void 0 && (_entityType$annotatio3 = _entityType$annotatio2.Facets) !== null && _entityType$annotatio3 !== void 0 && _entityType$annotatio3.length && ((_entityType$annotatio4 = entityType.annotations) === null || _entityType$annotatio4 === void 0 ? void 0 : (_entityType$annotatio5 = _entityType$annotatio4.UI) === null || _entityType$annotatio5 === void 0 ? void 0 : (_entityType$annotatio6 = _entityType$annotatio5.Facets) === null || _entityType$annotatio6 === void 0 ? void 0 : _entityType$annotatio6.length) > 1) {
        return hasNoOtherVisibleTableInTargets(currentFacet, facetsToCreateInSection);
      } else {
        return true;
      }
    }
  }
  function hasNoOtherVisibleTableInTargets(currentFacet, facetsToCreateInSection) {
    return facetsToCreateInSection.every(function (subFacet) {
      if (subFacet !== currentFacet) {
        if (subFacet.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet") {
          var _refFacet$Target, _refFacet$Target$$tar, _refFacet$Target2, _refFacet$Target2$$ta, _refFacet$Target$$tar2;
          const refFacet = subFacet;
          if (((_refFacet$Target = refFacet.Target) === null || _refFacet$Target === void 0 ? void 0 : (_refFacet$Target$$tar = _refFacet$Target.$target) === null || _refFacet$Target$$tar === void 0 ? void 0 : _refFacet$Target$$tar.term) === "com.sap.vocabularies.UI.v1.LineItem" || ((_refFacet$Target2 = refFacet.Target) === null || _refFacet$Target2 === void 0 ? void 0 : (_refFacet$Target2$$ta = _refFacet$Target2.$target) === null || _refFacet$Target2$$ta === void 0 ? void 0 : _refFacet$Target2$$ta.term) === "com.sap.vocabularies.UI.v1.PresentationVariant" || ((_refFacet$Target$$tar2 = refFacet.Target.$target) === null || _refFacet$Target$$tar2 === void 0 ? void 0 : _refFacet$Target$$tar2.term) === "com.sap.vocabularies.UI.v1.SelectionPresentationVariant") {
            var _refFacet$annotations, _refFacet$annotations2, _refFacet$annotations3, _refFacet$annotations4;
            return ((_refFacet$annotations = refFacet.annotations) === null || _refFacet$annotations === void 0 ? void 0 : (_refFacet$annotations2 = _refFacet$annotations.UI) === null || _refFacet$annotations2 === void 0 ? void 0 : _refFacet$annotations2.Hidden) !== undefined ? (_refFacet$annotations3 = refFacet.annotations) === null || _refFacet$annotations3 === void 0 ? void 0 : (_refFacet$annotations4 = _refFacet$annotations3.UI) === null || _refFacet$annotations4 === void 0 ? void 0 : _refFacet$annotations4.Hidden : false;
          }
          return true;
        } else {
          const subCollectionFacet = subFacet;
          return subCollectionFacet.Facets.every(function (facet) {
            var _subRefFacet$Target, _subRefFacet$Target$$, _subRefFacet$Target2, _subRefFacet$Target2$, _subRefFacet$Target3, _subRefFacet$Target3$;
            const subRefFacet = facet;
            if (((_subRefFacet$Target = subRefFacet.Target) === null || _subRefFacet$Target === void 0 ? void 0 : (_subRefFacet$Target$$ = _subRefFacet$Target.$target) === null || _subRefFacet$Target$$ === void 0 ? void 0 : _subRefFacet$Target$$.term) === "com.sap.vocabularies.UI.v1.LineItem" || ((_subRefFacet$Target2 = subRefFacet.Target) === null || _subRefFacet$Target2 === void 0 ? void 0 : (_subRefFacet$Target2$ = _subRefFacet$Target2.$target) === null || _subRefFacet$Target2$ === void 0 ? void 0 : _subRefFacet$Target2$.term) === "com.sap.vocabularies.UI.v1.PresentationVariant" || ((_subRefFacet$Target3 = subRefFacet.Target) === null || _subRefFacet$Target3 === void 0 ? void 0 : (_subRefFacet$Target3$ = _subRefFacet$Target3.$target) === null || _subRefFacet$Target3$ === void 0 ? void 0 : _subRefFacet$Target3$.term) === "com.sap.vocabularies.UI.v1.SelectionPresentationVariant") {
              var _subRefFacet$annotati, _subRefFacet$annotati2, _subRefFacet$annotati3, _subRefFacet$annotati4;
              return ((_subRefFacet$annotati = subRefFacet.annotations) === null || _subRefFacet$annotati === void 0 ? void 0 : (_subRefFacet$annotati2 = _subRefFacet$annotati.UI) === null || _subRefFacet$annotati2 === void 0 ? void 0 : _subRefFacet$annotati2.Hidden) !== undefined ? (_subRefFacet$annotati3 = subRefFacet.annotations) === null || _subRefFacet$annotati3 === void 0 ? void 0 : (_subRefFacet$annotati4 = _subRefFacet$annotati3.UI) === null || _subRefFacet$annotati4 === void 0 ? void 0 : _subRefFacet$annotati4.Hidden : false;
            }
            return true;
          });
        }
      }
      return true;
    });
  }
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdWJTZWN0aW9uVHlwZSIsInZpc3VhbGl6YXRpb25UZXJtcyIsImNyZWF0ZVN1YlNlY3Rpb25zIiwiZmFjZXRDb2xsZWN0aW9uIiwiY29udmVydGVyQ29udGV4dCIsImlzSGVhZGVyU2VjdGlvbiIsImZhY2V0c1RvQ3JlYXRlIiwicmVkdWNlIiwiZmFjZXREZWZpbml0aW9uIiwiJFR5cGUiLCJwdXNoIiwiRmFjZXRzIiwiZmluZCIsImZhY2V0VHlwZSIsInNwbGljZSIsImxlbmd0aCIsIm1hcCIsImZhY2V0IiwiY3JlYXRlU3ViU2VjdGlvbiIsImNyZWF0ZUN1c3RvbUhlYWRlckZhY2V0U3ViU2VjdGlvbnMiLCJjdXN0b21IZWFkZXJGYWNldHMiLCJnZXRIZWFkZXJGYWNldHNGcm9tTWFuaWZlc3QiLCJnZXRNYW5pZmVzdFdyYXBwZXIiLCJnZXRIZWFkZXJGYWNldHMiLCJhQ3VzdG9tSGVhZGVyRmFjZXRzIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJjdXN0b21IZWFkZXJGYWNldCIsInRlbXBsYXRlRWRpdCIsImNyZWF0ZUN1c3RvbUhlYWRlckZhY2V0U3ViU2VjdGlvbiIsInN1YlNlY3Rpb25JRCIsImdldEN1c3RvbVN1YlNlY3Rpb25JRCIsInN1YlNlY3Rpb24iLCJpZCIsInRpdGxlIiwidHlwZSIsIlhNTEZyYWdtZW50IiwidGVtcGxhdGUiLCJ2aXNpYmxlIiwibGV2ZWwiLCJzaWRlQ29udGVudCIsInVuZGVmaW5lZCIsInN0YXNoZWQiLCJmbGV4U2V0dGluZ3MiLCJhY3Rpb25zIiwib2JqZWN0UGFnZUxhenlMb2FkZXJFbmFibGVkIiwiZ2V0U3ViU2VjdGlvbktleSIsImZhbGxiYWNrIiwiSUQiLCJ0b1N0cmluZyIsIkxhYmVsIiwiYWRkRm9ybU1lbnVBY3Rpb25zIiwiaGlkZGVuQWN0aW9ucyIsImdldEZvcm1IaWRkZW5BY3Rpb25zIiwiZm9ybUFjdGlvbnMiLCJnZXRGb3JtQWN0aW9ucyIsIm1hbmlmZXN0QWN0aW9ucyIsImdldEFjdGlvbnNGcm9tTWFuaWZlc3QiLCJhY3Rpb25PdmVyd3JpdGVDb25maWciLCJlbmFibGVkIiwiT3ZlcnJpZGVUeXBlIiwib3ZlcndyaXRlIiwiY29tbWFuZCIsImZvcm1BbGxBY3Rpb25zIiwiaW5zZXJ0Q3VzdG9tRWxlbWVudHMiLCJnZXRWaXNpYmlsaXR5RW5hYmxlbWVudEZvcm1NZW51QWN0aW9ucyIsInJlbW92ZUR1cGxpY2F0ZUFjdGlvbnMiLCJjb21tYW5kQWN0aW9ucyIsImdldEZhY2V0QWN0aW9ucyIsImZpbHRlciIsInN1YkZhY2V0RGVmaW5pdGlvbiIsImlzUmVmZXJlbmNlRmFjZXQiLCJhY3Rpb25SZWR1Y2VyIiwicmVmZXJlbmNlRmFjZXQiLCJjcmVhdGVGb3JtQWN0aW9uUmVkdWNlciIsImdldEJ1dHRvblR5cGUiLCJlbXBoYXNpemVkIiwiYnV0dG9uVHlwZUNvbmRpdGlvbiIsImVxdWFsIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwiY29tcGlsZUV4cHJlc3Npb24iLCJpZkVsc2UiLCJCdXR0b25UeXBlIiwiR2hvc3QiLCJUcmFuc3BhcmVudCIsImhhc1NpbmdsZUNvbnRlbnQiLCJnZXRTdWJTZWN0aW9uSUQiLCJvSGlkZGVuQW5ub3RhdGlvbiIsImFubm90YXRpb25zIiwiVUkiLCJIaWRkZW4iLCJpc1Zpc2libGVFeHByZXNzaW9uIiwibm90IiwiaXNWaXNpYmxlIiwiaXNEeW5hbWljRXhwcmVzc2lvbiIsImluZGV4T2YiLCJpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbiIsImlzVmlzaWJsZUR5bmFtaWNFeHByZXNzaW9uIiwic3Vic3RyaW5nIiwibGFzdEluZGV4T2YiLCJVbmtub3duIiwiYW5ub3RhdGlvblBhdGgiLCJnZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoIiwiZnVsbHlRdWFsaWZpZWROYW1lIiwiaXNWaXNpYmlsaXR5RHluYW1pYyIsImdldEVuYWJsZUxhenlMb2FkaW5nIiwiZ2V0U3Rhc2hlZFNldHRpbmdzRm9ySGVhZGVyRmFjZXQiLCJkZXNpZ250aW1lIiwiZ2V0RGVzaWduVGltZU1ldGFkYXRhU2V0dGluZ3NGb3JIZWFkZXJGYWNldCIsInVuc3VwcG9ydGVkVGV4dCIsImZhY2V0cyIsInZpc3VhbGl6YXRpb25GYWNldHMiLCJpbmRleCIsImluY2x1ZGVzIiwiVGFyZ2V0IiwiJHRhcmdldCIsInRlcm0iLCJub25WaXN1YWxpemF0aW9uRmFjZXRzIiwidmlzdWFsaXphdGlvbiIsInZpc3VhbGl6YXRpb25Db250ZW50IiwiZm9ybUNvbnRlbnQiLCJtaXhlZENvbnRlbnQiLCJMb2ciLCJ3YXJuaW5nIiwiZmFrZUZvcm1GYWNldCIsIm1peGVkU3ViU2VjdGlvbiIsIk1peGVkIiwiY29udGVudCIsImZhY2V0QWN0aW9ucyIsImZvcm1Db2xsZWN0aW9uU3ViU2VjdGlvbiIsIkZvcm0iLCJmb3JtRGVmaW5pdGlvbiIsImNyZWF0ZUZvcm1EZWZpbml0aW9uIiwiYWN0aW9uIiwiZmFjZXROYW1lIiwidmFsdWUiLCJwcmVzZW50YXRpb24iLCJnZXREYXRhVmlzdWFsaXphdGlvbkNvbmZpZ3VyYXRpb24iLCJnZXRDb25kZW5zZWRUYWJsZUxheW91dENvbXBsaWFuY2UiLCJzdWJTZWN0aW9uVGl0bGUiLCJjb250cm9sVGl0bGUiLCJ2aXN1YWxpemF0aW9ucyIsImFubm90YXRpb24iLCJpc1BhcnRPZlByZXZpZXciLCJQYXJ0T2ZQcmV2aWV3IiwidmFsdWVPZiIsInNob3dUaXRsZSIsImdldFRpdGxlVmlzaWJpbGl0eSIsInRpdGxlVmlzaWJsZSIsImFuZCIsImRhdGFWaXN1YWxpemF0aW9uU3ViU2VjdGlvbiIsIkRhdGFWaXN1YWxpemF0aW9uIiwiZm9ybUVsZW1lbnRTdWJTZWN0aW9uIiwidW5zdXBwb3J0ZWRTdWJTZWN0aW9uIiwidGV4dCIsIm9yIiwibm90RXF1YWwiLCJyZXNvbHZlQmluZGluZ1N0cmluZyIsInJlZmVyZW5jZVRhcmdldCIsInRhcmdldFZhbHVlIiwiZGF0YUZpZWxkQ29sbGVjdGlvbiIsIm5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgiLCJzcGxpdCIsInN1YnN0ciIsIkRhdGEiLCJnZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uIiwicXVhbGlmaWVyIiwiZGF0YUZpZWxkIiwiUmVxdWlyZXNDb250ZXh0IiwiZ2V0RGlhZ25vc3RpY3MiLCJhZGRJc3N1ZSIsIklzc3VlQ2F0ZWdvcnkiLCJBbm5vdGF0aW9uIiwiSXNzdWVTZXZlcml0eSIsIkxvdyIsIklzc3VlVHlwZSIsIk1BTEZPUk1FRF9EQVRBRklFTERfRk9SX0lCTiIsIlJFUVVJUkVTQ09OVEVYVCIsIklubGluZSIsIklOTElORSIsIkRldGVybWluaW5nIiwiREVURVJNSU5JTkciLCJtTmF2aWdhdGlvblBhcmFtZXRlcnMiLCJNYXBwaW5nIiwic2VtYW50aWNPYmplY3RNYXBwaW5nIiwiZ2V0U2VtYW50aWNPYmplY3RNYXBwaW5nIiwiQWN0aW9uVHlwZSIsIkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiIsImdldEZvcm1JRCIsIktleUhlbHBlciIsImdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZCIsIk5hdmlnYXRpb25BdmFpbGFibGUiLCJidXR0b25UeXBlIiwiRW1waGFzaXplZCIsInByZXNzIiwiZm4iLCJTZW1hbnRpY09iamVjdCIsIkFjdGlvbiIsImN1c3RvbURhdGEiLCJzZW1hbnRpY09iamVjdCIsImZvcm1NYW5pZmVzdEFjdGlvbnNDb25maWd1cmF0aW9uIiwiRGF0YUZpZWxkRm9yQWN0aW9uIiwiZ2V0RW5hYmxlZEZvckFubm90YXRpb25BY3Rpb24iLCJBY3Rpb25UYXJnZXQiLCJiaW5kaW5nIiwicmVxdWlyZXNEaWFsb2ciLCJpc0FjdGlvbldpdGhEaWFsb2ciLCJjb250ZXh0cyIsInBhdGhJbk1vZGVsIiwiaW52b2NhdGlvbkdyb3VwaW5nIiwiSW52b2NhdGlvbkdyb3VwaW5nIiwibGFiZWwiLCJtb2RlbCIsImlzTmF2aWdhYmxlIiwiaXNBY3Rpb25OYXZpZ2FibGUiLCJyZWYiLCJpc0RpYWxvZyIsImFjdGlvbkRlZmluaXRpb24iLCJiQ3JpdGljYWwiLCJDb21tb24iLCJJc0FjdGlvbkNyaXRpY2FsIiwicGFyYW1ldGVycyIsImNyZWF0ZUN1c3RvbVN1YlNlY3Rpb25zIiwibWFuaWZlc3RTdWJTZWN0aW9ucyIsInN1YlNlY3Rpb25zIiwic3ViU2VjdGlvbktleSIsImNyZWF0ZUN1c3RvbVN1YlNlY3Rpb24iLCJtYW5pZmVzdFN1YlNlY3Rpb24iLCJnZXRTaWRlQ29udGVudElEIiwiZXF1YWxTcGxpdCIsInBvc2l0aW9uIiwicGxhY2VtZW50IiwiUGxhY2VtZW50IiwiQWZ0ZXIiLCJzdWJTZWN0aW9uRGVmaW5pdGlvbiIsImVuYWJsZUxhenlMb2FkaW5nIiwiY29tcG9uZW50TmFtZSIsInNldHRpbmdzIiwibmFtZSIsImVtYmVkZGVkQ29tcG9uZW50IiwiRW1iZWRkZWRDb21wb25lbnQiLCJKU09OIiwic3RyaW5naWZ5IiwiUGxhY2Vob2xkZXIiLCJjdXJyZW50RmFjZXQiLCJmYWNldHNUb0NyZWF0ZUluU2VjdGlvbiIsIm1hbmlmZXN0V3JhcHBlciIsInVzZUljb25UYWJCYXIiLCJoYXNOb090aGVyVmlzaWJsZVRhYmxlSW5UYXJnZXRzIiwiZW50aXR5VHlwZSIsImdldEVudGl0eVR5cGUiLCJldmVyeSIsInN1YkZhY2V0IiwicmVmRmFjZXQiLCJzdWJDb2xsZWN0aW9uRmFjZXQiLCJzdWJSZWZGYWNldCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiU3ViU2VjdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEFjdGlvbiB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy9FZG1cIjtcbmltcG9ydCB7IENvbW11bmljYXRpb25Bbm5vdGF0aW9uVGVybXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW11bmljYXRpb25cIjtcbmltcG9ydCB0eXBlIHtcblx0Q29sbGVjdGlvbkZhY2V0LFxuXHRDb2xsZWN0aW9uRmFjZXRUeXBlcyxcblx0RGF0YUZpZWxkQWJzdHJhY3RUeXBlcyxcblx0RW1waGFzaXplZCxcblx0RmFjZXRUeXBlcyxcblx0RmllbGRHcm91cCxcblx0T3BlcmF0aW9uR3JvdXBpbmdUeXBlLFxuXHRSZWZlcmVuY2VGYWNldCxcblx0UmVmZXJlbmNlRmFjZXRUeXBlc1xufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgeyBVSUFubm90YXRpb25UZXJtcywgVUlBbm5vdGF0aW9uVHlwZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB0eXBlIHsgTmF2aWdhdGlvblBhcmFtZXRlcnMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvSW50ZXJuYWxJbnRlbnRCYXNlZE5hdmlnYXRpb25cIjtcbmltcG9ydCB0eXBlIHtcblx0QmFzZUFjdGlvbixcblx0Q29tYmluZWRBY3Rpb24sXG5cdENvbnZlcnRlckFjdGlvbixcblx0Q3VzdG9tQWN0aW9uLFxuXHRPdmVycmlkZVR5cGVBY3Rpb25cbn0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0FjdGlvblwiO1xuaW1wb3J0IHtcblx0QnV0dG9uVHlwZSxcblx0Z2V0QWN0aW9uc0Zyb21NYW5pZmVzdCxcblx0Z2V0RW5hYmxlZEZvckFubm90YXRpb25BY3Rpb24sXG5cdGdldFNlbWFudGljT2JqZWN0TWFwcGluZyxcblx0aXNBY3Rpb25OYXZpZ2FibGUsXG5cdHJlbW92ZUR1cGxpY2F0ZUFjdGlvbnNcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0FjdGlvblwiO1xuaW1wb3J0IHR5cGUgeyBDaGFydFZpc3VhbGl6YXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQ2hhcnRcIjtcbmltcG9ydCB0eXBlIHsgVGFibGVWaXN1YWxpemF0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL1RhYmxlXCI7XG5pbXBvcnQgdHlwZSB7IEN1c3RvbU9iamVjdFBhZ2VIZWFkZXJGYWNldCwgRmxleFNldHRpbmdzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvT2JqZWN0UGFnZS9IZWFkZXJGYWNldFwiO1xuaW1wb3J0IHtcblx0Z2V0RGVzaWduVGltZU1ldGFkYXRhU2V0dGluZ3NGb3JIZWFkZXJGYWNldCxcblx0Z2V0SGVhZGVyRmFjZXRzRnJvbU1hbmlmZXN0LFxuXHRnZXRTdGFzaGVkU2V0dGluZ3NGb3JIZWFkZXJGYWNldFxufSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9PYmplY3RQYWdlL0hlYWRlckZhY2V0XCI7XG5pbXBvcnQgeyBJc3N1ZUNhdGVnb3J5LCBJc3N1ZVNldmVyaXR5LCBJc3N1ZVR5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0lzc3VlTWFuYWdlclwiO1xuaW1wb3J0IHsgS2V5SGVscGVyIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9LZXlcIjtcbmltcG9ydCB0eXBlIHsgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQge1xuXHRhbmQsXG5cdGNvbXBpbGVFeHByZXNzaW9uLFxuXHRlcXVhbCxcblx0Zm4sXG5cdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbixcblx0aWZFbHNlLFxuXHRub3QsXG5cdG5vdEVxdWFsLFxuXHRvcixcblx0cGF0aEluTW9kZWwsXG5cdHJlZixcblx0cmVzb2x2ZUJpbmRpbmdTdHJpbmdcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGlzUGF0aEFubm90YXRpb25FeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvVHlwZUd1YXJkc1wiO1xuaW1wb3J0IHsgaXNBY3Rpb25XaXRoRGlhbG9nIH0gZnJvbSBcIi4uLy4uL2Fubm90YXRpb25zL0RhdGFGaWVsZFwiO1xuaW1wb3J0IHR5cGUgQ29udmVydGVyQ29udGV4dCBmcm9tIFwiLi4vLi4vQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgeyBDb25maWd1cmFibGVPYmplY3QsIENvbmZpZ3VyYWJsZVJlY29yZCwgQ3VzdG9tRWxlbWVudCB9IGZyb20gXCIuLi8uLi9oZWxwZXJzL0NvbmZpZ3VyYWJsZU9iamVjdFwiO1xuaW1wb3J0IHsgaW5zZXJ0Q3VzdG9tRWxlbWVudHMsIE92ZXJyaWRlVHlwZSwgUGxhY2VtZW50IH0gZnJvbSBcIi4uLy4uL2hlbHBlcnMvQ29uZmlndXJhYmxlT2JqZWN0XCI7XG5pbXBvcnQgeyBnZXRDdXN0b21TdWJTZWN0aW9uSUQsIGdldEZvcm1JRCwgZ2V0U2lkZUNvbnRlbnRJRCwgZ2V0U3ViU2VjdGlvbklEIH0gZnJvbSBcIi4uLy4uL2hlbHBlcnMvSURcIjtcbmltcG9ydCB0eXBlIHsgTWFuaWZlc3RBY3Rpb24sIE1hbmlmZXN0U3ViU2VjdGlvbiB9IGZyb20gXCIuLi8uLi9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgeyBBY3Rpb25UeXBlIH0gZnJvbSBcIi4uLy4uL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB7IGdldEZvcm1BY3Rpb25zLCBnZXRGb3JtSGlkZGVuQWN0aW9ucywgZ2V0VmlzaWJpbGl0eUVuYWJsZW1lbnRGb3JtTWVudUFjdGlvbnMgfSBmcm9tIFwiLi4vLi4vb2JqZWN0UGFnZS9Gb3JtTWVudUFjdGlvbnNcIjtcbmltcG9ydCB0eXBlIHsgRGF0YVZpc3VhbGl6YXRpb25EZWZpbml0aW9uIH0gZnJvbSBcIi4uL0NvbW1vbi9EYXRhVmlzdWFsaXphdGlvblwiO1xuaW1wb3J0IHsgZ2V0RGF0YVZpc3VhbGl6YXRpb25Db25maWd1cmF0aW9uIH0gZnJvbSBcIi4uL0NvbW1vbi9EYXRhVmlzdWFsaXphdGlvblwiO1xuaW1wb3J0IHR5cGUgeyBGb3JtRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9Db21tb24vRm9ybVwiO1xuaW1wb3J0IHsgY3JlYXRlRm9ybURlZmluaXRpb24sIGlzUmVmZXJlbmNlRmFjZXQgfSBmcm9tIFwiLi4vQ29tbW9uL0Zvcm1cIjtcblxuZXhwb3J0IGVudW0gU3ViU2VjdGlvblR5cGUge1xuXHRVbmtub3duID0gXCJVbmtub3duXCIsIC8vIERlZmF1bHQgVHlwZVxuXHRGb3JtID0gXCJGb3JtXCIsXG5cdERhdGFWaXN1YWxpemF0aW9uID0gXCJEYXRhVmlzdWFsaXphdGlvblwiLFxuXHRYTUxGcmFnbWVudCA9IFwiWE1MRnJhZ21lbnRcIixcblx0UGxhY2Vob2xkZXIgPSBcIlBsYWNlaG9sZGVyXCIsXG5cdE1peGVkID0gXCJNaXhlZFwiLFxuXHRFbWJlZGRlZENvbXBvbmVudCA9IFwiRW1iZWRkZWRDb21wb25lbnRcIlxufVxuXG5leHBvcnQgdHlwZSBPYmplY3RQYWdlU3ViU2VjdGlvbiA9XG5cdHwgVW5zdXBwb3J0ZWRTdWJTZWN0aW9uXG5cdHwgRm9ybVN1YlNlY3Rpb25cblx0fCBEYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb25cblx0fCBDb250YWN0U3ViU2VjdGlvblxuXHR8IFhNTEZyYWdtZW50U3ViU2VjdGlvblxuXHR8IFBsYWNlaG9sZGVyRnJhZ21lbnRTdWJTZWN0aW9uXG5cdHwgTWl4ZWRTdWJTZWN0aW9uXG5cdHwgUmV1c2VDb21wb25lbnRTdWJTZWN0aW9uO1xuXG50eXBlIEJhc2VTdWJTZWN0aW9uID0ge1xuXHRpZDogc3RyaW5nO1xuXHRrZXk6IHN0cmluZztcblx0dGl0bGU6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRhbm5vdGF0aW9uUGF0aDogc3RyaW5nO1xuXHR0eXBlOiBTdWJTZWN0aW9uVHlwZTtcblx0dmlzaWJsZTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdGlzVmlzaWJpbGl0eUR5bmFtaWM/OiBib29sZWFuIHwgXCJcIjtcblx0ZmxleFNldHRpbmdzPzogRmxleFNldHRpbmdzO1xuXHRzdGFzaGVkPzogYm9vbGVhbjtcblx0bGV2ZWw6IG51bWJlcjtcblx0Y29udGVudD86IEFycmF5PE9iamVjdFBhZ2VTdWJTZWN0aW9uPjtcblx0c2lkZUNvbnRlbnQ/OiBTaWRlQ29udGVudERlZjtcblx0b2JqZWN0UGFnZUxhenlMb2FkZXJFbmFibGVkOiBib29sZWFuO1xuXHRjbGFzcz86IHN0cmluZztcbn07XG5cbnR5cGUgVW5zdXBwb3J0ZWRTdWJTZWN0aW9uID0gQmFzZVN1YlNlY3Rpb24gJiB7XG5cdHRleHQ6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIERhdGFWaXN1YWxpemF0aW9uU3ViU2VjdGlvbiA9IEJhc2VTdWJTZWN0aW9uICYge1xuXHR0eXBlOiBTdWJTZWN0aW9uVHlwZS5EYXRhVmlzdWFsaXphdGlvbjtcblx0cHJlc2VudGF0aW9uOiBEYXRhVmlzdWFsaXphdGlvbkRlZmluaXRpb247XG5cdHNob3dUaXRsZTogYm9vbGVhbiB8IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHR0aXRsZVZpc2libGU/OiBzdHJpbmcgfCBib29sZWFuO1xuXHRpc1BhcnRPZlByZXZpZXc/OiBib29sZWFuO1xufTtcblxudHlwZSBDb250YWN0U3ViU2VjdGlvbiA9IFVuc3VwcG9ydGVkU3ViU2VjdGlvbjtcblxudHlwZSBYTUxGcmFnbWVudFN1YlNlY3Rpb24gPSBPbWl0PEJhc2VTdWJTZWN0aW9uLCBcImFubm90YXRpb25QYXRoXCI+ICYge1xuXHR0eXBlOiBTdWJTZWN0aW9uVHlwZS5YTUxGcmFnbWVudDtcblx0dGVtcGxhdGU6IHN0cmluZztcblx0YWN0aW9uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPjtcbn07XG5cbnR5cGUgUmV1c2VDb21wb25lbnRTdWJTZWN0aW9uID0gQmFzZVN1YlNlY3Rpb24gJiB7XG5cdHR5cGU6IFN1YlNlY3Rpb25UeXBlLkVtYmVkZGVkQ29tcG9uZW50O1xuXHRjb21wb25lbnROYW1lOiBzdHJpbmc7XG5cdHNldHRpbmdzOiBzdHJpbmc7XG59O1xuXG50eXBlIFBsYWNlaG9sZGVyRnJhZ21lbnRTdWJTZWN0aW9uID0gT21pdDxCYXNlU3ViU2VjdGlvbiwgXCJhbm5vdGF0aW9uUGF0aFwiPiAmIHtcblx0dHlwZTogU3ViU2VjdGlvblR5cGUuUGxhY2Vob2xkZXI7XG5cdGFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj47XG59O1xuXG5leHBvcnQgdHlwZSBNaXhlZFN1YlNlY3Rpb24gPSBCYXNlU3ViU2VjdGlvbiAmIHtcblx0Y29udGVudDogQXJyYXk8T2JqZWN0UGFnZVN1YlNlY3Rpb24+O1xufTtcblxuZXhwb3J0IHR5cGUgRm9ybVN1YlNlY3Rpb24gPSBCYXNlU3ViU2VjdGlvbiAmIHtcblx0dHlwZTogU3ViU2VjdGlvblR5cGUuRm9ybTtcblx0Zm9ybURlZmluaXRpb246IEZvcm1EZWZpbml0aW9uO1xuXHRhY3Rpb25zOiBDb252ZXJ0ZXJBY3Rpb25bXSB8IEJhc2VBY3Rpb25bXTtcblx0Y29tbWFuZEFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj47XG59O1xuXG5leHBvcnQgdHlwZSBPYmplY3RQYWdlU2VjdGlvbiA9IENvbmZpZ3VyYWJsZU9iamVjdCAmIHtcblx0aWQ6IHN0cmluZztcblx0dGl0bGU6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRzaG93VGl0bGU/OiBib29sZWFuO1xuXHR2aXNpYmxlOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0c3ViU2VjdGlvbnM6IE9iamVjdFBhZ2VTdWJTZWN0aW9uW107XG59O1xuXG50eXBlIFNpZGVDb250ZW50RGVmID0ge1xuXHR0ZW1wbGF0ZT86IHN0cmluZztcblx0aWQ/OiBzdHJpbmc7XG5cdHNpZGVDb250ZW50RmFsbERvd24/OiBzdHJpbmc7XG5cdGNvbnRhaW5lclF1ZXJ5Pzogc3RyaW5nO1xuXHR2aXNpYmxlPzogYm9vbGVhbjtcblx0ZXF1YWxTcGxpdD86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBDdXN0b21PYmplY3RQYWdlU2VjdGlvbiA9IEN1c3RvbUVsZW1lbnQ8T2JqZWN0UGFnZVNlY3Rpb24+O1xuXG5leHBvcnQgdHlwZSBDdXN0b21PYmplY3RQYWdlU3ViU2VjdGlvbiA9IEN1c3RvbUVsZW1lbnQ8T2JqZWN0UGFnZVN1YlNlY3Rpb24+O1xuXG5jb25zdCB2aXN1YWxpemF0aW9uVGVybXM6IHN0cmluZ1tdID0gW1xuXHRVSUFubm90YXRpb25UZXJtcy5MaW5lSXRlbSxcblx0VUlBbm5vdGF0aW9uVGVybXMuQ2hhcnQsXG5cdFVJQW5ub3RhdGlvblRlcm1zLlByZXNlbnRhdGlvblZhcmlhbnQsXG5cdFVJQW5ub3RhdGlvblRlcm1zLlNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnRcbl07XG5cbi8qKlxuICogQ3JlYXRlIHN1YnNlY3Rpb25zIGJhc2VkIG9uIGZhY2V0IGRlZmluaXRpb24uXG4gKlxuICogQHBhcmFtIGZhY2V0Q29sbGVjdGlvbiBDb2xsZWN0aW9uIG9mIGZhY2V0c1xuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcGFyYW0gaXNIZWFkZXJTZWN0aW9uIFRydWUgaWYgaGVhZGVyIHNlY3Rpb24gaXMgZ2VuZXJhdGVkIGluIHRoaXMgaXRlcmF0aW9uXG4gKiBAcmV0dXJucyBUaGUgY3VycmVudCBzdWJzZWN0aW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3ViU2VjdGlvbnMoXG5cdGZhY2V0Q29sbGVjdGlvbjogRmFjZXRUeXBlc1tdLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRpc0hlYWRlclNlY3Rpb24/OiBib29sZWFuXG4pOiBPYmplY3RQYWdlU3ViU2VjdGlvbltdIHtcblx0Ly8gRmlyc3Qgd2UgZGV0ZXJtaW5lIHdoaWNoIHN1YiBzZWN0aW9uIHdlIG5lZWQgdG8gY3JlYXRlXG5cdGNvbnN0IGZhY2V0c1RvQ3JlYXRlID0gZmFjZXRDb2xsZWN0aW9uLnJlZHVjZSgoZmFjZXRzVG9DcmVhdGU6IEZhY2V0VHlwZXNbXSwgZmFjZXREZWZpbml0aW9uKSA9PiB7XG5cdFx0c3dpdGNoIChmYWNldERlZmluaXRpb24uJFR5cGUpIHtcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuUmVmZXJlbmNlRmFjZXQ6XG5cdFx0XHRcdGZhY2V0c1RvQ3JlYXRlLnB1c2goZmFjZXREZWZpbml0aW9uKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkNvbGxlY3Rpb25GYWNldDpcblx0XHRcdFx0Ly8gVE9ETyBJZiB0aGUgQ29sbGVjdGlvbiBGYWNldCBoYXMgYSBjaGlsZCBvZiB0eXBlIENvbGxlY3Rpb24gRmFjZXQgd2UgYnJpbmcgdGhlbSB1cCBvbmUgbGV2ZWwgKEZvcm0gKyBUYWJsZSB1c2UgY2FzZSkgP1xuXHRcdFx0XHQvLyBmaXJzdCBjYXNlIGZhY2V0IENvbGxlY3Rpb24gaXMgY29tYmluYXRpb24gb2YgY29sbGVjdGlvbiBhbmQgcmVmZXJlbmNlIGZhY2V0IG9yIG5vdCBhbGwgZmFjZXRzIGFyZSByZWZlcmVuY2UgZmFjZXRzLlxuXHRcdFx0XHRpZiAoZmFjZXREZWZpbml0aW9uLkZhY2V0cy5maW5kKChmYWNldFR5cGUpID0+IGZhY2V0VHlwZS4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuQ29sbGVjdGlvbkZhY2V0KSkge1xuXHRcdFx0XHRcdGZhY2V0c1RvQ3JlYXRlLnNwbGljZShmYWNldHNUb0NyZWF0ZS5sZW5ndGgsIDAsIC4uLmZhY2V0RGVmaW5pdGlvbi5GYWNldHMpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZhY2V0c1RvQ3JlYXRlLnB1c2goZmFjZXREZWZpbml0aW9uKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuUmVmZXJlbmNlVVJMRmFjZXQ6XG5cdFx0XHRcdC8vIE5vdCBzdXBwb3J0ZWRcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdHJldHVybiBmYWNldHNUb0NyZWF0ZTtcblx0fSwgW10pO1xuXG5cdC8vIFRoZW4gd2UgY3JlYXRlIHRoZSBhY3R1YWwgc3Vic2VjdGlvbnNcblx0cmV0dXJuIGZhY2V0c1RvQ3JlYXRlLm1hcCgoZmFjZXQpID0+XG5cdFx0Y3JlYXRlU3ViU2VjdGlvbihmYWNldCwgZmFjZXRzVG9DcmVhdGUsIGNvbnZlcnRlckNvbnRleHQsIDAsICEoZmFjZXQgYXMgQ29sbGVjdGlvbkZhY2V0KT8uRmFjZXRzPy5sZW5ndGgsIGlzSGVhZGVyU2VjdGlvbilcblx0KTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIHN1YnNlY3Rpb25zIGJhc2VkIG9uIHRoZSBkZWZpbml0aW9uIG9mIHRoZSBjdXN0b20gaGVhZGVyIGZhY2V0LlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHJldHVybnMgVGhlIGN1cnJlbnQgc3Vic2VjdGlvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUN1c3RvbUhlYWRlckZhY2V0U3ViU2VjdGlvbnMoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IE9iamVjdFBhZ2VTdWJTZWN0aW9uW10ge1xuXHRjb25zdCBjdXN0b21IZWFkZXJGYWNldHM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbU9iamVjdFBhZ2VIZWFkZXJGYWNldD4gPSBnZXRIZWFkZXJGYWNldHNGcm9tTWFuaWZlc3QoXG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS5nZXRIZWFkZXJGYWNldHMoKVxuXHQpO1xuXHRjb25zdCBhQ3VzdG9tSGVhZGVyRmFjZXRzOiBDdXN0b21PYmplY3RQYWdlSGVhZGVyRmFjZXRbXSA9IFtdO1xuXHRPYmplY3Qua2V5cyhjdXN0b21IZWFkZXJGYWNldHMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuXHRcdGFDdXN0b21IZWFkZXJGYWNldHMucHVzaChjdXN0b21IZWFkZXJGYWNldHNba2V5XSk7XG5cdFx0cmV0dXJuIGFDdXN0b21IZWFkZXJGYWNldHM7XG5cdH0pO1xuXHRjb25zdCBmYWNldHNUb0NyZWF0ZSA9IGFDdXN0b21IZWFkZXJGYWNldHMucmVkdWNlKChmYWNldHNUb0NyZWF0ZTogQ3VzdG9tT2JqZWN0UGFnZUhlYWRlckZhY2V0W10sIGN1c3RvbUhlYWRlckZhY2V0KSA9PiB7XG5cdFx0aWYgKGN1c3RvbUhlYWRlckZhY2V0LnRlbXBsYXRlRWRpdCkge1xuXHRcdFx0ZmFjZXRzVG9DcmVhdGUucHVzaChjdXN0b21IZWFkZXJGYWNldCk7XG5cdFx0fVxuXHRcdHJldHVybiBmYWNldHNUb0NyZWF0ZTtcblx0fSwgW10pO1xuXG5cdHJldHVybiBmYWNldHNUb0NyZWF0ZS5tYXAoKGN1c3RvbUhlYWRlckZhY2V0KSA9PiBjcmVhdGVDdXN0b21IZWFkZXJGYWNldFN1YlNlY3Rpb24oY3VzdG9tSGVhZGVyRmFjZXQpKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgc3Vic2VjdGlvbiBiYXNlZCBvbiBhIGN1c3RvbSBoZWFkZXIgZmFjZXQuXG4gKlxuICogQHBhcmFtIGN1c3RvbUhlYWRlckZhY2V0IEEgY3VzdG9tIGhlYWRlciBmYWNldFxuICogQHJldHVybnMgQSBkZWZpbml0aW9uIGZvciBhIHN1YnNlY3Rpb25cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ3VzdG9tSGVhZGVyRmFjZXRTdWJTZWN0aW9uKGN1c3RvbUhlYWRlckZhY2V0OiBDdXN0b21PYmplY3RQYWdlSGVhZGVyRmFjZXQpOiBPYmplY3RQYWdlU3ViU2VjdGlvbiB7XG5cdGNvbnN0IHN1YlNlY3Rpb25JRCA9IGdldEN1c3RvbVN1YlNlY3Rpb25JRChjdXN0b21IZWFkZXJGYWNldC5rZXkpO1xuXHRjb25zdCBzdWJTZWN0aW9uOiBYTUxGcmFnbWVudFN1YlNlY3Rpb24gPSB7XG5cdFx0aWQ6IHN1YlNlY3Rpb25JRCxcblx0XHRrZXk6IGN1c3RvbUhlYWRlckZhY2V0LmtleSxcblx0XHR0aXRsZTogY3VzdG9tSGVhZGVyRmFjZXQudGl0bGUsXG5cdFx0dHlwZTogU3ViU2VjdGlvblR5cGUuWE1MRnJhZ21lbnQsXG5cdFx0dGVtcGxhdGU6IGN1c3RvbUhlYWRlckZhY2V0LnRlbXBsYXRlRWRpdCB8fCBcIlwiLFxuXHRcdHZpc2libGU6IGN1c3RvbUhlYWRlckZhY2V0LnZpc2libGUsXG5cdFx0bGV2ZWw6IDEsXG5cdFx0c2lkZUNvbnRlbnQ6IHVuZGVmaW5lZCxcblx0XHRzdGFzaGVkOiBjdXN0b21IZWFkZXJGYWNldC5zdGFzaGVkLFxuXHRcdGZsZXhTZXR0aW5nczogY3VzdG9tSGVhZGVyRmFjZXQuZmxleFNldHRpbmdzLFxuXHRcdGFjdGlvbnM6IHt9LFxuXHRcdG9iamVjdFBhZ2VMYXp5TG9hZGVyRW5hYmxlZDogZmFsc2Vcblx0fTtcblx0cmV0dXJuIHN1YlNlY3Rpb247XG59XG5cbi8vIGZ1bmN0aW9uIGlzVGFyZ2V0Rm9yQ29tcGxpYW50KGFubm90YXRpb25QYXRoOiBBbm5vdGF0aW9uUGF0aCkge1xuLy8gXHRyZXR1cm4gLy4qY29tXFwuc2FwXFwudm9jYWJ1bGFyaWVzXFwuVUlcXC52MVxcLihGaWVsZEdyb3VwfElkZW50aWZpY2F0aW9ufERhdGFQb2ludHxTdGF0dXNJbmZvKS4qLy50ZXN0KGFubm90YXRpb25QYXRoLnZhbHVlKTtcbi8vIH1cbmNvbnN0IGdldFN1YlNlY3Rpb25LZXkgPSAoZmFjZXREZWZpbml0aW9uOiBGYWNldFR5cGVzLCBmYWxsYmFjazogc3RyaW5nKTogc3RyaW5nID0+IHtcblx0cmV0dXJuIGZhY2V0RGVmaW5pdGlvbi5JRD8udG9TdHJpbmcoKSB8fCBmYWNldERlZmluaXRpb24uTGFiZWw/LnRvU3RyaW5nKCkgfHwgZmFsbGJhY2s7XG59O1xuLyoqXG4gKiBBZGRzIEZvcm0gbWVudSBhY3Rpb24gdG8gYWxsIGZvcm0gYWN0aW9ucywgcmVtb3ZlcyBkdXBsaWNhdGUgYWN0aW9ucyBhbmQgaGlkZGVuIGFjdGlvbnMuXG4gKlxuICogQHBhcmFtIGFjdGlvbnMgVGhlIGFjdGlvbnMgaW52b2x2ZWRcbiAqIEBwYXJhbSBmYWNldERlZmluaXRpb24gVGhlIGRlZmluaXRpb24gZm9yIHRoZSBmYWNldFxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgZm9ybSBtZW51IGFjdGlvbnNcbiAqL1xuZnVuY3Rpb24gYWRkRm9ybU1lbnVBY3Rpb25zKGFjdGlvbnM6IENvbnZlcnRlckFjdGlvbltdLCBmYWNldERlZmluaXRpb246IEZhY2V0VHlwZXMsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBDb21iaW5lZEFjdGlvbiB7XG5cdGNvbnN0IGhpZGRlbkFjdGlvbnM6IEJhc2VBY3Rpb25bXSA9IGdldEZvcm1IaWRkZW5BY3Rpb25zKGZhY2V0RGVmaW5pdGlvbiwgY29udmVydGVyQ29udGV4dCkgfHwgW10sXG5cdFx0Zm9ybUFjdGlvbnM6IENvbmZpZ3VyYWJsZVJlY29yZDxNYW5pZmVzdEFjdGlvbj4gPSBnZXRGb3JtQWN0aW9ucyhmYWNldERlZmluaXRpb24sIGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdG1hbmlmZXN0QWN0aW9ucyA9IGdldEFjdGlvbnNGcm9tTWFuaWZlc3QoZm9ybUFjdGlvbnMsIGNvbnZlcnRlckNvbnRleHQsIGFjdGlvbnMsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBoaWRkZW5BY3Rpb25zKSxcblx0XHRhY3Rpb25PdmVyd3JpdGVDb25maWc6IE92ZXJyaWRlVHlwZUFjdGlvbiA9IHtcblx0XHRcdGVuYWJsZWQ6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0XHR2aXNpYmxlOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdFx0Y29tbWFuZDogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZVxuXHRcdH0sXG5cdFx0Zm9ybUFsbEFjdGlvbnMgPSBpbnNlcnRDdXN0b21FbGVtZW50cyhhY3Rpb25zLCBtYW5pZmVzdEFjdGlvbnMuYWN0aW9ucywgYWN0aW9uT3ZlcndyaXRlQ29uZmlnKTtcblx0cmV0dXJuIHtcblx0XHRhY3Rpb25zOiBmb3JtQWxsQWN0aW9ucyA/IGdldFZpc2liaWxpdHlFbmFibGVtZW50Rm9ybU1lbnVBY3Rpb25zKHJlbW92ZUR1cGxpY2F0ZUFjdGlvbnMoZm9ybUFsbEFjdGlvbnMpKSA6IGFjdGlvbnMsXG5cdFx0Y29tbWFuZEFjdGlvbnM6IG1hbmlmZXN0QWN0aW9ucy5jb21tYW5kQWN0aW9uc1xuXHR9O1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgYWN0aW9uIGZvcm0gYSBmYWNldC5cbiAqXG4gKiBAcGFyYW0gZmFjZXREZWZpbml0aW9uXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHJldHVybnMgVGhlIGN1cnJlbnQgZmFjZXQgYWN0aW9uc1xuICovXG5mdW5jdGlvbiBnZXRGYWNldEFjdGlvbnMoZmFjZXREZWZpbml0aW9uOiBGYWNldFR5cGVzLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogQ29tYmluZWRBY3Rpb24ge1xuXHRsZXQgYWN0aW9uczogQ29udmVydGVyQWN0aW9uW10gPSBbXTtcblx0c3dpdGNoIChmYWNldERlZmluaXRpb24uJFR5cGUpIHtcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkNvbGxlY3Rpb25GYWNldDpcblx0XHRcdGFjdGlvbnMgPSAoXG5cdFx0XHRcdGZhY2V0RGVmaW5pdGlvbi5GYWNldHMuZmlsdGVyKChzdWJGYWNldERlZmluaXRpb24pID0+IGlzUmVmZXJlbmNlRmFjZXQoc3ViRmFjZXREZWZpbml0aW9uKSkgYXMgUmVmZXJlbmNlRmFjZXRUeXBlc1tdXG5cdFx0XHQpLnJlZHVjZShcblx0XHRcdFx0KGFjdGlvblJlZHVjZXI6IENvbnZlcnRlckFjdGlvbltdLCByZWZlcmVuY2VGYWNldCkgPT5cblx0XHRcdFx0XHRjcmVhdGVGb3JtQWN0aW9uUmVkdWNlcihhY3Rpb25SZWR1Y2VyLCByZWZlcmVuY2VGYWNldCwgY29udmVydGVyQ29udGV4dCksXG5cdFx0XHRcdFtdXG5cdFx0XHQpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5SZWZlcmVuY2VGYWNldDpcblx0XHRcdGFjdGlvbnMgPSBjcmVhdGVGb3JtQWN0aW9uUmVkdWNlcihbXSwgZmFjZXREZWZpbml0aW9uLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRicmVhaztcblx0fVxuXHRyZXR1cm4gYWRkRm9ybU1lbnVBY3Rpb25zKGFjdGlvbnMsIGZhY2V0RGVmaW5pdGlvbiwgY29udmVydGVyQ29udGV4dCk7XG59XG4vKipcbiAqIFJldHVybnMgdGhlIGJ1dHRvbiB0eXBlIGJhc2VkIG9uIEBVSS5FbXBoYXNpemVkIGFubm90YXRpb24uXG4gKlxuICogQHBhcmFtIGVtcGhhc2l6ZWQgRW1waGFzaXplZCBhbm5vdGF0aW9uIHZhbHVlLlxuICogQHJldHVybnMgVGhlIGJ1dHRvbiB0eXBlIG9yIHBhdGggYmFzZWQgZXhwcmVzc2lvbi5cbiAqL1xuZnVuY3Rpb24gZ2V0QnV0dG9uVHlwZShlbXBoYXNpemVkOiBFbXBoYXNpemVkIHwgdW5kZWZpbmVkKTogQnV0dG9uVHlwZSB7XG5cdC8vIEVtcGhhc2l6ZWQgaXMgYSBib29sZWFuIHNvIGlmIGl0J3MgZXF1YWwgdG8gdHJ1ZSB3ZSBzaG93IHRoZSBidXR0b24gYXMgR2hvc3QsIG90aGVyd2lzZSBhcyBUcmFuc3BhcmVudFxuXHRjb25zdCBidXR0b25UeXBlQ29uZGl0aW9uID0gZXF1YWwoZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGVtcGhhc2l6ZWQpLCB0cnVlKTtcblx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGlmRWxzZShidXR0b25UeXBlQ29uZGl0aW9uLCBCdXR0b25UeXBlLkdob3N0LCBCdXR0b25UeXBlLlRyYW5zcGFyZW50KSkgYXMgQnV0dG9uVHlwZTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBzdWJzZWN0aW9uIGJhc2VkIG9uIEZhY2V0VHlwZXMuXG4gKlxuICogQHBhcmFtIGZhY2V0RGVmaW5pdGlvblxuICogQHBhcmFtIGZhY2V0c1RvQ3JlYXRlXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHBhcmFtIGxldmVsXG4gKiBAcGFyYW0gaGFzU2luZ2xlQ29udGVudFxuICogQHBhcmFtIGlzSGVhZGVyU2VjdGlvblxuICogQHJldHVybnMgQSBzdWJzZWN0aW9uIGRlZmluaXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN1YlNlY3Rpb24oXG5cdGZhY2V0RGVmaW5pdGlvbjogRmFjZXRUeXBlcyxcblx0ZmFjZXRzVG9DcmVhdGU6IEZhY2V0VHlwZXNbXSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0bGV2ZWw6IG51bWJlcixcblx0aGFzU2luZ2xlQ29udGVudDogYm9vbGVhbixcblx0aXNIZWFkZXJTZWN0aW9uPzogYm9vbGVhblxuKTogT2JqZWN0UGFnZVN1YlNlY3Rpb24ge1xuXHRjb25zdCBzdWJTZWN0aW9uSUQgPSBnZXRTdWJTZWN0aW9uSUQoZmFjZXREZWZpbml0aW9uKTtcblx0Y29uc3Qgb0hpZGRlbkFubm90YXRpb24gPSBmYWNldERlZmluaXRpb24uYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW47XG5cdGNvbnN0IGlzVmlzaWJsZUV4cHJlc3Npb24gPSBub3QoZXF1YWwodHJ1ZSwgZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKG9IaWRkZW5Bbm5vdGF0aW9uKSkpO1xuXHRjb25zdCBpc1Zpc2libGUgPSBjb21waWxlRXhwcmVzc2lvbihpc1Zpc2libGVFeHByZXNzaW9uKTtcblx0Y29uc3QgaXNEeW5hbWljRXhwcmVzc2lvbiA9XG5cdFx0aXNWaXNpYmxlICE9PSB1bmRlZmluZWQgJiZcblx0XHR0eXBlb2YgaXNWaXNpYmxlID09PSBcInN0cmluZ1wiICYmXG5cdFx0aXNWaXNpYmxlLmluZGV4T2YoXCJ7PVwiKSA9PT0gMCAmJlxuXHRcdCFpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbihvSGlkZGVuQW5ub3RhdGlvbik7XG5cdGNvbnN0IGlzVmlzaWJsZUR5bmFtaWNFeHByZXNzaW9uID1cblx0XHRpc1Zpc2libGUgJiYgaXNEeW5hbWljRXhwcmVzc2lvblxuXHRcdFx0PyBpc1Zpc2libGUuc3Vic3RyaW5nKGlzVmlzaWJsZS5pbmRleE9mKFwiez1cIikgKyAyLCBpc1Zpc2libGUubGFzdEluZGV4T2YoXCJ9XCIpKSAhPT0gdW5kZWZpbmVkXG5cdFx0XHQ6IGZhbHNlO1xuXHRjb25zdCB0aXRsZSA9IGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihmYWNldERlZmluaXRpb24uTGFiZWwpKTtcblx0Y29uc3Qgc3ViU2VjdGlvbjogQmFzZVN1YlNlY3Rpb24gPSB7XG5cdFx0aWQ6IHN1YlNlY3Rpb25JRCxcblx0XHRrZXk6IGdldFN1YlNlY3Rpb25LZXkoZmFjZXREZWZpbml0aW9uLCBzdWJTZWN0aW9uSUQpLFxuXHRcdHRpdGxlOiB0aXRsZSxcblx0XHR0eXBlOiBTdWJTZWN0aW9uVHlwZS5Vbmtub3duLFxuXHRcdGFubm90YXRpb25QYXRoOiBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgoZmFjZXREZWZpbml0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZSksXG5cdFx0dmlzaWJsZTogaXNWaXNpYmxlLFxuXHRcdGlzVmlzaWJpbGl0eUR5bmFtaWM6IGlzRHluYW1pY0V4cHJlc3Npb24sXG5cdFx0bGV2ZWw6IGxldmVsLFxuXHRcdHNpZGVDb250ZW50OiB1bmRlZmluZWQsXG5cdFx0b2JqZWN0UGFnZUxhenlMb2FkZXJFbmFibGVkOiBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpLmdldEVuYWJsZUxhenlMb2FkaW5nKClcblx0fTtcblx0aWYgKGlzSGVhZGVyU2VjdGlvbikge1xuXHRcdHN1YlNlY3Rpb24uc3Rhc2hlZCA9IGdldFN0YXNoZWRTZXR0aW5nc0ZvckhlYWRlckZhY2V0KGZhY2V0RGVmaW5pdGlvbiwgZmFjZXREZWZpbml0aW9uLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0XHRzdWJTZWN0aW9uLmZsZXhTZXR0aW5ncyA9IHtcblx0XHRcdGRlc2lnbnRpbWU6IGdldERlc2lnblRpbWVNZXRhZGF0YVNldHRpbmdzRm9ySGVhZGVyRmFjZXQoZmFjZXREZWZpbml0aW9uLCBmYWNldERlZmluaXRpb24sIGNvbnZlcnRlckNvbnRleHQpXG5cdFx0fTtcblx0fVxuXHRsZXQgdW5zdXBwb3J0ZWRUZXh0ID0gXCJcIjtcblx0bGV2ZWwrKztcblx0c3dpdGNoIChmYWNldERlZmluaXRpb24uJFR5cGUpIHtcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkNvbGxlY3Rpb25GYWNldDpcblx0XHRcdGNvbnN0IGZhY2V0cyA9IGZhY2V0RGVmaW5pdGlvbi5GYWNldHM7XG5cblx0XHRcdC8vIEZpbHRlciBmb3IgYWxsIGZhY2V0cyBvZiB0aGlzIHN1YnNlY3Rpb24gdGhhdCBhcmUgcmVmZXJyaW5nIHRvIGFuIGFubm90YXRpb24gZGVzY3JpYmluZyBhIHZpc3VhbGl6YXRpb24gKGUuZy4gdGFibGUgb3IgY2hhcnQpXG5cdFx0XHRjb25zdCB2aXN1YWxpemF0aW9uRmFjZXRzID0gZmFjZXRzXG5cdFx0XHRcdC5tYXAoKGZhY2V0LCBpbmRleCkgPT4gKHsgaW5kZXgsIGZhY2V0IH0pKSAvLyBSZW1lbWJlciB0aGUgaW5kZXggYXNzaWduZWQgdG8gZWFjaCBmYWNldFxuXHRcdFx0XHQuZmlsdGVyKCh7IGZhY2V0IH0pID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gdmlzdWFsaXphdGlvblRlcm1zLmluY2x1ZGVzKChmYWNldCBhcyBSZWZlcmVuY2VGYWNldCkuVGFyZ2V0Py4kdGFyZ2V0Py50ZXJtKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdC8vIEZpbHRlciBvdXQgYWxsIHZpc3VhbGl6YXRpb24gZmFjZXRzOyBcInZpc3VhbGl6YXRpb25GYWNldHNcIiBhbmQgXCJub25WaXN1YWxpemF0aW9uRmFjZXRzXCIgYXJlIGRpc2pvaW50XG5cdFx0XHRjb25zdCBub25WaXN1YWxpemF0aW9uRmFjZXRzID0gZmFjZXRzLmZpbHRlcihcblx0XHRcdFx0KGZhY2V0KSA9PiAhdmlzdWFsaXphdGlvbkZhY2V0cy5maW5kKCh2aXN1YWxpemF0aW9uKSA9PiB2aXN1YWxpemF0aW9uLmZhY2V0ID09PSBmYWNldClcblx0XHRcdCk7XG5cblx0XHRcdGlmICh2aXN1YWxpemF0aW9uRmFjZXRzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0Ly8gQ29sbGVjdGlvbkZhY2V0cyB3aXRoIHZpc3VhbGl6YXRpb25zIG11c3QgYmUgaGFuZGxlZCBzZXBhcmF0ZWx5IGFzIHRoZXkgY2Fubm90IGJlIGluY2x1ZGVkIGluIGZvcm1zXG5cdFx0XHRcdGNvbnN0IHZpc3VhbGl6YXRpb25Db250ZW50OiBPYmplY3RQYWdlU3ViU2VjdGlvbltdID0gW107XG5cdFx0XHRcdGNvbnN0IGZvcm1Db250ZW50OiBPYmplY3RQYWdlU3ViU2VjdGlvbltdID0gW107XG5cdFx0XHRcdGNvbnN0IG1peGVkQ29udGVudDogT2JqZWN0UGFnZVN1YlNlY3Rpb25bXSA9IFtdO1xuXG5cdFx0XHRcdC8vIENyZWF0ZSBlYWNoIHZpc3VhbGl6YXRpb24gZmFjZXQgYXMgaWYgaXQgd2FzIGl0cyBvd24gc3Vic2VjdGlvbiAodmlhIHJlY3Vyc2lvbiksIGFuZCBrZWVwIHRoZWlyIHJlbGF0aXZlIG9yZGVyaW5nXG5cdFx0XHRcdGZvciAoY29uc3QgeyBmYWNldCB9IG9mIHZpc3VhbGl6YXRpb25GYWNldHMpIHtcblx0XHRcdFx0XHR2aXN1YWxpemF0aW9uQ29udGVudC5wdXNoKGNyZWF0ZVN1YlNlY3Rpb24oZmFjZXQsIFtdLCBjb252ZXJ0ZXJDb250ZXh0LCBsZXZlbCwgdHJ1ZSwgaXNIZWFkZXJTZWN0aW9uKSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAobm9uVmlzdWFsaXphdGlvbkZhY2V0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0Ly8gVGhpcyBzdWJzZWN0aW9uIGluY2x1ZGVzIHZpc3VhbGl6YXRpb25zIGFuZCBvdGhlciBjb250ZW50LCBzbyBpdCBpcyBhIFwiTWl4ZWRcIiBzdWJzZWN0aW9uXG5cdFx0XHRcdFx0TG9nLndhcm5pbmcoXG5cdFx0XHRcdFx0XHRgV2FybmluZzogQ29sbGVjdGlvbkZhY2V0ICcke2ZhY2V0RGVmaW5pdGlvbi5JRH0nIGluY2x1ZGVzIGEgY29tYmluYXRpb24gb2YgZWl0aGVyIGEgY2hhcnQgb3IgYSB0YWJsZSBhbmQgb3RoZXIgY29udGVudC4gVGhpcyBjYW4gbGVhZCB0byByZW5kZXJpbmcgaXNzdWVzLiBDb25zaWRlciBtb3ZpbmcgdGhlIGNoYXJ0IG9yIHRhYmxlIGludG8gYSBzZXBhcmF0ZSBDb2xsZWN0aW9uRmFjZXQuYFxuXHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRjb25zdCBmYWtlRm9ybUZhY2V0ID0geyAuLi5mYWNldERlZmluaXRpb24gfTtcblx0XHRcdFx0XHRmYWtlRm9ybUZhY2V0LkZhY2V0cyA9IG5vblZpc3VhbGl6YXRpb25GYWNldHM7XG5cdFx0XHRcdFx0Ly8gQ3JlYXRlIGEgam9pbmVkIGZvcm0gb2YgYWxsIGZhY2V0cyB0aGF0IGFyZSBub3QgcmVmZXJyaW5nIHRvIHZpc3VhbGl6YXRpb25zXG5cdFx0XHRcdFx0Zm9ybUNvbnRlbnQucHVzaChjcmVhdGVTdWJTZWN0aW9uKGZha2VGb3JtRmFjZXQsIFtdLCBjb252ZXJ0ZXJDb250ZXh0LCBsZXZlbCwgaGFzU2luZ2xlQ29udGVudCwgaXNIZWFkZXJTZWN0aW9uKSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBNZXJnZSB0aGUgdmlzdWFsaXphdGlvbiBjb250ZW50IHdpdGggdGhlIGZvcm0gY29udGVudFxuXHRcdFx0XHRpZiAodmlzdWFsaXphdGlvbkZhY2V0cy5maW5kKCh7IGluZGV4IH0pID0+IGluZGV4ID09PSAwKSkge1xuXHRcdFx0XHRcdC8vIElmIHRoZSBmaXJzdCBmYWNldCBpcyBhIHZpc3VhbGl6YXRpb24sIGRpc3BsYXkgdGhlIHZpc3VhbGl6YXRpb25zIGZpcnN0XG5cdFx0XHRcdFx0bWl4ZWRDb250ZW50LnB1c2goLi4udmlzdWFsaXphdGlvbkNvbnRlbnQpO1xuXHRcdFx0XHRcdG1peGVkQ29udGVudC5wdXNoKC4uLmZvcm1Db250ZW50KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBPdGhlcndpc2UsIGRpc3BsYXkgdGhlIGZvcm0gZmlyc3Rcblx0XHRcdFx0XHRtaXhlZENvbnRlbnQucHVzaCguLi5mb3JtQ29udGVudCk7XG5cdFx0XHRcdFx0bWl4ZWRDb250ZW50LnB1c2goLi4udmlzdWFsaXphdGlvbkNvbnRlbnQpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgbWl4ZWRTdWJTZWN0aW9uOiBNaXhlZFN1YlNlY3Rpb24gPSB7XG5cdFx0XHRcdFx0Li4uc3ViU2VjdGlvbixcblx0XHRcdFx0XHR0eXBlOiBTdWJTZWN0aW9uVHlwZS5NaXhlZCxcblx0XHRcdFx0XHRsZXZlbDogbGV2ZWwsXG5cdFx0XHRcdFx0Y29udGVudDogbWl4ZWRDb250ZW50XG5cdFx0XHRcdH07XG5cdFx0XHRcdHJldHVybiBtaXhlZFN1YlNlY3Rpb247XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBUaGlzIENvbGxlY3Rpb25GYWNldCBvbmx5IGluY2x1ZGVzIGNvbnRlbnQgdGhhdCBjYW4gYmUgcmVuZGVyZWQgaW4gYSBtZXJnZWQgZm9ybVxuXHRcdFx0XHRjb25zdCBmYWNldEFjdGlvbnMgPSBnZXRGYWNldEFjdGlvbnMoZmFjZXREZWZpbml0aW9uLCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRcdFx0XHRmb3JtQ29sbGVjdGlvblN1YlNlY3Rpb246IEZvcm1TdWJTZWN0aW9uID0ge1xuXHRcdFx0XHRcdFx0Li4uc3ViU2VjdGlvbixcblx0XHRcdFx0XHRcdHR5cGU6IFN1YlNlY3Rpb25UeXBlLkZvcm0sXG5cdFx0XHRcdFx0XHRmb3JtRGVmaW5pdGlvbjogY3JlYXRlRm9ybURlZmluaXRpb24oZmFjZXREZWZpbml0aW9uLCBpc1Zpc2libGUsIGNvbnZlcnRlckNvbnRleHQsIGZhY2V0QWN0aW9ucy5hY3Rpb25zKSxcblx0XHRcdFx0XHRcdGxldmVsOiBsZXZlbCxcblx0XHRcdFx0XHRcdGFjdGlvbnM6IGZhY2V0QWN0aW9ucy5hY3Rpb25zLmZpbHRlcigoYWN0aW9uKSA9PiBhY3Rpb24uZmFjZXROYW1lID09PSB1bmRlZmluZWQpLFxuXHRcdFx0XHRcdFx0Y29tbWFuZEFjdGlvbnM6IGZhY2V0QWN0aW9ucy5jb21tYW5kQWN0aW9uc1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdHJldHVybiBmb3JtQ29sbGVjdGlvblN1YlNlY3Rpb247XG5cdFx0XHR9XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5SZWZlcmVuY2VGYWNldDpcblx0XHRcdGlmICghZmFjZXREZWZpbml0aW9uLlRhcmdldC4kdGFyZ2V0KSB7XG5cdFx0XHRcdHVuc3VwcG9ydGVkVGV4dCA9IGBVbmFibGUgdG8gZmluZCBhbm5vdGF0aW9uUGF0aCAke2ZhY2V0RGVmaW5pdGlvbi5UYXJnZXQudmFsdWV9YDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHN3aXRjaCAoZmFjZXREZWZpbml0aW9uLlRhcmdldC4kdGFyZ2V0LnRlcm0pIHtcblx0XHRcdFx0XHRjYXNlIFVJQW5ub3RhdGlvblRlcm1zLkxpbmVJdGVtOlxuXHRcdFx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuQ2hhcnQ6XG5cdFx0XHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5QcmVzZW50YXRpb25WYXJpYW50OlxuXHRcdFx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuU2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudDpcblx0XHRcdFx0XHRcdGNvbnN0IHByZXNlbnRhdGlvbiA9IGdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbihcblx0XHRcdFx0XHRcdFx0ZmFjZXREZWZpbml0aW9uLlRhcmdldC52YWx1ZSxcblx0XHRcdFx0XHRcdFx0Z2V0Q29uZGVuc2VkVGFibGVMYXlvdXRDb21wbGlhbmNlKGZhY2V0RGVmaW5pdGlvbiwgZmFjZXRzVG9DcmVhdGUsIGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdFx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcdGlzSGVhZGVyU2VjdGlvblxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGNvbnN0IHN1YlNlY3Rpb25UaXRsZTogc3RyaW5nID0gc3ViU2VjdGlvbi50aXRsZSA/IHN1YlNlY3Rpb24udGl0bGUgOiBcIlwiO1xuXHRcdFx0XHRcdFx0Y29uc3QgY29udHJvbFRpdGxlID1cblx0XHRcdFx0XHRcdFx0KHByZXNlbnRhdGlvbi52aXN1YWxpemF0aW9uc1swXSBhcyBUYWJsZVZpc3VhbGl6YXRpb24pPy5hbm5vdGF0aW9uPy50aXRsZSB8fFxuXHRcdFx0XHRcdFx0XHQocHJlc2VudGF0aW9uLnZpc3VhbGl6YXRpb25zWzBdIGFzIENoYXJ0VmlzdWFsaXphdGlvbik/LnRpdGxlO1xuXHRcdFx0XHRcdFx0Y29uc3QgaXNQYXJ0T2ZQcmV2aWV3ID0gZmFjZXREZWZpbml0aW9uLmFubm90YXRpb25zPy5VST8uUGFydE9mUHJldmlldz8udmFsdWVPZigpICE9PSBmYWxzZTtcblx0XHRcdFx0XHRcdGNvbnN0IHNob3dUaXRsZSA9IGdldFRpdGxlVmlzaWJpbGl0eShjb250cm9sVGl0bGUgPz8gXCJcIiwgc3ViU2VjdGlvblRpdGxlLCBoYXNTaW5nbGVDb250ZW50KTtcblxuXHRcdFx0XHRcdFx0Ly8gRWl0aGVyIGNhbGN1bGF0ZSB0aGUgdGl0bGUgdmlzaWJpbGl0eSBzdGF0aWNhbGx5IG9yIGR5bmFtaWNhbGx5XG5cdFx0XHRcdFx0XHQvLyBBZGRpdGlvbmFsbHkgdG8gY2hlY2tpbmcgd2hldGhlciBhIHRpdGxlIGV4aXN0cyxcblx0XHRcdFx0XHRcdC8vIHdlIGFsc28gbmVlZCB0byBjaGVjayB0aGF0IHRoZSBmYWNldCB0aXRsZSBpcyBub3QgdGhlIHNhbWUgYXMgdGhlIGNvbnRyb2wgKGkuZS4gdmlzdWFsaXphdGlvbikgdGl0bGU7XG5cdFx0XHRcdFx0XHQvLyB0aGlzIGlzIGRvbmUgYnkgaW5jbHVkaW5nIFwic2hvd1RpdGxlXCIgaW4gdGhlIGFuZCBleHByZXNzaW9uXG5cdFx0XHRcdFx0XHRjb25zdCB0aXRsZVZpc2libGUgPSBpZkVsc2UoXG5cdFx0XHRcdFx0XHRcdGlzRHluYW1pY0V4cHJlc3Npb24sXG5cdFx0XHRcdFx0XHRcdGFuZChpc1Zpc2libGVEeW5hbWljRXhwcmVzc2lvbiwgbm90KGVxdWFsKHRpdGxlLCBcInVuZGVmaW5lZFwiKSksIHNob3dUaXRsZSksXG5cdFx0XHRcdFx0XHRcdGFuZChpc1Zpc2libGUgIT09IHVuZGVmaW5lZCwgdGl0bGUgIT09IFwidW5kZWZpbmVkXCIsIHRpdGxlICE9PSB1bmRlZmluZWQsIGlzVmlzaWJsZUV4cHJlc3Npb24sIHNob3dUaXRsZSlcblx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdGNvbnN0IGRhdGFWaXN1YWxpemF0aW9uU3ViU2VjdGlvbjogRGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uID0ge1xuXHRcdFx0XHRcdFx0XHQuLi5zdWJTZWN0aW9uLFxuXHRcdFx0XHRcdFx0XHR0eXBlOiBTdWJTZWN0aW9uVHlwZS5EYXRhVmlzdWFsaXphdGlvbixcblx0XHRcdFx0XHRcdFx0bGV2ZWw6IGxldmVsLFxuXHRcdFx0XHRcdFx0XHRwcmVzZW50YXRpb246IHByZXNlbnRhdGlvbixcblx0XHRcdFx0XHRcdFx0c2hvd1RpdGxlOiBjb21waWxlRXhwcmVzc2lvbihzaG93VGl0bGUpLCAvLyBUaGlzIGlzIHVzZWQgb24gdGhlIE9iamVjdFBhZ2VTdWJTZWN0aW9uXG5cdFx0XHRcdFx0XHRcdGlzUGFydE9mUHJldmlldyxcblx0XHRcdFx0XHRcdFx0dGl0bGVWaXNpYmxlOiBjb21waWxlRXhwcmVzc2lvbih0aXRsZVZpc2libGUpIC8vIFRoaXMgaXMgdXNlZCB0byBoaWRlIHRoZSBhY3R1YWwgVGl0bGUgY29udHJvbFxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdHJldHVybiBkYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb247XG5cblx0XHRcdFx0XHRjYXNlIFVJQW5ub3RhdGlvblRlcm1zLkZpZWxkR3JvdXA6XG5cdFx0XHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5JZGVudGlmaWNhdGlvbjpcblx0XHRcdFx0XHRjYXNlIFVJQW5ub3RhdGlvblRlcm1zLkRhdGFQb2ludDpcblx0XHRcdFx0XHRjYXNlIFVJQW5ub3RhdGlvblRlcm1zLlN0YXR1c0luZm86XG5cdFx0XHRcdFx0Y2FzZSBDb21tdW5pY2F0aW9uQW5ub3RhdGlvblRlcm1zLkNvbnRhY3Q6XG5cdFx0XHRcdFx0XHQvLyBBbGwgdGhvc2UgZWxlbWVudCBiZWxvbmcgdG8gYSBmcm9tIGZhY2V0XG5cdFx0XHRcdFx0XHRjb25zdCBmYWNldEFjdGlvbnMgPSBnZXRGYWNldEFjdGlvbnMoZmFjZXREZWZpbml0aW9uLCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRcdFx0XHRcdFx0Zm9ybUVsZW1lbnRTdWJTZWN0aW9uOiBGb3JtU3ViU2VjdGlvbiA9IHtcblx0XHRcdFx0XHRcdFx0XHQuLi5zdWJTZWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRcdHR5cGU6IFN1YlNlY3Rpb25UeXBlLkZvcm0sXG5cdFx0XHRcdFx0XHRcdFx0bGV2ZWw6IGxldmVsLFxuXHRcdFx0XHRcdFx0XHRcdGZvcm1EZWZpbml0aW9uOiBjcmVhdGVGb3JtRGVmaW5pdGlvbihmYWNldERlZmluaXRpb24sIGlzVmlzaWJsZSwgY29udmVydGVyQ29udGV4dCwgZmFjZXRBY3Rpb25zLmFjdGlvbnMpLFxuXHRcdFx0XHRcdFx0XHRcdGFjdGlvbnM6IGZhY2V0QWN0aW9ucy5hY3Rpb25zLmZpbHRlcigoYWN0aW9uKSA9PiBhY3Rpb24uZmFjZXROYW1lID09PSB1bmRlZmluZWQpLFxuXHRcdFx0XHRcdFx0XHRcdGNvbW1hbmRBY3Rpb25zOiBmYWNldEFjdGlvbnMuY29tbWFuZEFjdGlvbnNcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdHJldHVybiBmb3JtRWxlbWVudFN1YlNlY3Rpb247XG5cblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0dW5zdXBwb3J0ZWRUZXh0ID0gYEZvciAke2ZhY2V0RGVmaW5pdGlvbi5UYXJnZXQuJHRhcmdldC50ZXJtfSBGcmFnbWVudGA7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5SZWZlcmVuY2VVUkxGYWNldDpcblx0XHRcdHVuc3VwcG9ydGVkVGV4dCA9IFwiRm9yIFJlZmVyZW5jZSBVUkwgRmFjZXRcIjtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRicmVhaztcblx0fVxuXHQvLyBJZiB3ZSByZWFjaCBoZXJlIHdlIGVuZGVkIHVwIHdpdGggYW4gdW5zdXBwb3J0ZWQgU3ViU2VjdGlvbiB0eXBlXG5cdGNvbnN0IHVuc3VwcG9ydGVkU3ViU2VjdGlvbjogVW5zdXBwb3J0ZWRTdWJTZWN0aW9uID0ge1xuXHRcdC4uLnN1YlNlY3Rpb24sXG5cdFx0dGV4dDogdW5zdXBwb3J0ZWRUZXh0XG5cdH07XG5cdHJldHVybiB1bnN1cHBvcnRlZFN1YlNlY3Rpb247XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdG8gaGlkZSBvciBzaG93IHN1YnNlY3Rpb24gdGl0bGUuXG4gKlxuICogQHBhcmFtIGNvbnRyb2xUaXRsZVxuICogQHBhcmFtIHN1YlNlY3Rpb25UaXRsZVxuICogQHBhcmFtIGhhc1NpbmdsZUNvbnRlbnRcbiAqIEByZXR1cm5zIEJvb2xlYW4gdmFsdWUgb3IgZXhwcmVzc2lvbiBmb3Igc2hvd1RpdGxlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUaXRsZVZpc2liaWxpdHkoXG5cdGNvbnRyb2xUaXRsZTogc3RyaW5nLFxuXHRzdWJTZWN0aW9uVGl0bGU6IHN0cmluZyxcblx0aGFzU2luZ2xlQ29udGVudDogYm9vbGVhblxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+IHtcblx0Ly8gdmlzaWJsZSBzaGFsbCBiZSB0cnVlIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBjb250ZW50IG9yIGlmIHRoZSBjb250cm9sIGFuZCBzdWJzZWN0aW9uIHRpdGxlIGFyZSBkaWZmZXJlbnRcblx0cmV0dXJuIG9yKG5vdChoYXNTaW5nbGVDb250ZW50KSwgbm90RXF1YWwocmVzb2x2ZUJpbmRpbmdTdHJpbmcoY29udHJvbFRpdGxlKSwgcmVzb2x2ZUJpbmRpbmdTdHJpbmcoc3ViU2VjdGlvblRpdGxlKSkpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVGb3JtQWN0aW9uUmVkdWNlcihcblx0YWN0aW9uczogQ29udmVydGVyQWN0aW9uW10sXG5cdGZhY2V0RGVmaW5pdGlvbjogUmVmZXJlbmNlRmFjZXRUeXBlcyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogQ29udmVydGVyQWN0aW9uW10ge1xuXHRjb25zdCByZWZlcmVuY2VUYXJnZXQgPSBmYWNldERlZmluaXRpb24uVGFyZ2V0LiR0YXJnZXQ7XG5cdGNvbnN0IHRhcmdldFZhbHVlID0gZmFjZXREZWZpbml0aW9uLlRhcmdldC52YWx1ZTtcblx0bGV0IG1hbmlmZXN0QWN0aW9uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPiA9IHt9O1xuXHRsZXQgZGF0YUZpZWxkQ29sbGVjdGlvbjogRGF0YUZpZWxkQWJzdHJhY3RUeXBlc1tdID0gW107XG5cdGxldCBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdFtuYXZpZ2F0aW9uUHJvcGVydHlQYXRoXSA9IHRhcmdldFZhbHVlLnNwbGl0KFwiQFwiKTtcblx0aWYgKG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgubGVuZ3RoID4gMCkge1xuXHRcdGlmIChuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLmxhc3RJbmRleE9mKFwiL1wiKSA9PT0gbmF2aWdhdGlvblByb3BlcnR5UGF0aC5sZW5ndGggLSAxKSB7XG5cdFx0XHRuYXZpZ2F0aW9uUHJvcGVydHlQYXRoID0gbmF2aWdhdGlvblByb3BlcnR5UGF0aC5zdWJzdHIoMCwgbmF2aWdhdGlvblByb3BlcnR5UGF0aC5sZW5ndGggLSAxKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0bmF2aWdhdGlvblByb3BlcnR5UGF0aCA9IHVuZGVmaW5lZDtcblx0fVxuXG5cdGlmIChyZWZlcmVuY2VUYXJnZXQpIHtcblx0XHRzd2l0Y2ggKHJlZmVyZW5jZVRhcmdldC50ZXJtKSB7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblRlcm1zLkZpZWxkR3JvdXA6XG5cdFx0XHRcdGRhdGFGaWVsZENvbGxlY3Rpb24gPSAocmVmZXJlbmNlVGFyZ2V0IGFzIEZpZWxkR3JvdXApLkRhdGE7XG5cdFx0XHRcdG1hbmlmZXN0QWN0aW9ucyA9IGdldEFjdGlvbnNGcm9tTWFuaWZlc3QoXG5cdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uKHJlZmVyZW5jZVRhcmdldCkuYWN0aW9ucyxcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHRmYWNldERlZmluaXRpb24uZnVsbHlRdWFsaWZpZWROYW1lXG5cdFx0XHRcdCkuYWN0aW9ucztcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblRlcm1zLklkZW50aWZpY2F0aW9uOlxuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5TdGF0dXNJbmZvOlxuXHRcdFx0XHRpZiAocmVmZXJlbmNlVGFyZ2V0LnF1YWxpZmllcikge1xuXHRcdFx0XHRcdGRhdGFGaWVsZENvbGxlY3Rpb24gPSByZWZlcmVuY2VUYXJnZXQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHRhY3Rpb25zID0gZGF0YUZpZWxkQ29sbGVjdGlvbi5yZWR1Y2UoKGFjdGlvblJlZHVjZXIsIGRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcykgPT4ge1xuXHRcdHN3aXRjaCAoZGF0YUZpZWxkLiRUeXBlKSB7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRcdFx0aWYgKGRhdGFGaWVsZC5SZXF1aXJlc0NvbnRleHQ/LnZhbHVlT2YoKSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHRcblx0XHRcdFx0XHRcdC5nZXREaWFnbm9zdGljcygpXG5cdFx0XHRcdFx0XHQuYWRkSXNzdWUoSXNzdWVDYXRlZ29yeS5Bbm5vdGF0aW9uLCBJc3N1ZVNldmVyaXR5LkxvdywgSXNzdWVUeXBlLk1BTEZPUk1FRF9EQVRBRklFTERfRk9SX0lCTi5SRVFVSVJFU0NPTlRFWFQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChkYXRhRmllbGQuSW5saW5lPy52YWx1ZU9mKCkgPT09IHRydWUpIHtcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0XG5cdFx0XHRcdFx0XHQuZ2V0RGlhZ25vc3RpY3MoKVxuXHRcdFx0XHRcdFx0LmFkZElzc3VlKElzc3VlQ2F0ZWdvcnkuQW5ub3RhdGlvbiwgSXNzdWVTZXZlcml0eS5Mb3csIElzc3VlVHlwZS5NQUxGT1JNRURfREFUQUZJRUxEX0ZPUl9JQk4uSU5MSU5FKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoZGF0YUZpZWxkLkRldGVybWluaW5nPy52YWx1ZU9mKCkgPT09IHRydWUpIHtcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0XG5cdFx0XHRcdFx0XHQuZ2V0RGlhZ25vc3RpY3MoKVxuXHRcdFx0XHRcdFx0LmFkZElzc3VlKElzc3VlQ2F0ZWdvcnkuQW5ub3RhdGlvbiwgSXNzdWVTZXZlcml0eS5Mb3csIElzc3VlVHlwZS5NQUxGT1JNRURfREFUQUZJRUxEX0ZPUl9JQk4uREVURVJNSU5JTkcpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IG1OYXZpZ2F0aW9uUGFyYW1ldGVyczogTmF2aWdhdGlvblBhcmFtZXRlcnMgPSB7fTtcblx0XHRcdFx0aWYgKGRhdGFGaWVsZC5NYXBwaW5nKSB7XG5cdFx0XHRcdFx0bU5hdmlnYXRpb25QYXJhbWV0ZXJzLnNlbWFudGljT2JqZWN0TWFwcGluZyA9IGdldFNlbWFudGljT2JqZWN0TWFwcGluZyhkYXRhRmllbGQuTWFwcGluZyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YWN0aW9uUmVkdWNlci5wdXNoKHtcblx0XHRcdFx0XHR0eXBlOiBBY3Rpb25UeXBlLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbixcblx0XHRcdFx0XHRpZDogZ2V0Rm9ybUlEKGZhY2V0RGVmaW5pdGlvbiwgZGF0YUZpZWxkKSxcblx0XHRcdFx0XHRrZXk6IEtleUhlbHBlci5nZW5lcmF0ZUtleUZyb21EYXRhRmllbGQoZGF0YUZpZWxkKSxcblx0XHRcdFx0XHR0ZXh0OiBkYXRhRmllbGQuTGFiZWw/LnRvU3RyaW5nKCksXG5cdFx0XHRcdFx0YW5ub3RhdGlvblBhdGg6IFwiXCIsXG5cdFx0XHRcdFx0ZW5hYmxlZDpcblx0XHRcdFx0XHRcdGRhdGFGaWVsZC5OYXZpZ2F0aW9uQXZhaWxhYmxlICE9PSB1bmRlZmluZWRcblx0XHRcdFx0XHRcdFx0PyBjb21waWxlRXhwcmVzc2lvbihlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZGF0YUZpZWxkLk5hdmlnYXRpb25BdmFpbGFibGU/LnZhbHVlT2YoKSksIHRydWUpKVxuXHRcdFx0XHRcdFx0XHQ6IFwidHJ1ZVwiLFxuXHRcdFx0XHRcdHZpc2libGU6IGNvbXBpbGVFeHByZXNzaW9uKG5vdChlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uSGlkZGVuPy52YWx1ZU9mKCkpLCB0cnVlKSkpLFxuXHRcdFx0XHRcdGJ1dHRvblR5cGU6IGdldEJ1dHRvblR5cGUoZGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uRW1waGFzaXplZCksXG5cdFx0XHRcdFx0cHJlc3M6IGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRcdFx0Zm4oXCIuX2ludGVudEJhc2VkTmF2aWdhdGlvbi5uYXZpZ2F0ZVwiLCBbXG5cdFx0XHRcdFx0XHRcdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihkYXRhRmllbGQuU2VtYW50aWNPYmplY3QpLFxuXHRcdFx0XHRcdFx0XHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZGF0YUZpZWxkLkFjdGlvbiksXG5cdFx0XHRcdFx0XHRcdG1OYXZpZ2F0aW9uUGFyYW1ldGVyc1xuXHRcdFx0XHRcdFx0XSlcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdGN1c3RvbURhdGE6IGNvbXBpbGVFeHByZXNzaW9uKHtcblx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZGF0YUZpZWxkLlNlbWFudGljT2JqZWN0KSxcblx0XHRcdFx0XHRcdGFjdGlvbjogZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGRhdGFGaWVsZC5BY3Rpb24pXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb246XG5cdFx0XHRcdGNvbnN0IGZvcm1NYW5pZmVzdEFjdGlvbnNDb25maWd1cmF0aW9uID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uKHJlZmVyZW5jZVRhcmdldCkuYWN0aW9ucztcblx0XHRcdFx0Y29uc3Qga2V5OiBzdHJpbmcgPSBLZXlIZWxwZXIuZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKGRhdGFGaWVsZCk7XG5cdFx0XHRcdGFjdGlvblJlZHVjZXIucHVzaCh7XG5cdFx0XHRcdFx0dHlwZTogQWN0aW9uVHlwZS5EYXRhRmllbGRGb3JBY3Rpb24sXG5cdFx0XHRcdFx0aWQ6IGdldEZvcm1JRChmYWNldERlZmluaXRpb24sIGRhdGFGaWVsZCksXG5cdFx0XHRcdFx0a2V5OiBrZXksXG5cdFx0XHRcdFx0dGV4dDogZGF0YUZpZWxkLkxhYmVsPy50b1N0cmluZygpLFxuXHRcdFx0XHRcdGFubm90YXRpb25QYXRoOiBcIlwiLFxuXHRcdFx0XHRcdGVuYWJsZWQ6IGdldEVuYWJsZWRGb3JBbm5vdGF0aW9uQWN0aW9uKGNvbnZlcnRlckNvbnRleHQsIGRhdGFGaWVsZC5BY3Rpb25UYXJnZXQpLFxuXHRcdFx0XHRcdGJpbmRpbmc6IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggPyBgeyAncGF0aCcgOiAnJHtuYXZpZ2F0aW9uUHJvcGVydHlQYXRofSd9YCA6IHVuZGVmaW5lZCxcblx0XHRcdFx0XHR2aXNpYmxlOiBjb21waWxlRXhwcmVzc2lvbihub3QoZXF1YWwoZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGRhdGFGaWVsZC5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbj8udmFsdWVPZigpKSwgdHJ1ZSkpKSxcblx0XHRcdFx0XHRyZXF1aXJlc0RpYWxvZzogaXNBY3Rpb25XaXRoRGlhbG9nKGRhdGFGaWVsZCksXG5cdFx0XHRcdFx0YnV0dG9uVHlwZTogZ2V0QnV0dG9uVHlwZShkYXRhRmllbGQuYW5ub3RhdGlvbnM/LlVJPy5FbXBoYXNpemVkKSxcblx0XHRcdFx0XHRwcmVzczogY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRcdFx0XHRmbihcblx0XHRcdFx0XHRcdFx0XCJpbnZva2VBY3Rpb25cIixcblx0XHRcdFx0XHRcdFx0W1xuXHRcdFx0XHRcdFx0XHRcdGRhdGFGaWVsZC5BY3Rpb24sXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29udGV4dHM6IGZuKFwiZ2V0QmluZGluZ0NvbnRleHRcIiwgW10sIHBhdGhJbk1vZGVsKFwiXCIsIFwiJHNvdXJjZVwiKSksXG5cdFx0XHRcdFx0XHRcdFx0XHRpbnZvY2F0aW9uR3JvdXBpbmc6IChkYXRhRmllbGQuSW52b2NhdGlvbkdyb3VwaW5nID09PSBcIlVJLk9wZXJhdGlvbkdyb3VwaW5nVHlwZS9DaGFuZ2VTZXRcIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ/IFwiQ2hhbmdlU2V0XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0OiBcIklzb2xhdGVkXCIpIGFzIE9wZXJhdGlvbkdyb3VwaW5nVHlwZSxcblx0XHRcdFx0XHRcdFx0XHRcdGxhYmVsOiBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZGF0YUZpZWxkLkxhYmVsKSxcblx0XHRcdFx0XHRcdFx0XHRcdG1vZGVsOiBmbihcImdldE1vZGVsXCIsIFtdLCBwYXRoSW5Nb2RlbChcIi9cIiwgXCIkc291cmNlXCIpKSxcblx0XHRcdFx0XHRcdFx0XHRcdGlzTmF2aWdhYmxlOiBpc0FjdGlvbk5hdmlnYWJsZShcblx0XHRcdFx0XHRcdFx0XHRcdFx0Zm9ybU1hbmlmZXN0QWN0aW9uc0NvbmZpZ3VyYXRpb24gJiYgZm9ybU1hbmlmZXN0QWN0aW9uc0NvbmZpZ3VyYXRpb25ba2V5XVxuXHRcdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XSxcblx0XHRcdFx0XHRcdFx0cmVmKFwiLmVkaXRGbG93XCIpXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRmYWNldE5hbWU6IGRhdGFGaWVsZC5JbmxpbmUgPyBmYWNldERlZmluaXRpb24uZnVsbHlRdWFsaWZpZWROYW1lIDogdW5kZWZpbmVkXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRyZXR1cm4gYWN0aW9uUmVkdWNlcjtcblx0fSwgYWN0aW9ucyk7XG5cdC8vIE92ZXJ3cml0aW5nIG9mIGFjdGlvbnMgaGFwcGVucyBpbiBhZGRGb3JtTWVudUFjdGlvbnNcblx0cmV0dXJuIGluc2VydEN1c3RvbUVsZW1lbnRzKGFjdGlvbnMsIG1hbmlmZXN0QWN0aW9ucyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RpYWxvZyhhY3Rpb25EZWZpbml0aW9uOiBBY3Rpb24gfCB1bmRlZmluZWQpOiBzdHJpbmcge1xuXHRpZiAoYWN0aW9uRGVmaW5pdGlvbikge1xuXHRcdGNvbnN0IGJDcml0aWNhbCA9IGFjdGlvbkRlZmluaXRpb24uYW5ub3RhdGlvbnM/LkNvbW1vbj8uSXNBY3Rpb25Dcml0aWNhbDtcblx0XHRpZiAoYWN0aW9uRGVmaW5pdGlvbi5wYXJhbWV0ZXJzLmxlbmd0aCA+IDEgfHwgYkNyaXRpY2FsKSB7XG5cdFx0XHRyZXR1cm4gXCJEaWFsb2dcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIFwiTm9uZVwiO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gXCJOb25lXCI7XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUN1c3RvbVN1YlNlY3Rpb25zKFxuXHRtYW5pZmVzdFN1YlNlY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBNYW5pZmVzdFN1YlNlY3Rpb24+LFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21PYmplY3RQYWdlU3ViU2VjdGlvbj4ge1xuXHRjb25zdCBzdWJTZWN0aW9uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tT2JqZWN0UGFnZVN1YlNlY3Rpb24+ID0ge307XG5cdE9iamVjdC5rZXlzKG1hbmlmZXN0U3ViU2VjdGlvbnMpLmZvckVhY2goXG5cdFx0KHN1YlNlY3Rpb25LZXkpID0+XG5cdFx0XHQoc3ViU2VjdGlvbnNbc3ViU2VjdGlvbktleV0gPSBjcmVhdGVDdXN0b21TdWJTZWN0aW9uKG1hbmlmZXN0U3ViU2VjdGlvbnNbc3ViU2VjdGlvbktleV0sIHN1YlNlY3Rpb25LZXksIGNvbnZlcnRlckNvbnRleHQpKVxuXHQpO1xuXHRyZXR1cm4gc3ViU2VjdGlvbnM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDdXN0b21TdWJTZWN0aW9uKFxuXHRtYW5pZmVzdFN1YlNlY3Rpb246IE1hbmlmZXN0U3ViU2VjdGlvbixcblx0c3ViU2VjdGlvbktleTogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBDdXN0b21PYmplY3RQYWdlU3ViU2VjdGlvbiB7XG5cdGNvbnN0IHNpZGVDb250ZW50OiBTaWRlQ29udGVudERlZiB8IHVuZGVmaW5lZCA9IG1hbmlmZXN0U3ViU2VjdGlvbi5zaWRlQ29udGVudFxuXHRcdD8ge1xuXHRcdFx0XHR0ZW1wbGF0ZTogbWFuaWZlc3RTdWJTZWN0aW9uLnNpZGVDb250ZW50LnRlbXBsYXRlLFxuXHRcdFx0XHRpZDogZ2V0U2lkZUNvbnRlbnRJRChzdWJTZWN0aW9uS2V5KSxcblx0XHRcdFx0dmlzaWJsZTogZmFsc2UsXG5cdFx0XHRcdGVxdWFsU3BsaXQ6IG1hbmlmZXN0U3ViU2VjdGlvbi5zaWRlQ29udGVudC5lcXVhbFNwbGl0XG5cdFx0ICB9XG5cdFx0OiB1bmRlZmluZWQ7XG5cdGxldCBwb3NpdGlvbiA9IG1hbmlmZXN0U3ViU2VjdGlvbi5wb3NpdGlvbjtcblx0aWYgKCFwb3NpdGlvbikge1xuXHRcdHBvc2l0aW9uID0ge1xuXHRcdFx0cGxhY2VtZW50OiBQbGFjZW1lbnQuQWZ0ZXJcblx0XHR9O1xuXHR9XG5cdGNvbnN0IGlzVmlzaWJsZSA9IG1hbmlmZXN0U3ViU2VjdGlvbi52aXNpYmxlICE9PSB1bmRlZmluZWQgPyBtYW5pZmVzdFN1YlNlY3Rpb24udmlzaWJsZSA6IHRydWU7XG5cdGNvbnN0IGlzRHluYW1pY0V4cHJlc3Npb24gPSBpc1Zpc2libGUgJiYgdHlwZW9mIGlzVmlzaWJsZSA9PT0gXCJzdHJpbmdcIiAmJiBpc1Zpc2libGUuaW5kZXhPZihcIns9XCIpID09PSAwO1xuXHRjb25zdCBtYW5pZmVzdEFjdGlvbnMgPSBnZXRBY3Rpb25zRnJvbU1hbmlmZXN0KG1hbmlmZXN0U3ViU2VjdGlvbi5hY3Rpb25zLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3Qgc3ViU2VjdGlvbkRlZmluaXRpb24gPSB7XG5cdFx0dHlwZTogU3ViU2VjdGlvblR5cGUuVW5rbm93bixcblx0XHRpZDogbWFuaWZlc3RTdWJTZWN0aW9uLmlkIHx8IGdldEN1c3RvbVN1YlNlY3Rpb25JRChzdWJTZWN0aW9uS2V5KSxcblx0XHRhY3Rpb25zOiBtYW5pZmVzdEFjdGlvbnMuYWN0aW9ucyxcblx0XHRrZXk6IHN1YlNlY3Rpb25LZXksXG5cdFx0dGl0bGU6IG1hbmlmZXN0U3ViU2VjdGlvbi50aXRsZSxcblx0XHRsZXZlbDogMSxcblx0XHRwb3NpdGlvbjogcG9zaXRpb24sXG5cdFx0dmlzaWJsZTogbWFuaWZlc3RTdWJTZWN0aW9uLnZpc2libGUgIT09IHVuZGVmaW5lZCA/IG1hbmlmZXN0U3ViU2VjdGlvbi52aXNpYmxlIDogXCJ0cnVlXCIsXG5cdFx0c2lkZUNvbnRlbnQ6IHNpZGVDb250ZW50LFxuXHRcdGlzVmlzaWJpbGl0eUR5bmFtaWM6IGlzRHluYW1pY0V4cHJlc3Npb24sXG5cdFx0b2JqZWN0UGFnZUxhenlMb2FkZXJFbmFibGVkOiBtYW5pZmVzdFN1YlNlY3Rpb24uZW5hYmxlTGF6eUxvYWRpbmcgPz8gZmFsc2UsXG5cdFx0Y29tcG9uZW50TmFtZTogXCJcIixcblx0XHRzZXR0aW5nczogXCJcIlxuXHR9O1xuXHRpZiAobWFuaWZlc3RTdWJTZWN0aW9uLnRlbXBsYXRlIHx8IG1hbmlmZXN0U3ViU2VjdGlvbi5uYW1lKSB7XG5cdFx0c3ViU2VjdGlvbkRlZmluaXRpb24udHlwZSA9IFN1YlNlY3Rpb25UeXBlLlhNTEZyYWdtZW50O1xuXHRcdChzdWJTZWN0aW9uRGVmaW5pdGlvbiBhcyB1bmtub3duIGFzIFhNTEZyYWdtZW50U3ViU2VjdGlvbikudGVtcGxhdGUgPSBtYW5pZmVzdFN1YlNlY3Rpb24udGVtcGxhdGUgfHwgbWFuaWZlc3RTdWJTZWN0aW9uLm5hbWUgfHwgXCJcIjtcblx0fSBlbHNlIGlmIChtYW5pZmVzdFN1YlNlY3Rpb24uZW1iZWRkZWRDb21wb25lbnQgIT09IHVuZGVmaW5lZCkge1xuXHRcdHN1YlNlY3Rpb25EZWZpbml0aW9uLnR5cGUgPSBTdWJTZWN0aW9uVHlwZS5FbWJlZGRlZENvbXBvbmVudDtcblx0XHRzdWJTZWN0aW9uRGVmaW5pdGlvbi5jb21wb25lbnROYW1lID0gbWFuaWZlc3RTdWJTZWN0aW9uLmVtYmVkZGVkQ29tcG9uZW50Lm5hbWU7XG5cdFx0aWYgKG1hbmlmZXN0U3ViU2VjdGlvbi5lbWJlZGRlZENvbXBvbmVudC5zZXR0aW5ncyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRzdWJTZWN0aW9uRGVmaW5pdGlvbi5zZXR0aW5ncyA9IEpTT04uc3RyaW5naWZ5KG1hbmlmZXN0U3ViU2VjdGlvbi5lbWJlZGRlZENvbXBvbmVudC5zZXR0aW5ncyk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHN1YlNlY3Rpb25EZWZpbml0aW9uLnR5cGUgPSBTdWJTZWN0aW9uVHlwZS5QbGFjZWhvbGRlcjtcblx0fVxuXHRyZXR1cm4gc3ViU2VjdGlvbkRlZmluaXRpb24gYXMgQ3VzdG9tT2JqZWN0UGFnZVN1YlNlY3Rpb247XG59XG5cbi8qKlxuICogRXZhbHVhdGUgaWYgdGhlIGNvbmRlbnNlZCBtb2RlIGNhbiBiZSBhcHBsaWVkIG9uIHRoZSB0YWJsZS5cbiAqXG4gKiBAcGFyYW0gY3VycmVudEZhY2V0XG4gKiBAcGFyYW0gZmFjZXRzVG9DcmVhdGVJblNlY3Rpb25cbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyBgdHJ1ZWAgZm9yIGNvbXBsaWFudCwgZmFsc2Ugb3RoZXJ3aXNlXG4gKi9cbmZ1bmN0aW9uIGdldENvbmRlbnNlZFRhYmxlTGF5b3V0Q29tcGxpYW5jZShcblx0Y3VycmVudEZhY2V0OiBGYWNldFR5cGVzLFxuXHRmYWNldHNUb0NyZWF0ZUluU2VjdGlvbjogRmFjZXRUeXBlc1tdLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBib29sZWFuIHtcblx0Y29uc3QgbWFuaWZlc3RXcmFwcGVyID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKTtcblx0aWYgKG1hbmlmZXN0V3JhcHBlci51c2VJY29uVGFiQmFyKCkpIHtcblx0XHQvLyBJZiB0aGUgT1AgdXNlIHRoZSB0YWIgYmFzZWQgd2UgY2hlY2sgaWYgdGhlIGZhY2V0cyB0aGF0IHdpbGwgYmUgY3JlYXRlZCBmb3IgdGhpcyBzZWN0aW9uIGFyZSBhbGwgbm9uIHZpc2libGVcblx0XHRyZXR1cm4gaGFzTm9PdGhlclZpc2libGVUYWJsZUluVGFyZ2V0cyhjdXJyZW50RmFjZXQsIGZhY2V0c1RvQ3JlYXRlSW5TZWN0aW9uKTtcblx0fSBlbHNlIHtcblx0XHRjb25zdCBlbnRpdHlUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCk7XG5cdFx0aWYgKGVudGl0eVR5cGUuYW5ub3RhdGlvbnM/LlVJPy5GYWNldHM/Lmxlbmd0aCAmJiBlbnRpdHlUeXBlLmFubm90YXRpb25zPy5VST8uRmFjZXRzPy5sZW5ndGggPiAxKSB7XG5cdFx0XHRyZXR1cm4gaGFzTm9PdGhlclZpc2libGVUYWJsZUluVGFyZ2V0cyhjdXJyZW50RmFjZXQsIGZhY2V0c1RvQ3JlYXRlSW5TZWN0aW9uKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGhhc05vT3RoZXJWaXNpYmxlVGFibGVJblRhcmdldHMoY3VycmVudEZhY2V0OiBGYWNldFR5cGVzLCBmYWNldHNUb0NyZWF0ZUluU2VjdGlvbjogRmFjZXRUeXBlc1tdKTogYm9vbGVhbiB7XG5cdHJldHVybiBmYWNldHNUb0NyZWF0ZUluU2VjdGlvbi5ldmVyeShmdW5jdGlvbiAoc3ViRmFjZXQpIHtcblx0XHRpZiAoc3ViRmFjZXQgIT09IGN1cnJlbnRGYWNldCkge1xuXHRcdFx0aWYgKHN1YkZhY2V0LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5SZWZlcmVuY2VGYWNldCkge1xuXHRcdFx0XHRjb25zdCByZWZGYWNldCA9IHN1YkZhY2V0O1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0cmVmRmFjZXQuVGFyZ2V0Py4kdGFyZ2V0Py50ZXJtID09PSBVSUFubm90YXRpb25UZXJtcy5MaW5lSXRlbSB8fFxuXHRcdFx0XHRcdHJlZkZhY2V0LlRhcmdldD8uJHRhcmdldD8udGVybSA9PT0gVUlBbm5vdGF0aW9uVGVybXMuUHJlc2VudGF0aW9uVmFyaWFudCB8fFxuXHRcdFx0XHRcdHJlZkZhY2V0LlRhcmdldC4kdGFyZ2V0Py50ZXJtID09PSBVSUFubm90YXRpb25UZXJtcy5TZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50XG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdHJldHVybiByZWZGYWNldC5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbiAhPT0gdW5kZWZpbmVkID8gcmVmRmFjZXQuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4gOiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHN1YkNvbGxlY3Rpb25GYWNldCA9IHN1YkZhY2V0IGFzIENvbGxlY3Rpb25GYWNldFR5cGVzO1xuXHRcdFx0XHRyZXR1cm4gc3ViQ29sbGVjdGlvbkZhY2V0LkZhY2V0cy5ldmVyeShmdW5jdGlvbiAoZmFjZXQpIHtcblx0XHRcdFx0XHRjb25zdCBzdWJSZWZGYWNldCA9IGZhY2V0IGFzIFJlZmVyZW5jZUZhY2V0VHlwZXM7XG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0c3ViUmVmRmFjZXQuVGFyZ2V0Py4kdGFyZ2V0Py50ZXJtID09PSBVSUFubm90YXRpb25UZXJtcy5MaW5lSXRlbSB8fFxuXHRcdFx0XHRcdFx0c3ViUmVmRmFjZXQuVGFyZ2V0Py4kdGFyZ2V0Py50ZXJtID09PSBVSUFubm90YXRpb25UZXJtcy5QcmVzZW50YXRpb25WYXJpYW50IHx8XG5cdFx0XHRcdFx0XHRzdWJSZWZGYWNldC5UYXJnZXQ/LiR0YXJnZXQ/LnRlcm0gPT09IFVJQW5ub3RhdGlvblRlcm1zLlNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnRcblx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdHJldHVybiBzdWJSZWZGYWNldC5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbiAhPT0gdW5kZWZpbmVkID8gc3ViUmVmRmFjZXQuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4gOiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSk7XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFzRVlBLGNBQWM7RUFBQSxXQUFkQSxjQUFjO0lBQWRBLGNBQWM7SUFBZEEsY0FBYztJQUFkQSxjQUFjO0lBQWRBLGNBQWM7SUFBZEEsY0FBYztJQUFkQSxjQUFjO0lBQWRBLGNBQWM7RUFBQSxHQUFkQSxjQUFjLEtBQWRBLGNBQWM7RUFBQTtFQW9HMUIsTUFBTUMsa0JBQTRCLEdBQUcsd0xBS3BDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxTQUFTQyxpQkFBaUIsQ0FDaENDLGVBQTZCLEVBQzdCQyxnQkFBa0MsRUFDbENDLGVBQXlCLEVBQ0E7SUFD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