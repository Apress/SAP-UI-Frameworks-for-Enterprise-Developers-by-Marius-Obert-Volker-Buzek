/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Core"], function (Core) {
  "use strict";

  const labelFormat = function (kpiTitle) {
    if (kpiTitle) {
      // Split the title in words
      const titleParts = kpiTitle.split(" ");
      let kpiLabel;
      if (titleParts.length === 1) {
        // Only 1 word --> first 3 capitalized letters of the word
        kpiLabel = titleParts[0].substring(0, 3).toUpperCase();
      } else if (titleParts.length === 2) {
        // 2 words --> first capitalized letters of these two words
        kpiLabel = (titleParts[0].substring(0, 1) + titleParts[1].substring(0, 1)).toUpperCase();
      } else {
        // 3 words or more --> first capitalized letters of the first 3 words
        kpiLabel = (titleParts[0].substring(0, 1) + titleParts[1].substring(0, 1) + titleParts[2].substring(0, 1)).toUpperCase();
      }
      return kpiLabel;
    } else {
      // No KPI title --> no label
      return "";
    }
  };
  labelFormat.__functionName = "sap.fe.core.formatters.KPIFormatter#labelFormat";

  /**
   * KPI tooltip formatting.
   *
   * @param kpiTitle KPI title
   * @param kpiValue KPI value
   * @param kpiUnit KPI unit or currency (can be undefined)
   * @param kpiStatus KPI status
   * @param hasUnit Is "true" if the KPI value has a unit or a currency
   * @returns Returns the text for the KPI tooltip.
   */
  const tooltipFormat = function (kpiTitle, kpiValue, kpiUnit, kpiStatus, hasUnit) {
    const resBundle = Core.getLibraryResourceBundle("sap.fe.core");
    const msgKey = kpiStatus ? `C_KPI_TOOLTIP_${kpiStatus.toUpperCase()}` : "C_KPI_TOOLTIP_NONE";
    let amountWithUnit;
    if (hasUnit === "true") {
      if (!kpiUnit) {
        // No unit means multi-unit situation
        amountWithUnit = resBundle.getText("C_KPI_TOOLTIP_AMOUNT_MULTIUNIT");
      } else {
        amountWithUnit = `${kpiValue} ${kpiUnit}`;
      }
    } else {
      amountWithUnit = kpiValue;
    }
    return resBundle.getText(msgKey, [kpiTitle, amountWithUnit]);
  };
  tooltipFormat.__functionName = "sap.fe.core.formatters.KPIFormatter#tooltipFormat";

  // See https://www.typescriptlang.org/docs/handbook/functions.html#this-parameters for more detail on this weird syntax
  /**
   * Collection of table formatters.
   *
   * @param this The context
   * @param sName The inner function name
   * @param oArgs The inner function parameters
   * @returns The value from the inner function
   */
  const kpiFormatters = function (sName) {
    if (kpiFormatters.hasOwnProperty(sName)) {
      for (var _len = arguments.length, oArgs = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        oArgs[_key - 1] = arguments[_key];
      }
      return kpiFormatters[sName].apply(this, oArgs);
    } else {
      return "";
    }
  };
  kpiFormatters.labelFormat = labelFormat;
  kpiFormatters.tooltipFormat = tooltipFormat;

  /**
   * @global
   */
  return kpiFormatters;
}, true);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJsYWJlbEZvcm1hdCIsImtwaVRpdGxlIiwidGl0bGVQYXJ0cyIsInNwbGl0Iiwia3BpTGFiZWwiLCJsZW5ndGgiLCJzdWJzdHJpbmciLCJ0b1VwcGVyQ2FzZSIsIl9fZnVuY3Rpb25OYW1lIiwidG9vbHRpcEZvcm1hdCIsImtwaVZhbHVlIiwia3BpVW5pdCIsImtwaVN0YXR1cyIsImhhc1VuaXQiLCJyZXNCdW5kbGUiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwibXNnS2V5IiwiYW1vdW50V2l0aFVuaXQiLCJnZXRUZXh0Iiwia3BpRm9ybWF0dGVycyIsInNOYW1lIiwiaGFzT3duUHJvcGVydHkiLCJvQXJncyIsImFwcGx5Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJLUElGb3JtYXR0ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBLUEkgbGFiZWwgZm9ybWF0dGluZy5cbiAqIFRoZSBLUEkgbGFiZWwgaXMgYW4gYWJicmV2aWF0aW9uIG9mIHRoZSBjb21wbGV0ZSBnbG9iYWwgS1BJIHRpdGxlLiBJdCBpcyBmb3JtZWQgdXNpbmcgdGhlIGZpcnN0IHRocmVlIGxldHRlcnMgb2YgdGhlIGZpcnN0IHRocmVlIHdvcmRzIG9mIHRoZSBLUEkgdGl0bGUuXG4gKiBJZiB0aGVyZSBpcyBvbmx5IG9uZSB3b3JkIGluIHRoZSBnbG9iYWwgS1BJIHRpdGxlLCB0aGUgZmlyc3QgdGhyZWUgbGV0dGVycyBvZiB0aGUgd29yZCBhcmUgZGlzcGxheWVkLlxuICogSWYgdGhlIEtQSSB0aXRsZSBoYXMgb25seSB0d28gd29yZHMsIG9ubHkgdGhlIGZpcnN0IGxldHRlcnMgb2YgdGhlc2UgdHdvIHdvcmRzIGFyZSBkaXNwbGF5ZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGtwaVRpdGxlIEtQSSB0aXRsZSB2YWx1ZVxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCBjcml0aWNhbGl0eVxuICovXG5cbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5cbmNvbnN0IGxhYmVsRm9ybWF0ID0gZnVuY3Rpb24gKGtwaVRpdGxlOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRpZiAoa3BpVGl0bGUpIHtcblx0XHQvLyBTcGxpdCB0aGUgdGl0bGUgaW4gd29yZHNcblx0XHRjb25zdCB0aXRsZVBhcnRzID0ga3BpVGl0bGUuc3BsaXQoXCIgXCIpO1xuXG5cdFx0bGV0IGtwaUxhYmVsOiBzdHJpbmc7XG5cdFx0aWYgKHRpdGxlUGFydHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHQvLyBPbmx5IDEgd29yZCAtLT4gZmlyc3QgMyBjYXBpdGFsaXplZCBsZXR0ZXJzIG9mIHRoZSB3b3JkXG5cdFx0XHRrcGlMYWJlbCA9IHRpdGxlUGFydHNbMF0uc3Vic3RyaW5nKDAsIDMpLnRvVXBwZXJDYXNlKCk7XG5cdFx0fSBlbHNlIGlmICh0aXRsZVBhcnRzLmxlbmd0aCA9PT0gMikge1xuXHRcdFx0Ly8gMiB3b3JkcyAtLT4gZmlyc3QgY2FwaXRhbGl6ZWQgbGV0dGVycyBvZiB0aGVzZSB0d28gd29yZHNcblx0XHRcdGtwaUxhYmVsID0gKHRpdGxlUGFydHNbMF0uc3Vic3RyaW5nKDAsIDEpICsgdGl0bGVQYXJ0c1sxXS5zdWJzdHJpbmcoMCwgMSkpLnRvVXBwZXJDYXNlKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIDMgd29yZHMgb3IgbW9yZSAtLT4gZmlyc3QgY2FwaXRhbGl6ZWQgbGV0dGVycyBvZiB0aGUgZmlyc3QgMyB3b3Jkc1xuXHRcdFx0a3BpTGFiZWwgPSAodGl0bGVQYXJ0c1swXS5zdWJzdHJpbmcoMCwgMSkgKyB0aXRsZVBhcnRzWzFdLnN1YnN0cmluZygwLCAxKSArIHRpdGxlUGFydHNbMl0uc3Vic3RyaW5nKDAsIDEpKS50b1VwcGVyQ2FzZSgpO1xuXHRcdH1cblxuXHRcdHJldHVybiBrcGlMYWJlbDtcblx0fSBlbHNlIHtcblx0XHQvLyBObyBLUEkgdGl0bGUgLS0+IG5vIGxhYmVsXG5cdFx0cmV0dXJuIFwiXCI7XG5cdH1cbn07XG5sYWJlbEZvcm1hdC5fX2Z1bmN0aW9uTmFtZSA9IFwic2FwLmZlLmNvcmUuZm9ybWF0dGVycy5LUElGb3JtYXR0ZXIjbGFiZWxGb3JtYXRcIjtcblxuLyoqXG4gKiBLUEkgdG9vbHRpcCBmb3JtYXR0aW5nLlxuICpcbiAqIEBwYXJhbSBrcGlUaXRsZSBLUEkgdGl0bGVcbiAqIEBwYXJhbSBrcGlWYWx1ZSBLUEkgdmFsdWVcbiAqIEBwYXJhbSBrcGlVbml0IEtQSSB1bml0IG9yIGN1cnJlbmN5IChjYW4gYmUgdW5kZWZpbmVkKVxuICogQHBhcmFtIGtwaVN0YXR1cyBLUEkgc3RhdHVzXG4gKiBAcGFyYW0gaGFzVW5pdCBJcyBcInRydWVcIiBpZiB0aGUgS1BJIHZhbHVlIGhhcyBhIHVuaXQgb3IgYSBjdXJyZW5jeVxuICogQHJldHVybnMgUmV0dXJucyB0aGUgdGV4dCBmb3IgdGhlIEtQSSB0b29sdGlwLlxuICovXG5jb25zdCB0b29sdGlwRm9ybWF0ID0gZnVuY3Rpb24gKGtwaVRpdGxlOiBzdHJpbmcsIGtwaVZhbHVlOiBzdHJpbmcsIGtwaVVuaXQ6IHN0cmluZywga3BpU3RhdHVzOiBzdHJpbmcsIGhhc1VuaXQ6IHN0cmluZyk6IHN0cmluZyB7XG5cdGNvbnN0IHJlc0J1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdGNvbnN0IG1zZ0tleSA9IGtwaVN0YXR1cyA/IGBDX0tQSV9UT09MVElQXyR7a3BpU3RhdHVzLnRvVXBwZXJDYXNlKCl9YCA6IFwiQ19LUElfVE9PTFRJUF9OT05FXCI7XG5cdGxldCBhbW91bnRXaXRoVW5pdDogc3RyaW5nO1xuXHRpZiAoaGFzVW5pdCA9PT0gXCJ0cnVlXCIpIHtcblx0XHRpZiAoIWtwaVVuaXQpIHtcblx0XHRcdC8vIE5vIHVuaXQgbWVhbnMgbXVsdGktdW5pdCBzaXR1YXRpb25cblx0XHRcdGFtb3VudFdpdGhVbml0ID0gcmVzQnVuZGxlLmdldFRleHQoXCJDX0tQSV9UT09MVElQX0FNT1VOVF9NVUxUSVVOSVRcIik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFtb3VudFdpdGhVbml0ID0gYCR7a3BpVmFsdWV9ICR7a3BpVW5pdH1gO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRhbW91bnRXaXRoVW5pdCA9IGtwaVZhbHVlO1xuXHR9XG5cblx0cmV0dXJuIHJlc0J1bmRsZS5nZXRUZXh0KG1zZ0tleSwgW2twaVRpdGxlLCBhbW91bnRXaXRoVW5pdF0pO1xufTtcbnRvb2x0aXBGb3JtYXQuX19mdW5jdGlvbk5hbWUgPSBcInNhcC5mZS5jb3JlLmZvcm1hdHRlcnMuS1BJRm9ybWF0dGVyI3Rvb2x0aXBGb3JtYXRcIjtcblxuLy8gU2VlIGh0dHBzOi8vd3d3LnR5cGVzY3JpcHRsYW5nLm9yZy9kb2NzL2hhbmRib29rL2Z1bmN0aW9ucy5odG1sI3RoaXMtcGFyYW1ldGVycyBmb3IgbW9yZSBkZXRhaWwgb24gdGhpcyB3ZWlyZCBzeW50YXhcbi8qKlxuICogQ29sbGVjdGlvbiBvZiB0YWJsZSBmb3JtYXR0ZXJzLlxuICpcbiAqIEBwYXJhbSB0aGlzIFRoZSBjb250ZXh0XG4gKiBAcGFyYW0gc05hbWUgVGhlIGlubmVyIGZ1bmN0aW9uIG5hbWVcbiAqIEBwYXJhbSBvQXJncyBUaGUgaW5uZXIgZnVuY3Rpb24gcGFyYW1ldGVyc1xuICogQHJldHVybnMgVGhlIHZhbHVlIGZyb20gdGhlIGlubmVyIGZ1bmN0aW9uXG4gKi9cbmNvbnN0IGtwaUZvcm1hdHRlcnMgPSBmdW5jdGlvbiAodGhpczogb2JqZWN0LCBzTmFtZTogc3RyaW5nLCAuLi5vQXJnczogYW55W10pOiBhbnkge1xuXHRpZiAoa3BpRm9ybWF0dGVycy5oYXNPd25Qcm9wZXJ0eShzTmFtZSkpIHtcblx0XHRyZXR1cm4gKGtwaUZvcm1hdHRlcnMgYXMgYW55KVtzTmFtZV0uYXBwbHkodGhpcywgb0FyZ3MpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBcIlwiO1xuXHR9XG59O1xuXG5rcGlGb3JtYXR0ZXJzLmxhYmVsRm9ybWF0ID0gbGFiZWxGb3JtYXQ7XG5rcGlGb3JtYXR0ZXJzLnRvb2x0aXBGb3JtYXQgPSB0b29sdGlwRm9ybWF0O1xuXG4vKipcbiAqIEBnbG9iYWxcbiAqL1xuZXhwb3J0IGRlZmF1bHQga3BpRm9ybWF0dGVycztcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztFQVlBLE1BQU1BLFdBQVcsR0FBRyxVQUFVQyxRQUFnQixFQUFVO0lBQ3ZELElBQUlBLFFBQVEsRUFBRTtNQUNiO01BQ0EsTUFBTUMsVUFBVSxHQUFHRCxRQUFRLENBQUNFLEtBQUssQ0FBQyxHQUFHLENBQUM7TUFFdEMsSUFBSUMsUUFBZ0I7TUFDcEIsSUFBSUYsVUFBVSxDQUFDRyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQzVCO1FBQ0FELFFBQVEsR0FBR0YsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDSSxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDQyxXQUFXLEVBQUU7TUFDdkQsQ0FBQyxNQUFNLElBQUlMLFVBQVUsQ0FBQ0csTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNuQztRQUNBRCxRQUFRLEdBQUcsQ0FBQ0YsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDSSxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHSixVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUNJLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUVDLFdBQVcsRUFBRTtNQUN6RixDQUFDLE1BQU07UUFDTjtRQUNBSCxRQUFRLEdBQUcsQ0FBQ0YsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDSSxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHSixVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUNJLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUdKLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQ0ksU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRUMsV0FBVyxFQUFFO01BQ3pIO01BRUEsT0FBT0gsUUFBUTtJQUNoQixDQUFDLE1BQU07TUFDTjtNQUNBLE9BQU8sRUFBRTtJQUNWO0VBQ0QsQ0FBQztFQUNESixXQUFXLENBQUNRLGNBQWMsR0FBRyxpREFBaUQ7O0VBRTlFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsTUFBTUMsYUFBYSxHQUFHLFVBQVVSLFFBQWdCLEVBQUVTLFFBQWdCLEVBQUVDLE9BQWUsRUFBRUMsU0FBaUIsRUFBRUMsT0FBZSxFQUFVO0lBQ2hJLE1BQU1DLFNBQVMsR0FBR0MsSUFBSSxDQUFDQyx3QkFBd0IsQ0FBQyxhQUFhLENBQUM7SUFDOUQsTUFBTUMsTUFBTSxHQUFHTCxTQUFTLEdBQUksaUJBQWdCQSxTQUFTLENBQUNMLFdBQVcsRUFBRyxFQUFDLEdBQUcsb0JBQW9CO0lBQzVGLElBQUlXLGNBQXNCO0lBQzFCLElBQUlMLE9BQU8sS0FBSyxNQUFNLEVBQUU7TUFDdkIsSUFBSSxDQUFDRixPQUFPLEVBQUU7UUFDYjtRQUNBTyxjQUFjLEdBQUdKLFNBQVMsQ0FBQ0ssT0FBTyxDQUFDLGdDQUFnQyxDQUFDO01BQ3JFLENBQUMsTUFBTTtRQUNORCxjQUFjLEdBQUksR0FBRVIsUUFBUyxJQUFHQyxPQUFRLEVBQUM7TUFDMUM7SUFDRCxDQUFDLE1BQU07TUFDTk8sY0FBYyxHQUFHUixRQUFRO0lBQzFCO0lBRUEsT0FBT0ksU0FBUyxDQUFDSyxPQUFPLENBQUNGLE1BQU0sRUFBRSxDQUFDaEIsUUFBUSxFQUFFaUIsY0FBYyxDQUFDLENBQUM7RUFDN0QsQ0FBQztFQUNEVCxhQUFhLENBQUNELGNBQWMsR0FBRyxtREFBbUQ7O0VBRWxGO0VBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLE1BQU1ZLGFBQWEsR0FBRyxVQUF3QkMsS0FBYSxFQUF3QjtJQUNsRixJQUFJRCxhQUFhLENBQUNFLGNBQWMsQ0FBQ0QsS0FBSyxDQUFDLEVBQUU7TUFBQSxrQ0FEc0JFLEtBQUs7UUFBTEEsS0FBSztNQUFBO01BRW5FLE9BQVFILGFBQWEsQ0FBU0MsS0FBSyxDQUFDLENBQUNHLEtBQUssQ0FBQyxJQUFJLEVBQUVELEtBQUssQ0FBQztJQUN4RCxDQUFDLE1BQU07TUFDTixPQUFPLEVBQUU7SUFDVjtFQUNELENBQUM7RUFFREgsYUFBYSxDQUFDcEIsV0FBVyxHQUFHQSxXQUFXO0VBQ3ZDb0IsYUFBYSxDQUFDWCxhQUFhLEdBQUdBLGFBQWE7O0VBRTNDO0FBQ0E7QUFDQTtFQUZBLE9BR2VXLGFBQWE7QUFBQSJ9