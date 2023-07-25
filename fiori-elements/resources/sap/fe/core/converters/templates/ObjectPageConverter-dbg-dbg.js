/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/controls/Common/Action", "sap/fe/core/converters/objectPage/HeaderAndFooterAction", "sap/fe/core/helpers/BindingToolkit", "../controls/ObjectPage/Avatar", "../controls/ObjectPage/HeaderFacet", "../controls/ObjectPage/SubSection", "../helpers/BindingHelper", "../helpers/ConfigurableObject", "../helpers/ID", "../ManifestSettings"], function (Action, HeaderAndFooterAction, BindingToolkit, Avatar, HeaderFacet, SubSection, BindingHelper, ConfigurableObject, ID, ManifestSettings) {
  "use strict";

  var _exports = {};
  var VisualizationType = ManifestSettings.VisualizationType;
  var TemplateType = ManifestSettings.TemplateType;
  var getSectionID = ID.getSectionID;
  var getEditableHeaderSectionID = ID.getEditableHeaderSectionID;
  var getCustomSectionID = ID.getCustomSectionID;
  var Placement = ConfigurableObject.Placement;
  var OverrideType = ConfigurableObject.OverrideType;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var UI = BindingHelper.UI;
  var SubSectionType = SubSection.SubSectionType;
  var createSubSections = SubSection.createSubSections;
  var createCustomSubSections = SubSection.createCustomSubSections;
  var createCustomHeaderFacetSubSections = SubSection.createCustomHeaderFacetSubSections;
  var getHeaderFacetsFromManifest = HeaderFacet.getHeaderFacetsFromManifest;
  var getHeaderFacetsFromAnnotations = HeaderFacet.getHeaderFacetsFromAnnotations;
  var getAvatar = Avatar.getAvatar;
  var not = BindingToolkit.not;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var equal = BindingToolkit.equal;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var getHiddenHeaderActions = HeaderAndFooterAction.getHiddenHeaderActions;
  var getHeaderDefaultActions = HeaderAndFooterAction.getHeaderDefaultActions;
  var getFooterDefaultActions = HeaderAndFooterAction.getFooterDefaultActions;
  var removeDuplicateActions = Action.removeDuplicateActions;
  var getActionsFromManifest = Action.getActionsFromManifest;
  const getSectionKey = (facetDefinition, fallback) => {
    var _facetDefinition$ID, _facetDefinition$Labe;
    return ((_facetDefinition$ID = facetDefinition.ID) === null || _facetDefinition$ID === void 0 ? void 0 : _facetDefinition$ID.toString()) || ((_facetDefinition$Labe = facetDefinition.Label) === null || _facetDefinition$Labe === void 0 ? void 0 : _facetDefinition$Labe.toString()) || fallback;
  };

  /**
   * Creates a section that represents the editable header part; it is only visible in edit mode.
   *
   * @param converterContext The converter context
   * @param allHeaderFacets The converter context
   * @returns The section representing the editable header parts
   */
  function createEditableHeaderSection(converterContext, allHeaderFacets) {
    var _converterContext$get, _converterContext$get2;
    const editableHeaderSectionID = getEditableHeaderSectionID();
    const headerFacets = (_converterContext$get = converterContext.getEntityType().annotations) === null || _converterContext$get === void 0 ? void 0 : (_converterContext$get2 = _converterContext$get.UI) === null || _converterContext$get2 === void 0 ? void 0 : _converterContext$get2.HeaderFacets;
    const headerfacetSubSections = headerFacets ? createSubSections(headerFacets, converterContext, true) : [];
    const customHeaderFacetSubSections = createCustomHeaderFacetSubSections(converterContext);
    let allHeaderFacetsSubSections = [];
    if (customHeaderFacetSubSections.length > 0) {
      // merge annotation based header facets and custom header facets in the right order
      let i = 0;
      allHeaderFacets.forEach(function (item) {
        // hidden header facets are not included in allHeaderFacets array => add them anyway
        while (headerfacetSubSections.length > i && headerfacetSubSections[i].visible === "false") {
          allHeaderFacetsSubSections.push(headerfacetSubSections[i]);
          i++;
        }
        if (headerfacetSubSections.length > i && (item.key === headerfacetSubSections[i].key ||
        // for header facets with no id the keys of header facet and subsection are different => check only the last part
        item.key.slice(item.key.lastIndexOf("::") + 2) === headerfacetSubSections[i].key.slice(headerfacetSubSections[i].key.lastIndexOf("::") + 2))) {
          allHeaderFacetsSubSections.push(headerfacetSubSections[i]);
          i++;
        } else {
          customHeaderFacetSubSections.forEach(function (customItem) {
            if (item.key === customItem.key) {
              allHeaderFacetsSubSections.push(customItem);
            }
          });
        }
      });
    } else {
      allHeaderFacetsSubSections = headerfacetSubSections;
    }
    const headerSection = {
      id: editableHeaderSectionID,
      key: "EditableHeaderContent",
      title: "{sap.fe.i18n>T_COMMON_OBJECT_PAGE_HEADER_SECTION}",
      visible: compileExpression(UI.IsEditable),
      subSections: allHeaderFacetsSubSections
    };
    return headerSection;
  }

  /**
   * Creates a definition for a section based on the Facet annotation.
   *
   * @param converterContext The converter context
   * @returns All sections
   */
  _exports.createEditableHeaderSection = createEditableHeaderSection;
  function getSectionsFromAnnotation(converterContext) {
    var _entityType$annotatio, _entityType$annotatio2, _entityType$annotatio3;
    const entityType = converterContext.getEntityType();
    const objectPageSections = ((_entityType$annotatio = entityType.annotations) === null || _entityType$annotatio === void 0 ? void 0 : (_entityType$annotatio2 = _entityType$annotatio.UI) === null || _entityType$annotatio2 === void 0 ? void 0 : (_entityType$annotatio3 = _entityType$annotatio2.Facets) === null || _entityType$annotatio3 === void 0 ? void 0 : _entityType$annotatio3.map(facetDefinition => getSectionFromAnnotation(facetDefinition, converterContext))) || [];
    return objectPageSections;
  }

  /**
   * Create an annotation based section.
   *
   * @param facet
   * @param converterContext
   * @returns The current section
   */
  function getSectionFromAnnotation(facet, converterContext) {
    var _facet$annotations, _facet$annotations$UI, _facet$annotations$UI2;
    const sectionID = getSectionID(facet);
    const section = {
      id: sectionID,
      key: getSectionKey(facet, sectionID),
      title: facet.Label ? compileExpression(getExpressionFromAnnotation(facet.Label)) : undefined,
      showTitle: !!facet.Label,
      visible: compileExpression(not(equal(getExpressionFromAnnotation((_facet$annotations = facet.annotations) === null || _facet$annotations === void 0 ? void 0 : (_facet$annotations$UI = _facet$annotations.UI) === null || _facet$annotations$UI === void 0 ? void 0 : (_facet$annotations$UI2 = _facet$annotations$UI.Hidden) === null || _facet$annotations$UI2 === void 0 ? void 0 : _facet$annotations$UI2.valueOf()), true))),
      subSections: createSubSections([facet], converterContext)
    };
    return section;
  }

  /**
   * Creates section definitions based on the manifest definitions.
   *
   * @param manifestSections The sections defined in the manifest
   * @param converterContext
   * @returns The sections defined in the manifest
   */
  function getSectionsFromManifest(manifestSections, converterContext) {
    const sections = {};
    Object.keys(manifestSections).forEach(manifestSectionKey => {
      sections[manifestSectionKey] = getSectionFromManifest(manifestSections[manifestSectionKey], manifestSectionKey, converterContext);
    });
    return sections;
  }

  /**
   * Create a manifest-based custom section.
   *
   * @param customSectionDefinition
   * @param sectionKey
   * @param converterContext
   * @returns The current custom section
   */
  function getSectionFromManifest(customSectionDefinition, sectionKey, converterContext) {
    const customSectionID = customSectionDefinition.id || getCustomSectionID(sectionKey);
    let position = customSectionDefinition.position;
    if (!position) {
      position = {
        placement: Placement.After
      };
    }
    let manifestSubSections;
    if (!customSectionDefinition.subSections) {
      // If there is no subSection defined, we add the content of the custom section as subsections
      // and make sure to set the visibility to 'true', as the actual visibility is handled by the section itself
      manifestSubSections = {
        [sectionKey]: {
          ...customSectionDefinition,
          position: undefined,
          visible: "true"
        }
      };
    } else {
      manifestSubSections = customSectionDefinition.subSections;
    }
    const subSections = createCustomSubSections(manifestSubSections, converterContext);
    const customSection = {
      id: customSectionID,
      key: sectionKey,
      title: customSectionDefinition.title,
      showTitle: !!customSectionDefinition.title,
      visible: customSectionDefinition.visible !== undefined ? customSectionDefinition.visible : "true",
      position: position,
      subSections: subSections
    };
    return customSection;
  }

  /**
   * Retrieves the ObjectPage header actions (both the default ones and the custom ones defined in the manifest).
   *
   * @param converterContext The converter context
   * @returns An array containing all the actions for this ObjectPage header
   */
  const getHeaderActions = function (converterContext) {
    const aAnnotationHeaderActions = getHeaderDefaultActions(converterContext);
    const manifestWrapper = converterContext.getManifestWrapper();
    const manifestActions = getActionsFromManifest(manifestWrapper.getHeaderActions(), converterContext, aAnnotationHeaderActions, undefined, undefined, getHiddenHeaderActions(converterContext));
    const actionOverwriteConfig = {
      isNavigable: OverrideType.overwrite,
      enabled: OverrideType.overwrite,
      visible: OverrideType.overwrite,
      defaultValuesExtensionFunction: OverrideType.overwrite,
      command: OverrideType.overwrite
    };
    const headerActions = insertCustomElements(aAnnotationHeaderActions, manifestActions.actions, actionOverwriteConfig);
    return {
      actions: removeDuplicateActions(headerActions),
      commandActions: manifestActions.commandActions
    };
  };

  /**
   * Retrieves the ObjectPage footer actions (both the default ones and the custom ones defined in the manifest).
   *
   * @param converterContext The converter context
   * @returns An array containing all the actions for this ObjectPage footer
   */
  _exports.getHeaderActions = getHeaderActions;
  const getFooterActions = function (converterContext) {
    const manifestWrapper = converterContext.getManifestWrapper();
    const aAnnotationFooterActions = getFooterDefaultActions(manifestWrapper.getViewLevel(), converterContext);
    const manifestActions = getActionsFromManifest(manifestWrapper.getFooterActions(), converterContext, aAnnotationFooterActions);
    const actionOverwriteConfig = {
      isNavigable: OverrideType.overwrite,
      enabled: OverrideType.overwrite,
      visible: OverrideType.overwrite,
      defaultValuesExtensionFunction: OverrideType.overwrite,
      command: OverrideType.overwrite
    };
    const footerActions = insertCustomElements(aAnnotationFooterActions, manifestActions.actions, actionOverwriteConfig);
    return {
      actions: footerActions,
      commandActions: manifestActions.commandActions
    };
  };
  _exports.getFooterActions = getFooterActions;
  function _getSubSectionVisualization(subSection) {
    var _subSection$presentat;
    return subSection !== null && subSection !== void 0 && (_subSection$presentat = subSection.presentation) !== null && _subSection$presentat !== void 0 && _subSection$presentat.visualizations[0] ? subSection.presentation.visualizations[0] : undefined;
  }
  function _isFacetHasGridTableVisible(dataVisualizationSubSection, subSectionVisualization) {
    var _dataVisualizationSub, _subSectionVisualizat;
    return dataVisualizationSubSection.visible === "true" && (dataVisualizationSubSection === null || dataVisualizationSubSection === void 0 ? void 0 : (_dataVisualizationSub = dataVisualizationSubSection.presentation) === null || _dataVisualizationSub === void 0 ? void 0 : _dataVisualizationSub.visualizations) && (subSectionVisualization === null || subSectionVisualization === void 0 ? void 0 : subSectionVisualization.type) === "Table" && (subSectionVisualization === null || subSectionVisualization === void 0 ? void 0 : (_subSectionVisualizat = subSectionVisualization.control) === null || _subSectionVisualizat === void 0 ? void 0 : _subSectionVisualizat.type) === "GridTable";
  }
  function _setGridTableVisualizationInformation(sections, dataVisualizationSubSection, subSectionVisualization, sectionLayout) {
    if (_isFacetHasGridTableVisible(dataVisualizationSubSection, subSectionVisualization)) {
      const tableControlConfiguration = subSectionVisualization.control;
      if (!(sectionLayout === "Page" && sections.length > 1)) {
        tableControlConfiguration.rowCountMode = "Auto";
      }
      if (sectionLayout !== "Tabs") {
        tableControlConfiguration.useCondensedTableLayout = false;
      }
    }
  }
  function _setGridTableWithMixFacetsInformation(subSection, sectionLayout) {
    var _subSection$content;
    if ((subSection === null || subSection === void 0 ? void 0 : (_subSection$content = subSection.content) === null || _subSection$content === void 0 ? void 0 : _subSection$content.length) === 1) {
      var _presentation;
      const tableControl = ((_presentation = subSection.content[0].presentation) === null || _presentation === void 0 ? void 0 : _presentation.visualizations[0]).control;
      if (tableControl.type === "GridTable") {
        tableControl.rowCountMode = "Auto";
        if (sectionLayout !== "Tabs") {
          tableControl.useCondensedTableLayout = false;
        }
      }
    }
  }

  /**
   * Set the GridTable display information.
   *
   * @param sections The ObjectPage sections
   * @param section The current ObjectPage section processed
   * @param sectionLayout
   */
  function _setGridTableSubSectionControlConfiguration(sections, section, sectionLayout) {
    let dataVisualizationSubSection;
    let subSectionVisualization;
    const subSections = section.subSections;
    if (subSections.length === 1) {
      dataVisualizationSubSection = subSections[0];
      switch (subSections[0].type) {
        case "DataVisualization":
          subSectionVisualization = _getSubSectionVisualization(dataVisualizationSubSection);
          _setGridTableVisualizationInformation(sections, dataVisualizationSubSection, subSectionVisualization, sectionLayout);
          break;
        case "Mixed":
          _setGridTableWithMixFacetsInformation(dataVisualizationSubSection, sectionLayout);
          break;
        default:
          break;
      }
      return;
    }
    _removeCondensedFromSubSections(subSections);
  }

  /**
   * Remove the condense layout mode from the subsections.
   *
   * @param subSections The subSections where we need to remove the condensed layout
   */
  function _removeCondensedFromSubSections(subSections) {
    let dataVisualizationSubSection;
    // We check in each subsection if there is visualizations
    subSections.forEach(subSection => {
      var _dataVisualizationSub2, _dataVisualizationSub3, _dataVisualizationSub6;
      dataVisualizationSubSection = subSection;
      if ((_dataVisualizationSub2 = dataVisualizationSubSection) !== null && _dataVisualizationSub2 !== void 0 && (_dataVisualizationSub3 = _dataVisualizationSub2.presentation) !== null && _dataVisualizationSub3 !== void 0 && _dataVisualizationSub3.visualizations) {
        var _dataVisualizationSub4, _dataVisualizationSub5;
        (_dataVisualizationSub4 = dataVisualizationSubSection) === null || _dataVisualizationSub4 === void 0 ? void 0 : (_dataVisualizationSub5 = _dataVisualizationSub4.presentation) === null || _dataVisualizationSub5 === void 0 ? void 0 : _dataVisualizationSub5.visualizations.forEach(singleVisualization => {
          if (singleVisualization.type === VisualizationType.Table) {
            singleVisualization.control.useCondensedTableLayout = false;
          }
        });
      }
      // Then we check the content of the subsection, and in each content we check if there is a table to set its condensed layout to false
      if ((_dataVisualizationSub6 = dataVisualizationSubSection) !== null && _dataVisualizationSub6 !== void 0 && _dataVisualizationSub6.content) {
        dataVisualizationSubSection.content.forEach(singleContent => {
          var _presentation2;
          (_presentation2 = singleContent.presentation) === null || _presentation2 === void 0 ? void 0 : _presentation2.visualizations.forEach(singleVisualization => {
            if (singleVisualization.type === VisualizationType.Table) {
              singleVisualization.control.useCondensedTableLayout = false;
            }
          });
        });
      }
    });
  }
  /**
   * Retrieves and merges the ObjectPage sections defined in the annotation and in the manifest.
   *
   * @param converterContext The converter context
   * @returns An array of sections.
   */

  const getSections = function (converterContext) {
    const manifestWrapper = converterContext.getManifestWrapper();
    const sections = insertCustomElements(getSectionsFromAnnotation(converterContext), getSectionsFromManifest(manifestWrapper.getSections(), converterContext), {
      title: OverrideType.overwrite,
      visible: OverrideType.overwrite,
      subSections: {
        actions: OverrideType.merge,
        title: OverrideType.overwrite,
        sideContent: OverrideType.overwrite,
        objectPageLazyLoaderEnabled: OverrideType.overwrite
      }
    });
    // Level Adjustment for "Mixed" Collection Facets:
    // ==============================================
    // The manifest definition of custom side contents and actions still needs to be aligned for "Mixed" collection facets:
    // Collection facets containing tables gain an extra reference facet as a table wrapper to ensure, that the table is always
    // placed in an own individual Object Page Block; this additional hierarchy level is unknown to app developers, which are
    // defining the side content and actions in the manifest at collection facet level; now, since the sideContent always needs
    // to be assigned to a block, and actions always need to be assigned to a form,
    // we need to move the sideContent and actions from a mixed collection facet to its content.
    // ==============================================
    sections.forEach(function (section) {
      var _section$subSections;
      _setGridTableSubSectionControlConfiguration(sections, section, manifestWrapper.getSectionLayout());
      (_section$subSections = section.subSections) === null || _section$subSections === void 0 ? void 0 : _section$subSections.forEach(function (subSection) {
        var _subSection$content3;
        subSection.title = subSection.title === "undefined" ? undefined : subSection.title;
        if (subSection.type === "Mixed") {
          var _subSection$content2;
          (_subSection$content2 = subSection.content) === null || _subSection$content2 === void 0 ? void 0 : _subSection$content2.forEach(content => {
            content.objectPageLazyLoaderEnabled = subSection.objectPageLazyLoaderEnabled;
          });
        }
        if (subSection.type === "Mixed" && (_subSection$content3 = subSection.content) !== null && _subSection$content3 !== void 0 && _subSection$content3.length) {
          var _actions;
          const firstForm = subSection.content.find(element => element.type === SubSectionType.Form);

          // 1. Copy sideContent to the SubSection's first form; or -- if unavailable -- to its first content
          // 2. Copy actions to the first form of the SubSection's content
          // 3. Delete sideContent / actions at the (invalid) manifest level

          if (subSection.sideContent) {
            if (firstForm) {
              // If there is a form, it always needs to be attached to the form, as the form inherits the ID of the SubSection
              firstForm.sideContent = subSection.sideContent;
            } else {
              subSection.content[0].sideContent = subSection.sideContent;
            }
            subSection.sideContent = undefined;
          }
          if (firstForm && (_actions = subSection.actions) !== null && _actions !== void 0 && _actions.length) {
            firstForm.actions = subSection.actions;
            subSection.actions = [];
          }
        }
      });
    });
    return sections;
  };

  /**
   * Determines if the ObjectPage has header content.
   *
   * @param converterContext The instance of the converter context
   * @returns `true` if there is at least on header facet
   */
  _exports.getSections = getSections;
  function hasHeaderContent(converterContext) {
    var _converterContext$get3, _converterContext$get4;
    const manifestWrapper = converterContext.getManifestWrapper();
    return (((_converterContext$get3 = converterContext.getEntityType().annotations) === null || _converterContext$get3 === void 0 ? void 0 : (_converterContext$get4 = _converterContext$get3.UI) === null || _converterContext$get4 === void 0 ? void 0 : _converterContext$get4.HeaderFacets) || []).length > 0 || Object.keys(manifestWrapper.getHeaderFacets()).length > 0;
  }

  /**
   * Gets the expression to evaluate the visibility of the header content.
   *
   * @param converterContext The instance of the converter context
   * @returns The binding expression for the Delete button
   */
  function getShowHeaderContentExpression(converterContext) {
    const manifestWrapper = converterContext.getManifestWrapper();
    return ifElse(!hasHeaderContent(converterContext), constant(false), ifElse(equal(manifestWrapper.isHeaderEditable(), false), constant(true), not(UI.IsEditable)));
  }

  /**
   * Gets the binding expression to evaluate the visibility of the header content.
   *
   * @param converterContext The instance of the converter context
   * @returns The binding expression for the Delete button
   */
  const getShowHeaderContent = function (converterContext) {
    return compileExpression(getShowHeaderContentExpression(converterContext));
  };

  /**
   * Gets the binding expression to evaluate the visibility of the avatar when the header is in expanded state.
   *
   * @param converterContext The instance of the converter context
   * @returns The binding expression for the Delete button
   */
  _exports.getShowHeaderContent = getShowHeaderContent;
  const getExpandedImageVisible = function (converterContext) {
    return compileExpression(not(getShowHeaderContentExpression(converterContext)));
  };
  _exports.getExpandedImageVisible = getExpandedImageVisible;
  const convertPage = function (converterContext) {
    var _entityType$annotatio4, _entityType$annotatio5;
    const manifestWrapper = converterContext.getManifestWrapper();
    let headerSection;
    const entityType = converterContext.getEntityType();

    // Retrieve all header facets (from annotations & custom)
    const headerFacets = insertCustomElements(getHeaderFacetsFromAnnotations(converterContext), getHeaderFacetsFromManifest(manifestWrapper.getHeaderFacets()));

    // Retrieve the page header actions
    const headerActions = getHeaderActions(converterContext);

    // Retrieve the page footer actions
    const footerActions = getFooterActions(converterContext);
    if (manifestWrapper.isHeaderEditable() && ((_entityType$annotatio4 = entityType.annotations.UI) !== null && _entityType$annotatio4 !== void 0 && _entityType$annotatio4.HeaderFacets || (_entityType$annotatio5 = entityType.annotations.UI) !== null && _entityType$annotatio5 !== void 0 && _entityType$annotatio5.HeaderInfo)) {
      headerSection = createEditableHeaderSection(converterContext, headerFacets);
    }
    const sections = getSections(converterContext);
    return {
      template: TemplateType.ObjectPage,
      header: {
        visible: manifestWrapper.getShowObjectPageHeader(),
        section: headerSection,
        facets: headerFacets,
        actions: headerActions.actions,
        showContent: getShowHeaderContent(converterContext),
        hasContent: hasHeaderContent(converterContext),
        avatar: getAvatar(converterContext),
        title: {
          expandedImageVisible: getExpandedImageVisible(converterContext)
        }
      },
      sections: sections,
      footerActions: footerActions.actions,
      headerCommandActions: headerActions.commandActions,
      footerCommandActions: footerActions.commandActions,
      showAnchorBar: manifestWrapper.getShowAnchorBar(),
      useIconTabBar: manifestWrapper.useIconTabBar()
    };
  };
  _exports.convertPage = convertPage;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRTZWN0aW9uS2V5IiwiZmFjZXREZWZpbml0aW9uIiwiZmFsbGJhY2siLCJJRCIsInRvU3RyaW5nIiwiTGFiZWwiLCJjcmVhdGVFZGl0YWJsZUhlYWRlclNlY3Rpb24iLCJjb252ZXJ0ZXJDb250ZXh0IiwiYWxsSGVhZGVyRmFjZXRzIiwiZWRpdGFibGVIZWFkZXJTZWN0aW9uSUQiLCJnZXRFZGl0YWJsZUhlYWRlclNlY3Rpb25JRCIsImhlYWRlckZhY2V0cyIsImdldEVudGl0eVR5cGUiLCJhbm5vdGF0aW9ucyIsIlVJIiwiSGVhZGVyRmFjZXRzIiwiaGVhZGVyZmFjZXRTdWJTZWN0aW9ucyIsImNyZWF0ZVN1YlNlY3Rpb25zIiwiY3VzdG9tSGVhZGVyRmFjZXRTdWJTZWN0aW9ucyIsImNyZWF0ZUN1c3RvbUhlYWRlckZhY2V0U3ViU2VjdGlvbnMiLCJhbGxIZWFkZXJGYWNldHNTdWJTZWN0aW9ucyIsImxlbmd0aCIsImkiLCJmb3JFYWNoIiwiaXRlbSIsInZpc2libGUiLCJwdXNoIiwia2V5Iiwic2xpY2UiLCJsYXN0SW5kZXhPZiIsImN1c3RvbUl0ZW0iLCJoZWFkZXJTZWN0aW9uIiwiaWQiLCJ0aXRsZSIsImNvbXBpbGVFeHByZXNzaW9uIiwiSXNFZGl0YWJsZSIsInN1YlNlY3Rpb25zIiwiZ2V0U2VjdGlvbnNGcm9tQW5ub3RhdGlvbiIsImVudGl0eVR5cGUiLCJvYmplY3RQYWdlU2VjdGlvbnMiLCJGYWNldHMiLCJtYXAiLCJnZXRTZWN0aW9uRnJvbUFubm90YXRpb24iLCJmYWNldCIsInNlY3Rpb25JRCIsImdldFNlY3Rpb25JRCIsInNlY3Rpb24iLCJnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24iLCJ1bmRlZmluZWQiLCJzaG93VGl0bGUiLCJub3QiLCJlcXVhbCIsIkhpZGRlbiIsInZhbHVlT2YiLCJnZXRTZWN0aW9uc0Zyb21NYW5pZmVzdCIsIm1hbmlmZXN0U2VjdGlvbnMiLCJzZWN0aW9ucyIsIk9iamVjdCIsImtleXMiLCJtYW5pZmVzdFNlY3Rpb25LZXkiLCJnZXRTZWN0aW9uRnJvbU1hbmlmZXN0IiwiY3VzdG9tU2VjdGlvbkRlZmluaXRpb24iLCJzZWN0aW9uS2V5IiwiY3VzdG9tU2VjdGlvbklEIiwiZ2V0Q3VzdG9tU2VjdGlvbklEIiwicG9zaXRpb24iLCJwbGFjZW1lbnQiLCJQbGFjZW1lbnQiLCJBZnRlciIsIm1hbmlmZXN0U3ViU2VjdGlvbnMiLCJjcmVhdGVDdXN0b21TdWJTZWN0aW9ucyIsImN1c3RvbVNlY3Rpb24iLCJnZXRIZWFkZXJBY3Rpb25zIiwiYUFubm90YXRpb25IZWFkZXJBY3Rpb25zIiwiZ2V0SGVhZGVyRGVmYXVsdEFjdGlvbnMiLCJtYW5pZmVzdFdyYXBwZXIiLCJnZXRNYW5pZmVzdFdyYXBwZXIiLCJtYW5pZmVzdEFjdGlvbnMiLCJnZXRBY3Rpb25zRnJvbU1hbmlmZXN0IiwiZ2V0SGlkZGVuSGVhZGVyQWN0aW9ucyIsImFjdGlvbk92ZXJ3cml0ZUNvbmZpZyIsImlzTmF2aWdhYmxlIiwiT3ZlcnJpZGVUeXBlIiwib3ZlcndyaXRlIiwiZW5hYmxlZCIsImRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbiIsImNvbW1hbmQiLCJoZWFkZXJBY3Rpb25zIiwiaW5zZXJ0Q3VzdG9tRWxlbWVudHMiLCJhY3Rpb25zIiwicmVtb3ZlRHVwbGljYXRlQWN0aW9ucyIsImNvbW1hbmRBY3Rpb25zIiwiZ2V0Rm9vdGVyQWN0aW9ucyIsImFBbm5vdGF0aW9uRm9vdGVyQWN0aW9ucyIsImdldEZvb3RlckRlZmF1bHRBY3Rpb25zIiwiZ2V0Vmlld0xldmVsIiwiZm9vdGVyQWN0aW9ucyIsIl9nZXRTdWJTZWN0aW9uVmlzdWFsaXphdGlvbiIsInN1YlNlY3Rpb24iLCJwcmVzZW50YXRpb24iLCJ2aXN1YWxpemF0aW9ucyIsIl9pc0ZhY2V0SGFzR3JpZFRhYmxlVmlzaWJsZSIsImRhdGFWaXN1YWxpemF0aW9uU3ViU2VjdGlvbiIsInN1YlNlY3Rpb25WaXN1YWxpemF0aW9uIiwidHlwZSIsImNvbnRyb2wiLCJfc2V0R3JpZFRhYmxlVmlzdWFsaXphdGlvbkluZm9ybWF0aW9uIiwic2VjdGlvbkxheW91dCIsInRhYmxlQ29udHJvbENvbmZpZ3VyYXRpb24iLCJyb3dDb3VudE1vZGUiLCJ1c2VDb25kZW5zZWRUYWJsZUxheW91dCIsIl9zZXRHcmlkVGFibGVXaXRoTWl4RmFjZXRzSW5mb3JtYXRpb24iLCJjb250ZW50IiwidGFibGVDb250cm9sIiwiX3NldEdyaWRUYWJsZVN1YlNlY3Rpb25Db250cm9sQ29uZmlndXJhdGlvbiIsIl9yZW1vdmVDb25kZW5zZWRGcm9tU3ViU2VjdGlvbnMiLCJzaW5nbGVWaXN1YWxpemF0aW9uIiwiVmlzdWFsaXphdGlvblR5cGUiLCJUYWJsZSIsInNpbmdsZUNvbnRlbnQiLCJnZXRTZWN0aW9ucyIsIm1lcmdlIiwic2lkZUNvbnRlbnQiLCJvYmplY3RQYWdlTGF6eUxvYWRlckVuYWJsZWQiLCJnZXRTZWN0aW9uTGF5b3V0IiwiZmlyc3RGb3JtIiwiZmluZCIsImVsZW1lbnQiLCJTdWJTZWN0aW9uVHlwZSIsIkZvcm0iLCJoYXNIZWFkZXJDb250ZW50IiwiZ2V0SGVhZGVyRmFjZXRzIiwiZ2V0U2hvd0hlYWRlckNvbnRlbnRFeHByZXNzaW9uIiwiaWZFbHNlIiwiY29uc3RhbnQiLCJpc0hlYWRlckVkaXRhYmxlIiwiZ2V0U2hvd0hlYWRlckNvbnRlbnQiLCJnZXRFeHBhbmRlZEltYWdlVmlzaWJsZSIsImNvbnZlcnRQYWdlIiwiZ2V0SGVhZGVyRmFjZXRzRnJvbUFubm90YXRpb25zIiwiZ2V0SGVhZGVyRmFjZXRzRnJvbU1hbmlmZXN0IiwiSGVhZGVySW5mbyIsInRlbXBsYXRlIiwiVGVtcGxhdGVUeXBlIiwiT2JqZWN0UGFnZSIsImhlYWRlciIsImdldFNob3dPYmplY3RQYWdlSGVhZGVyIiwiZmFjZXRzIiwic2hvd0NvbnRlbnQiLCJoYXNDb250ZW50IiwiYXZhdGFyIiwiZ2V0QXZhdGFyIiwiZXhwYW5kZWRJbWFnZVZpc2libGUiLCJoZWFkZXJDb21tYW5kQWN0aW9ucyIsImZvb3RlckNvbW1hbmRBY3Rpb25zIiwic2hvd0FuY2hvckJhciIsImdldFNob3dBbmNob3JCYXIiLCJ1c2VJY29uVGFiQmFyIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJPYmplY3RQYWdlQ29udmVydGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgRW50aXR5VHlwZSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBGYWNldFR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHR5cGUgeyBCYXNlQWN0aW9uLCBDb21iaW5lZEFjdGlvbiwgQ3VzdG9tQWN0aW9uLCBPdmVycmlkZVR5cGVBY3Rpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQWN0aW9uXCI7XG5pbXBvcnQgeyBnZXRBY3Rpb25zRnJvbU1hbmlmZXN0LCByZW1vdmVEdXBsaWNhdGVBY3Rpb25zIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0FjdGlvblwiO1xuaW1wb3J0IHR5cGUgeyBUYWJsZUNvbnRyb2xDb25maWd1cmF0aW9uLCBUYWJsZVZpc3VhbGl6YXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vVGFibGVcIjtcbmltcG9ydCB7XG5cdGdldEZvb3RlckRlZmF1bHRBY3Rpb25zLFxuXHRnZXRIZWFkZXJEZWZhdWx0QWN0aW9ucyxcblx0Z2V0SGlkZGVuSGVhZGVyQWN0aW9uc1xufSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9vYmplY3RQYWdlL0hlYWRlckFuZEZvb3RlckFjdGlvblwiO1xuaW1wb3J0IHR5cGUgeyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24sIENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGNvbXBpbGVFeHByZXNzaW9uLCBjb25zdGFudCwgZXF1YWwsIGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiwgaWZFbHNlLCBub3QgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHR5cGUgeyBBdmF0YXIgfSBmcm9tIFwiLi4vY29udHJvbHMvT2JqZWN0UGFnZS9BdmF0YXJcIjtcbmltcG9ydCB7IGdldEF2YXRhciB9IGZyb20gXCIuLi9jb250cm9scy9PYmplY3RQYWdlL0F2YXRhclwiO1xuaW1wb3J0IHR5cGUgeyBPYmplY3RQYWdlSGVhZGVyRmFjZXQgfSBmcm9tIFwiLi4vY29udHJvbHMvT2JqZWN0UGFnZS9IZWFkZXJGYWNldFwiO1xuaW1wb3J0IHsgZ2V0SGVhZGVyRmFjZXRzRnJvbUFubm90YXRpb25zLCBnZXRIZWFkZXJGYWNldHNGcm9tTWFuaWZlc3QgfSBmcm9tIFwiLi4vY29udHJvbHMvT2JqZWN0UGFnZS9IZWFkZXJGYWNldFwiO1xuaW1wb3J0IHR5cGUge1xuXHRDdXN0b21PYmplY3RQYWdlU2VjdGlvbixcblx0RGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uLFxuXHRGb3JtU3ViU2VjdGlvbixcblx0T2JqZWN0UGFnZVNlY3Rpb24sXG5cdE9iamVjdFBhZ2VTdWJTZWN0aW9uXG59IGZyb20gXCIuLi9jb250cm9scy9PYmplY3RQYWdlL1N1YlNlY3Rpb25cIjtcbmltcG9ydCB7XG5cdGNyZWF0ZUN1c3RvbUhlYWRlckZhY2V0U3ViU2VjdGlvbnMsXG5cdGNyZWF0ZUN1c3RvbVN1YlNlY3Rpb25zLFxuXHRjcmVhdGVTdWJTZWN0aW9ucyxcblx0U3ViU2VjdGlvblR5cGVcbn0gZnJvbSBcIi4uL2NvbnRyb2xzL09iamVjdFBhZ2UvU3ViU2VjdGlvblwiO1xuaW1wb3J0IHR5cGUgQ29udmVydGVyQ29udGV4dCBmcm9tIFwiLi4vQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0IHsgVUkgfSBmcm9tIFwiLi4vaGVscGVycy9CaW5kaW5nSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IENvbmZpZ3VyYWJsZVJlY29yZCwgUG9zaXRpb24gfSBmcm9tIFwiLi4vaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7IGluc2VydEN1c3RvbUVsZW1lbnRzLCBPdmVycmlkZVR5cGUsIFBsYWNlbWVudCB9IGZyb20gXCIuLi9oZWxwZXJzL0NvbmZpZ3VyYWJsZU9iamVjdFwiO1xuaW1wb3J0IHsgZ2V0Q3VzdG9tU2VjdGlvbklELCBnZXRFZGl0YWJsZUhlYWRlclNlY3Rpb25JRCwgZ2V0U2VjdGlvbklEIH0gZnJvbSBcIi4uL2hlbHBlcnMvSURcIjtcbmltcG9ydCB0eXBlIHsgTWFuaWZlc3RTZWN0aW9uLCBNYW5pZmVzdFN1YlNlY3Rpb24gfSBmcm9tIFwiLi4vTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IHsgVGVtcGxhdGVUeXBlLCBWaXN1YWxpemF0aW9uVHlwZSB9IGZyb20gXCIuLi9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgdHlwZSB7IFBhZ2VEZWZpbml0aW9uIH0gZnJvbSBcIi4uL1RlbXBsYXRlQ29udmVydGVyXCI7XG5cbmV4cG9ydCB0eXBlIE9iamVjdFBhZ2VEZWZpbml0aW9uID0gUGFnZURlZmluaXRpb24gJiB7XG5cdGhlYWRlcjoge1xuXHRcdHZpc2libGU6IGJvb2xlYW47XG5cdFx0c2VjdGlvbj86IE9iamVjdFBhZ2VTZWN0aW9uO1xuXHRcdGZhY2V0czogT2JqZWN0UGFnZUhlYWRlckZhY2V0W107XG5cdFx0YWN0aW9uczogQmFzZUFjdGlvbltdO1xuXHRcdHNob3dDb250ZW50OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0XHRoYXNDb250ZW50OiBib29sZWFuO1xuXHRcdGF2YXRhcj86IEF2YXRhcjtcblx0XHR0aXRsZToge1xuXHRcdFx0ZXhwYW5kZWRJbWFnZVZpc2libGU6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRcdH07XG5cdH07XG5cdHNlY3Rpb25zOiBPYmplY3RQYWdlU2VjdGlvbltdO1xuXHRmb290ZXJBY3Rpb25zOiBCYXNlQWN0aW9uW107XG5cdGhlYWRlckNvbW1hbmRBY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21BY3Rpb24+O1xuXHRmb290ZXJDb21tYW5kQWN0aW9uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPjtcblx0c2hvd0FuY2hvckJhcjogYm9vbGVhbjtcblx0dXNlSWNvblRhYkJhcjogYm9vbGVhbjtcbn07XG5cbmNvbnN0IGdldFNlY3Rpb25LZXkgPSAoZmFjZXREZWZpbml0aW9uOiBGYWNldFR5cGVzLCBmYWxsYmFjazogc3RyaW5nKTogc3RyaW5nID0+IHtcblx0cmV0dXJuIGZhY2V0RGVmaW5pdGlvbi5JRD8udG9TdHJpbmcoKSB8fCBmYWNldERlZmluaXRpb24uTGFiZWw/LnRvU3RyaW5nKCkgfHwgZmFsbGJhY2s7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBzZWN0aW9uIHRoYXQgcmVwcmVzZW50cyB0aGUgZWRpdGFibGUgaGVhZGVyIHBhcnQ7IGl0IGlzIG9ubHkgdmlzaWJsZSBpbiBlZGl0IG1vZGUuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcGFyYW0gYWxsSGVhZGVyRmFjZXRzIFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHJldHVybnMgVGhlIHNlY3Rpb24gcmVwcmVzZW50aW5nIHRoZSBlZGl0YWJsZSBoZWFkZXIgcGFydHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVkaXRhYmxlSGVhZGVyU2VjdGlvbihcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0YWxsSGVhZGVyRmFjZXRzOiBPYmplY3RQYWdlSGVhZGVyRmFjZXRbXVxuKTogT2JqZWN0UGFnZVNlY3Rpb24ge1xuXHRjb25zdCBlZGl0YWJsZUhlYWRlclNlY3Rpb25JRCA9IGdldEVkaXRhYmxlSGVhZGVyU2VjdGlvbklEKCk7XG5cdGNvbnN0IGhlYWRlckZhY2V0cyA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpLmFubm90YXRpb25zPy5VST8uSGVhZGVyRmFjZXRzO1xuXHRjb25zdCBoZWFkZXJmYWNldFN1YlNlY3Rpb25zID0gaGVhZGVyRmFjZXRzID8gY3JlYXRlU3ViU2VjdGlvbnMoaGVhZGVyRmFjZXRzLCBjb252ZXJ0ZXJDb250ZXh0LCB0cnVlKSA6IFtdO1xuXHRjb25zdCBjdXN0b21IZWFkZXJGYWNldFN1YlNlY3Rpb25zID0gY3JlYXRlQ3VzdG9tSGVhZGVyRmFjZXRTdWJTZWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0KTtcblx0bGV0IGFsbEhlYWRlckZhY2V0c1N1YlNlY3Rpb25zOiBPYmplY3RQYWdlU3ViU2VjdGlvbltdID0gW107XG5cdGlmIChjdXN0b21IZWFkZXJGYWNldFN1YlNlY3Rpb25zLmxlbmd0aCA+IDApIHtcblx0XHQvLyBtZXJnZSBhbm5vdGF0aW9uIGJhc2VkIGhlYWRlciBmYWNldHMgYW5kIGN1c3RvbSBoZWFkZXIgZmFjZXRzIGluIHRoZSByaWdodCBvcmRlclxuXHRcdGxldCBpID0gMDtcblx0XHRhbGxIZWFkZXJGYWNldHMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuXHRcdFx0Ly8gaGlkZGVuIGhlYWRlciBmYWNldHMgYXJlIG5vdCBpbmNsdWRlZCBpbiBhbGxIZWFkZXJGYWNldHMgYXJyYXkgPT4gYWRkIHRoZW0gYW55d2F5XG5cdFx0XHR3aGlsZSAoaGVhZGVyZmFjZXRTdWJTZWN0aW9ucy5sZW5ndGggPiBpICYmIGhlYWRlcmZhY2V0U3ViU2VjdGlvbnNbaV0udmlzaWJsZSA9PT0gXCJmYWxzZVwiKSB7XG5cdFx0XHRcdGFsbEhlYWRlckZhY2V0c1N1YlNlY3Rpb25zLnB1c2goaGVhZGVyZmFjZXRTdWJTZWN0aW9uc1tpXSk7XG5cdFx0XHRcdGkrKztcblx0XHRcdH1cblx0XHRcdGlmIChcblx0XHRcdFx0aGVhZGVyZmFjZXRTdWJTZWN0aW9ucy5sZW5ndGggPiBpICYmXG5cdFx0XHRcdChpdGVtLmtleSA9PT0gaGVhZGVyZmFjZXRTdWJTZWN0aW9uc1tpXS5rZXkgfHxcblx0XHRcdFx0XHQvLyBmb3IgaGVhZGVyIGZhY2V0cyB3aXRoIG5vIGlkIHRoZSBrZXlzIG9mIGhlYWRlciBmYWNldCBhbmQgc3Vic2VjdGlvbiBhcmUgZGlmZmVyZW50ID0+IGNoZWNrIG9ubHkgdGhlIGxhc3QgcGFydFxuXHRcdFx0XHRcdGl0ZW0ua2V5LnNsaWNlKGl0ZW0ua2V5Lmxhc3RJbmRleE9mKFwiOjpcIikgKyAyKSA9PT1cblx0XHRcdFx0XHRcdGhlYWRlcmZhY2V0U3ViU2VjdGlvbnNbaV0ua2V5LnNsaWNlKGhlYWRlcmZhY2V0U3ViU2VjdGlvbnNbaV0ua2V5Lmxhc3RJbmRleE9mKFwiOjpcIikgKyAyKSlcblx0XHRcdCkge1xuXHRcdFx0XHRhbGxIZWFkZXJGYWNldHNTdWJTZWN0aW9ucy5wdXNoKGhlYWRlcmZhY2V0U3ViU2VjdGlvbnNbaV0pO1xuXHRcdFx0XHRpKys7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjdXN0b21IZWFkZXJGYWNldFN1YlNlY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGN1c3RvbUl0ZW0pIHtcblx0XHRcdFx0XHRpZiAoaXRlbS5rZXkgPT09IGN1c3RvbUl0ZW0ua2V5KSB7XG5cdFx0XHRcdFx0XHRhbGxIZWFkZXJGYWNldHNTdWJTZWN0aW9ucy5wdXNoKGN1c3RvbUl0ZW0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0YWxsSGVhZGVyRmFjZXRzU3ViU2VjdGlvbnMgPSBoZWFkZXJmYWNldFN1YlNlY3Rpb25zO1xuXHR9XG5cdGNvbnN0IGhlYWRlclNlY3Rpb246IE9iamVjdFBhZ2VTZWN0aW9uID0ge1xuXHRcdGlkOiBlZGl0YWJsZUhlYWRlclNlY3Rpb25JRCxcblx0XHRrZXk6IFwiRWRpdGFibGVIZWFkZXJDb250ZW50XCIsXG5cdFx0dGl0bGU6IFwie3NhcC5mZS5pMThuPlRfQ09NTU9OX09CSkVDVF9QQUdFX0hFQURFUl9TRUNUSU9OfVwiLFxuXHRcdHZpc2libGU6IGNvbXBpbGVFeHByZXNzaW9uKFVJLklzRWRpdGFibGUpLFxuXHRcdHN1YlNlY3Rpb25zOiBhbGxIZWFkZXJGYWNldHNTdWJTZWN0aW9uc1xuXHR9O1xuXHRyZXR1cm4gaGVhZGVyU2VjdGlvbjtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgZGVmaW5pdGlvbiBmb3IgYSBzZWN0aW9uIGJhc2VkIG9uIHRoZSBGYWNldCBhbm5vdGF0aW9uLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHJldHVybnMgQWxsIHNlY3Rpb25zXG4gKi9cbmZ1bmN0aW9uIGdldFNlY3Rpb25zRnJvbUFubm90YXRpb24oY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IE9iamVjdFBhZ2VTZWN0aW9uW10ge1xuXHRjb25zdCBlbnRpdHlUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCk7XG5cdGNvbnN0IG9iamVjdFBhZ2VTZWN0aW9uczogT2JqZWN0UGFnZVNlY3Rpb25bXSA9XG5cdFx0ZW50aXR5VHlwZS5hbm5vdGF0aW9ucz8uVUk/LkZhY2V0cz8ubWFwKChmYWNldERlZmluaXRpb246IEZhY2V0VHlwZXMpID0+XG5cdFx0XHRnZXRTZWN0aW9uRnJvbUFubm90YXRpb24oZmFjZXREZWZpbml0aW9uLCBjb252ZXJ0ZXJDb250ZXh0KVxuXHRcdCkgfHwgW107XG5cdHJldHVybiBvYmplY3RQYWdlU2VjdGlvbnM7XG59XG5cbi8qKlxuICogQ3JlYXRlIGFuIGFubm90YXRpb24gYmFzZWQgc2VjdGlvbi5cbiAqXG4gKiBAcGFyYW0gZmFjZXRcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgY3VycmVudCBzZWN0aW9uXG4gKi9cbmZ1bmN0aW9uIGdldFNlY3Rpb25Gcm9tQW5ub3RhdGlvbihmYWNldDogRmFjZXRUeXBlcywgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IE9iamVjdFBhZ2VTZWN0aW9uIHtcblx0Y29uc3Qgc2VjdGlvbklEID0gZ2V0U2VjdGlvbklEKGZhY2V0KTtcblx0Y29uc3Qgc2VjdGlvbjogT2JqZWN0UGFnZVNlY3Rpb24gPSB7XG5cdFx0aWQ6IHNlY3Rpb25JRCxcblx0XHRrZXk6IGdldFNlY3Rpb25LZXkoZmFjZXQsIHNlY3Rpb25JRCksXG5cdFx0dGl0bGU6IGZhY2V0LkxhYmVsID8gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGZhY2V0LkxhYmVsKSkgOiB1bmRlZmluZWQsXG5cdFx0c2hvd1RpdGxlOiAhIWZhY2V0LkxhYmVsLFxuXHRcdHZpc2libGU6IGNvbXBpbGVFeHByZXNzaW9uKG5vdChlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZmFjZXQuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4/LnZhbHVlT2YoKSksIHRydWUpKSksXG5cdFx0c3ViU2VjdGlvbnM6IGNyZWF0ZVN1YlNlY3Rpb25zKFtmYWNldF0sIGNvbnZlcnRlckNvbnRleHQpXG5cdH07XG5cdHJldHVybiBzZWN0aW9uO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgc2VjdGlvbiBkZWZpbml0aW9ucyBiYXNlZCBvbiB0aGUgbWFuaWZlc3QgZGVmaW5pdGlvbnMuXG4gKlxuICogQHBhcmFtIG1hbmlmZXN0U2VjdGlvbnMgVGhlIHNlY3Rpb25zIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0XG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHJldHVybnMgVGhlIHNlY3Rpb25zIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0XG4gKi9cbmZ1bmN0aW9uIGdldFNlY3Rpb25zRnJvbU1hbmlmZXN0KFxuXHRtYW5pZmVzdFNlY3Rpb25zOiBDb25maWd1cmFibGVSZWNvcmQ8TWFuaWZlc3RTZWN0aW9uPixcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogUmVjb3JkPHN0cmluZywgQ3VzdG9tT2JqZWN0UGFnZVNlY3Rpb24+IHtcblx0Y29uc3Qgc2VjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbU9iamVjdFBhZ2VTZWN0aW9uPiA9IHt9O1xuXHRPYmplY3Qua2V5cyhtYW5pZmVzdFNlY3Rpb25zKS5mb3JFYWNoKChtYW5pZmVzdFNlY3Rpb25LZXkpID0+IHtcblx0XHRzZWN0aW9uc1ttYW5pZmVzdFNlY3Rpb25LZXldID0gZ2V0U2VjdGlvbkZyb21NYW5pZmVzdChtYW5pZmVzdFNlY3Rpb25zW21hbmlmZXN0U2VjdGlvbktleV0sIG1hbmlmZXN0U2VjdGlvbktleSwgY29udmVydGVyQ29udGV4dCk7XG5cdH0pO1xuXHRyZXR1cm4gc2VjdGlvbnM7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgbWFuaWZlc3QtYmFzZWQgY3VzdG9tIHNlY3Rpb24uXG4gKlxuICogQHBhcmFtIGN1c3RvbVNlY3Rpb25EZWZpbml0aW9uXG4gKiBAcGFyYW0gc2VjdGlvbktleVxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIFRoZSBjdXJyZW50IGN1c3RvbSBzZWN0aW9uXG4gKi9cbmZ1bmN0aW9uIGdldFNlY3Rpb25Gcm9tTWFuaWZlc3QoXG5cdGN1c3RvbVNlY3Rpb25EZWZpbml0aW9uOiBNYW5pZmVzdFNlY3Rpb24sXG5cdHNlY3Rpb25LZXk6IHN0cmluZyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogQ3VzdG9tT2JqZWN0UGFnZVNlY3Rpb24ge1xuXHRjb25zdCBjdXN0b21TZWN0aW9uSUQgPSBjdXN0b21TZWN0aW9uRGVmaW5pdGlvbi5pZCB8fCBnZXRDdXN0b21TZWN0aW9uSUQoc2VjdGlvbktleSk7XG5cdGxldCBwb3NpdGlvbjogUG9zaXRpb24gfCB1bmRlZmluZWQgPSBjdXN0b21TZWN0aW9uRGVmaW5pdGlvbi5wb3NpdGlvbjtcblx0aWYgKCFwb3NpdGlvbikge1xuXHRcdHBvc2l0aW9uID0ge1xuXHRcdFx0cGxhY2VtZW50OiBQbGFjZW1lbnQuQWZ0ZXJcblx0XHR9O1xuXHR9XG5cdGxldCBtYW5pZmVzdFN1YlNlY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBNYW5pZmVzdFN1YlNlY3Rpb24+O1xuXHRpZiAoIWN1c3RvbVNlY3Rpb25EZWZpbml0aW9uLnN1YlNlY3Rpb25zKSB7XG5cdFx0Ly8gSWYgdGhlcmUgaXMgbm8gc3ViU2VjdGlvbiBkZWZpbmVkLCB3ZSBhZGQgdGhlIGNvbnRlbnQgb2YgdGhlIGN1c3RvbSBzZWN0aW9uIGFzIHN1YnNlY3Rpb25zXG5cdFx0Ly8gYW5kIG1ha2Ugc3VyZSB0byBzZXQgdGhlIHZpc2liaWxpdHkgdG8gJ3RydWUnLCBhcyB0aGUgYWN0dWFsIHZpc2liaWxpdHkgaXMgaGFuZGxlZCBieSB0aGUgc2VjdGlvbiBpdHNlbGZcblx0XHRtYW5pZmVzdFN1YlNlY3Rpb25zID0ge1xuXHRcdFx0W3NlY3Rpb25LZXldOiB7XG5cdFx0XHRcdC4uLmN1c3RvbVNlY3Rpb25EZWZpbml0aW9uLFxuXHRcdFx0XHRwb3NpdGlvbjogdW5kZWZpbmVkLFxuXHRcdFx0XHR2aXNpYmxlOiBcInRydWVcIlxuXHRcdFx0fVxuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0bWFuaWZlc3RTdWJTZWN0aW9ucyA9IGN1c3RvbVNlY3Rpb25EZWZpbml0aW9uLnN1YlNlY3Rpb25zO1xuXHR9XG5cdGNvbnN0IHN1YlNlY3Rpb25zID0gY3JlYXRlQ3VzdG9tU3ViU2VjdGlvbnMobWFuaWZlc3RTdWJTZWN0aW9ucywgY29udmVydGVyQ29udGV4dCk7XG5cblx0Y29uc3QgY3VzdG9tU2VjdGlvbjogQ3VzdG9tT2JqZWN0UGFnZVNlY3Rpb24gPSB7XG5cdFx0aWQ6IGN1c3RvbVNlY3Rpb25JRCxcblx0XHRrZXk6IHNlY3Rpb25LZXksXG5cdFx0dGl0bGU6IGN1c3RvbVNlY3Rpb25EZWZpbml0aW9uLnRpdGxlLFxuXHRcdHNob3dUaXRsZTogISFjdXN0b21TZWN0aW9uRGVmaW5pdGlvbi50aXRsZSxcblx0XHR2aXNpYmxlOiBjdXN0b21TZWN0aW9uRGVmaW5pdGlvbi52aXNpYmxlICE9PSB1bmRlZmluZWQgPyBjdXN0b21TZWN0aW9uRGVmaW5pdGlvbi52aXNpYmxlIDogXCJ0cnVlXCIsXG5cdFx0cG9zaXRpb246IHBvc2l0aW9uLFxuXHRcdHN1YlNlY3Rpb25zOiBzdWJTZWN0aW9ucyBhcyBhbnlcblx0fTtcblx0cmV0dXJuIGN1c3RvbVNlY3Rpb247XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBPYmplY3RQYWdlIGhlYWRlciBhY3Rpb25zIChib3RoIHRoZSBkZWZhdWx0IG9uZXMgYW5kIHRoZSBjdXN0b20gb25lcyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdCkuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcmV0dXJucyBBbiBhcnJheSBjb250YWluaW5nIGFsbCB0aGUgYWN0aW9ucyBmb3IgdGhpcyBPYmplY3RQYWdlIGhlYWRlclxuICovXG5leHBvcnQgY29uc3QgZ2V0SGVhZGVyQWN0aW9ucyA9IGZ1bmN0aW9uIChjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogQ29tYmluZWRBY3Rpb24ge1xuXHRjb25zdCBhQW5ub3RhdGlvbkhlYWRlckFjdGlvbnM6IEJhc2VBY3Rpb25bXSA9IGdldEhlYWRlckRlZmF1bHRBY3Rpb25zKGNvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCBtYW5pZmVzdFdyYXBwZXIgPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpO1xuXHRjb25zdCBtYW5pZmVzdEFjdGlvbnMgPSBnZXRBY3Rpb25zRnJvbU1hbmlmZXN0KFxuXHRcdG1hbmlmZXN0V3JhcHBlci5nZXRIZWFkZXJBY3Rpb25zKCksXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRhQW5ub3RhdGlvbkhlYWRlckFjdGlvbnMsXG5cdFx0dW5kZWZpbmVkLFxuXHRcdHVuZGVmaW5lZCxcblx0XHRnZXRIaWRkZW5IZWFkZXJBY3Rpb25zKGNvbnZlcnRlckNvbnRleHQpXG5cdCk7XG5cdGNvbnN0IGFjdGlvbk92ZXJ3cml0ZUNvbmZpZzogT3ZlcnJpZGVUeXBlQWN0aW9uID0ge1xuXHRcdGlzTmF2aWdhYmxlOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdGVuYWJsZWQ6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0dmlzaWJsZTogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHRkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb246IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0Y29tbWFuZDogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZVxuXHR9O1xuXHRjb25zdCBoZWFkZXJBY3Rpb25zID0gaW5zZXJ0Q3VzdG9tRWxlbWVudHMoYUFubm90YXRpb25IZWFkZXJBY3Rpb25zLCBtYW5pZmVzdEFjdGlvbnMuYWN0aW9ucywgYWN0aW9uT3ZlcndyaXRlQ29uZmlnKTtcblx0cmV0dXJuIHtcblx0XHRhY3Rpb25zOiByZW1vdmVEdXBsaWNhdGVBY3Rpb25zKGhlYWRlckFjdGlvbnMpLFxuXHRcdGNvbW1hbmRBY3Rpb25zOiBtYW5pZmVzdEFjdGlvbnMuY29tbWFuZEFjdGlvbnNcblx0fTtcbn07XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBPYmplY3RQYWdlIGZvb3RlciBhY3Rpb25zIChib3RoIHRoZSBkZWZhdWx0IG9uZXMgYW5kIHRoZSBjdXN0b20gb25lcyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdCkuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcmV0dXJucyBBbiBhcnJheSBjb250YWluaW5nIGFsbCB0aGUgYWN0aW9ucyBmb3IgdGhpcyBPYmplY3RQYWdlIGZvb3RlclxuICovXG5leHBvcnQgY29uc3QgZ2V0Rm9vdGVyQWN0aW9ucyA9IGZ1bmN0aW9uIChjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogQ29tYmluZWRBY3Rpb24ge1xuXHRjb25zdCBtYW5pZmVzdFdyYXBwZXIgPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpO1xuXHRjb25zdCBhQW5ub3RhdGlvbkZvb3RlckFjdGlvbnM6IEJhc2VBY3Rpb25bXSA9IGdldEZvb3RlckRlZmF1bHRBY3Rpb25zKG1hbmlmZXN0V3JhcHBlci5nZXRWaWV3TGV2ZWwoKSwgY29udmVydGVyQ29udGV4dCk7XG5cdGNvbnN0IG1hbmlmZXN0QWN0aW9ucyA9IGdldEFjdGlvbnNGcm9tTWFuaWZlc3QobWFuaWZlc3RXcmFwcGVyLmdldEZvb3RlckFjdGlvbnMoKSwgY29udmVydGVyQ29udGV4dCwgYUFubm90YXRpb25Gb290ZXJBY3Rpb25zKTtcblxuXHRjb25zdCBhY3Rpb25PdmVyd3JpdGVDb25maWc6IE92ZXJyaWRlVHlwZUFjdGlvbiA9IHtcblx0XHRpc05hdmlnYWJsZTogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHRlbmFibGVkOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdHZpc2libGU6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0ZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdGNvbW1hbmQ6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGVcblx0fTtcblx0Y29uc3QgZm9vdGVyQWN0aW9ucyA9IGluc2VydEN1c3RvbUVsZW1lbnRzKGFBbm5vdGF0aW9uRm9vdGVyQWN0aW9ucywgbWFuaWZlc3RBY3Rpb25zLmFjdGlvbnMsIGFjdGlvbk92ZXJ3cml0ZUNvbmZpZyk7XG5cdHJldHVybiB7XG5cdFx0YWN0aW9uczogZm9vdGVyQWN0aW9ucyxcblx0XHRjb21tYW5kQWN0aW9uczogbWFuaWZlc3RBY3Rpb25zLmNvbW1hbmRBY3Rpb25zXG5cdH07XG59O1xuXG5mdW5jdGlvbiBfZ2V0U3ViU2VjdGlvblZpc3VhbGl6YXRpb24oc3ViU2VjdGlvbjogRGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uKTogVGFibGVWaXN1YWxpemF0aW9uIHtcblx0cmV0dXJuIChzdWJTZWN0aW9uPy5wcmVzZW50YXRpb24/LnZpc3VhbGl6YXRpb25zWzBdID8gc3ViU2VjdGlvbi5wcmVzZW50YXRpb24udmlzdWFsaXphdGlvbnNbMF0gOiB1bmRlZmluZWQpIGFzIFRhYmxlVmlzdWFsaXphdGlvbjtcbn1cblxuZnVuY3Rpb24gX2lzRmFjZXRIYXNHcmlkVGFibGVWaXNpYmxlKFxuXHRkYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb246IERhdGFWaXN1YWxpemF0aW9uU3ViU2VjdGlvbixcblx0c3ViU2VjdGlvblZpc3VhbGl6YXRpb246IFRhYmxlVmlzdWFsaXphdGlvblxuKTogYm9vbGVhbiB7XG5cdHJldHVybiAoXG5cdFx0ZGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uLnZpc2libGUgPT09IFwidHJ1ZVwiICYmXG5cdFx0ZGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uPy5wcmVzZW50YXRpb24/LnZpc3VhbGl6YXRpb25zICYmXG5cdFx0c3ViU2VjdGlvblZpc3VhbGl6YXRpb24/LnR5cGUgPT09IFwiVGFibGVcIiAmJlxuXHRcdHN1YlNlY3Rpb25WaXN1YWxpemF0aW9uPy5jb250cm9sPy50eXBlID09PSBcIkdyaWRUYWJsZVwiXG5cdCk7XG59XG5cbmZ1bmN0aW9uIF9zZXRHcmlkVGFibGVWaXN1YWxpemF0aW9uSW5mb3JtYXRpb24oXG5cdHNlY3Rpb25zOiBPYmplY3RQYWdlU2VjdGlvbltdLFxuXHRkYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb246IERhdGFWaXN1YWxpemF0aW9uU3ViU2VjdGlvbixcblx0c3ViU2VjdGlvblZpc3VhbGl6YXRpb246IFRhYmxlVmlzdWFsaXphdGlvbixcblx0c2VjdGlvbkxheW91dDogc3RyaW5nXG4pOiB2b2lkIHtcblx0aWYgKF9pc0ZhY2V0SGFzR3JpZFRhYmxlVmlzaWJsZShkYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb24sIHN1YlNlY3Rpb25WaXN1YWxpemF0aW9uKSkge1xuXHRcdGNvbnN0IHRhYmxlQ29udHJvbENvbmZpZ3VyYXRpb246IFRhYmxlQ29udHJvbENvbmZpZ3VyYXRpb24gPSBzdWJTZWN0aW9uVmlzdWFsaXphdGlvbi5jb250cm9sO1xuXHRcdGlmICghKHNlY3Rpb25MYXlvdXQgPT09IFwiUGFnZVwiICYmIHNlY3Rpb25zLmxlbmd0aCA+IDEpKSB7XG5cdFx0XHR0YWJsZUNvbnRyb2xDb25maWd1cmF0aW9uLnJvd0NvdW50TW9kZSA9IFwiQXV0b1wiO1xuXHRcdH1cblx0XHRpZiAoc2VjdGlvbkxheW91dCAhPT0gXCJUYWJzXCIpIHtcblx0XHRcdHRhYmxlQ29udHJvbENvbmZpZ3VyYXRpb24udXNlQ29uZGVuc2VkVGFibGVMYXlvdXQgPSBmYWxzZTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gX3NldEdyaWRUYWJsZVdpdGhNaXhGYWNldHNJbmZvcm1hdGlvbihzdWJTZWN0aW9uOiBEYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb24sIHNlY3Rpb25MYXlvdXQ6IHN0cmluZyk6IHZvaWQge1xuXHRpZiAoc3ViU2VjdGlvbj8uY29udGVudD8ubGVuZ3RoID09PSAxKSB7XG5cdFx0Y29uc3QgdGFibGVDb250cm9sID0gKChzdWJTZWN0aW9uLmNvbnRlbnRbMF0gYXMgRGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uKS5wcmVzZW50YXRpb24/LnZpc3VhbGl6YXRpb25zWzBdIGFzIFRhYmxlVmlzdWFsaXphdGlvbilcblx0XHRcdC5jb250cm9sO1xuXHRcdGlmICh0YWJsZUNvbnRyb2wudHlwZSA9PT0gXCJHcmlkVGFibGVcIikge1xuXHRcdFx0dGFibGVDb250cm9sLnJvd0NvdW50TW9kZSA9IFwiQXV0b1wiO1xuXHRcdFx0aWYgKHNlY3Rpb25MYXlvdXQgIT09IFwiVGFic1wiKSB7XG5cdFx0XHRcdHRhYmxlQ29udHJvbC51c2VDb25kZW5zZWRUYWJsZUxheW91dCA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG4vKipcbiAqIFNldCB0aGUgR3JpZFRhYmxlIGRpc3BsYXkgaW5mb3JtYXRpb24uXG4gKlxuICogQHBhcmFtIHNlY3Rpb25zIFRoZSBPYmplY3RQYWdlIHNlY3Rpb25zXG4gKiBAcGFyYW0gc2VjdGlvbiBUaGUgY3VycmVudCBPYmplY3RQYWdlIHNlY3Rpb24gcHJvY2Vzc2VkXG4gKiBAcGFyYW0gc2VjdGlvbkxheW91dFxuICovXG5mdW5jdGlvbiBfc2V0R3JpZFRhYmxlU3ViU2VjdGlvbkNvbnRyb2xDb25maWd1cmF0aW9uKFxuXHRzZWN0aW9uczogT2JqZWN0UGFnZVNlY3Rpb25bXSxcblx0c2VjdGlvbjogT2JqZWN0UGFnZVNlY3Rpb24sXG5cdHNlY3Rpb25MYXlvdXQ6IHN0cmluZ1xuKTogdm9pZCB7XG5cdGxldCBkYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb246IERhdGFWaXN1YWxpemF0aW9uU3ViU2VjdGlvbjtcblx0bGV0IHN1YlNlY3Rpb25WaXN1YWxpemF0aW9uOiBUYWJsZVZpc3VhbGl6YXRpb247XG5cdGNvbnN0IHN1YlNlY3Rpb25zID0gc2VjdGlvbi5zdWJTZWN0aW9ucztcblx0aWYgKHN1YlNlY3Rpb25zLmxlbmd0aCA9PT0gMSkge1xuXHRcdGRhdGFWaXN1YWxpemF0aW9uU3ViU2VjdGlvbiA9IHN1YlNlY3Rpb25zWzBdIGFzIERhdGFWaXN1YWxpemF0aW9uU3ViU2VjdGlvbjtcblx0XHRzd2l0Y2ggKHN1YlNlY3Rpb25zWzBdLnR5cGUpIHtcblx0XHRcdGNhc2UgXCJEYXRhVmlzdWFsaXphdGlvblwiOlxuXHRcdFx0XHRzdWJTZWN0aW9uVmlzdWFsaXphdGlvbiA9IF9nZXRTdWJTZWN0aW9uVmlzdWFsaXphdGlvbihkYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb24pO1xuXHRcdFx0XHRfc2V0R3JpZFRhYmxlVmlzdWFsaXphdGlvbkluZm9ybWF0aW9uKHNlY3Rpb25zLCBkYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb24sIHN1YlNlY3Rpb25WaXN1YWxpemF0aW9uLCBzZWN0aW9uTGF5b3V0KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiTWl4ZWRcIjpcblx0XHRcdFx0X3NldEdyaWRUYWJsZVdpdGhNaXhGYWNldHNJbmZvcm1hdGlvbihkYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb24sIHNlY3Rpb25MYXlvdXQpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRyZXR1cm47XG5cdH1cblx0X3JlbW92ZUNvbmRlbnNlZEZyb21TdWJTZWN0aW9ucyhzdWJTZWN0aW9ucyk7XG59XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBjb25kZW5zZSBsYXlvdXQgbW9kZSBmcm9tIHRoZSBzdWJzZWN0aW9ucy5cbiAqXG4gKiBAcGFyYW0gc3ViU2VjdGlvbnMgVGhlIHN1YlNlY3Rpb25zIHdoZXJlIHdlIG5lZWQgdG8gcmVtb3ZlIHRoZSBjb25kZW5zZWQgbGF5b3V0XG4gKi9cbmZ1bmN0aW9uIF9yZW1vdmVDb25kZW5zZWRGcm9tU3ViU2VjdGlvbnMoc3ViU2VjdGlvbnM6IE9iamVjdFBhZ2VTdWJTZWN0aW9uW10pIHtcblx0bGV0IGRhdGFWaXN1YWxpemF0aW9uU3ViU2VjdGlvbjogRGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uO1xuXHQvLyBXZSBjaGVjayBpbiBlYWNoIHN1YnNlY3Rpb24gaWYgdGhlcmUgaXMgdmlzdWFsaXphdGlvbnNcblx0c3ViU2VjdGlvbnMuZm9yRWFjaCgoc3ViU2VjdGlvbikgPT4ge1xuXHRcdGRhdGFWaXN1YWxpemF0aW9uU3ViU2VjdGlvbiA9IHN1YlNlY3Rpb24gYXMgRGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uO1xuXHRcdGlmIChkYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb24/LnByZXNlbnRhdGlvbj8udmlzdWFsaXphdGlvbnMpIHtcblx0XHRcdGRhdGFWaXN1YWxpemF0aW9uU3ViU2VjdGlvbj8ucHJlc2VudGF0aW9uPy52aXN1YWxpemF0aW9ucy5mb3JFYWNoKChzaW5nbGVWaXN1YWxpemF0aW9uKSA9PiB7XG5cdFx0XHRcdGlmIChzaW5nbGVWaXN1YWxpemF0aW9uLnR5cGUgPT09IFZpc3VhbGl6YXRpb25UeXBlLlRhYmxlKSB7XG5cdFx0XHRcdFx0c2luZ2xlVmlzdWFsaXphdGlvbi5jb250cm9sLnVzZUNvbmRlbnNlZFRhYmxlTGF5b3V0ID0gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHQvLyBUaGVuIHdlIGNoZWNrIHRoZSBjb250ZW50IG9mIHRoZSBzdWJzZWN0aW9uLCBhbmQgaW4gZWFjaCBjb250ZW50IHdlIGNoZWNrIGlmIHRoZXJlIGlzIGEgdGFibGUgdG8gc2V0IGl0cyBjb25kZW5zZWQgbGF5b3V0IHRvIGZhbHNlXG5cdFx0aWYgKGRhdGFWaXN1YWxpemF0aW9uU3ViU2VjdGlvbj8uY29udGVudCkge1xuXHRcdFx0ZGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uLmNvbnRlbnQuZm9yRWFjaCgoc2luZ2xlQ29udGVudCkgPT4ge1xuXHRcdFx0XHQoc2luZ2xlQ29udGVudCBhcyBEYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb24pLnByZXNlbnRhdGlvbj8udmlzdWFsaXphdGlvbnMuZm9yRWFjaCgoc2luZ2xlVmlzdWFsaXphdGlvbikgPT4ge1xuXHRcdFx0XHRcdGlmIChzaW5nbGVWaXN1YWxpemF0aW9uLnR5cGUgPT09IFZpc3VhbGl6YXRpb25UeXBlLlRhYmxlKSB7XG5cdFx0XHRcdFx0XHRzaW5nbGVWaXN1YWxpemF0aW9uLmNvbnRyb2wudXNlQ29uZGVuc2VkVGFibGVMYXlvdXQgPSBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9KTtcbn1cbi8qKlxuICogUmV0cmlldmVzIGFuZCBtZXJnZXMgdGhlIE9iamVjdFBhZ2Ugc2VjdGlvbnMgZGVmaW5lZCBpbiB0aGUgYW5ub3RhdGlvbiBhbmQgaW4gdGhlIG1hbmlmZXN0LlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHJldHVybnMgQW4gYXJyYXkgb2Ygc2VjdGlvbnMuXG4gKi9cblxuZXhwb3J0IGNvbnN0IGdldFNlY3Rpb25zID0gZnVuY3Rpb24gKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBPYmplY3RQYWdlU2VjdGlvbltdIHtcblx0Y29uc3QgbWFuaWZlc3RXcmFwcGVyID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKTtcblx0Y29uc3Qgc2VjdGlvbnMgPSBpbnNlcnRDdXN0b21FbGVtZW50cyhcblx0XHRnZXRTZWN0aW9uc0Zyb21Bbm5vdGF0aW9uKGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdGdldFNlY3Rpb25zRnJvbU1hbmlmZXN0KG1hbmlmZXN0V3JhcHBlci5nZXRTZWN0aW9ucygpLCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHR7XG5cdFx0XHR0aXRsZTogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHRcdHZpc2libGU6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0XHRzdWJTZWN0aW9uczoge1xuXHRcdFx0XHRhY3Rpb25zOiBPdmVycmlkZVR5cGUubWVyZ2UsXG5cdFx0XHRcdHRpdGxlOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdFx0XHRzaWRlQ29udGVudDogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHRcdFx0b2JqZWN0UGFnZUxhenlMb2FkZXJFbmFibGVkOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlXG5cdFx0XHR9XG5cdFx0fVxuXHQpO1xuXHQvLyBMZXZlbCBBZGp1c3RtZW50IGZvciBcIk1peGVkXCIgQ29sbGVjdGlvbiBGYWNldHM6XG5cdC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0Ly8gVGhlIG1hbmlmZXN0IGRlZmluaXRpb24gb2YgY3VzdG9tIHNpZGUgY29udGVudHMgYW5kIGFjdGlvbnMgc3RpbGwgbmVlZHMgdG8gYmUgYWxpZ25lZCBmb3IgXCJNaXhlZFwiIGNvbGxlY3Rpb24gZmFjZXRzOlxuXHQvLyBDb2xsZWN0aW9uIGZhY2V0cyBjb250YWluaW5nIHRhYmxlcyBnYWluIGFuIGV4dHJhIHJlZmVyZW5jZSBmYWNldCBhcyBhIHRhYmxlIHdyYXBwZXIgdG8gZW5zdXJlLCB0aGF0IHRoZSB0YWJsZSBpcyBhbHdheXNcblx0Ly8gcGxhY2VkIGluIGFuIG93biBpbmRpdmlkdWFsIE9iamVjdCBQYWdlIEJsb2NrOyB0aGlzIGFkZGl0aW9uYWwgaGllcmFyY2h5IGxldmVsIGlzIHVua25vd24gdG8gYXBwIGRldmVsb3BlcnMsIHdoaWNoIGFyZVxuXHQvLyBkZWZpbmluZyB0aGUgc2lkZSBjb250ZW50IGFuZCBhY3Rpb25zIGluIHRoZSBtYW5pZmVzdCBhdCBjb2xsZWN0aW9uIGZhY2V0IGxldmVsOyBub3csIHNpbmNlIHRoZSBzaWRlQ29udGVudCBhbHdheXMgbmVlZHNcblx0Ly8gdG8gYmUgYXNzaWduZWQgdG8gYSBibG9jaywgYW5kIGFjdGlvbnMgYWx3YXlzIG5lZWQgdG8gYmUgYXNzaWduZWQgdG8gYSBmb3JtLFxuXHQvLyB3ZSBuZWVkIHRvIG1vdmUgdGhlIHNpZGVDb250ZW50IGFuZCBhY3Rpb25zIGZyb20gYSBtaXhlZCBjb2xsZWN0aW9uIGZhY2V0IHRvIGl0cyBjb250ZW50LlxuXHQvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdHNlY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKHNlY3Rpb24pIHtcblx0XHRfc2V0R3JpZFRhYmxlU3ViU2VjdGlvbkNvbnRyb2xDb25maWd1cmF0aW9uKHNlY3Rpb25zLCBzZWN0aW9uLCBtYW5pZmVzdFdyYXBwZXIuZ2V0U2VjdGlvbkxheW91dCgpKTtcblx0XHRzZWN0aW9uLnN1YlNlY3Rpb25zPy5mb3JFYWNoKGZ1bmN0aW9uIChzdWJTZWN0aW9uKSB7XG5cdFx0XHRzdWJTZWN0aW9uLnRpdGxlID0gc3ViU2VjdGlvbi50aXRsZSA9PT0gXCJ1bmRlZmluZWRcIiA/IHVuZGVmaW5lZCA6IHN1YlNlY3Rpb24udGl0bGU7XG5cdFx0XHRpZiAoc3ViU2VjdGlvbi50eXBlID09PSBcIk1peGVkXCIpIHtcblx0XHRcdFx0c3ViU2VjdGlvbi5jb250ZW50Py5mb3JFYWNoKChjb250ZW50KSA9PiB7XG5cdFx0XHRcdFx0Y29udGVudC5vYmplY3RQYWdlTGF6eUxvYWRlckVuYWJsZWQgPSBzdWJTZWN0aW9uLm9iamVjdFBhZ2VMYXp5TG9hZGVyRW5hYmxlZDtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoc3ViU2VjdGlvbi50eXBlID09PSBcIk1peGVkXCIgJiYgc3ViU2VjdGlvbi5jb250ZW50Py5sZW5ndGgpIHtcblx0XHRcdFx0Y29uc3QgZmlyc3RGb3JtID0gc3ViU2VjdGlvbi5jb250ZW50LmZpbmQoXG5cdFx0XHRcdFx0KGVsZW1lbnQpID0+IChlbGVtZW50IGFzIEZvcm1TdWJTZWN0aW9uKS50eXBlID09PSBTdWJTZWN0aW9uVHlwZS5Gb3JtXG5cdFx0XHRcdCkgYXMgRm9ybVN1YlNlY3Rpb247XG5cblx0XHRcdFx0Ly8gMS4gQ29weSBzaWRlQ29udGVudCB0byB0aGUgU3ViU2VjdGlvbidzIGZpcnN0IGZvcm07IG9yIC0tIGlmIHVuYXZhaWxhYmxlIC0tIHRvIGl0cyBmaXJzdCBjb250ZW50XG5cdFx0XHRcdC8vIDIuIENvcHkgYWN0aW9ucyB0byB0aGUgZmlyc3QgZm9ybSBvZiB0aGUgU3ViU2VjdGlvbidzIGNvbnRlbnRcblx0XHRcdFx0Ly8gMy4gRGVsZXRlIHNpZGVDb250ZW50IC8gYWN0aW9ucyBhdCB0aGUgKGludmFsaWQpIG1hbmlmZXN0IGxldmVsXG5cblx0XHRcdFx0aWYgKHN1YlNlY3Rpb24uc2lkZUNvbnRlbnQpIHtcblx0XHRcdFx0XHRpZiAoZmlyc3RGb3JtKSB7XG5cdFx0XHRcdFx0XHQvLyBJZiB0aGVyZSBpcyBhIGZvcm0sIGl0IGFsd2F5cyBuZWVkcyB0byBiZSBhdHRhY2hlZCB0byB0aGUgZm9ybSwgYXMgdGhlIGZvcm0gaW5oZXJpdHMgdGhlIElEIG9mIHRoZSBTdWJTZWN0aW9uXG5cdFx0XHRcdFx0XHRmaXJzdEZvcm0uc2lkZUNvbnRlbnQgPSBzdWJTZWN0aW9uLnNpZGVDb250ZW50O1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRzdWJTZWN0aW9uLmNvbnRlbnRbMF0uc2lkZUNvbnRlbnQgPSBzdWJTZWN0aW9uLnNpZGVDb250ZW50O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRzdWJTZWN0aW9uLnNpZGVDb250ZW50ID0gdW5kZWZpbmVkO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGZpcnN0Rm9ybSAmJiAoc3ViU2VjdGlvbiBhcyBGb3JtU3ViU2VjdGlvbikuYWN0aW9ucz8ubGVuZ3RoKSB7XG5cdFx0XHRcdFx0Zmlyc3RGb3JtLmFjdGlvbnMgPSAoc3ViU2VjdGlvbiBhcyBGb3JtU3ViU2VjdGlvbikuYWN0aW9ucztcblx0XHRcdFx0XHQoc3ViU2VjdGlvbiBhcyBGb3JtU3ViU2VjdGlvbikuYWN0aW9ucyA9IFtdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0pO1xuXHRyZXR1cm4gc2VjdGlvbnM7XG59O1xuXG4vKipcbiAqIERldGVybWluZXMgaWYgdGhlIE9iamVjdFBhZ2UgaGFzIGhlYWRlciBjb250ZW50LlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBpbnN0YW5jZSBvZiB0aGUgY29udmVydGVyIGNvbnRleHRcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGVyZSBpcyBhdCBsZWFzdCBvbiBoZWFkZXIgZmFjZXRcbiAqL1xuZnVuY3Rpb24gaGFzSGVhZGVyQ29udGVudChjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogYm9vbGVhbiB7XG5cdGNvbnN0IG1hbmlmZXN0V3JhcHBlciA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCk7XG5cdHJldHVybiAoXG5cdFx0KGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpLmFubm90YXRpb25zPy5VST8uSGVhZGVyRmFjZXRzIHx8IFtdKS5sZW5ndGggPiAwIHx8XG5cdFx0T2JqZWN0LmtleXMobWFuaWZlc3RXcmFwcGVyLmdldEhlYWRlckZhY2V0cygpKS5sZW5ndGggPiAwXG5cdCk7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgZXhwcmVzc2lvbiB0byBldmFsdWF0ZSB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgaGVhZGVyIGNvbnRlbnQuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGluc3RhbmNlIG9mIHRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlIERlbGV0ZSBidXR0b25cbiAqL1xuZnVuY3Rpb24gZ2V0U2hvd0hlYWRlckNvbnRlbnRFeHByZXNzaW9uKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248YW55PiB7XG5cdGNvbnN0IG1hbmlmZXN0V3JhcHBlciA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCk7XG5cdHJldHVybiBpZkVsc2UoXG5cdFx0IWhhc0hlYWRlckNvbnRlbnQoY29udmVydGVyQ29udGV4dCksXG5cdFx0Y29uc3RhbnQoZmFsc2UpLFxuXHRcdGlmRWxzZShlcXVhbChtYW5pZmVzdFdyYXBwZXIuaXNIZWFkZXJFZGl0YWJsZSgpLCBmYWxzZSksIGNvbnN0YW50KHRydWUpLCBub3QoVUkuSXNFZGl0YWJsZSkpXG5cdCk7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgYmluZGluZyBleHByZXNzaW9uIHRvIGV2YWx1YXRlIHRoZSB2aXNpYmlsaXR5IG9mIHRoZSBoZWFkZXIgY29udGVudC5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgaW5zdGFuY2Ugb2YgdGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgRGVsZXRlIGJ1dHRvblxuICovXG5leHBvcnQgY29uc3QgZ2V0U2hvd0hlYWRlckNvbnRlbnQgPSBmdW5jdGlvbiAoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHtcblx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGdldFNob3dIZWFkZXJDb250ZW50RXhwcmVzc2lvbihjb252ZXJ0ZXJDb250ZXh0KSk7XG59O1xuXG4vKipcbiAqIEdldHMgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiB0byBldmFsdWF0ZSB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgYXZhdGFyIHdoZW4gdGhlIGhlYWRlciBpcyBpbiBleHBhbmRlZCBzdGF0ZS5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgaW5zdGFuY2Ugb2YgdGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgRGVsZXRlIGJ1dHRvblxuICovXG5leHBvcnQgY29uc3QgZ2V0RXhwYW5kZWRJbWFnZVZpc2libGUgPSBmdW5jdGlvbiAoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHtcblx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKG5vdChnZXRTaG93SGVhZGVyQ29udGVudEV4cHJlc3Npb24oY29udmVydGVyQ29udGV4dCkpKTtcbn07XG5cbmV4cG9ydCBjb25zdCBjb252ZXJ0UGFnZSA9IGZ1bmN0aW9uIChjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogT2JqZWN0UGFnZURlZmluaXRpb24ge1xuXHRjb25zdCBtYW5pZmVzdFdyYXBwZXIgPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpO1xuXHRsZXQgaGVhZGVyU2VjdGlvbjogT2JqZWN0UGFnZVNlY3Rpb24gfCB1bmRlZmluZWQ7XG5cdGNvbnN0IGVudGl0eVR5cGU6IEVudGl0eVR5cGUgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKTtcblxuXHQvLyBSZXRyaWV2ZSBhbGwgaGVhZGVyIGZhY2V0cyAoZnJvbSBhbm5vdGF0aW9ucyAmIGN1c3RvbSlcblx0Y29uc3QgaGVhZGVyRmFjZXRzID0gaW5zZXJ0Q3VzdG9tRWxlbWVudHMoXG5cdFx0Z2V0SGVhZGVyRmFjZXRzRnJvbUFubm90YXRpb25zKGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdGdldEhlYWRlckZhY2V0c0Zyb21NYW5pZmVzdChtYW5pZmVzdFdyYXBwZXIuZ2V0SGVhZGVyRmFjZXRzKCkpXG5cdCk7XG5cblx0Ly8gUmV0cmlldmUgdGhlIHBhZ2UgaGVhZGVyIGFjdGlvbnNcblx0Y29uc3QgaGVhZGVyQWN0aW9ucyA9IGdldEhlYWRlckFjdGlvbnMoY29udmVydGVyQ29udGV4dCk7XG5cblx0Ly8gUmV0cmlldmUgdGhlIHBhZ2UgZm9vdGVyIGFjdGlvbnNcblx0Y29uc3QgZm9vdGVyQWN0aW9ucyA9IGdldEZvb3RlckFjdGlvbnMoY29udmVydGVyQ29udGV4dCk7XG5cblx0aWYgKG1hbmlmZXN0V3JhcHBlci5pc0hlYWRlckVkaXRhYmxlKCkgJiYgKGVudGl0eVR5cGUuYW5ub3RhdGlvbnMuVUk/LkhlYWRlckZhY2V0cyB8fCBlbnRpdHlUeXBlLmFubm90YXRpb25zLlVJPy5IZWFkZXJJbmZvKSkge1xuXHRcdGhlYWRlclNlY3Rpb24gPSBjcmVhdGVFZGl0YWJsZUhlYWRlclNlY3Rpb24oY29udmVydGVyQ29udGV4dCwgaGVhZGVyRmFjZXRzKTtcblx0fVxuXG5cdGNvbnN0IHNlY3Rpb25zID0gZ2V0U2VjdGlvbnMoY29udmVydGVyQ29udGV4dCk7XG5cblx0cmV0dXJuIHtcblx0XHR0ZW1wbGF0ZTogVGVtcGxhdGVUeXBlLk9iamVjdFBhZ2UsXG5cdFx0aGVhZGVyOiB7XG5cdFx0XHR2aXNpYmxlOiBtYW5pZmVzdFdyYXBwZXIuZ2V0U2hvd09iamVjdFBhZ2VIZWFkZXIoKSxcblx0XHRcdHNlY3Rpb246IGhlYWRlclNlY3Rpb24sXG5cdFx0XHRmYWNldHM6IGhlYWRlckZhY2V0cyxcblx0XHRcdGFjdGlvbnM6IGhlYWRlckFjdGlvbnMuYWN0aW9ucyxcblx0XHRcdHNob3dDb250ZW50OiBnZXRTaG93SGVhZGVyQ29udGVudChjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRcdGhhc0NvbnRlbnQ6IGhhc0hlYWRlckNvbnRlbnQoY29udmVydGVyQ29udGV4dCksXG5cdFx0XHRhdmF0YXI6IGdldEF2YXRhcihjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRcdHRpdGxlOiB7XG5cdFx0XHRcdGV4cGFuZGVkSW1hZ2VWaXNpYmxlOiBnZXRFeHBhbmRlZEltYWdlVmlzaWJsZShjb252ZXJ0ZXJDb250ZXh0KVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0c2VjdGlvbnM6IHNlY3Rpb25zLFxuXHRcdGZvb3RlckFjdGlvbnM6IGZvb3RlckFjdGlvbnMuYWN0aW9ucyxcblx0XHRoZWFkZXJDb21tYW5kQWN0aW9uczogaGVhZGVyQWN0aW9ucy5jb21tYW5kQWN0aW9ucyxcblx0XHRmb290ZXJDb21tYW5kQWN0aW9uczogZm9vdGVyQWN0aW9ucy5jb21tYW5kQWN0aW9ucyxcblx0XHRzaG93QW5jaG9yQmFyOiBtYW5pZmVzdFdyYXBwZXIuZ2V0U2hvd0FuY2hvckJhcigpLFxuXHRcdHVzZUljb25UYWJCYXI6IG1hbmlmZXN0V3JhcHBlci51c2VJY29uVGFiQmFyKClcblx0fTtcbn07XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBMkRBLE1BQU1BLGFBQWEsR0FBRyxDQUFDQyxlQUEyQixFQUFFQyxRQUFnQixLQUFhO0lBQUE7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