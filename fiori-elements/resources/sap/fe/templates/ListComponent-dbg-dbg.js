/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/fe/core/library", "sap/fe/core/TemplateComponent"], function (ClassSupport, CoreLibrary, TemplateComponent) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const VariantManagement = CoreLibrary.VariantManagement,
    InitialLoadMode = CoreLibrary.InitialLoadMode;
  let ListBasedComponent = (_dec = defineUI5Class("sap.fe.templates.ListComponent", {
    manifest: {
      "sap.ui": {
        technology: "UI5",
        deviceTypes: {
          desktop: true,
          tablet: true,
          phone: true
        },
        supportedThemes: ["sap_fiori_3", "sap_hcb", "sap_bluecrystal", "sap_belize", "sap_belize_plus", "sap_belize_hcw"]
      },
      "sap.ui5": {
        services: {
          templatedViewService: {
            factoryName: "sap.fe.core.services.TemplatedViewService",
            startup: "waitFor",
            settings: {
              viewName: "sap.fe.templates.ListReport.ListReport",
              converterType: "ListReport",
              errorViewName: "sap.fe.core.services.view.TemplatingErrorPage"
            }
          },
          asyncComponentService: {
            factoryName: "sap.fe.core.services.AsyncComponentService",
            startup: "waitFor"
          }
        },
        commands: {
          Create: {
            name: "Create",
            shortcut: "Ctrl+Enter"
          },
          DeleteEntry: {
            name: "DeleteEntry",
            shortcut: "Ctrl+D"
          },
          TableSettings: {
            name: "TableSettings",
            shortcut: "Ctrl+,"
          },
          Share: {
            name: "Share",
            shortcut: "Shift+Ctrl+S"
          },
          FE_FilterSearch: {
            name: "FE_FilterSearch",
            shortcut: "Ctrl+Enter"
          }
        },
        handleValidation: true,
        dependencies: {
          minUI5Version: "${sap.ui5.core.version}",
          libs: {
            "sap.f": {},
            "sap.fe.macros": {
              lazy: true
            },
            "sap.m": {},
            "sap.suite.ui.microchart": {
              lazy: true
            },
            "sap.ui.core": {},
            "sap.ui.layout": {},
            "sap.ui.mdc": {},
            "sap.ushell": {
              lazy: true
            },
            "sap.ui.fl": {}
          }
        },
        contentDensities: {
          compact: true,
          cozy: true
        }
      }
    },
    library: "sap.fe.templates"
  }), _dec2 = property({
    type: "sap.fe.core.InitialLoadMode",
    defaultValue: InitialLoadMode.Auto
  }), _dec3 = property({
    type: "sap.fe.core.VariantManagement",
    defaultValue: VariantManagement.Page
  }), _dec4 = property({
    type: "string",
    defaultValue: undefined
  }), _dec5 = property({
    type: "boolean",
    defaultValue: false
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_TemplateComponent) {
    _inheritsLoose(ListBasedComponent, _TemplateComponent);
    function ListBasedComponent() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _TemplateComponent.call(this, ...args) || this;
      _initializerDefineProperty(_this, "initialLoad", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantManagement", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "defaultTemplateAnnotationPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "liveMode", _descriptor4, _assertThisInitialized(_this));
      return _this;
    }
    return ListBasedComponent;
  }(TemplateComponent), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "initialLoad", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "variantManagement", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "defaultTemplateAnnotationPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "liveMode", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return ListBasedComponent;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWYXJpYW50TWFuYWdlbWVudCIsIkNvcmVMaWJyYXJ5IiwiSW5pdGlhbExvYWRNb2RlIiwiTGlzdEJhc2VkQ29tcG9uZW50IiwiZGVmaW5lVUk1Q2xhc3MiLCJtYW5pZmVzdCIsInRlY2hub2xvZ3kiLCJkZXZpY2VUeXBlcyIsImRlc2t0b3AiLCJ0YWJsZXQiLCJwaG9uZSIsInN1cHBvcnRlZFRoZW1lcyIsInNlcnZpY2VzIiwidGVtcGxhdGVkVmlld1NlcnZpY2UiLCJmYWN0b3J5TmFtZSIsInN0YXJ0dXAiLCJzZXR0aW5ncyIsInZpZXdOYW1lIiwiY29udmVydGVyVHlwZSIsImVycm9yVmlld05hbWUiLCJhc3luY0NvbXBvbmVudFNlcnZpY2UiLCJjb21tYW5kcyIsIkNyZWF0ZSIsIm5hbWUiLCJzaG9ydGN1dCIsIkRlbGV0ZUVudHJ5IiwiVGFibGVTZXR0aW5ncyIsIlNoYXJlIiwiRkVfRmlsdGVyU2VhcmNoIiwiaGFuZGxlVmFsaWRhdGlvbiIsImRlcGVuZGVuY2llcyIsIm1pblVJNVZlcnNpb24iLCJsaWJzIiwibGF6eSIsImNvbnRlbnREZW5zaXRpZXMiLCJjb21wYWN0IiwiY296eSIsImxpYnJhcnkiLCJwcm9wZXJ0eSIsInR5cGUiLCJkZWZhdWx0VmFsdWUiLCJBdXRvIiwiUGFnZSIsInVuZGVmaW5lZCIsIlRlbXBsYXRlQ29tcG9uZW50Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJMaXN0Q29tcG9uZW50LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBwcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IENvcmVMaWJyYXJ5IGZyb20gXCJzYXAvZmUvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgVGVtcGxhdGVDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL1RlbXBsYXRlQ29tcG9uZW50XCI7XG5jb25zdCBWYXJpYW50TWFuYWdlbWVudCA9IENvcmVMaWJyYXJ5LlZhcmlhbnRNYW5hZ2VtZW50LFxuXHRJbml0aWFsTG9hZE1vZGUgPSBDb3JlTGlicmFyeS5Jbml0aWFsTG9hZE1vZGU7XG5cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS50ZW1wbGF0ZXMuTGlzdENvbXBvbmVudFwiLCB7XG5cdG1hbmlmZXN0OiB7XG5cdFx0XCJzYXAudWlcIjoge1xuXHRcdFx0dGVjaG5vbG9neTogXCJVSTVcIixcblx0XHRcdGRldmljZVR5cGVzOiB7XG5cdFx0XHRcdGRlc2t0b3A6IHRydWUsXG5cdFx0XHRcdHRhYmxldDogdHJ1ZSxcblx0XHRcdFx0cGhvbmU6IHRydWVcblx0XHRcdH0sXG5cdFx0XHRzdXBwb3J0ZWRUaGVtZXM6IFtcInNhcF9maW9yaV8zXCIsIFwic2FwX2hjYlwiLCBcInNhcF9ibHVlY3J5c3RhbFwiLCBcInNhcF9iZWxpemVcIiwgXCJzYXBfYmVsaXplX3BsdXNcIiwgXCJzYXBfYmVsaXplX2hjd1wiXVxuXHRcdH0sXG5cdFx0XCJzYXAudWk1XCI6IHtcblx0XHRcdHNlcnZpY2VzOiB7XG5cdFx0XHRcdHRlbXBsYXRlZFZpZXdTZXJ2aWNlOiB7XG5cdFx0XHRcdFx0ZmFjdG9yeU5hbWU6IFwic2FwLmZlLmNvcmUuc2VydmljZXMuVGVtcGxhdGVkVmlld1NlcnZpY2VcIixcblx0XHRcdFx0XHRzdGFydHVwOiBcIndhaXRGb3JcIixcblx0XHRcdFx0XHRzZXR0aW5nczoge1xuXHRcdFx0XHRcdFx0dmlld05hbWU6IFwic2FwLmZlLnRlbXBsYXRlcy5MaXN0UmVwb3J0Lkxpc3RSZXBvcnRcIixcblx0XHRcdFx0XHRcdGNvbnZlcnRlclR5cGU6IFwiTGlzdFJlcG9ydFwiLFxuXHRcdFx0XHRcdFx0ZXJyb3JWaWV3TmFtZTogXCJzYXAuZmUuY29yZS5zZXJ2aWNlcy52aWV3LlRlbXBsYXRpbmdFcnJvclBhZ2VcIlxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0YXN5bmNDb21wb25lbnRTZXJ2aWNlOiB7XG5cdFx0XHRcdFx0ZmFjdG9yeU5hbWU6IFwic2FwLmZlLmNvcmUuc2VydmljZXMuQXN5bmNDb21wb25lbnRTZXJ2aWNlXCIsXG5cdFx0XHRcdFx0c3RhcnR1cDogXCJ3YWl0Rm9yXCJcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGNvbW1hbmRzOiB7XG5cdFx0XHRcdENyZWF0ZToge1xuXHRcdFx0XHRcdG5hbWU6IFwiQ3JlYXRlXCIsXG5cdFx0XHRcdFx0c2hvcnRjdXQ6IFwiQ3RybCtFbnRlclwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdERlbGV0ZUVudHJ5OiB7XG5cdFx0XHRcdFx0bmFtZTogXCJEZWxldGVFbnRyeVwiLFxuXHRcdFx0XHRcdHNob3J0Y3V0OiBcIkN0cmwrRFwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdFRhYmxlU2V0dGluZ3M6IHtcblx0XHRcdFx0XHRuYW1lOiBcIlRhYmxlU2V0dGluZ3NcIixcblx0XHRcdFx0XHRzaG9ydGN1dDogXCJDdHJsKyxcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRTaGFyZToge1xuXHRcdFx0XHRcdG5hbWU6IFwiU2hhcmVcIixcblx0XHRcdFx0XHRzaG9ydGN1dDogXCJTaGlmdCtDdHJsK1NcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRGRV9GaWx0ZXJTZWFyY2g6IHtcblx0XHRcdFx0XHRuYW1lOiBcIkZFX0ZpbHRlclNlYXJjaFwiLFxuXHRcdFx0XHRcdHNob3J0Y3V0OiBcIkN0cmwrRW50ZXJcIlxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0aGFuZGxlVmFsaWRhdGlvbjogdHJ1ZSxcblx0XHRcdGRlcGVuZGVuY2llczoge1xuXHRcdFx0XHRtaW5VSTVWZXJzaW9uOiBcIiR7c2FwLnVpNS5jb3JlLnZlcnNpb259XCIsXG5cdFx0XHRcdGxpYnM6IHtcblx0XHRcdFx0XHRcInNhcC5mXCI6IHt9LFxuXHRcdFx0XHRcdFwic2FwLmZlLm1hY3Jvc1wiOiB7XG5cdFx0XHRcdFx0XHRsYXp5OiB0cnVlXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcInNhcC5tXCI6IHt9LFxuXHRcdFx0XHRcdFwic2FwLnN1aXRlLnVpLm1pY3JvY2hhcnRcIjoge1xuXHRcdFx0XHRcdFx0bGF6eTogdHJ1ZVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJzYXAudWkuY29yZVwiOiB7fSxcblx0XHRcdFx0XHRcInNhcC51aS5sYXlvdXRcIjoge30sXG5cdFx0XHRcdFx0XCJzYXAudWkubWRjXCI6IHt9LFxuXHRcdFx0XHRcdFwic2FwLnVzaGVsbFwiOiB7XG5cdFx0XHRcdFx0XHRsYXp5OiB0cnVlXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcInNhcC51aS5mbFwiOiB7fVxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0Y29udGVudERlbnNpdGllczoge1xuXHRcdFx0XHRjb21wYWN0OiB0cnVlLFxuXHRcdFx0XHRjb3p5OiB0cnVlXG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRsaWJyYXJ5OiBcInNhcC5mZS50ZW1wbGF0ZXNcIlxufSlcbmNsYXNzIExpc3RCYXNlZENvbXBvbmVudCBleHRlbmRzIFRlbXBsYXRlQ29tcG9uZW50IHtcblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcInNhcC5mZS5jb3JlLkluaXRpYWxMb2FkTW9kZVwiLFxuXHRcdGRlZmF1bHRWYWx1ZTogSW5pdGlhbExvYWRNb2RlLkF1dG9cblx0fSlcblx0aW5pdGlhbExvYWQhOiB0eXBlb2YgSW5pdGlhbExvYWRNb2RlO1xuXG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJzYXAuZmUuY29yZS5WYXJpYW50TWFuYWdlbWVudFwiLFxuXHRcdGRlZmF1bHRWYWx1ZTogVmFyaWFudE1hbmFnZW1lbnQuUGFnZVxuXHR9KVxuXHR2YXJpYW50TWFuYWdlbWVudCE6IHR5cGVvZiBWYXJpYW50TWFuYWdlbWVudDtcblxuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0ZGVmYXVsdFZhbHVlOiB1bmRlZmluZWRcblx0fSlcblx0ZGVmYXVsdFRlbXBsYXRlQW5ub3RhdGlvblBhdGghOiBzdHJpbmc7XG5cblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRkZWZhdWx0VmFsdWU6IGZhbHNlXG5cdH0pXG5cdGxpdmVNb2RlITogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgTGlzdEJhc2VkQ29tcG9uZW50O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7O0VBR0EsTUFBTUEsaUJBQWlCLEdBQUdDLFdBQVcsQ0FBQ0QsaUJBQWlCO0lBQ3RERSxlQUFlLEdBQUdELFdBQVcsQ0FBQ0MsZUFBZTtFQUFDLElBZ0Z6Q0Msa0JBQWtCLFdBOUV2QkMsY0FBYyxDQUFDLGdDQUFnQyxFQUFFO0lBQ2pEQyxRQUFRLEVBQUU7TUFDVCxRQUFRLEVBQUU7UUFDVEMsVUFBVSxFQUFFLEtBQUs7UUFDakJDLFdBQVcsRUFBRTtVQUNaQyxPQUFPLEVBQUUsSUFBSTtVQUNiQyxNQUFNLEVBQUUsSUFBSTtVQUNaQyxLQUFLLEVBQUU7UUFDUixDQUFDO1FBQ0RDLGVBQWUsRUFBRSxDQUFDLGFBQWEsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixFQUFFLGdCQUFnQjtNQUNqSCxDQUFDO01BQ0QsU0FBUyxFQUFFO1FBQ1ZDLFFBQVEsRUFBRTtVQUNUQyxvQkFBb0IsRUFBRTtZQUNyQkMsV0FBVyxFQUFFLDJDQUEyQztZQUN4REMsT0FBTyxFQUFFLFNBQVM7WUFDbEJDLFFBQVEsRUFBRTtjQUNUQyxRQUFRLEVBQUUsd0NBQXdDO2NBQ2xEQyxhQUFhLEVBQUUsWUFBWTtjQUMzQkMsYUFBYSxFQUFFO1lBQ2hCO1VBQ0QsQ0FBQztVQUNEQyxxQkFBcUIsRUFBRTtZQUN0Qk4sV0FBVyxFQUFFLDRDQUE0QztZQUN6REMsT0FBTyxFQUFFO1VBQ1Y7UUFDRCxDQUFDO1FBQ0RNLFFBQVEsRUFBRTtVQUNUQyxNQUFNLEVBQUU7WUFDUEMsSUFBSSxFQUFFLFFBQVE7WUFDZEMsUUFBUSxFQUFFO1VBQ1gsQ0FBQztVQUNEQyxXQUFXLEVBQUU7WUFDWkYsSUFBSSxFQUFFLGFBQWE7WUFDbkJDLFFBQVEsRUFBRTtVQUNYLENBQUM7VUFDREUsYUFBYSxFQUFFO1lBQ2RILElBQUksRUFBRSxlQUFlO1lBQ3JCQyxRQUFRLEVBQUU7VUFDWCxDQUFDO1VBQ0RHLEtBQUssRUFBRTtZQUNOSixJQUFJLEVBQUUsT0FBTztZQUNiQyxRQUFRLEVBQUU7VUFDWCxDQUFDO1VBQ0RJLGVBQWUsRUFBRTtZQUNoQkwsSUFBSSxFQUFFLGlCQUFpQjtZQUN2QkMsUUFBUSxFQUFFO1VBQ1g7UUFDRCxDQUFDO1FBQ0RLLGdCQUFnQixFQUFFLElBQUk7UUFDdEJDLFlBQVksRUFBRTtVQUNiQyxhQUFhLEVBQUUseUJBQXlCO1VBQ3hDQyxJQUFJLEVBQUU7WUFDTCxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ1gsZUFBZSxFQUFFO2NBQ2hCQyxJQUFJLEVBQUU7WUFDUCxDQUFDO1lBQ0QsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNYLHlCQUF5QixFQUFFO2NBQzFCQSxJQUFJLEVBQUU7WUFDUCxDQUFDO1lBQ0QsYUFBYSxFQUFFLENBQUMsQ0FBQztZQUNqQixlQUFlLEVBQUUsQ0FBQyxDQUFDO1lBQ25CLFlBQVksRUFBRSxDQUFDLENBQUM7WUFDaEIsWUFBWSxFQUFFO2NBQ2JBLElBQUksRUFBRTtZQUNQLENBQUM7WUFDRCxXQUFXLEVBQUUsQ0FBQztVQUNmO1FBQ0QsQ0FBQztRQUNEQyxnQkFBZ0IsRUFBRTtVQUNqQkMsT0FBTyxFQUFFLElBQUk7VUFDYkMsSUFBSSxFQUFFO1FBQ1A7TUFDRDtJQUNELENBQUM7SUFDREMsT0FBTyxFQUFFO0VBQ1YsQ0FBQyxDQUFDLFVBRUFDLFFBQVEsQ0FBQztJQUNUQyxJQUFJLEVBQUUsNkJBQTZCO0lBQ25DQyxZQUFZLEVBQUV0QyxlQUFlLENBQUN1QztFQUMvQixDQUFDLENBQUMsVUFHREgsUUFBUSxDQUFDO0lBQ1RDLElBQUksRUFBRSwrQkFBK0I7SUFDckNDLFlBQVksRUFBRXhDLGlCQUFpQixDQUFDMEM7RUFDakMsQ0FBQyxDQUFDLFVBR0RKLFFBQVEsQ0FBQztJQUNUQyxJQUFJLEVBQUUsUUFBUTtJQUNkQyxZQUFZLEVBQUVHO0VBQ2YsQ0FBQyxDQUFDLFVBR0RMLFFBQVEsQ0FBQztJQUNUQyxJQUFJLEVBQUUsU0FBUztJQUNmQyxZQUFZLEVBQUU7RUFDZixDQUFDLENBQUM7SUFBQTtJQUFBO01BQUE7TUFBQTtRQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7SUFBQTtJQUFBO0VBQUEsRUF0QjhCSSxpQkFBaUI7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0VBQUEsT0EwQm5DekMsa0JBQWtCO0FBQUEifQ==