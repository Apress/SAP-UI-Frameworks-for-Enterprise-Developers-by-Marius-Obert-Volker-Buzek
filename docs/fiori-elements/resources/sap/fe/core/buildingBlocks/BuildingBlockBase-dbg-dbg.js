/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/util/deepClone", "sap/base/util/merge", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/converters/ConverterContext", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/StableIdHelper"], function (deepClone, merge, BuildingBlockTemplateProcessor, ConverterContext, BindingToolkit, StableIdHelper) {
  "use strict";

  var _exports = {};
  var generate = StableIdHelper.generate;
  var isUndefinedExpression = BindingToolkit.isUndefinedExpression;
  var xml = BuildingBlockTemplateProcessor.xml;
  var unregisterBuildingBlock = BuildingBlockTemplateProcessor.unregisterBuildingBlock;
  var registerBuildingBlock = BuildingBlockTemplateProcessor.registerBuildingBlock;
  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  /**
   * Base class for building blocks
   */
  let BuildingBlockBase = /*#__PURE__*/function () {
    function BuildingBlockBase(props, _controlConfiguration, _visitorSettings) {
      var _visitorSettings$mode;
      this.isPublic = false;
      this.getConverterContext = function (dataModelObjectPath, contextPath, settings, extraParams) {
        var _settings$models$view;
        const appComponent = settings.appComponent;
        const originalViewData = (_settings$models$view = settings.models.viewData) === null || _settings$models$view === void 0 ? void 0 : _settings$models$view.getData();
        let viewData = Object.assign({}, originalViewData);
        delete viewData.resourceModel;
        delete viewData.appComponent;
        viewData = deepClone(viewData);
        viewData.controlConfiguration = merge(viewData.controlConfiguration, extraParams || {});
        return ConverterContext.createConverterContextForMacro(dataModelObjectPath.startingEntitySet.name, settings.models.metaModel, appComponent === null || appComponent === void 0 ? void 0 : appComponent.getDiagnostics(), merge, dataModelObjectPath.contextLocation, viewData);
      };
      Object.keys(props).forEach(propName => {
        this[propName] = props[propName];
      });
      this.resourceModel = _visitorSettings === null || _visitorSettings === void 0 ? void 0 : (_visitorSettings$mode = _visitorSettings.models) === null || _visitorSettings$mode === void 0 ? void 0 : _visitorSettings$mode["sap.fe.i18n"];
    }

    /**
     * Only used internally
     *
     * @private
     */
    _exports = BuildingBlockBase;
    var _proto = BuildingBlockBase.prototype;
    /**
     * Convert the given local element ID to a globally unique ID by prefixing with the Building Block ID.
     *
     * @param stringParts
     * @returns Either the global ID or undefined if the Building Block doesn't have an ID
     * @private
     */
    _proto.createId = function createId() {
      // If the child instance has an ID property use it otherwise return undefined
      if (this.id) {
        for (var _len = arguments.length, stringParts = new Array(_len), _key = 0; _key < _len; _key++) {
          stringParts[_key] = arguments[_key];
        }
        return generate([this.id, ...stringParts]);
      }
      return undefined;
    }

    /**
     * Get the ID of the content control.
     *
     * @param buildingBlockId
     * @returns Return the ID
     * @private
     */;
    _proto.getContentId = function getContentId(buildingBlockId) {
      return `${buildingBlockId}-content`;
    }

    /**
     * Returns translated text for a given resource key.
     *
     * @param textID ID of the Text
     * @param parameters Array of parameters that are used to create the text
     * @param metaPath Entity set name or action name to overload a text
     * @returns Determined text
     */;
    _proto.getTranslatedText = function getTranslatedText(textID, parameters, metaPath) {
      var _this$resourceModel;
      return ((_this$resourceModel = this.resourceModel) === null || _this$resourceModel === void 0 ? void 0 : _this$resourceModel.getText(textID, parameters, metaPath)) || textID;
    };
    /**
     * Only used internally.
     *
     * @returns All the properties defined on the object with their values
     * @private
     */
    _proto.getProperties = function getProperties() {
      const allProperties = {};
      for (const oInstanceKey in this) {
        if (this.hasOwnProperty(oInstanceKey)) {
          allProperties[oInstanceKey] = this[oInstanceKey];
        }
      }
      return allProperties;
    };
    BuildingBlockBase.register = function register() {
      registerBuildingBlock(this);
    };
    BuildingBlockBase.unregister = function unregister() {
      unregisterBuildingBlock(this);
    }

    /**
     * Add a part of string based on the condition.
     *
     * @param condition
     * @param partToAdd
     * @returns The part to add if the condition is true, otherwise an empty string
     * @private
     */;
    _proto.addConditionally = function addConditionally(condition, partToAdd) {
      if (condition) {
        return partToAdd;
      } else {
        return "";
      }
    }

    /**
     * Add an attribute depending on the current value of the property.
     * If it's undefined the attribute is not added.
     *
     * @param attributeName
     * @param value
     * @returns The attribute to add if the value is not undefined, otherwise an empty string
     * @private
     */;
    _proto.attr = function attr(attributeName, value) {
      if (value !== undefined && !isUndefinedExpression(value)) {
        return () => xml`${attributeName}="${value}"`;
      } else {
        return () => "";
      }
    };
    _createClass(BuildingBlockBase, null, [{
      key: "metadata",
      get: function () {
        // We need to store the metadata on the actual subclass, not on BuildingBlockBase
        this.internalMetadata ??= {
          namespace: "",
          name: "",
          properties: {},
          aggregations: {},
          stereotype: "xmlmacro"
        };
        return this.internalMetadata;
      }
    }]);
    return BuildingBlockBase;
  }();
  BuildingBlockBase.isRuntime = false;
  _exports = BuildingBlockBase;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCdWlsZGluZ0Jsb2NrQmFzZSIsInByb3BzIiwiX2NvbnRyb2xDb25maWd1cmF0aW9uIiwiX3Zpc2l0b3JTZXR0aW5ncyIsImlzUHVibGljIiwiZ2V0Q29udmVydGVyQ29udGV4dCIsImRhdGFNb2RlbE9iamVjdFBhdGgiLCJjb250ZXh0UGF0aCIsInNldHRpbmdzIiwiZXh0cmFQYXJhbXMiLCJhcHBDb21wb25lbnQiLCJvcmlnaW5hbFZpZXdEYXRhIiwibW9kZWxzIiwidmlld0RhdGEiLCJnZXREYXRhIiwiT2JqZWN0IiwiYXNzaWduIiwicmVzb3VyY2VNb2RlbCIsImRlZXBDbG9uZSIsImNvbnRyb2xDb25maWd1cmF0aW9uIiwibWVyZ2UiLCJDb252ZXJ0ZXJDb250ZXh0IiwiY3JlYXRlQ29udmVydGVyQ29udGV4dEZvck1hY3JvIiwic3RhcnRpbmdFbnRpdHlTZXQiLCJuYW1lIiwibWV0YU1vZGVsIiwiZ2V0RGlhZ25vc3RpY3MiLCJjb250ZXh0TG9jYXRpb24iLCJrZXlzIiwiZm9yRWFjaCIsInByb3BOYW1lIiwiY3JlYXRlSWQiLCJpZCIsInN0cmluZ1BhcnRzIiwiZ2VuZXJhdGUiLCJ1bmRlZmluZWQiLCJnZXRDb250ZW50SWQiLCJidWlsZGluZ0Jsb2NrSWQiLCJnZXRUcmFuc2xhdGVkVGV4dCIsInRleHRJRCIsInBhcmFtZXRlcnMiLCJtZXRhUGF0aCIsImdldFRleHQiLCJnZXRQcm9wZXJ0aWVzIiwiYWxsUHJvcGVydGllcyIsIm9JbnN0YW5jZUtleSIsImhhc093blByb3BlcnR5IiwicmVnaXN0ZXIiLCJyZWdpc3RlckJ1aWxkaW5nQmxvY2siLCJ1bnJlZ2lzdGVyIiwidW5yZWdpc3RlckJ1aWxkaW5nQmxvY2siLCJhZGRDb25kaXRpb25hbGx5IiwiY29uZGl0aW9uIiwicGFydFRvQWRkIiwiYXR0ciIsImF0dHJpYnV0ZU5hbWUiLCJ2YWx1ZSIsImlzVW5kZWZpbmVkRXhwcmVzc2lvbiIsInhtbCIsImludGVybmFsTWV0YWRhdGEiLCJuYW1lc3BhY2UiLCJwcm9wZXJ0aWVzIiwiYWdncmVnYXRpb25zIiwic3RlcmVvdHlwZSIsImlzUnVudGltZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQnVpbGRpbmdCbG9ja0Jhc2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGRlZXBDbG9uZSBmcm9tIFwic2FwL2Jhc2UvdXRpbC9kZWVwQ2xvbmVcIjtcbmltcG9ydCBtZXJnZSBmcm9tIFwic2FwL2Jhc2UvdXRpbC9tZXJnZVwiO1xuaW1wb3J0IHR5cGUgeyBCdWlsZGluZ0Jsb2NrTWV0YWRhdGEsIE9iamVjdFZhbHVlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tTdXBwb3J0XCI7XG5pbXBvcnQgdHlwZSB7IFRlbXBsYXRlUHJvY2Vzc29yU2V0dGluZ3MsIFhNTFByb2Nlc3NvclR5cGVWYWx1ZSB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrVGVtcGxhdGVQcm9jZXNzb3JcIjtcbmltcG9ydCB7IHJlZ2lzdGVyQnVpbGRpbmdCbG9jaywgdW5yZWdpc3RlckJ1aWxkaW5nQmxvY2ssIHhtbCB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrVGVtcGxhdGVQcm9jZXNzb3JcIjtcbmltcG9ydCBDb252ZXJ0ZXJDb250ZXh0IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL0NvbnZlcnRlckNvbnRleHRcIjtcbmltcG9ydCB7IGlzVW5kZWZpbmVkRXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBSZXNvdXJjZU1vZGVsIGZyb20gXCJzYXAvZmUvY29yZS9SZXNvdXJjZU1vZGVsXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFNb2RlbE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgYnVpbGRpbmcgYmxvY2tzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJ1aWxkaW5nQmxvY2tCYXNlIHtcblx0cHJpdmF0ZSBzdGF0aWMgaW50ZXJuYWxNZXRhZGF0YTogQnVpbGRpbmdCbG9ja01ldGFkYXRhO1xuXG5cdHB1YmxpYyBzdGF0aWMgZ2V0IG1ldGFkYXRhKCk6IEJ1aWxkaW5nQmxvY2tNZXRhZGF0YSB7XG5cdFx0Ly8gV2UgbmVlZCB0byBzdG9yZSB0aGUgbWV0YWRhdGEgb24gdGhlIGFjdHVhbCBzdWJjbGFzcywgbm90IG9uIEJ1aWxkaW5nQmxvY2tCYXNlXG5cdFx0dGhpcy5pbnRlcm5hbE1ldGFkYXRhID8/PSB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiXCIsXG5cdFx0XHRuYW1lOiBcIlwiLFxuXHRcdFx0cHJvcGVydGllczoge30sXG5cdFx0XHRhZ2dyZWdhdGlvbnM6IHt9LFxuXHRcdFx0c3RlcmVvdHlwZTogXCJ4bWxtYWNyb1wiXG5cdFx0fTtcblx0XHRyZXR1cm4gdGhpcy5pbnRlcm5hbE1ldGFkYXRhO1xuXHR9XG5cblx0cHVibGljIHN0YXRpYyByZWFkb25seSBpc1J1bnRpbWU6IGJvb2xlYW4gPSBmYWxzZTtcblxuXHRwcm90ZWN0ZWQgaXNQdWJsaWMgPSBmYWxzZTtcblxuXHRwcml2YXRlIHJlc291cmNlTW9kZWw/OiBSZXNvdXJjZU1vZGVsO1xuXG5cdHByb3RlY3RlZCBpZD86IHN0cmluZztcblxuXHRjb25zdHJ1Y3Rvcihwcm9wczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIF9jb250cm9sQ29uZmlndXJhdGlvbj86IHVua25vd24sIF92aXNpdG9yU2V0dGluZ3M/OiBUZW1wbGF0ZVByb2Nlc3NvclNldHRpbmdzKSB7XG5cdFx0T2JqZWN0LmtleXMocHJvcHMpLmZvckVhY2goKHByb3BOYW1lKSA9PiB7XG5cdFx0XHR0aGlzW3Byb3BOYW1lIGFzIGtleW9mIHRoaXNdID0gcHJvcHNbcHJvcE5hbWVdIGFzIG5ldmVyO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5yZXNvdXJjZU1vZGVsID0gX3Zpc2l0b3JTZXR0aW5ncz8ubW9kZWxzPy5bXCJzYXAuZmUuaTE4blwiXTtcblx0fVxuXG5cdC8qKlxuXHQgKiBPbmx5IHVzZWQgaW50ZXJuYWxseVxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHVibGljIGdldFRlbXBsYXRlPyhvTm9kZT86IEVsZW1lbnQpOiBzdHJpbmcgfCBQcm9taXNlPHN0cmluZyB8IHVuZGVmaW5lZD4gfCB1bmRlZmluZWQ7XG5cblx0LyoqXG5cdCAqIENvbnZlcnQgdGhlIGdpdmVuIGxvY2FsIGVsZW1lbnQgSUQgdG8gYSBnbG9iYWxseSB1bmlxdWUgSUQgYnkgcHJlZml4aW5nIHdpdGggdGhlIEJ1aWxkaW5nIEJsb2NrIElELlxuXHQgKlxuXHQgKiBAcGFyYW0gc3RyaW5nUGFydHNcblx0ICogQHJldHVybnMgRWl0aGVyIHRoZSBnbG9iYWwgSUQgb3IgdW5kZWZpbmVkIGlmIHRoZSBCdWlsZGluZyBCbG9jayBkb2Vzbid0IGhhdmUgYW4gSURcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHByb3RlY3RlZCBjcmVhdGVJZCguLi5zdHJpbmdQYXJ0czogc3RyaW5nW10pIHtcblx0XHQvLyBJZiB0aGUgY2hpbGQgaW5zdGFuY2UgaGFzIGFuIElEIHByb3BlcnR5IHVzZSBpdCBvdGhlcndpc2UgcmV0dXJuIHVuZGVmaW5lZFxuXHRcdGlmICh0aGlzLmlkKSB7XG5cdFx0XHRyZXR1cm4gZ2VuZXJhdGUoW3RoaXMuaWQsIC4uLnN0cmluZ1BhcnRzXSk7XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IHRoZSBJRCBvZiB0aGUgY29udGVudCBjb250cm9sLlxuXHQgKlxuXHQgKiBAcGFyYW0gYnVpbGRpbmdCbG9ja0lkXG5cdCAqIEByZXR1cm5zIFJldHVybiB0aGUgSURcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHByb3RlY3RlZCBnZXRDb250ZW50SWQoYnVpbGRpbmdCbG9ja0lkOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gYCR7YnVpbGRpbmdCbG9ja0lkfS1jb250ZW50YDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRyYW5zbGF0ZWQgdGV4dCBmb3IgYSBnaXZlbiByZXNvdXJjZSBrZXkuXG5cdCAqXG5cdCAqIEBwYXJhbSB0ZXh0SUQgSUQgb2YgdGhlIFRleHRcblx0ICogQHBhcmFtIHBhcmFtZXRlcnMgQXJyYXkgb2YgcGFyYW1ldGVycyB0aGF0IGFyZSB1c2VkIHRvIGNyZWF0ZSB0aGUgdGV4dFxuXHQgKiBAcGFyYW0gbWV0YVBhdGggRW50aXR5IHNldCBuYW1lIG9yIGFjdGlvbiBuYW1lIHRvIG92ZXJsb2FkIGEgdGV4dFxuXHQgKiBAcmV0dXJucyBEZXRlcm1pbmVkIHRleHRcblx0ICovXG5cdGdldFRyYW5zbGF0ZWRUZXh0KHRleHRJRDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogdW5rbm93bltdLCBtZXRhUGF0aD86IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMucmVzb3VyY2VNb2RlbD8uZ2V0VGV4dCh0ZXh0SUQsIHBhcmFtZXRlcnMsIG1ldGFQYXRoKSB8fCB0ZXh0SUQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgZ2V0Q29udmVydGVyQ29udGV4dCA9IGZ1bmN0aW9uIChcblx0XHRkYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRcdGNvbnRleHRQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQsXG5cdFx0c2V0dGluZ3M6IFRlbXBsYXRlUHJvY2Vzc29yU2V0dGluZ3MsXG5cdFx0ZXh0cmFQYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPlxuXHQpIHtcblx0XHRjb25zdCBhcHBDb21wb25lbnQgPSBzZXR0aW5ncy5hcHBDb21wb25lbnQ7XG5cdFx0Y29uc3Qgb3JpZ2luYWxWaWV3RGF0YSA9IHNldHRpbmdzLm1vZGVscy52aWV3RGF0YT8uZ2V0RGF0YSgpO1xuXHRcdGxldCB2aWV3RGF0YSA9IE9iamVjdC5hc3NpZ24oe30sIG9yaWdpbmFsVmlld0RhdGEpO1xuXHRcdGRlbGV0ZSB2aWV3RGF0YS5yZXNvdXJjZU1vZGVsO1xuXHRcdGRlbGV0ZSB2aWV3RGF0YS5hcHBDb21wb25lbnQ7XG5cdFx0dmlld0RhdGEgPSBkZWVwQ2xvbmUodmlld0RhdGEpO1xuXHRcdHZpZXdEYXRhLmNvbnRyb2xDb25maWd1cmF0aW9uID0gbWVyZ2Uodmlld0RhdGEuY29udHJvbENvbmZpZ3VyYXRpb24sIGV4dHJhUGFyYW1zIHx8IHt9KTtcblx0XHRyZXR1cm4gQ29udmVydGVyQ29udGV4dC5jcmVhdGVDb252ZXJ0ZXJDb250ZXh0Rm9yTWFjcm8oXG5cdFx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLnN0YXJ0aW5nRW50aXR5U2V0Lm5hbWUsXG5cdFx0XHRzZXR0aW5ncy5tb2RlbHMubWV0YU1vZGVsLFxuXHRcdFx0YXBwQ29tcG9uZW50Py5nZXREaWFnbm9zdGljcygpLFxuXHRcdFx0bWVyZ2UsXG5cdFx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLmNvbnRleHRMb2NhdGlvbixcblx0XHRcdHZpZXdEYXRhXG5cdFx0KTtcblx0fTtcblxuXHQvKipcblx0ICogT25seSB1c2VkIGludGVybmFsbHkuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEFsbCB0aGUgcHJvcGVydGllcyBkZWZpbmVkIG9uIHRoZSBvYmplY3Qgd2l0aCB0aGVpciB2YWx1ZXNcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHB1YmxpYyBnZXRQcm9wZXJ0aWVzKCkge1xuXHRcdGNvbnN0IGFsbFByb3BlcnRpZXM6IFJlY29yZDxzdHJpbmcsIE9iamVjdFZhbHVlPiA9IHt9O1xuXHRcdGZvciAoY29uc3Qgb0luc3RhbmNlS2V5IGluIHRoaXMpIHtcblx0XHRcdGlmICh0aGlzLmhhc093blByb3BlcnR5KG9JbnN0YW5jZUtleSkpIHtcblx0XHRcdFx0YWxsUHJvcGVydGllc1tvSW5zdGFuY2VLZXldID0gdGhpc1tvSW5zdGFuY2VLZXldIGFzIHVua25vd24gYXMgT2JqZWN0VmFsdWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBhbGxQcm9wZXJ0aWVzO1xuXHR9XG5cblx0c3RhdGljIHJlZ2lzdGVyKCkge1xuXHRcdHJlZ2lzdGVyQnVpbGRpbmdCbG9jayh0aGlzKTtcblx0fVxuXG5cdHN0YXRpYyB1bnJlZ2lzdGVyKCkge1xuXHRcdHVucmVnaXN0ZXJCdWlsZGluZ0Jsb2NrKHRoaXMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZCBhIHBhcnQgb2Ygc3RyaW5nIGJhc2VkIG9uIHRoZSBjb25kaXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBjb25kaXRpb25cblx0ICogQHBhcmFtIHBhcnRUb0FkZFxuXHQgKiBAcmV0dXJucyBUaGUgcGFydCB0byBhZGQgaWYgdGhlIGNvbmRpdGlvbiBpcyB0cnVlLCBvdGhlcndpc2UgYW4gZW1wdHkgc3RyaW5nXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwcm90ZWN0ZWQgYWRkQ29uZGl0aW9uYWxseShjb25kaXRpb246IGJvb2xlYW4sIHBhcnRUb0FkZDogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRpZiAoY29uZGl0aW9uKSB7XG5cdFx0XHRyZXR1cm4gcGFydFRvQWRkO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gXCJcIjtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQWRkIGFuIGF0dHJpYnV0ZSBkZXBlbmRpbmcgb24gdGhlIGN1cnJlbnQgdmFsdWUgb2YgdGhlIHByb3BlcnR5LlxuXHQgKiBJZiBpdCdzIHVuZGVmaW5lZCB0aGUgYXR0cmlidXRlIGlzIG5vdCBhZGRlZC5cblx0ICpcblx0ICogQHBhcmFtIGF0dHJpYnV0ZU5hbWVcblx0ICogQHBhcmFtIHZhbHVlXG5cdCAqIEByZXR1cm5zIFRoZSBhdHRyaWJ1dGUgdG8gYWRkIGlmIHRoZSB2YWx1ZSBpcyBub3QgdW5kZWZpbmVkLCBvdGhlcndpc2UgYW4gZW1wdHkgc3RyaW5nXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwcm90ZWN0ZWQgYXR0cihhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsIHZhbHVlPzogWE1MUHJvY2Vzc29yVHlwZVZhbHVlKTogKCkgPT4gc3RyaW5nIHtcblx0XHRpZiAodmFsdWUgIT09IHVuZGVmaW5lZCAmJiAhaXNVbmRlZmluZWRFeHByZXNzaW9uKHZhbHVlKSkge1xuXHRcdFx0cmV0dXJuICgpID0+IHhtbGAke2F0dHJpYnV0ZU5hbWV9PVwiJHt2YWx1ZX1cImA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiAoKSA9PiBcIlwiO1xuXHRcdH1cblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7OztFQVdBO0FBQ0E7QUFDQTtFQUZBLElBR3FCQSxpQkFBaUI7SUF1QnJDLDJCQUFZQyxLQUE4QixFQUFFQyxxQkFBK0IsRUFBRUMsZ0JBQTRDLEVBQUU7TUFBQTtNQUFBLEtBTmpIQyxRQUFRLEdBQUcsS0FBSztNQUFBLEtBMkRoQkMsbUJBQW1CLEdBQUcsVUFDL0JDLG1CQUF3QyxFQUN4Q0MsV0FBK0IsRUFDL0JDLFFBQW1DLEVBQ25DQyxXQUFxQyxFQUNwQztRQUFBO1FBQ0QsTUFBTUMsWUFBWSxHQUFHRixRQUFRLENBQUNFLFlBQVk7UUFDMUMsTUFBTUMsZ0JBQWdCLDRCQUFHSCxRQUFRLENBQUNJLE1BQU0sQ0FBQ0MsUUFBUSwwREFBeEIsc0JBQTBCQyxPQUFPLEVBQUU7UUFDNUQsSUFBSUQsUUFBUSxHQUFHRSxNQUFNLENBQUNDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRUwsZ0JBQWdCLENBQUM7UUFDbEQsT0FBT0UsUUFBUSxDQUFDSSxhQUFhO1FBQzdCLE9BQU9KLFFBQVEsQ0FBQ0gsWUFBWTtRQUM1QkcsUUFBUSxHQUFHSyxTQUFTLENBQUNMLFFBQVEsQ0FBQztRQUM5QkEsUUFBUSxDQUFDTSxvQkFBb0IsR0FBR0MsS0FBSyxDQUFDUCxR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