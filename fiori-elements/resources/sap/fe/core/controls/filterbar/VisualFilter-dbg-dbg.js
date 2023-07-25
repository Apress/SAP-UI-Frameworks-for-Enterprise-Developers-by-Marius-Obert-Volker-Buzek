/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/controls/filterbar/utils/VisualFilterUtils", "sap/fe/core/helpers/ClassSupport", "sap/fe/macros/CommonHelper", "sap/fe/macros/filter/FilterUtils", "sap/m/VBox", "sap/ui/core/Core", "../../templating/FilterHelper"], function (CommonUtils, VisualFilterUtils, ClassSupport, CommonHelper, FilterUtils, VBox, Core, FilterHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;
  var getFiltersConditionsFromSelectionVariant = FilterHelper.getFiltersConditionsFromSelectionVariant;
  var property = ClassSupport.property;
  var implementInterface = ClassSupport.implementInterface;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Constructor for a new filterBar/aligned/FilterItemLayout.
   *
   * @param {string} [sId] ID for the new control, generated automatically if no ID is given
   * @param {object} [mSettings] Initial settings for the new control
   * @class Represents a filter item on the UI.
   * @extends sap.m.VBox
   * @implements {sap.ui.core.IFormContent}
   * @class
   * @private
   * @since 1.61.0
   * @alias control sap.fe.core.controls.filterbar.VisualFilter
   */
  let VisualFilter = (_dec = defineUI5Class("sap.fe.core.controls.filterbar.VisualFilter"), _dec2 = implementInterface("sap.ui.core.IFormContent"), _dec3 = property({
    type: "boolean"
  }), _dec4 = property({
    type: "string"
  }), _dec5 = event(), _dec(_class = (_class2 = /*#__PURE__*/function (_VBox) {
    _inheritsLoose(VisualFilter, _VBox);
    function VisualFilter() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _VBox.call(this, ...args) || this;
      _initializerDefineProperty(_this, "__implements__sap_ui_core_IFormContent", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showValueHelp", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "valueHelpIconSrc", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "valueHelpRequest", _descriptor4, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = VisualFilter.prototype;
    _proto.onAfterRendering = function onAfterRendering() {
      var _this$getParent;
      let sLabel;
      const oInteractiveChart = this.getItems()[1].getItems()[0];
      const sInternalContextPath = this.data("infoPath");
      const oInteractiveChartListBinding = oInteractiveChart.getBinding("segments") || oInteractiveChart.getBinding("bars") || oInteractiveChart.getBinding("points");
      const oInternalModelContext = oInteractiveChart.getBindingContext("internal");
      const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.macros");
      const bShowOverLayInitially = oInteractiveChart.data("showOverlayInitially");
      const oSelectionVariantAnnotation = oInteractiveChart.data("selectionVariantAnnotation") ? CommonHelper.parseCustomData(oInteractiveChart.data("selectionVariantAnnotation")) : {
        SelectOptions: []
      };
      const aRequiredProperties = oInteractiveChart.data("requiredProperties") ? CommonHelper.parseCustomData(oInteractiveChart.data("requiredProperties")) : [];
      const oMetaModel = oInteractiveChart.getModel().getMetaModel();
      const sEntitySetPath = oInteractiveChartListBinding ? oInteractiveChartListBinding.getPath() : "";
      let oFilterBar = (_this$getParent = this.getParent()) === null || _this$getParent === void 0 ? void 0 : _this$getParent.getParent();
      // TODO: Remove this part once 2170204347 is fixed
      if (oFilterBar.getMetadata().getElementName() === "sap.ui.mdc.filterbar.p13n.AdaptationFilterBar") {
        var _oFilterBar$getParent;
        oFilterBar = (_oFilterBar$getParent = oFilterBar.getParent()) === null || _oFilterBar$getParent === void 0 ? void 0 : _oFilterBar$getParent.getParent();
      }
      let oFilterBarConditions = {};
      let aPropertyInfoSet = [];
      let sFilterEntityName;
      if (oFilterBar.getMetadata().getElementName() === "sap.fe.core.controls.FilterBar") {
        oFilterBarConditions = oFilterBar.getConditions();
        aPropertyInfoSet = oFilterBar.getPropertyInfoSet();
        sFilterEntityName = oFilterBar.data("entityType").split("/")[1];
      }
      const aParameters = oInteractiveChart.data("parameters") ? oInteractiveChart.data("parameters").customData : [];
      const filterConditions = getFiltersConditionsFromSelectionVariant(sEntitySetPath, oMetaModel, oSelectionVariantAnnotation, VisualFilterUtils.getCustomConditions.bind(VisualFilterUtils));
      const oSelectionVariantConditions = VisualFilterUtils.convertFilterCondions(filterConditions);
      const mConditions = {};
      Object.keys(oFilterBarConditions).forEach(function (sKey) {
        if (oFilterBarConditions[sKey].length) {
          mConditions[sKey] = oFilterBarConditions[sKey];
        }
      });
      Object.keys(oSelectionVariantConditions).forEach(function (sKey) {
        if (!mConditions[sKey]) {
          mConditions[sKey] = oSelectionVariantConditions[sKey];
        }
      });
      if (bShowOverLayInitially === "true") {
        if (!Object.keys(oSelectionVariantAnnotation).length) {
          if (aRequiredProperties.length > 1) {
            oInternalModelContext.setProperty(sInternalContextPath, {
              showError: true,
              errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
              errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_MULTIPLEVF")
            });
          } else {
            sLabel = oMetaModel.getObject(`${sEntitySetPath}/${aRequiredProperties[0]}@com.sap.vocabularies.Common.v1.Label`) || aRequiredProperties[0];
            oInternalModelContext.setProperty(sInternalContextPath, {
              showError: true,
              errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
              errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_SINGLEVF", sLabel)
            });
          }
        } else {
          const aSelectOptions = [];
          const aNotMatchedConditions = [];
          if (oSelectionVariantAnnotation.SelectOptions) {
            oSelectionVariantAnnotation.SelectOptions.forEach(function (oSelectOption) {
              aSelectOptions.push(oSelectOption.PropertyName.$PropertyPath);
            });
          }
          if (oSelectionVariantAnnotation.Parameters) {
            oSelectionVariantAnnotation.Parameters.forEach(function (oParameter) {
              aSelectOptions.push(oParameter.PropertyName.$PropertyPath);
            });
          }
          aRequiredProperties.forEach(function (sPath) {
            if (aSelectOptions.indexOf(sPath) === -1) {
              aNotMatchedConditions.push(sPath);
            }
          });
          if (aNotMatchedConditions.length > 1) {
            oInternalModelContext.setProperty(sInternalContextPath, {
              showError: true,
              errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
              errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_MULTIPLEVF")
            });
          } else {
            sLabel = oMetaModel.getObject(`${sEntitySetPath}/${aNotMatchedConditions[0]}@com.sap.vocabularies.Common.v1.Label`) || aNotMatchedConditions[0];
            oInternalModelContext.setProperty(sInternalContextPath, {
              showError: true,
              errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
              errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_SINGLEVF", sLabel)
            });
          }
          if (aNotMatchedConditions.length > 1) {
            oInternalModelContext.setProperty(sInternalContextPath, {
              showError: true,
              errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
              errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_MULTIPLEVF")
            });
          } else {
            oInternalModelContext.setProperty(sInternalContextPath, {
              showError: true,
              errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
              errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_SINGLEVF", aNotMatchedConditions[0])
            });
          }
        }
      }
      if (!this._oChartBinding || this._oChartBinding !== oInteractiveChartListBinding) {
        if (this._oChartBinding) {
          this.detachDataReceivedHandler(this._oChartBinding);
        }
        this.attachDataRecivedHandler(oInteractiveChartListBinding);
        this._oChartBinding = oInteractiveChartListBinding;
      }
      const bShowOverlay = oInternalModelContext.getProperty(sInternalContextPath) && oInternalModelContext.getProperty(sInternalContextPath).showError;
      const sChartEntityName = sEntitySetPath !== "" ? sEntitySetPath.split("/")[1].split("(")[0] : "";
      if (aParameters && aParameters.length && sFilterEntityName === sChartEntityName) {
        const sBindingPath = FilterUtils.getBindingPathForParameters(oFilterBar, mConditions, aPropertyInfoSet, aParameters);
        if (sBindingPath) {
          oInteractiveChartListBinding.sPath = sBindingPath;
        }
      }
      // resume binding for only those visual filters that do not have a in parameter attached.
      // Bindings of visual filters with inParameters will be resumed later after considering in parameters.
      if (oInteractiveChartListBinding && oInteractiveChartListBinding.isSuspended() && !bShowOverlay) {
        oInteractiveChartListBinding.resume();
      }
    };
    _proto.attachDataRecivedHandler = function attachDataRecivedHandler(oInteractiveChartListBinding) {
      if (oInteractiveChartListBinding) {
        oInteractiveChartListBinding.attachEvent("dataReceived", this.onInternalDataReceived, this);
        this._oChartBinding = oInteractiveChartListBinding;
      }
    };
    _proto.detachDataReceivedHandler = function detachDataReceivedHandler(oInteractiveChartListBinding) {
      if (oInteractiveChartListBinding) {
        oInteractiveChartListBinding.detachEvent("dataReceived", this.onInternalDataReceived, this);
        this._oChartBinding = undefined;
      }
    };
    _proto.setShowValueHelp = function setShowValueHelp(bShowValueHelp) {
      if (this.getItems().length > 0) {
        const oVisualFilterControl = this.getItems()[0].getItems()[0];
        oVisualFilterControl.getContent().some(function (oInnerControl) {
          if (oInnerControl.isA("sap.m.Button")) {
            oInnerControl.setVisible(bShowValueHelp);
          }
        });
        this.setProperty("showValueHelp", bShowValueHelp);
      }
    };
    _proto.setValueHelpIconSrc = function setValueHelpIconSrc(sIconSrc) {
      if (this.getItems().length > 0) {
        const oVisualFilterControl = this.getItems()[0].getItems()[0];
        oVisualFilterControl.getContent().some(function (oInnerControl) {
          if (oInnerControl.isA("sap.m.Button")) {
            oInnerControl.setIcon(sIconSrc);
          }
        });
        this.setProperty("valueHelpIconSrc", sIconSrc);
      }
    };
    _proto.onInternalDataReceived = function onInternalDataReceived(oEvent) {
      const sId = this.getId();
      const oView = CommonUtils.getTargetView(this);
      const oInteractiveChart = this.getItems()[1].getItems()[0];
      const sInternalContextPath = this.data("infoPath");
      const oInternalModelContext = oInteractiveChart.getBindingContext("internal");
      const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.macros");
      const vUOM = oInteractiveChart.data("uom");
      VisualFilterUtils.updateChartScaleFactorTitle(oInteractiveChart, oView, sId, sInternalContextPath);
      if (oEvent.getParameter("error")) {
        const s18nMessageTitle = oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE");
        const s18nMessage = oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_DATA_TEXT");
        VisualFilterUtils.applyErrorMessageAndTitle(s18nMessageTitle, s18nMessage, sInternalContextPath, oView);
      } else if (oEvent.getParameter("data")) {
        const oData = oEvent.getSource().getCurrentContexts();
        if (oData && oData.length === 0) {
          VisualFilterUtils.setNoDataMessage(sInternalContextPath, oResourceBundle, oView);
        } else {
          oInternalModelContext.setProperty(sInternalContextPath, {});
        }
        VisualFilterUtils.setMultiUOMMessage(oData, oInteractiveChart, sInternalContextPath, oResourceBundle, oView);
      }
      if (vUOM && (vUOM["ISOCurrency"] && vUOM["ISOCurrency"].$Path || vUOM["Unit"] && vUOM["Unit"].$Path)) {
        const oContexts = oEvent.getSource().getContexts();
        const oContextData = oContexts && oContexts[0].getObject();
        VisualFilterUtils.applyUOMToTitle(oInteractiveChart, oContextData, oView, sInternalContextPath);
      }
    };
    return VisualFilter;
  }(VBox), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "__implements__sap_ui_core_IFormContent", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "showValueHelp", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "valueHelpIconSrc", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "valueHelpRequest", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return VisualFilter;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWaXN1YWxGaWx0ZXIiLCJkZWZpbmVVSTVDbGFzcyIsImltcGxlbWVudEludGVyZmFjZSIsInByb3BlcnR5IiwidHlwZSIsImV2ZW50Iiwib25BZnRlclJlbmRlcmluZyIsInNMYWJlbCIsIm9JbnRlcmFjdGl2ZUNoYXJ0IiwiZ2V0SXRlbXMiLCJzSW50ZXJuYWxDb250ZXh0UGF0aCIsImRhdGEiLCJvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nIiwiZ2V0QmluZGluZyIsIm9JbnRlcm5hbE1vZGVsQ29udGV4dCIsImdldEJpbmRpbmdDb250ZXh0Iiwib1Jlc291cmNlQnVuZGxlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsImJTaG93T3ZlckxheUluaXRpYWxseSIsIm9TZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvbiIsIkNvbW1vbkhlbHBlciIsInBhcnNlQ3VzdG9tRGF0YSIsIlNlbGVjdE9wdGlvbnMiLCJhUmVxdWlyZWRQcm9wZXJ0aWVzIiwib01ldGFNb2RlbCIsImdldE1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwic0VudGl0eVNldFBhdGgiLCJnZXRQYXRoIiwib0ZpbHRlckJhciIsImdldFBhcmVudCIsImdldE1ldGFkYXRhIiwiZ2V0RWxlbWVudE5hbWUiLCJvRmlsdGVyQmFyQ29uZGl0aW9ucyIsImFQcm9wZXJ0eUluZm9TZXQiLCJzRmlsdGVyRW50aXR5TmFtZSIsImdldENvbmRpdGlvbnMiLCJnZXRQcm9wZXJ0eUluZm9TZXQiLCJzcGxpdCIsImFQYXJhbWV0ZXJzIiwiY3VzdG9tRGF0YSIsImZpbHRlckNvbmRpdGlvbnMiLCJnZXRGaWx0ZXJzQ29uZGl0aW9uc0Zyb21TZWxlY3Rpb25WYXJpYW50IiwiVmlzdWFsRmlsdGVyVXRpbHMiLCJnZXRDdXN0b21Db25kaXRpb25zIiwiYmluZCIsIm9TZWxlY3Rpb25WYXJpYW50Q29uZGl0aW9ucyIsImNvbnZlcnRGaWx0ZXJDb25kaW9ucyIsIm1Db25kaXRpb25zIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJzS2V5IiwibGVuZ3RoIiwic2V0UHJvcGVydHkiLCJzaG93RXJyb3IiLCJlcnJvck1lc3NhZ2VUaXRsZSIsImdldFRleHQiLCJlcnJvck1lc3NhZ2UiLCJnZXRPYmplY3QiLCJhU2VsZWN0T3B0aW9ucyIsImFOb3RNYXRjaGVkQ29uZGl0aW9ucyIsIm9TZWxlY3RPcHRpb24iLCJwdXNoIiwiUHJvcGVydHlOYW1lIiwiJFByb3BlcnR5UGF0aCIsIlBhcmFtZXRlcnMiLCJvUGFyYW1ldGVyIiwic1BhdGgiLCJpbmRleE9mIiwiX29DaGFydEJpbmRpbmciLCJkZXRhY2hEYXRhUmVjZWl2ZWRIYW5kbGVyIiwiYXR0YWNoRGF0YVJlY2l2ZWRIYW5kbGVyIiwiYlNob3dPdmVybGF5IiwiZ2V0UHJvcGVydHkiLCJzQ2hhcnRFbnRpdHlOYW1lIiwic0JpbmRpbmdQYXRoIiwiRmlsdGVyVXRpbHMiLCJnZXRCaW5kaW5nUGF0aEZvclBhcmFtZXRlcnMiLCJpc1N1c3BlbmRlZCIsInJlc3VtZSIsImF0dGFjaEV2ZW50Iiwib25JbnRlcm5hbERhdGFSZWNlaXZlZCIsImRldGFjaEV2ZW50IiwidW5kZWZpbmVkIiwic2V0U2hvd1ZhbHVlSGVscCIsImJTaG93VmFsdWVIZWxwIiwib1Zpc3VhbEZpbHRlckNvbnRyb2wiLCJnZXRDb250ZW50Iiwic29tZSIsIm9Jbm5lckNvbnRyb2wiLCJpc0EiLCJzZXRWaXNpYmxlIiwic2V0VmFsdWVIZWxwSWNvblNyYyIsInNJY29uU3JjIiwic2V0SWNvbiIsIm9FdmVudCIsInNJZCIsImdldElkIiwib1ZpZXciLCJDb21tb25VdGlscyIsImdldFRhcmdldFZpZXciLCJ2VU9NIiwidXBkYXRlQ2hhcnRTY2FsZUZhY3RvclRpdGxlIiwiZ2V0UGFyYW1ldGVyIiwiczE4bk1lc3NhZ2VUaXRsZSIsInMxOG5NZXNzYWdlIiwiYXBwbHlFcnJvck1lc3NhZ2VBbmRUaXRsZSIsIm9EYXRhIiwiZ2V0U291cmNlIiwiZ2V0Q3VycmVudENvbnRleHRzIiwic2V0Tm9EYXRhTWVzc2FnZSIsInNldE11bHRpVU9NTWVzc2FnZSIsIiRQYXRoIiwib0NvbnRleHRzIiwiZ2V0Q29udGV4dHMiLCJvQ29udGV4dERhdGEiLCJhcHBseVVPTVRvVGl0bGUiLCJWQm94Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJWaXN1YWxGaWx0ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IFZpc3VhbEZpbHRlclV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9scy9maWx0ZXJiYXIvdXRpbHMvVmlzdWFsRmlsdGVyVXRpbHNcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBldmVudCwgaW1wbGVtZW50SW50ZXJmYWNlLCBwcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IENvbW1vbkhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9Db21tb25IZWxwZXJcIjtcbmltcG9ydCBGaWx0ZXJVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWx0ZXIvRmlsdGVyVXRpbHNcIjtcbmltcG9ydCBWQm94IGZyb20gXCJzYXAvbS9WQm94XCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IHR5cGUgeyBJRm9ybUNvbnRlbnQgfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IHR5cGUgRmlsdGVyQmFyIGZyb20gXCJzYXAvdWkvbWRjL0ZpbHRlckJhclwiO1xuaW1wb3J0IHsgZ2V0RmlsdGVyc0NvbmRpdGlvbnNGcm9tU2VsZWN0aW9uVmFyaWFudCB9IGZyb20gXCIuLi8uLi90ZW1wbGF0aW5nL0ZpbHRlckhlbHBlclwiO1xuLyoqXG4gKiBDb25zdHJ1Y3RvciBmb3IgYSBuZXcgZmlsdGVyQmFyL2FsaWduZWQvRmlsdGVySXRlbUxheW91dC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gW3NJZF0gSUQgZm9yIHRoZSBuZXcgY29udHJvbCwgZ2VuZXJhdGVkIGF1dG9tYXRpY2FsbHkgaWYgbm8gSUQgaXMgZ2l2ZW5cbiAqIEBwYXJhbSB7b2JqZWN0fSBbbVNldHRpbmdzXSBJbml0aWFsIHNldHRpbmdzIGZvciB0aGUgbmV3IGNvbnRyb2xcbiAqIEBjbGFzcyBSZXByZXNlbnRzIGEgZmlsdGVyIGl0ZW0gb24gdGhlIFVJLlxuICogQGV4dGVuZHMgc2FwLm0uVkJveFxuICogQGltcGxlbWVudHMge3NhcC51aS5jb3JlLklGb3JtQ29udGVudH1cbiAqIEBjbGFzc1xuICogQHByaXZhdGVcbiAqIEBzaW5jZSAxLjYxLjBcbiAqIEBhbGlhcyBjb250cm9sIHNhcC5mZS5jb3JlLmNvbnRyb2xzLmZpbHRlcmJhci5WaXN1YWxGaWx0ZXJcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuY29udHJvbHMuZmlsdGVyYmFyLlZpc3VhbEZpbHRlclwiKVxuY2xhc3MgVmlzdWFsRmlsdGVyIGV4dGVuZHMgVkJveCBpbXBsZW1lbnRzIElGb3JtQ29udGVudCB7XG5cdEBpbXBsZW1lbnRJbnRlcmZhY2UoXCJzYXAudWkuY29yZS5JRm9ybUNvbnRlbnRcIilcblx0X19pbXBsZW1lbnRzX19zYXBfdWlfY29yZV9JRm9ybUNvbnRlbnQ6IGJvb2xlYW4gPSB0cnVlO1xuXG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCJcblx0fSlcblx0c2hvd1ZhbHVlSGVscCE6IGJvb2xlYW47XG5cblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHZhbHVlSGVscEljb25TcmMhOiBzdHJpbmc7XG5cblx0QGV2ZW50KClcblx0dmFsdWVIZWxwUmVxdWVzdCE6IEZ1bmN0aW9uO1xuXG5cdHByaXZhdGUgX29DaGFydEJpbmRpbmc/OiBib29sZWFuO1xuXG5cdG9uQWZ0ZXJSZW5kZXJpbmcoKSB7XG5cdFx0bGV0IHNMYWJlbDtcblx0XHRjb25zdCBvSW50ZXJhY3RpdmVDaGFydCA9ICh0aGlzLmdldEl0ZW1zKClbMV0gYXMgYW55KS5nZXRJdGVtcygpWzBdO1xuXHRcdGNvbnN0IHNJbnRlcm5hbENvbnRleHRQYXRoID0gdGhpcy5kYXRhKFwiaW5mb1BhdGhcIik7XG5cdFx0Y29uc3Qgb0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZyA9XG5cdFx0XHRvSW50ZXJhY3RpdmVDaGFydC5nZXRCaW5kaW5nKFwic2VnbWVudHNcIikgfHwgb0ludGVyYWN0aXZlQ2hhcnQuZ2V0QmluZGluZyhcImJhcnNcIikgfHwgb0ludGVyYWN0aXZlQ2hhcnQuZ2V0QmluZGluZyhcInBvaW50c1wiKTtcblx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvSW50ZXJhY3RpdmVDaGFydC5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpO1xuXHRcdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLm1hY3Jvc1wiKTtcblx0XHRjb25zdCBiU2hvd092ZXJMYXlJbml0aWFsbHkgPSBvSW50ZXJhY3RpdmVDaGFydC5kYXRhKFwic2hvd092ZXJsYXlJbml0aWFsbHlcIik7XG5cdFx0Y29uc3Qgb1NlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uOiBhbnkgPSBvSW50ZXJhY3RpdmVDaGFydC5kYXRhKFwic2VsZWN0aW9uVmFyaWFudEFubm90YXRpb25cIilcblx0XHRcdD8gQ29tbW9uSGVscGVyLnBhcnNlQ3VzdG9tRGF0YShvSW50ZXJhY3RpdmVDaGFydC5kYXRhKFwic2VsZWN0aW9uVmFyaWFudEFubm90YXRpb25cIikpXG5cdFx0XHQ6IHsgU2VsZWN0T3B0aW9uczogW10gfTtcblx0XHRjb25zdCBhUmVxdWlyZWRQcm9wZXJ0aWVzOiBhbnlbXSA9IG9JbnRlcmFjdGl2ZUNoYXJ0LmRhdGEoXCJyZXF1aXJlZFByb3BlcnRpZXNcIilcblx0XHRcdD8gKENvbW1vbkhlbHBlci5wYXJzZUN1c3RvbURhdGEob0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcInJlcXVpcmVkUHJvcGVydGllc1wiKSkgYXMgYW55W10pXG5cdFx0XHQ6IFtdO1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvSW50ZXJhY3RpdmVDaGFydC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdGNvbnN0IHNFbnRpdHlTZXRQYXRoID0gb0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZyA/IG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmcuZ2V0UGF0aCgpIDogXCJcIjtcblx0XHRsZXQgb0ZpbHRlckJhciA9IHRoaXMuZ2V0UGFyZW50KCk/LmdldFBhcmVudCgpIGFzIEZpbHRlckJhcjtcblx0XHQvLyBUT0RPOiBSZW1vdmUgdGhpcyBwYXJ0IG9uY2UgMjE3MDIwNDM0NyBpcyBmaXhlZFxuXHRcdGlmIChvRmlsdGVyQmFyLmdldE1ldGFkYXRhKCkuZ2V0RWxlbWVudE5hbWUoKSA9PT0gXCJzYXAudWkubWRjLmZpbHRlcmJhci5wMTNuLkFkYXB0YXRpb25GaWx0ZXJCYXJcIikge1xuXHRcdFx0b0ZpbHRlckJhciA9IG9GaWx0ZXJCYXIuZ2V0UGFyZW50KCk/LmdldFBhcmVudCgpIGFzIEZpbHRlckJhcjtcblx0XHR9XG5cdFx0bGV0IG9GaWx0ZXJCYXJDb25kaXRpb25zOiBhbnkgPSB7fTtcblx0XHRsZXQgYVByb3BlcnR5SW5mb1NldCA9IFtdO1xuXHRcdGxldCBzRmlsdGVyRW50aXR5TmFtZTtcblx0XHRpZiAob0ZpbHRlckJhci5nZXRNZXRhZGF0YSgpLmdldEVsZW1lbnROYW1lKCkgPT09IFwic2FwLmZlLmNvcmUuY29udHJvbHMuRmlsdGVyQmFyXCIpIHtcblx0XHRcdG9GaWx0ZXJCYXJDb25kaXRpb25zID0gb0ZpbHRlckJhci5nZXRDb25kaXRpb25zKCk7XG5cdFx0XHRhUHJvcGVydHlJbmZvU2V0ID0gKG9GaWx0ZXJCYXIgYXMgYW55KS5nZXRQcm9wZXJ0eUluZm9TZXQoKTtcblx0XHRcdHNGaWx0ZXJFbnRpdHlOYW1lID0gb0ZpbHRlckJhci5kYXRhKFwiZW50aXR5VHlwZVwiKS5zcGxpdChcIi9cIilbMV07XG5cdFx0fVxuXHRcdGNvbnN0IGFQYXJhbWV0ZXJzID0gb0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcInBhcmFtZXRlcnNcIikgPyBvSW50ZXJhY3RpdmVDaGFydC5kYXRhKFwicGFyYW1ldGVyc1wiKS5jdXN0b21EYXRhIDogW107XG5cdFx0Y29uc3QgZmlsdGVyQ29uZGl0aW9ucyA9IGdldEZpbHRlcnNDb25kaXRpb25zRnJvbVNlbGVjdGlvblZhcmlhbnQoXG5cdFx0XHRzRW50aXR5U2V0UGF0aCxcblx0XHRcdG9NZXRhTW9kZWwsXG5cdFx0XHRvU2VsZWN0aW9uVmFyaWFudEFubm90YXRpb24sXG5cdFx0XHRWaXN1YWxGaWx0ZXJVdGlscy5nZXRDdXN0b21Db25kaXRpb25zLmJpbmQoVmlzdWFsRmlsdGVyVXRpbHMpXG5cdFx0KTtcblx0XHRjb25zdCBvU2VsZWN0aW9uVmFyaWFudENvbmRpdGlvbnMgPSBWaXN1YWxGaWx0ZXJVdGlscy5jb252ZXJ0RmlsdGVyQ29uZGlvbnMoZmlsdGVyQ29uZGl0aW9ucyk7XG5cdFx0Y29uc3QgbUNvbmRpdGlvbnM6IGFueSA9IHt9O1xuXG5cdFx0T2JqZWN0LmtleXMob0ZpbHRlckJhckNvbmRpdGlvbnMpLmZvckVhY2goZnVuY3Rpb24gKHNLZXk6IHN0cmluZykge1xuXHRcdFx0aWYgKG9GaWx0ZXJCYXJDb25kaXRpb25zW3NLZXldLmxlbmd0aCkge1xuXHRcdFx0XHRtQ29uZGl0aW9uc1tzS2V5XSA9IG9GaWx0ZXJCYXJDb25kaXRpb25zW3NLZXldO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0T2JqZWN0LmtleXMob1NlbGVjdGlvblZhcmlhbnRDb25kaXRpb25zKS5mb3JFYWNoKGZ1bmN0aW9uIChzS2V5OiBzdHJpbmcpIHtcblx0XHRcdGlmICghbUNvbmRpdGlvbnNbc0tleV0pIHtcblx0XHRcdFx0bUNvbmRpdGlvbnNbc0tleV0gPSBvU2VsZWN0aW9uVmFyaWFudENvbmRpdGlvbnNbc0tleV07XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0aWYgKGJTaG93T3ZlckxheUluaXRpYWxseSA9PT0gXCJ0cnVlXCIpIHtcblx0XHRcdGlmICghT2JqZWN0LmtleXMob1NlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uKS5sZW5ndGgpIHtcblx0XHRcdFx0aWYgKGFSZXF1aXJlZFByb3BlcnRpZXMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShzSW50ZXJuYWxDb250ZXh0UGF0aCwge1xuXHRcdFx0XHRcdFx0c2hvd0Vycm9yOiB0cnVlLFxuXHRcdFx0XHRcdFx0ZXJyb3JNZXNzYWdlVGl0bGU6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSU19FUlJPUl9NRVNTQUdFX1RJVExFXCIpLFxuXHRcdFx0XHRcdFx0ZXJyb3JNZXNzYWdlOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUlNfUFJPVklERV9GSUxURVJfVkFMX01VTFRJUExFVkZcIilcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzTGFiZWwgPVxuXHRcdFx0XHRcdFx0b01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVNldFBhdGh9LyR7YVJlcXVpcmVkUHJvcGVydGllc1swXX1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxhYmVsYCkgfHxcblx0XHRcdFx0XHRcdGFSZXF1aXJlZFByb3BlcnRpZXNbMF07XG5cdFx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KHNJbnRlcm5hbENvbnRleHRQYXRoLCB7XG5cdFx0XHRcdFx0XHRzaG93RXJyb3I6IHRydWUsXG5cdFx0XHRcdFx0XHRlcnJvck1lc3NhZ2VUaXRsZTogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX0VSUk9SX01FU1NBR0VfVElUTEVcIiksXG5cdFx0XHRcdFx0XHRlcnJvck1lc3NhZ2U6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSU19QUk9WSURFX0ZJTFRFUl9WQUxfU0lOR0xFVkZcIiwgc0xhYmVsKVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBhU2VsZWN0T3B0aW9uczogYW55W10gPSBbXTtcblx0XHRcdFx0Y29uc3QgYU5vdE1hdGNoZWRDb25kaXRpb25zOiBhbnlbXSA9IFtdO1xuXHRcdFx0XHRpZiAob1NlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uLlNlbGVjdE9wdGlvbnMpIHtcblx0XHRcdFx0XHRvU2VsZWN0aW9uVmFyaWFudEFubm90YXRpb24uU2VsZWN0T3B0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChvU2VsZWN0T3B0aW9uOiBhbnkpIHtcblx0XHRcdFx0XHRcdGFTZWxlY3RPcHRpb25zLnB1c2gob1NlbGVjdE9wdGlvbi5Qcm9wZXJ0eU5hbWUuJFByb3BlcnR5UGF0aCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG9TZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvbi5QYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uLlBhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbiAob1BhcmFtZXRlcjogYW55KSB7XG5cdFx0XHRcdFx0XHRhU2VsZWN0T3B0aW9ucy5wdXNoKG9QYXJhbWV0ZXIuUHJvcGVydHlOYW1lLiRQcm9wZXJ0eVBhdGgpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGFSZXF1aXJlZFByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbiAoc1BhdGg6IGFueSkge1xuXHRcdFx0XHRcdGlmIChhU2VsZWN0T3B0aW9ucy5pbmRleE9mKHNQYXRoKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRcdGFOb3RNYXRjaGVkQ29uZGl0aW9ucy5wdXNoKHNQYXRoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAoYU5vdE1hdGNoZWRDb25kaXRpb25zLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoc0ludGVybmFsQ29udGV4dFBhdGgsIHtcblx0XHRcdFx0XHRcdHNob3dFcnJvcjogdHJ1ZSxcblx0XHRcdFx0XHRcdGVycm9yTWVzc2FnZVRpdGxlOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUlNfRVJST1JfTUVTU0FHRV9USVRMRVwiKSxcblx0XHRcdFx0XHRcdGVycm9yTWVzc2FnZTogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX1BST1ZJREVfRklMVEVSX1ZBTF9NVUxUSVBMRVZGXCIpXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c0xhYmVsID1cblx0XHRcdFx0XHRcdG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlTZXRQYXRofS8ke2FOb3RNYXRjaGVkQ29uZGl0aW9uc1swXX1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxhYmVsYCkgfHxcblx0XHRcdFx0XHRcdGFOb3RNYXRjaGVkQ29uZGl0aW9uc1swXTtcblx0XHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoc0ludGVybmFsQ29udGV4dFBhdGgsIHtcblx0XHRcdFx0XHRcdHNob3dFcnJvcjogdHJ1ZSxcblx0XHRcdFx0XHRcdGVycm9yTWVzc2FnZVRpdGxlOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUlNfRVJST1JfTUVTU0FHRV9USVRMRVwiKSxcblx0XHRcdFx0XHRcdGVycm9yTWVzc2FnZTogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX1BST1ZJREVfRklMVEVSX1ZBTF9TSU5HTEVWRlwiLCBzTGFiZWwpXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGFOb3RNYXRjaGVkQ29uZGl0aW9ucy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KHNJbnRlcm5hbENvbnRleHRQYXRoLCB7XG5cdFx0XHRcdFx0XHRzaG93RXJyb3I6IHRydWUsXG5cdFx0XHRcdFx0XHRlcnJvck1lc3NhZ2VUaXRsZTogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX0VSUk9SX01FU1NBR0VfVElUTEVcIiksXG5cdFx0XHRcdFx0XHRlcnJvck1lc3NhZ2U6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSU19QUk9WSURFX0ZJTFRFUl9WQUxfTVVMVElQTEVWRlwiKVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShzSW50ZXJuYWxDb250ZXh0UGF0aCwge1xuXHRcdFx0XHRcdFx0c2hvd0Vycm9yOiB0cnVlLFxuXHRcdFx0XHRcdFx0ZXJyb3JNZXNzYWdlVGl0bGU6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSU19FUlJPUl9NRVNTQUdFX1RJVExFXCIpLFxuXHRcdFx0XHRcdFx0ZXJyb3JNZXNzYWdlOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUlNfUFJPVklERV9GSUxURVJfVkFMX1NJTkdMRVZGXCIsIGFOb3RNYXRjaGVkQ29uZGl0aW9uc1swXSlcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICghdGhpcy5fb0NoYXJ0QmluZGluZyB8fCB0aGlzLl9vQ2hhcnRCaW5kaW5nICE9PSBvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nKSB7XG5cdFx0XHRpZiAodGhpcy5fb0NoYXJ0QmluZGluZykge1xuXHRcdFx0XHR0aGlzLmRldGFjaERhdGFSZWNlaXZlZEhhbmRsZXIodGhpcy5fb0NoYXJ0QmluZGluZyk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmF0dGFjaERhdGFSZWNpdmVkSGFuZGxlcihvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nKTtcblx0XHRcdHRoaXMuX29DaGFydEJpbmRpbmcgPSBvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nO1xuXHRcdH1cblx0XHRjb25zdCBiU2hvd092ZXJsYXkgPVxuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KHNJbnRlcm5hbENvbnRleHRQYXRoKSAmJiBvSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UHJvcGVydHkoc0ludGVybmFsQ29udGV4dFBhdGgpLnNob3dFcnJvcjtcblx0XHRjb25zdCBzQ2hhcnRFbnRpdHlOYW1lID0gc0VudGl0eVNldFBhdGggIT09IFwiXCIgPyBzRW50aXR5U2V0UGF0aC5zcGxpdChcIi9cIilbMV0uc3BsaXQoXCIoXCIpWzBdIDogXCJcIjtcblx0XHRpZiAoYVBhcmFtZXRlcnMgJiYgYVBhcmFtZXRlcnMubGVuZ3RoICYmIHNGaWx0ZXJFbnRpdHlOYW1lID09PSBzQ2hhcnRFbnRpdHlOYW1lKSB7XG5cdFx0XHRjb25zdCBzQmluZGluZ1BhdGggPSBGaWx0ZXJVdGlscy5nZXRCaW5kaW5nUGF0aEZvclBhcmFtZXRlcnMob0ZpbHRlckJhciwgbUNvbmRpdGlvbnMsIGFQcm9wZXJ0eUluZm9TZXQsIGFQYXJhbWV0ZXJzKTtcblx0XHRcdGlmIChzQmluZGluZ1BhdGgpIHtcblx0XHRcdFx0b0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZy5zUGF0aCA9IHNCaW5kaW5nUGF0aDtcblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gcmVzdW1lIGJpbmRpbmcgZm9yIG9ubHkgdGhvc2UgdmlzdWFsIGZpbHRlcnMgdGhhdCBkbyBub3QgaGF2ZSBhIGluIHBhcmFtZXRlciBhdHRhY2hlZC5cblx0XHQvLyBCaW5kaW5ncyBvZiB2aXN1YWwgZmlsdGVycyB3aXRoIGluUGFyYW1ldGVycyB3aWxsIGJlIHJlc3VtZWQgbGF0ZXIgYWZ0ZXIgY29uc2lkZXJpbmcgaW4gcGFyYW1ldGVycy5cblx0XHRpZiAob0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZyAmJiBvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nLmlzU3VzcGVuZGVkKCkgJiYgIWJTaG93T3ZlcmxheSkge1xuXHRcdFx0b0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZy5yZXN1bWUoKTtcblx0XHR9XG5cdH1cblxuXHRhdHRhY2hEYXRhUmVjaXZlZEhhbmRsZXIob0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZzogYW55KSB7XG5cdFx0aWYgKG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmcpIHtcblx0XHRcdG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmcuYXR0YWNoRXZlbnQoXCJkYXRhUmVjZWl2ZWRcIiwgdGhpcy5vbkludGVybmFsRGF0YVJlY2VpdmVkLCB0aGlzKTtcblx0XHRcdHRoaXMuX29DaGFydEJpbmRpbmcgPSBvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nO1xuXHRcdH1cblx0fVxuXG5cdGRldGFjaERhdGFSZWNlaXZlZEhhbmRsZXIob0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZzogYW55KSB7XG5cdFx0aWYgKG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmcpIHtcblx0XHRcdG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmcuZGV0YWNoRXZlbnQoXCJkYXRhUmVjZWl2ZWRcIiwgdGhpcy5vbkludGVybmFsRGF0YVJlY2VpdmVkLCB0aGlzKTtcblx0XHRcdHRoaXMuX29DaGFydEJpbmRpbmcgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG5cblx0c2V0U2hvd1ZhbHVlSGVscChiU2hvd1ZhbHVlSGVscDogYW55KSB7XG5cdFx0aWYgKHRoaXMuZ2V0SXRlbXMoKS5sZW5ndGggPiAwKSB7XG5cdFx0XHRjb25zdCBvVmlzdWFsRmlsdGVyQ29udHJvbCA9ICh0aGlzLmdldEl0ZW1zKClbMF0gYXMgYW55KS5nZXRJdGVtcygpWzBdO1xuXHRcdFx0b1Zpc3VhbEZpbHRlckNvbnRyb2wuZ2V0Q29udGVudCgpLnNvbWUoZnVuY3Rpb24gKG9Jbm5lckNvbnRyb2w6IGFueSkge1xuXHRcdFx0XHRpZiAob0lubmVyQ29udHJvbC5pc0EoXCJzYXAubS5CdXR0b25cIikpIHtcblx0XHRcdFx0XHRvSW5uZXJDb250cm9sLnNldFZpc2libGUoYlNob3dWYWx1ZUhlbHApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMuc2V0UHJvcGVydHkoXCJzaG93VmFsdWVIZWxwXCIsIGJTaG93VmFsdWVIZWxwKTtcblx0XHR9XG5cdH1cblxuXHRzZXRWYWx1ZUhlbHBJY29uU3JjKHNJY29uU3JjOiBhbnkpIHtcblx0XHRpZiAodGhpcy5nZXRJdGVtcygpLmxlbmd0aCA+IDApIHtcblx0XHRcdGNvbnN0IG9WaXN1YWxGaWx0ZXJDb250cm9sID0gKHRoaXMuZ2V0SXRlbXMoKVswXSBhcyBhbnkpLmdldEl0ZW1zKClbMF07XG5cdFx0XHRvVmlzdWFsRmlsdGVyQ29udHJvbC5nZXRDb250ZW50KCkuc29tZShmdW5jdGlvbiAob0lubmVyQ29udHJvbDogYW55KSB7XG5cdFx0XHRcdGlmIChvSW5uZXJDb250cm9sLmlzQShcInNhcC5tLkJ1dHRvblwiKSkge1xuXHRcdFx0XHRcdG9Jbm5lckNvbnRyb2wuc2V0SWNvbihzSWNvblNyYyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5zZXRQcm9wZXJ0eShcInZhbHVlSGVscEljb25TcmNcIiwgc0ljb25TcmMpO1xuXHRcdH1cblx0fVxuXG5cdG9uSW50ZXJuYWxEYXRhUmVjZWl2ZWQob0V2ZW50OiBhbnkpIHtcblx0XHRjb25zdCBzSWQgPSB0aGlzLmdldElkKCk7XG5cdFx0Y29uc3Qgb1ZpZXcgPSBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KHRoaXMpO1xuXHRcdGNvbnN0IG9JbnRlcmFjdGl2ZUNoYXJ0ID0gKHRoaXMuZ2V0SXRlbXMoKVsxXSBhcyBhbnkpLmdldEl0ZW1zKClbMF07XG5cdFx0Y29uc3Qgc0ludGVybmFsQ29udGV4dFBhdGggPSB0aGlzLmRhdGEoXCJpbmZvUGF0aFwiKTtcblx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvSW50ZXJhY3RpdmVDaGFydC5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpO1xuXHRcdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLm1hY3Jvc1wiKTtcblx0XHRjb25zdCB2VU9NID0gb0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcInVvbVwiKTtcblx0XHRWaXN1YWxGaWx0ZXJVdGlscy51cGRhdGVDaGFydFNjYWxlRmFjdG9yVGl0bGUob0ludGVyYWN0aXZlQ2hhcnQsIG9WaWV3LCBzSWQsIHNJbnRlcm5hbENvbnRleHRQYXRoKTtcblx0XHRpZiAob0V2ZW50LmdldFBhcmFtZXRlcihcImVycm9yXCIpKSB7XG5cdFx0XHRjb25zdCBzMThuTWVzc2FnZVRpdGxlID0gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX0VSUk9SX01FU1NBR0VfVElUTEVcIik7XG5cdFx0XHRjb25zdCBzMThuTWVzc2FnZSA9IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSU19FUlJPUl9EQVRBX1RFWFRcIik7XG5cdFx0XHRWaXN1YWxGaWx0ZXJVdGlscy5hcHBseUVycm9yTWVzc2FnZUFuZFRpdGxlKHMxOG5NZXNzYWdlVGl0bGUsIHMxOG5NZXNzYWdlLCBzSW50ZXJuYWxDb250ZXh0UGF0aCwgb1ZpZXcpO1xuXHRcdH0gZWxzZSBpZiAob0V2ZW50LmdldFBhcmFtZXRlcihcImRhdGFcIikpIHtcblx0XHRcdGNvbnN0IG9EYXRhID0gb0V2ZW50LmdldFNvdXJjZSgpLmdldEN1cnJlbnRDb250ZXh0cygpO1xuXHRcdFx0aWYgKG9EYXRhICYmIG9EYXRhLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRWaXN1YWxGaWx0ZXJVdGlscy5zZXROb0RhdGFNZXNzYWdlKHNJbnRlcm5hbENvbnRleHRQYXRoLCBvUmVzb3VyY2VCdW5kbGUsIG9WaWV3KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShzSW50ZXJuYWxDb250ZXh0UGF0aCwge30pO1xuXHRcdFx0fVxuXHRcdFx0VmlzdWFsRmlsdGVyVXRpbHMuc2V0TXVsdGlVT01NZXNzYWdlKG9EYXRhLCBvSW50ZXJhY3RpdmVDaGFydCwgc0ludGVybmFsQ29udGV4dFBhdGgsIG9SZXNvdXJjZUJ1bmRsZSwgb1ZpZXcpO1xuXHRcdH1cblx0XHRpZiAodlVPTSAmJiAoKHZVT01bXCJJU09DdXJyZW5jeVwiXSAmJiB2VU9NW1wiSVNPQ3VycmVuY3lcIl0uJFBhdGgpIHx8ICh2VU9NW1wiVW5pdFwiXSAmJiB2VU9NW1wiVW5pdFwiXS4kUGF0aCkpKSB7XG5cdFx0XHRjb25zdCBvQ29udGV4dHMgPSBvRXZlbnQuZ2V0U291cmNlKCkuZ2V0Q29udGV4dHMoKTtcblx0XHRcdGNvbnN0IG9Db250ZXh0RGF0YSA9IG9Db250ZXh0cyAmJiBvQ29udGV4dHNbMF0uZ2V0T2JqZWN0KCk7XG5cdFx0XHRWaXN1YWxGaWx0ZXJVdGlscy5hcHBseVVPTVRvVGl0bGUob0ludGVyYWN0aXZlQ2hhcnQsIG9Db250ZXh0RGF0YSwgb1ZpZXcsIHNJbnRlcm5hbENvbnRleHRQYXRoKTtcblx0XHR9XG5cdH1cbn1cbmV4cG9ydCBkZWZhdWx0IFZpc3VhbEZpbHRlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7OztFQVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBWkEsSUFjTUEsWUFBWSxXQURqQkMsY0FB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