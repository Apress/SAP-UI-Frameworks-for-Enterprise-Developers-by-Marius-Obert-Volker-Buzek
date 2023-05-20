/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/macros/CommonHelper", "sap/fe/macros/table/TableHelper", "sap/m/library"], function (CommonHelper, Table, library) {
  "use strict";

  var MenuButtonMode = library.MenuButtonMode;
  const DefaultActionHandler = {
    /**
     * The default action group handler that is invoked when adding the menu button handling appropriately.
     *
     * @param oCtx The current context in which the handler is called
     * @param oAction The current action context
     * @param oDataFieldForDefaultAction The current dataField for the default action
     * @param defaultActionContextOrEntitySet The current context for the default action
     * @param mode The optional parameter for the handler mode; default setting is Table
     * @returns The appropriate expression string
     */
    getDefaultActionHandler: function (oCtx, oAction, oDataFieldForDefaultAction, defaultActionContextOrEntitySet) {
      let mode = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "Table";
      if (oAction.defaultAction) {
        try {
          switch (oAction.defaultAction.type) {
            case "ForAction":
              {
                if (mode === "Table") {
                  return Table.pressEventDataFieldForActionButton(oCtx, oDataFieldForDefaultAction, oCtx.collection.getObject("@sapui.name"), oCtx.tableDefinition.operationAvailableMap, defaultActionContextOrEntitySet, oAction.isNavigable, oAction.enableAutoScroll, oAction.defaultValuesExtensionFunction);
                }
                return undefined;
              }
            case "ForNavigation":
              {
                if (mode === "Table") {
                  return CommonHelper.getPressHandlerForDataFieldForIBN(oDataFieldForDefaultAction, "${internal>selectedContexts}", !oCtx.tableDefinition.enableAnalytics);
                }
                return undefined;
              }
            default:
              {
                if (oAction.defaultAction.command) {
                  return "cmd:" + oAction.defaultAction.command;
                }
                if (oAction.defaultAction.noWrap) {
                  return oAction.defaultAction.press;
                } else {
                  switch (mode) {
                    case "Table":
                      {
                        return CommonHelper.buildActionWrapper(oAction.defaultAction, oCtx);
                      }
                    case "Form":
                      {
                        return CommonHelper.buildActionWrapper(oAction.defaultAction, {
                          id: "forTheForm"
                        });
                      }
                  }
                }
              }
          }
        } catch (ioEx) {
          return "binding for the default action is not working as expected";
        }
      }
      return undefined;
    },
    /**
     * The function determines during templating whether to use the defaultActionOnly
     * setting for the sap.m.MenuButton control in case a defaultAction is provided.
     *
     * @param oAction The current action context
     * @returns A Boolean value
     */
    getUseDefaultActionOnly: function (oAction) {
      if (oAction.defaultAction) {
        return true;
      } else {
        return false;
      }
    },
    /**
     * The function determines during templating whether to use the 'Split'
     * or 'Regular' MenuButtonMode for the sap.m.MenuButton control
     * in case a defaultAction is available.
     *
     * @param oAction The current action context
     * @returns The MenuButtonMode
     */
    getButtonMode: function (oAction) {
      if (oAction.defaultAction) {
        return MenuButtonMode.Split;
      } else {
        return MenuButtonMode.Regular;
      }
    }
  };
  return DefaultActionHandler;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZWZhdWx0QWN0aW9uSGFuZGxlciIsImdldERlZmF1bHRBY3Rpb25IYW5kbGVyIiwib0N0eCIsIm9BY3Rpb24iLCJvRGF0YUZpZWxkRm9yRGVmYXVsdEFjdGlvbiIsImRlZmF1bHRBY3Rpb25Db250ZXh0T3JFbnRpdHlTZXQiLCJtb2RlIiwiZGVmYXVsdEFjdGlvbiIsInR5cGUiLCJUYWJsZSIsInByZXNzRXZlbnREYXRhRmllbGRGb3JBY3Rpb25CdXR0b24iLCJjb2xsZWN0aW9uIiwiZ2V0T2JqZWN0IiwidGFibGVEZWZpbml0aW9uIiwib3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwiaXNOYXZpZ2FibGUiLCJlbmFibGVBdXRvU2Nyb2xsIiwiZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uIiwidW5kZWZpbmVkIiwiQ29tbW9uSGVscGVyIiwiZ2V0UHJlc3NIYW5kbGVyRm9yRGF0YUZpZWxkRm9ySUJOIiwiZW5hYmxlQW5hbHl0aWNzIiwiY29tbWFuZCIsIm5vV3JhcCIsInByZXNzIiwiYnVpbGRBY3Rpb25XcmFwcGVyIiwiaWQiLCJpb0V4IiwiZ2V0VXNlRGVmYXVsdEFjdGlvbk9ubHkiLCJnZXRCdXR0b25Nb2RlIiwiTWVudUJ1dHRvbk1vZGUiLCJTcGxpdCIsIlJlZ3VsYXIiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkRlZmF1bHRBY3Rpb25IYW5kbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgVGFibGUgZnJvbSBcInNhcC9mZS9tYWNyb3MvdGFibGUvVGFibGVIZWxwZXJcIjtcbmltcG9ydCB7IE1lbnVCdXR0b25Nb2RlIH0gZnJvbSBcInNhcC9tL2xpYnJhcnlcIjtcblxuY29uc3QgRGVmYXVsdEFjdGlvbkhhbmRsZXIgPSB7XG5cdC8qKlxuXHQgKiBUaGUgZGVmYXVsdCBhY3Rpb24gZ3JvdXAgaGFuZGxlciB0aGF0IGlzIGludm9rZWQgd2hlbiBhZGRpbmcgdGhlIG1lbnUgYnV0dG9uIGhhbmRsaW5nIGFwcHJvcHJpYXRlbHkuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ3R4IFRoZSBjdXJyZW50IGNvbnRleHQgaW4gd2hpY2ggdGhlIGhhbmRsZXIgaXMgY2FsbGVkXG5cdCAqIEBwYXJhbSBvQWN0aW9uIFRoZSBjdXJyZW50IGFjdGlvbiBjb250ZXh0XG5cdCAqIEBwYXJhbSBvRGF0YUZpZWxkRm9yRGVmYXVsdEFjdGlvbiBUaGUgY3VycmVudCBkYXRhRmllbGQgZm9yIHRoZSBkZWZhdWx0IGFjdGlvblxuXHQgKiBAcGFyYW0gZGVmYXVsdEFjdGlvbkNvbnRleHRPckVudGl0eVNldCBUaGUgY3VycmVudCBjb250ZXh0IGZvciB0aGUgZGVmYXVsdCBhY3Rpb25cblx0ICogQHBhcmFtIG1vZGUgVGhlIG9wdGlvbmFsIHBhcmFtZXRlciBmb3IgdGhlIGhhbmRsZXIgbW9kZTsgZGVmYXVsdCBzZXR0aW5nIGlzIFRhYmxlXG5cdCAqIEByZXR1cm5zIFRoZSBhcHByb3ByaWF0ZSBleHByZXNzaW9uIHN0cmluZ1xuXHQgKi9cblx0Z2V0RGVmYXVsdEFjdGlvbkhhbmRsZXI6IGZ1bmN0aW9uIChcblx0XHRvQ3R4OiBhbnksXG5cdFx0b0FjdGlvbjogYW55LFxuXHRcdG9EYXRhRmllbGRGb3JEZWZhdWx0QWN0aW9uOiBhbnksXG5cdFx0ZGVmYXVsdEFjdGlvbkNvbnRleHRPckVudGl0eVNldDogYW55LFxuXHRcdG1vZGUgPSBcIlRhYmxlXCJcblx0KSB7XG5cdFx0aWYgKG9BY3Rpb24uZGVmYXVsdEFjdGlvbikge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0c3dpdGNoIChvQWN0aW9uLmRlZmF1bHRBY3Rpb24udHlwZSkge1xuXHRcdFx0XHRcdGNhc2UgXCJGb3JBY3Rpb25cIjoge1xuXHRcdFx0XHRcdFx0aWYgKG1vZGUgPT09IFwiVGFibGVcIikge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gVGFibGUucHJlc3NFdmVudERhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbihcblx0XHRcdFx0XHRcdFx0XHRvQ3R4LFxuXHRcdFx0XHRcdFx0XHRcdG9EYXRhRmllbGRGb3JEZWZhdWx0QWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRcdG9DdHguY29sbGVjdGlvbi5nZXRPYmplY3QoXCJAc2FwdWkubmFtZVwiKSxcblx0XHRcdFx0XHRcdFx0XHRvQ3R4LnRhYmxlRGVmaW5pdGlvbi5vcGVyYXRpb25BdmFpbGFibGVNYXAsXG5cdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdEFjdGlvbkNvbnRleHRPckVudGl0eVNldCxcblx0XHRcdFx0XHRcdFx0XHRvQWN0aW9uLmlzTmF2aWdhYmxlLFxuXHRcdFx0XHRcdFx0XHRcdG9BY3Rpb24uZW5hYmxlQXV0b1Njcm9sbCxcblx0XHRcdFx0XHRcdFx0XHRvQWN0aW9uLmRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvblxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2FzZSBcIkZvck5hdmlnYXRpb25cIjoge1xuXHRcdFx0XHRcdFx0aWYgKG1vZGUgPT09IFwiVGFibGVcIikge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gQ29tbW9uSGVscGVyLmdldFByZXNzSGFuZGxlckZvckRhdGFGaWVsZEZvcklCTihcblx0XHRcdFx0XHRcdFx0XHRvRGF0YUZpZWxkRm9yRGVmYXVsdEFjdGlvbixcblx0XHRcdFx0XHRcdFx0XHRcIiR7aW50ZXJuYWw+c2VsZWN0ZWRDb250ZXh0c31cIixcblx0XHRcdFx0XHRcdFx0XHQhb0N0eC50YWJsZURlZmluaXRpb24uZW5hYmxlQW5hbHl0aWNzXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkZWZhdWx0OiB7XG5cdFx0XHRcdFx0XHRpZiAob0FjdGlvbi5kZWZhdWx0QWN0aW9uLmNvbW1hbmQpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIFwiY21kOlwiICsgb0FjdGlvbi5kZWZhdWx0QWN0aW9uLmNvbW1hbmQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAob0FjdGlvbi5kZWZhdWx0QWN0aW9uLm5vV3JhcCkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gb0FjdGlvbi5kZWZhdWx0QWN0aW9uLnByZXNzO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0c3dpdGNoIChtb2RlKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcIlRhYmxlXCI6IHtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBDb21tb25IZWxwZXIuYnVpbGRBY3Rpb25XcmFwcGVyKG9BY3Rpb24uZGVmYXVsdEFjdGlvbiwgb0N0eCk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJGb3JtXCI6IHtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBDb21tb25IZWxwZXIuYnVpbGRBY3Rpb25XcmFwcGVyKG9BY3Rpb24uZGVmYXVsdEFjdGlvbiwgeyBpZDogXCJmb3JUaGVGb3JtXCIgfSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChpb0V4KSB7XG5cdFx0XHRcdHJldHVybiBcImJpbmRpbmcgZm9yIHRoZSBkZWZhdWx0IGFjdGlvbiBpcyBub3Qgd29ya2luZyBhcyBleHBlY3RlZFwiO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBUaGUgZnVuY3Rpb24gZGV0ZXJtaW5lcyBkdXJpbmcgdGVtcGxhdGluZyB3aGV0aGVyIHRvIHVzZSB0aGUgZGVmYXVsdEFjdGlvbk9ubHlcblx0ICogc2V0dGluZyBmb3IgdGhlIHNhcC5tLk1lbnVCdXR0b24gY29udHJvbCBpbiBjYXNlIGEgZGVmYXVsdEFjdGlvbiBpcyBwcm92aWRlZC5cblx0ICpcblx0ICogQHBhcmFtIG9BY3Rpb24gVGhlIGN1cnJlbnQgYWN0aW9uIGNvbnRleHRcblx0ICogQHJldHVybnMgQSBCb29sZWFuIHZhbHVlXG5cdCAqL1xuXHRnZXRVc2VEZWZhdWx0QWN0aW9uT25seTogZnVuY3Rpb24gKG9BY3Rpb246IGFueSkge1xuXHRcdGlmIChvQWN0aW9uLmRlZmF1bHRBY3Rpb24pIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBUaGUgZnVuY3Rpb24gZGV0ZXJtaW5lcyBkdXJpbmcgdGVtcGxhdGluZyB3aGV0aGVyIHRvIHVzZSB0aGUgJ1NwbGl0J1xuXHQgKiBvciAnUmVndWxhcicgTWVudUJ1dHRvbk1vZGUgZm9yIHRoZSBzYXAubS5NZW51QnV0dG9uIGNvbnRyb2xcblx0ICogaW4gY2FzZSBhIGRlZmF1bHRBY3Rpb24gaXMgYXZhaWxhYmxlLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0FjdGlvbiBUaGUgY3VycmVudCBhY3Rpb24gY29udGV4dFxuXHQgKiBAcmV0dXJucyBUaGUgTWVudUJ1dHRvbk1vZGVcblx0ICovXG5cdGdldEJ1dHRvbk1vZGU6IGZ1bmN0aW9uIChvQWN0aW9uOiBhbnkpIHtcblx0XHRpZiAob0FjdGlvbi5kZWZhdWx0QWN0aW9uKSB7XG5cdFx0XHRyZXR1cm4gTWVudUJ1dHRvbk1vZGUuU3BsaXQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBNZW51QnV0dG9uTW9kZS5SZWd1bGFyO1xuXHRcdH1cblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgRGVmYXVsdEFjdGlvbkhhbmRsZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O0VBSUEsTUFBTUEsb0JBQW9CLEdBQUc7SUFDNUI7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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