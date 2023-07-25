/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/RuntimeBuildingBlock", "sap/fe/core/controls/CommandExecution", "sap/fe/core/converters/annotations/DataField", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/library", "sap/fe/core/templating/CriticalityFormatters", "sap/m/Button", "sap/fe/core/jsx-runtime/jsx"], function (BuildingBlockSupport, RuntimeBuildingBlock, CommandExecution, DataField, MetaModelConverter, library, CriticalityFormatters, Button, _jsx) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3;
  var _exports = {};
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var isActionWithDialog = DataField.isActionWithDialog;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let DataFieldForActionBlock = (_dec = defineBuildingBlock({
    name: "DataFieldForAction",
    namespace: "sap.fe.macros.actions"
  }), _dec2 = blockAttribute({
    type: "object",
    required: true
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true
  }), _dec4 = blockAttribute({
    type: "string",
    required: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_RuntimeBuildingBlock) {
    _inheritsLoose(DataFieldForActionBlock, _RuntimeBuildingBlock);
    function DataFieldForActionBlock() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _RuntimeBuildingBlock.call(this, ...args) || this;
      _initializerDefineProperty(_this, "action", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "id", _descriptor3, _assertThisInitialized(_this));
      return _this;
    }
    _exports = DataFieldForActionBlock;
    var _proto = DataFieldForActionBlock.prototype;
    _proto.getContent = function getContent(view) {
      const dataViewModelPath = getInvolvedDataModelObjects(this.contextPath);
      const odataMetaModel = this.contextPath.getModel();
      const annotationPath = this.action.annotationPath;
      if (annotationPath) {
        const annotationPathContext = odataMetaModel.getContext(annotationPath);
        const dataFieldContextModelPath = getInvolvedDataModelObjects(annotationPathContext);
        const dataFieldForAction = dataFieldContextModelPath.targetObject;
        if (dataFieldForAction) {
          var _dataViewModelPath$ta;
          const actionParameters = {
            entitySetName: (_dataViewModelPath$ta = dataViewModelPath.targetEntitySet) === null || _dataViewModelPath$ta === void 0 ? void 0 : _dataViewModelPath$ta.name,
            invocationGrouping: dataFieldForAction.InvocationGrouping === "UI.OperationGroupingType/ChangeSet" ? library.InvocationGrouping.ChangeSet : library.InvocationGrouping.Isolated,
            label: dataFieldForAction.Label,
            isNavigable: this.action.isNavigable,
            defaultValuesExtensionFunction: this.action.defaultValuesExtensionFunction
          };
          return _jsx(Button, {
            id: this.id,
            text: actionParameters.label,
            press: this.action.command ? CommandExecution.executeCommand(this.action.command) : () => {
              view.getController().handlers.onCallAction(view, dataFieldForAction.Action, {
                ...actionParameters,
                ...{
                  contexts: view.getBindingContext(),
                  model: view.getModel()
                }
              });
            },
            ariaHasPopup: isActionWithDialog(dataFieldContextModelPath.targetObject),
            visible: this.action.visible,
            enabled: this.action.enabled,
            type: CriticalityFormatters.buildExpressionForCriticalityButtonType(dataFieldContextModelPath)
          });
        }
      }
    };
    return DataFieldForActionBlock;
  }(RuntimeBuildingBlock), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "action", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = DataFieldForActionBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEYXRhRmllbGRGb3JBY3Rpb25CbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwicmVxdWlyZWQiLCJnZXRDb250ZW50IiwidmlldyIsImRhdGFWaWV3TW9kZWxQYXRoIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwiY29udGV4dFBhdGgiLCJvZGF0YU1ldGFNb2RlbCIsImdldE1vZGVsIiwiYW5ub3RhdGlvblBhdGgiLCJhY3Rpb24iLCJhbm5vdGF0aW9uUGF0aENvbnRleHQiLCJnZXRDb250ZXh0IiwiZGF0YUZpZWxkQ29udGV4dE1vZGVsUGF0aCIsImRhdGFGaWVsZEZvckFjdGlvbiIsInRhcmdldE9iamVjdCIsImFjdGlvblBhcmFtZXRlcnMiLCJlbnRpdHlTZXROYW1lIiwidGFyZ2V0RW50aXR5U2V0IiwiaW52b2NhdGlvbkdyb3VwaW5nIiwiSW52b2NhdGlvbkdyb3VwaW5nIiwibGlicmFyeSIsIkNoYW5nZVNldCIsIklzb2xhdGVkIiwibGFiZWwiLCJMYWJlbCIsImlzTmF2aWdhYmxlIiwiZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uIiwiaWQiLCJjb21tYW5kIiwiQ29tbWFuZEV4ZWN1dGlvbiIsImV4ZWN1dGVDb21tYW5kIiwiZ2V0Q29udHJvbGxlciIsImhhbmRsZXJzIiwib25DYWxsQWN0aW9uIiwiQWN0aW9uIiwiY29udGV4dHMiLCJnZXRCaW5kaW5nQ29udGV4dCIsIm1vZGVsIiwiaXNBY3Rpb25XaXRoRGlhbG9nIiwidmlzaWJsZSIsImVuYWJsZWQiLCJDcml0aWNhbGl0eUZvcm1hdHRlcnMiLCJidWlsZEV4cHJlc3Npb25Gb3JDcml0aWNhbGl0eUJ1dHRvblR5cGUiLCJSdW50aW1lQnVpbGRpbmdCbG9jayJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRGF0YUZpZWxkRm9yQWN0aW9uLmJsb2NrLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IERhdGFGaWVsZEZvckFjdGlvbiB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IGJsb2NrQXR0cmlidXRlLCBkZWZpbmVCdWlsZGluZ0Jsb2NrIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tTdXBwb3J0XCI7XG5pbXBvcnQgUnVudGltZUJ1aWxkaW5nQmxvY2sgZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL1J1bnRpbWVCdWlsZGluZ0Jsb2NrXCI7XG5pbXBvcnQgQ29tbWFuZEV4ZWN1dGlvbiBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbHMvQ29tbWFuZEV4ZWN1dGlvblwiO1xuaW1wb3J0IHsgaXNBY3Rpb25XaXRoRGlhbG9nIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvYW5ub3RhdGlvbnMvRGF0YUZpZWxkXCI7XG5pbXBvcnQgdHlwZSB7IEFubm90YXRpb25BY3Rpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQWN0aW9uXCI7XG5pbXBvcnQgeyBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB0eXBlIHsgQ29yZUxpYiB9IGZyb20gXCJzYXAvZmUvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgbGlicmFyeSBmcm9tIFwic2FwL2ZlL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0ICogYXMgQ3JpdGljYWxpdHlGb3JtYXR0ZXJzIGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0NyaXRpY2FsaXR5Rm9ybWF0dGVyc1wiO1xuaW1wb3J0IEJ1dHRvbiBmcm9tIFwic2FwL20vQnV0dG9uXCI7XG5pbXBvcnQgdHlwZSBDb250cm9sbGVyIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvQ29udHJvbGxlclwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5cbnR5cGUgQ29udHJvbGxlcldpdGhBY3Rpb24gPSBDb250cm9sbGVyICYge1xuXHRoYW5kbGVyczoge1xuXHRcdG9uQ2FsbEFjdGlvbjogRnVuY3Rpb247XG5cdH07XG59O1xuQGRlZmluZUJ1aWxkaW5nQmxvY2soeyBuYW1lOiBcIkRhdGFGaWVsZEZvckFjdGlvblwiLCBuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvcy5hY3Rpb25zXCIgfSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERhdGFGaWVsZEZvckFjdGlvbkJsb2NrIGV4dGVuZHMgUnVudGltZUJ1aWxkaW5nQmxvY2sge1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcIm9iamVjdFwiLCByZXF1aXJlZDogdHJ1ZSB9KVxuXHRhY3Rpb24hOiBBbm5vdGF0aW9uQWN0aW9uO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIiwgcmVxdWlyZWQ6IHRydWUgfSlcblx0Y29udGV4dFBhdGghOiBDb250ZXh0O1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRyZXF1aXJlZDogdHJ1ZVxuXHR9KVxuXHRpZCE6IHN0cmluZztcblxuXHRnZXRDb250ZW50KHZpZXc6IFZpZXcpIHtcblx0XHRjb25zdCBkYXRhVmlld01vZGVsUGF0aCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyh0aGlzLmNvbnRleHRQYXRoKTtcblx0XHRjb25zdCBvZGF0YU1ldGFNb2RlbCA9IHRoaXMuY29udGV4dFBhdGguZ2V0TW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbDtcblx0XHRjb25zdCBhbm5vdGF0aW9uUGF0aCA9IHRoaXMuYWN0aW9uLmFubm90YXRpb25QYXRoO1xuXHRcdGlmIChhbm5vdGF0aW9uUGF0aCkge1xuXHRcdFx0Y29uc3QgYW5ub3RhdGlvblBhdGhDb250ZXh0ID0gb2RhdGFNZXRhTW9kZWwuZ2V0Q29udGV4dChhbm5vdGF0aW9uUGF0aCk7XG5cdFx0XHRjb25zdCBkYXRhRmllbGRDb250ZXh0TW9kZWxQYXRoID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKGFubm90YXRpb25QYXRoQ29udGV4dCk7XG5cdFx0XHRjb25zdCBkYXRhRmllbGRGb3JBY3Rpb24gPSBkYXRhRmllbGRDb250ZXh0TW9kZWxQYXRoLnRhcmdldE9iamVjdCBhcyBEYXRhRmllbGRGb3JBY3Rpb24gfCB1bmRlZmluZWQ7XG5cdFx0XHRpZiAoZGF0YUZpZWxkRm9yQWN0aW9uKSB7XG5cdFx0XHRcdGNvbnN0IGFjdGlvblBhcmFtZXRlcnMgPSB7XG5cdFx0XHRcdFx0ZW50aXR5U2V0TmFtZTogZGF0YVZpZXdNb2RlbFBhdGgudGFyZ2V0RW50aXR5U2V0Py5uYW1lLFxuXHRcdFx0XHRcdGludm9jYXRpb25Hcm91cGluZzpcblx0XHRcdFx0XHRcdGRhdGFGaWVsZEZvckFjdGlvbi5JbnZvY2F0aW9uR3JvdXBpbmcgPT09IFwiVUkuT3BlcmF0aW9uR3JvdXBpbmdUeXBlL0NoYW5nZVNldFwiXG5cdFx0XHRcdFx0XHRcdD8gKGxpYnJhcnkgYXMgQ29yZUxpYikuSW52b2NhdGlvbkdyb3VwaW5nLkNoYW5nZVNldFxuXHRcdFx0XHRcdFx0XHQ6IChsaWJyYXJ5IGFzIENvcmVMaWIpLkludm9jYXRpb25Hcm91cGluZy5Jc29sYXRlZCxcblx0XHRcdFx0XHRsYWJlbDogZGF0YUZpZWxkRm9yQWN0aW9uLkxhYmVsIGFzIHN0cmluZyxcblx0XHRcdFx0XHRpc05hdmlnYWJsZTogdGhpcy5hY3Rpb24uaXNOYXZpZ2FibGUsXG5cdFx0XHRcdFx0ZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uOiB0aGlzLmFjdGlvbi5kZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb25cblx0XHRcdFx0fTtcblx0XHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdFx0XHRpZD17dGhpcy5pZH1cblx0XHRcdFx0XHRcdHRleHQ9e2FjdGlvblBhcmFtZXRlcnMubGFiZWx9XG5cdFx0XHRcdFx0XHRwcmVzcz17XG5cdFx0XHRcdFx0XHRcdHRoaXMuYWN0aW9uLmNvbW1hbmRcblx0XHRcdFx0XHRcdFx0XHQ/IENvbW1hbmRFeGVjdXRpb24uZXhlY3V0ZUNvbW1hbmQodGhpcy5hY3Rpb24uY29tbWFuZClcblx0XHRcdFx0XHRcdFx0XHQ6ICgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0KHZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIENvbnRyb2xsZXJXaXRoQWN0aW9uKS5oYW5kbGVycy5vbkNhbGxBY3Rpb24oXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dmlldyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkYXRhRmllbGRGb3JBY3Rpb24uQWN0aW9uIGFzIHN0cmluZyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQuLi5hY3Rpb25QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Li4ue1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb250ZXh0czogdmlldy5nZXRCaW5kaW5nQ29udGV4dCgpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtb2RlbDogdmlldy5nZXRNb2RlbCgpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdCAgfVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YXJpYUhhc1BvcHVwPXtpc0FjdGlvbldpdGhEaWFsb2coZGF0YUZpZWxkQ29udGV4dE1vZGVsUGF0aC50YXJnZXRPYmplY3QgYXMgRGF0YUZpZWxkRm9yQWN0aW9uKX1cblx0XHRcdFx0XHRcdHZpc2libGU9e3RoaXMuYWN0aW9uLnZpc2libGV9XG5cdFx0XHRcdFx0XHRlbmFibGVkPXt0aGlzLmFjdGlvbi5lbmFibGVkfVxuXHRcdFx0XHRcdFx0dHlwZT17Q3JpdGljYWxpdHlGb3JtYXR0ZXJzLmJ1aWxkRXhwcmVzc2lvbkZvckNyaXRpY2FsaXR5QnV0dG9uVHlwZShkYXRhRmllbGRDb250ZXh0TW9kZWxQYXRoKX1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQpIGFzIEJ1dHRvbjtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7OztNQXNCcUJBLHVCQUF1QixXQUQzQ0MsbUJBQW1CLENBQUM7SUFBRUMsSUFBSSxFQUFFLG9CQUFvQjtJQUFFQyxTQUFTLEVBQUU7RUFBd0IsQ0FBQyxDQUFDLFVBRXRGQyxjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFLFFBQVE7SUFBRUMsUUFBUSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBR2xERixjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFLHNCQUFzQjtJQUFFQyxRQUFRLEVBQUU7RUFBSyxDQUFDLENBQUMsVUFHaEVGLGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUUsUUFBUTtJQUNkQyxRQUFRLEVBQUU7RUFDWCxDQUFDLENBQUM7SUFBQTtJQUFBO01BQUE7TUFBQTtRQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUEsT0FHRkMsVUFBVSxHQUFWLG9CQUFXQyxJQUFVLEVBQUU7TUFDdEIsTUFBTUMsaUJBQWlCLEdBQUdDLDJCQUEyQixDQUFDLElBQUksQ0FBQ0MsV0FBVyxDQUFDO01BQ3ZFLE1BQU1DLGNBQWMsR0FBRyxJQUFJLENBQUNELFdBQVcsQ0FBQ0UsUUFBUSxFQUFvQjtNQUNwRSxNQUFNQyxjQUFjLEdBQUcsSUFBSSxDQUFDQyxNQUFNLENBQUNELGNBQWM7TUFDakQsSUFBSUEsY0FBYyxFQUFFO1FBQ25CLE1BQU1FLHFCQUFxQixHQUFHSixjQUFjLENBQUNLLFVBQVUsQ0FBQ0gsY0FBYyxDQUFDO1FBQ3ZFLE1BQU1JLHlCQUF5QixHQUFHUiwyQkFBMkIsQ0FBQ00scUJBQXFCLENBQUM7UUFDcEYsTUFBTUcsa0JBQWtCLEdBQUdELHlCQUF5QixDQUFDRSxZQUE4QztRQUNuRyxJQUFJRCxrQkFBa0IsRUFBRTtVQUFBO1VBQ3ZCLE1BQU1FLGdCQUFnQixHQUFHO1lBQ3hCQyxhQUFhLDJCQUFFYixpQkFBaUIsQ0FBQ2MsZUFBZSwwREFBakMsc0JBQW1DckIsSUFBSTtZQUN0RHNCLGtCQUFrQixFQUNqQkwsa0JBQWtCLENBQUNNLGtCQUFrQixLQUFLLG9DQUFvQyxHQUMxRUMsT0FBTyxDQUFhRCxrQkFBa0IsQ0FBQ0UsU0FBUyxHQUNoREQsT0FBTyxDQUFhRCxrQkFBa0IsQ0FBQ0csUUFBUTtZQUNwREMsS0FBSyxFQUFFVixrQkFBa0IsQ0FBQ1csS0FBZTtZQUN6Q0MsV0FBVyxFQUFFLElBQUksQ0FBQ2hCLE1BQU0sQ0FBQ2dCLFdBQVc7WUFDcENDLDhCQUE4QixFQUFFLElBQUksQ0FBQ2pCLE1BQU0sQ0FBQ2lCO1VBQzdDLENBQUM7VUFDRCxPQUNDLEtBQUMsTUFBTTtZQUNOLEVBQUUsRUFBRSxJQUFJLENBQUNDLEVBQUc7WUFDWixJQUFJLEVBQUVaLGdCQUFnQixDQUFDUSxLQUFNO1lBQzdCLEtBQUssRUFDSixJQUFJLENBQUNkLE1BQU0sQ0FBQ21CLE9BQU8sR0FDaEJDLGdCQUFnQixDQUFDQyxjQUFjLENBQUMsSUFBSSxDQUFDckIsTUFBTSxDQUFDbUIsT0FBTyxDQUFDLEdBQ3BELE1BQU07Y0FDTDFCLElBQUksQ0FBQzZCLGFBQWEsRUFBRSxDQUEwQkMsUUFBUSxDQUFDQyxZQUFZLENBQ25FL0IsSUFBSSxFQUNKVyxrQkFBa0IsQ0FBQ3FCLE1BQU0sRUFDekI7Z0JBQ0MsR0FBR25CLGdCQUFnQjtnQkFDbkIsR0FBRztrQkFDRm9CLFFBQVEsRUFBRWpDLElBQUksQ0FBQ2tDLGlCQUFpQixFQUFFO2tCQUNsQ0MsS0FBSyxFQUFFbkMsSUFBSSxDQUFDSyxRQUFRO2dCQUNyQjtjQUNELENBQUMsQ0FDRDtZQUNELENBQ0g7WUFDRCxZQUFZLEVBQUUrQixrQkFBa0IsQ0FBQzFCLHlCQUF5QixDQUFDRSxZQUFZLENBQXdCO1lBQy9GLE9BQU8sRUFBRSxJQUFJLENBQUNMLE1BQU0sQ0FBQzhCLE9BQVE7WUFDN0IsT0FBTyxFQUFFLElBQUksQ0FBQzlCLE1BQU0sQ0FBQytCLE9BQVE7WUFDN0IsSUFBSSxFQUFFQyxxQkFBcUIsQ0FBQ0MsdUNBQXVDLENBQUM5Qix5QkFBeUI7VUFBRSxFQUM5RjtRQUVKO01BQ0Q7SUFDRCxDQUFDO0lBQUE7RUFBQSxFQTdEbUQrQixvQkFBb0I7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7RUFBQTtFQUFBO0FBQUEifQ==