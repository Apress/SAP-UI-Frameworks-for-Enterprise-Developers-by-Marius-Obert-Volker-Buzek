/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/m/SearchField", "sap/ui/core/Control"], function (ClassSupport, SearchField, Control) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;
  var implementInterface = ClassSupport.implementInterface;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let BasicSearch = (_dec = defineUI5Class("sap.fe.macros.table.BasicSearch"), _dec2 = implementInterface("sap.ui.mdc.IFilter"), _dec3 = event( /*{ conditionsBased: {
                                                                                                                                                type: "boolean"
                                                                                                                                                }}*/), _dec4 = event( /*{
                                                                                                                                                                      conditions: {
                                                                                                                                                                      type: "object"
                                                                                                                                                                      }
                                                                                                                                                                      }*/), _dec5 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_Control) {
    _inheritsLoose(BasicSearch, _Control);
    function BasicSearch() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _Control.call(this, ...args) || this;
      _initializerDefineProperty(_this, "__implements__sap_ui_mdc_IFilter", _descriptor, _assertThisInitialized(_this));
      _this.__implements__sap_ui_mdc_IFilterSource = true;
      _initializerDefineProperty(_this, "filterChanged", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "search", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filter", _descriptor4, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = BasicSearch.prototype;
    _proto.init = function init() {
      this.setAggregation("filter", new SearchField({
        placeholder: "{sap.fe.i18n>M_FILTERBAR_SEARCH}",
        search: () => {
          this.fireEvent("search");
        }
      }));
    };
    _proto.getConditions = function getConditions() {
      return undefined;
    };
    _proto.getSearch = function getSearch() {
      return this.filter.getValue();
    };
    _proto.validate = function validate() {
      return Promise.resolve();
    };
    BasicSearch.render = function render(oRm, oControl) {
      oRm.openStart("div", oControl);
      oRm.openEnd();
      oRm.renderControl(oControl.filter);
      oRm.close("div");
    };
    return BasicSearch;
  }(Control), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "__implements__sap_ui_mdc_IFilter", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "filterChanged", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "search", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "filter", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return BasicSearch;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCYXNpY1NlYXJjaCIsImRlZmluZVVJNUNsYXNzIiwiaW1wbGVtZW50SW50ZXJmYWNlIiwiZXZlbnQiLCJhZ2dyZWdhdGlvbiIsInR5cGUiLCJtdWx0aXBsZSIsIl9faW1wbGVtZW50c19fc2FwX3VpX21kY19JRmlsdGVyU291cmNlIiwiaW5pdCIsInNldEFnZ3JlZ2F0aW9uIiwiU2VhcmNoRmllbGQiLCJwbGFjZWhvbGRlciIsInNlYXJjaCIsImZpcmVFdmVudCIsImdldENvbmRpdGlvbnMiLCJ1bmRlZmluZWQiLCJnZXRTZWFyY2giLCJmaWx0ZXIiLCJnZXRWYWx1ZSIsInZhbGlkYXRlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZW5kZXIiLCJvUm0iLCJvQ29udHJvbCIsIm9wZW5TdGFydCIsIm9wZW5FbmQiLCJyZW5kZXJDb250cm9sIiwiY2xvc2UiLCJDb250cm9sIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJCYXNpY1NlYXJjaC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhZ2dyZWdhdGlvbiwgZGVmaW5lVUk1Q2xhc3MsIGV2ZW50LCBpbXBsZW1lbnRJbnRlcmZhY2UgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBTZWFyY2hGaWVsZCBmcm9tIFwic2FwL20vU2VhcmNoRmllbGRcIjtcbmltcG9ydCBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgdHlwZSBSZW5kZXJNYW5hZ2VyIGZyb20gXCJzYXAvdWkvY29yZS9SZW5kZXJNYW5hZ2VyXCI7XG5pbXBvcnQgdHlwZSB7IElGaWx0ZXIgfSBmcm9tIFwic2FwL3VpL21kYy9saWJyYXJ5XCI7XG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUubWFjcm9zLnRhYmxlLkJhc2ljU2VhcmNoXCIpXG5jbGFzcyBCYXNpY1NlYXJjaCBleHRlbmRzIENvbnRyb2wgaW1wbGVtZW50cyBJRmlsdGVyIHtcblx0QGltcGxlbWVudEludGVyZmFjZShcInNhcC51aS5tZGMuSUZpbHRlclwiKVxuXHRfX2ltcGxlbWVudHNfX3NhcF91aV9tZGNfSUZpbHRlcjogYm9vbGVhbiA9IHRydWU7XG5cblx0X19pbXBsZW1lbnRzX19zYXBfdWlfbWRjX0lGaWx0ZXJTb3VyY2U6IGJvb2xlYW4gPSB0cnVlO1xuXG5cdC8qKlxuXHQgKiBUaGUgJ2ZpbHRlckNoYW5nZWQnIGNhbiBiZSBvcHRpb25hbGx5IGltcGxlbWVudGVkIHRvIGRpc3BsYXkgYW4gb3ZlcmxheVxuXHQgKiB3aGVuIHRoZSBmaWx0ZXIgdmFsdWUgb2YgdGhlIElGaWx0ZXIgY2hhbmdlc1xuXHQgKi9cblx0QGV2ZW50KC8qeyBjb25kaXRpb25zQmFzZWQ6IHtcblx0XHQgXHR0eXBlOiBcImJvb2xlYW5cIlxuXHRcdCB9fSovKVxuXHRmaWx0ZXJDaGFuZ2VkITogRnVuY3Rpb247XG5cblx0LyoqXG5cdCAqIFRoZSAnc2VhcmNoJyBldmVudCBpcyBhIG1hbmRhdG9yeSBJRmlsdGVyIGV2ZW50IHRvIHRyaWdnZXIgYSBzZWFyY2ggcXVlcnlcblx0ICogb24gdGhlIGNvbnN1bWluZyBjb250cm9sXG5cdCAqL1xuXHRAZXZlbnQoLyp7XG5cdFx0XHRcdGNvbmRpdGlvbnM6IHtcblx0XHRcdFx0XHR0eXBlOiBcIm9iamVjdFwiXG5cdFx0XHRcdH1cblx0XHRcdH0qLylcblx0c2VhcmNoITogRnVuY3Rpb247XG5cblx0QGFnZ3JlZ2F0aW9uKHtcblx0XHR0eXBlOiBcInNhcC51aS5jb3JlLkNvbnRyb2xcIixcblx0XHRtdWx0aXBsZTogZmFsc2Vcblx0fSlcblx0ZmlsdGVyITogU2VhcmNoRmllbGQ7XG5cblx0aW5pdCgpIHtcblx0XHR0aGlzLnNldEFnZ3JlZ2F0aW9uKFxuXHRcdFx0XCJmaWx0ZXJcIixcblx0XHRcdG5ldyBTZWFyY2hGaWVsZCh7XG5cdFx0XHRcdHBsYWNlaG9sZGVyOiBcIntzYXAuZmUuaTE4bj5NX0ZJTFRFUkJBUl9TRUFSQ0h9XCIsXG5cdFx0XHRcdHNlYXJjaDogKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuZmlyZUV2ZW50KFwic2VhcmNoXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdCk7XG5cdH1cblxuXHRnZXRDb25kaXRpb25zKCkge1xuXHRcdHJldHVybiB1bmRlZmluZWQgYXMgYW55O1xuXHR9XG5cblx0Z2V0U2VhcmNoKCkge1xuXHRcdHJldHVybiB0aGlzLmZpbHRlci5nZXRWYWx1ZSgpO1xuXHR9XG5cblx0dmFsaWRhdGUoKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9XG5cblx0c3RhdGljIHJlbmRlcihvUm06IFJlbmRlck1hbmFnZXIsIG9Db250cm9sOiBCYXNpY1NlYXJjaCkge1xuXHRcdG9SbS5vcGVuU3RhcnQoXCJkaXZcIiwgb0NvbnRyb2wpO1xuXHRcdG9SbS5vcGVuRW5kKCk7XG5cdFx0b1JtLnJlbmRlckNvbnRyb2wob0NvbnRyb2wuZmlsdGVyKTtcblx0XHRvUm0uY2xvc2UoXCJkaXZcIik7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmFzaWNTZWFyY2g7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7OztNQU1NQSxXQUFXLFdBRGhCQyxjQUFjLENBQUMsaUNBQWlDLENBQUMsVUFFaERDLGtCQUFrQixDQUFDLG9CQUFvQixDQUFDLFVBU3hDQyxLQUFLLEVBQUM7QUFDUjtBQUNBLG9KQUZRLENBRUEsVUFPTkEsS0FBSyxFQUFDO0FBQ1I7QUFDQTtBQUNBO0FBQ0EseUtBSlEsQ0FJRCxVQUdMQyxXQUFXLENBQUM7SUFDWkMsSUFBSSxFQUFFLHFCQUFxQjtJQUMzQkMsUUFBUSxFQUFFO0VBQ1gsQ0FBQyxDQUFDO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBLE1BekJGQyxzQ0FBc0MsR0FBWSxJQUFJO01BQUE7TUFBQTtNQUFBO01BQUE7SUFBQTtJQUFBO0lBQUEsT0E0QnREQyxJQUFJLEdBQUosZ0JBQU87TUFDTixJQUFJLENBQUNDLGNBQWMsQ0FDbEIsUUFBUSxFQUNSLElBQUlDLFdBQVcsQ0FBQztRQUNmQyxXQUFXLEVBQUUsa0NBQWtDO1FBQy9DQyxNQUFNLEVBQUUsTUFBTTtVQUNiLElBQUksQ0FBQ0MsU0FBUyxDQUFDLFFBQVEsQ0FBQztRQUN6QjtNQUNELENBQUMsQ0FBQyxDQUNGO0lBQ0YsQ0FBQztJQUFBLE9BRURDLGFBQWEsR0FBYix5QkFBZ0I7TUFDZixPQUFPQyxTQUFTO0lBQ2pCLENBQUM7SUFBQSxPQUVEQyxTQUFTLEdBQVQscUJBQVk7TUFDWCxPQUFPLElBQUksQ0FBQ0MsTUFBTSxDQUFDQyxRQUFRLEVBQUU7SUFDOUIsQ0FBQztJQUFBLE9BRURDLFFBQVEsR0FBUixvQkFBVztNQUNWLE9BQU9DLE9BQU8sQ0FBQ0MsT0FBTyxFQUFFO0lBQ3pCLENBQUM7SUFBQSxZQUVNQyxNQUFNLEdBQWIsZ0JBQWNDLEdBQWtCLEVBQUVDLFFBQXFCLEVBQUU7TUFDeERELEdBQUcsQ0FBQ0UsU0FBUyxDQUFDLEtBQUssRUFBRUQsUUFBUSxDQUFDO01BQzlCRCxHQUFHLENBQUNHLE9BQU8sRUFBRTtNQUNiSCxHQUFHLENBQUNJLGFBQWEsQ0FBQ0gsUUFBUSxDQUFDUCxNQUFNLENBQUM7TUFDbENNLEdBQUcsQ0FBQ0ssS0FBSyxDQUFDLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQUE7RUFBQSxFQTdEd0JDLE9BQU87SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BRVksSUFBSTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7RUFBQSxPQThEbEM3QixXQUFXO0FBQUEifQ==