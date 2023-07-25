/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/library", "sap/fe/macros/filter/type/MultiValue", "sap/fe/macros/filter/type/Range", "sap/fe/macros/macroLibrary", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/library", "sap/ui/core/XMLTemplateProcessor", "sap/ui/mdc/field/ConditionsType", "sap/ui/mdc/library", "sap/ui/unified/library"], function (_library, _MultiValue, _Range, _macroLibrary, Core, Fragment, _library2, _XMLTemplateProcessor, _ConditionsType, _library3, _library4) {
  "use strict";

  var _exports = {};
  /**
   * Library containing the building blocks for SAP Fiori elements.
   *
   * @namespace
   * @name sap.fe.macros
   * @public
   */
  const macrosNamespace = "sap.fe.macros";

  // library dependencies
  _exports.macrosNamespace = macrosNamespace;
  const thisLib = Core.initLibrary({
    name: "sap.fe.macros",
    dependencies: ["sap.ui.core", "sap.ui.mdc", "sap.ui.unified", "sap.fe.core"],
    types: ["sap.fe.macros.NavigationType"],
    interfaces: [],
    controls: [],
    elements: [],
    // eslint-disable-next-line no-template-curly-in-string
    version: "1.113.0",
    noLibraryCSS: true
  });
  thisLib.NavigationType = {
    /**
     * For External Navigation
     *
     * @public
     */
    External: "External",
    /**
     * For In-Page Navigation
     *
     * @public
     */
    InPage: "InPage",
    /**
     * For No Navigation
     *
     * @public
     */
    None: "None"
  };
  Fragment.registerType("CUSTOM", {
    load: Fragment.getType("XML").load,
    init: function (mSettings) {
      mSettings.containingView = {
        oController: mSettings.containingView.getController() && mSettings.containingView.getController().getExtensionAPI(mSettings.id)
      };
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      return Fragment.getType("XML").init.apply(this, [mSettings, args]);
    }
  });
  return thisLib;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtYWNyb3NOYW1lc3BhY2UiLCJ0aGlzTGliIiwiQ29yZSIsImluaXRMaWJyYXJ5IiwibmFtZSIsImRlcGVuZGVuY2llcyIsInR5cGVzIiwiaW50ZXJmYWNlcyIsImNvbnRyb2xzIiwiZWxlbWVudHMiLCJ2ZXJzaW9uIiwibm9MaWJyYXJ5Q1NTIiwiTmF2aWdhdGlvblR5cGUiLCJFeHRlcm5hbCIsIkluUGFnZSIsIk5vbmUiLCJGcmFnbWVudCIsInJlZ2lzdGVyVHlwZSIsImxvYWQiLCJnZXRUeXBlIiwiaW5pdCIsIm1TZXR0aW5ncyIsImNvbnRhaW5pbmdWaWV3Iiwib0NvbnRyb2xsZXIiLCJnZXRDb250cm9sbGVyIiwiZ2V0RXh0ZW5zaW9uQVBJIiwiaWQiLCJhcmdzIiwiYXBwbHkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbImxpYnJhcnkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFwic2FwL2ZlL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IFwic2FwL2ZlL21hY3Jvcy9maWx0ZXIvdHlwZS9NdWx0aVZhbHVlXCI7XG5pbXBvcnQgXCJzYXAvZmUvbWFjcm9zL2ZpbHRlci90eXBlL1JhbmdlXCI7XG5pbXBvcnQgXCJzYXAvZmUvbWFjcm9zL21hY3JvTGlicmFyeVwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBGcmFnbWVudCBmcm9tIFwic2FwL3VpL2NvcmUvRnJhZ21lbnRcIjtcbmltcG9ydCBcInNhcC91aS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCBcInNhcC91aS9jb3JlL1hNTFRlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgXCJzYXAvdWkvbWRjL2ZpZWxkL0NvbmRpdGlvbnNUeXBlXCI7XG5pbXBvcnQgXCJzYXAvdWkvbWRjL2xpYnJhcnlcIjtcbmltcG9ydCBcInNhcC91aS91bmlmaWVkL2xpYnJhcnlcIjtcblxuLyoqXG4gKiBMaWJyYXJ5IGNvbnRhaW5pbmcgdGhlIGJ1aWxkaW5nIGJsb2NrcyBmb3IgU0FQIEZpb3JpIGVsZW1lbnRzLlxuICpcbiAqIEBuYW1lc3BhY2VcbiAqIEBuYW1lIHNhcC5mZS5tYWNyb3NcbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IG1hY3Jvc05hbWVzcGFjZSA9IFwic2FwLmZlLm1hY3Jvc1wiO1xuXG4vLyBsaWJyYXJ5IGRlcGVuZGVuY2llc1xuY29uc3QgdGhpc0xpYiA9IENvcmUuaW5pdExpYnJhcnkoe1xuXHRuYW1lOiBcInNhcC5mZS5tYWNyb3NcIixcblx0ZGVwZW5kZW5jaWVzOiBbXCJzYXAudWkuY29yZVwiLCBcInNhcC51aS5tZGNcIiwgXCJzYXAudWkudW5pZmllZFwiLCBcInNhcC5mZS5jb3JlXCJdLFxuXHR0eXBlczogW1wic2FwLmZlLm1hY3Jvcy5OYXZpZ2F0aW9uVHlwZVwiXSxcblx0aW50ZXJmYWNlczogW10sXG5cdGNvbnRyb2xzOiBbXSxcblx0ZWxlbWVudHM6IFtdLFxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdGVtcGxhdGUtY3VybHktaW4tc3RyaW5nXG5cdHZlcnNpb246IFwiJHt2ZXJzaW9ufVwiLFxuXHRub0xpYnJhcnlDU1M6IHRydWVcbn0pIGFzIGFueTtcblxudGhpc0xpYi5OYXZpZ2F0aW9uVHlwZSA9IHtcblx0LyoqXG5cdCAqIEZvciBFeHRlcm5hbCBOYXZpZ2F0aW9uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEV4dGVybmFsOiBcIkV4dGVybmFsXCIsXG5cblx0LyoqXG5cdCAqIEZvciBJbi1QYWdlIE5hdmlnYXRpb25cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0SW5QYWdlOiBcIkluUGFnZVwiLFxuXG5cdC8qKlxuXHQgKiBGb3IgTm8gTmF2aWdhdGlvblxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHROb25lOiBcIk5vbmVcIlxufTtcblxuRnJhZ21lbnQucmVnaXN0ZXJUeXBlKFwiQ1VTVE9NXCIsIHtcblx0bG9hZDogKEZyYWdtZW50IGFzIGFueSkuZ2V0VHlwZShcIlhNTFwiKS5sb2FkLFxuXHRpbml0OiBmdW5jdGlvbiAobVNldHRpbmdzOiBhbnksIC4uLmFyZ3M6IGFueVtdKSB7XG5cdFx0bVNldHRpbmdzLmNvbnRhaW5pbmdWaWV3ID0ge1xuXHRcdFx0b0NvbnRyb2xsZXI6IG1TZXR0aW5ncy5jb250YWluaW5nVmlldy5nZXRDb250cm9sbGVyKCkgJiYgbVNldHRpbmdzLmNvbnRhaW5pbmdWaWV3LmdldENvbnRyb2xsZXIoKS5nZXRFeHRlbnNpb25BUEkobVNldHRpbmdzLmlkKVxuXHRcdH07XG5cdFx0cmV0dXJuIChGcmFnbWVudCBhcyBhbnkpLmdldFR5cGUoXCJYTUxcIikuaW5pdC5hcHBseSh0aGlzLCBbbVNldHRpbmdzLCBhcmdzXSk7XG5cdH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCB0aGlzTGliO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztFQVlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ08sTUFBTUEsZUFBZSxHQUFHLGVBQWU7O0VBRTlDO0VBQUE7RUFDQSxNQUFNQyxPQUFPLEdBQUdDLElBQUksQ0FBQ0MsV0FBVyxDQUFDO0lBQ2hDQyxJQUFJLEVBQUUsZUFBZTtJQUNyQkMsWUFBWSxFQUFFLENBQUMsYUFBYSxFQUFFLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLENBQUM7SUFDNUVDLEtBQUssRUFBRSxDQUFDLDhCQUE4QixDQUFDO0lBQ3ZDQyxVQUFVLEVBQUUsRUFBRTtJQUNkQyxRQUFRLEVBQUUsRUFBRTtJQUNaQyxRQUFRLEVBQUUsRUFBRTtJQUNaO0lBQ0FDLE9BQU8sRUFBRSxZQUFZO0lBQ3JCQyxZQUFZLEVBQUU7RUFDZixDQUFDLENBQVE7RUFFVFYsT0FBTyxDQUFDVyxjQUFjLEdBQUc7SUFDeEI7QUFDRDtBQUNBO0FBQ0E7QUFDQTtJQUNDQyxRQUFRLEVBQUUsVUFBVTtJQUVwQjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLE1BQU0sRUFBRSxRQUFRO0lBRWhCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsSUFBSSxFQUFFO0VBQ1AsQ0FBQztFQUVEQyxRQUFRLENBQUNDLFlBQVksQ0FBQyxRQUFRLEVBQUU7SUFDL0JDLElBQUksRUFBR0YsUUFBUSxDQUFTRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUNELElBQUk7SUFDM0NFLElBQUksRUFBRSxVQUFVQyxTQUFjLEVBQWtCO01BQy9DQSxTQUFTLENBQUNDLGNBQWMsR0FBRztRQUMxQkMsV0FBVyxFQUFFRixTQUFTLENBQUNDLGNBQWMsQ0FBQ0UsYUFBYSxFQUFFLElBQUlILFNBQVMsQ0FBQ0MsY0FBYyxDQUFDRSxhQUFhLEVBQUUsQ0FBQ0MsZUFBZSxDQUFDSixTQUFTLENBQUNLLEVBQUU7TUFDL0gsQ0FBQztNQUFDLGtDQUhnQ0MsSUFBSTtRQUFKQSxJQUFJO01BQUE7TUFJdEMsT0FBUVgsUUFBUSxDQUFTRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUNDLElBQUksQ0FBQ1EsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDUCxTQUFTLEVBQUVNLElBQUksQ0FBQyxDQUFDO0lBQzVFO0VBQ0QsQ0FBQyxDQUFDO0VBQUMsT0FFWTFCLE9BQU87QUFBQSJ9