/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/formatters/FPMFormatter", "sap/fe/core/formatters/StandardFormatter", "sap/fe/core/formatters/ValueFormatter", "sap/fe/core/services/AsyncComponentServiceFactory", "sap/fe/core/services/CacheHandlerServiceFactory", "sap/fe/core/services/EnvironmentServiceFactory", "sap/fe/core/services/NavigationServiceFactory", "sap/fe/core/services/ResourceModelServiceFactory", "sap/fe/core/services/RoutingServiceFactory", "sap/fe/core/services/ShellServicesFactory", "sap/fe/core/services/SideEffectsServiceFactory", "sap/fe/core/services/TemplatedViewServiceFactory", "sap/fe/core/type/DateTimeWithTimezone", "sap/fe/core/type/Email", "sap/fe/core/type/FiscalDate", "sap/fe/navigation/library", "sap/fe/placeholder/library", "sap/ui/base/DataType", "sap/ui/core/Core", "sap/ui/core/library", "sap/ui/core/service/ServiceFactoryRegistry", "sap/ui/fl/library", "sap/ui/mdc/library"], function (Log, _FPMFormatter, _StandardFormatter, _ValueFormatter, AsyncComponentServiceFactory, CacheHandlerServiceFactory, EnvironmentServiceFactory, NavigationService, ResourceModelServiceFactory, RoutingServiceFactory, ShellServicesFactory, SideEffectsServiceFactory, TemplatedViewServiceFactory, _DateTimeWithTimezone, _Email, _FiscalDate, _library, _library2, DataType, Core, _library3, ServiceFactoryRegistry, _library4, _library5) {
  "use strict";

  var _exports = {};
  /**
   * Root namespace for all the libraries related to SAP Fiori elements.
   *
   * @namespace
   * @name sap.fe
   * @public
   */
  const feNamespace = "sap.fe";
  /**
   * Library providing the core functionality of the runtime for SAP Fiori elements for OData V4.
   *
   * @namespace
   * @name sap.fe.core
   * @public
   */
  _exports.feNamespace = feNamespace;
  const feCoreNamespace = "sap.fe.core";
  /**
   * Collection of controller extensions used internally in SAP Fiori elements exposing a method that you can override to allow more flexibility.
   *
   * @namespace
   * @name sap.fe.core.controllerextensions
   * @public
   */
  _exports.feCoreNamespace = feCoreNamespace;
  const feCextNamespace = "sap.fe.controllerextensions";
  /**
   * Collection of classes provided by SAP Fiori elements for the Flexible Programming Model
   *
   * @namespace
   * @name sap.fe.core.fpm
   * @public
   */
  _exports.feCextNamespace = feCextNamespace;
  const feFpmNamespace = "sap.fe.core.fpm";
  _exports.feFpmNamespace = feFpmNamespace;
  const thisLib = Core.initLibrary({
    name: "sap.fe.core",
    dependencies: ["sap.ui.core", "sap.fe.navigation", "sap.fe.placeholder", "sap.ui.fl", "sap.ui.mdc", "sap.f"],
    types: ["sap.fe.core.CreationMode", "sap.fe.core.VariantManagement"],
    interfaces: [],
    controls: [],
    elements: [],
    // eslint-disable-next-line no-template-curly-in-string
    version: "1.113.0",
    noLibraryCSS: true,
    extensions: {
      //Configuration used for rule loading of Support Assistant
      "sap.ui.support": {
        publicRules: true,
        internalRules: true
      },
      flChangeHandlers: {
        "sap.fe.core.controls.FilterBar": "sap/ui/mdc/flexibility/FilterBar"
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  });

  /**
   * Available values for invocation grouping.
   *
   * @readonly
   * @enum {string}
   * @private
   */
  thisLib.InvocationGrouping = {
    /**
     * Isolated.
     *
     * @constant
     * @type {string}
     * @public
     */
    Isolated: "Isolated",
    /**
     * ChangeSet.
     *
     * @constant
     * @type {string}
     * @public
     */
    ChangeSet: "ChangeSet"
  };
  /**
   * Available values for creation mode.
   *
   * @readonly
   * @enum {string}
   * @private
   */
  thisLib.CreationMode = {
    /**
     * New Page.
     *
     * @constant
     * @type {string}
     * @public
     */
    NewPage: "NewPage",
    /**
     * Sync.
     *
     * @constant
     * @type {string}
     * @public
     */
    Sync: "Sync",
    /**
     * Async.
     *
     * @constant
     * @type {string}
     * @public
     */
    Async: "Async",
    /**
     * Deferred.
     *
     * @constant
     * @type {string}
     * @public
     */
    Deferred: "Deferred",
    /**
     * Inline.
     *
     * @constant
     * @type {string}
     * @public
     */
    Inline: "Inline",
    /**
     * Creation row.
     *
     * @constant
     * @type {string}
     * @public
     */
    CreationRow: "CreationRow",
    /**
     * Inline creation rows.
     *
     * @constant
     * @type {string}
     * @public
     */
    InlineCreationRows: "InlineCreationRows",
    /**
     * External (by outbound navigation).
     *
     * @constant
     * @type {string}
     * @public
     */
    External: "External"
  };
  /**
   * Available values for Variant Management.
   *
   * @readonly
   * @enum {string}
   * @private
   */
  thisLib.VariantManagement = {
    /**
     * No variant management at all.
     *
     * @constant
     * @type {string}
     * @public
     */
    None: "None",
    /**
     * One variant configuration for the whole page.
     *
     * @constant
     * @type {string}
     * @public
     */
    Page: "Page",
    /**
     * Variant management on control level.
     *
     * @constant
     * @type {string}
     * @public
     */
    Control: "Control"
  };
  /**
   * Available constants.
   *
   * @readonly
   * @enum {string}
   * @private
   */
  thisLib.Constants = {
    /*
     * Indicates cancelling of an action dialog.
     *
     * @constant
     * @type {string}
     * @public
     */
    CancelActionDialog: "cancel",
    /*
     * Indicates failure returned from backend during the execution of an action
     *
     * @constant
     * @type {string}
     * @public
     */
    ActionExecutionFailed: "actionExecutionFailed",
    /*
     * Indicates failure returned from backend during creation of a business object (via direct POST)
     *
     * @constant
     * @type {string}
     * @public
     */
    CreationFailed: "creationFailed"
  };
  /**
   * Available values for programming model.
   *
   * @readonly
   * @enum {string}
   * @private
   */
  thisLib.ProgrammingModel = {
    /*
     * Draft.
     *
     * @constant
     * @type {string}
     * @public
     */
    Draft: "Draft",
    /**
     * Sticky.
     *
     * @constant
     * @type {string}
     * @public
     */
    Sticky: "Sticky",
    /**
     * NonDraft.
     *
     * @constant
     * @type {string}
     * @public
     */
    NonDraft: "NonDraft"
  };
  /**
   * Available values for draft status.
   *
   * @readonly
   * @enum {string}
   * @private
   */
  thisLib.DraftStatus = {
    /**
     * Saving.
     *
     * @constant
     * @type {string}
     * @public
     */
    Saving: "Saving",
    /**
     * Saved.
     *
     * @constant
     * @type {string}
     * @public
     */
    Saved: "Saved",
    /**
     * Clear.
     *
     * @constant
     * @type {string}
     * @public
     */
    Clear: "Clear"
  };
  /**
   * Edit mode values.
   *
   * @readonly
   * @enum {string}
   * @private
   */
  thisLib.EditMode = {
    /**
     * View is currently displaying only.
     *
     * @constant
     * @type {string}
     * @public
     */
    Display: "Display",
    /**
     * View is currently editable.
     *
     * @constant
     * @type {string}
     * @public
     */
    Editable: "Editable"
  };
  /**
   * Template views.
   *
   * @readonly
   * @enum {string}
   * @private
   */
  thisLib.TemplateContentView = {
    /**
     * Hybrid.
     *
     * @constant
     * @type {string}
     */
    Hybrid: "Hybrid",
    /**
     * Chart.
     *
     * @constant
     * @type {string}
     */
    Chart: "Chart",
    /**
     * Table.
     *
     * @constant
     * @type {string}
     */
    Table: "Table"
  };
  /**
   * Possible initial load (first app startup) modes for a ListReport.
   *
   * @enum {string}
   * @name sap.fe.core.InitialLoadMode
   * @readonly
   * @public
   * @since 1.86.0
   */
  let InitialLoadMode;
  (function (InitialLoadMode) {
    InitialLoadMode["Enabled"] = "Enabled";
    InitialLoadMode["Disabled"] = "Disabled";
    InitialLoadMode["Auto"] = "Auto";
  })(InitialLoadMode || (InitialLoadMode = {}));
  _exports.InitialLoadMode = InitialLoadMode;
  thisLib.InitialLoadMode = InitialLoadMode;

  /**
   * Value of the startup mode
   *
   * @readonly
   * @enum {string}
   * @private
   */
  thisLib.StartupMode = {
    /**
     * App has been started normally.
     *
     * @constant
     * @type {string}
     */
    Normal: "Normal",
    /**
     * App has been started with startup keys (deeplink).
     *
     * @constant
     * @type {string}
     */
    Deeplink: "Deeplink",
    /**
     * App has been started in 'create' mode.
     *
     * @constant
     * @type {string}
     */
    Create: "Create",
    /**
     * App has been started in 'auto create' mode which means to skip any dialogs on startup
     *
     * @constant
     * @type {string}
     */
    AutoCreate: "AutoCreate"
  };
  // explicit type to handle backward compatibility with boolean values
  const InitialLoadType = DataType.createType("sap.fe.core.InitialLoadMode", {
    defaultValue: thisLib.InitialLoadMode.Auto,
    isValid: function (vValue) {
      if (typeof vValue === "boolean") {
        Log.warning("DEPRECATED: boolean value not allowed for 'initialLoad' manifest setting - supported values are: Disabled|Enabled|Auto");
      }
      return vValue === undefined || vValue === null || typeof vValue === "boolean" || thisLib.InitialLoadMode.hasOwnProperty(vValue);
    }
  });
  // normalize a value, taking care of boolean type
  InitialLoadType.setNormalizer(function (vValue) {
    if (!vValue) {
      // undefined, null or false
      return thisLib.InitialLoadMode.Disabled;
    }
    return vValue === true ? thisLib.InitialLoadMode.Enabled : vValue;
  });
  ServiceFactoryRegistry.register("sap.fe.core.services.TemplatedViewService", new TemplatedViewServiceFactory());
  ServiceFactoryRegistry.register("sap.fe.core.services.ResourceModelService", new ResourceModelServiceFactory());
  ServiceFactoryRegistry.register("sap.fe.core.services.CacheHandlerService", new CacheHandlerServiceFactory());
  ServiceFactoryRegistry.register("sap.fe.core.services.NavigationService", new NavigationService());
  ServiceFactoryRegistry.register("sap.fe.core.services.RoutingService", new RoutingServiceFactory());
  ServiceFactoryRegistry.register("sap.fe.core.services.SideEffectsService", new SideEffectsServiceFactory());
  ServiceFactoryRegistry.register("sap.fe.core.services.ShellServices", new ShellServicesFactory());
  ServiceFactoryRegistry.register("sap.fe.core.services.EnvironmentService", new EnvironmentServiceFactory());
  ServiceFactoryRegistry.register("sap.fe.core.services.AsyncComponentService", new AsyncComponentServiceFactory());
  return thisLib;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmZU5hbWVzcGFjZSIsImZlQ29yZU5hbWVzcGFjZSIsImZlQ2V4dE5hbWVzcGFjZSIsImZlRnBtTmFtZXNwYWNlIiwidGhpc0xpYiIsIkNvcmUiLCJpbml0TGlicmFyeSIsIm5hbWUiLCJkZXBlbmRlbmNpZXMiLCJ0eXBlcyIsImludGVyZmFjZXMiLCJjb250cm9scyIsImVsZW1lbnRzIiwidmVyc2lvbiIsIm5vTGlicmFyeUNTUyIsImV4dGVuc2lvbnMiLCJwdWJsaWNSdWxlcyIsImludGVybmFsUnVsZXMiLCJmbENoYW5nZUhhbmRsZXJzIiwiSW52b2NhdGlvbkdyb3VwaW5nIiwiSXNvbGF0ZWQiLCJDaGFuZ2VTZXQiLCJDcmVhdGlvbk1vZGUiLCJOZXdQYWdlIiwiU3luYyIsIkFzeW5jIiwiRGVmZXJyZWQiLCJJbmxpbmUiLCJDcmVhdGlvblJvdyIsIklubGluZUNyZWF0aW9uUm93cyIsIkV4dGVybmFsIiwiVmFyaWFudE1hbmFnZW1lbnQiLCJOb25lIiwiUGFnZSIsIkNvbnRyb2wiLCJDb25zdGFudHMiLCJDYW5jZWxBY3Rpb25EaWFsb2ciLCJBY3Rpb25FeGVjdXRpb25GYWlsZWQiLCJDcmVhdGlvbkZhaWxlZCIsIlByb2dyYW1taW5nTW9kZWwiLCJEcmFmdCIsIlN0aWNreSIsIk5vbkRyYWZ0IiwiRHJhZnRTdGF0dXMiLCJTYXZpbmciLCJTYXZlZCIsIkNsZWFyIiwiRWRpdE1vZGUiLCJEaXNwbGF5IiwiRWRpdGFibGUiLCJUZW1wbGF0ZUNvbnRlbnRWaWV3IiwiSHlicmlkIiwiQ2hhcnQiLCJUYWJsZSIsIkluaXRpYWxMb2FkTW9kZSIsIlN0YXJ0dXBNb2RlIiwiTm9ybWFsIiwiRGVlcGxpbmsiLCJDcmVhdGUiLCJBdXRvQ3JlYXRlIiwiSW5pdGlhbExvYWRUeXBlIiwiRGF0YVR5cGUiLCJjcmVhdGVUeXBlIiwiZGVmYXVsdFZhbHVlIiwiQXV0byIsImlzVmFsaWQiLCJ2VmFsdWUiLCJMb2ciLCJ3YXJuaW5nIiwidW5kZWZpbmVkIiwiaGFzT3duUHJvcGVydHkiLCJzZXROb3JtYWxpemVyIiwiRGlzYWJsZWQiLCJFbmFibGVkIiwiU2VydmljZUZhY3RvcnlSZWdpc3RyeSIsInJlZ2lzdGVyIiwiVGVtcGxhdGVkVmlld1NlcnZpY2VGYWN0b3J5IiwiUmVzb3VyY2VNb2RlbFNlcnZpY2VGYWN0b3J5IiwiQ2FjaGVIYW5kbGVyU2VydmljZUZhY3RvcnkiLCJOYXZpZ2F0aW9uU2VydmljZSIsIlJvdXRpbmdTZXJ2aWNlRmFjdG9yeSIsIlNpZGVFZmZlY3RzU2VydmljZUZhY3RvcnkiLCJTaGVsbFNlcnZpY2VzRmFjdG9yeSIsIkVudmlyb25tZW50U2VydmljZUZhY3RvcnkiLCJBc3luY0NvbXBvbmVudFNlcnZpY2VGYWN0b3J5Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJsaWJyYXJ5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IFwic2FwL2ZlL2NvcmUvZm9ybWF0dGVycy9GUE1Gb3JtYXR0ZXJcIjtcbmltcG9ydCBcInNhcC9mZS9jb3JlL2Zvcm1hdHRlcnMvU3RhbmRhcmRGb3JtYXR0ZXJcIjtcbmltcG9ydCBcInNhcC9mZS9jb3JlL2Zvcm1hdHRlcnMvVmFsdWVGb3JtYXR0ZXJcIjtcbmltcG9ydCBBc3luY0NvbXBvbmVudFNlcnZpY2VGYWN0b3J5IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9Bc3luY0NvbXBvbmVudFNlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgQ2FjaGVIYW5kbGVyU2VydmljZUZhY3RvcnkgZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL0NhY2hlSGFuZGxlclNlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgRW52aXJvbm1lbnRTZXJ2aWNlRmFjdG9yeSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvRW52aXJvbm1lbnRTZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IE5hdmlnYXRpb25TZXJ2aWNlIGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9OYXZpZ2F0aW9uU2VydmljZUZhY3RvcnlcIjtcbmltcG9ydCBSZXNvdXJjZU1vZGVsU2VydmljZUZhY3RvcnkgZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL1Jlc291cmNlTW9kZWxTZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IFJvdXRpbmdTZXJ2aWNlRmFjdG9yeSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvUm91dGluZ1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgU2hlbGxTZXJ2aWNlc0ZhY3RvcnkgZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL1NoZWxsU2VydmljZXNGYWN0b3J5XCI7XG5pbXBvcnQgU2lkZUVmZmVjdHNTZXJ2aWNlRmFjdG9yeSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvU2lkZUVmZmVjdHNTZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IFRlbXBsYXRlZFZpZXdTZXJ2aWNlRmFjdG9yeSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvVGVtcGxhdGVkVmlld1NlcnZpY2VGYWN0b3J5XCI7XG5cbmltcG9ydCBcInNhcC9mZS9jb3JlL3R5cGUvRGF0ZVRpbWVXaXRoVGltZXpvbmVcIjtcbmltcG9ydCBcInNhcC9mZS9jb3JlL3R5cGUvRW1haWxcIjtcbmltcG9ydCBcInNhcC9mZS9jb3JlL3R5cGUvRmlzY2FsRGF0ZVwiO1xuaW1wb3J0IFwic2FwL2ZlL25hdmlnYXRpb24vbGlicmFyeVwiO1xuaW1wb3J0IFwic2FwL2ZlL3BsYWNlaG9sZGVyL2xpYnJhcnlcIjtcbmltcG9ydCBEYXRhVHlwZSBmcm9tIFwic2FwL3VpL2Jhc2UvRGF0YVR5cGVcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgU2VydmljZUZhY3RvcnlSZWdpc3RyeSBmcm9tIFwic2FwL3VpL2NvcmUvc2VydmljZS9TZXJ2aWNlRmFjdG9yeVJlZ2lzdHJ5XCI7XG5pbXBvcnQgXCJzYXAvdWkvZmwvbGlicmFyeVwiO1xuaW1wb3J0IFwic2FwL3VpL21kYy9saWJyYXJ5XCI7XG5cbi8qKlxuICogUm9vdCBuYW1lc3BhY2UgZm9yIGFsbCB0aGUgbGlicmFyaWVzIHJlbGF0ZWQgdG8gU0FQIEZpb3JpIGVsZW1lbnRzLlxuICpcbiAqIEBuYW1lc3BhY2VcbiAqIEBuYW1lIHNhcC5mZVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3QgZmVOYW1lc3BhY2UgPSBcInNhcC5mZVwiO1xuLyoqXG4gKiBMaWJyYXJ5IHByb3ZpZGluZyB0aGUgY29yZSBmdW5jdGlvbmFsaXR5IG9mIHRoZSBydW50aW1lIGZvciBTQVAgRmlvcmkgZWxlbWVudHMgZm9yIE9EYXRhIFY0LlxuICpcbiAqIEBuYW1lc3BhY2VcbiAqIEBuYW1lIHNhcC5mZS5jb3JlXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBjb25zdCBmZUNvcmVOYW1lc3BhY2UgPSBcInNhcC5mZS5jb3JlXCI7XG4vKipcbiAqIENvbGxlY3Rpb24gb2YgY29udHJvbGxlciBleHRlbnNpb25zIHVzZWQgaW50ZXJuYWxseSBpbiBTQVAgRmlvcmkgZWxlbWVudHMgZXhwb3NpbmcgYSBtZXRob2QgdGhhdCB5b3UgY2FuIG92ZXJyaWRlIHRvIGFsbG93IG1vcmUgZmxleGliaWxpdHkuXG4gKlxuICogQG5hbWVzcGFjZVxuICogQG5hbWUgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnNcbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IGZlQ2V4dE5hbWVzcGFjZSA9IFwic2FwLmZlLmNvbnRyb2xsZXJleHRlbnNpb25zXCI7XG4vKipcbiAqIENvbGxlY3Rpb24gb2YgY2xhc3NlcyBwcm92aWRlZCBieSBTQVAgRmlvcmkgZWxlbWVudHMgZm9yIHRoZSBGbGV4aWJsZSBQcm9ncmFtbWluZyBNb2RlbFxuICpcbiAqIEBuYW1lc3BhY2VcbiAqIEBuYW1lIHNhcC5mZS5jb3JlLmZwbVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3QgZmVGcG1OYW1lc3BhY2UgPSBcInNhcC5mZS5jb3JlLmZwbVwiO1xuXG5jb25zdCB0aGlzTGliID0gQ29yZS5pbml0TGlicmFyeSh7XG5cdG5hbWU6IFwic2FwLmZlLmNvcmVcIixcblx0ZGVwZW5kZW5jaWVzOiBbXCJzYXAudWkuY29yZVwiLCBcInNhcC5mZS5uYXZpZ2F0aW9uXCIsIFwic2FwLmZlLnBsYWNlaG9sZGVyXCIsIFwic2FwLnVpLmZsXCIsIFwic2FwLnVpLm1kY1wiLCBcInNhcC5mXCJdLFxuXHR0eXBlczogW1wic2FwLmZlLmNvcmUuQ3JlYXRpb25Nb2RlXCIsIFwic2FwLmZlLmNvcmUuVmFyaWFudE1hbmFnZW1lbnRcIl0sXG5cdGludGVyZmFjZXM6IFtdLFxuXHRjb250cm9sczogW10sXG5cdGVsZW1lbnRzOiBbXSxcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXRlbXBsYXRlLWN1cmx5LWluLXN0cmluZ1xuXHR2ZXJzaW9uOiBcIiR7dmVyc2lvbn1cIixcblx0bm9MaWJyYXJ5Q1NTOiB0cnVlLFxuXHRleHRlbnNpb25zOiB7XG5cdFx0Ly9Db25maWd1cmF0aW9uIHVzZWQgZm9yIHJ1bGUgbG9hZGluZyBvZiBTdXBwb3J0IEFzc2lzdGFudFxuXHRcdFwic2FwLnVpLnN1cHBvcnRcIjoge1xuXHRcdFx0cHVibGljUnVsZXM6IHRydWUsXG5cdFx0XHRpbnRlcm5hbFJ1bGVzOiB0cnVlXG5cdFx0fSxcblx0XHRmbENoYW5nZUhhbmRsZXJzOiB7XG5cdFx0XHRcInNhcC5mZS5jb3JlLmNvbnRyb2xzLkZpbHRlckJhclwiOiBcInNhcC91aS9tZGMvZmxleGliaWxpdHkvRmlsdGVyQmFyXCJcblx0XHR9XG5cdH1cblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbn0pIGFzIGFueTtcblxuLyoqXG4gKiBBdmFpbGFibGUgdmFsdWVzIGZvciBpbnZvY2F0aW9uIGdyb3VwaW5nLlxuICpcbiAqIEByZWFkb25seVxuICogQGVudW0ge3N0cmluZ31cbiAqIEBwcml2YXRlXG4gKi9cbnRoaXNMaWIuSW52b2NhdGlvbkdyb3VwaW5nID0ge1xuXHQvKipcblx0ICogSXNvbGF0ZWQuXG5cdCAqXG5cdCAqIEBjb25zdGFudFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRJc29sYXRlZDogXCJJc29sYXRlZFwiLFxuXHQvKipcblx0ICogQ2hhbmdlU2V0LlxuXHQgKlxuXHQgKiBAY29uc3RhbnRcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0Q2hhbmdlU2V0OiBcIkNoYW5nZVNldFwiXG59O1xuLyoqXG4gKiBBdmFpbGFibGUgdmFsdWVzIGZvciBjcmVhdGlvbiBtb2RlLlxuICpcbiAqIEByZWFkb25seVxuICogQGVudW0ge3N0cmluZ31cbiAqIEBwcml2YXRlXG4gKi9cbnRoaXNMaWIuQ3JlYXRpb25Nb2RlID0ge1xuXHQvKipcblx0ICogTmV3IFBhZ2UuXG5cdCAqXG5cdCAqIEBjb25zdGFudFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHROZXdQYWdlOiBcIk5ld1BhZ2VcIixcblx0LyoqXG5cdCAqIFN5bmMuXG5cdCAqXG5cdCAqIEBjb25zdGFudFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRTeW5jOiBcIlN5bmNcIixcblx0LyoqXG5cdCAqIEFzeW5jLlxuXHQgKlxuXHQgKiBAY29uc3RhbnRcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QXN5bmM6IFwiQXN5bmNcIixcblx0LyoqXG5cdCAqIERlZmVycmVkLlxuXHQgKlxuXHQgKiBAY29uc3RhbnRcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0RGVmZXJyZWQ6IFwiRGVmZXJyZWRcIixcblx0LyoqXG5cdCAqIElubGluZS5cblx0ICpcblx0ICogQGNvbnN0YW50XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdElubGluZTogXCJJbmxpbmVcIixcblx0LyoqXG5cdCAqIENyZWF0aW9uIHJvdy5cblx0ICpcblx0ICogQGNvbnN0YW50XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdENyZWF0aW9uUm93OiBcIkNyZWF0aW9uUm93XCIsXG5cdC8qKlxuXHQgKiBJbmxpbmUgY3JlYXRpb24gcm93cy5cblx0ICpcblx0ICogQGNvbnN0YW50XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdElubGluZUNyZWF0aW9uUm93czogXCJJbmxpbmVDcmVhdGlvblJvd3NcIixcblx0LyoqXG5cdCAqIEV4dGVybmFsIChieSBvdXRib3VuZCBuYXZpZ2F0aW9uKS5cblx0ICpcblx0ICogQGNvbnN0YW50XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEV4dGVybmFsOiBcIkV4dGVybmFsXCJcbn07XG4vKipcbiAqIEF2YWlsYWJsZSB2YWx1ZXMgZm9yIFZhcmlhbnQgTWFuYWdlbWVudC5cbiAqXG4gKiBAcmVhZG9ubHlcbiAqIEBlbnVtIHtzdHJpbmd9XG4gKiBAcHJpdmF0ZVxuICovXG50aGlzTGliLlZhcmlhbnRNYW5hZ2VtZW50ID0ge1xuXHQvKipcblx0ICogTm8gdmFyaWFudCBtYW5hZ2VtZW50IGF0IGFsbC5cblx0ICpcblx0ICogQGNvbnN0YW50XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdE5vbmU6IFwiTm9uZVwiLFxuXG5cdC8qKlxuXHQgKiBPbmUgdmFyaWFudCBjb25maWd1cmF0aW9uIGZvciB0aGUgd2hvbGUgcGFnZS5cblx0ICpcblx0ICogQGNvbnN0YW50XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdFBhZ2U6IFwiUGFnZVwiLFxuXG5cdC8qKlxuXHQgKiBWYXJpYW50IG1hbmFnZW1lbnQgb24gY29udHJvbCBsZXZlbC5cblx0ICpcblx0ICogQGNvbnN0YW50XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdENvbnRyb2w6IFwiQ29udHJvbFwiXG59O1xuLyoqXG4gKiBBdmFpbGFibGUgY29uc3RhbnRzLlxuICpcbiAqIEByZWFkb25seVxuICogQGVudW0ge3N0cmluZ31cbiAqIEBwcml2YXRlXG4gKi9cbnRoaXNMaWIuQ29uc3RhbnRzID0ge1xuXHQvKlxuXHQgKiBJbmRpY2F0ZXMgY2FuY2VsbGluZyBvZiBhbiBhY3Rpb24gZGlhbG9nLlxuXHQgKlxuXHQgKiBAY29uc3RhbnRcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0Q2FuY2VsQWN0aW9uRGlhbG9nOiBcImNhbmNlbFwiLFxuXHQvKlxuXHQgKiBJbmRpY2F0ZXMgZmFpbHVyZSByZXR1cm5lZCBmcm9tIGJhY2tlbmQgZHVyaW5nIHRoZSBleGVjdXRpb24gb2YgYW4gYWN0aW9uXG5cdCAqXG5cdCAqIEBjb25zdGFudFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRBY3Rpb25FeGVjdXRpb25GYWlsZWQ6IFwiYWN0aW9uRXhlY3V0aW9uRmFpbGVkXCIsXG5cdC8qXG5cdCAqIEluZGljYXRlcyBmYWlsdXJlIHJldHVybmVkIGZyb20gYmFja2VuZCBkdXJpbmcgY3JlYXRpb24gb2YgYSBidXNpbmVzcyBvYmplY3QgKHZpYSBkaXJlY3QgUE9TVClcblx0ICpcblx0ICogQGNvbnN0YW50XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdENyZWF0aW9uRmFpbGVkOiBcImNyZWF0aW9uRmFpbGVkXCJcbn07XG4vKipcbiAqIEF2YWlsYWJsZSB2YWx1ZXMgZm9yIHByb2dyYW1taW5nIG1vZGVsLlxuICpcbiAqIEByZWFkb25seVxuICogQGVudW0ge3N0cmluZ31cbiAqIEBwcml2YXRlXG4gKi9cbnRoaXNMaWIuUHJvZ3JhbW1pbmdNb2RlbCA9IHtcblx0Lypcblx0ICogRHJhZnQuXG5cdCAqXG5cdCAqIEBjb25zdGFudFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHREcmFmdDogXCJEcmFmdFwiLFxuXHQvKipcblx0ICogU3RpY2t5LlxuXHQgKlxuXHQgKiBAY29uc3RhbnRcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0U3RpY2t5OiBcIlN0aWNreVwiLFxuXHQvKipcblx0ICogTm9uRHJhZnQuXG5cdCAqXG5cdCAqIEBjb25zdGFudFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHROb25EcmFmdDogXCJOb25EcmFmdFwiXG59O1xuLyoqXG4gKiBBdmFpbGFibGUgdmFsdWVzIGZvciBkcmFmdCBzdGF0dXMuXG4gKlxuICogQHJlYWRvbmx5XG4gKiBAZW51bSB7c3RyaW5nfVxuICogQHByaXZhdGVcbiAqL1xudGhpc0xpYi5EcmFmdFN0YXR1cyA9IHtcblx0LyoqXG5cdCAqIFNhdmluZy5cblx0ICpcblx0ICogQGNvbnN0YW50XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdFNhdmluZzogXCJTYXZpbmdcIixcblx0LyoqXG5cdCAqIFNhdmVkLlxuXHQgKlxuXHQgKiBAY29uc3RhbnRcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0U2F2ZWQ6IFwiU2F2ZWRcIixcblx0LyoqXG5cdCAqIENsZWFyLlxuXHQgKlxuXHQgKiBAY29uc3RhbnRcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0Q2xlYXI6IFwiQ2xlYXJcIlxufTtcbi8qKlxuICogRWRpdCBtb2RlIHZhbHVlcy5cbiAqXG4gKiBAcmVhZG9ubHlcbiAqIEBlbnVtIHtzdHJpbmd9XG4gKiBAcHJpdmF0ZVxuICovXG50aGlzTGliLkVkaXRNb2RlID0ge1xuXHQvKipcblx0ICogVmlldyBpcyBjdXJyZW50bHkgZGlzcGxheWluZyBvbmx5LlxuXHQgKlxuXHQgKiBAY29uc3RhbnRcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0RGlzcGxheTogXCJEaXNwbGF5XCIsXG5cdC8qKlxuXHQgKiBWaWV3IGlzIGN1cnJlbnRseSBlZGl0YWJsZS5cblx0ICpcblx0ICogQGNvbnN0YW50XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEVkaXRhYmxlOiBcIkVkaXRhYmxlXCJcbn07XG4vKipcbiAqIFRlbXBsYXRlIHZpZXdzLlxuICpcbiAqIEByZWFkb25seVxuICogQGVudW0ge3N0cmluZ31cbiAqIEBwcml2YXRlXG4gKi9cbnRoaXNMaWIuVGVtcGxhdGVDb250ZW50VmlldyA9IHtcblx0LyoqXG5cdCAqIEh5YnJpZC5cblx0ICpcblx0ICogQGNvbnN0YW50XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqL1xuXHRIeWJyaWQ6IFwiSHlicmlkXCIsXG5cdC8qKlxuXHQgKiBDaGFydC5cblx0ICpcblx0ICogQGNvbnN0YW50XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqL1xuXHRDaGFydDogXCJDaGFydFwiLFxuXHQvKipcblx0ICogVGFibGUuXG5cdCAqXG5cdCAqIEBjb25zdGFudFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKi9cblx0VGFibGU6IFwiVGFibGVcIlxufTtcbi8qKlxuICogUG9zc2libGUgaW5pdGlhbCBsb2FkIChmaXJzdCBhcHAgc3RhcnR1cCkgbW9kZXMgZm9yIGEgTGlzdFJlcG9ydC5cbiAqXG4gKiBAZW51bSB7c3RyaW5nfVxuICogQG5hbWUgc2FwLmZlLmNvcmUuSW5pdGlhbExvYWRNb2RlXG4gKiBAcmVhZG9ubHlcbiAqIEBwdWJsaWNcbiAqIEBzaW5jZSAxLjg2LjBcbiAqL1xuZXhwb3J0IGVudW0gSW5pdGlhbExvYWRNb2RlIHtcblx0LyoqXG5cdCAqIERhdGEgd2lsbCBiZSBsb2FkZWQgaW5pdGlhbGx5LlxuXHQgKlxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5Jbml0aWFsTG9hZE1vZGUuRW5hYmxlZFxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRFbmFibGVkID0gXCJFbmFibGVkXCIsXG5cblx0LyoqXG5cdCAqIERhdGEgd2lsbCBub3QgYmUgbG9hZGVkIGluaXRpYWxseS5cblx0ICpcblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuSW5pdGlhbExvYWRNb2RlLkRpc2FibGVkXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdERpc2FibGVkID0gXCJEaXNhYmxlZFwiLFxuXG5cdC8qKlxuXHQgKiBEYXRhIHdpbGwgYmUgbG9hZGVkIGluaXRpYWxseSBpZiBmaWx0ZXJzIGFyZSBzZXQuXG5cdCAqXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLkluaXRpYWxMb2FkTW9kZS5BdXRvXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEF1dG8gPSBcIkF1dG9cIlxufVxudGhpc0xpYi5Jbml0aWFsTG9hZE1vZGUgPSBJbml0aWFsTG9hZE1vZGU7XG5cbi8qKlxuICogVmFsdWUgb2YgdGhlIHN0YXJ0dXAgbW9kZVxuICpcbiAqIEByZWFkb25seVxuICogQGVudW0ge3N0cmluZ31cbiAqIEBwcml2YXRlXG4gKi9cbnRoaXNMaWIuU3RhcnR1cE1vZGUgPSB7XG5cdC8qKlxuXHQgKiBBcHAgaGFzIGJlZW4gc3RhcnRlZCBub3JtYWxseS5cblx0ICpcblx0ICogQGNvbnN0YW50XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqL1xuXHROb3JtYWw6IFwiTm9ybWFsXCIsXG5cdC8qKlxuXHQgKiBBcHAgaGFzIGJlZW4gc3RhcnRlZCB3aXRoIHN0YXJ0dXAga2V5cyAoZGVlcGxpbmspLlxuXHQgKlxuXHQgKiBAY29uc3RhbnRcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICovXG5cdERlZXBsaW5rOiBcIkRlZXBsaW5rXCIsXG5cdC8qKlxuXHQgKiBBcHAgaGFzIGJlZW4gc3RhcnRlZCBpbiAnY3JlYXRlJyBtb2RlLlxuXHQgKlxuXHQgKiBAY29uc3RhbnRcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICovXG5cdENyZWF0ZTogXCJDcmVhdGVcIixcblx0LyoqXG5cdCAqIEFwcCBoYXMgYmVlbiBzdGFydGVkIGluICdhdXRvIGNyZWF0ZScgbW9kZSB3aGljaCBtZWFucyB0byBza2lwIGFueSBkaWFsb2dzIG9uIHN0YXJ0dXBcblx0ICpcblx0ICogQGNvbnN0YW50XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqL1xuXHRBdXRvQ3JlYXRlOiBcIkF1dG9DcmVhdGVcIlxufTtcbi8vIGV4cGxpY2l0IHR5cGUgdG8gaGFuZGxlIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkgd2l0aCBib29sZWFuIHZhbHVlc1xuY29uc3QgSW5pdGlhbExvYWRUeXBlID0gRGF0YVR5cGUuY3JlYXRlVHlwZShcInNhcC5mZS5jb3JlLkluaXRpYWxMb2FkTW9kZVwiLCB7XG5cdGRlZmF1bHRWYWx1ZTogdGhpc0xpYi5Jbml0aWFsTG9hZE1vZGUuQXV0byxcblx0aXNWYWxpZDogZnVuY3Rpb24gKHZWYWx1ZTogc3RyaW5nIHwgYm9vbGVhbiB8IHVuZGVmaW5lZCkge1xuXHRcdGlmICh0eXBlb2YgdlZhbHVlID09PSBcImJvb2xlYW5cIikge1xuXHRcdFx0TG9nLndhcm5pbmcoXG5cdFx0XHRcdFwiREVQUkVDQVRFRDogYm9vbGVhbiB2YWx1ZSBub3QgYWxsb3dlZCBmb3IgJ2luaXRpYWxMb2FkJyBtYW5pZmVzdCBzZXR0aW5nIC0gc3VwcG9ydGVkIHZhbHVlcyBhcmU6IERpc2FibGVkfEVuYWJsZWR8QXV0b1wiXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gdlZhbHVlID09PSB1bmRlZmluZWQgfHwgdlZhbHVlID09PSBudWxsIHx8IHR5cGVvZiB2VmFsdWUgPT09IFwiYm9vbGVhblwiIHx8IHRoaXNMaWIuSW5pdGlhbExvYWRNb2RlLmhhc093blByb3BlcnR5KHZWYWx1ZSk7XG5cdH1cbn0pO1xuLy8gbm9ybWFsaXplIGEgdmFsdWUsIHRha2luZyBjYXJlIG9mIGJvb2xlYW4gdHlwZVxuSW5pdGlhbExvYWRUeXBlLnNldE5vcm1hbGl6ZXIoZnVuY3Rpb24gKHZWYWx1ZTogc3RyaW5nIHwgYm9vbGVhbiB8IHVuZGVmaW5lZCkge1xuXHRpZiAoIXZWYWx1ZSkge1xuXHRcdC8vIHVuZGVmaW5lZCwgbnVsbCBvciBmYWxzZVxuXHRcdHJldHVybiB0aGlzTGliLkluaXRpYWxMb2FkTW9kZS5EaXNhYmxlZDtcblx0fVxuXHRyZXR1cm4gdlZhbHVlID09PSB0cnVlID8gdGhpc0xpYi5Jbml0aWFsTG9hZE1vZGUuRW5hYmxlZCA6IHZWYWx1ZTtcbn0pO1xuU2VydmljZUZhY3RvcnlSZWdpc3RyeS5yZWdpc3RlcihcInNhcC5mZS5jb3JlLnNlcnZpY2VzLlRlbXBsYXRlZFZpZXdTZXJ2aWNlXCIsIG5ldyBUZW1wbGF0ZWRWaWV3U2VydmljZUZhY3RvcnkoKSk7XG5TZXJ2aWNlRmFjdG9yeVJlZ2lzdHJ5LnJlZ2lzdGVyKFwic2FwLmZlLmNvcmUuc2VydmljZXMuUmVzb3VyY2VNb2RlbFNlcnZpY2VcIiwgbmV3IFJlc291cmNlTW9kZWxTZXJ2aWNlRmFjdG9yeSgpKTtcblNlcnZpY2VGYWN0b3J5UmVnaXN0cnkucmVnaXN0ZXIoXCJzYXAuZmUuY29yZS5zZXJ2aWNlcy5DYWNoZUhhbmRsZXJTZXJ2aWNlXCIsIG5ldyBDYWNoZUhhbmRsZXJTZXJ2aWNlRmFjdG9yeSgpKTtcblNlcnZpY2VGYWN0b3J5UmVnaXN0cnkucmVnaXN0ZXIoXCJzYXAuZmUuY29yZS5zZXJ2aWNlcy5OYXZpZ2F0aW9uU2VydmljZVwiLCBuZXcgTmF2aWdhdGlvblNlcnZpY2UoKSk7XG5TZXJ2aWNlRmFjdG9yeVJlZ2lzdHJ5LnJlZ2lzdGVyKFwic2FwLmZlLmNvcmUuc2VydmljZXMuUm91dGluZ1NlcnZpY2VcIiwgbmV3IFJvdXRpbmdTZXJ2aWNlRmFjdG9yeSgpKTtcblNlcnZpY2VGYWN0b3J5UmVnaXN0cnkucmVnaXN0ZXIoXCJzYXAuZmUuY29yZS5zZXJ2aWNlcy5TaWRlRWZmZWN0c1NlcnZpY2VcIiwgbmV3IFNpZGVFZmZlY3RzU2VydmljZUZhY3RvcnkoKSk7XG5TZXJ2aWNlRmFjdG9yeVJlZ2lzdHJ5LnJlZ2lzdGVyKFwic2FwLmZlLmNvcmUuc2VydmljZXMuU2hlbGxTZXJ2aWNlc1wiLCBuZXcgU2hlbGxTZXJ2aWNlc0ZhY3RvcnkoKSk7XG5TZXJ2aWNlRmFjdG9yeVJlZ2lzdHJ5LnJlZ2lzdGVyKFwic2FwLmZlLmNvcmUuc2VydmljZXMuRW52aXJvbm1lbnRTZXJ2aWNlXCIsIG5ldyBFbnZpcm9ubWVudFNlcnZpY2VGYWN0b3J5KCkpO1xuU2VydmljZUZhY3RvcnlSZWdpc3RyeS5yZWdpc3RlcihcInNhcC5mZS5jb3JlLnNlcnZpY2VzLkFzeW5jQ29tcG9uZW50U2VydmljZVwiLCBuZXcgQXN5bmNDb21wb25lbnRTZXJ2aWNlRmFjdG9yeSgpKTtcblxuZXhwb3J0IHR5cGUgQ29yZUxpYiA9IHtcblx0SW52b2NhdGlvbkdyb3VwaW5nOiB7XG5cdFx0Q2hhbmdlU2V0OiBcIkNoYW5nZVNldFwiO1xuXHRcdElzb2xhdGVkOiBcIklzb2xhdGVkXCI7XG5cdH07XG59O1xuZXhwb3J0IGRlZmF1bHQgdGhpc0xpYjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7RUEwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxNQUFNQSxXQUFXLEdBQUcsUUFBUTtFQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQU5BO0VBT08sTUFBTUMsZUFBZSxHQUFHLGFBQWE7RUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFOQTtFQU9PLE1BQU1DLGVBQWUsR0FBRyw2QkFBNkI7RUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFOQTtFQU9PLE1BQU1DLGNBQWMsR0FBRyxpQkFBaUI7RUFBQztFQUVoRCxNQUFNQyxPQUFPLEdBQUdDLElBQUks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