/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/ui/mdc/filterbar/aligned/FilterContainer"], function (ClassSupport, MdcFilterContainer) {
  "use strict";

  var _dec, _class;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  /**
   * Constructor for a new FE filter container.
   *
   * @extends sap.ui.mdc.filterbar.aligned.FilterContainer
   * @class
   * @private
   * @alias sap.fe.core.controls.filterbar.FilterContainer
   */
  let FilterContainer = (_dec = defineUI5Class("sap.fe.core.controls.filterbar.FilterContainer"), _dec(_class = /*#__PURE__*/function (_MdcFilterContainer) {
    _inheritsLoose(FilterContainer, _MdcFilterContainer);
    function FilterContainer() {
      return _MdcFilterContainer.apply(this, arguments) || this;
    }
    var _proto = FilterContainer.prototype;
    _proto.init = function init() {
      this.aAllFilterFields = [];
      this.aAllVisualFilters = {};
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _MdcFilterContainer.prototype.init.call(this, ...args);
    };
    _proto.exit = function exit() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      // destroy layout
      _MdcFilterContainer.prototype.exit.call(this, ...args);
      // destroy all filter fields which are not in the layout
      this.aAllFilterFields.forEach(function (oFilterField) {
        oFilterField.destroy();
      });
      Object.keys(this.aAllVisualFilters).forEach(sKey => {
        this.aAllVisualFilters[sKey].destroy();
      });
    };
    _proto.insertFilterField = function insertFilterField(oControl, iIndex) {
      const oFilterItemLayoutEventDelegate = {
        onBeforeRendering: function () {
          // For compact filters the item layout needs to render both label and filter field.
          // hence use the original getContent of the FilterItemLayout
          if (oControl._fnGetContentCopy) {
            oControl.getContent = oControl._fnGetContentCopy;
          }
          oControl.removeEventDelegate(oFilterItemLayoutEventDelegate);
        }
      };
      oControl.addEventDelegate(oFilterItemLayoutEventDelegate);

      // In this layout there is no need to render visual filter
      // hence find the filter field from the layout and remove it's content aggregation
      oControl.getContent().forEach(oInnerControl => {
        const oContent = oInnerControl.getContent && oInnerControl.getContent();
        if (oInnerControl.isA("sap.ui.mdc.FilterField") && oContent && oContent.isA("sap.fe.core.controls.filterbar.VisualFilter")) {
          // store the visual filter for later use.
          const oVFId = oInnerControl.getId();
          this.aAllVisualFilters[oVFId] = oContent;
          // remove the content aggregation to render internal content of the field
          oInnerControl.setContent(null);
        }
      });

      // store filter fields to refer to when switching between layout
      this.aAllFilterFields.push(oControl);
      _MdcFilterContainer.prototype.insertFilterField.call(this, oControl, iIndex);
    };
    _proto.removeFilterField = function removeFilterField(oControl) {
      const oFilterFieldIndex = this.aAllFilterFields.findIndex(function (oFilterField) {
        return oFilterField.getId() === oControl.getId();
      });

      // Setting VF content for Fillterfield before removing
      oControl.getContent().forEach(oInnerControl => {
        if (oInnerControl.isA("sap.ui.mdc.FilterField") && !oInnerControl.getContent()) {
          const oVFId = oInnerControl.getId();
          if (this.aAllVisualFilters[oVFId]) {
            oInnerControl.setContent(this.aAllVisualFilters[oVFId]);
          }
        }
      });
      this.aAllFilterFields.splice(oFilterFieldIndex, 1);
      _MdcFilterContainer.prototype.removeFilterField.call(this, oControl);
    };
    _proto.removeAllFilterFields = function removeAllFilterFields() {
      this.aAllFilterFields = [];
      this.aAllVisualFilters = {};
      this.oLayout.removeAllContent();
    };
    _proto.getAllButtons = function getAllButtons() {
      return this.oLayout.getEndContent();
    };
    _proto.removeButton = function removeButton(oControl) {
      this.oLayout.removeEndContent(oControl);
    };
    _proto.getAllFilterFields = function getAllFilterFields() {
      return this.aAllFilterFields.slice();
    };
    _proto.getAllVisualFilterFields = function getAllVisualFilterFields() {
      return this.aAllVisualFilters;
    };
    _proto.setAllFilterFields = function setAllFilterFields(aFilterFields) {
      this.aAllFilterFields = aFilterFields;
    };
    return FilterContainer;
  }(MdcFilterContainer)) || _class);
  return FilterContainer;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaWx0ZXJDb250YWluZXIiLCJkZWZpbmVVSTVDbGFzcyIsImluaXQiLCJhQWxsRmlsdGVyRmllbGRzIiwiYUFsbFZpc3VhbEZpbHRlcnMiLCJhcmdzIiwiZXhpdCIsImZvckVhY2giLCJvRmlsdGVyRmllbGQiLCJkZXN0cm95IiwiT2JqZWN0Iiwia2V5cyIsInNLZXkiLCJpbnNlcnRGaWx0ZXJGaWVsZCIsIm9Db250cm9sIiwiaUluZGV4Iiwib0ZpbHRlckl0ZW1MYXlvdXRFdmVudERlbGVnYXRlIiwib25CZWZvcmVSZW5kZXJpbmciLCJfZm5HZXRDb250ZW50Q29weSIsImdldENvbnRlbnQiLCJyZW1vdmVFdmVudERlbGVnYXRlIiwiYWRkRXZlbnREZWxlZ2F0ZSIsIm9Jbm5lckNvbnRyb2wiLCJvQ29udGVudCIsImlzQSIsIm9WRklkIiwiZ2V0SWQiLCJzZXRDb250ZW50IiwicHVzaCIsInJlbW92ZUZpbHRlckZpZWxkIiwib0ZpbHRlckZpZWxkSW5kZXgiLCJmaW5kSW5kZXgiLCJzcGxpY2UiLCJyZW1vdmVBbGxGaWx0ZXJGaWVsZHMiLCJvTGF5b3V0IiwicmVtb3ZlQWxsQ29udGVudCIsImdldEFsbEJ1dHRvbnMiLCJnZXRFbmRDb250ZW50IiwicmVtb3ZlQnV0dG9uIiwicmVtb3ZlRW5kQ29udGVudCIsImdldEFsbEZpbHRlckZpZWxkcyIsInNsaWNlIiwiZ2V0QWxsVmlzdWFsRmlsdGVyRmllbGRzIiwic2V0QWxsRmlsdGVyRmllbGRzIiwiYUZpbHRlckZpZWxkcyIsIk1kY0ZpbHRlckNvbnRhaW5lciJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmlsdGVyQ29udGFpbmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRlZmluZVVJNUNsYXNzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgTWRjRmlsdGVyQ29udGFpbmVyIGZyb20gXCJzYXAvdWkvbWRjL2ZpbHRlcmJhci9hbGlnbmVkL0ZpbHRlckNvbnRhaW5lclwiO1xuXG4vKipcbiAqIENvbnN0cnVjdG9yIGZvciBhIG5ldyBGRSBmaWx0ZXIgY29udGFpbmVyLlxuICpcbiAqIEBleHRlbmRzIHNhcC51aS5tZGMuZmlsdGVyYmFyLmFsaWduZWQuRmlsdGVyQ29udGFpbmVyXG4gKiBAY2xhc3NcbiAqIEBwcml2YXRlXG4gKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbHMuZmlsdGVyYmFyLkZpbHRlckNvbnRhaW5lclxuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5jb250cm9scy5maWx0ZXJiYXIuRmlsdGVyQ29udGFpbmVyXCIpXG5jbGFzcyBGaWx0ZXJDb250YWluZXIgZXh0ZW5kcyBNZGNGaWx0ZXJDb250YWluZXIge1xuXHRpbml0KC4uLmFyZ3M6IGFueVtdKSB7XG5cdFx0dGhpcy5hQWxsRmlsdGVyRmllbGRzID0gW107XG5cdFx0dGhpcy5hQWxsVmlzdWFsRmlsdGVycyA9IHt9O1xuXHRcdHN1cGVyLmluaXQoLi4uYXJncyk7XG5cdH1cblxuXHRleGl0KC4uLmFyZ3M6IGFueVtdKSB7XG5cdFx0Ly8gZGVzdHJveSBsYXlvdXRcblx0XHRzdXBlci5leGl0KC4uLmFyZ3MpO1xuXHRcdC8vIGRlc3Ryb3kgYWxsIGZpbHRlciBmaWVsZHMgd2hpY2ggYXJlIG5vdCBpbiB0aGUgbGF5b3V0XG5cdFx0dGhpcy5hQWxsRmlsdGVyRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKG9GaWx0ZXJGaWVsZDogYW55KSB7XG5cdFx0XHRvRmlsdGVyRmllbGQuZGVzdHJveSgpO1xuXHRcdH0pO1xuXHRcdE9iamVjdC5rZXlzKHRoaXMuYUFsbFZpc3VhbEZpbHRlcnMpLmZvckVhY2goKHNLZXk6IHN0cmluZykgPT4ge1xuXHRcdFx0dGhpcy5hQWxsVmlzdWFsRmlsdGVyc1tzS2V5XS5kZXN0cm95KCk7XG5cdFx0fSk7XG5cdH1cblxuXHRpbnNlcnRGaWx0ZXJGaWVsZChvQ29udHJvbDogYW55LCBpSW5kZXg6IG51bWJlcikge1xuXHRcdGNvbnN0IG9GaWx0ZXJJdGVtTGF5b3V0RXZlbnREZWxlZ2F0ZSA9IHtcblx0XHRcdG9uQmVmb3JlUmVuZGVyaW5nOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdC8vIEZvciBjb21wYWN0IGZpbHRlcnMgdGhlIGl0ZW0gbGF5b3V0IG5lZWRzIHRvIHJlbmRlciBib3RoIGxhYmVsIGFuZCBmaWx0ZXIgZmllbGQuXG5cdFx0XHRcdC8vIGhlbmNlIHVzZSB0aGUgb3JpZ2luYWwgZ2V0Q29udGVudCBvZiB0aGUgRmlsdGVySXRlbUxheW91dFxuXHRcdFx0XHRpZiAob0NvbnRyb2wuX2ZuR2V0Q29udGVudENvcHkpIHtcblx0XHRcdFx0XHRvQ29udHJvbC5nZXRDb250ZW50ID0gb0NvbnRyb2wuX2ZuR2V0Q29udGVudENvcHk7XG5cdFx0XHRcdH1cblx0XHRcdFx0b0NvbnRyb2wucmVtb3ZlRXZlbnREZWxlZ2F0ZShvRmlsdGVySXRlbUxheW91dEV2ZW50RGVsZWdhdGUpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0b0NvbnRyb2wuYWRkRXZlbnREZWxlZ2F0ZShvRmlsdGVySXRlbUxheW91dEV2ZW50RGVsZWdhdGUpO1xuXG5cdFx0Ly8gSW4gdGhpcyBsYXlvdXQgdGhlcmUgaXMgbm8gbmVlZCB0byByZW5kZXIgdmlzdWFsIGZpbHRlclxuXHRcdC8vIGhlbmNlIGZpbmQgdGhlIGZpbHRlciBmaWVsZCBmcm9tIHRoZSBsYXlvdXQgYW5kIHJlbW92ZSBpdCdzIGNvbnRlbnQgYWdncmVnYXRpb25cblx0XHRvQ29udHJvbC5nZXRDb250ZW50KCkuZm9yRWFjaCgob0lubmVyQ29udHJvbDogYW55KSA9PiB7XG5cdFx0XHRjb25zdCBvQ29udGVudCA9IG9Jbm5lckNvbnRyb2wuZ2V0Q29udGVudCAmJiBvSW5uZXJDb250cm9sLmdldENvbnRlbnQoKTtcblx0XHRcdGlmIChvSW5uZXJDb250cm9sLmlzQShcInNhcC51aS5tZGMuRmlsdGVyRmllbGRcIikgJiYgb0NvbnRlbnQgJiYgb0NvbnRlbnQuaXNBKFwic2FwLmZlLmNvcmUuY29udHJvbHMuZmlsdGVyYmFyLlZpc3VhbEZpbHRlclwiKSkge1xuXHRcdFx0XHQvLyBzdG9yZSB0aGUgdmlzdWFsIGZpbHRlciBmb3IgbGF0ZXIgdXNlLlxuXHRcdFx0XHRjb25zdCBvVkZJZCA9IG9Jbm5lckNvbnRyb2wuZ2V0SWQoKTtcblx0XHRcdFx0dGhpcy5hQWxsVmlzdWFsRmlsdGVyc1tvVkZJZF0gPSBvQ29udGVudDtcblx0XHRcdFx0Ly8gcmVtb3ZlIHRoZSBjb250ZW50IGFnZ3JlZ2F0aW9uIHRvIHJlbmRlciBpbnRlcm5hbCBjb250ZW50IG9mIHRoZSBmaWVsZFxuXHRcdFx0XHRvSW5uZXJDb250cm9sLnNldENvbnRlbnQobnVsbCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvLyBzdG9yZSBmaWx0ZXIgZmllbGRzIHRvIHJlZmVyIHRvIHdoZW4gc3dpdGNoaW5nIGJldHdlZW4gbGF5b3V0XG5cdFx0dGhpcy5hQWxsRmlsdGVyRmllbGRzLnB1c2gob0NvbnRyb2wpO1xuXHRcdHN1cGVyLmluc2VydEZpbHRlckZpZWxkKG9Db250cm9sLCBpSW5kZXgpO1xuXHR9XG5cblx0cmVtb3ZlRmlsdGVyRmllbGQob0NvbnRyb2w6IGFueSkge1xuXHRcdGNvbnN0IG9GaWx0ZXJGaWVsZEluZGV4ID0gdGhpcy5hQWxsRmlsdGVyRmllbGRzLmZpbmRJbmRleChmdW5jdGlvbiAob0ZpbHRlckZpZWxkOiBhbnkpIHtcblx0XHRcdHJldHVybiBvRmlsdGVyRmllbGQuZ2V0SWQoKSA9PT0gb0NvbnRyb2wuZ2V0SWQoKTtcblx0XHR9KTtcblxuXHRcdC8vIFNldHRpbmcgVkYgY29udGVudCBmb3IgRmlsbHRlcmZpZWxkIGJlZm9yZSByZW1vdmluZ1xuXHRcdG9Db250cm9sLmdldENvbnRlbnQoKS5mb3JFYWNoKChvSW5uZXJDb250cm9sOiBhbnkpID0+IHtcblx0XHRcdGlmIChvSW5uZXJDb250cm9sLmlzQShcInNhcC51aS5tZGMuRmlsdGVyRmllbGRcIikgJiYgIW9Jbm5lckNvbnRyb2wuZ2V0Q29udGVudCgpKSB7XG5cdFx0XHRcdGNvbnN0IG9WRklkID0gb0lubmVyQ29udHJvbC5nZXRJZCgpO1xuXHRcdFx0XHRpZiAodGhpcy5hQWxsVmlzdWFsRmlsdGVyc1tvVkZJZF0pIHtcblx0XHRcdFx0XHRvSW5uZXJDb250cm9sLnNldENvbnRlbnQodGhpcy5hQWxsVmlzdWFsRmlsdGVyc1tvVkZJZF0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHR0aGlzLmFBbGxGaWx0ZXJGaWVsZHMuc3BsaWNlKG9GaWx0ZXJGaWVsZEluZGV4LCAxKTtcblxuXHRcdHN1cGVyLnJlbW92ZUZpbHRlckZpZWxkKG9Db250cm9sKTtcblx0fVxuXG5cdHJlbW92ZUFsbEZpbHRlckZpZWxkcygpIHtcblx0XHR0aGlzLmFBbGxGaWx0ZXJGaWVsZHMgPSBbXTtcblx0XHR0aGlzLmFBbGxWaXN1YWxGaWx0ZXJzID0ge307XG5cdFx0dGhpcy5vTGF5b3V0LnJlbW92ZUFsbENvbnRlbnQoKTtcblx0fVxuXG5cdGdldEFsbEJ1dHRvbnMoKSB7XG5cdFx0cmV0dXJuIHRoaXMub0xheW91dC5nZXRFbmRDb250ZW50KCk7XG5cdH1cblxuXHRyZW1vdmVCdXR0b24ob0NvbnRyb2w6IGFueSkge1xuXHRcdHRoaXMub0xheW91dC5yZW1vdmVFbmRDb250ZW50KG9Db250cm9sKTtcblx0fVxuXG5cdGdldEFsbEZpbHRlckZpZWxkcygpIHtcblx0XHRyZXR1cm4gdGhpcy5hQWxsRmlsdGVyRmllbGRzLnNsaWNlKCk7XG5cdH1cblxuXHRnZXRBbGxWaXN1YWxGaWx0ZXJGaWVsZHMoKSB7XG5cdFx0cmV0dXJuIHRoaXMuYUFsbFZpc3VhbEZpbHRlcnM7XG5cdH1cblxuXHRzZXRBbGxGaWx0ZXJGaWVsZHMoYUZpbHRlckZpZWxkczogYW55KSB7XG5cdFx0dGhpcy5hQWxsRmlsdGVyRmllbGRzID0gYUZpbHRlckZpZWxkcztcblx0fVxufVxuZXhwb3J0IGRlZmF1bHQgRmlsdGVyQ29udGFpbmVyO1xu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