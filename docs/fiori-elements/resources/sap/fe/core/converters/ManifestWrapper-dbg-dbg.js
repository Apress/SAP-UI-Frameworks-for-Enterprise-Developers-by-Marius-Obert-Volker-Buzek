/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/ManifestSettings", "sap/ui/Device"], function (ManifestSettings, Device) {
  "use strict";

  var system = Device.system;
  var VariantManagementType = ManifestSettings.VariantManagementType;
  function ensureAnnotationPath(obj, property) {
    const propertyValue = obj === null || obj === void 0 ? void 0 : obj[property];
    if (Array.isArray(propertyValue)) {
      propertyValue.forEach(entry => ensureAnnotationPath(entry, "annotationPath"));
    } else if (propertyValue && !propertyValue.includes("@")) {
      obj[property] = "@" + propertyValue;
    }
  }

  /**
   *
   */
  let ManifestWrapper = /*#__PURE__*/function () {
    /**
     * Creates a wrapper object to ensure the data returned from the manifest is consistent and everything is merged correctly.
     *
     * @param oManifestSettings The manifest settings for the current page
     * @param mergeFn A function that will be used to perform the merge
     * @returns The manifest wrapper object
     */
    function ManifestWrapper(oManifestSettings, mergeFn) {
      var _views;
      this.oManifestSettings = oManifestSettings;
      this.mergeFn = mergeFn;
      // Ensure that properties which are meant to contain an *annotation* path contain a '@'
      ensureAnnotationPath(this.oManifestSettings, "defaultTemplateAnnotationPath");
      (_views = this.oManifestSettings.views) === null || _views === void 0 ? void 0 : _views.paths.forEach(path => {
        ensureAnnotationPath(path, "annotationPath");
        ensureAnnotationPath(path, "primary");
        ensureAnnotationPath(path, "secondary");
      });
      if (this.oManifestSettings.controlConfiguration) {
        for (const controlConfiguration of Object.values(this.oManifestSettings.controlConfiguration)) {
          var _tableSettings;
          const quickVariantSelection = (_tableSettings = controlConfiguration.tableSettings) === null || _tableSettings === void 0 ? void 0 : _tableSettings.quickVariantSelection;
          ensureAnnotationPath(quickVariantSelection, "paths");
        }
      }
    }

    /**
     * Returns the current template type.
     *
     * @returns The type of the current template
     */
    var _proto = ManifestWrapper.prototype;
    _proto.getTemplateType = function getTemplateType() {
      return this.oManifestSettings.converterType;
    }

    /**
     * Checks whether the current template should display the filter bar.
     *
     * @returns `true` if the filter bar should be hidden
     */;
    _proto.isFilterBarHidden = function isFilterBarHidden() {
      var _this$oManifestSettin;
      return !!((_this$oManifestSettin = this.oManifestSettings) !== null && _this$oManifestSettin !== void 0 && _this$oManifestSettin.hideFilterBar);
    };
    _proto.useHiddenFilterBar = function useHiddenFilterBar() {
      var _this$oManifestSettin2;
      return !!((_this$oManifestSettin2 = this.oManifestSettings) !== null && _this$oManifestSettin2 !== void 0 && _this$oManifestSettin2.useHiddenFilterBar);
    }

    /**
     * Checks whether the current environment is a desktop or not.
     *
     * @returns `true` if we are on a desktop
     */;
    _proto.isDesktop = function isDesktop() {
      return !!this.oManifestSettings.isDesktop;
    }

    /**
     * Checks whether the current environment is a mobile phone or not.
     *
     * @returns `true` if we are on a mobile phone
     */;
    _proto.isPhone = function isPhone() {
      return !!this.oManifestSettings.isPhone;
    }

    /**
     * Retrieves the form containers (field groups or identification) defined in the manifest.
     *
     * @param facetTarget The target annotation path for this form
     * @returns A set of form containers defined in the manifest indexed by an iterable key
     */;
    _proto.getFormContainer = function getFormContainer(facetTarget) {
      var _this$oManifestSettin3;
      return (_this$oManifestSettin3 = this.oManifestSettings.controlConfiguration) === null || _this$oManifestSettin3 === void 0 ? void 0 : _this$oManifestSettin3[facetTarget];
    }

    /**
     * Retrieves the header facets defined in the manifest.
     *
     * @returns A set of header facets defined in the manifest indexed by an iterable key
     */;
    _proto.getHeaderFacets = function getHeaderFacets() {
      var _this$oManifestSettin4, _this$oManifestSettin5, _content, _content$header;
      return this.mergeFn({}, (_this$oManifestSettin4 = this.oManifestSettings.controlConfiguration) === null || _this$oManifestSettin4 === void 0 ? void 0 : (_this$oManifestSettin5 = _this$oManifestSettin4["@com.sap.vocabularies.UI.v1.HeaderFacets"]) === null || _this$oManifestSettin5 === void 0 ? void 0 : _this$oManifestSettin5.facets, (_content = this.oManifestSettings.content) === null || _content === void 0 ? void 0 : (_content$header = _content.header) === null || _content$header === void 0 ? void 0 : _content$header.facets);
    }

    /**
     * Retrieves the header actions defined in the manifest.
     *
     * @returns A set of actions defined in the manifest indexed by an iterable key
     */;
    _proto.getHeaderActions = function getHeaderActions() {
      var _this$oManifestSettin6, _this$oManifestSettin7;
      return ((_this$oManifestSettin6 = this.oManifestSettings.content) === null || _this$oManifestSettin6 === void 0 ? void 0 : (_this$oManifestSettin7 = _this$oManifestSettin6.header) === null || _this$oManifestSettin7 === void 0 ? void 0 : _this$oManifestSettin7.actions) || {};
    }

    /**
     * Retrieves the footer actions defined in the manifest.
     *
     * @returns A set of actions defined in the manifest indexed by an iterable key
     */;
    _proto.getFooterActions = function getFooterActions() {
      var _this$oManifestSettin8, _this$oManifestSettin9;
      return ((_this$oManifestSettin8 = this.oManifestSettings.content) === null || _this$oManifestSettin8 === void 0 ? void 0 : (_this$oManifestSettin9 = _this$oManifestSettin8.footer) === null || _this$oManifestSettin9 === void 0 ? void 0 : _this$oManifestSettin9.actions) || {};
    }

    /**
     * Retrieves the variant management as defined in the manifest.
     *
     * @returns A type of variant management
     */;
    _proto.getVariantManagement = function getVariantManagement() {
      return this.oManifestSettings.variantManagement || VariantManagementType.None;
    }

    /**
     * Retrieves the annotation Path for the SPV in the manifest.
     *
     * @returns The annotation path for the default SPV or undefined.
     */;
    _proto.getDefaultTemplateAnnotationPath = function getDefaultTemplateAnnotationPath() {
      return this.oManifestSettings.defaultTemplateAnnotationPath;
    }

    /**
     * Retrieves the control configuration as defined in the manifest for a specific annotation path.
     *
     * @param sAnnotationPath The relative annotation path
     * @private
     * @returns The control configuration
     */;
    _proto.getControlConfiguration = function getControlConfiguration(sAnnotationPath) {
      var _this$oManifestSettin10, _this$oManifestSettin11;
      return ((_this$oManifestSettin10 = this.oManifestSettings) === null || _this$oManifestSettin10 === void 0 ? void 0 : (_this$oManifestSettin11 = _this$oManifestSettin10.controlConfiguration) === null || _this$oManifestSettin11 === void 0 ? void 0 : _this$oManifestSettin11[sAnnotationPath]) || {};
    }

    /**
     * Retrieves the configured settings for a given navigation target.
     *
     * @param navigationOrCollectionName The name of the navigation to check
     * @returns The navigation settings configuration
     */;
    _proto.getNavigationConfiguration = function getNavigationConfiguration(navigationOrCollectionName) {
      var _this$oManifestSettin12, _this$oManifestSettin13;
      return ((_this$oManifestSettin12 = this.oManifestSettings) === null || _this$oManifestSettin12 === void 0 ? void 0 : (_this$oManifestSettin13 = _this$oManifestSettin12.navigation) === null || _this$oManifestSettin13 === void 0 ? void 0 : _this$oManifestSettin13[navigationOrCollectionName]) || {};
    }

    /**
     * Retrieves the view level.
     *
     * @returns The current view level
     */;
    _proto.getViewLevel = function getViewLevel() {
      var _this$oManifestSettin14;
      return ((_this$oManifestSettin14 = this.oManifestSettings) === null || _this$oManifestSettin14 === void 0 ? void 0 : _this$oManifestSettin14.viewLevel) || -1;
    }

    /**
     * Retrieves the contentDensities setting of the application.
     *
     * @returns The current content density
     */;
    _proto.getContentDensities = function getContentDensities() {
      var _this$oManifestSettin15;
      return ((_this$oManifestSettin15 = this.oManifestSettings) === null || _this$oManifestSettin15 === void 0 ? void 0 : _this$oManifestSettin15.contentDensities) || {
        cozy: false,
        compact: false
      };
    }

    /**
     * Checks whether we are in FCL mode or not.
     *
     * @returns `true` if we are in FCL
     */;
    _proto.isFclEnabled = function isFclEnabled() {
      var _this$oManifestSettin16;
      return !!((_this$oManifestSettin16 = this.oManifestSettings) !== null && _this$oManifestSettin16 !== void 0 && _this$oManifestSettin16.fclEnabled);
    }

    /**
     * Checks whether the current settings (application / shell) allows us to use condensed layout.
     *
     * @returns `true` if we can use the condensed layout, false otherwise
     */;
    _proto.isCondensedLayoutCompliant = function isCondensedLayoutCompliant() {
      var _this$oManifestSettin17, _this$oManifestSettin18;
      const manifestContentDensity = ((_this$oManifestSettin17 = this.oManifestSettings) === null || _this$oManifestSettin17 === void 0 ? void 0 : _this$oManifestSettin17.contentDensities) || {
        cozy: false,
        compact: false
      };
      const shellContentDensity = ((_this$oManifestSettin18 = this.oManifestSettings) === null || _this$oManifestSettin18 === void 0 ? void 0 : _this$oManifestSettin18.shellContentDensity) || "compact";
      let isCondensedLayoutCompliant = true;
      const isSmallDevice = !system.desktop || Device.resize.width <= 320;
      if ((manifestContentDensity === null || manifestContentDensity === void 0 ? void 0 : manifestContentDensity.cozy) === true && (manifestContentDensity === null || manifestContentDensity === void 0 ? void 0 : manifestContentDensity.compact) !== true || shellContentDensity === "cozy" || isSmallDevice) {
        isCondensedLayoutCompliant = false;
      }
      return isCondensedLayoutCompliant;
    }

    /**
     * Checks whether the current settings (application / shell) uses compact mode as content density.
     *
     * @returns `true` if compact mode is set as content density, false otherwise
     */;
    _proto.isCompactType = function isCompactType() {
      var _this$oManifestSettin19;
      const manifestContentDensity = this.getContentDensities();
      const shellContentDensity = ((_this$oManifestSettin19 = this.oManifestSettings) === null || _this$oManifestSettin19 === void 0 ? void 0 : _this$oManifestSettin19.shellContentDensity) || "compact";
      return manifestContentDensity.compact !== false || shellContentDensity === "compact" ? true : false;
    }

    //region OP Specific

    /**
     * Retrieves the section layout defined in the manifest.
     *
     * @returns The type of section layout of the object page
     */;
    _proto.getSectionLayout = function getSectionLayout() {
      return this.oManifestSettings.sectionLayout;
    }

    /**
     * Retrieves the sections defined in the manifest.
     *
     * @returns A set of manifest sections indexed by an iterable key
     */;
    _proto.getSections = function getSections() {
      var _this$oManifestSettin20, _this$oManifestSettin21, _content2, _content2$body;
      return this.mergeFn({}, (_this$oManifestSettin20 = this.oManifestSettings.controlConfiguration) === null || _this$oManifestSettin20 === void 0 ? void 0 : (_this$oManifestSettin21 = _this$oManifestSettin20["@com.sap.vocabularies.UI.v1.Facets"]) === null || _this$oManifestSettin21 === void 0 ? void 0 : _this$oManifestSettin21.sections, (_content2 = this.oManifestSettings.content) === null || _content2 === void 0 ? void 0 : (_content2$body = _content2.body) === null || _content2$body === void 0 ? void 0 : _content2$body.sections);
    }

    /**
     * Returns true of the header of the application is editable and should appear in the facets.
     *
     * @returns `true` if the header if editable
     */;
    _proto.isHeaderEditable = function isHeaderEditable() {
      return this.getShowObjectPageHeader() && this.oManifestSettings.editableHeaderContent;
    }

    /**
     * Returns true if we should show the object page header.
     *
     * @returns `true` if the header should be displayed
     */;
    _proto.getShowAnchorBar = function getShowAnchorBar() {
      var _content3, _content3$header, _content4, _content4$header;
      return ((_content3 = this.oManifestSettings.content) === null || _content3 === void 0 ? void 0 : (_content3$header = _content3.header) === null || _content3$header === void 0 ? void 0 : _content3$header.anchorBarVisible) !== undefined ? !!((_content4 = this.oManifestSettings.content) !== null && _content4 !== void 0 && (_content4$header = _content4.header) !== null && _content4$header !== void 0 && _content4$header.anchorBarVisible) : true;
    }

    /**
     * Defines whether or not the section will be displayed in different tabs.
     *
     * @returns `true` if the icon tab bar should be used instead of scrolling
     */;
    _proto.useIconTabBar = function useIconTabBar() {
      return this.getShowAnchorBar() && this.oManifestSettings.sectionLayout === "Tabs";
    }

    /**
     * Returns true if the object page header is to be shown.
     *
     * @returns `true` if the object page header is to be displayed
     */;
    _proto.getShowObjectPageHeader = function getShowObjectPageHeader() {
      var _content5, _content5$header, _content6, _content6$header;
      return ((_content5 = this.oManifestSettings.content) === null || _content5 === void 0 ? void 0 : (_content5$header = _content5.header) === null || _content5$header === void 0 ? void 0 : _content5$header.visible) !== undefined ? !!((_content6 = this.oManifestSettings.content) !== null && _content6 !== void 0 && (_content6$header = _content6.header) !== null && _content6$header !== void 0 && _content6$header.visible) : true;
    }

    /**
     * Returns whether the lazy loader should be enabled for this page or not.
     *
     * @returns `true` if the lazy loader should be enabled
     */;
    _proto.getEnableLazyLoading = function getEnableLazyLoading() {
      return this.oManifestSettings.enableLazyLoading ?? false;
    }

    //endregion OP Specific

    //region LR Specific

    /**
     * Retrieves the multiple view configuration from the manifest.
     *
     * @returns The views that represent the manifest object
     */;
    _proto.getViewConfiguration = function getViewConfiguration() {
      return this.oManifestSettings.views;
    }

    /**
     * Retrieves the stickyMultiTabHeader configuration from the manifest.
     *
     * @returns Returns True if stickyMultiTabHeader is enabled or undefined
     */;
    _proto.getStickyMultiTabHeaderConfiguration = function getStickyMultiTabHeaderConfiguration() {
      const bStickyMultiTabHeader = this.oManifestSettings.stickyMultiTabHeader;
      return bStickyMultiTabHeader !== undefined ? bStickyMultiTabHeader : true;
    }

    /**
     * Retrieves the KPI configuration from the manifest.
     *
     * @returns Returns a map between KPI names and their respective configuration
     */;
    _proto.getKPIConfiguration = function getKPIConfiguration() {
      return this.oManifestSettings.keyPerformanceIndicators || {};
    }

    /**
     * Retrieves the filter configuration from the manifest.
     *
     * @returns The filter configuration from the manifest
     */;
    _proto.getFilterConfiguration = function getFilterConfiguration() {
      return this.getControlConfiguration("@com.sap.vocabularies.UI.v1.SelectionFields");
    }

    /**
     * Returns true if there are multiple entity sets to be displayed.
     *
     * @returns `true` if there are multiple entity sets
     */;
    _proto.hasMultipleEntitySets = function hasMultipleEntitySets() {
      const viewConfig = this.getViewConfiguration() || {
        paths: []
      };
      const manifestEntitySet = this.oManifestSettings.entitySet;
      return viewConfig.paths.find(path => {
        var _path;
        if ((_path = path) !== null && _path !== void 0 && _path.template) {
          return undefined;
        } else if (this.hasMultipleVisualizations(path)) {
          const {
            primary,
            secondary
          } = path;
          return primary.some(primaryPath => primaryPath.entitySet && primaryPath.entitySet !== manifestEntitySet) || secondary.some(secondaryPath => secondaryPath.entitySet && secondaryPath.entitySet !== manifestEntitySet);
        } else {
          path = path;
          return path.entitySet && path.entitySet !== manifestEntitySet;
        }
      }) !== undefined;
    }

    /**
     * Returns the context path for the template if it is specified in the manifest.
     *
     * @returns The context path for the template
     */;
    _proto.getContextPath = function getContextPath() {
      var _this$oManifestSettin22;
      return (_this$oManifestSettin22 = this.oManifestSettings) === null || _this$oManifestSettin22 === void 0 ? void 0 : _this$oManifestSettin22.contextPath;
    }

    /**
     * Returns true if there are multiple visualizations.
     *
     * @param path The path from the view
     * @returns `true` if there are multiple visualizations
     */;
    _proto.hasMultipleVisualizations = function hasMultipleVisualizations(path) {
      var _primary2, _secondary2;
      if (!path) {
        const viewConfig = this.getViewConfiguration() || {
          paths: []
        };
        return viewConfig.paths.some(viewPath => {
          var _primary, _secondary;
          return ((_primary = viewPath.primary) === null || _primary === void 0 ? void 0 : _primary.length) > 0 && ((_secondary = viewPath.secondary) === null || _secondary === void 0 ? void 0 : _secondary.length) > 0;
        });
      }
      return ((_primary2 = path.primary) === null || _primary2 === void 0 ? void 0 : _primary2.length) > 0 && ((_secondary2 = path.secondary) === null || _secondary2 === void 0 ? void 0 : _secondary2.length) > 0;
    }

    /**
     * Retrieves the entity set defined in the manifest.
     *
     * @returns The entity set defined in the manifest
     */;
    _proto.getEntitySet = function getEntitySet() {
      return this.oManifestSettings.entitySet;
    }

    //end region LR Specific
    ;
    return ManifestWrapper;
  }();
  return ManifestWrapper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJlbnN1cmVBbm5vdGF0aW9uUGF0aCIsIm9iaiIsInByb3BlcnR5IiwicHJvcGVydHlWYWx1ZSIsIkFycmF5IiwiaXNBcnJheSIsImZvckVhY2giLCJlbnRyeSIsImluY2x1ZGVzIiwiTWFuaWZlc3RXcmFwcGVyIiwib01hbmlmZXN0U2V0dGluZ3MiLCJtZXJnZUZuIiwidmlld3MiLCJwYXRocyIsInBhdGgiLCJjb250cm9sQ29uZmlndXJhdGlvbiIsIk9iamVjdCIsInZhbHVlcyIsInF1aWNrVmFyaWFudFNlbGVjdGlvbiIsInRhYmxlU2V0dGluZ3MiLCJnZXRUZW1wbGF0ZVR5cGUiLCJjb252ZXJ0ZXJUeXBlIiwiaXNGaWx0ZXJCYXJIaWRkZW4iLCJoaWRlRmlsdGVyQmFyIiwidXNlSGlkZGVuRmlsdGVyQmFyIiwiaXNEZXNrdG9wIiwiaXNQaG9uZSIsImdldEZvcm1Db250YWluZXIiLCJmYWNldFRhcmdldCIsImdldEhlYWRlckZhY2V0cyIsImZhY2V0cyIsImNvbnRlbnQiLCJoZWFkZXIiLCJnZXRIZWFkZXJBY3Rpb25zIiwiYWN0aW9ucyIsImdldEZvb3RlckFjdGlvbnMiLCJmb290ZXIiLCJnZXRWYXJpYW50TWFuYWdlbWVudCIsInZhcmlhbnRNYW5hZ2VtZW50IiwiVmFyaWFudE1hbmFnZW1lbnRUeXBlIiwiTm9uZSIsImdldERlZmF1bHRUZW1wbGF0ZUFubm90YXRpb25QYXRoIiwiZGVmYXVsdFRlbXBsYXRlQW5ub3RhdGlvblBhdGgiLCJnZXRDb250cm9sQ29uZmlndXJhdGlvbiIsInNBbm5vdGF0aW9uUGF0aCIsImdldE5hdmlnYXRpb25Db25maWd1cmF0aW9uIiwibmF2aWdhdGlvbk9yQ29sbGVjdGlvbk5hbWUiLCJuYXZpZ2F0aW9uIiwiZ2V0Vmlld0xldmVsIiwidmlld0xldmVsIiwiZ2V0Q29udGVudERlbnNpdGllcyIsImNvbnRlbnREZW5zaXRpZXMiLCJjb3p5IiwiY29tcGFjdCIsImlzRmNsRW5hYmxlZCIsImZjbEVuYWJsZWQiLCJpc0NvbmRlbnNlZExheW91dENvbXBsaWFudCIsIm1hbmlmZXN0Q29udGVudERlbnNpdHkiLCJzaGVsbENvbnRlbnREZW5zaXR5IiwiaXNTbWFsbERldmljZSIsInN5c3RlbSIsImRlc2t0b3AiLCJEZXZpY2UiLCJyZXNpemUiLCJ3aWR0aCIsImlzQ29tcGFjdFR5cGUiLCJnZXRTZWN0aW9uTGF5b3V0Iiwic2VjdGlvbkxheW91dCIsImdldFNlY3Rpb25zIiwic2VjdGlvbnMiLCJib2R5IiwiaXNIZWFkZXJFZGl0YWJsZSIsImdldFNob3dPYmplY3RQYWdlSGVhZGVyIiwiZWRpdGFibGVIZWFkZXJDb250ZW50IiwiZ2V0U2hvd0FuY2hvckJhciIsImFuY2hvckJhclZpc2libGUiLCJ1bmRlZmluZWQiLCJ1c2VJY29uVGFiQmFyIiwidmlzaWJsZSIsImdldEVuYWJsZUxhenlMb2FkaW5nIiwiZW5hYmxlTGF6eUxvYWRpbmciLCJnZXRWaWV3Q29uZmlndXJhdGlvbiIsImdldFN0aWNreU11bHRpVGFiSGVhZGVyQ29uZmlndXJhdGlvbiIsImJTdGlja3lNdWx0aVRhYkhlYWRlciIsInN0aWNreU11bHRpVGFiSGVhZGVyIiwiZ2V0S1BJQ29uZmlndXJhdGlvbiIsImtleVBlcmZvcm1hbmNlSW5kaWNhdG9ycyIsImdldEZpbHRlckNvbmZpZ3VyYXRpb24iLCJoYXNNdWx0aXBsZUVudGl0eVNldHMiLCJ2aWV3Q29uZmlnIiwibWFuaWZlc3RFbnRpdHlTZXQiLCJlbnRpdHlTZXQiLCJmaW5kIiwidGVtcGxhdGUiLCJoYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zIiwicHJpbWFyeSIsInNlY29uZGFyeSIsInNvbWUiLCJwcmltYXJ5UGF0aCIsInNlY29uZGFyeVBhdGgiLCJnZXRDb250ZXh0UGF0aCIsImNvbnRleHRQYXRoIiwidmlld1BhdGgiLCJsZW5ndGgiLCJnZXRFbnRpdHlTZXQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIk1hbmlmZXN0V3JhcHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENvbmZpZ3VyYWJsZVJlY29yZCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQ29uZmlndXJhYmxlT2JqZWN0XCI7XG5pbXBvcnQgdHlwZSB7XG5cdEJhc2VNYW5pZmVzdFNldHRpbmdzLFxuXHRDb21iaW5lZFZpZXdQYXRoQ29uZmlndXJhdGlvbixcblx0Q29udGVudERlbnNpdGllc1R5cGUsXG5cdEN1c3RvbVZpZXdUZW1wbGF0ZUNvbmZpZ3VyYXRpb24sXG5cdEZpbHRlck1hbmlmZXN0Q29uZmlndXJhdGlvbixcblx0Rm9ybU1hbmlmZXN0Q29uZmlndXJhdGlvbixcblx0S1BJQ29uZmlndXJhdGlvbixcblx0TGlzdFJlcG9ydE1hbmlmZXN0U2V0dGluZ3MsXG5cdE1hbmlmZXN0QWN0aW9uLFxuXHRNYW5pZmVzdEhlYWRlckZhY2V0LFxuXHRNYW5pZmVzdFNlY3Rpb24sXG5cdE11bHRpcGxlVmlld3NDb25maWd1cmF0aW9uLFxuXHROYXZpZ2F0aW9uU2V0dGluZ3NDb25maWd1cmF0aW9uLFxuXHRPYmplY3RQYWdlTWFuaWZlc3RTZXR0aW5ncyxcblx0U2luZ2xlVmlld1BhdGhDb25maWd1cmF0aW9uLFxuXHRUYWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbixcblx0VGVtcGxhdGVUeXBlLFxuXHRWaWV3Q29uZmlndXJhdGlvbixcblx0Vmlld1BhdGhDb25maWd1cmF0aW9uXG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB7IFZhcmlhbnRNYW5hZ2VtZW50VHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCBEZXZpY2UsIHsgc3lzdGVtIH0gZnJvbSBcInNhcC91aS9EZXZpY2VcIjtcblxuZnVuY3Rpb24gZW5zdXJlQW5ub3RhdGlvblBhdGg8VCBleHRlbmRzIHsgW2tleTogc3RyaW5nXTogYW55IH0+KG9iajogVCB8IHVuZGVmaW5lZCwgcHJvcGVydHk6IGtleW9mIFQpIHtcblx0Y29uc3QgcHJvcGVydHlWYWx1ZSA9IG9iaj8uW3Byb3BlcnR5XTtcblx0aWYgKEFycmF5LmlzQXJyYXkocHJvcGVydHlWYWx1ZSkpIHtcblx0XHRwcm9wZXJ0eVZhbHVlLmZvckVhY2goKGVudHJ5OiBhbnkpID0+IGVuc3VyZUFubm90YXRpb25QYXRoKGVudHJ5LCBcImFubm90YXRpb25QYXRoXCIpKTtcblx0fSBlbHNlIGlmIChwcm9wZXJ0eVZhbHVlICYmICFwcm9wZXJ0eVZhbHVlLmluY2x1ZGVzKFwiQFwiKSkge1xuXHRcdG9ialtwcm9wZXJ0eV0gPSAoXCJAXCIgKyBwcm9wZXJ0eVZhbHVlKSBhcyBhbnk7XG5cdH1cbn1cblxuLyoqXG4gKlxuICovXG5jbGFzcyBNYW5pZmVzdFdyYXBwZXIge1xuXHQvKipcblx0ICogQ3JlYXRlcyBhIHdyYXBwZXIgb2JqZWN0IHRvIGVuc3VyZSB0aGUgZGF0YSByZXR1cm5lZCBmcm9tIHRoZSBtYW5pZmVzdCBpcyBjb25zaXN0ZW50IGFuZCBldmVyeXRoaW5nIGlzIG1lcmdlZCBjb3JyZWN0bHkuXG5cdCAqXG5cdCAqIEBwYXJhbSBvTWFuaWZlc3RTZXR0aW5ncyBUaGUgbWFuaWZlc3Qgc2V0dGluZ3MgZm9yIHRoZSBjdXJyZW50IHBhZ2Vcblx0ICogQHBhcmFtIG1lcmdlRm4gQSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgdXNlZCB0byBwZXJmb3JtIHRoZSBtZXJnZVxuXHQgKiBAcmV0dXJucyBUaGUgbWFuaWZlc3Qgd3JhcHBlciBvYmplY3Rcblx0ICovXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgb01hbmlmZXN0U2V0dGluZ3M6IEJhc2VNYW5pZmVzdFNldHRpbmdzLCBwcml2YXRlIG1lcmdlRm46IEZ1bmN0aW9uKSB7XG5cdFx0Ly8gRW5zdXJlIHRoYXQgcHJvcGVydGllcyB3aGljaCBhcmUgbWVhbnQgdG8gY29udGFpbiBhbiAqYW5ub3RhdGlvbiogcGF0aCBjb250YWluIGEgJ0AnXG5cdFx0ZW5zdXJlQW5ub3RhdGlvblBhdGgodGhpcy5vTWFuaWZlc3RTZXR0aW5ncywgXCJkZWZhdWx0VGVtcGxhdGVBbm5vdGF0aW9uUGF0aFwiKTtcblxuXHRcdCh0aGlzLm9NYW5pZmVzdFNldHRpbmdzIGFzIExpc3RSZXBvcnRNYW5pZmVzdFNldHRpbmdzKS52aWV3cz8ucGF0aHMuZm9yRWFjaCgocGF0aCkgPT4ge1xuXHRcdFx0ZW5zdXJlQW5ub3RhdGlvblBhdGgocGF0aCBhcyBTaW5nbGVWaWV3UGF0aENvbmZpZ3VyYXRpb24sIFwiYW5ub3RhdGlvblBhdGhcIik7XG5cdFx0XHRlbnN1cmVBbm5vdGF0aW9uUGF0aChwYXRoIGFzIENvbWJpbmVkVmlld1BhdGhDb25maWd1cmF0aW9uLCBcInByaW1hcnlcIik7XG5cdFx0XHRlbnN1cmVBbm5vdGF0aW9uUGF0aChwYXRoIGFzIENvbWJpbmVkVmlld1BhdGhDb25maWd1cmF0aW9uLCBcInNlY29uZGFyeVwiKTtcblx0XHR9KTtcblxuXHRcdGlmICh0aGlzLm9NYW5pZmVzdFNldHRpbmdzLmNvbnRyb2xDb25maWd1cmF0aW9uKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGNvbnRyb2xDb25maWd1cmF0aW9uIG9mIE9iamVjdC52YWx1ZXModGhpcy5vTWFuaWZlc3RTZXR0aW5ncy5jb250cm9sQ29uZmlndXJhdGlvbikpIHtcblx0XHRcdFx0Y29uc3QgcXVpY2tWYXJpYW50U2VsZWN0aW9uID0gKGNvbnRyb2xDb25maWd1cmF0aW9uIGFzIFRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uKS50YWJsZVNldHRpbmdzPy5xdWlja1ZhcmlhbnRTZWxlY3Rpb247XG5cdFx0XHRcdGVuc3VyZUFubm90YXRpb25QYXRoKHF1aWNrVmFyaWFudFNlbGVjdGlvbiwgXCJwYXRoc1wiKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY3VycmVudCB0ZW1wbGF0ZSB0eXBlLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgdHlwZSBvZiB0aGUgY3VycmVudCB0ZW1wbGF0ZVxuXHQgKi9cblx0Z2V0VGVtcGxhdGVUeXBlKCk6IFRlbXBsYXRlVHlwZSB7XG5cdFx0cmV0dXJuIHRoaXMub01hbmlmZXN0U2V0dGluZ3MuY29udmVydGVyVHlwZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3Mgd2hldGhlciB0aGUgY3VycmVudCB0ZW1wbGF0ZSBzaG91bGQgZGlzcGxheSB0aGUgZmlsdGVyIGJhci5cblx0ICpcblx0ICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBmaWx0ZXIgYmFyIHNob3VsZCBiZSBoaWRkZW5cblx0ICovXG5cdGlzRmlsdGVyQmFySGlkZGVuKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiAhISh0aGlzLm9NYW5pZmVzdFNldHRpbmdzIGFzIExpc3RSZXBvcnRNYW5pZmVzdFNldHRpbmdzKT8uaGlkZUZpbHRlckJhcjtcblx0fVxuXG5cdHVzZUhpZGRlbkZpbHRlckJhcigpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gISEodGhpcy5vTWFuaWZlc3RTZXR0aW5ncyBhcyBMaXN0UmVwb3J0TWFuaWZlc3RTZXR0aW5ncyk/LnVzZUhpZGRlbkZpbHRlckJhcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3Mgd2hldGhlciB0aGUgY3VycmVudCBlbnZpcm9ubWVudCBpcyBhIGRlc2t0b3Agb3Igbm90LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgd2UgYXJlIG9uIGEgZGVza3RvcFxuXHQgKi9cblx0aXNEZXNrdG9wKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiAhIXRoaXMub01hbmlmZXN0U2V0dGluZ3MuaXNEZXNrdG9wO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyB3aGV0aGVyIHRoZSBjdXJyZW50IGVudmlyb25tZW50IGlzIGEgbW9iaWxlIHBob25lIG9yIG5vdC5cblx0ICpcblx0ICogQHJldHVybnMgYHRydWVgIGlmIHdlIGFyZSBvbiBhIG1vYmlsZSBwaG9uZVxuXHQgKi9cblx0aXNQaG9uZSgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gISF0aGlzLm9NYW5pZmVzdFNldHRpbmdzLmlzUGhvbmU7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBmb3JtIGNvbnRhaW5lcnMgKGZpZWxkIGdyb3VwcyBvciBpZGVudGlmaWNhdGlvbikgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3QuXG5cdCAqXG5cdCAqIEBwYXJhbSBmYWNldFRhcmdldCBUaGUgdGFyZ2V0IGFubm90YXRpb24gcGF0aCBmb3IgdGhpcyBmb3JtXG5cdCAqIEByZXR1cm5zIEEgc2V0IG9mIGZvcm0gY29udGFpbmVycyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdCBpbmRleGVkIGJ5IGFuIGl0ZXJhYmxlIGtleVxuXHQgKi9cblx0Z2V0Rm9ybUNvbnRhaW5lcihmYWNldFRhcmdldDogc3RyaW5nKTogRm9ybU1hbmlmZXN0Q29uZmlndXJhdGlvbiB7XG5cdFx0cmV0dXJuIHRoaXMub01hbmlmZXN0U2V0dGluZ3MuY29udHJvbENvbmZpZ3VyYXRpb24/LltmYWNldFRhcmdldF0gYXMgRm9ybU1hbmlmZXN0Q29uZmlndXJhdGlvbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIGhlYWRlciBmYWNldHMgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3QuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEEgc2V0IG9mIGhlYWRlciBmYWNldHMgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3QgaW5kZXhlZCBieSBhbiBpdGVyYWJsZSBrZXlcblx0ICovXG5cdGdldEhlYWRlckZhY2V0cygpOiBDb25maWd1cmFibGVSZWNvcmQ8TWFuaWZlc3RIZWFkZXJGYWNldD4ge1xuXHRcdHJldHVybiB0aGlzLm1lcmdlRm4oXG5cdFx0XHR7fSxcblx0XHRcdHRoaXMub01hbmlmZXN0U2V0dGluZ3MuY29udHJvbENvbmZpZ3VyYXRpb24/LltcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IZWFkZXJGYWNldHNcIl0/LmZhY2V0cyxcblx0XHRcdCh0aGlzLm9NYW5pZmVzdFNldHRpbmdzIGFzIE9iamVjdFBhZ2VNYW5pZmVzdFNldHRpbmdzKS5jb250ZW50Py5oZWFkZXI/LmZhY2V0c1xuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBoZWFkZXIgYWN0aW9ucyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdC5cblx0ICpcblx0ICogQHJldHVybnMgQSBzZXQgb2YgYWN0aW9ucyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdCBpbmRleGVkIGJ5IGFuIGl0ZXJhYmxlIGtleVxuXHQgKi9cblx0Z2V0SGVhZGVyQWN0aW9ucygpOiBDb25maWd1cmFibGVSZWNvcmQ8TWFuaWZlc3RBY3Rpb24+IHtcblx0XHRyZXR1cm4gdGhpcy5vTWFuaWZlc3RTZXR0aW5ncy5jb250ZW50Py5oZWFkZXI/LmFjdGlvbnMgfHwge307XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBmb290ZXIgYWN0aW9ucyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdC5cblx0ICpcblx0ICogQHJldHVybnMgQSBzZXQgb2YgYWN0aW9ucyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdCBpbmRleGVkIGJ5IGFuIGl0ZXJhYmxlIGtleVxuXHQgKi9cblx0Z2V0Rm9vdGVyQWN0aW9ucygpOiBDb25maWd1cmFibGVSZWNvcmQ8TWFuaWZlc3RBY3Rpb24+IHtcblx0XHRyZXR1cm4gdGhpcy5vTWFuaWZlc3RTZXR0aW5ncy5jb250ZW50Py5mb290ZXI/LmFjdGlvbnMgfHwge307XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSB2YXJpYW50IG1hbmFnZW1lbnQgYXMgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3QuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEEgdHlwZSBvZiB2YXJpYW50IG1hbmFnZW1lbnRcblx0ICovXG5cdGdldFZhcmlhbnRNYW5hZ2VtZW50KCk6IFZhcmlhbnRNYW5hZ2VtZW50VHlwZSB7XG5cdFx0cmV0dXJuIHRoaXMub01hbmlmZXN0U2V0dGluZ3MudmFyaWFudE1hbmFnZW1lbnQgfHwgVmFyaWFudE1hbmFnZW1lbnRUeXBlLk5vbmU7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBhbm5vdGF0aW9uIFBhdGggZm9yIHRoZSBTUFYgaW4gdGhlIG1hbmlmZXN0LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgYW5ub3RhdGlvbiBwYXRoIGZvciB0aGUgZGVmYXVsdCBTUFYgb3IgdW5kZWZpbmVkLlxuXHQgKi9cblx0Z2V0RGVmYXVsdFRlbXBsYXRlQW5ub3RhdGlvblBhdGgoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gdGhpcy5vTWFuaWZlc3RTZXR0aW5ncy5kZWZhdWx0VGVtcGxhdGVBbm5vdGF0aW9uUGF0aDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIGNvbnRyb2wgY29uZmlndXJhdGlvbiBhcyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdCBmb3IgYSBzcGVjaWZpYyBhbm5vdGF0aW9uIHBhdGguXG5cdCAqXG5cdCAqIEBwYXJhbSBzQW5ub3RhdGlvblBhdGggVGhlIHJlbGF0aXZlIGFubm90YXRpb24gcGF0aFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcmV0dXJucyBUaGUgY29udHJvbCBjb25maWd1cmF0aW9uXG5cdCAqL1xuXHRnZXRDb250cm9sQ29uZmlndXJhdGlvbihzQW5ub3RhdGlvblBhdGg6IHN0cmluZyk6IGFueSB7XG5cdFx0cmV0dXJuIHRoaXMub01hbmlmZXN0U2V0dGluZ3M/LmNvbnRyb2xDb25maWd1cmF0aW9uPy5bc0Fubm90YXRpb25QYXRoXSB8fCB7fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIGNvbmZpZ3VyZWQgc2V0dGluZ3MgZm9yIGEgZ2l2ZW4gbmF2aWdhdGlvbiB0YXJnZXQuXG5cdCAqXG5cdCAqIEBwYXJhbSBuYXZpZ2F0aW9uT3JDb2xsZWN0aW9uTmFtZSBUaGUgbmFtZSBvZiB0aGUgbmF2aWdhdGlvbiB0byBjaGVja1xuXHQgKiBAcmV0dXJucyBUaGUgbmF2aWdhdGlvbiBzZXR0aW5ncyBjb25maWd1cmF0aW9uXG5cdCAqL1xuXHRnZXROYXZpZ2F0aW9uQ29uZmlndXJhdGlvbihuYXZpZ2F0aW9uT3JDb2xsZWN0aW9uTmFtZTogc3RyaW5nKTogTmF2aWdhdGlvblNldHRpbmdzQ29uZmlndXJhdGlvbiB7XG5cdFx0cmV0dXJuIHRoaXMub01hbmlmZXN0U2V0dGluZ3M/Lm5hdmlnYXRpb24/LltuYXZpZ2F0aW9uT3JDb2xsZWN0aW9uTmFtZV0gfHwge307XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSB2aWV3IGxldmVsLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgY3VycmVudCB2aWV3IGxldmVsXG5cdCAqL1xuXHRnZXRWaWV3TGV2ZWwoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5vTWFuaWZlc3RTZXR0aW5ncz8udmlld0xldmVsIHx8IC0xO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgY29udGVudERlbnNpdGllcyBzZXR0aW5nIG9mIHRoZSBhcHBsaWNhdGlvbi5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGN1cnJlbnQgY29udGVudCBkZW5zaXR5XG5cdCAqL1xuXHRnZXRDb250ZW50RGVuc2l0aWVzKCk6IENvbnRlbnREZW5zaXRpZXNUeXBlIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0dGhpcy5vTWFuaWZlc3RTZXR0aW5ncz8uY29udGVudERlbnNpdGllcyB8fCB7XG5cdFx0XHRcdGNvenk6IGZhbHNlLFxuXHRcdFx0XHRjb21wYWN0OiBmYWxzZVxuXHRcdFx0fVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIHdoZXRoZXIgd2UgYXJlIGluIEZDTCBtb2RlIG9yIG5vdC5cblx0ICpcblx0ICogQHJldHVybnMgYHRydWVgIGlmIHdlIGFyZSBpbiBGQ0xcblx0ICovXG5cdGlzRmNsRW5hYmxlZCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gISF0aGlzLm9NYW5pZmVzdFNldHRpbmdzPy5mY2xFbmFibGVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyB3aGV0aGVyIHRoZSBjdXJyZW50IHNldHRpbmdzIChhcHBsaWNhdGlvbiAvIHNoZWxsKSBhbGxvd3MgdXMgdG8gdXNlIGNvbmRlbnNlZCBsYXlvdXQuXG5cdCAqXG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiB3ZSBjYW4gdXNlIHRoZSBjb25kZW5zZWQgbGF5b3V0LCBmYWxzZSBvdGhlcndpc2Vcblx0ICovXG5cdGlzQ29uZGVuc2VkTGF5b3V0Q29tcGxpYW50KCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IG1hbmlmZXN0Q29udGVudERlbnNpdHkgPSB0aGlzLm9NYW5pZmVzdFNldHRpbmdzPy5jb250ZW50RGVuc2l0aWVzIHx8IHtcblx0XHRcdGNvenk6IGZhbHNlLFxuXHRcdFx0Y29tcGFjdDogZmFsc2Vcblx0XHR9O1xuXHRcdGNvbnN0IHNoZWxsQ29udGVudERlbnNpdHkgPSB0aGlzLm9NYW5pZmVzdFNldHRpbmdzPy5zaGVsbENvbnRlbnREZW5zaXR5IHx8IFwiY29tcGFjdFwiO1xuXHRcdGxldCBpc0NvbmRlbnNlZExheW91dENvbXBsaWFudCA9IHRydWU7XG5cdFx0Y29uc3QgaXNTbWFsbERldmljZSA9ICFzeXN0ZW0uZGVza3RvcCB8fCBEZXZpY2UucmVzaXplLndpZHRoIDw9IDMyMDtcblx0XHRpZiAoXG5cdFx0XHQobWFuaWZlc3RDb250ZW50RGVuc2l0eT8uY296eSA9PT0gdHJ1ZSAmJiBtYW5pZmVzdENvbnRlbnREZW5zaXR5Py5jb21wYWN0ICE9PSB0cnVlKSB8fFxuXHRcdFx0c2hlbGxDb250ZW50RGVuc2l0eSA9PT0gXCJjb3p5XCIgfHxcblx0XHRcdGlzU21hbGxEZXZpY2Vcblx0XHQpIHtcblx0XHRcdGlzQ29uZGVuc2VkTGF5b3V0Q29tcGxpYW50ID0gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiBpc0NvbmRlbnNlZExheW91dENvbXBsaWFudDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3Mgd2hldGhlciB0aGUgY3VycmVudCBzZXR0aW5ncyAoYXBwbGljYXRpb24gLyBzaGVsbCkgdXNlcyBjb21wYWN0IG1vZGUgYXMgY29udGVudCBkZW5zaXR5LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgY29tcGFjdCBtb2RlIGlzIHNldCBhcyBjb250ZW50IGRlbnNpdHksIGZhbHNlIG90aGVyd2lzZVxuXHQgKi9cblx0aXNDb21wYWN0VHlwZSgpOiBib29sZWFuIHtcblx0XHRjb25zdCBtYW5pZmVzdENvbnRlbnREZW5zaXR5ID0gdGhpcy5nZXRDb250ZW50RGVuc2l0aWVzKCk7XG5cdFx0Y29uc3Qgc2hlbGxDb250ZW50RGVuc2l0eSA9IHRoaXMub01hbmlmZXN0U2V0dGluZ3M/LnNoZWxsQ29udGVudERlbnNpdHkgfHwgXCJjb21wYWN0XCI7XG5cdFx0cmV0dXJuIG1hbmlmZXN0Q29udGVudERlbnNpdHkuY29tcGFjdCAhPT0gZmFsc2UgfHwgc2hlbGxDb250ZW50RGVuc2l0eSA9PT0gXCJjb21wYWN0XCIgPyB0cnVlIDogZmFsc2U7XG5cdH1cblxuXHQvL3JlZ2lvbiBPUCBTcGVjaWZpY1xuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIHNlY3Rpb24gbGF5b3V0IGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgdHlwZSBvZiBzZWN0aW9uIGxheW91dCBvZiB0aGUgb2JqZWN0IHBhZ2Vcblx0ICovXG5cdGdldFNlY3Rpb25MYXlvdXQoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gKHRoaXMub01hbmlmZXN0U2V0dGluZ3MgYXMgT2JqZWN0UGFnZU1hbmlmZXN0U2V0dGluZ3MpLnNlY3Rpb25MYXlvdXQ7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBzZWN0aW9ucyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdC5cblx0ICpcblx0ICogQHJldHVybnMgQSBzZXQgb2YgbWFuaWZlc3Qgc2VjdGlvbnMgaW5kZXhlZCBieSBhbiBpdGVyYWJsZSBrZXlcblx0ICovXG5cdGdldFNlY3Rpb25zKCk6IENvbmZpZ3VyYWJsZVJlY29yZDxNYW5pZmVzdFNlY3Rpb24+IHtcblx0XHRyZXR1cm4gdGhpcy5tZXJnZUZuKFxuXHRcdFx0e30sXG5cdFx0XHR0aGlzLm9NYW5pZmVzdFNldHRpbmdzLmNvbnRyb2xDb25maWd1cmF0aW9uPy5bXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmFjZXRzXCJdPy5zZWN0aW9ucyxcblx0XHRcdCh0aGlzLm9NYW5pZmVzdFNldHRpbmdzIGFzIE9iamVjdFBhZ2VNYW5pZmVzdFNldHRpbmdzKS5jb250ZW50Py5ib2R5Py5zZWN0aW9uc1xuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0cnVlIG9mIHRoZSBoZWFkZXIgb2YgdGhlIGFwcGxpY2F0aW9uIGlzIGVkaXRhYmxlIGFuZCBzaG91bGQgYXBwZWFyIGluIHRoZSBmYWNldHMuXG5cdCAqXG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgaGVhZGVyIGlmIGVkaXRhYmxlXG5cdCAqL1xuXHRpc0hlYWRlckVkaXRhYmxlKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLmdldFNob3dPYmplY3RQYWdlSGVhZGVyKCkgJiYgKHRoaXMub01hbmlmZXN0U2V0dGluZ3MgYXMgT2JqZWN0UGFnZU1hbmlmZXN0U2V0dGluZ3MpLmVkaXRhYmxlSGVhZGVyQ29udGVudDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWUgaWYgd2Ugc2hvdWxkIHNob3cgdGhlIG9iamVjdCBwYWdlIGhlYWRlci5cblx0ICpcblx0ICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBoZWFkZXIgc2hvdWxkIGJlIGRpc3BsYXllZFxuXHQgKi9cblx0Z2V0U2hvd0FuY2hvckJhcigpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gKHRoaXMub01hbmlmZXN0U2V0dGluZ3MgYXMgT2JqZWN0UGFnZU1hbmlmZXN0U2V0dGluZ3MpLmNvbnRlbnQ/LmhlYWRlcj8uYW5jaG9yQmFyVmlzaWJsZSAhPT0gdW5kZWZpbmVkXG5cdFx0XHQ/ICEhKHRoaXMub01hbmlmZXN0U2V0dGluZ3MgYXMgT2JqZWN0UGFnZU1hbmlmZXN0U2V0dGluZ3MpLmNvbnRlbnQ/LmhlYWRlcj8uYW5jaG9yQmFyVmlzaWJsZVxuXHRcdFx0OiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlZmluZXMgd2hldGhlciBvciBub3QgdGhlIHNlY3Rpb24gd2lsbCBiZSBkaXNwbGF5ZWQgaW4gZGlmZmVyZW50IHRhYnMuXG5cdCAqXG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgaWNvbiB0YWIgYmFyIHNob3VsZCBiZSB1c2VkIGluc3RlYWQgb2Ygc2Nyb2xsaW5nXG5cdCAqL1xuXHR1c2VJY29uVGFiQmFyKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLmdldFNob3dBbmNob3JCYXIoKSAmJiAodGhpcy5vTWFuaWZlc3RTZXR0aW5ncyBhcyBPYmplY3RQYWdlTWFuaWZlc3RTZXR0aW5ncykuc2VjdGlvbkxheW91dCA9PT0gXCJUYWJzXCI7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0cnVlIGlmIHRoZSBvYmplY3QgcGFnZSBoZWFkZXIgaXMgdG8gYmUgc2hvd24uXG5cdCAqXG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgb2JqZWN0IHBhZ2UgaGVhZGVyIGlzIHRvIGJlIGRpc3BsYXllZFxuXHQgKi9cblx0Z2V0U2hvd09iamVjdFBhZ2VIZWFkZXIoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuICh0aGlzLm9NYW5pZmVzdFNldHRpbmdzIGFzIE9iamVjdFBhZ2VNYW5pZmVzdFNldHRpbmdzKS5jb250ZW50Py5oZWFkZXI/LnZpc2libGUgIT09IHVuZGVmaW5lZFxuXHRcdFx0PyAhISh0aGlzLm9NYW5pZmVzdFNldHRpbmdzIGFzIE9iamVjdFBhZ2VNYW5pZmVzdFNldHRpbmdzKS5jb250ZW50Py5oZWFkZXI/LnZpc2libGVcblx0XHRcdDogdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGxhenkgbG9hZGVyIHNob3VsZCBiZSBlbmFibGVkIGZvciB0aGlzIHBhZ2Ugb3Igbm90LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGxhenkgbG9hZGVyIHNob3VsZCBiZSBlbmFibGVkXG5cdCAqL1xuXHRnZXRFbmFibGVMYXp5TG9hZGluZygpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5vTWFuaWZlc3RTZXR0aW5ncy5lbmFibGVMYXp5TG9hZGluZyA/PyBmYWxzZTtcblx0fVxuXG5cdC8vZW5kcmVnaW9uIE9QIFNwZWNpZmljXG5cblx0Ly9yZWdpb24gTFIgU3BlY2lmaWNcblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBtdWx0aXBsZSB2aWV3IGNvbmZpZ3VyYXRpb24gZnJvbSB0aGUgbWFuaWZlc3QuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSB2aWV3cyB0aGF0IHJlcHJlc2VudCB0aGUgbWFuaWZlc3Qgb2JqZWN0XG5cdCAqL1xuXHRnZXRWaWV3Q29uZmlndXJhdGlvbigpOiBNdWx0aXBsZVZpZXdzQ29uZmlndXJhdGlvbiB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuICh0aGlzLm9NYW5pZmVzdFNldHRpbmdzIGFzIExpc3RSZXBvcnRNYW5pZmVzdFNldHRpbmdzKS52aWV3cztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIHN0aWNreU11bHRpVGFiSGVhZGVyIGNvbmZpZ3VyYXRpb24gZnJvbSB0aGUgbWFuaWZlc3QuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFJldHVybnMgVHJ1ZSBpZiBzdGlja3lNdWx0aVRhYkhlYWRlciBpcyBlbmFibGVkIG9yIHVuZGVmaW5lZFxuXHQgKi9cblx0Z2V0U3RpY2t5TXVsdGlUYWJIZWFkZXJDb25maWd1cmF0aW9uKCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGJTdGlja3lNdWx0aVRhYkhlYWRlciA9ICh0aGlzLm9NYW5pZmVzdFNldHRpbmdzIGFzIExpc3RSZXBvcnRNYW5pZmVzdFNldHRpbmdzKS5zdGlja3lNdWx0aVRhYkhlYWRlcjtcblx0XHRyZXR1cm4gYlN0aWNreU11bHRpVGFiSGVhZGVyICE9PSB1bmRlZmluZWQgPyBiU3RpY2t5TXVsdGlUYWJIZWFkZXIgOiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgS1BJIGNvbmZpZ3VyYXRpb24gZnJvbSB0aGUgbWFuaWZlc3QuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFJldHVybnMgYSBtYXAgYmV0d2VlbiBLUEkgbmFtZXMgYW5kIHRoZWlyIHJlc3BlY3RpdmUgY29uZmlndXJhdGlvblxuXHQgKi9cblx0Z2V0S1BJQ29uZmlndXJhdGlvbigpOiB7IFtrcGlOYW1lOiBzdHJpbmddOiBLUElDb25maWd1cmF0aW9uIH0ge1xuXHRcdHJldHVybiAodGhpcy5vTWFuaWZlc3RTZXR0aW5ncyBhcyBMaXN0UmVwb3J0TWFuaWZlc3RTZXR0aW5ncykua2V5UGVyZm9ybWFuY2VJbmRpY2F0b3JzIHx8IHt9O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgZmlsdGVyIGNvbmZpZ3VyYXRpb24gZnJvbSB0aGUgbWFuaWZlc3QuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBmaWx0ZXIgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBtYW5pZmVzdFxuXHQgKi9cblx0Z2V0RmlsdGVyQ29uZmlndXJhdGlvbigpOiBGaWx0ZXJNYW5pZmVzdENvbmZpZ3VyYXRpb24ge1xuXHRcdHJldHVybiB0aGlzLmdldENvbnRyb2xDb25maWd1cmF0aW9uKFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlNlbGVjdGlvbkZpZWxkc1wiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWUgaWYgdGhlcmUgYXJlIG11bHRpcGxlIGVudGl0eSBzZXRzIHRvIGJlIGRpc3BsYXllZC5cblx0ICpcblx0ICogQHJldHVybnMgYHRydWVgIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBlbnRpdHkgc2V0c1xuXHQgKi9cblx0aGFzTXVsdGlwbGVFbnRpdHlTZXRzKCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IHZpZXdDb25maWcgPSB0aGlzLmdldFZpZXdDb25maWd1cmF0aW9uKCkgfHwgeyBwYXRoczogW10gfTtcblx0XHRjb25zdCBtYW5pZmVzdEVudGl0eVNldCA9IHRoaXMub01hbmlmZXN0U2V0dGluZ3MuZW50aXR5U2V0O1xuXHRcdHJldHVybiAoXG5cdFx0XHR2aWV3Q29uZmlnLnBhdGhzLmZpbmQoKHBhdGg6IFZpZXdDb25maWd1cmF0aW9uKSA9PiB7XG5cdFx0XHRcdGlmICgocGF0aCBhcyBDdXN0b21WaWV3VGVtcGxhdGVDb25maWd1cmF0aW9uKT8udGVtcGxhdGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHRoaXMuaGFzTXVsdGlwbGVWaXN1YWxpemF0aW9ucyhwYXRoIGFzIENvbWJpbmVkVmlld1BhdGhDb25maWd1cmF0aW9uKSkge1xuXHRcdFx0XHRcdGNvbnN0IHsgcHJpbWFyeSwgc2Vjb25kYXJ5IH0gPSBwYXRoIGFzIENvbWJpbmVkVmlld1BhdGhDb25maWd1cmF0aW9uO1xuXHRcdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0XHRwcmltYXJ5LnNvbWUoKHByaW1hcnlQYXRoKSA9PiBwcmltYXJ5UGF0aC5lbnRpdHlTZXQgJiYgcHJpbWFyeVBhdGguZW50aXR5U2V0ICE9PSBtYW5pZmVzdEVudGl0eVNldCkgfHxcblx0XHRcdFx0XHRcdHNlY29uZGFyeS5zb21lKChzZWNvbmRhcnlQYXRoKSA9PiBzZWNvbmRhcnlQYXRoLmVudGl0eVNldCAmJiBzZWNvbmRhcnlQYXRoLmVudGl0eVNldCAhPT0gbWFuaWZlc3RFbnRpdHlTZXQpXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRwYXRoID0gcGF0aCBhcyBTaW5nbGVWaWV3UGF0aENvbmZpZ3VyYXRpb247XG5cdFx0XHRcdFx0cmV0dXJuIHBhdGguZW50aXR5U2V0ICYmIHBhdGguZW50aXR5U2V0ICE9PSBtYW5pZmVzdEVudGl0eVNldDtcblx0XHRcdFx0fVxuXHRcdFx0fSkgIT09IHVuZGVmaW5lZFxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY29udGV4dCBwYXRoIGZvciB0aGUgdGVtcGxhdGUgaWYgaXQgaXMgc3BlY2lmaWVkIGluIHRoZSBtYW5pZmVzdC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGNvbnRleHQgcGF0aCBmb3IgdGhlIHRlbXBsYXRlXG5cdCAqL1xuXHRnZXRDb250ZXh0UGF0aCgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRcdHJldHVybiB0aGlzLm9NYW5pZmVzdFNldHRpbmdzPy5jb250ZXh0UGF0aDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWUgaWYgdGhlcmUgYXJlIG11bHRpcGxlIHZpc3VhbGl6YXRpb25zLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCBmcm9tIHRoZSB2aWV3XG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgdmlzdWFsaXphdGlvbnNcblx0ICovXG5cdGhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMocGF0aD86IFZpZXdQYXRoQ29uZmlndXJhdGlvbik6IGJvb2xlYW4ge1xuXHRcdGlmICghcGF0aCkge1xuXHRcdFx0Y29uc3Qgdmlld0NvbmZpZyA9IHRoaXMuZ2V0Vmlld0NvbmZpZ3VyYXRpb24oKSB8fCB7IHBhdGhzOiBbXSB9O1xuXHRcdFx0cmV0dXJuIHZpZXdDb25maWcucGF0aHMuc29tZSgodmlld1BhdGgpID0+IHtcblx0XHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XHQodmlld1BhdGggYXMgQ29tYmluZWRWaWV3UGF0aENvbmZpZ3VyYXRpb24pLnByaW1hcnk/Lmxlbmd0aCA+IDAgJiZcblx0XHRcdFx0XHQodmlld1BhdGggYXMgQ29tYmluZWRWaWV3UGF0aENvbmZpZ3VyYXRpb24pLnNlY29uZGFyeT8ubGVuZ3RoID4gMFxuXHRcdFx0XHQpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiAocGF0aCBhcyBDb21iaW5lZFZpZXdQYXRoQ29uZmlndXJhdGlvbikucHJpbWFyeT8ubGVuZ3RoID4gMCAmJiAocGF0aCBhcyBDb21iaW5lZFZpZXdQYXRoQ29uZmlndXJhdGlvbikuc2Vjb25kYXJ5Py5sZW5ndGggPiAwO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgZW50aXR5IHNldCBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGVudGl0eSBzZXQgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3Rcblx0ICovXG5cdGdldEVudGl0eVNldCgpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLm9NYW5pZmVzdFNldHRpbmdzLmVudGl0eVNldDtcblx0fVxuXG5cdC8vZW5kIHJlZ2lvbiBMUiBTcGVjaWZpY1xufVxuXG5leHBvcnQgZGVmYXVsdCBNYW5pZmVzdFdyYXBwZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7OztFQXlCQSxTQUFTQSxvQkFBb0IsQ0FBbUNDLEdBQWtCLEVBQUVDLFFBQWlCLEVBQUU7SUFDdEcsTUFBTUMsYUFBYSxHQUFHRixHQUFHLGFBQUhBLEdBQUcsdUJBQUhBLEdBQUcsQ0FBR0MsUUFBUSxDQUFDO0lBQ3JDLElBQUlFLEtBQUssQ0FBQ0MsT0FBTyxDQUFDRixhQUFhLENBQUMsRUFBRTtNQUNqQ0EsYUFBYSxDQUFDRyxPQUFPLENBQUVDLEtBQVUsSUFBS1Asb0JBQW9CLENBQUNPLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3JGLENBQUMsTUFBTSxJQUFJSixhQUFhLElBQUksQ0FBQ0EsYUFBYSxDQUFDSyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7TUFDekRQLEdBQUcsQ0FBQ0MsUUFBUSxDQUFDLEdBQUksR0FBRyxHQUFHQyxhQUFxQjtJQUM3QztFQUNEOztFQUVBO0FBQ0E7QUFDQTtFQUZBLElBR01NLGVBQWU7SUFDcEI7QUFDRDtBQUNB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