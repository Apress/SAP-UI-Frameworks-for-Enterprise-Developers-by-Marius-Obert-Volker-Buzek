/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  var _sap$ushell, _urlParams$fioriTool, _urlParams$fioriTool$;
  const urlParserMock = {
    parseParameters: function () {
      return {};
    }
  };
  const urlParser = (_sap$ushell = sap.ushell) !== null && _sap$ushell !== void 0 && _sap$ushell.Container ? sap.ushell.Container.getService("URLParsing") : urlParserMock;
  const urlParams = urlParser.parseParameters(window.location.search);
  const fioriToolsRtaMode = ((_urlParams$fioriTool = urlParams["fiori-tools-rta-mode"]) === null || _urlParams$fioriTool === void 0 ? void 0 : (_urlParams$fioriTool$ = _urlParams$fioriTool[0]) === null || _urlParams$fioriTool$ === void 0 ? void 0 : _urlParams$fioriTool$.toLowerCase()) === "true";
  const isOnDynamicPage = function (element) {
    if (element.getMetadata().getName() === "sap.f.DynamicPage") {
      return true;
    } else {
      const parent = element.getParent();
      return parent ? isOnDynamicPage(parent) : false;
    }
  };
  const getAllowList = function (element) {
    let allowList = {};
    const elementName = element.getMetadata().getName();
    if (fioriToolsRtaMode) {
      // build the allow list for Fiori tools (developers)
      if (isOnDynamicPage(element)) {
        allowList = {
          "sap.ui.fl.variants.VariantManagement": true,
          "sap.fe.core.controls.FilterBar": true,
          "sap.ui.mdc.Table": true
        };
      }
    } else {
      var _element$getParent, _element$getParent2;
      // build the allow list for UI Adaptation (key users)
      allowList = {
        "sap.fe.templates.ObjectPage.controls.StashableVBox": true,
        "sap.fe.templates.ObjectPage.controls.StashableHBox": true,
        "sap.uxap.ObjectPageLayout": true,
        "sap.uxap.AnchorBar": true,
        "sap.uxap.ObjectPageSection": true,
        "sap.uxap.ObjectPageSubSection": true,
        "sap.ui.fl.util.IFrame": true,
        "sap.ui.layout.form.Form": true,
        "sap.ui.layout.form.FormContainer": true,
        "sap.ui.layout.form.FormElement": true,
        "sap.ui.fl.variants.VariantManagement": true,
        "sap.fe.core.controls.FilterBar": true,
        "sap.ui.mdc.Table": true,
        "sap.m.IconTabBar": true
      };
      // currently we support the adaptation of MenuButtons only for the AnchorBar on Object Page (adaptation of sections and subsections)
      if (elementName === "sap.m.MenuButton" && ((_element$getParent = element.getParent()) === null || _element$getParent === void 0 ? void 0 : _element$getParent.getMetadata().getName()) === "sap.uxap.AnchorBar") {
        allowList["sap.m.MenuButton"] = true;
      }
      // currently we support the adaptation of Buttons only for the AnchorBar on Object Page (adaptation of sections and subsections)
      if (elementName === "sap.m.Button" && ((_element$getParent2 = element.getParent()) === null || _element$getParent2 === void 0 ? void 0 : _element$getParent2.getMetadata().getName()) === "sap.uxap.AnchorBar") {
        allowList["sap.m.Button"] = true;
      }
      // the adaptation of FlexBoxes is only supported for the HeaderContainer on Object Page
      if (elementName === "sap.m.FlexBox" && element.getId().indexOf("--fe::HeaderContentContainer") >= 0) {
        allowList["sap.m.FlexBox"] = true;
      }
    }
    return allowList;
  };

  // To enable all actions, remove the propagateMetadata function. Or, remove this file and its entry in AppComponent.js referring 'designTime'.
  const AppComponentDesignTime = {
    actions: "not-adaptable",
    aggregations: {
      rootControl: {
        actions: "not-adaptable",
        propagateMetadata: function (element) {
          const allowList = getAllowList(element);
          if (allowList[element.getMetadata().getName()]) {
            // by returning the empty object, the same will be merged with element's native designtime definition, i.e. all actions will be enabled for this element
            return {};
          } else {
            // not-adaptable will be interpreted by flex to disable all actions for this element
            return {
              actions: "not-adaptable"
            };
          }
        }
      }
    },
    tool: {
      start: function (appComponent) {
        appComponent.getEnvironmentCapabilities().setCapability("AppState", false);
      },
      stop: function (appComponent) {
        appComponent.getEnvironmentCapabilities().setCapability("AppState", true);
      }
    }
  };
  return AppComponentDesignTime;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ1cmxQYXJzZXJNb2NrIiwicGFyc2VQYXJhbWV0ZXJzIiwidXJsUGFyc2VyIiwic2FwIiwidXNoZWxsIiwiQ29udGFpbmVyIiwiZ2V0U2VydmljZSIsInVybFBhcmFtcyIsIndpbmRvdyIsImxvY2F0aW9uIiwic2VhcmNoIiwiZmlvcmlUb29sc1J0YU1vZGUiLCJ0b0xvd2VyQ2FzZSIsImlzT25EeW5hbWljUGFnZSIsImVsZW1lbnQiLCJnZXRNZXRhZGF0YSIsImdldE5hbWUiLCJwYXJlbnQiLCJnZXRQYXJlbnQiLCJnZXRBbGxvd0xpc3QiLCJhbGxvd0xpc3QiLCJlbGVtZW50TmFtZSIsImdldElkIiwiaW5kZXhPZiIsIkFwcENvbXBvbmVudERlc2lnblRpbWUiLCJhY3Rpb25zIiwiYWdncmVnYXRpb25zIiwicm9vdENvbnRyb2wiLCJwcm9wYWdhdGVNZXRhZGF0YSIsInRvb2wiLCJzdGFydCIsImFwcENvbXBvbmVudCIsImdldEVudmlyb25tZW50Q2FwYWJpbGl0aWVzIiwic2V0Q2FwYWJpbGl0eSIsInN0b3AiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkFwcENvbXBvbmVudC5kZXNpZ250aW1lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgdHlwZSBNYW5hZ2VkT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5cbnR5cGUgVXJsUGFyc2VyID0ge1xuXHRwYXJzZVBhcmFtZXRlcnModXJsOiBzdHJpbmcpOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT47XG59O1xuXG5jb25zdCB1cmxQYXJzZXJNb2NrOiBVcmxQYXJzZXIgPSB7XG5cdHBhcnNlUGFyYW1ldGVyczogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB7fTtcblx0fVxufTtcbmNvbnN0IHVybFBhcnNlcjogVXJsUGFyc2VyID0gc2FwLnVzaGVsbD8uQ29udGFpbmVyID8gc2FwLnVzaGVsbC5Db250YWluZXIuZ2V0U2VydmljZShcIlVSTFBhcnNpbmdcIikgOiB1cmxQYXJzZXJNb2NrO1xuY29uc3QgdXJsUGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4gPSB1cmxQYXJzZXIucGFyc2VQYXJhbWV0ZXJzKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xuY29uc3QgZmlvcmlUb29sc1J0YU1vZGU6IGJvb2xlYW4gPSB1cmxQYXJhbXNbXCJmaW9yaS10b29scy1ydGEtbW9kZVwiXT8uWzBdPy50b0xvd2VyQ2FzZSgpID09PSBcInRydWVcIjtcblxuY29uc3QgaXNPbkR5bmFtaWNQYWdlID0gZnVuY3Rpb24gKGVsZW1lbnQ6IE1hbmFnZWRPYmplY3QpOiBib29sZWFuIHtcblx0aWYgKGVsZW1lbnQuZ2V0TWV0YWRhdGEoKS5nZXROYW1lKCkgPT09IFwic2FwLmYuRHluYW1pY1BhZ2VcIikge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IHBhcmVudCA9IGVsZW1lbnQuZ2V0UGFyZW50KCk7XG5cdFx0cmV0dXJuIHBhcmVudCA/IGlzT25EeW5hbWljUGFnZShwYXJlbnQpIDogZmFsc2U7XG5cdH1cbn07XG5jb25zdCBnZXRBbGxvd0xpc3QgPSBmdW5jdGlvbiAoZWxlbWVudDogTWFuYWdlZE9iamVjdCk6IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+IHtcblx0bGV0IGFsbG93TGlzdDogUmVjb3JkPHN0cmluZywgYm9vbGVhbj4gPSB7fTtcblx0Y29uc3QgZWxlbWVudE5hbWUgPSBlbGVtZW50LmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpO1xuXHRpZiAoZmlvcmlUb29sc1J0YU1vZGUpIHtcblx0XHQvLyBidWlsZCB0aGUgYWxsb3cgbGlzdCBmb3IgRmlvcmkgdG9vbHMgKGRldmVsb3BlcnMpXG5cdFx0aWYgKGlzT25EeW5hbWljUGFnZShlbGVtZW50KSkge1xuXHRcdFx0YWxsb3dMaXN0ID0ge1xuXHRcdFx0XHRcInNhcC51aS5mbC52YXJpYW50cy5WYXJpYW50TWFuYWdlbWVudFwiOiB0cnVlLFxuXHRcdFx0XHRcInNhcC5mZS5jb3JlLmNvbnRyb2xzLkZpbHRlckJhclwiOiB0cnVlLFxuXHRcdFx0XHRcInNhcC51aS5tZGMuVGFibGVcIjogdHJ1ZVxuXHRcdFx0fTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Ly8gYnVpbGQgdGhlIGFsbG93IGxpc3QgZm9yIFVJIEFkYXB0YXRpb24gKGtleSB1c2Vycylcblx0XHRhbGxvd0xpc3QgPSB7XG5cdFx0XHRcInNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5jb250cm9scy5TdGFzaGFibGVWQm94XCI6IHRydWUsXG5cdFx0XHRcInNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5jb250cm9scy5TdGFzaGFibGVIQm94XCI6IHRydWUsXG5cdFx0XHRcInNhcC51eGFwLk9iamVjdFBhZ2VMYXlvdXRcIjogdHJ1ZSxcblx0XHRcdFwic2FwLnV4YXAuQW5jaG9yQmFyXCI6IHRydWUsXG5cdFx0XHRcInNhcC51eGFwLk9iamVjdFBhZ2VTZWN0aW9uXCI6IHRydWUsXG5cdFx0XHRcInNhcC51eGFwLk9iamVjdFBhZ2VTdWJTZWN0aW9uXCI6IHRydWUsXG5cdFx0XHRcInNhcC51aS5mbC51dGlsLklGcmFtZVwiOiB0cnVlLFxuXHRcdFx0XCJzYXAudWkubGF5b3V0LmZvcm0uRm9ybVwiOiB0cnVlLFxuXHRcdFx0XCJzYXAudWkubGF5b3V0LmZvcm0uRm9ybUNvbnRhaW5lclwiOiB0cnVlLFxuXHRcdFx0XCJzYXAudWkubGF5b3V0LmZvcm0uRm9ybUVsZW1lbnRcIjogdHJ1ZSxcblx0XHRcdFwic2FwLnVpLmZsLnZhcmlhbnRzLlZhcmlhbnRNYW5hZ2VtZW50XCI6IHRydWUsXG5cdFx0XHRcInNhcC5mZS5jb3JlLmNvbnRyb2xzLkZpbHRlckJhclwiOiB0cnVlLFxuXHRcdFx0XCJzYXAudWkubWRjLlRhYmxlXCI6IHRydWUsXG5cdFx0XHRcInNhcC5tLkljb25UYWJCYXJcIjogdHJ1ZVxuXHRcdH07XG5cdFx0Ly8gY3VycmVudGx5IHdlIHN1cHBvcnQgdGhlIGFkYXB0YXRpb24gb2YgTWVudUJ1dHRvbnMgb25seSBmb3IgdGhlIEFuY2hvckJhciBvbiBPYmplY3QgUGFnZSAoYWRhcHRhdGlvbiBvZiBzZWN0aW9ucyBhbmQgc3Vic2VjdGlvbnMpXG5cdFx0aWYgKGVsZW1lbnROYW1lID09PSBcInNhcC5tLk1lbnVCdXR0b25cIiAmJiBlbGVtZW50LmdldFBhcmVudCgpPy5nZXRNZXRhZGF0YSgpLmdldE5hbWUoKSA9PT0gXCJzYXAudXhhcC5BbmNob3JCYXJcIikge1xuXHRcdFx0YWxsb3dMaXN0W1wic2FwLm0uTWVudUJ1dHRvblwiXSA9IHRydWU7XG5cdFx0fVxuXHRcdC8vIGN1cnJlbnRseSB3ZSBzdXBwb3J0IHRoZSBhZGFwdGF0aW9uIG9mIEJ1dHRvbnMgb25seSBmb3IgdGhlIEFuY2hvckJhciBvbiBPYmplY3QgUGFnZSAoYWRhcHRhdGlvbiBvZiBzZWN0aW9ucyBhbmQgc3Vic2VjdGlvbnMpXG5cdFx0aWYgKGVsZW1lbnROYW1lID09PSBcInNhcC5tLkJ1dHRvblwiICYmIGVsZW1lbnQuZ2V0UGFyZW50KCk/LmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpID09PSBcInNhcC51eGFwLkFuY2hvckJhclwiKSB7XG5cdFx0XHRhbGxvd0xpc3RbXCJzYXAubS5CdXR0b25cIl0gPSB0cnVlO1xuXHRcdH1cblx0XHQvLyB0aGUgYWRhcHRhdGlvbiBvZiBGbGV4Qm94ZXMgaXMgb25seSBzdXBwb3J0ZWQgZm9yIHRoZSBIZWFkZXJDb250YWluZXIgb24gT2JqZWN0IFBhZ2Vcblx0XHRpZiAoZWxlbWVudE5hbWUgPT09IFwic2FwLm0uRmxleEJveFwiICYmIGVsZW1lbnQuZ2V0SWQoKS5pbmRleE9mKFwiLS1mZTo6SGVhZGVyQ29udGVudENvbnRhaW5lclwiKSA+PSAwKSB7XG5cdFx0XHRhbGxvd0xpc3RbXCJzYXAubS5GbGV4Qm94XCJdID0gdHJ1ZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGFsbG93TGlzdDtcbn07XG5cbi8vIFRvIGVuYWJsZSBhbGwgYWN0aW9ucywgcmVtb3ZlIHRoZSBwcm9wYWdhdGVNZXRhZGF0YSBmdW5jdGlvbi4gT3IsIHJlbW92ZSB0aGlzIGZpbGUgYW5kIGl0cyBlbnRyeSBpbiBBcHBDb21wb25lbnQuanMgcmVmZXJyaW5nICdkZXNpZ25UaW1lJy5cbmNvbnN0IEFwcENvbXBvbmVudERlc2lnblRpbWUgPSB7XG5cdGFjdGlvbnM6IFwibm90LWFkYXB0YWJsZVwiLFxuXHRhZ2dyZWdhdGlvbnM6IHtcblx0XHRyb290Q29udHJvbDoge1xuXHRcdFx0YWN0aW9uczogXCJub3QtYWRhcHRhYmxlXCIsXG5cdFx0XHRwcm9wYWdhdGVNZXRhZGF0YTogZnVuY3Rpb24gKGVsZW1lbnQ6IE1hbmFnZWRPYmplY3QpIHtcblx0XHRcdFx0Y29uc3QgYWxsb3dMaXN0ID0gZ2V0QWxsb3dMaXN0KGVsZW1lbnQpO1xuXHRcdFx0XHRpZiAoYWxsb3dMaXN0W2VsZW1lbnQuZ2V0TWV0YWRhdGEoKS5nZXROYW1lKCldKSB7XG5cdFx0XHRcdFx0Ly8gYnkgcmV0dXJuaW5nIHRoZSBlbXB0eSBvYmplY3QsIHRoZSBzYW1lIHdpbGwgYmUgbWVyZ2VkIHdpdGggZWxlbWVudCdzIG5hdGl2ZSBkZXNpZ250aW1lIGRlZmluaXRpb24sIGkuZS4gYWxsIGFjdGlvbnMgd2lsbCBiZSBlbmFibGVkIGZvciB0aGlzIGVsZW1lbnRcblx0XHRcdFx0XHRyZXR1cm4ge307XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gbm90LWFkYXB0YWJsZSB3aWxsIGJlIGludGVycHJldGVkIGJ5IGZsZXggdG8gZGlzYWJsZSBhbGwgYWN0aW9ucyBmb3IgdGhpcyBlbGVtZW50XG5cdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdGFjdGlvbnM6IFwibm90LWFkYXB0YWJsZVwiXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0dG9vbDoge1xuXHRcdHN0YXJ0OiBmdW5jdGlvbiAoYXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQpIHtcblx0XHRcdGFwcENvbXBvbmVudC5nZXRFbnZpcm9ubWVudENhcGFiaWxpdGllcygpLnNldENhcGFiaWxpdHkoXCJBcHBTdGF0ZVwiLCBmYWxzZSk7XG5cdFx0fSxcblx0XHRzdG9wOiBmdW5jdGlvbiAoYXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQpIHtcblx0XHRcdGFwcENvbXBvbmVudC5nZXRFbnZpcm9ubWVudENhcGFiaWxpdGllcygpLnNldENhcGFiaWxpdHkoXCJBcHBTdGF0ZVwiLCB0cnVlKTtcblx0XHR9XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IEFwcENvbXBvbmVudERlc2lnblRpbWU7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O0VBT0EsTUFBTUEsYUFBd0IsR0FBRztJQUNoQ0MsZUFBZSxFQUFFLFlBQVk7TUFDNUIsT0FBTyxDQUFDLENBQUM7SUFDVjtFQUNELENBQUM7RUFDRCxNQUFNQyxTQUFvQixHQUFHLGVBQUFDLEdBQUcsQ0FBQ0MsTUFBTSx3Q0FBVixZQUFZQyxTQUFTLEdBQUdGLEdBQUcsQ0FBQ0MsTUFBTSxDQUFDQyxTQUFTLENBQUNDLFVBQVUsQ0FBQyxZQUFZLENBQUMsR0FBR04sYUFBYTtFQUNsSCxNQUFNTyxTQUFtQyxHQUFHTCxTQUFTLENBQUNELGVBQWUsQ0FBQ08sTUFBTSxDQUFDQyxRQUFRLENBQUNDLE1BQU0sQ0FBQztFQUM3RixNQUFNQyxpQkFBMEIsR0FBRyx5QkFBQUosU0FBUyxDQUFDLHNCQUFzQixDQUFDLGtGQUFqQyxxQkFBb0MsQ0FBQyxDQUFDLDBEQUF0QyxzQkFBd0NLLFdBQVcsRUFBRSxNQUFLLE1BQU07RUFFbkcsTUFBTUMsZUFBZSxHQUFHLFVBQVVDLE9BQXNCLEVBQVc7SUFDbEUsSUFBSUEsT0FBTyxDQUFDQyxXQUFXLEVBQUUsQ0FBQ0MsT0FBTyxFQUFFLEtBQUssbUJBQW1CLEVBQUU7TUFDNUQsT0FBTyxJQUFJO0lBQ1osQ0FB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