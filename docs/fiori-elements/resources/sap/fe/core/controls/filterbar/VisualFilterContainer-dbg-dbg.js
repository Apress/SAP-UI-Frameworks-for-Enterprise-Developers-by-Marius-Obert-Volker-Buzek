/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/m/FlexBox", "sap/m/HeaderContainer", "sap/ui/core/library", "sap/ui/Device", "sap/ui/mdc/filterbar/IFilterContainer"], function (ClassSupport, FlexBox, HeaderContainer, coreLibrabry, Device, IFilterContainer) {
  "use strict";

  var _dec, _dec2, _class, _class2, _descriptor;
  var system = Device.system;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Constructor for a new Visual Filter Container.
   * Used for visual filters.
   *
   * @extends sap.ui.mdc.filterbar.IFilterContainer
   * @class
   * @private
   * @alias sap.fe.core.controls.filterbar.VisualFilterContainer
   */
  let VisualFilterContainer = (_dec = defineUI5Class("sap.fe.core.controls.filterbar.VisualFilterContainer"), _dec2 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false,
    visibility: "hidden"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_IFilterContainer) {
    _inheritsLoose(VisualFilterContainer, _IFilterContainer);
    function VisualFilterContainer() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _IFilterContainer.call(this, ...args) || this;
      _initializerDefineProperty(_this, "_layout", _descriptor, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = VisualFilterContainer.prototype;
    _proto.init = function init() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      _IFilterContainer.prototype.init.call(this, ...args);
      //var oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
      const sDeviceSystem = system,
        Orientation = coreLibrabry.Orientation,
        sOrientation = sDeviceSystem.phone ? Orientation.Vertical : undefined,
        sDirection = sDeviceSystem.phone ? "ColumnReverse" : "Column";
      this.oHeaderContainer = new HeaderContainer({
        orientation: sOrientation
      });
      this.oButtonFlexBox = new FlexBox({
        alignItems: "End",
        justifyContent: "End"
      });
      this.oLayout = new FlexBox({
        direction: sDirection,
        // Direction is Column Reverse for Phone
        items: [this.oHeaderContainer, this.oButtonFlexBox]
      });
      this.aAllFilterFields = [];
      this.aVisualFilterFields = {};
    };
    _proto.exit = function exit() {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }
      // destroy layout
      _IFilterContainer.prototype.exit.call(this, ...args);
      // destroy all filter fields which are not in the layout
      const aAllFilterFields = this.getAllFilterFields();
      aAllFilterFields.forEach(function (oFilterField) {
        oFilterField.destroy();
      });
      this.oHeaderContainer = null;
      this.oButtonFlexBox = null;
      this.aAllFilterFields = [];
    };
    _proto.insertFilterField = function insertFilterField(oControl, iIndex) {
      const oFilterItemLayoutEventDelegate = {
        onBeforeRendering: function () {
          // visual filter does not need to render a label
          // hence override the getContent of the FilterItemLayout
          // and store the original getContent for later usage in the compact filters
          if (!oControl._fnGetContentCopy) {
            oControl._fnGetContentCopy = oControl.getContent;
          }
          // override getContent of FilterItemLayout
          // to add only filterField and not label
          oControl.getContent = function () {
            const aContent = [];
            aContent.push(oControl._oFilterField);
            return aContent;
          };
          oControl.removeEventDelegate(oFilterItemLayoutEventDelegate);
        }
      };
      oControl.addEventDelegate(oFilterItemLayoutEventDelegate);

      // Setting VF control for the Filterfield.
      const oVisualFilters = this.aVisualFilterFields;
      oControl.getContent().some(oInnerControl => {
        const sFFId = oInnerControl.getId();
        if (oVisualFilters[sFFId] && oInnerControl.isA("sap.ui.mdc.FilterField")) {
          oInnerControl.setContent(oVisualFilters[sFFId]);
          this.oHeaderContainer.insertContent(oControl, iIndex);
        }
      });
    };
    _proto.removeFilterField = function removeFilterField(oControl) {
      this.oHeaderContainer.removeContent(oControl);
    };
    _proto.removeAllFilterFields = function removeAllFilterFields() {
      this.aAllFilterFields = [];
      this.aVisualFilterFields = {};
      this.oHeaderContainer.removeAllContent();
    };
    _proto.getFilterFields = function getFilterFields() {
      return this.oHeaderContainer.getContent();
    };
    _proto.addButton = function addButton(oControl) {
      this.oButtonFlexBox.insertItem(oControl);
    };
    _proto.getAllButtons = function getAllButtons() {
      return this.oButtonFlexBox.getItems().reverse();
    };
    _proto.removeButton = function removeButton(oControl) {
      this.oButtonFlexBox.removeItem(oControl);
    };
    _proto.getAllFilterFields = function getAllFilterFields() {
      return this.aAllFilterFields.slice();
    };
    _proto.setAllFilterFields = function setAllFilterFields(aFilterFields, aVisualFilterFields) {
      this.aAllFilterFields = aFilterFields;
      this.aVisualFilterFields = aVisualFilterFields;
    };
    return VisualFilterContainer;
  }(IFilterContainer), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "_layout", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return VisualFilterContainer;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWaXN1YWxGaWx0ZXJDb250YWluZXIiLCJkZWZpbmVVSTVDbGFzcyIsImFnZ3JlZ2F0aW9uIiwidHlwZSIsIm11bHRpcGxlIiwidmlzaWJpbGl0eSIsImluaXQiLCJhcmdzIiwic0RldmljZVN5c3RlbSIsInN5c3RlbSIsIk9yaWVudGF0aW9uIiwiY29yZUxpYnJhYnJ5Iiwic09yaWVudGF0aW9uIiwicGhvbmUiLCJWZXJ0aWNhbCIsInVuZGVmaW5lZCIsInNEaXJlY3Rpb24iLCJvSGVhZGVyQ29udGFpbmVyIiwiSGVhZGVyQ29udGFpbmVyIiwib3JpZW50YXRpb24iLCJvQnV0dG9uRmxleEJveCIsIkZsZXhCb3giLCJhbGlnbkl0ZW1zIiwianVzdGlmeUNvbnRlbnQiLCJvTGF5b3V0IiwiZGlyZWN0aW9uIiwiaXRlbXMiLCJhQWxsRmlsdGVyRmllbGRzIiwiYVZpc3VhbEZpbHRlckZpZWxkcyIsImV4aXQiLCJnZXRBbGxGaWx0ZXJGaWVsZHMiLCJmb3JFYWNoIiwib0ZpbHRlckZpZWxkIiwiZGVzdHJveSIsImluc2VydEZpbHRlckZpZWxkIiwib0NvbnRyb2wiLCJpSW5kZXgiLCJvRmlsdGVySXRlbUxheW91dEV2ZW50RGVsZWdhdGUiLCJvbkJlZm9yZVJlbmRlcmluZyIsIl9mbkdldENvbnRlbnRDb3B5IiwiZ2V0Q29udGVudCIsImFDb250ZW50IiwicHVzaCIsIl9vRmlsdGVyRmllbGQiLCJyZW1vdmVFdmVudERlbGVnYXRlIiwiYWRkRXZlbnREZWxlZ2F0ZSIsIm9WaXN1YWxGaWx0ZXJzIiwic29tZSIsIm9Jbm5lckNvbnRyb2wiLCJzRkZJZCIsImdldElkIiwiaXNBIiwic2V0Q29udGVudCIsImluc2VydENvbnRlbnQiLCJyZW1vdmVGaWx0ZXJGaWVsZCIsInJlbW92ZUNvbnRlbnQiLCJyZW1vdmVBbGxGaWx0ZXJGaWVsZHMiLCJyZW1vdmVBbGxDb250ZW50IiwiZ2V0RmlsdGVyRmllbGRzIiwiYWRkQnV0dG9uIiwiaW5zZXJ0SXRlbSIsImdldEFsbEJ1dHRvbnMiLCJnZXRJdGVtcyIsInJldmVyc2UiLCJyZW1vdmVCdXR0b24iLCJyZW1vdmVJdGVtIiwic2xpY2UiLCJzZXRBbGxGaWx0ZXJGaWVsZHMiLCJhRmlsdGVyRmllbGRzIiwiSUZpbHRlckNvbnRhaW5lciJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVmlzdWFsRmlsdGVyQ29udGFpbmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGFnZ3JlZ2F0aW9uLCBkZWZpbmVVSTVDbGFzcyB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IEZsZXhCb3ggZnJvbSBcInNhcC9tL0ZsZXhCb3hcIjtcbmltcG9ydCBIZWFkZXJDb250YWluZXIgZnJvbSBcInNhcC9tL0hlYWRlckNvbnRhaW5lclwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IGNvcmVMaWJyYWJyeSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IHsgc3lzdGVtIH0gZnJvbSBcInNhcC91aS9EZXZpY2VcIjtcbmltcG9ydCBJRmlsdGVyQ29udGFpbmVyIGZyb20gXCJzYXAvdWkvbWRjL2ZpbHRlcmJhci9JRmlsdGVyQ29udGFpbmVyXCI7XG4vKipcbiAqIENvbnN0cnVjdG9yIGZvciBhIG5ldyBWaXN1YWwgRmlsdGVyIENvbnRhaW5lci5cbiAqIFVzZWQgZm9yIHZpc3VhbCBmaWx0ZXJzLlxuICpcbiAqIEBleHRlbmRzIHNhcC51aS5tZGMuZmlsdGVyYmFyLklGaWx0ZXJDb250YWluZXJcbiAqIEBjbGFzc1xuICogQHByaXZhdGVcbiAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9scy5maWx0ZXJiYXIuVmlzdWFsRmlsdGVyQ29udGFpbmVyXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xzLmZpbHRlcmJhci5WaXN1YWxGaWx0ZXJDb250YWluZXJcIilcbmNsYXNzIFZpc3VhbEZpbHRlckNvbnRhaW5lciBleHRlbmRzIElGaWx0ZXJDb250YWluZXIge1xuXHRAYWdncmVnYXRpb24oe1xuXHRcdHR5cGU6IFwic2FwLnVpLmNvcmUuQ29udHJvbFwiLFxuXHRcdG11bHRpcGxlOiBmYWxzZSxcblx0XHR2aXNpYmlsaXR5OiBcImhpZGRlblwiXG5cdH0pXG5cdC8qKlxuXHQgKiBJbnRlcm5hbCBoaWRkZW4gYWdncmVnYXRpb24gdG8gaG9sZCB0aGUgaW5uZXIgbGF5b3V0LlxuXHQgKi9cblx0X2xheW91dCE6IENvbnRyb2w7XG5cblx0aW5pdCguLi5hcmdzOiBhbnlbXSkge1xuXHRcdHN1cGVyLmluaXQoLi4uYXJncyk7XG5cdFx0Ly92YXIgb1JCID0gc2FwLnVpLmdldENvcmUoKS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAudWkubWRjXCIpO1xuXHRcdGNvbnN0IHNEZXZpY2VTeXN0ZW0gPSBzeXN0ZW0sXG5cdFx0XHRPcmllbnRhdGlvbiA9IGNvcmVMaWJyYWJyeS5PcmllbnRhdGlvbixcblx0XHRcdHNPcmllbnRhdGlvbiA9IHNEZXZpY2VTeXN0ZW0ucGhvbmUgPyBPcmllbnRhdGlvbi5WZXJ0aWNhbCA6IHVuZGVmaW5lZCxcblx0XHRcdHNEaXJlY3Rpb24gPSBzRGV2aWNlU3lzdGVtLnBob25lID8gXCJDb2x1bW5SZXZlcnNlXCIgOiBcIkNvbHVtblwiO1xuXG5cdFx0dGhpcy5vSGVhZGVyQ29udGFpbmVyID0gbmV3IEhlYWRlckNvbnRhaW5lcih7XG5cdFx0XHRvcmllbnRhdGlvbjogc09yaWVudGF0aW9uXG5cdFx0fSk7XG5cdFx0dGhpcy5vQnV0dG9uRmxleEJveCA9IG5ldyBGbGV4Qm94KHtcblx0XHRcdGFsaWduSXRlbXM6IFwiRW5kXCIsXG5cdFx0XHRqdXN0aWZ5Q29udGVudDogXCJFbmRcIlxuXHRcdH0pO1xuXG5cdFx0dGhpcy5vTGF5b3V0ID0gbmV3IEZsZXhCb3goe1xuXHRcdFx0ZGlyZWN0aW9uOiBzRGlyZWN0aW9uLCAvLyBEaXJlY3Rpb24gaXMgQ29sdW1uIFJldmVyc2UgZm9yIFBob25lXG5cdFx0XHRpdGVtczogW3RoaXMub0hlYWRlckNvbnRhaW5lciwgdGhpcy5vQnV0dG9uRmxleEJveF1cblx0XHR9KTtcblxuXHRcdHRoaXMuYUFsbEZpbHRlckZpZWxkcyA9IFtdO1xuXHRcdHRoaXMuYVZpc3VhbEZpbHRlckZpZWxkcyA9IHt9O1xuXHR9XG5cblx0ZXhpdCguLi5hcmdzOiBhbnlbXSkge1xuXHRcdC8vIGRlc3Ryb3kgbGF5b3V0XG5cdFx0c3VwZXIuZXhpdCguLi5hcmdzKTtcblx0XHQvLyBkZXN0cm95IGFsbCBmaWx0ZXIgZmllbGRzIHdoaWNoIGFyZSBub3QgaW4gdGhlIGxheW91dFxuXHRcdGNvbnN0IGFBbGxGaWx0ZXJGaWVsZHMgPSB0aGlzLmdldEFsbEZpbHRlckZpZWxkcygpO1xuXHRcdGFBbGxGaWx0ZXJGaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAob0ZpbHRlckZpZWxkOiBhbnkpIHtcblx0XHRcdG9GaWx0ZXJGaWVsZC5kZXN0cm95KCk7XG5cdFx0fSk7XG5cdFx0dGhpcy5vSGVhZGVyQ29udGFpbmVyID0gbnVsbDtcblx0XHR0aGlzLm9CdXR0b25GbGV4Qm94ID0gbnVsbDtcblx0XHR0aGlzLmFBbGxGaWx0ZXJGaWVsZHMgPSBbXTtcblx0fVxuXG5cdGluc2VydEZpbHRlckZpZWxkKG9Db250cm9sOiBhbnksIGlJbmRleDogYW55KSB7XG5cdFx0Y29uc3Qgb0ZpbHRlckl0ZW1MYXlvdXRFdmVudERlbGVnYXRlID0ge1xuXHRcdFx0b25CZWZvcmVSZW5kZXJpbmc6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0Ly8gdmlzdWFsIGZpbHRlciBkb2VzIG5vdCBuZWVkIHRvIHJlbmRlciBhIGxhYmVsXG5cdFx0XHRcdC8vIGhlbmNlIG92ZXJyaWRlIHRoZSBnZXRDb250ZW50IG9mIHRoZSBGaWx0ZXJJdGVtTGF5b3V0XG5cdFx0XHRcdC8vIGFuZCBzdG9yZSB0aGUgb3JpZ2luYWwgZ2V0Q29udGVudCBmb3IgbGF0ZXIgdXNhZ2UgaW4gdGhlIGNvbXBhY3QgZmlsdGVyc1xuXHRcdFx0XHRpZiAoIW9Db250cm9sLl9mbkdldENvbnRlbnRDb3B5KSB7XG5cdFx0XHRcdFx0b0NvbnRyb2wuX2ZuR2V0Q29udGVudENvcHkgPSBvQ29udHJvbC5nZXRDb250ZW50O1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIG92ZXJyaWRlIGdldENvbnRlbnQgb2YgRmlsdGVySXRlbUxheW91dFxuXHRcdFx0XHQvLyB0byBhZGQgb25seSBmaWx0ZXJGaWVsZCBhbmQgbm90IGxhYmVsXG5cdFx0XHRcdG9Db250cm9sLmdldENvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0Y29uc3QgYUNvbnRlbnQgPSBbXTtcblx0XHRcdFx0XHRhQ29udGVudC5wdXNoKG9Db250cm9sLl9vRmlsdGVyRmllbGQpO1xuXHRcdFx0XHRcdHJldHVybiBhQ29udGVudDtcblx0XHRcdFx0fTtcblx0XHRcdFx0b0NvbnRyb2wucmVtb3ZlRXZlbnREZWxlZ2F0ZShvRmlsdGVySXRlbUxheW91dEV2ZW50RGVsZWdhdGUpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0b0NvbnRyb2wuYWRkRXZlbnREZWxlZ2F0ZShvRmlsdGVySXRlbUxheW91dEV2ZW50RGVsZWdhdGUpO1xuXG5cdFx0Ly8gU2V0dGluZyBWRiBjb250cm9sIGZvciB0aGUgRmlsdGVyZmllbGQuXG5cdFx0Y29uc3Qgb1Zpc3VhbEZpbHRlcnMgPSB0aGlzLmFWaXN1YWxGaWx0ZXJGaWVsZHM7XG5cdFx0b0NvbnRyb2wuZ2V0Q29udGVudCgpLnNvbWUoKG9Jbm5lckNvbnRyb2w6IGFueSkgPT4ge1xuXHRcdFx0Y29uc3Qgc0ZGSWQgPSBvSW5uZXJDb250cm9sLmdldElkKCk7XG5cdFx0XHRpZiAob1Zpc3VhbEZpbHRlcnNbc0ZGSWRdICYmIG9Jbm5lckNvbnRyb2wuaXNBKFwic2FwLnVpLm1kYy5GaWx0ZXJGaWVsZFwiKSkge1xuXHRcdFx0XHRvSW5uZXJDb250cm9sLnNldENvbnRlbnQob1Zpc3VhbEZpbHRlcnNbc0ZGSWRdKTtcblx0XHRcdFx0dGhpcy5vSGVhZGVyQ29udGFpbmVyLmluc2VydENvbnRlbnQob0NvbnRyb2wsIGlJbmRleCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRyZW1vdmVGaWx0ZXJGaWVsZChvQ29udHJvbDogYW55KSB7XG5cdFx0dGhpcy5vSGVhZGVyQ29udGFpbmVyLnJlbW92ZUNvbnRlbnQob0NvbnRyb2wpO1xuXHR9XG5cblx0cmVtb3ZlQWxsRmlsdGVyRmllbGRzKCkge1xuXHRcdHRoaXMuYUFsbEZpbHRlckZpZWxkcyA9IFtdO1xuXHRcdHRoaXMuYVZpc3VhbEZpbHRlckZpZWxkcyA9IHt9O1xuXHRcdHRoaXMub0hlYWRlckNvbnRhaW5lci5yZW1vdmVBbGxDb250ZW50KCk7XG5cdH1cblxuXHRnZXRGaWx0ZXJGaWVsZHMoKSB7XG5cdFx0cmV0dXJuIHRoaXMub0hlYWRlckNvbnRhaW5lci5nZXRDb250ZW50KCk7XG5cdH1cblxuXHRhZGRCdXR0b24ob0NvbnRyb2w6IGFueSkge1xuXHRcdHRoaXMub0J1dHRvbkZsZXhCb3guaW5zZXJ0SXRlbShvQ29udHJvbCk7XG5cdH1cblxuXHRnZXRBbGxCdXR0b25zKCkge1xuXHRcdHJldHVybiB0aGlzLm9CdXR0b25GbGV4Qm94LmdldEl0ZW1zKCkucmV2ZXJzZSgpO1xuXHR9XG5cblx0cmVtb3ZlQnV0dG9uKG9Db250cm9sOiBhbnkpIHtcblx0XHR0aGlzLm9CdXR0b25GbGV4Qm94LnJlbW92ZUl0ZW0ob0NvbnRyb2wpO1xuXHR9XG5cblx0Z2V0QWxsRmlsdGVyRmllbGRzKCkge1xuXHRcdHJldHVybiB0aGlzLmFBbGxGaWx0ZXJGaWVsZHMuc2xpY2UoKTtcblx0fVxuXG5cdHNldEFsbEZpbHRlckZpZWxkcyhhRmlsdGVyRmllbGRzOiBhbnksIGFWaXN1YWxGaWx0ZXJGaWVsZHM6IGFueSkge1xuXHRcdHRoaXMuYUFsbEZpbHRlckZpZWxkcyA9IGFGaWx0ZXJGaWVsZHM7XG5cdFx0dGhpcy5hVmlzdWFsRmlsdGVyRmllbGRzID0gYVZpc3VhbEZpbHRlckZpZWxkcztcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBWaXN1YWxGaWx0ZXJDb250YWluZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7O0VBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBUkEsSUFVTUEscUJBQXFCLFdBRDFCQyxjQUFjLENBQUMsc0RBQXNELENBQUMsVUFFckVDLFdBQVcsQ0FBQztJQUNaQyxJQUFJLEVBQUUscUJBQXFCO0lBQzNCQyxRQUFRLEVBQUUsS0FBSztJQUNmQyxVQUFVLEVBQUU7RUFDYixDQUFDLENBQUM7SUFBQTtJQUFBO01BQUE7TUFBQTtRQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7SUFBQTtJQUFBO0lBQUEsT0FNRkMsSUFBSSxHQUFKLGdCQUFxQjtNQUFBLG1DQUFiQyxJQUFJO1FBQUpBLElBQUk7TUFBQTtNQUNYLDRCQUFNRCxJQUFJLFlBQUMsR0FBR0MsSUFBSTtNQUNsQjtNQUNBLE1BQU1DLGFBQWEsR0FBR0MsTUFBTTtRQUMzQkMsV0FBVyxHQUFHQyxZQUFZLENBQUNELFdBQVc7UUFDdENFLFlBQVksR0FBR0osYUFBYSxDQUFDSyxLQUFLLEdBQUdILFdBQVcsQ0FBQ0ksUUFBUSxHQUFHQyxTQUFTO1FBQ3JFQyxVQUFVLEdBQUdSLGFBQWEsQ0FBQ0ssS0FBSyxHQUFHLGVBQWUsR0FBRyxRQUFRO01BRTlELElBQUksQ0FBQ0ksZ0JBQWdCLEdBQUcsSUFBSUMsZUFBZSxDQUFDO1FBQzNDQyxXQUFXLEVBQUVQO01BQ2QsQ0FBQyxDQUFDO01BQ0YsSUFBSSxDQUFDUSxjQUFjLEdBQUcsSUFBSUMsT0FBTyxDQUFDO1FBQ2pDQyxVQUFVLEVBQUUsS0FBSztRQUNqQkMsY0FBYyxFQUFFO01BQ2pCLENBQUMsQ0FBQztNQUVGLElBQUksQ0FBQ0MsT0FBTyxHQUFHLElBQUlILE9BQU8sQ0FBQztRQUMxQkksU0FBUyxFQUFFVCxVQUFVO1FBQUU7UUFDdkJVLEtB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