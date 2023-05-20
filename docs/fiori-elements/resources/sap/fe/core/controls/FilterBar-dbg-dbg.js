/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/controls/filterbar/FilterContainer", "sap/fe/core/controls/filterbar/VisualFilterContainer", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/Core", "sap/ui/mdc/FilterBar", "sap/ui/mdc/filterbar/aligned/FilterItemLayout"], function (FilterContainer, VisualFilterContainer, ClassSupport, Core, MdcFilterBar, FilterItemLayout) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var association = ClassSupport.association;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let FilterBar = (_dec = defineUI5Class("sap.fe.core.controls.FilterBar"), _dec2 = property({
    type: "string",
    defaultValue: "compact"
  }), _dec3 = association({
    type: "sap.m.SegmentedButton",
    multiple: false
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_MdcFilterBar) {
    _inheritsLoose(FilterBar, _MdcFilterBar);
    function FilterBar() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _MdcFilterBar.call(this, ...args) || this;
      _initializerDefineProperty(_this, "initialLayout", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "toggleControl", _descriptor2, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = FilterBar.prototype;
    _proto.setToggleControl = function setToggleControl(vToggle) {
      if (typeof vToggle === "string") {
        this._oSegmentedButton = Core.byId(vToggle);
      } else {
        this._oSegmentedButton = vToggle;
      }
      if (this.toggleControl && this._oSegmentedButton) {
        this._oSegmentedButton.detachEvent("select", this._toggleLayout.bind(this));
      }
      if (this._oSegmentedButton) {
        this._oSegmentedButton.attachEvent("select", this._toggleLayout.bind(this));
      }
      this.setAssociation("toggleControl", vToggle, true);
    };
    _proto._toggleLayout = function _toggleLayout() {
      // Since primary layout is always compact
      // hence set the secondary layout as visual filter only for the first time only
      if (!this._oSecondaryFilterBarLayout) {
        this._oSecondaryFilterBarLayout = new VisualFilterContainer();
      }

      // do not show Adapt Filters Button for visual layout
      if (this._oSecondaryFilterBarLayout.isA("sap.fe.core.controls.filterbar.VisualFilterContainer")) {
        this.setShowAdaptFiltersButton(false);
      } else {
        this.setShowAdaptFiltersButton(true);
      }

      // get all filter fields and button of the current layout
      const oCurrentFilterBarLayout = this._oFilterBarLayout;
      const oFilterItems = this.getFilterItems();
      const aFilterFields = oCurrentFilterBarLayout.getAllFilterFields();
      const aSortedFilterFields = this.getSortedFilterFields(oFilterItems, aFilterFields);
      const aButtons = oCurrentFilterBarLayout.getAllButtons();
      const aVisualFilterFields = oCurrentFilterBarLayout.getAllVisualFilterFields && oCurrentFilterBarLayout.getAllVisualFilterFields();
      if (this._oSecondaryFilterBarLayout.isA("sap.fe.core.controls.filterbar.VisualFilterContainer")) {
        this._oSecondaryFilterBarLayout.setAllFilterFields(aSortedFilterFields, aVisualFilterFields);
      }
      // use secondary filter bar layout as new layout
      this._oFilterBarLayout = this._oSecondaryFilterBarLayout;

      // insert all filter fields from current layout to new layout
      aFilterFields.forEach((oFilterField, iIndex) => {
        oCurrentFilterBarLayout.removeFilterField(oFilterField);
        this._oFilterBarLayout.insertFilterField(oFilterField, iIndex);
      });
      // insert all buttons from the current layout to the new layout
      aButtons.forEach(oButton => {
        oCurrentFilterBarLayout.removeButton(oButton);
        this._oFilterBarLayout.addButton(oButton);
      });

      // set the current filter bar layout to the secondary one
      this._oSecondaryFilterBarLayout = oCurrentFilterBarLayout;

      // update the layout aggregation of the filter bar and rerender the same.
      this.setAggregation("layout", this._oFilterBarLayout, true);
      this._oFilterBarLayout.rerender();
    };
    _proto.getSortedFilterFields = function getSortedFilterFields(aFilterItems, aFilterFields) {
      const aFilterIds = [];
      aFilterItems.forEach(function (oFilterItem) {
        aFilterIds.push(oFilterItem.getId());
      });
      aFilterFields.sort(function (aFirstItem, aSecondItem) {
        let sFirstItemVFId, sSecondItemVFId;
        aFirstItem.getContent().forEach(function (oInnerControl) {
          if (oInnerControl.isA("sap.ui.mdc.FilterField")) {
            sFirstItemVFId = oInnerControl.getId();
          }
        });
        aSecondItem.getContent().forEach(function (oInnerControl) {
          if (oInnerControl.isA("sap.ui.mdc.FilterField")) {
            sSecondItemVFId = oInnerControl.getId();
          }
        });
        return aFilterIds.indexOf(sFirstItemVFId) - aFilterIds.indexOf(sSecondItemVFId);
      });
      return aFilterFields;
    };
    _proto._createInnerLayout = function _createInnerLayout() {
      this._oFilterBarLayout = new FilterContainer();
      this._cLayoutItem = FilterItemLayout;
      this._oFilterBarLayout.getInner().addStyleClass("sapUiMdcFilterBarBaseAFLayout");
      this._addButtons();

      // TODO: Check with MDC if there is a better way to load visual filter on the basis of control property
      // _createInnerLayout is called on Init by the filter bar base.
      // This mean that we do not have access to the control properties yet
      // and hence we cannot decide on the basis of control properties whether initial layout should be compact or visual
      // As a result we have to do this workaround to always load the compact layout by default
      // And toogle the same in case the initialLayout was supposed to be visual filters.
      const oInnerLayout = this._oFilterBarLayout.getInner();
      const oFilterContainerInnerLayoutEventDelegate = {
        onBeforeRendering: () => {
          if (this.initialLayout === "visual") {
            this._toggleLayout();
          }
          oInnerLayout.removeEventDelegate(oFilterContainerInnerLayoutEventDelegate);
        }
      };
      oInnerLayout.addEventDelegate(oFilterContainerInnerLayoutEventDelegate);
      this.setAggregation("layout", this._oFilterBarLayout, true);
    };
    _proto.exit = function exit() {
      _MdcFilterBar.prototype.exit.call(this);
      // Sometimes upon external navigation this._SegmentedButton is already destroyed
      // so check if it exists and then only remove stuff
      if (this._oSegmentedButton) {
        this._oSegmentedButton.detachEvent("select", this._toggleLayout);
        delete this._oSegmentedButton;
      }
    };
    _proto.getSegmentedButton = function getSegmentedButton() {
      return this._oSegmentedButton;
    };
    return FilterBar;
  }(MdcFilterBar), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "initialLayout", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "toggleControl", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return FilterBar;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaWx0ZXJCYXIiLCJkZWZpbmVVSTVDbGFzcyIsInByb3BlcnR5IiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsImFzc29jaWF0aW9uIiwibXVsdGlwbGUiLCJzZXRUb2dnbGVDb250cm9sIiwidlRvZ2dsZSIsIl9vU2VnbWVudGVkQnV0dG9uIiwiQ29yZSIsImJ5SWQiLCJ0b2dnbGVDb250cm9sIiwiZGV0YWNoRXZlbnQiLCJfdG9nZ2xlTGF5b3V0IiwiYmluZCIsImF0dGFjaEV2ZW50Iiwic2V0QXNzb2NpYXRpb24iLCJfb1NlY29uZGFyeUZpbHRlckJhckxheW91dCIsIlZpc3VhbEZpbHRlckNvbnRhaW5lciIsImlzQSIsInNldFNob3dBZGFwdEZpbHRlcnNCdXR0b24iLCJvQ3VycmVudEZpbHRlckJhckxheW91dCIsIl9vRmlsdGVyQmFyTGF5b3V0Iiwib0ZpbHRlckl0ZW1zIiwiZ2V0RmlsdGVySXRlbXMiLCJhRmlsdGVyRmllbGRzIiwiZ2V0QWxsRmlsdGVyRmllbGRzIiwiYVNvcnRlZEZpbHRlckZpZWxkcyIsImdldFNvcnRlZEZpbHRlckZpZWxkcyIsImFCdXR0b25zIiwiZ2V0QWxsQnV0dG9ucyIsImFWaXN1YWxGaWx0ZXJGaWVsZHMiLCJnZXRBbGxWaXN1YWxGaWx0ZXJGaWVsZHMiLCJzZXRBbGxGaWx0ZXJGaWVsZHMiLCJmb3JFYWNoIiwib0ZpbHRlckZpZWxkIiwiaUluZGV4IiwicmVtb3ZlRmlsdGVyRmllbGQiLCJpbnNlcnRGaWx0ZXJGaWVsZCIsIm9CdXR0b24iLCJyZW1vdmVCdXR0b24iLCJhZGRCdXR0b24iLCJzZXRBZ2dyZWdhdGlvbiIsInJlcmVuZGVyIiwiYUZpbHRlckl0ZW1zIiwiYUZpbHRlcklkcyIsIm9GaWx0ZXJJdGVtIiwicHVzaCIsImdldElkIiwic29ydCIsImFGaXJzdEl0ZW0iLCJhU2Vjb25kSXRlbSIsInNGaXJzdEl0ZW1WRklkIiwic1NlY29uZEl0ZW1WRklkIiwiZ2V0Q29udGVudCIsIm9Jbm5lckNvbnRyb2wiLCJpbmRleE9mIiwiX2NyZWF0ZUlubmVyTGF5b3V0IiwiRmlsdGVyQ29udGFpbmVyIiwiX2NMYXlvdXRJdGVtIiwiRmlsdGVySXRlbUxheW91dCIsImdldElubmVyIiwiYWRkU3R5bGVDbGFzcyIsIl9hZGRCdXR0b25zIiwib0lubmVyTGF5b3V0Iiwib0ZpbHRlckNvbnRhaW5lcklubmVyTGF5b3V0RXZlbnREZWxlZ2F0ZSIsIm9uQmVmb3JlUmVuZGVyaW5nIiwiaW5pdGlhbExheW91dCIsInJlbW92ZUV2ZW50RGVsZWdhdGUiLCJhZGRFdmVudERlbGVnYXRlIiwiZXhpdCIsImdldFNlZ21lbnRlZEJ1dHRvbiIsIk1kY0ZpbHRlckJhciJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmlsdGVyQmFyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBGaWx0ZXJDb250YWluZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xzL2ZpbHRlcmJhci9GaWx0ZXJDb250YWluZXJcIjtcbmltcG9ydCBWaXN1YWxGaWx0ZXJDb250YWluZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xzL2ZpbHRlcmJhci9WaXN1YWxGaWx0ZXJDb250YWluZXJcIjtcbmltcG9ydCB7IGFzc29jaWF0aW9uLCBkZWZpbmVVSTVDbGFzcywgcHJvcGVydHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB0eXBlIFNlZ21lbnRlZEJ1dHRvbiBmcm9tIFwic2FwL20vU2VnbWVudGVkQnV0dG9uXCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IE1kY0ZpbHRlckJhciBmcm9tIFwic2FwL3VpL21kYy9GaWx0ZXJCYXJcIjtcbmltcG9ydCBGaWx0ZXJJdGVtTGF5b3V0IGZyb20gXCJzYXAvdWkvbWRjL2ZpbHRlcmJhci9hbGlnbmVkL0ZpbHRlckl0ZW1MYXlvdXRcIjtcbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xzLkZpbHRlckJhclwiKVxuY2xhc3MgRmlsdGVyQmFyIGV4dGVuZHMgTWRjRmlsdGVyQmFyIHtcblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdFZhbHVlOiBcImNvbXBhY3RcIiB9KVxuXHRpbml0aWFsTGF5b3V0ITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBDb250cm9sIHdoaWNoIGFsbG93cyBmb3Igc3dpdGNoaW5nIGJldHdlZW4gdmlzdWFsIGFuZCBub3JtYWwgZmlsdGVyIGxheW91dHNcblx0ICovXG5cdEBhc3NvY2lhdGlvbih7XG5cdFx0dHlwZTogXCJzYXAubS5TZWdtZW50ZWRCdXR0b25cIixcblx0XHRtdWx0aXBsZTogZmFsc2Vcblx0fSlcblx0dG9nZ2xlQ29udHJvbCE6IFNlZ21lbnRlZEJ1dHRvbjtcblxuXHRwcml2YXRlIF9vU2VnbWVudGVkQnV0dG9uPzogU2VnbWVudGVkQnV0dG9uO1xuXG5cdHByaXZhdGUgX29TZWNvbmRhcnlGaWx0ZXJCYXJMYXlvdXQ6IGFueTtcblxuXHRwcml2YXRlIF9vRmlsdGVyQmFyTGF5b3V0OiBhbnk7XG5cblx0cHJpdmF0ZSBfY0xheW91dEl0ZW06IGFueTtcblxuXHRzZXRUb2dnbGVDb250cm9sKHZUb2dnbGU6IHN0cmluZyB8IFNlZ21lbnRlZEJ1dHRvbikge1xuXHRcdGlmICh0eXBlb2YgdlRvZ2dsZSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0dGhpcy5fb1NlZ21lbnRlZEJ1dHRvbiA9IENvcmUuYnlJZCh2VG9nZ2xlKSBhcyBTZWdtZW50ZWRCdXR0b247XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX29TZWdtZW50ZWRCdXR0b24gPSB2VG9nZ2xlO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLnRvZ2dsZUNvbnRyb2wgJiYgdGhpcy5fb1NlZ21lbnRlZEJ1dHRvbikge1xuXHRcdFx0dGhpcy5fb1NlZ21lbnRlZEJ1dHRvbi5kZXRhY2hFdmVudChcInNlbGVjdFwiLCB0aGlzLl90b2dnbGVMYXlvdXQuYmluZCh0aGlzKSk7XG5cdFx0fVxuXHRcdGlmICh0aGlzLl9vU2VnbWVudGVkQnV0dG9uKSB7XG5cdFx0XHR0aGlzLl9vU2VnbWVudGVkQnV0dG9uLmF0dGFjaEV2ZW50KFwic2VsZWN0XCIsIHRoaXMuX3RvZ2dsZUxheW91dC5iaW5kKHRoaXMpKTtcblx0XHR9XG5cdFx0dGhpcy5zZXRBc3NvY2lhdGlvbihcInRvZ2dsZUNvbnRyb2xcIiwgdlRvZ2dsZSwgdHJ1ZSk7XG5cdH1cblxuXHRfdG9nZ2xlTGF5b3V0KCkge1xuXHRcdC8vIFNpbmNlIHByaW1hcnkgbGF5b3V0IGlzIGFsd2F5cyBjb21wYWN0XG5cdFx0Ly8gaGVuY2Ugc2V0IHRoZSBzZWNvbmRhcnkgbGF5b3V0IGFzIHZpc3VhbCBmaWx0ZXIgb25seSBmb3IgdGhlIGZpcnN0IHRpbWUgb25seVxuXHRcdGlmICghdGhpcy5fb1NlY29uZGFyeUZpbHRlckJhckxheW91dCkge1xuXHRcdFx0dGhpcy5fb1NlY29uZGFyeUZpbHRlckJhckxheW91dCA9IG5ldyBWaXN1YWxGaWx0ZXJDb250YWluZXIoKTtcblx0XHR9XG5cblx0XHQvLyBkbyBub3Qgc2hvdyBBZGFwdCBGaWx0ZXJzIEJ1dHRvbiBmb3IgdmlzdWFsIGxheW91dFxuXHRcdGlmICh0aGlzLl9vU2Vjb25kYXJ5RmlsdGVyQmFyTGF5b3V0LmlzQShcInNhcC5mZS5jb3JlLmNvbnRyb2xzLmZpbHRlcmJhci5WaXN1YWxGaWx0ZXJDb250YWluZXJcIikpIHtcblx0XHRcdHRoaXMuc2V0U2hvd0FkYXB0RmlsdGVyc0J1dHRvbihmYWxzZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuc2V0U2hvd0FkYXB0RmlsdGVyc0J1dHRvbih0cnVlKTtcblx0XHR9XG5cblx0XHQvLyBnZXQgYWxsIGZpbHRlciBmaWVsZHMgYW5kIGJ1dHRvbiBvZiB0aGUgY3VycmVudCBsYXlvdXRcblx0XHRjb25zdCBvQ3VycmVudEZpbHRlckJhckxheW91dCA9IHRoaXMuX29GaWx0ZXJCYXJMYXlvdXQ7XG5cdFx0Y29uc3Qgb0ZpbHRlckl0ZW1zID0gdGhpcy5nZXRGaWx0ZXJJdGVtcygpO1xuXHRcdGNvbnN0IGFGaWx0ZXJGaWVsZHMgPSBvQ3VycmVudEZpbHRlckJhckxheW91dC5nZXRBbGxGaWx0ZXJGaWVsZHMoKTtcblx0XHRjb25zdCBhU29ydGVkRmlsdGVyRmllbGRzID0gdGhpcy5nZXRTb3J0ZWRGaWx0ZXJGaWVsZHMob0ZpbHRlckl0ZW1zLCBhRmlsdGVyRmllbGRzKTtcblx0XHRjb25zdCBhQnV0dG9ucyA9IG9DdXJyZW50RmlsdGVyQmFyTGF5b3V0LmdldEFsbEJ1dHRvbnMoKTtcblx0XHRjb25zdCBhVmlzdWFsRmlsdGVyRmllbGRzID0gb0N1cnJlbnRGaWx0ZXJCYXJMYXlvdXQuZ2V0QWxsVmlzdWFsRmlsdGVyRmllbGRzICYmIG9DdXJyZW50RmlsdGVyQmFyTGF5b3V0LmdldEFsbFZpc3VhbEZpbHRlckZpZWxkcygpO1xuXHRcdGlmICh0aGlzLl9vU2Vjb25kYXJ5RmlsdGVyQmFyTGF5b3V0LmlzQShcInNhcC5mZS5jb3JlLmNvbnRyb2xzLmZpbHRlcmJhci5WaXN1YWxGaWx0ZXJDb250YWluZXJcIikpIHtcblx0XHRcdHRoaXMuX29TZWNvbmRhcnlGaWx0ZXJCYXJMYXlvdXQuc2V0QWxsRmlsdGVyRmllbGRzKGFTb3J0ZWRGaWx0ZXJGaWVsZHMsIGFWaXN1YWxGaWx0ZXJGaWVsZHMpO1xuXHRcdH1cblx0XHQvLyB1c2Ugc2Vjb25kYXJ5IGZpbHRlciBiYXIgbGF5b3V0IGFzIG5ldyBsYXlvdXRcblx0XHR0aGlzLl9vRmlsdGVyQmFyTGF5b3V0ID0gdGhpcy5fb1NlY29uZGFyeUZpbHRlckJhckxheW91dDtcblxuXHRcdC8vIGluc2VydCBhbGwgZmlsdGVyIGZpZWxkcyBmcm9tIGN1cnJlbnQgbGF5b3V0IHRvIG5ldyBsYXlvdXRcblx0XHRhRmlsdGVyRmllbGRzLmZvckVhY2goKG9GaWx0ZXJGaWVsZDogYW55LCBpSW5kZXg6IGFueSkgPT4ge1xuXHRcdFx0b0N1cnJlbnRGaWx0ZXJCYXJMYXlvdXQucmVtb3ZlRmlsdGVyRmllbGQob0ZpbHRlckZpZWxkKTtcblx0XHRcdHRoaXMuX29GaWx0ZXJCYXJMYXlvdXQuaW5zZXJ0RmlsdGVyRmllbGQob0ZpbHRlckZpZWxkLCBpSW5kZXgpO1xuXHRcdH0pO1xuXHRcdC8vIGluc2VydCBhbGwgYnV0dG9ucyBmcm9tIHRoZSBjdXJyZW50IGxheW91dCB0byB0aGUgbmV3IGxheW91dFxuXHRcdGFCdXR0b25zLmZvckVhY2goKG9CdXR0b246IGFueSkgPT4ge1xuXHRcdFx0b0N1cnJlbnRGaWx0ZXJCYXJMYXlvdXQucmVtb3ZlQnV0dG9uKG9CdXR0b24pO1xuXHRcdFx0dGhpcy5fb0ZpbHRlckJhckxheW91dC5hZGRCdXR0b24ob0J1dHRvbik7XG5cdFx0fSk7XG5cblx0XHQvLyBzZXQgdGhlIGN1cnJlbnQgZmlsdGVyIGJhciBsYXlvdXQgdG8gdGhlIHNlY29uZGFyeSBvbmVcblx0XHR0aGlzLl9vU2Vjb25kYXJ5RmlsdGVyQmFyTGF5b3V0ID0gb0N1cnJlbnRGaWx0ZXJCYXJMYXlvdXQ7XG5cblx0XHQvLyB1cGRhdGUgdGhlIGxheW91dCBhZ2dyZWdhdGlvbiBvZiB0aGUgZmlsdGVyIGJhciBhbmQgcmVyZW5kZXIgdGhlIHNhbWUuXG5cdFx0dGhpcy5zZXRBZ2dyZWdhdGlvbihcImxheW91dFwiLCB0aGlzLl9vRmlsdGVyQmFyTGF5b3V0LCB0cnVlKTtcblx0XHR0aGlzLl9vRmlsdGVyQmFyTGF5b3V0LnJlcmVuZGVyKCk7XG5cdH1cblxuXHRnZXRTb3J0ZWRGaWx0ZXJGaWVsZHMoYUZpbHRlckl0ZW1zOiBhbnksIGFGaWx0ZXJGaWVsZHM6IGFueSkge1xuXHRcdGNvbnN0IGFGaWx0ZXJJZHM6IGFueVtdID0gW107XG5cdFx0YUZpbHRlckl0ZW1zLmZvckVhY2goZnVuY3Rpb24gKG9GaWx0ZXJJdGVtOiBhbnkpIHtcblx0XHRcdGFGaWx0ZXJJZHMucHVzaChvRmlsdGVySXRlbS5nZXRJZCgpKTtcblx0XHR9KTtcblx0XHRhRmlsdGVyRmllbGRzLnNvcnQoZnVuY3Rpb24gKGFGaXJzdEl0ZW06IGFueSwgYVNlY29uZEl0ZW06IGFueSkge1xuXHRcdFx0bGV0IHNGaXJzdEl0ZW1WRklkLCBzU2Vjb25kSXRlbVZGSWQ7XG5cdFx0XHRhRmlyc3RJdGVtLmdldENvbnRlbnQoKS5mb3JFYWNoKGZ1bmN0aW9uIChvSW5uZXJDb250cm9sOiBhbnkpIHtcblx0XHRcdFx0aWYgKG9Jbm5lckNvbnRyb2wuaXNBKFwic2FwLnVpLm1kYy5GaWx0ZXJGaWVsZFwiKSkge1xuXHRcdFx0XHRcdHNGaXJzdEl0ZW1WRklkID0gb0lubmVyQ29udHJvbC5nZXRJZCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdGFTZWNvbmRJdGVtLmdldENvbnRlbnQoKS5mb3JFYWNoKGZ1bmN0aW9uIChvSW5uZXJDb250cm9sOiBhbnkpIHtcblx0XHRcdFx0aWYgKG9Jbm5lckNvbnRyb2wuaXNBKFwic2FwLnVpLm1kYy5GaWx0ZXJGaWVsZFwiKSkge1xuXHRcdFx0XHRcdHNTZWNvbmRJdGVtVkZJZCA9IG9Jbm5lckNvbnRyb2wuZ2V0SWQoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gYUZpbHRlcklkcy5pbmRleE9mKHNGaXJzdEl0ZW1WRklkKSAtIGFGaWx0ZXJJZHMuaW5kZXhPZihzU2Vjb25kSXRlbVZGSWQpO1xuXHRcdH0pO1xuXHRcdHJldHVybiBhRmlsdGVyRmllbGRzO1xuXHR9XG5cblx0X2NyZWF0ZUlubmVyTGF5b3V0KCkge1xuXHRcdHRoaXMuX29GaWx0ZXJCYXJMYXlvdXQgPSBuZXcgRmlsdGVyQ29udGFpbmVyKCk7XG5cdFx0dGhpcy5fY0xheW91dEl0ZW0gPSBGaWx0ZXJJdGVtTGF5b3V0O1xuXHRcdHRoaXMuX29GaWx0ZXJCYXJMYXlvdXQuZ2V0SW5uZXIoKS5hZGRTdHlsZUNsYXNzKFwic2FwVWlNZGNGaWx0ZXJCYXJCYXNlQUZMYXlvdXRcIik7XG5cdFx0dGhpcy5fYWRkQnV0dG9ucygpO1xuXG5cdFx0Ly8gVE9ETzogQ2hlY2sgd2l0aCBNREMgaWYgdGhlcmUgaXMgYSBiZXR0ZXIgd2F5IHRvIGxvYWQgdmlzdWFsIGZpbHRlciBvbiB0aGUgYmFzaXMgb2YgY29udHJvbCBwcm9wZXJ0eVxuXHRcdC8vIF9jcmVhdGVJbm5lckxheW91dCBpcyBjYWxsZWQgb24gSW5pdCBieSB0aGUgZmlsdGVyIGJhciBiYXNlLlxuXHRcdC8vIFRoaXMgbWVhbiB0aGF0IHdlIGRvIG5vdCBoYXZlIGFjY2VzcyB0byB0aGUgY29udHJvbCBwcm9wZXJ0aWVzIHlldFxuXHRcdC8vIGFuZCBoZW5jZSB3ZSBjYW5ub3QgZGVjaWRlIG9uIHRoZSBiYXNpcyBvZiBjb250cm9sIHByb3BlcnRpZXMgd2hldGhlciBpbml0aWFsIGxheW91dCBzaG91bGQgYmUgY29tcGFjdCBvciB2aXN1YWxcblx0XHQvLyBBcyBhIHJlc3VsdCB3ZSBoYXZlIHRvIGRvIHRoaXMgd29ya2Fyb3VuZCB0byBhbHdheXMgbG9hZCB0aGUgY29tcGFjdCBsYXlvdXQgYnkgZGVmYXVsdFxuXHRcdC8vIEFuZCB0b29nbGUgdGhlIHNhbWUgaW4gY2FzZSB0aGUgaW5pdGlhbExheW91dCB3YXMgc3VwcG9zZWQgdG8gYmUgdmlzdWFsIGZpbHRlcnMuXG5cdFx0Y29uc3Qgb0lubmVyTGF5b3V0ID0gdGhpcy5fb0ZpbHRlckJhckxheW91dC5nZXRJbm5lcigpO1xuXHRcdGNvbnN0IG9GaWx0ZXJDb250YWluZXJJbm5lckxheW91dEV2ZW50RGVsZWdhdGUgPSB7XG5cdFx0XHRvbkJlZm9yZVJlbmRlcmluZzogKCkgPT4ge1xuXHRcdFx0XHRpZiAodGhpcy5pbml0aWFsTGF5b3V0ID09PSBcInZpc3VhbFwiKSB7XG5cdFx0XHRcdFx0dGhpcy5fdG9nZ2xlTGF5b3V0KCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0b0lubmVyTGF5b3V0LnJlbW92ZUV2ZW50RGVsZWdhdGUob0ZpbHRlckNvbnRhaW5lcklubmVyTGF5b3V0RXZlbnREZWxlZ2F0ZSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRvSW5uZXJMYXlvdXQuYWRkRXZlbnREZWxlZ2F0ZShvRmlsdGVyQ29udGFpbmVySW5uZXJMYXlvdXRFdmVudERlbGVnYXRlKTtcblxuXHRcdHRoaXMuc2V0QWdncmVnYXRpb24oXCJsYXlvdXRcIiwgdGhpcy5fb0ZpbHRlckJhckxheW91dCwgdHJ1ZSk7XG5cdH1cblxuXHRleGl0KCkge1xuXHRcdHN1cGVyLmV4aXQoKTtcblx0XHQvLyBTb21ldGltZXMgdXBvbiBleHRlcm5hbCBuYXZpZ2F0aW9uIHRoaXMuX1NlZ21lbnRlZEJ1dHRvbiBpcyBhbHJlYWR5IGRlc3Ryb3llZFxuXHRcdC8vIHNvIGNoZWNrIGlmIGl0IGV4aXN0cyBhbmQgdGhlbiBvbmx5IHJlbW92ZSBzdHVmZlxuXHRcdGlmICh0aGlzLl9vU2VnbWVudGVkQnV0dG9uKSB7XG5cdFx0XHR0aGlzLl9vU2VnbWVudGVkQnV0dG9uLmRldGFjaEV2ZW50KFwic2VsZWN0XCIsIHRoaXMuX3RvZ2dsZUxheW91dCk7XG5cdFx0XHRkZWxldGUgdGhpcy5fb1NlZ21lbnRlZEJ1dHRvbjtcblx0XHR9XG5cdH1cblxuXHRnZXRTZWdtZW50ZWRCdXR0b24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuX29TZWdtZW50ZWRCdXR0b247XG5cdH1cbn1cbmludGVyZmFjZSBGaWx0ZXJCYXIge1xuXHRfYWRkQnV0dG9ucygpOiBhbnk7XG59XG5leHBvcnQgZGVmYXVsdCBGaWx0ZXJCYXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7O01BUU1BLFNBQVMsV0FEZEMsY0FBYyxDQUFDLGdDQUFnQyxDQUFDLFVBRS9DQyxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFFBQVE7SUFBRUMsWUFBWSxFQUFFO0VBQVUsQ0FBQyxDQUFDLFVBTXJEQyxXQUFXLENBQUM7SUFDWkYsSUFBSSxFQUFFLHVCQUF1QjtJQUM3QkcsUUFBUSxFQUFFO0VBQ1gsQ0FBQyxDQUFDO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7SUFBQTtJQUFBO0lBQUEsT0FXRkMsZ0JBQWdCLEdBQWhCLDBCQUFpQkMsT0FBaUMsRUFBRTtNQUNuRCxJQUFJLE9BQU9BLE9BQU8sS0FBSyxRQUFRLEVBQUU7UUFDaEMsSUFBSSxDQUFDQyxpQkFBaUIsR0FBR0MsSUFBSSxDQUFDQyxJQUFJLENBQUNILE9BQU8sQ0FBb0I7TUFDL0QsQ0FBQyxNQUFNO1FBQ04sSUFBSSxDQUFDQyxpQkFBaUIsR0FBR0QsT0FBTztNQUNqQztNQUVBLElBQUksSUFBSSxDQUFDSSxhQUFhLElBQUksSUFBSSxDQUFDSCxpQkFBaUIsRUFBRTtRQUNqRCxJQUFJLENBQUNBLGlCQUFpQixDQUFDSSxXQUFXLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQ0MsYUFBYSxDQUFDQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7TUFDNUU7TUFDQSxJQUFJLElBQUksQ0FBQ04saUJBQWlCLEVBQUU7UUFDM0IsSUFBSSxDQUFDQSxpQkFBaUIsQ0FBQ08sV0FBVyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUNGLGFBQWEsQ0FBQ0MsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO01BQzVFO01BQ0EsSUFBSSxDQUFDRSxjQUFjLENBQUMsZUFBZSxFQUFFVCxPQUFPLEVBQUUsSUFBSSxDQUFDO0lBQ3BELENBQUM7SUFBQSxPQUVETSxhQUFhLEdBQWIseUJBQWdCO01BQ2Y7TUFDQTtNQUNBLElBQUksQ0FBQyxJQUFJLENBQUNJLDBCQUEwQixFQUFFO1FBQ3JDLElBQUksQ0FBQ0EsMEJBQTBCLEdBQUcsSUFBSUMscUJBQXFCLEVBQUU7TUFDOUQ7O01BRUE7TUFDQSxJQUFJLElBQUksQ0FBQ0QsMEJBQTBCLENBQUNFLEdBQUcsQ0FBQyxzREFBc0QsQ0FBQyxFQUFFO1FBQ2hHLElBQUksQ0FBQ0MseUJBQXlCLENBQUMsS0FBSyxDQUFDO01BQ3RDLENBQUMsTUFBTTtRQUNOLElBQUksQ0FBQ0EseUJBQXlCLENBQUMsSUFBSSxDQUFDO01BQ3JDOztNQUVBO01BQ0EsTUFBTUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDQyxpQkFBaUI7TUFDdEQsTUFBTUMsWUFBWSxHQUFHLElBQUksQ0FBQ0MsY0FBYyxFQUFFO01BQzFDLE1BQU1DLGFBQWEsR0FBR0osdUJBQXVCLENBQUNLLGtCQUFrQixFQUFFO01BQ2xFLE1BQU1DLG1CQUFtQixHQUFHLElBQUksQ0FBQ0MscUJBQXFCLENBQUNMLFlBQVksRUFBRUUsYUFBYSxDQUFDO01BQ25GLE1BQU1JLFFBQVEsR0FBR1IsdUJBQXVCLENBQUNTLGFBQWEsRUFBRTtNQUN4RCxNQUFNQyxtQkFBbUIsR0FBR1YsdUJBQXVCLENBQUNXLHdCQUF3QixJQUFJWCx1QkFBdUIsQ0FBQ1csd0JBQXdCLEVBQUU7TUFDbEksSUFBSSxJQUFJLENBQUNmLDBCQUEwQixDQUFDRSxHQUFHLENBQUMsc0RBQXNELENBQUMsRUFBRTtRQUNoRyxJQUFJLENBQUNGLDBCQUEwQixDQUFDZ0Isa0JBQWtCLENBQUNOLG1CQUFtQixFQUFFSSxtQkFBbUIsQ0FBQztNQUM3RjtNQUNBO01BQ0EsSUFBSSxDQUFDVCxpQkFBaUIsR0FBRyxJQUFJLENBQUNMLDBCQUEwQjs7TUFFeEQ7TUFDQVEsYUFBYSxDQUFDUyxPQUFPLENBQUMsQ0FBQ0MsWUFBaUIsRUFBRUMsTUFBVyxLQUFLO1FBQ3pEZix1QkFBdUIsQ0FBQ2dCLGlCQUFpQixDQUFDRixZQUFZLENBQUM7UUFDdkQsSUFBSSxDQUFDYixpQkFBaUIsQ0FBQ2dCLGlCQUFpQixDQUFDSCxZQUFZLEVBQUVDLE1BQU0sQ0FBQztNQUMvRCxDQUFDLENBQUM7TUFDRjtNQUNBUCxRQUFRLENBQUNLLE9BQU8sQ0FBRUssT0FBWSxJQUFLO1FBQ2xDbEIsdUJBQXVCLENBQUNtQixZQUFZLENBQUNELE9BQU8sQ0FBQztRQUM3QyxJQUFJLENBQUNqQixpQkFBaUIsQ0FBQ21CLFNBQVMsQ0FBQ0YsT0FBTyxDQUFDO01BQzFDLENBQUMsQ0FBQzs7TUFFRjtNQUNBLElBQUksQ0FBQ3RCLDBCQUEwQixHQUFHSSx1QkFBdUI7O01BRXpEO01BQ0EsSUFBSSxDQUFDcUIsY0FBYyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUNwQixpQkFBaUIsRUFBRSxJQUFJLENBQUM7TUFDM0QsSUFBSSxDQUFDQSxpQkFBaUIsQ0FBQ3FCLFFBQVEsRUFBRTtJQUNsQyxDQUFDO0lBQUEsT0FFRGYscUJBQXFCLEdBQXJCLCtCQUFzQmdCLFlBQWlCLEVBQUVuQixhQUFrQixFQUFFO01BQzVELE1BQU1vQixVQUFpQixHQUFHLEVBQUU7TUFDNUJELFlBQVksQ0FBQ1YsT0FBTyxDQUFDLFVBQVVZLFdBQWdCLEVBQUU7UUFDaERELFVBQVUsQ0FBQ0UsSUFBSSxDQUFDRCxXQUFXLENBQUNFLEtBQUssRUFBRSxDQUFDO01BQ3JDLENBQUMsQ0FBQztNQUNGdkIsYUFBYSxDQUFDd0IsSUFBSSxDQUFDLFVBQVVDLFVBQWUsRUFBRUMsV0FBZ0IsRUFBRTtRQUMvRCxJQUFJQyxjQUFjLEVBQUVDLGVBQWU7UUFDbkNILFVBQVUsQ0FBQ0ksVUFBVSxFQUFFLENBQUNwQixPQUFPLENBQUMsVUFBVXFCLGFBQWtCLEVBQUU7VUFDN0QsSUFBSUEsYUFBYSxDQUFDcEMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLEVBQUU7WUFDaERpQyxjQUFjLEdBQUdHLGFBQWEsQ0FBQ1AsS0FBSyxFQUFFO1VBQ3ZDO1FBQ0QsQ0FBQyxDQUFDO1FBQ0ZHLFdBQVcsQ0FBQ0csVUFBVSxFQUFFLENBQUNwQixPQUFPLENBQUMsVUFBVXFCLGFBQWtCLEVBQUU7VUFDOUQsSUFBSUEsYUFBYSxDQUFDcEMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLEVBQUU7WUFDaERrQyxlQUFlLEdBQUdFLGFBQWEsQ0FBQ1AsS0FBSyxFQUFFO1VBQ3hDO1FBQ0QsQ0FBQyxDQUFDO1FBQ0YsT0FBT0gsVUFBVSxDQUFDVyxPQUFPLENBQUNKLGNBQWMsQ0FBQyxHQUFHUCxVQUFVLENBQUNXLE9BQU8sQ0FBQ0gsZUFBZSxDQUFDO01BQ2hGLENBQUMsQ0FBQztNQUNGLE9BQU81QixhQUFhO0lBQ3JCLENBQUM7SUFBQSxPQUVEZ0Msa0JBQWtCLEdBQWxCLDhCQUFxQjtNQUNwQixJQUFJLENBQUNuQyxpQkFBaUIsR0FBRyxJQUFJb0MsZUFBZSxFQUFFO01BQzlDLElBQUksQ0FBQ0MsWUFBWSxHQUFHQyxnQkFBZ0I7TUFDcEMsSUFBSSxDQUFDdEMsaUJBQWlCLENBQUN1QyxRQUFRLEVBQUUsQ0FBQ0MsYUFBYSxDQUFDLCtCQUErQixDQUFDO01BQ2hGLElBQUksQ0FBQ0MsV0FBVyxFQUFFOztNQUVsQjtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQSxNQUFNQyxZQUFZLEdBQUcsSUFBSSxDQUFDMUMsaUJBQWlCLENBQUN1QyxRQUFRLEVBQUU7TUFDdEQsTUFBTUksd0NBQXdDLEdBQUc7UUFDaERDLGlCQUFpQixFQUFFLE1BQU07VUFDeEIsSUFBSSxJQUFJLENBQUNDLGFBQWEsS0FBSyxRQUFRLEVBQUU7WUFDcEMsSUFBSSxDQUFDdEQsYUFBYSxFQUFFO1VBQ3JCO1VBQ0FtRCxZQUFZLENBQUNJLG1CQUFtQixDQUFDSCx3Q0FBd0MsQ0FBQztRQUMzRTtNQUNELENBQUM7TUFDREQsWUFBWSxDQUFDSyxnQkFBZ0IsQ0FBQ0osd0NBQXdDLENBQUM7TUFFdkUsSUFBSSxDQUFDdkIsY0FBYyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUNwQixpQkFBaUIsRUFBRSxJQUFJLENBQUM7SUFDNUQsQ0FBQztJQUFBLE9BRURnRCxJQUFJLEdBQUosZ0JBQU87TUFDTix3QkFBTUEsSUFBSTtNQUNWO01BQ0E7TUFDQSxJQUFJLElBQUksQ0FBQzlELGlCQUFpQixFQUFFO1FBQzNCLElBQUksQ0FBQ0EsaUJBQWlCLENBQUNJLFdBQVcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDQyxhQUFhLENBQUM7UUFDaEUsT0FBTyxJQUFJLENBQUNMLGlCQUFpQjtNQUM5QjtJQUNELENBQUM7SUFBQSxPQUVEK0Qsa0JBQWtCLEdBQWxCLDhCQUFxQjtNQUNwQixPQUFPLElBQUksQ0FBQy9ELGlCQUFpQjtJQUM5QixDQUFDO0lBQUE7RUFBQSxFQS9Jc0JnRSxZQUFZO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7RUFBQSxPQW9KckJ6RSxTQUFTO0FBQUEifQ==