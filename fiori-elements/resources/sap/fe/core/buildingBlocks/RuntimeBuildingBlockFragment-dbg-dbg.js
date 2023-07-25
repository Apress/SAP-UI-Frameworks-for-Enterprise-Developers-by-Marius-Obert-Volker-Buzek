/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/jsx-runtime/jsx", "sap/ui/base/ManagedObject", "sap/ui/core/Component", "sap/ui/core/Fragment"], function (CommonUtils, BindingToolkit, ClassSupport, jsx, ManagedObject, Component, Fragment) {
  "use strict";

  var _dec, _dec2, _class, _class2, _descriptor;
  var _exports = {};
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var resolveBindingString = BindingToolkit.resolveBindingString;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let RuntimeBuildingBlockFragment = (
  /**
   * Internal extension to the Fragment class in order to add some place to hold functions for runtime building blocks
   */
  _dec = defineUI5Class("sap.fe.core.buildingBlocks.RuntimeBuildingBlockFragment"), _dec2 = event(), _dec(_class = (_class2 = /*#__PURE__*/function (_Fragment) {
    _inheritsLoose(RuntimeBuildingBlockFragment, _Fragment);
    function RuntimeBuildingBlockFragment() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _Fragment.call(this, ...args) || this;
      _initializerDefineProperty(_this, "functionHolder", _descriptor, _assertThisInitialized(_this));
      return _this;
    }
    _exports = RuntimeBuildingBlockFragment;
    return RuntimeBuildingBlockFragment;
  }(Fragment), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "functionHolder", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = RuntimeBuildingBlockFragment;
  const RUNTIME_BLOCKS = {};
  /**
   * Stores the class of a runtime building block to be loaded whenever the building block is used at runtime.
   *
   * @param BuildingBlockClass
   */
  function storeRuntimeBlock(BuildingBlockClass) {
    RUNTIME_BLOCKS[`${BuildingBlockClass.metadata.namespace ?? BuildingBlockClass.metadata.publicNamespace}.${BuildingBlockClass.metadata.name}`] = BuildingBlockClass;
  }
  _exports.storeRuntimeBlock = storeRuntimeBlock;
  RuntimeBuildingBlockFragment.registerType("FE_COMPONENTS", {
    load: async function (mSettings) {
      return Promise.resolve(RUNTIME_BLOCKS[mSettings.fragmentName]);
    },
    init: function (mSettings) {
      var _mSettings$customData, _mSettings$customData2, _mSettings$customData3, _mSettings$customData4, _mSettings$containing, _mSettings$containing2, _mSettings$containing3, _mSettings$containing4, _feCustomData$functio, _feCustomData$propert;
      let BuildingBlockClass = mSettings.fragmentContent;
      if (BuildingBlockClass === undefined) {
        // In some case we might have been called here synchronously (unstash case for instance), which means we didn't go through the load function
        BuildingBlockClass = RUNTIME_BLOCKS[mSettings.fragmentName];
      }
      if (BuildingBlockClass === undefined) {
        throw new Error(`No building block class for runtime building block ${mSettings.fragmentName} found`);
      }
      const classSettings = {};
      const feCustomData = ((_mSettings$customData = mSettings.customData) === null || _mSettings$customData === void 0 ? void 0 : (_mSettings$customData2 = _mSettings$customData[0]) === null || _mSettings$customData2 === void 0 ? void 0 : (_mSettings$customData3 = _mSettings$customData2.mProperties) === null || _mSettings$customData3 === void 0 ? void 0 : (_mSettings$customData4 = _mSettings$customData3.value) === null || _mSettings$customData4 === void 0 ? void 0 : _mSettings$customData4["sap.fe.core.buildingBlocks"]) || {};
      delete mSettings.customData;
      const functionHolder = mSettings.functionHolder ?? [];
      delete mSettings.functionHolder;

      // containingView can also be a fragment, so we have to use the controller to be sure to get the actual view
      const containingView = ((_mSettings$containing = (_mSettings$containing2 = mSettings.containingView).getController) === null || _mSettings$containing === void 0 ? void 0 : (_mSettings$containing3 = (_mSettings$containing4 = _mSettings$containing.call(_mSettings$containing2)).getView) === null || _mSettings$containing3 === void 0 ? void 0 : _mSettings$containing3.call(_mSettings$containing4)) ?? mSettings.containingView;
      const pageComponent = Component.getOwnerComponentFor(containingView);
      const appComponent = CommonUtils.getAppComponent(containingView);
      const metaModel = appComponent.getMetaModel();
      const pageModel = pageComponent.getModel("_pageModel");
      const functionStringInOrder = (_feCustomData$functio = feCustomData.functionStringInOrder) === null || _feCustomData$functio === void 0 ? void 0 : _feCustomData$functio.split(",");
      const propertiesAssignedToFunction = (_feCustomData$propert = feCustomData.propertiesAssignedToFunction) === null || _feCustomData$propert === void 0 ? void 0 : _feCustomData$propert.split(",");
      for (const propertyName in BuildingBlockClass.metadata.properties) {
        const propertyMetadata = BuildingBlockClass.metadata.properties[propertyName];
        const pageModelContext = pageModel.createBindingContext(feCustomData[propertyName]);
        if (pageModelContext === null) {
          // value cannot be resolved, so it is either a runtime binding or a constant
          let value = feCustomData[propertyName];
          if (typeof value === "string") {
            if (propertyMetadata.bindable !== true) {
              // runtime bindings are not allowed, so convert strings into actual primitive types
              switch (propertyMetadata.type) {
                case "boolean":
                  value = value === "true";
                  break;
                case "number":
                  value = Number(value);
                  break;
              }
            } else {
              // runtime bindings are allowed, so resolve the values as BindingToolkit expressions
              value = resolveBindingString(value, propertyMetadata.type);
            }
          } else if (propertyMetadata.type === "function") {
            const functionIndex = propertiesAssignedToFunction.indexOf(propertyName);
            const functionString = functionStringInOrder[functionIndex];
            const targetFunction = functionHolder === null || functionHolder === void 0 ? void 0 : functionHolder.find(functionDef => {
              var _functionDef$;
              return ((_functionDef$ = functionDef[0]) === null || _functionDef$ === void 0 ? void 0 : _functionDef$._sapui_handlerName) === functionString;
            });
            // We use the _sapui_handlerName to identify which function is the one we want to bind here
            if (targetFunction && targetFunction.length > 1) {
              value = targetFunction[0].bind(targetFunction[1]);
            }
          }
          classSettings[propertyName] = value;
        } else if (pageModelContext.getObject() !== undefined) {
          // get value from page model
          classSettings[propertyName] = pageModelContext.getObject();
        } else {
          // bind to metamodel
          classSettings[propertyName] = metaModel.createBindingContext(feCustomData[propertyName]);
        }
      }
      return ManagedObject.runWithPreprocessors(() => {
        const renderedControl = jsx.withContext({
          view: containingView,
          appComponent: appComponent
        }, () => {
          var _getContent, _ref;
          const templateProcessingSettings = {
            models: {
              "sap.fe.i18n": containingView.getModel("sap.fe.i18n")
            }
          };
          return (_getContent = (_ref = new BuildingBlockClass(classSettings, {}, templateProcessingSettings)).getContent) === null || _getContent === void 0 ? void 0 : _getContent.call(_ref, containingView, appComponent);
        });
        if (!this._bAsync) {
          this._aContent = renderedControl;
        }
        return renderedControl;
      }, {
        id: function (sId) {
          return containingView.createId(sId);
        },
        settings: function (controlSettings) {
          const allAssociations = this.getMetadata().getAssociations();
          for (const associationDetailName of Object.keys(allAssociations)) {
            if (controlSettings[associationDetailName] !== undefined) {
              // The associated elements are indicated via local IDs; we need to change the references to global ones
              const associations = Array.isArray(controlSettings[associationDetailName]) ? controlSettings[associationDetailName] : [controlSettings[associationDetailName]];

              // Create global IDs for associations given as strings, not for already resolved ManagedObjects
              controlSettings[associationDetailName] = associations.map(association => typeof association === "string" ? mSettings.containingView.createId(association) : association);
            }
          }
          return controlSettings;
        }
      });
    }
  });
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSdW50aW1lQnVpbGRpbmdCbG9ja0ZyYWdtZW50IiwiZGVmaW5lVUk1Q2xhc3MiLCJldmVudCIsIkZyYWdtZW50IiwiUlVOVElNRV9CTE9DS1MiLCJzdG9yZVJ1bnRpbWVCbG9jayIsIkJ1aWxkaW5nQmxvY2tDbGFzcyIsIm1ldGFkYXRhIiwibmFtZXNwYWNlIiwicHVibGljTmFtZXNwYWNlIiwibmFtZSIsInJlZ2lzdGVyVHlwZSIsImxvYWQiLCJtU2V0dGluZ3MiLCJQcm9taXNlIiwicmVzb2x2ZSIsImZyYWdtZW50TmFtZSIsImluaXQiLCJmcmFnbWVudENvbnRlbnQiLCJ1bmRlZmluZWQiLCJFcnJvciIsImNsYXNzU2V0dGluZ3MiLCJmZUN1c3RvbURhdGEiLCJjdXN0b21EYXRhIiwibVByb3BlcnRpZXMiLCJ2YWx1ZSIsImZ1bmN0aW9uSG9sZGVyIiwiY29udGFpbmluZ1ZpZXciLCJnZXRDb250cm9sbGVyIiwiZ2V0VmlldyIsInBhZ2VDb21wb25lbnQiLCJDb21wb25lbnQiLCJnZXRPd25lckNvbXBvbmVudEZvciIsImFwcENvbXBvbmVudCIsIkNvbW1vblV0aWxzIiwiZ2V0QXBwQ29tcG9uZW50IiwibWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwicGFnZU1vZGVsIiwiZ2V0TW9kZWwiLCJmdW5jdGlvblN0cmluZ0luT3JkZXIiLCJzcGxpdCIsInByb3BlcnRpZXNBc3NpZ25lZFRvRnVuY3Rpb24iLCJwcm9wZXJ0eU5hbWUiLCJwcm9wZXJ0aWVzIiwicHJvcGVydHlNZXRhZGF0YSIsInBhZ2VNb2RlbENvbnRleHQiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImJpbmRhYmxlIiwidHlwZSIsIk51bWJlciIsInJlc29sdmVCaW5kaW5nU3RyaW5nIiwiZnVuY3Rpb25JbmRleCIsImluZGV4T2YiLCJmdW5jdGlvblN0cmluZyIsInRhcmdldEZ1bmN0aW9uIiwiZmluZCIsImZ1bmN0aW9uRGVmIiwiX3NhcHVpX2hhbmRsZXJOYW1lIiwibGVuZ3RoIiwiYmluZCIsImdldE9iamVjdCIsIk1hbmFnZWRPYmplY3QiLCJydW5XaXRoUHJlcHJvY2Vzc29ycyIsInJlbmRlcmVkQ29udHJvbCIsImpzeCIsIndpdGhDb250ZXh0IiwidmlldyIsInRlbXBsYXRlUHJvY2Vzc2luZ1NldHRpbmdzIiwibW9kZWxzIiwiZ2V0Q29udGVudCIsIl9iQXN5bmMiLCJfYUNvbnRlbnQiLCJpZCIsInNJZCIsImNyZWF0ZUlkIiwic2V0dGluZ3MiLCJjb250cm9sU2V0dGluZ3MiLCJhbGxBc3NvY2lhdGlvbnMiLCJnZXRNZXRhZGF0YSIsImdldEFzc29jaWF0aW9ucyIsImFzc29jaWF0aW9uRGV0YWlsTmFtZSIsIk9iamVjdCIsImtleXMiLCJhc3NvY2lhdGlvbnMiLCJBcnJheSIsImlzQXJyYXkiLCJtYXAiLCJhc3NvY2lhdGlvbiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiUnVudGltZUJ1aWxkaW5nQmxvY2tGcmFnbWVudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFRlbXBsYXRlUHJvY2Vzc29yU2V0dGluZ3MgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1RlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgdHlwZSBSdW50aW1lQnVpbGRpbmdCbG9jayBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvUnVudGltZUJ1aWxkaW5nQmxvY2tcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB0eXBlIHsgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IHJlc29sdmVCaW5kaW5nU3RyaW5nIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBldmVudCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IGpzeCBmcm9tIFwic2FwL2ZlL2NvcmUvanN4LXJ1bnRpbWUvanN4XCI7XG5pbXBvcnQgdHlwZSBSZXNvdXJjZU1vZGVsIGZyb20gXCJzYXAvZmUvY29yZS9SZXNvdXJjZU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBUZW1wbGF0ZUNvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvVGVtcGxhdGVDb21wb25lbnRcIjtcbmltcG9ydCBNYW5hZ2VkT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gXCJzYXAvdWkvY29yZS9Db21wb25lbnRcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBGcmFnbWVudCBmcm9tIFwic2FwL3VpL2NvcmUvRnJhZ21lbnRcIjtcbmltcG9ydCB0eXBlIFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9WaWV3XCI7XG5pbXBvcnQgdHlwZSB7IE1hbmFnZWRPYmplY3RFeCB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi8uLi8uLi90eXBlcy9leHRlbnNpb25fdHlwZXNcIjtcblxuLyoqXG4gKiBJbnRlcm5hbCBleHRlbnNpb24gdG8gdGhlIEZyYWdtZW50IGNsYXNzIGluIG9yZGVyIHRvIGFkZCBzb21lIHBsYWNlIHRvIGhvbGQgZnVuY3Rpb25zIGZvciBydW50aW1lIGJ1aWxkaW5nIGJsb2Nrc1xuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5idWlsZGluZ0Jsb2Nrcy5SdW50aW1lQnVpbGRpbmdCbG9ja0ZyYWdtZW50XCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSdW50aW1lQnVpbGRpbmdCbG9ja0ZyYWdtZW50IGV4dGVuZHMgRnJhZ21lbnQge1xuXHQvKlxuXHQgKiBFdmVudCB0byBob2xkIGFuZCByZXNvbHZlIGZ1bmN0aW9ucyBmb3IgcnVudGltZSBidWlsZGluZyBibG9ja3Ncblx0ICovXG5cdEBldmVudCgpXG5cdGZ1bmN0aW9uSG9sZGVyITogRnVuY3Rpb247XG59XG5cbnR5cGUgRnJhZ21lbnRDdXN0b21EYXRhID0ge1xuXHRtUHJvcGVydGllczoge1xuXHRcdHZhbHVlOiB7XG5cdFx0XHRcInNhcC5mZS5jb3JlLmJ1aWxkaW5nQmxvY2tzXCI/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuXHRcdH07XG5cdH07XG59O1xuXG50eXBlIEZFQ29tcG9uZW50RnJhZ21lbnRTZXR0aW5ncyA9IHtcblx0ZnJhZ21lbnROYW1lOiBzdHJpbmc7XG5cdGZyYWdtZW50Q29udGVudD86IHR5cGVvZiBSdW50aW1lQnVpbGRpbmdCbG9jaztcblx0Y29udGFpbmluZ1ZpZXc6IFZpZXc7XG5cdGN1c3RvbURhdGE/OiBGcmFnbWVudEN1c3RvbURhdGFbXTtcblx0ZnVuY3Rpb25Ib2xkZXI/OiBGdW5jdGlvbldpdGhIYW5kbGVyW11bXTtcbn07XG5cbnR5cGUgRnVuY3Rpb25XaXRoSGFuZGxlciA9IEZ1bmN0aW9uICYge1xuXHRfc2FwdWlfaGFuZGxlck5hbWU/OiBzdHJpbmc7XG59O1xudHlwZSBGcmFnbWVudFdpdGhJbnRlcm5hbHMgPSB7XG5cdF9iQXN5bmM6IGJvb2xlYW47XG5cdF9hQ29udGVudDogQ29udHJvbCB8IENvbnRyb2xbXTtcbn07XG5cbmNvbnN0IFJVTlRJTUVfQkxPQ0tTOiBSZWNvcmQ8c3RyaW5nLCB0eXBlb2YgUnVudGltZUJ1aWxkaW5nQmxvY2s+ID0ge307XG4vKipcbiAqIFN0b3JlcyB0aGUgY2xhc3Mgb2YgYSBydW50aW1lIGJ1aWxkaW5nIGJsb2NrIHRvIGJlIGxvYWRlZCB3aGVuZXZlciB0aGUgYnVpbGRpbmcgYmxvY2sgaXMgdXNlZCBhdCBydW50aW1lLlxuICpcbiAqIEBwYXJhbSBCdWlsZGluZ0Jsb2NrQ2xhc3NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0b3JlUnVudGltZUJsb2NrKEJ1aWxkaW5nQmxvY2tDbGFzczogdHlwZW9mIFJ1bnRpbWVCdWlsZGluZ0Jsb2NrKSB7XG5cdFJVTlRJTUVfQkxPQ0tTW1xuXHRcdGAke0J1aWxkaW5nQmxvY2tDbGFzcy5tZXRhZGF0YS5uYW1lc3BhY2UgPz8gQnVpbGRpbmdCbG9ja0NsYXNzLm1ldGFkYXRhLnB1YmxpY05hbWVzcGFjZX0uJHtCdWlsZGluZ0Jsb2NrQ2xhc3MubWV0YWRhdGEubmFtZX1gXG5cdF0gPSBCdWlsZGluZ0Jsb2NrQ2xhc3M7XG59XG5cblJ1bnRpbWVCdWlsZGluZ0Jsb2NrRnJhZ21lbnQucmVnaXN0ZXJUeXBlKFwiRkVfQ09NUE9ORU5UU1wiLCB7XG5cdGxvYWQ6IGFzeW5jIGZ1bmN0aW9uIChtU2V0dGluZ3M6IEZFQ29tcG9uZW50RnJhZ21lbnRTZXR0aW5ncykge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoUlVOVElNRV9CTE9DS1NbbVNldHRpbmdzLmZyYWdtZW50TmFtZV0pO1xuXHR9LFxuXHRpbml0OiBmdW5jdGlvbiAodGhpczogRnJhZ21lbnRXaXRoSW50ZXJuYWxzLCBtU2V0dGluZ3M6IEZFQ29tcG9uZW50RnJhZ21lbnRTZXR0aW5ncykge1xuXHRcdGxldCBCdWlsZGluZ0Jsb2NrQ2xhc3MgPSBtU2V0dGluZ3MuZnJhZ21lbnRDb250ZW50O1xuXHRcdGlmIChCdWlsZGluZ0Jsb2NrQ2xhc3MgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Ly8gSW4gc29tZSBjYXNlIHdlIG1pZ2h0IGhhdmUgYmVlbiBjYWxsZWQgaGVyZSBzeW5jaHJvbm91c2x5ICh1bnN0YXNoIGNhc2UgZm9yIGluc3RhbmNlKSwgd2hpY2ggbWVhbnMgd2UgZGlkbid0IGdvIHRocm91Z2ggdGhlIGxvYWQgZnVuY3Rpb25cblx0XHRcdEJ1aWxkaW5nQmxvY2tDbGFzcyA9IFJVTlRJTUVfQkxPQ0tTW21TZXR0aW5ncy5mcmFnbWVudE5hbWVdO1xuXHRcdH1cblx0XHRpZiAoQnVpbGRpbmdCbG9ja0NsYXNzID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgTm8gYnVpbGRpbmcgYmxvY2sgY2xhc3MgZm9yIHJ1bnRpbWUgYnVpbGRpbmcgYmxvY2sgJHttU2V0dGluZ3MuZnJhZ21lbnROYW1lfSBmb3VuZGApO1xuXHRcdH1cblxuXHRcdGNvbnN0IGNsYXNzU2V0dGluZ3M6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG5cdFx0Y29uc3QgZmVDdXN0b21EYXRhOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0gbVNldHRpbmdzLmN1c3RvbURhdGE/LlswXT8ubVByb3BlcnRpZXM/LnZhbHVlPy5bXCJzYXAuZmUuY29yZS5idWlsZGluZ0Jsb2Nrc1wiXSB8fCB7fTtcblx0XHRkZWxldGUgbVNldHRpbmdzLmN1c3RvbURhdGE7XG5cdFx0Y29uc3QgZnVuY3Rpb25Ib2xkZXI6IEZ1bmN0aW9uV2l0aEhhbmRsZXJbXVtdID0gbVNldHRpbmdzLmZ1bmN0aW9uSG9sZGVyID8/IFtdO1xuXHRcdGRlbGV0ZSBtU2V0dGluZ3MuZnVuY3Rpb25Ib2xkZXI7XG5cblx0XHQvLyBjb250YWluaW5nVmlldyBjYW4gYWxzbyBiZSBhIGZyYWdtZW50LCBzbyB3ZSBoYXZlIHRvIHVzZSB0aGUgY29udHJvbGxlciB0byBiZSBzdXJlIHRvIGdldCB0aGUgYWN0dWFsIHZpZXdcblx0XHRjb25zdCBjb250YWluaW5nVmlldyA9IG1TZXR0aW5ncy5jb250YWluaW5nVmlldy5nZXRDb250cm9sbGVyPy4oKS5nZXRWaWV3Py4oKSA/PyBtU2V0dGluZ3MuY29udGFpbmluZ1ZpZXc7XG5cdFx0Y29uc3QgcGFnZUNvbXBvbmVudCA9IENvbXBvbmVudC5nZXRPd25lckNvbXBvbmVudEZvcihjb250YWluaW5nVmlldykgYXMgVGVtcGxhdGVDb21wb25lbnQ7XG5cdFx0Y29uc3QgYXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KGNvbnRhaW5pbmdWaWV3KTtcblxuXHRcdGNvbnN0IG1ldGFNb2RlbCA9IGFwcENvbXBvbmVudC5nZXRNZXRhTW9kZWwoKTtcblx0XHRjb25zdCBwYWdlTW9kZWwgPSBwYWdlQ29tcG9uZW50LmdldE1vZGVsKFwiX3BhZ2VNb2RlbFwiKTtcblxuXHRcdGNvbnN0IGZ1bmN0aW9uU3RyaW5nSW5PcmRlcjogc3RyaW5nW10gfCB1bmRlZmluZWQgPSBmZUN1c3RvbURhdGEuZnVuY3Rpb25TdHJpbmdJbk9yZGVyPy5zcGxpdChcIixcIik7XG5cdFx0Y29uc3QgcHJvcGVydGllc0Fzc2lnbmVkVG9GdW5jdGlvbjogc3RyaW5nW10gfCB1bmRlZmluZWQgPSBmZUN1c3RvbURhdGEucHJvcGVydGllc0Fzc2lnbmVkVG9GdW5jdGlvbj8uc3BsaXQoXCIsXCIpO1xuXHRcdGZvciAoY29uc3QgcHJvcGVydHlOYW1lIGluIEJ1aWxkaW5nQmxvY2tDbGFzcy5tZXRhZGF0YS5wcm9wZXJ0aWVzKSB7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eU1ldGFkYXRhID0gQnVpbGRpbmdCbG9ja0NsYXNzLm1ldGFkYXRhLnByb3BlcnRpZXNbcHJvcGVydHlOYW1lXTtcblx0XHRcdGNvbnN0IHBhZ2VNb2RlbENvbnRleHQgPSBwYWdlTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoZmVDdXN0b21EYXRhW3Byb3BlcnR5TmFtZV0pO1xuXG5cdFx0XHRpZiAocGFnZU1vZGVsQ29udGV4dCA9PT0gbnVsbCkge1xuXHRcdFx0XHQvLyB2YWx1ZSBjYW5ub3QgYmUgcmVzb2x2ZWQsIHNvIGl0IGlzIGVpdGhlciBhIHJ1bnRpbWUgYmluZGluZyBvciBhIGNvbnN0YW50XG5cdFx0XHRcdGxldCB2YWx1ZTogc3RyaW5nIHwgYm9vbGVhbiB8IG51bWJlciB8IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmcgfCBib29sZWFuIHwgbnVtYmVyPiB8IHVuZGVmaW5lZCA9XG5cdFx0XHRcdFx0ZmVDdXN0b21EYXRhW3Byb3BlcnR5TmFtZV07XG5cblx0XHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdGlmIChwcm9wZXJ0eU1ldGFkYXRhLmJpbmRhYmxlICE9PSB0cnVlKSB7XG5cdFx0XHRcdFx0XHQvLyBydW50aW1lIGJpbmRpbmdzIGFyZSBub3QgYWxsb3dlZCwgc28gY29udmVydCBzdHJpbmdzIGludG8gYWN0dWFsIHByaW1pdGl2ZSB0eXBlc1xuXHRcdFx0XHRcdFx0c3dpdGNoIChwcm9wZXJ0eU1ldGFkYXRhLnR5cGUpIHtcblx0XHRcdFx0XHRcdFx0Y2FzZSBcImJvb2xlYW5cIjpcblx0XHRcdFx0XHRcdFx0XHR2YWx1ZSA9IHZhbHVlID09PSBcInRydWVcIjtcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0Y2FzZSBcIm51bWJlclwiOlxuXHRcdFx0XHRcdFx0XHRcdHZhbHVlID0gTnVtYmVyKHZhbHVlKTtcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly8gcnVudGltZSBiaW5kaW5ncyBhcmUgYWxsb3dlZCwgc28gcmVzb2x2ZSB0aGUgdmFsdWVzIGFzIEJpbmRpbmdUb29sa2l0IGV4cHJlc3Npb25zXG5cdFx0XHRcdFx0XHR2YWx1ZSA9IHJlc29sdmVCaW5kaW5nU3RyaW5nKHZhbHVlLCBwcm9wZXJ0eU1ldGFkYXRhLnR5cGUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmIChwcm9wZXJ0eU1ldGFkYXRhLnR5cGUgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdGNvbnN0IGZ1bmN0aW9uSW5kZXggPSBwcm9wZXJ0aWVzQXNzaWduZWRUb0Z1bmN0aW9uLmluZGV4T2YocHJvcGVydHlOYW1lKTtcblx0XHRcdFx0XHRjb25zdCBmdW5jdGlvblN0cmluZyA9IGZ1bmN0aW9uU3RyaW5nSW5PcmRlcltmdW5jdGlvbkluZGV4XTtcblx0XHRcdFx0XHRjb25zdCB0YXJnZXRGdW5jdGlvbiA9IGZ1bmN0aW9uSG9sZGVyPy5maW5kKChmdW5jdGlvbkRlZikgPT4gZnVuY3Rpb25EZWZbMF0/Ll9zYXB1aV9oYW5kbGVyTmFtZSA9PT0gZnVuY3Rpb25TdHJpbmcpO1xuXHRcdFx0XHRcdC8vIFdlIHVzZSB0aGUgX3NhcHVpX2hhbmRsZXJOYW1lIHRvIGlkZW50aWZ5IHdoaWNoIGZ1bmN0aW9uIGlzIHRoZSBvbmUgd2Ugd2FudCB0byBiaW5kIGhlcmVcblx0XHRcdFx0XHRpZiAodGFyZ2V0RnVuY3Rpb24gJiYgdGFyZ2V0RnVuY3Rpb24ubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdFx0dmFsdWUgPSB0YXJnZXRGdW5jdGlvblswXS5iaW5kKHRhcmdldEZ1bmN0aW9uWzFdKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjbGFzc1NldHRpbmdzW3Byb3BlcnR5TmFtZV0gPSB2YWx1ZTtcblx0XHRcdH0gZWxzZSBpZiAocGFnZU1vZGVsQ29udGV4dC5nZXRPYmplY3QoKSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdC8vIGdldCB2YWx1ZSBmcm9tIHBhZ2UgbW9kZWxcblx0XHRcdFx0Y2xhc3NTZXR0aW5nc1twcm9wZXJ0eU5hbWVdID0gcGFnZU1vZGVsQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIGJpbmQgdG8gbWV0YW1vZGVsXG5cdFx0XHRcdGNsYXNzU2V0dGluZ3NbcHJvcGVydHlOYW1lXSA9IG1ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChmZUN1c3RvbURhdGFbcHJvcGVydHlOYW1lXSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChNYW5hZ2VkT2JqZWN0IGFzIE1hbmFnZWRPYmplY3RFeCkucnVuV2l0aFByZXByb2Nlc3NvcnMoXG5cdFx0XHQoKSA9PiB7XG5cdFx0XHRcdGNvbnN0IHJlbmRlcmVkQ29udHJvbCA9IGpzeC53aXRoQ29udGV4dCh7IHZpZXc6IGNvbnRhaW5pbmdWaWV3LCBhcHBDb21wb25lbnQ6IGFwcENvbXBvbmVudCB9LCAoKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgdGVtcGxhdGVQcm9jZXNzaW5nU2V0dGluZ3MgPSB7XG5cdFx0XHRcdFx0XHRtb2RlbHM6IHtcblx0XHRcdFx0XHRcdFx0XCJzYXAuZmUuaTE4blwiOiBjb250YWluaW5nVmlldy5nZXRNb2RlbChcInNhcC5mZS5pMThuXCIpIGFzIFJlc291cmNlTW9kZWxcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGFzIFRlbXBsYXRlUHJvY2Vzc29yU2V0dGluZ3M7XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBCdWlsZGluZ0Jsb2NrQ2xhc3MhKGNsYXNzU2V0dGluZ3MsIHt9LCB0ZW1wbGF0ZVByb2Nlc3NpbmdTZXR0aW5ncykuZ2V0Q29udGVudD8uKFxuXHRcdFx0XHRcdFx0Y29udGFpbmluZ1ZpZXcsXG5cdFx0XHRcdFx0XHRhcHBDb21wb25lbnRcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKCF0aGlzLl9iQXN5bmMpIHtcblx0XHRcdFx0XHR0aGlzLl9hQ29udGVudCA9IHJlbmRlcmVkQ29udHJvbDtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gcmVuZGVyZWRDb250cm9sO1xuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0aWQ6IGZ1bmN0aW9uIChzSWQ6IHN0cmluZykge1xuXHRcdFx0XHRcdHJldHVybiBjb250YWluaW5nVmlldy5jcmVhdGVJZChzSWQpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRzZXR0aW5nczogZnVuY3Rpb24gKGNvbnRyb2xTZXR0aW5nczogUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgTWFuYWdlZE9iamVjdCB8IChzdHJpbmcgfCBNYW5hZ2VkT2JqZWN0KVtdPikge1xuXHRcdFx0XHRcdGNvbnN0IGFsbEFzc29jaWF0aW9ucyA9IHRoaXMuZ2V0TWV0YWRhdGEoKS5nZXRBc3NvY2lhdGlvbnMoKTtcblx0XHRcdFx0XHRmb3IgKGNvbnN0IGFzc29jaWF0aW9uRGV0YWlsTmFtZSBvZiBPYmplY3Qua2V5cyhhbGxBc3NvY2lhdGlvbnMpKSB7XG5cdFx0XHRcdFx0XHRpZiAoY29udHJvbFNldHRpbmdzW2Fzc29jaWF0aW9uRGV0YWlsTmFtZV0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHQvLyBUaGUgYXNzb2NpYXRlZCBlbGVtZW50cyBhcmUgaW5kaWNhdGVkIHZpYSBsb2NhbCBJRHM7IHdlIG5lZWQgdG8gY2hhbmdlIHRoZSByZWZlcmVuY2VzIHRvIGdsb2JhbCBvbmVzXG5cdFx0XHRcdFx0XHRcdGNvbnN0IGFzc29jaWF0aW9ucyA9IChcblx0XHRcdFx0XHRcdFx0XHRBcnJheS5pc0FycmF5KGNvbnRyb2xTZXR0aW5nc1thc3NvY2lhdGlvbkRldGFpbE5hbWVdKVxuXHRcdFx0XHRcdFx0XHRcdFx0PyBjb250cm9sU2V0dGluZ3NbYXNzb2NpYXRpb25EZXRhaWxOYW1lXVxuXHRcdFx0XHRcdFx0XHRcdFx0OiBbY29udHJvbFNldHRpbmdzW2Fzc29jaWF0aW9uRGV0YWlsTmFtZV1dXG5cdFx0XHRcdFx0XHRcdCkgYXMgKHN0cmluZyB8IE1hbmFnZWRPYmplY3QpW107XG5cblx0XHRcdFx0XHRcdFx0Ly8gQ3JlYXRlIGdsb2JhbCBJRHMgZm9yIGFzc29jaWF0aW9ucyBnaXZlbiBhcyBzdHJpbmdzLCBub3QgZm9yIGFscmVhZHkgcmVzb2x2ZWQgTWFuYWdlZE9iamVjdHNcblx0XHRcdFx0XHRcdFx0Y29udHJvbFNldHRpbmdzW2Fzc29jaWF0aW9uRGV0YWlsTmFtZV0gPSBhc3NvY2lhdGlvbnMubWFwKChhc3NvY2lhdGlvbjogc3RyaW5nIHwgTWFuYWdlZE9iamVjdCkgPT5cblx0XHRcdFx0XHRcdFx0XHR0eXBlb2YgYXNzb2NpYXRpb24gPT09IFwic3RyaW5nXCIgPyBtU2V0dGluZ3MuY29udGFpbmluZ1ZpZXcuY3JlYXRlSWQoYXNzb2NpYXRpb24pIDogYXNzb2NpYXRpb25cblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIGNvbnRyb2xTZXR0aW5ncztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdCk7XG5cdH1c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